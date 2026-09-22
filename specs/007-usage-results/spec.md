# Feature Specification: Usage Results Comparison

**Feature Branch**: `[007-usage-results]`  
**Created**: 2026-09-21  
**Status**: Draft  
**Input**: `specs/usage-results.md`

## Summary

Create a results browser for the Markdown files in `docs/usage/`. Each source file represents one comparison session and is rendered as its own static HTML page. A build of `docs/usage/usage-basic.md`, for example, produces `dist/usage/usage-basic/index.html`, served at `/usage/usage-basic/`. The page presents the session metadata, lets a visitor select a question title, displays that title's actual AI prompt in a dedicated Question panel, and shows two independently configurable answer panels for side-by-side comparison of AI model and I-AM personality-context variants.

The feature is read-only: it renders the recorded prompts and responses; it does not call an AI model, edit a source result, or generate a new result.

## Source Content Contract

Each Markdown file in the usage-results source folder MUST use this structure:

```md
Title: <session title>
Category: <category>
Participants: <positive integer>
Date: <display date>

# <question label>
<actual question Markdown>
## <model name>
### <personality name>
<answer Markdown>
#### <optional follow-up question>
<follow-up answer Markdown>
```

- The four metadata fields appear before the first level-one heading.
- Each `#` heading starts a selectable question and supplies its short label.
- Markdown between a `#` heading and the first `##` heading is the actual question sent to the AI. In `usage-basic.md`, for example, `Entanglement Question` is the title and `Explain quantum entanglement in terms I would understand.` is the question. This content may contain multiple paragraphs.
- A `##` heading names a model available for the current question.
- A `###` heading names a personality-context variant available for the current model. `None` is a valid name and means no named I-AM profile was applied.
- Personality names are literal source labels. Names that are similar but spelled differently (for example, `Sloan` and `Sloane`) are distinct selectable profiles and MUST NOT be normalized or merged.
- Text following a `###` heading is that model/profile combination's primary response, until its first `####` follow-up or the next heading at level three or higher.
- A `####` heading is an optional follow-up question for the preceding primary response. Its following text is the follow-up response, until the next heading at level four or higher.
- Source answer text supports the Markdown formatting already supported by the site documentation renderer.

Malformed files are not silently reinterpreted: an answer without a containing question, model, and personality is unavailable for comparison and is reported as a content warning in development/build validation.

## User Scenarios & Testing

### User Story 1 - Open a Recorded Comparison (Priority: P1)

As a visitor, I can open a usage-results page and understand what session I am viewing before comparing answers.

**Why this priority**: The page must establish the source and context of the recorded responses.

**Independent Test**: Open the page generated from `docs/usage/usage-basic.md` and confirm its title, category, participant count, and date are visible before the question selector.

**Acceptance Scenarios**:

1. **Given** a valid usage-result file, **When** its page loads, **Then** it displays `Title`, `Category`, `Participants`, and `Date` from that file.
2. **Given** the page has loaded, **When** a visitor has not yet changed the question, **Then** the first question in source order is selected and ready to compare.
3. **Given** the selected question has actual-question Markdown, **When** the page renders, **Then** it displays that source content in a dedicated, visibly labelled `Question` panel between the question-title selector and the two-panel comparison layout.
4. **Given** an unknown result-page identifier is requested, **When** the application cannot locate its source file, **Then** it presents a clear not-found state rather than the survey page or a blank comparison view.

---

### User Story 2 - Choose a Question (Priority: P1)

As a visitor, I can select a recorded question so both panels compare answers to the same prompt.

**Why this priority**: Comparing responses to different questions would invalidate the feature's central purpose.

**Independent Test**: Select two different questions and verify that both panel datasets change to the selected question only.

**Acceptance Scenarios**:

1. **Given** a result page has multiple `#` questions, **When** the visitor opens the question selector, **Then** it lists every question in source order using its level-one label.
2. **Given** a selected question, **When** the visitor selects another question title, **Then** the Question panel and both comparison panels update from the newly selected question.
3. **Given** a question change invalidates a panel's current model or personality, **When** the new question is applied, **Then** that panel selects the first available model and then the first available personality for that model.
4. **Given** a result file contains no valid questions, **When** its page loads, **Then** it shows an empty-results state and does not render unusable selectors.

