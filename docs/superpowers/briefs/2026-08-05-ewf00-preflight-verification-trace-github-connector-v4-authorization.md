# EWF00-PREFLIGHT-001 — Frozen Corrected GitHub Connector v4 Authorization

Authorization status: `FROZEN / CONNECTOR_IMPLEMENTATION_AUTHORIZED / NOT_ACCEPTANCE`

Activation state: `PENDING_FRESH_INDEPENDENT_EXACT_HEAD_ACCEPT`

This brief freezes a corrected connector-native implementation authorization for `EWF00-PREFLIGHT-001`. It changes only the implementation substrate and governance bootstrap. It does not change the frozen adapter behavior, implement source, create an implementation branch, open an implementation PR, change CI or dependencies, alter canonical status, authorize pilots, merge or close any pull request, or issue implementation/package acceptance.

## 1. Immutable authority identity

| Field | Frozen literal value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Authorized bounded spec | `EWF00-PREFLIGHT-001` |
| Requirement namespace | `EWF00-PVT-01` through `EWF00-PVT-12` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Exact main / plan parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Connector authorization branch | `chatgpt/ewf-00-preflight-trace-authorization-v4` |
| Exact plan path | `docs/superpowers/plans/2026-08-05-ewf-00-preflight-verification-trace-github-connector-v4.md` |
| Exact plan commit / approved implementation predecessor | `250b879fa06b7be50a198e3cf007637c5f9d7306` |
| Exact plan blob | `c45255836ca211d7f07f010016c68b568da6b193` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Designated connector writer | `chatgpt-github-ewf00-preflight-primary-writer` |
| Writer mode | `exclusive` |
| Execution substrate | `GitHub connector + existing GitHub Actions` |
| Package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

Commit `250b879fa06b7be50a198e3cf007637c5f9d7306` is a direct child of exact main `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` and changes only the exact plan path. The plan at that commit is mode `100644`, type `blob`, exact blob `c45255836ca211d7f07f010016c68b568da6b193`.

A different commit, parent, path, blob, abbreviated SHA, rewritten history, squash, rebase, or force-push invalidates this authorization. The rejected v3 plan commit `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` is historical evidence only and is not an implementation predecessor under v4.

Canonical authority remains solely:

```text
AGENTS.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
```

The plan, this brief, HANDOFF, pull-request metadata, GitHub API observations, CI records, implementation evidence, and audit comments remain subordinate. They cannot determine package ownership, dependency truth, canonical status, release safety, pilot authorization, or acceptance.

`EWF00-ARTIFACTS-001` remains accepted and preserved. `EWF00-PILOTS-001`, P3-02, product work, canonical-status changes, and acceptance remain excluded.

## 2. Activation and historical authorization relationship

This authorization is frozen but not effective until a fresh independent docs-only audit returns `ACCEPT` on the exact final head of the v4 authorization PR.

Before that exact-head `ACCEPT`:

- do not create `chatgpt/ewf-00-preflight-verification-trace-mvp`;
- do not write any implementation source/template/test path;
- do not open an implementation PR;
- do not treat this brief as superseding an earlier authorization;
- do not claim implementation or package acceptance.

Current historical state is explicitly preserved:

- PR #18 remains open and declares `EWF00-PREFLIGHT-001`;
- PR #20 remains open and declares `EWF00-PREFLIGHT-001`;
- PR #21 remains open and is the rejected v3 connector authorization;
- this brief does not edit, rewrite, add commits to, mark ready, merge, or close PR #18, PR #20, or PR #21.

After v4 receives exact-head docs `ACCEPT`, Connector Governance Stage 0 must still enumerate every open PR. It will remain `BLOCKED` while PR #18, PR #20, PR #21, or any other retained open PR satisfies the frozen overlap rules. Closing or otherwise removing those overlaps requires a separate explicit governance action. This brief does not authorize that action.

The v4 docs audit verdict is authorization acceptance only. It is not adapter implementation acceptance and not `EWF-00` package acceptance.

## 3. Exact future implementation boundary

Only these paths may be created or modified by the future implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Every other path is unauthorized. Explicit exclusions include:

```text
AGENTS.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
.github/**
src/**
server/**
public/**
package.json
package-lock.json
scripts/ewf-artifacts.mjs
existing accepted EWF templates/tests
evidence/report files in the implementation subject
dependencies
CI
product behavior
pilots
P3-02
package status
acceptance verdicts
```

The adapter must import and reuse these accepted exports from `scripts/ewf-artifacts.mjs`:

```text
COMMAND_RESULTS
canonicalizeArtifact
digestArtifact
validateArtifact
validateFrozenBrief
redactPortableValue
```

Forbidden behavior includes direct `node:crypto`, duplicate digest/canonicalization/portable-redaction logic, CI/dependency mutation, retry, discovery, installation, remediation engine, orchestration runtime, and acceptance/status/release verdict generation.

## 4. Mandatory separation of contracts

Two different contracts are frozen and must not be conflated.

### Contract A — Connector Governance Stage 0

Connector Governance Stage 0 is an external GitHub repository/API governance gate whose sole purpose is to protect remote implementation-branch creation.

It is not:

- the product adapter preflight;
- an implementation of `EWF00-PVT-01` or `EWF00-PVT-02`;
- a substitute for read-only local Git/filesystem/worktree observations;
- command-result evidence;
- executable adapter evidence;
- a content-digested EWF artifact;
- acceptance evidence.

### Contract B — Frozen Product Adapter Contract

The product adapter implemented in the four authorized files remains the exact bounded-spec behavior. It consumes an approved change-set declaration and read-only Git/filesystem state; validates repository root, canonical files, HEAD, parent, ref, worktree, cleanliness, remote collision, writer/registry, overlap, canonical gates, allowlist/exclusions; executes only declared verification commands; packages content-digested artifacts; and produces zero writes on failure.

Connector Stage 0 cannot satisfy, replace, weaken, or remove any Contract B requirement or fixture.

## 5. Contract A — Connector Governance Stage 0

### 5.1 Required observations

Using GitHub API/repository metadata only, Stage 0 must record:

- repository identity `NguyenDukKyeon/VocabMaster`;
- default/base branch `main`;
- current exact main SHA `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- plan commit `250b879fa06b7be50a198e3cf007637c5f9d7306`;
- plan parent `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- exact plan path and blob `c45255836ca211d7f07f010016c68b568da6b193`;
- implementation branch absence;
- implementation PR absence;
- v4 authorization PR state, Draft state, branch, and exact audited head;
- complete open-PR registry;
- complete changed filenames for every open PR;
- declared spec, semantic-key, branch, and writer overlap;
- writer `chatgpt-github-ewf00-preflight-primary-writer`, mode `exclusive`;
- exact four-file allowlist;
- exact semantic-conflict keys;
- canonical entry gates;
- no authorized source, CI, dependency, status, pilot, product, or acceptance mutation.

Semantic-conflict keys are exactly:

```text
ewf:preflight-observation
ewf:verification-execution
ewf:trace-validation
ewf:frozen-handoff-validation
```

Canonical gates require:

| Gate | Required observation |
|---|---|
| Repository | exact `NguyenDukKyeon/VocabMaster` |
| Main | exact `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Plan lineage | `250b879fa06b7be50a198e3cf007637c5f9d7306` direct child of exact main |
| Plan object | exact path and blob `c45255836ca211d7f07f010016c68b568da6b193` |
| EWF status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Artifact predecessor | accepted `EWF00-ARTIFACTS-001` remains preserved |
| Pilots | `EWF00-PILOTS-001` remains unauthorized |
| Implementation branch | absent |
| Implementation PR | absent |
| Authorization | fresh independent exact-head v4 docs `ACCEPT` exists |

### 5.2 Complete open-PR registry

Before branch creation, the connector must:

1. enumerate all open PRs across all pages;
2. read each PR's number, state, Draft state, head branch, head SHA, body, and complete changed-filename list;
3. exclude only the exact v4 authorization PR head that received independent docs `ACCEPT`;
4. retain every other open PR, including historical/rejected authorizations;
5. fail closed if enumeration, pagination, body retrieval, or changed-filename retrieval is incomplete.

Stage 0 is `BLOCKED` if another open PR:

- changes any implementation allowlist path;
- declares `EWF00-PREFLIGHT-001`;
- declares a semantic-conflict key;
- uses the future implementation branch;
- declares the designated writer;
- has unclear writer ownership for the same scope.

Semantic independence must not be inferred from filenames, branch names, Draft status, history, narrative intent, or prior verdict.

### 5.3 Raw normalized metadata output

Stage 0 output is raw normalized GitHub metadata with:

```text
recordType = CONNECTOR_GOVERNANCE_STAGE_0_RAW_METADATA
result = PASS | BLOCKED
observedAt
repository
repositoryApiIdentity
defaultBranch
mainRef
mainSha
planCommit
planParent
planPath
planBlob
authorizationPrNumber
authorizationPrState
authorizationPrDraft
authorizationPrHeadBranch
authorizationPrHeadSha
implementationBranch
implementationBranchState
implementationPrState
writer
writerMode
allowlist
semanticConflictKeys
canonicalGateResults
openPrRows
diagnostics
```

Each normalized PR row contains:

```text
number
state
draft
headBranch
headSha
bodyScopeDeclarations
changedFilenames
specDeclarations
semanticKeyDeclarations
writerDeclarations
overlapDiagnostics
```

Stable ordering is limited to raw evidence shape:

- PR rows by numeric PR number ascending;
- changed filenames and declaration arrays lexicographically;
- diagnostics by severity, code, PR number, path, then message;
- exact GitHub strings, SHAs, source identities, and observation timestamp preserved.

Stage 0 raw metadata must not contain, require, or claim:

```text
openPrRegistryDigest
contentDigest
declarationDigest
verificationManifestDigest
digestArtifact execution
canonicalizeArtifact execution
redactPortableValue execution
command-result evidence
local Git evidence
local filesystem/worktree evidence
```

No off-repository SHA, hash, canonicalization, or redaction implementation may be invented. Digest generation for preserved Stage 0 metadata is deferred to a separately authorized evidence-only revision after executable implementation and exact-head GREEN CI exist.

A `BLOCKED` raw record authorizes zero mutation. A `PASS` raw record is still governance metadata only.

### 5.4 Sole authorized connector mutation

Only after all of the following are true:

1. fresh independent exact-head docs `ACCEPT` on v4;
2. separate explicit governance action has removed all retained open overlaps;
3. a fresh complete Stage 0 returns `PASS`;
4. implementation branch and implementation PR remain absent;

create exactly:

```text
branch = chatgpt/ewf-00-preflight-verification-trace-mvp
source SHA = 250b879fa06b7be50a198e3cf007637c5f9d7306
```

Do not create from main, v3 plan `42bf5bdb782984d0ed662202d1b5a9a3d5066d43`, PR #18/#20/#21, another authorization head, another plan, or an abbreviated SHA.

The branch-creation response must bind the resulting exact ref and SHA. If the branch exists, do not update, reuse, delete, force, or replace it. Do not create an alternate or second-writer branch. Stop.

## 6. Contract B — Frozen product adapter preflight

### 6.1 Required approved declaration

The adapter declaration must bind at least:

```text
repository
repositoryRoot
requiredCanonicalFiles
approvedPlanPath
approvedPlanCommit
approvedPlanBlob
expectedHead
expectedPredecessorParent
expectedSymbolicRef
expectedLocalTargetRef
expectedWorktree
requiredSingleWorktree
remoteName
remoteTargetRef
remoteCollisionPolicy
remoteExpectedState
remoteExpectedSha
writer
writerMode
activeWriterRegistry
allowlist
exclusions
semanticConflictKeys
canonicalEntryGates
verificationManifest
```

Missing, ambiguous, abbreviated, path-only, malformed, or internally inconsistent identity blocks before any write or initializer.

### 6.2 Required read-only Git/filesystem observations

The adapter must support and test:

- repository root identity;
- presence and identity of required canonical files;
- exact HEAD;
- exact predecessor parent;
- exact symbolic branch/ref;
- exact local target ref and SHA;
- exact declared worktree identity;
- single declared implementation worktree;
- clean tracked state;
- clean index/staged state;
- clean untracked state;
- remote repository identity;
- declared remote collision policy and exact target observation;
- declared writer and mode;
- complete active writer registry;
- file overlap;
- semantic overlap;
- exact canonical entry gates;
- allowlist and exclusions;
- zero writes on every blocking/error result.

The injected read-only Git boundary must represent observations equivalent to:

```text
git rev-parse --show-toplevel
git rev-parse HEAD
git rev-parse HEAD^
git symbolic-ref --quiet HEAD
git show-ref --verify refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
git status --porcelain=v1 -z --untracked-files=all
git worktree list --porcelain
git remote get-url origin
git ls-remote --refs origin refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
```

Required observations must fail closed when absent, malformed, truncated, ambiguous, or errored. Connector metadata cannot be interpreted as proof of local root, ref, worktree, or cleanliness.

### 6.3 Repository, HEAD, ref, worktree, and cleanliness gates

The adapter blocks distinct conditions for:

- wrong repository;
- wrong repository root;
- missing canonical file;
- canonical path escaping root;
- wrong HEAD;
- wrong parent;
- detached or wrong symbolic ref;
- absent/wrong local target ref;
- local target ref at wrong SHA;
- wrong declared worktree;
- multiple declared implementation worktrees;
- malformed/incomplete worktree registry;
- dirty tracked file;
- staged/index change;
- tracked deletion/rename;
- untracked file;
- malformed/incomplete status observation.

Every such case proves zero repository writes, index writes, Git mutations, branch mutations, installations, retries, remediation actions, and acceptance outputs.

### 6.4 Writer, registry, overlap, remote collision, and boundary gates

The adapter requires:

- writer present and exact;
- writer mode `exclusive`;
- complete active writer registry;
- each active row binds writer, branch/ref, worktree, files, and semantic keys;
- no file overlap;
- no semantic overlap;
- exact declared collision policy;
- successful remote observation;
- `REQUIRE_ABSENT` means empty exact-target output, state `ABSENT`, SHA `null`;
- returned target is `REMOTE_TARGET_COLLISION`;
- failed observation is `REMOTE_OBSERVATION_ERROR`;
- malformed rows or inconsistent state/SHA block;
- no fetch, retry, remote-tracking inference, policy inference, or branch mutation;
- exact four-file allowlist and full exclusions;
- any CI/dependency/canonical/status/product/pilot/acceptance request blocks.

### 6.5 Mandatory local-adapter fixtures

The authorized test file must include at least:

- wrong repository;
- wrong repository root;
- missing required canonical file;
- canonical path escape;
- wrong HEAD;
- wrong parent;
- detached symbolic ref;
- wrong symbolic ref;
- wrong local target ref;
- local target ref at wrong SHA;
- wrong worktree identity;
- multiple declared worktrees;
- malformed/incomplete worktree registry;
- dirty tracked worktree;
- staged/index change;
- dirty untracked worktree;
- malformed/incomplete status observation;
- missing writer;
- wrong writer;
- non-exclusive writer mode;
- missing registry;
- incomplete registry;
- file overlap;
- semantic overlap;
- remote collision;
- remote observation failure;
- malformed remote identity/row;
- broken canonical gate;
- allowlist mismatch;
- exclusion mismatch;
- attempted out-of-bound write;
- zero-write assertion for every blocking fixture.

Fixtures use disposable repositories/directories and synthetic evidence. They must not dirty or alter the user's source worktree. Connector Stage 0 cannot remove, replace, skip, or weaken these fixtures.

## 7. Verification, trace, brief, and executable digest contract

The adapter retains:

- `argv` as execution authority;
- `command` as display-only;
- exact cwd/environment/timeout/tool requirement;
- per-command `declarationDigest`;
- `verificationManifestDigest`;
- exact states `PASS`, `FAIL`, `ERROR`, `NOT_RUN`, `NOT_AVAILABLE`;
- no retry, discovery, installation, remediation, or green coercion;
- deterministic ordering;
- trace topology `requirement → test → command → evidence`;
- duplicate-ID/broken-reference/missing-required-evidence detection;
- frozen-brief identity/completeness validation without product interpretation or acceptance verdict.

Adapter-produced preflight, verification, trace, and brief artifacts use exactly:

```text
normalize complete object
→ redactPortableValue
→ omit top-level contentDigest
→ digestArtifact
→ attach contentDigest
→ serialize
```

Declaration identity uses:

```text
normalize exact declaration without declarationDigest
→ digestArtifact
→ attach declarationDigest
```

Manifest identity uses:

```text
normalize exact manifest
→ omit verificationManifestDigest
→ digestArtifact
→ attach verificationManifestDigest
```

This executable digest contract belongs to the implemented adapter and CI tests. It is not a pre-implementation Connector Stage 0 digest mechanism. GitHub API operations and raw Stage 0 metadata are not command results.

## 8. Frozen CI-driven implementation topology

No squash, rebase, force-push, or hidden failed evidence is allowed.

### Commit A

```text
message: test(ewf): define preflight verification trace contracts
parent: 250b879fa06b7be50a198e3cf007637c5f9d7306
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

