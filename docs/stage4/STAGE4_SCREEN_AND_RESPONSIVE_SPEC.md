# Stage 4 W5 High-Fidelity Screen & Responsive Specification

## 1. Exact Provenance & Authority

| Field | Value |
|---|---|
| **Transaction** | `STAGE4-W5-HIFI-UI-SPECS-001` |
| **Human Gate** | G5 ACTIVATED UPON CANONICAL W4 INTEGRATION (PR #187 / commit `3de28c4014d8a69f7e946cb376f3758e3ded5142`) |
| **Canonical Base** | `3de28c4014d8a69f7e946cb376f3758e3ded5142` (Merge PR #187 / `STAGE4-W4-DESIGN-SYSTEM-REM-001`) |
| **Controlling Authorization** | `docs/authorizations/STAGE4-UXIA-AUTH-001.md` |
| **Governing Strategy** | `docs/stage4/STAGE4_UXIA_STRATEGY.md` |
| **Accepted Predecessors** | W0 Capability Preservation Matrix (`STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`); W1 IA & Journeys (`STAGE4_INFORMATION_ARCHITECTURE.md`, `STAGE4_USER_JOURNEYS.md`); W2 Interaction & State Model (`STAGE4_INTERACTION_AND_STATE_MODEL.md`); Canonical REM-003 Whole-App Synthesis (`docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-003.md`); W3 Structural Wireframes (`STAGE4_WIREFRAMES.md`); W4 Design System & Token Specification (`STAGE4_DESIGN_SYSTEM.md`) |
| **Artifact Class** | High-Fidelity Screen & Responsive Specification; Non-runtime design specification |
| **Closed Write Allowlist** | `docs/stage4/STAGE4_SCREEN_AND_RESPONSIVE_SPEC.md` only |
| **Epistemic Status** | W5 candidate pending independent audit; CI is not acceptance |

Canonical documents remain authority. This artifact materializes the near-final high-fidelity visual specifications, component bindings, responsive layout transformations, state presentations, and accessibility behaviors for all 15 canonical representative screen classes. It bridges the structural blueprints of W3 and the design system grammar of W4 into exact, build-ready visual blueprints for Wave 6 prototype construction without inventing runtime source code, selecting external AI/ASR providers, reintroducing Word Rearrangement, or modifying durable database schemas.

---

## 2. Global Architectural & Visual Grammar Contracts

### 2.1 Dual Visual Grammar (Learning UI vs IELTS Exam UI)

OmniIELTS visually operates across two distinct, specialized modes that share unified design DNA:

```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
|                                  OMNIIELTS UNIFIED DESIGN DNA                                     |
|  * 4px/8px Baseline Scale  * Inter/Merriweather/JetBrains Mono Stacks  * Semantic Color Tokens     |
|  * 48px Mobile Touch Envelope  * Default-Deny EvidencePolicy Gateway  * Durable Local-First Data  |
+─────────────────────────────────────────────────+─────────────────────────────────────────────────+
|               SURFACE A: LEARNING UI            |             SURFACE B: IELTS EXAM UI            |
+─────────────────────────────────────────────────+─────────────────────────────────────────────────+
| - Tone: Modern, warm, supportive, motivating    | - Tone: Restrained, official, distraction-free  |
| - Canvas: --color-learn-bg-canvas (#f8fafc)     | - Canvas: --color-exam-bg-canvas (#f1f5f9)      |
| - Surface: --color-learn-bg-surface (#ffffff)   | - Surface: --color-exam-bg-surface (#ffffff)    |
| - Navigation: Persistent 5-pillar rail / bottom | - Navigation: Unmounted; test header & footer   |
| - Elevation: Diffuse ambient depth (--elev-1/2) | - Elevation: Flat 1px border (--elevation-exam) |
| - Assistance: Visible badges (UA/LA/SC/AR)      | - Assistance: Zero aids, zero coaching, zero AR |
| - Agency: Flexible choices, Why this?, Dismiss  | - Agency: Official timing rules, section locks  |
+─────────────────────────────────────────────────+─────────────────────────────────────────────────+
```

### 2.2 Global Design & Evidence Invariants

```
CAPABILITY_PRESERVED != USER_EXPERIENCE_PRESERVED
CAPABILITY_COUNT != VISIBLE_TOP_LEVEL_CONTROL_COUNT
RECOMMENDED_PATH != REQUIRED_PATH
CURRICULUM_PATH != NAVIGATION_LOCK
GUIDED_SEQUENCE != MANDATORY_SEQUENCE
OMNIIELTS_LEARNING_UI != IELTS_EXAM_SIMULATION_UI
6 MODES != 6 SCREENS
7 STEPS != 7 SCREENS
MODE_SWITCH != WORKSPACE_RESET
MEDIA_MODE != GUIDED_LOOP_STEP
CAPTURE != EVIDENCE
CAPTURE != AUTOMATIC_FSRS_SCHEDULING
MEMORY_RETENTION != SKILL_MASTERY
UNASSISTED -> POTENTIALLY_EVIDENCE_ELIGIBLE
UNASSISTED != AUTOMATIC_FSRS_UPDATE
DESIGN_TOKEN_CONTRAST_PASS != WHOLE_APPLICATION_WCAG_CONFORMANCE
MOBILE_LAYOUT != SHRUNK_DESKTOP
```

### 2.3 Bounded Truth Labeling Register

Every screen component and state specification utilizes the canonical truth register:
- `[CURRENT]`: Active in existing implementation baseline.
- `[CURRENT_REHOMED]`: Active capability repositioned into the new 5-pillar IA.
- `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]`: Target Stage 4 capability defined in strategy.
- `[FUTURE_UX_RESERVED]`: Reserved interface space for future stages (e.g. Stage 7 transfer).
- `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]`: Reserved space with partial baseline mock.
- `[OWNER_RECONFIRMED_FUTURE]`: Interactive Examiner Simulation reserved for post-Stage 4.
- `[BACKGROUND_SYSTEM]`: System engine (e.g. EvidencePolicy, IndexedDB backup registry).

---

## 3. High-Fidelity Screen Specifications (WF-01 .. WF-15)

---

### WF-01 — Today / Home Dashboard

#### 1. Traceability & Metadata
- **Screen ID**: `WF-01`
- **Surface**: Learning UI
- **Canonical Purpose**: Guide daily learning with an explainable, non-punitive recommendation while keeping all 5 pillars and alternative activities directly accessible.
- **Canonical Journey**: `J-01 Today`
- **Capability IDs**: `CAP-001`, `CAP-016`, `CAP-034`, `CAP-041`, `CAP-048`
- **Omission Invariants**: `S4-OMIT-005` (Core-only degraded notice), `S4-OMIT-006` (Safe audio/nav spacing)
- **REM-003 Rec IDs**: `REC-REM002-001` (Explainable Today), `REC-REM002-018` (Nonpunitive Re-entry), `REC-REM002-021` (Data Safety / Degraded)

#### 2. Visual Hierarchy & Composition
1. **Primary Anchor (Level 1)**: `TodayRecommendationCard` — Highlighted card with indigo subtle gradient, clear time estimate, "Why this?" rationale tooltip, and high-contrast primary CTA `[ Resume Block ]`.
2. **Secondary Section (Level 2)**: `ContinueCarousel` — Resumption row containing quick cards for in-progress media, due vocabulary reviews, and saved writing drafts.
3. **Tertiary Section (Level 3)**: `ChoiceGrid` — 4 equal tiles allowing learner to freely launch Vocabulary, Media, Reader, or IELTS practice.
4. **Utility & System Layer**: Persistent degraded-mode warning banner (when offline) and quick capture/search triggers.

#### 3. Desktop Composition (1440px / 1024px)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| OMNIIELTS    | Search (Cmd+K)              [ + Capture ]  [ ☁ Sync: OK ]  [ ⚙ Settings ] [ 👤 ]  |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
| ☀ Today      | Good morning, Alex · Target: Band 7.5 (Academic)                  [ Change Goal ] |
| 🕮 Learn      +────────────────────────────────────────────────────────────────────────────────────+
| 🎓 IELTS     | RECOMMENDED NEXT ACTIVITY                                                          |
| 📁 Library   | +────────────────────────────────────────────────────────────────────────────────+ |
| 📊 Analytics | | 🎧 IELTS Listening: Section 2 Map & Form Drill                 ⏱ 15 min · Today | |
|              | | Why this? (FSRS memory stability 0.42; weak form recognition practice due)     | |
|              | | [ ▶ Resume Recommended Block ]     ( Change Plan )            ( Dismiss )      | |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              |                                                                                    |
|              | CONTINUE WHERE YOU LEFT OFF                                                        |
|              | +──────────────────────+ +──────────────────────+ +──────────────────────────────+ |
|              | | 🎬 Media: Tech Conf  | | 🕮 Vocab: 8 Due      | | ✍ Writing Task 2 Draft       | |
|              | | 03:42 / 12:10 · 65%  | | 3 new · 5 review     | | 182 words · "Urban Planning" | |
|              | | [ Continue Video > ] | | [ Review Cards > ]   | | [ Resume Essay > ]           | |
|              | +──────────────────────+ +──────────────────────+ +──────────────────────────────+ |
|              |                                                                                    |
|              | EXPLORE & PRACTICE FREELY                                                          |
|              | +────────────────+ +────────────────+ +──────────────────+ +─────────────────────+ |
|              | | 🕮 Vocabulary   | | 🎬 Video Media  | | 📰 Reader      | | 🎓 IELTS Hub        | |
|              | | 142 mastered   | | 18 saved items | | 6 active texts | | Practice & Mocks    | |
|              | +────────────────+ +────────────────+ +──────────────────+ +─────────────────────+ |
|              |                                                                                    |
|              | ! [CORE_ONLY_DEGRADED]: Local drills active. Cloud AI feedback will sync later !   |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact)
```
+──────────────────────────────────────────+
| Today                      🔍  [ + Add ] |
| Good morning, Alex · Band 7.5            |
+──────────────────────────────────────────+
| RECOMMENDED NEXT                         |
| +──────────────────────────────────────+ |
| | 🎧 IELTS Listening: Section 2 Drill  | |
| | ⏱ 15 min · Why this? [ Tap to view ]| |
| |                                      | |
| | [ ▶ Resume Block (15 min) ]          | |
| | ( Change Plan )         ( Dismiss )  | |
| +──────────────────────────────────────+ |
|                                          |
| CONTINUE                                 |
| ┌──────────────────────────────────────┐ |
| │ 🎬 Tech Conf (03:42)               > │ |
| │ 🕮 Vocab: 8 Due (5 min)             > │ |
| │ ✍ Writing Task 2 Draft             > │ |
| └──────────────────────────────────────┘ |
|                                          |
| EXPLORE ACTIVITIES                       |
| [ Vocab ]  [ Media ]  [ Reader ] [IELTS] |
|                                          |
| ! Core mode: local learning ready !      |
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Background Canvas**: `--color-learn-bg-canvas` (`#f8fafc`)
- **Card Background**: `--color-learn-bg-surface` (`#ffffff`) with border `--color-learn-border-subtle` (`#e2e8f0`)
- **Recommendation Well**: Background `--color-learn-brand-subtle` (`#eef2ff`), border `--primitive-indigo-200` (`#c7d2fe`)
- **Typography**: Header `--type-h1` (24px bold), Section `--type-h2` (20px semibold), Rationale `--type-body-sm` (13px regular), Action `--type-body` (15px semibold)
- **Primary Button**: `ButtonPrimary` (`--primitive-indigo-600` background, white text, `--radius-md` 8px radius, height `--input-height-default` 44px)
- **Elevation**: `--elevation-1` for continue cards, `--elevation-2` for recommendation hero card

#### 6. States & Accessibility
- **States**: `Default`, `No Due Reviews` (Shows reassuring "All caught up" slate illustration), `First-Time User` (Diagnostic recommendation block), `Core-Only Degraded` (`--primitive-amber-50` banner), `Single-Lease Conflict Notice`.
- **Accessibility**: Heading order H1 $\to$ H2 $\to$ H3. `Resume` button is initial keyboard focus stop. Rationale opens via expandable accessible tooltip or bottom sheet with `aria-expanded`. Minimum touch targets $\ge 48\times 48\text{px}$.

---

### WF-02 — Vocabulary & Collocation Learning / Practice / Spaced Review Canvas

#### 1. Traceability & Metadata
- **Screen ID**: `WF-02`
- **Surface**: Learning UI
- **Canonical Purpose**: Guide rich lexical items through the complete 6-stage lifecycle (`Acquire` $\to$ `Confirm` $\to$ `Context` $\to$ `Practice` $\to$ `Review` $\to$ `Transfer`) with explicit SourceContext and default-deny EvidencePolicy evaluation.
- **Canonical Journey**: `J-02 Vocabulary`
- **Capability IDs**: `CAP-002`, `CAP-003`, `CAP-012`, `CAP-014`, `CAP-015`, `CAP-016`, `CAP-046`
- **Omission Invariants**: `S4-OMIT-001` (Custom lexical capture), `S4-OMIT-007` (Suspended cards manager)
- **REM-003 Rec IDs**: `REC-REM002-005` (Context-Rich Lexical Object), `REC-REM002-006` (Staged Capture Lifecycle), `REC-REM002-007` (Memory vs Skill Separation)

#### 2. Visual Hierarchy & Composition
1. **Lifecycle Stepper**: Persistent 6-step progress bar showing current position in lexical acquisition.
2. **Context & Provenance Pill**: `SourceContextChip` displaying exact source article/video, paragraph, and sentence locator with `[Return to Source]` button.
3. **Active Practice Workbench**: Multimodal practice runner (Sentence Production, Collocation Match, Audio Dictation, Context Gap-Fill).
4. **Assistance & Telemetry Bar**: Visible assistance badges (`UA` Unassisted, `LA` Light Assist, `SC` Scaffolded, `AR` Revealed).
5. **Formative Feedback & Evidence Receipt**: 4-tier formative feedback card (Verify, Elaborate, Refute, Scaffold) paired with expandable `EvidenceReceipt`.

#### 3. Desktop Composition (1440px / 1024px)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| OMNIIELTS    | Vocabulary Canvas · Study Queue: 8 Due · 3 Candidates             [ ⚙ Settings ]    |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
| ☀ Today      | LEXICAL LIFECYCLE: (1) Acquire → [2] Confirm → (3) Context → [4] Practice → (5) Review → (6) Transfer |
| 🕮 Learn      +────────────────────────────────────────────────────────────────────────────────────+
|   Vocabulary | SOURCE PROVENANCE: 📰 "Climate Change Mitigation" (Rev r4, p3 s2)    [ ↩ Return ]   |
|   Media      | TARGET HEADWORD: "account for"   Phonetic: /əˈkaʊnt fɔːr/    Audio: [ 🔊 Pronounce ]|
|   Reader     | SENSE: [ Phrasal Verb: To explain the cause of / To comprise a proportion ▼ ]       |
| 🎓 IELTS     | COLLOCATIONS: [ account for the difference ] [ account for 60% ] [ + Add Custom ]  |
| 📁 Library   +────────────────────────────────────────────────────────────────────────────────────+
| 📊 Analytics | ACTIVE TASK: Sentence Production Drill (Active Recall)                             |
|              | Context Prompt: Write an academic sentence explaining why renewables grew rapidly. |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              | | Solar energy accounts for over 45% of new generation capacity in 2025.         | |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              | Current Assistance: [ UA: Unassisted (Eligible for Evidence Review) ]              |
|              | Optional Aids: ( Hint: Synonyms )  ( Scaffolding: Frame )  ( Reveal Model )        |
|              |                                                                                    |
|              | [ Check & Submit Attempt ]                                 ( Skip Item )           |
|              +────────────────────────────────────────────────────────────────────────────────────+
|              | FORMATIVE EVALUATION & EVIDENCE RECEIPT                                            |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              | | ✓ VERIFY: Correct academic usage and preposition pairing ("account for").      | |
|              | | 💡 ELABORATE: Expresses proportional composition accurately in Task 1 register. | |
|              | | 📑 EVIDENCE RECEIPT #REC-8842: UA attempt verified by EvidencePolicy.           | |
|              | |    Memory Update: FSRS interval computed (Next: 4.2d) [ILLUSTRATIVE_ONLY]       | |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              | SPACING RATING: [ Again (<10m) ]  [ Hard (1.2d) ]  [ Good (4.2d) ]  [ Easy (7d) ] |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact)
```
+──────────────────────────────────────────+
| Vocabulary Canvas            Queue: 8 >  |
| [1 Acquire] > [2 Confirm] > [4 Practice] |
+──────────────────────────────────────────+
| "account for"  /əˈkaʊnt fɔːr/   [ 🔊 ]   |
| 📰 Source: Climate Report, p3 s2 [↩ Return|
| Sense: Comprise a proportion             |
| Collocations: account for 60%            |
+──────────────────────────────────────────+
| Sentence Production Drill                |
| Write a sentence explaining renewables.  |
| +──────────────────────────────────────+ |
| | Solar energy accounts for over 45%...| |
| +──────────────────────────────────────+ |
| Mode: [ UA: Unassisted ]                 |
| Aids: ( Hint )  ( Frame )  ( Reveal )    |
|                                          |
| [ Check & Submit Attempt ]               |
+──────────────────────────────────────────+
| ✓ VERIFY: Correct usage in register.     |
| 📑 EvidenceReceipt: UA Validated         |
| Next Review: 4.2d [Dynamic FSRS preview] |
| [ Again ] [ Hard ] [ Good ] [ Easy ]     |
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Component Classes**: `VocabLifecycleStepper`, `SourceContextChip`, `ContextPracticeCard`, `EvidenceReceiptCard`, `FSRSRatingBar`, `SuspendedCardsDrawer`
- **Assistance Badges**: `--color-assist-ua-text` (`#334155`) / `--color-assist-ua-bg` (`#f1f5f9`), `--color-assist-la-text` (`#0369a1`), `--color-assist-sc-text` (`#b45309`), `--color-assist-ar-text` (`#7e22ce`)
- **Evidence Rating Tokens**: `--color-evidence-high-text` (`#047857`) / `--color-evidence-high-bg` (`#ecfdf5`)
- **Typography**: Headword `--type-h1` (24px bold), IPA notation `--type-mono-ipa` (15px regular monospace), Body `--type-body` (15px regular)
- **FSRS Dynamic Preview**: Displays `Next: <scheduler-computed interval>` [ILLUSTRATIVE_ONLY / NOT_SCHEDULER_POLICY].

