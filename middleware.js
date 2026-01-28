import { NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = 'catstock-session'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/quick-login',
  '/tutorial',
  '/panduan-cepat',
  '/debug-auth',
  '/test-dashboard-fix'
]

// Routes that should be accessible for testing/debugging
const TEST_ROUTES = [
  '/test-',
  '/debug-',
  '/bypass-',
  '/manual-',
  '/session-',
  '/force-',
  '/direct-',
  '/final-',
  '/nav-',
  '/simple-',
  '/comprehensive-',
  '/working-'
]

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const method = request.method
  
  console.log(`[Middleware] ${method} ${pathname}`)
  
  // Allow static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next()
  }
  
  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log(`[Middleware] Public route allowed: ${pathname}`)
    return NextResponse.next()
  }
  
  // Allow test routes in development
  if (process.env.NODE_ENV === 'development' && 
      TEST_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`[Middleware] Test route allowed: ${pathname}`)
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
    
    // Validate token format
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
      // If base64 decode fails, check JWT format
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