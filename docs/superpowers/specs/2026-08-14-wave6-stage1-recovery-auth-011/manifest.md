# Wave 6 Stage 1 R2-R4 Infrastructure Recovery Authorization Manifest V3

Status: `DOCS_ONLY_RECOVERY_AUTHORIZATION_CANDIDATE / NOT_ACTIVE_UNTIL_INDEPENDENT_ACCEPT`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Manifest ID: `W6-STAGE1-RECOVERY-AUTH-011`
Canonical authority revision: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`

## Recovery subject

This candidate authorizes a prospective replacement execution for only the unfinished R2-R4 records after the prior execution PR #71 stopped fail-closed at R2 GREEN observation. It does not modify, reopen, rerun, rewrite, rebase, amend or accept PR #71.

Historical execution PR #71 is frozen closed/unmerged at exact head `3a8e0dd665c632c62307eb4e9c0256331b7a92cb` under executor STOP comment `5288830546` with disposition `BLOCKED_AT_R2_GREEN_OBSERVATION`.

The blocking natural CI was #386 / run `31764547899`, event `pull_request`, attempt 1, exact head `3a8e0dd665c632c62307eb4e9c0256331b7a92cb`. Unit/cross-check/roadmap/IELTS/V10/build gates succeeded. Phase 4 exact-head verification failed at the browser smoke with raw `INFRASTRUCTURE_FAILURE / READINESS_TIMEOUT`: CDP readiness fetch to `127.0.0.1:9564` received `ECONNREFUSED`; the same raw log subsequently reported Chrome `DevTools listening on ws://127.0.0.1:9564/...` at the timeout boundary. The failure is not declared GREEN and is not waived.

No rerun, workflow dispatch, Ready/Draft toggle, close/reopen event manufacture, empty/no-op/timestamp-only commit or CI mutation is authorized.

## Canonical authority and owner state

Owner authority remains canonical through merged PR #69 / exact main `c6d790e0f85bdc9120aa99e5dbc972b955382ce4` / Independent Owner-Ratification ACCEPT comment `5288053871`.

The accepted prior manifest `W6-STAGE1-RECOVERY-AUTH-010` / PR #70 exact head `d29de12b8a44810d5bf8f4c19d87727d532eb894` / independent Manifest ACCEPT comment `5288391297` remains historical authority for the already-produced R1 technical chain and the stopped #71 attempt. AUTH-011 does not alter that history and grants no retroactive success.

PR #68 remains historical REJECT/frozen. Historical PR #66 remains closed/unmerged exact-head semantic evidence only. The local Wave 6 tree remains `NON_CANONICAL_RECOVERY_INPUT` and provides no authorization or acceptance.

## Frozen R1 technical prerequisite

AUTH-011 does not re-execute R1. It freezes the following R1 chain produced under accepted AUTH-010 as a technical prerequisite pending final independent batch audit:

- R1-A/test-only: `a76e8c235249c5c97d8aafd99fa2c2303f7c9cb9`, parent canonical `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`, immutable test blob `tests/progress.test.mjs` = `a8f9ca3423bcc6ff4cadf088ff8e8f0c2e2107e0`;
- natural RED CI #382 / run `31761545750`, eligible first behavior assertion `existing progress seam must interpret canonical nested evidence-decided payloads`, expected 1 / actual 0;
- R1-B/source-only: `319462d22753958aa5da766642c763a79d3ac667`, parent exact A, exact R1 source allowlist only;
- natural GREEN CI #383 / run `31762977651` SUCCESS; `verification-output` artifact `9205284228`, digest `sha256:863f89494b2d1507548cf47146655df204089d700a160a656d2247f5762f9a6e`;
- R1-C/evidence-only: `c14047c74ff6499e70e06617f23b4f7161685cb2`, parent exact B;
- R1-C natural CI #384 / run `31763393330` SUCCESS; `verification-output` artifact `9205444163`, digest `sha256:a061acd3422245033a8311e80f4c1b46499d50464d17e22d4309a0f21fcfe549`.

R1 has not received independent implementation/package acceptance in this replacement flow. No R2-R4 record inherits R1 acceptance. Final independent audit must still verdict R1 separately.

## Writer and replacement topology

