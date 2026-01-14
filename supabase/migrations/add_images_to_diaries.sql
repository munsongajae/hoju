-- diaries 테이블에 이미지 URL 필드 추가
-- Supabase Storage에 업로드된 이미지 URL을 저장

alter table public.diaries
add column if not exists image_urls text[];

-- 인덱스 추가 (이미지가 있는 일기 검색용)
create index if not exists idx_diaries_has_images on public.diaries using gin (image_urls) where image_urls is not null and array_length(image_urls, 1) > 0;




