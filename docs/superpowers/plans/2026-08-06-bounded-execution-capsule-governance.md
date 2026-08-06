# Bounded Execution Capsule Governance Implementation Plan

Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`  
Decision: `ADR-046`  
Exact predecessor: `7dd847cc9da2f5595430e20f864c211f3ec5ddfb`  
Delivery: one docs-only commit and one Draft PR  
Protocol state after implementation: `PROPOSED / NOT ACTIVE`

## Task 1: Fresh canonical and overlap verification

Use the GitHub connector to fresh-read repository identity, default branch, `refs/heads/main`, every page of open pull requests, every changed path in each open PR, PR #28, Pilot A acceptance comment `5199827810`, the target branch and target PR search. Confirm main is the exact predecessor, the expected open registry is complete, Pilot A is `ACCEPTED / COMPLETED`, no open PR overlaps the six-file allowlist, and the target branch/PR is absent. Fresh-read the four canonical blobs and reproduce their Git blob SHAs from exact bytes. Stop with zero repository mutation on drift, incomplete pagination, overlap, malformed Pilot A acceptance or existing target identity.

## Task 2: Add protocol design document

Create `docs/superpowers/specs/2026-08-06-bounded-execution-capsule-governance-design.md`. Include the twenty required sections: purpose; authority/constraints; micro-authorization problem; rejected alternatives; entities; state machine; roles/trust; manifest schema; single- and multi-package flows; natural RED; evidence; audit; integration; failure handling; W1 application; Pilot B conditions; non-goals; acceptance criteria; rollback. State that Protocol V1 is proposed and inactive until independent exact-head acceptance and merge.

## Task 3: Patch AGENTS.md

Using a byte-level unique-anchor insertion immediately before `## Phase 0 hard gate`, add `## Bounded execution capsules`. Preserve every existing byte outside the insertion. Codify that prompt count is not a gate, independently accepted manifests may pre-authorize bounded conditional transitions, technical predicates and one-writer ownership remain mandatory, executors cannot self-accept, independent final audit remains mandatory, post-verdict integration must be explicitly pre-authorized, and drift/overlap/evidence ambiguity fail closed.

## Task 4: Patch IMPLEMENTATION_PLAN.md

Using a byte-level unique anchor, insert `### Bounded execution capsule protocol` immediately before `## 5. Dependency graph` under the existing package/commit/PR rules. Define manifest fields, role separation, the test-only Commit A and natural RED transition, minimal Commit B and exact-head GREEN, evidence pre-authorization, batch eligibility, independent audit, mechanical post-acceptance integration and fail-closed conditions. Include the normative sentence: “An accepted manifest removes separate administrative authorization handoffs. It does not remove or weaken any technical or independent acceptance predicate.” Preserve all package scopes, dependencies, criteria and history.

## Task 5: Append ADR-046

Append `## ADR-046 — Bounded execution capsules reduce handoffs without reducing gates` with `Status: CONFIRMED` to `docs/DECISIONS.md` at EOF. Preserve the complete historical prefix byte-for-byte. Explain that immutable predicates and independent acceptance, not prompt count, provide quality; preserve exact predecessor, one writer, natural RED, minimal GREEN, exact-head CI, evidence provenance and canonical authority. Reject workflow-runtime/DAG automation. State the activation gate, historical Pilot A preservation and Pilot B unauthorized conditions.

## Task 6: Patch implementation queue and W1 topology

Deterministically replace the introductory per-item approval sentence in `IMPLEMENTATION_QUEUE.md` so one independently accepted Wave Authorization Manifest may satisfy administrative authorization only through separate exact records. Preserve exact predecessor, owner, allowlist, dependency, acceptance brief and independent verdict. Insert the two-batch W1 topology before `## Wave 2 — First end-to-end value slice`: Batch A (`LI-00`, `SRC-00`, non-writing research) and Batch B (`ERR-00`, `QAR-00`) with the required dependency and writer-overlap restrictions. Keep queue status `PLANNING_ONLY / NO_IMPLEMENTATION_AUTHORIZATION`.

## Task 7: Cross-document consistency verification

Calculate original and final Git blob SHAs, byte lengths and deterministic unified diffs. Verify four modified files and two added files, no deletion and no seventh path. For each existing file, verify unique anchor count, unchanged prefix and suffix, preserved line endings and final-newline state. Check all documents consistently state protocol name, ADR identity, proposed/inactive state, canonical authority, role separation, natural RED, exact-head GREEN, implementer-evidence non-acceptance, W1 topology, Pilot A preservation and Pilot B unauthorized status. Reject placeholder markers and deferred-content stubs.

## Task 8: Create one atomic docs-only commit and Draft PR

Fresh-read main immediately before object creation and require the exact predecessor. Create six final blobs, one tree based on the predecessor tree, and one commit with message `docs: authorize bounded execution capsule governance`. Perform the target-ref race gate, then create/update only `chatgpt/ewf-bounded-execution-governance-v1` without force. Read back the branch, commit, parent, tree and six changed paths. Create one Draft PR titled `docs: authorize bounded execution capsule governance` with base `main` and the required protocol, decision, Pilot A, Pilot B, independent-acceptance and no-merge boundaries.

## Task 9: Bind exact-head CI and hand off for independent audit

Observe the natural CI associated with the exact branch head; do not manually rerun. Read back workflow/run/job identities, exact head SHA and conclusion. Record the exact six-file delta, original/final blob identities and CI state. Stop after the natural exact-head observation. Do not issue an acceptance verdict, activate the protocol, merge the PR, authorize Pilot B or modify canonical status. Hand off the exact head for an independent governance audit.
