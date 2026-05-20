# UI Developer Guide

Run dev server:

npm ci
npm run dev:ui

Dev server listens on port 5174 by default (vite.config). Open http://localhost:5174

Build for production:

npm run build:ui

Notes:
- The UI loads question bank from /specs/questions/ipip_50_respondent.txt
- Profile is stored to localStorage key `iam_profile` for review/export flows
- Progress state is stored in localStorage key `iam_inprogress_v1`
- Base context draft is stored in localStorage key `iam_base_context_v1`
- Modules: Base Context, IPIP, Aesthetics, Music, Skills, Communication, State
- Export produces a markdown context file focused on IAM compact string with embedded JSON payload

## Skills Module

The Skills module is implemented as a standalone survey component:
- UI component: `src/ui/components/Skills.svelte`
- Scoring logic: `src/lib/scorer/skillsScorer.js` (`skillsScorer.ts` typed twin)
- Canonical map: `src/lib/iam/skillPositionMap.js` (S01-S35)

### Filtering logic (Results Filter)
- Normalize 0-5 answers to 0-100 by multiplying by 20.
- Thresholds:
	- `>= 60`: `results_worthy`
	- `35-59`: `conditional`
	- `< 35`: `omit`
- For any score `>= 50`, inclusion additionally requires all confirmations:
	- `interview_defense`
	- `day_one_autonomy`
	- `relevance_recency`

### IAM / export integration
- Skills are stored under `profile.modules.skills` with:
	- `responses` (full assessment)
	- `filtered` (kept list)
	- `normalized`
- IAM v0.6 Career segment uses sparse O*NET index encoding:
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
