'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, Match, Notification } from '@/lib/types'
import s from './home.module.css'

// ── Normalise skill text ──────────────────────────────────
function normalise(str: string) {
  return str.trim().toLowerCase()
}

// ── Preset skills (for sidebar editor) ───────────────────
const PRESET_SIDEBAR = [
  'python', 'javascript', 'react', 'sql', 'java',
  'математика', 'физика', 'химия', 'английский',
  'дизайн', 'маркетинг', 'ui/ux', 'docker', 'git',
]

// ── XP / Level helpers ────────────────────────────────────
function calcLevel(matchCount: number, rating: number) {
  const xp = matchCount * 120 + Math.round(rating * 40)
  const level = Math.floor(xp / 300) + 1
  const xpInLevel = xp % 300
  return { level, xpInLevel, xpNeeded: 300, xp }
}

const LEVEL_NAMES = ['', 'Жаңадан келген', 'Студент', 'Ментор', 'Эксперт', 'Мастер']
const LEVEL_ICONS = ['', '🌱', '📚', '🎓', '🚀', '⭐']

// ── Badges ───────────────────────────────────────────────
function getBadges(profile: Profile, matchCount: number) {
  return [
    {
      id: 'first',
      icon: '🎯',
      label: 'Бірінші матч',
      earned: matchCount >= 1,
    },
    {
      id: 'reliable',
      icon: '🤝',
      label: 'Сенімді',
      earned: profile.rating >= 4 && profile.rating_count >= 2,
    },
    {
      id: 'ten',
      icon: '🏆',
      label: '10 сеанстар',
      earned: matchCount >= 10,
    },
    {
      id: 'telegram',
      icon: '✈️',
      label: 'Байланыста',
      earned: !!profile.telegram,
    },
  ]
}

// ── Sub-components ────────────────────────────────────────

function SkillChip({
  label, variant, onRemove,
}: { label: string; variant: 'orange' | 'green'; onRemove?: () => void }) {
  return (
    <span className={`${s.skillTag} ${s[variant]}`}>
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            marginLeft: 4, background: 'none', border: 'none',
            cursor: 'pointer', padding: '0 2px', fontSize: 12,
            color: 'inherit', opacity: 0.6, lineHeight: 1,
          }}
        >×</button>
      )}
    </span>
  )
}

function StarRating({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default',
            fontSize: 22, padding: 0, lineHeight: 1,
            color: n <= (hover || value) ? 'var(--accent)' : 'var(--border-2)',
            transition: 'color 0.1s, transform 0.1s',
            transform: onChange && n <= hover ? 'scale(1.2)' : 'scale(1)',
          }}>
          ★
        </button>
      ))}
    </div>
  )
}

// ── Inline sidebar skill editor ───────────────────────────
function SideSkillEditor({
  skills, variant, onSave, onCancel,
}: {
  skills: string[]; variant: 'orange' | 'green'
  onSave: (s: string[]) => void; onCancel: () => void
}) {
  const [local, setLocal] = useState<string[]>([...skills])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const accentColor = variant === 'orange' ? 'var(--accent)' : 'var(--green)'

  function add(raw: string) {
    const t = normalise(raw)
    if (!t || local.includes(t) || local.length >= 8) return
    setLocal([...local, t])
    setInput('')
    inputRef.current?.focus()
  }

  function remove(t: string) { setLocal(local.filter(x => x !== t)) }

  return (
    <div className={s.skillEditor}>
      <div className={s.skillEditorInput}>
        {local.map(t => (
          <span key={t} style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '3px 8px 3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500,
            background: variant === 'orange' ? 'rgba(232,93,4,0.1)' : 'rgba(26,107,74,0.1)',
            color: accentColor,
            border: `1px solid ${variant === 'orange' ? 'rgba(232,93,4,0.25)' : 'rgba(26,107,74,0.25)'}`,
          }}>
            {t}
            <button type="button" onClick={() => remove(t)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: accentColor, opacity: 0.6, fontSize: 13, lineHeight: 1, padding: 0,
            }}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); add(input) }
            if (e.key === 'Backspace' && !input && local.length > 0) remove(local[local.length - 1])
          }}
          placeholder={local.length === 0 ? 'Біліміңді жазыңыз...' : ''}
          className={s.chipInput}
        />
      </div>

      <div className={s.presetChips}>
        {PRESET_SIDEBAR.filter(p => !local.includes(p)).slice(0, 8).map(p => (
          <button key={p} type="button" onClick={() => add(p)} className={s.presetChip}>
            +{p}
          </button>
        ))}
      </div>

      <div className={s.editorActions}>
        <button className="btn btn-outline" onClick={onCancel}
          style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: 12 }}>
          Болдырмау
        </button>
        <button className="btn btn-primary" onClick={() => onSave(local)}
          style={{ flex: 2, justifyContent: 'center', padding: '8px', fontSize: 12 }}>
          Сақтау
        </button>
      </div>
    </div>
  )
}

