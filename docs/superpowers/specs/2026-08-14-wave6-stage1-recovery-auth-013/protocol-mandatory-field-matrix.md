# W6-STAGE1-RECOVERY-AUTH-013 — Protocol Mandatory-Field Matrix

Status: `CONTROLLING_MANIFEST_COMPANION / CANDIDATE`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` / ADR-046
Canonical authority revision: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
Technical starting predecessor: exact successful R2-C2 `2dc10d86a6440efe1c4d8c3dc925923a27977248`.

If this matrix conflicts with a looser statement elsewhere in AUTH-013, the stricter fail-closed rule controls. Any unresolved contradiction is `STOP / MANIFEST_CONTRADICTION`.

## Frozen provenance

- merged owner ratification: PR #69 / Independent ACCEPT `5288053871` / canonical merge `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`;
- accepted predecessor authorization: AUTH-012 / PR #73 exact head `b81c7d5318f2b0ca52e9fc1532397049bfd4e908` / Independent ACCEPT `5289540896`;
- historical execution PR #74: closed/unmerged after executor STOP `5289723707`;
- exact successful R2-C2 technical predecessor: `2dc10d86a6440efe1c4d8c3dc925923a27977248`, natural CI #391 / run `31771748853` SUCCESS;
- R2-C2 artifacts: verification `9208382868` / `sha256:970262b3abaa5b301df55669a10eb0e05fe477afbb4194fc95d897adab4f8a20`; Core `9208394724` / `sha256:d98c2de836b39d32de7bd015d48f89021ac228fb85d92d7ab1bd8db42ae408f9`; IELTS `9208402896` / `sha256:744396d06a325eb4857a15116e441943124dd28c593d3001d9d86e166ccee31e`; V10 `9208405677` / `sha256:37a9746944cb6fb76377f7a485e0634ecbf238d89f9700e94c90b922f897d472`; hardening `9208407333` / `sha256:2c47c628ab48dd8605e4ca7220bf380ba726922ff15d24cb6eba077b92346631`;
- frozen invalid R3-A: `bd86bd4d12d056116da5c88f455aafc3bb21db52`, natural CI #392 / run `31771959255` FAILURE, verification `9208451619` / `sha256:25df306c1e8fc712507221f2cd4a71c89eab0f2da14e0efca2e86e7972555498`;
- invalid first cause: QAR health assertion called `hasExecutor(kind, version)` rather than canonical `hasExecutor(question)`, so healthy prerequisites were not established and the required ASM-capability absence assertion was never reached;
- invalid R3-A is `FROZEN / NOT_REUSABLE_AS_RED`.

## Sequential recovery boundary

AUTH-013 authorizes only a new prospective R3→R4 chain after exact-head independent ACCEPT:
`R2-C2 -> R3-A3 -> RED -> R3-B3 -> GREEN -> R3-C3 -> R4-A3 -> RED -> R4-B3 -> GREEN -> R4-C3`.

Every edge is direct-parent append-only. Technical chaining conveys no independent/package acceptance.

## Mandatory-field matrix

| ADR-046 field | R3 ASM recovery | R4 TD recovery |
|---|---|---|
| wave / record | `W6-ASM-00-013` | `W6-TD-00-013` |
| canonical owner | `ASM-00 Frozen Assessment` | `TD-00 Targeted Diagnostic` |
| writer | `W6-STAGE1-EXECUTOR-013 / ONE_WRITER_EXCLUSIVE` | same |
| predecessor | literal exact R2-C2 `2dc10d86...` | unique exact R3-C3 produced under AUTH-013 |
| dependency state | technical R2 branch contains canonical LI/QAR/P7/WKN/Focus semantics required by R3; no inherited acceptance | technical R1 WeaknessProfile + technical R3 Frozen/QAR; no inherited acceptance |
| branch | `codex/w6-stage1-recovery-exec-013` | same |
| PR topology | one Draft PR to `main`, branch created only after ACCEPT, starts at literal R2-C2 | same PR immediately after successful R3-C3 |
| A allowlist | only six named Frozen/QAR/IELTS/backup/migration/restore tests from R3 record | only `tests/wave6-targeted-diagnostic.test.mjs` |
| B allowlist | only frozen contracts/runtime + QAR + IELTS domain/persistence + backup registry | only `src/targeted-diagnostic.js` |
| C allowlist | exact `.../w6-asm-00-013-evidence-v1.md` | exact `.../w6-td-00-013-evidence-v1.md` |
| all-other-path exclusion | every other path; EvidencePolicy/FSRS/Today/scheduler/AI key/full mock excluded | all dependency-owner paths read-only; no second store/runtime/scheduler |
| baseline CI | R2-C2 CI #391 exact SUCCESS + five artifact identities above | exact R3-C3 natural SUCCESS + exact artifacts read back before A3 |
| natural behavioral RED | healthy QAR/IELTS prerequisites first, then dedicated Frozen owner/authenticated multi-item capability absent | healthy WeaknessProfile/QAR/Frozen prerequisites first, then TD adapter capability absent |
| mandatory R3 prerequisite predicate | register exact question executor; `registry.supports(question)===true`; **`registry.hasExecutor(question)===true`**; IELTS baseline healthy | n/a |
| RED invalidation | any prerequisite failure/API misuse including `hasExecutor(kind,version)`, source mutation, raw module/syntax/IndexedDB/dependency/infra/unrelated failure, wrong parent/path, capability already present, ambiguous first cause | unhealthy prerequisite, source mutation, raw module/syntax/dependency/infra/unrelated failure, wrong parent/path, capability already present, ambiguous first cause |
| minimal GREEN | one Frozen owner consuming QAR authority + minimum additive durability | one deterministic weakness-biased adapter over existing owners |
| verification profile | focused Frozen/QAR/persistence/backup/migration/restore suite + all shared PR gates | focused TD/progress/Frozen suite + all shared PR gates |
| evidence schema | Manifest Evidence V1 | same |
| evidence authority | `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` | same |
| artifact binding | exact B/C natural run/job/head plus every available verification/browser artifact ID+digest | same |
| migration | IELTS DB `3→4`; exactly one `frozenAssessments` store; IELTS backup `3→4`; combined backup/registry `5→6`; forward-only | NONE |
| rollback | disable producers, retain compatible reader/store/data; never downgrade/delete | remove adapter only, preserve ASM state |
| stop conditions | record + root + matrix; any invalid RED or B/C non-success requires STOP/new authority | same |
| integration rule | `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED` | same |
| canonical acceptance source | current canonical docs at `c6d790...`, merged owner ratification #69, accepted AUTH-012/R2 exact technical facts, this exact R3 record | current canonical docs, merged #69, accepted AUTH-013 R3 technical predecessor, this exact R4 record |

## Writer / overlap / race gate

Before branch creation and immediately before each A/B mutation, executor must fresh-enumerate complete open PR registry and changed-file pages. Historical #74 must remain closed/unmerged. Any open PR or active writer changing or claiming semantic ownership over the next record A/B/C path or owner boundary is `STOP / OPEN_WRITER_OVERLAP`.

Future branch `codex/w6-stage1-recovery-exec-013` and its Draft execution PR must be unique and absent before authorized creation. `main` authority drift that materially changes owner/dependency/acceptance criteria is STOP.

## Exact RED / GREEN / artifact rules

A requires eligible natural product RED only; failing CI is not sufficient. The first causal failure must match the record's explicit behavioral predicate after healthy prerequisites. Invalid RED cannot be repaired in place, reclassified narratively or reused after amendment.

Every B/C requires natural exact-head `pull_request`/`synchronize` SUCCESS with all applicable shared gates: unit tests, cross-check, roadmap audit, IELTS audit, V10 focused/audit, build, Phase4/Phase5 exact-head verification, serve/preview, Core browser, IELTS browser, V10 browser and hardening browser. Prior run/rerun/dispatch/Draft toggle/close-reopen/no-op/timestamp-only commit cannot substitute.

Every available verification/browser artifact must be bound by exact run/head/ID/digest in C. Missing or contradictory provenance is STOP.

## Final authority boundary

Independent Manifest ACCEPT of AUTH-013 conditionally activates only prospective R3→R4 execution under these predicates. It does not independently accept/package-accept R2, accept invalid R3-A, merge any PR, reconcile status, declare Stage 1 complete or authorize Stage 2/release/deployment.
