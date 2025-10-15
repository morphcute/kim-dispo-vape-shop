// lib/adminAuth.ts
import { NextRequest } from 'next/server'

export function isAdmin(req: NextRequest | Request) {
  const token = req.headers.get('x-admin-token')
  const adminToken = process.env.ADMIN_TOKEN
  
  // For development, if no ADMIN_TOKEN is set, accept any token
  if (!adminToken) {
    console.warn('⚠️ ADMIN_TOKEN not configured - accepting any token for development')
    return !!token // Accept any non-empty token
  }
  
  // If no token provided in request, deny access
  if (!token) {
    return false
  }
  
  // Check if tokens match
  return token === adminToken
}

// Helper function to create unauthorized response
export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing admin token' }), 
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}