# Bounded Execution Capsule Governance Design

Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`  
Decision: `ADR-046`  
Status: `PROPOSED / NOT ACTIVE`  
Authority: subordinate to canonical repository governance

## 1. Purpose

This design reduces administrative handoffs while preserving every technical and independent acceptance gate. It permits one independently accepted Wave Authorization Manifest to authorize one or more bounded executor capsules, followed by a separate independent batch audit and, when explicitly frozen, mechanical post-verdict integration or reconciliation. Prompt count is not treated as a quality signal.

## 2. Existing authority and constraints

`AGENTS.md` remains the repository execution-rule authority. `docs/ROADMAP.md` owns package scope and dependencies. `docs/IMPLEMENTATION_PLAN.md` owns implementation and acceptance requirements. `docs/IMPLEMENTATION_STATUS.md` records actual status and executed evidence. `docs/DECISIONS.md` records rationale. EWF artifacts are subordinate and cannot create package status, release authority or an acceptance verdict. One writer, exact predecessor binding, exact allowlists, test-first behavior, immutable evidence and independent exact-commit review remain mandatory.

The protocol becomes active only after this governance amendment receives independent exact-head `ACCEPT` and is merged into `main`. Until then it is documentation for a proposed process and authorizes no package or pilot.

## 3. Problems in the micro-authorization topology

The existing pilot process separates authority correctly but may require a new administrative comment between every deterministic transition: RED authorization, source authorization, evidence authorization, audit and integration. When all predicates and stop conditions can be frozen in advance, repeated handoffs add latency, increase transcription surface and fragment the evidence trail. They do not strengthen exact predecessor checks, natural RED classification, exact-head CI, blob/path verification or independent acceptance.

## 4. Rejected alternatives

- **Keep every intermediate authorization comment.** Safe but unnecessarily expensive when an accepted manifest already freezes the same conditional authority.
- **Combine implementer and independent auditor.** Rejected because implementer evidence cannot self-accept.
- **Build a workflow runtime or DAG engine.** Rejected as disproportionate, stateful orchestration outside EWF-00 scope.
- **Auto-accept based only on CI.** Rejected because CI success does not prove ownership, minimality, RED eligibility, evidence provenance or migration/rollback quality.
- **Batch overlapping package owners.** Rejected because shared writers or semantic boundaries create ambiguous accountability and non-isolatable verdicts.

## 5. Protocol entities

The protocol defines a Wave Authorization Manifest, Package Record, Research Lane Record, Bounded Executor Capsule, RED Record, GREEN Record, Implementer Evidence Set, Independent Audit Record and optional Integration/Reconciliation Record. Each object binds immutable repository identities. A shared wave never merges package ownership or acceptance.

## 6. State machine

The governance state machine is:

`MANIFEST_DRAFT -> MANIFEST_AUDIT -> MANIFEST_ACCEPTED | MANIFEST_REJECTED | MANIFEST_BLOCKED`

For each accepted package record:

`STAGE_0 -> BASELINE_BOUND -> COMMIT_A -> RED_OBSERVED -> RED_ELIGIBLE -> COMMIT_B -> GREEN_OBSERVED -> EVIDENCE_RECORDED -> AUDIT_PENDING -> ACCEPTED | REJECTED | BLOCKED`

Optional integration follows only `ACCEPTED` and only when pre-authorized. Any drift, overlap or ambiguous evidence transitions immediately to `BLOCKED`; no later state may infer that a missing predicate passed.

## 7. Role and trust boundaries

The Manifest Author drafts exact authority but cannot accept it. The Independent Manifest Auditor fresh-checks canonical facts and issues the manifest verdict. The Bounded Executor performs only accepted conditional transitions and cannot accept its own implementation or evidence. The Independent Batch Auditor uses fresh repository, CI and artifact facts and issues per-package verdicts. A reviewer may perform pre-authorized mechanical integration only after posting and reading back an `ACCEPT` verdict. The same prompt/session cannot be both implementation writer and independent acceptance auditor.

## 8. Manifest schema

Every executable record freezes:

- wave ID and package or research-lane ID;
- canonical owner and exact predecessor;
- dependency state and writer identity;
- branch/PR topology;
- exact implementation allowlist and explicit exclusions;
- baseline CI identity;
- test-first requirement;
- natural RED predicate and RED invalidation predicates;
- minimal GREEN boundary and exact verification profile;
- evidence paths, file allowlist, schema/version and authority label;
- implementation-subject, CI and artifact bindings;
- migration/rollback obligations;
- stop conditions and integration rule;
- canonical acceptance-criteria source.

The manifest must make each record independently identifiable and rejectable. Missing fields are not inferred.

## 9. Single-package executor flow

The executor fresh-reads repository identity, main, open PRs and changed paths, accepted manifest authority, target identities and exact predecessor blobs. It creates a test-only Commit A, observes natural exact-head CI, classifies RED against the frozen predicate, and stops before source mutation unless RED is eligible. It then creates the minimal source-only Commit B, observes exact-head GREEN, records only pre-authorized evidence, reads all identities back and stops for independent audit. No intermediate user comment is required because conditional authority was accepted in advance.

## 10. Multi-package batch flow

Packages share a capsule only when fresh analysis proves disjoint file allowlists, disjoint semantic ownership and compatible writers. Dependency order is explicit. Each package uses a separate commit chain, natural RED/GREEN identities where test-first applies, evidence set and audit finding. A dependent package cannot execute before predecessor acceptance unless the manifest defines an independently auditable sequential batch boundary. A rejection of one package cannot be hidden by a combined result.

## 11. Natural RED classification

Eligible RED requires Commit A to have the exact approved parent, a test-only delta, unchanged source blobs, a newly discovered regression and an exact-head workflow run whose first cause is a natural product defect. Syntax errors, missing dependencies, infrastructure failures, unrelated baseline failures, weakened assertions, source mutation, unexpected workflows or ambiguous causal chains invalidate RED. Invalid or ambiguous RED stops the executor before Commit B. The final independent auditor re-audits immutable Commit A and CI evidence.

## 12. Evidence model

Manifest-pre-authorized evidence freezes an exact directory and exact file allowlist, schema/version, `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` label, implementation subject, parent, CI run/job/artifact bindings and non-acceptance boundaries. Evidence files are immutable records, not status authority. Missing artifacts, digest mismatch, wrong subject, unexpected files or authority-label drift blocks the capsule.

## 13. Independent audit

The Independent Batch Auditor fresh-checks manifest authority, canonical owners, open-PR overlap, commit topology and parents, changed paths and blobs, natural RED, minimal GREEN, exact-head CI jobs and artifacts, migration/rollback evidence, evidence files, authority boundaries and unresolved findings. The auditor may issue `ACCEPT`, `REJECT` or `BLOCKED`. Batch `ACCEPT` must include a separate explicit verdict for every package; no package inherits another verdict.

## 14. Integration/reconciliation

An accepted manifest may pre-authorize only mechanical post-verdict actions: mark ready when explicitly allowed, merge an accepted PR, read back the merge identity, or apply an exact deterministic reconciliation hunk. Before action, the verdict must be posted and read back, accepted heads must be unchanged, required CI must remain successful and mergeability must be clean. The auditor cannot modify implementation before verdict, and reconciliation cannot rewrite historical wording outside frozen hunks.

## 15. Failure handling

Mandatory fail-closed conditions include main or head drift, branch race, incomplete pagination, missing owner, file or semantic overlap, incompatible writers, dependency violation, invalid or ambiguous RED, a third implementation path, test weakening, source mutation before RED, unexpected CI identity, missing artifact, evidence mismatch, migration/rollback ambiguity and acceptance conflict. The record must state the blocking fact and preserve zero mutation when the failure occurs before object creation.

## 16. W1 two-batch application

Batch A contains `LI-00`, `SRC-00` and read-only/disposable capability research with no repository-writer overlap. `LI-00` and `SRC-00` may share one accepted manifest and executor only after fresh owner/path analysis proves non-overlap; they retain separate commits, evidence and verdicts.

Batch B begins after independently accepted dependencies. `ERR-00` requires accepted `LI-00`. `QAR-00` requires accepted `LI-00` and `SRC-00` and consumes their accepted contract shapes. `ERR-00` cannot enter P1-06-owned writes while LI terminal/evidence bindings are being changed. The expected cadence is manifest, independent manifest acceptance, Batch A executor, Batch A independent audit/integration, Batch B executor and Batch B independent audit plus any authorized reconciliation.

## 17. Pilot B opt-in conditions

Pilot A remains accepted under its historical protocol; its history, comments, commits, evidence and verdicts are unchanged, and Protocol V1 has no retroactive effect. Pilot B remains unauthorized after this governance PR is created. Pilot B may use Protocol V1 only after this amendment receives independent exact-head `ACCEPT`, the governance PR merges into `main`, a Pilot B Wave Authorization Manifest freezes its own owner, predecessor, allowlist, RED/GREEN rules, evidence and stop conditions, and that manifest receives independent `ACCEPT`.

## 18. Non-goals

Protocol V1 does not create product behavior, a workflow runtime, DAG engine, scheduler, daemon, retry engine, CI workflow or CI mutation, dependency installation, automatic owner, automatic acceptance/status authority, dashboard, mutation suite, broad fuzz, package-scope change, acceptance-criteria change or Phase 4/5 reconciliation. It does not authorize Pilot B or any product package by mention.

## 19. Acceptance criteria

This governance amendment is acceptable only when the six-file docs-only delta is exact; canonical historical bytes are unchanged outside declared hunks; all required protocol entities, roles, predicates, W1 topology and Pilot B boundaries are present; no source, tests, CI, dependencies, product behavior or status ledger changes occur; exact-head natural CI is observed; and an independent auditor at the exact head issues `ACCEPT`. Protocol activation additionally requires merge into `main`.

## 20. Rollback

Rollback reverts the governance amendment. It does not rewrite implementation history, invalidate prior accepted verdicts or delete evidence. Future work returns to per-transition authorization, while all previously recorded evidence and historical Pilot A acceptance remain preserved. Any already accepted package remains governed by its recorded verdict and canonical authority.
