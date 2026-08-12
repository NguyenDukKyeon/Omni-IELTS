# W6-P7-00-WKN-AUTH-006: Wave 6 P7-00/WKN-00 Authorization Manifest

Authorization ID: `W6-P7-00-WKN-AUTH-006`
Execution Record: `W6-P7-00-WKN-EXEC-006`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Artifact state: `DRAFT_AUTHORIZATION_CANDIDATE`

While unaudited:
IMPLEMENTATION AUTHORIZATION: `NOT_ACTIVE`
PACKAGE ACCEPTANCE: `NOT_GRANTED`
INDEPENDENT IMPLEMENTATION ACCEPTANCE: `NOT_GRANTED`
MERGE AUTHORITY: `NOT_GRANTED`

## Protocol Mandatory-Field Matrix
| Protocol field | Frozen value/source |
|---|---|
| 1. wave/package identity | W6-P7-00-WKN-EXEC-006 (P7-00/WKN-00) |
| 2. canonical owner | P7-00 |
| 3. exact predecessor | `6b992ac5b4032974fb7c5638759f0f073ca0d327` |
| 4. dependency state | explicitly frozen (see section) |
| 5. writer identity | P7-00 / WKN-00 Bounded Implementer |
| 6. writer exclusivity | ONE_WRITER_EXCLUSIVE |
| 7. implementation branch topology | explicitly frozen (see section) |
| 8. implementation PR topology | explicitly frozen (see section) |
| 9. exact source allowlist | explicitly frozen (see section) |
| 10. exact test allowlist | explicitly frozen (see section) |
| 11. explicit path exclusions | explicitly frozen (see section) |
| 12. baseline CI identity | explicitly frozen (see section) |
| 13. test-first rule | expressly required (Commit A is test-only) |
| 14. Natural RED predicate | explicitly frozen (see section) |
| 15. RED invalidation predicates | explicitly frozen (see section) |
| 16. minimal GREEN boundary | explicitly frozen (see section) |
| 17. exact verification commands | explicitly frozen (see section) |
| 18. evidence path | `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-006-evidence.md` |
| 19. evidence file allowlist | exact evidence path only |
| 20. evidence schema/version | `W6_P7_00_WKN_EXEC_EVIDENCE_V1` |
| 21. evidence authority label | `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` |
| 22. implementation-subject binding | explicitly frozen in schema (`P7-00 / WKN-00`) |
| 23. Commit A/B/C binding predicates | explicitly frozen in schema |
| 24. RED CI binding | explicitly frozen in schema |
| 25. GREEN CI binding | explicitly frozen in schema |
| 26. artifact binding policy | explicitly frozen (see section) |
| 27. migration obligations | explicitly frozen (see section) |
| 28. rollback obligations | explicitly frozen (see section) |
| 29. stop conditions | explicitly frozen (see section) |
| 30. integration rule | `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED` |
| 31. canonical acceptance-criteria source | explicitly frozen (see section) |

## Dependency State
P7-00: NEXT
P1-02: ACCEPTED
P1-08: ACCEPTED

Dependency predicate:
P7-00 execution is authorized only while both P1-02 and P1-08 remain canonically ACCEPTED and P7-00 remains NEXT at execution Stage 0.
Canonical status document: `docs/IMPLEMENTATION_STATUS.md`
Git blob SHA at predecessor: `e7de22191b6ce320edab0b36d34c2ff9efecde5c`

## Writer Identity
Writer Role: P7-00 / WKN-00 Bounded Implementer
Writer Mode: ONE_WRITER_EXCLUSIVE
No second writer may mutate the same semantic/path boundary. Open-PR/path overlap at Stage 0 = STOP / WRITER_OR_PATH_OVERLAP.

## Exact Implementation Branch / PR Topology
Implementation branch: `codex/p7-00-metrics-reducer`
Branch origin: MUST be created directly from `6b992ac5b4032974fb7c5638759f0f073ca0d327`. No rebase, no alternate parent, no merge-from-main, no branch reuse if pre-existing incompatible history exists.
Exactly ONE implementation PR.
PR target/base: `main`
PR state during execution: `DRAFT`
Commit lineage: predecessor → Commit A test-only → Commit B minimal GREEN → Commit C evidence-only
Commit A parent MUST equal exact predecessor.
Commit B parent MUST equal Commit A.
Commit C parent MUST equal Commit B.
The same implementation PR receives natural pull_request/synchronize CI for A, B and C. No second PR, no alternate branch, no Ready transition, no merge by executor.

## Exact Implementation File Allowlist
### Mutation Allowlist
SOURCE:
- [MODIFY] `src/progress.js`
- [NEW] `src/p7-00-metrics-reducer.js`
- [NEW] `src/weakness-profile.js`

TEST:
- [MODIFY] `tests/progress.test.mjs`

