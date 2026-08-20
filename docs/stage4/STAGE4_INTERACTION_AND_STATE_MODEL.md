# STAGE 4 INTERACTION ARCHITECTURE & STATE MACHINE SPECIFICATION

**Document Identity**: `STAGE4-INTERACTION-AND-STATE-MODEL-V1`  
**Governing Ratification**: `STAGE4-W2-INTERACTION-STATES-001` (G2 Design Gate Ratified by Human Owner)  
**Controlling Authorization Manifest**: [`docs/authorizations/STAGE4-UXIA-AUTH-001.md`](../authorizations/STAGE4-UXIA-AUTH-001.md)  
**Controlling Strategy**: [`docs/stage4/STAGE4_UXIA_STRATEGY.md`](STAGE4_UXIA_STRATEGY.md)  
**Status**: `CANDIDATE_INTERACTION_ARCHITECTURE / PENDING_INDEPENDENT_AUDIT`  
**Document Role**: Candidate Stage 4 Interaction Architecture & State Machine Specification (subordinate to repository authority hierarchy under [`AGENTS.md`](../../AGENTS.md))

---

## 1. Executive Summary & Epistemic Boundaries

`[FACT]` This specification establishes the formal Interaction Architecture, Orthogonal State-Machine Models, Assistance Taxonomy, Evidence Consequence Contracts, and Cross-Surface Transitions for OmniIELTS under Stage 4 Wave W2.

```
                  ┌──────────────────────────────────────────────────────────┐
                  │                 STAGE 4 WAVE ARCHITECTURE                │
                  ├──────────────────────────────────────────────────────────┤
                  │ W0: Strategy & Capability Preservation Matrix [ACCEPTED] │
                  │ W1: Information Architecture & 15 User Journeys [ACCEPTED│
                  │ W2: Interaction Architecture & State Machines [CURRENT]  │
                  │ W3: Wireframe Blueprints (15 Screens) [DOWNSTREAM]       │
                  │ W4: Visual Design System & Tokens [DOWNSTREAM]           │
                  │ W5: High-Fidelity UI Specifications [DOWNSTREAM]         │
                  │ W6: Prototype & Candidate Exit Compilation [DOWNSTREAM]  │
                  └──────────────────────────────────────────────────────────┘
```

### Core Non-Negotiable Invariants
1. **Learner Agency & Recommendation-vs-Lock Invariant**:
   $$\text{RECOMMENDED\_PATH} \neq \text{REQUIRED\_PATH}$$
   $$\text{CURRICULUM\_PATH} \neq \text{NAVIGATION\_LOCK}$$
   $$\text{GUIDED\_SEQUENCE} \neq \text{MANDATORY\_GLOBAL\_SEQUENCE}$$
   $$\text{RECOMMENDATION} \neq \text{ACCESS\_CONTROL}$$
   $$\text{TODAY\_RECOMMENDATION} \neq \text{FORCED\_SESSION}$$
   $$\text{RECOMMENDED\_VOCAB\_ACTIVITY} \neq \text{REQUIRED\_VOCAB\_ACTIVITY}$$
   $$\text{ACTIVITY\_INTEGRITY\_LOCK} \neq \text{CURRICULUM\_LOCK}$$
   $$\text{SYSTEM\_GUIDES\_STRONGLY} + \text{LEARNER\_RETAINS\_CONTROL}$$
2. **Media Mode Independence**:
   $$\text{MEDIA\_MODE} \neq \text{GUIDED\_LOOP\_STEP}$$
   $$\text{GUIDED\_PEDAGOGICAL\_WORKFLOW} \neq \text{MANDATORY\_MODE\_UNLOCK\_CHAIN}$$
   Direct launch of all 6 supported study modes (Normal, Noticing, Shadowing, Strict Dictation, Practice Dictation, Retell) is guaranteed without prerequisite sequence completion.
3. **Default-Deny Evidence Gateway Integrity**:
   $$\text{UNASSISTED} \implies \text{POTENTIALLY\_EVIDENCE\_ELIGIBLE} \quad (\neq \text{AUTOMATIC\_FSRS\_UPDATE})$$
   $$\text{ASSISTANCE\_USED} \implies \text{SILENT\_UNASSISTED\_SUCCESS} = \text{FALSE}$$
   Positive FSRS memory stability progression occurs strictly when the current default-deny `EvidencePolicy` evaluates all required conditions (supported activity, qualified skill, unassisted trace, verified source/revision, and valid result).
4. **Construct Separation & Technology Neutrality**:
   $$\text{MEMORY\_RETENTION} \neq \text{SKILL\_MASTERY\_ESTIMATE} \neq \text{DIAGNOSTIC\_ERROR\_STATE} \neq \text{IELTS\_PRACTICE\_PERFORMANCE\_ESTIMATE} \neq \text{TRANSFER\_EVIDENCE}$$
   Zero product-facing commitments to internal psychometric formulas ($P(L)$, $\theta$, BKT/IRT/CAT equations) or specific AI/ASR providers.

---

## 2. Orthogonal Interaction-State Model Formalism

Material interaction states in OmniIELTS can coexist across distinct functional dimensions (e.g. drafting an essay while below minimum word count, operating offline, and having viewed a hint). To prevent state explosion and false mutual exclusivity, the interaction state $\mathbf{S}$ is modeled as an orthogonal 5-tuple:

$$\mathbf{S} = \langle S_{\text{primary}}, S_{\text{assist}}, S_{\text{integrity}}, S_{\text{conn}}, S_{\text{recov}} \rangle$$

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ORTHOGONAL INTERACTION-STATE REGIONS                            │
├──────────────────────────┬─────────────────────────────────────────────────────────────┤
│ REGION                   │ REPRESENTATIVE VALUE DOMAIN                                 │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ A. PRIMARY_ACTIVITY      │ Screen/activity-specific workflow states (e.g. IDLE,        │
│    (Mutually Exclusive)  │ PROMPT_READY, ACTIVE_ATTEMPT, SUBMITTED, FEEDBACK_ACTIVE,   │
│                          │ REVIEW_ACTIVE, SESSION_COMPLETE)                            │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ B. ASSISTANCE_STATE      │ UNASSISTED | LIGHT_ASSISTANCE | SCAFFOLDED |                │
│                          │ ANSWER_REVEALED / POST_ATTEMPT_REVIEW                       │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ C. INTEGRITY_STATE       │ UNCONSTRAINED | STRICT_DOM_CONCEALMENT |                   │
│                          │ SINGLE_PLAY_AUDIO_LOCK | TIMED_ASSESSMENT_LOCK             │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ D. CONNECTIVITY_STATE    │ ONLINE_FULL | OFFLINE_LOCAL_READY |                         │
│                          │ CLOUD_FEATURE_UNAVAILABLE | CLOUD_REQUEST_QUEUED |         │
│                          │ LOCAL_FALLBACK_ACTIVE | STORAGE_DEGRADED                    │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ E. RECOVERY_STATE        │ NOMINAL | CHECKPOINT_PERSISTED | DRAFT_JOURNAL_STAGED |      │
│                          │ RECOVERY_AVAILABLE | RECOVERY_ACTIVE                        │
└──────────────────────────┴─────────────────────────────────────────────────────────────┘
```

### 2.1 Formal State Machine Tuple
Each material interaction surface is formally specified by:
$$\mathcal{M} = \langle \mathcal{S}, \mathbf{s}_0, \Sigma_{\text{user}}, \Sigma_{\text{sys}}, \delta, \mathcal{G}, \mathcal{A}_{\text{assist}}, \mathcal{E}_{\text{evidence}}, \mathcal{R}_{\text{recovery}} \rangle$$
- $\mathcal{S} = \mathcal{S}_{\text{primary}} \times \mathcal{S}_{\text{assist}} \times \mathcal{S}_{\text{integrity}} \times \mathcal{S}_{\text{conn}} \times \mathcal{S}_{\text{recov}}$
- $\mathbf{s}_0 \in \mathcal{S}$: Initial compound state.
- $\Sigma_{\text{user}}$: User events (e.g. `Click`, `KeyPress`, `Submit`, `SkipStep`, `ChangeActivity`, `RequestHint`, `ExportAudio`).
- $\Sigma_{\text{sys}}$: System events (e.g. `TimerTick`, `TimerExpired`, `AudioEnded`, `NetworkLost`, `StorageDegraded`, `AutosaveTick`).
- $\delta: \mathcal{S} \times (\Sigma_{\text{user}} \cup \Sigma_{\text{sys}}) \xrightarrow{\mathcal{G}} \mathcal{S}$: Deterministic state transition function guarded by $\mathcal{G}$.
- $\mathcal{G}$: Transition guards (e.g. `[isExamMode === false]`, `[isEvidenceCapable === true]`, `[PAUSE_ALLOWED(activity, mode)]`).
- $\mathcal{A}_{\text{assist}}$: Assistance classification trace associated with the attempt.
- $\mathcal{E}_{\text{evidence}}$: Evidence classification evaluated against `EvidencePolicy`.
- $\mathcal{R}_{\text{recovery}}$: Checkpoint and draft journal persistence hook.

---

## 3. Global Transition Grammar & Progressive Disclosure

To maintain cognitive calm without sacrificing capability, OmniIELTS organizes interaction affordances into a 4-tier functional action hierarchy across all screens:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PROGRESSIVE DISCLOSURE ACTION HIERARCHY                         │
├──────────────────────────┬───────────────────────────┬─────────────────────────────────┤
│ ACTION TIER              │ PURPOSE & SCOPE           │ INTERACTION EXAMPLES            │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 1. PRIMARY ACTION        │ Dominant next step along  │ [START DAILY STUDY]             │
│    (Visually Dominant)   │ recommended/active path   │ [SUBMIT ESSAY] [PLAY PROMPT]    │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 2. SECONDARY ACTIONS     │ Immediate learner agency  │ [SKIP STEP] [CHANGE ACTIVITY]   │
│    (Discoverable)        │ alternatives and tools    │ [REQUEST HINT] [SCRATCHPAD]     │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 3. ADVANCED ACTIONS      │ Specialized diagnostic and│ [EXPORT AUDIO]                  │
│    (Progressive Drawer)  │ configuration utilities   │ [EDIT CUES] [PROVENANCE AUDIT]  │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 4. RECOVERY ACTIONS      │ Emergency and resilience  │ [RESUME CHECKPOINT]             │
│    (Contextual Banner)   │ recovery affordances      │ [RESTORE DRAFT] [COPY LOGS]     │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────┘
```

