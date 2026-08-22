# Stage 4 Pre-W3 Whole-App Reference Synthesis Candidate REM-001

> **Transaction:** `STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001`\
> **Canonical base:** `origin/main@5433023d1e8099ac7acfeacebbd2802062ab62e9`\
> **Research observation date:** 2026-08-21\
> **Status:** `RESEARCH_CANDIDATE / NON_CANONICAL / PENDING_NEW_INDEPENDENT_RE-AUDIT`\
> **Authority:** bounded by `docs/authorizations/STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM001-AUTH-REM-001.md`\
> **Historical predecessors:** rejected Draft PR #176 and rejected authorization Draft PR #177 are read-only evidence, not amendable predecessors.

This candidate is a research handoff to Wave W3. It does not authorize implementation, architecture, dependency adoption, schema changes, provider selection, Wave W3 execution, canonical status mutation, merge, or release. External products are interaction references only. Official IELTS, British Council, and IDP sources control exam semantics. Competitor scoring and marketing claims are not treated as validity evidence.

All normative recommendations in this document are identified as `REC-REM-001` through `REC-REM-024` and are scored in Section 18. Text elsewhere explains evidence and implications; it does not create additional unscored recommendations.

## 1. Executive Summary & Remediation Baseline

### 1.1 Outcome

REM-001 replaces the rejected PR #176 candidate with an evidence-bounded synthesis that:

- reconciles all 10 formal audit findings and all five deduplicated root experience gaps;
- covers 15 canonical screen classes, 24 end-to-end systems, and cross-cutting experience qualities;
- preserves `CAP-001` through `CAP-048` plus `S4-OMIT-001` through `S4-OMIT-012` with explicit traceability;
- restores exact Stage 3 recommendation-level identifiers and native `[VERIFIED]`, `[INFERENCE]`, and `[UNKNOWN]` truth;
- uses the seven canonical Stage 4 current/future labels verbatim;
- treats teaching, faded guidance, clean retry, delayed retest, and transfer as first-class experience systems rather than post-attempt decoration;
- closes source continuity from exact cue through capture, learning, review, productive transfer, error remediation, and contextual return;
- separates official IELTS semantics from specialist-product interaction observations and unverified scoring claims;
- gives Global Search a non-exam, reveal-only ownership contract without creating a second content system;
- includes the signed content-pack and Desktop ASR readiness lifecycles as preserved current capabilities;
- produces one W3 input contract while retaining learner agency and strict learning/exam separation.

### 1.2 Activation and evidence baseline

The controlling authorization was independently accepted in PR #178 comment `5368893054`, integrated by PR #178 at `5433023d1e8099ac7acfeacebbd2802062ab62e9`, and followed by successful natural mainline push CI run `32474870323`. No newer same-family authorization was present on the refreshed canonical base at research start. Therefore:

```text
REMEDIATION_AUTHORITY: EFFECTIVE_FOR_EXACT_DECLARED_TRANSACTION_ONLY
TRANSACTION: STAGE4-PREW3-WHOLE-APP-REFERENCE-SYNTHESIS-REM-001
```

The context compiler returned `UNKNOWN_TRANSACTION`. Per the repository router, execution therefore used the controlling canonical authorization directly; compiler failure was not treated as authority denial or silently bypassed.

### 1.3 Non-equivalences

```text
REFERENCE_PATTERN != CANONICAL_BEHAVIOR
COMPETITOR_SCORE != OFFICIAL_OR_CALIBRATED_SCORE
PRACTICE_COMPLETION != LEARNING
SCAFFOLDED_SUCCESS != INDEPENDENT_MASTERY
IMMEDIATE_SUCCESS != DELAYED_RETENTION
RETENTION != NOVEL_TRANSFER
MOCK_RESULT != FSRS_EVIDENCE
CAPABILITY_PRESERVED != CAPABILITY_ALWAYS_VISIBLE
RECOMMENDED_PATH != REQUIRED_PATH
CURRICULUM_PATH != NAVIGATION_LOCK
MEDIA_MODE != GUIDED_LOOP_STEP
OMNIIELTS_LEARNING_UI != IELTS_EXAM_SIMULATION_UI
```

## 2. Controlling Authority & Audit Defect Disposition Matrix

### 2.1 Authority order and bounded inputs

Controlling order is `MASTER_ROADMAP → ROADMAP → IMPLEMENTATION_PLAN → IMPLEMENTATION_STATUS → DECISIONS → AGENTS.md`, with the accepted authorization manifest governing this bounded transaction. W0/W1/W2 canonical inputs are:

- `docs/stage4/STAGE4_UXIA_STRATEGY.md`;
- `docs/stage4/STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`;
- `docs/stage4/STAGE4_INFORMATION_ARCHITECTURE.md`;
- `docs/stage4/STAGE4_USER_JOURNEYS.md`;
- `docs/stage4/STAGE4_INTERACTION_AND_STATE_MODEL.md`.

Stage 3 research inputs remain non-implementation research evidence:

- `R1_LEARNING_PRODUCT_RESEARCH.md` and `R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md`;
- `R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`;
- `R3_PIPELINE_ARCHITECTURE_RESEARCH.md`;
- `R4_CROSS_RESEARCH_RECONCILIATION.md`;
- `STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`, `STAGE3_RESEARCH_CONSTRAINTS.md`, and `STAGE3_RESEARCH_STRATEGY.md`.

### 2.2 Ten-finding disposition

| Finding | Rejected-candidate defect | REM-001 evidence | Outcome |
|---|---|---|---|
| F1 | Three of eight mandatory scores were absent | Section 18 gives every material recommendation all eight named dimensions | `PASS` |
| F2 | Broad Stage 3 lane summaries replaced exact traceability | Sections 9–13 and 18 cite `R1-F*`, `R1S-F*`, `REQ-EXP-*`, `R2-F*`, `R3-G*`, `R4-C*`/`R4-OD*` or exact source section | `PASS` |
| F3 | Unauthorized hybrid current/future labels | Section 17 defines and uses all seven verbatim canonical labels; no label is redefined | `PASS` |
| F4 | “48/48” assertion had no auditable lifecycle trace | Section 16 maps every `CAP-001`…`CAP-048` and every omission invariant to surfaces, states, handoffs, risks, and W3 proof | `PASS` |
| F5 | Settled semantics were reopened or misstated | Both Full Mock Speaking paths remain; current media dictation remains coaching-only; `R4-OD002` remains owner choice | `PASS` |
| F6 | Invalid owner-decision prefix and missing rationale | Section 19 uses `OD-REF-###` and the complete required owner-decision schema | `PASS` |
| F7 | No specialist IELTS product UX evidence | Sections 4 and 11 include E2, Magoosh, IELTS Advantage, SmallTalk2Me, GEL IELTS Flex, TestGlider, and IELTS Ready/IDP observations | `PASS` |
| F8 | Source return stopped at Capture and separated remediation | Sections 10 and 12 close the exact-source loop through review, transfer, error, remediation, and contextual reopen | `PASS` |
| F9 | Teaching was collapsed into feedback | Sections 9 and 11 provide skill-specific instruction, examples, guided reconstruction, fading, clean retry, delayed retest, and transfer | `PASS` |
| F10 | 15 screens masked 12 system gaps and five root gaps | Sections 5–15 cover 24 systems and G1–G5 across screen, system, and quality axes | `PASS` |

## 3. Research Methodology & Evidence Quality Standards

### 3.1 Method

1. Refresh and pin exact canonical Git/GitHub provenance.
2. Verify activation, predecessor freeze, audit comments, accepted authorization, integration topology, and post-merge CI.
3. Read all controlling W0/W1/W2 and Stage 3 evidence.
4. Inspect PR #176 exact-head artifact and its 10-finding rejection as historical evidence.
5. Inspect current runtime/source only to distinguish current truth from target research.
6. Conduct public, read-only external research with no accounts, uploads, purchases, subscriptions, messages, or other external mutations.
7. Prefer official/primary sources; preserve observation date, confidence, and limitations.
8. Separate observed mechanics, research inference, unknowns, owner decisions, and downstream W3 candidates.
9. Trace recommendations to Stage 3 and canonical capabilities.
10. Verify sole-file diff, exact branch/base, Draft PR, and natural exact-head CI before terminating for new independent re-audit.

### 3.2 Evidence rules

| Evidence form | Permitted claim |
|---|---|
| `[VERIFIED]` canonical or primary evidence | Exact documented fact within its stated scope |
| `[INFERENCE]` | Design implication whose premises and limitations are stated |
| `[UNKNOWN]` | Open or unverified claim; never upgraded for completeness |
| Public product/official marketing page | Observable public framing and described mechanics only |
| Unauthenticated page inspection | No claims about gated UI, scoring calibration, retention, or actual learner outcomes |
| Competitor score/AI claim | Discovery input only; never official IELTS truth |

Time-sensitive product pages were observed on 2026-08-21. The Agent Reach search endpoint required an unavailable API key, so its documented Jina Reader path was used for public-page retrieval and independent web search was used to discover primary URLs. No account side effects occurred.

### 3.3 Recommendation and Anti-RPS rules

Each material recommendation has exactly one `KEEP`, `ADAPT`, or `REJECT` disposition and one Anti-RPS class:

- Class A — genuinely new user capability; must be strictly justified;
- Class B — improved presentation of an existing capability;
- Class C — consolidation/rehome of existing capability;
- Class D — removal/rejection of redundant presentation while preserving semantics.

Qualitative scores are `HIGH`, `MEDIUM`, or `LOW` for:
`TASK_FIT`, `INTERACTION_CLARITY`, `LEARNING_VALUE`, `COGNITIVE_LOAD`, `MOBILE_QUALITY`, `ACCESSIBILITY_SIGNAL`, `OMNIIELTS_FIT`, and `EVIDENCE_CONFIDENCE`. “High cognitive load” in Section 18 means a favorable score—low avoidable burden—not a claim that the interaction is intrinsically easy.

## 4. Comprehensive Reference Source Register

All material records use the controlling schema. “Direct product inspection” means public, unauthenticated surface inspection unless stated otherwise.

### REF-OFFICIAL-001

**PRODUCT:** IELTS Academic sample tests\
**SURFACE / CAPABILITY:** official computer/paper task families and timed familiarization\
**OBSERVED_PATTERN:** samples let candidates experience task types, timed conditions, answer review, and model-answer comparison.\
**SOURCE:** https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** controls strict runner/task semantics and supports clear Practice versus Exam framing.\
**LIMITATIONS:** sample availability is not a complete production-interface specification.

### REF-OFFICIAL-002

**PRODUCT:** IELTS Academic Writing format\
**SURFACE / CAPABILITY:** Task 1/Task 2 timing, word expectations, weighting, and rubric dimensions\
**OBSERVED_PATTERN:** two-task structure, approximately 20/40-minute allocation, 150/250-word minimums, four criteria, and heavier Task 2 weighting.\
**SOURCE:** https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** bounds prompts, timers, editor chrome, review, and rubric drill-down.\
**LIMITATIONS:** does not validate automated scoring or a learning curriculum.

### REF-OFFICIAL-003

**PRODUCT:** IELTS Academic Speaking format\
**SURFACE / CAPABILITY:** Parts 1–3, Part 2 preparation/long turn, and public criteria\
**OBSERVED_PATTERN:** face-to-face recorded interview, three distinct parts, one-minute Part 2 preparation, and four assessment criteria.\
**SOURCE:** https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** controls strict simulation and grounds practice feedback dimensions.\
**LIMITATIONS:** human-examiner scoring cannot be equated to an automated product estimate.

### REF-OFFICIAL-004

**PRODUCT:** IELTS Ready / British Council\
**SURFACE / CAPABILITY:** onboarding, mini/full mocks, courses, progress, recommendations\
**OBSERVED_PATTERN:** diagnostic-style mocks, targeted practice, model answers, optional AI feedback, progress tracking, and a personalized study guide are presented as a joined preparation offer.\
**SOURCE:** https://takeielts.britishcouncil.org/take-ielts/prepare/ielts-ready\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** demonstrates official-provider separation of readiness checks, skill work, practice, feedback, and progress.\
**LIMITATIONS:** public descriptions do not expose complete authenticated flows; AI scores remain estimates.

### REF-OFFICIAL-005

**PRODUCT:** IELTS by IDP app\
**SURFACE / CAPABILITY:** self-assessment, checklist, personalized resources, quizzes, progress\
**OBSERVED_PATTERN:** a preparation checklist and resource recommendations are framed around level, goals, and progress; quizzes provide immediate feedback and completion visibility.\
**SOURCE:** https://ielts.idp.com/prepare/article-everything-you-need-ielts-by-idp-app and https://ielts.idp.com/prepare/article-prepare-smarter-with-our-ielts-quizzes\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** informs low-friction mobile re-entry and next-action framing.\
**LIMITATIONS:** descriptions are promotional and do not establish learning efficacy.

### REF-IELTS-001

**PRODUCT:** Magoosh IELTS\
**SURFACE / CAPABILITY:** lesson → practice → explanation → schedule → mock/report\
**OBSERVED_PATTERN:** public plan pages describe video/text explanations, practice questions, study schedules, full mocks, performance breakdowns, and limited graded productive assessments.\
**SOURCE:** https://ielts.magoosh.com/plans and https://ielts.magoosh.com/practice_tests/free\
**SOURCE_TYPE:** DIRECT_PRODUCT_INSPECTION\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** MEDIUM\
**WHY_RELEVANT:** supports keeping explanation adjacent to practice while retaining a separate holistic mock/report path.\
**LIMITATIONS:** gated interactions were not inspected; score prediction and outcome claims are unverified marketing.

### REF-IELTS-002

**PRODUCT:** E2Language\
**SURFACE / CAPABILITY:** method lessons, practice, study pathway, mock feedback\
**OBSERVED_PATTERN:** public surfaces organize method lessons, practice questions, sample answers, a study pathway, mock/mini-mock assessment, and delayed teacher feedback.\
**SOURCE:** https://www.e2language.com/\
**SOURCE_TYPE:** DIRECT_PRODUCT_INSPECTION\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** MEDIUM\
**WHY_RELEVANT:** exposes a legible Learn/Practice/Assessment division and explicit human-feedback handoff.\
**LIMITATIONS:** authenticated course flow and feedback quality were not inspected.

### REF-IELTS-003

