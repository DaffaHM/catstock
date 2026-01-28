import { getSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    
    if (session?.isAuthenticated) {
      return NextResponse.json({
        authenticated: true,
        user: session.user
      })
    } else {
      return NextResponse.json({
        authenticated: false
      })
    }
  } catch (error) {
    console.error('[API] Session check error:', error)
    return NextResponse.json({
      authenticated: false,
      error: error.message
    })
  }
}