# I-Am Context Code (IAM) Specification v0.6

## Purpose

The IAM code is a compact, labeled, single-line encoding of a user's full
personality profile derived from the IPIP, Aesthetic, STOMP, Career, and State survey modules.

It is designed for efficient LLM consumption:
- Self-documenting (labels are readable abbreviations — no decoder preamble required)
- Token-efficient (~18 tokens vs ~150 for equivalent JSON when all modules present)
- Nearly unique per individual when all modules are present
- Gracefully degradable (partial profiles, missing modules, are still valid)

---

## Format

```
IAM/<version>/<context>:<OCEAN_segment>/<AES_segment>/<MUS_segment>/<COM_segment>/<CAR_segment>/<STATE_segment>
```

### Version
`0.6` - current version with expanded dynamic user state support (`bandwidth`, `mode`, `horizon`, `stakes`).
Increment major when fields are added/removed; minor for scoring changes.

### Context tag (optional)
`W` = work context, `H` = home context, omit for combined/general.

### Full example

```
IAM/0.6/W:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55/MEL40SOP70UNP55INT20CON65/DRV85ANC40EXP20AMB15/CAR15113200S0190S1899S2485S3360/STATE:bandwidth30,mode:convergent,horizon:now,stakes:critical
```

---

## Segments

### OCEAN — Big Five (from IPIP)

Pattern: `O{oo}C{cc}E{ee}A{aa}N{nn}`

Each value is a **rounded integer 0–100**.

| Token | Field           | IPIP Domain      |
|-------|-----------------|------------------|
| `O`   | Openness        | Openness         |
| `C`   | Conscientiousness | Conscientiousness |
| `E`   | Extraversion    | Extraversion     |
| `A`   | Agreeableness   | Agreeableness    |
| `N`   | Neuroticism     | Neuroticism      |

Interpretation thresholds: `≥65` = HIGH, `35–64` = MEDIUM, `<35` = LOW.

Example: `O72C88E55A60N22`

---

### AES — Aesthetic Preferences

Pattern: `MIN{mm}CLR{cc}WRM{ww}MOT{mo}IMG{im}TYP{ty}LAY{la}`

Each value is a **rounded integer 0–100**.

| Token  | Field        | Meaning                                 |
|--------|--------------|-----------------------------------------|
| `MIN`  | Minimalism   | Preference for sparse, clean layouts    |
| `CLR`  | Colorfulness | Preference for rich, saturated color    |
| `WRM`  | Warmth       | Preference for warm vs cool tones       |
| `MOT`  | Motion       | Preference for animated / dynamic UI   |
| `IMG`  | Imagery      | Preference for photos over abstract art |
| `TYP`  | Typography   | Preference for expressive type          |
| `LAY`  | Layout       | Preference for grid/structured layouts  |

Example: `MIN80CLR35WRM60MOT45IMG70TYP65LAY55`

---

### MUS — Music Preferences (STOMP)

Pattern: `MEL{ml}SOP{sp}UNP{un}INT{in}CON{cn}`

Each value is a **rounded integer 0–100**.

| Token  | STOMP Factor    | Representative genres                    |
|--------|-----------------|------------------------------------------|
| `MEL`  | Mellow          | R&B, Soft Rock, Adult Contemporary       |
| `SOP`  | Sophisticated   | Jazz, Classical, Folk                    |
| `UNP`  | Unpretentious   | Country, Bluegrass, Pop                  |
| `INT`  | Intense         | Rock, Punk, Heavy Metal, Alternative     |
| `CON`  | Contemporary    | Rap/Hip-Hop, Electronic/Dance, Pop       |

Example: `MEL40SOP70UNP55INT20CON65`

---

### COM — Communication Preferences (Merrill-Reimann)

Pattern: `DRV{dr}ANC{an}EXP{ex}AMB{am}`

Each value is a **rounded integer 0–100** representing normalized trait scores from the Merrill-Reimann social styles framework.

