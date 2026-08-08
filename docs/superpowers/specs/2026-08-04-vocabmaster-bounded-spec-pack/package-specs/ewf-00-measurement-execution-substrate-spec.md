# EWF-00 — Measurement and Exact-Command Execution Substrate

## Metadata

| Field | Value |
|---|---|
| Spec ID | `EWF00-MEASURE-EXEC-001` |
| Spec type | `verification-infrastructure` |
| Local spec status | `DRAFT / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Canonical package | `EWF-00` |
| Canonical package status | `IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED` |
| Implementation authorization | `NOT_GRANTED` |
| Parent requirement | `EWF00-PMA-12` |
| Measured need | PR #37 Governor STOP comment `5225048322`: exact focused executable evidence was absent after a valid Commit-A RED and Commit-B GREEN |
| Canonical measurement contract | `EWF00-PILOTS-001` controlled-subject-pair measurement contract |
| Acceptance owner | Independent canonical auditor at the exact implementation subject |
| Requirement namespace | `EWF00-ME-*` |

This subordinate specification exists because the measured need required by
`EWF00-PMA-12` is now concrete. PR #37 validly stopped after broad natural PR CI
could not substitute for the eight exact focused declarations and after no valid
pre-Commit-A measurement baseline existed. This specification supplies a bounded,
mechanically executable measurement/verification substrate. It does not execute
Pilot B, implement LI-00, change product behavior, mutate package status, or issue
an acceptance verdict.

## 1. Goal and acceptance boundary

Provide one read-only GitHub-executable substrate that can:

1. accept an exact product subject SHA;
2. bind an exact accepted measurement-tooling revision independently of the
   product subject;
3. execute an exact ordered command manifest without replacing it with broader
   or inferred coverage;
4. capture process output, result state and timing mechanically;
5. produce immutable raw evidence suitable for a controlled baseline/assisted
   pair;
6. preserve the existing EWF five-state command-result vocabulary; and
7. remain subordinate `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

The substrate is verification/measurement infrastructure only. It cannot
accept a product package or EWF pilot, change canonical status, mark a product
PR Ready, merge, deploy, publish, install a new project dependency, or create a
second runtime/store/status authority.

## 2. Cross-revision identity model

Measurement tooling identity and product subject identity are separate.
A valid request freezes:

```text
measurementToolingRevision = one exact accepted EWF tooling SHA
productSubject             = one exact 40-hex product SHA
```

The same `measurementToolingRevision` MUST be used for the baseline and assisted
members of one measurement pair. The `productSubject` MAY differ and normally
will differ:

```text
baseline: measurementToolingRevision=T, productSubject=P0
assisted: measurementToolingRevision=T, productSubject=P1
```

The baseline subject may predate the measurement tooling. The tooling therefore
MUST NOT be required to exist inside either product subject. It MUST NOT be
cherry-picked into the LI product chain or otherwise contaminate the product
predecessor merely to make measurement possible.

The execution topology is two independent checkouts:

```text
$RUNNER_TEMP/ewf-tooling   -> exact measurementToolingRevision
$RUNNER_TEMP/product       -> exact productSubject
```

The process executor is loaded only from `$RUNNER_TEMP/ewf-tooling`. Commands
execute with the declared product `cwd` rooted at `$RUNNER_TEMP/product`.
Ephemeral dependency materialization and temporary test output are permitted
only as execution mechanics. The workflow MUST prove before and after execution
that the product checkout still resolves to the exact requested SHA and that no
tracked product file changed. It MUST NOT commit, push, create tags, update refs,
edit remote product state, or persist a product-state mutation.

## 3. GitHub-executable trigger and future implementation surface

### 3.1 Selected trigger

The selected mechanism is a natural GitHub `pull_request` event, not
`workflow_dispatch`.

This choice is mechanical rather than theoretical: the available GitHub
connector can create an exact branch, create one request file and open a Draft
PR, which naturally produces a `pull_request` event. The currently available
connector does not expose a workflow-dispatch operation. A future executor must
therefore not depend on dispatch, rerun, Ready-state toggles, reopen tricks,
empty commits, or mutable branch-name-only inputs.

### 3.2 Frozen workflow path

A separately authorized and independently accepted implementation of this spec
MUST create exactly this dedicated workflow path:

```text
.github/workflows/ewf-measurement.yml
```

The workflow trigger MUST be bounded to:

```yaml
pull_request:
  branches: [main]
  types: [opened]
  paths:
    - docs/superpowers/measurement-requests/**
```

The workflow MUST be read-only with respect to repository/product state. Its
permissions MUST be no broader than:

```yaml
permissions:
  contents: read
```

Normal GitHub Actions logs and artifact creation are allowed evidence side
effects. Pull-request comments, issue writes, status-ledger writes, deployments,
package publishing, release creation and external paid-provider calls are not
part of this substrate.

### 3.3 Request carrier

Each run is triggered by exactly one newly opened Draft PR whose entire diff is
exactly one immutable request file:

```text
docs/superpowers/measurement-requests/<attemptId>-<measurementPhase>.json
```

`measurementPhase` is exactly `baseline` or `assisted`. The request branch MUST
start at the exact accepted `measurementToolingRevision`; its one substantive
request commit adds only that request path. The dedicated workflow MUST fail
closed when the PR contains another changed path, when the request path is
modified after opening, or when the request is not bound to exact immutable
SHAs.

A request contains at least:

```text
schemaVersion
attemptId
measurementPairId
measurementPhase
productSubject
measurementToolingRevision
measurementSchemaRevision
measurementMethodRevision
commandManifest
commandManifestDigest
cwdPolicy
explicitEnvironment
environmentInheritancePolicy
timeoutPolicy
operationDefinitionRevision
rawEvidenceFormatRevision
```

`productSubject` and `measurementToolingRevision` MUST each be an exact 40-hex
SHA. A branch, tag, PR number, `main`, `HEAD`, merge ref or other mutable name is
not an acceptable substitute.

### 3.4 Frozen implementation allowlist

