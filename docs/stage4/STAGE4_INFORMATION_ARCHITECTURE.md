# STAGE 4 INFORMATION ARCHITECTURE & NAVIGATION SPECIFICATION

**Document Identity**: `STAGE4-INFORMATION-ARCHITECTURE-V1`  
**Governing Ratification**: `STAGE4-W1-IA-JOURNEYS-001` (G1 Design Gate Ratified by Human Owner)  
**Controlling Authorization Manifest**: [`docs/authorizations/STAGE4-UXIA-AUTH-001.md`](../authorizations/STAGE4-UXIA-AUTH-001.md)  
**Controlling Strategy**: [`docs/stage4/STAGE4_UXIA_STRATEGY.md`](STAGE4_UXIA_STRATEGY.md)  
**Status**: `CANDIDATE_INFORMATION_ARCHITECTURE / PENDING_INDEPENDENT_AUDIT`  
**Document Role**: Canonical Stage 4 Information Architecture & Navigation Grammar Specification (subordinate to repository authority hierarchy under [`AGENTS.md`](../../AGENTS.md))  

---

## 1. Executive Summary & Architectural Invariants

`[FACT]` This specification establishes the unified Information Architecture (IA), Navigation Grammar, and Capability Preservation routing for OmniIELTS under Stage 4 Wave W1.

### Non-Negotiable Architectural Invariants
1. **Zero Silent Capability & UX Behavior Deletions**:
   $$\text{CAPABILITY\_PRESERVED} \neq \text{USER\_EXPERIENCE\_PRESERVED}$$
   $$\text{ZERO\_SILENT\_CAPABILITY\_DELETION} + \text{ZERO\_SILENT\_UX\_BEHAVIOR\_DELETION}$$
   Every materially existing product capability (48 / 48) in `NguyenDukKyeon/Omni-IELTS` is cataloged and preserved across the 5 pillars without control loss, state compression, or learning-loop degradation.
2. **Current vs Future Epistemic Separation**:
   Every material node in the IA explicitly declares its implementation status:
   - `[CURRENT]`: Active production code verified in `src/**` and passing automated test suites.
   - `[CURRENT_REHOMED]`: Active capability consolidated or moved into a unified top-level home.
   - `[STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION]`: Stage 4 product curriculum and instruction requirement; not currently implemented in runtime code.
   - `[FUTURE_UX_RESERVED]`: Accepted Stage 3 research requirement assigned an explicit UX home; technology and implementation owned by Stage 5/6.
   - `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]`: Advanced visualization or estimation capability with basic current substrate.
   - `[OWNER_RECONFIRMED_FUTURE]`: Human Owner reconfirmed product capability (technology owned by Stage 5).
   - `[BACKGROUND_SYSTEM]`: Headless runtime engine, persistence worker, or safety gate.
3. **Mandatory Dual Experience Architecture**:
   $$\text{OMNIIELTS\_LEARNING\_UI} \neq \text{IELTS\_EXAM\_SIMULATION\_UI}$$
   Exam Simulation modes strictly suppress all application navigation chrome, AI coaching, learning scaffolds, in-line hints, and transcripts.
4. **Three-Way Pedagogical Boundary**:
   $$\text{LEARN\_A\_SKILL} \neq \text{PRACTICE\_A\_SKILL} \neq \text{TAKE\_AN\_EXAM}$$
   The architecture preserves a complete cognitive progression:
   $$\text{Curriculum / Worked Example} \longrightarrow \text{Formative Check} \longrightarrow \text{Section Practice} \longrightarrow \text{Performance Evidence} \longrightarrow \text{Error Diagnosis} \longrightarrow \text{Remediation} \longrightarrow \text{Retry}$$
