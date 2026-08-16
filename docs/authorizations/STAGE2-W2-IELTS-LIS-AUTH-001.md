# Wave Authorization Manifest — Stage 2 Wave W2 (Listening Platform Completeness)

Manifest Identity: **STAGE2-W2-IELTS-LIS-AUTH-001**  
Wave ID: **W2-IELTS-LIS-001**  
Wave Name: **Listening Platform Completeness**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046)  
Date: **2026-08-17**  
Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**  
Canonical Predecessor (Base): **`3ea8ca2800800a871529ef35d4a126111bde544a`**  
Target Implementation Branch (Future): **`exec/stage2-w2-ielts-lis-001`**  
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

Task-Specific Authorization: This document (`STAGE2-W2-IELTS-LIS-AUTH-001`) provides task-specific boundary authority under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` and ADR-046 when accepted and activated, but remains strictly subordinate to the canonical 6-tier hierarchy above.

### 1.2 Controlling Authorities Fresh-Read Ledger
1. **`docs/MASTER_ROADMAP.md`**: Canonical Master Product Roadmap (Stage 1–8) under ADR-049. Stage 1 and Stage 1.5 are `COMPLETE`; Stage 2 (IELTS Completeness) is active; Stages 3–8 are `FUTURE / NOT AUTHORIZED`.
2. **`docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`**: Independently audited and accepted strategy candidate (PR #87 / commit `a755ae4949746a71ac86299b34766ad8fe3b6fb6`). Establishes Option B (Full IELTS Platform: Academic + General Training across Listening, Reading, Writing, Speaking) and defines the Stage 2 Wave sequence: W0 $\to$ W1 $\to$ (W2 / W3 / W4 / W5) $\to$ W6.
3. **`docs/ROADMAP.md`**: Subordinate Level 2 Technical Package Taxonomy for Phase 0–7.
4. **`docs/IMPLEMENTATION_PLAN.md`**: Package specifications, acceptance criteria, test plans, and rollback expectations.
5. **`docs/IMPLEMENTATION_STATUS.md`**: Canonical status ledger and commit bindings. Verifies Wave W0 is `CANONICALLY_CLOSED` via PR #97 (`44bd3f8`) and Wave W1 is `CANONICALLY_CLOSED` via PR #117 / PR #118 (`225d592` / `3ea8ca2`).
6. **`docs/DECISIONS.md`**: Architecture decision records, specifically ADR-004 (EvidencePolicy sole FSRS gateway), ADR-005 (Failure persistence), ADR-046 (`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`), ADR-049 (Master Roadmap authority), ADR-050 (Full IELTS Platform), and ADR-051 (`EXECUTION_PROMPT_PROTOCOL_V2`).
7. **`AGENTS.md`**: Repository routing entrypoint, single-writer rule, strict allowlist discipline, evidence gateway, and global execution stop conditions.
8. **`docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`**: Prompting and handoff rules governing execution roles.
9. **`docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md`**: Controlling authorization for Wave W0.
10. **`docs/authorizations/STAGE2-W1-IELTS-OBJ-AUTH-002.md`**: Controlling authorization for Wave W1.

### 1.3 Role Definition & Non-Authority Statement
> [!IMPORTANT]
> - This document is authored by the **Stage 2 W2 Authorization Manifest Author**.
> - The author is **NOT**: a W2 Implementer, an Independent Auditor, an activation recorder, a merge executor, or a Stage 2 package acceptor.
> - This document is an **AUTHORIZATION MANIFEST CANDIDATE ONLY**.
> - It does **NOT** authorize W2 implementation execution.
> - It does **NOT** activate W2 execution authority.
> - It does **NOT** modify runtime source code, test suites, or persistence schemas.
> - Candidate manifest alone cannot activate W2. Execution authority is activated **ONLY** after independent authorization audit acceptance, canonical manifest merge, and a subsequent canonical `AGENT_CONTEXT_AUTH_ACTIVATION_V1` transaction recorded in `docs/IMPLEMENTATION_STATUS.md`.

---

## 2. W0 + W1 Dependency Gate Verification

Under `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md` §10.3, Wave W2 depends strictly on Wave W0 (`W0-IELTS-ARCH-001`) and Wave W1 (`W1-IELTS-OBJ-001`):

$$\text{W0-IELTS-ARCH-001} + \text{W1-IELTS-OBJ-001} \longrightarrow \text{W2-IELTS-LIS-001}$$

Fresh verification of canonical repository state confirms:

| Requirement | Canonical Evidence | Status |
|---|---|---|
| **W0 Wave ID** | `W0-IELTS-ARCH-001` | VERIFIED |
| **W0 Status** | `CANONICALLY_CLOSED` (`docs/IMPLEMENTATION_STATUS.md` §18) | VERIFIED |
| **W0 Implementation PR** | PR #97 (`https://github.com/NguyenDukKyeon/VocabMaster/pull/97`) | VERIFIED |
| **W0 Canonical Merge SHA** | `44bd3f86ec151b0c9b797e5cba59ba77d57533e8` | VERIFIED |
| **W1 Wave ID** | `W1-IELTS-OBJ-001` | VERIFIED |
| **W1 Status** | `CANONICALLY_CLOSED` (`docs/IMPLEMENTATION_STATUS.md` §20) | VERIFIED |
| **W1 Implementation PR** | PR #117 (`https://github.com/NguyenDukKyeon/VocabMaster/pull/117`) | VERIFIED |
| **W1 Reconciliation PR** | PR #118 (`https://github.com/NguyenDukKyeon/VocabMaster/pull/118`) | VERIFIED |
| **W1 Canonical Merge SHA** | `225d5926dd9b68d1e39541c70caf505528f289be` | VERIFIED |
| **W2 Dependency State** | W2 depends on W0 + W1; both are fully closed on canonical `main` | **SATISFIED** |

