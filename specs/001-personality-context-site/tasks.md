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

## Review — Module completion status

| Module     | Question bank | Scorer | UI Component | Tests | Notes / Status |
|------------|---------------|--------|--------------|-------|----------------|
| IPIP       | Present       | ✓ Done | ✓ Present    | ✓     | Core IPIP flow implemented and validated (T005..T009)
| Aesthetics | Pending (T035)| ✓ Done | ✓ Present    | ✓     | Scorer and UI implemented; question bank file still to add/version under specs/questions/ (T035)
| Music      | Pending (T038)| ✓ Done | ✓ Present    | Partial | Scorer and UI exist; question bank and formal factor tests remain (T038, T040)
| Extended   | N/A           | N/A    | N/A          | N/A   | Optional modules supported under profile.modules.extended
| Skills     | Pending (T124)| Pending (T125) | Pending (T127) | Pending (T126, T132) | New standalone module for O*NET transferable skills with Results Filter logic (T124..T140)


- [X] T010 [US2] Implement JSON import handler: `src/lib/importer/index.ts` — exposes `importJson(filePath)` which validates JSON with AJV, merges present modules into in-memory profile, and returns `{ profile, inferredFields }` marking defaults.

- [X] T011 [US2] Implement pbtxt import/export using protobufjs: `src/lib/importer/pbtxt.ts` — functions `parsePbtxt(text)` and `serializePbtxt(json)` mirroring serializer tasks.

- [X] T012 [US2] [P] Add unit tests for importers: `tests/unit/importer.test.ts` — test JSON import with partial/example files and pbtxt round-trip.

- [X] T013 [US2] Implement module replacement logic: `src/lib/modules/moduleManager.ts` — when `retakeModule(name, newData)` is called, it replaces module data entirely and updates `modules[]` metadata. Add `tests/unit/moduleManager.test.ts`.

- [ ] T035 [US2] [P] Add aesthetics question bank: create `specs/questions/aesthetic_module.txt` (canonical 18+ items) and ensure it is versioned under specs/questions/.
- [X] T036 [US2] Implement aesthetics scorer: `src/lib/scorer/aestheticsScorer.js` — compute normalized scores and composites (minimalism, colorfulness, warmth, texture, motion) and export `scoreAesthetics(responses)`.
- [X] T037 [US2] [P] Add unit tests for aesthetics scorer: `tests/unit/aestheticsScorer.test.js` with sample responses validating normalization and composites.
- [ ] T038 [US2] [P] Add music question bank: create `specs/questions/music_module.txt` (factor items mapping to music factors) and version it.
- [ ] T039 [US2] Implement music scorer: `src/lib/scorer/musicScorer.js` — compute music factor scores (mellow, sophisticated, unpretentious, intense, contemporary) normalized 0–100 and export `scoreMusic(responses)`.
- [ ] T040 [US2] [P] Add unit tests for music scorer: `tests/unit/musicScorer.test.js` with sample responses validating factor calculations.

# UI integration tasks (User Story 4)
- [X] T041 [US4] Implement Aesthetics UI component: `src/ui/components/Aesthetics.svelte` — render aesthetic questions, record responses (1–5), emit module results to profileService.
- [X] T042 [US4] Implement Music UI component: `src/ui/components/Music.svelte` — render music preference questions, record responses, emit module results.
- [X] T043 [US4] Integrate module scorers into profileService: `src/ui/services/profileService.js` — import and call `scoreAesthetics` and `scoreMusic`, include results in ContextFile generation.
- [X] T044 [US4] [P] Add UI tests/integration: `tests/unit/ui.modules.test.js` — verify selecting responses for Aesthetics and Music produces expected module entries in generated ContextFile (mock scoring if necessary).

- [X] T045 [US4] Add autosave & resume functionality: create `src/ui/services/sessionService.js` to persist in-progress module responses to localStorage every 5 answers and implement resume prompt in `src/ui/App.svelte` and `src/ui/pages/SurveyPage.svelte`.
- [X] T046 [US4] Add module completion badges & timestamps: include `last_updated` and `completed` fields in module metadata in `src/lib/serializer/toContextFile.js` and render badges in `src/ui/components/ModuleList.svelte`.
- [X] T047 [US4] Implement Review page: create `src/ui/pages/ReviewPage.svelte` to list completed modules, provide retake/edit links, and show change summary using `src/lib/changeSummary/index.js`.
- [X] T048 [US4] Add tests for resume and module UI: `tests/unit/ui.resume.test.js` — unit/integration tests verifying autosave/resume, module badges, and review page interactions (use jsdom or testing-library/svelte).
- [ ] T049 [US4] Add jsdom + testing-library/svelte UI tests: implement `tests/unit/ui.resume.test.js` to assert resume prompt appears when saved progress exists, clicking Resume shows module tabs, and verify sessionService persistence.
- [ ] T050 [US4] Run UI tests and fix any failures: ensure devDependencies include necessary testing libs or mock appropriately; update CI if needed.
- [ ] T051 [US4] Add per-module download option: when a module is completed, present a download option for the current ContextFile (partial). Implement UI prompt and tests (tests/unit/ui.download.test.js).

