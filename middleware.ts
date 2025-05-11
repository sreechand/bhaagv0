import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/reset-password']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // If user is logged in and tries to access auth routes, redirect to dashboard
  if (session && req.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If user is not logged in and tries to access protected routes, redirect to login
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 