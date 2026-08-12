# W6-P7-00-WKN-AUTH-007 — Clean Execution Recovery Authorization Manifest

## Manifest Identity
- **Authorization ID**: `W6-P7-00-WKN-AUTH-007`
- **Execution Record ID**: `W6-P7-00-WKN-EXEC-007`
- **Protocol**: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
- **Schema**: `WAVE_AUTHORIZATION_MANIFEST_V1`
- **Implementation Subject**: `P7-00 / WKN-00`
- **State**: `DRAFT_AUTHORIZATION_CANDIDATE`

## Historical Rejected Execution
- **AUTH-006**: `W6-P7-00-WKN-AUTH-006` / PR #60 — independently ACCEPTED (comment `5269598701`)
- **EXEC-006**: `W6-P7-00-WKN-EXEC-006` / PR #61 — independently REJECTED (comment `5269827425`)
- **Disposition**: `FROZEN / REJECTED / DO_NOT_MERGE / DO_NOT_REUSE`
- **AUTH-006 scope**: authorizes EXEC-006 only; does NOT directly authorize EXEC-007.

### EXEC-006 Rejection Findings (from independent auditor)
1. `CRITICAL: FORBIDDEN_DESTRUCTIVE_GIT_OPERATION / EXECUTION_PROVENANCE_INVALID`
2. `CRITICAL: NATURAL_RED_CONTRACT_INVALID / NON_CANONICAL_FIXTURE`
3. `CRITICAL: CANONICAL_EVENT_CONTRACT_NOT_IMPLEMENTED`
4. `CRITICAL: AUTHORIZED_PROJECTION_PIPELINE_NOT_WIRED`
5. `CRITICAL: P7_00_METRICS_STUBBED / CANONICAL_ACCEPTANCE_NOT_IMPLEMENTED`
6. `CRITICAL: IMPLEMENTER_EVIDENCE_INCOMPLETE / MIGRATION_ROLLBACK_NOT_VERIFIED`
7. `HIGH: EVIDENCE_SCHEMA_MISMATCH / COMMIT_C_IDENTITY_NOT_BOUND`
8. `HIGH: IMPLEMENTER_EVIDENCE_FALSE_COMPLETENESS`

### Root Cause Remediation Map
| EXEC-006 Finding | AUTH-007 Remediation |
|---|---|
| Non-canonical fixture | Section: Canonical RED Fixture Strategy |
| Canonical event not consumed | Section: Canonical Event Contract |
| Orphan modules | Section: Production Pipeline Wiring |
| Stubbed metrics | Section: Real Metrics — No Stubs |
| Migration/rollback IGNORED | Section: Migration/Rollback Contract |
| Evidence schema mismatch | Section: Evidence Schema V2 |
| Commit C self-reference | Section: Commit-C Binding Model |
| False completeness | Section: Evidence Truthfulness |
| Destructive git operation | Section: Execution Provenance |

## Exact Predecessor & Baseline CI
- **Exact Implementation Predecessor**: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
- **Baseline CI**: workflow `CI` (ID `322561862`), event `push`, run `#347`, run ID `31603172459`, conclusion `success`.

## Canonical Status at Predecessor
- `P7-00` = `NEXT`
- `P1-02` = `ACCEPTED`
- `P1-08` = `ACCEPTED`
- `WKN-00` canonical owner = `P7-00`

## Implementation Branch
- **New Branch**: `codex/p7-00-metrics-reducer-exec-007`
- **Origin**: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
- **Rejected branch**: `codex/p7-00-metrics-reducer` — `FROZEN / DO_NOT_REUSE`
- **Constraint**: rejected branch must not be reused, pushed, or cherry-picked.

## Mutation Allowlist

### SOURCE (modify/create only):
- `[MODIFY] src/progress.js`
- `[NEW] src/p7-00-metrics-reducer.js`
- `[NEW] src/weakness-profile.js`

### TEST (modify only):
- `[MODIFY] tests/progress.test.mjs`

### EVIDENCE (create only at Commit C):
- `[NEW] docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-007-evidence.md`

