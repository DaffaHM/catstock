'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { invalidateProductRelatedCache } from '@/lib/cache/dashboard-cache'
import { 
  productSchema, 
  productUpdateSchema, 
  productSearchSchema,
  productIdSchema,
  validateProductData,
  validateProductUpdate,
  validateProductSearch
} from '@/lib/validations/product'

// Create a new product
export async function createProductAction(prevState, formData) {
  try {
    // Require authentication
    await requireAuth()

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

    // Revalidate product pages
    revalidatePath('/products')
    revalidatePath('/dashboard')
    
    // Invalidate product-related cache
    invalidateProductRelatedCache()

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
    await requireAuth()

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
    await requireAuth()

    // Validate product ID
    const validatedId = productIdSchema.parse(productId)

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
    // Require authentication
    await requireAuth()

    // Validate search parameters
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
    return {
      error: 'Failed to fetch products'
    }
  }
}

// Get a single product by ID
export async function getProductAction(productId) {
  try {
    // Require authentication
    await requireAuth()

    // Validate product ID
    const validatedId = productIdSchema.parse(productId)

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
    await requireAuth()

    if (!query || query.length < 2) {
      return {
        success: true,
        products: []
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
    // Require authentication
    await requireAuth()

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
    return {
      error: 'Failed to fetch categories'
    }
  }
}

// Get product brands for filtering
export async function getProductBrandsAction() {
  try {
    // Require authentication
    await requireAuth()

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
    return {
      error: 'Failed to fetch brands'
    }
  }
}