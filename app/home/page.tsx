'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'

// ── Утилиты ───────────────────────────────────────────────
function formatBadge(skill: string, variant: 'orange' | 'green' | 'gray') {
  return <span key={skill} className={`badge badge-${variant}`} style={{ fontSize: 12 }}>{skill}</span>
}

function getFormatLabel(format: string) {
  if (format === 'online')  return { icon: '💻', label: 'Онлайн' }
  if (format === 'offline') return { icon: '🤝', label: 'Офлайн' }
  return { icon: '⚡', label: 'Икемді' }
}

// ── Типы состояния матчмейкинга ───────────────────────────
type MatchState = 'idle' | 'searching' | 'found'

// ─────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Matchmaking states
  const [matchState, setMatchState] = useState<MatchState>('idle')
  const [searchSeconds, setSearchSeconds] = useState(0)
  const [partner, setPartner] = useState<Profile | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const searchRef = useRef<NodeJS.Timeout | null>(null)

  // Profile edit mini-state
  const [showTgEdit, setShowTgEdit] = useState(false)
  const [tgInput, setTgInput] = useState('')

  // ── Auth check ────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem('studyswap_user')
    const session = localStorage.getItem('studyswap_session')
    if (!raw || !session) {
      router.replace('/login')
      return
    }
    const user = JSON.parse(raw)
    setUserId(user.id)
    fetchProfile(user.id)
  }, [router])

  async function fetchProfile(uid: string) {
    try {
      const res = await fetch(`/api/profile?user_id=${uid}`)
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
        setTgInput(data.profile.telegram || '')
      }
    } catch {}
    setLoading(false)
  }

  // ── Logout ────────────────────────────────────────────
  function logout() {
    localStorage.removeItem('studyswap_session')
    localStorage.removeItem('studyswap_user')
    router.push('/')
  }

  // ── Matchmaking ───────────────────────────────────────
  async function startMatch() {
    if (!userId || matchState !== 'idle') return
    setMatchState('searching')
    setSearchSeconds(0)

    // Таймер секунд
    timerRef.current = setInterval(() => {
      setSearchSeconds(s => s + 1)
    }, 1000)

    try {
      const res = await fetch(`/api/match?user_id=${userId}`)
      const data = await res.json()

      // Минимальная задержка 3 сек для драматизма
      const elapsed = searchSeconds
      if (elapsed < 3) {
        await new Promise(r => setTimeout(r, (3 - elapsed) * 1000))
      }

      if (data.matches?.length > 0) {
        clearInterval(timerRef.current!)
        setPartner(data.matches[0])
        setMatchState('found')
      } else {
        clearInterval(timerRef.current!)
        setMatchState('idle')
        alert('Сәйкес серіктес табылмады. Кейінірек қайталап көріңіз.')
      }
    } catch {
      clearInterval(timerRef.current!)
      setMatchState('idle')
    }
  }

  function cancelMatch() {
    clearInterval(timerRef.current!)
    setMatchState('idle')
    setSearchSeconds(0)
  }

  function resetMatch() {
    setPartner(null)
    setMatchState('idle')
    setSearchSeconds(0)
  }

  // ── Save telegram ─────────────────────────────────────
  async function saveTelegram() {
    if (!userId) return
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, telegram: tgInput }),
    })
    setProfile(p => p ? { ...p, telegram: tgInput } : p)
    setShowTgEdit(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
          <p style={{ color: 'var(--ink-2)' }}>Жүктелуде...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!profile) return null

  const fmt = getFormatLabel(profile.format)

  return (
    <>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
        background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <a href="/" style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'var(--ink)', letterSpacing: '-0.04em', textDecoration: 'none',
        }}>Study<span style={{ color: 'var(--accent)' }}>Swap</span></a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 14px', background: 'var(--surface-2)',
            borderRadius: 999, border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
            }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
              {profile.name.split(' ')[0]}
            </span>
          </div>
          <button onClick={logout} style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 'var(--r)', padding: '7px 14px',
            fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer',
          }}>
            Шығу
          </button>
        </div>
      </nav>

      {/* ── Layout ── */}
      <div style={{
        paddingTop: 64, minHeight: '100vh',
        display: 'grid', gridTemplateColumns: '300px 1fr',
        maxWidth: 1200, margin: '0 auto', gap: 0,
      }}
        className="block md:grid">

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{
          borderRight: '1px solid var(--border)',
          padding: '32px 24px',
          position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto',
          background: 'var(--bg)',
        }}>
          {/* Avatar + Name */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent) 0%, #ff8c42 100%)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 700, margin: '0 auto 12px',
              boxShadow: '0 4px 20px var(--accent-glow)',
            }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4 }}>
              {profile.name}
            </h2>
            {profile.bio && (
              <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>{profile.bio}</p>
            )}
          </div>

          {/* Format badge */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginBottom: 24, padding: '8px 16px',
            background: 'var(--surface-2)', borderRadius: 999, border: '1px solid var(--border)',
          }}>
            <span>{fmt.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>{fmt.label}</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
              Үйрете аламын
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {profile.skills_teach.map(s => formatBadge(s, 'orange'))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
              Үйренгім келеді
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {profile.skills_learn.map(s => formatBadge(s, 'green'))}
            </div>
          </div>

          {/* Telegram */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
              Telegram
            </p>
            {showTgEdit ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', fontSize: 13 }}>@</span>
                  <input className="input" style={{ paddingLeft: 24, fontSize: 13, padding: '8px 8px 8px 24px' }}
                    value={tgInput} onChange={e => setTgInput(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={saveTelegram} style={{ padding: '8px 12px', fontSize: 12 }}>✓</button>
              </div>
            ) : (
              <button onClick={() => setShowTgEdit(true)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: '1px dashed var(--border-2)',
                borderRadius: 'var(--r)', padding: '8px 12px',
                cursor: 'pointer', width: '100%',
                color: profile.telegram ? 'var(--ink)' : 'var(--ink-3)',
                fontSize: 13, transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 16 }}>✈️</span>
                <span>{profile.telegram ? `@${profile.telegram}` : 'Telegram қосу'}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)' }}>✏</span>
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ padding: '40px 48px', background: 'var(--bg)', position: 'relative' }}>
          {/* BG decorations */}
          <div style={{ position: 'absolute', top: 40, right: -60, width: 400, height: 400, borderRadius: '50%', border: '1px solid var(--border)', opacity: 0.5, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(232,93,4,0.03)', pointerEvents: 'none' }} />

          {/* Welcome */}
          <div className="anim-fade-up" style={{ marginBottom: 48, position: 'relative' }}>
            <span className="section-label">Дашборд</span>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,44px)',
              marginTop: 8, marginBottom: 12,
            }}>
              Сәлем, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{profile.name.split(' ')[0]}</em>! 👋
            </h1>
            <p style={{ color: 'var(--ink-2)', fontSize: 16, maxWidth: 500 }}>
              Серіктес табу үшін матчмейкинг кнопкасын басыңыз.
              Алгоритм дағдыларыңызға сай студентті автоматты түрде іздейді.
            </p>
          </div>

          {/* Stats row */}
          <div className="anim-fade-up d-100" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48,
          }}>
            {[
              { icon: '📚', val: profile.skills_teach.length, label: 'Үйрете аламын' },
              { icon: '🎯', val: profile.skills_learn.length, label: 'Үйренгім келеді' },
              { icon: '⭐', val: profile.rating || '—', label: 'Рейтинг' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, lineHeight: 1, color: 'var(--accent)' }}>
                    {s.val}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── MATCHMAKING ZONE ── */}
          <div className="anim-fade-up d-200">

            {/* IDLE state */}
            {matchState === 'idle' && (
              <div className="card" style={{
                padding: '56px', textAlign: 'center',
                background: 'linear-gradient(135deg, var(--surface) 0%, rgba(232,93,4,0.03) 100%)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative circles */}
                <div style={{
                  position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                  borderRadius: '50%', border: '1px solid rgba(232,93,4,0.1)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute', bottom: -40, left: -40, width: 140, height: 140,
                  borderRadius: '50%', border: '1px solid var(--border)',
                  pointerEvents: 'none',
                }} />

                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'rgba(232,93,4,0.08)', border: '2px solid rgba(232,93,4,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, margin: '0 auto 24px',
                }}>🔍</div>

                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12,
                }}>
                  Серіктес табуға дайынсыз ба?
                </h2>
                <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6, maxWidth: 420, margin: '0 auto 32px' }}>
                  Алгоритм сіздің дағдыларыңызға сай{' '}
                  <strong style={{ color: 'var(--ink)' }}>ең тиімді серіктесті</strong>{' '}
                  бірнеше секунд ішінде табады.
                </p>

                {/* Skills preview */}
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: 24,
                  marginBottom: 36, flexWrap: 'wrap',
                }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
                      Ұсынасыз
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {profile.skills_teach.map(s => formatBadge(s, 'orange'))}
                    </div>
                  </div>
                  <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
                      Іздейсіз
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {profile.skills_learn.map(s => formatBadge(s, 'green'))}
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={startMatch}
                  style={{ fontSize: 16, padding: '16px 48px' }}>
                  Матчмейкинг бастау ⚡
                </button>

                {!profile.telegram && (
                  <p style={{ marginTop: 16, fontSize: 13, color: 'var(--accent)' }}>
                    ⚠ Telegram никнеймін қосыңыз — серіктесіңіз сізбен байланыса алмайды
                  </p>
                )}
              </div>
            )}

            {/* SEARCHING state */}
            {matchState === 'searching' && (
              <div className="card" style={{ padding: '56px', textAlign: 'center' }}>
                {/* Pulsing rings */}
                <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 32px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '50%', border: '2px solid var(--accent)',
                      animation: `pulse-out 2s ease-out ${i * 0.6}s infinite`,
                      opacity: 0,
                    }} />
                  ))}
                  <div style={{
                    width: 120, height: 120, borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 48, boxShadow: '0 8px 32px var(--accent-glow)',
                  }}>🔍</div>
                </div>

                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>
                  Іздеуде...
                </h2>
                <p style={{ color: 'var(--ink-2)', fontSize: 15, marginBottom: 8 }}>
                  Сізге сай серіктес іздеп жатырмыз
                </p>
                <p style={{
                  fontSize: 36, fontFamily: 'var(--font-display)',
                  fontWeight: 700, color: 'var(--accent)', marginBottom: 32,
                }}>
                  {String(Math.floor(searchSeconds / 60)).padStart(2, '0')}:{String(searchSeconds % 60).padStart(2, '0')}
                </p>

                {/* Bouncing dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>

                <button className="btn btn-outline" onClick={cancelMatch} style={{ fontSize: 14 }}>
                  Тоқтату
                </button>
              </div>
            )}

            {/* FOUND state */}
            {matchState === 'found' && partner && (
              <div style={{ animation: 'scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                {/* Celebration header */}
                <div className="card" style={{
                  padding: '32px', textAlign: 'center', marginBottom: 20,
                  background: 'linear-gradient(135deg, var(--accent) 0%, #ff8c42 100%)',
                  border: 'none',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 8, animation: 'celebrate 0.6s ease-out both' }}>
                    🎉
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: 28,
                    color: '#fff', marginBottom: 4,
                  }}>
                    Серіктес табылды!
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>
                    Сізге сай студент табылды — байланысыңыз!
                  </p>
                </div>

                {/* Partner card */}
                <div className="card" style={{ padding: '36px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: -30, right: -30, width: 150, height: 150,
                    borderRadius: '50%', background: 'rgba(232,93,4,0.05)', pointerEvents: 'none',
                  }} />

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #1a6b4a 0%, #2d9b6f 100%)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, fontWeight: 700,
                      boxShadow: '0 4px 16px rgba(26,107,74,0.3)',
                    }}>
                      {partner.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 4 }}>
                        {partner.name}
                      </h3>
                      {partner.bio && (
                        <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{partner.bio}</p>
                      )}
                    </div>
                    <div style={{
                      padding: '6px 14px', borderRadius: 999,
                      background: 'rgba(26,107,74,0.1)', border: '1px solid rgba(26,107,74,0.2)',
                      fontSize: 12, fontWeight: 600, color: 'var(--green)',
                      whiteSpace: 'nowrap',
                    }}>
                      {getFormatLabel(partner.format).icon} {getFormatLabel(partner.format).label}
                    </div>
                  </div>

                  {/* Skills exchange visual */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16,
                    alignItems: 'center', marginBottom: 28,
                    padding: '24px', background: 'var(--surface-2)', borderRadius: 'var(--r)',
                  }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
                        Ол үйретеді
                      </p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {partner.skills_teach.map(s => formatBadge(s, 'orange'))}
                      </div>
                    </div>

                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--accent)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, flexShrink: 0,
                      boxShadow: '0 4px 12px var(--accent-glow)',
                    }}>⇄</div>

                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>
                        Ол үйренгісі келеді
                      </p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {partner.skills_learn.map(s => formatBadge(s, 'green'))}
                      </div>
                    </div>
                  </div>

                  {/* Telegram CTA */}
                  <div style={{
                    padding: '20px 24px',
                    background: 'rgba(232,93,4,0.06)',
                    border: '1px solid rgba(232,93,4,0.15)',
                    borderRadius: 'var(--r)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 28 }}>✈️</span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>Telegram арқылы байланысыңыз</p>
                        <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                          Кездесу уақыты мен форматын талқылаңыз
                        </p>
                      </div>
                    </div>
                    {partner.telegram ? (
                      <a
                        href={`https://t.me/${partner.telegram}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ fontSize: 15, padding: '12px 28px' }}
                      >
                        @{partner.telegram} →
                      </a>
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                        Telegram белгілемеген
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button className="btn btn-outline" onClick={resetMatch} style={{ flex: 1, justifyContent: 'center' }}>
                      Жаңа серіктес іздеу
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-out {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-12px); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes celebrate {
          0%   { transform: scale(0) rotate(-20deg); }
          60%  { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @media (max-width: 768px) {
          aside { display: none; }
        }
      `}</style>
    </>
  )
}