'use server'

import { prisma } from '@/lib/prisma'
import { getQuickSession } from '@/lib/auth-quick'

// Demo price history data
const DEMO_PRICE_HISTORY = [
  {
    id: 'demo-price-1',
    productId: 'demo-prod-1',
    productName: 'Cat Tembok Putih 5L',
    purchasePrice: 85000,
    sellingPrice: 120000,
    effectiveDate: new Date('2024-01-15').toISOString(),
    reason: 'Initial price',
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'demo-price-2',
    productId: 'demo-prod-1',
    productName: 'Cat Tembok Putih 5L',
    purchasePrice: 87000,
    sellingPrice: 125000,
    effectiveDate: new Date('2024-01-20').toISOString(),
    reason: 'Supplier price increase',
    createdAt: new Date('2024-01-20').toISOString()
  },
  {
    id: 'demo-price-3',
    productId: 'demo-prod-2',
    productName: 'Cat Tembok Biru 5L',
    purchasePrice: 90000,
    sellingPrice: 125000,
    effectiveDate: new Date('2024-01-15').toISOString(),
    reason: 'Initial price',
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'demo-price-4',
    productId: 'demo-prod-3',
    productName: 'Cat Kayu Coklat 2.5L',
    purchasePrice: 65000,
    sellingPrice: 95000,
    effectiveDate: new Date('2024-01-16').toISOString(),
    reason: 'Initial price',
    createdAt: new Date('2024-01-16').toISOString()
  },
  {
    id: 'demo-price-5',
    productId: 'demo-prod-3',
    productName: 'Cat Kayu Coklat 2.5L',
    purchasePrice: 67000,
    sellingPrice: 98000,
    effectiveDate: new Date('2024-01-22').toISOString(),
    reason: 'Market adjustment',
    createdAt: new Date('2024-01-22').toISOString()
  }
]

/**
 * Check if we should use demo data
 */
async function shouldUseDemoData() {
  try {
    const quickSession = await getQuickSession()
    return quickSession?.isAuthenticated || false
  } catch (error) {
    return false
  }
}

/**
 * Record a price change for a product
 */
export async function recordPriceChange(productId, purchasePrice, sellingPrice, reason = 'Price update') {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[PriceHistoryManager] Demo mode - price change recording simulated')
    return {
      success: true,
      priceHistory: {
        id: `demo-price-${Date.now()}`,
        productId,
        purchasePrice,
        sellingPrice,
        effectiveDate: new Date().toISOString(),
        reason,
        createdAt: new Date().toISOString()
      }
    }
  }

  try {
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, purchasePrice: true, sellingPrice: true }
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    // Only record if prices have actually changed
    const hasChanged = 
      product.purchasePrice !== purchasePrice || 
      product.sellingPrice !== sellingPrice

    if (!hasChanged) {
      return {
        success: true,
        priceHistory: null // No change to record
      }
    }

    // Create price history record
    const priceHistory = await prisma.priceHistory.create({
      data: {
        productId,
        purchasePrice,
        sellingPrice,
        effectiveDate: new Date(),
        reason,
        metadata: {
          previousPurchasePrice: product.purchasePrice,
          previousSellingPrice: product.sellingPrice
        }
      },
      include: {
        product: {
          select: { name: true, sku: true }
        }
      }
    })

    // Update product's lastPriceUpdate field
    await prisma.product.update({
      where: { id: productId },
      data: { lastPriceUpdate: new Date() }
    })

    return {
      success: true,
      priceHistory
    }
  } catch (error) {
    console.error('Error recording price change:', error)
    return {
      success: false,
      error: 'Failed to record price change'
    }
  }
}

/**
 * Get price history for a specific product
 */
