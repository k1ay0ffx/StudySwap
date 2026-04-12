-- ════════════════════════════════════════════════════
-- StudySwap — полная схема базы данных
-- Запусти целиком в Supabase → SQL Editor → Run
-- ════════════════════════════════════════════════════

-- ── 1. Профили пользователей ─────────────────────────
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade unique not null,
  name          text not null,
  bio           text default '',
  avatar_url    text default '',
  telegram      text default '',          -- @никнейм для связи
  skills_teach  text[] default '{}',      -- что может преподавать
  skills_learn  text[] default '{}',      -- что хочет изучить
  format        text default 'both'       -- 'online' | 'offline' | 'both'
                check (format in ('online','offline','both')),
  rating        numeric(3,2) default 0,   -- средняя оценка 0–5
  rating_count  int default 0,            -- сколько оценок
  created_at    timestamptz default now()
);

-- ── 2. Матчи между студентами ─────────────────────────
create table if not exists matches (
  id          uuid primary key default gen_random_uuid(),
  user1_id    uuid references profiles(id) on delete cascade not null,
  user2_id    uuid references profiles(id) on delete cascade not null,
  score       int default 0,              -- кол-во совпадающих навыков
  status      text default 'pending'
              check (status in ('pending','matched','completed','cancelled')),
  created_at  timestamptz default now(),
  unique(user1_id, user2_id)
);

-- ── 3. Отзывы (рейтинг) ──────────────────────────────
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid references matches(id) on delete cascade,
  from_id     uuid references profiles(id) on delete cascade,
  to_id       uuid references profiles(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text default '',
  created_at  timestamptz default now(),
  unique(match_id, from_id)              -- один отзыв на один матч
);

-- ── 4. Уведомления ───────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  type        text not null,             -- 'match_found' | 'review' | 'message'
  title       text not null,
  body        text default '',
  is_read     boolean default false,
  meta        jsonb default '{}',        -- доп. данные (match_id и т.д.)
  created_at  timestamptz default now()
);

-- ── 5. Обращения через контактную форму ──────────────
create table if not exists contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz default now()
);

-- ════════════════════════════════════════════════════
-- RLS — политики безопасности (Row Level Security)
-- ════════════════════════════════════════════════════

alter table profiles       enable row level security;
alter table matches        enable row level security;
alter table reviews        enable row level security;
alter table notifications  enable row level security;
alter table contacts       enable row level security;

-- profiles: все видят, только свой редактируешь
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update" on profiles for update using (auth.uid() = user_id);

-- matches: участники видят свой матч
create policy "matches_read"   on matches for select using (
  user1_id = (select id from profiles where user_id = auth.uid()) or
  user2_id = (select id from profiles where user_id = auth.uid())
);
create policy "matches_insert" on matches for insert with check (true);
create policy "matches_update" on matches for update using (true);

-- reviews: все видят, только участник пишет
create policy "reviews_read"   on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (
  from_id = (select id from profiles where user_id = auth.uid())
);

-- notifications: только свои
create policy "notif_read"   on notifications for select using (
  user_id = (select id from profiles where user_id = auth.uid())
);
create policy "notif_insert" on notifications for insert with check (true);
create policy "notif_update" on notifications for update using (
  user_id = (select id from profiles where user_id = auth.uid())
);

-- contacts: только вставка
create policy "contacts_insert" on contacts for insert with check (true);