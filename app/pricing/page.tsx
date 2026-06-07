'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const plans = [
  {
    name: 'Monthly',
    price: '$12',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
    savings: null,
    description: 'Full access, cancel anytime.',
    featured: false,
  },
  {
    name: '6 Months',
    price: '$59',
    period: '/6 months',
    priceId: process.env.NEXT_PUBLIC_STRIPE_6MONTH_PRICE_ID!,
    savings: 'Save $13',
    description: 'Commit to the habit, save money.',
    featured: true,
  },
  {
    name: 'Annual',
    price: '$99',
    period: '/year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!,
    savings: 'Save $45',
    description: 'Best value for serious players.',
    featured: false,
  },
]

const features = [
  'Unlimited AI practice plan generation',
  'Full streak tracking and heatmap',
  'Complete plan history',
  'Genre-specific exercise depth',
  'Amp-specific tone guidance',
  'Priority email support',
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const supabaseRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const supabase = supabaseRef.current

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? '')
        setUserId(user.id)
      }
    })
  }, [])

  async function handleSubscribe(priceId: string, planName: string) {
    setLoading(planName)
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email: userEmail, userId }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Subscription error:', err)
    }
    setLoading(null)
  }
  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      <nav className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
        <a href="/" className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-base px-3 py-1 rounded-md">FretPath</a>
        <a href="/dashboard" className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors">Back to dashboard</a>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D4890A]/15 text-[#D4890A] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <span>★</span>
            <span>7-DAY FREE TRIAL — NO CHARGE UNTIL DAY 8</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E2A3A] mb-3">Upgrade to FretPath Pro</h1>
          <p className="text-neutral-500 text-sm max-w-md mx-auto">Unlimited plans, streak tracking, and everything you need to stop quitting guitar. Try free for 7 days.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-xl border-2 p-6 flex flex-col relative ${plan.featured ? 'border-[#D4890A] bg-white shadow-lg' : 'border-neutral-200 bg-white'}`}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4890A] text-[#1E2A3A] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}
              {plan.savings && (
                <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded w-fit mb-2">{plan.savings}</div>
              )}
              <div className="text-sm font-semibold text-neutral-500 mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-[#1E2A3A]">{plan.price}</span>
                <span className="text-sm text-neutral-400">{plan.period}</span>
              </div>
              <p className="text-xs text-neutral-500 mb-6">{plan.description}</p>
              <button
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading !== null}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors mt-auto ${plan.featured ? 'bg-[#D4890A] text-[#1E2A3A] hover:bg-[#c07a09]' : 'bg-[#1E2A3A] text-[#D4890A] hover:bg-[#162030]'} disabled:opacity-50`}
              >
                {loading === plan.name ? 'Loading...' : 'Start 7-day free trial'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-md mx-auto">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Everything in Pro</div>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                <span className="text-[#D4890A] font-bold mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <p className="text-xs text-neutral-400 mt-4 text-center">Cancel anytime. No questions asked.</p>
        </div>
      </div>
    </div>
  )
}