# Wave Authorization Manifest: W6-P7-00-WKN-AUTH-001

Artifact: `DRAFT_AUTHORIZATION_CANDIDATE`
Authorization candidate: `READY_FOR_INDEPENDENT_AUDIT` (only after final exact-head CI succeeds)
Implementation authorization: `NOT_ACTIVE`
Execution predecessor: `UNBOUND`
Execution-predecessor binding: `REQUIRED_AFTER_INTEGRATION`
Package acceptance: `NOT_GRANTED`
Independent implementation acceptance: `NOT_GRANTED`
Merge authority: `NOT_GRANTED`

Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`

This manifest is a candidate for bounded implementation authorization.
It does not activate implementation authority by its existence, CI success, authoring, mergeability, or PR status.
Independent exact-head acceptance is required.
Even after independent acceptance, execution remains locked until the exact implementation predecessor is separately bound after integration.

## 1. Package Identity
- **Wave/Package ID**: Wave 6 / P7-00
- **Canonical Owner**: P7-00 (Metrics reducer). `WKN-00` is absorbed into `P7-00` as a deterministic projection boundary. `U-FD` remains a non-owning grouping umbrella.
- **Execution Record**: `W6-P7-00-WKN-EXEC-001`
- **Writer Role**: P7-00 / WKN-00 Bounded Implementer
- **Writer Mode**: `ONE_WRITER_EXCLUSIVE` (only one active writer for this semantic boundary, no concurrent P7-00 writer, no concurrent WeaknessProfile writer, no overlapping branch modifying the frozen allowlist. The writer does NOT have independent acceptance, package acceptance, merge authority, or authorization amendment authority).

## 2. Predecessor & Baseline
- **Exact Planning/Governance Predecessor**: `09fa699d61b0ce6f2ebc3785dffda5b40bf1164e`
- **Exact Implementation Predecessor**: `UNBOUND` (Execution-predecessor binding REQUIRED_AFTER_AUTHORIZATION_INTEGRATION in a separate record).
- **Dependency State**: P1-02 (`ACCEPTED`), P1-08 (`ACCEPTED`). P7-00 is `NEXT`.
- **Baseline Identity**: The exact implementation predecessor commit (once bound).

## 3. Implementation Topology
- **Branch/PR Topology**: One dedicated implementation branch `codex/p7-00-metrics-reducer` branching strictly from the Exact Implementation Predecessor. One dedicated PR.

## 4. File Allowlist & Exclusions
- **File Allowlist**:
  - `src/p7-00-metrics-reducer.js` (NEW)
  - `src/weakness-profile.js` (NEW)
  - `tests/p7-00-metrics.test.mjs` (NEW)
  - `tests/weakness-profile.test.mjs` (NEW)
  - `src/persistence.js` (MODIFY)
  - `src/persistence-core.js` (MODIFY)
  - `src/progress.js` (MODIFY)
  - `src/main.js` (MODIFY)
- **Exclusions**:
  - `no P7-01`, `no P7-02`, `no P7-03`, `no P7-04`, `no P7-05`
  - `no FCS-00`, `no FCS-01`, `no FCS-02`, `no ASM-00`, `no TD-00`
  - no readiness, no IELTS band estimate, no Mini-mock, no full mock, no personalization experiments, no FSRS parameter tuning.
  - no second Today scheduler, no second Error Repository, no second canonical metrics truth.
  - no external AI provider call to construct canonical WeaknessProfile.
  - no AI authority over canonical weakness/evidence/mastery.
  - IMMUTABLE / FORBIDDEN: `src/fsrs-scheduler.js`, `src/evidence-policy.js`, `.github/**`, `package.json`, `package-lock.json`, `content-repo/**`.
  - Any file in `src/` not explicitly allowlisted.
  - Any file in `server/` or `tests/` unrelated to P7-00.

## 5. Execution Protocol
- **Test-First Requirement**: REQUIRED.
  Topology:
  fresh Stage 0
  → test-only RED commit
  → natural exact-head CI proving product RED
  → minimal source GREEN commit
  → natural exact-head CI
  → implementer evidence
  → STOP for independent implementation audit
  Source before RED, test weakening, synthetic RED assertions, empty commits, no-op commits, amend, rebase, force push, and workflow_dispatch as acceptance substitute are FORBIDDEN.
- **Natural RED Predicate**: Given a frozen canonical event fixture, the current system cannot deterministically produce the required versioned WeaknessProfile/metric projection with the frozen denominator, reason and uncertainty contract.
- **Invalidation Predicates**: 
  - Any drift from the exact implementation predecessor.
  - Branch race or ownership overlap.
  - Test weakening (modifying legacy assertions to make them pass).
  - Calling external AI to compute a weakness profile.
- **Minimal GREEN Boundary**: The natural RED tests pass purely by consuming `P1-02` events and projecting deterministic, repeatable metric/weakness states.
- **Verification Profile**:
  - Focused RED test: `node --test tests/p7-00-metrics.test.mjs tests/weakness-profile.test.mjs`
  - Focused GREEN verification: `node --test tests/p7-00-metrics.test.mjs tests/weakness-profile.test.mjs`
  - Full repository verification: `npm ci --no-audit --no-fund && npm run phase0:gate`
  - Natural pull_request CI: Required workflow "CI" (`.github/workflows/ci.yml`), triggered by `pull_request` event on exact head SHA, with `success` conclusion and all executed steps present.

## 6. Acceptance, Migration & Rollback
- **Source of Acceptance Criteria**:
  Mapped directly to `docs/IMPLEMENTATION_PLAN.md`:
  - **P7-00**: canonical event-derived metrics, deterministic replay, numerator/denominator, timeframe, eligibility, source drill-down, duplicate/out-of-order behavior, empty/sparse data, assisted vs independent behavior, Core/IELTS/V10 reconciliation where applicable, no mutable counter as source of truth.
  - **WKN-00 absorbed boundary**: same canonical inputs + same taxonomy version + same projection version = same WeaknessProfile. Explicit insufficient-data state. No fabricated weakness from sparse evidence. No AI canonical authority. Reason-coded projection. Auditable denominator/provenance.
- **Evidence Paths/Schema**:
  - Exact evidence artifact identity: `docs/superpowers/specs/2026-08-12-w6-p7-00-weakness-profile-evidence.md`
  - Required fields: profile/projector version, taxonomy version, qualified source evidence refs, numerator (if applicable), denominator, sample size, timeframe/recency policy, reason codes, uncertainty / insufficient-data state, exclusions/contradictions, canonical input digest, output digest.
  - Must include source commit binding and test/CI binding.
- **Migration/Rollback Obligations**: 
  - Canonical raw events remain immutable.
  - Projection is additive and versioned.
  - Cache/projection can be rebuilt.
  - Rollback disables/ignores new projection.
  - Rollback does not delete canonical evidence, rewrite historical attempts/events, or perform destructive migration.
  - No synthetic evidence backfill.
- **Stop Conditions**: 
  - Exact execution predecessor not independently bound.
  - Dependency state changes.
  - Canonical owner changes.
  - P7-00 status becomes stale/superseded.
  - Active writer overlap.
  - Allowlist expansion required.
  - New dependency required.
  - Architectural parallel truth required.
  - Canonical events insufficient.
  - Natural RED invalid.
  - Test/source immutability violated.
  - AI authority required.
  - FSRS mutation required.
  - Canonical conflict appears.
  - Evidence schema cannot be reproduced.
  - Main/authorization identity becomes stale.
