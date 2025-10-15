"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: string;
}

export default function Modal({ open, title, children, onClose, width = "max-w-md" }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className={`bg-gray-900 border border-yellow-600/30 rounded-2xl shadow-2xl w-full ${width} overflow-hidden animate-in fade-in zoom-in duration-200`}
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-3">
          <h2 className="text-lg font-bold text-black">{title}</h2>
          <button onClick={onClose} className="text-black hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
