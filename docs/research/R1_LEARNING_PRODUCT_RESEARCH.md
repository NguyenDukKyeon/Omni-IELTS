# R1 — Learning & Product Deep Research

## 0. Research Identity

| Trường                          | Giá trị                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Original transaction            | `STAGE3-R1-LEARNING-PRODUCT-RESEARCH-001`                                                                            |
| Remediation transaction         | `STAGE3-R1-RESEARCH-REMEDIATION-001`                                                                                 |
| Source-provenance correction    | `R1 SOURCE-PROVENANCE FINAL CORRECTION`                                                                              |
| Remediation date                | 2026-08-17, Asia/Bangkok                                                                                             |
| Repository                      | `NguyenDukKyeon/VocabMaster`                                                                                         |
| Public product identity         | OmniIELTS / VocabMaster                                                                                              |
| Current `main` SHA inspected    | `06ff39360d41fb3e83c98352fe4a9d3093190b45`                                                                           |
| Controlling authorization       | `docs/authorizations/STAGE3-RESEARCH-AUTH-001.md`                                                                    |
| Role                            | Independent Stage 3 R1 Research Remediation Researcher                                                               |
| Eventual materialization target | `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`                                                                      |
| Authority boundary              | Research evidence only; zero implementation, adoption, acceptance, merge, R4, Stage 4, Stage 5, or Stage 6 authority |

This source-provenance correction uses the completed revised R1 report as its frozen substantive baseline. No `R1-Fxxx` proposition has been changed or renumbered.

[VERIFIED — REPOSITORY] Fresh preflight in the underlying remediation confirmed that `main` points to `06ff39360d41fb3e83c98352fe4a9d3093190b45`; therefore the repository base used by the revised R1 report had not drifted.

[VERIFIED — REPOSITORY] `docs/STAGE3_RESEARCH_STRATEGY.md` remained `ACCEPTED / CANONICAL` and defined R1 as the learning/product research lane.

[VERIFIED — REPOSITORY] `STAGE3-RESEARCH-AUTH-001.md` remained `ACCEPTED / CANONICAL / EFFECTIVE`, authorizing research while withholding implementation, dependency/provider adoption, Stage 4 work, Stage 5 selection, and self-acceptance.

[VERIFIED — REPOSITORY] `STAGE3_RESEARCH_CONSTRAINTS.md` remained `OWNER_PREFERENCE / RESEARCH_INPUT_ONLY / NON_CANONICAL`.

**Non-authority notice:** this report is a research evidence package only. `P0–P3` express product-learning significance, not permission to build.

---

## 1. Executive Findings

Exactly fifteen findings are elevated here. Their IDs have the same proposition everywhere else in this report.

| ID                      | Consequential finding                                                                                                                                                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1-F001**             | **[VERIFIED — RESEARCH] HIGH · MEM.** Retrieval practice generally improves delayed retention relative to restudy; benefit depends materially on successful retrieval or corrective feedback after failure.                                                                   |
| **R1-F002**             | **[VERIFIED — RESEARCH] HIGH · MEM/L2.** Distributed practice improves durable retention, but useful spacing depends on retention horizon and task; direct L2 synthesis does not establish expanding spacing as generally superior to equal spacing.                          |
| **R1-F003**             | **[UNKNOWN] INSUFFICIENT.** No evidence audited here establishes a universal VocabMaster-wide requested-retention target of `0.90` as scientifically optimal.                                                                                                                 |
| **R1-F005**             | **[VERIFIED — RESEARCH] MODERATE–HIGH · EDU.** Segmentation, management of split attention, avoidance of unnecessary redundancy, and expertise-sensitive guidance are conditional cognitive-load/multimedia principles rather than “show every support simultaneously” rules. |
| **R1-F007**             | **[INFERENCE] HIGH.** Assistance may teach effectively while making that same attempt weaker or invalid as evidence of independent performance on the assisted construct; a later clean attempt is required for a stronger mastery claim.                                     |
| **R1-F010**             | **[INFERENCE] HIGH.** Memory scheduling, skill/mastery estimation, error diagnosis, and transfer are distinct product constructs and should not be collapsed into one score.                                                                                                  |
| **R1-F013**             | **[VERIFIED — RESEARCH] HIGH · L2-EN/L2.** Receptive and productive lexical/collocational knowledge are separable; recognition success is not complete word knowledge.                                                                                                        |
| **R1-F017**             | **[VERIFIED — RESEARCH] MODERATE–HIGH · L2.** Listening is multidimensional; one comprehension score cannot identify whether failure arose from acoustic/phonological decoding, segmentation, lexical access, integration, or higher-level interpretation.                    |
| **R1-F018**             | **[INFERENCE] HIGH.** Performance while a transcript/caption exposes target linguistic information cannot isolate unaided auditory decoding, even though text support may itself be pedagogically useful.                                                                     |
| **R1-F021**             | **[VERIFIED — RESEARCH] HIGH · L2.** Extensive reading has positive L2 learning effects, while extreme speed-reading claims without comprehension trade-offs are not supported by reading science.                                                                            |
| **R1-F024**             | **[VERIFIED — RESEARCH] HIGH · L2.** Peer feedback improves L2 writing on average, but effects are larger on revisions than on new compositions; corrected performance and transfer must therefore remain separate.                                                           |
| **R1-F029**             | **[VERIFIED — RESEARCH] MODERATE–HIGH · L2.** Pronunciation instruction is most clearly effective for monitored production of targeted features; evidence for global spontaneous pronunciation gains is less certain.                                                         |
| **R1-F034**             | **[VERIFIED — RESEARCH] MODERATE · EDU.** Adaptive learning can improve achievement, but effects are heterogeneous across learners, domains, duration, design, and what is adapted; personalization is not intrinsically beneficial.                                          |
| **R1-F037**             | **[VERIFIED — RESEARCH] MODERATE · OTHER.** Implementation intentions and stable cue planning can improve goal initiation/attainment, but evidence from non-language domains must not be converted into durable-L2-learning claims.                                           |
| **R1-F045**             | **[INFERENCE] HIGH.** Because current `mastered` is derived from ≥60-day FSRS stability across required scheduler lanes, the product should not interpret that label as complete transferable English mastery without additional evidence.                                    |

The scientific basis for retrieval and delayed learning remains strong. Roediger and Karpicke demonstrated the classic divergence between immediate performance and delayed retention, Rowland's meta-analysis supports retrieval over restudy, and subsequent experimental work highlights the importance of successful retrieval or corrective information after failure.

Direct L2 spacing evidence is unusually strong for this scope: Kim and Webb synthesized 98 effects from 48 experiments involving 3,411 learners and found medium-to-large spacing benefits, stronger long-spacing advantages on delayed outcomes, and no reliable overall difference between equal and expanding schedules.

For transfer, Pan and Rickard synthesized 192 effects from 122 experiments in 67 articles involving 10,382 participants and estimated an overall transfer effect around `d = .40`, with substantial dependence on the relationship between practiced and transfer tasks. Practice success therefore cannot safely be treated as automatic generalization.

---

## 2. Methodology

### Baseline-preserving remediation method

This was not a new systematic review. The existing R1 draft was treated as the baseline evidence package. The remediation process was:

`draft claim/finding → semantic audit → repository freshness check → source/precision check → targeted gap research → epistemic split → registry freeze → cross-reference reconciliation`.

Existing research was retained when its proposition remained defensible. Additional searching was concentrated on the original audit defects: multimedia/cognitive load, habit/initiation/friction, speaking, generative learning, writing, conflicting evidence, and load-bearing quantitative claims.

The present final correction is narrower still:

`revised R1 → bibliographic audit → missing-source registration → ambiguous multimedia-source decomposition → body/source reconciliation → source-count recomputation`.

No substantive literature review was rerun.

### Evidence hierarchy and applicability

| Tier | Preferred evidence                                                                      |
| ---- | ------------------------------------------------------------------------------ |
| A                      | Systematic review, meta-analysis, major quantitative synthesis                 |
| B                      | Controlled/RCT/longitudinal or strong quasi-experimental work                  |
| C                      | Validated model, replication, suitable high-quality observational evidence     |
| D                      | Authoritative academic framework/review when stronger evidence was unavailable |

Applicability codes remain frozen:

`L2-EN` direct English L2/EFL/ESL; `L2` second/foreign language; `EDU` general education; `MEM` general memory/cognition; `OTHER` other behavioral population.

A general-memory, general-education, or health-behavior finding is not silently transformed into an English-learning product fact. Product extrapolations remain `[INFERENCE]`.

### Inclusion, exclusion and quantitative policy

Primary journal/publisher pages, PubMed-indexed records, proceedings maintained by the scholarly publisher/society, and official project documentation were preferred. Marketing pages, SEO material, unsourced educational advice, and product claims were not accepted as learning-effectiveness evidence.

A number was retained only when the underlying inspected source supported the construct, sample and comparison represented by that number.

### Targeted remediation search surface

The bounded original remediation queries covered:

`multimedia learning + segmenting + split attention + redundancy + expertise reversal`;

`L2 captions/subtitles + listening + attention`;

`implementation intentions + cue planning + habit automaticity`;

`speaking task repetition + shadowing + self-monitoring + corrective feedback`;

`self-explanation + generation + concept mapping + teaching`;

`L2 writing corrective feedback + peer feedback + planning + revision + task repetition + sentence combining`;

`retrieval/spacing/interleaving/transfer quantitative verification`.

The present provenance correction inspected only official records needed to resolve SRC-07/SRC-08/SRC-19, corrective-feedback timing, and source-count integrity.

### Canonical Finding Registry

This table remains the authority for `R1-Fxxx` identity.

