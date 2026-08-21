# Stage 4 W3 Structural Wireframes

## 1. Exact provenance and authority

| Field | Value |
|---|---|
| Transaction | STAGE4-W3-WIREFRAME-LAYOUTS-001 |
| Human gate | G3 ACTIVATED FOR W3 CANDIDATE EXECUTION |
| Canonical base | 2a9104b41ca2b503516684a51760838914bcdde7 |
| Controlling authorization | docs/authorizations/STAGE4-UXIA-AUTH-001.md |
| Strategy | docs/stage4/STAGE4_UXIA_STRATEGY.md |
| Accepted predecessors | W0 capability matrix; W1 information architecture and journeys; W2 interaction/state model; REM-003 synthesis |
| Artifact class | Design/specification; non-runtime implementation |
| Closed write allowlist | docs/stage4/STAGE4_WIREFRAMES.md only |
| Epistemic status | W3 candidate pending independent audit; CI is not acceptance |

Canonical documents remain authority. This artifact spatializes their accepted contracts without changing capability, product, evidence, exam, or runtime truth. It introduces no final brand styling, typography scale, component tokens, animation system, provider, or device restriction.

## 2. Wireframe notation legend

| Mark | Meaning |
|---|---|
| [ Primary ] | The dominant next action for the current state |
| ( Secondary ) | Optional nearby action; never a hidden prerequisite |
| { Advanced } | Progressive-disclosure drawer, sheet, or menu |
| < status > | Persistent, non-interactive context or live status |
| ! recovery ! | Error/recovery region that preserves work and explains impact |
| L / P / E | Learn / Practice / strict Exam grammar |
| UA / LA / SC / AR | UNASSISTED / LIGHT_ASSISTANCE / SCAFFOLDED / ANSWER_REVEALED or POST_ATTEMPT_REVIEW |
| EP? | EvidencePolicy evaluates the completed attempt; default deny |
| C / CR / T / F / ORF / BG | [CURRENT] / [CURRENT_REHOMED] / [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION] / [FUTURE_UX_RESERVED] / [OWNER_RECONFIRMED_FUTURE] / [BACKGROUND_SYSTEM] |
| [A], [B], [C] | Anti-RPS: genuinely new capability / improved presentation / variant or state |
| [D-REJECT], [E-REJECT] | Duplicate UX or unnecessary feature-wall expansion rejected |

Arrows describe reachable transitions, not forced curricula. A recommended action is visually prominent but all valid destinations remain directly reachable. Capture creates a candidate, not learning evidence and not automatic FSRS scheduling.

Structural invariants used throughout:

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

## 3. Global Learning Shell

### Desktop learning shell

    +----------------+-----------------------------------------------------------+
    | OMNIIELTS      | Utility: Search  Capture  Sync/Data  Profile             |
    |----------------+-----------------------------------------------------------|
    | TODAY          | Context strip: mode / source / activity / assistance     |
    | LEARN          |-----------------------------------------------------------|
    |  · Vocabulary  |                                                           |
    |  · Media/Reader|                 PRIMARY WORKSPACE                         |
    | IELTS          |                                                           |
    | LIBRARY        |                                                           |
    | ANALYTICS      |-----------------------------------------------------------|
    | util: C/S/Set  | Feedback / evidence receipt / recovery / return-to-source|
    +----------------+-----------------------------------------------------------+
    | Optional persistent audio: source | rate | back | play | forward | cue    |
    +----------------------------------------------------------------------------+

The five canonical pillars remain primary: Today, Learn, IELTS, Library, and Analytics. Vocabulary, Media, and Reader are Learn-owned workspaces; Sources, Capture Inbox, and Error Notebook are Library-owned surfaces. Capture, Search, and Settings occupy the utility dock rather than competing as pillars. One application rail hosts rich capabilities through contextual workspaces and drawers rather than top-level control multiplication.

### Mobile learning shell

    +----------------------------------+
    | title / context        Search  + |
    |----------------------------------|
    |                                  |
    |       PRIMARY SCROLL REGION      |
    |                                  |
    |----------------------------------|
    | contextual action / feedback     |
    |----------------------------------|
    | audio dock (only when relevant)  |
    |----------------------------------|
    |Today Learn IELTS Library Progress|
    +----------------------------------+
           ^ safe area; no dock collision

The fixed destinations are Today, Learn, IELTS, Library, and Progress/Analytics, with at least 48×48 CSS-pixel-equivalent targets. Capture, Search, and Settings remain contextual utilities. Secondary desktop rails become sheets or sequential views; persistent source and draft context remain visible in compact headers.

## 4. IELTS Exam Simulation Shell

### Desktop strict Exam shell

    +----------------------------------------------------------------------------+
    | IELTS | skill / part | candidate status | time | Submit / End safeguards |
    |----------------------------------------------------------------------------|
    | optional passage / prompt         | question or response workspace         |
    |                                   |                                        |
    | STRICT TEST CONTENT ONLY          | STRICT TEST INPUT ONLY                 |
    |                                   |                                        |
    |----------------------------------------------------------------------------|
    | Q 01 02 03 ... 40 | flagged | answered | previous | next                  |
    +----------------------------------------------------------------------------+

### Mobile strict Exam shell

    +----------------------------------+
    | IELTS / part     time    Q 12/40 |
    |----------------------------------|
    | prompt or passage [open full]    |
    |----------------------------------|
    | active question / response       |
    |                                  |
    |----------------------------------|
    | Flag       Previous       Next   |
    | Questions sheet      Submit      |
    +----------------------------------+

Strict Exam removes app navigation, coaching, hints, transcript, translation, vocabulary lookup, learning overlays, gamification, and unrelated utilities. Safety affordances remain: keyboard navigation, status announcements, connection/reload recovery, confirmation before submission, and return after the test. Learn and Practice use the Learning Shell and never impersonate strict conditions.

## 5. Responsive transformation grammar

| Desktop structure | Mobile transformation | Integrity rule |
|---|---|---|
| Persistent left navigation | Five-item bottom navigation plus labelled More sheet | All destinations remain reachable; no fake curriculum lock |
| Two- or three-column workspace | One dominant pane; peer panes become tabs, drawers, or bottom sheets | Preserve task, source, cursor, and draft on switching |
| Transcript/source rail | Full-height sheet with cue return control | Logical reading order follows content, not desktop coordinates |
| Dense question navigator | Compact progress plus question sheet | Flagged/answered/current states use text or shape as well as color |
| Hover/drag affordance | Tap target plus explicit Move/Resize/Reorder controls | Non-drag alternative required |
| Modal | Bottom sheet when short; full-screen route when complex | Focus trapped, labelled close, focus restored |
| Data table/chart | Summary cards, scroll-safe table, chart/table toggle | Values remain available as text |
| Audio player | Safe-area dock above bottom navigation | Captions/transcript alternatives and keyboard controls remain |
| Writing split prompt/editor | Sticky prompt summary plus prompt sheet; editor remains primary | Prompt and draft persist; no keyboard occlusion |
| Timed split-pane Exam | Sequential prompt/question focus with reversible switch | No desktop-only requirement; timer and answer persist |
| Recovery banner | Persistent compact banner opening a recovery sheet | Never covers the primary action or timer |

Reflow targets a single logical column at narrow widths. Text enlargement may increase page length but must not clip controls. Breakpoint values, device allocation, and final density are W4 decisions; these transformations are semantic requirements.

## 6. Fifteen representative screen classes

### WF-01 — Today / Home Dashboard

- SCREEN_ID: WF-01
- CANONICAL_PURPOSE: Start, resume, or deliberately choose learning without turning the recommendation into a navigation gate.
- MODE: Learning shell; recommendation and free-choice states.
- CANONICAL_JOURNEY: J-01 Today.
- CAPABILITY_IDS: CAP-001, CAP-016, CAP-034, CAP-041, CAP-048.
- REC_IDS: REC-REM002-001, REC-REM002-018.

