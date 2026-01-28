/**
 * Optimized Database Queries
 * Contains optimized Prisma queries with proper select statements and indexing
 */

import { prisma } from '@/lib/prisma'

/**
 * Optimized product queries with minimal data fetching
 */
export const OptimizedProductQueries = {
  /**
   * Get products with only essential fields for listing
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Products with minimal data
   */
  async getProductsForListing(options = {}) {
    const {
      search,
      category,
      brand,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = options

    const skip = (page - 1) * limit

    // Build where clause
    const where = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' }
    }

    // Execute optimized query with minimal select
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          sku: true,
          brand: true,
          name: true,
          category: true,
          size: true,
          unit: true,
          sellingPrice: true,
          minimumStock: true,
          updatedAt: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    }
  },

  /**
   * Get product details with stock information
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product with stock data
   */
  async getProductWithStock(productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        sku: true,
        brand: true,
        name: true,
        category: true,
        size: true,
        unit: true,
        purchasePrice: true,
        sellingPrice: true,
        minimumStock: true,
        createdAt: true,
        updatedAt: true,
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

    if (!product) return null

    const currentStock = product.stockMovements[0]?.quantityAfter || 0
    const lastMovementDate = product.stockMovements[0]?.createdAt || null

    return {
      ...product,
      currentStock,
      lastMovementDate,
      isLowStock: product.minimumStock ? currentStock <= product.minimumStock : false,
      stockMovements: undefined // Remove from response
    }
  },

  /**
   * Get products for autocomplete (minimal data)
   * @param {string} search - Search query
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} Products for autocomplete
   */
  async getProductsForAutocomplete(search, limit = 20) {
    return await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        sku: true,
        brand: true,
        name: true,
        unit: true,
        sellingPrice: true
      },
      orderBy: { name: 'asc' },
      take: limit
    })
  }
}

/**
 * Optimized transaction queries
 */
export const OptimizedTransactionQueries = {
  /**
   * Get transactions with minimal data for listing
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Transactions with pagination
   */
  async getTransactionsForListing(options = {}) {
    const {
      type,
      startDate,
      endDate,
      supplierId,
      page = 1,
      limit = 50
    } = options

    const skip = (page - 1) * limit

    // Build where clause
    const where = {}
    
    if (type) {
      where.type = type
    }

    if (startDate || endDate) {
      where.transactionDate = {}
      if (startDate) where.transactionDate.gte = new Date(startDate)
      if (endDate) where.transactionDate.lte = new Date(endDate)
    }

    if (supplierId) {
      where.supplierId = supplierId
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        select: {
          id: true,
          referenceNumber: true,
          type: true,
          transactionDate: true,
          totalValue: true,
          createdAt: true,
          supplier: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.stockTransaction.count({ where })
    ])

    return {
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    }
  },

  /**
   * Get transaction details with items
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Transaction with items
   */
  async getTransactionWithItems(transactionId) {
    return await prisma.stockTransaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        referenceNumber: true,
        type: true,
        transactionDate: true,
        totalValue: true,
        notes: true,
        createdAt: true,
        supplier: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          select: {
            id: true,
            quantity: true,
            unitCost: true,
            unitPrice: true,
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
        }
      }
    })
  }
}

/**
 * Optimized supplier queries
 */
export const OptimizedSupplierQueries = {
  /**
   * Get suppliers for listing with minimal data
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Suppliers with pagination
   */
  async getSuppliersForListing(options = {}) {
    const {
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = options

    const skip = (page - 1) * limit

    // Build where clause
    const where = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where,
        select: {
          id: true,
          name: true,
          contact: true,
          updatedAt: true,
          _count: {
            select: {
              transactions: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.supplier.count({ where })
    ])

    return {
      suppliers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    }
  },

  /**
   * Get suppliers for select dropdown (minimal data)
   * @returns {Promise<Array>} Suppliers for dropdown
   */
  async getSuppliersForSelect() {
    return await prisma.supplier.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    })
  }
}

/**
 * Optimized stock movement queries
 */
export const OptimizedStockQueries = {
  /**
   * Get current stock levels for multiple products efficiently
   * @param {Array<string>} productIds - Product IDs
   * @returns {Promise<Object>} Map of productId -> stock level
   */
  async getCurrentStockBatch(productIds) {
    // Use raw query for better performance with large datasets
    const result = await prisma.$queryRaw`
      SELECT DISTINCT ON (sm.productId) 
        sm.productId, 
        sm.quantityAfter
      FROM stock_movements sm
      WHERE sm.productId = ANY(${productIds})
      ORDER BY sm.productId, sm.createdAt DESC
    `

    const stockMap = {}
    result.forEach(row => {
      stockMap[row.productId] = row.quantityAfter
    })

    // Fill in missing products with 0 stock
    productIds.forEach(id => {
      if (!(id in stockMap)) {
        stockMap[id] = 0
      }
    })

    return stockMap
  },

  /**
   * Get stock movements for a product with pagination
   * @param {string} productId - Product ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Stock movements with pagination
   */
  async getProductStockMovements(productId, options = {}) {
    const {
      startDate,
      endDate,
      movementType,
      page = 1,
      limit = 50
    } = options

    const skip = (page - 1) * limit

    // Build where clause
    const where = { productId }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    if (movementType) {
      where.movementType = movementType
    }

    const [movements, totalCount] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        select: {
          id: true,
          movementType: true,
          quantityBefore: true,
          quantityChange: true,
          quantityAfter: true,
          createdAt: true,
          transaction: {
            select: {
              referenceNumber: true,
              transactionDate: true,
              supplier: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.stockMovement.count({ where })
    ])

    return {
      movements,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    }
  }
}

/**
 * Database performance utilities
 */
export const DatabaseUtils = {
  /**
   * Analyze query performance
   * @param {Function} queryFunction - Query function to analyze
   * @returns {Promise<Object>} Performance metrics
   */
  async analyzeQueryPerformance(queryFunction) {
    const startTime = Date.now()
    const startMemory = process.memoryUsage()

    try {
      const result = await queryFunction()
      const endTime = Date.now()
      const endMemory = process.memoryUsage()

      return {
        success: true,
        executionTime: endTime - startTime,
        memoryUsage: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external
        },
        resultSize: Array.isArray(result) ? result.length : 1
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      }
    }
  },

  /**
   * Get database connection info
   * @returns {Promise<Object>} Connection statistics
   */
  async getConnectionInfo() {
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          current_database() as database_name,
          current_user as user_name,
          version() as version
      `
      
      return result[0]
    } catch (error) {
      console.error('Error getting connection info:', error)
      return null
    }
  }
}