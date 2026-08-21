# STAGE 4 PRE-W3 WHOLE-APP REFERENCE SYNTHESIS AUTHORIZATION MANIFEST

**Manifest Identity**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-AUTH-001`
**Authorized Transaction**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-001`
**Transaction Class**: `RESEARCH / UX REFERENCE SYNTHESIS`
**Stage**: `STAGE 4 - UX / IA REMAKE`
**Relationship**: `SUPPLEMENTAL PRE-W3 RESEARCH GATE / NOT A NEW STAGE 4 WAVE`
**Authoring Base**: `4481a345a9a30856eda06632ca766cd364a5792a`
**Controlling Protocol**: [`docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`](../governance/EXECUTION_PROMPT_PROTOCOL_V2.md)
**Stage 4 Authority Context**: [`docs/authorizations/STAGE4-UXIA-AUTH-001.md`](STAGE4-UXIA-AUTH-001.md)
**Canonical W0/W1/W2 Inputs**: [`STAGE4_UXIA_STRATEGY.md`](../stage4/STAGE4_UXIA_STRATEGY.md), [`STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`](../stage4/STAGE4_CAPABILITY_PRESERVATION_MATRIX.md), [`STAGE4_INFORMATION_ARCHITECTURE.md`](../stage4/STAGE4_INFORMATION_ARCHITECTURE.md), [`STAGE4_USER_JOURNEYS.md`](../stage4/STAGE4_USER_JOURNEYS.md), [`STAGE4_INTERACTION_AND_STATE_MODEL.md`](../stage4/STAGE4_INTERACTION_AND_STATE_MODEL.md)
**Candidate Status**: `AUTHORIZATION_CANDIDATE / RESEARCH_AUTHORITY_NOT_EFFECTIVE`
**Merge Authority**: `NOT_GRANTED`

---

## 1. Purpose and Authority Separation

This manifest is a bounded authorization candidate for the future whole-product UX reference-synthesis transaction that must occur before any separate Wave W3 activation.

It preserves the repository authority taxonomy:

$$
\text{RESEARCH} \neq \text{SPECIFICATION} \neq \text{AUTHORIZATION} \neq \text{IMPLEMENTATION} \neq \text{EVIDENCE} \neq \text{INDEPENDENT ACCEPTANCE} \neq \text{MERGE AUTHORITY}
$$

The authorized future output remains:

```text
RESEARCH
+
DESIGN RECOMMENDATION
```

It is not a canonical UX specification, W3 wireframe, implementation package, acceptance verdict, or merge authorization.

---

## 2. Activation Gate and Exact Authority State

### 2.1 Before Independent Acceptance and Canonical Integration

```text
AUTHORIZATION_CANDIDATE: PRESENT
RESEARCH_AUTHORITY: NOT_EFFECTIVE
TARGET_RESEARCH_TRANSACTION: NOT_EXECUTABLE
```

Creating a branch, commit, Draft PR, or receiving green CI for this manifest does not activate the research transaction.

### 2.2 Effective Authority Transition

The future research authority becomes effective only after all of the following occur for this exact manifest candidate:

1. a fresh independent authorization audit records `ACCEPT`;
2. the accepted manifest is canonically integrated into `main`;
3. the future researcher fresh-verifies repository identity and current canonical `main`;
4. the future researcher fresh-reads this integrated manifest and the controlling W0/W1/W2 inputs.

Only then:

```text
RESEARCH_AUTHORITY:
EFFECTIVE_FOR_EXACT_DECLARED_TRANSACTION_ONLY
STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-001
ONLY
```

No standing, general, successor, W3, or implementation authority is created.

---

## 3. Stage 4 Relationship and Predecessor Boundary

This supplemental gate does not renumber, replace, reopen, or add a Stage 4 Wave.

```text
W0 / W1 / W2 CANONICAL INPUTS
->
PRE-W3 WHOLE-APP REFERENCE SYNTHESIS
->
OWNER DECISION / SEPARATE ACCEPTANCE
->
SEPARATELY AUTHORIZED W3, IF ANY
```

