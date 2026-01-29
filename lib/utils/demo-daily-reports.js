'use client'

import { getDemoProducts } from './demo-products'
import { getDemoTransactions } from './demo-transactions'
import { formatRupiah } from './currency'

// Get daily profit and sales data from demo transactions
export function getDailyReportsData(dateRange = 30) {
  if (typeof window === 'undefined') {
    return {
      dailyData: [],
      summary: {
        totalDays: 0,
        totalSales: 0,
        totalProfit: 0,
        averageDailySales: 0,
        averageDailyProfit: 0,
        bestDay: null,
        worstDay: null
      }
    }
  }

  try {
    console.log('[Daily Reports] Fetching fresh data from localStorage...')
    const products = getDemoProducts()
    const transactions = getDemoTransactions()

    console.log('[Daily Reports] Data loaded:', {
      productsCount: products.length,
      transactionsCount: transactions.transactions.length,
      dateRange: dateRange
    })

    // Generate daily data for the specified range
    const dailyData = []
    // Use current date: January 29, 2026 (set time to noon to avoid timezone issues)
    const currentDate = new Date('2026-01-29T12:00:00.000Z')
    
    for (let i = 0; i < dateRange; i++) {
      const date = new Date(currentDate)
      date.setUTCDate(date.getUTCDate() - i)
      date.setUTCHours(0, 0, 0, 0)
      
      const nextDay = new Date(date)
      nextDay.setUTCDate(nextDay.getUTCDate() + 1)
      
      // Filter transactions for this day
      const dayTransactions = transactions.transactions.filter(t => {
        const txnDate = new Date(t.transactionDate)
        return txnDate >= date && txnDate < nextDay && t.type === 'OUT'
      })

      let dailySales = 0
      let dailyProfit = 0
      let itemsSold = 0
      let transactionCount = dayTransactions.length

      dayTransactions.forEach(transaction => {
        transaction.items.forEach(item => {
          const product = products.find(p => p.id === item.productId)
          if (product) {
            const revenue = (item.unitPrice || product.sellingPrice || 0) * item.quantity
            const cost = (product.purchasePrice || 0) * item.quantity
            dailySales += revenue
            dailyProfit += revenue - cost
            itemsSold += item.quantity
          }
        })
      })

      const profitMargin = dailySales > 0 ? (dailyProfit / dailySales) * 100 : 0

      dailyData.push({
        date: date.toISOString().split('T')[0],
        dateFormatted: date.toLocaleDateString('id-ID', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        dayName: date.toLocaleDateString('id-ID', { weekday: 'long' }),
        sales: dailySales,
        profit: dailyProfit,
        profitMargin,
        itemsSold,
        transactionCount,
        averageTransactionValue: transactionCount > 0 ? dailySales / transactionCount : 0
      })
    }

    // Calculate summary statistics
    const totalSales = dailyData.reduce((sum, day) => sum + day.sales, 0)
    const totalProfit = dailyData.reduce((sum, day) => sum + day.profit, 0)
    const daysWithSales = dailyData.filter(day => day.sales > 0)
    
    const averageDailySales = daysWithSales.length > 0 ? totalSales / daysWithSales.length : 0
    const averageDailyProfit = daysWithSales.length > 0 ? totalProfit / daysWithSales.length : 0

    // Find best and worst performing days
    const bestDay = dailyData.reduce((best, day) => 
      day.sales > (best?.sales || 0) ? day : best, null)
    
    const worstDay = daysWithSales.reduce((worst, day) => 
      day.sales < (worst?.sales || Infinity) ? day : worst, null)

    const summary = {
      totalDays: dateRange,
      daysWithSales: daysWithSales.length,
      totalSales,
      totalProfit,
      averageDailySales,
      averageDailyProfit,
      bestDay,
      worstDay,
      totalItemsSold: dailyData.reduce((sum, day) => sum + day.itemsSold, 0),
      totalTransactions: dailyData.reduce((sum, day) => sum + day.transactionCount, 0)
    }

    console.log('[Daily Reports] Calculated summary:', {
      totalSales: summary.totalSales,
      totalProfit: summary.totalProfit,
      daysWithSales: summary.daysWithSales,
      totalTransactions: summary.totalTransactions
    })

    return {
      dailyData: dailyData, // Already in correct order (most recent first)
      summary
    }

  } catch (error) {
    console.error('Error calculating daily reports data:', error)
    return {
      dailyData: [],
      summary: {
        totalDays: 0,
        totalSales: 0,
        totalProfit: 0,
        averageDailySales: 0,
        averageDailyProfit: 0,
        bestDay: null,
        worstDay: null
      }
    }
  }
}

// Get weekly summary data
export function getWeeklyReportsData() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const products = getDemoProducts()
    const transactions = getDemoTransactions()

    const weeklyData = []
    // Use current date: January 29, 2026 (set time to noon to avoid timezone issues)
    const currentDate = new Date('2026-01-29T12:00:00.000Z')
    
    // Get last 8 weeks
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(currentDate)
      weekStart.setUTCDate(weekStart.getUTCDate() - (weekStart.getUTCDay() + 7 * i))
      weekStart.setUTCHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)
      weekEnd.setUTCHours(23, 59, 59, 999)
      
      // Filter transactions for this week
      const weekTransactions = transactions.transactions.filter(t => {
        const txnDate = new Date(t.transactionDate)
        return txnDate >= weekStart && txnDate <= weekEnd && t.type === 'OUT'
      })

      let weeklySales = 0
      let weeklyProfit = 0
      let itemsSold = 0

      weekTransactions.forEach(transaction => {
        transaction.items.forEach(item => {
          const product = products.find(p => p.id === item.productId)
          if (product) {
            const revenue = (item.unitPrice || product.sellingPrice || 0) * item.quantity
            const cost = (product.purchasePrice || 0) * item.quantity
            weeklySales += revenue
            weeklyProfit += revenue - cost
            itemsSold += item.quantity
          }
        })
      })

      weeklyData.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        weekLabel: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
        sales: weeklySales,
        profit: weeklyProfit,
        profitMargin: weeklySales > 0 ? (weeklyProfit / weeklySales) * 100 : 0,
        itemsSold,
        transactionCount: weekTransactions.length
      })
    }

    return weeklyData // Already in correct order

  } catch (error) {
    console.error('Error calculating weekly reports data:', error)
    return []
  }
}

