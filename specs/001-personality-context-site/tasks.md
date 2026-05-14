# tasks.md

Phase 1: Setup

- [X] T001 Create project skeleton and placeholders: create files `src/lib/scorer/ipipScorer.ts`, `src/lib/scorer/index.ts`, `src/lib/serializer/toContextFile.ts`, `src/lib/serializer/toPbtxt.ts`, `src/lib/types.ts`, `src/lib/importer/index.ts`, `src/lib/changeSummary/index.ts` (one-line placeholder exports in each file).

- [X] T002 [P] Add dev tool configs and scripts: ensure `package.json` has `validate:json`, `test`, and `dev` scripts; add `vitest.config.ts` at project root and placeholder `tsconfig.json` with `strict: true`.

Phase 2: Foundational (blocking prerequisites)

- [X] T003 Install and verify dev dependencies locally: run `npm ci` and confirm `ajv`, `ajv-formats`, `protobufjs`, and `vitest` are installed. (no file change)

- [ ] T004 [P] Add protobufjs workflow support: create `src/lib/serializer/toPbtxt.ts` that loads `specs/001-personality-context-site/contextfile.proto` via protobufjs and exposes `toPbtxt(json): string` and `fromPbtxt(text): json`.

User Story phases

User Story 1 (P1) — Core IPIP flow (MVP)

- [X] T005 [US1] Implement IPIP scorer: `src/lib/scorer/ipipScorer.ts` — function `scoreIpip(responses: number[50]) => { raw: {O,C,E,A,N}, normalized: {O,C,E,A,N} }`. Use reverse-keying indices from `specs/questions/ipip_50_respondent.txt` and scoring rules in spec.md.

- [X] T006 [US1] [P] Add unit test for IPIP scorer: `tests/unit/ipipScorer.test.ts` — include at least one known-response vector and expected normalized outputs (use example in `specs/001-personality-context-site/example.json`).

- [X] T007 [US1] Implement ContextFile serializer (JSON): `src/lib/serializer/toContextFile.ts` — function `toContextFile(profile, options?)` that emits canonical JSON object matching `specs/001-personality-context-site/contextfile.schema.json` including `schema_version`, `generated_at`, `profile`, `preferences`, and `modules` metadata.

- [X] T008 [US1] [P] Add unit test for serializer and AJV validation: `tests/unit/serializer.test.ts` — generate a ContextFile from sample scorer output, validate with AJV using `specs/001-personality-context-site/contextfile.schema.json` and assert valid.

- [X] T009 [US1] Create CLI helper script to generate example.json from test responses: `scripts/generate-ipip.js` that imports `ipipScorer` and `toContextFile` and writes `specs/001-personality-context-site/example.generated.json`.

User Story 2 (P2) — Progressive modules & import

- [X] T010 [US2] Implement JSON import handler: `src/lib/importer/index.ts` — exposes `importJson(filePath)` which validates JSON with AJV, merges present modules into in-memory profile, and returns `{ profile, inferredFields }` marking defaults.

- [X] T011 [US2] Implement pbtxt import/export using protobufjs: `src/lib/importer/pbtxt.ts` — functions `parsePbtxt(text)` and `serializePbtxt(json)` mirroring serializer tasks.

- [X] T012 [US2] [P] Add unit tests for importers: `tests/unit/importer.test.ts` — test JSON import with partial/example files and pbtxt round-trip.

- [X] T013 [US2] Implement module replacement logic: `src/lib/modules/moduleManager.ts` — when `retakeModule(name, newData)` is called, it replaces module data entirely and updates `modules[]` metadata. Add `tests/unit/moduleManager.test.ts`.

User Story 3 (P3) — Review, change summary, export

- [X] T014 [US3] Implement change-summary generator: `src/lib/changeSummary/index.ts` — function `diffProfiles(oldProfile, newProfile) => { added:[], removed:[], updated:[], inferred:[] }` and human-readable summary builder.

- [X] T015 [US3] [P] Add tests for change-summary: `tests/unit/changeSummary.test.ts` with examples of import causing inferred defaults and module replacements.

- [X] T016 [US3] Implement pbtxt export: `src/lib/serializer/toPbtxt.ts` (reuse T004) and test `tests/unit/pbtxt.test.ts` verifying pbtxt produced by serializer can be parsed back to equivalent JSON.

