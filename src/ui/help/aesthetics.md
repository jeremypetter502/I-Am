# Aesthetics

## Summary
Visual and presentation preferences for style and formatting cues.

## How to answer
- Each prompt is a contrast pair. Rate how much the left-side descriptor fits you.
- Use 1 when the left descriptor barely fits and 5 when it strongly fits.
- If both sides feel true, choose 3 to mark a balanced preference.

## Key metrics produced
- Normalized style traits (minimalism, colorfulness, warmth, motion, etc.)
- Imagery, typography, and layout preference vectors

## Metric meaning
These metrics describe presentation preferences, not competence. Higher trait values indicate stronger preference for that visual/style axis.

## How these metrics guide AI behavior
The AI uses these vectors to shape output format: denser vs airy layouts, restrained vs vivid examples, and calmer vs more dynamic visual language.

## Scoring and Normalization Details
- Input: 32 responses, each from 1 to 5.
- Invalid or missing values default to 3.
- Response normalization helper:

```text
norm(r) = ((r - 1) / 4) * 100
```

- Composite outputs include minimalism, colorfulness, warmth, clean preference, motion, modernity, and aesthetic importance.
- Additional normalized vectors are produced for imagery, typography, layout, and context.
- Some axes are inverted so higher output consistently represents the target pole (for example, warm over cool and minimal over ornate).
