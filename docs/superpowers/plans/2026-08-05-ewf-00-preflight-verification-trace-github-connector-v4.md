# EWF-00 Preflight Verification Trace — Corrected GitHub Connector v4 Implementation Plan

**Goal:** Authorize one bounded implementation of `EWF00-PREFLIGHT-001` using GitHub connector writes and the repository's existing GitHub Actions workflow while preserving, without weakening or replacing, the frozen local Git/filesystem/worktree adapter contract.

**Architecture:** Two contracts remain strictly separate. Connector Governance Stage 0 is an external GitHub-metadata gate that protects remote branch creation and emits only raw normalized metadata. The product adapter implemented in the four authorized files remains the frozen `EWF00-PREFLIGHT-001` adapter: it consumes an approved change-set declaration plus read-only Git/filesystem observations, validates repository/HEAD/parent/ref/worktree/cleanliness/writer/overlap/gates, executes only declared verification commands, and produces content-digested artifacts through accepted EWF primitives.

**Tech Stack:** GitHub connector for repository mutations; existing `.github/workflows/ci.yml` for executable verification; Node.js ESM and `node:test` for the future four-file implementation; accepted exports from `scripts/ewf-artifacts.mjs`; no dependency, CI, product, canonical-status, or pilot change.

> This document is authorization planning only. It does not invoke or authorize an implementation execution skill, create the implementation branch, write implementation files, or claim acceptance.

## Global constraints and immutable identity

| Field | Frozen value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Bounded specification | `EWF00-PREFLIGHT-001` |
| Requirement namespace | `EWF00-PVT-01` through `EWF00-PVT-12` |
| Frozen specification subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Exact main / plan parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Connector authorization branch | `chatgpt/ewf-00-preflight-trace-authorization-v4` |
| Required future implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Designated connector writer | `chatgpt-github-ewf00-preflight-primary-writer` |
| Writer mode | `exclusive` |
| Package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Authorization state before audit | `DOCS_ONLY / NOT_EFFECTIVE / NOT_ACCEPTANCE` |

This plan commit must be a direct child of exact main `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` and must change only this path. GitHub assigns the exact commit SHA and plan blob SHA after creation. Commit 2 and Commit 3 must bind those literal values, this exact path, and this exact parent. A path-only binding, abbreviated SHA, different blob, different parent, rewritten commit, squash, rebase, or force-push invalidates the authorization.

The rejected v3 plan commit `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` is historical evidence only and is not an approved implementation predecessor under v4.

Canonical authority remains solely:

```text
AGENTS.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
```

This plan, its brief, HANDOFF, pull-request records, GitHub metadata, CI records, implementation evidence, and audit comments remain subordinate. They cannot set package ownership, dependency truth, canonical status, release safety, pilot authorization, or acceptance.

The accepted `EWF00-ARTIFACTS-001` slice remains preserved. `EWF00-PILOTS-001`, P3-02, product work, package-status changes, and acceptance remain unauthorized.

---

## Exact future implementation file map

Only these four paths may be created or modified by the future implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

| Path | Frozen responsibility |
|---|---|
| `.specify/templates/ewf/preflight-result.template.json` | Versioned adapter-produced preflight result shape for local Git/filesystem/worktree observations, deterministic diagnostics, result state, portable redaction, and `contentDigest`; no connector Stage 0 schema and no acceptance field. |
| `.specify/templates/ewf/trace-manifest.template.json` | Versioned `requirement → test → command → evidence` topology, exact declaration identities, verification manifest identity, subject identity, and digest bindings. |
| `scripts/ewf-preflight-trace.mjs` | Frozen product adapter with injected read-only Git/filesystem/process boundaries, declared-command execution, trace validation, frozen-brief identity validation, accepted artifact reuse, deterministic diagnostics, and zero-write failure behavior. |
| `tests/ewf-preflight-verification-trace.test.mjs` | Disposable-repository/directory fixtures for the original local adapter contract plus declaration, verification, trace, brief, digest, redaction, connector-governance metadata-boundary, allowlist, and no-side-effect tests. |

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

