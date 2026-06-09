'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Exercise {
  name: string
  category: string
  duration_minutes: number
  description: string
  tip: string
}

interface Day {
  day_number: number
  day_name: string
  focus: string
  total_minutes: number
  exercises: Exercise[]
  motivational_note: string
}

interface Plan {
  plan_title: string
  genre: string
  skill_level: string
  daily_duration: string
  overview: string
  days: Day[]
  weekly_goal: string
}

const categoryColors: Record<string, string> = {
  warmup: 'bg-blue-50 text-blue-700 border-blue-200',
  technique: 'bg-purple-50 text-purple-700 border-purple-200',
  theory: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  song: 'bg-green-50 text-green-700 border-green-200',
  improvisation: 'bg-orange-50 text-orange-700 border-orange-200',
  cooldown: 'bg-neutral-50 text-neutral-600 border-neutral-200',
}

export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [openDay, setOpenDay] = useState<number>(1)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [planSaved, setPlanSaved] = useState(false)
  const [practiced, setPracticed] = useState(false)
  const [practicing, setPracticing] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [packId, setPackId] = useState<string | null>(null)
  const [weekNumber, setWeekNumber] = useState<number | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(null)
  const [generatingWeek, setGeneratingWeek] = useState(false)
  const [nextWeekId, setNextWeekId] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const resolvedParams = React.use(params)
  const supabaseBrowserRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const supabaseBrowser = supabaseBrowserRef.current
  useEffect(() => {
    async function loadPlan() {
      const sessionData = sessionStorage.getItem('fretpath_plan')
      if (sessionData) {
        setPlan(JSON.parse(sessionData))
        setLoading(false)
        return
      }
      const id = resolvedParams.id
      if (id && !id.startsWith('plan_')) {
        const { data, error } = await supabase
          .from('practice_plans')
          .select('plan_data')
          .eq('id', id)
          .single()
        if (!error && data) setPlan(data.plan_data)
      }
      setLoading(false)
    }
    async function checkAuth() {
      const { data: { user } } = await supabaseBrowser.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        const id = resolvedParams.id
        if (id && !id.startsWith('plan_')) {
          const { data } = await supabaseBrowser
            .from('practice_plans')
            .select('user_id, pack_id, week_number, skill_level, genre_focus, duration_minutes')
            .eq('id', id)
            .single()
          if (data?.user_id) setPlanSaved(true)
          if (data?.pack_id) setPackId(data.pack_id)
          if (data?.week_number) setWeekNumber(data.week_number)
          if (data) {
            setQuizAnswers({
              practice_time: data.duration_minutes + ' minutes',
              skill_level: data.skill_level,
              genre: data.genre_focus,
              goal: '',
              weakness: '',
              guitar_type: '',
            })
          }
        }
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()
        if (profile?.subscription_tier === 'pro') setIsPro(true)
      }
    }
    loadPlan()
    checkAuth()
    // Show onboarding only on first ever plan visit
    const hasSeen = localStorage.getItem('fretpath_onboarding_seen')
    if (!hasSeen) setShowOnboarding(true)
  }, [resolvedParams.id])

  async function downloadPlan() {
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'fretpath-practice-plan.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  async function handleSavePlan() {
    const id = resolvedParams.id
    if (!id || id.startsWith('plan_')) return
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (!session) { window.location.href = '/sign-in'; return }
    const { error } = await supabase
      .from('practice_plans')
      .update({ user_id: session.user.id })
      .eq('id', id)
    if (!error) setPlanSaved(true)
  }

  async function handleMarkPracticed() {
    if (!isLoggedIn) { window.location.href = '/sign-in'; return }
    setPracticing(true)
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (!session) { window.location.href = '/sign-in'; return }
    const id = resolvedParams.id
    const response = await fetch('/api/log-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ planId: id, durationMinutes: 30 }),
    })
    if (response.ok) setPracticed(true)
    setPracticing(false)
  }

  async function generateNextWeek() {
    if (!packId || !weekNumber || !plan || !quizAnswers) return
    setGeneratingWeek(true)
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (!session) { window.location.href = '/sign-in'; return }
    const response = await fetch('/api/generate-week', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({
        packId,
        weekNumber: weekNumber + 1,
        previousPlan: { plan_title: plan.plan_title, weekly_goal: plan.weekly_goal, overview: plan.overview },
        quizAnswers,
      }),
    })
    const data = await response.json()
    if (response.ok && data.planId) setNextWeekId(data.planId)
    setGeneratingWeek(false)
  }

  function dismissOnboarding() {
    localStorage.setItem('fretpath_onboarding_seen', 'true')
    setShowOnboarding(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#D4890A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Loading your plan...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 text-sm">Plan not found.</p>
          <a href="/quiz" className="text-[#D4890A] text-sm mt-2 block">Generate a new plan</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      <nav className="h-14 border-b border-neutral-200 bg-white flex items-center px-6 sticky top-0 z-10">
        <a href="/" className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-base px-3 py-1 rounded-md">FretPath</a>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        {showOnboarding && (
          <div className="bg-[#1E2A3A] rounded-xl p-5 mb-6 relative">
            <button onClick={dismissOnboarding} className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors text-lg leading-none">x</button>
            <div className="text-[#D4890A] font-semibold text-sm mb-3">Welcome to FretPath</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">&#127928;</div>
                <div className="text-white text-xs font-semibold mb-1">Practice daily</div>
                <div className="text-white/60 text-xs leading-relaxed">Work through each day in order. Even 15 minutes builds real momentum.</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">&#10003;</div>
                <div className="text-white text-xs font-semibold mb-1">Log your session</div>
                <div className="text-white/60 text-xs leading-relaxed">Tap Mark as practiced after each session to track your streak.</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">&#128293;</div>
                <div className="text-white text-xs font-semibold mb-1">Build your streak</div>
                <div className="text-white/60 text-xs leading-relaxed">Practice every day to grow your streak. Check your dashboard to see your progress.</div>
              </div>
            </div>
            <button onClick={dismissOnboarding} className="mt-4 text-xs text-white/40 hover:text-white/60 transition-colors">Got it, hide this</button>
          </div>
        )}

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold text-[#D4890A] uppercase tracking-wider mb-1">Your Practice Plan</div>
              <h1 className="text-xl font-bold text-[#1E2A3A]">{plan.plan_title}</h1>
              {planSaved ? (
                <p className="text-xs text-neutral-400 mt-1">Saved to your account</p>
              ) : (
                <button onClick={handleSavePlan} className="text-xs text-[#D4890A] hover:underline mt-1 text-left">
                  {isLoggedIn ? 'Save to my account' : 'Sign in to save this plan'}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={downloadPlan} className="text-xs bg-[#1E2A3A] text-[#D4890A] px-3 py-1.5 rounded-md hover:bg-[#162030] transition-colors whitespace-nowrap">Download plan</button>
              <button onClick={copyLink} className="text-xs border border-neutral-200 px-3 py-1.5 rounded-md text-neutral-500 hover:border-neutral-400 transition-colors whitespace-nowrap">
                {copied ? 'Copied!' : 'Share link'}
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="text-xs bg-[#1E2A3A]/10 text-[#1E2A3A] px-2 py-1 rounded font-medium">{plan.genre}</span>
            <span className="text-xs bg-[#1E2A3A]/10 text-[#1E2A3A] px-2 py-1 rounded font-medium">{plan.skill_level}</span>
            <span className="text-xs bg-[#1E2A3A]/10 text-[#1E2A3A] px-2 py-1 rounded font-medium">{plan.daily_duration}</span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed mb-4">{plan.overview}</p>
          <div className="bg-[#F8F6F2] rounded-lg p-3 border border-neutral-100">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Weekly Goal</div>
            <p className="text-sm text-[#1E2A3A] font-medium">{plan.weekly_goal}</p>
          </div>
        </div>
        <div className="space-y-3 mb-8">
          {plan.days.map((day) => (
            <div key={day.day_number} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <button onClick={() => setOpenDay(openDay === day.day_number ? 0 : day.day_number)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1E2A3A] text-[#D4890A] text-xs font-bold flex items-center justify-center flex-shrink-0">{day.day_number}</div>
                  <div>
                    <div className="text-sm font-semibold text-[#1E2A3A]">{day.day_name} - {day.focus}</div>
                    <div className="text-xs text-neutral-400">{day.total_minutes} minutes - {day.exercises.length} exercises</div>
                  </div>
                </div>
                <span className="text-neutral-300 text-lg">{openDay === day.day_number ? '-' : '+'}</span>
              </button>
              {openDay === day.day_number && (
                <div className="px-5 pb-5 border-t border-neutral-100">
                  <div className="space-y-3 mt-4">
                    {day.exercises.map((exercise, i) => (
                      <div key={i} className="border border-neutral-100 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="font-medium text-sm text-[#1E2A3A]">{exercise.name}</div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${categoryColors[exercise.category] || 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>{exercise.category}</span>
                            <span className="text-xs text-neutral-400">{exercise.duration_minutes}m</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed mb-2">{exercise.description}</p>
                        <div className="bg-amber-50 rounded p-2">
                          <span className="text-xs font-semibold text-[#D4890A]">Tip: </span>
                          <span className="text-xs text-neutral-600">{exercise.tip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-400 italic mt-4">{day.motivational_note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      {isPro && packId && weekNumber && weekNumber < 4 && (
          <div className="bg-white rounded-xl border border-[#D4890A]/30 p-5 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#D4890A] uppercase tracking-wider mb-1">
                  30-Day Journey - Week {weekNumber} of 4
                </div>
                {nextWeekId ? (
                  <p className="text-sm text-neutral-600">Week {weekNumber + 1} is ready!</p>
                ) : (
                  <p className="text-sm text-neutral-600">Complete this week, then generate Week {weekNumber + 1} when ready.</p>
                )}
              </div>
              {nextWeekId ? (
                <a href={`/plan/${nextWeekId}`} className="bg-[#D4890A] text-[#1E2A3A] font-semibold text-xs px-4 py-2 rounded-lg hover:bg-[#c07a09] transition-colors whitespace-nowrap">
                  Go to Week {weekNumber + 1}
                </a>
              ) : (
                <button onClick={generateNextWeek} disabled={generatingWeek} className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-xs px-4 py-2 rounded-lg hover:bg-[#162030] transition-colors whitespace-nowrap disabled:opacity-50">
                  {generatingWeek ? 'Generating...' : `Generate Week ${weekNumber + 1}`}
                </button>
              )}
            </div>
            <div className="flex gap-1 mt-3">
              {[1, 2, 3, 4].map((w) => (
                <div key={w} className={`h-1 flex-1 rounded-full ${w <= weekNumber ? 'bg-[#D4890A]' : 'bg-neutral-100'}`} />
              ))}
            </div>
          </div>
        )}
        {isLoggedIn && (
          <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4 text-center">
            {practiced ? (
              <div>
                <div className="text-2xl mb-2">🔥</div>
                <p className="text-sm font-semibold text-[#1E2A3A]">Practice logged!</p>
                <p className="text-xs text-neutral-400 mt-1">Your streak has been updated.</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-[#1E2A3A] mb-1">Did you practice today?</p>
                <p className="text-xs text-neutral-500 mb-4">Log your session to keep your streak alive.</p>
                <button onClick={handleMarkPracticed} disabled={practicing} className="bg-[#D4890A] text-[#1E2A3A] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-[#c07a09] transition-colors disabled:opacity-50">
                  {practicing ? 'Logging...' : 'Mark as practiced'}
                </button>
              </div>
            )}
          </div>
        )}
        <div className="bg-[#1E2A3A] rounded-xl p-6 text-center">
          {isPro ? (
            <div>
              <div className="text-[#D4890A] font-semibold mb-1">Your 30-Day Journey is active</div>
              <p className="text-white/80 text-sm leading-relaxed">Use the journey card above to generate each week. Each week builds on the last - follow the progression for the best results.</p>
            </div>
          ) : (
            <div>
              <div className="text-[#D4890A] font-semibold mb-1">Want a full 30-day progression?</div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">FretPath Pro unlocks a 4-week journey where each week builds on the last - personalized to your genre, gear, and goals.</p>
              <a href="/pricing" className="inline-block bg-[#D4890A] text-[#1E2A3A] font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[#c07a09] transition-colors">Start free 7-day trial</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}  
