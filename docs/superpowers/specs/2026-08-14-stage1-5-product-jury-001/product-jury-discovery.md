# Stage 1.5 Product Jury / Adversarial Discovery

**ID:** `STAGE1_5_PRODUCT_JURY_DISCOVERY_001`  
**Status:** `DISCOVERY_REPORT / NOT_AUTHORIZATION / NOT_ACCEPTANCE`  
**Audit date:** 2026-08-14  
**Repository:** `NguyenDukKyeon/VocabMaster`  
**Audited canonical main:** `98681e7f9dc63b29818ad15719a67eae92200437`

> This document is an independent discovery candidate. It records product/technical risks observed after Stage 1. It does not retroactively reject Stage 1, authorize remediation, authorize Stage 2, grant package acceptance, or grant merge authority.

---

## 1. Executive conclusion

Stage 1 is canonically closed at the audited main and its accepted package history remains historical fact. This jury did **not** discover evidence that justifies rewriting that history. It did, however, discover three high-confidence structural issues that are likely to make Stage 2 build on an unsafe or internally contradictory contract if they are not resolved first:

1. Targeted Diagnostic / IELTS compatibility code mutates process-wide JavaScript built-ins and `Object.prototype` instead of adapting data at an explicit boundary.
2. VocabMaster currently has two incompatible shapes and validation rules that are both treated as the canonical `WeaknessProfile`; the Targeted Diagnostic test path does not use the production canonical Progress projection consumed by Today/Focus.
3. The canonical metrics producer accepts substantially more learner history than the Focus consumer can validate; sufficiently long-lived learner history can therefore turn valid canonical evidence into `FOCUS_INVALID_INPUT` on the Today path.

Two additional medium findings were retained:

- the learner-facing Progress screen is not driven by the cross-surface canonical progress projection even though Today/Focus is, leaving two independent meanings of “progress” until the planned P7-01 work reconciles them;
- Frozen Assessment durably persists an active run and a terminal completed run, but its runtime contract has no durable partial-response state, so resume/abandon semantics are undefined for interrupted in-progress assessments.

No CRITICAL finding was retained. No finding was created merely because BKT, IRT/CAT, AI scoring, final UX work, or other roadmap-later capabilities are absent. Those are intentionally later concerns and are not Stage 1 defects by themselves.

**Discovery readiness recommendation:** `NOT_READY_FOR_STAGE_2`.

This classification is caused by `S15-F001`, `S15-F002`, and `S15-F003`. It is a discovery recommendation only. It does not authorize fixes or Stage 2.

### Finding counts

- CRITICAL: 0
- HIGH: 3
- MEDIUM: 2
- LOW: 0
- `MUST_FIX_BEFORE_STAGE_2`: 3
- `RESEARCH_BEFORE_STAGE_2`: 1
- `DEFER_TO_PLANNED_STAGE`: 1
- `ACCEPT_RISK`: 0
- `NO_ACTION`: 0 retained findings

---

## 2. Exact audited main

| Item | Fresh observation |
|---|---|
| Repository default branch | `main` |
| Exact audited main | `98681e7f9dc63b29818ad15719a67eae92200437` |
| Main commit identity | Merge of PR #80: `docs(governance): reconcile Wave 6 Stage 1 closure status` |
| Stage 1 status | `STAGE_1_FULLY_CLOSED` |
| Status reconciliation | `COMPLETE` |
| Stage 1.5 authority | `STAGE_1_5_NOT_AUTHORIZED` |
| Stage 2 authority | `STAGE_2_NOT_AUTHORIZED` |
| Technical candidate lineage | PR #78, accepted Stage 1 technical batch |
| Corrected independent technical audit | PR #78 comment `5290883787` |
| Integration authorization | PR #79, independent ACCEPT comment `5291276461` |
| Integration closure | PR #78 comment `5291294824` |
| Status reconciliation acceptance | PR #80 comment `5291478569` |
| Final Stage 1 closure | PR #80 comment `5292219306` |

The current `main` was fresh-read immediately before this discovery branch was created. No open PR or existing branch matching this exact Stage 1.5 jury identity was found during preflight.

The final Stage 1 closure record also carries successful post-merge natural CI evidence. That evidence establishes that the checks which existed at closure passed. It is **not** treated here as proof of product completeness or proof that cross-feature contracts are semantically coherent.

---

## 3. Method / evidence basis

### 3.1 Review method

The jury used a targeted, adversarial repository trace rather than mechanically reading every file. The review followed these chains:

```text
entry point
→ learner-visible route
→ planner/runtime
→ Activity / Run / Attempt / Receipt
→ EvidencePolicy
→ scheduling / durable events
→ Progress / WeaknessProfile
→ Focus / Today
→ assessment / diagnostic
→ persistence / backup / restore
```

and separately:

```text
Core
↔ IELTS
↔ V10
↔ Frozen Assessment
↔ Targeted Diagnostic
```

The review repeatedly attempted to falsify the assumption that individually accepted modules compose safely.

### 3.2 Canonical/governance evidence fresh-read

Targeted canonical material included:

- `AGENTS.md`
- `docs/ROADMAP.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/DECISIONS.md`, including the EvidencePolicy, persistence, IA, metrics, evidence hierarchy, and bounded-execution ADRs
- raw PR/comment lineage for PRs #78, #79, #80
- exact current `main`

Relevant canonical boundaries were preserved during classification:

- `EvidencePolicy` remains the only authority allowed to create schedule-affecting evidence.
- Failure history is durable but cannot be relabelled as successful evidence.
- Logical cross-database ownership does not require immediate physical database consolidation.
- Personalization is deliberately after clean evidence/content/outcomes.
- QAR is intended to reuse canonical learning contracts rather than become a second assessment runtime/scheduler.
- P7-01 is the planned owner for the future Progress experience.

### 3.3 Source and test evidence fresh-read

High-leverage source/tests inspected include:

- `package.json`
- `src/main.js`
- `src/app.js`
- `src/v10-runtime.js`
- `src/primary-ia-v10.js`
- `src/today-planner-v2.js`
- `src/today-composer.js`
- `src/today-runner.js`
- `src/evidence-policy.js`
- `src/schedule-gateway.js`
- `src/event-repository.js`
- `src/p7-00-metrics-reducer.js`
- `src/progress.js`
- `src/weakness-profile.js`
- `src/focus-selector.js`
- `src/frozen-assessment-contracts.js`
- `src/frozen-assessment-runtime.js`
- `src/targeted-diagnostic.js`
- `src/ielts-domain.js`
- `src/ielts-persistence.js`
- `src/ielts-lab.js`
- `src/backup-registry.js`
- `src/persistence.js`
- `src/v10-persistence.js`
- relevant Wave 6 Focus, Frozen Assessment, Targeted Diagnostic, Progress, persistence, backup, browser/integration tests

