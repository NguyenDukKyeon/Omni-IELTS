# EWF00-PREFLIGHT-001 — Frozen Implementation Authorization Brief

Brief status: `FROZEN / IMPLEMENTATION_AUTHORIZED`

This brief authorizes one bounded implementation slice for the repository-local
Engineering Workflow Foundation. It does not implement source code, accept
EWF-00, authorize either pilot, change product behavior, mutate canonical
package status or issue an acceptance verdict.

## Exact identity

| Field | Frozen value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Authorized spec | `EWF00-PREFLIGHT-001` |
| Requirement namespace | `EWF00-PVT-*` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Independent documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Accepted predecessor slice | `EWF00-ARTIFACTS-001` |
| Accepted artifact implementation subject | `dc3aa8aa8084abee6819ffcbc238bd7e6f483b6c` |
| Accepted artifact evidence HEAD | `826dbe9027325c350b0b734a3861e0dfa038e0cd` |
| Artifact merge/main baseline | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Approved implementation predecessor | `8828715ae1f636aa07d6a740724b9706d23923c1` |
| Implementation plan | `docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md` at `8828715ae1f636aa07d6a740724b9706d23923c1` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Writer model | One declared writer; reviewers and subagents are read-only |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

The implementation branch must be created from exact predecessor
`8828715ae1f636aa07d6a740724b9706d23923c1`. The authorization brief itself is
consumed as read-only evidence from its own documentation commit and is not a
newer implementation predecessor. A different HEAD, rebased lineage, different
branch, dirty worktree, repository mismatch, writer mismatch or changed frozen
spec identity invalidates this brief.

## Canonical authority boundary

The implementation must treat these as the sole canonical authorities:

- `AGENTS.md` — agent conduct, Git safety and repository invariants;
- `docs/ROADMAP.md` — package identity, scope and dependency;
- `docs/IMPLEMENTATION_PLAN.md` — acceptance boundary and required gates;
- `docs/IMPLEMENTATION_STATUS.md` — package status and canonical evidence index;
- `docs/DECISIONS.md`, including ADR-044 — architectural rationale and EWF authority limits.

The adapter may check declared exact-literal entry gates against these files. It
must not edit them, infer status from ambiguous prose, choose among conflicting
canonical claims, create a second status ledger or turn local artifacts into
canonical authority.

## Authorized objective

Implement the Minimum Viable Preflight/Verification/Trace adapter described by
the frozen plan and bounded spec:

1. read-only, fail-before-write repository/worktree preflight;
2. exact declared-command focused/PR profile execution;
3. minimum `requirement → test → command → evidence` trace validation;
4. frozen-handoff identity and completeness validation;
5. deterministic typed output and portable redaction.

The implementation is a small project-owned adapter over the accepted artifact
contract primitives. It is not a workflow runtime, package manager, scheduler,
status authority or acceptance engine.

## Exact implementation allowlist

Only these four paths may be created or modified by the implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

No broad glob is authorized. A required write to any other path is a stop
condition and requires a replacement authorization.

### Reuse boundary

`scripts/ewf-preflight-trace.mjs` must import and reuse the accepted exports from
`scripts/ewf-artifacts.mjs`:

```text
COMMAND_RESULTS
canonicalizeArtifact
digestArtifact
validateArtifact
validateFrozenBrief
redactPortableValue
```

`scripts/ewf-artifacts.mjs` is deliberately not in the allowlist. The accepted
artifact slice already owns canonical JSON, SHA-256 digest, base artifact
validation, frozen-brief identity validation and portable redaction. The new
adapter must not duplicate or fork those responsibilities.

## Exact exclusions

The implementation subject must not create, modify, delete, rename or regenerate:

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

Every path outside the four-file allowlist is unauthorized even when it is not
listed above.

The implementation must not:

- alter product behavior or a product package;
- mutate canonical package/status/acceptance records;
- generate an acceptance or release-safety verdict;
- edit CI or create a new check/workflow;
- install, update or auto-download any dependency, binary or tool;
- run a Spec Kit initializer;
- use or introduce fast-check, mutation tooling or another test dependency;
- discover tests automatically or expand a profile beyond declared commands;
- retry a command;
- perform automatic remediation;
- create a DAG, scheduler, queue, daemon, dashboard or workflow server;
- infer package ownership, semantic independence, status or acceptance;
- implement the small-repair pilot or bounded product-package pilot;
- resolve, depend on or pull the P3-02 Shadowing conflict into scope.

## Required public interface

The implementation must expose exactly these module exports:

```js
export const PREFLIGHT_RESULTS = Object.freeze(['PASS', 'BLOCKED']);
export const DIAGNOSTIC_SEVERITIES = Object.freeze(['ERROR', 'WARNING']);
export const TOOL_REQUIREMENTS = Object.freeze(['REQUIRED', 'OPTIONAL']);

export async function collectPreflightObservation(declaration, options = {}) {}
export function evaluatePreflight(declaration, observation, options = {}) {}
export async function runPreflight(declaration, options = {}) {}
export async function executeVerificationProfile(manifest, profile, options = {}) {}
export function validateTraceManifest(trace, bindings = {}) {}
export function validateFrozenHandoff(brief, bindings = {}) {}
```

Every evaluator/validator must return deterministic typed diagnostics sorted by
severity, code, path and message. No public function may return `ACCEPT`,
`REJECT`, canonical package status or release safety.

## Preflight contract

Before the first implementation write, the implementer must run a read-only
preflight using the approved predecessor and implementation branch. The adapter
implementation must then support the same contract for future bounded changes.

Preflight must validate declared evidence for:

- repository identity and canonical files;
- repository root and declared worktree identity;
- exact HEAD/predecessor and observed parent/ref consistency;
- exact branch;
- clean tracked and untracked implementation worktree;
- explicit current writer identity and declared single-writer mode;
- supplied active change-set registry;
- exact file overlap and declared semantic-conflict-key overlap;
- canonical package/dependency entry gates expressed as exact declared evidence;
- exact allowlist, exclusions and stop conditions.

Semantic overlap is mechanical intersection over declared conflict keys and
active registrations only. The adapter must not derive semantic ownership or
independence from file names, imports, history or prose. Missing registry,
writer or semantic declarations fail closed.

The observation boundary may use only read-only filesystem operations and these
Git commands with `shell: false`:

```text
git rev-parse --show-toplevel
git rev-parse HEAD
git rev-parse HEAD^
git symbolic-ref --quiet --short HEAD
git status --porcelain=v1 -z --untracked-files=all
git worktree list --porcelain
git remote get-url <declared remoteName>
```

It must never invoke `fetch`, `pull`, `checkout`, `switch`, `reset`, `clean`,
`stash`, `rebase`, `add`, `commit`, `update-ref`, initializer or repair commands.
A failed preflight returns `BLOCKED` with `ERROR` diagnostics and permits zero
repository writes.

## Verification execution contract

The adapter may execute only exact commands declared under the selected focused
or PR profile, in array order. Every command declaration must include:

- stable command ID and human-readable command label;
- non-empty `argv` string array;
- repository-contained `cwd`;
- explicitly inherited environment keys;
- explicit string environment values;
- positive safe-integer timeout;
- `REQUIRED` or `OPTIONAL` tool requirement;
- mapped requirement IDs.

Execution requirements:

- `spawn(argv[0], argv.slice(1), { shell: false, cwd, env })`;
- exactly one attempt;
- no retry, shell interpolation, test discovery, profile expansion or install;
- raw stdout/stderr omitted from portable output, with content digests retained;
- environment, duration, exit code, signal and output digests recorded;
- diagnostic excerpts, if any, passed through accepted portable redaction.

Command results preserve exactly:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

Classification is frozen:

- exit code `0` → `PASS`;
- normal non-zero exit → `FAIL`;
- executable absent/`ENOENT` → `NOT_AVAILABLE`;
- timeout → `ERROR / COMMAND_TIMEOUT`;
- signal termination or crash → `ERROR / COMMAND_CRASH`;
- invalid cwd/environment or other spawn/infrastructure failure →
  `ERROR / COMMAND_INFRASTRUCTURE_ERROR`;
- declared but not executed → `NOT_RUN`.

