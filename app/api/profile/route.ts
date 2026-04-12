// app/api/profile/route.ts
// ─────────────────────────────────────────────────────
// GET  /api/profile?user_id=xxx   — получить профиль
// PATCH /api/profile              — обновить профиль
// ─────────────────────────────────────────────────────
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { UpdateProfileBody } from '@/lib/types'

// Получить профиль по user_id (из auth.users)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')

  if (!userId)
    return NextResponse.json({ error: 'Нужен user_id' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error)
    return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })

  return NextResponse.json({ profile: data })
}

// Обновить профиль
export async function PATCH(req: Request) {
  const body: UpdateProfileBody = await req.json()
  const { user_id, ...updates } = body

  if (!user_id)
    return NextResponse.json({ error: 'Нужен user_id' }, { status: 400 })

  // Убираем undefined поля чтобы не затереть существующие данные
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  )

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(cleanUpdates)
    .eq('user_id', user_id)
    .select()
    .single()

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true, profile: data })
}