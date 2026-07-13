# Delivery v2 (DELIVERY2) Module Specification

Summary
- Short name: delivery-v2
- Goal: Add an optional Delivery v2 module that provides a simplified, focused alternative to Delivery v1 for users who prefer a more streamlined set of delivery preferences. Delivery v2 emits a compact segment marker `/DELIVERY2/` with 6 orthogonal metrics. Users can choose to use v1, v2, or neither.

Background
- The current Delivery (v1) has ~14 granular tokens that overlap in places with communication style signals. This creates redundancy and cognitive overhead for users. Delivery v2 provides an alternative path by: reducing metrics to a small, non-overlapping set; keeping user-facing questions short and personality-test style; and allowing users to choose v1, v2, or neither for their profile.

Scope
- Produce a specification for Delivery v2 only (no implementation). The spec defines metrics, user questions, acceptance criteria, and compatibility notes for selecting v1 or v2.
- This spec does not mandate encoding details, storage format, or UI components.

Actors
- End user: configures or answers the Delivery module prompts.
- Product owner: chooses defaults and inclusion thresholds.

Key Concepts and Constraints
- Keep 6 metrics that are mutually distinct and do not duplicate communication-style signals (COMM tokens: DRV, ANC, EXP, AMB).
- Provide initial simple questions plus personality-test-style follow-up and validation questions to refine understanding of user preferences.
- Provide a selection path allowing users to choose v1, v2, or neither for their profile.

Proposed Metrics (6)
1. Structure (STR) — preference for explicitly structured output (headings, numbered steps, outlines) vs narrative prose.
2. Density (DNS) — preference for concise / high-density content vs elaboration and examples.
3. Formality (FRM) — preference for formal vs casual phrasing and register.
4. Format Control (FMT) — preference for explicit output format and adherence to requested templates (tables, bulleted lists, code blocks, etc.).
5. Empathy (EMP) — level of emotional consideration and validation in responses (acknowledgement, reassurance).
6. Autonomy (AUT) — preference for proactive suggestions and action-orientation vs deferring to user prompts.

Notes on Metric Design
- These metrics avoid overlap with COMM tokens because COMM describes the user's interpersonal style (analytical, driver, expressive, amiable), while DELIVERY2 describes how content should be packaged and presented.
- `Formality` is distinct from `Communication` because it affects register and phrasing rather than persuasion style.
- `Autonomy` is delivery-oriented (how much the assistant should take initiative), not the same as `driver` communication which describes tone/approach.

Question Format and Scale

- Format: Likert scale statements (similar to Communication and Delivery v1 modules)
- Scale: 1 (Strongly Disagree) to 5 (Strongly Agree)
- Scoring: Normalize each response using ((r - 1) / 4) * 100
- Reverse-scored items marked [R]: subtract from 5 before normalization
- Structure: Use an uneven question bank per metric to validate preference strength; all items use the same 1–5 scale
- The response scale must match the other module questionnaires so users answer Delivery v2 with the same Likert format they already use elsewhere.

Assessment Questions

## STR (Structure)

1. I prefer responses organized with clear headings and section breaks. [STR]
2. Numbered steps and checklists help me understand and execute tasks better. [STR]
3. I find narrative paragraphs easier to follow than structured bullet points. [R][STR]
4. I want procedures broken into distinct, labeled phases or sections. [STR]

## DNS (Density)

5. I prefer concise answers that cover essentials only. [DNS]
6. I want fuller explanations with examples, even if it takes more space. [R][DNS]
7. I appreciate 'TL;DR' summaries and key takeaways up front. [DNS]
8. I need context and background before diving into recommendations. [R][DNS]

## FRM (Formality)

9. I prefer formal, professional language in all interactions. [FRM]
10. Casual, conversational tone makes me more comfortable. [R][FRM]
11. Technical terminology and precise register matter for credibility. [FRM]
12. Friendly, personable language builds better rapport than formal speech. [R][FRM]

## FMT (Format Control)

13. When I request a specific format (table, list, code block), I expect strict adherence. [FMT]
14. Flexible formatting that adapts to content is better than rigid templates. [R][FMT]
15. Templates and explicit format constraints help me think clearly. [FMT]
16. I find prescribed output formats unnecessarily restrictive. [R][FMT]

## EMP (Empathy)

