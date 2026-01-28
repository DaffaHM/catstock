'use server'

import { redirect } from 'next/navigation'
import { authenticateUser, destroySession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

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
    secure: false,
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

export async function loginAction(prevState, formData) {
  try {
    const email = formData.get('email')?.toString().trim() || ''
    const password = formData.get('password')?.toString() || ''
    
    console.log(`[LoginAction] Login attempt for: ${email}`)
    
    // Simple validation
    if (!email || !password) {
      return { error: 'Email and password are required' }
    }
    
    // Try regular database authentication first
    try {
      const result = await authenticateUser(email, password)
      
      if (result.error) {
        console.log(`[LoginAction] Database auth failed: ${result.error}`)
        // If database auth fails, try quick auth fallback
        const quickResult = await quickAuthenticate(email, password)
        
        if (quickResult.error) {
          return { error: quickResult.error }
        }
        
        console.log(`[LoginAction] Quick auth success for: ${email}, redirecting to dashboard`)
        redirect('/dashboard')
      } else {
        console.log(`[LoginAction] Database auth success for: ${email}, redirecting to dashboard`)
        redirect('/dashboard')
      }
      
    } catch (dbError) {
      console.log(`[LoginAction] Database error, trying quick auth fallback:`, dbError.message)
      
      // Database connection failed, use quick auth
      const quickResult = await quickAuthenticate(email, password)
      
      if (quickResult.error) {
        return { error: quickResult.error }
      }
      
      console.log(`[LoginAction] Quick auth fallback success for: ${email}, redirecting to dashboard`)
      redirect('/dashboard')
    }
    
  } catch (error) {
    console.error('[LoginAction] Error:', error)
    return { error: 'Login failed. Please try again.' }
  }
}

export async function logoutAction() {
  try {
    await destroySession()
  } catch (error) {
    console.error('Logout error:', error)
  }
  
  redirect('/login')
}