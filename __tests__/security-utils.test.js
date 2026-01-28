/**
 * Security utilities tests
 */

import {
  sanitizeHtml,
  sanitizeInput,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeFilename,
  containsMaliciousContent,
  generateSecureToken,
  containsSecrets
} from '../lib/utils/security'

import {
  sanitizeErrorMessage,
  handleApiError,
  handleValidationError,
  handleDatabaseError,
  createErrorResponse
} from '../lib/utils/error-handling'

describe('Security Utilities', () => {
  describe('sanitizeHtml', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World'
      const result = sanitizeHtml(input)
      expect(result).toBe('alert("xss")Hello World') // Content inside tags remains
    })

    test('should decode HTML entities', () => {
      const input = '&lt;div&gt;Hello &amp; World&lt;/div&gt;'
      const result = sanitizeHtml(input)
      expect(result).toBe('Hello & World')
    })

    test('should handle non-string input', () => {
      expect(sanitizeHtml(null)).toBe('')
      expect(sanitizeHtml(undefined)).toBe('')
      expect(sanitizeHtml(123)).toBe('')
    })
  })

  describe('sanitizeInput', () => {
    test('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeInput(input)
      expect(result).toBe('alert("xss")Hello')
    })

    test('should remove javascript protocol', () => {
      const input = 'javascript:alert("xss")'
      const result = sanitizeInput(input)
      expect(result).toBe('alert("xss")')
    })

    test('should remove event handlers', () => {
      const input = 'onclick=alert("xss") Hello'
      const result = sanitizeInput(input)
      expect(result).toBe('alert("xss") Hello') // onclick= is removed but content remains
    })

    test('should normalize whitespace', () => {
      const input = 'Hello    World   Test'
      const result = sanitizeInput(input)
      expect(result).toBe('Hello World Test')
    })
  })

  describe('sanitizeEmail', () => {
    test('should return valid email in lowercase', () => {
      const input = 'Test@Example.COM'
      const result = sanitizeEmail(input)
      expect(result).toBe('test@example.com')
    })

    test('should return empty string for invalid email', () => {
      expect(sanitizeEmail('invalid-email')).toBe('')
      expect(sanitizeEmail('test@')).toBe('')
      expect(sanitizeEmail('@example.com')).toBe('')
    })

    test('should handle non-string input', () => {
      expect(sanitizeEmail(null)).toBe('')
      expect(sanitizeEmail(123)).toBe('')
    })
  })

  describe('sanitizeNumber', () => {
    test('should return valid numbers', () => {
      expect(sanitizeNumber('123')).toBe(123)
      expect(sanitizeNumber(456.78)).toBe(456.78)
    })

    test('should respect min/max bounds', () => {
      expect(sanitizeNumber(5, 10, 20)).toBe(null) // Below min
      expect(sanitizeNumber(25, 10, 20)).toBe(null) // Above max
      expect(sanitizeNumber(15, 10, 20)).toBe(15) // Within bounds
    })

    test('should return null for invalid input', () => {
      expect(sanitizeNumber('abc')).toBe(null)
      expect(sanitizeNumber(NaN)).toBe(null)
      expect(sanitizeNumber(Infinity)).toBe(null)
    })
  })

  describe('sanitizeFilename', () => {
    test('should remove dangerous characters', () => {
      const input = '../../../etc/passwd'
      const result = sanitizeFilename(input)
      expect(result).toBe('etcpasswd')
    })

    test('should handle multiple dots', () => {
      const input = 'file...name.txt'
      const result = sanitizeFilename(input)
      expect(result).toBe('file.name.txt')
    })

    test('should limit length', () => {
      const input = 'a'.repeat(300)
      const result = sanitizeFilename(input)
      expect(result.length).toBe(255)
    })
  })

  describe('containsMaliciousContent', () => {
    test('should detect script tags', () => {
      expect(containsMaliciousContent('<script>alert("xss")</script>')).toBe(true)
    })

    test('should detect javascript protocol', () => {
      expect(containsMaliciousContent('javascript:alert("xss")')).toBe(true)
    })

    test('should detect event handlers', () => {
      expect(containsMaliciousContent('onclick=alert("xss")')).toBe(true)
    })

    test('should return false for safe content', () => {
      expect(containsMaliciousContent('Hello World')).toBe(false)
    })
  })

  describe('generateSecureToken', () => {
    test('should generate token of specified length', () => {
      const token = generateSecureToken(16)
      expect(token).toHaveLength(16)
    })

    test('should generate different tokens', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('containsSecrets', () => {
    test('should detect secret patterns', () => {
      expect(containsSecrets('JWT_SECRET=mysecret')).toBe(true)
      expect(containsSecrets('DATABASE_URL=postgres://...')).toBe(true)
      expect(containsSecrets('password=123456')).toBe(true)
    })

    test('should return false for safe content', () => {
      expect(containsSecrets('Hello World')).toBe(false)
      expect(containsSecrets('user@example.com')).toBe(false)
    })
  })
})

describe('Error Handling Utilities', () => {
  describe('sanitizeErrorMessage', () => {
    test('should sanitize sensitive error messages', () => {
      const error = new Error('Database connection failed with password abc123')
      const result = sanitizeErrorMessage(error)
      expect(result).toBe('An unexpected error occurred')
    })

    test('should allow safe validation messages', () => {
      const error = new Error('Name is required')
      const result = sanitizeErrorMessage(error)
      expect(result).toBe('Name is required')
    })

    test('should handle specific error patterns', () => {
      expect(sanitizeErrorMessage('User not found')).toBe('Resource not found')
      expect(sanitizeErrorMessage('Email already exists')).toBe('Resource conflict')
      expect(sanitizeErrorMessage('Rate limit exceeded')).toBe('Too many requests')
    })
  })

  describe('handleApiError', () => {
    test('should return sanitized error response', () => {
      const error = new Error('Database password failed')
      const result = handleApiError(error, 'test-operation')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred')
      expect(result.timestamp).toBeDefined()
    })
  })

  describe('handleValidationError', () => {
    test('should format validation errors', () => {
      const validationError = {
        errors: [
          { path: ['name'], message: 'Name is required' },
          { path: ['email'], message: 'Invalid email format' }
        ]
      }
      
      const result = handleValidationError(validationError)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation failed')
      expect(result.errors.name).toBe('Name is required')
      expect(result.errors.email).toBe('Invalid email format')
    })
  })

  describe('handleDatabaseError', () => {
    test('should handle specific Prisma error codes', () => {
      const duplicateError = { code: 'P2002', message: 'Unique constraint failed' }
      const result = handleDatabaseError(duplicateError)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('A record with this information already exists')
    })

    test('should handle not found errors', () => {
      const notFoundError = { code: 'P2025', message: 'Record not found' }
      const result = handleDatabaseError(notFoundError)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Record not found')
    })

    test('should handle foreign key constraint errors', () => {
      const constraintError = { code: 'P2003', message: 'Foreign key constraint failed' }
      const result = handleDatabaseError(constraintError)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot delete record due to existing references')
    })
  })

  describe('createErrorResponse', () => {
    test('should create properly formatted error response', () => {
      const result = createErrorResponse('Test error', 400)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Test error')
      expect(result.status).toBe(400)
      expect(result.timestamp).toBeDefined()
    })
  })
})