# W6-P7-00-WKN-AUTH-004: Wave 6 P7-00/WKN-00 Authorization Manifest

Authorization ID: `W6-P7-00-WKN-AUTH-004`
Execution Record: `W6-P7-00-WKN-EXEC-004`
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
| 1. wave/package identity | W6-P7-00-WKN-EXEC-004 (P7-00/WKN-00) |
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
| 18. evidence path | `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-004-evidence.md` |
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
The same implementation PR receives natural pull_request/synchronize CI for A, B and C. No second implementation PR, no alternate implementation branch, no Ready transition, no merge during executor role.

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
- historical AUTH-001/AUTH-002/AUTH-003 manifests
- all authorization files other than AUTH-004 itself during authoring
- all `src/**` paths not literally in the exact implementation allowlist
- all `tests/**` paths not literally in the exact test allowlist
- all `docs/**` during implementation EXCEPT the single exact evidence path authorized for Commit C (`docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-004-evidence.md`)

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

## Exact Predecessor & Baseline CI
Exact Implementation Predecessor: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
Baseline CI: workflow CI (ID 322561862), event push, run `#347`, run ID `31603172459`, conclusion success.

## Natural RED Predicate
Given a frozen canonical P1-02 learning-event fixture, the exact predecessor cannot produce the required deterministic, versioned P7-00 metrics + WeaknessProfile contract containing the frozen denominator, provenance, reason-code and uncertainty semantics.

## Test-First One-Shot Executor Topology
S0 → COMMIT A → NATURAL RED → RED CLASSIFICATION → COMMIT B → NATURAL GREEN → COMMIT C → HANDOFF → STOP

- **Commit A (test-only)**: May modify ONLY exact new P7-00/WKN test paths frozen by manifest. Direct parent must be `6b992ac5b4032974fb7c5638759f0f073ca0d327`. Source blobs must be unchanged.
- **Commit B (minimal GREEN)**: May modify ONLY exact source allowlist frozen by manifest. Tests from Commit A immutable. Must make focused tests GREEN.
- **Commit C (implementer evidence)**: May modify ONLY `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-004-evidence.md`. Evidence-only.

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

## Artifact Binding Policy
ARTIFACT_EVIDENCE_REQUIRED
- Required artifact names: `verification-output`
- RED/GREEN stage applicability: Required at GREEN CI.
- exact future artifact ID must be observed
- exact digest must be observed
- artifact must bind to exact CI run/head
- missing/digest mismatch = STOP

## Evidence Schema and Bindings
Evidence Path: `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-004-evidence.md`
Evidence Schema ID: `W6_P7_00_WKN_EXEC_EVIDENCE_V1`
Authority Label: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`

Future observed SHA/run/job values must be populated by the executor. Every value must be read back from Git/GitHub. Missing or mismatched values equal failure. No unknown/TBD values.

Required fields:
- `schema_id`: `W6_P7_00_WKN_EXEC_EVIDENCE_V1`
- `authority_label`: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`
- `authorization_id`: `W6-P7-00-WKN-AUTH-004`
- `execution_record_id`: `W6-P7-00-WKN-EXEC-004`
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
- `commit_c_changed_paths`: exactly `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-004-evidence.md`

## Verification Commands
Focused RED/GREEN command:
`node --test tests/p7-00-metrics.test.mjs tests/weakness-profile.test.mjs`

Full repository verification:
`npm ci --no-audit --no-fund`
`npm run phase0:gate`

## Canonical Acceptance Criteria Source
Canonical source path: `docs/IMPLEMENTATION_PLAN.md`
Canonical source section: `### P7-00 — Canonical learning metrics reducer`
Canonical source blob at predecessor: `7a77a743ef70105362b1ad054896ea8c51644c2d`
Predecessor: `6b992ac5b4032974fb7c5638759f0f073ca0d327`

The manifest's acceptance matrix is a bounded executable restatement. It does NOT replace, weaken or supersede the canonical source. On conflict, canonical source wins and executor STOPS.

## Acceptance Criteria Matrix
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
- artifact-policy violation;
- missing artifact/digest mismatch when required;
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