### Read-Only Dependencies
The following existing infrastructure paths may be imported and consumed for canonical events but MUST NOT be modified:
- `src/event-repository.js`
- `src/persistence.js`
(persistence provides `listLearningEvents()`; event-repository owns canonical event schema/truth).

## Explicit File / Path Exclusions
The following paths are EXPLICITLY FORBIDDEN from mutation during this authorization:
- `src/app.js`
- `src/main.js`
- `src/persistence.js`
- `src/event-repository.js`
- `src/persistence-core.js`
- `src/evidence-policy.js`
- `src/fsrs-scheduler.js`
- `server/**`
- `public/**`
- `.github/**`
- `package.json`
- `package-lock.json`
- `content-repo/**`
- all non-allowlisted `src/**`
- all non-allowlisted `tests/**`
- all canonical governance docs
- all historical AUTH manifests
- all `docs/**` during implementation EXCEPT the exact evidence path authorized for Commit C.

## Semantic Boundary & Canonical Metrics Contract
Authorize only: canonical P1-02 qualified events → deterministic P7-00 metrics projection → deterministic versioned WeaknessProfile.

Required metrics contract includes where supported by events:
- numerator, denominator, timeframe, eligibility, sample size, source/provenance drilldown;
- retrieval, delayed success, coverage, stability, recurrence, content completion, active days;
- duplicate handling, out-of-order replay, timezone/DST;
- empty/sparse dataset handling;
- assisted vs independent separation;
- Core/IELTS/V10 reconciliation where applicable.
If a metric lacks sufficient canonical input: return explicit `INSUFFICIENT_DATA` with reason/provenance. Do NOT fabricate metrics.

WeaknessProfile must include:
- schema/profile version;
- taxonomy version;
- projector version;
- canonical input references;
- denominator, sample size, timeframe/recency;
- reason codes;
- uncertainty, insufficient-data state;
- contradiction/conflict handling;
- input digest, output digest.
Invariant: same canonical inputs + same taxonomy/projector versions = same output.

Explicit Non-Goals:
No second event truth, second Error Repository, second Today scheduler, FSRS tuning, P7-01 UI redesign, P7-02+, FCS/ASM/TD, readiness, band estimates, AI canonical authority.

## Exact Predecessor & Baseline CI
Exact Implementation Predecessor: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
Baseline CI: workflow CI (ID 322561862), event push, run `#347`, run ID `31603172459`, conclusion success.

## Natural RED Predicate
Given a frozen canonical P1-02 learning-event fixture, the exact predecessor cannot produce the required deterministic, versioned P7-00 metrics + WeaknessProfile contract containing denominator, provenance, reason-code and uncertainty semantics.

## Test-First One-Shot Executor Topology
S0 → COMMIT A → NATURAL RED → RED CLASSIFICATION → COMMIT B → NATURAL GREEN → COMMIT C → HANDOFF → STOP

- **Commit A (test-only)**: May modify ONLY `tests/progress.test.mjs`. Direct parent `6b992ac5b4032974fb7c5638759f0f073ca0d327`. Source blobs must be unchanged. MUST call an EXISTING progress API (e.g., `summarizeReviewQuality`) with a valid canonical P1-02 event fixture. The FIRST failing assertion must be a behavioral failure (e.g., event not counted, missing denominator/provenance). Assertions for new future exports may appear only AFTER that behavioral assertion. Missing module/export is an INVALID RED for the first cause.
- **Commit B (minimal GREEN)**: May modify ONLY exact source allowlist (`src/progress.js`, `src/p7-00-metrics-reducer.js`, `src/weakness-profile.js`). Tests immutable. Must consume canonical events via read-only dependencies without modifying persistence.
- **Commit C (implementer evidence)**: May modify ONLY `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-006-evidence.md`.

## RED Invalidation
RED is eligible only if ALL are true:
- A direct parent = exact predecessor;
- A diff = exact test-only allowlist;
- source blobs unchanged from predecessor;
- natural pull_request CI belongs to exact A;
- first product failure matches frozen behavioral predicate (not missing module/syntax/infra);
- no baseline failure;
- no weakened existing assertion.

## Artifact Binding Policy
ARTIFACT_EVIDENCE_REQUIRED
- Required artifact names: `verification-output`
- RED/GREEN stage applicability: Required at GREEN CI.
- exact future artifact ID must be observed
- exact digest must be observed
- artifact must bind to exact CI run/head
- missing/digest mismatch = STOP

