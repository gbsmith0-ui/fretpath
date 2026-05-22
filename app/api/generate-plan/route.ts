import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { practice_time, skill_level, genre, goal, weakness, guitar_type, email } = body

    if (!email || !skill_level || !genre) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const systemPrompt = "You are an expert guitar instructor. Respond with valid JSON only - no markdown, no backticks, no explanation. Just the raw JSON object."

    const userPrompt = "Create a 7-day guitar practice plan. Practice time: " + practice_time + ". Skill: " + skill_level + ". Genre: " + genre + ". Goal: " + goal + ". Weakness: " + weakness + ". Guitar: " + guitar_type + ". Return JSON with these fields: plan_title, genre, skill_level, daily_duration, overview, days array with day_number/day_name/focus/total_minutes/exercises array with name/category/duration_minutes/description/tip, motivational_note, and weekly_goal."

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    })

    const content_block = message.content[0]
    if (content_block.type !== "text") throw new Error("Unexpected response type")

    const cleaned = content_block.text.replace(/```json/g, "").replace(/```/g, "").trim()

    let planData
    try {
      planData = JSON.parse(cleaned)
    } catch {
      throw new Error("Claude returned invalid JSON")
    }

    const shareToken = Math.random().toString(36).substr(2, 12)

    const { data: savedPlan, error: saveError } = await supabase
      .from("practice_plans")
      .insert({
        plan_data: planData,
        duration_minutes: parseInt(practice_time) || 30,
        skill_level: skill_level,
        genre_focus: genre,
        day_count: 7,
        share_token: shareToken,
      })
      .select("id")
      .single()

    if (saveError) {
      console.error("Supabase save error:", saveError)
    }

    const planId = savedPlan?.id || ("plan_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9))

    await supabase
      .from("email_subscribers")
      .upsert({ email: email, source: "quiz" }, { onConflict: "email" })

    
    try {
      await fetch(process.env.NEXT_PUBLIC_APP_URL + "/api/send-plan-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: planData }),
      })
    } catch (emailErr) {
      console.error("Email send failed:", emailErr)
    }

    return NextResponse.json({ planId, plan: planData, email })

  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate plan"
    console.error("Generate plan error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}