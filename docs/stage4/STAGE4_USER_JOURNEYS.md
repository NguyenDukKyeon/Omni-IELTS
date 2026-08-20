# STAGE 4 USER JOURNEYS & INTERACTION SPECIFICATION

**Document Identity**: `STAGE4-USER-JOURNEYS-V1`  
**Governing Ratification**: `STAGE4-W1-IA-JOURNEYS-001` (G1 Design Gate Ratified by Human Owner)  
**Controlling Authorization Manifest**: [`docs/authorizations/STAGE4-UXIA-AUTH-001.md`](../authorizations/STAGE4-UXIA-AUTH-001.md)  
**Controlling Strategy**: [`docs/stage4/STAGE4_UXIA_STRATEGY.md`](STAGE4_UXIA_STRATEGY.md)  
**Status**: `CANDIDATE_USER_JOURNEYS / PENDING_INDEPENDENT_AUDIT`  
**Document Role**: Candidate Stage 4 User Journeys Specification (subordinate to repository authority hierarchy under [`AGENTS.md`](../../AGENTS.md))

---

## 1. Executive Summary & Journey Principles

`[FACT]` This specification details the **15 Core User Journeys** of OmniIELTS, establishing end-to-end user workflows, state transitions, interaction controls, recovery paths, and evidence boundaries.

### Core Journey Invariants
1. **1:1 Mapping with Representative Screen Classes**: Each of the 15 core journeys owns and exercises exactly one primary representative screen class while orchestrating required secondary states and drawers.
2. **Pedagogical Progression Preservation**:
   $$\text{Curriculum / Instruction} \longrightarrow \text{Scaffolded Practice} \longrightarrow \text{Authentic Assessment} \longrightarrow \text{Diagnosis} \longrightarrow \text{Targeted Remediation}$$
3. **Zero Silent Behavioral Loss**:
   Every micro-interaction (scratchpads, timers, audio scrubbers, draft recovery, feedback modals, DOM masking) established in Stage 1–3 is explicitly articulated.
4. **Strict Evidence Gateway Compliance**:
   Scaffolded learning and practice runs do not pollute FSRS memory stability. Exam simulations and section practice maintain `affectsSchedule: false` and `evidenceEligible: false`.
5. **Authentic Official Format Fidelity**:
   Computer-delivered Listening (~30–34m + 2m check), Writing (60m shared timer), and Reading (60m split-pane) faithfully reflect official test parameters.
6. **Learner Agency & Direct Access Contract**:
   $$\text{RECOMMENDED\_PATH} \neq \text{REQUIRED\_PATH}$$
   $$\text{CURRICULUM\_PATH} \neq \text{NAVIGATION\_LOCK}$$
   $$\text{GUIDED\_SEQUENCE} \neq \text{MANDATORY\_GLOBAL\_SEQUENCE}$$
   $$\text{ACTIVITY\_INTEGRITY\_LOCK} \neq \text{CURRICULUM\_LOCK}$$
   OmniIELTS operates on the principle of $\text{SYSTEM\_GUIDES\_STRONGLY} + \text{LEARNER\_RETAINS\_CONTROL}$. Guided sessions, daily plans, and curriculum progressions provide expert pedagogical direction, but do not impose mandatory unlock gates or access control locks on major product destinations.

---

## 2. Canonical 15 Core User Journeys Matrix

| JOURNEY_ID | JOURNEY_NAME | OWNING SCREEN | PRIMARY GOAL | ENTRY POINT | PRIMARY WORKFLOW |
|---|---|---|---|---|---|
| **`J-01`** | **Today / Daily Command Center** | Screen 1 | Complete due spaced reviews and maintain habit | `Nav: Today` (`#/today`) | Review due queue $\to$ Rate recall $\to$ Complete session $\to$ Inspect updated streak |
| **`J-02`** | **Vocabulary Spaced Review** | Screen 2 | Master lexical items via FSRS cued recall | Today Runner or Deck Drill | Cued prompt $\to$ Recall $\to$ Flip $\to$ Rate (Again/Hard/Good/Easy) $\to$ 4-tier feedback |
| **`J-03`** | **Video / Media Learning** | Screen 3 | Deep audio-visual pedagogical mastery | `Learn: Video Workspace` | Load media $\to$ Choose mode $\to$ Step 1–7 loop (Listen $\to$ Dictate $\to$ Shadow $\to$ Retell) |
| **`J-04`** | **Article / Source-to-Learning** | Screen 4 | Read authentic text & extract new vocabulary | `Library: Sources` $\to$ `Learn: Reader` | Load source $\to$ Active reading $\to$ In-text word selection $\to$ Capture $\to$ Cloze drill |
| **`J-05`** | **Capture Inbox → Confirmed Knowledge** | Screen 5 | Triage staged words into active FSRS deck | `Global Action` or `Nav: Library/Capture` | Open Inbox $\to$ Inspect context snippets $\to$ Edit definitions $\to$ Batch import to deck |
| **`J-06`** | **Error → Weakness → Remediation** | Screen 6 | Diagnose persistent mistakes and remediate | `Nav: Library/Errors` or `Today: Next Action` | View 23-category error map $\to$ Inspect mistake cards $\to$ Launch targeted remediation |
| **`J-07`** | **Analytics → Action** | Screen 7 | Audit learning state and launch goal actions | `Nav: Analytics` (`#/analytics`) | View Memory $R$, Skill Radar, Band Estimate $\to$ Check pacing $\to$ Launch next action |
| **`J-08`** | **IELTS Listening** | Screen 8 | Complete computer Listening exam or practice | `IELTS: Listening` | Select Track $\to$ Choose Exam/Practice $\to$ Complete 4 parts (40 items) $\to$ Review score |
| **`J-09`** | **IELTS Academic Reading** | Screen 9 | Complete 3-passage scholarly reading exam | `IELTS: Reading (Academic)` | Launch split-pane runner $\to$ Read passage $\to$ Answer items $\to$ Submit $\to$ Review |
| **`J-10`** | **IELTS General Training Reading** | Screen 10 | Complete 3-section workplace/social reading | `IELTS: Reading (GT)` | Launch split-pane runner $\to$ Navigate multi-texts $\to$ Complete items $\to$ Submit $\to$ Review |
| **`J-11`** | **IELTS Academic Writing Task 1** | Screen 11 | Write 150w report on visual chart/diagram | `IELTS: Writing/Task 1` | Inspect chart (7 configurations) $\to$ Write report $\to$ Live word count $\to$ Rubric review |
| **`J-12`** | **IELTS Writing Task 2** | Screen 12 | Write 250w discursive essay on prompt | `IELTS: Writing/Task 2` | Inspect prompt $\to$ Draft outline in scratchpad $\to$ Write essay $\to$ Rubric critique |
| **`J-13`** | **IELTS Speaking** | Screen 13 | Complete 3-part guided practice or AI examiner | `IELTS: Speaking` | Select Guided/Examiner $\to$ Part 1 interview $\to$ Part 2 cue card $\to$ Part 3 discussion $\to$ Feedback |
| **`J-14`** | **IELTS Full Mock Simulation** | Screen 14 | Complete full 4-skill simulation under exam pressure | `IELTS: Full Mock` | Equipment check $\to$ L (~30–34m) $\to$ R (60m) $\to$ W (60m) $\to$ Speaking component $\to$ Scorecard |
| **`J-15`** | **Settings / Privacy / AI / Data Safety** | Screen 15 | Manage AI consent, backup data, and audit | `Nav: Settings` (`#/settings`) | Inspect AI consent $\to$ Enter ephemeral key $\to$ Full JSON backup export $\to$ System audit |

