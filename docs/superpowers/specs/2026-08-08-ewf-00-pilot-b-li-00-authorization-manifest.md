# EWF-00 Pilot B / LI-00 Probe Authorization Manifest

Authorization manifest state:
`DRAFT / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE`

Protocol:
`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`

EWF pilot identity:
`EWF00-PILOTS-001 / Pilot B`

Product package:
`LI-00`

Product execution record:
`W1-LI-00-001`

Product authorization source:
`W1-AUTH-MANIFEST-004`

Authorization baseline:
`e53d0971db1160f9b01349d2e4c17e59c6aaa99b`

Resolved W1 product executable predecessor:
`e53d0971db1160f9b01349d2e4c17e59c6aaa99b`

This document is a docs-only EWF authorization overlay. It creates no second LI-00 execution capsule, no product implementation, no Pilot B execution, no package acceptance, no canonical status change, no new evidence path and no new implementation writer.

## 1. Authority and identity separation

Canonical authority remains:

- `AGENTS.md` for repository execution rules;
- `docs/ROADMAP.md` for package scope and dependency;
- `docs/IMPLEMENTATION_PLAN.md` for implementation, acceptance, migration, rollback and stop conditions;
- `docs/IMPLEMENTATION_STATUS.md` for canonical execution status/evidence ledger;
- `docs/DECISIONS.md` for rationale and ADR authority;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-pilots-measurement-audit-spec.md` for `EWF00-PILOTS-001` pilot, measurement and EWF audit obligations;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/li-00-canonical-execution-safety-spec.md` for the LI-00 product boundary;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/IMPLEMENTATION_QUEUE.md` for Wave 0/Wave 1 sequencing;
- `docs/superpowers/specs/2026-08-06-bounded-execution-capsule-governance-design.md` and ADR-046 for bounded execution capsule governance;
- accepted `W1-AUTH-MANIFEST-004` for the exact product execution capsule.

The two identities remain distinct:

```text
EWF PILOT IDENTITY:
EWF00-PILOTS-001 / Pilot B

PRODUCT EXECUTION RECORD:
W1-LI-00-001
```

The product execution record is not renamed, duplicated or absorbed into the EWF identity. The EWF pilot identity does not become the LI package record.

## 2. Fresh Stage 0 authorization findings

Fresh repository observations before this manifest was created:

```text
repository:
NguyenDukKyeon/VocabMaster

default branch:
main

main:
e53d0971db1160f9b01349d2e4c17e59c6aaa99b

main tree:
a7a8497dc7d3282d635c71cad00957767eae5c61

target manifest path before creation:
ABSENT

target authorization branch before creation:
ABSENT

open PR registry:
#26
#27
#28
#30
#31
#32

W1 Batch A LI implementation branch:
ABSENT

Pilot B authorization branch:
ABSENT

LI test path at current main:
ABSENT

LI implementation-report evidence path at current main:
ABSENT
```

Open PR ownership is non-overlapping with the W1-LI-00-001 source/test semantic boundary:

- PR #26 is Pilot A docs-only authorization history;
- PR #27 is Pilot A connector-native docs-only authorization history;
- PR #28 owns Pilot A evidence plus `src/today-composer.js` and `tests/today-composer.test.mjs`;
- PR #30, #31 and #32 are historical blocked Wave 1 manifest candidates on distinct documentation paths.

No open PR writes `src/learning-contracts.js`, `src/today-runner.js` or `tests/li-00-execution-safety.test.mjs`. PR #28's Today Composer boundary remains a distinct neighboring owner explicitly excluded by W1-LI-00-001.

Historical/recovery candidates that never entered `main`, have no active implementation writer and do not overlap this manifest path remain provenance only and are not modified.

## 3. Accepted prerequisite lineage

### W1-AUTH-MANIFEST-004

PR #33 is merged. Its accepted manifest subject is:

`9906974d08e7be9714268a43b1d96d94816c569f`

Accepted manifest tree:

`a7a8497dc7d3282d635c71cad00957767eae5c61`

Accepted manifest blob:

`c595577e738847fc25fe9cb5e633f4e93ee559e9`

Independent W1 manifest acceptance comment:

`5212739464`

Verdict:

`ACCEPT`

W1 executable-predecessor binding comment:

`5212765715`

Binding name:

`W1_MANIFEST_EXECUTABLE_PREDECESSOR_BINDING`

Binding state:

`ACTIVE`

Literal executable predecessor:

`e53d0971db1160f9b01349d2e4c17e59c6aaa99b`

The binding also records `NO_PACKAGE_IMPLEMENTATION`, `NO_RESEARCH_EXECUTION` and `NO_BATCH_A_STARTED`. No LI implementation branch or overlapping LI PR appeared after that binding and before this authorization manifest was created.

### Pilot A immutable acceptance

Independent Pilot A audit comment `5199827810` records `VERDICT: ACCEPT` and the post-acceptance state:

```text
Pilot A:
ACCEPTED / COMPLETED

