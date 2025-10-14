export function isAdmin(req: Request) {
  const token = req.headers.get('x-admin-token')
  const adminToken = process.env.ADMIN_TOKEN
  
  // Ensure both token and admin token exist and match
  if (!token || !adminToken || token !== adminToken) {
    return false
  }
  
  return true
}