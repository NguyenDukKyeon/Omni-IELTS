# EWF-00 — Pilots, Measurement and Independent Audit

## Metadata

| Field | Value |
|---|---|
| Spec ID | `EWF00-PILOTS-001` |
| Spec type | `feature` |
| Local spec status | `DRAFT` |
| Canonical package | `EWF-00` |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Implementation authorization | `NOT_GRANTED` |
| Architecture baseline | `docs/superpowers/specs/2026-08-04-engineering-workflow-foundation-design.md` at `adc3726620f4badddb16309e375f8f17b6af1404` |
| Canonical boundary | `docs/ROADMAP.md` EWF-00; `docs/IMPLEMENTATION_PLAN.md` EWF-00; ADR-044 |
| Dependencies | Implemented, locally verified `EWF00-ARTIFACTS-001` and `EWF00-PREFLIGHT-001`; pilots separately authorized |
| Acceptance owner | Independent canonical auditor at the exact EWF-00 implementation/pilot evidence identity |
| Requirement namespace | `EWF00-PMA-*` |

## Goal and acceptance boundary

Prove the Minimum Viable Foundation on two separately approved, bounded pilots,
measure its real overhead, and submit a frozen exact-commit evidence package to
an independent auditor. Pilot success is evidence about EWF-00 workflow
fitness—not acceptance of the repaired/product package and not authorization to
expand tooling.

This spec owns pilot selection constraints, measurement protocol, failure
classification and package-level independent-audit evidence. It does not own
the product boundary exercised by either pilot.

## Entry conditions

No pilot may start until:

1. EWF artifact and validation specs have separate implementation authorization,
   exact predecessors and local verification evidence;
2. the candidate pilot has a canonical owner, exact boundary and separate user
   authorization;
3. one clean worktree and writer are declared for that pilot;
4. its baseline manual workflow is measured on the same recorded environment;
5. the pilot cannot affect data loss, security, privacy, rights or external cost
   without a separately approved boundary;
6. the EWF auditor is independent of the EWF implementation context.

This current document authorizes none of those implementation actions.

## Pilot A — eligible small repair

The selected repair must satisfy every lightweight predicate in
`EWF00-ARTIFACTS-001`: deterministic reproduction, existing acceptance boundary,
no contract/schema/durable-data/security/privacy/rights/cost/dependency or
concurrency/crash-recovery change, no product expansion, and a focused
regression test.

The pilot proves:

- change-set declaration and fail-closed preflight;
- lightweight repair record and reduced trace;
- TDD/reproduction → regression path;
- focused and PR profiles with exact evidence;
- exact subject report, frozen brief and independent read-only audit.

If any eligibility predicate becomes false, Pilot A stops and is reclassified
as spec-level work; that is correct fail-closed behavior, not a failed repair.

## Pilot B — bounded spec-level change

The selected spec-level pilot must have one existing canonical package owner,
a reviewed non-overlapping spec and meaningful end-to-end evidence. A narrow
LI-00 execution-safety slice is the preferred architecture probe only after its
own authorization and dependency gates; this preference does not authorize it.

The pilot proves:

- structured spec/plan/tasks and namespaced trace;
- exact writer/allowlist/dependency gates;
- required focused and PR profiles;
- implementation verification report and complete trace digest;
- frozen brief and separate auditor context;
- invalidation when subject/spec/evidence changes.

Pilot B stops if it needs a second runtime/store/status authority, overlaps a
different writer, expands to complete IELTS inventory, or requires an
uncanonicalized package owner.

## Measurement protocol

Baseline and EWF-assisted runs use the same recorded OS, Node/tool versions,
repository state and command set. Each metric records value, unit, start/end,
measurement method, exclusions and raw evidence reference.

Required metrics:

| Metric | Boundary |
|---|---|
| Focused duration | command runtime, separated from wrapper overhead |
| PR duration | declared PR command runtime, separated from queue/startup |
| Preflight overhead | elapsed and manual actions to freeze repository/writer scope |
| Artifact preparation | repair/spec metadata, trace, report and brief authoring time/actions |
| Validator overhead | trace/brief validation runtime and diagnostic review time |
| Manual operations | count for baseline and pilot, with operation definition frozen first |
| Rework/finding loop | number and cause of invalidations/remediation rounds |
| CLI-absent friction | missing functions or extra manual steps with Spec Kit CLI absent |

