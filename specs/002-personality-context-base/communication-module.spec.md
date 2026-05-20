# Communication Preferences Module (Merrill-Reimann)

## Purpose

Define a psychometric communication-preference module that quantifies user interaction style and encodes it into the IAM compact string for fast LLM adaptation.

This module mirrors the existing IPIP scoring pattern: Likert responses -> raw trait totals -> normalized 0..100 trait scores.

## Framework

- Behavioral model: Merrill-Reimann Social Styles.
- Trait dimensions:
  - `DRV` (Driver): direct, fast, outcome-first communication.
  - `ANC` (Analytical): precise, systematic, logic-first communication.
  - `EXP` (Expressive): exploratory, conceptual, idea-first communication.
  - `AMB` (Amiable): collaborative, supportive, relationship-first communication.

## Questionnaire design

- Total items: 20.
- Scale: 1..5 Likert (Strongly Disagree .. Strongly Agree).
- Trait mapping: 5 items per trait.
- Responses are stored in module order, including item IDs to preserve scoring reproducibility.

### Raw scoring

- Per-trait min raw score: 5.
- Per-trait max raw score: 25.
- Raw range: 20.

### Normalization formula

Use the same normalization model used elsewhere in this project:

$$
\text{normalized} = \left(\frac{\text{raw} - 5}{20}\right) \times 100
$$

Implementation notes:

- Clamp output to `0..100`.
- Round to nearest integer for IAM compact encoding.
- Keep decimal precision (if desired) only in internal module details, not in compact token output.

## ContextFile shape

Add communication data under `profile.modules.communication`:

```json
"communication": {
  "responses": [4, 5, 3, 4, 5, 2, 4, 5, 3, 4, 3, 2, 4, 3, 2, 1, 2, 3, 2, 1],
  "raw_trait_scores": {
    "driver": 21,
    "analytical": 18,
    "expressive": 14,
    "amiable": 9
  },
  "normalized_trait_scores": {
    "driver": 80,
    "analytical": 65,
    "expressive": 45,
    "amiable": 20
  },
  "completed": true,
  "last_updated": "2026-05-18T16:00:00Z"
}
```

## IAM compact extension

### Versioning

- Introduce IAM compact version `0.2` when communication segment is included.
- Existing strings without communication remain valid in `0.1`.

### Segment syntax

Communication extension is represented as a dedicated trailing segment:

`/COMM/DRV{d}ANC{a}EXP{e}AMB{m}`

Where each token value is integer `0..100`.

### Full example

`IAM/0.2:O79C85E42A60N35/MIN90CLR20WRM40MOT10IMG30TYP55LAY70/MEL40SOP70UNP55INT20CON65/COMM/DRV85ANC40EXP20AMB15`

## LLM interpretation guidance

- High `DRV`: lead with bottom-line recommendation first; minimize preamble.
- High `ANC`: include method, assumptions, and structured validation.
- High `EXP`: include alternatives, conceptual framing, and ideation paths.
- High `AMB`: keep collaborative tone, supportive phrasing, and progressive pacing.

The module is advisory, not diagnostic. LLM behavior should be adaptive and non-stereotyping.

## Validation rules

- `responses` length must be exactly 20.
- Each response must be integer `1..5`.
- Trait totals must be reproducible from item map.
- `normalized_trait_scores` must be `0..100`.
- Compact segment values must be integers `0..100`.

## Sample item inventory (starter)

### Driver (DRV)

1. I prefer getting straight to the point with minimal introductory context.
2. I prefer concise action steps over extensive explanation.
3. I am comfortable deciding from short, condensed summaries.
4. I prefer responses that start with a clear recommendation.
5. I find long conversational setup unnecessary when solving tasks.

### Analytical (ANC)

6. I need the underlying logic before trusting conclusions.
7. I prefer precise numbers, structure, and traceable reasoning.
8. I value step-by-step validation for important decisions.
9. I prefer explicit assumptions and constraints in answers.
10. I favor organized breakdowns (tables/lists) over broad narratives.

### Expressive (EXP)

11. I like exploring big-picture framing before execution details.
12. I value creative analogies and conceptual examples.
13. I enjoy brainstorming several divergent options.
14. I prefer responses that highlight possibility and innovation.
15. I like speculative what-if exploration before narrowing scope.

### Amiable (AMB)

16. I value supportive tone over blunt efficiency.
17. I prefer collaborative pacing and check-ins during complex tasks.
18. I appreciate contextual validation before critique.
19. I prefer constructive and diplomatic language.
20. I like responses that feel conversational and cooperative.

## Backward compatibility

- If `profile.modules.communication` is missing, behavior remains unchanged.
- Parsers must ignore unknown segments to preserve forward compatibility.

## Security and ethics

- Do not infer mental health or clinical traits from communication scores.
- Use scores only to adapt formatting, pacing, detail level, and collaboration style.
- Allow user override in UI and easy module reset.