#### 6. States & Accessibility
- **States**: `Candidate Confirmation`, `Ambiguous Sense`, `Active Drill (Sentence/Collocation/Dictation)`, `Feedback Shown`, `Card Suspended`, `Zero Due Items`.
- **Accessibility**: Screen reader receives live feedback via `aria-live="polite"`. Collocation chips navigable via arrow keys. Audio pronunciation button includes `aria-label="Listen to pronunciation for account for"`.

---

### WF-03 — Video / Media Study Workspace

#### 1. Traceability & Metadata
- **Screen ID**: `WF-03`
- **Surface**: Learning UI
- **Canonical Purpose**: Unified, stable media study workspace hosting all six study modes (`Normal`, `Noticing`, `Shadowing`, `Strict Dictation`, `Practice Dictation`, `Retell`) without page reload, audio reset, or text loss.
- **Canonical Journey**: `J-03 Media`
- **Capability IDs**: `CAP-004`, `CAP-005`, `CAP-006`, `CAP-007`, `CAP-008`, `CAP-009`, `CAP-010`, `CAP-015`, `CAP-047`
- **Omission Invariants**: `S4-OMIT-002` (Retell draft recovery), `S4-OMIT-003` (Dictation ARIA masking), `S4-OMIT-004` (Transcript slicer drawer), `S4-OMIT-009` (Exact audio rates)
- **REM-003 Rec IDs**: `REC-REM002-010` (Listening Cue Identity), `REC-REM002-028` (Ephemeral Recording Safety)

#### 2. Visual Hierarchy & Composition
1. **Media Player Anchor**: Top video/audio container with timestamp, scrubbing bar, safe-area controls, and rate selector (`0.75x`, `0.9x`, `1.0x`, `1.1x`, `1.25x`).
2. **Mode Switcher Bar**: 6-mode segmented toolbar with active mode indicator.
3. **Synchronized Workspace Pane**: Split area rendering either the interactive transcript with active cue tracking or mode-specific workbenches (waveform comparator, masked dictation blanks, retell editor).
4. **Draft & Audio Safety Status**: Persistent recovery banner for interrupted drafts and local-only recording status indicator.

#### 3. Desktop Composition (1440px / 1024px)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| OMNIIELTS    | Media Workspace · "The Architecture of Megacities" (12:40)        [ ⚙ Audio ] [ ✕ ] |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
| ☀ Today      | +──────────────────────────────────────────────────+ +───────────────────────────+ |
| 🕮 Learn      | | [ VIDEO / AUDIO PLAYER CONTAINER (16:9) ]        | | SYNCHRONIZED TRANSCRIPT   | |
|   Vocabulary | | ▶ [||] ↺ 5s  04:12 / 12:40  ↻ 5s  Speed: [ 1.0x ▼]| | [ 🔍 Search cues... ]   | |
|   Media      | | Rate tokens: 0.75x | 0.9x | 1.0x | 1.1x | 1.25x  | | 03:58 "Urban centers face | |
|   Reader     | +──────────────────────────────────────────────────+ |         immense pressures"| |
| 🎓 IELTS     | MODE: [ Normal ] [ Noticing ] [ Shadowing ]          | 04:12 ▶ "High-density     | |
| 📁 Library   |       [ Strict Dictation ] [ Practice ] [ Retell ]   |          infrastructure   | |
| 📊 Analytics | +──────────────────────────────────────────────────+ |          must adapt..."   | |
|              | | ACTIVE WORKBENCH: Shadowing & Waveform Pitch     | | 04:28 "Transportation and | |
|              | | Target Audio: 04:12 - 04:22 (Thought group #14)  | |         zoning laws..."   | |
|              | | Reference Pitch: ──/\───/\/\───                  | |                           | |
|              | | Learner Pitch:   ──/\───/\───                    | | [ ✂ Slicer / Edit Drawer ]| |
|              | | Score: 88% Pitch Alignment · 92% Rhythm          | +───────────────────────────+ |
|              | | Controls: [ 🎙 Record ] [ ▷ Replay ] [ Compare ]  |                               |
|              | | Audio Safety: Local RAM only · [ 💾 Export Audio ]                                |
|              | +──────────────────────────────────────────────────+                               |
|              | ! [DRAFT_RECOVERY]: Retell draft from 09:14 restored · [ Continue ] [ Discard ] !   |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact)
```
+──────────────────────────────────────────+
| Media Study Workspace             [ ⚙ ] |
| "The Architecture of Megacities"         |
+──────────────────────────────────────────+
| [ VIDEO PLAYER (16:9 Aspect Ratio) ]     |
| ▶ 04:12 / 12:40   ↺ 5s  ↻ 5s  [ 1.0x ▼ ] |
+──────────────────────────────────────────+
| MODES: [Norm] [Notic] [Shadow] [Dict]... |
+──────────────────────────────────────────+
| ACTIVE WORKBENCH: Shadowing              |
| Cue: 04:12 "High-density infrastructure" |
| Waveform: ──/\───/\/\───                 |
| [ 🎙 Tap to Record ]  [ ▷ Compare ]       |
| Audio: Session local · [ 💾 Save ]       |
+──────────────────────────────────────────+
| 📜 Transcript Sheet: Active Cue 04:12 >  |
| ! Retell draft preserved in background ! |
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `MediaModeBar`, `TranscriptCueRail`, `NoticingWorkbench`, `ShadowingWaveform`, `DictationWorkbench`, `RetellWorkbench`, `AntiCheatingMask`, `TranscriptSlicerDrawer`
- **Audio Rate Tokens**: Supported playback rates explicitly bound to `0.75x`, `0.9x`, `1.0x`, `1.1x`, `1.25x`.
- **Masking Tokens**: `--primitive-slate-300` masked blank borders; answer content excluded from DOM/ARIA until submission.
- **Active Cue Token**: `--color-learn-brand-subtle` background with 3px `--color-learn-brand-primary` left border indicator.

#### 6. States & Accessibility
- **States**: 6 distinct mode states; `Buffering / Long-Media Progress`, `Interrupted Retell Draft Recovery`, `Strict Dictation Active`, `Audio Device Disconnected`.
- **Accessibility**: Captions synchronized via WebVTT; keyboard shortcuts (`Space` toggle play, `J`/`L` skip $\pm 5s$, `R` record); dictation blanks receive keyboard focus in logical order.

---

### WF-04 — Article / Source Reader Workspace

#### 1. Traceability & Metadata
- **Screen ID**: `WF-04`
- **Surface**: Learning UI
- **Canonical Purpose**: High-legibility editorial workspace for long-form reading with paragraph/sentence locators, contextual lexical capture, and inline sentence unpacking.
- **Canonical Journey**: `J-04 Reader`
- **Capability IDs**: `CAP-011`, `CAP-012`, `CAP-015`, `CAP-016`
- **Omission Invariants**: `S4-OMIT-001` (Custom lexical target capture with exact SourceContext)
- **REM-003 Rec IDs**: `REC-REM002-002` (Semantic SourceContext Continuity), `REC-REM002-008` (Search Returns to Context)

#### 2. Visual Hierarchy & Composition
1. **Article Header & Metadata**: Publication source, topic tag, CEFR/Lexile estimate, audio narration status, and reader font settings (`Serif` / `Sans`, size slider).
2. **Editorial Reading Pane**: Merriweather serif reading column constrained to max `72ch` width with clear paragraph (`p1`, `p2`) and sentence (`s1`, `s2`) numbering.
3. **Floating Selection Toolbar**: Instant popup upon text highlight offering `[ + Capture to Inbox ]`, `[ 🔍 Unpack Sentence ]`, `[ 🔊 Listen ]`, and `[ 🏷 Collocations ]`.
4. **Side Inspection Drawer (Desktop) / Bottom Sheet (Mobile)**: Displays active lexical cards, grammar breakdowns, and source notes without losing reading position.

#### 3. Desktop Composition (1440px / 1024px)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| OMNIIELTS    | Reader Workspace · "Renewable Energy Economics" (Rev r2)          [ Aa Font ] [ ✕ ] |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
| ☀ Today      | ARTICLE METADATA: Journal of Environmental Finance · 1,420 words · C1 Advanced     |
| 🕮 Learn      +──────────────────────────────────────────────────+ +───────────────────────────+ |
|   Vocabulary | READING PASSAGE (Max width 72ch · 18px / 28px)   | | CONTEXT INSPECTION DRAWER | |
|   Media      | ¶ 1  The transition toward sustainable power has | | [ + Capture Staged ]      | |
|   Reader     | accelerated exponentially across the globe. s1   | | Target: "mitigate"        | |
| 🎓 IELTS     | Government subsidies and falling hardware costs  | | Sense: To make less severe| |
| 📁 Library   | have combined to make photovoltaics competitive. | | Locator: Rev r2, p2 s3    | |
| 📊 Analytics |                                                  | |                           | |
|              | ¶ 2  s1 Crucially, battery storage solutions now | | GRAMMAR & STRUCTURE:      | |
|              | allow grid operators to handle intermittent      | | "allow... to handle..."   | |
|              | generation. s2 In many jurisdictions, solar and  | | Verb + Object + Inf clause| |
|              | wind installations account for the majority of   | |                           | |
|              | new peak-load capacity. s3 To [ mitigate the ]   | | EXISTING CARDS (2):       | |
|              | [ risks of blackout, hybrid models are deployed.]| | • "intermittent" (Hard)   | |
|              | +──────────────────────────────────────────────+ | | • "peak-load" (New)       | |
|              | | SELECTION TOOLBAR: [ + Capture ] [ 🔍 Unpack ] | | [ Open Full Vocab Deck ]  | |
|              | +──────────────────────────────────────────────+ +───────────────────────────+ |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact)
```
+──────────────────────────────────────────+
| Reader Workspace              [ Aa ] [✕] |
| "Renewable Energy Economics" · C1        |
+──────────────────────────────────────────+
| ¶ 1  The transition toward sustainable   |
| power has accelerated exponentially...   |
|                                          |
| ¶ 2 s2 Solar and wind installations      |
| account for the majority of new capacity.|
| s3 To [ mitigate the risks ]...          |
|                                          |
| +──────────────────────────────────────+ |
| | FLOATING TOOLBAR: [ + Add ] [ Unpack]| |
| +──────────────────────────────────────+ |
+──────────────────────────────────────────+
| 📑 Drawer: "mitigate" (p2 s3) · [ + Save]|
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Typography**: Reading passage `--type-body-lg` (18px / 28px `--font-serif`), Paragraph counters `--type-caption` (12px `--font-mono`), Heading `--type-h1` (24px bold)
- **Colors**: Canvas `--color-learn-bg-canvas`, Selection highlight `--primitive-indigo-100` (`#e0e7ff`), Border `--color-learn-border-subtle`
- **Toolbar**: Elevation `--elevation-2`, border radius `--radius-md` (8px), touch target `--target-touch-min` (48px)