The future research must remain subordinate to the fresh-read canonical W0/W1/W2 state. If this manifest, a compiler capsule, a research prompt, or an external reference conflicts with a higher canonical source, the canonical source wins and the researcher must stop or record `OWNER_DECISION_REQUIRED` without mutating canonical documents.

---

## 4. Authorized Future Research Mission

Once effective, the exact authorized transaction may:

1. fresh-read canonical OmniIELTS repository evidence;
2. distinguish current runtime behavior from Stage 4 target and future-reserved capability;
3. perform current external web and public-product research;
4. inspect accessible public product UIs, official help centers, documentation, demos, screenshots, and videos;
5. inspect owner-supplied screenshots, URLs, and references as explicit reference inputs;
6. discover multiple strong references per material product capability where meaningful;
7. compare interaction mechanics against canonical OmniIELTS W0/W1/W2;
8. classify material patterns as `KEEP`, `ADAPT`, or `REJECT`;
9. produce decision types defined in Section 15;
10. synthesize one coherent OmniIELTS product language rather than copying one whole app or assembling unrelated screen identities;
11. cover all 15 canonical screen classes and their material variants;
12. perform mobile, responsive, accessibility, and cross-surface continuity analysis;
13. perform Anti-RPS and duplication analysis;
14. identify only material Owner Decisions;
15. materialize exactly one bounded research candidate artifact.

The research objective is:

```text
BEST REFERENCE INTERACTIONS
+ CURRENT OMNIIELTS CAPABILITIES
+ CANONICAL LEARNING SYSTEM
+ IELTS FIDELITY
+ ONE COHERENT OMNIIELTS PRODUCT LANGUAGE
```

---

## 5. Future Research Repository Read Scope

The effective future transaction may read, as needed for factual verification:

```text
AGENTS.md
docs/**
src/**
tests/**
scripts/**
package.json
configuration files
Git history
pull-request and CI evidence
```

Runtime/source/test inspection is read-only and must be targeted to facts needed to distinguish:

```text
CURRENT
vs
CURRENT_REHOMED
vs
STAGE4_TARGET
vs
FUTURE
vs
BACKGROUND_SYSTEM
```

`READ_SCOPE != WRITE_SCOPE`.

---

## 6. External Research and Evidence Authority

The effective future transaction is explicitly authorized to use available read-only:

- web search;
- browser inspection;
- public product sites and interactive demos;
- official documentation and help centers;
- official product screenshots and videos;
- reputable independent walkthroughs or reviews when primary evidence is unavailable;
- owner-supplied screenshots and reference URLs.

Evidence preference, where practical:

1. actual product UI or interactive demo;
2. official documentation or help center;
3. official product videos or screenshots;
4. high-quality independent walkthroughs or reviews;
5. secondary descriptions.

For every material external reference, the candidate must record:

```text
PRODUCT
SURFACE / CAPABILITY
OBSERVED PATTERN
SOURCE
SOURCE TYPE
OBSERVATION DATE
CURRENTNESS CONFIDENCE
WHY RELEVANT
```

If current behavior cannot be fresh-verified, it must be labeled `HISTORICAL_OR_UNVERIFIED_REFERENCE`. Owner-supplied material is `REFERENCE_INPUT`, not evidence of current OmniIELTS runtime behavior.

---

## 7. Exact Closed Future Research Write Allowlist

The effective future transaction may write exactly one file:

```text
docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md
```

Closed allowlist:

```text
{
  docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md
}
```

Everything else is read-only. Explicit zero-write areas include:

```text
src/**
tests/**
scripts/**
.github/**
package.json
package-lock.json
docs/stage4/**
docs/authorizations/**
docs/MASTER_ROADMAP.md
docs/ROADMAP.md
docs/IMPLEMENTATION_PLAN.md
docs/IMPLEMENTATION_STATUS.md
docs/DECISIONS.md
AGENTS.md
```

This manifest does not independently authorize a future commit, push, PR, merge, deployment, dependency change, or external side effect beyond read-only research. Any such action requires separate exact authority.

