# STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS
**Stage 3 Learning-Experience, Instructional System & Effectiveness Research Requirements**

---

## 0. Document Identity

| Attribute | Value |
|---|---|
| **Document Identity** | `STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md` |
| **Transaction Identity** | `STAGE3-LEARNING-EXPERIENCE-RESEARCH-INPUT-AMENDMENT-001` |
| **Parent Transaction** | `STAGE3-LEARNING-EXPERIENCE-RESEARCH-INPUT-PR-001` |
| **Document Status** | `RESEARCH_INPUT_ONLY` |
| **Canonicality** | `NON_CANONICAL` |
| **Authority Level** | `NONE` (Operational Research Input Candidate) |
| **Date** | `2026-08-18` |
| **Repository** | `NguyenDukKyeon/VocabMaster` (`d:\Workspace\EnlishMaster-W6`) |
| **Base Main Commit** | `507895a70caae8dec581bbeb34128af8142190a8` (`origin/main`) |
| **Branch** | `research/stage3-learning-experience-requirements` |
| **Target Draft PR** | PR #153 (`https://github.com/NguyenDukKyeon/VocabMaster/pull/153`) |
| **Controlling Strategy** | `docs/STAGE3_RESEARCH_STRATEGY.md` |
| **Controlling Authorization Baseline** | `docs/authorizations/STAGE3-RESEARCH-AUTH-001.md` |
| **Owner Research Guidance** | `docs/research/STAGE3_RESEARCH_CONSTRAINTS.md` |
| **Pedagogical Evidence Baseline** | `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md` |

---

## 1. Status / Non-Canonical Boundary

> [!IMPORTANT]
> **DOCUMENT_STATUS**: `RESEARCH_INPUT_ONLY`  
> **CANONICALITY**: `NON_CANONICAL`  
> **AUTHORITY**: `NONE`  
> **PURPOSE**: Preserve identified learning-experience, instructional system, and effectiveness evaluation research requirements for future authorized Stage 3 research and R3/R4 reconciliation.

### 1.1 Loss Prevention Notice
**THIS DOCUMENT EXISTS TO PREVENT LOSS OF IDENTIFIED RESEARCH REQUIREMENTS.**

Its presence in the repository does **NOT** itself expand any canonical research transaction, authorize implementation, select architecture, adopt dependencies, or grant merge authority.

### 1.2 Non-Equivalence Axioms
Every reader and coding agent must respect these fundamental non-equivalence boundaries:

$$\text{RESEARCH REQUIREMENT} \neq \text{RESEARCH FINDING}$$
$$\text{RESEARCH FINDING} \neq \text{SPECIFICATION}$$
$$\text{SPECIFICATION} \neq \text{AUTHORIZATION}$$
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

---

## 2. Purpose of This Document

The central motivating questions of this research input document are:

> 1. *"What additional research is required so VocabMaster / OmniIELTS can eventually provide a coherent end-to-end learning experience rather than only a collection of isolated language-processing and assessment capabilities?"*
> 2. *"How can VocabMaster determine, with defensible empirical evidence, whether its instruction, exercises, feedback, adaptive decisions, and overall learning system actually cause or support meaningful, durable, and transferable learner improvement?"*

