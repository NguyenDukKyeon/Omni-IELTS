# IELTS Listening Coverage Matrix — Academic and General Training

Matrix status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-4S IS GROUPING_ONLY`
Shared contract consumer: QAR-00, currently
`PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`
Implementation authorization: `NOT_GRANTED`

This is a type-by-type evidence gap ledger. Academic and General Training may
share a Listening runtime/inventory, but that future ownership has not been
canonicalized. Dictation is a reusable specialization; it is not accepted as a
substitute for IELTS completion or short-answer types.

## Legend and acceptance rule

`VERIFIED_EXISTING`, `PARTIAL`, `GAP` and `RESEARCH_REQUIRED` have the meanings
defined in the Reading matrix. A type is covered only when all columns are
`VERIFIED_EXISTING` at an independently accepted exact commit. No row currently
meets that rule.

## Baseline matrix

| Listening question type | Shared A/GT inventory | Schema | Executor/UI | Scoring/review | Attempt storage | Evidence semantics | Tests | Acceptance evidence |
|---|---|---|---|---|---|---|---|---|
| Multiple choice | GAP | PARTIAL | PARTIAL | GAP | GAP | GAP | PARTIAL | GAP |
| Matching | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Plan/map/diagram labelling | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Form completion | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Note completion | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Table completion | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Flow-chart completion | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Summary completion | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Sentence completion | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Short-answer questions | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |

## Repository evidence at tracked baseline `d8ec9c7f`

- `src/content-contracts-v2.js:30` and `src/content-contracts-v2.js:296`
  accept a generic `listening-comprehension` activity with prompt/answer and
  optional choices, but define no IELTS question-kind schema or deterministic
  scorer.
- `content-repo/packs/foundations-week-1/manifest.json:530` contains a small
  listening-comprehension fixture, not a canonical IELTS inventory or sealed
  selection key.
- `src/content-experience.js:44` and `src/content-experience.js:81` display
  choices/answer/feedback and allow completion without collecting or scoring a
  learner response.
- `src/content-lifecycle.js:440` stores activity progress rather than a frozen
  question attempt/receipt with type-specific response semantics.
- `scripts/phase4-browser-smoke.mjs:114` verifies content rendering, not an
  answered Listening question.
- `src/ielts-domain.js:436`, `src/ielts-lab.js:314` and
  `scripts/ielts-browser-smoke.mjs:46` provide real dictation/coaching
  primitives and durable media attempts. They do not establish Sentence
  Completion, Short Answer or another IELTS Listening type.

Current Phase 4 implementation evidence is not independent package acceptance,
and QAR-00 itself remains planned. These facts prevent promotion of generic
content or dictation primitives into accepted Listening coverage.

## Required future matrix updates

Every row needs evidence for:

1. profile/section inventory, exact audio and transcript revision plus rights;
2. type-specific QAR schema and content invariants;
3. time-synchronized, accessible executor/UI with no answer leakage;
4. deterministic normalization/key or explicit review semantics;
5. canonical frozen activity/attempt/terminal receipt and media-source binding;
6. AssistanceTrace and EvidencePolicy outcome;
7. focused, persistence, audio/timing, browser/a11y and adversarial tests;
8. independent exact-commit acceptance.

Listening inventory, section/timing profile and accepted media-question adapter
remain unassigned canonical boundaries. QAR-00 may supply contracts but cannot
become their owner by implication.
