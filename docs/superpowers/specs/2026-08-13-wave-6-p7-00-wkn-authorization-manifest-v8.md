# W6-P7-00-WKN-AUTH-008 — Clean Recovery Authorization Manifest

## Manifest Identity

- **Authorization ID**: `W6-P7-00-WKN-AUTH-008`
- **Execution Record ID**: `W6-P7-00-WKN-EXEC-008`
- **Protocol**: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
- **Schema**: `WAVE_AUTHORIZATION_MANIFEST_V1`
- **Implementation Subject**: `P7-00 / WKN-00`
- **State**: `DRAFT_AUTHORIZATION_CANDIDATE`
- **Implementation authorization**: `NOT_ACTIVE_PENDING_INDEPENDENT_MANIFEST_ACCEPT`
- **Independent implementation acceptance**: `NOT_GRANTED`
- **Package acceptance**: `NOT_GRANTED`
- **Merge authority**: `NOT_GRANTED`

## Historical Records and Recovery Provenance

- `W6-P7-00-WKN-AUTH-007` / PR #62 is `FROZEN / REJECTED / DO_NOT_MERGE / DO_NOT_REUSE` at exact head `4ed3232f5d2be2ac4cdbdb21945e5cef6ef1ae84`, manifest blob `bdafc48e66c80107b4dd94b087d84c939ed27043`, controlling independent REJECT comment `5270174679`.
- AUTH-007 audit recorded `Canonical fixture: PASS`, `Executable topology: PASS`, `Evidence V2 authority: PASS`, and `Commit-C binding: PASS`; its sole controlling defect was `CRITICAL: MANDATORY_MANIFEST_FIELD_INVALID / CANONICAL_ACCEPTANCE_CRITERIA_SOURCE`.
- `W6-P7-00-WKN-EXEC-006` / PR #61 remains `FROZEN / REJECTED / DO_NOT_MERGE / DO_NOT_REUSE` under comment `5269827425`; rejected commits and branch `codex/p7-00-metrics-reducer` are historical evidence only and MUST NOT be reused or cherry-picked.
- AUTH-007 proposed EXEC-007 identities are historical proposal identities only and are not reused by this candidate.

### Predecessor Drift Incident Record

The repository's current `main` is `66666172238668b1ea40d7ff596c82c209fcdfe5`. It is four append-only commits ahead of the previously used predecessor `6b992ac5b4032974fb7c5638759f0f073ca0d327`, but GitHub compare reports **zero changed files** between those revisions. The current tree is `d67b728e8e312bc4ad1d7700a4cc3a353aff1756`, identical to the earlier canonical tree. The four intervening commits are accidental create/delete probe pairs; no history rewrite, reset, amend, force-push, or canonical content mutation is used to conceal them.

This manifest does **not** infer that tree equivalence automatically grants acceptance. It binds the current exact `main` revision as the implementation predecessor and exposes the incident for Independent Manifest Audit. If the independent auditor determines this predecessor provenance is unacceptable, verdict MUST be `REJECT` or `BLOCKED`; the executor receives no authority.

## Protocol Mandatory-Field Matrix

| # | Protocol field | Frozen value/source |
|---|---|---|
| 1 | wave/package identity | `W6-P7-00-WKN-EXEC-008` / `P7-00 / WKN-00` |
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
| 14 | Natural RED predicate | canonical nested P1-02 event behavioral RED |
| 15 | RED invalidation predicates | exact section below |
| 16 | minimal GREEN boundary | Commit B source-only, immutable A tests |
| 17 | exact verification commands | exact section below |
| 18 | evidence path | `docs/superpowers/specs/2026-08-13-wave-6-p7-00-wkn-exec-008-evidence.md` |
| 19 | evidence file allowlist | exact evidence path only at C |
| 20 | evidence schema/version | `W6_P7_00_WKN_EXEC_EVIDENCE_V2` |
| 21 | evidence authority label | `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` |
| 22 | implementation-subject binding | `P7-00 / WKN-00` |
| 23 | Commit A/B/C bindings | exact section below |
| 24 | RED CI binding | workflow `CI`, ID `322561862`, natural `pull_request`, exact A |
| 25 | GREEN CI binding | workflow `CI`, ID `322561862`, natural `pull_request`, exact B |
| 26 | artifact policy | `verification-output` required at GREEN, exact artifact ID/digest observed |
| 27 | migration obligations | exact section below |
| 28 | rollback obligations | exact section below |
| 29 | stop conditions | exact section below |
| 30 | integration rule | `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED` |
| 31 | canonical acceptance-criteria source | `docs/IMPLEMENTATION_PLAN.md` / `### P7-00 — Canonical learning metrics reducer` / blob `7a77a743ef70105362b1ad054896ea8c51644c2d` |

