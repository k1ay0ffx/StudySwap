import { createClient } from '@supabase/supabase-js'

// Клиент для браузера (публичный ключ)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Клиент для сервера (service_role — полный доступ, без RLS)
// Используй ТОЛЬКО в API routes, никогда во фронте
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)