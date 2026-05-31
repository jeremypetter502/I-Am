# <img src="public/images/iam-logo-trans.png" alt="I-Am Logo"> I-Am Personal Context

[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Svelte](https://img.shields.io/badge/Svelte-5.x-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![Tests](https://img.shields.io/badge/tests-vitest-6E9F18)](https://vitest.dev/)
[![Schema](https://img.shields.io/badge/contract-JSON%20Schema-1f6feb)](specs/001-personality-context-site/contextfile.schema.json)
[![I-AM String Spec](https://img.shields.io/badge/I--AM%20string-spec%20v0.7-0A66C2)](specs/personality-specs/personality_code.spec.md)

## Project Status

- Status: Active development (experimental I-AM string format and scoring iteration).
- Stability: I-AM string core format and module scoring are implemented and test-covered; segment/version behavior may continue to evolve.
- Current storage output: `.iam.json` (machine-readable export and storage artifact).
- Contribution focus: scorer correctness, and I-AM string usage quality, pluggable modules, bug squash 🐛

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

## What I-AM String Solves

The primary focus of this project is the [I-AM string format](docs/iam.md): a compact, portable profile format that helps AI (primarily LLMs) adapt responses to a specific person. It is created from a combination of psychometric and preference questions that are reduced to metrics. There are other [potential use cases](docs/iam-usecase.md) for the I-AM string that can be experimented with.

## Ziggy <img src="public/images/ziggy-iam-intro.png" style="float: right; max-width: 34%; margin: 0 14px 10px 0;" alt="I-Am Logo"> 

Say hi to Ziggy, our resident psychometrician, creative partner, and full-time vibe translator for I-AM.

Ziggy is curious, thoughtful, and here to help people express who they are through the I-AM string. Ziggy shows up with empathy, precision, and just enough sparkle to make psychometrics fun.

## Source Code

This project is a Svelte + Vite single-page app with a modular scoring and serialization pipeline for generating I-AM strings and exportable context files.

### Technologies
- UI: Svelte 5, Vite 6
- Styling: Tailwind CSS 4 (via PostCSS)
- Testing: Vitest + Testing Library (Svelte)
- Serialization/validation: JSON schema (Ajv)
- Runtime format generation: custom I-AM string builder in `src/lib/iam/iam.js`

### Code Organization
- `src/ui/`: presentation layer
  - `pages/SurveyPage.svelte`: main orchestration of module flow, persistence, and export actions
  - `components/`: module UIs (Personality, Aesthetics, Music, Delivery, Skills, Communication, State, Base Context)
  - `services/`: app-side orchestration (`profileService.js`, `sessionService.js`)
  - `help/`: per-module markdown help content shown in UI
- `src/lib/`: domain and transformation logic
  - `scorer/`: pure scoring functions per module
  - `iam/`: I-AM string composition and segment/version logic
  - `serializer/`: ContextFile JSON serialization
  - `importer/`: import and normalization from saved files
  - `state/`: canonical state normalization and state segment formatting
  - `modules/`: module definitions and common module metadata behavior
- `tests/unit/`: regression and behavior tests for UI, scorers, serializers, and importers
- `specs/`: schema, examples, and implementation specs used as source-of-truth references

### Runtime Method (How Data Flows)
1. User answers are captured by module components and persisted as in-progress state.
2. `profileService.js` normalizes module payloads and invokes scorer functions.
3. `buildIam` composes ordered I-AM string segments from scored module data.
4. Serializer functions generate export artifacts as JSON.
5. Import path rehydrates module payloads and preserves module metadata (including disabled flags).

### Modification Guide
- For UI behavior or layout changes, start in `src/ui/pages/SurveyPage.svelte` and relevant `src/ui/components/*` files.
- For scoring changes, update the corresponding file in `src/lib/scorer/` and keep module help text in `src/ui/help/` aligned.
- For I-AM string format changes, update `src/lib/iam/iam.js` and adjust version notes in this README.
- For export/import contract changes, update both `src/lib/serializer/` and `src/lib/importer/`, then update schema/spec docs under `specs/`.

### Developer Commands
- `npm run dev:ui` - run local UI development server
- `npm run test` - run Vitest (watch mode)
- `npx vitest run tests/unit/<file>.test.js` - run a focused test file
- `npm run build:ui` - build production UI
- `npm run lint` - run ESLint
- `npm run format` - run Prettier

## Documentation

- `README.md` - I-AM string concept, format, usage, and contributor overview
- `specs/personality-specs/personality_code.spec.md` - canonical I-AM string format specification
- `specs/001-personality-context-site/spec.md` - feature-level requirements and traceability
- `specs/questions/` - canonical question banks used by scorers

## Contributing

Contributions are welcome. For best results:

1. Start with I-AM string contract changes before UI changes when behavior is format-related.
2. Keep scoring logic in `src/lib/` and avoid duplicating business rules in UI components.
3. Update tests for any scoring, serialization, or I-AM segment behavior change.
4. Keep `src/ui/help/` module guidance aligned with implemented scorer behavior.

If you are looking for a first contribution, improving documentation/spec parity and adding targeted unit tests are excellent entry points.

## Support

- Use GitHub Issues for bug reports and feature requests.
- Include I-AM string examples, expected behavior, and observed behavior in issue reports.
- For format/contract changes, reference relevant files under `specs/`.

## License

See the repository license file for current license terms.


