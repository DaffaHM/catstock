/**
 * Security utilities for input sanitization and XSS prevention
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeHtml(input) {
  if (typeof input !== 'string') {
    return ''
  }
  
  // First decode HTML entities, then remove HTML tags
  return input
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/<[^>]*>/g, '') // Remove HTML tags after decoding
    .trim()
}

/**
 * Sanitize user input for database storage
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove potentially dangerous characters and normalize whitespace
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags completely
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Validate and sanitize email addresses
 * @param {string} email - The email to validate and sanitize
 * @returns {string} - Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return ''
  }
  
  const sanitized = email.toLowerCase().trim()
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(sanitized)) {
    return ''
  }
  
  return sanitized
}

/**
 * Sanitize numeric input
 * @param {any} input - The input to sanitize as number
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number|null} - Sanitized number or null if invalid
 */
export function sanitizeNumber(input, min = -Infinity, max = Infinity) {
  const num = Number(input)
  
  if (isNaN(num) || !isFinite(num)) {
    return null
  }
  
  if (num < min || num > max) {
    return null
  }
  
  return num
}

/**
 * Sanitize file names to prevent directory traversal
 * @param {string} filename - The filename to sanitize
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') {
    return ''
  }
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow alphanumeric, dots, underscores, hyphens
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 255) // Limit length
}

/**
 * Check if a string contains potentially malicious content
 * @param {string} input - The input to check
 * @returns {boolean} - True if potentially malicious
 */
export function containsMaliciousContent(input) {
  if (typeof input !== 'string') {
    return false
  }
  
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /expression\s*\(/i,
    /url\s*\(/i,
    /@import/i,
    /\beval\s*\(/i,
    /\bexec\s*\(/i
  ]
  
  return maliciousPatterns.some(pattern => pattern.test(input))
}

/**
 * Generate a secure random string for tokens
 * @param {number} length - Length of the random string
 * @returns {string} - Random string
 */
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Validate that secrets are not exposed in client-side code
 * @param {any} data - Data to check for secrets
 * @returns {boolean} - True if secrets are found
 */
export function containsSecrets(data) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data)
  }
  
  const secretPatterns = [
    /jwt_secret/i,
    /database_url/i,
    /password/i,
    /secret.*key/i,
    /api.*key/i,
    /private.*key/i,
    /access.*token/i
  ]
  
  return secretPatterns.some(pattern => pattern.test(data))
}