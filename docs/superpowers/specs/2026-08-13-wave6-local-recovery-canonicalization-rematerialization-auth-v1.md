# Wave 6 Local Recovery — Canonicalization and Prospective Rematerialization Authorization V1

Status: `DOCS_ONLY_AUTHORIZATION_CANDIDATE / NOT_SELF_ACCEPTING`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Exact predecessor: `66666172238668b1ea40d7ff596c82c209fcdfe5`

## Purpose

Prospectively authorize clean rematerialization of the preserved local Wave 6 implementation after the
owner/boundary changes in this docs-only canonicalization candidate are independently accepted and merged. This manifest never retroactively
classifies the dirty local working tree as authorized implementation.

Preserved recovery input:
- uploaded archive SHA-256: `0bb3c8eaa52fcf175f4ebb7b2e814c4add761a7d0bdef2b043dc72173c679bcc`;
- local repository HEAD: `66666172238668b1ea40d7ff596c82c209fcdfe5`;
- branch label in archive: `recovery/wave6-local-accept-20260813`;
- tracked binary patch SHA-256: `5f2d7008d51682a44f4bab87b08a5ad7e8d3b19b304f0e54c1af7d723dc797b`;
- tracked changed paths: 16; candidate Wave 6 untracked implementation/test paths: 9.

PR #66 package dependency:
- exact accepted P7-00/WKN-00 head: `9b8aeb3c92f577857caffcb218f6fd9ddebf022a`;
- independent implementation ACCEPT: comment `5275718552`;
- independent package audit: review `4928369301`;
- final natural CI: #369 / run `31662048839` / SUCCESS;
- merge authority: NOT_GRANTED.

## Global rules

- One writer at a time.
- No dirty-tree chronology is reused as RED/GREEN evidence.
- No cherry-pick of historical rejected Wave 6 candidates.
- Test-first A, natural behavioral RED, source-only B, GREEN, evidence-only C per record.
- Exact-head natural CI required at A/B/C where frozen below.
- Tests may not be weakened after A.
- No dependency, CI, runtime or persistence layer beyond the exact record allowlists.
- No amend/rebase/squash/force-push/history rewrite/no-op event manufacture.
- Executor cannot accept its own implementation.
- Independent auditor may reject one record without accepting another.

## Record 1 — W6-P7-00-WKN-SUCC-001

Owner: `P7-00`.
Dependency: exact package-accepted PR #66 semantics; execution must not begin while that dependency is
ambiguous. If PR #66 remains unmerged, the execution topology must explicitly preserve its accepted
semantics without claiming that the local divergent bytes inherit acceptance.

Test A allowlist:
- `tests/progress.test.mjs`

Source B allowlist:
- `src/progress.js`
- `src/p7-00-metrics-reducer.js`
- `src/weakness-profile.js`

Required natural RED: a predecessor/accepted-PR66 behavioral contract must fail because the richer
canonical WeaknessProfile projection required by the canonical recovery addendum is absent; missing-module/syntax/fixture/CI
failures are invalid RED.

GREEN: deterministic profile with exact canonical provenance, observations by skill, sparse/conflict
uncertainty and no readiness/band/mastery claim; raw events unchanged.

## Record 2 — W6-FCS-00-01-001

Owner: `P1-07 Today Composer` bounded Wave 6 Focus seam.
Dependencies: accepted Record 1 + P1-07/P1-08.

Test A allowlist:
- `tests/wave6-focus-today.test.mjs`
- `tests/today-composer.test.mjs`
- `tests/today-containment.test.mjs`
- `scripts/browser-smoke.mjs` only if browser behavior must be frozen before source mutation.

Source B allowlist:
- `src/focus-selector.js`
- `src/today-composer.js`
- `src/today-planner-v2.js`

GREEN requirements: deterministic Focus selection; one slot; due-first; bounded remaining budget;
accepted executor only; durable exact binding/resume; tamper rejection before executor effects; no provider
call; no second scheduler; no P7-04 workload optimization.

## Record 3 — W6-ASM-00-001

Owner: `ASM-00`.
Dependencies: accepted LI-00 and QAR-00 package semantics.

Test A allowlist:
- `tests/wave6-frozen-assessment.test.mjs`
- `tests/qar-00-question-activity-contracts.test.mjs`
- `tests/ielts-persistence.test.mjs`
- `tests/backup-registry.test.mjs`
- `tests/migration-ledger.test.mjs`
- `tests/restore-safety.test.mjs`

Source B allowlist:
- `src/frozen-assessment-contracts.js`
- `src/frozen-assessment-runtime.js`
- `src/question-activity-contracts.js`
- `src/ielts-domain.js`
- `src/ielts-persistence.js`
- `src/backup-registry.js`

GREEN requirements: immutable authenticated blueprint/run; exact QAR scoring snapshot; atomic completion;
replay/collision rules; additive durable store; backup/restore/reopen; hostile data fencing; public raw aggregate
only; no evidence/schedule/readiness/band/mastery authority.

## Record 4 — W6-TD-00-001

Owner: `TD-00`.
Dependencies: accepted Record 1 + accepted Record 3.

Test A allowlist:
- `tests/wave6-targeted-diagnostic.test.mjs`
- `scripts/browser-smoke.mjs` only for exact TD/Frozen production-path smoke assertions not already owned by Record 2.

Source B allowlist:
- `src/targeted-diagnostic.js`

TD may read but not mutate WeaknessProfile, QAR and Frozen Assessment owner modules.

GREEN requirements: deterministic weakness-biased selection; minimum two observed weak skills and two
authentic supported questions per selected skill; caller-order independence; hostile-input fencing; Frozen
blueprint/replay/backup compatibility; no second durable store; explicit non-representative/no-claim result.

## Evidence and independent acceptance

Each record must have a separate evidence-only C file under `docs/superpowers/specs/` binding exact A/B/C,
RED/GREEN CI, immutable A test blobs, changed paths, verification output, migration/rollback and unresolved
limitations. The independent auditor must fresh-read raw Git/GitHub evidence and issue one verdict per record.

## Integration rule

`MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED`.

This V1 candidate authorizes no merge. After all required independent verdicts, a separate integration
reconciliation/authority must decide branch ordering, main-head drift and mergeability.

## Stop conditions

STOP on: predecessor drift; owner/allowlist ambiguity; overlap not resolved by the record order above;
invalid RED; source mutation before RED; test weakening; dependency not independently accepted; unexpected
CI identity; evidence mismatch; persistence/backup migration ambiguity; any readiness/band/mastery/schedule
claim outside the frozen boundaries; or any need to modify a path outside the accepted record.
