'use client'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart, getBrandSubtotal } = useCart()
  const [fullName, setFullName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  // Group cart items by brand
  const cartByBrand = useMemo(() => {
    const grouped = new Map<number, typeof cart>();
    cart.forEach(item => {
      if (!grouped.has(item.brandId)) {
        grouped.set(item.brandId, []);
      }
      grouped.get(item.brandId)!.push(item);
    });
    return grouped;
  }, [cart]);

  const handleCheckout = async () => {
    if (!fullName.trim()) {
      alert('Please enter your full name')
      return
    }

    setIsProcessing(true)
    
    try {
      // Prepare order items
      const items = cart.map(item => ({
        flavorId: item.flavorId,
        quantity: item.qty
      }))

      // Submit order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: fullName,
          items: items
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()
      
      alert(`Thank you ${fullName}! Your order #${order.id} has been placed.\nTotal: ₱${totalPrice.toFixed(2)}`)
      clearCart()
      setFullName('')
      router.push('/')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Empty Cart */}
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4">Your Cart is Empty</h2>
          <p className="text-neutral-400 mb-8">Add some items to get started!</p>
          <Link 
            href="/"
            className="inline-block bg-yellow-500 text-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-yellow-400 hover:text-yellow-300 mb-2 inline-block">
              ← Back to Shop
            </Link>
            <h2 className="text-4xl font-bold text-yellow-400">Your Cart</h2>
          </div>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-400 font-semibold"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Grouped by Brand */}
          <div className="lg:col-span-2">
            <div className="border border-yellow-700/30 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Cart Items ({totalItems})</h3>
              
              <div className="space-y-6">
                {Array.from(cartByBrand.entries()).map(([brandId, items]) => {
                  const brandName = items[0].brandName;
                  const categoryName = items[0].categoryName;
                  const brandSubtotal = getBrandSubtotal(brandId);
                  
                  return (
                    <div key={brandId} className="bg-neutral-900/70 border border-yellow-700/30 rounded-lg p-5">
                      {/* Brand Header with Subtotal */}
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-yellow-700/20">
                        <div>
                          <h4 className="text-xl font-bold text-yellow-400">{brandName}</h4>
                          <p className="text-sm text-neutral-500">{categoryName}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-neutral-400">Brand Subtotal</div>
                          <div className="text-xl font-bold text-green-400">₱{brandSubtotal.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Items in this brand */}
                      <div className="space-y-3">
                        {items.map(item => (
                          <div 
                            key={item.flavorId} 
                            className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <h5 className="text-lg font-bold text-white mb-1">{item.name}</h5>
                                <p className="text-sm text-neutral-500">Code: {item.code}</p>
                                <p className="text-base text-green-400 font-semibold mt-1">
                                  ₱{(item.sellingPrice || 0).toFixed(2)} each
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.flavorId)}
                                className="text-red-500 hover:text-red-400 font-semibold text-sm"
                              >
                                Remove
                              </button>
                            </div>

                            {/* Quantity Controls and Item Total */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-neutral-800 rounded-lg w-fit">
                                <button
                                  onClick={() => updateQuantity(item.flavorId, item.qty - 1)}
                                  className="px-4 py-2 text-white hover:bg-neutral-700 rounded-l-lg"
                                >
                                  −
                                </button>
                                <span className="px-4 py-2 bg-yellow-500 text-black font-bold min-w-[60px] text-center">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.flavorId, item.qty + 1)}
                                  className="px-4 py-2 text-white hover:bg-neutral-700 rounded-r-lg"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-neutral-400">Item Total</div>
                                <div className="text-lg font-bold text-white">
                                  ₱{((item.sellingPrice || 0) * item.qty).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="lg:col-span-1">
            <div className="border border-yellow-700/30 rounded-lg p-6 sticky top-4">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Order Summary</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-yellow-400 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-black border border-yellow-700/50 rounded px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div className="mb-6 p-4 bg-neutral-900/50 rounded-lg space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-neutral-400">Total Items:</span>
                  <span className="font-bold text-white">{totalItems}</span>
                </div>
                <div className="border-t border-neutral-800 pt-3">
                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-yellow-400">Total Amount:</span>
                    <span className="font-bold text-green-400">₱{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isProcessing || !fullName.trim()}
                className="w-full bg-green-700 hover:bg-green-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
              >
                {isProcessing ? 'Processing...' : `Place Order - ₱${totalPrice.toFixed(2)}`}
              </button>

              <Link 
                href="/"
                className="block w-full mt-3 text-center text-yellow-400 hover:text-yellow-300 py-2"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}