While Stage 3 Lane R1 established empirical learning science baselines (`docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`) and Lane R2 surveyed global open-source and hosted technical capabilities (`R2_RESEARCH_CANDIDATE_REM-004.md`), an effective learning product requires deeper investigation into how instruction, practice, assessment, adaptation, and outcome evaluation operate as an integrated system.

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
┌────────────────────────────────────────────────────────────────────────┐
│  Lane R1: Learning & Product Research                                  │
│  └── Cognitive science, memory retention, 5-skill pedagogy             │
├────────────────────────────────────────────────────────────────────────┤
│  Lane R2: OSS & Hosted Capability Research                             │
│  └── 18 capability domains, candidate matrices, provider limits        │
├────────────────────────────────────────────────────────────────────────┤
│  THIS DOCUMENT (Stage 3 Learning Experience Requirements)              │
│  └── Preserves end-to-end learning, instruction & effectiveness gaps   │
├────────────────────────────────────────────────────────────────────────┤
│  Lane R3: Pipeline & Architecture Research                             │
│  └── Current substrate audit, streaming pipelines, storage boundaries │
├────────────────────────────────────────────────────────────────────────┤
│  Lane R4: Cross-Research Reconciliation & Synthesis                    │
│  └── Resolves contradictions, maps pedagogy to tech, owner decisions   │
└────────────────────────────────────────────────────────────────────────┘
```

- **R1 Output**: Provides learning/product empirical evidence and construct constraints.
- **R2 Output**: Provides OSS and hosted capability inventories and candidate classifications.
- **This Document**: Preserves additional learning-experience and effectiveness evaluation research requirements so future Stage 3 transactions cannot silently omit them.
- **R3 Interface**: May consume requirements that fall strictly within its authorized pipeline/architecture research scope.
- **R4 Interface**: Reconciles accepted research outputs. R4 **MUST NOT** be expected to invent missing research evidence. Unresearched material requirements must not be silently treated as resolved by R4.
- **Authority Review Trigger**: If canonical Stage 3 authority does not cover required additional research, an explicit `AUTHORITY_REVIEW_NEEDED` trigger must be escalated to repository governance.

---

## 4. Core Learning-System Distinctions

To prevent conflation between surface activity and genuine learning, the following foundational distinctions must govern all downstream research:

1. **`EXERCISE SYSTEM != TEACHING SYSTEM`**: Presenting a student with a test item or question is not the same as instructing them on how to acquire, structure, and apply new knowledge.
2. **`GENERATION != VALIDATION`**: Generating a plausible question or prompt via LLM or template does not mean the item has construct validity, unambiguous distractors, or a verified single correct answer.
3. **`KNOWLEDGE != SKILL != PERFORMANCE`**: Declarative knowledge (knowing a grammar rule) differs from procedural skill (applying it during rapid sentence formation) and real-time performance (producing it fluently under test stress).
4. **`RECOGNITION != RECALL != PRODUCTION != TRANSFER`**: Recognizing a correct option among four choices provides zero evidence of spontaneous recall, spoken production, or novel-context transfer.
5. **`RECEPTIVE != PRODUCTIVE`**: Auditory/reading comprehension does not equal spoken/written fluency. Mastery in one lane cannot be imputed to the other.
6. **`SCAFFOLDED SUCCESS != INDEPENDENT RETRIEVAL`**: Success achieved while viewing hints, transcripts, or glosses cannot be credited as independent mastery.
7. **`PRACTICE PERFORMANCE != RETENTION != TRANSFER`**: High accuracy during massed practice does not prove long-term retention or generalization to unpracticed contexts.
8. **`LEARNING MODE EVIDENCE != TEST MODE EVIDENCE`**: Data gathered during scaffolded learning sessions has different evidentiary validity from strictly timed, unaided exam simulation data.
9. **`READING/LISTENING ASSESSMENT != WRITING/SPEAKING PERFORMANCE ASSESSMENT`**: Objective selected-response items require distinct psychometric and scoring architectures from constructed subjective performances.
10. **`AI FEEDBACK != CALIBRATED SCORING`**: Qualitative AI critique cannot be treated as an authoritative, calibrated IELTS band score without empirical human-model agreement benchmarks.
11. **`GENERATED EXERCISE != VALID EXERCISE`**: An item that looks like an IELTS task may contain subtle leakage, unnatural collocations, or multiple defensible keys.
12. **`USER PREFERENCE != PERFORMANCE EVIDENCE`**: Learner self-reports (e.g. "I already know this word") do not constitute objective evidence of linguistic mastery.
13. **`MATERIAL OSS CANDIDATE != ADOPTION DECISION`**: Discovering a functional open-source library does not grant authority to install or depend on it in production.
14. **`ENGAGEMENT != LEARNING`**: High daily active time, long streaks, or completed exercise counters do not prove linguistic growth.
15. **`ACTIVITY COMPLETION != LEARNING GAIN`**: Finishing a module does not indicate that underlying constructs were retained or transferred.

---

## 5. Cluster A — Exercise + Assessment System

Research must investigate exercise and assessment design across **four granular task tiers**:
- **Micro-Exercise**: Focused 5–30 second drills targeting an isolated atomic construct (e.g. single phoneme discrimination, collocation cloze, irregular verb form).
- **Partial / Meso-Exercise**: Multi-step scaffolded activities targeting a composite sub-skill (e.g. paragraph topic sentence matching, 2-minute speech monologue with signposting).
- **Full Task**: Complete official-style task execution (e.g. IELTS Writing Task 2 essay, Listening Section 3 conversation with 10 questions).
- **Full Mock / Test**: End-to-end timed simulation under strict exam constraints with holistic scoring.

> [!WARNING]
> Full-test repetition is **NOT** sufficient instruction. Endless mock testing without targeted micro/meso skill drills leads to plateaus and cognitive fatigue.

---

## 6. Cluster B — Instruction + Skill Acquisition System

```
CONCEPTUAL INSTRUCTION & ACQUISITION CYCLE
┌────────────────────────────────────────────────────────────────────────┐
│  1. DIAGNOSE        ── Identify exact skill gap or misconception       │
│  2. TEACH           ── Explicit instruction & conceptual modeling      │
│  3. WORKED EXAMPLE  ── Expert problem-solving demonstration            │
│  4. GUIDED PRACTICE ── Step-by-step supported attempt with hints       │
│  5. FADED GUIDANCE  ── Progressive removal of scaffolding              │
│  6. INDEPENDENT     ── Unaided problem solving                         │
│  7. FEEDBACK        ── Immediate targeted corrective information       │
│  8. REMEDIATION     ── Misconception-targeted counter-examples         │
│  9. CLEAN RETEST    ── Unassisted verification on isomorphic item      │
│ 10. DELAYED RETEST  ── Spaced verification after interval              │
│ 11. TRANSFER        ── Application in novel communicative context      │
└────────────────────────────────────────────────────────────────────────┘
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
Research must classify feedback types by instructional impact:
- **Verification Feedback**: Binary correct/incorrect indication.
- **Corrective Feedback**: Supplying the correct answer.
- **Explanatory Feedback**: Explaining why the key is correct and why chosen distractors fail.
- **Metalinguistic Feedback**: Providing grammatical or lexical terminology to prompt self-correction.
- **Evidence Highlighting**: Pointing directly to supporting text spans without revealing the final answer.
- **Contrastive Examples**: Showing side-by-side minimal pairs or common non-standard usage.
- **Socratic Hints**: Progressive multi-tier hints leading the learner to self-repair.

### 6.3 Misconception-Specific Remediation Loop
```
ATTEMPT HISTORY → ERROR PATTERN → MISCONCEPTION HYPOTHESIS → TARGETED TEACHING → GUIDED PRACTICE → CLEAN RETEST → (RESOLVED | PERSISTENT)
```

