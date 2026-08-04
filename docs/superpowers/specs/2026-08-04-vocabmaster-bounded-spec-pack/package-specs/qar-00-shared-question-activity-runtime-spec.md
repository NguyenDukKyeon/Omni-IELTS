# QAR-00 — Shared Question Activity Runtime Contracts

## Metadata

| Field | Value |
|---|---|
| Spec ID | `QAR00-CONTRACT-001` |
| Spec type | `feature` |
| Local spec status | `DRAFT` |
| Canonical package | `QAR-00` |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Implementation authorization | `NOT_GRANTED` |
| Canonical boundary | `docs/ROADMAP.md` QAR-00; `docs/IMPLEMENTATION_PLAN.md` QAR-00 |
| Dependencies | LI-00 and SRC-00 |
| Acceptance owner | Independent canonical reviewer at the exact implementation commit |
| Requirement namespace | `QAR00-QC-*` |

## Goal and acceptance boundary

Define a shared, versioned contract registry for objective Reading/Listening
question activities. The registry standardizes question validation, learner
response normalization, deterministic scoring/review semantics and executor
capability negotiation while reusing canonical P1 Activity/Run/Attempt/Receipt
execution.

QAR-00 is a contract/registry seam, not a second runtime. It neither claims nor
owns the complete IELTS inventory.

## Repository anchors

- `src/learning-contracts.js`, `src/today-runner.js` and
  `src/evidence-policy.js` are the canonical execution/evidence path.
- `src/ielts-domain.js`, `src/ielts-content.js` and current IELTS tests contain
  existing objective activity primitives that may be adapted.
- P3 Transcript/media owners remain responsible for listening source timing and
  playback, while SRC-00 will provide the stable revision seam.

These anchors show reuse; they are not evidence of full Reading/Listening
coverage.

## Ownership and non-goals

| Concern | Owner after QAR-00 |
|---|---|
| Versioned question-kind schema/registry and common result envelope | QAR-00 |
| Run/Attempt/Receipt, Today and persistence | Existing P1 owners plus LI-00 safety seam |
| Source revision resolution | SRC-00 and underlying source owners |
| Skill-specific executor/UI | Existing or future canonical skill package owner |
| IELTS Academic/GT profile and content inventory | Future approved IELTS profile/inventory owner |
| Evidence eligibility | EvidencePolicy |
| Writing/Speaking productive artifacts | Future Productive Practice owner |

QAR-00 does not own media acquisition, transcript correction, full mocks,
section timing/profile rules, question authoring inventory, Writing/Speaking,
qualified-evidence policy, scheduler, attempt store or product UI shell. Retell,
shadowing and pronunciation are not QAR exam subsystems.

## Logical contracts

### Question activity specification

| Field group | Required meaning |
|---|---|
| Schema | question kind, schema version and registry revision |
| Identity | activity/item/group IDs and stable display/order position |
| Source | exact SRC-00 reference plus bounded passage/segment/region anchors |
| Prompt | immutable prompt/instruction revision and localized display content |
| Response | response shape, cardinality, normalization policy and declared constraints |
| Answer authority | sealed deterministic key or explicit human-review requirement; never model-generated at scoring time |
| Scoring/review | scorer ID/version, item weights, partial-credit policy and review disclosure policy |
| Execution | required capability flags and accessibility/keyboard semantics |
| Provenance | author/generator, validator/user approval state and rights/privacy projection |

The contract supports single items and grouped items without letting one schema
silently change the canonical P1 attempt identity. An activity may contain
multiple item responses, but the implementation spec must define how item-level
results bind into one canonical attempt/receipt without creating another
attempt store.

### Registry entry

Each `(questionKind, schemaVersion)` has exactly one schema validator, response
normalizer, scorer/reviewer adapter and capability declaration. Executors
register supported versions; launch fails closed when the selected executor
cannot satisfy the required capabilities.

### Result envelope

The common result records normalized learner response, per-item disposition,
score numerator/denominator where deterministic, review-required reasons,
normalization/scorer versions and sealed key digest. It is data carried by the
canonical Attempt; it is not an EvidenceDecision and cannot affect schedule by
itself.

