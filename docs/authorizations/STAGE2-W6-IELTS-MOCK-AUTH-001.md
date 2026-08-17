# Wave Authorization Manifest — Stage 2 Wave W6 (Section Practice, Full Mock Orchestration & Stage 2 Exit Verification)

Manifest Identity: **STAGE2-W6-IELTS-MOCK-AUTH-001**  
Wave ID: **W6-IELTS-MOCK-001**  
Wave Name: **Section Practice, Full Mock Orchestration & Stage 2 Exit Verification**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046) under **EXECUTION_PROMPT_PROTOCOL_V2** (ADR-051)  
Date: **2026-08-17**  
Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**  
Canonical Predecessor (Base): **`aee09ec2d22353f79a3730c9c3d3e699ccd56856`**  
Target Implementation Branch (Future): **`exec/stage2-w6-ielts-mock-001`**  
Effective Implementation Predecessor: **`PENDING_POST_ACCEPT_ACTIVATION`**  

---

## 1. Executive Summary and Authority Separation

### 1.1 Authority Hierarchy
This authorization manifest is strictly governed by the canonical 6-tier repository authority hierarchy established in `AGENTS.md` §3 and `docs/MASTER_ROADMAP.md`:

1. `docs/MASTER_ROADMAP.md` — Master Product Roadmap (Stage 1–8).
2. `docs/ROADMAP.md` — Technical Package Taxonomy & Phase Dependencies (Phase 0–7).
3. `docs/IMPLEMENTATION_PLAN.md` — Package Specifications, Test Plans & Acceptance Criteria.
4. `docs/IMPLEMENTATION_STATUS.md` — Execution Ledger & Canonical Status Source of Truth.
5. `docs/DECISIONS.md` — Architecture Decision Records (ADRs).
6. `AGENTS.md` — Repository Router & Global Invariants.