## Evidence Schema and Bindings
Evidence Path: `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-006-evidence.md`
Evidence Schema ID: `W6_P7_00_WKN_EXEC_EVIDENCE_V1`
Authority Label: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`

Required fields:
- `schema_id`: `W6_P7_00_WKN_EXEC_EVIDENCE_V1`
- `authority_label`: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`
- `authorization_id`: `W6-P7-00-WKN-AUTH-006`
- `execution_record_id`: `W6-P7-00-WKN-EXEC-006`
- `implementation_subject`: `P7-00 / WKN-00`
- `exact_predecessor`: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
- `baseline_ci_workflow`: `CI`
- `baseline_ci_run_number`: `347`
- `baseline_ci_run_id`: `31603172459`
- `commit_a_sha`: exact observed SHA
- `commit_a_parent`: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
- `commit_a_changed_paths`: exact frozen test allowlist
- `commit_a_test_blob_sha256_or_git_blob_ids`: exact Git blob identities for tests
- `red_ci_workflow`: `CI`
- `red_ci_event`: `pull_request`
- `red_ci_head_sha`: commit_a_sha
- `red_ci_run_number`: exact run number
- `red_ci_run_id`: exact run ID
- `red_ci_job_id`: exact job ID
- `red_first_cause`: exact frozen behavioral RED classification
- `red_eligible`: `true`
- `commit_b_sha`: exact observed SHA
- `commit_b_parent`: commit_a_sha
- `commit_b_changed_paths`: only exact frozen source allowlist
- `immutable_test_blob_bindings_after_b`: prove Commit A tests unchanged
- `green_ci_workflow`: `CI`
- `green_ci_event`: `pull_request`
- `green_ci_head_sha`: commit_b_sha
- `green_ci_run_number`: exact run number
- `green_ci_run_id`: exact run ID
- `green_ci_job_id`: exact job ID
- `green_ci_conclusion`: `success`
- `canonical_fixture_identity`: exact fixture identity
- `canonical_input_digest`: exact digest
- `metrics_output_digest`: exact output digest
- `weakness_profile_output_digest`: exact output digest
- `deterministic_replay_result`: `PASS`
- `migration_result`: `NO_DESTRUCTIVE_MIGRATION` and exact behavior
- `rollback_result`: exact rollback semantics verified
- `source_blob_bindings`: exact Git blob identity for changed sources
- `unresolved_limitations`: `NONE` or exact limitations
- `commit_c_sha`: exact observed SHA
- `commit_c_parent`: commit_b_sha
- `commit_c_changed_paths`: exactly evidence path

## Verification Commands
Focused RED/GREEN command:
`node --test tests/progress.test.mjs`

Full repository verification:
`npm ci --no-audit --no-fund`
`npm run phase0:gate`

## Canonical Acceptance Criteria Source
Canonical source path: `docs/IMPLEMENTATION_PLAN.md`
Canonical source section: `### P7-00 — Canonical learning metrics reducer`
Canonical source blob at predecessor: `7a77a743ef70105362b1ad054896ea8c51644c2d`
Predecessor: `6b992ac5b4032974fb7c5638759f0f073ca0d327`

Canonical source wins on conflict.

## Acceptance Criteria Matrix
- numerator / denominator / timeframe / eligibility;
- retrieval;
- delayed success;
- coverage;
- stability;
- recurrence;
- content completion;
- active days;
- rebuild projection from canonical events;
- deterministic replay;
- duplicate events;
- out-of-order events;
- timezone/DST;
- empty data;
- sparse data;
- assisted vs independent;
- Core/IELTS/V10 totals;
- fixture totals reconcile 100%;
- every metric has denominator/timeframe/source drill-down;
- mutable card counters are not canonical truth;
- no inference of assistance from UI text;
- explainable exclusions when surfaces differ.

## Migration / Rollback
raw events unchanged
projection version/cache rebuild
**legacy counters read-only comparison one release**
no legacy counter may become canonical truth
no destructive migration
no historical event rewrite
no synthetic evidence backfill

rollback:
drop / ignore the new projection cache only
retain raw canonical events unchanged
retain existing legacy counters unchanged
retain evidence records
rollback MUST NOT rewrite event history.

## Stop Conditions
Fail closed on:
- predecessor drift;
- canonical status/dependency drift;
- owner drift;
- writer overlap;
- implementation branch conflict;
- open PR semantic overlap;
- path overlap;
- allowlist expansion/insufficiency;
- explicit exclusion violation;
- dependency addition;
- Natural RED seam not proven;
- invalid RED first cause;
- source before valid RED;
- test blob mutation after A;
- test weakening;
- schema/storage/event-repository duplication;
- canonical event mutation;
- second metrics truth;
- missing denominator/timeframe/provenance;
- deterministic replay failure;
- timezone/DST failure;
- legacy counter canonicalization;
- migration/rollback mismatch;
- evidence mismatch;
- CI event/head/workflow mismatch;
- missing CI job identity;
- artifact mismatch;
- AI canonical authority requirement;
- FSRS mutation;
- canonical acceptance conflict.

## Integration Rule
MECHANICAL_INTEGRATION_PREAUTHORIZATION: `NOT_GRANTED`
