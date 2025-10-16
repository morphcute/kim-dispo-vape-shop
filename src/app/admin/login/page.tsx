"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "../components/AdminProvider";
import { ShoppingBag } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setToken } = useAdmin();
  const [inputToken, setInputToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!inputToken.trim()) {
      setError("Please enter your admin token.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const isValid = await verifyAdminToken(inputToken);
      
      if (isValid) {
        setToken(inputToken);
        // Layout will handle redirect
      } else {
        setError("Invalid admin token. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Error verifying token. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyAdminToken(token: string): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/overview", {
        headers: { "x-admin-token": token },
      });
      return res.ok;
    } catch {
      return false;
    }
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
          onKeyDown={(e) => e.key === "Enter" && !isSubmitting && handleLogin()}
          placeholder="Admin Token"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500 mb-4"
          disabled={isSubmitting}
          autoFocus
        />

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Verifying..." : "Access Dashboard"}
        </button>
      </div>
    </div>
  );
}
