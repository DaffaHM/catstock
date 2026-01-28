'use client'

import { getDemoProducts } from './demo-products'
import { getDemoSuppliers } from './demo-suppliers'
import { getDemoTransactions } from './demo-transactions'

// Get real-time dashboard stats from demo data
export function getDemoDashboardStats() {
  if (typeof window === 'undefined') {
    return {
      totalProducts: 0,
      totalSuppliers: 0,
      totalTransactions: 0,
      totalValue: 0,
      lowStockCount: 0
    }
  }

  try {
    // Get current data from localStorage
    const products = getDemoProducts()
    const suppliers = getDemoSuppliers()
    const transactions = getDemoTransactions()

    // Calculate stats
    const totalProducts = products.length
    const totalSuppliers = suppliers.length
    const totalTransactions = transactions.transactions.length

    // Calculate total value from transactions
    const totalValue = transactions.transactions.reduce((sum, transaction) => {
      return sum + (transaction.totalValue || 0)
    }, 0)

    // Calculate low stock count
    const lowStockCount = products.filter(product => {
      const currentStock = product.currentStock || 0
      const minimumStock = product.minimumStock || 0
      return currentStock <= minimumStock
    }).length

    return {
      totalProducts,
      totalSuppliers,
      totalTransactions,
      totalValue,
      lowStockCount
    }

  } catch (error) {
    console.error('Error calculating demo dashboard stats:', error)
    return {
      totalProducts: 0,
      totalSuppliers: 0,
      totalTransactions: 0,
      totalValue: 0,
      lowStockCount: 0
    }
  }
}

// Get low stock alerts from demo data
export function getDemoLowStockAlerts() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const products = getDemoProducts()
    const suppliers = getDemoSuppliers()

    return products
      .filter(product => {
        const currentStock = product.currentStock || 0
        const minimumStock = product.minimumStock || 0
        return currentStock <= minimumStock
      })
      .map(product => {
        // Find supplier for this product (simplified - in real app would have product-supplier relationship)
        const supplier = suppliers[0] || { name: 'Unknown Supplier' }
        
        return {
          id: product.id,
          name: product.name,
          currentStock: product.currentStock || 0,
          minimumStock: product.minimumStock || 0,
          category: product.category,
          supplier: supplier.name,
          lastRestocked: product.updatedAt
        }
      })
      .slice(0, 10) // Limit to 10 alerts

  } catch (error) {
    console.error('Error getting demo low stock alerts:', error)
    return []
  }
}

// Get recent activity from demo transactions
export function getDemoRecentActivity() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const transactions = getDemoTransactions({ limit: 10 })

    return transactions.transactions.map(transaction => {
      let description = ''
      let type = 'transaction'

      switch (transaction.type) {
        case 'IN':
          description = `Stok masuk: ${transaction.items.length} item(s)`
          type = 'stock_in'
          break
        case 'OUT':
          description = `Stok keluar: ${transaction.items.length} item(s)`
          type = 'stock_out'
          break
        case 'ADJUST':
          description = `Penyesuaian stok: ${transaction.items.length} item(s)`
          type = 'adjustment'
          break
        default:
          description = `Transaksi: ${transaction.referenceNumber}`
      }

      return {
        id: transaction.id,
        type,
        description,
        timestamp: transaction.createdAt,
        user: 'Store Owner',
        referenceNumber: transaction.referenceNumber
      }
    })

  } catch (error) {
    console.error('Error getting demo recent activity:', error)
    return []
  }
}