5. **Learner-Model Construct Neutrality**:
   $$\text{MEMORY\_RETENTION} \neq \text{SKILL\_MASTERY} \neq \text{DIAGNOSTIC\_ERROR\_STATE} \neq \text{PERFORMANCE\_ESTIMATE} \neq \text{TRANSFER}$$
   Zero product-facing commitments to internal psychometric formulas ($P(L)$, $\theta$, BKT/IRT/CAT equations). UI cleanly displays Memory Retention ($R$), Skill Mastery Estimate + Uncertainty, IELTS Practice Performance Estimate + Confidence, Diagnostic Weakness State, and Transfer Evidence.
6. **Evidence Gateway Integrity**:
   Full Mock Exams and Section Practice runs operate under `affectsSchedule: false` and `evidenceEligible: false` (ADR-004, ADR-050). Practice results yield diagnostic and summative performance estimates, never direct FSRS schedule mutations.

---

## 2. Complete 5-Pillar Information Architecture

```text
OMNIIELTS UNIFIED 5-PILLAR ARCHITECTURE
├── 1. HOME / TODAY (Daily Command Center)
│   ├── [CURRENT] Today Spaced Review Runner (FSRS 5-Skill Due Queue)
│   ├── [FUTURE_UX_RESERVED] Review Backlog Triage Gateway (Catch-up Mode vs Full Due Queue)
│   ├── [CURRENT] Quick Practice Station (Micro-Drills: Vocab, Listening, Grammar)
│   ├── [CURRENT] Habit & Streak Card
│   ├── [FUTURE_UX_RESERVED] Non-Punitive Streak Grace Freeze Indicator (1-Day Provisional)
│   └── [CURRENT] Next Recommended Action (Weakness-driven Remediation Launcher)
│
├── 2. LEARN / WORKSPACES (Dedicated Acquisition & Skills Labs)
│   ├── Video & Media Study Workspace
│   │   ├── [CURRENT] 6 Core Study Modes (Normal, Noticing, Shadowing, Strict Dictation, Practice Dictation, Retell)
│   │   ├── [CURRENT] 7-Step Sentence Learning Loop Toolbar
│   │   ├── [CURRENT] Synchronized Transcript Rail with Sentence Auto-Scroll
│   │   ├── [CURRENT] Contextual Audio Controls (0.75x–1.25x Speed, A-B Repeat, Scrubbing)
│   │   ├── [CURRENT] Suffix Deduplication & Caption Normalization View
│   │   ├── [CURRENT] Transcript Slicing & Cue Editor Drawer
│   │   ├── [FUTURE_UX_RESERVED] Neural Sentence Boundary Chunking Indicator
│   │   ├── [FUTURE_UX_RESERVED] Overlapping-Speaker Multi-Lane Representation
│   │   ├── [FUTURE_UX_RESERVED] Semantic Topic & Chapter Navigation Bar
│   │   └── [FUTURE_UX_RESERVED] Automated Collocation Highlight & 1-Click Capture Popover
│   ├── Reading & Text Reader Workspace
│   │   ├── [CURRENT_REHOMED] Document Reader (Private Library / Pasted Texts)
│   │   ├── [CURRENT] Layout Navigation & Paragraph Highlighting
│   │   ├── [CURRENT] In-Text Word & Phrase Discovery Popover
│   │   ├── [FUTURE_UX_RESERVED] Multi-Format Layout Parser (PDF, EPUB, DOCX Dropzone)
│   │   ├── [FUTURE_UX_RESERVED] CEFR Readability Level Pill & Lexical Profile Chart
│   │   └── [FUTURE_UX_RESERVED] Automated Reading Cloze & Retrieval Check Generator
│   ├── Writing Lab
│   │   ├── [CURRENT] Guided Writing Editor (Distraction-Free, Live Word Count, Autosave)
│   │   ├── [CURRENT] 4-Criterion Rubric Self-Check & Formative Feedback Card
│   │   ├── [FUTURE_UX_RESERVED] 2-Stage Feedback Surface (Offline Underline Linting + On-Demand AI Review)
│   │   └── [CURRENT] Essay Outline & Structure Scratchpad
│   └── Speaking Lab
│       ├── [CURRENT] Pronunciation & Shadowing Station (Web Audio Waveform, Native vs Learner Playback)
│       ├── [CURRENT] Noticing & Thought Groups Drawer (IPA, Weak Forms, Stress Chunks)
│       └── [CURRENT] Guided Oral Retell Workspace (Draft Journaling Recovery)
│
├── 3. IELTS HUB (Official Preparation & Exam Simulation)
│   ├── [CURRENT] Global Track Switcher (Academic Track ↔ General Training Track)
│   ├── [STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION] IELTS Skills Curriculum
│   │   ├── [STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION] Listening Knowledge & Skills Module
│   │   ├── [STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION] Reading Knowledge & Skills Module
│   │   ├── [STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION] Writing Knowledge & Skills Module
│   │   ├── [STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION] Speaking Knowledge & Skills Module
│   │   ├── [STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION] Lexical Resource & Topic Collocation Sets
│   │   ├── [STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION] Grammatical Range & Accuracy Masterclasses
│   │   └── [STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION] Cross-Cutting IELTS Exam Strategies & Worked Examples
│   ├── IELTS Listening Center
│   │   ├── [CURRENT] Computer Listening Exam Runner (4 Parts, 40 Items, ~30–34m Audio, 2m Check, Single-Play)
│   │   └── [CURRENT] Listening Practice Mode (Part Selection, Audio Scrub, Transcript Reveal, Instant Check)
│   ├── IELTS Reading Center
│   │   ├── [CURRENT] Academic Reading Split-Pane Runner (3 Passages, 40 Items, 60m Timer, Highlighter)
│   │   ├── [CURRENT] GT Reading Split-Pane Runner (Sections 1–3 Workplace/Social Texts, 60m Timer)
│   │   └── [CURRENT] Reading Practice Mode (Per-Passage Check, Instant Explanation Toggles)
│   ├── IELTS Writing Center
│   │   ├── [CURRENT] Academic Task 1 Visual Workspace (Deterministic SVG/Canvas Chart Container + Table Fallback)
│   │   ├── [CURRENT] GT Task 1 Letter Workspace (Situation Prompt + 3 Bullet Checklist)
│   │   ├── [CURRENT] Task 2 Discursive Essay Workspace (Prompt, Live Word Count, 250w Minimum Warning)
│   │   ├── [CURRENT] Full Writing Test Mode (Combined Task 1 + Task 2 under 60-minute shared timer)
│   │   └── [CURRENT] 4-Criterion Rubric Feedback & Practice Band Estimation
│   ├── IELTS Speaking Center
│   │   ├── [CURRENT] Guided 3-Part Practice (Part 1 Interview, Part 2 Cue Card + Scratchpad, Part 3 Discussion)
│   │   ├── [CURRENT] Self-Record & Review Station (Per-Question Audio Capture, Waveform, Segment Replay)
│   │   ├── [OWNER_RECONFIRMED_FUTURE] Interactive Speaking Examiner Simulation (Realtime Voice Dialogue)
│   │   ├── [CURRENT] 4-Criterion Speaking Practice Feedback (FC, LR, GRA, PR Diagnostic Scores)
│   │   └── [CURRENT] Official-Fidelity Disclaimer Boundary
│   ├── [CURRENT] Section Practice Hub (15 Objective Task Families Launcher)
│   └── [CURRENT] IELTS Full Mock Simulation Orchestrator
│       ├── [CURRENT] Fullscreen Test Environment (Complete OmniIELTS Chrome Suppression)
│       ├── [CURRENT] Authentic LRW Test Session Simulation (Listening → Reading → Writing)
│       ├── [CURRENT] Speaking Practice / Examiner Simulation Component
│       ├── [CURRENT] Section Transition States & Hardware Checks
│       ├── [CURRENT] Reload & Crash Recovery (Exact Item, Timer, and Response Restoration)
│       └── [CURRENT] Post-Exam Multi-Skill Scorecard & Diagnostic Remediation Handoff
│
├── 4. KNOWLEDGE & LIBRARY (Learner Assets & Curriculum)
│   ├── Vocabulary & Collocation Bank
│   │   ├── [CURRENT] Search, Advanced Filters, and CEFR Difficulty Ordering
│   │   ├── [CURRENT] Card Lifecycle Status Manager (New, Learning, Review, Mastered, Suspended)
│   │   └── [CURRENT] Lexical Relations Drawer (Synonyms, Collocations, Example Sentences, Audio)
│   ├── [FUTURE_UX_RESERVED] Interactive Lexical Knowledge Graph Explorer
│   ├── [CURRENT] Unified Capture Inbox (Staged Items, Context Sentences, Batch Confirm/Discard)
│   ├── [CURRENT] Error Notebook & Weakness Map (23 ERRANT-Aligned Categories + Remediation Links)
│   ├── [CURRENT_REHOMED] Private Source Library (PDF/EPUB/SRT Ingestion, Saved Videos, Reading Notes)
│   └── [CURRENT] Signed Content Platform (Ed25519 Verified Catalog, Pack Installer/Updater)
│
└── 5. ANALYTICS & SETTINGS (System Governance & Data Safety)
    ├── Multi-Dimensional Profile
    │   ├── [CURRENT] Retention, Activity & Progress Analytics (`CAP-013` / `src/progress.js`)
    │   ├── [CURRENT] Diagnostic Weakness History & Error Categorization (`CAP-014` / `src/weakness-profile.js`)
    │   ├── [CURRENT] 52-Week Activity Grid & Habit Status (`src/progress.js`)
    │   ├── [FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED] Full 5-Skill Competence Radar with Confidence Bounds
    │   ├── [FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED] Calibrated Skill Mastery Estimate + Uncertainty
    │   ├── [FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED] Cross-Skill IELTS Performance Estimate + Confidence
    │   ├── [FUTURE_UX_RESERVED] Future Multi-Model Learner State Projection
    │   └── [FUTURE_UX_RESERVED] Contextual Attempt Provenance Audit Drawer (9 Contextual Fields)
    ├── System Preferences & AI Consent Gateway
    │   ├── [CURRENT] Learning Preferences (Daily Limits, Target Retention, Audio Pitch/Rate)
    │   ├── [CURRENT] AI Consent Receipt Modal (Plain-Language Opt-In, 1-Click Revocation)
    │   ├── [CURRENT] Ephemeral API Key Management (`sessionStorage` Confinement, Zero Disk Leak)
    │   └── [CURRENT] Desktop ASR Companion Bridge Monitor (Whisper Connection Status)
    └── Data Safety & Governance
        ├── [CURRENT] Backup Registry (100% Store Coverage Full JSON Export & Pre-Flight Validation)
        ├── [BACKGROUND_SYSTEM] Interrupted Restore Auto-Recovery Write-Ahead Journal
        ├── [CURRENT] Non-Blocking Boot Error Reporter & Diagnostic Log Export
        ├── [CURRENT] Core-Only Degraded Storage Global Notice Banner
        └── [CURRENT] System & Roadmap Runtime Inspector (Settings -> About)
```

