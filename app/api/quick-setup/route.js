import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Simple in-memory user store for Vercel demo
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

export async function POST(request) {
  try {
    await initDemoUser()
    
    const { email, password } = await request.json()
    
    console.log('[Quick Setup] Login attempt:', email)
    
    // Check credentials
    if (email !== DEMO_USER.email) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }
    
    const isPasswordValid = await bcrypt.compare(password, DEMO_USER.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }
    
    // Create simple JWT-like token
    const token = Buffer.from(JSON.stringify({
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    })).toString('base64')
    
    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name
      }
    })
    
    response.cookies.set('catstock-session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    console.log('[Quick Setup] Login successful for:', email)
    
    return response
    
  } catch (error) {
    console.error('[Quick Setup] Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 500 })
  }
}

export async function GET() {
  await initDemoUser()
  
  return NextResponse.json({
    success: true,
    message: 'Quick setup ready',
    credentials: {
      email: 'owner@catstock.com',
      password: 'admin123'
    },
    user: {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name
    }
  })
}