**PRODUCT:** IELTS Advantage VIP\
**SURFACE / CAPABILITY:** diagnostic, structured instruction, personalized plan, human feedback\
**OBSERVED_PATTERN:** public material describes stepwise video lessons, diagnostic assessment, study plan, expert feedback on submissions, and targeted improvement guidance.\
**SOURCE:** https://www.ieltsadvantage.com/ and https://www.ieltsadvantage.com/vip-academy/\
**SOURCE_TYPE:** DIRECT_PRODUCT_INSPECTION\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** MEDIUM\
**WHY_RELEVANT:** supports first-class instruction before productive attempts and feedback anchored to learner work.\
**LIMITATIONS:** product efficacy, examiner equivalence, gated lesson order, and testimonials were not validated.

### REF-IELTS-004

**PRODUCT:** SmallTalk2Me IELTS Speaking\
**SURFACE / CAPABILITY:** full speaking simulation, recording replay, dimension drill-down\
**OBSERVED_PATTERN:** public surfaces show Parts 1–3, timed recording, transcript, replay, dimension feedback, strengths/weaknesses, and suggested improvements.\
**SOURCE:** https://smalltalk2.me/ielts\
**SOURCE_TYPE:** DIRECT_PRODUCT_INSPECTION\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** MEDIUM\
**WHY_RELEVANT:** informs speaking review drill-down and return from a report to a specific practice target.\
**LIMITATIONS:** scoring accuracy, dataset claims, and official alignment are unverified; an estimate must not be presented as calibrated IELTS scoring.

### REF-IELTS-005

**PRODUCT:** GEL IELTS Flex\
**SURFACE / CAPABILITY:** readiness mini-mock, full mock, productive feedback\
**OBSERVED_PATTERN:** public pages describe mini/full mock entry points and AI feedback for each Speaking part and Writing task.\
**SOURCE:** https://famtest.gelielts.cn/\
**SOURCE_TYPE:** DIRECT_PRODUCT_INSPECTION\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** LOW\
**WHY_RELEVANT:** provides a specialist example of choosing bounded readiness versus full simulation and drilling into productive tasks.\
**LIMITATIONS:** regional/public surface was sparse; authenticated flows and scoring validity were not inspected.

### REF-IELTS-006

**PRODUCT:** TestGlider IELTS\
**SURFACE / CAPABILITY:** mock → report → lowest-skill section practice\
**OBSERVED_PATTERN:** public material describes full/section tests, rapid reports, answer explanations/model answers, corrections, and a loop from lowest score to section practice.\
**SOURCE:** https://www.testglider.com/ielts/en and https://blog.testglider.com/testglider-for-ielts-membership-information/\
**SOURCE_TYPE:** DIRECT_PRODUCT_INSPECTION\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** LOW\
**WHY_RELEVANT:** informs scorecard-to-targeted-next-action routing.\
**LIMITATIONS:** one detailed source is older; authenticated flows and AI-score validity were not verified.

### REF-INSTR-001

**PRODUCT:** retrieval-practice research (Roediger & Karpicke)\
**SURFACE / CAPABILITY:** independent retrieval and delayed retention\
**OBSERVED_PATTERN:** repeated retrieval can outperform restudy on delayed tests even when restudy looks better immediately.\
**SOURCE:** https://pubmed.ncbi.nlm.nih.gov/16507066/\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** supports clean independent and delayed retests rather than treating fluent restudy as mastery.\
**LIMITATIONS:** prose-memory experiments do not prescribe one universal IELTS interaction flow.

### REF-INSTR-002

**PRODUCT:** worked-example fading research\
**SURFACE / CAPABILITY:** worked solution → faded steps → independent problem\
**OBSERVED_PATTERN:** fading and feedback placement can affect near/far transfer; optimal sequence depends on task and learner.\
**SOURCE:** https://doi.org/10.1002/j.2168-9830.2009.tb01007.x\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** grounds the transition from model analysis to guided reconstruction to independent trial.\
**LIMITATIONS:** engineering problem-solving evidence must be adapted, not directly universalized to language skills.

### REF-INSTR-003

**PRODUCT:** Cambridge Handbook of Multimedia Learning\
**SURFACE / CAPABILITY:** coherence, signaling, redundancy, spatial/temporal contiguity\
**OBSERVED_PATTERN:** reducing extraneous processing and integrating corresponding representations can improve learning.\
**SOURCE:** https://doi.org/10.1017/9781108894333.019\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** informs source/player/transcript layout, progressive disclosure, and mobile recomposition.\
**LIMITATIONS:** principles are conditional; they do not justify hiding required context or accessibility alternatives.

### REF-INSTR-004

**PRODUCT:** Khan Academy Mastery\
**SURFACE / CAPABILITY:** lesson/practice/quiz/test hierarchy and recommended follow-up\
**OBSERVED_PATTERN:** varied activity types, explicit skill levels, level-up/down visibility, and lesson recommendations after broader assessment.\
**SOURCE:** https://support.khanacademy.org/hc/en-us/articles/115002552631-What-are-Course-and-Unit-Mastery and https://support.khanacademy.org/hc/en-us/articles/360037127892\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** demonstrates a legible curriculum/practice/assessment relationship and report-to-next-action loop.\
**LIMITATIONS:** mastery labels and exact thresholds are product-specific and cannot be copied as IELTS validity.

### REF-SOURCE-001

**PRODUCT:** Language Reactor\
**SURFACE / CAPABILITY:** cue-synchronized playback, word lookup/save, auto-pause, exact subtitle navigation\
**OBSERVED_PATTERN:** current subtitle, previous/replay/next controls, dictionary lookup, save-current-subtitle, word saving across content, and Anki export connect viewing to reuse.\
**SOURCE:** https://www.languagereactor.com/help/basic and https://www.languagereactor.com/\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** MEDIUM\
**WHY_RELEVANT:** supplies a strong exact-cue capture and context-preserving media reference.\
**LIMITATIONS:** extension/platform dependencies, machine translations, and gated saving were not evaluated for adoption.

### REF-SOURCE-002

**PRODUCT:** LingQ\
**SURFACE / CAPABILITY:** import, transcript reading/listening, saved vocabulary, review, cross-device context\
**OBSERVED_PATTERN:** user content can become an interactive lesson; saved words remain in context and can enter SRS review while source/lesson state syncs.\
**SOURCE:** https://www.lingq.com/en/learn-english-online/ and https://www.lingq.com/en/ios-app/\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** demonstrates source → saved lexical item → contextual review without severing the source lesson.\
**LIMITATIONS:** no claim is made about its learning efficacy or identity/persistence architecture.

### REF-SOURCE-003

**PRODUCT:** Readwise Reader annotations\
**SURFACE / CAPABILITY:** highlight, note, tag, original-context return, export\
**OBSERVED_PATTERN:** document and highlight tags remain distinct; tagged highlights can be browsed by parent document and reopened in original context; exports retain URL and metadata.\
**SOURCE:** https://docs.readwise.io/reader/docs/faqs/highlights-tags-notes and https://docs.readwise.io/reader/docs/faqs/exporting\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** supports exact-context reuse and provenance-preserving export.\
**LIMITATIONS:** its cloud sync and data model are not architectural recommendations for OmniIELTS.

### REF-SEARCH-001

**PRODUCT:** Readwise Reader Search\
**SURFACE / CAPABILITY:** global full-text search, mobile entry, offline fallback, in-document search\
**OBSERVED_PATTERN:** library-wide search covers document content/metadata; when offline it falls back to synced on-device content; results and in-document search are separate scopes.\
**SOURCE:** https://docs.readwise.io/reader/docs/faqs/searching\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** informs honest global/offline scope and direct return without implying a second content owner.\
**LIMITATIONS:** server/on-device architecture and feed exclusions are product-specific.

### REF-SEARCH-002

**PRODUCT:** Anki Browser Search\
**SURFACE / CAPABILITY:** exact/field/tag/deck/state search\
**OBSERVED_PATTERN:** composable query operators expose existing notes/cards without duplicating them and preserve field/tag/deck ownership.\
**SOURCE:** https://docs.ankiweb.net/searching\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** supports scoped filters, explicit result types, and reveal-only search ownership.\
**LIMITATIONS:** syntax density is unsuitable as the default mobile interface.

### REF-LIFE-001

**PRODUCT:** The Update Framework (TUF)\
**SURFACE / CAPABILITY:** trusted metadata roles, version/freshness checks, rollback/mix-and-match resistance\
**OBSERVED_PATTERN:** signed root/targets/snapshot/timestamp roles, version comparisons, and abort-on-rollback behavior separate trust verification from payload availability.\
**SOURCE:** https://theupdateframework.io/docs/metadata/ and https://github.com/theupdateframework/specification/blob/master/tuf-spec.md\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** informs user-visible verified/rejected/stale/offline-last-known-good distinctions for the existing signed catalog.\
**LIMITATIONS:** this is a reference vocabulary, not authorization to replace the current Ed25519 catalog design.

### REF-LIFE-002

**PRODUCT:** in-toto and Sigstore\
**SURFACE / CAPABILITY:** signed provenance, expected identity, artifact digest, verification record\
**OBSERVED_PATTERN:** signed layout/link or certificate/signature/digest evidence enables clients to verify expected actors and artifact integrity; transparency records can support audit.\
**SOURCE:** https://github.com/in-toto/docs/blob/master/in-toto-spec.md and https://docs.sigstore.dev/\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** supports a plain-language Trust & Provenance inspection surface and inspectable failure reasons.\
**LIMITATIONS:** neither framework is selected or required; content rights and human review remain separate from signature validity.

### REF-ASR-001

**PRODUCT:** whisper.cpp\
**SURFACE / CAPABILITY:** offline desktop ASR candidate, device acceleration, VAD, Windows support\
**OBSERVED_PATTERN:** CPU-only and multiple GPU backends, quantization, VAD, and Windows builds expose substantial device/readiness variance.\
**SOURCE:** https://github.com/ggml-org/whisper.cpp\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** supports explicit Connected/Disconnected/Unavailable and capability detail rather than a binary promise.\
**LIMITATIONS:** benchmark, package, model, thermal, accuracy, and deployment choices remain Stage 5/owner concerns.

### REF-ASR-002

**PRODUCT:** Vosk\
**SURFACE / CAPABILITY:** offline/streaming ASR and model-size tradeoffs\
**OBSERVED_PATTERN:** offline streaming APIs and small/big model tiers make memory/accuracy/device limits material to readiness messaging.\
**SOURCE:** https://alphacephei.com/vosk/ and https://alphacephei.com/vosk/models\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** corroborates that “local ASR available” needs device/service/model context and honest fallback.\
**LIMITATIONS:** Vosk is not selected; published WERs are dataset-specific and not IELTS-speaking validity evidence.

### REF-A11Y-001

**PRODUCT:** WCAG 2.2 and WAI-ARIA Authoring Practices\
**SURFACE / CAPABILITY:** focus, target size, non-drag alternatives, dialog/combobox/grid keyboard behavior\
**OBSERVED_PATTERN:** focus must remain perceivable; targets need adequate size/spacing; dragging needs a pointer alternative; modal focus and composite widgets need defined keyboard contracts.\
**SOURCE:** https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ and https://www.w3.org/WAI/ARIA/apg/patterns/\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** bounds exam palettes, split panes, search, dialogs, timers, transcript rails, and mobile controls.\
**LIMITATIONS:** APG examples require testing with actual browsers and assistive technology.

### REF-A11Y-002

**PRODUCT:** W3C accessible audio/video guidance\
**SURFACE / CAPABILITY:** captions, transcripts, audio description, accessible player\
**OBSERVED_PATTERN:** accessible media includes text alternatives, accessible player controls, and interactive transcripts where appropriate.\
**SOURCE:** https://www.w3.org/WAI/media/av/\
**SOURCE_TYPE:** OFFICIAL_DOCS\
**OBSERVATION_DATE:** 2026-08-21\
**CURRENTNESS_CONFIDENCE:** HIGH\
**WHY_RELEVANT:** informs Media, Listening, Speaking, and recovery without allowing transcript leakage in strict evidence conditions.\
**LIMITATIONS:** teaching-mode access and strict-assessment accommodation must be modeled distinctly.

## 5. Three-Axis Whole-Product Experience Matrix

Axis A is the 15 canonical screen classes in Section 6. Axis B is the 24 systems below. Axis C is enforced by every row’s quality/risk column and by Sections 14–17.

