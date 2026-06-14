import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'FretPath Pro - Unlimited Guitar Practice Plans | 7-Day Free Trial',
  description: 'Upgrade to FretPath Pro for unlimited AI guitar practice plans, streak tracking, 30-day journey, and more. Start your 7-day free trial today.',
}
export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}