---

## 3. Detailed Specification for the 15 Core User Journeys

---

### Journey J-01: Today / Daily Command Center
- **Owning Screen**: **Screen 1 (Today / Home Dashboard)**
- **Learner Persona & Intent**: A student starting their daily study routine, aiming to clear due memory reviews, maintain their study streak, and address high-priority weaknesses in minimal time.
- **Entry Point**: Application launch or navigating to `#/today`.
- **Preconditions**: User has active study cards scheduled via FSRS in local IndexedDB.
- **Step-by-Step Primary Flow**:
  1. Learner opens Today Dashboard and views daily summary card: due review count, new items available, current streak counter, and primary recommended action.
  2. If due queue exceeds 50 cards, Today runner surfaces **Backlog Triage Banner**: learner chooses between `"Quick Catch-up Drill"` (20 most urgent cards) and `"Full Due Queue"`.
  3. **Learner Agency & Direct Access**:
     - *Primary Path*: Learner clicks `"Start Daily Study"`: system initiates study session with single-lease lock (preventing multi-tab race conditions).
     - *Autonomous Navigation Path*: The learner may bypass the daily recommendation entirely ($\text{TODAY\_RECOMMENDATION} \neq \text{FORCED\_SESSION}$) and navigate directly to Learn Workspaces, IELTS Practice/Mock runners, or Library via the global navigation rail.
  4. Cards execute sequentially via `Screen 2 (Vocabulary Spaced Review)`.
  5. Upon completing daily target, Today Dashboard updates streak counter, displays celebration badge, and unlocks `"Next Recommended Action"` (targeted weakness drill).
- **Secondary States & Subviews**:
  - `backlog_catchup_triage_modal`: High-speed review selection for learners returning after absence (`R4-OD003`).
  - `workload_estimator_popover`: Visual projection of estimated daily reviews based on target retention $R$ (`R4-OD002`).
  - `provisional_grace_freeze_badge`: Indicates 1-day habit protection when a day was missed (`R4-OD004`).
  - `quick_micro_drill_overlay`: Instant 3-minute drills (Vocab sprint, audio listening snippet, grammar spot check).
- **Error Recovery & Offline Fallbacks**:
  - If IndexedDB is blocked, runner displays **Core-Only Degraded Mode Banner** and falls back to localStorage queue (`CAP-041`).
- **Evidence & Schedule Gateway**:
  - Unassisted reviews generate qualified FSRS rating events updating card stability and difficulty parameters.

---

### Journey J-02: Vocabulary Spaced Review
- **Owning Screen**: **Screen 2 (Vocabulary Spaced Review Workspace)**
- **Learner Persona & Intent**: A student reviewing flashcards to build long-term lexical retrievability for IELTS reading and writing.
- **Entry Point**: Launched from Today runner (`J-01`) or Library deck view.
- **Step-by-Step Primary Flow**:
  1. Card prompt presents target word/collocation in context with audio pronunciation trigger.
  2. Learner engages in active retrieval (thinking or typing response).
  3. Learner clicks `"Show Answer"` (or presses `Space`): reveals definition, IPA transcription, usage notes, and collocation examples.
  4. Learner rates recall difficulty using 4 FSRS rating buttons: `Again` (1), `Hard` (2), `Good` (3), `Easy` (4). Button labels preview next scheduled interval.
  5. If response was incorrect, UI surfaces **4-Tier Feedback Card** (`Verify`, `Elaborate`, `Refute`, `Scaffold`) explaining common pitfalls.
  6. Next card loads instantly; progress bar advances.
- **Secondary States & Subviews**:
  - `card_flip_reveal`: Animated transition separating cued prompt from definition and examples.
  - `4_tier_feedback_card`: Pedagogical feedback explaining misconceptions and root rules (`R1S-F001`, `R1S-F003`).
  - `edit_card_modal`: In-line editor allowing learner to customize example sentences or personal mnemonics.
  - `suspend_card_toggle`: Instant suspension toggle for irrelevant or mastered cards (`S4-OMIT-007`).
- **Evidence & Schedule Gateway**:
  - Unassisted reviews update FSRS memory parameters ($S, D, R$). If hints were viewed, `EvidencePolicy` suppresses stability progression.

---