EWF00-PILOTS-001:
PILOT_A_ACCEPTED / PILOT_B_PENDING / NOT_COMPLETED

Pilot B:
UNAUTHORIZED

EWF-00:
IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED
```

ADR-046 preserves this as:

`Pilot A: ACCEPTED HISTORICALLY / UNCHANGED`

The current canonical status ledger still contains stale wording that both pilots remain unauthorized. That stale wording is not rewritten here and does not reinterpret the immutable Pilot A verdict.

```text
KNOWN_CANONICAL_LEDGER_DEBT /
DEFERRED_TO_FINAL_EWF_RECONCILIATION
```

### Protocol activation lineage

PR #29 independently accepted ADR-046 / `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` at exact head and subsequently merged to `main` at `291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a`. The protocol's activation condition of independent exact-head `ACCEPT` plus merge is therefore satisfied. Pilot B nevertheless remained unauthorized pending its own manifest.

## 4. Selected bounded architecture probe

The selected bounded spec-level architecture probe is exactly:

```text
PRODUCT PACKAGE:
LI-00

PRODUCT EXECUTION RECORD:
W1-LI-00-001

EWF ROLE:
bounded spec-level Pilot B architecture probe
```

This selection follows the canonical `EWF00-PILOTS-001` specification, which identifies a narrow LI-00 execution-safety slice as the preferred architecture probe only after its own authorization and dependency gates. Product authorization is already supplied by accepted `W1-AUTH-MANIFEST-004`; this manifest supplies only the separate EWF Pilot B authorization layer.

No SRC-00, ERR-00, QAR-00 or other product candidate is selected by this manifest.

## 5. W1-LI-00-001 frozen product execution record — reused without modification

The following product-owned values are copied from accepted W1-AUTH-MANIFEST-004 and are not rewritten, broadened or replaced by this EWF overlay.

### 5.1 Record identity

```text
record ID: W1-LI-00-001
wave: 1
batch: A
package ID: LI-00
canonical owner: LI-00 frozen execution binding and terminal-settlement seam
canonical scope: additive ActivitySpec/Run/Attempt/Receipt binding hardening and first-terminal-wins settlement
dependency state: P1-01, P1-02, P1-07, P1-08 and EvidencePolicy accepted
predecessor binding rule: literal W1_MANIFEST_EXECUTABLE_PREDECESSOR_BINDING
exclusive writer: chatgpt-github-w1-li-primary-writer
branch: chatgpt/w1-li-00-bounded-execution-v1
PR topology: one Draft PR to main; independent verdict; no stacked branch
acceptance criteria source: ROADMAP LI-00; IMPLEMENTATION_PLAN LI-00; li-00-canonical-execution-safety-spec.md
independent acceptance owner: independent canonical reviewer at exact package head
```

Resolved predecessor value from the accepted ACTIVE W1 binding:

```text
e53d0971db1160f9b01349d2e4c17e59c6aaa99b
```

The eventual merge commit of this Pilot B authorization PR is not the LI-00 product executable predecessor and must never replace the literal W1 binding above.

Preserved neighboring owners:

```text
P1 repositories: durable persistence
Today Composer: planning and selection
Today Runner: execution host outside the LI seam
EvidencePolicy: evidence verdict and schedule authority
skill executors: activity behavior
```

### 5.2 Exact source allowlist

```text
src/learning-contracts.js
src/today-runner.js
```

### 5.3 Exact test allowlist

```text
tests/li-00-execution-safety.test.mjs
```

### 5.4 Exact product evidence allowlist

```text
docs/superpowers/evidence/2026-08-06-w1-li-00-001/connector-governance-stage-0.raw.json
docs/superpowers/evidence/2026-08-06-w1-li-00-001/frozen-acceptance-brief.json
docs/superpowers/evidence/2026-08-06-w1-li-00-001/implementation-report.json
docs/superpowers/evidence/2026-08-06-w1-li-00-001/trace-manifest.json
docs/superpowers/evidence/2026-08-06-w1-li-00-001/verification-manifest.json
```

### 5.5 Exact baseline blob identities

```text
src/learning-contracts.js:
0871eab470027afb61325ba3249cb404ede813b5