Forbidden implementation behavior:

- direct `node:crypto` import;
- a second digest implementation;
- a second canonicalization implementation;
- a second portable-redaction implementation;
- CI mutation;
- dependency mutation;
- retry;
- test or command discovery;
- installation;
- remediation engine;
- workflow runtime, scheduler, queue, daemon, dashboard, or orchestration engine;
- acceptance, package-status, or release-safety verdict generation.

---

# Contract A — Connector Governance Stage 0

## A1. Purpose and authority boundary

Connector Governance Stage 0 exists only to protect the remote mutation that creates the future implementation branch. It is an external governance procedure performed through GitHub repository/API reads before any implementation branch exists.

It is not:

- the product adapter preflight;
- an implementation of `EWF00-PVT-01` or `EWF00-PVT-02`;
- a replacement for read-only Git/filesystem/worktree observations;
- command-result evidence;
- executable adapter evidence;
- a content-digested EWF artifact;
- acceptance evidence.

Stage 0 cannot delete, replace, weaken, reinterpret, or satisfy the local adapter contract described in Contract B.

## A2. Required GitHub metadata observations

Stage 0 must read and record:

1. repository identity `NguyenDukKyeon/VocabMaster`;
2. default/base branch identity `main`;
3. exact current main SHA `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
4. exact v4 plan commit SHA, direct parent, path, and Git blob SHA;
5. absence of branch `chatgpt/ewf-00-preflight-verification-trace-mvp`;
6. absence of any PR whose head branch is `chatgpt/ewf-00-preflight-verification-trace-mvp`;
7. state, Draft state, head branch, and exact head SHA of the v4 authorization PR;
8. complete registry of all open PRs;
9. complete changed-filename list and relevant body declarations for every open PR;
10. declared spec, semantic-key, implementation-branch, and writer overlap;
11. designated connector writer `chatgpt-github-ewf00-preflight-primary-writer`, mode `exclusive`;
12. exact four-file implementation allowlist;
13. exact semantic-conflict keys;
14. canonical entry gates;
15. explicit absence of authorized source, CI, dependency, canonical-status, pilot, product, and acceptance changes.

Semantic-conflict keys are exactly:

```text
ewf:preflight-observation
ewf:verification-execution
ewf:trace-validation
ewf:frozen-handoff-validation
```

Canonical entry gates are exact observations:

| Gate | Source | Required value |
|---|---|---|
| Repository | GitHub repository metadata | `NguyenDukKyeon/VocabMaster` |
| Main | GitHub `refs/heads/main` | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Plan lineage | GitHub commit metadata | v4 Commit 1 is a direct child of exact main |
| Plan object | GitHub contents/tree metadata | exact v4 plan path and exact blob bound by Commit 2 |
| `EWF-00-status` | `docs/IMPLEMENTATION_STATUS.md` | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Artifact predecessor | canonical/HANDOFF evidence | accepted `EWF00-ARTIFACTS-001` remains preserved |
| Pilots | bounded authority | `EWF00-PILOTS-001` remains unauthorized |
| Implementation branch | GitHub ref lookup | absent |
| Implementation PR | complete open-PR registry | absent |
| Authorization | v4 PR review at exact head | fresh independent docs-only `ACCEPT` exists |

## A3. Complete open-PR registry procedure

Before implementation branch creation, the connector must:

1. enumerate every open PR in `NguyenDukKyeon/VocabMaster`, including all pages;
2. read each PR's number, state, Draft state, head branch, head SHA, body, and complete changed-filename list;
3. exclude only the v4 authorization PR whose exact head received the fresh independent docs-only audit;
4. retain every other open PR, including historical or rejected authorization PRs;
5. fail closed if enumeration, pagination, PR body retrieval, or changed-filename retrieval is incomplete.

Stage 0 is `BLOCKED` if another open PR:

- changes any future implementation allowlist path;
- declares `EWF00-PREFLIGHT-001`;
- declares any semantic-conflict key;
- uses `chatgpt/ewf-00-preflight-verification-trace-mvp` as head branch;
- declares `chatgpt-github-ewf00-preflight-primary-writer`;
- has unclear writer ownership for the same scope.

No semantic independence may be inferred from filenames, branch names, Draft state, historical intent, prior audit verdict, or narrative claims.

At v4 documentation-preparation time:

- PR #18 remains open and declares `EWF00-PREFLIGHT-001`;
- PR #20 remains open and declares `EWF00-PREFLIGHT-001`;
- PR #21 remains open and is the rejected v3 authorization for `EWF00-PREFLIGHT-001`.

Therefore future Stage 0 will block while these overlapping historical authorization PRs remain open. Closing or otherwise removing them from the open-overlap registry requires a separate explicit governance action after v4 receives independent exact-head `ACCEPT`. This v4 documentation change does not close, edit, merge, rewrite, or add commits to PR #18, PR #20, or PR #21.

## A4. Raw normalized Stage 0 record

Stage 0 output is raw normalized GitHub metadata evidence. It must bind:

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

Each normalized open-PR row contains:

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

Raw normalization rules are limited to evidence shape and stable ordering:

- preserve exact GitHub strings and SHAs;
- sort PR rows by numeric PR number ascending;
- sort changed filenames lexicographically within each PR row;
- sort declaration arrays lexicographically;
- sort diagnostics by severity, code, PR number, path, then message;
- preserve the observation timestamp and exact source identities;
- do not hash, sign, or claim canonical EWF serialization.

The raw Stage 0 record must not contain or require:

```text
openPrRegistryDigest
contentDigest
declarationDigest
verificationManifestDigest
digestArtifact execution
canonicalizeArtifact execution
redactPortableValue execution
command results
local Git output
local filesystem output
```

No off-repository SHA, hash, canonicalization, or redaction implementation may be invented for Stage 0.

Digest generation for Stage 0 metadata is deferred to a separately authorized evidence-only revision after the executable adapter implementation and exact-head GREEN CI exist. That later revision may use the accepted implemented digest path to bind a preserved normalized Stage 0 input under separate authorization; this plan does not authorize that evidence write.

A Stage 0 `BLOCKED` result authorizes zero mutation. A Stage 0 `PASS` result is still only governance metadata and is not command-result, adapter, implementation, or acceptance evidence.

## A5. Sole authorized connector mutation

Only after:

1. fresh independent exact-head docs `ACCEPT` on v4;
2. separate governance action removes every retained open overlap;
3. a fresh complete Stage 0 returns `PASS`;
4. the implementation branch and implementation PR remain absent;

one branch-creation mutation is authorized:

```text
branch = chatgpt/ewf-00-preflight-verification-trace-mvp
source = exact v4 Commit 1 SHA
```

The full exact SHA assigned to this plan commit is required and will be bound literally by Commit 2 and HANDOFF. The branch must not start from main, v3 plan `42bf5bdb782984d0ed662202d1b5a9a3d5066d43`, PR #18, PR #20, PR #21, another authorization head, another plan commit, or an abbreviated SHA.

The connector response must bind the resulting exact ref and SHA. If the branch already exists:

- do not update it;
- do not reuse it;
- do not delete it;
- do not force it;
- do not create an alternate branch;
- stop.

No second writer branch, merge, rebase, reset, force-push, local checkout, local worktree, local index, or local ref mutation is authorized.

---

# Contract B — Frozen Product Adapter Contract

## B1. Normative source and non-substitution rule

The product adapter contract is controlled by frozen bounded spec `EWF00-PREFLIGHT-001` at subject `0b43efac974c3fbbc489f10e9fa668bac84c9b43`.

The adapter must consume:

- an approved change-set declaration;
- injected read-only Git observations;
- injected read-only filesystem observations;
- injected declared-command process execution boundaries for verification only.

Connector Governance Stage 0 cannot be passed to the adapter as a substitute for local repository/worktree evidence and cannot satisfy `EWF00-PVT-01` or `EWF00-PVT-02`.

## B2. Required declaration identity

The approved change-set declaration must bind at least:

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

Missing, ambiguous, path-only, abbreviated, or internally inconsistent identities fail closed before any write callback or initializer is invoked.

## B3. Required read-only Git/filesystem observations

The adapter must support and test observations for:

1. repository root identity;
2. presence and identity of required canonical files;
3. exact `HEAD`;
4. exact predecessor parent;
5. exact symbolic branch/ref identity;
6. exact local target ref identity;
7. exact declared worktree identity;
8. proof that the implementation worktree is the single declared worktree;
9. clean tracked state;
10. clean untracked state;
11. remote repository identity;
12. remote target collision policy and observation;
13. declared writer identity and mode;
14. complete active writer registry;
15. file overlap;
16. semantic overlap;
17. canonical package/dependency/status entry gates;
18. allowlist and exclusions;
19. safety approvals;
20. zero writes on every blocking/error result.

The injected read-only Git boundary must be able to represent observations equivalent to these exact operations, with `shell: false` and the declared implementation worktree as cwd where applicable:

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

Tests may inject synthetic observations directly or use disposable repositories/directories. Production behavior must not infer a pass when a required observation is absent, malformed, truncated, ambiguous, or failed.

## B4. Repository and canonical-file gate

The adapter must validate:

- normalized repository identity equals `NguyenDukKyeon/VocabMaster` under the frozen remote-identity rules;
- observed repository root equals the exact declared root after platform-safe path resolution;
- every required canonical file exists beneath that root;
- no required canonical path escapes the root;
- canonical entry gates are read-only and exact-literal;
- the adapter never edits canonical files or chooses among conflicting canonical values.

Wrong repository and wrong repository root are distinct blocking diagnostics.

## B5. HEAD, parent, ref, and worktree gate

The adapter must fail before any write when:

- `HEAD` differs from `approvedPlanCommit` / `expectedHead`;
- `HEAD^` differs from `expectedPredecessorParent`;
- symbolic ref is detached, absent, or differs from the declared full ref;
- local target ref is absent, points to another SHA, or differs from the symbolic ref;
- observed worktree path differs from the exact declared worktree;
- more than one declared implementation worktree is present;
- worktree registry output is malformed or incomplete;
- the declaration and observation disagree about branch/ref/worktree identity.

The adapter must not reinterpret a connector branch-head observation as proof of local symbolic ref or local worktree identity.

## B6. Clean tracked and untracked state

The adapter must distinguish and block:

- dirty tracked modifications;
- staged/index changes;
- tracked deletions or renames;
- untracked files;
- malformed or incomplete status output.

Both tracked and untracked cleanliness are required before a write. A dirty state must return a blocking diagnostic and prove that no write callback, initializer, install path, retry, or remediation path ran.

## B7. Writer, active registry, and overlap gate

The adapter must require:

- writer is present;
- writer equals the frozen declared writer for the change set;
- writer mode is `exclusive`;
- active writer registry is present and complete;
- every active row binds writer, branch/ref, worktree, allowed files, and semantic keys;
- no other active writer row overlaps an allowed file;
- no other active writer row overlaps a semantic key;
- no independence inference from filenames, branches, or narrative intent.

Missing writer, wrong writer, missing registry, incomplete registry, file overlap, and semantic overlap are distinct blocking diagnostics.

## B8. Remote target collision gate

The adapter must preserve declared collision policy rather than infer it.

For `REQUIRE_ABSENT`:

- remote observation must complete successfully;
- empty exact-target output means `ABSENT` with SHA `null`;
- any returned exact-target row is `REMOTE_TARGET_COLLISION`;
- observation failure is `REMOTE_OBSERVATION_ERROR`;
- malformed rows or inconsistent state/SHA are blocking.

Any future `REQUIRE_EXACT_SHA` support must require one exact `<lowercase-sha><TAB><exact-ref>` row at the declared SHA and is not permission to update a branch in this slice.

No fetch, retry, remote-tracking inference, branch mutation, or policy inference is permitted inside the adapter.

## B9. Allowlist, exclusions, and zero-write behavior

The adapter must mechanically compare the approved allowlist and exclusions with the change-set declaration. It must block on:

- missing allowlist path;
- extra allowlist path;
- an exclusion omitted or contradicted;
- requested change outside the four-file boundary;
- any request to change CI, dependency, canonical docs/status, product behavior, pilots, or acceptance output.

On every preflight failure or observation error:

```text
repository content writes = 0
index writes = 0
Git metadata mutations = 0
branch mutations = 0
installations = 0
retries = 0
remediation actions = 0
acceptance outputs = 0
```

## B10. Mandatory original local-adapter fixtures

`tests/ewf-preflight-verification-trace.test.mjs` must include, at minimum:

- wrong repository;
- wrong repository root;
- missing required canonical file;
- canonical path escaping repository root;
- wrong HEAD;
- wrong predecessor parent;
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
- missing active writer registry;
- incomplete active writer registry;
- file overlap;
- semantic overlap;
- remote target collision;
- remote observation failure;
- malformed remote identity/row;
- broken canonical entry gate;
- allowlist mismatch;
- exclusion mismatch;
- attempted out-of-bound write;
- zero-write assertion for every blocking fixture.

Fixtures must use disposable repositories/directories and synthetic evidence. They must not dirty or alter the user's source worktree. Connector Stage 0 must not remove, replace, suppress, or weaken these fixtures.

## B11. Verification, trace, and frozen-brief behavior

The adapter must retain:

- `argv` as execution authority;
- `command` as display-only;
- exact cwd, inherited and explicit environment, timeout, and tool requirement;
- per-command `declarationDigest`;
- `verificationManifestDigest`;
- result states `PASS`, `FAIL`, `ERROR`, `NOT_RUN`, `NOT_AVAILABLE`;
- no retry, discovery, installation, or remediation;
- deterministic command and diagnostic ordering;
- trace topology `requirement → test → command → evidence`;
- shared gates only with explicit scope rationale;
- frozen-brief identity/completeness validation without product interpretation or acceptance verdict.

GitHub API operations and Connector Governance Stage 0 are not command declarations and must never be serialized as command-result evidence.

## B12. Executable digest boundary

Adapter-produced preflight, verification, trace, and brief artifacts retain exactly:

```text
normalize complete object
→ redactPortableValue
→ omit top-level contentDigest
→ digestArtifact
→ attach contentDigest
→ serialize
```

Per-command declaration identity retains:

```text
normalize exact declaration without declarationDigest
→ digestArtifact
→ attach declarationDigest
```

Verification manifest identity retains:

```text
normalize exact manifest
→ omit verificationManifestDigest
→ digestArtifact
→ attach verificationManifestDigest
```

This digest contract belongs to the executable adapter and its CI tests. It does not authorize a pre-implementation connector digest. Direct `node:crypto`, duplicate hash logic, duplicate canonicalization, and duplicate redaction remain forbidden.

Safe repository-relative paths remain visible. Secrets, credentials, private environment values, and private absolute paths are redacted by accepted `redactPortableValue`.

---

# Connector implementation workflow after governance clearance

## Commit A — Contract tests

```text
message: test(ewf): define preflight verification trace contracts
parent: exact v4 Commit 1
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

