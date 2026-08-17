# Wave Authorization Manifest — Stage 2 Wave W4 (Productive Writing Platform)

Manifest Identity: **STAGE2-W4-IELTS-WRT-AUTH-001**  
Wave ID: **W4-IELTS-WRT-001**  
Wave Name: **Productive Writing Platform**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046) under **EXECUTION_PROMPT_PROTOCOL_V2** (ADR-051)  
Date: **2026-08-17**  
Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**  
Canonical Predecessor (Base): **`6039199c5218ea762d8b94526b550a5ba4c801fe`**  
Target Implementation Branch (Future): **`exec/stage2-w4-ielts-wrt-001`**  
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

Task-Specific Authorization: This document (`STAGE2-W4-IELTS-WRT-AUTH-001`) provides task-specific boundary authority under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` and ADR-046 when accepted and activated, but remains strictly subordinate to the canonical 6-tier hierarchy above.

### 1.2 Owner-Ratified Product Decisions & Strategy Requirements
This manifest incorporates the Owner-ratified product requirements for Stage 2 IELTS Completeness (ADR-050 and `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`):

1. **Option B — Full IELTS Platform (Academic + General Training Writing):**
   - **Academic Task 1:** Visual information report prompts across 7 official task types (Line Graph, Bar Chart, Pie Chart, Table, Process Diagram, Map / Plan, Mixed Graphics) with $\ge 150$ words required and ~20 mins recommended timing.
   - **General Training Task 1:** Letter writing prompts across 3 registers (Formal, Semi-formal, Personal/Informal) with exactly 3 bullet prompt requirements, $\ge 150$ words required and ~20 mins recommended timing.
   - **Academic & General Training Task 2:** Discursive essay prompts across 5 official essay types (Agree / Disagree, Discuss Both Views, Advantages / Disadvantages, Problem & Solution, Two-Part Questions) with $\ge 250$ words required and ~40 mins recommended timing.
2. **Integrated Test & Practice Modes:**
   - **Full Writing Test Mode:** Combined Task 1 + Task 2 under a 60-minute countdown timer (`TIMING_MINUTES = 60`, `totalSeconds = 3600`), seamless task switcher, real-time autosave, and automatic submission on time expiry.
   - **Single Task Mode:** Focused Task 1 (20 minutes), Focused Task 2 (40 minutes), and Untimed Practice modes with instant rubric feedback.
3. **Drafting Editor & Word Count Engine:**
   - Real-time word counter handling whitespace, hyphenated words, and punctuation.
   - Visible word count indicators and under-length warnings ($< 150$w for Task 1, $< 250$w for Task 2).
   - Autosave and interruption/reload recovery (`IELTS_WRITING_CHECKPOINT_V1`) in `ieltsTestRuns` / `learnerArtifacts` stores.
   - Immutable submission lifecycle via `learner-text-artifact-revision` records.
4. **4-Dimension Rubric-Aligned Practice Feedback:**
   - Feedback and scoring estimates aligned with the 4 official IELTS writing criteria:
     1. *Task Achievement* (Task 1) / *Task Response* (Task 2) [TA / TR]
     2. *Coherence & Cohesion* [CC]
     3. *Lexical Resource* [LR]
     4. *Grammatical Range & Accuracy* [GRA]
   - User-visible results are strictly labeled as practice feedback: `"Estimated Band Score & Practice Feedback — Practice Reference"`. Explicit invariant: Zero claims of official IELTS examiner certification (ADR-050).
5. **Error Candidate Emission & Schedule Isolation:**
   - Emits `ErrorCandidate` records into `ErrorRepository` with category `'writing-grammar'`, `'writing-lexical'`, `'writing-cohesion'`, or `'writing-task-response'`.
   - Enforces `affectsSchedule: false`, `evidenceEligible: false` via `EvidencePolicy`.
6. **Model Essay & Band Descriptor Privacy:**
   - `KEY_LEAK_BEFORE_SUBMIT === 0` strictly enforced across DOM, ARIA, and public item projections.
7. **IELTS Hub Integration:**
   - Mounts Writing launcher (Academic Task 1, GT Task 1, Task 2, Full Writing Test) in `src/ielts-hub-v2.js` with track selection.

### 1.3 Strict Non-Authority Notice
> [!IMPORTANT]
> - This candidate manifest alone CANNOT activate W4 execution authority.
> - Execution authority is activated ONLY after independent authorization audit acceptance (`ACCEPT`), canonical manifest merge, and a subsequent replacement `AGENT_CONTEXT_AUTH_ACTIVATION_V1` transaction recorded in `docs/IMPLEMENTATION_STATUS.md`.

---

## 2. Predecessor State & Provenance Bounds

### 2.1 Wave Dependency Chain
$$\text{W0-IELTS-ARCH-001} + \text{W1-IELTS-OBJ-001} + \text{W2-IELTS-LIS-001} + \text{W3-IELTS-RDG-001} \longrightarrow \text{W4-IELTS-WRT-001}$$

- **Wave W0 (IELTS Product Contracts & Track Architecture):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #97).
- **Wave W1 (Objective Question Kernel Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #117).
- **Wave W2 (Listening Platform Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #131 / #132).
- **Wave W3 (Reading Platform Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #135 / #136).
- **Canonical Main Base:** `6039199c5218ea762d8b94526b550a5ba4c801fe`.

---

## 3. Product Mission & Capabilities Owned

### 3.1 Mission
Deliver the comprehensive, end-to-end IELTS Writing platform across Academic and General Training tracks: Academic Task 1 (visual prompt renderers for charts, tables, maps, and process diagrams), General Training Task 1 (letter prompt templates across 3 registers with 3 required bullet points), Academic/GT Task 2 (essay prompt templates across 5 discursive essay types), live word count engine with under-length warnings, 60-min / 20-min / 40-min countdown timers, autosave and reload recovery, 4-dimension rubric feedback generation, and Error Notebook integration.

### 3.2 Capabilities Owned
1. **Academic Task 1 Visual Information Platform (`GAP-07`):**
   - Visual renderers for 7 task families:
     * Line Graph (trends, time-series data)
     * Bar Chart (categorical comparisons)
     * Pie Chart (proportions and sector allocations)
     * Table (structured row/column data)
     * Process Diagram (cyclical natural or industrial workflows)
     * Map / Plan (comparative geographical or layout maps)
     * Mixed Graphics (multi-visual synthesis)
   - Prompt schema: title, visual dataset/SVG definition, instructions, standard $\ge 150$ words guideline.
2. **General Training Task 1 Letter Platform (`GAP-08`):**
   - Letter prompt templates covering 3 registers:
     * Formal register (official/authority, formal salutations and sign-offs)
     * Semi-formal register (colleague/landlord, polite professional tone)
     * Informal / Personal register (friend/family, conversational tone)
   - Structure: Scenario context + exactly 3 required bullet point prompts.
   - Guideline: $\ge 150$ words, ~20 mins recommended.
3. **Academic & GT Task 2 Essay Platform (`GAP-09`):**
   - Essay prompt templates covering 5 essay types:
     * Opinion / Agree or Disagree
     * Discuss Both Views (and give opinion)
     * Advantages and Disadvantages
     * Problem and Solution (Causes and Solutions)
     * Direct / Two-Part Questions
   - Guideline: $\ge 250$ words, ~40 mins recommended.
4. **Writing Test Runner Orchestration (`IeltsWritingRunner`):**
   - Full Test Mode: 60-minute countdown timer (`totalSeconds = 3600`) managing Task 1 and Task 2 together.
   - Task 1 Mode: 20-minute countdown timer (`totalSeconds = 1200`).
   - Task 2 Mode: 40-minute countdown timer (`totalSeconds = 2400`).
   - Untimed Practice Mode: flexible drafting with instant rubric review.
5. **Live Word Count & Target Validation Engine:**
   - Real-time word count calculation with punctuation/whitespace normalization.
   - Target status indicators: under-length warning, penalty notice, target reached.
6. **Autosave & Interruption/Reload Recovery:**
   - Checkpoint persistence in `ieltsTestRuns` / `learnerArtifacts` (`IELTS_WRITING_CHECKPOINT_V1`).
   - Restores draft text, active task tab, word count, and elapsed timer upon reload without data loss.
7. **4-Dimension Rubric-Aligned Practice Feedback:**
   - Rule-based & heuristic assessment across official criteria: TA/TR, CC, LR, GRA.
   - Honest labeling: `"Estimated Band Score & Practice Feedback — Practice Reference"`. Zero claims of official examiner certification.
8. **Error Candidate Emission & Containment:**
   - Emits `ErrorCandidate` records into `ErrorRepository` (categories: `writing-grammar`, `writing-lexical`, `writing-cohesion`, `writing-task-response`).
   - Strict schedule isolation: `affectsSchedule: false`, `evidenceEligible: false`.
9. **IELTS Hub Integration:**
   - Mounts Writing launcher (Academic Task 1, GT Task 1, Task 2, Full Writing Test) in `src/ielts-hub-v2.js` with track selection.

---

## 4. Scoring Semantics, Option Pools & Interaction Invariants

### 4.1 4-Dimension IELTS Writing Assessment Model (Practice Reference)
$$\text{Overall Writing Band} = \text{roundToHalfBand}\left(\frac{\text{TA/TR} + \text{CC} + \text{LR} + \text{GRA}}{4}\right)$$

For Full Test mode (Task 1 + Task 2):
$$\text{Overall Writing Band} = \text{roundToHalfBand}\left(\frac{1}{3}\text{Task1 Band} + \frac{2}{3}\text{Task2 Band}\right)$$

| Dimension | Key Evaluated Aspects |
|---|---|
| **Task Achievement (T1) / Task Response (T2)** | Word count compliance ($\ge 150$w / $\ge 250$w), overview of main trends/features (T1), addressing all prompt parts & bullet points (GT T1), clear position throughout & well-developed ideas (T2). |
| **Coherence & Cohesion (CC)** | Logical paragraphing, clear progression, appropriate range of cohesive devices, avoidance of mechanical transitions. |
| **Lexical Resource (LR)** | Range of vocabulary, appropriate register (formal/semi-formal/informal), collocations, precision, spelling accuracy. |
| **Grammatical Range & Accuracy (GRA)** | Mix of simple and complex sentence structures, punctuation accuracy, grammatical error rate. |

*Honesty Disclaimer:* All scores and feedback are strictly labeled `"Estimated Band Score & Practice Feedback — Practice Reference"` with zero claim of official certification (ADR-050).

### 4.2 Answer Key & Model Essay Privacy Invariant
$$\text{KEY\_LEAK\_BEFORE\_SUBMIT} = \mathbf{ZERO}$$
- Model essays, examiner commentary, and scoring keys MUST NOT be exposed in the DOM, ARIA attributes, or client-accessible projections prior to submission.

### 4.3 FSRS & Evidence Gateway Invariant
$$\text{affectsSchedule} = \text{false}, \quad \text{evidenceEligible} = \text{false}$$
- Zero direct FSRS schedule mutations from writing test runs.

---

## 5. Exact Implementation Allowlist

Future W4 execution is strictly bounded to the following closed file sets. Writing to any file outside this allowlist is a protocol violation.

### 5.1 Source Allowlist (`SOURCE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `src/ielts-writing-runner.js` | Core IELTS Writing test runner orchestrator: visual prompt rendering, GT letter prompt rendering, Task 2 essay rendering, 60-min / 20-min / 40-min countdown timers, live word counting, autosave and reload recovery, submission lifecycle, 4-dimension rubric feedback generation, and error candidate emission. | **NEW** |
| `src/productive-text-contracts.js` | Extend schema definitions for IELTS Writing prompts (Task 1 Visual, Task 1 Letter, Task 2 Essay), rubrics, criteria descriptors, and artifact revisions. | **EXTEND** |
| `src/productive-writing-ui.js` | Visual renderers for charts (line, bar, pie), tables, SVG process diagrams, maps, GT letter bullets, and rubric feedback displays. | **EXTEND** |
| `src/ielts-domain.js` | Export IELTS writing task validators, word counter helpers, rubric assessment models, and scoring curve converters. | **EXTEND** |
| `src/ielts-hub-v2.js` | Mount and launch Writing test runner from the IELTS Hub UI with track selection. | **EXTEND** |

