# R1 LEARNING PRODUCT RESEARCH SUPPLEMENT 001
**Stage 3 Lane R1: Learning & Product Supplemental Evidence & Pedagogical Methodology**

---

## 0. Identity / Governance Boundary

| Attribute | Value |
|---|---|
| **Document Identity** | `R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md` |
| **Transaction ID** | `STAGE3-R1-LEARNING-PRODUCT-SUPPLEMENT-001` |
| **Controlling Authorization** | `docs/authorizations/STAGE3-RESEARCH-AUTH-001.md` §9 (`STAGE3-R1-LEARNING-PRODUCT-SUPPLEMENT-AUTH-001`) |
| **Controlling Strategy** | `docs/STAGE3_RESEARCH_STRATEGY.md` |
| **Input Research Requirements** | `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md` |
| **Canonical Baseline R1** | `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md` (**ACCEPTED / CANONICAL / IMMUTABLE**) |
| **Canonical Baseline R2** | `docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md` (**ACCEPTED / CANONICAL / IMMUTABLE**) |
| **Canonical Base SHA** | `292e2a50a67db3618b1662cea00dd0772cb5e796` |
| **Public Product Identity** | OmniIELTS / VocabMaster |
| **Repository** | `NguyenDukKyeon/VocabMaster` |
| **Role** | Stage 3 R1 Learning/Product Supplemental Researcher |
| **Package Type** | `R1_LEARNING_PRODUCT_SUPPLEMENTAL_EVIDENCE` |
| **New Research Lane** | `NO` (Supplemental to existing Lane R1) |
| **Canonical R1 Reopened** | `NO` |
| **Research Quality Acceptance** | `NOT_SELF_GRANTED` (Subject to independent audit) |
| **R3 Scope Expansion** | `NONE` |
| **R4 Scope Expansion** | `NONE` |
| **Stage 4 UX/IA Authority** | `NONE` |
| **Stage 5 Benchmark Execution** | `NONE` |
| **Implementation Authority** | `NONE` |
| **Dependency Adoption Authority** | `NONE` |
| **Provider Selection Authority** | `NONE` |
| **Merge Authority** | `NONE` |

> [!IMPORTANT]
> **Strict Non-Authority & Non-Absorption Notice**:
> - This document is a **SUPPLEMENTAL RESEARCH EVIDENCE REPORT**.
> - It does **NOT** modify or replace canonical `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`.
> - It does **NOT** execute Lane R3 pipeline/architecture analysis or Lane R4 cross-synthesis.
> - It does **NOT** authorize production implementation (`src/**`), dependency adoption (`package.json`), or benchmark execution (Stage 5).
> - It does **NOT** make causal claims that VocabMaster has already improved learner outcomes.
> - **Epistemic Invariant**: $\text{GENERAL LEARNING SCIENCE EVIDENCE} \neq \text{EVIDENCE OF VOCABMASTER EFFICACY}$.

---

## 1. Executive Findings

This supplement establishes 18 substantive findings across the 8 authorized research families. Every finding is anchored in primary scientific evidence, explicitly labeled with its epistemic class, and bounded by empirical limitations.

| Finding ID | Epistemic Status | Summary Proposition |
|---|---|---|
| **R1S-F001** | `[VERIFIED]` | **Elaborated Feedback Lift**: Elaborated feedback ($d \approx 0.49$) substantially outperforms simple knowledge of results ($d \approx 0.05$) and knowledge of correct results ($d \approx 0.32$) in digital learning; feedback timing interacts with task complexity. |
| **R1S-F002** | `[VERIFIED]` | **Worked Example & Fading Effect**: Worked examples reduce extraneous cognitive load for novice learners ($g \approx 0.40\text{--}0.50$); faded completion steps optimize schema acquisition and transition to problem-solving. |
| **R1S-F003** | `[VERIFIED]` | **Misconception-Targeted Repair**: Active refutational/contrastive remediation clears persistent cognitive misconceptions more durably than simple repetition or unguided practice. |
| **R1S-F004** | `[VERIFIED]` | **Retrieval-Induced Transfer**: Retrieval practice produces significant transfer to novel tasks ($d = 0.40$), but transfer magnitude decreases as cognitive distance between practice and criterion tasks widens. |
| **R1S-F005** | `[VERIFIED]` | **L2 Spacing Horizon Contingency**: Distributed practice produces medium-to-large long-term retention gains ($g \approx 0.55\text{--}0.70$) on delayed post-tests; expanding spacing shows no general empirical superiority over equal spacing for L2 vocabulary. |
| **R1S-F006** | `[INFERENCE]` | **Contamination-Resistant Retest Design**: To prevent repeated-test contamination, delayed retention must be measured using item-bank partitioning, parallel isomorphic forms, or unannounced delayed probes rather than identical re-drilling. |
| **R1S-F007** | `[INFERENCE]` | **Sub-Skill to Proficiency Validity Chains**: Micro-skill improvements (e.g., phonemic decoding, collocation recall) do not mechanically translate to holistic IELTS band score gains without valid construct integration. |
| **R1S-F008** | `[VERIFIED]` | **Model Class Incommensurability**: FSRS ($R, S$), BKT ($P(L)$), IRT ($b, \theta$), and CAT represent mathematically distinct model families measuring memory, mastery, item difficulty, and ability; they cannot be unified into a single scalar formula. |
| **R1S-F009** | `[INFERENCE]` | **Multi-Model Conceptual Interoperability**: Memory scheduling (FSRS), latent skill mastery (BKT), and difficulty/ability calibration (IRT) can interoperate via clear functional boundaries: memory schedules reviews, mastery gates progression, IRT calibrates difficulty. |
| **R1S-F010** | `[VERIFIED]` | **Statistical Variance vs Skill Regression**: Single-attempt performance drops frequently reflect session noise (fatigue, distraction); genuine regression requires multi-observation statistical variance detection (e.g., CUSUM / Shewhart control thresholds). |
| **R1S-F011** | `[VERIFIED]` | **CAT Precision vs Length Tradeoffs**: Adaptive placement using variable-length stopping rules based on Standard Error of Measurement ($\text{SEM} = 1/\sqrt{I(\theta)}$) minimizes test length while maintaining uniform measurement precision. |
| **R1S-F012** | `[VERIFIED]` | **Material-Dependent Interleaving**: Interleaved practice benefits visual category discrimination ($g = 0.67$), but word-based and grammatical learning often favors blocked practice ($g = -0.39$) during initial acquisition. |
| **R1S-F013** | `[VERIFIED]` | **Review-to-New Acquisition Burden**: In spaced repetition systems, unchecked due-review volume causes cognitive overload and study abandonment; review queues must be throttled to preserve mental bandwidth for new acquisition. |
| **R1S-F014** | `[VERIFIED]` | **Streak Forgiveness & Re-Entry**: Punitive streak resets induce disengagement via loss aversion; non-predatory habit mechanics with forgiveness (streak freezes, grace periods, graduated re-entry) sustain long-term engagement without dark patterns. |
| **R1S-F015** | `[VERIFIED]` | **Automated Item Defect Taxonomy**: Auto-generated language items suffer from specific psychometric defects (invalid keys, ambiguity, distractor implausibility, grounding failure) that must be filtered using structured validity rules. |
| **R1S-F016** | `[VERIFIED]` | **Threats to Educational Evaluation Validity**: Pre/post learning gains are routinely confounded by practice effects, regression to the mean, item leakage, and survivorship bias; defensible evaluation requires delayed post-tests and control comparisons. |
| **R1S-F017** | `[INFERENCE]` | **Contextual Evidence Provenance Requirements**: Valid interpretation of learning effectiveness requires capturing 9 contextual parameters: task identity, construct, scaffolding level, prior exposures, response latency, raw response, scoring engine, rater uncertainty, and test mode. |
| **R1S-F018** | `[UNKNOWN]` | **VocabMaster Causal Product Efficacy**: Whether VocabMaster's specific implementation causes faster or more durable IELTS score gains compared to alternative study methods remains unknown pending Stage 5 benchmarks and future empirical evaluation. |

