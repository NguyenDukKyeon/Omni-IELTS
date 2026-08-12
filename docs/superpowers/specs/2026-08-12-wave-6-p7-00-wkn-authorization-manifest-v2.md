# W6-P7-00-WKN-AUTH-002: Wave 6 P7-00/WKN-00 Authorization Manifest

Authorization ID: `W6-P7-00-WKN-AUTH-002`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Artifact state: `DRAFT_AUTHORIZATION_CANDIDATE`

While unaudited:
IMPLEMENTATION AUTHORIZATION: `NOT_ACTIVE`
PACKAGE ACCEPTANCE: `NOT_GRANTED`
INDEPENDENT IMPLEMENTATION ACCEPTANCE: `NOT_GRANTED`
MERGE AUTHORITY: `NOT_GRANTED`

## Exact Predecessor
Exact Implementation Predecessor: `6b992ac5b4032974fb7c5638759f0f073ca0d327`
Baseline CI: CI #347 / `31603172459` / success

## Execution Record
Execution Record: `W6-P7-00-WKN-EXEC-002`
Canonical Owner: P7-00
Absorbed boundary: WKN-00
Writer Role: P7-00 / WKN-00 Bounded Implementer
Writer Mode: ONE_WRITER_EXCLUSIVE
Future implementation branch: `codex/p7-00-metrics-reducer`

## Exact Minimal Implementation Allowlist
- [NEW] `src/p7-00-metrics-reducer.js`
- [NEW] `src/weakness-profile.js`
- [NEW] `tests/p7-00-metrics.test.mjs`
- [NEW] `tests/weakness-profile.test.mjs`

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
Given a frozen canonical P1-02 learning-event fixture, the predecessor system cannot produce the required deterministic, versioned P7-00 metrics + WeaknessProfile contract containing the frozen denominator/provenance/reason/uncertainty semantics.

## Test-First One-Shot Executor Topology
S0 → A → RED → B → GREEN → C → HANDOFF → STOP

- **Commit A (test-only)**: May modify ONLY exact new P7-00/WKN test paths frozen by manifest. Natural exact-head pull_request CI required.
- **Commit B (minimal GREEN)**: May modify ONLY exact source allowlist frozen by manifest. Tests from Commit A immutable. Must make focused tests GREEN. Natural exact-head pull_request CI required.
- **Commit C (implementer evidence)**: May modify ONLY `docs/superpowers/specs/2026-08-12-wave-6-p7-00-wkn-exec-002-evidence.md`. Label inside evidence: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

## Verification Profile
Focused RED/GREEN command:
`node --test tests/p7-00-metrics.test.mjs tests/weakness-profile.test.mjs`

Full repository verification:
`npm ci --no-audit --no-fund`
`npm run phase0:gate`

Natural PR CI:
workflow: CI
workflow ID: 322561862
event: pull_request
Required exact-head conclusion: success

## Acceptance Criteria
1. Deterministic replay.
2. Duplicate input behavior.
3. Out-of-order input behavior.
4. Empty data.
5. Sparse data.
6. Qualified independent evidence.
7. Assisted/unqualified evidence exclusion.
8. Explicit denominator.
9. Explicit timeframe.
10. Source/provenance drilldown.
11. Core / IELTS / V10 reconciliation where applicable.
12. Mutable UI/card counters are NOT canonical source of truth.
13. Same canonical input/version produces same output.
14. Insufficient evidence produces uncertainty/insufficient-data, not fabricated weakness.
15. Conflicting evidence remains explicit.
16. No AI canonical authority.
17. No FSRS tuning.
18. Raw canonical events remain immutable.

## Migration / Rollback
raw canonical events immutable
projection additive
projection versioned
projection rebuildable
no destructive migration
no historical event rewrite
no synthetic evidence backfill

rollback:
disable/ignore the new projection
retain raw evidence/events
retain implementation evidence

## Stop Conditions
Fail closed on:
- predecessor drift;
- main drift that invalidates authorization identity;
- baseline CI invalid;
- canonical dependency/status drift;
- owner drift;
- writer overlap;
- open PR semantic/path overlap;
- allowlist expansion;
- dependency addition;
- database/schema expansion not frozen;
- Natural RED absent;
- invalid RED;
- source before valid RED;
- test weakening;
- evidence mismatch;
- CI wrong event/head/workflow;
- missing CI artifacts if required;
- deterministic replay failure;
- canonical event insufficiency;
- AI authority requirement;
- FSRS mutation requirement;
- second metrics truth requirement;
- unresolved architecture conflict.

## Integration Rule
MECHANICAL_INTEGRATION_PREAUTHORIZATION: `NOT_GRANTED`
