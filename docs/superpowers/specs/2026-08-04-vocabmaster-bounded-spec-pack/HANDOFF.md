# VocabMaster Bounded Specification Pack — Corrected GitHub Connector v4 Handoff

Handoff status: `DOCS_PREPARED / CONNECTOR_AUTHORIZATION_V4_PENDING_INDEPENDENT_AUDIT / NOT_ACCEPTANCE`

This handoff preserves the frozen bounded specification pack and accepted `EWF00-ARTIFACTS-001` slice while recording the corrected connector-native v4 authorization for `EWF00-PREFLIGHT-001`. It does not implement source, create an implementation branch, open an implementation PR, change CI/dependencies/canonical status, authorize pilots, edit or close historical PRs, merge any PR, or issue implementation/package acceptance.

## 1. Canonical authority and frozen subject

Canonical authority remains solely:

```text
AGENTS.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
```

| Field | Exact value |
|---|---|
| Frozen bounded-spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Frozen subject parent | `31c3c8a73363d3c88cb0719d799f597b3d381467` |
| Architecture baseline | `adc3726620f4badddb16309e375f8f17b6af1404` |
| Independent bounded-spec documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Exact main baseline | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |

The bounded specs, matrices, future-boundary drafts, implementation queue, plans, briefs, handoffs, GitHub metadata, CI evidence, and audit comments remain subordinate. They cannot replace canonical package ownership, dependency, status, release-safety, or acceptance authority.

## 2. Preserved accepted EWF artifact slice

| Field | Exact value |
|---|---|
| Accepted slice | `EWF00-ARTIFACTS-001` |
| Accepted implementation subject | `dc3aa8aa8084abee6819ffcbc238bd7e6f483b6c` |
| Accepted evidence HEAD | `826dbe9027325c350b0b734a3861e0dfa038e0cd` |
| Artifact merge / exact current main | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Effect of v4 | preservation only; no artifact source/template/test mutation |

The future preflight adapter must reuse accepted exports from `scripts/ewf-artifacts.mjs` and must not modify that file or accepted artifact templates/tests:

```text
COMMAND_RESULTS
canonicalizeArtifact
digestArtifact
validateArtifact
validateFrozenBrief
redactPortableValue
```

Direct `node:crypto` and duplicate digest, canonicalization, or portable-redaction implementations remain forbidden.

## 3. Connector authorization v4 exact identity

| Field | Exact value |
|---|---|
| Package / bounded spec | `EWF-00` / `EWF00-PREFLIGHT-001` |
| Requirement namespace | `EWF00-PVT-01` through `EWF00-PVT-12` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Authorization branch | `chatgpt/ewf-00-preflight-trace-authorization-v4` |
| Exact plan path | `docs/superpowers/plans/2026-08-05-ewf-00-preflight-verification-trace-github-connector-v4.md` |
| Exact plan commit / approved implementation predecessor | `250b879fa06b7be50a198e3cf007637c5f9d7306` |
| Exact plan parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Exact plan blob | `c45255836ca211d7f07f010016c68b568da6b193` |
| Frozen authorization brief path | `docs/superpowers/briefs/2026-08-05-ewf00-preflight-verification-trace-github-connector-v4-authorization.md` |
| Frozen authorization brief commit | `03f892611925a60fcf1743cf16ffcd7c1385e5a2` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Designated connector writer | `chatgpt-github-ewf00-preflight-primary-writer` |
| Writer mode | `exclusive` |
| Execution substrate | `GitHub connector + existing GitHub Actions` |
| Package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

Commit `250b879fa06b7be50a198e3cf007637c5f9d7306` is a direct child of exact main and changes only the v4 plan path. Its plan is exact blob `c45255836ca211d7f07f010016c68b568da6b193`. Commit `03f892611925a60fcf1743cf16ffcd7c1385e5a2` is a direct child of the plan commit and changes only the v4 brief path.

The rejected v3 plan `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` is historical evidence only and is not an implementation predecessor under v4.

Any rewritten SHA, different parent/path/blob, abbreviated SHA, squash, rebase, force-push, or topology change invalidates this handoff.

## 4. Effectiveness and historical PR boundary

Authorization v4 is not effective before a fresh independent docs-only exact-head audit returns `ACCEPT` on the exact final v4 authorization PR head.

Before that verdict:

