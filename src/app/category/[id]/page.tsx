'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Package, Grid3x3, List, Search, ChevronRight, AlertCircle, Loader2, X } from 'lucide-react'

type Brand = { id: number; name: string; poster: string | null }

export default function CategoryPage() {
  const params = useParams()
  const id = params?.id as string
  
  const [brands, setBrands] = useState<Brand[]>([])
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    
    fetch(`/api/storefront/categories/${id}/brands`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setBrands(data)
        } else if (data.brands) {
          setBrands(data.brands)
          setCategoryName(data.name || '')
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching category:', err)
        setError(true)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center bg-gray-800/50 border border-red-500/30 rounded-2xl p-8 md:p-12 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-3">Failed to Load</h2>
          <p className="text-gray-400 mb-6 text-sm md:text-base">Could not load category data</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg transition">
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Compact Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-yellow-600/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition font-semibold text-sm md:text-base">
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Compact Hero */}
      <div className="relative bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3">
            <Package className="w-4 h-4" />
            <span className="text-xs md:text-sm font-semibold">Category</span>
          </div>
          <h1 className="text-2xl md:text-5xl font-black text-white mb-2 md:mb-4">{categoryName || 'Products'}</h1>
          <p className="text-sm md:text-lg text-white/90 font-medium">{brands.length} {brands.length === 1 ? 'Brand' : 'Brands'}</p>
        </div>
      </div>

      {/* Compact Search Bar */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-[53px] md:top-[57px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Mobile Layout */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400 text-left flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search brands...</span>
            </button>
            <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition ${viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'text-gray-400'}`}>
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded transition ${viewMode === 'list' ? 'bg-yellow-500 text-black' : 'text-gray-400'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Search Expanded */}
          {showSearch && (
            <div className="md:hidden mt-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                autoFocus
              />
            </div>
          )}

          {/* Desktop Layout */}
          <div className="hidden md:flex gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1 border border-gray-700">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition ${viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}>
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded transition ${viewMode === 'list' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}>
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        {brands.length === 0 ? (
          <div className="text-center py-12 md:py-20 bg-gray-900/30 rounded-xl md:rounded-2xl border border-gray-800">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-400 mb-2">No Brands Yet</h3>
            <p className="text-gray-500 mb-6 text-sm md:text-base">This category is empty</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg transition text-sm md:text-base">
              <ChevronLeft className="w-5 h-5" />
              Browse Categories
            </Link>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12 md:py-20 bg-gray-900/30 rounded-xl md:rounded-2xl border border-gray-800">
            <Search className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-400 mb-2">No brands found</h3>
            <p className="text-gray-500 mb-6 text-sm md:text-base">Try adjusting your search</p>
            <button onClick={() => setSearchQuery('')} className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm md:text-base">Clear search</button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {filteredBrands.map((brand) => (
              <div key={brand.id} className="group bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
                {brand.poster ? (
                  <div className="relative aspect-[3/4] bg-gray-900 cursor-pointer overflow-hidden" onClick={() => setLightboxImage(brand.poster)}>
                    <img src={brand.poster} alt={brand.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    <div className="absolute inset-0 bg-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                      <h3 className="text-sm md:text-2xl font-bold text-white drop-shadow-lg line-clamp-2">{brand.name}</h3>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center p-4 md:p-6">
                      <div className="text-4xl md:text-6xl mb-2 md:mb-4">📦</div>
                      <h3 className="text-base md:text-2xl font-bold text-white mb-1 md:mb-2 line-clamp-2">{brand.name}</h3>
                      <p className="text-xs md:text-sm text-gray-400">No image</p>
                    </div>
                  </div>
                )}
                <div className="p-2 md:p-4 bg-gray-900/50">
                  <Link href={`/brand/${brand.id}`} className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2 md:py-3 px-3 md:px-4 rounded-lg transition-all text-sm md:text-base">
                    <span>View</span>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredBrands.map((brand) => (
              <Link key={brand.id} href={`/brand/${brand.id}`} className="group flex items-center gap-3 md:gap-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20 p-3 md:p-4">
                {brand.poster ? (
                  <div className="relative w-20 h-20 md:w-32 md:h-32 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden">
                    <img src={brand.poster} alt={brand.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-20 h-20 md:w-32 md:h-32 flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-2xl md:text-4xl">📦</div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-2xl font-bold text-white group-hover:text-yellow-400 transition mb-1 md:mb-2 line-clamp-2">{brand.name}</h3>
                  <p className="text-gray-400 text-xs md:text-base">View products</p>
                </div>
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 group-hover:translate-x-2 transition-transform flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm" onClick={() => setLightboxImage(null)}>
          <button onClick={() => setLightboxImage(null)} className="absolute top-4 md:top-6 right-4 md:right-6 text-white hover:text-yellow-400 transition-colors p-2 bg-black/50 rounded-full hover:bg-black/70">
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <img src={lightboxImage} alt="Brand poster" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
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