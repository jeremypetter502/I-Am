# data-model.md

## Entities

- Profile
  - id: string
  - summary: string
  - scores: {extraversion, agreeableness, conscientiousness, neuroticism, openness} (0..100 numbers)
  - raw_scores: map<string, number>
  - modules: {
    ipip: { responses: number[50], raw_trait_scores: map<string, number>, normalized_trait_scores: map<string, number> },
    aesthetics: { minimalism, colorfulness, warmth, texture, motion, imagery, typography, layout, importance },
    music: { factors: map<string, number> },
    extended: map<string, any>
  }
  - tags: map<string, boolean>
  - preferences: map<string, any>
  - pctx: { code: string, version?: string }

## Data Types in Code
- Use TypeScript types for strong validation in scorer and serializer modules.
- Export interfaces from `src/lib/types.ts`.

## Validation
- JSON schema file at `specs/001-personality-context-site/contextfile.schema.json` is the canonical validation artifact.
- Use AJV (Another JSON Schema Validator) in tests and build steps to validate example outputs.

## Storage
- In-memory runtime model; persist via localStorage on explicit user action (export) or optional auto-save.

## Serialization
- JSON: use JSON.stringify with schema_version and generated_at.
- pbtxt: use protobufjs to load contextfile.proto and serialize to text format for export/import.