---

## 3. Responsive Navigation Grammar

### 3.1 Desktop Navigation Structure
1. **Primary Left Navigation Rail (Collapsible)**:
   - Fixed anchors to the 5 primary pillars:
     - `Today`: Command Center (`#/today`)
     - `Learn`: Workspaces & Skills Labs (`#/learn`)
     - `IELTS`: Preparation, Curriculum & Simulations (`#/ielts`)
     - `Library`: Knowledge Assets, Errors & Catalog (`#/library`)
     - `Analytics`: Profile, Progress & Settings (`#/analytics`)
2. **Global Utility Dock**:
   - Located at the bottom of the navigation rail:
     - `Global Capture Action`: Staged capture overlay (Shortcut: `W2_TBD`).
     - `Global Search`: Instant fuzzy search modal (`Ctrl+K`).
     - `Settings`: Preferences, AI consent, backups (`#/settings`).
3. **Contextual Media Audio Controller**:
   - **Contextual Rule**: Visible **ONLY WHEN AN ACTIVE MEDIA/AUDIO SESSION EXISTS**.
   - **Resting State**: When no audio/video is playing, zero player chrome is rendered (prevents interface pollution).
   - **Active State**: Floats docked at the bottom of the main viewport with scrub bar, rate toggle (0.75x–1.25x), and A-B loop controls.
   - **Exam Mode Suppression**: 100% suppressed during IELTS Exam Simulation Mode.
