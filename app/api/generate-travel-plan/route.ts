import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { practice_time, skill_level, genre, email } = body
    if (!practice_time || !skill_level || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Detect logged-in user
    let userId: string | null = null
    const authHeader = req.headers.get("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "")
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) userId = user.id
    }

    const systemPrompt = [
      "You are a seasoned guitar instructor who has taught adult hobbyist players for 20 years. You specialize in helping guitarists practice effectively when they do not have access to their instrument.",
      "",
      "HOW YOU TEACH WITHOUT A GUITAR:",
      "Every exercise must be genuinely useful for a guitarist who cannot play right now. Focus on: ear training (recognizing intervals, chord qualities, rhythms by ear), music theory (understanding scales, chords, progressions mentally), fretboard visualization (picturing note locations without touching strings), and active listening (analyzing music with purpose). Every exercise must have concrete instructions - never say 'just listen to music.' Tell them exactly what to listen for, how to do it, and what they will gain.",
      "",
      "SKILL LEVEL CALIBRATION:",
      "- Beginner: Focus on basic interval recognition (octaves, fifths, fourths), major vs minor chord quality by ear, counting rhythms, memorizing open string names (EADGBE).",
      "- Intermediate: Focus on chord progression recognition (I-IV-V, ii-V-I), mode identification by ear, pentatonic scale visualization on the fretboard, genre-specific rhythmic feels.",
      "- Advanced: Focus on complex interval recognition, modal ear training, full fretboard note memorization exercises, advanced harmonic analysis of recordings.",
      "",
      "STRUCTURE RULES:",
      "- Exactly 7 days. Each day builds on the previous.",
      "- Each day has 3-4 exercises. Durations must sum to the daily practice time.",
      "- Each exercise category must be one of: warmup, technique, theory, song, improvisation, cooldown.",
      "- Tie exercises to the stated genre where possible (blues ear training differs from country ear training).",
      "",
      "OUTPUT FORMAT:",
      "Respond with valid JSON only - no markdown, no backticks, no explanation.",
    ].join("\n")
  const userPrompt = [
      "Create a 7-day guitar practice plan for a player who does NOT have access to their guitar right now:",
      "- Daily practice time available: " + practice_time,
      "- Skill level: " + skill_level,
      "- Genre they play: " + genre,
      "",
      "All exercises must be doable without a guitar - ear training, music theory study, fretboard visualization, active listening, or rhythm practice (clapping/tapping).",
      "",
      "Each day should have 3-4 exercises totaling the daily practice time.",
      "",
      "Return a JSON object with exactly these fields:",
      "- plan_title (string - include 'No Guitar Needed' or 'Travel Edition' in the title)",
      "- genre (string)",
      "- skill_level (string)",
      "- daily_duration (string)",
      "- overview (string: 2-3 sentences on what this week focuses on and how it will make them a better guitarist when they return)",
      "- days (array of 7 objects, each with: day_number, day_name, focus, total_minutes, exercises (array of 3-4 with: name, category, duration_minutes, description, tip), motivational_note)",
      "- weekly_goal (string: what the player will understand or be able to do better when they pick up their guitar again)",
      "",
      "Keep exercise descriptions to 2-3 sentences. Durations must sum to daily total.",
    ].join("\n")

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    })

    const content_block = message.content[0]
    if (content_block.type !== "text") throw new Error("Unexpected response type")
    let cleaned = content_block.text.replace(/```json/g, "").replace(/```/g, "").trim()
    const jsonStart = cleaned.indexOf("{")
    const jsonEnd = cleaned.lastIndexOf("}")
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
    }
    let planData
    try {
      planData = JSON.parse(cleaned)
    } catch {
      throw new Error("Plan generation failed. Please try again.")
    }

    const shareToken = Math.random().toString(36).substr(2, 12)
    const { data: savedPlan, error: saveError } = await supabase
      .from("practice_plans")
      .insert({
        plan_data: planData,
        duration_minutes: parseInt(practice_time) || 20,
        skill_level: skill_level,
        genre_focus: genre || "General",
        day_count: 7,
        share_token: shareToken,
        plan_type: "travel",
        ...(userId && { user_id: userId }),
      })
      .select("id")
      .single()

    if (saveError) console.error("Supabase save error:", saveError)

    const planId = savedPlan?.id || ("plan_" + Date.now())

    await supabase
      .from("email_subscribers")
      .upsert({ email, source: "travel_quiz" }, { onConflict: "email" })

    fetch((process.env.NEXT_PUBLIC_APP_URL || "https://fretpath-sage.vercel.app") + "/api/send-plan-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, plan: planData, planId }),
    }).catch((emailErr) => {
      console.error("Email send failed:", emailErr)
    })

    return NextResponse.json({ planId, plan: planData, email })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate plan"
    console.error("Generate travel plan error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}  