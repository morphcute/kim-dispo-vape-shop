"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Package, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    console.log("Payment session:", sessionId);

    const timer = setTimeout(() => {
      clearCart();
      setIsProcessing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [clearCart, searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6 animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Payment Successful!
            </h1>
            <p className="text-green-50 text-lg">
              Your order has been confirmed and is being processed
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6 text-center">
              <Package className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white mb-2">
                Thank you for your purchase!
              </h2>
              <p className="text-gray-300">
                We've received your payment and your order is now being prepared.
                You'll receive updates on your order status shortly.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">
                What happens next?
              </h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Order Confirmation</p>
                    <p className="text-sm">We're processing your order right now</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Order Preparation</p>
                    <p className="text-sm">
                      Your items will be prepared for pickup or delivery
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Ready for Pickup</p>
                    <p className="text-sm">
                      We'll notify you when your order is ready
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </div>

            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Need help? Contact us at{" "}
                <span className="text-yellow-400 font-semibold">
                  support@kimdispo.com
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Payment processed securely via PayMongo
          </p>
        </div>
      </div>
    </div>
  );
}
