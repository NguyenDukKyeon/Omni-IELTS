# W6-STAGE1-RECOVERY-AUTH-012 — Protocol Mandatory-Field Matrix

Status: `CONTROLLING_MANIFEST_COMPANION / CANDIDATE`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` / ADR-046
Canonical authority revision: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
Technical starting predecessor: exact R1-C `c14047c74ff6499e70e06617f23b4f7161685cb2`.

If this matrix conflicts with a looser statement elsewhere in AUTH-012, the stricter fail-closed requirement controls. Any unresolved semantic conflict is `STOP / MANIFEST_CONTRADICTION`.

## Frozen prerequisite and recovery provenance

- merged owner ratification: PR #69, Independent ACCEPT `5288053871`, canonical merge/current main `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`;
- accepted prior manifest: PR #70 exact head `d29de12b8a44810d5bf8f4c19d87727d532eb894`, Independent Manifest ACCEPT `5288391297`;
- historical execution PR #71: closed/unmerged exact head `3a8e0dd665c632c62307eb4e9c0256331b7a92cb`, executor STOP `5288830546` after CI #386 GREEN-observation failure;
- rejected AUTH-011 / PR #72: closed/unmerged exact head `b16b5ffa9b07a9fc95bfe7f3d328f4fa415a7964`, Independent REJECT `5288980598`, frozen `5289363860`; no authority inherited;
- former overlapping Pilot-A PR #28: closed/unmerged historical unfinished candidate under `5289368946`; current main Today source remains blob `d63a76c3698fe572790914e687443ee38e6842b2`, so #28 source bytes are not canonical;
- exact reusable technical predecessor R1-C: `c14047c74ff6499e70e06617f23b4f7161685cb2`, natural CI #384 / run `31763393330` SUCCESS;
- R1-C verification artifact: `9205423689`, digest `sha256:a061acd340ddc3c074c7b6583a66a0ac03f341a5378b4d613e0f1a2d147e68cb`;
- R1-C browser artifacts: Core `9205436300` / `sha256:03e9307adbe32b729465d8500504784556d64f57972d8e4d92f2505ab0ff3eea`; IELTS `9205442898` / `sha256:53095b8bb238018f4179de607dd4d789131d77b1516098c47bfe67f93283bc57`; V10 `9205445299` / `sha256:e63e09620d1d0bf96f41e828cc5031699de8e754db7739167d17347645537fe3`; hardening `9205446613` / `sha256:db79148e27d6f2341af1913b5327360feb918281b475c19ffa73c417381f7578`.

## Sequential recovery boundary

AUTH-012 invokes an independently auditable sequential recovery batch:

- R2-A2 parent is literal exact R1-C `c14047c74ff6499e70e06617f23b4f7161685cb2`;
- R3-A parent is the unique exact R2-C2 produced under AUTH-012 and read back with natural SUCCESS plus artifacts;
- R4-A parent is the unique exact R3-C produced under AUTH-012 and read back with natural SUCCESS plus artifacts.

Each downstream selector must resolve to exactly one SHA. Technical chaining grants no independent/package acceptance.

## Mandatory-field matrix

| ADR-046 field | R2 Focus/Today recovery | R3 ASM recovery | R4 TD recovery |
|---|---|---|---|
| wave / record | `W6-FCS-00-01-012` | `W6-ASM-00-012` | `W6-TD-00-012` |
| canonical owner | bounded `P1-07 Today Composer` seam | `ASM-00 Frozen Assessment` | `TD-00 Targeted Diagnostic` |
| writer | `W6-STAGE1-EXECUTOR-012 / ONE_WRITER_EXCLUSIVE` | same | same |
| predecessor | literal R1-C `c14047c...` | exact resolved R2-C2 | exact resolved R3-C |
| dependency | R1 technical chain + canonical P1-07/P1-08 | canonical LI-00/QAR-00 + R2 technical state | R1 technical WeaknessProfile + R3 technical Frozen owner |
| branch | `codex/w6-stage1-recovery-exec-012` | same | same |
| PR topology | one Draft PR to `main`; starts from R1-C | same; immediately after R2-C2 | same; immediately after R3-C |
| A allowlist | only `tests/wave6-focus-today.test.mjs` | six exact frozen/QAR/persistence/backup tests named by record | only `tests/wave6-targeted-diagnostic.test.mjs` |
| B allowlist | only focus-selector + today-composer + today-planner-v2 | only frozen contracts/runtime + QAR + IELTS domain/persistence + backup registry | only `src/targeted-diagnostic.js` |
| C allowlist | exact `.../w6-fcs-00-01-012-evidence-v1.md` | exact `.../w6-asm-00-012-evidence-v1.md` | exact `.../w6-td-00-012-evidence-v1.md` |
| explicit exclusions | every other path; especially Today tests/harness are read/run-only, EvidencePolicy/FSRS/P7-04/FCS-02/new store/provider | every other path; especially EvidencePolicy/scheduler/AI key/full-mock | all dependency-owner paths read-only; no store/runtime/scheduler |
| baseline | exact R1-C CI #384 SUCCESS and corrected artifacts above | exact R2-C2 natural SUCCESS/artifacts | exact R3-C natural SUCCESS/artifacts |
| natural RED | existing Today cannot bind exactly one due-first authenticated observed-weakness Focus | existing QAR/IELTS seams lack dedicated Frozen owner/authenticated immutable scoring snapshot | explicit TD adapter capability absent with healthy prerequisites |
| RED invalidation | source mutation; module/syntax/browser/network/provider/timeout/infra/unrelated failure; wrong parent; ambiguous assertion | source mutation; uncaught module/syntax/IndexedDB/infra/unrelated failure; wrong parent; ambiguous assertion | source mutation; uncaught module/syntax/infra/prerequisite failure; wrong parent; ambiguous assertion |
| minimal GREEN | one bounded Focus seam; due-first; slot cap 1; budget/authenticated binding; no provider/scheduler/FSRS | one Frozen Assessment owner + minimum additive durability | deterministic weakness-biased adapter over existing owners |
| exact verification | focused Focus/Today tests + `npm run test:browser` + all shared PR gates | focused frozen/QAR/persistence/backup/migration suite + all shared PR gates | focused TD + dependency tests + all shared PR gates |
| evidence schema | Manifest Evidence V1 | same | same |
| evidence authority | `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` | same | same |
| migration | NONE | IELTS DB 3→4 exactly one `frozenAssessments` store; IELTS backup 3→4 where required; combined backup/registry 5→6, forward-only | NONE |
| rollback | disable/remove Focus while preserving Today/due/FSRS durable state | disable producers, retain compatible readers/store/data; never downgrade/delete | remove adapter only; preserve ASM state |
| stop conditions | record + root + matrix; any B/C GREEN failure requires new authority | same | same |
| integration rule | `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED` | same | same |
| acceptance source | canonical docs + merged #69 + accepted #70 R1 facts + R2-012 record | canonical docs + merged #69 + R3-012 record | canonical docs + merged #69 + R4-012 record |

## Exact historical R2 byte identities

Only these historical #71 byte contents are prospectively reusable:

- `tests/wave6-focus-today.test.mjs` = `904a12845e5b0127c515db86ee36b16e801514e9`;
- `src/focus-selector.js` = `fb235ce654628567fb8c19f7caed944ddd778065`;
- `src/today-composer.js` = `0135536b3775753619d5b35d814923fac500a842`;
- `src/today-planner-v2.js` = `af683fdb91b56ae56aac82069c2e013f0b441bc9`.

The replacement commits must be newly materialized under AUTH-012. Historical R2 commit identities, CI #385/#386 and any narrative RED/GREEN classification cannot satisfy replacement predicates.

## File ownership and overlap gate

For every record, all repository paths are excluded unless explicitly named in its A, B or C allowlist. Read-only inspection and running unchanged dependency tests are permitted.

Immediately before creating `codex/w6-stage1-recovery-exec-012`, and again immediately before each A/B mutation, the executor must fresh-enumerate all open PRs and all changed-file pages. Any open PR or active writer changing or claiming semantic ownership over a path in the next record's A/B/C allowlist is `STOP / OPEN_WRITER_OVERLAP`. Historical closed PRs are evidence only and are not active writers.

## Exact verification and artifact rule

A needs an eligible natural product RED; downstream gates may stop after that RED. Every B/C must obtain a natural exact-head `pull_request`/`synchronize` workflow conclusion `SUCCESS` with all applicable shared gates. Prior run, rerun, dispatch, Ready/Draft toggle, close/reopen, empty/no-op/timestamp-only commit or unrelated head cannot substitute.

Every available verification/browser artifact must be bound by exact run/head/digest in C. Missing or contradictory provenance is STOP.

## Final boundary

Independent Manifest ACCEPT activates only prospective R2-R4 execution under these predicates. It does not accept R1, accept blocked #71, accept rejected #72, accept Pilot A, merge any PR, grant package acceptance, reconcile status, declare Stage 1 complete or authorize Stage 2.
