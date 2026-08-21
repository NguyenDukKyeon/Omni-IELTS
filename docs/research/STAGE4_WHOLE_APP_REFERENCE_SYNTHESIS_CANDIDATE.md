# Stage 4 Pre-W3 Whole-App Reference Synthesis Candidate

**Transaction:** STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-001

**Repository:** NguyenDukKyeon/Omni-IELTS

**Stable repository ID:** 1315491594

**Canonical base:** e7fb8e84b19606909daa3e8dbe8aa5708ea4c1a6

**Observation date:** 2026-08-21

**Status:** CANDIDATE — READY FOR INDEPENDENT REFERENCE-SYNTHESIS AUDIT only

## 1. Executive Summary

This synthesis recommends one coherent interaction language for all 15 canonical OmniIELTS screen classes. It does not select a final layout, visual system, technology, provider, dependency, breakpoint, or implementation architecture.

The strongest whole-product direction is:

1. **Guided, never globally gated.** Today gives one strong recommendation and an honest workload preview, while every destination and serious practice mode remains directly reachable.
2. **One workspace, contextual states.** Media, vocabulary, reader, writing, and IELTS runners retain source and task continuity while controls change with the selected activity. Capability preservation does not require a wall of simultaneous tabs.
3. **Learning, practice, and exam are visibly and behaviorally different.** Learning can scaffold; section practice can formatively review after an attempt; strict exam simulation removes incompatible assistance and defers feedback.
4. **Evidence is a receipt, not a vibe.** Assistance exposure, source/revision identity, output, evaluation, and activity class remain visible to the default-deny EvidencePolicy. Retention, demonstrated skill, diagnostic weakness, performance estimate, and transfer are never collapsed into one score.
5. **Complexity is absorbed through progressive disclosure.** Primary next actions remain obvious; agency actions remain discoverable; advanced tools live in drawers, sheets, or contextual rails; recovery appears only when needed.
6. **Current behavior is preserved and future capability is honestly labeled.** The design direction carries all 48 W0 capabilities and the 12 adversarial omission invariants. External products inform mechanics, not runtime claims.
7. **Mobile is recomposed, not stacked.** Five stable destinations, a safe-area media controller, bottom-sheet contextual tools, single-pane exam focus, and explicit save/recovery affordances replace desktop panel density.
8. **Accessibility is part of interaction architecture.** Focus ownership/restoration, keyboard equivalents, non-color states, live announcements, accessible media, reduced motion, touch targets, timing accommodations, and answer concealment from both DOM and accessibility tree are W3 inputs.

External evidence supports specific mechanics rather than a universal reference app: Anki for scheduling transparency and granular memory analytics; Quizlet for direct practice-mode configuration and clear progress groups; current Duolingo Practice for guided prioritization without exposing every capability at once; Readwise Reader, Readlang, LingQ, Language Reactor, and YouTube for contextual source continuity; Speechling, ELSA, Yoodli, and YouGlish for listen-record-compare and targeted speaking feedback; official IELTS, British Council, and IDP sources for assessment semantics; Google Takeout for understandable export boundaries; and W3C/WAI for accessible interaction contracts.

## 2. Research Identity / Canonical Base

| Field | Verified value |
|---|---|
| Research role | Whole-product UX researcher / reference-synthesis analyst |
| Repository | NguyenDukKyeon/Omni-IELTS |
| Repository ID | 1315491594 |
| Canonical branch | main |
| Canonical base | e7fb8e84b19606909daa3e8dbe8aa5708ea4c1a6 |
| Integrated authorization | docs/authorizations/STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-AUTH-001.md |
| Authorization integration PR | #175 |
| Output allowlist | docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md only |
| Research date | 2026-08-21, Asia/Saigon |

Repository identity was checked against the GitHub repository object and stable ID. Local origin/main and GitHub API main resolved to the same SHA before branch creation. The target branch did not exist locally or remotely. The context compiler returned the explicitly permitted UNKNOWN_TRANSACTION response; the integrated authorization and canonical sources therefore governed directly.

## 3. Authority / Non-Authority Statement

This artifact is:

- research and design recommendation;
- a reconciled input to a possible future W3;
- a current external-reference evidence record;
- a capability-preserving interaction-direction proposal.

This artifact is not:

- canonical Stage 4 authority;
- W3 authorization or wireframes;
- final layout, tokens, component styling, or visual design;
- Stage 5 provider, dependency, or technology selection;
- Stage 6 architecture or implementation;
- an implementation change;
- a reopening of Stage 3, W0, W1, or W2;
- package acceptance, merge authority, or independent acceptance.

Authority order used here is:

**current canonical W0/W1/W2 execution constraints > accepted Stage 3 upstream evidence > current runtime evidence for current/future truth > current external reference evidence for mechanics.**

External references cannot redefine official IELTS semantics, convert a future capability into a current one, authorize a dependency, or weaken EvidencePolicy. Where upstream inputs conflict, the conflict is retained in Section 30.

## 4. Stage 3 Upstream Research Reconciliation

### 4.1 Exact inputs read

Primary corpus:

- docs/research/R1_LEARNING_PRODUCT_RESEARCH.md
- docs/research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md
- docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md
- docs/research/R3_PIPELINE_ARCHITECTURE_RESEARCH.md
- docs/research/R4_CROSS_RESEARCH_RECONCILIATION.md
- docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md
- docs/research/STAGE3_RESEARCH_CONSTRAINTS.md

Direct canonical dependencies discovered from those sources:

- docs/STAGE3_RESEARCH_STRATEGY.md
- docs/authorizations/STAGE3-RESEARCH-AUTH-001.md
- docs/MASTER_ROADMAP.md
- docs/DECISIONS.md

MASTER_ROADMAP Section 8 and ADR-054 establish accepted Stage 3 closure despite stale candidate/pending-audit headers embedded in some research files. Stage 3 is immutable historical research input, not current Stage 4 execution authority. The learning-experience requirements are accepted RESEARCH_INPUT_ONLY material, not empirical evidence. The constraints file is owner research guidance, not a higher authority tier.

### 4.2 R1 — learning and product

Material carry-forward:

- Retrieval and spacing support memory, but no universal interval or requested-retention target is established.
- Interleaving is conditional; acquisition may first benefit from blocking, followed by discrimination practice.
- Captions and transcripts can scaffold L2 learning, but transcript-visible success is not unaided auditory evidence.
- Target-revealing assistance can teach while invalidating the same attempt as independent evidence.
- Memory retention, mastery, diagnosis, psychometric ability, and transfer are distinct constructs.
- Receptive and productive vocabulary/collocation knowledge are distinct.
- Listening failures are multidimensional; shadowing completion is not general listening or speaking mastery.
- Writing correction can improve revision, but corrected output is not automatically novel-composition transfer.
- Pronunciation practice is strongest for targeted monitored features; rehearsal is not spontaneous-transfer evidence.
- Error recurrence finds a persistent problem, not its cause.
- Streak, activity volume, and session length are engagement signals, not mastery.
- The defensible loop is attempt → evidence classification → diagnosis → remediation → independent retry → delayed or varied transfer evidence.

Relationship to this synthesis: recommendations reinforce or operationalize these findings. Reference mechanics that conflict with them—unified mastery scores, lock-step paths, activity streaks as learning proof, and coached output promoted to retention—are rejected.

### 4.3 R1 supplement and learning-experience requirements

Material carry-forward:

- Elaborated feedback generally beats binary correctness, but timing depends on task and construct.
- Worked examples and faded guidance support novices; expertise reversal requires assistance control.
- Persistent misconceptions support contrastive/refutational guidance followed by clean and delayed retests.
- Near and far transfer require separate evidence; micro-skill gains cannot be promoted to IELTS band gains.
- One noisy attempt cannot establish weakness or mastery.
- Backlog overload matters, but proposed ratios and thresholds are illustrative, not calibrated.
- Generated items require invalid-key, ambiguity, grounding, leakage, distractor, and format checks plus dispute telemetry.
- Delayed/control-aware evidence is required for learning-effectiveness claims.

Two A–H namespaces are retained rather than conflated:

- **Original requirements clusters:** A exercise/assessment; B instruction/acquisition; C learner model/adaptation; D curriculum/end-to-end experience; E provenance/accessibility/fairness/reliability; F OSS/capability discovery; G effectiveness; H persona × lifecycle coverage.
- **Supplemental semantic families:** A instruction/remediation; B retention/transfer method; C diagnostic validity; D curriculum/session evidence; E re-entry/efficiency; F generated-item quality; G system effectiveness; H evidence provenance.

R4’s A–H summary reuses the supplemental family names and misroutes some original IDs. Original requirements identities and R1/R1S finding registries govern identity and epistemic class.

### 4.4 R2 — capability awareness

R2 informs feasibility for sentence segmentation, punctuation, timestamp alignment, topic segmentation, vocabulary/collocation extraction, CEFR/readability, grammar, item generation, ASR/VAD/alignment, document ingestion, search/reranking, charts, diagnostics, retention visualization, lexical graphs, and adaptive learning.

It does not select a library, provider, or architecture. Design implications:

- keep deterministic, frequent, privacy-sensitive work compatible with lightweight local execution;
- show hosted enhancement as optional and consent-bound;
- do not assume heavy local inference on mobile;
- expose progressive/degraded states for long media, search indexing, parsing, and analysis;
- label unresolved processing assumptions ARCHITECTURE_DEPENDENCY.

### 4.5 R3 — pipeline and architecture realities

Fresh runtime inspection, not R3 alone, establishes current behavior. R3 nonetheless constrains impossible assumptions:

- semantic content identity, source occurrence, alignment, revision, and learner-target lineage must remain separable;
- unaligned text must not receive synthetic media timestamps;
- timing-dependent activities fail closed on unaligned content;
- long-media processing needs progressive/off-main-thread compatible states;
- current multi-database coordination and backup completeness cannot be hidden by a falsely simple recovery story;
- richer attempt provenance and calibrated BKT/IRT/CAT substrates remain gaps;
- target topologies are non-binding Stage 5/6 inputs;
- policy values such as review ratios, streak rules, diagnostic thresholds, and unified mastery scores remain unfrozen.

### 4.6 R4 — accepted reconciliation

Accepted reconciliations carried forward:

- local privacy and generative depth can coexist through a local core plus explicit opt-in enhancement;
- SBD and other heavy processing require tiered benchmark decisions, not a premature engine selection;
- audio continuity requires a clear ephemeral/export policy;
- transcript durability requires separated semantic, occurrence, alignment, revision, and target lineage;
- retention, mastery, ability, weakness, and transfer must remain distinct;
- local mechanical writing feedback and optional holistic evaluation are separate claims.

R4 owner decisions are routed, not silently decided. W2 subsequently ratified R4-OD006 to ephemeral raw audio with manual export and an unexported-audio exit confirmation. Other policy/provider/retention/backlog/streak/database/degradation choices retain their canonical status.

### 4.7 Stage 3 disposition rule

Every material recommendation below is tagged conceptually as one of:

- **REINFORCES_STAGE3**
- **OPERATIONALIZES_STAGE3**
- **REFINES_STAGE3_PRESENTATION**
- **CONFLICTS_WITH_STAGE3**
- **ORTHOGONAL_TO_STAGE3**

No external pattern is adopted merely because a competitor uses it.

## 5. W0/W1/W2 Canonical Baseline

Exact controlling inputs read:

- AGENTS.md
- docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md
- docs/authorizations/STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-AUTH-001.md
- docs/authorizations/STAGE4-UXIA-AUTH-001.md
- docs/stage4/STAGE4_UXIA_STRATEGY.md
- docs/stage4/STAGE4_CAPABILITY_PRESERVATION_MATRIX.md
- docs/stage4/STAGE4_INFORMATION_ARCHITECTURE.md
- docs/stage4/STAGE4_USER_JOURNEYS.md
- docs/stage4/STAGE4_INTERACTION_AND_STATE_MODEL.md

### 5.1 W0 strategy and preservation

- Product principle: SYSTEM_GUIDES_STRONGLY + LEARNER_RETAINS_CONTROL.
- Two shells: warm Learning UI and stripped Exam Simulation UI.
- Learn a skill ≠ practice a skill ≠ take an exam.
- Five pillars: Today; Learn; IELTS; Library; Analytics/Progress, with Capture, Search, and Settings as utilities.
- All 48 current capabilities survive: 37 preserve behavior/redesign UI; 7 preserve as-is; 3 consolidate; 1 move without removal.
- All 12 omission invariants survive, including Step-6 capture, retell recovery, strict-answer concealment, transcript slicing, degraded-storage banner, mobile mini-player safe area, suspend/unsuspend, pacing calculator, five audio speeds, pinned Speaking notes, content-pack provenance, and roadmap audit in Settings/About.
- Deterministic Task 1 generation is a Stage 4 target, not current implementation; hosted AI is not a core dependency.

### 5.2 W1 information architecture and journeys

- Global destinations remain freely reachable.
- Direct entry remains available for curriculum, every practice route, section practice, and full mock.
- Recommendations pair with immediate Choose another/Continue anyway.
- IELTS Hub, vocabulary library, signed packs, global search, lexical graph, and section-practice launchers are preserved cross-surface or secondary surfaces even though they are not separate members of the 15 primary classes.
- Desktop uses a rail plus utility dock. Mobile uses Today, Learn, IELTS, Library, Progress.
- Exam mode unmounts application chrome, search, and contextual player.

### 5.3 W2 interaction and state semantics

Each material surface is understood as:

**PRIMARY_ACTIVITY × ASSISTANCE_STATE × INTEGRITY_STATE × CONNECTIVITY_STATE × RECOVERY_STATE**

Disclosure order:

1. primary next action;
2. visible agency actions;
3. progressive advanced tools;
4. contextual recovery actions.

Evidence classes:

- unassisted evidence-capable activity → potentially eligible, then default-deny evaluation;
- assisted evidence-capable activity → evidence suppressed;
- coaching-only → coaching record only;
- diagnostic-only → diagnostic estimate only, schedule false;
- no-evidence → no schedule/metric mutation.

Assistance persists in the attempt receipt. Unassisted is necessary, never sufficient. Shadowing and pronunciation are coaching-only; IELTS attempts and mocks are diagnostic-only; Error Notebook remediation is formative; qualified unassisted vocabulary reviews may reach EvidencePolicy.

R4-OD006 is resolved: raw audio is session-scoped, learner export is available, metadata/feedback may remain, and exit with unexported audio requires Export / Exit without saving / Cancel.

Binding semantic invariants carried into every recommendation:

- MEDIA_MODE != GUIDED_LOOP_STEP
- GUIDED_7_STEP != MANDATORY_UNLOCK_CHAIN
- SIX_CAPABILITIES != SIX_REQUIRED_GIANT_TABS
- SKIP_STEP != FAIL_ACTIVITY
- DIFFICULTY != INTEGRITY
- SHADOWING != RETELL
- RECOMMENDED_PATH != REQUIRED_PATH
- CURRICULUM_PATH != NAVIGATION_LOCK
- UNASSISTED != AUTOMATIC_FSRS_UPDATE
- CAPABILITY_PRESERVED != CAPABILITY_ALWAYS_VISIBLE

## 6. Current Runtime Truth Baseline

Fresh inspection was bounded to source and tests needed to distinguish current from target/future. Material files included:

- src/app.js, src/primary-ia-v10.js, src/ielts-hub-v2.js
- src/today-runner.js, src/today-planner-v2.js, src/today-composer.js
- src/sentence-learning-loop.js, src/video-workspace-v2.js
- src/capture-domain.js, src/capture-inbox.js, src/unified-capture-v2.js
- src/private-source-library.js, src/private-source-library-ui.js
- src/progress.js, src/weakness-profile.js, src/error-repository.js
- src/ielts-listening-runner.js, src/ielts-reading-runner.js
- src/ielts-writing-runner.js, src/ielts-speaking-runner.js
- src/ielts-mock-orchestrator.js, src/settings-ui.js, src/backup-registry.js
- relevant browser/domain tests for primary IA, media, capture, backup, and IELTS runners.

