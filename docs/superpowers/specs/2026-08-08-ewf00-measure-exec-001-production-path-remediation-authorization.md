# EWF00-MEASURE-EXEC-001 — Production-Path Remediation Authorization

## 0. Authorization identity and non-effects

| Field | Frozen value |
|---|---|
| Authorization ID | `EWF00-MEASURE-EXEC-001-PRODUCTION-REMED-AUTH-001` |
| Authorization kind | `DOCS_ONLY / REMEDIATION_AUTHORIZATION / NOT_IMPLEMENTATION` |
| Canonical substrate spec | `EWF00-MEASURE-EXEC-001` |
| Canonical substrate spec revision | `1d0077a8b90ab58a025fff510dde3fd2cda7bc9a` |
| Current canonical `main` at authorization formation | `f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e` |
| Historical original implementation authorization | `EWF00-MEASURE-EXEC-001-AUTH-001` |
| Historical original authorization subject | `f27e4d1174ff0e40bb537cace269dbd36c2f65c3` |
| Historical original authorization ACCEPT | PR `#39`, comment `5225668133` |
| Historical rejected implementation PR | PR `#40` |
| Corrective independent audit | PR `#40`, comment `5225959106` |
| Historical remediation base (`B0`) | `5d941924206c4857ecdc63442f2ae37b05f5cd2e` |
| Historical old request (`R`) | `451a7a57c3ee376ef4421422425d669d4ab0ab70` — `EXCLUDED_FROM_REPLACEMENT_LINEAGE` |
| Future remediation branch | `chatgpt/ewf00-measure-exec-001-production-remediation-v1` |
| Future remediation PR base | `main` |
| Future designated writer | `chatgpt-github-ewf-measurement-production-remediation-writer` |
| Current authorization state | `PENDING_INDEPENDENT_EXACT_HEAD_AUDIT / NOT_EFFECTIVE` |

This document freezes a bounded remediation capsule only. It does **not** accept
measurement tooling, authorize Pilot B, execute `PILOT_MEASUREMENT`, implement
LI-00, accept LI-00, accept EWF-00, change canonical package status, modify PR
#40, mark any PR Ready, merge any PR, deploy, publish, add a dependency, or grant
repository-write authority to the measurement workflow.

The future remediation branch MUST NOT be created and no D/E/R2 transition may
be executed unless an Independent Auditor first posts an exact-head `ACCEPT`
for this authorization candidate and that verdict is read back. The executor of
the later remediation cannot issue that acceptance itself.

## 1. Canonical basis and controlling corrected state

The controlling authority remains:

- `AGENTS.md` for repository execution invariants;
- `docs/ROADMAP.md` for package scope/dependency;
- `docs/IMPLEMENTATION_PLAN.md` for implementation and acceptance requirements;
- `docs/IMPLEMENTATION_STATUS.md` for actual canonical status/evidence;
- `docs/DECISIONS.md`, especially ADR-046 and ADR-047;
- `docs/superpowers/specs/2026-08-06-bounded-execution-capsule-governance-design.md`;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/IMPLEMENTATION_QUEUE.md`;
- `EWF00-ARTIFACTS-001`;
- `EWF00-PREFLIGHT-001`;
- `EWF00-PILOTS-001` / `CONTROLLED_SUBJECT_PAIR_V1`;
- `EWF00-MEASURE-EXEC-001` at revision
  `1d0077a8b90ab58a025fff510dde3fd2cda7bc9a`;
- original implementation authorization `EWF00-MEASURE-EXEC-001-AUTH-001` at
  `f27e4d1174ff0e40bb537cace269dbd36c2f65c3`, independently accepted by
  comment `5225668133`; and
- corrective independent audit comment `5225959106` on PR #40.

The later corrective audit explicitly supersedes initial independent audit
comment `5225941082`. The controlling corrected state is therefore exactly:

```text
SUBSTRATE IMPLEMENTATION:
REJECTED_AT_CURRENT_HEAD
/
SAT_PATH_VALID
/
PILOT_PRODUCTION_PATH_MISSING

PILOT B:
NOT_AUTHORIZED_TO_RESTART

