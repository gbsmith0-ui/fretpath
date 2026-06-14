import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AnnouncementBar from './components/AnnouncementBar'

const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'FretPath - AI Guitar Practice Plans | Personalized Daily Routines',
  description: 'FretPath builds personalized 7-day guitar practice plans around your skill level, genre, gear, and goals. Free AI-powered practice plans for blues, country, classic rock, and acoustic guitar.',
  keywords: 'guitar practice plan, AI guitar practice, personalized guitar lessons, blues guitar practice, country guitar practice, daily guitar routine, guitar practice routine, learn guitar, guitar practice app, intermediate guitar, beginner guitar practice',
  openGraph: {
    title: 'FretPath - Personalized AI Guitar Practice Plans',
    description: 'Stop guessing what to practice. Get a free personalized 7-day guitar practice plan built around your skill level, genre, and gear in under 2 minutes.',
    type: 'website',
    url: 'https://fretpath.app',
    siteName: 'FretPath',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FretPath - AI Guitar Practice Plans',
    description: 'Know exactly what to practice. Every single day. Free personalized 7-day plans for guitarists.',
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
