# Feature Specification: Universal Preference Modules

**Feature Branch**: `[003-universal-preference-modules]`

**Created**: 2026-05-21

**Status**: Draft

**Input**: User description: "Add additional universal personalization modules for relational dynamics, cognitive accessibility, cognitive/formatting preferences, persona boundaries, and professional ecosystem constraints."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture Universal Preference Settings (Priority: P1)

A user completes a single Delivery assessment that captures how they want the assistant to communicate, format information, challenge assumptions, and account for accessibility or work constraints.

**Why this priority**: This is the foundation of the feature. Without reliable capture of Delivery preferences, the rest of the personalization layer cannot work.

**Independent Test**: A user can answer the module questions, save the results, and see a summary of their chosen settings without completing any other feature flow.

**Acceptance Scenarios**:

1. **Given** a new or existing profile, **When** the user completes the Delivery questionnaire, **Then** the system stores a normalized Delivery profile for all defined metrics.
2. **Given** partial answers, **When** the user stops before finishing, **Then** the system preserves completed answers and clearly marks Delivery completion as partial.
3. **Given** a user skips the Delivery questionnaire, **When** the profile is saved, **Then** Delivery remains optional and does not block saving.

---

### User Story 2 - Apply Preferences to Assistant Behavior (Priority: P2)

A user receives responses that reflect their relational, cognitive, and environmental preferences so the assistant feels more useful across different domains.

**Why this priority**: The main value of the feature is not just storing preferences, but using them to improve the quality, tone, and structure of responses.

**Independent Test**: A user can compare two responses to the same question and verify that the assistant uses the selected preferences for tone, density, and directness.

**Acceptance Scenarios**:

1. **Given** a profile with high directness preference, **When** the assistant answers a question, **Then** the response is concise and does not over-soften criticism.
2. **Given** a profile with high validation preference, **When** the assistant answers a difficult question, **Then** the response acknowledges the user's concern before moving to the solution.
3. **Given** a profile with a screen-reader or voice-first preference, **When** the assistant answers, **Then** the response favors phrasing that is easy to follow by ear.

---

### User Story 3 - Share or Export a Tailored Context (Priority: P3)

A user exports a personal context package where `.iam.json` is the canonical machine-readable storage artifact.

**Why this priority**: Delivery is useful only if the user can control when it is shared and keep the profile portable.

**Independent Test**: A user can export `.iam.json`, verify that it contains complete answers/scores with top-level `iam` first, and confirm module data can be restored from the exported file.

**Acceptance Scenarios**:

1. **Given** a profile with Delivery scores, **When** the user exports context, **Then** `.iam.json` includes Delivery only when sharing settings allow Delivery inclusion.
2. **Given** any export, **When** files are generated, **Then** `.iam.json` stores machine-readable context with no duplicate payload sections.
3. **Given** an exported `.iam.json`, **When** it is opened, **Then** the first top-level entry is `iam` and all module answers/scores remain present.
4. **Given** an imported context file with Delivery data, **When** the user opens the profile, **Then** Delivery values are visible and editable.

---

### Edge Cases

- What happens when the user leaves one or more Delivery domains unanswered?
- How does the system behave when a user selects conflicting preferences, such as highly supportive feedback but also highly direct critique?
- What happens when a profile is optimized for voice output but the user later switches to screen-first reading?
- How should the system treat Delivery values that are missing, partially complete, or manually edited?
- What happens when a user wants the profile for self-understanding but not for sharing with others?

## Requirements *(mandatory)*

### Functional Requirements

-- **FR-001**: The system MUST allow users to add one optional Delivery module that includes relational dynamics, cognitive accessibility, cognitive and formatting preferences, persona boundaries, and professional ecosystem constraints.
-- **FR-002**: The system MUST support one short, user-friendly Delivery questionnaire using a consistent answer scale.
- **FR-003**: The system MUST convert questionnaire results into normalized values that can be compared and reused consistently across features.
-- **FR-004**: The system MUST allow users to skip Delivery without blocking saving, exporting, or later editing.
-- **FR-005**: The system MUST retain both user-facing answers and the normalized Delivery summary.
- **FR-006**: The system MUST use the stored preferences to adapt response tone, structure, challenge level, formatting density, and accessibility style when relevant.
-- **FR-007**: The system MUST allow the user to choose whether Delivery is included in shared or exported context artifacts.
-- **FR-008**: The system MUST make it clear when Delivery contains preferences that may affect how an assistant speaks, writes, or challenges the user.
-- **FR-009**: The system MUST support viewing and editing previously saved Delivery values.
-- **FR-010**: The system MUST remain compatible with profiles that do not include Delivery.
-- **FR-011**: The system MUST support a compact summary format for Delivery so the profile can be shared across assistants without losing core preference signals.
-- **FR-012**: The system MUST source Delivery questions from a single curated question-bank file under `specs/questions/delivery_module.txt` and keep that file versioned with this feature.
-- **FR-013**: The system MUST store Delivery in the context profile with both raw responses and normalized metric scores.
-- **FR-014**: The system MUST append one compact IAM segment for Delivery when export settings allow inclusion, following the canonical IAM format rules in `specs/personality-specs/personality_code.spec.md`.
-- **FR-015**: The system MUST preserve backwards compatibility for parsers by making Delivery optional and ignorable when unknown, consistent with `specs/personality-specs/personality_code.spec.md`.
- **FR-016**: The system MUST export a dedicated machine-readable JSON storage file using filename `<profile_base>.iam.json`, where `<profile_base>` is `profile.context` by default or `first.last` when name is present.
- **FR-017**: The exported `.iam.json` MUST place top-level `iam` as the first entry and derive it from profile scores/modules when missing.
- **FR-018**: The exported `.iam.json` MUST contain all recorded answers and scoring data needed to restore modules, while removing duplicate sections (for example embedded/duplicated raw-response payload blocks).
- **FR-019**: In `.iam.json`, skills MUST be stored once as `profile.modules.skills.responses`.
- **FR-020**: In `.iam.json`, each stored skill response MUST omit derived fields (`threshold_status`, `listed_status`, `normalized_score`); IAM inclusion thresholds MUST be computed from `raw_score` at runtime.
- **FR-021**: In `.iam.json`, redundant skill arrays such as `profile.modules.skills.filtered` and `profile.modules.skills.normalized` MUST NOT be emitted.

