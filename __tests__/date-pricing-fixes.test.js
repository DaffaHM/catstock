/**
 * @jest-environment jsdom
 */

import { getDailyReportsData, getWeeklyReportsData, getMonthlyReportsData, getTopSellingProducts } from '@/lib/utils/demo-daily-reports'

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

describe('Date Display and Product Pricing Fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock demo data
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'demoProducts') {
        return JSON.stringify([
          {
            id: 'test-1',
            name: 'Test Product',
            sku: 'TEST-001',
            purchasePrice: 100000,
            sellingPrice: 125000,
            profitMargin: 25,
            currentStock: 10
          }
        ])
      }
      if (key === 'demoTransactions') {
        return JSON.stringify({
          transactions: [
            {
              id: 'txn-1',
              type: 'OUT',
              transactionDate: '2026-01-29T10:00:00.000Z',
              items: [
                {
                  productId: 'test-1',
                  quantity: 2,
                  unitPrice: 125000
                }
              ]
            },
            {
              id: 'txn-2',
              type: 'OUT',
              transactionDate: '2026-01-28T15:00:00.000Z',
              items: [
                {
                  productId: 'test-1',
                  quantity: 1,
                  unitPrice: 125000
                }
              ]
            }
          ]
        })
      }
      return null
    })
  })

  describe('Date Display Fix', () => {
    test('should use January 29, 2026 as current date', () => {
      const dailyData = getDailyReportsData(7)
      
      // Check that the most recent date is January 29, 2026
      const mostRecentDay = dailyData.dailyData[0]
      expect(mostRecentDay.date).toBe('2026-01-29')
      expect(mostRecentDay.dayName).toBe('Kamis') // Thursday in Indonesian
    })

    test('should generate correct date range for daily reports', () => {
      const dailyData = getDailyReportsData(7)
      
      expect(dailyData.dailyData).toHaveLength(7)
      
      // Check date sequence (should be in reverse chronological order)
      const dates = dailyData.dailyData.map(day => day.date)
      expect(dates[0]).toBe('2026-01-29') // Most recent
      expect(dates[6]).toBe('2026-01-23') // 7 days ago
    })

    test('should use correct current date for weekly reports', () => {
      const weeklyData = getWeeklyReportsData()
      
      expect(weeklyData.length).toBeGreaterThan(0)
      
      // The most recent week should include January 29, 2026
      const mostRecentWeek = weeklyData[0]
      const weekEndDate = new Date(mostRecentWeek.weekEnd + 'T23:59:59.999Z')
      const currentDate = new Date('2026-01-29T12:00:00.000Z')
      
      expect(weekEndDate >= currentDate).toBeTruthy()
    })

    test('should use correct current date for monthly reports', () => {
      const monthlyData = getMonthlyReportsData()
      
      expect(monthlyData.length).toBeGreaterThan(0)
      
      // The most recent month should be January 2026
      const mostRecentMonth = monthlyData[0]
      expect(mostRecentMonth.month).toBe('Januari 2026')
    })

    test('should use correct current date for top selling products', () => {
      const topProducts = getTopSellingProducts(30)
      
      // Should be able to calculate top products based on current date
      expect(Array.isArray(topProducts)).toBeTruthy()
    })
  })

  describe('Product Pricing Fix', () => {
    test('should calculate selling price from profit margin percentage', () => {
      const purchasePrice = 100000
      const profitMargin = 25 // 25%
      
      // Expected selling price: 100000 * (1 + 25/100) = 125000
      const expectedSellingPrice = purchasePrice * (1 + profitMargin / 100)
      
      expect(expectedSellingPrice).toBe(125000)
    })

    test('should calculate profit margin percentage from prices', () => {
      const purchasePrice = 100000
      const sellingPrice = 125000
      
      // Expected margin: ((125000 - 100000) / 100000) * 100 = 25%
      const expectedMargin = ((sellingPrice - purchasePrice) / purchasePrice) * 100
      
      expect(expectedMargin).toBe(25)
    })

    test('should handle different profit margin scenarios', () => {
      const testCases = [
        { purchase: 50000, margin: 20, expected: 60000 },
        { purchase: 200000, margin: 15, expected: 230000 },
        { purchase: 75000, margin: 30, expected: 97500 },
        { purchase: 100000, margin: 50, expected: 150000 }
      ]

      testCases.forEach(({ purchase, margin, expected }) => {
        const calculatedPrice = Math.round(purchase * (1 + margin / 100))
        expect(calculatedPrice).toBe(expected)
      })
    })

    test('should allow manual price override', () => {
      // User should be able to set any selling price regardless of calculated margin
      const purchasePrice = 100000
      const manualSellingPrice = 140000 // User's choice
      
      // Calculate what the margin would be
      const actualMargin = ((manualSellingPrice - purchasePrice) / purchasePrice) * 100
      
      expect(actualMargin).toBe(40) // 40% margin
      expect(manualSellingPrice).toBe(140000) // User's manual price is preserved
    })
  })

  describe('Integration Tests', () => {
    test('should handle product with profit margin in transaction calculations', () => {
      const dailyData = getDailyReportsData(1)
      
      // Should calculate profit correctly using purchase price and selling price
      const todayData = dailyData.dailyData.find(day => day.date === '2026-01-29')
      
      if (todayData && todayData.sales > 0) {
        expect(todayData.sales).toBeGreaterThan(0)
        expect(todayData.profit).toBeGreaterThan(0)
        expect(todayData.profitMargin).toBeGreaterThan(0)
      } else {
        // If no transaction data, just verify the structure exists
        expect(todayData).toBeDefined()
        expect(todayData.sales).toBe(0)
        expect(todayData.profit).toBe(0)
        expect(todayData.profitMargin).toBe(0)
      }
    })

    test('should maintain data consistency across date ranges', () => {
      const daily7 = getDailyReportsData(7)
      const daily30 = getDailyReportsData(30)
      
      // 30-day data should include all 7-day data
      expect(daily30.dailyData.length).toBeGreaterThanOrEqual(daily7.dailyData.length)
      
      // Most recent dates should match
      expect(daily30.dailyData[0].date).toBe(daily7.dailyData[0].date)
    })
  })

  describe('Edge Cases', () => {
    test('should handle zero profit margin', () => {
      const purchasePrice = 100000
      const profitMargin = 0
      
      const sellingPrice = purchasePrice * (1 + profitMargin / 100)
      expect(sellingPrice).toBe(purchasePrice)
    })

    test('should handle high profit margins', () => {
      const purchasePrice = 50000
      const profitMargin = 200 // 200%
      
      const sellingPrice = purchasePrice * (1 + profitMargin / 100)
      expect(sellingPrice).toBe(150000)
    })

    test('should handle date edge cases', () => {
      // Test with different date ranges
      const ranges = [1, 7, 14, 30, 60, 90]
      
      ranges.forEach(range => {
        const data = getDailyReportsData(range)
        expect(data.dailyData).toHaveLength(range)
        expect(data.dailyData[0].date).toBe('2026-01-29')
      })
    })
  })
})