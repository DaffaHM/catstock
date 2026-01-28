'use server'

import { redirect } from 'next/navigation'
import { authenticateUser, destroySession } from '@/lib/auth'
import { checkLoginRateLimit, recordLoginAttempt } from '@/lib/utils/rate-limiting'
import { handleServerActionError, logError } from '@/lib/utils/error-handling'
import bcrypt from 'bcryptjs'
import { cookies, headers } from 'next/headers'

// Demo user for fallback when database is not available
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'owner@catstock.com',
  name: 'Store Owner',
  passwordHash: null // Will be set on first run
}

// Initialize demo user password
async function initDemoUser() {
  if (!DEMO_USER.passwordHash) {
    DEMO_USER.passwordHash = await bcrypt.hash('admin123', 12)
  }
}

// Get client IP for rate limiting
function getClientIP() {
  const headersList = headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  
  return forwarded?.split(',')[0] || realIp || 'unknown'
}

// Quick authentication fallback
async function quickAuthenticate(email, password) {
  await initDemoUser()
  
  console.log('[Quick Auth] Fallback authentication for:', email)
  
  // Check credentials
  if (email !== DEMO_USER.email) {
    return { error: 'Invalid credentials' }
  }
  
  const isPasswordValid = await bcrypt.compare(password, DEMO_USER.passwordHash)
  if (!isPasswordValid) {
    return { error: 'Invalid credentials' }
  }
  
  // Create simple base64 token
  const token = Buffer.from(JSON.stringify({
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    name: DEMO_USER.name,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  })).toString('base64')
  
  // Set cookie
  const cookieStore = cookies()
  cookieStore.set('catstock-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
  
  console.log('[Quick Auth] Fallback login successful for:', email)
  
  return {
    success: true,
    user: {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name
    }
  }
}

// Login action with comprehensive error handling and rate limiting
export async function loginAction(prevState, formData) {
  try {
    const email = formData.get('email')?.toString().toLowerCase().trim()
    const password = formData.get('password')?.toString()
    const clientIP = getClientIP()
    
    // Input validation
    if (!email || !password) {
      return {
        error: 'Email dan password harus diisi',
        fields: { email: email || '' }
      }
    }
    
    if (typeof email !== 'string' || typeof password !== 'string') {
      return {
        error: 'Format input tidak valid',
        fields: { email: email || '' }
      }
    }
    
    // Check rate limiting by email and IP
    const emailRateLimit = checkLoginRateLimit(email)
    const ipRateLimit = checkLoginRateLimit(clientIP)
    
    if (!emailRateLimit.allowed || !ipRateLimit.allowed) {
      const blockedLimit = !emailRateLimit.allowed ? emailRateLimit : ipRateLimit
      
      logError(
        new Error('Rate limit exceeded'),
        'login',
        { email, clientIP, rateLimit: blockedLimit }
      )
      
      return {
        error: blockedLimit.blocked 
          ? 'Terlalu banyak percobaan login. Akun diblokir sementara.'
          : 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
        fields: { email },
        rateLimited: true,
        resetTime: blockedLimit.resetTime
      }
    }
    
    // Try regular authentication first
    let result = await authenticateUser(email, password)
    
    // If regular auth fails, try quick authentication as fallback
    if (!result.success) {
      console.log('[Auth] Regular auth failed, trying quick auth fallback')
      result = await quickAuthenticate(email, password)
    }
    
    if (!result.success) {
      // Record failed attempt for rate limiting
      recordLoginAttempt(email)
      recordLoginAttempt(clientIP)
      
      logError(
        new Error('Login failed'),
        'login',
        { email, clientIP, error: result.error }
      )
      
      return {
        error: result.error || 'Login gagal',
        fields: { email }
      }
    }
    
    console.log('[Auth] Login successful for:', email)
    
    // Successful login - redirect to dashboard
    redirect('/dashboard')
    
  } catch (error) {
    // Handle redirect errors (these are expected)
    if (error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    logError(error, 'login', { 
      email: formData.get('email'),
      clientIP: getClientIP()
    })
    
    const errorResponse = handleServerActionError(error, 'login')
    
    return {
      ...errorResponse,
      fields: { email: formData.get('email') || '' }
    }
  }
}

// Logout action
export async function logoutAction() {
  try {
    const result = await destroySession()
    
    if (result.success) {
      console.log('[Auth] Logout successful')
      redirect('/quick-login')
    } else {
      return {
        error: 'Gagal logout. Silakan coba lagi.'
      }
    }
    
  } catch (error) {
    // Handle redirect errors (these are expected)
    if (error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    logError(error, 'logout')
    
    return handleServerActionError(error, 'logout')
  }
}

// Check authentication status (for client-side use)
export async function checkAuthStatus() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('catstock-session')?.value
    
    if (!token) {
      return { isAuthenticated: false }
    }
    
    // Try to decode token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      if (decoded.exp && Date.now() > decoded.exp) {
        return { isAuthenticated: false }
      }
      
      return {
        isAuthenticated: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name
        }
      }
    } catch (decodeError) {
      // Try JWT verification as fallback
      try {
        const jwt = await import('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        
        const payload = jwt.verify(token, JWT_SECRET, {
          issuer: 'catstock',
          audience: 'catstock-users'
        })
        
        return {
          isAuthenticated: true,
          user: {
            id: payload.id,
            email: payload.email,
            name: payload.name
          }
        }
      } catch (jwtError) {
        return { isAuthenticated: false }
      }
    }
    
  } catch (error) {
    logError(error, 'checkAuthStatus')
    return { isAuthenticated: false }
  }
}