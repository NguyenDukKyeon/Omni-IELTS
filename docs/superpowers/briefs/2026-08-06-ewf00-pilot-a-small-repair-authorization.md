# EWF00-PILOT-A-001 — Small-Repair Pilot Authorization Brief

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
| Authorization branch | `chatgpt/ewf-00-pilot-a-small-repair-authorization` |
| Plan path | `docs/superpowers/plans/2026-08-06-ewf-00-pilot-a-small-repair.md` |
| Plan commit / approved future implementation predecessor | `7b74bdfed67debec31b7a043a838350946965a72` |
| Plan direct parent | `7dd847cc9da2f5595430e20f864c211f3ec5ddfb` |
| Plan blob | `09a51b614a2818de6c4552c85667c0119e237c24` |
| Future implementation branch | `chatgpt/ewf-00-pilot-a-small-repair` |
| Designated writer | `chatgpt-github-ewf00-pilot-a-primary-writer` |
| Writer mode | `exclusive` |

The future implementation branch may be created only from exact plan commit `7b74bdfed67debec31b7a043a838350946965a72`, after this final docs-only authorization PR receives an independent exact-head `ACCEPT` and fresh baseline/preflight gates pass. It must not be created from `main`, this brief commit, the later handoff commit, a synthetic merge preview or any rewritten descendant.

Any mismatch in plan commit, parent, path or blob invalidates this brief.

## 2. Authorization effect

This brief authorizes only the possibility of one future eligible small-repair pilot after independent docs acceptance. It does not currently authorize or perform:

```text
implementation branch creation
regression-test writing
source writing
pilot execution
baseline or pilot result measurement
pilot evidence creation
Pilot A success
Pilot B
EWF-00 acceptance
product-package acceptance
canonical status mutation
merge
```

Before independent exact-head docs `ACCEPT`, the effective state is:

```text
EWF00-PILOT-A-001: AUTHORIZATION_PENDING_INDEPENDENT_AUDIT
EWF00-PILOTS-001: NOT_COMPLETED
Pilot B: UNAUTHORIZED
EWF-00: IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED
```

## 3. Frozen candidate and reproduction

### Bug statement

In `src/today-composer.js`, a truthy non-numeric candidate `estimatedSeconds` is converted with `Number(...)` and clamped directly. The result is `NaN`. When a prior valid activity has consumed the one-minute budget, `used + NaN > budgetSeconds` evaluates false, so the malformed second activity bypasses `time-budget` exclusion and the aggregate plan estimate becomes non-finite.

### Selection-time identities

```text
src/today-composer.js
blob d63a76c3698fe572790914e687443ee38e6842b2

tests/today-composer.test.mjs
blob 787b4cb0c1b845aefba4c83eafe5380396f4251a
```

### Deterministic reproduction

At fixed `now`, construct two exact-target due-review rows ordered by `dueAt` under a 60-second budget:

```text
row 1 estimatedSeconds = 60
row 2 estimatedSeconds = "not-a-number"
```

On the frozen source, row 1 consumes the budget; row 2 normalizes to `NaN`; the time-budget comparison does not reject row 2; both rows are selected; and the returned aggregate estimate is non-finite.

This is a source-level deterministic reproduction bound to exact repository bytes and ECMAScript numeric semantics. Candidate selection did not execute it because no supported exact-byte disposable materialization path was available. The future writer must encode this exact case as the first focused failing regression test after authorization acceptance and fresh preflight. If it does not fail for this exact reason, stop before source modification.

### Expected behavior

For candidate duration normalization only:

1. convert the supplied value to a number;
2. if the result is non-finite, use the existing default `60` seconds;
3. if finite, retain the existing `[10, 900]` clamp;
4. ensure activity and aggregate estimates remain finite;
5. for the frozen two-row case, select only row 1 and record row 2 as `time-budget` excluded.

No public API, contract shape, target binding, ordering policy, repair cap, schema, durable semantics or new behavior is authorized.

## 4. Candidate eligibility binding

All twenty lightweight predicates are frozen as PASS only for the exact boundary in this brief:

- deterministic pure-function reproduction;
- existing accepted canonical owner `P1-07 Today Composer`;
- focused regression in an existing test file;
- no contract or public API change;
- no schema or migration;
- no durable-data semantic change;
- no data loss;
- no security or authentication;
- no privacy or consent;
- no rights or publication;
- no provider call or external cost;
- no dependency change;
- no concurrency semantics;
- no crash/recovery behavior;
- no product-scope expansion;
- no CI change;
- no broad refactor;
- revert-bounded rollback;
- exactly two implementation paths;
- one exclusive writer over one accepted product boundary.

If any predicate becomes false, Pilot A stops and is reclassified or blocked. No predicate may be waived because implementation has begun.

## 5. Exact future implementation allowlist

Only these paths may be created or modified by the future implementation subject:

```text
tests/today-composer.test.mjs
src/today-composer.js
```

The intended shape is one focused regression test and the smallest source normalization required to pass it. No third path is authorized.

## 6. Frozen exclusions

Everything outside the two-file allowlist is excluded, including:

