# I-AM String Format Overview

## Why I-AM String 


- Compact: profile context is encoded in a short string instead of long prose.<img src="../public/images/ziggy-sit-laptop.png" align="right" style="float: right; max-width: 34%; margin: 0 14px 10px 0;" alt="I-Am Logo">
- Structured: segments are predictable and parseable by tools and prompts.
- Portable: users can move I-AM string context between sessions, assistants, and workflows.
- Composable: modules are optional, so users can start small and enrich over time. Experimentation with different combinations or dropping modules is encouraged. Additional modules can be added to the system.
- In this project, "I-AM" means "I am" personality context.
- The portable code is called the I-AM string.

An I-AM string is a versioned, segment-based code:

- Starts with `IAM/<version>`
- Appends optional segments (Personality, Aesthetics, Music, Communication, Delivery, Career/Skills, State)
- Uses normalized values so modules can be combined consistently

See the I-AM Segment Anatomy section below for full segment details and links to module docs.

## How I-AM String Is Generated

1. Collect module responses (user can complete modules progressively).
2. Score each module using documented normalization/scoring rules.
3. Build a profile object and compute I-AM segment payloads.
4. Serialize to I-AM string plus JSON storage format for export/import.

The included website automates these steps, but I-AM string generation can be implemented in any system that follows the same scoring and encoding rules.

## Example I-Am String

```text
I-AM string: IAM/0.6:Jeremy:1975:Male:en-US:EST:O83C60E45A78N33/MIN50CLR38WRM75MOT63/MEL56SOP69UNP69INT69CON50/COMM/DRV75ANC80EXP80AMB55/CAR15125200S0190S0260S0360S0560S0670S0780S08100S0970S1260S1560S1780S1870S1970S2090S2160S23100S2470S2660S2770S3190S3260S3360S3460S3590/STATE:bandwidth50,mode:convergent,horizon:long,stakes:casual
```

## How to Use I-AM String with an LLM
Provide the I-AM string to an LLM with a short instruction such as:

- treat the I-AM string as structured user-context metadata
- adapt tone, depth, format, and interaction style to I-AM string signals
- prefer explicit user instructions if they conflict with older I-AM string data
- IAM schema segment descriptions

This lets responses stay personalized while remaining consistent and auditable. Experiment with including explanation about the segments in the I-AM. Most LLMs can decode the string without help, but it has to think about it.

Note: The website will generate LLM instructions when generating an I-AM string.

## I-AM Segment Anatomy

### 1) Header and Version
- Format starts with `IAM/<version>:`
- Current full format is commonly `IAM/0.6:` when state and/or profile prefix are present.
- Related module help:
  - [Base Context help](src/ui/help/base.md)

### 2) Optional Identity Prefix
When present, these fields are inserted before OCEAN in this order:
- `firstName`
- `birthYear`
- `gender`
- `culture` (or locale fallback)
- `timezoneAbbreviation`

Example:
- `IAM/0.6:Jeremy:1975:Male:en-US:EST:O83C60E45A78N33...`

Timezone abbreviations are normalized from IANA timezone names where available (for example `America/New_York -> EST`).
- Related module help:
  - [Base Context help](src/ui/help/base.md)

### 3) OCEAN Personality Core
- Encoded as `OxxCxxExxAxxNxx`
- Example: `O83C60E45A78N33`
- Related module help:
  - [Personality help](src/ui/help/ipip.md)

### 4) Aesthetics Segment (optional)
- Compact tokens such as:
  - `MIN` (minimalism)
  - `CLR` (colorfulness)
  - `WRM` (warmth)
  - `MOT` (motion)
  - `IMG` (imagery/photos or texture fallback)
  - `TYP` (typography serif preference)
  - `LAY` (layout grid consistency)
- Related module help:
  - [Aesthetics help](src/ui/help/aesthetics.md)

### 5) Music Segment (optional)
- Compact tokens:
  - `MEL` (mellow)
  - `SOP` (sophisticated)
  - `UNP` (unpretentious)
  - `INT` (intense)
  - `CON` (contemporary)
- Related module help:
  - [Music help](src/ui/help/music.md)

### 6) Communication Segment (optional)
- Marker: `/COMM/`
- Tokens:
  - `DRV` (driver)
  - `ANC` (analytical)
  - `EXP` (expressive)
  - `AMB` (amiable)
- Related module help:
  - [Communication help](src/ui/help/communication.md)

### 7) Delivery Segment (optional)
- Marker: `/DELIVERY/`
- Compact tokens may include:
  - `DEF` (deference)
  - `PEER` (peer stance)
  - `CHL` (challenge)
  - `DNS` (density)
  - `AUD` (audience adaptation)
  - `STR` (structure)
  - `ABS` (abstraction)
  - `FMT` (format control)
  - `VBS` (verbosity)
  - `EMP` (empathy)
  - `CND` (candor)
  - `HMR` (humor)
  - `AUT` (autonomy)
  - `BUR` (burden sharing)
- Related module help:
  - [Delivery help](src/ui/help/delivery.md)

### 8) Career/Skills Segment (optional)
- Marker: `/CAR`
- Begins with normalized 8-digit SOC code (for example `15-1252 -> 15125200`)
- Followed by sparse skill pairs:
  - `Sxxpp`
  - `xx` = skill index from 01 to 35
  - `pp` = normalized proficiency from 00 to 99/100 rounded to two digits

Only skills meeting inclusion threshold are emitted.
- Related module help:
  - [Skills help](src/ui/help/skills.md)
  - [Base Context help](src/ui/help/base.md)

### 9) State Segment (optional)
- Marker: `/STATE:`
- Canonical key/value payload, for example:
  - `STATE:bandwidth50,mode:convergent,horizon:long,stakes:casual`
- Related module help:
  - [State help](src/ui/help/state.md)

---

## Version Behavior Notes

- `0.1`: base OCEAN personality only.
- `0.2`: adds communication segment.
- `0.4`: adds career/skills segment.
- `0.6`: used when state is included and/or identity prefix is present.
- `0.7`: includes Delivery segment (`/DELIVERY/...`).

In career-only cases with no personality and no prefix, output may be segment-only (for example `/CAR...`) to preserve compactness.