// ── Notification panel ────────────────────────────────────
function NotifPanel({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [notifs, setNotifs] = useState<Notification[]>([])

  useEffect(() => {
    fetch(`/api/notifications?user_id=${userId}`)
      .then(r => r.json())
      .then(d => setNotifs(d.notifications || []))
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
  }, [userId])

  return (
    <div className={s.notifPanel}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontWeight: 600, fontSize: 14 }}>Хабарландырулар</p>
        <button onClick={onClose} style={{ background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--ink-3)', fontSize: 20 }}>×</button>
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {notifs.length === 0
          ? <p style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              Әзірге хабарландырулар жоқ
            </p>
          : notifs.map(n => (
            <div key={n.id} className={`${s.notifItem} ${!n.is_read ? s.unread : ''}`}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>
                {n.type === 'match_found' ? '🎉' : n.type === 'review' ? '⭐' : '💬'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 12, marginBottom: 1 }}>{n.title}</p>
                <p style={{ fontSize: 11, color: 'var(--ink-2)' }}>{n.body}</p>
              </div>
              {!n.is_read && (
                <div style={{ width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--accent)', flexShrink: 0, marginTop: 3 }} />
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Review modal ──────────────────────────────────────────
function ReviewModal({
  match, currentProfileId, onClose, onDone,
}: {
  match: Match & { partner: Profile }
  currentProfileId: string
  onClose: () => void
  onDone: () => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!rating) return
    setLoading(true)
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: match.id,
        from_user_id: currentProfileId,
        to_user_id: match.partner.id,
        rating, comment,
      }),
    })
    setLoading(false)
    onDone()
  }

  return (
    <div className={s.modalOverlay}>
      <div className={s.modalBox}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>⭐</p>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 4 }}>
          Сабақты бағалаңыз
        </h3>
        <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 20 }}>
          Қалай өтті <strong>{match.partner.name}</strong>?
        </p>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Оценка</p>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Пікір <span style={{ color: 'var(--ink-3)' }}>(міндетті емес)</span>
          </p>
          <textarea className="input" rows={3} style={{ resize: 'none' }}
            placeholder="Өз әсерлеріңізбен  бөлісіңіз..."
            value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={onClose}
            style={{ flex: 1, justifyContent: 'center' }}>Болдырмау</button>
          <button className="btn btn-primary" onClick={submit}
            disabled={!rating || loading}
            style={{ flex: 2, justifyContent: 'center', opacity: !rating ? 0.5 : 1 }}>
            {loading ? 'Сақтауда...' : 'Жіберу ⭐'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════
type MatchState = 'idle' | 'searching' | 'found'

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'match' | 'history' | 'profile'>('match')
  const [showNotifs, setShowNotifs] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [reviewTarget, setReviewTarget] = useState<(Match & { partner: Profile }) | null>(null)

  // Sidebar skill editing
  const [editTeach, setEditTeach] = useState(false)
  const [editLearn, setEditLearn] = useState(false)
  const [editTg, setEditTg] = useState(false)
  const [tgInput, setTgInput] = useState('')

  // Matchmaking
  const [matchState, setMatchState] = useState<MatchState>('idle')
  const [searchSecs, setSearchSecs] = useState(0)
  const [partner, setPartner] = useState<Profile | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // History
  const [pastMatches, setPastMatches] = useState<(Match & { partner: Profile })[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Profile tab
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileForm, setProfileForm] = useState({ name: '', telegram: '', newPassword: '' })

  // ── Auth ────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem('studyswap_user')
    const session = localStorage.getItem('studyswap_session')
    if (!raw || !session) { router.replace('/login'); return }
    const user = JSON.parse(raw)
    setUserId(user.id)
    fetchProfile(user.id)
    fetchUnread(user.id)
  }, [router])

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/profile?user_id=${uid}`)
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
        setTgInput(data.profile.telegram || '')
        setProfileForm(f => ({
          ...f,
          name: data.profile.name || '',
          telegram: data.profile.telegram || '',
        }))
      }
    } finally {
      setPageLoading(false)
    }
  }, [])

  async function fetchUnread(uid: string) {
    try {
      const res = await fetch(`/api/notifications?user_id=${uid}`)
      const data = await res.json()
      setUnreadCount(data.unread || 0)
    } catch {}
  }

  async function fetchHistory(uid: string) {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/matches?user_id=${uid}`)
      const data = await res.json()
      setPastMatches(data.matches || [])
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history' && userId) fetchHistory(userId)
  }, [activeTab, userId])

  function logout() {
    localStorage.removeItem('studyswap_session')
    localStorage.removeItem('studyswap_user')
    router.push('/')
  }

  // ── Save skills ──────────────────────────────────────────
  async function saveSkills(field: 'skills_teach' | 'skills_learn', value: string[]) {
    if (!userId) return
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, [field]: value }),
    })
    const data = await res.json()
    if (data.profile) setProfile(data.profile)
    if (field === 'skills_teach') setEditTeach(false)
    else setEditLearn(false)
  }

  async function saveTelegram() {
    if (!userId) return
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, telegram: tgInput }),
    })
    setProfile(p => p ? { ...p, telegram: tgInput } : p)
    setEditTg(false)
  }

  // ── Profile save ─────────────────────────────────────────
  async function saveProfile() {
    if (!userId) return
    setProfileSaving(true)
    setProfileMsg('')
    const body: Record<string, string> = {
      user_id: userId,
      name: profileForm.name,
      telegram: profileForm.telegram,
    }
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.profile) {
      setProfile(data.profile)
      setProfileMsg('Сақталды!')
    } else {
      setProfileMsg('Сақтау кезіндегі қате')
    }
    setProfileSaving(false)
    setTimeout(() => setProfileMsg(''), 3000)
  }

  // ── Matchmaking ──────────────────────────────────────────
  async function startMatch() {
    if (!userId || matchState !== 'idle') return
    setMatchState('searching')
    setSearchSecs(0)
    timerRef.current = setInterval(() => setSearchSecs(x => x + 1), 1000)

    try {
      const [res] = await Promise.all([
        fetch(`/api/match?user_id=${userId}`),
        new Promise(r => setTimeout(r, 3000)),
      ])
      const data = await (res as Response).json()
      clearInterval(timerRef.current!)
      if (data.matches?.length > 0) {
        setPartner(data.matches[0])
        setMatchState('found')
      } else {
        setMatchState('idle')
        alert('Әзірге лайықты серіктестер жоқ. Әрекетті кейінірек қайталаңыз!')
      }
    } catch {
      clearInterval(timerRef.current!)
      setMatchState('idle')
    }
  }

  function cancelMatch() {
    clearInterval(timerRef.current!)
    setMatchState('idle')
    setSearchSecs(0)
  }

  function resetMatch() {
    setPartner(null)
    setMatchState('idle')
    setSearchSecs(0)
  }

  // ── Loading screen ───────────────────────────────────────
  if (pageLoading) return (
    <div className={s.loadingScreen}>
      <span className={s.spinner}>⟳</span>
      <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>Профиль жүктелуде...</p>
    </div>
  )

  if (!profile) return null

  // ── Computed values ──────────────────────────────────────
  const matchCount = pastMatches.length
  const { level, xpInLevel, xpNeeded } = calcLevel(matchCount, profile.rating)
  const levelName = LEVEL_NAMES[Math.min(level, 5)] || 'Мастер'
  const levelIcon = LEVEL_ICONS[Math.min(level, 5)] || '⭐'
  const badges = getBadges(profile, matchCount)
  const completedMatches = pastMatches.filter(m => m.status === 'completed').length
  const completionPct = matchCount > 0 ? Math.round((completedMatches / matchCount) * 100) : 0

  const fmt = profile.format === 'online' ? { icon: '💻', label: 'Онлайн' }
    : profile.format === 'offline' ? { icon: '🤝', label: 'Оффлайн' }
    : { icon: '⚡', label: 'Иілімді' }

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className={s.navbar}>
        <a href="/" className={s.navLogo}>
          Study<span>Swap</span>
        </a>
        <div className={s.navRight}>
          <div style={{ position: 'relative' }}>
            <button className={s.notifBtn} onClick={() => setShowNotifs(!showNotifs)}>
              🔔
              {unreadCount > 0 && <span className={s.notifBadge}>{unreadCount}</span>}
            </button>
            {showNotifs && userId && (
              <NotifPanel userId={userId} onClose={() => { setShowNotifs(false); setUnreadCount(0) }} />
            )}
          </div>
          <div className={s.avatar}>{profile.name.charAt(0).toUpperCase()}</div>
          <button className={s.logoutBtn} onClick={logout}>Шығу</button>
        </div>
      </nav>

      {/* ── LAYOUT ── */}
      <div className={s.layout}>

        {/* ══ SIDEBAR ══ */}
        <aside className={s.sidebar}>

          {/* Avatar + name */}
          <div className={s.sideAvatar}>
            <div className={s.sideAvatarCircle}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h2 className={s.sideName}>{profile.name}</h2>
            {profile.bio && <p className={s.sideBio}>{profile.bio}</p>}
          </div>

          {/* XP bar */}
          <div className={s.xpBlock}>
            <div className={s.xpTop}>
              <span className={s.xpLevel}>{levelIcon} {levelName}|Д. {level}</span>
              <span className={s.xpNum}>{xpInLevel}/{xpNeeded} XP</span>
            </div>
            <div className={s.xpBar}>
              <div className={s.xpFill} style={{ width: `${(xpInLevel / xpNeeded) * 100}%` }} />
            </div>
            <p className={s.xpLabel}>Келесі деңгейге дейін: {xpNeeded - xpInLevel} XP</p>
          </div>

          {/* Streak */}
          <div className={s.streakRow}>
            <span className={s.streakFire}>🔥</span>
            <span className={s.streakText}>
              Серия: <span className={s.streakNum}>{matchCount} сәйкестік{matchCount === 1 ? '' : matchCount < 5 ? '' : ''}</span>
            </span>
            {completionPct > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)' }}>
                {completionPct}% ✓
              </span>
            )}
          </div>

          {/* Badges */}
          <div className={s.badgesRow}>
            {badges.map(b => (
              <span key={b.id} className={`${s.badge} ${b.earned ? s.earned : ''}`}
                title={b.earned ? b.label : `Әлі алынған жоқ: ${b.label}`}>
                {b.icon} {b.earned ? b.label : '?'}
              </span>
            ))}
          </div>

          {/* Format pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '6px 12px', background: 'var(--surface-2)', borderRadius: 999,
            border: '1px solid var(--border)', marginBottom: 16, fontSize: 12,
            fontWeight: 500, color: 'var(--ink-2)' }}>
            {fmt.icon} {fmt.label}
          </div>

          {/* Teach skills */}
          <div className={s.sideSection}>
            <div className={s.sideSectionHeader}>
              <span className={s.sideSectionLabel}>Үйретемін</span>
              {!editTeach && (
                <button className={s.editBtn} style={{ color: 'var(--accent)' }}
                  onClick={() => { setEditTeach(true); setEditLearn(false) }}>
                  Өзгерту
                </button>
              )}
            </div>
            {editTeach ? (
              <SideSkillEditor
                skills={profile.skills_teach} variant="orange"
                onSave={v => saveSkills('skills_teach', v)}
                onCancel={() => setEditTeach(false)}
              />
            ) : (
              <div className={s.skillTags}>
                {profile.skills_teach.length > 0
                  ? profile.skills_teach.map(t => <SkillChip key={t} label={t} variant="orange" />)
                  : (
                    <button className={s.addSkillBtn}
                      style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                      onClick={() => setEditTeach(true)}>
                      + Қосу
                    </button>
                  )
                }
              </div>
            )}
          </div>

          {/* Learn skills */}
          <div className={s.sideSection}>
            <div className={s.sideSectionHeader}>
              <span className={s.sideSectionLabel}>Үйренгім келеді</span>
              {!editLearn && (
                <button className={s.editBtn} style={{ color: 'var(--green)' }}
                  onClick={() => { setEditLearn(true); setEditTeach(false) }}>
                  Өзгерту
                </button>
              )}
            </div>
            {editLearn ? (
              <SideSkillEditor
                skills={profile.skills_learn} variant="green"
                onSave={v => saveSkills('skills_learn', v)}
                onCancel={() => setEditLearn(false)}
              />
            ) : (
              <div className={s.skillTags}>
                {profile.skills_learn.length > 0
                  ? profile.skills_learn.map(t => <SkillChip key={t} label={t} variant="green" />)
                  : (
                    <button className={s.addSkillBtn}
                      style={{ color: 'var(--green)', borderColor: 'var(--green)' }}
                      onClick={() => setEditLearn(true)}>
                      + Қосу
                    </button>
                  )
                }
              </div>
            )}
          </div>

          {/* Telegram */}
          <div className={s.sideSection}>
            <span className={s.sideSectionLabel}>Telegram</span>
            {editTg ? (
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 9, top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--ink-3)', fontSize: 12 }}>@</span>
                  <input className="input" style={{ paddingLeft: 22, fontSize: 12, padding: '7px 7px 7px 22px' }}
                    value={tgInput} onChange={e => setTgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveTelegram()} />
                </div>
                <button className="btn btn-primary" onClick={saveTelegram}
                  style={{ padding: '7px 10px', fontSize: 12 }}>✓</button>
              </div>
            ) : (
              <button className={s.tgBtn} onClick={() => setEditTg(true)} style={{ marginTop: 8 }}>
                <span style={{ fontSize: 15 }}>✈️</span>
                <span style={{ flex: 1, textAlign: 'left', color: profile.telegram ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {profile.telegram ? `@${profile.telegram}` : 'Добавить Telegram'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>✏</span>
              </button>
            )}
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <main className={s.main}>
          {/* BG decoration */}
          <div style={{ position: 'absolute', top: 40, right: -40, width: 360, height: 360,
            borderRadius: '50%', border: '1px solid var(--border)', opacity: 0.4,
            pointerEvents: 'none' }} />

          {/* Welcome header */}
          <div className={`${s.fadeUp}`} style={{ marginBottom: 28 }}>
            <span className="section-label">Дашборд</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)',
              marginTop: 6, marginBottom: 0 }}>
              Сәлем,{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>
                {profile.name.split(' ')[0]}
              </em>! 👋
            </h1>
          </div>

          {/* Tabs */}
          <div className={`${s.tabs} ${s.fadeUp} ${s.d100}`}>
            {([
              { key: 'match',   label: '⚡ Матчмейкинг' },
              { key: 'history', label: '📋 Матч Тарихы' },
              { key: 'profile', label: '⚙️ Профиль' },
            ] as const).map(t => (
              <button key={t.key}
                className={`${s.tab} ${activeTab === t.key ? s.active : ''}`}
                onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: MATCHMAKING ── */}
          {activeTab === 'match' && (
            <div className={`${s.fadeUp} ${s.d200}`}>

              {/* No telegram warning */}
              {!profile.telegram && (
                <div style={{
                  padding: '12px 16px', marginBottom: 20, borderRadius: 'var(--r)',
                  background: 'rgba(232,93,4,0.07)', border: '1px solid rgba(232,93,4,0.2)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <p style={{ fontSize: 13, color: 'var(--accent)' }}>
                    Бүйірлік тақтаға Telegram қосыңыз - әйтпесе серіктес сізбен байланыса алмайды
                  </p>
                </div>
              )}

              {/* IDLE */}
              {matchState === 'idle' && (
                <div className={s.matchCard}>
                  <div className={s.matchCardBg1} />
                  <div className={s.matchCardBg2} />

                  <div className={s.matchIcon}>🔍</div>

                  <h2 className={s.matchTitle}>Серіктес іздеу</h2>
                  <p className={s.matchDesc}>
                    Алгоритм сіздің дағдыларыңызға сай <b>ең тиімді серіктесті</b> бірнеше секунд ішінде табады.
                  </p>

                  {/* Skills preview */}
                  <div className={s.skillsPreview}>
                    <div className={s.skillsPreviewCol}>
                      <p className={s.skillsPreviewLabel} style={{ color: 'var(--accent)' }}>
                       Сіз үйретесіз
                      </p>
                      <div className={s.skillsPreviewTags}>
                        {profile.skills_teach.slice(0, 3).map(t =>
                          <SkillChip key={t} label={t} variant="orange" />
                        )}
                        {profile.skills_teach.length > 3 && (
                          <span className={`${s.skillTag} ${s.gray}`}>
                            +{profile.skills_teach.length - 3}
                          </span>
                        )}
                        {profile.skills_teach.length === 0 && (
                          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Көрсетілмеген</span>
                        )}
                      </div>
                    </div>
                    <div className={s.skillsPreviewDivider} />
                    <div className={s.skillsPreviewCol}>
                      <p className={s.skillsPreviewLabel} style={{ color: 'var(--green)' }}>
                        Сіз үйренесіз
                      </p>
                      <div className={s.skillsPreviewTags}>
                        {profile.skills_learn.slice(0, 3).map(t =>
                          <SkillChip key={t} label={t} variant="green" />
                        )}
                        {profile.skills_learn.length > 3 && (
                          <span className={`${s.skillTag} ${s.gray}`}>
                            +{profile.skills_learn.length - 3}
                          </span>
                        )}
                        {profile.skills_learn.length === 0 && (
                          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Көрсетілмеген</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className={s.startBtn} onClick={startMatch}>
                    Іздеуді бастау ⚡
                  </button>
                </div>
              )}

              {/* SEARCHING */}
              {matchState === 'searching' && (
                <div className={s.searchingCard}>
                  <div className={s.pulseContainer}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className={s.pulseRing}
                        style={{ animation: `pulse-out 2s ease-out ${i * 0.65}s infinite` }} />
                    ))}
                    <div className={s.pulseCore}>🔍</div>
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 6 }}>
                    Серіктес табылуда...
                  </h2>
                  <p style={{ color: 'var(--ink-2)', marginBottom: 12 }}>
                    Дағдылардың сәйкестігін талдау
                  </p>
                  <p className={s.timerDisplay}>
                    {String(Math.floor(searchSecs / 60)).padStart(2, '0')}:{String(searchSecs % 60).padStart(2, '0')}
                  </p>
                  <div className={s.bounceDots}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className={s.bounceDot}
                        style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                  <button className="btn btn-outline" onClick={cancelMatch}>Болдырмау</button>
                </div>
              )}

              {/* FOUND */}
              {matchState === 'found' && partner && (
                <div style={{ animation: `${s.fadeUp} 0s` }}>
                  {/* Celebration header */}
                  <div className={s.foundHeader}>
                    <span className={s.confetti}
                      style={{ animation: 'celebrate 0.6s ease-out both' }}>🎉</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24,
                      color: '#fff', marginBottom: 4 }}>Серіктес табылды!</h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                      Керемет сәйкестік
                    </p>
                  </div>

                  <div className={s.partnerCard}>
                    {/* Partner info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                      <div className={s.partnerAvatar}>
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>
                            {partner.name}
                          </h3>
                          {partner.rating_count > 0 && (
                            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
                              ★ {partner.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {partner.bio && (
                          <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>{partner.bio}</p>
                        )}
                      </div>
                      <span style={{ padding: '5px 11px', borderRadius: 999, fontSize: 12,
                        fontWeight: 600, background: 'rgba(26,107,74,0.1)',
                        color: 'var(--green)', border: '1px solid rgba(26,107,74,0.2)',
                        whiteSpace: 'nowrap' }}>
                        {partner.format === 'online' ? '💻' : partner.format === 'offline' ? '🤝' : '⚡'}{' '}
                        {partner.format === 'online' ? 'Онлайн' : partner.format === 'offline' ? 'Оффлайн' : 'Гибко'}
                      </span>
                    </div>

                    {/* Exchange grid */}
                    <div className={s.exchangeGrid}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '.1em', color: 'var(--accent)', marginBottom: 8 }}>
                          Сізге үйретеді
                        </p>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {partner.skills_teach.map(t => <SkillChip key={t} label={t} variant="orange" />)}
                        </div>
                      </div>
                      <div className={s.exchangeArrow}>⇄</div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '.1em', color: 'var(--green)', marginBottom: 8 }}>
                          Өзі үйренгісі келеді
                        </p>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {partner.skills_learn.map(t => <SkillChip key={t} label={t} variant="green" />)}
                        </div>
                      </div>
                    </div>

                    {/* Telegram CTA */}
                    <div className={s.tgCta}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 28 }}>✈️</span>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                            Telegram - ға жазыңыз
                          </p>
                          <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                            Уақыт пен Форматты келісіңіздер
                          </p>
                        </div>
                      </div>
                      {partner.telegram
                        ? <a href={`https://t.me/${partner.telegram}`}
                            target="_blank" rel="noopener noreferrer" className={s.tgLink}>
                            @{partner.telegram} →
                          </a>
                        : <span style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                            Telegram есімі көрсетілмеген
                          </span>
                      }
                    </div>

                    <button className="btn btn-outline" onClick={resetMatch}
                      style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}>
                     Басқа серіктес іздеу
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: HISTORY ── */}
          {activeTab === 'history' && (
            <div className={s.fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>
                Сәйкестіктер Тарихы
              </h2>
              {loadingHistory
                ? <p style={{ color: 'var(--ink-3)' }}>Жүктелуде...</p>
                : pastMatches.length === 0
                  ? <div className={s.emptyState}>
                      <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
                      <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>
                        Әзірге сәйкестіктер жоқ. ⚡ Матчмейкинг түймесін басыңыз!
                      </p>
                    </div>
                  : <div className={s.historyList}>
                      {pastMatches.map(m => (
                        <div key={m.id} className={s.historyCard}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                            background: 'var(--surface-2)', border: '2px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, fontWeight: 700, color: 'var(--ink-2)' }}>
                            {m.partner?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                              <p style={{ fontWeight: 600, fontSize: 14 }}>{m.partner?.name}</p>
                              {m.partner?.rating_count > 0 && (
                                <span style={{ fontSize: 12, color: 'var(--accent)' }}>
                                  ★ {m.partner.rating.toFixed(1)}
                                </span>
                              )}
                              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999,
                                background: m.status === 'completed'
                                  ? 'rgba(26,107,74,0.1)' : 'rgba(232,93,4,0.08)',
                                color: m.status === 'completed' ? 'var(--green)' : 'var(--accent)',
                                fontWeight: 600 }}>
                                {m.status === 'completed' ? '✓ Аяқталды' : '● Белсенді'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {m.partner?.skills_teach?.slice(0, 2).map(t =>
                                <SkillChip key={t} label={t} variant="orange" />
                              )}
                              {m.partner?.skills_learn?.slice(0, 2).map(t =>
                                <SkillChip key={t} label={t} variant="green" />
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                            {m.partner?.telegram && (
                              <a href={`https://t.me/${m.partner.telegram}`} target="_blank"
                                rel="noopener noreferrer" className="btn btn-outline"
                                style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}>
                                ✈️ @{m.partner.telegram}
                              </a>
                            )}
                            {m.status === 'matched' && (
                              <button className="btn btn-primary"
                                onClick={() => setReviewTarget(m as Match & { partner: Profile })}
                                style={{ fontSize: 12, padding: '6px 12px' }}>
                                ⭐ Пікір
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
              }
            </div>
          )}

          {/* ── TAB: PROFILE ── */}
          {activeTab === 'profile' && (
            <div className={s.fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>
                Профиль баптаулары
              </h2>
              <div className={s.profileCard}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
                    display: 'block', marginBottom: 6 }}>Имя</label>
                  <input className="input" value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
                    display: 'block', marginBottom: 6 }}>Telegram никнейм</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--ink-3)', fontSize: 14 }}>@</span>
                    <input className="input" style={{ paddingLeft: 28 }}
                      value={profileForm.telegram.replace('@', '')}
                      onChange={e => setProfileForm({ ...profileForm, telegram: e.target.value.replace('@', '') })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
                    display: 'block', marginBottom: 6 }}>
                    Жаңа құпия сөз{' '}
                    <span style={{ color: 'var(--ink-3)' }}></span>
                  </label>
                  <input className="input" type="password" placeholder="Оны өзгертпеу үшін бос қалдырыңыз"
                    value={profileForm.newPassword}
                    onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })} />
                </div>

                {profileMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--r)', fontSize: 13,
                    background: profileMsg === 'Сақталды!'
                      ? 'rgba(26,107,74,0.1)' : 'rgba(232,93,4,0.08)',
                    color: profileMsg === 'Сақталды!' ? 'var(--green)' : 'var(--accent)',
                    border: `1px solid ${profileMsg === 'Сақталды!' ? 'rgba(26,107,74,0.2)' : 'rgba(232,93,4,0.2)'}`,
                  }}>
                    {profileMsg === 'Сақталды!' ? '✓ ' : '⚠ '}{profileMsg}
                  </div>
                )}

                <button className="btn btn-primary" onClick={saveProfile}
                  disabled={profileSaving}
                  style={{ justifyContent: 'center', padding: '13px', opacity: profileSaving ? 0.7 : 1 }}>
                  {profileSaving ? 'Сақталуды...' : 'Өзгерістерді сақтау'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review modal */}
      {reviewTarget && profile && (
        <ReviewModal
          match={reviewTarget}
          currentProfileId={profile.id}
          onClose={() => setReviewTarget(null)}
          onDone={() => { setReviewTarget(null); if (userId) fetchHistory(userId) }}
        />
      )}

      <style>{`
        @keyframes pulse-out {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-10px); }
        }
        @keyframes celebrate {
          0%   { transform: scale(0) rotate(-20deg); }
          60%  { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1)   rotate(0deg); }
        }
      `}</style>
    </>
  )
}