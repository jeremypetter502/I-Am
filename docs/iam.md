<img src="../public/images/ziggy-sit-laptop.png" align="right" style="float: right; max-width: 34%; margin: 0 14px 10px 0;" alt="I-Am Logo">

# I-AM String Format Overview


## Why I-AM String

* Compact: profile context is encoded in a concise machine-friendly string.
* Structured: segments follow predictable syntax and can be parsed or explained.
* Portable: users can move the same profile context between assistants and sessions.
* Composable: modules are optional and can be enabled/disabled independently.
* In this project, "I-AM" means "I am" personality context.

## Current Canonical Runtime Format

The current runtime output format is `IAM-v0.2` with long-form segment names.

High-level shape:

```text
IAM-v0.2[/BASE:...]/SEGMENT:metricA50,metricB70/... 
```

Key rules:

- Prefix is `IAM-v0.2`.
- `BASE` is optional and appears first when present.
- Segment names are long-form labels such as `PERSONALITY`, `MUSIC`, `AESTHETIC`, `DELIVERY2`, `STATE`, and `SKILL`.
- The emitted order is score-based rather than a fixed legacy sequence.
- Some segments can include parenthetical note anchors.

## Segment Note Anchors
When a module has a note, the segment uses a parenthetical anchor list immediately after the segment name.

Pattern:

```text
SEGMENT(anchor1, anchor2, anchor3):metricA50,metricB70
```

Rules:

- Anchor items are separated by commas.
- Spaces are normalized to single spaces in the emitted values.
- Unwanted punctuation is sanitized before emission.
- Parentheses are omitted when no note is present.

Example:

```text
AESTHETIC(2001, Project Hail Mary, Dune, Wes21):minimalism67,colorfulness38,warmth75,prefers_clean50,motion63,modernity75,aesthetic_importance75
MUSIC(Debussy, Metallica, Skrillex):mellow50,intense81,sophisticated69,contemporary63,unpretentious75
```

## Example I-AM String

```text
IAM-v0.2/BASE:Ziggy/COMMUNICATION:driver70,analytical85,expressive80,amiable60/PERSONALITY:openness85,conscientiousness75,extraversion80,agreeableness88,neuroticism35/MUSIC(Debussy, Metallica, Skrillex):mellow50,intense81,sophisticated69,contemporary63,unpretentious75/AESTHETIC(2001, Project Hail Mary, Dune, Wes21):minimalism67,colorfulness38,warmth75,prefers_clean50,motion63,modernity75,aesthetic_importance75/DELIVERY2:structure75,density31,framing50,format44,empathy50,autonomy63/STATE:bandwidth50,mode:Convergent,horizon:Now,stakes:Casual,domain:Home/SKILLS(Data Analytics, SQL, Python, Snowflake, Jupyter):comprehension90,active_listening100,writing70,speaking90,mathematics100,science90,critical90,active_listening80,strategies70,monitoring60,perceptiveness100,coordination80,persuasion70,negotiation70,instructing80,orientation90,problem_solving90,troubleshooting70,operations70,technology80,equipment70,programming70,analysis90,time_management70,management70,management60,management80,problem_identification100,analysis100,evaluation90,judgment70,creativity80
```

## Segment Anatomy (Current)

### 1) Header

- Prefix: `IAM-v0.2`

### 2) BASE Segment (optional)

- Marker: `/BASE:`
- Order: first name, birth year, gender, locale/culture, timezone abbreviation.

Example:

```text
/BASE:Jeremy,1975,Male,en-US,EST
```

### 3) STATE Segment

- Marker: `/STATE:`
- Canonical payload keys:
  - `bandwidth`
  - `mode`
  - `horizon`
  - `stakes`
  - optional `domain`
  - optional `humor`

Example:

```text
/STATE:bandwidth50,mode:Convergent,horizon:Long,stakes:Casual,domain:Work
```

### 4) PERSONALITY Segment

- Marker: `/PERSONALITY:`
- Metrics:
  - `openness`
  - `conscientiousness`
  - `extraversion`
  - `agreeableness`
  - `neuroticism`

### 5) AESTHETIC Segment

- Marker: `/AESTHETIC:`
- Typical metrics:
  - `minimalism`
  - `colorfulness`
  - `warmth`
  - `motion`
  - `prefers_clean`
  - `modernity`
  - `aesthetic_importance`

### 6) MUSIC Segment

- Marker: `/MUSIC:`
- Metrics:
  - `mellow`
  - `sophisticated`
  - `unpretentious`
  - `intense`
  - `contemporary`

### 7) COMMUNICATION Segment

- Marker: `/COMMUNICATION:`
- Metrics:
  - `driver`
  - `analytical`
  - `expressive`
  - `amiable`

