-- 구글맵 링크 테이블에 도시 필드 추가

alter table public.google_map_links
add column if not exists city text default '시드니';

-- 도시별 인덱스 추가
create index if not exists idx_google_map_links_city on public.google_map_links(city);
