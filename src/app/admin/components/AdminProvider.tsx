"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AdminContextType {
  headers: HeadersInit;
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const TOKEN_EXPIRY_HOURS = 2;

interface StoredAuth {
  token: string;
  expiresAt: number;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isTokenExpired = (expiresAt: number): boolean => {
    return Date.now() > expiresAt;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = sessionStorage.getItem('adminAuth');
        if (storedAuth) {
          const parsed: StoredAuth = JSON.parse(storedAuth);
          
          if (isTokenExpired(parsed.expiresAt)) {
            sessionStorage.removeItem('adminAuth');
            setTokenState(null);
          } else {
            setTokenState(parsed.token);
          }
        }
      } catch (error) {
        console.error('Error loading auth token:', error);
        sessionStorage.removeItem('adminAuth');
      }
      setIsLoading(false);
    }
  }, []);

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    if (typeof window !== 'undefined') {
      const expiresAt = Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
      const authData: StoredAuth = {
        token: newToken,
        expiresAt
      };
      sessionStorage.setItem('adminAuth', JSON.stringify(authData));
    }
  };

  const logout = () => {
    setTokenState(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminAuth');
    }
  };

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        try {
          const storedAuth = sessionStorage.getItem('adminAuth');
          if (storedAuth) {
            const parsed: StoredAuth = JSON.parse(storedAuth);
            if (isTokenExpired(parsed.expiresAt)) {
              logout();
            }
          }
        } catch (error) {
          console.error('Error checking token expiry:', error);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [token]);

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
    isLoading,
  };

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