### Journey J-03: Video / Media Learning & 7-Step Loop
- **Owning Screen**: **Screen 3 (Video & Media Study Workspace)**
- **Learner Persona & Intent**: A student watching an authentic lecture or interview to improve connected speech perception, vocabulary in context, and oral retell.
- **Entry Point**: `Learn -> Video Workspace` (`#/learn/media`).
- **Step-by-Step Primary Flow**:
  1. Learner loads video (YouTube URL or local audio/video file).
  2. Video player embeds on the left; synchronized virtualized transcript rail mounts on the right.
  3. **Media Mode Independence**:
     - The 7-Step Sentence Learning Loop is a **guided pedagogical workflow**, NOT a mandatory mode unlock chain:
       $$\text{GUIDED\_PEDAGOGICAL\_WORKFLOW} \neq \text{MANDATORY\_MODE\_UNLOCK\_CHAIN}$$
     - Learner may directly choose and launch any of the **6 Study Modes** without completing predecessor steps:
       - *Mode 1 (Normal)*: Video plays with auto-scrolling synchronized subtitle cues.
       - *Mode 2 (Noticing)*: Transcript highlights thought groups, weak forms, stressed syllables, and IPA.
       - *Mode 3 (Shadowing)*: Pauses after each sentence for learner vocal repetition and recording comparison (directly accessible without completing Dictation).
       - *Mode 4 (Strict Dictation)*: Video plays audio only; transcript text is strictly masked in DOM/ARIA; learner types exact sentence (directly accessible without completing Retell).
       - *Mode 5 (Practice Dictation)*: Word-length masks and optional first-letter hints provided.
       - *Mode 6 (Retell & Synthesis)*: Learner records oral summary or drafts written synthesis.
     - A learner may also compose custom partial journeys (e.g. *Noticing $\to$ Shadowing*).
  4. In guided sequence mode, learner steps through the **7-Step Sentence Learning Loop**:
     - *Step 1 (Listen)* $\to$ *Step 2 (Dictate)* $\to$ *Step 3 (Verify)* $\to$ *Step 4 (Notice)* $\to$ *Step 5 (Shadow)* $\to$ *Step 6 (Vocab)* $\to$ *Step 7 (Retell)*.
     - Accessible `Skip Step`, `Change Mode`, and `Exit Loop` controls remain available at every step.
  5. In Step 6, learner 1-clicks unknown collocations to add them directly to Capture Inbox (`S4-OMIT-001`).
  6. In Step 7, typed retell drafts autosave to localStorage (`DRAFT_JOURNAL_PREFIX`) for complete crash recovery (`S4-OMIT-002`).
- **Secondary States & Subviews**:
  - `strict_dictation_view`: Complete DOM/ARIA answer concealment (`KEY_LEAK_BEFORE_SUBMIT === 0`; activity-integrity lock).
  - `noticing_ipa_drawer`: Acoustic decoding breakdown with phonetic symbols and chunk boundaries.
  - `waveform_recording_view`: Real-time Web Audio waveform comparing native speaker audio to learner recording.
  - `retell_journal_view`: Formative drafting area with autosave recovery banner.
  - `transcript_slicer_drawer`: In-line cue editor for splitting/merging subtitle segments (`S4-OMIT-004`).
  - `topic_chapters_bar`: Future semantic topic navigation bar (`FUT-004`).
  - `overlapping_speaker_lanes`: Future concurrent speaker alignment representation (`FUT-003`).
- **Evidence & Schedule Gateway**:
  - Dictation attempts emit `ErrorCandidate` records on misspellings; FSRS scheduling is strictly isolated under coaching rules.

---

### Journey J-04: Article / Source-to-Learning
- **Owning Screen**: **Screen 4 (Article & Passage Reader Workspace)**
- **Learner Persona & Intent**: A student reading authentic scholarly articles or imported texts to expand academic vocabulary and reading speed.
- **Entry Point**: `Library -> Sources` (`#/library/sources`) $\to$ `Learn: Reader` (`#/learn/reader`).
- **Step-by-Step Primary Flow**:
  1. `[CURRENT]` Learner loads source text via Private Source Library (pasted text, text file, SRT transcript) or `[FUTURE_UX_RESERVED]` drops structured documents into multi-format parser dropzone (PDF, EPUB; `FUT-011`).
  2. `[CURRENT]` Reader formats text into clean, legible paragraphs with heading anchors.
  3. `[CURRENT]` Learner reads with paragraph highlighter; clicking any word/collocation triggers instant definition popover.
  4. `[CURRENT]` Learner clicks `"Add to Inbox"`: term, definition, sentence context, and source document citation are staged in Capture Inbox (`CAP-012`).
  5. `[CURRENT]` Learner launches flashcard practice on extracted vocabulary, or `[FUTURE_UX_RESERVED]` launches automated contextual Cloze and reading comprehension checks generated from the source text (`FUT-008`).
- **Secondary States & Subviews**:
  - `document_dropzone_uploader`: Multi-format drag-and-drop file uploader with parsing progress indicator (`[FUTURE_UX_RESERVED]` / `FUT-011`).
  - `cefr_level_pill_breakdown`: Readability rating pill (A1–C2) with vocabulary distribution chart (`[FUTURE_UX_RESERVED]` / `FUT-006`).
  - `in_text_capture_popover`: Context-aware lexical lookup modal with 1-click stage action (`[CURRENT]`).
  - `cloze_exercise_view`: Instant retrieval practice generated from high-frequency academic vocabulary in the text (`[FUTURE_UX_RESERVED]` / `FUT-008`).
- **Evidence & Schedule Gateway**:
  - Reading drills are formative; captured words graduate to FSRS only after confirmation in Inbox (`J-05`).

---

