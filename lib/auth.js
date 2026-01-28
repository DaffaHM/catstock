import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SESSION_COOKIE_NAME = 'catstock-session'

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
    expiresIn: '7d', // 7 days instead of 24h
    issuer: 'catstock',
    audience: 'catstock-users'
  })
}

// Verify JWT token
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
  console.log(`[Auth] JWT token created, length: ${token.length}`)
  
  const cookieStore = cookies()
  
  try {
    // Set cookie with most compatible settings
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: false, // false for localhost
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    })
    
    console.log(`[Auth] Session cookie set successfully`)
    return token
    
  } catch (error) {
    console.error(`[Auth] Error setting session cookie:`, error)
    throw error
  }
}

// Get current session
export async function getSession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    console.log(`[Auth] getSession - token present: ${!!token}`)
    
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    if (!user) {
      return null
    }
    
    return {
      user,
      isAuthenticated: true
    }
  } catch (error) {
    console.error('[Auth] Session verification error:', error)
    return null
  }
}

// Destroy session
export async function destroySession() {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Authenticate user with credentials
export async function authenticateUser(email, password) {
  try {
    console.log(`[Auth] Authenticating user: ${email}`)
    
    if (!email || !password) {
      return { error: 'Email and password are required' }
    }
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (!user) {
      return { error: 'Invalid credentials' }
    }
    
    const isPasswordValid = await verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return { error: 'Invalid credentials' }
    }
    
    // Create session
    await createSession(user)
    
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

// Require authentication (for use in Server Components)
export async function requireAuth() {
  const session = await getSession()
  
  if (!session?.isAuthenticated) {
    throw new Error('Authentication required')
  }
  
  return session
}