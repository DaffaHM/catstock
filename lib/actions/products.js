'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import { invalidateProductRelatedCache } from '@/lib/cache/dashboard-cache'
import { checkLowStock, generateReorderSuggestions } from '@/lib/services/NotificationManager'
import { recordPriceChange } from '@/lib/services/PriceHistoryManager'
import { 
  productSchema, 
  productUpdateSchema, 
  productSearchSchema,
  productIdSchema,
  validateProductData,
  validateProductUpdate,
  validateProductSearch
} from '@/lib/validations/product'

// Demo products data
const DEMO_PRODUCTS = [
  {
    id: 'demo-prod-1',
    sku: 'CTB-001',
    brand: 'Brand A',
    name: 'Cat Tembok Putih 5L',
    category: 'Cat Tembok',
    size: '5',
    unit: 'Liter',
    purchasePrice: 85000,
    sellingPrice: 120000,
    minimumStock: 10,
    currentStock: 5,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  {
    id: 'demo-prod-2',
    sku: 'CTB-002',
    brand: 'Brand A',
    name: 'Cat Tembok Biru 5L',
    category: 'Cat Tembok',
    size: '5',
    unit: 'Liter',
    purchasePrice: 90000,
    sellingPrice: 125000,
    minimumStock: 8,
    currentStock: 12,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString()
  },
  {
    id: 'demo-prod-3',
    sku: 'CKY-001',
    brand: 'Brand B',
    name: 'Cat Kayu Coklat 2.5L',
    category: 'Cat Kayu',
    size: '2.5',
    unit: 'Liter',
    purchasePrice: 65000,
    sellingPrice: 95000,
    minimumStock: 8,
    currentStock: 2,
    createdAt: new Date('2024-01-16').toISOString(),
    updatedAt: new Date('2024-01-19').toISOString()
  },
  {
    id: 'demo-prod-4',
    sku: 'CKY-002',
    brand: 'Brand B',
    name: 'Cat Kayu Merah 1L',
    category: 'Cat Kayu',
    size: '1',
    unit: 'Liter',
    purchasePrice: 35000,
    sellingPrice: 50000,
    minimumStock: 15,
    currentStock: 18,
    createdAt: new Date('2024-01-16').toISOString(),
    updatedAt: new Date('2024-01-21').toISOString()
  },
  {
    id: 'demo-prod-5',
    sku: 'CBS-001',
    brand: 'Brand C',
    name: 'Cat Besi Hitam 1L',
    category: 'Cat Besi',
    size: '1',
    unit: 'Liter',
    purchasePrice: 45000,
    sellingPrice: 65000,
    minimumStock: 12,
    currentStock: 8,
    createdAt: new Date('2024-01-17').toISOString(),
    updatedAt: new Date('2024-01-22').toISOString()
  },
  {
    id: 'demo-prod-6',
    sku: 'CBS-002',
    brand: 'Brand C',
    name: 'Cat Besi Silver 1L',
    category: 'Cat Besi',
    size: '1',
    unit: 'Liter',
    purchasePrice: 48000,
    sellingPrice: 68000,
    minimumStock: 10,
    currentStock: 14,
    createdAt: new Date('2024-01-17').toISOString(),
    updatedAt: new Date('2024-01-23').toISOString()
  },
  {
    id: 'demo-prod-7',
    sku: 'THN-001',
    brand: 'Brand A',
    name: 'Thinner 1L',
    category: 'Pelarut',
    size: '1',
    unit: 'Liter',
    purchasePrice: 25000,
    sellingPrice: 35000,
    minimumStock: 20,
    currentStock: 25,
    createdAt: new Date('2024-01-18').toISOString(),
    updatedAt: new Date('2024-01-24').toISOString()
  },
  {
    id: 'demo-prod-8',
    sku: 'KUS-001',
    brand: 'Brand B',
    name: 'Kuas Cat 2 inch',
    category: 'Alat',
    size: '2',
    unit: 'Inch',
    purchasePrice: 15000,
    sellingPrice: 25000,
    minimumStock: 30,
    currentStock: 45,
    createdAt: new Date('2024-01-18').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString()
  }
]

/**
 * Check if we should use demo data (when quick session is active)
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
    return true // Demo mode, always authenticated
  }
  
  // Use regular auth for database mode
  return await requireAuth()
}

// Create a new product
export async function createProductAction(prevState, formData) {
  try {
    // Require authentication
    await requireDemoAuth()

    // Extract and validate form data
    const rawData = {
      sku: formData.get('sku'),
      brand: formData.get('brand'),
      name: formData.get('name'),
      category: formData.get('category'),
      size: formData.get('size'),
      unit: formData.get('unit'),
      purchasePrice: formData.get('purchasePrice') || null,
      sellingPrice: formData.get('sellingPrice') || null,
      minimumStock: formData.get('minimumStock') || null
    }

    // Validate input data
    const validation = validateProductData(rawData)
    if (!validation.success) {
      return {
        error: 'Please correct the validation errors',
        errors: validation.errors,
        fields: rawData
      }
    }

    const validatedData = validation.data

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Demo mode - product creation simulated')
      return {
        success: true,
        product: {
          id: `demo-prod-${Date.now()}`,
          sku: validatedData.sku,
          brand: validatedData.brand,
          name: validatedData.name,
          category: validatedData.category,
          size: validatedData.size,
          unit: validatedData.unit,
          purchasePrice: validatedData.purchasePrice,
          sellingPrice: validatedData.sellingPrice,
          minimumStock: validatedData.minimumStock,
          currentStock: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }

    // Check for SKU uniqueness
    const existingProduct = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
      select: { id: true }
    })

    if (existingProduct) {
      return {
        error: 'A product with this SKU already exists',
        errors: { sku: 'SKU must be unique' },
        fields: rawData
      }
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        sku: validatedData.sku,
        brand: validatedData.brand,
        name: validatedData.name,
        category: validatedData.category,
        size: validatedData.size,
        unit: validatedData.unit,
        purchasePrice: validatedData.purchasePrice,
        sellingPrice: validatedData.sellingPrice,
        minimumStock: validatedData.minimumStock
      }
    })

    // Record initial price history if prices are provided
    if (validatedData.purchasePrice || validatedData.sellingPrice) {
      try {
        await recordPriceChange(
          product.id,
          validatedData.purchasePrice || 0,
          validatedData.sellingPrice || 0,
          'Initial price'
        )
      } catch (error) {
        console.error('Error recording initial price history:', error)
      }
    }

    // Revalidate product pages
    revalidatePath('/products')
    revalidatePath('/dashboard')
    
    // Invalidate product-related cache
    invalidateProductRelatedCache()

    // Check for low stock notifications if minimum stock is set
    if (validatedData.minimumStock && validatedData.minimumStock > 0) {
      try {
        await checkLowStock()
      } catch (error) {
        console.error('Error checking low stock after product creation:', error)
      }
    }

    return {
      success: true,
      product: product
    }

  } catch (error) {
    console.error('Create product error:', error)
    
    const rawData = {
      sku: formData.get('sku'),
      brand: formData.get('brand'),
      name: formData.get('name'),
      category: formData.get('category'),
      size: formData.get('size'),
      unit: formData.get('unit'),
      purchasePrice: formData.get('purchasePrice') || null,
      sellingPrice: formData.get('sellingPrice') || null,
      minimumStock: formData.get('minimumStock') || null
    }
    
    // Handle specific database errors
    if (error.code === 'P2002' && error.meta?.target?.includes('sku')) {
      return {
        error: 'A product with this SKU already exists',
        errors: { sku: 'SKU must be unique' },
        fields: rawData
      }
    }

    return {
      error: 'Failed to create product. Please try again.',
      fields: rawData
    }
  }
}

// Update an existing product
export async function updateProductAction(productId, prevState, formData) {
  try {
    // Require authentication
    await requireDemoAuth()

    // Validate product ID
    const validatedId = productIdSchema.parse(productId)

    // Extract form data (only include non-empty values)
    const rawData = {}
    const fields = ['sku', 'brand', 'name', 'category', 'size', 'unit', 'purchasePrice', 'sellingPrice', 'minimumStock']
    
    fields.forEach(field => {
      const value = formData.get(field)
      if (value !== null && value !== '') {
        rawData[field] = value
      }
    })

    // Validate update data
    const validation = validateProductUpdate(rawData)
    if (!validation.success) {
      return {
        error: 'Please correct the validation errors',
        errors: validation.errors,
        fields: rawData
      }
    }

    const validatedData = validation.data

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Demo mode - product update simulated')
      return {
        success: true,
        product: {
          id: validatedId,
          ...validatedData,
          updatedAt: new Date().toISOString()
        }
      }
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: validatedId },
      select: { id: true, sku: true }
    })

    if (!existingProduct) {
      return {
        error: 'Product not found',
        fields: rawData
      }
    }

    // Check SKU uniqueness if SKU is being updated
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: validatedData.sku },
        select: { id: true }
      })

      if (skuExists) {
        return {
          error: 'A product with this SKU already exists',
          errors: { sku: 'SKU must be unique' },
          fields: rawData
        }
      }
    }

    // Record price change if prices are being updated
    if (validatedData.purchasePrice || validatedData.sellingPrice) {
      try {
        const currentProduct = await prisma.product.findUnique({
          where: { id: validatedId },
          select: { purchasePrice: true, sellingPrice: true }
        })

        if (currentProduct) {
          const newPurchasePrice = validatedData.purchasePrice || currentProduct.purchasePrice
          const newSellingPrice = validatedData.sellingPrice || currentProduct.sellingPrice

          await recordPriceChange(
            validatedId,
            newPurchasePrice,
            newSellingPrice,
            'Price update'
          )
        }
      } catch (error) {
        console.error('Error recording price history:', error)
      }
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: validatedId },
      data: validatedData
    })

    // Revalidate product pages
    revalidatePath('/products')
    revalidatePath(`/products/${validatedId}`)
    revalidatePath('/dashboard')
    
    // Invalidate product-related cache
    invalidateProductRelatedCache()

    // Check for low stock notifications if minimum stock was updated
    if (validatedData.minimumStock) {
      try {
        await checkLowStock()
      } catch (error) {
        console.error('Error checking low stock after product update:', error)
      }
    }

    return {
      success: true,
      product: updatedProduct
    }

  } catch (error) {
    console.error('Update product error:', error)
    
    const rawData = {}
    const fields = ['sku', 'brand', 'name', 'category', 'size', 'unit', 'purchasePrice', 'sellingPrice', 'minimumStock']
    
    fields.forEach(field => {
      const value = formData.get(field)
      if (value !== null && value !== '') {
        rawData[field] = value
      }
    })
    
    // Handle specific database errors
    if (error.code === 'P2002' && error.meta?.target?.includes('sku')) {
      return {
        error: 'A product with this SKU already exists',
        errors: { sku: 'SKU must be unique' },
        fields: rawData
      }
    }

    return {
      error: 'Failed to update product. Please try again.',
      fields: rawData
    }
  }
}

// Delete a product
export async function deleteProductAction(productId) {
  try {
    // Require authentication
    await requireDemoAuth()

    // Validate product ID
    const validatedId = productIdSchema.parse(productId)

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Demo mode - product deletion simulated')
      return {
        success: true
      }
    }

    // Check if product has associated transactions
    const transactionCount = await prisma.transactionItem.count({
      where: { productId: validatedId }
    })

    if (transactionCount > 0) {
      return {
        error: 'Cannot delete product with associated stock transactions'
      }
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: validatedId }
    })

    // Revalidate product pages
    revalidatePath('/products')
    revalidatePath('/dashboard')
    
    // Invalidate product-related cache
    invalidateProductRelatedCache()

    return {
      success: true
    }

  } catch (error) {
    console.error('Delete product error:', error)
    
    if (error.code === 'P2025') {
      return {
        error: 'Product not found'
      }
    }

    return {
      error: 'Failed to delete product. Please try again.'
    }
  }
}

// Get products with search, filtering, and pagination
export async function getProductsAction(searchParams = {}) {
  try {
    // Check authentication (demo or regular)
    await requireDemoAuth()

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Using demo data')
      
      // Validate search parameters
      const validation = validateProductSearch(searchParams)
      if (!validation.success) {
        throw new Error('Invalid search parameters')
      }

      const { search, category, brand, page, limit, sortBy, sortOrder } = validation.data
      
      // Filter demo products
      let filteredProducts = [...DEMO_PRODUCTS]
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower)
        )
      }
      
      if (category) {
        filteredProducts = filteredProducts.filter(product => product.category === category)
      }
      
      if (brand) {
        filteredProducts = filteredProducts.filter(product => 
          product.brand.toLowerCase().includes(brand.toLowerCase())
        )
      }
      
      // Sort products
      filteredProducts.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1
        }
        return aVal > bVal ? 1 : -1
      })
      
      // Paginate
      const totalCount = filteredProducts.length
      const skip = (page - 1) * limit
      const paginatedProducts = filteredProducts.slice(skip, skip + limit)
      
      return {
        success: true,
        products: paginatedProducts,
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

    // Regular database logic
    const validation = validateProductSearch(searchParams)
    if (!validation.success) {
      throw new Error('Invalid search parameters')
    }

    const { search, category, brand, page, limit, sortBy, sortOrder } = validation.data

    // Build where clause for filtering
    const where = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get products with optimized query
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
          purchasePrice: true,
          sellingPrice: true,
          minimumStock: true,
          createdAt: true,
          updatedAt: true,
          // Get current stock from latest stock movement
          stockMovements: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { quantityAfter: true }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.product.count({ where })
    ])

    // Add current stock to each product
    const productsWithStock = products.map(product => ({
      ...product,
      currentStock: product.stockMovements[0]?.quantityAfter || 0,
      stockMovements: undefined // Remove from response
    }))

    return {
      success: true,
      products: productsWithStock,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    }

  } catch (error) {
    console.error('Get products error:', error)
    
    // Fallback to demo data if database fails
    if (!await shouldUseDemoData()) {
      console.log('[Products] Database failed, falling back to demo data')
      
      const { page = 1, limit = 20 } = searchParams
      const totalCount = DEMO_PRODUCTS.length
      const skip = (page - 1) * limit
      const paginatedProducts = DEMO_PRODUCTS.slice(skip, skip + limit)
      
      return {
        success: true,
        products: paginatedProducts,
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
    
    return {
      error: 'Failed to fetch products'
    }
  }
}

// Get a single product by ID
export async function getProductAction(productId) {
  try {
    // Require authentication
    await requireDemoAuth()

    // Validate product ID
    const validatedId = productIdSchema.parse(productId)

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Demo mode - using demo product data')
      const product = DEMO_PRODUCTS.find(p => p.id === validatedId)
      if (!product) {
        return {
          error: 'Product not found'
        }
      }
      return {
        success: true,
        product: {
          ...product,
          transactionCount: 0
        }
      }
    }

    // Get product with current stock
    const product = await prisma.product.findUnique({
      where: { id: validatedId },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { quantityAfter: true }
        },
        transactionItems: {
          select: { id: true }
        }
      }
    })

    if (!product) {
      return {
        error: 'Product not found'
      }
    }

    // Add current stock and transaction count
    const productWithStock = {
      ...product,
      currentStock: product.stockMovements[0]?.quantityAfter || 0,
      transactionCount: product.transactionItems.length,
      stockMovements: undefined,
      transactionItems: undefined
    }

    return {
      success: true,
      product: productWithStock
    }

  } catch (error) {
    console.error('Get product error:', error)
    return {
      error: 'Failed to fetch product'
    }
  }
}

// Search products for autocomplete
export async function searchProductsAction(query) {
  try {
    // Require authentication
    await requireDemoAuth()

    if (!query || query.length < 2) {
      return {
        success: true,
        products: []
      }
    }

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Demo mode - searching demo products')
      const queryLower = query.toLowerCase()
      const filteredProducts = DEMO_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(queryLower) ||
        product.brand.toLowerCase().includes(queryLower) ||
        product.sku.toLowerCase().includes(queryLower)
      ).slice(0, 20)
      
      return {
        success: true,
        products: filteredProducts
      }
    }

    // Search products with minimal data for autocomplete
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        sku: true,
        brand: true,
        name: true,
        size: true,
        sellingPrice: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { quantityAfter: true }
        }
      },
      take: 20,
      orderBy: { name: 'asc' }
    })

    // Add current stock to each product
    const productsWithStock = products.map(product => ({
      ...product,
      currentStock: product.stockMovements[0]?.quantityAfter || 0,
      stockMovements: undefined
    }))

    return {
      success: true,
      products: productsWithStock
    }

  } catch (error) {
    console.error('Search products error:', error)
    return {
      error: 'Failed to search products'
    }
  }
}

// Get product categories for filtering
export async function getProductCategoriesAction() {
  try {
    // Check authentication (demo or regular)
    await requireDemoAuth()

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Using demo categories')
      const categories = [...new Set(DEMO_PRODUCTS.map(p => p.category))].sort()
      return {
        success: true,
        categories
      }
    }

    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    })

    return {
      success: true,
      categories: categories.map(c => c.category)
    }

  } catch (error) {
    console.error('Get categories error:', error)
    
    // Fallback to demo data
    const categories = [...new Set(DEMO_PRODUCTS.map(p => p.category))].sort()
    return {
      success: true,
      categories
    }
  }
}

// Get product brands for filtering
export async function getProductBrandsAction() {
  try {
    // Check authentication (demo or regular)
    await requireDemoAuth()

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Using demo brands')
      const brands = [...new Set(DEMO_PRODUCTS.map(p => p.brand))].sort()
      return {
        success: true,
        brands
      }
    }

    const brands = await prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' }
    })

    return {
      success: true,
      brands: brands.map(b => b.brand)
    }

  } catch (error) {
    console.error('Get brands error:', error)
    
    // Fallback to demo data
    const brands = [...new Set(DEMO_PRODUCTS.map(p => p.brand))].sort()
    return {
      success: true,
      brands
    }
  }
}

// Set reorder point for a product
export async function setReorderPointAction(productId, reorderPoint) {
  try {
    // Require authentication
    await requireDemoAuth()

    // Validate product ID
    const validatedId = productIdSchema.parse(productId)
    const validatedReorderPoint = parseInt(reorderPoint)

    if (isNaN(validatedReorderPoint) || validatedReorderPoint < 0) {
      return {
        error: 'Invalid reorder point value'
      }
    }

    // Check if we should use demo data
    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Demo mode - reorder point update simulated')
      return {
        success: true,
        product: {
          id: validatedId,
          reorderPoint: validatedReorderPoint,
          updatedAt: new Date().toISOString()
        }
      }
    }

    // Update the product's reorder point
    const updatedProduct = await prisma.product.update({
      where: { id: validatedId },
      data: { 
        reorderPoint: validatedReorderPoint,
        minimumStock: validatedReorderPoint // Also update minimum stock
      }
    })

    // Check for low stock notifications
    try {
      await checkLowStock()
    } catch (error) {
      console.error('Error checking low stock after reorder point update:', error)
    }

    // Revalidate pages
    revalidatePath('/products')
    revalidatePath(`/products/${validatedId}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      product: updatedProduct
    }

  } catch (error) {
    console.error('Set reorder point error:', error)
    return {
      error: 'Failed to set reorder point. Please try again.'
    }
  }
}

// Trigger notification check for all products
export async function triggerNotificationCheckAction() {
  try {
    // Require authentication
    await requireDemoAuth()

    const useDemoData = await shouldUseDemoData()
    
    if (useDemoData) {
      console.log('[Products] Demo mode - notification check simulated')
      return {
        success: true,
        notificationsCreated: 0,
        suggestionsCreated: 0
      }
    }

    // Run notification checks
    const [lowStockResult, reorderResult] = await Promise.all([
      checkLowStock(),
      generateReorderSuggestions()
    ])

    return {
      success: true,
      notificationsCreated: lowStockResult.notificationsCreated || 0,
      suggestionsCreated: reorderResult.suggestionsCreated || 0
    }

  } catch (error) {
    console.error('Trigger notification check error:', error)
    return {
      error: 'Failed to check notifications'
    }
  }
}