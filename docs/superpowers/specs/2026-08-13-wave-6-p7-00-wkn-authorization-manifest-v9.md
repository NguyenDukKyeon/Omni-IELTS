# W6-P7-00-WKN-AUTH-009 — Verification and Cross-Surface Recovery Authorization Manifest

## Manifest Identity

- **Authorization ID**: `W6-P7-00-WKN-AUTH-009`
- **Execution Record ID**: `W6-P7-00-WKN-EXEC-009`
- **Protocol**: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
- **Schema**: `WAVE_AUTHORIZATION_MANIFEST_V1`
- **Implementation Subject**: `P7-00 / WKN-00`
- **State**: `DRAFT_AUTHORIZATION_CANDIDATE`
- **Implementation authorization**: `NOT_ACTIVE_PENDING_INDEPENDENT_MANIFEST_ACCEPT`
- **Independent implementation acceptance**: `NOT_GRANTED`
- **Package acceptance**: `NOT_GRANTED`
- **Merge authority**: `NOT_GRANTED`

This is a docs-only recovery authorization candidate. It does not implement P7-00/WKN-00 and does not accept any implementation.

## Historical Recovery Boundary

### Accepted historical authorization

`W6-P7-00-WKN-AUTH-008` / PR #63 remains historical `MANIFEST_ACCEPTED / EXACT_HEAD_ONLY` for **EXEC-008 only**:

- accepted authorization head: `5ff6b2e2414c59332566f21dbe54016ff82d4af8`
- manifest blob: `35113d83726024962bf70a2c07e2f51d42658745`
- Independent Manifest ACCEPT: comment `5270925476`

AUTH-008 does not authorize EXEC-009.

### Rejected historical execution

`W6-P7-00-WKN-EXEC-008` / PR #64 is historical:

`FROZEN / REJECTED / DO_NOT_MERGE / DO_NOT_MODIFY / DO_NOT_REUSE`

at exact audited head:

`10bc363fd3c8aa315241b21c14fb528d95f5f6a4`

under controlling Independent Implementation REJECT:

comment `5274777407`.

The controlling audit recorded the A/natural-RED, B/GREEN+artifact, and C/evidence-only mechanics as valid, but rejected EXEC-008 for two independent blockers:

1. `CRITICAL: FROZEN_VERIFICATION_PROFILE_INCOMPLETE / EXACT_PHASE0_GATE_NOT_EXECUTED`
2. `HIGH: CANONICAL_P7_00_MANDATORY_TEST_MATRIX_INCOMPLETE / CORE_IELTS_V10_TOTALS_NOT_TESTED`

Historical EXEC-008 commits, test bytes, source bytes and evidence bytes are audit history only. They MUST NOT be cherry-picked, copied as accepted implementation, amended, force-updated or treated as package acceptance. Fresh EXEC-009 implementation must be authored from the exact predecessor under this authorization after independent manifest ACCEPT.

AUTH-007 / PR #62, EXEC-006 / PR #61, and earlier rejected P7-00/WKN candidates remain frozen under their controlling historical verdicts. This candidate does not revive them.

## Recovery Interpretation

### Blocker 1 — exact verification identity

AUTH-008 froze `npm run phase0:gate` even though canonical P7-00 acceptance criteria do not name that command and the repository's natural PR workflow does not execute it. EXEC-008 then lacked the exact command evidence that its own manifest required.

AUTH-009 corrects the authorization defect by freezing the **actual natural exact-head CI command profile** defined in `.github/workflows/ci.yml` at the exact predecessor. It does not claim that the constituent commands are equivalent to `npm run phase0:gate`; rather, `npm run phase0:gate` is **not an EXEC-009 acceptance requirement**.

No future EXEC-009 report may claim that `npm run phase0:gate` ran unless raw evidence independently proves it. Such a run, if performed voluntarily, is supplementary only and is not required for AUTH-009 compliance.

This is not permission to modify CI, package scripts, dependencies or Phase-0 release policy.

### Blocker 2 — Core / IELTS / V10 test matrix

AUTH-009 expands the immutable Commit-A acceptance test contract so the P7-00 projection must exercise canonical Core, IELTS and V10 events explicitly and reconcile them honestly.

The matrix MUST preserve current canonical EvidencePolicy semantics. It MUST NOT fabricate positive V10 evidence or flatten domain-specific evidence boundaries merely to make totals look uniform.

