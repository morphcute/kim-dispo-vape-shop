// src/app/layout.tsx
import Link from 'next/link'
import './globals.css'
import Providers from '../components/Providers'
import { AdminProvider } from './admin/components/AdminProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AdminProvider>
            {/* Header with logo */}
            <header className="bg-black border-b border-yellow-600/30 sticky top-0 z-50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/50 transition-shadow">
                    <span className="text-black font-bold text-lg">KD</span>
                  </div>
                </Link>
                
                {/* Navigation Links */}
                <nav className="flex items-center gap-3">
                  <Link 
                    href="/" 
                    className="px-4 py-2 text-sm font-medium text-yellow-400 border border-yellow-400/50 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 rounded-lg transition-all duration-200 ease-in-out"
                  >
                    Storefront
                  </Link>
                  <Link 
                    href="/admin" 
                    className="px-4 py-2 text-sm font-medium text-yellow-400 border border-yellow-400/50 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 rounded-lg transition-all duration-200 ease-in-out"
                  >
                    Admin
                  </Link>
                </nav>
              </div>
            </header>
            {children}
          </AdminProvider>
        </Providers>
      </body>
    </html>
  )
}