# I-Am Context String (IAM) Specification

## Purpose

The I-AM string is a compact, labeled, single-line encoding of a user's personality,
preferences, skills, and runtime state. The project currently emits a long-form runtime
string intended for direct model-context injection.

Terminology note:
- "I-AM" is the product term for the user's personal context, not an acronym.
- The active wire format prefix is `IAM-v0.2`.

The format is designed for:
- human readability
- direct model consumption without a decoder preamble
- partial-profile compatibility
- forward-compatible segment additions

---

## Current Canonical Runtime Format

The active runtime generator emits this shape:

```
IAM-v0.2[/BASE:<prefix_values>]/SEGMENT[:<metric_pairs>][...]/SEGMENT2:<metric_pairs>
```

The current implementation uses long-form segment names and, when a module has a note,
appends the note as an anchor in parentheses immediately after the segment name:

```
SEGMENT(anchor1, anchor2):metricA75,metricB60
```

Examples:

```
IAM-v0.2/BASE:Ziggy/COMMUNICATION:driver70,analytical85,expressive80,amiable60/PERSONALITY:openness85,conscientiousness75,extraversion80,agreeableness88,neuroticism35/MUSIC(Debussy, Metallica, Skrillex):mellow50,intense81,sophisticated69,contemporary63,unpretentious75/AESTHETIC(2001, Project Hail Mary, Dune, Wes21):minimalism67,colorfulness38,warmth75,prefers_clean50,motion63,modernity75,aesthetic_importance75/DELIVERY2:structure75,density31,framing50,format44,empathy50,autonomy63/STATE:bandwidth50,mode:Convergent,horizon:Long,stakes:Casual,domain:Work
```

### Normative Rules

- The string prefix MUST begin with `IAM-v0.2`.
- `BASE` is optional and appears first when present.
- Segment names are long-form labels such as `PERSONALITY`, `MUSIC`, `AESTHETIC`, `DELIVERY2`, `STATE`, and `SKILL`.
- Optional module anchors are serialized in parentheses after the segment name.
- Metric pairs are comma-separated and use the form `nameValue`, for example `driver70` or `minimalism67`.
- A value is normally a rounded integer in the 0-100 range unless otherwise noted.

---

## Module Anchors

Module anchors are not a separate syntax block. They are serialized as parenthetical text
attached to a segment name when the module has a note or metadata string.

Current pattern:

```
SEGMENT(anchor1, anchor2, anchor3):metricA50,metricB70
```

Anchor behavior:
- The anchor text is taken from the module note metadata.
- Anchor values are sanitized before emission.
- Spaces are normalized to single spaces.
- Characters such as `/`, `:`, `(`, and `)` are stripped or transformed to avoid breaking the string grammar.
- The note is optional; if no note exists, the segment is emitted without parentheses.

Examples:

```
MUSIC(Debussy, Metallica, Skrillex):mellow50,intense81,sophisticated69,contemporary63,unpretentious75
AESTHETIC(2001, Project Hail Mary, Dune, Wes21):minimalism67,colorfulness38,warmth75,prefers_clean50,motion63,modernity75,aesthetic_importance75
```

---

## Prefix Segment

The optional `BASE` segment carries identity and context metadata in a fixed order:

`first_name,birth_year,gender,culture,timezone_abbreviation`

Rules:
- values are emitted only when present
- ordering is fixed for each value that exists
- empty values are omitted rather than emitted as blank placeholders

Example:

```
/BASE:Ziggy
/BASE:Jeremy,1975,Male,en-US,EST
```

---

## Segment Definitions

### PERSONALITY

Pattern:

```
PERSONALITY:openness{oo},conscientiousness{cc},extraversion{ee},agreeableness{aa},neuroticism{nn}
```

Interpretation thresholds:
- `>=65` = HIGH
- `35-64` = MEDIUM
- `<35` = LOW

### AESTHETIC

Pattern:

```
AESTHETIC(anchor...):minimalism{mm},colorfulness{cc},warmth{ww},motion{mo},...
```

Common metric names include:
- `minimalism`
- `colorfulness`
- `warmth`
- `motion`
- `prefers_clean`
- `modernity`
- `aesthetic_importance`

### MUSIC

Pattern:

```
MUSIC(anchor...):mellow{ml},sophisticated{sp},unpretentious{un},intense{in},contemporary{cn}
```

### COMMUNICATION

Pattern:

```
COMMUNICATION:driver{dr},analytical{an},expressive{ex},amiable{am}
```

### DELIVERY and DELIVERY2

Current runtime uses module names that match the implementation:

```
DELIVERY:<tokenA##,tokenB##,...>
DELIVERY2:structure{str},density{dns},framing{frm},format{fmt},empathy{emp},autonomy{aut}
```

The exact token names are implementation-defined, but the runtime output is always a
labelled segment followed by a metric list.

### STATE

Pattern:

```
STATE:bandwidth{bb},mode:{Convergent|Divergent},horizon:{Now|Long},stakes:{Critical|Casual},domain:{Work|Home}
```

State values are canonicalized before serialization and may include runtime context such as:
- `bandwidth`
- `mode`
- `horizon`
- `stakes`
- optional `domain`
- optional `humor`

### SKILL and SKILLS

The codebase also emits skill-oriented segments when career data is present:

```
SKILL:<soc8>S0190S08100S23100
SKILLS:analysis90,problem_solving75,critical80,...
```

`SKILL` is the compact career payload. `SKILLS` is the long-form skill summary that maps
individual skill names to metric values.

---

## Segment Ordering

The current generator does not rely on a strict fixed ordering for every segment. In practice,
segments are assembled as a set of named metric blocks and then ordered by aggregate score,
with ties broken alphabetically.

The only hard runtime convention is:
- `BASE` is emitted first when present
- all other segments are appended in score-sorted order

That means the exact ordering can vary by module strength, but the strings remain valid and
machine-readable as long as each segment is a valid `NAME:...` block.

---

## Partial Profiles

Any segment may be omitted if that module is unavailable or not scored.

Examples:

```
IAM-v0.2/BASE:Ziggy/PERSONALITY:openness72,conscientiousness88,extraversion55,agreeableness66,neuroticism22
IAM-v0.2/BASE:Ziggy/MUSIC(Debussy, Metallica, Skrillex):mellow50,intense81,sophisticated69,contemporary63,unpretentious75
IAM-v0.2/BASE:Ziggy/COMMUNICATION:driver70,analytical85,expressive80,amiable60/STATE:bandwidth50,mode:Convergent,horizon:Long,stakes:Casual,domain:Work
```

---

## Legacy Notes

Older documents and earlier drafts reference compact `IAM/0.x` encodings and a more rigid
`OCEAN/AES/MUS/COMM/CAR/DELIVERY/STATE` scheme. Those representations are historical and not
what the active runtime currently emits.

The current canonical implementation is the long-form `IAM-v0.2` format described in this
specification, including optional module anchors in parentheses.

---

## Validation Guidance

Parsers SHOULD prefer structured parsing over a single monolithic regex because the runtime
string allows:
- optional `BASE`
- optional anchors on segment names
- dynamic segment ordering
- optional segment omission

A practical parser approach is:
1. verify the string begins with `IAM-v0.2`
2. split on `/`
3. parse each segment into `name` and `payload`
4. if the name contains parentheses, parse the anchor text before the colon
5. parse the metric payload as comma-separated `keyValue` tokens

This is the safest and most resilient interpretation of the current production format.

