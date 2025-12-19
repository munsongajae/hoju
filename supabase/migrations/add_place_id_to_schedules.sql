-- Add place_id column to schedules table for linking schedules with places
ALTER TABLE public.schedules 
ADD COLUMN IF NOT EXISTS place_id UUID REFERENCES public.places(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_schedules_place_id ON public.schedules(place_id);
