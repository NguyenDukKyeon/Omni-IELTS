# EWF Pilot A Connector-Native V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Use `superpowers:test-driven-development` for the test-first implementation commits and `superpowers:verification-before-completion` before every completion claim.

**Goal:** Replace only the unavailable local-checkout/worktree execution substrate for `EWF00-PILOT-A-001` with a GitHub connector plus existing GitHub Actions workflow while preserving the accepted candidate, owner, exact two-file implementation boundary, natural RED → minimal GREEN sequence, evidence separation and independent acceptance gates.

**Architecture:** GitHub repository/API observations provide remote topology and scope-control evidence. The existing GitHub Actions workflow provides executable evidence at exact commit SHAs. Connector metadata must never be represented as local Git/worktree evidence, and CI evidence must never be represented as an independent acceptance verdict.

**Tech Stack:** GitHub connector, GitHub commits/refs/pull requests, existing `.github/workflows/ci.yml`, Node.js test runner, existing npm verification scripts.

## Global Constraints

- Repository: `NguyenDukKyeon/VocabMaster`.
- Canonical package: `EWF-00`.
- Pilot: `EWF00-PILOT-A-001`.
- Candidate: `P1-07-TODAY-NONFINITE-ESTIMATE-001`.
- Canonical product owner: `P1-07 Today Composer`.
- Authorization base main: `7dd847cc9da2f5595430e20f864c211f3ec5ddfb`.
- Preserved PR #26 authorization subject: `94e8d9919caf92e9d49509a5b770f4ee43aa2ed7`.
- Preserved independent authorization comment: PR #26 comment `5198006544` with `VERDICT: ACCEPT`.
- Selection-time source blob: `src/today-composer.js` at `d63a76c3698fe572790914e687443ee38e6842b2`.
- Selection-time test blob: `tests/today-composer.test.mjs` at `787b4cb0c1b845aefba4c83eafe5380396f4251a`.
- Future implementation branch: `chatgpt/ewf-00-pilot-a-small-repair-connector-native-v2`.
- Designated writer: `chatgpt-github-ewf00-pilot-a-primary-writer` in `exclusive` mode.
- Exact future implementation allowlist: `tests/today-composer.test.mjs`, `src/today-composer.js`.
- No `.github/**`, dependency, schema, durable-data, security, privacy, rights, provider/network, concurrency, crash/recovery, canonical-status, Pilot B or package-acceptance change.
- PR #26 remains historical, open, Draft, unmerged and unchanged in this authorization workflow.
- No local checkout, worktree, local ref, local index, untracked-file or local command-execution claim is permitted.

---

## 1. Authority and replacement effect

This plan replaces only the execution substrate frozen by PR #26. It does not reselect the candidate, redefine the bug, change the product owner, expand the allowlist, authorize Pilot B, accept the repaired product package or accept `EWF-00`.

The preserved candidate-selection authorization is:

```text
PR: #26
head: 94e8d9919caf92e9d49509a5b770f4ee43aa2ed7
independent comment: 5198006544
verdict: ACCEPT
candidate: P1-07-TODAY-NONFINITE-ESTIMATE-001
owner: P1-07 Today Composer
```

That authorization could not be executed because its real local Git/worktree prerequisite was unavailable. This v2 does not claim that the prerequisite passed. It creates a different, explicitly remote execution model.

This replacement becomes effective only after a fresh independent docs-only exact-head `ACCEPT` on the final v2 authorization PR head. Until then:

```text
EWF00-PILOT-A-001: CONNECTOR_V2_AUTHORIZATION_PENDING_INDEPENDENT_AUDIT
EWF00-PILOTS-001: NOT_COMPLETED
Pilot B: UNAUTHORIZED
EWF-00: IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED
```

## 2. Frozen candidate and expected behavior

The selected defect remains unchanged:

```text
A truthy non-numeric Today Composer estimatedSeconds value is converted to NaN.
After a prior valid activity consumes the budget, used + NaN > budgetSeconds is false.
The malformed activity bypasses time-budget exclusion and poisons aggregate estimatedSeconds.
```

The first implementation test must use:

```text
fixed now
minutes = 1
row 1 estimatedSeconds = 60
row 2 estimatedSeconds = "not-a-number"
two complete exact-target due-review rows in deterministic due order
```

Required corrected behavior:

```text
non-finite converted duration -> existing default 60
finite converted duration -> existing clamp [10, 900]
row 1 selected
row 2 excluded with reason time-budget
aggregate estimatedSeconds finite
all selected activity estimates finite
```

No API, contract shape, ordering rule, budget policy, target binding, schema, persistence or new capability may change.

## 3. Exact implementation boundary

Only these future implementation paths are authorized:

```text
tests/today-composer.test.mjs
src/today-composer.js
```

