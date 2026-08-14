# Wave 6 Stage 1 Recovery Authorization Manifest V2

Status: `DOCS_ONLY_WAVE_AUTHORIZATION_CANDIDATE / NOT_ACTIVE_UNTIL_INDEPENDENT_ACCEPT`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Manifest ID: `W6-STAGE1-RECOVERY-AUTH-010`
Exact canonical predecessor: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`

## Authority chain

Downstream owner authority is canonical through merged PR #69 / merge `c6d790e0f85bdc9120aa99e5dbc972b955382ce4` / Independent Owner-Ratification ACCEPT comment `5288053871`.

Historical PR #68 exact head `89bf09bf3b6113256b94b8c2159f1938ee591266` remains `REJECT / FROZEN_NOT_REUSED` under comment `5287954419` and is closed unmerged. Historical PR #66 exact head `9b8aeb3c92f577857caffcb218f6fd9ddebf022a` remains closed/unmerged exact-head semantic evidence only; Implementation ACCEPT `5275718552`, Package ACCEPT review `4928369301`, closure comment `5288253315`. No #66 bytes, topology, RED/GREEN chronology, acceptance or merge authority are inherited.

The uploaded local Wave 6 tree is `NON_CANONICAL_RECOVERY_INPUT` only:
- archive SHA-256 `0bb3c8eaa52fcf175f4ebb7b2e814c4add761a7d0bdef2b043dc72173c679bcc`;
- recorded local HEAD `66666172238668b1ea40d7ff596c82c209fcdfe5`;
- branch label `recovery/wave6-local-accept-20260813`;
- tracked patch SHA-256 `5f2d7008d51682a44f4bab87b08a5ad7e8d3b19b304f0e54c1af7d723dc797b0`.
It may be consulted only after an eligible test-first RED. It supplies no authorization, acceptance, package status or merge authority.

## Canonical sources

Before mutation the executor and auditor must fresh-read `AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/DECISIONS.md` (ADR-046/ADR-048), `docs/superpowers/specs/2026-08-06-bounded-execution-capsule-governance-design.md`, the merged Wave 6 boundary draft, `docs/superpowers/specs/2026-08-14-wave6-downstream-owner-ratification-v1.md`, PR #69 ACCEPT, and PR #66 only as historical semantics.

## Baseline

Repository: `NguyenDukKyeon/VocabMaster`.
Exact main: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`.
Natural baseline push CI: #379 / run `31759213350` / attempt 1 / workflow `322561862` / SUCCESS / exact head `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`.
Baseline `verification-output`: artifact `9203940657`, digest `sha256:6a30f2e5dcf4fbf386b8bea93f35e9a96c1102304cd02b0b0f763c739860ed8d`.

At materialization time PR #66, #67 and #68 are closed unmerged, so no open Wave 6 source/test overlap remains. Main drift before R1-A, a new overlapping writer/PR, or baseline contradiction blocks execution.

## Writer and exact execution topology

Writer ID: `W6-STAGE1-EXECUTOR-010`.
Execution branch: `codex/w6-stage1-recovery-exec-010`, created only from exact baseline above after this exact manifest receives independent ACCEPT.
Execution PR: one Draft PR to `main`, title `W6-STAGE1-RECOVERY-EXEC-010: P7/WKN successor, Focus, Frozen Assessment, Targeted Diagnostic`.
No second writer, maintainer edit, bot remediation, amend, rebase, squash, force-push, merge-from-main, no-op commit, Ready/Draft event manufacture, workflow dispatch or CI rerun is authorized.

Only commit graph:
`P0 -> R1-A -> R1-B -> R1-C -> R2-A -> R2-B -> R2-C -> R3-A -> R3-B -> R3-C -> R4-A -> R4-B -> R4-C`, where `P0=c6d790e0f85bdc9120aa99e5dbc972b955382ce4`.

For R2-R4, the predecessor selector is exact and deterministic: the parent MUST equal the immediately preceding record's read-back evidence-only C SHA generated under this manifest. That SHA is frozen before the downstream A is created; any other parent is unauthorized. This sequential technical boundary grants no acceptance inheritance.

Package records:
1. `w6-p7-00-wkn-succ-010.md`
2. `w6-fcs-00-01-010.md`
3. `w6-asm-00-010.md`
4. `w6-td-00-010.md`

## Shared A/B/C rules

A: exact record test/harness allowlist only; production source byte-identical to parent; natural exact-head PR CI must fail first for the record-specific behavioral predicate. Syntax/module-resolution/infrastructure/dependency/unrelated baseline failures, source mutation, weakened assertions, wrong parent or ambiguous first cause invalidate RED and STOP before B.

B: parent exact A; A blobs immutable; exact source allowlist only; minimal implementation; natural exact-head CI SUCCESS.

C: parent exact B; A/B test/source blobs immutable; exactly one record evidence file added; natural exact-head CI SUCCESS; evidence authority `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

Every GREEN B/C natural PR CI must run all applicable `.github/workflows/ci.yml` gates: `npm test`, `npm run check`, roadmap audit, IELTS audit, V10 focused/audit, build, Phase 4/5 exact-head verification on PR, serve/preview, Core/IELTS/V10/hardening browser smoke. Conditional failure-report steps may skip only because their owning gate passed.

## Evidence V1

Each C file must contain exact accepted manifest head, record/owner, repo/branch/PR, exact predecessor, A/B/C SHA+parent+paths+blob SHAs, natural RED run/event/attempt/job/head and classified assertion, B GREEN run/job/head/artifact digests, immutable-A proof, migration/rollback result, C sole evidence path, immutable-A/B proof, C CI/artifact bindings, limitations, `Package acceptance: NOT_GRANTED_BY_IMPLEMENTER`, `Merge authority: NOT_GRANTED_BY_IMPLEMENTER`.

Evidence cannot mutate canonical status/owner docs, source, tests, CI or dependencies.

## Independent batch audit and integration

The executor stops after R4-C and final CI read-back. A different trust boundary must fresh-audit all four records separately and issue distinct `ACCEPT / REJECT / BLOCKED`; no record inherits another verdict. A rejected prerequisite blocks dependent package acceptance.

`MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED`.
This manifest does not authorize merge, Ready transition, status reconciliation, release or deployment. Integration requires separate controlling merge authority, exact accepted final head unchanged, required CI still green, current-main drift explicitly resolved and mergeability clean.

## Global STOP

STOP with no further mutation on manifest non-ACCEPT, main/owner drift before R1-A, second writer, overlap, wrong parent/path, source-before-RED, test weakening, invalid/ambiguous RED, missing natural exact-head CI, GREEN failure, migration ambiguity, artifact/digest/evidence mismatch, or any readiness/band/mastery/representative-assessment/FCS-02/P7-04-activation/second-scheduler-or-store/AI-key-scoring/release/deploy behavior.

This manifest authorizes only the four conditional records after exact-head independent Manifest ACCEPT. It does not itself accept implementation, grant package acceptance, grant merge authority, close Stage 1, or authorize Stage 2.