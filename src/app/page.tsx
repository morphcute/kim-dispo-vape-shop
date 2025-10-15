'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { Search, ShoppingCart, Star, TrendingUp, Package, X, ChevronRight, Menu } from 'lucide-react'

type Category = { id: number; name: string; slug: string }
type BrandCard = { id: number; name: string; poster: string | null }

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCat, setSelectedCat] = useState<number | ''>('')
  const [brands, setBrands] = useState<BrandCard[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  
  let totalItems = 0
  try { totalItems = useCart().totalItems } catch (e) {}

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/storefront/categories')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data)
        } else if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories)
        } else {
          setCategories([])
        }
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err)
        setCategories([])
      })
  }, [])

  useEffect(() => {
    if (!selectedCat) { setBrands([]); return }
    setLoading(true)
    fetch(`/api/storefront/categories/${selectedCat}/brands`)
      .then(r => r.json())
      .then(data => { 
        if (Array.isArray(data)) {
          setBrands(data)
        } else if (data.brands && Array.isArray(data.brands)) {
          setBrands(data.brands)
        } else {
          setBrands([])
        }
        setLoading(false) 
      })
      .catch(err => { 
        console.error('Failed to fetch brands:', err)
        setBrands([])
        setLoading(false) 
      })
  }, [selectedCat])

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Compact Hero */}
      <div className="relative bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-16 text-center">
          <h1 className="text-3xl md:text-6xl font-black text-white mb-2 md:mb-4 tracking-tight">KIM DISPO</h1>
          <p className="text-sm md:text-xl text-white/90 mb-4 md:mb-6 font-medium">Premium Vape Products</p>
          <div className="hidden md:flex flex-wrap justify-center gap-4 text-sm">
            {[{icon: Package, text: 'Genuine'}, {icon: Star, text: 'Top Brands'}, {icon: TrendingUp, text: 'Best Prices'}].map(({icon: Icon, text}) => (
              <div key={text} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Icon className="w-4 h-4" />
                <span className="font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Sticky Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-yellow-600/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Mobile Layout */}
          <div className="md:hidden space-y-2">
            <div className="flex items-center justify-between gap-2">
              {/* Category Dropdown - Mobile */}
              <select
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                value={selectedCat}
                onChange={(e) => setSelectedCat(Number(e.target.value))}
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Action Buttons - Mobile */}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition"
              >
                <Search className="w-5 h-5" />
              </button>

              {mounted && (
                <>
                  <Link href="/admin/login" className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition">
                    <Menu className="w-5 h-5" />
                  </Link>
                  <Link href="/cart" className="relative bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded-lg transition">
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{totalItems}</span>
                    )}
                  </Link>
                </>
              )}
            </div>

            {/* Search Bar - Mobile (Collapsible) */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                />
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search brands or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-yellow-400 font-semibold whitespace-nowrap">Category:</label>
              <select
                className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition cursor-pointer"
                value={selectedCat}
                onChange={(e) => setSelectedCat(Number(e.target.value))}
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {mounted && (
              <>
                <Link href="/admin/login" className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold px-6 py-3 rounded-lg transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap">
                  <Menu className="w-5 h-5" />
                  Admin
                </Link>
                <Link href="/cart" className="relative bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap">
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{totalItems}</span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        {!selectedCat ? (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-yellow-400 mb-2 md:mb-3">Browse by Category</h2>
              <p className="text-gray-400 text-sm md:text-lg">Select a category to explore products</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.isArray(categories) && categories.map((cat) => (
                <Link href={`/category/${cat.id}`} key={cat.id} className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 overflow-hidden block">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-orange-500/0 group-hover:from-yellow-500/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1 text-left">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:text-yellow-400 transition">{cat.name}</h3>
                      <p className="text-gray-400 text-xs md:text-sm">Tap to explore</p>
                    </div>
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 group-hover:translate-x-2 transition-transform" />
                  </div>
                  <div className="absolute top-4 right-4 text-4xl md:text-6xl opacity-10 group-hover:opacity-20 transition">📦</div>
                </Link>
              ))}
            </div>
            {categories.length === 0 && (
              <div className="text-center py-12 md:py-20">
                <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-base md:text-lg">No categories available</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <button onClick={() => setSelectedCat('')} className="text-yellow-400 hover:text-yellow-300 mb-2 flex items-center gap-2 transition text-sm md:text-base">← Back</button>
                <h2 className="text-2xl md:text-4xl font-bold text-white">{categories.find(c => c.id === selectedCat)?.name || 'Brands'}</h2>
                <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">{filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}</p>
              </div>
            </div>

            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse bg-gray-800 rounded-xl md:rounded-2xl overflow-hidden">
                    <div className="aspect-[3/4] bg-gray-700"></div>
                    <div className="p-3 md:p-4">
                      <div className="h-4 md:h-6 bg-gray-700 rounded mb-2"></div>
                      <div className="h-8 md:h-10 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredBrands.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredBrands.map(brand => (
                  <div key={brand.id} className="group bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
                    {brand.poster ? (
                      <div className="relative aspect-[3/4] bg-gray-900 cursor-pointer overflow-hidden" onClick={() => setLightboxImage(brand.poster)}>
                        <img src={brand.poster} alt={brand.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-3xl md:text-5xl">🔍</div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                          <h3 className="text-base md:text-2xl font-bold text-white drop-shadow-lg line-clamp-2">{brand.name}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="text-center p-4 md:p-6">
                          <div className="text-4xl md:text-6xl mb-2 md:mb-4">🎬</div>
                          <h3 className="text-base md:text-2xl font-bold text-white mb-1 md:mb-2 line-clamp-2">{brand.name}</h3>
                          <p className="text-xs md:text-sm text-gray-400">No image</p>
                        </div>
                      </div>
                    )}
                    <div className="p-2 md:p-4 bg-gray-900/50">
                      <Link href={`/brand/${brand.id}`} className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2 md:py-3 px-3 md:px-4 rounded-lg text-center transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-base">
                        View
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredBrands.length === 0 && brands.length > 0 && (
              <div className="text-center py-12 md:py-20 bg-gray-900/30 rounded-xl md:rounded-2xl border border-gray-800">
                <Search className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-gray-400 mb-2">No brands found</h3>
                <p className="text-gray-500 text-sm md:text-base">Try adjusting your search</p>
                <button onClick={() => setSearchQuery('')} className="mt-4 text-yellow-400 hover:text-yellow-300 font-semibold text-sm md:text-base">Clear search</button>
              </div>
            )}

            {!loading && brands.length === 0 && (
              <div className="text-center py-12 md:py-20 bg-gray-900/30 rounded-xl md:rounded-2xl border border-gray-800">
                <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-gray-400 mb-2">No brands available</h3>
                <p className="text-gray-500 text-sm md:text-base">Check back soon</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm" onClick={() => setLightboxImage(null)}>
          <button onClick={() => setLightboxImage(null)} className="absolute top-4 md:top-6 right-4 md:right-6 text-white hover:text-yellow-400 transition-colors p-2 bg-black/50 rounded-full hover:bg-black/70">
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <div className="relative max-w-5xl max-h-[90vh]">
            <img src={lightboxImage} alt="Brand poster" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 mt-12 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 text-center text-gray-500">
          <p className="mb-1 md:mb-2 text-sm md:text-base">© 2025 KIM DISPO VAPE SHOP</p>
          <p className="text-xs md:text-sm">Premium vape products</p>
        </div>
      </footer>
    </div>
  )
}