Commit A must define initial tests for the frozen local Git/filesystem/worktree adapter contract, verification/trace/brief declarations, digest boundary, and applicable connector-governance declaration separation. Open a Draft implementation PR after Commit A.

Existing CI is expected RED because the adapter/templates are absent. The failure must directly reflect missing authorized implementation. Do not add an artificial failing assertion solely to force RED. Preserve exact run, job, step, and conclusion evidence.

## Commit B — Templates

```text
message: feat(ewf): add preflight verification trace templates
parent: exact Commit A
changed paths only:
  .specify/templates/ewf/preflight-result.template.json
  .specify/templates/ewf/trace-manifest.template.json
```

The preflight template describes adapter-produced local Git/filesystem/worktree evidence, not Connector Governance Stage 0 raw metadata.

## Commit C — Adapter

```text
message: feat(ewf): implement preflight verification trace adapter
parent: exact Commit B
changed path only: scripts/ewf-preflight-trace.mjs
```

The adapter implements Contract B, not Contract A. It may validate a declaration that records connector authorization identity, but it must not treat GitHub Stage 0 metadata as a substitute for required local observations.

## Commit D — Complete matrix

```text
message: test(ewf): complete preflight verification trace matrix
parent: exact Commit C
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

Commit D must complete:

- all original local Git/filesystem/worktree fixtures in B10;
- all `EWF00-PVT-01` through `EWF00-PVT-12` requirements;
- duplicate IDs and broken references;
- missing required command/evidence;
- correct ID with wrong `argv`, cwd, environment, timeout, or tool requirement;
- declaration digest mismatch;
- manifest digest mismatch;
- trace/evidence/content digest mismatch;
- optional and required tool unavailable;
- timeout, crash, and infrastructure error;
- Spec Kit absent;
- deterministic output;
- secret/private-value redaction;
- safe repository-relative paths preserved;
- direct `node:crypto` detection;
- duplicate digest/canonicalization/redaction detection;
- attempted CI/dependency/status/pilot/acceptance mutation;
- connector Stage 0 raw-record separation and absence of premature digest fields.

Final existing CI must be GREEN at exact Commit D. Commit D is the implementation subject unless a separate remediation commit is required.

If remediation is required:

- create a separate commit;
- identify exact failed run/job/step and reason;
- modify only authorized files;
- preserve failed evidence;
- keep the PR Draft;
- do not squash, rebase, or rewrite A–D;
- verify cumulative diff from v4 Commit 1 remains inside the four-file allowlist;
- define the final implementation subject as the exact last source/test commit.

---

# Existing GitHub Actions only

`.github/**` must not change. No workflow or check may be invented.

At the exact main baseline, the existing pull-request CI executes through job `test`, including:

```text
npm ci --no-audit --no-fund
python -m pip install --disable-pip-version-check yt-dlp
npm test
npm run check
npm run audit:roadmap
npm run audit:ielts
npm run test:v10
npm run audit:v10
npm run build
npm run phase4:verify
npm run phase5:verify
npm run test:serve
npm run test:preview
npm run test:browser
npm run test:ielts-browser
npm run test:v10-browser
npm run test:hardening
```

The existing CI setup does not authorize repository dependency changes or installation logic in the adapter.

Focused EWF sub-gates must be embedded in the authorized test file and exercised through `npm test`, including:

- accepted artifact contract check;
- adapter syntax/importability;
- test syntax/importability;
- frozen local Git/filesystem/worktree fixtures;
- disposable repository/directory isolation;
- zero-write assertions;
- forbidden direct `node:crypto`;
- duplicate digest/canonicalization/redaction detection;
- exact four-file boundary metadata;
- deterministic diagnostics;
- no retry/discovery/installation/remediation path;
- Spec Kit absence;
- declaration, manifest, content-digest, and redaction projections;
- Connector Governance Stage 0 separation and raw-no-digest rule.

Evidence must classify observations as:

1. declared focused sub-gate inside the authorized test harness;
2. command actually executed by existing CI;
3. static GitHub diff/blob/tree metadata audit;
4. raw Connector Governance Stage 0 metadata;
5. fresh independent acceptance observation.

A focused sub-gate must not be reported as a standalone command unless the CI log actually shows that standalone command.

---

# Connector write discipline

After the implementation branch is validly created:

- all repository writes use the GitHub connector;
- the designated connector writer is the sole writer;
- reviewers and auditors remain read-only;
- re-read current implementation branch HEAD before every write;
- every write binds the expected exact predecessor;
- verify new-path absence before create;
- re-read and bind exact current blob before updating an existing path;
- do not perform parallel writes to the same path;
- do not overwrite unread changes;
- stop on unexpected branch-head movement;
- read back branch ref, resulting commit, direct parent, changed paths, and blob identities after each write.

Connector mutation correctness is proven by remote branch-head lineage and GitHub object identities. This does not replace the adapter's local preflight behavior, which is proven by CI execution and disposable fixtures.

---

# Evidence and acceptance topology

After the final implementation subject and exact-head GREEN CI:

- implementation subject remains code/test/template only;
- implementation report/evidence files require a separate evidence-only revision authorization;
- the preserved raw Connector Governance Stage 0 record may be bound and digested only under that later authorization using the accepted executable implementation path;
- implementer evidence status is exactly `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`;
- evidence must bind plan commit/blob/parent, implementation subject/parent, exact changed files, CI run/job IDs, trace/evidence/brief identities, declaration identities, manifest identity, GitHub metadata observations, and executable CI observations;
- raw GitHub metadata and executable adapter/CI evidence remain distinct provenance layers;
- fresh independent exact-head read-only audit owns the implementation verdict.

Implementer evidence must not write:

```text
ACCEPT
REJECT
package accepted
release safe
```

Passing `EWF00-PREFLIGHT-001` does not:

- accept `EWF-00`;
- authorize `EWF00-PILOTS-001`;
- change package status;
- authorize product work;
- resolve P3-02;
- merge any PR.

---

# Stop conditions

Stop immediately if:

- main differs from `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- v4 Commit 1 is not a direct child of exact main;
- v4 plan path/blob/parent mismatches;
- v4 brief or HANDOFF does not bind exact Commit 1 identity;
- v4 has not received fresh independent exact-head docs `ACCEPT`;
- any retained open PR overlaps the specification, semantic keys, writer, implementation branch, or four-file allowlist;
- complete open-PR enumeration or changed-filename retrieval is unavailable;
- implementation branch or implementation PR already exists;
- a Stage 0 record requires or claims `openPrRegistryDigest`, `contentDigest`, accepted-helper execution, command results, or local Git evidence;
- branch creation requires update/reuse/delete/force/alternate branch behavior;
- a write needs a path outside the four-file allowlist;
- the adapter contract omits or weakens repository root, canonical files, HEAD, parent, symbolic ref, local ref, worktree, single-worktree, tracked/untracked cleanliness, remote collision, writer, registry, overlap, canonical gates, allowlist/exclusions, or zero-write behavior;
- mandatory disposable local-adapter fixtures are removed, replaced, skipped, or weakened;
- CI, dependencies, `scripts/ewf-artifacts.mjs`, existing accepted EWF templates/tests, product behavior, pilots, P3-02, canonical status, or acceptance must change;
- required exact-SHA CI evidence is unavailable;
- implementation needs a false local or connector claim to pass.

---

# Documentation commit topology

This authorization documentation must remain exactly:

1. `docs: plan corrected GitHub connector EWF preflight trace MVP`
   - direct parent exact main;
   - only this plan path.
2. `docs: authorize corrected GitHub connector EWF preflight trace MVP`
   - direct parent exact Commit 1;
   - only the v4 frozen brief path;
   - literal Commit 1 SHA/blob/path/parent.
3. `docs: update corrected GitHub connector EWF handoff`
   - direct parent exact Commit 2;
   - only bounded-pack `HANDOFF.md`;
   - literal Commit 1 and Commit 2 identities.

No source, implementation branch, CI, dependency, canonical-status, pilot, PR #18/#20/#21, or acceptance mutation is part of this documentation topology.

## Self-review matrix

Before opening the v4 Draft PR, verify:

- Contract A and Contract B are separate and neither claims to satisfy the other;
- Stage 0 raw record has no digest fields and no accepted-helper execution claim;
- Stage 0 digest is explicitly deferred to separate evidence-only authorization;
- every frozen local Git/filesystem/worktree observation is present;
- every mandatory original local-adapter fixture is present;
- connector workflow creates the implementation branch only from exact v4 Commit 1;
- A–D topology and four-file boundary are exact;
- existing CI only is preserved;
- accepted EWF exports and digest projection are exact;
- PR #18/#20/#21 remain open blockers and are not edited or closed;
- `EWF-00` remains `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`;
- pilots, product work, implementation acceptance, and package acceptance remain excluded.