### Journey J-05: Capture Inbox → Confirmed Knowledge
- **Owning Screen**: **Screen 5 (Unified Capture Inbox Workspace)**
- **Learner Persona & Intent**: A student reviewing recently captured words from video, reading, or quick capture, organizing and editing them before promoting them into active spaced repetition.
- **Entry Point**: `Library -> Capture Inbox` (`#/library/inbox`) or Global Capture Trigger.
- **Step-by-Step Primary Flow**:
  1. Learner opens Capture Inbox to view staged terms captured during study sessions.
  2. Table displays term lemma, captured context sentence, source tag, and provisional CEFR tag.
  3. Learner edits definitions, adds personal notes, or selects target collocations in-line.
  4. Learner selects items and clicks `"Confirm & Import to Deck"`: cards are created with FSRS initial state and added to Today review queue.
  5. Discarded items trigger a 5-second non-blocking `"Undo"` toast (`CAP-046`).
- **Secondary States & Subviews**:
  - `mobile_bottom_sheet`: Accessible bottom-sheet capture interface for mobile devices.
  - `in_line_editor`: Immediate in-place editing of definitions, tags, and translation glosses.
  - `batch_selection_toolbar`: Bulk actions (`Select All`, `Confirm Selected`, `Delete Selected`).
  - `5s_undo_toast`: Accidental deletion protection primitive.
- **Evidence & Schedule Gateway**:
  - Promoting terms initializes new card records in `coreCards` store with clean cold-start FSRS parameters.

---

### Journey J-06: Error → Weakness → Targeted Remediation
- **Owning Screen**: **Screen 6 (Error Notebook & Weakness Map Workspace)**
- **Learner Persona & Intent**: A student analyzing persistent mistakes across writing, speaking, and reading, and executing targeted drills to eliminate recurring errors.
- **Entry Point**: `Library -> Error Notebook` (`#/library/errors`) or `Today: Next Action`.
- **Step-by-Step Primary Flow**:
  1. `[CURRENT]` Learner opens Error Notebook and views 23-category diagnostic heatmap (ERRANT-aligned taxonomy) and active error repository (`CAP-014`).
  2. `[CURRENT]` Heatmap visualizes error frequency and recurrence decay weighting (distinguishing fresh mistakes from resolved ones).
  3. `[CURRENT]` Learner filters by skill (e.g. `Writing - Lexical Resource`) and clicks a specific error card.
  4. `[CURRENT]` Error card displays original task prompt, learner's incorrect input, and ground truth correction; `[FUTURE_UX_RESERVED]` displays automated refutational grammatical rule explanation (`R1S-F003` / `FUT-017`).
  5. `[CURRENT]` Learner launches repair queue practice, or `[FUTURE_UX_RESERVED]` launches dynamic isomorphic remediation micro-drills targeting that specific misconception (`FUT-008`).
  6. `[CURRENT]` Upon successful completion, error status transitions to `"Reviewing"` or `"Resolved"`.
- **Secondary States & Subviews**:
  - `error_heatmap_grid`: 23-category visual matrix mapping weakness density across skills (`[CURRENT]`).
  - `error_context_drawer`: Deep view showing original test item context, timestamps, and mistake history (`[CURRENT]`).
  - `refutational_explanation_view`: Pedagogical card explaining *why* the error occurred and how to avoid it (`[FUTURE_UX_RESERVED]` / `R1S-F003`, `FUT-017`).
  - `targeted_remediation_launcher`: Immediate launchpad for focused corrective exercises (`[CURRENT]` / `[FUTURE_UX_RESERVED]`).
- **Evidence & Schedule Gateway**:
  - Error candidate emission maintains `affectsSchedule: false`; remediation drills provide formative mastery without biasing baseline test scores.

---

### Journey J-07: Analytics → Action
- **Owning Screen**: **Screen 7 (Multi-Dimensional Analytics Dashboard)**
- **Learner Persona & Intent**: A student auditing their overall study progress, memory retrievability, 5-skill competence, and estimated IELTS band readiness.
- **Entry Point**: `Nav: Analytics` (`#/analytics`).
- **Step-by-Step Primary Flow**:
  1. Learner opens Analytics Dashboard and views Multi-Dimensional Learner State:
     - `[CURRENT]` **Memory / Retention**: FSRS memory stability decay curve with target retention reference line ($R$) and skill coverage (`CAP-013`).
     - `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]` **Skill Mastery Estimate**: 5-Skill Competence Radar (Listening, Reading, Writing, Speaking, Lexical) with confidence intervals (`FUT-014`).
     - `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]` **IELTS Performance Estimate**: Calibrated practice band range with practice disclaimer (`FUT-014`).
  2. `[CURRENT]` Learner inspects 52-week activity heatmap and habit consistency timeline (`src/progress.js`).
  3. `[CURRENT]` Learner checks **Exam Pacing Calculator**: displays daily target review and practice requirements to achieve goal score by target exam date (`S4-OMIT-008`).
  4. `[CURRENT]` Learner clicks `"Execute Recommended Action"`: launches the highest-leverage weakness remediation drill.
- **Secondary States & Subviews**:
  - `retention_decay_curve`: Visual decay projection showing memory retrievability over time (`[CURRENT]`).
  - `radar_confidence_bounds`: 5-skill polygon display showing competence estimates with uncertainty margins (`[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]` / `FUT-014`).
  - `attempt_provenance_audit_drawer`: Audit drawer displaying all 9 contextual provenance fields for any recorded attempt (`[FUTURE_UX_RESERVED]` / `FUT-016`).
  - `pacing_calculator_drawer`: Interactive slider adjusting daily target workload based on remaining study days (`[CURRENT]`).
- **Evidence & Schedule Gateway**:
  - Analytics aggregate historical attempt receipts without executing direct schema or schedule mutations.

---

