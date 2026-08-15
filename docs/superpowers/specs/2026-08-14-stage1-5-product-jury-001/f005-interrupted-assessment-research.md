# Stage 1.5 Research Note: Interrupted Frozen Assessment Lifecycle (S15-F005)

**Status:** `RESEARCH / NOT_IMPLEMENTATION / NOT_AUTHORIZATION`  
**Finding ID:** `S15-F005`  
**Target:** `src/frozen-assessment-contracts.js`, `src/frozen-assessment-runtime.js`, `src/ielts-persistence.js`, `src/ielts-backup.js`  
**Date:** 2026-08-14  

---

## 1. Context and Problem Statement

In Wave 6 / Stage 1 package `W6-ASM-00-014`, the Frozen Assessment runtime and persistence layer was established as a multi-item immutable assessment execution substrate. Under this model:
- Blueprints (`frozen-assessment-blueprint`) define an immutable set of questions.
- Runs (`frozen-assessment-run`) track assessment lifecycle transitions from `ACTIVE` to `COMPLETED`.

However, the current runtime persists only the initial `ACTIVE` state and the terminal `COMPLETED` state. Partial responses submitted incrementally by a learner during an active assessment session are not persisted to durable storage. Consequently, if a learner experiences an interruption (e.g., browser tab close, page refresh, mobile process termination), the in-progress response state is lost.

This research note documents the architectural analysis of interrupted assessment semantics, evaluates candidate recovery strategies, and provides a formal recommendation for Stage 2 planning.

---

## 2. Technical Analysis of the 12 Assessment Invariants

### 2.1 Exact ACTIVE Lifecycle
When a run is initiated via `createFrozenAssessmentRuntime.startRun({ id, blueprintId, at })`:
1. The input parameters (`id`, `blueprintId`, `at`) are validated for plain data safety, symbol absence, and accessor fencing (`assertSafeAssessmentData`).
2. The runtime verifies that `blueprintId` exists in the durable store.
3. If an existing run with `id` exists:
   - If `existingRun.blueprintId === blueprintId`, it idempotently returns the existing run.
   - If `existingRun.blueprintId !== blueprintId`, it throws `FROZEN_ASSESSMENT_BLUEPRINT_COLLISION`.
4. If no run exists, an initial run object is constructed:
   ```javascript
   {
     kind: 'frozen-assessment-run',
     id: String(id),
     blueprintId: String(blueprintId),
     status: 'ACTIVE',
     startedAt: Number(at),
     updatedAt: Number(at),
     representative: false,
     bandScore: null,
     readiness: null,
     mastery: null,
     affectsSchedule: false,
     evidenceEligible: false
   }
   ```
5. The run is persisted to IndexedDB (`ielts.frozenAssessments`) via `ownerAdapter.saveRun(run)`.
6. The run remains in status `ACTIVE` until `completeRun` is invoked with all responses matching `blueprint.coverage.itemCount`.

### 2.2 What Survives Reload
- The immutable `AssessmentBlueprint` in `ielts.frozenAssessments`.
- The `ACTIVE` run record containing `id`, `blueprintId`, `status: 'ACTIVE'`, `startedAt`, and `updatedAt`.
- The database indexes (`kind`, `blueprintId`, `updatedAt`) and backup/restore representations.

### 2.3 What Partial Response State Is Lost
- Any intermediate item responses (e.g., question 1 through $k$ of an $N$-item assessment) selected by the learner prior to completion.
- Client-side timing or item-level duration data.
- Unsubmitted scratch work or candidate answers stored only in ephemeral DOM/component memory.

### 2.4 Actual Current Reload/Recovery Behavior
- Upon browser reload, querying `getRun(id)` returns the persisted `ACTIVE` record without any response array.
- Calling `startRun({ id, blueprintId })` idempotently returns the same `ACTIVE` record.
- Calling `completeRun({ runId, responses })` with fewer than `blueprint.coverage.itemCount` responses fails closed with `FROZEN_ASSESSMENT_INCOMPLETE`.
- There is currently no `savePartialResponse`, `abandonRun`, or `restartRun` API on `createFrozenAssessmentRuntime`.

