# I-Am Personal Context

[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Svelte](https://img.shields.io/badge/Svelte-5.x-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![Tests](https://img.shields.io/badge/tests-vitest-6E9F18)](https://vitest.dev/)
[![Schema](https://img.shields.io/badge/contract-JSON%20Schema-1f6feb)](specs/001-personality-context-site/contextfile.schema.json)
[![IAM Spec](https://img.shields.io/badge/IAM-spec%20v0.7-0A66C2)](specs/personality-specs/personality_code.spec.md)

## Project Status

- Status: Active development (experimental format and scoring iteration).
- Stability: IAM core format and module scoring are implemented and test-covered; segment/version behavior may continue to evolve.
- Current canonical output: `.iam.json` (machine-readable export and storage artifact).
- Contribution focus: format/spec parity, scorer correctness, import/export reliability, and IAM usage quality.

## Quick Start

1. Install dependencies

```bash
npm ci
```

2. Run the app locally

```bash
npm run dev:ui
```

3. Run tests

```bash
npm run test
```

4. Build production assets

```bash
npm run build:ui
```

## What IAM Solves

The primary goal of this project is the IAM: a compact, portable profile format that helps an LLM adapt responses to a specific person.

An IAM captures stable preferences (personality, communication style, aesthetics, music, skills, delivery preferences) plus optional runtime context (`STATE`) in one machine-friendly string.

The format itself is the core product.

## Why IAM

- Compact: profile context is encoded in a short string instead of long prose.
- Structured: segments are predictable and parseable by tools and prompts.
- Portable: users can move IAM context between sessions, assistants, and workflows.
- Composable: modules are optional, so users can start small and enrich over time.

## IAM Format Overview

An IAM is a versioned, segment-based code:

- Starts with `IAM/<version>`
- Appends optional segments (Personality, Aesthetics, Music, Communication, Delivery, Career/Skills, State)
- Uses normalized values so modules can be combined consistently

See the IAM Segment Anatomy section below for full segment details and links to module docs.

## How IAM Is Generated

1. Collect module responses (user can complete modules progressively).
2. Score each module using documented normalization/scoring rules.
3. Build a profile object and compute IAM segment payloads.
4. Serialize to IAM string plus JSON storage format for export/import.

The included website automates these steps, but IAM generation can be implemented in any system that follows the same scoring and encoding rules.

## Project Scope

- Primary: IAM format design, scoring normalization, segment encoding, and practical LLM usage.
- Secondary: web UI for onboarding, module completion, and IAM export/import experiments.
- Canonical machine-readable output: `.iam.json`.

## Example I-Am String

```text
IAM: IAM/0.6:Jeremy:1975:Male:en-US:EST:O83C60E45A78N33/MIN50CLR38WRM75MOT63/MEL56SOP69UNP69INT69CON50/COMM/DRV75ANC80EXP80AMB55/CAR15125200S0190S0260S0360S0560S0670S0780S08100S0970S1260S1560S1780S1870S1970S2090S2160S23100S2470S2660S2770S3190S3260S3360S3460S3590/STATE:bandwidth50,mode:convergent,horizon:long,stakes:casual
```

## How to Use IAM with an LLM
Provide the IAM to an LLM with a short instruction such as:

- treat IAM as structured user-context metadata
- adapt tone, depth, format, and interaction style to IAM signals
- prefer explicit user instructions if they conflict with older IAM data

This lets responses stay personalized while remaining consistent and auditable.

### Example Use Cases

#### Software
**Question:**
"I need to plan the next sprints work for a refactor. How should I prioritize it?"

**Personalized response style (example):**
"Given your profile, you do best when structure and clarity come first, but you still benefit from room for creative options. I would split this into three buckets: reliability fixes, architecture simplifications, and developer-experience improvements. Start with reliability to reduce risk, then sequence the work that unlocks the most downstream value. Keep each item small enough to complete in 1-2 days so momentum stays high, and leave room for one exploratory improvement if the sprint capacity allows it."

#### Science
**Question:**
"How should I design an experiment to compare two hypotheses without bias?"

**Personalized response style (example):**
"For your communication profile, a clear decision framework will likely feel most useful. Define one primary outcome metric first, then pre-register the stopping rule and exclusion criteria. Use blinded analysis for the final comparison step if possible. If the experiment has multiple possible confounders, isolate the most important one and treat the others as secondary notes rather than trying to control everything at once."

#### Finance
**Question:**
"Can you help me create a monthly budget that I will actually stick to?"

**Personalized response style (example):**
"You are likely to follow plans that are practical and low-friction rather than overly rigid. I suggest a three-layer budget: fixed costs, flexible essentials, and intentional discretionary spending. Add one weekly 10-minute check-in and one automatic transfer on payday. That keeps control high without creating an exhausting tracking burden, and it gives you a simple way to adjust when real life changes."

#### Healthcare
**Question:**
"How can I prepare for a doctor's appointment so I get the most useful answers?"

**Personalized response style (example):**
"You will likely get better results if you prepare a short list instead of trying to remember everything in the room. Write down your top three symptoms, when they started, and what makes them better or worse. Then list your main question in one sentence so the appointment stays focused and efficient."

#### Education
**Question:**
"What's the best way for me to learn a new topic quickly without burning out?"

**Personalized response style (example):**
"A mixed approach will probably work best for you: a short overview first, then hands-on practice, then a quick recap in your own words. Keep sessions short enough that you still feel curious at the end, not drained. If you want, I can turn any topic into a 3-step learning plan with a review schedule."

#### Personalized Interests: Local Events
**Question:**
"What local events would I probably enjoy this month?"

**Personalized response style (example):**
"Based on your profile, events with thoughtful atmosphere and moderate stimulation may be a good fit: design exhibits, science talks with Q&A, small live music venues, book discussions, and curated community workshops. I would avoid recommending only high-intensity festival environments unless you ask for high-energy options. If you share your city, I can shortlist events by vibe, social energy level, and how structured they are."

#### Personalized Interests: New Music
**Question:**
"Recommend new music for me this week."

**Personalized response style (example):**
"Your music pattern suggests a blend of sophisticated and unpretentious tracks, with enough intensity to stay engaging. I would build a 15-song mix across three lanes: reflective tracks for focus, rhythm-forward tracks for momentum, and a few exploratory picks outside your usual genre. If you want, I can return this as a Monday-to-Friday listening schedule matched to work mode, commute mode, or deep-work mode."

#### Personalized Interests: Travel
**Question:**
"What kind of trip would I probably enjoy more: a packed city weekend or a slow nature getaway?"

**Personalized response style (example):**
"You would likely enjoy the version that balances novelty with recovery time. A city trip works best if it includes a few planned highlights and some quiet breaks. A nature getaway works best if there is enough structure to prevent the weekend from feeling vague. If you want, I can compare both options based on your energy level and preferred pace."

## Other Potential Uses

The IAM could be shared with a friend, co-worker, or someone you are meeting for the first time. They could use it to ask the LLM questions about how to better understand and communicate with you.

Other useful applications include:

- Writing style and tone coaching for emails, chats, and presentations.
- Interview preparation and role-play for jobs, networking, or client conversations.
- Team collaboration guidance for managers, coworkers, and cross-functional partners.
- Content personalization for recommendations, newsletters, playlists, and event suggestions.
- Product and UX persona creation for marketing, design, and research teams.
- Onboarding support for new assistants, agents, or tools that need to adapt quickly.
- Self-reflection prompts that help you notice patterns in motivation, focus, and communication.

## Experiment
This method of personal context is in the experimental stages. There may be some overlap or redundancy in the metrics that could be combined. The questions could be better fined tuned to create more useable values for the LLM.

## Risks and Concerns
People are suspect of personality indexes because they have been misused. For example, using a PI for job candidate evaluation is short-sighted

## IAM Segment Anatomy

### 1) Header and Version
- Format starts with `IAM/<version>:`
- Current full format is commonly `IAM/0.6:` when state and/or profile prefix are present.
- Related module help:
  - [Base Context help](src/ui/help/base.md)

### 2) Optional Identity Prefix
When present, these fields are inserted before OCEAN in this order:
- `firstName`
- `birthYear`
- `gender`
- `culture` (or locale fallback)
- `timezoneAbbreviation`

Example:
- `IAM/0.6:Jeremy:1975:Male:en-US:EST:O83C60E45A78N33...`

Timezone abbreviations are normalized from IANA timezone names where available (for example `America/New_York -> EST`).
- Related module help:
  - [Base Context help](src/ui/help/base.md)

### 3) OCEAN Personality Core
- Encoded as `OxxCxxExxAxxNxx`
- Example: `O83C60E45A78N33`
- Related module help:
  - [Personality help](src/ui/help/ipip.md)

### 4) Aesthetics Segment (optional)
- Compact tokens such as:
  - `MIN` (minimalism)
  - `CLR` (colorfulness)
  - `WRM` (warmth)
  - `MOT` (motion)
  - `IMG` (imagery/photos or texture fallback)
  - `TYP` (typography serif preference)
  - `LAY` (layout grid consistency)
- Related module help:
  - [Aesthetics help](src/ui/help/aesthetics.md)

### 5) Music Segment (optional)
- Compact tokens:
  - `MEL` (mellow)
  - `SOP` (sophisticated)
  - `UNP` (unpretentious)
  - `INT` (intense)
  - `CON` (contemporary)
- Related module help:
  - [Music help](src/ui/help/music.md)

### 6) Communication Segment (optional)
- Marker: `/COMM/`
- Tokens:
  - `DRV` (driver)
  - `ANC` (analytical)
  - `EXP` (expressive)
  - `AMB` (amiable)
- Related module help:
  - [Communication help](src/ui/help/communication.md)

### 7) Delivery Segment (optional)
- Marker: `/DELIVERY/`
- Compact tokens may include:
  - `DEF` (deference)
  - `PEER` (peer stance)
  - `CHL` (challenge)
  - `DNS` (density)
  - `AUD` (audience adaptation)
  - `STR` (structure)
  - `ABS` (abstraction)
  - `FMT` (format control)
  - `VBS` (verbosity)
  - `EMP` (empathy)
  - `CND` (candor)
  - `HMR` (humor)
  - `AUT` (autonomy)
  - `BUR` (burden sharing)
- Related module help:
  - [Delivery help](src/ui/help/delivery.md)

### 8) Career/Skills Segment (optional)
- Marker: `/CAR`
- Begins with normalized 8-digit SOC code (for example `15-1252 -> 15125200`)
- Followed by sparse skill pairs:
  - `Sxxpp`
  - `xx` = skill index from 01 to 35
  - `pp` = normalized proficiency from 00 to 99/100 rounded to two digits

Only skills meeting inclusion threshold are emitted.
- Related module help:
  - [Skills help](src/ui/help/skills.md)
  - [Base Context help](src/ui/help/base.md)

### 9) State Segment (optional)
- Marker: `/STATE:`
- Canonical key/value payload, for example:
  - `STATE:bandwidth50,mode:convergent,horizon:long,stakes:casual`
- Related module help:
  - [State help](src/ui/help/state.md)

---

## Version Behavior Notes

- `0.1`: base OCEAN personality only.
- `0.2`: adds communication segment.
- `0.4`: adds career/skills segment.
- `0.6`: used when state is included and/or identity prefix is present.
- `0.7`: includes Delivery segment (`/DELIVERY/...`).

In career-only cases with no personality and no prefix, output may be segment-only (for example `/CAR...`) to preserve compactness.

## Source Code

This project is a Svelte + Vite single-page app with a modular scoring and serialization pipeline for generating IAM strings and exportable context files.

### Technologies
- UI: Svelte 5, Vite 6
- Styling: Tailwind CSS 4 (via PostCSS)
- Testing: Vitest + Testing Library (Svelte)
- Serialization/validation: JSON schema (Ajv)
- Runtime format generation: custom IAM builder in `src/lib/iam/iam.js`

### Code Organization
- `src/ui/`: presentation layer
  - `pages/SurveyPage.svelte`: main orchestration of module flow, persistence, and export actions
  - `components/`: module UIs (Personality, Aesthetics, Music, Delivery, Skills, Communication, State, Base Context)
  - `services/`: app-side orchestration (`profileService.js`, `sessionService.js`)
  - `help/`: per-module markdown help content shown in UI
- `src/lib/`: domain and transformation logic
  - `scorer/`: pure scoring functions per module
  - `iam/`: IAM string composition and segment/version logic
  - `serializer/`: ContextFile JSON serialization
  - `importer/`: import and normalization from saved files
  - `state/`: canonical state normalization and state segment formatting
  - `modules/`: module definitions and common module metadata behavior
- `tests/unit/`: regression and behavior tests for UI, scorers, serializers, and importers
- `specs/`: schema, examples, and implementation specs used as source-of-truth references

### Runtime Method (How Data Flows)
1. User answers are captured by module components and persisted as in-progress state.
2. `profileService.js` normalizes module payloads and invokes scorer functions.
3. `buildIam` composes ordered IAM segments from scored module data.
4. Serializer functions generate export artifacts as JSON.
5. Import path rehydrates module payloads and preserves module metadata (including disabled flags).

### Modification Guide
- For UI behavior or layout changes, start in `src/ui/pages/SurveyPage.svelte` and relevant `src/ui/components/*` files.
- For scoring changes, update the corresponding file in `src/lib/scorer/` and keep module help text in `src/ui/help/` aligned.
- For IAM format changes, update `src/lib/iam/iam.js` and adjust version notes in this README.
- For export/import contract changes, update both `src/lib/serializer/` and `src/lib/importer/`, then update schema/spec docs under `specs/`.

### Developer Commands
- `npm run dev:ui` - run local UI development server
- `npm run test` - run Vitest (watch mode)
- `npx vitest run tests/unit/<file>.test.js` - run a focused test file
- `npm run build:ui` - build production UI
- `npm run lint` - run ESLint
- `npm run format` - run Prettier

## Documentation

- `README.md` - IAM concept, format, usage, and contributor overview
- `specs/personality-specs/personality_code.spec.md` - canonical IAM format specification
- `specs/001-personality-context-site/spec.md` - feature-level requirements and traceability
- `specs/questions/` - canonical question banks used by scorers

## Contributing

Contributions are welcome. For best results:

1. Start with IAM contract changes before UI changes when behavior is format-related.
2. Keep scoring logic in `src/lib/` and avoid duplicating business rules in UI components.
3. Update tests for any scoring, serialization, or IAM segment behavior change.
4. Keep `src/ui/help/` module guidance aligned with implemented scorer behavior.

If you are looking for a first contribution, improving documentation/spec parity and adding targeted unit tests are excellent entry points.

## Support

- Use GitHub Issues for bug reports and feature requests.
- Include IAM examples, expected behavior, and observed behavior in issue reports.
- For format/contract changes, reference relevant files under `specs/`.

## License

See the repository license file for current license terms.


