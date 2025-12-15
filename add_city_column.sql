-- places 테이블에 city 컬럼을 추가하는 SQL문입니다.
-- Supabase 대시보드의 SQL Editor에서 실행해주세요.

ALTER TABLE places 
ADD COLUMN city text DEFAULT '시드니';
