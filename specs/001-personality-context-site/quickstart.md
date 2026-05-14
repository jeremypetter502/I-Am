# quickstart.md

## Developer quickstart (Svelte + Vite)

1. Install dependencies (dev)

   npm ci

2. Start dev server

   npm run dev

3. Run unit tests

   npm test

4. Build for production

   npm run build

5. Validate example ContextFile against schema

   npm run validate:json

Notes
- CI uses Node 20 (see .github/workflows/validate-json.yml). Use `npm ci` in CI to ensure reproducible installs.

## Where core logic lives
- `src/lib/scorer/` — scoring, reverse-keying, normalization, ContextFile serializer
- `specs/001-personality-context-site/contextfile.schema.json` — canonical JSON schema
- `specs/001-personality-context-site/contextfile.proto` — protobuf contract for pbtxt

## Export/Import
- Export options: JSON (validated) or pbtxt (protobuf text format)
- Import: use protobufjs for pbtxt parsing and AJV for JSON validation

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

