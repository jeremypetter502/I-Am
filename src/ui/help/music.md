# Music

## Summary
Preference profile for listening style and vibe orientation.

## How to answer
- Rate each statement using your long-term listening habits, not only your current mood.
- Use 5 for strong resonance, 1 for little resonance, and 3 for occasional or mixed fit.
- Think in terms of emotional tone and energy profile rather than specific artists.

## Key metrics produced
- Factor scores (mellow, sophisticated, unpretentious, intense, contemporary)
- Normalized module profile for style matching

## Metric meaning
Factor scores capture your preferred tone and energy signatures. Normalized values allow the system to blend this module with other modules coherently.

## How these metrics guide AI behavior
The AI uses this module to tune creative framing, emotional intensity, and cultural reference style so examples feel natural to your preference profile.

## Scoring and Normalization Details
- Input: 20 responses, each from 1 to 5.
- Missing values default to 3.
- Five factors (4 items each):
	- mellow: 1, 4, 6, 10
	- intense: 2, 8, 11, 13
	- sophisticated: 3, 5, 9, 15
	- contemporary: 17, 18, 20, 14
	- unpretentious: 7, 12, 16, 19
- Each factor score is the average of mapped item responses.
- Normalization:

```text
normalized = ((avg - 1) / 4) * 100
```

- Output includes raw factor averages and normalized factor scores.
