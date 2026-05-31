# Implementation Notes: Base + Communication Modules

## Assumptions

- Base context is optional and stored under `profile.base`.
- Communication module has 20 Likert questions (1..5), 5 per trait.
- IAM compact code upgrades to `0.2` when communication segment is present.
- JSON export (`.iam.json`) is the canonical machine-readable artifact; markdown is a companion human-readable export.

## Migration Notes

- Existing profiles without `profile.base` or `profile.modules.communication` remain valid.
- Existing IAM `0.1` strings remain valid when communication data is absent.

## Validation Log

- Contracts updated:
	- `specs/001-personality-context-site/contextfile.schema.json`
	- `specs/001-personality-context-site/contextfile.proto`
- New modules added:
	- Base context helpers + O*NET seed index
	- Communication scorer + UI module flow
- Export integration:
	- IAM `0.2` communication segment `/COMM:DRV..ANC..EXP..AMB..`
	- JSON-first export/import retains base context and module raw data
- Test run:
	- `npm test -- --run --silent`
	- Result: all tests passed (32 tests)

