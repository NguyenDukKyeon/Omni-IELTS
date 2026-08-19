# Stage 3 Research Authorization Manifest — STAGE3-RESEARCH-AUTH-001

Manifest Identity: **STAGE3-RESEARCH-AUTH-001**  
Stage ID: **STAGE 3 — Learning / Product Deep Research**  
Transaction ID: **STAGE3-RESEARCH-STRATEGY-AUTH-001** (Closure Reconciled under `STAGE3-CANONICAL-CLOSURE-STATUS-RECONCILIATION-REM-003`)  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046) under **EXECUTION_PROMPT_PROTOCOL_V2** (ADR-051)  
Date: **2026-08-17** (Reconciled & Closed: **2026-08-20**)  
Status: **HISTORICAL / CONSUMED / CLOSED**  
Canonical Predecessor (Base): **`664ab14bb1415fec0995e80e99369164df28575c`**  
Candidate Branch: **`strategy/stage3-research-strategy-auth-001`**  
Authorization Candidate Head: **`066fc999361a105bb00464c6625920564b390d14`**  
Independent Authorization Review: **`https://github.com/NguyenDukKyeon/VocabMaster/pull/150#pullrequestreview-4951122496`**  
Authorization Merge Commit: **`ebea8aa01ceb61f13bae1b09b14486397f0d4a4d`**  
Push CI Run on Merge: **`32025636999` (`success`)**  
Effective Research Predecessor: **`ebea8aa01ceb61f13bae1b09b14486397f0d4a4d`**  
Historical Merge Authority for Authorization Candidate: **EXPLICITLY_GRANTED** (Executed via PR #150 merge)  

---

> [!NOTE]
> **CANONICAL CLOSURE & HISTORICAL AUTHORITY STATUS**:  
> Following the verified independent acceptance and canonical integration of all Stage 3 research deliverables (Lane R1, Lane R1 Supplement, Lane R2, Lane R3, and synthesizing Lane R4 at commit `856b3a307b87fd99044692513c01da3e8f681b9f`), this authorization manifest is **HISTORICAL / CONSUMED / CLOSED**.  
>  
> **THIS CLOSURE DOES NOT RETROACTIVELY INVALIDATE HISTORICAL STAGE 3 EXECUTION.**  
>  
> All historical research executions performed under this manifest remain canonically valid and accepted. This closure status strictly prevents future execution from treating this consumed manifest as standing authority.  
>  
> **ALL AUTHORIZATION LANGUAGE BELOW RECORDS HISTORICAL STAGE 3 TERMS. NONE OF IT CONSTITUTES CURRENT OR STANDING EXECUTION AUTHORITY.**

---

## 1. Executive Summary & Authority Boundaries

### 1.1 Authority Hierarchy
During active execution, this authorization manifest was strictly governed by the canonical 6-tier repository authority hierarchy established in `AGENTS.md` §3 and `docs/MASTER_ROADMAP.md`:

1. `docs/MASTER_ROADMAP.md` — Master Product Roadmap (Stage 1–8).
2. `docs/ROADMAP.md` — Technical Package Taxonomy & Phase Dependencies (Phase 0–7).
3. `docs/IMPLEMENTATION_PLAN.md` — Package Specifications, Test Plans & Acceptance Criteria.
4. `docs/IMPLEMENTATION_STATUS.md` — Execution Ledger & Canonical Status Source of Truth.
5. `docs/DECISIONS.md` — Architecture Decision Records (ADRs).
6. `AGENTS.md` — Repository Router & Global Invariants.

*Task-Specific Authorization*: This document (`STAGE3-RESEARCH-AUTH-001`) defined the bounded research authorization parameters for Stage 3 under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` and ADR-046. It was strictly subordinate to the canonical 6-tier hierarchy above.

### 1.2 Non-Authority & Non-Absorption Invariants
> [!IMPORTANT]
> **Strict Non-Authority & Stage Scope Invariants**:
> - **HISTORICAL RESEARCH AUTHORIZATION ONLY**: During active Stage 3 execution, this manifest authorized **ONLY** read-only investigation, capability discovery, algorithm inventory, architectural analysis, and report synthesis across Stage 3 research lanes (R1–R4).
> - **ZERO IMPLEMENTATION AUTHORITY**: This manifest did **NOT** grant authority to write product source code (`src/**`), add npm/system dependencies (`package.json`), modify test suites (`tests/**`), or alter build scripts (`scripts/**`).
> - **ZERO PROVIDER / DEPENDENCY ADOPTION**: Surveyed open-source libraries, client algorithms, and hosted APIs remained candidates only. No provider or dependency was adopted.
> - **NON-ABSORPTION OF STAGE 4**: Final UI design, information architecture, wireframing, and component layout remake belong exclusively to Stage 4 (UX / IA Remake).
> - **NON-ABSORPTION OF STAGE 5**: Concrete AI/model benchmarking, empirical model scoring, and final provider/technology selection belong exclusively to Stage 5 (AI / Technology Deep Research & Benchmark). Stage 3 inventoried candidate capabilities and architectural constraints, but did not perform or claim final provider/model selection.

---

## 2. Historical Authorized Research Program & Scope

During Stage 3 execution, this manifest authorized execution across four bounded research lanes defined in `docs/STAGE3_RESEARCH_STRATEGY.md`:

```
STAGE 3 HISTORICAL AUTHORIZED RESEARCH LANES
├── Lane R1: Learning & Product Deep Research (Pedagogy, Learner Modeling & Systems)
├── Lane R2: OSS & Hosted Capability Research (Algorithmic Inventory & Capability Dispositions)
├── Lane R3: Transcript / Learning Pipeline & Architecture Research (Substrate & Topologies)
└── Lane R4: Cross-Research Reconciliation & Synthesis (Reconciliation, Gaps & Owner Decisions)
```

### 2.1 Lane R1 — Learning & Product Deep Research
- **Scope**:
  - Cognitive psychology & learning science (spaced repetition, retrieval practice, desirable difficulties, cognitive load theory, generative learning, schema construction).
  - Learner modeling & mastery tracking (BKT, DKT, Knowledge Tracing, FSRS parameterization, mistake decay curves).
  - Evidence-based learning systems across 5 core skills: Vocabulary, Listening, Reading, Writing, and Speaking.
  - Diagnostic & adaptive learning loops (formative assessment, dynamic item selection, targeted remediation, weakness identification).
  - Motivation, habit, and product engagement loops (micro-learning sessions, BJ Fogg model, progress visualization).
  - Product capability gap analysis against current VocabMaster learning loops.
- **Historical Authorized Output Target**: `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`.

### 2.2 Lane R2 — OSS & Hosted Capability Research
- **Scope**:
  - Comprehensive survey of reusable open-source libraries, browser-side algorithms, and hosted/free API alternatives.
  - Capability overlap analysis with existing VocabMaster substrate to prevent reinventing wheels.
  - Exhaustive inventory across 18 capability domains:
    1. Transcript sentence segmentation;
    2. Punctuation & capitalization restoration;
    3. Timestamp-preserving chunking;
    4. Semantic & topic segmentation;
    5. Vocabulary & collocation extraction;
    6. CEFR & readability analysis;
    7. Grammar & syntax tooling;
    8. Question & distractor generation;
    9. ASR / VAD / audio alignment;
    10. Subtitle / PDF / EPUB / HTML / OCR multi-format ingestion;
    11. Client search, embeddings & reranking;
    12. Chart & data visualization;
    13. Heatmaps & activity grids;
    14. Skill radar & diagnostic charts;
    15. Progress & retention visualization;
    16. Knowledge graphs & lexical networks;
    17. Timelines & session scrubbers;
    18. Adaptive-learning algorithms.
  - Evaluation against Owner research constraints (`docs/research/STAGE3_RESEARCH_CONSTRAINTS.md`).
  - Formal capability disposition for every candidate: `BUILD`, `ADOPT_OSS`, `ADOPT_HOSTED_API`, `ADOPT_HOSTED_OSS`, `HYBRID`, `REJECT`, or `UNKNOWN / NEEDS_SPIKE`.
- **Historical Authorized Output Target**: `docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`.

### 2.3 Lane R3 — Transcript / Learning Pipeline & Architecture Research
- **Scope**:
  - Comprehensive audit of current VocabMaster transcript and learning generation substrate (`P2-00`...`P2-06`, `P5-01`...`P5-04`, `ActivitySpec`, `EvidencePolicy`, `WeaknessProfile`, `TodayRunner`, `BackupRegistry`).
  - Architectural gap analysis: synchronous bottlenecks, memory constraints, stream handling, client-side indexing overhead.
  - Integration boundaries and pluggable adapter interfaces.
  - Privacy, security & data sovereignty: local-first invariants, credential protection, student PII isolation.
  - Persistence and storage: IndexedDB capacity, structured cloning bounds, additive migrations, 100% backup coverage.
  - Runtime execution boundaries: Browser Main Thread vs Web Workers vs Serverless Edge Proxy vs Local Companion.
  - Proposed architectural topology alternatives for subsequent Stage 6 implementation.
- **Historical Authorized Output Target**: `docs/research/R3_PIPELINE_ARCHITECTURE_RESEARCH.md`.

### 2.4 Lane R4 — Cross-Research Reconciliation & Synthesis
- **Scope**:
  - Cross-cutting synthesis reconciling findings from R1, R2, and R3.
  - Validation of pedagogy-to-capability alignment.
  - Resolution and classification of cross-lane contradictions: `VALIDATED`, `CONTRADICTION`, `UNKNOWN`.
  - Production of strategic product and architecture recommendations.
  - Structured Owner Decision Ledger documenting key architectural decisions requiring Owner ratification.
  - Handoff package preparation for Stage 4 (UX / IA Remake) and Stage 5 (AI / Technology Benchmark).
- **Historical Authorized Output Target**: `docs/research/R4_CROSS_RESEARCH_RECONCILIATION.md`.

---

## 3. Historical Read Scope & Write Allowlist

### 3.1 Historical Repository Read Scope
- **Scope**: During authorized Stage 3 execution, full repository read access was granted to inspect existing code, schemas, tests, documentation, and historical ADRs across `src/**`, `tests/**`, `scripts/**`, `docs/**`, and configuration files.

### 3.2 Historical Closed Documentation Write Allowlist
Authorized Stage 3 writes were strictly confined to the following explicit file allowlist. Zero edits outside this list were permitted:

```
docs/STAGE3_RESEARCH_STRATEGY.md
docs/authorizations/STAGE3-RESEARCH-AUTH-001.md
docs/research/STAGE3_RESEARCH_CONSTRAINTS.md
docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md
docs/research/R1_LEARNING_PRODUCT_RESEARCH.md
docs/research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md
docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md
docs/research/R3_PIPELINE_ARCHITECTURE_RESEARCH.md
docs/research/R4_CROSS_RESEARCH_RECONCILIATION.md
docs/DECISIONS.md
```

> [!CAUTION]
> **Historical Materialization Constraint on `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`**:
> For this research-input target, historical Stage 3 authority permitted **ONLY** initial materialization of the exact independently accepted artifact whose SHA-256 is:
> `09faca9252c202811abf9837f77b32b3fe5431fa0ae7cb030d359f5808b712e0` (85,476 bytes).
> No semantic modification, rewriting, or generic standing write authority was granted by that amendment. Any subsequent modification to this research-input document requires separate explicit authority.

> [!CAUTION]
> **Historical Supplemental Output Constraint on `docs/research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md`**:
> This path was designated strictly for supplemental accepted research evidence under `STAGE3-R1-LEARNING-PRODUCT-SUPPLEMENT-001`.
> It did **NOT** replace `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`, which remains canonically immutable.
> Creation and materialization of this file was authorized **ONLY AFTER** amendment `STAGE3-R1-LEARNING-PRODUCT-SUPPLEMENT-AUTH-001` was independently accepted and canonically merged.

### 3.3 Historical External Internet & Web Research Scope
External web search and documentation retrieval were explicitly granted during Stage 3 execution for:
- Official open-source repository inspection (GitHub, GitLab);
- Package registries (npm, PyPI, Crates.io);
- Official provider documentation, pricing pages, and terms-of-service;
- Peer-reviewed learning science literature (ERIC, Google Scholar, ACL Anthology, arXiv);
- Standards specifications (W3C, CEFR, ISO).

---

## 4. Research Evidence Standards & Evaluation Rubrics

### 4.1 Epistemic Classification Standard
During research execution, every finding, conclusion, and factual claim was required to be classified with:
- `[VERIFIED]`: Directly proven by primary documentation, source code inspection, or empirical tests.
- `[INFERENCE]`: Logical deduction or architectural extrapolation (premises must be stated).
- `[UNKNOWN]`: Unresolved question or empirical uncertainty requiring future spike.

### 4.2 Primary Source Mandate
- Promotional marketing, secondary blog summaries, and GitHub star counts were **NOT** accepted evidence.
- Primary URLs, dates of access, and source citations accompanied all factual claims.

### 4.3 OSS Candidate 11-Dimension Evaluation Rubric
1. `License Compatibility`
2. `Maintenance Health`
3. `Security Posture`
4. `Architecture & Runtime Fit`
5. `Browser Compatibility`
6. `Bundle & Runtime Overhead`
7. `Privacy & Offline Stance`
8. `VocabMaster Overlap`
9. `Integration Complexity`
10. `Exit & Migration Cost`
11. `Empirical Quality Evidence`

### 4.4 Hosted Candidate 14-Dimension Evaluation Rubric
Evaluated against all 14 dimensions in `docs/research/STAGE3_RESEARCH_CONSTRAINTS.md` §4 (`CARD_REQUIRED`, `BILLING_ACCOUNT_REQUIRED`, `PHONE_REQUIRED`, `FREE_QUOTA`, `RATE_LIMIT`, `FREE_TIER_EXPIRY`, `DATA_RETENTION_POLICY`, `SECRET_HANDLING_REQS`, `BROWSER_DIRECT_CALL`, `LATENCY`, `QUALITY_EVIDENCE`, `MAINTENANCE_STATUS`, `VENDOR_LOCK_IN`, `FALLBACK_OPTIONS`).

---

## 5. Execution Lifecycle & Governance Rules

### 5.1 Single-Writer Rule
- During active transactions, exactly **ONE** authorized agent/session was permitted to write or mutate repository files.
- Subagents, peer researchers, and independent auditors remained strictly read-only with respect to repository file content and Git history.

### 5.2 Independent Audit Separation
- Researchers could not independently audit or accept their own research outputs.
- Every research transaction required a separate independent audit by an unpolluted auditor agent.

### 5.3 Program Execution Phasing
```
TRANSACTION 1: AUTHORIZATION CANDIDATE (COMPLETE)
└── Author STAGE3_RESEARCH_STRATEGY.md, STAGE3_RESEARCH_CONSTRAINTS.md, STAGE3-RESEARCH-AUTH-001.md, ADR-053 (PR #150 / commit ebea8aa01ceb61f13bae1b09b14486397f0d4a4d).

TRANSACTION 2: CANONICAL ACTIVATION (COMPLETE)
└── Reconcile canonical activation status across repository documents (PR #151 / commit 06ff39360d41fb3e83c98352fe4a9d3093190b45).

TRANSACTIONS 3–8: RESEARCH EXECUTION & SUPPLEMENTS (COMPLETE)
└── Lane R1 materialization (PR #152 / commit 507895a70caae8dec581bbeb34128af8142190a8).
└── Lane R2 materialization (PR #154 / commit 17d7bbbfff78964006fdb879425848a6fd01aea3).
└── Input requirements authorization (PR #155 / commit 927d20346e9675505a534ae46aacddf53a6a3652).
└── Input requirements materialization (PR #156 / commit 2c451bb702fa04b839d4864f13758d0d17fd663e).
└── R1 supplement authorization (PR #157 / commit 292e2a50a67db3618b1662cea00dd0772cb5e796).
└── R1 supplement quality remediation (PR #159 / commit 79cb8ef9dfcbd4493c5191af5cd9845b85784a23).
└── Lane R3 pipeline & architecture research (PR #164 / commit 8faaa4afb3e71df9f4fbf3ce970ca54d3d46a508).

TRANSACTION 9: LANE R4 CROSS-RESEARCH SYNTHESIS & RECONCILIATION (COMPLETE)
└── Lane R4 cross-research reconciliation deliverable (PR #167 / commit 856b3a307b87fd99044692513c01da3e8f681b9f).

TRANSACTION 10: STAGE 3 CANONICAL CLOSURE & STATUS RECONCILIATION (Current Transaction)
└── Reconcile canonical closure status across repository documents (ADR-054).
└── Manifest state becomes HISTORICAL / CONSUMED / CLOSED.
```

---

## 6. Pre-Authorized Merge Authority for Authorization Candidate (Historical)

Under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` §3.9 and ADR-051:
- Merge authority for this authorization manifest transaction candidate was **EXPLICITLY GRANTED** to the Independent Authorization Auditor.
- The Auditor was authorized to execute an exact-head fast-forward merge into `main` **ONLY AFTER**:
  1. The candidate passed all repository checks and natural CI on candidate HEAD;
  2. The candidate passed independent audit with zero findings;
  3. A formal `ACCEPT` verdict was persisted and verified;
  4. Candidate HEAD SHA was unchanged from the audited SHA.

---

## 7. Fail-Closed Stop Conditions (Historical Execution Rules)

During Stage 3 execution, execution was required to halt immediately (`FAIL-CLOSED`) upon encountering any of the following triggers:

1. `CANONICAL_BASE_DRIFT`: Predecessor base SHA diverges from `664ab14bb1415fec0995e80e99369164df28575c`.
2. `STAGE3_MISSION_CONFLICT`: Research scope deviates from Master Roadmap Stage 3 mission.
3. `STAGE5_SCOPE_ENCROACHMENT`: Final concrete AI model/provider selection or technology benchmarking attempted.
4. `STAGE4_SCOPE_ENCROACHMENT`: UX wireframing or UI layout remake attempted.
5. `IMPLEMENTATION_ATTEMPT`: Modifying product code (`src/**`) or adding npm dependencies (`package.json`).
6. `UNAUTHORIZED_WRITE_ATTEMPT`: Modifying files outside the closed docs allowlist (§3.2).
7. `EVIDENCE_STANDARD_VIOLATION`: Relying on unverified claims, marketing text, or GitHub stars as evidence.
8. `MISSING_INDEPENDENT_AUDIT`: Self-acceptance attempted or independent audit skipped.
9. `MISSING_MERGE_AUTHORITY`: Executing merge without explicit authorization.
10. `TRANSACTION_STOP_TRIGGERED`: Any transaction-specific stop condition triggered.

---

## 8. Historical Authorization Amendment: STAGE3-LEARNING-EXPERIENCE-RESEARCH-INPUT-AUTH-001

### 8.1 Amendment Status & Authority Capsule
- **Amendment ID**: `STAGE3-LEARNING-EXPERIENCE-RESEARCH-INPUT-AUTH-001`
- **Amendment Status**: `HISTORICAL / CONSUMED / CLOSED` (Merged in PR #155 at commit `927d20346e9675505a534ae46aacddf53a6a3652`; materialized in PR #156 at commit `2c451bb702fa04b839d4864f13758d0d17fd663e`)
- **Base Manifest Status**: `HISTORICAL / CONSUMED / CLOSED`
- **Base Predecessor (Base SHA)**: `17d7bbbfff78964006fdb879425848a6fd01aea3`
- **Authorized Output Target**: `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`
- **Authorized Source Artifact**: `STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS_REM-001.md`
- **Authorized Source SHA-256**: `09faca9252c202811abf9837f77b32b3fe5431fa0ae7cb030d359f5808b712e0`
- **Authorized Source Bytes**: `85476`
- **Authorized Operation**: `DOCS_ONLY_EXACT_ACCEPTED_CONTENT_MATERIALIZATION`
- **Content Edit Authority**: `NONE`
- **Research Execution Authority**: `NONE`
- **R3 Scope Expansion**: `NONE`
- **R4 Scope Expansion**: `NONE`
- **Implementation Authority**: `NONE`
- **Dependency Adoption Authority**: `NONE`
- **Provider Selection Authority**: `NONE`
- **Stage 5 Execution Authority**: `NONE`
- **Stage 6 Execution Authority**: `NONE`

### 8.2 Research-Input Status & Non-Absorption Rules
1. **Research Input Only**:
   - The target document `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md` is strictly `RESEARCH_INPUT_ONLY`.
   - It does **NOT** constitute research evidence, architecture specification, or implementation specification.
   - It is **NOT** a replacement for Lane R1 or Lane R2, and did **NOT** expand the scope of Lane R3 or Lane R4.
2. **No Silent Lane Creation**:
   - This amendment did **NOT** create Lane R5, Lane R6, or any new canonical research lane.
   - Packaging and scheduling of research activities across requirement dimensions A–H were governed by separate transactions.
3. **Requirement Coverage Taxonomy**:
   - Dimensions A–H represent requirement and coverage taxonomy only.
   - Preserves the invariant: $\text{IDENTIFIED\_RESEARCH\_NEED} \neq \text{AUTHORITY\_TO\_EXECUTE\_RESEARCH}$.
   - Requirements marked `ADDITIONAL_STAGE3_RESEARCH_NEEDED`, `AUTHORITY_REVIEW_NEEDED`, or `OWNER_DECISION_REQUIRED` remained unresolved governance/research inputs until separately authorized or remained inputs for subsequent stages.
4. **Bounded Materialization Scope**:
   - Authorized solely the initial, exact byte-for-byte materialization of the accepted artifact `STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS_REM-001.md` (SHA-256: `09faca9252c202811abf9837f77b32b3fe5431fa0ae7cb030d359f5808b712e0`, 85,476 bytes) into `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md` (executed via PR #156).
   - No standing authority was created to modify or rewrite the materialized file.

---

## 9. Historical Authorization Amendment: STAGE3-R1-LEARNING-PRODUCT-SUPPLEMENT-AUTH-001

### 9.1 Amendment Status & Authority Capsule
- **Amendment ID**: `STAGE3-R1-LEARNING-PRODUCT-SUPPLEMENT-AUTH-001`
- **Amendment Status**: `HISTORICAL / CONSUMED / CLOSED` (Merged in PR #157 at commit `292e2a50a67db3618b1662cea00dd0772cb5e796`; completed in PR #159 at commit `79cb8ef9dfcbd4493c5191af5cd9845b85784a23`)
- **Authorized Package**: `STAGE3-R1-LEARNING-PRODUCT-SUPPLEMENT-001`
- **Authorized Output**: `docs/research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md`
- **Package Type**: `R1_LEARNING_PRODUCT_SUPPLEMENTAL_EVIDENCE`
- **New Research Lane**: `NO`
- **Supplemental Research Execution Authority**: `HISTORICAL / CONSUMED / CLOSED`
- **External Research Authority**: `HISTORICAL / CONSUMED / CLOSED`
- **R3 Scope Expansion**: `NONE`
- **R4 Scope Expansion**: `NONE`
- **Stage 4 Authority**: `NONE`
- **Stage 5 Execution Authority**: `NONE`
- **Implementation Authority**: `NONE`
- **Dependency Adoption Authority**: `NONE`
- **Provider Selection Authority**: `NONE`
- **Content Modification Authority for Canonical R1**: `NONE`
- **Merge Authority for Research Output**: `NONE`

### 9.2 Governance Basis, Supplement Identity & Non-Lane Invariants
1. **Governance Basis**:
   - In accordance with canonical `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md` §25 (`AUTHORITY_REVIEW_NEEDED`), identifying a research need did NOT authorize its execution:
     $$\text{IDENTIFYING A RESEARCH NEED} \neq \text{AUTHORIZING ITS EXECUTION}$$
   - Execution of `ADDITIONAL_STAGE3_RESEARCH_NEEDED` required an explicit addendum or fresh authorization manifest.
   - The broad subject matter belonged to the Stage 3 / Lane R1 learning-product research mission; R3 scope was architecture/pipeline research; R4 scope was cross-reconciliation of evidence.
   - Execution authority could not be inferred from broad R1 subject scope alone.
2. **Supplement Identity & Single-Lane Invariant**:
   - **PACKAGE_ID**: `STAGE3-R1-LEARNING-PRODUCT-SUPPLEMENT-001`
   - **SEMANTIC_IDENTITY**: `R1 / LEARNING-PRODUCT SUPPLEMENTAL EVIDENCE`
   - **LANE_STATUS**: `SUPPLEMENT_TO_EXISTING_R1`
   - **NEW_LANE**: `NO`
   - **EXPLICIT INVARIANT**:
     - **THIS WAS NOT R5.**
     - **THIS WAS NOT R6.**
     - **THIS DID NOT REOPEN OR REWRITE CANONICAL R1.**
3. **Supplemental Output Status**:
   - `docs/research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md` is supplemental accepted research evidence.
   - It did **NOT** replace or invalidate `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`.
   - Canonical R1 remains immutable.
   - Creation and materialization of the supplemental output file was authorized subject to independent audit acceptance, valid exact-head merge authority, and canonical merge (executed via PR #159).

### 9.3 Historical Authorized Supplemental Research Subject Scope
The historically authorized supplemental research package was strictly limited to scientific and pedagogical evidence and methodology required by canonical A–H requirements that remained unresolved after canonical R1 and R2. It spanned eight semantic research families:

1. **A. Instruction + Remediation Effectiveness**:
   - Conditions under which explicit instruction, worked examples, guided practice, scaffolding/fading, and related intervention forms are effective.
   - Feedback typology, timing, and form conditionality (verification vs corrective vs explanatory vs metalinguistic).
   - Misconception-targeted remediation mechanisms.
   - Clean retest, delayed retest, and transfer evaluation following remediation.
   - *Canonical Anchors*: `RQ-04`, `RQ-05`, `REQ-EXP-001`, Cluster G5, Cluster G6.

2. **B. Delayed Retention + Transfer Measurement Methodology**:
   - Contamination-resistant delayed-retention evaluation designs.
   - Near vs far/novel-context transfer measurement.
   - Valid methodology-level relationship between micro/sub-skill gains and broader language / IELTS proficiency.
   - *Canonical Anchors*: `RQ-01`, `RQ-02`, `RQ-03`, `REQ-EXP-007`, Cluster G1, Cluster G2, Cluster G3, Cluster G4.
   - *Non-Claim Invariant*: Authorized general scientific methodology research only. Did **NOT** authorize claiming that VocabMaster itself had already caused learning gains.

3. **C. Diagnostic Validity + Learner-Model Semantics**:
   - Diagnostic false-positive, false-mastery, and misdiagnosis prevention principles.
   - Evidence sufficiency, confidence estimation, and uncertainty handling.
   - Temporary noise vs genuine skill regression methodology.
   - Conceptual interoperability conditions among distinct memory ($R$), mastery ($P(L)$), item difficulty ($b$), ability ($\theta$), and diagnostic-selection model families.
   - *Canonical Anchors*: `RQ-08`, `RQ-13`, `REQ-EXP-002`, Cluster G9.
   - *Distinction Invariant*: Preserved $\text{FSRS} \neq \text{BKT} \neq \text{IRT} \neq \text{CAT}$. Conceptual interoperability research did not constitute mathematical identity or production architecture selection.

4. **D. Curriculum / Placement / Session Evidence**:
   - Diagnostic placement and diagnostic calibration methodology.
   - Curriculum sequencing and prerequisite relationship evidence.
   - Interleaving vs blocking effects and session composition.
   - Balance between review and new-learning acquisition.
   - Cognitive load and fatigue conditions.
   - *Constraint*: Did **NOT** authorize final curriculum schemas, schedules, or prerequisite graphs.

5. **E. Re-entry + Learning Efficiency**:
   - Non-predatory streak, re-entry, and daily backlog recovery evidence.
   - Learning gain relative to learner time, effort, and cognitive burden.
   - Methodological distinction between fast completion speed and durable learning.
   - *Canonical Anchors*: `RQ-12`, `REQ-EXP-006`, Cluster G12, Cluster G13.

6. **F. Generated-Item Quality Methodology**:
   - Validity-oriented defect taxonomy for auto-generated items.
   - Measurement methods for item ambiguity, invalid keys, hallucination/poor grounding, and distractor leakage.
   - Quality and construct validity evaluation methodology for generated learning items.
   - *Canonical Anchors*: `REQ-EXP-008`, Cluster G7.
   - *Constraint*: Did **NOT** authorize benchmarking concrete prompt, model, or filter configurations.

7. **G. Learning-System Effectiveness Methodology**:
   - Defensible pre/post/delayed evaluation designs.
   - Control/comparison group methodology and threats to internal/external validity.
   - Scientifically valid learning-quality indicators.
   - Methodological distinction between usage/engagement metrics (daily active time, streak count) and verified learning evidence.
   - *Canonical Anchors*: `RQ-14`, Cluster G14, Cluster G16.

8. **H. Effectiveness-Evidence Provenance Semantics**:
   - Scientific determination of what contextual attempt provenance is necessary for valid downstream effectiveness analysis.
   - *Canonical Anchor*: `REQ-EXP-010`.
   - *Constraint*: Semantic research only. Did **NOT** authorize TypeScript interfaces, persistence objects, database fields, or storage architectures. Storage and runtime execution boundaries remained strictly Lane R3 subjects.

### 9.4 Historical Explicit Exclusions & Non-Decisions
The historical research package was strictly research-only and **EXPLICITLY EXCLUDED**:
- Broad OSS ecosystem re-survey;
- Repeating canonical R2 candidate discovery;
- Concrete AI / model / provider benchmarking;
- Concrete ASR / speech / writing scorer benchmarking;
- Concrete prompt configuration benchmarking;
- Final adaptive algorithm selection;
- Final FSRS / BKT / IRT / CAT implementation selection;
- Final readiness formula;
- Final scoring model;
- Final acceptable error thresholds;
- Lane R3 architecture execution within that package;
- Lane R4 cross-synthesis within that package;
- Stage 4 UX / Information Architecture work;
- Stage 5 execution or benchmarking;
- Stage 6 production implementation;
- Actual production-user causal efficacy claims;
- Dependency adoption or package installation (`package.json`);
- Source code or test suite modification (`src/**`, `tests/**`, `scripts/**`).

### 9.5 Historical Canonical R2 Reuse Boundary
- The supplemental research package was required to reconcile canonical R2 (`docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`) before any technical-tool discussion.
- No broad new open-source survey was authorized.
- Narrow external methods and tool references were permitted **ONLY** when necessary to understand scientific methodology and did **NOT** become candidate adoption recommendations.
- Preserved the invariant:
  $$\text{R2\_CAPABILITY\_DISCOVERY} \neq \text{SUPPLEMENTAL\_LEARNING\_EVIDENCE} \neq \text{STAGE5\_BENCHMARK} \neq \text{DEPENDENCY\_ADOPTION}$$

### 9.6 Historical Internet Research & Evidence Standards
- External research for that package was authorized using Stage 3 primary-source standards.
- Permitted source classes:
  - Peer-reviewed journal and conference literature (e.g. ERIC, Google Scholar, ACL Anthology, APA, IEEE);
  - Systematic reviews and meta-analyses;
  - Primary scholarly papers;
  - Official educational assessment and framework standards (e.g. CEFR, IELTS, ACTFL);
  - Primary research reference implementations strictly where needed to inspect methodology.
- Epistemic classification labels were mandatory: `[VERIFIED]`, `[INFERENCE]`, `[UNKNOWN]`.
- GitHub stars, popularity metrics, vendor marketing claims, and secondary summaries were NOT converted into scientific evidence.

### 9.7 Historical Parallel R3 Execution & R4 Consumption Semantics
1. **Parallel R3 Execution**:
   - Lane R3 execution authority remained exactly as canonically defined.
   - That supplement amendment did NOT expand or narrow Lane R3.
   - Lane R3 was permitted to proceed independently or in parallel subject to repository single-writer governance, its own transaction boundaries, and the constraint that unresolved pedagogical assumptions must not be frozen as permanent architecture.
   - Lane R3 was prohibited from treating the supplement as accepted evidence until the supplement independently passed acceptance.
2. **R4 Consumption**:
   - Canonical Lane R4 was authorized to consume `docs/research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md` **ONLY AFTER** that exact supplemental research output first received:
     1. Fresh independent research-quality audit;
     2. Persisted/read-back formal `ACCEPT` verdict;
     3. Valid canonical materialization and merge (executed via PR #159).
   - Lane R4 synthesized accepted supplemental evidence.

### 9.8 Historical Evidence Standards & Independent Audit Requirements
- The supplemental research transaction was required to:
  - Ground all claims in primary scientific evidence;
  - Strictly distinguish general scientific evidence from VocabMaster-specific inferences;
  - State empirical applicability, boundary conditions, and limitations;
  - Explicitly map conclusions back to canonical A–H requirements;
  - Distinguish resolved questions from still-unknown questions;
  - Preserve canonical R1 finding semantics;
  - Avoid architecture, implementation, and dependency decisions.
- **Independent Audit Mandate**: The research author could not self-audit or self-accept. A fresh independent research-quality audit by an unpolluted auditor agent was strictly required.

### 9.9 Fail-Closed Stop Conditions (Historical Execution Rules)
During execution under that amendment, execution was required to halt immediately (`FAIL-CLOSED`) upon encountering any of the following triggers:

1. `SUPPLEMENT_SCOPE_DRIFT`: Research expands beyond the 8 authorized semantic families (§9.3).
2. `NEW_LANE_CREATION_ATTEMPT`: Attempting to designate this package as Lane R5, Lane R6, or a new research lane.
3. `R2_DUPLICATIVE_BROAD_RESEARCH`: Repeating broad OSS candidate discovery rather than referencing canonical R2.
4. `R3_SCOPE_ABSORPTION`: Absorbing pipeline, persistence, streaming, or runtime architecture research into this package.
5. `R4_EVIDENCE_INVENTION`: Inventing empirical claims or synthesizing ungrounded conclusions.
6. `STAGE4_SCOPE_ENCROACHMENT`: Attempting UX wireframing, UI component layout, or interaction design.
7. `STAGE5_SCOPE_ENCROACHMENT`: Attempting concrete AI model benchmarking, prompt tuning, or provider scoring.
8. `IMPLEMENTATION_ATTEMPT`: Modifying product source code (`src/**`) or test suites (`tests/**`).
9. `DEPENDENCY_ADOPTION_ATTEMPT`: Adding or modifying npm packages in `package.json`.
10. `PROVIDER_SELECTION_ATTEMPT`: Selecting final hosted cloud or API vendors.
11. `UNAUTHORIZED_WRITE_ATTEMPT`: Writing to files outside the authorized output target.
12. `EVIDENCE_STANDARD_VIOLATION`: Relying on marketing text, blogs, or star counts as evidence.
13. `SELF_ACCEPTANCE_ATTEMPT`: Research author self-verifying or self-accepting output.
14. `MISSING_INDEPENDENT_AUDIT`: Skipping fresh independent research-quality audit.
15. `MISSING_MERGE_AUTHORITY`: Merging candidate without explicit, verified merge authorization.