| Surface | Fresh runtime truth | Status |
|---|---|---|
| Primary shell | Existing app routes Today, Capture, Library, Progress; Primary IA V10 adds IELTS. Settings is a dialog utility. Target five-pillar wording/ownership is not fully materialized. | CURRENT + CURRENT_REHOMED target |
| Today | Real planned queue, single-lease runner, quick/weak entry, plan/source-revision validation. | CURRENT |
| Vocabulary | Matching, typing, cloze/listening-oriented work, pronunciation coaching, production/transfer substrate, FSRS and EvidencePolicy integration. Complete four-tier feedback and generated distractor system are not current. | CURRENT + PARTIAL/FUTURE |
| Media | Six modes are configured: Normal, Noticing, Shadowing, Strict Dictation, Practice Dictation, Retell; direct mode switching preserves video, revision, cue, rate/loop state and restore state. Progressive transcript loading and the sentence loop exist. | CURRENT |
| Reader/library | Private-source and contextual capture substrate exists; raw/pasted text and SRT-style source workflows are current. Layout-aware PDF/EPUB, CEFR analysis, and generated cloze remain future. | CURRENT_REHOMED + FUTURE |
| Capture | Staged drafts, confirmation, source context, batch/recovery substrate, and cold-start card initialization exist. | CURRENT |
| Error/analytics | Weakness profile, ErrorCandidate/repository, progress/habit/retention surfaces exist. Calibrated skill radar, unified model, and nine-field audit drawer do not. | CURRENT + PARTIAL/FUTURE |
| IELTS Hub | Academic/GT switch and launchers for full mock, Listening, Reading, Writing, Speaking in exam/practice variants exist inside the current hub. | CURRENT |
| IELTS runners | Listening, Reading, Writing, Speaking guided, and full-mock orchestrator source/tests exist with persistence and containment behavior. Future interactive examiner is not current. | CURRENT + OWNER_RECONFIRMED_FUTURE |
| Settings/data | Learning/audio/FSRS preferences, sessionStorage AI key, backup export/restore substrate, diagnostics and persistence safety exist. Current product copy can name Gemini; Pre-W3 direction stays provider-neutral. | CURRENT; RENAME_USER_FACING |

Runtime inspection is evidence of behavior, not an endorsement of the current layout or copy.

## 7. Research Methodology

1. Verified repository identity, exact canonical main, authorization integration, and branch absence.
2. Reconciled Stage 3 in original-source order, then corrected R4 identity/epistemic drift against R1, R1S, requirements, strategy, authorization, roadmap, and ADR-054.
3. Reconciled W0 preservation, W1 IA/journeys, and W2 state/EvidencePolicy semantics.
4. Inspected current source/tests only where needed to classify current, rehomed, target, future, owner-future, and background behavior.
5. Researched current official product/help sources and official IELTS sources. Browser visual inspection was used where accessible and materially useful, including the current Duolingo Practice surface.
6. Extracted interaction mechanics, not brands or assets.
7. Applied KEEP/ADAPT/REJECT vocabulary and qualitative fit criteria.
8. Performed a second pass for cross-product coherence, mobile, accessibility, anti-RPS, preservation, conflicts, and owner decisions.

Reference confidence:

- **HIGH:** current official help/current UI or governing standard directly describes the mechanic.
- **MEDIUM:** official source is older, product access is partial, or current behavior is inferred across official documentation.
- **LOW:** historical or unverified; no LOW-confidence reference is used as sole support for a material recommendation.

## 8. Reference Evidence Register

Observation date for every record: **2026-08-21**.

| ID | Product / authority | Surface / capability | Observed pattern | Source and type | Confidence | Relevance | Limitations |
|---|---|---|---|---|---|---|---|
| REF-001 | British Council IELTS | Computer-delivered test UI | Font/color/volume controls, timer, notes, highlight/underline, direct question navigation. | https://takeielts.britishcouncil.org/what-is-ielts/how-it-works/test-modes/ielts-on-computer — official help | HIGH | Exam shell, reading, listening, accessibility. | Describes delivery broadly, not every current regional UI detail. |
| REF-002 | IELTS.org | Speaking format | Human examiner; three parts; Part 2 has one-minute preparation and up to two minutes speaking; four scoring criteria. | https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking — official format | HIGH | Canonical speaking timing and future-AI disclaimer. | Not an AI interaction reference. |
| REF-003 | IELTS.org | Academic sample tests | Reading 60 minutes; Writing Task 1 visual/150 words/about 20 minutes; Task 2 250 words/about 40 minutes. | https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test — official preparation | HIGH | Writing/reading task semantics. | Sample platform can differ from live-delivery chrome. |
| REF-004 | British Council IELTS | Current computer UI update | Highlighting, right-side notes with hide/show, introduction tutorials/subtitles, automatic word count. | https://takeielts.britishcouncil.org/blog/ielts-on-computer-changes-updates — official update | HIGH | Notes, word count, orientation, split workspace. | Article explains a release, not a complete specification. |
| REF-005 | British Council IELTS | Familiarisation test | Full-length computer familiarisation spans Listening, Reading, Writing and exposes Academic/GT variants. | https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/ielts-on-computer/familiarisation-test — official practice | HIGH | Direct practice/mock entry and orientation. | Results focus differs from OmniIELTS learning feedback. |
| REF-006 | IELTS.org | 2026 delivery update | Computer delivery expansion does not change assessed skills, format, question types, or scoring semantics. | https://ielts.org/news-and-insights/updates-to-ielts-test-delivery — official news | HIGH | Confirms official semantics outrank competitor runner patterns. | Market timing varies. |
| REF-007 | IDP IELTS | Official mock access | Mock tests are positioned as format familiarisation under test-like conditions. | https://ielts.idp.com/prepare/article-access-official-ielts-mock-test — official preparation | HIGH | Full Mock precheck/orientation and realistic constraints. | Local availability may vary. |
| REF-008 | IELTS.org | Access arrangements | Extra time/breaks, large print/Braille, audio pauses and assistive technology may be arranged; speaking task cards can be accessible. | https://ielts.org/take-a-test/booking-your-test/access-arrangements — official policy | HIGH | Timed-state accommodations and accessibility settings. | Arrangements require advance coordination; not a generic pause right. |
| REF-009 | IELTS.org | GT Reading | Three sections increase in difficulty; 60 minutes/40 questions; no extra transfer time. | https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading — official format | HIGH | Keeps GT content/pacing distinct from Academic. | Does not prescribe every UI control. |
| REF-010 | IELTS.org | GT Writing | Task 1 letter with audience/register; Task 2 essay; 150/250 words; Task 2 double weight. | https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-writing — official format | HIGH | GT Task 1 material variant and shared writing priorities. | No practice feedback design. |
| REF-011 | IELTS.org | Academic detailed format | Official task taxonomy and section semantics across Listening/Reading/Writing. | https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail — official format | HIGH | Runner fidelity and question behavior. | Organizational page, not a live runner. |
| REF-012 | Anki | Studying/review flow | Due queue, answer reveal before rating, bury/suspend/undo and direct study control. | https://docs.ankiweb.net/studying.html — official manual | HIGH | Vocabulary review, suspend recovery, learner agency. | Dense expert UI is unsuitable as a direct visual model. |
| REF-013 | Anki | Deck/FSRS options | Requested retention and workload are linked; limits and Easy Days are configurable with consequences. | https://docs.ankiweb.net/deck-options — official manual | HIGH | Settings workload preview and honest retention control. | OmniIELTS decision remains unfrozen; Anki configuration density is too high. |
| REF-014 | Anki | Statistics | Today, future due, calendar, reviews, counts, stability, difficulty, and retrievability remain separate views; daily variation should not be overinterpreted. | https://docs.ankiweb.net/stats.html — official manual | HIGH | Neutral multi-dimensional analytics. | Memory-centric; does not represent IELTS skill or transfer. |
| REF-015 | Quizlet | Learn mode | Personalized path plus learner-configurable question types, answer side, shuffle/audio and explicit handling of missed answers. | https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn — official help | HIGH | Recommended activity without hiding direct configuration. | Quizlet’s evidence semantics do not transfer. |
| REF-016 | Quizlet | Test mode | Selectable question formats, timer option, submission and automatic grading. | https://quizlet.com/features/test — official product page | MEDIUM | Bounded practice configuration and review sequence. | Marketing view; not official IELTS semantics. |
| REF-017 | Quizlet | Progress groups | Not Studied / Still Learning / Mastered groups can target a next study set. | https://help.quizlet.com/hc/en-us/articles/360048803491-Using-Progress-for-targeted-studying — official help | HIGH | Actionable grouping. | “Mastered” is too broad for OmniIELTS; rename by evidence construct. |
| REF-018 | Duolingo | Home path | One recommended path reduces decision burden and integrates spaced practice. | https://blog.duolingo.com/new-duolingo-home-screen-design/ — official product article | MEDIUM | Today recommendation hierarchy. | Path gating conflicts with OmniIELTS agency; only hierarchy is adaptable. |
| REF-019 | Duolingo | Practice tab (current) | Current mobile surface shows one featured practice card, then a compact list of on-demand Speak, Listen, Mistakes, Stories, Radio and Words with persistent bottom navigation. | https://blog.duolingo.com/guide-to-duolingo-practice-hub/ and official screenshot — official current article/visual | HIGH | Strong evidence for featured recommendation plus grouped capabilities. | Product labels, monetization, and evidence semantics do not transfer. |
| REF-020 | Readwise Reader | Library organization | Inbox/Later/Archive, document tags, highlight tags, and filtered views separate intake state from durable organization. | https://docs.readwise.io/reader/docs/organizing-content — official docs | HIGH | Reader/capture lifecycle and progressive organization. | Web/mobile features can differ. |
| REF-021 | Readwise Reader | Reading/annotation | Paragraph focus and keyboard shortcuts expose highlight/tag/note actions contextually; mobile uses a bottom action bar. | https://docs.readwise.io/reader/docs/faqs/highlights-tags-notes — official docs | HIGH | Contextual reader capture and keyboard/mobile behavior. | Reading-for-knowledge differs from language evidence. |
| REF-022 | Language Reactor | Dual-subtitle workspace | Dual subtitles, word definitions/save, auto-pause, speed/translation controls, and keyboard shortcuts preserve video context. | https://dev.languagereactor.com/help/basic — official help | MEDIUM | Media workspace continuity and sentence controls. | Live surface was not fully accessible; official help supports observations. |
| REF-023 | YouTube | Transcript | Current cue auto-scrolls; selecting a transcript line seeks to that point. | https://support.google.com/youtube/answer/15930243 — official help | HIGH | Transcript rail and cue navigation. | Not a learning or evidence system. |
| REF-024 | YouTube | Player keyboard/captions | Keyboard playback/seek/caption controls and configurable caption presentation. | https://support.google.com/youtube/answer/7631406 and https://support.google.com/youtube/answer/100078 — official help | HIGH | Accessible media control baseline. | Strict exam guards must override generic player shortcuts. |
| REF-025 | LingQ | Reader/sentence mode | Unknown/saved/known word states, phrase selection, sentence view with audio/translation/vocabulary, and sentence activities. | https://www.lingq.com/en/ios-app-support/ — official help | HIGH | Vocabulary-in-context and mobile sentence practice. | Word rearrangement is explicitly rejected for OmniIELTS. |
| REF-026 | Readlang | Inline reading-to-review | Inline translation/context, saved words → flashcards, useful-word prioritization, SRS, reader/video input, vocabulary manager/export. | https://readlang.com/features — official product page | MEDIUM | Reader → capture → confirm → practice continuity. | Marketing claims; learning-efficacy claims are not adopted. |
| REF-027 | Speechling | Recording loop | Listen to native model → record → inspect waveform → replay learner/native → retry or submit for coaching. | https://speechling.com/help/quickstart — official help | HIGH | Shadowing/pronunciation interaction mechanics. | Self-ratings/coaching are not FSRS evidence in OmniIELTS. |
| REF-028 | Speechling | Dictation | Listen → type → check; word-level comparison; give up, mark for review, skip, record sentence. | https://speechling.com/help/dictation — official help | HIGH | Shared dictation surface, localization, retry and reveal progression. | Does not encode strict answer concealment or OmniIELTS assistance receipts. |
| REF-029 | ELSA Speak | Pronunciation feedback | Feedback can localize sounds/syllables/words with non-binary detail and support open speaking feedback. | https://blog.elsaspeak.com/en/advantage-of-elsa-feedback/ — official article | MEDIUM | Targeted pronunciation feedback hierarchy. | Provider scoring/calibration and color-only states cannot be assumed. |
| REF-030 | Yoodli | Speaking feedback/roleplay | Roleplay plus feedback dimensions such as pacing, filler words, clarity and custom rubric. | https://yoodli.ai/platform/ai-feedback — official product page | MEDIUM | Future examiner post-session feedback grouping. | Marketing source; not an IELTS examiner and no provider selection authority. |
| REF-031 | YouGlish | Authentic examples | Search real contextual clips; replay/next/speed/delay and keyboard controls support focused noticing. | https://youglish.com/about and https://youglish.com/settings — official product/settings | HIGH | Context examples, pronunciation comparison, compact media controls. | Discovery examples are not assessment evidence. |
| REF-032 | Khan Academy | Mastery/action loop | Progress levels, completion feedback, recommended lessons and mastery challenges link diagnosis to a next action. | https://support.khanacademy.org/hc/en-us/articles/115002552631--Beta-What-is-Unit-Mastery- and https://support.khanacademy.org/hc/en-us/articles/360037494231-What-are-Mastery-Challenges — official help | MEDIUM | Analytics → remediation, without copying terminology. | Domain and model differ; “mastery” cannot be imported. |
| REF-033 | Google Takeout | Export | Select data, create archive, separate export from deletion, explain delay and third-party handling. | https://support.google.com/accounts/answer/3024190 — official help | HIGH | Settings/data-safety export mental model. | Google scale/process is not OmniIELTS architecture. |
| REF-034 | W3C WAI | Modal dialog | Modal focus remains contained; Escape closes; focus returns to the invoking control. | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — standards guidance | HIGH | Overlay focus ownership and restoration. | APG pattern must be adapted to actual content. |
| REF-035 | W3C WAI | Accessible media | Captions, transcripts, audio description where needed, and accessible player controls are planned as content/system requirements. | https://www.w3.org/WAI/media/av/ — standards guidance | HIGH | Media, speaking, listening accessibility. | Does not define IELTS integrity policy. |
| REF-036 | W3C | WCAG 2.2 | Focus not obscured, adequate target size, non-color communication, keyboard and timing requirements. | https://www.w3.org/TR/WCAG22/ and https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ — recommendation/guidance | HIGH | Cross-app interaction baseline. | Conformance requires later implementation testing. |

**Register totals:** 36 material reference records; 17 product/service families plus the W3C/WAI standards authority.

## 9. Whole-App Reference Synthesis Matrix