Commit A defines initial frozen local Git/filesystem/worktree adapter tests, verification/trace/brief declarations, digest boundary, and connector-governance separation. Open a Draft implementation PR after Commit A. Existing CI is expected RED only because implementation/templates are absent. Do not add an artificial failing assertion.

### Commit B

```text
message: feat(ewf): add preflight verification trace templates
parent: exact Commit A
changed paths only:
  .specify/templates/ewf/preflight-result.template.json
  .specify/templates/ewf/trace-manifest.template.json
```

The preflight template describes adapter-produced Contract B evidence, not Contract A raw metadata.

### Commit C

```text
message: feat(ewf): implement preflight verification trace adapter
parent: exact Commit B
changed path only: scripts/ewf-preflight-trace.mjs
```

Commit C implements Contract B. It must not treat Stage 0 metadata as a substitute for local observations.

### Commit D

```text
message: test(ewf): complete preflight verification trace matrix
parent: exact Commit C
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

Commit D completes all local-adapter fixtures, `EWF00-PVT-01` through `EWF00-PVT-12`, verification/trace/brief/digest/redaction/error cases, forbidden implementation checks, and raw-no-digest Stage 0 separation. Final existing CI must be GREEN at exact Commit D.

Any remediation uses a separate disclosed commit, only authorized paths, exact failed CI evidence, no hidden failed runs, no rewrite of A–D, and cumulative four-file containment.

## 9. Existing GitHub Actions only

`.github/**` remains unchanged. The existing PR CI job executes repository tests, cross-check, roadmap/IELTS/V10 audits, build, exact-head Phase 4/5 verification, serve/preview, and browser/IELTS/V10/hardening smoke checks.

Focused EWF gates must be embedded in `tests/ewf-preflight-verification-trace.test.mjs` and exercised through `npm test`, including:

- accepted artifact contract;
- adapter/test importability;
- all frozen local Git/filesystem/worktree fixtures;
- disposable repository/directory isolation;
- zero-write assertions;
- direct `node:crypto` prohibition;
- duplicate digest/canonicalization/redaction prohibition;
- exact four-file boundary;
- deterministic diagnostics;
- no retry/discovery/install/remediation;
- Spec Kit absence;
- declaration/manifest/content digest and redaction projections;
- Stage 0 raw-metadata/no-premature-digest separation.

Evidence must distinguish raw GitHub governance metadata, commands actually executed by CI, focused sub-gates inside `npm test`, static GitHub object/diff audit, and independent acceptance observations.

## 10. Connector write discipline

After valid branch creation:

- all repository writes use the GitHub connector;
- only the designated connector writer writes;
- auditors/reviewers are read-only;
- re-read exact branch HEAD before every write;
- bind the expected exact predecessor;
- verify path absence before create;
- re-read and bind exact blob before update;
- no parallel same-path writes;
- no overwrite of unread changes;
- stop on unexpected head movement;
- read back exact resulting ref, commit, parent, changed paths, and blobs.

Remote mutation correctness does not replace Contract B adapter behavior; Contract B is proven by executable CI and disposable fixtures.

## 11. Evidence and acceptance topology

After final implementation subject and exact-head GREEN CI:

- evidence/report files require separate evidence-only revision authorization;
- preserved raw Stage 0 metadata may be digested only under that later authorization using the accepted executable implementation path;
- implementer evidence status is `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`;
- evidence binds plan/brief/implementation identities, exact changed files, CI run/job IDs, declaration/manifest identities, trace/evidence/brief identities, raw GitHub metadata observations, and executable CI observations;
- raw metadata and executable evidence remain distinct provenance layers;
- a fresh independent exact-head read-only audit owns the implementation verdict.

Passing this slice does not accept `EWF-00`, authorize `EWF00-PILOTS-001`, change package status, authorize product work, resolve P3-02, or merge a PR.

## 12. Stop conditions

Stop if:

- main differs from exact baseline;
- plan commit/path/blob/parent mismatches;
- this brief is not a direct child of exact plan commit;
- fresh exact-head v4 docs `ACCEPT` is absent;
- an open PR overlap remains;
- complete open-PR enumeration or changed-filename retrieval is unavailable;
- implementation branch or PR exists;
- Stage 0 claims/requires a digest, accepted-helper execution, command result, or local evidence;
- branch creation needs update/reuse/delete/force/alternate behavior;
- a write needs a path outside the four-file boundary;
- Contract B omits or weakens any repository/root/canonical/HEAD/parent/ref/worktree/single-worktree/cleanliness/remote/writer/registry/overlap/gate/allowlist/zero-write requirement;
- mandatory disposable fixtures are removed, replaced, skipped, or weakened;
- CI, dependency, accepted artifact implementation, canonical docs/status, product, pilots, P3-02, or acceptance must change;
- required exact-SHA CI evidence is unavailable;
- a false local, connector, digest, or acceptance claim is needed to pass.

This brief remains subordinate authorization documentation only and remains `NOT_ACCEPTANCE`.