---

## 8. Mandatory Whole-App Coverage

The future candidate must cover all 15 canonical screen classes:

1. Today / Home;
2. Vocabulary & Collocation;
3. Video / Media;
4. Article / Source Reader;
5. Capture Inbox;
6. Error Notebook / Remediation;
7. Analytics;
8. IELTS Listening;
9. IELTS Academic Reading;
10. IELTS General Training Reading;
11. Writing Task 1, including Academic and GT variants;
12. Writing Task 2;
13. Speaking;
14. Full Mock;
15. Settings / Privacy / Data Safety.

```text
WHOLE_APP_REFERENCE_SYNTHESIS != VIDEO_ONLY_REFERENCE_RESEARCH
15_SCREEN_CLASSES != 15_SINGLE_STATIC_SCREENS
```

For every screen class, the candidate must document:

1. canonical job-to-be-done;
2. material variants and state changes;
3. multiple-reference set where meaningful;
4. observed mechanics, why they work, relevance, and risks;
5. `KEEP` / `ADAPT` / `REJECT` classification;
6. synthesized OmniIELTS interaction direction;
7. explicit capability-preservation risk if W3 oversimplifies the surface.

---

## 9. Material Variant and Deep-Dive Authority

The researcher may analyze below the parent-screen level without inventing new top-level navigation.

### 9.1 Video / Media

Representative analysis may include:

```text
Watch / Normal
Noticing
Shadowing
Strict Dictation
Practice Dictation
Retell
Guided 7-Step Session
Authorized or future contextual discussion
```

Preserve:

```text
MEDIA_MODE != GUIDED_LOOP_STEP
GUIDED_7_STEP != MANDATORY_UNLOCK_CHAIN
SIX_SEMANTIC_CAPABILITIES != SIX_REQUIRED_TOP_LEVEL_TABS
```

The stable-workspace hypothesis may be evaluated as research only:

```text
MODE_SWITCH SHOULD_PREFER CONTEXT_CONTINUITY
```

The researcher may recommend preserving source, selected sentence, transcript context, playback position/settings, and appropriate drafts across activity switches, but may not canonicalize this hypothesis.

### 9.2 Dictation

Owner input is binding for this research candidate:

```text
TARGET TASK TYPES:
- FILL_GAPS
- FULL_SENTENCE

WORD_REARRANGEMENT:
REJECTED_BY_OWNER
```

Research may compare difficulty, gap progression, full-sentence entry, replay, speed, sentence navigation, progressive hints, first-letter cues, partial/full reveal, retry, comparison, and error localization. It may evaluate grouping Practice and Strict under one Dictation presentation, but may not alter the two canonical semantic variants.

### 9.3 Shadowing, Noticing, and Retell

- Shadowing research may cover cue selection, listen/repeat/record/replay, waveform utility, pronunciation support, optional IPA, thought groups, stress, connected speech, translation visibility, comparison, and progression.
- Noticing research may evaluate clearer user-facing names and progressive presentation of sounds, chunks, reductions, phrases, collocations, and grammar without producing an information dump.
- Retell research must preserve `REPRODUCE_FORM != RECONSTRUCT_MEANING` and analyze source comprehension, transcript reduction, optional cues, learner-generated output, comparison, feedback, and retry.

Evidence truth remains:

```text
SHADOWING: COACHING_ONLY
RETELL != ALWAYS_COACHING_ONLY
UNASSISTED_RETELL != AUTOMATIC_FSRS_UPDATE
```

### 9.4 Guided 7-Step Session

```text
Listen -> Dictate -> Verify / Correct -> Notice -> Shadow -> Vocabulary -> Retell
```

The research must treat this as orchestration over reusable activities, with progress, Continue, Skip, Change Activity, Exit, resume, and fatigue controls. It must not create duplicate implementations or global prerequisite unlocks.

### 9.5 Vocabulary and Collocation

The research must not reduce Screen 2 to flashcards. It may analyze introduction/context, recognition, meaning discrimination, typing, sentence/collocation cloze, listening, dictation, pronunciation, production/output, transfer, active/passive goals, spaced review, and contextual capture.

