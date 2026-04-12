// app/api/reviews/route.ts
// ─────────────────────────────────────────────────────
// POST /api/reviews  — оставить отзыв после занятия
// GET  /api/reviews?profile_id=xxx — получить отзывы профиля
// ─────────────────────────────────────────────────────
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { ReviewBody } from '@/lib/types'

// Оставить отзыв
export async function POST(req: Request) {
  const body: ReviewBody = await req.json()
  const { match_id, from_user_id, to_user_id, rating, comment } = body

  if (!match_id || !from_user_id || !to_user_id || !rating)
    return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 })

  if (rating < 1 || rating > 5)
    return NextResponse.json({ error: 'Оценка от 1 до 5' }, { status: 400 })

  // Получаем profile.id отправителя
  const { data: fromProfile } = await supabaseAdmin
    .from('profiles').select('id').eq('user_id', from_user_id).single()

  if (!fromProfile)
    return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })

  // Сохраняем отзыв
  const { error: reviewError } = await supabaseAdmin.from('reviews').insert({
    match_id,
    from_id: fromProfile.id,
    to_id: to_user_id,
    rating,
    comment: comment ?? '',
  })

  if (reviewError)
    return NextResponse.json({ error: reviewError.message }, { status: 400 })

  // Пересчитываем рейтинг получателя
  const { data: allReviews } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('to_id', to_user_id)

  if (allReviews?.length) {
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
    await supabaseAdmin
      .from('profiles')
      .update({ rating: Math.round(avg * 100) / 100, rating_count: allReviews.length })
      .eq('id', to_user_id)
  }

  // Уведомляем получателя
  await supabaseAdmin.from('notifications').insert({
    user_id: to_user_id,
    type: 'review',
    title: 'Новый отзыв',
    body: `Тебе поставили ${rating} ⭐`,
    meta: { match_id },
  })

  // Помечаем матч как завершённый
  await supabaseAdmin.from('matches').update({ status: 'completed' }).eq('id', match_id)

  return NextResponse.json({ success: true })
}

// Получить отзывы пользователя
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const profileId = searchParams.get('profile_id')

  if (!profileId)
    return NextResponse.json({ error: 'Нужен profile_id' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*, from:profiles!reviews_from_id_fkey(name, avatar_url)')
    .eq('to_id', profileId)
    .order('created_at', { ascending: false })

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ reviews: data })
}