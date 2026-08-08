# EWF-00 — Pilots, Measurement and Independent Audit

## Metadata

| Field | Value |
|---|---|
| Spec ID | `EWF00-PILOTS-001` |
| Spec type | `feature` |
| Local spec status | `DRAFT` |
| Canonical package | `EWF-00` |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Implementation authorization | `NOT_GRANTED` |
| Architecture baseline | `docs/superpowers/specs/2026-08-04-engineering-workflow-foundation-design.md` at `adc3726620f4badddb16309e375f8f17b6af1404` |
| Canonical boundary | `docs/ROADMAP.md` EWF-00; `docs/IMPLEMENTATION_PLAN.md` EWF-00; ADR-044 |
| Dependencies | Implemented, locally verified `EWF00-ARTIFACTS-001` and `EWF00-PREFLIGHT-001`; pilots separately authorized |
| Acceptance owner | Independent canonical auditor at the exact EWF-00 implementation/pilot evidence identity |
| Requirement namespace | `EWF00-PMA-*` |
| Measurement contract revision | `CONTROLLED_SUBJECT_PAIR_V1` |
| PMA-12 subordinate spec | `EWF00-MEASURE-EXEC-001` |

## Goal and acceptance boundary

Prove the Minimum Viable Foundation on two separately approved, bounded pilots,
measure its real overhead, and submit a frozen exact-commit evidence package to
an independent auditor. Pilot success is evidence about EWF-00 workflow
fitness—not acceptance of the repaired/product package and not authorization to
expand tooling.

This spec owns pilot selection constraints, measurement protocol, failure
classification and package-level independent-audit evidence. It does not own
the product boundary exercised by either pilot.

## Entry conditions

No pilot may start until:

1. EWF artifact and validation specs have separate implementation authorization,
   exact predecessors and local verification evidence;
2. the candidate pilot has a canonical owner, exact boundary and separate user
   authorization;
3. one clean worktree and writer are declared for that pilot;
4. its baseline manual workflow has been measured and immutably frozen before
   the first product implementation commit under the controlled-subject-pair
   contract below;
5. the pilot cannot affect data loss, security, privacy, rights or external cost
   without a separately approved boundary;
6. the EWF auditor is independent of the EWF implementation context; and
7. any required exact-command measurement/verification substrate has separately
   received independent acceptance and is available before baseline capture.

This current document authorizes none of those implementation actions.

## Pilot A — eligible small repair

The selected repair must satisfy every lightweight predicate in
`EWF00-ARTIFACTS-001`: deterministic reproduction, existing acceptance boundary,
no contract/schema/durable-data/security/privacy/rights/cost/dependency or
concurrency/crash-recovery change, no product expansion, and a focused
regression test.

The pilot proves:

- change-set declaration and fail-closed preflight;
- lightweight repair record and reduced trace;
- TDD/reproduction → regression path;
- focused and PR profiles with exact evidence;
- exact subject report, frozen brief and independent read-only audit.

If any eligibility predicate becomes false, Pilot A stops and is reclassified
as spec-level work; that is correct fail-closed behavior, not a failed repair.

## Pilot B — bounded spec-level change

The selected spec-level pilot must have one existing canonical package owner,
a reviewed non-overlapping spec and meaningful end-to-end evidence. A narrow
LI-00 execution-safety slice is the preferred architecture probe only after its
own authorization and dependency gates; this preference does not authorize it.

The pilot proves:

- structured spec/plan/tasks and namespaced trace;
- exact writer/allowlist/dependency gates;
- required focused and PR profiles;
- implementation verification report and complete trace digest;
- frozen brief and separate auditor context;
- invalidation when subject/spec/evidence changes.

Pilot B stops if it needs a second runtime/store/status authority, overlaps a
different writer, expands to complete IELTS inventory, or requires an
uncanonicalized package owner.

## Measurement protocol — `CONTROLLED_SUBJECT_PAIR_V1`

### 1. Normative replacement for the legacy repository-state phrase

The legacy phrase `same repository state` is superseded for EWF pilot
measurement by this exact model:

```text
same MEASUREMENT_CONTEXT
+
controlled PRODUCT_SUBJECT pair
```

It MUST NOT be interpreted as byte-identical product Git state, the same branch,
the same repository name, or permission to compare arbitrary SHAs. Baseline and
assisted product subjects normally differ because the baseline must predate
product Commit A while assisted measurement must bind the exact implemented
product subject.

Normative rule:

```text
baselineSubject != assistedSubject
```

