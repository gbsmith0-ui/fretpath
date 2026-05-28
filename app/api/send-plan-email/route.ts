import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, plan, planId } = await req.json()

    if (!email || !plan) {
      return NextResponse.json({ error: "Missing email or plan" }, { status: 400 })
    }

    const daysSummary = plan.days.map((day: any) =>
      "<li style='margin-bottom:8px'><strong>" + day.day_name + "</strong> - " + day.focus + " (" + day.total_minutes + " min)</li>"
    ).join("")

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F8F6F2;">
  <div style="background: #1E2A3A; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
    <h1 style="color: #D4890A; margin: 0; font-size: 24px;">FretPath</h1>
    <p style="color: #ffffff99; margin: 4px 0 0; font-size: 14px;">Your personalized practice plan is ready</p>
  </div>

  <div style="background: white; padding: 24px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e5e5;">
    <h2 style="color: #1E2A3A; margin-top: 0;">${plan.plan_title}</h2>
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <span style="background: #1E2A3A22; color: #1E2A3A; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">${plan.genre}</span>
      <span style="background: #1E2A3A22; color: #1E2A3A; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">${plan.skill_level}</span>
      <span style="background: #1E2A3A22; color: #1E2A3A; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">${plan.daily_duration}</span>
    </div>
    <p style="color: #666; font-size: 14px; line-height: 1.6;">${plan.overview}</p>
  </div>

  <div style="background: white; padding: 24px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e5e5;">
    <h3 style="color: #1E2A3A; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your 7-Day Schedule</h3>
    <ul style="padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
      ${daysSummary}
    </ul>
  </div>

  <div style="background: #1E2A3A; padding: 20px; border-radius: 8px; margin-bottom: 16px; text-align: center;">
    <h3 style="color: #D4890A; margin-top: 0;">Weekly Goal</h3>
    <p style="color: #ffffffcc; font-size: 14px; line-height: 1.6; margin-bottom: 0;">${plan.weekly_goal}</p>
  </div>

  <div style="background: #D4890A; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
    <h3 style="color: #1E2A3A; margin-top: 0;">Want 4 weeks of plans like this?</h3>
    <p style="color: #1E2A3A99; font-size: 14px; margin-bottom: 16px;">Get a full 30-day structured practice pack for just $19.</p>
    <a href="https://fretpath-sage.vercel.app/plan/${planId}" style="background: #1E2A3A; color: #D4890A; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Get the 30-day pack</a>
  </div>

  <p style="color: #999; font-size: 12px; text-align: center;">FretPath — Built for real guitarists<br>
  <a href="https://fretpath-sage.vercel.app" style="color: #D4890A;">fretpath-sage.vercel.app</a></p>
</body>
</html>`

    const { data, error } = await resend.emails.send({
      from: "FretPath <onboarding@resend.dev>",
      to: email,
      subject: "Your FretPath practice plan: " + plan.plan_title,
      html: emailHtml,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })

  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email"
    console.error("Email error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