| Token | Field        | Meaning                                       |
|-------|--------------|-----------------------------------------------|
| `DRV` | Driver       | Direct, outcome-focused communication         |
| `ANC` | Analytical   | Precise, systematic, logic-focused style      |
| `EXP` | Expressive   | Exploratory, conceptual, idea-focused tone    |
| `AMB` | Amiable      | Collaborative, supportive, relationship-first |

Interpretation thresholds: `≥65` = HIGH, `35–64` = MEDIUM, `<35` = LOW.

Example: `DRV85ANC40EXP20AMB15`

---

### CAR — Career and Standardized Transferable Skills (O*NET-SOC)

Pattern: `CAR{soc8}S{skill_idx}{proficiency}[{skill_idx}{proficiency}]*`

**Components:**
- `CAR` is the segment prefix.
- `soc8` MUST be an 8-digit O*NET-SOC code with punctuation removed.
  - Example: `15-1132.00` → `15113200`
- `S` is the skill marker (within the CAR segment).
- `{skill_idx}` is a 2-digit skill position (01–35, from O*NET standard transferable skills).
- `{proficiency}` is a 2-digit proficiency value (00–99).
- **Sparse encoding**: Only include skills with non-zero proficiency. Order skills by index within the segment.

#### O*NET Standardized Transferable Skills Position Map (S01–S35)

| Pos | Skill Name | Category |
|-----|----------|----------|
| S01 | Reading Comprehension | Cognitive & Analysis |
| S02 | Active Listening | Communication & Interpersonal |
| S03 | Writing | Communication & Interpersonal |
| S04 | Speaking | Communication & Interpersonal |
| S05 | Mathematics | Cognitive & Analysis |
| S06 | Science | Cognitive & Analysis |
| S07 | Critical Thinking | Cognitive & Analysis |
| S08 | Active Learning | Cognitive & Analysis |
| S09 | Learning Strategies | Cognitive & Analysis |
| S10 | Monitoring | Cognitive & Analysis |
| S11 | Social Perceptiveness | Communication & Interpersonal |
| S12 | Coordination | Communication & Interpersonal |
| S13 | Persuasion | Communication & Interpersonal |
| S14 | Negotiation | Communication & Interpersonal |
| S15 | Instructing | Communication & Interpersonal |
| S16 | Service Orientation | Communication & Interpersonal |
| S17 | Complex Problem Solving | Cognitive & Analysis |
| S18 | Troubleshooting | Technical & Specialized |
| S19 | Operations Analysis | Business & Process |
| S20 | Technology Design | Technical & Specialized |
| S21 | Equipment Selection | Business & Process |
| S22 | Installation | Technical & Specialized |
| S23 | Programming | Technical & Specialized |
| S24 | Quality Control Analysis | Technical & Specialized |
| S25 | Equipment Maintenance | Technical & Specialized |
| S26 | Repairing | Technical & Specialized |
| S27 | Time Management | Business & Process |
| S28 | Management of Financial Resources | Business & Process |
| S29 | Management of Material Resources | Business & Process |
| S30 | Management of Personnel Resources | Leadership & Management |
| S31 | Identify Patterns | Cognitive & Analysis |
| S32 | Data Analysis | Cognitive & Analysis |
| S33 | Systems Evaluation | Cognitive & Analysis |
| S34 | Judgment & Decision Making | Cognitive & Analysis |
| S35 | Creativity & Innovation | Creative & Innovation |

**Example strings:**
- Sparse (only 4 skills): `CAR19113200S0190S1899S2485S3360`
  - Skill 01 @ 90, Skill 18 @ 99, Skill 24 @ 85, Skill 33 @ 60
- Full example: `CAR15132000S0190S0289S0775S1865S2355S2990S3285`
  - Software engineer with strong reading, active listening, writing, troubleshooting, operations analysis, complex problem solving, and data analysis

---

### STATE — Dynamic Current User State

Canonical snapshot pattern:
`STATE:bandwidth{bb},mode:{convergent|divergent},horizon:{now|long},stakes:{critical|casual}`