// Get monthly summary data
export function getMonthlyReportsData() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const products = getDemoProducts()
    const transactions = getDemoTransactions()

    const monthlyData = []
    // Use current date: January 29, 2026 (set time to noon to avoid timezone issues)
    const currentDate = new Date('2026-01-29T12:00:00.000Z')
    
    // Get last 6 months
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - i, 1)
      const monthEnd = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - i + 1, 0)
      monthEnd.setUTCHours(23, 59, 59, 999)
      
      // Filter transactions for this month
      const monthTransactions = transactions.transactions.filter(t => {
        const txnDate = new Date(t.transactionDate)
        return txnDate >= monthStart && txnDate <= monthEnd && t.type === 'OUT'
      })

      let monthlySales = 0
      let monthlyProfit = 0
      let itemsSold = 0

      monthTransactions.forEach(transaction => {
        transaction.items.forEach(item => {
          const product = products.find(p => p.id === item.productId)
          if (product) {
            const revenue = (item.unitPrice || product.sellingPrice || 0) * item.quantity
            const cost = (product.purchasePrice || 0) * item.quantity
            monthlySales += revenue
            monthlyProfit += revenue - cost
            itemsSold += item.quantity
          }
        })
      })

      monthlyData.push({
        month: monthStart.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        monthStart: monthStart.toISOString().split('T')[0],
        monthEnd: monthEnd.toISOString().split('T')[0],
        sales: monthlySales,
        profit: monthlyProfit,
        profitMargin: monthlySales > 0 ? (monthlyProfit / monthlySales) * 100 : 0,
        itemsSold,
        transactionCount: monthTransactions.length
      })
    }

    return monthlyData // Already in correct order

  } catch (error) {
    console.error('Error calculating monthly reports data:', error)
    return []
  }
}

// Get top selling products for a date range
export function getTopSellingProducts(dateRange = 30) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const products = getDemoProducts()
    const transactions = getDemoTransactions()

    // Use current date: January 29, 2026 (set time to noon to avoid timezone issues)
    const currentDate = new Date('2026-01-29T12:00:00.000Z')
    const startDate = new Date(currentDate)
    startDate.setDate(startDate.getDate() - dateRange)

    // Filter OUT transactions within date range
    const relevantTransactions = transactions.transactions.filter(t => {
      const txnDate = new Date(t.transactionDate)
      return txnDate >= startDate && txnDate <= currentDate && t.type === 'OUT'
    })

    // Calculate sales data for each product
    const productSales = {}

    relevantTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          if (!productSales[product.id]) {
            productSales[product.id] = {
              id: product.id,
              name: product.name,
              sku: product.sku,
              category: product.category,
              brand: product.brand,
              purchasePrice: product.purchasePrice || 0,
              sellingPrice: product.sellingPrice || 0,
              quantitySold: 0,
              totalRevenue: 0,
              totalProfit: 0,
              transactionCount: 0
            }
          }

          const revenue = (item.unitPrice || product.sellingPrice || 0) * item.quantity
          const cost = (product.purchasePrice || 0) * item.quantity

          productSales[product.id].quantitySold += item.quantity
          productSales[product.id].totalRevenue += revenue
          productSales[product.id].totalProfit += revenue - cost
          productSales[product.id].transactionCount++
        }
      })
    })

    // Convert to array and sort by quantity sold
    return Object.values(productSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10) // Top 10

  } catch (error) {
    console.error('Error calculating top selling products:', error)
    return []
  }
}