## Protocol Mandatory-Field Matrix

| # | Protocol field | Frozen value/source |
|---|---|---|
| 1 | wave/package identity | `W6-P7-00-WKN-EXEC-009` / `P7-00 / WKN-00` |
| 2 | canonical owner | `P7-00` |
| 3 | exact predecessor | `66666172238668b1ea40d7ff596c82c209fcdfe5` |
| 4 | dependency state | `P7-00=NEXT`, `P1-02=ACCEPTED`, `P1-08=ACCEPTED` |
| 5 | writer identity | `P7-00 / WKN-00 Bounded Implementer` |
| 6 | writer exclusivity | `ONE_WRITER_EXCLUSIVE` |
| 7 | implementation branch topology | exact section below |
| 8 | implementation PR topology | exact section below |
| 9 | exact source allowlist | exact section below |
| 10 | exact test allowlist | `tests/progress.test.mjs` only |
| 11 | explicit exclusions | exact section below |
| 12 | baseline CI identity | CI #361 / run `31623561426` / workflow ID `322561862` / push / success |
| 13 | test-first rule | Commit A test-only |
| 14 | Natural RED predicate | canonical nested Core evidence behavioral RED through existing progress seam |
| 15 | RED invalidation predicates | exact section below |
| 16 | minimal GREEN boundary | Commit B source-only, immutable Commit-A tests |
| 17 | exact verification profile | exact natural-CI commands and evidence below; `phase0:gate` explicitly not required |
| 18 | evidence path | `docs/superpowers/specs/2026-08-13-wave-6-p7-00-wkn-exec-009-evidence.md` |
| 19 | evidence file allowlist | exact evidence path only at C |
| 20 | evidence schema/version | `W6_P7_00_WKN_EXEC_EVIDENCE_V3` |
| 21 | evidence authority label | `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` |
| 22 | implementation-subject binding | `P7-00 / WKN-00` |
| 23 | Commit A/B/C bindings | exact section below |
| 24 | RED CI binding | workflow `CI`, ID `322561862`, natural `pull_request`, exact A |
| 25 | GREEN CI binding | workflow `CI`, ID `322561862`, natural `pull_request`, exact B |
| 26 | artifact policy | `verification-output` required at GREEN with exact artifact ID/digest/run/head |
| 27 | migration obligations | exact section below |
| 28 | rollback obligations | exact section below |
| 29 | stop conditions | exact section below |
| 30 | integration rule | `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED` |
| 31 | canonical acceptance-criteria source | `docs/IMPLEMENTATION_PLAN.md` / `### P7-00 — Canonical learning metrics reducer` / blob `7a77a743ef70105362b1ad054896ea8c51644c2d` |

Missing or mismatched fields are not inferred.

## Exact Predecessor and Baseline

- **Exact Implementation Predecessor**: `66666172238668b1ea40d7ff596c82c209fcdfe5`
- **Exact predecessor tree**: `d67b728e8e312bc4ad1d7700a4cc3a353aff1756`
- **Canonical status blob**: `docs/IMPLEMENTATION_STATUS.md` blob `e7de22191b6ce320edab0b36d34c2ff9efecde5c`
- **Canonical implementation-plan blob**: `docs/IMPLEMENTATION_PLAN.md` blob `7a77a743ef70105362b1ad054896ea8c51644c2d`
- **Repository rules blob**: `AGENTS.md` blob `f1abfb48723a45f826f58161c38e5b05bde8e285`
- **Baseline CI**: workflow `CI`, workflow ID `322561862`, run #361, run ID `31623561426`, event `push`, exact head `66666172238668b1ea40d7ff596c82c209fcdfe5`, attempt 1, conclusion `success`.

At executor Stage 0, `origin/main` MUST still equal the exact predecessor. Any movement is:

`STOP / PREDECESSOR_DRIFT`.

Tree equivalence is not a substitute for exact revision identity.

## Canonical State and Scope

At the exact predecessor:

- `P7-00` = `NEXT`
- `P1-02` = `ACCEPTED`
- `P1-08` = `ACCEPTED`
- ADR-048 = `CONFIRMED`
- `WKN-00` is canonically absorbed into `P7-00`
- ADR-048 does not itself grant implementation authority
- `P7-01..P7-05` remain outside this capsule
- `FCS-00`, `FCS-01`, `FCS-02`, `ASM-00`, `TD-00`, readiness, band estimation and downstream personalization remain outside this capsule
- `U-FD` remains grouping-only and is not an owner.

