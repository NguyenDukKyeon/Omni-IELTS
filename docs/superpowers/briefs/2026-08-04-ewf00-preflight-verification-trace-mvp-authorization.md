# EWF00-PREFLIGHT-001 — Frozen Implementation Authorization Brief

Brief status: `FROZEN / IMPLEMENTATION_AUTHORIZED / DOCS_REMEDIATED`

This brief authorizes one bounded source implementation slice. It does not implement source code, accept EWF-00, authorize pilots, change product behavior, mutate canonical status, edit CI, install dependencies, or issue an acceptance verdict.

## 1. Exact authorization identity

| Field | Frozen value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Spec | `EWF00-PREFLIGHT-001` |
| Requirement namespace | `EWF00-PVT-*` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Accepted predecessor slice | `EWF00-ARTIFACTS-001` |
| Accepted artifact implementation subject | `dc3aa8aa8084abee6819ffcbc238bd7e6f483b6c` |
| Accepted artifact evidence HEAD | `826dbe9027325c350b0b734a3861e0dfa038e0cd` |
| Artifact merge/main baseline | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Approved implementation predecessor | `8828715ae1f636aa07d6a740724b9706d23923c1` |
| Expected predecessor parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Required local ref | `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Target remote | `origin` |
| Target remote ref | `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Collision policy | `REQUIRE_ABSENT` |
| Expected remote-ref state/SHA | `ABSENT / null` |
| Designated writer | `chatgpt-ewf00-preflight-primary-writer` |
| Worktree path | `../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree` |
| Package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

The approved implementation predecessor remains exactly `8828715ae1f636aa07d6a740724b9706d23923c1`. This remediation does not rebase, replace, or advance it.

## 2. Canonical authority boundary

Canonical authority remains solely:

- `AGENTS.md`;
- `docs/ROADMAP.md`;
- `docs/IMPLEMENTATION_PLAN.md`;
- `docs/IMPLEMENTATION_STATUS.md`;
- `docs/DECISIONS.md`, including ADR-044.

The adapter may validate declared exact literals and identities. It must not infer owner/status/dependency/acceptance, reconcile canonical conflicts, or edit canonical documents.

## 3. Authorized implementation allowlist

Only:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Every other path is unauthorized. `scripts/ewf-artifacts.mjs` is explicitly excluded and must be reused through imports.

## 4. Explicit exclusions

No changes to:

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

No product behavior, status mutation, acceptance generation, CI change, dependency installation, Spec Kit initializer, fast-check, mutation tooling, test discovery, retry, remediation, DAG, scheduler, queue, daemon, dashboard, workflow server, pilot, package-level acceptance, or P3-02 work is authorized.

## 5. Reuse and no duplicate digest implementation

The new script must import:

```text
COMMAND_RESULTS
canonicalizeArtifact
digestArtifact
validateArtifact
validateFrozenBrief
redactPortableValue
```

from `scripts/ewf-artifacts.mjs`. It must not import `node:crypto` or implement a second digest/canonicalization/redaction path.

## 6. Frozen parent/ref/remote-target contract

The implementation declaration must bind:

```json
{
  "expectedHead": "8828715ae1f636aa07d6a740724b9706d23923c1",
  "expectedPredecessorParent": "474bde8e3c7b09f757e7df4a1587f8a71b2e7865",
  "expectedBranch": "chatgpt/ewf-00-preflight-verification-trace-mvp",
  "expectedLocalHeadRef": "refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp",
  "targetRemote": "origin",
  "targetRemoteRef": "refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp",
  "remoteTargetCollisionPolicy": "REQUIRE_ABSENT",
  "expectedRemoteRefState": "ABSENT",
  "expectedRemoteRefSha": null
}
```

Read-only observations:

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

`REQUIRE_ABSENT` means `ls-remote` exit `0`, empty stdout, state `ABSENT`, SHA `null`. A present row is `REMOTE_TARGET_COLLISION`. No fetch or remote-tracking inference is permitted.

The adapter must also define `REQUIRE_EXACT_SHA` for later declared use: exactly one matching row at the declared lowercase SHA. Policy, state, and SHA must be internally consistent; otherwise `INVALID_REMOTE_COLLISION_POLICY`.

Required diagnostics include:

```text
PREDECESSOR_PARENT_MISMATCH
HEAD_REF_MISMATCH
LOCAL_TARGET_REF_MISMATCH
REMOTE_TARGET_OBSERVATION_ERROR
REMOTE_TARGET_COLLISION
REMOTE_TARGET_STATE_MISMATCH
REMOTE_TARGET_SHA_MISMATCH
INVALID_REMOTE_COLLISION_POLICY
```

