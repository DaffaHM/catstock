import { NextResponse } from 'next/server'
import { generateCSRFToken, setCSRFTokenInCookie } from '@/lib/csrf'

export async function GET() {
  try {
    const token = generateCSRFToken()
    
    // Set CSRF token in cookie using the helper function
    setCSRFTokenInCookie(token)
    
    return NextResponse.json({ token })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}