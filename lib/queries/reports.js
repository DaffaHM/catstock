import { prisma } from '@/lib/prisma'
import { StockCalculationEngine } from '@/lib/engines/stock-calculation'

/**
 * Get comprehensive stock report data with filtering and pagination
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Stock report data with pagination
 */
export async function getStockReportData(filters = {}) {
  const {
    search,
    category,
    brand,
    lowStockOnly = false,
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 50
  } = filters

  const skip = (page - 1) * limit

  // Build where clause for products
  const where = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (category) {
    where.category = category
  }

  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' }
  }

  // Get products with their latest stock movements
  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      sku: true,
      brand: true,
      name: true,
      category: true,
      size: true,
      unit: true,
      minimumStock: true,
      sellingPrice: true,
      purchasePrice: true,
      createdAt: true,
      stockMovements: {
        select: {
          quantityAfter: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit
  })

  // Transform products with stock information
  let stockReport = products.map(product => {
    const currentStock = product.stockMovements[0]?.quantityAfter || 0
    const lastMovementDate = product.stockMovements[0]?.createdAt || null
    const isLowStock = product.minimumStock ? currentStock <= product.minimumStock : false
    const stockValue = currentStock * (product.sellingPrice || 0)

    return {
      id: product.id,
      sku: product.sku,
      brand: product.brand,
      name: product.name,
      category: product.category,
      size: product.size,
      unit: product.unit,
      currentStock,
      minimumStock: product.minimumStock,
      isLowStock,
      stockValue,
      sellingPrice: product.sellingPrice,
      purchasePrice: product.purchasePrice,
      lastMovementDate,
      createdAt: product.createdAt
    }
  })

  // Apply low stock filter if requested
  if (lowStockOnly) {
    stockReport = stockReport.filter(item => item.isLowStock)
  }

  // Get total count for pagination (with same filters)
  const totalCount = await prisma.product.count({ where })

  // Get summary statistics
  const summary = await getStockReportSummary(filters)

  return {
    products: stockReport,
    pagination: {
      page,
      limit,
      totalCount: lowStockOnly ? stockReport.length : totalCount,
      totalPages: Math.ceil((lowStockOnly ? stockReport.length : totalCount) / limit),
      hasNextPage: page < Math.ceil((lowStockOnly ? stockReport.length : totalCount) / limit),
      hasPreviousPage: page > 1
    },
    summary
  }
}

/**
 * Get stock report summary statistics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Summary statistics
 */
export async function getStockReportSummary(filters = {}) {
  const { category, brand, search } = filters

  // Build where clause
  const where = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (category) {
    where.category = category
  }

  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' }
  }

  // Get all products matching filters with stock data
  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      minimumStock: true,
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

  // Calculate summary statistics
  let totalProducts = products.length
  let totalStockValue = 0
  let lowStockCount = 0
  let outOfStockCount = 0
  let totalStockQuantity = 0

  products.forEach(product => {
    const currentStock = product.stockMovements[0]?.quantityAfter || 0
    const stockValue = currentStock * (product.sellingPrice || 0)
    
    totalStockQuantity += currentStock
    totalStockValue += stockValue

    if (currentStock === 0) {
      outOfStockCount++
    } else if (product.minimumStock && currentStock <= product.minimumStock) {
      lowStockCount++
    }
  })

  return {
    totalProducts,
    totalStockQuantity,
    totalStockValue,
    lowStockCount,
    outOfStockCount,
    inStockCount: totalProducts - outOfStockCount
  }
}

/**
 * Get stock report data for CSV export
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Stock report data formatted for CSV
 */
