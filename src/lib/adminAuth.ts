// lib/adminAuth.ts or wherever you store it
import { NextRequest } from 'next/server'

export function isAdmin(req: NextRequest | Request) {
  const token = req.headers.get('x-admin-token')
  const adminToken = process.env.ADMIN_TOKEN
  
  // If no admin token is configured, deny access
  if (!adminToken) {
    console.error('⚠️ ADMIN_TOKEN not configured in environment variables')
    return false
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