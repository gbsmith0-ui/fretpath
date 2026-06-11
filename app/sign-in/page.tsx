'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSignIn() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://fretpath.app/api/auth/callback',
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex flex-col">
        <nav className="h-14 border-b border-neutral-200 bg-white flex items-center px-6">
          <a href="/" className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-base px-3 py-1 rounded-md">FretPath</a>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-[#D4890A]/15 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4890A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 className="text-xl font-bold text-[#1E2A3A] mb-2">Check your email</h1>
            <p className="text-sm text-neutral-500 leading-relaxed mb-1">We sent a sign-in link to</p>
            <p className="text-sm font-semibold text-[#1E2A3A] mb-6">{email}</p>
            <p className="text-xs text-neutral-400 leading-relaxed">Click the link in the email to sign in. No password needed.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col">
      <nav className="h-14 border-b border-neutral-200 bg-white flex items-center px-6">
        <a href="/" className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-base px-3 py-1 rounded-md">FretPath</a>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1E2A3A] mb-2">Sign in to FretPath</h1>
            <p className="text-sm text-neutral-500">Enter your email and we will send you a sign-in link. No password needed.</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4890A]/30 focus:border-[#D4890A]"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-[#D4890A] text-[#1E2A3A] font-semibold py-3 rounded-lg hover:bg-[#c07a09] transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send sign-in link'}
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-neutral-400 mt-6">
            No account yet? Just enter your email - we will create one automatically.
          </p>
        </div>
      </div>
    </div>
  )
}