| System | Start → terminal learning state | Primary screen classes | Required cross-surface handoff | Axis-C quality/risk focus | Material recs |
|---|---|---|---|---|---|
| SYS-01 Onboarding/re-entry/Today | goal/return → chosen next action | 01, 07, 15 | plan to exact activity and recoverable return | agency, backlog, interruption | REC-REM-001, 018 |
| SYS-02 Source→understanding→capture→learning | source cue → confirmed learning target | 03, 04, 05, 02 | immutable source locator follows target | continuity, privacy, mobile | REC-REM-002, 006 |
| SYS-03 Teaching/curriculum | diagnostic need → independent trial | 02, 06, 08–13 | skill lesson to matched practice | load, accessibility, agency | REC-REM-003, 010–014 |
| SYS-04 Practice→feedback→retry | attempt → learner action after feedback | 02, 03, 06, 08–13 | feedback to exact evidence and clean retry | evidence integrity | REC-REM-004, 015 |
| SYS-05 Spaced review/retention | due item → qualified review receipt | 01, 02, 06 | card to source and scheduling gateway | default deny, offline | REC-REM-005, 007 |
| SYS-06 Productive use/transfer | learned construct → varied output | 02, 06, 11–13 | receptive item to writing/speaking task | contamination, uncertainty | REC-REM-005, 014 |
| SYS-07 Error→remediation→clean retest | error hypothesis → clean/delayed result | 06, 08–14 | result anchor to teaching and new item | diagnosis honesty | REC-REM-004, 015 |
| SYS-08 Motivation/habit/backlog/re-entry | lapse/backlog → nonpunitive restart | 01, 07, 15 | recommendation with skip/adjust | agency, no shame | REC-REM-018 |
| SYS-09 Global Search/reuse | query → exact-context reopen | 01–07, 15 | result to existing owner/surface | offline/rebuild, privacy | REC-REM-008 |
| SYS-10 Library/capture/signed content | discover/import → trusted/reachable content | 02–05, 15 | catalog or source to learner record | trust, rights, retention | REC-REM-006, 009 |
| SYS-11 Vocabulary/collocation | encounter → retained productive use | 02–06 | source to staged capture/review/transfer | sense identity, modalities | REC-REM-005, 006 |
| SYS-12 Listening learning | audio cue → independent decoding/transfer | 03, 06, 08 | timestamp to replay/remediation | transcript contamination | REC-REM-010 |
| SYS-13 Reading learning | passage evidence → independent rationale/transfer | 04, 06, 09, 10 | locator to evidence/rationale/retest | split attention, semantics | REC-REM-011 |
| SYS-14 Writing learning | model analysis → independent revised/new task | 06, 11, 12 | response span/rubric to lesson/retest | false scoring, revision bias | REC-REM-012 |
| SYS-15 Speaking learning | model/controlled → spontaneous varied response | 06, 13 | recording/span to lesson/new prompt | privacy, evaluator limits | REC-REM-013 |
| SYS-16 IELTS skill practice | chosen skill/task → feedback/targeted practice | 08–13 | task result to learning owner | official semantics, aids visible | REC-REM-014 |
| SYS-17 IELTS strict simulation | preflight → submitted/recovered result | 08–14 | zero aids; result exits exam shell | fidelity, recovery, AT | REC-REM-016 |
| SYS-18 Full Mock remediation | LRW/Speaking path → targeted next action | 14, 06–13 | scorecard to observed weakness/lesson | no mastery overclaim | REC-REM-017 |
| SYS-19 Analytics→next action | separated measures → learner-chosen action | 07, 01, 06 | chart segment to evidence/activity | uncertainty, non-color state | REC-REM-019 |
| SYS-20 Personalization/adaptation | goal/evidence → explainable suggestion | 01, 07, 15 | suggestion exposes why/skip/change | agency, model limits | REC-REM-018 |
| SYS-21 AI/coaching safeguards | opt-in aid → labeled output/no false evidence | 03, 06, 11–13, 15 | assistance receipt to EvidencePolicy | consent, uncertainty | REC-REM-020 |
| SYS-22 Data/privacy/recovery | consent/storage event → safe completion/recovery | 15 and global | status to export/restore/revoke | durable read-back, plain language | REC-REM-021 |
| SYS-23 Desktop ASR readiness | readiness check → connected/recovery/manual path | 03, 15 | ingestion to explicit service state | privacy, device variance | REC-REM-022 |
| SYS-24 Evidence/provenance/dispute | attempt → inspectable qualified receipt | 06, 07, 15 | response/source/scorer/context retained | PROV-9, uncertainty | REC-REM-023 |

## 6. 15 Canonical Screen-Class Syntheses & Material Variants

Every screen preserves direct access. Suggested sequences are guidance, never locks. “Target” below means `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` unless another canonical label is shown.

### 6.1 Screen 01 — Today / Home

- **Job and variants:** choose a useful next action on first day, ordinary due day, overload, return after absence, empty queue, offline/degraded storage, interrupted lease, or approaching exam.
- **Current truth:** `[CURRENT_REHOMED]` Today composer/runner, single-lease execution, due work, and pacing are preserved by `CAP-001`, `CAP-002`, `CAP-033`, and `S4-OMIT-008`.
- **Synthesis:** one primary “continue/next” card explains why it is suggested and exposes Start, Change, Skip, and workload adjustment. Secondary cards surface due review, skill work, and exam readiness without inventing a single readiness number. This adapts IELTS Ready/IDP’s next-step framing while rejecting mandatory lock-step navigation.
- **Handoffs:** exact activity → recoverable runner → receipt → Today/Analytics; lapse/backlog → nonpunitive re-entry. Search is available but not a new top-level owner.
- **Mobile/accessibility:** one-thumb primary action, no horizontal dashboard dependence, visible focus, status text not color alone, readable due/estimate language.
- **Primary recs/risks:** `REC-REM-001`, `REC-REM-018`; risk is recommendation dominance or shame framing.

### 6.2 Screen 02 — Vocabulary & Collocation

- **Job and variants:** inspect sense/source; choose passive or active goal; recognize, cloze, type, dictate, pronounce, produce, suspend, confirm duplicate/sense, review, and use in novel context.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-003`, `CAP-012`, `CAP-015`, `CAP-016` and `S4-OMIT-007` retain drills, capture, audio, evidence gating, and suspension.
- **Synthesis:** a card is a sourced lexical object, not a front/back tile. It shows sense, collocation frame, provenance, and Return to source. New captures remain staged until confirmed; assistance remains visible; multimodal practice leads to productive use without collapsing the mastery dimensions identified in Stage 3.
- **Handoffs:** source cue → staged capture → confirmation → selected goal → instruction/practice → qualified review → productive transfer → error/remediation → exact source.
- **Mobile/accessibility:** bottom-sheet source detail, large answer targets, non-drag alternatives, screen-reader-safe strict answer masking, audio alternatives.
- **Primary recs/risks:** `REC-REM-005`, `REC-REM-006`; risk is recognition masquerading as productive mastery.

### 6.3 Screen 03 — Video / Media

- **Job and variants:** import/resolve; load partial/complete/unaligned transcript; Watch/Normal, Noticing, Shadowing, Strict Dictation, Practice Dictation, Retell; direct/guided use; edit/split/merge revision; recorder/export/exit; offline/degraded.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-004`–`CAP-010`, `CAP-040`, `CAP-047` and `S4-OMIT-002`–`004`, `009`. Current Strict and Practice Dictation are coaching envelopes (`affectsSchedule:false`); Shadowing is coaching-only; Retell is not automatically coaching-only but needs a qualified evaluator for evidence.
- **Synthesis:** persistent player, active cue, transcript context, rate/loop, and draft survive mode switches. Media modes and seven guided steps are orthogonal: a learner may work directly or invoke optional orchestration. Exact cue identity remains visible through capture, error, review, and source return.
- **Handoffs:** URL/file → resolver/readiness → revision/cue → mode/step → target/error → later reopen at timestamp.
- **Mobile/accessibility:** player plus transcript drawer, fixed-control safe area, caption/transcript alternatives in teaching, DOM/ARIA answer omission in strict dictation.
- **Primary recs/risks:** `REC-REM-002`, `REC-REM-010`, `REC-REM-022`; risks are split attention, transcript contamination, and lost cue revision.

### 6.4 Screen 04 — Article / Source Reader

- **Job and variants:** library/inbox/later/archive; parse/load/index/read; select/capture/note/search; unaligned text; parse or rights failure; missing/private/offline source; changed revision.
- **Current truth:** `[CURRENT_REHOMED]` private-source ingestion and capture are preserved by `CAP-011` and `CAP-012`. Structured parsing/readability candidates remain `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]`.
- **Synthesis:** distraction-reduced reading preserves source title, rights/provenance, stable locator, selected span, notes, and exact return. Capture does not remove the learner from the passage. Search results reopen the source at the match, with honest fallback when the original is missing, unaligned, private on another device, or the index is rebuilding.
- **Handoffs:** source span → staged target/note → Library/review/transfer/error → original position or best-available revision.
- **Mobile/accessibility:** single-column reflow, selection toolbar that does not cover text, keyboard selection alternatives, heading/landmark structure.
- **Primary recs/risks:** `REC-REM-002`, `REC-REM-008`, `REC-REM-011`; risks are fake alignment and silent locator drift.

### 6.5 Screen 05 — Capture Inbox

- **Job and variants:** empty/loading; manual or source capture; edit/batch; duplicate/sense conflict; confirm/discard/undo; degraded storage; imported source.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-012` is the sole Capture entry point and staged-capture substrate.
- **Synthesis:** every candidate shows source context, proposed sense/collocation, goal, duplicate status, and confirmation consequence. Confirming chooses the existing lexical owner and can schedule; discard remains recoverable. Capture is a handoff, not a parallel library.
- **Handoffs:** Reader/Media/IELTS/error/manual → one Inbox → Library/card → source return.
- **Mobile/accessibility:** bottom sheet for quick capture; full-screen batch confirmation; explicit labels and undo announcement.
- **Primary recs/risks:** `REC-REM-006`; risk is cold-start scheduling before sense/source confirmation.

### 6.6 Screen 06 — Error Notebook / Remediation

- **Job and variants:** overview/heatmap/list/detail; exact attempt/evidence; recurrence; misconception hypothesis; insufficient/disputed provenance; ignore/monitor/remediate/resolved; clean and delayed retest.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-014`, `CAP-016`, and evidence/provenance systems remain; a complete teaching-to-delayed-retest experience is `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]`.
- **Synthesis:** an error detail begins with what happened, where, under what assistance, and confidence—not a causal label. Remediation selects a skill-appropriate teaching block, guided/faded practice, then a clean parallel item and later varied retest. Return to exact source evidence is always available when legally/device-wise accessible.
- **Handoffs:** attempt receipt → pattern/hypothesis → teaching → guided/faded → clean retest → delayed/transfer → updated state/Today.
- **Mobile/accessibility:** progressive disclosure for provenance, plain-language uncertainty, accessible charts plus lists, no color-only severity.
- **Primary recs/risks:** `REC-REM-004`, `REC-REM-015`, `REC-REM-023`; risk is false diagnosis from recurrence alone.

### 6.7 Screen 07 — Analytics

- **Job and variants:** retention, activity/habit, weakness, IELTS practice, transfer, pacing, evidence/provenance, stale/insufficient/offline, drill-down and next action.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-013` and `S4-OMIT-008` retain analytics and pacing; unified mastery remains rejected.
- **Synthesis:** Memory/FSRS, skill performance, diagnostic uncertainty, IELTS practice, and transfer are separate projections. Every chart segment has a textual equivalent, evidence basis, uncertainty/status, and an action or source drill-down. Vanity metrics never stand alone as learning truth.
- **Handoffs:** measure → evidence list → source/activity/remediation → optional Today plan.
- **Mobile/accessibility:** cards recompose rather than compress; tables/lists accompany charts; focusable data summaries.
- **Primary recs/risks:** `REC-REM-019`, `REC-REM-023`; risk is one readiness/mastery number.

### 6.8 Screen 08 — IELTS Listening

- **Job and variants:** preflight/instructions; four parts and official task families; strict single-play/timer/palette/recovery/review; practice playback/scrub; post-attempt answer/rationale/audio-cue review.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-018`, `CAP-019`, `CAP-031`–`033`. Learning additions remain distinct from strict simulation.
- **Synthesis:** Exam is a clean shell with no transcript, hints, vocabulary tools, or streaks. Practice review returns each answer to the timestamped acoustic evidence, explains distractor/paraphrase and missed-cue reasoning, then routes to listening teaching and a clean parallel item.
- **Handoffs:** official-format attempt → observed result → cue-grounded review → targeted listening instruction/practice → optional later reassessment.
- **Mobile/accessibility:** large palette controls, audio readiness before start, announced time warnings, no audio-only instruction, accommodation-compatible time model.
- **Primary recs/risks:** `REC-REM-010`, `REC-REM-014`, `REC-REM-016`; risk is post-attempt transcript being misread as first-pass evidence.

### 6.9 Screen 09 — IELTS Academic Reading

- **Job and variants:** three passages; split pane/divider; highlight; question jump/palette; timer/recovery/submit; practice evidence/rationale and incorrect-only retry.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-020`, `CAP-031`–`033`.
- **Synthesis:** strict mode preserves passage/question separation and official semantics. Practice review filters incorrect/unanswered items, highlights the supporting/contradicting/absent passage evidence, explains the reasoning, and routes to question-type or reading-subskill teaching before clean parallel retry.
- **Handoffs:** response → passage locator/rationale → targeted teaching → clean/varied retest.
- **Mobile/accessibility:** passage and question switch with preserved scroll/focus; no tiny draggable-only divider; T/F/NG and Y/N/NG labels remain explicit.
- **Primary recs/risks:** `REC-REM-011`, `REC-REM-014`, `REC-REM-016`; risk is generic answer-key review without evidence.

### 6.10 Screen 10 — IELTS General Training Reading

- **Job and variants:** three GT sections with multiple short texts/workplace/general-interest material; all palette/timer/recovery/review states of Reading.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-021`, `CAP-031`–`033`.
- **Synthesis:** preserve GT track identity, section/text labeling, and direct text switching. Practice evidence return and remediation mirror Academic Reading but use GT material/register and do not silently reuse Academic examples.
- **Handoffs:** track-specific response → exact GT text locator → subskill/question-type lesson → parallel GT item.
- **Mobile/accessibility:** clear text tabs with retained position; descriptive labels for multi-text sections.
- **Primary recs/risks:** `REC-REM-011`, `REC-REM-014`, `REC-REM-016`; risk is Academic/GT leakage.

### 6.11 Screen 11 — Writing Task 1 Academic + GT

- **Job and variants:** Academic visual/table/chart/process/map with accessible data fallback; GT purpose/recipient/register letter; model analysis, guided reconstruction, independent timed/untimed draft, autosave/recovery, criterion review, revision and fresh task.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-022`, `CAP-023`, `CAP-025` and current practice estimates. First-class curriculum/fading is `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]`.
- **Synthesis:** Learn analyzes criterion-linked features and contrasts; Practice can guide planning/reconstruction; Exam shows prompt/editor/timer only. Feedback anchors claims to response spans and public criteria, asks the learner to act, then separates assisted revision from a later clean/fresh task.
- **Handoffs:** diagnostic → lesson/model → guided reconstruction → independent response → criterion/span feedback → revision → fresh/delayed task.
- **Mobile/accessibility:** zoomable visual plus semantic table/text alternative; stable autosave; keyboard-accessible criterion anchors.
- **Primary recs/risks:** `REC-REM-012`, `REC-REM-014`, `REC-REM-016`; risk is revision after revealed model counted as transfer.

### 6.12 Screen 12 — Writing Task 2

- **Job and variants:** prompt analysis; outline; model/contrast; guided paragraph or argument reconstruction; independent timed/untimed essay; recovery; criterion review; revision and fresh prompt.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-024`–`025`; calibrated band scoring remains `[FUTURE_UX_RESERVED]` unless validated.
- **Synthesis:** curriculum addresses task response, organization, lexical choice, and grammar without turning rubric checklists into formulaic templates. Span-grounded feedback distinguishes correctness from explanation and prompts revision; a fresh prompt provides transfer evidence.
- **Handoffs:** weakness/rubric → lesson → guided component → whole response → feedback/revision → fresh/delayed response.
- **Mobile/accessibility:** autosave, persistent prompt, non-obscuring word/timer status, full keyboard editing.
- **Primary recs/risks:** `REC-REM-012`, `REC-REM-014`, `REC-REM-016`; risk is automated estimate presented as official band.

