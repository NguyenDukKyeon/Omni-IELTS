# W6-P7-00-WKN-AUTH-003: Wave 6 P7-00/WKN-00 Authorization Manifest

Authorization ID: `W6-P7-00-WKN-AUTH-003`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Artifact state: `DRAFT_AUTHORIZATION_CANDIDATE`

While unaudited:
IMPLEMENTATION AUTHORIZATION: `NOT_ACTIVE`
PACKAGE ACCEPTANCE: `NOT_GRANTED`
INDEPENDENT IMPLEMENTATION ACCEPTANCE: `NOT_GRANTED`
MERGE AUTHORITY: `NOT_GRANTED`

## Exact Predecessor
Exact Implementation Predecessor: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
Baseline CI: CI #347 / run `31603172459` / success

## Execution Record
Execution Record: `W6-P7-00-WKN-EXEC-003`
Canonical Owner: P7-00
Absorbed boundary: WKN-00
Writer Role: P7-00 / WKN-00 Bounded Implementer
Writer Mode: ONE_WRITER_EXCLUSIVE
Future implementation branch: `codex/p7-00-metrics-reducer`

## Exact Implementation File Allowlist
- [NEW] `src/p7-00-metrics-reducer.js`
- [NEW] `src/weakness-profile.js`
- [NEW] `tests/p7-00-metrics.test.mjs`
- [NEW] `tests/weakness-profile.test.mjs`

## Explicit File / Path Exclusions
ABSENCE FROM ALLOWLIST IS NOT THE ONLY CONTROL; THE ABOVE EXCLUSIONS ARE EXPLICITLY FROZEN.
The following paths are EXPLICITLY FORBIDDEN from mutation during this authorization:
- `src/main.js`
- `src/persistence.js`
- `src/persistence-core.js`
- `src/evidence-policy.js`
- `src/fsrs-scheduler.js`
- `src/progress.js`
- `server/**`
- `public/**`
- `.github/**`
- `package.json`
- `package-lock.json`
- `content-repo/**`
- `docs/ROADMAP.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/DECISIONS.md`
- AUTH-001 historical manifest (`docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-authorization-manifest.md`)
- AUTH-002 historical manifest (`docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-authorization-manifest-v2.md`)
- all authorization files other than AUTH-003 itself during authoring
- all `src/**` paths not literally in the exact implementation allowlist
- all `tests/**` paths not literally in the exact test allowlist
- all `docs/**` during implementation EXCEPT the single exact evidence path authorized for Commit C (`docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-003-evidence.md`)

## Semantic Boundary
Authorize only: canonical qualified learning evidence/events → deterministic metrics reducer → deterministic WeaknessProfile projection

Required metrics contract includes where applicable:
- numerator;
- denominator;
- timeframe;
- eligibility;
- sample size;
- provenance/source drilldown;
- duplicate handling;
- out-of-order replay;
- sparse/empty state;
- assisted vs independent separation;
- deterministic rebuild.

WeaknessProfile must include:
- schema/profile version;
- taxonomy version;
- projector version;
- canonical input references;
- denominator;
- sample size;
- timeframe/recency;
- reason codes;
- uncertainty;
- insufficient-data state;
- contradiction/conflict handling;
- input digest;
- output digest.

Invariant: same canonical inputs + same taxonomy version + same projector version = same WeaknessProfile output

## Explicit Non-Goals
NO:
- P7-01 Honest Progress implementation
- P7-02 GoalProfile
- P7-03 calibration implementation
- P7-04 workload recommender
- P7-05 personalization
- FCS-00, FCS-01, FCS-02, ASM-00, TD-00
- readiness, IELTS band estimate, Mini-mock, full mock, personalization experiment, FSRS parameter tuning
- second Today scheduler, second Error Repository, second canonical metrics truth
- AI-generated canonical WeaknessProfile
- AI authority over: evidence, weakness, mastery, readiness

## Natural RED Predicate
Given a frozen canonical P1-02 learning-event fixture, the exact predecessor cannot produce the required deterministic, versioned P7-00 metrics + WeaknessProfile contract containing the frozen denominator, provenance, reason-code and uncertainty semantics.

## Test-First One-Shot Executor Topology
S0 → COMMIT A → NATURAL RED → RED CLASSIFICATION → COMMIT B → NATURAL GREEN → COMMIT C → HANDOFF → STOP

- **Commit A (test-only)**: May modify ONLY exact new P7-00/WKN test paths frozen by manifest. Direct parent must be `6b992ac5b4032974fb7c5638759f0f073ca0d327`. Source blobs must be unchanged.
- **Commit B (minimal GREEN)**: May modify ONLY exact source allowlist frozen by manifest. Tests from Commit A immutable. Must make focused tests GREEN.
- **Commit C (implementer evidence)**: May modify ONLY `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-003-evidence.md`. Evidence-only.

## RED Invalidation
RED is eligible only if ALL are true:
- A direct parent = exact predecessor;
- A diff = exact test-only allowlist;
- source blobs unchanged from predecessor;
- natural pull_request CI belongs to exact A;
- first product failure matches frozen behavioral predicate;
- no baseline failure;
- no syntax/import/dependency/infrastructure failure;
- no weakened existing assertion.

