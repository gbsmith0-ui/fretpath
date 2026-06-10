'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const skillLevels = ['Beginner', 'Intermediate', 'Advanced']
const guitarTypes = ['Electric - Telecaster', 'Electric - Stratocaster', 'Electric - Les Paul', 'Electric - Other', 'Acoustic']

const loadingMessages = [
  'Analyzing the song structure...',
  'Breaking down the chords...',
  'Building your practice progression...',
  'Adding technique cues...',
  'Putting the finishing touches on your plan...',
]

export default function SongPage() {
  const router = useRouter()
  const [songName, setSongName] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [guitarType, setGuitarType] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState('')
  const supabaseRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const supabase = supabaseRef.current

  async function handleSubmit() {
    if (!songName.trim()) { setError('Please enter a song name.'); return }
    if (!skillLevel) { setError('Please select your skill level.'); return }
    if (!email || !email.includes('@')) { setError('Please enter a valid email.'); return }
    setError('')
    setLoading(true)
    setLoadingMessageIndex(0)
    setLoadingProgress(0)

    const msgInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => prev < loadingMessages.length - 1 ? prev + 1 : prev)
    }, 3000)
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => prev >= 92 ? 92 : prev + 0.5)
    }, 500)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/generate-song-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({ song_name: songName, skill_level: skillLevel, guitar_type: guitarType || 'Acoustic', email }),
      })
      const data = await response.json()
      clearInterval(msgInterval)
      clearInterval(progressInterval)
      if (response.status === 403 && data.error === 'upgrade_required') {
        router.push('/pricing')
        return
      }
      if (!response.ok) throw new Error(data.error || 'Something went wrong')
      sessionStorage.setItem('fretpath_plan', JSON.stringify(data.plan))
      router.push(`/plan/${data.planId}`)
    } catch (err: unknown) {
      clearInterval(msgInterval)
      clearInterval(progressInterval)
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      setLoading(false)
      setLoadingProgress(0)
      setLoadingMessageIndex(0)
    }
  }
 if (loading) {
    return (
      <div className="min-h-screen bg-[#1E2A3A] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-block bg-[#D4890A] text-[#1E2A3A] font-semibold text-base px-3 py-1 rounded-md mb-12">FretPath</div>
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 border-2 border-[#D4890A]/30 border-t-[#D4890A] rounded-full animate-spin" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">{loadingMessages[loadingMessageIndex]}</h2>
          <p className="text-white/40 text-sm mb-10">Building your personalized plan for {songName}...</p>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#D4890A] rounded-full transition-all duration-500" style={{ width: `${loadingProgress}%` }} />
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {loadingMessages.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i <= loadingMessageIndex ? 'bg-[#D4890A]' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col">
      <nav className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6">
        <a href="/" className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-base px-3 py-1 rounded-md">FretPath</a>
        <a href="/quiz" className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors">General practice plan instead</a>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block bg-[#D4890A]/15 text-[#D4890A] text-xs font-bold px-3 py-1.5 rounded-full mb-4">SONG MODE</div>
            <h1 className="text-2xl font-bold text-[#1E2A3A] mb-2">Learn a specific song</h1>
            <p className="text-sm text-neutral-500">Get a 7-day plan built around one song - chord breakdown, transitions, rhythm, and full run-through.</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1E2A3A] mb-2">What song do you want to learn?</label>
              <input
                type="text"
                placeholder="e.g. Wonderwall, Brown Eyed Girl, Jolene..."
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4890A]/30 focus:border-[#D4890A]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1E2A3A] mb-2">Your skill level</label>
              <div className="grid grid-cols-3 gap-2">
                {skillLevels.map((level) => (
                  <button key={level} onClick={() => setSkillLevel(level)}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${skillLevel === level ? 'bg-[#1E2A3A] text-[#D4890A] border-[#1E2A3A]' : 'bg-white text-neutral-700 border-neutral-200 hover:border-[#1E2A3A]'}`}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1E2A3A] mb-2">Your guitar <span className="text-neutral-400 font-normal">(optional)</span></label>
              <div className="space-y-2">
                {guitarTypes.map((guitar) => (
                  <button key={guitar} onClick={() => setGuitarType(guitar)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${guitarType === guitar ? 'bg-[#1E2A3A] text-[#D4890A] border-[#1E2A3A]' : 'bg-white text-neutral-700 border-neutral-200 hover:border-[#1E2A3A]'}`}>
                    {guitar}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1E2A3A] mb-2">Where should we send your plan?</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4890A]/30 focus:border-[#D4890A]"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-[#D4890A] text-[#1E2A3A] font-semibold py-3 rounded-lg hover:bg-[#c07a09] transition-colors disabled:opacity-50">
              Build my song plan
            </button>
          </div>
          <p className="text-center text-xs text-neutral-400 mt-4">Free users get 1 song plan. Unlimited with FretPath Pro.</p>
        </div>
      </div>
    </div>
  )
} 