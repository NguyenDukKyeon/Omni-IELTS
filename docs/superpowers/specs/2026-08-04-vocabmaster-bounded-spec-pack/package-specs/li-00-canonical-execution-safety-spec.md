# LI-00 — Canonical Execution Safety and Frozen Run

## Metadata

| Field | Value |
|---|---|
| Spec ID | `LI00-FROZEN-RUN-001` |
| Spec type | `feature` |
| Local spec status | `DRAFT` |
| Canonical package | `LI-00` |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Implementation authorization | `NOT_GRANTED` |
| Canonical boundary | `docs/ROADMAP.md` LI-00; `docs/IMPLEMENTATION_PLAN.md` LI-00 |
| Dependencies | Accepted P1-01, P1-02, P1-07, P1-08 and current EvidencePolicy |
| Acceptance owner | Independent canonical reviewer at the exact implementation commit |
| Requirement namespace | `LI00-FR-*` |

This specification narrows LI-00. It does not authorize source changes, select
an implementation predecessor, or alter package status.

## Goal and acceptance boundary

Harden the existing canonical `ActivitySpec → Run → Attempt → Receipt` path so
that starting a Run freezes every input that can change execution, scoring or
evidence interpretation. Exactly one compatible terminal Receipt may win for
that Run. Reloads, duplicate callbacks, tab races and stale UI state must not
change the binding or create a second terminal outcome.

The package owns the frozen-binding and terminal-settlement seam only. Existing
P1 repositories retain durable storage, Today retains planning and execution,
skill executors retain activity behavior, and EvidencePolicy remains the sole
evidence/schedule authority.

## Repository anchors

The current accepted foundation is visible in:

- `src/learning-contracts.js`: versioned ActivitySpec/Run/Attempt/Receipt,
  immutable digests and envelope validation;
- `src/today-runner.js`: durable run resume, lease handling and terminal receipt
  recording;
- `src/evidence-policy.js` and `src/schedule-gateway.js`: default-deny evidence
  decision and schedule-write boundary;
- `tests/learning-contracts.test.mjs`, `tests/today-runner.test.mjs` and
  `tests/evidence-policy.test.mjs`: existing regression evidence.

These anchors are reuse evidence, not an implementation file allowlist.

## Ownership and non-goals

| Concern | Owner after LI-00 |
|---|---|
| Frozen execution binding and terminal-settlement contract | LI-00 |
| Activity/Run/Attempt/Receipt repositories | Existing P1-01/P1-02 owners |
| Today composition and executor dispatch | P1-07/P1-08 |
| Evidence verdict and schedule mutation | EvidencePolicy and existing gateway |
| Source identity repositories | Existing source owners; later SRC-00 adapters |
| Question schemas and scoring definitions | QAR-00 or the existing skill owner |

LI-00 does not create an activity runtime, executor registry, scheduler, store,
assessment aggregate, source registry, question inventory, AI authority, or
FSRS rule. It does not rewrite historical envelopes or relabel coaching evidence
as independent/verified.

## Logical contract

### Frozen binding

At Run creation the implementation must produce one immutable logical binding:

| Field group | Required meaning |
|---|---|
| Identity | Run ID, ActivitySpec ID and canonical ActivitySpec digest |
| Exact target | card, optional sense, skill, source ID and source revision already supplied by the canonical ActivitySpec |
| Execution | executor identity plus the exact activity/prompt/config revision consumed by that executor |
| Evaluation | answer-key or rubric revision/digest and scoring/review policy revision when applicable |
| Evidence | EvidencePolicy version/reference and complete assistance-collection mode |
| Idempotency | stable start and terminal-settlement keys |

An inapplicable field is represented explicitly as inapplicable under a
versioned schema; it is never inferred from current UI state. Secret answer
material need not be copied into the binding: an immutable digest plus an
authoritative resolver reference is sufficient.

### Terminal settlement

The existing receipt vocabulary remains canonical:
`completed`, `failed`, `skipped`, `cancelled`, `abstained`. Settlement is a
single durable compare-and-set over Run identity, frozen binding digest and
terminal idempotency key.

- Replaying the same terminal identity and payload is idempotent.
- Reusing the identity with a different payload is a terminal collision.
- A different terminal outcome after one outcome wins is rejected and retained
  as diagnostic evidence; it cannot overwrite the winner.