### 3.4 Runtime-evidence limitation

The jury attempted to establish a local repository runtime, but the available local environment could not resolve GitHub to clone/fetch the repository. Therefore this report does **not** claim a fresh manual browser session or fresh local execution performed by the jury.

Retained findings are intentionally limited to source-contract contradictions, production wiring, persistence semantics, or test-vs-production-path mismatches that can be established directly from exact repository content. Existing natural exact-head CI/browser evidence is used only to describe what was previously exercised; it is not substituted for a fresh product-completeness test.

### 3.5 External research boundary

No broad external product, learning-science, model, or technology research was performed. Previously supplied deep-research material was treated as non-canonical context, not as proof for any retained finding.

---

## 4. Product journey map reviewed

| Journey / state | Actual path reviewed | Jury result |
|---|---|---|
| First launch / returning learner | `main.js` → persistence initialization/recovery → `app.js` → V10 runtime mounts | No new Stage-2-blocking finding retained from boot itself. |
| Empty-state learner | Core Today/Library/Progress states + canonical Today planner | No invented “missing personalization” finding; sparse canonical evidence is explicitly represented as insufficient data. |
| Learner with due reviews | Core cards/FSRS → Today composer/runner → EvidencePolicy/schedule gateway | Single schedule authority remains coherent in inspected path. |
| Learner with weaknesses | learning events → P7 metrics → Progress WeaknessProfile → Focus → Today | Blocked structurally by `S15-F002` and at scale by `S15-F003`. |
| Focus | `loadCanonicalProgressProjection()` → `selectCanonicalFocus()` → Today Focus slot | Production-wired; not a unit-test-only feature. Scale contract mismatch retained as `S15-F003`. |
| Frozen Assessment | persisted blueprint/run → QAR-backed scoring → terminal completed run | Assessment substrate is intentionally provider-off/non-representative; partial-response recovery contract remains undefined (`S15-F005`). |
| Targeted Diagnostic | WeaknessProfile → question selection → Frozen Assessment blueprint | Currently dormant as a learner entry point; dormancy alone is not a finding. Composition is unsafe due `S15-F001`/`S15-F002`. |
| Vocabulary learning | Core activity → canonical evidence → schedule gateway/FSRS | No competing scheduler discovered in inspected path. |
| IELTS | top-level IELTS IA → IELTS domain/persistence → canonical evidence where eligible | Broadly reuses EvidencePolicy; no new schedule-authority conflict retained. |
| V10 / authentic content | V10 runtime → Today / IELTS / transcript/content surfaces | No finding retained merely because later intelligence/research is absent. |
| Progress/history | learner-visible `app.js::renderProgress()` vs `progress.js` canonical cross-surface projection | Two independent projections; retained as `S15-F004`, intentionally bounded by planned P7-01. |
| Reload / restart | IndexedDB-backed durable state, V10/IELTS persistence, backup registry | Completed durable state is explicitly handled; partial Frozen Assessment responses are not (`S15-F005`). |
| Backup / restore | unified backup registry across Core/IELTS/V10, validation/journal/reconcile rules | No broad restore-corruption finding retained. Global built-in mutation creates a composition risk for generic canonicalizers (`S15-F001`). |
| Offline / degraded operation | existing local-first/cache/fallback paths | No architectural blocker retained from inspected code; this is not a full offline certification. |
| Errors / retries / duplicate writes | EvidencePolicy, receipt identity, persistence/outbox/dead-letter/reconciliation paths | No duplicate scheduling authority found; no new finding retained without stronger evidence. |
| Keyboard/accessibility/device | route buttons, semantic states, reduced-motion handling, responsive IA inspected structurally | No architectural blocker retained; this was not a WCAG certification or final UX review. |

A major false positive was explicitly rejected: Focus is not merely a test-only module. `today-planner-v2.js` consumes the canonical Progress projection and selects Focus during normal V10 Today rendering.

---

## 5. Findings table

| ID | Finding | Severity | Confidence | Evidence | Disposition |
|----|---------|----------|------------|----------|-------------|
| `S15-F001` | Cross-domain compatibility bridges mutate global JavaScript built-ins and `Object.prototype` | HIGH | HIGH | `src/targeted-diagnostic.js`, `src/ielts-domain.js`, `src/ielts-lab.js`, `src/backup-registry.js`, Targeted Diagnostic tests | `MUST_FIX_BEFORE_STAGE_2` |
| `S15-F002` | Two incompatible objects are both treated as the canonical `WeaknessProfile` | HIGH | HIGH | `src/weakness-profile.js`, `src/progress.js`, `src/focus-selector.js`, `src/targeted-diagnostic.js`, `tests/progress.test.mjs`, Wave 6 Targeted Diagnostic tests | `MUST_FIX_BEFORE_STAGE_2` |
| `S15-F003` | Focus rejects learner-history volume accepted by its canonical metrics producer | HIGH | HIGH | `src/p7-00-metrics-reducer.js`, `src/focus-selector.js`, `src/progress.js`, `src/today-planner-v2.js` | `MUST_FIX_BEFORE_STAGE_2` |
| `S15-F004` | Learner-facing Progress remains an independent Core/FSRS-style projection while Today/Focus uses canonical cross-surface evidence | MEDIUM | HIGH | `src/app.js::renderProgress`, `src/progress.js`, `tests/progress.test.mjs`, `docs/ROADMAP.md` P7-01 | `DEFER_TO_PLANNED_STAGE` |
| `S15-F005` | Frozen Assessment persists active run identity but not partial response progress | MEDIUM | HIGH | `src/frozen-assessment-runtime.js`, Wave 6 Frozen Assessment tests, backup coverage | `RESEARCH_BEFORE_STAGE_2` |

### MUST_FIX_BEFORE_STAGE_2

- `S15-F001`
- `S15-F002`
- `S15-F003`

### RESEARCH_BEFORE_STAGE_2

- `S15-F005`

### DEFER_TO_PLANNED_STAGE

- `S15-F004` — defer implementation to the already planned P7-01 Progress owner, but Stage 2 must not treat the current learner-facing Progress UI as the canonical cross-surface learner-state contract.

### ACCEPT_RISK

No retained finding.

### NO_ACTION

No retained finding. Missing BKT/IRT/CAT, general AI scorers, final UX remake, deep learning research, and physical database consolidation were specifically **not** promoted into findings merely because they are not present now.

---

## 6. Detailed material findings

### S15-F001 — Cross-domain compatibility bridges mutate global JavaScript built-ins and `Object.prototype`

**Domain:** Architecture / cross-surface integration / reliability / persistence safety  
**Severity:** HIGH  
**Confidence:** HIGH  
**Disposition:** `MUST_FIX_BEFORE_STAGE_2`

