import { describe, it, expect } from '@jest/globals'
import {
  validateTransactionByType,
  validateStockLevels,
  TransactionType,
  transactionItemSchema,
  stockInTransactionSchema,
  stockOutTransactionSchema,
  stockAdjustTransactionSchema
} from '../lib/validations/transaction'

describe('Transaction Validation', () => {
  const mockDate = new Date('2024-01-15')
  
  const validTransactionItem = {
    productId: 'prod_123',
    quantity: 10,
    unitCost: 25.50,
    unitPrice: 35.00
  }

  describe('Transaction Item Schema', () => {
    it('should validate a valid transaction item', () => {
      expect(() => transactionItemSchema.parse(validTransactionItem)).not.toThrow()
    })

    it('should reject item without productId', () => {
      const invalidItem = { ...validTransactionItem, productId: '' }
      expect(() => transactionItemSchema.parse(invalidItem)).toThrow()
    })

    it('should reject item with zero quantity', () => {
      const invalidItem = { ...validTransactionItem, quantity: 0 }
      expect(() => transactionItemSchema.parse(invalidItem)).toThrow()
    })

    it('should reject item with negative quantity', () => {
      const invalidItem = { ...validTransactionItem, quantity: -5 }
      expect(() => transactionItemSchema.parse(invalidItem)).toThrow()
    })

    it('should allow optional pricing fields', () => {
      const itemWithoutPricing = {
        productId: 'prod_123',
        quantity: 5
      }
      expect(() => transactionItemSchema.parse(itemWithoutPricing)).not.toThrow()
    })
  })

  describe('Stock IN Transaction Validation', () => {
    const validStockInTransaction = {
      type: TransactionType.IN,
      transactionDate: mockDate,
      supplierId: 'supplier_123',
      notes: 'Test stock in',
      items: [{
        ...validTransactionItem,
        unitCost: 25.50
      }]
    }

    it('should validate a valid stock in transaction', () => {
      expect(() => stockInTransactionSchema.parse(validStockInTransaction)).not.toThrow()
    })

    it('should require supplier for stock in transactions', () => {
      const invalidTransaction = { ...validStockInTransaction, supplierId: '' }
      expect(() => stockInTransactionSchema.parse(invalidTransaction)).toThrow()
    })

    it('should require unit cost for stock in items', () => {
      const invalidTransaction = {
        ...validStockInTransaction,
        items: [{
          productId: 'prod_123',
          quantity: 10
          // Missing unitCost
        }]
      }
      expect(() => stockInTransactionSchema.parse(invalidTransaction)).toThrow()
    })

    it('should require at least one item', () => {
      const invalidTransaction = { ...validStockInTransaction, items: [] }
      expect(() => stockInTransactionSchema.parse(invalidTransaction)).toThrow()
    })
  })

  describe('Stock OUT Transaction Validation', () => {
    const validStockOutTransaction = {
      type: TransactionType.OUT,
      transactionDate: mockDate,
      notes: 'Test stock out',
      items: [{
        ...validTransactionItem,
        unitPrice: 35.00
      }]
    }

    it('should validate a valid stock out transaction', () => {
      expect(() => stockOutTransactionSchema.parse(validStockOutTransaction)).not.toThrow()
    })

    it('should require unit price for stock out items', () => {
      const invalidTransaction = {
        ...validStockOutTransaction,
        items: [{
          productId: 'prod_123',
          quantity: 10
          // Missing unitPrice
        }]
      }
      expect(() => stockOutTransactionSchema.parse(invalidTransaction)).toThrow()
    })

    it('should not require supplier for stock out transactions', () => {
      const transactionWithoutSupplier = { ...validStockOutTransaction, supplierId: null }
      expect(() => stockOutTransactionSchema.parse(transactionWithoutSupplier)).not.toThrow()
    })
  })

  describe('Stock ADJUST Transaction Validation', () => {
    const validAdjustTransaction = {
      type: TransactionType.ADJUST,
      transactionDate: mockDate,
      notes: 'Stock adjustment',
      items: [{
        productId: 'prod_123',
        quantity: -5 // Negative adjustment
      }]
    }

    it('should validate a valid adjustment transaction', () => {
      expect(() => stockAdjustTransactionSchema.parse(validAdjustTransaction)).not.toThrow()
    })

    it('should allow negative quantities for adjustments', () => {
      const negativeAdjustment = {
        ...validAdjustTransaction,
        items: [{
          productId: 'prod_123',
          quantity: -10
        }]
      }
      expect(() => stockAdjustTransactionSchema.parse(negativeAdjustment)).not.toThrow()
    })

    it('should allow positive quantities for adjustments', () => {
      const positiveAdjustment = {
        ...validAdjustTransaction,
        items: [{
          productId: 'prod_123',
          quantity: 15
        }]
      }
      expect(() => stockAdjustTransactionSchema.parse(positiveAdjustment)).not.toThrow()
    })
  })

  describe('validateTransactionByType', () => {
    it('should validate stock in transaction correctly', () => {
      const transaction = {
        type: TransactionType.IN,
        transactionDate: mockDate,
        supplierId: 'supplier_123',
        items: [{
          productId: 'prod_123',
          quantity: 10,
          unitCost: 25.50
        }]
      }
      
      expect(() => validateTransactionByType(transaction)).not.toThrow()
    })

    it('should validate stock out transaction correctly', () => {
      const transaction = {
        type: TransactionType.OUT,
        transactionDate: mockDate,
        items: [{
          productId: 'prod_123',
          quantity: 5,
          unitPrice: 35.00
        }]
      }
      
      expect(() => validateTransactionByType(transaction)).not.toThrow()
    })

    it('should validate adjustment transaction correctly', () => {
      const transaction = {
        type: TransactionType.ADJUST,
        transactionDate: mockDate,
        items: [{
          productId: 'prod_123',
          quantity: -3
        }]
      }
      
      expect(() => validateTransactionByType(transaction)).not.toThrow()
    })

    it('should throw error for invalid transaction type', () => {
      const transaction = {
        type: 'INVALID_TYPE',
        transactionDate: mockDate,
        items: [{
          productId: 'prod_123',
          quantity: 10
        }]
      }
      
      expect(() => validateTransactionByType(transaction)).toThrow()
    })
  })

  describe('validateStockLevels', () => {
    it('should allow positive stock levels', () => {
      const result = validateStockLevels('prod_123', 50, -10, false)
      expect(result).toBe(40)
    })

    it('should prevent negative stock levels by default', () => {
      expect(() => validateStockLevels('prod_123', 5, -10, false)).toThrow('Insufficient stock')
    })

    it('should allow negative stock levels when explicitly allowed', () => {
      const result = validateStockLevels('prod_123', 5, -10, true)
      expect(result).toBe(-5)
    })

    it('should handle zero current stock', () => {
      expect(() => validateStockLevels('prod_123', 0, -1, false)).toThrow('Insufficient stock')
    })

    it('should handle positive stock changes', () => {
      const result = validateStockLevels('prod_123', 10, 15, false)
      expect(result).toBe(25)
    })

    it('should provide detailed error message', () => {
      try {
        validateStockLevels('prod_123', 5, -10, false)
      } catch (error) {
        expect(error.message).toContain('Current: 5')
        expect(error.message).toContain('Requested: 10')
        expect(error.message).toContain('Available: 5')
      }
    })
  })

  describe('Return Transaction Validation', () => {
    it('should validate return in transaction', () => {
      const returnInTransaction = {
        type: TransactionType.RETURN_IN,
        transactionDate: mockDate,
        items: [{
          productId: 'prod_123',
          quantity: 5,
          unitCost: 20.00
        }]
      }
      
      expect(() => validateTransactionByType(returnInTransaction)).not.toThrow()
    })

    it('should validate return out transaction', () => {
      const returnOutTransaction = {
        type: TransactionType.RETURN_OUT,
        transactionDate: mockDate,
        items: [{
          productId: 'prod_123',
          quantity: 3,
          unitPrice: 30.00
        }]
      }
      
      expect(() => validateTransactionByType(returnOutTransaction)).not.toThrow()
    })

    it('should allow returns without pricing', () => {
      const returnWithoutPricing = {
        type: TransactionType.RETURN_IN,
        transactionDate: mockDate,
        items: [{
          productId: 'prod_123',
          quantity: 2
        }]
      }
      
      expect(() => validateTransactionByType(returnWithoutPricing)).not.toThrow()
    })
  })
})