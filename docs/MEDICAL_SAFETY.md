# Medical safety checklist

## Implemented safeguards (verified by automated tests)
- [x] Mandatory warning displayed verbatim: *"Possible stroke symptoms are a medical emergency. Call emergency services immediately. Do not wait for symptoms to disappear."* (home, stroke test, emergency, onboarding, about).
- [x] Emergency instructions need **no** registration, questionnaire, AI or internet; reachable from every screen header and before onboarding.
- [x] Any reported sudden sign, "signs went away" (possible TIA) or "not sure" → emergency screen immediately. No outcome ever says "no stroke"; an empty report shows "does NOT rule out a stroke".
- [x] Never recommends aspirin, anticoagulants, self-medication or waiting; explicit "Do NOT" list; test scans all translations for dangerous phrasing.
- [x] Call button opens the native dialer via `tel:`; the app never claims a call was placed; manual-dial fallback text.
- [x] Country-specific numbers; unknown country → no assumed number, labelled options + manual selection; dataset versioned and marked *pending official review* in the UI.
- [x] No facial recognition, voice analysis or AI diagnosis.
- [x] Prevention module: no risk score; "topics to discuss with a professional"; never start/stop/change medication.
- [x] Tracker: disclaimer that values are unverified; no interpretation, no normal ranges, no flags.
- [x] AI assistant: educational only, grounded in approved KB, references shown, emergency language detection (EN/FR/DE) on device and server, medication refusal, offline FAQ fallback.

## Clinical & regulatory tasks requiring HUMAN review before publication
1. **Emergency numbers**: verify every entry of `constants/emergencyNumbers.ts` against the official source, fill `lastVerified`, set `verificationStatus: 'verified'`; define a re-verification cadence (≤ 12 months). Decide the policy for France (15 vs 112) and other dual-number countries with local emergency physicians.
2. **Medical content review** (EN/FR/DE) by neurologists / emergency physicians: emergency steps (incl. recovery-position wording), BE-FAST texts, education, prevention recommendations, assistant KB answers. Professional medical translation review.
3. **References**: validate every URL in `constants/sources.ts` and its mapping to KB entries.
4. **Regulatory qualification**: confirm the app is *not* a medical device under EU MDR 2017/745 (MDCG 2019-11), US FDA (general wellness / CDS guidance), UK MHRA — the symptom-reporting flow must be assessed specifically. Keep intended-use statement consistent with store listings.
5. **Usability testing** with older adults, caregivers and stroke survivors (incl. aphasia, low vision, screen readers; WCAG 2.2 AA audit).
6. **GDPR / HIPAA-like obligations**: privacy policy, DPIA, data-processing agreements (Supabase, AI provider), hosting region (EU), retention policy, DPO contact.
7. **AI assistant validation**: red-team the emergency/medication filters in all languages, evaluate grounding/hallucination rate, define monitoring; decide whether to keep the online mode at launch.
8. **Clinical governance**: incident reporting process, content versioning & sign-off workflow (`health_education_content.review_status`), periodic review.