// Calculate profit from demo transactions
export function getDemoProfitData() {
  if (typeof window === 'undefined') {
    return {
      totalProfit: 0,
      profitByProduct: [],
      profitByCategory: [],
      monthlyProfit: []
    }
  }

  try {
    const products = getDemoProducts()
    const transactions = getDemoTransactions()

    // Calculate profit for each product based on transactions
    const profitByProduct = products.map(product => {
      // Find OUT transactions for this product
      const outTransactions = transactions.transactions.filter(t => 
        t.type === 'OUT' && t.items.some(item => item.productId === product.id)
      )

      let totalSold = 0
      let totalRevenue = 0

      outTransactions.forEach(transaction => {
        const productItems = transaction.items.filter(item => item.productId === product.id)
        productItems.forEach(item => {
          totalSold += item.quantity
          totalRevenue += (item.unitPrice || product.sellingPrice || 0) * item.quantity
        })
      })

      const totalCost = totalSold * (product.purchasePrice || 0)
      const totalProfit = totalRevenue - totalCost
      const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        brand: product.brand,
        purchasePrice: product.purchasePrice || 0,
        sellingPrice: product.sellingPrice || 0,
        profitAmount: (product.sellingPrice || 0) - (product.purchasePrice || 0),
        profitPercentage: product.purchasePrice > 0 ? 
          (((product.sellingPrice || 0) - (product.purchasePrice || 0)) / (product.purchasePrice || 0)) * 100 : 0,
        currentStock: product.currentStock || 0,
        totalSold,
        totalProfit,
        totalRevenue
      }
    })

    // Calculate profit by category
    const categoryMap = {}
    profitByProduct.forEach(product => {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = {
          category: product.category,
          totalProducts: 0,
          totalProfit: 0,
          totalSold: 0,
          totalRevenue: 0
        }
      }
      categoryMap[product.category].totalProducts++
      categoryMap[product.category].totalProfit += product.totalProfit
      categoryMap[product.category].totalSold += product.totalSold
      categoryMap[product.category].totalRevenue += product.totalRevenue
    })

    const profitByCategory = Object.values(categoryMap)

    // Calculate monthly profit (last 6 months)
    const monthlyProfit = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1)
      const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      
      // Filter transactions for this month
      const monthTransactions = transactions.transactions.filter(t => {
        const txnDate = new Date(t.transactionDate)
        return txnDate >= date && txnDate < nextMonth && t.type === 'OUT'
      })

      let monthlyTotalProfit = 0
      let monthlyTotalRevenue = 0

      monthTransactions.forEach(transaction => {
        transaction.items.forEach(item => {
          const product = products.find(p => p.id === item.productId)
          if (product) {
            const revenue = (item.unitPrice || product.sellingPrice || 0) * item.quantity
            const cost = (product.purchasePrice || 0) * item.quantity
            monthlyTotalProfit += revenue - cost
            monthlyTotalRevenue += revenue
          }
        })
      })

      monthlyProfit.push({
        month: monthName,
        date: date.toISOString(),
        totalProfit: monthlyTotalProfit,
        totalSales: monthlyTotalRevenue,
        profitMargin: monthlyTotalRevenue > 0 ? (monthlyTotalProfit / monthlyTotalRevenue) * 100 : 0
      })
    }

    const totalProfit = profitByProduct.reduce((sum, product) => sum + product.totalProfit, 0)

    return {
      totalProfit,
      profitByProduct: profitByProduct.sort((a, b) => b.totalProfit - a.totalProfit),
      profitByCategory: profitByCategory.sort((a, b) => b.totalProfit - a.totalProfit),
      monthlyProfit
    }

  } catch (error) {
    console.error('Error calculating demo profit data:', error)
    return {
      totalProfit: 0,
      profitByProduct: [],
      profitByCategory: [],
      monthlyProfit: []
    }
  }
}

// Get real-time dashboard stats from demo data (updated with profit)
export function getDemoDashboardStatsWithProfit() {
  const basicStats = getDemoDashboardStats()
  const profitData = getDemoProfitData()
  
  return {
    ...basicStats,
    totalProfit: profitData.totalProfit
  }
}

// Get complete dashboard data
export function getDemoDashboardData() {
  return {
    stats: getDemoDashboardStatsWithProfit(),
    lowStockAlerts: getDemoLowStockAlerts(),
    activity: getDemoRecentActivity(),
    profit: getDemoProfitData()
  }
}