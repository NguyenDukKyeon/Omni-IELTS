# Wave Authorization Manifest — Stage 2 Wave W1 (Objective Question Kernel Completeness)

Manifest Identity: **STAGE2-W1-IELTS-OBJ-AUTH-002**  
Wave ID: **W1-IELTS-OBJ-001**  
Wave Name: **Objective Question Kernel Completeness**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046)  
Date: **2026-08-16**  
Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**  
Canonical Predecessor (Base): **`4d9d6a3f5267b0a43f98d544cf6bbb46192c7ee2`**  
Target Implementation Branch (Future): **`exec/stage2-w1-ielts-obj-001`**  
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

Task-Specific Authorization: This document (`STAGE2-W1-IELTS-OBJ-AUTH-002`) provides task-specific boundary authority under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` and ADR-046 when accepted, but remains strictly subordinate to the canonical 6-tier hierarchy above.

### 1.2 Controlling Authorities Fresh-Read Ledger
1. **`docs/MASTER_ROADMAP.md`**: Canonical Master Product Roadmap (Stage 1–8) under ADR-049. Stage 1 and Stage 1.5 are `COMPLETE`; Stage 2 (IELTS Completeness) is `NEXT`; Stages 3–8 are `FUTURE / NOT AUTHORIZED`.
2. **`docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`**: Independently audited and accepted strategy candidate (PR #87 / commit `a755ae4949746a71ac86299b34766ad8fe3b6fb6`). Establishes Option B (Full IELTS Platform: Academic + General Training across Listening, Reading, Writing, Speaking) and defines the Stage 2 Wave sequence: W0 $\to$ W1 $\to$ (W2 / W3 / W4 / W5) $\to$ W6.
3. **`docs/ROADMAP.md`**: Subordinate Level 2 Technical Package Taxonomy for Phase 0–7.
4. **`docs/IMPLEMENTATION_PLAN.md`**: Package specifications, acceptance criteria, test plans, and rollback expectations.
5. **`docs/IMPLEMENTATION_STATUS.md`**: Canonical status ledger and commit bindings. Verifies Wave W0 is `CANONICALLY_CLOSED` via PR #97 merge commit `44bd3f86ec151b0c9b797e5cba59ba77d57533e8`.
6. **`docs/DECISIONS.md`**: Architecture decision records, specifically ADR-004 (EvidencePolicy sole FSRS gateway), ADR-005 (Failure persistence), ADR-046 (`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`), ADR-049 (Master Roadmap authority), ADR-050 (Full IELTS Platform), and ADR-051 (`EXECUTION_PROMPT_PROTOCOL_V2`).
7. **`AGENTS.md`**: Repository routing entrypoint, single-writer rule, strict allowlist discipline, evidence gateway, and global execution stop conditions.
8. **`docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`**: Prompting and handoff rules governing execution roles.
9. **`docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md`**: Controlling authorization for Wave W0.
10. **`docs/authorizations/STAGE2-W0-IELTS-ARCH-BASE-RECON-001.md`**: Controlling predecessor reconciliation for Wave W0.
11. **`docs/authorizations/STAGE2-W0-IELTS-ARCH-TEST-ALLOWLIST-RECON-001.md`**: Controlling test-allowlist reconciliation for Wave W0.

### 1.3 Historical Candidate Lineage & Remediation Ledger
- **Candidate `STAGE2-W1-IELTS-OBJ-AUTH-001` (PR #113 / `9e5442f40673aeafa2c5fb2e889dd96eab14dc29`)**: Formally `REJECTED` and `FROZEN` via independent review [4946619015](https://github.com/NguyenDukKyeon/VocabMaster/pull/113#pullrequestreview-4946619015).
- **Remediation Transaction `STAGE2-W1-IELTS-OBJ-AUTH-002`**: Cleanly rematerialized on a fresh branch (`docs/stage2-w1-ielts-obj-auth-002`) from canonical base `4d9d6a3f5267b0a43f98d544cf6bbb46192c7ee2` as explicitly designated by the independent review.
- **Specific Remediations Resolved in `AUTH-002`**:
  1. **F001 (Authority Hierarchy)**: Restored the exact canonical 6-tier Authority Hierarchy from `AGENTS.md` §3 in §1.1 (eliminating fabricated ad-hoc lifecycle hierarchy).
  2. **F002 (Scoring Semantics)**: Replaced ambiguous validation/scoring text in §4.1 with a single deterministic contract requiring strict validation fail-closed on selection count mismatch ($\text{count} \ne N$), duplicate choices, and unknown option IDs, with exact partial-credit scoring.
  3. **F003 (Coverage & Taxonomy Reconciliation)**: Formally reconciled the official 15 Reading task families (Academic & General Training unified) with the 16 QAR item kinds in §3.3, explicitly documenting that official family R10 (Summary Completion) comprises two interaction variants: Text (OTR) and Box (Option-Pool Matching).
  4. **F004 (Test Allowlist Path Reconciliation)**: Formally reconciled the test allowlist paths in §5.2 to match the actual repository disk structure established in Stage 1 (`tests/qar-objective-matching-response.test.mjs` and `tests/qar-objective-text-response.test.mjs`).

### 1.4 Role Definition & Non-Authority Statement
> [!IMPORTANT]
> - This document is authored by the **Stage 2 W1 Authorization Manifest Author**.
> - The author is **NOT**: a W1 Implementer, an Independent Auditor, an activation recorder, a merge executor, or a Stage 2 package acceptor.
> - This document is an **AUTHORIZATION MANIFEST CANDIDATE ONLY**.
> - It does **NOT** authorize W1 implementation execution.
> - It does **NOT** activate W1 execution authority.
> - It does **NOT** modify runtime source code, test suites, or persistence schemas.
> - Candidate manifest alone cannot activate W1. Execution authority is activated **ONLY** after independent authorization audit acceptance, canonical manifest merge, and a subsequent canonical `AGENT_CONTEXT_AUTH_ACTIVATION_V1` transaction recorded in `docs/IMPLEMENTATION_STATUS.md`.

---

## 2. W0 Dependency Gate Verification

Under `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md` §10.1 and §10.2, Wave W1 depends strictly on Wave W0 (`W0-IELTS-ARCH-001`):

$$\text{W0-IELTS-ARCH-001} \longrightarrow \text{W1-IELTS-OBJ-001}$$

Fresh verification of canonical repository state confirms:

| Requirement | Canonical Evidence | Status |
|---|---|---|
| **W0 Wave ID** | `W0-IELTS-ARCH-001` | VERIFIED |
| **W0 Status** | `CANONICALLY_CLOSED` (`docs/IMPLEMENTATION_STATUS.md` §18) | VERIFIED |
| **W0 Implementation PR** | PR #97 (`https://github.com/NguyenDukKyeon/VocabMaster/pull/97`) | VERIFIED |
| **W0 Independent Audit** | Formal Review ID `4944347491` (`ACCEPT`) on PR #97 | VERIFIED |
| **W0 Canonical Merge SHA** | `44bd3f86ec151b0c9b797e5cba59ba77d57533e8` | VERIFIED |
| **W0 Post-Merge CI** | Run ID `31898576707` / #451 / attempt 1 / `push` / `SUCCESS` | VERIFIED |
| **W1 Dependency State** | W1 depends on W0 only; W0 is fully closed on canonical `main` | **SATISFIED** |

