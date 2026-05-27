# Tasks: Universal Preference Delivery (Delivery Module)

**Input**: Design documents from `specs/003-universal-preference-modules/`

**Prerequisites**:
- `spec.md`
- `specs/questions/delivery_module.txt`
- `specs/personality-specs/personality_code.spec.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare module descriptors, constants, and fixtures used across Delivery implementation.

- [ ] T001 Create Delivery implementation notes and assumptions in `specs/003-universal-preference-modules/implementation-notes.md`
- [ ] T002 [P] Add Delivery module metadata/constants scaffold in `src/lib/modules/deliveryModule.js`
- [ ] T003 [P] Add Delivery fixture payloads for tests in `specs/003-universal-preference-modules/fixtures/delivery.sample.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contract and model updates that block all user stories.

**CRITICAL**: No user story implementation should begin until this phase is complete.

- [ ] T004 Update ContextFile schema for `profile.modules.universal.delivery` in `specs/001-personality-context-site/contextfile.schema.json`
- [ ] T005 Update protobuf contract for Delivery fields in `specs/001-personality-context-site/contextfile.proto`
- [ ] T006 [P] Add or update shared type definitions for Delivery payload in `src/lib/types.ts`
- [ ] T007 Add serializer compatibility guards for optional Delivery presence in `src/lib/serializer/toContextFile.js`
- [ ] T008 [P] Add schema contract tests for Delivery block in `tests/unit/serializer.test.js`

**Checkpoint**: Delivery contracts are validated and implementation can proceed.

---

## Phase 3: User Story 1 - Single Delivery Assessment Capture (Priority: P1)

**Goal**: User completes one unified Delivery questionnaire and system stores normalized Delivery metrics.

**Independent Test**: Given valid responses to the Delivery question bank, app stores `responses` and normalized `def/peer/chl/dns/aud/str/abs/fmt/vbs/emp/cnd/hmr/aut/bur` values.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add Delivery scorer unit tests in `tests/unit/deliveryScorer.test.js`
- [ ] T010 [P] [US1] Add Delivery response validation tests (bounds, reverse-keying, partials) in `tests/unit/deliveryValidation.test.js`

### Implementation for User Story 1

- [ ] T011 [US1] Implement Delivery scorer from `specs/questions/delivery_module.txt` in `src/lib/scorer/deliveryScorer.js`
- [ ] T012 [US1] Add Delivery module registration and sequencing in `src/lib/modules/moduleManager.js`
- [ ] T013 [US1] Persist Delivery responses and normalized scores in session state via `src/ui/services/sessionService.js`
- [ ] T014 [US1] Attach Delivery payload into profile generation flow in `src/ui/services/profileService.js`

**Checkpoint**: Delivery scoring and storage are independently functional.

---

## Phase 4: User Story 2 - Delivery UI Flow (Priority: P1)

**Goal**: User can complete one Delivery test in UI and review resulting metrics.

**Independent Test**: User answers Delivery questions in UI, completion state updates correctly, and resulting Delivery profile is generated without needing other modules.

### Tests for User Story 2

- [ ] T015 [P] [US2] Add Delivery UI component interaction tests in `tests/unit/ui.deliveryModule.test.js`
- [ ] T016 [P] [US2] Add Delivery progress/completion tests in `tests/unit/ui.deliveryProgress.test.js`

### Implementation for User Story 2

- [ ] T017 [US2] Create Delivery UI component using single question bank in `src/ui/components/Delivery.svelte`
- [ ] T018 [US2] Integrate Delivery into survey flow and module chips in `src/ui/pages/SurveyPage.svelte`
- [ ] T019 [US2] Add Delivery summary rendering in review/summary components (`src/ui/components/Summary.svelte`)
- [ ] T020 [US2] Ensure import-resume repopulates Delivery answers correctly in `src/ui/pages/SurveyPage.svelte`

**Checkpoint**: Delivery questionnaire UX is complete and resumable.

---

## Phase 5: User Story 3 - ContextFile + IAM Delivery Export (Priority: P2)

**Goal**: Delivery data exports in ContextFile and IAM includes optional Delivery segment per canonical IAM spec.

**Independent Test**: Export includes `profile.modules.universal.delivery` and IAM includes `/DELIVERY/...` segment when Delivery exists.

### Tests for User Story 3

- [ ] T021 [P] [US3] Add IAM Delivery formatting tests in `tests/unit/iam.delivery.test.js`
- [ ] T022 [P] [US3] Add export/import round-trip tests for Delivery in `tests/unit/ui.stateExportRetention.test.js`

### Implementation for User Story 3

- [ ] T023 [US3] Extend IAM builder with Delivery segment in `src/lib/iam/iam.js` using canonical rules from `specs/personality-specs/personality_code.spec.md`
- [ ] T024 [US3] Include Delivery in serializer output in `src/lib/serializer/toContextFile.js`
- [ ] T025 [US3] Ensure markdown export includes Delivery-aware IAM guidance in `src/ui/services/profileService.js`
- [ ] T026 [US3] Ensure importer supports Delivery block from ContextFile/markdown JSON payload in `src/lib/importer/index.js`

**Checkpoint**: Delivery is fully portable via ContextFile and IAM.

---

## Phase 6: Migration and Cleanup (Priority: P2)

- **Purpose**: Remove legacy split-module wiring and align docs/tests to single Delivery model.

- [ ] T027 Remove any remaining REL/CAP/COG/PER/ENV runtime split-module references in `src/ui` and `src/lib` (keep question taxonomy only inside Delivery scorer)
- [ ] T028 [P] Add regression tests to ensure single Delivery source of truth in `tests/unit/ui.modules.test.js`
- [ ] T029 Update developer docs for Delivery architecture in `docs/developer/ui.md`
- [ ] T030 Update examples to include Delivery payload and IAM Delivery segment in `specs/001-personality-context-site/example.json`

---

## Phase 7: Polish and Verification

- [ ] T031 [P] Run targeted test suite for Delivery and IAM (`deliveryScorer`, `iam`, `serializer`, `ui` tests)
- [ ] T032 Fix regressions and capture outcomes in `specs/003-universal-preference-modules/implementation-notes.md`
- [ ] T033 Update checklist completion status in `specs/003-universal-preference-modules/checklists/requirements.md`

---

## Dependencies and Execution Order

### Phase dependencies

- Phase 1: no dependencies.
- Phase 2: depends on Phase 1 and blocks all user stories.
- Phase 3, 4, 5: depend on Phase 2.
- Phase 6: depends on 3-5.
- Phase 7: depends on all implementation phases.

### User story dependencies

- US1 enables US2 and US3.
- US2 and US3 can proceed in parallel once US1 scorer and data contract are stable.

---

## Parallel Opportunities

- Phase 1: T002 and T003
- Phase 2: T006 and T008
- US1: T009 and T010
- US2: T015 and T016
- US3: T021 and T022
- Phase 6: T028 and T029
- Phase 7: T031 can run while doc/checklist updates proceed

---

## Suggested MVP

1. Complete Phase 1 and 2.
2. Deliver US1 (Delivery scorer + storage).
3. Deliver US2 (Delivery UI completion flow).
4. Deliver US3 (ContextFile + IAM Delivery serialization).
