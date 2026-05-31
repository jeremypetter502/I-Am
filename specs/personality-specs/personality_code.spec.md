# I-Am Context String (IAM) Specification v0.7

## Purpose

The I-AM string is a compact, labeled, single-line encoding of a user's personality,
preferences, skills, and runtime state.

Terminology note:
- "I-AM" is the product term ("I am" personality context), not an acronym.
- The wire-encoded string prefix remains `IAM/<version>` for compatibility.

It is designed for efficient LLM consumption:
- Self-documenting (readable labels, no decoder preamble required)
- Token-efficient compared with equivalent JSON
- Gracefully degradable (partial profiles are still valid)
- Backward-compatible across segment additions

---

## Canonical Format

```
IAM/<version>[:<prefix_fields>:]OCEAN[/AES:<aes_tokens>][/MUS:<mus_tokens>][/COMM:<comm_tokens>][/CAR:<car_payload>][/DELIVERY:<delivery_tokens>][/STATE:<state_snapshot>]
```

Where:
- `prefix_fields` are optional identity/context fields present in v0.6+
- segment separators are `/`
- all scored values are rounded integers unless explicitly noted

### Normative Language

The keywords `MUST`, `MUST NOT`, `SHOULD`, and `MAY` in this document are normative.

### Prefix fields (optional, v0.6+)

When available, these appear before OCEAN and are colon-separated:

`first_name:birth_year:gender:culture:timezone_abbrev`

Any missing values are omitted; ordering remains fixed for values that exist.

Prefix emission rules:
- Prefix fields MUST be emitted only when at least one prefix value exists.
- When emitted, values MUST follow this order: `first_name`, `birth_year`, `gender`, `culture`, `timezone_abbrev`.
- Empty values MUST be omitted rather than serialized as blank placeholders.

Example:

```
IAM/0.6:Jeremy:1975:Male:en-US:EST:O83C60E45A78N33
```

---

## Full Example (v0.6)

```
IAM/0.6:Jeremy:1975:Male:en-US:EST:O83C60E45A78N33/AES:MIN50CLR38WRM75MOT63/MUS:MEL56SOP69UNP69INT69CON50/COMM:DRV75ANC80EXP80AMB55/CAR:15125200S0190S0260S0360S0560S0670S0780S08100S0970S1260S1560S1780S1870S1970S2090S2160S23100S2470S2660S2770S3190S3260S3360S3460S3590/STATE:bandwidth50,mode:convergent,horizon:long,stakes:casual
```

## Full Example (v0.7 with Delivery)

```
IAM/0.7:Jeremy:1975:Male:en-US:EST:O83C60E45A78N33/AES:MIN50CLR38WRM75MOT63/MUS:MEL56SOP69UNP69INT69CON50/COMM:DRV75ANC80EXP80AMB55/CAR:15125200S0190S08100S23100/DELIVERY:DEF38PEER82CHL90DNS86AUD75STR92ABS88FMT79VBS58EMP62CND91HMR46AUT84BUR60/STATE:bandwidth50,mode:convergent,horizon:long,stakes:casual
```

---

## Segment Definitions

### OCEAN - Big Five (IPIP)

Pattern: `O{oo}C{cc}E{ee}A{aa}N{nn}`

Interpretation thresholds:
- `>=65` = HIGH
- `35-64` = MEDIUM
- `<35` = LOW

---

### AES - Aesthetic Preferences

Pattern: `AES:MIN{mm}CLR{cc}WRM{ww}MOT{mo}[IMG{im}][TYP{ty}][LAY{la}]`

Common tokens:
- `MIN` minimalism
- `CLR` colorfulness
- `WRM` warmth
- `MOT` motion
- `IMG` imagery/photos preference
- `TYP` typography preference
- `LAY` layout/grid preference

Notes:
- `IMG`, `TYP`, and `LAY` may be absent in partial outputs.

---

### MUS - Music Preferences (STOMP-derived)

Pattern: `MUS:MEL{ml}SOP{sp}UNP{un}INT{in}CON{cn}`

Tokens:
- `MEL` mellow
- `SOP` sophisticated
- `UNP` unpretentious
- `INT` intense
- `CON` contemporary

---

### COMM - Communication Preferences (Merrill-Reimann)

Pattern: `COMM:DRV{dr}ANC{an}EXP{ex}AMB{am}`

Tokens:
- `DRV` driver
- `ANC` analytical
- `EXP` expressive
- `AMB` amiable

Note:
- Communication is serialized with an explicit `COMM` segment marker.
- If communication scores are present, the `COMM` marker MUST be present.

---

### CAR - Career and Standardized Transferable Skills (O*NET-SOC)

Pattern: `CAR:{soc8}(S{skill_idx}{proficiency})*`

Components:
- `soc8`: normalized 8-digit SOC code (`15-1252` -> `15125200`, `15-1132.00` -> `15113200`)
- `S{skill_idx}{proficiency}`:
  - `skill_idx` is `01-35`
  - `proficiency` is `00-99/100` encoded as two digits

Sparse encoding rules:
- Skills are ordered by index.
- Current inclusion threshold is `normalized_score >= 60`.

Example:
- `CAR:15125200S0190S08100S23100`

---

### DELIVERY - Unified Preference Delivery (new in v0.7)

Pattern:

`DELIVERY:DEF{dd}PEER{pp}CHL{cc}DNS{dn}AUD{au}STR{st}ABS{ab}FMT{fm}VBS{vb}EMP{em}CND{cn}HMR{hm}AUT{at}BUR{br}`

Delivery combines metrics from one unified questionnaire across REL, CAP, COG, PER, and ENV constructs.

