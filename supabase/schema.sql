-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. TRIPS (여행 기본 정보)
create table public.trips (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SCHEDULES (일정)
create table public.schedules (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade,
  day_number integer not null, -- 여행 몇일차인지 (Day 1, Day 2...)
  city text not null,
  start_time time without time zone,
  title text not null,
  type text not null check (type in ('view', 'food', 'move', 'rest', 'shop', 'kids')),
  memo text,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PLACES (장소 보관함)
create table public.places (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null check (category in ('tour', 'food', 'shop', 'medical', 'play')),
  rating numeric(2, 1),
  is_kid_friendly boolean default false,
  notes text,
  google_map_url text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. EXPENSES (지출)
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade,
  title text not null,
  amount numeric(10, 2) not null,
  category text not null check (category in ('food', 'transport', 'lodging', 'activity', 'shopping', 'etc')),
  city text,
  date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CHECKLISTS (체크리스트)
create table public.checklists (
  id uuid default uuid_generate_v4() primary key,
  category text not null, -- '출발 전', '이동 시' 등 그룹핑
  label text not null,
  is_checked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - 초기에는 편리한 개발을 위해 public access 허용 (나중에 수정 필요)
alter table public.trips enable row level security;
alter table public.schedules enable row level security;
alter table public.places enable row level security;
alter table public.expenses enable row level security;
alter table public.checklists enable row level security;

-- 누구나 읽고 쓸 수 있는 정책 (개발용)
create policy "Allow public read/write" on public.trips for all using (true) with check (true);
create policy "Allow public read/write" on public.schedules for all using (true) with check (true);
create policy "Allow public read/write" on public.places for all using (true) with check (true);
create policy "Allow public read/write" on public.expenses for all using (true) with check (true);
create policy "Allow public read/write" on public.checklists for all using (true) with check (true);

-- SEED DATA (기존 Mock Data 입력)
-- 1. Trip
insert into public.trips (id, title, start_date, end_date)
values ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '호주 한달 살기', '2025-10-01', '2025-10-30');

-- 2. Places
insert into public.places (name, category, rating, is_kid_friendly, notes, google_map_url) values
('타롱가 동물원', 'tour', 5, true, '배 타고 들어가면 뷰가 정말 좋음. 유모차 끌기 편함.', 'https://maps.google.com/?q=taronga+zoo'),
('더 그라운드 오브 알렉산드리아', 'food', 4.5, true, '정원이 예쁘지만 웨이팅이 김. 오전에 가는 것 추천.', 'https://maps.google.com/?q=the+grounds+of+alexandria'),
('달링하버 놀이터', 'play', 5, true, '물놀이 시설 있음. 여벌 옷 필수.', 'https://maps.google.com/?q=darling+harbour+playground');

-- 3. Schedules (Trip ID 연동 필요)
insert into public.schedules (trip_id, day_number, city, start_time, title, type, memo) values
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, '시드니', '10:00', '시드니 공항 도착', 'move', '옵터스(Optus)에서 유심 수령'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, '시드니', '12:00', '호텔 체크인', 'rest', null),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, '시드니', '09:00', '타롱가 동물원', 'kids', '서큘러 키에서 페리 탑승');
