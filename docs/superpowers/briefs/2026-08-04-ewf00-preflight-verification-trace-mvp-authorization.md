# EWF00-PREFLIGHT-001 — Final Frozen Implementation Authorization

Authorization status: `FROZEN / IMPLEMENTATION_AUTHORIZED / NOT_ACCEPTANCE`

This document authorizes one bounded implementation slice only. It does not implement source code, create the implementation branch, accept `EWF-00`, authorize pilots, change canonical package status, edit CI, install dependencies, or issue an acceptance verdict.

## 1. Immutable authority identity

| Field | Frozen value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Authorized spec | `EWF00-PREFLIGHT-001` |
| Requirement namespace | `EWF00-PVT-01` through `EWF00-PVT-12` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Exact main / predecessor parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Approved implementation predecessor | `97cee2619c51e9dbee9191c191cdb5543aa6eaa1` |
| Final plan path | `docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md` |
| Final plan commit | `97cee2619c51e9dbee9191c191cdb5543aa6eaa1` |
| Final plan blob | `b224bfb9f2ebae949e1bac43015210b43e007dad` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Required local branch ref | `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Target remote/ref | `origin` / `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Collision contract | `REQUIRE_ABSENT / ABSENT / null` |
| Writer | `chatgpt-ewf00-preflight-primary-writer / exclusive` |
| Exact worktree | `../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree` |
| Package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

The implementation branch must be created from exact commit `97cee2619c51e9dbee9191c191cdb5543aa6eaa1`. At that commit, the final plan path must be mode `100644`, type `blob`, and exact blob `b224bfb9f2ebae949e1bac43015210b43e007dad`. A path-only binding, abbreviated SHA, different blob, different parent, or another plan version invalidates this authorization.

Canonical authority remains solely `AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`, and `docs/DECISIONS.md` including ADR-044. This brief, the plan, HANDOFF, templates, traces, reports, and bootstrap records remain subordinate evidence and cannot determine package ownership, dependency truth, status, release safety, or acceptance.

## 2. Exact implementation boundary

Only these four paths may be created or modified by the implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Every other path is unauthorized. Explicit exclusions include canonical governance documents, `.github/**`, `src/**`, `server/**`, `public/**`, `package.json`, `package-lock.json`, dependencies, existing EWF templates/tests, `scripts/ewf-artifacts.mjs`, evidence files, product behavior, pilots, P3-02 work, package/status mutation, acceptance generation, automatic discovery, retry, remediation, installers, Spec Kit initialization, fast-check, mutation tooling, DAGs, schedulers, queues, daemons, dashboards, and workflow servers.

The implementation must import and reuse `COMMAND_RESULTS`, `canonicalizeArtifact`, `digestArtifact`, `validateArtifact`, `validateFrozenBrief`, and `redactPortableValue` from `scripts/ewf-artifacts.mjs`. Direct `node:crypto` import and a second digest, canonicalization, or redaction implementation are forbidden.

## 3. Frozen declaration, gates, and overlap evidence

The implementation declaration must bind the exact repository, plan path/commit/blob/parent, implementation branch/ref, target remote/ref, `REQUIRE_ABSENT` collision tuple, writer, worktree, four-file allowlist, exclusions, canonical files, and stop conditions.

Declared semantic conflict keys are exactly:

```text
ewf:preflight-observation
ewf:verification-execution
ewf:trace-validation
ewf:frozen-handoff-validation
```

Entry gates are exact-literal observations only:

| Gate | Source | Required literal |
|---|---|---|
| `EWF-00-status` | `docs/IMPLEMENTATION_STATUS.md` | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| `EWF-artifact-predecessor` | `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/HANDOFF.md` | `EWF00-ARTIFACTS-001` |

The adapter may compare declared evidence mechanically. It must not infer package ownership, semantic independence, status, dependency, or acceptance. Missing writer, registry, overlap declarations, canonical literals, or plan identity fails closed.

## 4. Parent/ref and remote-target collision contract

Read-only adapter observations use exact argv with `shell: false` and the declared implementation worktree as cwd:

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

`REQUIRE_ABSENT` means `git ls-remote` exits `0` with empty stdout, observed state `ABSENT`, and SHA `null`. Any returned row is `REMOTE_TARGET_COLLISION`. `REQUIRE_EXACT_SHA` is defined only for later separately declared use: exactly one `<lowercase-sha><TAB><exact-ref>` row must match the declared SHA. Policy, state, and SHA inconsistency is `INVALID_REMOTE_COLLISION_POLICY`.

No fetch, remote-tracking inference, policy inference, retry, or mutation is permitted. Required diagnostics and fixtures cover repository, HEAD, parent, symbolic/local ref, worktree, remote identity/observation/collision/state/SHA, clean state, writer/registry, file/semantic overlap, canonical gates, allowlist/exclusions, plan path/commit/blob, occupied targets, unexpected SHA, `ls-remote` failure, and proof that fetch is never called.

## 5. Exact remote URL normalization

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

