# ContextFile Contract Changes (Spec-Only)

## Scope

This document defines planned contract-level changes for:

- `profile.base` (job/role and basic context metadata)
- `profile.modules.communication` (Merrill-Reimann communication psychometrics)
- IAM compact extension guidance for communication (`/COMM:...`)

These are specification artifacts only. No implementation is included here.

## JSON Schema changes

Target: `specs/001-personality-context-site/contextfile.schema.json`

### 1) Add `profile.base`

Add optional `base` object under `profile.properties`.

```json
"base": {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "onet": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "soc_code": { "type": "string", "pattern": "^\\d{2}-\\d{4}$" },
        "title": { "type": "string", "minLength": 1 },
        "version": { "type": "string" }
      },
      "required": ["soc_code", "title"]
    },
    "job_title": { "type": "string", "maxLength": 120 },
    "company": { "type": "string", "maxLength": 120 },
    "years_experience": { "type": "number", "minimum": 0, "maximum": 80 },
    "education_level": {
      "type": "string",
      "enum": ["high_school", "associate", "bachelor", "master", "doctorate", "other"]
    },
    "timezone": { "type": "string", "minLength": 1 },
    "locale": { "type": "string", "pattern": "^[a-z]{2}(-[A-Z]{2})?$" },
    "communication_style": { "type": "string", "maxLength": 40 },
    "short_bio": { "type": "string", "maxLength": 280 }
  }
}
```

### 2) Add `profile.modules.communication`

Add optional `communication` object under `profile.properties.modules.properties`.

```json
"communication": {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "responses": {
      "type": "array",
      "items": { "type": "integer", "minimum": 1, "maximum": 5 },
      "minItems": 20,
      "maxItems": 20
    },
    "raw_trait_scores": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "driver": { "type": "number", "minimum": 5, "maximum": 25 },
        "analytical": { "type": "number", "minimum": 5, "maximum": 25 },
        "expressive": { "type": "number", "minimum": 5, "maximum": 25 },
        "amiable": { "type": "number", "minimum": 5, "maximum": 25 }
      }
    },
    "normalized_trait_scores": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "driver": { "type": "number", "minimum": 0, "maximum": 100 },
        "analytical": { "type": "number", "minimum": 0, "maximum": 100 },
        "expressive": { "type": "number", "minimum": 0, "maximum": 100 },
        "amiable": { "type": "number", "minimum": 0, "maximum": 100 }
      }
    },
    "completed": { "type": "boolean" },
    "last_updated": { "type": "string", "format": "date-time" }
  }
}
```

### 3) IAM code guidance (schema note)

No strict IAM regex is required in this phase to preserve compatibility and avoid over-constraining future segments. Validation remains semantic at module level.

## Protobuf changes (historical)

Note: Current runtime implementation is JSON-first. The protobuf contract notes below are retained only as historical reference and are not required for active import/export flows.

Target: `specs/001-personality-context-site/contextfile.proto`

### 1) Add `BaseContext` to `Profile`

```proto
message Profile {
  string id = 1;
  string summary = 2;
  Scores scores = 3;
  map<string,double> raw_scores = 4;
  Modules modules = 5;
  map<string,bool> tags = 6;
  map<string,string> preferences = 7;
  Iam iam = 8;
  BaseContext base = 9;
}
```

Add message types:

```proto
message BaseContext {
  OnetOccupation onet = 1;
  string job_title = 2;
  string company = 3;
  double years_experience = 4;
  string education_level = 5;
  string timezone = 6;
  string locale = 7;
  string communication_style = 8;
  string short_bio = 9;
}

message OnetOccupation {
  string soc_code = 1;
  string title = 2;
  string version = 3;
}
```

### 2) Add `Communication` to `Modules`

```proto
message Modules {
  Ipip ipip = 1;
  Aesthetics aesthetics = 2;
  Music music = 3;
  map<string,string> extended = 4;
  Communication communication = 5;
}
```

Add message type:

```proto
message Communication {
  repeated int32 responses = 1; // 20 items, each 1..5
  map<string,double> raw_trait_scores = 2; // driver/analytical/expressive/amiable
  map<string,double> normalized_trait_scores = 3; // 0..100
  bool completed = 4;
  string last_updated = 5; // ISO datetime for parity with existing JSON payloads
}
```

## Scoring contract

For each communication trait (5 items each):

$$
raw \in [5,25]
$$

$$
normalized = \left(\frac{raw - 5}{20}\right) \times 100
$$

Encoding into IAM compact uses integer-rounded normalized values.

## IAM compact extension (spec)

When communication data is included, IAM code can include a trailing segment:

`/COMM:DRV{d}ANC{a}EXP{e}AMB{m}`

Example:

`IAM/0.2:O79C85E42A60N35/AES:MIN90CLR20WRM40MOT10IMG30TYP55LAY70/MUS:MEL40SOP70UNP55INT20CON65/COMM:DRV85ANC40EXP20AMB15`

## Backward compatibility

- All newly introduced fields/messages are optional.
- Existing files without `base` or `communication` remain valid.
- Existing parsers should ignore unknown fields/segments.

## Planned validation tests (spec)

- Schema acceptance for `profile.base` with O*NET payload.
- Schema rejection for invalid `soc_code` pattern.
- Communication response length exactly 20.
- Communication normalized values bounded in `0..100`.
- Serializer includes/excludes `base` by export toggle.

