'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Format } from '@/lib/types'

const SUGGESTED_SUBJECTS = [
  'Математика', 'Агылшын тілі', 'Python', 'Дизайн',
  'Физика', 'Маркетинг', 'Тарих', 'Биология',
  'Химия', 'JavaScript', 'Орыс тілі', 'Экономика',
]

const FORMAT_OPTIONS: { value: Format; label: string; icon: string; desc: string }[] = [
  { value: 'online',  label: 'Онлайн',           icon: '\u{1F4BB}', desc: 'Тек онлайн сабак' },
  { value: 'offline', label: 'Офлайн',            icon: '\u{1F91D}', desc: 'Тек офлайн кездесу' },
  { value: 'both',    label: 'Екеуі де жарайды',  icon: '\u26A1',    desc: 'Икемді формат' },
]

type Step = 1 | 2 | 3

function SkillInput({
  label, sublabel, variant, skills, onChange,
}: {
  label: string; sublabel: string; variant: 'orange' | 'green'
  skills: string[]; onChange: (s: string[]) => void
}) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const suggestions = SUGGESTED_SUBJECTS.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s)
  )

  function add(skill: string) {
    const t = skill.trim()
    if (!t || skills.includes(t)) return
    onChange([...skills, t])
    setInput('')
    ref.current?.focus()
  }

  function remove(skill: string) { onChange(skills.filter(s => s !== skill)) }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); if (input.trim()) add(input) }
    if (e.key === 'Backspace' && !input && skills.length > 0) remove(skills[skills.length - 1])
  }

  const accent = variant === 'orange' ? 'var(--accent)' : 'var(--green)'

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 3 }}>{label}</label>
      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 9 }}>{sublabel}</p>

      <div onClick={() => ref.current?.focus()} style={{
        minHeight: 48, padding: '7px 10px',
        border: `1.5px solid ${focused ? accent : 'var(--border)'}`,
        borderRadius: 'var(--r)', background: 'var(--surface)', cursor: 'text',
        display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center',
        transition: 'border-color 0.2s',
        boxShadow: focused ? `0 0 0 3px ${variant === 'orange' ? 'var(--accent-glow)' : 'rgba(26,107,74,0.12)'}` : 'none',
      }}>
        {skills.map(s => (
          <span key={s} className={`badge badge-${variant}`}
            style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 8px 5px 11px', fontSize: 12,
              border: `1px solid ${accent}` }}>
            {s}
            <button type="button" onClick={() => remove(s)}
              style={{ marginLeft: 5, background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, fontSize: 11, color: 'inherit', opacity: 0.7, lineHeight: 1 }}>x</button>
          </span>
        ))}
        <input ref={ref} value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTimeout(() => {}, 150) }}
          onKeyDown={handleKey}
          placeholder={skills.length === 0 ? 'Жазыныз немесе торменнен тандрт...' : ''}
          style={{ border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, color: 'var(--ink)', minWidth: 120, flex: 1, fontFamily: 'var(--font-body)' }} />
      </div>
      <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>
        Enter басып косыныз немесе тормен пілдерден тандыныз
      </p>

      {focused && input && suggestions.length > 0 && (
        <div style={{ marginTop: 4, background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', position: 'relative', zIndex: 20 }}>
          {suggestions.slice(0, 5).map(s => (
            <button key={s} type="button" onMouseDown={() => add(s)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px',
                background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                cursor: 'pointer', fontSize: 13, color: 'var(--ink)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span style={{ color: accent, marginRight: 7, fontWeight: 700 }}>+</span>{s}
            </button>
          ))}
        </div>
      )}

      {!input && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
          {SUGGESTED_SUBJECTS.filter(s => !skills.includes(s)).map(s => (
            <button key={s} type="button" onClick={() => add(s)}
              style={{ padding: '4px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                cursor: 'pointer', color: 'var(--ink-2)', transition: 'all 0.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent; (e.currentTarget as HTMLButtonElement).style.color = accent }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-2)' }}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', telegram: '', bio: '',
    skills_teach: [] as string[], skills_learn: [] as string[],
    format: 'both' as Format,
  })

  useEffect(() => {
    const s = localStorage.getItem('studyswap_session')
    if (s) router.replace('/home')
  }, [router])

  function next() {
    setError('')
    if (step === 1) {
      if (!form.name || !form.email || !form.password) { setError('Барлык орістерді толтырынъыз'); return }
      if (form.password.length < 6) { setError('Пароль кемінде 6 символ болуы керек'); return }
    }
    if (step === 2) {
      if (!form.skills_teach.length || !form.skills_learn.length) { setError('Кемінде бір данды косыныз'); return }
    }
    setStep((step + 1) as Step)
  }

  async function submit() {
    setError('')
    if (!form.telegram) { setError('Telegram никнейміне кіріп жазынъыз'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          bio: form.bio,
          telegram: form.telegram,
          skills_teach: form.skills_teach,
          skills_learn: form.skills_learn,
          format: form.format,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Qate payda boldy')
      router.push('/login?registered=true')
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
        background: 'rgba(250,247,242,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'var(--ink)', letterSpacing: '-0.04em', textDecoration: 'none' }}>
          Study<span style={{ color: 'var(--accent)' }}>Swap</span>
        </a>
        <a href="/login" className="btn btn-outline" style={{ fontSize: 14, padding: '9px 20px' }}>Кіру</a>
      </nav>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500,
          borderRadius: '50%', border: '1px solid var(--border)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: 0, left: -60, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(232,93,4,0.04)' }} />
      </div>

      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '96px 24px 48px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 540 }}>

          <div className="anim-fade-up" style={{ marginBottom: 22 }}>
            <span className="section-label">Жана аккаунт</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,40px)', marginTop: 7, marginBottom: 5 }}>
              {step === 1 && <>Озіньіз туралы <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>айтынъыз</em></>}
              {step === 2 && <>Данбыларынъызды <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>косынъыз</em></>}
              {step === 3 && <>Сонъгы <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>мәліметтер</em></>}
            </h1>
            <p style={{ color: 'var(--ink-2)', fontSize: 13 }}>{step} / 3 кадам</p>
          </div>

          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: 22, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / 3) * 100}%`, background: 'var(--accent)',
              borderRadius: 2, transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>

          <div className="card anim-fade-up d-100" style={{ padding: '30px' }}>
            {error && (
              <div style={{ padding: '11px 14px', marginBottom: 16,
                background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)',
                borderRadius: 'var(--r)', fontSize: 13, color: 'var(--accent)',
                display: 'flex', alignItems: 'center', gap: 7 }}>
                ! {error}
              </div>
            )}

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {[
                  { label: 'Есімньіз', type: 'text', ph: 'Алибек Дуйсенов', key: 'name' },
                  { label: 'Email', type: 'email', ph: 'alibek@gmail.com', key: 'email' },
                  { label: 'Купия соз', type: 'password', ph: 'Кемінде 6 символ', key: 'password' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>
                      {f.label}
                    </label>
                    <input className="input" type={f.type} placeholder={f.ph}
                      value={(form as any)[f.key] || ''}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>
                    Оз туралы <span style={{ color: 'var(--ink-3)' }}>(міндетті емес)</span>
                  </label>
                  <textarea className="input" placeholder="2 курс студенті, МУИТ..." rows={2}
                    style={{ resize: 'none' }} value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>
                <button className="btn btn-primary" onClick={next}
                  style={{ marginTop: 5, padding: '13px', justifyContent: 'center', fontSize: 15 }}>
                  Келесі
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <SkillInput label="Мен уйрете аламын" sublabel="Кандай пандерде / тацырыптарда жаксысыз?"
                  variant="orange" skills={form.skills_teach}
                  onChange={s => setForm({ ...form, skills_teach: s })} />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 22 }}>
                  <SkillInput label="Мен уйренгім келеді" sublabel="Кандай дагдыларды игергінъіз келеді?"
                    variant="green" skills={form.skills_learn}
                    onChange={s => setForm({ ...form, skills_learn: s })} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>Артка</button>
                  <button className="btn btn-primary" onClick={next} style={{ flex: 2, justifyContent: 'center', padding: '13px' }}>Келесі</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 5 }}>
                    Telegram никнейм <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--ink-3)', fontSize: 14, pointerEvents: 'none' }}>@</span>
                    <input className="input" placeholder="username" style={{ paddingLeft: 26 }}
                      value={form.telegram.replace('@', '')}
                      onChange={e => setForm({ ...form, telegram: e.target.value.replace('@', '') })} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>
                    Серіктесіньіз осы аркылы байланысады
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 9 }}>Кездесу форматы</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {FORMAT_OPTIONS.map(opt => {
                      const sel = form.format === opt.value
                      return (
                        <button key={opt.value} type="button" onClick={() => setForm({ ...form, format: opt.value })}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                            borderRadius: 'var(--r)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                            border: sel ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                            background: sel ? 'rgba(232,93,4,0.06)' : 'var(--surface)' }}>
                          <span style={{ fontSize: 20 }}>{opt.icon}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{opt.label}</p>
                            <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>{opt.desc}</p>
                          </div>
                          {sel && <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 9, fontWeight: 700 }}>v</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ padding: '13px 15px', background: 'var(--surface-2)',
                  borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 7,
                    textTransform: 'uppercase', letterSpacing: '0.08em' }}>Жиынтык</p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {form.skills_teach.map(s => (
                      <span key={s} className="badge badge-orange" style={{ fontSize: 11 }}>+ {s}</span>
                    ))}
                    {form.skills_learn.map(s => (
                      <span key={s} className="badge badge-green" style={{ fontSize: 11 }}>{s}?</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}>Артка</button>
                  <button className="btn btn-primary" onClick={submit} disabled={loading}
                    style={{ flex: 2, justifyContent: 'center', padding: '13px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Тіркелуде...' : 'Аккаунт куру'}
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