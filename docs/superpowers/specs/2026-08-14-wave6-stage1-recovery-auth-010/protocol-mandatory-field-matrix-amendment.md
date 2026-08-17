# W6-STAGE1-RECOVERY-AUTH-010 — Protocol Mandatory-Field Matrix Amendment

Status: `CONTROLLING_MANIFEST_COMPANION / CANDIDATE`
Applies to manifest: `W6-STAGE1-RECOVERY-AUTH-010`
Exact manifest predecessor: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` / ADR-046

This file is a substantive auditability amendment to the root manifest and four Package Records. It does not authorize execution by itself. If this matrix conflicts with a looser statement in another candidate file, the stricter/fail-closed requirement controls; any unresolved semantic conflict is `STOP / MANIFEST_CONTRADICTION` for the independent auditor.

## Exact canonical identity snapshot

- repository: `NguyenDukKyeon/VocabMaster`
- exact canonical commit: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
- exact canonical tree: `27031515a08a247a67e365e3e7cead10a5958cff`
- `AGENTS.md`: blob `f1abfb48723a45f826f58161c38e5b05bde8e285`
- `docs/ROADMAP.md`: blob `63671b1c366dfec22dc124ccd48fddb4b2d5ddc1`
- `docs/IMPLEMENTATION_PLAN.md`: blob `7a77a743ef70105362b1ad054896ea8c51644c2d`
- `docs/IMPLEMENTATION_STATUS.md`: blob `e7de22191b6ce320edab0b36d34c2ff9efecde5c`
- `docs/DECISIONS.md`: blob `aef37c84a54e7fff005ef6f3527a41ee6a1f722e`
- ADR-046 design artifact: blob `30825fc6794d1633d7e0aa3e498e5838562a8a29`; its historical header is subordinate to the later CONFIRMED ADR-046 in `docs/DECISIONS.md` and active bounded-capsule rules in `AGENTS.md`.
- Wave 6 boundary artifact: blob `00f680319d314bd1ceb7877c934bb598e43bf30a`
- merged downstream owner-ratification record: blob `edbbf219a70e2a1769e13678c2d5bba4d7aeba3b`, independently accepted in PR #69 comment `5288053871`, merged as exact canonical commit above.

Any pre-R1-A change to the canonical commit or any mismatch in owner/acceptance semantics requires a new authorization; tree equivalence is not a substitute for exact revision identity.

## Baseline verification identity

Natural canonical baseline:
- workflow: `CI`, workflow ID `322561862`
- run: #379 / `31759213350`
- event: `push`
- attempt: 1
- exact head: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
- conclusion: `SUCCESS`
- `verification-output`: artifact `9203940657`
- artifact digest: `sha256:6a30f2e5dcf4fbf386b8bea93f35e9a96c1102304cd02b0b0f763c739860ed8d`
- canonical baseline IELTS browser smoke: `SUCCESS`.

Historical candidate CI #380 / run `31760138137` at prior manifest head `1226eb43a221252ddb79658028ce5ba0b8222bfb` is `FAILURE` because IELTS browser smoke timed out at `retell persistence status`. All pre-browser unit/check/audit/build/Phase4/Phase5/Core-browser gates passed. That failed run is immutable historical CI evidence only and is not acceptance evidence for this amended head. No rerun is authorized. The amendment exists for the protocol defects frozen below, not to manufacture a CI event. The amended exact head must obtain its own natural `pull_request/synchronize` CI and must be audited on that exact head.

## Sequential-batch authority — explicit ADR-046 boundary

This manifest explicitly invokes ADR-046 section 10's independently auditable sequential-batch boundary. It does **not** assert that a future SHA is known before it exists. Instead, downstream predecessor identity is a conditional immutable predicate accepted in advance:

- R1 predecessor is literal exact SHA `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`.
- R2-A is authorized only if its parent equals the exact read-back R1-C SHA produced by the R1 A→RED→B→GREEN→C chain under this same accepted manifest, with R1-C natural CI SUCCESS and no path/writer violation.
- R3-A is authorized only if its parent equals the exact read-back R2-C SHA produced under the same constraints.
- R4-A is authorized only if its parent equals the exact read-back R3-C SHA produced under the same constraints.

Immediately before each downstream A, the executor must persist the resolved predecessor SHA, parent, changed-path set, source/test blob witnesses, natural CI run/job/attempt/head and artifact digest into its execution notebook/output and later C evidence. If the selector resolves to zero or more than one eligible SHA, or the immediately preceding record has any unresolved technical failure, execution is `STOP / CONDITIONAL_PREDECESSOR_UNRESOLVED`.

Sequential execution is permission to obtain independently auditable technical evidence only. It is not acceptance inheritance. Final independent audit must verdict R1/R2/R3/R4 separately. A later record can be technically exercised before final batch verdict only under this conditional chain, but if any prerequisite receives `REJECT` or `BLOCKED`, every dependent record is ineligible for package acceptance and integration.

## Protocol mandatory-field matrix

| ADR-046 field | R1 P7/WKN | R2 Focus/Today | R3 ASM | R4 TD |
|---|---|---|---|---|
| wave / record | `W6-P7-00-WKN-SUCC-010` | `W6-FCS-00-01-010` | `W6-ASM-00-010` | `W6-TD-00-010` |
| canonical owner | `P7-00` / WKN absorbed | bounded `P1-07 Today Composer` seam | `ASM-00 Frozen Assessment` | `TD-00 Targeted Diagnostic` |
| writer | `W6-STAGE1-EXECUTOR-010 / ONE_WRITER_EXCLUSIVE` | same | same | same |
| predecessor | literal `c6d790e0...` | exact resolved R1-C predicate above | exact resolved R2-C predicate above | exact resolved R3-C predicate above |
| dependency state | P1-02/P1-08 + canonical events | R1 technical GREEN + P1-07/P1-08 | canonical LI-00/QAR-00 semantics | R1 technical shape + R3 technical GREEN |
| branch | `codex/w6-stage1-recovery-exec-010` | same | same | same |
| PR topology | one Draft PR to `main`; R1 A/B/C first | same PR; immediately after R1-C | same PR; immediately after R2-C | same PR; immediately after R3-C |
| A allowlist | `tests/progress.test.mjs` | 3 Focus/Today tests + `scripts/browser-smoke.mjs` harness | 6 frozen/persistence/backup tests | `tests/wave6-targeted-diagnostic.test.mjs` |
| B allowlist | progress + reducer + weakness only | focus-selector + today-composer + today-planner-v2 only | 6 exact ASM/QAR/persistence source paths | `src/targeted-diagnostic.js` only |
| C allowlist | exact R1 evidence V1 path | exact R2 evidence V1 path | exact R3 evidence V1 path | exact R4 evidence V1 path |
| explicit exclusions | every path not expressly in R1 A/B/C; especially persistence/Today/FSRS/AI | every path not expressly in R2 A/B/C; especially EvidencePolicy/FSRS/P7-04/FCS-02/new store | every path not expressly in R3 A/B/C; especially EvidencePolicy/scheduler/AI key/full-mock | every path not expressly in R4 A/B/C; all dependency owners read-only |
| baseline CI | #379 exact canonical baseline | exact resolved R1-C natural SUCCESS | exact resolved R2-C natural SUCCESS | exact resolved R3-C natural SUCCESS |
| natural RED | canonical nested evidence projection mismatch through existing progress seam | existing Today cannot produce exact due-first observed-weakness Focus binding | existing QAR/IELTS seams lack dedicated Frozen owner/authenticated scoring snapshot capability | explicit TD adapter capability absent with healthy prerequisites |
| RED invalidation | source mutation; missing-module/syntax/infra/fixture/unrelated failure; weak/ambiguous assertion | source mutation; browser/network/provider/timeout/infra/unrelated failure; wrong parent; weak/ambiguous assertion | source mutation; module/syntax/IDB/infra/unrelated failure; wrong parent; weak/ambiguous assertion | source mutation; uncaught module/syntax/infra/prerequisite failure; wrong parent; ambiguous assertion |
| minimal GREEN | deterministic metrics + WeaknessProfile only | one bounded Focus seam, no scheduler/FSRS/provider/P7-04 | one Frozen Assessment owner + minimum additive durability | one deterministic TD adapter, no store/runtime/schedule/evidence authority |
| exact verification profile | focused R1 test + all shared PR gates | focused R2 tests + browser + all shared PR gates | focused R3 migration/restore suite + all shared PR gates | focused R4 + dependency tests + all shared PR gates |
| evidence schema | Manifest `Evidence V1` | same | same | same |
| evidence authority | `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` | same | same | same |
| migration | NONE | NONE | IELTS DB 3→4, frozenAssessments; IELTS backup 3→4; combined backup/registry 5→6, forward-only | NONE |
| rollback | remove projection without raw-event transform | disable/remove Focus, preserve due/FSRS/Today durable data | compatible reader/disable producer; never downgrade/delete durable rows | remove adapter only; preserve ASM rows |
| stop conditions | exact R1 record + root + this matrix | exact R2 record + root + this matrix | exact R3 record + root + this matrix | exact R4 record + root + this matrix |
| integration rule | `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED` | same | same | same |
| acceptance source | canonical blob snapshot above + R1 record | canonical blob snapshot + merged #69 + R2 record | canonical blob snapshot + merged #69 + R3 record | canonical blob snapshot + merged #69 + R4 record |

## Exact exclusions and file ownership

For every record, **all repository paths are excluded unless explicitly present in that record's A, B or C allowlist**. Read-only inspection of dependencies is permitted. The following classes are always excluded from mutation across the whole execution unless an exact record allowlist names the path:

- `.github/**`, `package.json`, `package-lock.json`, dependency manifests/lockfiles;
- `AGENTS.md`, canonical roadmap/plan/status/decisions, authorization manifests and owner-ratification records;
- server/deploy/release configuration;
- content packs/catalogs and learner fixtures outside named tests;
- unrelated `src/**`, `tests/**`, `scripts/**`, `docs/**`;
- any historical PR branch or evidence file.

An allowlisted path may be touched only in its designated A/B/C phase. Cross-record borrowing of an allowlist is forbidden.

## Exact verification and artifact rule

For A, eligible RED is the first causal product assertion under the record predicate. The full workflow may stop after that RED; A does not need downstream green gates. For every B and C, the natural exact-head PR workflow must conclude `SUCCESS` and run every applicable shared gate frozen by the root manifest. The B `verification-output` artifact and any browser artifacts produced by the workflow must be bound by run/head/digest in C evidence; C must bind its own final run/artifacts likewise.

A prior green run at another SHA, a rerun, dispatch, Ready/Draft toggle, close/reopen, empty/no-op/timestamp-only commit or historical #66/#68 evidence cannot substitute.

## Final authority boundary

Independent Manifest ACCEPT of the amended exact head activates only the conditional execution authority above. It does not merge this docs PR, merge any execution PR, grant package acceptance, accept local recovery bytes, reconcile status, declare Stage 1 complete, or authorize Stage 2. Those transitions remain separately evidenced and independently governed.