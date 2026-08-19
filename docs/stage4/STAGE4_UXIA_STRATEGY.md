# STAGE 4 UX / IA REMAKE STRATEGY & ARCHITECTURE SPECIFICATION

**Canonical Document ID**: `STAGE4-UXIA-STRATEGY-V1`  
**Governing Ratification**: `STAGE4-UXIA-STRATEGY-AUTH-DESIGN-001` (Revision `REV-004`, Ratified by Human Owner)  
**Controlling Authorization Manifest**: [`docs/authorizations/STAGE4-UXIA-AUTH-001.md`](../authorizations/STAGE4-UXIA-AUTH-001.md)  
**Status**: `CANONICAL_STRATEGY / AUTHORIZED_FOUNDATION`  
**Authority Level**: Level 3 (Architecture Specification) under [`AGENTS.md`](../../AGENTS.md)

---

## 1. Mission & Architectural Scope

`[FACT]` Stage 4 owns the comprehensive **User Experience (UX) and Information Architecture (IA) Remake** for OmniIELTS, transforming the application into a cohesive, pedagogically defensible, highly accessible learning platform.

### Core Problems Solved
1. **Unified Information Architecture**: Replaces fragmented multi-stage overlays and modal-on-modal stacking with a clean 5-pillar top-level architecture.
2. **100% Product Capability Preservation**: Formally audits and preserves every materially existing capability (48 / 48) across Core Learning, IELTS Platform, V10 Modules, and System/Trust UX with **zero silent deletions**.
3. **Stage 3 Research Translation**: Directly translates empirical cognitive science findings (retrieval practice, 4-tier feedback, worked example fading, refutational remediation, cognitive load reduction, multi-model separation) into concrete UX requirements.
4. **Mandatory Dual Experience Architecture**: Strictly enforces the non-negotiable boundary:
   $$\text{OMNIIELTS\_LEARNING\_UI} \neq \text{IELTS\_EXAM\_SIMULATION\_UI}$$
5. **Deterministic IELTS Writing Task 1 Generation**: Establishes a local, constraint-driven procedural and curated dataset architecture with zero hosted AI API dependencies for core task and chart generation.
6. **Low-Handoff Wave Execution Model**: Establishes an efficient "One Prompt = One Wave" operational flow utilizing the accepted OmniIELTS Harness V4, in-session Owner approval gates (G0–G6), and strict independent audit separation in fresh sessions.

---

## 2. Epistemic & Authority Boundaries

`[FACT]` In strict accordance with [`AGENTS.md`](../../AGENTS.md) and [`docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`](../governance/EXECUTION_PROMPT_PROTOCOL_V2.md):

$$\text{RESEARCH} \neq \text{SPECIFICATION} \neq \text{AUTHORIZATION} \neq \text{IMPLEMENTATION} \neq \text{EVIDENCE} \neq \text{INDEPENDENT\_ACCEPTANCE} \neq \text{MERGE\_AUTHORITY}$$

- **Stage 4 IS**: UX/IA strategy, interaction state machines, responsive layout grammar, design system tokens, wireframe blueprints, high-fidelity UI specifications, and candidate exit compilation.
- **Stage 4 IS NOT**:
  - Production JavaScript/CSS source coding (`src/**`);
  - Test suite authoring or modification (`tests/**`);
  - Runtime dependency adoption in `package.json`;
  - Database schema migrations or storage refactoring;
  - Final AI/ASR provider benchmarking and model selection (reserved strictly for Stage 5);
  - Production component implementation (reserved strictly for Stage 6).
- **Independent Acceptance Invariant**: $\text{CI\_GREEN} \neq \text{ACCEPT}$. The executor session never audits or accepts its own candidate.
- **Merge Authority Invariant**: $\text{ACCEPT} \neq \text{MERGE\_AUTHORITY}$. Merges are executed only under explicit controlling authorization.

---

## 3. Mandatory Dual Experience Architecture

