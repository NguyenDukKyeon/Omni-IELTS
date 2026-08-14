# W6-STAGE1-RECOVERY-AUTH-013

Status: `DOCS_ONLY_RECOVERY_AUTHORIZATION_CANDIDATE / NOT_SELF_ACCEPTING`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Recovery scope: `R3 -> R4 only`

## Authority and exact repository state

Repository: `NguyenDukKyeon/VocabMaster`
Canonical authority revision / PR base: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
Canonical owner ratification: merged PR #69 / independent ACCEPT `5288053871`.
Prior accepted manifest: `W6-STAGE1-RECOVERY-AUTH-012`, PR #73 exact head `b81c7d5318f2b0ca52e9fc1532397049bfd4e908`, Independent Manifest ACCEPT `5289540896`.

Historical execution PR #74 is frozen closed/unmerged. It successfully completed R2 and then stopped on an invalid R3-A RED. No R3 source or R4 mutation occurred.

## Exact successful technical predecessor retained

The ONLY eligible technical predecessor for this recovery is R2-C2:
`2dc10d86a6440efe1c4d8c3dc925923a27977248`

R2-C2 parent R2-B2:
`c84f243b4550c786082f46e9fae837b278fc3133`

R2-A2:
`d1282afbdb4bec38626964438760a91c6214d0d5`

R2 fresh RED:
- CI #389 / run `31771384877` / exact R2-A2;
- `verification-output` artifact `9208258257` / `sha256:eb6127c8f11ddfe6414527381f43129cc55758ece39e188f683eb0ebb9d4f12d`;
- raw totals `918 / 917 pass / 1 fail`;
- sole behavioral failure: `existing Today path must bind exactly one observed weakness Focus row`, expected 1 actual 0.

R2-B2 fresh GREEN:
- CI #390 / run `31771537006` / SUCCESS;
- verification `9208311351` / `sha256:3228dd8f65f2313a6ffecf067524b815f41b4b079ad151b45e94794f693077bc`;
- Core `9208323411` / `sha256:e7e82a2b9783ff3efca3d4672ac5ef575e8b6ca5320baf5ccf6c118eb54f02f7`;
- IELTS `9208330415` / `sha256:8ffecbdcf0f34d185fe5cb1e44cb8cf3a657e85c1776377b548906d56ea2fcf0`;
- V10 `9208333159` / `sha256:5365a3d75f2e10381be09ed718091e3d6239d8efd461b19974b6e06ac41456b4`;
- hardening `9208334606` / `sha256:2f2af63b7b427a1e9e9a91ddc179efc54dee955816fd5471fadca1265f965603`.

R2-C2 natural exact-head baseline:
- CI #391 / run `31771748853` / SUCCESS;
- verification `9208382868` / `sha256:970262b3abaa5b301df55669a10eb0e05fe477afbb4194fc95d897adab4f8a20`;
- Core `9208394724` / `sha256:d98c2de836b39d32de7bd015d48f89021ac228fb85d92d7ab1bd8db42ae408f9`;
- IELTS `9208402896` / `sha256:744396d06a325eb4857a15116e441943124dd28c593d3001d9d86e166ccee31e`;
- V10 `9208405677` / `sha256:37a9746944cb6fb76377f7a485e0634ecbf238d89f9700e94c90b922f897d472`;
- hardening `9208407333` / `sha256:2c47c628ab48dd8605e4ca7220bf380ba726922ff15d24cb6eba077b92346631`.

R2-C2 is technical predecessor/evidence only. This manifest does not independently accept or package-accept R2.

## Frozen invalid R3-A

Historical invalid R3-A:
`bd86bd4d12d056116da5c88f455aafc3bb21db52`
parent exact R2-C2.

Natural CI #392 / run `31771959255`: FAILURE.
`verification-output` artifact `9208451619`, digest `sha256:25df306c1e8fc712507221f2cd4a71c89eab0f2da14e0efca2e86e7972555498`.
Raw totals: `919 tests / 918 pass / 1 fail`.

Invalid first cause:
`existing QAR registry prerequisite must be healthy`, expected `true`, actual `false`.
The test incorrectly called canonical QAR `hasExecutor(kind, version)` even though the canonical API is `hasExecutor(question)`.

Classification: `INVALID_R3_A_RED / TEST_PREDICATE_DEFECT / FROZEN / NOT_REUSABLE_AS_RED`.
No amend, rebase, cherry-pick, rerun, toggle or history rewrite may convert it into valid evidence.

## Writer and replacement topology

