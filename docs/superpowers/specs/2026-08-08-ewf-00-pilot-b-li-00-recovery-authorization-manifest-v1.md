# EWF-00 Pilot B / LI-00 Recovery Authorization Manifest V1

Authorization identity:
`W1-LI-00-001-PILOT-B-RECOVERY-AUTH-001`

Authorization state:
`DRAFT / RECOVERY_AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE`

Protocol:
`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`

Pilot:
`EWF00-PILOTS-001 / Pilot B`

Product:
`LI-00`

Canonical product execution record:
`W1-LI-00-001`

Recovery execution attempt identity:
`W1-LI-00-001 / EWF00-PILOTS-001-PILOT-B-RECOVERY-001`

This is a docs-only recovery authorization candidate. It does not execute Pilot B, implement LI-00, create implementation evidence, grant acceptance, change canonical package status, modify PR #35, or reinterpret PR #35's independent rejection.

## 1. Authority and recovery permission

Fresh-read authority for this candidate is:

- `AGENTS.md`;
- `docs/ROADMAP.md`;
- `docs/IMPLEMENTATION_PLAN.md`;
- `docs/IMPLEMENTATION_STATUS.md`;
- `docs/DECISIONS.md` including ADR-044 and ADR-046;
- `docs/superpowers/specs/2026-08-06-bounded-execution-capsule-governance-design.md`;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/IMPLEMENTATION_QUEUE.md`;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-artifact-contracts-spec.md`;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-preflight-verification-trace-spec.md`;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-pilots-measurement-audit-spec.md`;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/li-00-canonical-execution-safety-spec.md`;
- accepted `W1-AUTH-MANIFEST-004`;
- accepted `docs/superpowers/specs/2026-08-08-ewf-00-pilot-b-li-00-authorization-manifest.md`;
- immutable independent rejection on PR #35.

The artifact contract states that changing any bound handoff input invalidates `HANDOFF_READY` and requires a new brief identity. The capsule state machine admits terminal `REJECTED`/`BLOCKED` states without converting them into acceptance. Therefore a new docs-only candidate may propose a replacement capsule, but it becomes executable authority only after independent exact-head `ACCEPT`.

Until independent acceptance of this document:

`RECOVERY_AUTHORITY_NOT_EFFECTIVE`.

If accepted, this document preserves the canonical product record and narrowly supersedes only the failed execution mechanics that cannot be reused after PR #35: rejected branch identity, invalid frozen RED, rejected evidence directory/artifacts, incomplete measurement contract, and non-demonstrated negative/recovery evidence contract. It does not rewrite the accepted historical manifests.

## 2. Fresh repository and accepted authority bindings

Fresh repository main at authorization drafting:

`5585ad19599fabdb05063e71562a5706d17ab16f`

Accepted W1 manifest:

```text
identity: W1-AUTH-MANIFEST-004
accepted subject: 9906974d08e7be9714268a43b1d96d94816c569f
accepted manifest blob: c595577e738847fc25fe9cb5e633f4e93ee559e9
independent ACCEPT comment: 5212739464
binding comment: 5212765715
W1_MANIFEST_EXECUTABLE_PREDECESSOR_BINDING: ACTIVE
literal executable predecessor: e53d0971db1160f9b01349d2e4c17e59c6aaa99b
package acceptance: NOT_GRANTED
```

Accepted Pilot B authorization:

```text
PR: #34
accepted subject: b30af0dd8c50650bced76d22bbe734b670f950ab
manifest blob: e7d9ae9adda0df7cfd8109f9f78b861bc79e2791
independent ACCEPT comment: 5223112144
authorization merge: 5585ad19599fabdb05063e71562a5706d17ab16f
binding state: ACTIVE
Pilot B: AUTHORIZED / NOT_EXECUTED
literal LI product predecessor remains: e53d0971db1160f9b01349d2e4c17e59c6aaa99b
```

Canonical status ledger remains historical/stale for the pilot authorization row and is not changed here. LI-00 remains `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`; EWF-00 remains not accepted.

## 3. Immutable historical rejection — PR #35

Historical rejected execution:

```text
PR: #35
branch: chatgpt/w1-li-00-bounded-execution-v1
head: 50c68a8822e3d164aa0278cddfc158bbe92b3570
LI-00 PRODUCT VERDICT: REJECT
EWF00-PILOTS-001 / PILOT B VERDICT: BLOCKED_BY_INVALID_BRIEF
```

The following findings are immutable historical evidence and are not edited or reinterpreted:

1. `INVALID_FROZEN_NATURAL_RED` — Commit A naturally produced `LEARNING_EVENT_COLLISION`; the frozen predicate expected a terminal-collision outcome/overwrite predicate that the actual baseline did not establish, then the test was broadened after the fact.
2. `INVALID_EWF_ARTIFACT_CONTRACT` — the five files did not satisfy the accepted implementation-report, verification-manifest, trace-manifest and frozen-brief identity/digest contract.
3. `NONCOMPARABLE / INCOMPLETE MEASUREMENT EVIDENCE` — required measurements lacked comparable boundaries and raw start/end evidence; an unrun validator was represented as zero overhead; qualitative CLI friction replaced quantitative evidence.
4. `NEGATIVE / RECOVERY EVIDENCE NOT DEMONSTRATED` — narrative/preflight observations did not demonstrate stale-subject rejection, invalid-handoff detection or the required replayable recovery fixtures.

PR #35 remains open Draft historical provenance only. Its independent `REJECT` terminates its authority as an active implementation writer. This recovery document must not change, close, ready, merge, cherry-pick, amend, rebase or force-update PR #35 or its branch.

## 4. Canonical template/schema binding

Future recovery evidence must use the current accepted repository contracts, not simplified lookalikes.

Exact current template blobs at authorization drafting:

```text
.specify/templates/ewf/implementation-report.template.json
79ac245be3535074ff29e2b67c1f6e32ff033d33

