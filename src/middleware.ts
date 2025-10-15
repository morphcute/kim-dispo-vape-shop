// src/middleware.ts - DISABLED (using client-side protection instead)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware disabled - using client-side authentication with localStorage
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}