/**
 * Authentication Integration Tests
 * Tests for the complete authentication flow including rate limiting and CSRF protection
 */

import { loginAction } from '@/lib/actions/auth'
import { authenticateUser, hashPassword } from '@/lib/auth'
import { generateCSRFToken } from '@/lib/csrf'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}))

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn()
  })
}))

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('successful login with valid credentials', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: await hashPassword('password123')
    }

    prisma.user.findUnique.mockResolvedValue(mockUser)

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    formData.append('_csrf', generateCSRFToken()) // Add CSRF token

    const result = await loginAction({}, formData)

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  test('failed login with invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'wrongpassword')
    formData.append('_csrf', generateCSRFToken()) // Add CSRF token

    const result = await loginAction({}, formData)

    expect(result.success).toBeUndefined()
    expect(result.error).toBe('Invalid credentials')
    expect(result.fields.email).toBe('test@example.com')
    expect(result.fields.password).toBe('')
  })

  test('validation error for invalid email', async () => {
    const formData = new FormData()
    formData.append('email', 'invalid-email')
    formData.append('password', 'password123')
    formData.append('_csrf', generateCSRFToken()) // Add CSRF token

    const result = await loginAction({}, formData)

    expect(result.success).toBeUndefined()
    expect(result.error).toBe('Please enter a valid email address')
  })

  test('validation error for missing password', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', '')
    formData.append('_csrf', generateCSRFToken()) // Add CSRF token

    const result = await loginAction({}, formData)

    expect(result.success).toBeUndefined()
    expect(result.error).toBe('Password is required')
  })

  test('rate limiting after multiple failed attempts', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const formData = new FormData()
    formData.append('email', 'ratelimit@example.com') // Use different email to avoid conflicts
    formData.append('password', 'wrongpassword')
    formData.append('_csrf', generateCSRFToken()) // Add CSRF token

    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await loginAction({}, formData)
    }

    // 6th attempt should be rate limited
    const result = await loginAction({}, formData)

    expect(result.success).toBeUndefined()
    expect(result.error).toContain('Account locked for 15 minutes')
  })

  test('input sanitization and trimming', async () => {
    const formData = new FormData()
    formData.append('email', '  test@example.com  ')
    formData.append('password', 'password123')
    formData.append('_csrf', generateCSRFToken()) // Add CSRF token

    prisma.user.findUnique.mockResolvedValue(null)

    const result = await loginAction({}, formData)

    // Should have trimmed the email
    expect(result.fields.email).toBe('test@example.com')
  })

  test('CSRF protection blocks requests without valid token', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    // No CSRF token

    const result = await loginAction({}, formData)

    expect(result.success).toBeUndefined()
    expect(result.error).toBe('Security validation failed. Please refresh the page and try again.')
  })

  test('CSRF protection blocks requests with invalid token', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    formData.append('_csrf', 'invalid-token')

    const result = await loginAction({}, formData)

    expect(result.success).toBeUndefined()
    expect(result.error).toBe('Security validation failed. Please refresh the page and try again.')
  })
})

describe('Password Security', () => {
  test('password hashing is secure', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)

    // Hash should be different from original password
    expect(hash).not.toBe(password)
    
    // Hash should be long enough (bcrypt hashes are 60 characters)
    expect(hash.length).toBeGreaterThan(50)
    
    // Should start with bcrypt identifier
    expect(hash).toMatch(/^\$2[aby]\$/)
  })

  test('password verification works correctly', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)

    const { verifyPassword } = require('@/lib/auth')
    
    // Correct password should verify
    const validResult = await verifyPassword(password, hash)
    expect(validResult).toBe(true)
    
    // Wrong password should not verify
    const invalidResult = await verifyPassword('wrongpassword', hash)
    expect(invalidResult).toBe(false)
  })
})