`[OWNER_RATIFIED_DECISION]` The system maintains a strict architectural separation between two distinct operational modes:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                OMNIIELTS APPLICATION SHELL                             │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ 1. OMNIIELTS LEARNING MODE                │ 2. IELTS EXAM SIMULATION MODE              │
│    (Coaching, Scaffolding, Discovery)     │    (Authentic Computer-Delivered Fidelity) │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Modern, warm, accessible UI             │ • High-density, authentic exam UI          │
│ • Rich sidebar & bottom navigation        │ • Minimalist exam chrome (No app nav)      │
│ • Step-by-step scaffolds & hints          │ • Zero hints, zero transcripts, zero AI    │
│ • Immediate & elaborated explanations     │ • Unassisted test conditions only          │
│ • Vocabulary lookup & instant capture     │ • Strict official countdown timer          │
│ • Audio scrubbing, looping & slow speed   │ • Uninterrupted audio (No pause/scrub)     │
│ • Gamification, streaks & habit tracking  │ • Official question palette & review flags │
│ • Multi-dimensional progress analytics   │ • Formal post-exam diagnostic score card   │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

### 3.1 Mode 1: OmniIELTS Learning UI
- **Focus**: Language acquisition, cognitive load management, error remediation, and motivational habit formation.
- **Affordances**:
  - Global navigation (Today, Learn, Library, Analytics, Settings);
  - 4-tier feedback states (Verify, Elaborate, Refute, Scaffold);
  - Virtualized transcript rail with sentence looping and instant vocabulary capture;
  - Variable audio playback rates (0.75x–1.25x), A-B loop repeat;
  - Visible assistance traces (`Assisted Practice` badge; FSRS stability update suppression on assisted attempts).

### 3.2 Mode 2: IELTS Exam Simulation UI
- **Focus**: True behavioral, spatial, and cognitive fidelity to official computer-delivered IELTS tests.
- **Strict Invariants**:
  - **Zero Learning Assistance**: All hints, translations, vocabulary sidebars, and AI coaches are strictly stripped from the test viewport;
  - **Restrained Chrome**: Global OmniIELTS headers, footers, sidebars, streaks, and notifications are completely suppressed;
  - **Skill-Specific Interaction Standards**:
    - **Listening**: 4 parts, 40 items; audio plays strictly once without pause or scrubbing; 2-minute review period at end;
    - **Reading**: Authentic split-pane layout (Passage left, Questions right) with draggable divider, text highlighter, and 60-minute hard countdown timer;
    - **Writing**: Task prompt left, distraction-free text editor right; live word counter; spellcheck/grammar underlines strictly disabled;
    - **Speaking**: Clean interview card with prompt audio, preparation countdown timer, notes scratchpad, and automated recording turn;
  - **Question Navigation**: Official question palette with question numbers, attempted status indicators, and "Review" flag checkboxes.

---

## 4. Target Information Architecture (IA)

`[OWNER_RATIFIED_DECISION]` Replaces legacy fragmented modals with a streamlined 5-pillar top-level hierarchy:

```
TARGET IA TREE:
├── 1. HOME / TODAY (Daily Command Center)
│   ├── Today Study Session (Spaced Reviews + New Acquisition)
│   ├── Quick Practice (3-minute micro-drills: Vocab, Listening, Grammar)
│   ├── Streak & Daily Target Card (with provisional grace freeze indicator)
│   └── Next Recommended Action (Weakness-driven recommendation)
│
├── 2. LEARN / WORKSPACES (Dedicated Study Environments)
│   ├── Video / Media Workspace (YouTube / Local Audio / Transcripts)
│   │   └── 6 Modes: Normal, Noticing, Shadowing, Strict Dictation, Practice Dictation, Retell
│   ├── Article & Reading Workspace (Untimed Reading & Vocabulary)
│   ├── Writing Lab (Prompt library, 2-stage feedback, grammar linting)
│   └── Speaking Lab (Pronunciation drills, shadowing, self-recording)
│
├── 3. IELTS HUB (Exam Center)
│   ├── Track Switcher (Academic / General Training)
│   ├── Official Full Mock Test (Timed 4-skill authentic simulation shell)
│   ├── Section Practice (Targeted practice: Listening, Reading, Writing, Speaking)
│   └── Signed Content Catalog (Verified offline lesson packs)
│
├── 4. KNOWLEDGE & LIBRARY (Learner Assets)
│   ├── Vocabulary & Collocations (Search, filters, status, audio)
│   ├── Error Notebook (23-category error map, mistake history)
│   ├── Sources & Transcripts (Saved videos, imported PDFs/EPUBs)
│   └── Capture Inbox (Staged items awaiting confirmation)
│
├── 5. ANALYTICS & SETTINGS (System & Governance)
│   ├── Multi-Dimensional Profile (FSRS Retention, 5-Skill Competence, CEFR/IELTS Band)
│   ├── Learning Preferences (Target retention, daily limits, TTS voices)
│   ├── Privacy & Cloud AI (Opt-in consent, ephemeral keys, offline toggle)
│   └── Backup & Data Safety (Full JSON export, restore, system audit)
```