---

## 4. Learner Agency & Three Levels of Constraint

OmniIELTS enforces a strict 3-tier hierarchy of navigation and activity constraints:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THREE LEVELS OF INTERACTION CONSTRAINT                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 1: GLOBAL NAVIGATION (Default: 100% Learner-Controlled)                         │
│ • Direct access to all 5 pillars: Today, Learn, IELTS, Library, Analytics             │
│ • Zero prerequisite gates: Learn ↔ Practice ↔ Full Mock ↔ Curriculum ↔ Media ↔ Vocab   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: GUIDED SESSION (Pedagogical Flow with Mandatory Agency Exits)                 │
│ • System recommends optimal sequence (e.g. 7-Step Media Loop, Daily Plan)             │
│ • Mandatory unblocked controls at every step: [CONTINUE] [SKIP] [CHANGE ACTIVITY] [EXIT]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: ACTIVITY-INTEGRITY LOCK (Temporary, Local Assessment Bounds)                 │
│ • Enforced ONLY inside selected activity to preserve measurement validity:            │
│   - Strict Dictation: Answer concealed in DOM/ARIA before submit                      │
│   - IELTS Listening Exam: Audio pause/scrub disabled during test playback              │
│   - Speaking Part 2: 60s prep countdown + 120s response timer                         │
│ • Invariant: ACTIVITY_INTEGRITY_LOCK != CURRICULUM_LOCK / Terminates on submit or exit│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Recommendation Presentation Contract
Recommendations use clear, technology-neutral semantic indicators:
- `"Recommended next: Lexical Collocations Masterclass"`
- `"Suggested preparation before Full Mock: Section 2 Practice"`
- `"Best next step: Error Notebook Remediation"`

Every recommendation presentation MUST concurrently provide immediate, unblocked action triggers:
- `[START_RECOMMENDED]` (Follows guidance)
- `[CHOOSE_ANOTHER_ACTIVITY]` (Opens workspace directory)
- `[CONTINUE_ANYWAY]` / `[START_PRACTICE]` / `[START_MOCK]` (Direct autonomous entry)

---

## 5. Assistance Taxonomy & Disclosure Contract

OmniIELTS defines a 4-tier assistance taxonomy that eliminates ambiguity between assisted learning and authentic unassisted measurement:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FORMAL ASSISTANCE TAXONOMY                                │
├──────────────────────────┬───────────────────────────┬─────────────────────────────────┤
│ LEVEL                    │ ALLOWED AFFORDANCES       │ EVIDENCE & FSRS CONSEQUENCE     │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 1. UNASSISTED            │ Pure memory recall;       │ • Potentially Evidence-Eligible │
│                          │ zero hints, zero script   │ • Unassisted diagnostic score   │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 2. LIGHT_ASSISTANCE      │ First-letter cue;         │ • Evidence-Suppressed           │
│                          │ 0.75x slow audio replay;  │   (FSRS Stability update        │
│                          │ collocation hint          │    suppressed)                  │
│                          │                           │ • Eligible for Error Notebook   │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 3. SCAFFOLDED            │ 4-tier refutational card; │ • Zero FSRS Stability update    │
│                          │ step-by-step guidance;    │ • Formative coaching record     │
│                          │ worked example display    │ • Retry recommended             │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 4. ANSWER_REVEALED /     │ Full ground truth reveal; │ • Zero positive evidence        │
│    POST_ATTEMPT_REVIEW   │ transcript synchronized;  │ • Item available for retry      │
│                          │ model essay / audio script│ • Formative review only         │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────┘
```

### 5.1 Assistance Invariants
1. **No Silent Upgrades**: $\text{ASSISTANCE\_USED} \implies \text{SILENT\_UNASSISTED\_SUCCESS} = \text{FALSE}$.
2. **Transparent Disclosure**: The UI displays a persistent, calm `Assisted Practice` badge whenever Level 2, 3, or 4 assistance is utilized.
3. **Trace Preservation**: An attempt record retains its historical assistance trace.
4. **Non-Prescriptive Retry Affordances**:
   - `RETRY_AVAILABLE`: Learner may voluntarily restart an attempt from the prompt state.
   - `RETRY_RECOMMENDED`: System surfaces an optional retry trigger following assisted or incorrect responses.
   - $\text{RETRY\_RECOMMENDATION} \neq \text{RETRY\_REQUIREMENT}$: The learner is never locked into a mandatory retry loop.

---

## 6. Activity Evidence-Class Contract & EvidencePolicy Consequence Model

Evidence eligibility is governed by a **Two-Axis Model**: Assistance Exposure $\times$ Activity Evidence Class.

```
┌──────────────────────────┬─────────────────────────────────────────────────────────────┐
│ AXIS B: ACTIVITY CLASS   │ AXIS A: ASSISTANCE EXPOSURE LEVEL                           │
│                          ├──────────────────────────┬──────────────────────────────────┤
│                          │ UNASSISTED               │ ASSISTED (LIGHT / SCAFFOLD / REV)│
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 1. EVIDENCE_CAPABLE      │ POTENTIALLY_EVIDENCE_    │ EVIDENCE_SUPPRESSED              │
│    (e.g. Vocab Cued      │ ELIGIBLE (Routes to      │ (FSRS Stability update           │
│    Recall, qualified     │ EvidencePolicy for final │ suppressed; marked as assisted   │
│    Retell with verified  │ verification)            │ formative attempt)               │
│    evaluation)           │                          │                                  │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 2. COACHING_ONLY         │ COACHING_RECORD_ONLY     │ COACHING_RECORD_ONLY             │
│    (e.g. Shadowing,      │ (Zero FSRS schedule      │ (Zero FSRS schedule mutation;    │
│    Pronunciation, Oral   │ mutation; formative      │ formative acoustic / prosodic    │
│    Noticing, Reading)    │ feedback only)           │ feedback only)                   │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 3. DIAGNOSTIC_ONLY       │ DIAGNOSTIC_ESTIMATE_ONLY │ DIAGNOSTIC_ESTIMATE_ONLY         │
│    (e.g. IELTS Listening │ (affectsSchedule: false, │ (affectsSchedule: false,         │
│    Reading, Writing,     │ evidenceEligible: false; │ evidenceEligible: false;         │
│    Speaking, Full Mock)  │ emits diagnostic score)  │ emits diagnostic score)          │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 4. NO_EVIDENCE           │ NO_MUTATION              │ NO_MUTATION                      │
│    (e.g. Free Reading,   │ (Zero schedule or metric │ (Zero schedule or metric         │
│    Exploration)          │ emission)                │ emission)                        │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

