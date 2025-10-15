// src/app/admin/page.tsx - FIXED VERSION
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "./components/AdminProvider";

export default function AdminRootPage() {
  const router = useRouter();
  const { token } = useAdmin();

  useEffect(() => {
    // Redirect based on authentication status
    if (token) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [token, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-2 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}