---

## 3. Canonical Product Scope and Official Task Family Coverage

### 3.1 Wave Mission
Achieve 100% official objective task-family coverage across Listening and Reading by implementing the missing objective primitives required by the accepted Stage 2 strategy:
1. `multiple-choice-multiple`: $N$-of-$M$ multi-select QAR primitive with deterministic scoring (GAP-02).
2. `summary-completion-box`: Option-pool matching primitive for summary blanks (GAP-03).
3. Unification of all 11 Listening and 15 Reading official objective task families under canonical QAR contracts.
4. Coherent tokenization, word-count limits, and case/whitespace normalization semantics across objective text responses.

### 3.2 Canonical GAPs Owned
- **GAP-02 (High Severity):** Objective MCQ Multiple Answer — missing multi-select QAR primitive with deterministic partial-credit scoring.
- **GAP-03 (Medium Severity):** Summary Completion with Box Options — missing option-pool summary matching primitive.

### 3.3 Official Task-Family Taxonomy & QAR Item-Kind Reconciliation

#### 3.3.1 Taxonomy Reconciliation Invariant
- **Official Task Families:** 11 Listening + 15 Reading = **26 Official Task Families** (Academic and General Training unified).
- **QAR Item Kinds:** 11 Listening + 16 Reading = **27 QAR Item Kinds**.
- **Reconciliation Note:** Official Reading Family 10 ("Summary Completion") encompasses two distinct interaction kinds in the QAR substrate:
  1. `reading-summary-completion` (OTR: free-text completion extracted from passage)
  2. `reading-summary-completion-box` (Option-pool matching from a given box)
  Both variants belong to official family 10, resulting in exactly 15 official Reading families and 16 distinct Reading item kinds.

