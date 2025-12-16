-- Add lat and lng columns to places table
ALTER TABLE places ADD COLUMN lat float8;
ALTER TABLE places ADD COLUMN lng float8;

-- Add checking constraint (optional, but good practice)
ALTER TABLE places ADD CONSTRAINT places_lat_check CHECK (lat >= -90 AND lat <= 90);
ALTER TABLE places ADD CONSTRAINT places_lng_check CHECK (lng >= -180 AND lng <= 180);
