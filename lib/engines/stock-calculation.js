/**
 * Stock Calculation Engine
 * 
 * This module provides comprehensive stock calculation functionality including:
 * - Stock balance calculations with running balances
 * - Stock movement tracking and history
 * - Negative stock prevention for OUT transactions
 * - Real-time stock level queries
 * - Stock adjustment calculations
 * 
 * Requirements: 4.2, 4.6, 4.7
 */

import { prisma } from '@/lib/prisma'
import { TransactionType } from '@/lib/validations/transaction'

/**
 * Stock Calculation Engine Class
 * Handles all stock-related calculations and validations
 */
export class StockCalculationEngine {
  
  /**
   * Calculate the quantity change for a given transaction type and quantity
   * @param {string} transactionType - The type of transaction
   * @param {number} quantity - The quantity involved in the transaction
   * @returns {number} The calculated quantity change (positive or negative)
   */
  static calculateQuantityChange(transactionType, quantity) {
    switch (transactionType) {
      case TransactionType.IN:
      case TransactionType.RETURN_IN:
        return Math.abs(quantity) // Always positive for incoming stock
      
      case TransactionType.OUT:
      case TransactionType.RETURN_OUT:
        return -Math.abs(quantity) // Always negative for outgoing stock
      
      case TransactionType.ADJUST:
        return quantity // Can be positive or negative for adjustments
      
      default:
        throw new Error(`Unknown transaction type: ${transactionType}`)
    }
  }

  /**
   * Get the current stock level for a product
   * @param {string} productId - The product ID
   * @param {object} tx - Optional database transaction context
   * @returns {Promise<number>} Current stock level
   */
  static async getCurrentStock(productId, tx = null) {
    const db = tx || prisma
    
    const latestMovement = await db.stockMovement.findFirst({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      select: { quantityAfter: true }
    })
    
    return latestMovement?.quantityAfter || 0
  }

  /**
   * Get current stock levels for multiple products
   * @param {string[]} productIds - Array of product IDs
   * @param {object} tx - Optional database transaction context
   * @returns {Promise<Object>} Map of productId to current stock level
   */
  static async getCurrentStockLevels(productIds, tx = null) {
    const db = tx || prisma
    
    // Get the latest movement for each product
    const movements = await Promise.all(
      productIds.map(async (productId) => {
        const movement = await db.stockMovement.findFirst({
          where: { productId },
          orderBy: { createdAt: 'desc' },
          select: { productId: true, quantityAfter: true }
        })
        
        return {
          productId,
          currentStock: movement?.quantityAfter || 0
        }
      })
    )
    
    // Convert to map for easy lookup
    return movements.reduce((acc, { productId, currentStock }) => {
      acc[productId] = currentStock
      return acc
    }, {})
  }

