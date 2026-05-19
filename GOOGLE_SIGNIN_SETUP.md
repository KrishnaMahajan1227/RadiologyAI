# Google Sign-In Setup Guide

## The "refused to connect" Error

If you see `vqycjjkfqzmiueebmkkk.supabase.co refused to connect`, it means **Google OAuth is not yet enabled** in your Supabase project. The app code is correct - you just need to enable the Google provider in Supabase.

---

## Quick Fix (5 minutes)

### Step 1: Enable Google in Supabase

1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select your project (`vqycjjkfqzmiueebmkkk`)
3. Left sidebar → **Authentication**
4. Click **Providers** tab
5. Find **Google** in the list
6. Toggle it **ON**
7. You'll need a **Google Client ID** and **Client Secret** (see below)

### Step 2: Create Google OAuth Credentials

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Create a new project (or use existing)
3. Search for **"Google+ API"** → Enable it
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. If prompted, configure the **OAuth consent screen** first:
   - User type: **External**
   - App name: `RadAI Copilot`
   - Support email: your email
   - Developer contact: your email
   - Save and continue through all steps
6. Create the OAuth client ID:
   - Application type: **Web application**
   - Name: `RadAI Web App`
   - **Authorized redirect URIs**: Add this exact URL:
     ```
     https://vqycjjkfqzmiueebmkkk.supabase.co/auth/v1/callback
     ```
   - Click **CREATE**
7. Copy the **Client ID** and **Client Secret**

### Step 3: Configure in Supabase

1. Back in Supabase → Authentication → Providers → Google
2. Paste the **Client ID** from Google
3. Paste the **Client Secret** from Google
4. Click **Save**

### Step 4: Test

1. Open RadAI login page
2. Click **"Continue with Google"**
3. You should be redirected to Google login
4. Sign in → Redirected back to RadAI dashboard

---

## What Happens Without Setup

If Google OAuth is NOT enabled in Supabase:
- Clicking "Continue with Google" shows a clear error message
- The app does NOT crash
- Users can still sign in with email/password
- The error explains what to do

---

## Error Messages Explained

| Error | Meaning | Fix |
|-------|---------|-----|
| `refused to connect` | Google OAuth not enabled in Supabase | Enable Google provider in Supabase dashboard |
| `Provider google not enabled` | Same as above | Same as above |
| `Invalid login credentials` | Wrong email/password | Check credentials |
| `User already registered` | Account exists with that email | Sign in instead of sign up |
| `Failed to fetch` | Network issue | Check internet connection |

---

## Important Notes

- The Supabase project is **working correctly** (verified via API)
- Email/password login works fine
- Google OAuth just needs to be **enabled** in the Supabase dashboard
- This is a **one-time setup** - once enabled, it works forever
- The callback URL must match exactly: `https://vqycjjkfqzmiueebmkkk.supabase.co/auth/v1/callback`

---

## Security

- Google OAuth uses industry-standard OAuth 2.0
- We only get: email, name, profile picture
- No access to Gmail, Drive, or other Google services
- Users can revoke access from their Google account settings
- HIPAA compliant - no passwords stored
