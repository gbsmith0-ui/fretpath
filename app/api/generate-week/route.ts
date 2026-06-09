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
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()
    if (!profile || profile.subscription_tier !== "pro") {
      return NextResponse.json({ error: "upgrade_required" }, { status: 403 })
    }

    const { packId, weekNumber, previousPlan, quizAnswers } = await req.json()
    if (!packId || !weekNumber || !previousPlan || !quizAnswers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { practice_time, skill_level, genre, goal, weakness, guitar_type } = quizAnswers

    const systemPrompt = [
      "You are a seasoned guitar instructor who has taught adult hobbyist players for 20 years. You build focused, realistic practice plans for busy adults who have limited time and want to feel real progress.",
      "",
      "HOW YOU TEACH:",
      "Every exercise you write must teach, not just name a topic. For each exercise, the description must cover: (1) exactly what to do, (2) HOW to do it correctly with concrete physical or musical detail (fingers, frets, strings, tempo, technique), (3) the most common mistake a player makes on it and how to avoid it, and (4) what it feels or sounds like when it is going right, so the player knows they are improving. Be concrete. Never write a vague instruction like 'practice scales for 10 minutes.' Always specify which scale, which position, at what tempo, with what focus.",
      "",
      "SKILL LEVEL DEFINITIONS (calibrate every exercise to the stated level):",
      "- Beginner: Can hold the guitar and knows some open chords. Working on clean chord changes and basic strumming. May not know barre chords yet.",
      "- Intermediate: Comfortable with open and barre chords, knows the pentatonic scale, can play some songs start to finish. Working on technique refinement and basic improvisation.",
      "- Advanced: Fluent with scales and modes across the neck, improvises confidently, understands music theory. Working on nuanced phrasing, tone, and performance-level skills.",
      "",
      "ACCURACY RULES (these matter - a wrong fact destroys trust):",
      "- CHORD FINGERINGS: When describing how to finger a chord, state each finger number, the exact fret number, and the exact string name. Common open chords for reference: E major = 1st finger 1st fret G string, 2nd finger 2nd fret A string, 3rd finger 2nd fret D string. A major = fingers 1-2-3 on 2nd fret of D, G, B strings. D major = 1st finger 2nd fret G string, 2nd finger 2nd fret high E string, 3rd finger 3rd fret B string. G major = 2nd finger 3rd fret low E string, 3rd finger 3rd fret B string, 4th finger 3rd fret high E string, 1st finger 2nd fret A string. C major = 1st finger 1st fret B string, 2nd finger 2nd fret D string, 3rd finger 3rd fret A string. B7 = 2nd finger 2nd fret A string, 1st finger 1st fret D string, 3rd finger 2nd fret G string, B string open, 4th finger 2nd fret high E string.",
      "- Do NOT state specific facts about named songs unless you are highly confident.",
      "- Make sure scales, keys, and chords you reference are musically correct.",
      "",
      "STRUCTURE RULES:",
      "- Exactly 7 days. Each day must genuinely build on prior days - Day 7 should clearly be more advanced than Day 1.",
      "- Each day has 3 to 4 exercises. The sum of exercise durations MUST equal the daily practice time provided.",
      "- Address the player's stated weakness on most days, woven into exercises.",
      "- Tie exercises to the stated genre with genre-authentic techniques.",
      "- Each exercise category must be one of: warmup, technique, theory, song, improvisation, cooldown.",
      "",
      "OUTPUT FORMAT:",
      "Respond with valid JSON only - no markdown, no backticks, no explanation, no text before or after. Just the raw JSON object.",
    ].join("\n")
 const weekContext = weekNumber === 2
      ? "This is Week 2 of a 30-day journey. The player completed Week 1 last week."
      : weekNumber === 3
      ? "This is Week 3 of a 30-day journey. The player completed Weeks 1 and 2."
      : "This is Week 4 of a 30-day journey. The player completed Weeks 1, 2, and 3. This is the final week - make it a strong finish."

    const userPrompt = [
      "Create Week " + weekNumber + " of a 30-day guitar practice journey for this player:",
      "- Daily practice time: " + practice_time,
      "- Skill level: " + skill_level,
      "- Genre focus: " + genre,
      "- Primary goal: " + goal,
      "- Biggest weakness: " + weakness,
      "- Guitar: " + guitar_type,
      "",
      weekContext,
      "",
      "What the player covered in their previous week:",
      "- Plan title: " + previousPlan.plan_title,
      "- Weekly goal achieved: " + previousPlan.weekly_goal,
      "- Overview: " + previousPlan.overview,
      "",
      "IMPORTANT: This week MUST build directly on what was covered. Do not repeat the same exercises. Increase difficulty, introduce new techniques that extend what was learned, and reference the progression explicitly in the overview and motivational notes.",
      "",
      "Return a JSON object with exactly these fields:",
      "- plan_title (string - include 'Week " + weekNumber + ":' at the start)",
      "- genre (string)",
      "- skill_level (string)",
      "- daily_duration (string)",
      "- overview (string: 2-3 sentences on what this week focuses on and how it builds on the previous week)",
      "- days (array of 7 objects, each with: day_number, day_name, focus, total_minutes, exercises (array of 3-4 with: name, category, duration_minutes, description, tip), motivational_note)",
      "- weekly_goal (string: what the player will be able to do by end of this week that they couldn't do at the start)",
      "",
      "Remember: durations must sum to daily time, each day builds on the last, keep descriptions to 2-3 sentences.",
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
        duration_minutes: parseInt(practice_time) || 30,
        skill_level: skill_level,
        genre_focus: genre,
        day_count: 7,
        share_token: shareToken,
        user_id: user.id,
        pack_id: packId,
        week_number: weekNumber,
      })
      .select("id")
      .single()

    if (saveError) {
      console.error("Supabase save error:", saveError)
    }

    const planId = savedPlan?.id || ("plan_" + Date.now())
    return NextResponse.json({ planId, plan: planData })

  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate week"
    console.error("Generate week error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}   