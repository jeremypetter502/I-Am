# research.md

## Goal
Resolve NEEDS CLARIFICATION items and collect best-practice references for a client-side lightweight JS implementation that separates logic from UI.

## Decisions
- Framework: Use Svelte (lightweight, fast, compiles to minimal JS) or Preact if strict React-compatibility is desired. Svelte recommended for minimal bundle and straightforward reactive model.
- Build: Vite for fast dev server and simple configuration.
- Data & Logic separation: Implement core scorer and serialization as an independent JS module (ESM) under `src/lib/scorer/` and UI under `src/ui/`.
- Serialization format: JSON (validate against schema) as canonical runtime contract.
- Storage: browser localStorage for persistence; in-memory session object during runtime.
- Testing: Vitest for unit tests of scorer, IAM generation, serializer, importer, and UI behavior.

## Rationale
Client-side-only requirement + small bundle favors Svelte + Vite.

## Sources
- Svelte + Vite docs
- AJV JSON schema validation references

## Next steps
- Draft data-model.md mapping schema to code structures.