4. **Exam Simulation Shell**:
   - **Complete Chrome Removal**: Global navigation rail, headers, search triggers, and floating audio controllers are completely unmounted.
   - **Minimalist Exam Header**: Displays strictly test timer, active track badge, question palette trigger, and section submission button.

### 3.2 Mobile Navigation Structure
1. **Fixed Bottom Navigation Bar**:
   - 5 primary touch targets: `Today`, `Learn`, `IELTS`, `Library`, `Progress`.
   - Touch targets meet minimum 48×48px accessible touch bounds.
2. **Docked Contextual Audio Controller**:
   - When active media exists, the mini-player docks strictly above the bottom navigation bar within the safe area.
3. **Responsive Drawers & Bottom Sheets**:
   - Complex panels (Transcript Rails, Question Palettes, Notes Scratchpads, Error Context Cards) render as swipeable bottom sheets (`Swipe Up` to expand, `Swipe Down` to dismiss).

---

## 4. First-Class IELTS Skills Curriculum Architecture

`[STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION]`  
The IELTS Skills Curriculum is a dedicated instructional system structured across 7 key domains:

```text
IELTS SKILLS CURRICULUM ARCHITECTURE
├── 1. Listening Skills Curriculum
│   ├── Conversational Dialogue Decoding (Part 1 Social contexts, number/spelling precision)
│   ├── Monologue Structure & Signposting (Part 2 Guidance & facilities, spatial orientation)
│   ├── Academic Discussion & Speaker Perspective (Part 3 Multi-speaker stance, consensus)
│   └── Academic Lecture Comprehension (Part 4 Dense conceptual monologue, note-taking)
│
├── 2. Reading Skills Curriculum
│   ├── Skimming for Main Ideas & Macro-Structure (Academic & GT Section 3 texts)
│   ├── Scanning for Specific Facts & Numerical Data
│   ├── Paragraph Heading Matching & Topic Sentence Identification
│   └── Discerning Writer Stance: True / False / Not Given vs Yes / No / Not Given
│
├── 3. Writing Skills Curriculum
│   ├── Academic Task 1 Data Language: Trend verbs, degree adverbs, comparative structures
│   ├── Academic Task 1 Visual Family Grammar: Line, Bar, Pie, Table, Process, Map, Mixed
│   ├── General Training Task 1: Letter register (Formal vs Semi-formal vs Informal), tone, bullet coverage
│   └── Task 2 Essay Architectures: Opinion, Discussion, Advantages/Disadvantages, Problem/Solution
│
├── 4. Speaking Skills Curriculum
│   ├── Part 1 Fluency & Topic Expansion (Avoiding 1-word answers, natural connectors)
│   ├── Part 2 Long Turn Structuring: 1-min prep note frameworks, narrative arc, time management
│   ├── Part 3 Analytical Discourse: Abstract reasoning, speculation, evaluating societal impact
│   └── Pronunciation & Suprasegmentals: Thought groups, sentence stress, intonation patterns
│
├── 5. Lexical Resource & Topic Collocation Sets
│   ├── Academic Word List (AWL) & Band 7+ Lexical Bundles
│   └── Topic Sets: Environment, Technology, Education, Globalization, Health, Crime
│
├── 6. Grammatical Range & Accuracy Masterclasses
│   ├── Complex Sentence Subordination (Adverbial, Relative, Noun clauses)
│   ├── Passive Voice for Process Description & Impersonal Academic Style
│   └── Modal Verbs of Speculation and Conditional Structures
│
└── 7. Cross-Cutting Strategy & Exam Masterclasses
    ├── Time Allocation Strategies (Writing 20m/40m pacing, Reading 20m per passage)
    ├── Error Avoidance & Transferred Spelling Rules
    └── Worked Examples Fading: Model Analysis → Guided Reconstruction → Independent Trial
```

