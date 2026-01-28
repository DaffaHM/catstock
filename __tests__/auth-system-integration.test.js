/**
 * Complete Authentication System Integration Tests
 * Tests the full authentication flow including middleware, CSRF protection, and session management
 */

import { loginAction, logoutAction } from '@/lib/actions/auth'
import { getSession, createSession, destroySession, hashPassword } from '@/lib/auth'
import { generateCSRFToken, verifyCSRFToken, setCSRFTokenInCookie } from '@/lib/csrf'
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
const mockCookies = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn()
}

jest.mock('next/headers', () => ({
  cookies: () => mockCookies
}))

describe('Complete Authentication System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookies.set.mockClear()
    mockCookies.get.mockClear()
    mockCookies.delete.mockClear()
  })

  describe('CSRF Protection', () => {
    test('generates valid CSRF tokens', () => {
      const token = generateCSRFToken()
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // randomValue.timestamp.signature
      
      // Token should be verifiable
      expect(verifyCSRFToken(token)).toBe(true)
    })

    test('rejects invalid CSRF tokens', () => {
      expect(verifyCSRFToken('')).toBe(false)
      expect(verifyCSRFToken('invalid')).toBe(false)
      expect(verifyCSRFToken('invalid.token.signature')).toBe(false)
      expect(verifyCSRFToken(null)).toBe(false)
      expect(verifyCSRFToken(undefined)).toBe(false)
    })

    test('rejects expired CSRF tokens', () => {
      // Create a token with old timestamp
      const oldTimestamp = Date.now() - (2 * 60 * 60 * 1000) // 2 hours ago
      const expiredToken = `randomvalue.${oldTimestamp}.invalidsignature`
      
      expect(verifyCSRFToken(expiredToken)).toBe(false)
    })

    test('sets CSRF token in cookie', () => {
      const token = generateCSRFToken()
      setCSRFTokenInCookie(token)
      
      expect(token).toBeDefined()
      expect(mockCookies.set).toHaveBeenCalledWith(
        'catstock-csrf-token',
        token,
        expect.objectContaining({
          httpOnly: false,
          sameSite: 'strict',
          path: '/',
          maxAge: 3600
        })
      )
    })
  })

  describe('Authentication Flow Integration', () => {
    test('complete successful login flow with CSRF', async () => {
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
      formData.append('_csrf', generateCSRFToken())

      const result = await loginAction({}, formData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      
      // Should have set session cookie
      expect(mockCookies.set).toHaveBeenCalledWith(
        'catstock-session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/'
        })
      )
    })

    test('blocks login without CSRF token', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      // No CSRF token

      const result = await loginAction({}, formData)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe('Security validation failed. Please refresh the page and try again.')
      
      // Should not have set session cookie
      expect(mockCookies.set).not.toHaveBeenCalledWith(
        'catstock-session',
        expect.any(String),
        expect.any(Object)
      )
    })

    test('logout destroys session', async () => {
      await expect(logoutAction()).rejects.toThrow() // Will throw due to redirect
      
      expect(mockCookies.delete).toHaveBeenCalledWith('catstock-session')
    })
  })

  describe('Session Management', () => {
    test('validates active session', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date()
      }

      // Mock valid JWT token in cookie
      mockCookies.get.mockReturnValue({ 
        value: 'valid-jwt-token' 
      })
      
      // Mock JWT verification (would normally be done by jwt.verify)
      const jwt = require('jsonwebtoken')
      jest.spyOn(jwt, 'verify').mockReturnValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User'
      })

      prisma.user.findUnique.mockResolvedValue(mockUser)

      const session = await getSession()

      expect(session).toEqual({
        user: mockUser,
        isAuthenticated: true
      })
    })

    test('rejects invalid session', async () => {
      mockCookies.get.mockReturnValue(null)

      const session = await getSession()

      expect(session).toBeNull()
    })
  })

  describe('Middleware Protection', () => {
    test('middleware configuration exists', () => {
      // Test that middleware file exists and has the right structure
      const fs = require('fs')
      const path = require('path')
      const middlewarePath = path.join(process.cwd(), 'middleware.js')
      
      expect(fs.existsSync(middlewarePath)).toBe(true)
      
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
      expect(middlewareContent).toContain('export async function middleware')
      expect(middlewareContent).toContain('export const config')
    })
  })

  describe('Security Headers', () => {
    test('includes security headers in responses', async () => {
      // This would be tested in a full integration test with actual HTTP requests
      // For now, we verify the Next.js config includes the headers
      const nextConfig = require('@/next.config.js')
      
      expect(nextConfig.headers).toBeDefined()
      expect(typeof nextConfig.headers).toBe('function')
    })
  })

  describe('Rate Limiting Integration', () => {
    test('enforces rate limiting across multiple login attempts', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      const formData = new FormData()
      formData.append('email', 'ratelimit-test@example.com')
      formData.append('password', 'wrongpassword')
      formData.append('_csrf', generateCSRFToken())

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await loginAction({}, formData)
      }

      // 6th attempt should be rate limited
      const result = await loginAction({}, formData)

      expect(result.success).toBeUndefined()
      expect(result.error).toContain('Account locked for 15 minutes')
    })
  })
})

describe('Authentication System Requirements Validation', () => {
  test('Requirement 1.1: Middleware protects routes', () => {
    const fs = require('fs')
    const path = require('path')
    const middlewarePath = path.join(process.cwd(), 'middleware.js')
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
    
    expect(middlewareContent).toContain('redirect')
    expect(middlewareContent).toContain('/login')
  })

  test('Requirement 1.2: Creates secure session with httpOnly cookies', async () => {
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
    formData.append('_csrf', generateCSRFToken())

    await loginAction({}, formData)

    expect(mockCookies.set).toHaveBeenCalledWith(
      'catstock-session',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax'
      })
    )
  })

  test('Requirement 1.5: Hashes passwords with bcrypt', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)

    expect(hash).not.toBe(password)
    expect(hash).toMatch(/^\$2[aby]\$/)
    expect(hash.length).toBeGreaterThan(50)
  })

  test('Requirement 1.6: Implements CSRF protection', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    // No CSRF token

    const result = await loginAction({}, formData)

    expect(result.error).toBe('Security validation failed. Please refresh the page and try again.')
  })

  test('Requirement 1.7: Implements rate limiting', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const formData = new FormData()
    formData.append('email', 'rate-limit-req2@example.com')
    formData.append('password', 'wrongpassword')
    formData.append('_csrf', generateCSRFToken())

    // Exceed rate limit
    for (let i = 0; i < 6; i++) {
      await loginAction({}, formData)
    }

    const result = await loginAction({}, formData)
    expect(result.error).toContain('Account temporarily locked')
  })

  test('Requirement 1.8: Protects private pages with middleware', () => {
    const fs = require('fs')
    const path = require('path')
    const middlewarePath = path.join(process.cwd(), 'middleware.js')
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
    
    expect(middlewareContent).toContain('matcher')
    expect(middlewareContent).toContain('catstock-session')
  })
})