### 6.1 Derivation & Activity Specifications
$$\text{ACTIVITY\_EVIDENCE\_CLASS} = \text{CURRENT\_ACTIVITY\_SPECIFICATION} + \text{CURRENT\_EVIDENCE\_POLICY}$$

1. **Shadowing & Pronunciation**:
   $$\text{UNASSISTED\_SHADOWING} \implies \text{COACHING\_RECORD\_ONLY} \quad (\text{ZERO\_POSITIVE\_FSRS\_MUTATION})$$
   $$\text{UNASSISTED\_PRONUNCIATION} \implies \text{COACHING\_RECORD\_ONLY} \quad (\text{ZERO\_POSITIVE\_FSRS\_MUTATION})$$
2. **Retell Activity**:
   $$\text{RETELL\_UI\_LABEL} \neq \text{FIXED\_EVIDENCE\_CLASS}$$
   - If governed by a coaching-only activity spec $\to$ `COACHING_RECORD_ONLY`.
   - If governed by a current qualified evidence-capable `retell` activity spec $\to$ `POTENTIALLY_EVIDENCE_ELIGIBLE`, but subject strictly to `EvidencePolicy` verification (production target binding, authoritative complete assistance trace, zero exposed assistance, verified source/revision, learner output present, verified evaluation bound to exact attempt/activity/target/output, target demonstrated, and valid result).
   - Invariants:
     $$\text{UNASSISTED\_RETELL} \neq \text{AUTOMATIC\_FSRS\_UPDATE}$$
     $$\text{RETELL} \neq \text{ALWAYS\_COACHING\_ONLY}$$
3. **Novel Transfer Check** (`[CURRENT]`):
   $$\text{TRANSFER\_ACTIVITY} \implies \text{DIRECT\_FSRS\_MUTATION} = \text{NO}$$
   The learner-visible Transfer exercise is active in runtime (`kind: transfer`, `affectsSchedule: false`); calibrated transfer evidence models remain distinct future research.
   $$\text{CURRENT\_TRANSFER\_EXERCISE} \neq \text{FUTURE\_CALIBRATED\_TRANSFER\_MODEL}$$
4. **IELTS Mock & Section Practice**:
   $$\text{IELTS\_MOCK\_OR\_PRACTICE} \implies \text{affectsSchedule: false} \land \text{evidenceEligible: false}$$

---

## 7. Activity-Integrity Lock Contract

Activity-Integrity Locks are temporary, strictly local constraints enforced inside a chosen activity to preserve measurement validity:

$$\text{ACTIVITY\_INTEGRITY\_LOCK} \neq \text{CURRICULUM\_LOCK}$$

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ACTIVITY-INTEGRITY LOCK SPECIFICATIONS                          │
├──────────────────────────┬───────────────────────────┬─────────────────────────────────┤
│ ACTIVITY & MODE          │ LOCAL INTEGRITY LOCK      │ TERMINATION CONDITION           │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Media Strict Dictation   │ Target text completely    │ Submission or explicit exit to  │
│                          │ concealed in DOM and ARIA │ Mode Selector                   │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ IELTS Listening Exam     │ Single-play audio; pause  │ Completion of Part 4 audio or   │
│                          │ and scrubbing disabled    │ test submission                 │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ IELTS Speaking Part 2    │ 60s prep countdown ring;  │ Expiry of 120s response timer or│
│                          │ 120s response timer; 1:45 │ manual turn completion          │
│                          │ audible / visual alert    │                                 │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ IELTS Exam Simulation    │ OmniIELTS app chrome      │ Test submission or explicit exit│
│ (All Skills & Full Mock) │ unmounted; zero hints     │ to IELTS Hub                    │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────┘
```

---

## 8. Recovery, Connectivity & Degraded-State Grammar

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CONNECTIVITY & DEGRADED-STATE GRAMMAR                           │
├──────────────────────────┬─────────────────────────────────────────────────────────────┤
│ STATE NAME               │ INTERACTION SEMANTICS & STATUS                              │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ ONLINE_FULL              │ [CURRENT] All local features and opt-in cloud AI available. │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ OFFLINE_LOCAL_READY      │ [CURRENT] Core drills, practice, and exams fully operational│
│                          │ without network connectivity.                               │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ CLOUD_FEATURE_UNAVAILABLE│ [CURRENT] Calm, non-blocking status badge indicating cloud  │
│                          │ AI evaluation is temporarily paused.                        │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ CLOUD_REQUEST_QUEUED     │ [CURRENT] Formative AI review request queued locally for    │
│                          │ asynchronous processing upon reconnection.                  │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ LOCAL_FALLBACK_ACTIVE    │ [CURRENT] Local heuristic evaluation active in place of     │
│                          │ external cloud service.                                     │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ STORAGE_DEGRADED         │ [CURRENT] IndexedDB unavailable; top notice banner informs  │
│                          │ learner of session-only localStorage mode (`CAP-041`).      │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ RECOVERY_AVAILABLE       │ [CURRENT] Unfinished exam checkpoint or unsaved draft       │
│                          │ detected; 1-click restore banner presented.                 │
└──────────────────────────┴─────────────────────────────────────────────────────────────┘
```

### 8.1 Recovery Hooks
1. **Exam Checkpoint Recovery** (`ieltsMockRuns`, `ieltsTestRuns`): On browser reload, automatically restores active section, item index, recorded responses, and remaining seconds (`CAP-033`).
2. **Draft Journal Recovery** (`DRAFT_JOURNAL_PREFIX`): Unsubmitted Retell drafts and Writing Task outlines restore from local storage on session mount (`CAP-008`).
3. **Database Restore Recovery**: Interrupted backup restores auto-heal via boot write-ahead recovery journal (`CAP-043`).

---

## 9. Comprehensive State Machines for Screens 1–15

```text
CANONICAL REPRESENTATIVE SCREEN SET:
├── Screen 1: Today / Home Dashboard
├── Screen 2: Vocabulary Spaced Review & Practice Canvas
├── Screen 3: Video & Media Study Workspace
├── Screen 4: Article & Passage Reader Workspace
├── Screen 5: Unified Capture Inbox Workspace
├── Screen 6: Error Notebook & Weakness Map Workspace
├── Screen 7: Multi-Dimensional Analytics Dashboard
├── Screen 8: IELTS Listening Runner (Exam vs Practice)
├── Screen 9: IELTS Reading Academic Split Shell
├── Screen 10: IELTS Reading General Training Split Shell
├── Screen 11: IELTS Writing Task 1 Lab (Academic Visual & GT Letter)
├── Screen 12: IELTS Writing Task 2 Essay Workspace
├── Screen 13: IELTS Speaking Center (Guided Practice & Interactive Examiner)
├── Screen 14: IELTS Full Mock Exam Shell
└── Screen 15: Settings, Privacy, AI Consent & Data Safety Dashboard
```

---

### Screen 1: Today / Home Command Center

```
                      ┌───────────────────────────┐
                      │      S1: TODAY_IDLE       │◄───────────────────────────┐
                      └─────────────┬─────────────┘                            │
                                    │ [hasDueCards]                            │
                                    ▼                                          │
                      ┌───────────────────────────┐                            │
                      │   RECOMMENDATION_READY    │                            │
                      └──────┬─────────────┬──────┘                            │
        [dueCount > 50]      │             │ [dueCount <= 50]                  │
        ┌────────────────────┘             └────────────────────┐              │
        ▼                                                       ▼              │
┌───────────────────────────┐                         ┌──────────────────────┐ │
│      BACKLOG_TRIAGE       │                         │   SESSION_PREVIEW    │ │
└──────┬─────────────┬──────┘                         └──────────┬───────────┘ │
       │             │                                           │             │
       │ [Quick]     │ [Full Queue]                              │ [Start]     │
       └──────┬──────┴───────────────────────────┬───────────────┘             │
              ▼                                  ▼                             │
┌───────────────────────────┐          ┌───────────────────┐                   │
│   ACTIVE_RUNNER (S2)      │          │ CHOOSE_ALTERNATIVE│───────────────────┤
└─────────────┬─────────────┘          └───────────────────┘                   │
              │ [sessionCompleted]                                             │
              ▼                                                                │
┌───────────────────────────┐                                                  │
│      SESSION_SUMMARY      │──────────────────────────────────────────────────┘
└───────────────────────────┘
```

