'use client'

import { use, useEffect, useState } from "react";

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
  const [showCheckout, setShowCheckout] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // Add to cart with stock check
  function addToCart(f: Flavor) {
    if (!brand) {
      alert("Brand info not loaded yet");
      return;
    }

    const existing = cart.find(c => c.flavorId === f.id);
    
    if (existing) {
      if (existing.qty + 1 > f.stock) {
        alert("Not enough stock!");
        return;
      }
      const newCart = cart.map(c => 
        c.flavorId === f.id ? { ...c, qty: c.qty + 1 } : c
      );
      setCart(newCart);
      saveCart(newCart);
    } else {
      if (f.stock <= 0) {
        alert("Out of stock!");
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
      alert("Not enough stock!");
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
  }

  // Clear cart
  function clearCart() {
    setCart([]);
    saveCart([]);
  }

  // Checkout - redirect to cart page
  function handleCheckout() {
    if (cart.length === 0) return alert("Cart is empty");
    window.location.href = "/cart";
  }

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);

  // Don't render cart count until mounted (avoid hydration mismatch)
  if (!mounted) {
    return (
      <main className="min-h-screen bg-black text-neutral-100">
        <div className="flex items-center justify-center h-screen">
          <div className="text-yellow-500">Loading...</div>
        </div>
      </main>
    );
  }

  const displayName = brand 
    ? `${brand.name} - ${brand.category.name}`
    : "Loading...";

  return (
    <main className="min-h-screen bg-black text-neutral-100">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-yellow-600">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href="/"
              className="text-yellow-500 hover:text-yellow-400 transition"
            >
              ← Back to Shop
            </a>
            <div className="h-6 w-px bg-neutral-700"></div>
            <h1 className="text-xl font-bold text-yellow-500">{displayName}</h1>
          </div>
          
          <button
            onClick={() => setShowCheckout(!showCheckout)}
            className="relative bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded transition"
          >
            🛒 Cart {totalItems > 0 && `(${totalItems})`}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Flavors List */}
        <div className="bg-neutral-900 border border-yellow-600 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-500">Available Flavors</h2>
          
          {flavors.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              No flavors available for this brand yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flavors.map(f => {
                const inCart = cart.find(c => c.flavorId === f.id);
                return (
                  <div 
                    key={f.id} 
                    className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:border-yellow-600 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{f.name}</h3>
                        <p className="text-sm text-neutral-400">Code: {f.code}</p>
                        <p className="text-lg font-bold text-green-400 mt-1">₱{f.sellingPrice.toFixed(2)}</p>
                      </div>
                      <div className={`px-3 py-1 rounded text-sm font-semibold ${
                        f.stock > 10 ? "bg-green-600" :
                        f.stock > 0 ? "bg-yellow-600" :
                        "bg-red-600"
                      }`}>
                        {f.stock > 0 ? `${f.stock} in stock` : "Out of stock"}
                      </div>
                    </div>

                    {inCart ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(f.id, -1)}
                            className="bg-neutral-700 hover:bg-neutral-600 px-3 py-2 rounded transition"
                          >
                            −
                          </button>
                          <span className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded">
                            {inCart.qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(f.id, 1)}
                            disabled={inCart.qty >= f.stock}
                            className="bg-neutral-700 hover:bg-neutral-600 px-3 py-2 rounded transition disabled:opacity-40"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(f.id)}
                            className="ml-auto text-red-500 hover:text-red-400 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-right text-sm text-green-400 font-semibold">
                          Subtotal: ₱{(f.sellingPrice * inCart.qty).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(f)}
                        disabled={f.stock <= 0}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {f.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Sidebar */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCheckout(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-full max-w-md bg-neutral-900 border-l border-yellow-600 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-neutral-900 border-b border-yellow-600 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-yellow-500">Shopping Cart</h2>
              <button 
                onClick={() => setShowCheckout(false)}
                className="text-neutral-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  Your cart is empty
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-6">
                    {cart.map(item => (
                      <div 
                        key={item.flavorId}
                        className="bg-neutral-800 rounded p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-neutral-400">#{item.code}</div>
                            <div className="text-xs text-neutral-500">{item.brandName} - {item.categoryName}</div>
                            <div className="text-sm text-green-400 mt-1">₱{item.sellingPrice.toFixed(2)} each</div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.flavorId)}
                            className="text-red-500 hover:text-red-400 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-yellow-500 font-semibold">Qty: {item.qty}</span>
                          <span className="text-white font-bold">₱{(item.sellingPrice * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-700 pt-4 mb-6">
                    <div className="flex justify-between items-center text-lg mb-4">
                      <span className="font-bold text-yellow-500">Total:</span>
                      <span className="font-bold text-green-400 text-xl">₱{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                      className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Checkout
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={clearCart}
                        className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-semibold transition"
                      >
                        Clear Cart
                      </button>
                      <a
                        href="/"
                        className="bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-lg font-semibold transition text-center flex items-center justify-center"
                      >
                        Continue Shopping
                      </a>
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