- [X] T067 [US4] Refresh the app shell and landing layout: update `src/ui/App.svelte` with a stronger hero, clearer navigation, saved-session summary cards, and responsive breakpoints that match the spec’s desktop/tablet/mobile guidance.

- [X] T068 [US4] Make the survey flow more playful: update `src/ui/pages/SurveyPage.svelte`, `src/ui/components/Survey.svelte`, `src/ui/components/Aesthetics.svelte`, and `src/ui/components/Music.svelte` with richer module cards, clearer progress, friendlier answer states, and more visual treatment for the Likert choices.

- [X] T069 [US4] Redesign the review dashboard: update `src/ui/pages/ReviewPage.svelte`, `src/ui/components/ModuleList.svelte`, and `src/ui/components/Summary.svelte` so completed modules render as attractive status cards with score chips, timestamps, and stronger empty states.

- [X] T070 [US4] Polish feedback and accessibility states: update `src/ui/components/ProgressBar.svelte`, `src/ui/components/ImportContext.svelte`, and the survey question components so hover/focus/pressed/loading/error states are consistent and visually obvious.

- [X] T071 [US4] Add dashboard import and export actions: update `src/ui/App.svelte` to surface a ContextFile upload control plus JSON/pbtxt download actions from the main dashboard view.

- [X] T072 [US4] Make survey replace dashboard chrome: update `src/ui/App.svelte` and `src/ui/pages/SurveyPage.svelte` so the survey becomes the primary view while answering and the dashboard is restored after completion.

- [X] T073 [US4] Fix music module finish flow: update `src/ui/components/Music.svelte` and `src/ui/pages/SurveyPage.svelte` so the final question can always be finished and the user is not trapped after completing music.

- [X] T074 [US4] Surface completed-profile downloads on the dashboard: update `src/ui/App.svelte` and `src/ui/pages/ReviewPage.svelte` so a completed 3/3 profile always exposes download buttons.

- [X] T075 [US4] Hide partial-download status when unavailable: update `src/ui/pages/SurveyPage.svelte` to show the “Partial download available” badge only when a partial profile payload exists.

- [X] T076 [US4] Keep context-file upload always visible: update `src/ui/App.svelte` to make ContextFile upload permanently available on the dashboard without requiring an expand/collapse step.

- [X] T077 [US4] Remove “Next” survey badge: update `src/ui/pages/SurveyPage.svelte` to remove the “Next: ...” badge from the survey header.

User Story 3 (P3) — Review, change summary, export

- [X] T014 [US3] Implement change-summary generator: `src/lib/changeSummary/index.ts` — function `diffProfiles(oldProfile, newProfile) => { added:[], removed:[], updated:[], inferred:[] }` and human-readable summary builder.

- [X] T015 [US3] [P] Add tests for change-summary: `tests/unit/changeSummary.test.ts` with examples of import causing inferred defaults and module replacements.

- [X] T016 [US3] Implement pbtxt export: `src/lib/serializer/toPbtxt.ts` (reuse T004) and test `tests/unit/pbtxt.test.ts` verifying pbtxt produced by serializer can be parsed back to equivalent JSON.

Cross-cutting & final

- [X] T017 [P] Add linting and formatting config: `.eslintrc.cjs`, `.prettierrc` and ensure `npm run lint` is a script in `package.json`.

- [X] T018 Add CI tasks to run validator and tests: verify `.github/workflows/validate-json.yml` triggers `npm ci`, `npm run validate:json`, and `npm test` on PRs.

- [X] T019 Update documentation: review and update `specs/001-personality-context-site/quickstart.md`, `README.md`, and add `docs/developer/` notes describing how to run scorer, importer, and serializer.