.specify/templates/ewf/verification-manifest.template.json
fb5359e04cdcddf35ff55356be4d48f9f96ee1a9

.specify/templates/ewf/trace-manifest.template.json
5c597b1aaf6242ce8cfbf01eb46546ae96cca463

.specify/templates/ewf/frozen-acceptance-brief.template.json
209dd66667e558eb1317a29e369c5b8ed470e8e7

.specify/templates/ewf/preflight-result.template.json
77dd6087514defba2e1fb971c1f0a041c8f14b59
```

Relevant accepted EWF behavior is also bound to `scripts/ewf-artifacts.mjs` and `scripts/ewf-preflight-trace.mjs`. Canonical JSON digesting is `digestArtifact(canonicalized JSON)`; evidence `contentDigest` excludes its own `contentDigest`; verification-manifest digest excludes only `extensions.verificationManifestDigest`; frozen `briefDigest` excludes only its own `briefDigest`.

Required base shapes and authority labels are preserved exactly:

```text
implementation-report:
IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE

verification-manifest:
DECLARED_VERIFICATION / NOT_EXECUTION

trace-manifest:
IMPLEMENTER_TRACE / NOT_ACCEPTANCE

frozen-acceptance-brief:
FROZEN_AUDIT_BOUNDARY / NOT_ACCEPTANCE
```

Pilot-B-specific identity, measurement and fixture metadata may appear only under schema-permitted `extensions` or in trace evidence fields accepted by the current validators. Extensions do not replace mandatory base fields.

The future evidence set must carry, where applicable, at least:

`schemaVersion`, `artifactKind`, `authorityLabel`, `specId`, `subjectCommit`, `parentCommit`, `specRevision`, `changedFiles`, `requirementTrace`, `commandResults`, `environment`, `verificationManifestDigest`, `traceDigest`, `evidenceDigest`, `briefIdentity`, `briefDigest`, `frozenBriefDigest`.

No artifact may grant package, Pilot B or EWF acceptance.

## 5. Recovery execution identity and exact predecessor

Future recovery execution branch:

`chatgpt/w1-li-00-pilot-b-recovery-v1`

It must be created only after this recovery authorization receives independent exact-head `ACCEPT` and only from literal product executable predecessor:

`e53d0971db1160f9b01349d2e4c17e59c6aaa99b`

The current main authorization merge `5585ad19599fabdb05063e71562a5706d17ab16f` is control-plane history and MUST NOT replace the literal product predecessor.

Exactly one implementation writer:

`chatgpt-github-w1-li-primary-writer`

Fresh predecessor blob bindings:

```text
src/learning-contracts.js
0871eab470027afb61325ba3249cb404ede813b5

src/today-runner.js
e80fc68f2596886f3002a312a053e37e302fe071