---

## 7. Cluster C — Learner Model + Adaptation System

### 7.1 Multidimensional Learner State
The learner model must maintain clean separation across distinct psychometric and cognitive dimensions:

```
MULTIDIMENSIONAL LEARNER STATE MODEL
├── Declarative Knowledge Dimension
│   ├── Lexical Breadth & Depth (Sense, Spelling, Collocation, Register)
│   ├── Syntactic Rule Mastery
│   └── IELTS Task Taxonomy Familiarity
├── Procedural Skill Dimension
│   ├── Acoustic Decoding Speed (ms)
│   ├── Reading Text Processing Rate (wpm)
│   ├── Spoken Lexical Retrieval Latency
│   └── Grammatical Error Self-Correction Rate
├── Real-Time Performance Dimension
│   ├── Receptive Accuracy (Listening / Reading under timed conditions)
│   └── Productive Quality (Writing / Speaking rubric band estimates)
├── Temporal Dynamics Dimension
│   ├── FSRS Memory Retrievability ($R(t)$) & Stability ($S$)
│   ├── Bayesian Knowledge Tracing Latent Skill Mastery ($P(L_t)$)
│   └── Spacing Horizons & Due Intervals
└── Diagnostic Error & Misconception Memory
    ├── Historical Error Repository & Frequency Distributions
    ├── Chronic Misconception Clusters & L1 Transfer Traps
    └── Confusion Pairs (Phonetic, Lexical, Syntactic)
```

### 7.2 Adaptive Next-Task Selection Framework
Research must explore multi-factor decision inputs for session item sequencing:
- **Inputs**: Memory retention due dates, prerequisite skill gaps, active misconception flags, learner target band (e.g. IELTS 7.5), observed skill weaknesses (`weakness-profile.js`), recent task history, item difficulty ($b$), learner ability estimate ($\theta$), session time constraints, and learner mode preferences.
- **Candidate Outputs**:
  - `DUE_REVIEW`: Spaced repetition retrieval.
  - `NEW_INSTRUCTION`: Explicit teaching of unmastered concepts.
  - `TARGETED_REMEDIATION`: Error-focused corrective drill.
  - `GUIDED_PRACTICE`: Scaffolded task execution.
  - `INDEPENDENT_PRACTICE`: Unaided activity.
  - `TRANSFER_EXERCISE`: Novel context application.
  - `FULL_TASK`: Standard timed section.
  - `DIAGNOSTIC_MOCK`: Formal evaluation.

### 7.3 Psychometrics & Calibration
- Item Response Theory (IRT 1PL/2PL/3PL) item difficulty parameterization.
- Computerized Adaptive Testing (CAT) stopping rules and Fisher Information maximization.
- Standardized benchmarking via knowledge tracing suites (`pyKT`, `pyBKT`).
- Explicit distinction between **empirically calibrated difficulty** (derived from large-scale attempt logs) and **heuristically estimated difficulty** (derived from readability formulas or LLM ratings).

---

## 8. Cluster D — Curriculum + End-to-End Experience

### 8.1 Initial Diagnostic & Placement
Research must evaluate optimal placement strategies:
- Minimum viable diagnostic test duration vs measurement precision.
- Modular skill routing (e.g. testing vocabulary and listening before advanced writing).
- Identifying cold-start ability priors without inducing test anxiety.

### 8.2 Curriculum & Prerequisite Graph Topologies
Skills and knowledge units must be structured through typed relational edges:
- `PREREQUISITE`: Skill A must be established before Skill B can be instructed.
- `SUPPORTING_SKILL`: Skill A enhances the acquisition of Skill B.
- `RELATED`: Semantic or thematic connection without strict ordering.
- `TRANSFER_TARGET`: Application domain for acquired skill.
- `REMEDIATION_DEPENDENCY`: Foundational construct to revisit upon specific error triggers.

### 8.3 Session Orchestration & Cognitive Load
Research must determine optimal session construction:
- Interleaving vs blocking of disparate language skills.
- Balancing review load (FSRS due items) with new concept acquisition (recommended ratio research).
- Preventing session fatigue via dynamic length adjustment and cognitive load monitoring.

### 8.4 Learning Mode vs Test Mode Invariants
- **Learning Mode**: Allows hints, dictionary lookup, transcript viewing, immediate feedback, and retries. Evidence tagged as `SCAFFOLDED`.
- **Test Mode**: Enforces strict countdown timers, disables assistance tools, delays feedback until submission, and records high-integrity `UNASSISTED` evidence.