| Screen | Strongest reference mechanics | Primary decision | Stage 3 relation | Principal risk |
|---|---|---|---|---|
| 01 Today | Duolingo featured action; Anki workload truth; Khan action handoff | ADAPT_FROM_REFERENCE | OPERATIONALIZES_STAGE3 | Path hierarchy becoming a gate |
| 02 Vocabulary | Anki review receipt; Quizlet practice choice; LingQ context | GROUP_RELATED_CAPABILITIES | REINFORCES_STAGE3 | Flashcard reduction or false mastery |
| 03 Media | Language Reactor/YouTube context continuity; Speechling loop | KEEP_AND_POLISH | OPERATIONALIZES_STAGE3 | Six giant tabs or mode-state loss |
| 04 Reader | Reader contextual tools; Readlang/LingQ capture | ADAPT_FROM_REFERENCE | OPERATIONALIZES_STAGE3 | Future ingestion shown as current |
| 05 Capture | Reader triage; Readlang intake-to-review | KEEP_AND_POLISH | REINFORCES_STAGE3 | Silent scheduling before confirmation |
| 06 Errors | Khan diagnosis-to-action; Speechling localized comparison | ADAPT_FROM_REFERENCE | OPERATIONALIZES_STAGE3 | One error declared weakness |
| 07 Analytics | Anki separate memory metrics; Khan actionability | ADAPT_FROM_REFERENCE | REINFORCES_STAGE3 | One composite “mastery” score |
| 08 Listening | Official IELTS controls; YouTube accessibility only in practice | KEEP_AND_POLISH | REINFORCES_STAGE3 | Practice controls leaking into exam |
| 09 Academic Reading | Official IELTS split/navigation/notes/highlight | KEEP_AND_POLISH | ORTHOGONAL_TO_STAGE3 presentation | Explanation leakage in exam |
| 10 GT Reading | Official GT semantics; shared runner grammar | GROUP_RELATED_CAPABILITIES | REFINES_STAGE3_PRESENTATION | Reusing Academic scoring/content |
| 11 Task 1 | Official Academic/GT semantics; BC word count/notes | GROUP_RELATED_CAPABILITIES | OPERATIONALIZES_STAGE3 | Target renderer misreported current |
| 12 Task 2 | Official semantics; practice-only planning/feedback | KEEP_AND_POLISH | REINFORCES_STAGE3 | Assistance contaminating exam |
| 13 Speaking | Official timing; Speechling loop; Yoodli/ELSA future feedback | ADAPT_FROM_REFERENCE | OPERATIONALIZES_STAGE3 | AI framed as official examiner |
| 14 Full Mock | Official familiarisation and strict shell | KEEP_AND_POLISH | REINFORCES_STAGE3 | App chrome/assistance or recovery gaps |
| 15 Settings | Anki workload preview; Takeout export boundaries | ADAPT_FROM_REFERENCE | OPERATIONALIZES_STAGE3 | Provider/architecture leakage |

The sections below apply the complete A–N contract to each screen class.

## 10. Screen Class 01 — Today / Home

### A. Canonical job to be done

Help the learner understand what is due, why it matters, how long it may take, and what the strongest next action is—then let them start it or choose any other destination without penalty.

### B. Stage 3 upstream inputs

- **R1/R1S:** retrieval and spacing; review/new distinction; backlog risk; non-punitive re-entry; streak/activity not mastery; no validated universal retention target or review ratio.
- **Requirements:** learner-selected focus, skip/already-know/too-easy-or-hard controls, short and sustained sessions, reversible recommendations.
- **R2:** adaptive and retention capabilities are awareness only.
- **R3:** TodayRunner lease, exact target/source-revision binding, policy values must remain configurable.
- **R4:** OD002 retention, OD003 backlog, OD004 streak remain routed; unified score rejected.

### C. W0/W1/W2 binding constraints

One primary recommendation plus visible Choose another. Today coordinates but does not emit evidence. The real FSRS queue, single lease, degraded-storage banner, workload estimator, quick drill, and future/provisional backlog and grace states must remain. “Unlock” language is rejected; completion surfaces a next recommendation.

### D. Current product/runtime truth

Current source has Today rendering, due-plan preview, Start Today, Quick Review, weak-practice entry, plan-date/source-revision validation and a single runner path. Target >50 backlog triage and final streak-grace policy are not safely classifiable as current policy.

### E. Material states / variants

IDLE; RECOMMENDATION_READY; SESSION_PREVIEW; LEASE_ACQUIRING; ACTIVE_SESSION; SESSION_SUMMARY; EMPTY_QUEUE; BACKLOG_TRIAGE; STORAGE_DEGRADED; RECOVERY_AVAILABLE; OFFLINE_LOCAL_READY. Variants: first day, ordinary due day, overloaded backlog, returning learner, no due work, exam-date pacing warning.

### F. Reference set

REF-012–014 Anki; REF-018–019 Duolingo; REF-032 Khan Academy.

### G. Observed reference mechanics

Duolingo demonstrates high-salience recommendation and compact on-demand practice grouping. Anki demonstrates honest due/workload consequences and direct queue controls. Khan demonstrates progress-to-next-action handoff. None justifies a locked course path, punishment animation, or a single mastery number.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Current real Today queue and single runner | KEEP_AND_POLISH | TASK_FIT HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| One featured recommended action with concise reason | ADAPT_FROM_REFERENCE | TASK_FIT HIGH; CLARITY HIGH; LEARNING MEDIUM; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Workload preview tied to settings/policy | ADAPT_FROM_REFERENCE | TASK_FIT HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| Compact “Other ways to learn” group | GROUP_RELATED_CAPABILITIES | TASK_FIT HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Lock-step path, punitive missed-day state, hidden direct entry | REJECT_REFERENCE_PATTERN | TASK_FIT LOW; CLARITY MEDIUM; LEARNING LOW; PRESERVATION LOW; MOBILE MEDIUM; ACCESSIBILITY MEDIUM |

### I. Synthesized OmniIELTS interaction direction

Use a calm command-center hierarchy: “Recommended now” with reason, estimated scope, assistance/evidence label, and Start; alongside Choose another. Below it, show due memory review, remediation, skill practice, and exam preparation as distinct workload bands, not one total. Overload presents a reversible catch-up choice and full-queue access. Empty days suggest acquisition or transfer without manufacturing due work. This **OPERATIONALIZES_STAGE3**.

### J. Mobile / responsive implications

One featured card fills the first viewport; queue/workload details collapse into an accessible sheet; alternative activities appear as a short list, not a carousel-only control. Bottom navigation remains available. Active session chrome replaces—not stacks below—the Today surface.

### K. Accessibility implications

Announce changed due counts without interrupting; provide text for all habit states; ensure workload diagrams have tabular summaries; focus moves to the session heading after Start and returns to Start/summary on exit; motionless status transitions under reduced motion.

### L. Capability-preservation risks

Losing single-lease guarantees, hiding quick/weak practice, treating future grace as current, replacing FSRS due truth with gamified estimates, or omitting degraded-storage recovery.

### M. Anti-RPS / duplication assessment

Primary recommendation is **B: IMPROVED_PRESENTATION_OF_EXISTING_CAPABILITY**. Backlog is **C: STATE_OR_VARIANT_OF_EXISTING_CAPABILITY**, not a new route. A separate “motivation dashboard” would be **D: DUPLICATE_UX**. Many feature cards would be **E: UNNECESSARY_FEATURE_WALL_EXPANSION**.

### N. Unresolved questions / owner decisions

Canonical OD002/003/004 remain unfrozen. W3 can explore the shell with variables and neutral copy; it must not select retention, cap, catch-up count, or grace duration.

## 11. Screen Class 02 — Vocabulary & Collocation

### A. Canonical job to be done

Support the lifecycle Capture/Acquire → Confirm → Understand in context → Practice → Spaced review → Productive/transfer work, with activity choice, assistance transparency, and exact evidence consequences.

### B. Stage 3 upstream inputs

- **R1/R1S:** receptive/productive knowledge differ; recall, spelling, listening, collocation, output, and transfer are distinct; assistance contaminates independent evidence; acquisition may block before interleaving.
- **Requirements:** sense confirmation, active/passive goals, learner focus and item dispute.
- **R2:** extraction, CEFR, search, lexical graph and generated distractors are capability candidates only.
- **R3:** stable semantic/content/source/revision identity and exact output/evaluation binding.
- **R4:** no unified mastery; provenance superset; generated-item quality gates.

### C. W0/W1/W2 binding constraints

FSRS is a memory scheduler only. Recommended activity is not required. All supported modalities remain directly selectable. Qualified unassisted evidence-capable reviews may reach EvidencePolicy; hints suppress positive stability; pronunciation is coaching-only; current transfer remains schedule false. Suspended cards and unsuspend control remain visible.

### D. Current product/runtime truth

Current app/source includes matching, typed work, cloze/listening-oriented activities, pronunciation coaching, production/transfer substrate, FSRS scheduling and assistance-aware EvidencePolicy. Complete four-tier feedback and dynamically validated distractor generation are partial/future. The current top-level product can still feel flashcard-centered, which is a presentation problem, not permission to drop modalities.

### E. Material states / variants

ENTRY; RECOMMENDED_ACTIVITY; USER_SELECT_ACTIVITY; PROMPT_ACTIVE; HINT_EXPOSED; ANSWER_REVEALED; VERIFYING; FEEDBACK_ACTIVE; RETRY; QUEUE_SUMMARY; EDIT_CARD; SUSPEND/UNSUSPEND; SOURCE_CONTEXT; ACTIVE/PASSIVE_GOAL. Variants: new-card introduction, meaning discrimination, matching, typing, cloze, collocation, listening, full-sentence dictation, pronunciation coaching, production, novel transfer.

### F. Reference set

REF-012–017 Anki/Quizlet; REF-025 LingQ; REF-026 Readlang; REF-028 Speechling.

### G. Observed reference mechanics

Anki separates prompt, reveal and learner rating while keeping suspend/undo reachable. Quizlet exposes goal/question configuration and groups progress. LingQ/Readlang keep source context connected to saved terms. Speechling dictation localizes differences and supports retry/reveal. Imported “Mastered” labels and self-ratings cannot bypass OmniIELTS evidence rules.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Current multimodal activity engine and evidence receipt | KEEP_AND_POLISH | TASK HIGH; CLARITY MEDIUM; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Lifecycle-based workspace sections rather than “flashcards” only | GROUP_RELATED_CAPABILITIES | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Recommended practice with direct mode selector | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Source-context drawer and active/passive goal badge | KEEP_AND_POLISH | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| Word rearrangement | REJECT_REFERENCE_PATTERN | TASK LOW; CLARITY MEDIUM; LEARNING LOW; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY MEDIUM |
| “Mastered” from one mode or coached success | RENAME_USER_FACING | TASK LOW; CLARITY LOW; LEARNING LOW; PRESERVATION LOW; MOBILE HIGH; ACCESSIBILITY HIGH |

### I. Synthesized OmniIELTS interaction direction

Use one Vocabulary & Collocation canvas with a stable item/source header and a contextual activity switcher. The system recommends one activity with an explanation, but the learner can select another. Prompt area, response input, assistance rail, and feedback region change by activity. Feedback layers Verify → Explain/Elaborate → Contrast/Refute → Scaffold under progressive disclosure and explicit assistance labels. Fill Gaps and Full Sentence share Dictation presentation; integrity controls remain independent of difficulty. This **REINFORCES_STAGE3** and **REFINES_STAGE3_PRESENTATION**.

### J. Mobile / responsive implications

Use a single prompt viewport, sticky response action, and bottom-sheet mode/source context. Matching becomes two accessible lists or a sequential pairing pattern at narrow widths. Audio controls remain reachable above the bottom nav. Do not horizontally scroll essential answer choices.

### K. Accessibility implications

No color-only correctness. Typed differences must expose an ordered textual diff. Flip/reveal needs a button with state, not gesture-only behavior. Matching needs keyboard selection and programmatic pair state. Pronunciation feedback needs text/sound-location alternatives. Suspend and assistance exposure must be announced.

### L. Capability-preservation risks

Flashcard-only framing; losing collocation or production; hiding suspend; auto-scheduling staged capture; four-tier feedback presented as current-complete; generated distractors without validation/dispute; assistance traces not persisted.

### M. Anti-RPS / duplication assessment

Activity modes are **C: STATE_OR_VARIANT_OF_EXISTING_CAPABILITY** within one canvas. A separate page for every modality is **D**. Contextual source lookup is **B**. A new competing vocabulary store is **E**.

### N. Unresolved questions / owner decisions

No new owner decision. W3 must explore how many activity choices are immediately visible versus in “More practice,” while preserving direct access. Evidence classes for every activity specification require canonical confirmation before outcome labels.

## 12. Screen Class 03 — Video / Media

### A. Canonical job to be done

Let a learner study one source and sentence through Normal/Watch, Noticing, Shadowing, Strict Dictation, Practice Dictation and Retell—directly or through the optional Guided 7-Step loop—without losing context.

### B. Stage 3 upstream inputs

- **R1/R1S:** captions scaffold but contaminate unaided listening; listening failures are multidimensional; shadowing is not general mastery; retell tests reconstruction only under qualified conditions.
- **Requirements:** learner control, transcript/caption reveal schedules, accessibility, reliable recovery.
- **R2:** SBD, punctuation, alignment, topic segments, VAD, timelines are candidate capabilities.
- **R3:** progressive loading, stable cross-revision sentence identity, untimed/unaligned fail-closed behavior, off-main-thread dependency.
- **R4:** privacy/depth tiering, audio continuity, transcript lineage and degradation decisions.

### C. W0/W1/W2 binding constraints

Six modes remain independently launchable. Guided 7-Step is Listen → Dictate → Verify/Correct → Notice → Shadow → Vocabulary → Retell with Continue/Skip/Change/Exit at every step. Skip is not failure. Strict Dictation conceals target from visual DOM and accessibility tree. Shadowing is coaching-only. Raw audio is ephemeral with manual export and exit confirmation.

### D. Current product/runtime truth

All six modes are configured in video-workspace-v2. Direct mode changes preserve video/revision, sentence index, player rate/loop, deep-link/restore state and open the corresponding sentence-loop step. Progressive transcript loading and restore exist. Speaker lanes, topic chapters, advanced automatic segmentation/collocation and calibrated retell evidence remain future.

### E. Material states / variants

MEDIA_IDLE/LOADING/LOADED/PARTIAL; TRANSCRIPT_RAIL; DIRECT_MODE; GUIDED_STEP; STRICT_DICTATION; PRACTICE_DICTATION; CORRECTION_DIFF; NOTICING; RECORDING; SHADOW_COMPARE; VOCAB_CAPTURE; RETELL_DRAFT/RECOVERY; TRANSCRIPT_SPLIT_MERGE; UNEXPORTED_AUDIO_EXIT_CONFIRM; SOURCE_REVISION_CHANGED; OFFLINE/QUEUED.

### F. Reference set

REF-022 Language Reactor; REF-023–024 YouTube; REF-027–028 Speechling; REF-029 ELSA; REF-031 YouGlish; REF-035 WAI Media.

### G. Observed reference mechanics

Language Reactor and YouTube demonstrate cue-synchronized transcript continuity, seeking and keyboard controls. Speechling demonstrates listen-record-waveform-replay-compare-retry. YouGlish demonstrates compact replay/next/speed/delay for authentic examples. ELSA demonstrates localized feedback. These mechanics are adapted without importing vendor scoring or turning completion into mastery.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Stable source/player/transcript workspace and direct six-mode choice | KEEP_AND_POLISH | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| Mode switch preserving source, cue, position, rate and draft | KEEP_AND_POLISH | all six criteria HIGH except MOBILE MEDIUM |
| Shared Dictation surface with Strict/Practice integrity control | GROUP_RELATED_CAPABILITIES | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Listen-record-replay-compare loop | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY MEDIUM |
| Six persistent giant tabs plus seven separate step tabs | REJECT_REFERENCE_PATTERN | TASK LOW; CLARITY LOW; LEARNING MEDIUM; PRESERVATION MEDIUM; MOBILE LOW; ACCESSIBILITY LOW |
| Mandatory guided unlock chain | REJECT_REFERENCE_PATTERN | TASK LOW; CLARITY MEDIUM; LEARNING LOW; PRESERVATION LOW; MOBILE MEDIUM; ACCESSIBILITY MEDIUM |

### I. Synthesized OmniIELTS interaction direction

Use a persistent source/player/transcript frame. A compact activity selector changes only the practice panel. Guided loop is a prominent “Study this sentence step by step” option, not the only route. Noticing progressively reveals thought groups, stress, reductions, sounds, chunks/collocations and grammar. Shadowing follows listen → repeat → record → replay → compare → targeted coaching. Retell follows comprehend → reduce support → learner output → compare/evaluate → feedback → optional retry. This **OPERATIONALIZES_STAGE3**.

### J. Mobile / responsive implications

Player and current cue occupy the top; practice input occupies the main pane; transcript and noticing detail become independently invokable sheets. Mini-player remains above five-item nav in safe area. Recording state must survive sheet transitions. Long transcript virtualizes progressively. Landscape may show rail + practice; portrait never stacks all rails.

### K. Accessibility implications

