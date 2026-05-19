# Google Sign-In Setup - Step by Step Guide

## You are HERE ✅

You're already in **Supabase Dashboard** → **Authentication** → **Google Provider Settings**

The page shows:
- ✅ "Enable Google Sign-In" is already ON (blue toggle)
- ✅ Two redirect URLs that Supabase generated for you
- ❌ You need Google Client ID and Client Secret (the empty fields)

---

## Next Step: Get Google Client ID and Secret

### Step 1: Go to Google Cloud Console

1. **Open**: https://console.cloud.google.com
2. **Sign in** with your Google account (the one you want to use as admin)
3. You should see a dashboard

### Step 2: Create a Project (if you don't have one)

1. At the top, click **"Select a Project"**
2. Click **"NEW PROJECT"** button
3. Name it: `RadAI` (or any name you like)
4. Click **CREATE**
5. Wait for it to create (takes 30 seconds)
6. When done, the project will be selected automatically

### Step 3: Enable Google+ API

1. Search for **"Google+ API"** in the search bar at the top
2. Click on it when it appears
3. Click **ENABLE** button
4. Wait for it to enable (few seconds)

### Step 4: Create OAuth Credentials

1. On left sidebar, click **Credentials**
2. Click **"+ CREATE CREDENTIALS"** button (blue button at top)
3. Choose **"OAuth client ID"** from the dropdown

### Step 5: Configure OAuth Consent Screen (First Time Only)

If a screen says "Before creating your OAuth client ID, you need to configure the OAuth consent screen", do this:

1. Click **"CONFIGURE CONSENT SCREEN"** or go to **Consent Screen** tab
2. Choose **"External"** user type
3. Click **CREATE**
4. Fill in:
   - **App name**: `RadAI Copilot`
   - **User support email**: Use your email
   - **Developer contact**: Use your email
5. Click **SAVE AND CONTINUE** button
6. Skip Scopes - click **SAVE AND CONTINUE** again
7. Skip Test Users - click **SAVE AND CONTINUE** again
8. Review and click **BACK TO DASHBOARD**

### Step 6: Create OAuth Client ID (Resume)

Back to creating credentials:

1. Click **"+ CREATE CREDENTIALS"** again
2. Choose **OAuth client ID**
3. Select **"Web application"** from dropdown
4. Give it a name: `RadAI Web App`
5. In **Authorized redirect URIs** section, click **"ADD URI"** button
6. Copy this URL from Supabase and paste it:
   ```
   https://vqycjjkfqzmiueebmkkk.supabase.co/auth/v1/callback
   ```
7. Click **CREATE** button
8. A popup will show with:
   - **Client ID** (long string like: 123456789-abcdefg.apps.googleusercontent.com)
   - **Client Secret** (long random string)

### Step 7: Copy Client ID and Secret

1. **Copy** the **Client ID**
2. Go back to Supabase tab (keep Google tab open)
3. In the **"Google Client ID"** field, paste it
4. Go back to Google, **Copy** the **Client Secret**
5. In Supabase, paste it in the **"Google OAuth Client Secret"** field
6. Click **"Save changes"** button (blue button at bottom right)

---

## That's It! ✅

Once you click "Save changes" in Supabase:
- Google Sign-In is LIVE
- Users can now click "Continue with Google" button
- They'll be signed in automatically

---

## Summary of URLs You'll Need

From Supabase (already shown in the screenshot):
- **Authorised JavaScript origins**: `https://mri-scan.bolt.host`
- **Authorised redirect URI**: `https://vqycjjkfqzmiueebmkkk.supabase.co/auth/v1/callback`

These go into Google Cloud Console when asked.

---

## Troubleshooting

### "I can't find the fields to paste Client ID and Secret"
- Make sure toggle "Enable Google Sign-In" is ON (blue)
- Fields appear below the toggle

### "The fields are red and show an error"
- You might have pasted it wrong
- Clear the field and paste again
- No spaces before or after

### "It still doesn't work"
- Wait 2-3 minutes after saving (caching)
- Clear your browser cache (Ctrl+Shift+Delete)
- Hard refresh the page (Ctrl+Shift+R)
- Try in an incognito/private window

---

## Once Setup is Complete

Users can now:
1. Open RadAI login page
2. Click **"Continue with Google"** button
3. Sign in with their Google account
4. Automatically logged into RadAI!

No passwords needed. One-click login. Done!