### 8.5 Content Ingestion & Lifecycle Management
```
DISCOVER / IMPORT → PROCESS / NORMALIZE → LEARN / DRILL → PERSIST → REVIEW → RE-ENCOUNTER → EXPAND → TRANSFER
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
- Forgiving streak semantics and backlog catch-up algorithms to prevent abandonment after missed study days.

---

## 9. Cluster E — Cross-Cutting Requirements

### 9.1 Content Provenance, Copyright & Legal Compliance
- Strict tracking of source licenses: official Cambridge/IELTS practice materials (proprietary), open datasets (CC BY), public domain literature, user-imported files, and AI-synthesized texts.
- Zero verbatim leakage of copyright-restricted exam items into unauthenticated persistence layers.

### 9.2 Accessibility & Universal Design
- Full keyboard navigation and screen-reader compatibility (ARIA roles).
- Synchronized closed captions and transcripts for all audio content.
- Dyslexia-friendly typography options and color-independent status indicators.

### 9.3 Algorithmic Fairness & Bias Mitigation
- ASR fairness across diverse non-native accents (e.g. Vietnamese, Chinese, Spanish, Arabic ESL speakers).
- Pronunciation evaluation scoring calibration avoiding demographic or pitch bias.

### 9.4 Reliability, Fault Tolerance & Error Recovery
- Graceful offline operation with local IndexedDB queuing during network drops.
- Resilient recovery from third-party API rate limits, timeouts, or model deprecations.
- User dispute workflows allowing learners to challenge and report ambiguous generated items.

### 9.5 Universal Evidence Provenance Schema (Research Requirement)
Every recorded learning attempt should ideally carry:
```text
{
  attemptId: string,
  targetConstruct: string,
  contentRef: string,
  mode: "LEARNING_SCAFFOLDED" | "TEST_UNASSISTED",
  assistanceUsed: { hints: number, transcriptExposed: boolean, dictionaryLookups: number },
  retries: number,
  responseLatencyMs: number,
  rawResponse: any,
  scoringMethod: "DETERMINISTIC_EXACT" | "REGEX_VALIDATED" | "HEURISTIC" | "HOSTED_LLM",
  evaluatorIdentity: string,
  calibratedScore: number,
  confidenceInterval: [number, number],
  timestamp: string
}
```

---

## 10. Cluster F — OSS / Existing-Capability Discovery Requirement

> [!IMPORTANT]
> **MANDATORY SURVEY RULE**:
> For **EVERY** major learning capability identified across Clusters A through G, downstream authorized research MUST survey existing solutions before recommending custom in-house implementation.

### 10.1 Solution Classes to Survey
1. **Browser-Native Web APIs**: Web Audio API, Web Speech API, DOM APIs, Canvas/SVG, Web Workers, IndexedDB, WASM.
2. **Lightweight Browser OSS Packages**: Zero-dependency or minimal-bundle JS/TS npm packages.
3. **Rust/WASM Compiled Libraries**: High-performance client-side engines compiled to WebAssembly.
4. **OSS Reference Implementations**: Standalone algorithms or academic prototypes (e.g. NLTK, spaCy, pyBKT, catsim).
5. **Primary Research Implementations**: ACL / IEEE / arXiv open-source research code (e.g. ERRANT, D-GEN, HyperSeg).
6. **Open Pedagogical Datasets**: CEFR-J, WordNet, SUBTLEX, IELTS public rubrics.
7. **Evaluation Suites & Benchmarks**: pyKT, ERRANT, D-GEN, GLUE/SuperGLUE.
8. **Eligible Recurring-Free Hosted APIs**: Cloud APIs satisfying zero-card and generous free-tier constraints.
9. **Self-Hostable Containerized OSS**: Community tools deployable on free serverless/container infrastructure.
10. **Existing VocabMaster Substrate**: Verified code in `src/**` (`EvidencePolicy`, `caption-normalizer.js`, `ts-fsrs`).

### 10.2 Capability Comparison Schema
Research must evaluate options using the standardized matrix:
```text
[CAPABILITY_NAME]
├── Product Need & Educational Target
├── VocabMaster Substrate Overlap Check
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
- Visual Recognition $\neq$ Auditory Recognition $\neq$ Spelling $\neq$ Definition Recall $\neq$ Collocation Knowledge $\neq$ Productive Writing $\neq$ Productive Speaking $\neq$ Transfer.

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
4. **Pronunciation (PR)**: Intelligibility, phonemic accuracy, word/sentence stress, rhythm, and intonational phrasing.

---

## 16. Conceptual End-to-End Learning Journey

```
END-TO-END LEARNER JOURNEY TOPOLOGY
┌────────────────────────────────────────────────────────────────────────┐
│                          USER GOAL DEFINITION                          │
│               (Target IELTS Band, Exam Date, Daily Time)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        INITIAL DIAGNOSTIC SUITE                        │
│        (Vocabulary Band, Acoustic Decoding, Reading Speed, Writing)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     MULTIDIMENSIONAL LEARNER MODEL                     │
│          (FSRS Memory, BKT Latent Mastery, IRT Skill Estimates)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DYNAMIC CURRICULUM & PREREQUISITES                   │
│          (Skill Ordering Graph, Milestone Hierarchy, Target Gaps)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      DAILY SESSION ORCHESTRATOR                        │
│     (Interleaved Review, New Concepts, Weak-Skill Focus, Timed Drill)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        INSTRUCTIONAL DELIVERY                          │
│         (Explicit Teaching, Worked Examples, Scaffolded Models)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         PRACTICE & ASSESSMENT                          │
│         (Faded Guidance Drills → Unaided Practice → Timed Tasks)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DIAGNOSTIC FEEDBACK & REMEDIATION                    │
│      (Error Classification, Misconception Drills, Clean Retest)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SPACED RETENTION & NOVEL TRANSFER                    │
│      (FSRS Review Scheduling, Real-World Content Ingestion Tasks)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 READINESS PROJECTION & MOCK SIMULATION                 │
│              (Calibrated Band Prediction, Full Mock Exam)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    └───► [UPDATE LEARNER MODEL & REPEAT]
```

---

## 17. Cluster G — Learning System Effectiveness + Quality Evaluation

```
LEARNING SYSTEM EFFECTIVENESS & QUALITY EVALUATION TOPOLOGY
┌────────────────────────────────────────────────────────────────────────┐
│                     1. LEARNING OUTCOME EVALUATION                     │
│     (Immediate vs Delayed Gains, Receptive vs Productive Dimensions)   │
├───────────────────────────────────┬────────────────────────────────────┤
│       2. DELAYED RETENTION        │       3. NOVEL TRANSFER            │
│   (Clean Retrieval after Decay)   │  (Unseen Context Generalization)   │
├───────────────────────────────────┴────────────────────────────────────┤
│                    4. IELTS FOUR-SKILL IMPROVEMENT                     │
│    (Micro-Skill Calibration vs Holistic Official Mock Improvement)     │
├───────────────────────────────────┬────────────────────────────────────┤
│     5. TEACHING EFFECTIVENESS     │    6. REMEDIATION EFFECTIVENESS    │
│  (Instructional Gain vs Baseline) │  (Misconception Resolution Rates)  │
├───────────────────────────────────┼────────────────────────────────────┤
│     7. GENERATED-ITEM QUALITY     │    8. SCORING & RUBRIC QUALITY     │
│   (Bad-Item / Distractor Rates)   │   (Calibration & Error Margins)    │
├───────────────────────────────────┼────────────────────────────────────┤
│       9. DIAGNOSTIC QUALITY       │   10. LEARNER-MODEL CALIBRATION    │
│   (Sensitivity / Specificity)     │     (Brier Scores / Overfit)       │
├───────────────────────────────────┼────────────────────────────────────┤
│   11. ADAPTIVE POLICY EFFECT      │      12. LEARNING EFFICIENCY       │
│  (Dynamic Policy vs Static Base)  │    (Gain-per-Minute / Burden)      │
├───────────────────────────────────┴────────────────────────────────────┤
│                    13. SKILL DECAY & REGRESSION AUDIT                  │
│       (Distinguishing Real Regression from Temporary Variance)         │
├───────────────────────────────────┬────────────────────────────────────┤
│     14. EVALUATION METHODOLOGY    │    15. PROVENANCE INTEGRITY        │
│   (Pre/Post, Control Baselines)   │  (Auditable Multi-Factor Context)  │
├───────────────────────────────────┴────────────────────────────────────┤
│               16. LEARNING QUALITY DASHBOARD & FAIRNESS                │
│    (Defensible Product-Level Evidence vs Prohibited Vanity Metrics)    │
└────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Central Research Question for Cluster G**:
> *"How can VocabMaster determine, with defensible empirical evidence, whether its instruction, exercises, feedback, adaptive decisions, and overall learning system actually cause or support meaningful, durable, and transferable learner improvement?"*

### 17.1 G1 — Learning Outcome Evaluation
Research must investigate methods to measure:
- Immediate learning gain vs delayed retrieval.
- Receptive skill improvement (Listening/Reading) vs productive skill improvement (Writing/Speaking).
- Lexical depth (collocations, syntax, register) vs lexical breadth (raw headword counts).
- Granular sub-skill gains (e.g. connected speech parsing) vs full-task performance (e.g. IELTS Listening section).
- *Strict Principle*: Practice success under massed drilling must **NEVER** be silently equated with durable learning.

### 17.2 G2 — Delayed Retention Research
Research must establish protocols to evaluate whether learned knowledge persists over time:
- Designing delayed retest probes at calibrated forgetting horizons (e.g. 1d, 7d, 30d).
- Isolating delayed retrieval from repeated-exposure contamination.
- Comparing retention under scaffolded vs unaided clean retrieval conditions.
- Differentiating item-specific memory from abstract construct-level retention.

### 17.3 G3 — Transfer & Generalization Evaluation
Research must distinguish between:
- **Near Transfer**: Applying learned patterns to isomorphic sentences with identical syntactic frames.
- **Far / Novel-Context Transfer**: Applying vocabulary, grammar, or discourse structures in unpracticed topics, novel audio passages, unseen accents, or spontaneous speaking/writing tasks.
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
- Identifying conditions where excess explanation creates cognitive overload or reduces independent retrieval effort.
- *Strict Rule*: More explanation $\neq$ better learning.

### 17.6 G6 — Feedback & Remediation Effectiveness
Research candidate quality metrics:
- `ERROR_RECURRENCE_RATE`: Frequency with which a corrected error reappears in subsequent tasks.
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
- `FALSE_MASTERY`: Prematurely classifying a construct as mastered after scaffolded success.
- `MISDIAGNOSIS`: Misattributing an error (e.g. treating an acoustic decoding failure as a vocabulary deficiency).
- `MISCLASSIFIED_MISCONCEPTION`: Mapping an error to the wrong pedagogical root cause.
- `WRONG_PREREQUISITE_DIAGNOSIS`: Recommending remedial work on unrelated foundation topics.
- `INSUFFICIENT_EVIDENCE`: Making diagnostic claims before establishing minimum statistical sample thresholds.
- *Strict Invariant*: $\text{NO EVIDENCE} \neq \text{EVIDENCE OF WEAKNESS}$ and $\text{ONE SUCCESS} \neq \text{MASTERY}$.

### 17.10 G10 — Learner-Model Calibration
Research empirical validation of learner-state estimates:
- Does predicted FSRS retrievability ($R$) match observed delayed retrieval rates?
- Does BKT latent mastery ($P(L)$) correlate with unassisted success on clean retests?
- Evaluating model calibration via Brier scores, reliability diagrams, and held-out future attempt prediction error.

### 17.11 G11 — Adaptive Policy Effectiveness
Research whether dynamic next-task selection produces superior learning outcomes compared to standard baselines:
- Benchmarking adaptive policies against: (1) static linear curriculum, (2) simple due-review queue, (3) random/interleaved baseline, (4) static skill-priority heuristic, and (5) purely learner-selected study.
- Evaluating outcomes on: learning gain per hour, retention stability, transfer breadth, learner cognitive burden, and avoidance of pathological feedback loops.

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
- **Prohibited as Standalone Learning Evidence**: Streak length, session count, raw items completed, daily active minutes. (These measure engagement/usage, NOT learning).

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
> Downstream authorized research MUST survey existing evaluation frameworks, psychometric toolkits, and academic benchmark datasets before designing custom evaluation tooling.

### 18.1 Target Tooling Classes to Survey
- **Psychometrics & IRT Engines**: Open-source IRT packages, Computerized Adaptive Testing simulators (e.g. `catsim`).
- **Knowledge Tracing Benchmark Harnesses**: Standardized KT evaluation frameworks (e.g. `pyKT`, `pyBKT`).
- **Statistical Calibration & Agreement Tooling**: Brier score calculators, Quadratic Weighted Kappa libraries, inter-rater reliability packages.
- **Grammar & GEC Evaluation Toolkits**: Automated annotation and evaluation taxonomies (e.g. `ERRANT`).
- **Distractor Evaluation Suites**: Benchmark frameworks for ranking and evaluating question distractors (e.g. `D-GEN`, `DisGeM`).
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
| **Vocabulary** | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH |
| **Collocation** | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH |
| **Grammar** | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH |
| **Pronunciation**| OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH |
| **Listening** | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH |
| **Reading** | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH |
| **Writing** | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH |
| **Speaking** | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH |
| **IELTS Task** | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH | OPEN_RESEARCH |

---

## 20. IELTS Four-Skill Capability & Effectiveness Matrix

| Capability Dimension | Listening System | Reading System | Writing System | Speaking System |
|---|---|---|---|---|
| **Content Analysis** | ASR, phoneme alignment, acoustic features | Readability, CEFR band, syntactic complexity | Prompt decomposition, task type classification | Topic taxonomy, cue card prompts, question banks |
| **Micro-Skills** | Connected speech, weak forms, numbers, signposts | Skimming, scanning, T/F/NG inference, headings | Topic sentences, thesis statements, cohesive links| Fluency chunks, stress/intonation, self-repair |
| **Instruction** | Bottom-up decoding drills, audio shadowing | Evidence location strategies, structure parsing | Structural templates, model essays, sentence combining| Monologue ideation, discourse marker drills |
| **Item Generation** | Multi-choice, form/table cloze, diagram labels | T/F/NG, matching headings, summary completion | Task 1 chart synthesis, Task 2 discursive prompts| Part 1 interviews, Part 2 cue cards, Part 3 prompts |
| **Item Validation** | Audio timestamp grounding, distractor checks | Exact passage support verification, non-ambiguity| Prompt clarity, standard IELTS task conformity | Question neutrality, cognitive appropriateness |
| **Feedback** | Audio replay snippet, script evidence highlight | Text passage highlight, rationale explanation | 4-rubric band breakdown, targeted error markup | Pronunciation phoneme critique, fluency feedback |
| **Assessment** | Objective 40-item raw score $\to$ band mapping | Objective 40-item raw score $\to$ band mapping | Subjective multi-dimensional band calibration | Subjective multi-dimensional band calibration |
| **Scoring Calibration**| Deterministic answer key matching | Deterministic answer key matching | Multi-model agreement, rubric anchor benchmarks| ASR phonetic scoring, human-calibrated audio |
| **Adaptive Practice** | Dynamic difficulty scaling, rate adjustment | Passage length/lexical difficulty pacing | Stepwise essay construction, targeted criteria | Scaffolded conversational turns, timed drills |
| **Full-Task Practice** | Complete 30-min section simulation | Complete 60-min 3-passage simulation | Full Task 1 (20m) & Task 2 (40m) compositions | Full 3-part 11–14 min interview simulation |
| **Test Mode** | Countdown timer, zero replays, delayed results | Strict 60-min timer, unassisted interface | Timed editor without grammar linter assistance | Continuous audio recording with zero restarts |
| **Readiness Projection**| IRT ability estimate $\theta_L$ with confidence bounds| IRT ability estimate $\theta_R$ with confidence bounds| Historical rubric regression & band confidence | Acoustic fluency & rubric prediction intervals |
| **Effectiveness Evaluation**| Delayed acoustic retest, novel speaker transfer | Unseen passage comprehension, speed stability | Unprompted transfer in fresh essays, rubric growth | Unscripted fluency gains, phoneme error decay |
| **Quality Audit Metrics**| Grounding errors, ASR hallucination rate | Ambiguous T/F/NG rate, key dispute volume | Score overconfidence, rater disagreement rate | Pronunciation scoring bias, latency dropouts |
| **OSS Research Scope** | WhisperX, Silero VAD, Web Audio API | Mozilla Readability, EdgeParse, PDF.js | Harper WASM, ERRANT, LanguageTool self-host | Wav2Vec2 phoneme alignment, Web Audio VAD |

---

## 21. Research Questions & Empirical Evidence Needs Register

| # | Core Research Question | Why It Matters | Evidence Needed | Existing Stage 3 Inputs | OSS / External Survey Needed | Later Routing Owner |
|---|---|---|---|---|---|---|
| **RQ-01** | How can delayed retention be verified without repeated-test contamination? | Distinguishes short-term practice success from durable memory. | Empirical retention decay curves across 1d, 7d, 30d retests. | R1 memory findings (`R1-F001`, `R1-F002`). | Spaced retrieval algorithms, FSRS JS, pyBKT. | `R3_CANDIDATE` / `R4_RECONCILIATION` |
| **RQ-02** | What protocols reliably measure novel-context transfer? | Prevents mistaking item memorization for genuine skill acquisition. | Pre/post performance data on unpracticed lexical contexts. | R1 transfer synthesis (`R1-F013`, `R1-F045`). | Transfer evaluation frameworks, NLP embeddings. | `R4_RECONCILIATION` / `OWNER_DECISION` |
| **RQ-03** | How do sub-skill gains translate to overall IELTS band improvements? | Calibrates micro-exercise value against official exam benchmarks. | Correlation studies between micro-skill scores and mock test bands. | Stage 2 IELTS taxonomy (`STAGE2_COMPLETENESS`). | Official public IELTS band descriptors. | `R4_RECONCILIATION` / `STAGE5_BENCHMARK` |
| **RQ-04** | Which instructional intervention types maximize learning efficiency? | Avoids unnecessary explanation and cognitive overload. | Comparative gain-per-minute data across instruction formats. | R1 cognitive load principles (`R1-F005`). | Interactive tutoring frameworks, Socratic scaffolding. | `R3_CANDIDATE` / `R4_RECONCILIATION` |
| **RQ-05** | How can remediation effectiveness and misconception resolution be verified? | Ensures student errors are remediated rather than endlessly repeated. | Tracking error recurrence rates on clean post-remediation retests. | R1 formative assessment findings (`R1-F034`). | ERRANT error taxonomies, mistake decay models. | `R3_CANDIDATE` / `R4_RECONCILIATION` |
| **RQ-06** | What automated filters minimize generated-item defects? | Protects learners from learning incorrect or ambiguous language. | Defect sampling audits across prompt architectures. | R2 item generation candidates (`OSS-038`–`OSS-040`). | D-GEN distractor ranking, rule-based NLP filters. | `STAGE5_BENCHMARK` / `R3_CANDIDATE` |
| **RQ-07** | What is the empirical error margin of automated Writing/Speaking scoring? | Prevents misleading learners with false band score confidence. | Human-model agreement benchmarks (Quadratic Weighted Kappa). | R2 NLP candidates, R1 rubric findings (`R1-F024`). | Automated essay scoring engines, phonetic aligners. | `STAGE5_BENCHMARK` / `OWNER_DECISION` |
| **RQ-08** | What statistical thresholds prevent diagnostic misclassification? | Prevents premature mastery claims or false weakness flags. | Sensitivity/specificity curves on synthetic and real attempt logs. | Phase 6 Weakness profile substrate (`P6-01`–`P6-05`). | IRT calibration tools, catsim, pyBKT. | `R3_CANDIDATE` / `R4_RECONCILIATION` |
| **RQ-09** | How can false mastery from scaffolded assistance be systematically detected? | Ensures only unassisted performance generates high-confidence mastery. | Comparative analysis of scaffolded vs unaided attempt evidence. | Canonical `EvidencePolicy` invariants. | Bayesian Knowledge Tracing slipped/guessed models. | `R3_CANDIDATE` / `R4_RECONCILIATION` |
| **RQ-10** | How well calibrated are FSRS retrievability and BKT mastery estimates? | Validates whether internal model parameters reflect real student memory. | Brier scores and calibration curves on longitudinal attempt logs. | R1 FSRS parameterization analysis (`R1-F003`). | pyKT knowledge tracing benchmark harness. | `R3_CANDIDATE` / `STAGE5_BENCHMARK` |
| **RQ-11** | Does adaptive item sequencing outperform static or random baselines? | Proves the educational utility of complex adaptation algorithms. | Randomized A/B gain comparisons against linear curriculum. | R1 adaptive learning heterogeneity findings (`R1-F034`). | Multi-armed bandit schedulers, IRT CAT engines. | `R4_RECONCILIATION` / `OWNER_DECISION` |
| **RQ-12** | How can learning efficiency be maximized without sacrificing retention? | Prevents student burnout and optimizes study time. | Metrics tracking knowledge gains per active study minute. | R1 micro-learning session design principles. | Time-to-mastery telemetry models. | `R4_RECONCILIATION` / `OWNER_DECISION` |
| **RQ-13** | How should the system distinguish temporary noise from skill regression? | Prevents premature panic or unwarranted remedial disruption. | Longitudinal variance models of student response latency and errors. | R1 spacing and retention decay models. | Statistical process control algorithms. | `R3_CANDIDATE` / `R4_RECONCILIATION` |
| **RQ-14** | What evaluation design provides valid evidence of product effectiveness? | Establishes scientifically defensible proof of VocabMaster efficacy. | Pre/post delayed randomized evaluation protocols. | R1 research methodology guidelines. | Educational evaluation frameworks, A/B test rigs. | `R4_RECONCILIATION` / `OWNER_DECISION` |
| **RQ-15** | How can learning effectiveness and scoring fairness be assured across accents? | Prevents demographic or regional bias in AI pronunciation scoring. | Error distribution analysis across accented speech benchmarks. | R1 pronunciation findings (`R1-F029`). | Multi-accent speech corpora, Wav2Vec2/WhisperX. | `STAGE5_BENCHMARK` / `AUTHORITY_REVIEW_NEEDED` |

---

## 22. Cluster H — End-to-End Coverage & Unknown-Unknowns Audit

A comprehensive review across **10 representative learner personas** against **16 core product lifecycle and effectiveness dimensions**:

| Learner Persona | 1. Diagnose | 2. Teach | 3. Practice | 4. Assess | 5. Explain | 6. Remediate | 7. Retain | 8. Transfer | 9. Select Action | 10. Recover Failure | 11. Measure Gain | 12. Delayed Retention | 13. Transfer Audit | 14. False Mastery Check | 15. Bad Item Detect | 16. Remediation Verify |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1. Brand-New Beginner (A2/B1)** | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |
| **2. Vocabulary-Focused Learner** | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |
| **3. Listening-Weak IELTS Candidate**| OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |
| **4. Reading-Weak IELTS Candidate** | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |
| **5. Writing-Weak IELTS Candidate** | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |
| **6. Speaking-Weak IELTS Candidate**| OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |
| **7. Learner Returning After 30d** | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |
| **8. Chronic Misconception Learner**| OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |
| **9. Advanced Mocks Candidate (C1)**| OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |
| **10. Real-World Media Importer** | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN | OPEN |

*Audit Finding*: Every persona-dimension intersection requires explicit downstream research specification. No lifecycle capability may be presumed solved by surface UI components.

---

## 23. Open Research Requirements Register

- `REQ-EXP-001`: Formulate explicit instruction and worked-example generation pipelines for IELTS writing and speaking sub-skills.
- `REQ-EXP-002`: Define mathematical unification between FSRS retrievability ($R$), BKT skill mastery ($P(L)$), and IRT item difficulty ($b$).
- `REQ-EXP-003`: Survey open-source NLP and WASM engines for client-side grammatical error classification and diagnostic taxonomies.
- `REQ-EXP-004`: Establish standardized prompt templates and validation contracts for difficulty-conditioned distractor synthesis.
- `REQ-EXP-005`: Define multi-format content ingestion schemas preserving layout structure (tables, columns, reading orders).
- `REQ-EXP-006`: Design non-punitive streak recovery and daily backlog management algorithms.
- `REQ-EXP-007`: Establish standardized evaluation designs for measuring delayed retention without test-retest contamination.
- `REQ-EXP-008`: Define automated defect-detection and calibration metrics for generated IELTS exercise items.
- `REQ-EXP-009`: Survey open-source psychometric and knowledge tracing benchmark suites (`pyKT`, `catsim`, `pyBKT`).
- `REQ-EXP-010`: Design multi-factor evidence provenance schemas linking attempt context to downstream effectiveness analysis.

---

## 24. R1 / R2 / R3 / R4 Research Reconciliation Questions

- **R1 vs R2 Reconciliation**: Do the open-source libraries identified in Lane R2 support the desirable difficulties, spaced retrieval, and delayed testing paradigms mandated by Lane R1?
- **R2 vs R3 Reconciliation**: Can client-side WASM engines (e.g. Harper, EdgeParse, Orama) operate within the memory, Web Worker, and IndexedDB storage constraints defined in Lane R3?
- **R3 vs Effectiveness Evaluation**: How does the offline-first, local-persistence model record and synchronize longitudinal evaluation data without compromising user privacy or overloading storage?
- **R4 Synthesis Mandate**: How should the Owner Decision Ledger prioritize client-side determinism vs hosted API intelligence across each of the 4 IELTS skills and evaluation dimensions?

---

## 25. Authority Review Needed

Where newly identified research requirements exceed the bounded scope of existing authorization manifests (`STAGE3-RESEARCH-AUTH-001`), an explicit governance escalation is required:
- Any proposed expansion of Lane R3 or Lane R4 scope must be ratified via an addendum or fresh authorization manifest before research execution.
- Unresearched material requirements must be tracked as open items in the Owner Decision Ledger rather than fabricated during synthesis.

---

## 26. Explicit Non-Decisions

This document **EXPLICITLY DOES NOT DECIDE OR AUTHORIZE**:
- Final production exercise taxonomies.
- Final curriculum schedules or prerequisite lists.
- Final learner model database schemas.
- Final mathematical mastery formulas.
- Final adaptive item-routing algorithms.
- Final scoring calibration models or band prediction heuristics.
- Final learning-effectiveness metrics or experimental designs.
- Final A/B testing frameworks or statistical models.
- Final acceptable thresholds for bad-item rates or scoring calibration errors.
- Selection of specific AI tutors, LLM models, or prompt templates.
- Adoption or installation of any npm packages or third-party dependencies.
- Final hosted API or cloud provider agreements.
- Final software architecture blueprints or TypeScript interfaces.
- Modification of any production code (`src/**`) or test suites (`tests/**`).

---

## 27. Recommended Next Governance Step

1. Commit and push this updated document (`docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`) on existing branch `research/stage3-learning-experience-requirements`.
2. Confirm that Draft PR #153 updates automatically to the new commit HEAD.
3. Return execution flow to the primary Stage 3 roadmap sequence (specifically completing the independent quality audit of Lane R2 candidate `R2_RESEARCH_CANDIDATE_REM-004.md`).
4. Consume these persisted requirements during subsequent authorized Stage 3 research waves (Lane R3 and Lane R4).