src/today-runner.js:
e80fc68f2596886f3002a312a053e37e302fe071

tests/li-00-execution-safety.test.mjs:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a

each evidence path:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a
```

The two source blob identities above were fresh-read unchanged on the current authorization baseline. Absence identities remain historical W1 baseline identities and are not rewritten to a moving `main` value.

### 5.6 Exact exclusions

```text
src/today-composer.js
tests/today-composer.test.mjs
new runtime
new Attempt or Receipt store
new scheduler
activity inventory
multi-item assessment
AI authority
FSRS behavior change
historical evidence rewrite
source repository ownership
question schema ownership
CI, dependencies and canonical status
```

### 5.7 W1 shared baseline CI identities

```text
workflow path: .github/workflows/ci.yml
workflow blob: 6482c8a54f539cddff0fb772fdc849a1ffdee162
workflow name: CI
workflow ID: 322561862
baseline run ID: 31109880564
baseline run number: 301
baseline attempt: 1
baseline event: push
baseline head: 291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a
baseline tree: 21f14f87b08b8851a77785ca3200f0840af3cae1
baseline job: test
baseline job ID: 92644565298
baseline conclusion: success
package.json blob: 09421080935deb64e14564520e262c41814cbd6f
```

W1 baseline artifacts:

```text
verification-output:
8971201145
sha256:ba451471b4bda935d02a6de71cba1ffde3b33932fef5a86e7a8b04dff3eac218

browser-smoke-output:
8971205059
sha256:5b7dc2b898733a3f8c5f620992de4a6ee89b60c2d1343c3f1c46fc69e204c528

ielts-browser-output:
8971207583
sha256:8ec0ea7f78c67ec1fa15785f2833135c220823d717d15a8f30b93f9665a76586

v10-browser-output:
8971212529
sha256:f5645e3cb7d85e02e6315b343abeaa520490f814739fda0dedcf937483bf3911