Accessible play/pause/seek/rate and transcript navigation; visible and announced recording state; waveform has text/time alternative; strict target absent from DOM/ARIA; captions adjustable; all keyboard shortcuts documented and guard-aware; reduced-motion current-cue changes; focus returns to invoking sentence/mode control.

### L. Capability-preservation risks

Mode-state loss, transcript revision drift, hidden Step-6 capture, missing split/merge drawer, raw audio persisted by default, answer leakage, no retell recovery, speed set reduced below 0.75/0.9/1/1.1/1.25, or future processing shown as instant/current.

### M. Anti-RPS / duplication assessment

Six modes are **C** inside one workspace. Guided loop is **C**, not a seventh product. Transcript edit and notation are progressive states. A separate “dictation product” or duplicate media store would be **D/E**.

### N. Unresolved questions / owner decisions

Media Strict/Practice Dictation’s exact evidence class is not stated as precisely as shadowing/retell in W2; outcome copy needs resolution in the owner register. Topic/speaker processing remains ARCHITECTURE_DEPENDENCY. No provider selection.

## 13. Screen Class 04 — Article / Source Reader

### A. Canonical job to be done

Ingest or open an authentic text, support focused comprehension, expose contextual tools without overwhelming reading, and stage selected terms with source/provenance intact.

### B. Stage 3 upstream inputs

- **R1:** extensive reading helps; speed and comprehension trade off; glosses are assistance.
- **Requirements:** source/license provenance, accessibility, intake lifecycle and user agency.
- **R2:** readability, ingestion, extraction, search and topic segmentation are capability awareness.
- **R3:** unaligned text must remain unaligned; parsing/indexing cannot block the interaction thread.
- **R4:** local core/optional enhancement and provenance boundary.

### C. W0/W1/W2 binding constraints

Current raw/pasted text and SRT/source workflows are preserved and rehomed. Term selection stages capture; it does not directly schedule evidence. Layout-aware PDF/EPUB parsing, CEFR/readability and generated cloze remain future. Reader can transition to Inbox or direct vocabulary practice while retaining source context.

### D. Current product/runtime truth

Private Source Library and contextual capture exist. Canonical current truth supports raw/pasted text and SRT-like input, not a complete layout-aware PDF/EPUB parser. IA tree wording that implies current PDF/EPUB is reconciled as a conflict, not copied into this direction.

### E. Material states / variants

LIBRARY/INBOX/LATER/ARCHIVE; SOURCE_LOAD; PARSING/INDEXING; READING; TERM_SELECTED; CONTEXT_ACTIONS; CAPTURE_STAGED; SOURCE_METADATA; SEARCH_RESULTS; UNALIGNED; PARSE_FAILED; STORAGE_DEGRADED; OFFLINE. Future: CEFR breakdown, structured PDF/EPUB, generated cloze.

### F. Reference set

REF-020–021 Readwise Reader; REF-025 LingQ; REF-026 Readlang.

### G. Observed reference mechanics

Reader demonstrates intake-state separation, paragraph focus, contextual highlight/tag/note tools and mobile bottom actions. LingQ demonstrates sentence view and vocabulary state in context. Readlang demonstrates inline lookup and later review. OmniIELTS adapts the continuity while keeping assistance/evidence and source licensing explicit.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Current private source library and staged capture | KEEP_AND_POLISH | TASK HIGH; CLARITY MEDIUM; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Selection-triggered compact context menu | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY MEDIUM |
| Inbox/Later/Archive as source states, not duplicate libraries | GROUP_RELATED_CAPABILITIES | TASK HIGH; CLARITY HIGH; LEARNING MEDIUM; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Always-visible translation/analysis sidebar | PROGRESSIVELY_DISCLOSE | TASK MEDIUM; CLARITY MEDIUM; LEARNING MEDIUM; PRESERVATION HIGH; MOBILE LOW; ACCESSIBILITY MEDIUM |
| Synthetic timestamps for plain text | REJECT_REFERENCE_PATTERN | all fit LOW except PRESERVATION HIGH by rejecting |

### I. Synthesized OmniIELTS interaction direction

Use a distraction-light reading pane with a source header, reading-position persistence and context toolbar after selection. Primary actions are Continue reading and Stage for learning; translation, grammar, phrase detail and provenance open progressively and mark assistance. Intake states live in one source library. Processing communicates partial availability and failure recovery. This **OPERATIONALIZES_STAGE3**.

### J. Mobile / responsive implications

Reading uses one column with adjustable typography. Selection actions appear in an accessible bottom sheet with a non-gesture button. Source metadata/search are drawers. Preserve reading position when opening Inbox or a sentence activity.

### K. Accessibility implications

Semantic document hierarchy; typography and spacing preferences; selection toolbar reachable by keyboard; no color-only vocabulary states; screen-reader-friendly source/citation; parsing progress announcements; captured text/context confirmation; reduced motion.

### L. Capability-preservation risks

Calling future PDF/EPUB current; losing source/citation; auto-capturing every lookup; assigning timing to untimed text; hiding parse failures; duplicating the source library; blocking long-document input.

### M. Anti-RPS / duplication assessment

Inbox/Later/Archive are **C** states. Inline lookup is **B**. A separate “article vocabulary database” is **D**. Generated cloze is **A: GENUINELY_NEW_CAPABILITY** and therefore FUTURE_ONLY.

### N. Unresolved questions / owner decisions

No owner decision. Structured parsing, CEFR and generation remain ARCHITECTURE_DEPENDENCY/FUTURE_ONLY. W3 may explore placeholders and failure states, not claim implementation.

## 14. Screen Class 05 — Capture Inbox

### A. Canonical job to be done

Turn discoveries from media, reader, manual entry and other sources into confirmed, editable learning items without silently scheduling them or losing provenance.

### B. Stage 3 upstream inputs

- **R1/requirements:** capture is intake, not evidence; sense and active/passive goal need confirmation; learner can discard/dispute.
- **R2:** extraction/search/duplicate tooling is capability awareness.
- **R3:** stable content/source/revision identity, local persistence and contention/recovery.
- **R4:** contextual provenance and unified user-facing data despite physical-store uncertainty.

### C. W0/W1/W2 binding constraints

Capture → staged item → edit/confirm → cold-start FSRS card. Batch actions and five-second discard undo remain. Source/context, skill goals, answer variants and duplicate/sense resolution must survive. Mobile capture is an accessible sheet; confirmation is explicit.

### D. Current product/runtime truth

Capture domain/inbox/unified-capture sources support staging, confirmation, source context and degradation containment. Existing app contextual capture explicitly places a selected candidate into a draft and does not auto-save. Target IA can rehome this without replacing the contract.

### E. Material states / variants

EMPTY; ITEMS_LOADED; INLINE_EDITING; BATCH_SELECTED; DUPLICATE_REVIEW; SENSE_REVIEW; CONFIRMING; CONFIRMED; DISCARD_PENDING_UNDO; STORAGE_DEGRADED; IMPORT_PARTIAL. Sources: reader, video Step 6, manual, IELTS/error context, bulk import.

### F. Reference set

REF-020–021 Readwise Reader; REF-025 LingQ; REF-026 Readlang.

### G. Observed reference mechanics

Reader separates inbox state and durable organization; Readlang/LingQ connect a contextual selection to later vocabulary work. OmniIELTS keeps that low-friction flow but adds explicit confirmation, source/revision, learning goal and EvidencePolicy-safe initialization.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Current staged-before-scheduled contract | KEEP_AS_IS | all criteria HIGH |
| Inline edit with source context and batch toolbar | KEEP_AND_POLISH | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| Context selection → staged inbox item | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| “Save word” immediately creating a due card | REJECT_REFERENCE_PATTERN | TASK MEDIUM; CLARITY HIGH; LEARNING LOW; PRESERVATION LOW; MOBILE HIGH; ACCESSIBILITY HIGH |
| Separate inboxes per source type | REJECT_REFERENCE_PATTERN | TASK LOW; CLARITY LOW; LEARNING LOW; PRESERVATION LOW; MOBILE LOW; ACCESSIBILITY LOW |

### I. Synthesized OmniIELTS interaction direction

One Capture utility shows a compact count and opens an Inbox workspace. Each row prioritizes term/sense, source sentence, source identity, active/passive goal and warning state. Quick Confirm is available only when required fields/duplicate checks pass; otherwise the row explains what needs attention. Batch actions never hide per-item uncertainty. This **REINFORCES_STAGE3**.

### J. Mobile / responsive implications

Global capture opens a bottom sheet; the full Inbox uses one-card-at-a-time editing with batch selection via explicit control. The five-second Undo toast remains reachable and pausable. Source return action restores reader/video position.

### K. Accessibility implications

Focus enters the first field with context announced; validation is associated per field and summarized; Undo uses a live region plus focusable action; batch selection exposes count/status; swipe has equivalent buttons; source language/quotation boundaries are semantic.

### L. Capability-preservation risks

Auto-scheduling, loss of Step-6 custom capture, duplicate source-specific inboxes, swallowed degradation errors, inaccessible timeout on Undo, or removal of answer variants and goals.

### M. Anti-RPS / duplication assessment

Source-specific capture entry points are **C** states feeding one capability. Inline editing is **B**. More inbox routes/stores are **D/E**.

### N. Unresolved questions / owner decisions

Global Capture keyboard shortcut remains W2_TBD but is a W3 interaction detail, not an owner-level decision. Physical database consolidation remains Stage 6; W3 designs one user-facing Inbox.

## 15. Screen Class 06 — Error Notebook / Remediation

### A. Canonical job to be done

Show recurring error patterns with their original evidence and uncertainty, help the learner understand and remediate them, and support a clean later retry without declaring weakness or mastery from one event.

### B. Stage 3 upstream inputs

- **R1/R1S:** recurrence locates a persistent issue but not cause; one noisy attempt is insufficient; refutational guidance → clean isomorphic retry → delayed retry.
- **Requirements:** item dispute, uncertainty/sample size, error lifecycle and provenance.
- **R2:** heatmaps/charts current-capability awareness; generated isomorphic items future.
- **R3:** evaluator/source/attempt provenance gap.
- **R4:** weakness remains distinct from retention, mastery, ability and transfer.

### C. W0/W1/W2 binding constraints

Preserve 23-category map, filters, original context, duplicate normalization, recurrence weighting and Open/Practicing/Monitoring/Resolved/Ignored lifecycle. Remediation is formative and schedule false. Automated refutational explanation and generated isomorphic drills remain future.

### D. Current product/runtime truth

ErrorCandidate, repository and weakness-profile substrate exist, and IELTS/error bridges record contextual candidates. Current automation does not justify causal diagnosis or a fully generated remediation system.

### E. Material states / variants

HEATMAP; FILTERED_LIST; ERROR_DETAIL; SOURCE_CONTEXT; MANUAL_ENTRY; DISPUTED; REMEDIATION_PLAN; GUIDED_REMEDIATION; CLEAN_RETRY; MONITORING; RESOLVED; IGNORED; INSUFFICIENT_DATA; PROVENANCE_MISSING.

### F. Reference set

REF-028 Speechling localized dictation diff; REF-032 Khan diagnosis-to-next-action; REF-014 Anki time-separated evidence.

### G. Observed reference mechanics

Speechling makes the location of a mismatch actionable. Khan connects a diagnosed gap to a relevant lesson/challenge. Anki’s temporal views discourage interpreting one day as a general conclusion. OmniIELTS adapts localization/actionability while keeping cause and construct claims conservative.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Current error lifecycle and original-context detail | KEEP_AND_POLISH | all criteria HIGH except MOBILE MEDIUM |
| Heatmap → filtered list → evidence detail → remediation | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| “Why this may be happening” with uncertainty | RENAME_USER_FACING | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Generated explanation/drill represented as current | FUTURE_ONLY | TASK HIGH; CLARITY MEDIUM; LEARNING POTENTIALLY HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY MEDIUM |
| One error → weakness/mastered declaration | REJECT_REFERENCE_PATTERN | all substantive fit LOW |

### I. Synthesized OmniIELTS interaction direction

The overview shows categories by recurrence and recency, with an explicit insufficient-data state. Selecting a cell opens a list, then an evidence drawer with source, exact response, evaluator, assistance and history. The primary action starts a bounded remediation; a separate clean retry becomes available without being mandatory. Status changes are learner-visible and reversible. This **OPERATIONALIZES_STAGE3**.

### J. Mobile / responsive implications

Heatmap becomes a scrollable but table-equivalent summary, never the only entry. Category filters become chips/listbox; evidence opens in a full-height sheet; remediation replaces the sheet and Return to error preserves location.

### K. Accessibility implications

Heatmap has table/list text, counts and dates; error localization uses text/icon, not color; focus returns to selected error; new evidence announcements are non-intrusive; dispute and ignore are available without pointer gestures.

### L. Capability-preservation risks

Hiding original context, collapsing statuses, generating ungrounded causes, schedule mutation from remediation, inaccessible heatmap, or converting uncertainty into a rank.

### M. Anti-RPS / duplication assessment

Map/list/detail/remediation are **C** states of one notebook. Action launcher is **B**. A separate “weakness dashboard” duplicating Analytics and Error Notebook is **D**.

### N. Unresolved questions / owner decisions

No owner decision. Generated/refutational automation is FUTURE_ONLY and ARCHITECTURE_DEPENDENCY; W3 defines honest empty/loading/uncertain states.

## 16. Screen Class 07 — Analytics

### A. Canonical job to be done

Help the learner understand memory health, demonstrated skill, diagnostic patterns, IELTS performance estimates, transfer evidence, activity and pacing as distinct views, then offer an appropriate next action.

### B. Stage 3 upstream inputs

- **R1/R1S:** constructs are incommensurable; sparse data needs uncertainty; vanity activity is not learning evidence; delayed retention/transfer and calibration matter.
- **Requirements:** effectiveness, provenance, fairness and burden.
- **R2:** charts, heatmaps, radar, retention and adaptive capability awareness.
- **R3:** BKT/IRT/CAT and complete provenance are gaps.
- **R4:** reject unified product score; preserve distinct projections.

### C. W0/W1/W2 binding constraints

Preserve current retention/habit/activity and pacing actions, 52-week grid, and exam pacing calculator. Skill radar/confidence is future/partial; nine-field provenance drawer future. Analytics consumes receipts and launches remediation; it does not mutate schedule/schema directly.

### D. Current product/runtime truth

Progress/metrics, weak-profile and retention-related surfaces exist. Current evidence does not support a calibrated multi-model “mastery” dashboard or precise band prediction. Canonical status of a dedicated decay-curve renderer drifts and is handled conservatively as partial/current substrate.

### E. Material states / variants

OVERVIEW; RETENTION; ACTIVITY/HABIT; WEAKNESS; IELTS_PERFORMANCE; TRANSFER; PACING_CALCULATOR; PROVENANCE_DETAIL; INSUFFICIENT_DATA; STALE_DATA; OFFLINE; ACTION_HANDOFF. Time ranges and track/skill filters are variants.

### F. Reference set

REF-014 Anki statistics; REF-017 Quizlet progress groups; REF-032 Khan mastery/action loop.

### G. Observed reference mechanics

Anki keeps due, stability, difficulty, retrievability and activity separate and warns against overreading daily values. Quizlet offers simple actionable groups. Khan connects progress to a next lesson. OmniIELTS adapts separation/actionability but rejects broad “Mastered” terminology and one score.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Existing retention, habit grid, pacing and action launch | KEEP_AND_POLISH | TASK HIGH; CLARITY MEDIUM; LEARNING HIGH; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| Construct tabs with plain-language evidence subtitles | GROUP_RELATED_CAPABILITIES | all criteria HIGH except MOBILE MEDIUM |
| Insufficient-data and confidence disclosure | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Single overall mastery/IELTS readiness score | REJECT_REFERENCE_PATTERN | TASK LOW; CLARITY superficially HIGH; LEARNING LOW; PRESERVATION LOW; MOBILE HIGH; ACCESSIBILITY HIGH |
| Calibrated radar/provenance shown as current | FUTURE_ONLY | TASK MEDIUM; CLARITY MEDIUM; LEARNING MEDIUM; PRESERVATION HIGH; MOBILE LOW; ACCESSIBILITY MEDIUM |

