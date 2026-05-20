# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## 2026-05-18 Career IAM Extension Plan (Updated 2026-05-18 with Standardized Skills)

### Objective

Add professional context to IAM compact encoding by introducing a Career segment with O*NET role anchor and standardized transferable skill positions from the O*NET 35-skill taxonomy.

### Encoding Contract (v0.4)

- Segment prefix: `/CAR` (simplified, omits redundant `JOB` marker).
- Segment shape: `/CAR{soc8}S{skill_idx}{proficiency}[{skill_idx}{proficiency}]*`
- `soc8` source: O*NET-SOC `XX-XXXX.XX` normalized to 8 digits (e.g., `15-1132.00` → `15113200`).
- Skill encoding: Position-based O*NET standard (S01–S35, canonical list in `specs/personality-specs/personality_code.spec.md`).
- Proficiency format: Integer `00-99` (sparse encoding: only include non-zero skills).
- Segment ordering: OCEAN → AES → MUS → CAR, separated by `/`.
- Backward compatibility: Profiles without CAR segment remain valid; parser is lenient for v0.1–v0.3 strings.

- **Format evolution**:
  - v0.1–v0.3: Used custom 6-token map (`PR`, `LD`, `CT`, `SP`, `DT`, `CR`) — limited scalability.
  - v0.4: Switched to standardized O*NET 35-skill position indices (S01–S35) with simplified `/CAR` prefix — globally scalable, no abbreviation guessing required.

### Workstreams

1. Contract and spec updates
  - Extend IAM spec docs and examples for Career segment grammar, v0.4 standardized skill positions, ordering, and parsing.
  - Update feature spec with FR-024–FR-027 requirements for Skills module and O*NET encoding.
  - Align encoding with round-trip persistence guarantees.

2. Data-model and serializer alignment
  - Define canonical storage for career skills under base/profile model.
  - Map skill filtering results (Confirmed, Conditional, Stale) to IAM position indices (S01–S35).
  - Ensure export paths include `profile.base.onet`, filtered skills, and proficiency values.

3. IAM generator extension
  - Add Career segment builder using O*NET skill positions (S01–S35) with deterministic ordering and `/CAR` prefix.
  - Implement sparse encoding: only include skills with non-zero proficiency.
  - Use Results Filter logic: only skills passing threshold + 3 tests (Interview Defense, Day One Autonomy, Relevance & Recency) are encoded.
  - Preserve backward compatibility for profiles lacking Career data.

4. Import and parser updates
  - Parse Career segment in v0.4 format: decode `/CAR{soc8}S{idx}{prof}` pairs and map to skill names and proficiency.
  - Maintain lenient parsing for older IAM formats (v0.1–v0.3).
  - Hydrate base skill fields and test confirmations from imported CAR segment.
  - Keep markdown and JSON import behavior consistent for base and career fields.

5. Tests and fixtures
  - Add IAM generator tests for Career-only and full-profile strings with v0.4 format.
  - Add sparse encoding tests: verify only non-zero skills are included; verify skill index order is ascending.
  - Add serializer/import round-trip tests proving Career data and skill status persistence without drift.
  - Update example fixtures to include Career segment with v0.4 O*NET skill positions (e.g., `S0190S1899S2485S3360`).
  - Add parser tests for v0.3 → v0.4 migration scenario (old custom tokens unsupported; user must re-generate).

### Validation Criteria

- Generated IAM includes `/CAR{soc8}S...` when valid O*NET + confirmed skills exist.
- Exported context payload retains source base role and skill fields with test confirmations and status labels.
- Import/export round-trip preserves Career segment values without drift; S01–S35 indices remain consistent.
- Existing IAM strings without Career segment remain valid and parseable (backward compatible).
- IAM parser correctly decodes S01–S35 position indices and maps to canonical O*NET skill names without ambiguity.
- Sparse encoding reduces IAM string length for typical professional profiles (e.g., 5–10 relevant skills).