`STATE` values are dynamic and expected to change frequently (session-to-session or task-to-task), unlike stable trait segments.

| Token | Field | Domain | Meaning |
|-------|-------|--------|---------|
| `bandwidth` | Cognitive bandwidth | `0-100` | Current available attention/energy/processing depth |
| `mode` | Epistemic mode | `convergent` or `divergent` | Whether the user needs execution/synthesis vs exploration/ideation |
| `horizon` | Time horizon | `now` or `long` | Immediate live-action urgency vs asynchronous long-window work |
| `stakes` | Verification threshold | `critical` or `casual` | Required rigor/precision based on risk and consequences |

`bandwidth` reference anchors:
- `100` = peak focus, high energy, ready for deep theory and complex debugging
- `50` = baseline productive state
- `10` = exhausted/high cognitive load, needs concise actionable answers only

`bandwidth` interpretation bands:
- `80-100` (HIGH): Encourage deeper exploration, richer context, adjacent concepts
- `40-79` (MEDIUM): Baseline analytical delivery with normal structure and detail
- `0-39` (LOW): Hyper-minimal execution, no filler, immediate actionable output

Additional STATE dimensions:
- `mode:divergent` = brainstorming, hypothesis generation, lateral alternatives
- `mode:convergent` = synthesis/execution, reduce optional branches and distractions
- `horizon:now` = live action / immediate response requirement
- `horizon:long` = asynchronous, staged, long-range planning acceptable
- `stakes:critical` = high verification threshold (explicit checks, stricter certainty)
- `stakes:casual` = lower verification threshold (lighter rigor acceptable)

Canonical example:
`STATE:bandwidth30,mode:convergent,horizon:now,stakes:critical`

Telemetry shorthand (delta update forms, optional):
- `STATE:mode_convergent`
- `STATE:mode_divergent`
- `STATE:horizon_now`
- `STATE:horizon_long`
- `STATE:stakes_critical`
- `STATE:stakes_casual`

Shorthand tokens are convenience deltas; canonical persisted IAM output SHOULD use the full snapshot pattern.

#### UI Contract for State Module

This contract defines how UI/state-management layers SHOULD capture, display, and persist STATE values.

Defaults (when no STATE segment exists):
- `bandwidth: 50`
- `mode: convergent`
- `horizon: long`
- `stakes: casual`

Recommended slider presets (`bandwidth`):
- `10` = "Low" (exhausted/high load)
- `30` = "Limited"
- `50` = "Baseline"
- `70` = "Focused"
- `90` = "Deep Work"

Canonical persistence format:
- Always persist as: `STATE:bandwidth{bb},mode:{m},horizon:{h},stakes:{s}`
- Clamp `bandwidth` to `0..100` before serialization.

UI presentation rule:
- STATE is an always-on baseline module and MUST NOT use completion semantics.
- UI MUST NOT label STATE as `In Progress` or `Complete`.
- UI MUST NOT show question-style progress counters (for example `x/x`) for STATE.
- Baseline defaults MUST be applied at initialization so a canonical STATE snapshot always exists.

Shorthand delta merge rules:
- Start from current canonical state (or defaults if absent).
- Apply one shorthand delta token at a time.
- Update only the targeted field; leave all other fields unchanged.
- Re-emit full canonical STATE snapshot after merge.

Delta mappings:
- `STATE:mode_convergent` -> set `mode=convergent`
- `STATE:mode_divergent` -> set `mode=divergent`
- `STATE:horizon_now` -> set `horizon=now`
- `STATE:horizon_long` -> set `horizon=long`
- `STATE:stakes_critical` -> set `stakes=critical`
- `STATE:stakes_casual` -> set `stakes=casual`

Example merge:
- Current canonical: `STATE:bandwidth50,mode:convergent,horizon:long,stakes:casual`
- Incoming delta: `STATE:horizon_now`
- New canonical: `STATE:bandwidth50,mode:convergent,horizon:now,stakes:casual`

