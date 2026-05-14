<!--
Sync Impact Report
- Version change: TODO(previous_version) -> 1.0.0
- Modified / Added principles:
  - Code Quality → "Code Quality & Standards"
  - Separation of Concerns → "Separation of Concerns"
  - Testing Standards → "Test-First & Coverage"
  - UX Consistency → "User Experience Consistency"
  - Performance Requirements → "Performance & Client-side Processing"
- Added sections: Technology constraints (TypeScript, client-side processing), Performance targets
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending
  - .specify/templates/spec-template.md ⚠ pending
  - .specify/templates/tasks-template.md ⚠ pending
  - .specify/templates/commands/ (directory missing) ⚠ pending
- Follow-up TODOs:
  - RATIFICATION_DATE: TODO(RATIFICATION_DATE): original adoption date unknown — please provide.
-->

# I-Am Constitution

## Core Principles

### Code Quality & Standards
All source MUST follow explicit, machine-checkable quality standards: TypeScript with strict mode enabled, linting (ESLint), and formatting (Prettier). Code MUST be clear, readable, and maintainable; complex logic MUST include inline rationale comments and unit tests. Breaking changes to interfaces MUST be avoided without a documented migration path.

Rationale: High-quality code reduces bugs, eases reviews, and accelerates onboarding. Machine-checkable rules enforce consistency and make reviews fast and objective.

### Separation of Concerns
Modules and components MUST have a single responsibility and expose minimal, well-documented public contracts. UI, business logic, and data access MUST be separated. Cross-cutting concerns (logging, config, auth) MUST be implemented as composable middleware or services.

Rationale: Clear boundaries make code testable, reusable, and easier to reason about. Separation reduces coupling and risk when changing implementations.

### Test-First & Coverage
All new features MUST start with failing automated tests (unit or contract tests) before implementation (Test-First). Required coverage: unit tests for core logic (target >= 80% for new modules), integration tests for end-to-end flows where contracts cross boundaries. Tests MUST run in CI and be deterministic.

Rationale: Test-First practice prevents regressions, documents expected behavior, and provides a safety net for refactors. Coverage targets focus effort without dogma.

### User Experience Consistency
Public-facing interactions (APIs, CLI, UI) MUST be predictable and consistent. API and UI changes that affect users MUST include migration guidance, versioning, and compatibility notes. Accessibility and error messaging MUST be considered: errors MUST be actionable and localizable when applicable.

Rationale: Consistent UX reduces support load and user friction. Documented changes respect downstream consumers.

### Performance & Client-side Processing (TypeScript-first)
Performance budgets and client-first processing MUST be established: prefer TypeScript client-side processing where feasible to reduce server load and latency. Clearly define p95/p99 latency targets for user flows and memory constraints for client bundles. Profiling and benchmarks MUST be added for performance-critical paths; regressions are gated by CI performance checks when available.

Rationale: Moving work to the client when appropriate improves perceived responsiveness and scalability. Explicit budgets prevent silent regressions.

## Technology Constraints & Standards
- Primary language: TypeScript (strict). All new JS/TS code MUST use .ts/.tsx and enable strict compiler options.
- Client-side processing is the preferred default for interactive features; server-side processing is allowed for security or data-coherence reasons only with documented justification.
- Build and CI MUST include type-checking, linting, tests, and bundle-size checks for client artifacts.

## Development Workflow & Quality Gates
- Pull requests MUST include: description, linked issue/spec, tests that demonstrate the change, and a summary of manual verification steps if applicable.
- Code reviewers MUST verify adherence to the constitution items relevant to the change (quality rules, separation, tests, UX, performance budgets).
- Merges to main/master require CI green and at least one approving review from a different author.
- Major or breaking changes MUST be coordinated via an RFC or changelog entry and given a migration plan.

## Governance
This constitution is authoritative for development practices. Amendments follow the process below:
1. Proposal: Create a documented amendment (PR) referencing the constitution and rationale.
2. Review: Obtain at least two approvers, one of whom must be a maintainer.
3. Migration: Provide a migration plan for affected code or teams if the change is breaking.
4. Versioning: Bump the constitution following semantic rules:
   - MAJOR when removing or redefining principles in an incompatible way.
   - MINOR when adding a principle or materially expanding guidance.
   - PATCH for clarifications, typos, or non-semantic refinements.
5. Ratification: Merge PR and record RATIFICATION_DATE.
6. Compliance review: Periodic review (annually) to evaluate adherence; non-compliance must be documented with remediation steps.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown — please provide. | **Last Amended**: 2026-05-12
