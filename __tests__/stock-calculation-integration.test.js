/**
 * Stock Calculation Engine Integration Tests
 * 
 * Integration tests that verify the stock calculation engine works correctly
 * with the transaction system and maintains accurate stock balances.
 */

import { createTransaction, getCurrentStockLevels, getProductStockCard } from '@/lib/actions/transactions'
import { StockCalculationEngine } from '@/lib/engines/stock-calculation'
import { TransactionType } from '@/lib/validations/transaction'
import { prisma } from '@/lib/prisma'

describe('Stock Calculation Engine Integration', () => {
  let testProduct, testSupplier, testUser

  beforeEach(async () => {
    // Clean up test data
    await prisma.stockMovement.deleteMany()
    await prisma.transactionItem.deleteMany()
    await prisma.stockTransaction.deleteMany()
    await prisma.product.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.user.deleteMany()

    // Create test user
    testUser = await prisma.user.create({
      data: {
        id: 'user_test_integration',
        email: 'integration@test.com',
        name: 'Integration Test User',
        passwordHash: 'hashed_password'
      }
    })

    // Create test product directly with Prisma
    testProduct = await prisma.product.create({
      data: {
        sku: 'TEST-PAINT-001',
        brand: 'Test Brand',
        name: 'Test Paint',
        category: 'Interior Paint',
        size: '1 Gallon',
        unit: 'Each',
        minimumStock: 5
      }
    })

    // Create test supplier directly with Prisma
    testSupplier = await prisma.supplier.create({
      data: {
        name: 'Test Supplier',
        contact: 'test@supplier.com'
      }
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.stockMovement.deleteMany()
    await prisma.transactionItem.deleteMany()
    await prisma.stockTransaction.deleteMany()
    await prisma.product.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('Stock Balance Calculations', () => {
    test('should maintain accurate running balances through multiple transactions', async () => {
      // Initial stock in
      const stockIn1 = await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-01'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct.id,
          quantity: 20,
          unitCost: 15.00
        }]
      })
      expect(stockIn1.success).toBe(true)

      // Check stock level after first transaction
      let currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
      expect(currentStock).toBe(20)

      // Stock out
      const stockOut1 = await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-02'),
        items: [{
          productId: testProduct.id,
          quantity: 8,
          unitPrice: 25.00
        }]
      })
      expect(stockOut1.success).toBe(true)

      // Check stock level after stock out
      currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
      expect(currentStock).toBe(12)

      // Another stock in
      const stockIn2 = await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-03'),
        supplierId: testSupplier.id,
        items: [{
          productId: testProduct.id,
          quantity: 15,
          unitCost: 16.00
        }]
      })
      expect(stockIn2.success).toBe(true)

      // Check final stock level
      currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
      expect(currentStock).toBe(27)

      // Verify stock movements history
      const stockCard = await getProductStockCard(testProduct.id)
      expect(stockCard.success).toBe(true)
      expect(stockCard.data.movements).toHaveLength(3)

      // Verify running balances
      const movements = stockCard.data.movements.reverse() // Reverse to get chronological order
      expect(movements[0].quantityAfter).toBe(20) // First IN
      expect(movements[1].quantityAfter).toBe(12) // OUT
      expect(movements[2].quantityAfter).toBe(27) // Second IN
    })

    test('should handle stock adjustments correctly', async () => {
      // Initial stock
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-01'),
        supplierId: testSupplier.id,
        items: [{
          productId: testProduct.id,
          quantity: 10,
          unitCost: 15.00
        }]
      })

      // Stock adjustment (increase)
      const adjustment1 = await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-02'),
        notes: 'Physical count adjustment',
        items: [{
          productId: testProduct.id,
          quantity: 3 // Adding 3 units
        }]
      })
      expect(adjustment1.success).toBe(true)

      let currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
      expect(currentStock).toBe(13)

      // Stock adjustment (decrease)
      const adjustment2 = await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-03'),
        notes: 'Damaged goods adjustment',
        items: [{
          productId: testProduct.id,
          quantity: -2 // Removing 2 units
        }]
      })
      expect(adjustment2.success).toBe(true)

      currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
      expect(currentStock).toBe(11)
    })
  })

  describe('Negative Stock Prevention', () => {
    test('should prevent OUT transactions that would cause negative stock', async () => {
      // Initial stock
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-01'),
        supplierId: testSupplier.id,
        items: [{
          productId: testProduct.id,
          quantity: 5,
          unitCost: 15.00
        }]
      })

      // Attempt to take out more than available
      const stockOut = await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-02'),
        items: [{
          productId: testProduct.id,
          quantity: 10, // More than the 5 available
          unitPrice: 25.00
        }]
      })

      expect(stockOut.success).toBe(false)
      expect(stockOut.error).toContain('Insufficient stock')
      expect(stockOut.error).toContain('Available: 5, Requested: 10')

      // Verify stock level unchanged
      const currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
      expect(currentStock).toBe(5)
    })

    test('should allow adjustments that result in negative stock', async () => {
      // Initial stock
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-01'),
        supplierId: testSupplier.id,
        items: [{
          productId: testProduct.id,
          quantity: 3,
          unitCost: 15.00
        }]
      })

      // Adjustment that goes negative (e.g., damaged/lost inventory)
      const adjustment = await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-02'),
        notes: 'Inventory loss adjustment',
        items: [{
          productId: testProduct.id,
          quantity: -5 // Results in -2 stock
        }]
      })

      expect(adjustment.success).toBe(true)

      const currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
      expect(currentStock).toBe(-2)
    })
  })

  describe('Stock Movement History Tracking', () => {
    test('should track complete stock movement history with running balances', async () => {
      const transactions = [
        { type: TransactionType.IN, quantity: 15, date: '2024-01-01' },
        { type: TransactionType.OUT, quantity: 5, date: '2024-01-02' },
        { type: TransactionType.IN, quantity: 10, date: '2024-01-03' },
        { type: TransactionType.ADJUST, quantity: -2, date: '2024-01-04' },
        { type: TransactionType.OUT, quantity: 8, date: '2024-01-05' }
      ]

      // Create all transactions
      for (const txn of transactions) {
        const transactionData = {
          type: txn.type,
          transactionDate: new Date(txn.date),
          items: [{
            productId: testProduct.id,
            quantity: txn.quantity,
            ...(txn.type === TransactionType.IN && { unitCost: 15.00 }),
            ...(txn.type === TransactionType.OUT && { unitPrice: 25.00 })
          }]
        }

        if (txn.type === TransactionType.IN) {
          transactionData.supplierId = testSupplier.id
        }

        const result = await createTransaction(transactionData)
        expect(result.success).toBe(true)
      }

      // Get stock movement history
      const stockCard = await getProductStockCard(testProduct.id)
      expect(stockCard.success).toBe(true)
      expect(stockCard.data.movements).toHaveLength(5)

      // Verify final stock level
      const currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
      expect(currentStock).toBe(10) // 15 - 5 + 10 - 2 - 8 = 10

      // Verify movement history in chronological order
      const movements = stockCard.data.movements.reverse()
      const expectedBalances = [15, 10, 20, 18, 10]
      
      movements.forEach((movement, index) => {
        expect(movement.quantityAfter).toBe(expectedBalances[index])
      })
    })
  })

  describe('Real-time Stock Level Queries', () => {
    test('should provide accurate real-time stock levels', async () => {
      // Create second product
      const product2 = await prisma.product.create({
        data: {
          sku: 'TEST-PAINT-002',
          brand: 'Test Brand',
          name: 'Test Paint 2',
          category: 'Exterior Paint',
          size: '1 Quart',
          unit: 'Each',
          minimumStock: 3
        }
      })

      // Stock transactions for both products
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date(),
        supplierId: testSupplier.id,
        items: [
          { productId: testProduct.id, quantity: 12, unitCost: 15.00 },
          { productId: product2.id, quantity: 8, unitCost: 10.00 }
        ]
      })

      await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date(),
        items: [
          { productId: testProduct.id, quantity: 4, unitPrice: 25.00 }
        ]
      })

      // Get real-time stock levels
      const stockLevels = await StockCalculationEngine.getRealTimeStockLevels()
      
      expect(stockLevels).toHaveLength(2)
      
      const product1Stock = stockLevels.find(s => s.productId === testProduct.id)
      const product2Stock = stockLevels.find(s => s.productId === product2.id)
      
      expect(product1Stock.currentStock).toBe(8) // 12 - 4
      expect(product1Stock.isLowStock).toBe(false) // 8 > 5 (minimum)
      
      expect(product2Stock.currentStock).toBe(8)
      expect(product2Stock.isLowStock).toBe(false) // 8 > 3 (minimum)
    })

    test('should identify low stock products correctly', async () => {
      // Stock below minimum
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date(),
        supplierId: testSupplier.id,
        items: [{
          productId: testProduct.id,
          quantity: 3, // Below minimum of 5
          unitCost: 15.00
        }]
      })

      const stockSummary = await StockCalculationEngine.getStockSummary({
        onlyLowStock: true
      })

      expect(stockSummary).toHaveLength(1)
      expect(stockSummary[0].productId).toBe(testProduct.id)
      expect(stockSummary[0].currentStock).toBe(3)
      expect(stockSummary[0].isLowStock).toBe(true)
    })
  })

  describe('Stock Adjustment Calculations', () => {
    test('should calculate stock adjustments accurately', async () => {
      // Initial stock
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date(),
        supplierId: testSupplier.id,
        items: [{
          productId: testProduct.id,
          quantity: 20,
          unitCost: 15.00
        }]
      })

      // Calculate adjustment needed
      const adjustment = await StockCalculationEngine.calculateStockAdjustment(
        testProduct.id, 
        17 // Actual counted stock
      )

      expect(adjustment).toEqual({
        productId: testProduct.id,
        currentStock: 20,
        actualStock: 17,
        difference: -3,
        adjustmentType: 'DECREASE',
        adjustmentQuantity: 3
      })

      // Apply the adjustment
      const adjustmentTxn = await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date(),
        notes: 'Physical inventory adjustment',
        items: [{
          productId: testProduct.id,
          quantity: adjustment.difference
        }]
      })

      expect(adjustmentTxn.success).toBe(true)

      // Verify final stock
      const finalStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
      expect(finalStock).toBe(17)
    })

    test('should handle batch stock adjustments', async () => {
      // Create second product
      const product2 = await prisma.product.create({
        data: {
          sku: 'TEST-PAINT-003',
          brand: 'Test Brand',
          name: 'Test Paint 3',
          category: 'Primer',
          size: '1 Gallon',
          unit: 'Each'
        }
      })

      // Initial stock for both products
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date(),
        supplierId: testSupplier.id,
        items: [
          { productId: testProduct.id, quantity: 15, unitCost: 15.00 },
          { productId: product2.id, quantity: 10, unitCost: 12.00 }
        ]
      })

      // Calculate batch adjustments
      const adjustments = [
        { productId: testProduct.id, actualStock: 18 }, // +3
        { productId: product2.id, actualStock: 7 }      // -3
      ]

      const batchResult = await StockCalculationEngine.calculateBatchStockAdjustments(adjustments)

      expect(batchResult.adjustments).toHaveLength(2)
      expect(batchResult.summary.totalAdjustments).toBe(2)
      expect(batchResult.summary.increases).toBe(1)
      expect(batchResult.summary.decreases).toBe(1)
      expect(batchResult.summary.totalIncreaseQuantity).toBe(3)
      expect(batchResult.summary.totalDecreaseQuantity).toBe(3)

      // Verify individual adjustments
      const adj1 = batchResult.adjustments.find(a => a.productId === testProduct.id)
      const adj2 = batchResult.adjustments.find(a => a.productId === product2.id)

      expect(adj1.adjustmentType).toBe('INCREASE')
      expect(adj1.difference).toBe(3)
      expect(adj2.adjustmentType).toBe('DECREASE')
      expect(adj2.difference).toBe(-3)
    })
  })

  describe('Stock Movement Integrity Verification', () => {
    test('should verify stock movement integrity', async () => {
      // Create transactions with known stock movements
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-01'),
        supplierId: testSupplier.id,
        items: [{
          productId: testProduct.id,
          quantity: 10,
          unitCost: 15.00
        }]
      })

      await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-02'),
        items: [{
          productId: testProduct.id,
          quantity: 3,
          unitPrice: 25.00
        }]
      })

      // Verify integrity
      const verification = await StockCalculationEngine.verifyStockMovementIntegrity(testProduct.id)

      expect(verification.valid).toBe(true)
      expect(verification.productId).toBe(testProduct.id)
      expect(verification.totalMovements).toBe(2)
      expect(verification.finalBalance).toBe(7)
      expect(verification.errors).toHaveLength(0)
    })
  })
})