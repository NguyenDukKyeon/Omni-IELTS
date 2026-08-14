# EWF Pilot A — Eligible Small-Repair Authorization Plan

Status: `AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NO_IMPLEMENTATION / NO_PILOT_EXECUTION`

## 1. Authority and effect

This plan selects and freezes one candidate for the separately governed `EWF00-PILOT-A-001` workflow under `EWF00-PILOTS-001`. It authorizes no implementation by itself. It does not create the future implementation branch, write a regression test or source fix, execute the pilot, create pilot evidence, authorize Pilot B, accept the repaired product package, or accept `EWF-00`.

The authorization becomes effective only after an independent docs-only exact-head audit returns `ACCEPT` for the final authorization PR head. Even then, fresh preflight and baseline measurement must pass before the first implementation write.

Canonical state remains:

```text
EWF00-ARTIFACTS-001: ACCEPTED / INTEGRATED
EWF00-PREFLIGHT-001: ACCEPTED / INTEGRATED
EWF00-PILOTS-001: NOT_COMPLETED
EWF-00: IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED
Pilot B: UNAUTHORIZED
```

## 2. Frozen pilot identity

| Field | Exact value |
|---|---|
| Pilot specification | `EWF00-PILOTS-001` |
| Pilot ID | `EWF00-PILOT-A-001` |
| Candidate ID | `P1-07-TODAY-NONFINITE-ESTIMATE-001` |
| Candidate class | eligible small repair |
| Canonical product owner | `P1-07 Today Composer` |
| Existing accepted boundary | `P1-07 Today Composer` accepted at integrated Phase 1 main `9da21e1c3cb34b7372f1b33c541d7442dd0390c9` |
| Selection base | `7dd847cc9da2f5595430e20f864c211f3ec5ddfb` |
| Authorization branch | `chatgpt/ewf-00-pilot-a-small-repair-authorization` |
| Future implementation branch | `chatgpt/ewf-00-pilot-a-small-repair` |
| Designated writer | `chatgpt-github-ewf00-pilot-a-primary-writer` |
| Writer mode | `exclusive` |

The exact approved future implementation predecessor is the Git commit that adds only this plan path as a direct child of `7dd847cc9da2f5595430e20f864c211f3ec5ddfb`. The subsequent immutable authorization brief must bind that commit SHA, its direct parent, this path, and this file's blob SHA. The implementation branch must be created from that exact plan commit, never from `main` or the final authorization PR head.

## 3. Candidate statement and deterministic reproduction

### Bug statement

`src/today-composer.js` converts a truthy non-numeric `estimatedSeconds` value with `Number(...)` and immediately applies `Math.min`/`Math.max`. A value such as `"not-a-number"` therefore normalizes to `NaN`. After one valid activity consumes the available budget, the comparison `used + NaN > budgetSeconds` is always false, so the malformed activity bypasses the time-budget exclusion and then poisons the returned plan's aggregate `estimatedSeconds` with `NaN`.

Selection-time exact blobs:

```text
src/today-composer.js
d63a76c3698fe572790914e687443ee38e6842b2

tests/today-composer.test.mjs
787b4cb0c1b845aefba4c83eafe5380396f4251a
```

### Deterministic reproduction definition

At a fixed `now`, compose a one-minute plan with two valid exact-target due-review rows in deterministic due order:

1. first row: `estimatedSeconds = 60`;
2. second row: `estimatedSeconds = "not-a-number"`.

On the frozen selection source, the first row consumes 60 seconds. The second row becomes `NaN`; the budget comparison does not exclude it; both rows are selected; and the aggregate plan estimate becomes non-finite.

This reproduction is derived from exact repository bytes and ECMAScript numeric semantics. It was not executed during candidate selection because no supported exact-byte disposable materialization path was available. No executed-reproduction claim is made. After authorization acceptance and fresh preflight, the future writer must first encode this exact reproduction as a focused failing regression test before changing source. If it does not fail for the stated reason, classification has drifted and the pilot stops before source modification.

### Expected correct behavior

For candidate activity duration only:

- convert the supplied value to a number;
- when the result is not finite, use the existing default of `60` seconds;
- when finite, preserve the existing clamp to `[10, 900]` seconds;
- keep all selected activity estimates and the aggregate plan estimate finite;
- with the two-row reproduction and a 60-second budget, select only the first row and record the second as `time-budget` excluded.

