/**
 * Stock Calculation Engine Tests
 * 
 * Tests for the stock calculation engine functionality including:
 * - Stock balance calculations
 * - Running balance tracking
 * - Negative stock prevention
 * - Stock movement history
 * - Real-time stock queries
 * - Stock adjustment calculations
 */

import { StockCalculationEngine } from '@/lib/engines/stock-calculation'
import { TransactionType } from '@/lib/validations/transaction'
import { prisma } from '@/lib/prisma'

// Mock prisma for testing
jest.mock('@/lib/prisma', () => ({
  prisma: {
    stockMovement: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn()
    }
  }
}))

describe('StockCalculationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculateQuantityChange', () => {
    test('should calculate positive change for IN transactions', () => {
      const result = StockCalculationEngine.calculateQuantityChange(TransactionType.IN, 10)
      expect(result).toBe(10)
    })

    test('should calculate positive change for RETURN_IN transactions', () => {
      const result = StockCalculationEngine.calculateQuantityChange(TransactionType.RETURN_IN, 5)
      expect(result).toBe(5)
    })

    test('should calculate negative change for OUT transactions', () => {
      const result = StockCalculationEngine.calculateQuantityChange(TransactionType.OUT, 8)
      expect(result).toBe(-8)
    })

    test('should calculate negative change for RETURN_OUT transactions', () => {
      const result = StockCalculationEngine.calculateQuantityChange(TransactionType.RETURN_OUT, 3)
      expect(result).toBe(-3)
    })

    test('should preserve sign for ADJUST transactions', () => {
      expect(StockCalculationEngine.calculateQuantityChange(TransactionType.ADJUST, 5)).toBe(5)
      expect(StockCalculationEngine.calculateQuantityChange(TransactionType.ADJUST, -3)).toBe(-3)
    })

    test('should handle absolute values correctly for IN/OUT', () => {
      expect(StockCalculationEngine.calculateQuantityChange(TransactionType.IN, -10)).toBe(10)
      expect(StockCalculationEngine.calculateQuantityChange(TransactionType.OUT, -8)).toBe(-8)
    })

    test('should throw error for unknown transaction type', () => {
      expect(() => {
        StockCalculationEngine.calculateQuantityChange('UNKNOWN', 10)
      }).toThrow('Unknown transaction type: UNKNOWN')
    })
  })

  describe('getCurrentStock', () => {
    test('should return current stock from latest movement', async () => {
      prisma.stockMovement.findFirst.mockResolvedValue({
        quantityAfter: 25
      })

      const result = await StockCalculationEngine.getCurrentStock('product-1')
      
      expect(result).toBe(25)
      expect(prisma.stockMovement.findFirst).toHaveBeenCalledWith({
        where: { productId: 'product-1' },
        orderBy: { createdAt: 'desc' },
        select: { quantityAfter: true }
      })
    })

    test('should return 0 when no movements exist', async () => {
      prisma.stockMovement.findFirst.mockResolvedValue(null)

      const result = await StockCalculationEngine.getCurrentStock('product-1')
      
      expect(result).toBe(0)
    })

    test('should work with transaction context', async () => {
      const mockTx = {
        stockMovement: {
          findFirst: jest.fn().mockResolvedValue({ quantityAfter: 15 })
        }
      }

      const result = await StockCalculationEngine.getCurrentStock('product-1', mockTx)
      
      expect(result).toBe(15)
      expect(mockTx.stockMovement.findFirst).toHaveBeenCalled()
    })
  })

  describe('getCurrentStockLevels', () => {
    test('should return stock levels for multiple products', async () => {
      prisma.stockMovement.findFirst
        .mockResolvedValueOnce({ quantityAfter: 10 })
        .mockResolvedValueOnce({ quantityAfter: 20 })
        .mockResolvedValueOnce(null)

      const result = await StockCalculationEngine.getCurrentStockLevels(['prod-1', 'prod-2', 'prod-3'])
      
      expect(result).toEqual({
        'prod-1': 10,
        'prod-2': 20,
        'prod-3': 0
      })
    })
  })

  describe('validateStockAvailability', () => {
    beforeEach(() => {
      // Mock getCurrentStockLevels
      jest.spyOn(StockCalculationEngine, 'getCurrentStockLevels').mockResolvedValue({
        'prod-1': 15,
        'prod-2': 5,
        'prod-3': 0
      })
    })

    test('should pass validation for IN transactions', async () => {
      const items = [{ productId: 'prod-1', quantity: 10 }]
      
      const result = await StockCalculationEngine.validateStockAvailability(
        items, TransactionType.IN
      )
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should pass validation for sufficient stock OUT transactions', async () => {
      const items = [{ productId: 'prod-1', quantity: 10 }]
      
      const result = await StockCalculationEngine.validateStockAvailability(
        items, TransactionType.OUT
      )
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should fail validation for insufficient stock OUT transactions', async () => {
      const items = [{ productId: 'prod-2', quantity: 10 }] // Only 5 available
      
      const result = await StockCalculationEngine.validateStockAvailability(
        items, TransactionType.OUT
      )
      
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].productId).toBe('prod-2')
      expect(result.errors[0].currentStock).toBe(5)
      expect(result.errors[0].requestedQuantity).toBe(10)
      expect(result.errors[0].shortfall).toBe(5)
    })

    test('should allow negative stock for adjustments when allowNegative is true', async () => {
      const items = [{ productId: 'prod-3', quantity: -5 }] // Reducing from 0
      
      const result = await StockCalculationEngine.validateStockAvailability(
        items, TransactionType.ADJUST, null, true
      )
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should prevent negative stock for adjustments when allowNegative is false', async () => {
      const items = [{ productId: 'prod-3', quantity: -5 }] // Reducing from 0
      
      const result = await StockCalculationEngine.validateStockAvailability(
        items, TransactionType.ADJUST, null, false
      )
      
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('calculateStockMovements', () => {
    beforeEach(() => {
      jest.spyOn(StockCalculationEngine, 'getCurrentStock')
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(20)
    })

    test('should calculate stock movements for transaction items', async () => {
      const items = [
        { productId: 'prod-1', quantity: 5 },
        { productId: 'prod-2', quantity: 3 }
      ]
      
      const result = await StockCalculationEngine.calculateStockMovements(
        items, TransactionType.OUT, 'txn-1'
      )
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        productId: 'prod-1',
        transactionId: 'txn-1',
        movementType: TransactionType.OUT,
        quantityBefore: 10,
        quantityChange: -5,
        quantityAfter: 5
      })
      expect(result[1]).toEqual({
        productId: 'prod-2',
        transactionId: 'txn-1',
        movementType: TransactionType.OUT,
        quantityBefore: 20,
        quantityChange: -3,
        quantityAfter: 17
      })
    })
  })

  describe('calculateRunningBalances', () => {
    test('should calculate running balances for movements', () => {
      const movements = [
        {
          id: '1',
          quantityBefore: 0,
          quantityChange: 10,
          quantityAfter: 10,
          createdAt: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          quantityBefore: 10,
          quantityChange: -3,
          quantityAfter: 7,
          createdAt: '2024-01-01T11:00:00Z'
        },
        {
          id: '3',
          quantityBefore: 7,
          quantityChange: 5,
          quantityAfter: 12,
          createdAt: '2024-01-01T12:00:00Z'
        }
      ]

      const result = StockCalculationEngine.calculateRunningBalances(movements)
      
      expect(result).toHaveLength(3)
      expect(result[0].runningBalance).toBe(10)
      expect(result[0].balanceVerified).toBe(true)
      expect(result[1].runningBalance).toBe(7)
      expect(result[1].balanceVerified).toBe(true)
      expect(result[2].runningBalance).toBe(12)
      expect(result[2].balanceVerified).toBe(true)
    })

    test('should handle out-of-order movements by sorting', () => {
      const movements = [
        {
          id: '2',
          quantityBefore: 10,
          quantityChange: -3,
          quantityAfter: 7,
          createdAt: '2024-01-01T11:00:00Z'
        },
        {
          id: '1',
          quantityBefore: 0,
          quantityChange: 10,
          quantityAfter: 10,
          createdAt: '2024-01-01T10:00:00Z'
        }
      ]

      const result = StockCalculationEngine.calculateRunningBalances(movements)
      
      // Should be sorted by date, so movement 1 comes first
      expect(result[0].id).toBe('1')
      expect(result[0].runningBalance).toBe(10)
      expect(result[1].id).toBe('2')
      expect(result[1].runningBalance).toBe(7)
    })
  })

  describe('calculateStockAdjustment', () => {
    test('should calculate positive adjustment', async () => {
      jest.spyOn(StockCalculationEngine, 'getCurrentStock').mockResolvedValue(10)

      const result = await StockCalculationEngine.calculateStockAdjustment('prod-1', 15)
      
      expect(result).toEqual({
        productId: 'prod-1',
        currentStock: 10,
        actualStock: 15,
        difference: 5,
        adjustmentType: 'INCREASE',
        adjustmentQuantity: 5
      })
    })

    test('should calculate negative adjustment', async () => {
      jest.spyOn(StockCalculationEngine, 'getCurrentStock').mockResolvedValue(10)

      const result = await StockCalculationEngine.calculateStockAdjustment('prod-1', 7)
      
      expect(result).toEqual({
        productId: 'prod-1',
        currentStock: 10,
        actualStock: 7,
        difference: -3,
        adjustmentType: 'DECREASE',
        adjustmentQuantity: 3
      })
    })

    test('should calculate no change adjustment', async () => {
      jest.spyOn(StockCalculationEngine, 'getCurrentStock').mockResolvedValue(10)

      const result = await StockCalculationEngine.calculateStockAdjustment('prod-1', 10)
      
      expect(result).toEqual({
        productId: 'prod-1',
        currentStock: 10,
        actualStock: 10,
        difference: 0,
        adjustmentType: 'NO_CHANGE',
        adjustmentQuantity: 0
      })
    })
  })

  describe('verifyStockMovementIntegrity', () => {
    test('should verify correct stock movements', async () => {
      const movements = [
        {
          id: 'mov-1',
          quantityBefore: 0,
          quantityChange: 10,
          quantityAfter: 10
        },
        {
          id: 'mov-2',
          quantityBefore: 10,
          quantityChange: -3,
          quantityAfter: 7
        }
      ]

      prisma.stockMovement.findMany.mockResolvedValue(movements)

      const result = await StockCalculationEngine.verifyStockMovementIntegrity('prod-1')
      
      expect(result.valid).toBe(true)
      expect(result.productId).toBe('prod-1')
      expect(result.totalMovements).toBe(2)
      expect(result.finalBalance).toBe(7)
      expect(result.errors).toHaveLength(0)
    })

    test('should detect balance mismatch errors', async () => {
      const movements = [
        {
          id: 'mov-1',
          quantityBefore: 0,
          quantityChange: 10,
          quantityAfter: 10
        },
        {
          id: 'mov-2',
          quantityBefore: 15, // Should be 10
          quantityChange: -3,
          quantityAfter: 12
        }
      ]

      prisma.stockMovement.findMany.mockResolvedValue(movements)

      const result = await StockCalculationEngine.verifyStockMovementIntegrity('prod-1')
      
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].issue).toBe('BALANCE_MISMATCH')
      expect(result.errors[0].expected).toBe(10)
      expect(result.errors[0].actual).toBe(15)
    })

    test('should detect calculation errors', async () => {
      const movements = [
        {
          id: 'mov-1',
          quantityBefore: 0,
          quantityChange: 10,
          quantityAfter: 11 // Should be 10
        }
      ]

      prisma.stockMovement.findMany.mockResolvedValue(movements)

      const result = await StockCalculationEngine.verifyStockMovementIntegrity('prod-1')
      
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].issue).toBe('CALCULATION_ERROR')
      expect(result.errors[0].expected).toBe(10)
      expect(result.errors[0].actual).toBe(11)
    })

    test('should handle products with no movements', async () => {
      prisma.stockMovement.findMany.mockResolvedValue([])

      const result = await StockCalculationEngine.verifyStockMovementIntegrity('prod-1')
      
      expect(result.valid).toBe(true)
      expect(result.message).toBe('No movements found for product')
    })
  })
})