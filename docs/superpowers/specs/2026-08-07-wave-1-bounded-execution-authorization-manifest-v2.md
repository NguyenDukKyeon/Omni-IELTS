Manifest:
W1-AUTH-MANIFEST-002

Protocol:
BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1

Planning predecessor:
291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a

Status:
DRAFT / NOT_EFFECTIVE

Implementation authorization:
NOT_ACTIVE

Package acceptance:
NOT_GRANTED

Recovery lineage:
REPLACEMENT_FOR_BLOCKED_CANDIDATE

Blocked manifest record:
W1-AUTH-MANIFEST-001

Blocked pull request:
30

Blocked branch:
chatgpt/w1-bounded-execution-manifest-v1

Blocked exact head:
61690e56649474727befbd1d8de5ae4bbc4af160

Blocked manifest blob:
eabdfb079871e7c9aff67f2fb795327400d61a05

Blocked exact-head CI:
run 31123078566
workflow 322561862
conclusion failure
job test cancelled
runner not acquired
zero executed steps
zero artifacts

Recovery rule:
This is a new independently auditable manifest record. It does not reuse,
continue, repair or override the failed exact-head gate of
W1-AUTH-MANIFEST-001. PR #30 remains historical, Draft, open, unmerged and
unchanged. This record has no effect unless its own exact head receives natural
pull_request CI success with all five required artifacts and an independent
exact-head ACCEPT.

# Wave 1 Bounded Execution Authorization Manifest

## 1. Authority, purpose and subordination

This document is a docs-only Wave 1 authorization manifest under ADR-046. It defines bounded execution records for LI-00, SRC-00, ERR-00 and QAR-00, plus five non-writing research lanes. It performs no package implementation, research execution, acceptance decision or package-status change.

Canonical authority remains, in descending operational role:

- `AGENTS.md` for execution rules;
- `docs/ROADMAP.md` for scope and dependencies;
- `docs/IMPLEMENTATION_PLAN.md` for implementation, acceptance, migration, rollback and stop conditions;
- `docs/IMPLEMENTATION_STATUS.md` for actual status and evidence;
- `docs/DECISIONS.md` for rationale and ADR authority;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/IMPLEMENTATION_QUEUE.md` for queue topology;
- `docs/superpowers/specs/2026-08-06-bounded-execution-capsule-governance-design.md` for the active capsule protocol.

This manifest is subordinate to every authority above. Any conflict, ambiguity or drift blocks execution.

## 2. Verified planning baseline

The authoring baseline was read at exact `main`:

```text
repository: NguyenDukKyeon/VocabMaster
default branch: main
main: 291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a
tree: 21f14f87b08b8851a77785ca3200f0840af3cae1
open PRs: #26, #27, #28, #30
historical blocked manifest PR: #30
historical blocked manifest head: 61690e56649474727befbd1d8de5ae4bbc4af160
historical blocked manifest blob: eabdfb079871e7c9aff67f2fb795327400d61a05
replacement manifest branch before creation: ABSENT
replacement manifest PR before creation: ABSENT
```

Open-PR ownership was read across the complete registry:

- PR #26 owns three EWF Pilot A authorization documents.
- PR #27 owns three connector-native EWF Pilot A authorization documents.
- PR #28 owns EWF Pilot A evidence, `src/today-composer.js`, `tests/today-composer.test.mjs` and P1-07 Today Composer semantics.
- PR #30 owns the historical blocked W1-AUTH-MANIFEST-001 candidate at exact
  head `61690e56649474727befbd1d8de5ae4bbc4af160` and exact blob
  `eabdfb079871e7c9aff67f2fb795327400d61a05`. It is immutable historical
  provenance for this recovery. It is not an effective manifest, active writer,
  successful CI subject or merge candidate. This replacement uses a distinct
  path and record identity.

Wave 1 records do not write any path owned by PR #26, #27 or #28. LI-00 owns the frozen Run and terminal-settlement seam in Today Runner, not Today composition. Exact-path separation is supplemented by semantic-owner separation.

Verified dependency state at the planning predecessor:

```text
P1-01: ACCEPTED
P1-02: ACCEPTED
P1-05: ACCEPTED
P1-06: ACCEPTED
P1-07: ACCEPTED
P1-08: ACCEPTED
P3-06: ACCEPTED
EvidencePolicy: ACTIVE / ACCEPTED / DEFAULT-DENY AUTHORITY
Phase 4: NOT_ACCEPTED
```

Therefore:

```text
LI-00: ELIGIBLE FOR MANIFEST
SRC-00 neutral Core + Transcript adapters: ELIGIBLE FOR MANIFEST
SRC-00 public-pack adapter: EXCLUDED / NOT_AUTHORIZED
ERR-00: CONDITIONALLY DEFINED / LI-00 DEPENDENCY BLOCKED
QAR-00: CONDITIONALLY DEFINED / LI-00 AND SRC-00 DEPENDENCY BLOCKED
```

Current package states remain:

```text
LI-00: PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED
SRC-00: PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED
ERR-00: PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED
QAR-00: PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED
```

## 3. Manifest activation and executable predecessor binding

This manifest is not effective while this PR is Draft or unmerged.

Activation requires all three gates:

1. independent exact-head manifest `ACCEPT`;
2. this manifest PR merged into `main` by merge commit;
3. the independent Manifest Auditor posts and reads back a literal 40-character merge SHA under:

```text
W1_MANIFEST_EXECUTABLE_PREDECESSOR_BINDING
```

The Manifest Auditor is pre-authorized only for this manifest PR to:

1. post an independent exact-head verdict;
2. fresh-check the accepted head, exact-head CI, mergeability, open-PR registry and main race state;
3. mark this manifest PR ready only after `ACCEPT`;
4. merge by merge commit;
5. read back the new `main`;
6. post the immutable executable-predecessor binding.

That authority does not authorize package implementation, package acceptance or package integration.

Batch A executable predecessor is the literal manifest merge commit in the binding record. Execution remains blocked until the record is posted and read back. No executor may derive it from a moving branch name.

Batch B bindings are:

```text
W1_ERR_EXECUTABLE_PREDECESSOR_BINDING:
exact main commit after independently accepted LI-00 integration

