# Skills Assessment

## Summary
Transferable skills profile with thresholding and confirmation checks.

## How to answer
- Use the 1-10 confidence scale based on repeatable performance, not interest alone.
- A 9-10 should mean you can reliably perform under pressure and explain your approach to others.
- After the main ratings, complete the follow-up checks to validate top skills and reduce overrating bias.

## Key metrics produced
- Normalized scores across skill domains
- Filtered skill list used for export and IAM career encoding

## Metric meaning
Raw confidence ratings are normalized and then filtered by validation logic. The exported skill list favors stronger and better-confirmed capabilities.

## How these metrics guide AI behavior
The AI uses validated strengths to prioritize task plans, role-fit suggestions, and growth recommendations while avoiding advice that assumes unsupported expertise.

## Scoring and Normalization Details
- Input: 35 responses, each from 1 to 10.
- Invalid values are coerced to numeric and clamped to 0-10.
- Normalization:

```text
normalized = round(raw * 10)
```

- Inclusion threshold:
	- normalized >= 60: included in career/IAM output (results-worthy)
	- normalized < 60: omitted from career/IAM output
- Output includes full assessment plus a filtered included list.
