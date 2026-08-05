# EWF00-PILOT-A-001 — Connector-Native V2 Execution Authorization Brief

Status: `AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / DOCS_ONLY / NOT_ACCEPTANCE`

## 1. Frozen authorization identity

| Field | Exact value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Pilot specification | `EWF00-PILOTS-001` |
| Pilot ID | `EWF00-PILOT-A-001` |
| Candidate ID | `P1-07-TODAY-NONFINITE-ESTIMATE-001` |
| Canonical product owner | `P1-07 Today Composer` |
| Accepted owner boundary | integrated Phase 1 main `9da21e1c3cb34b7372f1b33c541d7442dd0390c9` |
| Authorization base main | `7dd847cc9da2f5595430e20f864c211f3ec5ddfb` |
| Authorization branch | `chatgpt/ewf-00-pilot-a-connector-native-v2-authorization` |
| Plan path | `docs/superpowers/plans/2026-08-06-ewf-00-pilot-a-small-repair-connector-native-v2.md` |
| Plan commit / approved future implementation predecessor | `ce5a6cf1f0bbdf3426a246423c353e5f60cf8640` |
| Plan direct parent | `7dd847cc9da2f5595430e20f864c211f3ec5ddfb` |
| Plan blob | `5d7a95bc0944d926a8e3dcbb8b59f6c068c867f6` |
| Historical authorization PR | `#26` |
| Historical authorization head | `94e8d9919caf92e9d49509a5b770f4ee43aa2ed7` |
| Historical independent comment | `5198006544` / `VERDICT: ACCEPT` |
| Future implementation branch | `chatgpt/ewf-00-pilot-a-small-repair-connector-native-v2` |
| Designated connector writer | `chatgpt-github-ewf00-pilot-a-primary-writer` |
| Writer mode | `exclusive` |
| Execution substrate | `GitHub connector + existing GitHub Actions` |

The future implementation branch may be created only from exact plan commit `ce5a6cf1f0bbdf3426a246423c353e5f60cf8640`, after the final v2 authorization PR receives an independent docs-only exact-head `ACCEPT` and fresh Connector Governance Stage 0 returns `PASS`.

Any mismatch in plan commit, parent, path or blob invalidates this brief.

## 2. Replacement scope

This brief replaces only the unavailable local-checkout/worktree execution substrate of PR #26.

It preserves without reinterpretation:

```text
candidate selection
canonical owner
accepted owner boundary
bug statement
deterministic two-row reproduction
expected behavior
exact source/test allowlist
exclusive writer
TDD requirement
natural RED requirement
minimal GREEN requirement
independent acceptance separation
package and Pilot B boundaries
```

It does not claim that any local preflight, baseline command or worktree gate from PR #26 passed. It explicitly substitutes a remote governance and CI evidence model.

Before independent exact-head v2 docs `ACCEPT`:

```text
EWF00-PILOT-A-001: CONNECTOR_V2_AUTHORIZATION_PENDING_INDEPENDENT_AUDIT
EWF00-PILOTS-001: NOT_COMPLETED
Pilot B: UNAUTHORIZED
EWF-00: IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED
```

## 3. Historical PR #26 relationship

PR #26 remains historical, open, Draft, unmerged and unchanged by this workflow.

Its exact exempted identity is:

```text
number: 26
base: main
base SHA: 7dd847cc9da2f5595430e20f864c211f3ec5ddfb
head branch: chatgpt/ewf-00-pilot-a-small-repair-authorization
head SHA: 94e8d9919caf92e9d49509a5b770f4ee43aa2ed7
commits: 3
changed files: 3
independent comment: 5198006544
```

Exact changed paths:

```text
docs/superpowers/plans/2026-08-06-ewf-00-pilot-a-small-repair.md
docs/superpowers/briefs/2026-08-06-ewf00-pilot-a-small-repair-authorization.md
docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/HANDOFF.md
```

After independent exact-head acceptance of v2, v2 supersedes PR #26 only for execution-substrate authority. PR #26 continues to preserve candidate-selection and failed local-substrate provenance.

