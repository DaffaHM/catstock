/**
 * @jest-environment jsdom
 */

import { getDailyReportsData, getWeeklyReportsData, getMonthlyReportsData, getTopSellingProducts } from '@/lib/utils/demo-daily-reports'
import { getDemoProducts, saveDemoProduct } from '@/lib/utils/demo-products'
import { getDemoTransactions, createDemoTransaction } from '@/lib/utils/demo-transactions'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn()
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent
})

describe('Daily Reports Real-time Functionality', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
    mockDispatchEvent.mockClear()
  })

  describe('Real-time Data Loading', () => {
    test('should load fresh data from localStorage', () => {
      // Mock products data
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Test Product',
          sku: 'TEST-001',
          purchasePrice: 50000,
          sellingPrice: 75000,
          currentStock: 10
        }
      ]

      // Mock transactions data
      const mockTransactions = [
        {
          id: 'txn-1',
          type: 'OUT',
          transactionDate: new Date().toISOString(),
          items: [{
            productId: 'prod-1',
            quantity: 2,
            unitPrice: 75000
          }]
        }
      ]

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify(mockProducts)
        if (key === 'demo-transactions') return JSON.stringify(mockTransactions)
        if (key === 'deleted-demo-products') return null
        return null
      })

      const dailyData = getDailyReportsData(7)

      expect(dailyData).toBeDefined()
      expect(dailyData.dailyData).toBeInstanceOf(Array)
      expect(dailyData.summary).toBeDefined()
      expect(dailyData.summary.totalSales).toBeGreaterThanOrEqual(0)
      expect(dailyData.summary.totalProfit).toBeGreaterThanOrEqual(0)
    })

    test('should calculate correct daily sales and profit', () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Test Product',
          sku: 'TEST-001',
          purchasePrice: 50000,
          sellingPrice: 75000,
          currentStock: 10
        }
      ]

      const today = new Date()
      const mockTransactions = [
        {
          id: 'txn-1',
          type: 'OUT',
          transactionDate: today.toISOString(),
          items: [{
            productId: 'prod-1',
            quantity: 2,
            unitPrice: 75000
          }]
        }
      ]

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify(mockProducts)
        if (key === 'demo-transactions') return JSON.stringify(mockTransactions)
        if (key === 'deleted-demo-products') return null
        return null
      })

      const dailyData = getDailyReportsData(1)
      const todayData = dailyData.dailyData[0]

      expect(todayData.sales).toBe(150000) // 2 * 75000
      expect(todayData.profit).toBe(50000) // (75000 - 50000) * 2
      expect(todayData.transactionCount).toBe(1)
      expect(todayData.itemsSold).toBe(2)
    })

    test('should handle empty data gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify([])
        if (key === 'demo-transactions') return JSON.stringify([])
        if (key === 'deleted-demo-products') return null
        return null
      })

      const dailyData = getDailyReportsData(7)

      expect(dailyData.dailyData).toHaveLength(7)
      expect(dailyData.summary.totalSales).toBe(0)
      expect(dailyData.summary.totalProfit).toBe(0)
      expect(dailyData.summary.totalTransactions).toBe(0)
    })
  })

  describe('Weekly and Monthly Reports', () => {
    test('should generate weekly reports correctly', () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Test Product',
          sku: 'TEST-001',
          purchasePrice: 50000,
          sellingPrice: 75000,
          currentStock: 10
        }
      ]

      const mockTransactions = [
        {
          id: 'txn-1',
          type: 'OUT',
          transactionDate: new Date().toISOString(),
          items: [{
            productId: 'prod-1',
            quantity: 1,
            unitPrice: 75000
          }]
        }
      ]

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify(mockProducts)
        if (key === 'demo-transactions') return JSON.stringify(mockTransactions)
        if (key === 'deleted-demo-products') return null
        return null
      })

      const weeklyData = getWeeklyReportsData()

      expect(weeklyData).toBeInstanceOf(Array)
      expect(weeklyData.length).toBeGreaterThan(0)
      expect(weeklyData[0]).toHaveProperty('sales')
      expect(weeklyData[0]).toHaveProperty('profit')
      expect(weeklyData[0]).toHaveProperty('weekLabel')
    })

    test('should generate monthly reports correctly', () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Test Product',
          sku: 'TEST-001',
          purchasePrice: 50000,
          sellingPrice: 75000,
          currentStock: 10
        }
      ]

      const mockTransactions = [
        {
          id: 'txn-1',
          type: 'OUT',
          transactionDate: new Date().toISOString(),
          items: [{
            productId: 'prod-1',
            quantity: 1,
            unitPrice: 75000
          }]
        }
      ]

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify(mockProducts)
        if (key === 'demo-transactions') return JSON.stringify(mockTransactions)
        if (key === 'deleted-demo-products') return null
        return null
      })

      const monthlyData = getMonthlyReportsData()

      expect(monthlyData).toBeInstanceOf(Array)
      expect(monthlyData.length).toBeGreaterThan(0)
      expect(monthlyData[0]).toHaveProperty('sales')
      expect(monthlyData[0]).toHaveProperty('profit')
      expect(monthlyData[0]).toHaveProperty('month')
    })
  })

  describe('Top Selling Products', () => {
    test('should identify top selling products correctly', () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Product A',
          sku: 'PROD-A',
          category: 'Category 1',
          brand: 'Brand A',
          purchasePrice: 50000,
          sellingPrice: 75000,
          currentStock: 10
        },
        {
          id: 'prod-2',
          name: 'Product B',
          sku: 'PROD-B',
          category: 'Category 2',
          brand: 'Brand B',
          purchasePrice: 30000,
          sellingPrice: 45000,
          currentStock: 5
        }
      ]

      const mockTransactions = [
        {
          id: 'txn-1',
          type: 'OUT',
          transactionDate: new Date().toISOString(),
          items: [
            {
              productId: 'prod-1',
              quantity: 5,
              unitPrice: 75000
            },
            {
              productId: 'prod-2',
              quantity: 2,
              unitPrice: 45000
            }
          ]
        }
      ]

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify(mockProducts)
        if (key === 'demo-transactions') return JSON.stringify(mockTransactions)
        if (key === 'deleted-demo-products') return null
        return null
      })

      const topProducts = getTopSellingProducts(30)

      expect(topProducts).toBeInstanceOf(Array)
      expect(topProducts.length).toBeGreaterThan(0)
      
      // Product A should be first (sold 5 units)
      expect(topProducts[0].id).toBe('prod-1')
      expect(topProducts[0].quantitySold).toBe(5)
      expect(topProducts[0].totalRevenue).toBe(375000) // 5 * 75000
      expect(topProducts[0].totalProfit).toBe(125000) // (75000 - 50000) * 5

      // Product B should be second (sold 2 units)
      expect(topProducts[1].id).toBe('prod-2')
      expect(topProducts[1].quantitySold).toBe(2)
      expect(topProducts[1].totalRevenue).toBe(90000) // 2 * 45000
      expect(topProducts[1].totalProfit).toBe(30000) // (45000 - 30000) * 2
    })

    test('should handle no sales data', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify([])
        if (key === 'demo-transactions') return JSON.stringify([])
        if (key === 'deleted-demo-products') return null
        return null
      })

      const topProducts = getTopSellingProducts(30)

      expect(topProducts).toBeInstanceOf(Array)
      expect(topProducts).toHaveLength(0)
    })
  })

  describe('Real-time Data Synchronization', () => {
    test('should reflect new transactions immediately', () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Test Product',
          sku: 'TEST-001',
          purchasePrice: 50000,
          sellingPrice: 75000,
          currentStock: 10
        }
      ]

      // Initially no transactions
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify(mockProducts)
        if (key === 'demo-transactions') return JSON.stringify([])
        if (key === 'deleted-demo-products') return null
        return null
      })

      let dailyData = getDailyReportsData(1)
      expect(dailyData.summary.totalSales).toBe(0)

      // Add a transaction
      const newTransaction = {
        id: 'txn-1',
        type: 'OUT',
        transactionDate: new Date().toISOString(),
        items: [{
          productId: 'prod-1',
          quantity: 3,
          unitPrice: 75000
        }]
      }

      // Update mock to include new transaction
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify(mockProducts)
        if (key === 'demo-transactions') return JSON.stringify([newTransaction])
        if (key === 'deleted-demo-products') return null
        return null
      })

      dailyData = getDailyReportsData(1)
      expect(dailyData.summary.totalSales).toBe(225000) // 3 * 75000
      expect(dailyData.summary.totalProfit).toBe(75000) // (75000 - 50000) * 3
    })

    test('should handle date filtering correctly', () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Test Product',
          sku: 'TEST-001',
          purchasePrice: 50000,
          sellingPrice: 75000,
          currentStock: 10
        }
      ]

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 8)

      const mockTransactions = [
        {
          id: 'txn-today',
          type: 'OUT',
          transactionDate: today.toISOString(),
          items: [{ productId: 'prod-1', quantity: 1, unitPrice: 75000 }]
        },
        {
          id: 'txn-yesterday',
          type: 'OUT',
          transactionDate: yesterday.toISOString(),
          items: [{ productId: 'prod-1', quantity: 2, unitPrice: 75000 }]
        },
        {
          id: 'txn-lastweek',
          type: 'OUT',
          transactionDate: lastWeek.toISOString(),
          items: [{ productId: 'prod-1', quantity: 3, unitPrice: 75000 }]
        }
      ]

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'demo-products') return JSON.stringify(mockProducts)
        if (key === 'demo-transactions') return JSON.stringify(mockTransactions)
        if (key === 'deleted-demo-products') return null
        return null
      })

      // Test 2-day range (should include today and yesterday)
      const twoDayData = getDailyReportsData(2)
      expect(twoDayData.summary.totalSales).toBe(225000) // (1 + 2) * 75000

      // Test 7-day range (should include today and yesterday, but not last week)
      const sevenDayData = getDailyReportsData(7)
      expect(sevenDayData.summary.totalSales).toBe(225000) // (1 + 2) * 75000

      // Test 10-day range (should include all transactions)
      const tenDayData = getDailyReportsData(10)
      expect(tenDayData.summary.totalSales).toBe(450000) // (1 + 2 + 3) * 75000
    })
  })
})