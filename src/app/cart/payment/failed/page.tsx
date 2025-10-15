'use client'
import { useRouter } from 'next/navigation'
import { XCircle, RotateCcw, Home, AlertTriangle, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Failed Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
          {/* Header with X icon */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6">
              <XCircle className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Payment Failed</h1>
            <p className="text-red-50 text-lg">
              We couldn't process your payment
            </p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Error Message */}
            <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-300">
                Your payment could not be completed. This might be due to insufficient funds, 
                network issues, or the payment was cancelled.
              </p>
            </div>

            {/* Common Reasons */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Common reasons for payment failure:
              </h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-2"></div>
                  <p>Insufficient balance in your account</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-2"></div>
                  <p>Payment was cancelled or timed out</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-2"></div>
                  <p>Network or connectivity issues</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-2"></div>
                  <p>Invalid or expired payment method</p>
                </div>
              </div>
            </div>

            {/* What to do next */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-3">What should I do?</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Check your account balance and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Try a different payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Ensure you have a stable internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Contact your payment provider if the issue persists</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => router.push('/cart')}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold py-4 rounded-xl transition-all"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </div>

            {/* Support Info */}
            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-2">
                Need help? We're here for you!
              </p>
              <p className="text-gray-400 text-sm">
                Contact us at{' '}
                <span className="text-yellow-400 font-semibold">support@kimdispo.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            🔒 Your payment information is secure. No charges were made to your account.
          </p>
        </div>
      </div>
    </div>
  )
}