/**
 * Comprehensive Error Handling Utilities
 * Provides consistent error handling across the application
 */

// Sensitive patterns that should be removed from error messages
const SENSITIVE_PATTERNS = [
  /DATABASE_URL=.*/gi,
  /JWT_SECRET=.*/gi,
  /password[=:]\s*[^\s]*/gi,
  /token[=:]\s*[^\s]*/gi,
  /secret[=:]\s*[^\s]*/gi,
  /key[=:]\s*[^\s]*/gi,
  /api[_-]?key[=:]\s*[^\s]*/gi,
  /auth[_-]?token[=:]\s*[^\s]*/gi,
]

/**
 * Sanitize error message to remove sensitive information
 * @param {string} message - Error message to sanitize
 * @returns {string} Sanitized error message
 */
export function sanitizeErrorMessage(message) {
  if (typeof message !== 'string') {
    return 'An error occurred'
  }
  
  let sanitized = message
  
  // Remove sensitive patterns
  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  })
  
  return sanitized
}

/**
 * Handle database errors with user-friendly messages
 * @param {Error} error - Database error
 * @returns {Object} Formatted error response
 */
export function handleDatabaseError(error) {
  console.error('[Database Error]:', error)
  
  // Prisma-specific errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return {
          error: 'Data sudah ada. Silakan gunakan nilai yang berbeda.',
          code: 'DUPLICATE_ENTRY'
        }
      case 'P2025':
        return {
          error: 'Data tidak ditemukan.',
          code: 'NOT_FOUND'
        }
      case 'P2003':
        return {
          error: 'Data tidak dapat dihapus karena masih digunakan.',
          code: 'FOREIGN_KEY_CONSTRAINT'
        }
      case 'P2014':
        return {
          error: 'Perubahan akan melanggar hubungan data.',
          code: 'RELATION_VIOLATION'
        }
      case 'P1001':
        return {
          error: 'Tidak dapat terhubung ke database.',
          code: 'CONNECTION_ERROR'
        }
      case 'P1008':
        return {
          error: 'Waktu koneksi database habis.',
          code: 'TIMEOUT'
        }
      default:
        return {
          error: 'Terjadi kesalahan database.',
          code: 'DATABASE_ERROR'
        }
    }
  }
  
  // Generic database errors
  if (error.message?.includes('connect')) {
    return {
      error: 'Tidak dapat terhubung ke database.',
      code: 'CONNECTION_ERROR'
    }
  }
  
  if (error.message?.includes('timeout')) {
    return {
      error: 'Koneksi database timeout.',
      code: 'TIMEOUT'
    }
  }
  
  return {
    error: 'Terjadi kesalahan sistem.',
    code: 'SYSTEM_ERROR'
  }
}

/**
 * Handle validation errors
 * @param {Object} validationResult - Zod validation result
 * @returns {Object} Formatted error response
 */
export function handleValidationError(validationResult) {
  if (validationResult.success) {
    return null
  }
  
  const errors = {}
  
  validationResult.error.errors.forEach(err => {
    const field = err.path.join('.')
    errors[field] = err.message
  })
  
  return {
    error: 'Data tidak valid. Silakan periksa input Anda.',
    errors,
    code: 'VALIDATION_ERROR'
  }
}

/**
 * Handle authentication errors
 * @param {Error} error - Authentication error
 * @returns {Object} Formatted error response
 */
export function handleAuthError(error) {
  console.error('[Auth Error]:', sanitizeErrorMessage(error.message))
  
  if (error.message?.includes('expired')) {
    return {
      error: 'Sesi telah berakhir. Silakan login kembali.',
      code: 'SESSION_EXPIRED'
    }
  }
  
  if (error.message?.includes('invalid')) {
    return {
      error: 'Kredensial tidak valid.',
      code: 'INVALID_CREDENTIALS'
    }
  }
  
  if (error.message?.includes('rate limit')) {
    return {
      error: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
      code: 'RATE_LIMITED'
    }
  }
  
  return {
    error: 'Terjadi kesalahan autentikasi.',
    code: 'AUTH_ERROR'
  }
}

/**
 * Generic error handler for server actions
 * @param {Error} error - Error to handle
 * @param {string} context - Context where error occurred
 * @returns {Object} Formatted error response
 */
export function handleServerActionError(error, context = 'action') {
  console.error(`[${context}] Error:`, error)
  
  // Handle specific error types
  if (error.code) {
    return handleDatabaseError(error)
  }
  
  if (error.name === 'ZodError') {
    return handleValidationError({ success: false, error })
  }
  
  if (error.message?.includes('auth')) {
    return handleAuthError(error)
  }
  
  // Generic error
  return {
    error: 'Terjadi kesalahan sistem. Silakan coba lagi.',
    code: 'SYSTEM_ERROR'
  }
}

/**
 * Create error response for API routes
 * @param {Error} error - Error to handle
 * @param {number} status - HTTP status code
 * @returns {Object} API error response
 */
export function createApiErrorResponse(error, status = 500) {
  const sanitizedMessage = sanitizeErrorMessage(error.message)
  
  return {
    success: false,
    error: sanitizedMessage,
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  }
}

/**
 * Log error with context
 * @param {Error} error - Error to log
 * @param {string} context - Context information
 * @param {Object} metadata - Additional metadata
 */
export function logError(error, context, metadata = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    message: sanitizeErrorMessage(error.message),
    code: error.code,
    metadata,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  }
  
  console.error('[Error Log]:', JSON.stringify(logData, null, 2))
  
  // In production, you might want to send this to an external logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: send to logging service
    // await sendToLoggingService(logData)
  }
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}