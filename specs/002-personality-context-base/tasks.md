# Tasks: Base Personal Context + Communication Modules

**Input**: Design documents from `specs/002-personality-context-base/`

**Prerequisites**: `spec.md`, `communication-module.spec.md`, `contextfile-contract-changes.spec.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare files and assets needed by both modules.

- [X] T001 Create feature notes and assumptions doc in `specs/002-personality-context-base/implementation-notes.md`
- [X] T002 Create O*NET ingestion directory and script scaffold in `scripts/onet/import_onet.js`
- [X] T003 [P] Add O*NET compact seed index file in `src/lib/baseContext/onet-index.json`
- [X] T004 [P] Add communication item bank file (20 items) in `specs/questions/communication_20.txt`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contract and core model updates that block all user stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T005 Update ContextFile JSON schema for `profile.base` and `profile.modules.communication` in `specs/001-personality-context-site/contextfile.schema.json`
- [X] T006 Update protobuf contract for `BaseContext`, `OnetOccupation`, and `Communication` in `specs/001-personality-context-site/contextfile.proto`
- [X] T007 [P] Add/update shared TypeScript model definitions for base and communication in `src/lib/types.ts`
- [X] T008 Add serializer compatibility guards for optional new fields in `src/lib/serializer/toContextFile.js`
- [X] T009 [P] Add schema contract tests for new fields in `tests/unit/serializer.test.js`

**Checkpoint**: Contracts are updated and validated; feature implementation can begin.

---

## Phase 3: User Story 1 - Base Personal Context (Priority: P1) 🎯 MVP

**Goal**: User can add basic personal context (role/job/company/etc.) and select an occupation using O*NET-SOC lookup.

**Independent Test**: User can search/select an O*NET role, enter base fields, export, and see `profile.base` in the output payload.

### Tests for User Story 1

- [X] T010 [P] [US1] Add base-context validation unit tests in `tests/unit/baseContext.test.js`
- [X] T011 [P] [US1] Add UI interaction tests for base-context form and O*NET selection in `tests/unit/ui.baseContext.test.js`

### Implementation for User Story 1

- [X] T012 [P] [US1] Implement O*NET search and normalization helpers in `src/lib/baseContext/index.js`
- [X] T013 [US1] Implement base-context UI component with O*NET typeahead in `src/ui/components/BaseContextPicker.svelte`
- [X] T014 [US1] Integrate base-context component into survey/review flow in `src/ui/pages/SurveyPage.svelte`
- [X] T015 [US1] Persist base-context state in local storage and restore on resume in `src/ui/services/sessionService.js`
- [X] T016 [US1] Attach `profile.base` to generated context payload in `src/ui/services/profileService.js`

**Checkpoint**: Base context feature is independently usable and exportable.

---

## Phase 4: User Story 2 - Communication Psychometric Module (Priority: P1)

**Goal**: User completes 20 communication items and receives normalized DRV/ANC/EXP/AMB scores.

**Independent Test**: Given 20 Likert responses, app computes raw/normalized communication traits and exports them under `profile.modules.communication`.

### Tests for User Story 2

- [X] T017 [P] [US2] Add scorer unit tests for normalization and bounds in `tests/unit/communicationScorer.test.js`
- [X] T018 [P] [US2] Add UI completion/progress tests for communication module in `tests/unit/ui.communicationModule.test.js`

### Implementation for User Story 2

- [X] T019 [P] [US2] Implement communication scorer using Merrill-Reimann mapping in `src/lib/scorer/communicationScorer.js`
- [X] T020 [US2] Add communication module descriptor and sequencing in `src/lib/modules/moduleManager.js`
- [X] T021 [US2] Create communication survey UI component for 20 Likert items in `src/ui/components/Communication.svelte`
- [X] T022 [US2] Integrate communication module into survey workflow and progress state in `src/ui/pages/SurveyPage.svelte`
- [X] T023 [US2] Serialize communication responses and trait scores in `src/ui/services/profileService.js`

**Checkpoint**: Communication module is independently completable and exportable.

---

## Phase 5: User Story 3 - IAM Compact Extension + LLM-Focused Export (Priority: P2)

**Goal**: Export contains communication-aware IAM compact code and clear LLM usage directions in a markdown file with embedded JSON payload.

**Independent Test**: Exported markdown contains IAM compact string with `/COMM/DRV..ANC..EXP..AMB..` when communication is present, plus embedded JSON with base/raw details.

### Tests for User Story 3

- [X] T024 [P] [US3] Add IAM builder tests for communication segment ordering/format in `tests/unit/iam.test.js`
- [X] T025 [P] [US3] Add markdown export tests for required sections and JSON payload in `tests/unit/ui.markdownExport.test.js`

### Implementation for User Story 3

- [X] T026 [US3] Extend IAM generator for communication segment and version bump behavior in `src/lib/iam/iam.js`
- [X] T027 [US3] Update markdown export instructions for LLM usage of IAM/base/raw payload in `src/ui/services/profileService.js`
- [X] T028 [US3] Update export controls copy to markdown-first workflow in `src/ui/components/ExportButtons.svelte`
- [X] T029 [US3] Ensure import handler supports markdown JSON block and preserves base/communication data in `src/ui/pages/SurveyPage.svelte`

**Checkpoint**: LLM-focused markdown export is complete and consistent with IAM extension.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs, and regression verification.

- [X] T030 [P] Update developer docs for new modules and export format in `docs/developer/ui.md`
- [X] T031 [P] Update examples to include `profile.base` and `profile.modules.communication` in `specs/001-personality-context-site/example.json`
- [X] T032 [P] Update pbtxt example parity for new fields in `specs/001-personality-context-site/example.pbtxt`
- [X] T033 Add migration notes for backward compatibility in `specs/002-personality-context-base/implementation-notes.md`
- [X] T034 Run full test suite and capture results in `specs/002-personality-context-base/implementation-notes.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): no dependencies.
- Phase 2 (Foundational): depends on Phase 1 and blocks all user stories.
- Phase 3 (US1), Phase 4 (US2), Phase 5 (US3): depend on Phase 2.
- Phase 6 (Polish): depends on completion of desired user stories.

