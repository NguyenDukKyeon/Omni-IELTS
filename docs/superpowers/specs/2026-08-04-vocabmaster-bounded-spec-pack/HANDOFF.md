# VocabMaster Bounded Specification Pack — GitHub Connector Authorization Handoff

Handoff status: `DOCS_PREPARED / CONNECTOR_AUTHORIZATION_V3_PENDING_INDEPENDENT_AUDIT / NOT_ACCEPTANCE`

This handoff preserves the frozen bounded specification pack and the accepted `EWF00-ARTIFACTS-001` slice while recording a replacement connector-native authorization for `EWF00-PREFLIGHT-001`. It does not implement source, create an implementation branch, open an implementation pull request, change CI/dependencies/canonical status, authorize pilots, merge or close PR #20, or issue implementation/package acceptance.

## 1. Canonical authority and frozen subject

Canonical authority remains solely:

```text
AGENTS.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
```

| Field | Exact value |
|---|---|
| Frozen bounded-spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Frozen subject parent | `31c3c8a73363d3c88cb0719d799f597b3d381467` |
| Architecture baseline | `adc3726620f4badddb16309e375f8f17b6af1404` |
| Independent bounded-spec documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Exact main baseline | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |

The bounded specs, matrices, future-boundary drafts, implementation queue, plans, briefs, handoffs, pull-request records, GitHub metadata, CI evidence, and audit comments remain subordinate. They cannot replace canonical package ownership, dependency, status, release-safety, or acceptance authority.

## 2. Preserved accepted EWF artifact slice

| Field | Exact value |
|---|---|
| Accepted slice | `EWF00-ARTIFACTS-001` |
| Accepted implementation subject | `dc3aa8aa8084abee6819ffcbc238bd7e6f483b6c` |
| Accepted evidence HEAD | `826dbe9027325c350b0b734a3861e0dfa038e0cd` |
| Artifact merge / current main | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Effect of this handoff | preservation only; no artifact implementation/template/test mutation |

The connector-native preflight authorization must reuse accepted artifact exports from `scripts/ewf-artifacts.mjs` and must not modify that file or the existing accepted EWF artifact templates/tests.

Required reused exports are:

```text
COMMAND_RESULTS
canonicalizeArtifact
digestArtifact
validateArtifact
validateFrozenBrief
redactPortableValue
```

Direct `node:crypto` import and a duplicate digest, canonicalization, or portable-redaction implementation remain forbidden.

## 3. Connector authorization v3 exact identity

| Field | Exact value |
|---|---|
| Package / bounded spec | `EWF-00` / `EWF00-PREFLIGHT-001` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Authorization branch | `chatgpt/ewf-00-preflight-trace-authorization-v3` |
| Exact plan path | `docs/superpowers/plans/2026-08-05-ewf-00-preflight-verification-trace-github-connector-mvp.md` |
| Exact plan commit / approved implementation predecessor | `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` |
| Exact plan parent | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |
| Exact plan blob | `169fd852f1fa6620d450a0284eb02789f1ce634f` |
| Frozen authorization brief path | `docs/superpowers/briefs/2026-08-05-ewf00-preflight-verification-trace-github-connector-authorization.md` |
| Frozen authorization brief commit | `57b1f81c31d7bc629c574020c27b33dfbd473d21` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Designated writer | `chatgpt-github-ewf00-preflight-primary-writer` |
| Writer mode | `exclusive` |
| Execution substrate | `GitHub connector + existing GitHub Actions` |
| Package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

Commit `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` must remain a direct child of exact main and must change only the exact plan path. The plan at that commit must remain exact blob `169fd852f1fa6620d450a0284eb02789f1ce634f`. Commit `57b1f81c31d7bc629c574020c27b33dfbd473d21` must remain a direct child of the plan commit and must change only the frozen authorization brief path.

Any rewritten SHA, different parent, different plan blob/path, abbreviated SHA, squash, rebase, or force-push invalidates this handoff.

## 4. Effectiveness and PR #20 relationship

Authorization v3 is not effective before a fresh independent docs-only audit returns `ACCEPT` on the exact final v3 authorization PR head.

Before that exact-head verdict:

- do not create `chatgpt/ewf-00-preflight-verification-trace-mvp`;
- do not write any implementation source/template/test file;
- do not open an implementation PR;
- do not supersede PR #20;
- do not claim implementation or package acceptance.

PR #20 remains the historical Draft local-worktree authorization until v3 receives fresh independent exact-head `ACCEPT`. This v3 handoff does not edit, rewrite, add commits to, mark ready, merge, or close PR #20.

After fresh exact-head `ACCEPT`:

- v3 supersedes PR #20 only as the active execution substrate;
- PR #20 remains historical, open, Draft, unmerged, and unchanged unless separately governed;
- the future connector Stage 0 still re-enumerates all open PRs and fails closed on any retained file/spec/semantic/branch/writer overlap.

The v3 docs audit verdict is authorization acceptance only. It is not implementation acceptance and not `EWF-00` package acceptance.

## 5. Exact future implementation allowlist

Only these four paths may be created or modified by the future implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

Everything else is unauthorized, including:

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
scripts/ewf-artifacts.mjs
existing accepted EWF templates/tests
evidence/report files in the implementation subject
dependencies
CI
product behavior
pilots
P3-02
package status
acceptance verdicts
```

## 6. Connector-native Stage 0 handoff

Stage 0 uses GitHub repository/API evidence only. It must explicitly record that no local index, symbolic ref, worktree, local Git ref, local clean-tree evidence, or local command execution is observed or claimed. It must not reuse the local bootstrap contract of PR #20.

Stage 0 binds exactly:

- repository `NguyenDukKyeon/VocabMaster`;
- default/base branch `main`;
- main SHA `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- plan commit `42bf5bdb782984d0ed662202d1b5a9a3d5066d43`;
- plan parent `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- plan path and blob `169fd852f1fa6620d450a0284eb02789f1ce634f`;
- implementation branch absence;
- implementation PR absence;
- authorization PR state and exact audited head;
- complete open-PR registry;
- writer `chatgpt-github-ewf00-preflight-primary-writer / exclusive`;
- exact four-file allowlist;
- semantic-conflict keys;
- canonical entry gates;
- no source/CI/dependency/status/pilot/acceptance mutation.

Semantic-conflict keys are exactly:

```text
ewf:preflight-observation
ewf:verification-execution
ewf:trace-validation
ewf:frozen-handoff-validation
```

### Remote active-change registry

Before branch creation, enumerate every open PR and read its number, state, draft state, head branch, head SHA, body, and complete changed-filename list. Exclude only the v3 authorization PR whose exact head was independently audited. Retain every other open PR, including historical authorization PRs.

Block if another open PR:

- changes an implementation allowlist path;
- declares `EWF00-PREFLIGHT-001`;
- declares a semantic-conflict key;
- uses the implementation branch;
- declares the designated writer;
- has unclear writer ownership for the same scope.

Do not infer semantic independence from branch/file names, Draft status, historical intent, or an earlier verdict. If registry enumeration, pagination, body retrieval, or changed-filename retrieval is incomplete, fail closed.

At docs-preparation time, PR #18 and PR #20 were open Draft documentation authorizations declaring `EWF00-PREFLIGHT-001`. This observation is not reusable as future Stage 0 evidence. Future Stage 0 must re-enumerate current state and will remain blocked while retained open PRs satisfy the frozen overlap rule. This handoff authorizes no mutation of those PRs.

## 7. Sole authorized branch mutation

Only after fresh v3 exact-head docs `ACCEPT` and connector Stage 0 `PASS`, create:

```text
branch: chatgpt/ewf-00-preflight-verification-trace-mvp
source SHA: 42bf5bdb782984d0ed662202d1b5a9a3d5066d43
```

The connector response must bind the exact resulting ref/SHA. Do not create from main, an authorization PR head, PR #20, PR #18, another plan commit, or an abbreviated SHA.

If the branch exists, do not update, reuse, delete, force, or replace it. Stop. No alternate implementation branch, second writer branch, checkout, local worktree, local index, local ref, merge, rebase, reset, or force operation is authorized.

## 8. Connector write model

After branch creation:

- all writes use the GitHub connector;
- only the designated writer writes;
- reviewers/auditors remain read-only;
- re-read branch HEAD before every write;
- stop on unexpected branch-head movement;
- verify new-path absence before create;
- re-read existing path/blob before update;
- no parallel same-path writes;
- no overwrite of unread changes;
- read back commit parent, changed paths, branch SHA, and blob identities after each write.

Authorized remote proof is:

```text
exact branch-head lineage
exact direct parent per commit
exact per-commit changed paths
GitHub tree/blob identities
current-head compare
implementation PR diff containment
remote collision checks
existing GitHub Actions evidence at exact SHA
```

No local worktree cleanliness, local RED, or local GREEN may be claimed.

## 9. CI-driven TDD commits A–D

### Commit A

```text
message: test(ewf): define preflight verification trace contracts
parent: 42bf5bdb782984d0ed662202d1b5a9a3d5066d43
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

Open a Draft implementation PR after Commit A. Existing CI is expected RED only because the authorized implementation/templates are absent. Preserve exact run/job/step evidence. Do not add an artificial failing assertion merely to force RED.

### Commit B

