// app/api/matches/route.ts
// ─────────────────────────────────────────────────────
// GET /api/matches?user_id=xxx
// Возвращает все матчи пользователя с профилями партнёров
// ─────────────────────────────────────────────────────
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')

  if (!userId)
    return NextResponse.json({ error: 'Нужен user_id' }, { status: 400 })

  // Получаем profile.id текущего пользователя
  const { data: me } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!me)
    return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })

  // Получаем все матчи где участвует пользователь
  const { data: matches, error } = await supabaseAdmin
    .from('matches')
    .select(`
      *,
      user1:profiles!matches_user1_id_fkey(*),
      user2:profiles!matches_user2_id_fkey(*)
    `)
    .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`)
    .eq('status', 'matched')
    .order('created_at', { ascending: false })

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  // Для каждого матча выделяем "партнёра" (не себя)
  const result = matches.map(m => ({
    ...m,
    partner: m.user1_id === me.id ? m.user2 : m.user1,
  }))

  return NextResponse.json({ matches: result })
}