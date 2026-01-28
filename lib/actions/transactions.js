'use server'

import { prisma } from '@/lib/prisma'
import { 
  validateTransactionByType, 
  TransactionType,
  transactionFilterSchema,
  transactionUpdateSchema
} from '@/lib/validations/transaction'
import { StockCalculationEngine } from '@/lib/engines/stock-calculation'
import { revalidatePath } from 'next/cache'
import { invalidateTransactionRelatedCache } from '@/lib/cache/dashboard-cache'

// Generate unique reference number
async function generateReferenceNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  // Format: TXN-YYYYMMDD-XXXX
  const prefix = `TXN-${year}${month}${day}`
  
  // Find the highest sequence number for today
  const lastTransaction = await prisma.stockTransaction.findFirst({
    where: {
      referenceNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      referenceNumber: 'desc'
    }
  })
  
  let sequence = 1
  if (lastTransaction) {
    const lastSequence = parseInt(lastTransaction.referenceNumber.split('-')[2])
    sequence = lastSequence + 1
  }
  
  return `${prefix}-${String(sequence).padStart(4, '0')}`
}

// Create a new stock transaction with atomic processing
export async function createTransaction(data) {
  try {
    // Validate the transaction data based on type
    const validatedData = validateTransactionByType(data)
    
    // Generate unique reference number
    const referenceNumber = await generateReferenceNumber()
    
    // Use database transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Validate stock availability using the stock calculation engine
      const validation = await StockCalculationEngine.validateStockAvailability(
        validatedData.items,
        validatedData.type,
        tx,
        validatedData.type === TransactionType.ADJUST // Allow negative for adjustments
      )
      
      if (!validation.valid) {
        const errorMessages = validation.errors.map(error => error.message).join('; ')
        throw new Error(errorMessages)
      }
      
      // Calculate total value
      let totalValue = null
      if (validatedData.items.some(item => item.unitCost || item.unitPrice)) {
        totalValue = validatedData.items.reduce((sum, item) => {
          const price = item.unitCost || item.unitPrice || 0
          return sum + (price * item.quantity)
        }, 0)
      }
      
      // Create the transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          referenceNumber,
          type: validatedData.type,
          transactionDate: validatedData.transactionDate,
          supplierId: validatedData.supplierId,
          userId: validatedData.userId || 'user_test_123', // Use provided userId or default for tests
          notes: validatedData.notes,
          totalValue,
          items: {
            create: validatedData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              unitPrice: item.unitPrice
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          supplier: true
        }
      })
      
      // Process stock movements using the stock calculation engine
      await StockCalculationEngine.processStockMovements(
        validatedData.items,
        validatedData.type,
        transaction.id,
        tx
      )
      
      return transaction
    })
    
    // Revalidate relevant pages (only in production/development, not in tests)
    if (process.env.NODE_ENV !== 'test') {
      revalidatePath('/transactions')
      revalidatePath('/products')
      revalidatePath('/reports')
      revalidatePath('/dashboard')
    }
    
    // Invalidate dashboard cache
    invalidateTransactionRelatedCache()
    
    return { success: true, data: result }
    
  } catch (error) {
    console.error('Transaction creation error:', error)
    
    if (error.message.includes('Insufficient stock') || error.message.includes('Stock validation failed')) {
      return { error: error.message }
    }
    
    if (error.name === 'ZodError') {
      return { error: 'Invalid transaction data', details: error.errors }
    }
    
    return { error: 'Failed to create transaction' }
  }
}

// Get transactions with filtering and pagination
export async function getTransactions(filters = {}) {
  try {
    const validatedFilters = transactionFilterSchema.parse(filters)
    
    const where = {
      ...(validatedFilters.type && { type: validatedFilters.type }),
      ...(validatedFilters.supplierId && { supplierId: validatedFilters.supplierId }),
      ...(validatedFilters.startDate && validatedFilters.endDate && {
        transactionDate: {
          gte: validatedFilters.startDate,
          lte: validatedFilters.endDate
        }
      }),
      ...(validatedFilters.productId && {
        items: {
          some: {
            productId: validatedFilters.productId
          }
        }
      })
    }
    
    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  brand: true,
                  name: true,
                  unit: true
                }
              }
            }
          },
          supplier: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          transactionDate: 'desc'
        },
        skip: (validatedFilters.page - 1) * validatedFilters.limit,
        take: validatedFilters.limit
      }),
      prisma.stockTransaction.count({ where })
    ])
    
    return {
      success: true,
      data: {
        transactions,
        pagination: {
          page: validatedFilters.page,
          limit: validatedFilters.limit,
          total,
          pages: Math.ceil(total / validatedFilters.limit)
        }
      }
    }
    
  } catch (error) {
    console.error('Get transactions error:', error)
    return { error: 'Failed to fetch transactions' }
  }
}

// Get a single transaction by ID
export async function getTransaction(id) {
  try {
    const transaction = await prisma.stockTransaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true,
        movements: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true
              }
            }
          }
        }
      }
    })
    
    if (!transaction) {
      return { error: 'Transaction not found' }
    }
    
    return { success: true, data: transaction }
    
  } catch (error) {
    console.error('Get transaction error:', error)
    return { error: 'Failed to fetch transaction' }
  }
}