  /**
   * Validate stock availability for OUT transactions
   * Prevents negative stock levels unless explicitly allowed
   * @param {Array} items - Transaction items to validate
   * @param {string} transactionType - Type of transaction
   * @param {object} tx - Optional database transaction context
   * @param {boolean} allowNegative - Whether to allow negative stock (for adjustments)
   * @returns {Promise<Object>} Validation result with errors if any
   */
  static async validateStockAvailability(items, transactionType, tx = null, allowNegative = false) {
    // Only validate for transactions that reduce stock
    if (![TransactionType.OUT, TransactionType.RETURN_OUT, TransactionType.ADJUST].includes(transactionType)) {
      return { valid: true, errors: [] }
    }

    const errors = []
    const productIds = items.map(item => item.productId)
    const currentStockLevels = await this.getCurrentStockLevels(productIds, tx)

    for (const item of items) {
      const currentStock = currentStockLevels[item.productId] || 0
      const quantityChange = this.calculateQuantityChange(transactionType, item.quantity)
      const newStock = currentStock + quantityChange

      // Check for negative stock
      if (!allowNegative && newStock < 0) {
        errors.push({
          productId: item.productId,
          currentStock,
          requestedQuantity: Math.abs(quantityChange),
          shortfall: Math.abs(newStock),
          message: `Insufficient stock for product ${item.productId}. Available: ${currentStock}, Requested: ${Math.abs(quantityChange)}`
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Calculate stock movements for transaction items
   * @param {Array} items - Transaction items
   * @param {string} transactionType - Type of transaction
   * @param {string} transactionId - Transaction ID
   * @param {object} tx - Optional database transaction context
   * @returns {Promise<Array>} Array of stock movement data
   */
  static async calculateStockMovements(items, transactionType, transactionId, tx = null) {
    const movements = []
    
    for (const item of items) {
      const currentStock = await this.getCurrentStock(item.productId, tx)
      const quantityChange = this.calculateQuantityChange(transactionType, item.quantity)
      const newStock = currentStock + quantityChange

      movements.push({
        productId: item.productId,
        transactionId,
        movementType: transactionType,
        quantityBefore: currentStock,
        quantityChange,
        quantityAfter: newStock
      })
    }

    return movements
  }

  /**
   * Process stock movements atomically
   * Creates stock movement records and validates stock levels
   * @param {Array} items - Transaction items
   * @param {string} transactionType - Type of transaction
   * @param {string} transactionId - Transaction ID
   * @param {object} tx - Database transaction context (required)
   * @returns {Promise<Array>} Created stock movements
   */
  static async processStockMovements(items, transactionType, transactionId, tx) {
    if (!tx) {
      throw new Error('Database transaction context is required for processing stock movements')
    }

    // Calculate all movements first
    const movements = await this.calculateStockMovements(items, transactionType, transactionId, tx)

    // Validate stock availability (allow negative for adjustments)
    const allowNegative = transactionType === TransactionType.ADJUST
    const validation = await this.validateStockAvailability(items, transactionType, tx, allowNegative)

    if (!validation.valid) {
      const errorMessages = validation.errors.map(error => error.message).join('; ')
      throw new Error(`Stock validation failed: ${errorMessages}`)
    }

    // Create stock movement records
    const createdMovements = await Promise.all(
      movements.map(movement =>
        tx.stockMovement.create({
          data: movement
        })
      )
    )

    return createdMovements
  }

  /**
   * Get stock movement history for a product
   * @param {string} productId - Product ID
   * @param {Object} options - Query options (startDate, endDate, limit, offset)
   * @returns {Promise<Object>} Stock movement history with pagination
   */
  static async getStockMovementHistory(productId, options = {}) {
    const {
      startDate,
      endDate,
      limit = 50,
      offset = 0,
      includeTransaction = true
    } = options

    const where = {
      productId,
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: includeTransaction ? {
          transaction: {
            select: {
              id: true,
              referenceNumber: true,
              type: true,
              transactionDate: true,
              notes: true,
              supplier: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        } : false,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.stockMovement.count({ where })
    ])

    return {
      movements,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }
  }

  /**
   * Calculate running balance for stock movements
   * Useful for displaying stock card with chronological balance changes
   * @param {Array} movements - Array of stock movements (should be ordered by date)
   * @returns {Array} Movements with calculated running balances
   */
  static calculateRunningBalances(movements) {
    // Sort movements by creation date (oldest first) for proper balance calculation
    const sortedMovements = [...movements].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    )

    let runningBalance = 0
    
    return sortedMovements.map((movement, index) => {
      if (index === 0) {
        // For the first movement, use the quantityBefore as starting point
        runningBalance = movement.quantityBefore
      }
      
      // Apply the change
      runningBalance += movement.quantityChange
      
      return {
        ...movement,
        runningBalance,
        balanceVerified: runningBalance === movement.quantityAfter
      }
    })
  }

  /**
   * Get comprehensive stock summary for all products
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Stock summary with current levels and movement counts
   */
  static async getStockSummary(options = {}) {
    const {
      includeZeroStock = true,
      onlyLowStock = false,
      categoryFilter = null
    } = options

    // Get all products with their latest stock movements
    const products = await prisma.product.findMany({
      where: {
        ...(categoryFilter && { category: categoryFilter })
      },
      select: {
        id: true,
        sku: true,
        brand: true,
        name: true,
        category: true,
        unit: true,
        minimumStock: true,
        stockMovements: {
          select: {
            quantityAfter: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            stockMovements: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform and filter results
    let stockSummary = products.map(product => {
      const currentStock = product.stockMovements[0]?.quantityAfter || 0
      const lastMovementDate = product.stockMovements[0]?.createdAt || null
      const isLowStock = product.minimumStock ? currentStock <= product.minimumStock : false

      return {
        productId: product.id,
        sku: product.sku,
        brand: product.brand,
        name: product.name,
        category: product.category,
        unit: product.unit,
        currentStock,
        minimumStock: product.minimumStock,
        isLowStock,
        lastMovementDate,
        totalMovements: product._count.stockMovements,
        stockValue: currentStock // Could be enhanced with pricing data
      }
    })

    // Apply filters
    if (!includeZeroStock) {
      stockSummary = stockSummary.filter(item => item.currentStock > 0)
    }

    if (onlyLowStock) {
      stockSummary = stockSummary.filter(item => item.isLowStock)
    }

    return stockSummary
  }

  /**
   * Calculate stock adjustment difference
   * Used for stock adjustment transactions to determine the change needed
   * @param {string} productId - Product ID
   * @param {number} actualStock - Actual counted stock
   * @param {object} tx - Optional database transaction context
   * @returns {Promise<Object>} Adjustment calculation result
   */
  static async calculateStockAdjustment(productId, actualStock, tx = null) {
    const currentStock = await this.getCurrentStock(productId, tx)
    const difference = actualStock - currentStock

    return {
      productId,
      currentStock,
      actualStock,
      difference,
      adjustmentType: difference > 0 ? 'INCREASE' : difference < 0 ? 'DECREASE' : 'NO_CHANGE',
      adjustmentQuantity: Math.abs(difference)
    }
  }

  /**
   * Validate and calculate batch stock adjustments
   * @param {Array} adjustments - Array of {productId, actualStock} objects
   * @param {object} tx - Optional database transaction context
   * @returns {Promise<Object>} Batch adjustment calculation result
   */
  static async calculateBatchStockAdjustments(adjustments, tx = null) {
    const results = await Promise.all(
      adjustments.map(({ productId, actualStock }) =>
        this.calculateStockAdjustment(productId, actualStock, tx)
      )
    )

    const summary = {
      totalAdjustments: results.length,
      increases: results.filter(r => r.adjustmentType === 'INCREASE').length,
      decreases: results.filter(r => r.adjustmentType === 'DECREASE').length,
      noChanges: results.filter(r => r.adjustmentType === 'NO_CHANGE').length,
      totalIncreaseQuantity: results
        .filter(r => r.adjustmentType === 'INCREASE')
        .reduce((sum, r) => sum + r.adjustmentQuantity, 0),
      totalDecreaseQuantity: results
        .filter(r => r.adjustmentType === 'DECREASE')
        .reduce((sum, r) => sum + r.adjustmentQuantity, 0)
    }

    return {
      adjustments: results,
      summary
    }
  }

  /**
   * Get real-time stock levels for dashboard/reporting
   * Optimized for performance with minimal data transfer
   * @param {Array} productIds - Optional array of specific product IDs
   * @returns {Promise<Array>} Real-time stock levels
   */
  static async getRealTimeStockLevels(productIds = null) {
    const where = productIds ? { id: { in: productIds } } : {}

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        sku: true,
        name: true,
        unit: true,
        minimumStock: true,
        stockMovements: {
          select: {
            quantityAfter: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    return products.map(product => ({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      currentStock: product.stockMovements[0]?.quantityAfter || 0,
      minimumStock: product.minimumStock,
      isLowStock: product.minimumStock ? 
        (product.stockMovements[0]?.quantityAfter || 0) <= product.minimumStock : 
        false,
      lastUpdated: product.stockMovements[0]?.createdAt || null
    }))
  }

  /**
   * Verify stock movement integrity
   * Checks that stock movements are consistent and balances are correct
   * @param {string} productId - Product ID to verify
   * @returns {Promise<Object>} Verification result
   */
  static async verifyStockMovementIntegrity(productId) {
    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' }
    })

    if (movements.length === 0) {
      return {
        valid: true,
        productId,
        message: 'No movements found for product'
      }
    }

    const errors = []
    let expectedBalance = movements[0].quantityBefore

    for (let i = 0; i < movements.length; i++) {
      const movement = movements[i]
      
      // Check if quantityBefore matches expected balance
      if (i > 0 && movement.quantityBefore !== expectedBalance) {
        errors.push({
          movementId: movement.id,
          issue: 'BALANCE_MISMATCH',
          expected: expectedBalance,
          actual: movement.quantityBefore,
          message: `Movement ${i + 1}: quantityBefore (${movement.quantityBefore}) doesn't match expected balance (${expectedBalance})`
        })
      }

      // Check if quantityAfter calculation is correct
      const calculatedAfter = movement.quantityBefore + movement.quantityChange
      if (movement.quantityAfter !== calculatedAfter) {
        errors.push({
          movementId: movement.id,
          issue: 'CALCULATION_ERROR',
          expected: calculatedAfter,
          actual: movement.quantityAfter,
          message: `Movement ${i + 1}: quantityAfter calculation error`
        })
      }

      expectedBalance = movement.quantityAfter
    }

    return {
      valid: errors.length === 0,
      productId,
      totalMovements: movements.length,
      finalBalance: expectedBalance,
      errors
    }
  }
}

// Export utility functions for backward compatibility
export const {
  calculateQuantityChange,
  getCurrentStock,
  getCurrentStockLevels,
  validateStockAvailability,
  calculateStockMovements,
  processStockMovements,
  getStockMovementHistory,
  calculateRunningBalances,
  getStockSummary,
  calculateStockAdjustment,
  calculateBatchStockAdjustments,
  getRealTimeStockLevels,
  verifyStockMovementIntegrity
} = StockCalculationEngine