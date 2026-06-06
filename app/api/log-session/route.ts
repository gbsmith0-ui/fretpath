import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

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
    const { planId, durationMinutes } = await req.json()
    const today = new Date().toISOString().split("T")[0]
    await supabase.from("practice_sessions").insert({
      user_id: user.id,
      plan_id: planId || null,
      session_date: today,
      day_number: 1,
      duration_planned: durationMinutes || 30,
      duration_actual: durationMinutes || 30,
      completed: true,
    })
    const { data: streakData } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .single()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]
    let newStreak = 1
    let longestStreak = 1
    if (streakData) {
      if (streakData.last_practice_date === today) {
        return NextResponse.json({
          current_streak: streakData.current_streak,
          longest_streak: streakData.longest_streak,
          total_sessions: streakData.total_sessions,
          already_logged: true,
        })
      }
      if (streakData.last_practice_date === yesterdayStr) {
        newStreak = streakData.current_streak + 1
      }
      longestStreak = Math.max(newStreak, streakData.longest_streak)
      await supabase.from("streaks").update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_practice_date: today,
        total_sessions: streakData.total_sessions + 1,
        total_minutes: (streakData.total_minutes || 0) + (durationMinutes || 30),
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id)
    } else {
      await supabase.from("streaks").insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_practice_date: today,
        total_sessions: 1,
        total_minutes: durationMinutes || 30,
      })
    }
    return NextResponse.json({
      current_streak: newStreak,
      longest_streak: longestStreak,
      already_logged: false,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to log session"
    console.error("Log session error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}