MERGE AUTHORITY:
NONE
```

If a future Stage S0 cannot fresh-read comment `5225959106` as the controlling
later verdict for the same PR #40 subject, it MUST stop:

```text
STOP
SUBSTRATE_REMEDIATION_AUDIT_IDENTITY_DRIFT
```

## 2. Historical evidence preserved without promotion

The following PR #40 facts remain valid historical evidence and MUST NOT be
reclassified as failures merely because the implementation-level verdict was
corrected:

```text
A natural TDD RED:                 VALID
B broad repository GREEN:         VALID
R SUBSTRATE_ACCEPTANCE_TEST:       VALID
SAT artifact:                      VALID
journal/seal:                      VALID
dataset digest:                    VALID
SAT child credential isolation:    VALID
LI eight-command fixture:          NO_PROCESS_SPAWN
```

The corrected defect is narrower and exact:

```text
PILOT_MEASUREMENT_PRODUCTION_PATH_NOT_IMPLEMENTED
```

Accordingly:

- SAT evidence proves the historical SAT path worked;
- it does not prove a real production Pilot path existed;
- B is not accepted measurement tooling;
- R is not a Pilot measurement request and cannot be relabeled as one; and
- no historical SAT dataset may become `baseline` or `assisted` Pilot evidence.

## 3. Mechanically observed defect at exact B0

Exact B0 is:

```text
5d941924206c4857ecdc63442f2ae37b05f5cd2e
```

At that exact revision, the three ADR-047 paths mechanically show the missing
production path.

### 3.1 Workflow defect

`.github/workflows/ewf-measurement.yml`:

- scans specifically for the historical SAT filename pattern;
- requires SAT-specific `candidateToolingRevision` and
  `syntheticOrDisposableProductSubject`;
- checks out `candidate` and disposable `product` using those SAT fields;
- names the only job `substrate-acceptance-test`; and
- invokes only:

```text
node scripts/ewf-measurement-executor.mjs --run-sat
```

It has no generic current-request-delta selector and no natural production
routing for `PILOT_MEASUREMENT`.

### 3.2 Executor defect

`scripts/ewf-measurement-executor.mjs` contains validation helpers that mention
`PILOT_MEASUREMENT`, but there is no exported production dispatcher named
`dispatchMeasurementRequest` and the only direct execution CLI is `--run-sat`.
`runSatCli()` executes the frozen synthetic `ACCEPTANCE_FIXTURE`, binds
`candidateToolingRevision`, creates SAT synthetic observations, and finishes
with:

```text
realPilotCommandsExecuted = false
```

There is no mechanically reachable natural runner implementing:

```text
requestPurpose=PILOT_MEASUREMENT
→ acceptedMeasurementToolingRevision
→ independently accepted external Pilot execution authority
→ exact real productSubject
→ exact authorized ordered command manifest
→ baseline|assisted raw evidence
```

### 3.3 Existing tests are insufficient for production reachability

`tests/ewf-measurement-executor.test.mjs` exercises request validation and the
historical SAT contract, but does not execute a production dispatcher through a
real `PILOT_MEASUREMENT` route. The remediation therefore adds behavior-level
production-path tests while preserving the existing SAT, security,
journal/seal, fixture-digest and `EWF00-ME-*`/`ME-N*` coverage.

## 4. Historical PR #40 is frozen; B0 is only a remediation base

PR #40 is immutable historical rejected implementation evidence for this
remediation. At authorization formation it is expected and verified as:

```text
OPEN
DRAFT
UNMERGED
head = 451a7a57c3ee376ef4421422425d669d4ab0ab70
```

The remediation MUST NOT:

- append implementation commits to PR #40;
- edit its body or implementation files;
- mark it Ready;
- close/reopen it to obtain events;
- rerun or dispatch its workflows;
- merge it;
- force-update its branch; or
- reuse R as a replacement request carrier.

Future Stage S0 MUST fresh-read PR #40. Any unexpected state/head change is:

```text
STOP
SUBSTRATE_REMEDIATION_HISTORICAL_PR_DRIFT
```

The replacement implementation deliberately starts from exact B0:

```text
5d941924206c4857ecdc63442f2ae37b05f5cd2e
```

and classifies it only as:

```text
REMEDIATION_BASE
/
NOT_ACCEPTED_TOOLING
/
NOT_PILOT_AUTHORITY
```

This preserves the historically valid SAT implementation while requiring a
new test-first demonstration of the missing production route. If exact B0 is
not fetchable or its identity/path blobs do not match the historical revision,
stop:

```text
STOP
SUBSTRATE_REMEDIATION_BASE_DRIFT
```

Old R:

```text
451a7a57c3ee376ef4421422425d669d4ab0ab70
```

is explicitly outside replacement implementation ancestry.

## 5. Future branch, one writer and exact implementation boundary

Only after this authorization receives independent exact-head `ACCEPT`, the
future designated writer may create exactly:

```text
branch = chatgpt/ewf00-measure-exec-001-production-remediation-v1
start  = 5d941924206c4857ecdc63442f2ae37b05f5cd2e
PR base = main
```

No other predecessor is authorized.

The exact ADR-047 implementation allowlist remains:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
tests/ewf-measurement-executor.test.mjs
```

One later evidence/control request carrier may exist under:

```text
docs/superpowers/measurement-requests/**
```

That request carrier is not implementation code and does not create a fourth
implementation path.

Explicitly forbidden mutations are:

```text
package.json
package-lock.json
src/**
all product tests/**
existing CI workflows other than the ADR-047-owned ewf-measurement.yml
canonical ROADMAP
canonical IMPLEMENTATION_PLAN
canonical IMPLEMENTATION_STATUS
docs/DECISIONS.md
deployment configuration
new dependency
Pilot B source
LI-00 source
LI-00 test
```

If production remediation cannot fit the exact three implementation paths:

```text
STOP
SUBSTRATE_PRODUCTION_REMEDIATION_BOUNDARY_INSUFFICIENT
```