Do not edit, add commits to, mark ready, close or merge PR #26 under this brief.

## 4. Frozen candidate and reproduction

Selection-time identities:

```text
src/today-composer.js
blob d63a76c3698fe572790914e687443ee38e6842b2

tests/today-composer.test.mjs
blob 787b4cb0c1b845aefba4c83eafe5380396f4251a
```

Bug statement:

```text
A truthy non-numeric estimatedSeconds is converted to NaN.
With a prior 60-second row consuming a 60-second budget,
used + NaN > budgetSeconds evaluates false.
The malformed second row bypasses time-budget exclusion and
aggregate estimatedSeconds becomes non-finite.
```

First regression input:

```text
fixed now
minutes = 1
two complete exact-target due-review rows in deterministic due order
row 1 estimatedSeconds = 60
row 2 estimatedSeconds = "not-a-number"
```

Required behavior:

```text
convert the supplied duration to Number
non-finite result -> existing default 60
finite result -> existing clamp [10, 900]
select row 1 only
exclude row 2 with reason time-budget
return finite aggregate and activity estimates
```

No public API, contract shape, ordering, budget policy, target binding, schema, durable semantics or new product capability may change.

## 5. Exact implementation allowlist

Only these paths may change in the future implementation lineage:

```text
tests/today-composer.test.mjs
src/today-composer.js
```

No third path is authorized.

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
new UI or capability
Pilot B
P3-02
LI-00
SRC-00
ERR-00
QAR-00
acceptance verdicts
merge
```

## 6. Connector Governance Stage 0

Immediately before implementation branch creation, fresh-read:

```text
repository API identity
default branch and exact main
v2 plan commit/parent/path/blob
final v2 authorization PR exact accepted head
PR #26 exact historical identity and comment 5198006544
implementation branch and PR absence
source/test blobs at the v2 plan predecessor
complete open-PR registry and complete changed filenames
candidate, owner, writer and semantic declarations
canonical package state
```

Only two open PRs may be excluded from overlap blocking:

1. exact PR #26 while every frozen identity above remains unchanged;
2. the exact final independently accepted v2 authorization PR.

Retain every other open PR. Block if another PR or writer overlaps either implementation path, `P1-07 Today Composer`, `P1-07-TODAY-NONFINITE-ESTIMATE-001`, `EWF00-PILOT-A-001`, the future implementation branch or the designated writer.

Incomplete enumeration, pagination, body retrieval, changed-filename retrieval or comment retrieval is blocking.

Stage 0 may record remote GitHub facts only. It must not contain or claim:

```text
local repository root
local HEAD/parent/ref/index/worktree state
tracked/staged/untracked cleanliness
local worktree registry
local command results
```

A `BLOCKED` result permits zero implementation mutation.

## 7. Connector-native executable baseline

The exact final v2 authorization PR CI is the baseline executable run because the authorization diff is docs-only and the source/test blobs remain identical to the v2 plan predecessor.

Required baseline binding:

```text
workflow ID: 322561862
event: pull_request
base SHA: 7dd847cc9da2f5595430e20f864c211f3ec5ddfb
head SHA: exact final v2 authorization head
conclusion: success
source blob: d63a76c3698fe572790914e687443ee38e6842b2
test blob: 787b4cb0c1b845aefba4c83eafe5380396f4251a
```

Record available workflow, run, job, merge-preview, timing, runner, Node/npm, test/audit/build/browser and artifact identities. Values not exposed by GitHub are `NOT_EXPOSED`; they must not be inferred.

The named regression does not exist during baseline. Do not claim it passed or was executed.

Implementation CI comparisons must use the same workflow identity and runner-label class. Material environment mismatch invalidates timing comparison but does not silently alter correctness evidence.

## 8. Measurement boundary

Record observed connector-native metrics only:

```text
Stage 0 elapsed time and connector operation count
Commit A preparation operation count
Commit B preparation operation count
PR CI wall-clock duration
job/step durations when exposed
diagnostic review time
rework/invalidation rounds
CLI-absent friction
```

Each metric binds value, unit, start/end, method, exclusions and raw source identity. No arbitrary threshold is authorized. Evidence-file writes require later evidence-only authorization.

## 9. Commit A — test-first natural RED

Create the implementation branch from exact plan commit:

```text
branch: chatgpt/ewf-00-pilot-a-small-repair-connector-native-v2
source SHA: ce5a6cf1f0bbdf3426a246423c353e5f60cf8640
```

Then create exactly:

```text
message: test(today): reproduce non-finite estimate budget bypass
parent: ce5a6cf1f0bbdf3426a246423c353e5f60cf8640
changed path only: tests/today-composer.test.mjs
```

The test name must contain `non-finite estimatedSeconds` and assert:

```text
activities contains row 1 only
row 2 is excluded with reason time-budget
Number.isFinite(plan.estimatedSeconds) is true
every selected activity estimatedSeconds is finite
```

No artificial failure is allowed. `src/today-composer.js` must remain selection blob `d63a76c3698fe572790914e687443ee38e6842b2`.

Open a Draft implementation PR to `main` and wait for exact-head CI.

Valid RED requires the new regression to be discovered and fail because the existing source selects row 2 or returns a non-finite estimate. Syntax, fixture, dependency, infrastructure or unrelated failures are invalid.

If natural RED is not observed:

```text
PILOT_A_CONNECTOR_V2_INVALID_OR_MISSING_RED
STOP
NO_SOURCE_WRITE
```

## 10. Commit B — minimal GREEN

Only after valid Commit A exact-head natural RED, create:

```text
message: fix(today): keep activity estimates finite
parent: exact Commit A
changed path only: src/today-composer.js
```

Authorized minimal implementation:

```javascript
const parsedEstimatedSeconds=Number(row.estimatedSeconds||60);
const estimatedSeconds=Number.isFinite(parsedEstimatedSeconds)
  ?Math.max(10,Math.min(900,parsedEstimatedSeconds))
  :60;