W1_QAR_EXECUTABLE_PREDECESSOR_BINDING:
exact main commit after independently accepted LI-00 and SRC-00 integration
```

Each binding must be posted and read back in the independent integration record before its Batch B branch is created.

## 4. Shared execution topology

### 4.1 One-writer and branch rules

Each package has one exclusive writer, one package branch and one Draft PR to `main`. Package branches are never stacked on another package branch. Batch A branches share the same literal manifest executable predecessor. Batch B branches use their own literal integration binding.

LI-00 and QAR-00 may never have simultaneous active writers. ERR-00 may not write while the LI-00 writer is changing terminal or evidence bindings. Research lanes have no repository writer.

### 4.2 Commit topology

Every package freezes this topology:

```text
Commit A: test-only, parent equals exact executable predecessor
RED: natural exact-head product-defect failure with the frozen first cause
Commit B: minimal source-only repair, parent equals Commit A
GREEN: exact-head command profile succeeds without test weakening
Commit C: optional evidence-only commit restricted to the exact evidence allowlist
```

No source mutation is permitted before an eligible RED. Commit B may not edit Commit A tests. Commit C may not edit source or tests. No additional implementation commit class is authorized.

All evidence files must contain:

```text
IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE
```

### 4.3 Shared evidence schema

Every evidence set records:

- schema version, artifact kind and authority label;
- manifest ID, record ID and package ID;
- exact predecessor, subject commit, parent and tree;
- changed paths and resulting blob identities;
- Commit A, RED, Commit B, GREEN and optional Commit C identities;
- workflow, run, attempt, job, step and artifact identities;
- exact commands, environment, start/end observations and conclusions;
- requirement-to-test trace;
- migration and rollback observations;
- limitations and explicit non-authority statements.

Evidence becomes immutable at the evidence commit. A mismatch rejects the candidate; it is not corrected by rewriting accepted history.

### 4.4 Shared baseline CI identity

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

Baseline artifacts:

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

Exact-head package CI must use workflow ID `322561862`. An unexpected workflow identity blocks acceptance.

## 5. Package record W1-LI-00-001

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

Preserved neighboring owners:

```text
P1 repositories: durable persistence
Today Composer: planning and selection
Today Runner: execution host outside the LI seam
EvidencePolicy: evidence verdict and schedule authority
skill executors: activity behavior
```

### 5.2 Exact allowlists

Source allowlist:

```text
src/learning-contracts.js
src/today-runner.js
```

Test allowlist:

```text
tests/li-00-execution-safety.test.mjs
```

Evidence allowlist:

```text
docs/superpowers/evidence/2026-08-06-w1-li-00-001/connector-governance-stage-0.raw.json
docs/superpowers/evidence/2026-08-06-w1-li-00-001/frozen-acceptance-brief.json
docs/superpowers/evidence/2026-08-06-w1-li-00-001/implementation-report.json
docs/superpowers/evidence/2026-08-06-w1-li-00-001/trace-manifest.json
docs/superpowers/evidence/2026-08-06-w1-li-00-001/verification-manifest.json
```

Baseline blob manifest:

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

An absent path is an exact baseline absence identity; no blob SHA is fabricated.

Explicit exclusions:

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

### 5.3 Test-first and RED rule

Commit A may add only `tests/li-00-execution-safety.test.mjs`.

Frozen natural RED predicate:

1. create one valid bound Today Run;
2. persist one valid terminal Receipt;
3. submit a distinct conflicting terminal Receipt for the same Run;
4. current `recordTodayReceipt` accepts the second write and replaces the first terminal winner;
5. the test requires rejection of the conflict and persistence of the original winner.

The first failing assertion must prove terminal overwrite by current product behavior. RED is invalid if the first cause is import failure, test setup, storage bootstrap, malformed envelope, infrastructure, changed source, artificial assertion or an unrelated CI failure.

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

### 5.4 Exact verification commands

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

Expected CI is `.github/workflows/ci.yml`, workflow ID `322561862`, job `test`, with verification, Core browser, IELTS browser, V10 browser and hardening artifacts bound to the exact head.

### 5.5 Migration, rollback, stop and integration

Migration is additive and non-destructive. Legacy rows remain readable and are coaching-only or explicitly unexecutable when immutable binding cannot be proven. No historical envelope is synthesized or relabeled.

Rollback removes only the additive validator, projection and settlement adapter. It may not delete terminal receipts, collision diagnostics or accepted historical envelopes. Existing P1 execution remains available for records that never used the new schema.

LI-00 stops on any global stop condition, any Today Composer semantic overlap, invalid RED, source-before-RED mutation, incomplete binding, non-atomic settlement, test weakening or migration ambiguity.

Independent `ACCEPT` is required at the exact head. Implementer evidence is not acceptance. Mechanical integration is permitted only after fresh race gates, exact-head CI success, unchanged accepted head, clean mergeability and merge-commit integration.

## 6. Package record W1-SRC-00-001

### 6.1 Record identity

```text
record ID: W1-SRC-00-001
wave: 1
batch: A
package ID: SRC-00
canonical owner: SRC-00 SourceRevisionRef syntax, adapter registry and typed resolution envelope
canonical scope: neutral Core and Transcript reference adapters plus provenance projection
dependency state: P1-01, P1-05 and P3-06 accepted; Phase 4 not accepted
predecessor binding rule: literal W1_MANIFEST_EXECUTABLE_PREDECESSOR_BINDING
exclusive writer: chatgpt-github-w1-src-primary-writer
branch: chatgpt/w1-src-00-bounded-execution-v1
PR topology: one Draft PR to main; independent verdict; no stacked branch
acceptance criteria source: ROADMAP SRC-00; IMPLEMENTATION_PLAN SRC-00; src-00-stable-source-revision-ref-spec.md
independent acceptance owner: independent canonical reviewer at exact package head
```

Underlying source repositories retain data, revisions, tombstones, deletion rules, rights and trust decisions. SRC-00 only validates and resolves portable references.

### 6.2 Exact allowlists

Source allowlist:

```text
src/source-revision-ref.js
```

Test allowlist:

```text
tests/src-00-source-revision-ref.test.mjs
```

Evidence allowlist:

```text
docs/superpowers/evidence/2026-08-06-w1-src-00-001/connector-governance-stage-0.raw.json
docs/superpowers/evidence/2026-08-06-w1-src-00-001/frozen-acceptance-brief.json
docs/superpowers/evidence/2026-08-06-w1-src-00-001/implementation-report.json
docs/superpowers/evidence/2026-08-06-w1-src-00-001/trace-manifest.json
docs/superpowers/evidence/2026-08-06-w1-src-00-001/verification-manifest.json
```

Baseline blob manifest:

```text
src/source-revision-ref.js:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a

