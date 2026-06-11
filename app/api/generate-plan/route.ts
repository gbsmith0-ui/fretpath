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
    const { practice_time, skill_level, genre, goal, weakness, guitar_type, email } = body
    if (!email || !skill_level || !genre) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    // Detect logged-in user from Authorization header
    let userId: string | null = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        userId = user.id
        // Check plan limit for free users
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, plans_generated')
          .eq('id', user.id)
          .single()
        if (profile && profile.subscription_tier === 'free' && profile.plans_generated >= 3) {
          return NextResponse.json({ error: 'upgrade_required', plans_generated: profile.plans_generated }, { status: 403 })
        }
      }
    }
    const systemPrompt = [
      "You are a seasoned guitar instructor who has taught adult hobbyist players for 20 years. You build focused, realistic practice plans for busy adults who have limited time and want to feel real progress.",
      "",
      "HOW YOU TEACH:",
      "Every exercise you write must teach, not just name a topic. For each exercise, the description must cover: (1) exactly what to do, (2) HOW to do it correctly with concrete physical or musical detail (fingers, frets, strings, tempo, technique), (3) the most common mistake a player makes on it and how to avoid it, and (4) what it feels or sounds like when it is going right, so the player knows they are improving. Be concrete. Never write a vague instruction like 'practice scales for 10 minutes.' Always specify which scale, which position, at what tempo, with what focus.",
      "",
      "SKILL LEVEL DEFINITIONS (calibrate every exercise to the stated level):",
      "- Beginner: Can hold the guitar and knows some open chords. Working on clean chord changes and basic strumming. May not know barre chords yet. Do not assume they know scales, theory, or barre chords unless the plan teaches them.",
      "- Intermediate: Comfortable with open and barre chords, knows the pentatonic scale, can play some songs start to finish. Working on technique refinement and basic improvisation.",
      "- Advanced: Fluent with scales and modes across the neck, improvises confidently, understands music theory. Working on nuanced phrasing, tone, and performance-level skills.",
      "",
      "ACCURACY RULES (these matter - a wrong fact destroys trust):",
      "- CHORD FINGERINGS: When describing how to finger a chord, state each finger number, the exact fret number, and the exact string name. Common open chords for reference: E major = 1st finger 1st fret G string, 2nd finger 2nd fret A string, 3rd finger 2nd fret D string. A major = fingers 1-2-3 on 2nd fret of D, G, B strings. D major = 1st finger 2nd fret G string, 2nd finger 2nd fret high E string, 3rd finger 3rd fret B string. G major = 2nd finger 3rd fret low E string, 3rd finger 3rd fret B string, 4th finger 3rd fret high E string, 1st finger 2nd fret A string. C major = 1st finger 1st fret B string, 2nd finger 2nd fret D string, 3rd finger 3rd fret A string. B7 = 2nd finger 2nd fret A string, 1st finger 1st fret D string, 3rd finger 2nd fret G string, B string open, 4th finger 2nd fret high E string.",
      "- Do NOT state specific facts about named songs (their bar count, key, tuning, or chord progression) unless you are highly confident. When in doubt, teach the underlying technique, progression, or form rather than making claims about a specific recording.",
      "- Prefer teaching transferable skills (the 12-bar blues form, the minor pentatonic shape, a strumming pattern) over 'learn this exact song,' since song-specific claims are where errors happen.",
      "- Make sure scales, keys, and chords you reference are musically correct. Do not say a scale fits a key unless you are certain it does.",
      "",
      "STRUCTURE RULES:",
      "- Exactly 7 days. Each day must genuinely build on prior days - Day 7 should clearly be more advanced than Day 1.",
      "- Each day has 3 to 4 exercises. The sum of exercise durations MUST equal the daily practice time provided.",
      "- Address the player's stated weakness on most days, woven into exercises.",
      "- Tie exercises to the stated genre with genre-authentic techniques (e.g. blues: bends, shuffle feel, pentatonic phrasing; country: hybrid picking, chicken pickin', double stops; classic rock: power chords, palm muting, riff-based playing).",
      "- Each exercise 'category' must be one of: warmup, technique, theory, song, improvisation, cooldown.",
      "",
      "OUTPUT FORMAT:",
      "Respond with valid JSON only - no markdown, no backticks, no explanation, no text before or after. Just the raw JSON object.",
    ].join("\n")
    const userPrompt = [
      "Create a 7-day guitar practice plan for this player:",
      "- Daily practice time: " + practice_time + " (the exercises each day must total this many minutes)",
      "- Skill level: " + skill_level,
      "- Genre focus: " + genre,
      "- Primary goal: " + goal,
      "- Biggest weakness to improve: " + weakness,
      "- Guitar they play: " + guitar_type + " (give tone or technique cues appropriate to this instrument where relevant)",
      "",
      "Return a JSON object with exactly these fields:",
      "- plan_title (string)",
      "- genre (string)",
      "- skill_level (string)",
      "- daily_duration (string)",
      "- overview (string: 2-3 sentences on what the week focuses on and why)",
      "- days (array of 7 objects, each with: day_number (int), day_name (string like 'Monday'), focus (string), total_minutes (int, equal to the daily practice time), exercises (array of 3-4 objects, each with: name (string), category (one of: warmup, technique, theory, song, improvisation, cooldown), duration_minutes (int), description (string: 3-4 sentences covering what to do, how to do it correctly, the common mistake, and what success feels like), tip (string: one concrete pro tip)), motivational_note (string: one encouraging sentence specific to that day's work))",
      "- weekly_goal (string: what the player will be able to do by end of week)",
      "",
      "Remember: every exercise description must teach with real depth, durations must sum to the daily time, and each day must build on the last. Keep each exercise description to 2-3 sentences maximum - prioritize clarity and actionability over length.",
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
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
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
    const newPackId = crypto.randomUUID()
    const { data: savedPlan, error: saveError } = await supabase
      .from("practice_plans")
      .insert({
        plan_data: planData,
        duration_minutes: parseInt(practice_time) || 30,
        skill_level: skill_level,
        genre_focus: genre,
        day_count: 7,
        share_token: shareToken,
        ...(userId && { user_id: userId }),
        ...(userId && { pack_id: newPackId, week_number: 1 }),
      })
      .select("id")
      .single()
    if (saveError) {
      console.error("Supabase save error:", saveError)
    }
    const planId = savedPlan?.id || ("plan_" + Date.now())
    // Increment plans_generated for logged-in users
    if (userId) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('plans_generated')
        .eq('id', userId)
        .single()
      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({ plans_generated: (currentProfile.plans_generated || 0) + 1 })
          .eq('id', userId)
      }
    }
    await supabase
      .from("email_subscribers")
      .upsert({ email: email, source: "quiz" }, { onConflict: "email" })
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
    console.error("Generate plan error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