```

Equivalent local formatting is permitted. No broad refactor is permitted.

Required exact-head GREEN includes the new regression, all existing Today Composer tests, full unit suite, static checks, audits, build, serve/preview and existing browser suites.

No `.github/**` or dependency change is allowed.

## 11. Write discipline

For every connector write:

1. fresh-read branch HEAD;
2. bind the exact expected predecessor;
3. fresh-read the target file blob;
4. verify no unexpected path or branch movement;
5. perform one sequential write;
6. read back exact ref, commit, parent, changed paths and blobs;
7. stop on any mismatch.

No parallel same-path writes, amend, squash, rebase, force-push or history rewrite.

If the branch exists before authorized creation, do not update, reuse, delete, replace or create an alternate branch.

## 12. Failure and remediation

Preserve all failed commits and CI evidence.

If Commit B is RED, classify the first causal failure. Stop if remediation requires a third path, contract change, owner expansion, dependency or CI change. Any in-boundary remediation must be a separate disclosed commit on one of the two authorized paths.

The implementation writer may not write evidence files, acceptance verdicts or canonical status.

## 13. Evidence and acceptance

After final exact-head GREEN:

```text
freeze baseline CI identity
freeze Commit A RED identity
freeze final GREEN identity
freeze implementation commit chain, files and blobs
request separate evidence-only revision authorization
request fresh independent exact-head audit
```

Implementer evidence is `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

This brief does not accept Pilot A, the repaired product package or `EWF-00`. Pilot B remains unauthorized.

## 14. Stop conditions

Stop with zero further mutation if:

- any frozen identity drifts;
- final v2 exact-head independent docs `ACCEPT` is absent;
- PR #26 differs from the exact exempted identity;
- complete registry, changed filenames or comment retrieval is unavailable;
- another overlap exists;
- implementation branch/PR exists before creation;
- branch creation requires reuse, update, delete, force or alternate behavior;
- source/test blobs differ at the plan predecessor;
- Commit A natural RED is missing or invalid;
- Commit B needs any excluded path or category;
- exact-head CI evidence is unavailable;
- any local, connector, CI, measurement, evidence or acceptance fact would need to be fabricated.

This brief remains subordinate docs-only authorization and `NOT_ACCEPTANCE`.