Future Stage S0 MUST also fresh-check open PRs, branch existence, one-writer
identity and semantic/path overlap. PR #40 is a frozen historical exception,
not a writer allowed to change. Any other active writer or overlapping
candidate is:

```text
STOP
SUBSTRATE_PRODUCTION_REMEDIATION_WRITER_OR_PATH_COLLISION
```

## 6. Frozen future topology

The only authorized implementation/evidence topology is:

```text
B0 — historical remediation base
     5d941924206c4857ecdc63442f2ae37b05f5cd2e

↓

D — PRODUCTION-PATH TEST FIRST

↓

OPEN — one new Draft remediation PR against main

↓

natural exact-head RED

↓

E — WORKFLOW + EXECUTOR REMEDIATION ONLY

↓

natural exact-head GREEN

↓

R2 — ONE SUBSTRATE_ACCEPTANCE_TEST REQUEST

↓

natural dedicated SAT

↓

H — one implementation handoff comment / no repository commit

↓

STOP — Independent Implementation Audit
```

No extra implementation commit, evidence commit, Commit F, amend, rebase,
squash, force-push, no-op commit, rerun, workflow dispatch, Ready toggle or
reopen trigger is authorized.

The future implementation audit subject is exact Commit E. R2 is only the
acceptance-evidence request head.

## 7. Commit D — immutable production-path test first

Commit D MUST have exact parent:

```text
5d941924206c4857ecdc63442f2ae37b05f5cd2e
```

and change exactly:

```text
tests/ewf-measurement-executor.test.mjs
```

with exact commit message:

```text
test: require EWF Pilot measurement production path
```

All existing SAT tests remain present and effective. D MUST NOT weaken, delete,
skip or quarantine:

```text
EWF00-ME-01..22
ME-N01..ME-N46
SAT fixture digest assertions
security assertions
journal/seal assertions
```

After D is committed, its test blob is immutable through E and R2.

### 7.1 Frozen first remediation RED

D MUST dynamically import the already-existing B0 executor successfully. The
first newly introduced remediation assertion is frozen as:

```js
const executor = await import('../scripts/ewf-measurement-executor.mjs');
assert.equal(
  typeof executor.dispatchMeasurementRequest,
  'function',
  'PILOT_PRODUCTION_ENTRYPOINT_MISSING',
);
```

The stable expected first new failure class is:

```text
PILOT_PRODUCTION_ENTRYPOINT_MISSING
```

The same new test group also proves that the B0 workflow lacks the generic
production routing contract. However, the first remediation-specific failure
MUST remain the dispatcher assertion above, after successful module import.

D is invalid if its first new failure is caused by any of:

```text
module import
syntax
dependency
filesystem setup
GitHub connectivity
network
fixture parsing
historical SAT tests
unrelated repository test
```

or if another/ambiguous first new failure is observed. In that case:

```text
STOP
INVALID_SUBSTRATE_PRODUCTION_REMEDIATION_RED
```

D MUST NOT be edited after the natural RED is classified.

### 7.2 Hermetic behavior coverage added by D

D uses temporary filesystem/product-checkout fixtures, synthetic exact 40-hex
identities, frozen fake accepted-authority responses and harmless synthetic
command declarations. It makes no provider call, paid-service call, real Pilot
request or real LI product mutation.

The immutable D test suite MUST prove behavior for all of the following:

1. `PILOT_MEASUREMENT` routes to the production handler, not SAT;
2. `SUBSTRATE_ACCEPTANCE_TEST` still routes to the SAT handler;
3. unknown purpose returns `INVALID_REQUEST_PURPOSE` before spawn;
4. a historical SAT carrier plus a sole new Pilot request delta selects the new
   Pilot request;
5. accepted-tooling resolver is consulted;
6. unaccepted tooling is rejected;
7. wrong tooling subject is rejected;
8. execution-authorization resolver is consulted;
9. wrong authorization subject is rejected;
10. wrong verdict comment is rejected;
11. wrong `canonicalSpecRevision` is rejected;
12. wrong `verificationManifestDigest` is rejected;
13. an extra command is `UNAUTHORIZED_COMMAND` before spawn;
14. reordered commands are `UNAUTHORIZED_COMMAND` before spawn;
15. changed `cwd` is `UNAUTHORIZED_COMMAND` before spawn;
16. changed timeout is `UNAUTHORIZED_COMMAND` before spawn;
17. changed explicit environment is `UNAUTHORIZED_COMMAND` before spawn;
18. an exact authorized harmless command executes;
19. `PASS` is recorded;
20. `FAIL` is recorded without coercion;
21. `ERROR` remains distinct from `FAIL`;
22. `NOT_AVAILABLE` is preserved;
23. `NOT_RUN` is preserved;
24. baseline measurement shape is valid;
25. assisted measurement shape is valid;
26. all eight canonical metric rows exist;
27. SAT synthetic metrics cannot become Pilot metrics;
28. product checkout SHA is immutable;
29. tracked mutation invalidates evidence;
30. `EWF_GITHUB_READ_TOKEN` never reaches child environment;
31. `EWF_GITHUB_READ_TOKEN` never appears in an evidence member;
32. journal/seal exact-head binding is enforced; and
33. dataset digest is deterministic.

