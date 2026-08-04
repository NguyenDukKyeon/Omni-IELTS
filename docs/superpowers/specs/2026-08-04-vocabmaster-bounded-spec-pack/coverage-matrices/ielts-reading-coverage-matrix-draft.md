# IELTS Reading Coverage Matrix — Academic and General Training

Matrix status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-4S IS GROUPING_ONLY`
Shared contract consumer: QAR-00, currently
`PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`
Implementation authorization: `NOT_GRANTED`

This matrix is a gap ledger, not a “full IELTS” claim and not a package/status
record. A future approved Reading inventory/executor owner must rebind it before
implementation.

## Legend and acceptance rule

- `VERIFIED_EXISTING`: repository has type-specific implementation and evidence
  for this exact dimension.
- `PARTIAL`: a reusable primitive exists but does not prove the exact question
  type or full dimension.
- `GAP`: no qualifying type-specific implementation/evidence was found at the
  inspected baseline.
- `RESEARCH_REQUIRED`: repository inspection cannot safely decide the behavior.

A row is covered only when inventory, schema, executor/UI, scoring/review,
canonical attempt storage, evidence semantics, tests and independent acceptance
evidence are all `VERIFIED_EXISTING` for both intended IELTS profiles. No row
currently meets that rule.

## Baseline matrix

| Reading question type | Academic inventory / GT inventory | Schema | Executor/UI | Scoring/review | Attempt storage | Evidence semantics | Tests | Acceptance evidence |
|---|---|---|---|---|---|---|---|---|
| Multiple choice | GAP / GAP | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| True/False/Not Given | GAP / GAP | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | GAP | GAP |
| Yes/No/Not Given | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Matching information | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Matching headings | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Matching features | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Matching sentence endings | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Sentence completion | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Summary completion | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Note completion | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Table completion | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Flow-chart completion | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Diagram-label completion | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Short-answer questions | GAP / GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |

## Repository evidence at tracked baseline `d8ec9c7f`

- `src/ielts-domain.js:30` and `src/ielts-domain.js:247` expose a six-token
  micro-kind registry, including `true-false-not-given`, but all current items
  normalize to the same single-choice shape; unknown kinds fall back to another
  micro-kind rather than fail as a versioned Reading schema.
- `server/ielts-api.mjs:68` produces one-answer multiple-choice drafts and
  explicitly avoids True/False/Not Given generation.
- `src/ielts-lab.js:193` and `src/ielts-lab.js:294` render radio options plus an
  evidence field and use a simple selected-correct/evidence-match rule. There is
  no type-specific matching, completion, word-limit or diagram interaction.
- `src/ielts-persistence.js:54` and `src/ielts-persistence.js:153` persist a
  generic legacy `readingAttempts` record, not a question-kind-versioned frozen
  QAR activity through canonical Run/Attempt/Receipt.
- `tests/ielts-domain.test.mjs:94`, `tests/ielts-persistence.test.mjs:29` and
  `scripts/ielts-browser-smoke.mjs:41` cover curated single-choice validation,
  generic persistence and one radio/evidence browser path only.
- `docs/ielts-phases-0-5-audit.md:121` describes the surface as constrained
  micro-practice, not a full IELTS Reading simulator.

No Academic/General Training discriminator exists in the inspected schema,
runtime or tests. Topic style is not accepted as a profile discriminator.

## Required future matrix updates

Before a row can move to `VERIFIED_EXISTING`, evidence must bind:

1. profile-specific inventory item and source rights/provenance;
2. versioned QAR schema plus invariant validator;
3. accessible executor/UI and review flow;
4. deterministic key/normalization or explicit human-review semantics;
5. canonical frozen activity, attempt and terminal receipt;
6. AssistanceTrace and EvidencePolicy disposition;
7. focused, persistence, browser/a11y and adversarial tests;
8. independent acceptance evidence at the exact implementation commit.

Reading inventory ownership, Academic/GT section structure, timing and
full-section assembly remain unassigned canonical boundaries. They cannot be
silently absorbed by QAR-00.
