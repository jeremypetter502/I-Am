# Tasks: I-AM Long Form (LF)

Phase 1: Setup

- [x] T001 Create implementation plan in specs/006-long-form-iam/plan.md
- [x] T002 Create data model in specs/006-long-form-iam/data-model.md
- [x] T003 Add mapping files in specs/006-long-form-iam/mappings/ (segment-mapping.json, metric-mapping-*.json)
- [x] T004 Add generator contract in specs/006-long-form-iam/contracts/iam-generator.json
- [x] T005 Add quickstart in specs/006-long-form-iam/quickstart.md

Phase 2: Foundational (blocking prerequisites)

- [ ] T006 [P] [US1] Implement LF mapping loader and JSON reader in src/lib/iam/lf-mappings/ (create loader in src/lib/iam/lfMappings.js)
- [ ] T007 [P] [US1] Add runtime mapping artifacts under src/lib/iam/lf-mappings/ or ensure generator reads specs/006-long-form-iam/mappings/*.json
- [ ] T008 [US1] Extend IAM generator in src/lib/iam/iam.js to accept `format` and `lfVersion` options
- [ ] T009 [US1] Implement LF prefix emission (`IAM/LF.0.1:`) in src/lib/iam/iam.js
- [ ] T010 [US1] Implement LF segment naming and metric naming using mapping tables in src/lib/iam/iam.js
- [ ] T011 [US3] Add `Long Form` checkbox to src/ui/components/GeneratePopup.svelte and pass options to generator
- [ ] T012 [US1] Implement ordering by aggregated module score with alphabetical tie-breaker in src/lib/iam/iam.js
- [ ] T013 [US2] Ensure compact output remains identical when LF is not selected (regression checks in src/lib/iam/iam.js)

Phase 3: Tests & Validation

- [ ] T014 [US1] Unit test: mapping loader and mapping lookup (tests/unit/lf.mapping.test.js)
- [ ] T015 [US1] Unit test: LF formatting, prefix, segment order, and tie-break behavior (tests/unit/lf.format.test.js)
- [ ] T016 [US2] Integration test: numeric parity between compact and LF outputs for example profiles (tests/integration/lf.parity.test.js)
- [ ] T017 [P] [US1] Add serializer/importer roundtrip tests if LF is included in exports (tests/unit/serializer.lf.test.js)

Phase 4: Docs, Examples & Release

- [ ] T018 Update docs: docs/iam.md and docs/developer/iam.md with LF examples
- [ ] T019 Add example generated LF strings to specs/006-long-form-iam/examples/ (example files)
- [ ] T020 Prepare release notes and PR checklist; open PR from branch 006-delivery-v2

Final Phase: Polish

- [ ] T021 Clean up mapping entries, add missing metrics, and finalize spec docs (specs/006-long-form-iam/)
- [ ] T022 Close feature: merge PR, tag release if applicable
