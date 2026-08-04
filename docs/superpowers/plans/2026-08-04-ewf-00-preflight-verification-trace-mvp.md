# EWF-00 Preflight, Verification and Trace MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the minimum repository-local adapter for read-only preflight, exact declared-command verification, `requirement → test → command → evidence` trace validation, and frozen-handoff completeness without changing product behavior, canonical governance, CI, dependencies, or package status.

**Architecture:** Add one Node built-in-only adapter that imports the accepted command vocabulary, canonicalization, digest, artifact validation, frozen-brief validation, and portable-redaction primitives from `scripts/ewf-artifacts.mjs`. The adapter uses pure evaluators plus injected read-only Git/filesystem/process boundaries. It does not discover tests, infer ownership or status, retry commands, install tools, mutate CI, schedule a graph, remediate failures, or emit an acceptance verdict.

**Tech Stack:** Node.js ESM (`node >=20.19`), `node:test`, built-in `node:child_process`, `node:fs`, `node:os`, `node:path`, and `node:url`, plus accepted exports from `scripts/ewf-artifacts.mjs`; no new package. The new adapter must not import `node:crypto` or implement SHA/canonicalization itself.

## 1. Frozen identity and authority

| Field | Frozen value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Bounded spec | `EWF00-PREFLIGHT-001` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Approved implementation predecessor | `8828715ae1f636aa07d6a740724b9706d23923c1` |
| Expected predecessor parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Required local branch ref | `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Target remote | `origin` |
| Target remote ref | `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Remote collision policy | `REQUIRE_ABSENT` |
| Expected remote-ref state | `ABSENT` |
| Expected remote-ref SHA | `null` |
| Designated writer identity | `chatgpt-ewf00-preflight-primary-writer` |
| Declared worktree path | `../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree` |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

Canonical authority remains solely:

- `AGENTS.md`;
- `docs/ROADMAP.md`;
- `docs/IMPLEMENTATION_PLAN.md`;
- `docs/IMPLEMENTATION_STATUS.md`;
- `docs/DECISIONS.md`, including ADR-044.

Local EWF artifacts are subordinate and may not set package status, acceptance, release safety, ownership, or dependency truth.

## 2. Exact implementation boundary