AUTH-009 grants no authority for Focus, assessment, targeted diagnostics, P7-01+, FSRS tuning, Today scheduling changes or UI work.

## Writer / Branch / PR Topology

- **Writer role**: `P7-00 / WKN-00 Bounded Implementer`
- **Writer mode**: `ONE_WRITER_EXCLUSIVE`
- **Future implementation branch**: `codex/p7-00-metrics-reducer-exec-009`
- **Branch origin**: exact predecessor `66666172238668b1ea40d7ff596c82c209fcdfe5`
- Exactly one future implementation PR, Draft, head `codex/p7-00-metrics-reducer-exec-009`, base `main`.
- Exact implementation lineage: predecessor → Commit A test-only → Commit B minimal GREEN → Commit C evidence-only.
- A parent = exact predecessor.
- B parent = A.
- C parent = B.

Historical branches `codex/p7-00-metrics-reducer` and `codex/p7-00-metrics-reducer-exec-008` MUST NOT be reused, updated or cherry-picked.

Forbidden execution mechanics:

- B2 or C2 repair commit
- amend
- rebase
- squash during execution
- merge-from-main
- destructive reset
- force-push or force-with-lease
- empty/no-op commit
- timestamp-only CI trigger
- Draft/Ready toggle to manufacture an event
- close/reopen to manufacture an event
- workflow dispatch
- manual rerun as substitute evidence.

An accidental bad execution commit causes STOP; history is preserved and a new recovery authority is required.

## Exact Mutation Allowlist

### Commit A — TEST only

- `[MODIFY] tests/progress.test.mjs`

### Commit B — SOURCE only

- `[MODIFY] src/progress.js`
- `[NEW] src/p7-00-metrics-reducer.js`
- `[NEW] src/weakness-profile.js`

A new source file is optional unless actually needed. An allowlisted path must not be created merely to satisfy the manifest shape.

### Commit C — EVIDENCE only

- `[NEW] docs/superpowers/specs/2026-08-13-wave-6-p7-00-wkn-exec-009-evidence.md`

No other mutation is authorized.

## Read-Only Dependencies

The executor may read but MUST NOT mutate:

- `src/event-repository.js` — canonical event construction and validation
- `src/learning-contracts.js` — canonical target/envelope contracts and `learningContractDigest`
- `src/schedule-gateway.js` — Core canonical evidence envelope
- `src/evidence-policy.js` — canonical eligibility/reason semantics
- `src/ielts-domain.js` — IELTS canonical envelope builder
- `src/v10-contracts.js` — V10 coaching canonical envelope builder
- `src/persistence.js` — canonical event reader
- `src/fsrs-scheduler.js`
- all canonical governance documents.

## Explicit Exclusions

Forbidden from mutation during EXEC-009:

- `src/app.js`
- `src/main.js`
- `src/persistence.js`
- `src/persistence-core.js`
- `src/event-repository.js`
- `src/learning-contracts.js`
- `src/schedule-gateway.js`
- `src/evidence-policy.js`
- `src/ielts-domain.js`
- `src/v10-contracts.js`
- `src/fsrs-scheduler.js`
- all other non-allowlisted `src/**`
- all other non-allowlisted `tests/**`
- `.github/**`
- `package.json`
- `package-lock.json`
- `server/**`
- `public/**`
- `content-repo/**`
- all canonical governance docs
- all authorization manifests
- all `docs/**` except exact EXEC-009 evidence path at Commit C.

If an excluded mutation becomes necessary:

`STOP / ALLOWLIST_EXPANSION_REQUIRED`.

## Canonical Fixture Strategy

Commit A must build canonical events only through existing predecessor production contract APIs. Synthetic flat objects are insufficient for new P7-00 acceptance coverage.

### Core canonical fixture

Use:

`buildCoreEvidenceEnvelope(...)` → `decideEvidence(...)` → `buildLearningEventRecords(...)` → select `eventType === 'evidence-decided'`.

The fixture must be source-verified/qualified according to the current Core gateway and must produce a canonical event whose decision is `eligible === true`.

### IELTS canonical fixture

Use:

`buildIeltsEvidenceEnvelope(...)` → use its returned canonical `decision` → `buildLearningEventRecords(...)` → select `eventType === 'evidence-decided'`.

