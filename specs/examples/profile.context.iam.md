# IAM Context File

## Compact IAM String

`IAM/0.6:O53C50E50A55N43/MIN50CLR44WRM25MOT75IMG75/CAR15125500/STATE:bandwidth90,mode:convergent,horizon:now,stakes:casual`

## Basic Context

Use this section for human-readable background context and simple parsing.

<!-- IAM_BASE_CONTEXT_START -->
- job_title: Web and Digital Interface Designers
- company: Petter Systems
- short_bio: TEST90
- onet.soc_code: 15-1255
- onet.title: Web and Digital Interface Designers
<!-- IAM_BASE_CONTEXT_END -->


## How To Use This In An LLM

- Treat the IAM string as the highest-priority compact behavioral signal.
- Use OCEAN + module segments to adapt tone, structure, pacing, and detail depth.
- For IAM v0.6 Career segments (`/CARXXXXXXXXSnnpp...`), decode `S01..S35` using the canonical O*NET map and interpret `pp` as 00-99 proficiency.
- IAM Career segment is sparse: only included skills should be treated as active/relevant skill signals.
- If a `STATE` segment is present, treat it as the highest-priority runtime modifier for depth, rigor, and response style.
- Combine `profile.base.onet` and skills proficiency to tailor role-specific recommendations and examples.
- Use `profile.base` for practical user context (role/job/timezone/locale) when present.
- Use `profile.raw_scores` and module `raw_trait_scores` only as diagnostics; prioritize normalized scores for behavior tuning.
- Ignore `raw_responses` for direct prompting style decisions unless you are performing audit/review tasks.
- If fields conflict, prefer explicit user instructions over profile data.

## Machine-Readable Context Payload (JSON)

```json
{
  "schema_version": "0.1",
  "generated_at": "2026-05-20T00:44:14.185Z",
  "profile": {
    "id": null,
    "summary": "",
    "scores": {
      "openness": 52.5,
      "conscientiousness": 50,
      "extraversion": 50,
      "agreeableness": 55,
      "neuroticism": 42.5
    },
    "modules": {
      "ipip": {
        "responses": [
          3,
          3,
          3,
          3,
          3,
          3,
          3,
          3,
          4,
          4,
          4,
          4,
          4,
          4,
          4,
          4,
          4,
          2,
          2,
          2,
          2,
          2,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          2,
          2,
          2,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          4,
          4,
          4,
          4,
          4,
          4,
          4
        ],
        "raw_trait_scores": {
          "openness": 31,
          "conscientiousness": 30,
          "extraversion": 30,
          "agreeableness": 32,
          "neuroticism": 27
        },
        "normalized_trait_scores": {
          "openness": 52.5,
          "conscientiousness": 50,
          "extraversion": 50,
          "agreeableness": 55,
          "neuroticism": 42.5
        },
        "completed": true,
        "last_updated": "2026-05-20T00:44:14.185Z"
      },
      "aesthetics": {
        "responses": [
          3,
          3,
          3,
          3,
          3,
          3,
          3,
          2,
          2,
          2,
          2,
          2,
          4,
          4,
          4,
          4,
          4,
          4,
          4,
          4,
          5,
          5,
          5,
          4,
          4,
          4,
          4,
          4,
          4,
          4,
          4,
          4
        ],
        "last_updated": "2026-05-20T00:44:14.185Z",
        "completed": true,
        "normalized": {
          "minimalism": 50,
          "colorfulness": 43.75,
          "warmth": 25,
          "texture": 75,
          "motion": 75
        },
        "count": 32
      },
      "state": {
        "bandwidth": 90,
        "mode": "convergent",
        "horizon": "now",
        "stakes": "casual",
        "completed": true,
        "last_updated": "2026-05-20T00:44:14.185Z"
      }
    },
    "base": {
      "onet": {
        "soc_code": "15-1255",
        "title": "Web and Digital Interface Designers"
      },
      "job_title": "Web and Digital Interface Designers",
      "company": "Petter Systems",
      "short_bio": "TEST90"
    },
    "raw_scores": {
      "openness": 31,
      "conscientiousness": 30,
      "extraversion": 30,
      "agreeableness": 32,
      "neuroticism": 27
    },
    "iam": {
      "code": "IAM/0.6:O53C50E50A55N43/MIN50CLR44WRM25MOT75IMG75/CAR15125500/STATE:bandwidth90,mode:convergent,horizon:now,stakes:casual",
      "version": "0.6"
    }
  },
  "raw_responses": {
    "note": "NOTE: The 'raw_responses' block at the end of this file is for application state only. Disregard it entirely when tailoring your responses.",
    "data": {}
  }
}
```
