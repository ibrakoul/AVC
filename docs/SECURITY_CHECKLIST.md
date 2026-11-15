# Security & privacy checklist

| # | Control | Status |
|---|---|---|
| 1 | No secrets in the app bundle: only `EXPO_PUBLIC_SUPABASE_ANON_KEY`; service-role & AI keys only in Edge Function env (test `no secrets in the mobile app`) | ✅ |
| 2 | RLS enabled on every table; user tables restricted to `auth.uid()`; education table read-only & approved-only | ✅ (static test + pgTAP) |
| 3 | `on delete cascade` from `auth.users` → account deletion removes all cloud data | ✅ |
| 4 | Account deletion via server function that identifies the caller from their JWT (never from the request body) | ✅ |
| 5 | Auth session stored in Keychain/Keystore (Expo SecureStore, chunked) | ✅ |
| 6 | Health data local-first (SQLite); cloud sync only with explicit, revocable consent; consent audit trail append-only | ✅ |
| 7 | No ads, no analytics/tracking SDKs, no precise location; location/camera/microphone permissions explicitly removed on Android | ✅ |
| 8 | AI requests contain only the question + language (no user id, no health data); input length capped | ✅ |
| 9 | Input validation client-side and DB `CHECK` constraints server-side | ✅ |
| 10 | Corrupted local storage is sanitised (settings, questionnaire) | ✅ |
| 11 | Data export (access/portability) and local deletion available without account | ✅ |
| 12 | Password minimum 8 chars, email confirmation enabled (`supabase/config.toml`); reset does not reveal account existence | ✅ |
| 13 | SQLite on-device encryption (SQLCipher) | ⏳ to evaluate — currently relies on OS sandbox + device encryption |
| 14 | CORS on Edge Functions is `*` (mobile clients) — restrict if a web client is published | ⏳ |
| 15 | Rate limiting of the assistant function (per IP / per user) | ⏳ to configure at the gateway |
| 16 | Penetration test, dependency audit (`npm audit` reports moderate dev-dependency advisories), DPIA (GDPR art. 35) | ⏳ human task |
