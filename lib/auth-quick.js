import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'catstock-session'

// Quick auth for demo mode
export async function getQuickSession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    console.log(`[Quick Auth] Token present: ${!!token}`)
    
    if (!token) {
      return null
    }
    
    // Decode simple base64 token from quick-setup
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Check if token is expired
      if (decoded.exp && Date.now() > decoded.exp) {
        console.log(`[Quick Auth] Token expired`)
        return null
      }
      
      console.log(`[Quick Auth] Valid session for: ${decoded.email}`)
      
      return {
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name
        },
        isAuthenticated: true
      }
    } catch (decodeError) {
      console.log(`[Quick Auth] Token decode failed, trying JWT fallback`)
      
      // Fallback to original JWT verification if available
      try {
        const jwt = await import('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
        
        const payload = jwt.verify(token, JWT_SECRET, {
          issuer: 'catstock',
          audience: 'catstock-users'
        })
        
        return {
          user: {
            id: payload.id,
            email: payload.email,
            name: payload.name
          },
          isAuthenticated: true
        }
      } catch (jwtError) {
        console.log(`[Quick Auth] JWT verification also failed`)
        return null
      }
    }
    
  } catch (error) {
    console.error('[Quick Auth] Session verification error:', error)
    return null
  }
}

// Require authentication for quick mode
export async function requireQuickAuth() {
  const session = await getQuickSession()
  
  if (!session?.isAuthenticated) {
    throw new Error('Authentication required')
  }
  
  return session
}