#### Evidence

- `src/targeted-diagnostic.js`
  - defines inherited `qar:*` accessors on `Object.prototype`;
  - defines inherited `questionId`, `optionId`, and `state` accessors on `Object.prototype`;
  - replaces global `Object.keys`;
  - replaces `Object.prototype.hasOwnProperty`;
  - replaces `Map.prototype.get`.
- `src/ielts-domain.js`
  - defines `Object.prototype.frozenAssessments` at module import.
- `src/ielts-lab.js`
  - imports `ielts-domain.js`, so at least the `frozenAssessments` prototype mutation is reachable from the normal IELTS boot path.
- `src/backup-registry.js`
  - generic canonicalization/validation relies on ordinary JavaScript object enumeration such as `Object.keys`, demonstrating that process-wide built-in semantics are shared infrastructure, not local Targeted Diagnostic state.
- Wave 6 Targeted Diagnostic tests import the mutating module and exercise response/question representations whose mismatches are bridged by those mutations.

#### Observed fact

`targeted-diagnostic.js` performs its compatibility behavior at module-import time rather than inside an explicit adapter function. After import, unrelated code in the same JavaScript realm observes modified semantics for core built-ins. Separately, normal IELTS domain import adds a non-enumerable inherited `frozenAssessments` property to every ordinary object through `Object.prototype`.

The modifications are not scoped to one blueprint, one response object, one Map, or one question registry.

#### Inference

This is evidence of unresolved representation ownership between QAR, IELTS, Frozen Assessment, and Targeted Diagnostic. The current integration makes incompatible representations appear compatible by altering ambient JavaScript semantics.

Because many persistence, validation, digest, normalization, and application modules rely on native object/map behavior, future Stage 2 wiring of Targeted Diagnostic can change the behavior of code that has no declared dependency on Targeted Diagnostic.

#### Why it matters

A Stage 2 architecture should be composable: importing one feature must not silently redefine object identity, ownership checks, map lookup, or key enumeration for every other feature. Ambient mutation makes module order part of product semantics and makes failures difficult to localize or reproduce.

This is more dangerous than a local conversion bug because tests can pass specifically due to the global compatibility layer while independent modules are no longer being tested under native semantics.

#### Failure scenario

1. Stage 2 makes Targeted Diagnostic reachable from the normal app boot path.
2. `targeted-diagnostic.js` is imported.
3. The process-wide `Object.keys`, `hasOwnProperty`, `Map.get`, and inherited properties change.
4. A persistence/backup/validator or a later feature receives an object containing `selectedOptionId`, `id`, `status`, or a `qar:*`-like name.
5. That unrelated module observes bridged semantics rather than the actual stored shape.
6. Integration either accepts a malformed representation, hides a missing boundary conversion, or fails only under a different import order.

No current data corruption is asserted; the risk is the demonstrable loss of module-local invariants once the dormant Targeted Diagnostic module is composed into the production graph.

#### Stage 2 impact

HIGH. Stage 2 is precisely where more cross-surface composition will occur. Building new features on top of an ambient compatibility layer would multiply hidden dependencies and make later removal more breaking.

#### Recommended disposition

`MUST_FIX_BEFORE_STAGE_2`.

The required outcome is a stable explicit interop contract with normal language/runtime semantics. This report does not prescribe or authorize a remediation implementation.

---

### S15-F002 — Two incompatible objects are both treated as the canonical `WeaknessProfile`

**Domain:** Learning-system coherence / cross-feature integration / architecture / evidence validation  
**Severity:** HIGH  
**Confidence:** HIGH  
**Disposition:** `MUST_FIX_BEFORE_STAGE_2`

#### Evidence

- `src/weakness-profile.js`
  - `projectWeaknessProfile(...)` creates a profile, records the exact object instance in an internal `WeakSet`, and freezes it;
  - `validateWeaknessProfile(...)` requires that `WeakSet` brand;
  - its `observations.bySkill` representation is an array of observations.
- `src/progress.js`
  - `buildCanonicalProgressProjection(...)` first obtains a profile from `projectWeaknessProfile(...)`, then constructs a **new** `weaknessProfile` object;
  - the new object adds canonical-progress fields such as `kind`, conflict metadata, and a new digest;
  - it converts `observations.bySkill` into an object keyed by skill.
- `src/focus-selector.js`
  - contains its own profile validator whose expected shape matches the Progress projection's object-keyed `bySkill` representation.
- `src/targeted-diagnostic.js`
  - calls `validateWeaknessProfile(profile)` from `weakness-profile.js`, therefore expecting the original WeakSet-branded, array-shaped representation.
- `tests/progress.test.mjs`
  - verifies the production-style canonical Progress shape and directly accesses keyed observations such as `weaknessProfile.observations.bySkill.recall`.
- Wave 6 Targeted Diagnostic tests
  - create the profile directly with `projectWeaknessProfile(...)`, not from the production canonical Progress projection.

#### Observed fact

The object returned as `projection.weaknessProfile` by the canonical Progress projection cannot satisfy `validateWeaknessProfile(...)` as implemented:

1. it is a newly created object and therefore is not in `weakness-profile.js`'s private `WeakSet`;
2. it has a different structural shape, including object-keyed `observations.bySkill` instead of the original array.

Focus succeeds with that Progress object because Focus implements a separate validator for the second shape. Targeted Diagnostic expects the first shape.

#### Inference

There is no single canonical `WeaknessProfile` contract across Progress, Focus, and Targeted Diagnostic. Instead, the system currently has at least two canonicalized representations and two independent validation authorities.

The Targeted Diagnostic tests demonstrate a direct projector→diagnostic path, while production Today demonstrates a projector→Progress transformation→Focus path. They do not prove the composition Stage 2 would naturally need: canonical Progress/learner state→Targeted Diagnostic.

#### Why it matters

Weakness is an architectural hinge:

```text
Evidence
→ metrics
→ weakness
→ Focus
→ Today
→ diagnostic
```

If the hinge itself has competing canonical representations, Stage 2 cannot safely add adaptive diagnostics, planning, progress, or personalization without choosing one path implicitly. That risks future migrations, duplicate reducers, duplicated business rules, and contradictory learner recommendations.

The private WeakSet brand also means structurally identical clone/reload/reconstruction is not equivalent to the original instance for `validateWeaknessProfile`, which is incompatible with treating the object as a normal durable/reconstructable cross-module contract.

#### Failure scenario

1. Stage 2 loads the learner's canonical progress projection from durable learning events.
2. It passes `projection.weaknessProfile` to Targeted Diagnostic.
3. `validateWeaknessProfile` rejects it as `INVALID_PROFILE`, despite the object being the same canonical learner weakness state used by Focus.
4. A developer works around this by choosing one of the current validators or reconstructing another shape.
5. Focus, Progress, and Diagnostic then diverge further while all remain individually green.