### I. Synthesized OmniIELTS interaction direction

Begin with “What changed?” and “What can I do?” rather than a score wall. Present separate modules: Memory review health, Practice evidence, Error patterns, IELTS attempts, Transfer evidence, Habit/activity and Pace to target. Every chart has evidence basis, date range, sample size and an action. Future projections show insufficient/unavailable states until calibrated. This **REINFORCES_STAGE3**.

### J. Mobile / responsive implications

One module at a time with a compact view switcher; charts get summary values and details-on-demand; pacing calculator is a full sheet; tables remain horizontally navigable only when semantics demand it, with list alternatives.

### K. Accessibility implications

Charts have data tables/text summaries, not color-only series; focus order follows summary → filter → chart → action; range changes announced; uncertainty expressed in text; reduced motion removes animated counters.

### L. Capability-preservation risks

Dropping pacing calculator or 52-week grid, merging constructs, implying causal learning efficacy, showing future radar as current, or using activity volume as the primary headline.

### M. Anti-RPS / duplication assessment

Construct modules are **C** states in one Analytics destination. “Action cards” are **B**. Duplicating Error Notebook evidence or Today queue inside Analytics is **D**; link to those owners.

### N. Unresolved questions / owner decisions

No new owner decision. Retention target remains OD002; calibrated learner-model visualizations are FUTURE_ONLY and cannot dictate W3 numeric language.

## 17. Screen Class 08 — IELTS Listening

### A. Canonical job to be done

Provide an authentic, recoverable Listening exam runner and a clearly separate assisted practice runner without cross-mode control leakage or FSRS mutation.

### B. Stage 3 upstream inputs

- **R1/requirements:** auditory decoding differs from transcript-assisted work; official item types and micro-skills; strict vs learning mode; grounded feedback.
- **R2:** alignment/SBD and item-generation capabilities are not selected.
- **R3:** source/timestamp grounding, persistence and exact target/evaluator binding.
- **R4:** local/hosted degradation and provenance limits.

### C. W0/W1/W2 binding constraints

Exam: single play, no pause/scrub/transcript, 40-item palette, exactly two-minute check, deferred scorecard, app chrome removed. Practice: rewind/scrub/speed, post-attempt transcript and formative feedback. Checkpoint restores item/audio offset/responses/timer. Diagnostic-only, schedule false.

### D. Current product/runtime truth

Listening runner/question-activity source and browser/domain tests exist, with exam/practice launch paths. Current runner behavior is preserved; external player patterns apply only where the activity guard permits.

### E. Material states / variants

READY/PRECHECK; INSTRUCTIONS; EXAM_SINGLE_PLAY; PRACTICE_PLAYBACK; QUESTION_ACTIVE; PALETTE; REVIEW_MARKED; CONNECTIVITY_WARNING; RECOVERY_AVAILABLE; TWO_MINUTE_CHECK; SUBMITTING; SCORECARD; POST_ATTEMPT_TRANSCRIPT. Item variants follow official taxonomy.

### F. Reference set

REF-001, REF-003–008, REF-011 official IELTS/BC/IDP; REF-023–024 YouTube for accessible practice controls only; REF-035–036 WAI/WCAG.

### G. Observed reference mechanics

Official sources establish timer, navigation, notes/highlights where applicable, familiarisation and access arrangements. YouTube establishes robust keyboard/caption/player mechanics for practice, not exam. IDP/BC familiarisation supports a clear orientation before strict conditions.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Current strict/practice split and recovery | KEEP_AS_IS | all criteria HIGH |
| Pre-run familiarisation/equipment/audio check | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING MEDIUM; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Question palette with answered/review/current states | KEEP_AND_POLISH | all HIGH |
| Practice transcript/rewind/speed after activity guard | KEEP_AND_POLISH | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| Browser/player shortcuts that bypass exam lock | REJECT_REFERENCE_PATTERN | TASK LOW; CLARITY LOW; LEARNING LOW; PRESERVATION LOW; MOBILE LOW; ACCESSIBILITY LOW |

### I. Synthesized OmniIELTS interaction direction

Mode choice names consequences before entry: Practice supports learning tools; Exam simulates strict conditions. Exam shell shows only track/section, timer, palette, submit and allowed audio state. Practice uses the same question geometry but a different chrome, with assistance receipt and post-attempt review. Recovery copy states exactly what was restored. This **REINFORCES_STAGE3**.

### J. Mobile / responsive implications

Exam supports one primary question pane; palette is a full-height sheet; audio/timer remain pinned without obscuring content. Landscape is recommended but not a silent access lock. Practice transcript is a sheet after attempt or when explicitly allowed.

### K. Accessibility implications

Accessible audio checks; timer announcements at meaningful thresholds, not every second; palette state uses text/icons; current question heading/focus on navigation; access-arrangement-compatible timing state; no concealed transcript in accessibility tree; recovery announced.

### L. Capability-preservation risks

Pause/scrub leakage, transcript present but hidden by CSS, incorrect two-minute semantics, missing audio-offset recovery, global navigation in exam, practice result mutating FSRS.

### M. Anti-RPS / duplication assessment

Exam and practice are **C: STATE_OR_VARIANT_OF_EXISTING_CAPABILITY** sharing question components but using guarded shells. A separate duplicate listening engine is **D**.

### N. Unresolved questions / owner decisions

No owner decision. Official semantics govern. Accommodation support must not be confused with a generic exam pause control.

## 18. Screen Class 09 — IELTS Academic Reading

### A. Canonical job to be done

Support three academic passages and 40 questions under an authentic 60-minute exam, with adjustable reading/question space, reliable navigation/highlighting/recovery, and a separate learning review context.

### B. Stage 3 upstream inputs

- **R1/requirements:** comprehension over raw speed; exact item semantics; evidence/rationale is learning assistance.
- **R2:** ingestion/search/item-generation awareness only.
- **R3:** unaligned passage support and item/source grounding.
- **R4:** generated-item validation and distinct diagnostic evidence.

### C. W0/W1/W2 binding constraints

Exam has split pane, 60-minute hard timer, 10/5-minute warnings, 40-item palette, highlighting, auto-submit, and answer keys absent from DOM/ARIA. Explanation appears only in practice/post-submit. Diagnostic-only and reload-recoverable.

### D. Current product/runtime truth

Reading runner/question-activity source plus matching, single-select, objective-text and spatial tests exist. Academic/GT track launchers exist. The current substrate is preserved; W3 must make mode guards visible.

### E. Material states / variants

READY; PASSAGE_ACTIVE; QUESTION_ACTIVE; DIVIDER_RESIZE; HIGHLIGHT; PARAGRAPH_JUMP; PALETTE; REVIEW_MARKED; TIMER_WARNING; RECOVERY; AUTO_SUBMIT; SCORECARD; POST_ATTEMPT_EXPLANATION. Official question-type variants remain.

### F. Reference set

REF-001, REF-003–006, REF-008, REF-011 official IELTS/BC; REF-021 Reader keyboard/context; REF-034–036 W3C.

### G. Observed reference mechanics

British Council documents highlighting, notes, navigation, timer, font/color controls and right-side note behavior. Reader demonstrates keyboard-accessible paragraph/context actions, adapted only outside strict assistance guards.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Current 60-minute split runner, palette, checkpoints | KEEP_AND_POLISH | all HIGH; MOBILE MEDIUM |
| Adjustable split plus reset and keyboard control | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING MEDIUM; PRESERVATION HIGH; MOBILE LOW; ACCESSIBILITY HIGH |
| Notes/highlights with clear persistence scope | KEEP_AND_POLISH | all HIGH |
| Explanation popover during exam | REJECT_REFERENCE_PATTERN | substantive fit LOW |
| Separate duplicate runner for practice | REJECT_REFERENCE_PATTERN | TASK LOW; CLARITY LOW; PRESERVATION LOW |

### I. Synthesized OmniIELTS interaction direction

Use a stable passage/question shell. The divider changes emphasis without losing question/passage position. Palette, highlights and notes remain skill-authentic. Practice/post-submit can add rationale and error handoff in learning chrome; exam cannot. T/F/NG and Y/N/NG wording stays exact and context-specific. This **REFINES_STAGE3_PRESENTATION**.

### J. Mobile / responsive implications

Do not vertically stack an entire passage above all questions. Use Passage and Questions as two explicit panes with persistent return position, plus an optional split in landscape/tablet. Palette/notes are sheets; timer never obscures text.

### K. Accessibility implications

Keyboard divider with announced size; semantic passage headings/paragraph IDs; highlight has text list/export; palette has labels; timer thresholds; answer keys absent from DOM/ARIA; focus preservation between panes.

### L. Capability-preservation risks

Explanation leakage, lost highlights/recovery, inaccessible divider, hiding palette state in color, or using an Academic runner for GT scoring/material.

### M. Anti-RPS / duplication assessment

Question types and practice/review are **C** states of one runner. Paragraph jump/highlight are **B**. Separate runner implementations per question type are **D/E**.

### N. Unresolved questions / owner decisions

No owner decision. W3 safely explores mobile pane switching and notes placement within official constraints.

## 19. Screen Class 10 — IELTS General Training Reading

### A. Canonical job to be done

Support GT’s three-section progression, early multi-text material, 40 questions and 60-minute pacing with GT-specific conversion while sharing safe runner grammar with Academic.

### B. Stage 3 upstream inputs

Stage 3 treats reading mostly generically: item semantics, grounding, assistance separation, unaligned text and dispute paths. Current W1/W2 plus official GT evidence own the material and scoring differences.

### C. W0/W1/W2 binding constraints

Section 1/2 multi-document tabs, Section 3 longer text, continuous 60-minute timer, checkpointing, highlighting/palette and distinct GT raw-to-band conversion. Diagnostic-only. Do not reuse Academic content or conversion.

### D. Current product/runtime truth

Academic/GT track switch and shared Reading runner substrate exist. Spatial/matching/objective-text tests support material variants. A shared engine is current; visible material/scoring distinction must be preserved.

### E. Material states / variants

READY; SECTION_1_MULTI_TEXT; SECTION_2_WORKPLACE_TEXTS; SECTION_3_LONG_TEXT; TEXT_TAB; QUESTION_ACTIVE; PALETTE; TIMER_WARNING; RECOVERY; SUBMIT; GT_SCORECARD; POST_ATTEMPT_REVIEW.

### F. Reference set

REF-001, REF-005–006, REF-008–009 official IELTS/BC; REF-034–036 accessibility.

### G. Observed reference mechanics

Official GT format establishes the three-section structure, increasing difficulty, multi-text material, 60-minute/no-extra-transfer semantics. Computer UI mechanics can be shared with Academic without sharing content or score conversion.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Shared guarded Reading shell/components | GROUP_RELATED_CAPABILITIES | all HIGH |
| Explicit Academic/GT track identity in precheck and scorecard | KEEP_AND_POLISH | all HIGH |
| Compact document tabs with persistent scroll/question context | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING MEDIUM; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| Academic conversion/content reused for GT | REJECT_REFERENCE_PATTERN | all substantive fit LOW |

### I. Synthesized OmniIELTS interaction direction

Use the same trustworthy Reading interaction grammar while the prompt header, passage organization, content labels and score conversion are track-owned. Section 1 short texts use explicit document tabs/list; switching preserves scroll and selected question. This **ORTHOGONAL_TO_STAGE3** presentation is grounded in official evidence.

### J. Mobile / responsive implications

Text picker becomes a labeled sheet/list, not unlabeled swipes. Preserve current text/question positions independently. Use one pane at a time on narrow screens and tablet split when viable.

### K. Accessibility implications

Text tabs use a real tab/list pattern with clear names; screen reader announces section/text/question; conversion basis is explained; all Academic Reading accessibility guards apply.

### L. Capability-preservation risks

GT collapsed into Academic, wrong score conversion, lost multi-text context, or separate duplicated runner behavior drifting from shared recovery/accessibility.

### M. Anti-RPS / duplication assessment

GT is a **C** material variant of the shared Reading capability, not duplicate UX. GT scoring/content ownership remains distinct data/policy, not a new shell.

### N. Unresolved questions / owner decisions

No owner decision. Official GT semantics are binding reference input.

## 20. Screen Class 11 — Writing Task 1 Academic + GT

### A. Canonical job to be done

Support materially distinct Academic visual-report and General Training letter tasks inside one trustworthy writing workspace, with timed exam behavior and scaffolded practice/post-submit review.

### B. Stage 3 upstream inputs

- **R1/R1S:** models and feedback are scaffolds; revision is not novel-task transfer; correction timing is task-dependent.
- **Requirements:** Academic chart/process/map synthesis differs from GT audience/register/letter purpose; four-criterion feedback requires calibrated claims.
- **R2:** grammar/chart capabilities are awareness only.
- **R3:** local mechanical feedback cannot imply holistic band scoring; draft/revision persistence matters.
- **R4:** deterministic/local core with optional consented enhancement; OD001/007 remain.

### C. W0/W1/W2 binding constraints

Academic and GT variants both remain. Current editor, word counter, autosave/revision digests and table/container substrate are preserved. Academic deterministic six base visual families plus mixed configurations, validator and local renderer are Stage 4 target, not current implementation. Semantic table fallback is mandatory. Practice/post-submit may show rubric feedback; exam cannot.

### D. Current product/runtime truth

Writing runner source/tests exist for Academic and GT material. Current capability has structured/sample metadata and visual/container substrate, not the complete deterministic generator/validator/renderer claimed by some IA wording. GT letter support is current. W3 must separate current container from target generation.

### E. Material states / variants

TRACK_SELECT; ACADEMIC_VISUAL_PROMPT; GT_LETTER_PROMPT; PROMPT_READY; DRAFTING; AUTOSAVE/RECOVERY; WORD_WARNING; TABLE_FALLBACK; ZOOM/PAN; SUBMIT_CONFIRM; SUBMITTED; PRACTICE_RUBRIC; REVISION_HISTORY; OFFLINE/AI_UNAVAILABLE. Academic families and GT register/purpose variants are material.

### F. Reference set

REF-001, REF-003–006, REF-008, REF-010–011 official IELTS/BC; REF-034–036 W3C.

### G. Observed reference mechanics

Official sources establish 150-word expectation, approximate 20-minute allocation, visual-information reporting for Academic, letter purpose/register for GT, word count and computer orientation. Accessibility guidance supports semantic alternatives and focus-safe dialogs. No reference authorizes uncalibrated instant band scoring.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Shared writing shell with track-owned prompt material | GROUP_RELATED_CAPABILITIES | all HIGH |
| Existing autosave, word count, revision and recovery | KEEP_AND_POLISH | all HIGH |
| Semantic table toggle paired with visual prompt | KEEP_AND_POLISH | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| Practice outline/rubric after explicit mode/submit guard | PROGRESSIVELY_DISCLOSE | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Complete renderer represented as current | FUTURE_ONLY | TASK LOW as a current claim; PRESERVATION HIGH by honesty |
| Continuous AI correction while drafting exam | REJECT_REFERENCE_PATTERN | substantive fit LOW |

### I. Synthesized OmniIELTS interaction direction

Use one writing lab with an unmistakable Academic/GT material header. Prompt and task checklist own the left/context pane; draft, count and save state own the primary pane. Academic visual always has a semantic table alternative. Practice can expose planning and post-submit rubric layers; exam stays clean and disables writing assistance. Feedback identifies evidence basis and uncertainty rather than asserting a precise band. This **OPERATIONALIZES_STAGE3**.

### J. Mobile / responsive implications

Prompt and draft are separate switchable panes with a persistent task-summary strip; avoid shrinking a chart and editor side by side. Table view is primary accessibility/mobile fallback. Save state and count remain visible without covering the keyboard.

### K. Accessibility implications

High-contrast data visualization plus semantic table; meaningful chart title/axes/series descriptions; keyboard zoom/reset; autosave announcements throttled; warnings not color-only; dialog focus restoration; spelling/grammar aids guard-aware.

### L. Capability-preservation risks

Losing GT, implying target renderer current, omitting semantic table, practice rubric leaking into exam, AI/provider hardcoding, lost revision digests, or autosave/recovery ambiguity.