---

## 5. Source-to-Learning Pipeline Architecture

The Source-to-Learning architecture integrates private materials into active study:

```text
SOURCE-TO-LEARNING INSTRUCTIONAL LIFECYCLE:
1. INGESTION (Library -> Sources):
   [CURRENT] File Ingestion: PDF, EPUB, SRT, Text (`CAP-011` / `src/private-source-library-ui.js`)
   [CURRENT] Saved Video Transcripts & URL Ingestion
   [FUTURE_UX_RESERVED] Multi-Format Layout Parser (PDF, EPUB, DOCX Dropzone)

2. ACTIVE READING (Learn -> Reading Workspace):
   [CURRENT] High-legibility typography, split view, paragraph highlighter
   [CURRENT] In-text word selection & lexical lookup popover
   [FUTURE_UX_RESERVED] CEFR difficulty rating pill (A1–C2) and lexical frequency distribution chart

3. DISCOVERY & CAPTURE (Global Quick Capture / Inbox):
   [CURRENT] 1-Click capture of term, definition, audio, sentence context, and source link into Inbox

4. ACTIVE RETRIEVAL & PRACTICE GENERATION (Learn -> Reading Practice):
   [CURRENT] Manual flashcard practice from source vocabulary
   [FUTURE_UX_RESERVED] Automated Cloze and Comprehension Question generation from imported text

5. LONG-TERM RETENTION REINFORCEMENT (Home -> Today):
   [CURRENT] Captured terms graduate from Inbox into active FSRS 5-Skill Spaced Repetition queue
```

