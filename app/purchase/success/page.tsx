'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const planId = searchParams.get('plan_id')

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#D4890A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Confirming your purchase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col">
      <nav className="h-14 border-b border-neutral-200 bg-white flex items-center px-6">
        <a href="/" className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-base px-3 py-1 rounded-md">FretPath</a>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1E2A3A] mb-3">You are all set!</h1>
          <p className="text-neutral-600 text-sm leading-relaxed mb-8">
            Your 30-day practice pack is confirmed. Check your email for your first week plan and we will send the remaining weeks over the coming days.
          </p>
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 text-left">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">What happens next</div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#D4890A] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <p className="text-sm text-neutral-600">Check your email for your Week 1 practice plan</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#D4890A] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <p className="text-sm text-neutral-600">Practice for 7 days and track your progress</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#D4890A] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <p className="text-sm text-neutral-600">Weeks 2, 3, and 4 will build on what you learned</p>
              </div>
            </div>
          </div>
          {planId && (
            <a href={"/plan/" + planId} className="block w-full text-center bg-[#1E2A3A] text-[#D4890A] font-semibold py-3 rounded-lg hover:bg-[#162030] transition-colors mb-3">View your practice plan</a>
          )}
          <a href="/quiz" className="block w-full text-center border border-neutral-200 text-neutral-600 font-medium py-3 rounded-lg hover:bg-neutral-50 transition-colors text-sm">Generate another plan</a>
        </div>
      </div>
    </div>
  )
}