1. Reject leading or trailing whitespace; never trim.
2. Accept only the three syntaxes above.
3. Scheme and host compare ASCII case-insensitively; normalized host must be `github.com`.
4. Reject every explicit port.
5. HTTPS permits no username or password.
6. SSH and SCP-like syntax require username exactly `git` and permit no password.
7. Reject query, fragment, percent-encoding, backslash, doubled slash, trailing slash, empty/dot segment, or any path other than exactly `OWNER/REPOSITORY`.
8. Owner and repository segments match `[A-Za-z0-9_.-]+` and are neither `.` nor `..`.
9. Strip at most one exact lowercase `.git` suffix; reject `.git.git` after that strip.
10. Compare owner/repository with `NguyenDukKyeon/VocabMaster` ASCII case-insensitively.
11. Canonical output is exactly `NguyenDukKyeon/VocabMaster`, preserving declared authority casing rather than input casing.

Mandatory fixtures include accepted HTTPS, SSH, and SCP-like forms with and without `.git`; mixed-case scheme/host/owner/repository; HTTPS credentials; non-`git` SSH user; wrong host; wrong repository; query; fragment; port; percent-encoding; malformed/extra/doubled/trailing path; `.git.git`; and canonical output casing.

## 6. Reachable one-time bootstrap

The adapter is absent at the approved plan commit. Before the first repository content write, the operator performs this manual bootstrap. No fetch is authorized. If the exact plan object is not already available locally, stop for replacement authorization.

### Stage 0 — clean main checkout

Run from a clean checkout whose symbolic ref is exactly `refs/heads/main`. Stage 0 does not require HEAD to equal the implementation predecessor.

```text
git rev-parse --show-toplevel
git rev-parse HEAD
git symbolic-ref --quiet HEAD
git show-ref --verify refs/heads/main
git status --porcelain=v1 -z --untracked-files=all
git remote get-url origin
git cat-file -e 97cee2619c51e9dbee9191c191cdb5543aa6eaa1^{commit}
git rev-list --parents -n 1 97cee2619c51e9dbee9191c191cdb5543aa6eaa1
git diff-tree --no-commit-id --name-only -r 97cee2619c51e9dbee9191c191cdb5543aa6eaa1
git ls-tree 97cee2619c51e9dbee9191c191cdb5543aa6eaa1 -- docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md
git show-ref --verify refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
git worktree list --porcelain
git ls-remote --refs origin refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
```

Expected observations:

```text
repository = NguyenDukKyeon/VocabMaster
HEAD = 474bde8e3c7b09f757e7df4a1587f8a71b2e7865
symbolic ref = refs/heads/main
refs/heads/main = 474bde8e3c7b09f757e7df4a1587f8a71b2e7865
worktree status = empty bytes
origin canonical identity = NguyenDukKyeon/VocabMaster
plan commit exists = true
plan lineage = 97cee2619c51e9dbee9191c191cdb5543aa6eaa1 474bde8e3c7b09f757e7df4a1587f8a71b2e7865
plan diff = only docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md
plan tree row = 100644 blob b224bfb9f2ebae949e1bac43015210b43e007dad docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md
local implementation ref/worktree = ABSENT
remote implementation ref = ABSENT / null
writer = chatgpt-ewf00-preflight-primary-writer / exclusive
active registry = exactly one current non-overlapping declaration
```

The active registry row binds the exact implementation branch, worktree, four allowlist paths, and four semantic keys. Any additional active row intersecting a path or key blocks Stage 0.

Only after Stage 0 passes is this one Git metadata mutation authorized:

```text
git worktree add -b chatgpt/ewf-00-preflight-verification-trace-mvp \
  ../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree \
  97cee2619c51e9dbee9191c191cdb5543aa6eaa1
```

No checkout, switch, reset, rebase, force, detached worktree, alternate branch/path, second setup command, or branch overwrite is authorized.

### Stage 1 — implementation worktree

Before Task 1 and before any repository content write, run the nine read-only adapter observations from Section 4. Expected values are HEAD `97cee2619c51e9dbee9191c191cdb5543aa6eaa1`, HEAD^ `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`, full symbolic/local ref `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` at the plan commit, clean tracked/untracked state, exact worktree realpath, canonical origin identity, remote implementation ref `ABSENT / null`, and identical non-overlapping writer/registry evidence.

After Stage 1 passes, create the external bootstrap record in the OS temp directory using exclusive creation:

```text
ewf00-preflight-bootstrap-97cee2619c51e9dbee9191c191cdb5543aa6eaa1.json
```

The record binds plan path/commit/blob/parent, Stage 0 and Stage 1 exact argv/cwd/exit codes/observation digests, the exact metadata command argv, remote normalization/collision observation, writer, registry digest, result `PASS`, `zeroRepositoryWrites: true`, and authority label `MANUAL_BOOTSTRAP_PREFLIGHT / NOT_AUTHORIZATION`.

Its digest projection is exactly:

```text
normalize complete result
→ portable redaction
→ omit top-level contentDigest
→ digest
→ attach contentDigest
→ serialize
```