### Journey J-08: IELTS Listening Exam & Practice
- **Owning Screen**: **Screen 8 (IELTS Listening Runner)**
- **Learner Persona & Intent**: A student completing a 4-part IELTS Listening test under authentic computer-delivered conditions or practicing specific parts with audio scrubbing and transcripts.
- **Entry Point**: `IELTS Hub -> Listening` (`#/ielts/listening`) or direct URL anchor.
- **Learner Agency & Direct Access**: Directly accessible at any time without completing prior curriculum or practice modules. If diagnostic evidence suggests prior skill review, non-blocking guidance (`"Recommended first"`) is presented alongside `"Continue anyway"` / `"Start Listening"`.
- **Step-by-Step Primary Flow**:
  1. Learner selects Track (`Academic` vs `General Training`) and Mode:
     - **Mode A: Exam Simulation**:
       - 4 parts, 40 items, ~30–34 minutes of uninterrupted audio playback.
       - Audio plays strictly once; pause and scrubbing are completely locked (activity-integrity lock).
       - Question palette displays 1–40 items with Answered, Unanswered, and Review Flag states.
       - Concludes with exactly **2-minute final answer-check period** (no 10-minute paper transfer time).
       - Autosave records every input (`IELTS_LISTENING_CHECKPOINT_V1`); crash reload restores exact question and timer.
     - **Mode B: Practice Mode**:
       - Part-by-part selection (e.g. Part 3 academic discussion).
       - Audio scrubber enabled with 5-second rewind and speed controls.
       - Post-attempt transcript reveal toggle with synchronized audio highlight.
       - Instant per-question explanation and scoring.
  2. Upon submission, system computes raw score (out of 40) and converts to estimated IELTS Band (0.0–9.0).
  3. Incorrect items are automatically staged as `ErrorCandidate` records in Error Notebook.
- **Secondary States & Subviews**:
  - `exam_single_play_lock`: Authentic single-play audio state with disabled scrubbing (activity-integrity lock).
  - `2m_check_timer`: Final 2-minute countdown timer dedicated to checking answers.
  - `practice_scrub_bar`: Interactive audio scrubber with A-B loop handles for practice mode.
  - `transcript_reveal_drawer`: Post-submission synchronized transcript view with answer key highlights.
- **Evidence & Schedule Gateway**:
  - Maintains `affectsSchedule: false` and `evidenceEligible: false`. Emits diagnostic score and error records only.

---

### Journey J-09: IELTS Academic Reading Split Runner
- **Owning Screen**: **Screen 9 (IELTS Reading Academic Split Shell)**
- **Learner Persona & Intent**: An Academic candidate completing 3 dense scholarly passages (2,150–2,750 words) and 40 questions within 60 minutes.
- **Entry Point**: `IELTS Hub -> Reading -> Academic` (`#/ielts/reading/academic`).
- **Step-by-Step Primary Flow**:
  1. Learner launches Academic Reading: screen enters authentic computer-delivered split-pane layout.
  2. Left pane displays passage text with paragraph identifiers (A–G); right pane displays interactive question cards and 1–40 question palette.
  3. Learner uses **Draggable Split Divider** to adjust pane widths according to reading preference.
  4. Learner uses in-text **Highlighter Toolbar** to mark key evidence sentences in the passage.
  5. 60-minute countdown timer runs continuously at top; warning badges appear at 10 minutes and 5 minutes remaining.
  6. Learner navigates 15 objective task families (Matching Headings, True/False/NG, Summary Completion).
  7. On time expiry or manual submit, system auto-submits, persists attempt checkpoint, and renders score breakdown.
- **Secondary States & Subviews**:
  - `draggable_split_divider`: Smooth horizontal resize divider with responsive mobile stacking.
  - `highlighter_toolbar`: Text selection popover with highlight color swatches and remove highlight action.
  - `question_palette_drawer`: Compact 1–40 grid showing attempted status and flagged questions.
  - `sync_scroll_indicator`: Synchronizes passage reference anchors with corresponding question cards.
- **Evidence & Schedule Gateway**:
  - Sealed answer keys remain strictly concealed before submission (`KEY_LEAK_BEFORE_SUBMIT === 0`). `affectsSchedule: false`.

---

### Journey J-10: IELTS General Training Reading Split Runner
- **Owning Screen**: **Screen 10 (IELTS Reading General Training Split Shell)**
- **Learner Persona & Intent**: A General Training candidate practicing Sections 1–3 (everyday survival notices, workplace training texts, and general interest article).
- **Entry Point**: `IELTS Hub -> Reading -> General Training` (`#/ielts/reading/gt`).
- **Step-by-Step Primary Flow**:
  1. Learner launches GT Reading: split-pane layout mounts with Section 1 multi-document navigation.
  2. Section 1 presents 2–3 short everyday notices/advertisements with quick tab switcher.
  3. Section 2 presents 2 workplace documents (staff training, company policies).
  4. Section 3 presents a longer general interest text.
  5. 60-minute countdown timer coordinates test pacing.
  6. On submission, raw score converts via official General Training band curve (distinct from Academic curve).
- **Secondary States & Subviews**:
  - `section_1_multi_text_tabs`: Tabbed sub-navigation for short Section 1 and Section 2 workplace texts.
  - `workplace_text_layout`: Clean rendering for timetables, notices, and policy excerpts.
  - `gt_score_converter`: Raw-to-band conversion calibrated specifically for General Training difficulty.
- **Evidence & Schedule Gateway**:
  - Checkpoint persistence in `ieltsTestRuns`; zero FSRS schedule impact (`affectsSchedule: false`).

---

### Journey J-11: IELTS Academic Writing Task 1 Lab
- **Owning Screen**: **Screen 11 (IELTS Writing Academic Task 1 Visual Workspace)**
- **Learner Persona & Intent**: An Academic candidate drafting a 150-word report describing visual data (graph, chart, table, map, or process) within recommended 20 minutes.
- **Entry Point**: `IELTS Hub -> Writing -> Task 1` (`#/ielts/writing/task1`).
- **Step-by-Step Primary Flow**:
  1. `[CURRENT]` Learner opens Task 1: left pane renders structured visual data container (`CAP-022`); right pane renders distraction-free text editor.
  2. `[CURRENT]` Visual container displays chart prompt; `[FUTURE_UX_RESERVED]` visual container renders one of 7 procedural visual configurations (Line Graph, Bar Chart, Pie Chart, Table, Process Diagram, Map / Plan, Mixed Graphics) generated deterministically via local client engines (`FUT-009`).
  3. `[CURRENT]` Learner uses zoom/pan controls to inspect complex chart elements, or toggles **Tabular Data Fallback** for accessible data table inspection.
  4. `[CURRENT]` Learner drafts report in text editor: live word counter updates continuously with under-length warning if $< 150$ words.
  5. `[CURRENT]` Autosave creates immutable revision digests (`learner-text-artifact-revision`) every 30 seconds.
  6. `[CURRENT]` Upon submission, system evaluates 4 writing criteria (TA, CC, LR, GRA) and outputs practice feedback with diagnostic pointers.
