const fs = require('fs')

// FIX 1a: Nav "Pricing" → "What's Coming"
let page = fs.readFileSync('app/page.tsx', 'utf8')

page = page.replace(
  'href="#pricing"',
  'href="#whats-coming"'
)
page = page.replace(
  '>            Pricing',
  ">            What's Coming"
)

// FIX 1b: Replace Pricing function entirely
const oldStart = '// ─────────────────────────────────────────────\n// PRICING'
const oldEnd = '  )\n}\n\n// ─────────────────────────────────────────────\n// EMAIL CAPTURE'

const newPricingBlock = `// ─────────────────────────────────────────────
// WHATS COMING
// ─────────────────────────────────────────────
const freeFeatures = [
  '1 personalized 7-day plan',
  'Online plan viewer',
  'Email delivery',
  'Download your plan',
]

function Pricing() {
  return (
    <section id="whats-coming" className="bg-white border-y border-neutral-200 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E2A3A] text-center mb-3">
          What's Coming
        </h2>
        <p className="text-neutral-500 text-center mb-12 text-sm">
          FretPath is free right now. Paid plans are in development — try the free plan to be first in line.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          <div className="rounded-xl border-2 border-[#1E2A3A] bg-[#1E2A3A] p-6 flex flex-col">
            <div className="text-xs font-semibold text-[#D4890A]/70 uppercase tracking-wider mb-2">Available Now</div>
            <div className="text-3xl font-bold text-[#D4890A] mb-1">Free</div>
            <p className="text-sm text-white/60 mb-6">Your personalized 7-day practice plan. No card, no account required.</p>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <Check size={14} className="text-[#D4890A] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="/quiz" className="block w-full text-center py-2.5 text-sm font-semibold bg-[#D4890A] text-[#1E2A3A] rounded-md hover:bg-[#c07a09] transition-colors mt-auto">Get my free plan</a>
          </div>
          <div className="rounded-xl border border-neutral-200 p-6 flex flex-col bg-[#F8F6F2]">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">In Development</div>
            <div className="text-3xl font-bold text-[#1E2A3A] mb-1">30-Day Pack</div>
            <p className="text-sm text-neutral-500 mb-6">Four weeks of AI-generated plans that build on each other, emailed weekly.</p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-500">
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">○</span>4 progressive weekly plans</li>
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">○</span>Genre-specific progressions</li>
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">○</span>Amp-specific tone guidance</li>
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">○</span>Printable PDF each week</li>
            </ul>
            <div className="block w-full text-center py-2.5 text-sm font-medium border border-neutral-200 rounded-md text-neutral-400 bg-white cursor-default mt-auto">Coming soon</div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-6 flex flex-col bg-[#F8F6F2]">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">In Development</div>
            <div className="text-3xl font-bold text-[#1E2A3A] mb-1">Monthly Plans</div>
            <p className="text-sm text-neutral-500 mb-6">A new personalized plan every week, plus streak tracking and progress over time.</p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-500">
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">○</span>Unlimited AI plan generation</li>
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">○</span>Streak and progress tracking</li>
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">○</span>Genre-specific learning paths</li>
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">○</span>Saved plan history</li>
            </ul>
            <div className="block w-full text-center py-2.5 text-sm font-medium border border-neutral-200 rounded-md text-neutral-400 bg-white cursor-default mt-auto">Coming soon</div>
          </div>
        </div>
        <p className="text-center text-xs text-neutral-400 mt-8">
          Monthly plans and a 30-day pack are in development. Try the free 7-day plan to be first in line.
        </p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// EMAIL CAPTURE`

const pricingStart = page.indexOf(oldStart)
const emailStart = page.indexOf(oldEnd) + oldEnd.length - '// ─────────────────────────────────────────────\n// EMAIL CAPTURE'.length

if (pricingStart === -1) {
  console.log('ERROR: Could not find pricing section start')
} else {
  page = page.substring(0, pricingStart) + newPricingBlock + page.substring(emailStart)
  console.log('Pricing section replaced')
}

fs.writeFileSync('app/page.tsx', page)
console.log('page.tsx saved')

// FIX 2: AnnouncementBar
const newBar = `'use client'

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
}`

fs.writeFileSync('app/components/AnnouncementBar.tsx', newBar)
console.log('AnnouncementBar.tsx saved')

// FIX 3: Success page
const successPath = 'app/purchase/success/page.tsx'
if (fs.existsSync(successPath)) {
  let s = fs.readFileSync(successPath, 'utf8')
  s = s.replace('Your 30-day practice pack is confirmed. Check your email for your first week plan and we will send the remaining weeks over the coming days.', 'Your purchase is confirmed. We are building out the full 30-day pack experience and will be in touch shortly with next steps.')
  s = s.replace('Check your email for your Week 1 practice plan', 'We will be in touch with your content shortly')
  s = s.replace('Practice for 7 days and track your progress', 'In the meantime, generate a free 7-day plan below')
  s = s.replace('Weeks 2, 3, and 4 will build on what you learned', 'Full 30-day content is coming — thank you for your patience')
  fs.writeFileSync(successPath, s)
  console.log('Success page saved')
} else {
  console.log('Success page not found - skipping')
}

console.log('\nDone. Run: git add . && git commit -m "fix: pre-launch cleanup" && git push')