tests/src-00-source-revision-ref.test.mjs:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a

each evidence path:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a
```

Read-only adapter anchors and planning blobs:

```text
src/learning-contracts.js: 0871eab470027afb61325ba3249cb404ede813b5
src/transcript-aggregate.js: 1f210e82f34bd0926b8a1c76f5eecf991bdf7bbf
src/backup-registry.js: 072a3d48ce1cf8d97068ec9ed19d3bcfb87a8dd0
tests/learning-contracts.test.mjs: 26690a9b87a63d04052a57dbcf0a1010fb086db7
tests/transcript-aggregate.test.mjs: 5ed7f081a8afa5b5ec2d9299aee2d5dfe81cf341
```

Explicit exclusions:

```text
public-pack adapter
source ingestion
URL, PDF or media acquisition
private Library
content compiler
publication or signing
new source store
trust-authority upgrade
source-owner mutation
active-revision mutation
CI, dependencies and canonical status
```

### 6.3 Test-first and RED rule

Commit A may add only `tests/src-00-source-revision-ref.test.mjs`.

The test must probe the accepted execution seam rather than fail because the new module is absent. Its baseline adapter uses existing `validateActivitySpec` behavior to show this exact product defect:

```text
an execution-bound target with a mutable source-revision alias and no immutable integrity token is accepted as a complete exact target
```

The required result is fail-closed typed unresolved behavior before execution. Commit A must use a controlled fallback to the existing seam when `src/source-revision-ref.js` is absent, so the first failing assertion is the accepted mutable reference, not module loading.

RED is invalid if the first cause is missing-module import, malformed fixture, database setup, source acquisition, network, public-pack policy, infrastructure or an unrelated test.

Commit B may add only `src/source-revision-ref.js` and must provide:

- versioned SourceRevisionRef shape;
- one owner per source kind and version;
- exact Core/card/activity adapter;
- exact Transcript revision adapter;
- deterministic side-effect-free resolution;
- typed `RESOLVED`, `NOT_FOUND`, `TOMBSTONED`, `UNSUPPORTED_KIND`, `UNSUPPORTED_VERSION`, `INTEGRITY_MISMATCH`, `PROVENANCE_INVALID`, `RIGHTS_BLOCKED` and `AUTHORITY_UNAVAILABLE` results;
- no fallback to active or newer revisions;
- caller-resistant provenance and privacy projection;
- unknown future data preservation without execution;
- backup, restore and reopen portability.

Public-pack resolution is absent from the registry until accepted Phase 4 contracts exist.

### 6.4 Exact verification commands

Focused profile:

```text
node --test tests/src-00-source-revision-ref.test.mjs tests/learning-contracts.test.mjs tests/transcript-aggregate.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs
node --check src/source-revision-ref.js
node --check tests/src-00-source-revision-ref.test.mjs
npm run test:p1-contracts
npm run test:p1-transcripts
npm run test:backup
npm run test:restore
npm run phase3:verify
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

