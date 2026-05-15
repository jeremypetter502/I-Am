<!-- Preamble: machine-readable metadata for LLM and tooling -->
```json
{
  "preamble": {
    "purpose": "compact personality profile for LLM prompts",
    "schema_version": "1.0",
    "scoring_version": "ipip-v1",
    "trait_key_map": { "O": "openness", "C": "conscientiousness", "E": "extraversion", "A": "agreeableness", "N": "neuroticism" },
    "normalization": "0-100 (Normalized = ((Raw - 10)/40) * 100 for IPIP-50)",
    "provenance": { "tool": "personality-site", "tool_version": "0.1" },
    "privacy": { "persist_client_side_only": true },
    "usage_snippet": "Use 'profile.scores' for summary prompts; 'modules.ipip' contains detailed responses and trait-level scores."
  }
}
```

# Feature Specification: Personality context generator

**Feature Branch**: `[001-personality-context-site]`

**Created**: 2026-05-12

**Status**: Draft

**Input**: User description: "Create a website to ask questions and generate personal context files based on personality test metrics. There are multiple sets of questions that can be progressively added to the context file: IPIP personality questions, extended personality questions, questions to determine aesthetic preference, and questions to determine musical preference. The results should produce a compact way to describe a user's personality to the LLM."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New user completes core personality tests (Priority: P1)

As a new user, I want to answer the core IPIP personality questions so the system can generate a compact personality profile I can use with an LLM.

**Why this priority**: Core personality metrics are the primary value proposition — enabling personalized behavior from the LLM.

**Independent Test**: A user can complete the core IPIP set and receive a downloadable compact profile file describing major traits and short natural-language summary.

**Acceptance Scenarios**:
1. **Given** a landing page and a start button, **When** a user completes the IPIP questions, **Then** the system displays a concise summary and provides a downloadable context file.
2. **Given** incomplete answers, **When** the user attempts to finish, **Then** form validation highlights missing required responses.

---

### User Story 2 - Progressive additions and importing existing profiles (Priority: P2)

As a returning user, I want to upload a previously generated context file or add extended personality, aesthetic, or musical preference questions over time so my profile can be resumed, enriched, or corrected.

**Why this priority**: Progressive disclosure reduces friction while allowing richer personalization later; importing a prior context file enables continuity across sessions and devices.

**Independent Test**: A returning user can upload a previously exported context file and then re-take a module or add an additional question set; the new results replace the old ones for the affected section and the exported context file reflects the changes. The system indicates which modules were updated.

**Acceptance Scenarios**:
1. **Given** an existing exported context file, **When** the user uploads it, **Then** the system parses and restores the profile and displays which modules are present and which are missing.
2. **Given** an uploaded profile, **When** the user chooses to re-take a module or add an extra question set, **Then** the new results replace the old ones for the relevant section. The system will indicate which modules were updated; users may download and edit the exported context file to make final changes.
3. **Given** a user who uploaded a profile, **When** they opt out of import, **Then** the system allows starting afresh; the uploaded file does not need to be preserved by the system (the user may re-upload it later if needed).

---

### User Story 3 - Review and export (Priority: P3)

As a user, I want to review generated trait scores and see a clear summary of computed changes so I can decide whether to export. The system does not allow editing the exported compact context file within the UI. The UI does allow editing of the generated natural-language summary prior to export, but not low-level context data.

Note: After export, users may edit the downloaded context file in their preferred editor to make final adjustments before reusing or uploading it. The system must provide a concise change summary showing which modules, sections, and fields were added, replaced, or updated compared to any imported profile.

**Why this priority**: Users must control what is shared with downstream models for privacy and accuracy, and must be able to understand exactly what changed without in-app file editing.

**Independent Test**: A user reviews the change summary, optionally edits the 1–2 sentence summary, and exports a file that contains the edited summary and the compact context data reflecting the current profile.

**Acceptance Scenarios**:
1. **Given** a generated profile, **When** a user reviews the change summary and edits the short natural-language summary (optional) and re-exports, **Then** the exported file contains the edited summary and the compact context data reflecting the current profile.
---

### Edge Cases

- What happens if a user abandons the flow mid-test? (save progress, offer to resume or discard)
- How are conflicting answers across sets reconciled? (merge strategy documented)
- How should partial imports (missing modules) be treated in the UI and change summary? (e.g., prompt to infer vs explicit user confirmation) [Edge Case]
- What recovery options are available if an export/import round-trip produces inconsistent or invalid data? (rollback guidance, user-visible warnings) [Edge Case]
- How is user consent for optional analytics or server persistence obtained and recorded? (consent flow, opt-in/out) [Edge Case]

## Requirements *(mandatory)*

**Normative sections guidance**: Normative requirement sections must not include implementation details (frameworks, libraries, or low-level design). Implementation guidance belongs in "Implementation Notes (Non-normative)" and reference documents. This keeps requirements readable by non-technical stakeholders and prevents accidental coupling of requirements to an implementation approach.


### Functional Requirements