#### 6. States & Accessibility
- **States**: `Default Reading`, `Text Selected`, `Context Drawer Open`, `Sentence Unpack Active`, `Audio Narration Playing`.
- **Accessibility**: Contrast ratio of text (`#0f172a` on `#ffffff`) is `17.85:1` (Passes AAA). Font size adjustable up to 200% without overlapping paragraphs.

---

### WF-05 — Unified Capture Inbox

#### 1. Traceability & Metadata
- **Screen ID**: `WF-05`
- **Surface**: Learning UI (Library pillar)
- **Canonical Purpose**: Central staging inbox where captured items from Reader, Media, and custom inputs are reviewed, merged, senses confirmed, and explicitly enrolled into FSRS.
- **Canonical Journey**: `J-05 Capture`
- **Capability IDs**: `CAP-011`, `CAP-012`, `CAP-016`, `CAP-046`
- **Omission Invariants**: `S4-OMIT-001` (Custom lexical target capture), `S4-OMIT-007` (Suspended cards filter)
- **REM-003 Rec IDs**: `REC-REM002-006` (Staged Capture Lifecycle), `REC-REM002-008` (Search Returns to Context)

#### 2. Visual Hierarchy & Composition
1. **Inbox Header & Filter Bar**: Total candidates count, source breakdown filter tabs (`All`, `Reader`, `Media`, `Quick Add`), and batch action controls.
2. **Staged Candidate Cards**: Stack of staged items showing target term, sentence excerpt, exact source link, sense dropdown, and duplicate detection badge.
3. **Duplicate / Merge Comparator**: Interactive comparison widget when duplicate headword is detected, offering `[ Merge Senses ]`, `[ Keep Separate ]`, or `[ Discard ]`.
4. **Primary Confirmation Action**: `[ Confirm & Enroll in FSRS ]` button (Default: enrolls as cold card with 0% recall credit; does not emit fake evidence).