export async function getStockReportForExport(filters = {}) {
  const { search, category, brand, lowStockOnly = false } = filters

  // Build where clause
  const where = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (category) {
    where.category = category
  }

  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' }
  }

  // Get all products matching filters
  const products = await prisma.product.findMany({
    where,
    select: {
      sku: true,
      brand: true,
      name: true,
      category: true,
      size: true,
      unit: true,
      minimumStock: true,
      sellingPrice: true,
      purchasePrice: true,
      stockMovements: {
        select: {
          quantityAfter: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { name: 'asc' }
  })

  // Transform and filter for export
  let exportData = products.map(product => {
    const currentStock = product.stockMovements[0]?.quantityAfter || 0
    const isLowStock = product.minimumStock ? currentStock <= product.minimumStock : false
    const stockValue = currentStock * (product.sellingPrice || 0)
    const lastMovementDate = product.stockMovements[0]?.createdAt

    return {
      'SKU': product.sku,
      'Brand': product.brand,
      'Product Name': product.name,
      'Category': product.category,
      'Size': product.size,
      'Unit': product.unit,
      'Current Stock': currentStock,
      'Minimum Stock': product.minimumStock || '',
      'Stock Status': currentStock === 0 ? 'Out of Stock' : 
                     isLowStock ? 'Low Stock' : 'In Stock',
      'Purchase Price': product.purchasePrice || '',
      'Selling Price': product.sellingPrice || '',
      'Stock Value': stockValue.toFixed(2),
      'Last Movement': lastMovementDate ? lastMovementDate.toISOString().split('T')[0] : '',
      'Export Date': new Date().toISOString().split('T')[0]
    }
  })

  // Apply low stock filter if requested
  if (lowStockOnly) {
    exportData = exportData.filter(item => 
      item['Stock Status'] === 'Low Stock' || item['Stock Status'] === 'Out of Stock'
    )
  }

  return exportData
}

/**
 * Get available filter options for the stock report
 * @returns {Promise<Object>} Available categories and brands
 */
export async function getStockReportFilterOptions() {
  const [categories, brands] = await Promise.all([
    prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    }),
    prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' }
    })
  ])

  return {
    categories: categories.map(c => c.category),
    brands: brands.map(b => b.brand)
  }
}

/**
 * Get real-time stock levels for dashboard widgets
 * @returns {Promise<Object>} Real-time stock statistics
 */
export async function getRealTimeStockStats() {
  return await StockCalculationEngine.getStockSummary({
    includeZeroStock: true,
    onlyLowStock: false
  })
}

/**
 * Get sales and purchase summary report data
 * @param {Object} filters - Filter options including date range
 * @returns {Promise<Object>} Sales and purchase summary data
 */
