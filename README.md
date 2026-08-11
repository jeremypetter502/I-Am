# <img src="public/images/iam-icon.png" alt="I-Am Logo"> I-Am Personal Context

[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Svelte](https://img.shields.io/badge/Svelte-5.x-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![Tests](https://img.shields.io/badge/tests-vitest-6E9F18)](https://vitest.dev/)
[![Schema](https://img.shields.io/badge/contract-JSON%20Schema-1f6feb)](specs/001-personality-context-site/contextfile.schema.json)
[![I-AM String Spec](https://img.shields.io/badge/I--AM%20string-spec%20IAM--v0.2-0A66C2)](specs/personality-specs/personality_code.spec.md)

## Overview

AI systems suffer from context fragmentation. Every time you start a new chat session or switch to a new AI tool, you are forced to re-explain your communication preferences, working constraints, and personality traits.

**I-AM** solves this with a compact, standardized string format designed for AI context injection. The platform captures survey responses into an `.iam.json` state file, runs them through a modular scoring engine, and compiles them into a portable **I-AM string** that any AI agent can consume to adapt its output immediately.

---

## The I-AM String

The **I-AM string** is the primary output of this project. It condenses multi-dimensional psychometrics, preferences, aesthetic baselines, and real-time state into a single slash-delimited context token string:

```text
IAM-v0.2/BASE:Ziggy/COMMUNICATION:driver70,analytical85,expressive80,amiable60/PERSONALITY:openness85,conscientiousness75,extraversion80,agreeableness88,neuroticism35/MUSIC(Debussy, Metallica, Skrillex):mellow50,intense81,sophisticated69,contemporary63,unpretentious75/AESTHETIC(2001, Project Hail Mary, Dune, Wes21):minimalism67,colorfulness38,warmth75,prefers_clean50,motion63,modernity75,aesthetic_importance75/DELIVERY2:structure75,density31,framing50,format44,empathy50,autonomy63/STATE:bandwidth50,mode:Convergent,horizon:Long,stakes:Casual,domain:Work
```

### How It Works

1. **Survey Input (`.iam.json`):** Your survey answers and question states are saved locally in an `.iam.json` file.
2. **Scoring Engine:** The project processes the saved `.iam.json` data through deterministic module scorers.
3. **String Generation:** A compact **I-AM string** is generated, ready to be pasted into system prompts, injected via APIs, or attached to AI agent initializations.

---

## Core Use Cases

| Use Case | Without I-AM | With I-AM |
| :--- | :--- | :--- |
| **Agent Initialization** | Manually prompt engineering every new model with "speak concisely and act like a senior dev." | Prepend your generated **I-AM string** to system instructions for immediate baseline adaptation. |
| **Cross-Tool Portability** | Persona settings trapped inside individual proprietary AI chat apps. | Generate one **I-AM string** from your `.iam.json` survey state and use it across any LLM or agent runtime. |
| **Dynamic Real-Time State** | Static system prompts that ignore your current focus or energy level. | Append dynamic `STATE` traits (`bandwidth`, `mode`, `horizon`, `stakes`) to shift agent output style on the fly. |

---

## Request for Comments (RFC) & Feedback

We are actively seeking feedback on the **I-AM string protocol** from AI researchers, prompt engineers, and developer tools builders:

*   **String Parsing & Token Efficiency:** Is the slash-delimited `SEGMENT(anchors):traitScore` structure effectively parsed by standard LLM tokenizers, or should trait syntax evolve?
*   **Scoring Accuracy:** How well do the module scorers map `.iam.json` survey responses into operational I-AM string traits?
*   **State Override Mechanics:** How should real-time `STATE` attributes (e.g., `mode:Convergent`, `bandwidth50`) be weighted relative to static `PERSONALITY` traits when injected into context windows?

> Join the discussion on our [GitHub Discussions page](https://github.com/jeremypetter502/I-Am/discussions) or open an issue with your feedback!

---

## Project Status

- **Status:** Active development (I-AM string generation and scoring pipeline).
- **Primary Deliverable:** Generated `IAM-v0.2` string format for model context injection.
- **Survey State File:** `.iam.json` (saves survey questions, options, and module state).
- **Current String Spec:** `IAM-v0.2` supporting modular segments (`BASE`, `COMMUNICATION`, `PERSONALITY`, `MUSIC`, `AESTHETIC`, `DELIVERY2`, `STATE`).
- **Encoding Standard:** Slash-delimited segments (`/`) with colon-separated key-value trait pairs and optional metadata anchors `SEGMENT(anchors):trait1,trait2`.
- **Ordering Rule:** `STATE` segment is always prioritized first after `BASE` when present.

---

## Quick Start

1. Install dependencies:
```bash
npm ci
```

2. Run the application locally:
```bash
npm run dev:ui
```

3. Execute test suite:
```bash
npm run test
```

4. Build production assets:
```bash
npm run build:ui
```

---

## Ziggy <img src="public/images/ziggy-stand-laptop.png" align="right" alt="Ziggy Mascot">

Say hi to Ziggy, our resident psychometrician, creative partner, and full-time vibe translator for I-AM.

Ziggy is curious, thoughtful, and here to help people express who they are through the I-AM string. Ziggy shows up with empathy, precision, and just enough sparkle to make psychometrics fun.

---

## Architecture & Codebase

This repository is built as a Svelte 5 + Vite single-page application that takes survey input, stores state in `.iam.json`, and outputs the compiled I-AM string.

### Tech Stack
- **UI Framework:** Svelte 5, Vite 6
- **Styling:** Tailwind CSS 4 (via PostCSS)
- **Testing:** Vitest + Testing Library (Svelte)
- **Serialization/Validation:** JSON Schema (Ajv)
- **I-AM String Generator:** Custom builder located in `src/lib/iam/iam.js`

### Directory Structure
```text
├── src/
│   ├── ui/             # Presentation layer (Survey UI, modules, help text)
│   │   ├── pages/      # SurveyPage.svelte (orchestration, state persistence, export)
│   │   ├── components/ # Module UIs (Personality, Music, Skills, State, etc.)
│   │   ├── services/   # Profile & session orchestration
│   │   └── help/       # Per-module Markdown help panels
│   └── lib/            # Scoring engine & I-AM string builder
│       ├── scorer/     # Pure functions scoring survey questions
│       ├── iam/        # Core I-AM string composition logic
│       ├── serializer/ # Serializes survey questions into .iam.json
│       ├── importer/   # Rehydrates survey state from .iam.json files
│       └── state/      # State segment formatting rules
├── specs/              # Source-of-truth references and I-AM string specs
└── tests/unit/         # Unit and behavior tests
```

### Data Pipeline Flow
```text
[ User Survey ] ──> [ .iam.json State File ] ──> [ Scorer Pipeline ] ──> [ Generated I-AM String ]
```

1. **Capture:** User survey answers are captured in `src/ui/components/`.
2. **Save State:** In-progress and completed responses are saved in `.iam.json` format.
3. **Score:** `profileService.js` feeds `.iam.json` data into `src/lib/scorer/` functions.
4. **Compile String:** `buildIam` (`src/lib/iam/iam.js`) generates the final, ordered **I-AM string** for use in AI systems.
5. **Rehydrate:** Importing an `.iam.json` file restores full survey state to allow updates or string re-generation.

### Developer Commands

| Command | Action |
| :--- | :--- |
| `npm run dev:ui` | Start local UI development server |
| `npm run test` | Run Vitest in interactive watch mode |
| `npx vitest run tests/unit/<file>.test.js` | Run a single test file |
| `npm run build:ui` | Compile production assets |
| `npm run lint` | Run ESLint checks |
| `npm run format` | Run Prettier code formatting |

---

## Documentation Index

- [`README.md`](README.md) – Overview, setup guide, and I-AM string concepts.
- [`specs/personality-specs/personality_code.spec.md`](specs/personality-specs/personality_code.spec.md) – Canonical I-AM string format specification.
- [`specs/001-personality-context-site/spec.md`](specs/001-personality-context-site/spec.md) – Requirements and survey site traceability.
- [`specs/questions/`](specs/questions/) – Canonical question banks used to generate scoring data.

---

## Contributing

Contributions are welcome! When contributing:

1. **Format First:** Update the I-AM string specification under `specs/` before changing string builder logic.
2. **Keep UI Light:** Scoring logic must remain isolated in pure functions within `src/lib/scorer/`.
3. **Test String Output:** Add or update tests in `tests/unit/` for any changes to survey scoring or I-AM string formatting.

---

## Support & Feedback

- Open a **[GitHub Issue](https://github.com/jeremypetter502/I-Am/issues)** for bugs or feature requests. Please attach example **I-AM strings** and expected vs. actual model behaviors.
- Join our **[GitHub Discussions](https://github.com/jeremypetter502/I-Am/discussions)** for protocol RFCs, string format evolution, and AI integration ideas.

---

## License

See the repository [`LICENSE`](LICENSE) file for current licensing terms.