# Personality

## Summary
Big Five baseline used as the primary behavioral profile.

## How to answer
- Use the 1-5 scale against your usual behavior, not your best day or worst day.
- 5 means the statement strongly describes you; 1 means it is strongly unlike you; 3 means neutral or mixed.
- Answer quickly and consistently from instinct to reduce overthinking noise.

## Key metrics produced
- OCEAN normalized scores (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
- Trait-level raw and normalized module data

## Metric meaning
Scores are normalized so traits can be compared consistently. Higher values represent stronger expression of that trait relative to the full questionnaire.

## How these metrics guide AI behavior
The AI uses OCEAN to tune delivery strategy: novelty vs structure, assertiveness vs warmth, exploration vs closure, and emotional reassurance depth.

## Scoring and Normalization Details
- Input: 50 responses, each from 1 to 5.
- Trait item groups:
	- O (Openness): items 41-50
	- C (Conscientiousness): items 21-30
	- E (Extraversion): items 1-10
	- A (Agreeableness): items 11-20
	- N (Neuroticism): items 31-40
- Reverse-keyed items:
	- O: 42, 44, 46
	- C: 22, 24, 26, 28
	- E: 2, 4, 6, 8, 10
	- A: 11, 13, 15, 17
	- N: 32, 34
- Raw trait range: 10 to 50.
- Normalization:

```text
normalized = ((raw - 10) / 40) * 100
```

- Output includes both raw and normalized OCEAN trait values.