# VocabMaster Implementation Queue by Delivery Wave

Queue status: `PLANNING_ONLY / NO_IMPLEMENTATION_AUTHORIZATION`

This queue orders future decisions and bounded work. It does not authorize a
branch, worktree, source write, dependency, package ratification, status change
or acceptance verdict. Each executable item requires either a separately approved
exact predecessor, owner, allowlist and acceptance brief or one independently
accepted Wave Authorization Manifest containing a separate exact record for that
item. Every executable record preserves its exact predecessor, canonical owner,
implementation allowlist, dependency state, acceptance brief and independent
verdict; a shared manifest does not merge package ownership or acceptance.

## Queue invariants

1. Canonical docs remain the sole package/dependency/status/acceptance authority.
2. One writer owns one semantic boundary; shared consumers never become co-owner.
3. Ratify a future candidate only immediately before its implementation wave.
4. Implementer evidence is never independent acceptance.
5. AI remains advisory; it cannot write canonical evidence, error, mastery,
   publication, WeaknessProfile or readiness state.
6. No “full IELTS” claim is allowed until every claimed coverage-matrix row is
   implemented and independently accepted.
7. Existing Phase 4/5 handoff evidence is preserved but is not silently promoted.
8. Stop on canonical conflict, missing owner, dependency cycle, rights/privacy
   ambiguity, stale exact identity or overlapping writer.

## Wave 0 — Review this pack and authorize only a minimum Foundation slice

| Order | Work item | Owner/status now | Entry gate | Exit evidence |
|---:|---|---|---|---|
| 0.1 | Independent docs-only review of seven canonical package specs and eight gap matrices | Specs `DRAFT`; matrices rebind-pending | Exact spec-pack subject and no canonical/source diff | Findings classified by artifact; no package status change |
| 0.2 | Approve/revise EWF artifact, preflight/trace and pilot specs independently | EWF-00 planned/not implemented/not accepted | CR-3 canonical boundary and architecture SHA still match | Frozen EWF spec revisions; implementation still separately authorized |
| 0.3 | Separately authorize EWF Minimum Viable Foundation | EWF-00 | One exact predecessor/worktree/writer; artifact/file allowlist; no tool install | Minimal bridge, schemas, preflight, profiles, trace/brief validator and negative fixtures locally verified |
| 0.4 | Run one eligible small-repair pilot | EWF-00 pilot boundary plus existing product owner | Repair satisfies every lightweight predicate | Bounded report/brief/independent audit and overhead data |
| 0.5 | Run one bounded spec-level pilot | EWF-00 pilot boundary plus one existing canonical package owner | Separate product authorization, non-overlapping writer and full frozen spec/trace/brief | Handoff invalidation, exact-commit audit and comparable overhead data |

Foundation must remain small enough that product discovery continues. Capability
research in Wave 1 may run read-only/in disposable pilots in parallel with Wave
0.3 when it has separate ownership and no repository writer overlap. EWF
acceptance waits for both pilots; product architecture does not wait for broad
Foundation automation.

## Wave 1 — Canonical integrity seams and early capability pilots

| Order | Work item | Canonical owner/status | Dependency/order | Exit evidence |
|---:|---|---|---|---|
| 1.1 | LI-00 frozen Run and terminal-settlement implementation slice | LI-00 planned/not implemented/not accepted | Accepted P1 owners/EvidencePolicy; one writer over learning settlement | Crash/reopen, race, first-terminal-wins, authority and restore evidence; independent audit |
| 1.2 | SRC-00 stable reference seam with Core + Transcript adapters | SRC-00 planned/not implemented/not accepted | May research/implement in parallel with LI-00 on non-overlapping files; public-pack adapter waits for accepted P4 | Exact/tombstone/integrity/provenance and backup/restore evidence; independent audit |
| 1.3 | Early read-only/disposable capability pilots | No product package owner yet | Parallel: ffprobe need, ASR live benchmark, segmentation/alignment fixtures, tool-doctor shape, Task 1 visual prototype | Research reports only; no library lock or production claim |
| 1.4 | ERR-00 candidate lifecycle and P1-06 promotion | ERR-00 planned/not implemented/not accepted | LI-00 accepted first | Atomic one-occurrence, forged-authority, crash/reopen and restore evidence; independent audit |
| 1.5 | QAR-00 common registry plus one existing objective adapter | QAR-00 planned/not implemented/not accepted | LI-00 and SRC-00 accepted first | Deterministic schema/scorer, canonical attempt/receipt and unsupported-kind evidence; independent audit |

Do not implement LI-00 and QAR-00 in parallel: QAR freezes LI contracts and must
consume their accepted shape. ERR-00 may not write the P1-06 boundary while a LI
writer is changing terminal/evidence bindings.

### Wave 1 bounded execution topology

Wave 1 is expected to use two dependency batches after `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` is active and an exact Wave Authorization Manifest is independently accepted. This queue remains `PLANNING_ONLY / NO_IMPLEMENTATION_AUTHORIZATION`; the topology is not implementation authority.

**Batch A** contains `LI-00`, `SRC-00` and read-only/disposable capability research with no repository-writer overlap. `LI-00` and `SRC-00` may share one accepted wave manifest and one executor capsule only after fresh owner, semantic-boundary and path analysis proves non-overlap. They retain separate package commit chains, RED/GREEN and evidence identities, and separate independent verdict findings. Research lanes remain non-writing and cannot create product-package status.