These are executable behavior tests, not source-string grep substitutes.

## 8. Exact production router contract

Commit E MUST expose one public purpose-aware executor surface with this exact
name:

```text
dispatchMeasurementRequest(...)
```

and one primary generic direct CLI with this exact flag:

```text
--run-request
```

The post-E workflow MUST invoke `--run-request` for both request purposes and
MUST NOT select a separate workflow engine per purpose.

If the historical `--run-sat` flag is retained solely for compatibility with
existing SAT callers, it is only a thin SAT-restricting alias that delegates to
`dispatchMeasurementRequest(...)`. It may not contain an independent execution
engine, may not accept `PILOT_MEASUREMENT`, and the workflow may not use it after
E.

Routing is exactly:

```text
requestPurpose = SUBSTRATE_ACCEPTANCE_TEST
→ historical SAT semantics through the shared dispatcher

requestPurpose = PILOT_MEASUREMENT
→ production Pilot measurement handler through the same dispatcher

unknown requestPurpose
→ INVALID_REQUEST_PURPOSE
→ zero product processes
```

No request may silently fall back from one purpose to the other. SAT synthetic
observations remain tagged as SAT and are never transformed into Pilot
observations.

## 9. Commit-bound request discovery contract

The workflow MUST stop using directory uniqueness as request authority.
Production request identity is frozen as:

```text
requestCommit = github.event.pull_request.head.sha
requestHeadSha = github.event.pull_request.head.sha
```

The request selector MUST determine the exact parent of `requestCommit` and the
exact commit delta against that parent. For an executable request:

```text
requestCommit has exactly one parent
AND
exactly one changed repository path exists in requestCommit^..requestCommit
AND
that path is under docs/superpowers/measurement-requests/**
```

That exact changed path is the request carrier. Historical carriers already
present in the checkout are ignored unless they are the exact current commit
delta. The selector MUST NOT scan the directory and infer authority from “the
only matching filename”.

Any second current-delta path, any path outside the request directory, a missing
or ambiguous parent, or any mismatch between event head/current PR head/request
commit is:

```text
REQUEST_BOUNDARY_INVALID
```

before any product process executes.

D MUST include a replayable fixture where a historical SAT request carrier is
already present, the current request commit adds only a new
`PILOT_MEASUREMENT` request, and the selector chooses that new Pilot request.

## 10. `PILOT_MEASUREMENT` production request contract

The production path supports exactly:

```text
requestPurpose = PILOT_MEASUREMENT
measurementPhase = baseline | assisted
```

A Pilot request binds at least:

```text
acceptedMeasurementToolingRevision
acceptedMeasurementToolingVerdictCommentId
productSubject
measurementPairId
attemptId
measurementPhase

executionAuthorizationIdentity
executionAuthorizationSubject
executionAuthorizationVerdictCommentId
executionAuthorizationPath
canonicalSpecRevision
verificationManifestDigest
commandDeclarationIds
commandManifestDigest
commandManifest

cwdPolicy
explicitEnvironment
environmentInheritancePolicy
timeoutPolicy
operationDefinitionRevision
rawEvidenceFormatRevision
```

All Git subjects are exact lowercase 40-hex SHAs. The additional exact verdict
and authorization-path bindings above make the production authority resolvers
mechanically addressable; they do not allow the request to create authority.

The production router is package-generic. It MUST NOT hard-code LI-00 as the
only supported package. The existing LI eight-command declaration set remains
an exact historical/reference fixture only and is not generic shell authority.

## 11. Accepted tooling authority resolver

For `PILOT_MEASUREMENT`, a caller assertion that tooling is accepted is
insufficient. Before any product process executes, the production resolver MUST
read and verify independent repository evidence for:

```text
acceptedMeasurementToolingRevision
acceptedMeasurementToolingVerdictCommentId
```

It MUST prove all of the following:

1. the requested tooling SHA exists as the exact implementation subject;
2. the bound independent implementation verdict comment exists, names that
   exact subject and records `ACCEPT` for the substrate implementation;
3. no later controlling corrective/superseding verdict for that same subject
   invalidates the bound acceptance;
4. the exact accepted implementation remains inside ADR-047's three-path
   boundary;
5. workflow bytes used by the request checkout match
   `.github/workflows/ewf-measurement.yml` at the accepted tooling SHA; and
6. executor bytes loaded for execution match
   `scripts/ewf-measurement-executor.mjs` at the accepted tooling SHA.

Any of these conditions failing is a fail-closed tooling-authority error before
product spawn. In particular:

```text
unaccepted tooling SHA
wrong accepted tooling subject
workflow content mismatch
executor content mismatch
superseded/rejected acceptance
```

cannot be normalized away.

B0 is explicitly not eligible to satisfy this resolver. Until a future
remediation implementation receives independent `ACCEPT`, its E SHA remains:

```text
NOT_ACCEPTED_TOOLING
```