Mandatory fixtures cover wrong parent/ref, occupied target, unexpected target SHA, `ls-remote` failure, and proof that `fetch` is never called.

## 7. One-time manual bootstrap preflight

Because the adapter is absent at predecessor `8828715...`, the first repository content write requires a manual bootstrap.

### Stage A — before branch/worktree creation

Run:

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
repository: NguyenDukKyeon/VocabMaster
HEAD: 8828715ae1f636aa07d6a740724b9706d23923c1
HEAD^: 474bde8e3c7b09f757e7df4a1587f8a71b2e7865
status: empty bytes
remote: origin normalized to NguyenDukKyeon/VocabMaster
target ref: ABSENT
target SHA: null
```

Supply exact external evidence:

```text
writerIdentity = chatgpt-ewf00-preflight-primary-writer
writerMode = exclusive
active registry = one active EWF00-PREFLIGHT-001 row with the exact branch,
worktree, four-file allowlist, and four semantic conflict keys
```

Any active file/semantic overlap blocks branch creation. Only after Stage A passes may Git metadata create the local branch/worktree from exact predecessor.

### Stage B — after branch/worktree creation, before Task 1

Run all nine frozen observations. Expected:

```text
HEAD = 8828715ae1f636aa07d6a740724b9706d23923c1
HEAD^ = 474bde8e3c7b09f757e7df4a1587f8a71b2e7865
HEAD ref = refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
local target ref SHA = 8828715ae1f636aa07d6a740724b9706d23923c1
worktree = declared exact real path
status = empty bytes
remote identity = NguyenDukKyeon/VocabMaster
remote target = ABSENT / null
writer/registry = exact Stage A evidence
```

No source/template/test write may occur before Stage B passes and its result is recorded.

### Bootstrap record

Record outside the repository in the OS temp directory as:

```text
ewf00-preflight-bootstrap-8828715ae1f636aa07d6a740724b9706d23923c1.json
```

It uses authority label `MANUAL_BOOTSTRAP_PREFLIGHT / NOT_AUTHORIZATION` and binds exact argv/cwd/exit/output digests/observations, writer, registry digest, predecessor/parent, branch/ref, remote target policy/state/SHA, result, and `zeroRepositoryWrites: true`.

Projection:

```text
normalize
→ redactPortableValue
→ omit contentDigest
→ digestArtifact
→ attach contentDigest
→ serialize
```

The temp record is referenced later by implementation/evidence reports and is never part of the implementation subject. After Task 2, the adapter self-hosts preflight for subsequent change sets; it does not retroactively replace the manual first-write record.

## 8. Preflight content digest

Adapter output uses exactly:

```text
normalize complete result
→ portable redaction
→ omit top-level contentDigest
→ digestArtifact(redacted projection)
→ attach contentDigest
→ serialize
```

A digest over the unredacted object is invalid.

## 9. Exact verification declaration binding

`argv` is the sole execution authority. `command` is display-only and ignored by execution.

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

`declarationDigest` is `digestArtifact()` over the normalized declaration with that field omitted.

The manifest binds `extensions.verificationManifestDigest`, computed over the normalized manifest with that field omitted.

Every trace command node, command result, evidence node, implementation report, and frozen handoff must bind:

```text
verificationManifestDigest
command id
command declarationDigest
exact argv
exact cwd
exact inherited environment keys
exact explicit environment values
exact timeout
exact tool requirement
```

A correct ID with altered execution fields is invalid.

All commands use cwd `.`, explicit environment `{}`, and inherited keys:

```text
PATH
HOME
USERPROFILE
SYSTEMROOT
COMSPEC
PATHEXT
TEMP
TMP
APPDATA
LOCALAPPDATA
CI
```

Focused profile:

| ID | argv | timeoutMs |
|---|---|---:|
| `ewf-preflight-focused` | `["node","--test","tests/ewf-preflight-verification-trace.test.mjs"]` | 120000 |
| `ewf-artifact-check` | `["node","scripts/ewf-artifacts.mjs","--check"]` | 30000 |
| `ewf-script-syntax` | `["node","--check","scripts/ewf-preflight-trace.mjs"]` | 30000 |
| `ewf-test-syntax` | `["node","--check","tests/ewf-preflight-verification-trace.test.mjs"]` | 30000 |
| `ewf-diff-check` | `["git","diff","--check"]` | 30000 |

PR profile:

| ID | argv | timeoutMs |
|---|---|---:|
| `repository-tests` | `["npm","test"]` | 600000 |
| `repository-check` | `["npm","run","check"]` | 120000 |
| `roadmap-audit` | `["npm","run","audit:roadmap"]` | 120000 |
| `repository-build` | `["npm","run","build"]` | 300000 |

All tools are `REQUIRED`. No substitution or extra command is authorized.

## 10. Result classification

Exactly:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

- exit 0 → PASS;
- normal non-zero → FAIL;
- executable absent → NOT_AVAILABLE;
- timeout → ERROR / COMMAND_TIMEOUT;
- signal/crash → ERROR / COMMAND_CRASH;
- invalid cwd/environment or spawn infrastructure → ERROR / COMMAND_INFRASTRUCTURE_ERROR;
- declared but unexecuted → NOT_RUN.

No retry. Required results must be PASS.

## 11. Trace and frozen-handoff validation

Minimum trace:

```text
requirement → test → exact command declaration → exact result/evidence
```

Trace errors include duplicate IDs, broken references, missing required result/evidence, non-PASS required result, declaration/manifest digest mismatch, argv/cwd/environment/timeout/tool mismatch, subject/environment/content digest mismatch, and `SHARED` without rationale.

`validateFrozenHandoff()` must use accepted `validateFrozenBrief()` and additionally bind:

- package/spec;
- subject/parent/spec revision;
- trace/evidence/brief digests;
- exact allowlist/exclusions/changed files;
- verification manifest digest;
- each required command ID and declaration digest;
- each exact result declaration binding.

Mismatch yields invalid/`BLOCKED_BY_INVALID_BRIEF`, never `ACCEPT`.

## 12. Mandatory negative fixtures

At minimum:

```text
wrong repository/root/worktree
wrong HEAD
wrong predecessor parent
wrong/detached HEAD ref
wrong local target-ref SHA
wrong remote identity
remote collision
remote exact-SHA mismatch
invalid collision policy/state/SHA
ls-remote error
fetch invocation attempted
dirty tracked/untracked tree
writer missing/mismatch
registry missing
file overlap
semantic overlap with different files
broken canonical gate
allowlist/exclusion mismatch
duplicate requirement/test/command/evidence ID
broken references
missing required result/evidence
correct ID with different argv/cwd/environment/timeout/tool
command declaration digest mismatch
verification manifest digest mismatch
optional tool unavailable
required tool unavailable
timeout
crash
infrastructure error
Spec Kit absent
deterministic output/diagnostics
secret/private-path redaction
safe relative path preservation
rollback to manual canonical commands
bootstrap Stage A/Stage B mismatch
```

All repositories/directories are disposable; no user worktree mutation.

## 13. Acceptance criteria

The implementation must cover `EWF00-PVT-01` through `EWF00-PVT-12` exactly as frozen in the plan. It must prove fail-before-write identity/scope, five-state exact declaration evidence, trace/brief mismatch handling, Spec Kit absence, deterministic redacted output, and absence of orchestration/install/CI/status authority.

Passing this spec does not accept EWF-00 or authorize pilots.

## 14. Verification profiles

Focused, exact order:

```text
node --test tests/ewf-preflight-verification-trace.test.mjs
node scripts/ewf-artifacts.mjs --check
node --check scripts/ewf-preflight-trace.mjs
node --check tests/ewf-preflight-verification-trace.test.mjs
git diff --check
```

PR, exact order:

```text
npm test
npm run check
npm run audit:roadmap
npm run build
```

No CI change and no dependency installation.

## 15. Evidence and audit topology

The implementation subject contains only four authorized files. A later evidence-only revision requires separate authorization and binds:

```text
implementation subject
parent
spec revision
trace digest
evidence digest
brief digest
verification manifest digest
per-command declaration digests
actual exact command results
```

Implementer evidence remains `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` and contains no verdict. A fresh read-only auditor owns exact-head acceptance. Merge requires `ACCEPT`.

## 16. Stop conditions

Stop if any frozen identity, parent/ref, remote policy/state, writer/registry, clean-tree, canonical gate, allowlist, exact command declaration, digest, required result, or evidence binding fails.

Also stop if implementation needs:

```text
canonical docs
product source
package/lock files
CI changes
dependencies/installers
accepted artifact-code changes
retry/discovery/remediation
workflow runtime/scheduler/queue
pilot work
P3-02 Shadowing work
package status or acceptance mutation
```