A required result other than `PASS` blocks handoff. An optional
`NOT_RUN`/`NOT_AVAILABLE` remains visible and never becomes `PASS`.

## Minimum trace contract

The trace manifest must represent only:

```text
requirement → test → command → evidence
```

It must not implement a general DAG, scheduler or repository-wide orphan scan.
Plan/task references remain metadata and are reviewed manually.

The validator must detect and type:

- duplicate requirement, test, command and evidence IDs;
- broken requirement→test, test→command and command→evidence references;
- missing required command result or evidence;
- required result other than `PASS`;
- evidence bound to another command, subject or environment;
- subject, environment, content, trace or evidence digest mismatch;
- a `SHARED` test/gate without an explicit boundary rationale.

Repository tests outside the declared spec are not automatically orphans. The
complete implementation trace must cover `EWF00-PVT-01` through
`EWF00-PVT-12` exactly once.

## Frozen-handoff completeness contract

`validateFrozenHandoff()` must first use the accepted
`validateFrozenBrief()` result, then validate exact extended bindings for:

- canonical package `EWF-00`;
- spec `EWF00-PREFLIGHT-001`;
- subject and parent;
- frozen spec revision;
- trace, evidence and brief digests;
- exact four-file implementation allowlist;
- exact exclusions;
- actual changed-file containment;
- all required focused and PR command results.

A mismatch returns invalid/`BLOCKED_BY_INVALID_BRIEF` semantics. The function
must not interpret product correctness or emit `ACCEPT`. Implementer-supplied
`auditResult`, `verdict`, `acceptance`, package-status or release-safety fields
must fail closed.

## Determinism, portability and zero-write guarantee

The adapter must reuse accepted canonicalization, digest and redaction. For equal
normalized input and a fixed injected clock, output, diagnostic ordering and
digest must be byte-identical.

Portable output must redact:

- secret-shaped fields and token values;
- URL credentials;
- Windows machine-private absolute paths;
- POSIX `/Users`, `/home`, `/root`, `/private`, `/tmp`, `/var/folders`,
  `/workspace` and `/mnt/data` absolute paths.

Stable repository identity, commit IDs, command IDs and safe repository-relative
paths must remain intact.

Every negative preflight fixture must use a temporary/disposable repository or
directory, compare tracked/untracked/ref/worktree snapshots before and after,
and prove zero mutation. No fixture may dirty, clean, reset, checkout or remove
anything in the user's implementation worktree.

## Frozen focused verification profile

All commands below are required and must run in this order:

```powershell
node --test tests/ewf-preflight-verification-trace.test.mjs
node scripts/ewf-artifacts.mjs --check
node --check scripts/ewf-preflight-trace.mjs
node --check tests/ewf-preflight-verification-trace.test.mjs
git diff --check
```

No additional focused command is authorized by default. The dedicated Node test
suite must exercise both new templates and all four CLI modes; the accepted
artifact `--check` protects the reused base contracts.

## Frozen PR verification profile

All commands below are required and must run in this order:

```powershell
npm test
npm run check
npm run audit:roadmap
npm run build
```

Do not modify CI to add a check. Existing GitHub Actions may run broader
repository checks, but the adapter must not discover, schedule or claim them as
part of its own frozen profile unless separately recorded as external CI
evidence.

Every command must record actual environment, duration, exit code and one of the
five result states. Missing installed dependencies or binaries must not be
installed under this authorization.

## Required acceptance criteria

The implementation subject is eligible for handoff only when all criteria below
are met:

1. `EWF00-PVT-01`: wrong HEAD, changed predecessor/ref assumption or wrong
   repository/worktree identity blocks before any write.
2. `EWF00-PVT-02`: dirty worktree, undeclared/mismatched writer and declared
   file/semantic overlap produce blocking evidence with zero writes.
3. `EWF00-PVT-03`: canonical package/dependency gates are checked through
   declared exact evidence without editing status or choosing among conflicts.
4. `EWF00-PVT-04`: verification runs only exact declared commands in order and
   never retries, discovers, expands or installs.
5. `EWF00-PVT-05`: every command result preserves the five-state vocabulary and
   binds environment, duration, exit/signal and content digests.