---

## 5. IELTS Academic Writing Task 1 Deterministic Visual System

`[OWNER_RATIFIED_DECISION]` Core IELTS Academic Writing Task 1 task, data, and visual generation operates strictly via a **local deterministic path with zero hosted AI API dependency**:

$$\text{CORE\_WRITING\_TASK1\_GENERATION} = \text{LOCAL / DETERMINISTIC}$$
$$\text{AI\_API\_CORE\_DEPENDENCY} = \text{NO}$$

```
DATA SOURCE
   ├── Seeded / Procedural Generator (controlled by seed, visual family, topic, trend pattern)
   └── Curated / Validated Dataset (manual, open, or licensed task specs)
   │
   ▼
NORMALIZED STRUCTURED TASK SPEC
   │
   ▼
STRICT VALIDATOR (Fails Closed: only valid tasks reach learner)
   │
   ▼
LOCAL DETERMINISTIC RENDERER (Browser-side SVG / Canvas / Semantic HTML)
   │
   ▼
LEARNER TASK WORKSPACE (Split-Pane Responsive Viewport)
```

### 5.1 Three Architectural Layers
1. **Layer A: Visual Rendering**:
   - Supports 6 core visual families: Line Graphs, Bar Charts, Pie Charts, Tables, Maps, and Process Diagrams (plus mixed combinations).
   - Rendered entirely browser-side via lightweight local visualization engines (evaluated from R2 Domain 12: uPlot, Chart.js, Native SVG) or semantic HTML grids for tables.
2. **Layer B: Task & Data Generation**:
   - Consumes seeded procedural generators or curated datasets to produce mathematically coherent, non-contradictory datasets satisfying visual family grammar (e.g. valid composition totals for pie charts, consistent chronological ordering for line graphs).
   - Validated through a strict **fail-closed validator** before any task reaches the learner.
   - Generates standardized parameterized IELTS-style task prompts without AI API calls.
3. **Layer C: Accessible Presentation & UX Container (Stage 4 Domain)**:
   - Responsive split-pane layout (`Passage/Chart Left`, `Text Area Right`) with zoom/pan controls for complex diagrams.
   - Accessible high-contrast SVG styling and non-visual semantic tabular data fallbacks for screen readers.

---

## 6. Representative Screen Set (15 Distinct Interaction Classes)

`[OWNER_RATIFIED_DECISION]` The design system is validated across **15 distinct representative screen classes**:

1. **Screen 1: Today / Home Dashboard** (Daily study card, streak with provisional grace freeze indicator, backlog catch-up triage, quick launch).
2. **Screen 2: Vocabulary Spaced Review** (Cued recall flashcard, FSRS rating buttons, 4-state feedback explanation card).
3. **Screen 3: Video & Media Study Workspace** (Video player, synchronized virtualized transcript rail, 7-step loop toolbar, speed controls).
4. **Screen 4: Article & Passage Reader Workspace** (Untimed text reader, split reading layout, paragraph highlight, instant word capture).
5. **Screen 5: Unified Capture Inbox** (Staged capture queue, context snippet, CEFR tag, bulk confirm/discard).
6. **Screen 6: Error Notebook & Weakness Map** (23-category mistake heatmap, diagnostic cards, remedial drill launcher).
7. **Screen 7: Multi-Dimensional Analytics Dashboard** (Memory stability $R$, 5-skill radar, CEFR/IELTS band estimate with confidence band).
8. **Screen 8: IELTS Listening Exam Shell** (Authentic 4-part audio player, 40 items, question navigator, 2-min review, single-play invariant).
9. **Screen 9: IELTS Reading Academic Split Shell** (3 academic passages, split-pane layout with draggable divider, text highlighter, 60m timer).
10. **Screen 10: IELTS Reading General Training Split Shell** (Section 1/2/3 workplace/social texts, split-pane layout, 60m timer).
11. **Screen 11: IELTS Writing Academic Task 1 Visual Workspace** (Visual chart/graph container, 150-word editor, live word counter, rubric notes, tabular fallback toggle).
12. **Screen 12: IELTS Writing Task 2 Essay Workspace** (Discursive essay prompt, 250-word editor, 40m timer, rubric self-check).
13. **Screen 13: IELTS Speaking 3-Part Guided Shell** (Part 1 interview, Part 2 cue card & prep notes scratchpad, Part 3 discussion prompts).
14. **Screen 14: IELTS Full Mock Exam Shell** (Dedicated full-screen simulation mode: exam-mode entry, complete OmniIELTS chrome removal, test instructions, 4-skill sequential transitions, continuous timer continuity, reload recovery, strict no-assistance invariant, final scorecard transition).
15. **Screen 15: Settings, AI & Data Safety** (Preferences, voice selection, ephemeral API keys, backup export/restore, system audit).

