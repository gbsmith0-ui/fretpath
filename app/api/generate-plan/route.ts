import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { practice_time, skill_level, genre, goal, weakness, guitar_type, email } = body

    if (!email || !skill_level || !genre) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const systemPrompt = "You are an expert guitar instructor. Respond with valid JSON only - no markdown."

    const userPrompt = "Create a 7-day guitar practice plan. Practice time: " + practice_time + ". Skill: " + skill_level + ". Genre: " + genre + ". Goal: " + goal + ". Weakness: " + weakness + ". Guitar: " + guitar_type + ". Return JSON with these fields: plan_title, genre, skill_level, daily_duration, overview, days array with day_number/day_name/focus/total_minutes/exercises array with name/category/duration_minutes/description/tip, motivational_note, and weekly_goal."

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    })

    const content = message.content[0]
    if (content.type !== "text") throw new Error("Unexpected response type")

    let planData
    try {
      const cleaned = content.text.replace(/```json/g, "").replace(/```/g, "").trim(); planData = JSON.parse(cleaned)
    } catch {
      throw new Error("Claude returned invalid JSON")
    }

    const planId = "plan_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)

    return NextResponse.json({ planId, plan: planData, email })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate plan"
    console.error("Generate plan error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
