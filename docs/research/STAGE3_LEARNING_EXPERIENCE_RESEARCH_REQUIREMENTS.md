# STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS (Remediated Revision REM-001)
**Stage 3 Learning-Experience, Instructional System & Effectiveness Research Requirements**

---

## 0. Document Identity & Bounded Remediation Baseline

| Attribute | Value |
|---|---|
| **Document Identity** | `STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS_REM-001.md` |
| **Transaction Identity** | `STAGE3-LEARNING-EXPERIENCE-RESEARCH-INPUT-REMEDIATION-001` |
| **Historical Rejected PR** | PR #153 (`https://github.com/NguyenDukKyeon/VocabMaster/pull/153`) |
| **Historical Rejected Head** | `8d78334557aec97766176a91f196c474cfb55232` |
| **Historical Base Commit** | `507895a70caae8dec581bbeb34128af8142190a8` |
| **Historical Candidate Path** | `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md` |
| **Current Canonical Main SHA** | `17d7bbbfff78964006fdb879425848a6fd01aea3` |
| **Document Status** | `RESEARCH_INPUT_ONLY` |
| **Canonicality** | `NON_CANONICAL` |
| **Authority Level** | `NONE` (Operational Research Input Candidate) |
| **Date** | `2026-08-19` |
| **Repository** | `NguyenDukKyeon/VocabMaster` (`d:\Workspace\EnlishMaster-W6`) |
| **External Output Path** | `D:\Downloads\STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS_REM-001.md` |
| **Controlling Strategy** | `docs/STAGE3_RESEARCH_STRATEGY.md` |
| **Controlling Authorization** | `docs/authorizations/STAGE3-RESEARCH-AUTH-001.md` |
| **Owner Research Guidance** | `docs/research/STAGE3_RESEARCH_CONSTRAINTS.md` |
| **Pedagogical Evidence Baseline** | Canonical `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md` |
| **Capability Research Baseline** | Canonical `docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md` |

---

## 1. Status / Non-Canonical Boundary & Governance Constraints

> [!IMPORTANT]
> **DOCUMENT_STATUS**: `RESEARCH_INPUT_ONLY`  
> **CANONICALITY**: `NON_CANONICAL`  
> **AUTHORITY**: `NONE`  
> **PURPOSE**: Preserve identified learning-experience, instructional system, and effectiveness evaluation research requirements for future authorized Stage 3 research and cross-research reconciliation.

### 1.1 Loss Prevention Notice
**THIS DOCUMENT EXISTS TO PREVENT LOSS OF IDENTIFIED RESEARCH REQUIREMENTS.**

Its creation as an external candidate artifact does **NOT** itself mutate repository files, expand any canonical research transaction, authorize product implementation, select runtime architecture, adopt dependencies, or grant merge authority.

### 1.2 Non-Equivalence Axioms
Every reader and coding agent must respect these fundamental non-equivalence boundaries:

$$\text{RESEARCH REQUIREMENT} \neq \text{RESEARCH FINDING}$$
$$\text{RESEARCH FINDING} \neq \text{SPECIFICATION}$$
$$\text{SPECIFICATION} \neq \text{AUTHORIZATION}$$
$$\text{IDENTIFYING A RESEARCH NEED} \neq \text{AUTHORIZING ITS EXECUTION}$$
$$\text{OSS DISCOVERY} \neq \text{OSS ADOPTION}$$
$$\text{POPULARITY / STARS} \neq \text{QUALITY EVIDENCE}$$
$$\text{DRAFT PR} \neq \text{ACCEPTANCE}$$
$$\text{ENGAGEMENT} \neq \text{LEARNING}$$
$$\text{ACTIVITY COMPLETION} \neq \text{LEARNING GAIN}$$
$$\text{SHORT-TERM PRACTICE ACCURACY} \neq \text{DELAYED RETENTION}$$
$$\text{RETENTION} \neq \text{TRANSFER}$$
$$\text{MODEL-GENERATED SCORE} \neq \text{CALIBRATED MEASUREMENT}$$
$$\text{MODEL-HUMAN AGREEMENT} \neq \text{CONSTRUCT VALIDITY}$$
$$\text{HIGH EXERCISE VOLUME} \neq \text{EFFECTIVE INSTRUCTION}$$
$$\text{OFFLINE MODEL METRIC IMPROVEMENT} \neq \text{LEARNER OUTCOME IMPROVEMENT}$$
$$\text{NO EVIDENCE} \neq \text{EVIDENCE OF WEAKNESS}$$
$$\text{ONE SUCCESS} \neq \text{MASTERY}$$
$$\text{FAST COMPLETION} \neq \text{EFFICIENT LEARNING}$$
$$\text{OSS TOOL} \neq \text{VALID EVALUATION DESIGN}$$
$$\text{STATISTICAL LIBRARY} \neq \text{SCIENTIFIC VALIDITY}$$
$$\text{BENCHMARK SCORE} \neq \text{REAL-WORLD LEARNING EFFECTIVENESS}$$
$$\text{FSRS} \neq \text{BKT} \neq \text{IRT} \neq \text{CAT}$$
$$\text{INTEROPERABILITY} \neq \text{MATHEMATICAL IDENTITY}$$

---

## 2. Purpose of This Document

The central motivating questions of this research input document are:

> 1. *"What additional research is required so VocabMaster / OmniIELTS can eventually provide a coherent end-to-end learning experience rather than only a collection of isolated language-processing and assessment capabilities?"*
> 2. *"How can VocabMaster determine, with defensible empirical evidence, whether its instruction, exercises, feedback, adaptive decisions, and overall learning system actually cause or support meaningful, durable, and transferable learner improvement?"*

While Stage 3 Lane R1 established empirical learning science baselines (`docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`) and Lane R2 surveyed global open-source and hosted technical capabilities (`docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`), an effective learning product requires deeper investigation into how instruction, practice, assessment, adaptation, and outcome evaluation operate as an integrated system.

This document systematically structures research requirements across **four primary learning-system clusters** and **four cross-cutting / meta-evaluation clusters**:

- **Cluster A**: Exercise + Assessment System (Micro, Meso, Full-Task & Mock Tasks)
- **Cluster B**: Instruction + Skill Acquisition System (Explicit Teaching, Worked Examples, Scaffolding Fading)
- **Cluster C**: Learner Model + Adaptation System (Multidimensional State, Retention, Adaptation)
- **Cluster D**: Curriculum + End-to-End Learning Experience (Diagnostics, Pathways, Session Orchestration)
- **Cluster E**: Cross-Cutting Requirements (Provenance, Accessibility, Fairness, Reliability)
- **Cluster F**: OSS / Existing-Capability Discovery Requirement (Mandatory survey before building)
- **Cluster G**: Learning System Effectiveness + Quality Evaluation (Outcome Measurement, Retention, Transfer, Calibration)
- **Cluster H**: End-to-End Coverage + Unknown-Unknowns Audit (10 learner personas × 16 lifecycle dimensions)

---

## 3. Relationship to Current Stage 3 Architecture & Governance

```
STAGE 3 RESEARCH PROGRAM TOPOLOGY
┌─────────────────────────────────────────────────────────────────────────┐
│  Lane R1: Learning & Product Research (Canonical Baseline)              │
│  └── Cognitive science, memory retention, 5-skill pedagogy              │
├─────────────────────────────────────────────────────────────────────────┤
│  Lane R2: OSS & Hosted Capability Research (Canonical Baseline)         │
│  └── 18 capability domains, candidate matrices, provider limits         │
├─────────────────────────────────────────────────────────────────────────┤
│  THIS DOCUMENT (Stage 3 Learning Experience Requirements — REM-001)     │
│  └── Preserves end-to-end learning, instruction & effectiveness gaps    │
├─────────────────────────────────────────────────────────────────────────┤
│  Lane R3: Pipeline & Architecture Research (Candidate Scope)            │
│  └── Current substrate audit, streaming pipelines, storage boundaries  │
├─────────────────────────────────────────────────────────────────────────┤
│  Lane R4: Cross-Research Reconciliation & Synthesis (Candidate Scope)   │
│  └── Resolves contradictions, maps pedagogy to tech, owner decisions    │
└─────────────────────────────────────────────────────────────────────────┘
```

- **R1 Output**: Provides canonical learning/product empirical evidence and construct constraints (`docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`).
- **R2 Output**: Provides canonical OSS and hosted capability inventories and candidate classifications (`docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`).
- **This Document**: Preserves additional learning-experience and effectiveness evaluation research requirements so future Stage 3 transactions cannot silently omit them.
- **R3 Interface (`R3_CANDIDATE`)**: May consume requirements that fall strictly within its authorized pipeline/architecture/persistence/runtime research scope. R3 must not be assigned empirical pedagogical research merely because telemetry is stored locally.
- **R4 Interface (`R4_RECONCILIATION`)**: Reconciles accepted research outputs. R4 **MUST NOT** be expected to invent missing research evidence. Unresearched material requirements must not be silently treated as resolved by R4.
- **Stage 5 Interface (`STAGE5_BENCHMARK`)**: Routes concrete comparative model benchmarks, empirical prompt evaluations, and model-human scoring agreement studies to Stage 5.
- **Owner Decision Interface (`OWNER_DECISION`)**: Routes product-level tradeoffs, target thresholds, and business constraints to governance rather than treating them as empirical facts.
- **Authority Escalation Trigger (`AUTHORITY_REVIEW_NEEDED`)**: If canonical Stage 3 authority (`docs/authorizations/STAGE3-RESEARCH-AUTH-001.md`) does not cover required additional empirical research, an explicit `AUTHORITY_REVIEW_NEEDED` trigger must be escalated to repository governance. Identifying a research need does not authorize its execution.

