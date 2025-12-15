-- city 컬럼 추가는 잘 완료되었습니다!
-- 이제 'market' 카테고리를 허용하기 위해 제약조건을 업데이트해야 합니다.

-- 1. 기존 체크 제약조건 삭제
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_category_check;

-- 2. 새로운 체크 제약조건 추가 ('market' 포함)
ALTER TABLE places 
ADD CONSTRAINT places_category_check 
CHECK (category IN ('tour', 'food', 'shop', 'medical', 'play', 'museum', 'market'));