### 2.5 Canonical Authority on Interruption
- Phase 0–7 Roadmap (`docs/ROADMAP.md`), `docs/IMPLEMENTATION_PLAN.md`, and `docs/DECISIONS.md` specify `ASM-00` as an atomic multi-item assessment run snapshot.
- Atomic completion (`completeRun` accepting all responses atomically) was the bounded scope for the Stage 1 substrate. Interruption and session journaling were intentionally omitted from Stage 1.

### 2.6 Stage 2 Dependency
- Stage 2 UI flows (e.g., Practice Assessment UI, Targeted Diagnostic test-taker) will need to handle page reloads gracefully.
- The UI layer must know whether to attempt restoring partial responses from IndexedDB or to restart the active run cleanly from item 1.

### 2.7 Option A: Resume Partial Run (`RESUME_PARTIAL_RUN`)
- **Mechanism:** Add `savePartialResponse({ runId, ordinal, response })` or allow `responses: [...]` on `ACTIVE` runs in `ielts.frozenAssessments`.
- **Pros:** Learner does not lose work on accidental refresh.
- **Cons:** Increases write amplification on IndexedDB (a durable transaction per question); requires validating partial, sparse, or out-of-order responses; expands `frozen-assessment-contracts.js` schema; introduces potential synchronization races during rapid answer selection.

### 2.8 Option B: Restart Existing Run (`RESTART_EXISTING_RUN`)
- **Mechanism:** The `ACTIVE` run record is preserved upon reload; the UI restarts presentation from item 1 with clean state. When the learner reaches the end, `completeRun` completes the existing `ACTIVE` run atomically.
- **Pros:** Zero schema changes; preserves the atomic completion invariant of `completeRun`; requires no new IndexedDB stores or partial response validation; idempotent with current `startRun` behavior.
- **Cons:** Learner must re-answer questions if they reload mid-assessment. (Acceptable for short diagnostic/practice assessments of 4–10 items).

### 2.9 Option C: Abandon and Create New Run (`ABANDON_AND_CREATE_NEW_RUN`)
- **Mechanism:** Any interrupted run is marked `ABANDONED` or left stale, and the UI generates a fresh `runId` on restart.
- **Pros:** Clean separation of attempts.
- **Cons:** Leaves orphaned `ACTIVE` run records in `ielts.frozenAssessments` unless an explicit tombstone/cleanup garbage-collection mechanism is added.

### 2.10 Evidence and Scheduling Implications
- **Invariant:** In `frozen-assessment-runtime.js`, Frozen Assessments have `affectsSchedule: false` and `evidenceEligible: false`.
- Frozen Assessments are strictly practice/diagnostic evaluations; they do NOT feed into FSRS, review intervals, or mastery claims.
- Therefore, interrupted runs have zero impact on the learner's spaced repetition schedule or evidence ledger.

### 2.11 Migration Implications
- Under `RESTART_EXISTING_RUN` or `ABANDON_AND_CREATE_NEW_RUN`: `DURABLE_MIGRATION_REQUIRED: NO`. No IndexedDB version bump or schema migration is required.
- Under `RESUME_PARTIAL_RUN`: A schema update to `frozen-assessment-contracts.js` and backup envelope registry may be required to specify the partial responses format.

### 2.12 Backup and Restore Implications
- Both `ACTIVE` and `COMPLETED` runs are currently included in the IELTS backup store (`ielts.frozenAssessments`) in v4/v6 backups.
- Current backup/restore routines handle `ACTIVE` runs without responses seamlessly.

---

## 3. Final Research Recommendation

Based on the practice/diagnostic scope of Frozen Assessment in Wave 6 (`affectsSchedule: false`, `evidenceEligible: false`), short assessment length (4–10 items), and the requirement to preserve atomic completion without write amplification or schema migration:

F005_RECOMMENDATION: RESTART_EXISTING_RUN