#### 3. Desktop Composition (1440px / 1024px)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| OMNIIELTS    | Library · Unified Capture Inbox (4 Staged Candidates)             [ + Quick Add ]   |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
| ☀ Today      | FILTERS: [ All (4) ]  [ 📰 Reader (2) ]  [ 🎬 Media (1) ]  [ ✍ Custom (1) ]        |
| 🕮 Learn      +────────────────────────────────────────────────────────────────────────────────────+
| 🎓 IELTS     | STAGED CANDIDATE 1 OF 4                                                            |
| 📁 Library   | +────────────────────────────────────────────────────────────────────────────────+ |
|   Sources    | | HEADWORD: "account for"                   Source: 📰 Climate Report (p3 s2)    | |
|   Capture (4)| | Excerpt: "...solar and wind installations account for the majority of new..."   | |
|   Errors     | | SENSE SELECTION: [ Phrasal verb: To form a particular amount or part of ▼ ]    | |
| 📊 Analytics | | COLLOCATIONS: [ account for 60% ] [ account for variability ] [ + Add ]        | |
|              | | STATUS: ⚠ DUPLICATE DETECTED (Card #104 exists with sense "To explain reason") | |
|              | | COMPARATOR: [ Merge New Sense into Card #104 ]   [ Save as Separate Card ]     | |
|              | |                                                                                | |
|              | | [ ✓ Confirm & Enroll in FSRS Queue ]    ( Edit Excerpt )    ( Discard Item )   | |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              |                                                                                    |
|              | STAGED CANDIDATE 2 OF 4                                                            |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              | | HEADWORD: "infrastructure"                Source: 🎬 Megacities Video (04:12)  | |
|              | | Excerpt: "High-density infrastructure must adapt to rising sea levels..."      | |
|              | | SENSE: [ Noun: The basic physical systems of a region ▼ ]                      | |
|              | | [ ✓ Confirm & Enroll in FSRS Queue ]                        ( Discard Item )   | |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact)
```
+──────────────────────────────────────────+
| Capture Inbox (4 Staged)      [ + Add ]  |
| Filter: [ All ] [ Reader ] [ Video ]     |
+──────────────────────────────────────────+
| CANDIDATE 1 OF 4                         |
| "account for"                            |
| 📰 Source: Climate Report · p3 s2        |
| Excerpt: "...account for the majority..."|
| Sense: [ Form a particular amount ▼ ]    |
|                                          |
| ⚠ Duplicate found (Card #104)            |
| [ Merge Senses ]  [ Save Separate ]      |
|                                          |
| [ ✓ Confirm & Enroll in FSRS ]           |
| ( Edit Excerpt )        ( Discard )      |
+──────────────────────────────────────────+
| CANDIDATE 2: "infrastructure" (Video) >  |
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `CaptureCandidateCard`, `DuplicateMergeComparator`, `ConfirmImportAction`, `CustomLexicalCaptureInput`
- **Tokens**: Duplicate warning `--primitive-amber-100` background with `--primitive-amber-700` border; Primary CTA `--primitive-indigo-600`
- **Evidence Truth**: Explicit note that confirmation enrolls the item into study queue with zero positive recall credit emitted (`CAPTURE != EVIDENCE`).

#### 6. States & Accessibility
- **States**: `Inbox Empty` (Shows "All candidates confirmed"), `Candidate List`, `Duplicate Comparator Active`, `Batch Selected`.
- **Accessibility**: Form controls have associated labels (`<label for="...">`). Duplicate warning has `role="alert"`. Discard action provides a 5-second undo toast (`CAP-046`).

---

### WF-06 — Error Notebook & Diagnostic Remediation

#### 1. Traceability & Metadata
- **Screen ID**: `WF-06`
- **Surface**: Learning UI (Library pillar)
- **Canonical Purpose**: Grounded error notebook organizing past learner mistakes by skill construct, displaying exact evidence receipts, and launching targeted remediation drills.
- **Canonical Journey**: `J-06 Errors`
- **Capability IDs**: `CAP-013`, `CAP-014`, `CAP-016`, `CAP-030`
- **Omission Invariants**: `S4-OMIT-008` (Exam pacing/target date Analytics linkage)
- **REM-003 Rec IDs**: `REC-REM002-014` (IELTS Grounded Review & Remediation), `REC-REM002-015` (Uncertain Misconception Lifecycle)

#### 2. Visual Hierarchy & Composition
1. **Diagnostic Heatmap & Filter**: Construct weakness breakdown across 4 pillars (Lexical, Grammatical, Listening Acoustic, Reading Inference).
2. **Error Item Cards**: Detailed error log showing question/prompt context, learner response, correct target, assistance state, and error category tags.
3. **EvidenceReceipt Inspection Drawer**: Slide-out panel revealing exact evaluator diagnostics, rule engine version, and confidence score.
4. **Remediation Action Trigger**: Direct launch button for `[ Targeted Drill (5 min) ]` without forcing full-test retakes.

#### 3. Desktop Composition (1440px / 1024px)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| OMNIIELTS    | Library · Error Notebook & Diagnostic Remediation                 [ 📥 Export ]     |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
| ☀ Today      | DIAGNOSTIC WEAKNESS PROFILE: 14 Active Weaknesses Across 4 Constructs              |
| 🕮 Learn      | [ All (14) ] [ 🎧 Listening (4) ] [ 📖 Reading (3) ] [ ✍ Writing (5) ] [ 🕮 Vocab (2) ]|
| 🎓 IELTS     +────────────────────────────────────────────────────────────────────────────────────+
| 📁 Library   | ERROR #ERR-20260822-04 · IELTS Listening Section 2 (Form Completion)               |
|   Sources    | +────────────────────────────────────────────────────────────────────────────────+ |
|   Capture    | | Question: "Customer reference number: __________"                               | |
|   Errors (14)| | Learner Input: "BK7049"  (Marked Incorrect)                                     | |
| 📊 Analytics | | Target Answer: "VK7049"  (Acoustic confusion: /b/ vs /v/ bilabial plosive)      | |
|              | | Source Audio: Official Practice Test 4 · Track 2 (02:14)        [ 🎧 Play Clip]| |
|              | | Assistance State: UNASSISTED (UA) · Confidence: HIGH (0.94)                    | |
|              | |                                                                                | |
|              | | [ 🔍 View Evidence Receipt ]      [ ▶ Launch 5-min Minimal Pair Drill ]        | |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              |                                                                                    |
|              | ERROR #ERR-20260821-09 · IELTS Writing Task 2 (Grammar - Subject-Verb Agreement)   |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              | | Prompt Span: "The proliferation of digital technologies have altered..."       | |
|              | | Diagnostic: Plural noun ("technologies") mistakenly controlled singular head    | |
|              | | Target Correction: "...proliferation of digital technologies HAS altered..."   | |
|              | | [ 🔍 View Evidence Receipt ]      [ ▶ Launch Subject-Verb Remediation ]        | |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact)
```
+──────────────────────────────────────────+
| Error Notebook (14 Active)    [ Filter ] |
| [ Listening: 4 ] [ Writing: 5 ] [Vocab: 2]
+──────────────────────────────────────────+
| 🎧 Listening Section 2 · Form Blank      |
| Input: "BK7049" ✗   Target: "VK7049" ✓   |
| Issue: /b/ vs /v/ Acoustic Confusion     |
| Audio: Track 2 (02:14)         [ 🎧 Play]|
|                                          |
| [ 🔍 View Receipt ]  [ ▶ Launch Drill ]  |
+──────────────────────────────────────────+
| ✍ Writing Task 2 · Agreement Error       |
| "...technologies have altered..." ✗      |
| Target: "...has altered..." ✓            |
| [ 🔍 View Receipt ]  [ ▶ Launch Drill ]  |
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `WeaknessHeatmapList`, `EvidenceReceiptDrawer`, `RemediationActionCard`, `DiagnosticFingerprint`
- **Status Badges**: High confidence `--color-evidence-high-text` (`#047857`), moderate `--color-evidence-med-text` (`#b45309`)
- **Action Triggers**: `ButtonSecondary` for evidence view, `ButtonPrimary` for targeted remediation drill

#### 6. States & Accessibility
- **States**: `List View`, `Receipt Drawer Open`, `Empty Error List` ("Zero active errors"), `Filter by Construct`.
- **Accessibility**: Correct vs incorrect answers indicated by clear text glyphs ("✓ Target" / "✗ Input") in addition to colors. Audio clip player has accessible keyboard controls.

---

### WF-07 — Multi-Dimensional Analytics Dashboard

#### 1. Traceability & Metadata
- **Screen ID**: `WF-07`
- **Surface**: Learning UI (Analytics pillar)
- **Canonical Purpose**: Grounded progress dashboard presenting 4 distinct construct cards with uncertainty bands, 52-week habit heatmap, pacing calculator, and data export.
- **Canonical Journey**: `J-07 Analytics`
- **Capability IDs**: `CAP-002`, `CAP-013`, `CAP-032`, `CAP-038`
- **Omission Invariants**: `S4-OMIT-008` (Exam pacing/target date Analytics widget)
- **REM-003 Rec IDs**: `REC-REM002-007` (Memory vs Skill vs IELTS Separation), `REC-REM002-019` (Inspectable Analytics)

#### 2. Visual Hierarchy & Composition
1. **Four Construct Cards (Non-Fungible)**:
   - *Construct 1: Lexical Memory Stability* (FSRS retention estimate, e.g. 91% retention across 340 cards).
   - *Construct 2: Receptive Skill Accuracy* (Listening & Reading objective task accuracy, e.g. 78%).
   - *Construct 3: Productive Transfer Competence* (Writing & Speaking rubric estimates with uncertainty intervals).
   - *Construct 4: IELTS Exam Readiness Band* (Overall practice band estimate: 7.0 ± 0.5 [Practice Estimate Disclaimer]).
2. **52-Week Habit Heatmap**: Daily consistency grid with accessible row/column labels and keyboard roving tabindex.
3. **Pacing Calculator Widget**: Interactive workload estimator based on target exam date and daily minute commitment.

#### 3. Desktop Composition (1440px / 1024px)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| OMNIIELTS    | Analytics & Progress · Target: Band 7.5 (Dec 2026)                [ 📥 Export Data ]|
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
| ☀ Today      | FOUR DISTINCT CONSTRUCT EVALUATIONS (Memory != Skill != IELTS Readiness)          |
| 🕮 Learn      | +──────────────────────────+ +──────────────────────────+ +──────────────────────+ |
| 🎓 IELTS     | | 1. LEXICAL MEMORY (FSRS) | | 2. RECEPTIVE SKILLS      | | 3. PRODUCTIVE TRANSFER | |
| 📁 Library   | | Stability: 8.4d average  | | Listening Accuracy: 82%  | | Writing Lexical: 7.0   | |
| 📊 Analytics | | Retention Rate: 91.2%    | | Reading Accuracy: 76%    | | Speaking Fluency: 6.5  | |
|              | | 342 active cards in FSRS | | 15 objective families    | | Uncertainty: ± 0.4 band| |
|              | +──────────────────────────+ +──────────────────────────+ +──────────────────────+ |
|              | | 4. IELTS PRACTICE ESTIMATE: Overall Band 7.0 (Range: 6.5 - 7.5)                | |
|              | | Disclaimer: Formative practice indicator only; not an official IELTS test score. | |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              |                                                                                    |
|              | 52-WEEK STUDY HABIT GRID                                                           |
|              | Mon ■■■□■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                     |
|              | Wed ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                     |
|              | Fri ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■                     |
|              |                                                                                    |
|              | PACING CALCULATOR: Target Exam: Dec 15, 2026 (114 days remaining)                  |
|              | Recommended daily pace: 35 min/day · Estimated complete syllabus coverage: 94%     |
|              | [ Adjust Target Date ]  [ Recalculate Pacing Plan ]                                |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact)
```
+──────────────────────────────────────────+
| Analytics & Progress          [ Export ] |
| Target: Band 7.5 (Dec 2026)              |
+──────────────────────────────────────────+
| 1. Lexical Memory: 91% Retention (FSRS)  |
| 2. Receptive Accuracy: L 82% · R 76%     |
| 3. Productive Rubrics: W 7.0 · S 6.5     |
| 4. Practice Band Estimate: 7.0 (±0.5)    |
|    [ Practice estimate; not official ]   |
+──────────────────────────────────────────+
| 52-WEEK HABIT GRID (Weekly summary)      |
| Current Streak: 18 days · 4.2 hrs/wk     |
+──────────────────────────────────────────+
| PACING CALCULATOR                        |
| 114 days to exam · 35 min/day needed     |
| [ Change Goal / Date ]                   |
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `ConstructCardGrid`, `HabitGrid52W`, `PacingCalculatorWidget`, `UncertaintyBandToken`
- **Tokens**: Card background `--color-learn-bg-surface`, border `--color-learn-border-subtle`, display metric `--type-display` (32px bold)
- **Uncertainty Presentation**: Visual confidence brackets (`[6.5 — 7.5]`) with explicit disclaimer text.

#### 6. States & Accessibility
- **States**: `Default Metrics View`, `Under-determined Data State` (Wide uncertainty band), `Custom Date Picker Open`, `Data Export Triggered`.
- **Accessibility**: 52-Week grid supports keyboard navigation with arrow keys; screen reader announces date, duration, and completed status per cell.

---

### WF-08 — IELTS Listening (Exam & Practice Modes)

#### 1. Traceability & Metadata
- **Screen ID**: `WF-08`
- **Surface**: Dual Surface (Surface B: Strict Exam UI vs Surface A: Formative Practice)
- **Canonical Purpose**: Official four-part IELTS Listening test runner with single-play audio enforcement, 40-item question palette, official clock, and post-attempt transcript analysis in practice mode.
- **Canonical Journey**: `J-08 Listening`
- **Capability IDs**: `CAP-018`, `CAP-019`, `CAP-031`, `CAP-032`, `CAP-033`
- **Omission Invariants**: `S4-OMIT-003` (AntiCheatingMask), `S4-OMIT-009` (Exact audio playback rates in practice mode)
- **REM-003 Rec IDs**: `REC-REM002-010` (Listening Cue Identity), `REC-REM002-016` (Official Strict Exam Semantics)

#### 2. Visual Hierarchy & Composition
1. **Exam Top Bar (`ExamHeader`)**: Section name (`Listening Part 2`), Official countdown timer (`28:14`), Question count (`Q 11/40`), `[ End Section ]` safeguard button.
2. **Audio Track Status Strip**: Uncontrollable single-play progress indicator in strict exam mode (`"Audio Playing — Section 2 (Do not refresh)"`).
3. **Split Question / Response Workspace**: Active question form (Form completion, Map labeling, Multiple choice single/plural).
4. **Question Palette Footer**: 40 numbered buttons showing unanswered, answered, flagged, and active states with roving keyboard navigation.

#### 3. Desktop Composition (1440px / 1024px — Strict Exam UI)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| IELTS ACADEMIC LISTENING · Part 2 of 4         Time Remaining: [ 28:14 ]          [ End Test ]     |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| AUDIO STATUS: 🔊 Audio is playing (Single-play test audio · Volume: [ ────●── ])                  |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| QUESTIONS 11 - 15: Map Labeling (City Harbor Redevelopment)                                       |
|                                                                                                   |
| +───────────────────────────────────────────+  Questions:                                         |
| |                                           |  11. Visitor Information Centre: [ B: Pier Head ▼ ] |
| | [ MAP GRAPHIC: Harbor Coordinate Layout ] |  12. Historical Museum:           [ Select letter ▼]|
| | A: North Dock   B: Pier Head              |  13. Ferry Terminal:              [ Select letter ▼]|
| | C: Promenade    D: Customs House          |  14. Bicycle Rental Hub:          [ Select letter ▼]|
| |                                           |  15. Public Amphitheatre:         [ Select letter ▼]|
| +───────────────────────────────────────────+                                                     |
|                                                                                                   |
| [ ⚑ Flag Question 11 for Review ]                     [ ← Previous Q ]  [ Next Q (12) → ]         |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| PALETTE: [01][02][03][04][05][06][07][08][09][10] |11| (12)(13)(14)(15) ⚑16 ... (40)  Status: 10/40|
+───────────────────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact — Strict Exam UI)
```
+──────────────────────────────────────────+
| IELTS Listening · Part 2    [ 28:14 ] [✕]|
| 🔊 Audio Playing (Single-play)           |
+──────────────────────────────────────────+
| Q 11-15: Map Labeling (Harbor)           |
| [ View Map Graphic (Tap to expand) ]     |
|                                          |
| Q 11. Visitor Information Centre:        |
| ( ) A: North Dock                        |
| (•) B: Pier Head                         |
| ( ) C: Promenade                         |
| ( ) D: Customs House                     |
|                                          |
| [ ⚑ Flag ]    [ ← Prev ]    [ Next → ]   |
+──────────────────────────────────────────+
| 📋 Palette (10/40 Answered) · [ Submit ] |
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Header**: Background `--color-exam-header-bg` (`#1e293b`), text `--color-exam-header-text` (`#f8fafc`), timer `--type-mono-timer` (20px bold mono)
- **Palette Items**: Unanswered (`#ffffff`, 1px `--primitive-slate-300` border), Answered (`--primitive-slate-700`, white text), Flagged (`--primitive-amber-100`, amber border + flag glyph), Current (`--primitive-indigo-600` ring)
- **Timer Warning States**: Normal (`#f8fafc`), 10-minute warning (`--primitive-amber-500`), 5-minute critical (`--primitive-rose-500`)

#### 6. States & Accessibility
- **States**: `Audio Playing (Locked)`, `Audio Complete (Transfer Time)`, `Flagged Item`, `Review Screen Active`, `Post-Attempt Diagnostic (Practice mode only)`.
- **Accessibility**: Map diagram paired with accessible table alternative. Palette supports keyboard arrow keys (roving tabindex). High-contrast dark header passes AAA (`13.98:1`).

---

### WF-09 — IELTS Academic Reading (Split-Pane Runner)

#### 1. Traceability & Metadata
- **Screen ID**: `WF-09`
- **Surface**: Dual Surface (Surface B: Strict Exam UI vs Surface A: Formative Practice)
- **Canonical Purpose**: Split-pane Academic Reading runner featuring authentic 3-passage structure, 15 objective question types, draggable divider, paragraph highlighter, and 40-question palette.
- **Canonical Journey**: `J-09 Academic Reading`
- **Capability IDs**: `CAP-020`, `CAP-031`, `CAP-032`, `CAP-033`
- **Omission Invariants**: `S4-OMIT-003` (AntiCheatingMask)
- **REM-003 Rec IDs**: `REC-REM002-011` (Reading Passage Evidence / Rationale), `REC-REM002-016` (Official Strict Exam Semantics)

#### 2. Visual Hierarchy & Composition
1. **Exam Header**: Passage indicator (`Passage 2 of 3`), timer countdown (`41:20`), question progress (`Q 14..26`), `[ End Section ]`.
2. **Left Passage Pane**: Academic article (800-1000 words), sticky passage tabs, line numbers, text highlight tool (`Yellow` / `Pink` / `Underline`).
3. **Right Question Pane**: Active question group (True/False/Not Given, Matching Headings, Sentence Completion).
4. **Draggable & Accessible Divider**: 8px central divider supporting mouse drag and keyboard arrow-key resizing.
5. **Question Palette Footer**: Persistent 40-item navigation bar.

