# quickstart.md

## Developer quickstart (Svelte + Vite)

1. Install dependencies (dev)

   npm ci

2. Start dev server

   npm run dev:ui

3. Run unit tests

   npm test

4. Build for production

   npm run build:ui

5. Validate example ContextFile against schema

   npm run validate:json

Notes
- CI uses Node 20 (see .github/workflows/validate-json.yml). Use `npm ci` in CI to ensure reproducible installs.

## Where core logic lives
- `src/lib/scorer/` — scoring, reverse-keying, normalization, ContextFile serializer
- `specs/001-personality-context-site/contextfile.schema.json` — canonical JSON schema

## Export/Import
- Export format: JSON (validated)
- Import: JSON with AJV validation and best-effort module restoration

## IAM v0.7 Delivery + Career + State Segments
- Career segment prefix: `/CAR`
- Delivery segment prefix: `/DELIVERY/`
- Shape: `/CAR{soc8}S{idx}{score}...`
- `soc8` is normalized O*NET SOC (`XX-XXXX.XX` -> `XXXXXXXX`)
- Skills use canonical O*NET positions `S01..S35`
- Sparse encoding: only non-zero/kept skills are emitted

Example (minimal):
- `IAM/0.6:O72C88E55A60N22/CAR15113200S0190S1899`

Example (full):
- `IAM/0.7:O72C88E55A60N22/COMM/DRV80ANC80EXP35AMB65/DELIVERY/DEF40PEER70CHL80DNS75AUD20STR85ABS78FMT82VBS55EMP62CND74HMR30AUT68BUR52/CAR15113200S0190S1899S2485S3360/STATE:bandwidth30,mode:convergent,horizon:now,stakes:critical`

STATE canonical snapshot notes:
- Persist using the full snapshot pattern (not shorthand deltas).
- Clamp `bandwidth` to `0..100` before export.
- Shorthand updates (e.g. `STATE:mode_divergent`) should merge into current snapshot, then re-emit canonical format.

## How to validate locally
- Install dev deps: `npm install` or `npm ci`
- Run validator (checks example.json):

  node specs/001-personality-context-site/scripts/validate-json.js specs/001-personality-context-site/contextfile.schema.json specs/001-personality-context-site/example.json

- Or use the npm script:

  npm run validate:json

## Recommended CI checks
- `npm ci` then `npm run validate:json`
- `npm test` (unit tests)
- `npm run lint` (if linting is added)
- `npm run format` (optional code formatting step)

