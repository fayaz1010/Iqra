import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  
  // List of protected routes
  const protectedRoutes = ['/dashboard', '/books', '/quran', '/progress', '/profile']
  
  // List of auth routes
  const authRoutes = ['/auth']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // If the user is not authenticated and tries to access a protected route
  if (isProtectedRoute && !authCookie) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is authenticated and tries to access auth routes
  if (isAuthRoute && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/books/:path*',
    '/quran/:path*',
    '/progress/:path*',
    '/profile/:path*',
    '/auth',
  ],
}