---

## 4. Core Learning-System Distinctions

To prevent conflation between surface activity and genuine learning, the following foundational distinctions must govern all downstream research:

1. **`EXERCISE SYSTEM != TEACHING SYSTEM`**: Presenting a student with a test item or question is not the same as instructing them on how to acquire, structure, and apply new knowledge.
2. **`GENERATION != VALIDATION`**: Generating a plausible question or prompt via LLM or template does not mean the item has construct validity, unambiguous distractors, or a verified single correct answer.
3. **`KNOWLEDGE != SKILL != PERFORMANCE`**: Declarative knowledge (knowing a grammar rule) differs from procedural skill (applying it during rapid sentence formation) and real-time performance (producing it fluently under test stress).
4. **`RECOGNITION != RECALL != PRODUCTION != TRANSFER`**: Recognizing a correct option among four choices provides zero evidence of spontaneous recall, spoken production, or novel-context transfer (per `R1-F013`).
5. **`RECEPTIVE != PRODUCTIVE`**: Auditory/reading comprehension does not equal spoken/written fluency. Mastery in one lane cannot be imputed to the other.
6. **`SCAFFOLDED SUCCESS != INDEPENDENT RETRIEVAL`**: Success achieved while viewing hints, transcripts, or glosses cannot be credited as independent mastery (per `R1-F007`).
7. **`PRACTICE PERFORMANCE != RETENTION != TRANSFER`**: High accuracy during massed practice does not prove long-term retention or generalization to unpracticed contexts (per `R1-F001`, `R1-F043`).
8. **`LEARNING MODE EVIDENCE != TEST MODE EVIDENCE`**: Data gathered during scaffolded learning sessions has different evidentiary validity from strictly timed, unaided exam simulation data.
9. **`READING/LISTENING ASSESSMENT != WRITING/SPEAKING PERFORMANCE ASSESSMENT`**: Objective selected-response items require distinct psychometric and scoring architectures from constructed subjective performances.
10. **`AI FEEDBACK != CALIBRATED SCORING`**: Qualitative AI critique cannot be treated as an authoritative, calibrated IELTS band score without empirical human-model agreement benchmarks.
11. **`GENERATED EXERCISE != VALID EXERCISE`**: An item that looks like an IELTS task may contain subtle leakage, unnatural collocations, or multiple defensible keys.
12. **`USER PREFERENCE != PERFORMANCE EVIDENCE`**: Learner self-reports (e.g. "I already know this word") do not constitute objective evidence of linguistic mastery.
13. **`MATERIAL OSS CANDIDATE != ADOPTION DECISION`**: Discovering a functional open-source library in R2 does not grant authority to install or depend on it in production.
14. **`ENGAGEMENT != LEARNING`**: High daily active time, long streaks, or completed exercise counters do not prove linguistic growth (per `R1-F040`, `R1-F041`).
15. **`ACTIVITY COMPLETION != LEARNING GAIN`**: Finishing a module does not indicate that underlying constructs were retained or transferred.

---

## 5. Cluster A — Exercise + Assessment System

Research must investigate exercise and assessment design across **four granular task tiers**:
- **Micro-Exercise**: Focused 5–30 second drills targeting an isolated atomic construct (e.g. single phoneme discrimination, collocation cloze, irregular verb form).
- **Partial / Meso-Exercise**: Multi-step scaffolded activities targeting a composite sub-skill (e.g. paragraph topic sentence matching, 2-minute speech monologue with signposting).
- **Full Task**: Complete official-style task execution (e.g. IELTS Writing Task 2 essay, Listening Section 3 conversation with 10 questions).
- **Full Mock / Test**: End-to-end timed simulation under strict exam constraints with holistic scoring.

> [!NOTE]
> **Scientific Conditionality Notice**:
> Research must determine the learning and fatigue consequences of repeated full-mock practice relative to targeted micro/meso remediation, including conditions under which either approach helps or harms outcomes. Full-test practice alone must not be assumed to constitute sufficient instructional remediation.

---

## 6. Cluster B — Instruction + Skill Acquisition System

```
CONCEPTUAL INSTRUCTION & ACQUISITION CYCLE (CONCEPTUAL_CANDIDATE_ONLY)
┌─────────────────────────────────────────────────────────────────────────┐
│  1. DIAGNOSE        ── Identify exact skill gap or misconception        │
│  2. TEACH           ── Explicit instruction & conceptual modeling       │
│  3. WORKED EXAMPLE  ── Expert problem-solving demonstration             │
│  4. GUIDED PRACTICE ── Step-by-step supported attempt with hints        │
│  5. FADED GUIDANCE  ── Progressive removal of scaffolding               │
│  6. INDEPENDENT     ── Unaided problem solving                          │
│  7. FEEDBACK        ── Corrective / explanatory / metalinguistic /      │
│                        hint-based feedback (timing & form conditional)  │
│  8. REMEDIATION     ── Misconception-targeted counter-examples          │
│  9. CLEAN RETEST    ── Unassisted verification on isomorphic item       │
│ 10. DELAYED RETEST  ── Spaced verification after interval               │
│ 11. TRANSFER        ── Application in novel communicative context       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Explicit Instruction Research Scope
Research must explore instructional delivery mechanisms across:
- **Vocabulary**: Semantic networks, morphology (roots, prefixes, suffixes), polysemy, register, and collocational syntax.
- **Grammar**: Functional grammar explanations, form-meaning-use mappings, and contrastive analysis.
- **Pronunciation**: Articulatory phonetics, suprasegmental features (stress, rhythm, intonation), and connected speech rules.
- **Reading Skills**: Strategic skimming (gist), scanning (specific detail), lexical inference, and discourse structure parsing.
- **Listening Skills**: Acoustic decoding of weak forms/assimilation, predicting content, signpost tracking, and recovery from missed cues.
- **Writing Skills**: Paragraph architecture, thematic progression, cohesive devices, hedging, and academic voice.
- **Speaking Skills**: Fluency formulas, discourse markers, turn-taking strategies, and structured Part 2 ideation.
- **IELTS Task Knowledge**: Scoring rubric transparency, time allocation strategies, question format nuances, and trap avoidance.

### 6.2 Feedback Typology & Scaffolding Fading
Research must investigate feedback types and determine their empirical conditions of effectiveness (noting that universal immediate feedback is not established as optimal for all tasks):
- **Verification Feedback**: Binary correct/incorrect indication.
- **Corrective Feedback**: Supplying the correct answer (effective for error recovery; conditionality per `R1-F023`, `R1-F033`).
- **Explanatory Feedback**: Explaining why the key is correct and why chosen distractors fail.
- **Metalinguistic Feedback**: Providing grammatical or lexical terminology to prompt self-correction.
- **Evidence Highlighting**: Pointing directly to supporting text spans without revealing the final answer.
- **Contrastive Examples**: Showing side-by-side minimal pairs or common non-standard usage.
- **Socratic Hints**: Progressive multi-tier hints leading the learner to self-repair.

### 6.3 Misconception-Specific Remediation Loop
```
ATTEMPT HISTORY ──> ERROR PATTERN ──> MISCONCEPTION HYPOTHESIS ──> TARGETED TEACHING ──> GUIDED PRACTICE ──> CLEAN RETEST ──> (RESOLVED | PERSISTENT)
```

---

## 7. Cluster C — Learner Model + Adaptation System

> [!IMPORTANT]
> **CONCEPTUAL_CANDIDATE_ONLY — NOT_FINAL_ARCHITECTURE — NOT_IMPLEMENTATION_SPECIFICATION**
> FSRS-style retrievability/scheduling, BKT-style latent mastery, IRT-style item/ability modeling, CAT-style adaptive diagnostic selection, and deep knowledge tracing (pyKT) represent **distinct conceptual model families** with non-interchangeable semantics (`R1-F011`). They are not selected as production dependencies and must not be collapsed into an unvalidated single parameterization or unified formula.

### 7.1 Multidimensional Learner State (Conceptual Candidate Taxonomy)
Research must investigate methods for maintaining separation across distinct psychometric and cognitive dimensions without premature schema lock-in:

```
CANDIDATE MULTIDIMENSIONAL LEARNER STATE MODEL (CONCEPTUAL_CANDIDATE_ONLY)
├── Declarative Knowledge Dimension (Candidate)
│   ├── Lexical Breadth & Depth (Sense, Spelling, Collocation, Register)
│   ├── Syntactic Rule Familiarity
│   └── IELTS Task Taxonomy Familiarity
├── Procedural Skill Dimension (Candidate)
│   ├── Acoustic Decoding Speed & Precision
│   ├── Reading Text Processing Rate (wpm)
│   ├── Spoken Lexical Retrieval Latency
│   └── Grammatical Error Self-Correction Rate
├── Real-Time Performance Dimension (Candidate)
│   ├── Receptive Accuracy (Listening / Reading under timed conditions)
│   └── Productive Quality (Writing / Speaking rubric band estimates)
├── Temporal Dynamics Dimension (Candidate)
│   ├── Memory Retrievability ($R$) & Stability ($S$) (FSRS model family)
│   ├── Latent Skill Mastery Probability ($P(L)$) (BKT model family)
│   └── Spacing Horizons & Due Intervals
└── Diagnostic Error & Misconception Memory (Candidate)
    ├── Historical Error Observations & Frequency Distributions
    ├── Chronic Misconception Clusters & L1 Transfer Traps
    └── Confusion Pairs (Phonetic, Lexical, Syntactic)
