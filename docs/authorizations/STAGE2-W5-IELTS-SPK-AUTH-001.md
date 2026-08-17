# Wave Authorization Manifest — Stage 2 Wave W5 (Interactive Speaking Platform)

Manifest Identity: **STAGE2-W5-IELTS-SPK-AUTH-001**  
Wave ID: **W5-IELTS-SPK-001**  
Wave Name: **Interactive Speaking Platform**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046) under **EXECUTION_PROMPT_PROTOCOL_V2** (ADR-051)  
Date: **2026-08-17**  
Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**  
Canonical Predecessor (Base): **`c550a995b0954f5f087e73fc4fc142235d8e5cdd`**  
Target Implementation Branch (Future): **`exec/stage2-w5-ielts-spk-001`**  
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

Task-Specific Authorization: This document (`STAGE2-W5-IELTS-SPK-AUTH-001`) provides task-specific boundary authority under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` and ADR-046 when accepted and activated, but remains strictly subordinate to the canonical 6-tier hierarchy above.

### 1.2 Owner-Ratified Product Decisions & Strategy Requirements
This manifest incorporates the Owner-ratified product requirements for Stage 2 IELTS Completeness (ADR-050 and `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`):

1. **Option B — Full IELTS Platform (Academic + General Training Shared Speaking Platform):**
   - **Part 1 (Introduction & Interview):** Interactive prompt interviewer presenting 4–6 questions across 2–3 familiar daily/social topics (4–5 minutes total).
   - **Part 2 (Individual Long Turn / Cue Card):** Task card with topic and 3–4 bullet points, 1-minute countdown preparation timer (`PREP_SECONDS = 60`), live scratch notes input area, 2-minute recording countdown timer (`SPEAKING_SECONDS = 120`), and 1–2 rounding-off follow-up questions (3–4 minutes total).
   - **Part 3 (Two-Way Analytical Discussion):** In-depth thematic, abstract, and analytical discussion questions linked thematically to Part 2 (4–5 minutes total; 4–6 questions).
2. **Integrated Test & Practice Modes:**
   - **Full Speaking Simulation Mode:** Guided 3-part sequence (Part 1 $\to$ Part 2 $\to$ Part 3) with official stage timings, automatic progression, and comprehensive rubric feedback upon completion.
   - **Part Practice Modes:** Focused Part 1 interview drill, Focused Part 2 cue-card drill (with 1-min prep timer), and Focused Part 3 discussion drill with immediate audio replay and rubric feedback.
3. **Audio Capture, Playback & State Controller (`IeltsSpeakingRunner`):**
   - Live microphone recording integration via Web Audio / MediaRecorder APIs with deterministic fallback / fake provider for headless CI and test environments.
   - Per-part and per-question audio capture, pause/resume, stop, review playback, and recording duration indicators.
   - Checkpoint persistence in `ieltsTestRuns` / `ieltsSpeakingAttempts` stores (`IELTS_SPEAKING_CHECKPOINT_V1`).
4. **4-Dimension Rubric-Aligned Practice Feedback:**
   - Assessment across the 4 official IELTS speaking criteria:
     1. *Fluency & Coherence* [FC]
     2. *Lexical Resource* [LR]
     3. *Grammatical Range & Accuracy* [GRA]
     4. *Pronunciation* [PR]
   - User-visible results are strictly labeled as practice feedback: `"Estimated Band Score & Practice Feedback — Practice Reference"`. Explicit invariant: Zero claims of official IELTS examiner certification (ADR-050).
5. **Error Candidate Emission & Schedule Isolation:**
   - Emits `ErrorCandidate` records into `ErrorRepository` with category `'speaking-fluency'`, `'speaking-lexical'`, `'speaking-grammar'`, or `'speaking-pronunciation'`.
   - Strictly enforces `affectsSchedule: false`, `evidenceEligible: false` via `EvidencePolicy`.
6. **Prompt & Model Answer Privacy Invariant:**
   - `KEY_LEAK_BEFORE_SUBMIT === 0` strictly enforced across DOM, ARIA, and public item projections. Sample answers and examiner notes remain concealed before test submission.
7. **IELTS Hub Integration:**
   - Mounts Speaking launcher (Part 1, Part 2, Part 3, Full 3-Part Simulation) in `src/ielts-hub-v2.js` with track selection.

### 1.3 Strict Non-Authority Notice
> [!IMPORTANT]
> - This candidate manifest alone CANNOT activate W5 execution authority.
> - Execution authority is activated ONLY after independent authorization audit acceptance (`ACCEPT`), canonical manifest merge, and a subsequent replacement `AGENT_CONTEXT_AUTH_ACTIVATION_V1` transaction recorded in `docs/IMPLEMENTATION_STATUS.md`.

---

## 2. Predecessor State & Provenance Bounds

### 2.1 Wave Dependency Chain
$$\text{W0-IELTS-ARCH-001} + \text{W1-IELTS-OBJ-001} + \text{W2-IELTS-LIS-001} + \text{W3-IELTS-RDG-001} + \text{W4-IELTS-WRT-001} \longrightarrow \text{W5-IELTS-SPK-001}$$

- **Wave W0 (IELTS Product Contracts & Track Architecture):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #97).
- **Wave W1 (Objective Question Kernel Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #117).
- **Wave W2 (Listening Platform Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #131 / #132).
- **Wave W3 (Reading Platform Completeness):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #135 / #136).
- **Wave W4 (Productive Writing Platform):** Merged and canonically closed in `docs/IMPLEMENTATION_STATUS.md` (PR #139 / #140).
- **Canonical Main Base:** `c550a995b0954f5f087e73fc4fc142235d8e5cdd`.

---

## 3. Product Mission & Capabilities Owned

### 3.1 Mission
Deliver the comprehensive, end-to-end IELTS Speaking platform across Academic and General Training tracks: guided 3-part simulation state machine (Part 1 interview on familiar topics, Part 2 individual long turn cue card with 1-minute prep timer, scratch notes area, 2-minute recording countdown timer, and rounding questions, Part 3 in-depth analytical discussion), audio recording and playback review, autosave and reload recovery, 4-dimension rubric feedback generation, and Error Notebook integration.

### 3.2 Capabilities Owned
1. **3-Part Guided Speaking State Machine (`GAP-10`):**
   - **Part 1 (Introduction & Interview):**
     * 4–6 prompt questions across 2–3 familiar topics (e.g. work/study, hometown, hobbies, daily routines).
     * Audio/text prompt presentation with recording capture per question.
     * Suggested timing: 4–5 minutes total.
   - **Part 2 (Individual Long Turn / Cue Card):**
     * Cue card prompt container with main topic and 3–4 bullet points ("You should say...").
     * 1-minute countdown preparation timer (`PREP_SECONDS = 60`) with visual clock/progress ring.
     * Live scratch notes editor area accessible during preparation and speaking phases.
     * 2-minute recording countdown timer (`SPEAKING_SECONDS = 120`) with automatic completion alert.
     * 1–2 rounding-off follow-up questions concluding Part 2.
     * Total timing: 3–4 minutes.
   - **Part 3 (Two-Way Analytical Discussion):**
     * 4–6 thematic, abstract, and speculative discussion questions extending Part 2 themes.
     * Audio/text prompt presentation and candidate response recording.
     * Total timing: 4–5 minutes.
2. **Audio Capture, Playback & Controller Substrate:**
   - Web Audio / MediaRecorder API integration with safe mock fallback for headless / CI / test environments.
   - Recording states: idle, recording, paused, stopped, reviewing.
   - Per-part audio playback review, wave visualization / status indicators, and recording duration tracking.
   - Audio metadata and binary blob persistence in `ieltsSpeakingAttempts` store.
3. **Autosave & Interruption/Reload Recovery (`IELTS_SPEAKING_CHECKPOINT_V1`):**
   - Checkpoint persistence in `ieltsTestRuns` / `ieltsSpeakingAttempts`.
   - Restores active part, question index, elapsed timers, scratchpad notes, and recorded audio pointers upon reload without data loss.
4. **4-Dimension Rubric-Aligned Practice Feedback:**
   - Heuristic & rule-based practice feedback across official IELTS Speaking criteria:
     1. *Fluency & Coherence (FC)*: Speech continuity, flow, hesitation markers, and logical linking.
     2. *Lexical Resource (LR)*: Vocabulary range, topic-specific vocabulary, and paraphrase usage.
     3. *Grammatical Range & Accuracy (GRA)*: Sentence complexity, variety of structures, and grammatical precision.
     4. *Pronunciation (PR)*: Clarity, rhythm, and intelligibility indicators.
   - Honest labeling: `"Estimated Band Score & Practice Feedback — Practice Reference"`. Zero claims of official examiner certification (ADR-050).
5. **Error Candidate Emission & Containment:**
   - Emits `ErrorCandidate` records into `ErrorRepository` (categories: `speaking-fluency`, `speaking-lexical`, `speaking-grammar`, `speaking-pronunciation`).
   - Strict schedule isolation: `affectsSchedule: false`, `evidenceEligible: false`.
6. **IELTS Hub Integration:**
   - Mounts Speaking launcher (Part 1, Part 2, Part 3, Full Speaking Simulation) in `src/ielts-hub-v2.js` with track selection.

---

## 4. Scoring Semantics, Option Pools & Interaction Invariants

### 4.1 4-Dimension IELTS Speaking Assessment Model (Practice Reference)
$$\text{Overall Speaking Band} = \text{roundToHalfBand}\left(\frac{\text{FC} + \text{LR} + \text{GRA} + \text{PR}}{4}\right)$$

| Dimension | Key Evaluated Aspects |
|---|---|
| **Fluency & Coherence (FC)** | Continuity of speech, rate of speech, avoidance of unnatural pauses/self-correction, coherent sequencing of ideas, use of connectives and discourse markers. |
| **Lexical Resource (LR)** | Range and flexibility of vocabulary, use of less common and idiomatic vocabulary, collocation awareness, ability to paraphrase successfully. |
| **Grammatical Range & Accuracy (GRA)** | Range and flexibility of structures (simple and complex), proportion of error-free sentences, systematic grammatical control. |
| **Pronunciation (PR)** | Intelligibility, rhythm, sentence and word stress, intonation patterns, individual sound clarity. |

*Honesty Disclaimer:* All scores and feedback are strictly labeled `"Estimated Band Score & Practice Feedback — Practice Reference"` with zero claim of official certification (ADR-050).

### 4.2 Answer Key & Model Sample Privacy Invariant
$$\text{KEY\_LEAK\_BEFORE\_SUBMIT} = \mathbf{ZERO}$$
- Model speaking samples, band descriptors, and examiner commentary MUST NOT be exposed in the DOM, ARIA attributes, or client-accessible projections prior to simulation completion.

### 4.3 FSRS & Evidence Gateway Invariant
$$\text{affectsSchedule} = \text{false}, \quad \text{evidenceEligible} = \text{false}$$
- Zero direct FSRS schedule mutations from speaking simulation runs.

---

## 5. Exact Implementation Allowlist

Future W5 execution is strictly bounded to the following closed file sets. Writing to any file outside this allowlist is a protocol violation.

### 5.1 Source Allowlist (`SOURCE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `src/ielts-speaking-runner.js` | Core IELTS Speaking simulation runner orchestrator: 3-part guided state machine, timers (Part 1, Part 2 1-min prep / 2-min speaking, Part 3), scratch notes area, audio capture and review playback, 4-dimension rubric feedback generation, autosave and reload recovery, and error candidate emission. | **NEW** |
| `src/audio-manager.js` | Audio recording and playback controller with MediaRecorder / WebAudio integration and deterministic headless mock fallbacks. | **EXTEND** |
| `src/ielts-domain.js` | Export IELTS Speaking prompt schemas, task validators, timing constants, rubric assessment models, band conversion algorithms, and speaking error categories. | **EXTEND** |
| `src/ielts-persistence.js` | IndexedDB schema and store management for `speakingAttempts` / speaking records and checkpoint persistence. | **EXTEND** |
| `src/ielts-hub-v2.js` | Mount and launch Speaking simulation runner from the IELTS Hub UI with track selection. | **EXTEND** |

