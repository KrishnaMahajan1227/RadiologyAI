/*
  # Add missing `clinical_information` column to `reports`

  ## Problem
  The report editor (ReportWorkspace) reads/writes a "Clinical Information"
  section (`clinical_information` field) on every generate/save/load, but the
  `reports` table was never given a matching column. Every `Save` therefore
  failed at the database level with a "column not found" error (visible in
  the browser console as `Save failed: {...}` and no report was ever
  persisted, even though generation/download worked fine).

  ## Change
  Adds `reports.clinical_information text NOT NULL DEFAULT ''`, matching the
  existing `technique` / `findings` / `impression` columns. No data loss —
  this only adds a new column with a safe default.
*/

ALTER TABLE reports ADD COLUMN IF NOT EXISTS clinical_information text NOT NULL DEFAULT '';
