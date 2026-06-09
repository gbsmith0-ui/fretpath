import Nav from './components/Nav'
import {
  Clock,
  CreditCard,
  Music,
  Check,
  TrendingUp,
  SlidersHorizontal,
  ListChecks,
  Mail,
} from 'lucide-react'

function Hero() {
  const trustItems = [
    { icon: Clock, label: 'Takes 90 seconds' },
    { icon: CreditCard, label: 'No card required' },
    { icon: Music, label: 'Built for real guitarists' },
  ]
  const timeOptions = ['15 min', '30 min', '45 min', '60 min']
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
      <div className="inline-block text-xs font-semibold text-[#D4890A] tracking-widest uppercase mb-4">AI-powered guitar practice</div>
      <h1 className="text-4xl sm:text-5xl font-bold text-[#1E2A3A] leading-tight mb-5">Know exactly what to practice.<br className="hidden sm:block" /> Every single day.</h1>
      <p className="text-lg text-neutral-600 max-w-xl mx-auto mb-8 leading-relaxed">Stop guessing, stop scrolling YouTube, stop wasting your 20 minutes. FretPath builds a personalized daily routine around your schedule, your gear, and your goals in under 2 minutes.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <a href="/quiz" className="w-full sm:w-auto bg-[#D4890A] text-[#1E2A3A] font-semibold text-base px-8 py-3.5 rounded-md hover:bg-[#c07a09] transition-colors">Build my free practice plan</a>
        <a href="#how-it-works" className="w-full sm:w-auto text-neutral-600 font-medium text-base px-6 py-3.5 rounded-md border border-neutral-300 hover:bg-neutral-100 transition-colors">See how it works</a>
      </div>
      <div className="flex items-center justify-center gap-6 text-sm text-neutral-400 flex-wrap">
        {trustItems.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5"><Icon size={14} />{label}</span>
        ))}
      </div>
      <div className="mt-12 max-w-sm mx-auto bg-white rounded-xl border border-neutral-200 p-5 text-left">
        <div className="text-xs text-neutral-400 mb-2">Step 1 of 7 Â· About your practice</div>
        <div className="text-sm font-semibold text-[#1E2A3A] mb-3">How much time can you practice today?</div>
        <div className="flex gap-2 flex-wrap">
          {timeOptions.map((t, i) => (
            <div key={t} className={`text-xs px-3 py-1.5 rounded-md border cursor-default select-none ${i === 1 ? 'bg-[#1E2A3A] text-[#D4890A] border-[#1E2A3A]' : 'text-neutral-500 border-neutral-200'}`}>{t}</div>
          ))}
        </div>
      </div>
    </section>
  )
}

const valueProps = [
  { icon: ListChecks, title: 'Structured, not random', body: 'No more guessing what to play. Get a clear daily routine built around your skill level, your time, and what you actually want to learn.' },
  { icon: SlidersHorizontal, title: 'Built for your gear', body: 'Exercises tailored to your guitar type and amp. Blues on a Telecaster requires different technique cues than a Les Paul through a stack.' },
  { icon: TrendingUp, title: 'Feel progress weekly', body: "Week 2 builds on Week 1. Your plan evolves as you improve. You'll hear yourself getting better and that feeling keeps you coming back." },
]