Designated writer: `W6-STAGE1-EXECUTOR-013 / ONE_WRITER_EXCLUSIVE`.
Future branch: `codex/w6-stage1-recovery-exec-013`.
Exactly one Draft execution PR to `main`.
Branch must not exist before independently accepted AUTH-013 execution begins.

Exact prospective topology:
`R2-C2 -> R3-A3 -> natural RED -> R3-B3 -> natural GREEN -> R3-C3 -> R4-A3 -> natural RED -> R4-B3 -> natural GREEN -> R4-C3`

Every edge is direct-parent, append-only. No amend/rebase/squash/force/reset/merge-from-main. All other paths excluded.

## Corrected R3 RED predicate

R3-A3 must establish healthy existing prerequisites before checking ASM absence:
1. construct two authentic owner-verified QAR questions from existing canonical adapters;
2. create canonical question registry;
3. `registerExecutor(question.kind, question.version, question.requiredCapabilities)`;
4. assert `registry.supports(question) === true`;
5. assert **`registry.hasExecutor(question) === true`**;
6. build/read existing IELTS backup/persistence baseline successfully;
7. only then controlled-dynamic-import the new ASM modules, catching only expected `ERR_MODULE_NOT_FOUND`;
8. eligible RED is the explicit assertion that dedicated Frozen Assessment owner capability is absent.

Any prerequisite failure, raw module/syntax error, fixture/dependency/IndexedDB/infra failure, unrelated test failure, already-passing capability, wrong parent/path or source delta invalidates RED and requires STOP before B.

## Package records

- `W6-ASM-00-013`: see `w6-asm-00-013.md`.
- `W6-TD-00-013`: see `w6-td-00-013.md`.
- mandatory-field freeze: `protocol-mandatory-field-matrix.md`.

R4 is inactive until exact R3-C3 has natural SUCCESS CI and artifact digests read back.

## Open-writer and race gates

Before R3-A3 and again before R4-A3:
- fresh-read current `main` and verify canonical authority has not materially drifted;
- enumerate complete open PR registry and changed paths;
- historical #74 must remain closed/unmerged;
- no open writer/PR may overlap any R3/R4 test/source/evidence path or ownership boundary;
- future branch/PR identity must be unique;
- accepted AUTH-013 exact head/comment must be read back.

Any overlap/identity ambiguity => STOP with zero further mutation.

## Shared GREEN profile

Every B and C natural exact-head `pull_request`/`synchronize` CI must conclude SUCCESS for applicable repository gates: npm tests, cross-check, roadmap audit, IELTS audit, V10 focused/audit, build, Phase4/Phase5 exact-head verification, serve/preview, Core browser, IELTS browser, V10 browser, hardening browser. Artifact IDs/digests must be read back and bound in evidence.

No workflow/dependency mutation is authorized.

## Evidence and acceptance boundary

R3-C3 exact evidence path:
`docs/superpowers/specs/2026-08-14-wave6-stage1-exec-013/w6-asm-00-013-evidence-v1.md`

R4-C3 exact evidence path:
`docs/superpowers/specs/2026-08-14-wave6-stage1-exec-013/w6-td-00-013-evidence-v1.md`

Evidence authority: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.
Final exact head requires fresh independent implementation/batch audit. Executor cannot accept/package-accept its own work.

## Global exclusions

No FCS-02, P7-04 activation, readiness, band estimate, mastery, representative/full mock, AI scoring/key authority, second scheduler, second assessment store/runtime, EvidencePolicy/FSRS authority change, dependency/CI change, Ready transition, canonical status reconciliation, merge, Stage 1 completion, Stage 2 authority, release or deployment.

## Migration / rollback

R3 migration is forward-only additive IELTS DB `3 -> 4`, IELTS backup `3 -> 4`, combined backup/registry `5 -> 6`, exactly one `frozenAssessments` store and required indexes; preserve all prior data and legacy upgrade compatibility. No downgrade/store deletion/destructive reset.
R4 migration: NONE.

Before future integration, rollback is discard/revert recovery chain. After accepted integration, disable producers while retaining compatible durable readers/store/backup; never downgrade DB or delete rows.

## STOP and integration

STOP on any authority drift, wrong predecessor, overlap, second writer, invalid RED, source-before-valid-RED, A mutation, unexpected path, migration ambiguity, B/C non-success including infrastructure failure, artifact contradiction, or acceptance inference.

`MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED`.
No merge authority is granted by this candidate.
Author must STOP after candidate natural exact-head CI and handoff for fresh Independent Manifest Audit.