### 5.2 Test Allowlist (`TEST_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `tests/ielts-speaking-runner.test.mjs` | Unit & integration tests for 3-part speaking state machine, timers (1m prep, 2m speak), scratch notes, audio controller mock, 4-dimension rubric evaluation, error candidate emission, persistence, checkpoint recovery, and evidence policy isolation. | **NEW** |
| `tests/ielts-speaking-browser.test.mjs` | Browser / DOM tests for interactive speaking UI, cue card display, timers, scratchpad notes, audio recording controls, submission, and rubric feedback display. | **NEW** |

### 5.3 Fixture Allowlist (`FIXTURE_ALLOWLIST`)
NONE

### 5.4 Docs and Evidence Allowlist (`DOC_EVIDENCE_ALLOWLIST`)
NONE

---

## 6. RED / GREEN Execution Topology and Specification

Future W5 execution must follow a strict, two-commit RED $\to$ GREEN verification topology under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`:

```text
Canonical Base (c550a995b0954f5f087e73fc4fc142235d8e5cdd)
     │
     ▼
[COMMIT A: RED Tests Only] (Adds failing test assertions to TEST_ALLOWLIST; zero src/** edits)
     │
     ├─▶ Verified expected product failure predicates (Missing IeltsSpeakingRunner, missing 3-part flow, missing timers, missing rubric models)
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
7. `UNSAVED_DRAFT_LOSS`: Learner speaking audio or notes are lost or reset on page reload.
8. `OFFICIAL_CERTIFICATION_CLAIM`: Results claim official examiner or test centre certification.

---

## 8. Merge Authority Declarations

### 8.1 W5 Implementation Merge Authority
$$\text{W5\_IMPLEMENTATION\_MERGE\_AUTHORITY} = \mathbf{CONDITIONALLY\_GRANTED}$$
Conditional mechanical merge authority for the future W5 Implementation PR is granted to its Independent Implementation Auditor **ONLY IF** all of the following conditions are verified:
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
4. Base commit remains `c550a995b0954f5f087e73fc4fc142235d8e5cdd`;
5. Natural exact-head PR CI run concludes `SUCCESS` (attempt 1);
6. Exactly ONE changed path: `docs/authorizations/STAGE2-W5-IELTS-SPK-AUTH-001.md`;
7. Substantive findings = `NONE`;
8. PR is cleanly mergeable without conflicts.

**Merge Method:** Normal Merge Commit (no squash, no rebase).
