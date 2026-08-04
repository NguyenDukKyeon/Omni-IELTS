# EWF-00 — Preflight, Verification and Trace Validation

## Metadata

| Field | Value |
|---|---|
| Spec ID | `EWF00-PREFLIGHT-001` |
| Spec type | `feature` |
| Local spec status | `DRAFT` |
| Canonical package | `EWF-00` |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Implementation authorization | `NOT_GRANTED` |
| Architecture baseline | `docs/superpowers/specs/2026-08-04-engineering-workflow-foundation-design.md` at `adc3726620f4badddb16309e375f8f17b6af1404` |
| Canonical boundary | `docs/ROADMAP.md` EWF-00; `docs/IMPLEMENTATION_PLAN.md` EWF-00; ADR-044 |
| Dependency | EWF subordinate artifact schemas from `EWF00-ARTIFACTS-001`; no product-package dependency |
| Acceptance owner | Independent canonical auditor at the exact implementation commit |
| Requirement namespace | `EWF00-PVT-*` |

## Goal and acceptance boundary

Implement, in a separately authorized future change, a small project-owned
contract adapter that validates identity/scope before writes, runs only declared
verification commands, packages evidence and checks
`requirement → test → command → evidence` plus frozen-brief identity.

It is not a workflow runtime. It does not schedule a DAG, retry commands,
discover tests, select scope, remediate findings, mutate CI, install tools or
issue acceptance verdicts.

## Preflight contract

Preflight consumes an approved change-set declaration and read-only Git/filesystem
state. Before the first write it validates:

1. repository root and required canonical files;
2. exact HEAD equals approved predecessor and parent/ref observations remain
   consistent with the declaration;
3. the implementation worktree is clean and is the single declared worktree;
4. branch identity and remote target collision policy;
5. one writer owns every changed semantic boundary;
6. no active writer/worktree overlaps the declared files/subsystems;
7. dependency and package status entry gates are satisfied without inference;
8. allowlist/exclusions and safety approvals are complete.

Preflight produces a content-digested result with observation time, repository,
HEAD/parent, branch/worktree, writer, overlap inputs and each check result. A
failed check makes the change set `BLOCKED`; no initializer or write command may
run.

One-writer is semantic, not merely file-based: two specs that can both change
ActivitySpec settlement overlap even if their proposed files differ. Read-only
reviewers do not count as writers.

## Verification profiles

### Focused profile

Contains exact commands directly proving changed-boundary requirements, their
environment prerequisites and time budgets. It includes reproduction/regression
for repair work. It may reference shared canonical gates with rationale.

### PR profile

Adds only declared cross-boundary, production build, persistence/browser or
canonical release checks required by the risk/boundary. It does not
automatically run all tests. Canonical package/phase gates remain authoritative
when they require a broader command.

The adapter executes or records commands in declared order and reports command,
working directory, environment fingerprint, start/end/duration, exit code,
stdout/stderr evidence reference/digest and result:

- `PASS`: command ran and succeeded;
- `FAIL`: command ran and found a product/test failure;
- `ERROR`: crash, timeout, invalid environment or infrastructure failure;
- `NOT_RUN`: declared but not executed;
- `NOT_AVAILABLE`: required binary/tool is absent.

There is no automatic retry or green-result coercion. Optional obligations may
remain `NOT_RUN`/`NOT_AVAILABLE`; required ones block handoff.

## Trace validator

The minimum graph is
`requirement → test → command → evidence`.
Plan/task references are present in spec-level metadata but the MVP does not
build a general graph engine.

The validator returns `ERROR` for:

- duplicate/reused requirement or test identity;
- missing or broken reference;
- a reference outside declared boundary without explicit `SHARED` rationale;
- required command without a result;
- required evidence missing or bound to another commit/command/environment;
- trace/evidence/content digest mismatch.

It returns `WARNING` for an optional obligation not run, shared test with weak
rationale, suspicious coverage or non-test task with incomplete disposition.
Warnings are never silently dropped; the frozen brief decides which warnings
block its handoff.

