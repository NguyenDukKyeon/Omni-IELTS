# ERR-00 — ErrorCandidate Lifecycle and Atomic Promotion

## Metadata

| Field | Value |
|---|---|
| Spec ID | `ERR00-CANDIDATE-001` |
| Spec type | `feature` |
| Local spec status | `DRAFT` |
| Canonical package | `ERR-00` |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Implementation authorization | `NOT_GRANTED` |
| Canonical boundary | `docs/ROADMAP.md` ERR-00; `docs/IMPLEMENTATION_PLAN.md` ERR-00 |
| Dependencies | LI-00 and accepted P1-06 |
| Acceptance owner | Independent canonical reviewer at the exact implementation commit |
| Requirement namespace | `ERR00-EC-*` |

## Goal and acceptance boundary

Contain uncertain learner-error signals—especially AI/advisory output—as
`ErrorCandidate` records. Promote a candidate into the existing global P1-06
Error Repository only after a permitted authority confirms it, with one atomic,
idempotent occurrence effect.

ERR-00 owns candidate state, decision provenance and the promotion saga. P1-06
remains the sole owner of canonical ErrorRecord, occurrences, resolution and
repair queue. EvidencePolicy remains the sole evidence authority.

## Repository anchors

- `src/error-repository.js` owns global records, idempotent occurrences,
  correction evidence and repair-queue projection.
- `src/evidence-policy.js` owns whether evidence may affect schedule/mastery.
- Current IELTS bridges demonstrate direct/advisory error inputs that future
  implementation must route without creating another canonical error store.

These are integration anchors, not permission to change their ownership.

## Ownership and non-goals

| Concern | Owner after ERR-00 |
|---|---|
| Candidate lifecycle and decision audit | ERR-00 |
| Canonical ErrorRecord/occurrence and repair queue | P1-06 |
| Evidence eligibility/schedule mutation | EvidencePolicy and existing gateway |
| Weakness aggregation/readiness | Future approved assessment owner |
| Provider/model quality evaluation | Future capability research boundary |

ERR-00 does not score answers, infer mastery, write FSRS, resolve canonical
errors, own WeaknessProfile, evaluate providers, or treat model agreement as
truth. It does not retain a duplicate canonical ErrorRecord projection.

## Logical contract

### ErrorCandidate

| Field group | Required meaning |
|---|---|
| Identity | candidate ID, schema version and stable idempotency key |
| Subject | exact learner/run/attempt/receipt and target/source-revision bindings available at observation time |
| Claim | proposed category, learner span/output, expected/corrected form and confidence without claiming authority |
| Origin | producer type/version, prompt/config digest where applicable, timestamp and assistance/reveal state |
| Decision | current state, deciding authority, rationale/reason code, timestamp and superseded decision link |
| Promotion | deterministic P1-06 occurrence ID, promotion status and canonical result reference when created |

Provider rationale may be stored as advisory text, but only normalized structured
fields participate in promotion. Sensitive learner output follows the owning
privacy/retention policy.

### States

`OPEN → CONFIRMED | REJECTED | EXPIRED`

`CONFIRMED → PROMOTION_PENDING → PROMOTED`

`PROMOTION_PENDING` may return to itself after interruption. A correction to an
already decided candidate creates a new immutable decision revision linked to
the earlier one; it does not erase history. Retraction after promotion records a
separate canonical correction/annotation through the P1-06 owner and never
deletes the original occurrence silently.

Permitted confirmation authorities are explicit and versioned:

- direct user confirmation; or
- qualified evidence already accepted by the canonical evidence policy for the
  exact target and source revision.

AI/provider confidence or multi-model agreement alone is never qualified.

## Requirements

| ID | Normative requirement |
|---|---|
| `ERR00-EC-01` | Every uncertain/advisory signal enters as `OPEN`; creation cannot write P1-06 or schedule/mastery state. |
| `ERR00-EC-02` | Candidate identity binds exact source/attempt/target where available and records any missing binding explicitly. |
| `ERR00-EC-03` | Only direct user confirmation or exact-target qualified evidence may produce `CONFIRMED`. |
| `ERR00-EC-04` | Reveal/coaching/provider flags cannot be forged into independent or verified authority. |
| `ERR00-EC-05` | Promotion derives one deterministic P1-06 occurrence identity and commits at most one occurrence effect. |
| `ERR00-EC-06` | Duplicate identical promotion is idempotent; conflicting payload under the same identity fails as a collision. |
| `ERR00-EC-07` | Crash at every boundary between decision and occurrence write is recoverable without zero-or-two effects. |
| `ERR00-EC-08` | Rejection and expiry remain durable, auditable and non-promoting; source/transcript errors remain separate from learner errors. |
| `ERR00-EC-09` | Out-of-order/replayed events cannot revert a later decision or overwrite canonical P1-06 history. |
| `ERR00-EC-10` | Backup/export/restore preserves candidate, decision and promotion linkage without inventing confirmation. |
| `ERR00-EC-11` | A correction/retraction preserves provenance and uses the existing canonical error-owner boundary. |
| `ERR00-EC-12` | AI unavailability leaves manual confirmation/rejection usable and cannot block existing P1-06 operations. |

## Promotion transaction

The desired effect is logically atomic even if implemented as a recoverable
saga:

1. Re-read candidate and immutable decision revision.
2. Validate authority, exact bindings and absence of conflicting disposition.
3. Derive the canonical P1-06 occurrence input and deterministic identity.
4. Record/reconcile the canonical occurrence through P1-06.
5. Bind the candidate to the returned canonical record/occurrence.

After interruption, reconciliation queries the canonical occurrence identity.
If it exists with the same digest, the candidate advances to `PROMOTED`; if it
does not, the same operation may retry; a different digest is terminal conflict.
No compensation deletes an ErrorRecord occurrence.

## Migration and rollback

Legacy advisory entries may become non-promoted candidates only when their
actual provenance can be retained. The migration must not infer user
confirmation. Existing canonical P1-06 occurrences remain canonical and are not
back-converted.

Rollback disables new candidate intake/promotion and exports unresolved state.
It never removes P1-06 occurrences already written. If a candidate cannot be
read after rollback, the canonical occurrence linkage remains sufficient to
avoid duplicate re-import.

## Required verification

| Test obligation | Required evidence |
|---|---|
| Authority | forged caller decision, model agreement, stale/mismatched qualified evidence and direct user confirmation |
| Lifecycle | confirm, reject, expire, correction and post-promotion retraction paths |
| Atomicity | crash before/after each promotion step, duplicate callback and reopen reconciliation |
| Ordering | replayed and out-of-order decisions; deterministic last valid immutable revision |
| Separation | transcript/source defect cannot become learner occurrence without a new valid claim |
| Integration | exactly one P1-06 occurrence and no second ErrorRecord/repair queue owner |
| Durability | backup → restore → reopen for open, rejected, pending and promoted states |
| Degradation | AI/provider absent while user and existing P1-06 flows remain functional |

Report candidate transition, P1-06 occurrence and downstream schedule effect
counts separately.

## Gates and acceptance evidence

Entry requires approved candidate taxonomy, authority matrix, idempotency key,
retraction/correction semantics, exact predecessor and one-writer boundary over
candidate plus P1-06 integration code. LI-00 must be accepted first; ERR-00 may
not weaken its target/evidence binding.

Exit evidence includes exact commit/parent, authorized diff, requirement trace,
state-machine/model tests, durable crash/reopen and backup/restore evidence,
proof of one canonical P1-06 effect, proof of zero direct AI/evidence/FSRS writes,
migration/rollback evidence and independent exact-commit audit.
