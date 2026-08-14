# W6-STAGE1-RECOVERY-AUTH-014

Status: `DOCS_ONLY_RECOVERY_AUTHORIZATION_CANDIDATE / NOT_SELF_ACCEPTING / NOT_ACTIVE_UNTIL_INDEPENDENT_ACCEPT`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Recovery scope: `R3 -> R4 bounded sequential execution capsule`

## Authority and exact repository state

Repository: `NguyenDukKyeon/VocabMaster`
Canonical authority revision / PR base: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
Canonical owner ratification: merged PR #69 / independent ACCEPT `5288053871`.

## Historical lineage and trust boundary recovery

Historical authorization PR #75 (`W6-STAGE1-RECOVERY-AUTH-013`) was independently accepted at exact head `87d082083a95d1b9f4e595c0229c9397e1fafeac` via Independent Manifest ACCEPT comment `5289870682`. AUTH-013 is historical authority for the stopped EXEC-013 lineage and is not reused as authority for a new executor.

Historical execution PR #76 (`W6-STAGE1-RECOVERY-EXEC-013`) created R3-A3 at exact head `bd6cf73857d94d32afeaadb66a54cfa4e480fee5` (parent `2dc10d86a6440efe1c4d8c3dc925923a27977248`) with immutable test blob `1f0cf13f24f38e24247c389aad038aa708ebffb5`. Natural CI #394 / run `31774029624` completed `FAILURE` (919 tests / 918 pass / 1 fail) with verification artifact `9209187448`, digest `sha256:4fcfe709807917324723b7e0f68214c4d6d2d1bea9831a59bcb73f650e698119`.

While CI #394 proved technical RED feasibility (`ELIGIBLE_NATURAL_R3_RED` on Frozen Assessment capability absence following healthy QAR and IELTS prerequisites), execution was stopped under:
`STOP / TRUST_BOUNDARY_VIOLATION / SAME_SESSION_MANIFEST_ACCEPTOR_AND_IMPLEMENTATION_WRITER`.

The same prompt/session that independently ACCEPTED AUTH-013 later became the implementation writer creating R3-A3. Under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` and repository trust-boundary rules:
- PR #76 is frozen as `HISTORICAL_STOPPED / TRUST_BOUNDARY_VIOLATION / CLOSED_UNMERGED`;
- PR #76 closed/unmerged state is fresh-verified;
- no R3-B3 source mutation occurred in that lineage;
- no implementation or package acceptance is inherited;
- historical CI #394 is technical evidence only, not new execution acceptance evidence.

This new candidate (`AUTH-014`) re-establishes a clean trust boundary for a fresh executor.

## Exact successful technical predecessor retained

The ONLY eligible technical predecessor for this recovery is R2-C2:
`2dc10d86a6440efe1c4d8c3dc925923a27977248`

R2-C2 lineage:
- Predecessor R1-C: `c14047c74ff6499e70e06617f23b4f7161685cb2` (parent R1-B `319462d2...`, parent R1-A `a76e8c23...`, parent `c6d790e0...`);
- R2-A2: `d1282afbdb4bec38626964438760a91c6214d0d5`;
- R2-A2 natural RED: CI #389 / run `31771384877` / verification artifact `9208258257` / digest `sha256:eb6127c8f11ddfe6414527381f43129cc55758ece39e188f683eb0ebb9d4f12d` (totals: 918 tests / 917 pass / 1 fail; product failure: Today must bind exactly one weakness Focus);
- R2-B2: `c84f243b4550c786082f46e9fae837b278fc3133`;
- R2-B2 natural GREEN: CI #390 / run `31771537006` SUCCESS;
- R2-C2 exact head: `2dc10d86a6440efe1c4d8c3dc925923a27977248`;
- R2-C2 natural exact-head baseline: CI #391 / run `31771748853` SUCCESS;
  - verification `9208382868` / `sha256:970262b3abaa5b301df55669a10eb0e05fe477afbb4194fc95d897adab4f8a20`;
  - Core browser `9208394724` / `sha256:d98c2de836b39d32de7bd015d48f89021ac228fb85d92d7ab1bd8db42ae408f9`;
  - IELTS browser `9208402896` / `sha256:744396d06a325eb4857a15116e441943124dd28c593d3001d9d86e166ccee31e`;
  - V10 browser `9208405677` / `sha256:37a9746944cb6fb76377f7a485e0634ecbf238d89f9700e94c90b922f897d472`;
  - hardening browser `9208407333` / `sha256:2c47c628ab48dd8605e4ca7220bf380ba726922ff15d24cb6eba077b92346631`.

R2-C2 is technical predecessor/evidence only. This manifest does not independently accept or package-accept R2.

## Clean executor identity and replacement topology

Designated clean writer: `W6-STAGE1-EXECUTOR-014 / ONE_WRITER_EXCLUSIVE`.
Future execution branch: `codex/w6-stage1-recovery-exec-014`.
Exactly one Draft execution PR against canonical `main` (`c6d790e0f85bdc9120aa99e5dbc972b955382ce4`).
The execution branch must not exist before independently accepted AUTH-014 execution begins.

Exact prospective topology authorized in one bounded execution capsule:
```text
R2-C2 (2dc10d86...)
  -> fresh R3-A4 (test-only)
  -> natural R3 RED (CI failure on capability absence)
  -> R3-B4 (source-only)
  -> natural R3 GREEN (CI SUCCESS)
  -> R3-C4 (evidence-only)
  -> R4-A4 (test-only)
  -> natural R4 RED (CI failure on capability absence)
  -> R4-B4 (source-only)
  -> natural R4 GREEN (CI SUCCESS)
  -> R4-C4 (evidence-only)
  -> final exact-head CI
  -> STOP for Independent Batch Audit
