import Stripe from "stripe"
import { NextRequest, NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { email, planId } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email || undefined,
      success_url: (process.env.NEXT_PUBLIC_APP_URL || "https://fretpath.app") + "/purchase/success?session_id={CHECKOUT_SESSION_ID}&plan_id=" + (planId || ""),
      cancel_url: (process.env.NEXT_PUBLIC_APP_URL || "https://fretpath.app") + "/pricing",
      metadata: {
        plan_id: planId || "",
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout"
    console.error("Checkout error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
