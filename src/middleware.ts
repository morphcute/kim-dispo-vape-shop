import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Using client-side authentication with sessionStorage
  // Middleware is disabled for admin routes
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
