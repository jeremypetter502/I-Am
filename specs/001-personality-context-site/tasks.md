# tasks.md

- setup: Initialize project skeleton (package.json, tsconfig, Vite + Svelte)
- lib: Implement `src/lib/scorer/*` (scorer, reverse-keying, normalization, serializer to JSON/pbtxt)
- schema-tests: Add AJV-based tests validating example.json
- ui: Implement Svelte UI with one-question-per-screen flow and export/import controls
- tests: Add unit tests for scorer and serializer
- docs: Update quickstart and contracts
- ci: Add validation step to CI that runs schema-tests