- **Secondary States & Subviews**:
  - `chart_zoom_pan_controls`: Interactive canvas/SVG navigation controls for dense multi-series charts (`[CURRENT]`).
  - `table_fallback_toggle`: Accessible semantic HTML table view mirroring chart data (`[CURRENT]`).
  - `live_word_counter`: Real-time word count display with dynamic color indicators (<150w warning) (`[CURRENT]`).
  - `rubric_feedback_modal`: 4-criterion practice report detailing Task Achievement and Coherence strengths and gaps (`[CURRENT]`).
- **Evidence & Schedule Gateway**:
  - Feedback is explicitly labeled `"Estimated Band Score & Practice Feedback — Practice Reference"`. Schedule isolated.

---

### Journey J-12: IELTS Writing Task 2 Lab
- **Owning Screen**: **Screen 12 (IELTS Writing Task 2 Essay Workspace)**
- **Learner Persona & Intent**: A candidate writing a 250-word formal discursive essay on a social or academic prompt within recommended 40 minutes.
- **Entry Point**: `IELTS Hub -> Writing -> Task 2` (`#/ielts/writing/task2`).
- **Step-by-Step Primary Flow**:
  1. Learner opens Task 2: prompt presents topic and instruction type (Agree/Disagree, Discuss Both Views, Problem/Solution).
  2. In Practice Mode, learner opens **Outline Scratchpad Drawer** to map thesis statement, main arguments, and examples.
  3. Learner drafts essay in main editor: word counter tracks progress toward $\ge 250$ words.
  4. Spellcheck and grammar underlines are strictly disabled during Exam Mode to ensure test validity.
  5. On submission, system analyzes text and renders 4-criterion rubric feedback (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).
- **Secondary States & Subviews**:
  - `outline_scratchpad_drawer`: Collapsible planning notepad for essay outlining.
  - `250w_warning_badge`: Visual warning badge indicating under-length penalty risk.
  - `4_criterion_feedback_modal`: Detailed rubric critique with paragraph-level cohesion and vocabulary range analysis.
- **Evidence & Schedule Gateway**:
  - Emits writing error candidates to Error Notebook; zero direct FSRS schedule update.

---

### Journey J-13: IELTS Speaking Guided Practice & Interactive Examiner
- **Owning Screen**: **Screen 13 (IELTS Speaking Center)**
- **Learner Persona & Intent**: A candidate practicing full 3-part speaking under guided prompts or engaging in realtime interactive voice simulation with an AI examiner.
- **Entry Point**: `IELTS Hub -> Speaking` (`#/ielts/speaking`).
- **Step-by-Step Primary Flow**:
  1. Learner selects Speaking Mode:
     - **Mode 1: Guided 3-Part Practice**:
       - *Part 1 (Interview)*: 4–6 familiar topic questions with prompt audio and per-question recording turns.
       - *Part 2 (Cue Card)*: Topic card with 3–4 bullet points, **1-minute countdown prep timer (`PREP_SECONDS = 60`)**, live **Scratch Notes Area** (pinned and editable during prep, visible during speaking), **2-minute speaking countdown timer (`SPEAKING_SECONDS = 120`)** with 1:45 time alert, and 1–2 rounding questions.
       - *Part 3 (Discussion)*: 4–6 abstract analytical discussion prompts extending Part 2.
       - Segment review: Replay recorded audio per question, inspect duration, and retry if desired.
     - **Mode 2: Interactive Speaking Examiner Simulation (`[OWNER_RECONFIRMED_FUTURE]`)**:
       - Realtime voice-to-voice simulated dialogue with natural turn-taking and adaptive follow-up probing.
       - Lifecycle: `connecting` $\to$ `examiner_turn` $\to$ `learner_turn` $\to$ `silence_recovery` $\to$ `follow_up` $\to$ `session_review`.
       - Explicit Disclaimer: `"AI Examiner Simulation is a formative practice tool and is not an official IELTS certification."`
  2. Post-session review generates 4-criterion practice scores (FC, LR, GRA, PR) with strengths and actionable improvement tips.
  3. Learner 1-clicks identified pronunciation or fluency errors to route them to Error Notebook.
- **Secondary States & Subviews**:
  - `part2_prep_timer_scratchpad`: 60s countdown ring with active notes editor.
  - `part2_speaking_warning`: Audible and visual alert at 1:45 remaining.
  - `interactive_examiner_dialogue`: Realtime voice activity visualizer and conversational turn status.
  - `4_criterion_feedback_view`: Comprehensive breakdown across Fluency, Lexical Resource, Grammar, and Pronunciation.
- **Evidence & Schedule Gateway**:
  - All speaking attempts maintain `affectsSchedule: false` and `evidenceEligible: false`.

---

### Journey J-14: IELTS Full Mock Simulation
- **Owning Screen**: **Screen 14 (IELTS Full Mock Exam Shell)**
- **Learner Persona & Intent**: A candidate taking a complete 4-skill timed simulation under strict exam-day pressure to evaluate their composite readiness.
- **Entry Point**: `IELTS Hub -> Full Mock Exam` (`#/ielts/mock`) or direct URL anchor.
- **Learner Agency & Direct Access**:
  - The learner MAY directly enter the Full Mock Simulation at any time without completing `Learn -> Practice -> Mock` in sequence.
  - Progression from Learn to Practice to Mock is a **recommended pedagogical trajectory**, NOT a mandatory unlock chain:
    $$\text{RECOMMENDED\_PROGRESSION} \neq \text{MANDATORY\_UNLOCK\_CHAIN}$$
  - If diagnostic evidence suggests preparatory section practice, the UX surfaces non-blocking suggestions (`"Suggested preparation before Full Mock"`) while always preserving direct action triggers (`"Start Mock"`, `"Continue anyway"`).
