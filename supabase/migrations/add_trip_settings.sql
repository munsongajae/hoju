-- ALTER trips table to add new fields for Settings
-- Run this in Supabase SQL Editor if the table already exists

ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS family_count integer default 4,
ADD COLUMN IF NOT EXISTS cities text default '시드니';
