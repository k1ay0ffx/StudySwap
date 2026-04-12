'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Если уже залогинен — на главную
    const session = localStorage.getItem('studyswap_session')
    if (session) router.replace('/home')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Қате пайда болды')

      // Сохраняем сессию
      localStorage.setItem('studyswap_session', JSON.stringify(data.session))
      localStorage.setItem('studyswap_user', JSON.stringify(data.user))

      router.push('/home')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
        background: 'rgba(250,247,242,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <a href="/" style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'var(--ink)', letterSpacing: '-0.04em', textDecoration: 'none',
        }}>Study<span style={{ color: 'var(--accent)' }}>Swap</span></a>
        <a href="/register" className="btn btn-primary" style={{ fontSize: 14, padding: '9px 20px' }}>
          Тіркелу →
        </a>
      </nav>

      {/* Background decorations */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: -100, right: -100, width: 500, height: 500,
          borderRadius: '50%', border: '1px solid var(--border)', opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80, width: 350, height: 350,
          borderRadius: '50%', background: 'rgba(232,93,4,0.04)',
        }} />
      </div>

      {/* Main */}
      <main style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '96px 24px 48px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Just registered banner */}
          {justRegistered && (
            <div className="anim-fade-up" style={{
              padding: '14px 20px', marginBottom: 24,
              background: 'rgba(26,107,74,0.1)', border: '1px solid rgba(26,107,74,0.2)',
              borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>🎉</span>
              <p style={{ fontSize: 14, color: 'var(--green)', fontWeight: 500 }}>
                Тіркелу сәтті өтті! Енді кіруге болады.
              </p>
            </div>
          )}

          {/* Header */}
          <div className="anim-fade-up" style={{ marginBottom: 32 }}>
            <span className="section-label">Платформаға кіру</span>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,48px)',
              marginTop: 8, marginBottom: 8,
            }}>
              Қайта <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>келдіңіз</em>
            </h1>
            <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>
              Аккаунтыңызға кіріп, оқуды жалғастырыңыз
            </p>
          </div>

          {/* Card */}
          <div className="card anim-fade-up d-100" style={{ padding: '36px' }}>
            {error && (
              <div style={{
                padding: '12px 16px', marginBottom: 20,
                background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)',
                borderRadius: 'var(--r)', fontSize: 14, color: 'var(--accent)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  className="input" type="email" placeholder="alibek@gmail.com" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>
                  Құпия сөз
                </label>
                <input
                  className="input" type="password" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <button
                type="submit" className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: 8, padding: '14px', justifyContent: 'center', fontSize: 15, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                    Кіру...
                  </span>
                ) : 'Кіру →'}
              </button>
            </form>

            <div style={{
              marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>
                Аккаунт жоқ па?{' '}
                <a href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  Тіркелу →
                </a>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="anim-fade-up d-200" style={{
            marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            {['Тегін', 'Қауіпсіз', '100+ студент'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}