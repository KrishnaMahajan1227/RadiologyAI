# Google Sign-In Setup Checklist

Follow this checklist step by step. Check off each item as you complete it.

---

## PHASE 1: Google Cloud Console Setup

### Step 1: Open Google Cloud
- [ ] Go to https://console.cloud.google.com
- [ ] Sign in with your Google account
- [ ] See the Google Cloud dashboard

### Step 2: Create a Project
- [ ] Click "Select a Project" (top left area)
- [ ] Click "NEW PROJECT" button
- [ ] Type name: `RadAI`
- [ ] Click "CREATE"
- [ ] Wait for project to be created (30 seconds)
- [ ] Project is now selected

### Step 3: Enable Google+ API
- [ ] Search for "Google+ API" in search bar
- [ ] Click on "Google+ API" when it appears
- [ ] Click "ENABLE" button
- [ ] Wait for API to enable

### Step 4: Set Up OAuth Consent Screen (First Time)
- [ ] Go to "Credentials" in left sidebar
- [ ] Click "CREATE CREDENTIALS"
- [ ] Choose "OAuth client ID"
- [ ] If it says "Configure OAuth consent screen", click that link
- [ ] Choose "External" user type
- [ ] Click "CREATE"
- [ ] Fill in:
  - [ ] App name: `RadAI Copilot`
  - [ ] User support email: your email
  - [ ] Developer contact: your email
- [ ] Click "SAVE AND CONTINUE"
- [ ] Skip scopes: click "SAVE AND CONTINUE"
- [ ] Skip test users: click "SAVE AND CONTINUE"
- [ ] Click "BACK TO DASHBOARD"

### Step 5: Create OAuth Client ID
- [ ] Left sidebar → "Credentials"
- [ ] Click "CREATE CREDENTIALS"
- [ ] Choose "OAuth client ID"
- [ ] Select "Web application"
- [ ] Name: `RadAI Web App`
- [ ] Click "ADD URI" in "Authorized redirect URIs" section
- [ ] Paste this URL:
  ```
  https://vqycjjkfqzmiueebmkkk.supabase.co/auth/v1/callback
  ```
- [ ] Click "CREATE"
- [ ] You see a popup with Client ID and Client Secret

### Step 6: Save Your Credentials
- [ ] Copy **Client ID** from popup
  - [ ] Save it somewhere (email, notepad, etc.)
- [ ] Copy **Client Secret** from popup
  - [ ] Save it somewhere safe
- [ ] Keep Google Cloud tab open (you might need it again)

---

## PHASE 2: Supabase Configuration

### Step 1: Go Back to Supabase
- [ ] Open/switch to your Supabase tab
- [ ] You should see "Google Provider Settings" page
- [ ] Toggle "Enable Google Sign-In" should be ON (blue)

### Step 2: Enter Google Credentials
- [ ] Find "Google Client ID" field
- [ ] Paste your Client ID
- [ ] Find "Google OAuth Client Secret" field
- [ ] Paste your Client Secret
- [ ] Check for any red error messages - if yes, verify you pasted correctly

### Step 3: Review Redirect URLs
- [ ] You should see two URLs already filled:
  - [ ] "Authorised JavaScript origins"
  - [ ] "Authorised redirect URI" (this matches the URL you added to Google)

### Step 4: Save Changes
- [ ] Scroll to bottom
- [ ] Click "Save changes" button (blue button)
- [ ] Wait for confirmation message
- [ ] Confirm it says "Changes saved" or similar

---

## PHASE 3: Verification

### Test Google Sign-In
- [ ] Open your RadAI application login page
- [ ] Click "Continue with Google" button
- [ ] You should be redirected to Google login
- [ ] Sign in with your Google account
- [ ] You should be redirected back to RadAI dashboard
- [ ] You are now logged in

### Success!
- [ ] If above worked → **DONE!** 🎉
- [ ] If not working → Check troubleshooting below

---

## TROUBLESHOOTING

### Issue: "refused to connect" or "Connection refused"
- [ ] Verify you saved changes in Supabase
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Wait 2-3 minutes
- [ ] Try again

### Issue: "Provider google not enabled"
- [ ] Go back to Supabase Google Provider Settings
- [ ] Make sure toggle is ON (blue)
- [ ] Check that you pasted Client ID and Secret
- [ ] Click "Save changes"
- [ ] Wait and try again

### Issue: Red text under fields in Supabase
- [ ] You pasted something incorrectly
- [ ] Go to Google Cloud Console
- [ ] Copy Client ID again (exactly as shown)
- [ ] Clear field in Supabase and paste again
- [ ] Same for Client Secret
- [ ] Save changes

### Issue: Redirect to Google works but error after login
- [ ] Make sure redirect URL in Google matches exactly:
  - [ ] `https://vqycjjkfqzmiueebmkkk.supabase.co/auth/v1/callback`
- [ ] Check spelling (including the forward slash at end)
- [ ] If wrong, go back to Google Cloud and fix it
- [ ] Save in Google, then save in Supabase again

### Issue: Still not working
- [ ] Close all browser tabs
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Restart browser
- [ ] Try again
- [ ] If still not working, double-check all URLs and credentials

---

## SUPPORT

If you get stuck:

1. **Google Cloud Issue?**
   - Go to: https://console.cloud.google.com
   - Check your credentials

2. **Supabase Issue?**
   - Go to: https://app.supabase.com
   - Check Authentication → Google Provider Settings

3. **RadAI Issue?**
   - Hard refresh: Ctrl+Shift+R
   - Try in private/incognito window
   - Check browser console for errors (F12)

---

## DONE!

Once setup is complete:
- ✅ Users can click "Continue with Google"
- ✅ One-click sign-in
- ✅ No passwords needed
- ✅ Google handles all security

**Congratulations on setting up Google Sign-In!** 🎉