is NOT itself a comparability failure.

A pair is comparable only when:

```text
same measurement context
+ same exact command declarations
+ same measurement method
+ exactly frozen product-state delta
+ no unrelated drift
```

### 2. Measurement context invariants

The following MUST remain invariant between baseline and assisted runs of one
measurement pair:

```text
measurement tooling revision
measurement schema revision
measurement method revision
command manifest/declaration digest and order
OS / runner family and frozen environment fingerprint
Node version
npm and relevant tool versions
cwd semantics
environment inheritance policy
explicit environment
timeout policy
clock/timing method
operation-count definitions
raw-evidence format
metric calculation method
```

The canonical environment fingerprint is a deterministic digest of those
normalized fields after required secret/private-path redaction. A mismatch in
any frozen context field invalidates the pair. A later run may not normalize a
mismatch away merely because both subjects are in the same repository.

### 3. Product subject pair

Every pair freezes at least:

```text
baselineSubject
assistedSubject
baselineParent
lineageAnchor
authorizedProductDelta
allowedChangedPaths
```

`baselineSubject` is the exact pre-implementation product subject. For a
test-first pilot it is the exact parent from which Commit A is later created.
`assistedSubject` is the exact product implementation subject being evaluated,
normally Commit B before evidence-only Commit C. `authorizedProductDelta` binds
the exact approved lineage between them, including Commit A/Commit B identities
when applicable. `allowedChangedPaths` is exact.

Comparability is invalid if any changed path lies outside the frozen product
delta, if an unrelated commit enters the pair, or if the assisted subject cannot
be proven to descend through the authorized product topology. The measurement
tooling revision is not part of the product delta and MUST remain separately
bound.

### 4. Baseline temporal rule — hard gate

```text
BASELINE MUST BE FROZEN BEFORE PRODUCT COMMIT A
```

A baseline becomes frozen only when its exact measurement request/run identity,
raw evidence carrier and immutable dataset digest exist and are read back. Only
then may the product executor create Commit A. Commit A's exact parent MUST be
the frozen `baselineSubject` unless a separately accepted authorization froze an
equivalent byte-identical lineage anchor explicitly.

No retrospective reconstruction, reuse of PR #35 timing estimates, backfilled
timestamps, synthetic historical baseline, post-A baseline or narrative claim
can satisfy this gate. If Commit A exists before a valid baseline dataset
identity, that attempt cannot become a valid comparable Pilot measurement and
must stop.

### 5. Observation schema and metric result states

Every baseline and assisted observation contains all of these keys:

```text
metricId
value
unit
start
end
method
exclusions
rawEvidenceRef
resultState
```

Metric result states are:

```text
OBSERVED
OBSERVED_ZERO
NOT_RUN
NOT_AVAILABLE
NOT_APPLICABLE
UNKNOWN
```

`value` is numeric for `OBSERVED` and exactly numeric `0` for `OBSERVED_ZERO`.
For `NOT_RUN`, `NOT_AVAILABLE`, `NOT_APPLICABLE` and `UNKNOWN`, the `value` key
is present with `null`. Qualitative values such as `high`, `low`, `some
friction` or `about 15 minutes` are invalid.

`0` is allowed only when the operation was genuinely absent under the frozen
measurement method and raw evidence proves that absence. A validator genuinely
not part of a baseline workflow may be `OBSERVED_ZERO` only when the baseline
method explicitly observes that case and the raw evidence records zero runtime
or zero operations. An unavailable validator is `NOT_AVAILABLE`, an unexecuted
measurement is `NOT_RUN`, an inapplicable measurement is `NOT_APPLICABLE`, and
missing or unresolvable evidence is `UNKNOWN`. None may be converted to zero.

### 6. Numeric semantics for all eight metric families

| Metric ID | Unit | Numeric calculation |
|---|---|---|
| `focusedDuration` | integer milliseconds | Sum of monotonic runtimes for the exact declared focused-profile commands, excluding checkout/setup, GitHub queue and runner startup. |
| `prDuration` | integer milliseconds | Sum of monotonic runtimes for the exact declared PR-profile commands, excluding GitHub queue and runner startup. |
| `preflightOverhead` | integer milliseconds | Sum of non-overlapping journaled `preflightOperation` elapsed intervals before the first authorized product write. |
| `artifactPreparation` | integer milliseconds | Sum of non-overlapping journaled `artifactPreparationOperation` elapsed intervals for declared EWF metadata/report/trace/brief/evidence binding. |
| `validatorOverhead` | integer milliseconds | Declared EWF validator process runtime plus non-overlapping journaled `validatorReviewOperation` diagnostic-review intervals. |
| `manualOperations` | integer operation count | Count of journal rows classified `manualOperation` under the frozen operation-definition revision. |
| `reworkFindingLoop` | integer round count | Count of `reworkRound` identities caused by blocking finding/invalidation and requiring a new subject/evidence identity. |
| `cliAbsentFriction` | integer operation count | Count of `cliAbsentFrictionOperation` rows that exist solely because optional Spec Kit CLI is unavailable. |

