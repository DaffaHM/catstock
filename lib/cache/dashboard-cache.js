/**
 * Dashboard Data Caching System
 * Implements in-memory caching with TTL and invalidation for dashboard data
 */

// Simple in-memory cache store
const cache = new Map()

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  // Cache TTL (Time To Live) in milliseconds
  TTL: {
    DASHBOARD_STATS: 5 * 60 * 1000,      // 5 minutes
    LOW_STOCK_ALERTS: 10 * 60 * 1000,    // 10 minutes
    QUICK_STATS: 3 * 60 * 1000,          // 3 minutes
    RECENT_ACTIVITY: 2 * 60 * 1000,      // 2 minutes
    STOCK_SUMMARY: 15 * 60 * 1000        // 15 minutes
  },
  
  // Cache keys
  KEYS: {
    DASHBOARD_STATS: 'dashboard:stats',
    LOW_STOCK_ALERTS: 'dashboard:low_stock_alerts',
    QUICK_STATS: 'dashboard:quick_stats',
    RECENT_ACTIVITY: 'dashboard:recent_activity',
    STOCK_SUMMARY: 'dashboard:stock_summary'
  }
}

/**
 * Cache entry structure
 */
class CacheEntry {
  constructor(data, ttl) {
    this.data = data
    this.timestamp = Date.now()
    this.ttl = ttl
    this.expiresAt = this.timestamp + ttl
  }

  isExpired() {
    return Date.now() > this.expiresAt
  }

  isValid() {
    return !this.isExpired()
  }

  getRemainingTTL() {
    return Math.max(0, this.expiresAt - Date.now())
  }
}

/**
 * Get cached data if valid, otherwise return null
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if not found/expired
 */
export function getCachedData(key) {
  const entry = cache.get(key)
  
  if (!entry) {
    return null
  }
  
  if (entry.isExpired()) {
    cache.delete(key)
    return null
  }
  
  return entry.data
}

/**
 * Set data in cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
export function setCachedData(key, data, ttl) {
  const entry = new CacheEntry(data, ttl)
  cache.set(key, entry)
}

/**
 * Invalidate specific cache key
 * @param {string} key - Cache key to invalidate
 */
export function invalidateCache(key) {
  cache.delete(key)
}

/**
 * Invalidate multiple cache keys
 * @param {Array<string>} keys - Array of cache keys to invalidate
 */
export function invalidateMultiple(keys) {
  keys.forEach(key => cache.delete(key))
}

/**
 * Invalidate all dashboard-related cache
 */
export function invalidateDashboardCache() {
  const dashboardKeys = Object.values(CACHE_CONFIG.KEYS)
  invalidateMultiple(dashboardKeys)
}

/**
 * Clear all cache entries
 */
export function clearAllCache() {
  cache.clear()
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStats() {
  const entries = Array.from(cache.entries())
  const now = Date.now()
  
  const stats = {
    totalEntries: entries.length,
    validEntries: 0,
    expiredEntries: 0,
    totalMemoryUsage: 0,
    entriesByKey: {}
  }
  
  entries.forEach(([key, entry]) => {
    const isValid = entry.isValid()
    
    if (isValid) {
      stats.validEntries++
    } else {
      stats.expiredEntries++
    }
    
    stats.entriesByKey[key] = {
      isValid,
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt,
      remainingTTL: entry.getRemainingTTL(),
      dataSize: JSON.stringify(entry.data).length
    }
    
    stats.totalMemoryUsage += JSON.stringify(entry.data).length
  })
  
  return stats
}

/**
 * Clean up expired cache entries
 */
export function cleanupExpiredEntries() {
  const keysToDelete = []
  
  for (const [key, entry] of cache.entries()) {
    if (entry.isExpired()) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => cache.delete(key))
  
  return keysToDelete.length
}

/**
 * Cache wrapper function for async operations
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data if not cached
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<any>} Cached or fresh data
 */
export async function withCache(key, fetchFunction, ttl) {
  // Try to get from cache first
  const cachedData = getCachedData(key)
  
  if (cachedData !== null) {
    return cachedData
  }
  
  // Fetch fresh data
  try {
    const freshData = await fetchFunction()
    
    // Cache the result
    setCachedData(key, freshData, ttl)
    
    return freshData
  } catch (error) {
    console.error(`Error fetching data for cache key ${key}:`, error)
    throw error
  }
}

/**
 * Invalidate cache when transactions are created/updated
 * This should be called after any transaction operation
 */
export function invalidateTransactionRelatedCache() {
  const keysToInvalidate = [
    CACHE_CONFIG.KEYS.DASHBOARD_STATS,
    CACHE_CONFIG.KEYS.LOW_STOCK_ALERTS,
    CACHE_CONFIG.KEYS.QUICK_STATS,
    CACHE_CONFIG.KEYS.RECENT_ACTIVITY,
    CACHE_CONFIG.KEYS.STOCK_SUMMARY
  ]
  
  invalidateMultiple(keysToInvalidate)
}

/**
 * Invalidate cache when products are created/updated
 * This should be called after any product operation
 */
export function invalidateProductRelatedCache() {
  const keysToInvalidate = [
    CACHE_CONFIG.KEYS.DASHBOARD_STATS,
    CACHE_CONFIG.KEYS.LOW_STOCK_ALERTS,
    CACHE_CONFIG.KEYS.QUICK_STATS,
    CACHE_CONFIG.KEYS.STOCK_SUMMARY
  ]
  
  invalidateMultiple(keysToInvalidate)
}

/**
 * Schedule periodic cleanup of expired entries
 * Call this once when the application starts
 */
export function startCacheCleanup() {
  // Clean up expired entries every 5 minutes
  const cleanupInterval = setInterval(() => {
    const deletedCount = cleanupExpiredEntries()
    if (deletedCount > 0) {
      console.log(`Cache cleanup: removed ${deletedCount} expired entries`)
    }
  }, 5 * 60 * 1000) // 5 minutes
  
  // Return cleanup function
  return () => {
    clearInterval(cleanupInterval)
  }
}

/**
 * Preload dashboard cache with fresh data
 * Useful for warming up the cache
 */
export async function preloadDashboardCache() {
  try {
    const { getDashboardStats, getLowStockAlerts, getQuickStats, getDashboardActivity } = await import('@/lib/queries/dashboard')
    
    // Preload all dashboard data in parallel
    await Promise.all([
      withCache(CACHE_CONFIG.KEYS.DASHBOARD_STATS, getDashboardStats, CACHE_CONFIG.TTL.DASHBOARD_STATS),
      withCache(CACHE_CONFIG.KEYS.LOW_STOCK_ALERTS, () => getLowStockAlerts(10), CACHE_CONFIG.TTL.LOW_STOCK_ALERTS),
      withCache(CACHE_CONFIG.KEYS.QUICK_STATS, getQuickStats, CACHE_CONFIG.TTL.QUICK_STATS),
      withCache(CACHE_CONFIG.KEYS.RECENT_ACTIVITY, () => getDashboardActivity(10), CACHE_CONFIG.TTL.RECENT_ACTIVITY)
    ])
    
    console.log('Dashboard cache preloaded successfully')
  } catch (error) {
    console.error('Error preloading dashboard cache:', error)
  }
}