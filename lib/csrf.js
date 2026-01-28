import { randomBytes, createHmac } from 'crypto'
import { cookies } from 'next/headers'

const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-change-in-production'
const CSRF_COOKIE_NAME = 'catstock-csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

// Generate CSRF token
export function generateCSRFToken() {
  const randomValue = randomBytes(32).toString('hex')
  const timestamp = Date.now().toString()
  const payload = `${randomValue}.${timestamp}`
  
  // Create HMAC signature
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex')
  
  return `${payload}.${signature}`
}

// Verify CSRF token
export function verifyCSRFToken(token) {
  if (!token) return false
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const [randomValue, timestamp, signature] = parts
    const payload = `${randomValue}.${timestamp}`
    
    // Verify signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('hex')
    
    if (signature !== expectedSignature) return false
    
    // Check if token is not too old (1 hour max)
    const tokenTime = parseInt(timestamp)
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1 hour
    
    if (now - tokenTime > maxAge) return false
    
    return true
  } catch (error) {
    console.error('CSRF token verification error:', error)
    return false
  }
}

// Set CSRF token in cookie (use Route Handler instead)
export function setCSRFTokenInCookie(token) {
  // This function is now only used by the Route Handler
  const cookieStore = cookies()
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Client needs to read this for forms
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 // 1 hour
  })
  
  return token
}

// Get CSRF token from cookie
export function getCSRFToken() {
  const cookieStore = cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value
}

// Validate CSRF token from request
export function validateCSRFFromRequest(request) {
  // Get token from header or form data
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  const formToken = request.formData ? request.formData.get('_csrf') : null
  const token = headerToken || formToken
  
  // Get expected token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  
  if (!token || !cookieToken) {
    return false
  }
  
  // Verify both tokens match and are valid
  return token === cookieToken && verifyCSRFToken(token)
}

// Middleware helper for CSRF protection
export function requireCSRF(request) {
  const method = request.method
  
  // Only check CSRF for state-changing operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!validateCSRFFromRequest(request)) {
      throw new Error('CSRF token validation failed')
    }
  }
  
  return true
}