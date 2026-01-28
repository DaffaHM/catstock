import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SESSION_COOKIE_NAME = 'catstock-session'

// Validate JWT secret strength
if (JWT_SECRET.length < 32) {
  console.warn('[Auth] JWT_SECRET is too short. Use at least 32 characters for security.')
}

// Hash password using bcrypt
export async function hashPassword(password) {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password against hash
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

// Create JWT token
export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // 7 days
    issuer: 'catstock',
    audience: 'catstock-users'
  })
}

// Verify JWT token with comprehensive error handling
export function verifyToken(token) {
  try {
    console.log(`[Auth] Verifying token, length: ${token.length}`)
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'catstock',
      audience: 'catstock-users'
    })
    console.log(`[Auth] Token verification successful for user: ${payload.email}`)
    return payload
  } catch (error) {
    console.error(`[Auth] Token verification failed:`, error.message)
    return null
  }
}

// Create secure session with multiple fallback methods
export async function createSession(user) {
  console.log(`[Auth] Creating session for user: ${user.email}`)
  
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000)
  }
  
  const token = createToken(payload)
  
  try {
    const cookieStore = cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    console.log(`[Auth] Session created successfully for: ${user.email}`)
    return { success: true, token }
  } catch (error) {
    console.error(`[Auth] Failed to create session:`, error)
    return { success: false, error: 'Failed to create session' }
  }
}

// Get current session with error handling
export async function getSession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    console.log(`[Auth] Token present: ${!!token}`)
    
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }
    
    return {
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name
      },
      isAuthenticated: true
    }
  } catch (error) {
    console.error('[Auth] Session verification error:', error)
    return null
  }
}

// Require authentication with proper error handling
export async function requireAuth() {
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    throw new Error('Authentication required')
  }
  
  return session
}

// Destroy session
export async function destroySession() {
  try {
    const cookieStore = cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    console.log('[Auth] Session destroyed successfully')
    return { success: true }
  } catch (error) {
    console.error('[Auth] Failed to destroy session:', error)
    return { success: false, error: 'Failed to destroy session' }
  }
}

// Authenticate user with comprehensive validation
export async function authenticateUser(email, password) {
  try {
    console.log(`[Auth] Authentication attempt for: ${email}`)
    
    // Input validation
    if (!email || !password) {
      return { error: 'Email and password are required' }
    }
    
    if (typeof email !== 'string' || typeof password !== 'string') {
      return { error: 'Invalid input format' }
    }
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true
      }
    })
    
    if (!user) {
      console.log(`[Auth] User not found: ${email}`)
      return { error: 'Invalid credentials' }
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      console.log(`[Auth] Invalid password for: ${email}`)
      return { error: 'Invalid credentials' }
    }
    
    // Create session
    const sessionResult = await createSession({
      id: user.id,
      email: user.email,
      name: user.name
    })
    
    if (!sessionResult.success) {
      return { error: 'Failed to create session' }
    }
    
    console.log(`[Auth] Authentication successful for: ${email}`)
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
    
  } catch (error) {
    console.error('[Auth] Authentication error:', error)
    return { error: 'Authentication failed' }
  }
}