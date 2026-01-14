-- Supabase Storage 버킷 생성 및 정책 설정
-- 이 스크립트는 Supabase 대시보드에서 직접 실행하거나, Supabase CLI를 통해 실행해야 합니다.

-- Storage 버킷 생성 (Supabase 대시보드에서 Storage > Create bucket으로 생성)
-- 버킷 이름: diary-images
-- Public: true (공개 버킷으로 설정하여 이미지 URL 접근 가능)

-- Storage 정책 설정 (RLS)
-- 모든 사용자가 이미지를 업로드하고 읽을 수 있도록 설정

-- 읽기 정책 (이미지 조회)
create policy "Public Access for diary images"
on storage.objects for select
using (bucket_id = 'diary-images');

-- 업로드 정책 (이미지 업로드)
create policy "Public Upload for diary images"
on storage.objects for insert
with check (bucket_id = 'diary-images');

-- 수정 정책 (이미지 수정)
create policy "Public Update for diary images"
on storage.objects for update
using (bucket_id = 'diary-images')
with check (bucket_id = 'diary-images');

-- 삭제 정책 (이미지 삭제)
create policy "Public Delete for diary images"
on storage.objects for delete
using (bucket_id = 'diary-images');