### 5.2 Test Allowlist (`TEST_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `tests/ielts-writing-platform.test.mjs` | Unit & integration tests for Academic Task 1 visual prompts, GT Task 1 letter prompts, Task 2 essay prompts, word count validation, timers, reload recovery, 4-dimension rubric evaluation, error candidate emission, persistence, and evidence policy isolation. | **NEW** |
| `tests/ielts-writing-browser.test.mjs` | Browser / DOM tests for interactive writing editor, visual rendering (SVG/charts/tables/maps), real-time word counting, autosave, submission, and rubric feedback view. | **NEW** |

### 5.3 Fixture Allowlist (`FIXTURE_ALLOWLIST`)
NONE

### 5.4 Docs and Evidence Allowlist (`DOC_EVIDENCE_ALLOWLIST`)
NONE

---

## 6. RED / GREEN Execution Topology and Specification

Future W4 execution must follow a strict, two-commit RED $\to$ GREEN verification topology under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`:

```text
Canonical Base (6039199c5218ea762d8b94526b550a5ba4c801fe)
     │
     ▼
[COMMIT A: RED Tests Only] (Adds failing test assertions to TEST_ALLOWLIST; zero src/** edits)
     │
     ├─▶ Verified expected product failure predicates (Missing IeltsWritingRunner, missing visual renderers, missing word counter, missing rubric models)
     ├─▶ Zero syntax / compile / fixture breakages
     ├─▶ Natural remote pull_request RED CI verified & test blobs frozen
     │
     ▼
[COMMIT B: GREEN Implementation] (Implements SOURCE_ALLOWLIST to satisfy frozen Commit A tests)
     │
     ├─▶ 100% tests pass locally and in natural GREEN CI
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
6. `KEY_LEAK_BEFORE_SUBMIT`: Model answers or examiner notes exposed pre-submission.
7. `UNSAVED_DRAFT_LOSS`: Learner writing draft is lost or reset on page reload.
8. `OFFICIAL_CERTIFICATION_CLAIM`: Results claim official examiner or test centre certification.

---

## 8. Merge Authority Declarations

### 8.1 W4 Implementation Merge Authority
$$\text{W4\_IMPLEMENTATION\_MERGE\_AUTHORITY} = \mathbf{CONDITIONALLY\_GRANTED}$$
Conditional mechanical merge authority for the future W4 Implementation PR is granted to its Independent Implementation Auditor **ONLY IF** all of the following conditions are verified:
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
4. Base commit remains `6039199c5218ea762d8b94526b550a5ba4c801fe`;
5. Natural exact-head PR CI run concludes `SUCCESS` (attempt 1);
6. Exactly ONE changed path: `docs/authorizations/STAGE2-W4-IELTS-WRT-AUTH-001.md`;
7. Substantive findings = `NONE`;
8. PR is cleanly mergeable without conflicts.

**Merge Method:** Normal Merge Commit (no squash, no rebase).