- [X] T034 Add machine-readable preamble: Insert a machine-readable preamble into `specs/001-personality-context-site/spec.md` (a machine-readable JSON/YAML block) describing: purpose, schema_version, scoring_version, trait_key_map, normalization, provenance, privacy, and usage_snippet. Update the canonical serializer to include this preamble in all generated ContextFiles and add validation tests.
- [X] T060 [US3] Implement serializer preamble inclusion: update `src/lib/serializer/toContextFile.js` to embed or read the spec preamble and include `preamble` at the top-level of produced ContextFiles.
- [X] T061 [US4] Ensure UI serializer includes preamble: update `src/ui/services/profileService.js` (already updated) to include the same preamble; add tests ensuring parity between CLI serializer and UI serializer.
- [ ] T062 [US3] Add preamble validation tests: `tests/unit/serializer.preamble.test.js` — assert presence and fields of `preamble` in generated ContextFiles; validate with AJV against schema.
- [ ] T063 [US3] Update examples/docs: add example ContextFile with `preamble` to `specs/001-personality-context-site/example.json` and update `spec.md` usage snippets to reference the preamble and how LLMs should use `iam` and `profile.scores`. 
- [ ] T064 [US3] Consolidate scorers: ensure all scoring logic (IPIP, aesthetics, music) lives under `src/lib/scorer` and update UI to import only from this directory; remove duplicate implementations in `src/ui`.
- [ ] T065 [US3] Enforce business-logic separation in spec: add requirement to `spec.md` that UI must not contain scoring/serializer logic; update tasks and README.
- [ ] T052 [US3] Implement IAM generator: create `src/lib/iam/iam.js` exporting `buildIam(scored, modules)` that composes the IAM string per `specs/personality-specs/personality_code.spec.md` and maps IPIP + module normalized scores into the compact segments.
- [ ] T053 [US3] Include IAM in serializer: update `src/ui/services/profileService.js` and `src/lib/serializer/toContextFile.js` to include `profile.iam` with `{ code, version }` in generated ContextFiles; add a small integration test verifying presence.
- [ ] T054 [US3] Add IAM unit tests: `tests/unit/iam.test.js` — verify formatting rules, segment ordering, and partial-module generation (IPIP-only, IPIP+aesthetics, full profile).
- [ ] T055 [US3] Update spec examples: add IAM examples to `specs/001-personality-context-site/example.json` and `example.pbtxt`, and ensure schema examples include `iam` where appropriate.

- [X] T066 [US3] Add raw_responses block: append raw responses to the end of the ContextFile and include LLM-ignore note. Implement serializer change in `src/lib/serializer/toContextFile.js` to attach `raw_responses` with a note and data payload.

- [X] T078 [US3] Keep raw scores only in raw_responses: update `src/lib/serializer/toContextFile.js` and `src/ui/services/profileService.js` to remove inline raw score fields from profile/module sections and keep raw score data only under the end-of-file `raw_responses` block.

- [X] T079 [US4] Save test progress in real time: update `src/ui/components/Survey.svelte`, `src/ui/components/Aesthetics.svelte`, and `src/ui/components/Music.svelte` so each answer writes progress immediately to localStorage.

- [X] T080 [US4] Enforce strict completion state: update `src/ui/services/sessionService.js` and `src/ui/pages/SurveyPage.svelte` so modules are only marked complete when all module questions are answered (answered count meets expected length).

- [X] T081 [US4] Gate survey completion indicators by answered questions: update module chips and the status pill in `src/ui/pages/SurveyPage.svelte` so "Completed" appears only after full-question completion.

- [X] T082 [US4] Remove dashboard shell: simplify `src/ui/App.svelte` to the survey-first experience and eliminate dashboard/review-route chrome.

- [X] T083 [US4] Move import/export into survey hero: update `src/ui/pages/SurveyPage.svelte` to surface ContextFile upload and JSON/pbtxt download controls in the hero area.

- [X] T084 [US4] Add survey help surface: add an Information & Help section accessible from the survey hero in `src/ui/pages/SurveyPage.svelte`.

- [X] T085 [US4] Minimize hero transfer controls: update `src/ui/pages/SurveyPage.svelte` so upload/download controls are compact and pinned to the top of the survey hero while survey content remains the primary focus.

- [X] T086 [US4] Show completion popup on module finish: update `src/ui/pages/SurveyPage.svelte` so completing a module shows a popup confirming the ContextFile was updated and is ready for download.

- [X] T087 [US4] Fix last-answer completion reactivity: update `src/ui/components/Survey.svelte`, `src/ui/components/Aesthetics.svelte`, and `src/ui/components/Music.svelte` so response updates use reactive array reassignment and "Finish Module" enables when all questions are answered.

