// app/api/auth/login/route.ts
// ─────────────────────────────────────────────────────
// POST /api/auth/login
// Логинит пользователя, возвращает сессию + профиль
// ─────────────────────────────────────────────────────
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { LoginBody } from '@/lib/types'

export async function POST(req: Request) {
  const { email, password }: LoginBody = await req.json()

  if (!email || !password)
    return NextResponse.json({ error: 'Введи email и пароль' }, { status: 400 })

  // ── Аутентификация ─────────────────────────────────
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error)
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })

  // ── Получаем профиль пользователя ─────────────────
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .single()

  if (profileError)
    return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })

  return NextResponse.json({
    success: true,
    session: data.session,   // содержит access_token для авторизации
    user: data.user,
    profile,
  })
}