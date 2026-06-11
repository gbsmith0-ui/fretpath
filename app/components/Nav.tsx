'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Nav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [])
  return (
    <nav className="sticky top-0 z-50 bg-[#F8F6F2]/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-lg px-4 py-1.5 rounded-md tracking-tight">FretPath</div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">How it works</a>
          <a href="#whats-coming" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">What''s Coming</a>
          {isLoggedIn ? (
            <a href="/dashboard" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">My plans</a>
          ) : (
            <a href="/sign-in" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Sign in</a>
          )}
        </div>
        <a href="/quiz" className="bg-[#D4890A] text-[#1E2A3A] text-sm font-semibold px-5 py-2 rounded-md hover:bg-[#c07a09] transition-colors">Get my free plan</a>
      </div>
    </nav>
  )
}

