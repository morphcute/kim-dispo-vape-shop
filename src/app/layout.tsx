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
            <header className="bg-black border-b border-yellow-600 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-lg">KD</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-lg hidden sm:block">  </span>
                </Link>
                
                <div className="flex items-center gap-4">
                  <Link href="/" className="text-yellow-400 hover:text-yellow-300">
                    Storefront
                  </Link>
                  <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">
                    Admin
                  </Link>
                </div>
              </div>
            </header>
            {children}
          </AdminProvider>
        </Providers>
      </body>
    </html>
  )
}