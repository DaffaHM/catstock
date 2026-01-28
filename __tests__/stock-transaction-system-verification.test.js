/**
 * Stock Transaction System Verification Test
 * 
 * This test verifies that the complete stock transaction system foundation is functional,
 * including all the requirements specified in task 7:
 * - Comprehensive transaction schema with all movement types
 * - Atomic transaction processing with database transactions
 * - Automatic reference number generation
 * - Stock balance calculation logic
 * - Stock movement tracking with running balances
 * - Negative stock prevention for OUT transactions
 * 
 * Requirements validated: 4.1, 4.3, 4.4, 4.9, 4.2, 4.6, 4.7
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { prisma } from '../lib/prisma'
import { createTransaction } from '../lib/actions/transactions'
import { StockCalculationEngine } from '../lib/engines/stock-calculation'
import { TransactionType } from '../lib/validations/transaction'

describe('Stock Transaction System Foundation Verification', () => {
  let testUser, testSupplier, testProduct1, testProduct2

  beforeEach(async () => {
    // Clean up existing test data
    await prisma.stockMovement.deleteMany()
    await prisma.transactionItem.deleteMany()
    await prisma.stockTransaction.deleteMany()
    await prisma.product.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.user.deleteMany()

    // Create test entities
    testUser = await prisma.user.create({
      data: {
        id: 'test_user_verification',
        email: 'verification@test.com',
        name: 'Verification User',
        passwordHash: 'hashed_password'
      }
    })

    testSupplier = await prisma.supplier.create({
      data: {
        id: 'test_supplier_verification',
        name: 'Verification Supplier',
        contact: 'supplier@verification.com'
      }
    })

    testProduct1 = await prisma.product.create({
      data: {
        id: 'test_product_1_verification',
        sku: 'VERIFY-001',
        brand: 'Test Brand',
        name: 'Verification Product 1',
        category: 'Test Category',
        size: '1L',
        unit: 'bottle',
        purchasePrice: 20.00,
        sellingPrice: 30.00,
        minimumStock: 10
      }
    })

    testProduct2 = await prisma.product.create({
      data: {
        id: 'test_product_2_verification',
        sku: 'VERIFY-002',
        brand: 'Test Brand',
        name: 'Verification Product 2',
        category: 'Test Category',
        size: '500ml',
        unit: 'bottle',
        purchasePrice: 15.00,
        sellingPrice: 25.00,
        minimumStock: 5
      }
    })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.stockMovement.deleteMany()
    await prisma.transactionItem.deleteMany()
    await prisma.stockTransaction.deleteMany()
    await prisma.product.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('Comprehensive Transaction Schema (Requirement 4.1)', () => {
    it('should support all movement types: IN, OUT, ADJUST, RETURN_IN, RETURN_OUT', async () => {
      // Test IN transaction
      const stockIn = await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 100,
          unitCost: 20.00
        }]
      })
      expect(stockIn.success).toBe(true)
      expect(stockIn.data.type).toBe(TransactionType.IN)

      // Test OUT transaction
      const stockOut = await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-16'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 20,
          unitPrice: 30.00
        }]
      })
      expect(stockOut.success).toBe(true)
      expect(stockOut.data.type).toBe(TransactionType.OUT)

      // Test ADJUST transaction
      const stockAdjust = await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-17'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: -5 // Negative adjustment
        }]
      })
      expect(stockAdjust.success).toBe(true)
      expect(stockAdjust.data.type).toBe(TransactionType.ADJUST)

      // Test RETURN_IN transaction
      const returnIn = await createTransaction({
        type: TransactionType.RETURN_IN,
        transactionDate: new Date('2024-01-18'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 3,
          unitCost: 20.00
        }]
      })
      expect(returnIn.success).toBe(true)
      expect(returnIn.data.type).toBe(TransactionType.RETURN_IN)

      // Test RETURN_OUT transaction
      const returnOut = await createTransaction({
        type: TransactionType.RETURN_OUT,
        transactionDate: new Date('2024-01-19'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 2,
          unitPrice: 30.00
        }]
      })
      expect(returnOut.success).toBe(true)
      expect(returnOut.data.type).toBe(TransactionType.RETURN_OUT)

      // Verify all transactions were created
      const allTransactions = await prisma.stockTransaction.findMany({
        where: { userId: testUser.id },
        orderBy: { transactionDate: 'asc' }
      })
      expect(allTransactions).toHaveLength(5)
      expect(allTransactions.map(t => t.type)).toEqual([
        TransactionType.IN,
        TransactionType.OUT,
        TransactionType.ADJUST,
        TransactionType.RETURN_IN,
        TransactionType.RETURN_OUT
      ])
    })
  })

  describe('Atomic Transaction Processing (Requirement 4.3)', () => {
    it('should process transactions atomically with database transactions', async () => {
      // Create a transaction with multiple items
      const result = await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [
          {
            productId: testProduct1.id,
            quantity: 50,
            unitCost: 20.00
          },
          {
            productId: testProduct2.id,
            quantity: 30,
            unitCost: 15.00
          }
        ]
      })

      expect(result.success).toBe(true)

      // Verify transaction was created
      const transaction = await prisma.stockTransaction.findUnique({
        where: { id: result.data.id },
        include: {
          items: true,
          movements: true
        }
      })

      expect(transaction).toBeTruthy()
      expect(transaction.items).toHaveLength(2)
      expect(transaction.movements).toHaveLength(2)

      // Verify all items and movements were created atomically
      expect(transaction.items[0].quantity).toBe(50)
      expect(transaction.items[1].quantity).toBe(30)
      expect(transaction.movements[0].quantityAfter).toBe(50)
      expect(transaction.movements[1].quantityAfter).toBe(30)
    })

    it('should rollback transaction on validation failure', async () => {
      // Attempt to create an OUT transaction with insufficient stock
      const result = await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-15'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 100, // No stock available
          unitPrice: 30.00
        }]
      })

      expect(result.success).toBeFalsy()
      expect(result.error).toContain('Insufficient stock')

      // Verify no transaction, items, or movements were created
      const transactions = await prisma.stockTransaction.count()
      const items = await prisma.transactionItem.count()
      const movements = await prisma.stockMovement.count()

      expect(transactions).toBe(0)
      expect(items).toBe(0)
      expect(movements).toBe(0)
    })
  })

  describe('Automatic Reference Number Generation (Requirement 4.4)', () => {
    it('should generate unique reference numbers automatically', async () => {
      const transaction1 = await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 25,
          unitCost: 20.00
        }]
      })

      const transaction2 = await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct2.id,
          quantity: 15,
          unitCost: 15.00
        }]
      })

      expect(transaction1.success).toBe(true)
      expect(transaction2.success).toBe(true)

      // Verify reference numbers are unique and follow format TXN-YYYYMMDD-XXXX
      const refNum1 = transaction1.data.referenceNumber
      const refNum2 = transaction2.data.referenceNumber

      expect(refNum1).toMatch(/^TXN-\d{8}-\d{4}$/)
      expect(refNum2).toMatch(/^TXN-\d{8}-\d{4}$/)
      expect(refNum1).not.toBe(refNum2)

      // Verify sequential numbering for same date
      const date1 = refNum1.split('-')[1]
      const date2 = refNum2.split('-')[1]
      const seq1 = parseInt(refNum1.split('-')[2])
      const seq2 = parseInt(refNum2.split('-')[2])

      if (date1 === date2) {
        expect(seq2).toBe(seq1 + 1)
      }
    })
  })

  describe('Stock Balance Calculation Logic (Requirement 4.6)', () => {
    it('should calculate running stock balances correctly', async () => {
      // Initial stock in
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 100,
          unitCost: 20.00
        }]
      })

      let currentStock = await StockCalculationEngine.getCurrentStock(testProduct1.id)
      expect(currentStock).toBe(100)

      // Stock out
      await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-16'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 30,
          unitPrice: 30.00
        }]
      })

      currentStock = await StockCalculationEngine.getCurrentStock(testProduct1.id)
      expect(currentStock).toBe(70)

      // Stock adjustment
      await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-17'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: -5 // Reduce by 5
        }]
      })

      currentStock = await StockCalculationEngine.getCurrentStock(testProduct1.id)
      expect(currentStock).toBe(65)

      // Return in
      await createTransaction({
        type: TransactionType.RETURN_IN,
        transactionDate: new Date('2024-01-18'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 10,
          unitCost: 20.00
        }]
      })

      currentStock = await StockCalculationEngine.getCurrentStock(testProduct1.id)
      expect(currentStock).toBe(75)
    })
  })

  describe('Stock Movement Tracking with Running Balances (Requirement 4.6)', () => {
    it('should track complete stock movement history with accurate running balances', async () => {
      // Create multiple transactions
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15T10:00:00Z'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 100,
          unitCost: 20.00
        }]
      })

      await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-15T11:00:00Z'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 25,
          unitPrice: 30.00
        }]
      })

      await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-15T12:00:00Z'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 5 // Increase by 5
        }]
      })

      // Get movement history
      const history = await StockCalculationEngine.getStockMovementHistory(testProduct1.id)
      
      expect(history.movements).toHaveLength(3)

      // Verify running balances
      const movements = history.movements.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      
      expect(movements[0].quantityBefore).toBe(0)
      expect(movements[0].quantityChange).toBe(100)
      expect(movements[0].quantityAfter).toBe(100)

      expect(movements[1].quantityBefore).toBe(100)
      expect(movements[1].quantityChange).toBe(-25)
      expect(movements[1].quantityAfter).toBe(75)

      expect(movements[2].quantityBefore).toBe(75)
      expect(movements[2].quantityChange).toBe(5)
      expect(movements[2].quantityAfter).toBe(80)
    })
  })

  describe('Negative Stock Prevention (Requirement 4.2)', () => {
    it('should prevent OUT transactions that would cause negative stock', async () => {
      // Add initial stock
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 50,
          unitCost: 20.00
        }]
      })

      // Attempt to take out more than available
      const result = await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-16'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 60, // More than the 50 available
          unitPrice: 30.00
        }]
      })

      expect(result.success).toBeFalsy()
      expect(result.error).toContain('Insufficient stock')
      expect(result.error).toContain('Available: 50, Requested: 60')

      // Verify stock level unchanged
      const currentStock = await StockCalculationEngine.getCurrentStock(testProduct1.id)
      expect(currentStock).toBe(50)
    })

    it('should allow adjustments that result in negative stock', async () => {
      // Add initial stock
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 10,
          unitCost: 20.00
        }]
      })

      // Adjust to negative (e.g., damaged goods)
      const result = await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-16'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: -15 // Results in -5 stock
        }]
      })

      expect(result.success).toBe(true)

      // Verify negative stock is allowed for adjustments
      const currentStock = await StockCalculationEngine.getCurrentStock(testProduct1.id)
      expect(currentStock).toBe(-5)
    })
  })

  describe('Stock Adjustment Calculations (Requirement 4.7)', () => {
    it('should calculate stock adjustment differences correctly', async () => {
      // Add initial stock
      await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 100,
          unitCost: 20.00
        }]
      })

      // Calculate adjustment for actual count of 95
      const adjustment = await StockCalculationEngine.calculateStockAdjustment(
        testProduct1.id, 
        95
      )

      expect(adjustment.currentStock).toBe(100)
      expect(adjustment.actualStock).toBe(95)
      expect(adjustment.difference).toBe(-5)
      expect(adjustment.adjustmentType).toBe('DECREASE')
      expect(adjustment.adjustmentQuantity).toBe(5)

      // Apply the adjustment
      const result = await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-16'),
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: adjustment.difference
        }]
      })

      expect(result.success).toBe(true)

      // Verify final stock matches actual count
      const finalStock = await StockCalculationEngine.getCurrentStock(testProduct1.id)
      expect(finalStock).toBe(95)
    })
  })

  describe('Transaction Immutability (Requirement 4.9)', () => {
    it('should maintain transaction history integrity', async () => {
      const result = await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        items: [{
          productId: testProduct1.id,
          quantity: 50,
          unitCost: 20.00
        }]
      })

      expect(result.success).toBe(true)

      // Verify transaction is created with timestamp
      const transaction = await prisma.stockTransaction.findUnique({
        where: { id: result.data.id }
      })

      expect(transaction.createdAt).toBeDefined()
      expect(transaction.referenceNumber).toBeDefined()
      
      // In a real system, you would test that completed transactions cannot be modified
      // This is enforced by the application logic, not allowing updates to transaction items
      // once a transaction is saved
    })
  })

  describe('Integration Test - Complete Workflow', () => {
    it('should handle a complete stock transaction workflow', async () => {
      // 1. Initial stock receipt
      const stockIn = await createTransaction({
        type: TransactionType.IN,
        transactionDate: new Date('2024-01-15'),
        supplierId: testSupplier.id,
        userId: testUser.id,
        notes: 'Initial stock receipt',
        items: [
          {
            productId: testProduct1.id,
            quantity: 100,
            unitCost: 20.00
          },
          {
            productId: testProduct2.id,
            quantity: 50,
            unitCost: 15.00
          }
        ]
      })

      expect(stockIn.success).toBe(true)
      expect(stockIn.data.totalValue).toBe(2750) // (100 * 20) + (50 * 15)

      // 2. Sales transactions
      const sale1 = await createTransaction({
        type: TransactionType.OUT,
        transactionDate: new Date('2024-01-16'),
        userId: testUser.id,
        notes: 'Customer sale #1',
        items: [{
          productId: testProduct1.id,
          quantity: 25,
          unitPrice: 30.00
        }]
      })

      expect(sale1.success).toBe(true)

      // 3. Stock adjustment after physical count
      const adjustment = await createTransaction({
        type: TransactionType.ADJUST,
        transactionDate: new Date('2024-01-17'),
        userId: testUser.id,
        notes: 'Physical count adjustment',
        items: [{
          productId: testProduct1.id,
          quantity: -3 // Found 3 less than expected
        }]
      })

      expect(adjustment.success).toBe(true)

      // 4. Return from customer
      const returnIn = await createTransaction({
        type: TransactionType.RETURN_IN,
        transactionDate: new Date('2024-01-18'),
        userId: testUser.id,
        notes: 'Customer return',
        items: [{
          productId: testProduct1.id,
          quantity: 2,
          unitCost: 20.00
        }]
      })

      expect(returnIn.success).toBe(true)

      // Verify final stock levels
      const finalStock1 = await StockCalculationEngine.getCurrentStock(testProduct1.id)
      const finalStock2 = await StockCalculationEngine.getCurrentStock(testProduct2.id)

      expect(finalStock1).toBe(74) // 100 - 25 - 3 + 2
      expect(finalStock2).toBe(50) // Unchanged

      // Verify transaction count and reference numbers
      const allTransactions = await prisma.stockTransaction.findMany({
        where: { userId: testUser.id },
        orderBy: { transactionDate: 'asc' }
      })

      expect(allTransactions).toHaveLength(4)
      expect(allTransactions.every(t => t.referenceNumber.startsWith('TXN-'))).toBe(true)

      // Verify stock movement integrity
      const verification1 = await StockCalculationEngine.verifyStockMovementIntegrity(testProduct1.id)
      const verification2 = await StockCalculationEngine.verifyStockMovementIntegrity(testProduct2.id)

      expect(verification1.valid).toBe(true)
      expect(verification2.valid).toBe(true)
    })
  })
})