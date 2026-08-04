# EWF-00 Preflight, Verification and Trace MVP — Final Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the minimum repository-local adapter for read-only preflight, exact declared-command verification, `requirement → test → command → evidence` trace validation, and frozen-handoff completeness without changing product behavior, canonical governance, CI, dependencies, package status, or acceptance.

**Architecture:** Add one Node ESM adapter with pure evaluators and injected read-only Git/filesystem/process boundaries. It imports accepted command vocabulary, canonicalization, digest, validation, frozen-brief, and portable-redaction primitives from `scripts/ewf-artifacts.mjs`; it never discovers tests, retries, installs tools, mutates CI, infers ownership/status, schedules work, remediates failures, or emits acceptance.

**Tech Stack:** Node.js ESM (`node >=20.19`), `node:test`, built-in `node:child_process`, `node:fs`, `node:os`, `node:path`, and `node:url`; no package change. Direct `node:crypto` import and a second digest/canonicalization/redaction implementation are forbidden.

## Global constraints and immutable identity

| Field | Frozen value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Package / spec | `EWF-00` / `EWF00-PREFLIGHT-001` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Final plan path | `docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md` |
| Final plan parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Authorization branch | `chatgpt/ewf-00-preflight-trace-authorization-v2` |
| Implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Local implementation ref | `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Target remote / ref | `origin` / `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Collision policy | `REQUIRE_ABSENT`, expected state `ABSENT`, expected SHA `null` |
| Writer | `chatgpt-ewf00-preflight-primary-writer`, mode `exclusive` |
| Worktree | `../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree` |
| Package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

Commit 1 changes only this plan path. Git computes its commit SHA and this file's blob SHA after the commit exists; Commit 2 and Commit 3 must bind both exact lowercase 40-character values. A path-only binding, abbreviated SHA, or predecessor containing another plan blob is invalid.

Canonical authority remains solely `AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`, and `docs/DECISIONS.md` including ADR-044. This plan and all EWF artifacts are subordinate and cannot set package ownership, dependency truth, status, release safety, or acceptance.

## Exact implementation boundary

Only these paths may change in the future implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Everything else is excluded, including canonical docs, `.github/**`, `src/**`, `server/**`, `public/**`, package manifests/lockfiles, dependencies, existing EWF templates/tests, `scripts/ewf-artifacts.mjs`, evidence files, product behavior, pilots, P3-02 work, package/status mutation, acceptance generation, test discovery, retry, remediation, installers, Spec Kit initialization, fast-check, mutation tooling, DAGs, schedulers, queues, daemons, dashboards, and workflow servers.

The adapter must import and reuse:

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

## Public interface

```js
export const PREFLIGHT_RESULTS = Object.freeze(['PASS', 'BLOCKED']);
export const DIAGNOSTIC_SEVERITIES = Object.freeze(['ERROR', 'WARNING']);
export const TOOL_REQUIREMENTS = Object.freeze(['REQUIRED', 'OPTIONAL']);
export const REMOTE_COLLISION_POLICIES = Object.freeze(['REQUIRE_ABSENT', 'REQUIRE_EXACT_SHA']);
export async function collectPreflightObservation(declaration, options = {}) {}
export function evaluatePreflight(declaration, observation, options = {}) {}
export async function runPreflight(declaration, options = {}) {}
export async function executeVerificationProfile(manifest, profile, options = {}) {}
export function validateTraceManifest(trace, bindings = {}) {}
export function validateFrozenHandoff(brief, bindings = {}) {}
```

Diagnostics are deterministic and sorted by severity, code, path, then message. No public output may contain `ACCEPT`, `REJECT`, canonical package status, ownership, or release safety.

## Change-set and plan identity contract

The frozen brief and HANDOFF instantiate these exact fields:

- `approvedPlanPath`: exact final plan path above;
- `approvedPlanCommit`: exact Commit 1 SHA;
- `approvedPlanBlob`: exact Git blob SHA of the plan at Commit 1;
- `expectedHead`: equal to `approvedPlanCommit`;
- `expectedPredecessorParent`: exact `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- exact implementation branch/ref, target remote/ref, collision tuple, writer, worktree, four-file allowlist, exclusions, and stop conditions;
- exact canonical files and semantic keys below.

```text
canonical files:
AGENTS.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md