#### Stage 2 impact

HIGH. This directly invalidates the assumption that Stage 1 produced one stable learner weakness semantic contract that multiple Stage 2 features can consume.

#### Recommended disposition

`MUST_FIX_BEFORE_STAGE_2`.

Before Stage 2, there must be one explicitly owned, clone/reload-safe canonical contract or an explicitly named conversion boundary with only one canonical authority. This report does not choose the new semantic design or authorize code changes.

---

### S15-F003 — Focus rejects learner-history volume accepted by its canonical metrics producer

**Domain:** Performance / scale / reliability / Today integration  
**Severity:** HIGH  
**Confidence:** HIGH  
**Disposition:** `MUST_FIX_BEFORE_STAGE_2`

#### Evidence

- `src/p7-00-metrics-reducer.js`
  - `P7_METRICS_MAX_EVENTS = 100000`;
  - accepts and canonicalizes the learner event array up to that limit;
  - emits `canonicalInputRefs` over unique canonical events;
  - emits per-skill `sourceRefs` for eligible evidence.
- `src/progress.js`
  - `loadCanonicalProgressProjection(...)` loads canonical learning events and reduces the full supplied history into the canonical projection.
- `src/focus-selector.js`
  - rejects `profile.canonicalInputRefs.length > 10000`;
  - rejects an observation whose `sourceRefs.length > 10000`;
  - additionally accumulates canonical refs plus every observation's evidence refs and rejects when that combined reference count exceeds 10000.
- `src/today-planner-v2.js`
  - obtains the canonical Progress projection and calls `selectCanonicalFocus(...)` during Today planning;
  - explicitly rethrows `FOCUS_INVALID_INPUT` rather than degrading it into a normal `NOT_SELECTED` Focus decision.

#### Observed fact

The producer and consumer disagree on valid input size.

A history accepted by `reduceCanonicalLearningMetrics(...)` can produce a canonical WeaknessProfile that is rejected as invalid by Focus. The Focus limit is not only a lower 10,000-event threshold; because Focus counts both canonical input refs and duplicated per-observation evidence refs toward its internal cap, the rejection can occur before 10,000 distinct canonical input events.

#### Inference

A long-lived learner can cross a deterministic state boundary where accumulating valid durable evidence makes Today less reliable rather than more informative. Stage 2 is likely to increase event volume through more activities, diagnostics, content, and evidence-bearing workflows, so the risk grows with legitimate product use.

The current contract also encourages full-history materialization and repeated provenance duplication on an interaction path that can run during Today rendering.

#### Why it matters

This is not a micro-optimization. It is an incompatible validity contract between two canonical owners. Once crossed, Focus does not merely become slower; it can throw `FOCUS_INVALID_INPUT`, and Today explicitly treats that code as an error rather than ordinary insufficient data.

A Stage 2 feature should not have to guess whether to truncate history, drop provenance, or bypass the selector, because any such workaround changes evidence semantics.

#### Failure scenario

1. A learner accumulates canonical learning events over months/years.
2. P7 metrics successfully reduces the history because it remains below its accepted 100,000-event ceiling.
3. The resulting canonical profile includes more references than Focus's accepted provenance ceiling.
4. Today requests Focus.
5. Focus throws `FOCUS_INVALID_INPUT`.
6. Today cannot simply interpret the situation as “no eligible Focus”; the invalid-input error is rethrown.

#### Stage 2 impact

HIGH. New Stage 2 features that add attempts/evidence accelerate arrival at the incompatible boundary and make later correction a migration/semantic question instead of a local performance fix.

#### Recommended disposition

`MUST_FIX_BEFORE_STAGE_2`.

The canonical history/provenance contract and Focus consumption boundary must be reconciled before adding more event-producing Stage 2 capabilities. This report deliberately does not choose a windowing, aggregation, indexing, or provenance-compaction implementation.

---

### S15-F004 — Learner-facing Progress remains an independent Core/FSRS-style projection while Today/Focus uses canonical cross-surface evidence

**Domain:** Product semantics / UX-IA / learning-system coherence  
**Severity:** MEDIUM  
**Confidence:** HIGH  
**Disposition:** `DEFER_TO_PLANNED_STAGE`

#### Evidence

- `src/progress.js`
  - implements `buildCanonicalProgressProjection(...)` over canonical learning events;
  - Progress tests reconcile authentic Core, IELTS, and V10 evidence in that projection.
- `src/app.js::renderProgress()`
  - reads `listReviewEvents()` and card/FSRS state;
  - independently computes activity, knowledge strength, skill coverage, review quality, forecast, exam pacing, and error fingerprint;
  - does not consume `buildCanonicalProgressProjection(...)` / `loadCanonicalProgressProjection(...)`.
- `src/today-planner-v2.js`
  - does consume the canonical Progress projection for Focus.
- `src/primary-ia-v10.js`
  - adds IELTS as a top-level route but leaves the Core Progress route as the learner-visible Progress destination.
- `docs/ROADMAP.md`
  - explicitly schedules P7-01 as the future Progress owner after P7-00 canonical metrics.

#### Observed fact

The product currently has a canonical cross-surface progress/weakness projection used by Today/Focus and a separate learner-facing Progress UI derived from review events and card/FSRS state. The repository does not demonstrate that the two representations are equivalent for all Core/IELTS/V10 learner activity.

#### Inference

A learner can be shown a Progress mental model whose metrics are not the same contract that chooses their Focus. This is a semantic/IA risk, but the roadmap already has an explicit future Progress stage, so absence of final reconciliation now is not itself evidence that Stage 1 failed.

#### Why it matters

Stage 2 developers could accidentally treat the current visible Progress implementation as the canonical learner-state API because it is user-facing and mature-looking, while Today/Focus relies on another projection. That would create a third consumer contract or duplicate calculations.

#### Failure scenario

A new Stage 2 feature reads current Progress UI-derived metrics to choose content or display weakness while Focus reads canonical event-derived weakness. The user sees different “why this is weak” or success-rate narratives for the same history, even though both modules are locally correct.

#### Stage 2 impact

MEDIUM if bounded. Stage 2 can avoid invalidating its foundation by treating the canonical event-derived projection—not the current `renderProgress()` implementation—as the learner-state semantic dependency and leaving UI reconciliation to P7-01.

#### Recommended disposition

`DEFER_TO_PLANNED_STAGE`.

Do not pull the full P7-01 Progress remake into Stage 1.5. Instead, explicitly constrain intervening work not to adopt `app.js::renderProgress()` calculations as a second canonical learner-state authority.

---

### S15-F005 — Frozen Assessment persists active run identity but not partial response progress