The design sets no arbitrary pass threshold. The independent review compares
observed measurements to baseline and recommends `KEEP`, `SIMPLIFY`, `OPTIMIZE`
or `DO_NOT_EXPAND`, with evidence. A slower result is not hidden by lowering a
budget after execution.

## Independent audit protocol

The auditor uses a clean, read-only context at the exact subject commit. It does
not use the implementer worktree or uncommitted state, mutate files, remediate
findings, invent criteria or self-author a new brief.

The auditor receives only the frozen brief, repository subject and bound
evidence artifacts. It may inspect dependencies and surrounding code. It blocks
EWF acceptance only for in-boundary defect/regression, scope-integrity failure,
missing/unreliable required evidence or invalid acceptance assumption.

Out-of-scope findings are recorded separately. A data-loss, security, privacy,
rights or verification-integrity concern may recommend a release-safety hold,
but does not silently expand the EWF remediation boundary.

Allowed results are `ACCEPT`, `REJECT` and `BLOCKED_BY_INVALID_BRIEF`.
Implementer evidence cannot substitute for the verdict.

## Requirements

| ID | Normative requirement |
|---|---|
| `EWF00-PMA-01` | Exactly one eligible small-repair pilot and one independently bounded spec-level pilot are completed or explicitly stopped by a declared fail-closed rule. |
| `EWF00-PMA-02` | Each pilot has separate product authorization, exact predecessor, one writer/worktree and frozen exclusions. |
| `EWF00-PMA-03` | Preflight fixtures prove wrong HEAD, dirty tree and writer overlap stop before writes. |
| `EWF00-PMA-04` | Trace fixtures prove duplicate ID, broken reference and missing required evidence are detected. |
| `EWF00-PMA-05` | Brief fixtures prove commit/parent, spec revision and trace/evidence digest mismatch invalidate handoff. |
| `EWF00-PMA-06` | Both pilot workflows remain operable when Spec Kit CLI is absent. |
| `EWF00-PMA-07` | Baseline and pilot overhead use the same declared environment/method and preserve raw evidence. |
| `EWF00-PMA-08` | Pilot evidence cannot change product package status or supply that package’s independent acceptance verdict. |
| `EWF00-PMA-09` | Independent EWF audit uses a separate read-only context and frozen exact-commit identity. |
| `EWF00-PMA-10` | Pilot output creates no second governance/status/acceptance authority and no automatic CI/tool installation. |
| `EWF00-PMA-11` | Findings/remediation rounds remain bounded by a new frozen brief; any subject/evidence change invalidates the prior audit. |
| `EWF00-PMA-12` | Expansion to mutation, broad fuzz, portability or extra automation requires measured need, a new spec and separate approval. |

## Required negative and recovery evidence

In addition to validator fixtures, the pilots must demonstrate:

- optional tool absent versus required tool absent;
- command failure versus crash/timeout/infrastructure error;
- evidence/report created for a stale subject and rejected;
- subject amended after brief freeze and old handoff invalidated;
- reviewer finding that is out of scope recorded without expanding remediation;
- failed/aborted pilot cleanup that leaves the canonical manual workflow usable.

No fixture may dirty the real source worktree or alter remote refs.

## Exit and package-level acceptance boundary

Exit evidence includes both pilot declarations, exact subjects/parents, complete
reports/briefs/traces, negative-fixture results, baseline and overhead dataset,
rollback/manual-workflow proof, scope-integrity review and independent verdict.

EWF-00 may be accepted only when the canonical auditor confirms the complete
CR-3 boundary across all three EWF specs: artifact contracts, fail-closed
preflight/verification/trace, both pilots, measurements and audit separation.
That verdict must then be recorded by the existing canonical status process.
Neither this spec, the pilot implementer nor an EWF script can update it.
