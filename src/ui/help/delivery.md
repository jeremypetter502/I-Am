# Delivery

## Summary
Unified interaction preference module describing how you want information delivered.

## How to answer
- Use the 1-5 agreement scale for each statement (1 = strongly disagree, 5 = strongly agree).
- Answer as if the AI is responding to real work tasks you care about, not hypothetical edge cases.
- Prefer your default preference, even if you occasionally want the opposite style.

## Key metrics produced
- REL: DEF, PEER, CHL
- CAP: DNS, AUD, STR
- COG: ABS, FMT, VBS
- PER: EMP, CND, HMR
- ENV: AUT, BUR

## Metric meaning
Each code is a preference axis (for example, relational stance, cognitive density, and environment assumptions). Higher scores indicate stronger preference for that axis.

## How these metrics guide AI behavior
The AI uses these codes as response controls for directness, explanation depth, structure, empathy level, and challenge style, producing outputs that match your preferred interaction contract.

## Scoring and Normalization Details
- Input: 30 responses, each from 1 to 5.
- Invalid or missing values default to 3.
- Per-item normalization:

```text
normalized_item = ((response - 1) / 4) * 100
```

- Reverse-keyed items are transformed with:

```text
reverse_scored = 6 - response
```

- Each metric (DEF, PEER, CHL, DNS, AUD, STR, ABS, FMT, VBS, EMP, CND, HMR, AUT, BUR) is the average of its mapped item values after reverse-key handling.
- Outputs include both raw metric averages (1-5 scale) and normalized averages (0-100 scale).