```

### 7.2 Adaptive Next-Task Selection Framework
Research must explore multi-factor decision inputs for session item sequencing:
- **Decision Inputs**: Memory retention due dates, prerequisite skill gaps, active misconception flags, learner target band (e.g. IELTS 7.5), observed skill weaknesses (`weakness-profile.js`), recent task history, item difficulty estimates, learner ability estimates, session time constraints, and learner mode preferences.
- **Candidate Action Classes (CONCEPTUAL_CANDIDATE_ACTION_CLASSES / NOT_FINAL_ENUMS)**:
  - `DUE_REVIEW`: Spaced repetition retrieval.
  - `NEW_INSTRUCTION`: Explicit teaching of unmastered concepts.
  - `TARGETED_REMEDIATION`: Error-focused corrective drill.
  - `GUIDED_PRACTICE`: Scaffolded task execution.
  - `INDEPENDENT_PRACTICE`: Unaided activity.
  - `TRANSFER_EXERCISE`: Novel context application.
  - `FULL_TASK`: Standard timed section.
  - `DIAGNOSTIC_MOCK`: Formal evaluation.

### 7.3 Psychometrics, Calibration & Interoperability Research
- **Interoperability Research Requirement**: Research must investigate whether, and under what conditions, distinct memory (FSRS), mastery (BKT), item-difficulty/ability (IRT), and diagnostic selection (CAT) models can **interoperate** within a unified learning experience without collapsing their distinct mathematical and psychological definitions.
- **Candidate References**: Canonical R2 surveyed `pyBKT` (`OSS-045`), `catsim` (`OSS-046`), and `pyKT` (`OSS-047`) as standalone reference algorithms/benchmarks (`STAGE5_BENCHMARK_CANDIDATE / REFERENCE_ONLY`). No dependency adoption is authorized.
- **Calibration Distinction**: Research must rigorously distinguish between **empirically calibrated difficulty** (derived from large-scale attempt logs) and **heuristically estimated difficulty** (derived from readability formulas or LLM ratings).

---

## 8. Cluster D — Curriculum + End-to-End Experience

### 8.1 Initial Diagnostic & Placement
Research must evaluate optimal placement strategies:
- Minimum viable diagnostic test duration vs measurement precision.
- Modular skill routing (e.g. testing vocabulary and listening before advanced writing).
- Identifying cold-start ability priors without inducing test anxiety (per `R1-F012`).

### 8.2 Curriculum & Prerequisite Graph Topologies
Research must investigate relational graph structures for language learning (`CONCEPTUAL_CANDIDATE_RELATIONS / NOT_FINAL_SCHEMA`):
- `PREREQUISITE_CANDIDATE`: Foundational construct recommended prior to advanced instruction.
- `SUPPORTING_SKILL_CANDIDATE`: Construct that enhances or reinforces another skill.
- `RELATED_CANDIDATE`: Semantic or thematic connection without strict ordering.
- `TRANSFER_TARGET_CANDIDATE`: Authentic application domain for acquired skill.
- `REMEDIATION_DEPENDENCY_CANDIDATE`: Foundational construct to revisit upon specific error triggers.

### 8.3 Session Orchestration & Cognitive Load
Research must determine optimal session construction:
- Interleaving vs blocking of disparate language skills (conditional benefits per `R1-F004`).
- Balancing review load (FSRS due items) with new concept acquisition (empirical ratio research needed).
- Preventing session fatigue via dynamic length adjustment and cognitive load monitoring.

### 8.4 Learning Mode vs Test Mode Invariants
Research must operationalize distinct evidentiary modes aligned with canonical `EvidencePolicy`:
- **Learning Mode**: Allows hints, dictionary lookup, transcript viewing, immediate feedback, and retries. Attempt evidence is classified as `SCAFFOLDED` and cannot establish unassisted mastery (`R1-F007`).
- **Test Mode**: Enforces strict countdown timers, disables assistance tools, delays feedback until submission, and records high-integrity `UNASSISTED` evidence.

### 8.5 Content Ingestion & Lifecycle Management
```
DISCOVER / IMPORT ──> PROCESS / NORMALIZE ──> LEARN / DRILL ──> PERSIST ──> REVIEW ──> RE-ENCOUNTER ──> EXPAND ──> TRANSFER
```
Research must address lexical identity resolution, polysemous sense disambiguation, duplicate deduplication across sources, and cross-source occurrence tracking.

### 8.6 User Agency & Control Mechanisms
Research user-facing control hooks:
- Explicit focus selection (e.g. "Focus on Listening Section 3 today").
- Item triage actions (`SKIP`, `ALREADY_KNOW`, `TOO_EASY`, `TOO_HARD`, `REPORT_DEFECT`).
- Exclusion rules (e.g. blacklisting specific topics or sources).
- *Strict Invariant*: `USER_CLAIM != PERFORMANCE_EVIDENCE`. User actions adjust curriculum routing but do not fabricate positive mastery evidence.

### 8.7 Habit Formation, Streaks & Re-Entry
- Designing sustainable daily engagement loops without predatory dark patterns.
- Forgiving streak semantics and backlog catch-up algorithms to prevent abandonment after missed study days (noting that causal English learning gains from streak preservation are unproven per `R1-F041`).

---

## 9. Cluster E — Cross-Cutting Requirements

### 9.1 Content Provenance, Copyright & Legal Compliance
- Strict tracking of source licenses: official Cambridge/IELTS practice materials (proprietary), open datasets (CC BY), public domain literature, user-imported files, and AI-synthesized texts.
- Zero verbatim leakage of copyright-restricted exam items into unauthenticated persistence layers.

### 9.2 Accessibility & Universal Design
- Full keyboard navigation and screen-reader compatibility (ARIA roles).
- Synchronized closed captions and transcripts for all audio content (`R1-F006`).
- Dyslexia-friendly typography options and color-independent status indicators.

### 9.3 Algorithmic Fairness & Bias Mitigation
- ASR fairness across diverse non-native accents (e.g. Vietnamese, Chinese, Spanish, Arabic ESL speakers).
- Pronunciation evaluation scoring calibration avoiding demographic or pitch bias.

### 9.4 Reliability, Fault Tolerance & Error Recovery
- Graceful offline operation with local IndexedDB queuing during network drops.
- Resilient recovery from third-party API rate limits, timeouts, or model deprecations.
- User dispute workflows allowing learners to challenge and report ambiguous generated items.

### 9.5 Conceptual Evidence Provenance Requirements (Research Requirement — Not Implementation Schema)
> [!IMPORTANT]
> **CONCEPTUAL PROVENANCE REQUIREMENTS ONLY — NOT AN IMPLEMENTATION SCHEMA, PERSISTENCE OBJECT, OR TYPESCRIPT INTERFACE**
> Future evidence and telemetry architecture must investigate retaining contextual provenance parameters to enable valid downstream learning-effectiveness analysis without prescribing concrete schemas or types in this research document.

Research must investigate the retention of contextual provenance concepts, including:
1. **Task & Construct Identity**: Unique identifier of the attempted item, targeted linguistic construct, and skill domain.
2. **Content & Source Provenance**: Traceable origin of the source material (e.g., imported transcript, official mock, AI-synthesized item).
3. **Session & Scaffolding Context**: Explicit distinction between scaffolded learning sessions (with hints, glosses, transcript exposure) and unassisted test simulations.
4. **Assistance & Scaffolding Exposure**: Quantitative and qualitative indicators of support used (e.g., hint count, transcript viewed, dictionary lookup).
5. **Attempt Dynamics & Retries**: Iteration count, retry sequence position, and response timing/latency where pedagogically meaningful.
6. **Raw Response Capture**: Unaltered learner response for diagnostic and re-scoring evaluation.
7. **Scoring & Evaluator Provenance**: Identification of scoring methodology (deterministic key matching, rule-based NLP, hosted model, human examiner benchmark) and evaluator version.
8. **Uncertainty & Calibration Metadata**: Score confidence intervals, model uncertainty metrics, and rater disagreement indicators.
9. **Temporal Metadata**: Precise attempt timestamp and interval relative to prior exposures.

---

## 10. Cluster F — OSS / Existing-Capability Discovery Requirement

> [!IMPORTANT]
> **MANDATORY SURVEY RULE**:
> For **EVERY** major learning capability identified across Clusters A through G, downstream authorized research MUST reconcile existing canonical R2 capabilities (`docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`) first before proposing new discovery or custom in-house builds.

### 10.1 Solution Classes to Survey
1. **Browser-Native Web APIs**: Web Audio API, Web Speech API, DOM APIs, Canvas/SVG, Web Workers, IndexedDB, WASM.
2. **Lightweight Browser OSS Packages**: Zero-dependency or minimal-bundle JS/TS npm packages (surveyed in R2).
3. **Rust/WASM Compiled Libraries**: High-performance client-side engines compiled to WebAssembly (e.g. Harper WASM `OSS-036`).
4. **OSS Reference Implementations**: Standalone algorithms or academic prototypes (e.g. `pyBKT` `OSS-045`, `catsim` `OSS-046`).
5. **Primary Research Implementations**: ACL / IEEE / arXiv open-source research code (e.g. `ERRANT` `OSS-037`, `D-GEN` `OSS-038`, `HyperSeg` `OSS-035`).
6. **Open Pedagogical Datasets**: CEFR-J, Open English WordNet (`DATA-001`), SUBTLEX, IELTS public rubrics.
7. **Evaluation Suites & Benchmarks**: `pyKT` (`OSS-047`), `ERRANT` (`OSS-037`), `D-GEN` (`OSS-038`).
8. **Eligible Recurring-Free Hosted APIs**: Cloud APIs satisfying zero-card and generous free-tier constraints (`HOST-001` conditional, `HOST-002` Groq retained).
9. **Self-Hostable Containerized OSS**: Community tools deployable on free serverless/container infrastructure.
10. **Existing VocabMaster Substrate**: Verified code in `src/**` (`EvidencePolicy`, `caption-normalizer.js`, `ts-fsrs`).

### 10.2 Capability Comparison Schema
Research must evaluate options using the standardized matrix:
```text
[CAPABILITY_NAME]
├── Product Need & Educational Target
├── VocabMaster Substrate Overlap Check
├── Canonical R2 Inventory Reference (Check docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md first)
├── Candidate Options:
│   ├── Browser Native / Lightweight OSS Options
│   ├── Research Implementations & Reference Code
│   ├── Open Datasets & Benchmarks
│   ├── Eligible Hosted Free-Tier APIs
│   └── Custom Native Build Option
└── Tradeoff Analysis:
    ├── License & Maintenance Health
    ├── Runtime Memory, Bundle & Latency Overhead
    ├── Privacy & Offline Compatibility
    ├── Integration Complexity & Migration Cost
    └── Failure Modes & Fallback Hierarchy
```

---

## 11. Deep-Dive: Vocabulary & Collocation Across Four Skills

### 11.1 Vocabulary Exercise Typology
Research must specify the evidentiary value of diverse lexical exercise formats:
1. **Visual Meaning Recognition**: Selecting definitions given the written word.
2. **Contextual Sense Discrimination**: Disambiguating polysemous meanings in authentic passages.
3. **Meaning-to-Word Recall**: Producing or selecting the headword given a definition.
4. **Contextual Cloze Deletion**: Completing sentences with correct collocational/grammatical forms.
5. **Partial-Cue Recall**: Prompting retrieval via initial letters, phonemes, or anagrams.
6. **Collocation Recognition**: Identifying natural adjective-noun or verb-noun pairings.
7. **Collocation Recall**: Supplying the missing partner in a strong collocation.
8. **Collocation Error Correction**: Detecting and fixing unnatural phrasing (e.g. *"make homework"* $\to$ *"do homework"*).
9. **Auditory Lexical Recognition**: Identifying spoken words in connected speech.
10. **Audio-to-Spelling**: Transcribing spoken words accurately.
11. **Controlled Written Production**: Writing original sentences incorporating target lexis.
12. **Spontaneous Spoken Production**: Using target vocabulary in unscripted monologue/dialogue.
13. **Novel-Context Transfer**: Identifying or using terms in unfamiliar domains.
14. **Word Family & Morphological Derivation**: Transforming nouns $\to$ adjectives $\to$ adverbs.
15. **Register & Connotation Discrimination**: Differentiating formal academic vs informal colloquial registers.

### 11.2 Multi-Construct Evidentiary Vectors
A single vocabulary term must have distinct mastery tracking across:
- Visual Recognition $\neq$ Auditory Recognition $\neq$ Spelling $\neq$ Definition Recall $\neq$ Collocation Knowledge $\neq$ Productive Writing $\neq$ Productive Speaking $\neq$ Transfer (per `R1-F013`).

---

## 12. Deep-Dive: IELTS Listening System

### 12.1 Official Item Format Taxonomy
Research must address generation and validation across all IELTS Listening formats:
- **Multiple Choice**: Single-answer (3 options) and multi-answer (pick 2 of 5).
- **Matching**: Matching audio concepts to lettered options.
- **Form / Note / Table / Flow-Chart Completion**: Word-count constrained gap-filling.
- **Summary Completion**: Filling gaps in a synthesized overview.
- **Diagram / Plan / Map Labeling**: Spatial and directional audio tracking.
- **Short-Answer Questions**: Direct factual extraction.

### 12.2 Acoustic Micro-Skills & Sub-Constructs
- Decoding connected speech: assimilation (e.g. *good girl* $\to$ */gʊb gɜːl/*), elision, linking /r/, weak forms of auxiliary verbs and prepositions.
- Number, date, telephone, and alphanumeric spelling tracking.
- Paraphrase and distractor recognition (distinguishing between false starts, speaker self-corrections, and confirmed facts).
- Auditory recovery techniques following missed information segments.

---

## 13. Deep-Dive: IELTS Reading System

### 13.1 Official Item Format Taxonomy
- **Multiple Choice**: Standard 4-option single correct items.
- **True / False / Not Given (T/F/NG)**: Factual verification against authentic texts.
- **Yes / No / Not Given (Y/N/NG)**: Author's claim and opinion verification.
- **Matching Headings**: Selecting paragraph main ideas from a Roman-numeral list.
- **Matching Information / Features / Sentence Endings**: Detailed scanning across sections.
- **Sentence / Summary / Flow-Chart Completion**: Strict word-limit gap filling.
- **Diagram Label Completion**: Technical/process diagram annotations.

### 13.2 Epistemic Grounding for T/F/NG Items
Research must enforce strict semantic truth conditions:
- **TRUE / YES**: The passage explicitly states or logically entails the proposition.
- **FALSE / NO**: The passage directly contradicts or refutes the proposition.
- **NOT GIVEN**: The passage neither confirms nor contradicts the proposition (information is absent or unverifiable).
- *Strict Rule*: T/F/NG must never be treated as generic sentiment or statistical text classification.

---

## 14. Deep-Dive: IELTS Writing System

### 14.1 Task Typologies & Performance Dimensions
- **Task 1 (Academic)**: Synthesizing trends, comparisons, stages of processes, or maps from charts/graphs (minimum 150 words).
- **Task 1 (General Training)**: Writing formal, semi-formal, or informal letters with specified bullet points.
- **Task 2**: Formulating argumentative, discursive, problem-solution, or two-part essays responding to complex prompts (minimum 250 words).

### 14.2 Four-Criteria Diagnostic Evaluation
Research must investigate automated feedback aligned with official public band descriptors:
1. **Task Achievement / Task Response (TA/TR)**: Prompt completeness, clear position throughout, well-developed ideas with relevant support.
2. **Coherence & Cohesion (CC)**: Logical paragraphing, central topic per paragraph, varied cohesive devices without mechanical overuse.
3. **Lexical Resource (LR)**: Wide range of academic vocabulary, precise collocation use, awareness of style and collocation, minimal spelling slips.
4. **Grammatical Range & Accuracy (GRA)**: Variety of complex sentence structures, high proportion of error-free sentences, accurate punctuation.

---

## 15. Deep-Dive: IELTS Speaking System

### 15.1 Three-Part Assessment Framework
- **Part 1 (Introduction & Interview)**: 4–5 minutes of familiar everyday topics (work, study, hometown, hobbies).
- **Part 2 (Individual Long Turn)**: 1-minute structured preparation followed by an uninterrupted 1–2 minute monologue based on a cue card.
- **Part 3 (Two-Way Discussion)**: 4–5 minutes of abstract, analytical, and speculative discourse extending Part 2 themes.

### 15.2 Four-Criteria Performance Evaluation
1. **Fluency & Coherence (FC)**: Speech continuity, natural pacing, discourse marker variety, absence of unnatural hesitation or self-repair.
2. **Lexical Resource (LR)**: Idiomatic expression, paraphrase flexibility, vocabulary breadth.
3. **Grammatical Range & Accuracy (GRA)**: Complex structural variety, grammatical precision.
4. **Pronunciation (PR)**: Intelligibility, phonemic accuracy, word/sentence stress, rhythm, and intonational phrasing (`R1-F029`).

---

## 16. Conceptual End-to-End Learning Journey

```
CANDIDATE END-TO-END LEARNER JOURNEY TOPOLOGY (CONCEPTUAL_CANDIDATE_ONLY)
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER GOAL DEFINITION                           │
│               (Target IELTS Band, Exam Date, Daily Time)                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        INITIAL DIAGNOSTIC SUITE                         │
│        (Vocabulary Band, Acoustic Decoding, Reading Speed, Writing)     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              MULTIDIMENSIONAL LEARNER STATE INVESTIGATION               │
│          (Memory Scheduling, Latent Mastery, Ability Estimates)         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   DYNAMIC CURRICULUM & PREREQUISITES                    │
│          (Skill Ordering Graph, Milestone Hierarchy, Target Gaps)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DAILY SESSION ORCHESTRATOR                         │
│     (Interleaved Review, New Concepts, Weak-Skill Focus, Timed Drill)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        INSTRUCTIONAL DELIVERY                           │
│         (Explicit Teaching, Worked Examples, Scaffolded Models)         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRACTICE & ASSESSMENT                           │
│         (Faded Guidance Drills ──> Unaided Practice ──> Timed Tasks)    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   DIAGNOSTIC FEEDBACK & REMEDIATION                     │
│      (Error Classification, Misconception Drills, Clean Retest)         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   SPACED RETENTION & NOVEL TRANSFER                     │
│      (Spaced Review Scheduling, Real-World Content Ingestion Tasks)     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 READINESS PROJECTION & MOCK SIMULATION                  │
│        (Candidate Band Prediction Research, Full Mock Simulation)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     └───► [UPDATE LEARNER STATE & REPEAT]
```

---

## 17. Cluster G — Learning System Effectiveness + Quality Evaluation

```
LEARNING SYSTEM EFFECTIVENESS & QUALITY EVALUATION TOPOLOGY
┌─────────────────────────────────────────────────────────────────────────┐
│                     1. LEARNING OUTCOME EVALUATION                      │
│     (Immediate vs Delayed Gains, Receptive vs Productive Dimensions)    │
├────────────────────────────────────┬────────────────────────────────────┤
│       2. DELAYED RETENTION         │       3. NOVEL TRANSFER            │
│   (Clean Retrieval after Decay)    │  (Unseen Context Generalization)   │
├────────────────────────────────────┴────────────────────────────────────┤
│                    4. IELTS FOUR-SKILL IMPROVEMENT                      │
│    (Micro-Skill Calibration vs Holistic Official Mock Improvement)      │
├────────────────────────────────────┬────────────────────────────────────┤
│     5. TEACHING EFFECTIVENESS      │    6. REMEDIATION EFFECTIVENESS    │
│  (Instructional Gain vs Baseline)  │  (Misconception Resolution Rates)  │
├────────────────────────────────────┴────────────────────────────────────┤
│     7. GENERATED-ITEM QUALITY      │    8. SCORING & RUBRIC QUALITY     │
│   (Bad-Item / Distractor Rates)    │   (Calibration & Error Margins)    │
├────────────────────────────────────┴────────────────────────────────────┤
│       9. DIAGNOSTIC QUALITY        │   10. LEARNER-MODEL CALIBRATION    │
│   (Sensitivity / Specificity)      │     (Brier Scores / Overfit)       │
├────────────────────────────────────┴────────────────────────────────────┤
│   11. ADAPTIVE POLICY EFFECT       │      12. LEARNING EFFICIENCY       │
│  (Dynamic Policy vs Static Base)   │    (Gain-per-Minute / Burden)      │
├────────────────────────────────────┴────────────────────────────────────┤
│                    13. SKILL DECAY & REGRESSION AUDIT                   │
│       (Distinguishing Real Regression from Temporary Variance)          │
├────────────────────────────────────┬────────────────────────────────────┤
│     14. EVALUATION METHODOLOGY     │    15. PROVENANCE INTEGRITY        │
│   (Pre/Post, Control Baselines)    │  (Auditable Multi-Factor Context)   │
├────────────────────────────────────┴────────────────────────────────────┤
│               16. LEARNING QUALITY DASHBOARD & FAIRNESS                 │
│    (Defensible Product-Level Evidence vs Prohibited Vanity Metrics)     │
└─────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Central Research Question for Cluster G**:
> *"How can VocabMaster determine, with defensible empirical evidence, whether its instruction, exercises, feedback, adaptive decisions, and overall learning system actually cause or support meaningful, durable, and transferable learner improvement?"*

### 17.1 G1 — Learning Outcome Evaluation
Research must investigate methods to measure:
- Immediate learning gain vs delayed retrieval (`R1-F001`, `R1-F015`).
- Receptive skill improvement (Listening/Reading) vs productive skill improvement (Writing/Speaking) (`R1-F013`).
- Lexical depth (collocations, syntax, register) vs lexical breadth (raw headword counts).
- Granular sub-skill gains (e.g. connected speech parsing) vs full-task performance (e.g. IELTS Listening section).
- *Strict Principle*: Practice success under massed drilling must **NEVER** be silently equated with durable learning.

### 17.2 G2 — Delayed Retention Research
Research must establish protocols to evaluate whether learned knowledge persists over time:
- Designing delayed retest probes at calibrated forgetting horizons (e.g. 1d, 7d, 30d) (`R1-F002`).
- Isolating delayed retrieval from repeated-exposure contamination.
- Comparing retention under scaffolded vs unaided clean retrieval conditions (`R1-F007`).
- Differentiating item-specific memory from abstract construct-level retention.

### 17.3 G3 — Transfer & Generalization Evaluation
Research must distinguish between:
- **Near Transfer**: Applying learned patterns to isomorphic sentences with identical syntactic frames.
- **Far / Novel-Context Transfer**: Applying vocabulary, grammar, or discourse structures in unpracticed topics, novel audio passages, unseen accents, or spontaneous speaking/writing tasks (`R1-F043`).
- Guarding against rote memorization of training items being mistaken for authentic language acquisition.

### 17.4 G4 — IELTS Four-Skill Improvement Measurement
Research how to verify whether system engagement translates to genuine IELTS capability:
- Micro-skill improvement $\neq$ automatically higher band score (e.g. better acoustic decoding does not guarantee high Reading or Writing bands).
- Skill-specific outcome measures vs full-task holistic tests.
- Comparing timed exam performance vs untimed practice performance.
- Accounting for test-retest familiarity and test-form comparability.

### 17.5 G5 — Teaching Effectiveness & Instructional Impact
Research how to evaluate whether explicit instructional interventions provide measurable educational lift:
- Comparing learning gains across: explicit explanation, worked examples, guided practice, contrastive examples, and Socratic hints.
- Investigating whether remediation produces better delayed retention than merely presenting another raw practice item.
- Identifying conditions where excess explanation creates cognitive overload or reduces independent retrieval effort (`R1-F005`).
- *Strict Rule*: More explanation $\neq$ better learning.

### 17.6 G6 — Feedback & Remediation Effectiveness
Research candidate quality metrics:
- `ERROR_RECURRENCE_RATE`: Frequency with which a corrected error reappears in subsequent tasks (`R1-F035`).
- `MISCONCEPTION_RESOLUTION_RATE`: Percentage of diagnosed misconceptions successfully cleared on clean retest.
- `CLEAN_RETEST_SUCCESS`: Accuracy on an isomorphic item immediately following remediation.
- `DELAYED_RETEST_SUCCESS`: Accuracy on an isomorphic item after a forgetting interval.
- `TRANSFER_AFTER_REMEDIATION`: Ability to use the remediated construct correctly in a novel communicative context.

### 17.7 G7 — Generated-Item Quality & Defect Rates
Research how to audit and control defect rates in AI-generated exercises:
- `BAD_ITEM_RATE`: Overall proportion of flawed generated exercises.
- `INVALID_KEY_RATE`: Items where the designated answer key is factually incorrect.
- `AMBIGUOUS_ITEM_RATE`: Items where question phrasing permits multiple conflicting interpretations.
- `MULTIPLE_DEFENSIBLE_ANSWER_RATE`: Items where distractors are defensibly correct.
- `ANSWER_LEAKAGE_RATE`: Items where the prompt or context clues reveal the correct answer.
- `GROUNDING_FAILURE_RATE`: Items whose facts contradict or are absent from the provided source text.
- `INVALID_DISTRACTOR_RATE`: Distractors that are implausible, absurd, or grammatically mismatched.
- `DIFFICULTY_MISALIGNMENT_RATE`: Items whose actual empirical difficulty diverges sharply from target CEFR/IELTS band.
- `IELTS_FORMAT_VIOLATION_RATE`: Items violating official exam constraints (e.g. exceeding word limits).
- `LEARNER_REPORTED_BAD_ITEM_RATE`: Triage volume of user dispute reports.

### 17.8 G8 — Assessment & Scoring Quality
Research automated scoring calibration (especially for Writing and Speaking):
- `SCORING_CALIBRATION_ERROR`: Deviation between automated score predictions and expert human examiner benchmarks.
- `HUMAN_MODEL_DISAGREEMENT`: Inter-rater agreement statistics (e.g. Quadratic Weighted Kappa, Pearson $r$).
- `RUBRIC_DIMENSION_ERROR`: Individual error margins across TA/TR, CC, LR, GRA (Writing) and FC, LR, GRA, PR (Speaking).
- `FALSE_BAND_CONFIDENCE`: Danger of presenting point estimates (e.g. "Band 7.0") when model uncertainty spans $\pm 1.0$ band.
- `SCORE_INSTABILITY`: Sensitivity of evaluation models to minor non-substantive prompt variations.

### 17.9 G9 — Diagnostic Quality & Misdiagnosis Prevention
Research potential diagnostic failure modes:
- `FALSE_WEAKNESS`: Flagging a non-existent weakness due to a single noisy attempt or ambiguous question.
- `FALSE_MASTERY`: Prematurely classifying a construct as mastered after scaffolded success (`R1-F007`, `R1-F045`).
- `MISDIAGNOSIS`: Misattributing an error (e.g. treating an acoustic decoding failure as a vocabulary deficiency, per `R1-F017`).
- `MISCLASSIFIED_MISCONCEPTION`: Mapping an error to the wrong pedagogical root cause (`R1-F035`).
- `WRONG_PREREQUISITE_DIAGNOSIS`: Recommending remedial work on unrelated foundation topics.
- `INSUFFICIENT_EVIDENCE`: Making diagnostic claims before establishing minimum statistical sample thresholds (`R1-F012`).
- *Strict Invariant*: $\text{NO EVIDENCE} \neq \text{EVIDENCE OF WEAKNESS}$ and $\text{ONE SUCCESS} \neq \text{MASTERY}$.

### 17.10 G10 — Learner-Model Calibration
Research empirical validation of learner-state estimates:
- Does predicted FSRS retrievability ($R$) match observed delayed retrieval rates across forgetting horizons?
- Does BKT latent mastery ($P(L)$) correlate with unassisted success on clean retests?
- Evaluating model calibration via Brier scores, reliability diagrams, and held-out future attempt prediction error.

### 17.11 G11 — Adaptive Policy Effectiveness
Research whether dynamic next-task selection produces superior learning outcomes compared to standard baselines:
- Benchmarking adaptive policies against: (1) static linear curriculum, (2) simple due-review queue, (3) random/interleaved baseline, (4) static skill-priority heuristic, and (5) purely learner-selected study.
- Evaluating outcomes on: learning gain per hour, retention stability, transfer breadth, learner cognitive burden, and avoidance of pathological feedback loops (noting that adaptation benefits are heterogeneous per `R1-F034`).

### 17.12 G12 — Learning Efficiency & Cognitive Burden
Research measuring educational velocity relative to student time investment:
- `TIME_TO_MASTERY`: Total study minutes required to achieve calibrated mastery on a target construct.
- `ATTEMPTS_TO_CRITERION`: Number of drill items required to reach stable criterion performance.
- `LEARNING_GAIN_PER_MINUTE`: Ratio of measurable knowledge growth to active app time.
- `REMEDIATION_COST`: Time diverted to corrective loops.
- `REVIEW_BURDEN`: Percentage of daily time consumed by maintenance reviews vs new acquisition.
- *Strict Invariant*: Fast exercise completion does **NOT** equal efficient learning if retention is poor.

### 17.13 G13 — Skill Decay, Regression & Absence Recovery
Research how the system detects and handles linguistic erosion:
- Modeling skill decay rates across declarative vocabulary vs procedural pronunciation and fluency.
- Distinguishing temporary session noise (fatigue, distraction) from material skill regression.
- Designing re-entry diagnostic assessments to gently re-profile learners after prolonged study absences.

### 17.14 G14 — Evaluation Methodology & Experimental Design
Research robust experimental and observational evaluation designs:
- Pre-test / Post-test / Delayed Post-test designs.
- Within-learner cross-over comparisons and controlled A/B evaluation paradigms.
- Mitigating threats to internal and external validity: practice effects, test item leakage, regression to the mean, attrition/survivorship bias, and model-version drift.

### 17.15 G15 — Evidence Provenance Architecture
Every effectiveness data point must record complete contextual provenance:
- Targeted construct, task identity, scaffolding mode (learning vs test), delay window, previous item exposures, scoring engine, rater uncertainty, and model version.

### 17.16 G16 — Learning Quality Dashboard vs Vanity Metrics
Research product metrics that genuinely reflect educational health while rejecting misleading vanity metrics:
- **True Learning Quality Indicators**: Delayed retention rate, transfer success rate, misconception clearance rate, bad-item defect rate, scoring calibration error, diagnostic accuracy.
- **Prohibited as Standalone Learning Evidence**: Streak length, session count, raw items completed, daily active minutes. (These measure engagement/usage, NOT learning, per `R1-F040`, `R1-F041`).

### 17.17 G17 — Algorithmic Fairness in Learning Outcomes
Research whether learning efficacy, diagnostic accuracy, or scoring calibration differ systematically across learner sub-populations:
- Evaluating fairness across non-native accent backgrounds, baseline proficiency levels, device/microphone hardware differences, and accessibility accommodations.
- *Strict Privacy Stance*: Evaluate fairness without collecting prohibited demographic or protected attributes.

### 17.18 G18 — Product-Level Success Research Question
The foundational research question for all subsequent Stage 3 / Stage 5 investigations is:

> *"Does VocabMaster measurably improve durable language knowledge, transferable language skills, and relevant IELTS performance compared with appropriate baselines, without introducing unacceptable misdiagnosis, invalid-item, scoring-calibration, fairness, or workload failures?"*

---

## 18. OSS & Research-Ecosystem Discovery for Cluster G

> [!IMPORTANT]
> **MANDATORY EVALUATION ECOSYSTEM SURVEY**:
> Downstream authorized research MUST reconcile existing canonical R2 capabilities (`docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`) before surveying external psychometric toolkits or academic benchmark datasets.

### 18.1 Target Tooling Classes to Reconcile / Survey
- **Psychometrics & IRT Engines**: Open-source IRT packages, Computerized Adaptive Testing simulators (e.g. `catsim` `OSS-046` surveyed in R2).
- **Knowledge Tracing Benchmark Harnesses**: Standardized KT evaluation frameworks (e.g. `pyKT` `OSS-047`, `pyBKT` `OSS-045` surveyed in R2).
- **Statistical Calibration & Agreement Tooling**: Brier score calculators, Quadratic Weighted Kappa libraries, inter-rater reliability packages.
- **Grammar & GEC Evaluation Toolkits**: Automated annotation and evaluation taxonomies (e.g. `ERRANT` `OSS-037` surveyed in R2).
- **Distractor Evaluation Suites**: Benchmark frameworks for ranking and evaluating question distractors (e.g. `D-GEN` `OSS-038`, `DisGeM` `OSS-038` surveyed in R2).
- **Public Educational Datasets**: Standardized language learning attempt corpora, human-scored essay datasets, phonetically annotated speech corpora.

### 18.2 Dataset & Benchmark Evaluation Standards
For every surveyed research dataset or benchmark suite, research must document:
```text
[DATASET_NAME]
├── Provenance & Institutional Source
├── Open-Access License & Commercial Reusability
├── Learner Population & Demographic Representation
├── Target Task & Linguistic Modality
├── Annotation Methodology & Label Quality
├── Known Biases & Class Imbalances
├── Contamination / Leakage Risk
└── Product-Fit Assessment for VocabMaster / OmniIELTS
```

---

## 19. Content × Learning Phase Coverage Matrix

Every material intersection in this matrix must be explicitly addressed during downstream Stage 3 research. Unresearched cells are tagged `OPEN_RESEARCH_REQUIREMENT`.

| Content Domain | 1. Diagnose | 2. Teach | 3. Guided Practice | 4. Independent Practice | 5. Assess | 6. Feedback | 7. Remediate | 8. Retest | 9. Retain (FSRS) | 10. Transfer | 11. Evaluate Effectiveness |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Vocabulary** | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` |
| **Collocation** | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` |
| **Grammar** | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` |
| **Pronunciation**| `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` |
| **Listening** | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` |
| **Reading** | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` |
| **Writing** | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` |
| **Speaking** | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` |
| **IELTS Task** | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` | `OPEN_RESEARCH_REQUIREMENT` |

---

## 20. IELTS Four-Skill Capability & Effectiveness Matrix

| Capability Dimension | Listening System | Reading System | Writing System | Speaking System |
|---|---|---|---|---|
| **Content Analysis** | ASR, phoneme alignment, acoustic feature candidates | Readability, CEFR band, syntactic complexity candidates | Prompt decomposition, task type classification candidates | Topic taxonomy, cue card prompts, question bank candidates |
| **Micro-Skills** | Connected speech, weak forms, numbers, signposts | Skimming, scanning, T/F/NG inference, headings | Topic sentences, thesis statements, cohesive links | Fluency chunks, stress/intonation, self-repair |
| **Instruction** | Bottom-up decoding drills, audio shadowing exploration | Evidence location strategies, structure parsing | Structural models, essay frameworks, sentence-level guidance | Monologue ideation, discourse marker drills |
| **Item Generation** | Multi-choice, form/table cloze, diagram labels | T/F/NG, matching headings, summary completion | Task 1 chart synthesis, Task 2 discursive prompts | Part 1 interviews, Part 2 cue cards, Part 3 prompts |
| **Item Validation** | Audio timestamp grounding, distractor plausibility checks | Passage grounding verification, non-ambiguity checks | Prompt clarity, official task constraint checks | Question neutrality, cognitive load appropriateness |
| **Feedback** | Audio replay snippet, transcript evidence highlight | Text passage highlight, rationale explanation | 4-rubric band breakdown, targeted error markup | Pronunciation phoneme critique, fluency feedback |
| **Assessment** | Objective 40-item raw score $\to$ band conversion research | Objective 40-item raw score $\to$ band conversion research | Subjective multi-dimensional band calibration research | Subjective multi-dimensional band calibration research |
| **Scoring Calibration**| Deterministic answer key matching | Deterministic answer key matching | Multi-model agreement, rubric anchor benchmarks (`STAGE5_BENCHMARK_CANDIDATE`) | Acoustic phonetic scoring, human-calibrated audio (`STAGE5_BENCHMARK_CANDIDATE`) |
| **Adaptive Practice** | `OPEN_RESEARCH_REQUIREMENT` (Dynamic difficulty scaling) | `OPEN_RESEARCH_REQUIREMENT` (Passage/lexical pacing) | `OPEN_RESEARCH_REQUIREMENT` (Stepwise criteria focus) | `OPEN_RESEARCH_REQUIREMENT` (Scaffolded turn pacing) |
| **Full-Task Practice** | Complete 30-min section simulation | Complete 60-min 3-passage simulation | Full Task 1 (20m) & Task 2 (40m) compositions | Full 3-part 11–14 min interview simulation |
| **Test Mode Invariants**| Timed simulation, unassisted evidence capture | Timed simulation, unassisted evidence capture | Timed editor, unassisted evidence capture | Timed recording, unassisted evidence capture |
| **Readiness Projection**| `CANDIDATE_MEASUREMENT_APPROACH` (Ability estimates with uncertainty bounds) | `CANDIDATE_MEASUREMENT_APPROACH` (Ability estimates with uncertainty bounds) | `CANDIDATE_MEASUREMENT_APPROACH` (Rubric performance intervals) | `CANDIDATE_MEASUREMENT_APPROACH` (Fluency & rubric prediction intervals) |
| **Effectiveness Evaluation**| Delayed acoustic retest, novel speaker transfer | Unseen passage comprehension, speed stability | Unprompted transfer in fresh essays, rubric growth | Unscripted fluency gains, phoneme error decay |
| **Quality Audit Metrics**| Grounding errors, ASR hallucination rate | Ambiguous T/F/NG rate, key dispute volume | Score overconfidence, rater disagreement rate | Pronunciation scoring bias, latency dropouts |
| **Candidate OSS/Capability References** | Canonical R2 candidates (WhisperX `OSS-041`, Silero VAD `OSS-020`, Web Audio API) | Canonical R2 candidates (Readability `OSS-012`, EdgeParse `OSS-042`, PDF.js `OSS-022`) | Canonical R2 candidates (Harper WASM `OSS-036`, ERRANT `OSS-037`, LanguageTool `OSS-016`) | Canonical R2 candidates (Wav2Vec2 alignment `OSS-021`, Web Audio VAD `OSS-020`) |

---

## 21. Research Questions & Empirical Evidence Needs Register

| # | Core Research Question | Why It Matters | Evidence Needed | Canonical Stage 3 Inputs | Canonical R2 / External Reference | Correct Routing Class |
|---|---|---|---|---|---|---|
| **RQ-01** | How can delayed retention be verified without repeated-test contamination? | Distinguishes short-term practice success from durable memory. | Empirical retention decay curves across calibrated 1d, 7d, 30d retests. | Canonical R1 memory findings (`R1-F001`, `R1-F002`). | Spaced retrieval algorithms; `pyBKT` (`OSS-045`). | `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `STAGE5_BENCHMARK` / `AUTHORITY_REVIEW_NEEDED` |
| **RQ-02** | What protocols reliably measure novel-context transfer? | Prevents mistaking item memorization for genuine skill acquisition. | Pre/post performance data on unpracticed lexical and syntactic contexts. | Canonical R1 transfer findings (`R1-F013`, `R1-F043`, `R1-F045`). | Transfer evaluation frameworks; semantic embeddings (`OSS-026`). | `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `STAGE5_BENCHMARK` / `AUTHORITY_REVIEW_NEEDED` |
| **RQ-03** | How do sub-skill gains translate to overall IELTS band improvements? | Calibrates micro-exercise value against official exam benchmarks. | Longitudinal correlation studies between micro-skill scores and mock test bands. | Stage 2 IELTS taxonomy (`STAGE2_COMPLETENESS`); `R1-F010`. | Official public IELTS band descriptors. | `STAGE5_BENCHMARK` / `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `OWNER_DECISION` |
| **RQ-04** | Which instructional intervention types maximize learning efficiency? | Avoids unnecessary explanation and cognitive overload. | Comparative gain-per-minute data across instruction formats (worked examples, hints, rules). | Canonical R1 cognitive load findings (`R1-F005`, `R1-F008`, `R1-F009`). | Interactive tutoring frameworks, Socratic scaffolding research. | `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `AUTHORITY_REVIEW_NEEDED` / `OWNER_DECISION` |
| **RQ-05** | How can remediation effectiveness and misconception resolution be verified? | Ensures student errors are remediated rather than endlessly repeated. | Tracking error recurrence rates on clean post-remediation retests. | Canonical R1 error recurrence and feedback findings (`R1-F023`, `R1-F033`, `R1-F035`). | `ERRANT` (`OSS-037`), mistake decay models. | `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `STAGE5_BENCHMARK` / `AUTHORITY_REVIEW_NEEDED` |
| **RQ-06** | What automated filters minimize generated-item defects? | Protects learners from learning incorrect or ambiguous language. | Defect sampling audits across prompt architectures and validation contracts. | Canonical R2 item generation candidates (`OSS-038`–`OSS-040`). | `D-GEN` distractor ranking (`OSS-038`), rule-based NLP filters (`OSS-017`). | `STAGE5_BENCHMARK` / `R3_CANDIDATE` (for filter pipeline boundary) / `OWNER_DECISION` |
| **RQ-07** | What is the empirical error margin of automated Writing/Speaking scoring? | Prevents misleading learners with false band score confidence. | Human-model agreement benchmarks (Quadratic Weighted Kappa, Pearson $r$). | Canonical R2 NLP candidates; canonical R1 construct separation (`R1-F010`, `R1-F027`, `R1-F029`). | Automated essay scoring engines, phonetic aligners (`OSS-041`). | `STAGE5_BENCHMARK` / `OWNER_DECISION` / `AUTHORITY_REVIEW_NEEDED` |
| **RQ-08** | What statistical thresholds prevent diagnostic misclassification? | Prevents premature mastery claims or false weakness flags. | Sensitivity/specificity curves on synthetic and real attempt logs. | Canonical R1 uncertainty findings (`R1-F012`, `R1-F017`); Phase 6 Weakness profile baseline. | IRT calibration tools, `catsim` (`OSS-046`), `pyBKT` (`OSS-045`). | `STAGE5_BENCHMARK` / `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `OWNER_DECISION` |
| **RQ-09** | How can false mastery from scaffolded assistance be systematically detected? | Ensures only unassisted performance generates high-confidence mastery. | Comparative analysis of scaffolded vs unaided attempt evidence. | Canonical `EvidencePolicy` invariants; canonical R1 assistance findings (`R1-F007`, `R1-F016`, `R1-F045`). | Bayesian Knowledge Tracing slipped/guessed models (`OSS-045`). | `R4_RECONCILIATION` (reconcile policy with evidence) / `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `OWNER_DECISION` |
| **RQ-10** | How well calibrated are FSRS retrievability and BKT mastery estimates? | Validates whether internal model parameters reflect real student memory. | Brier scores and calibration curves on longitudinal attempt logs. | Canonical R1 model differentiation (`R1-F011`) & retention target status (`R1-F003`). | `pyKT` knowledge tracing benchmark harness (`OSS-047`). | `STAGE5_BENCHMARK` / `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `AUTHORITY_REVIEW_NEEDED` |
| **RQ-11** | Does adaptive item sequencing outperform static or random baselines? | Proves the educational utility of complex adaptation algorithms. | Randomized A/B gain comparisons against linear and review baselines. | Canonical R1 adaptive learning heterogeneity findings (`R1-F034`). | Multi-armed bandit schedulers (`OSS-032`), IRT CAT engines (`OSS-046`). | `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `STAGE5_BENCHMARK` / `OWNER_DECISION` / `AUTHORITY_REVIEW_NEEDED` |
| **RQ-12** | How can learning efficiency be maximized without sacrificing retention? | Prevents student burnout and optimizes study time. | Metrics tracking knowledge gains per active study minute. | Canonical R1 microlearning status (`R1-F042` unknown) & initiation cues (`R1-F037`, `R1-F038`). | Time-to-mastery telemetry models. | `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `OWNER_DECISION` / `AUTHORITY_REVIEW_NEEDED` |
| **RQ-13** | How should the system distinguish temporary noise from skill regression? | Prevents premature panic or unwarranted remedial disruption. | Longitudinal variance models of student response latency and errors. | Canonical R1 spacing/retention findings (`R1-F001`, `R1-F002`) & error recurrence (`R1-F035`). | Statistical process control algorithms. | `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `STAGE5_BENCHMARK` / `R3_CANDIDATE` (telemetry storage) |
| **RQ-14** | What evaluation design provides valid evidence of product effectiveness? | Establishes scientifically defensible proof of VocabMaster efficacy. | Pre/post delayed randomized evaluation protocols. | Canonical R1 evaluation standards & construct separation (`R1-F010`, `R1-F044`, `R1-F045`). | Educational evaluation frameworks, A/B test rigs. | `ADDITIONAL_STAGE3_RESEARCH_NEEDED` / `AUTHORITY_REVIEW_NEEDED` / `OWNER_DECISION` |
| **RQ-15** | How can learning effectiveness and scoring fairness be assured across accents? | Prevents demographic or regional bias in AI pronunciation scoring. | Error distribution analysis across accented speech benchmarks. | Canonical R1 pronunciation findings (`R1-F029`). | Multi-accent speech corpora, `WhisperX` (`OSS-041`), Wav2Vec2 (`OSS-021`). | `STAGE5_BENCHMARK` / `AUTHORITY_REVIEW_NEEDED` / `OWNER_DECISION` |

---

## 22. Cluster H — End-to-End Coverage & Unknown-Unknowns Audit

A comprehensive review across **10 representative learner personas** against **16 core product lifecycle and effectiveness dimensions**:

| Learner Persona | 1. Diagnose | 2. Teach | 3. Practice | 4. Assess | 5. Explain | 6. Remediate | 7. Retain | 8. Transfer | 9. Select Action | 10. Recover Failure | 11. Measure Gain | 12. Delayed Retention | 13. Transfer Audit | 14. False Mastery Check | 15. Bad Item Detect | 16. Remediation Verify |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1. Brand-New Beginner (A2/B1)** | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |
| **2. Vocabulary-Focused Learner** | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |
| **3. Listening-Weak IELTS Candidate**| `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |
| **4. Reading-Weak IELTS Candidate** | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |
| **5. Writing-Weak IELTS Candidate** | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |
| **6. Speaking-Weak IELTS Candidate**| `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |
| **7. Learner Returning After 30d** | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |
| **8. Chronic Misconception Learner**| `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |
| **9. Advanced Mocks Candidate (C1)**| `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |
| **10. Real-World Media Importer** | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` | `OPEN` |

*Audit Finding*: Every persona-dimension intersection requires explicit downstream research specification. No lifecycle capability may be presumed solved by surface UI components.

---

## 23. Open Research Requirements Register

- `REQ-EXP-001`: Formulate explicit instruction and worked-example generation requirements for IELTS writing and speaking sub-skills.
- `REQ-EXP-002`: Investigate whether and under what conditions distinct memory ($R$), latent mastery ($P(L)$), item difficulty ($b$), and ability ($\theta$) models can conceptually interoperate without collapsing their meanings.
- `REQ-EXP-003`: Survey open-source NLP and WASM engines for client-side grammatical error classification and diagnostic taxonomies (reconciling canonical R2 Harper `OSS-036` and ERRANT `OSS-037`).
- `REQ-EXP-004`: Establish standardized prompt templates and validation contracts for difficulty-conditioned distractor synthesis (reconciling canonical R2 D-GEN `OSS-038` and `OSS-039`).
- `REQ-EXP-005`: Define multi-format content ingestion schemas preserving layout structure (tables, columns, reading orders; reconciling canonical R2 EdgeParse `OSS-042`).
- `REQ-EXP-006`: Investigate non-punitive streak recovery and daily backlog management algorithms without predatory dark patterns.
- `REQ-EXP-007`: Establish standardized evaluation designs for measuring delayed retention without test-retest contamination.
- `REQ-EXP-008`: Define automated defect-detection and calibration metrics for generated IELTS exercise items.
- `REQ-EXP-009`: Reconcile open-source psychometric and knowledge tracing benchmark suites (`pyKT` `OSS-047`, `catsim` `OSS-046`, `pyBKT` `OSS-045`) as reference candidates.
- `REQ-EXP-010`: Investigate multi-factor evidence provenance requirements linking attempt context to downstream effectiveness analysis without defining implementation schemas.

---

## 24. R1 / R2 / R3 / R4 Research Reconciliation Questions

- **R1 vs R2 Reconciliation**: Do the open-source libraries surveyed in canonical Lane R2 (`docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`) support the desirable difficulties, spaced retrieval, and delayed testing paradigms established by canonical Lane R1 (`docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`)?
- **R2 vs R3 Reconciliation**: Can client-side WASM engines (e.g. Harper `OSS-036`, EdgeParse `OSS-042`, Orama `OSS-043`) operate within the memory, Web Worker, and IndexedDB storage constraints investigated in Lane R3?
- **R3 vs Effectiveness Evaluation**: How does the offline-first, local-persistence model record and synchronize longitudinal evaluation data without compromising user privacy or overloading client storage?
- **R4 Synthesis Mandate**: How should the Owner Decision Ledger prioritize client-side determinism vs hosted API intelligence across each of the 4 IELTS skills and evaluation dimensions based on accepted research?

---

## 25. Authority Review Needed

Where newly identified research requirements exceed the bounded scope of existing authorization manifests (`docs/authorizations/STAGE3-RESEARCH-AUTH-001.md`), an explicit governance escalation is required:
- **Governance Invariant**: **`IDENTIFYING A RESEARCH NEED DOES NOT AUTHORIZE ITS EXECUTION.`**
- Any proposed execution of additional empirical pedagogy research (`ADDITIONAL_STAGE3_RESEARCH_NEEDED`) or expansion of Lane R3/R4 scope must be ratified via an addendum or fresh authorization manifest before research execution.
- Unresearched material requirements must be tracked as open items in the Owner Decision Ledger rather than fabricated during synthesis.

---

## 26. Explicit Non-Decisions

This document **EXPLICITLY DOES NOT DECIDE OR AUTHORIZE**:
- Final production exercise taxonomies.
- Final curriculum schedules or prerequisite lists.
- Final learner model database schemas or TypeScript interfaces.
- Final mathematical mastery formulas or unified parameterizations.
- Final adaptive item-routing algorithms or policy implementations.
- Final scoring calibration models or band prediction heuristics.
- Final learning-effectiveness metrics or experimental designs.
- Final A/B testing frameworks or statistical models.
- Final acceptable thresholds for bad-item rates or scoring calibration errors.
- Selection of specific AI tutors, LLM models, or prompt templates.
- Adoption or installation of any npm packages or third-party dependencies (`package.json`).
- Final hosted API or cloud provider agreements.
- Final software architecture blueprints or production code (`src/**`).
- Modification of any production code (`src/**`) or test suites (`tests/**`).

---

## 27. Remediation Ledger & Next Governance Steps

### 27.1 Bounded Remediation Ledger (REM-001)

| Finding ID | Status | Affected Sections | Remediation Action | Preserved Semantics | Authority Impact |
|---|---|---|---|---|---|
| `LX-AUDIT-F001` | **REMEDIATED** | §9.5, §23 (`REQ-EXP-010`) | Removed TypeScript interface, field names, types, enums, and object schema. Replaced with conceptual provenance requirements. | Preserved requirement to retain attempt context for valid downstream effectiveness evaluation. | Zero schema authority; research input only. |
| `LX-AUDIT-F002` | **REMEDIATED** | §1.2, §7.1, §7.3, §16, §20, §23 (`REQ-EXP-002`) | De-froze implied monolithic learner stack. Removed mathematical-unification claims. Positioned FSRS, BKT, IRT, CAT, and pyKT as distinct conceptual model families. Formulated interoperability research question. | Preserved need to investigate multi-construct learner state and memory vs mastery vs difficulty modeling. | Zero model selection authority; candidates only. |
| `LX-AUDIT-F003` | **REMEDIATED** | §5, §6.0, §6.2, §21 (`RQ-04`, `RQ-12`) | Removed unsupported causal certainty regarding mock fatigue and universal immediate feedback timing. Replaced with conditional/open research semantics. | Preserved investigation of full-mock vs meso practice and feedback typologies. | Zero empirical authority; open research questions only. |
| `LX-AUDIT-F004` | **REMEDIATED** | §4, §17, §21 (`RQ-01`–`RQ-15`) | Mechanically audited all `R1-Fxxx` references against canonical R1 registry (`docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`). Corrected misdescriptions of `R1-F024`, `R1-F034`, `R1-F003`, and microlearning (`R1-F042`). | Preserved grounding in accepted canonical R1 cognitive and pedagogical science evidence. | Reconciled strictly to canonical R1. |
| `LX-AUDIT-F005` | **REMEDIATED** | §3, §21, §25 | Corrected research routing across all open questions. Stopped misrouting empirical pedagogy to R3 or missing evidence to R4. Assigned truthful routing classes (`ADDITIONAL_STAGE3_RESEARCH_NEEDED`, `STAGE5_BENCHMARK`, `OWNER_DECISION`, `AUTHORITY_REVIEW_NEEDED`, `R3_CANDIDATE`, `R4_RECONCILIATION`). | Preserved R3 architecture boundary and R4 reconciliation boundary. | Added explicit governance rule: Identifying a research need does not authorize its execution. |
| `LX-AUDIT-F006` | **REMEDIATED** | §7.1, §7.2, §8.2, §8.4, §16, §20, §23, §26 | Removed normative/final choices regarding prerequisite relation types, adaptive action outputs, and learner model dimensions. Labeled all candidate structures as `CONCEPTUAL_CANDIDATE_ONLY` / `NOT_FINAL_ARCHITECTURE` / `NOT_IMPLEMENTATION_SPECIFICATION`. | Preserved descriptive coverage without implying production architecture choices. | Zero implementation or specification authority. |

### 27.2 Next Governance Steps
1. The remediated candidate is generated outside the repository as `D:\Downloads\STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS_REM-001.md`.
2. Repository remains completely unmodified (`REPOSITORY_MUTATION: NONE`).
3. Candidate is ready for fresh, independent re-audit under transaction `STAGE3-LEARNING-EXPERIENCE-RESEARCH-INPUT-REM001-QUALITY-AUDIT`.
4. Any future materialization into the repository documentation allowlist requires separate authorization.