**Domain:** Persistence / recovery / learner journey / assessment reliability  
**Severity:** MEDIUM  
**Confidence:** HIGH  
**Disposition:** `RESEARCH_BEFORE_STAGE_2`

#### Evidence

- `src/frozen-assessment-runtime.js`
  - `startRun(...)` persists an `ACTIVE` run;
  - `completeRun({ runId, responses })` receives the entire response array at terminal completion;
  - an incomplete response set is rejected and the run remains active;
  - the completed run persists terminal responses and summary.
- Wave 6 Frozen Assessment tests
  - demonstrate immutable blueprint behavior, terminal replay/conflict behavior, incomplete-terminal rejection, hostile-input handling, and completed-run backup/restore;
  - do not demonstrate answer-by-answer persistence and reload/resume of an interrupted active run.
- backup registry/persistence coverage
  - Frozen Assessment durable records are backed up, so active run identity can survive; no separate partial-answer record contract was found in the reviewed runtime.

#### Observed fact

The accepted Frozen Assessment runtime persists the run before completion but does not expose a per-answer persistence operation. Responses become part of durable Frozen Assessment state at terminal `completeRun(...)` time.

#### Inference

If a future learner-facing assessment UI keeps in-progress answers only in memory, reload/crash/navigation can leave a durable `ACTIVE` run without the learner's partial answers. A future UI could create separate draft persistence, but that ownership and recovery rule are not currently defined by the Frozen Assessment contract.

#### Why it matters

Stage 2 may build richer assessment/diagnostic flows on this substrate. If resume semantics are decided only after UI implementation, the project may accidentally add a second response store, ambiguous abandon/retry rules, or duplicate run identities.

#### Failure scenario

1. Learner starts a multi-item assessment.
2. Several answers are entered in UI state.
3. Browser reloads or the tab crashes before terminal completion.
4. Durable storage still contains an `ACTIVE` run but not the entered responses in the Frozen Assessment run contract.
5. The product must guess whether to resume empty, abandon, replace, or create a new run.

#### Stage 2 impact

MEDIUM. It does not invalidate current provider-off assessment scoring, but the recovery contract should be decided before Stage 2 makes assessments a meaningful learner journey.

#### Recommended disposition

`RESEARCH_BEFORE_STAGE_2`.

Define the required interruption semantics—resume, explicit abandon/restart, or another bounded contract—before building the Stage 2 journey. This report does not authorize a new store or persistence schema.

---

## 7. Cross-surface consistency matrix

Legend:

- `INTENTIONAL` — difference is consistent with current canonical ownership/boundaries.
- `UNEXPLAINED` — coexistence is observable but not currently reconciled.
- `CONTRADICTORY` — two components make incompatible claims about the same contract.

| Concept | Core | IELTS | V10 | Frozen Assessment | Targeted Diagnostic | Classification |
|---|---|---|---|---|---|---|
| Activity / Run / Attempt / Receipt | Canonical learning contracts via schedule gateway | Reuses canonical envelope where evidence-bearing | Reuses canonical event/evidence paths | Separate assessment run built over accepted QAR contracts; no schedule authority | Creates Frozen Assessment blueprint, does not create a second learning scheduler | `INTENTIONAL` |
| Evidence eligibility | `EvidencePolicy` | Delegates to `EvidencePolicy` | Coaching/unverified paths remain non-scheduling | `affectsSchedule:false` | Diagnostic blueprint itself is not mastery/schedule evidence | `INTENTIONAL` |
| Scheduling | FSRS only after eligible evidence | No independent IELTS scheduler found | No independent V10 scheduler found | No schedule mutation | No schedule mutation | `INTENTIONAL` |
| Weakness representation | canonical P7 metrics feed Progress projection | Evidence can contribute to cross-surface projection | Evidence can contribute to cross-surface projection | consumes selected questions, not weakness owner | expects WeakSet-branded array-shape profile | `CONTRADICTORY` — `S15-F002` |
| Focus | Today consumes canonical Progress weakness | Cross-surface evidence can affect Focus through projection | Same Today owner | not Focus owner | intended diagnostic follow-up, not Focus owner | `INTENTIONAL` except profile contract contradiction |
| Progress | learner UI independently derives review/card metrics | canonical projection can include IELTS evidence | canonical projection can include V10 evidence | not Progress owner | not Progress owner | `UNEXPLAINED`, intentionally deferred to P7-01 — `S15-F004` |
| Response identity | normal activity-specific contracts | QAR/IELTS response forms | QAR/V10 forms | normal Frozen/QAR terminal response uses its own explicit fields | compatibility code aliases `selectedOptionId`/`optionId`, `qar:*`/short IDs globally | `CONTRADICTORY` — `S15-F001` |
| Persistence | Core IndexedDB | IELTS IndexedDB | V10 IndexedDB | durable assessment records in accepted owner store | no separate durable diagnostic scheduler/store | Physical separation is `INTENTIONAL` under logical-unification ADR |
| Backup/restore | unified backup registry | unified backup registry | unified backup registry | durable completed/active records included | no separate store found | `INTENTIONAL`; partial response semantics unresolved (`S15-F005`) |
| Error handling | canonical persistence/evidence failure rules | domain error records + canonical evidence boundary | bridges into accepted error/evidence architecture | terminal conflict/incomplete are explicit | invalid profile/input explicit | Broadly `INTENTIONAL`; global compatibility mutation is the exception |

The highest-leverage contradiction is not “Core vs IELTS vs V10 use different feature code”; that is expected. It is that semantically identical cross-feature boundary objects—WeaknessProfile and question/response identity—do not have one stable representation.

---

## 8. Architecture ownership observations

### 8.1 Ownership that is currently strong

**Evidence and scheduling.** `EvidencePolicy` remains the clearest architecture boundary in the repository. Core scheduling passes through evidence eligibility; inspected IELTS/V10 paths do not introduce an independent scheduler; Frozen Assessment/Targeted Diagnostic remain explicitly non-mastery/non-schedule authorities.

**Today composition.** Today owns learner work composition, and Focus is a bounded additional selection rather than a second planner. This is a useful ownership constraint to preserve.

**Backup integration.** The repository deliberately has multiple physical databases but a unified durable/reconstructable classification and backup registry. ADRs explicitly prefer logical unification before physical consolidation. Multi-DB existence alone is therefore not a defect.

### 8.2 Ownership that is split

**WeaknessProfile.** `weakness-profile.js`, `progress.js`, and `focus-selector.js` collectively define two shapes and multiple validators; Targeted Diagnostic chooses the original projector validator rather than the canonical Progress consumer shape. No single boundary currently owns the serialized/clone-safe contract end-to-end.

**Question/response compatibility.** Instead of one owner explicitly converting between QAR/IELTS/Frozen representations, Targeted Diagnostic changes ambient JS semantics. That is a strong signal that cross-package identity ownership was never fully reconciled.