```

Every edge is direct-parent, append-only. No amend/rebase/squash/force-push/reset/merge-from-main. All other paths excluded.
Protocol V1 permits this sequential boundary without intermediate user authorization prompts, provided all entry, RED, GREEN, evidence and stop predicates are strictly satisfied.

## Test blob content reuse and non-canonical bytes

- Historical commit SHA `bd6cf73857d94d32afeaadb66a54cfa4e480fee5` MUST NOT be reused as commit identity.
- Historical CI #394 MUST NOT be reused as new execution RED acceptance evidence.
- Prospective reuse of exact test/blob **CONTENT** `1f0cf13f24f38e24247c389aad038aa708ebffb5` (`tests/wave6-frozen-assessment.test.mjs`) IS EXPLICITLY PERMITTED for creating fresh commit R3-A4, as CI #394 confirmed it establishes healthy prerequisites and asserts pure capability absence.
- R3-A4 must be created as a fresh test-only commit directly from exact predecessor `2dc10d86a6440efe1c4d8c3dc925923a27977248`.
- A fresh natural exact-head CI run for R3-A4 is strictly mandatory.
- Local Wave 6 ZIP / recovered workspace bytes are `NON_CANONICAL_RECOVERY_INPUT / CONTENT_ONLY`. They convey zero commit provenance, zero authority, zero acceptance and zero RED/GREEN evidence.

## Corrected R3 RED behavioral predicate

R3-A4 must establish healthy existing prerequisites before asserting Frozen Assessment capability absence:
1. construct two authentic owner-verified QAR questions from existing canonical adapters;
2. create canonical question registry;
3. `registerExecutor(question.kind, question.version, question.requiredCapabilities)`;
4. assert `registry.supports(question) === true`;
5. assert `registry.hasExecutor(question) === true`;
6. build/read existing IELTS backup/persistence baseline successfully;
7. controlled-dynamic-import the new ASM modules, catching only expected `ERR_MODULE_NOT_FOUND`;
8. eligible RED is the explicit assertion that dedicated Frozen Assessment owner capability is absent.

Any prerequisite failure, uncaught module error, syntax error, fixture/dependency/IndexedDB/infra failure, unrelated test failure, already-passing capability, wrong parent/path or source delta invalidates RED and requires STOP before B.

## Package records

- `W6-ASM-00-014`: see `w6-asm-00-014.md`.
- `W6-TD-00-014`: see `w6-td-00-014.md`.
- Mandatory-field freeze: `protocol-mandatory-field-matrix.md`.

R4 is inactive until exact R3-C4 has natural SUCCESS CI and artifact digests read back.

## Open-writer and race gates

Before R3-A4 and again before R4-A4:
- fresh-read current `main` and verify canonical authority has not materially drifted from `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`;
- enumerate complete open PR registry and changed paths;
- historical PRs #74 and #76 must remain closed/unmerged;
- no open writer/PR may overlap any R3/R4 test/source/evidence path or ownership boundary;
- future branch/PR identity must be unique;
- accepted AUTH-014 exact head and ACCEPT comment must be read back.

Any overlap or identity ambiguity => STOP with zero further mutation.

## Shared GREEN profile

Every B and C natural exact-head `pull_request`/`synchronize` CI must conclude SUCCESS for applicable repository gates: npm tests, cross-check, roadmap audit, IELTS audit, V10 focused/audit, build, Phase4/Phase5 exact-head verification, serve/preview, Core browser, IELTS browser, V10 browser, hardening browser. Artifact IDs and digests must be read back and bound in evidence.

No workflow, dependency or CI config mutation is authorized.

## Evidence and acceptance boundary

R3-C4 exact evidence path:
`docs/superpowers/specs/2026-08-14-wave6-stage1-exec-014/w6-asm-00-014-evidence-v1.md`

R4-C4 exact evidence path:
`docs/superpowers/specs/2026-08-14-wave6-stage1-exec-014/w6-td-00-014-evidence-v1.md`

Evidence authority: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.
Final exact head requires fresh independent batch audit. The executor cannot accept or package-accept its own work.

## Trust boundary invariant

The following trust boundaries remain strictly separated:
```text
MANIFEST AUTHOR (this session)
  ≠ INDEPENDENT MANIFEST AUDITOR (separate session)

IMPLEMENTATION EXECUTOR (future session)
  ≠ INDEPENDENT IMPLEMENTATION/BATCH AUDITOR (separate session)
```
The session that accepts AUTH-014 MUST NOT later become implementation writer for EXEC-014.

## Migration / rollback

R3 migration is forward-only additive IELTS DB `3 -> 4`, IELTS backup `3 -> 4`, combined backup/registry `5 -> 6`, exactly one `frozenAssessments` store and required indexes; preserve all prior data and legacy upgrade compatibility. No downgrade, store deletion or destructive reset.
R4 migration: `NONE`.

Before future integration, rollback is discard/revert recovery chain. After accepted integration, disable producers while retaining compatible durable readers/store/backup; never downgrade DB or delete rows.

## Final audit optimization & integration

After R4-C4 and final CI/artifact read-back, executor STOPs.
One Independent Batch Auditor session can fresh-audit all Stage 1 records (R1, R2, R3, R4) separately with explicit `ACCEPT / REJECT / BLOCKED` per record. No record inherits another verdict.

`MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED`.
No merge authority, Ready transition, status reconciliation, Stage 1 completion, release or deployment is granted by this manifest.
Author must STOP after candidate natural exact-head CI and handoff for fresh Independent Manifest Audit.
