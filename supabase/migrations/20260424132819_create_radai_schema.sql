
/*
  # RadAI Copilot - Complete Database Schema

  ## Overview
  Creates all tables required for the RadAI Copilot radiology reporting platform.

  ## New Tables
  1. `profiles` - Extended user profile data linked to auth.users
     - name, role, specialty, preferences (preferred phrases, corrections)
     - reports_generated count, time_saved estimate

  2. `cases` - Patient cases managed by radiologists
     - patient_name, age, scan_type, notes, status
     - linked to user via user_id

  3. `reports` - Generated radiology reports linked to cases
     - structured_data (JSON), generated_text, edited_text
     - technique, findings, impression sections
     - user edits tracked for learning system

  4. `templates` - Custom report templates per user
     - name, description, structure (JSON array of sections)
     - conditions (JSON for conditional logic), is_default flag

  5. `macros` - Keyboard shortcut expansions per user
     - trigger (e.g. /normal), expansion (full text)

  6. `learning_data` - Tracks user corrections for adaptive AI
     - preferred_phrases, corrections, edit_patterns

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Profiles auto-created on user signup via trigger
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'radiologist',
  specialty text NOT NULL DEFAULT 'general',
  reports_generated integer NOT NULL DEFAULT 0,
  time_saved_minutes integer NOT NULL DEFAULT 0,
  dark_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name text NOT NULL DEFAULT '',
  patient_age integer,
  scan_type text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  priority text NOT NULL DEFAULT 'routine',
  modality text NOT NULL DEFAULT '',
  body_part text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cases"
  ON cases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases"
  ON cases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Report',
  input_text text NOT NULL DEFAULT '',
  structured_data jsonb NOT NULL DEFAULT '{}',
  technique text NOT NULL DEFAULT '',
  findings text NOT NULL DEFAULT '',
  impression text NOT NULL DEFAULT '',
  generated_text text NOT NULL DEFAULT '',
  edited_text text NOT NULL DEFAULT '',
  suggestions jsonb NOT NULL DEFAULT '[]',
  errors jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'draft',
  word_count integer NOT NULL DEFAULT 0,
  generation_time_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  scan_type text NOT NULL DEFAULT '',
  structure jsonb NOT NULL DEFAULT '[]',
  conditions jsonb NOT NULL DEFAULT '[]',
  is_default boolean NOT NULL DEFAULT false,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Macros table
CREATE TABLE IF NOT EXISTS macros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger text NOT NULL,
  expansion text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  description text NOT NULL DEFAULT '',
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, trigger)
);

ALTER TABLE macros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own macros"
  ON macros FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own macros"
  ON macros FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own macros"
  ON macros FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own macros"
  ON macros FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Learning data table
CREATE TABLE IF NOT EXISTS learning_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_phrases jsonb NOT NULL DEFAULT '[]',
  corrections jsonb NOT NULL DEFAULT '[]',
  scan_type_preferences jsonb NOT NULL DEFAULT '{}',
  style_preferences jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE learning_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning data"
  ON learning_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning data"
  ON learning_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning data"
  ON learning_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS cases_user_id_idx ON cases(user_id);
CREATE INDEX IF NOT EXISTS cases_created_at_idx ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON reports(user_id);
CREATE INDEX IF NOT EXISTS reports_case_id_idx ON reports(case_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS templates_user_id_idx ON templates(user_id);
CREATE INDEX IF NOT EXISTS macros_user_id_idx ON macros(user_id);
