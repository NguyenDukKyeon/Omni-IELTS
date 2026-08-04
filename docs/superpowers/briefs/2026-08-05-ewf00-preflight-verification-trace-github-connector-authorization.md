# EWF00-PREFLIGHT-001 — Frozen GitHub Connector Implementation Authorization

Authorization status: `FROZEN / CONNECTOR_IMPLEMENTATION_AUTHORIZED / NOT_ACCEPTANCE`

Activation state: `PENDING_FRESH_INDEPENDENT_EXACT_HEAD_ACCEPT`

This brief freezes one connector-native replacement authorization for the bounded `EWF00-PREFLIGHT-001` implementation. It does not implement source, create the implementation branch, open an implementation pull request, change CI or dependencies, alter canonical package status, authorize `EWF00-PILOTS-001`, merge or close PR #20, or issue implementation/package acceptance.

## 1. Immutable authority identity

| Field | Frozen literal value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Authorized bounded spec | `EWF00-PREFLIGHT-001` |
| Requirement namespace | `EWF00-PVT-01` through `EWF00-PVT-12` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Exact main / plan parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Connector authorization branch | `chatgpt/ewf-00-preflight-trace-authorization-v3` |
| Exact plan path | `docs/superpowers/plans/2026-08-05-ewf-00-preflight-verification-trace-github-connector-mvp.md` |
| Exact plan commit / approved implementation predecessor | `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` |
| Exact plan blob | `169fd852f1fa6620d450a0284eb02789f1ce634f` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Designated writer | `chatgpt-github-ewf00-preflight-primary-writer` |
| Writer mode | `exclusive` |
| Package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Execution substrate | `GitHub connector + existing GitHub Actions` |
| Local execution substrate | `NOT_PRESENT / NOT_REQUIRED / NOT_CLAIMED` |

The exact plan commit is a direct child of exact main and changes only the exact plan path. At that commit the path is a Git blob with exact SHA `169fd852f1fa6620d450a0284eb02789f1ce634f`. A different commit, parent, path, blob, abbreviated SHA, rewritten history, or path-only retrieval invalidates this authorization.

Canonical authority remains solely:

```text
AGENTS.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
```

This brief, the plan, HANDOFF, pull-request metadata, GitHub API observations, CI records, implementation evidence, and audit comments are subordinate. They cannot determine package ownership, dependency truth, canonical status, release safety, pilot authorization, or acceptance.

`EWF00-ARTIFACTS-001` remains accepted and preserved. `EWF00-PILOTS-001`, P3-02, product work, package status changes, and acceptance remain excluded.

## 2. Activation and PR #20 relationship

This brief is frozen but not effective before a fresh independent docs-only audit accepts the exact final head of the v3 authorization pull request.

Before that exact-head `ACCEPT`:

- no implementation branch may be created;
- no implementation source/template/test path may be written;
- no implementation pull request may be opened;
- PR #20 remains the existing historical local-worktree authorization;
- this brief does not supersede PR #20;
- no implementation or package acceptance may be claimed.

After that exact-head `ACCEPT`:

- this v3 authorization supersedes PR #20 only as the active execution substrate for future implementation;
- PR #20 remains open, Draft, unmerged, and unchanged unless separately governed;
- this brief does not merge, close, edit, rewrite, or add commits to PR #20;
- connector Stage 0 still enumerates every open pull request and fails closed on any remaining overlap, including older open authorization pull requests.

The docs-only audit verdict is authorization acceptance only. It is not implementation acceptance and not `EWF-00` package acceptance.

## 3. Exact future implementation allowlist

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

The adapter must reuse these accepted exports from `scripts/ewf-artifacts.mjs`:

```text
COMMAND_RESULTS
canonicalizeArtifact
digestArtifact
validateArtifact
validateFrozenBrief
redactPortableValue
```

Direct `node:crypto` import and a second digest, canonicalization, or portable-redaction implementation are forbidden.

## 4. Connector-native Stage 0

Stage 0 uses GitHub repository/API evidence only. It must explicitly state:

