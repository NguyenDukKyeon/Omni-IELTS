# EWF00-ARTIFACTS-001 — Frozen Implementation Authorization Brief

Brief status: `FROZEN / IMPLEMENTATION_AUTHORIZED`

This brief authorizes one bounded implementation task. It does not accept
EWF-00, authorize another EWF spec, change canonical package status or authorize
product behavior.

## Exact identity

| Field | Value |
|---|---|
| Repository | `NguyenDukKyeon/VocabMaster` |
| Canonical package | `EWF-00` |
| Authorized spec | `EWF00-ARTIFACTS-001` |
| Frozen spec subject | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Independent review record | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` |
| Approved implementation predecessor | `1ce97fc99f2b430839bdaa693639ef9d71277b62` |
| Required implementation branch | `chatgpt/ewf-00-artifact-contracts-mvp` |
| Implementation plan | `docs/superpowers/plans/2026-08-04-ewf-00-artifact-contracts-mvp.md` at predecessor |
| Writer model | One writer; read-only reviewers do not edit the implementation branch |
| Canonical status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |

The implementation branch must be created from the exact predecessor above. A
newer branch head, rebased lineage, dirty worktree, different repository or
changed spec/plan invalidates this brief and requires a replacement brief.

## Authorized objective

Implement the minimum subordinate artifact contracts described by
`EWF00-ARTIFACTS-001`:

- minimal constitutional bridge;
- change-set, lightweight-repair, spec-metadata, verification-manifest,
  implementation-report, frozen-brief and audit-result templates;
- deterministic artifact canonicalization/digests;
- artifact validation and forbidden-authority checks;
- portable secret/private-path redaction;
- read-only `--check` mode that works without Spec Kit CLI.

This task is an artifact-shape and validation slice only.

## File write allowlist

Exactly these paths may be created or modified:

```text
.specify/memory/constitution.md
.specify/templates/ewf/change-set.template.json
.specify/templates/ewf/lightweight-repair.template.json
.specify/templates/ewf/spec-metadata.template.json
.specify/templates/ewf/verification-manifest.template.json
.specify/templates/ewf/implementation-report.template.json
.specify/templates/ewf/frozen-acceptance-brief.template.json
.specify/templates/ewf/audit-result.template.json
scripts/ewf-artifacts.mjs
tests/ewf-artifact-contracts.test.mjs
```

A later evidence-only handoff revision may add an implementation report, trace
and brief under an explicitly approved evidence path, but that evidence revision
is not part of the implementation subject and cannot alter source behavior.

## Explicit exclusions

The implementation must not modify:

```text
AGENTS.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
src/**
server/**
public/**
.github/**
package.json
package-lock.json
```

It must not:

- install or update a dependency;
- run a Spec Kit initializer;
- implement Git/worktree preflight or overlap discovery;
- execute arbitrary verification commands from manifests;
- build a general trace graph, workflow runtime, scheduler, retry engine,
  dashboard, daemon, CI integration, mutation suite or broad fuzz system;
- write package status, acceptance or release-safety verdicts;
- authorize a product package or pilot;
- change Phase 4/5 or P3-02 records.

## Required acceptance criteria

1. The constitution uses repository-relative links to the five canonical sources,
   declares itself noncanonical/non-acceptance and copies no status, dependency,
   acceptance checklist, Definition of Done or ADR body.
2. Every template is versioned, identifies its artifact kind and carries a clear
   subordinate authority label.
3. Lightweight repair validation fails unless every eligibility predicate is
   explicitly satisfied.
4. Spec metadata requires an existing canonical package reference and
   namespaced, non-duplicated requirement identifiers.
5. Implementation reports are always labeled
   `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.
6. Command results preserve exactly `PASS`, `FAIL`, `ERROR`, `NOT_RUN` and
   `NOT_AVAILABLE`.
7. Audit-result templates accept only `ACCEPT`, `REJECT` and
   `BLOCKED_BY_INVALID_BRIEF`; implementation code never invents a verdict.
8. Canonicalization and SHA-256 digests are deterministic for logically equal
   JSON values.
9. Changing subject, parent, spec revision, trace digest, evidence digest or
   brief identity invalidates the frozen brief.
10. Secret values and machine-absolute private paths are redacted from portable
    output while safe repository-relative paths remain.
11. `node scripts/ewf-artifacts.mjs --check` works when Spec Kit CLI is absent and
    performs no writes or installations.
12. Removing only the authorized new EWF files restores the prior manual workflow
    without changing product or canonical data.

## Required verification profiles

### Focused profile

```powershell
node --test tests/ewf-artifact-contracts.test.mjs
node scripts/ewf-artifacts.mjs --check
npm run audit:roadmap
git diff --check
```

### PR profile

```powershell
npm test
npm run check
npm run audit:roadmap
npm run build
```

Every command must record actual environment, duration, exit code and one of the
five result states. Missing installed dependencies are `NOT_AVAILABLE` or
`ERROR`, never a pass. The implementer must not install dependencies unless a
new authorization explicitly permits it.

## Required negative evidence

- bridge containing copied package status or acceptance checklist is rejected;
- unknown authority/status/verdict top-level field is rejected;
- duplicate requirement ID is rejected;
- incomplete draft cannot become `HANDOFF_READY`;
- invalid command/audit result vocabulary is rejected;
- digest and subject/spec mismatch invalidate the brief;
- Windows/POSIX private absolute paths and secret-shaped fields are redacted;
- absent `specify` executable does not break core checks;
- `--check` causes zero repository writes.

## Stop conditions

Stop before writing or immediately abandon the subject if:

- HEAD is not the exact predecessor;
- the implementation branch name differs;
- the worktree is dirty before the first write;
- another writer overlaps `.specify/**`, `scripts/ewf-artifacts.mjs` or the EWF
  test boundary;
- implementation requires a file outside the allowlist;
- a canonical conflict must be reconciled;
- a dependency or CI change appears necessary;
- validation would need to infer package status or product correctness;
- the scope expands into EWF preflight/trace/pilots or product behavior.

## Handoff and audit boundary

The implementation subject is the exact commit containing only the authorized
artifact code/tests/templates. Implementer verification is handoff evidence, not
acceptance. A later frozen evidence package must bind subject, parent, spec
revision, trace digest, evidence digest and brief digest. A separate read-only
auditor owns the verdict.

Even a successful implementation leaves EWF-00 not accepted. Package acceptance
still requires the separately authorized preflight/verification/trace slice,
one eligible small-repair pilot, one bounded spec-level pilot, measured overhead
and independent package-level audit.