### M. Anti-RPS / duplication assessment

Academic/GT are **C** material variants in one writing capability. Chart/table are **C** views of one prompt. A separate GT writing product or duplicate editor is **D**. Deterministic generation is **A** and FUTURE_ONLY until authorized implementation.

### N. Unresolved questions / owner decisions

Provider and degradation remain OD001/007 but do not block W3 provider-neutral states. Current/future renderer conflict is resolved by conservative labeling, not owner choice.

## 21. Screen Class 12 — Writing Task 2

### A. Canonical job to be done

Support planning, drafting and submitting a 250-word essay, with optional practice scaffolds and post-submission four-criterion review while preserving strict exam conditions and shared full-writing timing.

### B. Stage 3 upstream inputs

R1/R1S and requirements emphasize argument development, cohesion, independent fresh-essay transfer, timing-sensitive feedback, and the contamination caused by model answers/target-revealing critique. R2/R3/R4 constrain grammar/holistic scoring and provider claims.

### C. W0/W1/W2 binding constraints

Standalone allocation is about 40 minutes; Full Writing shares one 60-minute timer across Tasks 1 and 2. Practice may expose an outline drawer and post-attempt rubric. Exam disables spellcheck/grammar underlines and defers feedback. Diagnostic-only, schedule false.

### D. Current product/runtime truth

Writing runner supports Task 2 prompt/draft/word count/submission and practice/exam paths. Future calibrated holistic evaluation is not established current.

### E. Material states / variants

PROMPT_READY; OUTLINE_ACTIVE; DRAFTING; AUTOSAVE/RECOVERY; UNDER_250_WARNING; SHARED_TIMER; SUBMIT_CONFIRM; SUBMITTED; RUBRIC_SELF_CHECK; FOUR_CRITERION_FEEDBACK; RETRY_NEW_PROMPT. Question-type variants remain content, not separate screens.

### F. Reference set

REF-001, REF-003–006, REF-008, REF-010–011; REF-034–036.

### G. Observed reference mechanics

Official sources establish task length, time priority, word count and scoring-context expectations. Computer UI guidance supports note orientation and automatic word count. OmniIELTS adds learning scaffolds only outside strict mode.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Current draft/count/autosave/recovery shell | KEEP_AND_POLISH | all HIGH |
| Practice-only outline drawer and post-submit rubric | PROGRESSIVELY_DISCLOSE | all HIGH; MOBILE MEDIUM |
| Shared Writing timer with explicit task allocation | KEEP_AS_IS | all HIGH |
| Authoritative instant band from uncalibrated evaluator | REJECT_REFERENCE_PATTERN | substantive fit LOW |
| Model answer visible before independent submit | REJECT_REFERENCE_PATTERN | LEARNING LOW; PRESERVATION LOW |

### I. Synthesized OmniIELTS interaction direction

Keep prompt, time, word count and save status stable. Practice offers Plan, Draft and Review phases without forcing them; Exam shows prompt and editor only. Post-submit review separates rubric criteria, grounded mechanical observations and optional uncalibrated coaching. A fresh-prompt transfer action remains distinct from “revise this draft.” This **REINFORCES_STAGE3**.

### J. Mobile / responsive implications

Prompt/task card collapses to a pinned summary; full prompt opens in a sheet; outline and rubric are mutually exclusive sheets; draft remains the main surface. Prevent keyboard from obscuring count/save/timer.

### K. Accessibility implications

Semantic editor labels/instructions; keyboard-safe outline; warning announced once at threshold; autosave/recovery text; timer accommodations; no reliance on grammar underlines/color; rubric headings and evidence quotes are navigable.

### L. Capability-preservation risks

Breaking shared timer, feedback leakage, losing autosave, conflating revision with transfer, provider selection, or word-count warning becoming a submit lock.

### M. Anti-RPS / duplication assessment

Plan/Draft/Review are **C** states. A separate essay-planning route is **D**. Future holistic scoring is **A/FUTURE_ONLY**, not another current tab.

### N. Unresolved questions / owner decisions

No new owner decision. Automated evaluation remains provider/calibration dependent and must be represented as optional/future.

## 22. Screen Class 13 — Speaking

### A. Canonical job to be done

Support current guided IELTS Parts 1–3 practice with recording, timing, persistent Part 2 notes and post-session review, while reserving an honest future interactive examiner that never claims to be official.

### B. Stage 3 upstream inputs

- **R1/R1S:** rehearsal, shadowing and recording/playback do not establish spontaneous transfer; pronunciation should support intelligibility rather than accent conformity.
- **Requirements:** FC/LR/GRA/Pronunciation distinctions, accent/device fairness, Parts 1–3, consent and recovery.
- **R2:** ASR/VAD/alignment awareness only.
- **R3:** audio lifecycle, evaluation provenance, mobile/device variability.
- **R4:** audio/provider/degradation decisions and calibration limits.

### C. W0/W1/W2 binding constraints

Current guided path: Part 1 → Part 2 prep 60 seconds with notes → response 120 seconds with alert → Part 3 → audio review/export → diagnostic feedback. Notes remain visible while recording. Interactive examiner is OWNER_RECONFIRMED_FUTURE with connecting/examiner-turn/learner-turn/silence-recovery/follow-up/review. All speaking diagnostic-only. Raw audio ephemeral/manual export.

### D. Current product/runtime truth

Speaking runner and browser tests exist for guided practice/exam-like paths. Interactive realtime examiner/provider is not current. Current UI can record/review segments and must retain disclaimer/evidence isolation.

### E. Material states / variants

PRECHECK/MIC_PERMISSION; PART1; PART2_PREP; PART2_RECORDING; PART3; RECORDING_PAUSED/FAILED; SEGMENT_REVIEW; EXPORT; UNEXPORTED_EXIT_CONFIRM; FEEDBACK; AI_UNAVAILABLE. Future: CONNECTING; EXAMINER_TURN; LEARNER_TURN; SILENCE_RECOVERY; FOLLOW_UP; SESSION_REVIEW.

### F. Reference set

REF-002, REF-005, REF-007–008 official IELTS/BC/IDP; REF-027 Speechling; REF-029 ELSA; REF-030 Yoodli; REF-031 YouGlish; REF-035–036.

### G. Observed reference mechanics

Official IELTS owns timing, human-examiner reality and criterion semantics. Speechling supplies the listen-record-replay-compare loop. ELSA illustrates localized pronunciation feedback; Yoodli illustrates grouped post-session delivery/roleplay; YouGlish provides authentic comparison examples. None provides official IELTS equivalence or an EvidencePolicy shortcut.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Guided Parts 1–3, notes, recording/review/export | KEEP_AND_POLISH | all HIGH; MOBILE MEDIUM |
| Precheck with mic, environment, privacy and export explanation | ADAPT_FROM_REFERENCE | all HIGH |
| Post-session feedback grouped by criterion/evidence | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY MEDIUM |
| Localized listen-record-compare support in practice | ADAPT_FROM_REFERENCE | all HIGH; ACCESSIBILITY MEDIUM |
| AI avatar framed as official examiner or live current capability | FUTURE_ONLY | substantive fit LOW as a current claim |
| Accent conformity score | REJECT_REFERENCE_PATTERN | TASK LOW; LEARNING LOW; ACCESSIBILITY LOW |

### I. Synthesized OmniIELTS interaction direction

Current guided Speaking uses a clear stage rail and one action per turn. Part 2 notes remain pinned during the two-minute response. Each segment can be replayed/exported or retried, with retry labeled practice rather than replacing the original receipt. Post-session feedback separates criterion observations, source evidence and uncertainty. Future examiner uses natural turn-taking and explicit interruption/silence recovery, always labeled simulation. This **OPERATIONALIZES_STAGE3**.

### J. Mobile / responsive implications

Large record control, timer and prompt occupy the main pane; notes are a persistent collapsible region or sheet that never disappears during Part 2. Keep screen awake where permitted and provide recovery if backgrounding interrupts audio. Export/exit confirmation fits one-hand use.

### K. Accessibility implications

Mic state announced and visually/textually clear; record controls have explicit start/stop labels; waveform has transcript/time alternative where available; timing accommodates approved arrangements; notes keyboard/screen-reader reachable during recording; feedback is non-color and avoids accent bias claims.

### L. Capability-preservation risks

Losing pinned notes, auto-persisting raw audio, no export warning, future examiner shown as current, provider hardcoding, “official” implication, or coached retry overwriting original diagnostic receipt.

### M. Anti-RPS / duplication assessment

Parts and segment review are **C** states. Guided practice and future examiner share screen ownership but future examiner is **A/FUTURE_ONLY**. Pronunciation coaching belongs contextually here and Screen 2, not a duplicate evidence engine.

### N. Unresolved questions / owner decisions

The “1:45 alert” is ambiguous between elapsed and remaining time. Require canonical timing clarification before W3 validation; this is not promoted to an owner decision. Provider/model/ASR stays Stage 5.

## 23. Screen Class 14 — Full Mock

### A. Canonical job to be done

Run a high-integrity, recoverable simulation across Listening, Reading, Writing and the canonical Speaking component/transition policy, then provide one deferred multi-skill scorecard and remediation handoff.

### B. Stage 3 upstream inputs

Full mock is assessment, not teaching. Objective and constructed-response skills have different evaluation semantics; micro-skill gain is not holistic band gain; repeated mocks can cause fatigue and must not replace targeted remediation.

### C. W0/W1/W2 binding constraints

Precheck → Listening → transition → Reading → transition → Writing → Speaking component → final scorecard/remediation. Application chrome and assistance are removed. Section-specific locks/timers apply. Reload restores exact section/question/responses/timer/audio state. Direct entry remains despite preparation suggestions. Diagnostic-only and deferred feedback.

### D. Current product/runtime truth

Full-mock orchestrator and browser/domain tests exist. Current shell and section runners are preserved. Canonical documents conflict on whether Speaking is sequential immediately after LRW or independently scheduled.

### E. Material states / variants

PRECHECK; EQUIPMENT_CHECK; READY; L_SECTION; LR_TRANSITION; R_SECTION; RW_TRANSITION; W_SECTION; SPEAKING_PENDING/SECTION; RECOVERY; AUTO_SUBMIT; FINAL_SCORECARD; REMEDIATION_HANDOFF; ABORT_CONFIRM. Academic and GT material variants are preserved.

### F. Reference set

REF-001, REF-003–008, REF-011 official IELTS/BC/IDP; REF-034–036 W3C.

### G. Observed reference mechanics

Official familiarisation supports orientation and test-like end-to-end practice. Official delivery establishes skill semantics, timings and access arrangements. OmniIELTS adds explicit recovery and remediation handoff without adding in-run coaching.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Current strict orchestrator, checkpoints and app-chrome removal | KEEP_AS_IS | all HIGH |
| Precheck with expected duration, equipment, recovery and exit policy | ADAPT_FROM_REFERENCE | all HIGH |
| Deferred scorecard → targeted remediation | KEEP_AND_POLISH | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| Preparation recommendation plus Continue anyway | KEEP_AND_POLISH | all HIGH |
| In-run feedback, streak, navigation or vocabulary tools | REJECT_REFERENCE_PATTERN | all substantive fit LOW |

### I. Synthesized OmniIELTS interaction direction

Before start, state duration, section order, equipment, allowed recovery and data policy. Once begun, show only skill-authentic controls. Transitions confirm saved state and next section without teaching content. Final scorecard separates observed results, limitations and action links; it never updates FSRS. This **REINFORCES_STAGE3**.

### J. Mobile / responsive implications

Do not silently pretend every full mock is equally usable on a small phone. Provide a compatibility/precheck recommendation with Continue anyway when technically supported. Each runner uses single-focus panes; palette/scratchpad sheets do not recreate app navigation.

### K. Accessibility implications

Precheck surfaces accommodation/timing expectations; timer warnings are meaningful; focus restores after recovery; every palette/status has text; no forced motion; answer keys/assistance absent; abort confirm does not trap or erase without consent.

### L. Capability-preservation risks

Chrome leakage, partial recovery, cross-section timer errors, practice controls, immediate feedback, schedule mutation, or ambiguous completion when Speaking is separately scheduled.

### M. Anti-RPS / duplication assessment

Full Mock is **B: IMPROVED_PRESENTATION_OF_EXISTING_CAPABILITY** orchestrating existing runners, not duplicate runners. Scorecard is a shared terminal state, not another Analytics implementation.

### N. Unresolved questions / owner decisions

Speaking sequencing materially changes completion, recovery and scorecard ownership; resolve in OD-PREW3-001.

## 24. Screen Class 15 — Settings / Privacy / Data Safety

### A. Canonical job to be done

Let learners understand and control learning preferences, assistance/provider consent, session-only credentials, accessibility, offline/degraded behavior, audio export, backup/restore and system governance without exposing implementation complexity.

### B. Stage 3 upstream inputs

- **R1/R1S:** retention/streak values unfrozen; understandable agency and non-punitive re-entry.
- **Requirements:** consent/revocation, accessibility/fairness, provenance, recovery, privacy.
- **R2:** hosted facts are time-sensitive and no provider is selected.
- **R3:** secrets/device handles excluded from durable stores/backups; current multi-store backup/recovery; database choice deferred.
- **R4:** OD001/002/004/005/007; W2 resolves OD006.

### C. W0/W1/W2 binding constraints

Preferences, consent/revocation, session-only key, backup export, validated atomic/recoverable restore, degraded mode, diagnostics, and governance audit remain. Secrets never enter durable storage or backup. Settings/About owns the moved roadmap runtime inspector. UI is provider-neutral. Audio is ephemeral with manual export.

### D. Current product/runtime truth

Current app has learning/audio/FSRS settings, Gemini model/key copy with sessionStorage key, backup export/restore substrate, diagnostics and settings dialog. Provider-specific current copy reflects runtime history but is not authority to select a Stage 5 provider. Backup registry completeness and recovery contracts must be preserved.

### E. Material states / variants

OVERVIEW; LEARNING_PREFS; RETENTION_WORKLOAD_PREVIEW; ACCESSIBILITY; CONSENT; KEY_SESSION_ACTIVE; CLOUD_UNAVAILABLE; OFFLINE_CORE; AUDIO_POLICY; BACKUP_EXPORT; RESTORE_PREFLIGHT; RESTORING; RESTORE_RECOVERY; STORAGE_DEGRADED; GOVERNANCE_AUDIT; ABOUT. Revoked/expired/unavailable states are material.

### F. Reference set

REF-013 Anki deck options; REF-033 Google Takeout; REF-008 IELTS access arrangements; REF-034–036 W3C.

### G. Observed reference mechanics

Anki connects requested retention to workload consequences. Takeout separates selecting/exporting data from deletion and explains archive state. IELTS access arrangements show that timing/accessibility can require explicit supported settings. W3C governs focus, target and interaction accessibility.

### H. KEEP / ADAPT / REJECT decisions

| Pattern | Decision | Fit assessment |
|---|---|---|
| Session-only secret containment and validated backup/restore | KEEP_AS_IS | all HIGH |
| Workload preview next to retention preference | ADAPT_FROM_REFERENCE | TASK HIGH; CLARITY HIGH; LEARNING HIGH; PRESERVATION HIGH; MOBILE MEDIUM; ACCESSIBILITY HIGH |
| One Data & Safety section for export/restore/privacy/audio | GROUP_RELATED_CAPABILITIES | all HIGH |
| Provider-neutral Local / Opt-in Cloud / Offline Fallback copy | RENAME_USER_FACING | all HIGH |
| Advanced diagnostics/governance in About | REHOME | TASK MEDIUM; CLARITY HIGH; PRESERVATION HIGH; MOBILE HIGH; ACCESSIBILITY HIGH |
| API/provider/DB internals as required learner choices | REJECT_REFERENCE_PATTERN | TASK LOW; CLARITY LOW; LEARNING LOW; PRESERVATION MEDIUM; MOBILE LOW; ACCESSIBILITY LOW |

### I. Synthesized OmniIELTS interaction direction