**Batch B** begins only after its Batch A dependencies receive independent acceptance. `ERR-00` requires accepted `LI-00`. `QAR-00` requires accepted `LI-00` and `SRC-00` and must consume those independently accepted contract shapes. `ERR-00` cannot enter P1-06-owned writes while an LI writer is mutating terminal/evidence bindings. Batch B retains separate commits, evidence and per-package verdicts.

The expected cadence is manifest authoring, independent manifest acceptance, Batch A execution, independent Batch A audit/integration, Batch B execution, then independent Batch B audit and any explicitly authorized reconciliation. This cadence is an operational estimate, not an acceptance criterion. A separate reconciliation capsule remains permitted when canonical changes are too large or unsafe to combine.

## Wave 2 — First end-to-end value slice

Implement `vertical-slice-01-audio-question-feedback-recommendation-draft.md`
as a sequence of owner-specific change sets, not one multi-owner mega-branch:

1. rights-cleared accepted Transcript/audio reference;
2. one manually approved Listening multiple-choice QAR activity;
3. LI canonical Run/Attempt/Receipt;
4. deterministic feedback;
5. ERR ErrorCandidate and explicit confirmation path;
6. nonpersistent advisory weakness/recommendation preview unless the Focus owner
   has been canonically rebound.

The slice passes only as one type-specific architecture proof. It does not prove
Listening coverage, sectional assessment, WeaknessProfile or readiness.

## Wave 3 — Just-in-time local assistance taxonomy

Review and selectively ratify/port Wave 1–2 candidate drafts only when their
first consumer is ready:

- narrowed future JOB/AIA boundaries;
- authenticated local companion material ported to P5-01;
- optional durable/provider profiles after core interactive/provider-off flow;
- process/artifact cleanup material ported to P5-01/P5-03.

Keep Phase 5 local core and optional Gemini media acceptance separate. A future
P5-06 identity requires its own canonical change set and inherits no P5-05
implementation/acceptance.

## Wave 4 — Expand objective IELTS coverage by matrix, not by subsystem clone

1. Ratify one canonical IELTS profile/inventory owner.
2. Port Reading and Listening adapter material to QAR plus that skill owner.
3. Implement question types in independently bounded families where schemas/UI
   genuinely share invariants; update every matrix dimension.
4. Add Academic versus GT inventory/section profiles explicitly.
5. Add sectional/timing assembly only after accepted type coverage and a future
   assessment owner.

Reading and Listening can progress in parallel after shared QAR contracts are
accepted, provided they use different writers and inventory/executor boundaries.
Do not build all 24 type rows before the first vertical slice survives durable
execution and independent audit.

## Wave 5 — Productive Writing/Speaking and personal-source useful slice

Two bounded lanes may progress in parallel after just-in-time ratification:

- Productive lane: future artifact lineage → shared productive kernel → Writing
  and Speaking/Retell specializations → independent exit. Provider-off self-review
  and durable artifacts come before optional AI/ASR adapters.
- Personal-source lane: private trust/Library → paste/plain-text useful activity
  → deterministic compiler → optional grounded drafts → explicit refill/exit.

Their join is a later source-bound ProductivePrompt adapter, not shared storage
ownership. Personal content is not a predecessor for the productive core, and
productive practice is not a predecessor for safe source import.

## Wave 6 — Deterministic weakness, focus and assessment

1. Wave 6 WKN-00 canonical owner rebind is resolved to P7-00, but executable implementation remains separately authorization-gated.
2. Port shared/canonical Focus semantics into Today/P7-04; due review remains
   first.
3. Optionally ratify a visibly advisory Focus selector with no provider call on
   Today open.
4. Ratify/implement Frozen Assessment contracts.
5. Implement Targeted Diagnostic and label its biased coverage honestly.
6. Add sectional/timed/full mock and readiness only after their unowned
   boundaries are reconciled, representative inventory exists and delayed
   calibration is accepted.

`URL-00` and `MM-00` remain deferred. A targeted diagnostic cannot be renamed a
Mini-mock, and readiness cannot be inferred from coaching or synthetic data.

## Candidate parity and ratification ledger

| Disposition group | Candidates retained outside canonical package tables |
|---|---|
| `RATIFY_AS_IS` | AIA-01, PCS-00, PP-00, PP-01, PP-03, PCS-05, PCS-06, TD-00 |
| `RATIFY_WITH_BOUNDARY_CHANGE` | JOB-00, AIA-00, AIA-02, PCS-01, ART-00, ART-01, PP-02, PCS-02, PCS-03, PCS-04, PCS-07, FCS-02, ASM-00 |
| `MERGE_INTO_EXISTING` | LOC-00, JOB-01, SRC-01, SRC-02, QAR-01, QAR-02, QPE-00, QPE-01, WKN-00, FCS-00, FCS-01 |
| `DEFER` | URL-00, MM-00 |

This table contains 34 unique future/deferred candidates. Together with the
four CR-2A packages, the preserved decision inventory remains 38. None of these
34 rows is a canonical status record.

## Queue completion rule

A queue row may be marked locally complete only when its declared artifact or
research output exists. Product implementation completion and acceptance remain
owned by canonical package records and independent exact-commit verdicts. This
queue must never be used as a substitute status ledger.