Expected CI and artifact binding are the shared CI identity in Section 4.4.

### 6.5 Migration, rollback, stop and integration

Existing `(sourceId, sourceRevision)` pairs are adapted without rewriting history. A pair that cannot prove one immutable revision remains unresolved or coaching-only. Export excludes protected source bodies, credentials and private absolute paths.

Rollback removes the generic reference registry and adapters only. Underlying sources, revisions, tombstones and historical attempt references remain intact and exportable.

SRC-00 stops on duplicate adapter ownership, ambiguous source kind, mutable alias reaching execution, digest mismatch acceptance, provenance promotion, public-pack inclusion, source-owner mutation, data duplication, invalid RED or any global stop condition.

SRC-00 may receive an independent verdict regardless of LI-00 outcome. Integration order is LI-00 first, then SRC-00. Before SRC merge, main may differ from the shared Batch A predecessor only by independently accepted LI-00 integration and non-overlapping manifest-governed history.

## 7. Package record W1-ERR-00-001

### 7.1 Record identity

```text
record ID: W1-ERR-00-001
wave: 1
batch: B
package ID: ERR-00
execution state: CONDITIONALLY PRE-AUTHORIZED / DEPENDENCY BLOCKED
canonical owner: ERR-00 ErrorCandidate state, decision provenance and promotion saga
canonical scope: uncertain claim containment and atomic idempotent promotion into P1-06
dependency state: P1-06 accepted; future LI-00 independent ACCEPT and accepted integration required
predecessor binding rule: literal W1_ERR_EXECUTABLE_PREDECESSOR_BINDING
exclusive writer: chatgpt-github-w1-err-primary-writer
branch: chatgpt/w1-err-00-bounded-execution-v1
PR topology: one Draft PR to main after dependency binding; no stacked branch
acceptance criteria source: ROADMAP ERR-00; IMPLEMENTATION_PLAN ERR-00; err-00-error-candidate-lifecycle-spec.md
independent acceptance owner: independent canonical reviewer at exact package head
```

