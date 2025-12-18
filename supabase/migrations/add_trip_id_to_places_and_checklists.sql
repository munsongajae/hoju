-- places와 checklists 테이블에 trip_id 컬럼 추가
-- 여러 여행을 관리할 수 있도록 여행별로 장소와 체크리스트를 분리

-- 1. places 테이블에 trip_id 추가
alter table public.places 
add column if not exists trip_id uuid references public.trips(id) on delete cascade;

-- 2. checklists 테이블에 trip_id 추가
alter table public.checklists 
add column if not exists trip_id uuid references public.trips(id) on delete cascade;

-- 3. 인덱스 추가 (성능 최적화)
create index if not exists idx_places_trip_id on public.places(trip_id);
create index if not exists idx_checklists_trip_id on public.checklists(trip_id);

-- 4. 기존 데이터 처리 (선택사항)
-- 기존 places와 checklists는 trip_id가 NULL이 될 수 있음
-- 필요시 첫 번째 trip으로 마이그레이션할 수 있음:
-- UPDATE public.places SET trip_id = (SELECT id FROM public.trips LIMIT 1) WHERE trip_id IS NULL;
-- UPDATE public.checklists SET trip_id = (SELECT id FROM public.trips LIMIT 1) WHERE trip_id IS NULL;