The controlled fixture must use a verified IELTS source, an authoritative complete `ielts-lab` assistance trace without exposure, a valid known activity and a complete target. The fixture must assert its canonical envelope validates and its current decision is positively eligible before the reducer test treats it as denominator evidence.

The fixture source namespace must be explicit and stable, for example a controlled `ielts-source:*` source id. If current production contracts no longer produce eligible evidence under those conditions, executor MUST STOP before source mutation:

`STOP / IELTS_FIXTURE_SEMANTICS_DRIFT`.

### V10 canonical fixture

Use:

`buildV10CoachingEnvelope(...)` → use its returned canonical `decision` → `buildLearningEventRecords(...)` → select `eventType === 'evidence-decided'`.

Current V10 sentence-loop coaching is deliberately assistance-exposed/coaching-only. Commit A must assert the actual current decision is ineligible and preserve its exact current reason semantics; it MUST NOT rewrite or forge the event to become positive learning evidence.

The controlled fixture must use an explicit stable `v10-source:*` source id and verified sentence source. If current V10 production semantics materially differ at Stage 0, executor MUST STOP before source mutation:

`STOP / V10_FIXTURE_SEMANTICS_DRIFT`.

### Canonical event validation

Every controlled Core/IELTS/V10 `evidence-decided` record used by the P7-00 test matrix must pass existing `validateLearningEventRecord(...)` semantics. Any fixture whose canonical validation fails invalidates the RED setup.

A flat legacy object such as `{ rating, skill, evidenceType, metadata }` is invalid for this new cross-surface acceptance matrix.

## Commit A — Immutable Test-First Contract

Commit A may change only `tests/progress.test.mjs`.

The **first failing cause** against the exact predecessor must remain a natural product-behavior mismatch through an existing predecessor API, not a missing future module/export. The preferred first cause is that existing `summarizeReviewQuality(...)` cannot interpret a valid canonical nested eligible `evidence-decided` record.

Only after that behavioral assertion is present may the same immutable Commit-A test file assert the future P7-00 seam and projection contracts.

Invalid RED includes:

- missing future module/export as first cause
- syntax failure
- fixture construction failure
- canonical-event validation failure
- dependency failure
- infrastructure failure
- unrelated baseline failure
- source mutation
- assertion weakening
- flat/non-canonical fixture
- a cross-surface fixture whose eligibility/reason was assumed instead of asserted.

Commit-A tests are immutable after A and must cover at least:

1. real canonical nested Core event construction;
2. real canonical nested IELTS event construction;
3. real canonical nested V10 coaching event construction;
4. canonical event validation for all three controlled surfaces;
5. positive eligible Core evidence;
6. positive eligible IELTS evidence under current verified-source semantics;
7. ineligible V10 coaching evidence under current EvidencePolicy semantics;
8. eligible vs ineligible separation;
9. assisted/unqualified reason preservation;
10. numerator / denominator / sample size;
11. source/provenance drill-down;
12. empty input → explicit `INSUFFICIENT_DATA`;
13. sparse input → explicit uncertainty;
14. duplicate replay does not inflate totals or denominator;
15. out-of-order equivalent input yields deterministic equivalent output;
16. timezone/DST day-boundary behavior;
17. active-day computation;
18. same canonical inputs + taxonomy/projector versions → same output;
19. conflicting evidence produces explicit conflict/uncertainty semantics;
20. WeaknessProfile input/output digest determinism;
21. unavailable metric domains are not fabricated as measured zero;
22. production `src/progress.js` seam reaches both canonical reducer and WeaknessProfile;
23. total canonical decision records by controlled surface: Core, IELTS and V10 are each explicitly asserted;
24. eligible denominator surface contribution is explicitly asserted for Core and IELTS;
25. V10 coaching is explicitly asserted as excluded from the positive denominator and remains source-drillable;
26. controlled Core + IELTS + V10 total reconciliation equals 100%;
27. controlled known-surface fixtures produce `Unknown == 0`;
28. aggregate eligible + excluded counts reconcile exactly to deduplicated canonical decision-record total.

If these tests cannot coexist with a valid behavioral first RED:

`STOP / TEST_FIRST_TOPOLOGY_NOT_EXECUTABLE`.

## Natural RED Binding

Commit A must satisfy all of:

- parent exactly `66666172238668b1ea40d7ff596c82c209fcdfe5`
- changed path exactly `tests/progress.test.mjs`
- all source blobs unchanged
- one Draft PR already exists before relying on PR CI
- first natural exact-head `pull_request` CI for A is observed
- workflow = `CI`
- workflow ID = `322561862`
- head SHA = exact A
- first product cause = frozen behavioral predicate
- failure is not infrastructure/syntax/dependency/fixture failure.

Only a positively classified `RED_ELIGIBLE` transition authorizes Commit B.

## Commit B — Minimal GREEN Production Boundary

Commit B may change only the exact source allowlist. The Commit-A test blob must remain byte/Git-blob identical.

Required production flow:

`canonical learning events` → deterministic P7-00 metrics projection → deterministic versioned WeaknessProfile

reachable through the authorized `src/progress.js` seam.

The implementation must consume canonical event identity and nested `event.payload`. It may preserve compatibility for existing legacy flat callers, but legacy mutable counters/flat event fields are not the P7-00 source of truth.

No persistence mutation, event-repository mutation, EvidencePolicy mutation, FSRS mutation, UI work, Today scheduler, dependency change or storage schema change is authorized.

## Canonical Metrics Contract

Canonical P7-00 acceptance source requires numerator/denominator/timeframe/eligibility definitions for retrieval, delayed success, coverage, stability, recurrence, content completion and active days, with projection rebuilt from canonical events.

For each metric domain, expose where applicable:

- numerator
- denominator
- timeframe
- eligibility
- sample size
- source/provenance drill-down.

Each metric domain must either:

1. be deterministically measured from sufficient canonical evidence; or
2. return explicit `INSUFFICIENT_DATA` with a specific reason and relevant denominator/sample/timeframe/provenance.

A missing metric is not a measured zero.

Duplicate canonical replay must not inflate totals. Equivalent event sets in different order must produce the same projection. Timezone/DST semantics must be deterministic. Assistance must come from canonical evidence semantics, never inferred from UI text.

### Cross-surface reconciliation contract

The implementation must expose a deterministic cross-surface reconciliation sufficient for the mandatory Core/IELTS/V10 test matrix.

At minimum the controlled fixture must make it possible to prove:

- deduplicated canonical decision-record total by surface (`Core`, `IELTS`, `V10`, `Unknown`);
- positive eligible denominator contribution by surface;
- excluded/ineligible contribution by surface and reason;
- `eligible + excluded == total`;
- controlled fixture `Unknown == 0`;
- source/provenance drill-down for every counted/excluded record.

The reducer may choose exact property names, but Commit-A assertions must freeze those names before Commit B. Commit B cannot change the test contract.

Surface recognition may use canonical target identity and stable producer source namespaces present in canonical events. It MUST NOT infer a surface from UI copy. Any record that cannot be deterministically classified must be `Unknown` and remain drillable rather than silently reassigned.

The positive P7-00 denominator remains governed by canonical `eligible === true`; V10 coaching cannot be promoted merely to make cross-surface totals non-zero.

## WeaknessProfile Contract

WeaknessProfile must be deterministic, browser-safe and versioned and include at least:

- `schemaVersion`
- `taxonomyVersion`
- `projectorVersion`
- `canonicalInputRefs`
- denominator
- sample size
- timeframe / recency
- evidence-derived reason codes
- evidence-derived uncertainty
- explicit insufficient-data state
- actual conflict/contradiction policy/result
- input digest
- output digest.

Invariant:

same canonical inputs + same taxonomy version + same projector version = same output.

Sparse/conflicting evidence must not silently become weak, mastered, ready or band estimate. AI cannot write canonical WeaknessProfile.

Digests must use existing browser-safe `learningContractDigest` from `src/learning-contracts.js`. Node-only browser-source dependencies are forbidden.

## Exact Verification Profile — AUTH-009

AUTH-009 freezes the repository's natural exact-head `CI` workflow, workflow ID `322561862`, at the exact predecessor workflow bytes.

The following exact command identities are required because they are naturally executed by the accepted workflow on PR heads:

- `npm ci --no-audit --no-fund`
- `npm test`
- `npm run check`
- `npm run audit:roadmap`
- `npm run audit:ielts`
- `npm run test:v10`
- `npm run audit:v10`
- `npm run build`
- `npm run phase4:verify`
- `npm run phase5:verify`
- `npm run test:serve`
- `npm run test:preview`
- `npm run test:browser`
- `npm run test:ielts-browser`
- `npm run test:v10-browser`
- `npm run test:hardening`

