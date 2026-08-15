# VocabMaster — Stage 2 IELTS Completeness Strategy

Status: **CANDIDATE / NOT AUTHORIZED**  
Authority: **STAGE 2 PRODUCT AND TECHNICAL STRATEGY RECONCILIATION**  
Transaction ID: `STAGE2-IELTS-STRATEGY-001`  
Date: 2026-08-15  
Canonical Predecessor: `2d241c9690e0b56968add4d071aae1c62a698e0c` (Merge PR #86 / `MASTER-ROADMAP-CANON-001`)

---

## 1. Executive summary and authority

### 1.1 Context
- **Stage 1 (Core Foundation)** is independently `ACCEPTED` and `COMPLETE`.
- **Stage 1.5 (Adversarial Product Jury)** is independently `ACCEPTED` and `COMPLETE` (retained findings reconciled, interstage gate passed).
- **Master Product Roadmap (Stage 1–8)** is independently `ACCEPTED`, canonicalized in `docs/MASTER_ROADMAP.md` via ADR-049, and ratified by the Owner.
- **Stage 2 (IELTS Completeness)** is the current `NEXT` Stage.
- **Implementation Authority:** `NOT AUTHORIZED`.

### 1.2 Mission
This strategy document executes a complete fresh-reconciliation between:
1. The **current VocabMaster repository state** on canonical `main` (contracts, runtime, QAR substrate, persistence, backup/restore, tests, and UI); and
2. The **Owner-ratified Stage 2 requirement**: **Option B — Full IELTS Platform** (`IELTS Academic` + `IELTS General Training` across `Listening`, `Reading`, `Writing`, and `Speaking`).

### 1.3 Explicit Non-Authority Statement
> [!IMPORTANT]
> This document is a **STRATEGY CANDIDATE ONLY**.
> - It does **NOT** authorize Stage 2 implementation.
> - It does **NOT** authorize any Wave (including Wave W0).
> - It does **NOT** authorize any code, test, schema migration, or package creation.
> - It does **NOT** grant package or strategy acceptance.
> Implementation of any Wave requires a separately authored, independently reviewed, and Owner-ratified Wave Authorization Manifest under `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` (ADR-046).

---

## 2. Owner-ratified requirement: Full IELTS Platform

The Owner has explicitly ratified **Option B — Full IELTS Platform**:

$$\text{FULL IELTS PLATFORM} = \text{IELTS ACADEMIC} + \text{IELTS GENERAL TRAINING}$$

### 2.1 Supported Skills Scope
- **Listening:** 4 parts, 40 items (shared format across Academic and General Training).
- **Reading:** 3 sections/parts, 40 items:
  - *Academic Reading:* 3 long, complex academic/scholarly texts from books, journals, magazines, and newspapers.
  - *General Training Reading:* 3 sections of increasing difficulty (Section 1: 2–3 short everyday survival/social texts; Section 2: 2 work-related/workplace texts; Section 3: 1 longer general interest text).
- **Writing:** 2 tasks, 60 minutes:
  - *Academic Writing:* Task 1 (visual information report: graph, chart, table, map, process diagram; $\ge 150$ words) + Task 2 (academic essay; $\ge 250$ words).
  - *General Training Writing:* Task 1 (letter response in formal, semi-formal, or personal/informal register; $\ge 150$ words) + Task 2 (general essay; $\ge 250$ words).
- **Speaking:** 3 parts, 11–14 minutes (shared format across Academic and General Training):
  - *Part 1:* Introduction and interview (familiar topics).
  - *Part 2:* Individual long turn / Cue card (1 min prep, notes, up to 2 min speaking, rounding questions).
  - *Part 3:* Two-way discussion (thematic, abstract, analytical extension of Part 2).

### 2.2 Explicit Out-of-Scope Ledger
Unless separately authorized by an explicit Owner decision record, the following are **OUT OF SCOPE** for Stage 2:
- IELTS Life Skills (A1/A2/B1 speaking/listening tests for UK visas);
- Test booking, identity verification, candidate biometric authentication, fee payment;
- Live test-centre administration, invigilator workflows, remote proctoring;
- UKVI administrative and security compliance workflows;
- Mimicking paper-based answer sheet layout purely for paper cosmetics;
- Reproducing copyrighted, proprietary official IELTS test banks.

Stage 2 builds a **learning and practice platform** that faithfully preserves official test task semantics, interaction models, scoring rules, and rubric criteria without duplicating test-centre administration.

---

## 3. Official IELTS format primary source ledger

All format research in this strategy was conducted against authoritative primary sources.

| Source Authority | Primary URL / Reference | Access Date | Test Type / Skill | Supported Canonical Claims |
|---|---|---|---|---|
| **IELTS.org (Official)** | `https://www.ielts.org/about-ielts/test-format-in-detail` | 2026-08-15 | All Skills (AC & GT) | 4-skill structure, timings, question counts, section ordering, delivery format. |
| **IELTS.org (Listening)** | `https://www.ielts.org/for-test-takers/test-format#listening` | 2026-08-15 | Listening (Shared) | 4 parts, 40 questions, ~30 mins. 10 questions per part. Monologues and conversations in social/educational contexts. |
| **IELTS.org (Academic Reading)** | `https://www.ielts.org/for-test-takers/test-format#reading-academic` | 2026-08-15 | Academic Reading | 3 sections, 40 questions, 60 mins. Texts from books, journals, magazines, newspapers (2,150–2,750 total words). |
| **IELTS.org (GT Reading)** | `https://www.ielts.org/for-test-takers/test-format#reading-general-training` | 2026-08-15 | GT Reading | 3 sections, 40 questions, 60 mins. Section 1 (everyday life/notices), Section 2 (workplace/job training), Section 3 (general interest text). |
| **IELTS.org (Academic Writing)** | `https://www.ielts.org/for-test-takers/test-format#writing-academic` | 2026-08-15 | Academic Writing | Task 1 (visual info summary, $\ge 150$ words, ~20 mins); Task 2 (formal essay, $\ge 250$ words, ~40 mins). |
| **IELTS.org (GT Writing)** | `https://www.ielts.org/for-test-takers/test-format#writing-general-training` | 2026-08-15 | GT Writing | Task 1 (letter with 3 bullet prompts in formal/semi-formal/informal style, $\ge 150$ words, ~20 mins); Task 2 (essay, $\ge 250$ words, ~40 mins). |
| **IELTS.org (Speaking)** | `https://www.ielts.org/for-test-takers/test-format#speaking` | 2026-08-15 | Speaking (Shared) | 3 parts, 11–14 mins. Part 1 (4–5 mins), Part 2 (3–4 mins with 1 min prep), Part 3 (4–5 mins). |
| **British Council & IDP** | `https://takeielts.britishcouncil.org` / `https://ielts.idp.com` | 2026-08-15 | Scoring & Assessment | Public Band Descriptors: Writing (Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy); Speaking (Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation). |

---

## 4. Current IELTS inventory and repository audit

A fresh technical audit of the canonical `main` codebase was conducted across contracts, runtime, persistence, UI, and test suites:

### 4.1 UI and Surface Audit
- `src/app.js` & `src/primary-ia-v10.js`: Exposes top-level navigation `Hôm nay · Thu thập · Kho từ · IELTS · Tiến bộ`.
- `src/ielts-hub-v2.js`: Mounts modern IELTS Hub dialog with 3 tabs: `Khám phá bài học` (browse/install signed content packs), `Video của tôi` (paste YouTube/cached video loop), `Lỗi & kỹ năng` (Error Notebook, Lexical Sets, Reading, Paraphrase).
- `src/ielts-lab.js`: Legacy container with micro-practice tabs (`overview`, `errors`, `lexical`, `paraphrase`, `reading`, `writing`, `media`, `listening-proof`).
- **Surface Gaps:**
  - No user-facing **Academic vs General Training** track switcher.
  - No **Full Mock Exam** launcher or dedicated test session screen.
  - No **Section Practice** launcher.
  - No 3-part guided **Speaking** session UI.

### 4.2 Objective Question Substrate (QAR & Inventory)
- `src/question-activity-contracts.js`: Defines canonical `QuestionActivity` schema v1/v2, question validation, execution, and deterministic scoring.
- `src/objective-text-response.js`: Implements single/multi-slot string completion with word limits, normalization (`normalizeObjectiveTextResponse`), word counting (`countObjectiveTextWords`), and sealed answer verification.
- `src/objective-matching-response.js`: Implements slot-to-option matching with `SINGLE_USE` vs `ALLOW_REUSE` policies and spatial anchor support.
- `src/objective-spatial-prompt.js`: Implements SVG spatial prompts (lines, rects, polylines, text, anchor markers) for plan, map, and diagram labeling.
- `src/ielts-profile-inventory.js`: Implements immutable `ielts-objective-inventory-item` schema v1 with profile binding (`academic`, `general-training`), skill binding (`reading`, `listening`), rights, provenance, and human review verification.
- `src/ielts-listening-question-activity.js` & `src/ielts-reading-question-activity.js`: Provide durable owner adapters connecting inventory to QAR runtime without leaking answer keys to client DOM.
- **Kernel Substrate Gaps:**
  - Objective MCQ Multiple Answer (pick $N$ options from $M$) is currently missing in the QAR registry.
  - Summary completion with a box of pre-defined options is currently modeled only as free-text OTR rather than option-pool matching.

### 4.3 Productive Writing and Speaking Substrate
- `src/productive-text-contracts.js` & `src/productive-writing-ui.js`: Implements `learner-text-artifact` and `learner-text-artifact-revision` with autosave, word count, immutable text digests, and learner self-review criteria. However, it currently supports only a single controlled paragraph prompt (`controlled-writing-self-review`).
- `src/ielts-domain.js`: Contains legacy media dictation, shadowing, and retell structures. Under Phase 0 ADR-030, these are strictly `coaching-only` and fail closed on FSRS schedule mutation.
- **Productive Gaps:**
  - Academic Writing Task 1 visual renderers (line graph, bar chart, pie chart, table, process diagram, map) and prompt schemas are missing.
  - General Training Writing Task 1 letter prompt schemas (formal, semi-formal, informal with 3 bullet prompts) are missing.
  - Academic & GT Writing Task 2 essay prompt schemas are missing.
  - Rubric-aligned Writing evaluation (4 official criteria) with honest practice feedback labeling is missing.
  - 3-part Speaking interview/cue-card/discussion flow with audio capture and rubric feedback is missing.

### 4.4 Assessment and Diagnostic Substrate
- `src/frozen-assessment-contracts.js` & `src/frozen-assessment-runtime.js`: Implements immutable `frozen-assessment-blueprint` and `frozen-assessment-run` with atomic completion, zero-FSRS impact (`affectsSchedule: false`, `evidenceEligible: false`), and tamper-proof scoring.
- `src/targeted-diagnostic.js`: Assembles diagnostic assessments from observed weak skills in `WeaknessProfile`.
- **Assessment Gaps:**
  - Multi-section timed test session coordinator is missing.
  - Partial run recovery / autosave contract during full mock tests remains ununified across UI and storage (S15-F005).

### 4.5 Persistence, Backup, and Storage Safety
- `src/ielts-persistence.js`: Manages IndexedDB stores: `errorRecords`, `lexicalSets`, `lexicalRelations`, `labItems`, `readingPassages`, `readingAttempts`, `mediaSources`, `transcriptionJobs`, `transcriptSegments`, `mediaAttempts`, `mediaProgress`, `settings`, `objectiveInventory`, `learnerArtifacts`, `frozenAssessments`.
- `src/backup-registry.js` & `src/ielts-backup.js`: 100% durable stores registered in canonical full backup schema v2 with SHA-256 digests and safe restore protocols (ADR-031, ADR-032).

---

## 5. Complete official IELTS coverage matrix

The following matrix maps every official task family across IELTS Academic and IELTS General Training to its current repository status and proposed Stage 2 owning Wave.

### 5.1 Classification Vocabulary
- `COMPLETE`: Fully supported with verified contracts, runtime execution, deterministic scoring/evaluation, persistence, review, and automated acceptance evidence.
- `PARTIAL`: Core substrate or schema exists, but end-to-end learner journey, UI, or complete task variants are missing.
- `MISSING`: No runtime implementation or contract exists in the repository.
- `MISLEADING`: UI or mock presence exists that masquerades as functionality without actual authentic execution or evaluation.
- `BLOCKED_BY_OWNER_DECISION`: Requires an explicit Owner product/policy decision before execution.
- `BLOCKED_BY_TECHNICAL_UNKNOWN`: Requires resolved technical investigation.
- `NOT_APPLICABLE`: Out of authorized scope.

### 5.2 Listening Coverage Matrix (Shared Academic & General Training)

| Test Type | Skill | Section / Part | Official Task Family | Official Semantics | Current Surface | Current Runtime Support | Current Scoring Support | Current Persistence | Current Review Support | Current Evidence/Progress | Current Browser Acceptance | Classification | Gap | Proposed Wave | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AC & GT | Listening | Part 1–4 | Multiple Choice (Single) | Select 1 option from 3–4 choices based on audio | IELTS Lab / Proof | `LISTENING_MULTIPLE_CHOICE_KIND` v2 | Deterministic QAR single choice | `objectiveInventory` & `todayRuns` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 / QAR | **COMPLETE** | None for single item; needs multi-part test runner | W1 / W2 | `tests/qar-00-question-activity-contracts.test.mjs`, `tests/wave4-ielts-listening-mcq-v2.test.mjs` |
| AC & GT | Listening | Part 1–4 | Multiple Choice (Multiple) | Select $N$ correct options from $M$ choices (e.g. pick 2 from 5) | None | None | None | `objectiveInventory` schema only | None | Denied | None | **MISSING** | Missing multi-select QAR kind and scoring | W1 | `src/objective-matching-response.js` (matching only) |
| AC & GT | Listening | Part 1–4 | Matching | Match numbered items to a set of options from audio | Proof UI | `listening-matching` via QAR | Deterministic slot-to-option matching | `objectiveInventory` | Error Notebook candidate | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Needs 4-part audio test integration | W1 / W2 | `tests/wave4-ielts-listening-matching.test.mjs` |
| AC & GT | Listening | Part 2 / 3 | Plan, Map, Diagram Labelling | Match labels/letters to spatial visual anchors based on audio directions | Proof UI | `listening-plan-map-diagram-labelling` | Deterministic spatial anchor matching | `objectiveInventory` | Error Notebook candidate | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Needs full test audio integration | W1 / W2 | `tests/wave4-ielts-listening-spatial.test.mjs` |
| AC & GT | Listening | Part 1 | Form Completion | Fill in missing factual details (names, dates, numbers) with word/number limit | None | `listening-form-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook candidate | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs practice UI & audio runner | W1 / W2 | `tests/wave4-ielts-listening-objective-text.test.mjs` |
| AC & GT | Listening | Part 1–4 | Note Completion | Complete bulleted or structured notes with exact words/numbers from audio | None | `listening-note-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook candidate | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs practice UI & audio runner | W1 / W2 | `tests/wave4-ielts-listening-objective-text.test.mjs` |
| AC & GT | Listening | Part 1–4 | Table Completion | Fill cells in a structured table following column/row criteria and word limit | None | `listening-table-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook candidate | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs table visual layout in UI | W1 / W2 | `tests/wave4-ielts-listening-objective-text.test.mjs` |
| AC & GT | Listening | Part 1–4 | Flow-Chart Completion | Complete stages in a process sequence with word limits from audio | None | `listening-flow-chart-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook candidate | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs flow-chart UI layout | W1 / W2 | `tests/wave4-ielts-listening-objective-text.test.mjs` |
| AC & GT | Listening | Part 3 / 4 | Summary Completion | Complete a prose summary of a section of audio with word limits | None | `listening-summary-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook candidate | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs full test runner | W1 / W2 | `tests/wave4-ielts-listening-objective-text.test.mjs` |
| AC & GT | Listening | Part 1–4 | Sentence Completion | Complete sentences by filling gaps with exact words/numbers from audio | None | `listening-sentence-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook candidate | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs full test runner | W1 / W2 | `tests/wave4-ielts-listening-objective-text.test.mjs` |
| AC & GT | Listening | Part 1–4 | Short-Answer Questions | Answer direct questions using factual information from audio within word limit | None | `listening-short-answer` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook candidate | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs full test runner | W1 / W2 | `tests/wave4-ielts-listening-objective-text.test.mjs` |

### 5.3 Academic Reading Coverage Matrix

| Test Type | Skill | Section | Official Task Family | Official Semantics | Current Surface | Current Runtime Support | Current Scoring Support | Current Persistence | Current Review Support | Current Evidence/Progress | Current Browser Acceptance | Classification | Gap | Proposed Wave | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Academic | Reading | Passages 1–3 | Multiple Choice (Single) | Select 1 answer from 4 options based on academic passage | IELTS Lab / Hub | `reading-multiple-choice-single` | Deterministic single select | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs 3-passage test runner | W1 / W3 | `tests/wave4-ielts-reading-single-select.test.mjs` |
| Academic | Reading | Passages 1–3 | Multiple Choice (Multiple) | Select $N$ answers from $M$ options based on passage | None | None | None | Schema only | None | Denied | None | **MISSING** | Missing multi-select QAR kind | W1 | `src/question-activity-contracts.js` |
| Academic | Reading | Passages 1–3 | Identifying Information (True / False / Not Given) | Assess whether statements agree with factual information in passage | IELTS Lab / Hub | `reading-true-false-not-given` | Deterministic 3-way evaluation | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs test runner | W1 / W3 | `tests/wave4-ielts-reading-single-select.test.mjs` |
| Academic | Reading | Passages 1–3 | Identifying Writer Views (Yes / No / Not Given) | Assess whether statements agree with writer's claims/opinions | IELTS Lab / Hub | `reading-yes-no-not-given` | Deterministic 3-way evaluation | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs test runner | W1 / W3 | `tests/wave4-ielts-reading-single-select.test.mjs` |
| Academic | Reading | Passages 1–3 | Matching Information | Match statements to specific paragraphs/sections containing that info | IELTS Lab / Hub | `reading-matching-information` | Deterministic slot-to-paragraph matching | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs split-pane passage viewer | W1 / W3 | `tests/wave4-ielts-reading-matching.test.mjs` |
| Academic | Reading | Passages 1–3 | Matching Headings | Match paragraphs to a list of roman-numeral headings | IELTS Lab / Hub | `reading-matching-headings` | Deterministic matching (`SINGLE_USE`) | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs split-pane passage viewer | W1 / W3 | `tests/wave4-ielts-reading-matching.test.mjs` |
| Academic | Reading | Passages 1–3 | Matching Features | Match statements to a group of features (e.g. people, theories, dates) | IELTS Lab / Hub | `reading-matching-features` | Deterministic matching (`ALLOW_REUSE`) | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs split-pane passage viewer | W1 / W3 | `tests/wave4-ielts-reading-matching.test.mjs` |
| Academic | Reading | Passages 1–3 | Matching Sentence Endings | Match sentence beginnings to correct sentence endings based on text | IELTS Lab / Hub | `reading-matching-sentence-endings` | Deterministic matching (`SINGLE_USE`) | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs split-pane passage viewer | W1 / W3 | `tests/wave4-ielts-reading-matching.test.mjs` |
| Academic | Reading | Passages 1–3 | Sentence Completion | Fill gaps in sentences using exact words from passage within word limit | IELTS Lab / Hub | `reading-sentence-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs test runner | W1 / W3 | `tests/wave4-ielts-reading-objective-text.test.mjs` |
| Academic | Reading | Passages 1–3 | Summary Completion (Text) | Complete prose summary with words extracted from passage | IELTS Lab / Hub | `reading-summary-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs test runner | W1 / W3 | `tests/wave4-ielts-reading-objective-text.test.mjs` |
| Academic | Reading | Passages 1–3 | Summary Completion (Box) | Complete prose summary by choosing words/phrases from a given box | None | None | None | Schema only | None | Denied | None | **MISSING** | Missing option-pool summary matching primitive | W1 | `src/objective-matching-response.js` |
| Academic | Reading | Passages 1–3 | Note Completion | Fill in structured notes with exact words from passage | IELTS Lab / Hub | `reading-note-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs test runner | W1 / W3 | `tests/wave4-ielts-reading-objective-text.test.mjs` |
| Academic | Reading | Passages 1–3 | Table Completion | Fill table cells with exact words from passage within word limit | IELTS Lab / Hub | `reading-table-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs table layout | W1 / W3 | `tests/wave4-ielts-reading-objective-text.test.mjs` |
| Academic | Reading | Passages 1–3 | Flow-Chart Completion | Fill process steps with exact words from passage within word limit | IELTS Lab / Hub | `reading-flow-chart-completion` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs flow-chart layout | W1 / W3 | `tests/wave4-ielts-reading-objective-text.test.mjs` |
| Academic | Reading | Passages 1–3 | Diagram Label Completion | Complete labels on a technical/process diagram based on passage description | IELTS Lab / Hub | `reading-diagram-label-completion` | Deterministic spatial text matching | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs spatial rendering in test runner | W1 / W3 | `tests/wave4-ielts-reading-spatial.test.mjs` |
| Academic | Reading | Passages 1–3 | Short-Answer Questions | Answer direct questions using words from passage within word limit | IELTS Lab / Hub | `reading-short-answer` (OTR) | Deterministic normalized text matching | `objectiveInventory` | Error Notebook & Feedback | Default-deny Attempt / Receipt | Tested in Wave 4 | **COMPLETE** | Substrate complete; needs test runner | W1 / W3 | `tests/wave4-ielts-reading-objective-text.test.mjs` |

### 5.4 General Training Reading Coverage Matrix

| Test Type | Skill | Section | Official Task Family | Official Semantics | Current Surface | Current Runtime Support | Current Scoring Support | Current Persistence | Current Review Support | Current Evidence/Progress | Current Browser Acceptance | Classification | Gap | Proposed Wave | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| General Training | Reading | Section 1–3 | All Objective Question Families (MCQ, TFNG, YNNG, Matching, Completion, Short Answer) | Reuses the same 15 objective question families as Academic Reading, applied to social survival notices (Sec 1), workplace texts (Sec 2), and general articles (Sec 3) | None | QAR objective primitives shared with Academic | Shared QAR scoring | `objectiveInventory` (supports `profiles: ['general-training']`) | Error Notebook candidate | Default-deny Attempt / Receipt | Objective primitives tested; GT test assembly untested | **PARTIAL** | Missing GT 3-section source structure and GT raw-to-band conversion table | W1 / W3 | `src/ielts-profile-inventory.js`, `tests/wave4-ielts-profile-inventory.test.mjs` |

### 5.5 Academic Writing Coverage Matrix

| Test Type | Skill | Task | Official Task Family | Official Semantics | Current Surface | Current Runtime Support | Current Scoring Support | Current Persistence | Current Review Support | Current Evidence/Progress | Current Browser Acceptance | Classification | Gap | Proposed Wave | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Academic | Writing | Task 1 | Visual: Line Graph | Describe trends and changes over time ($\ge 150$ words, ~20 mins) | None | None | None | None | None | None | None | **MISSING** | Missing line graph renderer, prompt schema, word counter, rubric feedback | W4 | `src/productive-text-contracts.js` (paragraph only) |
| Academic | Writing | Task 1 | Visual: Bar Chart | Compare categories, proportions, and discrete metrics ($\ge 150$ words) | None | None | None | None | None | None | None | **MISSING** | Missing bar chart renderer, prompt schema, rubric feedback | W4 | `src/productive-text-contracts.js` |
| Academic | Writing | Task 1 | Visual: Pie Chart | Analyze percentage/proportion distribution across sectors ($\ge 150$ words) | None | None | None | None | None | None | None | **MISSING** | Missing pie chart renderer, prompt schema, rubric feedback | W4 | `src/productive-text-contracts.js` |
| Academic | Writing | Task 1 | Visual: Table | Extract key data points, compare rows/columns ($\ge 150$ words) | None | None | None | None | None | None | None | **MISSING** | Missing structured table visual, prompt schema, rubric feedback | W4 | `src/productive-text-contracts.js` |
| Academic | Writing | Task 1 | Visual: Process Diagram | Explain stages of a natural cycle or manufacturing process ($\ge 150$ words) | None | None | None | None | None | None | None | **MISSING** | Missing SVG process diagram visual, prompt schema, rubric feedback | W4 | `src/productive-text-contracts.js` |
| Academic | Writing | Task 1 | Visual: Map / Plan | Compare past/present/future layout of an area/building ($\ge 150$ words) | None | None | None | None | None | None | None | **MISSING** | Missing SVG dual-map visual, prompt schema, rubric feedback | W4 | `src/productive-text-contracts.js` |
| Academic | Writing | Task 1 | Visual: Mixed Graphics | Synthesize data from 2 different visuals (e.g. chart + table) ($\ge 150$ words) | None | None | None | None | None | None | None | **MISSING** | Missing multi-visual prompt container, rubric feedback | W4 | `src/productive-text-contracts.js` |
| Academic | Writing | Task 2 | Essay: Agree / Disagree | Present and justify opinion on a given thesis ($\ge 250$ words, ~40 mins) | Productive Writing UI | `learner-text-artifact` (single paragraph only) | Learner self-review only | `learnerArtifacts` in IndexedDB | Revision history | Default-deny Attempt / Receipt | Controlled single paragraph tested in Wave 4 | **PARTIAL** | Missing full essay prompt schemas, Task 2 rubric evaluation, 40-min timer | W4 | `tests/wave4-productive-practice.test.mjs` |
| Academic | Writing | Task 2 | Essay: Discuss Both Views | Analyze two perspectives and state reasoned position ($\ge 250$ words) | Productive Writing UI | Single paragraph only | Learner self-review only | `learnerArtifacts` | Revision history | Default-deny | Single paragraph tested | **PARTIAL** | Missing essay prompts & rubric evaluation | W4 | `src/productive-text-contracts.js` |
| Academic | Writing | Task 2 | Essay: Advantages / Disadvantages | Weigh pros and cons with clear conclusion ($\ge 250$ words) | Productive Writing UI | Single paragraph only | Learner self-review only | `learnerArtifacts` | Revision history | Default-deny | Single paragraph tested | **PARTIAL** | Missing essay prompts & rubric evaluation | W4 | `src/productive-text-contracts.js` |
| Academic | Writing | Task 2 | Essay: Problem & Solution | Analyze causes and propose actionable solutions ($\ge 250$ words) | Productive Writing UI | Single paragraph only | Learner self-review only | `learnerArtifacts` | Revision history | Default-deny | Single paragraph tested | **PARTIAL** | Missing essay prompts & rubric evaluation | W4 | `src/productive-text-contracts.js` |
| Academic | Writing | Task 2 | Essay: Direct / Two-Part Questions | Answer two interconnected thematic prompt questions ($\ge 250$ words) | Productive Writing UI | Single paragraph only | Learner self-review only | `learnerArtifacts` | Revision history | Default-deny | Single paragraph tested | **PARTIAL** | Missing essay prompts & rubric evaluation | W4 | `src/productive-text-contracts.js` |

### 5.6 General Training Writing Coverage Matrix

| Test Type | Skill | Task | Official Task Family | Official Semantics | Current Surface | Current Runtime Support | Current Scoring Support | Current Persistence | Current Review Support | Current Evidence/Progress | Current Browser Acceptance | Classification | Gap | Proposed Wave | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| General Training | Writing | Task 1 | Letter: Formal Register | Write to unknown official/manager; formal tone, 3 bullet points ($\ge 150$ words) | None | None | None | None | None | None | None | **MISSING** | Missing letter prompt schema, bullet guidance, formal register rubric | W4 | `src/productive-text-contracts.js` |
| General Training | Writing | Task 1 | Letter: Semi-formal Register | Write to known colleague/landlord; polite professional tone, 3 bullet points | None | None | None | None | None | None | None | **MISSING** | Missing letter prompt schema, semi-formal register rubric | W4 | `src/productive-text-contracts.js` |
| General Training | Writing | Task 1 | Letter: Informal / Personal Register | Write to friend/family; conversational tone, 3 bullet points | None | None | None | None | None | None | None | **MISSING** | Missing letter prompt schema, informal register rubric | W4 | `src/productive-text-contracts.js` |
| General Training | Writing | Task 2 | Essay Response | General interest essay response ($\ge 250$ words, ~40 mins) | None | Shared with Academic Task 2 essay substrate | Learner self-review only | `learnerArtifacts` | Revision history | Default-deny | Single paragraph tested | **PARTIAL** | Missing GT essay prompts & rubric evaluation | W4 | `src/productive-text-contracts.js` |

### 5.7 Speaking Coverage Matrix (Shared Academic & General Training)

| Test Type | Skill | Part | Official Task Family | Official Semantics | Current Surface | Current Runtime Support | Current Scoring Support | Current Persistence | Current Review Support | Current Evidence/Progress | Current Browser Acceptance | Classification | Gap | Proposed Wave | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AC & GT | Speaking | Part 1 | Introduction & Interview | Answer 4–6 short questions on 2–3 familiar topics (4–5 mins) | Legacy IELTS Lab | Legacy dictation / retell on YouTube | Coaching-only | `mediaAttempts` | Audio playback | Coaching-only (no FSRS) | Legacy browser test | **MISLEADING** | Legacy media lab masquerades as speaking; missing authentic Part 1 interview flow | W5 | `src/ielts-lab.js` (ADR-030 coaching-only) |
| AC & GT | Speaking | Part 2 | Individual Long Turn / Cue Card | 1 min preparation with notes $\to$ 2 min uninterrupted speech $\to$ rounding questions (3–4 mins) | None | None | None | None | None | None | None | **MISSING** | Missing cue card UI, 1-min prep timer, scratch notes, 2-min recording timer | W5 | `src/ielts-domain.js` |
| AC & GT | Speaking | Part 3 | Two-Way Discussion | Answer in-depth, abstract, analytical questions linked thematically to Part 2 (4–5 mins) | None | None | None | None | None | None | None | **MISSING** | Missing Part 3 multi-turn discussion runner and prompt flow | W5 | `src/ielts-domain.js` |
| AC & GT | Speaking | All Parts | 4-Dimension Rubric Evaluation | Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation | None | None | None | None | None | None | None | **MISSING** | Missing audio evaluation and honest practice feedback generator | W5 | `src/ielts-domain.js` |

### 5.8 Cross-Cutting Practice and Mock Orchestration Matrix

| Test Type | Skill | Capability | Official Semantics | Current Surface | Current Runtime Support | Current Scoring Support | Current Persistence | Current Review Support | Current Evidence/Progress | Current Browser Acceptance | Classification | Gap | Proposed Wave | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AC & GT | All | Track Selector | User chooses Academic or General Training track | None | Schema only (`profiles`) | None | None | None | None | None | **MISSING** | Missing UI track switcher | W0 | `src/ielts-profile-inventory.js` |
| AC & GT | All | Practice Hierarchy | Task-family practice $\to$ Section practice $\to$ Skill test $\to$ Full mock | Hub v2 / Lab | Task-family inventory exists | Objective item scoring | `objectiveInventory` | Error Notebook | EventRepository / Today | Wave 4 tests | **PARTIAL** | Missing Section, Skill Test, and Full Mock orchestration | W0 / W6 | `src/ielts-hub-v2.js` |
| AC & GT | All | Full Mock Exam Runner | Timed simulation: Listening (30m) $\to$ Reading (60m) $\to$ Writing (60m) $\to$ Speaking (15m) | None | `frozen-assessment-runtime.js` exists as untimed multi-item substrate | Objective scoring | `frozenAssessments` | Terminal run replay | Non-representative diagnostic | Wave 6 tests | **PARTIAL** | Missing 4-skill full mock state machine and session timers | W6 | `src/frozen-assessment-runtime.js` |
| AC & GT | All | Interruption / Resume | Autosave progress on browser reload, tab close, or power loss | None | Frozen Assessment stores `ACTIVE` run id without partial responses (S15-F005) | None | Active run only | None | None | Tested in Wave 6 | **PARTIAL** | Short tasks restart; full mocks require session autosave contract | W0 / W6 | `docs/superpowers/specs/2026-08-14-stage1-5-product-jury-001/f005-interrupted-assessment-research.md` |
| AC & GT | All | Scoring Honesty & Disclaimers | Objective raw scores converted accurately; Writing/Speaking labeled "Practice Estimate", never official band | Hub v2 / Lab | Objective scoring exact; writing self-review only | Raw scores | Canonical envelopes | Error Notebook | Default-deny | Phase 0 / Wave 4 tests | **COMPLETE** | Must remain invariant across all new Stage 2 Waves | W0–W6 | `src/evidence-policy.js`, `src/productive-text-contracts.js` |

---

## 6. Normalized Stage 2 Gap Register

| GAP_ID | TEST_TYPE | SKILL | TASK_FAMILY / CAPABILITY | CURRENT_STATE | TARGET_STATE | SEVERITY | REUSED_SUBSTRATE | REQUIRED_CHANGE_CLASS | PROPOSED_WAVE | ACCEPTANCE_SIGNAL |
|---|---|---|---|---|---|---|---|---|---|---|
| **GAP-01** | AC & GT | ALL | Track Architecture & Routing | Profiles in schema only; UI lacks Academic vs GT selector | Top-level Academic vs GT selection with tailored navigation | HIGH | `ielts-profile-inventory.js`, `primary-ia-v10.js` | SCHEMA, UI_INTERACTION, GOVERNANCE | **W0** | Learner selects track; appropriate content/tests load |
| **GAP-02** | AC & GT | Listening / Reading | Objective MCQ Multiple Answer | Single-select MCQ only; multiple-answer MCQ missing | Full multi-select QAR primitive with partial credit scoring | HIGH | `question-activity-contracts.js`, `objective-text-response.js` | SCHEMA, RUNTIME, SCORING, TESTING | **W1** | Test selects 2 from 5 options; scored deterministically |
| **GAP-03** | AC & GT | Reading | Summary Completion with Box Options | Free-text OTR only; box-option summary missing | Option-pool matching primitive for summary completion | MEDIUM | `objective-matching-response.js` | SCHEMA, RUNTIME, SCORING | **W1** | Learner matches box words into summary blanks |
| **GAP-04** | AC & GT | Listening | 4-Part Test Runner & Audio Control | Single segment loop / proof UI only | 4-part 40-item test runner with exam (1-play) vs practice modes | HIGH | `ielts-listening-question-activity.js`, `audio-manager.js` | RUNTIME, UI_INTERACTION, PERSISTENCE | **W2** | 40-item listening test runs with synced audio & scoring |
| **GAP-05** | Academic | Reading | 3-Passage Academic Test Runner | Individual item preview only | Split-pane passage & 40-question runner with 60-min timer | HIGH | `ielts-reading-question-activity.js`, `source-revision-ref.js` | RUNTIME, UI_INTERACTION, PERSISTENCE | **W3** | 3-passage academic test renders, navigates, and scores |
| **GAP-06** | General Training | Reading | 3-Section GT Reading Test Runner | Schema supported, no GT text runner | 3-section GT runner (social, workplace, general texts) | HIGH | `ielts-profile-inventory.js`, `ielts-reading-question-activity.js` | RUNTIME, UI_INTERACTION, PERSISTENCE | **W3** | GT reading test runs with GT band conversion curve |
| **GAP-07** | Academic | Writing | Task 1 Visual Information Platform | Single paragraph self-review only | Visual renderers (charts, tables, maps, processes) + $\ge 150$w editor | HIGH | `productive-text-contracts.js`, `productive-writing-ui.js` | SCHEMA, RUNTIME, UI_INTERACTION, PERSISTENCE | **W4** | Task 1 prompt renders visual, validates $\ge 150$w, autosaves |
| **GAP-08** | General Training | Writing | Task 1 Letter Writing Platform | Single paragraph self-review only | Letter prompts (3 bullet points, 3 registers) + $\ge 150$w editor | HIGH | `productive-text-contracts.js`, `productive-writing-ui.js` | SCHEMA, RUNTIME, UI_INTERACTION, PERSISTENCE | **W4** | GT letter prompt displays 3 bullets, autosaves, submits |
| **GAP-09** | AC & GT | Writing | Task 2 Essay Platform & Rubrics | Single paragraph self-review only | 5 essay prompt types, $\ge 250$w editor, 4-dimension rubric feedback | HIGH | `productive-text-contracts.js`, `today-runner.js` | SCHEMA, RUNTIME, UI_INTERACTION, SCORING | **W4** | Task 2 essay validates $\ge 250$w, evaluates on 4 rubrics |
| **GAP-10** | AC & GT | Speaking | 3-Part Guided Speaking Platform | Legacy coaching-only media lab | Part 1 interview $\to$ Part 2 cue card $\to$ Part 3 discussion runner | HIGH | `ielts-persistence.js`, `today-runner.js` | RUNTIME, UI_INTERACTION, PERSISTENCE | **W5** | Complete 3-part speaking test with timers, audio, feedback |
| **GAP-11** | AC & GT | ALL | Full Mock Exam Orchestrator | Untimed single assessment substrate | 4-skill full mock coordinator (L $\to$ R $\to$ W $\to$ S) with report | HIGH | `frozen-assessment-runtime.js`, `today-composer.js` | MOCK_ORCHESTRATION, PERSISTENCE, UI | **W6** | Complete Academic and GT full mocks executable end-to-end |
| **GAP-12** | AC & GT | ALL | Interrupted Session Recovery | Run id preserved, partial items lost (S15-F005) | Practice tasks restart; full mock sessions autosave checkpoints | MEDIUM | `frozen-assessment-runtime.js`, `v10-persistence.js` | PERSISTENCE, RUNTIME, RECOVERY | **W0 / W6** | Refresh mid-mock restores answered questions and timer |

---

## 7. Reusable Stage 1 substrate mapping

Stage 2 directly builds upon the ratified Stage 1 substrate without creating duplicate authority systems.

| Stage 1 Substrate Component | Source Path | Reused / Extended / Adapted | Architectural Governance Rule |
|---|---|---|---|
| **Learning Spine Aggregate** | `src/learning-contracts.js` | **REUSE** | All IELTS practice and mock activities emit canonical `ActivitySpec`, `Run`, `Attempt`, `Receipt`, and `EvidenceDecision`. No second attempt envelope. |
| **EvidencePolicy Gateway** | `src/evidence-policy.js` | **REUSE** | Sole FSRS gateway (ADR-004). Verified objective items can create positive evidence; unverified/coaching/writing/speaking remain default-deny. |
| **SourceRevisionRef** | `src/source-revision-ref.js` | **REUSE** | Immutable provenance and locator binding for passages, audio transcripts, visual prompts, and task cards. |
| **QAR Kernel & Registry** | `src/question-activity-contracts.js` | **EXTEND** | Extend registry with multi-select MCQ and summary matching while preserving deterministic scoring and sealed answer privacy. |
| **Objective Text & Matching** | `src/objective-text-response.js` / `objective-matching-response.js` | **REUSE** | Power all 11 Listening and 15 Reading completion/matching families. |
| **Spatial Prompts** | `src/objective-spatial-prompt.js` | **REUSE** | Power diagram, map, and plan labeling across Listening, Reading, and Writing Task 1. |
| **Productive Text Substrate** | `src/productive-text-contracts.js` | **EXTEND** | Extend `learner-text-artifact` to support Task 1 visuals, letter templates, full essays, and 4-dimension rubric feedback. |
| **Frozen Assessment** | `src/frozen-assessment-runtime.js` | **EXTEND** | Adapt multi-item execution engine for 40-item section tests and 4-skill mock coordinator. |
| **WeaknessProfile & Reducer** | `src/p7-00-metrics-reducer.js` | **REUSE** | Ingest IELTS objective error occurrences and rubric signals without creating a second metrics truth. |
| **Error Repository & Candidates** | `src/error-repository.js` / `error-candidate.js` | **REUSE** | Wrong IELTS objective responses create `ErrorCandidate` records that integrate into the global Error Notebook. |
| **Today Composer & Runner** | `src/today-composer.js` / `today-runner.js` | **REUSE** | Launch IELTS task-family and section practice directly from Today plans. |
| **Backup & Storage Lock** | `src/backup-registry.js` / `storage-lock.js` | **REUSE & EXTEND** | Register all new IELTS durable stores in backup schema v2 under exclusive Web Lock protection. |

---

## 8. Target product contract: `IELTS_COMPLETENESS_V1`

`IELTS_COMPLETENESS_V1` defines the exact candidate target state for Stage 2 exit:

1. **Supported Test Types:**
   - `IELTS Academic` (Full end-to-end)
   - `IELTS General Training` (Full end-to-end)
2. **Supported Skills:**
   - `Listening`, `Reading`, `Writing`, `Speaking`
3. **Official Task Family Coverage:**
   - 100% of all 11 official Listening task families.
   - 100% of all 15 official Academic Reading task families.
   - 100% of all 15 official General Training Reading task families.
   - 100% of Academic Writing Task 1 visual variants (7 types) and Task 2 essay variants (5 types).
   - 100% of General Training Writing Task 1 letter registers (3 types) and Task 2 essay variants.
   - 100% of Speaking Parts 1, 2, and 3.
4. **Practice Granularities:**
   - *Task-Family Practice:* Focused drill on specific question/task formats.
   - *Part / Section Practice:* Full 10-item listening parts or single reading passages.
   - *Skill Test Practice:* Full 40-item Listening test, 40-item Reading test, 2-task Writing test, 3-part Speaking test.
   - *Full Mock Exam:* Complete timed multi-skill simulation (L $\to$ R $\to$ W $\to$ S) with comprehensive result reporting.
5. **Scoring and Evaluation Semantics:**
   - *Listening & Reading:* Exact deterministic raw scoring out of 40; official band conversion curves (Academic vs GT distinct).
   - *Writing & Speaking:* Evaluated across the 4 official band descriptor criteria; results clearly labeled **"Rubric-Aligned Practice Estimate"** or **"Practice Feedback"**.
   - *Honesty Guarantee:* Zero claims of "Certified Official IELTS Band" or "Examiner Guaranteed Score".
6. **Persistence & Resilience:**
   - All attempts, receipts, revisions, drafts, and mock runs persisted to durable IndexedDB.
   - 100% backup/restore coverage in schema v2.
   - Short practice tasks restart cleanly on interruption; full mock sessions restore answered items and elapsed timer on reload.
7. **Error & Weakness Integration:**
   - All objective errors emit `ErrorCandidate` into the global Error Notebook.
   - Weakness signals feed into canonical `WeaknessProfile` (P7-00).
8. **Accessibility & Cross-Platform:**
   - Fully responsive on desktop and mobile browsers.
   - Full keyboard navigation, ARIA labeling, and focus management across all question types and text editors.
9. **Rights & Provenance Safety:**
   - 100% synthetic, repository-owned, or explicitly rights-cleared content fixtures.
   - Zero proprietary test-bank scraping.

---

## 9. Stage 2 Wave decomposition (W0 → W6)

Stage 2 is decomposed into seven bounded, single-writer Waves:

```
[W0: IELTS Product Contracts & Track Architecture]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[W1: Objective Question Kernel] [W4: Productive Writing Platform]
         │                           │
   ┌─────┴─────────────┐             │
   ▼                   ▼             ▼
[W2: Listening] [W3: Reading]   [W5: Productive Speaking Platform]
   │                   │             │
   └─────────────┬─────┴─────────────┘
                 ▼
[W6: Section Practice, Full Mock Orchestration & Exit Gate]
```

---

### Wave W0 — IELTS Product Contracts & Track Architecture
- **Wave ID:** `W0-IELTS-ARCH-001`
- **Mission:** Establish canonical domain contracts, schema extensions, test-type track routing (`Academic` vs `General Training`), practice hierarchy definitions, and storage registry for the Full IELTS Platform.
- **Capabilities Owned:**
  - Track routing contracts and UI selector (`Academic` vs `General Training`).
  - Canonical schemas for multi-part tests, sections, and mock blueprints.
  - Interruption/resume policy definitions (S15-F005).
  - Backup registry updates for new IELTS stores.
- **Official Coverage Added:** Track architecture for all 4 skills in AC and GT.
- **Dependencies:** Stage 1 closure (`STAGE_1_FULLY_CLOSED`), Stage 1.5 closure (`STAGE1_5_COMPLETE`), ADR-049/050.
- **Reused Substrate:** `ielts-profile-inventory.js`, `learning-contracts.js`, `backup-registry.js`, `primary-ia-v10.js`.
- **Expected Source Ownership:** `src/ielts-domain.js`, `src/ielts-profile-inventory.js`, `src/ielts-hub-v2.js`, `src/backup-registry.js`.
- **Expected Test Ownership:** `tests/ielts-domain.test.mjs`, `tests/ielts-profile-inventory.test.mjs`, `tests/backup-registry.test.mjs`.
- **Public Semantics:** Track selection, test structure schemas, practice hierarchy routes.
- **Persistence Impact:** Additive IndexedDB stores (`ieltsTestBlueprints`, `ieltsTestRuns`); backup registry v2 update.
- **Migration / Rollback:** Forward-only additive schema; rollback via feature flag / reader compatibility.
- **RED Strategy:** Assert missing track selector, missing multi-part test contracts, and missing backup coverage.
- **GREEN Outcome:** Track switcher operational, contracts validated, backup sentinel 100% green.
- **Evidence Requirements:** Unit tests, schema validation, backup/restore test, browser UI track selection proof.
- **Stop Conditions:** Track routing ambiguity, backup registry omission, unverified schema fields.
- **Out of Scope:** Skill-specific runners, content authoring, scoring engines.
- **Owner Decisions Required:** None (fulfills Owner-ratified Full IELTS Platform requirement).

---

### Wave W1 — Objective Question Kernel Completeness
- **Wave ID:** `W1-IELTS-OBJ-001`
- **Mission:** Achieve 100% official objective task family coverage across Listening and Reading by implementing missing multi-select MCQ and summary box matching primitives.
- **Capabilities Owned:**
  - `multiple-choice-multiple` QAR primitive ($N$ of $M$ selection with deterministic scoring).
  - `summary-completion-box` QAR primitive (option pool matching into text blanks).
  - Unification of all 11 Listening and 15 Reading task families under QAR contracts.
  - Strict tokenization, word-count limits, and case/whitespace normalization rules.
- **Official Coverage Added:** 100% of official Listening (11/11) and Reading (15/15) objective task families.
- **Dependencies:** `W0-IELTS-ARCH-001`.
- **Reused Substrate:** `question-activity-contracts.js`, `objective-text-response.js`, `objective-matching-response.js`, `objective-spatial-prompt.js`.
- **Expected Source Ownership:** `src/question-activity-contracts.js`, `src/objective-matching-response.js`, `src/objective-text-response.js`, `src/ielts-profile-inventory.js`.
- **Expected Test Ownership:** `tests/qar-00-question-activity-contracts.test.mjs`, `tests/objective-matching-response.test.mjs`, `tests/objective-text-response.test.mjs`.
- **Public Semantics:** QAR activity execution, deterministic scoring, answer normalization.
- **Persistence Impact:** None (transient QAR execution; inventory items stored in `objectiveInventory`).
- **Migration / Rollback:** Additive registry revisions; fail-closed on unknown question versions.
- **RED Strategy:** Test failure on multi-select MCQ and box summary question execution.
- **GREEN Outcome:** All 26 objective question families validate, execute, score, and emit canonical receipts.
- **Evidence Requirements:** 100% unit tests for all 26 task families; sealed key privacy assertions.
- **Stop Conditions:** Key leakage into DOM/ARIA before submit; non-deterministic scoring.
- **Out of Scope:** UI layout of full passages/media player (handled in W2/W3).

---

### Wave W2 — Listening Platform Completeness
- **Wave ID:** `W2-IELTS-LIS-001`
- **Mission:** Build the end-to-end IELTS Listening platform: 4-part 40-item test runner, audio player with 1-play exam vs practice replay policies, section navigation, question-audio synchronization, and Error Notebook integration.
- **Capabilities Owned:**
  - 4-part Listening test runner (Parts 1, 2, 3, 4 with 10 questions each).
  - Audio playback synchronization with transcripts and section timers.
  - Exam mode (single audio playback, transfer time) vs Practice mode (pause, replay, transcript reveal).
  - 40-question objective score calculator and band conversion.
  - Error candidate emission for wrong answers.
- **Official Coverage Added:** Complete Listening test experience for Academic and General Training.
- **Dependencies:** `W0-IELTS-ARCH-001`, `W1-IELTS-OBJ-001`.
- **Reused Substrate:** `ielts-listening-question-activity.js`, `audio-manager.js`, `today-runner.js`, `error-candidate.js`.
- **Expected Source Ownership:** `src/ielts-listening-runner.js` (or equivalent), `src/ielts-media-player.js`, `src/ielts-hub-v2.js`.
- **Expected Test Ownership:** `tests/ielts-listening-runner.test.mjs`, `tests/ielts-listening-browser.test.mjs`.
- **Public Semantics:** Listening test execution, audio player controls, score summary.
- **Persistence Impact:** `ieltsTestRuns` records for listening attempts.
- **Migration / Rollback:** Additive; rollback disables listening runner tab.
- **RED Strategy:** Test failure on 4-part listening test orchestration and exam audio policy.
- **GREEN Outcome:** Full 40-item listening test runs with audio, scores deterministically, emits error candidates.
- **Evidence Requirements:** Unit tests, integration tests, browser audio test, Error Notebook verification.
- **Stop Conditions:** Audio failure, answer key exposure, false FSRS mutation.

---

### Wave W3 — Reading Platform Completeness
- **Wave ID:** `W3-IELTS-RDG-001`
- **Mission:** Build the end-to-end IELTS Reading platform: Academic 3-passage runner, General Training 3-section runner, split-pane text/question navigation, 60-min timer, and distinct Academic vs GT band conversion curves.
- **Capabilities Owned:**
  - Academic Reading 3-passage runner (3 long academic texts, 40 questions).
  - General Training Reading 3-section runner (Section 1: survival texts, Section 2: workplace texts, Section 3: general interest text, 40 questions).
  - Split-pane layout: passage scrolling left, questions right, text highlight/anchor tools.
  - 60-minute countdown timer with autosave.
  - Distinct Academic vs GT raw-to-band conversion curves.
- **Official Coverage Added:** Complete Academic and General Training Reading test platforms.
- **Dependencies:** `W0-IELTS-ARCH-001`, `W1-IELTS-OBJ-001`.
- **Reused Substrate:** `ielts-reading-question-activity.js`, `source-revision-ref.js`, `today-runner.js`, `error-candidate.js`.
- **Expected Source Ownership:** `src/ielts-reading-runner.js`, `src/ielts-hub-v2.js`, `src/ielts-domain.js`.
- **Expected Test Ownership:** `tests/ielts-reading-runner.test.mjs`, `tests/ielts-reading-browser.test.mjs`.
- **Public Semantics:** Academic & GT reading runners, split-pane UI, timer, band conversion.
- **Persistence Impact:** `ieltsTestRuns` records for reading attempts.
- **Migration / Rollback:** Additive; rollback disables reading test runner.
- **RED Strategy:** Test failure on 3-passage navigation, 60-min timer, and GT-specific band scoring.
- **GREEN Outcome:** Academic and GT reading tests execute smoothly, score accurately, and persist cleanly.
- **Evidence Requirements:** Unit tests, band conversion table tests, browser split-pane tests.
- **Stop Conditions:** Passage/question ID mismatch, GT score computed using Academic curve.

---

### Wave W4 — Productive Writing Platform
- **Wave ID:** `W4-IELTS-WRT-001`
- **Mission:** Build the end-to-end IELTS Writing platform: Academic Task 1 (visual renderers for charts, tables, maps, processes), GT Task 1 (letter guidance across 3 registers), and Academic/GT Task 2 (essay types), with live word counters, timers, autosave, and 4-dimension rubric feedback.
- **Capabilities Owned:**
  - Visual prompt renderers for Academic Task 1 (line graph, bar chart, pie chart, table, process diagram, map, mixed graphics).
  - Letter prompt templates for GT Task 1 (formal, semi-formal, personal with 3 bullet prompts).
  - Task 2 essay prompt templates (agree/disagree, both views, advantages/disadvantages, problem/solution, two-part).
  - Drafting editor with live word count, target word warnings ($\ge 150$w / $\ge 250$w), and 20/40/60-min timers.
  - Autosave and immutable submission lifecycle (`learner-text-artifact-revision`).
  - Rubric-aligned practice feedback across the 4 official criteria (Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).
  - Honest "Practice Feedback / Rubric Estimate" labeling.
- **Official Coverage Added:** Complete Academic and General Training Writing platforms.
- **Dependencies:** `W0-IELTS-ARCH-001`.
- **Reused Substrate:** `productive-text-contracts.js`, `productive-writing-ui.js`, `objective-spatial-prompt.js`, `today-runner.js`.
- **Expected Source Ownership:** `src/productive-text-contracts.js`, `src/productive-writing-ui.js`, `src/ielts-writing-prompts.js`.
- **Expected Test Ownership:** `tests/ielts-writing-platform.test.mjs`, `tests/ielts-writing-browser.test.mjs`.
- **Public Semantics:** Writing task selection, visual rendering, text editing, submission, rubric feedback.
- **Persistence Impact:** Extended `learnerArtifacts` store in IndexedDB.
- **Migration / Rollback:** Additive artifact schemas; full backup compatibility.
- **RED Strategy:** Test failure on visual prompt rendering, word count enforcement, and rubric feedback generation.
- **GREEN Outcome:** Visuals render accurately, letters/essays autosave and submit, rubric feedback displays honestly.
- **Evidence Requirements:** Visual rendering tests, word count tests, autosave/resume tests, browser typing tests.
- **Stop Conditions:** Unsaved draft loss on reload, claiming official examiner certification.

---

### Wave W5 — Productive Speaking Platform
- **Wave ID:** `W5-IELTS-SPK-001`
- **Mission:** Build the end-to-end IELTS Speaking platform: guided 3-part simulation (Part 1 interview, Part 2 cue card with 1-min prep notes + 2-min speaking, Part 3 discussion), audio recording/playback, and 4-dimension rubric feedback.
- **Capabilities Owned:**
  - 3-part guided speaking simulation state machine.
  - Part 1: Interactive audio/text prompt interviewer on familiar topics.
  - Part 2: Cue card task with 1-minute countdown prep timer, scratch notes area, 2-minute recording timer, and rounding-off follow-up questions.
  - Part 3: In-depth two-way analytical discussion prompts.
  - Local audio recording capture, persistent storage, and replay.
  - Rubric-aligned feedback across 4 official criteria (Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation).
  - Honest practice feedback labeling.
- **Official Coverage Added:** Complete Speaking test experience for Academic and General Training.
- **Dependencies:** `W0-IELTS-ARCH-001`.
- **Reused Substrate:** `audio-manager.js`, `today-runner.js`, `ielts-domain.js`, `ielts-persistence.js`.
- **Expected Source Ownership:** `src/ielts-speaking-runner.js`, `src/audio-manager.js`, `src/ielts-domain.js`.
- **Expected Test Ownership:** `tests/ielts-speaking-runner.test.mjs`, `tests/ielts-speaking-browser.test.mjs`.
- **Public Semantics:** 3-part speaking flow, prep/recording timers, audio review, rubric feedback.
- **Persistence Impact:** Speaking attempt records and audio blob pointers in IndexedDB.
- **Migration / Rollback:** Additive; rollback disables speaking simulation tab.
- **RED Strategy:** Test failure on Part 2 prep timer notes, 3-part state transitions, and audio capture.
- **GREEN Outcome:** 3-part speaking simulation runs end-to-end with audio review and rubric feedback.
- **Evidence Requirements:** State transition tests, timer tests, audio capture mock tests, browser UI tests.
- **Stop Conditions:** Audio capture hang, skipping Part 2 prep phase, claiming certified examiner score.

---

### Wave W6 — Section Practice, Full Mock Orchestration & Stage 2 Exit Verification
- **Wave ID:** `W6-IELTS-MOCK-001`
- **Mission:** Assemble the full practice hierarchy (Task Family $\to$ Section $\to$ Skill Test $\to$ Full Mock), orchestrate Academic Full Mock and General Training Full Mock exams, prove session interruption recovery, execute cumulative browser acceptance suites, and fulfill the Stage 2 exit gate.
- **Capabilities Owned:**
  - Full Mock Exam Orchestrator: Complete sequence (Listening 30m $\to$ Reading 60m $\to$ Writing 60m $\to$ Speaking 15m).
  - Full Mock score report: Objective section scores + Writing/Speaking rubric summaries + overall band estimate.
  - Interruption/reload session resume for mock tests.
  - Comprehensive Stage 2 verification gate across all 18 completeness dimensions.
- **Official Coverage Added:** Full Mock Exam and Section Practice orchestration for Academic and General Training.
- **Dependencies:** `W0-IELTS-ARCH-001`, `W1-IELTS-OBJ-001`, `W2-IELTS-LIS-001`, `W3-IELTS-RDG-001`, `W4-IELTS-WRT-001`, `W5-IELTS-SPK-001`.
- **Reused Substrate:** `frozen-assessment-runtime.js`, `today-composer.js`, `p7-00-metrics-reducer.js`, all skill runners.
- **Expected Source Ownership:** `src/ielts-mock-orchestrator.js`, `src/ielts-hub-v2.js`, `src/today-composer.js`.
- **Expected Test Ownership:** `tests/ielts-mock-orchestrator.test.mjs`, `tests/ielts-full-mock-browser.test.mjs`, `tests/stage2-completeness-gate.test.mjs`.
- **Public Semantics:** Full Mock launch, section progression, multi-skill score report, resume after refresh.
- **Persistence Impact:** `ieltsMockRuns` and `frozenAssessments` records.
- **Migration / Rollback:** Additive; full backup compatibility.
- **RED Strategy:** Test failure on full mock sequential transition, cumulative score aggregation, and reload resume.
- **GREEN Outcome:** Full Academic and GT mocks execute end-to-end, survive reload, and pass all gate checks.
- **Evidence Requirements:** 3 consecutive clean runs of `npm run stage2:gate`, browser matrix evidence, backup/restore proof.
- **Stop Conditions:** State machine deadlock between skills, data loss on reload, unhandled task family.

---

## 10. Dependency graph and critical path

### 10.1 Dependency Graph

```text
[Stage 1 & 1.5 Closed] ──▶ [W0: IELTS Architecture & Track Routing] (CRITICAL PATH START)
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
   [W1: Objective Kernel]   [W4: Writing Platform] [W5: Speaking Platform]
             │                     │                     │
      ┌──────┴──────┐              │                     │
      ▼             ▼              │                     │
[W2: Listening] [W3: Reading]      │                     │
      │             │              │                     │
      └──────┬──────┴──────────────┼─────────────────────┘
             ▼                     ▼
[W6: Mock Orchestration & Exit Gate] (CRITICAL PATH END)
```

### 10.2 Critical Path Analysis
1. **Critical Path Sequence:**
   $$\text{W0} \longrightarrow \text{W1} \longrightarrow \text{W3} \longrightarrow \text{W6}$$
2. **Rationale:**
   - **W0** is the foundation for track routing, multi-part test schemas, and storage contracts.
   - **W1** provides the objective question primitives required by both Reading and Listening.
   - **W3 (Reading)** represents the largest volume of distinct task families (15 Academic + 15 GT) and complex split-pane text/timer interactions.
   - **W6** unifies all skill runners into the final Full Mock and executes the exit gate.
3. **Parallelizable Waves (under strict single-writer bounded execution):**
   - **W4 (Writing)** and **W5 (Speaking)** depend directly on **W0** and can execute independently of **W1/W2/W3** because they touch isolated productive text and audio modules without overlapping file ownership.
   - **W2 (Listening)** and **W3 (Reading)** both depend on **W1** and can execute sequentially or independently with separate file allowlists.

---

## 11. Reconciliation of Stage 1.5 findings (F004 & F005)

### 11.1 S15-F004 Reconciliation (Learner-Facing Progress UI vs Canonical Evidence)
- **Finding:** Learner-facing Progress UI derives metrics independently while Today/Focus uses canonical cross-surface evidence.
- **Canonical Disposition:** Formally deferred to package `P7-01` (Progress owner).
- **Stage 2 Reconciliation Rule:**
  - Stage 2 does **NOT** build a third parallel progress system.
  - All Stage 2 IELTS activities emit canonical `Attempt`, `Receipt`, and `EvidenceDecision` records into the canonical `EventRepository`.
  - When P7-01 executes, all IELTS evidence will automatically project into the unified progress view.

### 11.2 S15-F005 Reconciliation (Interrupted Assessment Lifecycle)
- **Finding:** Frozen Assessment persists active run identity (`ACTIVE`) but does not persist intermediate partial responses.
- **Disposition Analysis:**
  - *Short Task-Family Practice (1–5 items):* Interrupted runs restart cleanly from item 1 (`RESTART_EXISTING_RUN`). This avoids IndexedDB write amplification on micro-drills.
  - *Full Section Tests & Full Mocks (40 items / multi-section):* Accidental reload during a 60-minute reading test or 30-minute listening test would cause unacceptable user frustration if all answers were wiped.
- **Stage 2 Strategy Contract:**
  - Task-family drills use `RESTART_EXISTING_RUN` (zero schema changes, atomic completion).
  - Section tests and Full Mocks use a dedicated `ieltsSessionCheckpoint` store to autosave answered question IDs and timer state on change. Reload seamlessly re-hydrates the active test session.
  - All assessment runs remain `affectsSchedule: false` and `evidenceEligible: false` (zero FSRS impact).

---

## 12. Inter-stage boundaries (Stages 3, 4, and 5)

| Boundary | In-Scope for Stage 2 | Strictly Deferred Beyond Stage 2 |
|---|---|---|
| **Stage 3 Boundary** (Learning / Product Deep Research) | Narrow format research strictly required to faithfully implement official IELTS task families, band descriptor rubrics, and scoring conversion. | Broad learning-science research, cognitive load studies, novel spaced repetition algorithms, OSS transcript pipeline exploration $\to$ **DEFER_TO_STAGE_3_RESEARCH**. |
| **Stage 4 Boundary** (UX / IA Remake) | Bounded IELTS-specific interaction components required for task fidelity (split-pane reading viewer, visual prompt renderer, cue card timer). | Global application layout rewrite, global design-system overhaul, universal navigation overhaul $\to$ **DEFER_TO_STAGE_4_UX_REMAKE**. |
| **Stage 5 Boundary** (AI / Tech Deep Research & Benchmark) | Utilizing existing ratified LLM/AI provider interfaces and local audio APIs with deterministic mock fallbacks in CI. | Evaluating new AI providers, switching persistence engines, adding cloud backend services, or benchmarking models $\to$ **DEFER_TO_STAGE_5_BENCHMARK**. |

---

## 13. First Wave recommendation

### 13.1 Recommended Candidate
$$\text{STAGE2\_FIRST\_WAVE\_CANDIDATE} = \mathbf{W0\text{-}IELTS\text{-}ARCH\text{-}001}$$
**(IELTS Product Contracts & Track Architecture)**

### 13.2 Rationale
1. **Prerequisite for All Downstream Work:** Establishes the Academic vs General Training track routing, test blueprint schemas, and storage foundations without which no skill runner or mock orchestrator can function.
2. **Zero Unmet Dependencies:** All prerequisites (Stage 1 closure, Stage 1.5 closure, Master Roadmap canonicalization) are 100% satisfied.
3. **Smallest Blast Radius:** Touches domain contracts, metadata schemas, and routing without modifying existing working QAR or Video Workspace runtimes.
4. **Immediate Verification:** Can be verified with unit tests, schema validators, and browser route tests.

### 13.3 Explicit Non-Authorization Reminder
> [!WARNING]
> This is a **RECOMMENDATION ONLY**.
> Wave W0 is **NOT AUTHORIZED** by this document.
> Execution of Wave W0 requires a separate, independently reviewed Wave Authorization Manifest.

---

## 14. Stage 2 exit gate definition

Stage 2 will close and achieve `STAGE_2_COMPLETE` **only** when all of the following machine-checkable criteria are independently verified on the exact same canonical `main` commit:

1. **Full Track Coverage:** Both `IELTS Academic` and `IELTS General Training` are fully selectable and executable end-to-end.
2. **100% Official Task Families:** All 11 Listening, 15 Academic Reading, 15 GT Reading, 7 Academic Writing Task 1, 3 GT Writing Task 1, Academic/GT Writing Task 2, and Speaking Parts 1–3 are verified and runnable.
3. **Deterministic Objective Scoring:** 100% of objective Listening and Reading questions score deterministically with exact raw-to-band conversion.
4. **Productive Writing End-to-End:** Academic Task 1 (visuals), GT Task 1 (letters), and Task 2 (essays) support drafting, word counting, autosave, submission, and rubric feedback.
5. **Productive Speaking End-to-End:** Parts 1, 2, and 3 run sequentially with prep/recording timers, audio review, and rubric feedback.
6. **Full Mock Exam Orchestrator:** Complete 4-skill mock tests run end-to-end for both Academic and General Training with comprehensive score reports.
7. **Session Interruption Recovery:** Full mock and section test sessions restore answered questions and timers after browser refresh.
8. **Storage & Backup Invariants:** 100% of new IELTS durable stores registered in backup schema v2; safe restore and rollback verified.
9. **Evidence & Scoring Honesty:** Zero false FSRS reviews; zero misleading "Official Certified Band" claims; all AI feedback labeled "Practice Feedback".
10. **Error Notebook Integration:** All objective errors emit verified candidates into the global Error Notebook.
11. **Rights & Provenance Safety:** 100% synthetic or rights-cleared test fixtures with valid provenance records.
12. **Automated Verification:** `npm run stage2:gate` passes 3 consecutive times with zero failed, skipped, or todo tests.
13. **Independent Audit Verdict:** An independent auditor reviews the cumulative Stage 2 diff and issues `ACCEPT`.

---

## 15. Risks, mitigations, and owner decisions

| Risk / Decision Item | Severity | Proposed Strategy / Mitigation | Owner Decision Status |
|---|---|---|---|
| **Audio Playback in CI** | MEDIUM | Use deterministic mock audio fixtures and Web Audio API fakes in headless CI while supporting standard HTML5 audio in real browsers. | RATIFIED (Substrate convention) |
| **Writing / Speaking Evaluation Cost & Latency** | MEDIUM | Bounded prompt sizes, client-side validation before request, local draft preservation on network error, explicit "Practice Feedback" labeling. | RATIFIED (ADR-020, ADR-050) |
| **GT Reading Source Text Sourcing** | LOW | Author synthetic rights-safe multi-text notices (Section 1) and workplace handbooks (Section 2) with clear provenance. | RATIFIED (Content Safety Policy) |
| **Interrupted Assessment Autosave** | MEDIUM | Dedicated `ieltsSessionCheckpoint` store for timed tests; short drills restart cleanly without write amplification. | RATIFIED in W0 schema design |

---

## 16. Candidate strategy sign-off

- **Author Role:** STAGE 2 PRODUCT / TECHNICAL STRATEGY RECONCILIATION IMPLEMENTER
- **Transaction ID:** `STAGE2-IELTS-STRATEGY-001`
- **Candidate Head:** `strategy/stage2-ielts-completeness-001`
- **Target Branch:** `main` (predecessor `2d241c9690e0b56968add4d071aae1c62a698e0c`)
- **Status:** `CANDIDATE_READY_FOR_INDEPENDENT_AUDIT`
