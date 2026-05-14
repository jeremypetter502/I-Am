# quickstart.md

## Developer quickstart (Svelte + Vite)

1. Install dependencies

   npm install

2. Start dev server

   npm run dev

3. Run unit tests

   npm test

4. Build for production

   npm run build

## Where core logic lives
- `src/lib/scorer/` — scoring, reverse-keying, normalization, ContextFile serializer
- `specs/001-personality-context-site/contextfile.schema.json` — canonical JSON schema
- `specs/001-personality-context-site/contextfile.proto` — protobuf contract for pbtxt

## Export/Import
- Export options: JSON (validated) or pbtxt (protobuf text format)
- Import: use protobufjs for pbtxt parsing and AJV for JSON validation