**Progress.** The canonical event-derived projection exists, but the learner-facing Progress implementation still independently owns visible calculations. Roadmap P7-01 provides a future owner, so this is a bounded pending reconciliation rather than a reason to rewrite Stage 1.

### 8.3 Architectural non-findings

The jury explicitly did **not** recommend:

- a repository-wide rewrite;
- replacing FSRS;
- introducing BKT/IRT/CAT now;
- physical consolidation of Core/IELTS/V10 databases merely for conceptual purity;
- a second assessment runtime;
- a new AI scoring authority;
- moving final UX redesign into Stage 1.5.

Those moves are not supported by this audit evidence.

---

## 9. Persistence / recovery risk map

| Durable concern | Current evidence | Risk classification | Jury disposition |
|---|---|---|---|
| Qualified learning evidence | Durable canonical learning/review events and projection infrastructure; EvidencePolicy boundary | Covered in reviewed architecture | No new finding |
| Duplicate/replayed evidence | Stable receipt/decision identity and idempotence contracts exist | Covered for inspected core path | No new finding |
| Cross-database backup | `backup-registry.js` classifies Core/IELTS/V10 durable/cache/ephemeral state and validates cross-store invariants | Substantial explicit coverage | No broad finding |
| Secrets | Gemini credential is session-only/explicitly excluded from backup | Appropriate boundary in reviewed registry | No finding |
| WeaknessProfile reconstruction | Event-derived state is reconstructable, but one validator depends on same-process WeakSet identity and another canonical projection changes shape | Structural durability/serialization mismatch | `S15-F002` |
| Frozen Assessment completed run | Durable terminal responses and backup/restore evidence | Covered | No finding |
| Frozen Assessment active run | Run identity durable; partial responses absent from runtime contract | Recovery ambiguity | `S15-F005` |
| Large learner history | Metrics accepts up to 100k input events; Focus rejects substantially smaller provenance sets | Valid durable history can become invalid consumer input | `S15-F003` |
| Generic canonicalization after diagnostic import | Backup/validators rely on ordinary native object semantics; Targeted Diagnostic can replace those semantics realm-wide | Cross-module invariant risk | `S15-F001` |
| Cache/model/media bytes | Explicit durable vs reconstructable-cache distinction | Consistent with current ADR | No finding |

### Cross-version / rollback observation

The existing architecture contains forward migration, staged restore, validation/journal/reconcile expectations. No retained finding asserts that existing backup/restore is generally unsafe. The jury's persistence findings are narrower: a semantic object that cannot survive normal clone/reconstruction validation (`S15-F002`), undefined partial assessment response recovery (`S15-F005`), and a history-size contract mismatch (`S15-F003`).

---

## 10. Test / evidence blind spots

These are retained only where a concrete risk is tied to a finding.

### 10.1 Targeted Diagnostic tests run inside the compatibility mutation they should be challenging

Importing `targeted-diagnostic.js` changes built-ins before the tests exercise the adapter. Tests therefore demonstrate behavior **with** the ambient bridge already installed. They do not prove that feature boundaries agree under native object/map semantics. This blind spot directly supports `S15-F001`.

### 10.2 No production-chain test for canonical Progress WeaknessProfile → Targeted Diagnostic

Progress tests prove the keyed canonical Progress profile. Targeted Diagnostic tests prove a directly projected WeaknessProfile. No reviewed test composes the production canonical Progress object into Targeted Diagnostic. This permits both suites to be green despite the incompatible contracts in `S15-F002`.

### 10.3 No boundary-volume test matching metrics producer to Focus consumer

Focus tests use bounded fixtures. The canonical metrics reducer and Focus selector independently enforce different maxima, but no reviewed test generates an accepted near-limit metrics profile and feeds it through production Today/Focus. This blind spot permits `S15-F003`.

### 10.4 Completed assessment recovery is tested; interrupted partial-answer recovery is not

Frozen Assessment tests cover terminal persistence/replay/conflict and completed backup/restore. That is meaningful evidence. It does not demonstrate the user journey “answer several items → reload → resume”, because the runtime has no per-answer contract to exercise. This supports `S15-F005` rather than invalidating existing terminal tests.

### 10.5 Progress canonicalization is tested below the UI boundary

`tests/progress.test.mjs` demonstrates cross-surface canonical metrics/weakness. `app.js::renderProgress()` uses different inputs/calculations. No reviewed integration evidence establishes semantic equivalence between those two projections. This supports `S15-F004`.

### 10.6 Existing green natural CI is necessary but not sufficient

Stage 1 post-merge CI/browser artifacts prove the repository passed the checks that were encoded. They cannot detect a dormant import-time mutation if the dormant module is not in the normal browser graph, nor can separate unit suites detect a contract mismatch when each constructs its own accepted fixture shape.

---

## 11. Unknown-unknown hypotheses

The hypotheses below are **not retained findings**. They identify high-value falsification targets for later reconciliation/research without pretending evidence is already sufficient.

### H1 — Import order may be an undocumented product input

Because domain modules modify global prototypes/built-ins at import time, another hidden compatibility behavior may currently work or fail depending on module ordering. Search specifically for inherited fallback assumptions before future cross-surface imports are added.

### H2 — More “same name, different shape” contracts may exist around QAR responses

`selectedOptionId` vs `optionId`, `qar:*` vs short IDs, and `status` vs `state` are bridged globally in one file. That may indicate further representation mismatches around question identity, response identity, and terminal state. This should be falsified by tracing actual QAR/Frozen/IELTS persisted records, not by adding more aliases.

### H3 — Provenance growth may become a memory/interaction problem before storage limits

Current P7 metrics materializes full canonical refs and repeats evidence refs inside per-skill observations. Even after the hard contract mismatch in `S15-F003` is reconciled, long-lived full-history projection on interactive Today/Progress paths may need a measured performance model. No performance severity is assigned without runtime measurements.

### H4 — Cross-database snapshots may produce temporally mixed learner views

Core, IELTS, and V10 remain physically separate by design. It is plausible that a projection read spanning databases can observe different commit moments during concurrent activity/tabs. Existing logical-unification and reconciliation machinery may already bound this, but this pass did not establish a single snapshot transaction across all stores. Treat as a hypothesis, not a defect.

### H5 — Stage 2 could accidentally canonize the visible Progress UI

Because the visible Progress screen presents authoritative-looking numbers while canonical Focus reads another projection, a new feature owner may naturally import the wrong semantics. The near-term prevention is an authority boundary, not a premature P7-01 UI rewrite.

### H6 — Assessment resume work could accidentally create a second attempt/response authority

If partial response recovery is added ad hoc at UI level, it may create another draft/terminal identity model. Resolve the product contract first (`S15-F005`) before selecting storage mechanics.