### 6.13 Screen 13 — Speaking

- **Job and variants:** mic/readiness; Parts 1–3; Part 2 cue/prep/notes/record; replay/transcript; criterion drill-down; recording failure/export/privacy; model/controlled/parallel/novel practice.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-026`–`028` and `S4-OMIT-010`. Future examiner simulation remains `[OWNER_RECONFIRMED_FUTURE]`; evidence requires an evaluator.
- **Synthesis:** Learn/Practice may expose models, discourse moves, pronunciation targets, replay, and coaching. Exam preserves official timing and zero in-run coaching. Review anchors feedback to recording/transcript spans, labels scorer/version/uncertainty, and routes to a new prompt rather than crediting rehearsal as spontaneous transfer.
- **Handoffs:** diagnostic → model/controlled → parallel → independent novel response → review → targeted lesson → later prompt.
- **Mobile/accessibility:** explicit mic state, input-level feedback, captions/transcripts after permitted reveal, notes pinned for Part 2, alternatives when recording unavailable.
- **Primary recs/risks:** `REC-REM-013`, `REC-REM-014`, `REC-REM-016`, `REC-REM-020`; risk is false examiner/calibration language.

### 6.14 Screen 14 — Full Mock

- **Job and variants:** Academic/GT; precheck/equipment; LRW; Speaking immediately after LRW or independently scheduled; transitions/recovery/abort/submit; scorecard, observed limitations, and targeted remediation.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-029`–`033`. Both Speaking paths are canonical and are not owner decisions.
- **Synthesis:** preflight explains duration, recovery, audio/mic, and Speaking path. The exam shell is distraction-free and aid-free. Scorecard separates observed raw/criterion results from limitations, never mutates FSRS, and offers specific learner-chosen routes to teaching/practice plus optional later reassessment.
- **Handoffs:** strict attempt → scorecard → exact wrong/weak evidence → skill owner → teaching/practice → later section/full mock.
- **Mobile/accessibility:** exam-fit device warning without arbitrary lockout; recovery preserves exact position/time; accessible timers and palettes.
- **Primary recs/risks:** `REC-REM-016`, `REC-REM-017`; risk is one mock becoming mastery or a mandatory curriculum gate.

### 6.15 Screen 15 — Settings / Privacy / Data Safety

- **Job and variants:** learning/workload/accessibility; consent/revoke; session secret; audio; signed catalog/pack lifecycle; Desktop ASR readiness; export/restore; degraded storage; governance/About.
- **Current truth:** `[CURRENT_REHOMED]` `CAP-036`–`046`, `CAP-048` and `S4-OMIT-005`, `006`, `009`, `011`, `012`. Roadmap inspector is `[BACKGROUND_SYSTEM]` rehomed to About.
- **Synthesis:** plain-language groups expose consequences and recovery, not implementation jargon. Trust/pack states and ASR readiness are primary lifecycle cards. Consent is explicit/revocable; secrets remain session-contained; backup/restore uses preflight and durable read-back.
- **Handoffs:** global status → specific lifecycle card → recovery action → return to blocked activity.
- **Mobile/accessibility:** stacked forms, safe-area audio controls, visible focus/errors, confirmation plus undo where safe, no destructive swipe-only action.
- **Primary recs/risks:** `REC-REM-009`, `REC-REM-021`, `REC-REM-022`; risk is settings becoming a dumping ground or trust failures being hidden.

## 7. Video / Media Experience Deep Dive

### 7.1 Orthogonal mode and orchestration model

Six preserved modes are `Normal/Watch`, `Noticing`, `Shadowing`, `Dictation Strict`, `Dictation Practice`, and `Retell`. The reusable seven-step sentence session is an optional orchestration layer, not a mode and not an unlock graph. The state tuple is:

```text
SOURCE + REVISION + ACTIVE_CUE + MODE + OPTIONAL_STEP
+ PLAYBACK_RATE + LOOP + DRAFT + ASSISTANCE_TRACE + READINESS
```

Changing activity preserves the player, cue, transcript position, and drafts. Continue, Skip, Change Activity, Pause/Exit, and fatigue controls are explicit. The only target dictation task types are `FILL_GAPS` and `FULL_SENTENCE`; `WORD_REARRANGEMENT` remains rejected.

### 7.2 Seven-step session contract

| Step | Teaching purpose | Learner action | Assistance/evidence truth | Exit/return |
|---|---|---|---|---|
| 1 Listen | first-pass perception | listen without answer text | unassisted only if transcript absent | cue retained |
| 2 Dictate | decoding/spelling | full sentence or gaps | current Strict/Practice are coaching, schedule false | attempt retained |
| 3 Compare | notice mismatch | inspect evidence and self-correct | reveal contaminates same-item independence | return to attempt |
| 4 Notice | thought groups/form | mark chunks/weak forms | teaching/coaching | cue and annotations retained |
| 5 Shadow | articulation/rhythm | record/replay/compare | coaching-only | ephemeral audio policy |
| 6 Capture | lexical/collocation focus | stage target with sense/source | no FSRS until confirmation | Inbox/source |
| 7 Retell | productive synthesis | draft/speak from meaning | not automatically evidence; evaluator required | draft autosave/export |

Stage 3 trace: `R1-F006`, `R1-F007 [INFERENCE]`, `R1-F017 [VERIFIED]`, `R1-F018 [INFERENCE]`, `R1-F020 [INFERENCE]`, `R1-F029 [VERIFIED]`, `R1-F030 [INFERENCE]`, `R1-F044 [INFERENCE]`, `R1S-F001 [VERIFIED]`, `R1S-F002 [VERIFIED]`, `REQ-EXP-005`, `R3-F002`–`F003` and `R3-G002`. References: `REF-SOURCE-001`, `REF-SOURCE-002`, `REF-INSTR-003`, `REF-A11Y-002`.

### 7.3 Cue continuity and failure states

A cue reopen contract carries source kind/id, source revision, cue/segment identity, source-aligned start/end when real, selected text/span, and a human-readable fallback excerpt. Descriptive research vocabulary is not a database schema. Resegmentation may invalidate transcript-specific identifiers but must not orphan core FSRS cards. `SYNTHETIC_UI_LAYOUT_TIME != SOURCE_MEDIA_ALIGNMENT`; timing-dependent activity fails closed when alignment is absent.

Failure/recovery states: resolving, partial, reconnecting, unaligned, revision changed, exact cue unavailable, source private on another device, transcript missing, ASR disconnected/unavailable, recorder denied, storage degraded, offline cached, and export-before-exit. Each state retains the last safe context and a manual/import or later-retry path.

## 8. Vocabulary & Collocation Experience Deep Dive

### 8.1 Object and goal model

A lexical target has an active/passive goal, sense and collocational frame, source occurrences, assistance history, and separate outcome dimensions. It is not a single scalar. Stage 3 requires distinct visual/auditory recognition, spelling, definition recall, collocation, written production, spoken production, and transfer (STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md section 4.3; `R1-F010 [INFERENCE]`; `R1-F013 [VERIFIED]`).

### 8.2 Staged lifecycle

```text
ENCOUNTER AT EXACT SOURCE
→ STAGED CAPTURE
→ SENSE / DUPLICATE / GOAL CONFIRMATION
→ TARGETED TEACHING OR DIRECT PRACTICE
→ QUALIFIED REVIEW
→ PRODUCTIVE USE
→ ERROR / REMEDIATION IF NEEDED
→ CLEAN + DELAYED / VARIED RETEST
→ RETURN TO ANY SOURCE OCCURRENCE
```

Cold-start FSRS scheduling occurs only after confirmation. Return-to-source is present in card detail, review feedback, productive tasks, error entries, Analytics evidence, and Search results. When exact source is unavailable, show cached excerpt/provenance and explain why exact reopen is blocked.

### 8.3 Modality progression and safeguards

| Phase | Example activity families | Evidence rule |
|---|---|---|
| Notice/recognize | image/definition/context discrimination, sense/collocation contrast | scaffolded; no productive claim |
| Recall | definition/form recall, spelling, cloze, collocation repair | qualify by assistance and raw response |
| Auditory | recognition, dictation, pronunciation comparison | transcript/replay exposure recorded |
| Productive | constrained sentence, spoken use, morphology/register choice | task-specific evidence only |
| Transfer | new source/topic/modality use | distinct delayed/varied evidence; uncertainty retained |

Exact trace: `R1-F001 [VERIFIED]`, `F002 [VERIFIED]`, `F007 [INFERENCE]`, `F013–F016`, `F044–F045 [INFERENCE]`, `R1S-F001–F006`, `R1S-F012`, `R1S-F017 [INFERENCE]`, `REQ-EXP-007`, `REQ-EXP-010`. References: `REF-SOURCE-002`, `REF-SOURCE-003`, `REF-SEARCH-002`, `REF-INSTR-001`.

## 9. Instructional Curriculum & Faded Scaffolding Deep Dive (G1)

### 9.1 Controlling curriculum and conditional cycle

The canonical IELTS Skills Curriculum owns instruction:

```text
MODEL ANALYSIS → GUIDED RECONSTRUCTION → INDEPENDENT TRIAL
```

The Stage 3 eleven-step cycle is a `CONCEPTUAL_CANDIDATE_ONLY` research input:

```text
DIAGNOSE → TEACH → WORKED EXAMPLE → GUIDED PRACTICE → FADED GUIDANCE
→ INDEPENDENT → FEEDBACK → REMEDIATION → CLEAN RETEST
→ DELAYED RETEST → TRANSFER
```

REM-001 does not universalize one screen sequence. `REC-REM-003` keeps the three canonical curriculum phases and adapts the richer cycle by skill, prior knowledge, error type, and task distance. A learner can directly enter instruction, practice, or exam; recommendations explain a path without locking navigation.

### 9.2 Skill-specific instructional patterns

| Domain | Diagnose/teach and model | Guided → faded | Independent/clean | Delayed/transfer | Exact upstream trace |
|---|---|---|---|---|---|
| Vocabulary & collocation | sense network, morphology, register, collocational syntax; contrast confusables in source context | choose/rebuild frames; reduce definition/example/word-bank support | recall, cloze, dictation, written/spoken use with assistance absent | new source/topic/modality; separate productive dimensions | `R1-F013–F016`; `R1S-F002`, `F004–F006`, `F012`; LX section 4.3 |
| Listening | distinguish acoustic perception, segmentation, lexical access, integration, inference; replay exact missed cue after attempt | chunk/signpost/paraphrase/distractor work; gradually remove transcript, slowed rate, replay | first-pass parallel cue/task with no target reveal | different speaker/accent/topic and later official-format item | `R1-F006`, `F017–F020`, `F033`; `R1S-F001–F004`; `RQ-15` |
| Reading | skimming/scanning, lexical inference, discourse parsing; model evidence locator and T/F/NG entailment/contradiction/absence | guided annotation/evidence matching, then remove locator prompts | parallel passage/question with rationale generated by learner | new genre/topic, Academic/GT kept distinct | `R1-F005`, `F021–F022`, `F043`; `R1S-F002`, `F004`, `F007` |
| Writing | criterion-linked model analysis, paragraph/thematic progression, cohesion, hedging/register; contrast stronger/weaker examples | reconstruct outline/paragraph; fade prompts/checklists and target-revealing language | whole response without model; clean task after feedback exposure | fresh prompt and later task; revision is not transfer | `R1-F023–F028`, `F044`; `R1S-F001–F004`, `F006–F007`; `REQ-EXP-001` |
| Speaking | model discourse/fluency/pronunciation target; Part 2 ideation; contrast rehearsed and spontaneous demands | controlled response → parallel prompt with fading cues | unassisted new prompt with qualified evaluator | later topic/context, spontaneous/interactive demand | `R1-F020`, `F029–F033`, `F043`; `R1S-F001–F004`, `F007`; `REQ-EXP-001` |

`LX` above refers to `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`; its `4.3`–`4.6` skill requirements have no formal per-skill IDs, so exact source/section is used as the authorization requires.

### 9.3 Feedback is a teaching event

Feedback types remain separate: verification, corrective, explanatory, metalinguistic, evidence highlighting, contrastive example, and Socratic hint. The interface selects the least revealing form that can move learning forward; it records what was exposed. There is no universal immediate-feedback rule.

```text
ATTEMPT
→ WHAT WAS OBSERVED + SOURCE/RESPONSE ANCHOR
→ WHY / RULE / CONTRAST (WHEN SUPPORTED)
→ LEARNER ACTION: SELF-CORRECT / REVISE / EXPLAIN
→ GUIDANCE FADES
→ CLEAN PARALLEL RETEST
→ DELAYED / VARIED RETEST
```

Misconception labels are hypotheses with confidence, not diagnoses from one error. Outcome views keep `ERROR_RECURRENCE_RATE`, `MISCONCEPTION_RESOLUTION_RATE`, `CLEAN_RETEST_SUCCESS`, `DELAYED_RETEST_SUCCESS`, and `TRANSFER_AFTER_REMEDIATION` distinct.

### 9.4 Instructional failure guards

- No model/example text remains visible in a “clean” productive attempt.
- A same-item correction proves correction, not transfer.
- A revised essay after revealed feedback is not a novel-writing result.
- Rehearsed speech is not spontaneous transfer.
- Transcript-visible listening is not first-pass decoding.
- More explanation is not always better; progressive disclosure and learner choice control load.
- Blocking may support initial acquisition; interleaving later targets confusable discrimination rather than random variety.
- Skill lessons remain inside existing IELTS/domain ownership; there is no new top-level “Curriculum app.”

## 10. Exact Source-to-Learning & Context Continuity Deep Dive (G2)

### 10.1 Semantic lifecycle

```text
DISCOVER / IMPORT
→ PROCESS / NORMALIZE
→ READ / WATCH / LISTEN AT EXACT POSITION
→ STAGED CAPTURE / NOTE / ERROR
→ CONFIRM IDENTITY + GOAL
→ TEACH / PRACTICE
→ QUALIFIED REVIEW
→ PRODUCTIVE TRANSFER
→ ERROR / REMEDIATION
→ CLEAN + DELAYED RETEST
→ RE-ENCOUNTER / EXPAND
→ REOPEN ORIGINAL OR BEST-AVAILABLE SOURCE CONTEXT
```

