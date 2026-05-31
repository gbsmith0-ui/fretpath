'use client'

import { useState } from 'react'

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="bg-[#1E2A3A] text-white px-4 py-2.5 flex items-center justify-center gap-3 relative">
      <div className="flex items-center gap-2 text-sm flex-wrap justify-center">
        <span className="bg-[#D4890A] text-[#1E2A3A] text-xs font-bold px-2 py-0.5 rounded">NEW</span>
        <span className="text-white/80">AI-powered guitar practice plans, personalized to your gear, genre, and schedule.</span>
        <a href="/quiz" className="text-[#D4890A] font-semibold hover:opacity-80 transition-opacity whitespace-nowrap underline">Try it free</a>
      </div>
      <button onClick={() => setDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors text-lg font-light leading-none" aria-label="Dismiss">x</button>
    </div>
  )
}