- [X] T088 [US4] Fix per-answer resume index persistence: update the same module components so autosave writes the next question index on every answer for accurate real-time resume state.

- [X] T089 [US4] Add survey-hero reset control: update `src/ui/pages/SurveyPage.svelte` with a reset button in the hero toolbar that clears saved responses/profile state and restarts the survey from the first module.

- [X] T090 [US4] Fix finish-button completion gating against loaded question count: update `src/ui/components/Survey.svelte`, `src/ui/components/Aesthetics.svelte`, and `src/ui/components/Music.svelte` so completion is based on answered count vs loaded question count and does not remain disabled after all visible questions are answered.

- [X] T091 [US4] Eliminate answer-timing race in module progression/autosave: update `src/ui/components/Survey.svelte`, `src/ui/components/Aesthetics.svelte`, and `src/ui/components/Music.svelte` to remove delayed answer advancement and persist deterministic resume index based on first unanswered question.

- [X] T092 [US4] Fix finish visibility vs unanswered questions: update `src/ui/components/Survey.svelte`, `src/ui/components/Aesthetics.svelte`, and `src/ui/components/Music.svelte` so Finish only appears when modules are fully answered; otherwise keep Next and route to the first unanswered question.

- [X] T093 [US4] Fix final-answer Finish display in module flow: update `src/ui/components/Aesthetics.svelte`, `src/ui/components/Survey.svelte`, and `src/ui/components/Music.svelte` so in-session auto-advance remains sequential while autosave continues to persist first-unanswered resume index.
- [X] T094 [US4] Keep Finish visible on final step: update `src/ui/components/Aesthetics.svelte`, `src/ui/components/Survey.svelte`, and `src/ui/components/Music.svelte` so Finish is always rendered (disabled until complete) and "Review unanswered" appears on the last step when answers are still missing.
- [X] T095 [US4] Normalize imported/resumed answers for completion checks: update `src/ui/services/sessionService.js` plus survey module components so numeric-string responses are coerced to numbers and completion/answered counts remain accurate.
- [X] T096 [US4] Sync live progress state without refresh: update survey modules and `src/ui/pages/SurveyPage.svelte` so each answer emits progress updates, parent resume state syncs immediately, and Finish-enable state tracks live answered counts.
- [X] T097 [US4] Enable finish/export from live completion state: update module components to compute completion from current responses and update `src/ui/pages/SurveyPage.svelte` so JSON/pbtxt exports are enabled when any module is complete via fallback profile generation.
- [X] T098 [US4] Gate download button by completion state: update `src/ui/pages/SurveyPage.svelte` so toolbar download buttons enable whenever any module is completed and download actions lazily resolve a fallback profile if no persisted profile is present.
- [X] T099 [US4] Auto-complete on final answer: remove Finish buttons from survey modules and trigger module completion/popup immediately when the last unanswered question is answered.
- [X] T100 [US4] Refine suspended module state: update `src/ui/pages/SurveyPage.svelte` to remove the partial-download badge and label started but incomplete non-active modules as "Suspended".
- [X] T101 [US4] Persist suspended-chip tracking: update `src/ui/pages/SurveyPage.svelte` to track touched/abandoned modules in-session so started-but-left modules reliably show "Suspended" even before full completion.
- [X] T102 [US4] Stabilize active module switching: update `src/ui/pages/SurveyPage.svelte` to use a dedicated module-switch handler so chip labels reflect the selected module immediately after reset and manual tab changes.
- [X] T103 [US4] Normalize module-chip status source-of-truth: update `src/ui/pages/SurveyPage.svelte` so chip labels derive from saved progress/completion + active module only, removing touched-state heuristics that caused inconsistent statuses.
- [X] T104 [US4] Enforce strict four-state module chips: update `src/ui/pages/SurveyPage.svelte` so chips show exact states "Not Started", "In Progress", "Suspended", and "Complete", with previous active modules becoming suspended on switch.
- [X] T105 [US4] Bind chip labels to derived status map: update `src/ui/pages/SurveyPage.svelte` so module-chip `<small>` text renders from a single derived status map to avoid stale status label rendering.
- [X] T106 [US4] Replace chip status labels with answered counts: update `src/ui/pages/SurveyPage.svelte` so module-chip text shows answered/total progress (e.g., `50/50`) instead of status words.
- [X] T107 [US4] Realtime chip-count updates: update `src/ui/pages/SurveyPage.svelte` to keep per-module answered/total counts in in-memory state and update counts immediately on each `progress` event.
- [X] T108 [US4] Use dedicated module progress event: update survey modules and `src/ui/pages/SurveyPage.svelte` to emit/listen on `moduleprogress` so chip counts update reliably in real time.
- [X] T109 [US4] Prevent progress-map reset during live answers: update `src/ui/pages/SurveyPage.svelte` so `handleModuleProgress` updates in-memory progress/completion state directly without immediately reloading/syncing from storage.
- [X] T110 [US4] Fix module-chip label reactivity and add regression coverage: in `src/ui/pages/SurveyPage.svelte`, compute `moduleProgressLabels` with direct `moduleProgress` access inside the reactive statement (not via helper indirection), and add `tests/unit/ui.moduleChipProgress.test.js` for resume + live-answer label updates.
- [X] T111 [US4] Remove manual resume prompt and auto-resume always: update `src/ui/pages/SurveyPage.svelte` to load saved progress and restore the active module automatically on mount, and update resume tests for prompt-free behavior.
- [X] T112 [US4] Move module chips into survey hero and switch to horizontal chip content: update `src/ui/pages/SurveyPage.svelte` so module chips replace the "x/x modules done" badge in the hero and render as icon + name + progress in one row.
- [X] T113 [US4] Replace inline help card with onboarding modal and session-aware behavior: add purpose-focused intro copy in a help popup, open it on first load once per session, and allow reopening from the hero Help button.

