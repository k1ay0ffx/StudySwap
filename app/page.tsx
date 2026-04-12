'use client'
import { useState, useEffect, useRef } from 'react'

// ─── Данные ───────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Мәселе',        href: '#problem' },
  { label: 'Ол қалай жұмыс істейді',    href: '#how' },
  { label: 'Команда',         href: '#team' },
  { label: 'Контактілер',        href: '#contact' },
]

const STATS = [
  { value: '70%', label: 'Студенттер\nрепетиторларға барғысы келмейді' },
  { value: '3×',  label: 'басқа студеттермен оқу\nтиімді' },
  { value: '0₸',  label: 'StudySwap біліммен алмасуға\nтұрарлық жер' },
]

const STEPS = [
  { n: '01', title: 'Тіркелу', body: 'Бір минут ішінде аккаунт ашыңыз. Ешқандай төлем картасы қажет емес.' },
  { n: '02', title: 'Профильді толтыру', body: 'Нені үйрете алатыныңызды және нені үйренгіңіз келетінін көрсетіңіз.' },
  { n: '03', title: 'Серіктес табу', body: 'Алгоритм сізге дағдыларыңыз сәйкес келетін студентті табады.' },
  { n: '04', title: 'Үйрену және үйрету', body: 'Онлайн немесе офлайн сабақ өткізіңіз. Біліммен алмасыңыз.' },
]

const TEAM = [
  { emoji: '🎨', role: 'Frontend',   name: 'Нурсултан' },
  { emoji: '⚙️', role: 'Backend',    name: 'Нурсултан' },
  { emoji: '✏️', role: 'UI/UX',      name: 'Салтанат' },
  { emoji: '📢', role: 'Маркетинг',  name: 'Дамира' },
]

const EXCHANGES = [
  { from: 'Математика', to: 'Ағылшын тілі', a: '🧮', b: '🌍', nameA: 'Алибек', nameB: 'Айгерим' },
  { from: 'Python',     to: 'Дизайн',     a: '💻', b: '✏️', nameA: 'Данияр', nameB: 'Сабина'  },
  { from: 'Физика',     to: 'Маркетинг',  a: '⚛️', b: '📢', nameA: 'Арман',  nameB: 'Дина'    },
]

// ─── Хук: анимация при скролле ────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ─── Navbar ───────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav
      className="navbar"
      style={{ boxShadow: scrolled ? 'var(--shadow-sm)' : 'none', transition: 'box-shadow .3s' }}
    >
      <a href="#" className="logo">Study<span>Swap</span></a>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href}
            style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              color: 'var(--ink-2)', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-2)')}>
            {l.label}
          </a>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-3">
        <a href="/login"  className="btn btn-outline" style={{ padding: '9px 20px', fontSize: 14 }}>Войти</a>
        <a href="/register" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
          Бастау →
        </a>
      </div>

      {/* Mobile burger */}
      <button className="md:hidden" onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--ink)' }}>
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: 'var(--bg)', borderBottom: '1px solid var(--border)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--ink)' }}>
              {l.label}
            </a>
          ))}
          <a href="/register" className="btn btn-primary" style={{ textAlign: 'center' }}>Бастау →</a>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────