#### 3. Desktop Composition (1440px / 1024px — Strict Exam UI)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| IELTS ACADEMIC READING · Passage 2 of 3        Time Remaining: [ 41:20 ]          [ End Test ]     |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| PASSAGE 2: "The Secrets of Biomimicry"        | QUESTIONS 14 - 18: True / False / Not Given        |
| [ Highlight ]  [ Clear ]  [ Text Size: Aa ]   |                                                    |
|                                             ║ | Do the following statements agree with the info?   |
| ¶ 1  Biomimicry is the practice of learning ║ | TRUE: if statement agrees with information        |
| from and mimicking nature's forms,          ║ | FALSE: if statement contradicts information        |
| processes, and ecosystems to create more    ║ | NOT GIVEN: if there is no information on this      |
| sustainable human inventions.               ║ |                                                    |
|                                             ║ | Q 14. Geckos use chemical adhesives to adhere to   |
| ¶ 2  For decades, engineers struggled to    ║ |       vertical surfaces.                           |
| replicate the adhesive qualities of gecko   ║ | [ ( ) TRUE ]   [ (•) FALSE ]   [ ( ) NOT GIVEN ]   |
| feet. Microscopic van der Waals forces, not ║ |                                                    |
| chemical secretions, allow geckos to climb. ║ | Q 15. Synthetic setae have been commercialized.    |
|                                             ║ | [ ( ) TRUE ]   [ ( ) FALSE ]   [ (•) NOT GIVEN ]   |
| ¶ 3  Recent synthetic polymers have finally ║ |                                                    |
| achieved comparable reversible adhesion...  ║ | [ ⚑ Flag Q 14 ]    [ ← Previous ]   [ Next (15) → ]|
+─────────────────────────────────────────────╩─+───────────────────────────────────────────────────+
| PALETTE: [01..13 Answered] |14| |15| (16)(17)(18) (19..40 Unanswered)            Status: 14/40   |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact — Strict Exam UI)
```
+──────────────────────────────────────────+
| IELTS Reading · Pass 2      [ 41:20 ] [✕]|
| TAB SWITCH: [ 📖 Passage ]  [ 📝 Q 14-26 ]|
+──────────────────────────────────────────+
| ACTIVE TAB: QUESTIONS 14-18              |
| Q 14. Geckos use chemical adhesives to   |
| adhere to vertical surfaces.             |
| [ ( ) TRUE ]  [ (•) FALSE ]  [ ( ) NG ]  |
|                                          |
| Q 15. Synthetic setae commercialized...  |
| [ ( ) TRUE ]  [ ( ) FALSE ]  [ (•) NG ]  |
|                                          |
| [ 📖 View Relevant Passage Excerpt > ]   |
| [ ⚑ Flag ]    [ ← Prev ]    [ Next → ]   |
+──────────────────────────────────────────+
| 📋 Palette (14/40 Answered) · [ Submit ] |
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `ExamSplitPane`, `AcademicPassageView`, `ObjectiveQuestionFamily` (All 15 standardized task primitives), `QuestionPaletteGrid`
- **Passage Typography**: `--type-body-lg` (18px / 28px `--font-serif`), Question typography: `--type-body` (15px `--font-sans`)
- **Divider Token**: Width 8px, border `--color-exam-border-divider` (`#cbd5e1`), keyboard step 5% per arrow key press.

#### 6. States & Accessibility
- **States**: `Split Pane 50/50`, `Split Pane 70/30 (Passage focus)`, `Mobile Passage Tab`, `Mobile Question Tab`, `Flagged Item Active`.
- **Accessibility**: Passage line length bounded $\le 72\text{ch}$. Divider is keyboard focusable (`role="separator"`, `aria-valuenow="50"`). Radio buttons properly grouped (`role="radiogroup"`).

---

### WF-10 — IELTS General Training Reading (Multi-Text Runner)

#### 1. Traceability & Metadata
- **Screen ID**: `WF-10`
- **Surface**: Dual Surface (Surface B: Strict Exam UI vs Surface A: Formative Practice)
- **Canonical Purpose**: IELTS General Training Reading runner accommodating Section 1/2 short factual workplace and daily life texts and Section 3 long general interest text.
- **Canonical Journey**: `J-10 GT Reading`
- **Capability IDs**: `CAP-021`, `CAP-031`, `CAP-032`, `CAP-033`
- **Omission Invariants**: `S4-OMIT-003` (AntiCheatingMask)
- **REM-003 Rec IDs**: `REC-REM002-011` (Reading Evidence / Rationale), `REC-REM002-016` (Official Strict Exam Semantics)

#### 2. Visual Hierarchy & Composition
1. **GT Section Navigation**: Multi-text sub-tabs in Left Pane (`Text A: Staff Training Notice`, `Text B: Expense Claims Policy`).
2. **Text Switcher**: Clear visual separation between short workplace documents.
3. **Right Question Pane**: Matching Information, Short Answer Questions, Sentence Completion.
4. **Palette Footer**: 40-item navigation bar.

#### 3. Desktop Composition (1440px / 1024px — Strict Exam UI)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| IELTS GENERAL TRAINING READING · Section 1     Time Remaining: [ 52:40 ]          [ End Test ]     |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| SECTION 1: WORKPLACE NOTICES                  | QUESTIONS 1 - 7: Matching Information              |
| [ Text A: Library Hours ] [ Text B: Security] ║                                                    |
|                                             ║ | Look at the four notices A - D.                    |
| TEXT B: BUILDING SECURITY & PASS POLICIES   ║ | Which notice contains the following information?   |
| • All employees must display photo ID badges ║ | Write the correct letter A - D in boxes 1 - 4.    |
|   at all times while on company premises.   ║ |                                                    |
| • Visitors must sign in at Reception and be ║ | Q 1. Procedures for lost security cards:          |
|   escorted by their host.                   ║ | [ Select Notice: B - Building Security ▼ ]         |
| • Lost passes must be reported immediately  ║ |                                                    |
|   to Facilities on extension 4402.          ║ | Q 2. Weekend parking restrictions:                 |
|                                             ║ | [ Select Notice: D - Car Park Notice ▼ ]           |
|                                             ║ | [ ⚑ Flag Q 1 ]     [ ← Previous ]    [ Next → ]    |
+─────────────────────────────────────────────╩─+───────────────────────────────────────────────────+
| PALETTE: |01| |02| (03..40 Unanswered)                                           Status: 2/40    |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact — Strict Exam UI)
```
+──────────────────────────────────────────+
| IELTS GT Reading · Sec 1    [ 52:40 ] [✕]|
| TEXTS: [ Text A ] [ Text B (Active) ]    |
+──────────────────────────────────────────+
| TEXT B: BUILDING SECURITY POLICIES       |
| • Lost passes must be reported to ext    |
|   4402 immediately...                    |
|                                          |
| QUESTIONS 1 - 7: Matching Info           |
| Q 1. Procedures for lost security cards: |
| [ Select Notice: B ▼ ]                   |
|                                          |
| [ ⚑ Flag ]    [ ← Prev ]    [ Next → ]   |
+──────────────────────────────────────────+
| 📋 Palette (2/40 Answered) · [ Submit ]  |
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `ExamSplitPane`, `GTSectionMultiTextView`, `ObjectiveQuestionFamily`, `QuestionPaletteGrid`
- **Tokens**: Tab switcher background `--primitive-slate-200`, active tab `--primitive-indigo-600` underline, question text `--type-body` (15px regular)

#### 6. States & Accessibility
- **States**: `Section 1 (Multiple Texts)`, `Section 2 (Workplace Texts)`, `Section 3 (Extended Article)`, `Text Switched`.
- **Accessibility**: Multi-text sub-tabs announce active document name via `aria-controls` and `aria-selected`.

---

### WF-11 — IELTS Writing Task 1 (Academic Visual & GT Letter Workspaces)

#### 1. Traceability & Metadata
- **Screen ID**: `WF-11`
- **Surface**: Dual Surface (Surface B: Strict Exam UI vs Surface A: Formative Practice)
- **Canonical Purpose**: IELTS Writing Task 1 runner supporting Academic visual reports (7 visual families + accessible data tables) and General Training formal/informal letters, live word count, and 20-minute pacing guidance.
- **Canonical Journey**: `J-11 Writing Task 1`
- **Capability IDs**: `CAP-017`, `CAP-022`, `CAP-023`, `CAP-025`, `CAP-032`, `CAP-033`
- **Omission Invariants**: `S4-OMIT-008` (Pacing guidance)
- **REM-003 Rec IDs**: `REC-REM002-012` (Writing Criterion / Span / Action), `REC-REM002-016` (Official Strict Exam Semantics)

#### 2. Visual Hierarchy & Composition
1. **Writing Task Header**: Track badge (`Academic Visual Report` / `GT Formal Letter`), shared 60-minute test clock with ~20-minute Task 1 pacing marker.
2. **Left Prompt & Graphic Pane**: Task instructions, high-resolution SVG chart/diagram with zoom controls and mandatory `[ View Semantic Data Table ]` accessible view.
3. **Right Essay Editor Pane**: Clean text editor, live word count with 150-word threshold indicator (`162 words · Threshold Met`), draft autosave status.
4. **Formative Mode (Practice Only)**: Expandable 4-criterion feedback panel (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).

#### 3. Desktop Composition (1440px / 1024px — Academic Task 1 Exam UI)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| IELTS WRITING · Task 1 of 2 (Academic)         Time Remaining: [ 58:10 ]          [ End Test ]     |
| Recommended time: 20 minutes · Write at least 150 words                                            |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| TASK PROMPT & VISUAL DATA                     | ESSAY RESPONSE WORKSPACE                           |
| The chart below shows energy consumption      ║ +────────────────────────────────────────────────+ |
| by fuel type in Australia (2000 - 2025).      ║ | The bar chart illustrates Australian energy    | |
| Summarise the information by selecting and    ║ | consumption across four primary fuel sources   | |
| reporting the main features, and make         ║ | between 2000 and 2025.                         | |
| comparisons where relevant.                   ║ |                                                | |
|                                               ║ | Overall, fossil fuel dependency declined       | |
| +───────────────────────────────────────────+ ║ | steadily, whereas renewable generation         | |
| | [ BAR CHART: 2000 vs 2010 vs 2025 ]       | ║ | experienced exponential growth over the      | |
| | Coal: 60% → 45% → 28%                     | ║ | 25-year period. In 2000, coal accounted for   | |
| | Renewables: 5% → 18% → 42%                | ║ | 60% of total output...                       | |
| +───────────────────────────────────────────+ ║ +────────────────────────────────────────────────+ |
| [ 📊 View Accessible Data Table ]             ║ Word Count: 164 words (Minimum: 150 words ✓)       |
| [ 🔍 Zoom Chart (100%) ]                      ║ Autosave: Checkpoint saved at 09:42:10            |
|                                               ║ [ Switch to Task 2 (Essay) ]     [ Flag Task ]    |
+─────────────────────────────────────────────╩─+───────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact — Task 1 Exam UI)
```
+──────────────────────────────────────────+
| IELTS Writing · Task 1      [ 58:10 ] [✕]|
| Min: 150 words · Rec time: 20 min        |
+──────────────────────────────────────────+
| 📊 Australian Energy Consumption Chart   |
| [ View High-Res Chart ] [ View Table ]   |
+──────────────────────────────────────────+
| YOUR WRITING RESPONSE                    |
| +──────────────────────────────────────+ |
| | The bar chart illustrates Australian | |
| | energy consumption across four...    | |
| +──────────────────────────────────────+ |
| Words: 164 (✓ 150 met) · Saved 09:42     |
| [ Switch to Task 2 > ]                   |
+──────────────────────────────────────────+
| 📋 Writing Overview (Task 1 / Task 2)    |
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `Task1VisualContainer`, `SemanticDataTable`, `GTLetterWorkspace`, `EssayEditor`, `WordCounter`
- **Word Counter Tokens**: Under 150 words (`--primitive-amber-600`), 150+ words threshold met (`--primitive-emerald-600`)
- **Typography**: Textarea `--font-sans` (15px/24px line height), Word counter `--type-mono-timer` (14px semibold)

#### 6. States & Accessibility
- **States**: `Academic Chart View`, `Semantic Data Table View`, `GT Letter Checklist Active`, `Under Word Limit Warning`, `Task 2 Switched`.
- **Accessibility**: Mandatory HTML `<table>` alternative for all visual graphics. Textarea properly linked to word count via `aria-describedby`.

---

### WF-12 — IELTS Writing Task 2 (Essay Editor & Criterion Feedback)

