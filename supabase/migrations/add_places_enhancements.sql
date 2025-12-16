-- 장소 관리 개선을 위한 필드 추가

-- 1. 즐겨찾기 필드 추가
ALTER TABLE public.places 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- 2. 장소 상세 정보 필드 추가
ALTER TABLE public.places 
ADD COLUMN IF NOT EXISTS operating_hours TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;

-- 3. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_places_favorite ON public.places(is_favorite);
CREATE INDEX IF NOT EXISTS idx_places_rating ON public.places(rating DESC);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category);
CREATE INDEX IF NOT EXISTS idx_places_visit_count ON public.places(visit_count DESC);
