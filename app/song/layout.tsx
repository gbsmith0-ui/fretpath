import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Learn Any Song on Guitar in 7 Days - FretPath Song Mode',
  description: 'Tell FretPath which song you want to learn. Get a personalized 7-day plan with chord breakdown, transitions, strumming patterns, and full run-through practice.',
}
export default function SongLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}