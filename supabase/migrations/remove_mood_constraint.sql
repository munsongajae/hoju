-- Remove mood check constraint to allow multi-select values (comma separated)
ALTER TABLE public.diaries DROP CONSTRAINT IF EXISTS diaries_mood_check;