Organize Settings by learner intent: Learning & workload; Audio & media; Accessibility; AI & consent; Data & recovery; Notifications/habit; About & system audit. Each risky change previews effect and supports cancel. Cloud status is calm and non-blocking. Export says what is included/excluded; restore validates before replacement and explains recovery. This **OPERATIONALIZES_STAGE3**.

### J. Mobile / responsive implications

Use drill-in sections rather than one long desktop form. Keep save scope explicit; destructive restore/revoke actions have clear confirmation; progress/recovery survives app backgrounding. Session-only credential state is visible without revealing value.

### K. Accessibility implications

Settings are native form controls with descriptions/errors; contrast/type/reduced-motion preferences apply immediately with reversible preview; modal focus contract follows REF-034; restore progress and failures use live regions; export content list is readable.

### L. Capability-preservation risks

Persisting secrets, incomplete backup, destructive restore without preflight/journal, removing governance audit, provider hardcoding, physical database terminology exposed as product IA, or ephemeral audio policy obscured.

### M. Anti-RPS / duplication assessment

Settings categories are **C** views of one utility. Governance is **REHOME**, not a new top-level destination. A separate AI app, backup app or accessibility route is **D/E**.

### N. Unresolved questions / owner decisions

Canonical OD001/002/004/005/007 remain at their assigned gates. W3 keeps parameter/provider-neutral states. No new trivial owner decision is raised.

## 25. Cross-Surface Interaction Language

### 25.1 Navigation

- **Learning shell:** desktop rail for Today, Learn, IELTS, Library, Progress/Analytics; utility dock for Capture, Search and Settings. Mobile has five 48×48 minimum destinations: Today, Learn, IELTS, Library, Progress.
- **Exam shell:** application rail/header/search/player unmounted. Only skill-authentic timer, track/section, question palette and submit controls remain.
- **Direct reachability:** every destination, practice mode, section practice and full mock remains directly reachable. Recommendations never become authorization checks.
- **Context return:** Reader/Media → Capture → source; Error/Analytics → Remediation → evidence; Today → activity → summary; Mock → scorecard → remediation.

### 25.2 Action hierarchy

1. One primary next action, phrased as an action.
2. Visible agency actions: Choose another, Skip, Change activity, Exit.
3. Advanced tools: source detail, notation, filters, diagnostics, export, provenance.
4. Contextual recovery: retry load, restore checkpoint, export before exit, continue offline.

Destructive or evidence-changing actions include a consequence statement. Disabled controls explain why and how to recover.

### 25.3 Selection and contextual tools

- Selection changes context; it does not navigate unless explicitly activated.
- Text/media selections open a compact context toolbar on desktop and an accessible sheet on mobile.
- Mode/variant selectors preserve source, item, cursor, playback, draft and scroll context when semantics allow.
- Tabs are used only for peers at one level, not as a universal feature-container.

### 25.4 Assistance and feedback

- Assistance is a persistent attempt state: Unassisted, Light assistance, Scaffolded, Answer revealed/Post-attempt review.
- Every outcome surfaces its evidence consequence in plain language: “Practice result only,” “Assisted—review schedule unchanged,” or “Potentially eligible—policy checks pending.”
- Feedback order is Verify → Explain/Elaborate → Contrast/Refute → Scaffold. Layers appear only when appropriate and never imply that all four are current automation.
- Retry is available, never forced; original receipt is retained.

### 25.5 Error and recovery

- Errors explain: what happened, what remains safe, and the next recovery action.
- Connectivity uses calm states: Online full, Offline local ready, Cloud unavailable, Request queued, Local fallback, Storage degraded, Recovery available.
- Recovery restores the smallest honest checkpoint and tells the learner exactly what was restored.
- Undo is time-limited only when pausable/focusable and has a durable alternative for destructive operations.

### 25.6 Progress language

Use separate labels:

- **Memory:** due, retrievability, stability, review health.
- **Demonstrated skill:** observed performance on a qualified activity.
- **Diagnostic:** recurring error pattern / insufficient evidence.
- **IELTS estimate:** attempt-derived performance estimate with basis and uncertainty.
- **Transfer:** new or varied context evidence.
- **Engagement:** activity, time, habit.

Do not use “mastered” without the narrow evidence construct immediately visible.

### 25.7 Overlay grammar

- Popover: brief contextual, non-blocking choice.
- Drawer/rail: inspect or edit context while preserving main task.
- Bottom sheet: mobile contextual tools with a visible non-swipe close.
- Modal: consequence-bearing choice that requires focus containment.
- Full-screen runner: integrity-sensitive activity, not a generic modal.

All overlays trap focus only when modal, support Escape when safe, restore focus, preserve drafts, and never use hidden CSS as answer concealment.

### 25.8 Information density

One primary workspace may own many capabilities, but only relevant controls appear. The system exposes capability by context, search and direct activity selection—not by placing every feature card on the home screen.

## 26. Mobile / Responsive Synthesis

### 26.1 Global grammar

- Five stable bottom destinations; Capture/Search/Settings are utilities.
- Active mini-player docks above navigation in the safe area and is absent without an active media session.
- Context rails become sheets; exam chrome remains removed.
- 48×48 minimum targets, visible focus, no gesture-only actions.
- Preserve state across orientation, app backgrounding and sheet transitions.

### 26.2 Surface recomposition

| Surface | Narrow-screen composition | Trade-off / guard |
|---|---|---|
| Today | Featured recommendation first; alternatives as list; workload sheet | Avoid endless feature cards |
| Vocabulary | One prompt/input; source/mode sheets; sticky submit | Matching needs sequential accessible fallback |
| Media | Player/current cue + task; transcript/noticing sheets | Never stack player, rail and six tools |
| Reader | Single reading column; selection sheet | Preserve return position |
| Capture | Quick sheet; full one-item editing | Batch actions remain explicit |
| Errors | Summary/list first; detail full sheet | Heatmap needs text alternative |
| Analytics | One module/view; data summaries | No miniature desktop dashboard |
| Listening | Question pane; palette sheet; pinned timer/audio | Strict guard survives native/player shortcuts |
| Reading | Passage/Questions pane switch; optional tablet split | Do not place full passage above questions |
| Writing | Draft primary; prompt/outline/rubric sheets | Keyboard must not cover count/save/timer |
| Speaking | Prompt/timer/record primary; pinned notes region | Background/mic interruption recovery |
| Full Mock | Precheck then single-focus runner | Compatibility recommendation is not a global lock |
| Settings | Drill-in groups with local save scope | Restore/export progress survives backgrounding |

### 26.3 No breakpoint decision

W3 may test breakpoints and device classes. This synthesis specifies behavioral recomposition, not pixel thresholds.

## 27. Accessibility Synthesis

### 27.1 Keyboard and focus

- Full keyboard paths for navigation, player, question palette, split divider, recording, matching, charts and every overlay.
- Modal focus contained; Escape closes when non-destructive; focus returns to trigger.
- Route/activity start moves focus to a meaningful heading, not the document top by accident.
- Exam guards intercept conflicting shortcuts without disabling ordinary keyboard access.

### 27.2 Announcements and non-color state

- Live regions for timer thresholds, recording changes, answer verification, recovery and storage/connectivity changes.
- Correct/incorrect, assisted/unassisted, answered/review, offline/cloud and uncertainty use text/icon plus color.
- Avoid per-second timer announcements and noisy autosave speech.

### 27.3 Media and recording

- Accessible captions/transcripts, player controls, rate and seek where allowed.
- Waveforms have time/text alternatives.
- Strict Dictation targets and exam answer keys are absent from DOM and accessibility tree before allowed reveal.
- Recording permission, active state, failure and ephemeral/export consequence are explicit.

### 27.4 Timed assessment

- Warnings are meaningful and focus-independent.
- Supported access arrangements can alter authorized timing/audio behavior without being confused with ordinary assistance.
- Auto-submit, recovery and remaining/elapsed semantics are exact and testable.

### 27.5 Visual, motor and cognitive access

- Minimum 48×48 targets; focus not obscured; zoom/reflow; adjustable reading typography.
- Reduced motion replaces flips, slides and animated counters with direct state changes.
- Charts and Task 1 visuals include semantic tables/text summaries.
- Error messages identify the field/action and recovery.
- Guidance is concise; advanced controls are progressive, not hidden from search/keyboard.

## 28. Anti-RPS / Duplication Register

| ID | Recommendation | Classification | Disposition |
|---|---|---|---|
| ARPS-01 | Today backlog branch | C — STATE_OR_VARIANT_OF_EXISTING_CAPABILITY | Keep in Today; no catch-up route |
| ARPS-02 | Vocabulary modalities | C | One canvas with contextual activity state |
| ARPS-03 | Media six modes | C | One persistent source workspace |
| ARPS-04 | Guided seven-step | C | Optional orchestrated state, not new product |
| ARPS-05 | Strict/Practice Dictation | C | Shared presentation, distinct integrity/assistance |
| ARPS-06 | Reader Inbox/Later/Archive | C | Source lifecycle states, one library |
| ARPS-07 | Source-specific capture | C | Feed one Capture Inbox |
| ARPS-08 | Error heatmap/list/detail/remediation | C | One notebook flow |
| ARPS-09 | Analytics constructs | C | One destination with separate views, no unified score |
| ARPS-10 | IELTS practice/exam | C | Shared activity components, guarded shells |
| ARPS-11 | Academic/GT Reading | C | Shared runner grammar, distinct material/scoring |
| ARPS-12 | Task 1 Academic/GT | C | One writer, distinct material variants |
| ARPS-13 | Writing Plan/Draft/Review | C | Practice phases, not routes |
| ARPS-14 | Speaking Parts/segment review | C | One center; future examiner A/FUTURE_ONLY |
| ARPS-15 | Full Mock | B — IMPROVED_PRESENTATION_OF_EXISTING_CAPABILITY | Orchestrates existing skill runners |
| ARPS-16 | Settings categories | C | One utility; governance rehomed |
| ARPS-17 | Global search, packs, lexical graph | B/current-secondary or A/future | Preserve cross-surface ownership; do not invent three top-level screens |
| ARPS-18 | “More practice” capability group | B | Progressive discovery, not a feature-card wall |

No recommendation requires a duplicate store, parallel practice engine, source library, IELTS runner, analytics engine, or top-level destination.

## 29. Capability Preservation Risk Register

| Risk ID | Risk | Screens | Severity | Required W3 guard |
|---|---|---|---|---|
| CPR-01 | Guidance becomes navigation lock | 01–03, 14 | HIGH | Always-visible alternative/direct entry |
| CPR-02 | FSRS treated as whole-skill mastery | 01, 02, 07 | HIGH | Construct-specific language and receipts |
| CPR-03 | Assistance not persisted or disclosed | 02, 03, 06–13 | HIGH | Orthogonal assistance state in every attempt |
| CPR-04 | Current/future drift | 02, 04, 06, 07, 11, 13 | HIGH | Visible status annotations in W3 source spec |
| CPR-05 | Media context lost on mode change | 03 | HIGH | Preserve source/revision/cue/position/rate/draft |
| CPR-06 | Strict answer present in DOM/ARIA | 03, 08, 09, 10, 14 | HIGH | Remove from rendered/accessibility tree |
| CPR-07 | Capture bypasses confirmation/provenance | 03–05 | HIGH | Staged-before-scheduled contract |
| CPR-08 | One event becomes weakness/mastery | 06, 07 | HIGH | Insufficient-data and history views |
| CPR-09 | IELTS practice tools leak into exam | 08–14 | HIGH | Separate shells and state guards |
| CPR-10 | Academic and GT material/scoring collapse | 10, 11, 14 | HIGH | Track-owned content/conversion |
| CPR-11 | Draft/audio recovery loss | 03, 11–14 | HIGH | Journals/checkpoints and explicit restored scope |
| CPR-12 | Raw audio persisted without consent | 03, 13, 15 | HIGH | Ephemeral/manual export/exit confirm |
| CPR-13 | Mobile becomes stacked desktop | all | HIGH | Per-surface recomposition in Section 26 |
| CPR-14 | Charts/heatmaps are color/visual only | 06, 07, 11 | HIGH | Table/text equivalents |
| CPR-15 | 12 omission invariants lost | cross-app | HIGH | W3 checklist and traceability matrix |
| CPR-16 | Secondary preserved surfaces orphaned | 02, 04, 07, 08–15 | HIGH | Explicit owners for vocabulary bank, Hub, packs, search, lexical graph, section practice |
| CPR-17 | Backup simplicity hides incomplete/unsafe restore | 15 | HIGH | Full registry, preflight, atomic recovery |
| CPR-18 | Provider/architecture selected by product copy | 03, 11–15 | MEDIUM | Provider-neutral UI and dependency labels |

## 30. Stage 3 Conflict Register

Current canonical Stage 4 authority wins execution constraints. Upstream evidence is retained, not erased.

| Conflict ID | Stage 3 input | Current Stage 4 authority | Reference evidence | Conflict | Materiality | Proposed disposition | Owner decision required |
|---|---|---|---|---|---|---|---|
| S3C-01 | R4 embedded header says candidate/pending audit | MASTER_ROADMAP Section 8, ADR-054 and integrated W0–W2 treat accepted Stage 3 as closed input | None needed | Metadata is stale relative to canonical closure | HIGH provenance | Consume content as accepted historical input; do not propagate stale status | NO |
| S3C-02 | Requirements says research input/non-implementation; constraints says owner guidance | R4 registry loosely calls both canonical inputs | None | “Canonical” could be misread as empirical/execution authority | HIGH authority | Requirements is immutable RESEARCH_INPUT_ONLY; constraints is owner guidance; neither overrides W0–W2 | NO |
| S3C-03 | Original A–H clusters cover exercise, instruction, learner model, curriculum, cross-cutting, OSS, effectiveness, lifecycle | R4 Section 13 reuses A–H for supplemental families and misroutes IDs | None | Namespace collision can erase accessibility/OSS/lifecycle obligations | HIGH coverage | Carry both namespaces and original IDs explicitly | NO |
| S3C-04 | R1 registry marks F010/F035/F038 as inference and narrowly states F045; requirements/R1S carry provenance superset | R4 upgrades/paraphrases classes and narrows exact provenance fields | W3C/official sources do not resolve research identity | Semantic/epistemic drift | HIGH evidence integrity | Original R1/R1S/requirements identity wins; W2 exact EvidencePolicy controls UX | NO |
| S3C-05 | R2/R3 treat layout-aware ingestion as capability/gap | IA tree can read PDF/EPUB ingestion as CURRENT_REHOMED; W2/J-04 say raw text/SRT current, structured parser future | Reader products demonstrate mature ingestion but not OmniIELTS current truth | Current/future contradiction | HIGH truth | Label raw/pasted/SRT current; structured PDF/EPUB FUTURE_ONLY | NO |
| S3C-06 | R2 charts and R4 Task 1 local deterministic requirement are future feasibility/target | Some IA/Journey wording implies current renderer/zoom/table; runtime has container/sample substrate | Official IELTS requires visual+data task, W3C supports table alternative | Current container confused with complete generator/validator/renderer | HIGH preservation | Preserve current editor/container/table substrate; label deterministic family system STAGE4_TARGET | NO |
| S3C-07 | R1S supports elaborated/refutational feedback as conditional design inference | W2 says four-tier partial/target; some W1 text says it appears as active behavior | Learning products show layered feedback, not OmniIELTS completeness | Future/partial feature hardened | MEDIUM/HIGH | Specify feedback hierarchy; annotate unsupported automated layers FUTURE_ONLY | NO |
| S3C-08 | R1/R4 require construct separation and uncertainty | W2 calls retention curve current; W0 capability matrix calls retention visualization partial; runtime lacks calibrated multi-model radar/provenance | Anki supports separate memory stats only; Khan terminology not portable | Status and semantic overreach risk | HIGH | Preserve current progress/retention substrate; future-label calibrated radar/provenance and avoid one score | NO |
| S3C-09 | R1S says backlog/grace values uncalibrated | W1/W2 describe >50, 20-card catch-up and one-day grace while R4 OD003/004 remain provisional | Anki shows configurable workload; Duolingo path/streak cannot settle policy | Provisional values look ratified | HIGH policy | W3 uses variables/options, not fixed canonical values | YES — existing R4-OD003/004 |
| S3C-10 | Stage 3: unassisted necessary but insufficient; qualified retrieval can be evidence | IA broad Learn table says FSRS stability suppressed; W2 activity-specific semantics permit qualified unassisted vocabulary review | Reference self-rating systems do not control | Broad label conflicts with precise policy | HIGH evidence | W2 default-deny activity-specific rule wins; avoid broad “Learn never updates” copy | NO |
| S3C-11 | Stage 3 speaking timing follows official Part 2 one-minute prep/up-to-two-minute response but does not settle alert | W1/W2 say “1:45 alert”; one phrase says “1:45 remaining” | REF-002 confirms total timing, not internal alert | Elapsed-vs-remaining ambiguity | MEDIUM workflow | Require canonical timing clarification before W3 validation; safest copy is “15 seconds remaining” only if confirmed | NO; canonical clarification |
| S3C-12 | Full mock is a distinct assessment tier; Stage 3 does not settle speaking scheduling | W2 chain includes S_SECTION; Journey permits immediate or independently scheduled Speaking | Official speaking is human-delivered and operationally distinct; familiarisation sources do not settle OmniIELTS orchestration | Completion/scorecard/recovery ownership differs | HIGH workflow | OWNER_DECISION_REQUIRED in OD-PREW3-001 | YES |
| S3C-13 | Dictation can expose listening/spelling evidence but assistance/target binding controls eligibility | W2 precisely classifies shadowing/retell/IELTS but does not state one definitive class for Media Strict/Practice Dictation | Speechling treats dictation as practice; cannot define OmniIELTS schedule semantics | Outcome label could overclaim evidence | HIGH learning semantics | OWNER_DECISION_REQUIRED in OD-PREW3-002; default schedule false | YES |
| S3C-14 | R2/R4 provider facts are time-sensitive and Stage 5-owned | Current runtime copy names Gemini/local Whisper bridge; W2 requires provider neutrality | ELSA/Yoodli/Speechling show mechanics only | Current label could become accidental provider selection | MEDIUM/HIGH architecture | Preserve current function; rename learner-facing states Local/Opt-in Cloud/Offline Fallback; no provider choice | YES — existing R4-OD001 |
| S3C-15 | Stage 3 learner agency supports focus, skip and reversible routing | J-01 says completing Today “unlocks” next action; global W1/W2 forbids navigation locks | Duolingo path visually encourages progression but is not compatible as a lock | Copy implies global gating | HIGH agency | Replace “unlocks” with “surfaces/recommends”; retain direct access | NO |

