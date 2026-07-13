# Data Model: I-AM Long Form (LF)

This document defines the artifacts and schemas used to generate Long Form (LF) I-AM strings.

Artifacts

- `mappings/segment-mapping.json` — maps compact segment identifiers to LF full segment names (e.g. `AES -> AESTHETIC`).
- `mappings/metric-mapping-<segment>.json` — per-segment mapping files from compact metric codes to full lowercase metric names (e.g. `min -> minimalism`).
- `contracts/iam-generator.json` — JSON Schema describing the generator contract inputs for both compact and LF modes.

Primary Entities

- IAMOutputVariant
  - `format`: enum `compact | long_form`
  - `lfVersion`: string (e.g., `LF.0.1`)
- SegmentMapping
  - `compactCode`: string — existing short identifier used in compact I-AM
  - `fullName`: string — LF full segment name (UPPERCASE, single word where applicable)
- MetricMapping
  - `metricCode`: string — compact metric code used currently (if any)
  - `metricName`: string — LF full metric name in lowercase (used in emitted LF strings)

Ordering

- Ordering score: the generator uses each segment's existing aggregated module score (as currently computed by the scorer pipeline).
- Ties: resolved alphabetically by `fullName`.

Location

All mapping and contract artifacts live under `specs/006-long-form-iam/`:

```
specs/006-long-form-iam/
├─ mappings/
│  ├─ segment-mapping.json
│  └─ metric-mapping-AESTHETIC.json
├─ contracts/
│  └─ iam-generator.json
└─ data-model.md
```

Notes

- Mapping files in `mappings/` are intentionally editable JSON to allow easy updates when new modules or metrics are added.
- If a compact metric code is not defined, the generator should support a fallback mapping that derives a lowercased name from a human-readable label where available.
