# STAGE 4 PRE-W3 WHOLE-APP REFERENCE SYNTHESIS REMEDIATION-AUTHORIZATION MANIFEST

**Manifest Identity**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-REM-001`  
**Authorized Future Transaction**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001`  
**Transaction Class**: `RESEARCH REMEDIATION AUTHORIZATION / SUPPLEMENTAL UX REFERENCE SYNTHESIS GOVERNANCE`  
**Stage**: `STAGE 4 - UX / IA REMAKE`  
**Relationship**: `REMEDIATION OF REJECTED AUTHORIZATION CANDIDATE (PR #177) FOR REMEDIATION OF REJECTED PRE-W3 RESEARCH CANDIDATE (PR #176) / SUPPLEMENTAL RESEARCH GATE BEFORE W3`  
**Authoring Base**: `e7fb8e84b19606909daa3e8dbe8aa5708ea4c1a6` (current canonical `main`)  
**Controlling Protocol**: [`docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`](../governance/EXECUTION_PROMPT_PROTOCOL_V2.md)  
**Stage 4 Authority Context**: [`docs/authorizations/STAGE4-UXIA-AUTH-001.md`](STAGE4-UXIA-AUTH-001.md)  
**Historical Predecessor Original Research Authorization**: [`docs/authorizations/STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-AUTH-001.md`](STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-AUTH-001.md) (historical original research authority only)  
**Historical Rejected Research Transaction**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-001` (PR `#176`, Head `644d444e01dca237b448acae35ccb176daf13f29`, Artifact `docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md`, Blob `e74b3a324304878b456f62c955762fe48eff86a5`, Audit Verdict `REJECT` via Comment ID `5365836207`)  
**Historical Rejected Remediation-Authorization Transaction**: `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-001` (PR `#177`, Head `474cfc6ed4218407fb3d28df4f2cb5c14b58bfc8`, Artifact `docs/authorizations/STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-001.md`, Blob `69e38f2bbb68378c748b066dbbfc93a2bfd72555`, Audit Verdict `REJECT` via Comment ID `5368603672`)  
**Canonical W0/W1/W2 Inputs**: [`STAGE4_UXIA_STRATEGY.md`](../stage4/STAGE4_UXIA_STRATEGY.md), [`STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`](../stage4/STAGE4_CAPABILITY_PRESERVATION_MATRIX.md), [`STAGE4_INFORMATION_ARCHITECTURE.md`](../stage4/STAGE4_INFORMATION_ARCHITECTURE.md), [`STAGE4_USER_JOURNEYS.md`](../stage4/STAGE4_USER_JOURNEYS.md), [`STAGE4_INTERACTION_AND_STATE_MODEL.md`](../stage4/STAGE4_INTERACTION_AND_STATE_MODEL.md)  
**Canonical Stage 3 Inputs**: [`STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`](../research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md), [`R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md`](../research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md), [`R1_LEARNING_PRODUCT_RESEARCH.md`](../research/R1_LEARNING_PRODUCT_RESEARCH.md), [`R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`](../research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md), [`R3_PIPELINE_ARCHITECTURE_RESEARCH.md`](../research/R3_PIPELINE_ARCHITECTURE_RESEARCH.md), [`R4_CROSS_RESEARCH_RECONCILIATION.md`](../research/R4_CROSS_RESEARCH_RECONCILIATION.md)  
**Candidate Status**: `AUTHORIZATION_CANDIDATE / REMEDIATION_AUTHORITY_NOT_EFFECTIVE`  
**Merge Authority**: `NOT_GRANTED`  

---

## 1. Purpose and Authority Separation

This manifest establishes a corrected, bounded authorization candidate for the future research remediation transaction (`STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001`). It remediates all authorization defects accepted in the independent audit of PR #177 (Comment ID `5368603672`), while binding the future research transaction to remediate all formal findings of the independent research audit of PR #176 (Comment ID `5365836207`).

It strictly enforces the repository authority taxonomy:

$$
\text{RESEARCH} \neq \text{SPECIFICATION} \neq \text{AUTHORIZATION} \neq \text{IMPLEMENTATION} \neq \text{EVIDENCE} \neq \text{INDEPENDENT ACCEPTANCE} \neq \text{MERGE AUTHORITY}
$$

Core Governance Principles:

$$
\text{RESEARCH\_GAP} \neq \text{PRODUCT\_AUTHORITY}
$$

$$
\text{AUDIT\_FINDING} \neq \text{AUTHORITY\_TO\_PRESELECT\_SOLUTION}
$$

$$
\text{REFERENCE\_PATTERN} \neq \text{CANONICAL\_BEHAVIOR}
$$

$$
\text{REMEDIATION\_REQUIRED} \neq \text{REMEDIATION\_AUTHORIZED}
$$