#### DESKTOP_WIREFRAME

    + NAV --------+ TODAY ------------------------------------------------------+
    | five pillars| Good morning                         Search  Capture         |
    |              |------------------------------------------------------------|
    |              | Recommended next [Resume Listening block · 12 min]        |
    |              | Why this?  Change plan  Dismiss                           |
    |              |------------------------------------------------------------|
    |              | Continue                                                   |
    |              | [Media 03:42] [Vocab 8 due] [Writing draft saved]         |
    |              |------------------------------------------------------------|
    |              | Choose any activity: Vocab | Media | Reader | IELTS       |
    |              |------------------------------------------------------------|
    |              | ! offline: core learning ready; some services unavailable !|
    +--------------+------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Today                  Search  + |
    |----------------------------------|
    | Recommended next                |
    | Listening block · 12 min        |
    | [ Resume ]  Why?  Change        |
    |----------------------------------|
    | Continue                         |
    | Media 03:42 >                    |
    | Vocab 8 due >                    |
    | Writing draft >                  |
    |----------------------------------|
    | Choose: Vocab Media Reader IELTS |
    |! Core ready; service status > !  |
    |----------------------------------|
    |Today Learn IELTS Library Progress|
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: One recommended LearningBlock with an explicit rationale, Resume primary action, and adjacent Change/Dismiss controls.
- MATERIAL_SECONDARY_STATES: First-use empty plan; all caught up; Quick Catch-up versus Full Due Queue; single-lease conflict/recovery; interrupted block; offline/core-only readiness; sync conflict; recommendation dismissed; provisional streak protection; advanced plan details.
- RESPONSIVE_TRANSFORMATION: Continue cards stack; plan rationale opens a sheet; choice row horizontally scrolls with labelled controls; service recovery never obscures navigation.
- PERSISTED_CONTEXT: Selected track, current single-lease LearningBlock, source/activity cursor, incomplete drafts, local assistance state, due/new counts, estimated workload, and last safe sync point.
- CROSS_SURFACE_ENTRY: App launch, completed activity, deep link, recovery, or bottom navigation.
- CROSS_SURFACE_EXIT: Any five-pillar destination, resumed task, Capture, Search, or service/data details.
- ACCESSIBILITY_NOTES: H1 precedes recommendation; Resume is first action after rationale; cards are real links; status is announced once; dismissal is reversible; targets tolerate text scaling.
- ANTI_RPS_CHECK: [B] consolidates resumption and choice; [C] empty/offline states; [D-REJECT] duplicate dashboards; [E-REJECT] feature grid of every capability.
- CURRENT_FUTURE_TRUTH: Today host [CURRENT]; redesigned recommendation hierarchy [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; offline core [BACKGROUND_SYSTEM] with current fallback; no claim that a recommendation is EvidencePolicy evidence.

### WF-02 — Vocabulary & Collocation Learning / Practice / Spaced Review Canvas

- SCREEN_ID: WF-02
- CANONICAL_PURPOSE: Move a provenance-bearing lexical candidate through confirmation, contextual understanding, multimodal practice, spaced review, and productive transfer.
- MODE: Learn / Practice / Spaced Review; never a single generic flashcard mode.
- CANONICAL_JOURNEY: J-02 Vocabulary.
- CAPABILITY_IDS: CAP-002, CAP-003, CAP-012, CAP-014, CAP-015, CAP-016, CAP-046.
- REC_IDS: REC-REM002-005, REC-REM002-006, REC-REM002-007.

#### DESKTOP_WIREFRAME

    + NAV ------+ VOCABULARY --------------------------------------------------+
    |           | Acquire | Confirm | Context | Practice | Review | Transfer   |
    | Queue     |---------------------------------------------------------------|
    | 8 due     | source: Article / paragraph 4 / sentence 2    [Return source] |
    | 3 confirm | target: "account for"   sense [choose]  collocation [edit]   |
    | suspended|---------------------------------------------------------------|
    | filters   | Exercise: produce a sentence                                  |
    |           | +-----------------------------------------------------------+ |
    |           | | learner response                                          | |
    |           | +-----------------------------------------------------------+ |
    |           | Assistance: UA  (Hint) (Example)          [Check attempt]    |
    |           |---------------------------------------------------------------|
    |           | Feedback -> action -> retry | EP? receipt | schedule details |
    +-----------+---------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Vocabulary        Review 8  More |
    | Acquire > Confirm > Practice     |
    |----------------------------------|
    | "account for"                   |
    | source: Article · p4 s2 [Return] |
    | sense / collocation [Edit]       |
    |----------------------------------|
    | Produce a sentence               |
    | [ response field              ]  |
    | UA        Hint       Example     |
    | [ Check attempt ]                |
    |----------------------------------|
    | feedback / retry / EP? details   |
    |Today Learn IELTS Library Progress|
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: A contextual exercise with provenance, visible assistance state, one attempt action, diagnostic feedback, retry, and a separately disclosed EvidenceReceipt.
- MATERIAL_SECONDARY_STATES: Candidate confirmation; ambiguous sense; selectable multimodal exercise family; four-tier Verify/Elaborate/Refute/Scaffold feedback; sentence-production practice; due review; productive transfer; suspended-card manager; edit/delete with undo; no due items; audio unavailable.
- RESPONSIVE_TRANSFORMATION: Queue becomes a filter sheet; lifecycle becomes a horizontally scrollable labelled stepper; source context collapses to a summary; response and feedback remain in one reading flow.
- PERSISTED_CONTEXT: SourceContext, chosen sense/collocations, exercise family, response draft, attempt/assistance state, card suspension, FSRS memory state, and EvidenceReceipt.
- CROSS_SURFACE_ENTRY: Capture Inbox, source selection, Today due item, Error Notebook, Search result, or direct Vocabulary navigation.
- CROSS_SURFACE_EXIT: Return to exact source cue; next chosen exercise; spaced review; Errors; Analytics; safe delete/restore.
- ACCESSIBILITY_NOTES: Lifecycle is a list, not color-only; audio has transcript/text; reorder tasks have select/move alternatives; feedback focus follows submission; deleted/suspended states are announced.
- ANTI_RPS_CHECK: [B] one lifecycle canvas preserves multimodal richness; [C] exercise families and review states; [D-REJECT] separate page per exercise; [E-REJECT] all drills visible at once.
- CURRENT_FUTURE_TRUTH: FSRS scheduler and drill richness [CURRENT]; contextual lifecycle [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; Capture is not evidence; FSRS memory retention is not skill mastery; EvidencePolicy remains the [BACKGROUND_SYSTEM] sole gateway.

### WF-03 — Video / Media Study Workspace

- SCREEN_ID: WF-03
- CANONICAL_PURPOSE: Study one stable media source through six independent modes or an optional seven-step guided session without losing source, cue, playback, transcript, or drafts.
- MODE: Normal / Noticing / Shadowing / Strict Dictation / Practice Dictation / Retell; optional Guided Session.
- CANONICAL_JOURNEY: J-03 Media.
- CAPABILITY_IDS: CAP-004, CAP-005, CAP-006, CAP-007, CAP-008, CAP-009, CAP-010, CAP-011, CAP-015, CAP-016, CAP-040, CAP-041, CAP-047.
- REC_IDS: REC-REM002-002, REC-REM002-010, REC-REM002-013, REC-REM002-022.

#### DESKTOP_WIREFRAME

    + NAV --+ MEDIA ------------------------------------------------------------+
    |Library| Source title / provenance                     Capture  {Options} |
    |sources|---------------------------------------------------------------+----|
    |       | +-------------------- VIDEO -------------------------------+  |Cue |
    |       | |                                                        |  |rail|
    |       | +--------------------------------------------------------+  | 12>|
    |       | 00:42 ---- play ---- 03:18   rate 0.75 0.9 1.0 1.1 1.25 |  | 13 |
    |       |-----------------------------------------------------------|  | 14 |
    |       | Normal Notice Shadow StrictDict PracticeDict Retell       |  +----+
    |       | cue identity / transcript context / current assistance    |
    |       | +------------------ MODE WORKBENCH ----------------------+ |
    |       | | Điền từ / Cả câu (dictation task choice when relevant)| |
    |       | | draft / recording / feedback / retry                  | |
    |       | +--------------------------------------------------------+ |
    |       | Guided: Listen > Dictate > Correct > Notice > Shadow >   |
    |       |         Vocabulary > Retell        (optional; Exit guide) |
    +-------+-----------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Media / cue 12        Source  +  |
    |----------------------------------|
    | [          VIDEO             ]  |
    | cue text / caption status         |
    |----------------------------------|
    | Normal  Notice  Shadow  Dict...  |
    |----------------------------------|
    | MODE WORKBENCH                    |
    | Điền từ  |  Cả câu                |
    | [ draft / recording / feedback ] |
    | Guided step 3/7 [Exit guide]      |
    |----------------------------------|
    | 00:42  back  play  next  1.0x    |
    |Today Learn IELTS Library Progress|
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Stable source player and cue identity above one mode workbench; mode switch is always available and does not reset the workspace.
- MATERIAL_SECONDARY_STATES: Source library; loading/normalizing/partial-ready/error ingestion; transcript/cue rail; guided-session step panel; strict/practice dictation variants; IPA/weak-form/stress/thought-group Noticing drawer; waveform/native-versus-learner Shadowing comparison; recording/ASR permission and fallback; Retell draft recovery; core-only degraded notice; transcript slice editor; source lifecycle detail.
- RESPONSIVE_TRANSFORMATION: Video remains top; transcript/cue rail becomes a sheet; mode bar scrolls with full accessible labels; audio dock sits above bottom navigation; guided progress becomes a compact reversible stepper.
- PERSISTED_CONTEXT: Source/video, cue/sentence identity, playback position, exact playback rate, transcript context, active mode, per-mode draft/recording, guided step, and source provenance.
- CROSS_SURFACE_ENTRY: Media library, Today resume, Reader media link, Capture provenance, Error remediation, or Search.
- CROSS_SURFACE_EXIT: Exact source/cue return, Vocabulary candidate confirmation, Error Notebook, next freely chosen mode, or Today.
- ACCESSIBILITY_NOTES: Captions/transcript expose speaker and cue order; player is keyboard reachable; recording has text/status alternatives; masked strict dictation uses DOM/ARIA-safe concealment; rate controls have explicit names.
- ANTI_RPS_CHECK: [B] one stable workspace; [C] six modes and seven optional steps; [D-REJECT] six or seven duplicate screens; [E-REJECT] global unlock chain and Word Rearrangement.
- CURRENT_FUTURE_TRUTH: Media capabilities [CURRENT]; consolidated six-mode workspace [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; Desktop ASR [CURRENT] with graceful fallback; some signed-source lifecycle [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; no realtime AI examiner implication.

### WF-04 — Article / Source Reader Workspace

- SCREEN_ID: WF-04
- CANONICAL_PURPOSE: Read an owned source, understand an exact passage in context, capture candidates safely, and return from later learning to the same revision and locator.
- MODE: Reading / contextual learning; optional transcript-like sentence focus.
- CANONICAL_JOURNEY: J-04 Reader.
- CAPABILITY_IDS: CAP-003, CAP-006, CAP-010, CAP-011, CAP-012, CAP-016, CAP-040, CAP-047, CAP-048.
- REC_IDS: REC-REM002-002, REC-REM002-006, REC-REM002-008.

#### DESKTOP_WIREFRAME

    + NAV --+ READER ----------------------------------------------------------+
    |Library| source title / author / revision / rights        Search  Capture |
    |sources|-----------------------------------------------------------+-------|
    |       |                                                           |Outline|
    |       | ARTICLE                                                   | p1    |
    |       | paragraph 4                                               | p2    |
    |       | ... selected sentence [2] ...                             | p3    |
    |       |                                                           | notes |
    |       |-----------------------------------------------------------+-------|
    |       | Selection: explain in context | capture candidate | copy locator|
    |       | Return marker: revision r7 · paragraph 4 · sentence 2            |
    +-------+------------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Reader              Outline   + |
    | source · revision r7             |
    |----------------------------------|
    | ARTICLE                          |
    |                                  |
    | selected sentence [2]            |
    |                                  |
    |----------------------------------|
    | Explain  Capture  Locator        |
    | Return marker p4 · s2            |
    |Today Learn IELTS Library Progress|
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Distraction-light source content with stable revision/locator context and a selection toolbar whose actions lead to existing owners.
- MATERIAL_SECONDARY_STATES: Source import/library; private or rights-limited source; stale/missing revision fallback; outline; contextual explanation; duplicate capture warning; offline copy; source unavailable; search result return.
- RESPONSIVE_TRANSFORMATION: Outline and source details become sheets; selection actions dock near the viewport without covering text; exact locator remains a compact persistent chip.
- PERSISTED_CONTEXT: SourceContext including owner, source ID, revision, paragraph/sentence locator, scroll position, selection, private/rights scope, and capture draft.
- CROSS_SURFACE_ENTRY: Library, SearchResult, Vocabulary occurrence, Capture candidate, Media transcript link, or remediation evidence.
- CROSS_SURFACE_EXIT: Exact return point, Capture Inbox, Vocabulary confirmation, Search, related media owner, or Today.
- ACCESSIBILITY_NOTES: Article landmarks and heading hierarchy are semantic; selection actions also work from keyboard; explanations do not replace source text; reading width and text scale are learner-controlled.
- ANTI_RPS_CHECK: [B] exact-context return; [C] unavailable/stale variants; [D-REJECT] copied reader inside Search or Vocabulary; [E-REJECT] generic save-word dead end.
- CURRENT_FUTURE_TRUTH: Reader/source support [CURRENT] / [CURRENT_REHOMED]; unified SourceContext [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; cross-revision locator translation [FUTURE_UX_RESERVED]; offline truth must be explicit; capture is not evidence.

### WF-05 — Unified Capture Inbox

- SCREEN_ID: WF-05
- CANONICAL_PURPOSE: Resolve source-bearing capture candidates into confirmed lexical objects, merged duplicates, deferred items, or discarded items without silently scheduling them.
- MODE: Learning utility; triage and confirmation.
- CANONICAL_JOURNEY: J-05 Capture.
- CAPABILITY_IDS: CAP-003, CAP-011, CAP-012, CAP-016, CAP-033, CAP-041, CAP-046, CAP-048.
- REC_IDS: REC-REM002-006, REC-REM002-021.

#### DESKTOP_WIREFRAME

    + NAV ----+ CAPTURE INBOX -------------------------------------------------+
    |         | 6 candidates    All | Needs sense | Duplicate | Deferred      |
    |         |----------------------------------------------------------------|
    |         | candidate list        | CONFIRM CANDIDATE                      |
    |         | > account for         | source excerpt + exact locator         |
    |         |   plausible           | proposed sense [select/edit]           |
    |         |   substantial         | collocation / goal / tags              |
    |         |                       | possible duplicate [Compare / Merge]   |
    |         |                       | (Discard) (Later) [Confirm & Import]  |
    |         |----------------------------------------------------------------|
    |         | < staging creates neither evidence nor scheduling; explicit    |
    |         |   Confirm & Import creates a cold-start FSRS card, not success >|
    +---------+----------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Capture Inbox       Filter  6    |
    |----------------------------------|
    | account for                      |
    | source excerpt · p4 s2 [Open]    |
    | sense [Choose]                   |
    | collocation / goal [Edit]        |
    | Possible duplicate [Compare]     |
    |----------------------------------|
    | Discard   Later   [Confirm]      |
    | Confirm & Import -> cold-start due|
    | confirmation != recall evidence  |
    |Today Learn IELTS Library Progress|
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: One selected candidate with source, sense, goal, duplicate comparison, and explicit Confirm & Import/Later/Discard choices. Confirm & Import creates the canonical cold-start FSRS card and Today entry but emits no positive recall evidence.
- MATERIAL_SECONDARY_STATES: Empty inbox; batch source filter; ambiguous sense; duplicate compare/merge; private source unavailable; offline queue; sync conflict; undo after discard/merge; unconfirmed staged candidate; confirmed cold-start card awaiting genuine review evidence.
- RESPONSIVE_TRANSFORMATION: Candidate list becomes previous/next navigation and a filter sheet; compare uses a full-screen two-record flow; confirmation actions remain sticky above safe area.
- PERSISTED_CONTEXT: Capture payload, SourceContext, proposed and confirmed sense, collocations, learning goal, duplicate resolution, deferral, and sync receipt.
- CROSS_SURFACE_ENTRY: Global Capture, Reader selection, Media cue/transcript, SearchResult, or manual lexical target capture.
- CROSS_SURFACE_EXIT: Exact source return, confirmed cold-start Vocabulary card/Today queue, deferred inbox, or safe undo.
- ACCESSIBILITY_NOTES: Candidate count and state are announced; merge comparison has labelled records; swipe is optional; validation errors link to fields; discard requires recoverable confirmation.
- ANTI_RPS_CHECK: [B] one Inbox across sources; [C] sense/duplicate/offline states; [D-REJECT] separate capture stores; [E-REJECT] automatic flashcard and automatic FSRS enrollment.
- CURRENT_FUTURE_TRUTH: Capture Inbox and explicit Confirm & Import cold-start scheduling [CURRENT]; richer staged confirmation [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; durability is [BACKGROUND_SYSTEM] with current support; neither capture nor confirmation is positive recall evidence.

### WF-06 — Error Notebook / Remediation / Weakness Map

- SCREEN_ID: WF-06
- CANONICAL_PURPOSE: Treat a weakness as an inspectable, uncertain hypothesis grounded in attempts, then support correction, clean retry, delayed retest, and transfer.
- MODE: Learning review and remediation.
- CANONICAL_JOURNEY: J-06 Error Notebook.
- CAPABILITY_IDS: CAP-002, CAP-014, CAP-016, CAP-046.
- REC_IDS: REC-REM002-004, REC-REM002-015, REC-REM002-023.

#### DESKTOP_WIREFRAME

    + NAV ---+ ERROR NOTEBOOK -------------------------------------------------+
    |filters | Open | Practicing | Monitoring | Resolved | Ignored             |
    |        |-----------------------------------------------------------------|
    |23-cat. | HEATMAP / accessible list      Priority: impact/freq/confidence  |
    |heatmap | [Grammar ▓▓░] [Lexical ▓░░] [Listening ▓▓▓] [View as table]    |
    |        |-----------------------------------------------------------------|
    |weakness| "Article use in Task 2"   hypothesis confidence: medium        |
    |detail  | Trigger evidence: 3 attempts  [Inspect receipt/source]           |
    |        |-----------------------------------------------------------------|
    |        | 1 Explain grounded cause                                       |
    |        | 2 Correct original (exposure retained)                          |
    |        | 3 [Clean retry]  4 (Schedule delayed retest)  5 (Transfer task) |
    |        |-----------------------------------------------------------------|
    |        | Outcomes: correction ≠ clean retry ≠ delayed ≠ transfer         |
    +--------+-----------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Errors             Filter  Sort  |
    | Open Practice Monitor Resolved   |
    | Ignored            [Manual entry]|
    | 23-category heatmap [List view]   |
    |----------------------------------|
    | Article use · Task 2             |
    | hypothesis: medium confidence    |
    | 3 attempts [Inspect evidence]     |
    |----------------------------------|
    | Explain                          |
    | Correct original                 |
    | [ Start clean retry ]            |
    | Delayed retest | Transfer        |
    |----------------------------------|
    | outcomes stay separate           |
    |Today Learn IELTS Library Progress|
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Selected weakness with confidence/frequency/impact, exact EvidenceReceipt drill-down, explanation, one actionable remediation step, and distinct outcome measures.
- MATERIAL_SECONDARY_STATES: Empty notebook; 23-category decay-weighted heatmap; open/practicing/monitoring/resolved/ignored lifecycle filters; manual entry; uncertain hypothesis; conflicting evidence; original source unavailable; correction; clean parallel task; delayed retest due; transfer task; delete/undo.
- RESPONSIVE_TRANSFORMATION: Map defaults to ranked list with an optional accessible visualization; evidence and explanation open inline/full-screen; remediation actions stack in temporal order.
- PERSISTED_CONTEXT: Weakness hypothesis, construct and source links, evidence receipts, remediation stage, correction draft, delayed schedule, separate outcome states.
- CROSS_SURFACE_ENTRY: Activity feedback, IELTS review, Vocabulary error, Analytics drill-down, or Search.
- CROSS_SURFACE_EXIT: Exact triggering context, clean retry owner, delayed LearningBlock, transfer task, or Analytics.
- ACCESSIBILITY_NOTES: Confidence is textual; graph has equivalent list/table; evidence source and uncertainty are labelled; remediation steps are headings; no shame language or forced retry.
- ANTI_RPS_CHECK: [B] action-oriented evidence detail; [C] remediation stages; [D-REJECT] copied practice runner; [E-REJECT] one unified mastery score.
- CURRENT_FUTURE_TRUTH: Error Notebook [CURRENT]; improved weakness prioritization [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; feedback inference remains qualified; EvidencePolicy receipts [BACKGROUND_SYSTEM]; no causal learning claim.

### WF-07 — Multi-Dimensional Analytics

- SCREEN_ID: WF-07
- CANONICAL_PURPOSE: Inspect distinct constructs, uncertainty, evidence provenance, trends, and action links without collapsing retention, skill, IELTS ability, and transfer.
- MODE: Learning insight; read-only analysis and deep links.
- CANONICAL_JOURNEY: J-07 Analytics.
- CAPABILITY_IDS: CAP-002, CAP-013, CAP-014, CAP-016, CAP-025.
- REC_IDS: REC-REM002-019, REC-REM002-023.

#### DESKTOP_WIREFRAME

    + NAV ---+ ANALYTICS ------------------------------------------------------+
    |filters | Range 30d | Track Academic | Evidence quality | Export          |
    |        |-----------------------------------------------------------------|
    |        | Memory retention   Skill evidence   IELTS estimate   Transfer   |
    |        | [82% ± range]      [Listening...]   [qualified]      [sparse]    |
    |        |-----------------------------------------------------------------|
    |        | 52-WEEK HABIT GRID [table]              | PACING CALCULATOR      |
    |        | ░▓▓░▓... activity, not mastery         | target date / workload|
    |        | trend chart + uncertainty band          | [Adjust target]       |
    |        |-----------------------------------------+-----------------------|
    |        | evidence table: source / mode / exposure / assistance / output  |
    |        | evaluator / version / uncertainty       [Open exact context]    |
    |        | Suggested action (optional) [Open owner]  Why?  Dismiss          |
    +--------+-----------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Analytics          Filter  Range |
    |----------------------------------|
    | Memory retention     82% ±       |
    | Skill evidence       View >      |
    | IELTS estimate       qualified > |
    | Transfer             sparse >    |
    |----------------------------------|
    | Habit 52w [Grid] [Table]          |
    | Pacing target/workload [Open]     |
    | [Chart] [Table]  textual summary |
    | evidence receipt >                 |
    | Suggested action [Open] Why?      |
    |Today Learn IELTS Library Progress|
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Construct-separated overview with uncertainty, textual interpretation, evidence drill-down, and optional action routed to an existing owner.
- MATERIAL_SECONDARY_STATES: No evidence; insufficient evidence; stale projection; filters; compare range; Exam Pacing and Target Date calculator; accessible table; exact EvidenceReceipt; dismissed action; offline cached snapshot; roadmap runtime inspection link.
- RESPONSIVE_TRANSFORMATION: Four constructs become cards; chart/table toggle preserves data; filters become sheet; evidence table uses row details without horizontal loss.
- PERSISTED_CONTEXT: Filter/range/track, selected construct, projection version, uncertainty, evidence receipt link, dismissed recommendation, and cached-at time.
- CROSS_SURFACE_ENTRY: Today, Error Notebook, completed learning review, IELTS results, or direct Insight navigation.
- CROSS_SURFACE_EXIT: Exact evidence context, existing practice owner, Errors, Settings roadmap inspector, or Today.
- ACCESSIBILITY_NOTES: Every chart has a table and summary; uncertainty is text/pattern, not color; focus order follows construct cards; live updates are restrained; export is labelled with scope.
- ANTI_RPS_CHECK: [B] construct separation and action links; [C] empty/stale/filtered views; [D-REJECT] Analytics-owned drills; [E-REJECT] unified mastery dashboard.
- CURRENT_FUTURE_TRUTH: Retention, 52-week habit grid, pacing calculator, and action launch [CURRENT]; redesigned multi-dimensional hierarchy [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; radar/band estimate [FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]; projections are not official scores and not causal proof.

### WF-08 — IELTS Listening

- SCREEN_ID: WF-08
- CANONICAL_PURPOSE: Offer direct scope and mode choice, then preserve official strict Listening semantics or a clearly distinct learning/practice review path.
- MODE: Learn / Practice / strict Exam; Full or section/targeted scope.
- CANONICAL_JOURNEY: J-08 IELTS Listening.
- CAPABILITY_IDS: CAP-016, CAP-017, CAP-018, CAP-019, CAP-030, CAP-031, CAP-032, CAP-033, CAP-035, CAP-041.
- REC_IDS: REC-REM002-010, REC-REM002-014, REC-REM002-016, REC-REM002-027.

#### DESKTOP_WIREFRAME

    + IELTS LEARN/PRACTICE -----------+  OR  + STRICT LISTENING ---------------+
    | Listening                       |      | Part 2/4       18:32    Q 12/40 |
    | Scope: Full | Section | Targeted |      |----------------------------------|
    | Mode: Learn | Practice | Exam    |      | audio status: playing once       |
    | Duration / aids / evidence truth |      | prompt / active question         |
    | [Start chosen scope]             |      | answer [                 ]       |
    |----------------------------------|      |----------------------------------|
    | Review after attempt: cue return |      | Q palette 01...40 Flag Prev Next|
    | transcript/scrub only if mode    |      | final review: 2:00 when reached  |
    +----------------------------------+      +----------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Listening          Learn Practice|
    | Full | Section | Targeted        |
    | duration / aid truth             |
    | [ Start selected mode ]          |
    +=========== strict state =========+
    | Part 2/4      18:32      Q12/40  |
    | audio: single play               |
    | question / answer                |
    | Flag       Previous       Next   |
    | Questions sheet                  |
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Pre-entry scope/mode contract or active strict question with single-play audio, part/item progress, timer, flags, and no learning assistance.
- MATERIAL_SECONDARY_STATES: Instructions/audio check; four-part transition; lost connection/reload recovery; unanswered submit warning; two-minute final review; results; cue-grounded practice review; transcript/scrub only outside strict Exam; targeted remediation.
- RESPONSIVE_TRANSFORMATION: Active question is primary; navigator becomes a sheet; audio status remains persistent; review transcript is a separate sheet and cannot leak into strict state.
- PERSISTED_CONTEXT: Scope, mode, four-part/item position, answer/flag map, timer/review phase, single-play exposure, last durable checkpoint, and post-attempt cue identity.
- CROSS_SURFACE_ENTRY: IELTS Hub, Today, direct section practice, Full Mock transition, or remediation.
- CROSS_SURFACE_EXIT: Next part/skill, submit confirmation, results/review, exact audio cue when available, Errors, or chosen IELTS practice.
- ACCESSIBILITY_NOTES: Audio check and alternative status are explicit; timer warnings are announced once; palette states are textual; strict masked content never exposes answers in DOM/ARIA; recovery preserves test truth.
- ANTI_RPS_CHECK: [B] grounded review; [C] Learn/Practice/Exam and scope states; [D-REJECT] practice aids inside strict runner; [E-REJECT] forced Full Mock before section practice.
- CURRENT_FUTURE_TRUTH: Four parts/40 items/single play/2-minute final review [CURRENT]; review cue return [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION] where a locator exists; exact specialist timestamp return remains UNKNOWN; no official-score equivalence.

### WF-09 — IELTS Academic Reading

- SCREEN_ID: WF-09
- CANONICAL_PURPOSE: Complete three Academic passages and 40 items in 60 minutes under strict conditions, or use a distinct practice/review grammar with grounded passage return.
- MODE: Practice / strict Exam; Academic track.
- CANONICAL_JOURNEY: J-09 IELTS Academic Reading.
- CAPABILITY_IDS: CAP-016, CAP-017, CAP-020, CAP-030, CAP-031, CAP-032, CAP-033, CAP-035, CAP-041.
- REC_IDS: REC-REM002-011, REC-REM002-014, REC-REM002-016, REC-REM002-025, REC-REM002-027.

#### DESKTOP_WIREFRAME

    + ACADEMIC READING ---------------------------- 42:18 ------- Q 17/40 -----+
    | Passage 1 | Passage 2 | Passage 3       highlight      Questions palette|
    |-----------------------------------------+--------------------------------|
    | PASSAGE                                 | Question 17                    |
    | paragraph A ...                         | prompt                         |
    | paragraph B ... [highlighted span]      | ( ) answer A                   |
    | paragraph C ...                         | ( ) answer B                   |
    |                                         | Flag   [Next]                  |
    |-----------------------------------------+--------------------------------|
    | adjustable divider (keyboard controls) | 10m/5m warning / save status   |
    +----------------------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Academic      42:18      Q17/40  |
    | P1 P2 P3   Passage | Question    |
    |----------------------------------|
    | passage paragraph / highlight   |
    | [Switch to Question]            |
    |----------------------------------|
    | Flag       Previous       Next  |
    | Questions sheet                 |
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Strict split passage/question shell with active passage, item, timer, highlight, answers, flag state, and question navigation.
- MATERIAL_SECONDARY_STATES: Instructions; passage/paragraph jump; palette; keyboard divider; 10/5-minute warnings; reload recovery; unanswered submit warning; submitted review; explanation and exact passage evidence only post-attempt/practice; targeted new-passage retry.
- RESPONSIVE_TRANSFORMATION: Passage and question become reversible peer tabs rather than squeezed columns; active item, scroll, highlight, timer, and answers persist; palette opens as a sheet.
- PERSISTED_CONTEXT: Academic track, passage/item, responses/flags, remaining seconds, scroll/selection/highlight context, checkpoint, and post-attempt evidence locator.
- CROSS_SURFACE_ENTRY: IELTS Hub, Section Practice, Today, Full Mock, SearchResult owner link, or remediation.
- CROSS_SURFACE_EXIT: Submit/review, exact passage span, Error Notebook, targeted practice, next Full Mock transition, or IELTS Hub.
- ACCESSIBILITY_NOTES: Divider has buttons/keys; passage and question landmarks are named; highlights have an accessible list; warning and flag states are non-color; answer keys are absent before submit.
- ANTI_RPS_CHECK: [B] evidence-grounded review; [C] exam/practice and responsive states; [D-REJECT] duplicate mobile runner; [E-REJECT] desktop-only full test policy.
- CURRENT_FUTURE_TRUTH: Academic 3 passages/40 items/60 minutes [CURRENT]; grounded explanation and responsive recomposition [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; no exact breakpoint/device policy granted.

### WF-10 — IELTS General Training Reading

- SCREEN_ID: WF-10
- CANONICAL_PURPOSE: Complete the distinct GT three-section, 40-item, 60-minute runner while preserving workplace/social multi-text structure and GT-specific review truth.
- MODE: Practice / strict Exam; General Training track.
- CANONICAL_JOURNEY: J-10 IELTS General Training Reading.
- CAPABILITY_IDS: CAP-016, CAP-017, CAP-021, CAP-030, CAP-031, CAP-032, CAP-033, CAP-035, CAP-041.
- REC_IDS: REC-REM002-011, REC-REM002-014, REC-REM002-016, REC-REM002-025, REC-REM002-027.

#### DESKTOP_WIREFRAME

    + GT READING ----------------------------------- 42:18 ------- Q 17/40 -----+
    | Section 1 | Section 2 | Section 3      highlight       Questions palette|
    | Text A | Text B -----------------------+--------------------------------|
    | WORKPLACE / SOCIAL TEXT                | Question 17                    |
    | notice / instruction / paragraph       | prompt                         |
    | ... selected evidence ...              | [ response                 ]  |
    |                                         | Flag   [Next]                  |
    |-----------------------------------------+--------------------------------|
    | distinct GT track/score truth           | save/recovery status           |
    +----------------------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | GT Reading    42:18      Q17/40  |
    | S1 S2 S3    Text A B             |
    | Passage | Question               |
    |----------------------------------|
    | workplace/social text           |
    | [Switch to Question]            |
    |----------------------------------|
    | Flag       Previous       Next  |
    | Questions sheet                 |
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Strict GT split shell with section/text tabs, question workbench, timer, flags, and explicit track identity.
- MATERIAL_SECONDARY_STATES: Multi-text tabs; section transition; palette; highlighter; warnings; reload recovery; submit; GT-specific score/review; exact-text explanation after attempt; clean parallel retry.
- RESPONSIVE_TRANSFORMATION: Section/text identity stays in a compact tab row; passage/question become reversible views; long notices reflow; question palette is a sheet.
- PERSISTED_CONTEXT: GT track, section/text/item, responses/flags, remaining seconds, text scroll/highlight, checkpoint, and review locator.
- CROSS_SURFACE_ENTRY: IELTS Hub GT route, Section Practice, Today, Full Mock, Search owner link, or remediation.
- CROSS_SURFACE_EXIT: Submit/review, exact GT text, Errors, targeted practice, Full Mock transition, or IELTS Hub.
- ACCESSIBILITY_NOTES: Tabs use correct semantics; track and section are spoken; table/notice structure is preserved; flags/warnings are non-color; no answer key exists in strict DOM/ARIA.
- ANTI_RPS_CHECK: [B] evidence-grounded GT review; [C] track/section/mobile states; [D-REJECT] Academic skin pretending to be GT; [E-REJECT] merged score curve.
- CURRENT_FUTURE_TRUTH: GT 3 sections/40 items/60 minutes and separate runner/score truth [CURRENT]; grounded explanation/recomposition [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION].

### WF-11 — IELTS Writing Task 1

- SCREEN_ID: WF-11
- CANONICAL_PURPOSE: Plan and write an Academic visual report or GT letter in a durable practice lab, with a stricter embedded Exam variant and qualified, actionable review.
- MODE: Learn / Practice / strict Exam embedding; Academic visual and GT letter variants.
- CANONICAL_JOURNEY: J-11 IELTS Writing Task 1.
- CAPABILITY_IDS: CAP-016, CAP-017, CAP-022, CAP-023, CAP-025, CAP-030, CAP-031, CAP-032, CAP-033, CAP-035.
- REC_IDS: REC-REM002-003, REC-REM002-004, REC-REM002-012, REC-REM002-020, REC-REM002-027.

#### DESKTOP_WIREFRAME

    + WRITING TASK 1 ---------------- shared Writing timer / words / saved -----+
    | Academic Visual | GT Letter      Learn | Practice | Exam                 |
    |-----------------------------------------+--------------------------------|
    | PROMPT / STRUCTURED VISUAL              | RESPONSE EDITOR                |
    | +-------------------------------------+ |                                |
    | | chart / table / map / process       | |                                |
    | +-------------------------------------+ |                                |
    | [Semantic data table] prompt details    |                                |
    |-----------------------------------------+--------------------------------|
    | Plan (optional) | 150-word warning | [Submit] | rubric only after attempt|
    +----------------------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Writing T1   shared time   words |
    | Academic | GT      Prompt [Open] |
    |----------------------------------|
    | RESPONSE EDITOR                  |
    |                                  |
    |                                  |
    |----------------------------------|
    | Plan  Data table  Saved          |
    | 150-word warning      [Submit]   |
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Durable editor dominates; structured visual/letter situation remains inspectable; shared Writing timing is shown without falsely enforcing an official independent 20-minute task timer.
- MATERIAL_SECONDARY_STATES: Academic seven-family visual variants; semantic data table; zoom/pan; GT situation/register/checklist; optional plan; autosave/offline/recovery; under-150 warning; submit confirmation; processing; four-criterion feedback; span-linked action; revised and clean retry.
- RESPONSIVE_TRANSFORMATION: Prompt collapses to a sticky summary and full-screen sheet; editor remains primary above keyboard; data alternative is a labelled sheet; feedback becomes criterion then span then action views.
- PERSISTED_CONTEXT: Track/variant, deterministic prompt identity and data, outline, immutable draft revisions/digests, current text, word count, assistance/exposure, checkpoint when embedded, feedback source/version.
- CROSS_SURFACE_ENTRY: IELTS Hub, Section Practice, Today, Full Mock Writing transition, Search prompt owner, or remediation.
- CROSS_SURFACE_EXIT: Submit/review, exact feedback span, revision, clean/new-prompt retry, Errors, next Writing task, or Full Mock transition.
- ACCESSIBILITY_NOTES: Every visual has a semantic table and prompt association; editor status is announced sparingly; counters are text; zoom has buttons; feedback does not rely on annotations alone.
- ANTI_RPS_CHECK: [A] deterministic visual family presentation where not current; [B] hierarchical feedback; [C] Academic/GT and practice/exam variants; [D-REJECT] separate timer misrepresented as official.
- CURRENT_FUTURE_TRUTH: Editor/GT letter/visual container [CURRENT]; deterministic seven-family prompt system [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; practice estimate qualified; recommended approximately 20 minutes is guidance within shared 60 minutes, not an official hard timer.

### WF-12 — IELTS Writing Task 2

- SCREEN_ID: WF-12
- CANONICAL_PURPOSE: Plan, draft, review, revise, and transfer a 250-word essay while preserving shared Writing timing and strict separation between learning feedback and Exam state.
- MODE: Learn / Practice / strict Exam embedding.
- CANONICAL_JOURNEY: J-12 IELTS Writing Task 2.
- CAPABILITY_IDS: CAP-016, CAP-017, CAP-024, CAP-025, CAP-030, CAP-031, CAP-032, CAP-033, CAP-035.
- REC_IDS: REC-REM002-003, REC-REM002-004, REC-REM002-012, REC-REM002-027.

#### DESKTOP_WIREFRAME

    + WRITING TASK 2 PRACTICE -------- self-paced / words / saved --------------+
    | prompt summary                            Learn | Practice                |
    |-----------------------------------------+--------------------------------|
    | OUTLINE (optional drawer)               | RESPONSE EDITOR                |
    | thesis                                  |                                |
    | point / evidence                        |                                |
    | counterargument                         |                                |
    |-----------------------------------------+--------------------------------|
    | Request scaffold | self-check | 250-word warning | [Submit] (practice)   |
    | post-attempt: criterion > span > grounded action > revise / clean retry   |
    +----------------------------------------------------------------------------+
    + STRICT EXAM EMBEDDING ------------ shared Writing timer -----------------+
    | prompt | RESPONSE EDITOR | words | saved | no hint/scaffold/rubric aids  |
    |                              Previous task | Submit Writing section       |
    +----------------------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Writing T2 Practice         words |
    | Prompt [Open]      Outline [Open]|
    |----------------------------------|
    | RESPONSE EDITOR                  |
    |                                  |
    |                                  |
    |----------------------------------|
    | Scaffold  Self-check  Saved      |
    | 250-word warning      [Submit]   |
    +----------------------------------+
    +========= strict Exam ============+
    | shared time / words / saved      |
    | prompt [Open]                    |
    | RESPONSE EDITOR                  |
    | Prev task       Submit Writing   |
    | no learning aids                 |
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Prompt-associated durable editor with optional outline and learner-controlled assistance; strict Exam variant suppresses all teaching affordances.
- MATERIAL_SECONDARY_STATES: Outline; model/scaffold with visible assistance/fading state; autosave/offline/recovery; under-250 warning; submit; feedback processing; four-criterion overview; span action; correction/revision; clean novel-prompt retry; delayed retest/transfer.
- RESPONSIVE_TRANSFORMATION: Prompt and outline become independent sheets; editor owns the main viewport; status/actions remain above the software keyboard; feedback is a full-screen ordered review flow.
- PERSISTED_CONTEXT: Prompt identity, outline journal, immutable draft revisions, current text/word count, assistance state, checkpoint when embedded, evaluator/source/version/uncertainty, and revision lineage.
- CROSS_SURFACE_ENTRY: IELTS Hub, Section Practice, Today, Full Mock Writing, Analytics action, or remediation.
- CROSS_SURFACE_EXIT: Submit/review, exact response span, revision, clean novel task, Errors, Analytics, or Full Mock transition.
- ACCESSIBILITY_NOTES: Prompt is programmatically associated; outline controls are keyboard reachable; warning is not color-only; help is learner-controlled; feedback and revisions use a stable logical order.
- ANTI_RPS_CHECK: [B] feedback-to-action hierarchy; [C] outline/assistance/revision states; [D-REJECT] feedback as a parallel editor owner; [E-REJECT] permanent rubric wall.
- CURRENT_FUTURE_TRUTH: Task 2 workspace [CURRENT]; richer teaching/fading [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]; qualified estimate only; approximately 40 minutes is recommendation within shared 60-minute Writing timing, not a separate official hard timer.

### WF-13 — IELTS Speaking

- SCREEN_ID: WF-13
- CANONICAL_PURPOSE: Practice or simulate Parts 1–3 with exact part semantics, session-scoped recording controls, criterion/segment feedback, and truthful separation from a future interactive examiner.
- MODE: Guided Practice / self-recorded simulation; future Interactive Examiner reservation.
- CANONICAL_JOURNEY: J-13 IELTS Speaking.
- CAPABILITY_IDS: CAP-007, CAP-015, CAP-016, CAP-017, CAP-026, CAP-027, CAP-028, CAP-030, CAP-032, CAP-033, CAP-039, CAP-040.
- REC_IDS: REC-REM002-003, REC-REM002-013, REC-REM002-020, REC-REM002-027, REC-REM002-028.

#### DESKTOP_WIREFRAME

    + IELTS SPEAKING ----------------------------------------------------------+
    | Guided Practice [CURRENT] | Interactive Examiner [OWNER_RECONFIRMED_FUTURE]|
    | Part 1 | Part 2 | Part 3        mic ready / privacy / export truth       |
    |--------------------------------------+-----------------------------------|
    | PART 2 CUE CARD                      | NOTES (pinned through response)   |
    | Describe...                          | •                                 |
    | You should say...                    | •                                 |
    |--------------------------------------+-----------------------------------|
    | PREP 01:00 -> RESPONSE 02:00 | warning at 01:45 audible + visual          |
    | prompt audio   waveform / record   replay   [Finish response]            |
    | post-session: criterion > segment > action > controlled/novel retry      |
    +----------------------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Speaking / Part 2   mic ready    |
    | Guided [CURRENT]                  |
    |----------------------------------|
    | CUE CARD                         |
    | describe... / you should say...  |
    |----------------------------------|
    | Notes [pinned sheet]             |
    | PREP 01:00 / SPEAK 02:00         |
    | 01:45 warning: sound + text      |
    | [ Record / Finish ]              |
    | Export  Privacy  Fallback        |
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Guided part-specific prompt/recording: Part 1 familiar-topic interview for 4–5 minutes; Part 2 1-minute preparation, persistent notes, 2-minute response, warning at 1:45; Part 3 discussion/follow-up.
- MATERIAL_SECONDARY_STATES: Mode/part choice; equipment/permission/readiness; prompt audio; Part 1 recording turns; Part 2 cue/prep/respond/warning; Part 3 follow-ups; silence/retry; ASR unavailable fallback; replay; export; protected exit with unexported audio; feedback processing and criterion/segment actions.
- RESPONSIVE_TRANSFORMATION: Cue card remains primary; notes are a pinned, resizable sheet that survives prep-to-response; recording controls stay above safe area; feedback becomes an ordered full-screen review.
- PERSISTED_CONTEXT: Part/session prompt identity, timer phase, notes through Part 2, recording status, metadata/feedback, readiness/permission, assistance and export receipt; raw audio is session-scoped unless manually exported.
- CROSS_SURFACE_ENTRY: IELTS Hub, Today, Section Practice, Full Mock Speaking transition, Media self-record/Retell, or remediation.
- CROSS_SURFACE_EXIT: Post-session feedback, exact segment when available, Errors, selected retry, manual export, or protected exit; Full Mock completes to scorecard.
- ACCESSIBILITY_NOTES: Recording state is text plus sound/shape; timers and 1:45 warning are audible and visual with restrained live announcements; notes are keyboard/touch reachable; a non-ASR path remains available.
- ANTI_RPS_CHECK: [B] part-specific grounded feedback; [C] Guided/parts/readiness states; [D-REJECT] future examiner represented as current; [E-REJECT] provider controls before provider authority.
- CURRENT_FUTURE_TRUTH: Guided Parts 1–3/self-record [CURRENT]; Interactive Examiner Simulation [OWNER_RECONFIRMED_FUTURE]; raw audio ephemeral with manual export; comparator retention/deletion/consent mechanics remain UNKNOWN, so no inferred promise.

### WF-14 — IELTS Full Mock

- SCREEN_ID: WF-14
- CANONICAL_PURPOSE: Run a dedicated strict sequence from precheck through Listening, Reading, Writing, Speaking, transitions, recovery, and a truthful scorecard/remediation handoff.
- MODE: Strict Exam Simulation; direct Full Mock scope.
- CANONICAL_JOURNEY: J-14 IELTS Full Mock.
- CAPABILITY_IDS: CAP-016, CAP-017, CAP-018, CAP-020, CAP-021, CAP-022, CAP-023, CAP-024, CAP-026, CAP-027, CAP-028, CAP-029, CAP-031, CAP-032, CAP-033, CAP-035, CAP-039, CAP-040.
- REC_IDS: REC-REM002-016, REC-REM002-017, REC-REM002-018, REC-REM002-025, REC-REM002-027.

#### DESKTOP_WIREFRAME

    + FULL MOCK PRECHECK -------------------------------------------------------+
    | Track: Academic / GT        scope: Full Mock       duration/limits truth |
    | Equipment: audio ready | mic ready/fallback | storage/checkpoint ready  |
    | Sequence: Listening -> Reading -> Writing -> {Speaking now | schedule}   |
    | Scorecard: LRW complete / Speaking pending  -> composite when complete   |
    | No hints/transcript/coaching during active strict sections               |
    | (Choose section practice instead)                 [Start Full Mock]      |
    +============================== ACTIVE ====================================+
    | IELTS | READING | section/item | continuous timer | palette | Submit    |
    | STRICT SECTION WORKSPACE; ALL APPLICATION CHROME UNMOUNTED               |
    | ! recovered exact section, item, answers and remaining seconds !         |
    +============================ SCORECARD ===================================+
    | result/limitations | skill diagnostics | [Review] [Choose remediation]  |
    +----------------------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Full Mock / Precheck             |
    | Track / duration / limits        |
    | audio ✓  mic ✓  checkpoint ✓    |
    | L > R > W > Speaking now/schedule|
    | scorecard: pending / complete     |
    | Section practice remains direct |
    | [ Start Full Mock ]              |
    +=========== active ==============+
    | IELTS / skill   time   item      |
    | STRICT WORKSPACE                |
    | palette sheet / recovery banner |
    +=================================+

- PRIMARY_ACTIVITY_STATE: Direct precheck with mode/workload truth and alternative scopes, followed by chrome-free strict LRW sections with timer continuity and durable checkpoints; after LRW, the learner explicitly chooses immediate Speaking or a separately scheduled Speaking completion path.
- MATERIAL_SECONDARY_STATES: Track/equipment/precondition check; cancellation confirmation; Listening-to-Reading and Reading-to-Writing transitions; post-LRW Speaking-now/schedule branch; Speaking readiness/fallback; reload recovery; LRW-complete/Speaking-pending scorecard; composite-complete scorecard with limitations; optional exact review and nonpunitive remediation handoff.
- RESPONSIVE_TRANSFORMATION: Fullscreen Exam shell remains functional on mobile; prompt/palette/context use controlled sheets; neither recommendation nor device suitability messaging disables Full Mock; no app navigation leaks into active state.
- PERSISTED_CONTEXT: Mock run, track, exact section/item, responses/flags, timers, audio exposure, Writing drafts, Speaking scheduling/completion state and notes, readiness, checkpoint/recovery journal, pending/composite scorecard state, and final diagnostic receipt.
- CROSS_SURFACE_ENTRY: IELTS Hub, Today recommendation, or direct Full Mock route; never a prerequisite chain.
- CROSS_SURFACE_EXIT: Explicit cancellation to Hub, strict LRW transitions, immediate or separately scheduled Speaking, pending/composite scorecard, exact permitted review, Today LearningBlock, or Error Notebook remediation.
- ACCESSIBILITY_NOTES: Precheck reports each status in text; transition focus moves to the next section heading; timer/palette/recovery follow Exam shell rules; mobile does not remove essential prompt or navigation.
- ANTI_RPS_CHECK: [B] inspectable scorecard/action handoff; [C] precheck/transition/recovery/mobile states; [D-REJECT] a second set of section runners; [E-REJECT] full-first curriculum or desktop-only policy.
- CURRENT_FUTURE_TRUTH: Full Mock orchestrator [CURRENT]; exact section components retain their own truth; Speaking interactive examiner remains [OWNER_RECONFIRMED_FUTURE]; score limitations and practice estimate remain explicit.

### WF-15 — Settings / AI / Data Safety

- SCREEN_ID: WF-15
- CANONICAL_PURPOSE: Manage learner preferences, audio, consent, service readiness, secrets, signed content, backup/restore, privacy, and governance inspection with honest lifecycle state.
- MODE: Shared utility; configuration, trust, recovery, and data safety.
- CANONICAL_JOURNEY: J-15 Settings.
- CAPABILITY_IDS: CAP-015, CAP-036, CAP-037, CAP-038, CAP-039, CAP-040, CAP-041, CAP-042, CAP-043, CAP-044, CAP-045, CAP-046, CAP-048.
- REC_IDS: REC-REM002-009, REC-REM002-020, REC-REM002-021, REC-REM002-022, REC-REM002-026, REC-REM002-028.

#### DESKTOP_WIREFRAME

    + NAV ---+ SETTINGS -------------------------------------------------------+
    |        | Preferences | Audio | AI & Consent | Data | Content | About     |
    |        |-----------------------------------------------------------------|
    |        | AI & CONSENT                                                    |
    |        | Service: Connected / Disconnected / Unavailable   [Details]    |
    |        | Mode: Local | Opt-in Cloud | Offline fallback (provider-neutral)|
    |        | consent receipt [Review / Revoke]                               |
    |        | API key [session only] [Clear]  never disk / never backup       |
    |        |-----------------------------------------------------------------|
    |        | DATA SAFETY: [Export full backup] [Validate restore]            |
    |        | digest / schema / 59-store coverage / recovery journal status  |
    |        | CONTENT: signed trust / install / update / safe delete          |
    |        | ABOUT: [System & Governance Audit]                              |
    +--------+-----------------------------------------------------------------+

#### MOBILE_WIREFRAME

    +----------------------------------+
    | Settings                         |
    | Preferences >                    |
    | Audio & rates >                  |
    | AI & Consent >  Disconnected     |
    | Data Safety >   backup status    |
    | Content Packs > trust/update     |
    | Privacy & recordings >           |
    | About > Governance Audit         |
    |----------------------------------|
    | ! core-only / recovery state > ! |
    |Today Learn IELTS Library Progress|
    +----------------------------------+

- PRIMARY_ACTIVITY_STATE: Sectioned settings with one selected lifecycle, plain-language status, primary safe action, consequences, and reversible exit.
- MATERIAL_SECONDARY_STATES: Voice/rate/pitch including 0.75x/0.9x/1.0x/1.1x/1.25x; consent opt-in/revoke; service readiness; session-only key; signed-pack provenance/review; install/update/progress/cancel/resume; safe delete retaining records; full backup; restore validate/warn/progress/recover; boot diagnostic drawer; PWA/offline; roadmap audit.
- RESPONSIVE_TRANSFORMATION: Sections become routed list/details; complex restore and provenance use full-screen flows; confirmations use focus-managed sheets; progress/status remains visible on return.
- PERSISTED_CONTEXT: Preferences, consent receipt/revocation, service readiness, content trust/lifecycle receipts, backup digest/schema status, recovery journal, PWA status; secret remains session-only and raw audio remains session-scoped.
- CROSS_SURFACE_ENTRY: Global Settings, degraded/recovery banner, recording privacy link, content pack, boot diagnostic, or Analytics roadmap link.
- CROSS_SURFACE_EXIT: Normal navigation, downloaded backup, completed/failed restore, revoked consent, content owner, service fallback, or safe diagnostic copy.
- ACCESSIBILITY_NOTES: Settings are native labelled controls; state never uses color alone; consent/restore/destructive flows state consequences before action; progress is announced sparingly; touch targets and reflow are mandatory.
- ANTI_RPS_CHECK: [B] lifecycle clarity; [C] connected/degraded/progress/recovery states; [D-REJECT] duplicate data stores or pack records; [E-REJECT] provider-specific or developer feature wall.
- CURRENT_FUTURE_TRUTH: Preferences/consent/backup/restore/containment [CURRENT]; complete trust/readiness presentation [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION] where needed; cloud provider, physical database consolidation, and recording retention defaults remain unselected; Interactive Examiner remains [OWNER_RECONFIRMED_FUTURE].

## 7. Material secondary states and overlays

Secondary UI never creates a new semantic owner. Every overlay returns focus and context to the invoking owner.

    INVOKING OWNER
         |
         +--> short choice/status --------> POPOVER or BOTTOM SHEET
         +--> inspect/edit supporting data -> DRAWER or FULL-SCREEN SHEET
         +--> consequential confirmation --> FOCUS-TRAPPED DIALOG
         +--> recoverable result ----------> BANNER / UNDO TOAST
         +--> strict Exam navigation ------> EXAM-LOCAL PALETTE SHEET
         |
         +<-- close / complete: restore focus, source, draft, timer, scroll

| Overlay/state | Owner(s) | Required content and return behavior |
|---|---|---|
| Global SearchResult | Learning shell | Query, filters, grouped owner, result count, offline/stale/private truth, exact deep link; never copies content into Search |
| Quick Capture | Shell, WF-03, WF-04 | Proposed term/sense plus SourceContext; stages to WF-05; does not schedule or emit evidence |
| Assistance chooser | Evidence-capable Learn/Practice screens | UA/LA/SC/AR definitions and exact consequence; learner can close without acting |
| EvidenceReceipt | WF-02, WF-06–WF-13 | Source, mode, exposure, output, assistance, evaluator, version, uncertainty; receipt is inspection, not a second gateway |
| SourceContext | WF-02–WF-07, reviews | Owner, source/revision, locator, availability/private truth, direct Return |
| FeedbackAction | WF-06, WF-11–WF-13 | Criterion/category → exact span/segment → grounded explanation → action → correction/revision → clean retry → delayed/transfer |
| Transcript/cue rail | WF-03, WF-08 practice/review | Cue identity, coherent lines, keyboard seek, strict concealment; mobile full-height sheet |
| Transcript slicer | WF-03 Advanced | Split/merge cue, child revision, Save/Cancel; never silently rewrites source |
| Source library/import | WF-03, WF-04 | Current supported ingestion clearly separated from future structured parser; progressive first-ready status |
| Suspended cards | WF-02/Library | Active/Suspended/Mastered filters and Unsuspend action; suspension is always discoverable |
| Error context | WF-06 | Triggering prompt/output/correction/receipt/source; returns to the same hypothesis |
| Chart/table details | WF-07 | Text summary, values, uncertainty, provenance, action owner |
| IELTS scope selector | WF-08–WF-14 | Full Mock / section / targeted, duration, assistance and evidence truth; all scopes directly reachable |
| Exam palette | WF-08–WF-14 | Current/answered/unanswered/flagged plus keyboard movement; no answer content leak |
| Exam recovery banner | WF-08–WF-14 | Restored checkpoint facts and Continue/Inspect/Exit; timer semantics remain truthful |
| Writing prompt/outline | WF-11–WF-12 | Prompt association, semantic visual alternative, durable outline; editor context persists |
| Writing/Speaking feedback | WF-11–WF-13 | Formative source, Practice Estimate where applicable, assistance, uncertainty, revision/novel retry |
| Speaking notes | WF-13/WF-14 | Pinned through Part 2 preparation and response; does not cover timer or recording controls |
| Recording exit guard | WF-03/WF-13/WF-14 | Export / Exit without saving / Cancel when raw audio is unexported |
| Consent | WF-15 and recording/service entry | Plain-language purpose, processing truth, Opt in/Cancel, receipt, immediate Revoke |
| Trust & Provenance | WF-15 Content | Signature state, source, educational rights, review, installed version, update/revoke/delete-retain truth |
| Restore validator | WF-15 | File/digest/schema/store coverage, warnings, confirm, progress, interrupted recovery/result |
| Safe destructive dialog | Shared | Named object/consequence, explicit action, Cancel; five-second Undo where the canonical action is recoverable |
| Boot diagnostic | Shared | Calm error summary, impact, recovery, Copy Diagnostic Info, Dismiss; prevents white-screen failure |

Orthogonal state composition remains visible in annotations and banners:

    PRIMARY_ACTIVITY × ASSISTANCE × INTEGRITY × CONNECTIVITY × RECOVERY
    drafting          × SC         × normal    × offline      × recovery-ready

No layout may flatten these axes into mutually exclusive pages.

## 8. Cross-surface handoff map

    SOURCE/REVISION/LOCATOR
             |
             v
       [Reader / Media] --capture candidate--> [Capture Inbox]
             ^                                      |
             |                                      v confirm/merge
             +----- exact occurrence return --- [Vocabulary Library]
                                                        |
                               qualified attempt --EP?--+--> [EvidenceReceipt]
                                                                  |
                                      +---------------------------+-----------+
                                      v                                       v
                                [Error Notebook]                         [Analytics]
                                      |                                       |
                                      +-- clean/delayed/transfer activity -----+

| Handoff | Payload preserved | Destination rule | Failure/fallback rule |
|---|---|---|---|
| Source → Capture | Source/revision, exact locator, excerpt, rights/private scope, proposed sense | Stage in the single WF-05 Inbox | If source unavailable, retain honest locator and unavailable state |
| Capture → Library | Confirmed/merged lexical object, sense, goals, occurrences | Explicit import creates the cold-start WF-02 card and Today queue entry | Never auto-launch a forced learning run or claim positive recall evidence |
| Library/Review → Source | Selected or representative occurrence and revision | Exact WF-03/WF-04 context | Offer bounded fallback when revision cannot be resolved |
| Practice/Exam → Review | Passage span, audio cue where available, Writing span, Speaking segment, receipt | Owner-local post-attempt review | If exact cue/segment is unknown, label unavailable; do not fabricate precision |
| Review → Remediation | Trigger receipt, construct hypothesis, exposure state | WF-06 then disjoint/parallel clean content | Original correction and clean retry remain separate outcomes |
| Search/Analytics → Context | Query/filter or projection/evidence and canonical owner/deep link | Reveal existing owner | Search/Analytics never duplicate content or practice runners |
| Today → Activity | LearningBlock, rationale, workload, source/activity cursor | Chosen existing owner | Change/Skip/Dismiss remain available; no global lock |
| Activity → Today | Summary, incomplete/resume state, qualified receipt when emitted | Today Continuation or voluntary next choice | Non-evidence activities still return safely without schedule mutation |
| IELTS attempt → Errors | Diagnostic ErrorCandidate, source item, response/correction, uncertainty | WF-06 | Voluntary remediation; no automatic FSRS-positive event |
| Full Mock → Remediation | Skill diagnostics, limitations, exact review links where supported | Today and WF-06 | Keep Speaking/future limitations explicit; no forced sequence |

## 9. Capability-preservation reconciliation

VISIBLE means foreground control/content. BACKGROUND+VISIBLE means system behavior with required learner-facing status. BACKGROUND means no fabricated permanent control. W3 preserves both capability and user-experience continuity; consolidation never means deletion.

| Capability | Wireframe screen | Surface / state | Visibility | Material secondary behavior | No-silent-deletion result |
|---|---|---|---|---|---|
| CAP-001 Today Daily Study Runner | WF-01 | recommendation, preview, backlog, summary | VISIBLE | rationale, workload, alternative, resume | MAPPED—runner and agency retained |
| CAP-002 FSRS 5-Skill Memory Scheduling | WF-01/WF-02 | due/review and receipt consequence | BACKGROUND+VISIBLE | interval/retrievability; qualified unassisted consequence only | MAPPED—five-skill scheduler unchanged |
| CAP-003 Vocabulary & Collocation Drills | WF-02 | lifecycle practice canvas | VISIBLE | modality selector, retry, transfer | MAPPED—all modalities consolidated |
| CAP-004 Sentence Learning Loop | WF-03 | optional Guided Session | VISIBLE | Continue/Skip/Change/Exit at seven steps | MAPPED—no mandatory unlock order |
| CAP-005 Strict vs Practice Dictation | WF-03 | two dictation variants | VISIBLE | strict concealment; practice hints | MAPPED—local lock ends on submit/exit |
| CAP-006 Noticing & Thought Groups | WF-03 | Noticing workbench/drawer | VISIBLE | IPA, weak forms, stress, chunks | MAPPED—independently launchable |
| CAP-007 Shadowing & Self-Recording | WF-03/WF-13 | record/compare/replay/export | VISIBLE | readiness, session audio, exit guard | MAPPED—coaching and export retained |
| CAP-008 Retell Coaching & Drafting | WF-03 | Retell mode | VISIBLE | autosave/recovery, assistance/evidence disclosure | MAPPED—draft journal retained |
| CAP-009 YouTube Video Workspace, six modes | WF-03 | stable media workspace | VISIBLE | direct six-mode selector, transcript rail | MAPPED—6 modes not 6 screens |
| CAP-010 Caption Normalization/Deduplication | WF-03/WF-04 | ingestion/cue readiness | BACKGROUND+VISIBLE | normalizing/partial-ready/error states | MAPPED—engine preserved |
| CAP-011 Private Source Library | WF-03/WF-04 | source picker/import/reader | VISIBLE | current ingestion; future parser labelled | MAPPED—source ownership retained |
| CAP-012 Unified Capture Inbox | shell/WF-05 | quick capture and triage | VISIBLE | edit, batch, confirm, discard, mobile sheet | MAPPED—one Inbox only |
| CAP-013 Multi-Dimensional Analytics | WF-07 | construct overview | VISIBLE | uncertainty, drill-down, action link | MAPPED—constructs remain separate |
| CAP-014 Error Notebook & Diagnostic Fingerprint | WF-06 | weakness list/map/detail | VISIBLE | filters, source context, remediation | MAPPED—23-category-compatible owner retained |
| CAP-015 Audio Manager & TTS Voice Selection | shared dock/WF-15 | active player and preferences | VISIBLE | voice/rate/pitch, scrub/A–B; Exam suppression | MAPPED—hidden only when irrelevant |
| CAP-016 EvidencePolicy Decision Gateway | shared | assistance badge and EvidenceReceipt | BACKGROUND+VISIBLE | default deny; reveal/review never silent success | MAPPED—sole gateway, never duplicated |
| CAP-017 Academic vs GT Track Switcher | WF-08–WF-14 | pre-entry/shared IELTS header | VISIBLE | distinct Reading/Writing variants | MAPPED—no prerequisite gate |
| CAP-018 Listening Four-Part Exam Runner | WF-08/WF-14 | strict Listening | VISIBLE | 4 parts, 40 items, single play, 2m review | MAPPED—strict semantics intact |
| CAP-019 Listening Practice Mode | WF-08 | Practice variant | VISIBLE | part choice, scrub/rewind, post-attempt transcript | MAPPED—does not leak into Exam |
| CAP-020 Academic Reading Split Runner | WF-09/WF-14 | Academic strict runner | VISIBLE | 3 passages, 40 items, 60m, highlight/warnings | MAPPED—responsive runner retained |
| CAP-021 GT Reading Split Runner | WF-10/WF-14 | GT strict runner | VISIBLE | 3 sections, multi-text, 40 items, 60m | MAPPED—distinct GT structure retained |
| CAP-022 Academic Writing Task 1 Visual Container | WF-11/WF-14 | prompt/visual/editor | VISIBLE | zoom and semantic table; future renderer truth | MAPPED—current container plus target reservation |
| CAP-023 GT Writing Task 1 Letter | WF-11/WF-14 | GT variant | VISIBLE | register, situation, three-bullet checklist | MAPPED—not substituted by Academic visual |
| CAP-024 Writing Task 2 Essay | WF-12/WF-14 | prompt/editor/outline | VISIBLE | 250-word warning and shared-timer truth | MAPPED—practice and Exam variants retained |
| CAP-025 Four-Criterion Writing Evaluation | WF-11/WF-12 | post-attempt review | VISIBLE | TA/TR, CC, LR, GRA; Practice Estimate label | MAPPED—no official equivalence |
| CAP-026 Speaking Part 1 | WF-13/WF-14 | familiar-topic recording | VISIBLE | 4–5m, prompt audio, answer recording | MAPPED—exact part semantics shown |
| CAP-027 Speaking Part 2 | WF-13/WF-14 | cue/prep/respond | VISIBLE | 1m prep, pinned notes, 2m, 1:45 warning | MAPPED—notes survive transition |
| CAP-028 Speaking Part 3 | WF-13/WF-14 | discussion/follow-up | VISIBLE | turn pacing and post-session review | MAPPED—part-specific flow retained |
| CAP-029 Full Mock Orchestrator | WF-14 | precheck through scorecard | VISIBLE | L→R→W, Speaking-now/schedule branch, transitions, recovery | MAPPED—dedicated strict shell and truthful pending result |
| CAP-030 IELTS Section Practice | WF-08–WF-13 | scope selector and practice shell | VISIBLE | direct part/passage/task selection | MAPPED—Full Mock never prerequisite |
| CAP-031 Fifteen Objective Task Families | WF-08–WF-10/WF-14 | objective question components | VISIBLE | standardized accessible controls with family differences | MAPPED—no family collapse |
| CAP-032 Live Exam Timers & Pacing | WF-08–WF-14 | Exam top bar/warnings | VISIBLE | official countdown; accessible 10/5m and part alerts | MAPPED—minimal persistent timer |
| CAP-033 Exam Reload & Crash Recovery | WF-08–WF-14 | checkpoint/recovery banner | BACKGROUND+VISIBLE | exact section/item/responses/time; audio offset where relevant | MAPPED—lifecycle preserved |
| CAP-034 Primary IA V10 Host Integration | global shells | rail/bottom nav and Exam suppression | VISIBLE | one Today, one Capture, five pillars | MAPPED—host routes unchanged |
| CAP-035 IELTS Hub V2 | IELTS entry to WF-08–WF-14 | track/scope/skill launcher | VISIBLE | Discover/Videos/Skills/content paths | MAPPED—direct launches consolidated |
| CAP-036 Signed Content Platform & Catalog Trust | WF-15 Content | pack card/provenance | VISIBLE | signature/source/rights/review/update | MAPPED—trust state inspectable |
| CAP-037 Offline Pack Lifecycle | WF-15 Content | install/update/delete lifecycle | VISIBLE | progress/cancel/resume/error; retain records on delete | MAPPED—full lifecycle retained |
| CAP-038 Roadmap Runtime Inspector | WF-15 About | governance audit | VISIBLE | package/wave/milestone inspection | MAPPED—moved, never removed |
| CAP-039 Consent Receipt Gateway | WF-15/shared recording | consent/revoke flow | VISIBLE | purpose, processing, receipt, immediate revoke | MAPPED—plain-language opt-in retained |
| CAP-040 Desktop ASR Companion Bridge | WF-03/WF-04/WF-13/WF-15 | ingestion/readiness badge and fallback | BACKGROUND+VISIBLE | Connected/Disconnected/Unavailable | MAPPED—non-ASR alternative retained |
| CAP-041 Core-Only Degraded Mode | global shell/relevant screens | calm limitation banner | BACKGROUND+VISIBLE | core drills available; service/storage limits | MAPPED—no white screen or false durability |
| CAP-042 Backup Registry | WF-15 Data | export/validate/restore | VISIBLE | digest/schema/59-store preflight and atomic result | MAPPED—full registry retained |
| CAP-043 Interrupted Restore Auto-Recovery | WF-15/boot | recovery journal lifecycle | BACKGROUND | calm progress/result only when surfaced | MAPPED—no fabricated manual switch |
| CAP-044 Session Secret Containment | WF-15 AI | session-key state | BACKGROUND+VISIBLE | ephemeral-only indicator, clear/absent | MAPPED—excluded from disk/backup |
| CAP-045 Non-Blocking Boot Error Reporter | global | toast/diagnostic drawer | BACKGROUND+VISIBLE | impact, recovery, copy diagnostic, dismiss | MAPPED—prevents white screen |
| CAP-046 Safe Destructive Operations | shared/WF-02/WF-05/WF-15 | confirm and Undo | VISIBLE | named consequence, Cancel, five-second Undo where applicable | MAPPED—no browser confirm/silent loss |
| CAP-047 Progressive Long-Media Processing | WF-03/WF-04 | partial-ready ingestion | BACKGROUND+VISIBLE | first cue ready, background progress/error | MAPPED—study can begin safely |
| CAP-048 PWA Offline Support & Cache Cleanup | shared | offline/install/readiness status | BACKGROUND+VISIBLE | cached-at/stale cleanup truth, conditional banner | MAPPED—no invented guarantee |

Result: CAP-001..CAP-048 = 48/48 mapped; no capability is deleted, renamed away, or replaced by decorative chrome.

## 10. S4-OMIT reconciliation

| Omission | Screen/state | Wireframe representation | Preservation result |
|---|---|---|---|
| S4-OMIT-001 Custom lexical target capture | WF-03 Guided Vocabulary step → Quick Capture/WF-05 | Add custom target carries exact sentence/cue SourceContext | MAPPED—custom input not reduced to detected tokens |
| S4-OMIT-002 Retell draft recovery | WF-03 Retell | DRAFT_JOURNAL_PREFIX autosave status plus Restore/Discard recovered draft banner | MAPPED—draft journal visible |
| S4-OMIT-003 Strict dictation DOM/ARIA masking | WF-03 Strict Dictation | answer absent from visual, DOM, and accessibility tree until submit/exit | MAPPED—local integrity preserved |
| S4-OMIT-004 Transcript slicing/edit drawer | WF-03 Advanced | split/merge cue, child revision, Save/Cancel | MAPPED—progressive disclosure, no silent rewrite |
| S4-OMIT-005 Core-only degraded notice | shared shell | calm limitations banner and recovery/details link | MAPPED—core path stays usable |
| S4-OMIT-006 Mobile audio/bottom-nav collision | mobile Learning shell | safe-area audio dock strictly above navigation | MAPPED—both remain reachable |
| S4-OMIT-007 Card suspension visible/manageable | WF-02/Library | Suspend/Unsuspend and Active/Suspended/Mastered filters | MAPPED—suspended items discoverable |
| S4-OMIT-008 Exam pacing/target date Analytics | WF-07 | pacing calculator with target date, workload, adjustable target | MAPPED—projection separated from mastery |
| S4-OMIT-009 Exact audio rates | shared dock/WF-15 | 0.75x, 0.9x, 1.0x, 1.1x, 1.25x explicit selector | MAPPED—Exam suppression still applies |
| S4-OMIT-010 Speaking Part 2 pinned notes | WF-13/WF-14 Speaking | persistent notes from 1m prep through 2m response | MAPPED—survives timer-phase change |
| S4-OMIT-011 Pack provenance/review inspection | WF-15 Content | Trust & Provenance shows rights/source/review/signature | MAPPED—available from each pack card |
| S4-OMIT-012 Roadmap runtime status audit | WF-15 About | System & Governance Audit subview | MAPPED—relocated, not removed |

Result: S4-OMIT-001..S4-OMIT-012 = 12/12 mapped. Research guards remain pointer metadata, not new canonical capabilities.

## 11. REM-003 recommendation reconciliation

The REC_IDS field on each screen preserves its exact normative screen anchors and, for WF-08–WF-14, the shared-scope REC-REM002-027 anchor. REM-003 additionally requires every screen package to account for universal evidence set U = REC-REM002-002, REC-REM002-020, REC-REM002-021, REC-REM002-022, REC-REM002-023, REC-REM002-024, REC-REM002-025, REC-REM002-026. A means materially applicable; N/A means the mechanic is intentionally absent from that primary screen rather than silently deleted or leaked.

| Screen | 002 SourceContext | 020 evidence/consent | 021 data/recovery | 022 service/ASR | 023 receipt | 024 owner/anti-dup | 025 responsive | 026 accessibility |
|---|---|---|---|---|---|---|---|---|
| WF-01 | N/A | A: no false evidence | A: resume/degraded | N/A | N/A | A | A | A |
| WF-02 | A | A | A: durable review | N/A | A | A | A | A |
| WF-03 | A | A | A: draft/degraded | A | A | A | A | A |
| WF-04 | A | A: capture is not evidence | A: source/offline | A: ingestion bridge | N/A | A | A | A |
| WF-05 | A | A: import is not recall evidence | A | N/A | N/A | A | A | A |
| WF-06 | A | A | A: remediation recovery | N/A | A | A | A | A |
| WF-07 | A: receipt deep link | A | A: cached-at truth | N/A | A | A | A | A |
| WF-08 | A: cue | A | A: checkpoint | N/A | A post-attempt | A | A | A |
| WF-09 | A: passage | A | A: checkpoint | N/A | A post-attempt | A | A | A |
| WF-10 | A: GT text | A | A: checkpoint | N/A | A post-attempt | A | A | A |
| WF-11 | A: prompt/span | A | A: draft/checkpoint | N/A | A post-attempt | A | A | A |
| WF-12 | A: prompt/span | A | A: draft/checkpoint | N/A | A post-attempt | A | A | A |
| WF-13 | A: prompt/segment | A | A: notes/exit guard | A: recording fallback | A | A | A | A |
| WF-14 | A: section context | A | A: checkpoint | N/A | A | A | A | A |
| WF-15 | N/A | A | A | A | N/A: no learning EvidenceReceipt | A | A | A |

| Recommendation | Decision / Anti-RPS | Wireframe screen/state | W3 disposition |
|---|---|---|---|
| REC-REM002-001 Explainable Today recommendation | ADAPT / B | WF-01 recommendation | Show reason/workload/alternatives; engine and agency unchanged |
| REC-REM002-002 Semantic SourceContext continuity | ADAPT / B | source owners and handoffs scoped above | One owner/revision/locator grammar with honest fallback |
| REC-REM002-003 Plural skill teaching with fading | ADAPT / C | WF-11–WF-13 and LearningBlock states | Optional model/scaffold/faded forms; no global lock |
| REC-REM002-004 Feedback leads to grounded action | ADAPT / B | WF-06, WF-11, WF-12 | Explanation, correction/revision, clean retry, delayed retest separated |
| REC-REM002-005 Context-rich lexical object | KEEP / C | WF-02 lifecycle | Preserve source, sense, collocation, goals, modalities, transfer |
| REC-REM002-006 Staged capture | KEEP / C | WF-02, WF-04, WF-05 | Confirm sense/source/goal/duplicate and Undo before explicit import |
| REC-REM002-007 Memory vs skill/IELTS/transfer separation | KEEP / C | WF-02 and WF-07 | FSRS remains memory scheduler; constructs never merged |
| REC-REM002-008 Search returns to owners/context | ADAPT / B | Search overlay and WF-04 | Four-object non-exam search with offline/stale/private truth; no copied owner |
| REC-REM002-009 Signed catalog trust lifecycle | ADAPT / B | WF-15 Content | Provenance, last-known-good/update/revoke/delete-retain state |
| REC-REM002-010 Listening cue identity | ADAPT / B | WF-03 and WF-08 review | Stable cue-grounded review; strict single play preserved |
| REC-REM002-011 Reading passage evidence/rationale | ADAPT / B | WF-09/WF-10 review | Exact span/rationale and new-passage retry after attempt |
| REC-REM002-012 Writing criterion/span/action | ADAPT / B | WF-11/WF-12 feedback | Hierarchical grounded review plus processing/qualification truth |
| REC-REM002-013 Speaking criterion/segment progression | ADAPT / B | WF-03 recording and WF-13 | Model/controlled/novel options, source-labelled feedback |
| REC-REM002-014 IELTS grounded review/remediation | ADAPT / C | WF-08–WF-10; practice shell | Optional review and item-type practice in existing owners |
| REC-REM002-015 Uncertain misconception lifecycle | ADAPT / C | WF-06 | Confidence/frequency/impact plus separate outcomes |
| REC-REM002-016 Official strict semantics | KEEP / C | Exam shell, WF-08–WF-10, WF-14 | Cardinalities, timers, palette, recovery, zero aids preserved |
| REC-REM002-017 Full-test limitations-to-action | ADAPT / B | WF-14 scorecard | Qualified pending/composite result and exact skill action; Speaking paths truthful |
| REC-REM002-018 Recommendation alternatives/nonpunitive re-entry | ADAPT / B | WF-01 and WF-14 entry | Why/alternative/skip/direct access; no global locks |
| REC-REM002-019 Inspectable multidimensional analytics | KEEP / B | WF-07 | Uncertainty, drill-down, next action without causal claim |
| REC-REM002-020 Evidence/consent disclosure | KEEP / B | applicable screens scoped above | Source/evaluator/version/assistance/uncertainty; default deny |
| REC-REM002-021 Data safety/degraded/recovery lifecycle | KEEP / C | applicable screens scoped above | Honest durability, backup/recovery/offline state; no schema claim |
| REC-REM002-022 Service/ASR readiness | ADAPT / B | WF-03/WF-04/WF-13/WF-15 as scoped | Connected/Disconnected/Unavailable plus alternatives; N/A elsewhere |
| REC-REM002-023 One EvidenceReceipt grammar | KEEP / B | evidence-capable screens scoped above | Source/mode/exposure/output/evaluator/uncertainty visible |
| REC-REM002-024 Reject duplicate owners/feature walls | REJECT / D | all 15 screens and shared IA | Consolidate chrome; retain CAP/omit/truth trace; reject duplicate UX |
| REC-REM002-025 Responsive task-priority recomposition | ADAPT / C | every screen, especially WF-09/WF-10/WF-14 | Recompose, do not shrink; no special-device policy |
| REC-REM002-026 Accessibility proof obligations | KEEP / B | every screen, especially WF-15 | Keyboard/focus/reflow/non-drag/media/semantic proof; no conformance claim |
| REC-REM002-027 Distinct Full/section/targeted scopes | KEEP / C | WF-08–WF-14 scope selector | Direct choice with workload/aids/evidence truth; no full-first chain |
| REC-REM002-028 Ephemeral recording data safety | KEEP / B | WF-13/WF-15 and recording exit guard | Session raw audio, manual export, protected exit; no inferred retention promise |

Result: REC-REM002-001..REC-REM002-028 = 28/28 reconciled: 11 KEEP, 16 ADAPT, 1 REJECT; Anti-RPS distribution B=17, C=10, D=1. KEEP preserves the mechanic, ADAPT preserves the evidence-bounded value within OmniIELTS ownership, and REJECT blocks duplication rather than deleting a capability.

## 12. Mobile and accessibility reconciliation

### Mobile facet coverage

| Facet | Required mobile proof in this blueprint | Covered by |
|---|---|---|
| 1. Source return | Source/revision/locator/position and direct Return persist | WF-02–WF-05, handoff map |
| 2. Media workspace | Player/cue/workbench remain stable; transcript becomes sheet; strict concealment remains | WF-03 |
| 3. Vocabulary | Lifecycle, source, modality, review, audio, and choice survive one-column reflow | WF-02 |
| 4. Academic and GT Reading | Both tracks preserve passage/section/item/scroll/highlight/timer/40-item semantics | WF-09/WF-10 |
| 5. Writing | Prompt/data alternative, editor, count/time, qualified estimate, revision/retry persist | WF-11/WF-12 |
| 6. Speaking | Parts 1–3, cue, pinned notes, recording, privacy/readiness/fallback persist | WF-13 |
| 7. Full Mock and section practice | Both remain directly reachable and functional; guidance is nonblocking | WF-08–WF-14 |
| 8. Search/knowledge reuse | Query/filter/group/owner/deep link/source return/offline truth persist | Search overlay/handoffs |
| 9. Signed-content lifecycle | Trust/install/update/delete/progress/receipts/record-retention truth persist | WF-15 |
| 10. ASR fallback | Availability, permission, processing truth, and non-ASR alternative persist | WF-03/WF-13/WF-15 |
| 11. Interruption/recovery/offline/degraded | Draft, timer/test, cue/item, query, receipt, durability truth persist | global states and all relevant screens |

Result: mobile facets = 11/11. This blueprint grants no device allocation policy and does not make any full test desktop-only.

### Accessibility proof obligations

| Obligation | Structural requirement now | W4/runtime verification later |
|---|---|---|
| Keyboard and focus | Logical landmarks; every control, player, palette, divider, chart drill-down, and overlay reachable; close restores focus | Browser keyboard path and focus-order testing |
| Pointer and touch | Large targets; no hover-only action; explicit alternative to swipe/drag/reorder | Device/touch target measurement |
| Reflow | Semantic one-column recomposition at 320 CSS px equivalent; no clipped action/timer | Zoom/reflow browser testing |
| State communication | Text/icon/shape supplement color; restrained status/live regions | Screen-reader announcement audit |
| Media alternatives | Captions/transcript/descriptive text and accessible controls; strict answers absent from DOM/ARIA | Player, caption, and accessibility-tree inspection |
| Timed assessment | Warnings, transition, recovery, and accommodation truth are inspectable | Timer precision and assistive-technology tests |
| Recording | Permission/readiness/state, non-ASR alternative, privacy/export/exit language | Mic denial, device, and screen-reader tests |
| Writing visuals | Semantic table/text alternative and prompt-editor association | Chart/table parity and editor association tests |
| Search | Accessible combobox, groups, counts, owner/deep link | Keyboard and screen-reader search tests |
| Charts | Text summary, data table, drill-down, non-color uncertainty | Chart/table data equivalence tests |
| Cognitive load | Stable workspace, progressive disclosure, plain language, learner-controlled help, no shame | Usability study and content review |

This is a design obligation register, not a claim of current WCAG conformance. Later verification must include browser, device, keyboard, screen reader, zoom/reflow, reduced motion, recording permissions, and timed-assessment accommodations.

## 13. W4 handoff constraints

W4 may define the visual system only inside these structural boundaries:

1. Maintain visibly distinct Learning and strict Exam grammars. App chrome must unmount in strict Exam; it cannot be merely hidden while focusable.
2. Make the current primary action dominant while Skip, Change Activity, Request Hint, Scratchpad, and direct major destinations remain discoverable.
3. Use progressive disclosure for Export Audio, cue editing, provenance audit, technical diagnostics, and complex settings—not for required task controls.
4. Preserve every desktop/mobile pane-to-sheet transformation and its persisted context. Mobile cannot be a scaled screenshot of desktop.
5. Show UA, LA, SC, and AR assistance truth and the separate EvidenceReceipt without implying any assistance class automatically emits or denies evidence outside EvidencePolicy.
6. Preserve source owner, revision, locator, and exact Return affordance anywhere SourceContext is shown.
7. Keep Memory Retention, skill evidence, IELTS estimate, and transfer distinct in labels, layout, and uncertainty presentation.
8. Keep Full Mock, section practice, and targeted practice directly reachable; never use padlocks, disabled tabs, or grayed major destinations to fake a curriculum.
9. Preserve official cardinalities/timings and W3 chrome stripping. Decorative timer emphasis must not invent independent official Writing task timers.
10. Retain semantic alternatives for visual prompts, charts, audio, transcript, recording, drag/split controls, and all status colors.
11. Represent future items only with the exact truth labels below. Do not choose an AI/cloud provider, physical database consolidation, recording retention default, search technology, or exact breakpoint policy.
12. Do not introduce runtime code, final component API, schema/store mutation, or evidence-policy redesign through visual-system work.
13. Reduced-motion preference makes nonessential transitions instantaneous without removing state, status, or focus continuity.

Exact truth-label vocabulary for W4:

- [CURRENT]
- [CURRENT_REHOMED]
- [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]
- [FUTURE_UX_RESERVED]
- [FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]
- [OWNER_RECONFIRMED_FUTURE]
- [BACKGROUND_SYSTEM]

The W1 phrase [STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION] maps to [STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION] in this bounded vocabulary.

## 14. Evidence and unresolved register

### Evidence basis

| Source | Use in W3 | Boundary |
|---|---|---|
| W0 Capability Preservation Matrix | CAP-001..048 and S4-OMIT-001..012 reconciliation | Capabilities preserved; W3 does not change runtime |
| W1 Information Architecture | Five pillars, dual shells, ownership, mobile transformation, agency | Recommendations never become navigation locks |
| W1 User Journeys | J-01..J-15 entries, exits, purposes, secondary states | Exact screen owner names retained where meaning differs |
| W2 Interaction and State Model | Orthogonal states, assistance/evidence, integrity, recovery, exam semantics | EvidencePolicy remains sole default-deny gateway |
| Accepted REM-003 | REC-REM002-001..028, KEEP/ADAPT/REJECT, mobile/accessibility, unknowns | No external research restarted; no unsupported competitor mechanic promoted |

### Evidence-bounded unknowns

| Flag | Exact unresolved evidence | W3 containment |
|---|---|---|
| UM-01 | Exact specialist timestamp/cue-level Listening return is UNKNOWN | Show exact return only when a canonical locator exists; otherwise label unavailable |
| UM-02 | Current TestGlider correction beside original response is UNKNOWN | Use canonical FeedbackAction, not a comparator claim |
| UM-03 | Comparator recording-specific retention is UNKNOWN beyond general policy | State OmniIELTS session-scoped raw-audio truth only |
| UM-04 | Comparator per-recording deletion is UNKNOWN | Do not infer or advertise it |
| UM-05 | Comparator raw-audio export is UNKNOWN | OmniIELTS manual export derives from ratified W2 Option A only |
| UM-06 | Comparator capture-time microphone consent is UNKNOWN | Use canonical consent/readiness obligations only |
| UM-07 | CommonLit complete three-stage teaching sequence is PARTIAL only | Keep plural optional teaching states; no clone claim |
| UM-08 | Write & Improve history proving fading/delayed retest/transfer is UNKNOWN | Treat fading/retest/transfer as canonical exploration, not efficacy evidence |

REM-003 evidence limits remain visible: STALE_SOURCE=2, UNSUPPORTED_MECHANIC=8, DIRECT_PRODUCT_INSPECTION=0. Account-gated details, competitor efficacy, exact recording lifecycles, learner/usability/mobile-device/assistive-technology studies, causal efficacy, and browser-WASM versus Desktop ASR performance remain unverified. These unknowns do not block the bounded structural decisions above because no unsupported mechanic is required for the W3 layout.

### Owner-decision containment

| Decision | W3 treatment |
|---|---|
| R4-OD001 AI/cloud provider | Provider-neutral Local / Opt-in Cloud / Offline fallback; selection deferred |
| R4-OD002 retention target | Configurable 0.80–0.95 control/workload preview may be visualized; no default frozen |
| R4-OD003 backlog cap | Today exposes Quick Catch-up and Full Due Queue as learner choices |
| R4-OD004 streak forgiveness | At most a provisional protection badge; no canonical policy encoded |
| R4-OD005 physical database consolidation | Unified learner-facing data only; physical schema deferred |
| R4-OD006 raw recording policy | RESOLVED in W2: session-scoped raw audio, manual export, protected exit |
| R4-OD007 degradation/offline | Preserve local core paths and honest queued/unavailable service states; final policy deferred |

No unresolved material owner decision forces a W4 visual-system choice, runtime implementation, provider selection, schema mutation, or device exclusion in this candidate.

### Final structural audit assertions

- 15/15 canonical representative screen classes are present.
- 15/15 desktop wireframes and 15/15 mobile wireframes are present.
- CAP-001..CAP-048 are mapped 48/48.
- S4-OMIT-001..S4-OMIT-012 are mapped 12/12.
- REC-REM002-001..REC-REM002-028 are reconciled 28/28.
- Learning and strict Exam shells are spatially and semantically distinct.
- Six media modes remain modes, not screens; seven guided steps remain optional states, not a global unlock chain.
- Capture remains separate from evidence and automatic scheduling.
- EvidencePolicy remains the sole default-deny gateway.
- Full Mock, section practice, and targeted practice remain directly reachable on desktop and mobile.
- W3 runtime implementation, final visual styling, technology selection, self-acceptance, merge, and W4 authorization are not performed by this artifact.

Candidate terminal state: W3_WIREFRAME_CANDIDATE_COMPLETE_PENDING_INDEPENDENT_AUDIT.