export async function getSalesPurchaseSummaryData(filters = {}) {
  const {
    startDate,
    endDate,
    category,
    brand,
    supplierId,
    groupBy = 'month', // 'day', 'week', 'month', 'year'
    page = 1,
    limit = 50
  } = filters

  const skip = (page - 1) * limit

  // Build date filter
  const dateFilter = {}
  if (startDate) {
    dateFilter.gte = new Date(startDate)
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate)
  }

  // Build where clause for transactions
  const where = {
    ...(Object.keys(dateFilter).length > 0 && { transactionDate: dateFilter }),
    type: { in: ['IN', 'OUT'] }, // Only sales (OUT) and purchases (IN)
    ...(supplierId && { supplierId })
  }

  // Build product filter for items
  const productWhere = {}
  if (category) {
    productWhere.category = category
  }
  if (brand) {
    productWhere.brand = { contains: brand, mode: 'insensitive' }
  }

  // Get transactions with items and product details
  const transactions = await prisma.stockTransaction.findMany({
    where,
    include: {
      items: {
        where: Object.keys(productWhere).length > 0 ? {
          product: productWhere
        } : undefined,
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              brand: true,
              name: true,
              category: true,
              size: true,
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
    orderBy: { transactionDate: 'desc' },
    skip,
    take: limit
  })

  // Process transactions for summary data
  const summaryData = []
  const salesByPeriod = new Map()
  const purchasesByPeriod = new Map()
  let totalSalesValue = 0
  let totalPurchaseValue = 0
  let totalSalesQuantity = 0
  let totalPurchaseQuantity = 0
  let totalGrossProfit = 0

  transactions.forEach(transaction => {
    const periodKey = formatPeriodKey(transaction.transactionDate, groupBy)
    
    transaction.items.forEach(item => {
      const quantity = item.quantity
      const unitCost = item.unitCost || 0
      const unitPrice = item.unitPrice || 0
      
      if (transaction.type === 'OUT') {
        // Sales transaction
        const salesValue = quantity * unitPrice
        totalSalesValue += salesValue
        totalSalesQuantity += quantity
        
        // Calculate gross profit if we have cost data
        if (unitCost > 0 && unitPrice > 0) {
          const grossProfit = (unitPrice - unitCost) * quantity
          totalGrossProfit += grossProfit
        }
        
        // Group by period
        if (!salesByPeriod.has(periodKey)) {
          salesByPeriod.set(periodKey, {
            period: periodKey,
            salesValue: 0,
            salesQuantity: 0,
            transactionCount: 0
          })
        }
        const periodData = salesByPeriod.get(periodKey)
        periodData.salesValue += salesValue
        periodData.salesQuantity += quantity
        periodData.transactionCount += 1
        
      } else if (transaction.type === 'IN') {
        // Purchase transaction
        const purchaseValue = quantity * unitCost
        totalPurchaseValue += purchaseValue
        totalPurchaseQuantity += quantity
        
        // Group by period
        if (!purchasesByPeriod.has(periodKey)) {
          purchasesByPeriod.set(periodKey, {
            period: periodKey,
            purchaseValue: 0,
            purchaseQuantity: 0,
            transactionCount: 0
          })
        }
        const periodData = purchasesByPeriod.get(periodKey)
        periodData.purchaseValue += purchaseValue
        periodData.purchaseQuantity += quantity
        periodData.transactionCount += 1
      }
    })
  })

  // Combine sales and purchase data by period
  const allPeriods = new Set([...salesByPeriod.keys(), ...purchasesByPeriod.keys()])
  
  allPeriods.forEach(period => {
    const salesData = salesByPeriod.get(period) || { salesValue: 0, salesQuantity: 0, transactionCount: 0 }
    const purchaseData = purchasesByPeriod.get(period) || { purchaseValue: 0, purchaseQuantity: 0, transactionCount: 0 }
    
    summaryData.push({
      period,
      salesValue: salesData.salesValue,
      salesQuantity: salesData.salesQuantity,
      salesTransactions: salesData.transactionCount,
      purchaseValue: purchaseData.purchaseValue,
      purchaseQuantity: purchaseData.purchaseQuantity,
      purchaseTransactions: purchaseData.transactionCount,
      netValue: salesData.salesValue - purchaseData.purchaseValue
    })
  })

  // Sort by period
  summaryData.sort((a, b) => b.period.localeCompare(a.period))

  // Get total count for pagination
  const totalCount = await prisma.stockTransaction.count({ where })

  // Calculate summary statistics
  const summary = {
    totalSalesValue,
    totalPurchaseValue,
    totalSalesQuantity,
    totalPurchaseQuantity,
    totalGrossProfit,
    netProfit: totalSalesValue - totalPurchaseValue,
    grossProfitMargin: totalSalesValue > 0 ? (totalGrossProfit / totalSalesValue) * 100 : 0,
    netProfitMargin: totalSalesValue > 0 ? ((totalSalesValue - totalPurchaseValue) / totalSalesValue) * 100 : 0,
    averageTransactionValue: transactions.length > 0 ? totalSalesValue / transactions.filter(t => t.type === 'OUT').length : 0
  }

  return {
    summaryData,
    summary,
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

/**
 * Get detailed transaction data for sales and purchase reports
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Detailed transaction data
 */
export async function getDetailedTransactionData(filters = {}) {
  const {
    startDate,
    endDate,
    category,
    brand,
    supplierId,
    transactionType, // 'IN', 'OUT', or null for both
    page = 1,
    limit = 100
  } = filters

  const skip = (page - 1) * limit

  // Build date filter
  const dateFilter = {}
  if (startDate) {
    dateFilter.gte = new Date(startDate)
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate)
  }

  // Build where clause
  const where = {
    ...(Object.keys(dateFilter).length > 0 && { transactionDate: dateFilter }),
    ...(transactionType && { type: transactionType }),
    ...(supplierId && { supplierId })
  }

  // Build product filter
  const productWhere = {}
  if (category) {
    productWhere.category = category
  }
  if (brand) {
    productWhere.brand = { contains: brand, mode: 'insensitive' }
  }

  const transactions = await prisma.stockTransaction.findMany({
    where,
    include: {
      items: {
        where: Object.keys(productWhere).length > 0 ? {
          product: productWhere
        } : undefined,
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              brand: true,
              name: true,
              category: true,
              size: true,
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
    orderBy: { transactionDate: 'desc' },
    skip,
    take: limit
  })

  // Transform for detailed view
  const detailedData = []
  
  transactions.forEach(transaction => {
    transaction.items.forEach(item => {
      const quantity = item.quantity
      const unitCost = item.unitCost || 0
      const unitPrice = item.unitPrice || 0
      const totalValue = transaction.type === 'OUT' ? quantity * unitPrice : quantity * unitCost
      const grossProfit = transaction.type === 'OUT' && unitCost > 0 && unitPrice > 0 
        ? (unitPrice - unitCost) * quantity 
        : null

      detailedData.push({
        transactionId: transaction.id,
        referenceNumber: transaction.referenceNumber,
        date: transaction.transactionDate,
        type: transaction.type,
        supplier: transaction.supplier?.name || null,
        product: {
          sku: item.product.sku,
          brand: item.product.brand,
          name: item.product.name,
          category: item.product.category,
          size: item.product.size,
          unit: item.product.unit
        },
        quantity,
        unitCost,
        unitPrice,
        totalValue,
        grossProfit,
        notes: transaction.notes
      })
    })
  })

  return detailedData
}

/**
 * Get sales and purchase summary for CSV export
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Export data
 */
export async function getSalesPurchaseSummaryForExport(filters = {}) {
  const detailedData = await getDetailedTransactionData({
    ...filters,
    page: 1,
    limit: 10000 // Large limit for export
  })

  return detailedData.map(item => ({
    'Reference Number': item.referenceNumber,
    'Date': item.date.toISOString().split('T')[0],
    'Type': item.type === 'OUT' ? 'Sale' : 'Purchase',
    'Supplier': item.supplier || '',
    'Product SKU': item.product.sku,
    'Product Brand': item.product.brand,
    'Product Name': item.product.name,
    'Category': item.product.category,
    'Size': item.product.size,
    'Unit': item.product.unit,
    'Quantity': item.quantity,
    'Unit Cost': item.unitCost || '',
    'Unit Price': item.unitPrice || '',
    'Total Value': item.totalValue.toFixed(2),
    'Gross Profit': item.grossProfit ? item.grossProfit.toFixed(2) : '',
    'Notes': item.notes || '',
    'Export Date': new Date().toISOString().split('T')[0]
  }))
}

/**
 * Helper function to format period keys for grouping
 * @param {Date} date - Transaction date
 * @param {string} groupBy - Grouping period
 * @returns {string} Formatted period key
 */
function formatPeriodKey(date, groupBy) {
  const d = new Date(date)
  
  switch (groupBy) {
    case 'day':
      return d.toISOString().split('T')[0] // YYYY-MM-DD
    case 'week':
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      return `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
    case 'year':
      return String(d.getFullYear()) // YYYY
    default:
      return d.toISOString().split('T')[0]
  }
}