// Update transaction (limited to notes and reference number)
export async function updateTransaction(data) {
  try {
    const validatedData = transactionUpdateSchema.parse(data)
    
    const transaction = await prisma.stockTransaction.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.referenceNumber && { referenceNumber: validatedData.referenceNumber }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes })
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true
      }
    })
    
    if (process.env.NODE_ENV !== 'test') {
      revalidatePath('/transactions')
      revalidatePath('/dashboard')
    }
    
    // Invalidate dashboard cache
    invalidateTransactionRelatedCache()
    
    return { success: true, data: transaction }
    
  } catch (error) {
    console.error('Update transaction error:', error)
    
    if (error.code === 'P2002') {
      return { error: 'Reference number already exists' }
    }
    
    return { error: 'Failed to update transaction' }
  }
}

// Get stock movements for a product (stock card)
export async function getProductStockCard(productId, filters = {}) {
  try {
    const result = await StockCalculationEngine.getStockMovementHistory(productId, {
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: filters.limit || 50,
      offset: ((filters.page || 1) - 1) * (filters.limit || 50),
      includeTransaction: true
    })
    
    return {
      success: true,
      data: {
        movements: result.movements,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 50,
          total: result.pagination.total,
          pages: Math.ceil(result.pagination.total / (filters.limit || 50))
        }
      }
    }
    
  } catch (error) {
    console.error('Get stock card error:', error)
    return { error: 'Failed to fetch stock movements' }
  }
}

// Get current stock levels for all products
export async function getCurrentStockLevels() {
  try {
    const stockLevels = await StockCalculationEngine.getStockSummary({
      includeZeroStock: true,
      onlyLowStock: false
    })
    
    return { success: true, data: stockLevels }
    
  } catch (error) {
    console.error('Get stock levels error:', error)
    return { error: 'Failed to fetch stock levels' }
  }
}

// Delete transaction (with proper rollback of stock movements)
export async function deleteTransaction(id) {
  try {
    // Note: In a real application, you might want to prevent deletion of transactions
    // and instead implement a "void" or "cancel" functionality that creates
    // compensating transactions. For now, we'll implement actual deletion.
    
    const result = await prisma.$transaction(async (tx) => {
      // Get the transaction to be deleted
      const transaction = await tx.stockTransaction.findUnique({
        where: { id },
        include: {
          movements: true
        }
      })
      
      if (!transaction) {
        throw new Error('Transaction not found')
      }
      
      // Delete stock movements first (due to foreign key constraints)
      await tx.stockMovement.deleteMany({
        where: { transactionId: id }
      })
      
      // Delete transaction items
      await tx.transactionItem.deleteMany({
        where: { transactionId: id }
      })
      
      // Delete the transaction
      await tx.stockTransaction.delete({
        where: { id }
      })
      
      return transaction
    })
    
    if (process.env.NODE_ENV !== 'test') {
      revalidatePath('/transactions')
      revalidatePath('/products')
      revalidatePath('/reports')
      revalidatePath('/dashboard')
    }
    
    // Invalidate dashboard cache
    invalidateTransactionRelatedCache()
    
    return { success: true, data: result }
    
  } catch (error) {
    console.error('Delete transaction error:', error)
    return { error: 'Failed to delete transaction' }
  }
}

// Calculate stock adjustment for a product
export async function calculateStockAdjustment(productId, actualStock) {
  try {
    const adjustment = await StockCalculationEngine.calculateStockAdjustment(productId, actualStock)
    return { success: true, data: adjustment }
  } catch (error) {
    console.error('Calculate stock adjustment error:', error)
    return { error: 'Failed to calculate stock adjustment' }
  }
}

// Calculate batch stock adjustments
export async function calculateBatchStockAdjustments(adjustments) {
  try {
    const result = await StockCalculationEngine.calculateBatchStockAdjustments(adjustments)
    return { success: true, data: result }
  } catch (error) {
    console.error('Calculate batch adjustments error:', error)
    return { error: 'Failed to calculate batch adjustments' }
  }
}

// Get real-time stock levels for dashboard
export async function getRealTimeStockLevels(productIds = null) {
  try {
    const stockLevels = await StockCalculationEngine.getRealTimeStockLevels(productIds)
    return { success: true, data: stockLevels }
  } catch (error) {
    console.error('Get real-time stock levels error:', error)
    return { error: 'Failed to fetch real-time stock levels' }
  }
}

// Get low stock products
export async function getLowStockProducts() {
  try {
    const lowStockProducts = await StockCalculationEngine.getStockSummary({
      includeZeroStock: false,
      onlyLowStock: true
    })
    return { success: true, data: lowStockProducts }
  } catch (error) {
    console.error('Get low stock products error:', error)
    return { error: 'Failed to fetch low stock products' }
  }
}

// Verify stock movement integrity for a product
export async function verifyStockMovementIntegrity(productId) {
  try {
    const verification = await StockCalculationEngine.verifyStockMovementIntegrity(productId)
    return { success: true, data: verification }
  } catch (error) {
    console.error('Verify stock integrity error:', error)
    return { error: 'Failed to verify stock movement integrity' }
  }
}

// Get current stock for a single product
export async function getCurrentStock(productId) {
  try {
    const currentStock = await StockCalculationEngine.getCurrentStock(productId)
    return { success: true, data: { productId, currentStock } }
  } catch (error) {
    console.error('Get current stock error:', error)
    return { error: 'Failed to fetch current stock' }
  }
}