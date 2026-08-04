# EWF-00 Preflight Verification Trace — GitHub Connector MVP Implementation Plan

**Goal:** Authorize one bounded implementation of `EWF00-PREFLIGHT-001` through the GitHub connector and the repository's existing GitHub Actions workflow, without a Codex workspace, local checkout, local worktree, local index, local Git refs, or local command execution.

**Architecture:** The future implementation remains a four-file Node.js ESM adapter/test slice that reuses the accepted EWF artifact primitives. GitHub repository/API observations provide remote identity and change-control evidence; the existing GitHub Actions workflow provides executable verification evidence. These two evidence layers remain distinct and neither may be represented as local-worktree evidence.

**Execution substrate:** GitHub connector writes, one designated writer, Draft pull request, exact branch-head lineage, exact GitHub blob identities, and existing `.github/workflows/ci.yml`. No implementation sub-skill, worktree workflow, local shell, dependency change, CI edit, or implementation action is authorized by this plan itself.

## Global constraints and immutable identity

| Field | Frozen value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Bounded specification | `EWF00-PREFLIGHT-001` |
| Requirement namespace | `EWF00-PVT-01` through `EWF00-PVT-12` |
| Frozen specification subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Exact main parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Connector authorization branch | `chatgpt/ewf-00-preflight-trace-authorization-v3` |
| Future implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Designated writer | `chatgpt-github-ewf00-preflight-primary-writer` |
| Writer mode | `exclusive` |
| Package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Authorization status before audit | `DOCS_ONLY / NOT_EFFECTIVE / NOT_ACCEPTANCE` |

This plan commit must be a direct child of exact main `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` and must change only this plan path. GitHub assigns the exact plan commit SHA and plan blob SHA after this document is committed. The subsequent frozen authorization brief and HANDOFF must bind those literal values, this exact path, and this exact parent. A path-only binding, abbreviated SHA, different blob, different parent, or rewritten commit invalidates the authorization.

Canonical authority remains solely:

```text
AGENTS.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
```

This plan, its authorization brief, HANDOFF, pull-request discussion, CI output, implementation evidence, and later audit records are subordinate. They cannot change package ownership, dependency truth, package status, release safety, pilot authorization, or acceptance.

The accepted `EWF00-ARTIFACTS-001` implementation remains preserved. `EWF00-PILOTS-001`, P3-02 work, product work, and package-level acceptance remain unauthorized.

## Exact future implementation file map

Only these four paths may be created or modified by the future implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Responsibilities are frozen as follows:

| Path | Responsibility |
|---|---|
| `.specify/templates/ewf/preflight-result.template.json` | Versioned schema/example surface for connector-native preflight observations and blocking diagnostics; no acceptance field. |
| `.specify/templates/ewf/trace-manifest.template.json` | Versioned requirement-to-test-to-command-to-evidence bindings, declaration digests, manifest digest, and exact subject identity. |
| `scripts/ewf-preflight-trace.mjs` | Pure and injected-boundary adapter for normalized remote observations, declared verification results, trace validation, and frozen-handoff identity checks. |
| `tests/ewf-preflight-verification-trace.test.mjs` | Contract, negative-fixture, determinism, redaction, allowlist, importability, and connector-verification harness executed by repository `npm test`. |

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
evidence files in the implementation subject
dependencies
CI
product behavior
pilots
P3-02
package status
acceptance verdicts
```

The adapter must import and reuse these accepted exports from `scripts/ewf-artifacts.mjs`:

```js
COMMAND_RESULTS
canonicalizeArtifact
digestArtifact
validateArtifact
validateFrozenBrief
redactPortableValue
```

The future implementation is prohibited from importing `node:crypto` directly or adding a second digest, canonicalization, or portable-redaction implementation.

## Task 1 — Connector-native Stage 0, before any implementation mutation

**Evidence source:** GitHub repository/API reads only.

Stage 0 must explicitly record that it does not observe and does not claim:

- a local index;
- a local symbolic ref;
- a local worktree;
- local worktree cleanliness;
- local Git refs;
- local command output;
- the local bootstrap contract from PR #20.

Stage 0 must read and bind all of the following from GitHub:

1. repository identity `NguyenDukKyeon/VocabMaster`;
2. default/base branch identity `main`;
3. exact current main SHA `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
4. exact plan commit SHA and its direct parent;
5. exact plan path and Git blob SHA;
6. absence of branch `chatgpt/ewf-00-preflight-verification-trace-mvp`;
7. absence of any pull request whose head is that implementation branch;
8. state and exact head of the connector authorization pull request;
9. the complete registry of all open pull requests;
10. changed filenames and declared scope/semantic keys for every open pull request;
11. designated writer `chatgpt-github-ewf00-preflight-primary-writer`, mode `exclusive`;
12. the exact four-file implementation allowlist;
13. the four semantic-conflict keys;
14. canonical entry gates;
15. explicit absence of authorized source, CI, dependency, package-status, pilot, and acceptance changes.

