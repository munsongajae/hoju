-- 여행 별 예산 관리 테이블

create table if not exists public.trip_budgets (
  trip_id uuid primary key references public.trips(id) on delete cascade,
  total_budget_aud numeric(10, 2),
  total_budget_krw numeric(12, 2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trip_budgets enable row level security;

create policy "Allow public read/write" on public.trip_budgets for all using (true) with check (true);