hardening-browser-output:
8971215477
sha256:cf60fcaf35109bb9dfc252a46b2b2eff91989ff5dad7b70ab6a6edff4003fd37
```

These historical W1 baseline identities are preserved. The active workflow identity was also fresh-read for this authorization and remains workflow ID `322561862`, name `CI`, path `.github/workflows/ci.yml`, state `active`, blob `6482c8a54f539cddff0fb772fdc849a1ffdee162`.

## 6. Exact W1 test-first topology — no duplicate execution

There is only one LI execution.

### Commit A — TEST-ONLY

W1 shared topology:

```text
Commit A: test-only, parent equals exact executable predecessor
RED: natural exact-head product-defect failure with the frozen first cause
```

Commit A may add only:

```text
tests/li-00-execution-safety.test.mjs
```

Its parent must be the literal ACTIVE W1 product predecessor:

```text
e53d0971db1160f9b01349d2e4c17e59c6aaa99b
```

Zero source mutation is permitted before an eligible RED.

Frozen natural RED predicate:

```text
1. create one valid bound Today Run;
2. persist one valid terminal Receipt;
3. submit a distinct conflicting terminal Receipt for the same Run;
4. current `recordTodayReceipt` accepts the second write and replaces the first terminal winner;
5. the test requires rejection of the conflict and persistence of the original winner.
```

Frozen W1-LI-00-001 RED invalidation predicates:

```text
The first failing assertion must prove terminal overwrite by current product behavior. RED is invalid if the first cause is import failure, test setup, storage bootstrap, malformed envelope, infrastructure, changed source, artificial assertion or an unrelated CI failure.
```

The protocol-level natural RED gate additionally remains fail-closed for syntax errors, missing dependencies, unrelated baseline failures, weakened assertions, source mutation, unexpected workflows or ambiguous causal chains. These protocol gates do not rewrite the W1-LI-00-001 predicate above.

### Commit B — MINIMAL SOURCE-ONLY GREEN

W1 Commit B boundary is unchanged:

```text
Commit B may change only the two source paths and must implement the complete LI-00 seam with the smallest additive change:

- strict immutable target, source, prompt/config, evaluation and policy binding;
- explicit inapplicable fields under a versioned schema;
- persisted binding before executor side effects;
- resume and reload from persisted binding;
- first-terminal-wins compare-and-set semantics;
- identical replay idempotency;
- durable conflicting-terminal diagnostics;
- complete assistance and provenance binding;
- stale, missing, unsupported or digest-mismatched input failure;
- crash, reopen and backup/restore reproducibility.
```

Commit B direct parent must be Commit A. Commit B may not edit the Commit A tests.

### Commit C — OPTIONAL EVIDENCE-ONLY

W1 shared rule remains:

```text
Commit C: optional evidence-only commit restricted to the exact evidence allowlist
```

Commit C may not edit source or tests. No additional implementation commit class is authorized. No Pilot B convenience path is added.

## 7. Exact W1 verification profile

Focused profile:

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

Exact-head PR profile:

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

Exact W1 CI requirement:

```text
.github/workflows/ci.yml
workflow ID 322561862
job test
verification artifact
Core browser artifact
IELTS browser artifact
V10 browser artifact
hardening artifact
all bound to the exact head
```

An unexpected CI workflow identity blocks execution/acceptance.

## 8. Exact W1 migration, rollback and product stop boundary

Migration boundary:

```text
Migration is additive and non-destructive. Legacy rows remain readable and are coaching-only or explicitly unexecutable when immutable binding cannot be proven. No historical envelope is synthesized or relabeled.
```

Rollback boundary:

```text
Rollback removes only the additive validator, projection and settlement adapter. It may not delete terminal receipts, collision diagnostics or accepted historical envelopes. Existing P1 execution remains available for records that never used the new schema.
```

W1-LI-00-001 product stop conditions remain:

```text
LI-00 stops on any global stop condition, any Today Composer semantic overlap, invalid RED, source-before-RED mutation, incomplete binding, non-atomic settlement, test weakening or migration ambiguity.
```

Independent `ACCEPT` remains required at the exact product head. Implementer evidence is not acceptance. Mechanical product integration remains permitted only after fresh race gates, exact-head CI success, unchanged accepted head, clean mergeability and merge-commit integration.

## 9. One execution / two evidence interpretations

Exactly one immutable LI-00 implementation execution supplies two separately interpreted evidence dimensions:

### A. PRODUCT EVIDENCE

Owned by `W1-LI-00-001`, stored only within its exact product evidence allowlist, and evaluated against LI-00 acceptance criteria. It does not automatically grant Pilot B acceptance.

### B. EWF PILOT B EVIDENCE

Uses the same immutable LI execution to evaluate EWF workflow fitness and overhead. It does not grant LI-00 product acceptance.

Required separate verdict dimensions:

```text
LI-00 PRODUCT VERDICT:
independent canonical product reviewer at exact product head

