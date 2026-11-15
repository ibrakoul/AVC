# STROKE GUARD AI — *Recognize. React. Prevent.*

Free, ad-free, international stroke **awareness, emergency-orientation and prevention** app for iOS and Android
(Expo SDK 58 · React Native 0.88 · TypeScript strict · Expo Router).

> ⚠️ **Not a medical device.** The app does not diagnose, detect, rule out or predict a stroke.
> It is not clinically validated or certified. Medical content and emergency numbers **must be reviewed by
> qualified professionals before any public release** — see [docs/MEDICAL_SAFETY.md](docs/MEDICAL_SAFETY.md).

## What works today

| Area | Status |
|---|---|
| Emergency screen (country number, native `tel:` dialer, offline instructions, onset / last-known-well times, responder checklist, contacts) | ✅ offline, no account, reachable before onboarding |
| FAST / BE-FAST interactive guide; any reported sign, "signs went away" or "not sure" → emergency screen immediately | ✅ |
| Stroke education (ischemic, hemorrhagic, TIA, "symptoms gone? still call") | ✅ offline |
| Prevention questionnaire (10 factors) + dashboard (topics to discuss, education) — **no risk score** | ✅ local SQLite |
| Health tracker (BP, HR, glucose, cholesterol, weight, activity, sleep), history, trend charts, export, delete | ✅ local SQLite |
| Family: emergency contacts CRUD, shareable BE-FAST guide, optional local reminders | ✅ |
| Stroke Guard Assistant: offline FAQ (reviewed KB) + optional AI via secure Edge Function; emergency & medication filters | ✅ FAQ / 🔑 AI needs credentials |
| Optional account (sign up/in/out, reset, consent records, cloud sync, account deletion) | 🔑 needs Supabase |
| Privacy: consents, full data export, delete local data | ✅ |
| Languages EN / FR / DE (key parity enforced by tests) · light/dark mode · large touch targets | ✅ |

## Project structure

```
app/                 Expo Router screens: (tabs)/ home · stroke-test · prevention · health-tracker · profile
                     emergency/ education/ prevention/ tracker/ family/ settings/ auth/ onboarding · language · assistant
components/          common/ (design system) · emergency/ · health/
features/            stroke/ prevention/ tracker/ assistant/ family/ authentication/   (pure, tested logic)
services/            emergency/ storage/ (SQLite, settings) · supabase/ · ai/ · api/ (sync, export, share) · notifications/
locales/{en,fr,de}/  translation.json  (all user-facing text)
constants/           theme (design tokens) · emergencyNumbers (versioned offline dataset) · sources · config
supabase/            migrations/ (schema + RLS) · functions/ (assistant, delete-account) · tests/ (pgTAP) · seed.sql
tests/               Jest + React Native Testing Library (unit + full-router screen tests)
.maestro/            Maestro end-to-end flows
docs/                Security & medical-safety checklists
```

## Installation & local development

Requirements: Node 20+ (tested with 22), npm, and for native builds Xcode (iOS) / Android Studio, or EAS.

```bash
npm install
cp .env.example .env            # optional — leave empty to run fully offline without accounts/AI
npm start                       # Expo dev server (press i / a / w)
npm run typecheck               # tsc --noEmit (strict)
npm test                        # Jest suite
```

The app uses native modules (SQLite, SecureStore, notifications) available in **Expo Go**; for production
use a development build: `npm run android` / `npm run ios` (runs `expo run:*`, generating `android/` and `ios/`
via Continuous Native Generation — do not edit those folders by hand; configure `app.json` instead).

## Builds (EAS)

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure          # first time: links the project id
# Android
npx eas-cli@latest build -p android --profile preview      # installable APK
npx eas-cli@latest build -p android --profile production   # AAB for Google Play
# iOS (requires an Apple Developer account)
npx eas-cli@latest build -p ios --profile preview          # internal distribution
npx eas-cli@latest build -p ios --profile production       # App Store
npx eas-cli@latest submit -p ios|android
```

Bundle identifiers: `org.strokeguard.app` (change in `app.json` before publishing).
Set `EXPO_PUBLIC_*` variables as EAS environment variables for cloud builds.

## Backend (optional): Supabase

```bash
npm i -g supabase                    # or use npx supabase
supabase start                       # local stack (Docker)
supabase db reset                    # applies migrations + seed
supabase test db                     # pgTAP RLS tests (supabase/tests/database)
supabase link --project-ref <ref> && supabase db push
supabase secrets set ANTHROPIC_API_KEY=... ASSISTANT_MODEL=claude-opus-5-5
supabase functions deploy assistant
supabase functions deploy delete-account
```

Then set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` and `EXPO_PUBLIC_ASSISTANT_ENABLED=true`.
Only the **anon** key goes in the app. The service-role key and the AI key exist only server-side.

Tables: `profiles`, `user_preferences`, `health_measurements`, `prevention_questionnaires`, `emergency_contacts`,
`consent_records` (append-only), `health_education_content` (public read of *approved* rows only). UUID PKs,
timestamps, indexes, CHECK constraints, `on delete cascade` from `auth.users`, RLS with `auth.uid()` on every user table.

### AI assistant
`supabase/functions/assistant` filters emergency / medication requests **before** calling the model, grounds the model
exclusively in `supabase/functions/_shared/knowledgeBase.json` (generated from the reviewed locale files by
`node scripts/build-assistant-kb.mjs`; a test fails if it is stale), validates output with a JSON schema and keeps only
known source ids. Model: `claude-opus-5-5` by default (override with `ASSISTANT_MODEL`), low effort, with the API's
server-side refusal fallback enabled. Without credentials or consent the app uses the offline FAQ — never a broken chatbot.

## Tests

* `npm test` — **14 suites, 174 tests, all passing** (last run on 2026-11-15). Covers: emergency rendering, number
  selection per country, `tel:` link & dialer failure, unknown country (no 112 assumption), FAST/BE-FAST navigation,
  each sudden-sign scenario (face, arm, speech, vision, balance), symptoms disappeared, "not sure", offline mode,
  user without account, onboarding not blocking emergency, language switching & translation parity, health data entry /
  validation / deletion, contacts, questionnaire, auth flows (mocked client), database permissions (static migration
  checks), AI emergency/medication safety, FAQ fallback, server KB sync, absence of secrets in app code.
* `supabase test db` — live RLS checks (cross-user read/write denied, anon reads approved education only). *Requires Docker.*
* `maestro test .maestro` — device E2E flows. *Requires a simulator/device with the app installed.*

## Remaining integrations requiring credentials
1. Supabase project (URL + anon key) → accounts, cloud sync, consent audit, account deletion.
2. `ANTHROPIC_API_KEY` as Supabase secret → online AI assistant.
3. EAS / Apple Developer / Google Play accounts → signed builds and store submission.
4. (Optional) Push notifications are **not** used; reminders are local only.

See [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md) and [docs/MEDICAL_SAFETY.md](docs/MEDICAL_SAFETY.md).