Everything else is excluded, including:

```text
AGENTS.md
docs/**
.specify/**
scripts/**
server/**
public/**
.github/**
package.json
package-lock.json
other tests/**
other src/**
evidence files
canonical status and decisions
CI and dependencies
schemas and migrations
durable storage or data semantics
data deletion or repair
backup/restore
outbox/reconciliation
process lifecycle
lease/fencing/concurrency
crash/recovery
provider/network behavior
security/authentication
privacy/consent
rights/publication
new UI or product capability
Pilot B
P3-02
LI-00
SRC-00
ERR-00
QAR-00
acceptance verdicts
merge
```

No formatting sweep, rename, broad refactor, generated output or opportunistic fix is authorized.

## 4. Connector Governance Stage 0

Before the implementation branch is created, the designated writer must fresh-read and bind:

```text
repository API identity
default branch main
exact current main
this v2 plan commit, parent, path and blob
final v2 authorization PR number, state, Draft state and exact accepted head
PR #26 number, base, head, Draft state, changed paths and comment 5198006544
implementation branch absence
implementation PR absence
exact source/test blobs at the approved v2 plan predecessor
complete open-PR registry across all pages
complete changed filenames for every open PR
candidate, owner, writer and semantic declarations
canonical package state
```

The only open-PR exemptions permitted during Stage 0 are:

1. exact historical PR #26, only while it remains `open / Draft / unmerged`, base `7dd847cc9da2f5595430e20f864c211f3ec5ddfb`, head `94e8d9919caf92e9d49509a5b770f4ee43aa2ed7`, exactly three documentation paths and exact acceptance comment `5198006544`;
2. the exact independently accepted v2 authorization PR itself.

Every other open PR is retained. Block if another PR changes either implementation path, declares the candidate, pilot, owner, implementation branch or designated writer, or has unclear ownership over the same semantic boundary.

If enumeration, pagination, body retrieval, changed-filename retrieval, exact comment retrieval or any required identity is incomplete, Stage 0 is `BLOCKED` and permits zero implementation mutation.

Stage 0 is remote governance metadata only. It cannot claim:

```text
local repository root
local HEAD or parent
local symbolic ref
local index or worktree cleanliness
untracked-file state
worktree registry
local command execution
```

## 5. Connector-native baseline

The final v2 authorization PR exact-head CI is the executable baseline because its source and test blobs remain identical to the approved v2 plan predecessor and to base main. The docs-only plan/brief/HANDOFF delta must not alter runtime behavior.

Baseline requirements:

```text
workflow: existing CI workflow ID 322561862
event: pull_request
head: exact final v2 authorization head
base: exact main 7dd847cc9da2f5595430e20f864c211f3ec5ddfb
conclusion: success
source blob: d63a76c3698fe572790914e687443ee38e6842b2
test blob: 787b4cb0c1b845aefba4c83eafe5380396f4251a
```

Record from available workflow metadata, job steps, logs and artifacts:

```text
workflow/run/job IDs
synthetic merge-preview SHA
runner labels and image identity when exposed
Node and npm versions when exposed
start/end timestamps and durations
unit-test totals
roadmap/IELTS/v10 audit totals
build result
server/preview result
browser-suite results
artifact IDs and digests
```

Do not claim that the future named regression passed during baseline; it does not exist yet. Do not invent environment values that GitHub does not expose.

For comparison, implementation runs must use the same workflow identity, runner label class and command set. If actual environment values exposed by GitHub materially differ, record the mismatch and classify the paired timing comparison as invalid rather than normalizing it after execution.

## 6. Measurement protocol

Measure the connector-native workflow, not a fictional local workflow.

Required observed metrics:

```text
Stage 0 elapsed time
Stage 0 connector operation count
Commit A artifact-preparation operation count
Commit B artifact-preparation operation count
PR CI wall-clock duration
job and relevant step durations when exposed
diagnostic review time
rework/invalidation rounds and causes
CLI-absent friction as connector operations or unavailable local capabilities
```

Each metric records value, unit, start/end, method, exclusions and raw source identity. No arbitrary pass threshold is authorized. Missing values are recorded as `NOT_EXPOSED` or `NOT_AVAILABLE`, never guessed.

Evidence-file repository writes require a separate evidence-only authorization after the final implementation subject and exact-head GREEN CI exist.

## 7. Task 1 — Create test-first Commit A

**Files:**
- Modify: `tests/today-composer.test.mjs`
- Preserve unchanged: `src/today-composer.js`

**Interfaces:**
- Consumes: `composeTodayPlan(input)` from `src/today-composer.js`.
- Produces: one regression test named with the exact substring `non-finite estimatedSeconds`.

