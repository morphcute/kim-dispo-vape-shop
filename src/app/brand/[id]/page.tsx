'use client'

import { use, useEffect, useState } from "react";
import Link from 'next/link'
import { ShoppingCart, Plus, Minus, Trash2, Package, Star, TrendingUp, AlertCircle, Check, X as XIcon, ChevronLeft } from 'lucide-react'

type Flavor = { 
  id: number; 
  name: string; 
  code: string; 
  stock: number;
  costPrice: number;
  sellingPrice: number;
};

type Brand = { 
  id: number; 
  name: string; 
  poster: string | null;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
};

type CartItem = { 
  flavorId: number; 
  brandId: number; 
  brandName: string;
  categoryName: string;
  name: string; 
  code: string; 
  qty: number;
  sellingPrice: number;
};

// Cart storage helper
const CART_KEY = "kim-dispo-cart";

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export default function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const brandId = Number(id);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true);
    setCart(getStoredCart());
  }, []);

  // Load brand info (includes category)
  useEffect(() => {
    fetch(`/api/brands/${brandId}`)
      .then(r => r.json())
      .then(data => {
        setBrand(data);
      })
      .catch(err => console.error('Error fetching brand:', err));
  }, [brandId]);

  // Load flavors
  useEffect(() => {
    fetch(`/api/brands/${brandId}/flavors`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setFlavors(data);
        else setFlavors([]);
      })
      .catch(() => setFlavors([]));
  }, [brandId]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add to cart with stock check
  function addToCart(f: Flavor) {
    if (!brand) {
      showNotification('error', "Brand info not loaded yet");
      return;
    }

    const existing = cart.find(c => c.flavorId === f.id);
    
    if (existing) {
      if (existing.qty + 1 > f.stock) {
        showNotification('error', "Not enough stock!");
        return;
      }
      const newCart = cart.map(c => 
        c.flavorId === f.id ? { ...c, qty: c.qty + 1 } : c
      );
      setCart(newCart);
      saveCart(newCart);
      showNotification('success', `Added ${f.name} to cart!`);
    } else {
      if (f.stock <= 0) {
        showNotification('error', "Out of stock!");
        return;
      }
      const newCart = [...cart, { 
        flavorId: f.id, 
        brandId, 
        brandName: brand.name,
        categoryName: brand.category.name,
        name: f.name, 
        code: f.code, 
        qty: 1,
        sellingPrice: f.sellingPrice
      }];
      setCart(newCart);
      saveCart(newCart);
      showNotification('success', `Added ${f.name} to cart!`);
    }
  }

  // Update quantity
  function updateQuantity(flavorId: number, delta: number) {
    const flavor = flavors.find(f => f.id === flavorId);
    const cartItem = cart.find(c => c.flavorId === flavorId);
    
    if (!cartItem || !flavor) return;
    
    const newQty = cartItem.qty + delta;
    
    if (newQty <= 0) {
      removeFromCart(flavorId);
      return;
    }
    
    if (newQty > flavor.stock) {
      showNotification('error', "Not enough stock!");
      return;
    }
    
    const newCart = cart.map(c => 
      c.flavorId === flavorId ? { ...c, qty: newQty } : c
    );
    setCart(newCart);
    saveCart(newCart);
  }

  // Remove from cart
  function removeFromCart(flavorId: number) {
    const newCart = cart.filter(c => c.flavorId !== flavorId);
    setCart(newCart);
    saveCart(newCart);
    showNotification('success', "Item removed from cart");
  }

  // Clear cart
  function clearCart() {
    setCart([]);
    saveCart([]);
    showNotification('success', "Cart cleared");
  }

  // Checkout - redirect to cart page
  function handleCheckout() {
    if (cart.length === 0) {
      showNotification('error', "Cart is empty");
      return;
    }
    window.location.href = "/cart";
  }

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);

  // Sort flavors
  const sortedFlavors = [...flavors].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'price') return a.sellingPrice - b.sellingPrice;
    if (sortBy === 'stock') return b.stock - a.stock;
    return 0;
  });

  // Don't render cart count until mounted (avoid hydration mismatch)
  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-yellow-500 text-xl">Loading...</div>
        </div>
      </main>
    );
  }

  const displayName = brand 
    ? `${brand.name}`
    : "Loading...";

  const categoryName = brand?.category.name || "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl animate-in slide-in-from-top duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <Check className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-yellow-600/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition font-semibold"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Shop
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">{displayName}</h1>
                <p className="text-sm text-gray-400">{categoryName}</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Brand Poster Hero */}
      {brand?.poster && (
        <div className="relative h-64 md:h-96 bg-black overflow-hidden">
          <img 
            src={brand.poster}
            alt={brand.name}
            className="w-full h-full object-cover opacity-40 blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-2">{brand.name}</h2>
              <p className="text-xl text-yellow-400 font-semibold">{brand.category.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Package className="w-5 h-5" />
              <span className="text-sm font-semibold">Total Flavors</span>
            </div>
            <div className="text-2xl font-bold text-white">{flavors.length}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-semibold">In Stock</span>
            </div>
            <div className="text-2xl font-bold text-white">{flavors.filter(f => f.stock > 0).length}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Star className="w-5 h-5" />
              <span className="text-sm font-semibold">Cart Items</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalItems}</div>
          </div>
        </div>

        {/* Flavors Section */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl font-bold text-yellow-400">Available Flavors</h2>
            
            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <label className="text-gray-400 text-sm font-semibold">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
            </div>
          </div>
          
          {flavors.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Flavors Available</h3>
              <p className="text-gray-500">Check back soon for new flavors</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedFlavors.map(f => {
                const inCart = cart.find(c => c.flavorId === f.id);
                const stockPercent = (f.stock / 100) * 100;
                const isLowStock = f.stock > 0 && f.stock <= 10;
                
                return (
                  <div 
                    key={f.id} 
                    className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20"
                  >
                    {/* Header */}
                    <div className="p-5 border-b border-gray-700 bg-gray-900/50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-yellow-400 transition">
                            {f.name}
                          </h3>
                          <p className="text-sm text-gray-400">Code: {f.code}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          f.stock > 10 ? "bg-green-500/20 text-green-400" :
                          f.stock > 0 ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {f.stock > 0 ? `${f.stock} in stock` : "Out of stock"}
                        </div>
                      </div>

                      {/* Stock Bar */}
                      {f.stock > 0 && (
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              isLowStock ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(stockPercent, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    {/* Price & Actions */}
                    <div className="p-5">
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-green-400">
                          ₱{f.sellingPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">per unit</div>
                      </div>

                      {inCart ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2">
                            <button
                              onClick={() => updateQuantity(f.id, -1)}
                              className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition"
                            >
                              <Minus className="w-5 h-5 text-white" />
                            </button>
                            <div className="flex-1 text-center">
                              <div className="text-2xl font-bold text-yellow-400">{inCart.qty}</div>
                              <div className="text-xs text-gray-400">in cart</div>
                            </div>
                            <button
                              onClick={() => updateQuantity(f.id, 1)}
                              disabled={inCart.qty >= f.stock}
                              className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-5 h-5 text-white" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-green-500/20 text-green-400 font-bold py-2 px-3 rounded-lg text-center text-sm">
                              ₱{(f.sellingPrice * inCart.qty).toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeFromCart(f.id)}
                              className="bg-red-600 hover:bg-red-500 p-2 rounded-lg transition"
                            >
                              <Trash2 className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(f)}
                          disabled={f.stock <= 0}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-700 disabled:to-gray-700 text-black disabled:text-gray-500 font-bold py-3 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {f.stock > 0 ? (
                            <>
                              <ShoppingCart className="w-5 h-5" />
                              Add to Cart
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5" />
                              Out of Stock
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setShowCart(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-gray-900 to-black border-l border-yellow-600 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-lg border-b border-yellow-600 p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-yellow-400">Shopping Cart</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-full"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some flavors to get started!</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map(item => (
                      <div 
                        key={item.flavorId}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-500 transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-bold text-white mb-1">{item.name}</div>
                            <div className="text-xs text-gray-400">#{item.code}</div>
                            <div className="text-xs text-gray-500">{item.brandName}</div>
                            <div className="text-sm text-green-400 font-semibold mt-1">
                              ₱{item.sellingPrice.toFixed(2)} each
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.flavorId)}
                            className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-3">
                          <span className="text-yellow-400 font-bold">Qty: {item.qty}</span>
                          <span className="text-white font-bold text-lg">
                            ₱{(item.sellingPrice * item.qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-700 pt-4 mb-6 space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>Items:</span>
                      <span className="font-semibold">{totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold text-yellow-400">Total:</span>
                      <span className="font-bold text-green-400">₱{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                      Proceed to Checkout
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={clearCart}
                        className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-semibold transition"
                      >
                        Clear Cart
                      </button>
                      <button
                        onClick={() => setShowCart(false)}
                        className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}