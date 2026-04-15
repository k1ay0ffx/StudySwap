'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Format } from '@/lib/types'

const PRESET_SKILLS = [
  { cat: '📐 Ғылым', items: ['Математика', 'Физика', 'Химия', 'Статистика', 'Алгебра'] },
  { cat: '💻 IT', items: ['Python', 'JavaScript', 'React', 'SQL', 'Java', 'C++', 'Дизайн', 'UI/UX'] },
  { cat: '🌍 Тілдер', items: ['Ағылшын тілі', 'Орыс тілі', 'Қазақ тілі', 'Deutsch', 'Français'] },
  { cat: '📊 Бизнес', items: ['Маркетинг', 'Экономика', 'Бухгалтерия', 'Менеджмент', 'SMM'] },
  { cat: '🎨 Шығармашылық', items: ['Фотография', 'Видеомонтаж', 'Иллюстрация', 'Музыка'] },
  { cat: '📚 Гуманитарлық', items: ['Биология', 'Тарих', 'Психология', 'Социология'] },
]

const FORMAT_OPTIONS: { value: Format; label: string; icon: string; desc: string }[] = [
  { value: 'online',  label: 'Онлайн',        icon: '💻', desc: 'Тек онлайн кездесу' },
  { value: 'offline', label: 'Офлайн',         icon: '🤝', desc: 'Тек өмірде кездесу' },
  { value: 'both',    label: 'Екі таңдауда',   icon: '⚡', desc: 'Ыңғайлы формат' },
]

type Step = 1 | 2 | 3

