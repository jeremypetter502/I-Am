# State

## Summary
Runtime situational context for this session only.

## How to answer
- Set Bandwidth to reflect your current cognitive capacity right now (not your typical baseline).
- Choose Mode based on task type: convergent for narrowing/deciding, divergent for exploring/generating.
- Set Horizon and Stakes to match urgency and risk so responses are calibrated to the moment.
- Set Humor to match how much lightness or playfulness should show up in responses.

## Key metrics produced
- Bandwidth (0-100)
- Mode (convergent/divergent), Horizon (now/long), Stakes (casual/critical), Humor (none/low/normal/high)

## Metric meaning
State metrics are dynamic session controls rather than stable traits. They can change frequently as your context changes.

## How these metrics guide AI behavior
The AI uses this as a real-time adjustment layer over your baseline profile, changing brevity, rigor, and risk posture for the current session.

## Scoring and Normalization Details
- This module does not compute trait scores or weighted composites.
- State values are canonicalized to enforce valid ranges and enums:
	- bandwidth: clamped to 0-100 and rounded to integer
	- mode: convergent or divergent (fallback: convergent)
	- horizon: now or long (fallback: long)
	- stakes: critical or casual (fallback: casual)
	- humor: none, low, normal, or high (fallback: normal)
- Default state if missing or invalid:

```text
bandwidth: 50
mode: convergent
horizon: long
stakes: casual
	humor: normal
```

- Canonical IAM state segment format:

```text
STATE:bandwidth<0-100>,mode:<convergent|divergent>,horizon:<now|long>,stakes:<critical|casual>,humor:<none|low|normal|high>
```
