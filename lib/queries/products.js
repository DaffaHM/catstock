import { prisma } from '@/lib/prisma'

// Get current stock for a product
export async function getCurrentStock(productId) {
  const latestMovement = await prisma.stockMovement.findFirst({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    select: { quantityAfter: true }
  })
  
  return latestMovement?.quantityAfter || 0
}

// Get current stock for multiple products
export async function getCurrentStockBatch(productIds) {
  const movements = await prisma.stockMovement.findMany({
    where: { 
      productId: { in: productIds }
    },
    orderBy: { createdAt: 'desc' },
    distinct: ['productId'],
    select: { 
      productId: true, 
      quantityAfter: true 
    }
  })
  
  // Create a map of productId -> stock
  const stockMap = {}
  movements.forEach(movement => {
    stockMap[movement.productId] = movement.quantityAfter
  })
  
  // Fill in missing products with 0 stock
  productIds.forEach(id => {
    if (!(id in stockMap)) {
      stockMap[id] = 0
    }
  })
  
  return stockMap
}

// Get products with low stock (below minimum stock level)
export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: {
      minimumStock: { not: null }
    },
    select: {
      id: true,
      sku: true,
      brand: true,
      name: true,
      minimumStock: true,
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { quantityAfter: true }
      }
    }
  })
  
  // Filter products where current stock is below minimum
  return products.filter(product => {
    const currentStock = product.stockMovements[0]?.quantityAfter || 0
    return currentStock < product.minimumStock
  }).map(product => ({
    ...product,
    currentStock: product.stockMovements[0]?.quantityAfter || 0,
    stockMovements: undefined
  }))
}

// Get products with stock movements for reporting
export async function getProductsWithMovements(filters = {}) {
  const { 
    startDate, 
    endDate, 
    category, 
    brand,
    page = 1, 
    limit = 50 
  } = filters
  
  const skip = (page - 1) * limit
  
  const where = {}
  
  if (category) {
    where.category = category
  }
  
  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' }
  }
  
  // Build movement filter for date range
  const movementWhere = {}
  if (startDate || endDate) {
    movementWhere.createdAt = {}
    if (startDate) movementWhere.createdAt.gte = new Date(startDate)
    if (endDate) movementWhere.createdAt.lte = new Date(endDate)
  }
  
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
      purchasePrice: true,
      sellingPrice: true,
      minimumStock: true,
      stockMovements: {
        where: movementWhere,
        orderBy: { createdAt: 'desc' },
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
              type: true,
              transactionDate: true
            }
          }
        }
      }
    },
    skip,
    take: limit,
    orderBy: { name: 'asc' }
  })
  
  // Add current stock to each product
  return products.map(product => ({
    ...product,
    currentStock: product.stockMovements[0]?.quantityAfter || 0
  }))
}

// Get product stock card (transaction history)
export async function getProductStockCard(productId, filters = {}) {
  const { startDate, endDate, page = 1, limit = 50 } = filters
  const skip = (page - 1) * limit
  
  const where = { productId }
  
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }
  
  const [movements, totalCount] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        transaction: {
          select: {
            referenceNumber: true,
            type: true,
            transactionDate: true,
            supplier: {
              select: { name: true }
            },
            items: {
              where: { productId },
              select: {
                quantity: true,
                unitCost: true,
                unitPrice: true
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
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

// Get product statistics
export async function getProductStats() {
  const [
    totalProducts,
    totalCategories,
    totalBrands,
    lowStockCount
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    }).then(categories => categories.length),
    prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand']
    }).then(brands => brands.length),
    getLowStockProducts().then(products => products.length)
  ])
  
  return {
    totalProducts,
    totalCategories,
    totalBrands,
    lowStockCount
  }
}

// Search products with advanced filters
export async function searchProductsAdvanced(filters = {}) {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    lowStock,
    page = 1,
    limit = 50,
    sortBy = 'name',
    sortOrder = 'asc'
  } = filters
  
  const skip = (page - 1) * limit
  const where = {}
  
  // Text search
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  // Category filter
  if (category) {
    where.category = category
  }
  
  // Brand filter
  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' }
  }
  
  // Price range filter
  if (minPrice || maxPrice) {
    where.sellingPrice = {}
    if (minPrice) where.sellingPrice.gte = parseFloat(minPrice)
    if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice)
  }
  
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
      purchasePrice: true,
      sellingPrice: true,
      minimumStock: true,
      createdAt: true,
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { quantityAfter: true }
      }
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  })
  
  // Add current stock and apply stock filters
  let filteredProducts = products.map(product => ({
    ...product,
    currentStock: product.stockMovements[0]?.quantityAfter || 0,
    stockMovements: undefined
  }))
  
  // Apply stock-based filters
  if (inStock) {
    filteredProducts = filteredProducts.filter(p => p.currentStock > 0)
  }
  
  if (lowStock) {
    filteredProducts = filteredProducts.filter(p => 
      p.minimumStock && p.currentStock < p.minimumStock
    )
  }
  
  return filteredProducts
}

// Get products for CSV export
export async function getProductsForExport(filters = {}) {
  const where = {}
  
  if (filters.category) {
    where.category = filters.category
  }
  
  if (filters.brand) {
    where.brand = { contains: filters.brand, mode: 'insensitive' }
  }
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { brand: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } }
    ]
  }
  
  const products = await prisma.product.findMany({
    where,
    select: {
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
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { quantityAfter: true }
      }
    },
    orderBy: { name: 'asc' }
  })
  
  // Format for CSV export
  return products.map(product => ({
    SKU: product.sku,
    Brand: product.brand,
    Name: product.name,
    Category: product.category,
    Size: product.size,
    Unit: product.unit,
    'Purchase Price': product.purchasePrice || '',
    'Selling Price': product.sellingPrice || '',
    'Minimum Stock': product.minimumStock || '',
    'Current Stock': product.stockMovements[0]?.quantityAfter || 0,
    'Created Date': product.createdAt.toISOString().split('T')[0]
  }))
}