- **State Model**:
  - `IDLE` `[CURRENT]`: Initial dashboard state; summary stats loaded.
  - `RECOMMENDATION_READY` `[CURRENT]`: Primary recommendation computed.
  - `SESSION_PREVIEW` `[CURRENT]`: Due count, new count, and estimated time displayed.
  - `BACKLOG_TRIAGE` `[STAGE4_TARGET]`: Surfaces choice between `"Quick Catch-up Drill"` and `"Full Due Queue"`.
  - `ACTIVE_RUNNER` `[CURRENT]`: Handoff to Screen 2 under single-lease lock (`CAP-001`).
  - `CHOOSE_ALTERNATIVE` `[CURRENT]`: Autonomous navigation to other pillars.
  - `SESSION_SUMMARY` `[CURRENT]`: Daily target achieved; streak updated.
  - `GRACE_FREEZE_INDICATOR` `[FUTURE_UX_RESERVED]`: Visual badge indicating 1-day habit freeze protection.
  - `EMPTY` `[CURRENT]`: Zero due cards; exploratory drills suggested.
- **Guards**: `[singleLeaseAcquired === true]`, `[PAUSE_ALLOWED = true]`.
- **Evidence Consequence**: Screen coordinates session launch; individual card reviews emit evidence.

---

### Screen 2: Vocabulary Spaced Review & Practice Canvas

```
                      ┌───────────────────────────┐
                      │         S2: ENTRY         │
                      └─────────────┬─────────────┘
                                    ▼
                      ┌───────────────────────────┐
                      │    RECOMMENDED_ACTIVITY   │◄───────────────────────────┐
                      └──────┬─────────────┬──────┘                            │
   [User Overrides Modality] │             │ [Accepts Modality]                │
                             ▼             ▼                                   │
                      ┌───────────────────────────┐                            │
                      │    USER_SELECT_ACTIVITY   │                            │
                      └─────────────┬─────────────┘                            │
                                    ▼                                          │
                      ┌───────────────────────────┐                            │
                      │       PROMPT_ACTIVE       │◄─────────────────────┐     │
                      └──────┬─────────────┬──────┘                      │     │
       [User Requests Hint]  │             │ [Submits Attempt]           │     │
                             ▼             ▼                             │     │
        ┌────────────────────────┐   ┌───────────────────────────┐       │     │
        │  ASSISTANCE_REQUESTED  │   │        SUBMITTED          │       │     │
        └────────────┬───────────┘   └─────────────┬─────────────┘       │     │
                     │                             ▼                     │     │
                     │               ┌───────────────────────────┐       │     │
                     └──────────────►│         VERIFYING         │       │     │
                                     └─────────────┬─────────────┘       │     │
                                                   ▼                     │     │
                                     ┌───────────────────────────┐       │     │
                                     │      FEEDBACK_ACTIVE      │       │     │
                                     └──────┬──────┬──────┬──────┘       │     │
                                            │      │      │              │     │
                    ┌───────────────────────┘      │      └────────┐     │     │
                    │ [Retry]                      │ [Next]        │     │     │
                    ▼                              │               │     │     │
        ┌────────────────────────┐                 ▼               │     │     │
        │      RETRY_READY       │─────────────────┼───────────────┘     │     │
        └────────────────────────┘                 │                     │     │
                                                   │ [Queue Empty]       │     │
                                                   ▼                     │     │
                                     ┌───────────────────────────┐       │     │
                                     │      SESSION_SUMMARY      │       │     │
                                     └─────────────┬─────────────┘       │     │
                                                   │ [Exit]              │     │
                                                   ▼                     │     │
                                     ┌───────────────────────────┐       │     │
                                     │           EXIT            │       │     │
                                     └───────────────────────────┘       │     │
                                                                         │     │
                         [Learner Switched Modality Mid-Session]         │     │
                         └───────────────────────────────────────────────┘     │
```

- **Supported Modalities**:
  - `Cued Recall Flip` (`[CURRENT]`)
  - `Meaning Discrimination Choice` (`[CURRENT]`)
  - `Typing & Spelling Recall` (`[CURRENT]`, Levenshtein evaluation)
  - `Sentence & Collocation Cloze` (`[CURRENT]`)
  - `Listening Choice & Dictation` (`[CURRENT]`)
  - `Pronunciation Speech Check` (`[CURRENT]`)
  - `Multi-Word Output Synthesis` (`[CURRENT]`)
  - `Novel Transfer Check` (`[CURRENT]`, `affectsSchedule: false`)
- **State Model**:
  - `ENTRY` `[CURRENT]`, `RECOMMENDED_ACTIVITY` `[CURRENT]`, `USER_SELECT_ACTIVITY` `[CURRENT]`.
  - `PROMPT_ACTIVE` `[CURRENT]`: Item rendered in target modality.
  - `ASSISTANCE_REQUESTED` `[CURRENT]`: Hint, audio replay, or prompt reveal exposed.
  - `SUBMITTED` `[CURRENT]`, `VERIFYING` `[CURRENT]`.
  - `FEEDBACK_ACTIVE` `[CURRENT]`: Immediate evaluation. `[STAGE4_TARGET / PARTIALLY_SUPPORTED]` 4-tier refutational explanation card.
  - `RETRY_READY` `[CURRENT]`: Item reset for immediate voluntary retry (`RETRY_RECOMMENDATION != RETRY_REQUIREMENT`).
  - `SESSION_SUMMARY` `[CURRENT]`, `EXIT` `[CURRENT]`.
- **Integrity & Evidence**: Unassisted reviews on evidence-capable items update FSRS parameters. Assisted reviews suppress stability progression (`CAP-016`).

---

### Screen 3: Video & Media Study Workspace

```
                      ┌───────────────────────────┐
                      │       S3: MEDIA_IDLE      │
                      └─────────────┬─────────────┘
                                    │ [loadMedia]
                                    ▼
                      ┌───────────────────────────┐
                      │       MEDIA_LOADED        │
                      └──────┬─────────────┬──────┘
       [Direct Mode Selection]│             │ [Launch Guided Workflow]
              ┌───────────────┘             └───────────────┐
              ▼                                             ▼
┌───────────────────────────┐                 ┌───────────────────────────┐
│     DIRECT_MODE_ACTIVE    │                 │   GUIDED_7STEP_ACTIVE     │
│ (Normal/Notice/Shadow/    │                 │ (Step 1 -> Step 2 -> ...  │
│  Dictate/Practice/Retell) │                 │  -> Step 7)               │
└─────────────┬─────────────┘                 └─────────────┬─────────────┘
              │                                             │
              │ ◄───────────────────► ◄────────────────────►│
              │  [Direct Mode Switch / Change Activity]     │
              ▼                                             ▼
┌───────────────────────────┐                 ┌───────────────────────────┐
│    CORRECTION_DIFF_VIEW   │                 │     RETELL_DRAFT_VIEW     │
│ (Word Diff, 6-Reason Class│                 │ (Autosaved Draft Journal) │
└───────────────────────────┘                 └───────────────────────────┘
```

- **6 Independent Study Modes** (`[CURRENT]`):
  1. `Normal Playback` (Video + synchronized virtualized transcript)
  2. `Noticing` (IPA, weak forms, thought group chunking)
  3. `Shadowing` (Direct vocal repetition; `COACHING_ONLY`)
  4. `Strict Dictation` (Audio only; DOM/ARIA concealed; `KEY_LEAK = 0`)
  5. `Practice Dictation` (Masked hints + first-letter cues)
  6. `Retell & Synthesis` (Spontaneous summary drafting)
