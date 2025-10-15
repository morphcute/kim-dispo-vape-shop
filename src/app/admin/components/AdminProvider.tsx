// src/app/admin/components/AdminProvider.tsx - FIXED VERSION
"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AdminContextType {
  headers: HeadersInit;
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load token from localStorage on component mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('adminToken');
      if (storedToken) {
        setTokenState(storedToken);
      }
      setIsInitialized(true);
    }
  }, []);

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', newToken);
    }
  };

  const logout = () => {
    setTokenState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
  };

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'x-admin-token': token }),
  };

  const value: AdminContextType = {
    headers,
    token,
    setToken,
    logout,
    isAdmin: !!token,
  };

  // Show minimal loading only during initial mount
  if (!isInitialized) {
    return null; // Return null instead of loading screen to prevent flash
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}