```text
message: feat(ewf): add preflight verification trace templates
parent: exact Commit A
changed paths only:
  .specify/templates/ewf/preflight-result.template.json
  .specify/templates/ewf/trace-manifest.template.json
```

### Commit C

```text
message: feat(ewf): implement preflight verification trace adapter
parent: exact Commit B
changed path only: scripts/ewf-preflight-trace.mjs
```

### Commit D

```text
message: test(ewf): complete preflight verification trace matrix
parent: exact Commit C
changed path only: tests/ewf-preflight-verification-trace.test.mjs
```

Commit D completes the mandatory negative matrix and must receive GREEN existing CI at exact SHA. It is the implementation subject unless a separate, disclosed remediation commit is required.

Remediation commits must remain within the four paths, identify exact failed CI evidence, preserve failed runs, keep the PR Draft, and never squash or rewrite A–D.

## 10. Existing CI only

`.github/**` remains unchanged. At the frozen baseline the existing PR CI job executes:

```text
npm ci --no-audit --no-fund
python -m pip install --disable-pip-version-check yt-dlp
npm test
npm run check
npm run audit:roadmap
npm run audit:ielts
npm run test:v10
npm run audit:v10
npm run build
npm run phase4:verify
npm run phase5:verify
npm run test:serve
npm run test:preview
npm run test:browser
npm run test:ielts-browser
npm run test:v10-browser
npm run test:hardening
```

No standalone command may be claimed unless the CI log actually runs it. Focused EWF sub-gates must be embedded in the authorized test file and exercised through `npm test`, including artifact contract, adapter/test importability, forbidden `node:crypto`, duplicate digest/canonicalization/redaction detection, exact boundary metadata, negative fixtures, deterministic diagnostics, no retry/discovery/install/remediation, Spec Kit absence, and digest/redaction projections.

Evidence must distinguish declared focused sub-gates, actual CI commands, static GitHub diff/blob audit, and independent acceptance.

## 11. Verification and evidence handoff

`argv` remains execution authority; `command` remains display-only. Each declaration binds exact ID, profile, `argv`, cwd, environment, timeout, tool requirement, requirements, and `declarationDigest`. The manifest binds `verificationManifestDigest`.

Result states remain exactly:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

No retry, discovery, installation, remediation engine, green coercion, or nondeterministic ordering is permitted.

Portable content digest projection remains:

```text
normalize complete result
→ redactPortableValue
→ omit contentDigest
→ digestArtifact
→ attach contentDigest
→ serialize
```

GitHub connector/API metadata is not command-result evidence. GitHub metadata evidence and CI executable evidence remain separate provenance layers.

After final implementation subject and GREEN exact-SHA CI, evidence/report files require separate evidence-only revision authorization. Implementer evidence status is exactly `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` and must bind plan/brief/implementation identities, exact changed files, CI run/job IDs, trace/evidence/brief/manifest/declaration digests, GitHub metadata observations, and CI executable observations.

A fresh independent exact-head read-only audit owns the implementation verdict.

## 12. Effective package and successor status

- `EWF00-ARTIFACTS-001`: independently accepted and merged; preserved.
- `EWF00-PREFLIGHT-001`: connector authorization v3 prepared but not effective before fresh exact-head docs `ACCEPT`; not implemented and not accepted.
- `EWF00-PILOTS-001`: unauthorized.
- `EWF-00`: `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.
- LI-00, SRC-00, ERR-00, and QAR-00 remain unchanged.
- P3-02 and product work remain outside scope.

Passing the preflight slice will not accept `EWF-00`, authorize pilots, change canonical status, authorize product work, or merge any PR.

## 13. Stop conditions

Stop if:

- main differs from `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`;
- plan commit is not direct child `42bf5bdb782984d0ed662202d1b5a9a3d5066d43` of main;
- plan path/blob/parent mismatches;
- authorization brief commit is not `57b1f81c31d7bc629c574020c27b33dfbd473d21` with direct parent Commit 1;
- v3 lacks fresh independent exact-head docs `ACCEPT`;
- implementation branch exists;
- implementation PR exists;
- complete open-PR registry/changed filenames cannot be read;
- retained open PR file/spec/semantic/branch/writer overlap exists;
- writer differs from `chatgpt-github-ewf00-preflight-primary-writer`;
- a write needs a path outside the four-file allowlist;
- CI/dependency/package/canonical-doc/status change is required;
- accepted EWF artifact implementation/templates/tests must change;
- connector needs force/update/reuse/delete of an existing ref;
- branch HEAD differs from expected writer predecessor;
- required CI evidence is missing at exact SHA;
- a local-only claim is required;
- pilots, P3-02, product work, package status, release safety, or acceptance enters scope.

This handoff remains documentation-only and `NOT_ACCEPTANCE`.
