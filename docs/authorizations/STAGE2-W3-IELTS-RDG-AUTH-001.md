# Wave Authorization Manifest — Stage 2 Wave W3 (Reading Platform Completeness)

Manifest Identity: **STAGE2-W3-IELTS-RDG-AUTH-001**  
Wave ID: **W3-IELTS-RDG-001**  
Wave Name: **Reading Platform Completeness**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046) under **EXECUTION_PROMPT_PROTOCOL_V2** (ADR-051)  
Date: **2026-08-17**  
Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**  
Canonical Predecessor (Base): **`c93c4355cf56567b5b6789b2e3215c827317a4ab`**  
Target Implementation Branch (Future): **`exec/stage2-w3-ielts-rdg-001`**  
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

Task-Specific Authorization: This document (`STAGE2-W3-IELTS-RDG-AUTH-001`) provides task-specific boundary authority under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` and ADR-046 when accepted and activated, but remains strictly subordinate to the canonical 6-tier hierarchy above.

### 1.2 Owner-Ratified Product Decisions & Strategy Requirements
This manifest incorporates the Owner-ratified product requirements for Stage 2 IELTS Completeness (ADR-050 and `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`):

1. **Option B — Full IELTS Platform (Academic + General Training Reading):**
   - **Academic Reading:** 3 long, complex academic passages from books, journals, magazines, or newspapers (~2,150–2,750 total words) with 40 objective questions across Passages 1–3.
   - **General Training Reading:** 3 sections of increasing difficulty: Section 1 (2–3 short everyday survival/social notices/texts), Section 2 (2 work-related/workplace training texts), Section 3 (1 longer general interest article), with 40 objective questions across Sections 1–3.
2. **Split-Pane Layout & Text Navigation:**
   - Left pane displays passage text with paragraph identifiers, section tabs, and text scrolling.
   - Right pane displays question cards, interactive inputs, and 1–40 item navigation matrix.
   - Fully responsive layout with mobile stacked viewport support.
3. **Computer-Delivered Timing & Modes:**
   - **Exam Mode:** Exactly 60 minutes countdown timer (`TIMING_MINUTES = 60`, `totalSeconds = 3600`). Autosave on each answer change. Automatic submission on time expiry. Sealed keys hidden pre-submission.
   - **Practice Mode:** Flexible or untimed exploration, per-passage checking, instant feedback, and explanation toggles.
4. **Distinct Deterministic Raw-to-Band Scoring Benchmarks (Academic vs General Training):**
   - Academic Reading and General Training Reading have distinct official conversion scales reflecting different text difficulty.
   - 41-point raw score ($0 \dots 40$) to band ($0.0 \dots 9.0$) conversion curves.
   - User-visible results are strictly labeled as practice estimates: `"Estimated Band Score — Practice Reference"`. Zero claims of official examiner certification (ADR-050).
5. **Reload & Interruption Recovery:**
   - Checkpoint state in `ieltsTestRuns` store persists answered items, active passage/section, and elapsed test timer.
   - On reload/interruption, learner answers and test state are restored safely without resetting the timer to 0 or losing answers.
6. **Task Family Completeness & QAR Primitives:**
   - Real interactive rendering of all 15 official reading task families using QAR primitives.
7. **Error Candidate Emission & Schedule Isolation:**
   - Emits `ErrorCandidate` records into `ErrorRepository` with category `'reading-strategy'`, `'distractor'`, or `'meaning'`.
   - Enforces `affectsSchedule: false`, `evidenceEligible: false` via `EvidencePolicy`.
8. **Answer Key Privacy:**
   - `KEY_LEAK_BEFORE_SUBMIT === 0` strictly enforced across DOM, ARIA, and public item projections.

### 1.3 Strict Non-Authority Notice
> [!IMPORTANT]
> - This candidate manifest alone CANNOT activate W3 execution authority.
> - Execution authority is activated ONLY after independent authorization audit acceptance (`ACCEPT`), canonical manifest merge, and a subsequent replacement `AGENT_CONTEXT_AUTH_ACTIVATION_V1` transaction recorded in `docs/IMPLEMENTATION_STATUS.md`.

---

## 2. Predecessor State & Provenance Bounds

### 2.1 Wave Dependency Chain
$$\text{W0-IELTS-ARCH-001} + \text{W1-IELTS-OBJ-001} + \text{W2-IELTS-LIS-001} \longrightarrow \text{W3-IELTS-RDG-001}$$

- **Wave W0 (IELTS Product Contracts & Track Architecture):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md`.
- **Wave W1 (Objective Question Kernel Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md`.
- **Wave W2 (Listening Platform Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md`.
- **Canonical Main Base:** `c93c4355cf56567b5b6789b2e3215c827317a4ab`.

---

## 3. Product Mission & Capabilities Owned

### 3.1 Mission
Deliver the end-to-end IELTS Reading platform across Academic and General Training tracks: 3-passage Academic and 3-section General Training test orchestration, split-pane text/question navigation, 60-minute countdown timer with autosave and reload recovery, distinct Academic vs General Training raw-to-band conversion curves, interactive QAR question rendering, and Error Notebook integration.

### 3.2 Capabilities Owned
1. **Academic Reading 3-Passage Test Runner (`IeltsReadingRunner`):**
   - Passage 1: Descriptive/factual text (Questions 1–13/14).
   - Passage 2: Detailed/analytical text (Questions 14/15–26/27).
   - Passage 3: Complex/discursive academic argument (Questions 27/28–40).
2. **General Training Reading 3-Section Test Runner (`IeltsReadingRunner`):**
   - Section 1: 2–3 short everyday survival/social notices (Questions 1–14).
   - Section 2: 2 work-related/workplace training texts (Questions 15–27).
   - Section 3: 1 long general interest article (Questions 28–40).
3. **Split-Pane UI & Passage Navigator:**
   - Split-pane layout: passage viewer on the left with scrolling and paragraph markers; questions on the right.
   - Passage tabs (Passages/Sections 1, 2, 3) and 1–40 question navigation bar.
4. **Timing & Execution Modes:**
   - Exam Mode: 60-minute countdown timer, autosave on answer changes, time warnings, automatic submission on timer expiry.
   - Practice Mode: Flexible or untimed exploration, per-passage validation, instant feedback toggle.
5. **Checkpoint & Reload Recovery:**
   - Saves run progress and answered items to `ieltsTestRuns` store.
   - Resumes from authoritative elapsed time and restores answered questions upon reload.
6. **Deterministic Raw-to-Band Score Conversion:**
   - Distinct Academic Reading curve (`convertIeltsAcademicReadingRawToBand` / `convertIeltsReadingRawToBand(raw, 'academic')`).
   - Distinct General Training Reading curve (`convertIeltsGeneralReadingRawToBand` / `convertIeltsReadingRawToBand(raw, 'general-training')`).
   - UI display: `"Estimated Band Score — Practice Reference"`.
7. **Error Candidate Emission & Containment:**
   - Emits `ErrorCandidate` records into `ErrorRepository` for incorrect/partial items.
   - Enforces `affectsSchedule: false`, `evidenceEligible: false` via `EvidencePolicy`.
8. **IELTS Hub Integration:**
   - Mounts Reading test launcher (Exam and Practice) in `src/ielts-hub-v2.js` with track awareness.

---

## 4. Scoring Semantics, Option Pools & Interaction Invariants

### 4.1 3-Passage / 3-Section Test Structure & Blueprint Contracts
1. **Blueprint Schema (`ielts-test-blueprint`):**
   - `id`: Unique test blueprint identifier (e.g. `ielts-academic-reading-test-001`, `ielts-gt-reading-test-001`).
   - `kind`: `'ielts-test-blueprint'`.
   - `schemaVersion`: `1`.
   - `skill`: `'reading'`.
   - `track`: `'academic'` or `'general-training'`.
   - `hierarchyLevel`: `'SKILL_TEST'` (validated by `validateIeltsPracticeHierarchyLevel`).
   - `title`: Test title string.
   - `timing`: `{ testMinutes: 60, totalSeconds: 3600 }`.
   - `sections`: Exactly 3 sections (Passages 1–3 for Academic; Sections 1–3 for GT), containing exactly 40 questions total.
   - Each section includes `passage`: `{ title, text, paragraphs: [...] }` or source revision reference.

### 4.2 Deterministic IELTS Reading Band Score Benchmarks (Practice Reference)

#### Academic Reading Raw-to-Band Scale
$$\text{Raw Score} \in [0, 40] \longrightarrow \text{Estimated Band Score} \in [0.0, 9.0]$$

| Raw Score (Correct / 40) | Estimated Band Score (Practice Reference) |
|---|---|
| 39 – 40 | **9.0** |
| 37 – 38 | **8.5** |
| 35 – 36 | **8.0** |
| 33 – 34 | **7.5** |
| 30 – 32 | **7.0** |
| 27 – 29 | **6.5** |
| 23 – 26 | **6.0** |
| 19 – 22 | **5.5** |
| 15 – 18 | **5.0** |
| 13 – 14 | **4.5** |
| 10 – 12 | **4.0** |
| 8 – 9 | **3.5** |
| 6 – 7 | **3.0** |
| 4 – 5 | **2.5** |
| 2 – 3 | **2.0** |
| 1 | **1.0** |
| 0 | **0.0** |

#### General Training Reading Raw-to-Band Scale
$$\text{Raw Score} \in [0, 40] \longrightarrow \text{Estimated Band Score} \in [0.0, 9.0]$$

| Raw Score (Correct / 40) | Estimated Band Score (Practice Reference) |
|---|---|
| 40 | **9.0** |
| 39 | **8.5** |
| 37 – 38 | **8.0** |
| 36 | **7.5** |
| 34 – 35 | **7.0** |
| 32 – 33 | **6.5** |
| 30 – 31 | **6.0** |
| 27 – 29 | **5.5** |
| 23 – 26 | **5.0** |
| 19 – 22 | **4.5** |
| 15 – 18 | **4.0** |
| 12 – 14 | **3.5** |
| 9 – 11 | **3.0** |
| 6 – 8 | **2.5** |
| 3 – 5 | **2.0** |
| 1 – 2 | **1.0** |
| 0 | **0.0** |

*Conversion Function:* `convertIeltsReadingRawToBand(rawScore, track)` (supporting `track = 'academic'` or `'general-training'`) must return deterministic numbers matching these exact scales.

### 4.3 Answer Key Privacy Invariant (Strict Non-Negotiable)
$$\text{KEY\_LEAK\_BEFORE\_SUBMIT} = \mathbf{ZERO}$$
- Sealed answer keys, explanations, and correctness flags MUST NOT be exposed in the DOM, ARIA attributes, or client-accessible question projections prior to submission.

### 4.4 FSRS & Evidence Gateway Invariant
$$\text{affectsSchedule} = \text{false}, \quad \text{evidenceEligible} = \text{false}$$
- Zero direct FSRS schedule mutations from test runs.

---

## 5. Exact Implementation Allowlist

Future W3 execution is strictly bounded to the following closed file sets. Writing to any file outside this allowlist is a protocol violation.

### 5.1 Source Allowlist (`SOURCE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `src/ielts-reading-runner.js` | Core 3-passage Academic and 3-section GT Reading test runner orchestrator: passage & question navigation, split-pane layout, 60-min timer, checkpoint autosave/reload recovery, QAR interactive rendering, raw-to-band scoring, error candidate emission, and run state management. | **NEW** |
| `src/ielts-domain.js` | Export `convertIeltsReadingRawToBand()`, Reading test run validator extensions, and section timing helpers. | **EXTEND** |
| `src/ielts-hub-v2.js` | Mount and launch Reading test runner from the IELTS Hub UI with track selection. | **EXTEND** |

### 5.2 Test Allowlist (`TEST_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `tests/ielts-reading-runner.test.mjs` | Unit & integration tests for Academic & GT reading orchestration, split-pane navigation, 60-min timer, reload recovery, distinct Academic vs GT raw-to-band conversion, error candidate emission, and persistence. | **NEW** |
| `tests/ielts-reading-browser.test.mjs` | Browser / DOM tests for Reading UI, passage split-pane scrolling, question navigation 1–40, interactive inputs, timer, track switching, and results view. | **NEW** |

### 5.3 Fixture Allowlist (`FIXTURE_ALLOWLIST`)
NONE

### 5.4 Docs and Evidence Allowlist (`DOC_EVIDENCE_ALLOWLIST`)
NONE

---

## 6. RED / GREEN Execution Topology and Specification

Future W3 execution must follow a strict, two-commit RED $\to$ GREEN verification topology under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`:

```text
Canonical Base (c93c4355cf56567b5b6789b2e3215c827317a4ab)
     │
     ▼
[COMMIT A: RED Tests Only] (Adds failing test assertions to TEST_ALLOWLIST; zero src/** edits)
     │
     ├─▶ Verified expected product failure predicates (Missing IeltsReadingRunner, missing band conversions, missing Hub mounting)
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
6. `KEY_LEAK_BEFORE_SUBMIT`: Answer keys exposed pre-submission.
7. `SCORE_CURVE_MISMATCH`: Academic test scored using GT curve or vice-versa.
8. `RELOAD_RECOVERY_UNSAFE`: Timer resets to 0 or answers are lost on reload.

---

## 8. Merge Authority Declarations

### 8.1 W3 Implementation Merge Authority
$$\text{W3\_IMPLEMENTATION\_MERGE\_AUTHORITY} = \mathbf{CONDITIONALLY\_GRANTED}$$
Conditional mechanical merge authority for the future W3 Implementation PR is granted to its Independent Implementation Auditor **ONLY IF** all of the following conditions are verified:
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
4. Base commit remains `c93c4355cf56567b5b6789b2e3215c827317a4ab`;
5. Natural exact-head PR CI run concludes `SUCCESS` (attempt 1);
6. Exactly ONE changed path: `docs/authorizations/STAGE2-W3-IELTS-RDG-AUTH-001.md`;
7. Substantive findings = `NONE`;
8. PR is cleanly mergeable without conflicts.

**Merge Method:** Normal Merge Commit (no squash, no rebase).
