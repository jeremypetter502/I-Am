<img src="../public/images/ziggy-sit-laptop.png" align="right" style="float: right; max-width: 34%; margin: 0 14px 10px 0;" alt="I-Am Logo">

# I-AM String Format Overview


## Why I-AM String


- Compact: profile context is encoded in a concise machine-friendly string.
- Structured: segments follow predictable syntax and can be parsed or explained.
- Portable: users can move the same profile context between assistants and sessions.
- Composable: modules are optional and can be enabled/disabled independently.
- In this project, "I-AM" means "I am" personality context.

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
IAM-v0.2/BASE:Ziggy/COMMUNICATION:driver70,analytical85,expressive80,amiable60/PERSONALITY:openness85,conscientiousness75,extraversion80,agreeableness88,neuroticism35/MUSIC(Debussy, Metallica, Skrillex):mellow50,intense81,sophisticated69,contemporary63,unpretentious75/AESTHETIC(2001, Project Hail Mary, Dune, Wes21):minimalism67,colorfulness38,warmth75,prefers_clean50,motion63,modernity75,aesthetic_importance75/DELIVERY2:structure75,density31,framing50,format44,empathy50,autonomy63/STATE:bandwidth50,mode:Convergent,horizon:Long,stakes:Casual,domain:Work
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

- `SKILL` (compact career payload):

```text
/SKILL:<soc8>S0190S08100S23100
```

- `SKILLS` (readable skill metrics):

```text
/SKILLS:analysis90,problem_solving75,critical80,...
```

SKILLS naming rule:

- Prefer one-word labels.
- When labels collide or are ambiguous, use up to two words separated by underscore.

## Legacy Notes

Older docs/specs may reference `IAM/0.x` compact variants (`0.1`, `0.2`, `0.4`, `0.6`, `0.7`).

Current runtime and tests are aligned to `IAM-v0.2` long-form segment output, including optional module anchors in parentheses.