Missing or mismatched fields are not inferred.

## Exact Predecessor and Baseline CI

- **Exact Implementation Predecessor**: `66666172238668b1ea40d7ff596c82c209fcdfe5`
- **Predecessor tree**: `d67b728e8e312bc4ad1d7700a4cc3a353aff1756`
- **Baseline CI**: workflow `CI`, workflow ID `322561862`, event `push`, run `#361`, run ID `31623561426`, exact head `66666172238668b1ea40d7ff596c82c209fcdfe5`, conclusion `success`.

Any Stage-0 movement of `origin/main` away from this SHA is `STOP / PREDECESSOR_DRIFT`. No silent rebind is permitted.

## Canonical State at Predecessor

- `P7-00` = `NEXT`
- `P1-02` = `ACCEPTED`
- `P1-08` = `ACCEPTED`
- `WKN-00` canonical owner = `P7-00`
- `P7-01..P7-05`, FCS, ASM, TD, readiness, band estimates and downstream personalization remain outside this authorization.

Canonical status source: `docs/IMPLEMENTATION_STATUS.md`, blob `e7de22191b6ce320edab0b36d34c2ff9efecde5c` on the tree bound above.

## Writer and Branch/PR Topology

- **Writer role**: `P7-00 / WKN-00 Bounded Implementer`
- **Writer mode**: `ONE_WRITER_EXCLUSIVE`
- **Implementation branch**: `codex/p7-00-metrics-reducer-exec-008`
- **Branch origin**: MUST be created directly from `66666172238668b1ea40d7ff596c82c209fcdfe5`.
- The branch MUST NOT already exist with incompatible history.
- Historical rejected branch `codex/p7-00-metrics-reducer` MUST NOT be reused or pushed.
- Proposed historical EXEC-007 branch `codex/p7-00-metrics-reducer-exec-007` MUST NOT be used.
- Exactly ONE future implementation PR, Draft, head `codex/p7-00-metrics-reducer-exec-008`, base `main`.
- Exact future lineage: predecessor → Commit A test-only → Commit B minimal GREEN → Commit C evidence-only.
- A parent = exact predecessor; B parent = A; C parent = B.
- No B2/C2, amend, rebase, merge-from-main, destructive reset, force-push, empty/no-op commit, Ready toggle, close/reopen, workflow dispatch, or manual rerun as substitute evidence.
- An accidental bad commit causes `STOP`; it is not repaired by rewriting history.

## Exact Mutation Allowlist

### SOURCE — Commit B only

- `[MODIFY] src/progress.js`
- `[NEW] src/p7-00-metrics-reducer.js`
- `[NEW] src/weakness-profile.js`

### TEST — Commit A only

- `[MODIFY] tests/progress.test.mjs`

### EVIDENCE — Commit C only

- `[NEW] docs/superpowers/specs/2026-08-13-wave-6-p7-00-wkn-exec-008-evidence.md`

## Read-Only Dependencies

- `src/event-repository.js` — canonical learning-event schema and `buildLearningEventRecords`
- `src/learning-contracts.js` — `learningContractDigest` and canonical contracts
- `src/schedule-gateway.js` — `buildCoreEvidenceEnvelope`
- `src/evidence-policy.js` — `decideEvidence`
- `src/persistence.js` — canonical event reader; no mutation

## Explicit Exclusions

Forbidden from mutation during EXEC-008:

- `src/app.js`
- `src/main.js`
- `src/persistence.js`
- `src/persistence-core.js`
- `src/event-repository.js`
- `src/evidence-policy.js`
- `src/fsrs-scheduler.js`
- `src/learning-contracts.js`
- `src/schedule-gateway.js`
- all other non-allowlisted `src/**`
- all other non-allowlisted `tests/**`
- `server/**`
- `public/**`
- `.github/**`
- `package.json`
- `package-lock.json`
- `content-repo/**`
- all canonical governance docs
- all authorization manifests
- all `docs/**` except exact EXEC-008 evidence path at Commit C.

If an excluded path is necessary: `STOP / ALLOWLIST_EXPANSION_REQUIRED`.

## Canonical RED Fixture Strategy

Commit A MUST build a real canonical P1-02 fixture from existing production APIs:

`buildCoreEvidenceEnvelope(...)` → `decideEvidence(...)` → `buildLearningEventRecords(...)` → select `eventType === 'evidence-decided'`.

