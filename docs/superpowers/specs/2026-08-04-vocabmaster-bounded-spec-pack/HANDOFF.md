# VocabMaster Bounded Specification Pack — Handoff

Handoff status:
`DOCS_REVIEW_COMPLETE / EWF_ARTIFACT_ACCEPTED_MERGED / EWF_PREFLIGHT_IMPLEMENTATION_AUTHORIZED`

This handoff records the independently reviewed frozen specification pack, the
accepted and merged EWF artifact-contract slice, and one newly frozen
implementation authorization for `EWF00-PREFLIGHT-001`.

It is not package-level acceptance for EWF-00, does not authorize either pilot,
does not change product behavior or canonical status, and does not authorize
merge of a future implementation without a fresh exact-head independent audit.

## Frozen specification-pack identity

| Field | Value |
|---|---|
| Subject commit | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Subject parent | `31c3c8a73363d3c88cb0719d799f597b3d381467` |
| Subject message | `docs: add coverage matrices and delivery wave drafts` |
| Original pack branch | `codex/canonical-reconciliation-spec-pack` |
| Architecture baseline | `adc3726620f4badddb16309e375f8f17b6af1404` |
| Independent documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |

The frozen subject remains unchanged. Review, implementation authorization and
acceptance records are later artifacts bound to exact commits rather than edits
that rewrite the frozen spec labels in place.

## Canonical authority and status boundary

Canonical authority remains exclusively:

- `AGENTS.md`;
- `docs/ROADMAP.md`;
- `docs/IMPLEMENTATION_PLAN.md`;
- `docs/IMPLEMENTATION_STATUS.md`;
- `docs/DECISIONS.md`.

This handoff is subordinate planning metadata. It cannot create or mutate
package status, acceptance or release safety.

Canonical status remains unchanged:

```text
EWF-00 = PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED
```

LI-00, SRC-00, ERR-00 and QAR-00 also remain
`PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`. The U-* identifiers remain grouping
labels only.

## EWF00-ARTIFACTS-001 — accepted and merged predecessor slice

| Record | Exact identity |
|---|---|
| Implementation plan predecessor | `1ce97fc99f2b430839bdaa693639ef9d71277b62` |
| Frozen authorization | `a1e3433d13936b392919648fcf4b9ab024178303` |
| Accepted implementation subject | `dc3aa8aa8084abee6819ffcbc238bd7e6f483b6c` |
| Accepted implementation parent | `b85212abcd2a1a4597ae95fdf64221f62377d9ed` |
| Accepted evidence HEAD | `826dbe9027325c350b0b734a3861e0dfa038e0cd` |
| Implementation CI | Run `30895237553` / #275 — PASS |
| Evidence CI | Run `30898238083` / #276 — PASS |
| Independent frozen-brief audit | `ACCEPT` at evidence HEAD `826dbe9027325c350b0b734a3861e0dfa038e0cd` |
| Pull request | PR #16 — merged |
| Main merge commit | `474bde8e3c7b09f757e7df4a1587f8a71b2e7865` |

`EWF00-ARTIFACTS-001` is the accepted implementation dependency for the next
adapter slice. Its accepted canonicalization, digest, validation, redaction and
frozen-evidence contracts must be reused rather than copied or reopened.

The accepted artifact slice does not by itself accept EWF-00.

## EWF00-PREFLIGHT-001 — frozen implementation authorization