#### 1. Traceability & Metadata
- **Screen ID**: `WF-12`
- **Surface**: Dual Surface (Surface B: Strict Exam UI vs Surface A: Formative Practice)
- **Canonical Purpose**: IELTS Writing Task 2 essay workspace with prompt analysis, outline scratchpad, 250-word threshold tracking, 40-minute pacing guide, and 4-criterion diagnostic scoring in formative mode.
- **Canonical Journey**: `J-12 Writing Task 2`
- **Capability IDs**: `CAP-024`, `CAP-025`, `CAP-032`, `CAP-033`
- **Omission Invariants**: `S4-OMIT-008` (Pacing guidance)
- **REM-003 Rec IDs**: `REC-REM002-012` (Writing Criterion / Span / Action), `REC-REM002-016` (Official Strict Exam Semantics)

#### 2. Visual Hierarchy & Composition
1. **Exam Header**: `Writing Task 2 (Essay)`, total exam clock (`38:10`), `[ Switch to Task 1 ]`, `[ End Test ]`.
2. **Left Prompt & Plan Pane**: Essay prompt (Opinion, Discussion, Problem-Solution, Two-Part Question), optional `Outline Scratchpad Drawer`.
3. **Right Essay Editor**: Large distraction-free text area, 250-word threshold indicator (`268 words · Minimum Met`), draft autosave status.
4. **Formative Feedback Panel (Practice Mode Only)**: 4-criterion evaluation cards:
   - *Task Response (TR)*: Position clarity and idea development.
   - *Coherence & Cohesion (CC)*: Paragraphing and cohesive device variety.
   - *Lexical Resource (LR)*: Academic collocations and precision.
   - *Grammatical Range & Accuracy (GRA)*: Complex sentence accuracy.

#### 3. Desktop Composition (1440px / 1024px — Task 2 Exam UI)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| IELTS WRITING · Task 2 of 2 (Essay)            Time Remaining: [ 38:10 ]          [ End Test ]     |
| Recommended time: 40 minutes · Write at least 250 words                                            |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| ESSAY PROMPT & INSTRUCTIONS                   | ESSAY RESPONSE WORKSPACE                           |
| Some people believe that unpaid community     ║ +────────────────────────────────────────────────+ |
| service should be a compulsory part of high   ║ | In contemporary educational discourse, whether | |
| school programmes. To what extent do you      ║ | voluntary community service should be made     | |
| agree or disagree?                            ║ | mandatory for secondary students remains a     | |
| Give reasons for your answer and include      ║ | contentious issue.                             | |
| relevant examples from your knowledge.        ║ |                                                | |
|                                               ║ | On the one hand, proponents argue that civic   | |
| +───────────────────────────────────────────+ ║ | engagement instills essential social values... | |
| | OUTLINE SCRATCHPAD (Optional)             | ║ |                                                | |
| | • Intro: Balanced position (support with  | ║ |                                                | |
| |   flexibility)                            | ║ |                                                | |
| | • Body 1: Social empathy, teamwork        | ║ |                                                | |
| | • Body 2: Academic burden risk            | ║ |                                                | |
| | • Conclusion: Incentive-based policy      | ║ |                                                | |
| +───────────────────────────────────────────+ ║ +────────────────────────────────────────────────+ |
| [ 📝 Hide / Show Outline Drawer ]             ║ Word Count: 272 words (Minimum: 250 words ✓)       |
|                                               ║ Autosave: Checkpoint saved at 09:44:12            |
|                                               ║ [ Switch to Task 1 ]             [ Flag Task ]    |
+─────────────────────────────────────────────╩─+───────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact — Task 2 Exam UI)
```
+──────────────────────────────────────────+
| IELTS Writing · Task 2      [ 38:10 ] [✕]|
| Min: 250 words · Rec time: 40 min        |
+──────────────────────────────────────────+
| PROMPT: Unpaid community service for     |
| high school students. Agree / Disagree?  |
| [ 📝 Open Outline Scratchpad ]           |
+──────────────────────────────────────────+
| YOUR ESSAY RESPONSE                      |
| +──────────────────────────────────────+ |
| | In contemporary educational discourse, | |
| | whether voluntary community service... | |
| +──────────────────────────────────────+ |
| Words: 272 (✓ 250 met) · Saved 09:44     |
| [ Switch to Task 1 > ]                   |
+──────────────────────────────────────────+
| 📋 Writing Overview (Task 1 / Task 2)    |
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `EssayEditor`, `OutlineDrawer`, `FourCriterionFeedbackCard`, `WordCounter`
- **Feedback Tokens**: 4 band cards with `--color-evidence-high-bg` / `--color-evidence-high-text`
- **Typography**: Textarea `--font-sans` (16px / 26px line height for optimal drafting comfort)

#### 6. States & Accessibility
- **States**: `Drafting (Under 250 words)`, `Drafting (250+ words)`, `Outline Drawer Open`, `Formative Criterion Review Open`.
- **Accessibility**: Outline drawer traps focus when open on mobile. Live word count announces threshold milestones (150w, 250w) via `aria-live="polite"`.

---

### WF-13 — IELTS Speaking (Part 1, Part 2 Pinned Notes & Part 3)

#### 1. Traceability & Metadata
- **Screen ID**: `WF-13`
- **Surface**: Guided Practice & Exam Simulation UI
- **Canonical Purpose**: IELTS Speaking workspace supporting 3-part structure, persistent Part 2 preparation notes surviving into response phase, 1:45 warning chime/banner, local audio safety bar, and bounded examiner simulation truth.
- **Canonical Journey**: `J-13 Speaking`
- **Capability IDs**: `CAP-026`, `CAP-027`, `CAP-028`, `CAP-032`, `CAP-033`, `CAP-040`
- **Omission Invariants**: `S4-OMIT-010` (Speaking Part 2 pinned notes), `S4-OMIT-008` (Speaking pacing)
- **REM-003 Rec IDs**: `REC-REM002-013` (Speaking Criterion / Segment Flow), `REC-REM002-028` (Ephemeral Recording Safety)

#### 2. Visual Hierarchy & Composition
1. **Speaking Stage Top Bar**: Part indicator (`Speaking Part 2: Long Turn`), phase clock (`Prep: 00:00 → Speaking: 01:45 / 02:00`), audio recording waveform.
2. **Cue Card Container**: Candidate topic card with bullet points ("Describe an environmental project...").
3. **Persistent Part 2 Pinned Notes Workbench**: Candidate scratchpad that remains pinned and fully editable during 1-minute prep and stays visible during the 2-minute speaking turn.
4. **Audible & Visual 1:45 Alert**: Yellow header banner appearing at 1m45s alerting candidate to wrap up response.
5. **Session-Scoped Audio Safety Bar**: Status of local microphone, explicit `[ 💾 Download Raw Audio ]` button, and exit guard disclosure.

#### 3. Desktop Composition (1440px / 1024px)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| IELTS SPEAKING · Part 2 of 3 (Long Turn)        Speaking Time: [ 01:48 / 02:00 ]   [ End Part ]   |
| ⚠ 1:45 ALERT: 12 seconds remaining — please conclude your final point.                            |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| PART 2 TOPIC CUE CARD                         | PINNED CANDIDATE NOTES (Persists during turn)      |
| Describe an environmental project in your     ║ +────────────────────────────────────────────────+ |
| city that had a positive impact.              ║ | • River cleanup initiative (2024)              | |
| You should say:                               ║ | • Industrial waste + plastic pollution issue   | |
| - What the project was                        ║ | • Municipal funding & community volunteers     | |
| - How it was carried out                      ║ | • Outcome: 80% reduction in water toxins       | |
| - What challenges were faced                  ║ | • Personal takeaway: civic responsibility      | |
| and explain why it was successful.            ║ +────────────────────────────────────────────────+ |
|                                               ║ Notes remain pinned and visible throughout Part 2  |
+─────────────────────────────────────────────╩─────────────────────────────────────────────────────+
| LIVE RECORDING WAVEFORM:  ───/\/\/\──/\/\/\/\──/\/\──  [ 🔴 Recording Active ]                     |
| Audio Safety: Stored in session memory only · [ 💾 Download Raw Recording (.wav) ]                |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| [CURRENT]: Structured 3-Part Guided Recording Runner & Audio Safety Bar                            |
| [OWNER_RECONFIRMED_FUTURE]: Interactive AI Examiner Simulation (Reserved for post-Stage 4)         |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact)
```
+──────────────────────────────────────────+
| IELTS Speaking · Part 2    [ 01:48/02:00]|
| ⚠ 1:45 Alert: Wrap up final point        |
+──────────────────────────────────────────+
| CUE CARD: Environmental Project          |
| • What it was                            |
| • How it was carried out                 |
| • Why it was successful                  |
+──────────────────────────────────────────+
| PINNED NOTES (Visible during turn):      |
| ┌──────────────────────────────────────┐ |
| │ • River cleanup project (2024)       │ |
| │ • Volunteers & municipal funds       │ |
| │ • Outcome: 80% toxic reduction       │ |
| └──────────────────────────────────────┘ |
| 🔴 Recording: ──/\/\/\── [ 💾 Download ] |
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `Part1InterviewCard`, `Part2NotesWorkbench`, `Part3DiscussionCard`, `SpeakingWarningBanner`, `AudioSafetyBar`
- **1:45 Alert Tokens**: Background `--primitive-amber-100` (`#fef3c7`), border `--primitive-amber-600` (`#d97706`), text `--primitive-amber-900` (`#78350f`)
- **Truth Labeling**: Part 1/2/3 runner is `[CURRENT]`; full interactive examiner conversation is explicitly tagged `[OWNER_RECONFIRMED_FUTURE]`.

#### 6. States & Accessibility
- **States**: `Part 1 Turn`, `Part 2 1-min Preparation`, `Part 2 2-min Speaking`, `1:45 Urgency Banner Active`, `Part 3 Discussion`, `Audio Saved/Exported`.
- **Accessibility**: 1:45 warning chime is accompanied by prominent visual banner (`role="alert"`). Audio recording status clearly announced for assistive technology.

---

### WF-14 — IELTS Full Mock Test Orchestrator & Multi-Skill Scorecard

#### 1. Traceability & Metadata
- **Screen ID**: `WF-14`
- **Surface**: Dual Surface (Exam Shell Orchestrator $\to$ Learning UI Scorecard)
- **Canonical Purpose**: Full 4-skill mock test runner with hardware prechecks, crash recovery checkpoints, seamless section transitions, and honest multi-skill scorecard disclosing Speaking pending status.
- **Canonical Journey**: `J-14 Mock Test`
- **Capability IDs**: `CAP-017`, `CAP-029`, `CAP-032`, `CAP-033`
- **Omission Invariants**: `S4-OMIT-008` (Scorecard pacing/disclaimer)
- **REM-003 Rec IDs**: `REC-REM002-016` (Official Strict Exam Semantics), `REC-REM002-017` (Full-Test Limitations to Action), `REC-REM002-027` (Distinct Full / Section Scopes)

#### 2. Visual Hierarchy & Composition
1. **Precheck Step (Pre-Test)**: Audio output test, mic input test, storage checkpoint verification, and explicit Speaking scheduling choice (`Complete Speaking Now` vs `Schedule Speaking Separately`).
2. **Test Orchestration Flow**: Sequential execution of Listening (30m) $\to$ Reading (60m) $\to$ Writing (60m) $\to$ Speaking (15m or Scheduled).
3. **Post-Test Multi-Skill Scorecard**: Comprehensive results summary with individual skill bands, detailed error links, and honest practice estimate disclaimer.