The authorized future output of transaction `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001` remains strictly:

```text
RESEARCH REMEDIATION
+
SUPPLEMENTAL UX REFERENCE SYNTHESIS
```

This manifest does NOT authorize:
- execution of future research transaction `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001`;
- external product research execution in the authoring session;
- Wave W3 execution or wireframe design;
- runtime implementation or production code modification;
- selection of backend databases, search engines, AI models, or ASR dependencies;
- canonical data-schema or persistence alterations;
- conversion of research hypotheses or competitor examples into canonical product requirements;
- independent acceptance or self-audit;
- repository merge authority.

---

## 2. Activation Gate and Exact Authority State

### 2.1 Before Independent Acceptance and Canonical Integration

```text
AUTHORIZATION_CANDIDATE: PRESENT
REM-001 AUTHORITY: NOT_EFFECTIVE
TARGET_REMEDIATION_TRANSACTION: NOT_EXECUTABLE
```

Authoring this manifest, creating a branch, opening a Draft PR, or receiving green CI does NOT make remediation authority effective.

### 2.2 Effective Authority Transition

Future remediation research authority becomes effective **ONLY** after all of the following sequential conditions are satisfied:

1. This exact authorization candidate (`STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-REM-001`) receives a formal, independent `ACCEPT` verdict from an unpolluted Independent Auditor session;
2. The exact accepted authorization manifest is canonically integrated into `main` by the repository owner;
3. A future remediation researcher fresh-verifies repository identity and canonical `main` HEAD;
4. That researcher fresh-reads all controlling canonical documents, this integrated authorization manifest, and the complete text of controlling formal audit comments `5365836207` (PR #176) and `5368603672` (PR #177).

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

### 3.1 Historical PR #176 and PR #177 Freeze

Both rejected historical candidates remain permanently frozen and read-only:

```text
HISTORICAL REJECTED RESEARCH CANDIDATE:
PR: #176
REJECTED HEAD: 644d444e01dca237b448acae35ccb176daf13f29
REJECTED ARTIFACT: docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md
REJECTED BLOB: e74b3a324304878b456f62c955762fe48eff86a5
AUDIT VERDICT: REJECT (Comment ID: 5365836207)

HISTORICAL REJECTED AUTHORIZATION CANDIDATE:
PR: #177
REJECTED HEAD: 474cfc6ed4218407fb3d28df4f2cb5c14b58bfc8
REJECTED ARTIFACT: docs/authorizations/STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-001.md
REJECTED BLOB: 69e38f2bbb68378c748b066dbbfc93a2bfd72555
AUDIT VERDICT: REJECT (Comment ID: 5368603672)
```

The future remediation researcher must NOT:
- force-push, amend, or commit to PR #176 or PR #177;
- rewrite historical rejected commits;
- overwrite, mutate, or replace formal audit comments;
- claim that either historical candidate became accepted.

### 3.2 Required Lineage Arc

The strict governance lineage is:

```text
PR #176 RESEARCH REJECT (5365836207)
        │
        ▼
PR #177 AUTH CANDIDATE REJECT (5368603672)
        │
        ▼
NEW AUTH-REM-001 CANDIDATE (STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-REM-001)
        │
        ▼
NEW INDEPENDENT AUTH AUDIT
        │
        ▼
OWNER INTEGRATION IF ACCEPT
        │
        ▼
ONLY THEN FUTURE REM-001 RESEARCH EXECUTION (docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md)
```

Historical text from rejected candidates carries zero presumption of correctness and must be independently re-verified against canonical authority before any insight is cited.

---

## 4. Authorized Future Remediation Mission & Scope

Once effective, transaction `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001` is authorized to:

1. Fresh-read all controlling canonical documents, Stage 3 research sources, and both formal audit defect registers;
2. Fresh-read historical rejected candidates strictly as read-only inputs;
3. Factually inspect runtime, source, and tests strictly where needed to establish current versus future truth;
4. Perform fresh, read-only, side-effect-free external web and product research to resolve specialist IELTS, instructional, source-continuity, and lifecycle gaps;
5. Remediate all 10 formal audit findings and 5 whole-product root gaps from PR #176;
6. Synthesize across three orthogonal axes:
   - **Axis A**: 15 Canonical Screen Classes and their material variants;
   - **Axis B**: 22+ End-to-End Experience Systems;
   - **Axis C**: Cross-Cutting Qualities;
7. Establish an auditable 48/48 capability preservation trace using exact canonical IDs (`CAP-001` through `CAP-048`) without deferring verification to Wave W3;
8. Apply rigorous qualitative scoring across all 8 mandatory dimensions to every material recommendation;
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
historical PR #176 and PR #177 candidate artifacts and audit comments
```

Runtime/source/test inspection is strictly read-only and must be targeted to establishing factual current/future truth. `READ_SCOPE != WRITE_SCOPE`.

---

## 6. External Research Authority & Quality Standards

The future remediation transaction is authorized to conduct read-only external research via:
- web search and browser inspection;
- public product interfaces, public demos, and public documentation;
- official product documentation, knowledge bases, and help centers;
- official product videos, tutorials, and screenshots;
- reputable independent walkthroughs and reviews where primary access is limited;
- owner-supplied reference materials.

### 6.1 Strict Prohibition of External Account Side Effects

Without separate, explicit Human Owner authorization, the future researcher is **STRICTLY PROHIBITED** from:
- making financial purchases or initiating paid subscriptions;
- enrolling in trials that create financial obligations or recurring billing;
- creating external user accounts or registering services;
- publishing, posting, commenting, or interacting on external public forums;
- uploading private repository code, architecture, or proprietary documentation;
- uploading user data, learner receipts, or private learning histories;
- executing irreversible external account or resource actions;
- accepting nontrivial terms of service or legal agreements on behalf of the repository owner;
- modifying external product state or remote environments.

Permitted external research must strictly prefer:
1. public product web interfaces and public interactive demos;
2. official documentation, guides, and help centers;
3. official product media, screenshots, and videos;
4. reputable third-party walkthroughs and technical reviews;
5. already-authorized, pre-existing read-only access where available without modification.

If a material reference cannot be verified without a prohibited side effect:
```text
RECORD_EVIDENCE_LIMITATION
or
MARK_BLOCKED
```
Do not improvise permission or bypass safety constraints.

### 6.2 Specialist Comparator Discovery Boundaries

External reference products are discovery inputs for interaction mechanics, NOT compulsory winners, canonical behaviors, or scoring truths:

1. **Specialist IELTS-Learning & Practice Products**:
   - Candidate comparators include: *IELTS Online Tests*, *E2 IELTS*, *Magoosh IELTS*, *SmallTalk2Me*, *IELTS Practice Band 9*, *GEL IELTS Flex*, *TestGlider IELTS*.
   - Evaluated mechanics: passage/audio-grounded explanations, answer-location locators, incorrect-answer filtering/retry, question-type remediation, Writing/Speaking feedback latency and hierarchy, recording history/privacy, Full Mock onboarding/results handoff, desktop mock versus mobile drill allocation.
2. **Instructional Curriculum & Teaching Products**:
   - Candidate comparators include: *Duolingo* (Explain My Answer), *Busuu* (Mistake Repair), *CommonLit* (Target Lessons), *British Council IELTS Teaching Resources*, *Cambridge Write & Improve*.
   - Evaluated mechanics: diagnostic routing, model analysis, worked/contrastive examples, guided reconstruction, scaffold fading, clean retry, delayed/varied retest, skill-specific teaching.
3. **Integrated Source-to-Learning Products**:
   - Candidate comparators include: *Readwise Reader*, *Language Reactor*, *Readlang*, *LingQ*, *Migaku*, *FluentU*, *Lingopie*.
   - Evaluated mechanics: exact source locator preservation, cue/timestamp binding, staged capture, cross-surface context survival, review-to-source jump, offline/revision fallbacks.
4. **Secondary Lifecycle Management Products**:
   - Candidate comparators include: *Kolibri* (content management lifecycle).
   - Evaluated mechanics: signed catalog trust, pack install/update/delete, download progress/cancellation, learner record retention.

### 6.3 Distrust of Competitor Scoring & Marketing Claims

$$
\text{COMPETITOR\_AI\_SCORING\_CLAIM} = \text{UNTRUSTED\_MARKETING\_SIGNAL}
$$

$$
\text{COMPETITOR\_BAND\_CALIBRATION\_CLAIM} = \text{UNTRUSTED\_MARKETING\_SIGNAL}
$$

$$
\text{COMPETITOR\_EFFICACY\_CLAIM} = \text{UNTRUSTED\_MARKETING\_SIGNAL}
$$

$$
\text{COMPETITOR\_OFFICIAL\_EQUIVALENCE} = \text{UNTRUSTED\_MARKETING\_SIGNAL}
$$

Official IELTS / British Council / IDP sources remain strictly controlling for exam format, timing, scoring semantics, and assessment structure.

### 6.4 Mandatory Reference Record Schema

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
- historical PR #176 and PR #177;
- historical artifacts `docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE.md` and `docs/authorizations/STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-001.md`;
- `src/**`;
- `tests/**`;
- `scripts/**`;
- `.github/**`;
- `package.json` / dependencies;
- `docs/stage4/**`;
- `docs/authorizations/**`;
- `docs/MASTER_ROADMAP.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/DECISIONS.md`, `AGENTS.md`.

---

## 8. Accepted Audit Defect Register (Full 10-Finding PR #176 Defect Binding)

The remediation transaction `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001` is bound to resolve ALL 10 formal findings from the independent research audit (Comment ID `5365836207`, 9 HIGH / 1 MEDIUM):

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

### Finding 2 (HIGH) — Stage 3 Recommendation-Level Traceability & Epistemic Truth
- **Defect**: PR #176 cited only broad lane summaries, lacking recommendation-level mapping to exact Stage 3 identifiers and epistemic tags.
- **Remediation Contract**: REM-001 must map material recommendations to fully qualified canonical Stage 3 requirement identifiers (`R1-F*`, `R1S-F*`, `REQ-EXP-*`, `R2-F*`, `R3-G*`). Where a material Stage 3 claim lacks a formal ID, cite exact source, section, and claim.
- Every recommendation must follow the explicit reasoning form:
  $$\text{CANONICAL\_REQUIREMENT} + \text{REFERENCE\_EVIDENCE} + \text{SYNTHESIS\_REASONING} = \text{RECOMMENDATION}$$
- **Epistemic Classification Rule**: Preserve the exact native epistemic classifications of controlling Stage 3 sources (`[VERIFIED]`, `[INFERENCE]`, `[UNKNOWN]`) or candidate-level classifications (`[CANONICAL FACT]`, `[CURRENT RUNTIME FACT]`, `[EXTERNAL OBSERVATION]`, `[OWNER INPUT]`, `[INFERENCE]`, `[RECOMMENDATION]`, `[UNKNOWN]`). Do NOT invent new global tags.

### Finding 3 (HIGH) — Canonical Current/Future Truth Taxonomy
- **Defect**: PR #176 collapsed and hybridized the canonical current/future truth taxonomy into unauthorized hybrid labels (e.g. `CURRENT + PARTIAL/FUTURE`).
- **Remediation Contract**: REM-001 must preserve and use the 7 canonical status labels verbatim:
  1. `[CURRENT]`
  2. `[CURRENT_REHOMED]`
  3. `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]`
  4. `[FUTURE_UX_RESERVED]`
  5. `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]`
  6. `[OWNER_RECONFIRMED_FUTURE]`
  7. `[BACKGROUND_SYSTEM]`
- Meanings must be derived from canonical W1/W2 context. Native Stage 4 status forms (e.g. `[STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION]`) must be respected in context. Zero authorial redefinition.

### Finding 4 (HIGH) — 48/48 Capability Preservation Traceability
- **Defect**: PR #176 asserted 48/48 capability preservation without auditable trace evidence, omitted secondary lifecycle states, and deferred proof to Wave W3.
- **Remediation Contract**: REM-001 must provide an explicit, complete, auditable traceability table mapping all 48 canonical preserved capabilities using exact zero-padded canonical identifiers: `CAP-001` through `CAP-048`.
- Must explicitly synthesize preserved secondary systems:
  - Signed catalog trust and verification (`CAP-036`);
  - Content-pack install, update, and delete with retained learner records (`CAP-037`);
  - Download progress, cancellation, warning, and error states;
  - Desktop ASR readiness lifecycle (`CAP-040`): `Connected` / `Disconnected` / `Unavailable`.
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
- **Remediation Contract**: REM-001 must synthesize the complete, closed-loop semantic lifecycle:
  $$\text{SOURCE} \to \text{INGEST/READ/WATCH} \to \text{SENTENCE/CUE IDENTITY} \to \text{CONTEXTUAL UNDERSTANDING} \to \text{STAGED CAPTURE} \to \text{CONFIRMATION} \to \text{LEARNING} \to \text{SPACED REVIEW} \to \text{PRODUCTIVE/TRANSFER} \to \text{ERROR/REMEDIATION} \to \text{EXACT ORIGINAL SOURCE/CUE RETURN}$$
- The contract must define semantic state and locator preservation for:
  - Exact sentence/cue identity, passage position, and media timestamp continuity;
  - Desktop and mobile source return from Vocabulary cards and Error Notebook entries;
  - Graceful degradation for deleted, modified, private, or offline sources, and unaligned cues;
  - Staged capture substrate preservation and default-deny evidence integrity.
- **Non-Schema Rule**: Locator naming is descriptive research vocabulary, NOT a persistence schema or implementation contract.

### Finding 9 (HIGH) — First-Class Instructional System & IELTS Skills Curriculum
- **Defect**: PR #176 collapsed teaching into post-attempt feedback hierarchies, omitting the canonical W1 Skills Curriculum and Stage 3 instructional cycle.
- **Remediation Contract**: REM-001 must reference-synthesize a first-class instructional system within existing IELTS ownership:
  - Preserving canonical W1 model:
    $$\text{Model Analysis} \to \text{Guided Reconstruction} \to \text{Independent Trial}$$
  - Synthesizing Stage 3 conceptual research on worked/contrastive examples, scaffolding, fading, clean retry, delayed/varied retest, and transfer across all 5 skill areas (Vocabulary/Collocation, Listening, Reading, Writing, Speaking) without imposing an identical 11-step cycle as mandatory product architecture;
  - Explicitly enforcing instructional invariants:
    $$\text{FEEDBACK} \neq \text{TEACHING}$$
    $$\text{IMMEDIATE\_CORRECTION} \neq \text{DELAYED\_RETEST}$$
    $$\text{REVISION} \neq \text{TRANSFER}$$
  - Incorporating fresh teaching-product research (e.g. *Duolingo Explain My Answer*, *Busuu Mistake Repair*, *CommonLit Target Lessons*, *British Council Lesson Plans*, *Cambridge Write & Improve*);
  - Strictly avoiding the invention of an ungrounded universal AI tutor or representing future automation as current runtime.

### Finding 10 (HIGH) — Whole-Product Experience-System Completeness
- **Defect**: Structural 15/15 screen coverage coexisted with material whole-product experience system gaps across 12 systems and 5 deduplicated roots.
- **Remediation Contract**: REM-001 must perform a rigorous three-axis synthesis covering:
  - **Axis A**: All 15 canonical screen classes and material variants;
  - **Axis B**: All 22+ end-to-end experience systems;
  - **Axis C**: All cross-cutting quality dimensions;
  - Resolving all 5 deduplicated root gaps (G1–G5).

---

## 9. Remediation of PR #177 Authorization Defects (AUTH-REM-F01..F08)

This manifest explicitly remediates the 8 defects identified in independent audit comment `5368603672`:

| Defect ID | Severity | Audit Defect Description | Remediation Disposition in this Manifest |
|---|---|---|---|
| **AUTH-REM-F01** | HIGH | Invented mandatory epistemic taxonomy (`[VERIFIED_STABLE]`, `[RESEARCH_INSIGHT]`, `[DISPUTED_HYPOTHESIS]`, `[OBSOLETE_ASSUMPTION]`). | **REMEDIATED**: Removed all 4 invented identifiers. Preserved predecessor candidate-level classifications (`[CANONICAL FACT]`, `[CURRENT RUNTIME FACT]`, `[EXTERNAL OBSERVATION]`, `[OWNER INPUT]`, `[INFERENCE]`, `[RECOMMENDATION]`, `[UNKNOWN]`) and native Stage 3 source classifications (`[VERIFIED]`, `[INFERENCE]`, `[UNKNOWN]`). |
| **AUTH-REM-F02** | HIGH | Global Search overauthorized 6 mandatory result classes beyond canonical W1 baseline. | **REMEDIATED**: Removed mandatory 6-class requirement. Preserved canonical W1 minimum (cards, transcripts, passages, notes + source jump). Additional objects (errors, IELTS content, packs, history) authorized as research candidates only. Prohibited duplicate databases, duplicate ownership, new top-level tabs, or search dependencies. |
| **AUTH-REM-F03** | HIGH | Teaching loop over-canonicalized (imposed Stage 3 conceptual 11-step cycle as universal canonical architecture). | **REMEDIATED**: Preserved canonical W1 pattern (`Model Analysis → Guided Reconstruction → Independent Trial`). Reclassified Stage 3 11-step cycle as conceptual research candidate. REM-001 authorized to research skill-specific combinations across 5 skills without imposing one identical 11-step cycle across all domains. |
| **AUTH-REM-F04** | MEDIUM | Formal defect register count wrong (9 findings instead of 10 formal findings from comment 5365836207). | **REMEDIATED**: Bound REM-001 to ALL 10 formal audit findings (9 HIGH / 1 MEDIUM). Explicitly separated 10 formal findings from 5 deduplicated root gaps across all matrices, quality gates, and stop conditions. |
| **AUTH-REM-F05** | MEDIUM | Capability IDs misstated as `CAP-01`..`CAP-48` instead of canonical `CAP-001`..`CAP-048`. | **REMEDIATED**: Bound REM-001 to exact zero-padded canonical identifiers `CAP-001` through `CAP-048`. |
| **AUTH-REM-F06** | MEDIUM | Locator vocabulary presented as apparent canonical data-schema authority. | **REMEDIATED**: Preserved semantic exact source/cue continuity requirement. Explicitly labeled locator names as descriptive research vocabulary, NOT persistence schemas or implementation contracts. Prohibited selecting DB schemas, storage architecture, sync protocols, or persistence fields. |
| **AUTH-REM-F07** | MEDIUM | Current/future status definitions overreached and redefined `[FUTURE_UX_RESERVED]` as "Stage 5+". | **REMEDIATED**: Preserved verbatim 7 label texts without authoring new exhaustive definitions. Derived meanings strictly from canonical W1/W2 context. Preserved native Stage 4 status forms where applicable. |
| **AUTH-REM-F08** | MEDIUM | External account side effects under-specified for sandbox/discovery research. | **REMEDIATED**: Explicitly prohibited purchases, paid subscriptions, obligation-creating trials, account creation, publishing, posting/commenting, private repo/user data upload, and irreversible account actions without separate Owner authority. Mandated public/read-only preference and BLOCKED/limitation fallback. |

---

## 10. Five Deduplicated Whole-Product Root Gaps (G1–G5 Problem Formulations)

The five closure root gaps are formulated as **RESEARCH AND SYNTHESIS PROBLEMS**, NOT preselected final architectures:

### Root Gap A (G1) — Instructional Curriculum, Fading & Transfer
- **Problem**: Synthesize how explicit instruction, worked/contrastive examples, guided reconstruction, progressive scaffold fading, independent practice, misconception repair, clean isomorphic retry, delayed/varied retest, and productive transfer are best structured across the 5 skill domains (Vocabulary/Collocation, Listening, Reading, Writing, Speaking).
- **Authority Boundary**: Canonical W1 IELTS Skills Curriculum (`Model Analysis → Guided Reconstruction → Independent Trial`) is controlling. Stage 3 11-step cycle is a conceptual input. The research must recommend skill-appropriate flows rather than imposing one universal 11-step product cycle.

### Root Gap B (G2) — Exact Source/Cue Continuity
- **Problem**: Synthesize the semantic UX and state contract ensuring that exact source context, sentence/cue identity, and a navigable locator survive capture, confirmation, initial study, spaced review, productive transfer, error logging, and remediation back to the original passage position or media timestamp across desktop and mobile.
- **Authority Boundary**: Semantic continuity is required. All field names are descriptive research vocabulary, NOT database schema or persistence implementation contracts.

### Root Gap C (G3) — IELTS Learning UX & Specialist Reference Synthesis
- **Problem**: Synthesize specialist IELTS learning and practice interactions (passage/audio-grounded explanations, answer locators, incorrect-answer filtering/retry, Writing/Speaking evaluation drill-down, Full Mock onboarding and scorecard $\to$ targeted remediation routing).
- **Authority Boundary**: Official IELTS/BC/IDP sources remain controlling for exam semantics, timing, formats, and assessment criteria. Competitor patterns inform interaction usability, NOT scoring truth or official validity.

### Root Gap D (G4) — Global Search, Discovery & Knowledge Reuse
- **Problem**: Synthesize UX ownership, non-exam scope, discoverability, contextual return, mobile ergonomics, and offline/rebuilding states for search across learning materials.
- **Authority Boundary**: Canonical W1 establishes non-exam search across at least vocabulary cards, video transcripts, reading passages, and study notes with direct return to source context. Other objects (error entries, IELTS content, packs, history) may be researched as candidates. No second search database, duplicate content ownership, new top-level navigation, or search library dependency may be authorized.

### Root Gap E (G5) — Signed Content Lifecycle & Desktop ASR Readiness
- **Problem**: Synthesize the user-facing interaction flows and states for signed catalog trust verification, pack install/update/delete with retained learner study records (`CAP-036`, `CAP-037`), and Desktop ASR `Connected` / `Disconnected` / `Unavailable` readiness states (`CAP-040`).
- **Authority Boundary**: These are existing canonical preservation obligations from W0/W1/W2, not new product features.

---

## 11. Three-Axis Whole-Product Experience Synthesis Contract

The remediation candidate must synthesize across three orthogonal axes:

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
- Capability preservation (48/48 trace using `CAP-001`..`CAP-048`);
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
```text
SCREEN_COVERAGE_PASS BUT END_TO_END_EXPERIENCE_GAP
CAPABILITY_PRESERVED BUT LEARNING_JOURNEY_FRAGMENTED
REFERENCE_PRESENT BUT REFERENCE_COVERAGE_NOT_FIT_FOR_PROBLEM
GOOD_PRACTICE_UX BUT WEAK_TEACHING_UX
GOOD_EXAM_FIDELITY BUT WEAK_IELTS_LEARNING_UX
GOOD_INDIVIDUAL_SURFACES BUT BROKEN_CROSS_SURFACE_HANDOFF
```

---

## 12. Specialized Subsystem & Domain Contracts

### 12.1 Video / Media Learning Contract
- **Stable Workspace Hypothesis**: Research may evaluate preserving media player, selected sentence, transcript context, and drafts across mode switches without canonicalizing unratified state.
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

### 12.2 Vocabulary & Collocation Contract
- Multi-modal learning (recognition, cloze, typing, dictation, pronunciation, production).
- Active vs passive learning goals.
- Staged capture substrate (confirm before cold-start FSRS schedule).
- Return-to-source locator integration on every card.

### 12.3 IELTS Exam Simulation vs Learning/Practice Separation
- **Strict Exam Fidelity**: Official IELTS/BC/IDP rules controlling for runners, timers, navigation, and submission. Zero learning aids, hints, vocabulary tools, or streak UX during strict simulation.
- **Scorecard $\to$ Remediation Handoff**:
  $$\text{FULL MOCK} \to \text{SCORECARD} \to \text{OBSERVED RESULTS / LIMITATIONS} \to \text{TARGETED NEXT ACTION} \to \text{SKILL TEACHING / PRACTICE} \to \text{OPTIONAL LATER REASSESSMENT}$$
- One mock attempt must NOT become FSRS evidence or holistic mastery truth.
- Both Full Mock Speaking paths preserved (immediate post-LRW or independently scheduled).

### 12.4 Learn $\to$ Practice $\to$ Exam Coherence
- Synthesize the holistic relationship:
  $$\text{LEARN} \to \text{PRACTICE} \to \text{EXAM / MOCK} \to \text{REVIEW} \to \text{REMEDIATION} \to \text{LATER REASSESSMENT}$$
- Invariants:
  ```text
  RECOMMENDED_PATH != REQUIRED_PATH
  CURRICULUM_PATH != NAVIGATION_LOCK
  GUIDED_SEQUENCE != MANDATORY_GLOBAL_SEQUENCE
  ```
- Learner retains direct access to skill sections, practice drills, and Full Mock.

### 12.5 Global Search, Discovery & Knowledge Reuse Contract
- UX ownership derived from canonical evidence (non-exam utility).
- Canonical minimum scope: vocabulary cards, video transcripts, reading passages, study notes with direct return to source context.
- Additional candidate objects (errors, IELTS content, packs, history) may be researched as candidates.
- Offline/degraded states: honest handling when search index is unavailable or rebuilding.
- Anti-RPS: Search reveals existing data; it does NOT create a parallel storage layer or duplicate top-level navigation.

### 12.6 Secondary Lifecycles: Signed Content Packs & Desktop ASR
- **Content Pack Lifecycle**: Signed catalog trust verification, install, update, delete, progress/cancellation, warning/error, and retention of learner records upon pack deletion (`CAP-036`, `CAP-037`).
- **Desktop ASR Readiness Lifecycle**: Explicit UI states and recovery for `Connected`, `Disconnected`, and `Unavailable` (`CAP-040`).

---

## 13. Canonical Preservation & Invariant Rules

### 13.1 48/48 Preservation Traceability
External patterns are reference evidence, not authority to delete canonical capabilities.

$$
\text{REFERENCE\_PATTERN} \neq \text{AUTHORITY\_TO\_DELETE\_CAPABILITY}
$$

$$
\text{CAPABILITY\_PRESERVED} \neq \text{CAPABILITY\_ALWAYS\_VISIBLE}
$$

Grouping, rehoming, progressive disclosure, and contextual activation are valid only when semantic reachability and behavior survive intact.

### 13.2 Binding W2 Invariants
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

## 14. Anti-RPS and Duplication Prevention

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
2. **Historical Read-Only Inspection**: Fresh-read the rejected candidate artifacts (PR #176 and PR #177) strictly as read-only research inputs;
3. **Audit Verdicts Binding**: Fresh-read the complete controlling independent audit verdicts (`5365836207` and `5368603672`);
4. **Factual Runtime Inspection**: Inspect production source and tests strictly where needed for current/future factual accuracy;
5. **Fresh External Discovery**: Perform fresh, side-effect-free web and product research to resolve specialist IELTS, instructional, source-continuity, and lifecycle gaps;
6. **Revalidation of Prior Findings**: Re-validate and preserve sound findings from rejected candidates; discard invalid or unproven claims;
7. **Synthesis & Quality Scoring**: Apply 8-dimensional qualitative scoring and Anti-RPS classification to every material recommendation;
8. **Traceability Restoration**: Rebuild auditable mappings from canonical Stage 3 requirements to synthesis recommendations preserving native epistemic classifications;
9. **Preservation & Invariant Verification**: Verify 48/48 capability preservation trace using exact `CAP-001`..`CAP-048` IDs and secondary lifecycle states;
10. **Candidate Materialization**: Produce exactly ONE coherent, remediated research artifact: `docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md`.

---

## 18. Required Structure for the REM-001 Candidate Artifact

The materialized artifact (`docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md`) must contain:

1. Executive Summary & Remediation Baseline
2. Controlling Authority & Audit Defect Disposition Matrix (10/10 findings from PR #176 audit)
3. Research Methodology & Evidence Quality Standards (with side-effect boundaries)
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
16. 48/48 Capability Preservation & Omission Invariants Traceability Matrix (`CAP-001`..`CAP-048`)
17. Current / Future Truth Register (7 verbatim labels)
18. KEEP / ADAPT / REJECT Master Recommendation Register (with 8-dimensional scores)
19. Owner Decision Register (`OD-REF-###`)
20. Recommended Wave W3 Input Contract
21. Limitations, Evidence Gaps & Unresolved Items

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
- cite rejected PR #176 and PR #177 as historical read-only predecessors;
- cite audit comments `5365836207` and `5368603672` as controlling defect registers;
- remain in Draft status;
- receive natural `pull_request` CI;
- remain strictly unmerged.

---

## 20. Future Remediation Quality Gates (Evidence-Honest Outcomes)

Every gate must evaluate to an evidence-honest outcome appropriate to its type:
- `PASS`: Evidence affirmatively verifies contract satisfaction.
- `FAIL`: Material defect remains uncorrected.
- `OWNER_DECISION_REQUIRED`: Choice requires explicit Human Owner policy determination.
- `UNKNOWN` or `BLOCKED`: Material external evidence unavailable without prohibited side effects.

Zero forced PASS semantics:

$$
\text{UNKNOWN} \neq \text{PASS\_FOR\_COMPLETENESS}
$$

```text
AUDIT_FINDINGS_RECONCILED: 10/10 (or actual fresh count)
ROOT_EXPERIENCE_GAPS_RESOLVED: 5/5
MANDATORY_RECOMMENDATION_SCORING: PASS (all 8 dimensions on all material recommendations)
STAGE3_EXACT_TRACEABILITY: PASS (fully qualified IDs + native epistemic preservation)
CURRENT_FUTURE_TRUTH: PASS (7 canonical labels verbatim)
CAPABILITY_PRESERVATION: 48/48 VERIFIED (CAP-001 .. CAP-048)
OMISSION_INVARIANTS: ALL VERIFIED (S4-OMIT-001 .. S4-OMIT-012)
SIGNED_CONTENT_LIFECYCLE: PASS
DESKTOP_ASR_READINESS: PASS
IELTS_OFFICIAL_REFERENCE_COVERAGE: PASS
IELTS_COMPETITOR_UX_REFERENCE_COVERAGE: PASS / BLOCKED
IELTS_REFERENCE_SYNTHESIS: PASS / BLOCKED
SOURCE_TO_LEARNING_REFERENCE_COVERAGE: PASS / BLOCKED
SOURCE_CONTEXT_CONTINUITY: PASS
CAPTURE_TO_LEARNING_HANDOFF: PASS
CROSS_SURFACE_SOURCE_REUSE: PASS
TEACHING_UX_REFERENCE_COVERAGE: PASS / BLOCKED
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
- modify or force-push PR #176 or PR #177;
- rewrite historical rejected commits;
- modify `src/**`, `tests/**`, `scripts/**`, `.github/**`, `package.json`;
- modify W0/W1/W2 canonical documents or reopen accepted W2 semantics;
- modify Stage 3 accepted research documents;
- modify authorization manifests;
- implement production UI, final wireframes, hi-fi layouts, or visual tokens;
- select AI providers, model sizes, ASR dependencies, database engines, or search libraries;
- define persistence schemas or backend storage interfaces;
- restore Dictation Word Rearrangement;
- weaken official IELTS fidelity;
- treat competitor AI scoring or efficacy claims as valid;
- execute external account actions with prohibited side effects;
- grant independent acceptance, package acceptance, or merge authority;
- self-audit or self-accept.

---

## 23. Execution Stop Conditions & Fail-Closed Triggers

Execution must immediately STOP and fail closed if any of the following occur:

1. `CANONICAL_BASE_DRIFT`: Working branch base ref diverges from canonical `origin/main`;
2. `SCOPE_VIOLATION`: Required write touches files outside `{ docs/research/STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-001.md }`;
3. `AUDIT_DEFECT_OMISSION`: Any of the 10 formal audit findings or 5 root gaps cannot be remediated;
4. `PRESERVATION_DEFICIT`: Any of the 48 preserved capabilities (`CAP-001`..`CAP-048`) or secondary lifecycles cannot be proven;
5. `CANONICAL_CONTRADICTION`: A recommendation directly contradicts canonical W0/W1/W2 authority without an explicit `OD-REF-###` escalation;
6. `HISTORICAL_MUTATION_ATTEMPT`: Any tool call attempts to modify PR #176, PR #177, or rewrite rejected Git history;
7. `EXTERNAL_SIDE_EFFECT_TRIGGER`: Any required research operation requires a prohibited account side effect without separate Owner authorization;
8. `UNAUTHORIZED_MERGE`: Any attempt to merge candidate branches without explicit merge authority.