```text
RECOMMENDED_VOCAB_ACTIVITY != REQUIRED_VOCAB_ACTIVITY
```

---

## 10. IELTS Fidelity and Learning/Exam Boundary

For IELTS exam-simulation claims and interaction authenticity:

```text
OFFICIAL IELTS / BRITISH COUNCIL / IDP
>
COMPETITOR IELTS PRODUCTS
>
GENERIC TEST UI
```

Competitor patterns may improve usability but may not override authentic exam semantics.

```text
OMNIIELTS_LEARNING_UI != IELTS_EXAM_SIMULATION_UI
AI_PRACTICE != OFFICIAL_IELTS_ASSESSMENT
```

For Listening, Academic Reading, GT Reading, Writing, Speaking, and Full Mock, the research may analyze navigation, timers, item status, review, highlighting, transitions, warnings, focus, keyboard behavior, mobile policy, reload/recovery, submission, and result review. It must not place learning hints inside strict exam mode or falsely label formative practice as official assessment.

Interactive AI Examiner remains `[OWNER_RECONFIRMED_FUTURE]`. Research may recommend interaction patterns but may not select a provider, model, ASR architecture, or official-assessment framing.

---

## 11. Canonical Preservation and W2 Immutability

External patterns are reference evidence, not architecture authority.

```text
REFERENCE_PATTERN != AUTHORITY_TO_DELETE_CAPABILITY
CAPABILITY_PRESERVED != EVERY_CAPABILITY_EQUAL_VISUAL_PROMINENCE
```

The research may recommend grouping, rehoming, progressive disclosure, contextual controls, user-facing renaming, and representative variants. It may not alter canonical capability semantics.

The following W2 invariants remain binding:

```text
RECOMMENDED_PATH != REQUIRED_PATH
MEDIA_MODE != GUIDED_LOOP_STEP
GUIDED_SEQUENCE != MANDATORY_GLOBAL_SEQUENCE
UNASSISTED != AUTOMATIC_FSRS_UPDATE
OMNIIELTS_LEARNING_UI != IELTS_EXAM_SIMULATION_UI
R4-OD006 = OPTION_A_EPHEMERAL_RAW_AUDIO
```

If a reference pattern conflicts with W2, the researcher must classify it as `REJECT_REFERENCE_PATTERN` or record `OWNER_DECISION_REQUIRED`; the researcher must not mutate or reopen W2.

---

## 12. Coherence, Mobile, and Accessibility Contract

The synthesis must define a shared OmniIELTS-level interaction language across:

- navigation behavior;
- action hierarchy;
- learning versus exam distinction;
- assistance disclosure;
- feedback and recovery;
- responsive behavior and mobile;
- accessibility;
- content density;
- progressive disclosure.

It must not produce an unsynthesized product in which each screen inherits a different reference app's visual system.

For material surfaces, the research must identify desktop and mobile reference patterns rather than treating mobile as vertically stacked desktop. It must address video/transcript, writing, exam runners, sentence practice, speaking recording, analytics, and navigation constraints without selecting final pixel layouts.

Accessibility research must include keyboard-first workflows, focus ownership/restoration, state announcements, captions and transcript access, timed activities, audio controls, touch-target discoverability, reduced motion, and non-color status communication.

---

## 13. Anti-RPS and Duplication Contract

Every material recommendation must classify whether it is:

```text
A. genuinely new user capability;
B. improved presentation of an existing capability;
C. variant/state of an existing capability;
D. duplicate UX;
E. unnecessary feature-wall expansion.
```

The candidate must prefer:

```text
ONE_CAPABILITY + MULTIPLE_STATES
```

over duplicate pages, routes, tabs, features, or stores. Anti-RPS analysis grants no implementation authority.

---

## 14. Current/Future Truth Contract

The candidate must use and preserve the canonical status distinctions:

```text
[CURRENT]
[CURRENT_REHOMED]
[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]
[FUTURE_UX_RESERVED]
[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]
[OWNER_RECONFIRMED_FUTURE]
[BACKGROUND_SYSTEM]
```

