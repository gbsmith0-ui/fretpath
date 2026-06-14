import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Build Your Free Guitar Practice Plan - FretPath',
  description: 'Answer 7 quick questions about your skill level, genre, and goals. Get a free personalized 7-day guitar practice plan instantly. No card required.',
}
export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}