### User Story Dependencies

- US1 and US2 can proceed in parallel after Phase 2.
- US3 depends on US2 communication outputs and should start after core US2 scoring is implemented.
- US3 also consumes US1 base payload fields for markdown guidance examples.

### Within Each User Story

- Write tests first for scorer/export behavior.
- Implement data/scorer/model layers before UI wiring.
- Wire serializer/export last in each story.

---

## Parallel Opportunities

- Setup tasks `T003` and `T004` can run in parallel.
- Foundational tasks `T007` and `T009` can run in parallel with contract edits once schemas are stable.
- In US1, `T010`, `T011`, and `T012` can run in parallel.
- In US2, `T017`, `T018`, and `T019` can run in parallel.
- In US3, `T024` and `T025` can run in parallel.
- Polish docs/example tasks `T030`, `T031`, and `T032` can run in parallel.

---

## Parallel Example: User Story 2

```bash
# Parallel test/scorer preparation for communication module
Task: "T017 [US2] Add scorer unit tests in tests/unit/communicationScorer.test.js"
Task: "T018 [US2] Add UI completion/progress tests in tests/unit/ui.communicationModule.test.js"
Task: "T019 [US2] Implement scorer in src/lib/scorer/communicationScorer.js"
```

---

## Implementation Strategy

### MVP First (US1 + US2 Core)

1. Complete Phase 1 and Phase 2.
2. Complete US1 (base context) and validate independent export.
3. Complete US2 (communication scoring + module flow) and validate independent export.
4. Demo with markdown export containing embedded JSON and IAM string.

### Incremental Delivery

1. Deliver base context (US1).
2. Deliver communication module (US2).
3. Deliver IAM compact communication extension + markdown export refinements (US3).
4. Finish docs/examples/polish.

### Team Parallel Plan

1. One developer handles Phase 2 contracts.
2. After Phase 2: Developer A on US1, Developer B on US2.
3. Developer C starts US3 once communication outputs are available.