# Import & Resume (UI)
- [ ] T056 [US4] Implement ImportContext UI: create `src/ui/components/ImportContext.svelte` that accepts a ContextFile JSON upload, validates basic structure, stores modules into `sessionService` and emits an `imported` event.
- [ ] T057 [US4] Wire import into SurveyPage: update `src/ui/pages/SurveyPage.svelte` to include `ImportContext` and handle `imported` events to reload resume state and auto-navigate to the appropriate module.
- [ ] T058 [US4] Add import integration tests: `tests/unit/ui.import.test.js` — simulate uploading a ContextFile, assert sessionService contains stored module responses and SurveyPage resumes with populated answers (use jsdom/testing-library).
- [ ] T059 [US4] Update documentation: add `docs/developer/importing.md` describing how to create/import ContextFiles and expected behavior for resume/population.

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

- [X] T033 [US4] Implement auto-advance on answer selection: selecting an answer records it and automatically advances to the next question; ensure ARIA labels and keyboard accessibility (src/ui/components/Survey.svelte).

- [X] T024 [US4] [P] Implement ProgressBar component: `src/ui/components/ProgressBar.svelte` — animated progress indicator showing answered count and percent.

- [X] T025 [US4] [P] Implement Summary component: `src/ui/components/Summary.svelte` — shows normalized trait scores, raw scores summary, and module-level details after scoring.

- [X] T026 [US4] Integrate scorer & serializer into UI service: `src/ui/services/profileService.js` — imports `src/lib/scorer/ipipScorer` and `src/lib/serializer/toContextFile`, exposes `scoreAndExport(responses)` returning ContextFile object.

- [X] T027 [US4] Implement ExportButtons component: `src/ui/components/ExportButtons.svelte` — provides JSON download and pbtxt download (uses `src/lib/serializer/toPbtxt.js`) and shows generated file names.

- [X] T028 [US4] [P] Add client-side routing and pages: `src/ui/pages/SurveyPage.svelte`, `src/ui/pages/ReviewPage.svelte` and wire routes in `App.svelte`.

- [X] T029 [US4] [P] Add UI dev scripts and documentation: update `package.json` (`dev:ui`, `build:ui`), add `docs/developer/ui.md` with instructions to run and build the Svelte app.

- [X] T030 [US4] [P] Add unit tests for UI services: `tests/unit/ui.profileService.test.js` — test scoring integration and ContextFile structure returned by `profileService` using Vitest.

- [X] T031 [US4] Add basic E2E smoke test against dev server: `tests/e2e/ui-smoke.test.js` — Node test that requests `http://localhost:5174` (configured UI dev URL), posts responses, asserts example.generated.json is created (test is tolerant when server not running).

- [X] T032 Polish and CI: update `.github/workflows/validate-json.yml` (or add new workflow) to run `npm run build:ui` and optionally run UI smoke tests in CI; update `specs/001-personality-context-site/quickstart.md` with UI run instructions.