P1-06 remains sole owner of ErrorRecord, occurrence, correction and repair queue. EvidencePolicy remains sole evidence and schedule authority.

### 7.2 Exact allowlists

Source allowlist:

```text
src/error-candidate-lifecycle.js
```

Test allowlist:

```text
tests/err-00-error-candidate-lifecycle.test.mjs
```

Evidence allowlist:

```text
docs/superpowers/evidence/2026-08-06-w1-err-00-001/connector-governance-stage-0.raw.json
docs/superpowers/evidence/2026-08-06-w1-err-00-001/frozen-acceptance-brief.json
docs/superpowers/evidence/2026-08-06-w1-err-00-001/implementation-report.json
docs/superpowers/evidence/2026-08-06-w1-err-00-001/trace-manifest.json
docs/superpowers/evidence/2026-08-06-w1-err-00-001/verification-manifest.json
```

Baseline blob manifest:

```text
src/error-candidate-lifecycle.js:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a

tests/err-00-error-candidate-lifecycle.test.mjs:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a

each evidence path:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a
```

Read-only integration anchors:

```text
src/error-repository.js: 248bd5dd0d3a175f0539edab54335676b5b57961
src/evidence-policy.js: 30caf46dbd71862313325d6832d7e2f72d285e87
tests/error-repository.test.mjs: 0b96212ff3406cae042419d03fc4b78abb484089
tests/evidence-policy.test.mjs: e616442d7bffeee69e98e55d876d5d8f7db5cb82
```

Explicit exclusions:

```text
modification of src/error-repository.js
modification of src/evidence-policy.js
second ErrorRecord store
repair-queue ownership
answer scoring
mastery inference
FSRS write
AI or provider authority
canonical occurrence deletion
CI, dependencies and canonical status
```

### 7.3 Test-first and RED rule

Commit A may add only `tests/err-00-error-candidate-lifecycle.test.mjs`.

The test must use a controlled baseline adapter to the existing P1-06 entry point and prove this current product defect:

```text
an AI/provider advisory claim can be passed directly to recordErrorOccurrence and create a canonical occurrence without an ErrorCandidate decision gate
```

The required behavior is an `OPEN` candidate with zero P1-06 occurrence effect until direct user confirmation or exact-target qualified evidence confirms it. The test must not fail because `src/error-candidate-lifecycle.js` is absent.

RED is invalid if the first cause is missing-module import, database setup, malformed claim, provider unavailability, network, artificial assertion or an unrelated test.

Commit B may add only `src/error-candidate-lifecycle.js` and must implement:

- `OPEN`, `CONFIRMED`, `REJECTED`, `EXPIRED`, `PROMOTION_PENDING` and `PROMOTED` lifecycle;
- immutable decision revisions and supersession links;
- explicit permitted authority matrix;
- deterministic P1-06 occurrence identity;
- crash-recoverable promotion saga;
- duplicate identical promotion idempotency;
- conflicting promotion collision;
- durable rejection and expiry;
- correction and retraction provenance without deletion;
- AI-unavailable manual operation;
- zero direct evidence, schedule or mastery authority.

### 7.4 Exact verification commands

Focused profile:

```text
node --test tests/err-00-error-candidate-lifecycle.test.mjs tests/error-repository.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs
node --check src/error-candidate-lifecycle.js
node --check tests/err-00-error-candidate-lifecycle.test.mjs
npm run test:p1-errors
npm run test:backup
npm run test:restore
npm run phase1:verify
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

Expected CI and artifact binding are the shared CI identity in Section 4.4.

### 7.5 Migration, rollback, stop and integration

Legacy advisory entries may migrate only to non-promoted candidates with actual provenance. Migration never infers user confirmation. Existing P1-06 occurrences remain canonical and are not converted into candidates.

Rollback disables new candidate intake and promotion, preserves unresolved export and never deletes a P1-06 occurrence already written.

ERR-00 stops unless LI-00 has independent `ACCEPT`, accepted integration read-back, P1-06 remains accepted and the literal ERR predecessor is posted and read back. It also stops on direct AI promotion, P1-06 owner mutation, duplicate canonical effect, ambiguous decision authority, invalid RED or any global stop condition.

## 8. Package record W1-QAR-00-001

### 8.1 Record identity

```text
record ID: W1-QAR-00-001
wave: 1
batch: B
package ID: QAR-00
execution state: CONDITIONALLY PRE-AUTHORIZED / DEPENDENCY BLOCKED
canonical owner: QAR-00 question schema, registry, normalization, scorer interface and capability negotiation
canonical scope: shared objective Reading and Listening contract seam using canonical P1 execution
dependency state: future LI-00 and SRC-00 independent ACCEPT plus accepted integration required
predecessor binding rule: literal W1_QAR_EXECUTABLE_PREDECESSOR_BINDING
exclusive writer: chatgpt-github-w1-qar-primary-writer
branch: chatgpt/w1-qar-00-bounded-execution-v1
PR topology: one Draft PR to main after dependency binding; no stacked branch
acceptance criteria source: ROADMAP QAR-00; IMPLEMENTATION_PLAN QAR-00; qar-00-shared-question-activity-runtime-spec.md
independent acceptance owner: independent canonical reviewer at exact package head
```

QAR-00 is a registry and contract seam, not a second runtime, scheduler, Attempt store or complete IELTS inventory.

### 8.2 Exact allowlists

Source allowlist:

```text
src/question-activity-runtime.js
```

Test allowlist:

```text
tests/qar-00-question-activity-runtime.test.mjs
```

Evidence allowlist:

```text
docs/superpowers/evidence/2026-08-06-w1-qar-00-001/connector-governance-stage-0.raw.json
docs/superpowers/evidence/2026-08-06-w1-qar-00-001/frozen-acceptance-brief.json
docs/superpowers/evidence/2026-08-06-w1-qar-00-001/implementation-report.json
docs/superpowers/evidence/2026-08-06-w1-qar-00-001/trace-manifest.json
docs/superpowers/evidence/2026-08-06-w1-qar-00-001/verification-manifest.json
```

Baseline blob manifest:

```text
src/question-activity-runtime.js:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a

tests/qar-00-question-activity-runtime.test.mjs:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a