`focusedDuration` and `prDuration` are command-runtime measurements, not total
calendar time from branch creation to completion. `start`/`end` on count metrics
bind the complete observation window. Duration metrics use a monotonic clock for
calculation; UTC wall timestamps are correlation evidence only.

The design sets no arbitrary pass threshold. The independent review compares
observed measurements to baseline and recommends `KEEP`, `SIMPLIFY`, `OPTIMIZE`
or `DO_NOT_EXPAND`, with evidence. A slower result is not hidden by lowering a
budget after execution.

### 7. Manual-operation semantics

Before baseline begins, one immutable `operationDefinitionRevision` freezes
these definitions:

- `manualOperation`: one operator-initiated command, connector/API mutation or
  explicit governance decision transition required by the frozen runbook;
  automated CI/workflow steps do not count.
- `preflightOperation`: a `manualOperation` solely for predecessor, writer,
  allowlist, dependency or collision verification before the first product
  write.
- `artifactPreparationOperation`: a `manualOperation` creating/updating a
  declared EWF declaration, report, trace, brief or evidence binding.
- `validatorReviewOperation`: a `manualOperation` invoking a declared EWF
  validator or reviewing one labeled validator diagnostic set.
- `reworkRound`: formation of a new subject/evidence identity after a blocking
  finding or invalidation requires remediation; rereading the same finding is
  not another round.
- `cliAbsentFrictionOperation`: an extra `manualOperation` required only because
  optional Spec Kit CLI is `NOT_AVAILABLE`.

The method must be reproducible. Counts come from a contemporaneous immutable
`operation-journal.json`, never implementer memory after execution. Every row
binds timestamp, actor role, category, definition revision, action and immutable
repository/CI evidence reference where available. Commit, PR, comment, workflow
run/job/artifact and exact connector mutations are preferred. An unevidenced
count is `UNKNOWN` rather than an estimate.

### 8. Exact-command execution substrate

Broad CI success cannot substitute for exact command evidence. Required
measurement and focused verification MUST use a separately accepted
`EWF00-MEASURE-EXEC-001` substrate that executes an exact ordered command
manifest against an exact product SHA while loading fixed tooling from a
separately exact accepted tooling SHA.

The substrate's canonical command-result vocabulary remains:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

The immediate LI Pilot B focused acceptance fixture is, in exact order:

```text
node --test tests/li-00-execution-safety.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs
node --check src/learning-contracts.js
node --check src/today-runner.js
node --check tests/li-00-execution-safety.test.mjs
npm run test:p1-contracts
npm run test:p1-runner
npm run test:backup
npm run test:restore
```

The substrate supports independently frozen manifests for future work; the LI
profile above is an acceptance fixture, not a permanent hard-coded package list.
No equivalent broader test, inferred coverage or broad `npm test` result can
replace a missing exact declaration.

### 9. Cross-revision tooling model

The measurement tooling revision and product subject are independent identities:

```text
measurementToolingRevision = fixed accepted EWF tooling SHA
productSubject              = arbitrary exact authorized product SHA
```

The same fixed tooling may measure a `baselineSubject` that predates the tooling
and a later `assistedSubject`. The tooling runs from a separate checkout against
a separate exact product checkout. The product chain does not receive a tooling
cherry-pick, workflow commit or other contamination merely to obtain measurement
infrastructure.

The selected GitHub mechanism is the natural Draft-PR request protocol defined
by `EWF00-MEASURE-EXEC-001`. Its implementation path is
`.github/workflows/ewf-measurement.yml`; the request binds exact subject SHA,
accepted tooling SHA, attempt ID, command-manifest digest and phase
`baseline|assisted`. Mutable branch-only subjects are rejected. The design does
not depend on connector workflow-dispatch capability.

### 10. Raw evidence carrier

Canonical raw evidence for each phase is an immutable GitHub Actions artifact
produced by the accepted measurement substrate. At minimum it contains:

```text
environment.json
command-results.json
measurement-observations.json
operation-journal.json
```

The substrate additionally binds an artifact manifest/dataset digest and
per-command stdout/stderr. The raw carrier is not replaced by an implementer
summary.

A later committed evidence set binds at least:

```text
workflow run ID / attempt
job ID
artifact ID / name
baseline or assisted product subject SHA
measurement tooling SHA
command manifest digest
environment fingerprint
dataset digest
artifact digest where GitHub exposes one
```

If the raw artifact is missing/expired or its digest cannot be verified, the
dataset is unavailable for a new audit; Commit C cannot invent its contents.

### 11. Measurement pair schema and invalidation

Every pair binds at least:

```text
measurementPairId
attemptId
baselineSubject
assistedSubject
baselineParent
lineageAnchor
measurementToolingRevision
measurementSchemaRevision
commandManifestDigest
environmentFingerprint
measurementMethodRevision
baselineDatasetDigest
assistedDatasetDigest
authorizedDelta
allowedChangedPaths
comparabilityResult
comparabilityDiagnostics
```

The assisted dataset cannot be valid when any of the following is true:

```text
tooling revision changed
command manifest/declarations changed
measurement method/schema/raw format changed
environment fingerprint changed or is incompatible under the frozen exact rule
timeout/clock/operation definitions changed
unapproved product path or commit entered the delta
baseline was created after Commit A
baseline raw evidence or immutable digest is missing
assisted subject is not the exact authorized implementation subject
```

`comparabilityResult` is exactly `COMPARABLE` or `COMPARABILITY_INVALID`. A
failure cannot be hidden by calculating metrics first and declaring the pair
comparable afterward.

## Independent audit protocol

The auditor uses a clean, read-only context at the exact subject commit. It does
not use the implementer worktree or uncommitted state, mutate files, remediate
findings, invent criteria or self-author a new brief.

The auditor receives only the frozen brief, repository subject and bound
evidence artifacts. It may inspect dependencies and surrounding code. It blocks
EWF acceptance only for in-boundary defect/regression, scope-integrity failure,
missing/unreliable required evidence or invalid acceptance assumption.

Out-of-scope findings are recorded separately. A data-loss, security, privacy,
rights or verification-integrity concern may recommend a release-safety hold,
but does not silently expand the EWF remediation boundary.

Allowed EWF implementation-audit results are `ACCEPT`, `REJECT` and
`BLOCKED_BY_INVALID_BRIEF`. Implementer evidence cannot substitute for the
verdict.

## Requirements

| ID | Normative requirement |
|---|---|
| `EWF00-PMA-01` | Exactly one eligible small-repair pilot and one independently bounded spec-level pilot are completed or explicitly stopped by a declared fail-closed rule. |
| `EWF00-PMA-02` | Each pilot has separate product authorization, exact predecessor, one writer/worktree and frozen exclusions. |
| `EWF00-PMA-03` | Preflight fixtures prove wrong HEAD, dirty tree and writer overlap stop before writes. |
| `EWF00-PMA-04` | Trace fixtures prove duplicate ID, broken reference and missing required evidence are detected. |
| `EWF00-PMA-05` | Brief fixtures prove commit/parent, spec revision and trace/evidence digest mismatch invalidate handoff. |
| `EWF00-PMA-06` | Both pilot workflows remain operable when Spec Kit CLI is absent. |
| `EWF00-PMA-07` | Baseline and assisted overhead use one `CONTROLLED_SUBJECT_PAIR_V1`: identical measurement context/method/command declarations, exact frozen product delta and preserved raw evidence. |
| `EWF00-PMA-08` | Pilot evidence cannot change product package status or supply that package’s independent acceptance verdict. |
| `EWF00-PMA-09` | Independent EWF audit uses a separate read-only context and frozen exact-commit identity. |
| `EWF00-PMA-10` | Pilot output creates no second governance/status/acceptance authority and no automatic CI/tool installation. |
| `EWF00-PMA-11` | Findings/remediation rounds remain bounded by a new frozen brief; any subject/evidence change invalidates the prior audit. |
| `EWF00-PMA-12` | Expansion to mutation, broad fuzz, portability or extra automation requires measured need, a new spec and separate approval. PR #37 establishes measured need for the bounded exact-command measurement/verification substrate specified by `EWF00-MEASURE-EXEC-001`; that spec still requires independent acceptance and separate implementation authorization. |
| `EWF00-PMA-13` | The baseline dataset receives an immutable identity/digest before product Commit A exists; retrospective, backfilled or synthetic baseline evidence is invalid. |
| `EWF00-PMA-14` | All eight metric families use the frozen numeric/unit semantics and complete observation schema; qualitative values are invalid. |
| `EWF00-PMA-15` | `OBSERVED_ZERO` is distinct from `NOT_RUN`, `NOT_AVAILABLE`, `NOT_APPLICABLE` and `UNKNOWN`; missing/unavailable evidence is never coerced to zero. |
| `EWF00-PMA-16` | Manual/preflight/artifact/validator/rework/CLI-friction operation definitions are frozen before baseline and derived from a contemporaneous operation journal. |
| `EWF00-PMA-17` | Baseline and assisted subjects may differ only as the exact frozen controlled product pair; any unrelated path/lineage drift invalidates comparability. |
| `EWF00-PMA-18` | Exact focused declarations are executed and bound by an accepted `EWF00-MEASURE-EXEC-001` substrate; broader CI cannot substitute for missing exact-command evidence. |
| `EWF00-PMA-19` | Raw evidence is carried by immutable Actions artifacts and later committed evidence binds exact run/job/artifact, product/tooling identities and deterministic dataset digest. |

