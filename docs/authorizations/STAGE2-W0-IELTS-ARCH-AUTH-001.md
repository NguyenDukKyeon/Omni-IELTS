# Wave Authorization Manifest — Stage 2 Wave W0 (IELTS Product Contracts & Track Architecture)

Manifest Identity: **STAGE2-W0-IELTS-ARCH-AUTH-001**  
Wave ID: **W0-IELTS-ARCH-001**  
Wave Name: **IELTS Product Contracts & Track Architecture**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046)  
Date: **2026-08-15**  
Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**  
Canonical Predecessor (Base): **`a755ae4949746a71ac86299b34766ad8fe3b6fb6`** (Merge PR #87 / `STAGE2-IELTS-STRATEGY-001`)  
Target Implementation Branch (Future): **`exec/stage2-w0-ielts-arch-001`**  

---

## 1. Executive Summary and Authority Separation

### 1.1 Authority Hierarchy
This authorization manifest is governed strictly by the repository authority hierarchy:

$$\begin{matrix}
\text{Level 1: Master Product Roadmap } (\texttt{docs/MASTER\_ROADMAP.md}) \\
\downarrow \\
\text{Level 2: Accepted Stage 2 Strategy } (\texttt{docs/STAGE2\_IELTS\_COMPLETENESS\_STRATEGY.md}) \\
\downarrow \\
\textbf{Level 3: This Bounded Wave Authorization } (\textbf{STAGE2-W0-IELTS-ARCH-AUTH-001}) \\
\downarrow \\
\text{Level 4: Future W0 Bounded Execution } (\text{Commit A RED } \to \text{ Commit B GREEN}) \\
\downarrow \\
\text{Level 5: Independent Implementation Audit \& Acceptance}
\end{matrix}$$

### 1.2 Controlling Authorities Fresh-Read Ledger
1. **`docs/MASTER_ROADMAP.md`**: Canonical Stage 1–8 Master Product Roadmap (ADR-049). Records Stage 2 (IELTS Completeness) as the current `NEXT` Stage and Stage 1/1.5 as `COMPLETE`.
2. **`docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`**: Independently accepted strategy candidate (PR #87, verdict `ACCEPT`, commit `a755ae4949746a71ac86299b34766ad8fe3b6fb6`, comment `5301744713`). Ratified Owner Option B: **Full IELTS Platform** (`IELTS Academic` + `IELTS General Training` across `Listening`, `Reading`, `Writing`, `Speaking`).
3. **`docs/ROADMAP.md`**: Subordinate Level 2 Technical Package Taxonomy for Phase 0–7.
4. **`docs/IMPLEMENTATION_STATUS.md`**: Single source of truth for execution evidence and commit bindings.
5. **`docs/DECISIONS.md`**: Architecture decision records, specifically ADR-004 (EvidencePolicy gateway), ADR-005 (Failure persistence), ADR-030 (Coaching containment), ADR-031/032 (Backup schema v2 & restore safety), ADR-046 (Bounded Execution Capsules), ADR-049 (Master Roadmap), and ADR-050 (Full IELTS Platform).
6. **`AGENTS.md`**: Repository invariant rules, test integrity, single-writer rule, and evidence hierarchy.

### 1.3 Explicit Non-Authority Statement
> [!IMPORTANT]
> - This document is an **AUTHORIZATION MANIFEST CANDIDATE ONLY**.
> - It does **NOT** grant execution authority to begin writing W0 implementation code.
> - Execution authority is granted **ONLY** after an Independent Authorization Auditor reviews this candidate and issues a formal `ACCEPT` verdict.
> - The authorization implementer must **NOT** self-accept, merge, begin W0 source code, or create implementation branches.
> - `W0_IMPLEMENTATION_NOT_AUTHORIZED` remains in effect until independent acceptance.

---

## 2. Exact Wave Mission and Scope Ledger

### 2.1 Wave Mission
Establish the canonical domain contracts, schema extensions, test-type track routing (`Academic` vs `General Training`), practice hierarchy definitions, session/interruption contracts (S15-F005), and storage/backup foundations required for the Full IELTS Platform.

### 2.2 In-Scope Capabilities
1. **Track Routing Contracts & Public Semantics:**
   - Canonical test-type identifiers: `academic` and `general-training`.
   - Domain-level track validation and fail-closed behavior on unknown or invalid values.
   - Serialization and versioning of track configurations.
   - Dual-lifecycle track resolution: global learner preference stored in user settings (`IELTS_STORE_NAMES.settings`) + launch-scoped track override.
   - Default behavior: no silent default conversion to Academic or GT for unspecified test launches; explicit selector or saved preference required; fallback prompts learner or fails closed.
2. **Multi-Part Test and Section Blueprint Schemas:**
   - Canonical `ielts-test-blueprint` schema v1 (`IELTS_TEST_BLUEPRINT_KIND`, `IELTS_TEST_BLUEPRINT_VERSION = 1`).
   - Canonical `ielts-section-blueprint` schema v1 (`IELTS_SECTION_BLUEPRINT_KIND`, `IELTS_SECTION_BLUEPRINT_VERSION = 1`).
   - Deterministic blueprint identity derivation (`ielts-blueprint:<sha256>`) and immutable content digest validation.
   - Formal bindings to `SourceRevisionRef` for passage, transcript, visual prompt, and task card provenance.
   - Timing policies (mode, time limits, audio transfer time) and exam vs practice policies.
3. **Practice Hierarchy Representation:**
   - Canonical enum and metadata contracts for the 4 Stage 2 practice granularities:
     - `TASK_FAMILY`: Focused drill on specific question/prompt variants.
     - `PART_OR_SECTION`: Single listening part (10 items) or single reading passage/section.
     - `SKILL_TEST`: Complete 40-item Listening/Reading test, 2-task Writing, or 3-part Speaking test.
     - `FULL_MOCK`: Complete timed 4-skill simulation (Listening $\to$ Reading $\to$ Writing $\to$ Speaking).
   - Constant `IELTS_PRACTICE_HIERARCHY_LEVELS = Object.freeze(['TASK_FAMILY', 'PART_OR_SECTION', 'SKILL_TEST', 'FULL_MOCK'])`.
4. **Session Execution & Interruption / Resume Contract (S15-F005):**
   - Formal separation of 4 distinct lifecycle concepts:
     - $\text{BLUEPRINT} \ne \text{ACTIVE SESSION/RUN} \ne \text{PARTIAL CHECKPOINT} \ne \text{COMPLETED ATTEMPT}$
   - Short task-family practice policy: `RESTART_EXISTING_RUN` (clean restart from item 1, zero write amplification).
   - Timed section tests and full mocks policy: `CHECKPOINT_AND_RESUME` (embedded partial response and timer autosave).
   - Checkpoint invariants:
     - $\text{CHECKPOINT} \ne \text{ATTEMPT}$
     - $\text{CHECKPOINT} \ne \text{RECEIPT}$
     - $\text{CHECKPOINT} \ne \text{EVIDENCE DECISION}$
     - $\text{affectsSchedule} = \text{false}$
     - $\text{evidenceEligible} = \text{false}$
     - Zero FSRS schedule mutation from incomplete test sessions.
     - Checkpoint state never emits positive learner evidence directly.
5. **Persistence & Store Manifest:**
   - Additive IndexedDB stores in database `vocab-master-ielts`: `ieltsTestBlueprints` and `ieltsTestRuns`.
   - Forward-compatible migration ledger entry `wave0-ielts-product-contracts-v4` moving `IELTS_DB_VERSION` from 3 to 4.
6. **Backup Registry & Safety:**
   - Canonical registration of `ieltsTestBlueprints` and `ieltsTestRuns` in `BACKUP_STORE_REGISTRY`.
   - Additive upgrade handlers in `backup-registry.js` supporting dual-read legacy backups (v2, v3, v4, v5) and emitting full backup schema v6.
7. **Minimal UI Track Selector & Routing Proof:**
   - Minimal user-facing Academic vs General Training switcher in IELTS Hub v2 (`src/ielts-hub-v2.js` / `src/primary-ia-v10.js`).
   - Persists selected track to user settings and dispatches track change notifications.
   - Filters lesson/test views by selected track.

### 2.3 Explicit Out-of-Scope Ledger (Wave Boundaries)
The following capabilities are **STRICTLY EXCLUDED** from Wave W0:
- **W1 (Objective Question Kernel Completeness):** Multi-select MCQ ($N$ of $M$), box-option summary matching, QAR registry extensions.
- **W2 (Listening Platform Completeness):** 4-part 40-item audio test runner, audio player synchronization, exam vs practice audio playback modes.
- **W3 (Reading Platform Completeness):** Academic 3-passage runner, GT 3-section runner, split-pane reading layout, 60-min timer, raw-to-band conversion curves.
- **W4 (Productive Writing Platform):** Visual prompt renderers (graphs, charts, tables, maps, processes), GT letter templates, Task 2 essay prompts, 4-dimension rubric feedback generator.
- **W5 (Productive Speaking Platform):** 3-part guided speaking simulation state machine, audio capture/playback, Part 2 cue-card timer, rubric feedback generator.
- **W6 (Section Practice & Full Mock Orchestrator):** Multi-skill test coordinator state machine, cumulative mock score aggregation, Stage 2 exit gate verification.
- **Interstage Scope (Stages 3, 4, 5):** Broad learning-science research (Stage 3), global application redesign/IA remake (Stage 4), AI provider benchmarking/engine switching (Stage 5).
- **Administrative / Official Scope:** IELTS Life Skills, test booking/registration, invigilator workflows, test-centre biometric authentication, scraping official proprietary question banks.

---

## 3. Architecture Preservation and Substrate Reuse

Wave W0 extends the existing Stage 1 substrate without introducing competing authorities or duplicate truth stores:

| Component | Source Path | Classification | Governance & Anti-Duplication Rule |
|---|---|---|---|
| **Learning Spine Contracts** | `src/learning-contracts.js` | **REUSE** | `ActivitySpec`, `Run`, `Attempt`, `Receipt`, `EvidenceDecision` remain the sole execution envelopes. No second attempt structure. |
| **EvidencePolicy Gateway** | `src/evidence-policy.js` | **REUSE** | Default-deny gateway remains the sole FSRS mutation path (ADR-004). W0 blueprints and runs cannot bypass the gateway. |
| **SourceRevisionRef** | `src/source-revision-ref.js` | **REUSE** | Immutable locator, integrity, and provenance binding for test passages, transcripts, and task prompts. |
| **Objective Inventory** | `src/ielts-profile-inventory.js` | **REUSE & EXTEND** | `IELTS_OBJECTIVE_PROFILES` (`['academic', 'general-training']`) is reused as the foundational profile vocabulary. |
| **IELTS Domain Contracts** | `src/ielts-domain.js` | **EXTEND** | Extend with track enums, blueprint schemas, practice hierarchy definitions, and store name constants (`ieltsTestBlueprints`, `ieltsTestRuns`). |
| **IELTS Persistence** | `src/ielts-persistence.js` | **EXTEND** | Add forward-compatible object stores `ieltsTestBlueprints` and `ieltsTestRuns` under migration v4. |
| **Backup Registry** | `src/backup-registry.js` | **EXTEND** | Register new durable stores in `BACKUP_STORE_REGISTRY` (schema v6) and maintain dual-read backward compatibility with legacy backups. |
| **IELTS Hub v2 & Primary IA** | `src/ielts-hub-v2.js` / `src/primary-ia-v10.js` | **EXTEND** | Add minimal track selector toggle and track-filtered content view without global layout redesign. |

### Classification Rationale for New Bounded Contracts
1. **`IeltsTestBlueprint` (NEW_BOUNDED_CONTRACT):** Existing `FrozenAssessmentBlueprint` represents an untimed single-form multi-item structure. Downstream Stage 2 Waves (W2, W3, W6) require multi-section, multi-part test specifications with timing, audio policies, and track binding. `IeltsTestBlueprint` defines this immutable schema without duplicating `QuestionActivity` definitions.
2. **`IeltsTestRun` & Session Checkpoint (NEW_BOUNDED_CONTRACT):** Existing `FrozenAssessmentRun` stores atomic completion state without intermediate autosave. `IeltsTestRun` provides the active session state container (with embedded partial responses and elapsed timer) to fulfill S15-F005 reload resilience. It strictly preserves `affectsSchedule: false` and emits canonical `Attempt` records only upon complete submission.

---

## 4. Persistence Model and Store Manifest

Wave W0 establishes exactly two new durable object stores in IndexedDB `vocab-master-ielts`:

### 4.1 Store Manifest

```text
STORE 1:
STORE_ID:              ieltsTestBlueprints
OWNER_MODULE:          src/ielts-persistence.js
PURPOSE:               Durable storage of verified multi-part test and section blueprints.
KEY / IDENTITY:        id (String, e.g. "ielts-blueprint:<sha256>")
KEYPATH:               id
INDEXES:               track (non-unique), skill (non-unique), status (non-unique), updatedAt (non-unique)
SCHEMA_VERSION:        1
WRITE_LIFECYCLE:       Written when blueprints are verified, installed from content packs, or created as synthetic test definitions.
READ_LIFECYCLE:        Read when launching section tests, skill tests, or full mock exams.
FINALIZATION:          Immutable once verified.
DELETION / RETENTION:  Retained durably; soft-retirement supported.
BACKUP_REQUIRED:       YES (durable)
RESTORE_BEHAVIOR:      stage-replace-verify
MIGRATION:             Created in IELTS DB Version 4 (wave0-ielts-product-contracts-v4).
ROLLBACK:              Additive store ignored by legacy readers.
EVIDENCE_ELIGIBILITY:  false
FSRS_IMPACT:           none (affectsSchedule: false)
DOWNSTREAM_WAVES:      W2 (Listening), W3 (Reading), W4 (Writing), W5 (Speaking), W6 (Mock Orchestrator)

STORE 2:
STORE_ID:              ieltsTestRuns
OWNER_MODULE:          src/ielts-persistence.js
PURPOSE:               Durable storage of active test session states, elapsed timers, partial response checkpoints, and completed test run summaries.
KEY / IDENTITY:        id (String, e.g. "ielts-run:<uuid>")
KEYPATH:               id
INDEXES:               blueprintId (non-unique), track (non-unique), status (non-unique), updatedAt (non-unique)
SCHEMA_VERSION:        1
WRITE_LIFECYCLE:       Created on test session start; updated on answer change / timer tick (throttled checkpoint); finalized on test submit/complete.
READ_LIFECYCLE:        Read on test screen reload/resume and score reporting.
FINALIZATION:          Transitions from ACTIVE to COMPLETED, ABANDONED, or EXPIRED.
DELETION / RETENTION:  Retained for learner test history.
BACKUP_REQUIRED:       YES (durable)
RESTORE_BEHAVIOR:      stage-replace-verify
MIGRATION:             Created in IELTS DB Version 4 (wave0-ielts-product-contracts-v4).
ROLLBACK:              Additive store ignored by legacy readers.
EVIDENCE_ELIGIBILITY:  false (Active checkpoints never emit evidence; completed runs emit canonical Attempt/Receipt through learning-contracts).
FSRS_IMPACT:           none (affectsSchedule: false)
DOWNSTREAM_WAVES:      W2, W3, W4, W5, W6
```

### 4.2 Interruption / Checkpoint Ownership Reconciliation (S15-F005)
1. **Embedded Checkpoint State:** `ieltsSessionCheckpoint` is modeled as an embedded sub-object inside `ieltsTestRuns` rather than a separate third physical table. This eliminates cross-store synchronization race conditions during test session recovery.
2. **Atomic Reload Invariant:** On browser reload during an active test, `src/ielts-persistence.js` reads the active `ieltsTestRuns` record for the user, restores the elapsed seconds and answered item responses, and re-renders the exact question state.
3. **No Masquerading:** An incomplete `ieltsTestRuns` record cannot emit `ReviewEvent` or mutate `WeaknessProfile`. Only a completed test run evaluated against verified answer keys produces an `Attempt` envelope submitted to `EvidencePolicy`.

---

## 5. Exact Implementation Allowlist

Future W0 execution is strictly bounded to the following closed file sets. Writing to any file outside this allowlist is a protocol violation.

### 5.1 Source Allowlist (`SOURCE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `src/ielts-domain.js` | Add `IELTS_TRACKS`, `IeltsTestBlueprint` schemas, `IeltsSectionBlueprint` schemas, `IELTS_PRACTICE_HIERARCHY_LEVELS`, test run contracts, and extend `IELTS_STORE_NAMES`. | EXTEND |
| `src/ielts-profile-inventory.js` | Re-export / align profile validation with domain-wide track contracts. | EXTEND |
| `src/ielts-persistence.js` | Define `IELTS_DB_VERSION = 4`, migration `wave0-ielts-product-contracts-v4`, object store creation (`ieltsTestBlueprints`, `ieltsTestRuns`), indexes, and CRUD methods. | EXTEND |
| `src/backup-registry.js` | Register `ieltsTestBlueprints` and `ieltsTestRuns` in `BACKUP_STORE_REGISTRY`, bump full backup version to 6, and add legacy v5 upgrade adapter. | EXTEND |
| `src/ielts-hub-v2.js` | Add minimal user-facing Academic vs General Training track selector toggle and track-filtered content view. | EXTEND |
| `src/primary-ia-v10.js` | Wire track selector state / events if needed for navigation sync. | EXTEND |

### 5.2 Test Allowlist (`TEST_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `tests/ielts-domain.test.mjs` | Unit tests for track validation, blueprint schemas, practice hierarchy enums, and session checkpoint invariants. | EXTEND |
| `tests/ielts-persistence.test.mjs` | Unit and integration tests for `ieltsTestBlueprints` and `ieltsTestRuns` persistence, migration v4, and partial checkpoint reload. | EXTEND |
| `tests/backup-registry.test.mjs` | Backup sentinel assertions for `ieltsTestBlueprints` and `ieltsTestRuns`, 100% store coverage, and v5 $\to$ v6 legacy upgrade tests. | EXTEND |
| `tests/restore-safety.test.mjs` | Full backup export and restore roundtrip tests with new IELTS stores. | EXTEND |
| `tests/ielts-track-routing.test.mjs` | Dedicated integration tests for Academic vs General Training track routing, settings persistence, and fail-closed behavior. | NEW |
| `tests/ielts-track-routing-browser.test.mjs` | Browser smoke test for IELTS Hub track switcher interaction. | NEW |

### 5.3 Fixture Allowlist (`FIXTURE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `tests/fixtures/synthetic-ielts-blueprints.json` | Deterministic, repository-owned synthetic test blueprint fixtures for Academic and General Training validation. | NEW |

### 5.4 Docs and Evidence Allowlist (`DOC_EVIDENCE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md` | This authorization manifest. | NEW |
| `docs/IMPLEMENTATION_STATUS.md` | Status ledger tracking authorization candidate and execution milestones. | EXTEND |

---

## 6. RED / GREEN Execution Topology and Specification

Future W0 execution must follow a strict, two-commit RED $\to$ GREEN verification topology under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`:

```text
Canonical Base (a755ae4949746a71ac86299b34766ad8fe3b6fb6)
     │
     ▼
[COMMIT A: RED Tests Only] (Adds failing test assertions; zero src/** edits)
     │
     ├─▶ Verified expected failure predicates (Missing contracts/stores)
     ├─▶ Zero syntax / compile / import breakages
     │
     ▼
[COMMIT B: GREEN Implementation] (Edits allowed src/** only; RED tests become immutable)
     │
     ├─▶ 100% Unit, Integration, and Backup tests pass
     ├─▶ Minimal track selector browser smoke passes
     └─▶ Exact-head remote CI succeeds
```

### 6.1 Commit A — RED Test Contract and Expected Failure Predicates

Commit A must introduce the complete acceptance test suite into `tests/**` without modifying `src/**`. The tests must fail cleanly with exact expected predicates:

| Test Path | Predicate / Assertion | Expected Failure on Predecessor | Verification Rationale |
|---|---|---|---|
| `tests/ielts-domain.test.mjs` | `assert.ok(IELTS_TRACKS.includes('academic'))`<br>`assert.equal(validateIeltsTrack('invalid').valid, false)` | `ReferenceError: IELTS_TRACKS is not defined` | Proves track routing domain enum is missing. |
| `tests/ielts-domain.test.mjs` | `assert.equal(validateIeltsTestBlueprint(syntheticBp).valid, true)` | `ReferenceError: validateIeltsTestBlueprint is not defined` | Proves test blueprint schema contract is missing. |
| `tests/ielts-domain.test.mjs` | `assert.ok(IELTS_PRACTICE_HIERARCHY_LEVELS.includes('FULL_MOCK'))` | `ReferenceError: IELTS_PRACTICE_HIERARCHY_LEVELS is not defined` | Proves practice hierarchy enum is missing. |
| `tests/ielts-persistence.test.mjs` | `await persistence.openIeltsDatabase()`<br>`assert.ok(db.objectStoreNames.contains('ieltsTestBlueprints'))` | `AssertionError: false == true` (Store missing in DB v3) | Proves `ieltsTestBlueprints` store is missing in IndexedDB. |
| `tests/ielts-persistence.test.mjs` | `await persistence.saveIeltsTestRun(activeRun)`<br>`assert.equal(run.affectsSchedule, false)` | `TypeError: persistence.saveIeltsTestRun is not a function` | Proves test run persistence and checkpoint contract are missing. |
| `tests/backup-registry.test.mjs` | `const audit = registry.auditBackupRegistry()`<br>`assert.deepEqual(audit.errors, [])` | `AssertionError: missing stores in backup registry` | Proves new durable stores are not yet registered in backup schema. |
| `tests/ielts-track-routing.test.mjs` | `assert.equal(await getSelectedIeltsTrack(), 'academic')` | `TypeError: getSelectedIeltsTrack is not a function` | Proves track preference resolution is missing. |
| `tests/ielts-track-routing-browser.test.mjs` | `await page.click('[data-ielts-track="general-training"]')`<br>`assert.match(await page.textContent('#activeTrack'), /General Training/)` | `Selector not found: [data-ielts-track]` | Proves user-facing track selector is missing in UI. |

### 6.2 RED Immutability Rule
Once Commit A is committed and its failure predicates verified:
1. The RED test files become **STRICTLY IMMUTABLE** for Commit B.
2. The executor must **NOT** weaken assertions, skip tests, or alter expected values during Commit B.
3. If an unforeseen technical contradiction requires modifying a RED test, the executor must **STOP** immediately with reason `RED_TEST_MUTATION_REQUIRED`.

### 6.3 Commit B — GREEN Acceptance Gates
Commit B must implement the minimal required source code in `src/**` to satisfy all RED predicates:
1. `npm test` passes 100% of all unit and integration tests (zero failures, zero skips).
2. `npm run check` passes with zero lint or contract errors.
3. `npm run audit:roadmap` and `npm run audit:ielts` pass cleanly.
4. `npm run test:backup` and `npm run test:restore` pass with 100% store coverage in schema v6.
5. All pre-existing Stage 1 regression tests remain 100% green.
6. Minimal track selector browser test passes deterministically.

---

## 7. Migration and Rollback Contracts

### 7.1 Migration Contract
- **Migration ID:** `wave0-ielts-product-contracts-v4`
- **Database:** `vocab-master-ielts`
- **Old Version:** `3`
- **New Version:** `4`
- **Migration Class:** `FORWARD_ONLY_ADDITIVE_IDB_MIGRATION`
- **Transaction Operations:**
  1. Create object store `ieltsTestBlueprints` (keyPath `id`) with indexes on `track`, `skill`, `status`, `updatedAt`.
  2. Create object store `ieltsTestRuns` (keyPath `id`) with indexes on `blueprintId`, `track`, `status`, `updatedAt`.
- **Old Data Preservation:** Existing stores (`errorRecords`, `lexicalSets`, `lexicalRelations`, `labItems`, `readingPassages`, `readingAttempts`, `mediaSources`, `transcriptionJobs`, `transcriptSegments`, `mediaAttempts`, `mediaProgress`, `settings`, `objectiveInventory`, `learnerArtifacts`, `frozenAssessments`) are completely untouched.
- **Forward Compatibility:** Migration recorded in `IELTS_STORE_NAMES.settings` via forward-compatible `openForwardCompatibleDatabase`.

### 7.2 Rollback Contract
- **Rollback Class:** `ADDITIVE_READER_COMPATIBLE` + `ROUTE_DISABLED`
- **Safe Rollback Properties:**
  1. Reverting the codebase to predecessor `a755ae4949746a71ac86299b34766ad8fe3b6fb6` leaves the database at version 4.
  2. The forward-compatible database opener in predecessor code safely opens database version 4 and ignores the unknown additive stores (`ieltsTestBlueprints`, `ieltsTestRuns`).
  3. No learner data in pre-existing stores is modified, truncated, or dropped during rollback.
  4. Restoring legacy full-backups (v2, v3, v4, v5) remains fully functional.

---

## 8. Dependency, Technology, and Security Policies

### 8.1 Dependency Policy
$$\text{DEPENDENCY\_CHANGE: \textbf{NONE}}$$
- Zero new npm runtime or dev dependencies.
- Zero new cloud services, backend servers, or external database engines.
- Zero new AI provider SDKs.

### 8.2 Security and Privacy Invariants
1. **No Answer-Key Exposure:** Blueprint schemas and client-delivered session models must not expose raw answer keys before item submission.
2. **No Credential Ingestion:** Blueprint and run schemas must pass `rejectSensitive()` to prevent tokens, API keys, or private filesystem paths from entering IndexedDB or backups.
3. **No External Network Calls:** Track selection, blueprint resolution, and session autosave are 100% local-first.
4. **Deterministic Synthetic Fixtures:** All test fixtures are synthetic and repository-owned.

---

## 9. Verification Commands and CI Obligations

### 9.1 Local Verification Suite
The W0 executor must run and verify the following commands before completing Commit B:

```bash
# 1. Full test suite execution
npm test

# 2. Static cross-check & syntax validation
npm run check

# 3. Roadmap & IELTS governance audits
npm run audit:roadmap
npm run audit:ielts

# 4. Backup & restore sentinel verification
npm run test:backup
npm run test:restore

# 5. Dedicated IELTS domain & persistence tests
npm run test:ielts

# 6. Production build verification
npm run build
```

### 9.2 Natural Exact-Head CI Requirements
- Pull request CI workflow (`.github/workflows/ci.yml`) must run naturally on the exact authorization PR head and the subsequent implementation PR head.
- Manual triggers (`workflow_dispatch`), reruns, empty commits, draft-toggle tricks, or close/reopen tricks are strictly prohibited.
- CI must verify all 7 standard verification artifacts: `test-output.txt`, `check-output.txt`, `roadmap-output.txt`, `ielts-audit-output.txt`, `v10-test-output.txt`, `v10-audit-output.txt`, `yt-dlp-version.txt`.

---

## 10. Execution Stop Conditions

The executor must **HALT IMMEDIATELY** and fail closed if any of the following conditions are encountered:

1. `CANONICAL_BASE_DRIFT`: Canonical `main` is not `a755ae4949746a71ac86299b34766ad8fe3b6fb6`.
2. `AUTH_BRANCH_COLLISION`: Branch `auth/stage2-w0-ielts-arch-001` or `exec/stage2-w0-ielts-arch-001` already exists with conflicting commits.
3. `CONTROLLING_STRATEGY_MISMATCH`: Proposed semantics conflict with `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`.
4. `W0_SCOPE_AMBIGUITY`: Ambiguity regarding whether a capability belongs to W0 vs downstream Waves (W1–W6).
5. `W0_PERSISTENCE_OWNERSHIP_AMBIGUITY`: Unresolved conflict regarding store identities, keyPaths, or backup rules.
6. `RED_CONTRACT_AMBIGUITY`: RED tests fail due to unexpected syntax/import errors rather than missing product behavior.
7. `RED_TEST_MUTATION_REQUIRED`: Inability to achieve GREEN without altering immutable RED test assertions.
8. `MIGRATION_AUTHORITY_GAP`: Schema migration requires non-additive or destructive IndexedDB changes.
9. `DEPENDENCY_AUTHORITY_REQUIRED`: Implementation requires new npm packages or external runtime services.
10. `STAGE_BOUNDARY_CONFLICT`: Implementation attempts to absorb W1–W6 skill runners, Stage 3 research, or Stage 4 UX redesign.
11. `UNEXPECTED_NON_DOCS_CHANGE`: Unauthorized modifications detected in `src/**`, `tests/**`, or `package.json` during the authorization phase.

---

## 11. Authorization Candidate Sign-Off

- **Author Role:** STAGE 2 W0 IELTS ARCHITECTURE AUTHORIZATION IMPLEMENTER
- **Authorization Transaction:** `STAGE2-W0-IELTS-ARCH-AUTH-001`
- **Target Wave:** `W0-IELTS-ARCH-001` (IELTS Product Contracts & Track Architecture)
- **Target Branch:** `main` (predecessor `a755ae4949746a71ac86299b34766ad8fe3b6fb6`)
- **Execution Authority:** `NOT_GRANTED_UNTIL_INDEPENDENT_AUDIT`
- **W0 Implementation Status:** `NOT_STARTED`
- **Stage 2 Implementation Status:** `NOT_STARTED`
- **Handoff Target:** `INDEPENDENT STAGE 2 W0-IELTS-ARCH-001 AUTHORIZATION AUDITOR`