each evidence path:
ABSENT_AT_291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a
```

Read-only integration anchors:

```text
src/learning-contracts.js: 0871eab470027afb61325ba3249cb404ede813b5
src/today-runner.js: e80fc68f2596886f3002a312a053e37e302fe071
src/ielts-domain.js: ad456590cc08bedf0f1553218cc889084a34f1c7
src/ielts-content.js: 61883156c4b4e39838ae0f70b628c1cff413f741
src/evidence-policy.js: 30caf46dbd71862313325d6832d7e2f72d285e87
```

Explicit exclusions:

```text
second runtime
second scheduler
second Attempt store
Today ownership
IELTS inventory ownership
media acquisition
EvidencePolicy ownership
Writing or Speaking artifact ownership
full-coverage claim
modification of LI-00 or SRC-00 paths
CI, dependencies and canonical status
```

### 8.3 Test-first and RED rule

Commit A may add only `tests/qar-00-question-activity-runtime.test.mjs`.

The test must use a controlled baseline adapter to current `validateActivitySpec` behavior and prove this current product defect:

```text
an arbitrary unregistered objective question kind and executor capability declaration can pass the current generic ActivitySpec validation without a question-kind registry or typed capability rejection
```

The required behavior is typed rejection before Run start. The test must not fail because `src/question-activity-runtime.js` is absent.

RED is invalid if the first cause is missing-module import, malformed fixture, source resolution, media setup, browser setup, artificial assertion or an unrelated test.

Commit B may add only `src/question-activity-runtime.js` and must implement:

- one owner per `(questionKind, schemaVersion)`;
- schema validator, response normalizer, scorer or reviewer adapter and capability declaration;
- immutable source, prompt, key or rubric and scorer revision binding;
- deterministic objective scoring;
- explicit review-required semantics;
- typed unsupported kind, version and capability behavior;
- canonical Attempt and Receipt output without parallel storage;
- complete AssistanceTrace integration;
- unknown schema preservation without execution;
- one bounded existing objective executor adapter;
- accessibility, keyboard, focus and review capability checks;
- honest per-kind coverage reporting.

### 8.4 Exact verification commands

Focused profile:

```text
node --test tests/qar-00-question-activity-runtime.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/ielts-domain.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs
node --check src/question-activity-runtime.js
node --check tests/qar-00-question-activity-runtime.test.mjs
npm run test:p1-contracts
npm run test:p1-runner
npm run test:ielts
npm run test:v10
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
npm run test:ielts-browser
npm run test:v10-browser
npm run test:hardening
```

Expected CI and artifact binding are the shared CI identity in Section 4.4.

### 8.5 Migration, rollback, stop and integration

At least one accepted objective executor is wrapped without rewriting historical attempts. Content that cannot be represented losslessly stays on its accepted executor and is recorded as an explicit coverage gap.

Rollback removes the QAR registry and adapter route. Canonical attempts and source references remain readable. Unknown QAR data remains exportable and unexecutable.

QAR-00 stops unless LI-00 and SRC-00 each have independent `ACCEPT`, both integrations are read back and the literal QAR predecessor is posted and read back. It also stops on simultaneous LI writer activity, a second runtime or store, source or evidence ownership transfer, unsupported fallback, inflated coverage claim, invalid RED or any global stop condition.

## 9. Non-writing research records

All research records share this fixed authority boundary:

```text
repository mutation: FORBIDDEN
branch: NONE
PR: NONE
durable product evidence: NONE
package status authority: NONE
library or dependency lock: FORBIDDEN
production claim: FORBIDDEN
```

Research may read repository content, use disposable temporary files, use tools already present in the disposable environment and record observed benchmark output outside the repository. It may not install or lock production dependencies, edit package manifests, write source, tests or docs, create canonical evidence, authorize product behavior or generalize observations beyond the recorded environment.

Every result records environment, exact commands, inputs, observed output and limitations.

### W1-RL-FFPROBE-001

```text
scope: disposable browser and media-format capability probe
question: which tested format and API combinations operate in the recorded environment
forbidden inference: universal browser or production support
```

### W1-RL-ASR-LIVE-COMPARISON-001

```text
repository mutation: FORBIDDEN
branch: NONE
PR: NONE
durable product evidence: NONE
package status authority: NONE
dependency installation or lock: FORBIDDEN
production provider selection: FORBIDDEN

scope: Disposable exact-environment comparison of Moonshine and faster-whisper for bounded live/local ASR observations.
baseline: faster-whisper is the existing local ASR baseline for VocabMaster.
comparison candidates: Moonshine; faster-whisper.

Each tested artifact must record exact identity:
- upstream repository;
- release, tag or exact commit;
- model name and revision;
- model digest when available;
- code license;
- model license;
- redistribution restrictions;
- commercial-use restrictions;
- attribution obligations.

Each benchmark must freeze:
- operating system;
- CPU/GPU;
- RAM;
- runtime and package version;
- compute type;
- quantization;
- sample rate;
- audio format;
- VAD configuration;
- chunk size and overlap;
- decoding configuration;
- beam size;
- language mode;
- streaming or batch mode;
- cold-start or warm state.

Fixture rights boundary:
- synthetic, rights-cleared or explicitly consented audio only.

Required fixture coverage:
- English;
- Vietnamese;
- English–Vietnamese code-switching;
- clean speech;
- noisy speech;
- short utterance;
- sustained speech;
- long-form audio;
- numbers;
- proper names;
- punctuation-sensitive sentence.

Required metrics for each exact model and configuration:
- model download size;
- cold-start time;
- first-partial latency;
- final-result latency;
- real-time factor;
- peak CPU;
- peak RAM;
- GPU/VRAM when available;
- partial-result stability;
- WER;
- CER;
- cancellation behavior;
- timeout behavior;
- cleanup behavior;
- failure modes;
- offline capability;
- Windows compatibility.

Inference-mode classification must distinguish:
- native live/streaming inference;
- simulated streaming by chunking;
- batch transcription.

Batch transcription or chunk simulation must not be described as native streaming.

