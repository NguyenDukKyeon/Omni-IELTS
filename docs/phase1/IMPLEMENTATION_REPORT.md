# Phase 1 — Core Product Unification implementation report

Date: 2026-07-30

Branch: `codex/phase-1-core-unification`

Baseline: `main` at `c62d773`, containing the accepted Phase 0 source `d869eb4` and PR #8 Ubuntu CI run 250.

Pull request: [#9](https://github.com/NguyenDukKyeon/VocabMaster/pull/9) (draft)

Status: `PUSHED / PR_OPEN / CI_PENDING / INDEPENDENT_REVIEW_REQUIRED`

This report records implementer evidence and the delivery handoff. It is not an acceptance report, does not authorize merge or deploy and does not unlock Phase 2.

## Package results

| Package | Implemented result | Focused evidence |
|---|---|---|
| P1-00 | Shared forward-compatible opener, durable migration ledger, future-version read-safe behavior and typed blocked/unknown failures | `test:p1-migrations` 5/5 |
| P1-01 | One versioned ActivitySpec/Run/Attempt/Receipt schema, immutable exact target, append-only AssistanceTrace and legacy adapters | `test:p1-contracts` 7/7 |
| P1-02 | Append-only learning events, idempotent projections, dead letters and deterministic rebuild; Core FSRS write is transaction-bound | `test:p1-events` 5/5 |
| P1-03 | Durable cross-DB intent/checkpoint/retry/quarantine model; lexical finalize and merge use idempotent saga steps and tombstones | `test:p1-reconciler` 4/4 |
| P1-04 | CaptureItem state machine, shared quality gate, stable finalize key, one Inbox and crash-safe exact card/occurrence/candidate finalization | `test:p1-capture` 12/12 |
| P1-05 | Canonical transcript source, immutable revision, stable segment lineage/identity, provenance/coverage and IELTS/V10 adapters | `test:p1-transcripts` 17/17 |
| P1-06 | Global ErrorRecord/occurrence repository, legacy aliases, verified correction policy and deterministic repair queue | `test:p1-errors` 4/4 |
| P1-07 | Deterministic due-first Today Composer with exact ActivitySpec, reason codes, repair cap, timezone boundary and no-AI behavior | `test:p1-today` 8/8 |
| P1-08 | Executor registry, durable run/reload resume, multi-tab lease, exact receipt persistence, skip/cancel semantics and five-item primary IA | `test:p1-runner` 10/10 |

## Persistence and rollback

- Core database advances additively from version 4 to 5 with `learningEvents`, `learningProjections` and `learningDeadLetters`.
- V10 database advances additively from version 1 to 5 with workflow intents, canonical transcript stores, global error stores, repair queue and Today runs.
- Every schema step has a stable migration ID and digest. No migration deletes legacy Core, IELTS or V10 records.
- Legacy readers continue through projections/adapters. Rollback retains canonical events, intents, transcript revisions, errors and Today receipts.
- Backup/restore registry coverage includes every new physical store; device/cache exclusions remain unchanged.

## Verification matrix

| Gate | Result |
|---|---|
| `npm test` | PASS 233/233, zero failure/skip/todo |
| `npm run check` | PASS |
| `npm run build` | PASS |
| Core production browser | PASS on Chrome 150.0.7871.188 |
| IELTS production browser | PASS on Chrome 150.0.7871.188 |
| V10 production browser | PASS on Chrome 150.0.7871.188 |
| Hardening production browser | PASS on Chrome 150.0.7871.188 |
| `npm run phase0:gate` | NOT RUNNABLE on the uncommitted implementation tree because the accepted Phase 0 release harness deliberately requires a clean exact commit |
| `npm run phase1:verify` | PASS 22/22 in 50.5 s; includes focused P1 suites, full 233/233, audits, build/server/preview and all production browser suites |

The Phase 0 release gate was rerun on `main` before the branch was created and passed 21/21 with the accepted 26-file artifact digest `71772f3cd42dce06ca537c30fb0d3cda43298691022a27969c43071a6024db54`.

The canonical delivery verification record is the description of draft PR #9 because it can bind results to the final commit SHA without creating another documentation-only head. The delivery is reported complete only after the clean final `HEAD` reruns the cumulative verifier, full suite, static check, production build and every required browser suite.

## Required independent audit

The reviewer must bind the audit to the final pushed SHA of draft PR #9, inspect the cumulative diff, run `npm ci --no-audit --no-fund`, run `npm run phase1:verify` from a clean exact commit, verify real IndexedDB after reload, exercise desktop/mobile production UI, inject crash/duplicate/out-of-order failures and reconcile review/error/progress totals back to canonical attempts.

Any P0/P1 finding keeps the affected package and Phase 1 exit unaccepted. Phase 2 stays blocked until the PR has green CI, the exact source and hard gates are independently accepted, and the PR is merged into `main`.
