"use client";

import { AdminProvider, useAdmin } from "./components/AdminProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Link from "next/link";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, isLoading } = useAdmin();
  const isLoginPage = pathname === "/admin/login";

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    if (!token && !isLoginPage) {
      router.replace("/admin/login");
    } else if (token && isLoginPage) {
      router.replace("/admin/dashboard");
    }
  }, [token, isLoading, isLoginPage, router]);

  // Show loading during initial check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Login page (no sidebar, no header)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Protected pages (with sidebar)
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
      <main className="flex-1 lg:ml-0 min-h-screen overflow-auto">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
