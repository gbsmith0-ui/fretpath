'use client'

import { useState } from 'react'

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-[#D4890A] text-[#1E2A3A] px-4 py-2.5 flex items-center justify-center gap-3 relative">
      <div className="flex items-center gap-2 text-sm font-medium flex-wrap justify-center">
        <span className="bg-[#1E2A3A] text-[#D4890A] text-xs font-bold px-2 py-0.5 rounded">FOUNDING PRICE</span>
        <span>30-Day Practice Pack is <span className="line-through opacity-60">$29</span> <strong>$19</strong> for early members.</span>
        <a href="#pricing" className="underline font-semibold hover:opacity-80 transition-opacity whitespace-nowrap">Grab it before it goes up</a>
      </div>
      <button onClick={() => setDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2A3A] hover:opacity-60 transition-opacity text-lg font-light leading-none" aria-label="Dismiss">×</button>
    </div>
  )
}