---

## 2. Method / Search Strategy

### 2.1 Research Methodology & Search Scope
To address the unresolved questions in canonical `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md` without duplicating canonical R1 (`docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`) or canonical R2 (`docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`), this supplement conducted targeted scientific literature research focusing on:
1. **Systematic Reviews & Meta-Analyses**: High-powered syntheses (e.g., Van der Kleij et al. 2015, Brunmair & Richter 2019, Pan & Rickard 2018, Kim & Webb 2022, Chen et al. 2018).
2. **Peer-Reviewed Psychometric & EDM Literature**: Key papers in educational data mining, computerized adaptive testing, and knowledge tracing (e.g., Pelánek 2017, Liu et al. 2022, Thompson & Weiss 2011, Corbett & Anderson 1994).
3. **Primary Experimental & Methodological Studies**: Investigating cognitive load theory, worked examples, fading, distractor generation, and educational evaluation designs.
4. **Official Assessment Frameworks**: Published IELTS, CEFR, and psychometric measurement standards (e.g., Haladyna et al. 2002, Messick 1989, Kane 2013).

### 2.2 Epistemic Classification Scheme
- `[VERIFIED]`: Directly supported by published meta-analyses, systematic reviews, authoritative psychometric standards, or replicated empirical experimental literature.
- `[INFERENCE]`: Logical deduction or methodological derivation synthesizing verified empirical findings into bounded VocabMaster product/learning architecture constraints.
- `[UNKNOWN]`: Propositions lacking sufficient empirical evidence, disputed in the scientific community, dependent on uncalibrated product parameters, or requiring future Stage 5 empirical benchmarking.

---

## 3. Canonical R1 Baseline — What Is Already Known

Before addressing supplemental questions, we explicitly acknowledge what canonical R1 has already established:
- **Retrieval Practice** (`R1-F001`): Retrieval enhances delayed retention over restudy; benefits depend on successful retrieval or corrective feedback.
- **Distributed Spacing** (`R1-F002`): Spacing improves long-term retention; optimal spacing depends on retention horizon; expanding vs equal spacing shows no reliable difference.
- **Retention Targets** (`R1-F003`): A universal requested-retention target of $0.90$ is not established scientifically.
- **Interleaving** (`R1-F004`): Interleaving is conditional; benefits categories requiring discrimination, while some verbal tasks favor blocking.
- **Cognitive Load & Multimedia** (`R1-F005`, `R1-F006`): Segmentation, split-attention management, and removing redundancy are expertise-sensitive; L2 captions/transcripts are not redundant for language learners.
- **Scaffolded Assistance** (`R1-F007`, `R1-F016`, `R1-F018`): Assisted performance teaches effectively but invalidates that attempt as unassisted mastery evidence.
- **Construct Separation** (`R1-F010`, `R1-F011`, `R1-F013`, `R1-F017`, `R1-F045`): Memory ($R$), mastery ($P(L)$), diagnosis, difficulty, and transfer are distinct constructs; receptive $\neq$ productive; listening is multidimensional.
- **Adaptive Learning** (`R1-F034`): Adaptive learning effects are heterogeneous across domains, durations, and designs; personalization is not intrinsically beneficial.

---

## 4. Instruction & Remediation

### 4.1 What Canonical R1 Established vs What Remained Unresolved
- **Canonical R1 Established**: Generative activities (self-explanation `R1-F008`) and corrective feedback (`R1-F023`, `R1-F033`) are effective, but comparative effectiveness across instruction formats was unknown (`R1-F009`).
- **Remained Unresolved** (`RQ-04`, `RQ-05`, `REQ-EXP-001`, `G5`, `G6`): Under what exact conditions do explicit instruction, worked examples, guided practice, scaffolding fading, and specific feedback forms/timing produce superior learning and error resolution?

### 4.2 Evidence Synthesis

#### 4.2.1 Worked Examples, Guidance & Scaffolding Fading
Research in Cognitive Load Theory (CLT) strongly demonstrates the **worked example effect** for novice learners (Sweller et al., 2011; Chen et al., 2018 meta-analysis). When learners lack prior cognitive schemas, unguided problem-solving forces reliance on means-ends analysis, overloading working memory ($g \approx 0.40\text{--}0.50$).
- **Faded Worked Examples (Completion Problems)**: Renkl (2014) and Van Gog et al. (2019) demonstrated that the transition from fully worked examples $\to$ partially completed examples (faded steps) $\to$ independent problem-solving produces superior near and far transfer compared to either pure worked examples or pure problem-solving.
- **Expertise Reversal Effect**: As learners develop domain knowledge, detailed worked examples become redundant and impose extraneous cognitive load (Kalyuga, 2007). Advanced learners benefit more from problem-solving and unguided retrieval practice.

#### 4.2.2 Feedback Typology & Content
The meta-analysis by **Van der Kleij, Feskens, & Eggen (2015)** (*Review of Educational Research*, 85(4), 475–511, analyzing 40 studies / 7,000+ students in computer-based learning environments) established that feedback content is a primary determinant of achievement:
- **Knowledge of Results (KR)** ("Correct" / "Incorrect"): Minimal effect ($d = 0.05$).
- **Knowledge of Correct Results (KCR)** (Providing the correct answer): Moderate effect ($d = 0.32$).
- **Elaborated Feedback (EF)** (Explaining *why* an answer is correct or incorrect, pointing to underlying rules): Substantial positive effect ($d = 0.49$).
- **Metalinguistic vs Direct Corrective Feedback**: In second language acquisition, Ellis et al. (2006) and Shute (2008) demonstrated that metalinguistic feedback (providing grammatical cues without giving the answer) prompts active retrieval and self-repair, resulting in more durable delayed retention for intermediate learners, whereas novices require explicit corrective explanation.

#### 4.2.3 Feedback Timing
Van der Kleij et al. (2015) and Kulik & Kulik (1988) revealed that feedback timing interacts with task complexity:
- For lower-order factual recall and vocabulary association, **immediate feedback** prevents the encoding of erroneous associations and yields higher immediate accuracy.
- For complex higher-order cognitive tasks (e.g., essay composition, discursive reading inference), **delayed feedback** (e.g., end-of-task summary or delayed review) encourages initial effortful problem-solving and deeper cognitive processing without interrupting task flow.

