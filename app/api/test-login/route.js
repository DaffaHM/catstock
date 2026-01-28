import { authenticateUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    console.log('[API] Test login attempt for:', email)
    
    const result = await authenticateUser(email, password)
    
    if (result.success) {
      console.log('[API] Login successful')
      return NextResponse.json({
        success: true,
        user: result.user
      })
    } else {
      console.log('[API] Login failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('[API] Login error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}