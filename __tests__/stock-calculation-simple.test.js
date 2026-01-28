/**
 * Simple Stock Calculation Engine Tests
 * 
 * Focused tests for the stock calculation engine core functionality
 */

import { StockCalculationEngine } from '@/lib/engines/stock-calculation'
import { createTransaction } from '@/lib/actions/transactions'
import { TransactionType } from '@/lib/validations/transaction'
import { prisma } from '@/lib/prisma'

describe('Stock Calculation Engine - Core Functionality', () => {
  let testProduct, testSupplier, testUser

  beforeEach(async () => {
    // Clean up test data
    await prisma.stockMovement.deleteMany()
    await prisma.transactionItem.deleteMany()
    await prisma.stockTransaction.deleteMany()
    await prisma.product.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.user.deleteMany()

    // Create test data
    testUser = await prisma.user.create({
      data: {
        id: 'user_test_simple',
        email: 'simple@test.com',
        name: 'Simple Test User',
        passwordHash: 'hashed_password'
      }
    })

    testProduct = await prisma.product.create({
      data: {
        sku: 'SIMPLE-001',
        brand: 'Test Brand',
        name: 'Simple Test Product',
        category: 'Test Category',
        size: '1L',
        unit: 'bottle',
        minimumStock: 5
      }
    })

    testSupplier = await prisma.supplier.create({
      data: {
        name: 'Simple Test Supplier',
        contact: 'simple@supplier.com'
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

  test('should maintain accurate stock balances through transactions', async () => {
    // Initial stock should be 0
    let currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
    expect(currentStock).toBe(0)

    // Stock IN transaction
    const stockIn = await createTransaction({
      type: TransactionType.IN,
      transactionDate: new Date(),
      supplierId: testSupplier.id,
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 15,
        unitCost: 10.00
      }]
    })
    expect(stockIn.success).toBe(true)

    // Check stock after IN
    currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
    expect(currentStock).toBe(15)

    // Stock OUT transaction
    const stockOut = await createTransaction({
      type: TransactionType.OUT,
      transactionDate: new Date(),
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 5,
        unitPrice: 20.00
      }]
    })
    expect(stockOut.success).toBe(true)

    // Check stock after OUT
    currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
    expect(currentStock).toBe(10)

    // Stock ADJUSTMENT
    const adjustment = await createTransaction({
      type: TransactionType.ADJUST,
      transactionDate: new Date(),
      userId: testUser.id,
      notes: 'Test adjustment',
      items: [{
        productId: testProduct.id,
        quantity: -2 // Decrease by 2
      }]
    })
    expect(adjustment.success).toBe(true)

    // Check final stock
    currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
    expect(currentStock).toBe(8)
  })

  test('should prevent negative stock for OUT transactions', async () => {
    // Add some initial stock
    const stockInResult = await createTransaction({
      type: TransactionType.IN,
      transactionDate: new Date(),
      supplierId: testSupplier.id,
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 3,
        unitCost: 10.00
      }]
    })
    expect(stockInResult.success).toBe(true)

    // Try to take out more than available
    const stockOut = await createTransaction({
      type: TransactionType.OUT,
      transactionDate: new Date(),
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 5, // More than the 3 available
        unitPrice: 20.00
      }]
    })

    console.log('stockOut result:', stockOut)
    expect(stockOut).toBeDefined()
    expect(stockOut.success).toBeUndefined() // When there's an error, success is not set
    expect(stockOut.error).toBeDefined()
    expect(stockOut.error).toContain('Insufficient stock')

    // Verify stock unchanged
    const currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
    expect(currentStock).toBe(3)
  })

  test('should allow negative stock for adjustments', async () => {
    // Add some initial stock
    await createTransaction({
      type: TransactionType.IN,
      transactionDate: new Date(),
      supplierId: testSupplier.id,
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 2,
        unitCost: 10.00
      }]
    })

    // Adjustment that goes negative
    const adjustment = await createTransaction({
      type: TransactionType.ADJUST,
      transactionDate: new Date(),
      userId: testUser.id,
      notes: 'Inventory loss',
      items: [{
        productId: testProduct.id,
        quantity: -5 // Results in -3 stock
      }]
    })

    expect(adjustment.success).toBe(true)

    const currentStock = await StockCalculationEngine.getCurrentStock(testProduct.id)
    expect(currentStock).toBe(-3)
  })

  test('should calculate stock adjustments correctly', async () => {
    // Add initial stock
    await createTransaction({
      type: TransactionType.IN,
      transactionDate: new Date(),
      supplierId: testSupplier.id,
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 10,
        unitCost: 10.00
      }]
    })

    // Calculate adjustment needed
    const adjustment = await StockCalculationEngine.calculateStockAdjustment(
      testProduct.id,
      7 // Actual counted stock
    )

    expect(adjustment).toEqual({
      productId: testProduct.id,
      currentStock: 10,
      actualStock: 7,
      difference: -3,
      adjustmentType: 'DECREASE',
      adjustmentQuantity: 3
    })
  })

  test('should get real-time stock levels', async () => {
    // Add stock to product
    await createTransaction({
      type: TransactionType.IN,
      transactionDate: new Date(),
      supplierId: testSupplier.id,
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 12,
        unitCost: 10.00
      }]
    })

    const stockLevels = await StockCalculationEngine.getRealTimeStockLevels([testProduct.id])
    
    expect(stockLevels).toHaveLength(1)
    expect(stockLevels[0].productId).toBe(testProduct.id)
    expect(stockLevels[0].currentStock).toBe(12)
    expect(stockLevels[0].isLowStock).toBe(false) // 12 > 5 (minimum)
  })

  test('should identify low stock products', async () => {
    // Add stock below minimum
    await createTransaction({
      type: TransactionType.IN,
      transactionDate: new Date(),
      supplierId: testSupplier.id,
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 3, // Below minimum of 5
        unitCost: 10.00
      }]
    })

    const lowStockProducts = await StockCalculationEngine.getStockSummary({
      onlyLowStock: true
    })

    expect(lowStockProducts).toHaveLength(1)
    expect(lowStockProducts[0].productId).toBe(testProduct.id)
    expect(lowStockProducts[0].currentStock).toBe(3)
    expect(lowStockProducts[0].isLowStock).toBe(true)
  })

  test('should verify stock movement integrity', async () => {
    // Create some transactions
    await createTransaction({
      type: TransactionType.IN,
      transactionDate: new Date(),
      supplierId: testSupplier.id,
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 8,
        unitCost: 10.00
      }]
    })

    await createTransaction({
      type: TransactionType.OUT,
      transactionDate: new Date(),
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 3,
        unitPrice: 20.00
      }]
    })

    // Verify integrity
    const verification = await StockCalculationEngine.verifyStockMovementIntegrity(testProduct.id)

    expect(verification.valid).toBe(true)
    expect(verification.productId).toBe(testProduct.id)
    expect(verification.totalMovements).toBe(2)
    expect(verification.finalBalance).toBe(5)
    expect(verification.errors).toHaveLength(0)
  })
})