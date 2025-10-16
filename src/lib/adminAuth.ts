import { NextRequest } from 'next/server';

// In-memory token store with expiration (2 hours)
const activeSessions = new Map<string, number>();
const TOKEN_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

// Clean up expired tokens every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [token, expiresAt] of activeSessions.entries()) {
      if (now > expiresAt) {
        activeSessions.delete(token);
        console.log('🧹 Cleaned up expired session');
      }
    }
  }, 10 * 60 * 1000);
}

export function validateAdminToken(token: string | null): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  
  if (!token) {
    console.log('❌ No token provided');
    return false;
  }
  
  // For development without ADMIN_TOKEN set
  if (!adminToken) {
    console.warn('⚠️ ADMIN_TOKEN not configured - accepting any token for development');
    return true;
  }
  
  // Check if token matches the admin token
  if (token !== adminToken) {
    console.log('❌ Token does not match ADMIN_TOKEN');
    return false;
  }
  
  // Check if session exists
  const expiresAt = activeSessions.get(token);
  if (!expiresAt) {
    // Auto-create session if token is valid but no session exists
    // This handles cases where server restarted but user still has valid token
    console.log('⚠️ Valid token but no session found - creating new session');
    createSession(token);
    return true;
  }
  
  // Check if session expired
  if (Date.now() > expiresAt) {
    activeSessions.delete(token);
    console.log('❌ Session expired');
    return false;
  }
  
  console.log('✅ Valid admin session');
  return true;
}

export function createSession(token: string) {
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  activeSessions.set(token, expiresAt);
  console.log('✅ Created admin session, expires at:', new Date(expiresAt).toLocaleString());
  return expiresAt;
}

export function removeSession(token: string) {
  activeSessions.delete(token);
  console.log('🚪 Removed admin session');
}

export function isAdmin(req: NextRequest | Request) {
  const token = req.headers.get('x-admin-token');
  const isValid = validateAdminToken(token);
  
  if (!isValid) {
    console.log('❌ Unauthorized access attempt');
  }
  
  return isValid;
}

export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ 
      error: 'Unauthorized', 
      message: 'Invalid or missing admin token' 
    }), 
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}