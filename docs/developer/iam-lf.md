# Developer: I-AM Long Form (LF) Integration Notes

This document explains how LF integrates with the IAM generator and where to find mapping artifacts.

- Mapping files: `specs/006-long-form-iam/mappings/`
- Generator hook: `src/lib/iam/iam.js` supports `buildIam(scored, modules, options)` where `options.format='long_form'` and `options.lfVersion='LF.0.1'`.
- UI: `src/ui/pages/SurveyPage.svelte` exposes a `Long Form` checkbox in the Generate popup.