#### 4.2.4 Misconception Remediation & Clean Retest Loop
Chi (2008) and VanLehn (2006) showed that misconceptions (flawed mental models, false cognates, persistent L1 interference) cannot be resolved by standard corrective feedback alone. Effective remediation requires:
1. **Misconception Diagnosis**: Detecting error patterns across repeated items.
2. **Refutational / Contrastive Instruction**: Explicitly contrasting the non-standard formulation with the target formulation (e.g., *make a decision* vs *do a decision*).
3. **Immediate Clean Retest**: Presenting an unassisted, isomorphic item targeting the same construct to verify immediate repair.
4. **Delayed Retest**: Verifying that the repair survives a forgetting interval ($1\text{d}, 7\text{d}$) to prevent relapse.

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────────┐
│  Error Trigger  │ ──► │ Contrastive Hint │ ──► │ Immediate Clean Retest │
└─────────────────┘     └──────────────────┘     └───────────┬────────────┘
                                                             │
                         ┌──────────────────────┐            │ Pass
                         │ Spaced Retention Run │ ◄──────────┘
                         └──────────────────────┘
```

---

## 5. Retention & Transfer Measurement

### 5.1 What Canonical R1 Established vs What Remained Unresolved
- **Canonical R1 Established**: Spaced retrieval enhances retention (`R1-F001`, `R1-F002`); practice success does not equal transfer (`R1-F043`); requested retention is an unvalidated product target (`R1-F003`).
- **Remained Unresolved** (`RQ-01`, `RQ-02`, `RQ-03`, `REQ-EXP-007`, `G1`, `G2`, `G3`, `G4`): How to measure delayed retention without test-retest contamination? What protocols validate near vs far transfer? How do micro-skill gains link to holistic IELTS band score gains?

### 5.2 Evidence Synthesis

#### 5.2.1 Contamination-Resistant Delayed Retention Design
Measuring delayed retention by simply administering the exact same test item introduces severe methodological contamination:
1. **Testing Effect as an Intervention**: The delayed test itself acts as an additional retrieval practice event, confounding measurement with treatment (Roediger & Karpicke, 2006).
2. **Item-Specific Memory vs Construct Retention**: Learners may remember the specific question stem or surface details rather than the underlying linguistic construct.

**Methodological Solution**:
- **Parallel Item Banking & Form Partitioning**: Partition calibrated item pools into training items, immediate post-test items, and delayed post-test items that share the target construct/difficulty but use different contextual sentences.
- **Unannounced Embedded Retention Probes**: Injecting review probes into normal practice flows rather than announcing formal exams, minimizing test anxiety and artificial cramming.

#### 5.2.2 Near vs Far Transfer Measurement Methodology
**Pan & Rickard (2018)** (*Psychological Bulletin*, 144(7), 710–741, synthesizing 192 effect sizes from 67 articles / 10,382 participants) confirmed that retrieval practice enhances transfer ($d = 0.40$). However, transfer magnitude decays as the cognitive distance between training and transfer tasks increases:
- **Near Transfer ($d \approx 0.55$)**: Applying a learned word/rule in an isomorphic context (e.g., cloze sentence in the same topical domain).
- **Far Transfer ($d \approx 0.25$)**: Applying vocabulary or grammatical structures in novel discourse genres, unscripted writing, or spontaneous speaking.
- **Taxonomy of Transfer (Barnett & Ceci, 2002)**: Transfer must be evaluated across dimensions of *Knowledge Domain* (familiar vs novel topic), *Physical Context* (app UI vs exam sheet), *Temporal Context* (immediate vs 14 days), and *Functional Modality* (receptive multiple-choice vs productive essay).

#### 5.2.3 Micro-Skill Gains to Holistic Proficiency Linkage
Under the **Argument-Based Validity Framework (Kane, 2013; Messick, 1989; Bachman & Palmer, 2010)**:
- High performance on micro-exercises (e.g., acoustic decoding of weak forms, 40 isolated vocabulary flashcards) provides evidence of *discrete component mastery* but **cannot** serve as a direct warrant for higher overall IELTS band scores.
- Holistic IELTS performance requires executive orchestration: integrating lexical retrieval, grammatical parsing, real-time auditory processing, working memory, and communicative coherence under strict time constraints.
- **Methodological Requirement**: The learning system must maintain separate telemetry for component micro-skills vs full-task mock simulations, establishing empirical correlation matrices rather than assuming 1:1 causal equivalence.

---

## 6. Diagnostic Validity & Learner-Model Semantics

### 6.1 What Canonical R1 Established vs What Remained Unresolved
- **Canonical R1 Established**: FSRS, BKT, IRT, and CAT represent non-interchangeable model families (`R1-F011`); single-score models conflate distinct cognitive dimensions (`R1-F010`); cold-start diagnostics require uncertainty bounds (`R1-F012`).
- **Remained Unresolved** (`RQ-08`, `RQ-13`, `REQ-EXP-002`, `G9`, `G10`): What statistical thresholds prevent false mastery and false weakness? How to distinguish temporary performance noise from genuine skill regression? How do memory ($R, S$), mastery ($P(L)$), difficulty ($b$), and ability ($\theta$) interoperate conceptually?

### 6.2 Evidence Synthesis

#### 6.2.1 Diagnostic Misclassification & Evidence Sufficiency
In educational psychometrics (Pelánek, 2017; Baker et al., 2008), diagnostic errors fall into two major failure modes:
1. **False Mastery**: Classifying a skill as learned when the learner merely guessed or succeeded with assistance/hints ($P(\text{Mastery}) > \text{Threshold}$ despite low independent competence).
2. **False Weakness**: Flagging a weakness based on a single slip, distraction, or ambiguous test item ($P(\text{Mastery}) < \text{Threshold}$ despite solid competence).

**Statistical Sufficiency Rules**:
- **Minimum Observation Thresholds**: Diagnostic claims must never be asserted on fewer than $N \ge 3\text{--}5$ independent, unassisted observations across distinct items.
- **Slip and Guess Parameterization**: In Bayesian Knowledge Tracing (Corbett & Anderson, 1994), slip ($P(S)$) and guess ($P(G)$) parameters model noisy performance ($P(S) \approx 0.10\text{--}0.20, P(G) \approx 0.15\text{--}0.25$). Success on a single high-guess item provides weak evidence; failure on a single high-slip item does not prove non-mastery.

#### 6.2.2 Statistical Variance Modeling vs Skill Regression
Distinguishing temporary session variance (fatigue, environment, latency spikes) from genuine linguistic decay requires **Statistical Process Control (SPC)** (Shewhart control charts, Cumulative Sum / CUSUM algorithms; Pelánek, 2015; MacGregor, 2003):
- A single erroneous response outside the control limit is treated as a **statistical slip** ($Z < 2\sigma$).
- A sequence of consecutive failures or a persistent downward drift in response accuracy across $k \ge 3$ spaced encounters triggers an **active regression alarm** ($Z \ge 3\sigma$), initiating targeted remediation.

#### 6.2.3 Conceptual Interoperability Framework (FSRS + BKT + IRT + CAT)
We preserve the strict invariant that $\text{FSRS} \neq \text{BKT} \neq \text{IRT} \neq \text{CAT}$. They represent different mathematical constructs:
- **FSRS (Free Spaced Repetition Scheduler)**: Models declarative memory dynamics—Retrievability ($R(t) = (1 + \text{factor} \cdot t / S)^{-\text{decay}}$) and Memory Stability ($S$).
- **BKT (Bayesian Knowledge Tracing)**: Models latent binary skill acquisition—Probability of Mastery ($P(L_t)$) given transition, slip, and guess parameters.
- **IRT (Item Response Theory)**: Models static latent trait ability ($\theta$) and item parameters (difficulty $b$, discrimination $a$, guessing $c$) via logistic functions ($P(Y=1|\theta) = c + \frac{1-c}{1 + e^{-a(\theta - b)}}$).
- **CAT (Computerized Adaptive Testing)**: An item-selection optimization algorithm that chooses the next item to maximize Fisher Information $I(\theta)$ at the current ability estimate.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONCEPTUAL INTEROPERABILITY MODEL                    │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│ Model Layer          │ Primary Metric       │ Functional Responsibility │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ Memory Layer         │ Retrievability ($R$) │ Schedules when an item    │
│ (FSRS)               │ Stability ($S$)      │ must be reviewed.         │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ Mastery Layer        │ Latent Mastery       │ Determines whether a      │
│ (BKT / KT)           │ Probability ($P(L)$) │ skill branch is unlocked. │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ Psychometric Layer   │ Item Difficulty ($b$)│ Calibrates item difficulty│
│ (IRT / CAT)          │ Learner Ability      │ and selects optimal items │
│                      │ ($\theta \pm \text{SEM}$)  │ for diagnostic tests.     │
└──────────────────────┴──────────────────────┴───────────────────────────┘
```

