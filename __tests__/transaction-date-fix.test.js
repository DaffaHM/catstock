/**
 * @jest-environment jsdom
 */

import { createDemoTransaction } from '@/lib/utils/demo-transactions'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.dispatchEvent
global.window.dispatchEvent = jest.fn()

describe('Transaction Date Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock demo products
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'demo-products') {
        return JSON.stringify([
          {
            id: 'test-product-1',
            name: 'Test Product',
            sku: 'TEST-001',
            sellingPrice: 10000,
            currentStock: 100
          }
        ])
      }
      if (key === 'demo-transactions') {
        return JSON.stringify([])
      }
      return null
    })
  })

  describe('Date Handling', () => {
    test('should preserve selected date when creating transaction', () => {
      // Test January 28, 2026 (the problematic date)
      const selectedDate = new Date(2026, 0, 28, 12, 0, 0, 0) // January 28, 2026 at noon
      
      const transactionData = {
        type: 'OUT',
        transactionDate: selectedDate,
        notes: 'Test transaction',
        items: [{
          productId: 'test-product-1',
          quantity: 1,
          unitPrice: 10000,
          product: { id: 'test-product-1', name: 'Test Product' }
        }]
      }

      const result = createDemoTransaction(transactionData)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      
      // Check that the saved date matches the selected date
      const savedDate = new Date(result.data.transactionDate)
      expect(savedDate.getFullYear()).toBe(2026)
      expect(savedDate.getMonth()).toBe(0) // January (0-indexed)
      expect(savedDate.getDate()).toBe(28)
    })

    test('should handle January 29, 2026 correctly', () => {
      const selectedDate = new Date(2026, 0, 29, 12, 0, 0, 0) // January 29, 2026 at noon
      
      const transactionData = {
        type: 'OUT',
        transactionDate: selectedDate,
        notes: 'Test transaction for Jan 29',
        items: [{
          productId: 'test-product-1',
          quantity: 1,
          unitPrice: 10000,
          product: { id: 'test-product-1', name: 'Test Product' }
        }]
      }

      const result = createDemoTransaction(transactionData)
      
      expect(result.success).toBe(true)
      
      const savedDate = new Date(result.data.transactionDate)
      expect(savedDate.getFullYear()).toBe(2026)
      expect(savedDate.getMonth()).toBe(0) // January
      expect(savedDate.getDate()).toBe(29)
    })

    test('should handle January 27, 2026 correctly', () => {
      const selectedDate = new Date(2026, 0, 27, 12, 0, 0, 0) // January 27, 2026 at noon
      
      const transactionData = {
        type: 'OUT',
        transactionDate: selectedDate,
        notes: 'Test transaction for Jan 27',
        items: [{
          productId: 'test-product-1',
          quantity: 1,
          unitPrice: 10000,
          product: { id: 'test-product-1', name: 'Test Product' }
        }]
      }

      const result = createDemoTransaction(transactionData)
      
      expect(result.success).toBe(true)
      
      const savedDate = new Date(result.data.transactionDate)
      expect(savedDate.getFullYear()).toBe(2026)
      expect(savedDate.getMonth()).toBe(0) // January
      expect(savedDate.getDate()).toBe(27)
    })

    test('should handle multiple dates in sequence', () => {
      const testDates = [
        new Date(2026, 0, 25, 12, 0, 0, 0), // January 25
        new Date(2026, 0, 26, 12, 0, 0, 0), // January 26
        new Date(2026, 0, 27, 12, 0, 0, 0), // January 27
        new Date(2026, 0, 28, 12, 0, 0, 0), // January 28
        new Date(2026, 0, 29, 12, 0, 0, 0), // January 29
      ]

      testDates.forEach((selectedDate, index) => {
        const transactionData = {
          type: 'OUT',
          transactionDate: selectedDate,
          notes: `Test transaction ${index + 1}`,
          items: [{
            productId: 'test-product-1',
            quantity: 1,
            unitPrice: 10000,
            product: { id: 'test-product-1', name: 'Test Product' }
          }]
        }

        const result = createDemoTransaction(transactionData)
        
        expect(result.success).toBe(true)
        
        const savedDate = new Date(result.data.transactionDate)
        expect(savedDate.getFullYear()).toBe(selectedDate.getFullYear())
        expect(savedDate.getMonth()).toBe(selectedDate.getMonth())
        expect(savedDate.getDate()).toBe(selectedDate.getDate())
      })
    })
  })

  describe('DatePicker Format Functions', () => {
    // Test the date formatting functions that would be used in DatePicker
    test('should format dates correctly for input', () => {
      const testDate = new Date(2026, 0, 28, 12, 0, 0, 0) // January 28, 2026
      
      // Simulate the formatInputDate function
      const formatInputDate = (date) => {
        if (!date) return ''
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const formatted = formatInputDate(testDate)
      expect(formatted).toBe('2026-01-28')
    })

    test('should parse dates correctly from input', () => {
      const dateValue = '2026-01-28'
      
      // Simulate the handleDateChange function
      const handleDateChange = (dateValue) => {
        if (dateValue) {
          const [year, month, day] = dateValue.split('-').map(Number)
          const date = new Date(year, month - 1, day, 12, 0, 0, 0)
          return date
        }
        return null
      }

      const parsedDate = handleDateChange(dateValue)
      expect(parsedDate.getFullYear()).toBe(2026)
      expect(parsedDate.getMonth()).toBe(0) // January (0-indexed)
      expect(parsedDate.getDate()).toBe(28)
    })
  })

  describe('Edge Cases', () => {
    test('should handle end of month dates', () => {
      const endOfJanuary = new Date(2026, 0, 31, 12, 0, 0, 0) // January 31, 2026
      
      const transactionData = {
        type: 'OUT',
        transactionDate: endOfJanuary,
        notes: 'End of month test',
        items: [{
          productId: 'test-product-1',
          quantity: 1,
          unitPrice: 10000,
          product: { id: 'test-product-1', name: 'Test Product' }
        }]
      }

      const result = createDemoTransaction(transactionData)
      
      expect(result.success).toBe(true)
      
      const savedDate = new Date(result.data.transactionDate)
      expect(savedDate.getDate()).toBe(31)
      expect(savedDate.getMonth()).toBe(0) // January
    })

    test('should handle beginning of month dates', () => {
      const beginningOfFebruary = new Date(2026, 1, 1, 12, 0, 0, 0) // February 1, 2026
      
      const transactionData = {
        type: 'OUT',
        transactionDate: beginningOfFebruary,
        notes: 'Beginning of month test',
        items: [{
          productId: 'test-product-1',
          quantity: 1,
          unitPrice: 10000,
          product: { id: 'test-product-1', name: 'Test Product' }
        }]
      }

      const result = createDemoTransaction(transactionData)
      
      expect(result.success).toBe(true)
      
      const savedDate = new Date(result.data.transactionDate)
      expect(savedDate.getDate()).toBe(1)
      expect(savedDate.getMonth()).toBe(1) // February
    })

    test('should handle different times of day', () => {
      const testTimes = [
        new Date(2026, 0, 28, 0, 0, 0, 0),   // Midnight
        new Date(2026, 0, 28, 6, 0, 0, 0),   // 6 AM
        new Date(2026, 0, 28, 12, 0, 0, 0),  // Noon
        new Date(2026, 0, 28, 18, 0, 0, 0),  // 6 PM
        new Date(2026, 0, 28, 23, 59, 59, 999), // End of day
      ]

      testTimes.forEach((selectedDate, index) => {
        const transactionData = {
          type: 'OUT',
          transactionDate: selectedDate,
          notes: `Time test ${index + 1}`,
          items: [{
            productId: 'test-product-1',
            quantity: 1,
            unitPrice: 10000,
            product: { id: 'test-product-1', name: 'Test Product' }
          }]
        }

        const result = createDemoTransaction(transactionData)
        
        expect(result.success).toBe(true)
        
        const savedDate = new Date(result.data.transactionDate)
        // All should save as January 28, regardless of time
        expect(savedDate.getDate()).toBe(28)
        expect(savedDate.getMonth()).toBe(0) // January
        expect(savedDate.getFullYear()).toBe(2026)
      })
    })
  })

  describe('Integration with Daily Reports', () => {
    test('should be compatible with daily reports date filtering', () => {
      // Create a transaction for January 28
      const transactionDate = new Date(2026, 0, 28, 12, 0, 0, 0)
      
      const transactionData = {
        type: 'OUT',
        transactionDate: transactionDate,
        notes: 'Daily reports test',
        items: [{
          productId: 'test-product-1',
          quantity: 1,
          unitPrice: 10000,
          product: { id: 'test-product-1', name: 'Test Product' }
        }]
      }

      const result = createDemoTransaction(transactionData)
      expect(result.success).toBe(true)
      
      // Simulate daily reports date filtering
      const savedTransaction = result.data
      const savedDate = new Date(savedTransaction.transactionDate)
      
      // Check if transaction would be included in January 28 daily report
      const reportDate = new Date(2026, 0, 28, 0, 0, 0, 0)
      const nextDay = new Date(2026, 0, 29, 0, 0, 0, 0)
      
      const isInDateRange = savedDate >= reportDate && savedDate < nextDay
      expect(isInDateRange).toBe(true)
    })
  })
})