**Stage 3 conflict count: 15.**

## 31. Owner Decision Register

Only decisions that change architecture, learning semantics, a major workflow, ownership, or cross-screen language are included.

| OD ID | Decision | Why material | Options | Evidence | Trade-off | Recommendation | Default if deferred | Status |
|---|---|---|---|---|---|---|---|---|
| R4-OD001 | Hosted/provider strategy | Changes consent, availability and future evaluation surfaces | Single provider; multiprovider adapter; offline-only | R2/R4 + current provider-specific runtime + REF-029/030 mechanics | Capability depth vs privacy/complexity/lock-in | Defer provider to Stage 5; design provider-neutral Local/Opt-in Cloud/Offline Fallback | Local core; cloud unavailable/optional | DEFERRED |
| R4-OD002 | Requested retention default/configurability | Changes Today workload and Settings semantics | Fixed .90; fixed .85; configurable .80–.95 | R1/R1S unknown + REF-013 workload linkage | Retention vs workload; control vs complexity | Keep control/workload preview compatible; do not freeze value here | Preserve current authorized value; label configurable only if canonical | OPEN |
| R4-OD003 | Backlog recovery policy | Changes re-entry and queue scope | Capped deferral; rapid catch-up; unrestricted queue | R1S overload; W1/W2 drift; REF-012/013 | Relief vs debt visibility vs policy complexity | Offer reversible quick/full choice; calibrate counts later | Full queue remains reachable; no hidden discard | OPEN |
| R4-OD004 | Streak/habit forgiveness | Changes motivation language and consequence | Grace; optional counter; strict reset | R1/R1S causal uncertainty; competitor patterns rejected as proof | Re-entry warmth vs habit salience | Non-punitive language; no mastery link; policy variable | No punitive lock/loss animation | OPEN |
| R4-OD005 | Physical database consolidation | Affects Stage 6 persistence and restore, not product IA ownership | One IDB; retain coordinated stores | R3 gap + current complete backup registry | Simplicity vs migration/risk | Defer to Stage 6; W3 shows one coherent Data & Recovery surface | Preserve current stores and full backup contract | DEFERRED |
| R4-OD006 | Raw audio persistence | Changes Media/Speaking recovery, privacy and exit behavior | Ephemeral+export; bounded LRU; unbounded | W2 ratification; Stage 3 privacy/audio tension | Continuity vs storage/privacy | Ephemeral raw audio + manual export + exit confirm | Same ratified policy | RESOLVED |
| R4-OD007 | Offline/cloud degradation stance | Cross-app availability and user expectation | Tiered graceful degradation; strict offline parity | R2/R3/R4 + current queue/fallback substrate | Core reliability vs advanced capability | Core drills/tests local; advanced enhancement queues/unavailable calmly | Offline local core; no blocking cloud requirement | DEFERRED TO GATE |
| OD-PREW3-001 | Full Mock Speaking orchestration | Changes completion guard, recovery, scorecard and duration | Sequential same session; independently scheduled linked component; learner choice at precheck | S3C-12 + official human-speaking distinction | Authentic continuity vs device/fatigue/operational realism | Independently scheduled linked component with explicit mock completion state | LRW scorecard marked partial; Speaking pending, never fabricated | OWNER_DECISION_REQUIRED |
| OD-PREW3-002 | Media Dictation evidence class | Changes learning claims and FSRS eligibility | Diagnostic/formative only; evidence-capable Strict only after full policy; activity-spec-specific mix | S3C-13 + W2 default-deny + REF-028 | More evidence coverage vs construct/source/evaluator validity | Keep Media Strict/Practice Dictation schedule false until a canonical activity spec proves eligibility | Formative/ErrorCandidate only; no positive FSRS | OWNER_DECISION_REQUIRED |

**Owner decision register count: 9 entries (one resolved, five existing open/deferred, one existing gate-deferred, two new material decisions).**

## 32. KEEP / ADAPT / REJECT Master Matrix

| Material pattern | Decision | Task fit | Interaction clarity | Learning value | Capability preservation | Mobile fit | Accessibility fit |
|---|---|---|---|---|---|---|---|
| Real Today queue/single lease | KEEP_AS_IS | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| Featured recommended next action | ADAPT_FROM_REFERENCE | HIGH | HIGH | MEDIUM | HIGH | HIGH | HIGH |
| Required lock-step course path | REJECT_REFERENCE_PATTERN | LOW | MEDIUM | LOW | LOW | MEDIUM | MEDIUM |
| Direct practice-mode selection | KEEP_AND_POLISH | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| Lifecycle Vocabulary workspace | GROUP_RELATED_CAPABILITIES | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| Word rearrangement | REJECT_REFERENCE_PATTERN | LOW | MEDIUM | LOW | HIGH | HIGH | MEDIUM |
| Persistent source/media workspace | KEEP_AND_POLISH | HIGH | HIGH | HIGH | HIGH | MEDIUM | HIGH |
| Shared Strict/Practice Dictation presentation | GROUP_RELATED_CAPABILITIES | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| Mandatory Guided 7-Step unlock | REJECT_REFERENCE_PATTERN | LOW | MEDIUM | LOW | LOW | MEDIUM | MEDIUM |
| Contextual reader capture | ADAPT_FROM_REFERENCE | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| One unified Capture Inbox | KEEP_AS_IS | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| One error → weakness declaration | REJECT_REFERENCE_PATTERN | LOW | LOW | LOW | LOW | HIGH | HIGH |
| Evidence detail → remediation action | ADAPT_FROM_REFERENCE | HIGH | HIGH | HIGH | HIGH | MEDIUM | HIGH |
| Separate analytics constructs | KEEP_AND_POLISH | HIGH | HIGH | HIGH | HIGH | MEDIUM | HIGH |
| Overall mastery/readiness number | REJECT_REFERENCE_PATTERN | LOW | HIGH superficially | LOW | LOW | HIGH | HIGH |
| IELTS learning/exam shell separation | KEEP_AS_IS | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| Official question palette/notes/highlight grammar | KEEP_AND_POLISH | HIGH | HIGH | MEDIUM | HIGH | MEDIUM | HIGH |
| Practice assistance inside exam | REJECT_REFERENCE_PATTERN | LOW | LOW | LOW | LOW | LOW | LOW |
| Shared Reading engine with Academic/GT material ownership | GROUP_RELATED_CAPABILITIES | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| Shared Task 1 writer with Academic/GT variants | GROUP_RELATED_CAPABILITIES | HIGH | HIGH | HIGH | HIGH | MEDIUM | HIGH |
| Semantic table for Task 1 visual | KEEP_AND_POLISH | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| Practice-only plan/review layers | PROGRESSIVELY_DISCLOSE | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH |
| Listen-record-replay-compare | ADAPT_FROM_REFERENCE | HIGH | HIGH | HIGH | HIGH | HIGH | MEDIUM |
| AI examiner presented as official/current | REJECT_REFERENCE_PATTERN | LOW | LOW | LOW | LOW | MEDIUM | LOW |
| Full Mock strict orchestrator/recovery | KEEP_AS_IS | HIGH | HIGH | HIGH | HIGH | MEDIUM | HIGH |
| Provider-specific settings language | RENAME_USER_FACING | HIGH | HIGH | MEDIUM | HIGH | HIGH | HIGH |
| Data/export/restore in one safety group | GROUP_RELATED_CAPABILITIES | HIGH | HIGH | MEDIUM | HIGH | HIGH | HIGH |
| Governance inspector as top-level app | REHOME | LOW | MEDIUM | LOW | HIGH | LOW | HIGH |

## 33. Recommended W3 Input Contract

This contract is a recommendation, not W3 authorization.

### 33.1 Required whole-product principles

1. Show one primary next action and one visible agency escape on every guided surface.
2. Preserve direct destination and activity reachability outside a learner-selected integrity activity.
3. Represent each screen with the orthogonal W2 state tuple, including offline/degraded and recovery.
4. Preserve source/item/draft/playback continuity through mode and contextual-tool transitions.
5. Keep Learning, Section Practice and Exam shells visually and behaviorally distinct.
6. Display assistance state and evidence consequence at feedback/summary points.
7. Use separate retention, skill, diagnostic, performance, transfer and engagement language.
8. Make advanced capability discoverable through progressive disclosure and search, not simultaneous visibility.
9. Use mobile recomposition rules in Section 26 for all 15 screen classes.
10. Include keyboard/focus/live-region/non-color/reduced-motion/touch/timing requirements in wireframe annotations.

### 33.2 Required per-screen artifacts

For each of 15 classes, W3 should provide:

- desktop and mobile primary state;
- at least the material empty/loading/error/degraded/recovery state;
- assistance and integrity variants where applicable;
- focus entry/return and keyboard path;
- preserved-capability checklist;
- current/target/future annotation;
- primary/agency/advanced/recovery action hierarchy;
- cross-surface entry and return;
- evidence consequence;
- anti-RPS ownership note.

### 33.3 Required shared components as behavioral concepts

These are concepts, not final components or styling:

- recommendation block with bypass;
- activity/source context header;
- assistance/evidence receipt;
- contextual tool rail/sheet;
- question palette;
- timer and recovery status;
- audio/recording controller;
- staged capture row;
- evidence/provenance detail;
- data visualization + semantic summary;
- degraded/offline banner;
- unexported-audio confirmation.

### 33.4 Mandatory traceability

W3 must trace:

- 48/48 current capabilities;
- 12/12 omission invariants;
- 15/15 screen classes and material variants;
- all Stage 3 conflict dispositions;
- all open owner decisions without hardcoding an option;
- all CURRENT / CURRENT_REHOMED / STAGE4_TARGET / FUTURE / OWNER_FUTURE / BACKGROUND labels.

### 33.5 Prohibited W3 assumptions

- no exact pixel layout or final visual style implied by this report;
- no provider, library, model, storage topology or breakpoint selected;
- no future capability rendered as current without an explicit future annotation;
- no CSS-only concealment for integrity;
- no unified mastery score;
- no global path gate;
- no new route/store solely to expose an existing contextual state.

## 34. Explicit Non-Decisions / Deferred Decisions

This candidate does not decide:

- cloud model/provider, ASR vendor, realtime API or AI scoring engine;
- final requested retention, review cap, catch-up count or streak grace;
- physical IndexedDB consolidation;
- final breakpoint values, grid, component library, tokens, icons, typography, colors, radii or motion;
- final Task 1 renderer technology;
- SBD/alignment/parser/search/grammar/item-generation dependencies;
- calibrated BKT/IRT/CAT/IELTS band models or thresholds;
- final interactive-examiner architecture;
- Stage 5/6 performance, storage quota or cross-device synchronization design;
- package acceptance, W3 activation, merge or canonical status.

The only ratified audio direction consumed here is W2 R4-OD006: ephemeral raw audio, manual export and explicit exit confirmation.

## 35. Evidence Limitations

- Many products are account-gated; official help and current official visuals were used when direct signed-in interaction was unavailable.
- Duolingo’s current Practice surface was visually inspected and supports the hierarchy observation. Language Reactor’s official help was accessible but the live visual surface was not reliably inspectable, so confidence is MEDIUM.
- Product documentation can drift after 2026-08-21. Currentness labels reflect the observation date, not perpetual validity.
- Official IELTS/BC/IDP sources govern semantics but do not specify every interaction-state implementation.
- Marketing pages are never sole support for an evidence/learning claim.
- No long-form copyrighted copy, proprietary asset, logo or branded visual system is copied.
- Runtime inspection was targeted source/test inspection, not a new exhaustive browser acceptance run of every current state. It is sufficient for the current/future classifications used here but does not replace W3 validation.
- This is expert synthesis, not learner usability testing. W3 should test comprehension of assistance/evidence labels, mobile pane switching, recommendation agency and recovery.
- Stage 3 includes unresolved causal, calibration, mobile performance, provider longevity and storage-eviction unknowns. They remain unresolved.

## 36. Quality-Gate Results

| Gate | Result |
|---|---|
| STAGE3_UPSTREAM_RECONCILED | PASS |
| R1_RECONCILED | PASS |
| R1_SUPPLEMENT_RECONCILED | PASS |
| R2_RECONCILED | PASS |
| R3_RECONCILED | PASS |
| R4_RECONCILED | PASS |
| STAGE3_REQUIREMENTS_RECONCILED | PASS |
| W0_RECONCILED | PASS |
| W1_RECONCILED | PASS |
| W2_RECONCILED | PASS |
| 15_SCREEN_CLASSES_COVERED | 15/15 |
| MATERIAL_VARIANTS_COVERED | PASS |
| CURRENT_FUTURE_TRUTH | PASS |
| REFERENCE_EVIDENCE_CURRENTNESS | PASS |
| MULTI_REFERENCE_SYNTHESIS | PASS |
| IELTS_OFFICIAL_PRIORITY | PASS |
| CAPABILITY_PRESERVATION | PASS |
| ANTI_RPS | PASS |
| MOBILE | PASS |
| ACCESSIBILITY | PASS |
| OWNER_DECISION_REGISTER | PASS — 9 entries |
| STAGE3_CONFLICT_REGISTER | PASS — 15 entries |
| W3_NON_AUTHORITY | PASS |

**Candidate disposition:** RESEARCH_EXECUTION_COMPLETE_PENDING_INDEPENDENT_AUDIT.

**Status:** READY_FOR_INDEPENDENT_REFERENCE_SYNTHESIS_AUDIT.

**W3 authority:** NOT_GRANTED.

**Package acceptance:** NOT_GRANTED.

**Merge authority:** NOT_GRANTED.
