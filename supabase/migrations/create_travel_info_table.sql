-- Create travel_info table for storing travel information by country/city
CREATE TABLE IF NOT EXISTS public.travel_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_code TEXT NOT NULL,
    city_code TEXT NOT NULL,
    section TEXT NOT NULL, -- transport, culture, festivals, conversation, links
    item_index INTEGER NOT NULL, -- index within the section
    title TEXT NOT NULL,
    date TEXT, -- for festivals/events
    content JSONB, -- array of strings or array of link objects
    icon TEXT, -- icon name from lucide-react
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(country_code, city_code, section, item_index)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_travel_info_location ON public.travel_info(country_code, city_code);
CREATE INDEX IF NOT EXISTS idx_travel_info_section ON public.travel_info(section);

-- Enable RLS
ALTER TABLE public.travel_info ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow everyone to read travel_info" ON public.travel_info;
DROP POLICY IF EXISTS "Allow authenticated users to read travel_info" ON public.travel_info;
DROP POLICY IF EXISTS "Allow authenticated users to insert travel_info" ON public.travel_info;
DROP POLICY IF EXISTS "Allow authenticated users to update travel_info" ON public.travel_info;
DROP POLICY IF EXISTS "Allow authenticated users to delete travel_info" ON public.travel_info;
DROP POLICY IF EXISTS "Allow anonymous users to insert travel_info" ON public.travel_info;

-- Create policy: Allow everyone to read (public travel info)
CREATE POLICY "Allow everyone to read travel_info"
    ON public.travel_info
    FOR SELECT
    TO public
    USING (true);

-- Create policy: Allow all authenticated users to insert
CREATE POLICY "Allow authenticated users to insert travel_info"
    ON public.travel_info
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy: Allow all authenticated users to update
CREATE POLICY "Allow authenticated users to update travel_info"
    ON public.travel_info
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy: Allow all authenticated users to delete
CREATE POLICY "Allow authenticated users to delete travel_info"
    ON public.travel_info
    FOR DELETE
    TO authenticated
    USING (true);

-- Allow anonymous users to delete (for initial data management)
-- This can be removed after initial data is loaded
CREATE POLICY "Allow anonymous users to delete travel_info"
    ON public.travel_info
    FOR DELETE
    TO anon
    USING (true);

-- Allow anonymous users to insert (for initial data seeding)
-- This can be removed after initial data is loaded
CREATE POLICY "Allow anonymous users to insert travel_info"
    ON public.travel_info
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_travel_info_updated_at ON public.travel_info;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_travel_info_updated_at
    BEFORE UPDATE ON public.travel_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();




