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
| Measured need | PR #37 Governor STOP comment `5225048322`: no valid pre-Commit-A baseline and no exact focused executable evidence after the valid Commit-A RED / Commit-B GREEN partial attempt |
| Root audit | PR #38 Independent Audit comment `5225337210`: `CANONICAL_MEASUREMENT_CONTRACT: ACCEPT`, `PMA12_EXECUTION_SUBSTRATE_SPEC: REJECT` with six mandatory substrate findings |
| Canonical scope exception | ADR-047 — narrow measured PMA-12 read-only measurement-workflow exception to ADR-046 |
| Canonical measurement contract | `EWF00-PILOTS-001` / `CONTROLLED_SUBJECT_PAIR_V1` |
| Acceptance owner | Independent canonical auditor at the exact implementation subject |
| Requirement namespace | `EWF00-ME-*` |

This subordinate specification exists because the measured need required by
`EWF00-PMA-12` is concrete. PR #37 validly stopped because a pre-Commit-A
baseline could not be backfilled and broad PR CI could not substitute for the
eight exact focused declarations. PR #38 independently accepted the canonical
`CONTROLLED_SUBJECT_PAIR_V1` measurement contract but rejected the first
substrate revision. This revision repairs only the substrate authority and
mechanics identified by that audit.

It does not execute Pilot B, implement LI-00, mutate canonical package status,
issue an acceptance verdict, or weaken the accepted measurement contract.

## 1. Goal, canonical exception and acceptance boundary

Provide exactly one bounded, read-only GitHub-executable measurement substrate
that can:

1. demonstrate a not-yet-accepted substrate candidate on disposable subjects;
2. after independent substrate acceptance, measure an exact authorized Pilot
   product subject with accepted tooling;
3. execute only exact declarations already frozen by an external accepted
   authorization;
4. capture exact command output, result state, timing and sealed manual-operation
   evidence mechanically;
5. produce immutable raw evidence for the existing controlled baseline/assisted
   pair; and
6. preserve the EWF five-state command-result vocabulary and independent
   acceptance boundary.