#### 3.3.2 Listening Task Families (11 / 11 Official Families $\to$ 11 QAR Item Kinds)

| # | Official Task Family | Canonical QAR Kind | Execution Primitive | Scoring Primitive | Test Evidence | Substrate Status |
|---|---|---|---|---|---|---|
| L1 | **Multiple Choice (Single)** | `listening-multiple-choice` (v2) | `QuestionActivity` single-choice | `LISTENING_MULTIPLE_CHOICE_SCORER_VERSION` (v1) | `tests/qar-00-question-activity-contracts.test.mjs`, `tests/wave4-ielts-listening-mcq-v2.test.mjs` | REUSED (Stage 1 / Wave 4) |
| L2 | **Multiple Choice (Multiple)** | `listening-multiple-choice-multiple` (v1) | `QuestionActivity` multi-select | `OBJECTIVE_MULTI_SELECT_SCORER` ($N$-of-$M$ partial credit) | `tests/qar-00-question-activity-contracts.test.mjs` | **NEW in W1 (GAP-02)** |
| L3 | **Matching** | `listening-matching` (v1) | `ObjectiveMatchingResponse` | `OBJECTIVE_MATCHING_RESPONSE_SCORER` (v1) | `tests/qar-objective-matching-response.test.mjs`, `tests/wave4-ielts-listening-matching.test.mjs` | REUSED (Stage 1 / Wave 4) |
| L4 | **Plan, Map, Diagram Labelling** | `listening-plan-map-diagram-labelling` (v1) | `ObjectiveMatchingResponse` + Spatial | `OBJECTIVE_MATCHING_RESPONSE_SCORER` + Spatial | `tests/qar-objective-matching-response.test.mjs`, `tests/wave4-ielts-listening-spatial.test.mjs` | REUSED (Stage 1 / Wave 4) |
| L5 | **Form Completion** | `listening-form-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-listening-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| L6 | **Note Completion** | `listening-note-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-listening-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| L7 | **Table Completion** | `listening-table-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-listening-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| L8 | **Flow-Chart Completion** | `listening-flow-chart-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-listening-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| L9 | **Summary Completion** | `listening-summary-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-listening-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| L10 | **Sentence Completion** | `listening-sentence-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-listening-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| L11 | **Short-Answer Questions** | `listening-short-answer` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-listening-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |

#### 3.3.3 Reading Task Families (15 / 15 Official Families $\to$ 16 QAR Item Kinds)

