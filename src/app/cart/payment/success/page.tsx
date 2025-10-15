"use client";

import { Suspense } from "react";
import PaymentSuccessContent from "./PaymentSuccessContent";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <p>Loading payment details...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