## Evidence Schema and Bindings
Evidence Path: `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-003-evidence.md`
Evidence Schema ID: `W6_P7_00_WKN_EXEC_EVIDENCE_V1`
Authority Label: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`

Future observed SHA/run/job values must be populated by the executor. Every value must be read back from Git/GitHub. Missing or mismatched values equal failure. No unknown/TBD values.

Required fields:
- `schema_id`: `W6_P7_00_WKN_EXEC_EVIDENCE_V1`
- `authority_label`: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`
- `authorization_id`: `W6-P7-00-WKN-AUTH-003`
- `execution_record_id`: `W6-P7-00-WKN-EXEC-003`
- `implementation_subject`: `P7-00 / WKN-00`
- `exact_predecessor`: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
- `baseline_ci_workflow`: `CI`
- `baseline_ci_run_number`: `347`
- `baseline_ci_run_id`: `31603172459`
- `commit_a_sha`: the exact observed SHA of the immutable test-only Commit A
- `commit_a_parent`: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
- `commit_a_changed_paths`: the exact frozen test allowlist and no other path
- `commit_a_test_blob_sha256_or_git_blob_ids`: exact immutable Git blob identities for every test path after Commit A
- `red_ci_workflow`: `CI`
- `red_ci_event`: `pull_request`
- `red_ci_head_sha`: commit_a_sha
- `red_ci_run_number`: exact observed natural RED run number
- `red_ci_run_id`: exact observed natural RED run ID
- `red_ci_job_id`: exact observed test job ID
- `red_first_cause`: exact frozen behavioral RED classification
- `red_eligible`: `true`
- `commit_b_sha`: exact observed SHA of minimal GREEN Commit B
- `commit_b_parent`: commit_a_sha
- `commit_b_changed_paths`: only the exact frozen source allowlist
- `immutable_test_blob_bindings_after_b`: prove all Commit A test blobs unchanged at Commit B
- `green_ci_workflow`: `CI`
- `green_ci_event`: `pull_request`
- `green_ci_head_sha`: commit_b_sha
- `green_ci_run_number`: exact observed natural GREEN run number
- `green_ci_run_id`: exact observed natural GREEN run ID
- `green_ci_job_id`: exact observed GREEN test job ID
- `green_ci_conclusion`: `success`
- `canonical_fixture_identity`: exact fixture/test identity used for P7-00/WKN behavioral proof
- `canonical_input_digest`: deterministic digest of the frozen canonical input fixture
- `metrics_output_digest`: deterministic output digest
- `weakness_profile_output_digest`: deterministic output digest
- `deterministic_replay_result`: `PASS` with exact command/result identity
- `migration_result`: `NO_DESTRUCTIVE_MIGRATION` and any exact additive projection behavior
- `rollback_result`: exact rollback semantics verified
- `source_blob_bindings`: exact Git blob identity for every changed source file at Commit B
- `unresolved_limitations`: `NONE` or exact unresolved limitations
- `commit_c_sha`: exact evidence-only Commit C SHA
- `commit_c_parent`: commit_b_sha
- `commit_c_changed_paths`: exactly `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-003-evidence.md`

## Verification Commands
Focused RED/GREEN command:
`node --test tests/p7-00-metrics.test.mjs tests/weakness-profile.test.mjs`

Full repository verification:
`npm ci --no-audit --no-fund`
`npm run phase0:gate`

## Acceptance Criteria
1. deterministic replay;
2. duplicate handling;
3. out-of-order handling;
4. empty dataset;
5. sparse dataset;
6. qualified independent evidence;
7. assisted/unqualified separation;
8. numerator/denominator;
9. timeframe;
10. provenance/source drilldown;
11. Core/IELTS/V10 reconciliation where applicable;
12. mutable UI counters never canonical truth;
13. same input/version => same output;
14. insufficient evidence => explicit uncertainty;
15. conflicting evidence explicit;
16. no AI canonical authority;
17. no FSRS tuning;
18. raw canonical events immutable.

## Migration / Rollback
raw canonical events immutable
projection additive
projection versioned
projection rebuildable
no destructive migration
history rewrite is forbidden
synthetic evidence backfill is forbidden

rollback:
disable/ignore new projection
retain canonical raw events/evidence
retain implementation evidence

## Stop Conditions
Fail closed on:
- predecessor drift;
- canonical status/dependency drift;
- owner drift;
- writer overlap;
- implementation branch conflict;
- open PR semantic overlap;
- path overlap;
- allowlist expansion;
- explicit exclusion violation;
- dependency addition;
- schema/storage expansion;
- Natural RED absent;
- invalid RED;
- source before valid RED;
- test mutation after A;
- test weakening;
- CI event/head/workflow mismatch;
- missing CI job identity;
- missing required artifact;
- evidence schema mismatch;
- missing evidence field;
- input/output digest mismatch;
- deterministic replay failure;
- raw event mutation;
- AI authority requirement;
- FSRS mutation requirement;
- second metrics truth requirement;
- unresolved canonical conflict.

## Integration Rule
MECHANICAL_INTEGRATION_PREAUTHORIZATION: `NOT_GRANTED`
