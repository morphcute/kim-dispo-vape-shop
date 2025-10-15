// src/app/admin/components/Header.tsx
"use client";

import { useAdmin } from "./AdminProvider"; // Change from AdminContext to AdminProvider

export default function Header() {
  const { token, setToken } = useAdmin();

  return (
    <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800 px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold text-yellow-400">Admin Dashboard</h1>

      <div className="flex items-center gap-3">
        {!token ? (
          <input
            type="password"
            placeholder="Admin Token"
            className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-sm text-gray-200 focus:border-yellow-500 outline-none"
            onChange={(e) => setToken(e.target.value)}
          />
        ) : (
          <button
            onClick={() => {
              if (confirm("Logout from admin dashboard?")) {
                setToken("");
              }
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-semibold transition"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}