- **Guided 7-Step Sequence** (`[CURRENT]`):
  - `Step 1 (Listen)` $\to$ `Step 2 (Dictate)` $\to$ `Step 3 (Verify & Classify)` $\to$ `Step 4 (Notice)` $\to$ `Step 5 (Shadow)` $\to$ `Step 6 (Vocab)` $\to$ `Step 7 (Retell)`.
  - **Step 3 Mistake Classification**: 6 root causes (`not-heard`, `misheard`, `missing-word`, `spelling-only`, `word-form`, `transcript-source`). `spelling-only` errors do not penalize Listening FSRS stability.
  - **Step Controls**: `[CONTINUE]`, `[SKIP_STEP]`, `[CHANGE_ACTIVITY]`, `[EXIT]`.
  - Invariant: $\text{SKIP\_STEP} \neq \text{FAIL\_ACTIVITY} \land \text{SKIP\_STEP} \implies \text{LOCK\_FUTURE\_ACCESS} = \text{FALSE}$.
- **Future UX Reservations**:
  - `OVERLAPPING_LANES` `[FUTURE_UX_RESERVED]` (Multi-speaker concurrent lanes; `FUT-003`).
  - `TOPIC_BAR` `[FUTURE_UX_RESERVED]` (Semantic chapter navigation; `FUT-004`).
- **Guards**: `PAUSE_ALLOWED(media_workspace, mode) = true`.

---

### Screen 4: Article & Passage Reader Workspace

- **States**:
  - `IDLE` `[CURRENT]`: Library source selector.
  - `SOURCE_LOADED` `[CURRENT_REHOMED]`: Text parsed into clean paragraphs with anchors (`CAP-011`).
  - `READING_ACTIVE` `[CURRENT]`: Paragraph highlighter active; untimed reading.
  - `TERM_SELECTED` `[CURRENT]`: Word/phrase clicked; lexical popover mounted.
  - `CAPTURE_STAGED` `[CURRENT]`: Term, context sentence, and source reference staged in Inbox (`CAP-012`).
  - `STRUCTURED_PARSER` `[FUTURE_UX_RESERVED]`: Multi-format PDF/EPUB dropzone (`FUT-011`).
  - `READABILITY_RATING` `[FUTURE_UX_RESERVED]`: CEFR readability pill (A1–C2) (`FUT-006`).
  - `AUTO_CLOZE` `[FUTURE_UX_RESERVED]`: Automated contextual retrieval checks (`FUT-008`).
- **Agency**: Learner may read freely, capture terms, or launch vocabulary drills without forced steps.

---

### Screen 5: Unified Capture Inbox Workspace

- **States**:
  - `IDLE` `[CURRENT]`: Empty inbox or table loading.
  - `ITEMS_LOADED` `[CURRENT]`: Staged items displayed with context snippets and source tags.
  - `INLINE_EDITING` `[CURRENT]`: In-place definition, collocation, and active/passive goal editing.
  - `BATCH_SELECTED` `[CURRENT]`: Items selected for bulk operations.
  - `CONFIRMING` `[CURRENT]`: Items imported into active FSRS deck (`CAP-012`).
  - `DISCARDED_TOAST` `[CURRENT]`: Deletions protected by 5-second non-blocking Undo toast (`CAP-046`).
- **Evidence**: Captured items graduate into `coreCards` store with cold-start FSRS parameters.

---

### Screen 6: Error Notebook & Weakness Map Workspace

- **States**:
  - `IDLE` `[CURRENT]`: Heatmap matrix and status tabs loaded.
  - `HEATMAP_VIEW` `[CURRENT]`: 23-category diagnostic heatmap (ERRANT-aligned) with decay weighting (`CAP-014`).
  - `CATEGORY_FILTERED` `[CURRENT]`: Filtered by skill or lifecycle status (`open`, `practicing`, `monitoring`, `resolved`, `ignored`).
  - `CARD_DETAIL` `[CURRENT]`: Original prompt, learner mistake, and correction.
  - `REMEDIATION_ACTIVE` `[CURRENT]`: Repair drill launched.
  - `REFUTATIONAL_EXPLANATION` `[FUTURE_UX_RESERVED]`: Automated root-cause grammar rule card (`FUT-017`).
  - `DYNAMIC_ISOMORPHIC_DRILL` `[FUTURE_UX_RESERVED]`: Generated isomorphic practice items (`FUT-008`).
  - `RESOLVED` `[CURRENT]`: Status transitions on successful remediation.
- **Evidence**: Remediation drills provide formative mastery (`affectsSchedule: false`).

---

### Screen 7: Multi-Dimensional Analytics Dashboard

- **States**:
  - `IDLE` `[CURRENT]`, `RETENTION_VIEW` `[CURRENT]` (FSRS decay curve with target $R$; `CAP-013`).
  - `PACING_CALCULATOR` `[CURRENT]`: Daily review target slider for target test date (`S4-OMIT-008`).
  - `HABIT_GRID` `[CURRENT]`: 52-week activity heatmap.
  - `SKILL_RADAR_CONFIDENCE` `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]`: 5-skill competence radar with confidence margins (`FUT-014`).
  - `PROVENANCE_DRAWER` `[FUTURE_UX_RESERVED]`: Audit drawer displaying 9 contextual provenance fields (`FUT-016`).
  - `ACTION_LAUNCH` `[CURRENT]`: 1-click launcher for recommended remediation action.
- **Construct Separation**: Memory Retention $\neq$ Skill Mastery Estimate $\neq$ Diagnostic Error State $\neq$ IELTS Performance Estimate $\neq$ Transfer Evidence.

---

### Screen 8: IELTS Listening Runner (Exam vs Practice)

```
                    ┌───────────────────────────┐
                    │      S8: TRACK_SELECT     │
                    └─────────────┬─────────────┘
                                  ▼
                    ┌───────────────────────────┐
                    │      MODE_SELECTION       │
                    └──────┬─────────────┬──────┘
       [Exam Simulation]   │             │ [Section Practice]
              ┌────────────┘             └────────────┐
              ▼                                       ▼
┌───────────────────────────┐           ┌───────────────────────────┐
│     EXAM_PLAYING          │           │     PRACTICE_ACTIVE       │
│ • Single-play audio ONLY  │           │ • Scrubbing / rewind ON   │
│ • Pause/scrub LOCKED      │           │ • Transcript reveal ON    │
│ • Question palette grid   │           │ • Instant per-item check  │
└─────────────┬─────────────┘           └─────────────┬─────────────┘
              │ [Audio finishes]                      │
              ▼                                       │
┌───────────────────────────┐                         │
│     2M_CHECK_TIMER        │                         │
│ • 2-min checking countdown│                         │
└─────────────┬─────────────┘                         │
              │ [Submit / Expire]                     │ [Submit]
              ▼                                       ▼
┌───────────────────────────┐           ┌───────────────────────────┐
│      EXAM_SCORECARD       │           │     PRACTICE_FEEDBACK     │
│ (Raw score -> Band Est.)  │           │ (Formative explanations)  │
└───────────────────────────┘           └───────────────────────────┘
```

- **States & Guards**:
  - `Exam Mode`: `PAUSE_ALLOWED(listening, exam) = false`; single-play audio integrity lock; 2-minute checking countdown; deferred scoring.
  - `Practice Mode`: `PAUSE_ALLOWED(listening, practice) = true`; scrub and 5s rewind enabled; post-attempt transcript reveal.
  - `Recovery`: `IELTS_LISTENING_CHECKPOINT_V1` restores exact item, audio offset, and responses on reload.
  - `Evidence`: `affectsSchedule: false`, `evidenceEligible: false`.

---

### Screen 9: IELTS Reading Academic Split Shell

- **States**:
  - `READY` `[CURRENT]`: Passage overview and test instructions.
  - `TEST_ACTIVE` `[CURRENT]`: 3 academic passages, 40 questions, 60-minute hard shared countdown timer.
  - `SPLIT_RESIZING` `[CURRENT]`: Draggable split divider adjusting passage/question pane proportions.
  - `HIGHLIGHTING` `[CURRENT]`: In-text highlighter toolbar marking passage evidence.
  - `WARNING_10M` `[CURRENT]`, `WARNING_5M` `[CURRENT]`: Visual time warnings.
  - `SUBMITTED` `[CURRENT]`, `REVIEW` `[CURRENT]`: Raw score to Academic Band curve conversion.
- **Integrity**: Answer keys concealed in DOM/ARIA (`KEY_LEAK = 0`). Auto-submit on 60m expiry. `affectsSchedule: false`.

---

### Screen 10: IELTS Reading General Training Split Shell

