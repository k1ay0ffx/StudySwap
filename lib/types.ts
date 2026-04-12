// ════════════════════════════════════════════════════
// Все типы проекта в одном месте
// ════════════════════════════════════════════════════

export type Format = 'online' | 'offline' | 'both'
export type MatchStatus = 'pending' | 'matched' | 'completed' | 'cancelled'
export type NotifType = 'match_found' | 'review' | 'message'

export interface Profile {
  id: string
  user_id: string
  name: string
  bio: string
  avatar_url: string
  telegram: string
  skills_teach: string[]
  skills_learn: string[]
  format: Format
  rating: number
  rating_count: number
  created_at: string
}

export interface Match {
  id: string
  user1_id: string
  user2_id: string
  score: number
  status: MatchStatus
  created_at: string
  // joined fields
  user1?: Profile
  user2?: Profile
}

export interface Review {
  id: string
  match_id: string
  from_id: string
  to_id: string
  rating: number
  comment: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotifType
  title: string
  body: string
  is_read: boolean
  meta: Record<string, unknown>
  created_at: string
}

// ── Тела запросов ─────────────────────────────────────
export interface RegisterBody {
  name: string
  email: string
  password: string
  bio?: string
  telegram?: string
  skills_teach: string[]
  skills_learn: string[]
  format: Format
}

export interface LoginBody {
  email: string
  password: string
}

export interface UpdateProfileBody {
  user_id: string
  name?: string
  bio?: string
  telegram?: string
  skills_teach?: string[]
  skills_learn?: string[]
  format?: Format
}

export interface ContactBody {
  name: string
  email: string
  message: string
}

export interface ReviewBody {
  match_id: string
  from_user_id: string   // user.id из auth
  to_user_id: string     // profile.id получателя
  rating: number
  comment?: string
}