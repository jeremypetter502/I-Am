# data-model.md

## Entities

- Profile
  - id: string
  - summary: string
  - scores: {extraversion, agreeableness, conscientiousness, neuroticism, openness} (0..100 numbers)
  - raw_scores: map<string, number>
  - modules: {
    ipip: { responses: number[50], raw_trait_scores?: map<string, number>, normalized_trait_scores?: map<string, number>, disabled?: boolean },
    aesthetics: { responses: number[], result?: object, disabled?: boolean },
    music: { responses: number[], result?: object, disabled?: boolean },
    delivery: { responses: number[], result?: object, disabled?: boolean },
    communication: { responses: number[20], raw_trait_scores?: map<string, number>, normalized_trait_scores?: map<string, number>, disabled?: boolean },
    skills: { responses: object[], filtered?: object[], testAnswers?: map<string, object>, disabled?: boolean },
    state: { state: { bandwidth: number(0..100), mode: convergent|divergent, horizon: now|long, stakes: critical|casual }, disabled?: boolean }
  }
  - base: { onet?, job_title?, company?, years_experience?, education_level?, timezone?, locale?, communication_style?, short_bio? }
  - tags: map<string, boolean>
  - preferences: map<string, any>
  - iam: { code: string, version?: string }

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
- JSON is the canonical machine-readable export/import format.