The workflow's exact conditional ordering and auxiliary dependency setup remain governed by the frozen `.github/workflows/ci.yml`; EXEC-009 may not modify the workflow.

### Package-focused assertion evidence

No separate focused-shell command is frozen by AUTH-009. Instead, package-focused P7-00 assertions must be uniquely named in `tests/progress.test.mjs`, executed inside exact `npm test`, and visible in raw `test-output.txt`/job evidence on the exact B head.

The Independent Implementation Auditor must inspect those named subtests and the immutable Commit-A blob rather than treating overall CI green as sufficient acceptance.

### Explicit non-requirement

`npm run phase0:gate` is **NOT** part of EXEC-009's frozen verification profile.

Natural CI constituent commands MUST NOT be described as an execution of `npm run phase0:gate`. No equivalence claim is authorized.

This corrects the AUTH-008 self-imposed verification-identity mismatch without changing canonical Phase-0 policy or P7-00 acceptance criteria.

## GREEN CI / Artifact Binding

Commit B requires the first natural exact-head `pull_request` CI generated by pushing B to the existing Draft implementation PR.

Required GREEN facts:

- workflow `CI`
- workflow ID `322561862`
- event `pull_request`
- exact B head
- run attempt 1 unless GitHub itself reports otherwise before any prohibited executor action
- conclusion `success`
- required workflow steps above succeed under their actual workflow conditions
- package P7-00 subtests appear in raw test evidence and pass
- artifact `verification-output` exists for the exact B run
- exact artifact ID and SHA-256 digest are observed and recorded
- artifact/run/head bindings match exactly.

Missing or mismatched artifact is:

`STOP / GREEN_ARTIFACT_MISSING_OR_MISMATCHED`.

A failed B CI is preserved. No B2, amend, force-push, manual rerun or manufactured event is authorized.

## Migration Obligations

EXEC-009 evidence must truthfully verify:

- `NO_DESTRUCTIVE_MIGRATION`
- `RAW_CANONICAL_EVENTS_UNCHANGED`
- `PROJECTION_REBUILDABLE`
- `PROJECTION_VERSION_EXPLICIT`
- `LEGACY_COUNTERS_READ_ONLY_COMPARISON_ONE_RELEASE`
- `NO_SYNTHETIC_BACKFILL_OF_CANONICAL_HISTORY`

Raw canonical events remain source of truth. The new reducer/profile is a rebuildable projection.

## Rollback Obligations

Evidence must verify:

- `DROP_OR_IGNORE_NEW_PROJECTION`
- `RETAIN_RAW_CANONICAL_EVENTS`
- `RETAIN_LEGACY_COUNTERS`
- `RETAIN_IMPLEMENTER_EVIDENCE`
- `NO_HISTORY_REWRITE`

`SKIPPED`, `IGNORED` or a fabricated `N/A` is invalid when the obligation is applicable.

If the bounded source design cannot truthfully satisfy these semantics:

`STOP / MIGRATION_BOUNDARY_NOT_EXECUTABLE`.

## Evidence Schema V3

### Path

`docs/superpowers/specs/2026-08-13-wave-6-p7-00-wkn-exec-009-evidence.md`

### Authority label

`IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`

The evidence file cannot grant independent implementation acceptance, package acceptance or merge authority.

### Required bindings

Evidence V3 must contain raw-observed values for at least:

- schema id `W6_P7_00_WKN_EXEC_EVIDENCE_V3`
- authority label
- authorization id
- execution record id
- implementation subject
- exact predecessor
- baseline CI workflow/run/id/head/conclusion
- Commit A SHA/parent/changed paths/test blob
- exact RED workflow/run/job/head/conclusion
- RED first cause and eligibility classification
- Core fixture identity and canonical event validation result
- IELTS fixture identity, canonical event validation result and observed eligibility/reason
- V10 fixture identity, canonical event validation result and observed eligibility/reason
- immutable A-test blob at B
- Commit B SHA/parent/changed paths
- exact GREEN workflow/run/job/head/conclusion
- package named-subtest results from raw `npm test` evidence
- `verification-output` artifact name/id/digest/bound run/bound head
- cross-surface total counts
- cross-surface eligible counts
- cross-surface excluded counts and reasons
- cross-surface reconciliation percentage/result
- controlled-fixture Unknown count
- canonical input digest
- metrics output digest
- WeaknessProfile output digest
- deterministic replay result
- migration results
- rollback results
- source blob bindings
- unresolved limitations, if any
- Commit C parent
- Commit C changed path
- Commit-C SHA carrier type `EXTERNAL_OBSERVED_BINDING`
- final exact C SHA observed externally
- final exact-head C CI workflow/run/head/conclusion.

