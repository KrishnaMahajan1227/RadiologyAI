/*
  # Subscription / Freemium plan fields

  ## Overview
  Adds the columns needed to support a freemium model:
    - 10 free report generations per user
    - Paid plans: monthly / yearly / enterprise (₹780/month, billed via UPI/manual
      invoicing for now — payment gateway to be wired up in a later migration)
    - A single unrestricted demo account used for sales demos

  ## Changes
  1. `profiles.plan` — 'free' | 'monthly' | 'yearly' | 'enterprise', defaults to 'free'
  2. `profiles.plan_expires_at` — when the current paid plan lapses (null = never
     expires, e.g. enterprise / manually provisioned)
  3. `profiles.is_unlimited` — manual override flag (used for the demo account and
     any account an admin wants to whitelist)
  4. Existing `reports_generated` (already present) continues to be used as the
     free-tier usage counter — no new counter needed.
  5. Backfills `is_unlimited = true` for the existing demo account if it has
     already signed up, and updates the new-user trigger so any future signup
     under that email is unlimited automatically.

  ## Security
  No RLS changes needed — these columns are covered by the existing
  "Users can view/update own profile" policies on `profiles`.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_unlimited boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_plan_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check
      CHECK (plan IN ('free', 'monthly', 'yearly', 'enterprise'));
  END IF;
END $$;

-- Backfill: mark the existing demo/sales-demo account as unlimited, if it already exists
UPDATE profiles
SET is_unlimited = true
WHERE id IN (
  SELECT id FROM auth.users WHERE lower(email) = 'mahajankrishna2212@gmail.com'
)
AND is_unlimited = false;

-- Keep the auto-create-profile-on-signup trigger in sync so a fresh signup
-- under the demo email is unlimited from the start too.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, is_unlimited)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    lower(new.email) = 'mahajankrishna2212@gmail.com'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
