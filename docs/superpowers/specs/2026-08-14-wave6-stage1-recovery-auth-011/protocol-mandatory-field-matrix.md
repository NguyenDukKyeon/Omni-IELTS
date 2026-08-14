# W6-STAGE1-RECOVERY-AUTH-011 — Protocol Mandatory-Field Matrix

Status: `CONTROLLING_MANIFEST_COMPANION / CANDIDATE`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` / ADR-046
Canonical authority revision: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
Technical starting predecessor: exact R1-C `c14047c74ff6499e70e06617f23b4f7161685cb2`.

If this matrix conflicts with a looser statement elsewhere in AUTH-011, the stricter fail-closed requirement controls. Any unresolved semantic conflict is `STOP / MANIFEST_CONTRADICTION`.

## Frozen prerequisite and recovery provenance

- merged owner ratification: PR #69, Independent ACCEPT `5288053871`, canonical merge/main `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`;
- accepted prior manifest: PR #70 exact head `d29de12b8a44810d5bf8f4c19d87727d532eb894`, Independent Manifest ACCEPT `5288391297`;
- historical execution PR #71: closed/unmerged, exact frozen head `3a8e0dd665c632c62307eb4e9c0256331b7a92cb`, executor STOP `5288830546`;
- blocked run: CI #386 / `31764547899` / attempt 1 / `pull_request`, failure `INFRASTRUCTURE_FAILURE / READINESS_TIMEOUT` during Phase 4 browser readiness; this run is not GREEN and cannot be rerun/reused;
- exact reusable technical predecessor R1-C: `c14047c74ff6499e70e06617f23b4f7161685cb2`, natural CI #384 / `31763393330` SUCCESS, artifact `9205444163`, digest `sha256:a061acd3422245033a8311e80f4c1b46499d50464d17e22d4309a0f21fcfe549`.

## Sequential recovery boundary

AUTH-011 invokes an independently auditable sequential recovery batch:

- R2-A2 parent is literal exact R1-C `c14047c74ff6499e70e06617f23b4f7161685cb2`;
- R3-A parent is the unique exact R2-C2 produced under AUTH-011 and read back with natural SUCCESS/artifact;
- R4-A parent is the unique exact R3-C produced under AUTH-011 and read back with natural SUCCESS/artifact.

Each downstream selector must resolve to exactly one SHA. Technical chaining grants no independent/package acceptance.

## Mandatory-field matrix

| ADR-046 field | R2 Focus/Today recovery | R3 ASM recovery | R4 TD recovery |
|---|---|---|---|
| wave / record | `W6-FCS-00-01-011` | `W6-ASM-00-011` | `W6-TD-00-011` |
| canonical owner | bounded `P1-07 Today Composer` seam | `ASM-00 Frozen Assessment` | `TD-00 Targeted Diagnostic` |
| writer | `W6-STAGE1-EXECUTOR-011 / ONE_WRITER_EXCLUSIVE` | same | same |
| predecessor | literal R1-C `c14047c...` | exact resolved R2-C2 | exact resolved R3-C |
| dependency | R1 technical chain + P1-07/P1-08 | canonical LI-00/QAR-00 + R2 technical state | R1 technical WeaknessProfile + R3 technical Frozen owner |
| branch | `codex/w6-stage1-recovery-exec-011` | same | same |
| PR | one Draft PR to `main`; starts from R1-C | same; immediately after R2-C2 | same; immediately after R3-C |
| A allowlist | `tests/wave6-focus-today.test.mjs`; optional existing Focus/Today harness paths only if record names them | six frozen/QAR/persistence/backup tests named by record | `tests/wave6-targeted-diagnostic.test.mjs` |
| B allowlist | focus-selector + today-composer + today-planner-v2 only | frozen contracts/runtime + QAR + IELTS domain/persistence + backup registry only | `src/targeted-diagnostic.js` only |
| C allowlist | exact `.../w6-fcs-00-01-011-evidence-v1.md` | exact `.../w6-asm-00-011-evidence-v1.md` | exact `.../w6-td-00-011-evidence-v1.md` |
| exclusions | all other paths; especially EvidencePolicy/FSRS/P7-04/FCS-02/new store/provider | all other paths; especially EvidencePolicy/scheduler/AI key/full-mock | every dependency-owner path read-only; no store/runtime/scheduler |
| baseline | exact R1-C CI #384 SUCCESS/artifact | exact R2-C2 natural SUCCESS/artifact | exact R3-C natural SUCCESS/artifact |
| RED | existing Today cannot bind exactly one due-first authenticated observed-weakness Focus | existing QAR/IELTS seams lack dedicated Frozen owner/authenticated frozen scoring snapshot | explicit TD adapter capability absent with healthy prerequisite fixtures |
| RED invalidation | source mutation; timeout/network/browser/provider/module/syntax/infra/unrelated failure; wrong parent; ambiguous assertion | source mutation; uncaught module/syntax/IndexedDB/infra/unrelated failure; wrong parent; ambiguous assertion | source mutation; uncaught module/syntax/infra/prerequisite failure; wrong parent; ambiguous assertion |
| minimal GREEN | one bounded Focus seam; due-first; slot cap 1; budget; no provider/scheduler/FSRS | one Frozen Assessment owner + minimum additive durability | deterministic weakness-biased adapter over existing owners |
| verification | focused Focus/Today tests + all shared CI/browser gates | focused frozen/QAR/persistence/backup/migration suite + all shared gates | focused TD + dependency tests + all shared gates |
| evidence schema | Manifest Evidence V1 | same | same |
| evidence authority | `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` | same | same |
| migration | NONE | IELTS DB 3→4 with exactly one frozenAssessments store; IELTS backup 3→4; combined backup/registry 5→6, forward-only | NONE |
| rollback | remove/disable Focus while preserving existing Today/due/FSRS durable state | disable producers, retain compatible readers/store/data; never downgrade/delete | remove adapter only; preserve ASM state |
| stop | record + root + this matrix; any GREEN failure requires new authority | same | same |
| integration | `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED` | same | same |
| acceptance source | canonical docs + merged #69 + accepted #70 R1 facts + R2-011 record | canonical docs + merged #69 + R3-011 record | canonical docs + merged #69 + R4-011 record |

## Explicit blocked-byte reuse rule

Historical #71 remains frozen. AUTH-011 permits **content reuse only**, prospectively, of the exact R2 test/source blobs enumerated in the root manifest. The new R2-A2 and R2-B2 must be new commits on the new branch with fresh natural RED/GREEN. Old commit identities, CI #385/#386 and any narrative classification cannot satisfy replacement predicates. No R2-C evidence from #71 exists and none may be fabricated.

## Exact verification and artifact rule

A needs an eligible natural product RED; later gates may stop after that RED. Every B/C must obtain a natural exact-head `pull_request/synchronize` workflow conclusion `SUCCESS` with all applicable shared gates. Prior run, rerun, dispatch, Ready/Draft toggle, close/reopen, empty/no-op/timestamp-only commit or unrelated head cannot substitute. Every available verification/browser artifact must be bound by exact run/head/digest in C.

## Final boundary

Independent Manifest ACCEPT activates only prospective R2-R4 execution under these predicates. It does not accept R1, accept blocked #71, merge any PR, grant package acceptance, reconcile status, declare Stage 1 complete or authorize Stage 2.