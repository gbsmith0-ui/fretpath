import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { priceId, email, userId } = await req.json()
    if (!priceId) {
      return NextResponse.json({ error: "Missing price ID" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { user_id: userId || "" },
      },
      success_url: (process.env.NEXT_PUBLIC_APP_URL || "https://fretpath-sage.vercel.app") + "/dashboard?subscribed=true",
      cancel_url: (process.env.NEXT_PUBLIC_APP_URL || "https://fretpath-sage.vercel.app") + "/pricing",
      metadata: { user_id: userId || "" },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create subscription"
    console.error("Subscription checkout error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}