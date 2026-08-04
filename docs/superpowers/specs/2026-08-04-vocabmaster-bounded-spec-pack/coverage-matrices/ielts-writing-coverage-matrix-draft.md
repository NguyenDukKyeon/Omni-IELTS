# IELTS Writing Task Coverage Matrix

Matrix status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-4S IS GROUPING_ONLY`
Shared productive-practice owner: not yet canonicalized
Implementation authorization: `NOT_GRANTED`

Current lexical production is a reusable coaching primitive, not an IELTS
Writing task executor, artifact store or scorer. `PARTIAL` below always means
primitive reuse only; it never means the task type is implemented.

## Legend and acceptance rule

- `VERIFIED_EXISTING`: exact task-type capability/evidence exists.
- `PARTIAL`: narrower lexical/coaching primitive may be reused.
- `GAP`: exact task-type implementation/evidence is absent.
- `RESEARCH_REQUIRED`: a future owner must research the decision.

A Writing type is covered only when inventory, schema, executor/UI,
review/scoring, durable artifact/attempt, evidence semantics, tests and
independent acceptance are all verified. No row currently meets this rule.

## Academic Task 1

| Task type | Inventory | Schema | Executor/UI | Review/scoring | Artifact/attempt | Evidence | Tests | Acceptance |
|---|---|---|---|---|---|---|---|---|
| Line graph | GAP | PARTIAL | PARTIAL | PARTIAL | GAP | GAP | PARTIAL | GAP |
| Bar chart | GAP | PARTIAL | PARTIAL | PARTIAL | GAP | GAP | PARTIAL | GAP |
| Pie chart | GAP | PARTIAL | PARTIAL | PARTIAL | GAP | GAP | PARTIAL | GAP |
| Table | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Mixed charts | GAP | PARTIAL | PARTIAL | PARTIAL | GAP | GAP | PARTIAL | GAP |
| Process diagram | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Map changes | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |

The only direct Academic Task 1 seed is a `Trends & Change` lexical set at
`src/ielts-content.js:3`. It asks for a short lexical production but contains no
visual dataset, overview/feature-selection contract, task prompt version or Task
1 rubric. No Task 1 chart/table/process/map generator exists.

## General Training Task 1

| Task type | Inventory | Schema | Executor/UI | Review/scoring | Artifact/attempt | Evidence | Tests | Acceptance |
|---|---|---|---|---|---|---|---|---|
| Formal letter | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Semi-formal letter | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Informal letter | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |

No tracked General Training profile or letter-register taxonomy, prompt bank,
executor, response artifact or review semantics was found.

## Shared Task 2

| Essay family | Inventory | Schema | Executor/UI | Review/scoring | Artifact/attempt | Evidence | Tests | Acceptance |
|---|---|---|---|---|---|---|---|---|
| Opinion | GAP | PARTIAL | PARTIAL | PARTIAL | GAP | GAP | PARTIAL | GAP |
| Discussion/both views | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Advantages/disadvantages | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Problem/solution | GAP | PARTIAL | PARTIAL | PARTIAL | GAP | GAP | PARTIAL | GAP |
| Two-part question | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Hybrid variants | GAP | GAP | GAP | GAP | GAP | GAP | GAP | GAP |

`src/ielts-content.js:14`, `:25`, `:36` and `:47` provide comparison,
cause/consequence, cautious-opinion and problem/solution lexical functions.
They are not an essay-family schema or task executor.

## Existing primitive evidence at tracked baseline `d8ec9c7f`

- `src/ielts-domain.js:163` defines LexicalSet functions/register/production
  task, not module/task number, visual/essay family, prompt constraints or IELTS
  rubric.
- `src/ielts-lab.js:286` sends one paragraph for target-level coaching and may
  record target errors, but does not persist the full paragraph as a durable
  Writing artifact/attempt.
- `src/learning.js:401`, `src/app.js:367` and `src/schedule-gateway.js:29`
  provide target-word sentence/short-output primitives and fail-closed evidence
  handling. That evidence is lexical-target evidence, not IELTS Writing scoring.
- `src/content-contracts-v2.js:30` declares sentence/paragraph production, but
  `src/content-experience.js:44` only renders prompt/answer and mark-complete;
  Phase 4 remains review-required and has no released pack.
- No WritingTask/Essay/Letter/Draft/ProductiveAttempt store or dedicated
  Writing/Speaking tab exists in the tracked IELTS domain/UI.

## Required future evidence

Each task row requires exact Academic/GT profile inventory and rights, versioned
ProductivePrompt/rubric, accessible drafting/autosave/recovery, immutable source
and prompt binding, durable LearnerArtifact/attempt/feedback revisions,
self-review/provider-off semantics, explicitly coaching-only AI feedback,
adversarial privacy/stale-feedback tests and independent exact-commit acceptance.

No review may claim an official IELTS band. A future score/estimate must disclose
rubric/evaluator version and uncertainty and remains coaching unless a separately
accepted authority boundary exists.