---

### User Story 3 - Compare Two Answer Variants (Priority: P1)

As a visitor, I can independently choose a model and personality for each panel so that I can see how model choice and I-AM context affect an answer.

**Why this priority**: Independent side-by-side comparison is the feature's main value.

**Independent Test**: For one selected question, set the left panel to one model/profile combination and the right panel to another; confirm that each response remains visible and changes only when its own controls change.

**Acceptance Scenarios**:

1. **Given** a selected question, **When** the comparison view renders on a desktop-width viewport, **Then** it displays two panels side by side.
2. **Given** either panel, **When** the visitor chooses a model, **Then** its personality selector contains only personality names recorded under that model for the selected question.
3. **Given** either panel, **When** the visitor chooses a personality name, **Then** it displays that exact recorded primary answer without altering its meaning or attribution.
4. **Given** the visitor changes a control in one panel, **When** the selection is applied, **Then** the other panel's selection and displayed answer remain unchanged.
5. **Given** the same model/profile combination is selected in both panels, **When** the page renders, **Then** both panels may show it; the feature does not require the two choices to be unique.
6. **Given** a panel has no available response after a question or model change, **When** it renders, **Then** it shows an explicit unavailable state instead of stale answer content.
7. **Given** a newly loaded question has two or more answer combinations, **When** the initial panel selections are made, **Then** the left panel selects the first source-order combination and the right panel selects the next source-order combination, so the initial view is comparative.

---

### User Story 4 - Review Follow-up Context (Priority: P2)

As a visitor, I can read a recorded follow-up question and answer associated with the selected response, so I do not lose explanation that qualifies the comparison.

**Independent Test**: Select the Gemini 3.6 (Thinking) / Sam response for “Entanglement Question” in `usage-basic.md` and confirm its recorded follow-up appears with the primary answer.

**Acceptance Scenarios**:

1. **Given** the selected answer has a `####` follow-up, **When** the panel renders, **Then** it shows the follow-up question and its response after the primary answer, visually distinct but within the same panel.
2. **Given** the selected answer has no follow-up, **When** the panel renders, **Then** no empty follow-up container or placeholder is shown.

---

### User Story 5 - Use the View on Small Screens and with Assistive Technology (Priority: P2)

As a visitor using a small screen or assistive technology, I can still select and read each comparison without losing context.

**Independent Test**: At a viewport below 768px, verify panels stack in a stable left-then-right order; navigate selectors and answer regions with a keyboard and screen reader.

**Acceptance Scenarios**:

1. **Given** the viewport is below the responsive breakpoint, **When** the comparison view renders, **Then** the panels stack vertically in left-panel then right-panel order.
2. **Given** a keyboard-only visitor, **When** they tab through the page, **Then** every question/model/personality selector is reachable, visibly focused, and has a programmatic label that identifies its panel and purpose.
3. **Given** a selector change updates an answer, **When** the response is displayed, **Then** assistive technology can identify the updated answer region and its selected model and personality.
4. **Given** a visitor requests reduced motion, **When** they interact with the view, **Then** transitions do not impede reading or interaction.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST discover and expose each supported Markdown file in `docs/usage/` as an individual usage-results HTML page.
- **FR-001a**: During the site build, the system MUST emit each usage-result page to `dist/usage/<source-file-stem>/index.html`, where `<source-file-stem>` is the Markdown filename without its `.md` extension. The corresponding public URL MUST be `/usage/<source-file-stem>/`.
- **FR-001b**: Markdown filenames MUST be unique across `docs/usage/`. A duplicate filename is a build-time content error because it would create an ambiguous output URL.
- **FR-002**: The system MUST parse the metadata and heading hierarchy defined in the Source Content Contract into a queryable results dataset.
- **FR-003**: A results page MUST display its title, category, participant count, and date above the question selector.
- **FR-004**: A results page MUST provide one question selector populated from its level-one heading labels in source order.
- **FR-005**: The selected question MUST be the common question for both comparison panels.
- **FR-005a**: The system MUST preserve and render the selected question's actual-question Markdown in a dedicated `Question` panel positioned above the two comparison panels. The actual question occurs after its level-one title and before its first model heading.
- **FR-006**: Each comparison panel MUST provide independent model and personality selectors.
- **FR-007**: A panel's personality options MUST be limited to profiles recorded beneath its selected model for the selected question.
- **FR-008**: A panel MUST render the primary response associated with its selected question, model, and personality exactly once.
- **FR-009**: The system MUST render a selected response's optional level-four follow-up question and answer after its primary response.
- **FR-010**: When a selection becomes invalid, the system MUST reset only the affected dependent selection(s) to the first available source-order option and MUST NOT change the other panel.
- **FR-010a**: On initial page load or a question change with no previously valid panel selections, the left panel MUST select the first answer combination in source order and the right panel MUST select the next distinct source-order combination when one exists; otherwise the right panel MUST select the first combination.
- **FR-011**: Desktop layouts MUST present two visible comparison panels side by side; narrow layouts MUST present the same panels in reading order, stacked vertically.
- **FR-012**: The implementation MUST render answer Markdown safely; untrusted source content MUST NOT be injected as executable HTML or script.
- **FR-013**: The implementation MUST provide meaningful empty, unavailable, malformed-content, and not-found states without exposing stale response content.
- **FR-014**: The comparison page MUST use the existing site visual language: dark background, existing I-AM color tokens, card surface treatment, typography, focus treatment, and responsive spacing.
- **FR-015**: The feature MUST not modify source usage Markdown, call external AI services, or persist visitor selections as part of normal viewing.

### Data Entities

- **Usage Result Session**: One source file and its metadata, questions, and source identifier.
- **Question**: A level-one title, its actual-question Markdown, and an ordered list of models.
- **Model Response Group**: A level-two heading under one question with an ordered list of personality responses.
- **Personality Response**: A level-three heading, primary response Markdown, and zero or more optional follow-ups.
- **Follow-up**: A level-four heading and its response Markdown, owned by one personality response.
- **Panel Selection**: Ephemeral UI state of `modelName` and `personalityName` for either the left or right panel.

## Non-Functional Requirements

- Parsing MUST preserve source order and the original visible titles/names for questions, question text, models, and personalities.
- Personality names MUST be matched and displayed as exact, case-sensitive source strings; the parser MUST NOT correct spelling or merge similar names.
- All native form controls MUST have visible labels; labels cannot rely on placeholder text alone.
- The page MUST remain usable with JavaScript-enabled client navigation, consistent with the current Svelte application architecture.
- Rendering an ordinary session file MUST not require a network request to an AI provider.

## Success Criteria

- **SC-001**: 100% of valid source files in `docs/usage/` are reachable as individual results pages.
- **SC-002**: For every valid question/model/personality combination, the displayed primary response matches its source Markdown content and has the correct model and personality attribution.
- **SC-003**: Changing one panel's model or personality leaves the other panel's visible selection unchanged in 100% of interaction tests.
- **SC-004**: At widths of 768px and above, both panels are visible side by side; below 768px, panels stack without horizontal scrolling caused by the comparison layout.
- **SC-005**: 100% of selectors are keyboard-operable and have programmatic labels in accessibility checks.
- **SC-006**: No malformed or unavailable selection displays a response belonging to a previous selection.

## Assumptions and Out of Scope

- `docs/usage/usage-basic.md` is the initial fixture and authoritative example of the source format.
- An actual question is expected below every question title in new source files. To support a heading-only question from an older file, the page may omit the Question panel while retaining the title and comparisons.
- Every usage Markdown filename is unique across `docs/usage/`, so its filename stem is a stable page identifier and output URL segment.
- Usage-result pages are statically generated as individual HTML files during the site build; they are not only client-side SPA routes.
- The initial feature covers local repository files only. Uploading result files, authoring results in the UI, filtering across sessions, full-text search, exporting comparisons, and AI inference are out of scope.
- A question may provide different model/profile combinations. The UI does not fabricate missing combinations.
- If later source files need multiple follow-ups for one response, they may use repeated level-four sections; the initial UI renders them in source order.