Property/model/mutation evidence is required only when the approved spec/brief
marks it `REQUIRED`. A missing optional tool cannot be presented as a pass.

## Frozen-brief validator

Validation is identity/completeness only. It checks exact subject/parent,
package/spec or repair ID, spec revision, trace digest, evidence digest,
allowlist/exclusions and all required results. It returns a typed mismatch or
`BLOCKED_BY_INVALID_BRIEF`; it cannot interpret product correctness or emit
`ACCEPT`.

An auditor may inspect dependencies and surrounding repository state beyond the
write allowlist. The validator must not restrict that read scope.

## Requirements

| ID | Normative requirement |
|---|---|
| `EWF00-PVT-01` | Preflight fails before any write on wrong HEAD, changed predecessor/ref assumptions or wrong repository/worktree identity. |
| `EWF00-PVT-02` | Dirty implementation worktree, undeclared writer or semantic/file overlap produces a blocking result with evidence. |
| `EWF00-PVT-03` | Preflight reads canonical package/dependency gates but never edits status or chooses among conflicts. |
| `EWF00-PVT-04` | Verification runs only exact declared commands and never retries, expands scope or installs a missing tool. |
| `EWF00-PVT-05` | Each command result preserves the five-state outcome and binds environment, duration and content digest. |
| `EWF00-PVT-06` | Trace validation detects duplicate IDs, broken references, missing required command/evidence and digest mismatch. |
| `EWF00-PVT-07` | Shared gates are allowed only with explicit scope rationale; repository tests outside the spec are not automatically orphans. |
| `EWF00-PVT-08` | Brief validation rejects commit, parent, spec revision, trace, evidence or brief mismatch without producing a product verdict. |
| `EWF00-PVT-09` | Spec Kit CLI absence leaves preflight, profiles, trace and brief validation operational. |
| `EWF00-PVT-10` | Validator output is deterministic for the same normalized inputs and preserves diagnostic ordering. |
| `EWF00-PVT-11` | Absolute private paths, secrets and environment credentials are redacted from portable evidence while stable identity remains. |
| `EWF00-PVT-12` | MVP adds no CI mutation, complex orchestration, daemon, dashboard, scheduler, retry engine or dependency installer. |

## Mandatory negative fixtures

| Fixture | Expected result |
|---|---|
| Declared predecessor differs from HEAD | preflight `ERROR`; zero writes |
| Dirty implementation worktree | preflight `ERROR`; zero writes |
| Two active writers overlap one semantic boundary | overlap `ERROR`; zero writes |
| Duplicate requirement and broken test/evidence reference | trace `ERROR` for each defect |
| Required command is absent or `NOT_RUN` | trace/brief invalid |
| Evidence digest or subject commit differs | trace/brief invalid |
| Brief binds wrong parent/spec revision | `BLOCKED_BY_INVALID_BRIEF` |
| Spec Kit executable absent | core EWF checks still run |
| Optional tool absent | `NOT_AVAILABLE`; blocks only when declared required |
| Command times out/crashes | `ERROR`, never `FAIL` or `PASS` |

Fixtures must use disposable repositories/directories and synthetic evidence;
they cannot dirty or alter the user’s source worktree.

## Migration, rollback and compatibility

The adapter wraps current repository commands by reference. It does not replace
canonical scripts. Configuration is additive and versioned. Older artifact
versions are either explicitly adapted without changing meaning or rejected as
unsupported; completion fields are never synthesized.

Rollback removes only declared adapter/config files and leaves manual canonical
commands available. CI remains unchanged in this package. Windows/local-path
handling must be covered without embedding machine-specific paths in portable
artifacts.

## Required verification and acceptance evidence

Required evidence includes unit and integration runs over all negative fixtures,
determinism checks, redaction tests, timeout/crash classification, CLI-absent
execution, exact declared-command proof and rollback to manual commands. The
implementation report must disclose overhead separately from command runtime.

An independent auditor at the exact commit must verify fail-before-write,
five-state result fidelity, trace/brief mismatch handling and absence of CI/tool
installation side effects. Passing this spec alone does not accept EWF-00 or a
product package.
