# Communication

## Summary
Preferred communication posture across DISC-like expression dimensions.

## How to answer
- Use the 1-5 agreement scale based on how you prefer messages to be delivered to you.
- 5 means you strongly want that style in responses; 1 means you generally do not want it.
- Answer from your default professional context so the profile remains stable across sessions.

## Key metrics produced
- DRV (Driver), ANC (Analytical), EXP (Expressive), AMB (Amiable)
- Normalized communication profile used in IAM /COMM segment

## Metric meaning
The four dimensions capture preferred message posture and interaction cadence. Normalization makes the profile portable across prompts and modules.

## How these metrics guide AI behavior
The AI uses this to choose phrasing style, detail level, pacing, and emotional tone, improving readability and reducing back-and-forth clarifications.

## Scoring and Normalization Details
- Input: 20 responses, each from 1 to 5.
- Invalid or missing values default to 3.
- Trait groups (5 items each):
	- Driver: 1-5
	- Analytical: 6-10
	- Expressive: 11-15
	- Amiable: 16-20
- Raw trait range: 5 to 25.
- Normalization:

```text
normalized = ((raw - 5) / 20) * 100
```

- Trait outputs are clamped to 0-100 and rounded to whole numbers.
