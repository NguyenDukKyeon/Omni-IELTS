# Stage 3 Research Authorization Manifest — STAGE3-RESEARCH-AUTH-001

Manifest Identity: **STAGE3-RESEARCH-AUTH-001**  
Stage ID: **STAGE 3 — Learning / Product Deep Research**  
Transaction ID: **STAGE3-RESEARCH-STRATEGY-AUTH-001**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046) under **EXECUTION_PROMPT_PROTOCOL_V2** (ADR-051)  
Date: **2026-08-17**  
Status: **ACCEPTED / CANONICAL / EFFECTIVE**  
Canonical Predecessor (Base): **`664ab14bb1415fec0995e80e99369164df28575c`**  
Candidate Branch: **`strategy/stage3-research-strategy-auth-001`**  
Authorization Candidate Head: **`066fc999361a105bb00464c6625920564b390d14`**  
Independent Authorization Review: **`https://github.com/NguyenDukKyeon/VocabMaster/pull/150#pullrequestreview-4951122496`**  
Authorization Merge Commit: **`ebea8aa01ceb61f13bae1b09b14486397f0d4a4d`**  
Push CI Run on Merge: **`32025636999` (`success`)**  
Effective Research Predecessor: **`ebea8aa01ceb61f13bae1b09b14486397f0d4a4d`**  
Merge Authority for Authorization Candidate: **EXPLICITLY_GRANTED** (Executed via PR #150 merge)  

---

## 1. Executive Summary & Authority Boundaries

### 1.1 Authority Hierarchy
This authorization manifest is strictly governed by the canonical 6-tier repository authority hierarchy established in `AGENTS.md` §3 and `docs/MASTER_ROADMAP.md`:

1. `docs/MASTER_ROADMAP.md` — Master Product Roadmap (Stage 1–8).
2. `docs/ROADMAP.md` — Technical Package Taxonomy & Phase Dependencies (Phase 0–7).
3. `docs/IMPLEMENTATION_PLAN.md` — Package Specifications, Test Plans & Acceptance Criteria.
4. `docs/IMPLEMENTATION_STATUS.md` — Execution Ledger & Canonical Status Source of Truth.
5. `docs/DECISIONS.md` — Architecture Decision Records (ADRs).
6. `AGENTS.md` — Repository Router & Global Invariants.

*Task-Specific Authorization*: This document (`STAGE3-RESEARCH-AUTH-001`) defines the bounded research authorization parameters for Stage 3 under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` and ADR-046. It is strictly subordinate to the canonical 6-tier hierarchy above.

### 1.2 Non-Authority & Non-Absorption Invariants
> [!IMPORTANT]
> **Strict Non-Authority & Stage Scope Invariants**:
> - **RESEARCH AUTHORIZATION ONLY**: This manifest authorizes **ONLY** read-only investigation, capability discovery, algorithm inventory, architectural analysis, and report synthesis across Stage 3 research lanes (R1–R4).
> - **ZERO IMPLEMENTATION AUTHORITY**: This manifest does **NOT** grant authority to write product source code (`src/**`), add npm/system dependencies (`package.json`), modify test suites (`tests/**`), or alter build scripts (`scripts/**`).
> - **ZERO PROVIDER / DEPENDENCY ADOPTION**: Surveyed open-source libraries, client algorithms, and hosted APIs remain candidates only. No provider or dependency is adopted.
> - **NON-ABSORPTION OF STAGE 4**: Final UI design, information architecture, wireframing, and component layout remake belong exclusively to Stage 4 (UX / IA Remake).
> - **NON-ABSORPTION OF STAGE 5**: Concrete AI/model benchmarking, empirical model scoring, and final provider/technology selection belong exclusively to Stage 5 (AI / Technology Deep Research & Benchmark). Stage 3 may inventory candidate capabilities and architectural constraints, but MUST NOT perform or claim final provider/model selection.

---

## 2. Authorized Research Program & Scope

This manifest authorizes execution across four bounded research lanes defined in `docs/STAGE3_RESEARCH_STRATEGY.md`:

```
STAGE 3 AUTHORIZED RESEARCH LANES
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
- **Authorized Output Target**: `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`.

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
- **Authorized Output Target**: `docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`.

### 2.3 Lane R3 — Transcript / Learning Pipeline & Architecture Research
- **Scope**:
  - Comprehensive audit of current VocabMaster transcript and learning generation substrate (`P2-00`...`P2-06`, `P5-01`...`P5-04`, `ActivitySpec`, `EvidencePolicy`, `WeaknessProfile`, `TodayRunner`, `BackupRegistry`).
  - Architectural gap analysis: synchronous bottlenecks, memory constraints, stream handling, client-side indexing overhead.
  - Integration boundaries and pluggable adapter interfaces.
  - Privacy, security & data sovereignty: local-first invariants, credential protection, student PII isolation.
  - Persistence and storage: IndexedDB capacity, structured cloning bounds, additive migrations, 100% backup coverage.
  - Runtime execution boundaries: Browser Main Thread vs Web Workers vs Serverless Edge Proxy vs Local Companion.
  - Proposed architectural topology alternatives for subsequent Stage 6 implementation.
- **Authorized Output Target**: `docs/research/R3_PIPELINE_ARCHITECTURE_RESEARCH.md`.

### 2.4 Lane R4 — Cross-Research Reconciliation & Synthesis
- **Scope**:
  - Cross-cutting synthesis reconciling findings from R1, R2, and R3.
  - Validation of pedagogy-to-capability alignment.
  - Resolution and classification of cross-lane contradictions: `VALIDATED`, `CONTRADICTION`, `UNKNOWN`.
  - Production of strategic product and architecture recommendations.
  - Structured Owner Decision Ledger documenting key architectural decisions requiring Owner ratification.
  - Handoff package preparation for Stage 4 (UX / IA Remake) and Stage 5 (AI / Technology Benchmark).
- **Authorized Output Target**: `docs/research/R4_CROSS_RESEARCH_RECONCILIATION.md`.

---

## 3. Read Scope & Write Allowlist

### 3.1 Authorized Repository Read Scope
- **Scope**: Full repository read access is granted to inspect existing code, schemas, tests, documentation, and historical ADRs across `src/**`, `tests/**`, `scripts/**`, `docs/**`, and configuration files.

### 3.2 Closed Documentation Write Allowlist
Writes are strictly confined to the following explicit file allowlist. Zero edits outside this list are permitted:

```
docs/STAGE3_RESEARCH_STRATEGY.md
docs/authorizations/STAGE3-RESEARCH-AUTH-001.md
docs/research/STAGE3_RESEARCH_CONSTRAINTS.md
docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md
docs/research/R1_LEARNING_PRODUCT_RESEARCH.md
docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md
docs/research/R3_PIPELINE_ARCHITECTURE_RESEARCH.md
docs/research/R4_CROSS_RESEARCH_RECONCILIATION.md
docs/DECISIONS.md
```

> [!CAUTION]
> **Strict Materialization Constraint on `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`**:
> For this research-input target, current authority permits **ONLY** initial materialization of the exact independently accepted artifact whose SHA-256 is:
> `09faca9252c202811abf9837f77b32b3fe5431fa0ae7cb030d359f5808b712e0` (85,476 bytes).
> No semantic modification, rewriting, or generic standing write authority is granted by this amendment. Any subsequent modification to this research-input document requires separate explicit authority.

### 3.3 Authorized External Internet & Web Research Scope
External web search and documentation retrieval are **EXPLICITLY GRANTED** for:
- Official open-source repository inspection (GitHub, GitLab);
- Package registries (npm, PyPI, Crates.io);
- Official provider documentation, pricing pages, and terms-of-service;
- Peer-reviewed learning science literature (ERIC, Google Scholar, ACL Anthology, arXiv);
- Standards specifications (W3C, CEFR, ISO).

---

## 4. Research Evidence Standards & Evaluation Rubrics

### 4.1 Epistemic Classification Standard
Every finding, conclusion, and factual claim MUST be classified with:
- `[VERIFIED]`: Directly proven by primary documentation, source code inspection, or empirical tests.
- `[INFERENCE]`: Logical deduction or architectural extrapolation (premises must be stated).
- `[UNKNOWN]`: Unresolved question or empirical uncertainty requiring future spike.

### 4.2 Primary Source Mandate
- Promotional marketing, secondary blog summaries, and GitHub star counts are **NOT** accepted evidence.
- Primary URLs, dates of access, and source citations must accompany all factual claims.

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
Must evaluate against all 14 dimensions in `docs/research/STAGE3_RESEARCH_CONSTRAINTS.md` §4 (`CARD_REQUIRED`, `BILLING_ACCOUNT_REQUIRED`, `PHONE_REQUIRED`, `FREE_QUOTA`, `RATE_LIMIT`, `FREE_TIER_EXPIRY`, `DATA_RETENTION_POLICY`, `SECRET_HANDLING_REQS`, `BROWSER_DIRECT_CALL`, `LATENCY`, `QUALITY_EVIDENCE`, `MAINTENANCE_STATUS`, `VENDOR_LOCK_IN`, `FALLBACK_OPTIONS`).

---

## 5. Execution Lifecycle & Governance Rules

### 5.1 Single-Writer Rule
- Exactly **ONE** authorized agent/session may write or mutate repository files during any active transaction.
- Subagents, peer researchers, and independent auditors remain strictly read-only with respect to repository file content and Git history.

### 5.2 Independent Audit Separation
- Researchers cannot independently audit or accept their own research outputs.
- Every research transaction requires a separate independent audit by an unpolluted auditor agent.

### 5.3 Program Execution Phasing
```
TRANSACTION 1: AUTHORIZATION CANDIDATE (COMPLETE)
└── Author STAGE3_RESEARCH_STRATEGY.md, STAGE3_RESEARCH_CONSTRAINTS.md, STAGE3-RESEARCH-AUTH-001.md, ADR-053.
└── Open Draft PR #150, verified natural exact-head CI run 32024352788.

TRANSACTION 2: INDEPENDENT AUTHORIZATION AUDIT & CANONICAL MERGE (COMPLETE)
└── Independent audit of authorization candidate (Review #4951122496, Verdict: ACCEPT).
└── Pre-authorized exact-head merge to canonical main (Merge commit ebea8aa01ceb61f13bae1b09b14486397f0d4a4d).
└── Post-merge push CI run 32025636999 verified SUCCESS.

TRANSACTION 3: CANONICAL STATUS RECONCILIATION & ACTIVATION (Current Transaction)
└── Reconcile canonical status across docs/STAGE3_RESEARCH_STRATEGY.md, docs/authorizations/STAGE3-RESEARCH-AUTH-001.md, and docs/IMPLEMENTATION_STATUS.md.
└── Manifest state becomes CANONICALLY EFFECTIVE.

FUTURE TRANSACTIONS: RESEARCH EXECUTION (R1, R2, R3) & R4 SYNTHESIS
└── Separately executed research transactions or authorized parallel research sessions.
└── Independent synthesis and R4 cross-reconciliation.
└── Independent research audit and Owner decision handoff.
```

---

## 6. Pre-Authorized Merge Authority for Authorization Candidate

Under `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` §3.9 and ADR-051:
- Merge authority for this authorization manifest transaction candidate is **EXPLICITLY GRANTED** to the Independent Authorization Auditor.
- The Auditor is authorized to execute an exact-head fast-forward merge into `main` **ONLY AFTER**:
  1. The candidate passes all repository checks and natural CI on candidate HEAD;
  2. The candidate passes independent audit with zero findings;
  3. A formal `ACCEPT` verdict is persisted and verified;
  4. Candidate HEAD SHA is unchanged from the audited SHA.

---

## 7. Fail-Closed Stop Conditions

Execution halts immediately (`FAIL-CLOSED`) upon encountering any of the following triggers:

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

## 8. Authorization Amendment: STAGE3-LEARNING-EXPERIENCE-RESEARCH-INPUT-AUTH-001

### 8.1 Amendment Status & Authority Capsule
- **Amendment ID**: `STAGE3-LEARNING-EXPERIENCE-RESEARCH-INPUT-AUTH-001`
- **Amendment Status**: `CANDIDATE / NOT_EFFECTIVE_UNTIL_INDEPENDENT_ACCEPT_AND_MERGE`
- **Base Manifest Status**: `ACCEPTED / CANONICAL / EFFECTIVE` (Base manifest remains active and effective)
- **Base Predecessor (Base SHA)**: `17d7bbbfff78964006fdb879425848a6fd01aea3`
- **Authorized Future Target**: `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`
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
   - It is **NOT** a replacement for Lane R1 or Lane R2, and does **NOT** expand the scope of Lane R3 or Lane R4.
2. **No Silent Lane Creation**:
   - This amendment does **NOT** create Lane R5, Lane R6, or any new canonical research lane.
   - Packaging and scheduling of future research activities across requirement dimensions A–H remain subject to subsequent governance reconciliation.
3. **Requirement Coverage Taxonomy**:
   - Dimensions A–H represent requirement and coverage taxonomy only.
   - Preserves the invariant: $\text{IDENTIFIED\_RESEARCH\_NEED} \neq \text{AUTHORITY\_TO\_EXECUTE\_RESEARCH}$.
   - Requirements marked `ADDITIONAL_STAGE3_RESEARCH_NEEDED`, `AUTHORITY_REVIEW_NEEDED`, or `OWNER_DECISION_REQUIRED` remain unresolved governance/research inputs. This amendment does **NOT** authorize their execution.
4. **Bounded Materialization Scope**:
   - Authorizes solely the initial, exact byte-for-byte materialization of the accepted artifact `STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS_REM-001.md` (SHA-256: `09faca9252c202811abf9837f77b32b3fe5431fa0ae7cb030d359f5808b712e0`, 85,476 bytes) into `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md` once this amendment is independently accepted and merged.
   - No standing authority is created to modify or rewrite the materialized file.