- **States**:
  - `READY` `[CURRENT]`, `TEST_ACTIVE` `[CURRENT]`, `SECTION_1_TABS` `[CURRENT]` (Multi-text tabs for everyday notices), `SECTION_2_TABS` `[CURRENT]` (Workplace documents), `SECTION_3` `[CURRENT]` (General interest article), `SUBMITTED` `[CURRENT]`, `REVIEW` `[CURRENT]`.
- **Integrity**: Calibrated GT raw-to-band conversion curve. `affectsSchedule: false`.

---

### Screen 11: IELTS Writing Task 1 Lab (Academic & GT)

- **States**:
  - `PROMPT_READY` `[CURRENT]`: Layout initialized by track (Academic Chart vs GT Letter).
  - `DRAFTING` `[CURRENT]`: Distraction-free text editor; continuous live word counter.
  - `TABLE_FALLBACK` `[CURRENT]`: Semantic HTML table view mirroring chart data for accessibility.
  - `DETERMINISTIC_CHART_VIEW` `[STAGE4_TARGET]`: Local SVG/Canvas chart container supporting 7 visual families (`FUT-009`).
  - `UNDER_150W_WARN` `[CURRENT]`: Visual under-length warning if $< 150$ words.
  - `SUBMITTED` `[CURRENT]`, `RUBRIC_EVAL` `[CURRENT]`: Formative 4-criterion feedback (TA, CC, LR, GRA).
- **Integrity & Recovery**: Autosave creates immutable revision digests. `affectsSchedule: false`.

---

### Screen 12: IELTS Writing Task 2 Essay Workspace

- **States**:
  - `PROMPT_READY` `[CURRENT]`: Discursive essay prompt.
  - `OUTLINE_ACTIVE` `[CURRENT]`: Planning scratchpad for thesis and arguments.
  - `DRAFTING` `[CURRENT]`: Live word counter; spellcheck/grammar underlines disabled in Exam Mode.
  - `UNDER_250W_WARN` `[CURRENT]`: Under-length warning if $< 250$ words.
  - `SUBMITTED` `[CURRENT]`, `RUBRIC_EVAL` `[CURRENT]`: 4-criterion practice critique (TR, CC, LR, GRA).
- **Integrity**: Combined 60m shared timer when taken as Full Writing Test. `affectsSchedule: false`.

---

### Screen 13: IELTS Speaking Center (Guided Practice & Interactive Examiner)

```
                    ┌───────────────────────────┐
                    │     S13: MODE_SELECT      │
                    └──────┬─────────────┬──────┘
       [Guided 3-Part]     │             │ [Interactive Examiner]
              ┌────────────┘             └────────────┐
              ▼                                       ▼
┌───────────────────────────┐           ┌───────────────────────────┐
│   GUIDED_PART1_ACTIVE     │           │    EXAMINER_CONNECTING    │ [OWNER_
│ • Audio prompt + record   │           │ • Mic & silence init      │  RECONFIRMED_
└─────────────┬─────────────┘           └─────────────┬─────────────┘  FUTURE]
              ▼                                       ▼
┌───────────────────────────┐           ┌───────────────────────────┐
│   GUIDED_PART2_PREP (60s) │           │       EXAMINER_TURN       │
│ • 60s prep countdown ring │           │ • Streamed prompt audio   │
│ • Scratchpad notes editor │           └─────────────┬─────────────┘
└─────────────┬─────────────┘                         ▼
              ▼                         ┌───────────────────────────┐
┌───────────────────────────┐           │       LEARNER_TURN        │
│  GUIDED_PART2_SPEAK (120s)│           │ • Speech visualizer       │
│ • 1:45 warning alert      │           └──────┬─────────────┬──────┘
└─────────────┬─────────────┘     [Silence >5s]│             │ [Turn complete]
              ▼                                ▼             ▼
┌───────────────────────────┐           ┌──────────────┐ ┌──────────────┐
│   GUIDED_PART3_ACTIVE     │           │ SILENCE_RECOV│ │  FOLLOW_UP   │
└─────────────┬─────────────┘           └──────────────┘ └──────┬───────┘
              │                                                 │
              ▼                                                 ▼
┌───────────────────────────┐           ┌───────────────────────────┐
│   AUDIO_REVIEW_AVAILABLE  │           │      SESSION_REVIEW       │
│ (Per-segment replay/export│           │ (Rubric evaluation)       │
└─────────────┬─────────────┘           └───────────────────────────┘
              ▼
┌───────────────────────────┐
│    DIAGNOSTIC_FEEDBACK    │
│ (FC, LR, GRA, PR cards)   │
└───────────────────────────┘
```

- **Mode A: Guided 3-Part Practice** (`[CURRENT]`):
  - `Part 1 (Interview)`: 4–6 topic questions with recording turns.
  - `Part 2 (Long Turn)`: Cue card, 60s preparation countdown timer (`PREP_SECONDS = 60`), persistent notes scratchpad, 120s response timer (`SPEAKING_SECONDS = 120`) with 1:45 alert, and rounding questions.
  - `Part 3 (Discussion)`: 4–6 analytical discourse prompts.
  - `Audio Review`: Replay recorded segment per question; export audio.
- **Mode B: Interactive Speaking Examiner** (`[OWNER_RECONFIRMED_FUTURE]`):
  - Technology-neutral states: `connecting`, `examiner_turn`, `learner_turn`, `silence_recovery`, `follow_up`, `session_review`.
  - Formative disclaimer: `"AI Examiner Simulation is a formative practice tool and is not an official IELTS certification."`
- **Evidence**: `affectsSchedule: false`, `evidenceEligible: false`.

---

### Screen 14: IELTS Full Mock Exam Shell

- **States**:
  - `PRECHECK` `[CURRENT]`: Equipment and microphone validation.
  - `L_SECTION` `[CURRENT]`: Listening test (~30–34m + 2m check; single-play).
  - `TRANSITION_LR` `[CURRENT]`: Reading instructions screen.
  - `R_SECTION` `[CURRENT]`: Reading test (60m split-pane).
  - `TRANSITION_RW` `[CURRENT]`: Writing instructions screen.
  - `W_SECTION` `[CURRENT]`: Writing test (60m combined Task 1 + Task 2).
  - `S_SECTION` `[CURRENT]`: Speaking simulation component.
  - `FINAL_SCORECARD` `[CURRENT]`: Multi-skill composite band scorecard (0.0–9.0 with official half-band rounding rules).
  - `REMEDIATION_HANDOFF` `[CURRENT]`: 1-click error export to Today Command Center.
- **Integrity**: Fullscreen simulation mode; OmniIELTS application chrome completely unmounted. `affectsSchedule: false`.

---

### Screen 15: Settings, Privacy, AI Consent & Data Safety Dashboard

- **States**:
  - `IDLE` `[CURRENT]`: Settings overview.
  - `PREFERENCES_EDIT` `[CURRENT]`: Target retention ($R$), daily limits, TTS voices (`CAP-015`).
  - `AI_CONSENT_MODAL` `[CURRENT]`: Plain-language privacy opt-in with 1-click revocation (`CAP-039`).
  - `KEY_INPUT` `[CURRENT]`: Ephemeral API key entry confined to `sessionStorage` (`CAP-044`).
  - `BACKUP_EXPORT` `[CURRENT]`: 1-click full JSON export covering 100% of 59 IDB stores (`CAP-042`).
  - `RESTORE_VALIDATE` `[CURRENT]`: Pre-flight schema validation before atomic restore.
  - `ROADMAP_AUDIT` `[CURRENT]`: In-app package and milestone runtime inspector (`CAP-038`).
- **Safety**: Ephemeral memory confinement; zero disk/backup leakage of secrets.

---

## 10. Media 6-Mode Independence & Guided 7-Step Contracts

$$\text{MEDIA\_MODE} \neq \text{GUIDED\_LOOP\_STEP}$$
$$\text{GUIDED\_PEDAGOGICAL\_WORKFLOW} \neq \text{MANDATORY\_MODE\_UNLOCK\_CHAIN}$$

