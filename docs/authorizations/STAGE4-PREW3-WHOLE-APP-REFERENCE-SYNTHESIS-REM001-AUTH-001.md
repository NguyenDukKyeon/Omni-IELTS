# STAGE 4 PRE-W3 WHOLE-APP REFERENCE SYNTHESIS REMEDIATION AUTHORIZATION MANIFEST

**Manifest Identity**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-001`  
**Authorized Future Transaction**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001`  
**Transaction Class**: `RESEARCH REMEDIATION / SUPPLEMENTAL UX REFERENCE SYNTHESIS`  
**Stage**: `STAGE 4 - UX / IA REMAKE`  
**Relationship**: `REMEDIATION OF REJECTED PRE-W3 RESEARCH CANDIDATE (PR #176) / SUPPLEMENTAL RESEARCH GATE BEFORE W3`  
**Authoring Base**: `e7fb8e84b19606909daa3e8dbe8aa5708ea4c1a6` (current canonical `main`)  
**Controlling Protocol**: [`docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`](../governance/EXECUTION_PROMPT_PROTOCOL_V2.md)  
**Stage 4 Authority Context**: [`docs/authorizations/STAGE4-UXIA-AUTH-001.md`](STAGE4-UXIA-AUTH-001.md)  
**Historical Original Research Authorization**: [`docs/authorizations/STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-AUTH-001.md`](STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-AUTH-001.md) (historical original research authority only)  
**Historical Rejected Transaction**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-001`  
**Historical Rejected PR**: `#176`  
**Historical Rejected Head**: `644d444e01dca237b448acae35ccb176daf13f29`  
**Historical Rejected Artifact**: `docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md` (blob `e74b3a324304878b456f62c955762fe48eff86a5`, SHA-256 `5d6326037114aa860a3d945f5ec0554a162dc5aa38c6b3ce9bf26ba4413e9a14`)  
**Controlling Audit Transaction**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-AUDIT-001`  
**Controlling Audit Verdict**: `REJECT` (Comment ID: `5365836207`)  
**Canonical W0/W1/W2 Inputs**: [`STAGE4_UXIA_STRATEGY.md`](../stage4/STAGE4_UXIA_STRATEGY.md), [`STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`](../stage4/STAGE4_CAPABILITY_PRESERVATION_MATRIX.md), [`STAGE4_INFORMATION_ARCHITECTURE.md`](../stage4/STAGE4_INFORMATION_ARCHITECTURE.md), [`STAGE4_USER_JOURNEYS.md`](../stage4/STAGE4_USER_JOURNEYS.md), [`STAGE4_INTERACTION_AND_STATE_MODEL.md`](../stage4/STAGE4_INTERACTION_AND_STATE_MODEL.md)  
**Canonical Stage 3 Inputs**: [`STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`](../research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md), [`R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md`](../research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md), [`R1_LEARNING_PRODUCT_RESEARCH.md`](../research/R1_LEARNING_PRODUCT_RESEARCH.md), [`R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`](../research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md), [`R3_PIPELINE_ARCHITECTURE_RESEARCH.md`](../research/R3_PIPELINE_ARCHITECTURE_RESEARCH.md), [`R4_CROSS_RESEARCH_RECONCILIATION.md`](../research/R4_CROSS_RESEARCH_RECONCILIATION.md)  
**Candidate Status**: `AUTHORIZATION_CANDIDATE / REMEDIATION_AUTHORITY_NOT_EFFECTIVE`  
**Merge Authority**: `NOT_GRANTED`  

---

## 1. Purpose and Authority Separation

This manifest establishes a bounded authorization candidate for the comprehensive research remediation transaction (`STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001`) required following the independent audit rejection of historical PR #176 (`STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-001`).

It strictly enforces the repository authority taxonomy:

$$
\text{RESEARCH} \neq \text{SPECIFICATION} \neq \text{AUTHORIZATION} \neq \text{IMPLEMENTATION} \neq \text{EVIDENCE} \neq \text{INDEPENDENT ACCEPTANCE} \neq \text{MERGE AUTHORITY}
$$

The authorized future output is strictly:

```text
RESEARCH REMEDIATION
+
SUPPLEMENTAL UX REFERENCE SYNTHESIS
```

This manifest is NOT:
- research execution;
- remediation execution;
- Wave W3 execution;
- a runtime implementation package;
- a canonical UX/IA specification;
- an Owner ratification;
- an independent acceptance verdict;
- a grant of merge authority.

Core Governance Invariants:
$$
\text{REMEDIATION\_REQUIRED} \neq \text{REMEDIATION\_AUTHORIZED}
$$
$$
\text{REJECTED\_CANDIDATE} \to \text{READ\_ONLY\_INPUT} \to \text{REMEDIATION\_RESEARCH} \to \text{NEW\_REMEDIATED\_CANDIDATE}
$$

No successor authority may be inferred from a rejected transaction or historical candidate. Remediation authority must be explicitly authorized, independently audited, and canonically integrated.

---

## 2. Activation Gate and Exact Authority State

### 2.1 Before Independent Acceptance and Canonical Integration

```text
AUTHORIZATION_CANDIDATE: PRESENT
REMEDIATION_AUTHORITY: NOT_EFFECTIVE
TARGET_REMEDIATION_TRANSACTION: NOT_EXECUTABLE
```

Creating a branch, authoring this candidate manifest, opening a Draft PR, or receiving green CI does NOT make remediation authority effective.

### 2.2 Effective Authority Transition

Future remediation research authority becomes effective **ONLY** after all of the following sequential conditions are satisfied:

1. This exact authorization candidate (`STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-001`) receives a formal, independent `ACCEPT` verdict from an unpolluted Independent Auditor session;
2. The exact accepted authorization manifest is canonically integrated into `main`;
3. A future remediation researcher fresh-verifies repository identity and canonical `main` HEAD;
4. That researcher fresh-reads all controlling canonical documents, this integrated authorization manifest, and the complete text of formal audit comment `5365836207`.

Only upon completion of all four gates:

```text
REMEDIATION_AUTHORITY:
EFFECTIVE_FOR_EXACT_DECLARED_TRANSACTION_ONLY
STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001
ONLY
```

No standing, general, successor, Wave W3, or implementation authority is created.

---

## 3. Historical Candidate Freeze and Lineage Governance

### 3.1 Historical PR #176 Freeze

Historical PR #176 and its exact rejected head commit:

```text
PR: #176
REJECTED HEAD: 644d444e01dca237b448acae35ccb176daf13f29
REJECTED ARTIFACT: docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md
REJECTED BLOB: e74b3a324304878b456f62c955762fe48eff86a5
AUDIT VERDICT: REJECT (Comment 5365836207)
```

must remain permanently historical and frozen.

The future remediation researcher must NOT:
- force-push or amend PR #176;
- continue committing or writing on PR #176;
- rewrite the historical rejected commit;
- replace, overwrite, or mutate the formal independent audit verdict;
- claim that the historical rejected artifact became accepted.

### 3.2 Read-Only Research Input Relationship

The rejected artifact is strictly a **READ-ONLY RESEARCH INPUT**:

```text
REJECTED_CANDIDATE (PR #176)
  │
  ▼ [READ-ONLY INPUT]
REMEDIATION RESEARCH (REM-001)
  │
  ▼ [NEW CLOSED ALLOWLIST WRITE]
NEW REMEDIATED CANDIDATE (docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md)
```

Historical text from the rejected candidate carries zero presumption of correctness and must be independently re-verified against canonical authority before any verified insight is retained.

---

## 4. Authorized Future Remediation Mission & Scope

Once effective, transaction `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001` is authorized to:

1. Fresh-read all controlling canonical documents, Stage 3 research sources, and the full audit defect register;
2. Fresh-read the rejected candidate artifact strictly as a read-only input;
3. Factually inspect runtime, source, and tests strictly where needed to establish current versus future truth;
4. Perform fresh external web and product research to resolve all reference coverage gaps;
5. Remediate all 9 formal audit findings and 5 whole-product root gaps;
6. Synthesize across three orthogonal axes:
   - **Axis A**: 15 Canonical Screen Classes and their material variants;
   - **Axis B**: 22+ End-to-End Experience Systems;
   - **Axis C**: Cross-Cutting Qualities;
7. Establish an auditable 48/48 capability preservation trace without deferring proof to Wave W3;
8. Restore rigorous recommendation-level quality scoring across all 8 mandatory qualitative dimensions;
9. Materialize exactly ONE bounded remediation candidate artifact:
   `docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md`.

---

## 5. Repository Read Scope

The future remediation transaction is authorized to read:

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
historical PR #176 candidate artifact and comments
```

Runtime/source/test inspection is strictly read-only and must be targeted to establishing factual current/future truth. `READ_SCOPE != WRITE_SCOPE`.

---

## 6. External Research Authority & Quality Standards

The future remediation transaction is explicitly authorized to conduct read-only external research via:
- web search and browser inspection;
- public product interfaces, interactive demos, and sandbox accounts;
- official product documentation, knowledge bases, and help centers;
- official product videos, tutorials, and screenshots;
- reputable independent walkthroughs and reviews where primary access is limited;
- owner-supplied reference materials.

### 6.1 Required Specialist Comparator Discovery

The remediation research MUST perform fresh specialist research spanning:

1. **Specialist IELTS-Learning & Practice Products** (for interaction mechanics):
   - Candidate comparators include: *IELTS Online Tests*, *E2 IELTS*, *Magoosh IELTS*, *SmallTalk2Me*, *IELTS Practice Band 9*, *GEL IELTS Flex*, *TestGlider IELTS*.
   - Evaluated mechanics: passage/audio-grounded explanations, answer-location locators, incorrect-answer filtering/retry, question-type remediation, Writing/Speaking feedback latency and hierarchy, recording history/privacy, Full Mock onboarding/results handoff, desktop mock versus mobile drill allocation.
2. **Instructional Curriculum & Teaching Products** (for instruction vs feedback):
   - Candidate comparators include: *Duolingo* (Explain My Answer), *Busuu* (Mistake Repair), *CommonLit* (Target Lessons), *British Council IELTS Teaching Resources*, *Cambridge Write & Improve*.
   - Evaluated mechanics: diagnostic routing, model analysis, worked/contrastive examples, guided reconstruction, scaffold fading, clean retry, delayed/varied retest, skill-specific teaching.
3. **Integrated Source-to-Learning Products** (for context & cue continuity):
   - Candidate comparators include: *Readwise Reader*, *Language Reactor*, *Readlang*, *LingQ*, *Migaku*, *FluentU*, *Lingopie*.
   - Evaluated mechanics: exact source locator preservation, cue/timestamp binding, staged capture, cross-surface context survival, review-to-source jump, offline/revision fallbacks.
4. **Secondary Lifecycle Management Products**:
   - Candidate comparators include: *Kolibri* (content management lifecycle).
   - Evaluated mechanics: signed catalog trust, pack install/update/delete, download progress/cancellation, learner record retention.

*Note: Discovery inputs are references for interaction quality, NOT mandatory endorsements or authoritative IELTS assessment models.*

### 6.2 Distrust of Competitor Scoring & Marketing Claims

```text
COMPETITOR_AI_SCORING_CLAIM: UNTRUSTED_MARKETING_SIGNAL
COMPETITOR_BAND_CALIBRATION_CLAIM: UNTRUSTED_MARKETING_SIGNAL
COMPETITOR_EFFICACY_CLAIM: UNTRUSTED_MARKETING_SIGNAL
COMPETITOR_OFFICIAL_EQUIVALENCE: UNTRUSTED_MARKETING_SIGNAL
```

Official IELTS / British Council / IDP sources remain strictly controlling for exam format, timing, scoring semantics, and assessment structure.

### 6.3 Mandatory Reference Record Schema

Every material external reference record in the remediation candidate must follow:

```text
PRODUCT:
SURFACE / CAPABILITY:
OBSERVED_PATTERN:
SOURCE:
SOURCE_TYPE: DIRECT_PRODUCT_INSPECTION / OFFICIAL_DOCS / OFFICIAL_MEDIA / INDEPENDENT_REVIEW / SECONDARY_DESC
OBSERVATION_DATE: YYYY-MM-DD
CURRENTNESS_CONFIDENCE: HIGH / MEDIUM / LOW
WHY_RELEVANT:
LIMITATIONS:
```

---

## 7. Exact Closed Future Remediation Write Allowlist

The future remediation transaction may write to exactly ONE file:

```text
docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md
```

Closed allowlist:

```text
{
  docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md
}
```

All other repository paths are **ZERO_WRITE**. Specifically forbidden to modify:
- historical PR #176;
- historical artifact `docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md`;
- `src/**`;
- `tests/**`;
- `scripts/**`;
- `.github/**`;
- `package.json` / dependencies;
- `docs/stage4/**`;
- `docs/authorizations/**`;
- `docs/MASTER_ROADMAP.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/DECISIONS.md`, `AGENTS.md`.

---

## 8. Accepted Audit Defect Register (Findings 1–9 Contract)

The remediation transaction is bound to resolve the full formal audit defect register from comment `5365836207`:

### Finding 1 (HIGH) — Mandatory Recommendation-Level Quality Scoring
- **Defect**: PR #176 systematically omitted 3 of 8 required qualitative dimensions (`COGNITIVE_LOAD`, `OMNIIELTS_FIT`, `EVIDENCE_CONFIDENCE`) and used an unauthorized 6-field substitute.
- **Remediation Contract**: Every material recommendation in REM-001 must include ALL 8 canonical qualitative scoring dimensions:
  1. `TASK_FIT`: `HIGH` / `MEDIUM` / `LOW`
  2. `INTERACTION_CLARITY`: `HIGH` / `MEDIUM` / `LOW`
  3. `LEARNING_VALUE`: `HIGH` / `MEDIUM` / `LOW`
  4. `COGNITIVE_LOAD`: `LOW` / `MEDIUM` / `HIGH`
  5. `MOBILE_QUALITY`: `HIGH` / `MEDIUM` / `LOW`
  6. `ACCESSIBILITY_SIGNAL`: `HIGH` / `MEDIUM` / `LOW` / `UNKNOWN`
  7. `OMNIIELTS_FIT`: `HIGH` / `MEDIUM` / `LOW`
  8. `EVIDENCE_CONFIDENCE`: `HIGH` / `MEDIUM` / `LOW`
- Zero numerical pseudo-precision. No substitute schemas.

### Finding 2 (HIGH) — Stage 3 Recommendation-Level Traceability
- **Defect**: PR #176 cited only broad lane summaries, lacking recommendation-level mapping to exact Stage 3 identifiers and epistemic tags.
- **Remediation Contract**: REM-001 must map material recommendations to fully qualified canonical Stage 3 requirement identifiers (`R1-F*`, `R1S-F*`, `REQ-EXP-*`, `R2-F*`, `R3-G*`).
- Every recommendation must follow the explicit reasoning form:
  $$\text{CANONICAL\_REQUIREMENT} + \text{REFERENCE\_EVIDENCE} + \text{SYNTHESIS\_REASONING} = \text{RECOMMENDATION}$$
- Mandatory epistemic classification tags:
  `[VERIFIED_STABLE]`, `[RESEARCH_INSIGHT]`, `[DISPUTED_HYPOTHESIS]`, `[OBSOLETE_ASSUMPTION]`.

### Finding 3 (HIGH) — Canonical Current/Future Truth Taxonomy
- **Defect**: PR #176 collapsed and hybridized the canonical current/future truth taxonomy into unauthorized hybrid labels (e.g. `CURRENT + PARTIAL/FUTURE`).
- **Remediation Contract**: REM-001 must use and preserve the exact 7 canonical status labels verbatim:
  1. `[CURRENT]`
  2. `[CURRENT_REHOMED]`
  3. `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]`
  4. `[FUTURE_UX_RESERVED]`
  5. `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]`
  6. `[OWNER_RECONFIRMED_FUTURE]`
  7. `[BACKGROUND_SYSTEM]`
- No visual or semantic implication of runtime completion for future or target capabilities.

### Finding 4 (HIGH) — 48/48 Capability Preservation Traceability
- **Defect**: PR #176 asserted 48/48 capability preservation without auditable trace evidence, omitted secondary lifecycle states, and deferred proof to Wave W3.
- **Remediation Contract**: REM-001 must provide an explicit, complete, auditable traceability table mapping all 48 canonical preserved capabilities (`CAP-01` through `CAP-48`) and omission invariants.
- Must explicitly synthesize preserved secondary systems:
  - Signed catalog trust and verification;
  - Content-pack install, update, and delete with retained learner records;
  - Download progress, cancellation, warning, and error states;
  - Desktop ASR readiness lifecycle: `Connected` / `Disconnected` / `Unavailable`.
- Deferring preservation verification to Wave W3 is strictly forbidden.

### Finding 5 (HIGH) — Owner Decision Reconciliation & Current Truth Semantics
- **Defect**: PR #176 invented false contradictions in canonical behavior and misstated current runtime semantics:
  - Reopened Full Mock Speaking timing variants (which W1/W2 already harmonize);
  - Misclassified current Media Strict/Practice Dictation as unresolved evidence semantics (ignoring runtime `coaching: true` contract);
  - Manufactured an unauthorized default retention policy for `R4-OD002`.
- **Remediation Contract**:
  - Preserve both canonical Full Mock Speaking paths (immediate sequential after LRW or independently scheduled);
  - Faithfully represent current runtime Media Dictation evidence truth (`coaching: true` envelope under `EvidencePolicy`);
  - Clearly separate future evidence-capable proposals from current coaching semantics;
  - Remove any claim of an authorized retention default for `R4-OD002` (preserve owner choice);
  - Never reopen settled W1/W2 semantics without verified canonical conflict.

### Finding 6 (MEDIUM) — Owner Decision Schema Compliance
- **Defect**: PR #176 used an invalid identifier prefix (`OD-PREW3-*`) and omitted the mandatory `WHY_OWNER_DECISION_REQUIRED` field.
- **Remediation Contract**: Any newly identified reference-synthesis owner decision must adhere strictly to:
  ```text
  OD-REF-###
  SUBJECT:
  OPTIONS:
  EVIDENCE:
  TRADEOFF:
  RECOMMENDED_OPTION:
  WHY_OWNER_DECISION_REQUIRED:
  ```
- Existing canonical decisions (`R4-OD001` through `R4-OD006`) must retain their canonical IDs. Do not manufacture trivial decisions.

### Finding 7 (HIGH) — Specialist IELTS Competitor UX Reference Synthesis
- **Defect**: PR #176 cited zero specialist non-official IELTS learning products, leaving critical W3 interaction mechanics unreferenced.
- **Remediation Contract**: REM-001 must conduct fresh specialist IELTS product research (e.g. *IELTS Online Tests*, *E2*, *Magoosh*, *SmallTalk2Me*, *IELTS Practice Band 9*, *GEL IELTS Flex*, *TestGlider*).
- Synthesize interaction mechanics for:
  - Passage/audio-grounded answer explanation and localization;
  - Incorrect-answer filtering, retry, and question-type remediation;
  - Writing and Speaking evaluation feedback hierarchy, latency, and criterion drill-down;
  - Recording history and privacy controls;
  - Full Mock onboarding, diagnostic framing, and result $\to$ next-action routing;
  - Desktop mock versus mobile practice allocation.
- Competitor scoring, band calibration, and efficacy claims remain strictly untrusted.

### Finding 8 (HIGH) — Source-to-Learning Complete Continuity Loop
- **Defect**: PR #176 stopped source return at Capture and separated remediation from evidence, failing to synthesize navigable return to the exact source cue.
- **Remediation Contract**: REM-001 must synthesize the complete, closed-loop lifecycle:
  $$\text{SOURCE} \to \text{INGEST/READ/WATCH} \to \text{SENTENCE/CUE IDENTITY} \to \text{CONTEXTUAL UNDERSTANDING} \to \text{STAGED CAPTURE} \to \text{CONFIRMATION} \to \text{LEARNING} \to \text{SPACED REVIEW} \to \text{PRODUCTIVE/TRANSFER} \to \text{ERROR/REMEDIATION} \to \text{EXACT ORIGINAL SOURCE/CUE RETURN}$$
- The contract must define state and locator preservation for:
  - `source_id`, `source_revision`, `sentence_or_cue_id`, passage position, media timestamp;
  - Desktop and mobile source return from Vocabulary cards and Error Notebook entries;
  - Graceful degradation for deleted, modified, private, or offline sources, and unaligned cues;
  - Staged capture substrate preservation and default-deny evidence integrity.

### Finding 9 (HIGH) — First-Class Instructional System & IELTS Skills Curriculum
- **Defect**: PR #176 collapsed teaching into post-attempt feedback hierarchies, omitting the canonical W1 Skills Curriculum and Stage 3 instructional cycle.
- **Remediation Contract**: REM-001 must reference-synthesize a first-class instructional system within existing IELTS ownership:
  - Preserving canonical W1 model:
    $$\text{Model Analysis} \to \text{Guided Reconstruction} \to \text{Independent Trial}$$
  - Preserving canonical Stage 3 instructional cycle:
    $$\text{DIAGNOSE} \to \text{TEACH} \to \text{WORKED/CONTRASTIVE EXAMPLE} \to \text{GUIDED PRACTICE} \to \text{SCAFFOLD FADING} \to \text{INDEPENDENT ATTEMPT} \to \text{ELABORATED FEEDBACK} \to \text{MISCONCEPTION REMEDIATION} \to \text{CLEAN RETRY} \to \text{DELAYED/VARIED RETEST} \to \text{TRANSFER}$$
  - Explicitly enforcing instructional invariants:
    $$\text{FEEDBACK} \neq \text{TEACHING}$$
    $$\text{IMMEDIATE\_CORRECTION} \neq \text{DELAYED\_RETEST}$$
    $$\text{REVISION} \neq \text{TRANSFER}$$
  - Applying this synthesis across all 5 skill areas (Vocabulary/Collocation, Listening, Reading, Writing, Speaking);
  - Incorporating fresh teaching-product research (e.g. *Duolingo Explain My Answer*, *Busuu Mistake Repair*, *CommonLit Target Lessons*, *British Council Lesson Plans*, *Cambridge Write & Improve*);
  - Strictly avoiding the invention of an ungrounded universal AI tutor or representing future automation as current runtime.

---

## 9. Deduplicated Whole-Product Experience Gaps (Root Gaps A–E)

REM-001 must explicitly close the five deduplicated whole-product experience root gaps identified in the audit:

| Root Gap ID | Domain | Remediation Requirement |
|---|---|---|
| **Root Gap A (G1)** | Instructional Curriculum & Faded Scaffolding | Reconcile diagnostic $\to$ teaching $\to$ worked/contrastive example $\to$ guided practice $\to$ scaffold fading $\to$ independent trial $\to$ clean retry $\to$ delayed/varied retest $\to$ transfer. |
| **Root Gap B (G2)** | Exact Source/Cue Continuity | Establish navigable source identity (`source_id`, `revision`, `cue_id`, timestamp/locator) surviving capture, learning, review, error, remediation, and return across desktop and mobile. |
| **Root Gap C (G3)** | IELTS Learning UX & Specialist Reference Synthesis | Reconcile official test fidelity with specialist IELTS learning UX, question-type instruction, and Full Mock scorecard $\to$ targeted remediation handoff. |
| **Root Gap D (G4)** | Global Search, Discovery & Knowledge Reuse | Determine UX ownership, scope (non-exam), result classes, contextual jump, mobile/offline fallbacks, and progressive disclosure without creating duplicate stores or top-level tabs. |
| **Root Gap E (G5)** | Signed Content Lifecycle & Desktop ASR Readiness | Reference-synthesize signed catalog trust, pack install/update/delete/retained-records lifecycle, and Desktop ASR `Connected` / `Disconnected` / `Unavailable` operational states. |

---

## 10. Three-Axis Whole-Product Experience Synthesis Contract

The remediation candidate must synthesize across three orthogonal axes to prevent screen-only superficial coverage:

### Axis A — 15 Canonical Screen Classes
Must cover all 15 canonical screen classes and their material variants:
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
11. Writing Task 1 (Academic & GT);
12. Writing Task 2;
13. Speaking;
14. Full Mock;
15. Settings / Privacy / Data Safety.

### Axis B — End-to-End Experience Systems
Must synthesize all 22+ material experience systems:
1. Onboarding / re-entry / Today guidance;
2. Source $\to$ understanding $\to$ capture $\to$ learning;
3. Teaching / instruction / curriculum progression;
4. Practice $\to$ feedback $\to$ retry;
5. Spaced review / retention (FSRS);
6. Productive use / transfer;
7. Error $\to$ remediation $\to$ clean retest;
8. Motivation / habit / backlog / re-entry;
9. Global Search / discovery / knowledge reuse;
10. Library / capture / content lifecycle (signed packs);
11. Vocabulary / collocation learning;
12. Listening learning;
13. Reading learning;
14. Writing learning;
15. Speaking learning;
16. IELTS skill practice;
17. IELTS strict exam simulation;
18. Full Mock $\to$ scorecard $\to$ targeted remediation;
19. Analytics $\to$ next action;
20. Personalization / recommendation / adaptation;
21. AI assistance / coaching safeguards;
22. Data / privacy / consent / recovery;
23. Device/service readiness lifecycle (Desktop ASR);
24. Evidence receipt / provenance / dispute integrity.

### Axis C — Cross-Cutting Qualities
Every material experience system must be evaluated against:
- Learner agency;
- Assistance / evidence integrity (`EvidencePolicy` default-deny);
- Current / future truth taxonomy;
- Capability preservation (48/48 trace);
- Mobile and responsive ergonomics;
- Accessibility and assistive technology;
- Offline, degraded, and fallback behaviors;
- Interruption recovery and state resilience;
- Privacy, consent, and data safety;
- Cross-surface context continuity;
- Anti-RPS and duplication prevention;
- Reference coverage completeness;
- Learning-versus-exam strict separation.

### Adversarial Failure Patterns to Prevent
The candidate must explicitly guard against and audit:
```text
SCREEN_COVERAGE_PASS BUT END_TO_END_EXPERIENCE_GAP
CAPABILITY_PRESERVED BUT LEARNING_JOURNEY_FRAGMENTED
REFERENCE_PRESENT BUT REFERENCE_COVERAGE_NOT_FIT_FOR_PROBLEM
GOOD_PRACTICE_UX BUT WEAK_TEACHING_UX
GOOD_EXAM_FIDELITY BUT WEAK_IELTS_LEARNING_UX
GOOD_INDIVIDUAL_SURFACES BUT BROKEN_CROSS_SURFACE_HANDOFF
```

---

## 11. Specialized Subsystem & Domain Contracts

### 11.1 Video / Media Learning Contract
- **Stable Workspace Hypothesis**: Research must evaluate preserving media player, selected sentence, transcript context, and drafts across mode switches without canonicalizing unratified state.
- **6 Activity Modes**: Watch/Normal, Noticing, Shadowing, Strict Dictation, Practice Dictation, Retell.
- **Guided 7-Step Session**: Reusable orchestration layer with explicit Continue, Skip, Change Activity, Exit, and fatigue controls.
- **Dictation Task Types**: Owner-binding constraints:
  ```text
  TARGET TASK TYPES: FILL_GAPS, FULL_SENTENCE
  WORD_REARRANGEMENT: REJECTED_BY_OWNER
  ```
- **Evidence Integrity**:
  ```text
  SHADOWING: COACHING_ONLY
  CURRENT_MEDIA_DICTATION: COACHING_ONLY (under current runtime)
  RETELL != ALWAYS_COACHING_ONLY (unassisted Retell requires evaluator before evidence)
  ```

### 11.2 Vocabulary & Collocation Contract
- Multi-modal learning (recognition, cloze, typing, dictation, pronunciation, production).
- Active vs passive learning goals.
- Staged capture substrate (confirm before cold-start FSRS schedule).
- Return-to-source locator integration on every card.

### 11.3 IELTS Exam Simulation vs Learning/Practice Separation
- **Strict Exam Fidelity**: Official IELTS/BC/IDP rules controlling for runners, timers, navigation, and submission. Zero learning aids, hints, vocabulary tools, or streak UX during strict simulation.
- **Scorecard $\to$ Remediation Handoff**:
  $$\text{FULL MOCK} \to \text{SCORECARD} \to \text{OBSERVED RESULTS / LIMITATIONS} \to \text{TARGETED NEXT ACTION} \to \text{SKILL TEACHING / PRACTICE} \to \text{OPTIONAL LATER REASSESSMENT}$$
- One mock attempt must NOT become FSRS evidence or holistic mastery truth.
- Both Full Mock Speaking paths preserved (immediate post-LRW or scheduled).

### 11.4 Learn $\to$ Practice $\to$ Exam Coherence
- Synthesize the holistic relationship:
  $$\text{LEARN} \to \text{PRACTICE} \to \text{EXAM / MOCK} \to \text{REVIEW} \to \text{REMEDIATION} \to \text{LATER REASSESSMENT}$$
- Invariants:
  ```text
  RECOMMENDED_PATH != REQUIRED_PATH
  CURRICULUM_PATH != NAVIGATION_LOCK
  GUIDED_SEQUENCE != MANDATORY_GLOBAL_SEQUENCE
  ```
- Learner retains direct access to skill sections, practice drills, and Full Mock.

### 11.5 Global Search, Discovery & Knowledge Reuse Contract
- UX ownership derived from canonical evidence (non-exam utility).
- Non-exam scope: search spans saved cards, transcripts, reading passages, notes, error history.
- 6 Navigable Result Classes:
  1. `SOURCE` (article/media);
  2. `VOCAB_COLLOCATION` (lexical items);
  3. `ERROR_REMEDIATION` (error entries and evidence);
  4. `IELTS_CONTENT` (lessons, tips, sample tasks);
  5. `CONTENT_PACK` (installed resources);
  6. `LEARNING_HISTORY` (prior attempts/transcripts).
- Every result must return to its canonical owning context.
- Offline/degraded states: honest handling when search index is unavailable or rebuilding.
- Anti-RPS: Search reveals existing data; it does NOT create a parallel storage layer.

### 11.6 Secondary Lifecycles: Signed Content Packs & Desktop ASR
- **Content Pack Lifecycle**: Signed catalog trust verification, install, update, delete, progress/cancellation, warning/error, and retention of learner records upon pack deletion.
- **Desktop ASR Readiness Lifecycle**: Explicit UI states and recovery for `Connected`, `Disconnected`, and `Unavailable`.

---

## 12. Canonical Preservation & Invariant Rules

### 12.1 48/48 Preservation Traceability
External patterns are reference evidence, not authority to delete canonical capabilities.
$$
\text{REFERENCE\_PATTERN} \neq \text{AUTHORITY\_TO\_DELETE\_CAPABILITY}
$$
$$
\text{CAPABILITY\_PRESERVED} \neq \text{CAPABILITY\_ALWAYS\_VISIBLE}
$$

Grouping, rehoming, progressive disclosure, and contextual activation are valid only when semantic reachability and behavior survive intact.

### 12.2 Binding W2 Invariants
The remediation research must preserve:
```text
RECOMMENDED_PATH != REQUIRED_PATH
MEDIA_MODE != GUIDED_LOOP_STEP
GUIDED_SEQUENCE != MANDATORY_GLOBAL_SEQUENCE
UNASSISTED != AUTOMATIC_FSRS_UPDATE
OMNIIELTS_LEARNING_UI != IELTS_EXAM_SIMULATION_UI
R4-OD006 = OPTION_A_EPHEMERAL_RAW_AUDIO
```

---

## 13. Anti-RPS and Duplication Prevention

Every material recommendation must be classified into Anti-RPS categories:
- **Class A**: Genuinely new user capability (strictly justified);
- **Class B**: Improved presentation of existing capability;
- **Class C**: Variant/state of existing capability;
- **Class D**: Duplicate UX (forbidden/rejected);
- **Class E**: Unnecessary feature-wall expansion (forbidden/rejected).

Core Architecture Preference:
$$
\text{ONE\_CAPABILITY} + \text{MULTIPLE\_STATES} \gg \text{DUPLICATE\_PAGES\_OR\_STORES}
$$

---

## 14. Current / Future Truth Taxonomy

The candidate must enforce the verbatim 7-label taxonomy:
1. `[CURRENT]`: Active in production runtime.
2. `[CURRENT_REHOMED]`: Active in runtime, rehomed under Stage 4 navigation.
3. `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]`: Target Stage 4 capability, not yet built.
4. `[FUTURE_UX_RESERVED]`: Reserved for future stages (Stage 5+).
5. `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]`: Future capability with partial runtime scaffolding.
6. `[OWNER_RECONFIRMED_FUTURE]`: Formally deferred by Human Owner (e.g. Interactive AI Examiner).
7. `[BACKGROUND_SYSTEM]`: Headless background engine/service.

---

## 15. Recommendation Quality Scoring Contract

Every material recommendation must be scored qualitatively across all 8 dimensions:
- `TASK_FIT`: `HIGH` / `MEDIUM` / `LOW`
- `INTERACTION_CLARITY`: `HIGH` / `MEDIUM` / `LOW`
- `LEARNING_VALUE`: `HIGH` / `MEDIUM` / `LOW`
- `COGNITIVE_LOAD`: `LOW` / `MEDIUM` / `HIGH`
- `MOBILE_QUALITY`: `HIGH` / `MEDIUM` / `LOW`
- `ACCESSIBILITY_SIGNAL`: `HIGH` / `MEDIUM` / `LOW` / `UNKNOWN`
- `OMNIIELTS_FIT`: `HIGH` / `MEDIUM` / `LOW`
- `EVIDENCE_CONFIDENCE`: `HIGH` / `MEDIUM` / `LOW`

Zero numerical pseudo-precision.

---

## 16. Owner Decision Contract

Any newly identified owner decision must follow the canonical schema:
```text
OD-REF-###
SUBJECT:
OPTIONS:
EVIDENCE:
TRADEOFF:
RECOMMENDED_OPTION:
WHY_OWNER_DECISION_REQUIRED:
```

Existing canonical decisions (`R4-OD001` through `R4-OD006`) must retain their canonical IDs. A research recommendation does not become canonical fact without separate Owner ratification:
$$
\text{RESEARCH\_RECOMMENDATION} \neq \text{OWNER\_RATIFICATION}
$$

---

## 17. Future Remediation Research Method & Protocol

The future remediation researcher must execute the following 10-step protocol:

1. **Fresh Canonical Ingestion**: Fresh-read all controlling canonical documents (`AGENTS.md`, Protocol V2, W0/W1/W2, Stage 3 research sources);
2. **Historical Read-Only Inspection**: Fresh-read the rejected candidate artifact strictly as a read-only research input;
3. **Audit Verdict Binding**: Fresh-read the complete amended independent audit verdict (`5365836207`);
4. **Factual Runtime Inspection**: Inspect production source and tests strictly where needed for current/future factual accuracy;
5. **Fresh External Discovery**: Perform fresh web and product research to resolve specialist IELTS, instructional, source-continuity, and lifecycle gaps;
6. **Revalidation of Prior Findings**: Re-validate and preserve sound findings from the rejected candidate; discard invalid or unproven claims;
7. **Synthesis & Quality Scoring**: Apply 8-dimensional qualitative scoring and Anti-RPS classification to every material recommendation;
8. **Traceability Restoration**: Rebuild auditable mappings from canonical Stage 3 requirements to synthesis recommendations;
9. **Preservation & Invariant Verification**: Verify 48/48 capability preservation trace and secondary lifecycle states;
10. **Candidate Materialization**: Produce exactly ONE coherent, remediated research artifact: `docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md`.

---

## 18. Required Structure for the REM-001 Candidate Artifact

The materialized artifact (`docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md`) must contain:

1. Executive Summary & Remediation Baseline
2. Controlling Authority & Audit Defect Disposition Matrix (9/9 findings)
3. Research Methodology & Evidence Quality Standards
4. Comprehensive Reference Source Register (Specialist IELTS, Instructional, Source-Continuity, Lifecycle)
5. Three-Axis Whole-Product Experience Matrix (Axis A, Axis B, Axis C)
6. 15 Canonical Screen-Class Syntheses & Material Variants
7. Video / Media Experience Deep Dive (6 modes, 7-step session, stable workspace, dictation/shadowing/retell)
8. Vocabulary & Collocation Experience Deep Dive (multimodal, active/passive, staged capture)
9. Instructional Curriculum & Faded Scaffolding Deep Dive (Root Gap A / G1)
10. Exact Source-to-Learning & Context Continuity Deep Dive (Root Gap B / G2)
11. Specialist IELTS Learning & Practice Experience Deep Dive (Root Gap C / G3)
12. Global Search, Discovery & Knowledge Reuse Deep Dive (Root Gap D / G4)
13. Preserved Secondary Lifecycles Deep Dive (Signed Content Packs & Desktop ASR / Root Gap E / G5)
14. Mobile, Responsive & Accessibility Synthesis
15. Anti-RPS & Duplication Prevention Register
16. 48/48 Capability Preservation & Omission Invariants Traceability Matrix
17. Current / Future Truth Register (7 verbatim labels)
18. KEEP / ADAPT / REJECT Master Recommendation Register (with 8-dimensional scores)
19. Owner Decision Register (`OD-REF-###`)
20. Recommended Wave W3 Input Contract
21. Limitations & Unresolved Items

---

## 19. Future Remediation Branch, Pull Request & CI Contract

If repository mechanics are authorized:

```text
BRANCH: research/stage4-prew3-whole-app-reference-synthesis-rem-001
BASE: fresh canonical origin/main
PULL_REQUEST: Draft PR targeting main
```

The future remediation PR must:
- target fresh canonical `main`;
- contain exactly one changed path (`docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md`);
- cite rejected PR #176 as historical read-only predecessor;
- cite audit comment `5365836207` as the controlling accepted defect register;
- remain in Draft status;
- receive natural `pull_request` CI;
- remain strictly unmerged.

---

## 20. Future Remediation Quality Gates

Before reporting completion, the remediation researcher must verify:

```text
AUDIT_FINDINGS_RECONCILED: 9/9
ROOT_EXPERIENCE_GAPS_RESOLVED: 5/5
MANDATORY_RECOMMENDATION_SCORING: PASS (all 8 dimensions on all material recommendations)
STAGE3_EXACT_TRACEABILITY: PASS (fully qualified IDs + epistemic tags)
CURRENT_FUTURE_TRUTH: PASS (7 canonical labels verbatim)
CAPABILITY_PRESERVATION: 48/48 VERIFIED
OMISSION_INVARIANTS: ALL VERIFIED
SIGNED_CONTENT_LIFECYCLE: PASS
DESKTOP_ASR_READINESS: PASS
IELTS_OFFICIAL_REFERENCE_COVERAGE: PASS
IELTS_COMPETITOR_UX_REFERENCE_COVERAGE: PASS
IELTS_REFERENCE_SYNTHESIS: PASS
SOURCE_TO_LEARNING_REFERENCE_COVERAGE: PASS
SOURCE_CONTEXT_CONTINUITY: PASS
CAPTURE_TO_LEARNING_HANDOFF: PASS
CROSS_SURFACE_SOURCE_REUSE: PASS
TEACHING_UX_REFERENCE_COVERAGE: PASS
INSTRUCTION_TO_INDEPENDENT_PRACTICE_LOOP: PASS
MISCONCEPTION_REMEDIATION: PASS
SCAFFOLD_FADING: PASS
SKILL_SPECIFIC_TEACHING: PASS
GLOBAL_SEARCH_KNOWLEDGE_REUSE: PASS
LEARN_PRACTICE_EXAM_COHERENCE: PASS
FULL_MOCK_REMEDIATION_HANDOFF: PASS
SCREEN_COVERAGE: 15/15
MATERIAL_VARIANTS: PASS
WHOLE_PRODUCT_EXPERIENCE_COVERAGE: PASS (22+ systems)
END_TO_END_LEARNING_SYSTEM_COHERENCE: PASS
CROSS_SURFACE_HANDOFFS: PASS
ANTI_RPS: PASS
MOBILE: PASS
ACCESSIBILITY: PASS
W3_EXECUTION: NOT_PERFORMED
INDEPENDENT_ACCEPTANCE: NOT_PERFORMED
PACKAGE_ACCEPTANCE: NOT_GRANTED
MERGE_AUTHORITY: NOT_GRANTED
```

---

## 21. Remediation Completion State & Audit Boundary

The future remediation transaction must terminate at:

```text
RESEARCH_REMEDIATION_COMPLETE_PENDING_INDEPENDENT_REAUDIT
```

or:

```text
BLOCKED
```

The remediation researcher may NOT report `ACCEPT`. A separate, unpolluted Independent Auditor session must re-audit the exact REM-001 candidate against this manifest and the defect register.

---

## 22. Downstream Boundaries & Hard Prohibitions

### 22.1 Downstream Boundaries
This manifest grants ZERO authority for:
```text
W3_WIREFRAMES: NOT_AUTHORIZED
W3_LAYOUT_SELECTION: NOT_AUTHORIZED
W4_DESIGN_SYSTEM: NOT_AUTHORIZED
W5_HIFI_SPECS: NOT_AUTHORIZED
W6_PROTOTYPE: NOT_AUTHORIZED
STAGE5_TECH_SELECTION: NOT_AUTHORIZED
STAGE6_IMPLEMENTATION: NOT_AUTHORIZED
```

### 22.2 Hard Prohibitions for the Future Remediation Researcher
The future researcher must NOT:
- modify or force-push PR #176;
- rewrite historical rejected commits;
- modify `src/**`, `tests/**`, `scripts/**`, `.github/**`, `package.json`;
- modify W0/W1/W2 canonical documents or reopen accepted W2 semantics;
- modify Stage 3 accepted research documents;
- modify authorization manifests;
- implement production UI, final wireframes, hi-fi layouts, or visual tokens;
- select AI providers, model sizes, ASR dependencies, database engines, or search libraries;
- restore Dictation Word Rearrangement;
- weaken official IELTS fidelity;
- treat competitor AI scoring or efficacy claims as valid;
- grant independent acceptance, package acceptance, or merge authority;
- self-audit or self-accept.

---

## 23. Execution Stop Conditions & Fail-Closed Triggers

Execution must immediately STOP and fail closed if any of the following occur:

1. `CANONICAL_BASE_DRIFT`: Working branch base ref diverges from canonical `origin/main`;
2. `SCOPE_VIOLATION`: Required write touches files outside `{ docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md }`;
3. `AUDIT_DEFECT_OMISSION`: Any of the 9 formal audit findings or 5 root gaps cannot be remediated;
4. `PRESERVATION_DEFICIT`: Any of the 48 preserved capabilities or secondary lifecycles cannot be proven;
5. `CANONICAL_CONTRADICTION`: A recommendation directly contradicts canonical W0/W1/W2 authority without an explicit `OD-REF-###` escalation;
6. `HISTORICAL_MUTATION_ATTEMPT`: Any tool call attempts to modify PR #176 or rewrite rejected Git history;
7. `UNAUTHORIZED_MERGE`: Any attempt to merge candidate branches without explicit merge authority.