EWF PILOT B VERDICT:
independent EWF auditor at exact frozen Pilot B handoff
```

No second LI branch, writer, test commit, source commit, RED or GREEN is authorized.

## 10. EWF Pilot B authorization overlay

Additional EWF-owned obligations frozen by this manifest:

```text
Pilot identity:
EWF00-PILOTS-001 / Pilot B

Architecture probe:
W1-LI-00-001

Canonical product owner:
LI-00

Product authorization source:
W1-AUTH-MANIFEST-004

Product executable predecessor:
e53d0971db1160f9b01349d2e4c17e59c6aaa99b

Product executor:
chatgpt-github-w1-li-primary-writer

Independent EWF auditor:
separate read-only exact-head audit context; must not be the LI executor and must not self-author the Pilot B evidence verdict
```

Purpose:

evaluate whether the existing EWF workflow supports a bounded spec-level product change with correct:

- structured spec/trace;
- preflight;
- writer/allowlist enforcement;
- natural RED;
- minimal GREEN;
- exact evidence;
- frozen handoff;
- invalidation behavior;
- measurable overhead.

The EWF overlay does not change the product owner, product scope, dependency, predecessor, writer, branch, PR topology, product allowlists, RED/GREEN boundary, verification profile, migration/rollback or LI acceptance owner.

## 11. EWF Pilot B evidence without allowlist expansion

Existing accepted EWF artifact schemas provide an `extensions` surface on the implementation-report and verification/trace artifact family. The accepted W1-LI-00-001 evidence allowlist already contains:

`docs/superpowers/evidence/2026-08-06-w1-li-00-001/implementation-report.json`

Therefore Pilot B observations and measurement metadata must be represented within the existing authorized artifact/schema surface, using an EWF namespaced extension while preserving the artifact authority label:

`IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`

The existing W1 trace/brief/evidence digest bindings must bind that immutable content. Raw observation references may point to exact PR/CI/job/artifact/audit records without creating a new repository file path.

This is representation reuse, not a second evidence authority. The W1 product evidence allowlist remains byte-for-byte the five paths in section 5.4.

If the executor's fresh accepted EWF/W1 validator cannot represent the required Pilot B observations in that existing schema surface, execution must stop before any product mutation with:

`EWF_EVIDENCE_PATH_REQUIRES_SEPARATE_AUTHORITY`

No LI allowlist expansion is authorized by this manifest.

## 12. Measurement contract

Baseline and EWF-assisted runs must use the same recorded:

- OS/environment;
- Node/tool versions;
- repository state;
- command set;
- measurement method.

Required metrics are exactly:

```text
Focused duration
PR duration
Preflight overhead
Artifact preparation
Validator overhead
Manual operations
Rework/finding loop
CLI-absent friction
```

Each metric records:

```text
value
unit
start/end
method
exclusions
raw evidence reference
```

Metric boundaries remain canonical:

- Focused duration: command runtime, separated from wrapper overhead;
- PR duration: declared PR command runtime, separated from queue/startup;
- Preflight overhead: elapsed and manual actions to freeze repository/writer scope;
- Artifact preparation: repair/spec metadata, trace, report and brief authoring time/actions;
- Validator overhead: trace/brief validation runtime and diagnostic review time;
- Manual operations: count for baseline and pilot, with operation definition frozen first;
- Rework/finding loop: number and cause of invalidations/remediation rounds;
- CLI-absent friction: missing functions or extra manual steps with Spec Kit CLI absent.

There is no arbitrary pass threshold. A slower pilot remains visible. No budget or threshold may be changed after execution to manufacture a pass.

## 13. Baseline measurement gate before Commit A

Pilot B execution Stage 0 must record the required baseline/manual-workflow measurement on the same declared environment before Commit A is created.

The baseline observation may not mutate product source or tests.

Required transition:

```text
fresh Pilot B execution Stage 0
→ same-environment baseline/manual measurement recorded
→ measurement comparability confirmed
→ Commit A may be created
```

If a comparable baseline cannot be established, Pilot B execution stops before Commit A. Product execution must not proceed merely because W1 product authorization exists.

## 14. Required negative and recovery evidence

The Pilot B evidence set must preserve all applicable canonical EWF demonstrations, using accepted EWF validation mechanisms and synthetic/disposable fixtures rather than production-source mutation:

- wrong HEAD fails before writes;
- dirty/untracked implementation state fails where canonical preflight requires it;
- writer overlap fails before writes;
- duplicate requirement/test identity is detected;
- broken trace/reference is detected;
- missing required command/evidence is detected;
- stale subject evidence is rejected;
- subject/spec/evidence/trace/brief digest mismatch invalidates handoff;
- optional tool absent is represented as `NOT_AVAILABLE` and blocks only when declared required;
- required tool absent blocks;
- command product/test failure remains `FAIL`;
- crash/timeout/infrastructure failure remains `ERROR` and is not coerced to `FAIL` or `PASS`;
- amended/changed subject after handoff freeze invalidates the old handoff;
- an out-of-scope reviewer finding is recorded without expanding remediation;
- failed/aborted pilot cleanup leaves the canonical manual workflow usable.

No fixture may dirty the real source worktree, alter remote refs or modify production source to manufacture a negative case.

## 15. Pilot B execution stop conditions

Pilot B execution fails closed if any of the following becomes true:

- W1 executable predecessor does not match the literal ACTIVE binding;
- LI writer conflict appears;
- source/test allowlist needs expansion;
- a second runtime/store/status authority becomes necessary;
- RED first cause differs from the frozen natural defect;
- source changes before valid RED;
- tests are weakened;
- implementation needs a second LI implementation commit class;
- subject/spec/evidence changes after handoff freeze;
- evidence is stale or mismatched;
- Pilot B requires product-package expansion;
- canonical owner becomes ambiguous;
- unexpected CI workflow identity appears;
- required measurement cannot be made comparably;
- product execution needs a dependency not already authorized;
- Today Composer semantics would be changed or overlapped;
- immutable binding is incomplete;
- settlement cannot be made atomic;
- migration or rollback becomes ambiguous;
- the existing evidence schema cannot carry the required EWF observations without a new repository path.

A stop condition blocks the pilot; it does not authorize selection of another candidate or expansion to SRC-00, ERR-00 or QAR-00.

## 16. Authorization activation and independent auditor mechanical authority

This manifest is not effective while its authorization PR is Draft/unmerged or before an independent exact-head manifest `ACCEPT`.

After an exact-head `ACCEPT` of this authorization manifest only, the Independent Pilot B Authorization Auditor is pre-authorized to perform this mechanical sequence:

1. post the exact-head authorization verdict;
2. read the verdict back;
3. fresh-check `main`, authorization subject head, exact-head CI, artifacts, mergeability, review findings and open-PR/writer race state;
4. mark only this authorization PR ready;
5. merge only this authorization PR by MERGE COMMIT;
6. read back merged PR, new `main`, merge parents, tree and manifest blob;
7. post and read back `EWF00_PILOT_B_AUTHORIZATION_BINDING`.

The binding must identify:

```text
accepted authorization subject
manifest merge commit
EWF identity: EWF00-PILOTS-001 / Pilot B
product record: W1-LI-00-001
literal W1 product executable predecessor: e53d0971db1160f9b01349d2e4c17e59c6aaa99b
```

Activation requires that binding to be posted and read back after the independent manifest `ACCEPT` and merge.

The new authorization manifest merge commit is not the LI product executable predecessor. The LI product predecessor remains `e53d0971db1160f9b01349d2e4c17e59c6aaa99b`.

This mechanical authority does not authorize the auditor to execute Pilot B, create the LI implementation branch, create Commit A, run the Pilot B baseline as executor, create RED/GREEN, write product source/tests/evidence, accept LI-00, complete `EWF00-PILOTS-001`, accept EWF-00 or reconcile canonical status.

## 17. Product and package acceptance non-effects

This authorization has no package-acceptance effect.

```text
Pilot A:
ACCEPTED HISTORICALLY / UNCHANGED

