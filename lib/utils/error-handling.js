/**
 * Secure error handling utilities
 * Ensures sensitive information is not exposed to clients
 */

import { containsSecrets } from './security'

/**
 * Generic error messages for different error types
 */
const GENERIC_ERROR_MESSAGES = {
  VALIDATION: 'Invalid input provided',
  AUTHENTICATION: 'Authentication failed',
  AUTHORIZATION: 'Access denied',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  RATE_LIMIT: 'Too many requests',
  DATABASE: 'Unable to process request',
  NETWORK: 'Network error occurred',
  UNKNOWN: 'An unexpected error occurred'
}

/**
 * Error types that should be logged but not exposed
 */
const SENSITIVE_ERROR_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /database/i,
  /connection/i,
  /prisma/i,
  /jwt/i,
  /auth/i
]

/**
 * Sanitize error message for client consumption
 * @param {Error|string} error - The error to sanitize
 * @param {string} fallbackType - Fallback error type
 * @returns {string} - Safe error message
 */
export function sanitizeErrorMessage(error, fallbackType = 'UNKNOWN') {
  const message = error?.message || error || ''
  
  // Check if error message contains sensitive information
  if (containsSecrets(message) || SENSITIVE_ERROR_PATTERNS.some(pattern => pattern.test(message))) {
    return GENERIC_ERROR_MESSAGES[fallbackType] || GENERIC_ERROR_MESSAGES.UNKNOWN
  }
  
  // Check for specific error patterns and return appropriate generic messages
  if (message.includes('validation') || message.includes('invalid')) {
    return GENERIC_ERROR_MESSAGES.VALIDATION
  }
  
  if (message.includes('not found') || message.includes('does not exist')) {
    return GENERIC_ERROR_MESSAGES.NOT_FOUND
  }
  
  if (message.includes('already exists') || message.includes('duplicate')) {
    return GENERIC_ERROR_MESSAGES.CONFLICT
  }
  
  if (message.includes('rate limit') || message.includes('too many') || message.includes('Rate limit')) {
    return GENERIC_ERROR_MESSAGES.RATE_LIMIT
  }
  
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return GENERIC_ERROR_MESSAGES.AUTHORIZATION
  }
  
  // For validation errors that are safe to show (allow specific validation messages)
  if (message.includes('required') || message.includes('must be') || message.includes('invalid format') || message.includes('Invalid email')) {
    return message
  }
  
  // Default to generic message
  return GENERIC_ERROR_MESSAGES[fallbackType] || GENERIC_ERROR_MESSAGES.UNKNOWN
}

/**
 * Log error securely (server-side only)
 * @param {Error} error - The error to log
 * @param {Object} context - Additional context
 */
export function logError(error, context = {}) {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    name: error?.name,
    code: error?.code,
    timestamp: new Date().toISOString(),
    context
  }
  
  // In production, this should go to a proper logging service
  console.error('Application Error:', errorInfo)
}

/**
 * Handle and sanitize errors for API responses
 * @param {Error} error - The error to handle
 * @param {string} operation - The operation that failed
 * @returns {Object} - Sanitized error response
 */
export function handleApiError(error, operation = 'operation') {
  // Log the full error server-side
  logError(error, { operation })
  
  // Return sanitized error to client
  return {
    success: false,
    error: sanitizeErrorMessage(error),
    timestamp: new Date().toISOString()
  }
}

/**
 * Handle validation errors specifically
 * @param {Object} validationError - Zod validation error
 * @returns {Object} - Formatted validation error response
 */
export function handleValidationError(validationError) {
  const errors = {}
  
  if (validationError?.errors) {
    validationError.errors.forEach(err => {
      const field = err.path?.[0] || 'general'
      // Don't sanitize validation error messages - they're safe to show
      errors[field] = err.message
    })
  }
  
  return {
    success: false,
    error: 'Validation failed',
    errors,
    timestamp: new Date().toISOString()
  }
}

/**
 * Handle database errors
 * @param {Error} error - Database error
 * @returns {Object} - Sanitized database error response
 */
export function handleDatabaseError(error) {
  logError(error, { type: 'database' })
  
  // Check for specific database error codes
  if (error?.code === 'P2002') {
    return {
      success: false,
      error: 'A record with this information already exists',
      timestamp: new Date().toISOString()
    }
  }
  
  if (error?.code === 'P2025') {
    return {
      success: false,
      error: 'Record not found',
      timestamp: new Date().toISOString()
    }
  }
  
  if (error?.code === 'P2003') {
    return {
      success: false,
      error: 'Cannot delete record due to existing references',
      timestamp: new Date().toISOString()
    }
  }
  
  return {
    success: false,
    error: GENERIC_ERROR_MESSAGES.DATABASE,
    timestamp: new Date().toISOString()
  }
}

/**
 * Create a safe error response for client consumption
 * @param {string} message - Safe error message
 * @param {number} status - HTTP status code
 * @returns {Object} - Error response object
 */
export function createErrorResponse(message, status = 500) {
  return {
    success: false,
    error: message,
    status,
    timestamp: new Date().toISOString()
  }
}

/**
 * Middleware to catch and handle unhandled errors
 * @param {Function} handler - The handler function to wrap
 * @returns {Function} - Wrapped handler with error handling
 */
export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error, handler.name)
    }
  }
}

/**
 * Check if an error should be retried
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is retryable
 */
export function isRetryableError(error) {
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /connection/i,
    /temporary/i,
    /503/,
    /502/,
    /504/
  ]
  
  const message = error?.message || ''
  return retryablePatterns.some(pattern => pattern.test(message))
}

/**
 * Rate limiting error handler
 * @param {string} identifier - The identifier being rate limited
 * @param {number} remainingTime - Time until rate limit resets
 * @returns {Object} - Rate limit error response
 */
export function createRateLimitError(identifier, remainingTime) {
  logError(new Error('Rate limit exceeded'), { identifier, remainingTime })
  
  return {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(remainingTime / 1000),
    timestamp: new Date().toISOString()
  }
}