A future implementation candidate for this subordinate spec is bounded to:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
tests/ewf-measurement-executor.test.mjs
```

No `package.json`, lockfile, product `src/**`, product tests, canonical status
file or dependency change is authorized by this specification. If a correct
implementation cannot be achieved inside this boundary using the repository's
existing Node runtime and Actions primitives, it must stop for a new separately
audited specification revision rather than silently expanding the allowlist.

## 4. Workflow and tooling-revision binding

A natural PR event proves only that GitHub executed a workflow; it does not by
itself prove that the accepted tooling revision ran. The dedicated workflow MUST
therefore perform all of these checks before product commands:

1. parse and schema-validate the one request;
2. check out the exact `measurementToolingRevision` into the tooling checkout;
3. load the executor only from that checkout;
4. compare the executing workflow file content with
   `.github/workflows/ewf-measurement.yml` at the requested tooling revision;
5. reject any workflow-content mismatch;
6. verify the request branch parent and request-file-only delta required by this
   spec; and
7. check out the exact `productSubject` separately.

Unrelated movement of `main` does not invalidate an accepted tooling revision
when the dedicated workflow content remains byte-identical and all other
request bindings still hold. A workflow-content change is a new tooling
revision and cannot be paired with an older baseline.

## 5. Exact command-manifest contract

The request freezes one ordered array of command declarations. Each declaration
contains at least:

```text
commandId
ordinal
command
cwd
required
requirements
timeoutMs
explicitEnvironment
```

The manifest digest is SHA-256 over the canonicalized complete ordered
manifest. Baseline and assisted requests for one pair MUST carry the identical
manifest and identical digest. Ordering is semantic. Splitting, joining,
reordering, replacing, glob-expanding or substituting a broader command is a
manifest change and invalidates comparability.

The executor MUST invoke the exact declared command string through one frozen
shell policy. It may not discover tests, infer equivalents, retry, remediate,
skip a required declaration, or replace a declaration with a broader `npm test`.

## 6. Immediate LI Pilot B acceptance fixture

The substrate is generic, but its first acceptance fixture is the exact LI
Pilot B focused profile below, in this exact order:

```text
1. node --test tests/li-00-execution-safety.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs
2. node --check src/learning-contracts.js
3. node --check src/today-runner.js
4. node --check tests/li-00-execution-safety.test.mjs
5. npm run test:p1-contracts
6. npm run test:p1-runner
7. npm run test:backup
8. npm run test:restore
```

A baseline subject may legitimately fail a command whose behavior or test file
is introduced by the authorized controlled product delta. `FAIL` on a product
subject is still an executed observation. It does not permit changing the
command declaration. `ERROR` remains infrastructure/timeout/invalid-environment
failure and cannot be relabeled `FAIL` merely to preserve a pair.

## 7. Process execution and five-state command results

For every declared command, the executor MUST capture:

```text
commandId
ordinal
command
cwd
start
end
durationMs
exitCode
stdoutRef
stderrRef
stdoutDigest
stderrDigest
timeoutMs
environmentFingerprint
commandManifestDigest
productSubject
measurementToolingRevision
result
errorClass
```

Timing uses a monotonic clock (`process.hrtime.bigint()` or a semantically
identical Node monotonic source) for `durationMs`. `start` and `end` are UTC
RFC-3339 timestamps for correlation and are not used to compute elapsed time.

The only command results are:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

Their semantics are:

- `PASS`: process executed and exited successfully;
- `FAIL`: process executed and returned a product/test failure exit status;
- `ERROR`: timeout, crash, invalid execution environment, harness failure or
  another infrastructure condition prevented a trustworthy product result;
- `NOT_RUN`: declaration exists but execution did not occur;
- `NOT_AVAILABLE`: a required executable/tool is absent.

A required `NOT_RUN`, `NOT_AVAILABLE` or `ERROR` blocks a valid measurement
pair. No automatic retry or green coercion is permitted.

## 8. Frozen measurement context

The substrate MUST record enough information to enforce the canonical
`MEASUREMENT_CONTEXT` invariants between baseline and assisted observations.
At minimum `environment.json` binds:

```text
measurementToolingRevision
measurementSchemaRevision
measurementMethodRevision
rawEvidenceFormatRevision
commandManifestDigest
workflowContentDigest
executorContentDigest
runnerOS
runnerArch
runnerImageOS
runnerImageVersion
nodeVersion
npmVersion
relevantToolVersions
cwdPolicy
environmentInheritancePolicy
explicitEnvironment
timeoutPolicy
clockMethod
operationDefinitionRevision
metricCalculationRevision
```

The dedicated workflow MUST pin a stable runner family, initially
`ubuntu-24.04`, and an exact Node major/minor/patch version selected by the
accepted substrate implementation/authorization. `ubuntu-latest` is not a
measurement-context identity.

The environment fingerprint is the SHA-256 digest of the canonicalized fields
above after redaction of secrets and machine-unique private paths. Baseline and
assisted fingerprints MUST be identical. If the GitHub runner image revision or
any other frozen context field changes, the assisted observation is
`COMPARABILITY_INVALID`; the pilot cannot reuse the old baseline and must begin
a new attempt with a new pre-Commit-A baseline.

## 9. Raw evidence carrier

The canonical raw carrier is one immutable GitHub Actions artifact for each
measurement phase. Its name is:

```text
ewf-measurement-<attemptId>-<measurementPhase>-<productSubject[0:12]>
```

The implementation MUST use a fixed retention of 90 days unless repository
policy later imposes a shorter mandatory maximum. Each artifact contains at
least:

```text
environment.json
command-results.json
measurement-observations.json
operation-journal.json
artifact-manifest.json
commands/<ordinal>-<commandId>.stdout.txt
commands/<ordinal>-<commandId>.stderr.txt
```

`artifact-manifest.json` records SHA-256 for every other artifact member and a
canonical aggregate `datasetDigest`. `baselineDatasetDigest` and
`assistedDatasetDigest` are those aggregate dataset digests.

A later committed EWF evidence carrier does not need to duplicate the complete
raw logs. It MUST bind, at minimum:

```text
workflowRunId
workflowRunAttempt
jobId
artifactId
artifactName
productSubject
measurementToolingRevision
commandManifestDigest
environmentFingerprint
datasetDigest
```

When GitHub exposes an artifact digest, that digest is also bound. When GitHub
does not expose a server-side content digest, the artifact's internal
`artifact-manifest.json` aggregate digest is mandatory. A missing or expired raw
artifact makes the referenced dataset unavailable for a new audit; committed
narrative cannot reconstruct it.

## 10. Operation journal and reproducible manual counting

Operation definitions are frozen before baseline execution under one
`operationDefinitionRevision`. The minimum definitions are:

- `manualOperation`: one operator-initiated command, connector/API mutation, or
  explicit governance decision transition required by the frozen runbook;
  automated workflow steps are excluded.
- `preflightOperation`: a `manualOperation` whose sole purpose is predecessor,
  writer, allowlist, dependency or collision verification before the first
  product write.
- `artifactPreparationOperation`: a `manualOperation` that creates or updates a
  declared EWF declaration/report/brief/evidence binding.
- `validatorReviewOperation`: a `manualOperation` that invokes a declared EWF
  validator or explicitly reviews one labeled validator diagnostic set.
- `reworkRound`: one new subject/evidence identity formed after a blocking
  finding or invalidation requires remediation; repeated reading of the same
  finding is not another round.
- `cliAbsentFrictionOperation`: an otherwise unnecessary `manualOperation`
  performed solely because the optional Spec Kit CLI is `NOT_AVAILABLE`.

`operation-journal.json` is recorded contemporaneously, not reconstructed from
implementer memory. Every row contains at least timestamp, actor role, operation
category, frozen operation-definition revision, action and immutable evidence
reference when available. Repository commits, PRs, comments, workflow
runs/jobs/artifacts and exact connector mutations are preferred evidence. If an
operation cannot be evidenced under the frozen method, the corresponding metric
is `UNKNOWN`; it is not guessed.

## 11. Measurement observations and zero semantics

The process executor writes the observation schema required by
`EWF00-PILOTS-001`. Metric result states are distinct from command results:

```text
OBSERVED
OBSERVED_ZERO
NOT_RUN
NOT_AVAILABLE
NOT_APPLICABLE
UNKNOWN
```

Every observation contains these keys:

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

`value` is numeric for `OBSERVED` and exactly numeric zero for
`OBSERVED_ZERO`. For `NOT_RUN`, `NOT_AVAILABLE`, `NOT_APPLICABLE` and `UNKNOWN`,
`value` is `null`; the key remains present.

Zero is never a synonym for missing, unavailable, unrun, unknown or
inapplicable. `OBSERVED_ZERO` is valid only when the frozen measurement method
explicitly observes the relevant window/count and the raw evidence proves that
the measured operation was genuinely absent.

## 12. Baseline-before-Commit-A temporal gate

The baseline product subject is always pre-implementation. For a test-first
Pilot B chain, the baseline must be complete before Commit A exists.

A baseline is frozen only after all of the following exist:

1. a successful natural measurement workflow run bound to the exact
   `baselineSubject` and accepted tooling revision;
2. its raw artifact and dataset digest;
3. its measurement request commit and PR identity; and
4. its immutable baseline observation record.

The future product executor MUST read those identities back and prove them before
creating Commit A. The exact Commit-A parent MUST equal the frozen
`baselineSubject` unless a later product authorization explicitly freezes an
equivalent lineage anchor without changing the product bytes; ambiguity blocks.
The Commit-A creation time MUST be later than the completed baseline evidence
identity.

No retrospective reconstruction, backfilled timestamp, PR #35 timing estimate,
synthetic historical baseline or post-A baseline is valid.

## 13. Controlled subject-pair binding and comparability

For one measurement pair the substrate records:

```text
measurementPairId
attemptId
baselineSubject
assistedSubject
baselineParent
measurementToolingRevision
measurementSchemaRevision
measurementMethodRevision
commandManifestDigest
environmentFingerprint
baselineDatasetDigest
assistedDatasetDigest
authorizedDelta
allowedChangedPaths
comparabilityResult
comparabilityDiagnostics
```

`authorizedDelta` binds the exact product commit lineage between baseline and
assisted subjects, including the separately authorized A/B topology where
applicable. `allowedChangedPaths` is exact. The substrate computes the changed
path set between `baselineSubject` and `assistedSubject` and fails comparability
if any path falls outside that frozen set.

`baselineSubject != assistedSubject` is expected and is not itself a failure.
Comparability requires:

```text
same measurement context
+ same exact ordered command declarations
+ same measurement method
+ exact frozen authorized product delta
+ no unrelated product drift
```

`comparabilityResult` is `COMPARABLE` only if all of those predicates hold. It
is `COMPARABILITY_INVALID` if tooling revision, workflow/executor content,
command manifest, measurement method, environment fingerprint, schema/raw
format, timeout/clock policy, operation definitions or metric calculation
changed; if an unapproved product path changed; if baseline occurred after
Commit A; or if baseline raw evidence is missing.

## 14. Failure semantics

The substrate fails closed on at least:

- mutable or malformed subject identity;
- request PR with more than one changed path;
- request branch/request file identity mismatch;
- workflow content not matching the requested accepted tooling revision;
- product checkout SHA mismatch;
- tracked product-file mutation after execution;
- command-manifest digest/order mismatch;
- required command `ERROR`, `NOT_RUN` or `NOT_AVAILABLE`;
- output/evidence write failure;
- raw artifact missing required files or digest mismatch;
- baseline temporal violation;
- environment/context mismatch between pair members;
- unapproved product delta;
- any attempt to infer acceptance from execution results.

The substrate does not automatically retry a failed command or rerun a workflow.
A new measurement attempt requires a new attempt identity and, for Pilot B, a
new valid pre-Commit-A baseline before any new product Commit A.

## 15. Requirements

| ID | Normative requirement |
|---|---|
| `EWF00-ME-01` | Every run binds one exact product SHA and one separately exact accepted measurement-tooling SHA; mutable refs are rejected. |
| `EWF00-ME-02` | The process executor runs only from the exact tooling checkout and executes the exact ordered command manifest in the separate product checkout. |
| `EWF00-ME-03` | The dedicated natural `pull_request` trigger is executable through available repository/GitHub capabilities and never depends on workflow dispatch or rerun. |
| `EWF00-ME-04` | Workflow permissions are read-only for repository/product state; only normal logs/artifacts may be created as evidence. |
| `EWF00-ME-05` | Every command preserves stdout/stderr, exit code, timeout/error state, UTC start/end, monotonic duration, environment fingerprint, manifest digest, subject SHA and tooling revision. |
| `EWF00-ME-06` | Command results use exactly `PASS`, `FAIL`, `ERROR`, `NOT_RUN`, `NOT_AVAILABLE` without coercion or automatic retry. |
| `EWF00-ME-07` | The LI acceptance fixture executes the eight frozen focused declarations exactly and in order; broader coverage is not a substitute. |
| `EWF00-ME-08` | Raw evidence contains the required four semantic files plus an artifact manifest and per-command stdout/stderr, with deterministic digests. |
| `EWF00-ME-09` | The same accepted tooling revision can measure a pre-tooling baseline product SHA and later assisted product SHA without cherry-picking tooling into the product chain. |
| `EWF00-ME-10` | The baseline dataset and immutable digest exist before product Commit A is permitted; retrospective or synthetic baselines are rejected. |
| `EWF00-ME-11` | Manual-operation definitions are frozen before execution and counts are derived from a contemporaneous operation journal rather than memory. |
| `EWF00-ME-12` | Metric observations distinguish observed zero from not-run, unavailable, inapplicable and unknown states and never synthesize zero for missing evidence. |
| `EWF00-ME-13` | A controlled pair is comparable only under identical measurement context/method/manifest plus exact authorized product delta and no unrelated drift. |
| `EWF00-ME-14` | Committed evidence binds the workflow run/job/artifact, exact product/tooling identities and deterministic dataset digest; raw evidence remains inspectable. |
| `EWF00-ME-15` | The substrate never emits product, Pilot B or EWF acceptance, status mutation, Ready/merge/deploy authority or a second package owner. |

## 16. Required implementation verification

A future substrate implementation cannot be accepted on source inspection alone.
Its exact implementation subject must demonstrate:

- request schema and mutable-ref rejection;
- wrong tooling revision/workflow-content rejection;
- separate tooling/product checkout identities;
- product tracked-state immutability before/after commands;
- exact command order and no broader substitution;
- PASS, FAIL, ERROR, NOT_RUN and NOT_AVAILABLE fixtures;
- timeout and missing-binary behavior;
- stdout/stderr and digest integrity;
- baseline-before-A temporal predicate using immutable synthetic commit
  topologies;
- environment fingerprint mismatch invalidating a pair;
- unauthorized changed path invalidating a pair;
- observed-zero versus unavailable/missing fixtures;
- operation-journal count reproducibility;
- raw artifact manifest/dataset-digest verification;
- the exact eight-command LI fixture; and
- one natural Draft-PR exact-head GitHub Actions demonstration after the
  implementation is separately authorized.

That demonstration is substrate acceptance evidence only. It is not Pilot B
execution and must use disposable/synthetic product subjects until a new Pilot B
authorization separately binds a real product attempt.

## 17. Historical provenance

PR #35 is a historical rejected Pilot B execution. Its timing estimates,
qualitative CLI-friction value and fabricated validator zero are not upgraded by
this specification.

PR #37 is a historical validly stopped partial execution. Commit A
`27a443b7668cb4847cf116cd18914170f517ff3d` and Commit B
`1e74af7e901b4d0e7daf36806d486c9fd971bb78` remain immutable design evidence for
the measured need. They are not retroactively accepted and cannot supply the
missing pre-A baseline or exact focused artifact.

## 18. Acceptance, activation and rollback

This subordinate spec is not active merely because it exists in a Draft docs PR.
The canonical root-repair candidate must first receive independent exact-head
review. The auditor must report the separate dimension:

```text
PMA12_EXECUTION_SUBSTRATE_SPEC: ACCEPT | REJECT | BLOCKED
```

Only `ACCEPT`, followed by integration of the canonical repair, permits a
separately authorized implementation candidate for the frozen three-path
substrate boundary. The implementation itself then requires its own independent
exact-subject acceptance before a future Pilot B may rely on it.

Rollback of a future substrate implementation removes only the dedicated
workflow, executor and tests. It must leave canonical governance, product source,
manual repository commands and historical evidence unchanged.