17. Before offering critiques, I appreciate acknowledgement of effort or frustration. [EMP]
18. Direct, efficient problem-solving matters more than emotional validation. [R][EMP]
19. I value reassurance and supportive tone when tackling difficult problems. [EMP]
20. I prefer neutral, transactional interactions without emotional language. [R][EMP]

## AUT (Autonomy)

21. I want proactive suggestions and next-step recommendations. [AUT]
22. I prefer to request help explicitly rather than receive unsolicited suggestions. [R][AUT]
23. I value the assistant taking initiative to offer related workflows or opportunities. [AUT]
24. I work best when I direct the conversation and exploration myself. [R][AUT]

Inclusion & Thresholds
- Emit all 6 metric values in the `/DELIVERY2/` segment by default so the profile is complete and comparable across users.

Compatibility & Selection
- Delivery v2 is a completely separate optional module, with its own enable/disable state, and follows the same opt-in pattern as the other modules.
- Users may independently choose Delivery v1, Delivery v2, or neither per profile. The system should support these configurations:
  - Neither: no delivery-related segment in I-AM string (user does not want delivery preferences encoded).
  - v1 only: `/DELIVERY/...` (legacy, ~14 tokens).
  - v2 only: `/DELIVERY2/...` (new compact tokens, 6 metrics).
  - Both: both delivery segments may be present if both modules are enabled.
- User-facing labels should use the plain module name "Delivery v2" in the UI and docs, while serialization continues to use `DELIVERY2`.
- The disable flag always takes precedence over any module version selection; if a module is disabled, it must not be used in profile generation or presentation.
- All future clarification decisions for Delivery v2 must be interpreted as independent from Delivery v1 unless explicitly stated otherwise.
- Delivery v2 should use its own separate question bank file rather than sharing prompts with Delivery v1.
- Delivery v2 should be represented as a separate `delivery2` module entry with `responses`, `result`, and `disabled` fields.

Clarifications

### Session 2026-06-11
- Q: How should the 6 metrics be encoded into the I-AM string? → A: Token + normalized values, e.g. `/DELIVERY2/STR99DNS45FRM72FMT58EMP88AUT62`.
- Q: Should the profile emit all 6 metric values or suppress neutral ones? → A: Emit all 6 metric values by default.
- Q: Should Delivery v2 be opt-in or enabled by default? → A: Opt-in.
- Q: What label should the UI use for the module? → A: "Delivery v2".
- Q: What should happen when a module is disabled? → A: The disable flag always wins; the module must not be used.
- Q: Should Delivery v2 be a separate module or a version of Delivery v1? → A: A completely separate module.
- Q: Should the question bank use balanced per-metric counts or uneven counts? → A: Uneven question counts per metric.
- Q: Should Delivery v2 have its own question bank file or reuse Delivery v1’s prompts? → A: Own separate question bank file.
- Q: How should Delivery v2 be represented in the profile data model? → A: Separate `delivery2` module entry with `responses`, `result`, and `disabled`.
- Q: What response scale should Delivery v2 use? → A: The same 1–5 Likert scale as the other module questionnaires.

Onboarding Flow

- Phase 1: Present the full Delivery v2 question bank in a single questionnaire format (Likert 1–5 scale).
- Phase 2: Compute metric scores by averaging responses within each subscale (STR, DNS, FRM, FMT, EMP, AUT).
  - For reverse-scored items, subtract from 5 before averaging.
  - Normalize each metric to 0–100 using ((mean - 1) / 4) * 100.
- Phase 3: Display inferred delivery preferences to the user and allow adjustment before finalizing profile.

Assumptions
- Implementations will handle mapping short answers to normalized values; this spec avoids encoding or transport details.
- Communication style remains the authoritative source for interpersonal persuasion/approach signals.

Acceptance Criteria
- Spec written and reviewed by product or UX stakeholder.
- Contains 6 orthogonal metrics that do not overlap with COMM tokens.
- Includes 24 Likert-scale assessment questions (4–5 per metric) in unified format.
- Questions include reverse-scored items to reduce response bias and validate consistency.
- Scoring methodology clearly defined (normalization, reverse-scoring, metric aggregation).
- Provides a clear compatibility story: user can select v1, v2, or neither.

Next Steps
- If accepted, produce UI text and scoring rules, then update the I-AM serialization guidance.