The selected record MUST have `kind === 'canonical-learning-event'`, supported `schemaVersion`, `eventType === 'evidence-decided'`, stable canonical identity fields and nested `payload`. Canonical EvidenceDecision values are read from nested payload fields including `eligible`, `affectsSchedule`, `successful`, `reason`, `rating`, `skill`, `target`, and `policyVersion` where present.

A flat legacy object such as `{ rating, skill, evidenceType, metadata }` is explicitly invalid as the canonical RED fixture.

## Natural RED Predicate and Test-First Rule

Commit A may change ONLY `tests/progress.test.mjs` and must import/call only existing predecessor production APIs for the first cause. The first failing assertion must be a product-behavior assertion showing that predecessor progress behavior cannot correctly interpret/project a valid canonical nested `evidence-decided` event into the required P7-00 contract (for example canonical eligible evidence is not counted in denominator/provenance).

Invalid RED includes missing future module/export as first cause, syntax error, fixture-construction error, dependency failure, infrastructure failure, unrelated baseline failure, source mutation, weakened assertion, or a non-canonical flat fixture.

Commit-A tests are immutable after A. The test file must freeze the accepted behavior needed for B, including at least:

1. real canonical nested event construction;
2. eligible vs ineligible evidence;
3. assisted/unqualified separation through canonical eligibility/reason semantics;
4. numerator/denominator and provenance;
5. empty input → explicit `INSUFFICIENT_DATA`;
6. sparse input → explicit uncertainty;
7. duplicate replay does not inflate denominators;
8. out-of-order equivalent event sets yield deterministic equivalent output;
9. timezone/DST day-boundary behavior;
10. active-day computation;
11. same canonical input + taxonomy/projector versions → same output;
12. conflicting evidence produces explicit conflict/uncertainty semantics;
13. WeaknessProfile input/output digest determinism;
14. unavailable metrics are not fabricated as measured zero;
15. production seam reaches both the metrics reducer and WeaknessProfile.

If the immutable Commit-A topology cannot express these checks while maintaining a valid behavioral first RED, `STOP / TEST_FIRST_TOPOLOGY_NOT_EXECUTABLE`.

## Commit A / RED Binding

Commit A:
- parent exactly `66666172238668b1ea40d7ff596c82c209fcdfe5`;
- changed path exactly `tests/progress.test.mjs`;
- all source blobs unchanged;
- natural GitHub `pull_request` CI on exact A;
- RED workflow `CI`, workflow ID `322561862`;
- first product cause matches the canonical nested-event predicate;
- fixture is validated as a real canonical P1-02 event;
- no baseline/infra/syntax/dependency failure masks the RED.

Only a positively classified eligible RED authorizes Commit B.

## Commit B / Production Pipeline / Minimal GREEN

Commit B may change only the exact source allowlist, with the Commit-A test blob byte/Git-blob identical.

Required production path:

`canonical P1-02 events` → `src/p7-00-metrics-reducer.js` → `src/weakness-profile.js`, reachable through the authorized `src/progress.js` production seam.

Both new modules MUST be imported/re-exported/called through the authorized production seam. Orphan files do not satisfy GREEN. Legacy flat progress callers may remain compatible, but canonical P1-02 truth MUST read canonical event identity and nested `event.payload`; legacy flat fields are not canonical truth.

No persistence, event-repository, EvidencePolicy, FSRS, app/UI, package/dependency, or storage-schema mutation is authorized.

## Canonical Metrics Contract — No Stubs

For canonical P7-00 metrics, expose where applicable: numerator, denominator, timeframe, eligibility, sample size and source/provenance drill-down.

Required metric domains are retrieval, delayed success, coverage, stability, recurrence, content completion and active days. Each domain MUST either:

1. be deterministically derived from sufficient canonical evidence; or
2. return an explicit `INSUFFICIENT_DATA` state with a specific reason and relevant denominator/sample/timeframe/provenance.

Placeholder constants such as hard-coded zeros are forbidden. A measured zero must mean the metric was actually measured and is zero; missing evidence must not masquerade as zero.

Duplicate canonical replay MUST NOT inflate denominators. Equivalent event sets in different order MUST yield the same deterministic projection. Timezone/DST semantics must be deterministic and tested according to the canonical timeframe contract; the executor must not infer assistance from UI text.

Core/IELTS/V10 totals must reconcile where canonical event targets support those surfaces; exclusions must be explainable and source-drillable.

## WeaknessProfile Contract

WeaknessProfile MUST be deterministic and versioned and include:

- `schemaVersion`
- `taxonomyVersion`
- `projectorVersion`
- `canonicalInputRefs`
- denominator
- sample size
- timeframe/recency
- evidence-derived reason codes
- evidence-derived uncertainty
- explicit insufficient-data state
- actual conflict/contradiction policy/result
- input digest
- output digest.

Invariant: same canonical inputs + same taxonomy version + same projector version = same output.

Sparse/conflicting evidence MUST NOT silently become weak, mastered, ready, or band estimate. AI cannot write canonical WeaknessProfile. Unconditional `['OK']`, unconditional `low` uncertainty, or invented `latest_wins` policy are forbidden unless actual canonical policy/evidence supports them.

Digests MUST use existing browser-safe canonical `learningContractDigest` from `src/learning-contracts.js`; `node:crypto` or other Node-only browser-source dependencies are forbidden.

## Migration and Rollback Obligations

EXEC-008 evidence MUST verify all migration facts:

- `NO_DESTRUCTIVE_MIGRATION`
- `RAW_CANONICAL_EVENTS_UNCHANGED`
- `PROJECTION_REBUILDABLE`
- `LEGACY_COUNTERS_READ_ONLY_COMPARISON_ONE_RELEASE`

Rollback evidence MUST verify:

- `DROP_OR_IGNORE_NEW_PROJECTION`
- `RETAIN_RAW_CANONICAL_EVENTS`
- `RETAIN_LEGACY_COUNTERS`
- `RETAIN_IMPLEMENTER_EVIDENCE`
- `NO_HISTORY_REWRITE`

`IGNORED`, `SKIPPED`, and `N/A` are invalid substitute results. If the bounded source design cannot truthfully satisfy canonical projection/cache rollback semantics, `STOP / MIGRATION_BOUNDARY_NOT_EXECUTABLE`.

## Evidence Schema V2

- **Path**: `docs/superpowers/specs/2026-08-13-wave-6-p7-00-wkn-exec-008-evidence.md`
- **Schema**: `W6_P7_00_WKN_EXEC_EVIDENCE_V2`
- **Authority label**: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`

Required typed bindings include:

- `schema_id`: string, exact schema ID
- `authority_label`: string, exact authority label
- `authorization_id`: `W6-P7-00-WKN-AUTH-008`
- `execution_record_id`: `W6-P7-00-WKN-EXEC-008`
- `implementation_subject`: `P7-00 / WKN-00`
- `exact_predecessor`: `66666172238668b1ea40d7ff596c82c209fcdfe5`
- baseline workflow/run-number/run-ID
- Commit A exact SHA/parent/path/test blob
- RED exact workflow/event/head/run-number/run-ID/job-ID/first-cause and `red_eligible: true` as a boolean
- Commit B exact SHA/parent/source paths and immutable A-test blob binding
- GREEN exact workflow/event/head/run-number/run-ID/job-ID/conclusion
- `verification-output` artifact exact name/ID/SHA-256 digest bound to GREEN run/head
- canonical fixture identity and construction API path
- canonical input digest using `learningContractDigest`
- metrics output digest using `learningContractDigest`
- WeaknessProfile output digest using `learningContractDigest`
- deterministic replay result `PASS`
- `migration_result`: object containing all four required migration proofs
- `rollback_result`: object containing all five required rollback proofs
- `source_blob_bindings`: object containing exact Git blobs of changed sources
- `unresolved_limitations`: `NONE` only when every mandatory claim has fresh evidence; otherwise exact list
- Commit C parent and exact evidence-only changed path.

Evidence cannot grant implementation acceptance, package acceptance, or merge authority.

### Commit-C SHA Binding Model

The exact Commit-C SHA is an `EXTERNAL_OBSERVED_BINDING`. It is not self-embedded inside Commit C bytes. The evidence file records exact `commit_c_parent` and `commit_c_changed_paths`; the final C SHA is bound through raw Git observation after commit, executor handoff, final exact-head natural CI, and the Independent Implementation Audit subject. AUTH-007's independent audit explicitly classified this carrier model and Evidence V2 authority as PASS; AUTH-008 preserves those semantics without expansion.

## Artifact and Verification Profile

Focused RED/GREEN command:

`node --test tests/progress.test.mjs`

Full verification:

`npm ci --no-audit --no-fund`

`npm run phase0:gate`

Natural RED/GREEN/final-head workflow: `CI`, workflow ID `322561862`, natural `pull_request` events on exact A/B/C heads as generated by the one Draft implementation PR.

At GREEN, artifact `verification-output` is required. Exact future artifact ID and SHA-256 digest must be observed and bound to the exact GREEN run/head; missing/mismatched artifact is STOP.

After Commit C, final exact-head natural CI on exact C MUST complete successfully. C CI does not replace B GREEN; it proves the evidence-bearing final head remains repository-green.

## Canonical Acceptance Criteria Source

- **Canonical source path**: `docs/IMPLEMENTATION_PLAN.md`
- **Canonical source section**: `### P7-00 — Canonical learning metrics reducer`
- **Canonical source blob at predecessor tree**: `7a77a743ef70105362b1ad054896ea8c51644c2d`
- **Exact predecessor**: `66666172238668b1ea40d7ff596c82c209fcdfe5`

