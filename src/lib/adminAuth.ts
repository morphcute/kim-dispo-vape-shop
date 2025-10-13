export function isAdmin(req: Request) {
  const token = req.headers.get('x-admin-token') || ''
  return token && token === process.env.ADMIN_TOKEN
}