```text
AGENTS.md
docs/**
IMPLEMENTATION_QUEUE.md
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
canonical status or decision files
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
new package boundary
Pilot B
P3-02
LI-00
SRC-00
ERR-00
QAR-00
acceptance verdicts
merge
```

No unrelated cleanup, formatting sweep, rename, broad refactor, generated output or opportunistic repair is allowed.

## 7. Verification profiles

### Focused profile

```text
node --test --test-name-pattern="non-finite estimatedSeconds" tests/today-composer.test.mjs
node --test tests/today-composer.test.mjs
node --check src/today-composer.js
node --check tests/today-composer.test.mjs
git diff --check -- tests/today-composer.test.mjs src/today-composer.js
```

The first command must prove the exact reproduction. The second executes the new regression plus all existing Today Composer focused tests. Syntax and diff validation are mandatory.

### PR profile

```text
npm test
npm run check
npm run audit:roadmap
npm run audit:ielts
npm run test:v10
npm run audit:v10
npm run build
```

The existing `.github/workflows/ci.yml` is executable PR evidence and must not be modified. Existing additional workflow steps may be observed but do not expand the repair boundary.

## 8. Baseline manual workflow

After independent authorization acceptance, the future implementation branch may be created from exact plan commit `7b74bdfed67debec31b7a043a838350946965a72`. Before any source/test write, the exclusive writer must:

1. verify exact repository, HEAD, parent, branch, clean state, one worktree, remote collision, writer registry, complete open-PR registry and file/semantic overlap;
2. verify the two selection-time source/test blobs are unchanged at the approved predecessor;
3. manually record the bug, accepted owner, allowlist, exclusions, verification profiles, rollback and stop conditions;
4. run the exact focused and PR profiles without modifying repository files;
5. record raw environment, timestamps, outcomes and operation counts.

The EWF-assisted pilot uses the same starting repository state, environment class, command set and measurement method. Baseline data is comparison input only, not product or EWF acceptance evidence.

## 9. Measurement protocol

The paired baseline and EWF-assisted runs must use:

```text
OS/environment class: GitHub-hosted Ubuntu 24.04 / ubuntu-24.04 class
reference runner image: 20260720.247.2
Node reference: v22.23.1
npm reference: 10.9.8
repository state: exact plan commit 7b74bdfed67debec31b7a043a838350946965a72, clean before first write
command set: exact focused and PR profiles
measurement clock: monotonic elapsed wall time
```

Record actual OS image, Node and npm versions at the start of both runs. Values must match between baseline and pilot. A mismatch invalidates the comparison and requires both sides to be rerun as one pair; unlike environments must not be normalized after execution.

Required observed metrics, without invented pass thresholds:

- focused command duration, per command and total;
- PR command duration, excluding queue/provisioning and also per command;
- preflight elapsed time;
- manual operation count under one frozen operation definition;
- artifact preparation operations;
- validator duration;
- diagnostic review time;
- rework/invalidation rounds and causes;
- CLI-absent friction.

Each metric records value, unit, start/end, method, exclusions and raw evidence reference. Evidence-file repository writes require a separate later authorization.

## 10. Rollback boundary

Rollback is a revert of the future implementation subject limited to:

```text
tests/today-composer.test.mjs
src/today-composer.js
```

No data migration, compatibility action, cleanup, dependency rollback, CI rollback or durable repair exists. The canonical manual workflow remains usable.

## 11. Fresh preflight requirements

Immediately before future implementation branch creation and again before the first implementation write, fail closed unless all are true:

- this authorization PR has an independent docs-only exact-head `ACCEPT`;
- plan commit/parent/path/blob exactly match this brief;
- implementation branch and implementation PR are absent before authorized creation;
- exact writer and exclusive mode are available;
- complete open-PR registry and changed-filename retrieval succeed;
- no other writer, PR, file or semantic overlap exists;
- repository/root/ref/local-ref/worktree/cleanliness/remote observations are complete and PASS;
- exact source/test blobs remain unchanged;
- no excluded boundary or product status has changed;
- baseline measurement can use the same frozen environment, state, commands and method as the pilot.

## 12. Stop conditions

Stop with zero additional implementation mutation if:

- any frozen identity drifts;
- the first regression does not fail for the stated deterministic reason;
- another path, owner or writer is needed;
- any automatic-rejection category becomes relevant;
- focused or PR verification is RED;
- environment or measurement comparability fails;
- any source/test/evidence/status claim cannot be directly verified;
- repair, evidence or acceptance would require a new commit outside a separately approved boundary;
- Pilot B, another package, product acceptance, canonical status change or merge would need authorization.

No remediation commit, widened allowlist, alternate branch, rebase, amend, squash or force-push is authorized by this brief.

## 13. Independent acceptance boundary

The independent auditor reviews the final docs-only authorization PR head, this immutable brief, its bound plan identity and the append-only HANDOFF record. Allowed authorization verdicts are governed by the existing independent process. Only exact-head `ACCEPT` activates the permission to perform fresh preflight and baseline measurement; it does not accept the future repair, Pilot A result, product owner, Pilot B or `EWF-00`.

This brief remains `NOT_ACCEPTANCE` and creates no canonical status effect.