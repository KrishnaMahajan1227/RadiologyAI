
/*
  # Add patient detail fields to cases table

  ## Overview
  Adds fields needed for proper radiology report formatting:
  - patient_gender (text) - Male/Female/Other
  - patient_cr_number (text) - CR/IP number for hospital records
  - referring_doctor (text) - Name of referring physician

  ## Security
  - No RLS changes needed, existing policies cover these columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'patient_gender'
  ) THEN
    ALTER TABLE cases ADD COLUMN patient_gender text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'patient_cr_number'
  ) THEN
    ALTER TABLE cases ADD COLUMN patient_cr_number text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'referring_doctor'
  ) THEN
    ALTER TABLE cases ADD COLUMN referring_doctor text NOT NULL DEFAULT '';
  END IF;
END $$;