Tokens:
- REL: `DEF`, `PEER`, `CHL`
- CAP: `DNS`, `AUD`, `STR`
- COG: `ABS`, `FMT`, `VBS`
- PER: `EMP`, `CND`, `HMR`
- ENV: `AUT`, `BUR`

Emission rule:
- Delivery tokens MUST be emitted in the exact token order shown in the pattern.

---

### STATE - Dynamic Runtime User State

Canonical snapshot pattern:

`STATE:bandwidth{bb},mode:{convergent|divergent},horizon:{now|long},stakes:{critical|casual}`

`STATE` is dynamic and may change per task/session.

Field meanings:
- `bandwidth` (`0-100`): available cognitive capacity
- `mode`: convergent (execution/synthesis) or divergent (exploration/ideation)
- `horizon`: now (immediate) or long (staged/asynchronous)
- `stakes`: critical (high verification) or casual (lighter verification)

Optional shorthand deltas (transport convenience):
- `STATE:mode_convergent`
- `STATE:mode_divergent`
- `STATE:horizon_now`
- `STATE:horizon_long`
- `STATE:stakes_critical`
- `STATE:stakes_casual`

Canonical persisted I-AM strings SHOULD use full snapshot form.

---

## Segment Order

When present, segments follow this order:

`OCEAN -> AES -> MUS -> COMM -> CAR -> DELIVERY -> STATE`

Prefix fields (if present) appear before OCEAN.

Version emission rules:
- If `DELIVERY` is present, I-AM string version MUST be at least `0.7`.
- If canonical `STATE` is present and `DELIVERY` is absent, I-AM string version MUST be at least `0.6`.
- If `CAR` is present without `STATE` and without `DELIVERY`, I-AM string version MUST be at least `0.4`.

---

## Partial Profiles

Any segment may be omitted if unavailable.

Examples:

```
IAM/0.6:O72C88E55A60N22
IAM/0.6:O72C88E55A60N22/AES:MIN80CLR35WRM60MOT45
IAM/0.6:O72C88E55A60N22/AES:MIN80CLR35WRM60MOT45/MUS:MEL40SOP70UNP55INT20CON65
IAM/0.6:O72C88E55A60N22/AES:MIN80CLR35WRM60MOT45/MUS:MEL40SOP70UNP55INT20CON65/COMM:DRV85ANC40EXP20AMB15
IAM/0.6:O72C88E55A60N22/AES:MIN80CLR35WRM60MOT45/MUS:MEL40SOP70UNP55INT20CON65/COMM:DRV85ANC40EXP20AMB15/CAR:15113200S0190S1899S2485S3360
IAM/0.7:O72C88E55A60N22/AES:MIN80CLR35WRM60MOT45/MUS:MEL40SOP70UNP55INT20CON65/COMM:DRV85ANC40EXP20AMB15/CAR:15113200S0190S1899S2485S3360/DELIVERY:DEF40PEER70CHL80DNS75AUD20STR85ABS78FMT82VBS55EMP62CND74HMR30AUT68BUR52/STATE:bandwidth30,mode:convergent,horizon:now,stakes:critical
```

Career-only edge case (supported):

```
/CAR:15125200S0190S23100
/CAR:15125200S0190S23100/STATE:bandwidth50,mode:convergent,horizon:long,stakes:casual
```

---

## LLM Usage Guidance

1. Parse segments by labels and separators.
2. Apply threshold interpretation (`>=65` high, `35-64` medium, `<35` low) for scored fields.
3. Treat `STATE` as the highest-priority runtime modifier.
4. Use `CAR` skill signals for domain targeting, not hard capability guarantees.
5. Treat IAM as probabilistic preference context, not diagnosis or identity proof.

---

## Export Artifacts

Canonical export uses one artifact:

- `.iam.json`: machine-readable storage payload for import/export fidelity.

JSON storage rules:

- Top-level `iam` SHOULD be the first key in `.iam.json`.
- `.iam.json` SHOULD remove duplicate sections that repeat module response payloads.
- Skill responses in `.iam.json` SHOULD be stored once in `profile.modules.skills.responses`.
- Derived skill fields (`threshold_status`, `listed_status`, `normalized_score`) SHOULD be omitted from persisted skill responses.
- IAM career inclusion/proficiency SHOULD be derivable from `raw_score` when `normalized_score` is absent.

---

## Versioning

| Version | Changes |
|---------|---------|
| 0.1 | Initial OCEAN profile |
| 0.2 | Added communication segment support |
| 0.4 | Added career segment with standardized O*NET skill mapping and sparse encoding |
| 0.6 | Added optional identity prefix and expanded canonical STATE (`bandwidth`, `mode`, `horizon`, `stakes`) |
| 0.7 | Added optional unified `DELIVERY` segment |

---

## Validation Regex (practical)

The IAM format has evolved and allows optional prefix fields plus optional segments,
so parsers SHOULD prefer structured token parsing over one monolithic regex.

If regex validation is required, use staged checks:

1. Header check:

```
^IAM\/0\.[1-7]:
```

2. Required OCEAN block exists after optional prefix values:

```
O\d{1,3}C\d{1,3}E\d{1,3}A\d{1,3}N\d{1,3}
```

3. Optional segments (in order):
- `\/MIN...` AES composite
- `\/MEL...` MUS composite
- `\/COMM\/DRV...` COMM block
- `\/CAR\d{8}(S\d{2}\d{2})*` CAR block
- `\/DELIVERY\/DEF...BUR...` DELIVERY block
- `\/STATE:...` canonical or shorthand STATE

Validation scope notes:
- The staged checks above are for canonical `IAM/...` strings.
- Career-only edge cases (strings beginning with `/CAR...`) are valid transport forms and MUST be handled by decoders separately.
- Parsers MUST ignore unknown future segments rather than fail hard.

This staged approach is recommended for maintainability and forward compatibility.

