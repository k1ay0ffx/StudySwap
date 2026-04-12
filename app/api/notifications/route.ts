// app/api/notifications/route.ts
// ─────────────────────────────────────────────────────
// GET   /api/notifications?user_id=xxx  — получить уведомления
// PATCH /api/notifications              — пометить как прочитанные
// ─────────────────────────────────────────────────────
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Получить уведомления
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')

  if (!userId)
    return NextResponse.json({ error: 'Нужен user_id' }, { status: 400 })

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('id').eq('user_id', userId).single()

  if (!profile)
    return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  const unread = data.filter(n => !n.is_read).length

  return NextResponse.json({ notifications: data, unread })
}

// Пометить все как прочитанные
export async function PATCH(req: Request) {
  const { user_id } = await req.json()

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('id').eq('user_id', user_id).single()

  if (!profile)
    return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })

  await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', profile.id)
    .eq('is_read', false)

  return NextResponse.json({ success: true })
}