## Explicit Exclusions
The following paths are FORBIDDEN from mutation:
- `src/app.js`, `src/main.js`, `src/persistence.js`, `src/persistence-core.js`
- `src/event-repository.js`, `src/evidence-policy.js`, `src/fsrs-scheduler.js`
- `src/learning-contracts.js`, `src/schedule-gateway.js`
- `server/**`, `public/**`, `.github/**`
- `package.json`, `package-lock.json`
- `content-repo/**`
- All `docs/**` except the exact evidence path
- All non-allowlisted `src/**` and `tests/**`
- All authorization manifests
- All canonical governance docs

If another path becomes necessary: `STOP / ALLOWLIST_EXPANSION_REQUIRED`.

## Read-Only Dependencies
- `src/event-repository.js` — canonical P1-02 event schema, `buildLearningEventRecords`, `__testing.decisionPayload`
- `src/learning-contracts.js` — `learningContractDigest` (browser-safe FNV-1a64), `createActivitySpec`, `createRun`, `createAttempt`, `createReceipt`
- `src/schedule-gateway.js` — `buildCoreEvidenceEnvelope` (canonical envelope construction)
- `src/evidence-policy.js` — `decideEvidence` (canonical EvidenceDecision production)
- `src/persistence.js` — canonical event reader (read-only)

## Canonical RED Fixture Strategy

### Proven Fixture Construction
The canonical fixture MUST be constructed via existing production APIs, as proven in `tests/event-repository.test.mjs`:

```javascript
import { buildCoreEvidenceEnvelope } from '../src/schedule-gateway.js';
import { decideEvidence } from '../src/evidence-policy.js';
import { buildLearningEventRecords } from '../src/event-repository.js';

function canonicalFixture(suffix, { rating = 'good' } = {}) {
  const envelope = buildCoreEvidenceEnvelope({
    card: { id: `card-${suffix}`, senseId: `sense-${suffix}`, front: 'test', back: 'thử', type: 'word' },
    rating,
    step: { id: `activity-${suffix}`, kind: 'typing', skill: 'recall', receiptId: `receipt-${suffix}` },
    session: { id: `session-${suffix}`, mode: 'today', timezone: 'UTC' },
    now: 1_700_000_000_000
  });
  const decision = decideEvidence({
    attempt: envelope.attempt,
    activity: envelope.activitySpec,
    verification: envelope.verification
  });
  const records = buildLearningEventRecords({ ...envelope, decision });
  // The evidence-decided record:
  const evidenceDecided = records.find(r => r.eventType === 'evidence-decided');
  return { envelope, decision, records, evidenceDecided };
}
```

This produces a `canonical-learning-event` with:
- `kind: 'canonical-learning-event'`
- `schemaVersion: 1`
- `eventType: 'evidence-decided'`
- `payload` containing `decisionPayload` with fields: `eligible`, `affectsSchedule`, `successful`, `reason`, `rating`, `skill`, `target`, `policyVersion`, `decisionId`, `receiptBinding`, `receiptId`, `attemptId`, `activityId`

### RED Predicate
The predecessor `summarizeReviewQuality` does NOT understand canonical-learning-event records. It expects flat event properties (`event.rating`, `event.skill`, `event.assisted`) rather than nested canonical `event.payload.rating`, `event.payload.skill`, `event.payload.eligible`.

A valid test passes a canonical-learning-event record to `summarizeReviewQuality`. The predecessor CANNOT correctly project canonical evidence because it reads flat properties that don't exist on canonical records. The first assertion must demonstrate this gap (e.g., canonical eligible evidence-decided event not counted in denominator).

### Invalid RED (forbidden):
- Flat legacy fixture `{ rating, skill, evidenceType, metadata }`
- `ERR_MODULE_NOT_FOUND` / missing future export
- Syntax/dependency/infrastructure error
- Invented failure predecessor already satisfies

## Canonical Event Contract

### Required Implementation
The P7-00 metrics reducer MUST read canonical EvidenceDecision fields from:
- `event.payload.eligible`
- `event.payload.rating`
- `event.payload.skill`
- `event.payload.successful`
- `event.payload.reason`
- `event.payload.target`
- `event.payload.policyVersion`

And canonical event identity from:
- `event.kind === 'canonical-learning-event'`
- `event.schemaVersion`
- `event.eventType === 'evidence-decided'`
- `event.receiptId`
- `event.activitySpecId`
- `event.createdAt`