- [ ] Fresh-read the implementation branch and verify it is exactly the approved v2 plan commit.
- [ ] Fresh-read both implementation blobs and confirm the selection-time SHAs.
- [ ] Add one focused regression using the frozen two-row input and desired assertions.
- [ ] Create exactly one commit:

```text
message: test(today): reproduce non-finite estimate budget bypass
parent: exact approved v2 plan commit
changed path only: tests/today-composer.test.mjs
```

- [ ] Read back the commit, parent, tree, changed path and test blob.
- [ ] Verify `src/today-composer.js` remains blob `d63a76c3698fe572790914e687443ee38e6842b2`.
- [ ] Open a Draft implementation PR to `main`.
- [ ] Wait for exact-head CI.

Valid RED requires the new regression to be discovered and to fail because row 2 is selected or the aggregate estimate is non-finite. Syntax, fixture, dependency, infrastructure or unrelated failures are invalid RED.

If CI is GREEN or RED for another first cause:

```text
PILOT_A_CONNECTOR_V2_INVALID_OR_MISSING_RED
STOP
NO_SOURCE_WRITE
```

## 8. Task 2 — Create minimal source Commit B

Commit B is authorized only after valid exact-head natural RED evidence for Commit A.

**Files:**
- Modify: `src/today-composer.js`
- Preserve the Commit A test unchanged.

**Interfaces:**
- Consumes: the new regression from Commit A.
- Produces: finite duration normalization using the existing default and clamp.

Minimal implementation shape:

```javascript
const parsedEstimatedSeconds=Number(row.estimatedSeconds||60);
const estimatedSeconds=Number.isFinite(parsedEstimatedSeconds)
  ?Math.max(10,Math.min(900,parsedEstimatedSeconds))
  :60;
```

Equivalent formatting consistent with the existing file is allowed; broader refactoring is not.

- [ ] Fresh-read branch HEAD and bind exact Commit A.
- [ ] Verify only the test path differs from the approved predecessor.
- [ ] Replace only the duration-normalization expression with the minimal finite guard.
- [ ] Create exactly one commit:

```text
message: fix(today): keep activity estimates finite
parent: exact Commit A
changed path only: src/today-composer.js
```

- [ ] Read back the commit, parent, tree, source blob and cumulative two-file diff.
- [ ] Wait for exact-head CI.

Required GREEN:

```text
new regression passes
all existing Today Composer tests pass
npm test passes
npm run check passes
roadmap audit passes
IELTS audit passes
v10 focused tests and audit pass
build passes
server/preview and existing browser suites pass
```

No CI or dependency change is permitted.

## 9. Failure and remediation boundary

No amend, squash, rebase, force-push or history rewrite is authorized.

If Commit B CI is RED:

- preserve Commit A and Commit B;
- classify the first causal failure;
- stop if it requires a third path, contract change, broader refactor, dependency, CI change or another owner;
- any in-boundary remediation requires a separately disclosed commit on one of the two paths and a frozen reason;
- no evidence or acceptance claim may be written by the implementation writer.

## 10. Evidence and independent acceptance

After exact Commit B or an explicitly authorized in-boundary remediation subject is GREEN:

1. freeze exact implementation subject, parent chain, changed files and blobs;
2. freeze Commit A RED run and final GREEN run identities separately;
3. preserve baseline authorization-CI identity;
4. request separate evidence-only revision authorization;
5. submit the exact implementation/evidence identity to a fresh independent read-only auditor.

Implementer evidence remains `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

Pilot A is not successful until independent audit accepts the exact implementation and bound evidence. Product-package acceptance remains separate. `EWF-00` remains `IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED` until both pilots, measurements and package-level audit are complete.

## 11. Historical PR #26 boundary

This workflow does not edit, add commits to, mark ready, close or merge PR #26. Upon independent exact-head acceptance of v2, v2 supersedes PR #26 only for execution-substrate authority.

PR #26 remains historical evidence of:

```text
candidate selection
canonical owner binding
two-file allowlist
local-worktree execution attempt and hard stop
independent comment 5198006544
```

It does not authorize connector-native implementation by itself.

## 12. Stop conditions

Stop with zero further mutation if:

- main, v2 plan identity, source/test blobs or canonical state drift;
- the final v2 exact-head independent `ACCEPT` is absent;
- PR #26 differs from its exact exempted identity;
- complete open-PR or changed-filename retrieval is unavailable;
- another writer/PR/file/semantic overlap exists;
- implementation branch or PR exists before authorized creation;
- branch creation requires update, reuse, delete, force or alternate branch behavior;
- Commit A does not produce a valid natural defect RED;
- Commit B needs a third path or excluded category;
- exact-head CI evidence is unavailable;
- a false local, connector, CI, measurement, evidence or acceptance claim would be required.

This plan is subordinate docs-only authorization and remains `NOT_ACCEPTANCE`.