External feature presence may not be used to claim that OmniIELTS currently implements the same feature. Inferences must be labeled as inference, and unknowns must remain unknown.

---

## 15. Reference Decisions and Quality Scoring

Every material recommendation must use one of:

```text
KEEP_AS_IS
KEEP_AND_POLISH
ADAPT_FROM_REFERENCE
GROUP_RELATED_CAPABILITIES
PROGRESSIVELY_DISCLOSE
RENAME_USER_FACING
REHOME
REJECT_REFERENCE_PATTERN
OWNER_DECISION_REQUIRED
FUTURE_ONLY
```

Serious reference patterns must be scored qualitatively:

```text
TASK_FIT: HIGH / MEDIUM / LOW
INTERACTION_CLARITY: HIGH / MEDIUM / LOW
LEARNING_VALUE: HIGH / MEDIUM / LOW
COGNITIVE_LOAD: LOW / MEDIUM / HIGH
MOBILE_QUALITY: HIGH / MEDIUM / LOW
ACCESSIBILITY_SIGNAL: HIGH / MEDIUM / LOW / UNKNOWN
OMNIIELTS_FIT: HIGH / MEDIUM / LOW
EVIDENCE_CONFIDENCE: HIGH / MEDIUM / LOW
```

No fake numerical precision is authorized.

---

## 16. Owner Decision Boundary

The future candidate may raise `OWNER_DECISION_REQUIRED` only where an owner choice materially changes product architecture or experience.

Required register format:

```text
OD-REF-###
SUBJECT:
OPTIONS:
EVIDENCE:
TRADEOFF:
RECOMMENDED_OPTION:
WHY_OWNER_DECISION_REQUIRED:
```

Cosmetic trivia must not be escalated. A research recommendation does not become canonical merely because it is recommended.

```text
RESEARCH_RECOMMENDATION != OWNER_RATIFICATION
```

---

## 17. Required Research Candidate Contract

The single allowlisted artifact must contain:

1. Executive Summary;
2. Canonical Baseline;
3. Research Method;
4. Reference Source Register;
5. Whole-App Coverage Matrix;
6. 15 Screen-Class Analyses;
7. Material Variant Analyses;
8. Video/Media Deep Dive;
9. Vocabulary Deep Dive;
10. IELTS Fidelity Reference Analysis;
11. Mobile/Responsive Analysis;
12. Accessibility Analysis;
13. Anti-RPS/Duplication Register;
14. Cross-App Coherence Principles;
15. KEEP / ADAPT / REJECT Register;
16. Owner Decision Register;
17. Recommended W3 Input Contract;
18. Evidence / Citation Register;
19. Unknowns / Limitations.

For every major recommendation, traceability must follow:

```text
CANONICAL_REQUIREMENT
+ REFERENCE_EVIDENCE
+ SYNTHESIS_REASONING
= RECOMMENDATION
```

The candidate must distinguish:

```text
[CANONICAL FACT]
[CURRENT RUNTIME FACT]
[EXTERNAL OBSERVATION]
[OWNER INPUT]
[INFERENCE]
[RECOMMENDATION]
[UNKNOWN]
```

---

## 18. Future Research Quality Gates

Before reporting completion, the future researcher must verify:

```text
15_SCREEN_CLASSES_COVERED: 15/15
VIDEO_MATERIAL_VARIANTS_COVERED: YES
VOCABULARY_MULTI_MODALITY_PRESERVED: YES
IELTS_OFFICIAL_REFERENCE_PRIORITY: YES
MOBILE_COVERAGE: YES
ACCESSIBILITY_COVERAGE: YES
ANTI_RPS_AUDIT: YES
REFERENCE_SOURCE_TRACEABILITY: YES
CURRENT_FUTURE_TRUTH: PASS
WHOLE_APP_NOT_VIDEO_ONLY: PASS
W3_LAYOUT_NOT_EXECUTED: PASS
CHANGED_PATHS: EXACT_ALLOWLIST_ONLY
```