---

## 6. Three-Way Boundary Specification: Learn vs Practice vs Mock

| DIMENSION | 1. LEARN WORKSPACES (`#/learn`) | 2. SECTION PRACTICE (`#/ielts/practice`) | 3. EXAM & FULL MOCK (`#/ielts/mock`) |
|---|---|---|---|
| **Primary Goal** | Knowledge acquisition, worked examples, scaffolding | Formative mastery on specific task families | Summative evaluation under authentic time pressure |
| **Application Chrome** | Full 5-pillar navigation, sidebar, contextual audio | IELTS header, track toggle, back breadcrumbs | **Zero Chrome** (Minimalist exam header only) |
| **Audio Controls** | Play, pause, scrub, 0.75x–1.25x speed, A-B loop | Play, pause, 5s rewind, scrub (Practice mode) | **Single-play only**, uninterrupted, zero scrub |
| **Transcripts & Hints** | Full transcript rail, noticing, IPA, hints | Transcript reveal toggle (after attempt) | **Strictly prohibited**; zero hints, zero scripts |
| **Feedback Timing** | Immediate (Step-by-step 4-tier feedback) | Per-question or per-section check | **Deferred until complete test submission** |
| **Time Pressure** | Untimed / self-paced | Optional timer with pacing helper | **Strict official countdown timer** with auto-submit |
| **Scoring & Rubrics** | Formative coaching & worked examples | Section score + detailed explanations | Formal diagnostic scorecard (Practice estimate) |
| **Evidence Gateway** | Formative; FSRS stability update suppressed | `affectsSchedule: false`, `evidenceEligible: false` | `affectsSchedule: false`, `evidenceEligible: false` |

---

## 7. Comprehensive Speaking Architecture