| # | Official Task Family | Canonical QAR Kind | Execution Primitive | Scoring Primitive | Test Evidence | Substrate Status |
|---|---|---|---|---|---|---|
| R1 | **Multiple Choice (Single)** | `reading-multiple-choice-single` (v1) | `QuestionActivity` single-choice | `READING_SINGLE_SELECT_SCORER_VERSION` (v1) | `tests/qar-00-question-activity-contracts.test.mjs`, `tests/wave4-ielts-reading-single-select.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R2 | **Multiple Choice (Multiple)** | `reading-multiple-choice-multiple` (v1) | `QuestionActivity` multi-select | `OBJECTIVE_MULTI_SELECT_SCORER` ($N$-of-$M$ partial credit) | `tests/qar-00-question-activity-contracts.test.mjs` | **NEW in W1 (GAP-02)** |
| R3 | **Identifying Information (True/False/Not Given)** | `reading-true-false-not-given` (v1) | `QuestionActivity` single-choice (3-way) | `READING_SINGLE_SELECT_SCORER_VERSION` (v1) | `tests/qar-00-question-activity-contracts.test.mjs`, `tests/wave4-ielts-reading-single-select.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R4 | **Identifying Writer Views (Yes/No/Not Given)** | `reading-yes-no-not-given` (v1) | `QuestionActivity` single-choice (3-way) | `READING_SINGLE_SELECT_SCORER_VERSION` (v1) | `tests/qar-00-question-activity-contracts.test.mjs`, `tests/wave4-ielts-reading-single-select.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R5 | **Matching Information** | `reading-matching-information` (v1) | `ObjectiveMatchingResponse` | `OBJECTIVE_MATCHING_RESPONSE_SCORER` (v1) | `tests/qar-objective-matching-response.test.mjs`, `tests/wave4-ielts-reading-matching.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R6 | **Matching Headings** | `reading-matching-headings` (v1) | `ObjectiveMatchingResponse` (`SINGLE_USE`) | `OBJECTIVE_MATCHING_RESPONSE_SCORER` (v1) | `tests/qar-objective-matching-response.test.mjs`, `tests/wave4-ielts-reading-matching.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R7 | **Matching Features** | `reading-matching-features` (v1) | `ObjectiveMatchingResponse` (`ALLOW_REUSE`) | `OBJECTIVE_MATCHING_RESPONSE_SCORER` (v1) | `tests/qar-objective-matching-response.test.mjs`, `tests/wave4-ielts-reading-matching.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R8 | **Matching Sentence Endings** | `reading-matching-sentence-endings` (v1) | `ObjectiveMatchingResponse` (`SINGLE_USE`) | `OBJECTIVE_MATCHING_RESPONSE_SCORER` (v1) | `tests/qar-objective-matching-response.test.mjs`, `tests/wave4-ielts-reading-matching.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R9 | **Sentence Completion** | `reading-sentence-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-reading-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R10a | **Summary Completion (Text)** | `reading-summary-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-reading-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R10b | **Summary Completion (Box)** | `reading-summary-completion-box` (v1) | `ObjectiveMatchingResponse` (Option Pool) | `OBJECTIVE_MATCHING_RESPONSE_SCORER` (v1) | `tests/qar-objective-matching-response.test.mjs` | **NEW in W1 (GAP-03)** |
| R11 | **Note Completion** | `reading-note-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-reading-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R12 | **Table Completion** | `reading-table-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-reading-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R13 | **Flow-Chart Completion** | `reading-flow-chart-completion` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-reading-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R14 | **Diagram Label Completion** | `reading-diagram-label-completion` (v1) | `ObjectiveTextResponse` + Spatial | `OBJECTIVE_TEXT_RESPONSE_SCORER` + Spatial | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-reading-spatial.test.mjs` | REUSED (Stage 1 / Wave 4) |
| R15 | **Short-Answer Questions** | `reading-short-answer` (v1) | `ObjectiveTextResponse` (OTR) | `OBJECTIVE_TEXT_RESPONSE_SCORER` (v1) | `tests/qar-objective-text-response.test.mjs`, `tests/wave4-ielts-reading-objective-text.test.mjs` | REUSED (Stage 1 / Wave 4) |

### 3.4 Strict Out-of-Scope Ledger
The following capabilities are **STRICTLY OUT OF SCOPE** for Wave W1:
- **W2 (Listening Platform Completeness):** 4-part Listening runner, audio player synchronization, 1-play exam audio policy, section timers.
- **W3 (Reading Platform Completeness):** Academic 3-passage runner, GT 3-section runner, split-pane reading layout, 60-minute countdown timer, raw-to-band conversion curves.
- **W4 (Productive Writing Platform):** Academic Task 1 visual renderers, GT Task 1 letter templates, Task 2 essay platform, 4-dimension rubric feedback.
- **W5 (Productive Speaking Platform):** 3-part guided speaking simulation, audio recording/playback, Part 2 cue-card timer, rubric feedback.
- **W6 (Full Mock Orchestrator & Exit Gate):** Multi-skill mock coordinator (L $\to$ R $\to$ W $\to$ S), cumulative score reporting, reload checkpoint recovery.
- **Interstage & Global Scope:** Stages 3–8 research, global UX/IA redesign, AI provider changes, cloud backend services, new persistence engines, content authoring/scraping.

