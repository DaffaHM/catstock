import { prisma } from '@/lib/prisma'
import { StockCalculationEngine } from '@/lib/engines/stock-calculation'

// Get transactions with optimized queries
export async function getTransactionsList(filters = {}) {
  const {
    type,
    supplierId,
    productId,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    search
  } = filters

  const skip = (page - 1) * limit

  const where = {
    ...(type && { type }),
    ...(supplierId && { supplierId }),
    ...(startDate && endDate && {
      transactionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }),
    ...(productId && {
      items: {
        some: {
          productId
        }
      }
    }),
    ...(search && {
      OR: [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        {
          supplier: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    })
  }

  try {
    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
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
          },
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: {
          transactionDate: 'desc'
        },
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
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw new Error('Failed to fetch transactions')
  }
}

// Get single transaction with full details
export async function getTransactionById(id) {
  try {
    const transaction = await prisma.stockTransaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                brand: true,
                name: true,
                category: true,
                size: true,
                unit: true,
                purchasePrice: true,
                sellingPrice: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        supplier: {
          select: {
            id: true,
            name: true,
            contact: true
          }
        },
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
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    return transaction
  } catch (error) {
    console.error('Error fetching transaction:', error)
    throw new Error('Failed to fetch transaction')
  }
}

// Get product stock movements (stock card)
export async function getProductStockMovements(productId, filters = {}) {
  try {
    const result = await StockCalculationEngine.getStockMovementHistory(productId, {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      limit: filters.limit || 50,
      offset: ((filters.page || 1) - 1) * (filters.limit || 50),
      includeTransaction: true
    })
    
    // Calculate running balances for the movements
    const movementsWithBalances = StockCalculationEngine.calculateRunningBalances(result.movements)
    
    return {
      movements: movementsWithBalances,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: result.pagination.total,
        pages: Math.ceil(result.pagination.total / (filters.limit || 50))
      }
    }
  } catch (error) {
    console.error('Error fetching stock movements:', error)
    throw new Error('Failed to fetch stock movements')
  }
}

// Get current stock levels for all products
export async function getAllCurrentStockLevels() {
  try {
    const stockLevels = await StockCalculationEngine.getStockSummary({
      includeZeroStock: true,
      onlyLowStock: false
    })
    
    // Transform to match expected format
    return stockLevels.map(item => ({
      id: item.productId,
      sku: item.sku,
      brand: item.brand,
      name: item.name,
      category: item.category,
      unit: item.unit,
      minimumStock: item.minimumStock,
      currentStock: item.currentStock,
      isLowStock: item.isLowStock,
      stockMovements: undefined // Remove from response for consistency
    }))
  } catch (error) {
    console.error('Error fetching stock levels:', error)
    throw new Error('Failed to fetch stock levels')
  }
}

// Get current stock level for a single product
export async function getCurrentStockLevel(productId) {
  try {
    const currentStock = await StockCalculationEngine.getCurrentStock(productId)
    return currentStock
  } catch (error) {
    console.error('Error fetching current stock level:', error)
    throw new Error('Failed to fetch current stock level')
  }
}

// Get transaction summary statistics
export async function getTransactionSummary(filters = {}) {
  const {
    startDate,
    endDate,
    type,
    supplierId
  } = filters

  const where = {
    ...(type && { type }),
    ...(supplierId && { supplierId }),
    ...(startDate && endDate && {
      transactionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    })
  }

  try {
    const [
      totalTransactions,
      totalValue,
      transactionsByType,
      recentTransactions
    ] = await Promise.all([
      // Total transaction count
      prisma.stockTransaction.count({ where }),
      
      // Total value sum
      prisma.stockTransaction.aggregate({
        where: {
          ...where,
          totalValue: { not: null }
        },
        _sum: {
          totalValue: true
        }
      }),
      
      // Transactions grouped by type
      prisma.stockTransaction.groupBy({
        by: ['type'],
        where,
        _count: {
          id: true
        },
        _sum: {
          totalValue: true
        }
      }),
      
      // Recent transactions
      prisma.stockTransaction.findMany({
        where,
        select: {
          id: true,
          referenceNumber: true,
          type: true,
          transactionDate: true,
          totalValue: true,
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
        orderBy: {
          transactionDate: 'desc'
        },
        take: 10
      })
    ])

    return {
      totalTransactions,
      totalValue: totalValue._sum.totalValue || 0,
      transactionsByType,
      recentTransactions
    }
  } catch (error) {
    console.error('Error fetching transaction summary:', error)
    throw new Error('Failed to fetch transaction summary')
  }
}

// Get low stock products
export async function getLowStockProducts() {
  try {
    const lowStockProducts = await StockCalculationEngine.getStockSummary({
      includeZeroStock: false,
      onlyLowStock: true
    })
    
    // Transform to match expected format and sort by deficit
    return lowStockProducts
      .map(item => ({
        id: item.productId,
        sku: item.sku,
        brand: item.brand,
        name: item.name,
        unit: item.unit,
        minimumStock: item.minimumStock,
        currentStock: item.currentStock,
        stockMovements: undefined
      }))
      .sort((a, b) => {
        // Sort by how far below minimum stock they are
        const aDeficit = a.minimumStock - a.currentStock
        const bDeficit = b.minimumStock - b.currentStock
        return bDeficit - aDeficit
      })
  } catch (error) {
    console.error('Error fetching low stock products:', error)
    throw new Error('Failed to fetch low stock products')
  }
}

// Get transaction reference number suggestions
export async function getTransactionReferences(search = '') {
  try {
    const references = await prisma.stockTransaction.findMany({
      where: {
        referenceNumber: {
          contains: search,
          mode: 'insensitive'
        }
      },
      select: {
        referenceNumber: true,
        type: true,
        transactionDate: true
      },
      orderBy: {
        transactionDate: 'desc'
      },
      take: 10
    })

    return references
  } catch (error) {
    console.error('Error fetching transaction references:', error)
    throw new Error('Failed to fetch transaction references')
  }
}