#### 3. Desktop Composition (1440px / 1024px — Scorecard UI)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| OMNIIELTS    | Full Mock Test Results · Mock Simulation #MOCK-20260822-01         [ 📥 PDF Report ]|
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
| ☀ Today      | MOCK TEST SUMMARY: Academic Track · Completed Aug 22, 2026                         |
| 🕮 Learn      | +────────────────────────────────────────────────────────────────────────────────+ |
| 🎓 IELTS     | | ESTIMATED OVERALL BAND: 7.0   (Listening: 7.5 | Reading: 7.0 | Writing: 6.5)   | |
|   Hub        | | Speaking Status: [ 🕒 PENDING / SCHEDULED FOR 14:00 ] [ Complete Speaking Now ] | |
|   Mocks (1)  | | Practice Estimate Disclaimer: This estimate is computed from formative practice| |
| 📁 Library   | | drills and does not guarantee official IELTS certification.                    | |
| 📊 Analytics | +────────────────────────────────────────────────────────────────────────────────+ |
|              |                                                                                    |
|              | SKILL BREAKDOWN & EVIDENCE LINKS                                                   |
|              | +──────────────────────+ +──────────────────────+ +──────────────────────────────+ |
|              | | 🎧 LISTENING: 32/40  | | 📖 READING: 30/40    | | ✍ WRITING: Est Band 6.5      | |
|              | | Band: 7.5 (Pass)     | | Band: 7.0 (Pass)     | | TR: 7.0 · CC: 6.5 · LR: 6.5  | |
|              | | [ Review 8 Errors > ]| | [ Review 10 Errors >]| | [ Review Task 1/2 Feedback >] | |
|              | +──────────────────────+ +──────────────────────+ +──────────────────────────────+ |
|              |                                                                                    |
|              | GROUNDED NEXT ACTIONS                                                              |
|              | [ ▶ Send 18 Errors to Error Notebook ]      [ ▶ Return to Today Dashboard ]        |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact — Scorecard UI)
```
+──────────────────────────────────────────+
| Mock Test Results             [ PDF ]    |
| Simulation #MOCK-20260822-01             |
+──────────────────────────────────────────+
| OVERALL BAND ESTIMATE: 7.0 (L/R/W)       |
| • Listening: Band 7.5 (32/40)            |
| • Reading: Band 7.0 (30/40)              |
| • Writing: Band 6.5 (Formative)          |
| • Speaking: 🕒 Pending / Scheduled       |
|                                          |
| [ Complete Speaking Now ]                |
+──────────────────────────────────────────+
| [ Review 18 Test Errors in Notebook > ]  |
| [ Return to Today Dashboard ]            |
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `MockPrecheckCard`, `ExamShellOrchestrator`, `MockScorecard`, `SignedPackProvenanceCard`
- **Scorecard Typography**: Overall band `--type-display` (32px bold), Skill headers `--type-h2` (20px semibold)
- **Pending Badge**: Background `--primitive-amber-50`, text `--primitive-amber-700` (`#b45309`)

#### 6. States & Accessibility
- **States**: `Hardware Precheck`, `In-Test Section Transitions`, `Test Completed`, `Speaking Pending`, `Speaking Complete`.
- **Accessibility**: Scorecard structure uses semantic headings and lists. Speaking pending status clearly disclosed to screen readers.

---

### WF-15 — Settings / AI / Data Safety & Signed Content

#### 1. Traceability & Metadata
- **Screen ID**: `WF-15`
- **Surface**: Shared Utility UI
- **Canonical Purpose**: Central governance and safety control center managing AI consent receipts, IndexedDB backup registry status, offline signed pack catalogs, companion ASR readiness, and runtime roadmap audit.
- **Canonical Journey**: `J-15 Settings`
- **Capability IDs**: `CAP-035`, `CAP-036`, `CAP-037`, `CAP-038`, `CAP-039`, `CAP-041`, `CAP-042`, `CAP-043`, `CAP-044`, `CAP-045`
- **Omission Invariants**: `S4-OMIT-011` (Signed pack provenance inspection), `S4-OMIT-012` (Roadmap runtime status audit)
- **REM-003 Rec IDs**: `REC-REM002-009` (Signed Catalog Trust Lifecycle), `REC-REM002-020` (Evidence / Consent Disclosure), `REC-REM002-021` (Data Safety / Degraded Lifecycle), `REC-REM002-022` (Service & ASR Readiness)

#### 2. Visual Hierarchy & Composition
1. **Settings Category Navigation**: 5 sub-views (`General Preferences`, `AI & Privacy Consent`, `Backup & Data Safety`, `Signed Content Packs`, `About & Governance Audit`).
2. **Consent & Privacy Gateway**: Explicit granular toggles for local-only processing vs optional cloud AI with verifiable consent receipts.
3. **Backup Registry Status**: Live status of all 100% registered IndexedDB stores with `[ 💾 Create Full Backup ]` and `[ 🔄 Restore Backup ]` actions.
4. **Signed Content Catalog**: Inspectable pack provenance, cryptographic signatures, license rights, and offline cache cleanup.
5. **Runtime Governance Audit**: Live view of repository roadmap contracts and canonical implementation milestones (`CAP-038`, `S4-OMIT-012`).

#### 3. Desktop Composition (1440px / 1024px)
```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| OMNIIELTS    | Settings & System Governance · App Version v1.4.0                 [ ✕ Close ]       |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
| ☀ Today      | SETTINGS SECTIONS                                                                  |
| 🕮 Learn      | [ General ] [ 🔒 Privacy & AI ] [ 💾 Data & Backup ] [ 📦 Content Packs ] [ 📜 Audit]|
| 🎓 IELTS     +────────────────────────────────────────────────────────────────────────────────────+
| 📁 Library   | 💾 DURABLE BACKUP REGISTRY & LOCAL STORAGE SENTINEL                                |
| 📊 Analytics | +────────────────────────────────────────────────────────────────────────────────+ |
| ⚙ Settings   | | Store Coverage: 100% (7 of 7 IndexedDB Stores Registered & Monitored)           | |
|              | | Stores: CoreStore, IELTSStore, V10Store, DraftStore, Outbox, Settings, Cache   | |
|              | | Last Automatic Checkpoint: Today at 09:15:00 (14.2 MB)                         | |
|              | | [ 💾 Export Backup (.json) ]     [ 🔄 Restore from Backup ]   [ Check Integrity]| |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              |                                                                                    |
|              | 📦 SIGNED CONTENT PACK PLATFORM & CATALOG TRUST                                    |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              | | Installed Pack: "Cambridge Academic Practice Vol 1" (v2.1)                       | |
|              | | Provenance: Signed by OmniIELTS Authority · Signature: SHA256:7f8a...9c2e ✓ Valid| |
|              | | Offline Status: Fully Cached (42 MB) · [ Inspect License ]  [ Clean Cache ]     | |
|              | +────────────────────────────────────────────────────────────────────────────────+ |
|              |                                                                                    |
|              | 📜 RUNTIME GOVERNANCE AUDIT (CAP-038 / S4-OMIT-012)                                |
|              | Canonical Base: 3de28c4 · Stage 4: UX/IA Remake · 48/48 Capabilities Preserved ✓    |
+──────────────+────────────────────────────────────────────────────────────────────────────────────+
```

#### 4. Mobile Composition (390px Compact)
```
+──────────────────────────────────────────+
| Settings & Governance         [ ✕ Close ]|
| Sections: [Privacy] [Backup] [Packs]     |
+──────────────────────────────────────────+
| 💾 BACKUP REGISTRY (100% Covered)        |
| 7/7 Stores Healthy · Last: 09:15         |
| [ 💾 Export Backup ]  [ 🔄 Restore ]     |
+──────────────────────────────────────────+
| 📦 SIGNED CONTENT PACKS                  |
| "Cambridge Practice Vol 1" (v2.1) ✓ Valid|
| Size: 42 MB · [ Inspect ] [ Clear Cache ]|
+──────────────────────────────────────────+
| 📜 GOVERNANCE & ROADMAP AUDIT            |
| Canonical Base: 3de28c4 · 48/48 Caps ✓   |
+──────────────────────────────────────────+
| ☀ Today  🕮 Learn  🎓 IELTS 📁 Lib  📊 Pro|
+──────────────────────────────────────────+
```

#### 5. W4 Token & Component Bindings
- **Components**: `PreferencesSection`, `ConsentReceiptView`, `BackupRegistryStatus`, `SignedPackProvenanceCard`, `GovernanceAuditSubView`
- **Tokens**: Security badge `--color-evidence-high-text`, alert border `--primitive-amber-400`, font `--type-body`
- **Backup Verification**: Enforces 100% store registration sentinel under `AGENTS.md`.

#### 6. States & Accessibility
- **States**: `Section Switched`, `Backup in Progress`, `Restore Journal Active`, `Pack Provenance Inspect Modal Open`.
- **Accessibility**: Switches have explicit accessible labels (`role="switch"`, `aria-checked="true"`). Audit tables support keyboard scrolling.

---

## 4. Cross-Cutting Responsive & Adaptive Rules

### 4.1 Breakpoint Architecture & Sizing

| Breakpoint Name | Viewport Range | Structural Shell | Navigation Pattern | Workspace Composition |
|---|---|---|---|---|
| `compact` | `< 640px` (Target: `390px`) | Single-column scroll | 5-item Bottom Navigation + More Sheet | Primary pane full width; auxiliary panes become bottom sheets / tabs |
| `medium` | `640px – 1023px` | 2-column adaptive | Collapsible icon rail or top app bar | Split panes with collapsible sidebar drawer |
| `expanded` | `1024px – 1439px` | Full multi-pane shell | Persistent 240px left rail | Side-by-side split workspaces (Passage + Questions, Video + Transcript) |
| `wide` | `≥ 1440px` | Centered canvas bounded to `1440px` | Persistent 240px left rail + docked tools | Expanded split workspaces with persistent inspection sidebars |

### 4.2 Safe-Area Insets & Audio Dock Stacking
- On mobile devices with bottom home indicators (iOS Safe Area / Android Gesture Nav), the `LearningBottomNav` applies `padding-bottom: env(safe-area-inset-bottom)`.
- The `PersistentAudioDock` stacks strictly **above** the bottom navigation bar (`bottom: calc(56px + env(safe-area-inset-bottom))`) with zero overlapping touch targets.
- In strict IELTS Exam simulation mode, both `LearningBottomNav` and `PersistentAudioDock` are completely unmounted from the DOM.

---

## 5. Comprehensive Reconciliation & Verification Matrices

### 5.1 15/15 Screen Classes Mapped (WF-01 .. WF-15)

| Screen ID | Screen Class Name | Primary W4 Components | Visual Surface Grammar | Desktop | Mobile |
|---|---|---|---|---|---|
| **WF-01** | Today / Home Dashboard | `TodayRecommendationCard`, `ContinueCarousel`, `ChoiceGrid` | Learning UI | **SPECIFIED** | **SPECIFIED** |
| **WF-02** | Vocabulary & Collocation Canvas | `VocabLifecycleStepper`, `SourceContextChip`, `ContextPracticeCard`, `EvidenceReceiptCard` | Learning UI | **SPECIFIED** | **SPECIFIED** |
| **WF-03** | Video / Media Study Workspace | `MediaModeBar` (6 modes), `TranscriptCueRail`, `ShadowingWaveform`, `DictationWorkbench` | Learning UI | **SPECIFIED** | **SPECIFIED** |
| **WF-04** | Article / Source Reader Workspace | `ArticleReaderContainer`, `SelectionToolbar`, `SourceContextChip` | Learning UI | **SPECIFIED** | **SPECIFIED** |
| **WF-05** | Unified Capture Inbox | `CaptureCandidateCard`, `DuplicateMergeComparator`, `ConfirmImportAction` | Learning UI | **SPECIFIED** | **SPECIFIED** |
| **WF-06** | Error Notebook & Remediation | `WeaknessHeatmapList`, `EvidenceReceiptDrawer`, `RemediationActionCard` | Learning UI | **SPECIFIED** | **SPECIFIED** |
| **WF-07** | Multi-Dimensional Analytics | `ConstructCardGrid`, `HabitGrid52W`, `PacingCalculatorWidget` | Learning UI | **SPECIFIED** | **SPECIFIED** |
| **WF-08** | IELTS Listening | `ExamHeader`, `SinglePlayAudioStatus`, `QuestionPaletteGrid` | IELTS Exam UI / Practice | **SPECIFIED** | **SPECIFIED** |
| **WF-09** | IELTS Academic Reading | `ExamSplitPane`, `AcademicPassageView`, `ObjectiveQuestionFamily` | IELTS Exam UI / Practice | **SPECIFIED** | **SPECIFIED** |
| **WF-10** | IELTS General Training Reading | `ExamSplitPane`, `GTSectionMultiTextView`, `ObjectiveQuestionFamily` | IELTS Exam UI / Practice | **SPECIFIED** | **SPECIFIED** |
| **WF-11** | IELTS Writing Task 1 | `Task1VisualContainer`, `SemanticDataTable`, `GTLetterWorkspace` | IELTS Exam UI / Practice | **SPECIFIED** | **SPECIFIED** |
| **WF-12** | IELTS Writing Task 2 | `EssayEditor`, `OutlineDrawer`, `FourCriterionFeedbackCard` | IELTS Exam UI / Practice | **SPECIFIED** | **SPECIFIED** |
| **WF-13** | IELTS Speaking | `Part1InterviewCard`, `Part2NotesWorkbench`, `AudioSafetyBar` | IELTS Exam UI / Practice | **SPECIFIED** | **SPECIFIED** |
| **WF-14** | IELTS Full Mock | `MockPrecheckCard`, `ExamShellOrchestrator`, `MockScorecard` | IELTS Exam UI | **SPECIFIED** | **SPECIFIED** |
| **WF-15** | Settings / AI / Data Safety | `PreferencesSection`, `ConsentReceiptView`, `BackupRegistryStatus`, `GovernanceAuditSubView` | Shared Utility UI | **SPECIFIED** | **SPECIFIED** |

