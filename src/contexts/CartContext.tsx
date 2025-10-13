'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeFromCart: (flavorId: number) => void;
  updateQuantity: (flavorId: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getBrandSubtotal: (brandId: number) => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kim-dispo-cart');
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to load cart:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('kim-dispo-cart', JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const addToCart = (item: Omit<CartItem, 'qty'>, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.flavorId === item.flavorId);
      if (existing) {
        return prev.map(c => 
          c.flavorId === item.flavorId ? { ...c, qty: c.qty + qty } : c
        );
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeFromCart = (flavorId: number) => {
    setCart(prev => prev.filter(c => c.flavorId !== flavorId));
  };

  const updateQuantity = (flavorId: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(flavorId);
      return;
    }
    setCart(prev => prev.map(c => 
      c.flavorId === flavorId ? { ...c, qty } : c
    ));
  };

  const clearCart = () => {
    setCart([]);
    if (isClient && typeof window !== 'undefined') {
      localStorage.removeItem('kim-dispo-cart');
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  
  const totalPrice = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);

  const getBrandSubtotal = (brandId: number) => {
    return cart
      .filter(item => item.brandId === brandId)
      .reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems,
      totalPrice,
      getBrandSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}