### H7 — Inherited fallback properties may hide missing-store/missing-field failures

`Object.prototype.frozenAssessments` means a missing own field can appear as an empty collection. Similar inherited compatibility fields could convert a “missing owner” error into an apparently valid empty state. No specific corruption was established in this pass, so this remains a hypothesis attached to `S15-F001`.

---

## 12. Stage 2 readiness assessment

### Classification

`NOT_READY_FOR_STAGE_2`

### Why

The foundation has at least three credible blockers:

- `S15-F001`: Stage 2 composition can activate process-wide runtime semantic mutation.
- `S15-F002`: there is no single consumable canonical WeaknessProfile across Progress/Focus/Diagnostic.
- `S15-F003`: valid canonical learner history can become invalid Focus input on a core Today path.

These are not requests for later feature richness. They are current contract defects in substrate that Stage 2 is likely to consume or amplify.

### What this does not mean

This classification does **not** mean:

- Stage 1 technical acceptance is retroactively REJECTED;
- current users necessarily encounter all three blockers today;
- every Stage 1 feature is broken;
- remediation is authorized;
- Stage 2 is permanently blocked;
- the jury has selected new product semantics.

Targeted Diagnostic and Frozen Assessment are currently more substrate than normal learner entry points. That is why `S15-F001` is HIGH rather than CRITICAL, and why `S15-F005` is a research/bounding issue rather than a Stage 1 failure.

### Minimum reconciliation before a future Stage 2 authorization decision

A future independent reconciliation should establish, from fresh evidence, that:

1. process-wide built-in/prototype compatibility mutations no longer form a required interop contract for Stage 2 composition;
2. one exact WeaknessProfile authority or explicit conversion boundary is stable across Progress, Focus, reload/clone, and Targeted Diagnostic;
3. the valid-history/provenance contract accepted by P7 metrics is also safely consumable by Focus/Today at the intended learner-history scale;
4. `S15-F005` has a documented product disposition before assessment becomes a Stage 2 learner journey;
5. P7-01 remains the owner of full Progress UI reconciliation unless separately re-authorized.

Again, this is an audit exit condition, not remediation authorization.

---

## 13. Recommended disposition map

| Finding | Immediate discovery disposition | What must be known before moving on | What is explicitly not authorized here |
|---|---|---|---|
| `S15-F001` | `MUST_FIX_BEFORE_STAGE_2` | Cross-package representations compose without changing ambient JavaScript built-in semantics | Adapter implementation, refactor, source edits |
| `S15-F002` | `MUST_FIX_BEFORE_STAGE_2` | Exact canonical WeaknessProfile authority/shape/validation/clone behavior is singular and cross-feature-compatible | New weakness semantics, migration, source edits |
| `S15-F003` | `MUST_FIX_BEFORE_STAGE_2` | Metrics→Progress→Focus supports one explicit learner-history/provenance scale contract without turning valid history into Today invalid input | Windowing/index/aggregation implementation |
| `S15-F004` | `DEFER_TO_PLANNED_STAGE` | Intervening work knows the visible Progress UI is not the canonical learner-state authority; P7-01 retains reconciliation ownership | Pulling P7-01 implementation into Stage 1.5 |
| `S15-F005` | `RESEARCH_BEFORE_STAGE_2` | Product requirement for interrupted assessment is explicit: resume vs abandon/restart vs another bounded contract | New store, migration, assessment UX implementation |

### Items deliberately outside this report's remediation scope

- BKT / IRT / CAT adoption
- AI/GEC/pronunciation technology selection
- IELTS band-scoring research
- full WCAG certification
- final UX remake
- production telemetry/real-world cohort validation
- physical database consolidation
- broad performance optimization

Those belong to their planned research/product stages unless a future canonical authority says otherwise.

---

## 14. Governance / development-process assessment

Stage 1's process protected correctness in several material ways, but it also accumulated process debt by treating many mechanically checkable transitions as separate prompt/PR ceremonies.

### 14.1 Controls that materially protected correctness

| Control | Recommendation | Why |
|---|---|---|
| Fresh canonical authority read | **KEEP** | Prevents implementation from treating roadmap/spec/research text as authorization. |
| Exact predecessor/base/head verification | **KEEP** | Prevents auditing or integrating a stale candidate. |
| One-writer / exact branch ownership while mutation is active | **KEEP** | Reduces concurrent-state ambiguity and accidental cross-candidate reuse. |
| Changed-path allowlist / bounded scope | **KEEP** | Provides strong scope-creep protection and makes independent review tractable. |
| Natural exact-head CI | **KEEP** | Separates exact candidate behavior from author narrative and synthetic/replayed evidence. |
| Independent exact-head reviewer | **KEEP** | Prevents executor self-acceptance and caught substantive contract/evidence defects during Stage 1. |
| Fail closed on ambiguous authority/evidence | **KEEP** | Especially important for learner semantics, persistence, and governance. |
| Read-back after verdict/merge | **KEEP** | Cheaply catches write races/stale-head transitions. |
| Historical rejected/blocked candidate freeze | **KEEP** | Prevents rejected commits/evidence from silently re-entering later candidates. |
| Immutable evidence/test predicates for high-risk semantic gates | **ESCALATE_ONLY** | Valuable for EvidencePolicy, persistence, destructive migration, security, and similar high-risk contracts; excessive for routine UI/local features. |

### 14.2 Controls/process shapes that should be simplified

| Control / pattern | Recommendation | Why |
|---|---|---|
| Separate human prompt for every deterministic transition | **REMOVE as default** | Prompt count is not a correctness predicate. Once exact authority and predicates are frozen, mechanical transitions can live in one bounded execution capsule. |
| Separate authorization PR for routine implementation after an already accepted bounded contract | **SIMPLIFY** | For standard-risk features, one implementation PR plus one independent review is usually sufficient if authority is already explicit. |
| Separate integration authorization transaction after independent ACCEPT when merge authority was already explicitly granted | **REMOVE as default** | Duplicates a deterministic conditional action; retain when merge authority was not pre-granted or integration has distinct risk. |
| Full artifact/digest bookkeeping for every routine feature | **SIMPLIFY** | Exact commit + natural exact-head CI + logs are usually sufficient. Keep digests where artifact provenance itself is a trust boundary. |
| Package/wave acceptance ceremony for isolated standard features | **ESCALATE_ONLY** | Needed for multi-package semantic closure, not every feature. |
| Status-reconciliation PR after every accepted feature | **REMOVE as default** | Use only when canonical status actually diverged or multiple accepted candidates must be reconciled. |
| Mandatory A/RED → B/GREEN → C/evidence-only multi-commit topology for every feature | **ESCALATE_ONLY** | Strong for high-risk contract preservation and independent evidence; unnecessary process cost for ordinary bounded changes where tests/diff/CI give sufficient proof. |
| Recovery authorization for normal rejected PR iteration | **ESCALATE_ONLY** | Needed when reusing frozen evidence/history or recovering a governance-sensitive candidate, not for ordinary new remediation commits under a still-valid feature authority. |

