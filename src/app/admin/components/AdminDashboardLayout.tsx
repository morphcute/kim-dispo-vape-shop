// src/app/admin/components/AdminDashboardLayout.tsx
"use client";

import { useAdmin } from "./AdminProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AdminDashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { token } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login");
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 lg:ml-0 min-h-screen overflow-auto">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}