ADR-047 is the canonical authority for this narrow exception. Only after this
spec receives separate independent acceptance, a separate implementation
authorization is accepted, and the exact implementation receives independent
implementation acceptance may `EWF00-MEASURE-EXEC-001` own exactly:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
tests/ewf-measurement-executor.test.mjs
```

ADR-046 remains controlling everywhere else. This spec does not authorize a
general CI redesign, workflow runtime, DAG engine, daemon, scheduler, retry
engine, automatic remediation, automatic acceptance/status mutation, deployment,
package publishing, broad fuzz/mutation automation or product implementation.

The substrate remains evidence infrastructure only. It cannot accept a product
package, Pilot B or EWF-00; mark a PR Ready; merge; deploy; publish; create a
second runtime/store/status authority; or install a new project dependency.

## 2. Request-purpose model and tooling identity

Every request freezes exactly one purpose:

```text
requestPurpose:
SUBSTRATE_ACCEPTANCE_TEST
|
PILOT_MEASUREMENT
```

The two purposes are disjoint evidence domains. A request or artifact cannot
change purpose after creation.

### 2.1 `SUBSTRATE_ACCEPTANCE_TEST`

This purpose exists only to prove a candidate implementation before that
implementation is accepted. It binds at least:

```text
candidateToolingRevision
substrateImplementationAuthorization
substrateSpecRevision
syntheticOrDisposableProductSubject
acceptanceFixtureManifestDigest
```

`candidateToolingRevision` is the exact 40-hex candidate implementation SHA. It
MUST NOT be required to be accepted already. `substrateImplementationAuthorization`
MUST identify a separately accepted implementation authorization whose exact
subject and verdict freeze the three-path implementation boundary and the
acceptance-fixture declarations. `substrateSpecRevision` binds the independently
accepted spec revision. `syntheticOrDisposableProductSubject` MUST be a
synthetic/disposable exact product SHA; a real Pilot subject is invalid.

The evidence authority is exactly:

```text
SUBSTRATE_IMPLEMENTATION_EVIDENCE / NOT_ACCEPTANCE
```

This purpose MUST NOT use `measurementPhase`, MUST NOT produce
`baselineDatasetDigest` or `assistedDatasetDigest`, MUST NOT produce Pilot B
measurement evidence, and MUST NOT produce package, Pilot or EWF acceptance.
Evidence created under this purpose can never later be relabeled, copied or
reclassified as `baseline` or `assisted` evidence.

### 2.2 `PILOT_MEASUREMENT`

Only this purpose may carry:

```text
measurementPhase:
baseline
|
assisted
```

It binds at least:

```text
acceptedMeasurementToolingRevision
productSubject
measurementPairId
attemptId
measurementPhase
```

`acceptedMeasurementToolingRevision` is an exact 40-hex tooling SHA that already
has independent implementation acceptance. An unaccepted candidate tooling SHA
is invalid for real Pilot measurement. Baseline and assisted members of one pair
MUST use the same accepted tooling revision.

For compatibility with `CONTROLLED_SUBJECT_PAIR_V1`, references there to
`measurementToolingRevision` mean this exact
`acceptedMeasurementToolingRevision` when `requestPurpose=PILOT_MEASUREMENT`.
The acceptance-test candidate identity is outside the Pilot pair and therefore
cannot satisfy that canonical field.

### 2.3 Separate checkout topology

For either purpose the executor and product subject are distinct identities:

```text
$RUNNER_TEMP/ewf-tooling   -> exact candidate or accepted tooling SHA
$RUNNER_TEMP/product       -> exact synthetic/disposable or Pilot product SHA
```

The executor loads only from the exact tooling checkout. Product commands run
only with a declared product `cwd` rooted at `$RUNNER_TEMP/product`. Tooling is
never cherry-picked into a product chain merely to make measurement possible.

## 3. Natural GitHub trigger, request identity and mutation semantics

### 3.1 Trigger

The selected mechanism is a natural GitHub `pull_request` event, not
`workflow_dispatch`:

```yaml
pull_request:
  branches: [main]
  types:
    - opened
    - synchronize
  paths:
    - docs/superpowers/measurement-requests/**
```

A future executor MUST NOT depend on workflow dispatch, rerun, Ready-state
toggles, reopen tricks, empty/no-op commits or mutable branch-name-only inputs.

### 3.2 Minimum workflow permissions

The workflow requires only repository contents plus pull-request metadata and
top-level pull-request comments. Freeze exactly:

```yaml
permissions:
  contents: read
  pull-requests: read
```

No workflow write permission is permitted. The workflow does not create or edit
comments. Human/authorized connector context supplies operation-journal and seal
comments. Normal workflow logs and artifact creation are evidence side effects,
not repository-state writes.

### 3.3 Request carrier

Every run binds exactly one allowed request path under:

```text
docs/superpowers/measurement-requests/**
```

The request contains at least:

```text
schemaVersion
requestPurpose
attemptId
measurementPairId where applicable
measurementPhase where applicable
product subject identity appropriate to purpose
tooling identity appropriate to purpose
measurementSchemaRevision where applicable
measurementMethodRevision where applicable
commandManifest
commandManifestDigest
cwdPolicy
explicitEnvironment
environmentInheritancePolicy
timeoutPolicy
operationDefinitionRevision where applicable
rawEvidenceFormatRevision
```

All Git identities are exact 40-hex SHAs. A branch, tag, PR number, `main`,
`HEAD`, merge ref or other mutable name is not a subject substitute.

The event identity is read from the pull-request payload. The request dataset
MUST bind:

```text
requestPR
requestHeadSha
requestCommit
```

`requestHeadSha` is the exact pull-request head SHA from the event, not a merge
ref or synthetic merge commit. `requestCommit` is the exact request commit and
MUST equal that head for the request being executed.

### 3.4 `opened` semantics

An `opened` event may execute only when all of these are true before any product
command starts:

```text
PR is Draft
exactly one allowed measurement-request path exists for the execution identity
requestHeadSha == current PR head
requestCommit == requestHeadSha
request commit changes exactly that one request path
request branch parent is exact and purpose-valid
all spec / authorization / tooling / product / command bindings are valid
```

For `PILOT_MEASUREMENT`, the request PR is a control-plane request only: its
product/tooling authority comes from exact accepted external identities, never
from the request. The request commit changes only the one request path.

For `SUBSTRATE_ACCEPTANCE_TEST`, the request commit MUST be the direct child of
`candidateToolingRevision` and changes only the one request path. The PR may also
contain the candidate implementation delta inherited from that parent, but that
candidate delta MUST be exactly the separately authorized three-path
implementation surface and MUST bind the same `candidateToolingRevision` and
implementation authorization. This is how an unaccepted candidate can receive
one natural Draft-PR demonstration without pretending it was accepted first.

### 3.5 `synchronize` semantics and supersession

A later head movement on an already executed measurement request PR MUST NOT
silently produce another member of the old dataset. If a successful evidence
artifact already exists for that request identity, a `synchronize` event MUST
classify the prior dataset as:

```text
REQUEST_SUPERSEDED
/
INVALID_FOR_PAIR
```

For the current baseline/assisted protocol:

```text
request head mutation after successful evidence
=
old dataset invalid
```

The workflow MUST NOT run product commands under the old measurement identity
after that classification. A synchronize event can become executable only for
a completely new measurement identity when a future separately accepted
authorization explicitly permits that topology; no such permission is implied
by this spec.

No Ready toggle, reopen or rerun substitutes for a new authorized request. Final
independent audit MUST prove:

```text
current request PR head
==
evidence requestHeadSha
```

If that equality fails, the dataset is invalid even if the historical run was
green.

## 4. Workflow/tooling binding and bootstrap mechanics

A natural PR event proves that GitHub invoked a workflow; it does not prove which
tooling authority was valid. Before product commands, the workflow/executor
MUST:

1. parse and schema-validate the one request;
2. validate `requestPurpose` and all purpose-specific fields;
3. bind `requestPR`, exact `requestHeadSha`, `requestCommit` and exact parent;
4. resolve the appropriate candidate or accepted tooling revision;
5. check out that exact tooling revision with credentials not persisted;
6. load the executor only from that tooling checkout;
7. compare workflow and executor content digests with the exact bound tooling
   revision and applicable authorization/spec;
8. validate the request/candidate delta rules in section 3;
9. resolve external command authority before process execution; and
10. check out the exact product subject separately with credentials not
    persisted.

For `SUBSTRATE_ACCEPTANCE_TEST`, the workflow present in the candidate PR is
allowed to prove that same exact `candidateToolingRevision` only because the
separately accepted implementation authorization already freezes the candidate
boundary and fixture declarations. This is implementation evidence, not
acceptance. Independent audit of that exact candidate remains mandatory before
any `PILOT_MEASUREMENT` can reference it as accepted tooling.

For `PILOT_MEASUREMENT`, workflow/executor content MUST match the exact already
accepted tooling revision. Unrelated movement of `main` cannot replace that
identity.

## 5. Command authority and exact command-manifest contract

A command-manifest digest proves integrity, not authorization. No request may
grant itself shell authority.

### 5.1 Pilot command authority

Every `PILOT_MEASUREMENT` request binds at least:

```text
executionAuthorizationIdentity
executionAuthorizationSubject
executionAuthorizationVerdictCommentId
canonicalSpecRevision
verificationManifestDigest
commandDeclarationIds
commandManifestDigest
```

The referenced execution authorization MUST already be independently accepted
and MUST already freeze the permitted verification declarations. The executor
MUST read that exact accepted authority, verify the exact authorization subject
and verdict comment, resolve the frozen `canonicalSpecRevision`,
`verificationManifestDigest`, declaration identities and ordered declaration
content, canonicalize them, and prove:

```text
requested exact command declarations
==
accepted/frozen declarations
```

before spawning any product process.

If the request adds, replaces, reorders or modifies any command, cwd, required
flag, timeout or declared environment relative to the accepted authority, the
request is:

```text
UNAUTHORIZED_COMMAND
```

and **no product command executes**.

### 5.2 Substrate-acceptance command authority

`SUBSTRATE_ACCEPTANCE_TEST` instead binds the separately accepted
`substrateImplementationAuthorization`, its exact subject/verdict, the accepted
`substrateSpecRevision`, the frozen acceptance-fixture declaration identities
and `acceptanceFixtureManifestDigest`. Candidate source and the request itself
cannot extend those fixture declarations.

### 5.3 Declaration shape and exactness

Each authorized command declaration contains at least:

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

`commandManifestDigest` is SHA-256 over the canonicalized complete ordered
manifest. Ordering is semantic. Splitting, joining, reordering, replacing,
glob-expanding or substituting a broader command is a manifest change. The
executor invokes the exact declaration through one frozen shell policy. It does
not discover tests, infer equivalents, retry, remediate or substitute a broader
`npm test`.

## 6. Immediate LI Pilot B focused declaration set

The immediate LI Pilot B declaration set remains, in exact order:

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

This list is an acceptance fixture/reference for the separately accepted Pilot
authority; this spec does not itself authorize running it against a real Pilot
subject. Broad CI or inferred coverage cannot substitute for a missing exact
declaration.

A baseline subject may legitimately return `FAIL` for a command whose behavior
or test file is introduced by the authorized controlled product delta. `FAIL`
is an executed observation. `ERROR` remains an infrastructure/timeout/invalid-
environment result and cannot be relabeled to preserve comparability.

## 7. Process security boundary and five-state results

### 7.1 Checkout credential boundary

Both tooling and product checkouts MUST use:

```yaml
persist-credentials: false
```

No child product-command process may receive repository write credentials,
GitHub tokens, provider credentials or unrelated workflow secrets.

The executor MUST construct an allowlisted child environment from the frozen
execution declaration and controlled runtime fields. It MUST NOT blindly forward
`process.env` or credential-bearing workflow environment variables. Explicit
environment values remain subject to the accepted command authorization and
secret-redaction policy.

No command executed by this substrate may:

```text
git push
create/update GitHub refs
publish package
deploy
call paid provider
modify remote repository state
```

unless another canonical boundary separately authorizes such behavior. This
substrate grants no such authority, so those operations are invalid here.
External network access is not evidence authority and cannot make a command
authorized.

If exact frozen product commands require dependency materialization, it MUST:

- use the existing exact lockfile;
- use the dependency-install method frozen by the accepted execution authority;
- not modify tracked product files;
- not update dependencies;
- not create a new package/dependency authorization.

Before and after execution the workflow MUST prove the product checkout still
resolves to the exact requested SHA and no tracked product file changed.

### 7.2 Command result record

For every authorized declaration the executor captures:

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
controlledEnvironmentFingerprint
commandManifestDigest
productSubject
exact tooling revision appropriate to requestPurpose
result
errorClass
```

Timing uses a monotonic clock (`process.hrtime.bigint()` or semantically
identical source) for `durationMs`. `start` and `end` are UTC RFC-3339
correlation timestamps only.

The only command results are:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

- `PASS`: process executed and exited successfully.
- `FAIL`: process executed and returned a product/test failure exit status.
- `ERROR`: timeout, crash, invalid execution environment, harness failure or
  another infrastructure condition prevented a trustworthy product result.
- `NOT_RUN`: declaration exists but execution did not occur.
- `NOT_AVAILABLE`: a required executable/tool is absent.

A required `ERROR`, `NOT_RUN` or `NOT_AVAILABLE` blocks valid evidence. There is
no automatic retry or green coercion.

## 8. Controlled environment fingerprint and host diagnostics

`CONTROLLED_SUBJECT_PAIR_V1` requires equality of controlled measurement
semantics, not equality of an uncontrollable GitHub-hosted VM image build.
`environment.json` therefore separates two domains.

### 8.1 `CONTROLLED_ENVIRONMENT_FINGERPRINT`

The exact-match fingerprint contains only fields controlled/frozen by the
measurement contract and accepted authorities, including:

```text
acceptedMeasurementToolingRevision
workflowContentDigest
executorContentDigest
measurementSchemaRevision
measurementMethodRevision
rawEvidenceFormatRevision
commandManifestDigest
exact Node version
npm version where applicable
relevant required tool versions
cwd policy
environment inheritance policy
explicit environment
timeout policy
clock method
operationDefinitionRevision
metricCalculationRevision
executionContainerDigest if used
```

For `SUBSTRATE_ACCEPTANCE_TEST`, the candidate tooling revision replaces the
accepted tooling field for candidate-evidence identity, but no Pilot pair is
formed.

The controlled fingerprint is SHA-256 over canonicalized normalized controlled
fields after required redaction. Baseline and assisted members of one Pilot pair
MUST have identical controlled fingerprints.

The runner family/label may be frozen as an execution requirement (initially
`ubuntu-24.04`), but that label does not pretend to identify one historical
GitHub-hosted image build indefinitely.

### 8.2 `HOST_DIAGNOSTICS`

Record but exclude from exact-comparability equality uncontrollable host facts
such as:

```text
runnerImageOS
runnerImageVersion
runner instance identity
host patch metadata
```

A host-diagnostic difference alone MUST NOT invalidate comparability. If host
drift causes an actual required tool or controlled semantic difference, that
controlled difference is what invalidates the pair.

### 8.3 Optional stronger container boundary

If existing GitHub Actions primitives permit product command execution inside a
container identified by an immutable image digest without adding a project
dependency, the separately authorized implementation SHOULD select that
stronger boundary. No digest is invented by this docs spec. If selected, the
implementation authorization/candidate MUST resolve and freeze the exact image
digest before implementation acceptance, and `executionContainerDigest` becomes
part of the controlled fingerprint.

If no container is selected, the controlled-vs-diagnostic split above is
mandatory.

## 9. Control-PR operation journal protocol

This section mechanically carries the off-workflow operations required by the
canonical eight metric families. It applies to `PILOT_MEASUREMENT`. A substrate
acceptance test may exercise the journal logic on synthetic data but cannot
produce Pilot journal evidence.

### 9.1 Operation comments

The measurement request PR itself is the control-plane journal. Each counted
operation is posted contemporaneously as a machine-readable top-level PR
comment whose identity is exactly:

```text
EWF_MEASUREMENT_OPERATION_V1
```

Each qualifying comment contains at least:

```text
attemptId
measurementPairId
measurementPhase
actorRole
operationCategory
operationDefinitionRevision
operationStartedAt
operationEndedAt
action
evidenceRef
```

Permitted categories are exactly:

```text
manualOperation
preflightOperation
artifactPreparationOperation
validatorReviewOperation
reworkRound
cliAbsentFrictionOperation
```

Comments are evidence at the time they are posted. They MUST NOT be reconstructed
from memory later.

### 9.2 Ordered journal bindings

The workflow/executor reads the exact qualifying top-level comments for the
control PR with read-only permissions and deterministically orders them by
`createdAt`, breaking an exact timestamp tie by numeric `commentId`. Each journal
entry binds:

```text
commentId
createdAt
updatedAt
bodyDigest
actor
orderedPosition
```

`bodyDigest` is SHA-256 over the exact UTF-8 comment body after the canonical
line-ending normalization frozen by the raw-evidence format revision.

A qualifying comment with:

```text
updatedAt != createdAt
```

is invalid for measurement unless the canonical implementation can independently
prove an immutable original body from a separately authoritative immutable
carrier. The default implementation MUST fail closed rather than infer that
original. A deleted or missing journal entry cannot be reconstructed.

### 9.3 Journal seal

After all operations in the frozen observation window have been posted, an
authorized human/connector posts one machine-readable top-level comment with
identity:

```text
EWF_MEASUREMENT_JOURNAL_SEAL_V1
```

The seal binds at least:

```text
attemptId
phase
ordered operation comment IDs
body digests
operationDefinitionRevision
journalDigest
observationWindowStart
observationWindowEnd
```

The seal itself MUST be unedited. `journalDigest` is the deterministic digest of
the exact ordered qualifying journal-entry bindings. The seal is valid only on
the same control PR and current `requestHeadSha` as the dataset being finalized.

The dataset may consume operation counts/timings only after the exact seal is
present and validates. The workflow may use one bounded read-only seal-await
window defined by the frozen `timeoutPolicy`: it polls only PR comments, never
retries product commands and never creates or edits a comment. Missing/invalid
seal at timeout makes the dataset invalid rather than synthesizing a journal.

The final raw artifact copies the sealed rows into:

```text
operation-journal.json
```

and binds:

```text
controlPR
sealCommentId
journalDigest
```

### 9.4 No recursive counting

The mechanical acts of posting either:

```text
EWF_MEASUREMENT_OPERATION_V1
EWF_MEASUREMENT_JOURNAL_SEAL_V1
```

are evidence-capture plumbing. They are explicitly excluded from
`manualOperation` and every derived manual-operation count. Otherwise the
measurement system would recursively create operations merely by recording
operations.

## 10. Measurement observations and accepted zero semantics

The process executor writes the unchanged observation schema from
`CONTROLLED_SUBJECT_PAIR_V1`:

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

Metric result states remain exactly:

```text
OBSERVED
OBSERVED_ZERO
NOT_RUN
NOT_AVAILABLE
NOT_APPLICABLE
UNKNOWN
```

`value` is numeric for `OBSERVED` and exactly numeric zero for
`OBSERVED_ZERO`. For `NOT_RUN`, `NOT_AVAILABLE`, `NOT_APPLICABLE` and `UNKNOWN`,
`value` is `null`. Zero never means missing/unavailable/unrun/unknown/inapplicable.
`OBSERVED_ZERO` is valid only when the frozen method and raw evidence genuinely
observe absence.

All eight canonical metric families and their numeric/unit calculations remain
unchanged in `EWF00-PILOTS-001`.

## 11. Raw evidence carrier and dataset binding

### 11.1 Pilot measurement artifact

For `PILOT_MEASUREMENT`, the canonical raw carrier is one immutable Actions
artifact for each phase. Its name remains:

```text
ewf-measurement-<attemptId>-<measurementPhase>-<productSubject[0:12]>
```

The implementation uses a fixed retention of 90 days unless repository policy
requires a shorter maximum. Each artifact contains at least:

```text
environment.json
command-results.json
measurement-observations.json
operation-journal.json
artifact-manifest.json
commands/<ordinal>-<commandId>.stdout.txt
commands/<ordinal>-<commandId>.stderr.txt
```

`artifact-manifest.json` records SHA-256 for every other member and a canonical
aggregate `datasetDigest`. `baselineDatasetDigest` and `assistedDatasetDigest`
are those aggregate Pilot dataset digests.

The dataset and later evidence bind at least:

```text
requestPR
requestHeadSha
requestCommit
controlPR
sealCommentId
journalDigest
workflowRunId
workflowRunAttempt
jobId
artifactId
artifactName
productSubject
acceptedMeasurementToolingRevision
executionAuthorizationIdentity
executionAuthorizationSubject
executionAuthorizationVerdictCommentId
canonicalSpecRevision
verificationManifestDigest
commandDeclarationIds
commandManifestDigest
controlledEnvironmentFingerprint
hostDiagnostics
measurementSchemaRevision
measurementMethodRevision
datasetDigest
```

When GitHub exposes an artifact digest, that digest is also bound. If the raw
artifact is missing/expired or its digest cannot be verified, the dataset is
unavailable for a new audit. Narrative or Commit C cannot reconstruct it.

### 11.2 Substrate acceptance artifact

`SUBSTRATE_ACCEPTANCE_TEST` produces a distinct artifact namespace and binds
`candidateToolingRevision`, `substrateImplementationAuthorization`,
`substrateSpecRevision`, `syntheticOrDisposableProductSubject`,
`acceptanceFixtureManifestDigest`, exact request identity and raw command proof.
It MUST NOT expose fields named `baselineDatasetDigest` or
`assistedDatasetDigest` and MUST carry the authority marker:

```text
SUBSTRATE_IMPLEMENTATION_EVIDENCE / NOT_ACCEPTANCE
```

No downstream validator may accept that artifact where a
`PILOT_MEASUREMENT` artifact is required.

## 12. Baseline-before-Commit-A temporal gate

This unchanged hard gate applies only to `PILOT_MEASUREMENT` baseline evidence:

```text
BASELINE MUST BE FROZEN BEFORE PRODUCT COMMIT A
```

A baseline becomes frozen only after all of the following exist and are read
back:

1. a valid natural measurement workflow run bound to the exact
   `baselineSubject`, exact request head and accepted tooling revision;
2. its raw artifact and `baselineDatasetDigest`;
3. exact request PR/head/commit identity;
4. a valid sealed operation journal and immutable baseline observations.

The future product executor MUST prove those identities before creating Commit
A. Commit A's exact parent MUST equal the frozen `baselineSubject` unless a
separately accepted Pilot authorization explicitly froze an equivalent
byte-identical lineage anchor. Commit-A creation occurs after completed baseline
evidence identity.

No retrospective reconstruction, backfilled timestamp, PR #35 timing estimate,
synthetic historical baseline or post-A baseline is valid. A
`SUBSTRATE_ACCEPTANCE_TEST` artifact cannot satisfy this gate.

## 13. Controlled subject-pair binding and comparability

For one Pilot measurement pair the substrate records at least:

```text
measurementPairId
attemptId
baselineSubject
assistedSubject
baselineParent
lineageAnchor
acceptedMeasurementToolingRevision
measurementSchemaRevision
measurementMethodRevision
commandDeclarationIds
commandManifestDigest
controlledEnvironmentFingerprint
baselineRequestPR
baselineRequestHeadSha
assistedRequestPR
assistedRequestHeadSha
baselineDatasetDigest
assistedDatasetDigest
baselineJournalDigest
assistedJournalDigest
authorizedDelta
allowedChangedPaths
comparabilityResult
comparabilityDiagnostics
```

`baselineSubject != assistedSubject` remains expected and is not itself a
failure. Comparability requires exactly:

```text
same controlled measurement context
+ same exact externally authorized ordered command declarations
+ same measurement method
+ exact frozen authorized product delta
+ no unrelated product drift
+ current request heads equal the heads bound by evidence
+ valid sealed journals for both phases
```

`comparabilityResult` is exactly `COMPARABLE` or `COMPARABILITY_INVALID`.
It is invalid if accepted tooling, workflow/executor content, command authority
or declarations, measurement method/schema/raw format, controlled environment,
timeout/clock/operation definitions or metric calculation changed; if an
unapproved product path/commit entered the delta; if baseline occurred after
Commit A; if raw evidence/journal seal is missing; or if either request PR head
moved after evidence.

A difference only in `HOST_DIAGNOSTICS`, including a routine hosted runner image
revision change, does **not** invalidate comparability by itself.

## 14. Failure and fail-before-process semantics

Before any product command, fail closed on at least:

- malformed/mutable request or subject identity;
- non-Draft request PR;
- wrong request head/commit/parent;
- wrong purpose-specific tooling identity;
- unaccepted tooling used for `PILOT_MEASUREMENT`;
- real Pilot subject used for `SUBSTRATE_ACCEPTANCE_TEST`;
- candidate implementation delta outside the frozen three-path allowlist;
- workflow/executor content mismatch;
- missing/invalid external command authority;
- `UNAUTHORIZED_COMMAND`, including a self-invented/reordered command;
- product checkout SHA mismatch;
- credential persistence or non-allowlisted child environment;
- tracked product-file mutation;
- required command `ERROR`, `NOT_RUN` or `NOT_AVAILABLE`;
- raw output/artifact/digest failure;
- missing, edited, deleted or invalid journal/seal evidence where required;
- request supersession/head mutation;
- baseline temporal violation;
- controlled-environment mismatch;
- unapproved product delta;
- any attempt to infer acceptance from execution results.

The substrate does not automatically retry a command or rerun a workflow. A new
Pilot measurement attempt requires a new attempt identity and a new valid
pre-Commit-A baseline before any new product Commit A.

## 15. Normative requirements

| ID | Normative requirement |
|---|---|
| `EWF00-ME-01` | Every request has exactly one immutable `requestPurpose`; substrate-acceptance evidence and Pilot-measurement evidence are disjoint and non-reclassifiable. |
| `EWF00-ME-02` | `SUBSTRATE_ACCEPTANCE_TEST` binds exact candidate tooling, separately accepted implementation authorization/spec, disposable product subject and frozen acceptance fixture without requiring candidate acceptance first. |
| `EWF00-ME-03` | `PILOT_MEASUREMENT` uses only exact independently accepted tooling and only `baseline|assisted`; an unaccepted tooling candidate is invalid. |
| `EWF00-ME-04` | The natural Draft-PR trigger is `opened+synchronize` on the bounded request path and never depends on dispatch/rerun/Ready/reopen/no-op tricks. |
| `EWF00-ME-05` | Every dataset binds exact request PR/head/commit; after successful evidence any request-head mutation supersedes and invalidates the old dataset for the current pair. |
| `EWF00-ME-06` | Workflow permissions are exactly read-only `contents: read` and `pull-requests: read`; the workflow never creates comments or repository mutations. |
| `EWF00-ME-07` | Tooling and product checkouts use `persist-credentials: false`; product child processes receive only an allowlisted environment and no repository-write/provider secrets. |
| `EWF00-ME-08` | Every command must equal an exact declaration frozen by an external accepted authority before any product process starts; a self-declared extra command yields `UNAUTHORIZED_COMMAND` and zero product-command execution. |
| `EWF00-ME-09` | The immediate LI focused set remains eight exact ordered declarations; broad CI or inferred coverage is not a substitute. |
| `EWF00-ME-10` | Command results remain exactly `PASS`, `FAIL`, `ERROR`, `NOT_RUN`, `NOT_AVAILABLE`, with stdout/stderr, exit/error state and monotonic timing; no retry/coercion. |
| `EWF00-ME-11` | Product commands cannot push/update refs/publish/deploy/call paid providers or mutate remote state under this substrate; dependency materialization uses the exact lockfile/frozen method without dependency or tracked-file mutation. |
| `EWF00-ME-12` | `CONTROLLED_ENVIRONMENT_FINGERPRINT` contains only controlled/frozen semantics; `HOST_DIAGNOSTICS` records uncontrollable host metadata and host-only differences never invalidate a pair. |
| `EWF00-ME-13` | An immutable container digest is used only if independently resolved/frozen by the later implementation authority; no unverified digest is invented by this spec. |
| `EWF00-ME-14` | Pilot manual-operation evidence is contemporaneous top-level `EWF_MEASUREMENT_OPERATION_V1` comments on the control PR with exact ordered immutable comment bindings. |
| `EWF00-ME-15` | Edited qualifying comments are invalid absent independently provable immutable originals; deleted/missing entries cannot be reconstructed. |
| `EWF00-ME-16` | `EWF_MEASUREMENT_JOURNAL_SEAL_V1` binds exact ordered IDs/body digests, operation-definition revision, journal digest and observation window; the artifact uses the journal only after seal validation. |
| `EWF00-ME-17` | Posting operation/seal comments is evidence-capture plumbing excluded from `manualOperation`, preventing recursive self-counting. |
| `EWF00-ME-18` | The baseline Pilot dataset and immutable digest exist before Commit A; retrospective, post-A and substrate-acceptance artifacts cannot satisfy the baseline gate. |
| `EWF00-ME-19` | All eight canonical metric families and `OBSERVED_ZERO` semantics remain unchanged and derive from raw command/sealed-journal evidence. |
| `EWF00-ME-20` | A controlled pair requires identical controlled environment/method/authorized commands and exact authorized product delta; a hosted-runner diagnostic update alone does not invalidate it. |
| `EWF00-ME-21` | Raw Pilot evidence binds run/job/artifact, request head, product/tooling authority, command authority, controlled fingerprint, host diagnostics, journal seal/digest and deterministic dataset digest. |
| `EWF00-ME-22` | The substrate never emits product/Pilot/EWF acceptance or status/Ready/merge/deploy authority and never creates a second package owner. |

## 16. Required implementation verification and acceptance demonstration

A future substrate implementation cannot be accepted on source inspection. Its
exact implementation candidate MUST demonstrate at least:

- `SUBSTRATE_ACCEPTANCE_TEST` natural Draft-PR execution against an exact
  `candidateToolingRevision` that is not yet accepted;
- proof that the same acceptance artifact is rejected wherever a Pilot
  baseline/assisted artifact is required;
- wrong purpose/tooling/spec/authorization and mutable-ref rejection;
- exact opened request-head binding plus synchronize supersession after a
  successful request;
- final-audit request-head equality validation;
- separate tooling/product checkout identities with `persist-credentials:false`;
- allowlisted child environment and explicit proof that repository/provider
  credentials are absent;
- exact external command-authority resolution and `UNAUTHORIZED_COMMAND` with
  zero product commands;
- exact command order and no broader substitution;
- all five command-result states, timeout and missing-binary behavior;
- stdout/stderr and digest integrity;
- product tracked-state immutability;
- exact-lockfile/frozen dependency materialization behavior if materialization is
  required by any frozen fixture;
- `EWF_MEASUREMENT_OPERATION_V1` ingestion, deterministic ordering and digest;
- edited/deleted/missing journal entry rejection;
- `EWF_MEASUREMENT_JOURNAL_SEAL_V1` validation and missing-seal timeout;
- proof that evidence-capture plumbing is excluded from manual-operation count;
- controlled-environment mismatch invalidating a pair;
- host-diagnostics-only difference **not** invalidating a pair;
- optional immutable-container path only if a real image digest has been
  separately frozen;
- baseline-before-A temporal predicate using immutable synthetic commit topology;
- unauthorized product path invalidating the controlled delta;
- observed-zero versus unavailable/missing fixtures;
- raw artifact manifest/dataset-digest verification; and
- the exact eight-command LI declaration fixture under synthetic/disposable
  subject authority.

The natural candidate demonstration is exactly
`SUBSTRATE_IMPLEMENTATION_EVIDENCE / NOT_ACCEPTANCE`. Independent implementation
audit of the exact candidate remains mandatory. Only after that independent
acceptance may a separate Pilot authorization use the implementation under
`PILOT_MEASUREMENT`.

## 17. Historical provenance

PR #35 is historical rejected Pilot B execution. Its timing estimates,
qualitative CLI-friction value and fabricated validator zero are not upgraded.

PR #37 is historical validly stopped partial execution. Commit A
`27a443b7668cb4847cf116cd18914170f517ff3d` and Commit B
`1e74af7e901b4d0e7daf36806d486c9fd971bb78` remain immutable measured-need and
design evidence only. Governor STOP comment `5225048322` proves the missing
pre-A baseline and exact focused-command substrate need; it does not authorize a
new Pilot.

PR #38 Independent Audit comment `5225337210` accepted
`CONTROLLED_SUBJECT_PAIR_V1` and rejected the previous PMA-12 substrate revision
on six mechanics/authority findings. That verdict remains historical evidence
for head `467eff6e681a536171f72f9b279aa478e411a253`; this remediation requires a
fresh independent audit at its new exact head.

## 18. Acceptance, activation and rollback

This spec is not active merely because it exists in a Draft docs PR. The current
root-repair remediation must receive fresh independent exact-head review. The
auditor reports at least:

```text
CANONICAL_MEASUREMENT_CONTRACT: ACCEPT | REJECT | BLOCKED
PMA12_EXECUTION_SUBSTRATE_SPEC: ACCEPT | REJECT | BLOCKED
```

Only fresh `ACCEPT` of the substrate dimension plus integration of the canonical
repair permits a separately authorized implementation candidate for the frozen
three-path substrate boundary. The implementation candidate then requires its
own independent exact-subject acceptance before a future Pilot may rely on it.

Rollback of a future accepted substrate removes only:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
tests/ewf-measurement-executor.test.mjs
```

and restores the manual EWF path. Rollback does not change product source,
historical evidence, canonical package status or prior verdict history. ADR-046
continues to control all workflow/automation scope outside this narrow PMA-12
exception.