### 8) DELIVERY Segment

- Marker: `/DELIVERY:`
- Typical metrics:
  - `def`, `peer`, `chl`, `dns`, `aud`, `str`, `abs`, `fmt`, `vbs`, `emp`, `cnd`, `hmr`, `aut`, `bur`

### 9) DELIVERY2 Segment

- Marker: `/DELIVERY2:`
- Metrics:
  - `structure`
  - `density`
  - `framing`
  - `format`
  - `empathy`
  - `autonomy`

### 10) SKILL and SKILLS Segments

The Skills Assessment module scores the 35 O*NET Standardized Transferable Skills (`S01`–`S35`) from raw 0–10 responses. Each skill's `normalized_score` is `raw_score * 10` (0–100 scale).

- `SKILL` (compact career payload, requires a valid 8-digit O*NET SOC code on `BASE.onet.soc_code`; omitted entirely when no SOC code is present):

```text
/SKILL:<soc8>S0190S08100S23100
```

- `SKILLS` (readable skill metrics, emitted whenever any skill responses exist, independent of whether a SOC code is set):

```text
/SKILLS:analysis90,problem_solving75,critical80,...
```

**Inclusion rule:** Only skills with `normalized_score >= 60` (`threshold_status: results_worthy`) are included in both `SKILL` and `SKILLS`. Skills scoring below 60 are omitted from the generated I-AM string entirely — they are never emitted at 0 or with a low value.

**Naming rule:** Each skill's O*NET name is reduced to a single-word label (the longest meaningful word in the name, stop-words like `and`/`of`/`the` excluded). A small set of overrides produces clearer two-word labels for otherwise ambiguous single words. Because the reduction is keyword-based, a few distinct skills intentionally collapse to the same label (see table below) — this is expected, not a bug.

**Full skill catalog (S01–S35):**

| Index | O*NET Skill | Category | SKILLS label |
|---|---|---|---|
| S01 | Reading Comprehension | Cognitive & Analysis | `comprehension` |
| S02 | Active Listening | Communication & Interpersonal | `active_listening` |
| S03 | Writing | Communication & Interpersonal | `writing` |
| S04 | Speaking | Communication & Interpersonal | `speaking` |
| S05 | Mathematics | Cognitive & Analysis | `mathematics` |
| S06 | Science | Cognitive & Analysis | `science` |
| S07 | Critical Thinking | Cognitive & Analysis | `critical` |
| S08 | Active Learning | Cognitive & Analysis | `active_listening` |
| S09 | Learning Strategies | Cognitive & Analysis | `strategies` |
| S10 | Monitoring | Cognitive & Analysis | `monitoring` |
| S11 | Social Perceptiveness | Communication & Interpersonal | `perceptiveness` |
| S12 | Coordination | Communication & Interpersonal | `coordination` |
| S13 | Persuasion | Communication & Interpersonal | `persuasion` |
| S14 | Negotiation | Communication & Interpersonal | `negotiation` |
| S15 | Instructing | Communication & Interpersonal | `instructing` |
| S16 | Service Orientation | Communication & Interpersonal | `orientation` |
| S17 | Complex Problem Solving | Cognitive & Analysis | `problem_solving` |
| S18 | Troubleshooting | Technical & Specialized | `troubleshooting` |
| S19 | Operations Analysis | Business & Process | `operations` |
| S20 | Technology Design | Technical & Specialized | `technology` |
| S21 | Equipment Selection | Business & Process | `equipment` |
| S22 | Installation | Technical & Specialized | `installation` |
| S23 | Programming | Technical & Specialized | `programming` |
| S24 | Quality Control Analysis | Technical & Specialized | `analysis` |
| S25 | Equipment Maintenance | Technical & Specialized | `maintenance` |
| S26 | Repairing | Technical & Specialized | `repairing` |
| S27 | Time Management | Business & Process | `time_management` |
| S28 | Management of Financial Resources | Business & Process | `management` |
| S29 | Management of Material Resources | Business & Process | `management` |
| S30 | Management of Personnel Resources | Leadership & Management | `management` |
| S31 | Identify Patterns | Cognitive & Analysis | `problem_identification` |
| S32 | Data Analysis | Cognitive & Analysis | `analysis` |
| S33 | Systems Evaluation | Cognitive & Analysis | `evaluation` |
| S34 | Judgment & Decision Making | Cognitive & Analysis | `judgment` |
| S35 | Creativity & Innovation | Creative & Innovation | `creativity` |

## Legacy Notes

Older docs/specs may reference `IAM/0.x` compact variants (`0.1`, `0.2`, `0.4`, `0.6`, `0.7`).

Current runtime and tests are aligned to `IAM-v0.2` long-form segment output, including optional module anchors in parentheses.
