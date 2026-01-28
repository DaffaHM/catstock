import { prisma } from '@/lib/prisma'
import { StockCalculationEngine } from '@/lib/engines/stock-calculation'
import { 
  withCache, 
  CACHE_CONFIG,
  getCachedData,
  setCachedData
} from '@/lib/cache/dashboard-cache'

/**
 * Get dashboard overview statistics (cached)
 * @returns {Promise<Object>} Dashboard statistics
 */
export async function getDashboardStats() {
  return withCache(
    CACHE_CONFIG.KEYS.DASHBOARD_STATS,
    async () => {
      try {
        const [
          totalProducts,
          lowStockProducts,
          todayTransactions,
          totalStockValue,
          recentTransactions
        ] = await Promise.all([
          // Total products count
          prisma.product.count(),
          
          // Low stock products
          getLowStockCountUncached(),
          
          // Today's transactions
          getTodayTransactionCountUncached(),
          
          // Total stock value
          getTotalStockValueUncached(),
          
          // Recent transactions (last 5)
          getRecentTransactionsUncached(5)
        ])

        return {
          totalProducts,
          lowStockCount: lowStockProducts,
          todayTransactions,
          totalStockValue,
          recentTransactions
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw new Error('Failed to fetch dashboard statistics')
      }
    },
    CACHE_CONFIG.TTL.DASHBOARD_STATS
  )
}

/**
 * Get count of products with low stock (uncached version)
 * @returns {Promise<number>} Count of low stock products
 */
async function getLowStockCountUncached() {
  try {
    const lowStockProducts = await StockCalculationEngine.getStockSummary({
      includeZeroStock: false,
      onlyLowStock: true
    })
    
    return lowStockProducts.length
  } catch (error) {
    console.error('Error fetching low stock count:', error)
    return 0
  }
}

/**
 * Get count of products with low stock (cached version)
 * @returns {Promise<number>} Count of low stock products
 */
async function getLowStockCount() {
  return withCache(
    'low_stock_count',
    getLowStockCountUncached,
    CACHE_CONFIG.TTL.LOW_STOCK_ALERTS
  )
}

/**
 * Get count of today's transactions (uncached version)
 * @returns {Promise<number>} Count of today's transactions
 */
async function getTodayTransactionCountUncached() {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const count = await prisma.stockTransaction.count({
      where: {
        transactionDate: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    return count
  } catch (error) {
    console.error('Error fetching today transaction count:', error)
    return 0
  }
}

/**
 * Get count of today's transactions (cached version)
 * @returns {Promise<number>} Count of today's transactions
 */
async function getTodayTransactionCount() {
  return withCache(
    'today_transactions_count',
    getTodayTransactionCountUncached,
    CACHE_CONFIG.TTL.QUICK_STATS
  )
}

/**
 * Calculate total stock value across all products (uncached version)
 * @returns {Promise<number>} Total stock value
 */
async function getTotalStockValueUncached() {
  try {
    // Optimized query: select only necessary fields and use joins
    const products = await prisma.product.findMany({
      where: {
        sellingPrice: { not: null }
      },
      select: {
        id: true,
        sellingPrice: true,
        stockMovements: {
          select: {
            quantityAfter: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    let totalValue = 0
    products.forEach(product => {
      const currentStock = product.stockMovements[0]?.quantityAfter || 0
      const value = currentStock * (product.sellingPrice || 0)
      totalValue += value
    })

    return totalValue
  } catch (error) {
    console.error('Error calculating total stock value:', error)
    return 0
  }
}

/**
 * Calculate total stock value across all products (cached version)
 * @returns {Promise<number>} Total stock value
 */
async function getTotalStockValue() {
  return withCache(
    'total_stock_value',
    getTotalStockValueUncached,
    CACHE_CONFIG.TTL.STOCK_SUMMARY
  )
}

/**
 * Get recent transactions for dashboard activity feed (uncached version)
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<Array>} Recent transactions
 */
async function getRecentTransactionsUncached(limit = 5) {
  try {
    const transactions = await prisma.stockTransaction.findMany({
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
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return transactions
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    return []
  }
}

/**
 * Get recent transactions for dashboard activity feed (cached version)
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<Array>} Recent transactions
 */
async function getRecentTransactions(limit = 5) {
  return withCache(
    `recent_transactions_${limit}`,
    () => getRecentTransactionsUncached(limit),
    CACHE_CONFIG.TTL.RECENT_ACTIVITY
  )
}

/**
 * Get low stock alerts for dashboard (cached)
 * @param {number} limit - Number of alerts to fetch
 * @returns {Promise<Array>} Low stock products
 */
export async function getLowStockAlerts(limit = 10) {
  return withCache(
    CACHE_CONFIG.KEYS.LOW_STOCK_ALERTS,
    async () => {
      try {
        const lowStockProducts = await StockCalculationEngine.getStockSummary({
          includeZeroStock: false,
          onlyLowStock: true
        })
        
        // Sort by urgency (how far below minimum stock)
        const sortedProducts = lowStockProducts
          .map(product => ({
            id: product.productId,
            sku: product.sku,
            brand: product.brand,
            name: product.name,
            unit: product.unit,
            currentStock: product.currentStock,
            minimumStock: product.minimumStock,
            deficit: product.minimumStock - product.currentStock,
            urgency: product.currentStock === 0 ? 'critical' : 'warning'
          }))
          .sort((a, b) => {
            // Sort by urgency first (critical before warning), then by deficit
            if (a.urgency !== b.urgency) {
              return a.urgency === 'critical' ? -1 : 1
            }
            return b.deficit - a.deficit
          })
          .slice(0, limit)

        return sortedProducts
      } catch (error) {
        console.error('Error fetching low stock alerts:', error)
        return []
      }
    },
    CACHE_CONFIG.TTL.LOW_STOCK_ALERTS
  )
}

/**
 * Get dashboard activity feed (cached)
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<Array>} Recent activities
 */
export async function getDashboardActivity(limit = 10) {
  return withCache(
    CACHE_CONFIG.KEYS.RECENT_ACTIVITY,
    async () => {
      try {
        const activities = await prisma.stockTransaction.findMany({
          select: {
            id: true,
            referenceNumber: true,
            type: true,
            transactionDate: true,
            createdAt: true,
            supplier: {
              select: {
                name: true
              }
            },
            items: {
              select: {
                quantity: true,
                product: {
                  select: {
                    name: true,
                    brand: true
                  }
                }
              },
              take: 3 // Limit items shown per transaction
            },
            _count: {
              select: {
                items: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit
        })

        // Format activities for display
        return activities.map(transaction => {
          const itemCount = transaction._count.items
          const displayItems = transaction.items.slice(0, 2)
          const hasMoreItems = itemCount > 2

          return {
            id: transaction.id,
            type: transaction.type,
            referenceNumber: transaction.referenceNumber,
            date: transaction.transactionDate,
            createdAt: transaction.createdAt,
            supplier: transaction.supplier?.name,
            itemCount,
            displayItems,
            hasMoreItems,
            description: generateActivityDescription(transaction)
          }
        })
      } catch (error) {
        console.error('Error fetching dashboard activity:', error)
        return []
      }
    },
    CACHE_CONFIG.TTL.RECENT_ACTIVITY
  )
}

/**
 * Generate human-readable description for activity
 * @param {Object} transaction - Transaction object
 * @returns {string} Activity description
 */
function generateActivityDescription(transaction) {
  const itemCount = transaction._count.items
  const type = transaction.type
  const supplier = transaction.supplier?.name

  switch (type) {
    case 'IN':
      return supplier 
        ? `Received ${itemCount} item${itemCount > 1 ? 's' : ''} from ${supplier}`
        : `Stock in: ${itemCount} item${itemCount > 1 ? 's' : ''}`
    case 'OUT':
      return `Stock out: ${itemCount} item${itemCount > 1 ? 's' : ''}`
    case 'ADJUST':
      return `Stock adjustment: ${itemCount} item${itemCount > 1 ? 's' : ''}`
    case 'RETURN_IN':
      return `Return in: ${itemCount} item${itemCount > 1 ? 's' : ''}`
    case 'RETURN_OUT':
      return `Return out: ${itemCount} item${itemCount > 1 ? 's' : ''}`
    default:
      return `Transaction: ${itemCount} item${itemCount > 1 ? 's' : ''}`
  }
}

/**
 * Get quick stats for dashboard widgets (cached)
 * @returns {Promise<Object>} Quick statistics
 */
export async function getQuickStats() {
  return withCache(
    CACHE_CONFIG.KEYS.QUICK_STATS,
    async () => {
      try {
        const [
          totalProducts,
          lowStockCount,
          outOfStockCount,
          todayTransactions,
          weekTransactions,
          totalValue
        ] = await Promise.all([
          prisma.product.count(),
          getLowStockCountUncached(),
          getOutOfStockCountUncached(),
          getTodayTransactionCountUncached(),
          getWeekTransactionCountUncached(),
          getTotalStockValueUncached()
        ])

        return {
          totalProducts,
          lowStockCount,
          outOfStockCount,
          todayTransactions,
          weekTransactions,
          totalValue
        }
      } catch (error) {
        console.error('Error fetching quick stats:', error)
        throw new Error('Failed to fetch quick statistics')
      }
    },
    CACHE_CONFIG.TTL.QUICK_STATS
  )
}

/**
 * Get count of out of stock products (uncached version)
 * @returns {Promise<number>} Count of out of stock products
 */
async function getOutOfStockCountUncached() {
  try {
    // Optimized query using aggregation
    const result = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      LEFT JOIN (
        SELECT DISTINCT ON (productId) productId, quantityAfter
        FROM stock_movements
        ORDER BY productId, createdAt DESC
      ) latest_movement ON p.id = latest_movement.productId
      WHERE COALESCE(latest_movement.quantityAfter, 0) = 0
    `

    return Number(result[0]?.count || 0)
  } catch (error) {
    console.error('Error fetching out of stock count:', error)
    // Fallback to original method if raw query fails
    const products = await prisma.product.findMany({
      select: {
        id: true,
        stockMovements: {
          select: {
            quantityAfter: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    let outOfStockCount = 0
    products.forEach(product => {
      const currentStock = product.stockMovements[0]?.quantityAfter || 0
      if (currentStock === 0) {
        outOfStockCount++
      }
    })

    return outOfStockCount
  }
}

/**
 * Get count of out of stock products (cached version)
 * @returns {Promise<number>} Count of out of stock products
 */
async function getOutOfStockCount() {
  return withCache(
    'out_of_stock_count',
    getOutOfStockCountUncached,
    CACHE_CONFIG.TTL.STOCK_SUMMARY
  )
}

/**
 * Get count of this week's transactions (uncached version)
 * @returns {Promise<number>} Count of this week's transactions
 */
async function getWeekTransactionCountUncached() {
  try {
    const today = new Date()
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7)

    const count = await prisma.stockTransaction.count({
      where: {
        transactionDate: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    })

    return count
  } catch (error) {
    console.error('Error fetching week transaction count:', error)
    return 0
  }
}

/**
 * Get count of this week's transactions (cached version)
 * @returns {Promise<number>} Count of this week's transactions
 */
async function getWeekTransactionCount() {
  return withCache(
    'week_transactions_count',
    getWeekTransactionCountUncached,
    CACHE_CONFIG.TTL.QUICK_STATS
  )
}