Only these four paths may be created or modified by the implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Every other path is unauthorized. In particular, do not modify:

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
.specify/memory/constitution.md
.specify/templates/ewf/audit-result.template.json
.specify/templates/ewf/change-set.template.json
.specify/templates/ewf/frozen-acceptance-brief.template.json
.specify/templates/ewf/implementation-report.template.json
.specify/templates/ewf/lightweight-repair.template.json
.specify/templates/ewf/spec-metadata.template.json
.specify/templates/ewf/verification-manifest.template.json
scripts/ewf-artifacts.mjs
tests/ewf-artifact-contracts.test.mjs
docs/superpowers/evidence/**
```

Explicit exclusions:

- product behavior and product packages;
- package/status mutation or acceptance verdict generation;
- CI changes or new checks;
- dependency, binary, model, or tool installation;
- Spec Kit initialization;
- fast-check or mutation tooling;
- automatic test discovery, profile expansion, retry, or remediation;
- DAG, scheduler, queue, daemon, dashboard, or workflow server;
- small-repair or bounded product-package pilots;
- EWF-00 package-level acceptance;
- P3-02 Shadowing conflict resolution.

## 3. Reused accepted primitives

`scripts/ewf-preflight-trace.mjs` must import and reuse:

```js
import {
  COMMAND_RESULTS,
  canonicalizeArtifact,
  digestArtifact,
  validateArtifact,
  validateFrozenBrief,
  redactPortableValue
} from './ewf-artifacts.mjs';
```

The implementation must not create a second digest, canonicalization, frozen-brief, or redaction implementation. Tests must fail if `scripts/ewf-preflight-trace.mjs` directly imports `node:crypto`.

## 4. Public interface

The module exports exactly:

```js
export const PREFLIGHT_RESULTS = Object.freeze(['PASS', 'BLOCKED']);
export const DIAGNOSTIC_SEVERITIES = Object.freeze(['ERROR', 'WARNING']);
export const TOOL_REQUIREMENTS = Object.freeze(['REQUIRED', 'OPTIONAL']);
export const REMOTE_COLLISION_POLICIES = Object.freeze([
  'REQUIRE_ABSENT',
  'REQUIRE_EXACT_SHA'
]);

export async function collectPreflightObservation(declaration, options = {}) {}
export function evaluatePreflight(declaration, observation, options = {}) {}
export async function runPreflight(declaration, options = {}) {}
export async function executeVerificationProfile(manifest, profile, options = {}) {}
export function validateTraceManifest(trace, bindings = {}) {}
export function validateFrozenHandoff(brief, bindings = {}) {}
```

Every evaluator returns deterministic diagnostics sorted by severity, code, path, and message. No function returns `ACCEPT`, `REJECT`, canonical package status, ownership, or release safety.

## 5. Frozen change-set extension contract

The accepted change-set artifact remains the outer declaration. Its `extensions` must contain:

```json
{
  "repositoryIdentity": "NguyenDukKyeon/VocabMaster",
  "expectedHead": "8828715ae1f636aa07d6a740724b9706d23923c1",
  "expectedPredecessorParent": "474bde8e3c7b09f757e7df4a1587f8a71b2e7865",
  "expectedBranch": "chatgpt/ewf-00-preflight-verification-trace-mvp",
  "expectedLocalHeadRef": "refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp",
  "remoteName": "origin",
  "targetRemote": "origin",
  "targetRemoteRef": "refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp",
  "remoteTargetCollisionPolicy": "REQUIRE_ABSENT",
  "expectedRemoteRefState": "ABSENT",
  "expectedRemoteRefSha": null,
  "canonicalFiles": [
    "AGENTS.md",
    "docs/ROADMAP.md",
    "docs/IMPLEMENTATION_PLAN.md",
    "docs/IMPLEMENTATION_STATUS.md",
    "docs/DECISIONS.md"
  ],
  "semanticConflictKeys": [
    "ewf:preflight-observation",
    "ewf:verification-execution",
    "ewf:trace-validation",
    "ewf:frozen-handoff-validation"
  ],
  "entryGates": [
    {
      "id": "EWF-00-status",
      "sourcePath": "docs/IMPLEMENTATION_STATUS.md",
      "expectedLiteral": "PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED",
      "required": true
    },
    {
      "id": "EWF-artifact-predecessor",
      "sourcePath": "docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/HANDOFF.md",
      "expectedLiteral": "EWF00-ARTIFACTS-001",
      "required": true
    }
  ]
}
```

The top-level `predecessor` and `branch` must match `expectedHead` and `expectedBranch`.

### 5.1 Remote collision policy

The policy is declared, never inferred:

- `REQUIRE_ABSENT`: `git ls-remote --refs <targetRemote> <targetRemoteRef>` must exit `0` with empty stdout. `expectedRemoteRefState` must be `ABSENT` and `expectedRemoteRefSha` must be `null`.
- `REQUIRE_EXACT_SHA`: the command must exit `0` with exactly one matching `<sha><TAB><ref>` row. `expectedRemoteRefState` must be `PRESENT_AT_SHA`; `expectedRemoteRefSha` must be a lowercase 40-character SHA.
- any other policy or inconsistent state/SHA tuple is `INVALID_REMOTE_COLLISION_POLICY`;
- no fetch, remote-tracking-ref refresh, or policy inference is allowed.

This authorization uses `REQUIRE_ABSENT`. A present remote target is a blocking collision even if it points to the approved predecessor.

### 5.2 Required diagnostics

The adapter must type at least:

```text
REPOSITORY_IDENTITY_MISMATCH
HEAD_MISMATCH
PREDECESSOR_PARENT_MISMATCH
BRANCH_MISMATCH
HEAD_REF_MISMATCH
LOCAL_TARGET_REF_MISMATCH
REMOTE_IDENTITY_MISMATCH
INVALID_REMOTE_COLLISION_POLICY
REMOTE_TARGET_OBSERVATION_ERROR
REMOTE_TARGET_COLLISION
REMOTE_TARGET_STATE_MISMATCH
REMOTE_TARGET_SHA_MISMATCH
DIRTY_WORKTREE
WRITER_MISSING
WRITER_MISMATCH
ACTIVE_CHANGE_REGISTRY_MISSING
FILE_OVERLAP
SEMANTIC_OVERLAP
CANONICAL_ENTRY_GATE_BROKEN
ALLOWLIST_MISMATCH
EXCLUSION_MISMATCH
```

## 6. Read-only Git observation boundary

The adapter may execute only these Git observations, with `shell: false` and the exact declared repository cwd:

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

`git symbolic-ref --quiet HEAD` must return the full expected local ref. `git show-ref --verify` must return the approved predecessor SHA and exact local ref. `git ls-remote` observes the target remote directly and does not update local refs.

Forbidden Git operations include:

```text
fetch
pull
checkout
switch
reset
clean
stash
rebase
add
commit
update-ref
push
remote set-url
```

The adapter may use read-only `realpath`, `readFile`, and `stat` on declared paths. It must not infer repository identity from directory names or writer identity from the OS user, Git author, or environment.

## 7. One-time manual bootstrap preflight

The adapter does not exist at the approved predecessor. Therefore the first source write uses a one-time manual bootstrap gate. It is not a substitute for the adapter and is not reusable as a general workflow.

### 7.1 Stage A — before branch/worktree creation

Run from a clean checkout whose HEAD is the approved predecessor:

```text
git rev-parse --show-toplevel
git rev-parse HEAD
git rev-parse HEAD^
git status --porcelain=v1 -z --untracked-files=all
git remote get-url origin
git ls-remote --refs origin refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
```

Expected:

```text
repository identity: NguyenDukKyeon/VocabMaster
HEAD: 8828715ae1f636aa07d6a740724b9706d23923c1
HEAD^: 474bde8e3c7b09f757e7df4a1587f8a71b2e7865
worktree status bytes: empty
remote name: origin
normalized remote identity: NguyenDukKyeon/VocabMaster
target remote ref state: ABSENT
target remote ref SHA: null
```

Before branch creation, supply external bootstrap evidence:

```json
{
  "writerIdentity": "chatgpt-ewf00-preflight-primary-writer",
  "writerMode": "exclusive",
  "activeRegistry": [
    {
      "id": "EWF00-PREFLIGHT-001",
      "active": true,
      "writerIdentity": "chatgpt-ewf00-preflight-primary-writer",
      "branch": "chatgpt/ewf-00-preflight-verification-trace-mvp",
      "worktreePath": "../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree",
      "allowlist": [
        ".specify/templates/ewf/preflight-result.template.json",
        ".specify/templates/ewf/trace-manifest.template.json",
        "scripts/ewf-preflight-trace.mjs",
        "tests/ewf-preflight-verification-trace.test.mjs"
      ],
      "semanticConflictKeys": [
        "ewf:preflight-observation",
        "ewf:verification-execution",
        "ewf:trace-validation",
        "ewf:frozen-handoff-validation"
      ]
    }
  ]
}
```

The active registry must be explicit even when it contains only this change set. Any additional active row intersecting a file or semantic key blocks branch creation.

Only after Stage A passes may the operator create the local branch and isolated worktree from exact `8828715ae1f636aa07d6a740724b9706d23923c1`. Branch/worktree creation is authorized Git metadata setup, not source implementation.

### 7.2 Stage B — after branch/worktree creation, before Task 1

Run inside the declared implementation worktree:

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

Expected:

```text
HEAD: 8828715ae1f636aa07d6a740724b9706d23923c1
HEAD^: 474bde8e3c7b09f757e7df4a1587f8a71b2e7865
HEAD ref: refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
local target ref SHA: 8828715ae1f636aa07d6a740724b9706d23923c1
worktree: exact real path of ../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree
worktree status bytes: empty
remote: origin normalized to NguyenDukKyeon/VocabMaster
remote target ref state: ABSENT
remote target ref SHA: null
writer: chatgpt-ewf00-preflight-primary-writer
active registry: exact evidence from Stage A, with no overlap
```

Any mismatch stops before the first repository content write.

### 7.3 Bootstrap result recording

The bootstrap result is written outside the repository worktree to the OS temporary directory as:

```text
ewf00-preflight-bootstrap-8828715ae1f636aa07d6a740724b9706d23923c1.json
```

It contains:

```json
{
  "schemaVersion": 1,
  "artifactKind": "bootstrap-preflight-result",
  "authorityLabel": "MANUAL_BOOTSTRAP_PREFLIGHT / NOT_AUTHORIZATION",
  "specId": "EWF00-PREFLIGHT-001",
  "approvedPredecessor": "8828715ae1f636aa07d6a740724b9706d23923c1",
  "expectedPredecessorParent": "474bde8e3c7b09f757e7df4a1587f8a71b2e7865",
  "branch": "chatgpt/ewf-00-preflight-verification-trace-mvp",
  "targetRemote": "origin",
  "targetRemoteRef": "refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp",
  "remoteCollisionPolicy": "REQUIRE_ABSENT",
  "writerIdentity": "chatgpt-ewf00-preflight-primary-writer",
  "activeRegistryDigest": "lowercase SHA-256 from digestArtifact",
  "commands": [],
  "result": "PASS",
  "zeroRepositoryWrites": true,
  "contentDigest": "lowercase SHA-256 from digestArtifact"
}
```

Recording projection:

1. collect exact argv, cwd, exit code, stdout digest, stderr digest, and observed values for every Stage A and Stage B command;
2. normalize the result;
3. apply `redactPortableValue()` to the complete result;
4. omit top-level `contentDigest`;
5. compute `digestArtifact()` over the redacted projection;
6. attach `contentDigest`;
7. serialize the final object;
8. create the temp file with exclusive-create semantics;
9. verify no repository path, index, ref, or worktree content changed during result recording.

The record may later be referenced by the implementation report/evidence-only revision. It must not be committed in the implementation subject.

After Task 2, the implemented adapter must pass its own focused tests and then self-host preflight for subsequent change sets. The manual bootstrap record remains the only authorized evidence for the first write; it is not retroactively replaced.

## 8. Preflight result digest projection

For any adapter-produced preflight result:

```text
normalize complete result
→ portable redaction
→ omit top-level contentDigest
→ digestArtifact(redacted projection)
→ attach contentDigest
→ serialize
```

Digesting before redaction is forbidden because portable serialization could otherwise invalidate the stored digest. Safe repository-relative paths and stable repository/commit identities remain; private absolute paths and secrets are redacted.

## 9. Verification declaration authority

`argv` is the sole execution authority. The `command` field is display-only and is ignored by the executor. A result is valid only when it binds the exact declaration.

Each command declaration contains:

```json
{
  "id": "ewf-preflight-focused",
  "profile": "focused",
  "command": "node --test tests/ewf-preflight-verification-trace.test.mjs",
  "argv": ["node", "--test", "tests/ewf-preflight-verification-trace.test.mjs"],
  "cwd": ".",
  "inheritEnvironment": [
    "PATH",
    "HOME",
    "USERPROFILE",
    "SYSTEMROOT",
    "COMSPEC",
    "PATHEXT",
    "TEMP",
    "TMP",
    "APPDATA",
    "LOCALAPPDATA",
    "CI"
  ],
  "environment": {},
  "timeoutMs": 120000,
  "toolRequirement": "REQUIRED",
  "requirements": ["EWF00-PVT-01"],
  "declarationDigest": "digestArtifact(command declaration with declarationDigest omitted)"
}
```

Rules:

- `argv` is a non-empty string array and `argv[0]` is the executable;
- executor uses `spawn(argv[0], argv.slice(1), { shell: false, cwd, env })`;
- `cwd` resolves inside repository root;
- inherited keys are exact, unique, and may be absent from the host;
- explicit environment values are strings and override inherited values;
- `timeoutMs` is a positive safe integer;
- `toolRequirement` is `REQUIRED` or `OPTIONAL`;
- commands execute once, in profile array order;
- no shell, retry, discovery, expansion, or installation;
- raw stdout/stderr are not stored in portable evidence; their byte digests are stored.

### 9.1 Manifest and command digest projection

For each command:

```text
normalize exact {
  id,
  profile,
  command,
  argv,
  cwd,
  inheritEnvironment,
  environment,
  timeoutMs,
  toolRequirement,
  requirements
}
→ digestArtifact
→ declarationDigest
```

For the full verification manifest:

```text
normalize manifest
→ remove extensions.verificationManifestDigest
→ digestArtifact
→ extensions.verificationManifestDigest
```

The trace manifest, every command result, every evidence node, the implementation report, and the frozen handoff must bind:

- `verificationManifestDigest`;
- command `id`;
- command `declarationDigest`;
- exact `argv`;
- exact `cwd`;
- exact inherited/explicit environment declaration;
- exact timeout;
- exact tool requirement.

Validation by ID alone is forbidden.

### 9.2 Command result shape

Each result includes:

```js
{
  id,
  profile,
  declarationDigest,
  verificationManifestDigest,
  command,
  argv,
  cwd,
  inheritEnvironment,
  environment,
  timeoutMs,
  toolRequirement,
  result: 'PASS' | 'FAIL' | 'ERROR' | 'NOT_RUN' | 'NOT_AVAILABLE',
  startedAt,
  endedAt,
  durationMs,
  exitCode,
  signal,
  environmentDigest,
  stdoutDigest,
  stderrDigest,
  diagnostics: []
}
```

A result/evidence record is invalid when any declaration-bound field differs, even if the ID and result are internally consistent.

Classification:

- exit `0` → `PASS`;
- normal non-zero exit → `FAIL`;
- executable `ENOENT` → `NOT_AVAILABLE`;
- timeout → `ERROR / COMMAND_TIMEOUT`;
- signal/crash → `ERROR / COMMAND_CRASH`;
- invalid cwd/environment or other spawn failure → `ERROR / COMMAND_INFRASTRUCTURE_ERROR`;
- declared but unexecuted → `NOT_RUN`.

Required results must be `PASS`; optional `NOT_RUN` or `NOT_AVAILABLE` remains visible and cannot become `PASS`.

## 10. Frozen verification profiles

All commands use:

```json
{
  "cwd": ".",
  "inheritEnvironment": [
    "PATH",
    "HOME",
    "USERPROFILE",
    "SYSTEMROOT",
    "COMSPEC",
    "PATHEXT",
    "TEMP",
    "TMP",
    "APPDATA",
    "LOCALAPPDATA",
    "CI"
  ],
  "environment": {},
  "toolRequirement": "REQUIRED"
}
```

### 10.1 Focused profile — exact order

| ID | argv | timeoutMs |
|---|---|---:|
| `ewf-preflight-focused` | `["node","--test","tests/ewf-preflight-verification-trace.test.mjs"]` | 120000 |
| `ewf-artifact-check` | `["node","scripts/ewf-artifacts.mjs","--check"]` | 30000 |
| `ewf-script-syntax` | `["node","--check","scripts/ewf-preflight-trace.mjs"]` | 30000 |
| `ewf-test-syntax` | `["node","--check","tests/ewf-preflight-verification-trace.test.mjs"]` | 30000 |
| `ewf-diff-check` | `["git","diff","--check"]` | 30000 |

### 10.2 PR profile — exact order

| ID | argv | timeoutMs |
|---|---|---:|
| `repository-tests` | `["npm","test"]` | 600000 |
| `repository-check` | `["npm","run","check"]` | 120000 |
| `roadmap-audit` | `["npm","run","audit:roadmap"]` | 120000 |
| `repository-build` | `["npm","run","build"]` | 300000 |

No command may be added or substituted without replacement authorization.

## 11. Trace manifest contract

The minimum graph is:

```text
requirement → test → command declaration → command result/evidence
```

The trace manifest must include top-level `verificationManifestDigest`. Command nodes include exact declaration fields and `declarationDigest`. Evidence nodes bind subject, command declaration digest, manifest digest, environment digest, result, and content digest.

The validator returns `ERROR` for:

- duplicate requirement, test, command, or evidence IDs;
- broken requirement→test, test→command, or command→evidence references;
- missing required command result/evidence;
- required result other than `PASS`;
- command/evidence declaration digest mismatch;
- verification manifest digest mismatch;
- argv/cwd/environment/timeout/tool-requirement mismatch;
- evidence bound to another command, subject, or environment;
- trace/evidence/content digest mismatch;
- a `SHARED` test without explicit boundary rationale.

Repository tests outside the declared spec are not automatically orphans. Plan/task references remain structured metadata and manual-review evidence; the MVP does not build a general DAG.

## 12. Frozen-handoff completeness

`validateFrozenHandoff()` first calls accepted `validateFrozenBrief()`, then validates exact extended bindings:

- canonical package `EWF-00`;
- spec `EWF00-PREFLIGHT-001`;
- subject and parent;
- frozen spec revision;
- trace, evidence, and brief digests;
- exact four-file implementation allowlist;
- exact exclusions;
- actual changed-file containment;
- `verificationManifestDigest`;
- every required command ID and `declarationDigest`;
- every required result bound to exact argv/cwd/environment/timeout/tool requirement.

Any mismatch returns invalid/`BLOCKED_BY_INVALID_BRIEF`. The function never emits `ACCEPT`.

## 13. Mandatory negative fixtures

All Git/filesystem fixtures use disposable repositories/directories and never dirty the user worktree.

Required fixtures:

- wrong repository/root/worktree;
- wrong HEAD;
- wrong predecessor parent;
- detached or wrong HEAD ref;
- local target ref at wrong SHA;
- wrong remote identity;
- remote target present under `REQUIRE_ABSENT`;
- remote target present at unexpected SHA under `REQUIRE_EXACT_SHA`;
- invalid collision policy/state/SHA tuple;
- `git ls-remote` error;
- assertion that no `fetch` or mutating Git command ran;
- tracked dirty tree;
- untracked dirty tree;
- missing/undeclared writer;
- missing active registry;
- file overlap;
- semantic overlap with different files;
- broken canonical entry gate;
- allowlist/exclusion mismatch;
- duplicate requirement/test/command/evidence IDs;
- broken references;
- missing required command/evidence;
- result with correct ID but different argv;
- result with correct ID but different cwd;
- result with altered inherited/explicit environment;
- result with altered timeout/tool requirement;
- command declaration digest mismatch;
- verification manifest digest mismatch;
- optional tool unavailable;
- required tool unavailable;
- timeout;
- crash/signal;
- infrastructure error;
- Spec Kit absent;
- deterministic diagnostics and digest;
- secret/private-path redaction;
- safe repository-relative path preserved;
- rollback to manual canonical commands;
- bootstrap Stage A/Stage B pass and each mismatch blocks before source write.

## 14. Acceptance criteria mapping

| Requirement | Required evidence |
|---|---|
| `EWF00-PVT-01` | Wrong repository, HEAD, parent, local ref, remote identity, or remote target blocks before write |
| `EWF00-PVT-02` | Dirty tree, writer/registry mismatch, file/semantic overlap blocks with zero-write evidence |
| `EWF00-PVT-03` | Canonical entry gates use declared exact evidence and never mutate or choose status |
| `EWF00-PVT-04` | Only exact argv declarations run in order, once, without retry/discovery/install |
| `EWF00-PVT-05` | Five-state result plus exact declaration/environment/duration/content binding |
| `EWF00-PVT-06` | Duplicate/broken/missing/digest/declaration mismatch detection |
| `EWF00-PVT-07` | `SHARED` rationale required; no repository-wide orphan inference |
| `EWF00-PVT-08` | Subject/parent/spec/trace/evidence/brief/manifest/declaration mismatch blocks without verdict |
| `EWF00-PVT-09` | Core adapter works with Spec Kit absent |
| `EWF00-PVT-10` | Same normalized/redacted input and fixed clock produce byte-identical diagnostics/output/digest |
| `EWF00-PVT-11` | Secrets/private absolute paths redacted; stable identity and safe relative paths preserved |
| `EWF00-PVT-12` | No CI mutation, orchestration runtime, retry engine, installer, product behavior, or package status change |

Passing this slice does not accept EWF-00 and does not authorize pilots.

## 15. TDD task plan

### Task 1: Freeze new templates and digest projections

**Files:**
- Create: `.specify/templates/ewf/preflight-result.template.json`
- Create: `.specify/templates/ewf/trace-manifest.template.json`
- Test: `tests/ewf-preflight-verification-trace.test.mjs`

- [ ] Write failing tests for exact template kinds, subordinate authority labels, remote/ref fields, verification manifest digest bindings, command declaration digests, and redacted preflight `contentDigest`.
- [ ] Run `node --test tests/ewf-preflight-verification-trace.test.mjs` and confirm RED.
- [ ] Create the minimum templates.
- [ ] Re-run focused tests and confirm GREEN.
- [ ] Review that no existing template changed.

### Task 2: Implement read-only preflight and collision contract

**Files:**
- Modify: `scripts/ewf-preflight-trace.mjs`
- Test: `tests/ewf-preflight-verification-trace.test.mjs`

- [ ] Write failing disposable-repository tests for repository/HEAD/parent/branch/ref/worktree/remote, clean state, writer/registry, overlap, entry gates, collision policy, `ls-remote`, deterministic diagnostics, zero writes, and forbidden Git commands.
- [ ] Confirm RED.
- [ ] Implement `collectPreflightObservation()`, `evaluatePreflight()`, `runPreflight()`, and the `preflight` CLI mode using only the frozen read-only command list.
- [ ] Confirm GREEN.
- [ ] Confirm the new script does not import `node:crypto`.
- [ ] Run the new adapter preflight against disposable fixtures.
- [ ] From this task onward, use the adapter as the self-hosted preflight implementation for subsequent change sets; do not reinterpret it as retroactive evidence for the first write.

### Task 3: Implement exact verification declaration execution

**Files:**
- Modify: `scripts/ewf-preflight-trace.mjs`
- Test: `tests/ewf-preflight-verification-trace.test.mjs`

- [ ] Write failing tests for argv authority, exact cwd/environment/timeout/tool requirement, declaration digest, manifest digest, ordered one-attempt execution, optional/required unavailability, failure, timeout, crash, and infrastructure error.
- [ ] Confirm RED.
- [ ] Implement `executeVerificationProfile()` and `verify` CLI mode.
- [ ] Confirm GREEN.
- [ ] Verify no retry, shell, discovery, or installation path exists.

### Task 4: Implement trace and frozen-handoff validation

**Files:**
- Modify: `scripts/ewf-preflight-trace.mjs`
- Test: `tests/ewf-preflight-verification-trace.test.mjs`

- [ ] Write failing tests for duplicate IDs, broken references, missing evidence, exact declaration mismatch, manifest/declaration/content digest mismatch, shared rationale, allowlist/exclusions, required results, and forbidden verdict fields.
- [ ] Confirm RED.
- [ ] Implement `validateTraceManifest()`, `validateFrozenHandoff()`, and `trace`/`brief` CLI modes.
- [ ] Confirm GREEN.

### Task 5: Complete negative matrix, rollback, and verification

**Files:**
- Modify only the four authorized implementation paths.

- [ ] Add the complete mandatory negative matrix, including bootstrap/collision/declaration-digest cases.
- [ ] Prove all disposable repositories/directories are removed and the user worktree snapshot is unchanged.
- [ ] Prove Spec Kit absence does not block core adapter modes.
- [ ] Prove rollback leaves the accepted manual commands usable.
- [ ] Run the focused profile in exact order.
- [ ] Run the PR profile in exact order.
- [ ] Review `git diff` against `8828715ae1f636aa07d6a740724b9706d23923c1`.
- [ ] Stop if any changed path is outside the allowlist.
- [ ] Commit the implementation subject with only the four authorized paths.
- [ ] Do not add implementer acceptance or package status.

## 16. Evidence and acceptance topology

The implementation subject is the last commit containing only authorized implementation files. After that subject and CI are green:

1. request separate evidence-only revision authorization;
2. bind subject, parent, spec revision, trace digest, evidence digest, brief digest, verification manifest digest, and command declaration digests;
3. keep implementation report `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`;
4. do not let the implementer write `ACCEPT`;
5. perform a fresh independent read-only audit on the exact frozen subject/evidence identity;
6. merge only after independent `ACCEPT`.

Passing `EWF00-PREFLIGHT-001` does not accept EWF-00, authorize `EWF00-PILOTS-001`, or change product/package status.

## 17. Stop conditions

Stop immediately if:

- HEAD is not `8828715ae1f636aa07d6a740724b9706d23923c1`;
- `HEAD^` is not `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- branch/ref is not the frozen implementation branch/ref;
- remote `origin` does not normalize to `NguyenDukKyeon/VocabMaster`;
- target remote ref is not absent under `REQUIRE_ABSENT`;
- worktree is dirty;
- writer or active registry evidence is missing/mismatched;
- another active writer overlaps a file or semantic key;
- canonical entry evidence conflicts or needs interpretation;
- a required write falls outside the four-file allowlist;
- `scripts/ewf-artifacts.mjs` or accepted templates/tests must change;
- implementation needs canonical docs, product source, CI, package files, dependencies, or installation;
- implementation needs retry, discovery, remediation, scheduler, queue, daemon, dashboard, or workflow runtime;
- verification cannot bind exact declarations/digests;
- P3-02 Shadowing or pilot work enters scope;
- package status or acceptance would need to change.