### Legacy Compatibility
Legacy flat events (`event.rating`, `event.skill`, `event.assisted`) in `summarizeReviewQuality` remain supported for existing callers. The P7-00 canonical projection is a SEPARATE code path that reads canonical records. Legacy counters remain `READ_ONLY_COMPARISON_ONE_RELEASE`.

## Production Pipeline Wiring
The P7-00 projection pipeline MUST be reachable through the authorized production seam:

```
canonical P1-02 events (from event-repository / persistence read-only)
  → src/p7-00-metrics-reducer.js (normalize + reduce)
  → src/weakness-profile.js (deterministic profile)
```

Both `src/p7-00-metrics-reducer.js` and `src/weakness-profile.js` MUST be imported and re-exported or called from `src/progress.js`, which is the authorized production seam.

Tests MUST prove the production seam reaches both modules.

Orphan files that are never imported are NOT implementation.

## Real Metrics — No Stubs
Every canonical metric domain MUST be either:

**A. Actually derived** from canonical evidence with real computation:
- numerator / denominator / timeframe / eligibility / sample size / provenance

**B. Explicitly `INSUFFICIENT_DATA`** with:
- reason code explaining why unavailable
- denominator / sample size (may be 0)
- timeframe where applicable
- provenance explaining data gap

### Forbidden patterns:
```javascript
// FORBIDDEN — placeholder constants
retrieval: 0,
delayedSuccess: 0,
coverage: 0,
stability: 0,
recurrence: 0,
contentCompletion: 0
```

An explicit zero is NOT equivalent to `INSUFFICIENT_DATA`. A metric returning `0` must mean "measured and the result is zero." A metric returning `INSUFFICIENT_DATA` means "cannot be computed from available canonical evidence."

### Required Metric Domains
For each of: retrieval, delayed success, coverage, stability, recurrence, content completion, active days:
- If canonical inputs exist and support the metric: compute deterministically.
- If canonical inputs are insufficient: return `{ status: 'INSUFFICIENT_DATA', reason: '<specific reason>', denominator: <n>, sampleSize: <n> }`.

## Duplicate / Out-of-Order / Timezone Semantics

### Duplicate Handling
Same logical canonical event replayed MUST NOT inflate denominators. Deduplication by `event.id` or `event.eventDigest`. Tests must prove: `reduce([A, B, A])` produces same result as `reduce([A, B])`.

### Out-of-Order Handling
Equivalent event sets in any order MUST yield identical deterministic projection. Tests must prove: `reduce([A, B, C])` equals `reduce([C, A, B])`.

### Timezone/DST
Day boundaries for `activeDays` and timeframe calculations must respect the canonical timezone from `event` or a supplied timezone parameter. Tests must prove: events near midnight UTC produce correct day assignment.

### Forbidden patterns:
```javascript
// FORBIDDEN — labels without behavior
duplicateHandling: 'kept',
timezone: 'UTC'
```

## WeaknessProfile Contract

### Required Fields
- `schemaVersion` (string, versioned)
- `taxonomyVersion` (string, versioned)
- `projectorVersion` (string, versioned)
- `canonicalInputRefs` (array of event identifiers)
- `denominator` (integer)
- `sampleSize` (integer)
- `timeframe` (string, e.g. `'all_time'` or ISO range)
- `reasonCodes` (array of strings, derived from evidence)
- `uncertainty` (string: `'high'` | `'medium'` | `'low'`, derived from evidence)
- `insufficientData` (boolean)
- `conflictHandling` (string, actual policy description)
- `inputDigest` (string, computed via `learningContractDigest`)
- `outputDigest` (string, computed via `learningContractDigest`)

### Determinism Invariant
Same canonical inputs + same taxonomy version + same projector version = same output.

### Evidence-Derived Values
- `reasonCodes`: MUST reflect actual canonical evidence analysis, not unconditional `['OK']`.
- `uncertainty`: MUST be derived from sample size, conflict state, and data completeness. Not unconditional `'low'`.
- `conflictHandling`: MUST describe actual conflict resolution policy applied, not unconditional `'latest_wins'`.

### Browser-Safe Digest
WeaknessProfile MUST use `learningContractDigest` from `src/learning-contracts.js` (FNV-1a64, browser-safe). MUST NOT use `node:crypto` or any Node.js-only API.