Boundaries:
- the benchmark does not select a production provider;
- the benchmark does not authorize dependency installation;
- the benchmark does not authorize repository mutation;
- the benchmark does not create package evidence;
- the benchmark does not change package status;
- the benchmark does not prove pronunciation-scoring capability;
- the benchmark does not prove semantic understanding;
- the benchmark does not prove general ASR quality;
- results apply only to the exact recorded model, version, language, fixture, hardware, runtime and configuration;
- Moonshine must not be claimed better than faster-whisper, or faster-whisper better than Moonshine, unless exact evidence supports the specific criterion;
- lower latency does not imply better accuracy;
- better WER does not imply better production suitability.
```

### W1-RL-SEGMENTATION-ALIGNMENT-001

```text
scope: disposable transcript segmentation and alignment experiments
question: observed boundary and alignment behavior on exact fixtures
forbidden inference: canonical transcript correction or source authority
```

### W1-RL-TOOL-DOCTOR-001

```text
scope: read-only environment tool inventory and command diagnostics
question: which exact tools and versions are exposed in the recorded environment
forbidden inference: availability in every executor environment
```

### W1-RL-TASK1-VISUAL-PROTOTYPE-001

```text
scope: disposable visual prototype for Task 1 interaction research
question: observed usability and rendering notes from a non-repository prototype
forbidden inference: production UI implementation, acceptance or repository authorization
```

## 10. Batch A execution and integration

LI-00 and SRC-00 branches remain separate. One bounded executor capsule may operate both only after fresh proof of:

- disjoint exact allowlists;
- disjoint semantic owners;
- compatible exclusive writers;
- no open-PR overlap;
- the same literal Batch A predecessor.

Each package retains its own Commit A, RED run, RED verdict, Commit B, GREEN run, evidence set, PR, independent audit and package verdict. A rejection or blockage of one package does not conceal or invalidate the other package result.

Independent package verdicts may occur in either order. Mechanical integration order is fixed:

```text
LI-00 accepted PR
→ merge commit
→ fresh main read-back
→ post W1_ERR_EXECUTABLE_PREDECESSOR_BINDING
→ SRC-00 accepted PR
→ merge commit
→ fresh main read-back
→ post W1_QAR_EXECUTABLE_PREDECESSOR_BINDING
```

Before every merge, require:

- accepted head unchanged;
- exact-head required CI successful;
- clean mergeability;
- no new file or semantic overlap;
- main satisfies the frozen predecessor or integration rule;
- merge method is merge commit.

Squash and rebase are forbidden. A package auditor may not modify implementation before verdict.

## 11. Global stop conditions

Every record fails closed on:

```text
main or head drift
branch race
incomplete pagination
missing canonical owner
file overlap
semantic overlap
writer collision
dependency violation
source mutation before eligible RED
invalid or ambiguous RED
test weakening
unauthorized implementation commit class
unexpected workflow identity
missing artifact
evidence subject mismatch
migration ambiguity
rollback requiring deletion
acceptance conflict
caller-selected evidence authority
AI or provider-selected canonical authority
public-pack SRC inclusion
Pilot B authorization
```

A subsequent success cannot override an earlier failed gate. Execution resumes only through a new independently authorized record.

## 12. Non-effects

This manifest does not:

```text
implement LI-00
implement SRC-00
implement ERR-00
implement QAR-00
run research
create package implementation branches
change product behavior
change canonical package status
change dependencies
change acceptance criteria
modify CI
add dependencies
authorize Pilot B
accept EWF-00
accept any Wave 1 package
```

## 13. Manifest self-verification

Before authoring mutation, the Manifest Author verified:

```text
four package records complete
five research records complete
exact allowlists resolved
no wildcard implementation allowlist
existing writable paths bound to blob SHAs
new writable paths bound to exact absence identities
exact command profiles present
dependency topology consistent
Batch A packages independently rejectable
Batch B dependency blocked
public-pack SRC adapter excluded
Pilot B unauthorized
open PR overlap checked
LI and SRC semantic non-overlap proven
blocked PR #30 identity frozen
blocked CI run and zero-artifact state frozen
replacement branch and PR absence verified before creation
replacement manifest uses a distinct path
Moonshine comparison span byte-identical to blocked blob
no failed-gate evidence reused
no PR #30 mutation
```

A lexical scan of this manifest must report zero prohibited drafting markers. Any ambiguous result invalidates the candidate.

## 14. Manifest PR authority boundary

The independent Manifest Auditor may accept and mechanically integrate this manifest PR only under Section 3. After exact-head CI observation, the Manifest Author stops. The Manifest Author may not self-accept, mark ready, merge, create package branches, run research, change package status, authorize Batch B execution or modify PR #26, PR #27, PR #28 or PR #30.