No public API, contract shape, activity schema, scheduling authority, ordering rule, budget rule, durable record, or product capability may change.

## 4. Eligibility matrix

| Predicate | Result | Binding |
|---|---|---|
| Deterministic reproduction | PASS | fixed pure-function input and exact source expression; future first RED test frozen above |
| Existing acceptance boundary and owner | PASS | sole owner `P1-07 Today Composer`, accepted at `9da21e1c3cb34b7372f1b33c541d7442dd0390c9` |
| Focused regression test possible | PASS | existing `tests/today-composer.test.mjs` |
| No contract/public API change | PASS | internal numeric normalization only |
| No schema/migration change | PASS | no schema or migration path in allowlist |
| No durable-data semantic change | PASS | pure plan composition before persistence |
| No data-loss concern | PASS | no data write or deletion |
| No security/authentication concern | PASS | no security boundary |
| No privacy/consent concern | PASS | no personal/provider data boundary |
| No rights/publication concern | PASS | no content publication path |
| No external cost/provider call | PASS | pure local function |
| No dependency change | PASS | package manifests excluded |
| No concurrency change | PASS | no lock, lease, queue, race or async behavior |
| No crash/recovery change | PASS | no journal, restart or recovery behavior |
| No product-scope expansion | PASS | restores finite handling inside accepted behavior |
| No CI change | PASS | `.github/**` excluded |
| No broad refactor | PASS | one test file and one source file |
| Revert-bounded rollback | PASS | revert the two-file implementation delta |
| Small exact allowlist | PASS | exactly two paths |
| One writer owns semantic boundary | PASS | exclusive designated writer and one canonical owner |

Any later contradiction changes the result to `STOP / RECLASSIFY`, not a waived predicate.

## 5. Exact implementation allowlist

The future implementation subject may create or modify only:

```text
tests/today-composer.test.mjs
src/today-composer.js
```

The intended delta is one focused regression test plus the smallest source normalization necessary to satisfy it. No additional source path is pre-authorized.

## 6. Exact exclusions