```text
local index observed = false
local symbolic ref observed = false
local worktree observed = false
local Git refs observed = false
local clean-tree evidence claimed = false
local command execution claimed = false
PR #20 local bootstrap contract reused = false
```

Stage 0 must bind:

- repository identity `NguyenDukKyeon/VocabMaster`;
- default/base branch `main`;
- exact main SHA `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- exact plan commit `42bf5bdb782984d0ed662202d1b5a9a3d5066d43`;
- exact plan parent `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- exact plan path and blob `169fd852f1fa6620d450a0284eb02789f1ce634f`;
- implementation branch absence;
- implementation pull-request absence;
- authorization PR state and exact head;
- complete open-pull-request registry;
- designated writer and writer mode;
- exact four-file allowlist;
- exact semantic-conflict keys;
- canonical entry gates;
- no source, CI, dependency, package-status, pilot, or acceptance change.

Semantic-conflict keys are exactly:

```text
ewf:preflight-observation
ewf:verification-execution
ewf:trace-validation
ewf:frozen-handoff-validation
```

Canonical entry gates are:

| Gate | Required observation |
|---|---|
| Repository | exact `NguyenDukKyeon/VocabMaster` |
| Main | exact `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Plan lineage | `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` direct parent `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Plan object | exact path and blob `169fd852f1fa6620d450a0284eb02789f1ce634f` |
| EWF status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Artifact predecessor | accepted `EWF00-ARTIFACTS-001` remains preserved |
| Pilots | `EWF00-PILOTS-001` remains unauthorized |
| Implementation branch | absent |
| Implementation PR | absent |
| Authorization | fresh independent exact-head docs `ACCEPT` exists |

### Complete remote active-change registry

Before implementation branch creation, the connector must:

1. enumerate every open pull request in `NguyenDukKyeon/VocabMaster`;
2. read every open PR's number, state, draft state, head branch, head SHA, body, and complete changed-filename list;
3. exclude only the v3 connector authorization PR whose exact head received the fresh audit;
4. retain all other open PRs, including older authorization PRs;
5. fail closed if enumeration, pagination, PR body retrieval, or changed-filename retrieval is incomplete.

Stage 0 blocks if another open PR:

- changes any of the four allowed implementation paths;
- declares `EWF00-PREFLIGHT-001`;
- declares any semantic-conflict key;
- uses `chatgpt/ewf-00-preflight-verification-trace-mvp`;
- declares `chatgpt-github-ewf00-preflight-primary-writer`;
- has unclear writer ownership for the same scope.

Semantic independence must not be inferred from a filename, branch name, Draft state, historical status, prior audit, or narrative intent. Any retained overlap is blocking.

If the connector cannot enumerate the complete registry and complete changed filenames, Stage 0 must return `BLOCKED` and perform zero mutation.

## 5. Sole authorized connector mutation

After all activation and Stage 0 gates pass, only this branch creation is authorized:

```text
branch = chatgpt/ewf-00-preflight-verification-trace-mvp
source SHA = 42bf5bdb782984d0ed662202d1b5a9a3d5066d43
```

The full exact SHA is required. The branch must not start from `main`, an authorization PR head, PR #20, PR #18, another plan commit, or an abbreviated SHA.

The connector response must bind the resulting exact branch/ref SHA. If the branch already exists:

- do not update it;
- do not reuse it;
- do not delete it;
- do not force it;
- do not create an alternate branch;
- stop.

No second writer branch, checkout, local worktree, local index, local ref, merge, rebase, reset, or force operation is authorized.

## 6. Connector-native write discipline

After branch creation:

- all writes use the GitHub connector;
- one designated writer performs all writes;
- reviewers/auditors are read-only;
- re-read current branch HEAD before every write;
- stop if current HEAD differs from the expected writer predecessor;
- verify a new path is absent before creation;
- re-read an existing path and bind its exact current blob before update;
- do not run parallel writes on the same path;
- do not overwrite unread changes;
- read back resulting branch SHA, commit parent, changed paths, and blob identities after every write.

Authorized proof replaces local-cleanliness claims with:

```text
exact branch-head lineage
exact direct parent per commit
exact per-commit changed paths
GitHub tree/blob identities
current-head compare before each write
implementation PR cumulative diff containment
remote branch/PR collision checks
existing GitHub Actions evidence at exact SHA
```

No implementation report may claim a local worktree, local clean tree, local RED, or local GREEN.

## 7. Frozen CI-driven TDD commit topology

No squash, rebase, force-push, or hidden failed evidence is permitted.

### Implementation Commit A

```text
message: test(ewf): define preflight verification trace contracts
parent: exact plan commit 42bf5bdb782984d0ed662202d1b5a9a3d5066d43
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

After Commit A:

- open a Draft implementation PR to `main`;
- existing CI is expected RED because authorized implementation/templates are absent;
- RED evidence must be the exact GitHub Actions run at Commit A;
- no artificial failing assertion may be added only to force RED;
- the failure must directly reflect missing authorized implementation.

### Implementation Commit B

```text
message: feat(ewf): add preflight verification trace templates
parent: exact Commit A
changed paths only:
  .specify/templates/ewf/preflight-result.template.json
  .specify/templates/ewf/trace-manifest.template.json
```

### Implementation Commit C

```text
message: feat(ewf): implement preflight verification trace adapter
parent: exact Commit B
changed path only: scripts/ewf-preflight-trace.mjs
```

### Implementation Commit D

```text
message: test(ewf): complete preflight verification trace matrix
parent: exact Commit C
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

Commit D must complete the mandatory negative matrix and obtain final GREEN existing CI at exact Commit D. Commit D is the implementation subject unless a separately recorded remediation commit is required.

For remediation:

- use a separate commit;
- identify the exact failing CI run/job/step and reason;
- modify only authorized files;
- keep the PR Draft;
- do not squash or hide failed runs;
- verify cumulative diff from `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` remains inside the four-file allowlist;
- define the implementation subject as the exact final source/test commit.

## 8. Existing GitHub Actions only

`.github/**` must not change. No workflow may be added. No nonexistent check may be claimed.

At the frozen baseline, the existing pull-request CI job executes:

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

The existing workflow setup is not authorization to change repository dependencies or add installer logic.

Focused EWF verification must be embedded in `tests/ewf-preflight-verification-trace.test.mjs` and exercised through `npm test`, covering:

- accepted artifact contract check;
- adapter syntax/importability;
- test syntax/importability;
- forbidden direct `node:crypto`;
- duplicate digest/canonicalization/redaction detection;
- exact four-file boundary metadata;
- mandatory negative fixtures;
- deterministic diagnostics;
- no retry/discovery/installation/remediation path;
- Spec Kit absence;
- digest/redaction projections.

Evidence must distinguish:

```text
declared focused sub-gate
command actually executed by existing CI
static GitHub diff/blob/tree audit
fresh independent acceptance observation
```

A focused sub-gate must not be reported as a standalone command execution unless the CI log actually contains that standalone command.

## 9. Verification declarations

`argv` is execution authority; `command` is display-only.

Each declaration binds exact:

```text
id
profile
command
argv
cwd
inheritEnvironment
environment
timeoutMs
toolRequirement
requirements
declarationDigest
```

Per-command digest:

```text
normalize declaration without declarationDigest
→ digestArtifact
→ attach declarationDigest
```

Manifest digest:

```text
normalize manifest
→ omit verificationManifestDigest
→ digestArtifact
→ attach verificationManifestDigest
```

Every result, trace node, evidence node, implementation report, and frozen handoff binds the exact manifest digest, command ID, declaration digest, `argv`, cwd, environment, timeout, and tool requirement. ID-only matching is invalid.

Result vocabulary is exactly:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

Required behavior:

- no retry;
- no discovery;
- no installation;
- no remediation engine;
- deterministic ordering;
- optional tool absence remains `NOT_AVAILABLE`;
- required tool absence blocks;
- timeout, crash, invalid environment, or infrastructure fault is `ERROR`;
- GitHub API operations are not command-result evidence.

Portable digest projection is exactly:

```text
normalize complete result
→ redactPortableValue
→ omit contentDigest
→ digestArtifact
→ attach contentDigest
→ serialize
```

Secrets, credentials, private environment values, and private absolute paths are redacted. Safe repository-relative paths remain.

GitHub metadata evidence and executable CI evidence are separate provenance layers.

## 10. Mandatory negative fixtures

Coverage must include all `EWF00-PVT-01` through `EWF00-PVT-12` requirements and at least:

### Identity, registry, and mutation boundaries

- wrong repository;
- wrong plan commit;
- wrong plan parent;
- wrong plan blob/path;
- implementation branch already exists;
- implementation PR already exists;
- open-PR file overlap;
- open-PR semantic-key overlap;
- writer mismatch;
- unclear writer;
- incomplete remote registry;
- broken canonical entry gate;
- allowlist/exclusion mismatch;
- wrong parent/ref declarations;
- remote target collision;
- malformed remote identity;
- attempt to update/reuse/delete/force an existing ref.

### Trace and declaration boundaries

- duplicate IDs;
- broken references;
- missing required command/evidence;
- correct ID but wrong `argv`;
- wrong cwd/environment/timeout/tool requirement;
- declaration digest mismatch;
- manifest digest mismatch;
- trace/evidence/content digest mismatch.

### Result fidelity and portability

- optional tool unavailable;
- required tool unavailable;
- timeout;
- crash;
- infrastructure error;
- Spec Kit absent;
- deterministic output;
- secret/private-value redaction;
- safe repository-relative paths preserved.

### Prohibited scope

- direct `node:crypto` import;
- duplicate digest implementation;
- duplicate canonicalization implementation;
- duplicate portable-redaction implementation;
- retry/discovery/installation/remediation path;
- attempt to alter CI/dependencies;
- write outside allowlist;
- attempt to emit `ACCEPT`, `REJECT`, package accepted, package status, release safe, pilot authorization, or product authorization.

## 11. Evidence topology

After the final implementation subject and GREEN exact-SHA CI:

- implementation subject remains code/test/templates only;
- evidence/report files require separate evidence-only revision authorization;
- implementer evidence status is exactly `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`;
- implementer must not issue `ACCEPT`, `REJECT`, package acceptance, or release-safety claims.

Separately authorized evidence must bind:

```text
plan commit 42bf5bdb782984d0ed662202d1b5a9a3d5066d43
plan parent 474bde8e3c7b09f757e7df4a1587f8a71b2e7865
plan path
plan blob 169fd852f1fa6620d450a0284eb02789f1ce634f
this authorization brief commit
v3 authorization PR exact-head audit
implementation subject and parent
exact changed files
implementation PR and exact head
CI run IDs/numbers
CI job IDs/conclusions
trace digest
evidence digest
brief digest
verification manifest digest
command declaration digests
GitHub metadata observations
CI executable observations
```

A fresh independent exact-head read-only audit owns the implementation verdict. Passing this slice does not accept `EWF-00`, authorize `EWF00-PILOTS-001`, change canonical package status, authorize P3-02/product work, or merge any PR.

## 12. Stop conditions

Stop immediately if:

- main differs from `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- plan commit is not direct child `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` of that main;
- plan path/blob/parent does not match;
- v3 authorization lacks fresh independent exact-head `ACCEPT`;
- implementation branch exists;
- implementation PR exists;
- complete open-PR registry or changed filenames cannot be enumerated;
- another open PR has file, spec, semantic-key, branch, or writer overlap;
- writer differs from `chatgpt-github-ewf00-preflight-primary-writer`;
- a write needs a path outside the allowlist;
- CI, dependency, package file, canonical doc, or package-status change is required;
- accepted EWF artifact implementation/templates/tests must change;
- connector needs force/update/delete/reuse of an existing ref;
- current branch HEAD differs from expected writer predecessor;
- required CI evidence is absent at the exact SHA;
- implementation needs a local-only claim;
- pilots, P3-02, product work, package status, release safety, or acceptance enters scope.

This brief authorizes no action beyond the frozen conditional connector workflow and remains `NOT_ACCEPTANCE`.