| ID      | Canonical proposition                                                                                                                                                                             | Epistemic class       | Strength            | Applicability | Primary support                            | Material limitation                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------- | ------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| R1-F001                                                                                       | Retrieval practice generally improves delayed retention versus restudy; successful retrieval or corrective feedback matters.                                                                       | [VERIFIED — RESEARCH] | HIGH                | MEM           | SRC-01–03                                  | Not every test format/task is equivalent                                         |
| R1-F002                                                                                       | Spacing improves durable retention; optimal spacing depends on horizon/context; equal and expanding spacing are not generally distinguishable in L2 synthesis.                                     | [VERIFIED — RESEARCH] | HIGH                | MEM/L2        | SRC-04–05                                  | No universal interval                                                            |
| R1-F003                                                                                       | A universal VocabMaster requested-retention target of `0.90` is not established.                                                                                                                   | [UNKNOWN]             | INSUFFICIENT        | L2            | REP-05 + absence of validating R1 evidence | Product/economic parameter                                                       |
| R1-F004                                                                                       | Interleaving is conditional, with benefits especially when discrimination among confusable categories is important; some verbal materials favor blocking.                                          | [VERIFIED — RESEARCH] | MODERATE–HIGH       | EDU           | SRC-06                                     | Strong material/task moderators                                                  |
| R1-F005                                                                                       | Multimedia/CLT benefits of segmentation, split-attention reduction and removing unnecessary redundancy are conditional and expertise-sensitive.                                                    | [VERIFIED — RESEARCH] | MODERATE–HIGH       | EDU           | **SRC-07,SRC-08,SRC-31,SRC-32**            | Generic education, not automatically L2                                          |
| R1-F006                                                                                       | Captions/transcripts can improve L2 audiovisual learning; they are not generically “redundant” for L2 learners.                                                                                    | [VERIFIED — RESEARCH] | MODERATE–HIGH       | L2            | SRC-09                                     | Format, proficiency, task moderate effects                                       |
| R1-F007                                                                                       | Target-revealing assistance can teach while preventing the same attempt from establishing independent mastery evidence.                                                                            | [INFERENCE]           | HIGH                | L2/product    | F001,F005,F006 + REP-06                    | Exact assistance thresholds require validation                                   |
| R1-F008                                                                                       | Self-explanation can improve learning, but this does not establish equal effectiveness for all generative activities.                                                                              | [VERIFIED — RESEARCH] | MODERATE–HIGH       | EDU           | SRC-10                                     | Not direct L2; time/task moderators                                              |
| R1-F009                                                                                       | Comparative effectiveness of summarization, generated examples, prediction, concept maps, teaching-back, comparison and error explanation for VocabMaster remains mechanism- and task-dependent.   | [UNKNOWN]             | INSUFFICIENT        | L2-EN         | SRC-10                                     | No product-specific comparative evidence                                         |
| R1-F010                                                                                       | Memory scheduling, mastery estimation, diagnosis and transfer are distinct product constructs.                                                                                                     | [INFERENCE]           | HIGH                | L2/product    | SRC-26–30 + REP-05–09                      | Conceptual synthesis, not one experiment                                         |
| R1-F011                                                                                       | FSRS, BKT, DKT and IRT operationalize different quantities and their outputs are not interchangeable.                                                                                              | [VERIFIED — RESEARCH] | MODERATE            | EDU/modeling  | SRC-27–30                                  | Model validity depends on data/construct                                         |
| R1-F012                                                                                       | Cold-start personalized mastery/weakness claims require explicit uncertainty until sufficient relevant evidence exists.                                                                            | [INFERENCE]           | HIGH                | EDU/product   | F011 + REP-07                              | Exact calibration not established                                                |
| R1-F013                                                                                       | Receptive and productive lexical/collocational knowledge are distinct constructs.                                                                                                                  | [VERIFIED — RESEARCH] | HIGH                | L2-EN/L2      | SRC-11,SRC-13                              | Construct operationalization varies                                              |
| R1-F014                                                                                       | Incidental encounter frequency is positively but only moderately associated with L2 vocabulary learning and has major moderators.                                                                  | [VERIFIED — RESEARCH] | HIGH                | L2            | SRC-12                                     | Association, not simple exposure dose law                                        |
| R1-F015                                                                                       | Intentional vocabulary learning produces substantial immediate gains but material delayed attrition.                                                                                               | [VERIFIED — RESEARCH] | HIGH                | L2            | SRC-11                                     | Study/task heterogeneity                                                         |
| R1-F016                                                                                       | Translation, definitions, examples and imagery should be treated as learning scaffolds rather than independent retrieval evidence when they expose target information.                             | [INFERENCE]           | MODERATE–HIGH       | L2/product    | F005–07,F013                               | Optimal support mix unknown                                                      |
| R1-F017                                                                                       | L2 listening is multidimensional and a single comprehension score underspecifies the failure process.                                                                                              | [VERIFIED — RESEARCH] | MODERATE–HIGH       | L2            | SRC-14                                     | Construct review, not intervention trial                                         |
| R1-F018                                                                                       | Transcript-visible performance cannot isolate unaided auditory decoding.                                                                                                                           | [INFERENCE]           | HIGH                | L2/product    | F006,F017                                  | Does not imply transcripts are harmful                                           |
| R1-F019                                                                                       | The magnitude and durability of shadowing-specific gains across general listening and spontaneous speaking remain insufficiently established for a strong global-mastery claim.                    | [UNKNOWN]             | INSUFFICIENT        | L2            | targeted remediation audit                 | Practice may still be useful                                                     |
| R1-F020                                                                                       | Shadowing completion should not be used as general listening/speaking mastery evidence.                                                                                                            | [INFERENCE]           | HIGH                | L2/product    | F017–19 + REP-11                           | Targeted pronunciation evidence may differ                                       |
| R1-F021                                                                                       | Extensive reading has positive L2 reading effects.                                                                                                                                                 | [VERIFIED — RESEARCH] | HIGH                | L2            | SRC-15                                     | Long-term follow-up less abundant                                                |
| R1-F022                                                                                       | Very large speed increases without comprehension loss are unsupported; speed and comprehension trade off.                                                                                          | [VERIFIED — RESEARCH] | HIGH                | EDU/reading   | SRC-16                                     | Mostly general reading evidence                                                  |
| R1-F023                                                                                       | Written corrective feedback improves L2 grammatical accuracy under many conditions.                                                                                                                | [VERIFIED — RESEARCH] | HIGH                | L2            | SRC-17                                     | Accuracy ≠ full writing competence                                               |
| R1-F024                                                                                       | Peer feedback improves L2 writing on average, with greater effects on revision than novel composition.                                                                                             | [VERIFIED — RESEARCH] | HIGH                | L2            | SRC-18                                     | Mechanisms/context vary                                                          |
| R1-F025                                                                                       | The incremental transfer benefit of model texts to novel independent compositions remains conditional; model exposure itself is not mastery evidence.                                              | [UNKNOWN]             | INSUFFICIENT        | L2            | targeted remediation audit + F024          | Direct model-text literature heterogeneous                                       |
| R1-F026                                                                                       | After target-revealing writing feedback/model exposure, later unassisted writing is needed for a stronger independent-mastery claim.                                                               | [INFERENCE]           | HIGH                | L2/product    | F007,F023–25                               | Exact delay/task similarity unknown                                              |
| R1-F027                                                                                       | Planning, revision and repeated writing should not be assumed to improve accuracy, fluency, cohesion, argument quality and transfer equally.                                                       | [INFERENCE]           | MODERATE            | L2/product    | F023–24 + bounded targeted studies         | Dimension-specific evidence                                                      |
| R1-F028                                                                                       | Durable L2 transfer from sentence-combining as a standalone VocabMaster mechanic was not established in this remediation.                                                                          | [UNKNOWN]             | INSUFFICIENT        | L2-EN         | targeted audit                             | Does not imply ineffectiveness                                                   |
| R1-F029                                                                                       | Pronunciation instruction is clearest for targeted monitored features; global spontaneous gains are less certain.                                                                                  | [VERIFIED — RESEARCH] | MODERATE–HIGH       | L2            | SRC-19                                     | Measurement strongly changes observed effect                                     |
| R1-F030                                                                                       | Rehearsed/repeated oral performance should not automatically be interpreted as spontaneous speaking transfer.                                                                                      | [INFERENCE]           | HIGH                | L2/product    | F029,F043                                  | Task-familiarity contribution may be large                                       |
| R1-F031                                                                                       | Durable causal benefit of self-recording/playback alone for spontaneous L2 speaking remains insufficiently established.                                                                            | [UNKNOWN]             | INSUFFICIENT        | L2            | targeted audit                             | Useful self-monitoring mechanism still plausible                                 |
| R1-F032                                                                                       | Formulaic-sequence practice may support some fluency dimensions, but a general durable-speaking-mastery effect is not established here.                                                            | [UNKNOWN]             | INSUFFICIENT        | L2            | targeted audit                             | Fluency dimensions and proficiency matter                                        |
| R1-F033                                                                                       | Classroom oral corrective feedback produces durable L2 gains; optimal mode/timing remains conditional.                                                                                             | [VERIFIED — RESEARCH] | MODERATE–HIGH       | L2            | **SRC-20,SRC-33**                          | Age, treatment, task, CF type and timing operationalization moderate conclusions |
| R1-F034                                                                                       | Adaptive learning can improve outcomes on average but is heterogeneous and depends on valid adaptation.                                                                                            | [VERIFIED — RESEARCH] | MODERATE            | EDU           | SRC-21                                     | Bundled interventions; not direct L2                                             |
| R1-F035                                                                                       | Error recurrence is useful evidence of a persistent problem but cannot by itself identify its causal linguistic mechanism.                                                                         | [INFERENCE]           | HIGH                | L2/product    | REP-09 + F017,F023                         | Requires diagnosis rather than count alone                                       |
| R1-F036                                                                                       | Competence, autonomy and relatedness support are associated with more self-determined student motivation; competence is especially important in the education meta-analysis.                       | [VERIFIED — RESEARCH] | HIGH for motivation | EDU           | SRC-22                                     | Primarily correlational; not L2 mastery                                          |
| R1-F037                                                                                       | Implementation intentions/stable cue planning can improve goal attainment; no universal time-based versus routine-based cue superiority is established.                                            | [VERIFIED — RESEARCH] | MODERATE            | OTHER         | SRC-23–24                                  | Non-language behavioral evidence                                                 |
| R1-F038                                                                                       | Reducing initiation friction and coupling study to stable cues is a plausible initiation strategy, not evidence that the resulting study is pedagogically high quality.                            | [INFERENCE]           | MODERATE            | OTHER→product | F037                                       | Durable L2 outcome not demonstrated                                              |
| R1-F039                                                                                       | Challenge-skill balance may be relevant to engagement/flow, but this remediation did not establish it as a durable language-mastery optimization rule.                                             | [UNKNOWN]             | INSUFFICIENT        | L2-EN         | targeted audit                             | Flow ≠ learning                                                                  |
| R1-F040                                                                                       | Gamification effects are heterogeneous; engagement, behavior and learning outcomes must be distinguished.                                                                                          | [VERIFIED — RESEARCH] | MODERATE            | EDU           | SRC-25                                     | Mechanic combinations differ                                                     |
| R1-F041                                                                                       | A causal durable-English-learning benefit from preserving streaks is not established.                                                                                                              | [UNKNOWN]             | INSUFFICIENT        | L2-EN         | targeted audit + REP-14                    | Engagement evidence is insufficient                                              |
| R1-F042                                                                                       | Microlearning is not established as intrinsically superior to pedagogically equivalent longer practice for durable English mastery.                                                                | [UNKNOWN]             | INSUFFICIENT        | L2-EN         | targeted audit                             | Existing draft evidence too narrow/heterogeneous                                 |
| R1-F043                                                                                       | Retrieval-practice transfer is positive on average but substantially conditional rather than automatic.                                                                                            | [VERIFIED — RESEARCH] | HIGH                | MEM/EDU       | SRC-26                                     | Transfer-task relation matters                                                   |
| R1-F044                                                                                       | A defensible product learning loop is attempt → evidence classification → diagnosis → remediation → independent retry → mastery update → delayed/varied transfer evidence → scheduling/adaptation. | [INFERENCE]           | HIGH                | L2/product    | F001,F007,F010,F034,F035,F043              | Exact pipeline not directly trialed                                              |
| R1-F045                                                                                       | Current `mastered` should be semantically scoped to its FSRS stability basis unless broader independent transfer evidence is added.                                                                | [INFERENCE]           | HIGH                | product       | REP-05 + F010,F043                         | Does not invalidate FSRS stability                                               |

**Registry freeze:** `R1-F001` through `R1-F045` remain frozen. The source-provenance correction changed support mappings only where necessary; it did not alter finding identity or semantics.

---

## 3. Current VocabMaster Learning-System Baseline

[VERIFIED — REPOSITORY] Current scheduling uses `ts-fsrs`, declares `FSRS_VERSION = 6`, maintains five scheduler lanes—`recognition`, `recall`, `listening`, `collocation`, `production`—and defaults to `requestRetention: 0.9`. Required skills vary with card type/learning goal. `mastered` is assigned when all required skill states have been reviewed and each reaches stability of at least 60 days.

[INFERENCE] That implementation provides useful multidimensional **memory scheduling**, but `mastered` has a narrower evidential meaning than “the learner can use this language accurately, spontaneously and transferably in authentic contexts” (R1-F045).

[VERIFIED — REPOSITORY] `EvidencePolicy` operates as a default-deny evidence gateway. Reveals, hints, transcript viewing, exposed corrections, retries after exposure, coaching, and answer exposure prevent the affected attempt from mutating the schedule. Dictation explicitly separates transcript-source and spelling-only errors; production/retell additionally require persisted learner output, verified evaluation and evidence that the target was actually used. IELTS objective-item evidence is prevented from entering the core-card scheduling pathway.

[INFERENCE] This is strongly aligned with R1-F007 and should be preserved as an evidence-integrity invariant.

[VERIFIED — REPOSITORY] `WeaknessProfile` derives per-skill failure rates from qualified canonical evidence; zero/one-sample data are insufficient, conflicting canonical observations make the profile insufficient, and every current profile explicitly carries `uncertainty:'high'` with `UNCALIBRATED_MINIMUM_POLICY`.

[VERIFIED — REPOSITORY] Targeted diagnostics rank observed weak skills by failure rate and failure count, require at least two observed weak skills, and require at least two questions for each selected weak skill.

[INFERENCE] This is legitimate targeted adaptation but not yet a calibrated knowledge-component/item model; R1-F012 therefore supports retaining explicit uncertainty.

[VERIFIED — REPOSITORY] Error records preserve normalized target identity, sense/skill/source, learner and expected responses, recurrence, correction attempts and successful corrections. Successful correction requires target-bound independently qualified evidence; repair queues prioritize unresolved/recurring errors.

[INFERENCE] Recurrence is a strong prioritization signal, but it cannot identify whether the root cause is lexical, grammatical, acoustic, segmentation-related, task-strategy-related, or something else (R1-F035).

[VERIFIED — REPOSITORY] Lexical capture differentiates `same-sense` from `same-lemma`, persists a `senseId`, distinguishes word/collocation types and stores multiple source occurrences/context.

[VERIFIED — REPOSITORY] The V10 sentence loop sequences listening → dictation → correction → noticing → shadowing → vocabulary → retell; hides the transcript in first-pass listening; keeps strict dictation answers unavailable before submission; separates error categories; exposes weak forms/noticing after correction; and labels shadowing `COACHING ONLY`, with recording and playback but no FSRS review.

[VERIFIED — REPOSITORY] Today's plan combines due FSRS items, modeled retrievability/overdue priority, new-card coaching, recurring-error repairs and other learning/content activities. New introductions are explicitly non-scheduling coaching.

[VERIFIED — REPOSITORY] Productive writing self-review persists a learner's review/feedback artifacts but returns `affectsSchedule:false`; it therefore does not masquerade as independent writing mastery.

[VERIFIED — REPOSITORY] Progress logic calculates activity streaks from unassisted learning evidence, skill coverage, and a `knowledge strength` value from mean FSRS retrievability. `summarizeCalibration()` compares predicted retrievability with observed review success; it is calibration of the memory prediction, not learner metacognitive confidence.

The corrected baseline conclusion remains:

[INFERENCE] **VocabMaster already has a comparatively strong evidence-integrity and memory substrate; its main R1 research gap is not “add spaced repetition,” but prevent memory scheduling, broad mastery, diagnosis and transfer from being semantically collapsed.**

---

## 4. Learning Science Foundations

### Retrieval, spacing and productive difficulty

R1-F001 is strongly retained. In Roediger and Karpicke's experiments, repeated study could improve immediate performance while retrieval produced better delayed retention, illustrating the difference between short-term performance and learning. Rowland's meta-analysis independently supports the testing effect, with stronger benefits for recall-oriented tests than recognition-only tests.

R1-F001 also rejects a simplistic “harder is always better” interpretation. Retrieval failure without corrective information does not magically produce a correct representation; successful retrieval or corrective feedback after failure is materially important.