### 5.2 48/48 Capabilities Mapped (CAP-001 .. CAP-048)

| Capability ID | Capability Name | Primary Screen Binding(s) | Preservation Status |
|---|---|---|---|
| **CAP-001** | Today Daily Study Runner | WF-01 | **MAPPED** |
| **CAP-002** | FSRS 5-Skill Memory Scheduling | WF-02, WF-07 | **MAPPED** |
| **CAP-003** | Vocabulary & Collocation Drills | WF-02 | **MAPPED** |
| **CAP-004** | Sentence Learning Loop | WF-03 | **MAPPED** |
| **CAP-005** | Strict vs Practice Dictation | WF-03 | **MAPPED** |
| **CAP-006** | Noticing & Thought Groups | WF-03 | **MAPPED** |
| **CAP-007** | Shadowing & Self-Recording | WF-03 | **MAPPED** |
| **CAP-008** | Retell Coaching & Drafting | WF-03 | **MAPPED** |
| **CAP-009** | YouTube Video Workspace, six modes | WF-03 | **MAPPED** |
| **CAP-010** | Caption Normalization/Deduplication | WF-03 | **MAPPED** |
| **CAP-011** | Private Source Library | WF-04, WF-05 | **MAPPED** |
| **CAP-012** | Unified Capture Inbox | WF-02, WF-04, WF-05 | **MAPPED** |
| **CAP-013** | Multi-Dimensional Analytics | WF-06, WF-07 | **MAPPED** |
| **CAP-014** | Error Notebook & Diagnostic Fingerprint | WF-02, WF-06 | **MAPPED** |
| **CAP-015** | Audio Manager & TTS Voice Selection | WF-02, WF-03, WF-04 | **MAPPED** |
| **CAP-016** | EvidencePolicy Decision Gateway | WF-01, WF-02, WF-04, WF-05, WF-06 | **MAPPED** |
| **CAP-017** | Academic vs GT Track Switcher | WF-11, WF-14 | **MAPPED** |
| **CAP-018** | Listening Four-Part Exam Runner | WF-08 | **MAPPED** |
| **CAP-019** | Listening Practice Mode | WF-08 | **MAPPED** |
| **CAP-020** | Academic Reading Split Runner | WF-09 | **MAPPED** |
| **CAP-021** | GT Reading Split Runner | WF-10 | **MAPPED** |
| **CAP-022** | Academic Writing Task 1 Visual Container | WF-11 | **MAPPED** |
| **CAP-023** | GT Writing Task 1 Letter | WF-11 | **MAPPED** |
| **CAP-024** | Writing Task 2 Essay | WF-12 | **MAPPED** |
| **CAP-025** | Four-Criterion Writing Evaluation | WF-11, WF-12 | **MAPPED** |
| **CAP-026** | Speaking Part 1 | WF-13 | **MAPPED** |
| **CAP-027** | Speaking Part 2 | WF-13 | **MAPPED** |
| **CAP-028** | Speaking Part 3 | WF-13 | **MAPPED** |
| **CAP-029** | Full Mock Orchestrator | WF-14 | **MAPPED** |
| **CAP-030** | IELTS Section Practice | WF-06, WF-14 | **MAPPED** |
| **CAP-031** | Fifteen Objective Task Families | WF-08, WF-09, WF-10 | **MAPPED** |
| **CAP-032** | Live Exam Timers & Pacing | WF-07, WF-08, WF-09, WF-10, WF-11, WF-12, WF-13, WF-14 | **MAPPED** |
| **CAP-033** | Exam Reload & Crash Recovery | WF-08, WF-09, WF-10, WF-11, WF-12, WF-13, WF-14 | **MAPPED** |
| **CAP-034** | Primary IA V10 Host Integration | WF-01 | **MAPPED** |
| **CAP-035** | IELTS Hub V2 | WF-15 | **MAPPED** |
| **CAP-036** | Signed Content Platform & Catalog Trust | WF-15 | **MAPPED** |
| **CAP-037** | Offline Pack Lifecycle | WF-15 | **MAPPED** |
| **CAP-038** | Roadmap Runtime Inspector | WF-07, WF-15 | **MAPPED** |
| **CAP-039** | Consent Receipt Gateway | WF-15 | **MAPPED** |
| **CAP-040** | Desktop ASR Companion Bridge | WF-13 | **MAPPED** |
| **CAP-041** | Core-Only Degraded Mode | WF-01, WF-15 | **MAPPED** |
| **CAP-042** | Backup Registry | WF-15 | **MAPPED** |
| **CAP-043** | Interrupted Restore Auto-Recovery | WF-15 | **MAPPED** |
| **CAP-044** | Session Secret Containment | WF-15 | **MAPPED** |
| **CAP-045** | Non-Blocking Boot Error Reporter | WF-15 | **MAPPED** |
| **CAP-046** | Safe Destructive Operations | WF-02, WF-05 | **MAPPED** |
| **CAP-047** | Progressive Long-Media Processing | WF-03 | **MAPPED** |
| **CAP-048** | PWA Offline Support & Cache Cleanup | WF-01 | **MAPPED** |

### 5.3 12/12 Omission Invariants Preserved (S4-OMIT-001 .. S4-OMIT-012)

| Omission ID | Required Invariant | Screen Binding | Preservation Status |
|---|---|---|---|
| **S4-OMIT-001** | Custom lexical target capture | WF-02, WF-04, WF-05 | **PRESERVED** |
| **S4-OMIT-002** | Retell draft recovery | WF-03 | **PRESERVED** |
| **S4-OMIT-003** | Strict dictation / reading ARIA masking | WF-03, WF-08, WF-09, WF-10 | **PRESERVED** |
| **S4-OMIT-004** | Transcript slicing/edit drawer | WF-03 | **PRESERVED** |
| **S4-OMIT-005** | Core-only degraded notice | WF-01 | **PRESERVED** |
| **S4-OMIT-006** | Mobile audio/nav collision avoidance | WF-01, Section 4.2 | **PRESERVED** |
| **S4-OMIT-007** | Card suspension visible/manageable | WF-02, WF-05 | **PRESERVED** |
| **S4-OMIT-008** | Exam pacing / target date Analytics linkage | WF-06, WF-07, WF-11, WF-12, WF-13, WF-14 | **PRESERVED** |
| **S4-OMIT-009** | Exact audio rates selector (0.75x, 0.9x, 1.0x, 1.1x, 1.25x) | WF-03, WF-08 | **PRESERVED** |
| **S4-OMIT-010** | Speaking Part 2 pinned notes surviving to response | WF-13 | **PRESERVED** |
| **S4-OMIT-011** | Pack provenance/review inspection | WF-15 | **PRESERVED** |
| **S4-OMIT-012** | Roadmap runtime status audit | WF-15 | **PRESERVED** |

### 5.4 28/28 REM-003 Recommendations Reconciled

| REC ID | Recommendation Title | Screen Binding | Decision & Representation |
|---|---|---|---|
| **REC-REM002-001** | Explainable Today Recommendation | WF-01 | **ADAPT**: `TodayRecommendationCard` with `Why this?` tooltip & choice row |
| **REC-REM002-002** | Semantic SourceContext Continuity | WF-04 | **ADAPT**: `SourceContextChip` with locator & Return action |
| **REC-REM002-003** | Plural Skill Teaching with Fading | WF-02 | **ADAPT**: Model $\to$ Scaffold $\to$ Faded practice states |
| **REC-REM002-004** | Feedback Leads to Grounded Action | WF-02, WF-06 | **ADAPT**: 4-tier formative cards leading to retry or targeted drill |
| **REC-REM002-005** | Context-Rich Lexical Object | WF-02 | **KEEP**: SourceContext, sense, collocation chips, multimodal drills |
| **REC-REM002-006** | Staged Capture Lifecycle | WF-02, WF-05 | **KEEP**: Staging inbox triage before explicit FSRS enrollment |
| **REC-REM002-007** | Memory vs Skill vs IELTS Separation | WF-02, WF-07 | **KEEP**: 4 non-fungible construct cards in Analytics |
| **REC-REM002-008** | Search Returns to Context | WF-04, WF-05 | **ADAPT**: Search reveals existing cards without duplicating |
| **REC-REM002-009** | Signed Catalog Trust Lifecycle | WF-15 | **ADAPT**: Pack signature, provenance, and trust badges |
| **REC-REM002-010** | Listening Cue Identity | WF-03, WF-08 | **ADAPT**: Stable audio cue identity across practice, dictation, exam |
| **REC-REM002-011** | Reading Passage Evidence / Rationale | WF-09, WF-10 | **ADAPT**: Passage span highlight linked to explanation in review |
| **REC-REM002-012** | Writing Criterion / Span / Action | WF-11, WF-12 | **ADAPT**: 4-criterion feedback cards with revision actions |
| **REC-REM002-013** | Speaking Criterion / Segment Flow | WF-13 | **ADAPT**: Part prompt cards, waveform feedback, segment review |
| **REC-REM002-014** | IELTS Grounded Review & Remediation | WF-06 | **ADAPT**: Targeted remediation drills launched from error notebook |
| **REC-REM002-015** | Uncertain Misconception Lifecycle | WF-06 | **ADAPT**: Weakness cards with confidence indicator and outcome states |
| **REC-REM002-016** | Official Strict Exam Semantics | WF-08, WF-09, WF-10, WF-11, WF-12, WF-14 | **KEEP**: Unmounted chrome, 40-item palette, official timers |
| **REC-REM002-017** | Full-Test Limitations to Action | WF-14 | **ADAPT**: Scorecard with explicit Speaking pending status & practice disclaimer |
| **REC-REM002-018** | Alternatives / Nonpunitive Re-entry | WF-01 | **ADAPT**: Change Plan / Dismiss; all 5 pillars always open |
| **REC-REM002-019** | Inspectable Multidimensional Analytics| WF-07 | **KEEP**: 4 construct gauges with uncertainty bands & data tables |
| **REC-REM002-020** | Evidence / Consent Disclosure | WF-15 | **KEEP**: Assistance badges, EvidenceReceipts, explicit consent modals |
| **REC-REM002-021** | Data Safety / Degraded Lifecycle | WF-01, WF-15 | **KEEP**: Backup registry status, recovery journals, degraded banners |
| **REC-REM002-022** | Service & ASR Readiness | WF-15 | **ADAPT**: Connected / Disconnected / Unavailable badges & fallback |
| **REC-REM002-023** | One EvidenceReceipt Grammar | WF-02, WF-06 | **KEEP**: Unified schema for attempt inspection |
| **REC-REM002-024** | Reject Duplicate Owners / Walls | All | **REJECT**: Consolidated into 15 canonical screen classes |
| **REC-REM002-025** | Responsive Task Priority Recomposition| All | **ADAPT**: Recompose layouts (panes to sheets) without deleting tools |
| **REC-REM002-026** | Accessibility Proof Obligations | All | **KEEP**: WCAG 2.1 AA+ contrast, 48px targets, keyboard focus, live rules |
| **REC-REM002-027** | Distinct Full / Section / Targeted Scopes| WF-14 | **KEEP**: Direct scope selector without prerequisite unlock chains |
| **REC-REM002-028** | Ephemeral Recording Safety | WF-03, WF-13 | **KEEP**: Session-scoped raw audio with manual export action |

---

## 6. Final Structural Verification Assertions

- 15/15 representative screen classes have near-final high-fidelity specifications for both Desktop and Mobile.
- 48/48 capabilities (`CAP-001` .. `CAP-048`) are mapped without omission or semantic dilution.
- 12/12 omission invariants (`S4-OMIT-001` .. `S4-OMIT-012`) are explicitly preserved.
- 28/28 REM-003 recommendations are reconciled (11 KEEP, 16 ADAPT, 1 REJECT).
- Learning UI and strict IELTS Exam UI maintain distinct, coherent dual-grammar visual rules.
- Mobile transformations and WCAG 2.1 AA+ accessibility obligations are fully specified.
- EvidencePolicy default-deny invariant preserved: `UNASSISTED -> POTENTIALLY_EVIDENCE_ELIGIBLE` and `UNASSISTED != AUTOMATIC_FSRS_UPDATE`.
- Dynamic FSRS intervals verified: No hard-coded scheduling policies.
- Word Rearrangement remains strictly excluded.
- Zero runtime implementation code, tests, workflows, or dependency mutations.
- The W5 executor does not self-audit, does not merge, and does not activate Stage 4 Wave 6.

Candidate terminal state: `W5_HIFI_UI_CANDIDATE_COMPLETE_PENDING_INDEPENDENT_AUDIT`.