```text
IELTS SPEAKING ARCHITECTURE (Screen 13 + Subviews)
├── 1. GUIDED 3-PART PRACTICE [CURRENT]
│   ├── Part 1 (Interview): 4–6 familiar topic questions, audio prompts, automated recording turns
│   ├── Part 2 (Cue Card): Task card, 1-min prep timer, live scratch notes, 2-min recording, 1:45 time alert
│   ├── Part 3 (Discussion): 4–6 abstract analytical prompts extending Part 2 themes
│   └── Audio Replay & Review: Per-question segment playback, waveform, retry option
│
├── 2. SELF-RECORD & REVIEW STATION [CURRENT]
│   ├── Free-form audio capture with real-time Web Audio waveform & volume level meter
│   ├── Side-by-side comparison: Native reference audio vs learner recording
│   └── Segment export / playback review
│
├── 3. INTERACTIVE SPEAKING EXAMINER SIMULATION [OWNER_RECONFIRMED_FUTURE]
│   ├── Authority Source: Human Owner Reconfirmation in STAGE4-W1-IA-JOURNEYS-001
│   ├── Technology-Neutral Interaction States:
│   │   ├── `connecting`: Audio handshake, microphone permission, silence threshold init
│   │   ├── `examiner_turn`: Synthesized/streamed examiner prompt audio presentation
│   │   ├── `learner_turn`: Candidate speech capture with real-time speech activity visualizer
│   │   ├── `silence_recovery`: Polite examiner prompt on prolonged silence (>5s)
│   │   ├── `follow_up`: Adaptive probing question based on candidate discourse
│   │   └── `session_review`: Post-session transcription & rubric evaluation handoff
│   ├── Stage 5 Candidate Provenance: Gemini Live / Realtime API (Winner: NOT_SELECTED)
│   └── Official-Fidelity Disclaimer:
│       "AI Examiner Simulation is a formative practice tool and is not an official IELTS certification."
│
└── 4. POST-SESSION DIAGNOSTIC & REMEDIATION [CURRENT]
    ├── 4-Criterion Rubric Breakdown: Fluency & Coherence [FC], Lexical Resource [LR],
    │   Grammatical Range & Accuracy [GRA], Pronunciation [PR]
    ├── Strengths & Actionable Improvement Cards
    ├── 1-Click Error Candidate Emission to Error Notebook (`speaking-fluency`, etc.)
    └── Recommended Remediation Drills routed to Today Command Center
```

---

## 8. Capability Preservation & Stage 3 Handoff Summary

### 8.1 48/48 Current Capability Preservation Baseline
All 48 current material capabilities cataloged in [`docs/stage4/STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`](STAGE4_CAPABILITY_PRESERVATION_MATRIX.md) are verified and preserved:
- `CAP-001` to `CAP-016`: Core Learning, FSRS 5-Skill Memory, Sentence Loop, Audio & Capture.
- `CAP-017` to `CAP-035`: IELTS Platform (Listening, Reading, Writing, Speaking, Mock, 15 Objective Task Families).
- `CAP-036` to `CAP-048`: Signed Content Catalog, Offline Lifecycle, Backup Registry, Privacy/Consent, and System Resilience.

### 8.2 20/20 Stage 3 Future UX Handoffs
- `FUT-001` to `FUT-004`: Sentence Boundary Chunking, Punctuation Restoration, Overlapping Speakers, Topic Chapters.
- `FUT-005` to `FUT-008`: Automated Collocations, CEFR Leveling, Offline Grammar Linting, Automated Distractors.
- `FUT-009`: Deterministic Writing Task 1 Visual System (7 visual configurations, local SVG/Canvas renderer).
- `FUT-010` to `FUT-013`: Web Audio VAD, Structured PDF/EPUB Parser, Global Client Search (`Ctrl+K`), Lexical Graph Explorer.
- `FUT-014` to `FUT-017`: Multi-Model Learner State, Multi-Layer Identity, 9 Provenance Fields, 4-Tier Refutational Feedback.
- `FUT-018` to `FUT-020`: Backlog Triage, 1-Day Grace Freeze, Unified Database Storage.