Task-Specific Authorization: This document (`STAGE2-W6-IELTS-MOCK-AUTH-001`) provides task-specific boundary authority under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` and ADR-046 when accepted and activated, but remains strictly subordinate to the canonical 6-tier hierarchy above.

### 1.2 Owner-Ratified Product Decisions & Strategy Requirements
This manifest incorporates the Owner-ratified product requirements for Stage 2 IELTS Completeness (ADR-050 and `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`):

1. **Full Mock Exam Orchestration across Academic and General Training Tracks:**
   - Sequential 4-skill mock simulation: **Listening** (~30 mins, 4 parts, 40 items) $\longrightarrow$ **Reading** (60 mins, 3 passages/sections, 40 items) $\longrightarrow$ **Writing** (60 mins, Task 1 & Task 2) $\longrightarrow$ **Speaking** (11–14 mins, Parts 1, 2, 3).
   - Dedicated Mock State Machine: Initializes session with track binding (`academic` vs `general-training`), coordinates seamless section transitions, manages per-section countdown timers, executes autosave checkpoints, captures section outputs, and computes comprehensive multi-skill results.
2. **Practice Hierarchy & Section Practice Orchestration (`GAP-11`):**
   - Unifies practice across 4 hierarchical tiers:
     $$\text{Task Family Practice} \longrightarrow \text{Section Practice} \longrightarrow \text{Skill Test} \longrightarrow \text{Full Mock Exam}$$
   - Section Practice mode enables isolated drills on single 10-item listening parts, single reading passages, single writing tasks, or single speaking parts with immediate scoring and feedback.
3. **Session Interruption & Reload Recovery (`GAP-12`, S15-F005):**
   - Implements robust checkpoint persistence (`IELTS_MOCK_CHECKPOINT_V1`) in `ieltsMockRuns` and `ieltsSessionCheckpoint` stores.
   - Survives accidental browser refreshes, tab closures, and navigation events, restoring active section, question responses, elapsed/remaining timers, and intermediate draft states without data loss.
4. **Composite Multi-Skill Scoring & Scoring Honesty (ADR-050):**
   - Deterministic raw score calculation for Listening (out of 40) and Reading (out of 40) converted via official band curves (Academic vs General Training distinct).
   - Rubric-aligned practice feedback for Writing (TA/TR, CC, LR, GRA) and Speaking (FC, LR, GRA, PR) with half-band rounding.
   - Overall Composite IELTS Band Score calculation:
     $$\text{Overall Band} = \text{roundToHalfBand}\left(\frac{\text{Listening} + \text{Reading} + \text{Writing} + \text{Speaking}}{4}\right)$$
     following official IELTS half-band rounding rules ($\ge .25 \to .5$, $\ge .75 \to 1.0$).
   - Explicit Honesty Disclaimer: All scores and feedback are clearly labeled `"Estimated Band Score & Practice Feedback — Practice Reference"`. Zero claims of certified examiner or test-centre official status (ADR-050).
5. **Cumulative Stage 2 Exit Verification Gate (`scripts/stage2-gate.mjs` / `tests/stage2-completeness-gate.test.mjs`):**
   - Programmatic verification across all 18 completeness dimensions of `IELTS_COMPLETENESS_V1` defined in `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md` §8 and §14.
   - Verified via deterministic gate script: `npm run stage2:gate`.
6. **Schedule Isolation & Evidence Policy Invariant:**
   - Mock simulations and section practice maintain `affectsSchedule: false`, `evidenceEligible: false` (ADR-004, ADR-050), preserving FSRS schedule purity.
7. **Model Answer & Privacy Invariant:**
   - `KEY_LEAK_BEFORE_SUBMIT === 0` strictly enforced across DOM, ARIA attributes, and client projections.
8. **Durable Store Registration & Backup Coverage:**
   - 100% of new mock and session stores (`ieltsMockRuns`, `ieltsSessionCheckpoint`) registered in backup schema v2 (`src/backup-registry.js`).
9. **IELTS Hub Integration:**
   - Mounts Full Mock launcher, Section Practice launcher, and Track switcher in `src/ielts-hub-v2.js`.

### 1.3 Strict Non-Authority Notice
> [!IMPORTANT]
> - This candidate manifest alone CANNOT activate W6 execution authority.
> - Execution authority is activated ONLY after independent authorization audit acceptance (`ACCEPT`), canonical manifest merge, and a subsequent replacement `AGENT_CONTEXT_AUTH_ACTIVATION_V1` transaction recorded in `docs/IMPLEMENTATION_STATUS.md`.

---

## 2. Predecessor State & Provenance Bounds

### 2.1 Wave Dependency Chain
$$\text{W0-IELTS-ARCH-001} + \text{W1-IELTS-OBJ-001} + \text{W2-IELTS-LIS-001} + \text{W3-IELTS-RDG-001} + \text{W4-IELTS-WRT-001} + \text{W5-IELTS-SPK-001} \longrightarrow \text{W6-IELTS-MOCK-001}$$

- **Wave W0 (IELTS Product Contracts & Track Architecture):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #97).
- **Wave W1 (Objective Question Kernel Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #117).
- **Wave W2 (Listening Platform Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #131 / #132).
- **Wave W3 (Reading Platform Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #135 / #136).
- **Wave W4 (Productive Writing Platform):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #139 / #140).
- **Wave W5 (Interactive Speaking Platform):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #143 / #144).
- **Canonical Main Base:** `aee09ec2d22353f79a3730c9c3d3e699ccd56856`.

---

## 3. Product Mission & Capabilities Owned

### 3.1 Mission
Assemble the full IELTS practice hierarchy (Task Family Practice $\to$ Section Practice $\to$ Skill Test $\to$ Full Mock Exam), orchestrate end-to-end Academic Full Mock and General Training Full Mock exams, prove session interruption and reload recovery, provide unified multi-skill composite score reports with honest practice disclaimers, execute cumulative browser acceptance suites, and fulfill the Stage 2 exit verification gate (`IELTS_COMPLETENESS_V1`).

### 3.2 Capabilities Owned
1. **Full Mock Exam Orchestrator State Machine (`IeltsMockOrchestrator`):**
   - Coordinates the complete 4-skill testing lifecycle:
     * Listening: 4 parts, 40 questions, ~30 minutes with audio playback and section timer.
     * Reading: 3 sections/passages, 40 questions, 60 minutes with split-pane layout and timer.
     * Writing: Task 1 (visual or letter) + Task 2 (essay), 60 minutes with live word counters.
     * Speaking: 3-part guided simulation (Part 1 interview, Part 2 cue card with 1-min prep + 2-min speaking, Part 3 discussion), 11–14 minutes.
   - Manages state transitions: `INITIALIZED` $\to$ `LISTENING` $\to$ `READING` $\to$ `WRITING` $\to$ `SPEAKING` $\to$ `COMPLETED`.
   - Supports test pause, resume, section skipping (in practice mode), and final submission.
2. **Practice Hierarchy & Section Practice Launcher:**
   - Implements structured navigation across drills, section practice (e.g. Reading Passage 2 only, Listening Part 3 only), skill tests, and full mocks.
3. **Session Interruption & Reload Recovery (`IELTS_MOCK_CHECKPOINT_V1`):**
   - Checkpoint persistence in `ieltsSessionCheckpoint` / `ieltsMockRuns` stores.
   - Seamlessly restores session on browser refresh: active skill, section index, completed responses, elapsed/remaining timers, and draft text/audio.
4. **Comprehensive Composite Score Report:**
   - Displays section-by-section breakdown:
     * Listening: Raw score / 40, Band score.
     * Reading: Raw score / 40, Band score (Academic or GT conversion).
     * Writing: 4-criteria rubric evaluation (TA/TR, CC, LR, GRA) and estimated band.
     * Speaking: 4-criteria rubric evaluation (FC, LR, GRA, PR) and estimated band.
     * Overall Composite Band: Exact half-band rounded arithmetic average.
   - Prominent honest practice disclaimer: `"Estimated Band Score & Practice Feedback — Practice Reference"`. Zero claims of official certification (ADR-050).
5. **Stage 2 Exit Gate Verification (`scripts/stage2-gate.mjs`):**
   - Implements automated gate runner asserting all 18 dimensions of `IELTS_COMPLETENESS_V1`:
     * 100% of 11 Listening task families.
     * 100% of 15 Academic Reading task families.
     * 100% of 15 GT Reading task families.
     * 100% of Academic Writing Task 1 visuals (7 types) and Task 2 essays (5 types).
     * 100% of GT Writing Task 1 letters (3 registers) and Task 2 essays.
     * 100% of Speaking Parts 1, 2, and 3.
     * Track routing (Academic vs GT).
     * Practice hierarchy (Task -> Section -> Skill -> Mock).
     * Deterministic scoring & conversion curves.
     * Rubric evaluation for productive skills.
     * Interruption recovery & autosave.
     * Error candidate emission to Error Notebook.
     * Schedule isolation (`affectsSchedule: false`).
     * Answer key privacy (`KEY_LEAK_BEFORE_SUBMIT === 0`).
     * Backup registry 100% coverage.
     * Provenance & rights safety.
     * Clean test execution with zero regressions.
6. **IELTS Hub Integration:**
   - Mounts Full Mock launch card, Section Practice launcher, and Track switcher in `src/ielts-hub-v2.js`.

---

## 4. Scoring Semantics, Option Pools & Interaction Invariants

### 4.1 Composite IELTS Band Calculation Model
$$\text{Overall Band} = \text{roundToHalfBand}\left(\frac{\text{Listening Band} + \text{Reading Band} + \text{Writing Band} + \text{Speaking Band}}{4}\right)$$

Official Rounding Rule:
- Fractional part $< .25 \longrightarrow$ round down to whole band (e.g. $6.125 \to 6.0$).
- Fractional part $\ge .25$ and $< .75 \longrightarrow$ round to half band (e.g. $6.25 \to 6.5$, $6.625 \to 6.5$).
- Fractional part $\ge .75 \longrightarrow$ round up to next whole band (e.g. $6.75 \to 7.0$, $6.875 \to 7.0$).

### 4.2 Privacy & Key Leak Invariant
$$\text{KEY\_LEAK\_BEFORE\_SUBMIT} = \mathbf{ZERO}$$
- Answer keys, reading/listening correct answers, and model writing/speaking samples MUST NOT be accessible in the client DOM, ARIA attributes, or client projections before test submission.

### 4.3 Schedule Isolation Invariant
$$\text{affectsSchedule} = \text{false}, \quad \text{evidenceEligible} = \text{false}$$
- All Full Mock and Section Practice runs must never directly mutate FSRS memory schedules.

---

## 5. Exact Implementation Allowlist

Future W6 execution is strictly bounded to the following closed file sets. Writing to any file outside this allowlist is a protocol violation.

### 5.1 Source Allowlist (`SOURCE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `src/ielts-mock-orchestrator.js` | Core IELTS Full Mock exam orchestrator: multi-skill state machine (Listening $\to$ Reading $\to$ Writing $\to$ Speaking), section practice coordinator, timers, autosave checkpoints, interruption recovery, and composite multi-skill score report generation. | **NEW** |
| `src/ielts-hub-v2.js` | Mount and launch Full Mock and Section Practice modes with track selection in the IELTS Hub UI. | **EXTEND** |
| `src/ielts-domain.js` | Export Full Mock test blueprint schemas, session configuration contracts, composite band calculation formulas, and section practice descriptors. | **EXTEND** |
| `src/ielts-persistence.js` | IndexedDB store definitions and accessors for `ieltsMockRuns` and `ieltsSessionCheckpoint`. | **EXTEND** |
| `src/backup-registry.js` | Register new `ieltsMockRuns` and `ieltsSessionCheckpoint` stores in durable backup schema v2. | **EXTEND** |
| `scripts/stage2-gate.mjs` | Comprehensive Stage 2 completeness exit gate runner verifying all 18 dimensions of `IELTS_COMPLETENESS_V1`. | **NEW** |
| `package.json` | Add `stage2:gate`, `test:mock`, and `test:stage2-gate` npm script targets. | **EXTEND** |