Automated checks or research completeness do not grant independent acceptance.

---

## 19. W3 and Downstream Boundaries

This manifest grants zero authority for:

```text
W3_WIREFRAMES: NOT_AUTHORIZED
W3_LAYOUT_SELECTION: NOT_AUTHORIZED
W4: NOT_AUTHORIZED
W5: NOT_AUTHORIZED
W6: NOT_AUTHORIZED
STAGE5: NOT_AUTHORIZED
STAGE6: NOT_AUTHORIZED
```

The candidate may produce a `RECOMMENDED_W3_INPUT_CONTRACT`, but it cannot activate or execute W3.

---

## 20. Hard Prohibitions for the Future Research Transaction

The future researcher must not:

- implement source code;
- modify tests, scripts, dependencies, configuration, or CI;
- modify this or any other authorization manifest;
- modify W0/W1/W2 or reopen accepted W2 semantics;
- create production UI, final wireframes, hi-fi designs, or final visual tokens;
- select AI, ASR, psychometric, persistence, or raw-audio storage architecture;
- copy proprietary branding, logos, copyrighted copy, illustrations, or protected assets;
- restore Dictation Word Rearrangement without new Human Owner authority;
- grant independent acceptance, package acceptance, W3 authority, or merge authority;
- represent the research recommendation as canonical fact;
- self-audit or self-accept.

---

## 21. Future Research Completion and Stop Contract

The future researcher must stop after:

1. fresh canonical readback of effective authority;
2. complete external reference research;
3. whole-app synthesis;
4. creation of the one allowlisted candidate artifact;
5. evidence and changed-path verification;
6. final research completion report.

Required terminal state:

```text
READY_FOR_INDEPENDENT_REFERENCE_SYNTHESIS_AUDIT
```

Required completion fields:

```text
TRANSACTION:
STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-001

CANONICAL_BASE:
<fresh effective-authority base sha>

RESEARCH_ARTIFACT:
docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md

REFERENCE_PRODUCTS_REVIEWED:
<count>

REFERENCE_SOURCES:
<count>

SCREEN_CLASSES_COVERED:
15/15 or actual

MATERIAL_VARIANTS_COVERED:
<count>

OWNER_DECISIONS_REQUIRED:
<count>

ANTI_RPS_FINDINGS:
<count>

CURRENT_FUTURE_TRUTH:
PASS / FAIL

WHOLE_APP_COVERAGE:
PASS / FAIL

W3_EXECUTION:
NOT_PERFORMED

INDEPENDENT_ACCEPTANCE:
NOT_PERFORMED

PACKAGE_ACCEPTANCE:
NOT_GRANTED

MERGE_AUTHORITY:
NOT_GRANTED

STATUS:
READY_FOR_INDEPENDENT_REFERENCE_SYNTHESIS_AUDIT or BLOCKED
```

---

## 22. Context Compiler and Harness Boundary

`npm run agent:context -- STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-001 --json` may continue to return `UNKNOWN_TRANSACTION` after this manifest is integrated. That is not authority to modify the compiler or harness.

```text
CANONICAL_DOCS = AUTHORITY
CONTEXT_COMPILER = DERIVED_OPERATIONAL_CONTEXT
CAPSULE != AUTHORITY
```

The future researcher may use direct fresh-read canonical authorization. Any compiler or harness support requires separate explicit authority.

---

## 23. Independent Audit and Merge Boundary

The research executor and the independent research auditor must be separate sessions:

```text
RESEARCH_EXECUTOR != INDEPENDENT_RESEARCH_AUDITOR
CI_GREEN != ACCEPT
INDEPENDENT_ACCEPTANCE != MERGE_AUTHORITY
```

For this authorization candidate and for the future research candidate:

```text
MERGE_AUTHORITY: NOT_GRANTED
```

Independent authorization `ACCEPT` for this manifest must stop at:

```text
AUTHORIZATION_ACCEPTED_PENDING_OWNER_INTEGRATION
```

unless a later exact controlling prompt separately grants merge authority.