Cross-cutting & final

- [X] T017 [P] Add linting and formatting config: `.eslintrc.cjs`, `.prettierrc` and ensure `npm run lint` is a script in `package.json`.

- [X] T018 Add CI tasks to run validator and tests: verify `.github/workflows/validate-json.yml` triggers `npm ci`, `npm run validate:json`, and `npm test` on PRs.

- [X] T019 Update documentation: review and update `specs/001-personality-context-site/quickstart.md`, `README.md`, and add `docs/developer/` notes describing how to run scorer, importer, and serializer.

Dependencies (high-level)

- T001 -> T002 -> T003
- T003 -> T005, T007, T010
- T005 -> T006
- T007 -> T008
- T010 -> T011, T012
- T013 depends on T010
- T014 depends on T010 and T007
- CI tasks (T018) require T002 and T003 complete

Parallel opportunities (marked [P])

- Adding configs (T002), serializer pbtxt implementation (T004), unit tests (T006/T008/T012/T015) and lint setup (T017) can be worked in parallel by different implementers.

Suggested MVP

- Deliver User Story 1 (T005..T009) first to produce a working scorer and JSON ContextFile export that validates against the canonical schema.

User Story 4 (UI) — Svelte frontend for survey, progress, and export

- [X] T020 [US4] Add Svelte + Vite dev dependencies and package.json scripts: update `package.json` to include `dev:ui`, `build:ui`, `preview:ui` and devDependencies `svelte`, `vite`, `@sveltejs/vite-plugin-svelte`, `svelte-preprocess`.

- [X] T021 [P] Create Vite config for Svelte: `vite.config.js` at repo root with svelte plugin and dev server config.

- [X] T022 [US4] Scaffold UI entry: create `src/ui/main.js` and `src/ui/App.svelte` that mount the Svelte app and provide a root layout.

- [X] T023 [US4] [P] Implement Survey component: `src/ui/components/Survey.svelte` — renders questions from `specs/questions/`, accepts/selects responses (1-5), validates length 50, emits responses list.

- [X] T024 [US4] [P] Implement ProgressBar component: `src/ui/components/ProgressBar.svelte` — animated progress indicator showing answered count and percent.

- [X] T025 [US4] [P] Implement Summary component: `src/ui/components/Summary.svelte` — shows normalized trait scores, raw scores summary, and module-level details after scoring.

- [X] T026 [US4] Integrate scorer & serializer into UI service: `src/ui/services/profileService.js` — imports `src/lib/scorer/ipipScorer` and `src/lib/serializer/toContextFile`, exposes `scoreAndExport(responses)` returning ContextFile object.

- [X] T027 [US4] Implement ExportButtons component: `src/ui/components/ExportButtons.svelte` — provides JSON download and pbtxt download (uses `src/lib/serializer/toPbtxt.js`) and shows generated file names.

- [X] T028 [US4] [P] Add client-side routing and pages: `src/ui/pages/SurveyPage.svelte`, `src/ui/pages/ReviewPage.svelte` and wire routes in `App.svelte`.

- [X] T029 [US4] [P] Add UI dev scripts and documentation: update `package.json` (`dev:ui`, `build:ui`), add `docs/developer/ui.md` with instructions to run and build the Svelte app.

- [X] T030 [US4] [P] Add unit tests for UI services: `tests/unit/ui.profileService.test.js` — test scoring integration and ContextFile structure returned by `profileService` using Vitest.

- [ ] T031 [US4] Add basic E2E smoke test against dev server: `tests/e2e/ui-smoke.test.js` — Node test that requests `http://localhost:5173` (or configured UI dev URL), posts responses, asserts example.generated.json is created.

- [ ] T032 Polish and CI: update `.github/workflows/validate-json.yml` (or add new workflow) to run `npm run build:ui` and optionally run UI smoke tests in CI; update `specs/001-personality-context-site/quickstart.md` with UI run instructions.

Task counts

- Total tasks: 32
- Tasks by story: US1: 5 (T005-T009), US2: 4 (T010-T013), US3: 3 (T014-T016), US4: 13 (T020-T032), Setup/Foundation/Cross-cutting: 7 (T001-T004, T017-T019)