```
                  ┌─────────────────────────────────────────┐
                  │          MEDIA SOURCE LOADED            │
                  └──────────────────┬──────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌───────────────────────────────────┐
│     DIRECT MODE LAUNCH          │             │   GUIDED 7-STEP LEARNING LOOP     │
│  (100% Learner Selected)        │             │   (Voluntary Pedagogical Flow)    │
├─────────────────────────────────┤             ├───────────────────────────────────┤
│ • Mode 1: Normal Playback       │             │ Step 1: Listen                    │
│ • Mode 2: Noticing (IPA/Chunks) │             │ Step 2: Dictate                   │
│ • Mode 3: Shadowing (Direct)    │             │ Step 3: Verify & Classify         │
│ • Mode 4: Strict Dictation      │             │ Step 4: Notice                    │
│ • Mode 5: Practice Dictation    │             │ Step 5: Shadow                    │
│ • Mode 6: Retell & Synthesis    │             │ Step 6: Vocabulary Extraction     │
└─────────────────────────────────┘             │ Step 7: Retell & Drafting         │
                                                ├───────────────────────────────────┤
                                                │ Controls at EVERY Step:           │
                                                │ [CONTINUE] [SKIP] [CHANGE] [EXIT] │
                                                └───────────────────────────────────┘
```

### 10.1 Verified Direct Launch Paths
- $\text{Video} \longrightarrow \text{Shadowing}$ (without completing Dictation)
- $\text{Video} \longrightarrow \text{Strict Dictation}$ (without completing Noticing)
- $\text{Video} \longrightarrow \text{Retell}$ (direct oral summary or synthesis)
- $\text{Video} \longrightarrow \text{Noticing} \longrightarrow \text{Shadowing}$ (custom partial sequence)
- **Zero Prerequisite Guards**: No state guard of the form `[isDictationComplete === true]` exists on Shadowing, Retell, or Noticing.

### 10.2 Activity-Specific Pause Guard
The pause affordance is governed by:
$$\text{PAUSE\_ALLOWED}(\text{activity\_spec}, \text{mode})$$
- Derived dynamically from the specific activity's integrity contract.
- Media learning workspaces permit pause; Listening Exam simulation prohibits pause/scrubbing. Section practice derives pause rules from its specific task spec.

---

## 11. Multi-Modal Vocabulary State Machine & Lexical Agency

$$\text{RECOMMENDED\_VOCAB\_ACTIVITY} \neq \text{REQUIRED\_VOCAB\_ACTIVITY}$$
$$\text{TARGET\_GOAL(Active vs Passive)} \implies \text{RECOMMENDATION\_HEURISTIC} \quad (\neq \text{MANDATORY\_LOCK})$$

### 11.1 Receptive vs Productive Modalities
- **Receptive Modalities**: Cued Recall Flip, Meaning Discrimination Choice, Sentence/Collocation Cloze.
- **Productive Modalities**: Typing & Spelling Recall, Listening Choice & Dictation, Pronunciation Speech Check, Multi-Word Output Synthesis.
- **Transfer Modality**: Novel Transfer Check (`[CURRENT]`, `affectsSchedule: false`).

### 11.2 Lexical Agency Rule
Active vs Passive lexical targets guide recommendation ordering in Today and Practice Hub, but **never restrict or disable** alternative supported modalities.

---

## 12. Learn vs Practice vs Exam Interaction Separation

```
┌──────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ CONTRACT DIMENSION       │ 1. LEARN WORKSPACES      │ 2. SECTION PRACTICE      │ 3. EXAM SIMULATION       │
├──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Application Chrome       │ Full Navigation Enabled  │ IELTS Header + Back Nav  │ ZERO CHROME (Exam Only)  │
│ Learning Assistance      │ Enabled (Hints/IPA/Cards)│ Configurable Assistance  │ STRICTLY SUPPRESSED      │
│ In-Line Translations     │ Enabled where supported  │ Post-Attempt Only        │ STRICTLY PROHIBITED      │
│ Feedback Timing          │ Immediate per-step       │ Formative per-task/item  │ DEFERRED (Post-Test Only)│
│ Timer Enforcement        │ Untimed / Self-Paced     │ Optional Pacing Helper   │ STRICT OFFICIAL COUNTDOWN│
│ Evidence Gateway         │ Formative / Gated FSRS   │ affectsSchedule: false   │ affectsSchedule: false   │
│                          │                          │ evidenceEligible: false  │ evidenceEligible: false  │
└──────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## 13. Source-to-Learning, Capture & Error Remediation Transitions

```text
SOURCE-TO-LEARNING & REMEDIATION LIFECYCLE:
1. Ingestion:
   [CURRENT] Pasted text, text files, SRT transcripts (Library -> Sources)
   [FUTURE_UX_RESERVED] Multi-format PDF/EPUB dropzone (FUT-011)

2. Active Study:
   [CURRENT] Reader workspace with paragraph highlighter
   [CURRENT] In-text lexical lookup popover

3. Capture:
   [CURRENT] 1-Click capture of term, definition, and context sentence into Capture Inbox

4. Graduation:
   [CURRENT] Triage in Capture Inbox -> promotion into active FSRS deck

5. Error Diagnosis & Remediation:
   [CURRENT] IELTS/drill mistakes emit ErrorCandidate records
   [CURRENT] 23-category diagnostic heatmap view (Library -> Errors)
   [CURRENT] Error card inspection (prompt, mistake, correction)
   [FUTURE_UX_RESERVED] 4-tier refutational explanation card (FUT-017)
   [CURRENT] Launch targeted remediation drill -> status transitions to monitoring/resolved
```

---

## 14. Analytics-to-Action Transitions & Neutral Construct Separation

$$\text{MEMORY\_RETENTION} \neq \text{SKILL\_MASTERY\_ESTIMATE} \neq \text{DIAGNOSTIC\_ERROR\_STATE} \neq \text{IELTS\_PRACTICE\_PERFORMANCE\_ESTIMATE} \neq \text{TRANSFER\_EVIDENCE}$$

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NEUTRAL LEARNER-STATE CONSTRUCTS                                │
├──────────────────────────────────┬─────────────────────────────────────────────────────┤
│ CONSTRUCT                        │ PRODUCT DEFINITION & UX REPRESENTATION              │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ 1. MEMORY_RETENTION              │ FSRS memory retrievability estimate ($R$) and       │
│                                  │ stability decay curve (`src/progress.js`).          │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ 2. SKILL_MASTERY_ESTIMATE        │ Formative skill competence radar with explicit      │
│                                  │ uncertainty bounds (`FUT-014`).                     │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ 3. DIAGNOSTIC_ERROR_STATE        │ 23-category ERRANT-aligned weakness profile         │
│                                  │ (`src/weakness-profile.js`).                        │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ 4. IELTS_PRACTICE_PERFORMANCE    │ Formative practice test band estimate with practice │
│    ESTIMATE                      │ reference disclaimer (`src/ielts-domain.js`).       │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ 5. TRANSFER_EVIDENCE             │ Verification of lexical usage in novel productive   │
│                                  │ writing/speaking tasks (`kind: transfer`).          │
└──────────────────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 15. Cross-Surface Transition Register

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CROSS-SURFACE TRANSITIONS REGISTER                              │
├──────────────────────────┬───────────────────────────┬─────────────────────────────────┤
│ ORIGIN SURFACE           │ TARGET SURFACE            │ TRANSITION NATURE & GUARANTEE   │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Today (`#/today`)        │ Vocab Review (`Screen 2`) │ Recommended daily study launch; │
│                          │                           │ unblocked alternative exits     │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Today (`#/today`)        │ Error Remediation (`S6`)  │ 1-click targeted weakness drill │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Video (`#/learn/media`)  │ Capture Inbox (`Screen 5`)| 1-click lexical capture from cue│
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Reader (`#/learn/reader`)│ Capture Inbox (`Screen 5`)| In-text word capture            │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Capture Inbox (`S5`)     │ Vocab Bank (`#/library`)  │ Batch import to active deck     │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Vocab Bank (`#/library`) │ Writing / Speaking Lab    │ Lexical transfer prompt launch  │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ IELTS Attempt (`S8–S13`) │ Error Notebook (`Screen 6`)| Automated ErrorCandidate emission│
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Error Notebook (`S6`)    │ Remediation Drill         │ Targeted corrective practice    │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Remediation Drill        │ Retry Attempt             │ Voluntary retry affordance      │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Full Mock (`Screen 14`)  │ Scorecard & Today Action  │ Diagnostic handoff to Today     │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ Analytics (`#/analytics`)| Remediation Drill         │ Actionable insight launcher     │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────┘
```

---

## 16. Ratified R4-OD006 Audio Blob Persistence Policy

**Ratified Policy**: `OPTION_A_EPHEMERAL_RAW_AUDIO` (Ratified by Human Owner in G2 Approval)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        R4-OD006 BOUNDED INTERACTION POLICY                            │
├──────────────────────────────────┬─────────────────────────────────────────────────────┤
│ DIMENSION                        │ SPECIFICATION                                       │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Raw Audio Default                │ EPHEMERAL / SESSION-SCOPED                          │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Active Session Playback          │ AVAILABLE (Immediate waveform replay & self-review) │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Manual Audio Export              │ AVAILABLE (Learner-initiated local file download)   │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Automatic Durable Persistence    │ NO (Zero automatic durable raw blob persistence)    │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Recent Attempt History           │ METADATA & FEEDBACK COMPATIBLE                      │
│                                  │ (Raw audio replay after session exit not guaranteed)│
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ Unexported Audio Exit Protection │ REQUIRED (Exit confirmation when unexported audio   │
│                                  │ would otherwise be discarded)                       │
└──────────────────────────────────┴─────────────────────────────────────────────────────┘
```

