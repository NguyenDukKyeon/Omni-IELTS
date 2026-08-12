# Wave Authorization Manifest: W6-P7-00-WKN-AUTH-001

Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Artifact status: `DRAFT_AUTHORIZATION_CANDIDATE`

This manifest authorizes the bounded implementation of P7-00 (Metrics reducer) and the canonical rebind of WKN-00 (WeaknessProfile).

## 1. Package Identity
- **Wave/Package ID**: Wave 6 / P7-00
- **Canonical Owner**: P7-00 (Metrics reducer). `WKN-00` is absorbed into `P7-00` as a deterministic projection boundary. `U-FD` remains a non-owning grouping umbrella.
- **Writer**: Wave 6 / P7-00 Bounded Implementer

## 2. Predecessor & Baseline
- **Exact Planning/Governance Predecessor**: `09fa699d61b0ce6f2ebc3785dffda5b40bf1164e`
- **Exact Implementation Predecessor**: The exact final merge commit of the PR for this authorization candidate.
- **Dependency State**: P1-02 (`ACCEPTED`), P1-08 (`ACCEPTED`). P7-00 is `NEXT`. Downstream Phase 7 (P7-01 to P7-05) remains `PHASE_BLOCKED`.
- **Baseline Identity**: The exact implementation predecessor commit.

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
  - `package.json` (MODIFY - if script additions are strictly needed for testing)
- **Exclusions**:
  - Any file in `src/` not explicitly allowlisted.
  - `src/fsrs-scheduler.js` (Must remain pure and untampered).
  - `src/evidence-policy.js` (Gateway is `ACCEPTED`; no modifications).
  - Any file in `server/` or `tests/` unrelated to P7-00.

## 5. Execution Protocol
- **Test-First Requirement**: MUST commit failing tests proving the natural RED predicate before any source mutation.
- **Natural RED Predicate**: A test demonstrating that event reducers for canonical Phase 7 metrics and weakness profiles do not yet exist or fail to project historical canonical events.
- **Invalidation Predicates**: 
  - Any drift from the exact implementation predecessor.
  - Branch race or ownership overlap.
  - Test weakening (modifying legacy assertions to make them pass).
  - Calling external AI to compute a weakness profile.
- **Minimal GREEN Boundary**: The natural RED tests pass purely by consuming `P1-02` events and projecting deterministic, repeatable metric/weakness states.
- **Verification Profile**: Full suite must pass (`npm run phase0:gate` equivalents).

## 6. Acceptance & Rollback
- **Source of Acceptance Criteria**: `docs/IMPLEMENTATION_PLAN.md` and this manifest.
- **Evidence Paths/Schema**: Must emit a digest-backed WeaknessProfile artifact that can be reproduced identically by re-reducing the event ledger.
- **Migration/Rollback Obligations**: Additive projection only. Rollback simply ignores the new projection without altering canonical events.
- **Stop Conditions**: 
  - Cannot formulate weakness purely from canonical events.
  - Required canonical events are missing from `P1-02`/`P1-08`.
  - Conflict with `docs/ROADMAP.md` arises.