function ValueProps() {
  return (
    <section className="bg-white border-y border-neutral-200 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {valueProps.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col">
              <div className="text-[#D4890A] mb-3"><Icon size={24} /></div>
              <h3 className="font-semibold text-[#1E2A3A] mb-2">{title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const steps = [
  { number: '1', title: 'Tell us about yourself', body: '7 quick questions about your practice time, goals, genre preferences, and gear. No music theory required.' },
  { number: '2', title: 'AI builds your plan', body: 'A structured 7-day practice routine is generated in seconds with exercises in the right order, right duration, and right difficulty for exactly where you are.' },
  { number: '3', title: 'Practice with purpose', body: 'Follow your plan online or download it. Know exactly what to do every day. No decisions, no wasted time.' },
]

const samplePlan = [
  { day: 'Mon', pct: 100, dur: '30m' },
  { day: 'Tue', pct: 100, dur: '30m' },
  { day: 'Wed', pct: 55, dur: '15m' },
  { day: 'Thu', pct: 100, dur: '30m' },
  { day: 'Fri', pct: 100, dur: '30m' },
  { day: 'Sat', pct: 70, dur: '20m' },
  { day: 'Sun', pct: 0, dur: 'off' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#1E2A3A] text-center mb-3">From zero clarity to a full week of practice</h2>
      <p className="text-neutral-500 text-center text-sm mb-14">In about 2 minutes.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        {steps.map(({ number, title, body }) => (
          <div key={number} className="text-center">
            <div className="w-9 h-9 rounded-full bg-[#1E2A3A] text-[#D4890A] text-sm font-bold flex items-center justify-center mx-auto mb-4">{number}</div>
            <h3 className="font-semibold text-[#1E2A3A] mb-2">{title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
      <div className="max-w-md mx-auto bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <span className="text-sm font-semibold text-[#1E2A3A]">Blues Â· 30 min Â· Intermediate</span>
          <span className="text-xs bg-[#D4890A]/15 text-[#D4890A] px-2 py-0.5 rounded font-medium">PDF ready</span>
        </div>
        <div className="divide-y divide-neutral-50">
          {samplePlan.map(({ day, pct, dur }) => (
            <div key={day} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-xs font-medium text-neutral-400 w-8">{day}</span>
              <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                {pct > 0 && <div className="h-full rounded-full bg-[#1E2A3A]" style={{ width: `${pct}%` }} />}
              </div>
              <span className="text-xs text-neutral-400 w-7 text-right">{dur}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

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
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E2A3A] text-center mb-3">Start free. Upgrade when ready.</h2>
        <p className="text-neutral-500 text-center mb-12 text-sm">Generate your first plan free - no account needed. Upgrade to Pro for unlimited plans, streak tracking, and your 30-day journey.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          <div className="rounded-xl border-2 border-[#1E2A3A] bg-[#1E2A3A] p-6 flex flex-col">
            <div className="text-xs font-semibold text-[#D4890A]/70 uppercase tracking-wider mb-2">Free Forever</div>
            <div className="text-3xl font-bold text-[#D4890A] mb-1">Free</div>
            <p className="text-sm text-white/60 mb-6">Your first personalized 7-day practice plan. No card, no account required.</p>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80"><Check size={14} className="text-[#D4890A] mt-0.5 shrink-0" />{f}</li>
              ))}
            </ul>
            <a href="/quiz" className="block w-full text-center py-2.5 text-sm font-semibold bg-[#D4890A] text-[#1E2A3A] rounded-md hover:bg-[#c07a09] transition-colors mt-auto">Get my free plan</a>
          </div>
          <div className="rounded-xl border-2 border-[#D4890A]/40 p-6 flex flex-col bg-white">
            <div className="text-xs font-semibold text-[#D4890A] uppercase tracking-wider mb-2">Most Popular</div>
            <div className="text-3xl font-bold text-[#1E2A3A] mb-1">FretPath Pro</div>
            <p className="text-sm text-neutral-500 mb-2">From $12/month - 7-day free trial included.</p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-600">
              <li className="flex items-start gap-2"><Check size={14} className="text-[#D4890A] mt-0.5 shrink-0" />Unlimited AI plan generation</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-[#D4890A] mt-0.5 shrink-0" />Streak tracking + 12-week heatmap</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-[#D4890A] mt-0.5 shrink-0" />Full plan history dashboard</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-[#D4890A] mt-0.5 shrink-0" />30-day journey (4 progressive weeks)</li>
            </ul>
            <a href="/pricing" className="block w-full text-center py-2.5 text-sm font-semibold bg-[#D4890A] text-[#1E2A3A] rounded-md hover:bg-[#c07a09] transition-colors mt-auto">Start free 7-day trial</a>
          </div>
          <div className="rounded-xl border border-neutral-200 p-6 flex flex-col bg-[#F8F6F2]">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Coming Soon</div>
            <div className="text-3xl font-bold text-[#1E2A3A] mb-1">Song Mode</div>
            <p className="text-sm text-neutral-500 mb-6">Pick a specific song. Get a targeted plan to learn it - chords, transitions, strumming, full assembly.</p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-500">
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">o</span>Chord breakdown for your song</li>
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">o</span>Transition drills</li>
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">o</span>Strumming and picking patterns</li>
              <li className="flex items-start gap-2"><span className="text-neutral-300 mt-0.5">o</span>Full song assembly plan</li>
            </ul>
            <div className="block w-full text-center py-2.5 text-sm font-medium border border-neutral-200 rounded-md text-neutral-400 bg-white cursor-default mt-auto">Coming soon</div>
          </div>
        </div>
        <p className="text-center text-xs text-neutral-400 mt-8">No contracts. Cancel anytime. 7-day free trial on all Pro plans.</p>
      </div>
    </section>
  )
}


function EmailCapture() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-[#D4890A] flex justify-center mb-5"><Mail size={28} /></div>
        <h2 className="text-xl font-bold text-[#1E2A3A] mb-2">Not ready yet? Get free practice tips.</h2>
        <p className="text-sm text-neutral-500 mb-7 leading-relaxed">Weekly guitar practice insights, genre-specific drills, and new plan drops straight to your inbox. No spam, ever.</p>
        <form action="/api/subscribe" method="POST" className="flex gap-2">
          <input type="email" name="email" placeholder="your@email.com" required className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#D4890A]/30 focus:border-[#D4890A]" />
          <button type="submit" className="bg-[#D4890A] text-[#1E2A3A] text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-[#c07a09] transition-colors whitespace-nowrap">Subscribe</button>
        </form>
        <p className="text-xs text-neutral-400 mt-3">Unsubscribe anytime.</p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="bg-[#1E2A3A] text-[#D4890A] text-sm font-semibold px-3 py-1 rounded">FretPath</div>
        <div className="flex gap-6 text-xs text-neutral-400">
          <a href="/privacy" className="hover:text-neutral-600 transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-neutral-600 transition-colors">Terms</a>
          <a href="mailto:hello.fretpath@gmail.com" className="hover:text-neutral-600 transition-colors">Contact</a>
        </div>
        <p className="text-xs text-neutral-400">2026 FretPath. Built for real guitarists.</p>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      <Nav />
      <Hero />
      <ValueProps />
      <HowItWorks />
      <Pricing />
      <EmailCapture />
      <Footer />
    </div>
  )
}


