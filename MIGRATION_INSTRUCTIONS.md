# 일기 사진 첨부 기능 마이그레이션 가이드

## 문제
`Could not find the 'image_urls' column of 'diaries' in the schema cache` 에러가 발생하는 경우, 데이터베이스 마이그레이션이 아직 실행되지 않았습니다.

## 해결 방법

### 방법 1: Supabase 대시보드에서 직접 실행 (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 좌측 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

3. **마이그레이션 SQL 실행**
   아래 SQL을 복사하여 실행:

```sql
-- diaries 테이블에 이미지 URL 필드 추가
-- Supabase Storage에 업로드된 이미지 URL을 저장

alter table public.diaries
add column if not exists image_urls text[];

-- 인덱스 추가 (이미지가 있는 일기 검색용)
create index if not exists idx_diaries_has_images on public.diaries using gin (image_urls) where image_urls is not null and array_length(image_urls, 1) > 0;
```

4. **실행 확인**
   - "Run" 버튼 클릭
   - 성공 메시지 확인

### 방법 2: Supabase CLI 사용 (선택사항)

터미널에서 다음 명령어 실행:

```bash
# Supabase CLI가 설치되어 있어야 합니다
supabase db push
```

또는 특정 마이그레이션 파일만 실행:

```bash
supabase migration up
```

## 추가 설정: Supabase Storage

일기 사진 첨부 기능을 사용하려면 Storage 버킷도 생성해야 합니다:

1. **Storage 버킷 생성**
   - Supabase 대시보드 → Storage → "Create bucket"
   - 버킷 이름: `diary-images`
   - Public bucket: **체크** (공개 버킷으로 설정)
   - "Create bucket" 클릭

2. **Storage 정책 설정**
   - Storage → Policies → `diary-images` 버킷 선택
   - 또는 SQL Editor에서 다음 정책 실행:

```sql
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
```

## 확인 방법

마이그레이션이 성공적으로 실행되었는지 확인:

1. **Supabase 대시보드 → Table Editor → diaries 테이블**
   - `image_urls` 컬럼이 있는지 확인
   - 타입이 `text[]` (텍스트 배열)인지 확인

2. **앱에서 테스트**
   - 일기 작성 페이지로 이동
   - 사진 첨부 기능이 정상 작동하는지 확인

## 문제 해결

### 여전히 에러가 발생하는 경우

1. **브라우저 새로고침**
   - Supabase 클라이언트 캐시 문제일 수 있습니다
   - 페이지를 완전히 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)

2. **Supabase 프로젝트 재연결 확인**
   - 환경 변수 확인: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 올바른 프로젝트에 연결되어 있는지 확인

3. **RLS (Row Level Security) 정책 확인**
   - `diaries` 테이블의 RLS 정책이 올바르게 설정되어 있는지 확인

## 참고

- 마이그레이션 파일 위치: `supabase/migrations/add_images_to_diaries.sql`
- Storage 설정 파일: `supabase/migrations/create_diary_images_storage.sql`
