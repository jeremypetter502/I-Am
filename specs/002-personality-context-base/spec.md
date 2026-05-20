# Base Personality Context: Job & Basic Metadata (Spec)

## Purpose

Add a small, optional `base` section to exported ContextFiles that captures brief, non-sensitive background information useful for personalization and system prompts. The primary new capability is allowing users to search for and select a job/role using the O*NET-SOC taxonomy.

This spec defines required fields, UI flows, validation rules, privacy considerations, and example payloads for the `profile.base` block.

For the psychometric communication preferences module (Merrill-Reimann + IAM compact encoding), see `specs/002-personality-context-base/communication-module.spec.md`.
For schema/proto contract deltas for this feature set, see `specs/002-personality-context-base/contextfile-contract-changes.spec.md`.

## Goals

- Enable users to add a job/role from the O*NET-SOC taxonomy (canonical occupation code and label).
- Capture minimal contextual metadata: company/organization (optional), job title (text, optional), years_experience (optional), education_level (optional), timezone, locale, and short_bio (optional).
- Ensure privacy-first defaults: all fields optional, user-consent before export/sharing, and easy removal of base block.
- Provide a resilient UI: search + typeahead for O*NET jobs, fuzzy matching, and free-text fallback.

## Data model

Add under `profile.base` (all properties optional):

- `onet`: object
  - `soc_code`: string — official O*NET-SOC code (e.g. "15-1252")
  - `title`: string — canonical O*NET job title (e.g. "Software Developers")
  - `version`: string — optional O*NET taxonomy version/date
- `job_title`: string — free-text job title entered by user
- `company`: string — company or organization name
- `years_experience`: number — integer or decimal years
- `education_level`: string — enum: ["high_school","associate","bachelor","master","doctorate","other"]
- `timezone`: string — IANA tz identifier (e.g. "America/Los_Angeles")
- `locale`: string — language/locale tag (e.g. "en-US")
- `communication_style`: string — optional high-level preference label for manual override (e.g. "concise","detailed","narrative")
- `short_bio`: string — up to 280 characters

JSON example:

```json
"profile": {
  "id": "local-123",
  "summary": "...",
  "scores": {...},
  "modules": {...},
  "base": {
    "onet": { "soc_code": "15-1252", "title": "Software Developers", "version":"2022" },
    "job_title": "Frontend Engineer",
    "company": "Acme Corp",
    "years_experience": 4,
    "education_level": "bachelor",
    "timezone": "America/Los_Angeles",
    "locale": "en-US",
    "communication_style": "concise",
    "short_bio": "Builds delightful web UIs."
  }
}
```

## UI/UX Requirements

- Add an optional "Add basic context" section in Review/Survey flows.
- Provide a job search input with typeahead; results show O*NET title and SOC code.
- Job search behavior:
  - Local static index (preferred) bundled with the app (truncated O*NET labels) OR remote fetch to an O*NET mirror API when available.
  - Fuzzy search, prefix and token match; rank by relevance.
  - Allow selecting a result to populate `profile.base.onet` and suggest a `job_title` string.
  - Allow manual override or free-text entry when no match is suitable.
- Other fields: simple inputs (company), numeric input (years), select (education_level), timezone select (IANA), locale from browser default.
- Privacy CTA: clearly indicate `profile.base` will be included in exports, with a toggle to exclude it before export.

## Validation rules

- All fields optional; validators where applicable:
  - `onet.soc_code` — match regex `^\d{2}-\d{4}$` or known SOC patterns.
  - `years_experience` — non-negative number, max reasonable cap (e.g., 80).
  - `education_level` — one of the enum values.
  - `timezone` — must be a valid IANA tz string if present.
  - `short_bio` — max 280 chars.

## O*NET integration

- Preferred approach: ship a minimal, compressed local index (SOC code, title, aliases) for client-side search to avoid remote lookups and protect privacy.
- Alternative: call a trusted remote endpoint (self-hosted mirror or official O*NET services) for live lookup.
- Provide an importer script to convert O*NET-SOC CSV/JSON into the app's compact index (scripts/onet/import_onet.js — implementation task).

## Serialization and Export

- The serializer must include `profile.base` in ContextFiles when present.
- UI export flow should present an explicit toggle: "Include basic context (job, company)" — default off for sharing.

## Privacy & Security

- `profile.base` may contain identifiable information (company, job title). Default to not sharing.
- Exports should include a short notice in the preamble and in UI flows when `profile.base` is present.

## Backwards compatibility

- If `profile.base` is absent, nothing changes. Additions must not break existing parsers.

## Open questions / decisions needed

- Should the app bundle a local O*NET index by default or fetch remotely? Recommendation: bundle a small index with the app and provide an updater script.
- What size of O*NET index to include? Recommendation: include SOC code + canonical title + a handful of aliases only.

## Implementation tasks (high-level)

1. Add `profile.base` to schema and proto (spec changes completed here).
2. Build `scripts/onet/import_onet.js` to generate compact index JSON.
3. Add client-side `src/lib/baseContext/index.js` for search + normalization.
4. Add UI component `src/ui/components/BaseContextPicker.svelte` with typeahead.
5. Wire serializer to include `profile.base` and update export UI to toggle inclusion.
6. Add unit tests for validation, serialization, and UI interactions.

## Example UI mock

- Search box placeholder: "Search job titles (e.g. 'software engineer')"
- Result row: `Software Developers (15-1252)` — click to select.

---

Spec author: I-Am team
Date: 2026-05-18