## Required negative and recovery evidence

In addition to validator fixtures, the pilots must demonstrate:

- optional tool absent versus required tool absent;
- command failure versus crash/timeout/infrastructure error;
- evidence/report created for a stale subject and rejected;
- subject amended after brief freeze and old handoff invalidated;
- measurement context/tooling/manifest mismatch invalidates a pair;
- an unauthorized changed path invalidates the controlled product delta;
- baseline-after-A and missing-baseline-artifact are rejected;
- observed zero is distinguished from unavailable, unrun and unknown;
- reviewer finding that is out of scope recorded without expanding remediation;
- failed/aborted pilot cleanup that leaves the canonical manual workflow usable.

No fixture may dirty the real source worktree or alter remote refs.

## Historical Pilot B provenance

```text
PR #35 = historical rejected execution
PR #37 = historical validly-stopped partial execution
```

Neither is retroactively accepted by this amendment. PR #35's measurements are
not upgraded. PR #37's valid Commit-A RED and Commit-B GREEN remain historical
partial-execution/design evidence only. The PR #37 Governor STOP at comment
`5225048322` establishes the measured need for the PMA-12 exact-command
substrate and proves that a valid pre-A baseline cannot be backfilled after a
pilot has started.

## Future Pilot B topology after repair

A new Pilot B attempt may be authorized only after both the repaired canonical
measurement contract and the implemented measurement substrate have separately
received the required independent acceptance. The intended topology is:

```text
accepted canonical measurement repair
→ accepted measurement execution substrate
→ pre-A baseline captured and frozen
→ product Commit A
→ natural exact RED
→ product Commit B
→ natural exact GREEN
→ exact focused verification
→ assisted measurement
→ negative/recovery evidence
→ evidence Commit C
→ independent dual audit
```

Commit C is an evidence carrier. It binds raw measurement run/job/artifact
identities and dataset digests; it does not synthesize raw output, modify the
product subject or change package status.

## Root-repair independent audit boundary

The canonical repair candidate that introduces
`CONTROLLED_SUBJECT_PAIR_V1` and `EWF00-MEASURE-EXEC-001` is not self-activating.
Its next independent auditor must report two separate explicit dimensions:

```text
CANONICAL_MEASUREMENT_CONTRACT: ACCEPT | REJECT | BLOCKED
PMA12_EXECUTION_SUBSTRATE_SPEC: ACCEPT | REJECT | BLOCKED
```

Both dimensions MUST be `ACCEPT` before this canonical root repair is integrated
and before a subordinate substrate implementation is authorized. This is one
coherent root-repair review with two rejectable dimensions; it does not combine
implementer and independent auditor roles.

## Exit and package-level acceptance boundary

Exit evidence includes both pilot declarations, exact subjects/parents, complete
reports/briefs/traces, negative-fixture results, baseline and overhead dataset,
rollback/manual-workflow proof, scope-integrity review and independent verdict.

EWF-00 may be accepted only when the canonical auditor confirms the complete
CR-3 boundary across the EWF artifact/preflight contracts, the repaired pilot
measurement contract and any independently accepted PMA-12 subordinate
measurement substrate: artifact contracts, fail-closed preflight/verification/
trace, both pilots, measurements and audit separation. That verdict must then be
recorded by the existing canonical status process. Neither this spec, the pilot
implementer nor an EWF script can update it.