| Record | Exact identity/effect |
|---|---|
| Bounded spec | `EWF00-PREFLIGHT-001` at frozen subject `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Plan commit / approved implementation predecessor | `8828715ae1f636aa07d6a740724b9706d23923c1` |
| Plan path | `docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md` |
| Frozen authorization commit | `b7fd2eadfccee6d694bd4bc0c8deaeb790f53105` |
| Frozen authorization path | `docs/superpowers/briefs/2026-08-04-ewf00-preflight-verification-trace-mvp-authorization.md` |
| Required implementation branch | `chatgpt/ewf-00-preflight-verification-trace-mvp` |
| Writer topology | One declared writer; reviewers/subagents read-only |
| Implementation effect | Authorized only within the exact four-file allowlist and frozen gates below |

The source implementation branch must be created from exact plan commit
`8828715ae1f636aa07d6a740724b9706d23923c1`, not from the authorization or
handoff commit. The frozen brief is consumed as read-only authorization evidence
from exact commit `b7fd2eadfccee6d694bd4bc0c8deaeb790f53105`.

No implementation branch is created by this handoff.

## Exact implementation allowlist

Only these paths are authorized for the future implementation subject:

```text
.specify/templates/ewf/preflight-result.template.json
.specify/templates/ewf/trace-manifest.template.json
scripts/ewf-preflight-trace.mjs
tests/ewf-preflight-verification-trace.test.mjs
```

`scripts/ewf-artifacts.mjs` is explicitly excluded. The new adapter must import
its accepted `COMMAND_RESULTS`, canonicalization, digest, base validation,
frozen-brief validation and portable-redaction exports rather than duplicate
those responsibilities.

Every path outside the four-file allowlist is unauthorized.

## Explicit implementation exclusions

The authorization does not permit changes to:

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

It also excludes product behavior, package/status mutation, acceptance verdict
generation, CI changes, dependencies, installers, Spec Kit initialization,
automatic test discovery, retry, remediation, workflow runtime, DAG, scheduler,
queue, daemon, dashboard, pilots and package-level acceptance.

## Frozen implementation scope

The future slice may implement only:

1. read-only fail-before-write checks for repository, exact HEAD/parent, branch,
   worktree, clean state, explicit writer, active change registry, declared
   file/semantic overlap, exact-literal canonical entry gates, allowlist and
   exclusions;
2. ordered execution of exact declared `argv`/cwd/environment/time-budget
   commands with no shell, retry, discovery, expansion or installation;
3. five-state command evidence: `PASS`, `FAIL`, `ERROR`, `NOT_RUN`,
   `NOT_AVAILABLE`, where timeout/crash/infrastructure is `ERROR`;
4. minimum `requirement → test → command → evidence` trace validation;
5. frozen-handoff identity/completeness checks for subject, parent, spec revision,
   trace/evidence/brief digests, allowlist/exclusions and required results;
6. deterministic diagnostics/digests and portable secret/private-path redaction.

Semantic overlap may be computed only from declared conflict keys and registered
active change-set evidence. The adapter must not infer package ownership or
semantic independence.

## Frozen verification profiles

### Focused — all required, exact order

```powershell
node --test tests/ewf-preflight-verification-trace.test.mjs
node scripts/ewf-artifacts.mjs --check
node --check scripts/ewf-preflight-trace.mjs
node --check tests/ewf-preflight-verification-trace.test.mjs
git diff --check
```

### PR — all required, exact order

```powershell
npm test
npm run check
npm run audit:roadmap
npm run build
```

No CI edit or new check is authorized. Missing tools/dependencies must be
reported honestly and must not be installed under this authorization.

## Required negative evidence

The future focused suite must cover wrong HEAD/parent/ref, dirty tracked and
untracked state, wrong repository/root/worktree/branch, missing or mismatched
writer/registry, declared file and semantic overlap, broken canonical entry
gate, duplicate requirement/test/command/evidence IDs, broken references,
missing required command/evidence, required `NOT_RUN`/`NOT_AVAILABLE`, subject/
parent/spec/trace/evidence/brief mismatch, optional tool unavailable, required
tool unavailable, normal test failure, timeout, crash, infrastructure error,
Spec Kit absence, deterministic diagnostics, secret/private-path redaction and
rollback to accepted manual canonical commands.

All repository/filesystem fixtures must be temporary and disposable. They may
not dirty or clean the user's implementation worktree.

## Evidence and acceptance topology

The final implementation subject must contain only the four authorized
implementation paths. Evidence must not be committed into that subject.

After the exact implementation subject and required CI are green:

1. obtain a separate evidence-only revision authorization;
2. bind implementation subject, parent, frozen spec revision, exact allowlist and
   exclusions, trace/evidence/brief digests and all required command results;
3. keep the implementation report labeled
   `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`;
4. do not let the implementer write `ACCEPT`;
5. run CI on the evidence HEAD;
6. use a separate read-only auditor at the exact frozen identity;
7. merge only after that auditor issues `ACCEPT`.

A later evidence-only authorization may permit only:

```text
docs/superpowers/evidence/2026-08-04-ewf00-preflight-001/implementation-report.json
docs/superpowers/evidence/2026-08-04-ewf00-preflight-001/requirement-trace.json
docs/superpowers/evidence/2026-08-04-ewf00-preflight-001/frozen-acceptance-brief.json
```

Passing and accepting `EWF00-PREFLIGHT-001` still does not accept EWF-00.

## EWF00-PILOTS-001 remains unauthorized

No small-repair pilot and no bounded product-package pilot is authorized by this
handoff. Both require separate exact predecessors, owners, allowlists, product
boundaries, evidence packages and independent audits.

EWF-00 package-level acceptance remains blocked on both separately authorized
pilots, measured overhead and an independent package-level audit.

## Other package/spec effects

- LI-00, SRC-00, ERR-00 and QAR-00 specs remain reviewed but not implementation
  authorized.
- All eight coverage matrices remain honest gap ledgers with
  `DRAFT_PENDING_CANONICAL_REBIND` status.
- All future-boundary drafts remain noncanonical and require just-in-time
  ratification/rebind.
- The implementation queue remains sequencing guidance, not a status ledger.
- No Phase 4/5 status, P5-05 history, ADR-042 or product acceptance is changed.

## Known open conditions retained

- `CANONICAL_CONFLICT — NEEDS_SEPARATE_RESOLUTION`: the P3-02 Shadowing
  receipt/evidence mismatch remains unresolved. The preflight/trace slice must
  not depend on or resolve it.
- Full IELTS profile/inventory, productive-practice, personal-content and
  assessment/readiness ownership remain deliberately uncanonicalized.
- Phase 4 and Phase 5 evidence remains preserved without reinterpretation as
  package acceptance.

## Stop conditions for the future coding agent

Do not start or continue implementation when any condition is true:

- HEAD is not `8828715ae1f636aa07d6a740724b9706d23923c1`;
- branch is not `chatgpt/ewf-00-preflight-verification-trace-mvp`;
- worktree is dirty before the first write;
- repository, worktree, writer, active registry or frozen brief is missing or
  mismatched;
- another active writer overlaps an authorized path or semantic conflict key;
- canonical EWF package/dependency evidence conflicts or cannot be checked by
  exact declared evidence;
- any required file falls outside the four-file allowlist;
- `scripts/ewf-artifacts.mjs`, an accepted template/test, canonical doc, product
  source, CI, package manifest, lockfile or dependency must change;
- ownership, status, acceptance or semantic independence would need inference;
- implementation expands into discovery, retry, remediation, initializer,
  workflow runtime, DAG, scheduler, queue, daemon or dashboard;
- a binary/dependency/tool would need installation or auto-download;
- package/status/acceptance/release verdict generation would be required;
- the P3-02 Shadowing conflict or either EWF pilot enters scope.

On a stop condition, do not rebase, select a newer predecessor, widen the
allowlist or modify canonical docs. Report the blocker and request a replacement
frozen authorization.

## Authorized immediate successor

The only authorized source successor is:

```text
branch: chatgpt/ewf-00-preflight-verification-trace-mvp
exact predecessor: 8828715ae1f636aa07d6a740724b9706d23923c1
plan: docs/superpowers/plans/2026-08-04-ewf-00-preflight-verification-trace-mvp.md
authorization: docs/superpowers/briefs/2026-08-04-ewf00-preflight-verification-trace-mvp-authorization.md
```

No implementation branch, source code, pilot work or package-level acceptance is
created by this documentation handoff.
