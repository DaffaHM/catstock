/**
 * Product Actions Tests
 * Tests for product CRUD operations and server actions
 */

import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  getProductsAction,
  getProductAction,
  searchProductsAction,
  getProductCategoriesAction,
  getProductBrandsAction
} from '@/lib/actions/products'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    transactionItem: {
      count: jest.fn()
    }
  }
}))

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn()
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

describe('Product Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireAuth.mockResolvedValue({ id: 'user1', email: 'test@example.com' })
  })

  describe('createProductAction', () => {
    const validFormData = new FormData()
    validFormData.append('sku', 'TEST-001')
    validFormData.append('brand', 'Test Brand')
    validFormData.append('name', 'Test Product')
    validFormData.append('category', 'Interior Paint')
    validFormData.append('size', '1 Gallon')
    validFormData.append('unit', 'Each')
    validFormData.append('purchasePrice', '25.99')
    validFormData.append('sellingPrice', '39.99')
    validFormData.append('minimumStock', '10')

    test('should create product successfully', async () => {
      const mockProduct = {
        id: 'product1',
        sku: 'TEST-001',
        brand: 'Test Brand',
        name: 'Test Product',
        category: 'Interior Paint',
        size: '1 Gallon',
        unit: 'Each',
        purchasePrice: 25.99,
        sellingPrice: 39.99,
        minimumStock: 10
      }

      prisma.product.findUnique.mockResolvedValue(null) // SKU doesn't exist
      prisma.product.create.mockResolvedValue(mockProduct)

      const result = await createProductAction({}, validFormData)

      expect(result.success).toBe(true)
      expect(result.product).toEqual(mockProduct)
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sku: 'TEST-001',
          brand: 'Test Brand',
          name: 'Test Product'
        })
      })
    })

    test('should reject duplicate SKU', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'existing' })

      const result = await createProductAction({}, validFormData)

      expect(result.success).toBeUndefined()
      expect(result.error).toContain('SKU already exists')
      expect(result.errors.sku).toBeDefined()
      expect(prisma.product.create).not.toHaveBeenCalled()
    })

    test('should validate required fields', async () => {
      const incompleteFormData = new FormData()
      incompleteFormData.append('sku', 'TEST-002')
      // Missing required fields

      const result = await createProductAction({}, incompleteFormData)

      expect(result.success).toBeUndefined()
      expect(result.error).toContain('validation errors')
      expect(result.errors).toBeDefined()
      expect(prisma.product.create).not.toHaveBeenCalled()
    })

    test('should handle database errors', async () => {
      prisma.product.findUnique.mockResolvedValue(null)
      prisma.product.create.mockRejectedValue(new Error('Database error'))

      const result = await createProductAction({}, validFormData)

      expect(result.success).toBeUndefined()
      expect(result.error).toContain('Failed to create product')
    })

    test('should require authentication', async () => {
      requireAuth.mockRejectedValue(new Error('Authentication required'))

      const result = await createProductAction({}, validFormData)

      expect(result.success).toBeUndefined()
      expect(result.error).toBeDefined()
    })
  })

  describe('updateProductAction', () => {
    const productId = 'product1'
    const updateFormData = new FormData()
    updateFormData.append('name', 'Updated Product Name')
    updateFormData.append('sellingPrice', '45.99')

    test('should update product successfully', async () => {
      const existingProduct = { id: productId, sku: 'TEST-001' }
      const updatedProduct = { ...existingProduct, name: 'Updated Product Name', sellingPrice: 45.99 }

      prisma.product.findUnique.mockResolvedValue(existingProduct)
      prisma.product.update.mockResolvedValue(updatedProduct)

      const result = await updateProductAction(productId, {}, updateFormData)

      expect(result.success).toBe(true)
      expect(result.product).toEqual(updatedProduct)
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: expect.objectContaining({
          name: 'Updated Product Name',
          sellingPrice: 45.99
        })
      })
    })

    test('should handle product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      const result = await updateProductAction(productId, {}, updateFormData)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe('Product not found')
      expect(prisma.product.update).not.toHaveBeenCalled()
    })

    test('should validate SKU uniqueness on update', async () => {
      const skuUpdateFormData = new FormData()
      skuUpdateFormData.append('sku', 'NEW-SKU')

      const existingProduct = { id: productId, sku: 'OLD-SKU' }
      const duplicateProduct = { id: 'other', sku: 'NEW-SKU' }

      prisma.product.findUnique
        .mockResolvedValueOnce(existingProduct) // First call for product existence
        .mockResolvedValueOnce(duplicateProduct) // Second call for SKU uniqueness

      const result = await updateProductAction(productId, {}, skuUpdateFormData)

      expect(result.success).toBeUndefined()
      expect(result.error).toContain('SKU already exists')
      expect(result.errors.sku).toBeDefined()
    })

    test('should allow same SKU on update', async () => {
      const skuUpdateFormData = new FormData()
      skuUpdateFormData.append('sku', 'SAME-SKU')

      const existingProduct = { id: productId, sku: 'SAME-SKU' }
      const updatedProduct = { ...existingProduct, name: 'Updated' }

      prisma.product.findUnique.mockResolvedValue(existingProduct)
      prisma.product.update.mockResolvedValue(updatedProduct)

      const result = await updateProductAction(productId, {}, skuUpdateFormData)

      expect(result.success).toBe(true)
      expect(prisma.product.update).toHaveBeenCalled()
    })
  })

  describe('deleteProductAction', () => {
    const productId = 'product1'

    test('should delete product successfully', async () => {
      prisma.transactionItem.count.mockResolvedValue(0) // No associated transactions
      prisma.product.delete.mockResolvedValue({ id: productId })

      const result = await deleteProductAction(productId)

      expect(result.success).toBe(true)
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: productId }
      })
    })

    test('should prevent deletion with associated transactions', async () => {
      prisma.transactionItem.count.mockResolvedValue(5) // Has transactions

      const result = await deleteProductAction(productId)

      expect(result.success).toBeUndefined()
      expect(result.error).toContain('associated stock transactions')
      expect(prisma.product.delete).not.toHaveBeenCalled()
    })

    test('should handle product not found', async () => {
      prisma.transactionItem.count.mockResolvedValue(0)
      prisma.product.delete.mockRejectedValue({ code: 'P2025' })

      const result = await deleteProductAction(productId)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe('Product not found')
    })

    test('should validate product ID format', async () => {
      const invalidId = 'invalid-id'

      const result = await deleteProductAction(invalidId)

      expect(result.success).toBeUndefined()
      expect(result.error).toBeDefined()
      expect(prisma.product.delete).not.toHaveBeenCalled()
    })
  })

  describe('getProductsAction', () => {
    test('should get products with default parameters', async () => {
      const mockProducts = [
        {
          id: 'product1',
          sku: 'TEST-001',
          name: 'Test Product 1',
          stockMovements: [{ quantityAfter: 10 }]
        },
        {
          id: 'product2',
          sku: 'TEST-002',
          name: 'Test Product 2',
          stockMovements: [{ quantityAfter: 5 }]
        }
      ]

      prisma.product.findMany.mockResolvedValue(mockProducts)
      prisma.product.count.mockResolvedValue(2)

      const result = await getProductsAction()

      expect(result.success).toBe(true)
      expect(result.products).toHaveLength(2)
      expect(result.products[0].currentStock).toBe(10)
      expect(result.products[1].currentStock).toBe(5)
      expect(result.pagination).toBeDefined()
      expect(result.pagination.totalCount).toBe(2)
    })

    test('should handle search parameters', async () => {
      const searchParams = {
        search: 'paint',
        category: 'Interior Paint',
        page: 2,
        limit: 25
      }

      prisma.product.findMany.mockResolvedValue([])
      prisma.product.count.mockResolvedValue(0)

      const result = await getProductsAction(searchParams)

      expect(result.success).toBe(true)
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
            category: 'Interior Paint'
          }),
          skip: 25, // (page 2 - 1) * limit 25
          take: 25
        })
      )
    })

    test('should handle products with no stock movements', async () => {
      const mockProducts = [
        {
          id: 'product1',
          sku: 'TEST-001',
          name: 'Test Product',
          stockMovements: [] // No movements
        }
      ]

      prisma.product.findMany.mockResolvedValue(mockProducts)
      prisma.product.count.mockResolvedValue(1)

      const result = await getProductsAction()

      expect(result.success).toBe(true)
      expect(result.products[0].currentStock).toBe(0)
    })
  })

  describe('getProductAction', () => {
    const productId = 'product1'

    test('should get single product successfully', async () => {
      const mockProduct = {
        id: productId,
        sku: 'TEST-001',
        name: 'Test Product',
        stockMovements: [{ quantityAfter: 15 }],
        transactionItems: [{ id: 'item1' }, { id: 'item2' }]
      }

      prisma.product.findUnique.mockResolvedValue(mockProduct)

      const result = await getProductAction(productId)

      expect(result.success).toBe(true)
      expect(result.product.currentStock).toBe(15)
      expect(result.product.transactionCount).toBe(2)
      expect(result.product.stockMovements).toBeUndefined()
      expect(result.product.transactionItems).toBeUndefined()
    })

    test('should handle product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null)

      const result = await getProductAction(productId)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe('Product not found')
    })
  })

  describe('searchProductsAction', () => {
    test('should search products successfully', async () => {
      const mockProducts = [
        {
          id: 'product1',
          sku: 'PAINT-001',
          name: 'Interior Paint',
          stockMovements: [{ quantityAfter: 8 }]
        }
      ]

      prisma.product.findMany.mockResolvedValue(mockProducts)

      const result = await searchProductsAction('paint')

      expect(result.success).toBe(true)
      expect(result.products).toHaveLength(1)
      expect(result.products[0].currentStock).toBe(8)
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { name: { contains: 'paint', mode: 'insensitive' } }
            ])
          },
          take: 20
        })
      )
    })

    test('should return empty results for short queries', async () => {
      const result = await searchProductsAction('a')

      expect(result.success).toBe(true)
      expect(result.products).toEqual([])
      expect(prisma.product.findMany).not.toHaveBeenCalled()
    })

    test('should return empty results for empty query', async () => {
      const result = await searchProductsAction('')

      expect(result.success).toBe(true)
      expect(result.products).toEqual([])
      expect(prisma.product.findMany).not.toHaveBeenCalled()
    })
  })

  describe('getProductCategoriesAction', () => {
    test('should get distinct categories', async () => {
      const mockCategories = [
        { category: 'Interior Paint' },
        { category: 'Exterior Paint' },
        { category: 'Primer' }
      ]

      prisma.product.findMany.mockResolvedValue(mockCategories)

      const result = await getProductCategoriesAction()

      expect(result.success).toBe(true)
      expect(result.categories).toEqual(['Interior Paint', 'Exterior Paint', 'Primer'])
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' }
      })
    })
  })

  describe('getProductBrandsAction', () => {
    test('should get distinct brands', async () => {
      const mockBrands = [
        { brand: 'Sherwin-Williams' },
        { brand: 'Benjamin Moore' },
        { brand: 'Behr' }
      ]

      prisma.product.findMany.mockResolvedValue(mockBrands)

      const result = await getProductBrandsAction()

      expect(result.success).toBe(true)
      expect(result.brands).toEqual(['Sherwin-Williams', 'Benjamin Moore', 'Behr'])
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        select: { brand: true },
        distinct: ['brand'],
        orderBy: { brand: 'asc' }
      })
    })
  })

  describe('Error Handling and Security', () => {
    test('should handle authentication failures', async () => {
      requireAuth.mockRejectedValue(new Error('Authentication required'))

      const result = await createProductAction({}, new FormData())

      expect(result.success).toBeUndefined()
      expect(result.error).toBeDefined()
    })

    test('should handle database connection errors', async () => {
      prisma.product.findUnique.mockRejectedValue(new Error('Connection failed'))

      const result = await getProductAction('product1')

      expect(result.success).toBeUndefined()
      expect(result.error).toContain('Failed to fetch product')
    })

    test('should sanitize error messages', async () => {
      const sensitiveError = new Error('Database password: secret123')
      prisma.product.create.mockRejectedValue(sensitiveError)

      const formData = new FormData()
      formData.append('sku', 'TEST-001')
      formData.append('brand', 'Test')
      formData.append('name', 'Test')
      formData.append('category', 'Test')
      formData.append('size', 'Test')
      formData.append('unit', 'Test')

      prisma.product.findUnique.mockResolvedValue(null)

      const result = await createProductAction({}, formData)

      expect(result.error).not.toContain('secret123')
      expect(result.error).toBe('Failed to create product. Please try again.')
    })
  })
})