The record is invalid if any plan binding or exact command differs. It must not be committed. Only after the valid record exists may Task 1 write repository content. After Task 2, the adapter self-hosts later preflights; it does not replace first-write bootstrap evidence.

## 7. Verification declarations and profiles

`argv` is execution authority; `command` is display-only. Every declaration binds exact ID, profile, command, argv, cwd, inherited/explicit environment, timeout, tool requirement, requirements, and `declarationDigest`.

Per-command projection:

```text
normalize declaration without declarationDigest
→ digestArtifact
→ declarationDigest
```

Manifest projection:

```text
normalize manifest
→ omit extensions.verificationManifestDigest
→ digestArtifact
→ extensions.verificationManifestDigest
```

Every result, trace node, implementation report, and frozen handoff binds the exact verification manifest digest, command ID, declaration digest, argv, cwd, inherited and explicit environment, timeout, and tool requirement. ID-only validation is invalid.

Execution is one attempt in array order with `shell: false`; no shell, retry, discovery, expansion, installation, or remediation. Result vocabulary is exactly `PASS`, `FAIL`, `ERROR`, `NOT_RUN`, `NOT_AVAILABLE`. Exit 0 is PASS; ordinary non-zero is FAIL; executable `ENOENT` is NOT_AVAILABLE; timeout, signal/crash, invalid cwd/environment, or infrastructure failure is ERROR. Required results must be PASS.

All declarations use cwd `.`, explicit environment `{}`, tool requirement `REQUIRED`, and inherited keys `PATH`, `HOME`, `USERPROFILE`, `SYSTEMROOT`, `COMSPEC`, `PATHEXT`, `TEMP`, `TMP`, `APPDATA`, `LOCALAPPDATA`, `CI`.

Focused profile, exact order:

```text
node --test tests/ewf-preflight-verification-trace.test.mjs
node scripts/ewf-artifacts.mjs --check
node --check scripts/ewf-preflight-trace.mjs
node --check tests/ewf-preflight-verification-trace.test.mjs
git diff --check
```

PR profile, exact order:

```text
npm test
npm run check
npm run audit:roadmap
npm run build
```

No command may be added, removed, reordered, or substituted without replacement authorization.

## 8. Trace, fixtures, and frozen handoff

Trace topology is exactly `requirement → test → command declaration → command result/evidence`. Validation covers duplicate IDs, broken references, missing required command/evidence, required non-PASS result, shared gates without rationale, subject/parent/spec/plan/trace/evidence/brief digest mismatch, verification-manifest/declaration mismatch, and any argv/cwd/environment/timeout/tool divergence.

`validateFrozenHandoff()` calls accepted `validateFrozenBrief()` first, then binds package/spec, exact plan path/commit/blob/parent, implementation subject/parent/spec revision, trace/evidence/brief digests, four-file allowlist, exclusions, actual changed files, verification manifest digest, exact declarations, and required results. It returns valid/invalid or pass/blocked evidence only; it never writes `ACCEPT` or `REJECT`.

Mandatory fixtures use temporary/disposable repositories and directories and cover all `EWF00-PVT-01` through `EWF00-PVT-12`: wrong repository, HEAD, parent, ref, worktree, clean state, writer/registry/overlap, canonical gate, allowlist/exclusion, URL normalization, remote collision/error, duplicate/broken trace, missing command/evidence, declaration/digest mismatch, optional and required tool unavailable, timeout, crash, infrastructure error, Spec Kit absent, deterministic diagnostics, secret/private-path redaction, safe repository-relative paths, rollback to manual commands, and proof that user worktree/index/content remain untouched.

## 9. Evidence and acceptance topology

The implementation subject is the last commit containing only the four authorized implementation paths. After focused and PR profiles and CI are green:

1. obtain separately authorized evidence-only revision;
2. bind implementation subject/parent, frozen spec, exact plan path/commit/blob, trace/evidence/brief digests, verification manifest digest, declaration digests, changed files, exclusions, and required results;
3. keep implementer evidence `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`;
4. prohibit implementer `ACCEPT`;
5. require an independent read-only exact-head audit;
6. merge only after independent verdict `ACCEPT`.

Passing this spec does not accept `EWF-00`, authorize `EWF00-PILOTS-001`, change canonical status, or authorize product work.

## 10. Stop conditions

Stop if exact main, plan path/commit/blob/parent, branch/ref/worktree, repository, remote normalization/collision, clean state, writer, registry, overlap, gate, allowlist, exclusion, declaration, manifest, command result, or evidence binding fails; if the plan object is unavailable locally and fetch would be needed; if any Git command beyond the frozen read-only observations and one exact `git worktree add` is needed; if any path outside the four-file allowlist is needed; or if accepted artifact code, product source, canonical docs, CI, package files, dependencies, package/status, acceptance, pilots, P3-02, retry, discovery, remediation, or orchestration enters scope.

This authorization remains subordinate and remains `NOT_ACCEPTANCE`.