- A terminal Receipt is persisted before any derived scheduling effect is
  considered complete.
- EvidencePolicy is re-evaluated at the existing persistence boundary; a caller
  cannot embed an authoritative verdict in the binding.

## Requirements

| ID | Normative requirement |
|---|---|
| `LI00-FR-01` | Starting a Run validates one complete ActivitySpec and atomically persists its frozen binding before executor side effects. |
| `LI00-FR-02` | Resume and reload use the persisted binding; they never rebuild it from current plan, DOM, provider output or mutable source state. |
| `LI00-FR-03` | Target, source revision, prompt/config, evaluation semantics and evidence-policy revision cannot change after start. |
| `LI00-FR-04` | Missing, stale, unsupported or digest-mismatched bindings fail closed with a stable typed reason and no success/schedule write. |
| `LI00-FR-05` | Exactly one terminal Receipt wins across duplicate callbacks, retries, tabs and crash/reopen recovery. |
| `LI00-FR-06` | Identical terminal replay is idempotent; conflicting replay is a durable, non-overwriting collision. |
| `LI00-FR-07` | Every terminal path, including skip/cancel/failure/abstention, retains the exact Run and assistance/provenance binding needed for audit. |
| `LI00-FR-08` | Caller/provider strings cannot grant independent, verified, eligible or schedule-affecting authority. |
| `LI00-FR-09` | Eligible existing evidence remains reproducible under the bound EvidencePolicy inputs after reload and backup/restore. |
| `LI00-FR-10` | Existing accepted executors remain usable through additive adapters; unknown future fields are preserved or rejected per declared schema policy, never guessed. |

## State and failure semantics

The package may add internal settlement state, but it must project to existing
Run/Receipt vocabulary. A process crash between start and executor launch leaves
a resumable bound Run. A crash after terminal persistence returns the same
winner on reopen. A crash before terminal persistence leaves no claimed terminal
success and permits only a binding-identical retry.

Minimum stable failure classes:

- invalid or incomplete ActivitySpec;
- stale/missing target or source revision;
- execution/evaluation/evidence binding mismatch;
- already-active foreign lease;
- terminal identity collision;
- conflicting terminal outcome;
- EvidencePolicy or persistence rejection.

Presentation text is not part of the contract; the failure class, product versus
infrastructure classification, affected identity and absence/presence of a
terminal winner are.

## Migration and rollback

Implementation must be additive. It may wrap existing canonical records with a
versioned binding projection; it may not mutate or synthesize fields in old
evidence. A legacy row with insufficient binding remains readable and is either
coaching-only or explicitly unexecutable according to the existing migration
policy.

Rollback removes only the additive validator/projection/adapter. It must not
delete terminal receipts, collision evidence or accepted historical envelopes,
and must leave existing P1 execution available for records that never used the
new schema.

## Required verification

| Test obligation | Required evidence |
|---|---|
| Contract validation | Exact-field freeze, digest mismatch, missing/inapplicable field and unsupported schema tests |
| Lifecycle | start → reload → resume → terminal; start → crash → reopen; terminal → crash → reopen |
| Concurrency | two-tab start, lease expiry, simultaneous incompatible terminals and duplicate identical terminal |
| Authority | forged provider/caller evidence flags and mismatched EvidenceDecision are denied |
| Compatibility | existing Core/Today and at least one non-Core executor adapter retain prior behavior |
| Durability | backup → restore → reopen reproduces the same frozen binding, winner and evidence decision |
| Negative boundaries | stale source, changed prompt/key, wrong target, unknown executor and malformed legacy row fail closed |

Tests must report callback, durable-effect and terminal-winner counts separately;
a green UI callback is not proof of one durable effect.

## Gates and acceptance evidence

Entry requires an approved implementation spec revision, exact predecessor,
declared writer/file boundary, reviewed terminal vocabulary and migration
compatibility. LI-00 must not start while another writer overlaps canonical
learning contracts or Today settlement.

Exit evidence must include the exact subject commit/parent, authorized diff,
requirement-to-test trace, focused and PR commands with environment/result,
durable browser evidence for races/crash/reopen/restore, migration/rollback
evidence, and an independent audit at that exact commit. Implementer green tests
are handoff evidence only. Until the independent canonical verdict is recorded,
LI-00 remains not accepted.
