# EWF-00 — Subordinate Artifact Contracts

## Metadata

| Field | Value |
|---|---|
| Spec ID | `EWF00-ARTIFACTS-001` |
| Spec type | `feature` |
| Local spec status | `DRAFT` |
| Canonical package | `EWF-00` |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Implementation authorization | `NOT_GRANTED` |
| Architecture baseline | `docs/superpowers/specs/2026-08-04-engineering-workflow-foundation-design.md` at `adc3726620f4badddb16309e375f8f17b6af1404` |
| Canonical boundary | `docs/ROADMAP.md` EWF-00; `docs/IMPLEMENTATION_PLAN.md` EWF-00; ADR-044 |
| Dependency | No hard product-package dependency |
| Acceptance owner | Independent canonical auditor at the exact implementation commit |
| Requirement namespace | `EWF00-AC-*` |

This is one of three non-overlapping EWF-00 specs. It owns artifact shapes and
authority labels. `EWF00-PREFLIGHT-001` owns executable validation behavior;
`EWF00-PILOTS-001` owns pilots, measurement and package-level audit evidence.

## Goal and acceptance boundary

Define the minimum repository-local artifacts needed to carry an approved
change from bounded intent to an independently auditable handoff without
copying or replacing canonical governance. The artifacts must be readable and
creatable when Spec Kit CLI is absent.

In scope:

- minimal constitutional bridge;
- change-set declaration;
- lightweight repair record;
- structured spec metadata for spec-level work;
- verification manifest and implementation verification report;
- frozen acceptance brief and audit-result envelope;
- local spec lifecycle and exact handoff identity.

Out of scope: product behavior, package/status decisions, acceptance verdict
generation, workflow orchestration, dashboard/daemon, CI mutation, upstream
initializer execution, dependency installation and physical Spec Kit layout
beyond the approved minimum bridge.

## Singular authority model

| Decision domain | Sole canonical owner | EWF artifact role |
|---|---|---|
| Agent conduct, Git safety, repository invariants | `AGENTS.md` | Link and declare precedence |
| Package identity, scope and dependencies | `docs/ROADMAP.md` | Reference exact section/revision |
| Acceptance boundary and required gates | `docs/IMPLEMENTATION_PLAN.md` | Freeze a bounded projection for audit |
| Package status and canonical evidence index | `docs/IMPLEMENTATION_STATUS.md` | Never infer or update |
| Architecture rationale | `docs/DECISIONS.md` | Reference, never supersede |
| Acceptance verdict | Existing independent canonical process | Store a returned envelope; never issue it |

If canonical sources conflict, the artifact records
`CANONICAL_CONFLICT — NEEDS_SEPARATE_RESOLUTION` and blocks the affected work.
It cannot select the more convenient source.

## Artifact set

### Constitutional bridge

The only pre-authorized physical path is `.specify/memory/constitution.md`.
It contains repository-relative links, the authority table above and explicit
statements that it is neither canonical governance nor acceptance evidence. It
must not copy status rows, acceptance criteria, package dependency tables,
Definition of Done or detailed ADR content. An initializer may not overwrite or
merge it automatically.

### Change-set declaration

Required fields:

- declaration/schema version and unique change-set ID;
- exact approved predecessor plus ref snapshot time/source;
- branch and one clean worktree identity;
- authorized writer and read-only reviewers;
- allowed files/subsystems and explicit exclusions;
- canonical package/spec or repair reference;
- dependency/status preconditions and stop conditions;
- approval provenance for any destructive, external or security-sensitive act.

### Lightweight repair record

Required only when every small-repair eligibility rule is demonstrably true.
It contains reproduction/finding, root cause, existing canonical boundary,
repair delta, exclusions, regression test, required commands/environment,
expected evidence, timeout/budget, result semantics and completion identity.
Any uncertainty about contract/schema/durable state/security/privacy/rights,
concurrency/crash recovery, dependency or product scope forces spec-level work.

### Structured spec metadata

Every spec-level record contains:

- immutable spec ID, spec type and revision;
- existing canonical package ID and exact boundary references;
- exact acceptance boundary and exclusions;
- predecessor/dependency constraints;
- namespaced non-reused requirement IDs with supersession links;
- required verification profiles and optional-tool dispositions;
- authorized subsystem/file declarations;
- assumptions, limitations and unresolved canonical conflicts;
- local lifecycle state that cannot be confused with package status.

One package may have multiple specs only when their acceptance boundaries and
writers do not overlap.

### Verification manifest and report