---

## 7. Stage 4 Wave Execution Architecture (W0–W6)

`[OWNER_RATIFIED_DECISION]` Stage 4 executes via a structured 7-Wave sequence:

```
STAGE 4 WAVE SEQUENCE:
├── W0: Strategy, Capability Preservation & IA Foundation (Canonical Docs & Auth Manifest)
├── W1: Information Architecture, Navigation Grammar & 15 Core User Journeys
├── W2: Interaction Architecture, State Machines & Assistance Contracts
├── W3: Wireframe Blueprints & Representative Layouts (15 Screens, Desktop + Mobile) [EARLY VISUAL GATE]
├── W4: Visual Design System, Design Tokens & Component Language
├── W5: High-Fidelity Representative Screen UI Specifications
└── W6: Interactive Prototype & Cross-Surface Reconciliation Executor (Compiles Candidate Exit Report)
```

### Operational Governance Model ("One Prompt = One Wave")
1. **Transaction 1 (Wave Executor Session)**:
   - Fresh-reads canonical baseline and predecessor commit;
   - Compiles contract via Harness V4 (`omniielts-contract.mjs`);
   - Executes bounded design/documentation work;
   - Pauses in-session for Human Owner Approval Gates (G0–G6);
   - Materializes candidate artifacts within closed allowlist;
   - Verifies locally (`npm test`, `npm run check`);
   - Pushes branch, creates Draft PR, and awaits natural CI on exact HEAD;
   - Emits completion report marked `READY_FOR_INDEPENDENT_AUDIT` and **HALTS**.
2. **Transaction 2 (Fresh Independent Auditor Session)**:
   - Runs in a separate, unpolluted top-level session (`omniielts-auditor`);
   - Audits raw PR diff, exact commit SHA, natural CI run, and controlling governance;
   - Posts persisted GitHub review with mandatory `OMNIIELTS_AUDIT_V1` machine footer;
   - IF `MERGE_AUTHORITY: EXPLICITLY_GRANTED` $\to$ executes pre-authorized fast-forward merge;
   - ELSE $\to$ returns verdict: `ACCEPTED_PENDING_OWNER_MERGE_AUTHORITY`.

---

## 8. Owner Decision Ledger Routing (`R4-OD001` – `R4-OD007`)

`[FACT]` All concrete parameters are categorized as `PROVISIONAL_DESIGN_OPTION` (zero unratified defaults):

| DECISION_ID | SUBJECT | CLASSIFICATION | PROVISIONAL DESIGN OPTIONS (NOT RATIFIED DEFAULTS) | STAGE 4 DESIGN IMPLICATION & RECOMMENDATION | LATEST SAFE OWNER GATE |
|---|---|---|---|---|---|
| **`R4-OD001`** | Cloud AI Provider Strategy | `STAGE4_DESIGN_INPUT` / `STAGE5_DECISION` | *Option A*: Single conditional provider candidate (Gemini Flash)<br>*Option B*: Multi-provider candidate adapter (Groq, Gemini, OpenRouter)<br>*Option C*: Strict offline only | **Design provider-agnostic UI** supporting `Local Rule`, `Opt-In Cloud`, `Offline Fallback` states without hardcoding provider | Gate G3 (Wireframes) |
| **`R4-OD002`** | Default Retention Target ($R$) | `STAGE4_DESIGN_INPUT` / `STAGE5_DECISION` | *Option A*: $R = 0.90$<br>*Option B*: $R = 0.85$<br>*Option C*: User-configurable slider ($0.80\text{--}0.95$) | **Design Settings control** supporting configurable target retention with workload estimator tooltip; no frozen default | Gate G1 (IA & Settings) |
| **`R4-OD003`** | Review Backlog Capping Policy | `STAGE4_DESIGN_INPUT` | *Option A*: Daily cap with rolling deferral<br>*Option B*: High-speed triage catch-up mode<br>*Option C*: Unrestricted traditional queue | **Design Today backlog triage UI** offering learner choice between "Quick Catch-up" and "Full Due Queue" | Gate G1 (Today IA) |
| **`R4-OD004`** | Streak Forgiveness Mechanics | `STAGE4_DESIGN_INPUT` | *Option A*: 1-day (24h) provisional grace freeze<br>*Option B*: Opt-in streak counter toggle<br>*Option C*: Strict daily reset | **Design streak card with provisional 1-day grace indicator** without freezing canonical habit policy | Gate G1 (Today IA) |
| **`R4-OD005`** | Database Schema Consolidation | `STAGE5/6_DECISION` | *Option A*: Additive forward migration to single IDB<br>*Option B*: Preserve 3 physical IDB databases | **Design UI as unified data store**; persistence consolidation is transparent to UX | Gate G5 (Stage 4 Exit) |
| **`R4-OD006`** | Audio Blob Persistence Policy | `STAGE4_DESIGN_INPUT` / `STAGE5_DECISION` | *Option A*: Ephemeral session audio + manual Export<br>*Option B*: Bounded LRU cache in IndexedDB<br>*Option C*: Unbounded storage | **Design ephemeral recording player with manual Export button** + recent attempt history indicator | Gate G2 (Interaction) |
| **`R4-OD007`** | Degradation & Offline Policy | `STAGE4_DESIGN_INPUT` | *Option A*: Tiered graceful degradation<br>*Option B*: Strict offline parity | **Design graceful 2-tier degradation**: 100% offline drills + clear badges when AI scoring is queued | Gate G1 (Global IA) |

