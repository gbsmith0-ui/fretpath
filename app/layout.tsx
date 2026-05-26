import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AnnouncementBar from './components/AnnouncementBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FretPath — Personalized AI Guitar Practice Plans',
  description: 'Stop guessing what to practice. FretPath builds a personalized daily guitar routine around your schedule, gear, and goals — in under 2 minutes.',
  keywords: 'guitar practice plan, AI guitar practice, daily guitar routine, blues guitar practice, intermediate guitar',
  openGraph: {
    title: 'FretPath — Personalized AI Guitar Practice Plans',
    description: 'Stop guessing what to practice. Build a personalized daily routine in 2 minutes.',
    type: 'website',
    url: 'https://fretpath-sage.vercel.app',
    siteName: 'FretPath',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FretPath — AI Guitar Practice Plans',
    description: 'Know exactly what to practice. Every single day.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AnnouncementBar />
        {children}
      </body>
    </html>
  )
}