---

## 3. Canonical Product Scope and Official Listening Platform Architecture

### 3.1 Wave Mission
Build the end-to-end IELTS Listening platform for Academic and General Training:
1. **4-Part 40-Item Test Runner**: Execute authentic 4-part IELTS Listening assessments (Part 1: Social Dialogue, Part 2: Social Monologue, Part 3: Academic/Training Discussion, Part 4: Academic Lecture; 10 questions each, total 40 questions).
2. **Audio Player & Section Synchronization**: Synchronize audio playback with section progression, visual item highlighting, and section countdown timers.
3. **Exam Mode vs Practice Mode**:
   - **Exam Mode**: Strict single playback (1-play only), disabled pause/seek during section audio, 10-minute transfer time at test conclusion.
   - **Practice Mode**: Flexible playback controls (pause, seek, replay segment), per-question immediate scoring, and transcript toggle.
4. **Deterministic Band Score Conversion**: Official raw score (0–40) to IELTS Band Score (0.0–9.0) conversion table.
5. **Error Notebook Integration**: Emit canonical `ErrorCandidate` records for all incorrect or partially correct listening responses.
6. **Durable Session Persistence**: Save, resume, and inspect listening test runs via `ieltsTestRuns` store.
7. **IELTS Hub Integration**: Mount and launch the Listening Platform from the IELTS Hub UI.

### 3.2 Canonical GAPs Owned
- **GAP-04 (High Severity):** 4-Part Listening Test Runner & Audio Control — missing multi-part test orchestration, exam vs practice playback policies, and 40-item band conversion.

### 3.3 Official Listening Task-Family Coverage (11 / 11 Official Families)
Wave W2 orchestrates all 11 official IELTS Listening task families using the canonical QAR primitives completed in Wave W1:

| # | Official Task Family | Canonical QAR Kind | Execution Substrate |
|---|---|---|---|
| L1 | **Multiple Choice (Single)** | `listening-multiple-choice` (v2) | `QuestionActivity` single-choice |
| L2 | **Multiple Choice (Multiple)** | `listening-multiple-choice-multiple` (v1) | `QuestionActivity` multi-select |
| L3 | **Matching** | `listening-matching` (v1) | `ObjectiveMatchingResponse` |
| L4 | **Plan, Map, Diagram Labelling** | `listening-plan-map-diagram-labelling` (v1) | `ObjectiveMatchingResponse` + Spatial |
| L5 | **Form Completion** | `listening-form-completion` (v1) | `ObjectiveTextResponse` (OTR) |
| L6 | **Note Completion** | `listening-note-completion` (v1) | `ObjectiveTextResponse` (OTR) |
| L7 | **Table Completion** | `listening-table-completion` (v1) | `ObjectiveTextResponse` (OTR) |
| L8 | **Flow-Chart Completion** | `listening-flow-chart-completion` (v1) | `ObjectiveTextResponse` (OTR) |
| L9 | **Summary Completion** | `listening-summary-completion` (v1) | `ObjectiveTextResponse` (OTR) |
| L10 | **Sentence Completion** | `listening-sentence-completion` (v1) | `ObjectiveTextResponse` (OTR) |
| L11 | **Short-Answer Questions** | `listening-short-answer` (v1) | `ObjectiveTextResponse` (OTR) |

### 3.4 Strict Out-of-Scope Ledger
The following capabilities are **STRICTLY OUT OF SCOPE** for Wave W2:
- **W3 (Reading Platform Completeness):** Academic 3-passage runner, GT 3-section runner, split-pane reading layout, 60-minute countdown timer, reading band conversion curves.
- **W4 (Productive Writing Platform):** Academic Task 1 visual renderers, GT Task 1 letter templates, Task 2 essay platform, 4-dimension rubric feedback.
- **W5 (Productive Speaking Platform):** 3-part guided speaking simulation, audio recording/playback, Part 2 cue-card timer, rubric feedback.
- **W6 (Full Mock Orchestrator & Exit Gate):** Multi-skill mock coordinator (L $\to$ R $\to$ W $\to$ S), cumulative 4-skill band calculator, mock exit gate.
- **Interstage & Global Scope:** Stages 3–8 research, global UX/IA redesign, external AI provider integrations, new database engines, content authoring/scraping.

---

## 4. Scoring Semantics, Option Pools & Interaction Invariants

### 4.1 4-Part Test Structure & Blueprint Contracts
1. **Blueprint Schema (`ielts-test-blueprint`):**
   - `id`: Unique test blueprint identifier (e.g. `ielts-listening-test-001`).
   - `kind`: `'ielts-test-blueprint'`.
   - `schemaVersion`: `1`.
   - `skill`: `'listening'`.
   - `track`: `'academic'` or `'general-training'` (Listening content is identical across tracks as per official IELTS specification, but track binding is validated).
   - `hierarchyLevel`: `'test'`.
   - `title`: Test title.
   - `timing`: `{ totalMinutes: 30, transferMinutes: 10, mode: 'timed' }`.
   - `sections`: Exactly 4 sections (Parts 1–4), each containing exactly 10 question bindings (total 40 items).
   - `media`: `{ sourceId: string, audioUrl?: string, durationSeconds: number, sectionCues: [{ part: 1|2|3|4, startSeconds: number, endSeconds: number }] }`.
2. **Section Progression:**
   - Sequential progression Part 1 $\to$ Part 2 $\to$ Part 3 $\to$ Part 4.
   - Learner can navigate between completed and active section questions during the test.
   - At end of Part 4, enter the 10-minute Transfer Time phase (in Exam Mode) before final submission.

### 4.2 Audio Synchronization & Playback Policies
1. **Exam Mode (`EXAM_MODE`):**
   - **1-Play Only:** Audio plays continuously from start to finish of each section; seeking backward or replaying completed audio is strictly blocked.
   - **Pause Policy:** Pausing is disabled during section playback to simulate authentic exam conditions.
   - **Transcript Visibility:** Transcript is strictly hidden before submission.
