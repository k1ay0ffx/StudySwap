// app/api/match/route.ts
// ─────────────────────────────────────────────────────
// GET /api/match?user_id=xxx
// Запускает алгоритм подбора партнёра для пользователя.
// Возвращает топ-10 совпадений отсортированных по score.
//
// Алгоритм:
//   score = (навыки A ∩ хочет B) + (навыки B ∩ хочет A)
//   Чем больше взаимных пересечений — тем выше score.
// ─────────────────────────────────────────────────────
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { Profile } from '@/lib/types'

function calcScore(a: Profile, b: Profile): number {
  // Сколько навыков A нужно B
  const aTeachesB = a.skills_teach.filter(s => b.skills_learn.includes(s)).length
  // Сколько навыков B нужно A
  const bTeachesA = b.skills_teach.filter(s => a.skills_learn.includes(s)).length
  return aTeachesB + bTeachesA
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')

  if (!userId)
    return NextResponse.json({ error: 'Нужен user_id' }, { status: 400 })

  // ── Текущий пользователь ───────────────────────────
  const { data: me, error: meError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (meError || !me)
    return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })

  if (!me.skills_teach.length || !me.skills_learn.length)
    return NextResponse.json({ error: 'Заполни навыки в профиле' }, { status: 400 })

  // ── Все остальные пользователи ─────────────────────
  const { data: others } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .neq('user_id', userId)

  if (!others?.length)
    return NextResponse.json({ matches: [] })

  // ── Считаем score и фильтруем ──────────────────────
  const ranked = others
    .map(user => ({ ...user, score: calcScore(me, user) }))
    .filter(u => u.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  // ── Сохраняем новые матчи в базу ───────────────────
  for (const partner of ranked) {
    // Проверяем что матч ещё не существует
    const { data: existing } = await supabaseAdmin
      .from('matches')
      .select('id')
      .or(
        `and(user1_id.eq.${me.id},user2_id.eq.${partner.id}),` +
        `and(user1_id.eq.${partner.id},user2_id.eq.${me.id})`
      )
      .maybeSingle()

    if (!existing) {
      await supabaseAdmin.from('matches').insert({
        user1_id: me.id,
        user2_id: partner.id,
        score: partner.score,
        status: 'matched',
      })

      // Уведомляем обоих пользователей
      await supabaseAdmin.from('notifications').insert([
        {
          user_id: me.id,
          type: 'match_found',
          title: 'Найден партнёр!',
          body: `${partner.name} хочет изучить то, что ты умеешь`,
          meta: { match_partner_id: partner.id },
        },
        {
          user_id: partner.id,
          type: 'match_found',
          title: 'Найден партнёр!',
          body: `${me.name} хочет изучить то, что ты умеешь`,
          meta: { match_partner_id: me.id },
        },
      ])
    }
  }

  return NextResponse.json({ matches: ranked })
}