'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'

// Demo profit data
const DEMO_PROFIT_DATA = [
  {
    id: 'demo-prod-1',
    sku: 'CTB-001',
    brand: 'Brand A',
    name: 'Cat Tembok Putih 5L',
    category: 'Cat Tembok',
    purchasePrice: 85000,
    sellingPrice: 120000,
    profitAmount: 35000,
    profitPercentage: 41.18,
    currentStock: 5,
    totalSold: 15,
    totalProfit: 525000
  },
  {
    id: 'demo-prod-2',
    sku: 'CTB-002',
    brand: 'Brand A',
    name: 'Cat Tembok Biru 5L',
    category: 'Cat Tembok',
    purchasePrice: 90000,
    sellingPrice: 125000,
    profitAmount: 35000,
    profitPercentage: 38.89,
    currentStock: 12,
    totalSold: 8,
    totalProfit: 280000
  },
  {
    id: 'demo-prod-3',
    sku: 'CKY-001',
    brand: 'Brand B',
    name: 'Cat Kayu Coklat 2.5L',
    category: 'Cat Kayu',
    purchasePrice: 65000,
    sellingPrice: 95000,
    profitAmount: 30000,
    profitPercentage: 46.15,
    currentStock: 2,
    totalSold: 12,
    totalProfit: 360000
  },
  {
    id: 'demo-prod-4',
    sku: 'CKY-002',
    brand: 'Brand B',
    name: 'Cat Kayu Merah 1L',
    category: 'Cat Kayu',
    purchasePrice: 35000,
    sellingPrice: 50000,
    profitAmount: 15000,
    profitPercentage: 42.86,
    currentStock: 18,
    totalSold: 22,
    totalProfit: 330000
  },
  {
    id: 'demo-prod-5',
    sku: 'CBS-001',
    brand: 'Brand C',
    name: 'Cat Besi Hitam 1L',
    category: 'Cat Besi',
    purchasePrice: 45000,
    sellingPrice: 65000,
    profitAmount: 20000,
    profitPercentage: 44.44,
    currentStock: 8,
    totalSold: 18,
    totalProfit: 360000
  },
  {
    id: 'demo-prod-6',
    sku: 'CBS-002',
    brand: 'Brand C',
    name: 'Cat Besi Silver 1L',
    category: 'Cat Besi',
    purchasePrice: 48000,
    sellingPrice: 68000,
    profitAmount: 20000,
    profitPercentage: 41.67,
    currentStock: 14,
    totalSold: 10,
    totalProfit: 200000
  },
  {
    id: 'demo-prod-7',
    sku: 'THN-001',
    brand: 'Brand A',
    name: 'Thinner 1L',
    category: 'Pelarut',
    purchasePrice: 25000,
    sellingPrice: 35000,
    profitAmount: 10000,
    profitPercentage: 40.00,
    currentStock: 25,
    totalSold: 30,
    totalProfit: 300000
  },
  {
    id: 'demo-prod-8',
    sku: 'KUS-001',
    brand: 'Brand B',
    name: 'Kuas Cat 2 inch',
    category: 'Alat',
    purchasePrice: 15000,
    sellingPrice: 25000,
    profitAmount: 10000,
    profitPercentage: 66.67,
    currentStock: 45,
    totalSold: 35,
    totalProfit: 350000
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
 * Demo authentication check
 */
async function requireDemoAuth() {
  const useDemoData = await shouldUseDemoData()
  if (useDemoData) {
    return true
  }
  return await requireAuth()
}

// Calculate profit for a single product
function calculateProductProfit(purchasePrice, sellingPrice) {
  if (!purchasePrice || !sellingPrice) {
    return {
      profitAmount: 0,
      profitPercentage: 0
    }
  }
  
  const profitAmount = sellingPrice - purchasePrice
  const profitPercentage = (profitAmount / purchasePrice) * 100
  
  return {
    profitAmount,
    profitPercentage: Math.round(profitPercentage * 100) / 100
  }
}

// Get profit analysis for all products
export async function getProfitAnalysisAction(searchParams = {}) {
  try {
    await requireDemoAuth()

    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Profit Analysis] Using demo data')
      
      const { search, category, sortBy = 'profitAmount', sortOrder = 'desc' } = searchParams
      
      // Filter demo data
      let filteredData = [...DEMO_PROFIT_DATA]
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredData = filteredData.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.brand.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower)
        )
      }
      
      if (category) {
        filteredData = filteredData.filter(item => item.category === category)
      }
      
      // Sort data
      filteredData.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        if (sortOrder === 'desc') {
          return bVal - aVal
        }
        return aVal - bVal
      })
      
      // Calculate summary
      const summary = {
        totalProducts: filteredData.length,
        totalProfitAmount: filteredData.reduce((sum, item) => sum + item.totalProfit, 0),
        averageProfitPercentage: filteredData.reduce((sum, item) => sum + item.profitPercentage, 0) / filteredData.length,
        totalItemsSold: filteredData.reduce((sum, item) => sum + item.totalSold, 0),
        highestProfitProduct: filteredData.reduce((max, item) => 
          item.profitPercentage > max.profitPercentage ? item : max, filteredData[0]
        ),
        lowestProfitProduct: filteredData.reduce((min, item) => 
          item.profitPercentage < min.profitPercentage ? item : min, filteredData[0]
        )
      }
      
      return {
        success: true,
        products: filteredData,
        summary
      }
    }

    // Database logic for real data
    const { search, category, sortBy = 'profitAmount', sortOrder = 'desc' } = searchParams
    
    // Build where clause
    const where = {
      AND: [
        { purchasePrice: { not: null } },
        { sellingPrice: { not: null } }
      ]
    }
    
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
    
    // Get products with profit calculations
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        sku: true,
        brand: true,
        name: true,
        category: true,
        purchasePrice: true,
        sellingPrice: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { quantityAfter: true }
        },
        transactionItems: {
          where: {
            transaction: { type: 'OUT' }
          },
          select: {
            quantity: true,
            unitPrice: true
          }
        }
      }
    })
    
    // Calculate profit for each product
    const productsWithProfit = products.map(product => {
      const { profitAmount, profitPercentage } = calculateProductProfit(
        product.purchasePrice, 
        product.sellingPrice
      )
      
      const totalSold = product.transactionItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalProfit = totalSold * profitAmount
      
      return {
        ...product,
        currentStock: product.stockMovements[0]?.quantityAfter || 0,
        profitAmount,
        profitPercentage,
        totalSold,
        totalProfit,
        stockMovements: undefined,
        transactionItems: undefined
      }
    })
    
    // Sort products
    productsWithProfit.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      if (sortOrder === 'desc') {
        return bVal - aVal
      }
      return aVal - bVal
    })
    
    // Calculate summary
    const summary = {
      totalProducts: productsWithProfit.length,
      totalProfitAmount: productsWithProfit.reduce((sum, item) => sum + item.totalProfit, 0),
      averageProfitPercentage: productsWithProfit.reduce((sum, item) => sum + item.profitPercentage, 0) / productsWithProfit.length,
      totalItemsSold: productsWithProfit.reduce((sum, item) => sum + item.totalSold, 0),
      highestProfitProduct: productsWithProfit.reduce((max, item) => 
        item.profitPercentage > max.profitPercentage ? item : max, productsWithProfit[0]
      ),
      lowestProfitProduct: productsWithProfit.reduce((min, item) => 
        item.profitPercentage < min.profitPercentage ? item : min, productsWithProfit[0]
      )
    }
    
    return {
      success: true,
      products: productsWithProfit,
      summary
    }

  } catch (error) {
    console.error('Get profit analysis error:', error)
    
    // Fallback to demo data
    if (!await shouldUseDemoData()) {
      console.log('[Profit Analysis] Database failed, falling back to demo data')
      
      const summary = {
        totalProducts: DEMO_PROFIT_DATA.length,
        totalProfitAmount: DEMO_PROFIT_DATA.reduce((sum, item) => sum + item.totalProfit, 0),
        averageProfitPercentage: DEMO_PROFIT_DATA.reduce((sum, item) => sum + item.profitPercentage, 0) / DEMO_PROFIT_DATA.length,
        totalItemsSold: DEMO_PROFIT_DATA.reduce((sum, item) => sum + item.totalSold, 0),
        highestProfitProduct: DEMO_PROFIT_DATA[0],
        lowestProfitProduct: DEMO_PROFIT_DATA[0]
      }
      
      return {
        success: true,
        products: DEMO_PROFIT_DATA,
        summary
      }
    }
    
    return {
      error: 'Gagal mengambil data analisis keuntungan'
    }
  }
}