2. **Practice Mode (`PRACTICE_MODE`):**
   - **Full Playback Control:** Learner can pause, seek, replay specific question segments.
   - **Immediate Feedback:** Option to check answers per question.
   - **Transcript Reveal:** Toggleable transcript view synchronized with audio timestamp.

### 4.3 Deterministic IELTS Listening Band Score Conversion
Official IELTS Listening raw-to-band conversion table (40 items total):

$$\text{Raw Score} \in [0, 40] \longrightarrow \text{Band Score} \in [0.0, 9.0]$$

| Raw Score (Correct / 40) | IELTS Band Score |
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

### 4.4 Error Candidate Emission & Error Notebook Integration
1. On test completion, every question resulting in a `wrong` or `partial` score automatically emits an `ErrorCandidate` envelope via `createErrorCandidate()`.
2. Emitted candidate includes:
   - `category`: `'listening'` or specific item kind (e.g. `'listening-multiple-choice'`).
   - `target`: Question target reference.
   - `learnerOutput`: Learner's submitted answer.
   - `advisory`: `{ producer: 'ielts-listening-runner', testRunId, blueprintId, part, questionNumber }`.
3. Candidates are stored in `ErrorRepository` and visible in Error Notebook.

### 4.5 Answer Key Privacy Invariant (Strict Non-Negotiable)
$$\text{KEY\_LEAK\_BEFORE\_SUBMIT} = \mathbf{ZERO}$$
- Sealed answer keys and rationales MUST NOT be exposed in the DOM, ARIA attributes, or client-accessible question projections prior to submission.
- Public question items contain only prompts, options (text/id), and slot structures.

### 4.6 FSRS & Evidence Gateway Invariant
- Full test runs emit canonical `Attempt` and `Receipt` envelopes into `TodayRunner` / `EventRepository`.
- All emitted evidence envelopes pass through `EvidencePolicy` (`src/evidence-policy.js`) and enforce:
  $$\text{affectsSchedule} = \text{false}, \quad \text{evidenceEligible} = \text{false}$$
- Zero direct FSRS schedule mutations from test runs.

---

## 5. Exact Implementation Allowlist

Future W2 execution is strictly bounded to the following closed file sets. Writing to any file outside this allowlist is a protocol violation.

### 5.1 Source Allowlist (`SOURCE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `src/ielts-listening-runner.js` | Core 4-part Listening test runner orchestrator: section lifecycle, audio synchronization, exam/practice policies, band scoring, error emission, and run state management. | **NEW** |
| `src/ielts-media-player.js` | Media player support for section cue boundaries, 1-play exam enforcement, and practice playback controls. | **EXTEND** |
| `src/ielts-domain.js` | Export `convertIeltsListeningRawToBand()`, Listening test run validator extensions, and section timing helpers. | **EXTEND** |
| `src/ielts-hub-v2.js` | Mount and launch Listening test runner from the IELTS Hub UI with track selection. | **EXTEND** |

### 5.2 Test Allowlist (`TEST_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `tests/ielts-listening-runner.test.mjs` | Unit & integration tests for 4-part listening orchestration, 1-play vs practice audio policies, raw-to-band conversion, error candidate emission, and persistence. | **NEW** |
| `tests/ielts-listening-browser.test.mjs` | Browser / DOM tests for 4-part listening UI, section navigation, audio player synchronization, and results view. | **NEW** |

### 5.3 Fixture Allowlist (`FIXTURE_ALLOWLIST`)
NONE

### 5.4 Docs and Evidence Allowlist (`DOC_EVIDENCE_ALLOWLIST`)
NONE

---

## 6. RED / GREEN Execution Topology and Specification

Future W2 execution must follow a strict, two-commit RED $\to$ GREEN verification topology under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`:

```text
Canonical Base (3ea8ca2800800a871529ef35d4a126111bde544a)
     │
     ▼