Writer ID: `W6-STAGE1-EXECUTOR-011 / ONE_WRITER_EXCLUSIVE`.
Replacement execution branch: `codex/w6-stage1-recovery-exec-011`.
Branch creation predicate: branch must be created directly from exact immutable R1-C `c14047c74ff6499e70e06617f23b4f7161685cb2` only after this exact AUTH-011 head receives independent Manifest ACCEPT.
Replacement execution PR: one Draft PR to `main`, title `W6-STAGE1-RECOVERY-EXEC-011: Focus, Frozen Assessment, Targeted Diagnostic infra recovery`.

Only permitted graph:
`R1-C -> R2-A2 -> R2-B2 -> R2-C2 -> R3-A -> R3-B -> R3-C -> R4-A -> R4-B -> R4-C`.

No second writer, maintainer edit, reset, rebase, amend, squash, force-push, merge-from-main, cherry-pick from the frozen #71 branch, workflow rerun/dispatch or event manufacture is authorized.

## Explicit frozen-byte reuse permission

Because #71 is historical BLOCKED, its commits/history/RED/GREEN status are frozen. AUTH-011 prospectively permits reuse of only these exact byte contents as candidate inputs; reuse conveys zero evidence or acceptance and each replacement phase must obtain fresh natural CI:

- R2 A test blob `tests/wave6-focus-today.test.mjs` = `039f4c90988b8fc2326ab54a4c50e93ba3a3f50e`;
- R2 B `src/focus-selector.js` blob `fb235ce654628567fb8c19f7caed944ddd778065`;
- R2 B `src/today-composer.js` blob `0135536b3775753619d5b35d814923fac500a842`;
- R2 B `src/today-planner-v2.js` blob `af683fdb91b56ae56aac82069c2e013f0b441bc9`.

The executor must materialize a new test-only R2-A2 from exact R1-C and observe a fresh eligible behavioral RED. Only then may it materialize a new source-only R2-B2 using the allowed blobs or a smaller source subset if the immutable A2 contract passes. It must then observe a fresh natural exact-head GREEN. Old #385/#386 cannot substitute.

No other blocked/rejected bytes are reusable unless a record expressly permits them after its own eligible RED.

## Shared A/B/C rules

A: exact record test/harness allowlist only; all production source byte-identical to parent; natural exact-head PR CI must first fail for the record-specific product predicate. Missing module outside an expressly controlled dynamic-import predicate, syntax, infrastructure, network/provider, harness/dependency/unrelated failures or ambiguous causality invalidate RED and STOP before B.

B: parent exact A; all A blobs immutable; exact source allowlist only; minimal implementation; every shared PR GREEN gate must run and the natural exact-head workflow must conclude `SUCCESS`. Any GREEN failure, including infrastructure failure, is STOP and requires new authority; it is never waived by narrative classification.

C: parent exact B; A/B test/source blobs immutable; exactly one record evidence file; natural exact-head workflow SUCCESS; evidence label `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

For R3/R4 the downstream predecessor must equal the exact immediately preceding C SHA produced under AUTH-011, with natural SUCCESS and artifact digest read back before the next A. Sequential technical completion is not acceptance inheritance.

## Evidence V1

Each C must freeze: AUTH-011 exact accepted head/comment, owner/record, repo/branch/PR, exact predecessor, A/B/C SHA+parents+paths+blob SHAs, natural RED run/event/attempt/job/head and first causal assertion, B GREEN run/job/head/artifact digests, immutable-A proof, migration/rollback result, C sole evidence path, immutable-A/B proof, C CI/artifact bindings, limitations, `Package acceptance: NOT_GRANTED_BY_IMPLEMENTER`, `Merge authority: NOT_GRANTED_BY_IMPLEMENTER`.

## Independent audit and integration

After R4-C and exact final CI read-back, executor STOP. A different trust boundary must fresh-audit R1, replacement R2, R3 and R4 separately and issue explicit `ACCEPT / REJECT / BLOCKED`; no record inherits another verdict.

`MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED`.
No Ready, merge, package acceptance, status reconciliation, Stage 1 completion, release or deployment is authorized by this manifest.

## Global STOP

STOP on manifest non-ACCEPT; R1-C identity/CI/artifact contradiction; main owner-authority drift before execution; open overlapping writer; wrong branch/parent/path; source-before-eligible-RED; A mutation; invalid/ambiguous RED; any B/C GREEN failure; missing/mismatched artifact; migration/rollback ambiguity; second scheduler/store/runtime; provider call in Today composition; FCS-02/P7-04 activation; readiness/band/mastery/representative-assessment/AI-key-scoring/evidence-schedule authority; or acceptance/merge inference.

Package records and mandatory-field matrix in this directory are controlling companions. Missing fields are not inferred.