The semantic-conflict keys are exactly:

```text
ewf:preflight-observation
ewf:verification-execution
ewf:trace-validation
ewf:frozen-handoff-validation
```

The canonical entry gates are exact-literal observations:

| Gate | Source | Required value |
|---|---|---|
| `EWF-00-status` | `docs/IMPLEMENTATION_STATUS.md` | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| `EWF-artifact-predecessor` | bounded-spec-pack `HANDOFF.md` | accepted `EWF00-ARTIFACTS-001` boundary remains preserved |
| `EWF-pilots-authorization` | bounded-spec-pack authority | `EWF00-PILOTS-001` remains unauthorized |
| `main-baseline` | GitHub main ref | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |

### Remote active-change registry procedure

Before creating the implementation branch, the connector must:

1. enumerate every open pull request in the repository;
2. read each pull request's number, state, draft state, head branch, head SHA, body, and complete changed-filename list;
3. exclude only the connector authorization pull request whose exact head is undergoing the fresh independent docs-only audit;
4. retain every other open pull request in the registry, including older documentation authorizations;
5. fail closed if enumeration, pagination, body retrieval, or changed-filename retrieval is incomplete.

Stage 0 is `BLOCKED` if any other open pull request:

- changes any of the four implementation paths;
- declares `EWF00-PREFLIGHT-001`;
- declares any of the four semantic-conflict keys;
- uses `chatgpt/ewf-00-preflight-verification-trace-mvp` as its head branch;
- declares the same writer;
- has an unclear writer for the same scope.

No semantic independence may be inferred from filenames, branch names, draft status, historical intent, or a previous authorization verdict. Consequently, older open authorization pull requests that still declare the same specification remain a blocking Stage 0 observation until their state no longer meets the frozen overlap rule under separately authorized governance action. This plan does not close, edit, merge, or otherwise mutate those pull requests.

### Stage 0 result

Stage 0 must return a deterministic, content-digested GitHub-metadata result with:

```text
stage = CONNECTOR_STAGE_0
result = PASS | BLOCKED
repository
mainRef
mainSha
planCommit
planParent
planPath
planBlob
implementationBranchState
implementationPrState
authorizationPrNumber
authorizationPrHead
writer
writerMode
openPrRegistryDigest
allowlist
semanticConflictKeys
canonicalGateResults
diagnostics
observedAt
contentDigest
```

A blocked result authorizes zero mutation. The result is metadata evidence, not command-result evidence and not acceptance.

## Task 2 — Sole authorized connector mutation

Only after connector Stage 0 returns `PASS` and the connector authorization has a fresh independent exact-head `ACCEPT`, one GitHub branch-creation mutation is authorized:

```text
create branch chatgpt/ewf-00-preflight-verification-trace-mvp
from the exact plan commit frozen by the authorization brief
```

The branch must be created from the full exact plan commit SHA. It must not be created from `main`, an authorization PR head, an abbreviated SHA, PR #20's plan commit, PR #18's plan commit, or another docs authorization head.

The branch-creation response must bind the resulting exact GitHub ref and SHA. If the branch exists, the connector must not update, reuse, delete, force, or recreate it; Stage 0 stops instead.

No other setup mutation is authorized. In particular, do not:

- update an existing ref;
- force-push;
- rebase;
- merge;
- create an alternate implementation branch;
- create a second writer branch;
- create a local checkout/worktree/index/ref;
- create source content before branch creation is verified.

## Task 3 — Connector-native write model

After branch creation:

- every repository write uses the GitHub connector;
- the designated writer is the sole writer;
- reviewers and auditors remain read-only;
- before every write, re-read the current implementation branch HEAD;
- every write must name the expected exact predecessor/current writer commit;
- for an existing path, re-read and bind its current GitHub blob SHA before update;
- for a new path, verify path absence at the current branch HEAD;
- do not perform parallel writes to the same path;
- do not overwrite a change that was not read back;
- stop if current branch HEAD differs from the expected writer predecessor;
- read back the resulting branch ref, commit, changed paths, and blob identities after each write.

Remote correctness replaces local-cleanliness claims with:

- exact branch-head lineage;
- exact direct parent per commit;
- exact per-commit changed paths;
- GitHub tree/blob identities;
- current-head compare before writes;
- implementation PR diff containment;
- branch and pull-request collision checks;
- existing CI result at the exact commit SHA.

No document or report may claim local worktree cleanliness.

## Task 4 — CI-driven TDD topology

TDD is performed through commits on the implementation branch, a Draft implementation pull request, and the existing GitHub Actions workflow. Do not claim local RED or local GREEN.