No remediation SAT fixture, remediation request or self-asserted field may
grant Pilot tooling authority.

## 12. Independent external execution-authority resolver

For `PILOT_MEASUREMENT`, shell authority comes only from an independently
accepted external execution authorization. The request itself is only a bound
execution request.

Before any product process executes, the resolver MUST fetch/read and verify:

```text
executionAuthorizationIdentity
executionAuthorizationSubject
executionAuthorizationVerdictCommentId
executionAuthorizationPath
canonicalSpecRevision
verificationManifestDigest
commandDeclarationIds
exact ordered command declarations
commandManifestDigest
```

The resolver MUST prove that the authorization document at the exact bound
subject freezes the same identity, canonical spec revision, verification
manifest digest, declaration IDs and complete ordered declaration contents; the
bound independent verdict comment must name that exact authorization subject
and `ACCEPT` it. A request-supplied boolean such as
`acceptedExecutionAuthorization=true` is never sufficient.

Each declaration is compared in full, including at least:

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

Canonicalized requested declarations MUST equal the independently frozen
accepted declarations and MUST produce the same `commandManifestDigest`.

Any added, removed, replaced, reordered or modified declaration, or any change
to command, ordinal, `cwd`, `required`, `requirements`, `timeoutMs` or
`explicitEnvironment`, yields exactly:

```text
UNAUTHORIZED_COMMAND
```

and executes zero product processes.

## 13. Read-only authority-resolver control plane and credential isolation

The workflow remains repository-read-only with exact top-level permissions:

```yaml
permissions:
  contents: read
  pull-requests: read
```

It may use the workflow's read-only GitHub token for control-plane reads needed
to verify exact commit content, exact authorization documents, exact verdict
comments, PR metadata/comments and journal/seal evidence.

When exposed to the executor, that token uses only the dedicated control-plane
field:

```text
EWF_GITHUB_READ_TOKEN
```

The token MUST:

- never be forwarded to a child product-command environment;
- never be serialized into `environment.json` or any other artifact member;
- never appear in command stdout/stderr;
- never be written to repository/product/tooling files; and
- never grant repository mutation, comment mutation, ref mutation, deployment,
  publishing or provider authority.

Production hermetic tests use a fake resolver and fake token value and prove
that the value cannot cross the child/evidence boundary.

## 14. Product checkout and exact execution boundary

For `PILOT_MEASUREMENT`, exact accepted tooling and exact product subject are
separate checkouts. Both checkouts use:

```text
persist-credentials: false
```

The product checkout is exactly `productSubject`; all authorized product
commands execute only inside that product checkout under the frozen `cwdPolicy`.

Immediately before the first product command and again after the command set,
the executor MUST prove:

```text
git rev-parse HEAD == exact productSubject
git diff --quiet
git diff --cached --quiet
```

A tracked or staged mutation invalidates the evidence. Tooling files are not
cherry-picked into the product chain. No retry, automatic remediation, branch
rewrite or result coercion is allowed.

## 15. Exact command result semantics

The only command states are exactly:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

No retry is performed. A command that ran and returned a product/test failure is
`FAIL`; infrastructure/timeout/invalid-environment execution failure is
`ERROR`; a missing required executable is `NOT_AVAILABLE`; a declaration that
did not run remains `NOT_RUN` according to the frozen prerequisite policy.

A valid baseline may legitimately contain `FAIL` when the future authorized
product delta introduces a test that the baseline product does not satisfy.
Such a `FAIL` is measurement evidence and MUST NOT be hidden or coerced to
`ERROR`, `PASS` or `NOT_RUN`.

## 16. Pilot raw-evidence and dataset contract

The production path MUST produce canonical raw evidence for each real future
Pilot phase (`baseline` and `assisted`) with at least:

```text
environment.json
command-results.json
measurement-observations.json
operation-journal.json
artifact-manifest.json
commands/<ordinal>-<commandId>.stdout.txt
commands/<ordinal>-<commandId>.stderr.txt
```

Each phase deterministically computes `datasetDigest` from the canonical member
manifest using the substrate's canonical JSON/SHA-256 rules and binds at least:

```text
requestPR
requestHeadSha
requestCommit
measurementPairId
attemptId
measurementPhase
productSubject
acceptedMeasurementToolingRevision
executionAuthorizationIdentity
executionAuthorizationSubject
executionAuthorizationVerdictCommentId
commandManifestDigest
controlledEnvironmentFingerprint
journalDigest
operationDefinitionRevision
rawEvidenceFormatRevision
```

No member contains package acceptance, Pilot acceptance or EWF acceptance
authority.

SAT evidence continues to use the SAT evidence domain and cannot supply Pilot
`baselineDatasetDigest` or `assistedDatasetDigest`.

## 17. Eight canonical metric families

Every real Pilot baseline/assisted dataset contains exactly the canonical eight
metric families:

```text
focusedDuration
prDuration
preflightOverhead
artifactPreparation
validatorOverhead
manualOperations
reworkFindingLoop
cliAbsentFriction
```

Each row contains:

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

Allowed metric states are exactly:

```text
OBSERVED
OBSERVED_ZERO
NOT_RUN
NOT_AVAILABLE
NOT_APPLICABLE
UNKNOWN
```

`OBSERVED_ZERO` means a genuinely observed numeric zero with raw proof. Missing,
unrun, unavailable, inapplicable or unknown values remain their exact states
with `value=null` and are never converted to zero.

The SAT-only synthetic metric fixture:

```text
SAT_SYNTHETIC_METRIC_FIXTURE_V1
/
NOT_PILOT_MEASUREMENT
```

must never be reused as real Pilot observations.

## 18. Operation journal and seal

The production path preserves the existing markers:

```text
EWF_MEASUREMENT_OPERATION_V1
EWF_MEASUREMENT_JOURNAL_SEAL_V1
```

For a real future Pilot request, the resolver consumes the actual current
request PR's sealed operation journal and binds exactly:

```text
requestHeadSha
attemptId
measurementPairId
measurementPhase
operationDefinitionRevision
ordered operation comment IDs
ordered normalized body digests
journalDigest
```

Edited, deleted, missing, wrong-head, wrong-phase, wrong-pair or digest-mismatched
rows fail closed. The workflow only reads comments/metadata and remains
read-only.

## 19. Commit E — minimal production-path remediation

Commit E MUST be the direct child of exact D and change exactly:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
```

with exact commit message:

```text
fix: implement EWF Pilot measurement production path
```

D's test blob MUST remain byte-identical. E adds no package/dependency edit,
product code, Pilot B code or canonical status change.

E must implement only the contracts frozen above: current-commit request
selection, one purpose-aware dispatcher, read-only authority resolution, exact
command authorization, separate exact product execution, real baseline/assisted
artifact formation, canonical metric/journal handling, and SAT preservation.

If any behavior requires a fourth implementation path or weaker authority,
stop rather than broaden E.

## 20. Natural D RED and E GREEN

After D is formed, the designated writer opens exactly one new **Draft**
remediation PR from
`chatgpt/ewf00-measure-exec-001-production-remediation-v1` to `main`.

The natural `pull_request/opened` broad repository CI at exact D must fail for
the frozen first remediation failure:

```text
PILOT_PRODUCTION_ENTRYPOINT_MISSING
```

Only after that RED is independently classifiable as valid may E be written.

E's push creates a natural `pull_request/synchronize` event. At exact E:

- the immutable D test blob is unchanged;
- all new production-path hermetic tests pass;
- all preserved SAT tests pass; and
- required broad repository CI succeeds.

No rerun, workflow dispatch, Ready/reopen trigger, empty/no-op commit or event
substitution may satisfy D RED or E GREEN.

## 21. R2 — one SAT regression request only

Only after natural exact-E broad GREEN, form R2 as the direct child of E.
R2 changes exactly one request carrier under:

```text
docs/superpowers/measurement-requests/**
```

and no other path.

Its purpose is exactly:

```text
requestPurpose = SUBSTRATE_ACCEPTANCE_TEST
```

R2 MUST NOT be a `PILOT_MEASUREMENT` request.

R2 binds the exact remediation candidate E and this remediation authorization's
future independently accepted exact subject/verdict. It demonstrates that the
historically valid SAT path still works through the remediated generic router.

The accepted historical SAT runtime fixture may be reused only if it is
byte-for-byte unchanged. If it is reused, its canonical fixture digest remains
exactly:

```text
a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d
```

A different fixture requires a separately computed and frozen digest; no digest
may be invented.

The natural dedicated R2 workflow must succeed and must record:

```text
realPilotCommandsExecuted = false
PilotB = NOT_EXECUTED
```

No real LI/Pilot command may execute in R2.

## 22. Handoff evidence and future independent audit subject

After the natural R2 SAT succeeds, the implementer writes no repository evidence
commit. Exactly one handoff comment is allowed. It is:

```text
SUBSTRATE_REMEDIATION_IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE
```

and binds at least:

```text
remediationAuthorizationIdentity
remediationAuthorizationExactAcceptedSubject
remediationAuthorizationVerdictCommentId

historicalB0
D
E
R2

D test blob
E workflow blob
E executor blob

natural D RED workflow/run/job/conclusion
natural E GREEN workflow/run/job/conclusion
natural R2 SAT workflow/run/job/conclusion

SAT artifact ID/name/digest
datasetDigest
journal/seal comment IDs and digests
controlledEnvironmentFingerprint

production-path hermetic test identities/results

realPilotCommandsExecuted = false
PilotB = NOT_EXECUTED
acceptanceClaim = NOT_CLAIMED
```

Then the implementer MUST stop for a fresh Independent Implementation Audit.

The future independent auditor audits:

```text
implementation subject = exact E
acceptance-evidence request head = exact R2
```

R2 is never the tooling implementation subject. If and only if the future
independent audit issues `ACCEPT` for exact E, the future accepted tooling
identity becomes:

```text
acceptedMeasurementToolingRevision = exact Commit E SHA
```

Until that verdict exists, exact E remains `NOT_ACCEPTED_TOOLING`.

## 23. Explicit no-Pilot-B boundary

This remediation explicitly forbids:

```text
real PILOT_MEASUREMENT request
LI-00 baseline
LI-00 Commit A
LI-00 source changes
LI-00 tests
LI eight-command execution against a real Pilot subject
Pilot B evidence
Pilot B acceptance
EWF-00 acceptance
```

Hermetic tests may model Pilot requests only with temporary/disposable fixtures,
synthetic exact identities and fake authority responses. They cannot execute a
real Pilot B subject.

## 24. Stop conditions

Any one of these conditions stops the future executor before the next mutation:

```text
SUBSTRATE_REMEDIATION_AUDIT_IDENTITY_DRIFT
SUBSTRATE_REMEDIATION_BASE_DRIFT
SUBSTRATE_REMEDIATION_HISTORICAL_PR_DRIFT
SUBSTRATE_PRODUCTION_REMEDIATION_WRITER_OR_PATH_COLLISION
SUBSTRATE_PRODUCTION_REMEDIATION_BOUNDARY_INSUFFICIENT
INVALID_SUBSTRATE_PRODUCTION_REMEDIATION_RED
REQUEST_BOUNDARY_INVALID
INVALID_REQUEST_PURPOSE
UNAUTHORIZED_COMMAND
accepted-tooling authority unresolved/mismatched/superseded
execution-authorization authority unresolved/mismatched
workflow/executor accepted-tooling content mismatch
product exact-SHA or tracked-state mutation
journal/seal exact-head mismatch
credential isolation failure
unexpected CI event/head/workflow identity
missing required Actions artifact/digest
D test blob mutation after RED
main/base/authorization authority drift that changes the frozen capsule
```

No stop may be bypassed by changing the baseline, broadening the allowlist,
weakening tests, rerunning CI or rewriting history.

## 25. Adversarial completeness check

The following twenty answers are part of the frozen authorization contract.

### 1. Why is PR #40 not mergeable as accepted tooling?

Because corrective independent audit `5225959106` supersedes prior ACCEPT
`5225941082` and records exact blocking finding
`PILOT_MEASUREMENT_PRODUCTION_PATH_NOT_IMPLEMENTED`. PR #40 therefore remains
historical rejected implementation evidence, with no merge authority and no
accepted tooling subject.

### 2. Why is old SAT evidence still valid but insufficient?

Its natural A RED, B broad GREEN, R dedicated SAT, artifact, journal/seal,
dataset digest and credential isolation genuinely prove the SAT path. They do
not exercise a mechanically reachable real `PILOT_MEASUREMENT` production
runner, so they cannot satisfy implementation acceptance for the full accepted
substrate contract.

### 3. Why is B0 safe as remediation base but not accepted tooling?

B0 contains the historically valid SAT implementation and therefore minimizes
the remediation delta, but the corrective verdict rejected it as a complete
substrate. It is frozen only as `REMEDIATION_BASE / NOT_ACCEPTED_TOOLING /
NOT_PILOT_AUTHORITY`.

### 4. Why is old R excluded from replacement lineage?

Old R is a historical one-file SAT evidence request bound to rejected B. Starting
from R would inherit obsolete evidence-control state into the remediation
lineage. The replacement starts exactly from B0 so D can demonstrate the missing
production path directly; a fresh R2 later proves SAT regression safety.

### 5. What exact first new RED proves the missing production path?

After successful dynamic import of the B0 executor, D's first remediation
assertion is exactly that
`typeof executor.dispatchMeasurementRequest === "function"`; its stable failure
message/class is `PILOT_PRODUCTION_ENTRYPOINT_MISSING`.

### 6. How does request discovery select current commit delta instead of historical carriers?

It sets `requestCommit = github.event.pull_request.head.sha`, resolves its exact
single parent, computes that commit's exact delta, requires exactly one changed
path under `docs/superpowers/measurement-requests/**`, and selects only that
path. Pre-existing request files are ignored.

### 7. How does workflow route SAT vs Pilot?

The workflow invokes only generic CLI `--run-request`, which calls exported
`dispatchMeasurementRequest(...)`. `SUBSTRATE_ACCEPTANCE_TEST` goes to the SAT
handler; `PILOT_MEASUREMENT` goes to the production handler; an unknown purpose
fails `INVALID_REQUEST_PURPOSE` before spawn. There is no silent fallback.

### 8. How does production runner resolve accepted tooling?

It uses read-only control-plane evidence to verify exact
`acceptedMeasurementToolingRevision` and its independent ACCEPT verdict, checks
that no later controlling verdict supersedes it, then compares workflow and
executor bytes to that exact accepted revision before any product process.

### 9. How does it resolve independent command authority?

It reads the exact external execution-authorization document and independent
verdict bound by identity, exact authorization subject and verdict comment, then
verifies `canonicalSpecRevision`, `verificationManifestDigest`, declaration IDs,
complete ordered declarations and `commandManifestDigest`.

### 10. Why can a request not self-authorize commands?

Request fields are assertions only. Process spawning is gated on independently
resolved accepted authorization content and verdict evidence. A caller boolean,
request-local declaration or digest without that external authority cannot pass
the resolver.

### 11. How are exact declarations compared?

The requested and independently frozen arrays are canonicalized in semantic
order and compared field-for-field, including command ID, ordinal, command,
`cwd`, `required`, `requirements`, `timeoutMs` and `explicitEnvironment`; the
canonical manifest digest must also match. Any difference is
`UNAUTHORIZED_COMMAND` before spawn.

### 12. How does control-plane GitHub read access remain separate from child credentials?

The workflow has only `contents: read` and `pull-requests: read`. The executor
receives the token only as `EWF_GITHUB_READ_TOKEN` for authority/journal reads;
child environment construction excludes it, artifacts/logs/files exclude it,
and both checkouts use `persist-credentials:false`.

### 13. How are product SHA and tracked-state immutability proven?

The production handler uses a separate exact `productSubject` checkout and runs
`git rev-parse HEAD`, `git diff --quiet`, and `git diff --cached --quiet` before
and after the authorized command set. Wrong SHA or tracked/staged mutation
invalidates evidence.

### 14. How are baseline and assisted artifacts distinguished?

Only `PILOT_MEASUREMENT` may use `measurementPhase=baseline|assisted`. Every raw
dataset binds that phase plus pair/attempt/product/tooling/request/authority
identities and its own deterministic `datasetDigest`; SAT artifacts cannot be
reclassified into either phase.

### 15. How are all eight metric families produced?

The production observation builder emits exactly one canonical row for each of
`focusedDuration`, `prDuration`, `preflightOverhead`, `artifactPreparation`,
`validatorOverhead`, `manualOperations`, `reworkFindingLoop` and
`cliAbsentFriction`, preserving required row fields and six-state zero/missing
semantics.

### 16. How is journal/seal bound to the exact request head?

The production resolver reads the actual current request PR's
`EWF_MEASUREMENT_OPERATION_V1` rows and `EWF_MEASUREMENT_JOURNAL_SEAL_V1`, then
verifies exact request head, attempt, pair, phase, operation-definition revision,
ordered comment IDs/body digests and `journalDigest`. Edited/deleted/missing or
wrong-head rows fail closed.

### 17. How is SAT evidence prevented from becoming Pilot evidence?

Purpose is immutable. SAT uses its historical synthetic evidence authority,
does not carry Pilot baseline/assisted semantics, records
`realPilotCommandsExecuted=false`, and the dispatcher never maps SAT synthetic
metric fixtures into Pilot observations. Pilot datasets require independently
accepted tooling and external execution authority that SAT does not grant.

### 18. How does R2 prove SAT regression safety without real Pilot execution?

R2 is a fresh sole-current-delta `SUBSTRATE_ACCEPTANCE_TEST` request after exact
E broad GREEN. It routes through the remediated generic dispatcher, uses only
the accepted SAT fixture (with digest `a8e417...` only if byte-identical), and
must record `realPilotCommandsExecuted=false` / `PilotB=NOT_EXECUTED` while its
natural dedicated workflow succeeds.

### 19. What exact SHA will later become `acceptedMeasurementToolingRevision` if audit passes?

The identity rule is frozen as **the exact SHA of Commit E** in this authorized
`B0 -> D -> E -> R2` lineage. That SHA does not exist at authorization time and
must not be guessed. After E is formed it is bound in the handoff; only an
independent `ACCEPT` of that exact E permits
`acceptedMeasurementToolingRevision = exact E SHA`. R2 can never occupy that
field.

### 20. Why does this remediation remain inside ADR-047's exact three-path exception?

D changes only the existing test path; E changes only the existing workflow and
executor paths; R2 is explicitly a one-file control/evidence request carrier,
not implementation code. No dependency, product source/test, canonical status,
second workflow engine, scheduler, daemon, deployment or fourth implementation
path is authorized.

## 26. Authorization-candidate repository boundary

This authorization candidate itself is docs-only and is permitted to change
exactly one repository path:

```text
docs/superpowers/specs/2026-08-08-ewf00-measure-exec-001-production-path-remediation-authorization.md
```

Authorization branch:

```text
chatgpt/ewf00-measure-exec-001-production-remediation-auth-v1
```

It is created from exact `main`:

```text
f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
```

The authorization PR MUST remain Draft and unmerged. Natural exact-head PR CI is
required. No independent verdict is issued by this implementer.

## 27. Authorization effect after a future independent verdict

If an Independent Auditor later posts and the executor fresh-reads an exact-head
`ACCEPT` for this authorization candidate, the only newly granted authority is:

```text
create future remediation branch exactly from B0
→ form D under Section 7
→ observe valid natural exact-D RED
→ form E under Sections 8–20
→ observe natural exact-E GREEN
→ form R2 under Section 21
→ observe natural exact-R2 SAT
→ post one implementer handoff under Section 22
→ STOP for independent implementation audit
```

No Pilot B authority, tooling acceptance, product-package acceptance or merge
authority is implied by that authorization verdict.