semantic keys:
ewf:preflight-observation
ewf:verification-execution
ewf:trace-validation
ewf:frozen-handoff-validation
```

Mandatory exact-literal entry gates:

| ID | Source | Expected literal |
|---|---|---|
| `EWF-00-status` | `docs/IMPLEMENTATION_STATUS.md` | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| `EWF-artifact-predecessor` | bounded-pack `HANDOFF.md` | `EWF00-ARTIFACTS-001` |

The top-level change-set predecessor/branch must equal the brief's exact plan commit and implementation branch. Missing commit/blob/path parity fails closed.

## Parent/ref and remote collision contract

Read-only adapter commands, with exact cwd and `shell: false`:

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

`REQUIRE_ABSENT` requires `ls-remote` exit `0` with empty stdout. `REQUIRE_EXACT_SHA` requires exactly one `<sha><TAB><ref>` row at the declared lowercase SHA. Policy/state/SHA inconsistency is `INVALID_REMOTE_COLLISION_POLICY`. No fetch or remote-tracking inference is permitted.

Required diagnostics include repository, HEAD, parent, branch/ref, local target ref, worktree, remote identity/observation/collision/state/SHA, clean state, writer/registry, file/semantic overlap, canonical gate, allowlist, and exclusion mismatches.

## Exact remote URL normalization

Accepted forms are exactly:

```text
https://github.com/OWNER/REPOSITORY
https://github.com/OWNER/REPOSITORY.git
ssh://git@github.com/OWNER/REPOSITORY
ssh://git@github.com/OWNER/REPOSITORY.git
git@github.com:OWNER/REPOSITORY
git@github.com:OWNER/REPOSITORY.git
```

Rules:

1. Reject leading/trailing whitespace; never silently trim.
2. Accept only the three syntaxes above. Scheme and host compare ASCII case-insensitively; host must normalize to `github.com`.
3. Reject every explicit port. HTTPS permits no username/password. SSH and SCP-like require username exactly `git` and no password.
4. Reject query, fragment, percent-encoding, backslash, empty/dot segment, doubled slash, trailing slash, or a path other than exactly `OWNER/REPOSITORY`.
5. Each segment matches `[A-Za-z0-9_.-]+` and is neither `.` nor `..`.
6. Strip at most one exact lowercase `.git` suffix. Reject `.git.git` after the single strip.
7. Compare owner/repository to `NguyenDukKyeon/VocabMaster` ASCII case-insensitively.
8. Canonical output is exactly `NguyenDukKyeon/VocabMaster`, preserving declared authority casing rather than input casing.

Fixtures must cover accepted HTTPS/SSH/SCP-like forms with and without `.git`; mixed-case host/owner/repository; credential-bearing HTTPS; non-`git` SSH user; wrong host/repo; query; fragment; port; percent-encoding; malformed/extra/trailing path; doubled `.git.git`; and canonical output casing.

## Reachable bootstrap sequence

The adapter does not exist at the plan commit. The first source write uses one manual bootstrap. No fetch is authorized. If the exact plan object is not already present locally, stop for separate authorization.

### Stage 0 — clean `main`, before branch/worktree creation

Run from `refs/heads/main`:

```text
git rev-parse --show-toplevel
git rev-parse HEAD
git symbolic-ref --quiet HEAD
git show-ref --verify refs/heads/main
git status --porcelain=v1 -z --untracked-files=all
git remote get-url origin
git cat-file -e <EXACT_PLAN_COMMIT>^{commit}
git rev-list --parents -n 1 <EXACT_PLAN_COMMIT>
git diff-tree --no-commit-id --name-only -r <EXACT_PLAN_COMMIT>
git ls-tree <EXACT_PLAN_COMMIT> -- docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md
git show-ref --verify refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
git worktree list --porcelain
git ls-remote --refs origin refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
```

Commit 2 must print this block with the literal Commit 1 SHA; operators may not execute the angle-bracket form. Stage 0 expects: main HEAD/ref exactly `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`; clean bytes; normalized origin identity; exact plan object present; exact parent; Commit 1 diff containing only the plan path; `ls-tree` mode `100644`, type `blob`, exact plan blob/path; absent local implementation ref/worktree; absent remote implementation ref; and explicit non-overlapping writer/registry evidence.

The active registry contains exactly one current row with the designated writer, branch, worktree, four allowlist paths, and four semantic keys. Any additional active row intersecting a path or key blocks Stage 0.

### Sole authorized Git metadata mutation

Only after Stage 0 PASS may the operator run the one literal command frozen in Commit 2:

```text
git worktree add -b chatgpt/ewf-00-preflight-verification-trace-mvp \
  ../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree \
  <EXACT_PLAN_COMMIT>