### 5.2 Test Allowlist (`TEST_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `tests/ielts-mock-orchestrator.test.mjs` | Unit & integration tests for Full Mock orchestrator state transitions, section progression, composite score calculation, interruption reload recovery, ErrorRepository integration, and evidence policy isolation. | **NEW** |
| `tests/stage2-completeness-gate.test.mjs` | Unit & contract tests asserting all 18 completeness dimensions of `IELTS_COMPLETENESS_V1`. | **NEW** |
| `tests/ielts-full-mock-browser.test.mjs` | Browser / DOM tests for Full Mock launcher, section transitions, reload recovery, and multi-skill score report display. | **NEW** |

### 5.3 Fixture Allowlist (`FIXTURE_ALLOWLIST`)
NONE

### 5.4 Docs and Evidence Allowlist (`DOC_EVIDENCE_ALLOWLIST`)
NONE

---

## 6. RED / GREEN Execution Topology and Specification

Future W6 execution must follow a strict, two-commit RED $\to$ GREEN verification topology under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`:

```text
Canonical Base (aee09ec2d22353f79a3730c9c3d3e699ccd56856)
     │
     ▼
[COMMIT A: RED Tests Only] (Adds failing test assertions to TEST_ALLOWLIST; zero src/** edits)
     │
     ├─▶ Verified expected product failure predicates (Missing IeltsMockOrchestrator, missing full mock flow, missing composite scoring, missing stage2:gate)
     ├─▶ Zero syntax / compile / fixture breakages
     ├─▶ Natural remote pull_request RED CI verified & test blobs frozen
     │
     ▼
[COMMIT B: GREEN Implementation] (Implements SOURCE_ALLOWLIST to satisfy frozen Commit A tests)
     │
     ├─▶ 100% tests pass locally and in natural GREEN CI
     ├─▶ npm run stage2:gate passes 3 consecutive times with zero failures
     ├─▶ Zero test blob mutation
     └─▶ Independent Implementation Audit Gate
```

---

## 7. Migration, Rollback & Stop Conditions

### 7.1 Stop Conditions
Fail closed and **STOP** immediately if any of the following occur:
1. `CANONICAL_BASE_DRIFT`: Working branch diverges from canonical `main`.
2. `SCOPE_VIOLATION`: Any edit touches files outside the declared allowlists.
3. `UNNATURAL_RED`: Commit A passes prematurely or fails on syntax/fixture errors.
4. `RED_TEST_MUTATED`: Commit A test blobs are altered during Commit B.
5. `NATURAL_GREEN_NOT_SUCCESSFUL`: Commit B fails any verification gate or natural CI run.
6. `KEY_LEAK_BEFORE_SUBMIT`: Model answers or test items exposed pre-submission.
7. `UNSAVED_DRAFT_LOSS`: Learner mock progress or answers lost on page reload.
8. `OFFICIAL_CERTIFICATION_CLAIM`: Results claim official examiner or test centre certification.
9. `STAGE3_SCOPE_EXPANSION`: Silent absorption of Stage 3 broad research into Stage 2.

---

## 8. Merge Authority Declarations

### 8.1 W6 Implementation Merge Authority
$$\text{W6\_IMPLEMENTATION\_MERGE\_AUTHORITY} = \mathbf{CONDITIONALLY\_GRANTED}$$
Conditional mechanical merge authority for the future W6 Implementation PR is granted to its Independent Implementation Auditor **ONLY IF** all of the following conditions are verified:
1. Fresh independent implementation audit verdict = `ACCEPT`;
2. Formal `ACCEPT` verdict is persisted to PR and read back;
3. Exact candidate head SHA remains unchanged;
4. Base commit matches the canonical activation merge predecessor;
5. Natural exact-head PR CI run concludes `SUCCESS` (attempt 1);
6. Changed paths strictly match `SOURCE_ALLOWLIST` and `TEST_ALLOWLIST`;
7. Substantive findings = `NONE`;
8. PR is cleanly mergeable without conflicts.

### 8.2 Authorization Manifest PR Merge Authority
$$\text{AUTH\_MANIFEST\_MERGE\_AUTHORITY} = \mathbf{CONDITIONALLY\_GRANTED}$$
Conditional mechanical merge authority for **THIS DOCS-ONLY AUTHORIZATION PR** is granted to its Independent Authorization Auditor **ONLY IF** all of the following conditions are verified:
1. Fresh independent audit verdict = `ACCEPT` (with `PRODUCT_INTENT_SUFFICIENCY = PASS`);
2. Formal `ACCEPT` verdict is persisted to PR and read back;
3. Exact candidate head SHA remains unchanged;
4. Base commit remains `aee09ec2d22353f79a3730c9c3d3e699ccd56856`;
5. Natural exact-head PR CI run concludes `SUCCESS` (attempt 1);
6. Exactly ONE changed path: `docs/authorizations/STAGE2-W6-IELTS-MOCK-AUTH-001.md`;
7. Substantive findings = `NONE`;
8. PR is cleanly mergeable without conflicts.

**Merge Method:** Normal Merge Commit (no squash, no rebase).