export async function getProductPriceHistory(productId, options = {}) {
  const {
    startDate = null,
    endDate = null,
    limit = 50,
    page = 1
  } = options

  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[PriceHistoryManager] Using demo price history')
    
    let filteredHistory = DEMO_PRICE_HISTORY.filter(h => h.productId === productId)

    if (startDate) {
      filteredHistory = filteredHistory.filter(h => 
        new Date(h.effectiveDate) >= new Date(startDate)
      )
    }

    if (endDate) {
      filteredHistory = filteredHistory.filter(h => 
        new Date(h.effectiveDate) <= new Date(endDate)
      )
    }

    // Sort by date descending
    filteredHistory.sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate))

    // Paginate
    const skip = (page - 1) * limit
    const paginatedHistory = filteredHistory.slice(skip, skip + limit)

    return {
      success: true,
      priceHistory: paginatedHistory,
      pagination: {
        page,
        limit,
        totalCount: filteredHistory.length,
        totalPages: Math.ceil(filteredHistory.length / limit)
      }
    }
  }

  try {
    const where = { productId }

    if (startDate || endDate) {
      where.effectiveDate = {}
      if (startDate) where.effectiveDate.gte = new Date(startDate)
      if (endDate) where.effectiveDate.lte = new Date(endDate)
    }

    const skip = (page - 1) * limit

    const [priceHistory, totalCount] = await Promise.all([
      prisma.priceHistory.findMany({
        where,
        include: {
          product: {
            select: { name: true, sku: true }
          }
        },
        orderBy: { effectiveDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.priceHistory.count({ where })
    ])

    return {
      success: true,
      priceHistory,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching price history:', error)
    return {
      success: false,
      error: 'Failed to fetch price history'
    }
  }
}

/**
 * Get price trends for a product
 */
export async function getPriceTrends(productId, days = 30) {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[PriceHistoryManager] Using demo price trends')
    
    const productHistory = DEMO_PRICE_HISTORY.filter(h => h.productId === productId)
    
    if (productHistory.length === 0) {
      return {
        success: true,
        trends: {
          currentPurchasePrice: 0,
          currentSellingPrice: 0,
          purchasePriceChange: 0,
          sellingPriceChange: 0,
          purchasePriceChangePercent: 0,
          sellingPriceChangePercent: 0,
          priceHistory: []
        }
      }
    }

    // Sort by date
    productHistory.sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate))

    const latest = productHistory[productHistory.length - 1]
    const earliest = productHistory[0]

    const purchasePriceChange = latest.purchasePrice - earliest.purchasePrice
    const sellingPriceChange = latest.sellingPrice - earliest.sellingPrice
    
    const purchasePriceChangePercent = earliest.purchasePrice > 0 
      ? (purchasePriceChange / earliest.purchasePrice) * 100 
      : 0
    const sellingPriceChangePercent = earliest.sellingPrice > 0 
      ? (sellingPriceChange / earliest.sellingPrice) * 100 
      : 0

    return {
      success: true,
      trends: {
        currentPurchasePrice: latest.purchasePrice,
        currentSellingPrice: latest.sellingPrice,
        purchasePriceChange,
        sellingPriceChange,
        purchasePriceChangePercent: Math.round(purchasePriceChangePercent * 100) / 100,
        sellingPriceChangePercent: Math.round(sellingPriceChangePercent * 100) / 100,
        priceHistory: productHistory
      }
    }
  }

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        productId,
        effectiveDate: { gte: startDate }
      },
      orderBy: { effectiveDate: 'asc' }
    })

    if (priceHistory.length === 0) {
      return {
        success: true,
        trends: {
          currentPurchasePrice: 0,
          currentSellingPrice: 0,
          purchasePriceChange: 0,
          sellingPriceChange: 0,
          purchasePriceChangePercent: 0,
          sellingPriceChangePercent: 0,
          priceHistory: []
        }
      }
    }

    const latest = priceHistory[priceHistory.length - 1]
    const earliest = priceHistory[0]

    const purchasePriceChange = latest.purchasePrice - earliest.purchasePrice
    const sellingPriceChange = latest.sellingPrice - earliest.sellingPrice
    
    const purchasePriceChangePercent = earliest.purchasePrice > 0 
      ? (purchasePriceChange / earliest.purchasePrice) * 100 
      : 0
    const sellingPriceChangePercent = earliest.sellingPrice > 0 
      ? (sellingPriceChange / earliest.sellingPrice) * 100 
      : 0

    return {
      success: true,
      trends: {
        currentPurchasePrice: latest.purchasePrice,
        currentSellingPrice: latest.sellingPrice,
        purchasePriceChange,
        sellingPriceChange,
        purchasePriceChangePercent: Math.round(purchasePriceChangePercent * 100) / 100,
        sellingPriceChangePercent: Math.round(sellingPriceChangePercent * 100) / 100,
        priceHistory
      }
    }
  } catch (error) {
    console.error('Error fetching price trends:', error)
    return {
      success: false,
      error: 'Failed to fetch price trends'
    }
  }
}

/**
 * Get average prices for a product over a period
 */
export async function getAveragePrices(productId, days = 30) {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[PriceHistoryManager] Using demo average prices')
    
    const productHistory = DEMO_PRICE_HISTORY.filter(h => h.productId === productId)
    
    if (productHistory.length === 0) {
      return {
        success: true,
        averages: {
          averagePurchasePrice: 0,
          averageSellingPrice: 0,
          averageMargin: 0,
          averageMarginPercent: 0,
          dataPoints: 0
        }
      }
    }

    const totalPurchase = productHistory.reduce((sum, h) => sum + h.purchasePrice, 0)
    const totalSelling = productHistory.reduce((sum, h) => sum + h.sellingPrice, 0)
    const count = productHistory.length

    const avgPurchase = totalPurchase / count
    const avgSelling = totalSelling / count
    const avgMargin = avgSelling - avgPurchase
    const avgMarginPercent = avgPurchase > 0 ? (avgMargin / avgPurchase) * 100 : 0

    return {
      success: true,
      averages: {
        averagePurchasePrice: Math.round(avgPurchase * 100) / 100,
        averageSellingPrice: Math.round(avgSelling * 100) / 100,
        averageMargin: Math.round(avgMargin * 100) / 100,
        averageMarginPercent: Math.round(avgMarginPercent * 100) / 100,
        dataPoints: count
      }
    }
  }

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const result = await prisma.priceHistory.aggregate({
      where: {
        productId,
        effectiveDate: { gte: startDate }
      },
      _avg: {
        purchasePrice: true,
        sellingPrice: true
      },
      _count: {
        id: true
      }
    })

    const avgPurchase = result._avg.purchasePrice || 0
    const avgSelling = result._avg.sellingPrice || 0
    const avgMargin = avgSelling - avgPurchase
    const avgMarginPercent = avgPurchase > 0 ? (avgMargin / avgPurchase) * 100 : 0

    return {
      success: true,
      averages: {
        averagePurchasePrice: Math.round(avgPurchase * 100) / 100,
        averageSellingPrice: Math.round(avgSelling * 100) / 100,
        averageMargin: Math.round(avgMargin * 100) / 100,
        averageMarginPercent: Math.round(avgMarginPercent * 100) / 100,
        dataPoints: result._count.id
      }
    }
  } catch (error) {
    console.error('Error calculating average prices:', error)
    return {
      success: false,
      error: 'Failed to calculate average prices'
    }
  }
}