6. `EWF00-PVT-06`: trace validation detects duplicate IDs, broken references,
   missing required command/evidence and digest mismatch.
7. `EWF00-PVT-07`: shared gates require explicit scope rationale; unrelated
   repository tests are not treated as orphans.
8. `EWF00-PVT-08`: frozen-handoff validation rejects subject, parent, spec,
   trace, evidence, brief, allowlist, exclusion or required-result mismatch and
   never emits a product verdict.
9. `EWF00-PVT-09`: Spec Kit CLI absence leaves preflight, Node-only profile,
   trace and brief validation operational.
10. `EWF00-PVT-10`: normalized output and diagnostic ordering are deterministic.
11. `EWF00-PVT-11`: portable evidence redacts secrets/private absolute paths
    while preserving stable identity and repository-relative paths.
12. `EWF00-PVT-12`: the four-file adapter adds no CI mutation, complex
    orchestration, daemon, dashboard, scheduler, retry engine or installer.

Passing these criteria does not accept EWF-00, authorize pilots or change a
canonical package/status record.

## Mandatory negative evidence

The focused suite must include separate deterministic fixtures for:

- declared predecessor differs from HEAD;
- observed parent/ref assumptions differ;
- dirty tracked file and dirty untracked file;
- wrong repository origin identity;
- wrong repository root/worktree;
- wrong branch;
- missing active registry;
- absent current writer and writer mismatch;
- exact file overlap with another active writer;
- semantic conflict-key overlap with disjoint files;
- missing semantic declaration;
- missing canonical source file;
- broken exact-literal canonical entry gate;
- duplicate requirement ID;
- duplicate test ID;
- duplicate command ID;
- duplicate evidence ID;
- broken requirement→test reference;
- broken test→command reference;
- broken command→evidence reference;
- `SHARED` test without rationale;
- missing required command result;
- required command recorded `NOT_RUN`;
- required command/tool recorded `NOT_AVAILABLE`;
- missing required evidence;
- evidence bound to the wrong command, subject or environment;
- evidence/content/environment/trace digest mismatch;
- frozen brief wrong subject, parent, spec revision, trace digest, evidence
  digest, identity or brief digest;
- extended brief wrong package, allowlist, exclusions, changed files or required
  results;
- optional executable absent → visible `NOT_AVAILABLE` without false pass;
- required executable absent → `NOT_AVAILABLE` and blocked handoff;
- normal non-zero command exit → `FAIL`;
- timeout → `ERROR / COMMAND_TIMEOUT`;
- crash/signal → `ERROR / COMMAND_CRASH`;
- infrastructure/spawn error → `ERROR / COMMAND_INFRASTRUCTURE_ERROR`;
- Spec Kit executable absent while core EWF modes remain operational;
- repeated equal normalized invalid input → identical diagnostics/digest;
- secret-shaped environment and Windows/POSIX private paths → redacted output;
- deletion of only the four adapter files in a disposable copy leaves accepted
  `node scripts/ewf-artifacts.mjs --check` and manual canonical commands intact.

All Git/filesystem fixtures must be temporary and disposable. No negative test
may make or clean a change in the user's source worktree.

## Migration, compatibility and rollback

This slice has no product schema/data migration. New templates and adapter are
additive. Existing artifact versions and accepted artifact behavior remain
unchanged.

Rollback removes only the four authorized adapter paths. In a disposable copy,
the implementation must prove that after their removal:

- `node scripts/ewf-artifacts.mjs --check` still succeeds;
- manual canonical package commands remain declared and callable;
- no product, canonical, CI, dependency, manifest or lockfile changes exist.

No destructive repository or data operation is authorized as rollback evidence.

## Required implementation handoff

The implementation report must record:

- exact implementation subject and parent;
- actual changed files, exactly matching the four-file allowlist;
- exact spec revision;
- complete `EWF00-PVT-01` through `EWF00-PVT-12` trace;
- focused and PR command results with environment, duration and exit/result;
- preflight/verification adapter overhead separately from command runtime;
- zero-write evidence for negative preflight fixtures;
- timeout/crash/tool-absence classification evidence;
- deterministic diagnostic and redaction evidence;
- rollback/degradation evidence;
- assumptions, limitations, unfinished dispositions and blocking findings;
- authority label `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

The implementation subject must be the last commit containing only authorized
implementation files. Do not put evidence files or a verdict into that subject.

## Evidence-only revision requirement

After the implementation subject is frozen and all required focused/PR commands
and existing CI have actually passed, a separate evidence-only authorization is
required. That later revision may create only:

```text
docs/superpowers/evidence/2026-08-04-ewf00-preflight-001/implementation-report.json
docs/superpowers/evidence/2026-08-04-ewf00-preflight-001/requirement-trace.json
docs/superpowers/evidence/2026-08-04-ewf00-preflight-001/frozen-acceptance-brief.json
```

It must bind:

- exact implementation subject and parent;
- frozen spec revision `0b43efac974c3fbbc489f10e9fa668bac84c9b43`;
- exact implementation allowlist and exclusions;
- trace, evidence and brief digest;
- all required focused/PR results;
- actual external CI evidence.

Use the accepted non-circular projection:

1. `traceDigest = digestArtifact(requirement-trace.json)`;
2. `evidenceDigest = digestArtifact(implementation-report.json with the
   top-level frozenBriefDigest field omitted)`;
3. build the frozen brief with those two digests;
4. `briefDigest = digestArtifact(frozen brief with the top-level briefDigest
   field omitted)`;
5. set the final report `frozenBriefDigest` to `briefDigest`;
6. record the projection in report and brief extensions.

The evidence revision is implementer evidence only. It may not contain an
independent verdict and may not amend the implementation subject.

## Independent exact-head audit requirement

A separate read-only auditor must use a clean, separate worktree at the exact
frozen implementation subject/evidence identity. The auditor must independently:

- verify branch/parent/diff scope and four-file containment;
- recompute all digests and extended frozen bindings;
- rerun the required focused/PR gates as applicable;
- verify fail-before-write and zero-mutation evidence;
- verify five-state command fidelity, no retry/discovery/install and timeout/
  crash classification;
- verify trace completeness and mismatch invalidation;
- verify absence of CI, dependency, canonical, product, package/status and
  verdict side effects.

The auditor owns the result. The implementer cannot self-accept. Merge is allowed
only after a fresh exact-head independent verdict of `ACCEPT`.

Acceptance of `EWF00-PREFLIGHT-001` still does not accept EWF-00 and does not
authorize `EWF00-PILOTS-001`.

## Stop conditions

Stop before writing, or abandon the implementation subject without widening it,
if any condition below is true:

- HEAD is not exact predecessor `8828715ae1f636aa07d6a740724b9706d23923c1`;
- branch is not `chatgpt/ewf-00-preflight-verification-trace-mvp`;
- repository/worktree is dirty before the first write;
- repository identity, worktree, current writer or active registry is missing or
  mismatched;
- another active writer overlaps an authorized path or declared semantic key;
- canonical EWF-00 package/dependency evidence conflicts or cannot be checked by
  exact declared evidence;
- implementation requires any file outside the four-path allowlist;
- implementation requires modifying `scripts/ewf-artifacts.mjs`, existing EWF
  templates or the accepted artifact-contract test;
- implementation requires canonical docs, product source, `package.json`,
  lockfile, CI or dependency/tool changes;
- implementation requires a Spec Kit initializer, fast-check or mutation tool;
- implementation must infer package owner, status, acceptance or semantic
  independence rather than consume declared evidence;
- implementation expands into workflow runtime, DAG, scheduler, queue, retry,
  daemon, dashboard, automatic discovery or remediation;
- implementation must install or auto-download a tool/binary;
- implementation would write package status, acceptance or release-safety
  verdicts;
- the P3-02 Shadowing conflict is implicated;
- a small-repair or bounded product-package pilot is mixed into this slice;
- the exact allowlist, required profile or frozen identity can no longer be
  preserved.

On any stop condition, do not rebase, select a newer predecessor, modify
canonical docs, widen scope or create a substitute implementation branch. Report
the blocker and request a replacement authorization.
