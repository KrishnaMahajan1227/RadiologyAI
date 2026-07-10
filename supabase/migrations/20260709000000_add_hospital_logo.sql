ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS hospital_logo_url text DEFAULT '';