function Hero() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % EXCHANGES.length), 2800)
    return () => clearInterval(t)
  }, [])

  const ex = EXCHANGES[active]

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      paddingTop: 96, paddingBottom: 80, position: 'relative', overflow: 'hidden',
    }}>
      {/* Декоративные окружности */}
      <div style={{
        position: 'absolute', top: 80, right: -120, width: 480, height: 480,
        borderRadius: '50%', border: '1px solid var(--border)', opacity: .6, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 160, right: -40, width: 300, height: 300,
        borderRadius: '50%', border: '1px solid var(--border)', opacity: .5, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 60, left: -80, width: 320, height: 320,
        borderRadius: '50%', background: 'rgba(232,93,4,.04)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}
          className="block md:grid">

          {/* Левая колонка */}
          <div>
            <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
              <span className="pulse-dot" />
              <span className="section-label">Студеттерге арналған платформа</span>
            </div>

            <h1 className="anim-fade-up d-100" style={{ fontSize: 'clamp(42px, 6vw, 72px)', marginBottom: 24 }}>
              Өзгеге<br />
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>үйрете отырып</em><br />
              өзің үйрен
            </h1>

            <p className="anim-fade-up d-200" style={{
              fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.7,
              maxWidth: 420, marginBottom: 40,
            }}>
              StudySwap — студенттер бір-біріне білім үйрететін, 
              тегін және қолжетімді оқу платформасы.
            </p>

            <div className="anim-fade-up d-300" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/register" className="btn btn-primary" style={{ fontSize: 16 }}>
                Тіркелу →
              </a>
              <a href="#how" className="btn btn-outline" style={{ fontSize: 16 }}>
                Қалай жұмыс жасайды?
              </a>
            </div>

            <div className="anim-fade-up d-400" style={{ marginTop: 52, display: 'flex', gap: 32 }}>
              {['Тегін', 'Студеттерге арналған', 'Онлайн әлде оффлайн'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Правая колонка — анимированный обмен */}
          <div className="anim-fade-in d-300 hidden md:flex"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative' }}>

            {/* Карточка A */}
            <div className="anim-float card" style={{ padding: '24px 28px', width: '100%', maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{ex.a}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{ex.nameA}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>Студент</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-orange">үйретеді: {ex.from}</span>
                <span className="badge badge-gray">үйренгісі келеді: {ex.to}</span>
              </div>
            </div>

            {/* Стрелка обмена */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, flexShrink: 0,
              boxShadow: '0 4px 16px var(--accent-glow)',
              zIndex: 1,
            }}>⇄</div>

            {/* Карточка B */}
            <div className="card" style={{
              padding: '24px 28px', width: '100%', maxWidth: 300,
              marginLeft: 48,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{ex.b}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{ex.nameB}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>Студент</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-green">үйретеді: {ex.to}</span>
                <span className="badge badge-gray">үйренгісі келеді: {ex.from}</span>
              </div>
            </div>

            {/* Индикаторы */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {EXCHANGES.map((_, i) => (
                <div key={i} onClick={() => setActive(i)} style={{
                  width: i === active ? 22 : 6, height: 6, borderRadius: 3,
                  background: i === active ? 'var(--accent)' : 'var(--border-2)',
                  cursor: 'pointer', transition: 'all .3s',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Problem ──────────────────────────────────────────────
function Problem() {
  const { ref, visible } = useInView()

  return (
    <section id="problem" ref={ref} style={{
      background: 'var(--ink)', color: '#fff',
      padding: '100px 32px', overflow: 'hidden', position: 'relative',
    }}>
      {/* Декоративная линия */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(232,93,4,.5), transparent)',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 64 }}
          className={visible ? 'anim-fade-up' : ''} >
          <span className="section-label" style={{ color: 'var(--accent)' }}>Мәселе</span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)',
            color: '#fff', marginTop: 12, maxWidth: 560,
          }}>
            Репетитор бағасы <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>тым қымбат,</em> барлық студентке бірдей мүмкіндік жоқ
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}
          className="grid-cols-1 md:grid-cols-3">
          {STATS.map((s, i) => (
            <div key={s.value}
              className={visible ? `anim-fade-up d-${(i + 1) * 100}` : ''}
              style={{
                padding: '40px 36px',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,.08)' : 'none',
              }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 7vw, 80px)',
                fontWeight: 700, color: 'var(--accent)', lineHeight: 1,
                letterSpacing: '-0.04em', marginBottom: 16,
              }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, lineHeight: 1.6,
                whiteSpace: 'pre-line' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className={visible ? 'anim-fade-up d-400' : ''}
          style={{
            marginTop: 60, padding: '32px 36px',
            border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-lg)',
            background: 'rgba(255,255,255,.03)', maxWidth: 640,
          }}>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, lineHeight: 1.7 }}>
            Көптеген студенттер білімнің қымбаттығынан қажеттісін игере алмайды. 
            Ал шын мәнінде, әрқайсымыздың айналамызда тұнып тұрған білімді студенттер көп.
            <strong style={{ color: '#fff' }}> StudySwap бұл кедергіні жояды.</strong>
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────
function HowItWorks() {
  const { ref, visible } = useInView()

  return (
    <section id="how" ref={ref} style={{ padding: '100px 32px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 72, maxWidth: 500 }}
          className={visible ? 'anim-fade-up' : ''}>
          <span className="section-label">Қалай жұмыс жасайды?</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 52px)', marginTop: 12 }}>
            Алғашқы сабаққа дейін <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>төрт қадам</em>
          </h2>
        </div>

        <div style={{ display: 'grid', gap: 3 }}>
          {STEPS.map((s, i) => (
            <div key={s.n}
              className={visible ? `anim-fade-up d-${(i + 1) * 100}` : ''}
              style={{
                display: 'grid', gridTemplateColumns: '80px 1fr',
                gap: 32, alignItems: 'center',
                padding: '32px 0',
                borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700,
                color: 'var(--border-2)', letterSpacing: '-0.06em', lineHeight: 1,
              }}>{s.n}</span>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600 }}>{s.title}</h3>
                <p style={{ color: 'var(--ink-2)', fontSize: 16, lineHeight: 1.6 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={visible ? 'anim-fade-up d-500' : ''}
          style={{ marginTop: 56, textAlign: 'center' }}>
          <a href="/register" className="btn btn-primary" style={{ fontSize: 16, padding: '15px 36px' }}>
            Тегін байқап көр →
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Solution visual ──────────────────────────────────────
function Solution() {
  const { ref, visible } = useInView()

  return (
    <section style={{ padding: '100px 32px', background: 'var(--surface-2)' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
          className="block md:grid">

          <div className={visible ? 'anim-fade-up' : ''}>
            <span className="section-label">Шешім</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 52px)', marginTop: 12, marginBottom: 24 }}>
              Білім алмасу — қарапайым әрі әділ
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 17, lineHeight: 1.75, marginBottom: 32 }}>
              Сен математиканы білесің — мен ағылшын тілін білемін.
              Біз бір-бірімізді үйретеміз. Ақша керек емес, тек білім
              Тек өзара тиімді екі студент.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Ақша қажет емес — тек білім', 'Алгоритм саған ең қолайлы серіктесті табады', 'Онлайн немесе офлайн кездесу'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>✓</span>
                  <span style={{ fontSize: 15, color: 'var(--ink-2)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Визуальная схема обмена */}
          <div className={`hidden md:block ${visible ? 'anim-fade-up d-200' : ''}`}>
            <div style={{ position: 'relative', padding: '40px' }}>
              {/* Студент A */}
              <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', background: 'rgba(232,93,4,.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>🧮</div>
                  <div>
                    <p style={{ fontWeight: 600 }}>Алибек</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>2 курс, МУИТ</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-orange">Математика</span>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--ink-3)' }}>хочет учить</span>
                </div>
              </div>

              {/* Стрелка */}
              <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative' }}>
                <div style={{
                  width: 2, height: 40, background: 'var(--border)',
                  margin: '0 auto 8px',
                }} />
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--accent)', color: '#fff', borderRadius: 999,
                  padding: '8px 20px', fontSize: 13, fontWeight: 600,
                  boxShadow: '0 4px 16px var(--accent-glow)',
                }}>
                  StudySwap Match ✓
                </div>
                <div style={{ width: 2, height: 40, background: 'var(--border)', margin: '8px auto 0' }} />
              </div>

              {/* Студент B */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', background: 'rgba(26,107,74,.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>🌍</div>
                  <div>
                    <p style={{ fontWeight: 600 }}>Айгерім</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>3 курс, КазНУ</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-green">Ағылшын тілі</span>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--ink-3)' }}>оқыта алады</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Team ─────────────────────────────────────────────────
function Team() {
  const { ref, visible } = useInView()

  return (
    <section id="team" ref={ref} style={{ padding: '100px 32px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className={visible ? 'anim-fade-up' : ''} style={{ marginBottom: 60 }}>
          <span className="section-label">Тим</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 52px)', marginTop: 12 }}>
            StudySwap
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}
          className="grid grid-cols-2 md:grid-cols-4">
          {TEAM.map((m, i) => (
            <div key={m.role}
              className={`card ${visible ? `anim-fade-up d-${(i + 1) * 100}` : ''}`}
              style={{ padding: '32px 24px', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--r)',
                background: 'var(--surface-2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>{m.emoji}</div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>{m.name}</p>
              <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────
function Contact() {
  const { ref, visible } = useInView()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function send() {
    if (!form.name || !form.email || !form.message) return
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setStatus(data.success ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" style={{ padding: '100px 32px', background: 'var(--surface-2)' }}>
      <div ref={ref} style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className={visible ? 'anim-fade-up' : ''} style={{ marginBottom: 48, textAlign: 'center' }}>
          <span className="section-label">Контактілер</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 52px)', marginTop: 12 }}>
            Бізге жазыңыз
          </h2>
          <p style={{ color: 'var(--ink-2)', marginTop: 12, fontSize: 16 }}>
            Біз 24 сағат ішінде жауап береміз
          </p>
        </div>

        {status === 'done' ? (
          <div className="anim-fade-up card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🎉</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Жіберілді!</h3>
            <p style={{ color: 'var(--ink-2)' }}>Біз сізге жақын арада хабарласамыз.</p>
          </div>
        ) : (
          <div className={`card ${visible ? 'anim-fade-up d-200' : ''}`} style={{ padding: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>
                    Есімңіз
                  </label>
                  <input className="input" placeholder="Алибек"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>
                    Email
                  </label>
                  <input className="input" placeholder="alibek@gmail.ru" type="email"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>
                  Хабарлама
                </label>
                <textarea className="input" placeholder="Бізге идея немесе сұрағыңыз туралы жазыңыз ..." rows={4}
                  style={{ resize: 'none' }}
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>

              {status === 'error' && (
                <p style={{ color: 'var(--accent)', fontSize: 13 }}>Жіберу қатесі. Қайтадан байқап көріңіз.</p>
              )}

              <button className="btn btn-primary" onClick={send} disabled={status === 'loading'}
                style={{ fontSize: 15, padding: '14px', justifyContent: 'center',
                  opacity: status === 'loading' ? .7 : 1 }}>
                {status === 'loading' ? 'Жіберілді' : 'Хабарлама жіберу →'}
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-3)' }}>
              Немесе Telegram-ға жазыңыз:{' '}
              <a href="https://t.me/damiiiira" style={{ color: 'var(--accent)', fontWeight: 500 }}>
                @damiiiira
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: 'var(--ink)', color: 'rgba(255,255,255,.4)',
      padding: '48px 32px', textAlign: 'center',
    }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.04em' }}>
        Study<span style={{ color: 'var(--accent)' }}>Swap</span>
      </p>
      <p style={{ fontSize: 14, marginBottom: 24 }}>Басқаларды үйрету арқылы үйреніңіз</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href}
            style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.35)')}>
            {l.label}
          </a>
        ))}
      </div>
      <p style={{ marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,.2)' }}>
        © 2026 StudySwap. Барлық құқықтар қорғалған.
      </p>
    </footer>
  )
}

// ─── Главная страница ─────────────────────────────────────
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Team />
      <Contact />
      <Footer />
    </>
  )
}