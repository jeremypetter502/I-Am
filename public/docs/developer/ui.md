# UI Developer Guide

Run dev server:

npm ci
npm run dev:ui

Dev server listens on port 5178 by default (vite.config). Open http://localhost:5178

Build for production:

npm run build:ui

Notes:
- Question sources:
	- IPIP loads from `/specs/questions/ipip_50_respondent.txt` via `src/ui/services/profileService.js`
	- Aesthetics loads from `/specs/questions/aesthetic_module.txt`
	- Music loads from `/specs/questions/music_module.txt`
	- Delivery loads from `/specs/questions/delivery_module.txt`
	- Communication loads from `/specs/questions/communication_20.txt`
	- Skills uses `src/lib/iam/skillPositionMap.js` (no text question file loader in current UI)
- Profile is stored to localStorage key `iam_profile` for review/export flows
- Progress state is stored in localStorage key `iam_inprogress_v1`
- Base context draft is stored in localStorage key `iam_base_context_v1`
- Core UI entry points:
	- `src/ui/pages/SurveyPage.svelte` for the main survey flow and module selector
	- `src/ui/pages/ReviewPage.svelte` for the saved-profile review screen
	- `src/ui/components/ModuleList.svelte` for the review dashboard module cards
	- `src/ui/components/BaseContextPicker.svelte` for the base context editor
- Modules: State, Base Context, IPIP, Aesthetics, Music, Delivery, Skills, Communication
- Export/download currently produces `.iam.json` machine-readable storage payloads via `toIamDataStorageJson`.
- Survey completion events show a "Context updated" popup with partial-save action.

## Skills Module

The Skills module is implemented as a standalone survey component:
- UI component: `src/ui/components/Skills.svelte`
- Scoring logic: `src/lib/scorer/skillsScorer.js` (`skillsScorer.ts` typed twin)
- Canonical map: `src/lib/iam/skillPositionMap.js` (S01-S35)

### Filtering logic (Results Filter)
- Skills use a 1-10 response scale in `src/ui/components/Skills.svelte`.
- Scores are normalized to 0-100 by multiplying by 10 (see `normalizeLikert` in `src/lib/scorer/skillsScorer.js`).
- Thresholds:
	- `>= 60`: `results_worthy`
	- `< 60`: `omit`
- The current scorer does not emit `conditional` status and does not gate inclusion on confirmation booleans.

### I-AM string / export integration
- Skills are stored under `profile.modules.skills` with:
	- `responses` (full assessment entries)
	- `filtered` (kept list)
	- `normalized` (numeric normalized array)
	- optional `testAnswers` passthrough when present
- I-AM Career segment uses sparse O*NET index encoding:
	- `/CAR15125200S0190S1899S2485S3360`

## State Module

- UI component: `src/ui/components/State.svelte`
- Merge/format helper: `src/lib/state/stateManager.js` (`stateManager.ts` typed twin)
- Canonical serialization shape:
	- `profile.modules.state.bandwidth` in `0..100`
	- `profile.modules.state.mode` in `convergent|divergent`
	- `profile.modules.state.horizon` in `now|long`
	- `profile.modules.state.stakes` in `critical|casual`

### STATE defaults and presets
- Defaults: `bandwidth:50`, `mode:convergent`, `horizon:long`, `stakes:casual`
- Suggested slider presets: `10`, `30`, `50`, `70`, `90`

### Shorthand delta merge behavior
- Start from current canonical snapshot (or defaults).
- Apply one shorthand token at a time (for example `STATE:horizon_now`).
- Update only targeted field and keep all others unchanged.
- Re-emit canonical snapshot as `STATE:bandwidth{bb},mode:{m},horizon:{h},stakes:{s}`.

### Extending skills/categories
- Update `src/lib/iam/skillPositionMap.js` to add/reorder canonical entries.
- Keep S01-S35 ordering stable for decoder compatibility.
- Adjust thresholds in `skillsScorer` if product requirements change.
