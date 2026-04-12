// app/api/contact/route.ts
// ─────────────────────────────────────────────────────
// POST /api/contact
// Сохраняет обращение в базу + отправляет письма через Resend:
//   1. Тебе — о новом сообщении
//   2. Пользователю — подтверждение получения
// ─────────────────────────────────────────────────────
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import type { ContactBody } from '@/lib/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body: ContactBody = await req.json()
  const { name, email, message } = body

  if (!name || !email || !message)
    return NextResponse.json({ error: 'Заполни все поля' }, { status: 400 })

  // ── Сохраняем в базу ───────────────────────────────
  await supabaseAdmin.from('contacts').insert({ name, email, message })

  // ── Письмо тебе ────────────────────────────────────
  await resend.emails.send({
    from: 'StudySwap <onboarding@resend.dev>',
    to: process.env.CONTACT_EMAIL!,
    subject: `Новое сообщение от ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#e85d04">Новое обращение — StudySwap</h2>
        <p><b>Имя:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Сообщение:</b></p>
        <blockquote style="background:#f5f5f5;padding:12px 16px;border-left:3px solid #e85d04;border-radius:4px">
          ${message}
        </blockquote>
      </div>
    `,
  })

  // ── Письмо пользователю ────────────────────────────
  await resend.emails.send({
    from: 'StudySwap <onboarding@resend.dev>',
    to: email,
    subject: 'Мы получили твоё сообщение',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#e85d04">Привет, ${name}!</h2>
        <p>Мы получили твоё сообщение и ответим в течение 24 часов.</p>
        <p style="color:#888">— Команда StudySwap</p>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}