- **FR-001**: The system MUST present the core IPIP question set and clearly indicate estimated completion time (displayed as approximate minutes or as percentage progress).
- **FR-002**: The system MUST allow adding additional question sets (extended personality, aesthetic, musical) progressively.
- **FR-003**: The system MUST validate responses and prevent submission with missing required fields.
- **FR-004**: The system MUST generate a compact context file summarizing trait scores and a 1-2 sentence natural-language persona summary.
- **FR-011**: The system MUST present a concise change summary before export that lists which modules, sections, and fields were added, replaced, or updated compared to any imported profile. The summary must be human-readable and indicate which values were replaced. Users may edit the exported file offline.
- **FR-006**: The system MUST provide an exported, compact, portable profile format (plain text or small machine-readable format) suitable for embedding in LLM prompts.
- **FR-013**: The system MUST support exporting ContextFiles in both JSON (schema-validated) and Protocol Buffers Text Format (pbtxt). Export format selection must be available in the UI prior to download.
- **FR-007**: The system MUST surface clear privacy/consent steps before saving or exporting personal data. The system will not provide server-side persistent profile storage by default; profiles remain client-side (in-memory during the session or in browser local storage) and are exported/imported by users to persist. Any server-side storage must be opt-in and explicitly documented.
- **FR-008**: Scoring rules for each question set MUST be documented and versioned alongside the spec.
- **FR-009**: The system MUST accept an imported ContextFile and perform best-effort ingestion: validate against the canonical schema, import valid modules automatically, and auto-fill reasonable defaults for missing (optional) fields. Any inferred or defaulted values must be clearly flagged in the change summary presented to the user; the user must be able to undo the import or re-import if they reject inferred values.
- **FR-010**: The system MUST allow users to re-take modules or add new question sets after importing. When new results are produced for a module, they MUST replace any previous values for that module (no per-field merges). The system MUST indicate which modules were updated. Final edits can be made by the user by downloading and editing the exported context file.
- **FR-012**: The system MUST provide a client-side scorer utility that computes trait scores (including reverse-scoring), applies configured mappings, and emits a versioned ContextFile ready for export and import.
- **FR-014**: The system MUST provide clear rollback guidance and an undo path when an import or export round-trip produces inconsistent or invalid data. The UI must allow the user to revert to the previous profile state or discard the import and present user-facing warnings describing the inconsistency. [Edge Case]
- **FR-015**: Consent and opt-in actions (for analytics or server-side persistence) MUST be explicitly recorded and included in exported metadata when enabled; the UI must surface the consent action prior to enabling any server-side storage or analytics. [Privacy, Traceability]
- **FR-016**: The system MUST immediately record a user's response and automatically advance to the next question when the user selects an answer option (for example, clicking a numeric choice). The advance MUST NOT require the user to click an explicit "Next" control. Implementations MUST still provide a way to review and change previous answers (e.g., back navigation or a review screen) before final submission, and MUST ensure keyboard and assistive-technology accessibility for selection and navigation. [UX, Accessibility]
- **FR-017**: When a user completes any module (e.g., IPIP, Aesthetics, Music), the system MUST present the user with the option to download a ContextFile that reflects all modules completed so far (a partial ContextFile). The partial ContextFile MUST include completed modules with available responses, module metadata (last_updated, completed flag, scoring_version if available), and any computed scores where scoring inputs are complete. The UI MUST allow choosing the export format (JSON or pbtxt) and MUST validate JSON exports against the canonical schema when possible. (Traceability: relates to FR-004, FR-006, FR-013, FR-011)

### Key Entities *(include if feature involves data)*

- **User**: Person taking tests; usage is anonymous by default. No server-side authentication or accounts are required. The application retains the current profile in local memory/browser storage during the session; users may export/import profile files to persist or transfer profiles.
- **QuestionSet**: A named collection of questions (IPIP, extended, aesthetic, musical).
- **Question**: Individual prompt with answer options and scoring weight.
- **Response**: A user's answers to a QuestionSet.
- **Profile**: Computed metrics (trait scores, derived labels) and a brief natural-language summary.
- **ContextFile**: Compact artifact exported for LLM use (portable machine-readable or plaintext format with key traits).

## Success Criteria *(mandatory)*

**Measurability note**: Success criteria are normative and must be directly traceable to requirements by ID (e.g., SC-001 → FR-001). Where success criteria use qualitative terms ("fast", "compact"), measurable thresholds are provided alongside the criterion. If a threshold depends on environment (device/network), the spec must document the target environment and measurement method.


### Measurable Outcomes

- **SC-001**: 95% of users complete the core IPIP flow without abandonment when estimated time is shown.
- **SC-002**: Exported ContextFiles are <= 4 KB for typical profiles (compactness requirement).
- **SC-003**: Users can add an extra question set and see the profile update within 5 seconds (perceived responsiveness).
- **SC-004**: 100% of generated profiles provide an editable 1-2 sentence summary.

## Assumptions

- The feature will support both immediate anonymous usage and optional account-based persistence; confirmation required (see clarifications).
- Question banks (IPIP, extended, aesthetic, musical) are provided or curated and versioned externally.
- Compact context files will be human-readable and easily pasted into LLM prompts.
- Integration with third-party analytics or storage will require explicit consent.

