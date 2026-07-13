# Tasks: Delivery v2 (DELIVERY2)

**Input**: Design documents from `specs/005-delivery-v2/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Included because the spec and plan both require scoring validation, serializer coverage, and UI behavior checks.

**Organization**: Tasks are grouped by user story so the separate Delivery v2 module can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the separate Delivery v2 module scaffolding and question bank used by all later work.

- [X] T001 Create the Delivery v2 question bank in `specs/questions/delivery2_module.txt`
- [X] T002 [P] Add Delivery v2 module metadata/constants scaffold in `src/lib/modules/delivery2Module.js`
- [X] T003 [P] Add Delivery v2 scorer scaffold in `src/lib/scorer/delivery2Scorer.ts`
- [X] T004 [P] Add Delivery v2 help content in `src/ui/help/delivery2.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared data-model and registry support that all Delivery v2 user stories depend on.

**CRITICAL**: No user story implementation should begin until this phase is complete.

- [X] T005 Update shared profile/module types for `delivery2` in `src/lib/types.ts`
- [X] T006 Update module registration to recognize `delivery2` in `src/lib/modules/moduleManager.js`
- [X] T007 Add Delivery v2 state persistence hooks in `src/ui/services/sessionService.js` and `src/ui/services/profileService.js`
- [X] T008 [P] Add optional-module serializer/importer hooks for `delivery2` in `src/lib/serializer/toContextFile.ts` and `src/lib/importer/index.ts`
- [X] T009 [P] Add baseline regression tests for optional `delivery2` presence in `tests/unit/serializer.test.js`

**Checkpoint**: The repository can store and recognize a separate Delivery v2 module entry.

---

## Phase 3: User Story 1 - Separate Delivery v2 Scoring (Priority: P1)

**Goal**: The system can score the dedicated Delivery v2 question bank into six normalized metrics.

**Independent Test**: Given valid Likert responses, the scorer returns raw and normalized scores for STR, DNS, FRM, FMT, EMP, and AUT, including reverse-scored item handling.

### Tests for User Story 1

- [X] T010 [P] [US1] Add Delivery v2 scorer unit tests in `tests/unit/delivery2Scorer.test.ts`
- [X] T011 [P] [US1] Add Delivery v2 reverse-scoring and bounds validation tests in `tests/unit/delivery2Validation.test.ts`

### Implementation for User Story 1

- [X] T012 [US1] Implement Delivery v2 scoring and normalization in `src/lib/scorer/delivery2Scorer.ts`
- [X] T013 [US1] Wire the Delivery v2 scorer into the scoring index in `src/lib/scorer/index.ts`
- [X] T014 [US1] Map the separate question bank items to the six Delivery v2 metrics in `specs/questions/delivery2_module.txt`

**Checkpoint**: Delivery v2 responses can be scored independently of Delivery v1.

---

## Phase 4: User Story 2 - Delivery v2 UI Opt-In Flow (Priority: P1)

**Goal**: Users can opt into Delivery v2, answer its separate questionnaire, and review the resulting preference summary in the UI.

**Independent Test**: A user can enable Delivery v2 as a separate module, complete its questionnaire, and see the module summary without relying on Delivery v1 behavior.

### Tests for User Story 2

- [X] T015 [P] [US2] Add Delivery v2 component interaction tests in `tests/unit/ui.delivery2.test.js`
- [X] T016 [P] [US2] Add module list opt-in and disable-behavior tests for `delivery2` in `tests/unit/ui.moduleList.delivery2.test.js`

### Implementation for User Story 2

- [X] T017 [US2] Create the separate Delivery v2 questionnaire component in `src/ui/components/Delivery2.svelte`
- [X] T018 [US2] Add Delivery v2 to the module list and survey flow in `src/ui/components/ModuleList.svelte` and `src/ui/pages/SurveyPage.svelte`
- [X] T019 [US2] Render Delivery v2 completion and summary states in `src/ui/pages/SurveyPage.svelte` and `src/ui/components/Summary.svelte`
- [X] T020 [US2] Connect Delivery v2 help copy and labels in `src/ui/help/delivery2.md`

**Checkpoint**: Delivery v2 can be enabled, completed, and reviewed as its own module.

---

## Phase 5: User Story 3 - Delivery v2 Export and Import (Priority: P2)

**Goal**: Delivery v2 exports and imports cleanly through JSON ContextFile and IAM serialization.

**Independent Test**: Exported profiles retain `delivery2`, IAM includes `/DELIVERY2/...`, and re-import restores the module state without affecting Delivery v1.

### Tests for User Story 3

- [X] T021 [P] [US3] Add IAM formatting tests for `/DELIVERY2/` in `tests/unit/iam.test.js`
- [X] T022 [P] [US3] Add export/import round-trip tests for `delivery2` in `tests/unit/serializer.test.js`

### Implementation for User Story 3

- [X] T023 [US3] Extend the IAM builder to emit the `/DELIVERY2/...` segment in `src/lib/iam/iam.js`
- [X] T024 [US3] Include `delivery2` in ContextFile serialization in `src/lib/serializer/toContextFile.ts`
- [X] T025 [US3] Restore `delivery2` state during import in `src/lib/importer/index.ts`
- [X] T026 [US3] Keep Delivery v2 profile persistence aligned with export/import in `src/ui/services/profileService.js`

**Checkpoint**: Delivery v2 is portable and round-trips through export/import.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation alignment, and end-to-end verification across the separate Delivery v2 module.

- [X] T027 [P] Update feature notes and examples for Delivery v2 in `specs/005-delivery-v2/quickstart.md`
- [X] T028 [P] Run targeted Delivery v2 and serialization tests (`tests/unit/delivery2Scorer.test.ts`, `tests/unit/delivery2Validation.test.ts`, `tests/unit/serializer.test.js`, `tests/unit/iam.test.js`, and Delivery v2 UI tests)
- [X] T029 Update the Delivery v2 checklist completion state in `specs/005-delivery-v2/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundation; US1 should be completed before US2 and US3 where shared scoring assumptions are needed.
- **Polish (Final Phase)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1**: Independent scoring path for Delivery v2.
- **US2**: Depends on the shared module/data scaffolding from Phase 2 and benefits from US1 scoring definitions.
- **US3**: Depends on the shared module/data scaffolding from Phase 2 and can be completed once the serializer/importer hooks exist.

### Within Each User Story

- Tests should be written before implementation.
- Data/model changes before UI wiring.
- Scoring and validation before export/import.
- Keep the separate Delivery v2 module independent from Delivery v1 unless explicitly sharing infrastructure.

## Parallel Opportunities

- Phase 1: T002, T003, and T004 can run in parallel.
- Phase 2: T008 and T009 can run in parallel.
- US1: T010 and T011 can run in parallel.
- US2: T015 and T016 can run in parallel.
- US3: T021 and T022 can run in parallel.
- Phase 6: T027 and T028 can run in parallel.

## Parallel Example: User Story 1

```bash
Task: "Add Delivery v2 scorer unit tests in tests/unit/delivery2Scorer.test.ts"
Task: "Add Delivery v2 reverse-scoring and bounds validation tests in tests/unit/delivery2Validation.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate that the separate Delivery v2 scoring path works on its own.

### Incremental Delivery

1. Setup + Foundation establish the separate module skeleton.
2. US1 delivers the scoring and question-bank logic.
3. US2 delivers the opt-in UI flow.
4. US3 delivers export/import and IAM serialization.
5. Polish verifies the full separate-module flow end to end.
