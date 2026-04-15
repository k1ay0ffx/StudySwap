// app/api/profile/update/route.ts
// ✅ FIX: обновляет и профиль в таблице profiles, и пароль в auth.users

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // service role — нужен для admin API
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, password, name, bio, telegram, skills_teach, skills_learn, format } = body

    if (!user_id) {
      return NextResponse.json({ error: 'user_id обязателен' }, { status: 400 })
    }

    // ── 1. Обновляем пароль в auth.users (если передан) ──────
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 400 })
      }
      const { error: authError } = await supabase.auth.admin.updateUserById(user_id, {
        password,
      })
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    }

    // ── 2. Обновляем профиль в таблице profiles ───────────────
    // Собираем только переданные поля
    const profileUpdate: Record<string, unknown> = {}
    if (name    !== undefined) profileUpdate.name         = name
    if (bio     !== undefined) profileUpdate.bio          = bio
    if (telegram !== undefined) profileUpdate.telegram    = telegram
    if (format  !== undefined) profileUpdate.format       = format

    // ✅ FIX: навыки принимаются любые — не только из PRESET_SKILLS
    if (skills_teach !== undefined) {
      if (!Array.isArray(skills_teach)) {
        return NextResponse.json({ error: 'skills_teach должен быть массивом' }, { status: 400 })
      }
      profileUpdate.skills_teach = skills_teach
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    }
    if (skills_learn !== undefined) {
      if (!Array.isArray(skills_learn)) {
        return NextResponse.json({ error: 'skills_learn должен быть массивом' }, { status: 400 })
      }
      profileUpdate.skills_learn = skills_learn
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', user_id)

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 })
      }
    }

    // ── 3. Возвращаем обновлённый профиль ────────────────────
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    return NextResponse.json({ profile })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || 'Ошибка сервера' },
      { status: 500 }
    )
  }
}