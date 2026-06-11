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
    const { song_name, skill_level, guitar_type, email } = body
    if (!song_name || !skill_level || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Detect logged-in user
    let userId: string | null = null
    const authHeader = req.headers.get("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "")
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        userId = user.id
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_tier, song_plans_generated")
          .eq("id", user.id)
          .single()
        if (profile && profile.subscription_tier === "free" && profile.song_plans_generated >= 1) {
          return NextResponse.json({ error: "upgrade_required" }, { status: 403 })
        }
      }
    }

    const systemPrompt = [
      "You are a seasoned guitar instructor who has taught adult hobbyist players for 20 years. You specialize in breaking down specific songs into structured, achievable weekly practice plans.",
      "",
      "HOW YOU TEACH:",
      "Every exercise must be concrete and actionable. For each exercise: (1) exactly what to do, (2) HOW to do it with specific physical detail, (3) the most common mistake and how to avoid it, (4) what success looks and sounds like.",
      "",
      "SONG PLAN STRUCTURE - 7 days that build systematically:",
      "- Days 1-2: Chord shapes and individual elements. Learn every chord in the song. No strumming yet - just clean chord formation.",
      "- Days 3-4: Transitions and connections. Practice moving between the specific chords in the song's actual sequence.",
      "- Days 5-6: Full sections with rhythm. Add the strumming or picking pattern. Play through verses and choruses.",
      "- Day 7: Full song run-through. Performance practice - start to finish, handling mistakes without stopping.",
      "",
      "ACCURACY RULES:",
      "- CHORD FINGERINGS: State each finger number, exact fret, exact string. E major = 1st finger 1st fret G string, 2nd finger 2nd fret A string, 3rd finger 2nd fret D string. A major = fingers 1-2-3 on 2nd fret of D, G, B strings. D major = 1st finger 2nd fret G string, 2nd finger 2nd fret high E string, 3rd finger 3rd fret B string. G major = 2nd finger 3rd fret low E string, 3rd finger 3rd fret B string, 4th finger 3rd fret high E string, 1st finger 2nd fret A string. C major = 1st finger 1st fret B string, 2nd finger 2nd fret D string, 3rd finger 3rd fret A string. B7 = 2nd finger 2nd fret A string, 1st finger 1st fret D string, 3rd finger 2nd fret G string, B string open, 4th finger 2nd fret high E string.",
      "- IMPORTANT: If you are not certain of the exact chords in a song, teach the technique and musical concepts the song uses rather than stating specific chords you cannot verify. Never guess at song-specific facts.",
      "- Make all scales and keys musically correct.",
      "",
      "OUTPUT FORMAT:",
      "Respond with valid JSON only - no markdown, no backticks, no explanation.",
    ].join("\n")
    const userPrompt = [
      "Create a 7-day guitar practice plan to learn this song:",
      "- Song: " + song_name,
      "- Skill level: " + skill_level,
      "- Guitar: " + guitar_type,
      "",
      "Follow the song plan structure: Days 1-2 chord shapes, Days 3-4 transitions, Days 5-6 full sections with rhythm, Day 7 full run-through.",
      "",
      "Each day should have 3-4 exercises of 10-15 minutes each (total 30-45 minutes per day).",
      "",
      "Return a JSON object with exactly these fields:",
      "- plan_title (string - include the song name)",
      "- genre (string - infer from the song)",
      "- skill_level (string)",
      "- daily_duration (string - e.g. '30 minutes')",
      "- overview (string: 2-3 sentences on the approach for learning this song)",
      "- days (array of 7 objects, each with: day_number, day_name, focus, total_minutes, exercises (array of 3-4 with: name, category, duration_minutes, description, tip), motivational_note)",
      "- weekly_goal (string: what the player will be able to do with this song by end of week)",
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
        duration_minutes: 30,
        skill_level: skill_level,
        genre_focus: planData.genre || "General",
        day_count: 7,
        share_token: shareToken,
        plan_type: "song",
        ...(userId && { user_id: userId }),
      })
      .select("id")
      .single()

    if (saveError) console.error("Supabase save error:", saveError)

    const planId = savedPlan?.id || ("plan_" + Date.now())

    // Increment song_plans_generated for logged-in users
    if (userId) {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("song_plans_generated")
        .eq("id", userId)
        .single()
      if (currentProfile) {
        await supabase
          .from("profiles")
          .update({ song_plans_generated: (currentProfile.song_plans_generated || 0) + 1 })
          .eq("id", userId)
      }
    }

    await supabase
      .from("email_subscribers")
      .upsert({ email, source: "song_quiz" }, { onConflict: "email" })

    fetch((process.env.NEXT_PUBLIC_APP_URL || "https://fretpath.app") + "/api/send-plan-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, plan: planData, planId }),
    }).catch((emailErr) => {
      console.error("Email send failed:", emailErr)
    })

    return NextResponse.json({ planId, plan: planData, email })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate plan"
    console.error("Generate song plan error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
