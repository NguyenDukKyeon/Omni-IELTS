# VocabMaster Bounded Specification Pack — Final Authorization Handoff

Handoff status: `DOCS_REVIEW_COMPLETE / EWF_PREFLIGHT_IMPLEMENTATION_AUTHORIZED / NOT_ACCEPTANCE`

This handoff records the replacement docs-only authorization for `EWF00-PREFLIGHT-001`. It does not implement source code, create the implementation branch, accept `EWF-00`, authorize pilots, change canonical status, merge an implementation, or issue an acceptance verdict.

## Frozen specification and predecessor identity

| Field | Exact value |
|---|---|
| Frozen bounded-spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Frozen subject parent | `31c3c8a73363d3c88cb0719d799f597b3d381467` |
| Independent documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Exact main baseline | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Accepted artifact implementation subject | `dc3aa8aa8084abee6819ffcbc238bd7e6f483b6c` |
| Accepted artifact evidence HEAD | `826dbe9027325c350b0b734a3861e0dfa038e0cd` |
| Artifact merge commit | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |

Canonical authority remains solely `AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`, and `docs/DECISIONS.md` including ADR-044.

## Final EWF00-PREFLIGHT-001 authorization identity

| Field | Exact value |
|---|---|
| Package / spec | `EWF-00` / `EWF00-PREFLIGHT-001` |
| Final plan path | `docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md` |
| Final plan commit / approved implementation predecessor | `97cee2619c51e9dbee9191c191cdb5543aa6eaa1` |
| Final plan blob | `b224bfb9f2ebae949e1bac43015210b43e007dad` |
| Final plan parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Frozen authorization brief path | `docs/superpowers/briefs/2026-08-04-ewf00-preflight-verification-trace-mvp-authorization.md` |
| Frozen authorization commit | `2881dbdfe9990b60ffefd22e7c12fe363e53e33b` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Required local ref | `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Exact worktree | `../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree` |
| Target remote/ref | `origin` / `refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Collision contract | `REQUIRE_ABSENT / ABSENT / null` |
| Writer | `chatgpt-ewf00-preflight-primary-writer / exclusive` |

The implementation branch must start from exact `97cee2619c51e9dbee9191c191cdb5543aa6eaa1`. The plan at that commit must be exact blob `b224bfb9f2ebae949e1bac43015210b43e007dad` at the exact plan path. No older plan commit, path-only retrieval, abbreviated SHA, or another blob is authorized.

## Exact implementation allowlist and exclusions

Only:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Everything else is excluded, including canonical docs, `.github/**`, `src/**`, `server/**`, `public/**`, package files/lockfiles, dependencies, existing EWF artifact implementation/templates/tests, evidence files, product behavior, pilots, P3-02 work, package/status mutation, acceptance generation, automatic discovery, retry, remediation, installation, Spec Kit initialization, fast-check, mutation tooling, DAGs, schedulers, queues, daemons, dashboards, and workflow servers.

`scripts/ewf-artifacts.mjs` is excluded and must be reused through accepted exports. Direct `node:crypto` import and a second digest, canonicalization, or redaction implementation are forbidden.

## Reachable bootstrap handoff

### Stage 0 — clean main checkout

Start from clean `refs/heads/main` at exact `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`. Stage 0 does not require HEAD to equal the implementation predecessor. It observes repository, main HEAD/ref, clean state, normalized `origin`, exact plan object/parent/one-file diff/blob/path, absence of implementation local ref/worktree/remote ref, and explicit writer/active-registry non-overlap.

Literal immutable-plan observations are:

```text
git cat-file -e 97cee2619c51e9dbee9191c191cdb5543aa6eaa1^{commit}
git rev-list --parents -n 1 97cee2619c51e9dbee9191c191cdb5543aa6eaa1
git diff-tree --no-commit-id --name-only -r 97cee2619c51e9dbee9191c191cdb5543aa6eaa1
git ls-tree 97cee2619c51e9dbee9191c191cdb5543aa6eaa1 -- docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md
```

Expected plan tree row:

```text
100644 blob b224bfb9f2ebae949e1bac43015210b43e007dad docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md
```

Only after Stage 0 passes is this one Git metadata mutation authorized:

```text
git worktree add -b chatgpt/ewf-00-preflight-verification-trace-mvp \
  ../VocabMaster-ewf00-preflight-verification-trace-mvp-worktree \
  97cee2619c51e9dbee9191c191cdb5543aa6eaa1
```

No checkout, switch, reset, rebase, force, detached worktree, alternate branch/path, second setup command, or fetch is authorized.

### Stage 1 — implementation worktree

Inside the implementation worktree, exact expectations are:

```text
HEAD = 97cee2619c51e9dbee9191c191cdb5543aa6eaa1
HEAD^ = 474bde8e3c7b09f757e7df4a1587f8a71b2e7865
symbolic ref = refs/heads/chatgpt/ewf-00-preflight-verification-trace-mvp
local ref SHA = 97cee2619c51e9dbee9191c191cdb5543aa6eaa1
clean tracked/untracked state = empty bytes
worktree = exact declared realpath
origin = NguyenDukKyeon/VocabMaster after frozen normalization
remote implementation ref = ABSENT / null
writer/registry = exact Stage 0 evidence with no overlap
```

Only after Stage 1 passes and an external valid bootstrap record exists may the first source write occur. The record is:

```text
ewf00-preflight-bootstrap-97cee2619c51e9dbee9191c191cdb5543aa6eaa1.json
MANUAL_BOOTSTRAP_PREFLIGHT / NOT_AUTHORIZATION
zeroRepositoryWrites: true
```

After Task 2 the adapter self-hosts later preflights; it does not replace first-write bootstrap evidence.

## Exact remote URL normalization handoff

Accepted forms are exactly HTTPS, `ssh://git@github.com/...`, and `git@github.com:...`, each with either no suffix or one lowercase `.git`. Host must normalize to `github.com`. Explicit ports, HTTPS credentials, non-`git` SSH users, passwords, query, fragment, percent-encoding, backslash, trailing/doubled/extra/malformed paths, dot segments, and doubled `.git.git` are rejected.

Owner/repository comparisons are ASCII case-insensitive against `NguyenDukKyeon/VocabMaster`; canonical output is exactly `NguyenDukKyeon/VocabMaster`. Required fixtures cover accepted HTTPS/SSH/SCP-like forms, case handling, credential-bearing URL, wrong host/repository, malformed URL, query, fragment, port, percent encoding, and path/suffix rejection.

## Parent/ref, collision, and zero-write contract

The adapter observes exact HEAD, parent, full symbolic ref, local branch ref, worktree, clean tracked/untracked state, origin URL, and remote target using read-only Git commands. Collision policy is declared, never inferred. `REQUIRE_ABSENT` requires `ls-remote` exit `0` and empty stdout. No fetch or remote-tracking inference is permitted.

A blocked or errored preflight produces zero repository content writes, zero index writes, zero Git metadata mutations, zero installation, zero retry, and zero remediation. Semantic overlap is mechanical intersection over declared keys and active registrations; the adapter cannot infer package ownership or semantic independence.

## Verification, trace, and digest handoff

`argv` is execution authority; display `command` is not execution authority. Each declaration and every result/evidence binding includes exact argv, cwd, inherited/explicit environment, timeout, tool requirement, and `declarationDigest`. The manifest includes `extensions.verificationManifestDigest`. ID-only matching is invalid.

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

No profile command may be discovered, substituted, reordered, retried, or expanded.

Portable result projection is exactly:

```text
normalize → portable redaction → omit contentDigest → digest → attach → serialize
```

Trace remains exactly `requirement → test → command declaration → command result/evidence`. Frozen-handoff validation binds package/spec, exact plan path/commit/blob/parent, implementation subject/parent/spec revision, trace/evidence/brief digests, verification manifest/declaration digests, allowlist/exclusions/actual changed files, and required PASS results.

## Effective package and successor status

- `EWF00-ARTIFACTS-001`: independently accepted and merged.
- `EWF00-PREFLIGHT-001`: implementation-authorized only by the final plan and frozen brief; not implemented, not audited, and not accepted.
- `EWF00-PILOTS-001`: not authorized.
- `EWF-00`: remains `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.
- LI-00, SRC-00, ERR-00, and QAR-00 remain unchanged.
- Passing the preflight slice will not accept EWF-00 or authorize pilots.

## Evidence and acceptance boundary

After a four-file implementation subject and green focused/PR/CI evidence, a separate evidence-only revision authorization is required. Implementer evidence must remain `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`, bind exact plan path/commit/blob and all trace/verification digests, and contain no implementer `ACCEPT`. A fresh independent exact-head read-only audit must return `ACCEPT` before merge.

## Stop conditions

Do not create or write the implementation branch if any Stage 0 identity, plan commit/blob/parent/path, remote normalization/collision, writer/registry, overlap, main, or clean-state gate fails. Stop during implementation on any branch/ref/worktree, allowlist/exclusion, canonical gate, command declaration, digest, required result, or evidence mismatch, or if fetch, another Git mutation, source/product/canonical/CI/package/dependency changes, pilots, P3-02, package status, acceptance, retry, discovery, remediation, or orchestration is required.

This handoff is subordinate implementation authorization only and remains `NOT_ACCEPTANCE`.