### Implementation Commit A

Message:

```text
test(ewf): define preflight verification trace contracts
```

Changed path only:

```text
tests/ewf-preflight-verification-trace.test.mjs
```

Requirements:

- define the initial contract tests and missing-implementation expectations;
- open the Draft implementation pull request after Commit A;
- wait for the existing GitHub Actions run at exact Commit A;
- expect RED only because the authorized adapter/templates are absent;
- do not add an artificial failing assertion solely to force RED;
- preserve the exact failed run, run ID, job ID, steps, and conclusion as RED evidence.

### Implementation Commit B

Message:

```text
feat(ewf): add preflight verification trace templates
```

Changed paths only:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
```

### Implementation Commit C

Message:

```text
feat(ewf): implement preflight verification trace adapter
```

Changed path only:

```text
scripts/ewf-preflight-trace.mjs
```

### Implementation Commit D

Message:

```text
test(ewf): complete preflight verification trace matrix
```

Changed path only:

```text
tests/ewf-preflight-verification-trace.test.mjs
```

Requirements:

- complete the mandatory negative matrix;
- preserve deterministic diagnostic ordering;
- require final existing CI GREEN at exact Commit D;
- use Commit D as the implementation subject when no remediation is needed.

If remediation is required:

- add a separate commit;
- state the exact failing CI evidence and remediation reason;
- modify only authorized files;
- never squash or hide failed evidence;
- re-read branch HEAD before the write;
- keep the implementation pull request Draft;
- define the final implementation subject as the exact last source/test commit;
- verify that the cumulative diff from the exact plan commit to the final subject contains only the four-file allowlist.

## Task 5 — Existing GitHub Actions only

`.github/**` must not change. No workflow may be added or edited. No check may be described as executed unless the existing workflow actually executes it at the exact SHA.

At the frozen main baseline, `.github/workflows/ci.yml` runs the `test` job on pull requests to `main`, including:

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

The workflow's existing dependency/tool setup is CI infrastructure behavior, not authorization to change repository dependencies or add installation logic to the implementation.

To retain focused EWF verification without editing CI, `tests/ewf-preflight-verification-trace.test.mjs` must contain a connector-verification harness exercised through `npm test`. The harness must execute or statically verify these focused sub-gates as applicable:

- accepted artifact contract check;
- adapter syntax and importability;
- test syntax and importability;
- forbidden direct `node:crypto` import;
- no duplicate digest/canonicalization/redaction implementation;
- exact four-file boundary metadata;
- required negative fixtures;
- deterministic diagnostics;
- no retry, discovery, installation, or remediation path;
- operation when Spec Kit is absent;
- digest and portable-redaction projections.

Evidence must classify each observation as one of:

1. declared focused sub-gate inside the authorized test harness;
2. command actually executed by existing CI;
3. static GitHub diff/blob/tree audit;
4. independent acceptance observation.

A declared focused sub-gate must not be reported as a standalone command run unless the existing CI log shows that standalone command.

## Task 6 — Verification declaration contract

`argv` is execution authority. `command` is display-only.

Every declaration binds:

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

Per-command declaration digest:

```text
normalize the complete declaration without declarationDigest
→ digestArtifact
→ attach declarationDigest
```

Verification manifest digest:

```text
normalize the complete manifest
→ omit verificationManifestDigest
→ digestArtifact
→ attach verificationManifestDigest
```

Every command result, trace node, evidence node, implementation report, and frozen handoff must bind the exact manifest digest, command ID, declaration digest, `argv`, cwd, inherited/explicit environment, timeout, and tool requirement. ID-only validation is invalid.

Result vocabulary is exactly:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

The adapter must preserve:

- no retry;
- no test discovery;
- no installation;
- no remediation engine;
- deterministic execution and diagnostic ordering;
- explicit cwd, environment, timeout, and tool requirement;
- optional-tool absence as visible `NOT_AVAILABLE`;
- required-tool absence as blocking;
- timeout, crash, invalid environment, and infrastructure faults as `ERROR` rather than `FAIL` or `PASS`.

Portable content digest projection is exactly:

```text
normalize complete result
→ redactPortableValue
→ omit contentDigest
→ digestArtifact
→ attach contentDigest
→ serialize
```

Safe repository-relative paths remain visible. Secrets, credentials, private environment values, and private absolute paths are redacted.

GitHub connector/API operations must not be represented as command results. GitHub metadata evidence and executable GitHub Actions evidence are separate layers with separate provenance.

## Task 7 — Mandatory negative-fixture matrix

The implementation test matrix must preserve all `EWF00-PVT-01` through `EWF00-PVT-12` boundaries and cover at least:

### Connector identity and authorization

- wrong repository;
- wrong plan commit;
- wrong plan parent;
- wrong plan path or blob;
- implementation branch already exists;
- implementation pull request already exists;
- open pull request file overlap;
- open pull request semantic-key overlap;
- writer mismatch;
- unclear writer for the same scope;
- incomplete remote registry;
- broken canonical entry gate;
- allowlist/exclusion mismatch;
- wrong parent/ref declaration;
- remote target collision;
- malformed remote identity;
- attempt to update, reuse, delete, or force an existing ref.

### Trace and declaration integrity

- duplicate requirement IDs;
- duplicate test IDs;
- broken requirement/test/command/evidence references;
- missing required command or evidence;
- correct command ID with wrong `argv`;
- wrong cwd;
- wrong inherited or explicit environment;
- wrong timeout;
- wrong tool requirement;
- declaration digest mismatch;
- verification manifest digest mismatch;
- trace digest mismatch;
- evidence digest mismatch;
- content digest mismatch.

### Result-state fidelity

- optional tool unavailable;
- required tool unavailable;
- timeout;
- process crash;
- infrastructure error;
- Spec Kit absent;
- deterministic output for identical normalized inputs.

### Redaction and containment

- secret/private-value redaction;
- safe repository-relative paths preserved;
- direct `node:crypto` import;
- duplicate digest implementation;
- duplicate canonicalization implementation;
- duplicate portable-redaction implementation;
- retry path;
- discovery path;
- installation path;
- remediation engine path;
- attempt to alter CI or dependencies;
- attempt to write outside the four-file allowlist;
- attempt to emit `ACCEPT`, `REJECT`, package acceptance, package status, release safety, pilot authorization, or product authorization.

## Task 8 — Evidence and acceptance topology

After the final implementation subject and GREEN existing CI:

- the implementation subject remains code/test/templates only;
- no report or evidence file is added to that subject;
- implementation evidence/report files require a separate evidence-only revision authorization;
- implementer evidence uses the literal status `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`;
- implementer evidence must not contain `ACCEPT`, `REJECT`, `package accepted`, or `release safe`.

The separately authorized evidence revision must bind:

```text
plan commit
plan parent
plan path
plan blob
authorization brief commit
authorization PR exact-head audit
implementation subject
implementation subject parent
exact changed files
implementation PR number and head
CI workflow run IDs and run numbers
CI job IDs and conclusions
trace digest
evidence digest
brief digest
verification manifest digest
command declaration digests
GitHub metadata observations
CI executable observations
```

A fresh independent exact-head read-only audit owns the implementation verdict. The auditor may read outside the four-file write allowlist and must independently verify branch lineage, diff containment, exact CI evidence, negative-fixture coverage, evidence identity, and absence of prohibited effects.

Passing `EWF00-PREFLIGHT-001` does not:

- accept `EWF-00`;
- authorize `EWF00-PILOTS-001`;
- change canonical package status;
- authorize product work;
- authorize P3-02;
- merge the implementation pull request;
- merge or close PR #20.

## Stop conditions

Stop before or during implementation if any of the following is true:

- main differs from `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- the plan commit is not a direct child of that main;
- plan path/blob/parent does not match the frozen brief;
- the connector authorization has no fresh independent exact-head `ACCEPT`;
- the implementation branch exists;
- an implementation pull request exists;
- the complete open-PR registry cannot be enumerated;
- another open PR has file overlap, spec overlap, semantic-key overlap, branch collision, writer collision, or unclear writer scope;
- the writer differs from `chatgpt-github-ewf00-preflight-primary-writer`;
- a write requires a path outside the four-file allowlist;
- CI, dependencies, package files, canonical docs, or package status must change;
- existing accepted EWF artifact implementation/templates/tests must change;
- the connector would need to force or update an existing ref;
- current branch HEAD differs from the expected writer predecessor;
- required existing CI evidence is missing at the exact SHA;
- implementation requires a local-only claim to pass;
- pilots, P3-02, product work, package status, release safety, or acceptance enters scope.

## Authorization effectiveness boundary

This plan alone is not effective implementation authorization. The subsequent brief and HANDOFF must bind the exact plan commit/blob/parent. The connector-native authorization becomes effective only after the final authorization PR head receives a fresh independent docs-only exact-head `ACCEPT`.

Until that verdict:

- do not create `chatgpt/ewf-00-preflight-verification-trace-mvp`;
- do not write any of the four implementation files;
- do not open an implementation pull request;
- do not supersede PR #20;
- do not claim implementation or package acceptance.

After that verdict, authorization v3 supersedes PR #20 only as the active execution substrate. PR #20 remains an unchanged historical Draft/unmerged authorization unless separately governed. The future implementation Stage 0 still applies the complete open-PR registry rule and fails closed on any remaining overlapping open pull request.