- do not create `chatgpt/ewf-00-preflight-verification-trace-mvp`;
- do not write implementation source/template/test paths;
- do not open an implementation PR;
- do not claim implementation or package acceptance;
- do not supersede or mutate historical authorization PRs.

Historical open authorization state is preserved honestly:

- PR #18 remains open and declares `EWF00-PREFLIGHT-001`;
- PR #20 remains open and declares `EWF00-PREFLIGHT-001`;
- PR #21 remains open and is the independently rejected v3 connector authorization;
- this v4 handoff does not edit, rewrite, add commits to, mark ready, merge, or close PR #18, PR #20, or PR #21.

After v4 receives exact-head docs `ACCEPT`, a separate explicit governance action is required to remove overlapping historical PRs from the open registry. Connector Governance Stage 0 remains blocked while a retained open PR declares the same spec, semantic key, branch, writer, or implementation path. The registry rules must not be weakened merely to ignore history.

A v4 docs `ACCEPT` is authorization acceptance only. It is not adapter implementation acceptance and not `EWF-00` package acceptance.

## 5. Exact future implementation allowlist

Only these paths may be created or modified by the future implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Everything else is unauthorized, including:

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

No retry, discovery, installation, remediation engine, workflow runtime, scheduler, daemon, dashboard, acceptance generation, or status mutation is authorized.

## 6. Mandatory two-contract separation

### Contract A — Connector Governance Stage 0

Connector Governance Stage 0 is external GitHub repository/API governance protecting only remote implementation-branch creation.

It is not:

- the adapter preflight;
- an implementation of `EWF00-PVT-01` or `EWF00-PVT-02`;
- a replacement for local Git/filesystem/worktree observation;
- command-result evidence;
- executable adapter evidence;
- a content-digested EWF artifact;
- acceptance evidence.

### Contract B — Frozen Product Adapter

The adapter remains the frozen bounded-spec contract. It validates an approved change-set declaration against read-only Git/filesystem state, including repository root, canonical files, HEAD, parent, symbolic ref, local ref, worktree, single-worktree and clean-state evidence, remote collision, writer/registry, file/semantic overlap, canonical gates, allowlist/exclusions, and zero-write behavior.

Contract A cannot satisfy, replace, reinterpret, remove, or weaken Contract B.

## 7. Contract A — raw Connector Governance Stage 0

Stage 0 reads and records:

- repository `NguyenDukKyeon/VocabMaster`;
- default/base branch `main`;
- exact main `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- exact plan commit `250b879fa06b7be50a198e3cf007637c5f9d7306`;
- exact plan parent, path, and blob `c45255836ca211d7f07f010016c68b568da6b193`;
- implementation branch and implementation PR absence;
- v4 authorization PR state, Draft state, branch, and exact audited head;
- complete open-PR registry and complete changed filenames;
- spec, semantic-key, branch, and writer declarations;
- designated writer and mode;
- exact allowlist and semantic-conflict keys;
- canonical entry gates;
- no source/CI/dependency/status/pilot/product/acceptance mutation.

Semantic-conflict keys remain exactly:

```text
ewf:preflight-observation
ewf:verification-execution
ewf:trace-validation
ewf:frozen-handoff-validation
```

### Complete registry rules

Before implementation branch creation:

1. enumerate all open PRs across all pages;
2. read number, state, Draft state, head branch, head SHA, body, and complete changed filenames for each;
3. exclude only the exact audited v4 authorization PR;
4. retain every other open PR;
5. fail closed if enumeration, pagination, body retrieval, or filename retrieval is incomplete.

Block if another open PR:

- changes an implementation allowlist path;
- declares `EWF00-PREFLIGHT-001`;
- declares a semantic-conflict key;
- uses the implementation branch;
- declares the designated writer;
- has unclear writer ownership for the same scope.

Do not infer independence from filenames, branches, Draft state, history, narrative intent, or prior verdict.

### Raw normalized output and no premature digest

Stage 0 emits only:

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

Stable ordering is raw evidence shaping only: numeric PR ordering, lexicographic filenames/declarations, deterministic diagnostics, and preserved exact GitHub strings/SHAs/timestamp/source identities.

The raw Stage 0 record must not contain, require, or claim:

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

No external hash/canonicalization/redaction implementation may be invented. Digesting preserved Stage 0 metadata is deferred to a separately authorized evidence-only revision after the executable adapter and exact-head GREEN CI exist.

A Stage 0 `BLOCKED` result permits zero mutation. A Stage 0 `PASS` remains governance metadata only.

## 8. Sole future connector mutation

Only after:

1. v4 receives fresh independent exact-head docs `ACCEPT`;
2. a separate governance action removes every retained open overlap;
3. fresh complete Stage 0 returns `PASS`;
4. implementation branch and PR remain absent;

create exactly:

```text
branch: chatgpt/ewf-00-preflight-verification-trace-mvp
source SHA: 250b879fa06b7be50a198e3cf007637c5f9d7306
```

Do not create from main, v3 plan, PR #18/#20/#21, another authorization head, another plan, or abbreviated SHA.

If the branch exists, do not update, reuse, delete, force, replace, or create an alternate branch. Stop. No second writer branch, merge, rebase, reset, local checkout/worktree/index/ref mutation, or force-push is authorized.

## 9. Contract B — frozen adapter behavior

The approved declaration binds:

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

The adapter supports and tests:

- exact repository and repository-root identity;
- required canonical files beneath root;
- exact HEAD and parent;
- exact symbolic branch/ref;
- exact local target ref and SHA;
- exact worktree identity;
- exactly one declared implementation worktree;
- clean tracked, staged/index, and untracked state;
- remote repository identity and target collision policy;
- declared writer and complete active writer registry;
- file and semantic overlap;
- canonical entry gates;
- exact allowlist and exclusions;
- zero writes on every blocking/error result.

Read-only Git observations must represent:

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

Missing, malformed, truncated, ambiguous, or failed required observations block. GitHub connector metadata cannot prove local root, ref, worktree, or cleanliness.

## 10. Mandatory local-adapter negative fixtures

The authorized test file must include at least:

- wrong repository;
- wrong repository root;
- missing required canonical file;
- canonical path escaping root;
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

Fixtures use disposable repositories/directories and synthetic evidence. They must not dirty or alter the user's source worktree. Connector Stage 0 cannot remove, replace, skip, or weaken them.

## 11. Verification, trace, brief, and executable digest

The adapter retains:

- `argv` as execution authority and `command` as display-only;
- exact cwd/environment/timeout/tool requirement;
- `declarationDigest` and `verificationManifestDigest`;
- states `PASS`, `FAIL`, `ERROR`, `NOT_RUN`, `NOT_AVAILABLE`;
- no retry/discovery/install/remediation;
- deterministic ordering;
- trace `requirement → test → command → evidence`;
- duplicate/broken/missing/mismatched identity detection;
- brief identity/completeness validation without acceptance verdict.

Adapter-produced artifacts use:

```text
normalize complete object
→ redactPortableValue
→ omit top-level contentDigest
→ digestArtifact
→ attach contentDigest
→ serialize
```

Declaration and manifest identities use accepted `digestArtifact` after omitting their own digest fields. This executable mechanism belongs to the implemented adapter and CI tests, not pre-implementation Stage 0.

GitHub metadata evidence and executable CI evidence remain distinct provenance layers.

## 12. CI-driven implementation commits A–D

### Commit A

```text
message: test(ewf): define preflight verification trace contracts
parent: 250b879fa06b7be50a198e3cf007637c5f9d7306
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

Open a Draft implementation PR after Commit A. Existing CI is expected RED because implementation/templates are absent. The failure must reflect missing authorized implementation, not an artificial failing assertion.

### Commit B

```text
message: feat(ewf): add preflight verification trace templates
parent: exact Commit A
changed paths only:
  .specify/templates/ewf/preflight-result.template.json
  .specify/templates/ewf/trace-manifest.template.json
```

### Commit C

```text
message: feat(ewf): implement preflight verification trace adapter
parent: exact Commit B
changed path only: scripts/ewf-preflight-trace.mjs
```

Commit C implements Contract B, not Contract A.

### Commit D

