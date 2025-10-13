'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

type Category = { id:number; name:string; slug:string }
type BrandCard = { id:number; name:string; poster:string|null }

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCat, setSelectedCat] = useState<number | ''>('')
  const [brands, setBrands] = useState<BrandCard[]>([])
  const [mounted, setMounted] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  
  // Get cart context
  let totalItems = 0
  try {
    const cart = useCart()
    totalItems = cart.totalItems
  } catch (e) {
    console.error('Cart context error:', e)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetch('/api/storefront/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!selectedCat) { setBrands([]); return }
    fetch(`/api/storefront/categories/${selectedCat}/brands`)
      .then(r => r.json())
      .then(setBrands)
      .catch(() => setBrands([]))
  }, [selectedCat])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-yellow-400">Storefront</h2>
          {mounted && totalItems > 0 && (
            <Link href="/cart" className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
              🛒 Cart ({totalItems})
            </Link>
          )}
        </div>

        {/* Category Selection */}
        <div className="mb-8 flex items-center gap-4">
          <label className="text-yellow-400 font-semibold">Category</label>
          <select
            className="bg-black border border-yellow-700/50 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
            value={selectedCat}
            onChange={(e) => setSelectedCat(Number(e.target.value))}
          >
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Brands Grid */}
        {selectedCat && (
          <div className="border border-yellow-700/30 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6">Available Brands</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map(b => (
                <div key={b.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden hover:border-yellow-600 transition-colors">
                  {/* Poster Image */}
                  {b.poster ? (
                    <div 
                      className="relative aspect-[3/4] bg-neutral-950 cursor-pointer group"
                      onClick={() => setLightboxImage(b.poster)}
                    >
                      <img 
                        src={b.poster}
                        alt={b.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="text-white text-4xl">🔍</div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-xl font-bold text-white mb-2">{b.name}</h4>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-neutral-900 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="text-6xl mb-4">🎬</div>
                        <h4 className="text-xl font-bold text-white mb-2">{b.name}</h4>
                        <p className="text-sm text-neutral-500">No poster available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* View Flavors Button */}
                  <div className="p-4">
                    <Link 
                      href={`/brand/${b.id}`}
                      className="block w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded text-center transition-colors"
                    >
                      View Flavors
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {brands.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                No brands available in this category yet.
              </div>
            )}
          </div>
        )}

        {!selectedCat && (
          <div className="text-center py-20 text-neutral-500">
            Please select a category to view brands
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-yellow-400 transition-colors"
          >
            ✕
          </button>
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={lightboxImage}
              alt="Brand poster"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}