---

## Partial profiles

Omit any segment that has not been completed. Segments present must follow order:
OCEAN → AES → MUS → COM → CAR → STATE, separated by `/`.

```
IAM/0.6:O72C88E55A60N22
IAM/0.6:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55
IAM/0.6:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55/MEL40SOP70UNP55INT20CON65
IAM/0.6:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55/MEL40SOP70UNP55INT20CON65/DRV85ANC40EXP20AMB15
IAM/0.6:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55/MEL40SOP70UNP55INT20CON65/DRV85ANC40EXP20AMB15/CAR15113200S0190S1899S2485S3360
IAM/0.6:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55/MEL40SOP70UNP55INT20CON65/DRV85ANC40EXP20AMB15/CAR15113200S0190S1899S2485S3360/STATE:bandwidth30,mode:convergent,horizon:now,stakes:critical
```

---

## Uniqueness

| Modules present   | Fields | Integer range | Combinations         |
|-------------------|--------|---------------|----------------------|
| OCEAN only        | 5      | 0–100         | ~10¹⁰                |
| + AES             | 12     | 0–100         | ~10²⁴                |
| + MUS (full)      | 17     | 0–100         | ~10³⁴                |
| + COM (full)      | 21     | 0–100         | ~10⁴²                |
| + CAR (sparse)    | varies | 0–100         | ~10⁴²+ (depends on skill count) |
| + STATE           | +4     | mixed         | ~10⁴⁴+ (bandwidth plus categorical runtime dimensions) |

Each individual's full IAM code is effectively unique.

---

## LLM usage guidance

When an IAM code appears in a system prompt or user context block:

1. Parse each labeled segment using the token table above.
2. For the CAR segment, decode sparse skill pairs: `S{idx}{prof}` → skill name at position idx, proficiency value prof.
3. Apply interpretation thresholds (≥65 HIGH, 35–64 MED, <35 LOW) per field.
4. Use HIGH and LOW flags to influence tone, detail level, format, and suggestions.
5. Do NOT infer clinical or diagnostic conclusions from these scores.
6. Treat the IAM code as a soft, probabilistic signal — not a rigid rule.
7. For skills, use the O*NET standard skill names (do not guess abbreviations); the position index maps directly to the global standard.
8. If `STATE` is present, treat it as the highest-priority dynamic modifier for runtime behavior for the current interaction.
9. Apply runtime behavior by composition:
  - `bandwidth` controls depth/verbosity.
  - `mode` controls exploration vs execution style.
  - `horizon` controls immediacy and response granularity.
  - `stakes` controls verification strictness and confidence framing.

### Natural-language state triggers (optional)

Implementations MAY support natural-language trigger phrases that map to STATE updates.

Examples:
- "Protocol failed, need a quick fix." → `STATE:bandwidth20,mode:convergent,horizon:now,stakes:critical`
- "I have some time to dig into this." → `STATE:bandwidth90,mode:divergent,horizon:long,stakes:casual`

Trigger phrases are convenience aliases; canonical serialized value SHOULD remain full snapshot STATE format.

### Quick reference for LLMs