The locator is a semantic UX contract, not a final schema. It must distinguish real source-aligned media time from UI layout time and support text positions that have no media alignment.

### 10.2 Continuity tuple and presentation

| Continuity dimension | Research vocabulary | User-visible behavior | Degraded fallback |
|---|---|---|---|
| Source identity | source kind/id, title, rights/provenance | stable Source header and “Return to source” | cached metadata plus unavailability reason |
| Revision identity | source/transcript revision and lineage | “source changed” notice with chosen revision | reopen latest plus preserved excerpt; never silently relocate |
| Exact locator | cue/segment and real start/end, or text span/anchor | seek/highlight and focus exact evidence | nearby context and explicit “exact position unavailable” |
| Lexical identity | lemma/sense/collocation and occurrence | one lexical owner with all occurrences | sense conflict returns to confirmation |
| Learning lineage | capture/card/error/attempt/retest relationship | trace from card/error/report back to source | local provenance view when source missing |
| Assistance/evidence | mode, scaffolding, prior exposure, raw response, scorer | inspectable receipt and honest badge | “insufficient provenance,” no positive inference |

### 10.3 Handoff contracts

1. **Source → Capture:** keep excerpt, locator, source revision, rights/private scope, proposed sense; capture remains in context.
2. **Capture → Library:** confirmation binds the existing lexical object and retains all source occurrences.
3. **Library/Review → Source:** every card/review can reopen a representative or selected occurrence.
4. **Practice/Exam → Review:** answer/response anchors return to passage span, media timestamp, writing span, or speaking recording segment when available.
5. **Review → Remediation:** teaching retains the exact triggering evidence but the clean retest uses disjoint/parallel content.
6. **Analytics/Search → Context:** result cards reveal the existing owner and deep-link to exact evidence, never copy content into a new store.

### 10.4 Revision and device failure semantics

- Current FNV/timestamp-derived transcript IDs can change on resegmentation; cross-revision mapping is a future pipeline need (`R3-F003`, `R3-G002`), not a current guarantee.
- Core card FSRS progress must not be described as orphaned by transcript revision; only transcript-specific lookup/progress needs translation.
- A private source absent on another device exposes metadata and a recovery/import action, not a dead link.
- Unaligned reading text never receives fabricated timestamps; timing-dependent actions are unavailable with an explanation.
- Deleted content pack assets do not delete learner records; contextual return shows retained record plus “pack not installed” and reinstall path when still trusted.
- Exported source data retains provenance and user-owned annotations where permitted.

Exact trace: `R1-F013`, `R1-F017`, `R1-F035`, `R1-F044`, `R1S-F006`, `R1S-F017`/PROV-9, `REQ-EXP-005`, `REQ-EXP-010`, `R2-F001`, `R2-F003`, `R2-F017`, `R2-F060–F063`, `R2-F074–F077`, `R3-F002–F003`, `R3-G002`, `R4-C004`. References: `REF-SOURCE-001`–`003`.

## 11. Specialist IELTS Learning & Practice Experience Deep Dive (G3)

### 11.1 Evidence hierarchy

Official IELTS/BC/IDP sources control format, timing, task types, delivery, public criteria, and exam meaning. Specialist products contribute only observed interaction mechanics. Automated band estimates remain practice references with disclosed scorer/version/uncertainty; REM-001 does not validate competitor or OmniIELTS score calibration.

### 11.2 Specialist comparator synthesis

| Problem | Official constraint | Specialist observations | OmniIELTS adaptation | Reject/limit |
|---|---|---|---|---|
| Starting point | official task familiarization and four skills | IELTS Ready/IDP combine level check, goals, recommendations, and progress; Magoosh/E2 expose schedules/pathways | explainable recommended path with direct skill/full-mock access (`REC-REM-018`) | no compulsory diagnostic gate |
| Learn before practice | public criteria and format guidance | E2, Magoosh, IELTS Advantage foreground method/video lessons and examples | criterion-linked lesson/model analysis before guided/independent task (`REC-REM-003`) | no template formula presented as scoring truth |
| Answer review | official answer/model resources | Magoosh/TestGlider describe explanations and performance breakdowns | incorrect/unanswered filter; exact passage/audio evidence; why/distractor; targeted lesson; clean parallel retry (`REC-REM-014`) | no answer-key-only dead end |
| Writing feedback | four official criteria; human examiners score official test | IELTS Ready, E2, IELTS Advantage, Magoosh provide model/AI/human feedback at different latency | response-span + criterion feedback, scorer identity, action/revision, later fresh task (`REC-REM-012`) | no “official band” or revision-as-transfer |
| Speaking review | three parts, four official criteria, human examiner | SmallTalk2Me exposes recording, transcript, replay, dimension report; Magoosh/E2 offer graded/human work | replay/span drill-down, uncertainty, targeted lesson, new prompt (`REC-REM-013`) | no AI examiner equivalence |
| Mock scope | four skills and official timing | IELTS Ready/GEL offer bounded mini versus full mock; TestGlider routes lowest section to practice | choose readiness/section/full scope; preserve both Full Mock Speaking paths (`REC-REM-017`) | no single score as readiness/mastery |
| Report→action | official samples support review | TestGlider/Magoosh/IELTS Ready describe breakdowns and suggestions | observed result + limitation + specific learner-chosen next action (`REC-REM-017`) | no automatic FSRS mutation |

### 11.3 Learn → Practice → Exam ownership

```text
LEARN
  model analysis / explicit explanation / guided reconstruction / faded support
→ PRACTICE
  direct task family / section / skill / feedback / clean retry
→ EXAM OR MOCK
  strict shell / timed / unaided / recoverable
→ REVIEW
  observed result + exact evidence + limitation
→ REMEDIATION
  skill owner / teaching / parallel practice
→ LATER REASSESSMENT
  optional section, skill test, or full mock
```

This is a coherent relationship, not a mandatory order. Practice aids and learning widgets never enter strict simulation. One mock attempt never generates FSRS evidence or holistic mastery.

### 11.4 Skill-specific IELTS review contracts

- **Listening:** timestamped cue, correct/learner answer, distractor/paraphrase explanation, missed-cue recovery lesson, parallel audio item.
- **Reading:** highlighted supporting/contradicting/absent evidence, question-type rationale, learner explanation, parallel passage.
- **Writing:** criterion and response-span anchors, examples/contrast kept outside clean retest, revision plus a later fresh prompt.
- **Speaking:** recording/transcript segment, public-criterion lens, evaluator identity/uncertainty, targeted pronunciation/discourse task, new prompt.
- **Full Mock:** scorecard exposes raw/criterion observations and data limits, then routes by learner choice to the exact skill owner.

Trace: `REQ-EXP-001`, `RQ-03`, `R1-F010`, `R1-F017–F033`, `R1-F043–F045`, `R1S-F001–F007`, `R1S-F011`, `R1S-F016–F018`. Competitor evidence: `REF-IELTS-001`–`006`; official evidence: `REF-OFFICIAL-001`–`005`.

## 12. Global Search, Discovery & Knowledge Reuse Deep Dive (G4)

### 12.1 Ownership and scope

Search is a global non-exam utility that reveals existing objects. It is not a second Library, second index of record, second Capture system, or top-level content owner. The canonical minimum is vocabulary cards, video transcripts, reading passages, and study notes. Error entries, IELTS learning content, content packs, and history are candidate scopes and remain `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]` until W3 proves ownership and privacy.

### 12.2 Query and result contract

| State | Interaction | Truth/recovery |
|---|---|---|
| Empty | recent/allowed filters and scope explanation | no fabricated suggestions |
| Querying | debounced input, cancel, keyboard/pointer access | status announced |
| Results | grouped by existing owner/type; excerpt, source, match reason | direct context reopen |
| No results | spelling/filter guidance and in-scope explanation | no automatic content creation |
| Offline | search only locally available/indexed objects | explicit partial-scope badge |
| Rebuilding | progress/status; allow owner navigation | no stale completeness claim |
| Private/missing source | metadata/excerpt when allowed | re-import/device/reinstall action |
| Exact locator stale | warn and open best-available revision/context | never silently jump elsewhere |

Desktop may use a command/search overlay; mobile uses a dedicated full-screen search launched from the shared utility affordance. Both preserve the same ownership and result semantics. Exam simulation hides/blocks Global Search.

### 12.3 Retrieval depth and authority boundary

Exact text and filters are the baseline research direction. Lemma/fuzzy/hybrid retrieval are Stage 5 benchmark candidates (`R2-F011`, `R2-F026`, `R2-F078–F079`; `OSS-021` MiniSearch and `OSS-043` Orama) and are not dependency selections. Search must not mutate evidence or schedule. References: `REF-SEARCH-001`, `REF-SEARCH-002`, `REF-SOURCE-003`. Material decision: `REC-REM-008`.

## 13. Preserved Secondary Lifecycles Deep Dive (G5)

### 13.1 Signed catalog and content-pack lifecycle

This is an existing capability (`CAP-036`, `CAP-037`), not a newly proposed platform.

```text
NO VALID CATALOG
→ FETCH / VERIFY SIGNATURE + TRUST ROOT + FRESHNESS/SEQUENCE
→ VERIFIED NEWER | VERIFIED LAST-KNOWN-GOOD
→ INSPECT RIGHTS / PROVENANCE / HUMAN REVIEW
→ USER INSTALL
→ DOWNLOAD / VERIFY EVERY ASSET DIGEST
→ ACTIVATE
→ UPDATE AVAILABLE | REVOKED | EXPIRED-LKG | OFFLINE-LKG
→ DELETE PACK ASSETS
→ RETAIN LEARNER RECORDS
→ OPTIONAL REINSTALL / CONTEXT RECOVERY
```

| State | Required user language/action | Prohibited implication |
|---|---|---|
| No valid catalog | connect and retry; installed learning remains | “empty library” |
| Verifying | trust check progress, cancel where safe | install before verification |
| Rejected | reason category, preserve last safe state | hide tamper/trust failure |
| Verified newer | revision/sequence and inspectable provenance | signature equals content quality |
| Offline/expired LKG | installed content available; install/update disabled as applicable | call stale content current |
| Installing/updating | bytes/items, pause/cancel/retry, storage warning | partial pack activated |
| Revoked | explain affected pack and safe behavior | silent continued activation |
| Deleting | distinguish pack assets from learner records | deletion of study history |
| Deleted-record-retained | history/context plus reinstall path | dead evidence without explanation |

Trust & Provenance inspection includes signer/trust status in plain language, catalog/pack revision, rights/license, source provenance, human review status, asset integrity outcome, revocation, and last verified time. These are separate claims. TUF/in-toto/Sigstore are vocabulary/reference inputs (`REF-LIFE-001`, `REF-LIFE-002`), not selected dependencies.

### 13.2 Desktop ASR readiness lifecycle

The preserved `CAP-040` user-facing states are exactly:

- **Connected:** companion endpoint responds, compatible protocol/capability is known, and local transcription can be selected; show privacy/locality, model/capability detail, and disconnect/recheck.
- **Disconnected:** companion was expected/known but is not reachable; show Recheck, start/setup guidance, and caption/import/manual alternatives.
- **Unavailable:** device/platform/configuration cannot advertise the companion path; explain why and offer public captions/private import or consented cloud fallback when allowed.

Additional transient states such as checking, incompatible, busy, or error refine—never replace—the three canonical readiness states. Browser-WASM versus desktop ASR latency/memory/thermal comparison remains `[UNKNOWN]` under `R3-F022`/`M-S5-007`. Whisper.cpp and Vosk (`REF-ASR-001`, `REF-ASR-002`) show why platform/model readiness must be explicit; neither is adopted. Cloud calls require the existing versioned, replay-safe, revocable consent receipt (`CAP-039`, `R3-F011`).

### 13.3 R4 owner decisions

- `R4-OD006` is ratified by W2 as Option A: ephemeral raw audio plus manual export and exit protection. It is not reopened.
- `R4-OD001` provider strategy and `R4-OD007` degradation stance remain owner choices where not superseded; no provider is selected here.
- `R4-OD002` FSRS desired retention has no authorized default and remains an owner decision.

Material decisions: `REC-REM-009`, `REC-REM-021`, `REC-REM-022`.

## 14. Mobile, Responsive & Accessibility Synthesis

### 14.1 Responsive recomposition rules

- Navigation, player, transcript, passage/questions, editor/prompt, rubric, and provenance recompose by task priority; desktop columns do not merely shrink.
- One primary action per mobile viewport region; secondary actions move to labeled sheets/drawers without losing state.
- Bottom navigation, global audio controls, input keyboard, and safe areas have reserved non-overlapping space (`S4-OMIT-006`).
- Split-pane Reading becomes a passage/question switch that preserves passage scroll, question, focus, highlights, and timer.
- Video transcript becomes a drawer/rail with active cue and full keyboard/touch access.
- Tables/charts have semantic list/table alternatives and do not require horizontal scanning to understand the primary result.
- No breakpoint, exact dimension, or component library is authorized by this research.

### 14.2 Accessibility contract

| Area | W3 proof obligation |
|---|---|
| Keyboard/focus | logical order, visible and unobscured focus, skip/landmark structure, dialog focus containment/return |
| Pointer/touch | WCAG 2.2 target sizing/spacing; non-drag alternative for dividers, ordering, and palettes |
| State | text/icon/ARIA state in addition to color; live announcements do not interrupt typing/audio |
| Media | captions/transcript in learning; accessible player/rate; strict answer text absent from DOM/ARIA before reveal |
| Timed assessment | time warning announced without repeated disruption; recovery/accommodation semantics explicit |
| Recording | mic permission/input/readiness, alternatives, privacy/retention language, keyboard operation |
| Writing/visual Task 1 | semantic data/table/text alternative, zoom without loss, prompt remains programmatically associated |
| Search/combobox | APG-compatible expanded/controls/active descendant behavior; result grouping and count announced |
| Charts | textual summaries and drill-down lists; no color-only uncertainty or severity |
| Cognitive load | progressive disclosure, stable workspace, plain language, no shame, learner-controlled assistance |

References: `REF-A11Y-001`, `REF-A11Y-002`, `REF-INSTR-003`. These are design obligations requiring later browser/assistive-technology validation, not claims of current conformance.

## 15. Anti-RPS & Duplication Prevention Register

