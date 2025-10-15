import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only check for /admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value
    const adminToken = process.env.ADMIN_TOKEN

    // If no token in cookie, redirect to login
    if (!token || !adminToken || token !== adminToken) {
      // Allow access to the login page itself
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}