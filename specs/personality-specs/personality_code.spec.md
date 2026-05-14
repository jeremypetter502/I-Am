# Personality Context Code (PCTX) Specification v0.1

## Purpose

The PCTX code is a compact, labeled, single-line encoding of a user's full
personality profile derived from the IPIP, Aesthetic, and STOMP survey modules.

It is designed for efficient LLM consumption:
- Self-documenting (labels are readable abbreviations — no decoder preamble required)
- Token-efficient (~18 tokens vs ~150 for equivalent JSON)
- Nearly unique per individual when all modules are present
- Gracefully degradable (partial profiles, missing modules, are still valid)

---

## Format

```
PCTX/<version>/<context>:<OCEAN_segment>/<AES_segment>/<MUS_segment>
```

### Version
`0.1` — current version. Increment major when fields are added/removed; minor for scoring changes.

### Context tag (optional)
`W` = work context, `H` = home context, omit for combined/general.

### Full example

```
PCTX/0.1/W:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55/MEL40SOP70UNP55INT20CON65
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

## Partial profiles

Omit any segment that has not been completed. Segments present must follow order:
OCEAN → AES → MUS, separated by `/`.

```
PCTX/0.1:O72C88E55A60N22
PCTX/0.1:O72C88E55A60N22/MIN80CLR35WRM60MOT45IMG70TYP65LAY55
```

---

## Uniqueness

| Modules present   | Fields | Integer range | Combinations         |
|-------------------|--------|---------------|----------------------|
| OCEAN only        | 5      | 0–100         | ~10¹⁰                |
| + AES             | 12     | 0–100         | ~10²⁴                |
| + MUS (full)      | 17     | 0–100         | ~10³⁴                |

Each individual's full PCTX code is effectively unique.

---

## LLM usage guidance

When a PCTX code appears in a system prompt or user context block:

1. Parse each labeled segment using the token table above.
2. Apply interpretation thresholds (≥65 HIGH, 35–64 MED, <35 LOW) per field.
3. Use HIGH and LOW flags to influence tone, detail level, format, and suggestions.
4. Do NOT infer clinical or diagnostic conclusions from these scores.
5. Treat the PCTX code as a soft, probabilistic signal — not a rigid rule.

### Quick reference for LLMs

```
HIGH O  → curious, open to novelty, abstract thinker
HIGH C  → structured, detail-oriented, deadline-conscious
HIGH E  → prefers dialogue, concise summaries, social framing
HIGH A  → values harmony, prefers diplomatic tone
HIGH N  → may benefit from reassurance; avoid abrupt responses
HIGH MIN → prefer clean, sparse outputs; avoid visual clutter
HIGH SOP → prefers nuanced, layered analysis; classical references OK
HIGH INT → direct, bold tone; intense topics welcome
```

---

## Versioning

| Version | Changes                   |
|---------|---------------------------|
| 0.1     | Initial spec               |

---

## Regex pattern (validation)

```
^PCTX\/0\.1(\/[WH])?:O\d{1,3}C\d{1,3}E\d{1,3}A\d{1,3}N\d{1,3}(\/MIN\d{1,3}CLR\d{1,3}WRM\d{1,3}MOT\d{1,3}IMG\d{1,3}TYP\d{1,3}LAY\d{1,3})?(\/MEL\d{1,3}SOP\d{1,3}UNP\d{1,3}INT\d{1,3}CON\d{1,3})?$
```