**Traceability & requirement IDs**: This project uses an explicit ID scheme for requirements (FR-###), success criteria (SC-###), and checklist items (CHK###). All artifacts (tasks, checklists, test vectors) should reference these IDs to ensure traceability. Strive for at least 80% of checklist items to reference a spec section or requirement ID. [Traceability]

## Clarifications

### Session 2026-05-13

- Q: Should the system require persistent user accounts or support anonymous/client-side only profiles? → A: Option C — No server persistence; keep profile in local memory (client-side exports/imports).

- Q: Need a small scoring function that reads responses and emits personal_context output? → A: Yes — include a client-side scoring function.

- Q: Which export formats should be supported for ContextFiles? → A: JSON and Protocol Buffers Text Format (pbtxt). UI should allow choosing format before export.

- Q: Where should the JSON schema file live and how should it be referenced? → A: Option A — Place schema at specs/001-personality-context-site/contextfile.schema.json and reference it from this spec.

- Q: How should imports of incomplete ContextFiles be handled? → A: Option C — Lenient best-effort: auto-fill reasonable defaults where possible and import; inferred/defaulted fields must be flagged in the change summary.

---

## Implementation Notes (Non-normative)

- Scoring documentation and mapping from question responses to trait scores MUST be maintained in a separate doc referenced by the spec (not included here).
- The compact context file SHOULD include concise trait labels and normalized scores plus a short natural-language summary.
- The canonical ContextFile JSON schema is stored at `specs/001-personality-context-site/contextfile.schema.json` and MUST be referenced by this specification; exported JSON files SHOULD validate against it.

## Question modules (specs/questions)

The repository includes canonical question banks under `specs/questions/`. These files are the source of truth for the client scorer and must be versioned alongside the spec. Summaries:

- IPIP-50 — `specs/questions/ipip_50_respondent.txt`:
  - Purpose: Standard IPIP-50 Big Five items (50 items). Response scale: 1 (Very Inaccurate) → 5 (Very Accurate).
  - Usage: Apply reverse-keying per IPIP rules, sum trait item values and normalize to 0–100 (Normalized = ((Raw - 10)/40) * 100). Scorer must reference this file for item wording and ordering.

- Aesthetic module — `specs/questions/aesthetic_module.txt`:
  - Purpose: Multi-part aesthetic preferences (semantic-differential items, Likert items, context toggles, optional interactive tasks, open-text prompts).
  - Scoring: Normalize all 1–5 items to 0–100 using norm(i) = ((i - 1) / 4) * 100. Semantic-differential items may require inversion per the aesthetic mapping spec (`specs/001-personality-context-site/aesthetic_mapping_spec.txt` or `personality-specs/aesthetic_mapping_spec.txt`).
  - Privacy: Treat item-level responses as personal data; downstream exports and LLM prompts should prefer summary composites and boolean tags rather than raw item lists.

- Aesthetic (casual) — `specs/questions/aesthetic_module_casual.txt`:
  - Purpose: Short 18-item casual aesthetic module for quicker captures.
  - Scoring & composites: Same normalization (0–100). Example composites provided (minimalism, colorfulness, warmth, motion, imagery, typography). Use thresholds (e.g., >=65) to derive boolean tags.

Implementation notes:
- Scorer implementations MUST reference these question files for exact wording and item indices.
- Composite formulas and inversion rules live in the aesthetic mapping spec; ensure consistency between mapping and scorer code.
- During import of existing ContextFiles, flag any inferred or defaulted values derived from partial/question-level data in the change summary presented to users.


### Design & UX Suggestions (Non-normative)

The following recommendations improve completion rates and user engagement; they are optional design techniques and must be balanced with accessibility and privacy requirements. See: `specs/ui-ux-specs/engaging-ui-ux-techniques.md` for full details.

- One question per screen: reduce cognitive load by presenting a single focused item at a time and showing clear progress (percent + milestone messaging).
- Visual-driven choices: use images, icons, or visual examples instead of text-heavy options where appropriate to speed comprehension.
- Smooth, narrative transitions: frame the survey as a journey with animated transitions and progressive storytelling rather than abrupt page reloads.
- Interactive affordances: employ tactile, responsive elements (animated presses, subtle motion) to make interactions feel satisfying while avoiding motion that causes distraction.
- Prominent display (measurable): where the spec uses terms like "prominent" or "primary", provide objective criteria. Recommended defaults: primary CTA font-size >= 18px, minimum tap/click target 44x44 CSS pixels, text contrast ratio >= 4.5:1; primary summary card should occupy at least 30% of the content column width on desktop or be placed above the first viewport fold on mobile. [Clarity, Spec §Design & UX Suggestions]
- Accessibility baseline: define keyboard navigation and focus order requirements for all interactive screens; ensure all interactive controls meet minimum target sizes and ARIA labels where needed. Include guidance for reduced-motion preferences. [Coverage, Spec §Design & UX Suggestions]
- Measured responsiveness: define perceived-interaction thresholds for in-page updates (e.g., update feedback < 500ms) and end-to-end profile recalculation/display time (<= 5s under typical network conditions) to align with SC-003. [Measurability]
- Gamified feedback: provide instant, incremental feedback (badges, evolving avatar, short insights) to reward progress and encourage completion.
- Supportive tone and mobile-first: use conversational language, optimize gestures for touch, and keep the core flow short (recommend 5–10 primary items) to avoid fatigue.
- Shareable outcomes: offer compact, social-friendly result cards or badges to increase perceived value and virality.
- Accessibility and consent: ensure high-contrast, readable typography, explicit consent for storing/exporting data, and options to opt out of animated or gamified experiences.


### UI Requirements (Normative): Layout, Breakpoints & Accessibility

This normative section captures required UX-related requirements that implementations MUST satisfy. These requirements are normative and map to checklist items CHK001..CHK010 and FR-001, FR-009, FR-011, FR-007, FR-014.

#### UI Layout & Breakpoints [Clarity, Coverage]

- Required breakpoints and layout behavior: mobile (<=599px), tablet (600px–1023px), desktop (>=1024px). Implementations MUST describe how primary screens adapt at these breakpoints (single-column mobile, two-column tablet, content+sidebar desktop). The primary summary card should be placed above-the-fold on mobile and occupy at least 30% of the content column on desktop. [Spec §Design & UX Suggestions]
- Single-question-per-screen flow behavior: the core IPIP flow presents one question per screen with a persistent progress indicator. When a user selects an answer option (for example, clicking a numeric choice), the response MUST be recorded and the UI MUST automatically advance to the next question without requiring an explicit "Next" click. Navigation MUST allow backward review and changing of previous answers. Estimated completion time MUST be shown (minutes) or a percentage progress indicator as required by FR-001.

#### Primary CTA & Interaction Targets [Measurability]

- Primary CTA sizing and prominence: recommended minimum font-size 18px for primary CTAs, minimum interactive target 44x44 CSS px, and text contrast ratio >= 4.5:1. Primary CTA placement MUST be consistent across question screens and review/export screens. [Design & UX Suggestions]
- Interaction states: hover, focus, pressed states MUST be documented and consistent across components. State descriptions should reference expected visual change (color/outline/opacity) and required ARIA attributes where applicable.

#### Progress Indicator & Save/Resume Behavior [Coverage, FR-001]

- Progress indicator: must show both percent complete and an estimated remaining time in minutes (or a clear explicit label stating approximate time). The indicator must update as answers are recorded and be visible on all question screens.
- Save/Resume: the UI MUST autosave progress to browser localStorage at least after every 5 answers and provide a clear "Resume" affordance when a saved session exists. Users MUST be able to discard saved progress explicitly.

#### Loading, Zero & Error States [Coverage, Edge Case]

- Loading states: asynchronous operations (e.g., importing a ContextFile, profile recalculation) MUST present a loading affordance with textual status. For short operations, provide inline spinner and ephemeral status (<500ms perceived). For longer operations (>=2s) provide progress or cancel option. For profile recalculation on typical hardware/network, total time MUST be <= 5s (SC-003).
- Zero/empty states: define copy and CTA for no-profile, empty-modules, and no-question-bank scenarios. Provide actionable guidance (e.g., "Start core IPIP survey") and avoid empty blank screens.
- Error & recovery: on import validation failures, present a clear modal describing the problem, list inferred/defaulted fields (FR-009), and provide options: "Undo import (revert to prior state)", "Proceed with inferred defaults", or "Cancel". The undo path MUST restore the prior in-memory profile (FR-014).

#### Accessibility & Keyboard Navigation [Coverage, Measurability]

- Keyboard navigation: all interactive flows MUST be fully operable by keyboard (Tab, Shift+Tab, Enter/Space). Provide a logical focus order and skip links for primary sections. Document focus-visible styles and ARIA roles for composite widgets.
- Reduced motion & preferences: respect the user's reduced-motion preference (prefers-reduced-motion) by disabling non-essential animations.
- Labels & inputs: all form controls MUST have accessible labels and instructions; use aria-describedby for contextual help. The survey SHOULD provide alternative text equivalents for any visual choices used as responses.

#### Traceability & References

- Each UI requirement above maps to checklist items in specs/001-personality-context-site/checklists/ux.md (CHK001..CHK010) and references FR-001 (progress/estimated time), FR-009 (import behavior), FR-011 (change summary), FR-007 (privacy/consent), and FR-014 (rollback/undo).

### IPIP-50 Scoring (reference and algorithm)

This project includes an `ipip_50_respondent` file containing the 50 base IPIP items. The scoring approach below follows common IPIP-50 practice and must be verified against the exact item wording in `ipip_50_respondent`.

Scoring summary:
- Response scale: 1 (Very Inaccurate) to 5 (Very Accurate).
- Reverse-scored items are re-keyed using: Reverse = (Max + 1) - Response — i.e., Reverse = 6 - Response for a 1–5 scale.
- Typical reverse-keying by trait (verify against the file):
  - Extraversion: items 2, 4, 6, 8, 10
  - Agreeableness: items 12, 14, 16, 18, 20
  - Conscientiousness: items 22, 24, 26, 28, 30
  - Neuroticism: items 32, 34, 36, 38, 40
  - Openness: items 42, 44, 46, 48, 50
- Trait raw score: sum of the 10 (re-keyed) item values for that trait (range 10–50).
- Normalized score (0–100): ((Raw - 10) / 40) * 100.

Implementation notes:
- Confirm exact reverse-keyed items by matching `ipip_50_respondent` item wording against authoritative IPIP references (ipip.ori.org). If any item ordering differs, update the key list accordingly.
- Provide a client-side scorer utility that:
  1. Loads respondent answers (array of 50 integers 1–5).
  2. Applies reverse-keying to specified indices.
  3. Computes raw trait sums and normalized 0–100 scores.
  4. Outputs a compact, portable ContextFile containing trait labels, normalized scores (rounded), and a one-line natural-language summary.
- Provide validation vectors and examples for the scorer to verify correct scoring (including reverse-keyed items).

### Aesthetic Mapping Spec (from personality-specs/aesthetic_mapping_spec.txt)

Aesthetic Mapping Spec — Map survey items → personal_context.preferences.aesthetics

Purpose
- Provide a reproducible mapping from the "aesthetic_module.txt" survey into the personal_context data structure that LLMs and tooling already use.
- All scores expressed 0–100 (higher = stronger preference).

Normalization helpers
- norm(i) = ((response_i - 1) / 4) * 100  # for any 1–5 item
- inv(x) = 100 - x
- For pairwise tasks: pair_score(option) = (times_chosen / times_presented) * 100

Item reference (numbers match aesthetic_module.txt)
- 1..10 = semantic-differential items (left=1, right=5). 11..32 = Likert statements.

Composite definitions (recommended)
- minimalism_score = mean([inv(norm(3)), inv(norm(4)), norm(11), norm(12), inv(norm(13)), norm(26)])
  - Explanation: items 3 & 4 use left=Simple/Minimal; invert them so higher value => more minimal. Item 13 (dense layouts) inverted.

- colorfulness_score = mean([norm(14), inv(norm(15))])
  - Higher = prefers bold/saturated palettes.

- warmth_score = inv(norm(6))
  - Higher = prefers warm/cozy tones.

- texture_score = mean([norm(8), inv(norm(8))?])
  - NOTE: item 8 is Clean (flat) — Textured. Use inv(norm(8)) if you want "prefers clean" as high.
  - Implementer: pick orientation depending on target trait. For "prefers_clean" use inv(norm(8)); for "prefers_textured" use norm(8).

- motion_score = mean([norm(17), inv(norm(18))])
  - Higher = more comfortable with motion/animations.

- imagery_pref = {
    "photos": norm(19),
    "illustrations": norm(20)
  }

- typography = {
    "prefers_serif": norm(21),
    "prefers_sans": norm(22),
    "prefers_large_headings": norm(23),
    "prioritize_readability": norm(26)
  }

- layout = {
    "grid_consistency": norm(24),
    "experimental_layouts": norm(25)
  }

- modernity_score = mean([norm(5), inv(norm(5))?])
  - NOTE: If item 5 is Modern — Traditional, use inv(norm(5)) to make higher = more modern if left anchor = Modern.

- aesthetic_importance = norm(29)

Context-specific mapping
- If separate responses gathered for home/work toggles (items 31–32), compute:
  - home_style = norm(31)  # higher = playful & expressive
  - work_style = norm(32)  # higher = prefers minimal & professional
- Merge with global composites to create context-weighted aesthetics, e.g.:
  final_aesthetics.home.minimalism = weighted_mean(minimalism_score, 100 - home_style, weights=[0.8,0.2])
  (choose weights based on how much domain-specific answers should override global ones)

Thresholds & tags
- Set boolean tags to simplify rule-based LLMs:
  - prefers_minimal = minimalism_score >= 65
  - prefers_bold_colors = colorfulness_score >= 65
  - prefers_photos = imagery_pref.photos >= 65
  - likes_motion = motion_score >= 60
  - typography_priority_readability = typography.prioritize_readability >= 70

Example personal_context snippet
{
  "preferences": {
    "aesthetics": {
      "minimalism": 82.5,
      "colorfulness": 30.0,
      "warmth": 55.0,
      "motion": 20.0,
      "imagery": {"photos": 80,"illustrations":10},
      "typography": {"serif": 10, "sans": 85, "large_headings": 75, "readability": 95},
      "layout": {"grid": 90, "experimental": 20},
      "importance": 70,
      "tags": {"prefers_minimal": true, "prefers_photos": true}
    }
  }
}

LLM usage guidance (short)
- Use continuous scores (0–100) for soft personalization; use boolean tags for hard rules.
- Example rules:
  - If prefers_minimal: prefer single-column templates, 2–3 color palette, ample whitespace.
  - If prefers_photos: show 2–3 real-photo thumbnails when suggesting restaurants.
  - If likes_motion=false: avoid GIFs/auto-play animations in suggested UIs or messages.
  - Typography: if readability high & prefers_serif low → choose clean sans-serif and larger size for long text.

Pairwise & rich media
- Convert pairwise results into 0–100 preference scores (pair_score). Use these as higher-confidence signals — they often outperform text-only ratings.

Open-text processing
- Free-text answers (favorite brands, 3-words) should be parsed with an LLM into keywords and mapped to `preferences.aesthetics.examples` (e.g., ["Muji", "Aesop", "Apple"]). Save raw free-text separately and don't expose it unless consented.

Privacy & ethics
- Treat aesthetic profiles as personal preference data. Store minimal identifiers, avoid exposing raw item-level responses in downstream outputs, and honor deletion requests.

Implementation tips
- Prefer interactive A/B or palette tasks for stronger signal. Use Likert items as fallback.
- Validate composite reliability on a small pilot before using heavily for UX decisions.

Need a small scoring function that reads responses and emits personal_context output? Provide yes/no.

### Music Mapping Spec (from personality-specs/stomp_mapping_spec.txt)

STOMP Mapping Spec — MUSIC factors, scoring, and personality inferences

Overview
- Uses responses from stomp_music_module_casual.txt (23 genres). Normalizes 1–5 to 0–100.
- Computes five MUSIC composites: Mellow, Unpretentious, Sophisticated, Intense, Contemporary (Rentfrow et al. framework).
- Produces boolean tags and soft personality inferences that can be combined with IPIP results.

Normalization helper
- norm(i) = ((response_i - 1) / 4) * 100  # maps 1..5 → 0..100

Genre → factor mapping (approximate, weighted equally unless noted)
- Mellow: R&B / Soul (19), Easy listening (6), Soulful/pop ballads (use 6/19), Jazz (14)
  Mellow_genres = [6, 14, 19]

- Sophisticated: Classical (3), Jazz (14), Blues (2), Soundtracks / Film scores (23)
  Sophisticated_genres = [3, 14, 2, 23]

- Unpretentious: Country (4), Folk (8), Oldies (16), Religious / Gospel (10,21)
  Unpretentious_genres = [4,8,16,10,21]

- Intense: Heavy metal (11), Punk (18), Rock (22), Alternative (1)
  Intense_genres = [11,18,22,1]

- Contemporary: Pop (17), Electronic (7), Dance (5), Hip-hop / Rap (12), Indie (13), Latin (15)
  Contemporary_genres = [17,7,5,12,13,15]

(Notes: genres can belong to multiple factors; mapping is intentionally broad to capture taste overlaps.)

Composite computation
- For each factor F:
  F_score = mean(norm(g) for g in F_genres)  # result 0..100

Boolean tags (thresholds)
- prefers_mellow = Mellow_score >= 65
- prefers_sophisticated = Sophisticated_score >= 65
- prefers_unpretentious = Unpretentious_score >= 65
- prefers_intense = Intense_score >= 65
- prefers_contemporary = Contemporary_score >= 65

Personality inference rules (soft evidence)
- These rules provide recommended adjustments to Big Five scores. Treat as soft signals (do NOT replace validated questionnaire scores). Use as 'suggested_delta' values and combine with survey via weighted average.

Example suggested deltas (range approx -12..+12):
- If Sophisticated >= 65:
  suggested_delta.Openness += +10
  note: strong indicator of Openness and intellectual curiosity.

- If Intense >= 65:
  suggested_delta.Openness += +6
  suggested_delta.Agreeableness += -5
  suggested_delta.Conscientiousness += -5
  note: Intense listeners often score higher on sensation-seeking & openness, and lower on agreeableness/conscientiousness.

- If Unpretentious >= 65:
  suggested_delta.Extraversion += +6
  suggested_delta.Agreeableness += +6
  suggested_delta.Conscientiousness += +5
  note: correlated with sociability and conventionality.

- If Contemporary >= 65:
  suggested_delta.Extraversion += +7
  note: Contemporary (pop/dance/hip-hop/electronic) often correlates with extraversion.

- If Mellow >= 65:
  suggested_delta.Agreeableness += +6
  suggested_delta.Neuroticism += -4  # often associated with calming, agreeable tastes

Combining music signal with IPIP
- Use music as soft prior. Recommended weighting: final_score = round( survey_score * 0.75 + inferred_score * 0.25 )
  - Where inferred_score = baseline + suggested_delta (baseline could be population mean or survey_score if not available). Adjust weights per confidence (e.g., increase music weight if many corroborating signals like favorite artists align).
- Alternative: produce both the raw survey Big Five and a music-informed recommendation object; let downstream apps decide how to merge.

LLM usage guidance
- Use factor tags to personalize recommendations, e.g.:
  - prefers_sophisticated -> suggest classical/jazz playlists, complex creative tasks, reading-heavy content
  - prefers_intense -> provide high-energy options, adventurous social suggestions, more direct language
  - prefers_mellow -> suggest calming playlists for focus, soft-toned UI themes
  - prefers_contemporary -> recommend upbeat playlists, short-list social/party options
  - prefers_unpretentious -> recommend mainstream, crowd-pleasing venues and playlists
- For messaging: match energy level and familiarity. Example: if prefers_unpretentious and high extraversion, propose social, upbeat suggestions with clear calls-to-action.

Data enrichment
- If user provides top artists/bands, map artists to genres (simple lookup table) and boost corresponding genre norms (e.g., +10 points to matched genre before computing composites).

Confidence & caveats
- Music-genres overlap and personal taste is complex; treat inferred personality adjustments as low-to-moderate confidence.
- Prefer pilot testing for calibration. Use artist-level signals and pairwise A/B picks for higher confidence.

Privacy & consent
- Music preferences and artist lists are personal data. Store minimally and avoid exposing raw lists when personalizing across users.

Example snippet to attach to personal_context
{
  "preferences": {
    "music": {
      "raw_genres": {"Alternative": 80, "Blues": 20, ...},
      "MUSIC_factors": {"mellow": 45, "sophisticated": 72, "unpretentious": 30, "intense": 20, "contemporary": 55},
      "tags": {"prefers_sophisticated": true, "prefers_mellow": false},
      "suggested_bigfive_deltas": {"openness": 10, "extraversion": 0, "agreeableness": -5}
    }
  }
}

Need a small scorer to compute these composites from structured responses? Reply yes to have a ready script created.

### Personality Context Code (PCTX) Specification (from specs/personality-specs/personality_code.spec.md)

# Personality Context Code (PCTX) Specification v0.1

## Purpose

The PCTX code is a compact, labeled, single-line encoding of a user's full
personality profile derived from the IPIP, Aesthetic, and STOMP survey modules.

It is designed for efficient LLM consumption:
- Self-documenting (labels are readable abbreviations — no decoder preamble required)
- Token-efficient (~18 tokens vs ~150 for equivalent structured object)
- Nearly unique per individual when all modules are present
- Gracefully degradable (partial profiles, missing modules, are still valid)

---

## Format

```
PCTX/<version>/<context>:<OCEAN_segment>/<AES_segment>/<MUS_segment>
```

### Version
`0.1` — current version. Increment major when fields are added/removed; minor for scoring changes.

### Context tag (optional)
`W` = work context, `H` = home context, omit for combined/general.

### Full example

```
PCTX/0.1/W:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55/MEL40SOP70UNP55INT20CON65
```

---

## Segments

### OCEAN — Big Five (from IPIP)

Pattern: `O{oo}C{cc}E{ee}A{aa}N{nn}`

Each value is a **rounded integer 0–100**.

| Token | Field           | IPIP Domain      |
|-------|-----------------|------------------|
| `O`   | Openness        | Openness         |
| `C`   | Conscientiousness | Conscientiousness |
| `E`   | Extraversion    | Extraversion     |
| `A`   | Agreeableness   | Agreeableness    |
| `N`   | Neuroticism     | Neuroticism      |

Interpretation thresholds: `≥65` = HIGH, `35–64` = MEDIUM, `<35` = LOW.

Example: `O72C88E55A60N22`

---

### AES — Aesthetic Preferences

Pattern: `MIN{mm}CLR{cc}WRM{ww}MOT{mo}IMG{im}TYP{ty}LAY{la}`

Each value is a **rounded integer 0–100**.

| Token  | Field        | Meaning                                 |
|--------|--------------|-----------------------------------------|
| `MIN`  | Minimalism   | Preference for sparse, clean layouts    |
| `CLR`  | Colorfulness | Preference for rich, saturated color    |
| `WRM`  | Warmth       | Preference for warm vs cool tones       |
| `MOT`  | Motion       | Preference for animated / dynamic UI   |
| `IMG`  | Imagery      | Preference for photos over abstract art |
| `TYP`  | Typography   | Preference for expressive type          |
| `LAY`  | Layout       | Preference for grid/structured layouts  |

Example: `MIN80CLR35WRM60MOT45IMG70TYP65LAY55`

---

### MUS — Music Preferences (STOMP)

Pattern: `MEL{ml}SOP{sp}UNP{un}INT{in}CON{cn}`

Each value is a **rounded integer 0–100**.

| Token  | STOMP Factor    | Representative genres                    |
|--------|-----------------|------------------------------------------|
| `MEL`  | Mellow          | R&B, Soft Rock, Adult Contemporary       |
| `SOP`  | Sophisticated   | Jazz, Classical, Folk                    |
| `UNP`  | Unpretentious   | Country, Bluegrass, Pop                  |
| `INT`  | Intense         | Rock, Punk, Heavy Metal, Alternative     |
| `CON`  | Contemporary    | Rap/Hip-Hop, Electronic/Dance, Pop       |

Example: `MEL40SOP70UNP55INT20CON65`

---

## Partial profiles

Omit any segment that has not been completed. Segments present must follow order:
OCEAN → AES → MUS, separated by `/`.

```
PCTX/0.1:O72C88E55A60N22
PCTX/0.1:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55
```

---

## Uniqueness

| Modules present   | Fields | Integer range | Combinations         |
|-------------------|--------|---------------|----------------------|
| OCEAN only        | 5      | 0–100         | ~10¹⁰                |
| + AES             | 12     | 0–100         | ~10²⁴                |
| + MUS (full)      | 17     | 0–100         | ~10³⁴                |

Each individual's full PCTX code is effectively unique.

---

## LLM usage guidance

When a PCTX code appears in a system prompt or user context block:

1. Parse each labeled segment using the token table above.
2. Apply interpretation thresholds (≥65 HIGH, 35–64 MED, <35 LOW) per field.
3. Use HIGH and LOW flags to influence tone, detail level, format, and suggestions.
4. Do NOT infer clinical or diagnostic conclusions from these scores.
5. Treat the PCTX code as a soft, probabilistic signal — not a rigid rule.

### Quick reference for LLMs

```
HIGH O  → curious, open to novelty, abstract thinker
HIGH C  → structured, detail-oriented, deadline-conscious
HIGH E  → prefers dialogue, concise summaries, social framing
HIGH A  → values harmony, prefers diplomatic tone
HIGH N  → may benefit from reassurance; avoid abrupt responses
HIGH MIN → prefer clean, sparse outputs; avoid visual clutter
HIGH SOP → prefers nuanced, layered analysis; classical references OK
HIGH INT → direct, bold tone; intense topics welcome
```

---

## Security Requirements (Normative): Data protection, import integrity & auditing

This normative section captures required security & privacy requirements that implementations MUST satisfy. These requirements map to CHK001..CHK010 in specs/001-personality-context-site/checklists/security.md and to FR-007, FR-009, FR-015, and FR-014.

### Data protection & consent [Completeness, Traceability]

- Item-level responses and exported ContextFiles are considered personal data. The spec requires explicit handling decisions: masking or omission of raw item-level responses in exported artifacts by default; exports SHOULD contain only derived summaries and consent metadata unless the user explicitly requests item-level export.
- Consent capture: when optional analytics or server-side persistence is enabled, the UI MUST record user consent with timestamp and include consent metadata in exported ContextFiles (field: metadata.consent = { enabled: boolean, timestamp: ISO8601, scope: string }). [FR-015]
- Retention & deletion: optional server-side storage MUST define retention windows and deletion APIs; the UI must surface retention duration and provide a deletion request path tied to the recorded consent. [FR-007]

### Import/Export integrity & validation [Acceptance, Edge Case]

- Import validation: all imported ContextFiles MUST be validated against the canonical JSON schema (specs/001-personality-context-site/contextfile.schema.json). Invalid files MUST present a clear error and the UI MUST offer an undo path if partial imports occurred. [FR-009, FR-014]
- Integrity checks: exported ContextFiles SHOULD include a version field and optional checksum or signature to help detect corruption or tampering during round-trips. Implementations considering server storage MUST include integrity verification on ingest. [FR-009]

### Threat model & incident response [Traceability, Edge Case]

- The spec requires a minimal threat model mapping (tampering, unauthorized access, data exfiltration) and associated requirements: access controls for any optional server-side endpoints, input validation on imports, and schema/version checks prior to applying imported data.
- Breach/incident expectations: for server-side features, document notification expectations and user-visible mitigation steps (e.g., forced logout, revocation of persisted profiles) and tie them to audit logs. [Security checklist]

### Transport, storage & auditing [Clarity]

- Transport: optional server-side communication MUST use TLS. For persisted storage, at-rest encryption is required. These MUST be documented if server-side storage is enabled. [FR-007]
- Auditing: actions that materially change profile state (import, export with consent enabled, deletion, consent changes) MUST be logged with actor, timestamp, and action detail. Logs must be retained per the retention policy and be auditable by the feature owner. [FR-015]

### Responsibilities & risk gating [Dependencies]

- External dependencies (question banks, schema hosting) MUST have an assigned owner and an availability/recovery plan documented. Enablement of optional server-side features must be gated by acceptable-risk criteria defined by the product/security owner.

## Versioning

| Version | Changes                   |
|---------|---------------------------|
| 0.1     | Initial spec               |

---

## Regex pattern (validation)

```
^PCTX\/0\.1(\/[WH])?:O\d{1,3}C\d{1,3}E\d{1,3}A\d{1,3}N\d{1,3}(\/MIN\d{1,3}CLR\d{1,3}WRM\d{1,3}MOT\d{1,3}IMG\d{1,3}TYP\d{1,3}LAY\d{1,3})?(\/MEL\d{1,3}SOP\d{1,3}UNP\d{1,3}INT\d{1,3}CON\d{1,3})?$
```

## Assumptions

- Target users want a short, portable description they can paste into LLM prompts.
- Data retention and account model: By default, profiles remain client-side only (in-memory during the session or stored in browser localStorage). Server-side persistent storage is out of scope unless explicitly enabled and documented (see FR-007 and Clarifications).

## Deliverables

- spec.md (this document)
- scoring rules and versioned question-set definitions
- export format definition for ContextFile






