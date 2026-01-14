-- 구글맵 링크 테이블 생성
-- 장소와 독립적으로 구글맵 링크를 관리하기 위한 테이블

create table if not exists public.google_map_links (
    id uuid default gen_random_uuid() primary key,
    trip_id uuid not null references public.trips(id) on delete cascade,
    title text not null,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 인덱스 추가
create index if not exists idx_google_map_links_trip_id on public.google_map_links(trip_id);

-- RLS 정책 설정
alter table public.google_map_links enable row level security;

-- 모든 사용자가 자신의 여행의 링크를 볼 수 있음
create policy "Users can view their own google map links"
    on public.google_map_links
    for select
    using (true);

-- 모든 사용자가 자신의 여행에 링크를 추가할 수 있음
create policy "Users can insert their own google map links"
    on public.google_map_links
    for insert
    with check (true);

-- 모든 사용자가 자신의 여행의 링크를 수정할 수 있음
create policy "Users can update their own google map links"
    on public.google_map_links
    for update
    using (true);

-- 모든 사용자가 자신의 여행의 링크를 삭제할 수 있음
create policy "Users can delete their own google map links"
    on public.google_map_links
    for delete
    using (true);

-- updated_at 자동 업데이트 트리거
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_google_map_links_updated_at
    before update on public.google_map_links
    for each row
    execute function update_updated_at_column();