### 16.1 Audio Interaction States & Transitions
$$\texttt{IDLE} \xrightarrow{\text{Start Recording}} \texttt{RECORDING\_ACTIVE} \xrightarrow{\text{Stop}} \texttt{RECORDING\_AVAILABLE}$$
$$\texttt{RECORDING\_AVAILABLE} \xrightarrow{\text{User: Export Audio}} \texttt{EXPORT\_REQUESTED} \to \texttt{EXPORTED}$$
$$\texttt{RECORDING\_AVAILABLE} \xrightarrow{\text{User: Navigate / Exit}} \texttt{UNEXPORTED\_AUDIO\_EXIT\_CONFIRM}$$

Where `UNEXPORTED_AUDIO_EXIT_CONFIRM` provides clear, non-blocking learner choices:
- `[EXPORT]`: Triggers local download before navigating.
- `[EXIT_WITHOUT_SAVING]`: Discards ephemeral raw audio and completes navigation.
- `[CANCEL]`: Aborts navigation and returns to `RECORDING_AVAILABLE`.

---

## 17. Accessibility Interaction Requirements

Downstream wireframe and visual design waves (W3–W5) must satisfy these functional interaction accessibility requirements:
1. **Keyboard Reachability**: Every interactive element (inputs, buttons, audio triggers, question palette items, split dividers) must be 100% reachable and operable via standard keyboard (`Tab`, `Shift+Tab`, `Space`, `Enter`, `ArrowKeys`, `Escape`).
2. **Focus Ownership & Restoration**: Opening a modal, drawer, or bottom sheet traps focus within the container; dismissing the container restores focus to the triggering element.
3. **Escape Behavior**: Pressing `Escape` dismisses open overlays, drawers, and popovers without triggering destructive state loss.
4. **Live Region Announcements**: Screen readers receive non-intrusive ARIA live region updates for timers (at 10m, 5m, and 1:45 remaining), feedback state changes, and audio play/pause events.
5. **Non-Color State Communication**: Error states, word count warnings, and review flags must pair color indicators with distinct icons or textual badges.
6. **Reduced-Motion Compatibility**: State transitions respect `prefers-reduced-motion` media query by replacing animated slide/flip transitions with instantaneous cuts.

---

## 18. Functional Requirements for W3 Handoff

Wave W3 (Wireframe Blueprints) owns concrete layout, pane, drawer, and visual positioning decisions. Wave W2 provides the following **functional handoff requirements**:

1. **Visual Dominance**: The primary action (`START_RECOMMENDED`, `SUBMIT`, `PLAY`) must be the most visually prominent element on every screen.
2. **Discoverability of Agency Controls**: Secondary agency actions (`SKIP_STEP`, `CHANGE_ACTIVITY`, `REQUEST_HINT`, `SCRATCHPAD`) must remain immediately discoverable without cluttering the primary workflow.
3. **Progressive Disclosure**: Advanced actions (`EXPORT_AUDIO`, `CUE_EDITOR`, `PROVENANCE_AUDIT`) must be accessible via progressive disclosure mechanisms.
4. **Responsive Secondary Panels**: Contextual information (Transcripts, Question Palettes, Notes, Error Context) must have functional responsive representations appropriate for desktop and mobile viewports (W3 selects pane vs sheet vs drawer vs modal).
5. **Dual Chrome Distinction**: Exam simulation viewports must functionally isolate test materials from application navigation chrome.

---

## 19. Current / Future / Owner-Intent Status Register

| STATE / CAPABILITY | IMPLEMENTATION STATUS | NOTES |
|---|---|---|
| Today Runner & Spaced Review | `[CURRENT]` | Active in `src/today-runner.js` |
| Backlog Triage Gateway | `[STAGE4_TARGET]` | Catch-up mode vs full due queue |
| Provisional Grace Freeze Badge | `[FUTURE_UX_RESERVED]` | 1-day habit protection indicator |
| Multi-Modal Vocab Drills (1–7) | `[CURRENT]` | Active in `src/learning.js` |
| Novel Transfer Check | `[CURRENT]` | Active in `src/learning.js` (`affectsSchedule: false`) |
| 4-Tier Refutational Feedback | `[STAGE4_TARGET / PARTIALLY_SUPPORTED]` | Advanced pedagogical feedback cards |
| Media 6 Core Modes | `[CURRENT]` | Active in `src/video-workspace-v2.js` |
| Guided 7-Step Sentence Loop | `[CURRENT]` | Active in `src/sentence-learning-loop.js` |
| Multi-Speaker Overlapping Lanes | `[FUTURE_UX_RESERVED]` | Research handoff `FUT-003` |
| Semantic Topic Chapters Bar | `[FUTURE_UX_RESERVED]` | Research handoff `FUT-004` |
| Structured Document Ingestion | `[FUTURE_UX_RESERVED]` | Research handoff `FUT-011` |
| CEFR Readability Pill | `[FUTURE_UX_RESERVED]` | Research handoff `FUT-006` |
| Automated Reading Cloze Drills | `[FUTURE_UX_RESERVED]` | Research handoff `FUT-008` |
| Unified Capture Inbox | `[CURRENT]` | Active in `src/capture-inbox.js` |
| 23-Category Error Heatmap | `[CURRENT]` | Active in `src/weakness-profile.js` |
| Multi-Dimensional Profile ($R$) | `[CURRENT]` | Active in `src/progress.js` |
| Skill Mastery Radar + Confidence | `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]` | Research handoff `FUT-014` |
| Contextual Attempt Provenance | `[FUTURE_UX_RESERVED]` | 9 provenance fields (`FUT-016`) |
| IELTS Listening Exam & Practice | `[CURRENT]` | Active in `src/ielts-listening-runner.js` |
| IELTS Reading Acad & GT Runners | `[CURRENT]` | Active in `src/ielts-reading-runner.js` |
| Writing Task 1 Visual Container | `[CURRENT]` | Active in `src/ielts-writing-runner.js` |
| Deterministic Task 1 Visuals | `[STAGE4_TARGET]` | 7 local procedural chart families (`FUT-009`) |
| Writing Task 2 Essay Workspace | `[CURRENT]` | Active in `src/ielts-writing-runner.js` |
| Speaking Guided 3-Part Practice | `[CURRENT]` | Active in `src/ielts-speaking-runner.js` |
| Interactive Speaking Examiner | `[OWNER_RECONFIRMED_FUTURE]` | Human Owner reconfirmed future capability |
| Full Mock Exam Orchestrator | `[CURRENT]` | Active in `src/ielts-mock-orchestrator.js` |
| Ephemeral API Key Management | `[CURRENT]` | Active in `src/settings-ui.js` |
| Backup Registry (100% Coverage)| `[CURRENT]` | Active in `src/backup-registry.js` |

---

## 20. Deferred Technology & Non-Authority Register

`[FACT]` The following areas remain strictly outside Stage 4 Wave W2 authority:
1. **Stage 5 AI & Model Benchmarking**: No AI models, ASR engines, WASM linters, or psychometric algorithms are selected.
2. **Stage 6 Physical Persistence**: Single-database IndexedDB schema consolidation (`R4-OD005`) and physical storage allocations remain downstream implementation tasks.
3. **Visual Design System (W4/W5)**: Exact color hexes, typography scales, spacing tokens, and CSS styling belong downstream.
4. **Source & Test Mutations**: Zero production code (`src/**`) or test suites (`tests/**`) are modified by this design artifact.