The AUTH-008 acceptance matrix below is a bounded executable restatement of this exact canonical section. It does NOT replace, weaken, rename, generalize, or supersede the canonical source. Historical AUTH-006/AUTH-007 manifests are not canonical acceptance authority. On conflict, the canonical source wins and the executor STOPS.

## Acceptance Criteria Matrix

The bounded execution and independent audit must verify the material requirements of `### P7-00 — Canonical learning metrics reducer`:

- define numerator/denominator/timeframe/eligibility;
- retrieval;
- delayed success;
- coverage;
- stability;
- recurrence;
- content completion;
- active days;
- rebuild projection from canonical events;
- raw events unchanged;
- projection version/cache rebuild semantics;
- legacy counters read-only comparison one release;
- rollback drops/ignores new projection only;
- deterministic replay;
- duplicate and out-of-order events;
- timezone/DST;
- empty/sparse data;
- assisted vs independent evidence;
- Core/IELTS/V10 totals where canonical targets support them;
- fixture totals reconcile 100%;
- every metric exposes denominator/timeframe/source drill-down;
- mutable card counters are not source of truth;
- no assistance inference from UI text;
- surface disagreement must have explainable exclusions.

WKN-00 additionally obeys ADR-048: same canonical inputs + taxonomy/projector versions = same WeaknessProfile output; denominator, sample size, reason codes, uncertainty, insufficient-data state and provenance are explicit; sparse/conflicting evidence cannot silently become weak/mastered/ready/band; AI cannot write canonical profile; no second metrics truth, Error Repository, Today scheduler or FSRS tuning.

## Stop Conditions

Fail closed on any of:

- current main/predecessor drift;
- independent auditor rejects or blocks the predecessor incident provenance;
- P7-00/dependency/owner drift;
- future implementation branch conflict;
- writer or active semantic/path overlap other than explicitly frozen historical rejected records;
- allowlist expansion or insufficiency;
- explicit exclusion violation;
- dependency/package/storage/schema expansion;
- invalid canonical fixture;
- Natural RED absent, invalid or ambiguous;
- source mutation before valid RED;
- test mutation/weakening after A;
- canonical event mutation or second metrics truth;
- orphan reducer/profile modules;
- placeholder/stub metrics;
- missing denominator/timeframe/provenance;
- fabricated zero from missing evidence;
- deterministic replay, duplicate, ordering or timezone/DST failure;
- browser-incompatible digest implementation;
- legacy counter canonicalization;
- migration/rollback mismatch or forbidden placeholder values;
- evidence schema/type mismatch;
- CI workflow/event/head/job mismatch;
- missing or mismatched artifact/digest;
- destructive Git operation, amend, rebase, reset, force-push, empty/no-op commit or synthetic CI event;
- AI canonical authority, FSRS mutation, P7-01+ or FCS/ASM/TD scope requirement;
- canonical acceptance conflict.

## Integration and Non-Goals

`MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED`

This manifest does not authorize merge, package acceptance, downstream Wave 6 execution, P7-01+, FCS/ASM/TD, readiness/band estimates, AI canonical authority, FSRS tuning, a second event/metrics/error/Today truth, dependency changes, CI changes, UI redesign, persistence mutation or canonical status edits.

## Future Executor Handoff Boundary

Only an Independent Manifest Auditor may activate this exact capsule. If accepted, authority is limited to `W6-P7-00-WKN-EXEC-008` on branch `codex/p7-00-metrics-reducer-exec-008`, exact predecessor `66666172238668b1ea40d7ff596c82c209fcdfe5`, exact allowlists and exact A→RED→B→GREEN→C→final-C-CI→STOP topology above.

Until such ACCEPT is posted and read back:

- **Implementation authorization**: `NOT_ACTIVE_PENDING_INDEPENDENT_MANIFEST_ACCEPT`
- **Independent implementation acceptance**: `NOT_GRANTED`
- **Package acceptance**: `NOT_GRANTED`
- **Merge authority**: `NOT_GRANTED`