Task counts

- Total tasks: 45
- Tasks by story: US1: 5 (T005-T009), US2: 4 (T010-T013), US3: 4 (T014-T016, T078), US4: 40 (T020-T032, T041-T051, T056-T059, T067-T077, T079), Setup/Foundation/Cross-cutting: 7 (T001-T004, T017-T019)

## Career IAM Extension (Standardized O*NET Skills S01-S35)

- [ ] T114 [US3] Add Career skill position map constants: create `src/lib/iam/skillPositionMap.js` with canonical O*NET 35-skill position index (S01–S35) and skill names, enabling consistent encoding/decoding across IAM generator and parser. Reference: `specs/personality-specs/personality_code.spec.md` "CAR segment" + "O*NET Standardized Transferable Skills Position Map".

- [ ] T115 [US3] Add Career segment generator (v0.4 sparse encoding): extend `buildIam(scored, modules)` in `src/lib/iam/iam.js` to append `/CAR{soc8}S{skill_idx}{proficiency}[{skill_idx}{proficiency}]*` when valid `profile.base.onet` and filtered skills are present. Use sparse encoding: only include skills with non-zero proficiency, ordered by index (S01, S02, ..., S35). Proficiency values are 00–99 (rounded from normalized scores).

- [ ] T116 [US3] Normalize O*NET SOC for IAM: implement SOC normalization helper in `src/lib/baseContext/index.js` or `src/lib/iam/iam.js` that converts `XX-XXXX.XX` to 8 digits `XXXXXXXX` and validates format matches O*NET standard.

- [ ] T117 [US3] Wire base skill fields into IAM input model: update serializer input plumbing in `src/ui/services/profileService.js` and `src/lib/serializer/toContextFile.js` so Career skill values stored in `profile.modules.skills` (filtered results with proficiency) are available to IAM generation.

- [ ] T118 [US3] [P] Add IAM Career unit tests: create `tests/unit/iam.career.test.js` for cases: valid SOC + 2–5 skills with sparse encoding, full skill set (all 35), missing SOC, invalid SOC, score normalization to 00–99, and ordered skill indices (S01 before S02, etc.).

- [ ] T119 [US3] [P] Add round-trip persistence tests: create/update `tests/unit/serializer.test.js` and importer tests to verify `profile.base.onet` + `profile.modules.skills` (name, score, test results) survive export/import without loss; IAM string decoder can reconstruct skill names from S01–S35 positions.

- [X] T120 [US3] Update compact-string fixtures: update `specs/001-personality-context-site/example.json`, `specs/001-personality-context-site/example.generated.json`, and any IAM fixture snapshots to include a Career-segment example with v0.4 sparse skill encoding (e.g., `CARJOB15113200S0190S1899S2485S3360`).

- [X] T121 [US3] Update markdown export guidance: update `src/ui/services/profileService.js` IAM markdown instructions to document v0.4 Career decoding (S01–S35 → skill names), sparse encoding explanation, and how LLMs should interpret O*NET standardized skill signals.

- [X] T122 [US3] [P] Add parser compatibility tests: add tests for parsing markdown/context files with v0.4 Career-encoded IAM strings (sparse S01–S35 format with `/CAR` prefix) and verifying no regression for older v0.1–v0.3 strings lacking Career segments (lenient backward compatibility).

- [X] T123 [US3] Update docs and quickstart: update `specs/001-personality-context-site/quickstart.md` and `docs/developer/ui.md` with v0.4 Career segment format, O*NET skill position map (S01–S35 with names), sparse encoding explanation, and sample strings:
  - Minimal: `IAM/0.4:O72C88E55A60N22/.../.../CAR15113200S0190S1899`
  - Full: `IAM/0.4:O72C88E55A60N22/.../CAR15113200S0190S1899S2485S3360`

Career extension dependency notes (updated for v0.4):

- T114, T116 before T115 (constants and SOC normalization needed first)
- T115 before T118 and T122 (generator must exist to test and document it)
- T117 before T119 (plumbing must be in place to test round-trip)
- T118 and T119 before T120 and T123 (tests and generators before fixtures/docs)


- [X] T124 [US2] Create skills question bank: `specs/questions/skills_module.txt` — define 35 O*NET Standardized Transferable Skills assessment items with 0–5 Likert response scale. Include grouped skill categories (Cognitive, Communication, Leadership, Technical, Business, Creative, Domain) with one item per skill. Add metadata header with scoring notes.

