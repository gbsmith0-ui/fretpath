import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const email = formData.get("email") as string

    if (!email || !email.includes("@")) {
      return NextResponse.redirect(
        new URL("/?subscribe=error", req.url),
        { status: 302 }
      )
    }

    await supabase
      .from("email_subscribers")
      .upsert(
        { email: email, source: "homepage" },
        { onConflict: "email" }
      )

    return NextResponse.redirect(
      new URL("/?subscribe=success", req.url),
      { status: 302 }
    )
  } catch (error) {
    console.error("Subscribe error:", error)
    return NextResponse.redirect(
      new URL("/?subscribe=error", req.url),
      { status: 302 }
    )
  }
}