tests/li-00-execution-safety.test.mjs
ABSENT_AT_e53d0971db1160f9b01349d2e4c17e59c6aaa99b
```

Current main preserves the two source blobs above. Any source/test/predecessor drift before execution is `STOP / MAIN_OR_PREDECESSOR_DRIFT` and requires a new authorization audit; it may not be inferred away.

## 6. Exact future allowlists

Source allowlist — exact:

```text
src/learning-contracts.js
src/today-runner.js
```

Test allowlist — exact:

```text
tests/li-00-execution-safety.test.mjs
```

Recovery evidence directory — exact:

`docs/superpowers/evidence/2026-08-08-w1-li-00-001-pilot-b-recovery-001/`

Recovery evidence allowlist — exact:

```text
docs/superpowers/evidence/2026-08-08-w1-li-00-001-pilot-b-recovery-001/connector-governance-stage-0.raw.json
docs/superpowers/evidence/2026-08-08-w1-li-00-001-pilot-b-recovery-001/frozen-acceptance-brief.json
docs/superpowers/evidence/2026-08-08-w1-li-00-001-pilot-b-recovery-001/implementation-report.json
docs/superpowers/evidence/2026-08-08-w1-li-00-001-pilot-b-recovery-001/trace-manifest.json
docs/superpowers/evidence/2026-08-08-w1-li-00-001-pilot-b-recovery-001/verification-manifest.json
```

`connector-governance-stage-0.raw.json` is read-only governance metadata and is explicitly NOT executable command evidence. Pilot measurements and negative/recovery fixture records must be schema-compatible material under canonical artifact `extensions` and/or canonical trace evidence, with raw references to exact command/CI evidence. No extra evidence filename may be improvised.

Explicit exclusions remain:

```text
src/today-composer.js
tests/today-composer.test.mjs
src/v10-persistence.js
src/persistence.js
src/event-repository.js
new runtime
new Attempt or Receipt store
new scheduler
activity inventory
multi-item assessment
AI authority
FSRS behavior change
source repository ownership
question schema ownership
.github/**
package.json
package-lock.json
canonical status docs
historical evidence rewrite
PR #35 history
```

`src/v10-persistence.js` remains read-only dependency. Its existing exported `transactV10` provides the durable transactional boundary; this authorization freezes the canonical single durable compare-and-set behavior requirement, not a mandated implementation primitive. If the two source allowlist files cannot satisfy the behavior through existing accepted dependencies without modifying an excluded path, STOP `RECOVERY_SOURCE_BOUNDARY_INSUFFICIENT`.

## 7. Canonical LI-00 behavior that recovery must implement

Commit B must satisfy the actual LI-00 specification, including all of the following without scope expansion:

- complete immutable frozen execution binding for Run identity, exact target/source revision, prompt/config, evaluation and policy/evidence identity, with explicit inapplicable fields;
- persistence of that binding before executor side effects and reuse of the persisted binding on resume/reload;
- stable typed fail-closed behavior for missing, stale, unsupported or digest-mismatched binding;
- exactly one compatible terminal winner across duplicate callbacks, retries, simultaneous tab races, crash and reopen;
- identical replay idempotency;
- conflicting replay rejection without changing the first winner, plus durable diagnostics;
- all terminal vocabulary members: `completed`, `failed`, `skipped`, `cancelled`, `abstained`;
- exact provenance/assistance binding for every terminal path;
- EvidencePolicy remains sole evidence/schedule authority; caller-supplied metadata cannot grant authority;
- compatibility with accepted executors and neighboring Today Composer ownership;
- backup -> restore -> reopen reproduces the frozen binding, terminal winner and evidence decision.

Terminal settlement behavior must provide one durable compare-and-set over the relevant Run identity, frozen-binding digest and terminal idempotency identity. This is a behavioral requirement; implementation details are not prescribed beyond the canonical boundary.

## 8. Replacement primary natural RED — exact and immutable

The old frozen overwrite/error-code predicate is NOT reused.

Fresh baseline observation from exact predecessor source:

1. `recordTodayReceipt` validates the candidate terminal envelope.
2. It constructs the new terminal row and writes it to the durable V10 `todayRuns` store.
3. Only after that durable write, an envelope carrying a decision calls `persistLearningEnvelope`.
4. Canonical event staging uses deterministic Run event identity and rejects an incompatible second envelope with `LEARNING_EVENT_COLLISION`.
5. Therefore a conflicting second terminal can be rejected by the downstream canonical event repository only after the durable Today Run winner row has already been changed to the second receipt.

The recovery Commit A primary RED is exactly:

```text
setup:
- exact parent e53d0971db1160f9b01349d2e4c17e59c6aaa99b;
- source blobs exactly 0871eab470027afb61325ba3249cb404ede813b5 and e80fc68f2596886f3002a312a053e37e302fe071;
- initialize the real repository fake-IndexedDB test substrate used by accepted Today Runner tests;
- create one valid exact-target Today Run;
- create and persist one valid first terminal envelope carrying a valid EvidencePolicy decision;
- read back and prove the first terminal receipt is durable before the conflict action.

action:
- submit a second, individually valid but incompatible terminal envelope for the same Run with a distinct attempt/receipt/idempotency identity and valid decision.

expected canonical behavior:
- the conflict is rejected;
- the first terminal receipt remains the sole durable winner;
- the rejected second terminal cannot overwrite the Run row or its frozen winner binding.

current violating behavior:
- the second call is rejected by existing downstream event persistence as LEARNING_EVENT_COLLISION;
- after that rejection, a fresh durable read of V10 todayRuns shows the second receipt/winner data because recordTodayReceipt wrote the terminal row before downstream collision detection.

first failing assertion:
- after assert.rejects confirms the natural LEARNING_EVENT_COLLISION, the first product-failing assertion must compare fresh durable readback receiptId with FIRST_RECEIPT_ID and observe SECOND_RECEIPT_ID instead.

expected product failure class:
LI_TERMINAL_WINNER_MUTATED_BEFORE_CONFLICT_REJECTION

RED eligibility predicate:
ELIGIBLE only when the first terminal was proven durable, the second envelope was valid, the second call naturally rejected with LEARNING_EVENT_COLLISION, source blobs are unchanged, and the first failing product assertion is durable winner preservation exactly as frozen above.
```

RED invalidation predicates — any one requires immediate `STOP / INVALID_OR_AMBIGUOUS_RED`:

- first receipt was not durably persisted before action;
- second envelope is malformed or fails validation/setup before the conflict seam;
- observed rejection is not the expected existing `LEARNING_EVENT_COLLISION` baseline behavior;
- durable readback cannot be completed or is not the real repository persistence substrate;
- the first failing assertion is import, setup, bootstrap, dependency, syntax, storage, infrastructure or unrelated baseline failure;
- source blobs differ from the frozen predecessor identities;
- the test accepts overwrite OR rejection as equivalent outcomes;
- the assertion is weakened, broadened or rewritten after observation;
- a mocked/read-only simulation is substituted for the durable Run row;
- another new test failure precedes the frozen assertion in the exact focused RED execution.

Commit A must place the primary RED assertion before later recovery assertions in one deterministic sequential recovery test flow so the frozen product assertion is the first new product failure on the predecessor. Later assertions may become reachable only after the primary invariant is repaired; Commit A itself may not be edited after RED is classified.

## 9. Allowed future commit topology

Exactly three commit classes are authorized. No fourth implementation/remediation commit exists.

### Commit A — TEST ONLY

```text
parent: e53d0971db1160f9b01349d2e4c17e59c6aaa99b
changed path: tests/li-00-execution-safety.test.mjs only
source blobs: unchanged exact predecessor blobs
purpose: freeze complete recovery verification and produce the exact natural RED in Section 8
```

Commit A must obtain natural `pull_request` exact-head CI. Before any source write, the executor must inspect the exact first failing product assertion and classify the RED using Section 8. Different/ambiguous failure => STOP. No source mutation follows an invalid RED.

### Commit B — SOURCE ONLY

Commit B exists only after valid RED.

```text
parent: exact Commit A
changed paths: subset of the two exact source allowlist files only
test blob: byte-identical to Commit A
purpose: smallest complete LI-00 GREEN satisfying Sections 7, 10 and 11
```

No test weakening/edit is permitted. Commit B must obtain focused verification plus natural exact-head PR CI. CI green is necessary and not acceptance.

### Commit C — EVIDENCE ONLY

Commit C exists only after Commit B satisfies the full frozen GREEN gate.

```text
parent: exact Commit B
changed paths: exact recovery evidence allowlist only
source/test blobs: byte-identical to Commit B
canonical status: unchanged
acceptance wording: forbidden
```

No Commit D. If evidence cannot be formed in this class, if a source/test remediation is needed after B, or if any unlisted artifact is required: STOP and seek a new independently audited authorization.

## 10. GREEN verification contract

Focused verification is frozen to:

```text
node --test tests/li-00-execution-safety.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs
node --check src/learning-contracts.js
node --check src/today-runner.js
node --check tests/li-00-execution-safety.test.mjs
npm run test:p1-contracts
npm run test:p1-runner
npm run test:backup
npm run test:restore
```

Exact PR verification remains:

```text
npm test
npm run check
npm run audit:roadmap
npm run audit:ielts
npm run test:v10
npm run audit:v10
npm run build
npm run test:serve
npm run test:preview
npm run test:browser
npm run test:v10-browser
npm run test:hardening
```

Expected natural workflow identity:

```text
path: .github/workflows/ci.yml
workflow name: CI
workflow ID: 322561862
workflow blob at authorization main: 6482c8a54f539cddff0fb772fdc849a1ffdee162
event: pull_request
job: test
```

Unexpected workflow identity, missing substantive steps, wrong head or manual rerun/dispatch is not valid executable evidence.

## 11. Required concurrency, durability, terminal and compatibility demonstrations

The exact Commit A test path must contain replayable assertions that, after B, demonstrate:

1. **real simultaneous incompatible terminals**: two incompatible terminal operations are released from the same barrier/turn and race concurrently against the same durable Run; exactly one wins, the loser receives stable typed conflict behavior, and fresh readback proves one winner. Two sequential calls labeled concurrency are invalid.
2. duplicate identical callback is idempotent and returns/retains the same winner.
3. retries and tab races cannot create a second terminal winner.
4. crash/reopen reads the persisted frozen binding and existing winner rather than reconstructing mutable planning state.
5. every terminal vocabulary member `completed`, `failed`, `skipped`, `cancelled`, `abstained` preserves exact terminal provenance and compatible idempotency semantics.
6. stale/missing/unsupported/digest-mismatched frozen input fails closed with stable typed behavior.
7. caller-forged eligibility/authority cannot bypass EvidencePolicy; schedule/evidence authority remains separated.
8. accepted existing executors remain usable for compatible records.
9. **real backup -> destructive test restore boundary -> reopen** using the repository's actual full-backup registry/restore path proves the V10 `todayRuns` frozen binding, terminal winner and evidence decision survive. `BACKUP_STORE_REGISTRY` already includes all V10 stores; a read-only serialization simulation is invalid.
10. migration/rollback demonstration preserves accepted legacy records; legacy rows that cannot prove immutable binding remain readable but unexecutable/coaching-only rather than having history synthesized.

If a real backup/restore/reopen demonstration requires mutation outside the source/test allowlists, STOP `RECOVERY_SOURCE_BOUNDARY_INSUFFICIENT`; do not relabel a simulation as evidence.

## 12. Canonical artifact formation and non-circular audit subject

The independent product audit subject is **Commit B**, not Commit C.

The evidence carrier is **Commit C**, whose direct parent must be Commit B. This follows the canonical EWF logical handoff tuple and avoids self-reference: implementation subject first, evidence/brief later.

Mandatory bindings:

```text
subjectCommit = Commit B SHA
parentCommit = Commit A SHA
specRevision = frozen accepted EWF validation revision used by the canonical artifact validator
pilotSpecId extension = EWF00-PILOTS-001
pilotSpecRevision extension = 6d83a23ff23ac445e33be5ddefc1ac6bac1b7843
productSpecId extension = LI-00
productSpecRevision extension = 8bbb54ca8b1ee1d5c55da05ffb23373b8dd145aa
productExecutionRecord extension = W1-LI-00-001
recoveryIdentity extension = EWF00-PILOTS-001-PILOT-B-RECOVERY-001
```

For compatibility with the accepted EWF trace/brief validator, the base trace/brief identity must use the exact accepted EWF validation spec identity/revision expected by the current validator; Pilot B and LI identities are additional binding fields under `extensions`, not replacements for base schema fields. If the current accepted validator cannot represent these extensions and exact bindings without schema/validator modification, STOP `CANONICAL_ARTIFACT_SCHEMA_CANNOT_CARRY_RECOVERY` before source mutation.

Digest topology is exact and non-circular:

1. each command declaration digest binds the exact declaration without its `declarationDigest` field;
2. `verificationManifestDigest` binds the exact verification manifest with only `extensions.verificationManifestDigest` omitted;
3. each executable evidence row `contentDigest` binds its portable/redacted payload with only its own `contentDigest` omitted;
4. `evidenceDigest = digestArtifact(trace.evidence)`;
5. `traceDigest = digestArtifact(the complete trace-manifest payload)`; trace `contentDigest` remains represented exactly as the accepted template/validator requires and is not used to create a self-reference;
6. frozen brief binds subject, parent, spec revision, traceDigest, evidenceDigest and briefIdentity;
7. `briefDigest = digestArtifact(frozen brief with only briefDigest omitted)`;
8. implementation-report `frozenBriefDigest = briefDigest` when and only when every required gate is complete and `handoffState` is `HANDOFF_READY`.

Frozen brief identity must mechanically bind its base spec and Commit B subject exactly as the accepted validator requires. Any subject/parent/spec/verification/trace/evidence/brief mismatch is invalid handoff evidence, never a warning or acceptance.

## 13. Verification-manifest and trace contract

The future `verification-manifest.json` must be a canonical schema-compatible declaration, not an execution report. Each command declaration must have a unique ID, exact command/argv/cwd/environment inheritance, timeout/tool disposition where the accepted validator requires them, requirements, and its declaration digest. Required commands may not be silently converted to optional.

The future `implementation-report.json` must populate canonical base fields and put Pilot-specific data under extensions. `HANDOFF_READY` is forbidden until subject/parent, changedFiles, requirementTrace, commandResults, environment and frozenBriefDigest are complete.

The future `trace-manifest.json` must provide a real graph:

`requirement -> test -> command -> executable evidence`.

Every command evidence row must bind the exact Commit B subject, Commit A parent, spec revision, verification-manifest digest and declaration digest and use the five-state result vocabulary:

`PASS`, `FAIL`, `ERROR`, `NOT_RUN`, `NOT_AVAILABLE`.

Connector Stage 0 metadata is not command evidence.

## 14. Measurement dataset contract

Baseline and EWF-assisted measurement must be paired and comparable. Both runs must declare the same:

- OS/runtime/tool environment fingerprint;
- repository/baseline identity relevant to the measurement;
- command set;
- measurement method and clock source;
- exclusions.

The baseline measurement must be captured before Commit A. Assisted measurement must use the same declared method. No arbitrary pass threshold is introduced.

Every metric observation, for both `baseline` and `assisted`, must contain exactly enough evidence to independently reconstruct the value:

```text
metricId
value
unit
start
end
method
exclusions
rawEvidenceRef
resultState
```

Required metric families:

```text
focusedDuration
prDuration
preflightOverhead
artifactPreparation
validatorOverhead
manualOperations
reworkFindingLoop
cliAbsentFriction
```

Rules:

- duration values derive from recorded start/end using the declared clock, not recollection;
- `manualOperations` is a numeric count with a declared counting method and raw operation log/reference;
- CLI-absent friction is quantitative according to the canonical metric definition, not `high/low` prose;
- no validator execution => `NOT_RUN` (or the exact canonical five-state equivalent) with no fabricated zero runtime;
- optional tool absence => `NOT_AVAILABLE`; required tool absence blocks;
- command crash/timeout/infrastructure failure => `ERROR`, not product `FAIL`;
- baseline and assisted raw refs must resolve to exact CI command/job/artifact or exact portable trace evidence sufficient for replay/audit.

Measurement records live under canonical schema-permitted extensions and are implementer evidence only.

## 15. Mandatory negative/recovery fixtures

The recovery test/evidence contract must execute, not narrate, each required fixture. Every fixture record must contain:

`fixtureIdentity`, `setup`, `action`, `expectedRejectionOrResult`, `observedEvidenceLocation`, `authorityBoundary`, `cleanupRule`.

Required fixture identities and minimum demonstrations:

```text
PBR-FIX-OPTIONAL-TOOL-ABSENT
- accepted verifier receives an absent OPTIONAL executable
- result is NOT_AVAILABLE and blocks only if declared required

PBR-FIX-REQUIRED-TOOL-ABSENT
- absent REQUIRED executable
- result NOT_AVAILABLE and handoff blocked

PBR-FIX-COMMAND-FAILURE
- process exits non-zero normally
- result FAIL

PBR-FIX-COMMAND-ERROR
- separate crash/timeout/infrastructure condition
- result ERROR, not FAIL

PBR-FIX-STALE-SUBJECT-EVIDENCE
- construct valid evidence for subject S1
- validate it against distinct subject S2
- exact subject mismatch is observed and handoff rejected

PBR-FIX-SUBJECT-CHANGED-AFTER-BRIEF
- freeze a valid brief for S1
- validate same old brief after subject binding changes to S2
- old handoff becomes invalid; no in-place brief reuse

PBR-FIX-PARENT-MISMATCH
- wrong Commit A parent binding
- BLOCKED_BY_INVALID_BRIEF / typed parent mismatch

PBR-FIX-SPEC-REVISION-MISMATCH
- wrong specRevision
- typed mismatch and invalid handoff

PBR-FIX-TRACE-DIGEST-MISMATCH
- mutate bound trace after brief freeze
- typed trace digest mismatch

PBR-FIX-EVIDENCE-DIGEST-MISMATCH
- mutate bound evidence after brief freeze
- typed evidence digest mismatch

PBR-FIX-BRIEF-IDENTITY-DIGEST-MISMATCH
- wrong briefIdentity and/or stale briefDigest
- typed invalid brief result

PBR-FIX-OOS-REVIEWER-FINDING
- record an out-of-scope reviewer finding as a finding without changing source/test/evidence allowlists
- execution remains stopped or continues only according to the frozen boundary; no scope expansion

PBR-FIX-ABORTED-PILOT-CLEANUP
- abort/failed pilot leaves canonical manual commands/workflow operable and preserves durable learner/history data
- cleanup does not rewrite accepted/rejected history
```

Synthetic mismatch objects are allowed only for validator negative fixtures and must use the accepted canonical artifact shapes. Product/concurrency/durability evidence must use the real repository test substrate. Every observed fixture outcome must be linked through exact test/command/trace evidence; prose such as `invalid handoff avoided` is not evidence.

## 16. Migration, rollback and cleanup

Migration is additive and non-destructive. No old envelope or receipt may be rewritten to pretend it had a frozen binding. Unsupported legacy state remains readable and fail-closed for execution where exact binding cannot be proven.

Rollback removes only the additive LI validation/settlement behavior introduced by Commit B while preserving terminal receipts, collision diagnostics, accepted historical envelopes and manual canonical workflows. A rollback demonstration must not delete learner history or accepted/rejected governance history.

Failed/aborted recovery leaves PR #35 unchanged and leaves the canonical manual repository workflow usable.

## 17. Stop conditions

Immediate STOP applies on any of:

```text
main/predecessor/source blob drift invalidating the capsule
recovery authorization not independently accepted
recovery implementation branch unexpectedly present/owned
unexpected overlapping active writer or semantic owner
source/test/evidence path outside exact allowlists
need to modify CI or dependencies
need to modify src/v10-persistence.js, persistence.js or event-repository.js
ambiguous or different natural RED
source mutation before valid RED
non-simultaneous concurrency evidence presented as race evidence
backup/restore simulation presented as real restore evidence
canonical artifact schema/validator unable to carry exact recovery bindings
unknown/circular digest topology
measurement lacking value/unit/start/end/method/exclusions/rawEvidenceRef
negative fixture not actually executed
Commit B requiring test edit
Commit C requiring source/test edit
need for Commit D or any unauthorized remediation commit
package-owner/dependency ambiguity
subject/parent/spec/trace/evidence/brief drift
```

No best-effort mutation may pass a failed gate.

## 18. Independent audit and acceptance separation

The future independent auditor reads Commit C as the evidence carrier and audits the exact product subject Commit B plus its parent Commit A. The auditor may read beyond the write allowlists.

Only an independent auditor may issue LI-00 product acceptance or Pilot B verdicts. This authorization and all future implementation artifacts remain implementer evidence/control-plane authority only.

Explicit non-effects:

```text
LI-00 acceptance: NOT_GRANTED
Pilot B acceptance: NOT_GRANTED
EWF-00 acceptance: NOT_GRANTED
canonical package status change: NONE
merge authority: NONE
Pilot B recovery execution by this document author: NONE
```

## 19. Authorization-candidate publication gate

This recovery authorization candidate itself must remain:

`DOCS ONLY / DRAFT / NOT_ACCEPTED / NOT_EFFECTIVE_UNTIL_INDEPENDENT_ACCEPT`.

Its publication delta is exactly this one documentation path. Natural exact-head `pull_request` CI is required for the authorization PR. The authorization implementer must reread the exact head/file, verify changed paths, verify main has not drifted in an authority-invalidating way, then STOP for independent authorization audit.
