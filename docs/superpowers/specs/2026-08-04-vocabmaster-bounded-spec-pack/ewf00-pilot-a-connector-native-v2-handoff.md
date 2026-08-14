# EWF00-PILOT-A-001 Connector-Native V2 Handoff

Handoff status: `DOCS_PREPARED / INDEPENDENT_AUDIT_REQUIRED / NOT_ACCEPTANCE`

## 1. Purpose

This companion handoff records a docs-only replacement execution authorization for the already selected `EWF00-PILOT-A-001` small-repair candidate. It replaces only the unavailable local-checkout/worktree execution substrate with GitHub connector mutations plus the existing GitHub Actions workflow.

It does not implement the repair, create the implementation branch, execute the pilot, create pilot evidence, authorize Pilot B, accept the repaired product package, accept `EWF-00`, change canonical status or merge any PR.

The central bounded-spec `HANDOFF.md` is intentionally unchanged. This companion file avoids full-file reconstruction and preserves all historical wording byte-for-byte.

## 2. Exact authorization topology

| Field | Exact value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Pilot | `EWF00-PILOT-A-001` |
| Candidate | `P1-07-TODAY-NONFINITE-ESTIMATE-001` |
| Canonical owner | `P1-07 Today Composer` |
| Authorization base main | `7dd847cc9da2f5595430e20f864c211f3ec5ddfb` |
| Authorization branch | `chatgpt/ewf-00-pilot-a-connector-native-v2-authorization` |
| Plan path | `docs/superpowers/plans/2026-08-06-ewf-00-pilot-a-small-repair-connector-native-v2.md` |
| Plan commit / future implementation predecessor | `ce5a6cf1f0bbdf3426a246423c353e5f60cf8640` |
| Plan parent | `7dd847cc9da2f5595430e20f864c211f3ec5ddfb` |
| Plan blob | `5d7a95bc0944d926a8e3dcbb8b59f6c068c867f6` |
| Authorization brief path | `docs/superpowers/briefs/2026-08-06-ewf00-pilot-a-small-repair-connector-native-v2-authorization.md` |
| Authorization brief commit | `d55d45e98b6f277dcaea1e791c1d146b067fa433` |
| Authorization brief parent | `ce5a6cf1f0bbdf3426a246423c353e5f60cf8640` |
| Authorization brief blob | `f9fc9b29f84ec0cfa8ed39c63a8e808c864d38cc` |
| Future implementation branch | `chatgpt/ewf-00-pilot-a-small-repair-connector-native-v2` |
| Designated writer | `chatgpt-github-ewf00-pilot-a-primary-writer` |
| Writer mode | `exclusive` |
| Execution substrate | `GitHub connector + existing GitHub Actions` |

The implementation branch may start only from exact plan commit `ce5a6cf1f0bbdf3426a246423c353e5f60cf8640` after a fresh independent docs-only exact-head `ACCEPT` on the final authorization PR and a fresh Connector Governance Stage 0 `PASS`.

## 3. Preserved historical authorization

PR #26 remains historical, open, Draft, unmerged and unchanged.

```text
PR: #26
base SHA: 7dd847cc9da2f5595430e20f864c211f3ec5ddfb
head SHA: 94e8d9919caf92e9d49509a5b770f4ee43aa2ed7
independent comment ID: 5198006544
verdict: ACCEPT
```

PR #26 remains evidence of candidate selection, product-owner binding, two-file allowlist, local-worktree authorization and the later `PILOT_A_EXECUTION_SUBSTRATE_UNAVAILABLE` stop. It does not by itself authorize connector-native implementation.

Upon independent exact-head acceptance of this v2, v2 supersedes PR #26 only for execution-substrate authority.

## 4. Candidate and implementation boundary

Selection-time blobs remain:

```text
src/today-composer.js
d63a76c3698fe572790914e687443ee38e6842b2

tests/today-composer.test.mjs
787b4cb0c1b845aefba4c83eafe5380396f4251a
```

The defect remains:

```text
truthy non-numeric estimatedSeconds -> NaN
NaN bypasses a consumed time-budget comparison
aggregate estimatedSeconds becomes non-finite
```

Exact future implementation allowlist:

```text
tests/today-composer.test.mjs
src/today-composer.js
```

No third path, dependency, CI, schema, durable-data, security/privacy/rights, provider/network, concurrency, crash/recovery, canonical status, Pilot B or package-acceptance change is authorized.

## 5. Remote Stage 0

Stage 0 must fresh-read exact repository, main, plan identity, final v2 authorization PR, historical PR #26 and comment `5198006544`, implementation branch/PR absence, source/test blobs, complete open-PR registry, complete changed filenames, owner, candidate and writer declarations.

Only exact PR #26 and the exact final accepted v2 authorization PR may be exempted from overlap blocking. Every other open PR is retained.

Stage 0 is GitHub metadata evidence only. It cannot claim local repository root, local HEAD/ref/index/worktree state, cleanliness, worktree registry or local command execution.

## 6. Connector-native baseline

The final v2 authorization PR exact-head CI is the executable baseline because the authorization delta is docs-only and both implementation blobs remain unchanged.

Baseline must bind:

```text
workflow ID: 322561862
event: pull_request
base SHA: 7dd847cc9da2f5595430e20f864c211f3ec5ddfb
head SHA: exact final v2 authorization head
conclusion: success
source blob: d63a76c3698fe572790914e687443ee38e6842b2
test blob: 787b4cb0c1b845aefba4c83eafe5380396f4251a
```

Record only values exposed by GitHub workflow metadata, steps, logs and artifacts. Missing values are `NOT_EXPOSED` or `NOT_AVAILABLE`, never inferred.

## 7. Test-first execution sequence

Commit A:

```text
message: test(today): reproduce non-finite estimate budget bypass
parent: ce5a6cf1f0bbdf3426a246423c353e5f60cf8640
changed path only: tests/today-composer.test.mjs
```

Open a Draft implementation PR. Exact-head CI must produce a natural RED caused by the frozen non-finite estimate defect. Invalid or missing RED stops before source modification.

Commit B, only after valid RED:

```text
message: fix(today): keep activity estimates finite
parent: exact Commit A
changed path only: src/today-composer.js
```

The minimal repair converts once, uses the existing 60-second default for non-finite values and retains the existing `[10, 900]` clamp for finite values. Exact-head CI must be GREEN.

No amend, squash, rebase, force-push or history rewrite is authorized.

## 8. Measurement and evidence

Measure connector-native Stage 0 operation count/time, Commit A/B preparation operations, CI run/job/step durations when exposed, diagnostic review time, rework rounds and CLI-absent friction.

No arbitrary threshold is set. Timing comparison is invalidated if exposed runner/environment facts materially differ.

Evidence files require separate evidence-only authorization after the final exact implementation subject and GREEN CI exist. Implementer evidence remains `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

## 9. Authority boundary

This handoff does not:

```text
accept Pilot A
accept P1-07 or another product package
authorize Pilot B
accept EWF-00
change canonical package status
authorize LI-00, SRC-00, ERR-00 or QAR-00
change ROADMAP or dependencies
merge PR #26 or the v2 authorization PR
```

Effective state remains:

```text
EWF00-PILOT-A-001: CONNECTOR_V2_AUTHORIZATION_PENDING_INDEPENDENT_AUDIT
EWF00-PILOTS-001: NOT_COMPLETED
Pilot B: UNAUTHORIZED
EWF-00: IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED
```

## 10. Stop boundary

Stop with zero further mutation on identity drift, missing independent v2 `ACCEPT`, historical PR #26 drift, incomplete registry/comment/file retrieval, branch collision, writer or semantic overlap, source/test blob drift, invalid/missing natural RED, need for an excluded path/category, unavailable exact-head CI evidence or any required false claim.

This companion handoff remains subordinate docs-only authorization and `NOT_ACCEPTANCE`.