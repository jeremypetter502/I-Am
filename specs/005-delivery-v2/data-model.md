# Data Model: Delivery v2

## Entities

- Profile
  - id: string
  - modules:
    - delivery: existing legacy module entry
    - delivery2: {
      responses: number[]
      result?: {
        raw: {
          str: number
          dns: number
          frm: number
          fmt: number
          emp: number
          aut: number
        }
        normalized: {
          str: number
          dns: number
          frm: number
          fmt: number
          emp: number
          aut: number
        }
        completed: boolean
        last_updated: string
      }
      disabled?: boolean
    }

## Validation Rules

- Delivery v2 responses use the same 1-5 Likert scale as other module questionnaires.
- Reverse-scored items must be normalized before aggregation.
- The module contains six metrics: Structure, Density, Formality, Format Control, Empathy, and Autonomy.
- The module remains optional and can be disabled independently of other modules.

## State Transitions

- disabled -> enabled/in-progress when the user opts into Delivery v2
- in-progress -> completed when the question bank is fully answered and scores are computed
- completed -> disabled if the user turns the module off later

## Serialization Notes

- ContextFile/Profile export should preserve the `delivery2` module entry when enabled.
- IAM export should serialize the module as `/DELIVERY2/...` with all six metric values.
