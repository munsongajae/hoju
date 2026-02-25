-- Remove mood column from diaries (오늘의 기분 기능 완전 제거)
ALTER TABLE public.diaries
  DROP COLUMN IF EXISTS mood;