[INFERENCE] VocabMaster should therefore target **productive difficulty**, not maximum failure: sufficiently difficult to demand retrieval/discrimination, sufficiently supported to permit correction, followed by later independent evidence.

R1-F002 is likewise retained. Cepeda and colleagues demonstrated that the useful interstudy gap changes with the desired final retention interval, while Kim and Webb's direct L2 synthesis found a medium-to-large spacing advantage and no reliable overall superiority of expanding versus equal schedules.

[UNKNOWN] R1-F003 remains deliberately unresolved. `0.90` is a legitimate scheduler parameter in current code, but no source audited here establishes it as a universal law of English acquisition.

### Interleaving

Brunmair and Richter synthesized 59 studies, 238 effects and 158 samples and estimated an overall interleaving benefit around `g ≈ .42`, but material type was decisive; verbal-word materials could favor blocking.

[INFERENCE] R1-F004 therefore supports **purposeful discrimination-driven interleaving**, for example near-synonyms, easily confused structures or perceptually similar forms, rather than random variety for its own sake.

### Multimedia, cognitive load and expertise

Generic multimedia/cognitive-load research supports reducing avoidable processing load: segment complex procedures, avoid forcing learners to mentally integrate separated essential information, remove genuinely unnecessary redundancy, and adjust guidance to learner expertise. The source basis is now decomposed deterministically rather than represented by the previous composite SRC-07: segmentation is supported by Mayer and Fiorella; split attention by Ayres and Sweller; redundancy by Kalyuga and Sweller; expertise reversal by Kalyuga. Cambridge's official records confirm the distinct chapter authors, page ranges, and chapter DOIs. ([Cambridge](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-managing-essential-processing-in-multimedia-learning/A9E77D0172F905AC957689D1771E2888 "Principles for Managing Essential Processing in Multimedia Learning (Chapter 19) - The Cambridge Handbook of Multimedia Learning"))

R1-F005 remains **EDU**, not direct language-learning evidence. It therefore does **not** prove that a particular VocabMaster transcript, translation, image or definition arrangement is optimal.

Direct L2 evidence changes the interpretation of “redundancy.” Captioned video can improve L2 listening/vocabulary learning, so written text that would be redundant for a fluent native listener may provide lexical/segmentation support to an L2 learner.

[INFERENCE] For transcript + audio, translation + definition, examples, images and simultaneous explanations, the defensible requirement is **layering and progressive reveal**, not a universal ban on multimedia. A support can be instructionally useful while still changing what the current attempt measures (R1-F006–R1-F007).

### Generative learning

Bisra and colleagues' meta-analysis supports self-explanation as a generally positive learning strategy, but the literature contains meaningful task, prior-knowledge and time-on-task dependencies.

[VERIFIED — RESEARCH] R1-F008: self-explanation has credible general-education evidence.

[UNKNOWN] R1-F009: this does **not** establish that summarization, learner-generated examples, retrieval-generated examples, concept mapping, teaching-back, prediction-before-reveal, comparison and error explanation are equally effective or equally cost-effective for VocabMaster learners.

[INFERENCE] Generative activity should be used when it requires useful reconstruction/explanation and when the learner has enough prerequisite knowledge to produce something better than guesswork. Activity completion itself is not mastery.

---

## 5. Learner Modeling & Mastery

The draft was directionally correct that learner models answer different questions, but the revised report removes any implication that R1 should select one.

Official FSRS documentation frames memory in terms of Difficulty, Stability and Retrievability; the current VocabMaster implementation likewise uses FSRS as a forgetting/review scheduler. That scope is narrower than a general model of language competence.

Classic BKT was introduced to estimate latent procedural-skill acquisition from sequential learner responses under probabilistic assumptions. DKT instead demonstrated recurrent-neural sequence modeling that improved future-response prediction without the same hand-specified latent-state structure.

IRT, by contrast, places person ability and item difficulty on a common latent scale and is fundamentally an assessment/measurement family rather than a forgetting scheduler.

Hence R1-F011:

[VERIFIED — RESEARCH] **FSRS, BKT, DKT and IRT do not estimate interchangeable constructs simply because each can output probabilities or scores.**

The product implication is R1-F010:

[INFERENCE] A defensible conceptual decomposition is:

`memory state → what is likely to be forgotten?`

`skill/mastery state → what can the learner independently do?`

`diagnostic state → why did performance fail?`

`transfer state → does capability survive novel conditions?`

No technology or algorithm selection follows from this finding.

### Uncertainty and cold start

[INFERENCE] R1-F012: low evidence volume must produce low-confidence personalized claims, not fabricated certainty.

This is directly compatible with current `WeaknessProfile`, which treats very small samples and conflicting records as insufficient and exposes high uncertainty rather than silently declaring weakness/mastery.

### Forgetting versus misunderstanding

[INFERENCE] A learner missing a formerly stable word after a long gap, repeatedly applying the wrong grammatical rule immediately after correction, misunderstanding a particular lexical sense, failing only acoustic segmentation, and succeeding only on rehearsed items are not observationally equivalent failures.

R1 does not claim that these classes can already be inferred reliably. It claims only that they must not be semantically collapsed into a single “low FSRS / weak learner” explanation.

---

## 6. Vocabulary & Collocation Learning

Webb, Yanagisawa and Uchihara synthesized 100 effects from 22 intentional-vocabulary studies. Their reported means show substantial immediate learning but marked delayed attrition: roughly 60.1% immediate versus 39.4% delayed for meaning recall and 58.5% versus 25.1% for form recall.

R1-F015 therefore rejects “success during acquisition = durable word mastery.”

For incidental vocabulary, Uchihara, Webb and Yanagisawa synthesized 45 effects from 26 studies involving 1,918 learners and found only a moderate relationship, about `r = .34`, between encounter frequency and learning; effects vary with learner characteristics, spacing, visual support, engagement and test format.

Thus R1-F014 rejects both extremes:

[VERIFIED — RESEARCH] repeated encounters matter;

[INFERENCE] merely increasing exposure count cannot define an evidence-based learning loop.

Receptive/productive collocation research also finds that the two constructs are distinguishable rather than interchangeable.

The retained lexical requirement is consequently multidimensional:

`form recognition`

`form → meaning`

`meaning → form`

`listening recognition`

`spelling/form precision`

`sense discrimination`

`collocational knowledge`

`productive contextual use`

No claim is made that every lexical item needs every dimension.

[VERIFIED — REPOSITORY] VocabMaster already has useful prerequisites: `senseId`, explicit same-sense/same-lemma distinctions, collocation identity and source-context persistence.

[INFERENCE] R1-F016: translation, definitions, imagery and examples may support encoding/comprehension but should not let the same aided attempt establish independent retrieval.

---

## 7. Listening Learning

Aryadoust and Luo's systematic review examined 157 papers and catalogued a large set of listening subskills, cognitive processes and attributes. The important R1 conclusion is not any specific taxonomy count; it is that L2 listening is structurally multidimensional.

A product should conceptually distinguish at least:

`acoustic/phonological perception`

`connected-speech segmentation`

`lexical recognition`

`local syntactic/semantic integration`

`discourse/inference comprehension`.

[INFERENCE] These are candidate diagnostic dimensions, not claims that current telemetry can already estimate each reliably.

### Transcript and caption access

Captioned-video evidence supports captions as an L2 learning scaffold.

That evidence does **not** imply that performance with the words visible measures the same construct as unaided listening.

R1-F018 therefore remains:

[INFERENCE] `audio only → possible independent auditory evidence`

`caption/transcript visible → scaffolded audiovisual evidence`

`audio after transcript exposure → useful practice but contaminated as a first-pass decoding measurement`

`later novel audio without text → stronger transfer evidence`.

[UNKNOWN] No universal transcript reveal delay was established.

### Dictation

[INFERENCE] Dictation becomes diagnostically useful when the system distinguishes at least “did not hear,” “misheard/segmented,” “wrong lexical form,” “word-form error,” “spelling only” and “source transcript error.”

[VERIFIED — REPOSITORY] Current VocabMaster already performs a material subset of this distinction and prevents spelling-only/source-transcript errors from automatically becoming listening schedule evidence.

### Shadowing, self-recording and playback

The earlier draft stated shadowing benefits too broadly. This remediation narrows the conclusion.

[UNKNOWN] R1-F019: the durable transfer from shadowing to general listening and spontaneous speaking is not strong enough in this bounded evidence package for a general-mastery claim.

[UNKNOWN] R1-F031: self-recording/playback is intuitively useful for self-monitoring, and current V10 supports it, but this remediation did not establish a high-quality direct causal basis for treating self-recording alone as durable spontaneous-speaking improvement.

[INFERENCE] R1-F020: current `COACHING ONLY` handling of shadowing is therefore conservative and defensible.

---

## 8. Reading Learning

Nakanishi's meta-analysis remains one of the strongest direct L2 findings retained from the draft: 34 studies, 43 effect sizes and 3,942 participants; controlled-group contrasts were approximately `d = .46`, while pre/post contrasts were approximately `d = .71`.

[VERIFIED — RESEARCH] R1-F021: extensive reading belongs in the evidence-based learning repertoire; R1 does not prescribe a particular implementation.

Reading speed requires a different conclusion. Rayner and colleagues' major review finds a real speed–accuracy/comprehension trade-off and rejects claims that readers can simply double or triple normal reading speed without meaningful comprehension cost. Skimming is legitimate precisely because it accepts reduced detail when that trade-off matches the task.

[INFERENCE] A timed-reading feature can be pedagogically defensible only if it preserves a comprehension criterion. Words-per-minute alone must not become “reading mastery.”

Annotations, summaries and elaborative prompts may be useful, but R1-F009 applies: activity names do not establish equivalent generative-learning effects.

---

## 9. Writing Learning

Kang and Han's meta-analysis of 21 primary studies supports written corrective feedback for improving L2 grammatical accuracy, with moderation by learner proficiency, setting and genre.

R1-F023 is intentionally narrow: **grammatical accuracy**, not “complete writing ability.”

Vuogan and colleagues' meta-analysis across 26 studies estimated an overall peer-feedback effect of `d = .73` with 95% CI `.54–.92`. More importantly for product semantics, effects were stronger for revisions than for new compositions.

That pattern strongly supports separating:

`successful revision of corrected text`

from

`independent transfer to a new composition`.

### Feedback and self-correction

[INFERENCE] A stronger learning cycle is:

`initial independent draft → feedback → learner analysis/self-correction → revision → later new prompt`.

The feedback itself can be valuable. It simply cannot simultaneously be the evidence that the learner independently knew what was revealed.

### Model answers

The prior draft's categorical support for model texts is downgraded.

[UNKNOWN] R1-F025: the degree to which model-text exposure transfers to novel independent writing is conditional and not established strongly enough here to warrant a global product claim.

[INFERENCE] R1-F026: after target-revealing model/feedback exposure, a later clean task is required before making a strong independent-writing claim.

### Planning, organization, cohesion and argument development

The targeted remediation found mixed/dimension-specific planning and repetition results rather than a universal improvement mechanism.

[INFERENCE] R1-F027: planning, repeated rewriting and revision should not be assumed to improve fluency, grammatical accuracy, lexical sophistication, paragraph cohesion and argument development equally.

[UNKNOWN] R1-F028: this remediation did not find sufficiently strong direct L2 evidence to elevate sentence combining into a foundational VocabMaster requirement. This is **not** evidence that sentence combining is ineffective; it is a refusal to manufacture certainty from a thin direct evidence base.

---

## 10. Speaking & Pronunciation Learning

Saito and Plonsky re-examined 77 L2 pronunciation-instruction studies with explicit attention to what outcome instruments actually measured. Instruction was clearest when learners produced specifically targeted segmental/suprasegmental features under monitored conditions; the evidence was substantially less clear for subjective global measures of spontaneous pronunciation.

