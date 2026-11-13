# Cardasks Mobile

Expo SDK 57 mobile app for iOS and Android. The first version supports signing in, creating a question card through the existing web API, and sharing its link with the native share sheet.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to the same public Supabase values used by the web app.
3. Keep `EXPO_PUBLIC_SITE_URL` pointed at the deployed website, or set it to the local Next.js URL while developing both apps.
4. Run `npm install` and `npm start` from this directory.
5. Open the QR code with Expo Go, or press `a`/`i` in the Expo terminal for an Android/iOS simulator.

## Android map setup

1. In Google Cloud Console, enable billing and the **Maps SDK for Android** for a project.
2. Create an API key restricted to the Android app `com.cardasks.mobile` and the Maps SDK for Android. Add the app's signing-certificate SHA-1 when creating a development or release build.
3. Put the key in `mobile/.env.local` as `GOOGLE_MAPS_API_KEY`. Do not commit that file or paste the key into chat.
4. Rebuild the native app with EAS or `npx expo run:android`; changing the key does not update an already installed binary. Expo Go uses its own native configuration, so use a development build to verify this key.

New accounts can be created on the existing website at `/kayit`; sign in to the mobile app with that account afterward.