| Item | Class | Existing owner preserved | Allowed change | Rejected duplication |
|---|---|---|---|---|
| Today guidance | B | Today composer/runner | explainable recommendation and re-entry states | second planner/queue |
| Skills Curriculum | B/C | IELTS skill surfaces and domain lessons | model/guided/independent presentation | new top-level curriculum product |
| Guided media session | B | sentence loop/video workspace | optional orchestration | mode-locked duplicate player |
| Capture | C | unified Capture Inbox | contextual sheet and staged confirmation | per-surface shadow inbox |
| Lexical Library | B | central card/occurrence owner | multimodal/sense/source views | second vocabulary database |
| Error remediation | B | Error Notebook/skill owners | teaching, fading, retest handoff | separate remediation content silo |
| Global Search | B | each indexed object’s current owner | reveal/deep-link existing data | parallel content store or nav section |
| IELTS Learn/Practice/Exam | C | IELTS shell and skill owners | explicit modes and handoffs | three independent products |
| Full Mock remediation | B | scorecard + skill owners | targeted return | score-derived duplicate curriculum |
| Analytics | B | Progress/event/evidence stores | separated projections and action links | unified mastery database |
| Signed catalog/pack | B | content platform/install lifecycle | trust/progress/recovery presentation | replacement updater |
| Desktop ASR | B | resolver/fallback policy | readiness/status/recovery UI | second ASR pipeline |
| Consent | C | consent receipt gateway | plain-language consolidated controls | provider-specific consent clones |
| Backup/restore | B | backup registry/restore journal | preflight/read-back UI | partial per-feature exports as “backup” |
| Roadmap inspector | C | roadmap runtime | rehome to Settings/About | top-level governance navigation |
| Exam palette/timer | C | shared runner contracts | consistent accessible shell | skill-specific incompatible primitives |
| Audio/player controls | C | audio manager/media player | shared safe-area control language | competing fixed players |
| Provenance receipt | B | EvidencePolicy/event/error repositories | inspectable shared presentation | recomputed truth per surface |

No row authorizes deletion. Class D removal is permitted only for duplicate presentation/listeners/routes after semantic reachability and behavior are proven preserved.

## 16. 48/48 Capability Preservation & Omission Invariants Traceability Matrix

“Verified” below means the capability’s canonical semantics, material states, ownership, target reachability, and failure guards are explicitly preserved by this synthesis. It is not a claim that W3 has already implemented the target presentation.

### 16.1 CAP-001 through CAP-048

| CAP | Preserved semantic behavior and material lifecycle states | Target screen/system and explicit synthesis trace | Outcome |
|---|---|---|---|
| `CAP-001` | Today daily runner, goal-directed queue, single lease, start/skip/change/recovery | Screen 01; SYS-01/05/08; `REC-REM-001`, `018` | `VERIFIED` |
| `CAP-002` | Five-skill FSRS memory scheduling; due/overdue/review/qualified receipt; no unified mastery | Screens 01/02/07; SYS-05/19; `REC-REM-005`, `019` | `VERIFIED` |
| `CAP-003` | Vocabulary/collocation recognition, recall, typing, matching, cloze and productive extensions | Screen 02; SYS-03/04/11; `REC-REM-003`–`006` | `VERIFIED` |
| `CAP-004` | Seven-step sentence learning loop with optional entry/exit/change, not a navigation lock | Screen 03 `7.2`; SYS-03/12; `REC-REM-002`, `010` | `VERIFIED` |
| `CAP-005` | Strict vs Practice Dictation, full/gap target types, coaching envelope and strict masking | Screen 03; `7.2`; `REC-REM-010`; `S4-OMIT-003` | `VERIFIED` |
| `CAP-006` | Noticing/thought groups, weak forms and chunking with exact cue retained | Screen 03; SYS-12; `REC-REM-010` | `VERIFIED` |
| `CAP-007` | Shadowing/self-record/replay/rhythm; coaching-only; ephemeral audio/export guard | Screens 03/13/15; `REC-REM-013`, `021` | `VERIFIED` |
| `CAP-008` | Retell draft/recovery; productive synthesis; evaluator required before evidence | Screens 03/13; `7.2`; `REC-REM-013`; `S4-OMIT-002` | `VERIFIED` |
| `CAP-009` | Video workspace six modes, stable player/cue/transcript/draft, responsive rail | Screen 03; SYS-02/12; `REC-REM-002`, `010` | `VERIFIED` |
| `CAP-010` | Caption normalization and suffix dedupe remain sole pipeline; overlap/unaligned fail honestly | Screen 03 background states; `10.4`; `REC-REM-002` | `VERIFIED` |
| `CAP-011` | Private PDF/EPUB/SRT/source ingestion, rights/privacy, parse/unaligned/missing states | Screen 04; SYS-02/10; `REC-REM-002`, `006`, `008` | `VERIFIED` |
| `CAP-012` | One unified staged Capture Inbox; confirm before scheduling; duplicate/sense/undo | Screens 02–05; SYS-02/10/11; `REC-REM-006` | `VERIFIED` |
| `CAP-013` | Separate retention/activity/weakness/IELTS/transfer/pacing projections with drill-down | Screen 07; SYS-19; `REC-REM-019`, `023` | `VERIFIED` |
| `CAP-014` | Error Notebook and diagnostic fingerprint; provenance/uncertainty/dispute/remediation/retest | Screen 06; SYS-07/24; `REC-REM-004`, `015`, `023` | `VERIFIED` |
| `CAP-015` | Audio/TTS/rate controls including 0.75/.9/1/1.1/1.25 and safe-area access | Screens 02/03/15; `REC-REM-010`; `S4-OMIT-006`, `009` | `VERIFIED` |
| `CAP-016` | EvidencePolicy default-deny sole mutation gateway; assistance/retry/evaluator receipt | All learning/review; SYS-04/24; `REC-REM-004`, `020`, `023` | `VERIFIED` |
| `CAP-017` | Academic/GT track switch; track retained across reading/writing/content, no leakage | Screens 08–14; `REC-REM-014`, `016` | `VERIFIED` |
| `CAP-018` | Four-part Listening strict runner, single play, palette/timer/review/recovery | Screen 08; SYS-17; `REC-REM-016` | `VERIFIED` |
| `CAP-019` | Listening Practice with permitted playback/scrub/reveal and explicit assisted state | Screen 08; SYS-12/16; `REC-REM-010`, `014` | `VERIFIED` |
| `CAP-020` | Academic Reading three-passage split runner, highlight/palette/timer/recovery | Screen 09; SYS-17; `REC-REM-016` | `VERIFIED` |
| `CAP-021` | GT Reading three-section/multi-text runner with track-specific content and position | Screen 10; SYS-17; `REC-REM-016` | `VERIFIED` |
| `CAP-022` | Academic Task 1 visual container with semantic table/text fallback and editor | Screen 11; SYS-14/16/17; `REC-REM-012`, `014`, `016` | `VERIFIED` |
| `CAP-023` | GT Task 1 purpose/register letter, word count, prompt/editor/recovery | Screen 11; SYS-14/16/17; `REC-REM-012`, `014`, `016` | `VERIFIED` |
| `CAP-024` | Task 2 prompt, whole-response editor, timer/word count/recovery | Screen 12; SYS-14/16/17; `REC-REM-012`, `014`, `016` | `VERIFIED` |
| `CAP-025` | Four-criterion Writing practice evaluation, labeled estimate, spans/uncertainty/action | Screens 11/12; SYS-04/14/24; `REC-REM-012`, `020`, `023` | `VERIFIED` |
| `CAP-026` | Speaking Part 1 prompt, response recording and strict/practice separation | Screen 13; SYS-15/16/17; `REC-REM-013`, `016` | `VERIFIED` |
| `CAP-027` | Speaking Part 2 cue, one-minute prep, notes pinned, two-minute response | Screen 13; `REC-REM-013`, `016`; `S4-OMIT-010` | `VERIFIED` |
| `CAP-028` | Speaking Part 3 abstract discussion/follow-ups and response recording | Screen 13; `REC-REM-013`, `016` | `VERIFIED` |
| `CAP-029` | Four-skill Full Mock orchestration, strict shell, transitions, both Speaking paths | Screen 14; SYS-17/18; `REC-REM-016`, `017` | `VERIFIED` |
| `CAP-030` | Direct section practice by skill/part, independent of curriculum locks | Screens 08–14; SYS-16; `REC-REM-014` | `VERIFIED` |
| `CAP-031` | Fifteen official objective task families with standardized accessible controls | Screens 08–10; SYS-16/17; `REC-REM-014`, `016` | `VERIFIED` |
| `CAP-032` | Live exam timers/pacing, warnings, accessible labels and accommodation-aware state | Screens 08–14; SYS-17; `REC-REM-016` | `VERIFIED` |
| `CAP-033` | Reload/crash checkpoint recovery to exact question/time/response | Screens 08–14; SYS-17/22; `REC-REM-016`, `021` | `VERIFIED` |
| `CAP-034` | Primary IA host; one safe production entry per canonical owner, consolidated routes | All screens; `15` Anti-RPS; `REC-REM-001`, `024` | `VERIFIED` |
| `CAP-035` | IELTS Hub discover/videos/skills rehomed into coherent Learn/Practice/Exam ownership | Screens 03/08–14; SYS-03/16/17; `REC-REM-003`, `014` | `VERIFIED` |
| `CAP-036` | Ed25519 signed catalog trust, LKG/offline/expired/rejected/newer/provenance states | Screens 04/15; SYS-10; `13.1`; `REC-REM-009` | `VERIFIED` |
| `CAP-037` | Pack install/update/download/cancel/error/revoke/delete; learner records retained | Screens 04/15; SYS-10; `13.1`; `REC-REM-009` | `VERIFIED` |
| `CAP-038` | Roadmap runtime inspection retained as Settings/About background audit | Screen 15; `REC-REM-024`; `S4-OMIT-012` | `VERIFIED` |
| `CAP-039` | Versioned/revocable external-AI consent receipt, explicit opt-in and revoke | Screen 15/global blocked action; SYS-21/22; `REC-REM-020`, `021` | `VERIFIED` |
| `CAP-040` | Desktop ASR companion with Connected/Disconnected/Unavailable and recovery/fallback | Screens 03/15; SYS-23; `13.2`; `REC-REM-022` | `VERIFIED` |
| `CAP-041` | Core-only degraded storage, visible limitation matrix, retained available drills | Global/Screen 15; SYS-22; `REC-REM-021`; `S4-OMIT-005` | `VERIFIED` |
| `CAP-042` | Complete backup export/atomic restore, preflight and post-reopen read-back | Screen 15; SYS-22; `REC-REM-021` | `VERIFIED` |
| `CAP-043` | Interrupted restore journal and boot recovery, background but user-status visible | Screen 15/global; SYS-22; `REC-REM-021` | `VERIFIED` |
| `CAP-044` | Session-contained secrets excluded from durable backup, visible ephemeral status | Screen 15; SYS-21/22; `REC-REM-021` | `VERIFIED` |
| `CAP-045` | Non-blocking boot error reporter, copyable diagnostics and recovery | Global/Screen 15; SYS-22; `REC-REM-021` | `VERIFIED` |
| `CAP-046` | Safe destructive confirmation, consequence text, progress, cancel/undo when safe | Screens 02/05/15; SYS-10/22; `REC-REM-009`, `021` | `VERIFIED` |
| `CAP-047` | Progressive long-media processing, first safe task, background progress/cancel/resume | Screen 03; SYS-02/12/23; `REC-REM-002`, `022` | `VERIFIED` |
| `CAP-048` | PWA install/offline readiness/stale-cache cleanup and honest availability state | Global/Screen 15; SYS-22; `REC-REM-021` | `VERIFIED` |

Coverage check: 48 unique zero-padded identifiers, no gaps and no duplicates. Signed catalog, content-pack secondary states, and Desktop ASR readiness are resolved in `13` rather than deferred.

### 16.2 Omission invariants

| Invariant | Preserved obligation | Explicit location | Outcome |
|---|---|---|---|
| `S4-OMIT-001` | custom lexical target capture during sentence study | Screen 03 Step 6 → unified staged Capture, `7.2` | `VERIFIED` |
| `S4-OMIT-002` | Retell draft autosave/recovery | Screens 03/13, `CAP-008` | `VERIFIED` |
| `S4-OMIT-003` | strict dictation answer absent from DOM/ARIA before reveal | `7.2`, `14.2` | `VERIFIED` |
| `S4-OMIT-004` | transcript split/merge/edit produces revision and retains lineage | Screen 03, `7.3`/`10` | `VERIFIED` |
| `S4-OMIT-005` | visible core-only degraded-storage notice and limitation matrix | Screen 15, `CAP-041` | `VERIFIED` |
| `S4-OMIT-006` | mobile bottom-nav/audio-player safe-area collision prevention | `14.1`, `CAP-015` | `VERIFIED` |
| `S4-OMIT-007` | suspended cards remain findable/filterable and resumable | Screen 02, `CAP-003` | `VERIFIED` |
| `S4-OMIT-008` | exam pacing/target-date calculator retained | Screens 01/07, `CAP-013` | `VERIFIED` |
| `S4-OMIT-009` | audio rate multipliers remain accessible | Screens 03/15, `CAP-015` | `VERIFIED` |
| `S4-OMIT-010` | Speaking Part 2 notes remain available through response | Screen 13, `CAP-027` | `VERIFIED` |
| `S4-OMIT-011` | pack rights/provenance/review inspection remains reachable | `13.1`, `CAP-036`/`037` | `VERIFIED` |
| `S4-OMIT-012` | roadmap audit surface retained in Settings/About | Screen 15, `CAP-038` | `VERIFIED` |

## 17. Current / Future Truth Register

This is an application index of the seven verbatim canonical labels from W1/W2 and the controlling authorization, not an authorial redefinition. Native contextual forms such as `[STAGE4_LEARNING_SYSTEM_REQUIREMENT / NOT_CURRENT_IMPLEMENTATION]` remain valid where the canonical source uses them.