---

## 9. Owner Decision Ledger Routing (`R4-OD001` – `R4-OD007`)

All 7 Owner decisions from Stage 3 Lane R4 are routed with strict canonical deadlines and compatible design branching:

| DECISION_ID | SUBJECT | CANONICAL DEADLINE | PROVISIONAL DESIGN OPTIONS | STAGE 4 COMPATIBLE DESIGN BRANCHING |
|---|---|---|---|---|
| **`R4-OD001`** | **Cloud AI Provider Strategy** | `DEFER_TO_STAGE5` | *Option A*: Single candidate (Gemini Flash)<br>*Option B*: Multi-provider adapter<br>*Option C*: Offline only | Design provider-agnostic UI supporting `Local`, `Opt-In Cloud`, and `Offline Fallback` states without hardcoding providers. |
| **`R4-OD002`** | **Default Retention Target ($R$)** | `STAGE4_DESIGN_INPUT` / `STAGE5_DECISION` | *Option A*: Fixed $R = 0.90$<br>*Option B*: Fixed $R = 0.85$<br>*Option C*: Configurable slider ($0.80\text{--}0.95$) | Design configurable slider in Settings with estimated daily workload preview; no frozen default in Stage 4. |
| **`R4-OD003`** | **Review Backlog Capping Policy** | `STAGE4_DESIGN_INPUT` | *Option A*: Daily cap with rolling deferral<br>*Option B*: High-speed triage catch-up mode<br>*Option C*: Unrestricted queue | Design Today backlog triage UI presenting learner choice when backlog $> 50$: "Quick Catch-up Drill" vs "Full Due Queue". |
| **`R4-OD004`** | **Streak Forgiveness Mechanics** | `STAGE4_DESIGN_INPUT` | *Option A*: 1-day provisional grace freeze<br>*Option B*: Opt-in streak counter toggle<br>*Option C*: Strict daily reset | Design streak card with visual provisional grace freeze badge ("Streak Protected") without freezing canonical habit policy. |
| **`R4-OD005`** | **Database Schema Consolidation** | `DEFER_TO_STAGE6` | *Option A*: Single IDB database<br>*Option B*: Preserve 3 physical IDB databases | Design UI as a single unified data store; persistence consolidation remains strictly internal and transparent to learner UX. |
| **`R4-OD006`** | **Audio Blob Persistence Policy** | `MUST_RESOLVE_BEFORE_MEDIA_UX` | *Option A*: Ephemeral audio + manual download<br>*Option B*: Bounded LRU audio cache in IDB<br>*Option C*: Unbounded storage | Design UI supporting both ephemeral playback and optional local audio export; do not freeze exact byte/count ceilings in W1. |
| **`R4-OD007`** | **Degradation & Offline Policy** | `STAGE4_DESIGN_INPUT` | *Option A*: Tiered graceful degradation<br>*Option B*: Strict offline parity | Design 100% offline local capability for all core drills and tests, with non-blocking status badges when advanced AI scoring is queued. |

---

## 10. Downstream Wave Handoffs (W2–W6)

- **Wave W2 (Interaction Architecture & State Machines)**: Author interaction contracts and state machines for all 15 screens, including Guided Speaking, Examiner Dialogue, Writing Autosave, and Sentence Learning Loop.
- **Wave W3 (Wireframe Blueprints & Layouts)**: Produce viewable wireframes across desktop and mobile viewports for all 15 representative screens and their secondary states.
- **Wave W4 (Visual Design System & Tokens)**: Specify typographic scales, color tokens, and accessible component primitives.
- **Wave W5 (High-Fidelity Screen Specifications)**: Author high-fidelity visual specifications and accessible component contracts.
- **Wave W6 (Interactive Prototype & Candidate Exit Report)**: Reconcile all artifacts and compile the Stage 4 Exit Report.
