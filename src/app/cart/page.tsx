'use client'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, Plus, Minus, ChevronLeft, Check, Package, CreditCard, User, AlertCircle, Loader2, CheckCircle, X, Smartphone, Wallet, MapPin, Banknote } from 'lucide-react'

type PaymentMethod = 'gcash' | 'paymaya' | 'grab_pay' | 'cod';

const PAYMONGO_ACTIVE = false;

export default function CartPage() {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart, getBrandSubtotal } = useCart()
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [isProcessing, setIsProcessing] = useState(false)
  const [formError, setFormError] = useState('')
  const router = useRouter()

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderDetails, setOrderDetails] = useState<{ id: number; customer: string; total: number; paymentMethod: string } | null>(null)

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
    setFormError('')
    
    if (!fullName.trim()) {
      setFormError('Please enter your full name')
      return
    }

    if (fullName.trim().length < 3) {
      setFormError('Name must be at least 3 characters')
      return
    }

    if (!address.trim()) {
      setFormError('Please enter your delivery address')
      return
    }

    if (address.trim().length < 10) {
      setFormError('Please provide a complete address (at least 10 characters)')
      return
    }

    setIsProcessing(true)
    
    try {
      const items = cart.map(item => ({
        flavorId: item.flavorId,
        quantity: item.qty
      }))

      if (paymentMethod === 'cod') {
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: fullName.trim(),
            address: address.trim(),
            paymentMethod: 'cod',
            items: items
          })
        })

        if (!orderResponse.ok) {
          throw new Error('Failed to create order')
        }

        const order = await orderResponse.json()
        
        setOrderDetails({
          id: order.id,
          customer: fullName,
          total: totalPrice,
          paymentMethod: 'Cash on Delivery'
        })
        setShowSuccessModal(true)
        
        setTimeout(() => {
          setFullName('')
          setAddress('')
          clearCart()
        }, 100)
        
      } else {
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: fullName.trim(),
            address: address.trim(),
            paymentMethod: paymentMethod,
            items: items
          })
        })

        if (!orderResponse.ok) {
          throw new Error('Failed to create order')
        }

        const order = await orderResponse.json()

        const paymentResponse = await fetch('/api/paymongo/create-source', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: totalPrice,
            description: `Order #${order.id} - ${fullName}`,
            type: paymentMethod
          })
        })

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}))
          console.error('Payment API error:', errorData)
          throw new Error(errorData.error || 'Failed to create payment')
        }

        const paymentData = await paymentResponse.json()
        
        if (paymentData?.data?.attributes?.redirect?.checkout_url) {
          window.location.href = paymentData.data.attributes.redirect.checkout_url
        } else {
          throw new Error('Invalid payment response')
        }
      }
      
    } catch (error) {
      console.error('Checkout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setFormError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setOrderDetails(null)
    clearCart()
    setFullName('')
    setAddress('')
    router.push('/')
  }

  const paymentMethods = [
    { 
      id: 'gcash' as PaymentMethod, 
      name: 'GCash', 
      icon: Smartphone,
      color: 'from-blue-600 to-blue-500',
      description: 'Pay using GCash e-wallet',
      disabled: !PAYMONGO_ACTIVE
    },
    { 
      id: 'paymaya' as PaymentMethod, 
      name: 'Maya', 
      icon: Wallet,
      color: 'from-green-600 to-green-500',
      description: 'Pay using Maya (PayMaya)',
      disabled: !PAYMONGO_ACTIVE
    },
    { 
      id: 'grab_pay' as PaymentMethod, 
      name: 'GrabPay', 
      icon: CreditCard,
      color: 'from-emerald-600 to-emerald-500',
      description: 'Pay using GrabPay',
      disabled: !PAYMONGO_ACTIVE
    },
    { 
      id: 'cod' as PaymentMethod, 
      name: 'Cash on Delivery', 
      icon: Banknote,
      color: 'from-orange-600 to-orange-500',
      description: 'Pay with cash when you receive',
      disabled: false
    },
  ]

  if (totalItems === 0 && !showSuccessModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-400 mb-6">Looks like you haven't added any items yet!</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-6 py-3 rounded-lg font-bold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && orderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Order Placed!</h3>
              </div>
              <button
                onClick={handleCloseSuccessModal}
                className="text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-gray-300">
                  Your order has been successfully placed!
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 border border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Order Number:</span>
                  <span className="font-bold text-yellow-400">#{orderDetails.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Customer:</span>
                  <span className="font-semibold text-white">{orderDetails.customer}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Payment:</span>
                  <span className="font-semibold text-white">{orderDetails.paymentMethod}</span>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Amount:</span>
                    <span className="font-bold text-green-400 text-xl">₱{orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                <p className="text-green-300 text-xs text-center">
                  {orderDetails.paymentMethod === 'Cash on Delivery' 
                    ? 'Thank you! Please prepare exact change upon delivery.' 
                    : 'Thank you for your order! We\'ll process it right away.'}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={handleCloseSuccessModal}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2.5 rounded-lg transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        {/* Header */}
        <div className="bg-black/95 backdrop-blur-lg border-b border-yellow-600/30 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 transition font-semibold text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <h1 className="text-lg font-bold text-white">Cart ({totalItems})</h1>
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-red-500 hover:text-red-400 font-semibold transition text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cart Content */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-bold text-yellow-400">Your Items ({totalItems})</h2>
                </div>
                
                <div className="space-y-3">
                  {Array.from(cartByBrand.entries()).map(([brandId, items]) => {
                    const brandName = items[0].brandName;
                    const categoryName = items[0].categoryName;
                    const brandSubtotal = getBrandSubtotal(brandId);
                    
                    return (
                      <div key={brandId} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                        {/* Brand Header */}
                        <div className="bg-gray-900/80 px-3 py-2 border-b border-gray-700 flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-bold text-white">{brandName}</h3>
                            <p className="text-xs text-gray-400">{categoryName}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Subtotal</div>
                            <div className="text-sm font-bold text-green-400">₱{brandSubtotal.toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-gray-700">
                          {items.map(item => (
                            <div 
                              key={item.flavorId} 
                              className="p-3 hover:bg-gray-800/50 transition"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-white mb-0.5 truncate">{item.name}</h4>
                                  <p className="text-xs text-gray-400 mb-1">Code: {item.code}</p>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-green-400 font-bold text-sm">₱{(item.sellingPrice || 0).toFixed(2)}</span>
                                    <span className="text-gray-500 text-xs">per unit</span>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <div className="flex items-center gap-1 bg-gray-900 rounded p-0.5">
                                    <button
                                      onClick={() => updateQuantity(item.flavorId, item.qty - 1)}
                                      className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition"
                                    >
                                      <Minus className="w-3 h-3 text-white" />
                                    </button>
                                    <div className="px-3 py-1 bg-yellow-500 text-black font-bold min-w-[40px] text-center rounded text-sm">
                                      {item.qty}
                                    </div>
                                    <button
                                      onClick={() => updateQuantity(item.flavorId, item.qty + 1)}
                                      className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded transition"
                                    >
                                      <Plus className="w-3 h-3 text-white" />
                                    </button>
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className="text-xs text-gray-400">Total</div>
                                    <div className="text-sm font-bold text-white">
                                      ₱{((item.sellingPrice || 0) * item.qty).toFixed(2)}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => removeFromCart(item.flavorId)}
                                    className="flex items-center gap-0.5 text-red-500 hover:text-red-400 text-xs font-semibold transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Remove
                                  </button>
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
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 sm:p-4 lg:sticky lg:top-20">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-bold text-yellow-400">Checkout</h3>
                </div>
                
                {/* Customer Info */}
                <div className="mb-3">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      setFormError('')
                    }}
                    placeholder="Enter your full name"
                    className={`w-full bg-gray-900 border ${formError && !fullName.trim() ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition`}
                    required
                  />
                </div>

                {/* Address Field */}
                <div className="mb-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Delivery Address *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      setFormError('')
                    }}
                    placeholder="House #, Street, Barangay, City, Province"
                    rows={2}
                    className={`w-full bg-gray-900 border ${formError && !address.trim() ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition resize-none`}
                    required
                  />
                  {formError && (!fullName.trim() || !address.trim()) && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formError}
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-2">
                    <Wallet className="w-3.5 h-3.5" />
                    Payment Method *
                  </label>
                  
                  {!PAYMONGO_ACTIVE && (
                    <div className="mb-2 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <p className="text-yellow-300 text-xs">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Online payments temporarily unavailable
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isDisabled = method.disabled;
                      
                      return (
                        <button
                          key={method.id}
                          onClick={() => !isDisabled && setPaymentMethod(method.id)}
                          disabled={isDisabled}
                          className={`w-full p-2.5 rounded-lg border-2 transition-all ${
                            isDisabled
                              ? 'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
                              : paymentMethod === method.id
                              ? `border-yellow-500 bg-gradient-to-r ${method.color} shadow-lg`
                              : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDisabled 
                                ? 'bg-gray-800' 
                                : paymentMethod === method.id 
                                ? 'bg-white/20' 
                                : 'bg-gray-800'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                                {method.name}
                                {isDisabled && (
                                  <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">Disabled</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-300">{method.description}</div>
                            </div>
                            {!isDisabled && paymentMethod === method.id && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-4 p-3 bg-gray-900/50 rounded-lg space-y-2 border border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      Total Items:
                    </span>
                    <span className="font-bold text-white">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Brands:</span>
                    <span className="font-bold text-white">{cartByBrand.size}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-yellow-400 text-sm">Total Amount:</span>
                      <span className="font-bold text-green-400 text-xl">₱{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing || !fullName.trim() || !address.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 mb-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {paymentMethod === 'cod' ? 'Place Order' : `Pay with ${paymentMethods.find(m => m.id === paymentMethod)?.name}`}
                    </>
                  )}
                </button>

                {/* Error Display */}
                {formError && fullName.trim() !== '' && address.trim() !== '' && (
                  <div className="mb-2 p-2.5 bg-red-900/20 border border-red-700/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-300 text-xs font-semibold mb-0.5">Error</p>
                        <p className="text-red-200 text-xs">{formError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Link 
                  href="/"
                  className="block w-full text-center text-yellow-400 hover:text-yellow-300 py-2 font-semibold transition border border-gray-700 rounded-lg hover:bg-gray-800/50 text-sm"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Secure payment {PAYMONGO_ACTIVE && 'via PayMongo'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Authentic products guaranteed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Fast order processing</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Cash on Delivery available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}