- **Step-by-Step Primary Flow**:
  1. Learner enters Full Mock: interface enters full-screen simulation mode with complete OmniIELTS chrome removal (activity-integrity lock).
  2. Pre-exam equipment check validates headphones, microphone, and audio levels.
  3. **Authentic LRW Test Session Simulation**:
     - *Section 1: Listening*: ~30–34 minutes audio + 2-minute answer-check period. Single-play only.
     - *Transition*: Authentic test instruction screen and section confirmation.
     - *Section 2: Reading*: 60 minutes, 3 passages/sections, 40 items.
     - *Transition*: Writing prompt overview.
     - *Section 3: Writing*: 60 minutes combined shared timer for Task 1 and Task 2.
  4. **Speaking Practice / Examiner Component**:
     - Completed immediately following LRW or scheduled as an independent simulation component.
  5. Crash / Reload Recovery: If browser refreshes, system detects active session in `ieltsMockRuns` and resumes exact section, question, and elapsed timer without loss.
  6. Final Composite Scorecard: Calculates individual skill band estimates and overall composite band score following official IELTS half-band rounding rules.
  7. 1-click diagnostic handoff routes all mock mistakes into Error Notebook and generates a personalized remediation plan.
- **Secondary States & Subviews**:
  - `equipment_mic_check`: Pre-flight audio and hardware verification screen.
  - `authentic_transition_screen`: Standard official computer-delivered section transition instructions.
  - `reload_recovery_banner`: Seamless resume prompt on accidental tab closure or browser crash.
  - `final_multi_skill_scorecard`: Composite score report detailing Listening, Reading, Writing, Speaking bands and overall estimate.
  - `remediation_plan_handoff`: 1-click export of mock diagnostic findings to Today Command Center.
- **Evidence & Schedule Gateway**:
  - Mock runs generate diagnostic and summative performance estimates (`affectsSchedule: false`, `evidenceEligible: false`), keeping FSRS schedules completely unpolluted.

---

### Journey J-15: Settings, Privacy, AI Consent & Data Safety
- **Owning Screen**: **Screen 15 (Settings, AI & Data Safety Dashboard)**
- **Learner Persona & Intent**: A student managing their learning preferences, granting/revoking cloud AI consent, entering ephemeral API keys, and creating full data backups.
- **Entry Point**: `Nav: Settings` (`#/settings`) or Navigation Rail Dock.
- **Step-by-Step Primary Flow**:
  1. Learner opens Settings to adjust target retention ($R$), daily card limits, or TTS voices.
  2. Learner opens **AI Consent Gateway**: inspects plain-language privacy explanation and opts in/out of external AI features.
  3. If opt-in, learner enters ephemeral API key: system confines key strictly to in-memory `sessionStorage` (zero persistence to disk or backup files; `CAP-044`).
  4. Learner checks **Desktop ASR Companion Bridge**: verifies connection status to local Whisper instance (`CAP-040`).
  5. Learner navigates to **Data Safety**: clicks `"Export Full JSON Backup"` to download complete database snapshot with SHA-256 digest covering 100% of 59 IndexedDB stores (`CAP-042`).
  6. Learner tests restore: drags backup file into dropzone; pre-flight schema validator verifies integrity before atomic restore execution.
  7. Learner opens **System & Governance Inspector** (Settings -> About) to view runtime package milestones and commit provenance (`CAP-038`).
- **Secondary States & Subviews**:
  - `ai_consent_modal`: Plain-language privacy modal with 1-click immediate consent revocation (`CAP-039`).
  - `ephemeral_key_form`: Session-only API key entry with visible security badge.
  - `desktop_asr_status_badge`: Live bridge monitor showing Connected, Disconnected, or WASM fallback.
  - `backup_export_button`: Single-click JSON database serialization with cryptographic checksum.
  - `restore_preflight_validator`: Schema compatibility and digest verification modal prior to database restore.
  - `system_governance_audit`: In-app audit log displaying active package deliveries and wave integrity.
- **Evidence & Schedule Gateway**:
  - Backup and restore preserve 100% of learner history, attempt receipts, and FSRS parameters with full database consistency.

---

## 4. Cross-Journey Patterns & Secondary Subviews

### 4.1 Global Search & Resource Discovery (`Ctrl+K`)
- **Nature**: Global Cross-Journey Pattern (`FUT-012`).
- **Interaction**: Triggered via `Ctrl+K` from any non-exam screen. Opens modal overlay with instant fuzzy search across vocabulary cards, video transcripts, reading passages, and study notes. Keyboard navigation (`Up`/`Down`/`Enter`) jumps directly to source context.

### 4.2 Interactive Lexical Knowledge Graph
- **Nature**: Secondary Explorer Subview in `Library / Knowledge` (`FUT-013`).
- **Interaction**: Launched from Vocabulary Bank. Visualizes semantic word families, collocations, and synonym networks in an interactive 2D graph. Selecting any node exposes definitions, examples, and 1-click capture.

### 4.3 Signed Content Catalog & Pack Manager
- **Nature**: Secondary Asset Manager Subview in `Library / Content Packs` (`CAP-036`, `CAP-037`).
- **Interaction**: Browse verified lesson packs with Ed25519 cryptographic trust badges. 1-click install with progressive download progress. 1-click update check. Safe deletion retaining learner study history and attempt receipts.

---

## 5. 15 Core Screen Classes & Secondary-State Mapping