| Canonical label | Application in this candidate | Representative items |
|---|---|---|
| `[CURRENT]` | behavior exists and remains at its current semantic owner | EvidencePolicy, FSRS gateway, signed verification engine, recovery journals |
| `[CURRENT_REHOMED]` | current behavior is preserved while W1 target IA rehomes/presents it | Today, Library/Capture, Media, Error, Analytics, IELTS runners, Settings lifecycles |
| `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | W3-facing Stage 4 interaction target; never described as shipped | first-class curriculum presentation, full source loop presentation, cue-grounded IELTS review, Global Search UI |
| `[FUTURE_UX_RESERVED]` | explicitly future UX, not authorized by this research | calibrated automated IELTS scoring, future examiner/coach expansions, unratified learner-model UX |
| `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]` | some substrate exists but complete target experience is future | search substrate, structured parsing/readability, cross-revision locator translation, richer content/search scope |
| `[OWNER_RECONFIRMED_FUTURE]` | owner has reconfirmed future placement without making it current | future AI examiner and other owner-reserved productive evaluation capabilities |
| `[BACKGROUND_SYSTEM]` | preserved background mechanism with contextual status/recovery rather than top-level prominence | caption normalization, restore journal, cache cleanup, roadmap audit runtime |

### 17.1 Settled current/future assertions

- `R4-OD006 = OPTION_A_EPHEMERAL_RAW_AUDIO` is settled by W2: session-ephemeral raw audio, manual export, and exit protection.
- Current Media Strict/Practice Dictation remains a coaching envelope; a future evidence-capable proposal is not current truth.
- Shadowing is coaching-only. Retell is not universally coaching-only, but no positive evidence exists without a qualified evaluator.
- All current IELTS practice/mock attempts have `affectsSchedule:false` and `evidenceEligible:false` under the canonical W2 model.
- Novel transfer exists as current construct-distinct evidence with `affectsSchedule:false`; any future calibrated scheduling relationship is separate.
- Both Full Mock Speaking paths are preserved now: immediate after LRW or independently scheduled.
- `R4-OD002` has no authorized retention default; the owner choice remains open.

## 18. KEEP / ADAPT / REJECT Master Recommendation Register

Scores: `H` = strong/favorable, `M` = conditional/mixed, `L` = weak/adverse. For `COGNITIVE_LOAD`, H means low avoidable burden. Every normative recommendation in this candidate appears exactly once below with all eight required dimensions.

| ID / disposition / Anti-RPS | Material recommendation and truth label | Exact evidence and preservation trace | TASK_FIT | INTERACTION_CLARITY | LEARNING_VALUE | COGNITIVE_LOAD | MOBILE_QUALITY | ACCESSIBILITY_SIGNAL | OMNIIELTS_FIT | EVIDENCE_CONFIDENCE |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `REC-REM-001 ADAPT B` | Explainable Today next-action with Start/Change/Skip/workload controls; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F038 [INFERENCE]`, `R1S-F013 [VERIFIED]`, `R1S-F014 [INFERENCE]`; `REF-OFFICIAL-004`/`REF-OFFICIAL-005`; `CAP-001`, `CAP-033` | H | H | M | H | H | H | H | M |
| `REC-REM-002 ADAPT B` | Persist exact source/revision/cue or text locator across Media/Reader modes and lifecycle; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1S-F017 [INFERENCE]`, `REQ-EXP-005`/`REQ-EXP-010`, `R2-F060 [VERIFIED]`–`R2-F063 [INFERENCE]` and `R2-F074 [VERIFIED]`–`R2-F077 [INFERENCE]`, `R3-F002 [VERIFIED]`/`R3-F003 [VERIFIED]`/`R3-G002 [CURRENT_GAP]`, `R4-C004`; `REF-SOURCE-001`–`REF-SOURCE-003`; `CAP-009`–`CAP-012`, `CAP-047` | H | H | H | M | M | H | H | H |
| `REC-REM-003 ADAPT C` | Use canonical Model Analysis→Guided Reconstruction→Independent Trial with conditional teaching/fading cycle inside skill owners; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F044 [INFERENCE]`, `R1S-F001 [VERIFIED]`–`R1S-F004 [VERIFIED]`, `REQ-EXP-001`, LX sections 3–4.6; `REF-INSTR-002`/`REF-INSTR-004`, `REF-IELTS-001`–`REF-IELTS-003`; `CAP-003`–`CAP-008`, `CAP-035` | H | H | H | M | M | H | H | H |
| `REC-REM-004 ADAPT B` | Make feedback produce self-correction/revision/explanation, then fade and clean-retest; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F007 [INFERENCE]`, `R1-F023 [VERIFIED]`, `R1-F026 [INFERENCE]`, `R1-F033 [VERIFIED]`, `R1-F044 [INFERENCE]`, `R1S-F001 [VERIFIED]`–`R1S-F003 [VERIFIED]`; `REF-INSTR-001`/`REF-INSTR-002`; `CAP-014`/`CAP-016`/`CAP-025` | H | H | H | M | M | H | H | H |
| `REC-REM-005 KEEP B` | Preserve multimodal lexical goals and separate outcome dimensions through qualified review and productive transfer; `[CURRENT_REHOMED]` | `R1-F001 [VERIFIED]`, `R1-F002 [VERIFIED]`, `R1-F010 [INFERENCE]`, `R1-F013 [VERIFIED]`–`R1-F015 [VERIFIED]`, `R1-F016 [INFERENCE]`, `R1-F045 [INFERENCE]`; `R1S-F004 [VERIFIED]`, `R1S-F005 [VERIFIED]`, `R1S-F006 [INFERENCE]`; `REF-SOURCE-002`; `CAP-002`/`CAP-003` | H | H | H | M | H | H | H | H |
| `REC-REM-006 KEEP C` | Preserve one staged Capture Inbox with sense/source/duplicate/goal confirmation before scheduling; `[CURRENT_REHOMED]` | `R1-F013 [VERIFIED]`, `R1-F016 [INFERENCE]`, `R1-F038 [INFERENCE]`, `R1S-F017 [INFERENCE]`, `REQ-EXP-005`; `REF-SOURCE-002`/`REF-SOURCE-003`; `CAP-011`/`CAP-012` | H | H | H | H | H | H | H | H |
| `REC-REM-007 KEEP B` | Keep FSRS memory scheduling separate from mastery, diagnosis, IELTS ability, and transfer; no default retention decision; `[CURRENT]` | `R1-F002 [VERIFIED]`, `R1-F003 [UNKNOWN]`, `R1-F010 [INFERENCE]`, `R1-F011 [VERIFIED]`, `R1-F012 [INFERENCE]`, `R1-F045 [INFERENCE]`, `R1S-F008 [VERIFIED]`, `R1S-F009 [INFERENCE]`, `R4-C005`/`R4-OD002`; `CAP-002`/`CAP-013`/`CAP-016` | H | H | H | M | H | H | H | H |
| `REC-REM-008 ADAPT B` | Provide non-exam Global Search over canonical minimum objects with result-type ownership, exact-context return, and offline/rebuild truth; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R2-F011 [VERIFIED]`, `R2-F026 [INFERENCE]`, `R2-F078 [VERIFIED]`, `R2-F079 [INFERENCE]`; `OSS-021`/`OSS-043` are candidates only; `REF-SEARCH-001`/`REF-SEARCH-002`; `CAP-003`/`CAP-009`/`CAP-011`/`CAP-012` | H | H | M | H | H | H | H | M |
| `REC-REM-009 ADAPT B` | Expose complete signed-catalog/pack lifecycle including trust, progress/cancel, revoke/error, delete with retained records; `[CURRENT_REHOMED]` | `R3 §3.2 [VERIFIED store inventory]`, `R3-F006 [VERIFIED backup coverage]`, and canonical `CAP-036`/`CAP-037`; `REF-LIFE-001`/`REF-LIFE-002`; `S4-OMIT-011` | H | H | M | M | H | H | H | H |
| `REC-REM-010 ADAPT B` | Ground Listening/Media teaching and review in exact audio cues while recording transcript/replay contamination; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F006 [VERIFIED]`, `R1-F017 [VERIFIED]`, `R1-F018 [INFERENCE]`–`R1-F020 [INFERENCE]`, `R1-F033 [VERIFIED]`, `R1S-F001 [VERIFIED]`–`R1S-F004 [VERIFIED]`, LX section 4.4; `REF-SOURCE-001`, `REF-A11Y-002`; `CAP-004`–`CAP-010`/`CAP-018`/`CAP-019` | H | H | H | M | M | H | H | H |
| `REC-REM-011 ADAPT B` | Make Reading review evidence-locator/rationale based, followed by learner explanation and parallel retry; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F005 [VERIFIED]`, `R1-F021 [VERIFIED]`, `R1-F043 [VERIFIED]`, `R1S-F001 [VERIFIED]`–`R1S-F004 [VERIFIED]`, `R1S-F007 [INFERENCE]`, LX section 4.5; `REF-OFFICIAL-001`; `CAP-020`/`CAP-021`/`CAP-031` | H | H | H | H | M | H | H | H |
| `REC-REM-012 ADAPT B` | Use criterion/response-span Writing teaching and feedback; separate assisted revision from fresh/delayed task; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F023 [VERIFIED]`, `R1-F024 [VERIFIED]`, `R1-F025 [UNKNOWN]`, `R1-F026 [INFERENCE]`, `R1-F027 [INFERENCE]`, `R1-F028 [UNKNOWN]`, `R1-F043 [VERIFIED]`, `R1-F044 [INFERENCE]`, `R1S-F001 [VERIFIED]`–`R1S-F005 [VERIFIED]`, `R1S-F006 [INFERENCE]`, `R1S-F007 [INFERENCE]`, `REQ-EXP-001`; `REF-OFFICIAL-002`, `REF-IELTS-001`–`REF-IELTS-003`; `CAP-022`–`CAP-025` | H | H | H | M | M | H | H | H |
| `REC-REM-013 ADAPT B` | Progress Speaking from model/controlled to parallel and novel prompts with recording/span feedback and qualified evaluator; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F020 [INFERENCE]`, `R1-F029 [VERIFIED]`, `R1-F030 [INFERENCE]`, `R1-F031 [UNKNOWN]`, `R1-F032 [UNKNOWN]`, `R1-F033 [VERIFIED]`, `R1-F043 [VERIFIED]`, `R1S-F001 [VERIFIED]`–`R1S-F004 [VERIFIED]`, `R1S-F007 [INFERENCE]`, `REQ-EXP-001`; `REF-OFFICIAL-003`, `REF-IELTS-004`; `CAP-007`/`CAP-008`/`CAP-026`–`CAP-028` | H | H | H | M | H | H | H | M |
| `REC-REM-014 ADAPT C` | Add specialist IELTS practice review: incorrect filter, exact evidence, explanation, targeted lesson, clean retry; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | exact `R1-F017`–`R1-F033` native statuses retained; `R1S-F001 [VERIFIED]`, `R1S-F007 [INFERENCE]`, `R1S-F011 [VERIFIED]`, `R1S-F016 [VERIFIED]`; `REF-OFFICIAL-001`–`REF-OFFICIAL-005`, `REF-IELTS-001`–`REF-IELTS-006`; `CAP-018`–`CAP-031` | H | H | H | M | M | H | H | M |
| `REC-REM-015 ADAPT B` | Treat misconception as uncertainty-bearing hypothesis and measure clean/delayed/transfer resolution separately; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F035 [INFERENCE]`, `R1-F044 [INFERENCE]`, `R1S-F003 [VERIFIED; workflow inference]`, `R1S-F006 [INFERENCE]`, `R1S-F010 [VERIFIED]`, `R1S-F017 [INFERENCE]`, `RQ-05`; `REF-INSTR-001`/`REF-INSTR-002`; `CAP-014`/`CAP-016` | H | H | H | M | M | H | H | H |
| `REC-REM-016 KEEP C` | Preserve strict IELTS exam shell: official semantics, zero aids, timer/palette/recovery, learning isolation; `[CURRENT_REHOMED]` | official `REF-OFFICIAL-001`–`REF-OFFICIAL-003`; `R1-F010 [INFERENCE]`, `R1-F017 [VERIFIED]`, `R1S-F007 [INFERENCE]`, `R1S-F016 [VERIFIED]`; `CAP-017`–`CAP-033` | H | H | M | H | M | H | H | H |
| `REC-REM-017 ADAPT B` | Full Mock scorecard states observations/limits and routes by choice to exact skill teaching/practice/later reassessment; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F010 [INFERENCE]`, `R1-F043 [VERIFIED]`, `R1-F045 [INFERENCE]`, `R1S-F007 [INFERENCE]`, `R1S-F011 [VERIFIED]`, `R1S-F016 [VERIFIED]`; `REF-OFFICIAL-004`, `REF-IELTS-001`/`REF-IELTS-005`/`REF-IELTS-006`; `CAP-029`/`CAP-030` | H | H | H | M | M | H | H | M |
| `REC-REM-018 ADAPT B` | Explain recommendation reason/uncertainty and retain direct access, skip/change, nonpunitive re-entry; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F034 [VERIFIED]`, `R1-F036 [VERIFIED]`, `R1-F038 [INFERENCE]`, `R1-F040 [VERIFIED]`, `R1S-F013 [VERIFIED]`, `R1S-F014 [INFERENCE]`; `REF-OFFICIAL-004`/`REF-OFFICIAL-005`; `CAP-001`/`CAP-013` | H | H | M | H | H | H | H | M |
| `REC-REM-019 KEEP B` | Keep Analytics projections separate, uncertainty-bearing, drillable, and action-linked; `[CURRENT_REHOMED]` | `R1-F010 [INFERENCE]`, `R1-F011 [VERIFIED]`, `R1-F012 [INFERENCE]`, `R1-F034 [VERIFIED]`, `R1-F040 [VERIFIED]`, `R1-F041 [UNKNOWN]`, `R1-F042 [UNKNOWN]`, `R1-F043 [VERIFIED]`, `R1-F044 [INFERENCE]`, `R1-F045 [INFERENCE]`, `R1S-F008 [VERIFIED]`, `R1S-F009 [INFERENCE]`, `R1S-F010 [VERIFIED]`, `R1S-F017 [INFERENCE]`, `R1S-F018 [UNKNOWN]`; `REF-INSTR-004`; `CAP-013`/`CAP-014` | H | H | H | M | M | H | H | H |
| `REC-REM-020 KEEP B` | Label AI/coaching, scorer/version/uncertainty and consent; block evidence mutation without qualification; `[CURRENT_REHOMED]` | `R1-F007 [INFERENCE]`, `R1-F010 [INFERENCE]`, `R1-F012 [INFERENCE]`, `R1-F026 [INFERENCE]`, `R1S-F017 [INFERENCE]`, `REQ-EXP-010`, `R3-F011 [VERIFIED]`; `CAP-016`/`CAP-025`/`CAP-039` | H | H | H | M | H | H | H | H |
| `REC-REM-021 KEEP C` | Consolidate plain-language privacy/consent/backup/restore/degraded/error recovery with durable read-back; `[CURRENT_REHOMED]` | `R3-F005 [VERIFIED]`/`R3-F006 [VERIFIED]`/`R3-F009 [VERIFIED]`/`R3-F011 [VERIFIED]`, `R4-C003`/`R4-OD006`; `CAP-039`/`CAP-041`–`CAP-048` | H | H | M | M | H | H | H | H |
| `REC-REM-022 ADAPT B` | Expose Desktop ASR Connected/Disconnected/Unavailable plus check/incompatible/busy recovery and manual alternatives; `[CURRENT_REHOMED]` | `R3-F010 [VERIFIED]`/`R3-F022 [UNKNOWN]`/`M-S5-007`, R4 section 8 Domain 9; `REF-ASR-001`/`REF-ASR-002`; `CAP-040`/`CAP-047` | H | H | M | H | H | H | H | H |
| `REC-REM-023 KEEP B` | Present inspectable PROV-9-style evidence receipt and dispute/insufficient state across Error/Analytics/review; `[CURRENT_REHOMED]` | `R1-F007 [INFERENCE]`, `R1-F010 [INFERENCE]`, `R1-F012 [INFERENCE]`, `R1-F035 [INFERENCE]`, `R1S-F017 [INFERENCE]`, `REQ-EXP-010`; `CAP-013`/`CAP-014`/`CAP-016` | H | H | H | M | M | H | H | H |
| `REC-REM-024 REJECT D` | Reject duplicate top-level owners, shadow stores/routes, unified mastery/readiness scalar, and deletion by visual hiding; `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]` | `R1-F010 [INFERENCE]`, `R1-F011 [VERIFIED]`, `R1-F012 [INFERENCE]`, `R1S-F008 [VERIFIED]`, `R1S-F009 [INFERENCE]`, `R4-C005`; W0 Anti-RPS, W1 direct reachability, all `CAP-001`–`CAP-048` | H | H | H | H | H | H | H | H |

### 18.1 Register integrity

- 24/24 material recommendations have one disposition, one Anti-RPS class, all eight named scores, exact Stage 3/canonical trace, reference evidence where material, and a canonical truth label.
- `EVIDENCE_CONFIDENCE=M` on public competitor-derived recommendations means the interaction pattern is useful but gated behavior or efficacy is not verified.
- A lower Mobile score marks a later layout risk, not permission to omit mobile behavior.
- No recommendation selects a package, provider, schema, breakpoint, model, or scoring threshold.

## 19. Owner Decision Register

### 19.1 Existing canonical owner decisions

| ID | Subject | REM-001 treatment | Status |
|---|---|---|---|
| `R4-OD001` | provider strategy | no provider selected; optional cloud remains consent/terms/quota/privacy gated | `OWNER_DECISION_REQUIRED` |
| `R4-OD002` | FSRS desired retention | no authorized default is asserted; options 0.90, 0.85, or user control remain canonical choices | `OWNER_DECISION_REQUIRED` |
| `R4-OD003` | review backlog policy | no 60–70% optimum asserted; Today offers explainable workload choice | `OWNER_DECISION_REQUIRED` |
| `R4-OD004` | habit/re-entry stance | research favors nonpunitive/opt-in patterns but causal product effect remains unproven | `OWNER_DECISION_REQUIRED` |
| `R4-OD005` | persistence consolidation | no schema or migration recommendation is made; preserve current durable stores | `OWNER_DECISION_REQUIRED` before Stage 6 |
| `R4-OD006` | raw-audio lifecycle | canonical W2 ratified Option A: ephemeral session audio + manual export + exit protection | `PASS / SETTLED_CANONICAL_TRUTH` |
| `R4-OD007` | degradation stance | graceful local core versus strict offline parity remains owner policy; this synthesis preserves honest fallbacks | `OWNER_DECISION_REQUIRED` |

### 19.2 Newly identified decisions

#### OD-REF-001

**SUBJECT:** Global Search scope beyond the canonical minimum\
**OPTIONS:** (A) vocabulary cards, video transcripts, reading passages, and study notes only; (B) add Error Notebook and non-exam IELTS learning content; (C) also add content packs and learning history.\
**EVIDENCE:** W1 canonical minimum; `R2-F011`, `R2-F026`, `R2-F078–F079`; `REF-SEARCH-001` and `REF-SEARCH-002`; `REC-REM-008`.\
**TRADEOFF:** broader reuse/discovery versus privacy, result-density, stale-locator, indexing-cost, and ownership complexity.\
**RECOMMENDED_OPTION:** A for W3 baseline; visually test B/C as clearly labeled candidate scopes without implying authorization.\
**WHY_OWNER_DECISION_REQUIRED:** canonical authority fixes the minimum but does not authorize the additional object classes, their privacy posture, or their product priority.

#### OD-REF-002

**SUBJECT:** Productive-skill automated estimate visibility in post-practice reports\
**OPTIONS:** (A) criterion observations only; (B) criterion observations plus a prominently qualified practice estimate; (C) hide estimates until human-model calibration evidence exists.\
**EVIDENCE:** official `REF-OFFICIAL-002`/`REF-OFFICIAL-003`; competitor `REF-IELTS-001`–`006`; `R1-F010`, `R1-F012`, `R1S-F007`, `R1S-F011`, `R1S-F016–F018`; `REQ-EXP-008`.\
**TRADEOFF:** motivation/readiness orientation versus false precision, trust harm, and conflation with official examiner scoring.\
**RECOMMENDED_OPTION:** A as the safest W3 baseline; if the Owner separately ratifies B, require scorer/version/uncertainty and “Practice Reference” language.\
**WHY_OWNER_DECISION_REQUIRED:** public rubrics bound dimensions but the repository evidence does not establish calibrated automated band validity or the Owner’s acceptable risk posture.

No Full Mock Speaking timing decision, Media Dictation current-evidence decision, or raw-audio policy decision is reopened.

## 20. Recommended Wave W3 Input Contract

This is a non-authoritative research handoff. It defines what a separately authorized W3 must carry forward; it does not grant W3 execution authority.

### 20.1 Whole-product principles

1. One semantic owner per capability; direct reachability survives rehome/consolidation.
2. Learner agency: recommended path, curriculum path, and guided sequence never become global navigation locks.
3. Learning, Practice, and Exam use distinct assistance/evidence contracts.
4. Feedback ends in a learner action and, where relevant, a clean/parallel and later/varied task.
5. Exact source/cue context follows capture, review, transfer, error, remediation, Search, and Analytics.
6. Current/future labels are explicit in design artifacts; future visuals never impersonate current runtime.
7. EvidencePolicy remains the sole schedule/evidence gateway.
8. All 48 capabilities and 12 omission invariants remain semantically reachable.
9. Mobile is recomposition; accessibility and degraded/recovery states are primary variants.
10. Signed-content trust and Desktop ASR readiness are first-class preserved lifecycles, not Settings footnotes.

### 20.2 Required per-screen W3 artifacts

For each of the 15 screen classes, W3 should provide:

- job-to-be-done and direct entry/exit;
- material variants including empty, loading, error, offline/degraded, interruption/recovery, permission/consent, and missing/stale source as applicable;
- current versus target labels using Section 17;
- state tuple and cross-surface handoff diagram;
- assistance/evidence receipt behavior;
- exact CAP and omission trace;
- mobile recomposition and keyboard/focus/AT notes;
- Anti-RPS owner and removed duplicate-presentation proof;
- linked `REC-REM-*` and reference rationale;
- no final tokens, breakpoints, schemas, package selections, or provider choices unless separately authorized.

### 20.3 Shared behavioral concepts

- **SourceContextHeader:** title, provenance/rights/private state, revision/locator truth, return/recovery.
- **EvidenceReceipt:** task/construct, source, mode/scaffolding, exposure/retry, raw response, evaluator/version, uncertainty, interval.
- **LearningBlock:** diagnose/teach/model/guided/faded/independent states selected by skill, not a universal wizard.
- **FeedbackAction:** observed evidence, explanation/contrast when supported, learner action, clean-retry eligibility.
- **SearchResult:** existing owner/type, excerpt/match reason, exact/best-available context deep-link, offline/stale state.
- **ExamShell:** official runner/task semantics, timer/palette/recovery, zero learning aids.
- **TrustLifecycleCard:** verifying/verified/LKG/rejected/install/update/revoke/delete-retain/recovery.
- **ServiceReadinessCard:** Connected/Disconnected/Unavailable with transient detail and alternatives.
- **DataSafetyFlow:** consequence, consent, preflight, progress, durable completion/read-back, undo/recovery.

These names are research shorthand, not component/API/schema names.

### 20.4 Required end-to-end prototype stories

1. Video cue → staged collocation capture → confirmation → review → productive error → remediation → exact timestamp return.
2. Article span → note/lexical capture → Global Search → exact passage return on desktop and degraded mobile.
3. Listening incorrect answer → exact cue/distractor explanation → listening lesson → clean parallel item → later reassessment.
4. Reading T/F/NG error → passage evidence/learner rationale → question-type teaching → new passage.
5. Writing diagnostic → model analysis → guided reconstruction → independent task → span/criterion feedback → revision → fresh prompt.
6. Speaking model/controlled → novel prompt → recording drill-down → targeted practice → later prompt, including mic unavailable.
7. Full Mock with each canonical Speaking path → scorecard limitations → learner-selected targeted remediation → optional later section/mock.
8. Signed catalog offline-LKG → update/install cancellation → recovery → pack deletion with learner records retained.
9. Desktop ASR Connected → disconnect mid-resolution → explicit state → caption/import fallback → resume.
10. Backup preflight → interrupted restore → boot recovery → reopened durable read-back.

### 20.5 W3 research acceptance checks

- direct access exists for every skill, section practice, and Full Mock;
- no teaching aid is present or reachable in strict Exam;
- no target answer exists in DOM/ARIA before strict reveal;
- exact source return works or exposes an honest reason/fallback;
- source revision change never silently relocates evidence;
- every feedback state exposes the next learner action;
- clean retest is contamination-resistant and distinct from revision;
- every recommendation/result can be skipped or changed where canonical agency requires;
- Search returns to current owners and creates no duplicate data ownership;
- all signed-pack and ASR states are represented;
- focus, keyboard, target size, media alternative, timer, chart, and mobile safe-area obligations are demonstrated;
- `CAP-001`…`CAP-048` and `S4-OMIT-001`…`S4-OMIT-012` are present in the W3 trace ledger.

### 20.6 W3 prohibitions carried forward

No W3 input may: select a provider/library/model; define persistence schemas; calibrate a band score by assertion; add top-level navigation without authority; make curriculum/guided flow mandatory; turn coaching/reveals into positive independent evidence; delete learner records with pack assets; fabricate media alignment; restore word rearrangement; reopen `R4-OD006`; or treat this research candidate as canonical acceptance.

## 21. Limitations, Evidence Gaps & Unresolved Items

### 21.1 Evidence limitations

- Specialist products were inspected only through public, unauthenticated surfaces. Gated screen sequences, real feedback quality, mobile allocation, accessibility, privacy retention, scoring algorithms, and actual learner outcomes were not verified.
- Product descriptions and testimonials are discovery inputs. No competitor score, “AI examiner,” guarantee, or efficacy claim is accepted as official/calibrated truth.
- Official IELTS pages control public semantics but are not complete design specifications for every production test-center interface or accommodation.
- No usability study, learner interview, accessibility lab, mobile-device matrix, or longitudinal OmniIELTS efficacy study was conducted.
- `R1S-F018` remains `[UNKNOWN]`: causal product efficacy is not established.
- Browser-WASM versus Desktop ASR performance remains `[UNKNOWN]` (`R3-F022`/`M-S5-007`). No ASR implementation/model is selected.
- Search libraries, hybrid retrieval, structured parsing, cross-revision translation, and scoring calibration remain future benchmark/implementation matters.
- R1 and its supplement contain a Kim/Webb DOI discrepancy; this candidate does not rely on that DOI. R2 includes placeholder-style ACL URLs and an internally questionable small-footprint assertion; those claims are not carried as verified.
- R4’s gap/benchmark tables misroute several `M-S5-*` identifiers and reference a nonexistent `M-S5-009`. This candidate cites native R3 measurement IDs directly and does not propagate those mappings.
- Provider quotas, terms, versions, prices, and product UI are volatile. Observation date and confidence are retained; live re-verification is required before any later decision.
- The Agent Reach search endpoint was unavailable without authentication; public Jina Reader and primary-source web discovery were used. This did not require prohibited external account side effects.

### 21.2 Open decisions and non-decisions

Open owner choices are listed in Section 19. This candidate intentionally does not decide breakpoints, final layout, component system, visual tokens, copy, storage/API schema, provider/model, local/cloud topology, search engine, package dependency, scoring threshold, retention default, backlog ratio, evaluation design, or deployment.

### 21.3 Quality-gate ledger

```text
AUDIT_FINDINGS_RECONCILED: 10/10
ROOT_EXPERIENCE_GAPS_RESOLVED: 5/5
MANDATORY_RECOMMENDATION_SCORING: PASS (24/24; all 8 dimensions)
STAGE3_EXACT_TRACEABILITY: PASS (qualified IDs/source sections + native epistemic truth)
CURRENT_FUTURE_TRUTH: PASS (7 canonical labels verbatim)
CAPABILITY_PRESERVATION: 48/48 VERIFIED (CAP-001 .. CAP-048)
OMISSION_INVARIANTS: ALL VERIFIED (S4-OMIT-001 .. S4-OMIT-012)
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
WHOLE_PRODUCT_EXPERIENCE_COVERAGE: PASS (24 systems)
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

### 21.4 Required terminal state

```text
RESEARCH_REMEDIATION_COMPLETE_PENDING_INDEPENDENT_REAUDIT
```

This author does not report `ACCEPT`. A new, unpolluted Independent Auditor must fresh-audit the exact PR head, all external claims, the sole-file diff, CI, canonical traceability, 48/48 preservation, and every gate before any acceptance. Independent acceptance would still not grant merge authority.