### Key Entities *(include if feature involves data)*

- **Relational Preference**: A profile component that describes how the user wants the assistant to position itself relative to them, including peer-level behavior, validation, challenge tolerance, and humor preference.
- **Cognitive Preference**: A profile component that describes how the user prefers information to be structured, including abstraction level, formatting density, and readability style.
- **Professional Environment Baseline**: A profile component that describes how much autonomy, bureaucracy, and external constraint the user typically works within.
- **Accessibility Preference**: A profile component that describes reading variance, voice-first needs, and other durable presentation preferences.
- **Normalized Preference Score**: A standardized 0-100 value derived from questionnaire answers for reuse in personalized responses and shared context.

## Question Module and Sources


The following single question-bank file defines Delivery questions and all subscales used in onboarding and edit flows:

- `specs/questions/delivery_module.txt`

Delivery combines metrics from these domains inside one test:

- REL: deference, peer-level, challenge tolerance
- CAP: density support, audio-first support, structural clarity
- COG: abstraction, formatting preference, verbosity
- PER: empathy/validation, candor, humor tolerance
- ENV: autonomy, bureaucracy

Question design notes:

- All items use a 5-point agreement Likert response.
- Items marked reverse in the source file are reverse-scored before normalization.
- All item wording in the source file is adapted and newly authored from construct-level literature, not copied verbatim from proprietary instruments.

Research basis used to derive constructs:

- Need for Cognition (Cacioppo and Petty) for abstraction/effortful-thought preference.
- Interpersonal Reactivity Index (Davis) for empathy/perspective-taking style.
- Communicator-style directness literature for candor and diplomatic-vs-direct delivery.
- Humor style literature for affiliative banter tolerance.
- Job control/workplace autonomy and Organizational Constraints Scale domain framing for AUT/BUR.

## Context File Additions

Context file schema and IAM serialization contracts are canonicalized in:

- `specs/personality-specs/personality_code.spec.md`

The context profile MUST add a new `modules.universal.delivery` object under profile modules when Delivery is completed.

Example shape:

```json
"profile": {
	"modules": {
		"universal": {
			"delivery": {
				"responses": [4, 5, 5, 2, 5, 1, 5, 1, 4, 5, 4, 1, 5, 4, 2, 5, 1, 4, 4, 5, 3, 2, 1, 2, 4, 3, 5, 3, 5, 4],
				"normalized": {
					"def": 38,
					"peer": 82,
					"chl": 90,
					"dns": 86,
					"aud": 75,
					"str": 92,
					"abs": 88,
					"fmt": 79,
					"vbs": 58,
					"emp": 62,
					"cnd": 91,
					"hmr": 46,
					"aut": 84,
					"bur": 60
				}
			}
		}
	}
}
```

Contract rules:

- Delivery is optional and independently present.
- `responses` preserves original questionnaire answers for editability and auditability.
- `normalized` stores 0-100 metric values used for downstream behavior and IAM export.
- Missing Delivery MUST not invalidate import/export of existing profiles.
- Machine-readable persistence is stored in `.iam.json`.

## IAM String Additions

Canonical IAM serialization, segment order, and version semantics are defined in:

- `specs/personality-specs/personality_code.spec.md`

This feature adds one Delivery-specific delta to that canonical contract:

- When enabled for export, IAM appends optional segment `DELIVERY`.

Proposed compact segment format:

- `/DELIVERY:DEFxxPEERxxCHLxxDNSxxAUDxxSTRxxABSxxFMTxxVBSxxEMPxxCNDxxHMRxxAUTxxBURxx`

Where `xx` is a rounded 0-100 integer score.

Versioning rules:

- If Delivery is present, IAM version is promoted to at least `0.7` per canonical IAM spec.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of test users can complete the new preference profile in under 3 minutes.
- **SC-002**: At least 85% of test users report that the assistant response style matches their chosen communication and formatting preferences.
-- **SC-003**: At least 95% of exported profiles with Delivery preserve the user-selected include/exclude choice correctly.
- **SC-004**: At least 80% of test users can tell whether the assistant is using direct, validating, or high-structure output based on their saved profile.
- **SC-005**: At least 90% of test users with accessibility-oriented preferences report that the resulting output is easier to follow than a generic response.

## Assumptions

-- Delivery is optional and additive rather than replacing existing personality, communication, or state fields.
- The questionnaire can use a short 5-point agreement scale so the profile stays quick to complete.
- The wording of any adapted questions will be reviewed to respect licensing, attribution, and reuse constraints before release.
- Users may want different sharing rules for self-use, trusted collaborators, and public export.
-- Existing profiles remain valid even if they never add Delivery.
- Segment token names in this spec are stable contract names for export and parser compatibility.