### Sparse/Conflicting Evidence
Sparse or conflicting evidence MUST NOT silently become: weak, mastered, ready, or band estimate.

## Migration/Rollback Contract

### Migration Evidence (exact required values)
The executor MUST verify and record ALL of:
- `NO_DESTRUCTIVE_MIGRATION`: no schema/storage/event-repository mutation
- `RAW_CANONICAL_EVENTS_UNCHANGED`: raw events remain immutable
- `PROJECTION_REBUILDABLE`: new projection is versioned and rebuildable from canonical events
- `LEGACY_COUNTERS_READ_ONLY_COMPARISON_ONE_RELEASE`: legacy counters are read-only, not canonical truth

### Rollback Evidence (exact required values)
The executor MUST verify and record ALL of:
- `DROP_OR_IGNORE_NEW_PROJECTION`: new projection cache can be safely dropped
- `RETAIN_RAW_CANONICAL_EVENTS`: raw canonical events survive rollback unchanged
- `RETAIN_LEGACY_COUNTERS`: existing legacy counters survive rollback unchanged
- `RETAIN_IMPLEMENTER_EVIDENCE`: evidence records survive rollback
- `NO_HISTORY_REWRITE`: rollback does not rewrite event history

### Forbidden Values
The following are FORBIDDEN as migration/rollback results:
- `IGNORED`
- `SKIPPED`
- `N/A`

## Execution Provenance

### Append-Only Mandate
The execution MUST be strictly append-only. The following are ABSOLUTELY FORBIDDEN during execution:
- `git reset --hard` (or any `git reset` that discards commits)
- `git commit --amend`
- `git rebase`
- `git push --force` or `git push --force-with-lease`
- Destructive reset of any kind
- History rewrite of any kind
- Empty/no-op commits
- Synthetic CI events (`workflow_dispatch`, manual rerun, Draft/Ready toggle)

### Recovery from Accidental Commit
If an accidental commit is made on the wrong branch or with wrong content: `STOP`. Do NOT repair by resetting history. A new recovery authorization is required.

## Natural RED Predicate
Given a frozen canonical P1-02 learning-event record (constructed via `buildLearningEventRecords` from a canonical envelope), the exact predecessor `summarizeReviewQuality` cannot correctly interpret nested `event.payload` fields and therefore cannot produce the required deterministic metrics projection with denominator, provenance, reason-code and uncertainty semantics.

## Test-First One-Shot Executor Topology
```
S0 → COMMIT A → NATURAL RED → RED CLASSIFICATION → COMMIT B → NATURAL GREEN → COMMIT C → HANDOFF → STOP
```

- **Commit A (test-only)**: May modify ONLY `tests/progress.test.mjs`. Direct parent `6b992ac5b4032974fb7c5638759f0f073ca0d327`. Source blobs must be unchanged. MUST construct canonical P1-02 fixture via `buildLearningEventRecords` (or equivalent canonical API) and pass resulting `evidence-decided` record to an EXISTING progress API. The FIRST failing assertion must be a behavioral failure demonstrating the predecessor cannot interpret canonical nested payload. Missing module/export/syntax/infra error is INVALID RED.
- **Commit B (minimal GREEN)**: May modify ONLY exact source allowlist. Tests immutable (blob equality with Commit A). Must consume canonical events via read-only dependencies. Must wire both new modules through `src/progress.js`. No persistence mutation. No `node:crypto`.
- **Commit C (implementer evidence)**: May modify ONLY evidence path. No source/test changes.

## RED Invalidation
RED is eligible only if ALL are true:
1. A direct parent = exact predecessor
2. A diff = exactly `tests/progress.test.mjs`
3. All source blobs unchanged from predecessor
4. Natural `pull_request` CI belongs to exact A
5. First product failure matches frozen canonical behavioral predicate (not missing module/syntax/infra)
6. Fixture is a real canonical P1-02 `evidence-decided` record (not flat legacy)
7. No baseline failure masquerading as RED
8. No weakened existing assertion

## Artifact Binding Policy
`ARTIFACT_EVIDENCE_REQUIRED`
- Required artifact name: `verification-output`
- Required at GREEN CI
- Exact future artifact ID must be observed
- Exact digest must be observed
- Artifact must bind to exact CI run/head
- Missing/mismatch = `STOP`

