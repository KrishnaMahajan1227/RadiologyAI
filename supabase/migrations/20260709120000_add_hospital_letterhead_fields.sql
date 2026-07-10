/*
  # Add Hospital Letterhead Fields

  ## Overview
  Adds the remaining details needed to render a proper professional hospital
  letterhead (logo, contact details, clinical establishment registration
  number) on generated radiology reports.

  ## New Columns on `profiles`
  - `hospital_email` (text) - Hospital/centre contact email shown on report header
  - `hospital_website` (text) - Hospital/centre website shown on report header
  - `hospital_logo_url` (text) - Public URL to the hospital/centre logo image,
    rendered on the report letterhead
  - `hospital_registration_number` (text) - Clinical Establishment / diagnostic
    centre registration number, shown in the report footer for compliance
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS hospital_email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS hospital_website text DEFAULT '',
  ADD COLUMN IF NOT EXISTS hospital_logo_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS hospital_registration_number text DEFAULT '';