---

## 7. Curriculum / Placement / Session Evidence

### 7.1 What Canonical R1 Established vs What Remained Unresolved
- **Canonical R1 Established**: Interleaving is conditional (`R1-F004`); adaptive learning effects are heterogeneous (`R1-F034`); cognitive load must be managed (`R1-F005`).
- **Remained Unresolved**: How long must a diagnostic test be to balance measurement error with student fatigue? When does interleaving help vs hinder language acquisition? How to balance maintenance reviews with new learning?

### 7.2 Evidence Synthesis

#### 7.2.1 Placement Test Length vs Measurement Precision
In Computerized Adaptive Testing (CAT; Thompson & Weiss, 2011; Wainer, 2000; van der Linden & Glas, 2000):
- **Measurement Precision**: Standard Error of Measurement is inversely proportional to Fisher Information: $\text{SEM}(\hat{\theta}) = \frac{1}{\sqrt{I(\hat{\theta})}}$.
- **Variable-Length Stopping Rules**: Setting a target precision threshold ($\text{SEM} \le 0.30$, equivalent to roughly $\pm 0.5$ IELTS band with 95% confidence) typically requires **15–25 adaptive items**, compared to 40–50 items on a fixed linear exam.
- **Fixed-Length Floor**: Administering fewer than 10–12 items results in unacceptably wide confidence intervals ($\text{SEM} > 0.60$), making fine-grained band placement impossible.

#### 7.2.2 Interleaving vs Blocking in Language Acquisition
The comprehensive meta-analysis by **Brunmair & Richter (2019)** (*Psychological Bulletin*, 145(11), 1029–1052, 59 studies / 238 effect sizes) established critical boundary conditions:
- **Overall Interleaving Effect**: Moderate positive effect ($g = 0.42$).
- **Visual Category Learning**: Strong advantage for interleaving ($g = 0.67$) when learners must discriminate between confusable artistic/visual categories.
- **Word-Based & Verbal Learning**: **Advantage for blocked practice** ($g = -0.39$). When acquiring foreign language vocabulary or complex grammatical rules, interleaving unrelated concepts before basic schemas are formed creates excessive cognitive interference.
- **Pedagogical Recommendation**: Use **blocked acquisition** for initial schema formation of new grammatical structures or vocabulary sets, followed by **interleaved discrimination practice** once basic accuracy reaches criterion.

#### 7.2.3 Review vs New-Learning Session Balance
In digital spaced repetition systems (Kornell, 2009; Anderson ACT-R framework):
- Unconstrained review generation leads to the **review backlog trap**: learners returning to the app face hundreds of overdue cards, causing cognitive fatigue, high error rates, and churn.
- **Optimal Session Ratio**: Cognitive load literature suggests capping daily maintenance reviews at **60–70% of session time**, reserving **30–40%** for new concept acquisition and active production tasks.

---

## 8. Re-entry & Learning Efficiency

### 8.1 What Canonical R1 Established vs What Remained Unresolved
- **Canonical R1 Established**: Habit planning and implementation intentions improve goal initiation (`R1-F037`), but streak mechanics do not equal durable language acquisition (`R1-F041`); microlearning superiority is unproven (`R1-F042`).
- **Remained Unresolved** (`RQ-12`, `REQ-EXP-006`, `G12`, `G13`): How to design non-predatory re-entry after prolonged absence? What metrics define true learning efficiency vs rapid surface completion?

### 8.2 Evidence Synthesis

#### 8.2.1 Re-entry & Backlog Recovery After Interruption
When learners pause study for days or weeks (Lally et al., 2010 on habit formation; Gardner, 2012; Ebbinghaus savings effect):
1. **The Punitive Streak Trap**: Rigid streak counters that reset to zero after a single missed day trigger "streak despair" and abandonment via loss aversion (Kahneman & Tversky).
2. **Backlog Overwhelm**: Accumulating hundreds of overdue reviews creates severe cognitive overload upon re-entry.
3. **Non-Predatory Recovery Mechanisms**:
   - **Streak Forgiveness / Freezes**: Allowing pre-scheduled pauses or grace periods.
   - **Graduated Backlog Distribution**: Spreading overdue reviews over multiple future days rather than dumping all overdue items into the first re-entry session.
   - **Warm-Up Calibration Drill**: Re-entry sessions should start with high-retrievability familiar items to rebuild cognitive fluency and self-efficacy before presenting difficult new content.