- [X] T125 [US2] Implement skills scorer with filtering logic: `src/lib/scorer/skillsScorer.ts` — expose `scoreSkills(responses: number[35]) => { raw: number[], normalized: number[0-100], filtered: Skill[], fullAssessment: Skill[] }`. 
  - Normalize responses to 0–100.
  - Apply threshold filter: >= 60 (results-worthy), 35–59 (conditional), < 35 (omit).
  - For scores >= 50: require answers to Interview Defense, Day One Autonomy, and Relevance & Recency tests.
  - Return `filtered` (confirmed, job-ready skills) and `fullAssessment` (all scored skills for user review).
  - Skill object structure: `{ name, index, normalized_score, threshold_status, test_results: { interview_defense, day_one_autonomy, relevance_recency }, listed_status }`.

- [X] T126 [US2] [P] Add unit tests for skills scorer: `tests/unit/skillsScorer.test.js` — validate normalization, threshold filtering, and test-response logic. Include example: skill scores [90, 45, 20, 75, 55] with test answers should produce filtered list excluding scores < 35 and conditional scores without test confirmations.

- [X] T127 [US2] Create Skills UI component: `src/ui/components/Skills.svelte` — present 35 skills in a scrollable list or card interface. For each skill:
  - Display name and category (Cognitive, Communication, etc.).
  - Present 0–5 Likert scale input.
  - After scoring, show filtered vs. full assessment views.
  - For scores >= 50, show inline prompts for Interview Defense, Day One Autonomy, and Relevance & Recency tests (checkboxes or text confirmation).
  - Include a "View Full Assessment" toggle to show unfiltered skills.
  - Allow users to manually override/edit skill inclusion before export (optional curate mode).

- [X] T128 [US2] Integrate Skills scorer into profileService: update `src/ui/services/profileService.js` to expose `scoreSkills()` function that calls `skillsScorer.scoreSkills()` and merges results into `profile.modules.skills` and `profile.preferences.skills`.

- [X] T129 [US2] [P] Add Skills module to module list and import logic: update `src/ui/components/ModuleList.svelte` to show "Skills Assessment" as an available module. Update `src/lib/importer/index.ts` to parse and import skills results from ContextFile `profile.modules.skills`.

- [X] T130 [US2] Update markdown export for Skills: modify `src/ui/services/profileService.js` `toIamMarkdown()` to include a Skills section with filtered skill list (name, normalized score, test status). Example:
  ```
  ## Skills Assessment
  - Critical Thinking: 85 (Confirmed)
  - Leadership: 72 (Confirmed)
  - Programming: 45 (Conditional – used > 2y ago, needs refresher)
  ```

- [X] T131 [US2] Create skills fixtures: add sample skills assessment to `specs/001-personality-context-site/example.json` with 10–15 representative skills (mix of high, medium, low scores) and test results. Generate corresponding `example.generated.json` via updated script.

- [X] T132 [US2] [P] Add Skills integration tests: `tests/unit/ui.skills.test.js` — test component rendering, Likert input, filtering logic application, and export of filtered skill list. Validate that skills < 35 are omitted and scores >= 50 without test answers are excluded from filtered list.

- [X] T133 [US2] Update change summary logic: modify `src/lib/changeSummary/index.js` to track skills module in change summary. Example output:
  ```
  Added Skills Assessment module: 12 confirmed skills, 3 conditional skills
  ```

- [X] T134 [US2] Update ContextFile schema: modify `specs/001-personality-context-site/contextfile.schema.json` to include `profile.modules.skills` schema with skill name, score, and test-result fields. Increment schema version.

- [X] T135 [US2] Update serializer to include skills: modify `src/lib/serializer/toContextFile.ts` to serialize `profile.modules.skills` into ContextFile output.

- [X] T136 [US2] Update documentation: update `docs/developer/ui.md` with Skills module architecture, filtering logic, and example integration. Add section on extending skill categories or adjusting thresholds.

- [X] T137 [US2] Create skills mapping specification: create `specs/001-personality-context-site/skills_mapping_spec.txt` documenting the Results Filter logic, threshold values (60/35/0), test definitions, and any future extensibility points (e.g., domain-specific skill subsets).

- [X] T138 [US2] [P] Add skills round-trip tests: add tests to `tests/unit/importer.test.js` for importing/exporting skills data without loss. Verify that filtered skill lists and test results survive round-trip (export → import → re-export).

- [X] T139 [US2] Update UI page layout: modify `src/ui/pages/SurveyPage.svelte` to conditionally show/hide Skills module alongside existing modules (IPIP, Aesthetics, Music, Communication, Base Context).

