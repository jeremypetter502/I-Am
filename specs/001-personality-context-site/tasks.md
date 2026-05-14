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

- [ ] T010 [US2] Implement JSON import handler: `src/lib/importer/index.ts` — exposes `importJson(filePath)` which validates JSON with AJV, merges present modules into in-memory profile, and returns `{ profile, inferredFields }` marking defaults.

- [ ] T011 [US2] Implement pbtxt import/export using protobufjs: `src/lib/importer/pbtxt.ts` — functions `parsePbtxt(text)` and `serializePbtxt(json)` mirroring serializer tasks.

- [ ] T012 [US2] [P] Add unit tests for importers: `tests/unit/importer.test.ts` — test JSON import with partial/example files and pbtxt round-trip.

- [ ] T013 [US2] Implement module replacement logic: `src/lib/modules/moduleManager.ts` — when `retakeModule(name, newData)` is called, it replaces module data entirely and updates `modules[]` metadata. Add `tests/unit/moduleManager.test.ts`.

User Story 3 (P3) — Review, change summary, export

- [ ] T014 [US3] Implement change-summary generator: `src/lib/changeSummary/index.ts` — function `diffProfiles(oldProfile, newProfile) => { added:[], removed:[], updated:[], inferred:[] }` and human-readable summary builder.

- [ ] T015 [US3] [P] Add tests for change-summary: `tests/unit/changeSummary.test.ts` with examples of import causing inferred defaults and module replacements.

- [ ] T016 [US3] Implement pbtxt export: `src/lib/serializer/toPbtxt.ts` (reuse T004) and test `tests/unit/pbtxt.test.ts` verifying pbtxt produced by serializer can be parsed back to equivalent JSON.

Cross-cutting & final

- [ ] T017 [P] Add linting and formatting config: `.eslintrc.cjs`, `.prettierrc` and ensure `npm run lint` is a script in `package.json`.

- [ ] T018 Add CI tasks to run validator and tests: verify `.github/workflows/validate-json.yml` triggers `npm ci`, `npm run validate:json`, and `npm test` on PRs.

- [ ] T019 Update documentation: review and update `specs/001-personality-context-site/quickstart.md`, `README.md`, and add `docs/developer/` notes describing how to run scorer, importer, and serializer.

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

Task counts

- Total tasks: 19
- Tasks by story: US1: 5 (T005-T009), US2: 4 (T010-T013), US3: 3 (T014-T016), Setup/Foundation/Cross-cutting: 7 (T001-T004, T017-T019)