/**
 * Get price suggestions based on historical data
 */
export async function getPriceSuggestions(productId) {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[PriceHistoryManager] Using demo price suggestions')
    
    const productHistory = DEMO_PRICE_HISTORY.filter(h => h.productId === productId)
    
    if (productHistory.length === 0) {
      return {
        success: true,
        suggestions: {
          suggestedPurchasePrice: 0,
          suggestedSellingPrice: 0,
          confidence: 'LOW',
          reasoning: 'No historical data available'
        }
      }
    }

    // Simple suggestion based on recent trends
    const recent = productHistory[productHistory.length - 1]
    const suggestedPurchasePrice = Math.round(recent.purchasePrice * 1.02) // 2% increase
    const suggestedSellingPrice = Math.round(recent.sellingPrice * 1.02)

    return {
      success: true,
      suggestions: {
        suggestedPurchasePrice,
        suggestedSellingPrice,
        confidence: 'MEDIUM',
        reasoning: 'Based on recent price trends with 2% adjustment'
      }
    }
  }

  try {
    // Get recent price history
    const recentHistory = await prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { effectiveDate: 'desc' },
      take: 5
    })

    if (recentHistory.length === 0) {
      return {
        success: true,
        suggestions: {
          suggestedPurchasePrice: 0,
          suggestedSellingPrice: 0,
          confidence: 'LOW',
          reasoning: 'No historical data available'
        }
      }
    }

    // Calculate trend
    const latest = recentHistory[0]
    const oldest = recentHistory[recentHistory.length - 1]
    
    const purchaseTrend = recentHistory.length > 1 
      ? (latest.purchasePrice - oldest.purchasePrice) / recentHistory.length
      : 0
    const sellingTrend = recentHistory.length > 1 
      ? (latest.sellingPrice - oldest.sellingPrice) / recentHistory.length
      : 0

    const suggestedPurchasePrice = Math.round((latest.purchasePrice + purchaseTrend) * 100) / 100
    const suggestedSellingPrice = Math.round((latest.sellingPrice + sellingTrend) * 100) / 100

    const confidence = recentHistory.length >= 3 ? 'HIGH' : 'MEDIUM'
    const reasoning = `Based on ${recentHistory.length} recent price changes with trend analysis`

    return {
      success: true,
      suggestions: {
        suggestedPurchasePrice,
        suggestedSellingPrice,
        confidence,
        reasoning
      }
    }
  } catch (error) {
    console.error('Error generating price suggestions:', error)
    return {
      success: false,
      error: 'Failed to generate price suggestions'
    }
  }
}

/**
 * Bulk update prices with history tracking
 */
export async function bulkUpdatePrices(updates, reason = 'Bulk price update') {
  const useDemoData = await shouldUseDemoData()

  if (useDemoData) {
    console.log('[PriceHistoryManager] Demo mode - bulk price update simulated')
    return {
      success: true,
      updatedCount: updates.length,
      priceHistoryRecords: updates.length
    }
  }

  try {
    let updatedCount = 0
    let priceHistoryRecords = 0

    // Process each update
    for (const update of updates) {
      const { productId, purchasePrice, sellingPrice } = update

      // Record price change
      const historyResult = await recordPriceChange(
        productId, 
        purchasePrice, 
        sellingPrice, 
        reason
      )

      if (historyResult.success && historyResult.priceHistory) {
        priceHistoryRecords++
      }

      // Update product prices
      await prisma.product.update({
        where: { id: productId },
        data: {
          purchasePrice,
          sellingPrice,
          lastPriceUpdate: new Date()
        }
      })

      updatedCount++
    }

    return {
      success: true,
      updatedCount,
      priceHistoryRecords
    }
  } catch (error) {
    console.error('Error in bulk price update:', error)
    return {
      success: false,
      error: 'Failed to update prices'
    }
  }
}