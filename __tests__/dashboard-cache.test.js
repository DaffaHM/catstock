/**
 * Dashboard Caching System Tests
 */

import {
  getCachedData,
  setCachedData,
  invalidateCache,
  invalidateMultiple,
  invalidateDashboardCache,
  clearAllCache,
  getCacheStats,
  cleanupExpiredEntries,
  withCache,
  invalidateTransactionRelatedCache,
  invalidateProductRelatedCache,
  CACHE_CONFIG
} from '@/lib/cache/dashboard-cache'

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log
beforeAll(() => {
  console.log = jest.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
})

describe('Dashboard Cache System', () => {
  beforeEach(() => {
    clearAllCache()
  })

  describe('Basic Cache Operations', () => {
    test('should set and get cached data', () => {
      const testData = { message: 'Hello, World!' }
      const key = 'test_key'
      const ttl = 5000 // 5 seconds

      setCachedData(key, testData, ttl)
      const cachedData = getCachedData(key)

      expect(cachedData).toEqual(testData)
    })

    test('should return null for non-existent key', () => {
      const cachedData = getCachedData('non_existent_key')
      expect(cachedData).toBeNull()
    })

    test('should return null for expired data', async () => {
      const testData = { message: 'This will expire' }
      const key = 'expiring_key'
      const ttl = 10 // 10 milliseconds

      setCachedData(key, testData, ttl)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 20))
      
      const cachedData = getCachedData(key)
      expect(cachedData).toBeNull()
    })

    test('should invalidate specific cache key', () => {
      const testData = { message: 'To be invalidated' }
      const key = 'invalidate_test'
      const ttl = 5000

      setCachedData(key, testData, ttl)
      expect(getCachedData(key)).toEqual(testData)

      invalidateCache(key)
      expect(getCachedData(key)).toBeNull()
    })

    test('should invalidate multiple cache keys', () => {
      const testData1 = { message: 'Data 1' }
      const testData2 = { message: 'Data 2' }
      const testData3 = { message: 'Data 3' }
      const ttl = 5000

      setCachedData('key1', testData1, ttl)
      setCachedData('key2', testData2, ttl)
      setCachedData('key3', testData3, ttl)

      invalidateMultiple(['key1', 'key2'])

      expect(getCachedData('key1')).toBeNull()
      expect(getCachedData('key2')).toBeNull()
      expect(getCachedData('key3')).toEqual(testData3)
    })

    test('should clear all cache', () => {
      const ttl = 5000

      setCachedData('key1', { data: 1 }, ttl)
      setCachedData('key2', { data: 2 }, ttl)
      setCachedData('key3', { data: 3 }, ttl)

      clearAllCache()

      expect(getCachedData('key1')).toBeNull()
      expect(getCachedData('key2')).toBeNull()
      expect(getCachedData('key3')).toBeNull()
    })
  })

  describe('Cache Statistics', () => {
    test('should provide accurate cache statistics', () => {
      const ttl = 5000

      setCachedData('key1', { data: 'test1' }, ttl)
      setCachedData('key2', { data: 'test2' }, ttl)

      const stats = getCacheStats()

      expect(stats.totalEntries).toBe(2)
      expect(stats.validEntries).toBe(2)
      expect(stats.expiredEntries).toBe(0)
      expect(stats.entriesByKey).toHaveProperty('key1')
      expect(stats.entriesByKey).toHaveProperty('key2')
      expect(stats.totalMemoryUsage).toBeGreaterThan(0)
    })

    test('should track expired entries in statistics', async () => {
      const shortTtl = 10 // 10 milliseconds
      const longTtl = 5000

      setCachedData('expiring_key', { data: 'expires' }, shortTtl)
      setCachedData('valid_key', { data: 'valid' }, longTtl)

      // Wait for one entry to expire
      await new Promise(resolve => setTimeout(resolve, 20))

      const stats = getCacheStats()

      expect(stats.totalEntries).toBe(2)
      expect(stats.validEntries).toBe(1)
      expect(stats.expiredEntries).toBe(1)
    })
  })

  describe('Cache Cleanup', () => {
    test('should clean up expired entries', async () => {
      const shortTtl = 10 // 10 milliseconds
      const longTtl = 5000

      setCachedData('expiring1', { data: 'expires1' }, shortTtl)
      setCachedData('expiring2', { data: 'expires2' }, shortTtl)
      setCachedData('valid', { data: 'valid' }, longTtl)

      // Wait for entries to expire
      await new Promise(resolve => setTimeout(resolve, 20))

      const deletedCount = cleanupExpiredEntries()

      expect(deletedCount).toBe(2)
      expect(getCachedData('expiring1')).toBeNull()
      expect(getCachedData('expiring2')).toBeNull()
      expect(getCachedData('valid')).toEqual({ data: 'valid' })
    })
  })

  describe('Cache Wrapper Function', () => {
    test('should cache function results', async () => {
      let callCount = 0
      const mockFunction = jest.fn(async () => {
        callCount++
        return { result: `call_${callCount}` }
      })

      const key = 'function_cache_test'
      const ttl = 1000

      // First call should execute function
      const result1 = await withCache(key, mockFunction, ttl)
      expect(result1).toEqual({ result: 'call_1' })
      expect(mockFunction).toHaveBeenCalledTimes(1)

      // Second call should return cached result
      const result2 = await withCache(key, mockFunction, ttl)
      expect(result2).toEqual({ result: 'call_1' })
      expect(mockFunction).toHaveBeenCalledTimes(1) // Still only called once
    })

    test('should handle function errors properly', async () => {
      const mockFunction = jest.fn(async () => {
        throw new Error('Test error')
      })

      const key = 'error_test'
      const ttl = 1000

      await expect(withCache(key, mockFunction, ttl)).rejects.toThrow('Test error')
      
      // Should not cache error results
      expect(getCachedData(key)).toBeNull()
    })
  })

  describe('Dashboard-Specific Cache Invalidation', () => {
    test('should invalidate all dashboard cache', () => {
      const ttl = 5000

      // Set up dashboard-related cache entries
      Object.values(CACHE_CONFIG.KEYS).forEach(key => {
        setCachedData(key, { data: `test_${key}` }, ttl)
      })

      // Set up non-dashboard cache entry
      setCachedData('other_key', { data: 'other' }, ttl)

      invalidateDashboardCache()

      // Dashboard cache should be cleared
      Object.values(CACHE_CONFIG.KEYS).forEach(key => {
        expect(getCachedData(key)).toBeNull()
      })

      // Non-dashboard cache should remain
      expect(getCachedData('other_key')).toEqual({ data: 'other' })
    })

    test('should invalidate transaction-related cache', () => {
      const ttl = 5000

      // Set up all cache entries
      Object.values(CACHE_CONFIG.KEYS).forEach(key => {
        setCachedData(key, { data: `test_${key}` }, ttl)
      })

      invalidateTransactionRelatedCache()

      // Transaction-related cache should be cleared
      expect(getCachedData(CACHE_CONFIG.KEYS.DASHBOARD_STATS)).toBeNull()
      expect(getCachedData(CACHE_CONFIG.KEYS.LOW_STOCK_ALERTS)).toBeNull()
      expect(getCachedData(CACHE_CONFIG.KEYS.QUICK_STATS)).toBeNull()
      expect(getCachedData(CACHE_CONFIG.KEYS.RECENT_ACTIVITY)).toBeNull()
      expect(getCachedData(CACHE_CONFIG.KEYS.STOCK_SUMMARY)).toBeNull()
    })

    test('should invalidate product-related cache', () => {
      const ttl = 5000

      // Set up all cache entries
      Object.values(CACHE_CONFIG.KEYS).forEach(key => {
        setCachedData(key, { data: `test_${key}` }, ttl)
      })

      invalidateProductRelatedCache()

      // Product-related cache should be cleared
      expect(getCachedData(CACHE_CONFIG.KEYS.DASHBOARD_STATS)).toBeNull()
      expect(getCachedData(CACHE_CONFIG.KEYS.LOW_STOCK_ALERTS)).toBeNull()
      expect(getCachedData(CACHE_CONFIG.KEYS.QUICK_STATS)).toBeNull()
      expect(getCachedData(CACHE_CONFIG.KEYS.STOCK_SUMMARY)).toBeNull()

      // Recent activity should remain (not affected by product changes)
      expect(getCachedData(CACHE_CONFIG.KEYS.RECENT_ACTIVITY)).toEqual({ 
        data: `test_${CACHE_CONFIG.KEYS.RECENT_ACTIVITY}` 
      })
    })
  })

  describe('Cache Configuration', () => {
    test('should have valid cache configuration', () => {
      expect(CACHE_CONFIG.TTL).toBeDefined()
      expect(CACHE_CONFIG.KEYS).toBeDefined()

      // Check TTL values are positive numbers
      Object.values(CACHE_CONFIG.TTL).forEach(ttl => {
        expect(typeof ttl).toBe('number')
        expect(ttl).toBeGreaterThan(0)
      })

      // Check all keys are strings
      Object.values(CACHE_CONFIG.KEYS).forEach(key => {
        expect(typeof key).toBe('string')
        expect(key.length).toBeGreaterThan(0)
      })
    })

    test('should have reasonable TTL values', () => {
      // TTL values should be between 1 minute and 1 hour
      const minTTL = 60 * 1000 // 1 minute
      const maxTTL = 60 * 60 * 1000 // 1 hour

      Object.values(CACHE_CONFIG.TTL).forEach(ttl => {
        expect(ttl).toBeGreaterThanOrEqual(minTTL)
        expect(ttl).toBeLessThanOrEqual(maxTTL)
      })
    })
  })
})