- [X] T140 [US2] Add README section on Skills module: update `specs/001-personality-context-site/README.md` with Skills module overview, 35 skill list, Results Filter philosophy, and example use case (e.g., preparing a skills-backed resume or interview prep).

Skills module dependency notes:

- T124 before T125
- T125 before T126, T128
- T126, T128 before T132
- T127 before T129, T130, T139
- T130, T131 before T138
- T134, T135 must precede T138
- T137 should be near T136 for documentation consistency

## Recent Delta Tasks: STATE Module + Skills Persistence/Export

Phase 3b: Foundational alignment for recent spec changes

- [X] T141 Align feature spec IAM references to STATE-aware format in specs/001-personality-context-site/spec.md (update IAM version/format examples from v0.4 to v0.6 with STATE segment ordering).
- [X] T142 [P] Add typed STATE model contract in src/lib/types.ts and reflect entity notes in specs/001-personality-context-site/data-model.md (bandwidth, mode, horizon, stakes + canonical snapshot shape).
- [X] T143 Implement STATE merge helper for shorthand deltas in src/lib/state/stateManager.ts (defaults, clamping, delta mapping, canonical re-emit).

Phase 4b: User Story 2 - Progressive modules & resume continuity (Priority: P2)

Goal: Users can set and persist dynamic STATE values, switch modules, resume accurately, and keep Skills review/test state across navigation.

Independent Test: A user sets STATE values and partial Skills confirmations, switches modules, returns, and sees previous values restored without loss.

- [X] T144 [US2] Create STATE UI module in src/ui/components/State.svelte with bandwidth slider presets (10/30/50/70/90), mode toggle, horizon toggle, and stakes toggle.
- [X] T145 [US2] Wire STATE module into survey flow in src/ui/pages/SurveyPage.svelte and src/ui/components/ModuleList.svelte (module order, progress, completion, resume routing).
- [X] T146 [P] [US2] Persist STATE and Skills testAnswers together in src/ui/services/sessionService.js (save/load/clear behavior for state + skills confirmations).
- [X] T147 [US2] Ensure Skills resume anchor remains last answered question in src/ui/components/Skills.svelte and ignore review-check state for resume index computation.
- [X] T148 [P] [US2] Add UI persistence regressions in tests/unit/ui.state.test.js and tests/unit/ui.skills.test.js (module switching, resume index, optional review checks, restored assessment results).

Phase 5b: User Story 3 - Export, IAM encoding, and import round-trip (Priority: P3)

Goal: Exported IAM/context files include dynamic STATE snapshot and preserve recent Skills state fields.

Independent Test: Exported markdown/JSON include canonical STATE; import and re-export preserve STATE and Skills testAnswers with no drift.

- [X] T149 [US3] Extend IAM builder in src/lib/iam/iam.js to append canonical STATE segment at the end of IAM strings when state data exists.
- [X] T150 [P] [US3] Serialize STATE module and Skills testAnswers in src/lib/serializer/toContextFile.js and src/lib/serializer/toContextFile.ts (schema-aligned output).
- [X] T151 [US3] Preserve STATE and Skills testAnswers on import in src/lib/importer/index.ts and src/lib/importer/pbtxt.ts.
- [X] T152 [P] [US3] Add export/import regression tests in tests/unit/serializer.test.js, tests/unit/importer.test.js, tests/unit/ui.profileService.test.js, and tests/unit/ui.markdownExport.test.js for canonical STATE and Skills confirmation persistence.

Phase 6b: Polish & cross-cutting

- [X] T153 [P] Update developer docs in docs/developer/ui.md and specs/001-personality-context-site/quickstart.md with STATE UI contract defaults, presets, and shorthand-delta merge behavior.
- [X] T154 Update example fixtures in specs/001-personality-context-site/example.json, specs/001-personality-context-site/example.generated.json, and specs/examples/profile.context.iam.md to include canonical STATE snapshots and persisted Skills testAnswers.

Recent delta dependencies:

- T141-T143 before T144-T152.
- T144 and T145 before T149 (STATE must exist in profile model before IAM/export wiring).
- T146 and T147 before T148 and T152.
- T149-T151 before T154.

Recent parallel opportunities:

- T142 and T143 can run in parallel.
- T146 and T147 can run in parallel.
- T150 and T151 can run in parallel.
- T148 and T152 can run in parallel once implementation tasks are complete.