// ── Компонент выбора навыков ─────────────────────────────
function SkillPicker({
  label, sublabel, variant, skills, onChange,
}: {
  label: string; sublabel: string
  variant: 'orange' | 'green'
  skills: string[]; onChange: (s: string[]) => void
}) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const accent = variant === 'orange' ? 'var(--accent)' : 'var(--green)'
  const accentGlow = variant === 'orange' ? 'var(--accent-glow)' : 'rgba(26,107,74,0.12)'

  // Поиск по всем категориям
  const searchResults = input.trim()
    ? PRESET_SKILLS.flatMap(c => c.items).filter(
        s => s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s)
      )
    : []

  // ✅ FIX: добавляет любой текст — и из PRESET_SKILLS, и произвольный
  function add(skill: string) {
    const t = skill.trim()
    if (!t || skills.includes(t) || skills.length >= 8) return
    onChange([...skills, t])
    setInput('')
    inputRef.current?.focus()
  }

  function remove(skill: string) { onChange(skills.filter(s => s !== skill)) }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); if (input.trim()) add(input) }
    if (e.key === 'Backspace' && !input && skills.length > 0) remove(skills[skills.length - 1])
  }

  // ✅ FIX: при потере фокуса автоматически добавляем то, что напечатано
  function handleBlur() {
    if (input.trim()) {
      add(input)
    }
    setTimeout(() => setFocused(false), 150)
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 2 }}>{label}</label>
        <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>{sublabel}</p>
      </div>

      {/* Выбранные навыки + поле ввода */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          minHeight: 52, padding: '8px 12px',
          border: `1.5px solid ${focused ? accent : 'var(--border)'}`,
          borderRadius: 'var(--r)', background: 'var(--surface)', cursor: 'text',
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          transition: 'border-color .2s, box-shadow .2s',
          boxShadow: focused ? `0 0 0 3px ${accentGlow}` : 'none',
        }}
      >
        {skills.map(s => (
          <span key={s} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px 4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            background: variant === 'orange' ? 'rgba(232,93,4,0.1)' : 'rgba(26,107,74,0.1)',
            color: accent, border: `1px solid ${variant === 'orange' ? 'rgba(232,93,4,0.25)' : 'rgba(26,107,74,0.25)'}`,
          }}>
            {s}
            <button type="button" onClick={e => { e.stopPropagation(); remove(s) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent,
                opacity: .6, fontSize: 14, lineHeight: 1, padding: '0 2px', display: 'flex', alignItems: 'center' }}>
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}  // ✅ FIX: авто-добавление при blur
          onKeyDown={handleKey}
          placeholder={skills.length === 0 ? 'Дағдынылыңыз жазып, Enter немесе Space пернесін басыңыз.' : skills.length < 8 ? 'Тағы...' : ''}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, color: 'var(--ink)', minWidth: 140, flex: 1,
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {/* Подсказка */}
      <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
        Өзіңіз қосу үшін Enter пернесін басыңыз · Шек. 8 дағды · Кез келген дағдыны жазуға болады
      </p>

      {/* Выпадающие результаты поиска */}
      {focused && input.trim() && searchResults.length > 0 && (
        <div style={{
          marginTop: 4, background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', zIndex: 30,
          position: 'relative',
        }}>
          {searchResults.slice(0, 5).map(s => (
            <button key={s} type="button" onMouseDown={() => add(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                padding: '10px 14px', background: 'none', border: 'none',
                borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, color: 'var(--ink)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: accent,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0 }}>+</span>
              {s}
            </button>
          ))}
          {/* ✅ FIX: показываем кнопку добавить своё, если нет совпадений или хочет именно своё */}
          {input.trim() && !PRESET_SKILLS.flatMap(c => c.items).some(s => s.toLowerCase() === input.trim().toLowerCase()) && (
            <button type="button" onMouseDown={() => add(input)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                padding: '10px 14px', background: 'rgba(232,93,4,0.04)', border: 'none',
                cursor: 'pointer', fontSize: 13, color: accent, fontWeight: 600,
              }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: accent,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0 }}>+</span>
               {/* Қосу«{input.trim()} */}
            </button>
          )}
        </div>
      )}

      {/* Если ввёл что-то, но нет совпадений из пресетов — подсказка добавить */}
      {focused && input.trim() && searchResults.length === 0 && (
        <div style={{
          marginTop: 4, background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r)', overflow: 'hidden', position: 'relative',
        }}>
          <button type="button" onMouseDown={() => add(input)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
              padding: '10px 14px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, color: accent, fontWeight: 600,
            }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: accent,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0 }}>+</span>
            {/* {input.trim()}»  */}
          </button>
        </div>
      )}

      {/* Категории с готовыми навыками */}
      {!input.trim() && (
        <div style={{ marginTop: 14 }}>
          {/* Табы категорий */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            <button type="button"
              onClick={() => setActiveCategory(activeCategory ? null : PRESET_SKILLS[0].cat)}
              style={{
                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', transition: 'all .12s',
                background: activeCategory ? 'var(--surface-2)' : accent,
                border: `1px solid ${activeCategory ? 'var(--border)' : accent}`,
                color: activeCategory ? 'var(--ink-2)' : '#fff',
              }}>
              {activeCategory ? '▴ Жасыру' : '▾Барлық пәндерді көрсету'}
            </button>
          </div>

          {!activeCategory && (
            // Быстрые чипы — популярные без категорий
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {PRESET_SKILLS.flatMap(c => c.items).slice(0, 12).filter(s => !skills.includes(s)).map(s => (
                <button key={s} type="button" onClick={() => add(s)}
                  style={{
                    padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    cursor: 'pointer', color: 'var(--ink-2)', transition: 'all .12s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = accent
                    ;(e.currentTarget as HTMLButtonElement).style.color = accent
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-2)'
                  }}>
                  + {s}
                </button>
              ))}
            </div>
          )}

          {activeCategory && (
            <div>
              {/* Табы категорий */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {PRESET_SKILLS.map(c => (
                  <button key={c.cat} type="button" onClick={() => setActiveCategory(c.cat)}
                    style={{
                      padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500,
                      cursor: 'pointer', transition: 'all .12s',
                      background: activeCategory === c.cat ? accent : 'var(--surface-2)',
                      border: `1px solid ${activeCategory === c.cat ? accent : 'var(--border)'}`,
                      color: activeCategory === c.cat ? '#fff' : 'var(--ink-2)',
                    }}>
                    {c.cat}
                  </button>
                ))}
              </div>
              {/* Навыки выбранной категории */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {PRESET_SKILLS.find(c => c.cat === activeCategory)?.items
                  .filter(s => !skills.includes(s)).map(s => (
                    <button key={s} type="button" onClick={() => add(s)}
                      style={{
                        padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                        background: 'var(--surface)', border: `1px solid var(--border-2)`,
                        cursor: 'pointer', color: 'var(--ink)', transition: 'all .12s',
                      }}
                      onMouseEnter={e => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = variant === 'orange' ? 'rgba(232,93,4,0.08)' : 'rgba(26,107,74,0.08)'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = accent
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-2)'
                      }}>
                      + {s}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Страница регистрации ─────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', telegram: '', bio: '',
    skills_teach: [] as string[],
    skills_learn: [] as string[],
    format: 'both' as Format,
  })

  useEffect(() => {
    const s = localStorage.getItem('studyswap_session')
    if (s) router.replace('/home')
  }, [router])

  function next() {
    setError('')
    if (step === 1) {
      if (!form.name || !form.email || !form.password) { setError('Барлық өрістерді толтырыңыз'); return }
      if (form.password.length < 6) { setError('Құпия сөз кемінде 6 таңба болу қажет'); return }
    }
    if (step === 2) {
      // ✅ FIX: Валидация без привязки к PRESET_SKILLS — любой непустой навык принимается
      if (!form.skills_teach.length || !form.skills_learn.length) {
        setError('Әр жерге кем дегенде бір дағды қосыңыз'); return
      }
    }
    setStep((step + 1) as Step)
  }

  async function submit() {
    setError('')
    if (!form.telegram) { setError('Telegram атыңызды көрсетіңіз'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          telegram: form.telegram.startsWith('@') ? form.telegram : `@${form.telegram}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Тіркеу қатесі')
      router.push('/login?registered=true')
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = ['', 'Өзіңіз туралы', 'Дағды', 'Мәліметтер']

  return (
    <>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
        background: 'rgba(250,247,242,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'var(--ink)', letterSpacing: '-0.04em', textDecoration: 'none' }}>
          Study<span style={{ color: 'var(--accent)' }}>Swap</span>
        </a>
        <a href="/login" className="btn btn-outline" style={{ fontSize: 14, padding: '9px 20px' }}>Войти</a>
      </nav>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500,
          borderRadius: '50%', border: '1px solid var(--border)', opacity: .5 }} />
        <div style={{ position: 'absolute', bottom: 0, left: -60, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(232,93,4,.04)' }} />
      </div>

      <main style={{
        minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '96px 24px 64px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: step === 2 ? 620 : 500 }}>

          {/* Header */}
          <div className="anim-fade-up" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {([1,2,3] as Step[]).map(s => (
                <div key={s} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: s <= step ? 'var(--accent)' : 'var(--border)',
                  transition: 'background .4s',
                }} />
              ))}
            </div>
            <span className="section-label"> {step} |  3 — {stepTitles[step]}</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,5vw,38px)', marginTop: 6, marginBottom: 0 }}>
              {step === 1 && <>Аккаунт <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>ашу</em></>}
              {step === 2 && <>Сіздің <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>дағдыларыңыз</em></>}
              {step === 3 && <>Соңғы <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>мәліметтер</em></>}
            </h1>
          </div>

          {/* Card */}
          <div className="card anim-fade-up d-100" style={{ padding: 32 }}>
            {error && (
              <div style={{
                padding: '11px 14px', marginBottom: 16, borderRadius: 'var(--r)',
                background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)',
                fontSize: 13, color: 'var(--accent)',
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Шаг 1: Основные данные */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Есіміңіз', type: 'text', ph: 'Алибек Дуйсенов', key: 'name' },
                  { label: 'Email', type: 'email', ph: 'alibek@gmail.com', key: 'email' },
                  { label: 'Құпия сөз', type: 'password', ph: 'Кемінде 6 символ', key: 'password' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>
                      {f.label}
                    </label>
                    <input 
                      className="input" 
                      type={f.type} 
                      placeholder={f.ph}
                      // Используем keyof typeof form для безопасного доступа к ключам
                      value={form[f.key as keyof typeof form] as string || ''}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && next()} 
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>
                    Өзіңіз туралы<span style={{ color: 'var(--ink-3)' }}></span>
                  </label>
                  <textarea className="input" placeholder="КБТУ, 2 курс, мамандығыңыз, хобби..." rows={2}
                    style={{ resize: 'none' }} value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>
                <button className="btn btn-primary" onClick={next}
                  style={{ marginTop: 6, padding: '13px', justifyContent: 'center', fontSize: 15 }}>
                  Келесі →
                </button>
              </div>
            )}

            {/* Шаг 2: Навыки */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <SkillPicker
                  label="🟠 Мен үйрете аламын"
                  sublabel="Сіз не білесіз және басқа студенттерге үйретуге дайынсыз ба?"
                  variant="orange" skills={form.skills_teach}
                  onChange={s => setForm({ ...form, skills_teach: s })}
                />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 26 }}>
                  <SkillPicker
                    label="🟢 Мен үйренгім келеді"
                    sublabel="Сіз серіктесіңізден қандай білім алғыңыз келеді?"
                    variant="green" skills={form.skills_learn}
                    onChange={s => setForm({ ...form, skills_learn: s })}
                  />
                </div>

                {/* Превью совпадения */}
                {form.skills_teach.length > 0 && form.skills_learn.length > 0 && (
                  <div style={{
                    padding: '14px 16px', borderRadius: 'var(--r)',
                    background: 'rgba(232,93,4,0.05)', border: '1px solid rgba(232,93,4,0.15)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 20 }}>✓</span>
                    <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                      Тамаша! Алгоритм {' '}
                      <strong style={{ color: 'var(--green)' }}>{form.skills_learn[0]}</strong>{' '}
                      үйрете алатын және {' '}
                      <strong style={{ color: 'var(--accent)' }}>{form.skills_teach[0]}</strong>{' '}
                       үйренгісі келетін студенттерді іздейді
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>← Артқа</button>
                  <button className="btn btn-primary" onClick={next} style={{ flex: 2, justifyContent: 'center', padding: '13px' }}>Келесі →</button>
                </div>
              </div>
            )}

            {/* Шаг 3: Telegram + формат */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                    Telegram никнейм <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--ink-3)', fontSize: 15, pointerEvents: 'none' }}>@</span>
                    <input className="input" placeholder="username" style={{ paddingLeft: 28 }}
                      value={form.telegram.replace('@', '')}
                      onChange={e => setForm({ ...form, telegram: e.target.value.replace('@', '') })}
                      onKeyDown={e => e.key === 'Enter' && submit()} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                    Матчмейкингтан кейін серіктесіңіз сізге Telegram арқылы хабарлама жазады
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Кездесі форматы
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {FORMAT_OPTIONS.map(opt => {
                      const sel = form.format === opt.value
                      return (
                        <button key={opt.value} type="button"
                          onClick={() => setForm({ ...form, format: opt.value })}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                            borderRadius: 'var(--r)', textAlign: 'left', cursor: 'pointer',
                            border: sel ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                            background: sel ? 'rgba(232,93,4,0.06)' : 'var(--surface)',
                            transition: 'all .15s',
                          }}>
                          <span style={{ fontSize: 22 }}>{opt.icon}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{opt.label}</p>
                            <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>{opt.desc}</p>
                          </div>
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            border: sel ? 'none' : '2px solid var(--border-2)',
                            background: sel ? 'var(--accent)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0,
                          }}>
                            {sel && '✓'}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Итоговый превью */}
                <div style={{
                  padding: '16px', background: 'var(--surface-2)',
                  borderRadius: 'var(--r)', border: '1px solid var(--border)',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--ink-3)', marginBottom: 10 }}>
                    Сіздің профиліңіз
                  </p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 5 }}>Үйретемін:</p>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {form.skills_teach.map(s => (
                          <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999,
                            background: 'rgba(232,93,4,0.1)', color: 'var(--accent)', fontWeight: 500 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 5 }}>Үйренемін:</p>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {form.skills_learn.map(s => (
                          <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999,
                            background: 'rgba(26,107,74,0.1)', color: 'var(--green)', fontWeight: 500 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setStep(2)}
                    style={{ flex: 1, justifyContent: 'center' }}>← Артқа</button>
                  <button className="btn btn-primary" onClick={submit} disabled={loading}
                    style={{ flex: 2, justifyContent: 'center', padding: '13px', opacity: loading ? .7 : 1 }}>
                    {loading ? 'Аккаунт құрылуда...' : 'Тіркелу 🚀'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-3)' }}>
            Аккаунт бар ма?{' '}
            <a href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Кіру</a>
          </p>
        </div>
      </main>
    </>
  )
}