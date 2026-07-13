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
IAM-v0.2[/BASE:...]/STATE:.../<other segments...>
```

Key rules:

- Prefix is `IAM-v0.2`.
- `BASE` is optional.
- `STATE` is always the first segment after `BASE` (if `STATE` exists).
- Remaining segments are ordered by score magnitude (descending), with tie-break by name.
- Some segments can include note anchors.

## Segment Note Anchors
When a module has a note, the segment uses `anchors[...]` immediately after the segment name.

Pattern:

```text
SEGMENT:anchors[item1;item2;item3]:metricA50,metricB70
```

Rules:

- Anchor items are separated by semicolons (`;`).
- Spaces are removed from anchor tokens.
- Anchor tokens are deduplicated.
- Brackets `[]` contain the full anchor list.

Example:

```text
AESTHETIC:anchors[2001;ProjectHailMary;Dune;Wes21]:minimalism67,colorfulness38,warmth75,prefers_clean50,motion63,modernity75,aesthetic_importance75
```

## Example I-AM String

```text
IAM-v0.2/BASE:Ziggy/STATE:bandwidth50,mode:Convergent,horizon:Long,stakes:Casual,humor:Normal,domain:Work/SKILLS:anchors[DataAnalytics;SQL;Python;Snowflake;Jupyter]:comprehension90,listening100,writing70,speaking90,mathematics100,science90,critical90,learning80,strategies70,monitoring60,perceptiveness100,coordination80,persuasion70,negotiation70,instructing80,orientation90,complex90,troubleshooting70,operations70,technology80,equipment70,programming70,analysis90,management70,financial_management70,material_management60,personnel_management80,identify100,data_analysis100,evaluation90,judgment70,creativity80/COMMUNICATION:driver70,analytical85,expressive80,amiable60/PERSONALITY:openness85,conscientiousness75,extraversion80,agreeableness88,neuroticism35/MUSIC:anchors[Debussy;Metallica;Skrillex]:mellow50,intense81,sophisticated69,contemporary63,unpretentious75/AESTHETIC:anchors[2001;ProjectHailMary;Dune;Wes21]:minimalism67,colorfulness38,warmth75,prefers_clean50,motion63,modernity75,aesthetic_importance75/DELIVERY2:structure75,density31,framing50,format44,empathy50,autonomy63
```

## Segment Anatomy (Current)

### 1) Header

- Prefix: `IAM-v0.2`

### 2) BASE Segment (optional)

- Marker: `/BASE:`
- Order: first name, birth year, gender, locale/culture, timezone abbreviation.

Example:

```text
BASE:Ziggy/
```

### 3) STATE Segment (optional, but ordered first when present)

- Marker: `/STATE:`
- Canonical payload keys:
  - `bandwidth`
  - `mode`
  - `horizon`
  - `stakes`
  - optional `humor`
  - optional `domain`

Example:

```text
/STATE:bandwidth50,mode:Convergent,horizon:Long,stakes:Casual
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
  - `texture`

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
  - `autonomy`

### 10) SKILL and SKILLS Segments

- `SKILL` (compact career payload):

```text
/SKILL:<soc8>S0190S1899...
```

- `SKILLS` (readable skill metrics):

```text
/SKILLS:analysis80,systems_analysis70,time_management65
```

SKILLS naming rule:

- Prefer one-word labels.
- When labels collide or are ambiguous, use up to two words separated by underscore.

## Legacy Notes

Older docs/specs may reference `IAM/0.x` compact variants (`0.1`, `0.2`, `0.4`, `0.6`, `0.7`).

Current runtime and tests are aligned to `IAM-v0.2` long-form segment output.
