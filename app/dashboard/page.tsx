'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface Plan {
  id: string
  created_at: string
  skill_level: string
  genre_focus: string
  duration_minutes: number
  plan_data: { plan_title: string; overview: string }
}

interface Streak {
  current_streak: number
  longest_streak: number
  total_sessions: number
  total_minutes: number
  last_practice_date: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [streak, setStreak] = useState<Streak | null>(null)
  const [practiceDates, setPracticeDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }
      setUserEmail(user.email ?? '')
      const [plansRes, streakRes, sessionsRes] = await Promise.all([
        supabase.from('practice_plans').select('id, created_at, skill_level, genre_focus, duration_minutes, plan_data').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('practice_sessions').select('session_date').eq('user_id', user.id),
      ])
      if (plansRes.data) setPlans(plansRes.data)
      if (streakRes.data) setStreak(streakRes.data)
      if (sessionsRes.data) setPracticeDates(new Set(sessionsRes.data.map((s: { session_date: string }) => s.session_date)))
      setLoading(false)
    }
    loadDashboard()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function buildHeatmap() {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const s = d.toISOString().split('T')[0]
      days.push({ s, practiced: practiceDates.has(s), isToday: i === 0 })
    }
    const weeks: typeof days[] = []
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
    return weeks
  }

  const weeks = buildHeatmap()

  if (loading) return (
    <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D4890A] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      <nav className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
        <a href="/" className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-base px-3 py-1 rounded-md">FretPath</a>
        <div className="flex items-center gap-4">
          <span className="text-xs text-neutral-400 hidden sm:block">{userEmail}</span>
          <button onClick={handleSignOut} className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors">Sign out</button>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
            <div className="text-2xl font-bold text-[#D4890A]">{streak?.current_streak ?? 0}</div>
            <div className="text-xs text-neutral-500 mt-1">Current streak</div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
            <div className="text-2xl font-bold text-[#1E2A3A]">{streak?.longest_streak ?? 0}</div>
            <div className="text-xs text-neutral-500 mt-1">Longest streak</div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
            <div className="text-2xl font-bold text-[#1E2A3A]">{streak?.total_sessions ?? 0}</div>
            <div className="text-xs text-neutral-500 mt-1">Sessions logged</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-6">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Practice calendar — last 12 weeks</div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div key={day.s} title={day.s} className={'w-3 h-3 rounded-sm ' + (day.practiced ? 'bg-[#D4890A]' : day.isToday ? 'bg-[#1E2A3A]/20 ring-1 ring-[#1E2A3A]/30' : 'bg-neutral-100')} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-3 h-3 rounded-sm bg-neutral-100" />
            <span className="text-xs text-neutral-400">No practice</span>
            <div className="w-3 h-3 rounded-sm bg-[#D4890A] ml-3" />
            <span className="text-xs text-neutral-400">Practiced</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-[#1E2A3A]">Your Practice Plans</h1>
            <p className="text-xs text-neutral-500 mt-0.5">{plans.length === 0 ? 'No plans yet' : `${plans.length} plan${plans.length === 1 ? '' : 's'} generated`}</p>
          </div>
          <a href="/quiz" className="bg-[#D4890A] text-[#1E2A3A] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#c07a09] transition-colors whitespace-nowrap">New plan</a>
        </div>
        {plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="text-4xl mb-4">&#9835;</div>
            <h2 className="text-lg font-semibold text-[#1E2A3A] mb-2">No plans yet</h2>
            <p className="text-sm text-neutral-500 mb-6">Generate your first personalized practice plan and it will appear here.</p>
            <a href="/quiz" className="inline-block bg-[#D4890A] text-[#1E2A3A] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#c07a09] transition-colors">Build my free plan</a>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <a key={plan.id} href={`/plan/${plan.id}`} className="block bg-white rounded-xl border border-neutral-200 p-5 hover:border-[#D4890A]/40 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-sm font-semibold text-[#1E2A3A] leading-snug">{plan.plan_data?.plan_title ?? 'Practice Plan'}</h2>
                  <span className="text-xs text-neutral-400 whitespace-nowrap flex-shrink-0">{formatDate(plan.created_at)}</span>
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                  <span className="text-xs bg-[#1E2A3A]/10 text-[#1E2A3A] px-2 py-0.5 rounded font-medium">{plan.genre_focus}</span>
                  <span className="text-xs bg-[#1E2A3A]/10 text-[#1E2A3A] px-2 py-0.5 rounded font-medium">{plan.skill_level}</span>
                  <span className="text-xs bg-[#1E2A3A]/10 text-[#1E2A3A] px-2 py-0.5 rounded font-medium">{plan.duration_minutes} min</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{plan.plan_data?.overview}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}