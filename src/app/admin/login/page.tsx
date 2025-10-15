// src/app/admin/login/page.tsx - FIXED VERSION
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../components/AdminProvider";
import { ShoppingBag } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { token, setToken } = useAdmin();
  const [inputToken, setInputToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      // Small delay to ensure token is fully set
      const timer = setTimeout(() => {
        router.push("/admin");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [token, router]);

  async function handleLogin() {
    if (!inputToken.trim()) {
      alert("Please enter your admin token.");
      return;
    }

    setIsLoading(true);

    try {
      const isValid = await verifyAdminToken(inputToken);
      
      if (isValid) {
        // Set token and wait a bit for it to propagate
        setToken(inputToken);
        
        // Give localStorage time to update before redirecting
        setTimeout(() => {
          router.push("/admin");
        }, 100);
      } else {
        alert("Invalid or expired admin token.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Error verifying token. Please try again.");
      setIsLoading(false);
    }
  }

  async function verifyAdminToken(token: string): Promise<boolean> {
    try {
      const res = await fetch("/api/orders", {
        headers: { "x-admin-token": token },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Show redirecting screen if already have token
  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="bg-gray-900/60 border border-yellow-600/40 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">Admin Access</h1>
        <p className="text-gray-400 mb-6">Enter your admin token to continue.</p>

        <input
          type="password"
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleLogin()}
          placeholder="Admin Token"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500 mb-4"
          disabled={isLoading}
          autoFocus
        />

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Access Dashboard"}
        </button>
      </div>
    </div>
  );
}