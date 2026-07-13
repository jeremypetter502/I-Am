# Quickstart: Delivery v2

## Developer quickstart

1. Install dependencies.

   npm ci

2. Run tests.

   npm test

3. Run linting.

   npm run lint

4. Build the UI.

   npm run build:ui

## Delivery v2 feature checkpoints

- Separate `delivery2` module entry added in the shared profile model.
- Dedicated Delivery v2 question bank added at `specs/questions/delivery2_module.txt`.
- Delivery v2 scorer and normalization logic added in `src/lib/scorer/delivery2Scorer.ts`.
- Serializer, importer, and IAM export support added for `/DELIVERY2/...`.
- Tests added for reverse scoring, module disable behavior, serializer round-trip, IAM formatting, and UI progress.

## Validation commands

Run the focused Delivery v2 validation suite:

`npm test -- --run tests/unit/delivery2Scorer.test.ts tests/unit/delivery2Validation.test.ts tests/unit/serializer.test.js tests/unit/iam.test.js tests/unit/ui.modules.test.js tests/unit/ui.delivery2.test.js tests/unit/ui.moduleList.delivery2.test.js tests/unit/ui.moduleChipProgress.test.js tests/unit/ui.resume.test.js tests/unit/ui.stateExportRetention.test.js`

## Useful references

- [Delivery v2 spec](spec.md)
- Existing questionnaire examples: `specs/questions/delivery_module.txt`
- Existing module patterns: `src/lib/scorer/deliveryScorer.js`, `src/lib/modules/moduleManager.js`
