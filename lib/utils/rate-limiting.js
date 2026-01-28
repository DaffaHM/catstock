/**
 * Rate Limiting Utilities
 * Implements in-memory rate limiting with TTL
 */

// In-memory store for rate limiting
const rateLimitStore = new Map()

/**
 * Rate limit configuration
 */
export const RATE_LIMIT_CONFIG = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // 5 attempts per window
    blockDuration: 30 * 60 * 1000, // 30 minutes block
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 100, // 100 requests per minute
    blockDuration: 5 * 60 * 1000, // 5 minutes block
  },
  EXPORT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 10, // 10 exports per hour
    blockDuration: 60 * 60 * 1000, // 1 hour block
  }
}

/**
 * Rate limit entry structure
 */
class RateLimitEntry {
  constructor(config) {
    this.attempts = 0
    this.windowStart = Date.now()
    this.isBlocked = false
    this.blockUntil = null
    this.config = config
  }

  isInCurrentWindow() {
    return Date.now() - this.windowStart < this.config.windowMs
  }

  isCurrentlyBlocked() {
    if (!this.isBlocked) return false
    if (this.blockUntil && Date.now() > this.blockUntil) {
      this.isBlocked = false
      this.blockUntil = null
      return false
    }
    return true
  }

  addAttempt() {
    if (!this.isInCurrentWindow()) {
      // Reset window
      this.attempts = 0
      this.windowStart = Date.now()
    }

    this.attempts++

    if (this.attempts > this.config.maxAttempts) {
      this.isBlocked = true
      this.blockUntil = Date.now() + this.config.blockDuration
    }
  }

  getRemainingAttempts() {
    if (!this.isInCurrentWindow()) {
      return this.config.maxAttempts
    }
    return Math.max(0, this.config.maxAttempts - this.attempts)
  }

  getResetTime() {
    if (this.isCurrentlyBlocked()) {
      return this.blockUntil
    }
    return this.windowStart + this.config.windowMs
  }
}

/**
 * Check rate limit for a given key
 * @param {string} key - Unique identifier (e.g., IP address, user ID)
 * @param {Object} config - Rate limit configuration
 * @returns {Object} Rate limit status
 */
export function checkRateLimit(key, config) {
  const now = Date.now()
  
  // Clean up expired entries
  cleanupExpiredEntries()
  
  let entry = rateLimitStore.get(key)
  
  if (!entry) {
    entry = new RateLimitEntry(config)
    rateLimitStore.set(key, entry)
  }
  
  // Check if currently blocked
  if (entry.isCurrentlyBlocked()) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.getResetTime(),
      blocked: true,
      blockUntil: entry.blockUntil
    }
  }
  
  // Check if within rate limit
  const remaining = entry.getRemainingAttempts()
  
  return {
    allowed: remaining > 0,
    remaining: remaining - 1, // Account for current request
    resetTime: entry.getResetTime(),
    blocked: false,
    blockUntil: null
  }
}

/**
 * Record an attempt for rate limiting
 * @param {string} key - Unique identifier
 * @param {Object} config - Rate limit configuration
 * @returns {Object} Updated rate limit status
 */
export function recordAttempt(key, config) {
  let entry = rateLimitStore.get(key)
  
  if (!entry) {
    entry = new RateLimitEntry(config)
    rateLimitStore.set(key, entry)
  }
  
  entry.addAttempt()
  
  return {
    allowed: !entry.isCurrentlyBlocked(),
    remaining: entry.getRemainingAttempts(),
    resetTime: entry.getResetTime(),
    blocked: entry.isCurrentlyBlocked(),
    blockUntil: entry.blockUntil
  }
}

/**
 * Clean up expired entries from memory
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries that are no longer blocked and outside their window
    if (!entry.isCurrentlyBlocked() && !entry.isInCurrentWindow()) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Get client identifier from request
 * @param {Request} request - HTTP request
 * @returns {string} Client identifier
 */
export function getClientId(request) {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  // Use the first available IP
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  return ip.trim()
}

/**
 * Rate limit middleware for API routes
 * @param {Request} request - HTTP request
 * @param {Object} config - Rate limit configuration
 * @returns {Object|null} Error response if rate limited, null if allowed
 */
export function rateLimitMiddleware(request, config = RATE_LIMIT_CONFIG.API) {
  const clientId = getClientId(request)
  const rateLimit = checkRateLimit(clientId, config)
  
  if (!rateLimit.allowed) {
    const resetTime = new Date(rateLimit.resetTime).toISOString()
    
    return {
      error: rateLimit.blocked 
        ? 'Terlalu banyak percobaan. Akun diblokir sementara.'
        : 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      code: 'RATE_LIMITED',
      resetTime,
      ...(rateLimit.blocked && { blockUntil: new Date(rateLimit.blockUntil).toISOString() })
    }
  }
  
  // Record the attempt
  recordAttempt(clientId, config)
  
  return null
}

/**
 * Rate limit for login attempts
 * @param {string} identifier - Email or IP address
 * @returns {Object} Rate limit status
 */
export function checkLoginRateLimit(identifier) {
  return checkRateLimit(identifier, RATE_LIMIT_CONFIG.LOGIN)
}

/**
 * Record login attempt
 * @param {string} identifier - Email or IP address
 * @returns {Object} Rate limit status
 */
export function recordLoginAttempt(identifier) {
  return recordAttempt(identifier, RATE_LIMIT_CONFIG.LOGIN)
}

/**
 * Get rate limit headers for HTTP responses
 * @param {Object} rateLimit - Rate limit status
 * @returns {Object} Headers object
 */
export function getRateLimitHeaders(rateLimit) {
  return {
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
    ...(rateLimit.blocked && {
      'Retry-After': Math.ceil((rateLimit.blockUntil - Date.now()) / 1000).toString()
    })
  }
}

/**
 * Clear rate limit for a key (useful for testing or admin override)
 * @param {string} key - Key to clear
 */
export function clearRateLimit(key) {
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit stats (for monitoring)
 * @returns {Object} Rate limit statistics
 */
export function getRateLimitStats() {
  const stats = {
    totalEntries: rateLimitStore.size,
    blockedEntries: 0,
    activeWindows: 0
  }
  
  const now = Date.now()
  
  for (const entry of rateLimitStore.values()) {
    if (entry.isCurrentlyBlocked()) {
      stats.blockedEntries++
    }
    if (entry.isInCurrentWindow()) {
      stats.activeWindows++
    }
  }
  
  return stats
}