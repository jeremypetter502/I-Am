# Implementation Plan: Delivery v2 (DELIVERY2)

**Branch**: `main` | **Date**: 2026-06-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-delivery-v2/spec.md`

## Summary

Add a separate, opt-in Delivery v2 module that uses its own question bank, its own `delivery2` profile entry, and a compact `/DELIVERY2/` serialization segment. Delivery v2 must remain independent from Delivery v1, use the same 1-5 Likert response scale as the other module questionnaires, and respect the module `disabled` flag without any version precedence rules.

## Technical Context

**Language/Version**: TypeScript-first implementation in the existing Svelte/Vite app, with compatibility shims where current runtime files are JavaScript.

**Primary Dependencies**: Svelte 5, Vite, Vitest, AJV, existing repo scoring/serializer utilities.

**Storage**: Existing in-memory profile model, JSON/ContextFile export, and module state stored in the profile payload.

**Testing**: Vitest unit tests for scoring, validation, serializer, and UI interactions; schema validation for exported data.

**Target Platform**: Browser-based web application.

**Project Type**: Single web application repository with shared library modules and UI.

**Performance Goals**: Keep scoring and questionnaire rendering client-side and interactive; avoid adding any network dependency for Delivery v2.

**Constraints**: Preserve Delivery v1 unchanged, keep Delivery v2 opt-in, honor `disabled` as authoritative, and match the repository’s existing Likert questionnaire style.

**Scale/Scope**: One new module, one new question bank, one new profile entry, one new scorer path, and limited serializer/importer updates.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code quality: follow strict TypeScript for new work and keep behavior covered by tests.
- Separation of concerns: module scoring, storage, and UI concerns stay isolated.
- Test-first: add or update tests before implementation work.
- UX consistency: keep the same Likert response style as the existing questionnaires.
- Performance: keep scoring and selection client-side.

## Project Structure

### Documentation (this feature)

```text
specs/005-delivery-v2/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── spec.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── modules/
│   │   └── moduleManager.js
│   ├── scorer/
│   │   ├── deliveryScorer.js
│   │   └── delivery2Scorer.ts
│   ├── serializer/
│   │   └── toContextFile.ts
│   ├── importer/
│   │   └── index.ts
│   └── types.ts
└── ui/
    ├── components/
    ├── pages/
    └── services/

tests/
└── unit/
    ├── deliveryScorer.test.js
    ├── delivery2Scorer.test.ts
    ├── delivery2Validation.test.ts
    └── serializer.test.js

specs/questions/
└── delivery2_module.txt
```

**Structure Decision**: Keep Delivery v2 inside the existing single-project web app, with a new scorer, new module payload, and a dedicated question bank alongside the existing Delivery artifacts.

## Complexity Tracking

No constitutional violations require justification at this stage.