---

## 9. Stage 5 & Stage 6 Hard Boundaries

`[FACT]`
- **Stage 5 AI Research Boundary**: Stage 4 UX design strictly preserves technology neutrality. Zero final selections of SBD neural models, grammar WASM, ASR engines, or LLM providers are made.
- **Stage 6 Implementation Boundary**: Stage 4 UX design strictly forbids editing `src/**`, modifying production test suites in `tests/**`, or executing IndexedDB schema migrations. $\text{WIREFRAME} \neq \text{IMPLEMENTATION}$.

---

## 10. Stage 4 Design-Level Exit Gate

`[OWNER_RATIFIED_DECISION]` Stage 4 completion requires 100% verification across **18 auditable design dimensions**:
1. `CAPABILITY_PRESERVATION_AUDIT_COMPLETE` (48/48 current capabilities routed).
2. `FUTURE_RESEARCH_CAPABILITIES_RECONCILED` (20/20 Stage 3 handoffs routed).
3. `R2_18_DOMAINS_EXPLICITLY_RECONCILED` (18/18 domains itemized in register).
4. `REVERSE_RECONCILIATION_VERIFIED` (0 unmapped routes, surfaces, flows, stores).
5. `STAGE3_RESEARCH_TRACEABILITY_COMPLETE` (All cognitive & interaction findings mapped).
6. `OWNER_DECISIONS_ROUTED` (R4-OD001 through R4-OD007 mapped as provisional options).
7. `TARGET_IA_SPECIFIED` (5-pillar tree and navigation models complete).
8. `PRIMARY_JOURNEYS_SPECIFIED` (15 user journeys fully documented).
9. `INTERACTION_STATE_MACHINE_COMPLETE` (Feedback states & assistance traces defined).
10. `DUAL_EXPERIENCE_ARCHITECTURE_VERIFIED` (`Learning UI != Exam Simulation UI`).
11. `IELTS_EXAM_AUTHENTICITY_VERIFIED_AT_DESIGN_LEVEL` (Strict computer-delivered test fidelity).
12. `15_REPRESENTATIVE_SCREEN_WIREFRAMES_APPROVED` (Desktop & mobile wireframes complete).
13. `DESIGN_SYSTEM_TOKENS_COHERENT` (Colors, typography, spacing, elevation standardized).
14. `RESPONSIVE_SPECIFICATIONS_COMPLETE` (Breakpoint layouts and drawer grammar defined).
15. `ACCESSIBILITY_SPECIFICATIONS_COMPLETE` (Keyboard, focus, ARIA, and contrast rules defined).
16. `ERROR_RECOVERY_TRUST_MODEL_COMPLETE` (16 trust/error states specified).
17. `STAGE5_TECHNOLOGY_BOUNDARIES_PRESERVED` (Zero premature engine/model lock-in).
18. `STAGE6_IMPLEMENTATION_BOUNDARIES_PRESERVED` (Zero production source mutations).