```text
message: test(ewf): complete preflight verification trace matrix
parent: exact Commit C
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

Commit D completes original local adapter fixtures, connector-governance separation, full PVT matrix, digest/redaction/error cases, and boundary prohibitions. Existing CI must be GREEN at exact Commit D.

Remediation, if required, uses separate disclosed commits within the four paths, preserves failed evidence, keeps Draft state, and never rewrites A–D.

## 13. Existing CI and connector write discipline

`.github/**` remains unchanged. Focused EWF gates live in the authorized test file and are exercised through existing `npm test`; no standalone command is claimed unless CI actually runs it.

Evidence distinguishes:

1. raw Connector Governance Stage 0 metadata;
2. static GitHub object/diff observations;
3. focused sub-gates inside the test harness;
4. commands actually executed by existing CI;
5. independent acceptance observations.

After valid implementation-branch creation:

- only the designated connector writer writes;
- re-read exact branch HEAD before every write;
- bind exact expected predecessor;
- verify new-path absence or exact current blob;
- no parallel same-path writes or overwrite of unread changes;
- stop on unexpected head movement;
- read back exact ref, commit, parent, changed paths, and blobs.

Remote connector lineage does not replace executable Contract B behavior.

## 14. Evidence and acceptance boundary

After final implementation subject and exact-head GREEN CI:

- evidence files require separate evidence-only revision authorization;
- preserved raw Stage 0 metadata may be digested only under that later authorization through accepted executable code;
- implementer evidence status is `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`;
- evidence binds plan, brief, implementation subject, exact changed files, CI run/job IDs, declaration/manifest/trace/evidence/brief identities, GitHub metadata, and executable CI observations;
- fresh independent exact-head read-only audit owns the implementation verdict.

Passing this slice does not accept `EWF-00`, authorize `EWF00-PILOTS-001`, change package status, authorize product work, resolve P3-02, or merge any PR.

## 15. Effective package and successor status

- `EWF00-ARTIFACTS-001`: independently accepted and merged; preserved.
- `EWF00-PREFLIGHT-001`: v4 docs authorization prepared but inactive before exact-head docs `ACCEPT`; not implemented and not accepted.
- `EWF00-PILOTS-001`: unauthorized.
- `EWF-00`: `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.
- LI-00, SRC-00, ERR-00, and QAR-00 remain unchanged.
- P3-02 and product work remain outside scope.

## 16. Stop conditions

Do not start implementation if:

- main, plan commit, parent, path, or blob mismatches;
- brief commit is not exact `03f892611925a60fcf1743cf16ffcd7c1385e5a2`;
- v4 exact-head docs `ACCEPT` is absent;
- any retained open PR overlap remains;
- complete registry or changed-filename retrieval is unavailable;
- implementation branch or PR exists;
- Stage 0 claims a digest/helper execution/command result/local evidence;
- branch creation needs update/reuse/delete/force/alternate behavior;
- a write needs a path outside the four-file allowlist;
- Contract B omits or weakens repository root, canonical files, HEAD, parent, ref, local ref, worktree, single-worktree, cleanliness, remote collision, writer, registry, overlap, gates, allowlist/exclusions, or zero-write behavior;
- disposable local-adapter fixtures are removed, replaced, skipped, or weakened;
- CI/dependencies/accepted EWF artifacts/canonical docs/status/product/pilots/P3-02/acceptance must change;
- exact-SHA executable CI evidence is unavailable;
- a false local, connector, digest, or acceptance claim is required.

This handoff remains subordinate docs-only authorization and remains `NOT_ACCEPTANCE`.

## 17. EWF Pilot A candidate selection and docs-only authorization

This section is an append-only patch after the exact anchor:

```text
This handoff remains subordinate docs-only authorization and remains `NOT_ACCEPTANCE`.
```

The pre-existing handoff content and historical v4 identities above are preserved verbatim. This section records a new, separate Pilot A authorization candidate and does not reinterpret the historical text.

| Field | Exact value |
|---|---|
| Handoff base blob | `b1a39f91227a4708225868d67e77005513787863` |
| Canonical package | `EWF-00` |
| Pilot specification | `EWF00-PILOTS-001` |
| Pilot ID | `EWF00-PILOT-A-001` |
| Candidate ID | `P1-07-TODAY-NONFINITE-ESTIMATE-001` |
| Canonical product owner | `P1-07 Today Composer` |
| Accepted owner boundary | integrated Phase 1 main `9da21e1c3cb34b7372f1b33c541d7442dd0390c9` |
| Authorization base main | `7dd847cc9da2f5595430e20f864c211f3ec5ddfb` |
| Authorization branch | `chatgpt/ewf-00-pilot-a-small-repair-authorization` |
| Plan path | `docs/superpowers/plans/2026-08-06-ewf-00-pilot-a-small-repair.md` |
| Plan commit / approved future implementation predecessor | `7b74bdfed67debec31b7a043a838350946965a72` |
| Plan parent | `7dd847cc9da2f5595430e20f864c211f3ec5ddfb` |
| Plan blob | `09a51b614a2818de6c4552c85667c0119e237c24` |
| Authorization brief path | `docs/superpowers/briefs/2026-08-06-ewf00-pilot-a-small-repair-authorization.md` |
| Authorization brief commit | `a10c38c88bbf3e39e575ac1e468b73f870f50f54` |
| Authorization brief blob | `f02721fa6e2b4b8c60e038bcb1d730ffb2553bab` |
| Future implementation branch | `chatgpt/ewf-00-pilot-a-small-repair` |
| Designated writer | `chatgpt-github-ewf00-pilot-a-primary-writer` |
| Writer mode | `exclusive` |

### Candidate and expected behavior

A truthy non-numeric Today Composer `estimatedSeconds` currently becomes `NaN`, bypasses a consumed time budget and makes the aggregate plan estimate non-finite. The future focused regression freezes two ordered due rows under a 60-second budget: the first has `60`, the second has `"not-a-number"`. The expected bounded behavior is to use the existing 60-second default for non-finite input, retain the existing `[10, 900]` clamp for finite input, select only the first row and record the second as `time-budget` excluded.

Selection-time exact implementation blobs are:

```text
src/today-composer.js
d63a76c3698fe572790914e687443ee38e6842b2

tests/today-composer.test.mjs
787b4cb0c1b845aefba4c83eafe5380396f4251a
```

The source-level reproduction is deterministic but was not executed during candidate selection because no supported exact-byte disposable materialization path was available. No executed-reproduction claim is made. After independent authorization acceptance and fresh preflight, the future writer must first encode the exact failing regression and stop before source modification if it does not fail for the stated reason.

### Exact future implementation allowlist

```text
tests/today-composer.test.mjs
src/today-composer.js
```

No third path is authorized. Everything else remains excluded, including canonical docs/status, `.github/**`, dependencies, schemas/migrations, durable data, backup/restore, outbox/reconciliation, process lifecycle, concurrency/lease/fencing, crash/recovery, provider/network behavior, security/authentication, privacy/consent, rights/publication, new UI/capability, Pilot B, P3-02, LI-00, SRC-00, ERR-00, QAR-00, evidence files, acceptance and merge.

### Frozen verification profiles

Focused profile:

```text
node --test --test-name-pattern="non-finite estimatedSeconds" tests/today-composer.test.mjs
node --test tests/today-composer.test.mjs
node --check src/today-composer.js
node --check tests/today-composer.test.mjs
git diff --check -- tests/today-composer.test.mjs src/today-composer.js
```

PR profile:

```text
npm test
npm run check
npm run audit:roadmap
npm run audit:ielts
npm run test:v10
npm run audit:v10
npm run build
```

The existing GitHub Actions workflow is executable PR evidence. `.github/**` must not change.

### Baseline and measurement boundary

Baseline and EWF-assisted runs must use the same exact plan predecessor, clean repository state, OS/environment class, Node/npm versions, command set and monotonic timing method. The reference environment is GitHub-hosted Ubuntu 24.04 / `ubuntu-24.04`, runner image `20260720.247.2`, Node `v22.23.1` and npm `10.9.8`. Actual environment values must match between both paired runs or the comparison is invalidated and both sides are rerun.

Observed metrics are focused duration, PR duration, preflight elapsed time, manual operation count, artifact preparation operations, validator duration, diagnostic review time, rework/invalidation rounds and CLI-absent friction. No arbitrary pass threshold is set. Evidence-file writes require separate authorization.

### Effectiveness and stop boundary

This authorization is inactive until an independent docs-only exact-head audit returns `ACCEPT` for the final authorization PR head. Before that verdict, do not create the future implementation branch, write source/test files, execute the pilot, measure pilot results, create pilot evidence or claim pilot success.

Fresh baseline and preflight must still pass before the first future implementation write. Any identity drift, writer/file/semantic overlap, branch collision, reproduction mismatch, need for an excluded category or path, RED verification, incomparable measurement environment or unverifiable claim stops the pilot without widened remediation.

Effective state after this docs creation remains:

```text
EWF00-PILOT-A-001: AUTHORIZATION_PENDING_INDEPENDENT_AUDIT
EWF00-PILOTS-001: NOT_COMPLETED
Pilot B: UNAUTHORIZED
EWF-00: IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED
```

This section does not accept the repaired product package, change any canonical status, authorize product work or authorize a merge.