[COMMIT A: RED Tests Only] (Adds failing test assertions to TEST_ALLOWLIST; zero src/** edits)
     │
     ├─▶ Verified expected product failure predicates (Missing 4-part listening runner & band conversion)
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

### 6.1 Commit A — RED Test Contract and Expected Failure Predicates
Commit A must introduce deterministic test failures in `tests/ielts-listening-runner.test.mjs` asserting:
1. `ERR_MODULE_NOT_FOUND` or missing export for `IeltsListeningRunner` from `../src/ielts-listening-runner.js`.
2. `convertIeltsListeningRawToBand` fails or is undefined for raw score band lookups (0–40).
3. 4-part test runner creation fails when attempting to orchestrate 4 sections with audio synchronization.
4. Exam mode 1-play restriction fails when attempted without runner enforcement.
5. Error candidate emission fails when completing test with wrong answers.

### 6.2 RED Immutability Rule
Once Commit A is committed and verified under natural CI, all Commit A test blobs are **PERMANENTLY IMMUTABLE**. Commit B must not modify, weaken, delete, or skip any test introduced in Commit A.

### 6.3 Commit B — GREEN Implementation Contract
Commit B modifies **ONLY** files in `SOURCE_ALLOWLIST`. It satisfies the failing tests with minimal correct implementation:
1. `IeltsListeningRunner` is implemented in `src/ielts-listening-runner.js` orchestrating 4-part test execution.
2. `convertIeltsListeningRawToBand` is implemented in `src/ielts-domain.js` returning deterministic band scores (0.0–9.0).
3. Audio synchronization and 1-play exam vs practice modes are implemented in `src/ielts-media-player.js` and `src/ielts-listening-runner.js`.
4. Error candidates are emitted for wrong/partial responses into `ErrorRepository`.
5. Listening test runner is mounted in `src/ielts-hub-v2.js`.
6. Sealed answer keys are 100% private pre-submission (`KEY_LEAK_BEFORE_SUBMIT === 0`).
7. Zero persistence schema mutations (uses existing `ieltsTestRuns` and `ieltsTestBlueprints` stores).
8. Zero new runtime dependencies (`package.json` and `package-lock.json` are unchanged).
9. Zero FSRS schedule mutations (`affectsSchedule === false`, `evidenceEligible === false`).

---

## 7. Post-Accept Activation Lifecycle & Contract (Mandatory)

### 7.1 Lifecycle Architecture
Under repository governance rules, this authorization manifest candidate does not self-activate execution authority. The mandatory lifecycle is:

$$\begin{matrix}
\textbf{1. AUTHORIZATION CANDIDATE} \quad (\text{This Document, PR Draft}) \\
\downarrow \\
\textbf{2. INDEPENDENT AUTHORIZATION AUDIT} \quad (\text{Fresh inspection of manifest \& diff}) \\
\downarrow \\
\textbf{3. AUTHORIZATION ACCEPT} \quad (\text{Formal audit verdict posted to PR}) \\
\downarrow \\
\textbf{4. NORMAL MERGE OF AUTHORIZATION MANIFEST} \quad (\text{Merged to canonical } \texttt{main}) \\
\downarrow \\
\textbf{5. SEPARATE AGENT\_CONTEXT\_AUTH\_ACTIVATION\_V1 TRANSACTION} \quad (\text{Status write}) \\
\downarrow \\
\textbf{6. INDEPENDENT ACTIVATION AUDIT} \quad (\text{Verify activation record consistency}) \\
\downarrow \\
\textbf{7. NORMAL ACTIVATION MERGE} \quad (\text{Merged to canonical } \texttt{main}) \\
\downarrow \\
\textbf{8. ACTIVATION MERGE SHA BECOMES EXACT W2 IMPLEMENTATION PREDECESSOR} \\
\downarrow \\
\textbf{9. ONLY THEN W2 IMPLEMENTATION MAY START}
\end{matrix}$$

### 7.2 Non-Equivalence Invariants
- $\text{MERGED MANIFEST} \neq \text{EXECUTION AUTHORITY}$
- $\text{INDEPENDENT AUTHORIZATION ACCEPT} \neq \text{EFFECTIVE IMPLEMENTATION PREDECESSOR}$
- Wave W2 remains fail-closed and unexecutable until canonical V1 activation is merged.

### 7.3 Future Activation Record Contract
A separate activation transaction must add exactly one canonical record to `docs/IMPLEMENTATION_STATUS.md` matching this exact schema:

```markdown
## AGENT_CONTEXT_AUTH_ACTIVATION_V1 — W2-IELTS-LIS-001

| Field | Value |
|---|---|
| `Activation Schema` | `AGENT_CONTEXT_AUTH_ACTIVATION_V1` |
| `Transaction ID` | `W2-IELTS-LIS-001` |
| `Authorization Manifest` | `docs/authorizations/STAGE2-W2-IELTS-LIS-AUTH-001.md` |
| `Authorization Manifest Identity` | `STAGE2-W2-IELTS-LIS-AUTH-001` |
| `Authorization Accepted Head` | `<exact independently accepted authorization PR head>` |
| `Independent Authorization Review` | `<exact persisted independent review identity>` |
| `Authorization Merge SHA` | `SELF_RESOLVE_ACTIVATION_MERGE_SHA` |
| `Activation State` | `AUTHORIZED / READY_FOR_EXECUTION` |
| `Effective Implementation Predecessor` | `SELF_RESOLVE_ACTIVATION_MERGE_SHA` |
```

*(The authorization author does NOT write this activation record in this transaction).*

---

## 8. Persistence, Migration, Rollback & Compatibility

### 8.1 Persistence & Storage Impact
- **New Stores:** `NONE` (uses existing `IELTS_STORE_NAMES.testBlueprints` and `IELTS_STORE_NAMES.testRuns`)
- **Database Version Change:** `NONE` (stays at `IELTS_DB_VERSION = 4`)
- **Migration Ledger Change:** `NONE`
- **Backup Schema Change:** `NONE` (stays at full backup schema v6)
- **Rationale:** Test runs persist in `ieltsTestRuns` and blueprints in `ieltsTestBlueprints`, both already established and verified in `src/backup-registry.js`.

### 8.2 Rollback Strategy
Because W2 introduces additive runner logic and uses pre-registered stores without database schema mutations, rollback is purely code-level:
- Reverting W2 source changes removes the listening runner from IELTS Hub.
- Existing test runs remain readable in `ieltsTestRuns`.
- Zero database downgrade or data corruption.

---

## 9. Verification Commands and CI Profile

Future W2 execution must run the following focused and repository regression gates:

### 9.1 Local Verification Commands

```bash
# Focused W2 test suite
node --test tests/ielts-listening-runner.test.mjs
node --test tests/ielts-listening-browser.test.mjs

# Full repository verification
npm test
npm run check
npm run audit:roadmap
npm run audit:ielts
npm run test:v10
npm run audit:v10
npm run build
```

### 9.2 Natural Exact-Head CI
- **Commit A (RED):** Natural `pull_request` CI run on exact Commit A SHA. Attempt: 1. Must fail specifically on the declared product RED predicates.
- **Commit B (GREEN):** Natural `pull_request` / `synchronize` CI run on exact Commit B SHA. Attempt: 1. Conclusion: `SUCCESS`.
- Forbidden: `workflow_dispatch`, close/reopen tricks, historical CI reuse, or synthetic event tampering.

---

## 10. Execution Stop Conditions

The future W2 executor and auditor must immediately halt execution if any of the following occur:

1. **`CANONICAL_BASE_DRIFT`**: Base commit diverges from expected canonical `origin/main` commit.
2. **`PREDECESSOR_MISMATCH`**: Commit parent chain does not bind the exact authorized predecessor.
3. **`W0_W1_DEPENDENCY_NOT_SATISFIED`**: Canonical W0 or W1 closure evidence is missing or contested.
4. **`W2_SOURCE_SCOPE_UNRESOLVED`**: Required source modification touches files outside `SOURCE_ALLOWLIST`.
5. **`W2_TEST_SCOPE_UNRESOLVED`**: Required test modification touches files outside `TEST_ALLOWLIST`.
6. **`W2_AUDIO_POLICY_SEMANTICS_UNDERDEFINED`**: Exam mode 1-play or practice mode playback contract is ambiguous.
7. **`W2_BAND_CONVERSION_UNDERDEFINED`**: Raw-to-band conversion table or rounding rule is underdefined.
8. **`W2_LISTENING_COVERAGE_INCOMPLETE`**: Any of the 11 official listening task families lacks orchestration support.
9. **`KEY_LEAK_BEFORE_SUBMIT`**: Sealed answer keys leak into public question projections, DOM, or ARIA pre-submission.
10. **`NON_DETERMINISTIC_SCORING`**: Same response and question produce different score receipts across repeated runs.
11. **`W2_PERSISTENCE_SCOPE_CONTRADICTION`**: Implementation attempts to modify IndexedDB version or create new stores.
12. **`W2_EVIDENCE_AUTHORITY_EXPANSION_REQUIRED`**: Implementation attempts direct FSRS mutation or schedule bypass.
13. **`NEW_DEPENDENCY_REQUIRED`**: Implementation requires editing `package.json` or `package-lock.json`.
14. **`WORKFLOW_CHANGE_REQUIRED`**: Implementation requires editing `.github/workflows/**`.
15. **`SCOPE_VIOLATION`**: Any file outside the frozen allowlists is modified.
16. **`UNNATURAL_RED`**: Commit A fails due to syntax error, fixture defect, or infrastructure failure rather than product requirements.
17. **`RED_TEST_MUTATED`**: Commit A test blobs are altered during Commit B.
18. **`NATURAL_GREEN_NOT_SUCCESSFUL`**: Commit B fails any verification gate or natural CI run.
19. **`PUBLISHED_HISTORY_REWRITE`**: Any rebase, amend, or force-push occurs on candidate history.
20. **`ACTIVATION_NOT_CANONICAL`**: Implementation begins before canonical V1 activation is merged into `main`.
21. **`ACTIVATION_PREDECESSOR_STALE`**: Canonical `main` advances past the activation merge SHA before execution begins.

---

## 11. Merge Authority Declarations

### 11.1 W2 Implementation Merge Authority
$$\text{W2\_IMPLEMENTATION\_MERGE\_AUTHORITY} = \mathbf{NOT\_GRANTED}$$
A future implementation auditor may NOT merge W2 implementation code unless explicit merge authority is separately granted by controlling Owner authority.

### 11.2 Authorization Manifest PR Merge Authority
Conditional mechanical merge authority for **THIS DOCS-ONLY AUTHORIZATION PR** is granted to its future Independent Authorization Auditor **ONLY IF** all of the following conditions are verified:
1. Fresh independent audit verdict = `ACCEPT`;
2. Formal `ACCEPT` verdict is persisted to PR and read back;
3. Exact candidate head SHA remains unchanged;
4. Base commit remains `3ea8ca2800800a871529ef35d4a126111bde544a`;
5. Natural exact-head PR CI run concludes `SUCCESS` (attempt 1);
6. Exactly ONE changed path: `docs/authorizations/STAGE2-W2-IELTS-LIS-AUTH-001.md`;
7. Substantive findings = `NONE`;
8. PR is cleanly mergeable without conflicts.

**Merge Method:** Normal Merge Commit (no squash, no rebase).  
Post-merge push CI must be verified on canonical `main` by the auditor. This merge does NOT activate W2 implementation authority.
