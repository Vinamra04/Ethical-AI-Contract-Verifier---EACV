# Supabase Setup Guide

## Region
ap-south-1 (Mumbai)

## Step 1: Create Project
1. Go to https://supabase.com → New project
2. Name: `eacv`, Region: ap-south-1 (Mumbai)
3. Set a strong database password and save it
4. Wait ~2 minutes for initialization

## Step 2: Collect Credentials
From Project Settings → API:
- `SUPABASE_URL` → backend `.env`
- `SUPABASE_SERVICE_KEY` (service_role key) → backend `.env`
- `EXPO_PUBLIC_SUPABASE_URL` → mobile `.env.local`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (anon key) → mobile `.env.local`

## Step 3: Run Schema SQL
1. Go to SQL Editor in the Supabase dashboard
2. Paste and run the contents of `schema.sql`
3. Expected: "Success. No rows returned"

## Step 4: Create Storage Bucket
1. Go to Storage → New bucket
2. Name: `user-uploads`, Public: OFF
3. Click Create

## Step 5: Enable Google OAuth
1. Go to Authentication → Providers → Google
2. Enable it
3. Add your Google OAuth Client ID and Secret
   (from Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client)
4. Authorized redirect URI to add in Google Cloud Console:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
5. In Supabase → Authentication → URL Configuration → Redirect URLs, add:
   - `eacv:///` (production deep link)
   - `exp://*` (Expo Go development)

## Step 6: Test Authentication
The backend will validate tokens via the service key.
The mobile app uses the anon key for client-side auth.
