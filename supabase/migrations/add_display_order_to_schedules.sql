-- schedules 테이블에 display_order 필드 추가
-- 같은 day_number 내에서 일정의 표시 순서를 관리

alter table public.schedules
add column if not exists display_order integer default 0;

-- 기존 데이터에 대해 display_order 초기화
-- 같은 day_number와 start_time 기준으로 순서 부여
update public.schedules
set display_order = subquery.row_num - 1
from (
    select 
        id,
        row_number() over (partition by trip_id, day_number order by start_time, created_at) as row_num
    from public.schedules
) as subquery
where schedules.id = subquery.id;

-- 인덱스 추가 (성능 최적화)
create index if not exists idx_schedules_display_order 
on public.schedules(trip_id, day_number, display_order);