```

Commit 2 substitutes the literal SHA. No checkout, switch, reset, rebase, force, detached worktree, alternate branch/path, or second setup command is authorized.

### Stage 1 — implementation worktree, before Task 1

Run the adapter's nine read-only commands above. Expect HEAD = exact plan commit; HEAD^ = exact main; full symbolic ref/local branch ref = required ref at exact plan commit; clean tracked/untracked state; exact worktree realpath; origin canonical output; remote implementation ref absent; and identical non-overlapping writer/registry evidence.

Only after Stage 1 PASS may an external bootstrap record be created in the OS temp directory as `ewf00-preflight-bootstrap-<exact-plan-commit>.json`. It binds plan path/commit/blob/parent, Stage 0/1 argv/cwd/exit/digests/observations, literal metadata command argv, remote normalization/collision, writer, registry digest, `PASS`, and `zeroRepositoryWrites: true` under `MANUAL_BOOTSTRAP_PREFLIGHT / NOT_AUTHORIZATION`.

Record projection is: normalize complete result → `redactPortableValue()` → omit top-level `contentDigest` → `digestArtifact()` → attach digest → serialize → exclusive-create temp file. It is invalid unless all exact plan bindings and commands match Commit 2. It is never committed in the implementation subject. Only after the valid record exists may Task 1 write repository content. After Task 2, the adapter self-hosts later preflights but does not replace first-write bootstrap evidence.

## Verification declarations and digests

`argv` is execution authority; `command` is display-only. Each command declaration binds exact `id`, `profile`, `command`, `argv`, `cwd`, `inheritEnvironment`, `environment`, `timeoutMs`, `toolRequirement`, and requirements. The executor uses `spawn(argv[0], argv.slice(1), { shell: false, cwd, env })`, executes once in array order, and performs no retry/discovery/expansion/installation.

Per-command projection:

```text
normalize exact declaration without declarationDigest
→ digestArtifact
→ declarationDigest
```

Manifest projection:

```text
normalize manifest
→ remove extensions.verificationManifestDigest
→ digestArtifact
→ extensions.verificationManifestDigest
```

Every command result, trace command/evidence node, implementation report, and frozen handoff binds the manifest digest, command ID/declaration digest, exact argv/cwd/inherited+explicit environment/timeout/tool requirement. ID-only validation is forbidden.

Result vocabulary is exactly `PASS`, `FAIL`, `ERROR`, `NOT_RUN`, `NOT_AVAILABLE`. Exit `0` is PASS; normal non-zero is FAIL; executable `ENOENT` is NOT_AVAILABLE; timeout, signal/crash, invalid cwd/environment, or infrastructure failure is ERROR. Required results must be PASS. Optional NOT_RUN/NOT_AVAILABLE remains visible and never becomes PASS.

Portable preflight/result digest projection is always:

```text
normalize → portable redaction → omit contentDigest → digest → attach → serialize
```

Safe repository-relative paths remain; secrets and private absolute paths are redacted.

## Frozen verification profiles

All commands use cwd `.`, explicit environment `{}`, tool requirement `REQUIRED`, and exact inherited keys `PATH`, `HOME`, `USERPROFILE`, `SYSTEMROOT`, `COMSPEC`, `PATHEXT`, `TEMP`, `TMP`, `APPDATA`, `LOCALAPPDATA`, `CI`.

Focused, exact order:

| ID | argv | timeoutMs |
|---|---|---:|
| `ewf-preflight-focused` | `['node','--test','tests/ewf-preflight-verification-trace.test.mjs']` | 120000 |
| `ewf-artifact-check` | `['node','scripts/ewf-artifacts.mjs','--check']` | 30000 |
| `ewf-script-syntax` | `['node','--check','scripts/ewf-preflight-trace.mjs']` | 30000 |
| `ewf-test-syntax` | `['node','--check','tests/ewf-preflight-verification-trace.test.mjs']` | 30000 |
| `ewf-diff-check` | `['git','diff','--check']` | 30000 |

PR, exact order:

| ID | argv | timeoutMs |
|---|---|---:|
| `repository-tests` | `['npm','test']` | 600000 |
| `repository-check` | `['npm','run','check']` | 120000 |
| `roadmap-audit` | `['npm','run','audit:roadmap']` | 120000 |
| `repository-build` | `['npm','run','build']` | 300000 |

No command may be added or substituted without replacement authorization.

## Trace, handoff, and required negative evidence

Trace is exactly `requirement → test → command declaration → result/evidence`. Validate duplicate requirement/test/command/evidence IDs; broken references; missing required command/evidence; non-PASS required result; manifest/declaration/argv/cwd/environment/timeout/tool mismatch; evidence bound to another subject/command/environment; trace/evidence/content digest mismatch; and `SHARED` without explicit rationale.

`validateFrozenHandoff()` first calls accepted `validateFrozenBrief()`, then binds exact plan path/commit/blob/parent, package/spec, subject/parent/spec revision, trace/evidence/brief digests, four-file allowlist, exclusions, actual changed files, verification manifest digest, declarations, and required results. It returns invalid/blocked, never ACCEPT.

Disposable fixtures must cover all EWF00-PVT-01 through EWF00-PVT-12 cases, including wrong repository/HEAD/parent/ref/worktree, Stage 0/1 and exact metadata argv, URL normalization cases, remote collision/error, dirty tree, missing/overlapping writer/registry, broken canonical gates, allowlist/exclusion mismatch, duplicate/broken trace, exact declaration mismatches, optional/required tool unavailable, timeout, crash, infrastructure error, Spec Kit absent, deterministic output, secret/private-path redaction, safe relative paths, rollback to manual commands, and proof that user worktree/content/index are untouched.

## TDD tasks

### Task 1: Freeze templates and projections

**Files:** create the two authorized templates; test only in the authorized test file.

- [ ] Write failing tests for subordinate template shapes, plan/remote/ref fields, declaration/manifest digest bindings, and redacted content digest.
- [ ] Run focused test and confirm RED.
- [ ] Create minimum templates; rerun and confirm GREEN.
- [ ] Verify no existing template changed.

### Task 2: Implement read-only preflight

**Files:** authorized script and test only.

- [ ] Write failing disposable-repository tests for Stage 0/1, exact URL forms/rejections/case, plan commit/blob/parent, branch/ref/worktree, remote collision, clean state, writer/registry/overlap, canonical gates, deterministic diagnostics, zero-write, and forbidden Git commands.
- [ ] Confirm RED; implement collection/evaluation/run/CLI with only frozen observations; confirm GREEN.
- [ ] Prove no direct `node:crypto`, fetch, mutation, inference, or duplicate digest path.
- [ ] Begin adapter self-hosting only for later change sets.

### Task 3: Implement exact verification execution

- [ ] Write failing tests for argv authority, exact cwd/environment/timeout/tool requirement, per-command/manifest digests, ordered one-attempt execution, five-state classification, timeout/crash/infrastructure error.
- [ ] Confirm RED; implement executor/CLI; confirm GREEN.
- [ ] Prove no shell, retry, discovery, expansion, installation, or remediation.

### Task 4: Implement trace and frozen-handoff validation

- [ ] Write failing tests for duplicate/broken/missing trace, exact plan/declaration/manifest/content digest mismatch, shared rationale, allowlist/exclusions, required results, and forbidden verdict fields.
- [ ] Confirm RED; implement validators/CLI; confirm GREEN.

### Task 5: Complete evidence matrix and verification

- [ ] Complete all mandatory negative fixtures and remove disposable repositories.
- [ ] Prove Spec Kit absence and manual-command rollback.
- [ ] Run focused profile then PR profile in exact order.
- [ ] Review diff against exact plan commit from the brief; stop on any path outside allowlist.
- [ ] Commit an implementation subject containing only the four authorized paths and no acceptance/status claim.

## Evidence and acceptance topology

After the implementation subject and CI are green, obtain separate evidence-only revision authorization. Evidence binds implementation subject/parent, frozen spec, exact plan commit/blob, trace/evidence/brief digests, verification manifest digest, and command declaration digests. Implementer evidence remains `NOT_ACCEPTANCE`; the implementer cannot write ACCEPT. A fresh independent exact-head read-only audit must return ACCEPT before merge.

Passing `EWF00-PREFLIGHT-001` does not accept EWF-00, authorize `EWF00-PILOTS-001`, change canonical status, or authorize product work.

## Stop conditions

Stop before or during implementation if any exact plan/path/blob/parent, main, branch/ref/worktree, repository/remote normalization, remote collision, clean-state, writer/registry/overlap, canonical gate, allowlist/exclusion, declaration/digest, required command, or evidence binding fails; if a fetch or unauthorized Git mutation is needed; if accepted artifact code/templates/tests must change; if source/product/canonical/CI/package/dependency changes are needed; if retry/discovery/remediation/orchestration is needed; or if pilots, P3-02, package status, or acceptance enter scope.
