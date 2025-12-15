-- 6. DIARIES (여행 일기)
create table public.diaries (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade,
  day_number integer not null,
  date date not null,
  title text,
  content text,
  mood text check (mood in ('happy', 'excited', 'relaxed', 'tired', 'sick', 'normal')),
  weather text,
  highlight text, -- 오늘의 하이라이트/베스트 모먼트
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.diaries enable row level security;
create policy "Allow public read/write" on public.diaries for all using (true) with check (true);
