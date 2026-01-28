import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { prisma } from '../lib/prisma'
import { 
  createTransaction,
  getTransactions,
  getTransaction,
  getCurrentStockLevels
} from '../lib/actions/transactions'
import { TransactionType } from '../lib/validations/transaction'

// Mock data
const mockUser = {
  id: 'user_test_123',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed_password'
}

const mockSupplier = {
  id: 'supplier_test_123',
  name: 'Test Supplier',
  contact: 'supplier@example.com'
}

const mockProduct = {
  id: 'product_test_123',
  sku: 'TEST-001',
  brand: 'Test Brand',
  name: 'Test Product',
  category: 'Test Category',
  size: '1L',
  unit: 'bottle',
  purchasePrice: 20.00,
  sellingPrice: 30.00,
  minimumStock: 10
}

describe('Transaction Actions', () => {
  beforeEach(async () => {
    // Clean up any existing test data
    await prisma.stockMovement.deleteMany({
      where: {
        OR: [
          { productId: mockProduct.id },
          { transactionId: { contains: 'test' } }
        ]
      }
    })
    
    await prisma.transactionItem.deleteMany({
      where: {
        OR: [
          { productId: mockProduct.id },
          { transactionId: { contains: 'test' } }
        ]
      }
    })
    
    await prisma.stockTransaction.deleteMany({
      where: {
        OR: [
          { supplierId: mockSupplier.id },
          { referenceNumber: { contains: 'TXN-' } }
        ]
      }
    })
    
    await prisma.product.deleteMany({
      where: { id: mockProduct.id }
    })
    
    await prisma.supplier.deleteMany({
      where: { id: mockSupplier.id }
    })
    
    await prisma.user.deleteMany({
      where: { id: mockUser.id }
    })

    // Create test data
    await prisma.user.create({ data: mockUser })
    await prisma.supplier.create({ data: mockSupplier })
    await prisma.product.create({ data: mockProduct })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.stockMovement.deleteMany({
      where: {
        OR: [
          { productId: mockProduct.id },
          { transactionId: { contains: 'test' } }
        ]
      }
    })
    
    await prisma.transactionItem.deleteMany({
      where: {
        OR: [
          { productId: mockProduct.id },
          { transactionId: { contains: 'test' } }
        ]
      }
    })
    
    await prisma.stockTransaction.deleteMany({
      where: {
        OR: [
          { supplierId: mockSupplier.id },
          { referenceNumber: { contains: 'TXN-' } }
        ]
      }
    })
    
    await prisma.product.deleteMany({
      where: { id: mockProduct.id }
    })
    
    await prisma.supplier.deleteMany({
      where: { id: mockSupplier.id }
    })
    
    await prisma.user.deleteMany({
      where: { id: mockUser.id }
    })
  })

  describe('createTransaction', () => {
    it('should create a stock in transaction successfully', async () => {
      const transactionData = {
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: mockSupplier.id,
        userId: mockUser.id,
        notes: 'Test stock in transaction',
        items: [{
          productId: mockProduct.id,
          quantity: 50,
          unitCost: 22.50
        }]
      }

      const result = await createTransaction(transactionData)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.type).toBe(TransactionType.IN)
      expect(result.data.referenceNumber).toMatch(/^TXN-\d{8}-\d{4}$/)
      expect(result.data.items).toHaveLength(1)
      expect(result.data.items[0].quantity).toBe(50)
      expect(result.data.totalValue).toBe(1125) // 50 * 22.50
    })

    it('should create stock movements for stock in transaction', async () => {
      const transactionData = {
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: mockSupplier.id,
        userId: mockUser.id,
        items: [{
          productId: mockProduct.id,
          quantity: 30,
          unitCost: 20.00
        }]
      }

      const result = await createTransaction(transactionData)
      expect(result.success).toBe(true)

      // Check stock movement was created
      const movements = await prisma.stockMovement.findMany({
        where: { transactionId: result.data.id }
      })

      expect(movements).toHaveLength(1)
      expect(movements[0].productId).toBe(mockProduct.id)
      expect(movements[0].quantityBefore).toBe(0)
      expect(movements[0].quantityChange).toBe(30)
      expect(movements[0].quantityAfter).toBe(30)
    })

    it('should prevent stock out transaction with insufficient stock', async () => {
      const transactionData = {
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-15'),
        userId: mockUser.id,
        items: [{
          productId: mockProduct.id,
          quantity: 10, // No stock available
          unitPrice: 35.00
        }]
      }

      const result = await createTransaction(transactionData)

      expect(result.success).toBeFalsy()
      expect(result.error).toContain('Insufficient stock')
    })

    it('should generate unique reference numbers', async () => {
      const transactionData1 = {
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: mockSupplier.id,
        userId: mockUser.id,
        items: [{
          productId: mockProduct.id,
          quantity: 25,
          unitCost: 20.00
        }]
      }

      const transactionData2 = { ...transactionData1 }

      const result1 = await createTransaction(transactionData1)
      const result2 = await createTransaction(transactionData2)

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.data.referenceNumber).not.toBe(result2.data.referenceNumber)
    })

    it('should validate required fields for stock in transactions', async () => {
      const invalidTransaction = {
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        userId: mockUser.id,
        // Missing supplierId
        items: [{
          productId: mockProduct.id,
          quantity: 10
          // Missing unitCost
        }]
      }

      try {
        const result = await createTransaction(invalidTransaction)
        
        // If we get here, the function returned something
        expect(result).toBeDefined()
        if (result) {
          expect(result.success).toBeFalsy()
          expect(result.error).toBeDefined()
        }
      } catch (error) {
        // If validation throws an error, that's also acceptable
        expect(error).toBeDefined()
      }
    })

    it('should handle stock adjustment transactions', async () => {
      // First, add some stock
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: mockSupplier.id,
        userId: mockUser.id,
        items: [{
          productId: mockProduct.id,
          quantity: 100,
          unitCost: 20.00
        }]
      })

      // Then adjust it down
      const adjustmentData = {
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-16'),
        userId: mockUser.id,
        notes: 'Stock count adjustment',
        items: [{
          productId: mockProduct.id,
          quantity: -10 // Reduce by 10
        }]
      }

      const result = await createTransaction(adjustmentData)

      expect(result.success).toBe(true)
      expect(result.data.type).toBe(TransactionType.ADJUST)

      // Check final stock level
      const movements = await prisma.stockMovement.findMany({
        where: { productId: mockProduct.id },
        orderBy: { createdAt: 'desc' },
        take: 1
      })

      expect(movements[0].quantityAfter).toBe(90) // 100 - 10
    })
  })

  describe('getTransactions', () => {
    beforeEach(async () => {
      // Create some test transactions
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: mockSupplier.id,
        userId: mockUser.id,
        items: [{
          productId: mockProduct.id,
          quantity: 50,
          unitCost: 20.00
        }]
      })

      await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-16'),
        userId: mockUser.id,
        items: [{
          productId: mockProduct.id,
          quantity: 10,
          unitPrice: 30.00
        }]
      })
    })

    it('should fetch transactions with pagination', async () => {
      const result = await getTransactions({ page: 1, limit: 10 })

      expect(result.success).toBe(true)
      expect(result.data.transactions).toBeDefined()
      expect(result.data.pagination).toBeDefined()
      expect(result.data.pagination.page).toBe(1)
      expect(result.data.pagination.limit).toBe(10)
    })

    it('should filter transactions by type', async () => {
      const result = await getTransactions({ type: TransactionType.IN })

      expect(result.success).toBe(true)
      expect(result.data.transactions.every(t => t.type === TransactionType.IN)).toBe(true)
    })

    it('should filter transactions by supplier', async () => {
      const result = await getTransactions({ supplierId: mockSupplier.id })

      expect(result.success).toBe(true)
      expect(result.data.transactions.every(t => t.supplierId === mockSupplier.id)).toBe(true)
    })
  })

  describe('getCurrentStockLevels', () => {
    it('should return current stock levels for all products', async () => {
      // Add some stock
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: mockSupplier.id,
        userId: mockUser.id,
        items: [{
          productId: mockProduct.id,
          quantity: 75,
          unitCost: 20.00
        }]
      })

      const result = await getCurrentStockLevels()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      
      const productStock = result.data.find(item => item.productId === mockProduct.id)
      expect(productStock).toBeDefined()
      expect(productStock.currentStock).toBe(75)
    })

    it('should return zero stock for products with no movements', async () => {
      const result = await getCurrentStockLevels()

      expect(result.success).toBe(true)
      
      const productStock = result.data.find(item => item.productId === mockProduct.id)
      if (productStock) {
        expect(productStock.currentStock).toBe(0)
      }
    })
  })

  describe('getTransaction', () => {
    it('should fetch a single transaction with full details', async () => {
      const createResult = await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: mockSupplier.id,
        userId: mockUser.id,
        notes: 'Test transaction',
        items: [{
          productId: mockProduct.id,
          quantity: 25,
          unitCost: 22.00
        }]
      })

      expect(createResult.success).toBe(true)

      const result = await getTransaction(createResult.data.id)

      expect(result.success).toBe(true)
      expect(result.data.id).toBe(createResult.data.id)
      expect(result.data.items).toBeDefined()
      expect(result.data.supplier).toBeDefined()
      expect(result.data.movements).toBeDefined()
    })

    it('should return error for non-existent transaction', async () => {
      const result = await getTransaction('non_existent_id')

      expect(result.success).toBeFalsy()
      expect(result.error).toBe('Transaction not found')
    })
  })
})