Implementer narration without raw Git/CI/artifact binding is not sufficient evidence.

## Commit-C SHA Binding

Commit C's own SHA is an `EXTERNAL_OBSERVED_BINDING` and must not be guessed or self-embedded.

The evidence file records its parent and exact changed path. After Commit C exists, its SHA is bound by raw Git observation, executor handoff, final exact-head CI and the Independent Implementation Audit subject.

No amend, C2 or history rewrite is authorized to self-embed the resulting C SHA.

## Commit C — Evidence Only

After valid B GREEN and required artifact/evidence capture, Commit C may create only the exact Evidence V3 path.

C parent = exact B.

No test/source modification is permitted at C.

Pushing C must produce a natural exact-head `pull_request` CI run. That final CI is required to prove the evidence-only final head remains repository-green; it does not replace the exact B GREEN evidence.

After final C CI observation, executor must STOP for Independent Implementation Audit.

## Stop Conditions

Immediate STOP on any of:

- current main differs from exact predecessor at Stage 0
- authorization head/blob/verdict mismatch
- implementation branch already exists with incompatible history
- open PR/path/semantic writer conflict
- dependency status conflict
- canonical owner conflict
- source/test/evidence path outside allowlist required
- cross-surface canonical fixture invalid
- IELTS fixture current eligibility semantics differ materially from the frozen strategy
- V10 fixture current coaching/ineligibility semantics differ materially from the frozen strategy
- first RED cause is not the frozen product behavior
- missing future module/export is first RED cause
- source changes before eligible RED
- Commit-A test blob changes after A
- B changes a non-source allowlisted path
- B natural CI does not succeed
- required GREEN artifact is missing or mismatched
- named cross-surface P7-00 subtests are absent, skipped or not evidenced in raw test output
- total/eligible/excluded surface reconciliation is ambiguous or inconsistent
- migration/rollback obligation cannot be truthfully established
- C changes anything except exact evidence path
- final C CI is missing or non-success
- any amend/rebase/force/no-op/manual-rerun/manufactured-event action
- package/canonical acceptance conflict
- evidence provenance ambiguity.

Fail closed. Do not repair a stopped candidate by rewriting history.

## Integration Rule

`MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED`

Even after a future independent implementation `ACCEPT`, this manifest does not grant merge authority, package acceptance or canonical status reconciliation.

## Independent Audit Requirements

### Independent Manifest Auditor

Before activating EXEC-009, a fresh Independent Manifest Auditor must verify:

- exact authorization branch/head/base/topology
- docs-only mutation
- current exact predecessor and baseline CI
- canonical owner/dependency state
- controlling EXEC-008 REJECT and the exact two recovery defects
- Protocol matrix 31/31
- canonical acceptance source/blob
- exact mutation allowlists/exclusions
- executable behavioral RED seam
- Core/IELTS/V10 fixture strategy against current source contracts
- V10 coaching is not falsely promoted
- verification profile matches actual frozen CI workflow commands
- `npm run phase0:gate` is deliberately not an EXEC-009 requirement and no equivalence claim is made
- Evidence V3 / Commit-C external binding is non-circular
- migration/rollback and stop conditions
- Git provenance is append-only.

The Manifest Author cannot issue this verdict.

### Independent Implementation Auditor

A future independent auditor must fresh-check raw Git topology/diffs/blobs, immutable tests, RED first cause, source semantics, cross-surface reconciliation, CI job/logs/artifacts, Evidence V3, migration/rollback and final C head.

CI green alone cannot produce ACCEPT.

## Authorization Output Boundary

If independently accepted at an exact authorization head, only then does this manifest activate:

`W6-P7-00-WKN-EXEC-009`

for the exact predecessor, branch, paths, tests, natural-RED predicate, verification profile, evidence schema and stop conditions frozen here.

Until then:

- Implementation authorization: `NOT_ACTIVE_PENDING_INDEPENDENT_MANIFEST_ACCEPT`
- Independent implementation acceptance: `NOT_GRANTED`
- Package acceptance: `NOT_GRANTED`
- Merge authority: `NOT_GRANTED`