### 14.3 Stage 1 process debt: what caught real problems

The following Stage 1 mechanisms had clear protective value:

- exact-head audits prevented stale summaries from becoming acceptance;
- predecessor and historical-candidate controls prevented accidental reuse of rejected/blocked candidates;
- allowlists kept wide Wave 6 work from drifting across unrelated owners;
- independent review separated implementation evidence from acceptance authority;
- natural CI and raw artifacts exposed the difference between source claims and executable evidence;
- recovery/freeze rules mattered during failed CI/candidate incidents where provenance could otherwise become ambiguous.

### 14.4 Stage 1 process debt: what mostly multiplied prompts

The main avoidable cost came from serializing transitions that had already become deterministic:

- a new prompt/comment for a transition whose exact predecessor, allowlist, next action, and stop condition were already frozen;
- repeated authorization/integration/status candidates whose only new act was to restate previously accepted predicates;
- retaining full high-risk artifact ceremony after the subject had narrowed to a routine docs-only/mechanical transition;
- forcing a human handoff where the same independent reviewer could safely evaluate exact-head predicates and perform an explicitly pre-authorized deterministic merge.

This conclusion is consistent with the repository's own ADR-046: bounded execution capsules reduce handoffs without reducing gates, and prompt count is not itself an acceptance predicate.

### 14.5 Governance principle for Stage 2+

Use **risk-proportional governance**:

```text
preserve independent acceptance
+ preserve exact evidence
+ preserve authority boundaries
- remove ceremonial handoffs that add no independent information
```

The goal is not weaker governance. It is the minimum process that still gives a skeptical independent reviewer enough exact evidence to reject a bad candidate.

---

## 15. STANDARD FEATURE PROTOCOL V2 recommendation

**Status of this section:** recommendation only; not canonical governance.

### Recommended default — standard feature

#### Prompt 1 — IMPLEMENTER

```text
1. Fresh-read current canonical authority and exact main/base.
2. Confirm bounded scope, allowed paths, and relevant contracts/tests.
3. Classify the change as STANDARD or one of the escalation classes below.
4. Add/confirm the smallest behavior test that would fail for the intended defect/feature when test-first evidence is meaningful.
5. Implement the smallest sufficient change; no unrelated refactor/dependency/owner expansion.
6. Run relevant local tests/lint/typecheck/build and inspect the exact diff.
7. Create one PR from the exact authorized predecessor.
8. Obtain natural exact-head CI.
9. Handoff exact base/head, changed paths, commands/results, known limitations, and raw CI evidence.
10. STOP. No self-acceptance and no merge unless a distinct authority explicitly grants it.
```

#### Prompt 2 — INDEPENDENT REVIEWER

```text
1. Fresh-read canonical authority; do not trust implementer summary.
2. Verify exact base/head/topology and changed-path scope.
3. Read the exact diff and relevant tests/contracts.
4. Verify natural exact-head CI and any risk-specific evidence.
5. Persist exactly one ACCEPT / REJECT / BLOCKED verdict.
6. Read back the verdict and re-check exact-head/base predicates.
7. If and only if the assignment explicitly pre-authorizes deterministic post-ACCEPT merge,
   and exact predicates remain unchanged, mechanically merge.
8. Verify resulting canonical main / required post-merge CI/read-back.
9. STOP.
```

Two prompts are the default because the independence boundary—not prompt count—is the material control.

### Exact escalation triggers

Escalate beyond the two-prompt standard flow when a change touches any of these classes:

1. **Architecture ownership change** — moves canonical responsibility for learner state, Today, Progress, evidence, scheduling, assessment, diagnostic, or persistence.
2. **Destructive migration / cross-version compatibility** — deletion, irreversible schema transform, legacy-state reinterpretation, or recovery semantics.
3. **Irreversible data transformation** — especially learner-authored/evidence/history data.
4. **Security/privacy boundary** — external input trust, origin isolation, private learner data, remote transmission, executable/imported content.
5. **Authentication/credentials/secrets** — storage, forwarding, refresh, provider credential boundaries.
6. **EvidencePolicy / scheduling / mastery semantics** — anything able to create, suppress, reinterpret, or reschedule durable learning evidence.
7. **Backup/restore format or registry** — durable store inclusion, format version, restore journal/reconciliation, portability.
8. **Externally visible compatibility contract** — import/export format, public API/schema, persisted question/content format.
9. **Cross-database transaction/reconciliation ownership** — if a feature adds a new atomicity/recovery assumption across Core/IELTS/V10.
10. **Repository governance/workflow change** — Actions permissions, acceptance machinery, authorization model, merge mechanics.
11. **Historical rejected/blocked candidate reuse** — any request to reuse frozen commits, RED/GREEN evidence, artifacts, or prior acceptance claims.
12. **High-risk production recovery/incident work** — where rollback, provenance, and failure containment are part of the product trust boundary.

For these classes, use the extra controls that are actually relevant: explicit authorization capsule, immutable test/evidence predicates, migration/rollback proof, artifact provenance, separate package acceptance, or dedicated security/recovery audit.

### Control disposition summary

- **KEEP:** exact authority, exact predecessor/base/head, allowlist, natural CI, independent review, fail-closed authority, read-back.
- **SIMPLIFY:** routine evidence packets, ordinary authorization handoffs, artifact bookkeeping.
- **REMOVE as default:** one-prompt-per-transition ceremony, routine integration authorization after already pre-authorized ACCEPT, routine status-reconciliation transactions.
- **ESCALATE_ONLY:** multi-commit RED/GREEN evidence topology, package/wave acceptance, frozen-candidate recovery authorization, artifact digest/provenance ceremony, destructive migration/security/governance-specific gates.

This protocol must not become canonical merely because it appears in this discovery report. A separate governance authority would be required to adopt it.

---

## 16. Explicit non-authority statement

`STAGE1_5_PRODUCT_JURY_DISCOVERY_001` is **DISCOVERY ONLY**.

It does not:

- ACCEPT or REJECT this report independently;
- change the historical Stage 1 technical/package acceptance state;
- authorize remediation of `S15-F001` through `S15-F005`;
- select new WeaknessProfile, Focus, assessment, persistence, or learning semantics;
- authorize source/test/roadmap/status/governance changes;
- authorize Stage 2 planning or execution;
- grant package acceptance;
- grant merge authority;
- make STANDARD FEATURE PROTOCOL V2 canonical.

The report candidate and its exact-head CI require independent Stage 1.5 jury reconciliation. Any later remediation or Stage 2 action requires its own valid authority.
