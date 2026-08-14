# Wave 6 Stage 1 R2-R4 Infrastructure Recovery Authorization Manifest V4

Status: `DOCS_ONLY_RECOVERY_AUTHORIZATION_CANDIDATE / NOT_ACTIVE_UNTIL_INDEPENDENT_ACCEPT`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Manifest ID: `W6-STAGE1-RECOVERY-AUTH-012`
Canonical authority revision: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`

## Recovery subject

AUTH-012 is a new candidate. It does not amend, cherry-pick, reopen or reuse the rejected AUTH-011 / PR #72 commit. PR #72 is closed/unmerged and frozen under Independent REJECT comment `5288980598` and freeze comment `5289363860`.

Historical execution PR #71 is closed/unmerged at exact head `3a8e0dd665c632c62307eb4e9c0256331b7a92cb`, stopped at R2-B after natural CI #386 / run `31764547899` failed Phase 4 browser readiness with raw `INFRASTRUCTURE_FAILURE / READINESS_TIMEOUT`. That failure is not GREEN and is never waived or reused.

Historical EWF Pilot-A PR #28 is closed/unmerged as `HISTORICAL_UNFINISHED_CANDIDATE / NOT_ACCEPTED` under comment `5289368946`. Current canonical main still has `src/today-composer.js` blob `d63a76c3698fe572790914e687443ee38e6842b2`; therefore PR #28's source repair is not canonical and is not inherited by Wave 6. Closing #28 resolves the current active-writer overlap only; Pilot A remains separately unresolved.

## Canonical owner authority

Wave 6 downstream ownership is canonical through merged PR #69, Independent Owner-Ratification ACCEPT `5288053871`, merge/current main `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`.

Accepted prior manifest AUTH-010 / PR #70 exact head `d29de12b8a44810d5bf8f4c19d87727d532eb894`, Independent Manifest ACCEPT `5288391297`, remains historical authority for the already-produced R1 technical chain and the stopped #71 attempt. AUTH-012 grants no retroactive success to #71.

## Exact R1 technical prerequisite

AUTH-012 does not re-execute R1. It freezes R1 only as a technical prerequisite pending final independent batch audit:

- R1-A `a76e8c235249c5c97d8aafd99fa2c2303f7c9cb9`, parent canonical `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`, test-only `tests/progress.test.mjs`, immutable blob `a8f9ca3423bcc6ff4cadf088ff8e8f0c2e2107e0`;
- natural RED CI #382 / run `31761545750`, eligible first assertion `existing progress seam must interpret canonical nested evidence-decided payloads`, expected 1 / actual 0;
- R1-B `319462d22753958aa5da766642c763a79d3ac667`, parent exact A, source-only R1 allowlist;
- natural GREEN CI #383 / run `31762977651` SUCCESS, verification artifact `9205284228`, digest `sha256:863f89494b2d1507548cf47146655df204089d700a160a656d2247f5762f9a6e`;
- R1-C `c14047c74ff6499e70e06617f23b4f7161685cb2`, evidence-only child of B;
- R1-C natural CI #384 / run `31763393330` SUCCESS;
- R1-C `verification-output`: artifact `9205423689`, digest `sha256:a061acd340ddc3c074c7b6583a66a0ac03f341a5378b4d613e0f1a2d147e68cb`;
- R1-C browser artifacts: Core `9205436300` / `sha256:03e9307adbe32b729465d8500504784556d64f57972d8e4d92f2505ab0ff3eea`; IELTS `9205442898` / `sha256:53095b8bb238018f4179de607dd4d789131d77b1516098c47bfe67f93283bc57`; V10 `9205445299` / `sha256:e63e09620d1d0bf96f41e828cc5031699de8e754db7739167d17347645537fe3`; hardening `9205446613` / `sha256:db79148e27d6f2341af1913b5327360feb918281b475c19ffa73c417381f7578`.

R1 has not received independent implementation/package acceptance in this replacement flow. Downstream technical chaining grants no acceptance inheritance.

## Writer and topology

Writer: `W6-STAGE1-EXECUTOR-012 / ONE_WRITER_EXCLUSIVE`.
Replacement branch: `codex/w6-stage1-recovery-exec-012`.
Branch may be created only from literal exact R1-C `c14047c74ff6499e70e06617f23b4f7161685cb2` after exact AUTH-012 Independent Manifest ACCEPT and a fresh complete open-PR overlap check.
Execution PR: one Draft PR to `main`, title `W6-STAGE1-RECOVERY-EXEC-012: Focus, Frozen Assessment, Targeted Diagnostic recovery`.

Only graph:
`R1-C -> R2-A2 -> R2-B2 -> R2-C2 -> R3-A -> R3-B -> R3-C -> R4-A -> R4-B -> R4-C`.

No second writer, maintainer source edit, reset, rebase, amend, squash, force-push, merge-from-main, workflow rerun/dispatch, Ready/Draft toggle, close/reopen event manufacture, empty/no-op/timestamp commit or historical-branch cherry-pick.

## Explicit historical-byte reuse

Historical #71 commits/CI/RED/GREEN/evidence status are frozen. AUTH-012 permits prospective content reuse only of these raw historical R2 bytes, and only after fresh replacement predicates:

- R2-A test `tests/wave6-focus-today.test.mjs` blob `904a12845e5b0127c515db86ee36b16e801514e9`;
- R2-B `src/focus-selector.js` blob `fb235ce654628567fb8c19f7caed944ddd778065`;
- R2-B `src/today-composer.js` blob `0135536b3775753619d5b35d814923fac500a842`;
- R2-B `src/today-planner-v2.js` blob `af683fdb91b56ae56aac82069c2e013f0b441bc9`.

Reuse conveys zero evidence or acceptance. New R2-A2 must be a new test-only commit from exact R1-C and obtain fresh natural eligible RED. New R2-B2 must be a new source-only child and obtain fresh natural exact-head SUCCESS. CI #385/#386 and historical commit identities cannot satisfy AUTH-012.

No other blocked/rejected byte is reusable unless this manifest expressly names it.

## Shared A/B/C rules

A: exact record test/harness allowlist only; production source byte-identical to parent. Natural PR CI must first fail for the record-specific product predicate. Missing module except an expressly controlled dynamic-import capability assertion, syntax, infrastructure, browser/network/provider/timeout, dependency/unrelated failure, source mutation, wrong parent or ambiguous causality invalidates RED and STOPs before B.

B: parent exact A; all A blobs immutable; exact source allowlist only; minimal implementation. Natural exact-head PR workflow MUST conclude `SUCCESS` and run every applicable shared gate from `.github/workflows/ci.yml`. Any B GREEN failure, including infrastructure failure, is STOP/new authority.

C: parent exact B; all A/B test/source blobs immutable; exactly one record evidence file; natural exact-head PR workflow MUST conclude `SUCCESS`; evidence authority `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

