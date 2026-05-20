ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS accreditation_nabh boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accreditation_nabl boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accreditation_iso boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS default_scan_type text DEFAULT '',
ADD COLUMN IF NOT EXISTS report_language text DEFAULT 'english',
ADD COLUMN IF NOT EXISTS signature_style text DEFAULT 'text_only',
ADD COLUMN IF NOT EXISTS include_comparison_default boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_fazekas boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS registration_body text DEFAULT '',
ADD COLUMN IF NOT EXISTS registration_expiry date,
ADD COLUMN IF NOT EXISTS aerb_license text DEFAULT '',
ADD COLUMN IF NOT EXISTS custom_disclaimer text DEFAULT '';