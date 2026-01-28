import { NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = 'catstock-session'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const method = request.method
  
  console.log(`[Middleware] ${method} ${pathname}`)
  
  // Allow access to login page and public assets
  if (
    pathname === '/login' ||
    pathname === '/simple-login' ||
    pathname === '/quick-login' ||
    pathname === '/direct-login' ||
    pathname === '/final-working-test' ||
    pathname === '/test-indonesia' ||
    pathname === '/test-final' ||
    pathname === '/test-complete' ||
    pathname === '/test-dashboard-fix' ||
    pathname === '/tutorial' ||
    pathname === '/panduan-cepat' ||
    pathname === '/simple-test' ||
    pathname === '/debug-nav' ||
    pathname === '/debug-auth' ||
    pathname === '/comprehensive-test' ||
    pathname === '/working-test' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public/') ||
    pathname.startsWith('/diagnostic') ||
    pathname.startsWith('/test-') ||
    pathname.startsWith('/debug-') ||
    pathname.startsWith('/bypass-') ||
    pathname.startsWith('/manual-') ||
    pathname.startsWith('/session-') ||
    pathname.startsWith('/force-') ||
    pathname.startsWith('/direct-') ||
    pathname.startsWith('/final-') ||
    pathname.startsWith('/nav-')
  ) {
    console.log(`[Middleware] Allowing access to ${pathname}`)
    return NextResponse.next()
  }
  
  try {
    // Get session token from cookies
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
    console.log(`[Middleware] Token present: ${!!token}`)
    
    if (!token) {
      console.log(`[Middleware] No token found, redirecting to quick-login from ${pathname}`)
      const loginUrl = new URL('/quick-login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // Check if it's a base64 token (quick-setup) or JWT token
    try {
      // Try to decode as base64 first (quick-setup token)
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Check if token is expired
      if (decoded.exp && Date.now() > decoded.exp) {
        console.log(`[Middleware] Quick token expired, redirecting to quick-login from ${pathname}`)
        const loginUrl = new URL('/quick-login', request.url)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete(SESSION_COOKIE_NAME)
        return response
      }
      
      console.log(`[Middleware] Valid quick token for ${decoded.email}, allowing access to ${pathname}`)
      return NextResponse.next()
      
    } catch (base64Error) {
      // If base64 decode fails, try JWT validation
      const parts = token.split('.')
      if (parts.length !== 3 || token.length < 100) {
        console.log(`[Middleware] Invalid token format, redirecting to quick-login from ${pathname}`)
        const loginUrl = new URL('/quick-login', request.url)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete(SESSION_COOKIE_NAME)
        return response
      }
      
      console.log(`[Middleware] JWT token format valid, allowing access to ${pathname}`)
      return NextResponse.next()
    }
    
  } catch (error) {
    console.error(`[Middleware] Auth error for ${pathname}:`, error)
    const loginUrl = new URL('/quick-login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}