# Assessment and Readiness Evidence Coverage Matrix

Matrix status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-FD IS GROUPING_ONLY`
Implementation authorization: `NOT_GRANTED`

This matrix tests the intended pipeline:

`Diagnostic → WeaknessProfile → Focus Practice → Sectional Test → Timed Practice
→ Full Mock → Readiness`.

Current progress, pacing and coaching recommendations must not be relabeled as
exam readiness or an official band estimate.

## Baseline matrix

| Stage/decision | Current capability | Current canonical owner | Evidence accepted today | Missing canonical boundary/evidence | Coverage classification |
|---|---|---|---|---|---|
| “What should I study today?” | Deterministic due-first Today with error/content/new-card reason codes | P1-07/P1-08 | Accepted canonical schedule/error/activity inputs | Weakness/focus integration owner and advisory/canonical separation | PARTIAL |
| Diagnostic | Error/attempt summaries and small practice observations only | No frozen diagnostic owner | Individual canonical attempts/errors where qualified | Frozen blueprint, coverage rationale, scoring interpretation, sufficient-data and acceptance contract | GAP |
| WeaknessProfile | Weak Sound Map coaching heuristic only | No canonical profile owner; proposed port to P7-00 requires later approval | Coaching signals only; not canonical weakness | Deterministic reducer over qualified evidence/errors, taxonomy/version, denominator, recency and uncertainty | GAP |
| Error recurrence | Global ErrorRecord/occurrence and repair queue exist | P1-06 | Accepted canonical occurrences and correction evidence | Cross-type/profile aggregation belongs to future Weakness owner, not Error Repository | PARTIAL |
| Focus Practice | Today can prioritize due and error repair; coaching recommendations exist | P1-07/P1-08 | Exact accepted activities and due/error reasons | Shared focus contract, canonical selector, advisory selector, budget/fairness and accepted executor eligibility | PARTIAL |
| Review timing | FSRS/due schedule exists for cards | Existing scheduler/EvidencePolicy | Qualified card review events | No generic assessment/content-reminder owner; AI cannot alter FSRS | PARTIAL within cards only |
| Sectional Test | Reading/listening micro-practice only | No sectional/profile owner | No representative section evidence | Accepted type inventory, section structure A/GT, frozen blueprint, scoring/timer and independent acceptance | GAP |
| Timed Practice | Media 10/20/30-minute practice-volume selection only | Existing media practice owner | Coaching practice duration, not assessment timing | Trusted timer, pause/resume/accommodation, expiry/partial terminal semantics and scoring snapshot | GAP |
| Full Mock | No implementation found | UNASSIGNED | None | Representative four-skill inventory, rights, form assembly, scoring, artifact/timer/recovery and calibration | GAP |
| Readiness estimate | Progress shows retrievability/coverage/pacing and explicitly avoids exam prediction | P7 metrics/calibration work remains blocked; readiness owner unassigned | No readiness evidence | Evidence model, uncertainty/confidence, recency, coverage, delayed outcomes, calibration and honest UI | GAP |
| “When should I take timed/mock?” | No canonical gate | UNASSIGNED | None | Prerequisites, readiness uncertainty, recent sectional history and user-goal policy | GAP |

## Repository evidence at tracked baseline `d8ec9c7f`

- `src/today-composer.js:21` supplies deterministic due/error/content/new-card
  planning with reason codes.
- `src/coaching-engine-v2.js:17` derives a narrow Weak Sound Map and marks its
  recommendations `coachingOnly:true`; it is not a canonical WeaknessProfile.
- `src/ielts-domain.js:401` turns 10/20/30 minutes into practice volume, not an
  assessment timer or frozen scoring contract.
- `src/app.js:225` and `src/learning.js:659` present retrievability, coverage and
  pacing and explicitly state that pacing is not exam-score prediction.
- QAR-00 is still planned and explicitly makes no full-coverage claim; Phase 7
  measurement/calibration/personalization packages remain blocked in the status
  ledger.

## Evidence contract required per future stage

| Evidence concern | Minimum rule |
|---|---|
| Input qualification | Only exact canonical attempts, qualified evidence and canonical ErrorRecord history enter canonical weakness/readiness; advisory/coaching remains separate |
| Versioning | Taxonomy, blueprint, scorer, calibration and readiness model versions bind every result; updates never rewrite history |
| Coverage | Result discloses skills/types/sections attempted, missing inventory and representativeness limits |
| Recency/denominator | Show observation window, sample count and missing/sparse/conflicting evidence |
| Uncertainty | Return estimate/range/confidence and reasons; insufficient data is `UNKNOWN`, not weak/ready |
| Reproducibility | Same frozen inputs/version yield the same deterministic profile/selection/score; AI may explain but not decide |
| Timing | Trusted elapsed-time and pause/resume/accommodation rules survive reload/clock changes |
| Durability | Blueprint, attempts, artifacts, receipts and result survive backup→restore→reopen without redispatch or recomputation drift |
| Acceptance | Independent exact-commit evidence exists for every claimed stage/profile; green implementer tests are handoff only |

## Readiness non-claim

Until the missing owners, representative inventory, delayed-outcome calibration
and independent gates exist, VocabMaster may explain current practice evidence
but must report readiness as unavailable. A later readiness value is an uncertain
estimate, never a guaranteed IELTS band or promise of test-day performance.
