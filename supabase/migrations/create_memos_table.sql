-- memos 테이블 생성
-- 메모를 trip별로 저장하여 여러 여행을 관리할 수 있도록 함

create table if not exists public.memos (
    id uuid default gen_random_uuid() primary key,
    trip_id uuid references public.trips(id) on delete cascade not null,
    title text not null,
    content text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 인덱스 추가 (성능 최적화)
create index if not exists idx_memos_trip_id on public.memos(trip_id);
create index if not exists idx_memos_updated_at on public.memos(updated_at desc);

-- RLS (Row Level Security) 활성화
alter table public.memos enable row level security;

-- RLS 정책: 모든 사용자가 자신의 메모를 조회/생성/수정/삭제 가능
create policy "Users can view their own memos"
    on public.memos for select
    using (true);

create policy "Users can create their own memos"
    on public.memos for insert
    with check (true);

create policy "Users can update their own memos"
    on public.memos for update
    using (true)
    with check (true);

create policy "Users can delete their own memos"
    on public.memos for delete
    using (true);

-- updated_at 자동 업데이트 트리거
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_memos_updated_at
    before update on public.memos
    for each row
    execute function update_updated_at_column();




