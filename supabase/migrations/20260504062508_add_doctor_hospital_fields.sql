
/*
  # Add Doctor and Hospital Profile Fields

  ## Overview
  Adds professional details to the profiles table so that PDF reports include
  proper hospital letterhead, doctor credentials, and patient information.

  ## New Columns on `profiles`
  - `hospital_name` (text) - Hospital/clinic name for report header
  - `hospital_address` (text) - Hospital address
  - `hospital_phone` (text) - Hospital phone number
  - `doctor_credentials` (text) - e.g. "MD, DNB, FRCR"
  - `registration_number` (text) - Medical registration number
  - `designation` (text) - e.g. "Consultant Radiologist", "Associate Professor"
  - `department` (text) - e.g. "Department of Radiology"
  - `signature_line` (boolean) - Whether to include signature line on reports
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hospital_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hospital_name text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hospital_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hospital_address text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hospital_phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hospital_phone text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'doctor_credentials'
  ) THEN
    ALTER TABLE profiles ADD COLUMN doctor_credentials text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'registration_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_number text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'designation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN designation text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'department'
  ) THEN
    ALTER TABLE profiles ADD COLUMN department text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'signature_line'
  ) THEN
    ALTER TABLE profiles ADD COLUMN signature_line boolean NOT NULL DEFAULT true;
  END IF;
END $$;
