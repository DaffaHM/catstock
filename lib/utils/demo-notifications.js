'use client'

import { getDemoProducts } from './demo-products'
import { getDemoTransactions } from './demo-transactions'

// Generate low stock alerts based on actual demo product data
export function generateLowStockAlerts() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const products = getDemoProducts()
    const lowStockProducts = []

    products.forEach(product => {
      const currentStock = product.currentStock || 0
      const minimumStock = product.minimumStock || 0

      // Check if product is at or below minimum stock
      if (minimumStock > 0 && currentStock <= minimumStock) {
        const urgencyLevel = calculateUrgencyLevel(currentStock, minimumStock)
        
        lowStockProducts.push({
          id: product.id,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          category: product.category,
          currentStock,
          minimumStock,
          reorderPoint: minimumStock, // Use minimumStock as reorder point
          unit: product.unit,
          urgencyLevel,
          daysUntilEmpty: estimateDaysUntilEmpty(product.id, currentStock),
          lastRestocked: getLastRestockDate(product.id),
          supplier: getProductSupplier(product.id)
        })
      }
    })

    // Sort by urgency level
    lowStockProducts.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const aUrgency = urgencyOrder[a.urgencyLevel] || 3
      const bUrgency = urgencyOrder[b.urgencyLevel] || 3
      
      if (aUrgency !== bUrgency) {
        return aUrgency - bUrgency
      }
      
      // If same urgency, sort by stock ratio (lower first)
      const aRatio = a.minimumStock > 0 ? a.currentStock / a.minimumStock : 1
      const bRatio = b.minimumStock > 0 ? b.currentStock / b.minimumStock : 1
      return aRatio - bRatio
    })

    return lowStockProducts
  } catch (error) {
    console.error('Error generating low stock alerts:', error)
    return []
  }
}

// Calculate urgency level based on stock ratio
function calculateUrgencyLevel(currentStock, minimumStock) {
  if (currentStock === 0) return 'critical'
  if (minimumStock === 0) return 'low'
  
  const ratio = currentStock / minimumStock
  
  if (ratio <= 0.2) return 'critical'  // 20% or less of minimum
  if (ratio <= 0.5) return 'high'      // 50% or less of minimum
  if (ratio <= 0.8) return 'medium'    // 80% or less of minimum
  return 'low'
}

// Estimate days until empty based on recent transactions
function estimateDaysUntilEmpty(productId, currentStock) {
  if (currentStock === 0) return 0

  try {
    const transactions = getDemoTransactions()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find OUT transactions for this product in last 30 days
    const outTransactions = transactions.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transactionDate)
      return transaction.type === 'OUT' && 
             transactionDate >= thirtyDaysAgo &&
             transaction.items.some(item => item.productId === productId)
    })

    if (outTransactions.length === 0) return null

    // Calculate total quantity sold in last 30 days
    let totalSold = 0
    outTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        if (item.productId === productId) {
          totalSold += item.quantity
        }
      })
    })

    if (totalSold === 0) return null

    // Calculate average daily usage
    const averageDailyUsage = totalSold / 30
    
    // Estimate days until empty
    return Math.ceil(currentStock / averageDailyUsage)
  } catch (error) {
    console.error('Error estimating days until empty:', error)
    return null
  }
}

// Get last restock date for a product
function getLastRestockDate(productId) {
  try {
    const transactions = getDemoTransactions()
    
    // Find most recent IN transaction for this product
    const inTransactions = transactions.transactions
      .filter(transaction => 
        transaction.type === 'IN' &&
        transaction.items.some(item => item.productId === productId)
      )
      .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))

    if (inTransactions.length > 0) {
      return inTransactions[0].transactionDate
    }

    return null
  } catch (error) {
    console.error('Error getting last restock date:', error)
    return null
  }
}

// Get supplier for a product (from most recent IN transaction)
function getProductSupplier(productId) {
  try {
    const transactions = getDemoTransactions()
    
    // Find most recent IN transaction with supplier for this product
    const inTransactions = transactions.transactions
      .filter(transaction => 
        transaction.type === 'IN' &&
        transaction.supplierId &&
        transaction.items.some(item => item.productId === productId)
      )
      .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))

    if (inTransactions.length > 0) {
      // Return supplier name or ID (you might want to get actual supplier name)
      return `Supplier ${inTransactions[0].supplierId.slice(-3)}`
    }

    return 'Unknown'
  } catch (error) {
    console.error('Error getting product supplier:', error)
    return 'Unknown'
  }
}

// Generate stock report data
export function generateStockReport() {
  if (typeof window === 'undefined') {
    return {
      products: [],
      summary: {
        totalProducts: 0,
        lowStockCount: 0,
        criticalStockCount: 0,
        totalValue: 0
      }
    }
  }

  try {
    const products = getDemoProducts()
    const stockData = []
    let totalValue = 0
    let lowStockCount = 0
    let criticalStockCount = 0

    products.forEach(product => {
      const currentStock = product.currentStock || 0
      const minimumStock = product.minimumStock || 0
      const sellingPrice = product.sellingPrice || 0
      
      // Calculate stock value
      const stockValue = currentStock * sellingPrice
      totalValue += stockValue

      // Determine stock status
      let status = 'normal'
      if (minimumStock > 0) {
        if (currentStock === 0) {
          status = 'critical'
          criticalStockCount++
        } else if (currentStock <= minimumStock * 0.5) {
          status = 'critical'
          criticalStockCount++
        } else if (currentStock <= minimumStock) {
          status = 'low'
          lowStockCount++
        }
      }

      stockData.push({
        id: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        category: product.category,
        currentStock,
        minimumStock,
        unit: product.unit,
        sellingPrice,
        stockValue,
        status,
        lastUpdated: product.updatedAt
      })
    })

    // Sort by status (critical first, then low, then normal)
    stockData.sort((a, b) => {
      const statusOrder = { critical: 0, low: 1, normal: 2 }
      const aOrder = statusOrder[a.status] || 2
      const bOrder = statusOrder[b.status] || 2
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }
      
      // If same status, sort by name
      return a.name.localeCompare(b.name)
    })

    return {
      products: stockData,
      summary: {
        totalProducts: products.length,
        lowStockCount,
        criticalStockCount,
        totalValue
      }
    }
  } catch (error) {
    console.error('Error generating stock report:', error)
    return {
      products: [],
      summary: {
        totalProducts: 0,
        lowStockCount: 0,
        criticalStockCount: 0,
        totalValue: 0
      }
    }
  }
}

// Get notification summary
export function getNotificationSummary() {
  const alerts = generateLowStockAlerts()
  
  return {
    totalAlerts: alerts.length,
    criticalCount: alerts.filter(alert => alert.urgencyLevel === 'critical').length,
    highCount: alerts.filter(alert => alert.urgencyLevel === 'high').length,
    mediumCount: alerts.filter(alert => alert.urgencyLevel === 'medium').length,
    lowCount: alerts.filter(alert => alert.urgencyLevel === 'low').length
  }
}