Everything outside the two-path allowlist is unauthorized, including:

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
CI configuration
dependencies
schemas or migrations
durable storage or data semantics
backup/restore
outbox/reconciliation
process lifecycle
lease/fencing/concurrency
crash/recovery
provider/network calls
security/authentication
privacy/consent
rights/publication
new UI or product capability
canonical package/status/acceptance changes
Pilot B
P3-02
LI-00
SRC-00
ERR-00
QAR-00
```

No formatting sweep, rename, unrelated cleanup, refactor, generated file, dependency update, or opportunistic fix is authorized.

## 7. Required future verification profiles

### Focused profile

Run in this order and preserve actual outcomes and durations:

```text
node --test --test-name-pattern="non-finite estimatedSeconds" tests/today-composer.test.mjs
node --test tests/today-composer.test.mjs
node --check src/today-composer.js
node --check tests/today-composer.test.mjs
git diff --check -- tests/today-composer.test.mjs src/today-composer.js
```

The first command owns the new regression. The full test-file command reruns all existing Today Composer coverage. Syntax and static diff validation are mandatory for the changed JavaScript/MJS paths.

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

The existing GitHub Actions workflow is executable PR evidence. `.github/**` must remain unchanged. Any additional existing workflow steps remain evidence but do not expand implementation scope.

## 8. Baseline manual workflow

After independent authorization `ACCEPT`, create the future implementation branch only from the exact plan commit bound by the brief. Before any test/source write, use a clean state at that exact predecessor and perform the baseline workflow:

1. verify exact repository, HEAD, parent, branch, writer, single worktree, cleanliness, remote collision, complete open-PR registry, file overlap and semantic overlap;
2. verify the two selection-time source/test blobs remain exact at the approved predecessor;
3. manually restate the bug, owner, two-path allowlist, exclusions, stop conditions and rollback boundary without relying on generated acceptance/status authority;
4. execute the focused and PR command sets exactly as frozen;
5. record raw start/end times, command outcomes, operation counts and environment facts without changing repository files.

The baseline is the conventional manual workflow. The EWF-assisted pilot later uses the same repository state, environment class, command set and measurement method while adding only the authorized EWF preflight/artifact workflow. Baseline observations are not pilot success evidence and cannot change product status.

## 9. Measurement protocol

Baseline and pilot comparison must use one paired measurement batch with:

```text
OS/environment class: GitHub-hosted Ubuntu 24.04 / ubuntu-24.04 class
reference runner image: 20260720.247.2
Node reference: v22.23.1
npm reference: 10.9.8
repository state: exact approved plan commit, clean and unchanged before first implementation write
command set: exact focused and PR profiles above
clock: monotonic elapsed wall time around each declared boundary
```

At the start of both runs, record the actual OS image, Node and npm versions. They must match between baseline and pilot. If the hosted image or tool versions differ, invalidate the comparison and rerun both sides as a pair; do not normalize unlike environments after the fact.

Required observed metrics, with no arbitrary pass threshold:

| Metric | Frozen method |
|---|---|
| Focused command duration | monotonic start immediately before first focused command; end after static diff validation; also record each command separately |
| PR command duration | monotonic sum and per-command elapsed time; exclude workflow queue delay and runner provisioning |
| Preflight elapsed time | start at first repository/writer observation; end at immutable PASS/BLOCKED preflight result |
| Manual operation count | count one deliberate human/tool action that reads, records, validates or mutates one declared workflow state; freeze this definition for both runs |
| Artifact preparation operations | count each deliberate create/update/validate action for declaration, repair record, trace, report and brief; repository writes require their own later authorization |
| Validator duration | monotonic runtime for each existing EWF validator invocation |
| Diagnostic review time | start when validator output becomes available; end when classification is recorded |
| Rework/invalidation rounds | count each complete return from a finding or invalidated identity to a newly frozen candidate state, with cause |
| CLI-absent friction | count unavailable CLI functions and each extra manual operation required while Spec Kit CLI remains absent |

Every metric records observed value, unit, start/end, method, exclusions and raw evidence reference. No threshold is invented. Evidence-file creation or later evidence-only commits require separate authorization.

## 10. Rollback boundary

Rollback is a revert of the bounded future implementation subject affecting only:

```text
tests/today-composer.test.mjs
src/today-composer.js
```

There is no data migration, schema reversal, cleanup job, compatibility reader, dependency rollback, CI rollback or durable-state repair. The canonical manual workflow remains available before, during and after the pilot.

## 11. Stop conditions

Stop before the first implementation write, or stop and reclassify before any further write, if any of the following occurs:

- independent docs-only exact-head `ACCEPT` is absent or bound to another authorization head;
- main, plan commit, plan parent, plan path or plan blob differs from the frozen brief;
- the future implementation branch or implementation PR already exists before authorized creation;
- the designated writer is absent, non-exclusive or overlaps another writer;
- complete open-PR/file/semantic-overlap retrieval is unavailable or reveals overlap;
- repository/worktree/ref/cleanliness observations are incomplete or fail closed;
- either selection-time source/test blob differs at the approved predecessor;
- the first focused reproduction does not fail for the stated non-finite budget-bypass reason;
- the fix requires any path outside the two-file allowlist;
- the candidate touches contract/API/schema/migration/durable data/data loss/security/authentication/privacy/consent/rights/publication/external cost/dependency/concurrency/crash recovery/product scope or CI;
- a browser, timing, provider, network, database, process-lifecycle or nondeterministic condition becomes necessary;
- focused or PR verification is RED;
- baseline and pilot environment/repository/command/measurement identity differs;
- evidence or status claims would need to be invented;
- Pilot B, another package, canonical status, acceptance or merge would need authorization.

A stop is valid fail-closed pilot behavior. It does not authorize remediation, a wider implementation, Pilot B or `EWF-00` acceptance.

## 12. Authorization boundary

This plan freezes candidate selection only. Until the final authorization PR receives independent exact-head docs `ACCEPT`:

```text
EWF00-PILOT-A-001: AUTHORIZATION_PENDING_INDEPENDENT_AUDIT
EWF00-PILOTS-001: NOT_COMPLETED
Pilot B: UNAUTHORIZED
EWF-00: IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED
```

No implementation branch, source/test delta, pilot run, measurement result, pilot evidence, product-package acceptance, canonical status change or merge is authorized.