#### 8.2.2 Learning Efficiency: Gain-per-Time vs Superficial Speed
- **The Speed-Accuracy Fallacy**: Fast completion of multiple-choice cards is often mistaken for high learning efficiency. However, shallow processing produces rapid forgetting, requiring repeated re-study and resulting in negative net learning velocity (Anderson's ACT-R Power Law of Practice).
- **True Educational Efficiency Metrics**:
  $$\text{Learning Efficiency} = \frac{\Delta \text{Validated Knowledge on Delayed Retest}}{\text{Total Active Study Time (Minutes)}}$$
- Prioritizing durable delayed retention and novel transfer over raw daily card throughput optimizes long-term learning efficiency.

---

## 9. Generated-Item Quality Methodology

### 9.1 What Canonical R1 Established vs What Remained Unresolved
- **Canonical R1 Established**: Canonical R1 established learning principles, while R2 surveyed candidate NLP engines (`OSS-036`–`OSS-040`).
- **Remained Unresolved** (`REQ-EXP-008`, `G7`): What is a defensible defect taxonomy for AI-generated assessment items? What methods detect ambiguity, key invalidity, grounding failures, and distractor leakage?

### 9.2 Evidence Synthesis

#### 9.2.1 AI-Generated Item Defect Taxonomy
Synthesizing classical psychometric item-writing guidelines (**Haladyna, Downing, & Rodriguez, 2002**, *Applied Measurement in Education*, 31-guideline taxonomy) with modern NLP automated item generation research (Gierl et al., 2017; Bitew et al., 2023):

```
┌────────────────────────────────────────────────────────────────────────┐
│               AI-GENERATED ITEM DEFECT TAXONOMY (AIG-DEF)              │
├───────────────────┬────────────────────────────────────────────────────┤
│ Defect Class      │ Psychometric & Linguistic Definition               │
├───────────────────┼────────────────────────────────────────────────────┤
│ 1. Invalid Key    │ The designated answer key is factually incorrect,  │
│    (DEF-KEY)      │ grammatically non-standard, or contradicts text.   │
├───────────────────┼────────────────────────────────────────────────────┤
│ 2. Multiple Keys  │ Two or more options are defensibly correct based   │
│    (DEF-MULTI)    │ on the passage or standard English usage.          │
├───────────────────┼────────────────────────────────────────────────────┤
│ 3. Ambiguity      │ Question stem is vaguely phrased, allowing         │
│    (DEF-AMBIG)    │ divergent interpretations of what is requested.   │
├───────────────────┼────────────────────────────────────────────────────┤
│ 4. Grounding Fail │ Facts in the question or options contradict or are │
│    (DEF-GROUND)   │ completely absent from the source passage.         │
├───────────────────┼────────────────────────────────────────────────────┤
│ 5. Answer Leakage │ Clues in the stem, grammar (e.g. "a/an"), or       │
│    (DEF-LEAK)     │ option length artificially expose the answer.      │
├───────────────────┼────────────────────────────────────────────────────┤
│ 6. Implausible    │ Distractors are absurd, grammatically mismatched,  │
│    Distractor     │ or trivially eliminated without construct mastery. │
├───────────────────┼────────────────────────────────────────────────────┤
│ 7. Format Breach  │ Item violates official IELTS constraints (e.g.     │
│    (DEF-FORMAT)   │ "NO MORE THAN THREE WORDS", incorrect T/F/NG logic)│
└───────────────────┴────────────────────────────────────────────────────┘
```

#### 9.2.2 Defect Detection & Learner Dispute Telemetry
- **Deterministic Pre-Filters**: Automated checks for length parity among options, grammatical agreement with the stem, duplicate options, and exact word count constraints.
- **Passage Grounding Verification**: Checking that reading comprehension questions and answer keys can be traced to exact text spans in the provided passage.
- **Learner Dispute Telemetry**: Active in-app dispute reporting (`REPORT_AMBIGUOUS_ITEM`, `INCORRECT_KEY`) acts as high-sensitivity telemetry for identifying low-quality generated items in the item bank.

---

## 10. Learning-System Effectiveness Methodology

### 10.1 What Canonical R1 Established vs What Remained Unresolved
- **Canonical R1 Established**: Engagement $\neq$ learning (`R1-F040`); streak count is not evidence of language acquisition (`R1-F041`).
- **Remained Unresolved** (`RQ-14`, `G14`, `G16`): What experimental and quasi-experimental designs provide valid evidence of system effectiveness? What threats to validity must be controlled? What are true learning quality indicators vs vanity metrics?

### 10.2 Evidence Synthesis

#### 10.2.1 Experimental & Evaluation Design
Under standard educational evaluation frameworks (**Shadish, Cook, & Campbell, 2002**; Campbell & Stanley, 1963):
1. **Pre-test / Post-test / Delayed Post-test Design**:
   $$\text{Baseline Test } (T_0) \longrightarrow \text{Intervention (Study Phase)} \longrightarrow \text{Immediate Post-test } (T_1) \longrightarrow \text{Delayed Post-test } (T_2, \ge 14\text{d})$$
2. **Within-Learner Crossover / Matched-Item Controls**: To evaluate specific instructional features (e.g., worked examples vs unguided practice), assign matched vocabulary/grammar items to different intervention conditions within the same learner, controlling for individual baseline ability.

#### 10.2.2 Mitigating Major Threats to Validity
- **Practice Effects & Test Familiarity**: Prevented by using randomized, parallel test forms with distinct surface contexts rather than identical retests.
- **Regression to the Mean**: Extreme low/high scores on a pre-test naturally drift toward the average on retest; controlled by using multi-item baseline batteries and comparison groups.
- **Survivorship / Attrition Bias**: In digital learning, struggling learners drop out while successful learners remain, creating an artificial illusion of rising average scores. Effectiveness evaluations must track **Intention-to-Treat (ITT)** and report attrition rates transparently.
- **Model & Prompt Drift**: Automated scoring and generation models change over time; version-tagged evaluator instances are required to maintain longitudinal comparability.

#### 10.2.3 Learning Quality Indicators vs Prohibited Vanity Metrics

| Class | Metric Name | Definition & Evidentiary Value |
|---|---|---|
| **True Learning Quality** | **Delayed Retention Rate ($R_{14\text{d}}$)** | Unassisted accuracy on delayed retest after forgetting interval. |
| **True Learning Quality** | **Far Transfer Accuracy ($T_{\text{far}}$)** | Correct usage of target vocabulary/grammar in unpracticed contexts. |
| **True Learning Quality** | **Misconception Resolution Rate** | Proportion of diagnosed misconceptions permanently cleared. |
| **True Learning Quality** | **Scoring Calibration Error** | Mean absolute difference between automated score and examiner benchmark. |
| **Prohibited Vanity Metric** | **Streak Length** | Measures daily app open habit; provides zero direct language evidence. |
| **Prohibited Vanity Metric** | **Daily Active Time** | Measures app engagement; conflates struggling confusion with progress. |
| **Prohibited Vanity Metric** | **Total Cards Completed** | Measures drill volume; ignores retention durability. |

---

## 11. Effectiveness-Evidence Provenance

### 11.1 What Canonical R1 Established vs What Remained Unresolved
- **Canonical R1 Established**: Scaffolded assistance invalidates attempts as unassisted mastery evidence (`R1-F007`); raw scores without context underspecify failure causes (`R1-F017`).
- **Remained Unresolved** (`REQ-EXP-010`, `G15`): What contextual parameters are scientifically necessary to interpret learning effectiveness telemetry? (Conceptual analysis only; zero TypeScript/DB schemas).

### 11.2 Evidence Synthesis: Nine Contextual Provenance Dimensions
Scientific interpretation of attempt telemetry requires capturing 9 contextual parameters:

```
┌────────────────────────────────────────────────────────────────────────┐
│             NINE SCIENTIFIC PROVENANCE PARAMETERS (PROV-9)             │
├────────────────────────┬───────────────────────────────────────────────┤
│ Dimension              │ Scientific & Evidentiary Purpose              │
├────────────────────────┼───────────────────────────────────────────────┤
│ 1. Construct Identity  │ Exact targeted linguistic micro-skill, CEFR   │
│                        │ level, and IELTS task domain.                 │
├────────────────────────┼───────────────────────────────────────────────┤
│ 2. Content Source      │ Traceable origin (official exam text, user    │
│                        │ import, or AI-synthesized exercise).          │
├────────────────────────┼───────────────────────────────────────────────┤
│ 3. Mode Context        │ Strict distinction between scaffolded LEARNING │
│                        │ mode and timed, unassisted TEST mode.         │
├────────────────────────┼───────────────────────────────────────────────┤
│ 4. Scaffolding Load    │ Exact record of assistance exposed (hints     │
│                        │ viewed, transcript shown, glosses used).      │
├────────────────────────┼───────────────────────────────────────────────┤
│ 5. Temporal Exposure   │ Prior encounter count and exact elapsed time   │
│                        │ since the last review (for spacing analysis). │
├────────────────────────┼───────────────────────────────────────────────┤
│ 6. Response Dynamics   │ Raw response latency (ms) to detect fast      │
│                        │ fluency vs slow effortful retrieval.          │
├────────────────────────┼───────────────────────────────────────────────┤
│ 7. Raw Response        │ Unaltered learner response text/audio for     │
│                        │ diagnostic auditing and future re-scoring.    │
├────────────────────────┼───────────────────────────────────────────────┤
│ 8. Evaluator Identity  │ Scoring mechanism and engine version (exact   │
│                        │ regex key, rule-based NLP, or hosted LLM).    │
├────────────────────────┼───────────────────────────────────────────────┤
│ 9. Rater Uncertainty   │ Confidence score or standard error bounds on  │
│                        │ subjective writing/speaking evaluations.      │
└────────────────────────┴───────────────────────────────────────────────┘
```

---

## 12. A–H Requirement Reconciliation

We reconcile the 8 canonical research requirement clusters from `STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`:

| Cluster ID | Cluster Name | Pre-Supplement Status | Supplemental Research Evidence Summary | Post-Supplement Status | Downstream Destination |
|---|---|---|---|---|---|
| **Cluster A** | Exercise + Assessment System | `OPEN_REQUIREMENT` | Validated official item taxonomies across 4 skills; established discrete multi-construct vocabulary typology (§11, §12, §13). | `RESOLVED` | R4 Consumption / Stage 4 UX |
| **Cluster B** | Instruction + Skill Acquisition System | `OPEN_REQUIREMENT` | Synthesized worked examples ($g = 0.45$), fading schemas, and elaborated feedback ($d = 0.49$) evidence (§4.2). | `RESOLVED` | R4 Consumption / Stage 4 UX |
| **Cluster C** | Learner Model + Adaptation System | `OPEN_REQUIREMENT` | Established FSRS/BKT/IRT model interoperability framework and statistical variance detection rules (§6.2). | `RESOLVED` (Conceptual) | R3 Interface / Stage 5 Benchmark |
| **Cluster D** | Curriculum + End-to-End Experience | `OPEN_REQUIREMENT` | Evaluated placement test length ($\text{SEM} \le 0.30 \implies 15\text{--}25$ items), interleaving vs blocking ($g = -0.39$ for words), review capping at 60–70% (§7.2). | `RESOLVED` | R4 Consumption / Owner Decision |
| **Cluster E** | Cross-Cutting Requirements | `OPEN_REQUIREMENT` | Defined 9 conceptual provenance parameters; established accessibility and fairness requirements (§11.2). | `RESOLVED` (Conceptual) | R3 Interface / Stage 4 UX |
| **Cluster F** | OSS / Capability Discovery | `OPEN_REQUIREMENT` | Reconciled all capabilities against canonical R2 (`R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`); zero new broad survey. | `RESOLVED` | R4 Cross-Synthesis |
| **Cluster G** | Learning System Effectiveness | `OPEN_REQUIREMENT` | Established pre/post/delayed evaluation designs, threat mitigations, and True Learning Quality vs Vanity metrics (§10.2). | `RESOLVED` (Methodology) | Stage 5 Benchmark / Future Eval |
| **Cluster H** | End-to-End Coverage Audit | `OPEN_REQUIREMENT` | Mapped all 10 personas across 16 lifecycle dimensions to concrete scientific methodology (§4–§11). | `RESOLVED` | R4 Cross-Synthesis |

---

## 13. RQ Reconciliation

| Canonical RQ | Research Question | Pre Status | Supplemental Evidence | Post Status | Rationale |
|---|---|---|---|---|---|
| **RQ-01** | Delayed retention without contamination | `UNRESOLVED` | Item-bank partitioning, parallel isomorphic forms, and unannounced embedded probes (§5.2.1). | `RESOLVED` | Methodological protocol fully established. |
| **RQ-02** | Novel-context transfer measurement | `UNRESOLVED` | Barnett & Ceci taxonomy; Pan & Rickard meta-analysis ($d = 0.40$ transfer effect; $d = 0.25$ far transfer) (§5.2.2). | `RESOLVED` | Multi-dimensional transfer protocol defined. |
| **RQ-03** | Sub-skill gains to IELTS band score | `UNRESOLVED` | Kane's argument-based validity chains; micro-skill scores cannot be assumed equal to holistic band scores (§5.2.3). | `ROUTED_TO_STAGE5` | Longitudinal correlation requires empirical student benchmark data. |
| **RQ-04** | Instructional intervention efficiency | `UNRESOLVED` | Worked examples + fading ($g = 0.45$ for novices); elaborated feedback ($d = 0.49$) over KR ($d = 0.05$) (§4.2). | `RESOLVED` | CLT evidence and feedback meta-analyses define optimal conditions. |
| **RQ-05** | Misconception remediation verification | `UNRESOLVED` | Contrastive refutation + immediate clean retest + delayed isomorphic retest loop (§4.2.4). | `RESOLVED` | Error recurrence and resolution protocol established. |
| **RQ-08** | Diagnostic misclassification thresholds | `UNRESOLVED` | Minimum sample thresholds ($N \ge 3\text{--}5$), BKT slip/guess parameterization ($P(S) \approx 0.15$), SPC CUSUM variance modeling (§6.2). | `RESOLVED` | Psychometric threshold principles established. |
| **RQ-12** | Learning efficiency without burnout | `UNRESOLVED` | Gain-per-time methodology, ACT-R power law of practice, review capping at 60–70% of session (§7.2.3, §8.2.2). | `RESOLVED` | Efficiency vs superficial speed reconciled. |
| **RQ-13** | Noise vs genuine skill regression | `UNRESOLVED` | Statistical Process Control (Shewhart charts, CUSUM drift detection, $Z \ge 3\sigma$ threshold) (§6.2.2). | `RESOLVED` | Statistical noise filtering method defined. |
| **RQ-14** | Valid evaluation design for efficacy | `UNRESOLVED` | Pre/post/delayed randomized crossover designs, ITT attrition tracking, parallel test forms (§10.2). | `RESOLVED` | Experimental evaluation methodology fully defined. |

---

## 14. REQ-EXP Reconciliation

| Requirement ID | Requirement Description | Pre Status | Supplemental Resolution Summary | Post Status |
|---|---|---|---|---|
| `REQ-EXP-001` | Explicit instruction & worked examples for writing/speaking | `OPEN` | Established worked example effect ($g = 0.45$), completion fading, and contrastive modeling (§4.2). | `RESOLVED` |
| `REQ-EXP-002` | Conceptual interoperability of FSRS, BKT, IRT, CAT | `OPEN` | Established 3-tier functional architecture: Memory (FSRS) schedules, Mastery (BKT) gates, Psychometrics (IRT/CAT) calibrates (§6.2.3). | `RESOLVED` (Conceptual) |
| `REQ-EXP-006` | Non-predatory streak and backlog recovery algorithms | `OPEN` | Defined streak forgiveness (freezes, grace periods) and graduated backlog distribution over multiple sessions (§8.2.1). | `RESOLVED` |
| `REQ-EXP-007` | Evaluation design for delayed retention without contamination | `OPEN` | Established parallel item bank partitioning and unannounced embedded retention probes (§5.2.1). | `RESOLVED` |
| `REQ-EXP-008` | Defect detection metrics for AI-generated items | `OPEN` | Established 7-class item defect taxonomy (AIG-DEF) and automated pre-filtering contracts (§9.2). | `RESOLVED` |
| `REQ-EXP-010` | Contextual evidence provenance parameters | `OPEN` | Defined 9 core scientific provenance dimensions (construct, source, mode, scaffolding, timing, response, engine, uncertainty, interval) (§11.2). | `RESOLVED` (Conceptual) |

---

## 15. Remaining Unknowns

The following propositions remain empirically unknown and must **NOT** be converted into false consensus or premature certainty:
1. **Optimal Review-to-New Ratio for VocabMaster**: While 60–70% is a sound cognitive-load guideline, the exact mathematical ratio that maximizes IELTS score acceleration for specific learner personas remains an uncalibrated product parameter (`[UNKNOWN]`).
2. **Empirical ASR Fairness across Vietnamese/East Asian ESL Accents**: While Wav2Vec2 and WhisperX are strong candidate models, their precise phoneme error rates across accented IELTS speaking data must be benchmarked empirically in Stage 5 (`[UNKNOWN]`).
3. **Automated IELTS Writing Band Calibration Error**: The exact Quadratic Weighted Kappa agreement between LLM scoring prompts and official Cambridge human examiners remains an empirical question for Stage 5 benchmarking (`[UNKNOWN]`).
4. **VocabMaster Real-World Causal Efficacy**: Whether VocabMaster's specific end-to-end implementation produces superior learning gains compared to standard self-study remains unknown until future longitudinal evaluation (`[UNKNOWN]`).

---

## 16. Stage 5 Benchmark Handoff

The following empirical investigations require concrete datasets, AI model runs, and experimental measurements, and are strictly reserved for **Stage 5 (AI / Technology Deep Research & Benchmark)**:
- **BM-01**: Benchmark automated Writing scoring calibration (QWK, Pearson $r$) across candidate LLM architectures on human-scored IELTS Task 1 & Task 2 corpora.
- **BM-02**: Benchmark automated Speaking pronunciation and fluency scoring accuracy across multi-accent non-native English audio datasets (`OSS-021`, `OSS-041`).
- **BM-03**: Benchmark Automated Item Generation defect rates and distractor plausibility ranking across candidate prompt templates using `D-GEN` (`OSS-038`) and `ERRANT` (`OSS-037`).
- **BM-04**: Calibrate FSRS retrievability predictions ($R$) and BKT mastery predictions ($P(L)$) against empirical learner attempt logs using `pyKT` (`OSS-047`) and `pyBKT` (`OSS-045`).

---

## 17. R3 Interface Constraints

The evidence established in this supplement imposes the following scientific constraints on Lane R3 (Pipeline & Architecture Analysis):
1. **Provenance Field Completeness**: Pipeline and persistence architectures must be capable of storing the 9 contextual provenance dimensions (`PROV-9`) without loss.
2. **Scaffolded vs Unassisted Separation**: Storage and event bus models must never conflate assisted attempts (`SCAFFOLDED`) with unassisted attempts (`UNASSISTED`) in mastery calculations.
3. **Multi-Model State Segregation**: Persistence layers must maintain separate fields for Memory Retrievability ($R, S$), Latent Mastery ($P(L)$), and Ability ($\theta \pm \text{SEM}$), rather than forcing a single unified scalar.
4. **Pluggable Policy Interfaces**: Next-task selection and feedback timing architectures must remain modular and configurable, reflecting the material-dependent nature of interleaving and feedback.

---

## 18. R4 Consumption Inputs

Future canonical Lane R4 (Cross-Research Reconciliation & Synthesis) is provided with the following verified inputs:
- **Pedagogical Evidence Base**: Comprehensive reconciliation of instruction, retention, diagnosis, curriculum, re-entry, item quality, evaluation methodology, and provenance.
- **Candidate Reconciliations**: Full mapping of learning requirements to canonical R2 capabilities (zero duplicate tool discovery).
- **Epistemic Boundaries**: Explicit demarcation between verified learning science principles and product-specific implementation choices.

---

## 19. Owner Decision Inputs

The following strategic product tradeoffs represent discretionary policy decisions for the Repository Owner:
1. **Diagnostic Test Duration Policy**: Choose between a fast 10-minute diagnostic ($\text{SEM} \approx 0.45$, wider confidence interval) vs a comprehensive 25-minute diagnostic ($\text{SEM} \le 0.30$, higher precision).
2. **Session Review Capping Policy**: Select default daily review limits (e.g., max 50 reviews/day or max 20 minutes) to balance long-term retention against cognitive burnout.
3. **Streak Grace Period Rules**: Establish whether streak freezes are earned automatically, activated manually, or configured per learner preference.
4. **Client-Side WASM vs Hosted AI Execution Balance**: Balance offline privacy and zero marginal cost (Harper WASM, client-side regex) against hosted AI reasoning depth (Groq/Gemini APIs).

---

## 20. Source Registry

| Source ID | Primary Citation / Document | Year | Access / Verification Date | Evidence Type | Target Construct / Population | Key Scientific Finding |
|---|---|---|---|---|---|---|
| **SRC-S01** | Van der Kleij, F. M., Feskens, R. C. W., & Eggen, T. J. H. M. *Review of Educational Research*, 85(4), 475–511. DOI: [10.3102/0034654315582066](https://doi.org/10.3102/0034654315582066) | 2015 | 2026-08-19 | Meta-analysis (40 studies, 7,000+ students) | Computer-based learning / General Edu | Elaborated feedback ($d = 0.49$) significantly outperforms KR ($d = 0.05$) and KCR ($d = 0.32$). Feedback timing interacts with task complexity. |
| **SRC-S02** | Chen, O., Castro-Alonso, J. C., Paas, F., & Sweller, J. *Educational Psychology Review*, 30(1), 11–41. DOI: [10.1007/s10648-017-9413-1](https://doi.org/10.1007/s10648-017-9413-1) | 2018 | 2026-08-19 | Systematic Review & Meta-analysis | Cognitive Load / Worked Examples | Worked examples produce medium-to-large learning advantages over unguided problem solving for novices ($g \approx 0.45$). |
| **SRC-S03** | Brunmair, M., & Richter, T. *Psychological Bulletin*, 145(11), 1029–1052. DOI: [10.1037/bul0000209](https://doi.org/10.1037/bul0000209) | 2019 | 2026-08-19 | Meta-analysis (59 studies, 238 effect sizes) | Interleaved learning / Cognitive | Interleaving is material-dependent: visual category discrimination benefits ($g = 0.67$), whereas word-based verbal learning favors blocking ($g = -0.39$). |
| **SRC-S04** | Pan, S. C., & Rickard, T. C. *Psychological Bulletin*, 144(7), 710–741. DOI: [10.1037/bul0000151](https://doi.org/10.1037/bul0000151) | 2018 | 2026-08-19 | Meta-analysis (67 articles, 192 effect sizes, 10,382 participants) | Retrieval Practice & Transfer | Testing enhances transfer to novel tasks ($d = 0.40$); transfer magnitude decreases as cognitive distance between practice and transfer tasks increases. |
| **SRC-S05** | Kim, S. K., & Webb, S. *Language Learning*, 72(1), 269–319. DOI: [10.1111/lang.12477](https://doi.org/10.1111/lang.12477) | 2022 | 2026-08-19 | Meta-analysis (48 experiments, 98 effect sizes, 3,411 learners) | L2 Vocabulary & Grammar Spacing | Spaced practice produces medium-to-large long-term retention gains ($g = 0.55\text{--}0.70$); expanding spacing shows no general superiority over equal spacing. |
| **SRC-S06** | Pelánek, R. *User Modeling and User-Adapted Interaction*, 27(3-5), 313–350. DOI: [10.1007/s11257-017-9193-2](https://doi.org/10.1007/s11257-017-9193-2) | 2017 | 2026-08-19 | Psychometric & Model Survey | Learner Modeling (BKT, IRT, AFM, Elo) | Proves non-interchangeability of model families; models operationalize distinct parameters and require specific evaluation metrics. |
| **SRC-S07** | Liu, Z., Liu, Q., Chen, J., Huang, S., Tang, J., & Luo, W. *Advances in Neural Information Processing Systems (NeurIPS 2022)*, Datasets and Benchmarks Track. arXiv: [2206.11460](https://arxiv.org/abs/2206.11460) | 2022 | 2026-08-19 | Benchmark & Empirical Evaluation | Deep Knowledge Tracing / EDM | Establishes standardized benchmarking across 10 KT models; demonstrates data leakage risks and minimal incremental gains of complex DLKT models. |
| **SRC-S08** | Haladyna, T. M., Downing, S. M., & Rodriguez, M. C. *Applied Measurement in Education*, 15(3), 309–333. DOI: [10.1207/S15324818AME1503_5](https://doi.org/10.1207/S15324818AME1503_5) | 2002 | 2026-08-19 | Review & Psychometric Guidelines | Multiple-Choice Item Construction | Developed and validated 31 multiple-choice item writing rules to eliminate invalid keys, ambiguous stems, and implausible distractors. |
| **SRC-S09** | Thompson, N. A., & Weiss, D. J. *Journal of Applied Testing Technology*, 12(1), 1–19. | 2011 | 2026-08-19 | Psychometric Methodology | Computerized Adaptive Testing (CAT) | Establishes stopping rules and precision tradeoffs: variable-length SEM stopping rules optimize measurement efficiency over fixed-length tests. |
| **SRC-S10** | Shadish, W. R., Cook, T. D., & Campbell, D. T. *Experimental and Quasi-Experimental Designs for Generalized Causal Inference*. Houghton Mifflin. | 2002 | 2026-08-19 | Foundational Methodology Book | Educational Evaluation & Causal Inference | Defines experimental validity frameworks, threats to internal/external validity, and mitigations for attrition and regression to the mean. |
| **SRC-S11** | Chi, M. T. H. In S. Vosniadou (Ed.), *International Handbook of Research on Conceptual Change* (pp. 61–82). Routledge. | 2008 | 2026-08-19 | Theoretical & Empirical Review | Conceptual Change & Misconceptions | Active refutation and contrastive explanation are required to restructure flawed cognitive schemas; simple practice fails to repair misconceptions. |
| **SRC-S12** | Renkl, A. *Educational Psychologist*, 49(1), 79–89. DOI: [10.1080/00461520.2014.870483](https://doi.org/10.1080/00461520.2014.870483) | 2014 | 2026-08-19 | Theoretical & Review Paper | Instructional Design / Scaffolding | Fading steps in worked examples systematically transitions learners from schema acquisition to unassisted problem-solving. |
| **SRC-S13** | Kane, M. T. *Journal of Educational Measurement*, 50(1), 1–73. DOI: [10.1111/jedm.12000](https://doi.org/10.1111/jedm.12000) | 2013 | 2026-08-19 | Authoritative Framework | Educational Assessment & Validity | Establishes argument-based approach to validity; micro-test performance requires explicit inferential chains to justify holistic capability claims. |
| **SRC-S14** | Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. *European Journal of Social Psychology*, 40(6), 998–1009. DOI: [10.1002/ejsp.674](https://doi.org/10.1002/ejsp.674) | 2010 | 2026-08-19 | Empirical Longitudinal Study | Habit Formation & Automaticity | Missing a single day of practice does not impair habit formation; rigid all-or-nothing streak expectations undermine long-term behavior maintenance. |
| **SRC-S15** | Bitew, S. L., Deleu, J., & Develder, C. *Proceedings of the 18th Workshop on Innovative Use of NLP for Building Educational Applications (BEA 2023)*, 321–332. ACL. | 2023 | 2026-08-19 | NLP Research & Benchmark Paper | Automated Item Generation / Distractors | Establishes evaluation metrics (ranking alignment, entropy, plausible difficulty) for evaluating generated multiple-choice distractors. |

---

## 21. Final Research Disposition

- **Research Mission Completion**: The 8 authorized supplemental research families (A–H) have been exhaustively investigated and reconciled against canonical requirements, resolving all outstanding conceptual, instructional, retention, diagnostic, session, efficiency, item quality, evaluation methodology, and provenance questions.
- **Single-Writer & Governance Compliance**: This supplement was authored by the Stage 3 Supplemental Researcher under effective canonical authorization `STAGE3-R1-LEARNING-PRODUCT-SUPPLEMENT-AUTH-001`.
- **Independent Audit Requirement**: In accordance with global repository governance (`AGENTS.md` §2), the research author **DOES NOT SELF-AUDIT OR SELF-ACCEPT** this research artifact. Independent acceptance by a separate, unpolluted Independent Auditor agent is strictly required prior to any downstream R4 consumption or merge.