The manifest declares exact commands and profiles; it does not discover tests.
The implementation verification report records writer, subject/parent, package
and spec/repair references, boundary/exclusions, actual diff, dependency change,
commands/results/durations, environment fingerprint, evidence references and
digests, trace result, optional-tool dispositions, unfinished tasks,
limitations and blockers.

It is labeled `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

### Frozen acceptance brief

The brief contains exact subject commit/parent, package/spec or repair identity,
spec revision, trace/evidence digests, acceptance boundary, expected changed
files/ranges, exclusions, required evidence, blocking rules, assumptions and
known limitations. File/range allowlists constrain implementation writes but
not auditor read scope.

The brief is immutable once frozen. Any bound artifact change invalidates the
handoff and requires a new brief identity.

### Audit-result envelope

The auditor may return `ACCEPT`, `REJECT` or
`BLOCKED_BY_INVALID_BRIEF`, bound to the frozen identity. The envelope records
auditor context, exact subject/parent, checked brief/evidence digests, findings
and verdict provenance. EWF stores/validates this envelope but never generates
or converts it into canonical package status.

## Handoff identity and lifecycle

The logical handoff tuple is:

`(subject_commit, parent, spec_revision, trace_digest, evidence_digest, brief_digest)`.

This avoids self-reference: the subject commit contains the implementation;
reports/briefs may live in a later evidence-only revision or approved external
evidence store. Changing any tuple input invalidates `HANDOFF_READY`.

Local spec states are
`DRAFT → CLARIFIED → PLANNED → TASKS_READY → IN_PROGRESS → LOCAL_VERIFICATION_PASSED → HANDOFF_READY`,
plus `BLOCKED`, `SUPERSEDED` and `CANCELLED`. They never update or imply the
canonical package ledger.

## Requirements

| ID | Normative requirement |
|---|---|
| `EWF00-AC-01` | The bridge links canonical sources and contains no copied status/acceptance authority. |
| `EWF00-AC-02` | Every change-set declaration freezes predecessor, writer, worktree, allowlist, exclusions and stop conditions before writes. |
| `EWF00-AC-03` | Repair records are accepted only when all eligibility predicates are true; ambiguity fails to spec-level or blocked. |
| `EWF00-AC-04` | Spec metadata uses an existing canonical package ID and non-reused namespaced requirements. |
| `EWF00-AC-05` | Reports distinguish implementer evidence from independent acceptance and bind exact subject/parent. |
| `EWF00-AC-06` | Frozen briefs bind exact identity, boundary and evidence digests and cannot be edited in place while remaining valid. |
| `EWF00-AC-07` | Missing completion fields are legal only in draft artifacts and always invalidate `HANDOFF_READY`. |
| `EWF00-AC-08` | Local lifecycle, audit result and canonical package status remain three separate domains. |
| `EWF00-AC-09` | Artifact schemas represent `PASS`, `FAIL`, `ERROR`, `NOT_RUN` and `NOT_AVAILABLE` without coercion. |
| `EWF00-AC-10` | All core artifact templates function without Spec Kit CLI and without automatic dependency installation. |
| `EWF00-AC-11` | Canonical conflict, wrong/missing identity or ambiguous ownership is represented as a blocker, never inferred away. |
| `EWF00-AC-12` | Upstream/adapted artifacts record origin/version/classification and cannot overwrite project-owned governance. |

## Migration, rollback and degradation

Adoption is additive. Before any future Spec Kit integration, an exact upstream
version/commit, license, generated manifest, hooks/dependencies, Windows
behavior and initializer effects must be reviewed in a disposable staging
directory. Only allowlisted templates/contracts may be selectively applied and
classified `VENDORED_UNMODIFIED`, `PROJECT_ADAPTED` or `PROJECT_OWNED`.

Rollback removes only declared EWF templates/metadata/hooks. Canonical docs and
the existing manual workflow must remain operable. CLI absence is a supported
normal mode, not an error. An optional missing tool is `NOT_AVAILABLE` and blocks
only when the approved spec/brief made it required.

## Required verification and acceptance evidence

Schema tests must cover every artifact and lifecycle state, missing fields,
unknown versions, duplicate requirement IDs, changed digests, canonical
conflicts and CLI-absent rendering/validation. Snapshot tests must prove the
bridge does not copy forbidden authority. Round-trip fixtures must preserve
unknown safe fields without accepting them as authoritative.

Exit evidence is an exact-commit artifact manifest, schema test report,
forbidden-authority scan, CLI-absent run, selective-adoption provenance fixture,
rollback demonstration, requirement trace and independent audit. Acceptance of
this spec does not accept EWF-00 until the other two EWF specs and package-level
pilot boundary also satisfy the canonical plan.
