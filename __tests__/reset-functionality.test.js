/**
 * @jest-environment jsdom
 */

import { getDemoProducts, saveDemoProduct, resetDemoProducts } from '@/lib/utils/demo-products'
import { getDemoSuppliers, saveDemoSupplier, resetDemoSuppliers } from '@/lib/utils/demo-suppliers'
import { getDemoTransactions, createDemoTransaction, resetDemoTransactions } from '@/lib/utils/demo-transactions'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Replace the global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Reset Functionality', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  describe('Products Reset', () => {
    test('should return empty array after reset', () => {
      // Mock localStorage to return empty array (reset state)
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify([])
        if (key === 'deleted-demo-products') return null
        return null
      })
      
      const products = getDemoProducts()
      expect(products).toEqual([])
    })

    test('should show base products on first load (no localStorage)', () => {
      // Mock localStorage to return null (first time user)
      localStorageMock.getItem.mockReturnValue(null)
      
      const products = getDemoProducts()
      expect(products.length).toBeGreaterThan(0)
      expect(products[0]).toHaveProperty('name')
      expect(products[0]).toHaveProperty('sku')
    })

    test('resetDemoProducts should set empty array', () => {
      resetDemoProducts()
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'demo-products',
        JSON.stringify([])
      )
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('deleted-demo-products')
    })
  })

  describe('Suppliers Reset', () => {
    test('should return empty array after reset', () => {
      // Mock localStorage to return empty array (reset state)
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-suppliers') return JSON.stringify([])
        if (key === 'deleted-demo-suppliers') return null
        return null
      })
      
      const suppliers = getDemoSuppliers()
      expect(suppliers).toEqual([])
    })

    test('should show base suppliers on first load (no localStorage)', () => {
      // Mock localStorage to return null (first time user)
      localStorageMock.getItem.mockReturnValue(null)
      
      const suppliers = getDemoSuppliers()
      expect(suppliers.length).toBeGreaterThan(0)
      expect(suppliers[0]).toHaveProperty('name')
    })

    test('resetDemoSuppliers should set empty array', () => {
      resetDemoSuppliers()
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'demo-suppliers',
        JSON.stringify([])
      )
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('deleted-demo-suppliers')
    })
  })

  describe('Transactions Reset', () => {
    test('should return empty array after reset', () => {
      // Mock localStorage to return empty array (reset state)
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))
      
      const result = getDemoTransactions()
      expect(result.transactions).toEqual([])
      expect(result.pagination.totalCount).toBe(0)
    })

    test('resetDemoTransactions should set empty array', () => {
      resetDemoTransactions()
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'demo-transactions',
        JSON.stringify([])
      )
    })

    test('should handle legacy transaction format', () => {
      // Mock localStorage to return legacy format
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ transactions: [] }))
      
      const result = getDemoTransactions()
      expect(result.transactions).toEqual([])
      expect(result.pagination.totalCount).toBe(0)
    })
  })

  describe('Integration Tests', () => {
    test('should maintain empty state after adding and resetting data', () => {
      const testProduct = {
        id: 'test-1',
        name: 'Test Product',
        sku: 'TEST-001',
        brand: 'Test Brand',
        category: 'Test',
        size: '1',
        unit: 'Liter',
        purchasePrice: 50000,
        sellingPrice: 75000,
        minimumStock: 10,
        currentStock: 0,
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // First, mock localStorage to return the test product
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify([testProduct])
        if (key === 'deleted-demo-products') return null
        return null
      })
      
      let products = getDemoProducts()
      expect(products).toHaveLength(1)
      expect(products[0].id).toBe('test-1')

      // Now reset
      resetDemoProducts()
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'demo-products',
        JSON.stringify([])
      )

      // Mock localStorage to return empty array after reset
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify([])
        if (key === 'deleted-demo-products') return null
        return null
      })
      
      products = getDemoProducts()
      expect(products).toEqual([])
    })
  })
})