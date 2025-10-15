"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";

interface AdminContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  headers: Record<string, string>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load token only once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("adminToken");
      setToken(savedToken || null);
      setIsInitialized(true);
    }
  }, []);

  // Persist token changes with 10-minute expiration
  useEffect(() => {
    if (!isInitialized) return;

    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("adminToken", token);
        // Set cookie with 10 minute expiration (600 seconds)
        document.cookie = `admin-token=${token}; path=/; max-age=600; samesite=lax`;
      } else {
        localStorage.removeItem("adminToken");
        document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }, [token, isInitialized]);

  const logout = () => {
    setToken(null);
  };

  const headers = useMemo(
    () => ({
      "x-admin-token": token || "",
      "Content-Type": "application/json",
    }),
    [token]
  );

  // Prevent rendering until initialized to avoid hook inconsistencies
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ token, setToken, headers, logout }}>
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