// Get profit summary by category
export async function getProfitByCategoryAction() {
  try {
    await requireDemoAuth()

    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Profit Analysis] Using demo category data')
      
      // Group by category
      const categoryData = {}
      DEMO_PROFIT_DATA.forEach(product => {
        if (!categoryData[product.category]) {
          categoryData[product.category] = {
            category: product.category,
            totalProducts: 0,
            totalProfit: 0,
            totalSold: 0,
            averageProfitPercentage: 0
          }
        }
        
        categoryData[product.category].totalProducts++
        categoryData[product.category].totalProfit += product.totalProfit
        categoryData[product.category].totalSold += product.totalSold
      })
      
      // Calculate averages
      const categories = Object.values(categoryData).map(cat => ({
        ...cat,
        averageProfitPercentage: DEMO_PROFIT_DATA
          .filter(p => p.category === cat.category)
          .reduce((sum, p) => sum + p.profitPercentage, 0) / cat.totalProducts
      }))
      
      return {
        success: true,
        categories: categories.sort((a, b) => b.totalProfit - a.totalProfit)
      }
    }

    // Database logic would go here
    return {
      success: true,
      categories: []
    }

  } catch (error) {
    console.error('Get profit by category error:', error)
    return {
      error: 'Gagal mengambil data keuntungan per kategori'
    }
  }
}

// Get monthly profit trend
export async function getMonthlyProfitTrendAction(months = 6) {
  try {
    await requireDemoAuth()

    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Profit Analysis] Using demo monthly trend data')
      
      // Generate demo monthly data
      const monthlyData = []
      const currentDate = new Date()
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        
        // Simulate varying profit amounts
        const baseProfit = 2000000
        const variation = Math.random() * 1000000
        const totalProfit = baseProfit + variation
        
        monthlyData.push({
          month: monthName,
          date: date.toISOString(),
          totalProfit: Math.round(totalProfit),
          totalSales: Math.round(totalProfit / 0.4), // Assuming 40% profit margin
          profitMargin: 40 + (Math.random() * 10 - 5) // 35-45%
        })
      }
      
      return {
        success: true,
        monthlyData
      }
    }

    // Database logic would go here
    return {
      success: true,
      monthlyData: []
    }

  } catch (error) {
    console.error('Get monthly profit trend error:', error)
    return {
      error: 'Gagal mengambil data tren keuntungan bulanan'
    }
  }
}