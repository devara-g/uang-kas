'use client'

import { useState } from 'react'
import { login } from './actions'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    const res = await login(formData)
    if (res?.error) {
      setError(res.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fafafa]">
      <div className="w-full max-w-[360px]">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">KasAdmin</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <form action={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-medium text-zinc-700">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors placeholder:text-zinc-400"
                  placeholder="admin@kelas.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-zinc-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors placeholder:text-zinc-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} KasAdmin. Secure access.</p>
        </div>
      </div>
    </div>
  )
}