Pilot B:
AUTHORIZED only after independent manifest ACCEPT + activation

W1-LI-00-001:
PRODUCT EXECUTION RECORD / NOT_YET_EXECUTED BY THIS TASK

LI-00:
PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED

EWF00-PILOTS-001:
NOT_COMPLETED

EWF-00:
IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED

W1 Batch A:
NO EXECUTION IN THIS TASK
```

No product/package status changes are authorized.

## 18. Independence boundary

The authorization manifest implementer must stop after creating this Draft authorization PR and observing its natural exact-head CI. The implementer must not:

- self-ACCEPT;
- mark the authorization PR ready;
- merge the authorization PR;
- post activation binding;
- create the LI implementation branch;
- write Commit A;
- run Pilot B baseline as executor;
- create RED;
- write source;
- create GREEN;
- create product evidence;
- claim LI-00 accepted;
- claim Pilot B completed;
- claim `EWF00-PILOTS-001` completed;
- claim EWF-00 accepted;
- reconcile canonical status;
- start SRC-00;
- start Wave 1 research;
- start Batch B.

## 19. Authorization PR exact-head CI gate

The authorization PR itself must use only the natural `pull_request` event created when its Draft PR is opened.

Required workflow identity:

```text
workflow ID: 322561862
workflow name: CI
workflow path: .github/workflows/ci.yml
workflow state: active
workflow blob at authorization baseline: 6482c8a54f539cddff0fb772fdc849a1ffdee162
```

Required authorization-head observations:

- event = `pull_request`;
- workflow head equals the sole authorization commit;
- run completed;
- run conclusion success;
- job `test` completed successfully;
- `runner_id` is nonzero;
- `runner_name` is non-empty;
- executed steps are present;
- every artifact normally emitted by the workflow is present and bound to the exact authorization head:
  - `verification-output`;
  - `browser-smoke-output`;
  - `ielts-browser-output`;
  - `v10-browser-output`;
  - `hardening-browser-output`.

No rerun, dispatch, second commit, PR edit solely to retrigger, ready toggle, close/reopen or alternate trigger is authorized. If the natural exact-head run is absent, this candidate stops as `BLOCKED / EXACT_HEAD_NATURAL_CI_ABSENT`; no recovery candidate may be created inside this task.

## 20. Authorization repository delta

This authorization candidate is allowed exactly one repository path:

```text
docs/superpowers/specs/2026-08-08-ewf-00-pilot-b-li-00-authorization-manifest.md
```

Required delta:

```text
1 added documentation file
0 modified existing files
0 deleted files
```

Forbidden in this authorization task:

- modification of `AGENTS.md`;
- modification of `docs/ROADMAP.md`;
- modification of `docs/IMPLEMENTATION_PLAN.md`;
- modification of `docs/IMPLEMENTATION_STATUS.md`;
- modification of `docs/DECISIONS.md`;
- modification of EWF canonical package specs;
- modification of W1-AUTH-MANIFEST-004;
- modification of `IMPLEMENTATION_QUEUE.md`;
- source/test/CI/package/lockfile changes.

## 21. Audit handoff state

Before independent authorization audit, the required state is:

```text
EWF00-PILOTS-001 / Pilot B:
AUTHORIZATION_PENDING_INDEPENDENT_AUDIT

W1-LI-00-001:
ACCEPTED PRODUCT EXECUTION RECORD / NOT_EXECUTED_BY_THIS_AUTHORIZATION_TASK

LI-00:
PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED

EWF00-PILOTS-001:
NOT_COMPLETED

EWF-00:
IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED

Pilot A canonical-ledger discrepancy:
KNOWN_CANONICAL_LEDGER_DEBT / DEFERRED_TO_FINAL_EWF_RECONCILIATION
```

The Independent Auditor must use fresh immutable repository, CI, artifact, PR and writer facts. This manifest author supplies authorization evidence only and cannot issue the acceptance verdict.
