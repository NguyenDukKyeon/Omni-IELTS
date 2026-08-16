# Wave Authorization Manifest — Stage 2 Wave W2 (Listening Platform Completeness)

Manifest Identity: **STAGE2-W2-IELTS-LIS-AUTH-002**  
Wave ID: **W2-IELTS-LIS-001**  
Wave Name: **Listening Platform Completeness**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046)  
Date: **2026-08-17**  
Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**  
Canonical Predecessor (Base): **`260028060b8252745ffbe169195a91a58ea09fd3`**  
Target Implementation Branch (Future): **`exec/stage2-w2-ielts-lis-recovery-001`**  
Effective Implementation Predecessor: **`PENDING_POST_ACCEPT_ACTIVATION`**  
Historical Predecessor: **`STAGE2-W2-IELTS-LIS-AUTH-001`** (PR #119, merged but semantically superseded for future W2 execution)

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

Task-Specific Authorization: This document (`STAGE2-W2-IELTS-LIS-AUTH-002`) provides task-specific boundary authority under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` and ADR-046 when accepted and activated, but remains strictly subordinate to the canonical 6-tier hierarchy above.

### 1.2 Ratified Owner Decisions (D01, D02, D03)
This successor manifest incorporates the Owner-ratified product decisions superseding historical AUTH-001 assumptions:
1. **D01 — Computer-Delivered Listening Model:**
   - OmniIELTS Listening Exam Mode models computer-delivered IELTS behavior.
   - Learner answers directly in the application interface.
   - There is NO 10-minute paper answer-transfer phase.
   - After Part 4 audio completes, the runner provides exactly `REVIEW_MINUTES = 2` for final answer review before submission.
2. **D02 — Exam Interruption & Reload Recovery:**
   - Exam Mode strictly preserves 1-play audio semantics.
   - Checkpoint state persists answered items, active part/section, elapsed test timing, and authoritative playback position.
   - On reload/interruption, learner answers and test state are restored, and playback resumes from the authoritative elapsed audio position without replaying already heard audio or restarting the section from 0.
   - If exact safe resume cannot be verified by the media runtime, the runner fails closed.
3. **D03 — Listening Score Presentation & Honesty Label:**
   - Deterministic raw-score to band benchmark provides practice analytics.
   - User-visible results are clearly labeled as a practice reference estimate: `"Estimated Band Score — Practice Reference"`.
   - Strictly complies with ADR-050 honesty requirements (no claims of official certification or examiner guarantee).

### 1.3 Strict Non-Authority Notice
> [!IMPORTANT]
> - This candidate manifest alone CANNOT activate W2 execution authority.
> - Execution authority is activated ONLY after independent authorization audit acceptance (`ACCEPT`), canonical manifest merge, and a subsequent replacement `AGENT_CONTEXT_AUTH_ACTIVATION_V1` transaction recorded in `docs/IMPLEMENTATION_STATUS.md`.

---

## 2. Predecessor State & Provenance Bounds

### 2.1 Wave Dependency Chain
$$\text{W0-IELTS-ARCH-001} + \text{W1-IELTS-OBJ-001} \longrightarrow \text{W2-IELTS-LIS-001}$$

- **Wave W0 (IELTS Product Contracts & Track Architecture):** Merged and canonically closed at `3ea8ca2800800a871529ef35d4a126111bde544a`.
- **Wave W1 (Objective Question Kernel Completeness):** Merged and canonically closed at `3ea8ca2800800a871529ef35d4a126111bde544a`.
- **Wave W2 Historical Candidate (PR #121):** Closed and frozen as `HISTORICAL_REJECTED_FROZEN` (`3f83fa6f550e2f1252c579456f97ef3c0503192b`).
- **Canonical Main Base:** `260028060b8252745ffbe169195a91a58ea09fd3`.

---

## 3. Product Mission & Capabilities Owned

### 3.1 Mission
Deliver the end-to-end IELTS Listening platform across Academic and General Training tracks: 4-part 40-item test orchestration, real media player audio synchronization with 1-play exam vs practice replay policies, computer-delivered 2-minute review phase, strict reload checkpoint recovery, interactive question activity rendering, and Error Notebook integration.

### 3.2 Capabilities Owned
1. **4-Part 40-Item Test Orchestration (`IeltsListeningRunner`):**
   - Part 1: Social Needs / Dialogue (Questions 1–10).
   - Part 2: Social Needs / Monologue (Questions 11–20).
   - Part 3: Educational Context / Dialogue (Questions 21–30).
   - Part 4: Academic Context / Monologue (Questions 31–40).
2. **Audio Synchronization & Media Player Integration (`src/ielts-media-player.js`):**
   - Real media player binding (`YouTubeSegmentPlayer` / audio substrate) with section cues.
   - Exam Mode: Continuous single playback; seek and replay disabled; transcript hidden pre-submission.
   - Practice Mode: Flexible pause, seek, replay, per-question check, and toggleable transcript.
3. **Computer-Delivered Timing & Review Phase (D01):**
   - 30 minutes test audio + exactly 2 minutes review time (`REVIEW_MINUTES = 2`).
4. **Checkpoint & Reload Recovery (D02):**
   - Saves run progress to `ieltsTestRuns` store.
   - Resumes from authoritative elapsed audio position; fails closed if position cannot be verified.
5. **Interactive Question Activity Rendering:**
   - Real interactive rendering of multiple-choice, text completion, and matching items using QAR primitives.
6. **Deterministic Practice Score Benchmark & Honesty Label (D03):**
   - Deterministic 0–40 raw score to 0.0–9.0 band conversion function.
   - UI display: `"Estimated Band Score — Practice Reference"`.
7. **Error Candidate Emission & Containment:**
   - Emits `ErrorCandidate` records into `ErrorRepository` for wrong/partial responses.
   - Enforces `affectsSchedule: false`, `evidenceEligible: false` via `EvidencePolicy`.

---

## 4. Scoring Semantics, Option Pools & Interaction Invariants

### 4.1 4-Part Test Structure & Blueprint Contracts
1. **Blueprint Schema (`ielts-test-blueprint`):**
   - `id`: Unique test blueprint identifier (e.g. `ielts-listening-test-001`).
   - `kind`: `'ielts-test-blueprint'`.
   - `schemaVersion`: `1`.
   - `skill`: `'listening'`.
   - `track`: `'academic'` or `'general-training'`.
   - `hierarchyLevel`: `'SKILL_TEST'` (validated by `validateIeltsPracticeHierarchyLevel`).
   - `title`: Test title string.
   - `timing`: `{ testMinutes: 30, reviewMinutes: 2, totalSeconds: 1920 }`.
   - `sections`: Exactly 4 sections (Parts 1–4), each containing exactly 10 question bindings (total 40 items).
   - `media`: `{ sourceId: string, durationSeconds: number, sectionCues: [...] }`.

### 4.2 Deterministic IELTS Listening Band Score Benchmark (Practice Reference)
$$\text{Raw Score} \in [0, 40] \longrightarrow \text{Estimated Band Score} \in [0.0, 9.0]$$

| Raw Score (Correct / 40) | Estimated Band Score (Practice Reference) |
|---|---|
| 39 – 40 | **9.0** |
| 37 – 38 | **8.5** |
| 35 – 36 | **8.0** |
| 32 – 34 | **7.5** |
| 30 – 31 | **7.0** |
| 26 – 29 | **6.5** |
| 23 – 25 | **6.0** |
| 18 – 22 | **5.5** |
| 16 – 17 | **5.0** |
| 13 – 15 | **4.5** |
| 10 – 12 | **4.0** |
| 6 – 9 | **3.5** |
| 4 – 5 | **3.0** |
| 2 – 3 | **2.5** |
| 1 | **2.0** |
| 0 | **0.0** |

*Conversion Function:* `convertIeltsListeningRawToBand(rawScore)` must return a deterministic number matching this exact scale.

### 4.3 Answer Key Privacy Invariant (Strict Non-Negotiable)
$$\text{KEY\_LEAK\_BEFORE\_SUBMIT} = \mathbf{ZERO}$$
- Sealed answer keys and rationales MUST NOT be exposed in the DOM, ARIA attributes, or client-accessible question projections prior to submission.

### 4.4 FSRS & Evidence Gateway Invariant
$$\text{affectsSchedule} = \text{false}, \quad \text{evidenceEligible} = \text{false}$$
- Zero direct FSRS schedule mutations from test runs.

---

## 5. Exact Implementation Allowlist

Future W2 execution is strictly bounded to the following closed file sets. Writing to any file outside this allowlist is a protocol violation.

### 5.1 Source Allowlist (`SOURCE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `src/ielts-listening-runner.js` | Core 4-part Listening test runner orchestrator: section lifecycle, real media audio synchronization, D01 2-min review, D02 reload recovery, QAR interactive rendering, practice benchmark scoring, error candidate emission, and run state management. | **NEW** |
| `src/ielts-media-player.js` | Media player support for section cue boundaries, 1-play exam enforcement, reload position recovery, and practice playback controls. | **EXTEND** |
| `src/ielts-domain.js` | Export `convertIeltsListeningRawToBand()`, Listening test run validator extensions, and section timing helpers. | **EXTEND** |
| `src/ielts-hub-v2.js` | Mount and launch Listening test runner from the IELTS Hub UI with track selection. | **EXTEND** |

### 5.2 Test Allowlist (`TEST_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `tests/ielts-listening-runner.test.mjs` | Unit & integration tests for 4-part listening orchestration, real audio synchronization, 1-play vs practice policies, D01 review timer, D02 reload recovery, raw-to-band conversion, error candidate emission, and persistence. | **NEW** |
| `tests/ielts-listening-browser.test.mjs` | Browser / DOM tests for 4-part listening UI, section navigation, interactive question input rendering, audio player controls, and results view. | **NEW** |

### 5.3 Fixture Allowlist (`FIXTURE_ALLOWLIST`)
NONE

### 5.4 Docs and Evidence Allowlist (`DOC_EVIDENCE_ALLOWLIST`)
NONE

---

## 6. RED / GREEN Execution Topology and Specification

Future W2 execution must follow a strict, two-commit RED $\to$ GREEN verification topology under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`:

```text
Canonical Base (260028060b8252745ffbe169195a91a58ea09fd3)
     │
     ▼
[COMMIT A: RED Tests Only] (Adds failing test assertions to TEST_ALLOWLIST; zero src/** edits)
     │
     ├─▶ Verified expected product failure predicates (Missing real media-player integration, runner, Hub mounting)
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
7. `RELOAD_RECOVERY_UNSAFE`: Section restarts from 0 or extra listening time granted on reload.

---

## 8. Merge Authority Declarations

### 8.1 W2 Implementation Merge Authority
$$\text{W2\_IMPLEMENTATION\_MERGE\_AUTHORITY} = \mathbf{CONDITIONALLY\_GRANTED}$$
Conditional mechanical merge authority for the future W2 Implementation PR is granted to its Independent Implementation Auditor **ONLY IF** all of the following conditions are verified:
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
4. Base commit remains `260028060b8252745ffbe169195a91a58ea09fd3`;
5. Natural exact-head PR CI run concludes `SUCCESS` (attempt 1);
6. Exactly ONE changed path: `docs/authorizations/STAGE2-W2-IELTS-LIS-AUTH-002.md`;
7. Substantive findings = `NONE`;
8. PR is cleanly mergeable without conflicts.

**Merge Method:** Normal Merge Commit (no squash, no rebase).
