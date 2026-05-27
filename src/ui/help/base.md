# Base Context

## Summary
Core personal and role metadata that anchors all other module outputs.

## How to answer
- Fill only fields you are comfortable sharing. This module is optional, so you can leave any field blank.
- Prefer current, practical context (role, timezone, locale, experience) over aspirational values.
- Use O*NET job search if you want standardized occupation mapping.

## Key metrics produced
- Identity and role signals (name, job title, company)
- Practical context (timezone, locale, experience, education)
- Optional occupation mapping (O*NET SOC and title)

## Metric meaning
These are grounding attributes, not personality scores. They define your operating context so outputs are relevant to your background and environment.

## How these metrics guide AI behavior
The AI uses this as a context filter, selecting assumptions, examples, and recommendations that fit your role, seniority, locale, and communication context.

## Scoring and Normalization Details
- This module is primarily descriptive metadata and does not produce numeric trait scores.
- Most values are stored as entered (for example role, company, education, locale).
- Some fields are normalized for portability in downstream outputs:
	- timezone may be rendered as a compact abbreviation in IAM identity prefix output when available
	- optional occupation mapping uses standardized O*NET SOC identifiers when selected
- Missing fields are simply omitted rather than imputed into a composite score.
