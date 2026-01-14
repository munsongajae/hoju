-- expenses 테이블에 schedule_id 컬럼 추가
-- 일정과 지출을 연동하기 위한 컬럼

alter table public.expenses 
add column if not exists schedule_id uuid references public.schedules(id) on delete set null;

-- 인덱스 추가 (성능 향상)
create index if not exists idx_expenses_schedule_id on public.expenses(schedule_id);