## Requirements

| ID | Normative requirement |
|---|---|
| `QAR00-QC-01` | Every executable question names a registered kind/schema and validates before a Run starts. |
| `QAR00-QC-02` | Source, prompt, key/rubric and scorer versions are immutable and participate in the LI-00 frozen binding. |
| `QAR00-QC-03` | Response normalization is deterministic, locale-aware only where declared, and cannot silently broaden accepted answers. |
| `QAR00-QC-04` | Scoring is deterministic for objective keys; ambiguous/subjective cases return explicit review-required semantics. |
| `QAR00-QC-05` | AI-generated draft questions/keys remain non-executable until schema/invariant validation and required human approval succeed. |
| `QAR00-QC-06` | Unsupported kind/version/capability fails before learner submission and cannot degrade to a different question type. |
| `QAR00-QC-07` | The executor emits canonical Attempt/Receipt bindings and does not maintain a parallel attempt/status store. |
| `QAR00-QC-08` | Reveal, hint, transcript and correction actions append to the canonical AssistanceTrace and constrain later evidence. |
| `QAR00-QC-09` | Unknown future schema data is preserved where safe but remains unexecutable until registered. |
| `QAR00-QC-10` | Reading and Listening can share contract machinery while retaining different content inventory, source/timing and section rules. |
| `QAR00-QC-11` | Accessibility, keyboard, focus and review semantics are capability requirements, not optional executor metadata. |
| `QAR00-QC-12` | Coverage is reported per question kind across schema, executor/UI, scoring/review, attempt storage, tests and acceptance evidence; registry presence alone is not coverage. |

## Validation and invariant boundary

Before execution, validation must cover:

- unique item/group identities and stable order;
- source-anchor bounds and exact source revision;
- response cardinality and answer-key compatibility;
- key completeness without leaking sealed answers to the learner surface;
- unambiguous mapping/matching targets and no impossible duplicate constraints;
- scoring totals/weights and declared partial-credit behavior;
- executor capability and schema-version compatibility;
- provenance/approval state and rights/privacy policy supplied by the owner.

Validation failure is typed and non-destructive. It never repairs generated
content silently.

## Migration and rollback

At least one existing accepted objective executor is wrapped as the first
adapter. Historical attempts are not rewritten. Existing content that cannot be
represented losslessly remains on its accepted executor and is recorded as an
explicit matrix gap.

Rollback removes the QAR adapter/registry route and returns eligible activities
to their existing executors. Canonical attempts and source revisions remain
readable. Unknown QAR data is preserved for export but not launched.

## Required verification

| Test obligation | Required evidence |
|---|---|
| Registry/schema | duplicate registrations, unknown kind/version, malformed group/item identities and schema round-trip |
| Normalization | whitespace/case/punctuation/number variants only when declared; adversarial near-answer rejection |
| Scoring/review | sealed key, exact item results, partial-credit declaration and review-required path |
| Executor | capability mismatch, accessibility/focus/keyboard contract and one existing adapter end-to-end |
| Integrity | changed source/prompt/key/scorer after start is rejected through LI-00 |
| Assistance/evidence | reveal/hint/transcript traces remain complete and cannot self-grant eligibility |
| Durability | activity → attempt → receipt → reload and backup/restore/reopen through canonical stores |
| Coverage honesty | matrix remains partial unless every acceptance dimension has evidence |

The first vertical slice should use one bounded Listening activity from exact
audio/transcript revision through feedback/error candidate to a next-practice
signal; it does not authorize the future assessment/readiness owners in that
integration brief.

## Gates and acceptance evidence

Entry requires accepted LI-00 and SRC-00, approved registry/version rules,
answer-authority policy, one selected existing executor adapter, exact
predecessor and no overlapping runtime writer.

Exit evidence includes exact commit/parent, diff boundary, schema/registry
artifacts, requirement trace, deterministic/adversarial tests, durable browser
activity/attempt/receipt evidence, migration/rollback proof and independent
exact-commit audit. QAR-00 acceptance proves the shared contract seam only; it
does not prove any IELTS question inventory complete or the product “full
IELTS”.
