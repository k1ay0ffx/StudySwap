// app/api/auth/register/route.ts
// ─────────────────────────────────────────────────────
// POST /api/auth/register
// Создаёт аккаунт в Supabase Auth + профиль в таблице profiles
// ─────────────────────────────────────────────────────
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { RegisterBody } from '@/lib/types'

export async function POST(req: Request) {
  const body: RegisterBody = await req.json()
  const { name, email, password, bio, telegram, skills_teach, skills_learn, format } = body

  // ── Валидация ──────────────────────────────────────
  if (!name || !email || !password)
    return NextResponse.json({ error: 'Имя, email и пароль обязательны' }, { status: 400 })
  if (!skills_teach?.length || !skills_learn?.length)
    return NextResponse.json({ error: 'Выбери хотя бы по одному навыку' }, { status: 400 })
  if (password.length < 6)
    return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 400 })

  // ── Создаём пользователя в Supabase Auth ───────────
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // без подтверждения письмом (для MVP)
  })
  if (authError)
    return NextResponse.json({ error: authError.message }, { status: 400 })

  // ── Создаём профиль ────────────────────────────────
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      user_id: authData.user.id,
      name,
      bio: bio ?? '',
      telegram: telegram ?? '',
      skills_teach,
      skills_learn,
      format: format ?? 'both',
    })
    .select()
    .single()

  if (profileError)
    return NextResponse.json({ error: profileError.message }, { status: 400 })

  return NextResponse.json({ success: true, profile })
}