## Evidence Schema V2 and Bindings
- **Evidence Path**: `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-007-evidence.md`
- **Evidence Schema ID**: `W6_P7_00_WKN_EXEC_EVIDENCE_V2`
- **Authority Label**: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`

### Required fields and exact types:
| Field | Type | Value/Constraint |
|---|---|---|
| `schema_id` | string | `W6_P7_00_WKN_EXEC_EVIDENCE_V2` |
| `authority_label` | string | `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` |
| `authorization_id` | string | `W6-P7-00-WKN-AUTH-007` |
| `execution_record_id` | string | `W6-P7-00-WKN-EXEC-007` |
| `implementation_subject` | string | `P7-00 / WKN-00` |
| `exact_predecessor` | string | `6b992ac5b4032974fb7c5638759f0f073ca0d327` |
| `baseline_ci_workflow` | string | `CI` |
| `baseline_ci_run_number` | integer | `347` |
| `baseline_ci_run_id` | integer | `31603172459` |
| `commit_a_sha` | string | exact observed SHA |
| `commit_a_parent` | string | `6b992ac5b4032974fb7c5638759f0f073ca0d327` |
| `commit_a_changed_paths` | string | `tests/progress.test.mjs` |
| `commit_a_test_blob_ids` | string | exact Git blob identity |
| `red_ci_workflow` | string | `CI` |
| `red_ci_event` | string | `pull_request` |
| `red_ci_head_sha` | string | exact commit_a_sha |
| `red_ci_run_number` | integer | exact |
| `red_ci_run_id` | integer | exact |
| `red_ci_job_id` | integer | exact |
| `red_first_cause` | string | exact behavioral assertion text |
| `red_eligible` | boolean | `true` |
| `commit_b_sha` | string | exact observed SHA |
| `commit_b_parent` | string | exact commit_a_sha |
| `commit_b_changed_paths` | string | exact source paths changed |
| `immutable_test_blob_after_b` | string | exact blob ID, must equal commit_a blob |
| `green_ci_workflow` | string | `CI` |
| `green_ci_event` | string | `pull_request` |
| `green_ci_head_sha` | string | exact commit_b_sha |
| `green_ci_run_number` | integer | exact |
| `green_ci_run_id` | integer | exact |
| `green_ci_job_id` | integer | exact |
| `green_ci_conclusion` | string | `success` |
| `green_artifact_name` | string | `verification-output` |
| `green_artifact_id` | integer | exact |
| `green_artifact_digest` | string | exact SHA-256 |
| `canonical_fixture_identity` | string | exact fixture description |
| `canonical_fixture_construction` | string | API path used |
| `canonical_input_digest` | string | exact `learningContractDigest` |
| `metrics_output_digest` | string | exact `learningContractDigest` |
| `weakness_profile_output_digest` | string | exact `learningContractDigest` |
| `deterministic_replay_result` | string | `PASS` |
| `migration_result` | object | all four required migration values |
| `rollback_result` | object | all five required rollback values |
| `source_blob_bindings` | object | exact Git blob identities for each changed source |
| `unresolved_limitations` | string or array | `NONE` only if all requirements have evidence; otherwise exact list |
| `commit_c_parent` | string | exact commit_b_sha |
| `commit_c_changed_paths` | string | exactly evidence path |

### Commit-C SHA Binding Model
`commit_c_sha` is NOT required to self-embed inside Commit C bytes (circular reference is impossible).

The exact `commit_c_sha` is an EXTERNAL OBSERVED BINDING recorded:
1. In the executor handoff output
2. In raw Git evidence (`git rev-parse HEAD` after commit)
3. As the independent audit subject

The evidence file itself records `commit_c_parent` and `commit_c_changed_paths`. The audit verifies `commit_c_sha` externally by confirming it equals the PR head.

This convention is explicitly authorized by this manifest.

## Verification Commands
Focused RED/GREEN command:
```
node --test tests/progress.test.mjs
```

Full repository verification:
```
npm ci --no-audit --no-fund
npm run phase0:gate
```

## Canonical Acceptance Criteria Source
- **Path**: `docs/IMPLEMENTATION_PLAN.md`
- **Section**: Progress / metrics (canonical metrics reducer scope from AUTH-006)
- **Blob at predecessor**: `7a77a743ef70105362b1ad054896ea8c51644c2d`
- **Predecessor**: `6b992ac5b4032974fb7c5638759f0f073ca0d327`

## Acceptance Criteria Matrix
- numerator / denominator / timeframe / eligibility
- retrieval (or explicit INSUFFICIENT_DATA with reason)
- delayed success (or explicit INSUFFICIENT_DATA with reason)
- coverage (or explicit INSUFFICIENT_DATA with reason)
- stability (or explicit INSUFFICIENT_DATA with reason)
- recurrence (or explicit INSUFFICIENT_DATA with reason)
- content completion (or explicit INSUFFICIENT_DATA with reason)
- active days
- rebuild projection from canonical events
- deterministic replay
- duplicate events (deduplicated, not inflated)
- out-of-order events (same result)
- timezone/DST (correct day boundaries)
- empty data → explicit INSUFFICIENT_DATA
- sparse data → explicit uncertainty
- assisted vs independent (canonical payload.eligible)
- Core/IELTS/V10 reconciliation where canonical event target supports it
- fixture totals reconcile 100%
- every metric has denominator/timeframe/source drill-down
- mutable card counters are not canonical truth
- no inference of assistance from UI text
- explainable exclusions when surfaces differ
- WeaknessProfile digest determinism
- production pipeline wired through src/progress.js
- browser-safe (no node:crypto)

## Required Test Coverage (Commit A)
Tests must cover ALL of the following (within `tests/progress.test.mjs`):
1. Real canonical nested event shape (via `buildLearningEventRecords`)
2. Eligible vs ineligible evidence (`payload.eligible`)
3. Assisted/unqualified evidence separation
4. Numerator/denominator correctness
5. Empty data → `INSUFFICIENT_DATA`
6. Sparse data → explicit uncertainty
7. Duplicates deterministically deduplicated
8. Out-of-order events → same deterministic projection
9. Timezone/DST day boundary behavior
10. Active days computation
11. Same canonical inputs/version → same output (determinism)
12. Conflicting evidence → explicit conflict/uncertainty
13. WeaknessProfile input/output digest determinism
14. No fabricated zero for unavailable metrics
15. Production seam reaches both `p7-00-metrics-reducer` and `weakness-profile`

## Stop Conditions
Fail closed on:
- predecessor drift
- canonical status/dependency drift
- owner drift
- writer overlap (excluding FROZEN PR #61)
- implementation branch conflict
- allowlist expansion/insufficiency
- explicit exclusion violation
- dependency addition
- Natural RED seam not proven (non-canonical fixture)
- invalid RED first cause
- source before valid RED
- test blob mutation after A
- test weakening
- schema/storage/event-repository duplication
- canonical event mutation
- second metrics truth
- missing denominator/timeframe/provenance
- deterministic replay failure
- timezone/DST failure
- legacy counter canonicalization
- migration/rollback mismatch or IGNORED values
- evidence mismatch
- CI event/head/workflow mismatch
- missing CI job identity
- artifact mismatch
- AI canonical authority requirement
- FSRS mutation
- `node:crypto` in browser source
- orphan modules not wired through production seam
- stub/placeholder metrics
- destructive git operation (`git reset --hard`, amend, rebase, force-push)
- canonical acceptance conflict

## Evidence Truthfulness
`unresolved_limitations: NONE` may be used ONLY if every accepted requirement has fresh evidence. Otherwise the executor MUST list exact limitations. The evidence document MUST NOT claim `COMPLETE` if any mandatory evidence field is absent/unverified.

## Integration Rule
`MECHANICAL_INTEGRATION_PREAUTHORIZATION`: `NOT_GRANTED`

## Explicit Non-Goals
No second event truth, second Error Repository, second Today scheduler, FSRS tuning/mutation, P7-01 UI redesign, P7-02+, FCS/ASM/TD, readiness, band estimates, AI canonical authority, mock/personalization.

## Implementation Authorization State
- **Implementation authorization**: `NOT_ACTIVE_PENDING_INDEPENDENT_MANIFEST_ACCEPT`
- **Package acceptance**: `NOT_GRANTED`
- **Merge authority**: `NOT_GRANTED`
