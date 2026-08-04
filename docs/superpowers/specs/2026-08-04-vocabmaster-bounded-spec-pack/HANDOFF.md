# VocabMaster Bounded Specification Pack — Handoff

Handoff status:
`DOCS_REVIEW_COMPLETE / EWF_ARTIFACT_ACCEPTED_MERGED / EWF_PREFLIGHT_IMPLEMENTATION_AUTHORIZED / AUTHORIZATION_GAPS_REMEDIATED`

This handoff records bounded authorization metadata only. It does not implement source code, accept EWF-00, authorize pilots, change product behavior/status, or authorize merge without a fresh independent exact-head audit.

## 1. Frozen specification and canonical boundary

| Field | Value |
|---|---|
| Frozen spec-pack subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Architecture baseline | `adc3726620f4badddb16309e375f8f17b6af1404` |
| Canonical package | `EWF-00` |
| Canonical status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

Canonical authority remains `AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`, and `docs/DECISIONS.md`. This handoff is subordinate and cannot create package status or acceptance.

## 2. Accepted merged predecessor slice

`EWF00-ARTIFACTS-001`:

| Record | Exact identity |
|---|---|
| Accepted implementation subject | `dc3aa8aa8084abee6819ffcbc238bd7e6f483b6c` |
| Accepted evidence HEAD | `826dbe9027325c350b0b734a3861e0dfa038e0cd` |
| Merge commit | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Implementation CI | #275 PASS |
| Evidence CI | #276 PASS |
| Independent verdict | `ACCEPT` |

The accepted artifact slice supplies canonicalization, SHA-256 digest, base validation, frozen-brief validation, and portable redaction. The next slice must reuse those exports.

## 3. EWF00-PREFLIGHT-001 implementation authorization

| Field | Frozen value |
|---|---|
| Approved implementation predecessor | `8828715ae1f636aa07d6a740724b9706d23923c1` |
| Expected predecessor parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Required branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Required local ref | `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Target remote/ref | `origin` / `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Collision policy | `REQUIRE_ABSENT` |
| Expected remote-ref state field | `expectedRemoteRefState = ABSENT` |
| Expected remote-ref SHA field | `expectedRemoteRefSha = null` |
| Designated writer | `chatgpt-ewf00-preflight-primary-writer` |
| Worktree path | `../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree` |
| Plan path | `docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md` |
| Brief path | `docs/superpowers/briefs/2026-08-04-ewf00-preflight-verification-trace-mvp-authorization.md` |

The predecessor remains the plan-only commit `8828715...`. The remediation commit changes authorization docs only and does not become a new implementation predecessor.

No implementation branch has been created by this docs authorization.

## 4. Exact implementation allowlist

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Every other path is unauthorized. `scripts/ewf-artifacts.mjs`, existing templates/tests, product source, canonical docs, CI, package files, dependencies, and evidence files are excluded.

## 5. Parent/ref and remote-target gate

The change declaration binds exact HEAD, predecessor parent, branch, full local ref, target remote/ref, collision policy, expected remote-ref state, and expected SHA.

Read-only observation commands:

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

`REQUIRE_ABSENT` requires empty `ls-remote` stdout and SHA `null`. No fetch or policy inference is allowed. Wrong parent/ref, occupied remote target, remote observation failure, or policy/state/SHA mismatch blocks before write.

## 6. One-time bootstrap before first source write

Because the adapter is absent at `8828715...`, the first write uses a manual bootstrap:

1. Stage A, before local branch/worktree creation: verify repository, HEAD, parent, clean status, remote identity, absent target ref, designated writer, and explicit active registry.
2. Only after Stage A passes, create local branch/worktree metadata from exact predecessor.
3. Stage B, before Task 1: verify full branch/ref/worktree/remote/clean/writer/registry state with the nine frozen read-only commands.
4. Record the result outside the repository in OS temp as `ewf00-preflight-bootstrap-8828715ae1f636aa07d6a740724b9706d23923c1.json` with authority label `MANUAL_BOOTSTRAP_PREFLIGHT / NOT_AUTHORIZATION`.
5. Record projection is `normalize → redactPortableValue → omit contentDigest → digestArtifact → attach digest → serialize`.
6. No repository content write is permitted until the temp bootstrap result is valid and `zeroRepositoryWrites: true`.

After Task 2, the adapter self-hosts preflight for subsequent change sets. It does not replace the manual first-write evidence.

## 7. Exact verification declaration binding

`argv` is execution authority; `command` is display-only.

Each command and every result/evidence binding includes:

```text
verificationManifestDigest
command ID
declarationDigest
argv
cwd
inheritEnvironment
environment
timeoutMs
toolRequirement
```

A result with a correct ID but altered execution declaration is invalid.

Focused exact argv/order:

```text
["node","--test","tests/ewf-preflight-verification-trace.test.mjs"]
["node","scripts/ewf-artifacts.mjs","--check"]
["node","--check","scripts/ewf-preflight-trace.mjs"]
["node","--check","tests/ewf-preflight-verification-trace.test.mjs"]
["git","diff","--check"]
```

PR exact argv/order:

```text
["npm","test"]
["npm","run","check"]
["npm","run","audit:roadmap"]
["npm","run","build"]
```

All use cwd `.`, the frozen inherited-environment key list, explicit environment `{}`, frozen timeouts, and `REQUIRED` tool requirement. No substitution, retry, discovery, install, or CI change.

## 8. Preflight digest projection

Portable preflight `contentDigest` is computed only after normalization and portable redaction:

```text
normalize → redact → omit contentDigest → digestArtifact → attach → serialize
```

Digesting the unredacted object is invalid.

## 9. Required negative evidence

The focused suite must cover:

```text
wrong repository/HEAD/parent/branch/ref/worktree/remote
remote target collision and exact-SHA mismatch
invalid collision policy/state/SHA
ls-remote error and no-fetch proof
dirty tracked/untracked tree
writer/registry missing or mismatch
file and declared semantic overlap
broken canonical gate
allowlist/exclusion mismatch
duplicate IDs and broken references
missing required command/evidence
correct ID with altered argv/cwd/environment/timeout/tool
declaration/manifest/trace/evidence/content digest mismatch
optional and required tool unavailable
timeout, crash, infrastructure error
Spec Kit absent
deterministic diagnostics
secret/private-path redaction and safe relative paths
manual bootstrap mismatch
rollback to manual canonical commands
```

All fixtures use disposable repositories/directories and do not dirty the user worktree.

## 10. Verification and acceptance topology

Focused profile:

```text
node --test tests/ewf-preflight-verification-trace.test.mjs
node scripts/ewf-artifacts.mjs --check
node --check scripts/ewf-preflight-trace.mjs
node --check tests/ewf-preflight-verification-trace.test.mjs
git diff --check
```

PR profile:

```text
npm test
npm run check
npm run audit:roadmap
npm run build
```

After a code-only subject and green CI, evidence requires separate authorization and binds subject/parent/spec/trace/evidence/brief plus verification-manifest and per-command declaration digests. Implementer evidence is not acceptance. A fresh read-only auditor owns `ACCEPT`.

## 11. Unchanged status and exclusions

- `EWF00-PREFLIGHT-001`: implementation-authorized only.
- `EWF00-PILOTS-001`: not authorized.
- `EWF-00`: `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.
- no product/package status changes;
- no source implementation in this authorization PR;
- no implementation branch creation;
- no CI/dependency changes;
- no merge authorization.