Downstream R3-A parent must be the unique exact read-back R2-C2 with natural SUCCESS/artifacts. R4-A parent must similarly be exact R3-C. Zero/multiple selectors or unresolved prior technical failure => STOP.

## Evidence V1

Each C freezes exact accepted AUTH-012 head/comment; owner/record; repo/branch/PR; predecessor; A/B/C SHA+parents+paths+blob SHAs; fresh natural RED run/event/attempt/job/head and first causal assertion; B GREEN run/job/head/artifacts/digests; immutable-A proof; migration/rollback result; C sole evidence path; immutable-A/B proof; C CI/artifact bindings; limitations; `Package acceptance: NOT_GRANTED_BY_IMPLEMENTER`; `Merge authority: NOT_GRANTED_BY_IMPLEMENTER`.

## Independent audit / integration

After R4-C and final CI/artifact read-back, executor STOP. A different trust boundary must fresh-audit R1, replacement R2, R3 and R4 separately with explicit ACCEPT/REJECT/BLOCKED per record. No record inherits another verdict.

`MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED`.
No Ready, merge, package acceptance, status reconciliation, Stage 1 completion, release, deployment or Stage 2 authority is granted here.

## Global STOP

STOP on manifest non-ACCEPT; R1 identity/CI/artifact contradiction; owner/main drift before execution; any open PR/writer overlapping an A/B/C mutation path; wrong branch/parent/path; source-before-eligible-RED; A mutation; invalid/ambiguous RED; any B/C GREEN failure; missing/mismatched artifact; migration/rollback ambiguity; second scheduler/store/runtime; provider call in Today composition; FCS-02/P7-04 activation; readiness/band/mastery/representative-assessment/AI-key-scoring/evidence-schedule authority; or acceptance/merge inference.

Package records and mandatory-field matrix in this directory are controlling companions. Missing fields are not inferred.