---

## 4. Scoring Semantics, Option Pools & Interaction Invariants

### 4.1 Multi-Select MCQ (`multiple-choice-multiple`) Semantics
1. **Selection Cardinality:** A question defines expected selection count $N$ (where $N \ge 2$) from a total of $M$ options (where $M > N$, e.g. 5 choices for pick-2, or 7 choices for pick-3).
2. **Declaration Invariants:** Exactly $N$ options in the sealed definition have `correct: true`.
3. **Response Validation & Normalization:**
   - Learner response must be an object with an array of unique option IDs: `{ optionIds: string[] }`.
   - Hostile, accessor-backed, or malformed submission payloads fail closed without getter execution.
   - If `optionIds.length !== N`: The submission is strictly invalid and fails validation with error code `QUESTION_ACTIVITY_RESPONSE_INVALID`.
   - Duplicate option IDs in `optionIds`: The submission is strictly invalid and fails validation with `QUESTION_ACTIVITY_RESPONSE_INVALID`.
   - Unknown option IDs (IDs not present in the sealed item's options): The submission fails validation with `QUESTION_ACTIVITY_RESPONSE_INVALID`.
   - Normalized submission sorts option IDs canonically to guarantee deterministic digests.
4. **Deterministic Scoring & Partial Credit:**
   - Evaluated against the sealed option set.
   - Let $K$ be the number of submitted option IDs that match `correct: true` options ($0 \le K \le N$).
   - $\text{numerator} = K$.
   - $\text{denominator} = N$.
   - $\text{rawScore} = \text{numerator} / \text{denominator}$.
   - **Score Disposition:**
     - $\text{numerator} = N \implies \text{disposition} = \text{"correct"}$
     - $0 < \text{numerator} < N \implies \text{disposition} = \text{"partial"}$
     - $\text{numerator} = 0 \implies \text{disposition} = \text{"wrong"}$
5. **Receipt / Metadata Binding:** Emits canonical `questionResult` metadata containing `{ normalizedResponse, disposition, numerator, denominator, rawScore, scorer: "OBJECTIVE_MULTI_SELECT_SCORER", keyDigest, reviewRequired: false, affectsSchedule: false }`.

### 4.2 Summary Box Completion (`summary-completion-box`) Semantics
1. **Option Pool Identity:** Defines a bounded set of box options: `{ id: string, label: string }[]`.
2. **Slot Identity:** Defines ordered blanks/slots in the summary text: `{ id: string, label: string }[]`.
3. **Reuse Policy:** Explicitly declared as either `SINGLE_USE` (each box option may fill at most one blank) or `ALLOW_REUSE` (options may be used across multiple blanks).
4. **Sealed Key Binding:** Each slot binds an `acceptedOptionId` in the sealed owner definition.
5. **Deterministic Comparison:**
   - Submission must provide exact ordered slots: `{ slots: [{ slotId: string, optionId: string | null }] }`.
   - Each slot is scored: $\text{optionId} = \text{acceptedOptionId} \implies \text{MATCH (correct)}$, $\text{optionId} = \text{null} \implies \text{EMPTY (wrong)}$, $\text{optionId} \ne \text{acceptedOptionId} \implies \text{MISMATCH (wrong)}$.
   - $\text{numerator} = \text{number of MATCH slots}$.
   - $\text{denominator} = \text{total number of slots}$.
   - $\text{rawScore} = \text{numerator} / \text{denominator}$.
   - $\text{disposition} = \text{numerator} === \text{denominator} \mathrel{?} \text{"correct"} : (\text{numerator} > 0 \mathrel{?} \text{"partial"} : \text{"wrong"})$.
6. **Rejection of Invalid Submissions:** Duplicate options submitted under `SINGLE_USE`, unknown option IDs, unknown slot IDs, or missing slots fail closed with `QUESTION_ACTIVITY_RESPONSE_INVALID`.

### 4.3 Answer Key Privacy Invariant (Strict Non-Negotiable)
$$\text{KEY\_LEAK\_BEFORE\_SUBMIT} = \mathbf{ZERO}$$
- Sealed answer keys (`correct: true`, `acceptedOptionId`, `acceptedAnswers`) MUST NOT exist in the public `item` projection returned by QAR adapters.
- Public question projections include only: `id`, `kind`, `prompt`, `options` (id and text/label only), `slots` (id, label, and wordLimit only; no accepted answers), `reusePolicy`, and `target`.
- Pre-submission DOM / ARIA rendering MUST NOT contain answer keys or clue attributes.
- Tests must explicitly assert `JSON.stringify(publicQuestion).includes(secretAnswer) === false`.

### 4.4 FSRS & Evidence Gateway Invariant
- QAR execution remains transient practice.
- All objective question activities emit canonical `Attempt` and `Receipt` envelopes into `TodayRunner` / `EventRepository`.
- All emitted evidence envelopes pass through `EvidencePolicy` (`src/evidence-policy.js`) and receive:
  $$\text{affectsSchedule} = \text{false}, \quad \text{evidenceEligible} = \text{false}$$
- Zero direct FSRS schedule mutation; zero scheduler bypass.

---

## 5. Exact Implementation Allowlist

Future W1 execution is strictly bounded to the following closed file sets. Writing to any file outside this allowlist is a protocol violation.

### 5.1 Source Allowlist (`SOURCE_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `src/question-activity-contracts.js` | Extend QAR registry, validation, execution, and coverage report for `multiple-choice-multiple` (GAP-02) and `summary-completion-box` (GAP-03); export constants and entries for all 26 task families and 27 item kinds. | EXTEND |
| `src/objective-matching-response.js` | Implement option-pool summary matching primitive `summary-completion-box` with `SINGLE_USE` / `ALLOW_REUSE` support and sealed key isolation. | EXTEND |
| `src/objective-text-response.js` | Ensure normalization, word-counting, and completion primitives remain coherent across all text response families. | EXTEND |
| `src/ielts-profile-inventory.js` | Extend inventory item validation to recognize multi-select MCQ and summary-completion-box question kinds under `IELTS_OBJECTIVE_SKILLS` and `IELTS_OBJECTIVE_PROFILES`. | EXTEND |

### 5.2 Test Allowlist (`TEST_ALLOWLIST`)

| File Path | Ownership Reason | Change Class |
|---|---|---|
| `tests/qar-00-question-activity-contracts.test.mjs` | Unit and integration tests for multi-select MCQ, QAR registry extensions, 26 task family / 27 item kind coverage report, and sealed key privacy. | EXTEND |
| `tests/qar-objective-matching-response.test.mjs` | Unit tests for `summary-completion-box` option-pool matching, slot bindings, reuse policies, and tamper-resistance. (Reconciled from Stage 1 disk layout). | EXTEND |
| `tests/qar-objective-text-response.test.mjs` | Unit tests for objective text normalization, word count enforcement, and completion item contracts. (Reconciled from Stage 1 disk layout). | EXTEND |

### 5.3 Fixture Allowlist (`FIXTURE_ALLOWLIST`)
NONE

### 5.4 Docs and Evidence Allowlist (`DOC_EVIDENCE_ALLOWLIST`)
NONE

*(The authorization manifest itself is a controlling read source, not an implementation writable file).*

---

## 6. RED / GREEN Execution Topology and Specification

Future W1 execution must follow a strict, two-commit RED $\to$ GREEN verification topology under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`:

```text
Canonical Base (4d9d6a3f5267b0a43f98d544cf6bbb46192c7ee2)
     │
     ▼
[COMMIT A: RED Tests Only] (Adds failing test assertions to TEST_ALLOWLIST; zero src/** edits)
     │
     ├─▶ Verified expected product failure predicates (Missing multi-select MCQ & summary box)
     ├─▶ Zero syntax / compile / fixture breakages
     │
     ▼
[COMMIT B: GREEN Implementation] (Edits allowed SOURCE_ALLOWLIST only; Commit A tests immutable)
     │
     ├─▶ 100% Unit, Integration, and Regression tests pass
     ├─▶ Zero answer key pre-submit leaks
     └─▶ Natural exact-head remote CI succeeds
```

### 6.1 Commit A — RED Test Contract and Expected Failure Predicates

Commit A modifies **ONLY** files in `TEST_ALLOWLIST`. It introduces genuine product-contract assertions proving that current canonical `main` runtime lacks multi-select MCQ and summary box primitives:

| Test Path | Predicate | Expected Failure |
|---|---|---|
| `tests/qar-00-question-activity-contracts.test.mjs` | Assert validation, execution, and deterministic scoring of `listening-multiple-choice-multiple` and `reading-multiple-choice-multiple` ($N$-of-$M$ choice with partial credit). | `QUESTION_ACTIVITY_UNSUPPORTED` or `valid === false` on multi-select MCQ kinds |
| `tests/qar-objective-matching-response.test.mjs` | Assert validation, option-pool matching, and deterministic scoring of `reading-summary-completion-box`. | `QUESTION_ACTIVITY_UNSUPPORTED` or `valid === false` on summary-completion-box |
| `tests/qar-00-question-activity-contracts.test.mjs` | Assert coverage report `getQuestionCoverageReport()` includes all 26 official task families / 27 item kinds without gaps in registered kinds. | Missing kind entries or incomplete coverage report count |
| `tests/qar-00-question-activity-contracts.test.mjs` | Assert sealed answer key privacy pre-submit (`KEY_LEAK_BEFORE_SUBMIT === 0`). | Public item projection lacks multi-select / box summary key stripping |

### 6.2 RED Immutability Rule
Once Commit A is committed and verified under natural CI, all Commit A test blobs are **PERMANENTLY IMMUTABLE**. Commit B must not modify, weaken, delete, or skip any test introduced in Commit A.

### 6.3 Commit B — GREEN Implementation Contract

Commit B modifies **ONLY** files in `SOURCE_ALLOWLIST`. It satisfies the failing tests with minimal correct implementation:
1. Multi-select MCQ primitive `multiple-choice-multiple` is fully functional with $N$-of-$M$ selection and partial-credit scoring.
2. Summary-completion-box primitive `summary-completion-box` is fully functional with option-pool matching and declared reuse policies (`SINGLE_USE`, `ALLOW_REUSE`).
3. Deterministic scoring produces exact raw score, numerator, denominator, and disposition across all objective families.
4. Invalid selections (unknown option IDs, duplicate choices, selection count mismatches, single-use violations) fail closed safely.
5. All 26 official task-family mappings / 27 item kinds validate, execute, score, and emit canonical receipts under QAR contracts.
6. Sealed answer keys are 100% private pre-submission (zero leak in DOM, ARIA, or public projections).
7. Legacy objective question families remain 100% backward compatible.
8. Zero persistence/schema changes (no IndexedDB version bump, no new store, no migration).
9. Zero new runtime dependencies (`package.json` and `package-lock.json` are unchanged).
10. Zero FSRS authority expansion (default-deny evidence policy preserved).

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
\textbf{8. ACTIVATION MERGE SHA BECOMES EXACT W1 IMPLEMENTATION PREDECESSOR} \\
\downarrow \\
\textbf{9. ONLY THEN W1 IMPLEMENTATION MAY START}
\end{matrix}$$

### 7.2 Non-Equivalence Invariants
- $\text{MERGED MANIFEST} \neq \text{EXECUTION AUTHORITY}$
- $\text{INDEPENDENT AUTHORIZATION ACCEPT} \neq \text{EFFECTIVE IMPLEMENTATION PREDECESSOR}$
- Wave W1 remains fail-closed and unexecutable until canonical V1 activation is merged.

### 7.3 Future Activation Record Contract
A separate activation transaction must add exactly one canonical record to `docs/IMPLEMENTATION_STATUS.md` matching this exact schema:

```markdown
## AGENT_CONTEXT_AUTH_ACTIVATION_V1 — W1-IELTS-OBJ-001

| Field | Value |
|---|---|
| `Activation Schema` | `AGENT_CONTEXT_AUTH_ACTIVATION_V1` |
| `Transaction ID` | `W1-IELTS-OBJ-001` |
| `Authorization Manifest` | `docs/authorizations/STAGE2-W1-IELTS-OBJ-AUTH-002.md` |
| `Authorization Manifest Identity` | `STAGE2-W1-IELTS-OBJ-AUTH-002` |
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
- **New Stores:** `NONE`
- **Database Version Change:** `NONE` (stays at `IELTS_DB_VERSION = 4`)
- **Migration Ledger Change:** `NONE`
- **Backup Schema Change:** `NONE` (stays at full backup schema v6)
- **Rationale:** QAR question execution is transient. Inventory items continue to use the durable `objectiveInventory` object store established in Phase 4 / Wave 4.

### 8.2 Rollback Strategy
Because W1 introduces additive registry and runtime scoring logic without database schema mutations, rollback is purely code-level:
- Reverting W1 source changes removes multi-select MCQ and summary box executors from the QAR registry.
- Unknown or future QAR question kinds fail closed safely under older readers with `QUESTION_ACTIVITY_UNSUPPORTED`.
- Learner test history and existing inventory items remain intact.

---

## 9. Verification Commands and CI Profile

Future W1 execution must run the following focused and repository regression gates:

### 9.1 Local Verification Commands

```bash
# Focused W1 test suite
node --test tests/qar-00-question-activity-contracts.test.mjs
node --test tests/qar-objective-matching-response.test.mjs
node --test tests/qar-objective-text-response.test.mjs

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

The future W1 executor and auditor must immediately halt execution if any of the following occur:

1. **`CANONICAL_BASE_DRIFT`**: Base commit diverges from expected canonical `origin/main` commit.
2. **`PREDECESSOR_MISMATCH`**: Commit parent chain does not bind the exact authorized predecessor.
3. **`W0_DEPENDENCY_NOT_SATISFIED`**: Canonical W0 closure evidence is missing or contested.
4. **`W1_SOURCE_SCOPE_UNRESOLVED`**: Required source modification touches files outside `SOURCE_ALLOWLIST`.
5. **`W1_TEST_SCOPE_UNRESOLVED`**: Required test modification touches files outside `TEST_ALLOWLIST`.
6. **`W1_MULTI_SELECT_SCORING_SEMANTICS_UNDERDEFINED`**: Multi-select scoring algorithm or partial credit contract is ambiguous.
7. **`W1_SUMMARY_BOX_SEMANTICS_UNDERDEFINED`**: Option pool matching or reuse policy is underdefined.
8. **`W1_OBJECTIVE_COVERAGE_INCOMPLETE`**: Any of the 26 official task families is unmapped or lacks QAR execution/scoring support.
9. **`KEY_LEAK_BEFORE_SUBMIT`**: Sealed answer keys leak into public question projections, DOM, or ARIA pre-submission.
10. **`NON_DETERMINISTIC_SCORING`**: Same response and question produce different score receipts across repeated runs.
11. **`W1_PERSISTENCE_SCOPE_CONTRADICTION`**: Implementation attempts to modify IndexedDB version or create new stores.
12. **`W1_EVIDENCE_AUTHORITY_EXPANSION_REQUIRED`**: Implementation attempts direct FSRS mutation or schedule bypass.
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

### 11.1 W1 Implementation Merge Authority
$$\text{W1\_IMPLEMENTATION\_MERGE\_AUTHORITY} = \mathbf{NOT\_GRANTED}$$
A future implementation auditor may NOT merge W1 implementation code unless explicit merge authority is separately granted by controlling Owner authority.

### 11.2 Authorization Manifest PR Merge Authority
Conditional mechanical merge authority for **THIS DOCS-ONLY AUTHORIZATION PR** is granted to its future Independent Authorization Auditor **ONLY IF** all of the following conditions are verified:
1. Fresh independent audit verdict = `ACCEPT`;
2. Formal `ACCEPT` verdict is persisted to PR and read back;
3. Exact candidate head SHA remains unchanged;
4. Base commit remains `4d9d6a3f5267b0a43f98d544cf6bbb46192c7ee2`;
5. Natural exact-head PR CI run concludes `SUCCESS` (attempt 1);
6. Exactly ONE changed path: `docs/authorizations/STAGE2-W1-IELTS-OBJ-AUTH-002.md`;
7. Substantive findings = `NONE`;
8. PR is cleanly mergeable without conflicts.

**Merge Method:** Normal Merge Commit (no squash, no rebase).  
Post-merge push CI must be verified on canonical `main` by the auditor. This merge does NOT activate W1 implementation authority.