| SCREEN CLASS | PRIMARY SCREEN NAME | OWNING JOURNEY | PRIMARY VIEWPORT COMPONENT | REQUIRED SECONDARY STATES, VARIANTS & SUBVIEWS |
|---|---|---|---|---|
| **Screen 1** | **Today / Command Center** | `J-01` | Daily study card, review queue counter, streak card, next action launcher | `backlog_catchup_triage`, `workload_estimator_drawer`, `provisional_grace_freeze_badge`, `quick_micro_drill_overlay` |
| **Screen 2** | **Vocabulary Spaced Review** | `J-02` | Cued recall card, FSRS rating buttons (1–4), audio trigger, interval preview | `card_flip_reveal`, `4_tier_feedback_card` (Verify, Elaborate, Refute, Scaffold), `edit_card_modal`, `suspend_card_toggle` |
| **Screen 3** | **Video & Media Study Workspace** | `J-03` | Responsive video player, synchronized transcript rail, 7-step loop toolbar | `strict_dictation_view` (DOM masked), `practice_dictation_view` (hints), `noticing_ipa_drawer`, `waveform_recording_view`, `retell_journal_view`, `transcript_slicer_drawer`, `topic_chapters_bar` |
| **Screen 4** | **Article & Passage Reader** | `J-04` | Clean typography reader, layout navigation, in-text word highlight | `document_dropzone_uploader`, `parsing_progress_indicator`, `cefr_level_pill_breakdown`, `in_text_capture_popover`, `cloze_exercise_view` |
| **Screen 5** | **Unified Capture Inbox** | `J-05` | Staged capture table, context snippet, lemma, part-of-speech, CEFR pill | `mobile_bottom_sheet`, `in_line_editor`, `batch_selection_toolbar`, `5s_undo_toast` |
| **Screen 6** | **Error Notebook & Weaknesses** | `J-06` | 23-category error heatmap grid, recurrence decay filter, mistake cards | `error_context_drawer`, `refutational_explanation_view`, `targeted_remediation_launcher`, `resolved_filter_tab` |
| **Screen 7** | **Multi-Dimensional Analytics** | `J-07` | Tri-dimensional state ($R$, Mastery Estimate, Band Estimate), Skill radar, 52w grid | `fsrs_stability_decay_curve`, `radar_confidence_bounds`, `exam_pacing_calculator`, `attempt_provenance_audit_drawer` (9 fields) |
| **Screen 8** | **IELTS Listening Runner** | `J-08` | 4-part audio player, 40-item question container, question palette | **Exam**: `single_play_lock`, `2m_check_timer`. **Practice**: `scrub_enabled`, `transcript_reveal_drawer`, `instant_feedback_card` |
| **Screen 9** | **IELTS Reading Academic Split** | `J-09` | 3 academic passages, split-pane layout with draggable bar, question list | `draggable_split_divider`, `highlighter_toolbar`, `question_palette_drawer`, `paragraph_quick_jump`, `passage_explanation_popover` |
| **Screen 10** | **IELTS Reading GT Split** | `J-10` | 3 GT sections (workplace/social), multi-document tabs, split-pane | `section_1_multi_text_tabs`, `workplace_text_layout`, `highlighter_toolbar`, `gt_score_converter` |
| **Screen 11** | **IELTS Writing Task 1 Lab** | `J-11` | Task prompt, deterministic chart container, 150w distraction-free editor | `chart_zoom_pan_controls`, `tabular_data_fallback_toggle`, `live_word_counter`, `150w_warning_badge`, `rubric_feedback_modal` |
| **Screen 12** | **IELTS Writing Task 2 Lab** | `J-12` | Discursive essay prompt, 250w text editor, structure notes scratchpad | `outline_scratchpad_drawer`, `live_word_counter`, `250w_warning_badge`, `rubric_self_check_sheet`, `4_criterion_feedback_modal` |
| **Screen 13** | **IELTS Speaking Center** | `J-13` | 3-part guided launcher, audio recorder, cue card display, notes scratchpad | `part1_interview_flow`, `part2_prep_timer_scratchpad`, `part2_speaking_warning`, `part3_discussion_flow`, `interactive_examiner_dialogue`, `4_criterion_feedback_view` |
| **Screen 14** | **IELTS Full Mock Exam Shell** | `J-14` | Fullscreen simulation, 4-skill sequential test engine, timer coordination | `equipment_mic_check`, `authentic_transition_screen`, `reload_recovery_banner`, `final_multi_skill_scorecard`, `remediation_plan_handoff` |
| **Screen 15** | **Settings, AI & Data Safety** | `J-15` | Preferences, voice selector, privacy opt-in, backup export/restore | `ai_consent_modal`, `ephemeral_key_form`, `desktop_asr_status_badge`, `backup_export_button`, `restore_preflight_validator`, `system_governance_audit` |

---

## 6. Downstream Wave Handoffs (W2–W6) & Governance Boundaries

- **Wave W1 (Information Architecture & User Journeys)**: Encoded navigation freedom, direct-access relationships, and the recommended-vs-required distinction across all 15 core journeys.
- **Wave W2 (Interaction Architecture & State Machines)**: Translate the 15 core journeys and their secondary states into formal state machines, transition guards, explicit `Skip` / `Change Activity` / `Exit` states, and Assistance Contracts without creating navigation barriers.
- **Waves W3–W5 (Wireframe Blueprints, Design System & Hi-Fi UI Specs)**: Produce viewable wireframes and visual specs that clearly distinguish Recommended actions from Locked/Unavailable states; strictly avoid visual patterns (e.g. padlock icons, disabled tabs) that imply false curriculum prerequisite locks.
- **Wave W6 (Interactive Cross-Surface Prototype & Exit Report)**: Deliver clickable prototype validating the 15 user journeys end-to-end, confirming learner agency across all surfaces.
- **Stage 5 Boundary**: Stage 5 owns research and benchmark packages for candidate recommendation and adaptive technologies; no adaptive engine technology is prematurely selected in Stage 4 design.
- **Stage 6 Boundary**: Implementation of navigation, workspaces, and UI runners proceeds strictly under later authorized wave manifests.