The official Wiley record confirms the authorship as **Kazuya Saito and Luke Plonsky**, the 2019 publication in *Language Learning*, volume 69, pages 652–708, and DOI `10.1111/lang.12345`. ([Thư viện trực tuyến Wiley](https://onlinelibrary.wiley.com/doi/10.1111/lang.12345?utm_source=chatgpt.com "Effects of Second Language Pronunciation Teaching Revisited: A Proposed Measurement Framework and Meta‐Analysis - Saito - 2019 - Language Learning - Wiley Online Library"))

This directly supports R1-F029 and the distinction:

`targeted pronunciation practice`

≠

`global spontaneous speaking competence`.

### Comprehensibility, intelligibility and accent

[INFERENCE] Pronunciation product outcomes should be construct-specific. A system must not treat “sounds less accented,” “understood correctly,” and “easy to understand” as interchangeable labels unless the underlying assessment actually measures those constructs.

R1 does not select a pronunciation/ASR evaluator.

### Dialogue, role-play, monologue and spontaneous production

[UNKNOWN] The remediation did not establish that any single interaction format—dialogue, role-play or monologue—is intrinsically superior across all speaking outcomes.

[INFERENCE] The consequential distinction is evidence condition:

`rehearsed/same-task production → useful practice evidence`

`parallel task → stronger generalization evidence`

`novel spontaneous production → stronger transfer evidence`.

### Task repetition and formulaic sequences

[INFERENCE] R1-F030 preserves the safe conclusion: same-task improvement is not sufficient evidence of spontaneous transfer.

[UNKNOWN] R1-F032 preserves uncertainty about the magnitude of durable general speaking gains caused specifically by formulaic-sequence practice.

### Oral corrective feedback

Lyster and Saito's classroom meta-analysis covered 15 studies and 827 learners and found significant durable effects of oral corrective feedback; prompts generally produced larger effects than recasts, and gains were particularly visible on freely constructed responses.

For timing specifically, the previously unregistered source is now explicitly registered as SRC-33. Li, Ou and Lee's *Language Teaching* Research Timeline documents that “immediate” and “delayed” corrective feedback have been operationalized differently across L2 studies. Cambridge lists Shaofeng Li, Ling Ou and Icy Lee as the authors; the article appears in Volume 59, Issue 1, January 2026, pp. 29–45, DOI `10.1017/S0261444824000478`, and was first published online on January 27, 2025. ([Cambridge](https://www.cambridge.org/core/journals/language-teaching/article/timing-of-corrective-feedback-in-second-language-learning/0E8856852D0183E9DD91EDB4C249E245 "The timing of corrective feedback in second language learning | Language Teaching | Cambridge Core"))

[VERIFIED — RESEARCH] R1-F033 therefore supports corrective feedback, **not** “always interrupt immediately.”

---

## 11. Diagnostic, Adaptive & Error-Driven Learning

Wang and colleagues' 2024 meta-analysis identified 45 independent studies of AI-enabled adaptive learning. Its central relevance to R1 is positive average efficacy coupled with material moderation by learner level, setting, duration and adaptation design.

The word **AI** in that literature grants no technology authority here. R1-F034 concerns the general proposition that valid adaptation can improve learning.

[INFERENCE] Personalization can fail when either half of the chain fails:

`wrong learner inference → inappropriate adaptation`

or

`correct learner inference → pedagogically weak action`.

### Error-driven learning

[VERIFIED — REPOSITORY] VocabMaster already captures recurrence, latest occurrence, corrections and independent resolution evidence.

[INFERENCE] R1-F035: recurrence says **“this problem persists”** more reliably than it says **“this is why it persists.”**

A repeated failure should therefore increase diagnostic priority, while causal classification remains uncertain until better evidence distinguishes, for example:

`memory lapse`

`wrong lexical sense`

`phonological discrimination`

`segmentation`

`grammar representation`

`form retrieval`

`collocation`

`task strategy`

`insufficient evidence`.

### Target learning loop

R1-F044 is the final technology-neutral synthesis:

```
ATTEMPT
   ↓
EVIDENCE CLASSIFICATION
   ├─ independent
   └─ assisted/coaching
   ↓
DIAGNOSIS
   ↓
TARGETED REMEDIATION
   ↓
GUIDANCE FADING
   ↓
INDEPENDENT RETRY
   ↓
CONSTRUCT-SPECIFIC MASTERY UPDATE
   ↓
DELAYED / VARIED TRANSFER EVIDENCE
   ↓
MEMORY SCHEDULING + FUTURE ADAPTATION
```

[INFERENCE] This loop is supported by convergent evidence, not by one trial of the exact OmniIELTS pipeline. Its strongest invariant is epistemic: **remediation may cause learning; the later independent retry establishes whether capability is now available without the remediation.**

---

## 12. Motivation, Habit & Sustainable Engagement

Bureau and colleagues synthesized 144 samples and more than 79,000 students. Need satisfaction and autonomy support were associated with self-determined motivation, with competence especially strongly related to autonomous motivation in education. The authors caution that much of the evidence is correlational.

[VERIFIED — RESEARCH] R1-F036 therefore supports competence/autonomy/relatedness-sensitive motivation design.

[INFERENCE] It does **not** establish that a particular app mechanic causes durable English mastery.

### Implementation intentions and stable cues

Gollwitzer and Sheeran's meta-analysis of implementation intentions found a substantial effect on goal attainment across 94 independent tests.

The previous additional clause that implementation intentions “work with, rather than replace, underlying goals” has been **removed** from the report because the exact extra body citation used for that wording was not independently necessary to R1-F037 and was not registered deterministically. No finding semantics depend on that removed sentence.

Keller and colleagues' 84-day randomized habit-formation study found no clear superiority of routine-based versus time-based cue planning; repeated plan enactment was central to developing automaticity. The population concerned health behavior rather than language learning.

Therefore:

[VERIFIED — RESEARCH] R1-F037 applies to **behavior initiation/goal attainment** in `OTHER`, not durable L2 mastery.

[INFERENCE] R1-F038: a low-friction Today entry point, stable routine cue or reminder may help someone **start studying**. The educational validity of what they then do must be evaluated separately.

This explicitly separates:

`initiation`

`engagement`

`persistence`

`learning`

`durable language mastery`.

### Goal setting and prompts

[INFERENCE] Goals should be concrete enough to support initiation and progress evaluation, but “set a goal” cannot compensate for low-value learning tasks.

[UNKNOWN] No universal reminder cadence or implementation-intention format for English learning was established.

### Challenge-skill balance

[UNKNOWN] R1-F039: challenge-skill balance may matter for flow/engagement, but this remediation found no basis for treating a “flow” optimum as a durable-language-learning optimum.

### Gamification and streaks

Sailer and Homner's learning-gamification synthesis reports positive average effects with significant heterogeneity across cognitive, motivational and behavioral outcomes.

R1-F040 therefore preserves the narrower statement:

[VERIFIED — RESEARCH] gamification can affect outcomes;

[INFERENCE] a usage/engagement improvement is not automatically evidence of language learning.

[VERIFIED — REPOSITORY] Current VocabMaster streaks are derived from days containing unassisted learning evidence rather than simple app opens, which is a comparatively conservative substrate.

[UNKNOWN] R1-F041: the causal effect of streak preservation on durable English mastery remains unestablished.

### Microlearning

The draft's very large microlearning effect estimate was not retained as a load-bearing quantitative finding because its evidence base was small and heterogeneous.

[UNKNOWN] R1-F042: short sessions may reduce initiation cost and suit retrieval practice; they are not established as intrinsically superior to equivalent longer study.

Authentic extended reading, composition, monologue/dialogue and IELTS-like tasks impose minimum durations that cannot be compressed without changing the construct practiced.

---

## 13. Transfer & Authentic Performance

R1 uses five different terms deliberately:

| State                | Meaning                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| Activity completion  | The learner completed a workflow.                                                     |
| Observed performance | A response was observed under specified conditions.                                   |
| Learning             | Capability changed beyond momentary task support.                                     |
| Durable capability   | Performance survives a meaningful delay without target-revealing support.             |
| Transfer             | Performance survives material novelty in items, contexts, speakers, prompts or tasks. |

Pan and Rickard's transfer meta-analysis found an overall test-enhanced-learning transfer effect around `d = .40` with 95% CI approximately `.31–.50`, across 192 effects, 122 experiments, 67 articles and 10,382 participants. Transfer varied systematically according to relationships between practice and transfer conditions.

Therefore R1-F043 is:

[VERIFIED — RESEARCH] transfer exists on average;

**not**

“anything learned on a practiced item automatically transfers.”

[INFERENCE] Evidence becomes more persuasive as it survives relevant combinations of:

`delay`

`novel content`

`novel context`

`novel speaker`

`novel prompt`

`reduced scaffolding`

`different task/modality`.

The exact combination depends on the construct. A vocabulary flashcard does not need every transfer dimension, while a broad claim such as “speaking mastery” demands substantially broader evidence.

This distinction also supports keeping IELTS task performance isolated from general-English claims: familiarity with a constrained task is evidence about that task first.

---

## 14. Product Learning Loop Model

R1-F044 is the canonical integrated model.

The model has four independent evidence questions:

| Layer         | Question                                                         |
| ------------- | ---------------------------------------------------------------- |
| **Memory**    | How retrievable/stable is this target likely to be now?          |
| **Mastery**   | What can this learner independently perform?                     |
| **Diagnosis** | What explains the observed failure strongly enough to act on it? |
| **Transfer**  | Does performance persist under materially changed conditions?    |

[INFERENCE] Assistance can modify the learner's state without qualifying the aided performance as independent evidence. This is the reason guidance fading and clean retry belong in the loop, rather than a reason to avoid assistance.

[VERIFIED — REPOSITORY] Current EvidencePolicy already enforces much of this distinction at schedule-mutation time.

[INFERENCE] Future learner modeling should preserve uncertainty at every layer rather than turning missing evidence into false precision.

No algorithm, model, provider or storage design is selected by this conceptual model.

---

## 15. VocabMaster Capability Gap Matrix

`Epistemic Status` identifies the canonical proposition represented by the row ID. Product recommendations inside the table are separately and explicitly `[INFERENCE]`.

| ID      | Learning Requirement                                      | Evidence                        | Current Capability                                  | Gap                                                                           | Recommendation                                                                                                   | Priority | Evidence Strength   | Epistemic Status      |
| ------- | --------------------------------------------------------- | ------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- | ------------------- | --------------------- |
| R1-F001                                                                                                    | Delayed retrieval rather than passive restudy             | SRC-01–03                       | FSRS review + qualified independent attempts        | Not every learning activity necessarily returns to clean retrieval            | **[INFERENCE]** Preserve independent retrieval as core memory evidence                                           | P0 | HIGH                | [VERIFIED — RESEARCH] |
| R1-F002                                                                                                    | Distributed delayed practice                              | SRC-04–05                       | FSRS scheduler                                      | Scheduler parameter ≠ scientifically universal mastery threshold              | **[INFERENCE]** Preserve FSRS scheduling while constraining semantics                                            | P0 | HIGH                | [VERIFIED — RESEARCH] |
| R1-F003                                                                                                    | Honest retention-target semantics                         | No universal optimum            | `requestRetention:0.9`                              | Risk of interpreting policy parameter as learning law                         | **[INFERENCE]** Treat target as product/scheduling policy pending empirical optimization                         | P1 | INSUFFICIENT        | [UNKNOWN]             |
| R1-F004                                                                                                    | Interleave where discrimination is the learning objective | SRC-06                          | No verified discrimination-aware interleaving layer | Random mixing can add load without useful contrast                            | **[INFERENCE]** Introduce only for justified confusable categories                                               | P2 | MODERATE–HIGH       | [VERIFIED — RESEARCH] |
| R1-F005                                                                                                    | Manage multimedia cognitive load                          | **SRC-07,SRC-08,SRC-31,SRC-32** | Multiple support types exist                        | Simultaneous support can create unnecessary processing                        | **[INFERENCE]** Layer/segment supports and adapt amount of guidance                                              | P1 | MODERATE–HIGH       | [VERIFIED — RESEARCH] |
| R1-F007                                                                                                    | Separate scaffold from independent evidence               | F001,F005,F006; REP-06          | Strong EvidencePolicy                               | Must remain invariant as new activities appear                                | **[INFERENCE]** Preserve default-deny assistance provenance                                                      | P0 | HIGH                | [INFERENCE]           |
| R1-F010                                                                                                    | Separate memory/mastery/diagnosis/transfer                | SRC-26–30                       | Partial separate substrates                         | Product semantics can still collapse constructs                               | **[INFERENCE]** Keep explicit conceptual layers                                                                  | P0 | HIGH                | [INFERENCE]           |
| R1-F012                                                                                                    | Uncertainty-aware adaptation                              | F011; REP-07                    | `uncertainty:'high'`; insufficiency handling        | Not quantitatively calibrated                                                 | **[INFERENCE]** Preserve uncertainty and avoid strong claims from sparse evidence                                | P0 | HIGH                | [INFERENCE]           |
| R1-F013                                                                                                    | Multidimensional lexical evidence                         | SRC-11,SRC-13                   | Five skill lanes + sense identity                   | Lanes do not exhaust form/meaning/use/transfer                                | **[INFERENCE]** Never treat recognition as full lexical mastery                                                  | P0 | HIGH                | [VERIFIED — RESEARCH] |
| R1-F016                                                                                                    | Scaffolds must not substitute for clean retrieval         | F005–07,F013                    | Assistance provenance exists                        | New support types may bypass intended semantics                               | **[INFERENCE]** Treat target-revealing translation/definition/example support as coaching for affected construct | P0 | MODERATE–HIGH       | [INFERENCE]           |
| R1-F017                                                                                                    | Separate listening failure processes                      | SRC-14                          | Dictation/error classes + noticing                  | Taxonomy remains coarse                                                       | **[INFERENCE]** Preserve decoding/comprehension distinction and uncertainty                                      | P1 | MODERATE–HIGH       | [VERIFIED — RESEARCH] |
| R1-F018                                                                                                    | Transcript-visible ≠ audio-only evidence                  | F006,F017                       | Transcript exposure blocks schedule evidence        | Exact reveal sequence unvalidated                                             | **[INFERENCE]** Preserve rule; empirically evaluate reveal sequencing later                                      | P0 | HIGH                | [INFERENCE]           |
| R1-F020                                                                                                    | Shadowing is coaching, not general mastery                | F017–19                         | Already coaching-only                               | None foundational                                                             | **[INFERENCE]** Preserve non-mastery semantics                                                                   | P0 | HIGH                | [INFERENCE]           |
| R1-F021                                                                                                    | Sustained extensive reading                               | SRC-15                          | Reading/content capabilities exist                  | A verified sustained ER loop is not established                               | **[INFERENCE]** Keep extensive reading as a product-learning requirement alongside intensive tasks               | P1 | HIGH                | [VERIFIED — RESEARCH] |
| R1-F022                                                                                                    | Fluency cannot ignore comprehension                       | SRC-16                          | No conflicting current fact verified                | Future speed metrics could mislead                                            | **[INFERENCE]** Require comprehension floor for reading-speed claims                                             | P0 | HIGH                | [VERIFIED — RESEARCH] |
| R1-F026                                                                                                    | Clean writing after target-revealing feedback             | F007,F023–25                    | Self-review is non-scheduling                       | No broad independent post-feedback mastery pathway verified                   | **[INFERENCE]** Require later unassisted/new-prompt evidence for strong claims                                   | P1 | HIGH                | [INFERENCE]           |
| R1-F029                                                                                                    | Construct-valid pronunciation evidence                    | SRC-19                          | Pronunciation/shadowing coaching                    | Global spontaneous mastery measure not verified                               | **[INFERENCE]** Report only the pronunciation construct actually evaluated                                       | P1 | MODERATE–HIGH       | [VERIFIED — RESEARCH] |
| R1-F030                                                                                                    | Rehearsal distinct from spontaneous speaking              | F029,F043                       | Retell/production substrate                         | General transfer evidence limited                                             | **[INFERENCE]** Progress from rehearsed to parallel/novel speaking before broad mastery claims                   | P1 | HIGH                | [INFERENCE]           |
| R1-F034                                                                                                    | Adapt only from valid evidence                            | SRC-21                          | Today priority + targeted diagnostics               | Adaptation still coarse                                                       | **[INFERENCE]** Condition stronger adaptation on adequate evidence/calibration                                   | P1 | MODERATE            | [VERIFIED — RESEARCH] |
| R1-F035                                                                                                    | Recurrence requires diagnosis, not blind repetition       | REP-09                          | Recurrence-ranked repair queue                      | Root-cause inference coarse                                                   | **[INFERENCE]** Vary remediation/context when recurrence persists                                                | P1 | HIGH                | [INFERENCE]           |
| R1-F036                                                                                                    | Motivation should support competence/autonomy             | SRC-22                          | Progress/streak surface                             | Progress may overemphasize activity/memory                                    | **[INFERENCE]** Prefer meaningful competence signals to coercive engagement                                      | P1 | HIGH for motivation | [VERIFIED — RESEARCH] |
| R1-F038                                                                                                    | Reduce initiation friction without weakening learning     | F037                            | Today planning                                      | Initiation and learning quality not explicitly separated in outcome semantics | **[INFERENCE]** Optimize entry friction independently from evidence rules                                        | P2 | MODERATE            | [INFERENCE]           |
| R1-F041                                                                                                    | Streak effect on mastery unknown                          | REP-14                          | Current streak                                      | Potential metric gaming if over-weighted                                      | **[INFERENCE]** Keep streak subordinate to learning evidence                                                     | P2 | INSUFFICIENT        | [UNKNOWN]             |
| R1-F043                                                                                                    | Transfer is conditional                                   | SRC-26                          | Partial transfer/evidence concepts                  | No comprehensive transfer layer verified                                      | **[INFERENCE]** Require novelty/delay where broad mastery is claimed                                             | P0 | HIGH                | [VERIFIED — RESEARCH] |
| R1-F045                                                                                                    | `mastered` semantics must match evidence                  | REP-05 + F010,F043              | ≥60-day stability across required lanes             | Label can exceed measured construct                                           | **[INFERENCE]** Scope the claim rather than discarding FSRS stability                                            | P0 | HIGH                | [INFERENCE]           |



---

## 16. Current Strengths Worth Preserving

[VERIFIED — REPOSITORY] **EvidencePolicy's assistance provenance** is the strongest current learning-integrity safeguard. Target-revealing help, transcript exposure and coaching do not silently become schedule-changing independent evidence.

[INFERENCE] This directly supports R1-F007 and is P0 to preserve.

[VERIFIED — REPOSITORY] **Per-skill FSRS state** already avoids the most simplistic one-card/one-score model by separating recognition, recall, listening, collocation and production.

[INFERENCE] The remediation does not recommend replacing that substrate merely because it is not a full learner model.

[VERIFIED — REPOSITORY] **Weakness uncertainty is explicit**, with denominator guards and conflict handling.

[VERIFIED — REPOSITORY] **Failure evidence persists** and recurring errors can be repaired rather than discarded.

[VERIFIED — REPOSITORY] **Sense identity and context provenance** are already represented in the lexical substrate.

[VERIFIED — REPOSITORY] **V10 starts listening without transcript**, distinguishes strict from assisted practice, separates several error causes, and keeps shadowing coaching-only.

[VERIFIED — REPOSITORY] **Writing self-review stays advisory/non-scheduling.**

These strengths survive remediation without gratuitous redesign.

---

## 17. Current Behaviors Requiring Reconsideration

**R1-F045 — [INFERENCE] HIGH.** **`mastered`** **semantic breadth.** The implementation condition is objectively ≥60-day stability across required FSRS lanes. That is meaningful evidence of modeled memory stability, but it does not directly establish novel-context lexical use, spontaneous speaking/writing, or authentic transfer.

**[INFERENCE] HIGH.** **`knowledge strength`** **naming.** Current progress computes this value from average modeled FSRS retrievability. The metric is useful; the risk is semantic, not mathematical. Its label should not imply constructs that were not measured.

**[INFERENCE] MODERATE. Weakness causal interpretation.** Failure rate can locate where qualified errors cluster, but cannot alone determine why.

**[INFERENCE] MODERATE. Recurrence handling.** Recurrence-prioritized review is useful, but repeatedly presenting the same remediation after repeated failure can become repetition without diagnosis.

**R1-F003 — [UNKNOWN]. Requested retention** **`0.90`****.** No evidence in this package says the setting is wrong. The defect would be presenting it as a universal pedagogical optimum.

**R1-F041 — [UNKNOWN]. Streak learning value.** Current streak implementation is conservative because it counts qualified learning activity, but a causal durable-learning benefit remains unproven.

---

## 18. Candidate Product Principles

All principles here are **NON-BINDING**.

| Principle                                                                              | Classification | Basis                 |
| -------------------------------------------------------------------------------------- | -------------- | --------------------- |
| Assisted learning and independent evidence are different things.                       | [INFERENCE] | R1-F007                 |
| FSRS should schedule memory without being asked to prove whole-language mastery.       | [INFERENCE] | R1-F010,R1-F045         |
| Measure the construct actually elicited.                                               | [INFERENCE] | R1-F010,R1-F013,R1-F017 |
| Recognition cannot stand in for complete lexical knowledge.                            | [INFERENCE] | R1-F013                 |
| Scaffold first when needed, then fade before a strong mastery claim.                   | [INFERENCE] | R1-F005–07              |
| Transcript access can teach while changing what listening evidence means.              | [INFERENCE] | R1-F006,R1-F018         |
| Interleave for discrimination, not random novelty.                                     | [INFERENCE] | R1-F004                 |
| Feedback should produce a new learner action rather than terminate the episode.        | [INFERENCE] | R1-F023,R1-F024,R1-F033 |
| Corrected/revised/rehearsed performance should not be silently promoted to transfer.   | [INFERENCE] | R1-F026,R1-F030,R1-F043 |
| Recurring errors deserve changing diagnosis/remediation, not only more repetitions.    | [INFERENCE] | R1-F035                 |
| Uncertainty is part of the learner model, not an implementation inconvenience.         | [INFERENCE] | R1-F012                 |
| Reading fluency requires comprehension, not speed alone.                               | [INFERENCE] | R1-F022                 |
| Motivation and initiation metrics remain separate from mastery metrics.                | [INFERENCE] | R1-F036–R1-F041         |
| Short sessions are a delivery format, not a learning law.                              | [UNKNOWN]   | R1-F042                 |
| Strong mastery language requires correspondingly strong independent/transfer evidence. | [INFERENCE] | R1-F043,R1-F045         |



---

## 19. Conflicting / Conditional Evidence Register

| Mechanism / claim                                                                    | Evidence in favor                                     | Important contrary/conditional evidence                                                                                                   | Disposition                                       |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Retrieval > restudy                                                                  | Strong delayed-retention evidence                     | Benefit depends on successful/corrected retrieval                                                                                         | **VALIDATED WITH CONDITIONS**                     |
| More exposure = more vocabulary learning                                             | Encounter frequency positively related to learning    | Only moderate `r≈.34`; strong moderators                                                                                                  | **NO MONOTONIC RULE**                             |
| Expanding spacing is best                                                            | Plausible theoretical arguments                       | L2 meta found no reliable equal-vs-expanding difference                                                                                   | **NO UNIVERSAL WINNER**                           |
| Interleaving always helps                                                            | Overall positive meta-analytic effect                 | Strong domain/material moderation; verbal items can favor blocking                                                                        | **CONDITIONAL**                                   |
| More multimedia is better                                                            | Multiple representations can aid learning             | Segmentation, split-attention, redundancy and expertise reversal impose material boundary conditions; see **SRC-07,SRC-08,SRC-31,SRC-32** | **CONDITIONAL**                                   |
| Captions are redundant/harmful                                                       | Text can compete for visual attention                 | Direct L2 meta-analysis supports captioned learning                                                                                       | **USEFUL SCAFFOLD; DIFFERENT EVIDENCE CONDITION** |
| Self-explanation universally helps                                                   | Positive meta-analysis                                | Effects depend on learning task/prior knowledge/time; not all generative tasks equivalent                                                 | **CONDITIONAL**                                   |
| Extensive reading helps                                                              | Direct L2 meta-analysis                               | Long-term/delayed evidence less extensive than short-term evidence                                                                        | **VALIDATED, LONG-TERM PRECISION LIMITED**        |
| Extreme speed reading preserves comprehension                                        | Popular/product claim                                 | Major scientific review rejects large no-cost speed gains                                                                                 | **REJECTED**                                      |
| Writing feedback = writing mastery                                                   | WCF improves accuracy; peer feedback improves writing | Peer-feedback effects larger on revisions than novel compositions                                                                         | **FEEDBACK VALID; TRANSFER SEPARATE**             |
| Pronunciation instruction proves spontaneous improvement                             | Targeted monitored gains clear                        | Global spontaneous gains less clear                                                                                                       | **CONSTRUCT-CONDITIONAL**                         |
| Immediate speaking correction always best                                            | Some immediate comparison mechanisms plausible        | Definitions and findings for immediate versus delayed feedback are heterogeneous; **SRC-33**                                              | **NO UNIVERSAL TIMING RULE**                      |
| Adaptive learning always helps                                                       | 45-study synthesis supports average benefit           | Effects moderated by context/design/adaptation                                                                                            | **CONDITIONAL**                                   |
| Motivation support improves learning directly                                        | Strong SDT educational associations                   | Much evidence correlational; motivation ≠ mastery                                                                                         | **VALID FOR MOTIVATION, NOT DIRECT L2 CAUSALITY** |
| Time-based cue beats routine cue                                                     | Both plausible                                        | RCT found no clear superiority                                                                                                            | **NO UNIVERSAL WINNER**                           |
| Gamification = learning                                                              | Positive average effects                              | Mechanics/outcomes heterogeneous                                                                                                          | **ENGAGEMENT ≠ MASTERY**                          |
| Streaks improve English                                                              | May reinforce activity                                | No adequate causal durable-English evidence established                                                                                   | **UNKNOWN**                                       |
| Microlearning is superior                                                            | Small/narrow literature is promising                  | Evidence base too narrow/heterogeneous for universal superiority                                                                          | **UNKNOWN**                                       |
| Practice success guarantees transfer                                                 | Retrieval transfer positive                           | Pooled transfer smaller/conditional (`d≈.40`)                                                                                             | **REJECT AUTOMATIC TRANSFER**                     |

The corrective-feedback timing source is now fully traceable. Cambridge identifies the article as Li, Ou, and Lee, with DOI `10.1017/S0261444824000478`; the paper explicitly notes that immediate and delayed feedback have been operationalized differently across studies. ([Cambridge](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0261444824000478?utm_source=chatgpt.com "The timing of corrective feedback in second language learning | Language Teaching | Cambridge Core"))

---

## 20. Unknowns & Future Spikes

### Research Unknowns

[UNKNOWN] What requested-retention target or target range best balances review cost, forgetting and task importance for different VocabMaster learning goals.

[UNKNOWN] The optimal transcript/caption reveal schedule by proficiency and listening objective.

[UNKNOWN] The amount of delayed/varied evidence required before language such as `mastered` becomes construct-valid.

[UNKNOWN] Whether the existing five FSRS lanes are the optimal learner-facing or internal granularity.

[UNKNOWN] The incremental value of learner confidence/JOL collection beyond observed performance.

[UNKNOWN] The comparative VocabMaster effectiveness of self-explanation, summarization, generated examples, prediction, concept maps, teaching-back and explicit error explanation.

[UNKNOWN] Durable general listening/speaking transfer from shadowing.

[UNKNOWN] Causal durable spontaneous-speaking benefit from self-recording/playback alone.

[UNKNOWN] Comparative learning value of dialogue, role-play and monologue once practice time and feedback are held constant.

[UNKNOWN] Durable L2 transfer from sentence-combining as a standalone mechanic.

[UNKNOWN] Optimal correction timing across accuracy-oriented drills versus communicative speaking/writing.

[UNKNOWN] Whether streak preservation improves durable English mastery after controlling for underlying study motivation and practice volume.

[UNKNOWN] Whether microlearning has an advantage after equating learning mechanism and total practice.

### Product Decisions Required

R1 does not decide the learner-facing semantics of `mastered`, acceptable transfer evidence burden, active versus passive lexical dimensions, prominence of streak/gamification, allowable retry friction, balance of short sessions and authentic long tasks, or the relative weighting of general-English versus IELTS-task evidence.

### Stage 5 Empirical Benchmarks Required

Any future pronunciation/comprehensibility evaluator, spontaneous production evaluator, fine-grained linguistic diagnostic mechanism, adaptive item selector, learner-model calibration approach or generated feedback/explanation capability requires empirical benchmarking under separate Stage 5 authority.

No model/provider is selected here.

### Real-User Validation Required

Real-user studies are needed to determine whether clean-retry rules create productive challenge rather than excessive friction; whether remediation reduces recurring errors; whether `mastered`/`knowledge strength` labels are interpreted correctly; whether transfer checks predict external performance; and whether engagement features support sustained learning without metric gaming.

---

## 21. Inputs for R4 Reconciliation

These are structured R1 inputs only. **No R4 reconciliation is performed.**

### R1\_VALIDATED\_FINDINGS

`R1-F001` — retrieval practice supports delayed retention, conditional on successful/corrected retrieval.

`R1-F002` — spacing supports durable retention; schedules are horizon/context dependent.

`R1-F004` — interleaving is discrimination- and material-dependent.

`R1-F005` — multimedia support must manage cognitive load and expertise.

`R1-F006` — captions/transcripts can support L2 learning.

`R1-F008` — self-explanation has credible general educational benefit.

`R1-F011` — learner-model families answer different modeling questions.

`R1-F013` — receptive/productive lexical knowledge are distinct.

`R1-F014` — repeated incidental encounters help moderately and conditionally.

`R1-F015` — intentional vocabulary learning suffers material delayed attrition.

`R1-F017` — listening is multidimensional.

`R1-F021` — extensive reading supports L2 development.

`R1-F022` — extreme speed without comprehension cost is unsupported.

`R1-F023` — written corrective feedback improves L2 grammatical accuracy.

`R1-F024` — peer feedback helps writing; revision effects exceed new-composition effects.

`R1-F029` — pronunciation instruction has strongest evidence for targeted monitored features.

`R1-F033` — oral corrective feedback has durable L2 effects, conditional on context/type/timing operationalization.

`R1-F034` — adaptive learning can help but is heterogeneous.

`R1-F036` — competence/autonomy/relatedness support educational motivation.

`R1-F037` — implementation intentions/cue planning support goal attainment in non-L2 domains.

`R1-F040` — gamification effects are heterogeneous.

`R1-F043` — transfer following retrieval practice is positive but conditional.

### R1\_CONDITIONAL\_FINDINGS

`R1-F004`, `R1-F005`, `R1-F006`, `R1-F008`, `R1-F014`, `R1-F023`, `R1-F024`, `R1-F029`, `R1-F033`, `R1-F034`, `R1-F036`, `R1-F037`, `R1-F040`, `R1-F043`.

These IDs remain validated empirical propositions but have material conditions that R4 must not strip away.

### R1\_UNKNOWN\_FINDINGS

`R1-F003`, `R1-F009`, `R1-F019`, `R1-F025`, `R1-F028`, `R1-F031`, `R1-F032`, `R1-F039`, `R1-F041`, `R1-F042`.

### R1\_PRODUCT\_DECISIONS\_REQUIRED

Meaning and UI scope of `mastered`; meaning of retrievability-derived progress labels; acceptable evidence burden for broad mastery; lexical target dimensions; frequency/cost of transfer checks; streak/gamification prominence; acceptable clean-retry friction; authentic-task versus micro-session balance.

### R1\_R2\_DEPENDENCIES

Capability needs only, without technology choice:

pronunciation/comprehensibility evidence;

spontaneous productive-language evaluation;

fine-grained linguistic error evidence;

sense/collocation-aware lexical analysis;

uncertainty-aware learner modeling;

adaptive item selection;

connected-speech/listening diagnostics;

feedback/explanation support.

### R1\_R3\_DEPENDENCIES

R3 may later inspect architecture feasibility for preserving:

independent versus assisted evidence provenance;

memory/mastery/diagnosis/transfer separation;

sense/context identity;

uncertainty;

delayed transfer observations;

error recurrence and changed remediation;

domain isolation between IELTS task evidence and broader language claims.

This report does not design those architectures.

### R1\_STAGE4\_INPUTS

Pedagogical constraints only:

progressively reveal support;

communicate coaching versus evidence honestly;

avoid labels that exceed measured constructs;

surface meaningful competence and error repair;

support both short initiation-friendly sessions and sustained authentic tasks;

make uncertainty understandable.

Stage 4 is not authorized by R1.

### R1\_STAGE5\_INPUTS

Future benchmark outcomes should include delayed retention, independent post-assistance performance, recurring-error reduction, novel-task transfer, spontaneous production/comprehensibility where relevant, calibration and false-positive-mastery risk—not merely provider benchmark accuracy.

Stage 5 is not authorized by R1.

---

## 22. Source Register

Access date for all external scholarly/technical sources: **2026-08-17**.

### Repository sources

**REP-01 —** **`docs/MASTER_ROADMAP.md`****.** Exact ref: `06ff39360d41fb3e83c98352fe4a9d3093190b45`. Purpose: Stage sequencing/authority boundary. Supports: Stage 3 research versus Stage 4/5/6 separation. Limitation: governance evidence, not scientific efficacy.

**REP-02 —** **`docs/STAGE3_RESEARCH_STRATEGY.md`****.** Exact ref: same SHA. Purpose: canonical R1 scope/evidence standard. Supports: active Stage 3 strategy, R1 scope, epistemic contract. Limitation: strategy, not learning-effect evidence.

**REP-03 —** **`docs/authorizations/STAGE3-RESEARCH-AUTH-001.md`****.** Exact ref: same SHA. Purpose: transaction authority. Supports: `ACCEPTED / CANONICAL / EFFECTIVE`, research-only authorization. Limitation: no scientific authority.

**REP-04 —** **`docs/research/STAGE3_RESEARCH_CONSTRAINTS.md`****.** Exact ref: same SHA. Purpose: Owner operational preferences. Supports: non-canonical constraint status. Limitation: research input only.

**REP-05 —** **`src/fsrs-scheduler.js`****.** Exact ref: same SHA. Purpose: FSRS implementation baseline. Supports: FSRS v6 declaration, five skill lanes, `requestRetention:0.9`, `MASTERED_STABILITY_DAYS=60`, mastered derivation. Limitation: implementation behavior, not learner-outcome validation.

**REP-06 —** **`src/evidence-policy.js`****.** Exact ref: same SHA. Purpose: schedule-evidence semantics. Supports: assistance disqualification, verified source requirements, dictation distinctions, production/retell requirements, IELTS objective isolation. Limitation: implementation policy, not efficacy evidence.

**REP-07 —** **`src/weakness-profile.js`****.** Exact ref: same SHA. Purpose: weakness/uncertainty baseline. Supports: sample guards, conflict handling, failure rate, high uncertainty. Limitation: explicitly uncalibrated policy.

**REP-08 —** **`src/targeted-diagnostic.js`****.** Exact ref: same SHA. Purpose: diagnostic selection baseline. Supports: ranking by failure rate/failures and minimum coverage. Limitation: deterministic heuristic, not validated latent-diagnostic model.

**REP-09 —** **`src/error-repository.js`****.** Exact ref: same SHA. Purpose: recurrence/correction baseline. Supports: durable error occurrences, recurrence, correction evidence, repair queue. Limitation: stored categories do not prove causal validity.

**REP-10 —** **`src/lexical-core-v2.js`****.** Exact ref: same SHA. Purpose: lexical identity/context baseline. Supports: lemma versus sense, collocations, source occurrences. Limitation: data identity ≠ lexical competence model.

**REP-11 —** **`src/sentence-learning-loop.js`****.** Exact ref: same SHA. Purpose: V10 learning-sequence baseline. Supports: hidden transcript, strict/assisted dictation, correction/noticing, shadowing recording/playback, coaching-only semantics, retell. Limitation: no real-user causal outcome study.

**REP-12 —** **`src/today-planner-v2.js`****.** Exact ref: same SHA. Purpose: planning/adaptation baseline. Supports: due/retrievability priority, new-card coaching, repair/content integration. Limitation: prioritization formula is not pedagogically calibrated by R1.

**REP-13 —** **`src/productive-practice.js`****.** Exact ref: same SHA. Purpose: writing self-review baseline. Supports: persisted advisory review and `affectsSchedule:false`. Limitation: does not establish writing mastery.

**REP-14 —** **`src/progress.js`****.** Exact ref: same SHA. Purpose: progress/streak/calibration semantics. Supports: streak definition, FSRS-derived knowledge strength, model-prediction calibration. Limitation: retrievability does not measure whole-language ability.

### External scholarly and technical sources

**SRC-01 — Roediger, H. L., & Karpicke, J. D. (2006).** ***Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention*****. Psychological Science, 17.** Source type: controlled memory experiments. Publication year: 2006. Population/domain: MEM. Design: experiments comparing study/testing and delayed outcomes. Supports: R1-F001 and performance-versus-learning distinction. Limitation: general memory, not direct L2.

**SRC-02 — Rowland, C. A. (2014).** ***The Effect of Testing Versus Restudy on Retention: A Meta-Analytic Review of the Testing Effect*****. Psychological Bulletin, 140, 1432–1463. DOI** **`10.1037/a0037559`****.** Source type: meta-analysis. Domain: MEM. Supports R1-F001. Limitation: not L2-specific.

**SRC-03 — Rowland, C. A., & DeLosh, E. L. (2015). Retrieval-practice research on retrieval success/corrective feedback.** Source type: controlled experiments. Domain: MEM. Supports R1-F001's successful/corrected-retrieval condition. Limitation: general memory context.

**SRC-04 — Cepeda, N. J., et al. (2008).** ***Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention*****. Psychological Science.** Source type: large experiment. Population/domain: MEM. Supports R1-F002's retention-horizon dependence. Limitation: generic fact learning.

**SRC-05 — Kim, M., & Webb, S. (2022). L2 distributed-practice meta-analysis.** ***Language Learning*****. DOI** **`10.1111/lang.12479`****.** Source type: meta-analysis. Publication year: 2022. Population/domain: L2. Design: 98 effects, 48 experiments, 3,411 learners. Supports R1-F002. Limitation: heterogeneous target types/conditions.

**SRC-06 — Brunmair, M., & Richter, T. (2019).** ***Similarity Matters: A Meta-Analysis of Interleaved Learning and Its Moderators*****. Psychological Bulletin. DOI** **`10.1037/bul0000209`****.** Source type: meta-analysis. Population/domain: EDU. Supports R1-F004. Limitation: material-specific; not L2-specific.

**SRC-07 — Mayer, R. E., & Fiorella, L. (2021). “Principles for Managing Essential Processing in Multimedia Learning: Segmenting, Pre-training, and Modality Principles.” In R. E. Mayer & L. Fiorella (Eds.),** ***The Cambridge Handbook of Multimedia Learning*** **(3rd ed., pp. 243–260). Cambridge University Press. DOI** **`10.1017/9781108894333.025`****.** Primary URL/DOI: Cambridge Core / chapter DOI. Source type: authoritative research-synthesis chapter. Publication year: 2021. Population/domain: EDU. Research design: synthesis of multimedia-learning experiments. Supports: **segmenting component of R1-F005**. Important limitation: general multimedia education rather than direct L2 evidence. Cambridge confirms Mayer and Fiorella as chapter authors, pages 243–260 and the chapter DOI. ([Cambridge](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-managing-essential-processing-in-multimedia-learning/A9E77D0172F905AC957689D1771E2888 "Principles for Managing Essential Processing in Multimedia Learning (Chapter 19) - The Cambridge Handbook of Multimedia Learning"))

**SRC-08 — Kalyuga, S. (2021). “The Expertise Reversal Principle in Multimedia Learning.” In R. E. Mayer & L. Fiorella (Eds.),** ***The Cambridge Handbook of Multimedia Learning*** **(3rd ed., pp. 171–182). Cambridge University Press. DOI** **`10.1017/9781108894333.017`****.** Primary URL/DOI: Cambridge Core / chapter DOI. Source type: authoritative research-synthesis chapter. Publication year: 2021. Population/domain: EDU. Research design: synthesis of expertise/prior-knowledge moderation research. Supports: **expertise-sensitive component of R1-F005**. Important limitation: generic education; direct application to L2 product scaffolding is inference. Cambridge identifies Slava Kalyuga as the chapter author and gives pages 171–182. ([Cambridge](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/expertise-reversal-principle-in-multimedia-learning/F6793786D8F79519A22E967FC2563839 "The Expertise Reversal Principle in Multimedia Learning (Chapter 13) - The Cambridge Handbook of Multimedia Learning"))

**SRC-09 — Montero Perez, M., Van Den Noortgate, W., & Desmet, P. (2013).** ***Captioned Video for L2 Listening and Vocabulary Learning: A Meta-Analysis*****. System, 41. DOI** **`10.1016/j.system.2013.07.013`****.** Source type: meta-analysis. Population/domain: L2 audiovisual learning. Supports R1-F006. Limitation: captions vary by language, task and proficiency.

**SRC-10 — Bisra, K., Liu, Q., Nesbit, J. C., Salimi, F., & Winne, P. H. (2018).** ***Inducing Self-Explanation: A Meta-Analysis*****. Educational Psychology Review, 30, 703–725. DOI** **`10.1007/s10648-018-9434-x`****.** Source type: meta-analysis. Population/domain: EDU. Supports R1-F008. Limitation: general education; design/time/prior knowledge vary.

**SRC-11 — Webb, S., Yanagisawa, A., & Uchihara, T. (2020). Intentional L2 vocabulary-learning meta-analysis.** ***Modern Language Journal*****. DOI** **`10.1111/modl.12671`****.** Source type: meta-analysis. Population/domain: L2. Supports R1-F015. Limitation: intentional-learning settings.

**SRC-12 — Uchihara, T., Webb, S., & Yanagisawa, A. (2019).** ***The Effects of Repetition on Incidental Vocabulary Learning: A Meta-Analysis of Correlational Studies*****. Language Learning. DOI** **`10.1111/lang.12343`****.** Source type: meta-analysis. Population/domain: L2. Supports R1-F014. Limitation: correlational synthesis.

**SRC-13 — Lee (2025).** ***The Relationship Between Receptive and Productive Knowledge of L2 English Collocations*****. International Journal of Applied Linguistics. DOI** **`10.1111/ijal.12605`****.** Source type: construct study. Population/domain: L2-EN. Supports R1-F013. Limitation: one construct study rather than intervention synthesis.

**SRC-14 — Aryadoust, V., & Luo, L. (2023).** ***The Typology of Second Language Listening Constructs: A Systematic Review*****. Language Testing, 40, 375–409. DOI** **`10.1177/02655322221126604`****.** Source type: systematic review. Population/domain: L2. Supports R1-F017. Limitation: construct review rather than intervention meta-analysis.

**SRC-15 — Nakanishi, T. (2015).** ***A Meta-Analysis of Extensive Reading Research*****. TESOL Quarterly, 49, 6–37. DOI** **`10.1002/tesq.157`****.** Source type: meta-analysis. Population/domain: L2. Supports R1-F021. Limitation: heterogeneous designs.

**SRC-16 — Rayner, K., Schotter, E. R., Masson, M. E. J., Potter, M. C., & Treiman, R. (2016).** ***So Much to Read, So Little Time: How Do We Read, and Can Speed Reading Help?*** **Psychological Science in the Public Interest, 17, 4–34. DOI** **`10.1177/1529100615623267`****.** Source type: major scientific review. Population/domain: EDU/general reading. Supports R1-F022. Limitation: primarily general/L1 reading.

**SRC-17 — Kang, E., & Han, Z. (2015).** ***The Efficacy of Written Corrective Feedback in Improving L2 Written Accuracy: A Meta-Analysis*****. Modern Language Journal.** Source type: meta-analysis. Population/domain: L2. Supports R1-F023. Limitation: grammatical accuracy, not complete composition competence.

**SRC-18 — Vuogan et al. (2023).** ***Examining the Effectiveness of Peer Feedback in Second Language Writing: A Meta-Analysis*****. TESOL Quarterly. DOI** **`10.1002/tesq.3178`****.** Source type: meta-analysis. Population/domain: L2. Supports R1-F024. Limitation: feedback conditions and outcome dimensions vary.

**SRC-19 — Saito, K., & Plonsky, L. (2019).** ***Effects of Second Language Pronunciation Teaching Revisited: A Proposed Measurement Framework and Meta-Analysis*****. Language Learning, 69, 652–708. DOI** **`10.1111/lang.12345`****.** Primary URL/DOI: official Wiley record / DOI. Source type: methodological review and meta-analysis. Publication year: 2019. Population/domain: L2. Research design: synthesis/coding of 77 pronunciation-teaching studies published between 1982 and 2017. Supports R1-F029. Important limitation: observed instructional effect depends materially on measurement construct and elicitation method. **Authorship fresh-verified: Kazuya Saito and Luke Plonsky.** Wiley's official record gives exactly those authors and the citation `Language Learning, 69: 652–708`. ([Thư viện trực tuyến Wiley](https://onlinelibrary.wiley.com/doi/10.1111/lang.12345?utm_source=chatgpt.com "Effects of Second Language Pronunciation Teaching Revisited: A Proposed Measurement Framework and Meta‐Analysis - Saito - 2019 - Language Learning - Wiley Online Library"))

**SRC-20 — Lyster, R., & Saito, K. (2010).** ***Oral Feedback in Classroom SLA: A Meta-Analysis*****. Studies in Second Language Acquisition, 32, 265–302.** Source type: meta-analysis. Population/domain: L2. Design: 15 classroom studies/N=827. Supports R1-F033. Limitation: CF type, age, treatment and elicitation moderate effects.

**SRC-21 — Wang, X., Huang, R., Sommer, M., et al. (2024).** ***The Efficacy of Artificial Intelligence-Enabled Adaptive Learning Systems From 2010 to 2022 on Learner Outcomes: A Meta-Analysis*****. Journal of Educational Computing Research, 62. DOI** **`10.1177/07356331241240459`****.** Source type: meta-analysis. Population/domain: EDU. Supports R1-F034. Limitation: heterogeneous technology bundles; not direct L2 evidence and not evidence for a provider/model.

**SRC-22 — Bureau, J. S., Howard, J. L., Chong, J. X. Y., & Guay, F. (2022).** ***Pathways to Student Motivation: A Meta-Analysis of Antecedents of Autonomous and Controlled Motivations*****. Review of Educational Research, 92, 46–72. DOI** **`10.3102/00346543211042426`****.** Source type: meta-analysis. Population/domain: EDU. Supports R1-F036. Limitation: primarily correlational.

**SRC-23 — Gollwitzer, P. M., & Sheeran, P. (2006).** ***Implementation Intentions and Goal Achievement: A Meta-Analysis of Effects and Processes*****. Advances in Experimental Social Psychology, 38.** Source type: meta-analysis. Population/domain: OTHER. Design: 94 independent tests. Supports R1-F037. Limitation: not language-learning evidence. The final report relies on this source only for the goal-attainment finding; the unnecessary separate “underlying goals” sentence has been removed.

**SRC-24 — Keller, J., et al. (2021).** ***Habit Formation Following Routine-Based Versus Time-Based Cue Planning: A Randomized Controlled Trial*****. British Journal of Health Psychology. DOI** **`10.1111/bjhp.12504`****.** Source type: RCT. Population/domain: OTHER. Supports R1-F037. Limitation: health/nutrition behavior, not English learning.

**SRC-25 — Sailer, M., & Homner, L. (2020).** ***The Gamification of Learning: A Meta-Analysis*****. Educational Psychology Review. DOI** **`10.1007/s10648-019-09498-w`****.** Source type: meta-analysis. Population/domain: EDU. Supports R1-F040. Limitation: heterogeneous mechanics/outcome types.

**SRC-26 — Pan, S. C., & Rickard, T. C. (2018).** ***Transfer of Test-Enhanced Learning: Meta-Analytic Review and Synthesis*****. Psychological Bulletin. DOI** **`10.1037/bul0000151`****.** Source type: meta-analysis. Population/domain: MEM/EDU. Supports R1-F043 and R1-F010/R1-F044 premises. Limitation: transfer definitions/tasks heterogeneous.

**SRC-27 — Corbett, A. T., & Anderson, J. R. (1995).** ***Knowledge Tracing: Modeling the Acquisition of Procedural Knowledge*****. User Modeling and User-Adapted Interaction, 4, 253–278. DOI** **`10.1007/BF01099821`****.** Source type: foundational computational learner-model source. Population/domain: EDU/modeling. Supports BKT identity in R1-F011. Limitation: classic simplified skill assumptions; not a language mastery model.

**SRC-28 — Piech, C., Bassen, J., Huang, J., Ganguli, S., Sahami, M., Guibas, L., & Sohl-Dickstein, J. (2015).** ***Deep Knowledge Tracing*****. Advances in Neural Information Processing Systems 28.** Source type: primary proceedings paper. Population/domain: modeling/EDU. Supports DKT characterization in R1-F011. Limitation: prediction accuracy does not establish pedagogical interpretation of hidden state.

**SRC-29 — von Davier, M. (2017 edition/open chapter).** ***Item Response Theory*****. Springer/ETS educational measurement synthesis.** Source type: authoritative psychometric synthesis. Population/domain: EDU. Supports IRT ability/item-difficulty distinction in R1-F011. Limitation: assessment framework, not learning/forgetting model.

**SRC-30 — Free Spaced Repetition Scheduler official algorithm/documentation surfaces, inspected 2026-08-17.** Source type: primary technical model documentation. Population/domain: computational memory. Supports Difficulty/Stability/Retrievability scope used in R1-F010–R1-F011. Limitation: official technical documentation is not independent learning-effectiveness evidence.

**SRC-31 — Ayres, P., & Sweller, J. (2021). “The Split-Attention Principle in Multimedia Learning.” In R. E. Mayer & L. Fiorella (Eds.),** ***The Cambridge Handbook of Multimedia Learning*** **(3rd ed., pp. 199–211). Cambridge University Press. DOI** **`10.1017/9781108894333.020`****.** Primary URL/DOI: Cambridge Core / chapter DOI. Source type: authoritative research-synthesis chapter. Publication year: 2021. Population/domain: EDU. Research design: synthesis of split-attention/cognitive-load evidence. Supports: **split-attention component of R1-F005**. Important limitation: generic educational multimedia evidence; product/L2 implications remain inference. Cambridge gives Ayres and Sweller as authors, pages 199–211 and DOI `.020`. ([Cambridge](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/splitattention-principle-in-multimedia-learning/194CBCD1A3C911116CCB5F403AC7E415 "The Split-Attention Principle in Multimedia Learning (Chapter 15) - The Cambridge Handbook of Multimedia Learning"))

**SRC-32 — Kalyuga, S., & Sweller, J. (2021). “The Redundancy Principle in Multimedia Learning.” In R. E. Mayer & L. Fiorella (Eds.),** ***The Cambridge Handbook of Multimedia Learning*** **(3rd ed., pp. 212–220). Cambridge University Press. DOI** **`10.1017/9781108894333.021`****.** Primary URL/DOI: Cambridge Core / chapter DOI. Source type: authoritative research-synthesis chapter. Publication year: 2021. Population/domain: EDU. Research design: synthesis of redundancy/cognitive-load research. Supports: **redundancy component of R1-F005**. Important limitation: redundancy is conditional; the chapter itself includes L2-relevant counterexamples/boundary conditions, so it does not justify a blanket ban on duplicate modalities. Cambridge identifies Kalyuga and Sweller as authors, pages 212–220 and DOI `.021`. ([Cambridge](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/redundancy-principle-in-multimedia-learning/2F5F2B90AE8178CEA3C1CA05961B2457 "The Redundancy Principle in Multimedia Learning (Chapter 16) - The Cambridge Handbook of Multimedia Learning"))

**SRC-33 — Li, S., Ou, L., & Lee, I. (2026).** ***The timing of corrective feedback in second language learning*****. Language Teaching, 59(1), 29–45. DOI** **`10.1017/S0261444824000478`****. First published online 27 January 2025.** Primary URL/DOI: Cambridge Core / DOI. Source type: Research Timeline / scholarly research synthesis. Publication year: 2026 issue; first online publication 2025. Population/domain: L2. Research design: research timeline/synthesis of corrective-feedback timing literature. Access date: 2026-08-17. Supports: timing-conditional component of R1-F033 and the immediate-versus-delayed row in the Conflicting / Conditional Evidence Register. Important limitation: the paper documents heterogeneous operationalizations and literature rather than establishing one universally optimal timing rule. Cambridge's official record confirms authors **Shaofeng Li, Ling Ou, and Icy Lee**, Volume 59 Issue 1, January 2026, pp. 29–45, and DOI `10.1017/S0261444824000478`. ([Cambridge](https://www.cambridge.org/core/journals/language-teaching/article/timing-of-corrective-feedback-in-second-language-learning/0E8856852D0183E9DD91EDB4C249E245 "The timing of corrective feedback in second language learning | Language Teaching | Cambridge Core"))

---

# Appendix A — Remediation Integrity Record

## A.1 Audit Findings Resolved

| Remediation finding                    | Disposition  | Evidence                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REM-001` unstable finding IDs         | **RESOLVED** | Registry remains `R1-F001`–`R1-F045`; no finding ID or proposition was changed by the source-provenance correction.                                                                                                                                                                                                                                                       |
| `REM-002` epistemic classification     | **RESOLVED** | Material claims continue to use exactly `[VERIFIED — RESEARCH]`, `[VERIFIED — REPOSITORY]`, `[INFERENCE]`, or `[UNKNOWN]`.                                                                                                                                                                                                                                                |
| `REM-003` epistemic overclaims         | **RESOLVED** | Product implications remain separated from external research facts.                                                                                                                                                                                                                                                                                                       |
| `REM-004` targeted coverage completion | **RESOLVED** | No research scope was reopened in this correction; existing coverage dispositions remain unchanged.                                                                                                                                                                                                                                                                       |
| `REM-005` source register completeness | **RESOLVED** | Missing corrective-feedback timing source added as SRC-33; multimedia provenance decomposed into deterministic SRC-07/SRC-08/SRC-31/SRC-32 records; SRC-19 authorship fresh-verified against Wiley; unnecessary unregistered implementation-intention clause removed. Final audit: 33 material external sources + 14 repository sources, 0 unregistered material sources. |
| `REM-006` Executive Findings           | **RESOLVED** | Executive Findings remain exactly 15; no finding semantics were modified.                                                                                                                                                                                                                                                                                                 |

The fresh official-source checks underlying REM-005 confirm Saito/Plonsky's Wiley authorship, Li/Ou/Lee's Cambridge article metadata, and the separate Cambridge multimedia chapter authors/DOIs. ([Thư viện trực tuyến Wiley](https://onlinelibrary.wiley.com/doi/10.1111/lang.12345?utm_source=chatgpt.com "Effects of Second Language Pronunciation Teaching Revisited: A Proposed Measurement Framework and Meta‐Analysis - Saito - 2019 - Language Learning - Wiley Online Library"))

## A.2 Finding Registry Integrity

```
TOTAL_FINDING_IDS: 45
DUPLICATE_ID_COUNT: 0
ORPHAN_REFERENCE_COUNT: 0
HYBRID_EPISTEMIC_TAG_COUNT: 0
INVALID_R4_REFERENCE_COUNT: 0
```

`ID_UNIQUENESS`: passed.

`SEMANTIC_STABILITY`: passed.

`NO_ORPHAN_IDS`: passed.

`NO_UNUSED_CRITICAL_IDS`: passed for Executive Findings and R4 inputs.

`NO_RANGE_AMBIGUITY`: passed.

`NO_COLLISION`: passed.

These values are preserved exactly as required by the bounded source-provenance correction.

## A.3 Coverage Audit

| Original R1 topic group                      | Disposition          | Note                                                            |
| -------------------------------------------- | -------------------- | --------------------------------------------------------------- |
| Retrieval practice/testing effect            | COVERED\_STRONG      | Direct synthesis + experiments                                  |
| Spacing/lag/equal-vs-expanding               | COVERED\_STRONG      | Direct L2 meta-analysis                                         |
| Desired difficulty                           | COVERED\_CONDITIONAL | Productive difficulty inference, no universal difficulty target |
| Interleaving                                 | COVERED\_STRONG      | Strong conditional meta evidence                                |
| Cognitive load                               | COVERED\_STRONG      | General educational synthesis                                   |
| Multimedia learning                          | COVERED\_CONDITIONAL | Generic principles + direct L2 caption evidence                 |
| Segmentation                                 | COVERED\_CONDITIONAL | EDU evidence; product application inference                     |
| Modality effects                             | COVERED\_CONDITIONAL | L2 conditions prevent simple modality rule                      |
| Split attention                              | COVERED\_CONDITIONAL | EDU evidence                                                    |
| Redundancy                                   | COVERED\_CONDITIONAL | EDU rule changes under L2/contextual conditions                 |
| Expertise reversal                           | COVERED\_STRONG      | Generic education; L2 application inference                     |
| Generative learning                          | COVERED\_CONDITIONAL | Self-explanation strongest retained mechanism                   |
| Summarization                                | COVERED\_UNKNOWN     | No equal-effect assumption                                      |
| Learner-generated examples                   | COVERED\_UNKNOWN     | Product-specific value unresolved                               |
| Prediction before reveal                     | COVERED\_UNKNOWN     | Product-specific value unresolved                               |
| Comparison/error explanation                 | COVERED\_CONDITIONAL | Mechanistically plausible; exact value unresolved               |
| Concept mapping                              | COVERED\_UNKNOWN     | No direct L2 product conclusion elevated                        |
| Teaching/explaining                          | COVERED\_UNKNOWN     | Comparative product value unresolved                            |
| FSRS/memory modeling                         | COVERED\_STRONG      | Research + current implementation                               |
| BKT/DKT/IRT conceptual distinctions          | COVERED\_CONDITIONAL | Conceptual only; no model selection                             |
| Cold start/uncertainty                       | COVERED\_STRONG      | Clear product inference + repo alignment                        |
| Vocabulary form/meaning/use                  | COVERED\_STRONG      | Direct L2                                                       |
| Collocation receptive/productive distinction | COVERED\_STRONG      | Direct L2-EN                                                    |
| Polysemy/sense identity                      | COVERED\_CONDITIONAL | Strong repo substrate; behavioral mastery inference             |
| Repetition/incidental encounters             | COVERED\_STRONG      | Direct L2 meta                                                  |
| Listening constructs                         | COVERED\_STRONG      | Direct L2 systematic review                                     |
| Connected-speech diagnosis                   | COVERED\_CONDITIONAL | Conceptual diagnostic need; fine taxonomy unresolved            |
| Transcript/captions                          | COVERED\_STRONG      | L2 evidence + evidence-condition inference                      |
| Dictation                                    | COVERED\_CONDITIONAL | Diagnostic product inference                                    |
| Shadowing                                    | COVERED\_UNKNOWN     | General-transfer magnitude unresolved                           |
| Self-recording/playback                      | COVERED\_UNKNOWN     | Durable causal transfer unresolved                              |
| Extensive reading                            | COVERED\_STRONG      | Direct L2 meta                                                  |
| Reading fluency/speed                        | COVERED\_STRONG      | Major reading synthesis                                         |
| Annotation/summarization in reading          | COVERED\_CONDITIONAL | Generative mechanism caveats                                    |
| Written corrective feedback                  | COVERED\_STRONG      | L2 meta                                                         |
| Peer feedback                                | COVERED\_STRONG      | L2 meta + novel-composition distinction                         |
| Model texts                                  | COVERED\_UNKNOWN     | Transfer evidence not strong enough for broad claim             |
| Sentence combining                           | COVERED\_UNKNOWN     | Direct durable L2 product basis insufficient                    |
| Grammar practice in context                  | COVERED\_CONDITIONAL | Feedback/action evidence relevant; exact mechanic unresolved    |
| Writing planning                             | COVERED\_CONDITIONAL | Effects dimension/task dependent                                |
| Paragraph organization/cohesion              | COVERED\_CONDITIONAL | Must remain separate outcome constructs                         |
| Argument development                         | COVERED\_CONDITIONAL | Must remain separate outcome construct                          |
| Rewriting/revision                           | COVERED\_STRONG      | Revision-versus-transfer distinction established                |
| Self-correction                              | COVERED\_CONDITIONAL | Strong product inference after feedback                         |
| New-composition transfer                     | COVERED\_STRONG      | Explicitly distinguished                                        |
| Pronunciation instruction                    | COVERED\_STRONG      | 77-study synthesis                                              |
| Oral corrective feedback                     | COVERED\_STRONG      | Direct L2 meta + timing synthesis now fully registered          |
| Immediate vs delayed speaking correction     | COVERED\_CONDITIONAL | No universal timing rule; SRC-33 registered                     |
| Dialogue/role-play                           | COVERED\_UNKNOWN     | Comparative superiority unresolved                              |
| Monologue/spontaneous production             | COVERED\_CONDITIONAL | Evidence-condition distinction explicit                         |
| Oral task repetition                         | COVERED\_CONDITIONAL | Rehearsal vs transfer separated; no overclaim                   |
| Formulaic sequences                          | COVERED\_UNKNOWN     | Durable broad-speaking benefit unresolved                       |
| Formative/adaptive learning                  | COVERED\_STRONG      | 45-study adaptive meta                                          |
| Error recurrence                             | COVERED\_STRONG      | Strong repo substrate + cautious inference                      |
| Implementation intentions                    | COVERED\_STRONG      | Meta evidence, OTHER applicability                              |
| Stable cues                                  | COVERED\_STRONG      | RCT + implementation-intention evidence                         |
| Time vs routine cue                          | COVERED\_STRONG      | No universal superiority                                        |
| Friction reduction/initiation cost           | COVERED\_CONDITIONAL | Product inference, not learning-effect fact                     |
| Goal setting                                 | COVERED\_CONDITIONAL | Goal-intention literature                                       |
| Prompts/reminders                            | COVERED\_UNKNOWN     | Direct durable-L2 effect unresolved                             |
| Challenge-skill balance                      | COVERED\_UNKNOWN     | Engagement/flow not equated with mastery                        |
| Self-determination/competence/autonomy       | COVERED\_STRONG      | 144-sample meta                                                 |
| Gamification                                 | COVERED\_CONDITIONAL | Heterogeneous outcomes                                          |
| Streaks                                      | COVERED\_UNKNOWN     | Durable English learning effect unestablished                   |
| Microlearning                                | COVERED\_UNKNOWN     | Superiority unestablished                                       |
| Transfer/authentic performance               | COVERED\_STRONG      | Large meta-analysis + cross-domain synthesis                    |

No required material group is silently `MISSING`.

## A.4 Source Traceability Audit

```
MATERIAL_EXTERNAL_SOURCES: 33
SOURCE_REGISTER_ENTRIES: 47
UNREGISTERED_MATERIAL_SOURCE_COUNT: 0
MATERIAL_REPOSITORY_SOURCES: 14
UNREGISTERED_REPOSITORY_SOURCE_COUNT: 0
```

Recomputation:

```
33 SRC-* entries
+
14 REP-* entries
=
47 total Source Register entries
```

Changes from the preceding revised R1:

```
+ SRC-31  split-attention chapter
+ SRC-32  redundancy chapter
+ SRC-33  corrective-feedback timing source

SRC-07 converted from ambiguous composite wording
       to one deterministic segmentation/essential-processing chapter.

SRC-08 retained as one deterministic expertise-reversal chapter.

SRC-19 official authorship verified as:
Kazuya Saito + Luke Plonsky.

Unregistered implementation-intention body citation:
removed as unnecessary rather than inventing a source mapping.
```

Therefore:

`UNREGISTERED_MATERIAL_SOURCE_COUNT = 0`.

## A.5 Quantitative Claim Audit

No quantitative scientific conclusion was changed by this source-provenance correction.

The earlier remediation actions remain:

| Draft quantitative claim                                                     | Remediation action                         | Reason                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| Kim & Webb: 98 effects, 48 experiments, 3,411 learners                       | **RETAINED**                               | Previously fresh-verified                          |
| Interleaving `g≈.42`, 59 studies, 238 effects                                | **RETAINED**                               | Previously fresh-verified; conditionality explicit |
| Incidental vocabulary repetition `r≈.34`, 45 effects/26 studies/N=1,918      | **RETAINED**                               | Correctly described as association                 |
| Intentional vocabulary immediate/delayed percentages                         | **RETAINED**                               | Previously verified                                |
| Nakanishi extensive reading: 34 studies/43 effects/N=3,942; `d=.46/.71`      | **RETAINED**                               | Outcome distinction preserved                      |
| Peer feedback `d=.73`, CI `.54–.92`, 26 studies                              | **RETAINED**                               | Revision/new-composition distinction preserved     |
| Retrieval-transfer `d≈.40`, 192 effects/122 experiments/67 articles/N=10,382 | **RETAINED**                               | Transfer conditionality preserved                  |
| Self-explanation precise subgroup values                                     | **DOWNGRADED / PRECISION REMOVED**         | Unnecessary precision                              |
| Adaptive learning `g=.70`                                                    | **PRECISION REMOVED**                      | Exact pooled estimate not required                 |
| Pronunciation inherited headline effects                                     | **REMOVED**                                | Replaced by measurement-validity synthesis         |
| HVPT precise effects                                                         | **REMOVED FROM LOAD-BEARING FINDINGS**     | Not necessary for bounded R1                       |
| Gamification exact pooled values                                             | **PRECISION REMOVED**                      | Heterogeneity is the consequential conclusion      |
| Microlearning `SMD=1.43`, `I²=66%`                                           | **REMOVED; FINDING DOWNGRADED TO UNKNOWN** | Evidence too narrow/heterogeneous                  |
| Glossing exact percentages                                                   | **REMOVED FROM LOAD-BEARING FINDINGS**     | Unnecessary precision                              |

The final provenance correction made **no new effect-size claim** and changed **no quantitative learning conclusion**.

---

**Internal consistency disposition:**

```
[PASS] Canonical Finding Registry unchanged
[PASS] No R1-Fxxx renumbering
[PASS] DUPLICATE_ID_COUNT = 0
[PASS] ORPHAN_REFERENCE_COUNT = 0
[PASS] HYBRID_EPISTEMIC_TAG_COUNT = 0
[PASS] INVALID_R4_REFERENCE_COUNT = 0
[PASS] SRC-19 authorship verified against official Wiley record
[PASS] SRC-07 multimedia provenance decomposed deterministically
[PASS] corrective-feedback timing source registered as SRC-33
[PASS] unnecessary unregistered implementation-intention citation removed
[PASS] MATERIAL_EXTERNAL_SOURCES recomputed = 33
[PASS] SOURCE_REGISTER_ENTRIES recomputed = 47
[PASS] UNREGISTERED_MATERIAL_SOURCE_COUNT = 0
[PASS] No research scope expansion
[PASS] No technology selection
[PASS] No implementation or downstream authority expansion
```

RESEARCH DISPOSITION:
R1\_RESEARCH\_COMPLETE

This revised report is research evidence only.
It does not authorize implementation.
It does not select technology.
It does not independently accept itself.
It does not authorize R4 execution.
It does not authorize Stage 4, Stage 5, or Stage 6.
It requires a fresh Independent Research Quality Re-audit before materialization or canonical treatment.
