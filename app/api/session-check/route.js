import { getSession } from '@/lib/auth'
import { getQuickSession } from '@/lib/auth-quick'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    let session = null
    
    // Try quick authentication first (for demo mode)
    try {
      session = await getQuickSession()
      if (session?.isAuthenticated) {
        return NextResponse.json({
          isAuthenticated: true,
          authenticated: true,
          user: session.user,
          isDemoMode: true
        })
      }
    } catch (quickAuthError) {
      console.log('[Session Check] Quick auth failed:', quickAuthError.message)
    }
    
    // Fallback to regular authentication
    try {
      session = await getSession()
      if (session?.isAuthenticated) {
        return NextResponse.json({
          isAuthenticated: true,
          authenticated: true,
          user: session.user,
          isDemoMode: false
        })
      }
    } catch (authError) {
      console.log('[Session Check] Regular auth failed:', authError.message)
    }
    
    return NextResponse.json({
      isAuthenticated: false,
      authenticated: false
    })
    
  } catch (error) {
    console.error('[API] Session check error:', error)
    return NextResponse.json({
      isAuthenticated: false,
      authenticated: false,
      error: error.message
    })
  }
}