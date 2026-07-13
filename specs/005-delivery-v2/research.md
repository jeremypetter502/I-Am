# Research: Delivery v2

## Decision 1: Delivery v2 is a separate module

- Decision: Treat Delivery v2 as its own optional module, independent from Delivery v1.
- Rationale: The user explicitly requested a separate module and the repository’s module pattern already stores each module with its own `disabled` state.
- Alternatives considered: Reusing the Delivery v1 module with a version switch, or merging both into one shared delivery module.

## Decision 2: Separate profile entry and question bank

- Decision: Add a separate `delivery2` module entry and a separate question bank file.
- Rationale: This mirrors the existing module architecture and avoids coupling the new module to legacy Delivery v1 prompts.
- Alternatives considered: Storing Delivery v2 under `profile.preferences`, or reusing the Delivery v1 question set.

## Decision 3: Keep the shared 1-5 Likert response scale

- Decision: Use the same 1-5 Likert questionnaire format as the other modules.
- Rationale: The existing Delivery questionnaire and Communication questionnaire both use the same answer style, so consistency is the least surprising behavior.
- Alternatives considered: 3-point or 7-point scales, or a mixed response format.

## Decision 4: Encode all six metric values

- Decision: Emit all six Delivery v2 metric values in the `/DELIVERY2/` segment.
- Rationale: A complete encoded payload is easier to compare, debug, and round-trip than a sparse thresholded segment.
- Alternatives considered: Omitting neutral values or collapsing the segment to a single summary value.

## Decision 5: Preserve disable semantics without precedence rules

- Decision: Respect `disabled` as authoritative for each module and do not define precedence between Delivery v1 and Delivery v2.
- Rationale: The user clarified that modules are independently opt-in and can be disabled at any time.
- Alternatives considered: Version precedence, override behavior, or a mutually exclusive delivery setting.
