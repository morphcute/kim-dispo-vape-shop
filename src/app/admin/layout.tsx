// src/app/admin/layout.tsx - SIMPLIFIED VERSION
"use client";

import { useAdmin } from "./components/AdminProvider";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";
  const isRootAdmin = pathname === "/admin";

  useEffect(() => {
    // Only redirect if on a protected page without token
    if (!token && !isLoginPage && !isRootAdmin) {
      router.replace("/admin/login");
    }
  }, [token, pathname, router, isLoginPage, isRootAdmin]);

  // Login page - render without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Root admin page - render without layout (will self-redirect)
  if (isRootAdmin) {
    return <>{children}</>;
  }

  // Protected pages - show loading if no token yet
  if (!token) {
    return null; // Will redirect via useEffect
  }

  // Authenticated - show full layout
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}