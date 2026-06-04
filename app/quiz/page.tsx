'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const questions = [
  {
    id: 'practice_time',
    question: 'How much time can you practice today?',
    options: ['15 minutes', '30 minutes', '45 minutes', '60 minutes'],
  },
  {
    id: 'skill_level',
    question: 'How would you describe your current skill level?',
    options: ['Beginner', 'Intermediate', 'Advanced'],
  },
  {
    id: 'genre',
    question: 'What genre do you most want to focus on?',
    options: ['Blues', 'Classic Rock', 'Country', 'Acoustic', 'Lead Guitar'],
  },
  {
    id: 'goal',
    question: 'What is your main goal right now?',
    options: ['Learn specific songs', 'Improve my technique', 'Build daily consistency', 'Play with other musicians'],
  },
  {
    id: 'weakness',
    question: 'What is your biggest challenge on guitar?',
    options: ['Chord transitions', 'Rhythm and timing', 'Soloing and lead playing', 'Barre chords', 'Music theory'],
  },
  {
    id: 'guitar_type',
    question: 'What guitar do you primarily play?',
    options: ['Electric - Telecaster', 'Electric - Stratocaster', 'Electric - Les Paul', 'Electric - Other', 'Acoustic'],
  },
  {
    id: 'email',
    question: 'Where should we send your practice plan?',
    isEmail: true,
  },
]

const loadingMessages = [
  'Analyzing your skill level and goals...',
  'Selecting genre-specific exercises...',
  'Building your 7-day progression...',
  'Calibrating exercises to your guitar...',
  'Adding technique cues and tips...',
  'Putting the finishing touches on your plan...',
]

export default function QuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const question = questions[currentStep]
  const progress = (currentStep / questions.length) * 100

  useEffect(() => {
    if (!loading) return
    const msgInterval = setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      )
    }, 3000)
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 92) return 92
        return prev + 0.5
      })
    }, 500)
    return () => {
      clearInterval(msgInterval)
      clearInterval(progressInterval)
    }
  }, [loading])

  function handleOption(value: string) {
    const updated = { ...answers, [question.id]: value }
    setAnswers(updated)
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  async function handleSubmit() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    setLoadingMessageIndex(0)
    setLoadingProgress(0)
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong')
      sessionStorage.setItem('fretpath_plan', JSON.stringify(data.plan))
      router.push(`/plan/${data.planId}`)
    } catch (err: unknown) {
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
          <div className="inline-block bg-[#D4890A] text-[#1E2A3A] font-semibold text-base px-3 py-1 rounded-md mb-12">
            FretPath
          </div>
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 border-2 border-[#D4890A]/30 border-t-[#D4890A] rounded-full animate-spin" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2 min-h-[2rem] transition-all duration-500">
            {loadingMessages[loadingMessageIndex]}
          </h2>
          <p className="text-white/40 text-sm mb-10">
            Your personalized plan takes a minute to build properly.
          </p>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#D4890A] rounded-full transition-all duration-500"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {loadingMessages.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i <= loadingMessageIndex ? 'bg-[#D4890A]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-white/25 text-xs mt-8">
            Building exercises for your {answers.skill_level?.toLowerCase()} level {answers.genre?.toLowerCase()} practice...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col">
      <nav className="h-14 border-b border-neutral-200 bg-white flex items-center px-6">
        <a href="/" className="bg-[#1E2A3A] text-[#D4890A] font-semibold text-base px-3 py-1 rounded-md">FretPath</a>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <div className="flex justify-between text-xs text-neutral-400 mb-2">
              <span>Step {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden"