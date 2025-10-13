import Link from 'next/link'
import './globals.css'
import Providers from '../components/Providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* Header with cart indicator */}
          <header className="bg-black border-b border-yellow-600 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
              <Link href="/" className="text-xl font-black text-yellow-400">
                KIM DISPO VAPE SHOP
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
        </Providers>
      </body>
    </html>
  )
}