```
OCEAN segment (personality interaction defaults):
HIGH O  → curious, open to novelty, abstract thinker
HIGH C  → structured, detail-oriented, deadline-conscious
HIGH E  → prefers dialogue, concise summaries, social framing
HIGH A  → values harmony, prefers diplomatic tone
HIGH N  → may benefit from reassurance; avoid abrupt responses

AES segment (presentation/style preferences):
HIGH MIN → prefer clean, sparse outputs; avoid visual clutter
HIGH CLR → richer color language/examples; avoid monochrome framing
HIGH WRM → warmer tone and examples over sterile/cold framing
HIGH MOT → dynamic/progressive walkthroughs over static dumps
HIGH IMG → concrete, visual, example-heavy explanations
HIGH TYP → expressive writing style and readable hierarchy
HIGH LAY → consistent structure, headings, and predictable layout

MUS segment (vibe/energy preferences):
HIGH MEL → calm, smooth pacing; avoid abrupt intensity spikes
HIGH SOP → nuanced, layered analysis; refined references are welcome
HIGH UNP → practical/plainspoken framing over pretension
HIGH INT → direct, bold tone; intense topics welcome
HIGH CON → modern, current-cultural framing and examples

COM segment (communication social style):
HIGH DRV → lead with bottom line; minimize preamble
HIGH ANC → include method, assumptions, structured validation
HIGH EXP → include alternatives, conceptual framing, ideation paths
HIGH AMB → collaborative tone, supportive phrasing, progressive pacing

CAR segment (professional context and transferable skills):
CAR present → tailor advice to role context and standardized skill profile
HIGH proficiency skills (Sxx) → prioritize tasks/examples in those strengths
LOW/absent skill signals → avoid over-assuming expertise in that area

STATE segment (dynamic in-session behavior modifiers):
LOW bandwidth (0-39) → strip theory/background; direct actionable output only
MED bandwidth (40-79) → standard structured peer-level response
HIGH bandwidth (80-100) → deeper rationale, adjacent concepts, richer exploration
mode:convergent → prioritize synthesis/execution; suppress unnecessary alternatives
mode:divergent → prioritize options, novelty, lateral hypotheses
horizon:now → immediate, real-time actionable next step
horizon:long → staged plans and deferred detail are acceptable
stakes:critical → maximize verification, explicit assumptions/checks, precision
stakes:casual → lightweight rigor is acceptable
```

---

## Versioning

| Version | Changes                   |
|---------|---------------------------|
| 0.1     | Initial spec |
| 0.2     | Added communication segment support |
| 0.3     | Added Career segment with O*NET job code and custom skill tokens |
| 0.4     | Replaced custom skill tokens with standardized O*NET 35-skill position map; introduced sparse encoding; added COM segment to format |
| 0.5     | Added STATE segment (`STATE:bandwidth{bb}`) for dynamic per-session cognitive bandwidth |
| 0.6     | Expanded STATE segment with `mode`, `horizon`, and `stakes`; added canonical full STATE snapshot and shorthand delta tokens |

---

## Regex pattern (validation)

```
^IAM\/0\.[123456](\/[WH])?:O\d{1,3}C\d{1,3}E\d{1,3}A\d{1,3}N\d{1,3}(\/MIN\d{1,3}CLR\d{1,3}WRM\d{1,3}MOT\d{1,3}IMG\d{1,3}TYP\d{1,3}LAY\d{1,3})?(\/MEL\d{1,3}SOP\d{1,3}UNP\d{1,3}INT\d{1,3}CON\d{1,3})?(\/DRV\d{1,3}ANC\d{1,3}EXP\d{1,3}AMB\d{1,3})?(\/CAR\d{8}(S\d{2}\d{2})*)?(\/STATE:(bandwidth\d{1,3},mode:(convergent|divergent),horizon:(now|long),stakes:(critical|casual)|mode_(convergent|divergent)|horizon_(now|long)|stakes_(critical|casual)))?$
```

**Regex breakdown:**
- `\/DRV\d{1,3}ANC\d{1,3}EXP\d{1,3}AMB\d{1,3}` — Optional Communication segment (each trait 0–100, 1–3 digits)
- `\/CAR\d{8}` — Optional Career segment (literal `/CAR` followed by 8-digit SOC code)
- `(S\d{2}\d{2})*` — Zero or more skill-proficiency pairs (S followed by 2-digit skill index and 2-digit proficiency)
- `\/STATE:bandwidth\d{1,3},mode:(convergent|divergent),horizon:(now|long),stakes:(critical|casual)` — Optional canonical dynamic state snapshot
- `\/STATE:mode_(convergent|divergent)` — Optional shorthand mode delta
- `\/STATE:horizon_(now|long)` — Optional shorthand horizon delta
- `\/STATE:stakes_(critical|casual)` — Optional shorthand stakes delta
