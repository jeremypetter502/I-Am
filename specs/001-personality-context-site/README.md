# Personality Context Site - Feature Notes

## Skills Module Overview

The Skills module captures standardized transferable skills using the O*NET 35-skill position map (S01-S35).

- Question bank: specs/questions/skills_module.txt
- Scorer: src/lib/scorer/skillsScorer.js
- IAM encoding: /CAR{soc8}S{idx}{score}...

## Results Filter Philosophy

The module separates broad self-assessment from export-worthy signals:

- Scores <35 are omitted.
- Scores 35-59 are conditional.
- Scores >=60 are results-worthy.
- Scores >=50 require three confirmations before inclusion:
  - Interview Defense
  - Day One Autonomy
  - Relevance & Recency

This keeps exported skills practical and defensible for LLM-assisted resume and interview workflows.

## Example Use Case

A user preparing for interviews completes the skills module and exports:
- Confirmed skills become high-confidence talking points.
- Conditional skills are still visible for review and upskilling plans.
- Omitted skills are excluded from concise IAM signals to reduce noise.

Example Career segment:
- /CAR15125200S0190S1899S2485S3360
