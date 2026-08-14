# EWF00-MEASURE-EXEC-001 — Substrate Implementation Authorization

## 0. Authorization identity

| Field | Frozen value |
|---|---|
| Authorization | `EWF00-MEASURE-EXEC-001-AUTH-001` |
| Authorization kind | docs-only implementation authorization candidate |
| Canonical spec | `EWF00-MEASURE-EXEC-001` |
| Accepted spec/root-repair head | `1d0077a8b90ab58a025fff510dde3fd2cda7bc9a` |
| Independent root-repair ACCEPT | PR `#38`, comment `5225520686` |
| Root-repair merge / implementation predecessor | `f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e` |
| Implementation writer | `chatgpt-github-ewf-measurement-substrate-writer` |
| Future implementation branch | `chatgpt/ewf00-measure-exec-001-implementation-v1` |
| Exact runner family | `ubuntu-24.04` |
| Exact Node | `22.22.3` |
| Exact npm | `10.9.8` |
| `executionContainerDigest` | `NOT_SELECTED` |
| Current authority | `PENDING_INDEPENDENT_EXACT_HEAD_AUDIT` |

This document is authorization only. It does not implement the substrate, run
measurement, run Pilot B, implement LI-00, accept any package, mark a PR Ready,
merge an implementation candidate, deploy, publish, or mutate canonical package
status. It becomes executable authority only after an Independent Auditor posts
an `ACCEPT` verdict bound to this authorization PR's exact final head.

## 1. Canonical basis and activation gate

The future writer MUST fresh-read, at the exact predecessor or later separately
accepted immutable authority, all of:

- `AGENTS.md`
- `docs/ROADMAP.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/DECISIONS.md`, including ADR-046 and ADR-047
- `docs/superpowers/specs/2026-08-04-engineering-workflow-foundation-design.md`
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-preflight-verification-trace-spec.md`
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-pilots-measurement-audit-spec.md`
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-measurement-execution-substrate-spec.md`
- PR #38 independent ACCEPT comment `5225520686`.

PR #38 is integrated by merge commit
`f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e`; the accepted head
`1d0077a8b90ab58a025fff510dde3fd2cda7bc9a` is preserved as direct ancestry.
Therefore `CONTROLLED_SUBJECT_PAIR_V1`, `EWF00-MEASURE-EXEC-001`, and ADR-047
are integrated canonical authority. ADR-046 remains controlling outside the
narrow ADR-047 exception.

No implementation branch may be created until this authorization itself has an
independent exact-head `ACCEPT`.

## 2. Predecessor, baseline path state, writer and collision gate

Freeze:

```text
implementationPredecessor =
f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
```

At authorization formation the following exact paths are verified `ABSENT` at
that predecessor:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
tests/ewf-measurement-executor.test.mjs
```

Exactly one implementation writer is frozen:

```text
chatgpt-github-ewf-measurement-substrate-writer
```

Open-PR path inspection at authorization formation found no overlap with those
three paths. Stage S0 MUST repeat predecessor, writer, branch, open-PR and
semantic-overlap checks immediately before any implementation write.

Any overlap:

```text
STOP
SUBSTRATE_WRITER_OR_PATH_COLLISION
```

Any main/predecessor drift, superseding canonical decision, or accepted
authorization/spec identity drift:

```text
STOP
SUBSTRATE_AUTHORIZED_TOPOLOGY_EXHAUSTED
```

## 3. Exact implementation boundary

The implementation allowlist is exactly:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
tests/ewf-measurement-executor.test.mjs
```

No fourth substrate implementation path exists.

Explicitly forbidden implementation mutations:

```text
package.json
package-lock.json
src/**
all tests/** except tests/ewf-measurement-executor.test.mjs
canonical status/governance docs
existing CI workflows
deployment configuration
dependency declarations
Pilot B or LI product implementation
```

The later one-file carrier under
`docs/superpowers/measurement-requests/**` is separately classified as a
demonstration/evidence request carrier, not implementation code.

If implementation cannot fit the exact three paths, or requires package/dependency
editing, repository-write credentials, provider secrets, paid external services,
or workflow permission expansion:

```text
STOP
SUBSTRATE_IMPLEMENTATION_BOUNDARY_INSUFFICIENT
```

## 4. Frozen implementation topology

The only authorized topology is:

```text
S0 — fresh governance / predecessor / writer / collision check
A  — TEST / FIXTURE FIRST
B  — EXECUTOR + WORKFLOW IMPLEMENTATION
R  — SUBSTRATE_ACCEPTANCE_TEST REQUEST
E  — IMPLEMENTATION EVIDENCE / FROZEN HANDOFF
STOP — INDEPENDENT IMPLEMENTATION AUDIT
```

There is no undefined remediation commit.

### S0 — no commit

Before the first write, prove:

1. `main == f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e`;
2. the implementation branch has no conflicting history;
3. there is no writer/path/semantic collision;
4. package/dependency files remain excluded;
5. the exact accepted authorization head/verdict are read back;
6. accepted substrate spec revision remains
   `1d0077a8b90ab58a025fff510dde3fd2cda7bc9a`;
7. ADR-047 has not been superseded.

### A — test/fixture first

Commit A changes exactly:

```text
tests/ewf-measurement-executor.test.mjs
```

Commit message:

```text
test: define EWF measurement substrate acceptance contract
```

A MUST contain executable/replayable coverage for every `EWF00-ME-01..22`
requirement and every negative fixture in Section 10. Before B exists, those
tests MUST fail for the expected missing executor/workflow contract rather than
pass by source inspection.

Immediately after A, open exactly one **Draft** implementation PR from
`chatgpt/ewf00-measure-exec-001-implementation-v1` to `main`. Its natural
`pull_request / opened` broad repository CI is the TDD RED carrier. No
Ready/reopen/rerun/no-op event may substitute.

### B — executor + workflow implementation

Commit B is the direct child of A and changes exactly:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
```

It MUST NOT weaken/edit the A test file.

Commit message:

```text
feat: implement EWF measurement execution substrate
```

The resulting exact SHA is frozen at formation as:

```text
candidateToolingRevision = exact Commit B SHA
```

Its tree therefore contains all three authorized substrate paths. Existing
broad PR CI must naturally run on B through `synchronize`.

### R — one demonstration request carrier

Commit R is the direct child of B and changes exactly one path matching Section
7. It edits none of the three implementation files.

Commit message:

```text
docs: request EWF measurement substrate acceptance test
```

R is the exact request head:

```text
requestPR      = the one Draft implementation PR number
requestHeadSha = exact Commit R SHA from github.event.pull_request.head.sha
requestCommit  = exact Commit R SHA
```

The R `pull_request / synchronize` event is the natural dedicated
`SUBSTRATE_ACCEPTANCE_TEST` event. No `GITHUB_SHA` merge ref may substitute.

### E — no repository commit

E consists only of:

1. the immutable Actions artifact from Section 13/14; and
2. one top-level Draft-PR comment beginning
   `EWF00_MEASURE_EXEC_001_IMPLEMENTATION_HANDOFF_V1`.

The handoff binds the GitHub-assigned run/job/artifact identities and exact
subjects. It is `SUBSTRATE_IMPLEMENTATION_EVIDENCE / NOT_ACCEPTANCE`.

No Commit D/E evidence commit is authorized. Any unexpected need for another
repository commit is:

```text
STOP
SUBSTRATE_AUTHORIZED_TOPOLOGY_EXHAUSTED
```

## 5. TDD / normative implementation-test contract

The A test file MUST exercise behavior, not merely grep source. It MUST cover
the complete accepted namespace:

| Requirement | Mandatory executable/replayable proof |
|---|---|
| `EWF00-ME-01` | immutable purpose separation and non-reclassifiability |
| `EWF00-ME-02` | SAT candidate + accepted auth/spec + disposable subject + fixture binding |
| `EWF00-ME-03` | real Pilot rejects unaccepted tooling |
| `EWF00-ME-04` | natural opened/synchronize request mechanics; no event tricks |
| `EWF00-ME-05` | exact request PR/head/commit and synchronize supersession |
| `EWF00-ME-06` | exact read-only workflow permissions and no workflow comment mutation |
| `EWF00-ME-07` | both checkouts credential-free; allowlisted child environment |
| `EWF00-ME-08` | exact external command authority; `UNAUTHORIZED_COMMAND` before process |
| `EWF00-ME-09` | exact ordered eight-command LI declaration fixture |
| `EWF00-ME-10` | five command states, stdout/stderr/digests, monotonic timing, no retry |
| `EWF00-ME-11` | no remote mutation/paid provider; exact lockfile behavior; product immutability |
| `EWF00-ME-12` | controlled fingerprint vs host diagnostics split |
| `EWF00-ME-13` | `executionContainerDigest=NOT_SELECTED`; no invented digest |
| `EWF00-ME-14` | contemporaneous operation-comment journal ingestion |
| `EWF00-ME-15` | edited/deleted/missing journal rejection |
| `EWF00-ME-16` | journal-seal validation and timeout |
| `EWF00-ME-17` | operation/seal posting excluded from manual-operation counts |
| `EWF00-ME-18` | baseline-before-A gate using immutable synthetic git topology |
| `EWF00-ME-19` | all eight metric families and zero-vs-missing semantics |
| `EWF00-ME-20` | controlled pair + exact authorized product delta; host-only drift allowed |
| `EWF00-ME-21` | raw run/job/artifact/request/authority/journal/dataset digest binding |
| `EWF00-ME-22` | no product/Pilot/EWF acceptance/status/Ready/merge/deploy authority |

### 5.1 Purpose and request identity

Tests prove:

- `SUBSTRATE_ACCEPTANCE_TEST` may test an unaccepted candidate only when this
  authorization has an independent exact-head ACCEPT;
- SAT evidence cannot satisfy `baselineDatasetDigest` or
  `assistedDatasetDigest` and cannot be copied/relabelled as Pilot evidence;
- `PILOT_MEASUREMENT` rejects unaccepted candidate tooling;
- all Git identities used as subjects are exact 40-hex SHAs;
- `requestHeadSha` comes from `github.event.pull_request.head.sha`;
- `requestCommit == requestHeadSha`;
- wrong/mutable/merge-ref identities fail before product process;
- after successful evidence, head movement yields exactly
  `REQUEST_SUPERSEDED / INVALID_FOR_PAIR`;
- the old identity cannot execute product commands again;
- final independent audit MUST prove
  `current request PR head == evidence requestHeadSha`; a historical green run
  is invalid when that equality fails.

### 5.2 Exact command authority and five-state execution

The implementation resolves external authority before spawning any product
process. Any extra/replaced/reordered declaration or changed `cwd`, `required`,
`requirements`, `timeoutMs`, or `explicitEnvironment` is
`UNAUTHORIZED_COMMAND` before product process.

Command results are exactly:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

No retry or coercion. Timeout/crash is `ERROR`; missing required binary is
`NOT_AVAILABLE`; declaration blocked by a required predecessor is `NOT_RUN`.

### 5.3 Baseline temporal and controlled-pair predicates

These are tested only with an immutable **synthetic temporary git topology**;
the SAT does not produce real Pilot evidence.

The fixture generator creates, under `RUNNER_TEMP`, a temporary repository with
these logical immutable subjects:

```text
SYN_BASELINE — frozen baseline subject
SYN_A        — direct child of SYN_BASELINE
SYN_ASSISTED — authorized controlled child/descendant containing only frozen allowed paths
SYN_BAD      — otherwise equivalent subject containing one unauthorized product path
```

The test fabricates immutable raw baseline evidence bound to `SYN_BASELINE`
**before** forming `SYN_A`, then proves:

```text
Commit-A parent == frozen baselineSubject
baseline run/artifact/datasetDigest/request identity/sealed journal exist first
```

A post-A, retrospective, backfilled, SAT-domain, or wrong-parent baseline is
invalid. `SYN_BAD` must produce `COMPARABILITY_INVALID`.

Comparability is exactly:

```text
same controlled context
+ same exact external ordered commands
+ same measurement method/schema/raw format
+ exact authorized product delta
+ no unrelated product drift
+ current request heads equal evidence heads
+ valid sealed journals
```

A `HOST_DIAGNOSTICS`-only difference does not invalidate the pair.

### 5.4 Eight canonical metric families and metric-result semantics

Exact metric order and units frozen for fixtures:

| `metricId` | Unit |
|---|---|
| `focusedDuration` | integer milliseconds |
| `prDuration` | integer milliseconds |
| `preflightOverhead` | integer milliseconds |
| `artifactPreparation` | integer milliseconds |
| `validatorOverhead` | integer milliseconds |
| `manualOperations` | integer operation count |
| `reworkFindingLoop` | integer round count |
| `cliAbsentFriction` | integer operation count |

Observation fields are exactly:

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

Metric result states are exactly:

```text
OBSERVED
OBSERVED_ZERO
NOT_RUN
NOT_AVAILABLE
NOT_APPLICABLE
UNKNOWN
```

`OBSERVED` has numeric value. `OBSERVED_ZERO` has exact numeric `0` and is valid
only when the frozen method/raw evidence genuinely observe absence.
`NOT_RUN`, `NOT_AVAILABLE`, `NOT_APPLICABLE`, and `UNKNOWN` have `value=null`.
Zero MUST never stand for missing/unavailable/unrun/unknown/inapplicable.

### 5.5 Raw artifacts and product immutability

Tests verify deterministic members/digests for:

```text
environment.json
command-results.json
measurement-observations.json
operation-journal.json
artifact-manifest.json
commands/<ordinal>-<commandId>.stdout.txt
commands/<ordinal>-<commandId>.stderr.txt
datasetDigest
```

Before and after the command set:

```text
git rev-parse HEAD == requested exact product SHA
git diff --quiet
git diff --cached --quiet
```

Tracked-file mutation invalidates evidence.

## 6. Exact workflow contract

The new workflow path is exactly:

```text
.github/workflows/ewf-measurement.yml
```

Trigger:

```yaml
pull_request:
  branches: [main]
  types:
    - opened
    - synchronize
  paths:
    - docs/superpowers/measurement-requests/**
```

Permissions exactly:

```yaml
permissions:
  contents: read
  pull-requests: read
```

No workflow-write permission, comment creation, workflow dispatch, schedule,
rerun dependency, Ready/reopen trigger or no-op trigger.

The workflow MUST use:

```text
github.event.pull_request.head.sha
```

for exact request-head identity. It MUST NOT treat `GITHUB_SHA`/merge-ref as the
request/product subject.

Separate exact checkouts:

```text
$RUNNER_TEMP/ewf-tooling -> candidateToolingRevision for SAT;
                           acceptedMeasurementToolingRevision for Pilot
$RUNNER_TEMP/product     -> exact disposable/Pilot product SHA
```

Both use:

```yaml
persist-credentials: false
```

The executor is loaded only from the tooling checkout and commands run only in
authorized cwd rooted in the product checkout.

## 7. Demonstration request carrier

### 7.1 Exact naming rule

Exactly one file:

```text
docs/superpowers/measurement-requests/ewf00-measure-exec-001-auth-001-sat-001-<candidateToolingRevision>.json
```

`<candidateToolingRevision>` is the full lowercase 40-hex B SHA. No sibling
request/fixture file or rename is authorized.

### 7.2 Exact request delta and parent

The request commit is R:

```text
parent = candidateToolingRevision / B
changed paths = exactly the one request file above
Draft PR = the one implementation PR opened after A
requestHeadSha = requestCommit = exact R
```

The request binds:

```text
schemaVersion = EWF00_MEASURE_EXEC_REQUEST_V1
requestPurpose = SUBSTRATE_ACCEPTANCE_TEST
attemptId = EWF00-MEASURE-EXEC-001-SAT-001
candidateToolingRevision = exact B
substrateImplementationAuthorization = EWF00-MEASURE-EXEC-001-AUTH-001
substrateImplementationAuthorizationSubject = exact independently accepted authorization head
substrateImplementationAuthorizationVerdictCommentId = exact independent ACCEPT comment
substrateSpecRevision = 1d0077a8b90ab58a025fff510dde3fd2cda7bc9a
syntheticOrDisposableProductSubject = f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
acceptanceFixtureManifestDigest = a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d
evidenceAuthority = SUBSTRATE_IMPLEMENTATION_EVIDENCE / NOT_ACCEPTANCE
```

These fields MUST be absent:

```text
measurementPhase
baselineDatasetDigest
assistedDatasetDigest
Pilot B evidence
package acceptance
```

The product SHA is classified for this SAT only as:

```text
DISPOSABLE_READ_ONLY_ACCEPTANCE_SUBJECT
```

The SAT executes only frozen synthetic commands that do not depend on real
product behavior. It MUST NOT execute the LI eight-command set or a real
Pilot/LI subject.

### 7.3 Retention

R is retained unchanged through independent implementation audit and any later
separately authorized integration. This capsule authorizes no cleanup/delete
commit. Retention cannot turn SAT evidence into Pilot evidence.

## 8. SAT fixture manifest and command authority

Fixture revision:

```text
EWF00-MEASURE-EXEC-001-AUTH-001-SAT-FIXTURE-V2
```

Canonicalization:

```text
UTF-8 JSON
recursively lexicographically sorted object keys
array order preserved
no insignificant whitespace
```

Canonical SHA-256:

```text
a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d
```

The complete canonical manifest is the following single-line JSON object:

```json
{"canonicalization":"UTF8_JSON_RECURSIVE_LEXICOGRAPHIC_KEYS_ARRAY_ORDER_PRESERVED_NO_INSIGNIFICANT_WHITESPACE","disposableProductSubject":"f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e","fixtureRevision":"EWF00-MEASURE-EXEC-001-AUTH-001-SAT-FIXTURE-V2","liDeclarationFixture":{"commands":["node --test tests/li-00-execution-safety.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs","node --check src/learning-contracts.js","node --check src/today-runner.js","node --check tests/li-00-execution-safety.test.mjs","npm run test:p1-contracts","npm run test:p1-runner","npm run test:backup","npm run test:restore"],"mode":"AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN"},"metricFixture":{"metricOrder":["focusedDuration","prDuration","preflightOverhead","artifactPreparation","validatorOverhead","manualOperations","reworkFindingLoop","cliAbsentFriction"],"resultStates":["OBSERVED","OBSERVED_ZERO","NOT_RUN","NOT_AVAILABLE","NOT_APPLICABLE","UNKNOWN"],"units":["milliseconds","milliseconds","milliseconds","milliseconds","milliseconds","operation_count","round_count","operation_count"],"zeroRule":"OBSERVED_ZERO_REQUIRES_NUMERIC_0_AND_RAW_PROOF; NON_OBSERVED_STATES_REQUIRE_NULL"},"negativeFixtureIds":["ME-N01","ME-N02","ME-N03","ME-N04","ME-N05","ME-N06","ME-N07","ME-N08","ME-N09","ME-N10","ME-N11","ME-N12","ME-N13","ME-N14","ME-N15","ME-N16","ME-N17","ME-N18","ME-N19","ME-N20","ME-N21","ME-N22","ME-N23","ME-N24","ME-N25","ME-N26","ME-N27","ME-N28","ME-N29","ME-N30","ME-N31","ME-N32","ME-N33","ME-N34","ME-N35","ME-N36","ME-N37","ME-N38","ME-N39","ME-N40","ME-N41","ME-N42","ME-N43","ME-N44","ME-N45","ME-N46"],"runtimeCases":[{"caseId":"SAT-PASS","declarations":[{"command":"node -e \"process.stdout.write('EWF_SUBSTRATE_PASS\\\\n')\"","commandId":"sat-pass-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"PASS"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-pass-1","errorClass":null,"exitCode":0,"result":"PASS"}]},{"caseId":"SAT-FAIL","declarations":[{"command":"node -e \"process.stderr.write('EWF_SUBSTRATE_FAIL\\\\n'); process.exit(7)\"","commandId":"sat-fail-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"FAIL"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-fail-1","errorClass":null,"exitCode":7,"result":"FAIL"}]},{"caseId":"SAT-ERROR-TIMEOUT","declarations":[{"command":"node -e \"setTimeout(() => {}, 10000)\"","commandId":"sat-timeout-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"TIMEOUT"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":100}],"expected":[{"commandId":"sat-timeout-1","errorClass":"TIMEOUT","exitCode":null,"result":"ERROR"}]},{"caseId":"SAT-ERROR-CRASH","declarations":[{"command":"node -e \"process.abort()\"","commandId":"sat-crash-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"CRASH"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-crash-1","errorClass":"PROCESS_CRASH","exitCode":null,"result":"ERROR"}]},{"caseId":"SAT-NOT-AVAILABLE","declarations":[{"command":"ewf-substrate-missing-binary-001 --version","commandId":"sat-na-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"NOT_AVAILABLE"},"ordinal":1,"required":true,"requirements":["binary:ewf-substrate-missing-binary-001"],"timeoutMs":5000}],"expected":[{"commandId":"sat-na-1","errorClass":"MISSING_BINARY","exitCode":null,"result":"NOT_AVAILABLE"}]},{"caseId":"SAT-NOT-RUN","declarations":[{"command":"ewf-substrate-missing-binary-002 --version","commandId":"sat-blocker-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"NOT_RUN"},"ordinal":1,"required":true,"requirements":["binary:ewf-substrate-missing-binary-002"],"timeoutMs":5000},{"command":"node -e \"process.stdout.write('MUST_NOT_EXECUTE\\\\n')\"","commandId":"sat-not-run-2","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"NOT_RUN"},"ordinal":2,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-blocker-1","errorClass":"MISSING_BINARY","exitCode":null,"result":"NOT_AVAILABLE"},{"commandId":"sat-not-run-2","errorClass":"BLOCKED_BY_REQUIRED_PREDECESSOR","exitCode":null,"result":"NOT_RUN"}]},{"caseId":"SAT-CREDENTIAL-ABSENCE","declarations":[{"command":"node -e \"const d=['GITHUB_TOKEN','GH_TOKEN','GITHUB_PAT','NODE_AUTH_TOKEN','NPM_TOKEN','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','GOOGLE_APPLICATION_CREDENTIALS','GEMINI_API_KEY','OPENAI_API_KEY','ANTHROPIC_API_KEY']; const x=d.filter(k=>process.env[k]); if(x.length){process.stderr.write(x.join(',')+'\\\\n'); process.exit(9)} process.stdout.write('NO_FORBIDDEN_CREDENTIALS\\\\n')\"","commandId":"sat-cred-1","cwd":".","explicitEnvironment":{"EWF_ACCEPTANCE_CASE":"CREDENTIAL_ABSENCE"},"ordinal":1,"required":true,"requirements":["node==22.22.3"],"timeoutMs":5000}],"expected":[{"commandId":"sat-cred-1","errorClass":null,"exitCode":0,"result":"PASS"}]}],"shellPolicy":"bash --noprofile --norc -eo pipefail -c"}
```

The runtime declarations above are the **only** SAT process-spawn authority.
The exact eight LI declarations are carried only as
`AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN` to test exact declaration
identity/order; this authorization does not execute LI or Pilot B.

A request/candidate cannot extend this manifest. Manifest integrity does not
self-grant authority: it is usable only after independent exact-head acceptance
of this authorization.

For future `PILOT_MEASUREMENT`, command authority must come from that Pilot's
separately accepted external execution authorization binding at least:

```text
executionAuthorizationIdentity
executionAuthorizationSubject
executionAuthorizationVerdictCommentId
canonicalSpecRevision
verificationManifestDigest
commandDeclarationIds
commandManifestDigest
acceptedMeasurementToolingRevision
productSubject
measurementPairId
attemptId
measurementPhase
```

Requested declarations must exactly equal the accepted ordered declarations
before any product process. Otherwise:

```text
UNAUTHORIZED_COMMAND
```

with zero product-command execution.

## 9. Process security and dependency materialization

Child processes MUST NOT blindly inherit `process.env`.

Child-environment policy:

```text
EWF00-MEASURE-EXEC-001-AUTH-001-CHILD-ENV-V1
```

Allowed inherited keys only:

```text
PATH
HOME
RUNNER_TEMP
TMPDIR
```

Executor-set controlled values:

```text
CI=true
TZ=UTC
LANG=C.UTF-8
LC_ALL=C.UTF-8
```

Only externally accepted declaration `explicitEnvironment` keys may be added.

Always denied from child processes, whether present upstream or not:

```text
GITHUB_TOKEN
GH_TOKEN
GITHUB_PAT
NODE_AUTH_TOKEN
NPM_TOKEN
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
GOOGLE_APPLICATION_CREDENTIALS
GEMINI_API_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
repository write credentials
provider credentials
unrelated secrets
```

This substrate grants no command authority to push/update refs, publish, deploy,
call paid providers, or mutate remote repository state.

Fresh package metadata at the predecessor shows an existing lockfile v3 and
Node engine `>=20.19`. The SAT fixture uses Node built-ins only:

```text
SAT dependency materialization = NOT_REQUIRED
```

Existing broad CI may continue its already-defined:

```text
npm ci --no-audit --no-fund
```

If a future separately accepted Pilot authority requires package
materialization, that exact existing command is the only pre-frozen install form:
it must consume the existing lockfile, update no dependency and mutate no
tracked package file.

## 10. Executable/replayable negative fixtures

Commit A MUST implement every row as executable/replayable behavior. Narrative
claims are invalid.

| Fixture | Defect/case | Required outcome |
|---|---|---|
| `ME-N01` | wrong requestPurpose | `reject before product process` |
| `ME-N02` | unaccepted tooling used for PILOT_MEASUREMENT | `reject before product process` |
| `ME-N03` | real Pilot/LI subject in SUBSTRATE_ACCEPTANCE_TEST | `reject purpose/subject mismatch` |
| `ME-N04` | mutable/non-40-hex Git identity or merge-ref | `reject immutable identity` |
| `ME-N05` | request head mismatch | `reject before product process` |
| `ME-N06` | head synchronize after successful dataset | `REQUEST_SUPERSEDED / INVALID_FOR_PAIR; old identity cannot execute` |
| `ME-N07` | request parent != candidateToolingRevision | `reject candidate bootstrap` |
| `ME-N08` | request commit changes extra request path | `reject request boundary` |
| `ME-N09` | candidate contains fourth implementation path | `reject implementation boundary` |
| `ME-N10` | workflow/executor digest mismatch | `reject tooling identity` |
| `ME-N11` | missing external command authority | `reject; zero product process` |
| `ME-N12` | extra command | `UNAUTHORIZED_COMMAND; zero product process` |
| `ME-N13` | reordered command | `UNAUTHORIZED_COMMAND; zero product process` |
| `ME-N14` | changed cwd | `UNAUTHORIZED_COMMAND; zero product process` |
| `ME-N15` | changed timeout | `UNAUTHORIZED_COMMAND; zero product process` |
| `ME-N16` | changed explicit environment/required/requirements | `UNAUTHORIZED_COMMAND; zero product process` |
| `ME-N17` | credential leakage into child | `security failure; no valid evidence` |
| `ME-N18` | tracked product mutation / SHA movement | `product immutability failure` |
| `ME-N19` | synthetic success | `exact PASS` |
| `ME-N20` | synthetic non-zero product/test failure | `exact FAIL` |
| `ME-N21` | timeout or crash | `exact ERROR with typed errorClass` |
| `ME-N22` | blocked later declaration | `exact NOT_RUN` |
| `ME-N23` | required executable absent | `exact NOT_AVAILABLE` |
| `ME-N24` | edited qualifying operation comment | `journal invalid` |
| `ME-N25` | deleted/missing journal row | `journal invalid; no reconstruction` |
| `ME-N26` | wrong journal digest | `journal/seal invalid` |
| `ME-N27` | missing seal at timeout | `dataset invalid; no fabricated journal` |
| `ME-N28` | edited seal | `seal invalid` |
| `ME-N29` | seal bound to wrong request head | `seal invalid` |
| `ME-N30` | controlled environment mismatch | `controlled pair invalid` |
| `ME-N31` | host-diagnostics-only drift | `does NOT invalidate pair` |
| `ME-N32` | raw artifact member/digest mismatch | `evidence invalid` |
| `ME-N33` | SAT artifact supplied as Pilot artifact | `reject non-reclassifiable evidence domain` |
| `ME-N34` | eight-command LI fixture changed/reordered/broadened | `exactness failure; no real LI execution` |
| `ME-N35` | request self-declares unaccepted command | `UNAUTHORIZED_COMMAND; zero product process` |
| `ME-N36` | blind process.env inheritance exposes secret | `security failure` |
| `ME-N37` | workflow permissions exceed exact read-only contract | `implementation acceptance failure` |
| `ME-N38` | product checkout persist-credentials != false | `implementation acceptance failure` |
| `ME-N39` | tooling checkout persist-credentials != false | `implementation acceptance failure` |
| `ME-N40` | synthetic baseline is produced after synthetic Commit A / A parent != frozen baseline | `baseline temporal gate invalid` |
| `ME-N41` | controlled synthetic assisted delta includes unauthorized product path | `COMPARABILITY_INVALID` |
| `ME-N42` | true zero encoded as missing, or missing encoded as numeric zero | `metric-state/schema failure` |
| `ME-N43` | any of eight canonical metric IDs/order/unit/calculation bindings omitted/extra/reordered | `metric-schema failure` |
| `ME-N44` | final audit current request PR head != evidence requestHeadSha | `dataset invalid even if historical run green` |
| `ME-N45` | wrong substrate authorization subject/verdict or substrateSpecRevision | `reject before product process` |
| `ME-N46` | pair differs in controlled method/commands/raw format or authorized delta but claims COMPARABLE | `COMPARABILITY_INVALID` |

## 11. Journal writer model and lifecycle

The workflow is read-only and never creates/edits comments.

For the SAT only, the authorized fixture-comment poster is exactly:

```text
chatgpt-github-ewf-measurement-substrate-writer
through the GitHub connector
under independently accepted EWF00-MEASURE-EXEC-001-AUTH-001
```

This grants evidence-fixture posting authority only, not Independent Audit or
Pilot operation authority.

R uses exactly two synthetic operation comments and then one seal, all on the
same Draft implementation PR and exact R head.

Operation marker:

```text
EWF_MEASUREMENT_OPERATION_V1
```

Synthetic rows:

```text
sat-op-001
operationCategory = preflightOperation
action = synthetic acceptance preflight marker

sat-op-002
operationCategory = artifactPreparationOperation
action = synthetic acceptance artifact marker
```

Each binds at least request purpose, attempt, request PR/head, actor role
`SUBSTRATE_ACCEPTANCE_FIXTURE_OPERATOR`, operation-definition revision
`EWF00-MEASURE-EXEC-001-AUTH-001-SAT-OPDEF-V1`, action ID/category/action,
start/end timestamps and evidenceRef.

Deterministic journal order:

```text
createdAt ascending
then numeric commentId ascending
```

Each row binds exact `commentId`, `createdAt`, `updatedAt`, exact-body SHA-256,
actor and ordered position. Edited (`updatedAt != createdAt`), missing or deleted
qualifying rows are invalid and cannot be reconstructed.

Seal marker:

```text
EWF_MEASUREMENT_JOURNAL_SEAL_V1
```

The seal binds exact R, ordered IDs/body digests, operation-definition revision,
observation window and `journalDigest`. The seal itself must be unedited.

Bounded read-only wait:

```text
sealAwaitWindowMs = 300000
sealPollIntervalMs = 5000
```

The R workflow may poll comments while waiting; it never retries product
commands. Missing/invalid seal at timeout invalidates the dataset. Posting
operation/seal comments is evidence-capture plumbing and counts as zero
`manualOperation` rows.

Future real Pilot journal actors/semantics require a separately accepted Pilot
authorization. This authorization pre-authorizes no Pilot operation.

## 12. Environment model

Container decision is final for this authorization:

```text
executionContainerDigest = NOT_SELECTED
```

Controlled execution:

```text
runnerFamily = ubuntu-24.04
nodeVersion = 22.22.3
npmVersion = 10.9.8
shellPolicy = bash --noprofile --norc -eo pipefail -c
clockMethod = process.hrtime.bigint()
childEnvironmentPolicy = EWF00-MEASURE-EXEC-001-AUTH-001-CHILD-ENV-V1
```

`CONTROLLED_ENVIRONMENT_FINGERPRINT` binds controlled/frozen semantics,
including as applicable:

```text
candidateToolingRevision or acceptedMeasurementToolingRevision
workflowContentDigest
executorContentDigest
substrateSpecRevision
authorization identity + exact accepted subject
requestPurpose
acceptanceFixtureManifestDigest
measurementSchemaRevision
measurementMethodRevision
rawEvidenceFormatRevision
commandManifestDigest
cwd policy
explicit environment
environment inheritance policy
timeout policy
clock method
operationDefinitionRevision
metricCalculationRevision
executionContainerDigest = NOT_SELECTED
```

Controlled mismatch invalidates evidence/pair.

`HOST_DIAGNOSTICS` records but does not equality-gate:

```text
GitHub hosted image name/version/build
runner binary/instance identity
kernel/build metadata
uncontrolled host patch/architecture details
```

A host-diagnostics-only difference does **not** invalidate a pair. Hosted runner
image revision equality is explicitly not required.

## 13. Raw artifacts and deterministic digest

Dedicated SAT artifact name:

```text
ewf00-measure-exec-001-sat-001-<requestHeadSha>
```

Root:

```text
ewf-measurement-evidence/
```

Required raw members:

```text
environment.json
command-results.json
measurement-observations.json
operation-journal.json
artifact-manifest.json
commands/<ordinal>-<commandId>.stdout.txt
commands/<ordinal>-<commandId>.stderr.txt
```

`artifact-manifest.json` lists SHA-256 for every other member in deterministic
lexicographic path order and computes canonical `datasetDigest`. It does not
recursively count itself.

SAT observations/artifacts MUST NOT contain Pilot baseline/assisted digest
fields and always carry:

```text
SUBSTRATE_IMPLEMENTATION_EVIDENCE / NOT_ACCEPTANCE
```

Raw member/body/dataset digest mismatch invalidates the evidence.

## 14. EWF implementation evidence / trace / brief handoff

The same immutable Actions artifact also contains:

```text
ewf-measurement-evidence/implementation-evidence.json
ewf-measurement-evidence/verification-manifest.json
ewf-measurement-evidence/trace-manifest.json
ewf-measurement-evidence/frozen-acceptance-brief.json
```

Using existing canonical EWF contracts where applicable:

- `verification-manifest.json` binds every `EWF00-ME-01..22` test/command/result
  and evidence reference;
- `trace-manifest.json` mechanically binds
  `requirement -> test -> command -> evidence`;
- `frozen-acceptance-brief.json` binds subject/parent/spec/auth/allowlist,
  trace digest and dataset/evidence digest, without a verdict;
- `implementation-evidence.json` is implementer evidence only.

Artifact + handoff comment bind at least:

```text
implementationSubject = candidateToolingRevision / exact B
implementationParent = exact A
implementationPredecessor = f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
substrateSpecRevision = 1d0077a8b90ab58a025fff510dde3fd2cda7bc9a
authorizationIdentity = EWF00-MEASURE-EXEC-001-AUTH-001
authorizationExactSubject = exact independently accepted authorization PR head
authorizationVerdictCommentId = exact independent ACCEPT comment
testCommit = exact A
testIdentities = EWF00-ME-01..22 plus ME-N01..ME-N46
testBlob = tests/ewf-measurement-executor.test.mjs blob at B
workflowBlob = .github/workflows/ewf-measurement.yml blob at B
executorBlob = scripts/ewf-measurement-executor.mjs blob at B
requestPR
requestHeadSha = exact R
requestCommit = exact R
candidateToolingRevision = exact B
syntheticOrDisposableProductSubject = f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
acceptanceFixtureManifestDigest = a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d
natural SAT workflowRunId / workflowRunAttempt
jobId
artifactId / artifactName / GitHub artifact digest when exposed
controlledEnvironmentFingerprint
hostDiagnostics
journal sealCommentId / journalDigest
commandManifestDigest
datasetDigest
exact changed paths/blobs from predecessor through B
exact one-file request delta from B through R
```

Existing broad CI cannot substitute for the dedicated R SAT workflow/artifact.

## 15. Natural SAT chronology

The chronology is mechanically frozen:

```text
predecessor f0080ca8...
  -> A: test only
     -> open one Draft implementation PR (natural broad CI RED)
        -> B: workflow + executor; tests unchanged
           -> natural synchronize broad CI
           -> candidateToolingRevision = B
              -> R: exactly one request file, parent B
                 -> natural synchronize dedicated ewf-measurement workflow
                    -> synthetic operation comments + seal bound to exact R
                    -> immutable SAT artifact
                    -> E handoff comment; no repo commit
                    -> STOP for Independent Auditor
```

The dedicated workflow present in R is byte-identical to B because R changes
only the request carrier. Before product process it checks that workflow and
executor content digests match exact B and this independently accepted
authorization/spec.

No rerun/dispatch/Ready/reopen/no-op may create or repair SAT evidence.

## 16. Independent implementation acceptance gate

After E the writer stops.

The Independent Auditor fresh-reads:

- exact accepted authorization subject/verdict;
- predecessor;
- A/B/R commit topology;
- current Draft PR head;
- all three implementation blobs;
- one request carrier;
- broad natural CI and dedicated natural SAT run/job/artifact;
- exact fixture digest;
- operation comments/seal;
- raw artifact/dataset digests;
- verification/trace/brief/evidence;
- handoff comment.

Acceptance requires evidence beyond source inspection, including the full
`EWF00-ME-01..22` and `ME-N01..ME-N46` suite, exact command/security/five-state
behavior, journal integrity, baseline temporal synthetic fixture, controlled
delta, metric zero semantics, environment split, product immutability and final
request-head equality.

The writer cannot post the verdict, mark Ready, merge, execute Pilot B, execute
a real measurement pair, or mutate package status.

## 17. Fail-closed STOP conditions

Stop with no improvisation on:

```text
main/predecessor drift
accepted authorization/spec/verdict drift
writer overlap
unexpected implementation path
implementation requires fourth substrate path
package/dependency edit requirement
workflow permission expansion
need for repository write token
need for provider secret
need for external paid service
request-carrier ambiguity
candidate bootstrap ambiguity
command authority ambiguity
journal lifecycle ambiguity
environment identity ambiguity
natural acceptance-test workflow absent
unexpected workflow identity
unexpected natural CI identity
evidence/artifact/dataset digest mismatch
test weakening
request head mismatch/supersession
candidate parent mismatch
unauthorized controlled product delta
baseline temporal violation
metric schema/zero-semantics violation
tracked product mutation
credential leakage
```

Canonical stop labels:

```text
SUBSTRATE_WRITER_OR_PATH_COLLISION
SUBSTRATE_IMPLEMENTATION_BOUNDARY_INSUFFICIENT
SUBSTRATE_AUTHORIZED_TOPOLOGY_EXHAUSTED
```

A typed diagnostic may accompany a stop but cannot bypass it.

## 18. Non-effects and final authorization handoff

This candidate does not:

- create the substrate implementation branch;
- write any of the three substrate implementation paths;
- create the demonstration request;
- execute SAT or `PILOT_MEASUREMENT`;
- execute Pilot B;
- grant LI-00 acceptance;
- grant EWF-00/package acceptance;
- change canonical status;
- install/update dependencies;
- post an Independent Audit verdict;
- mark this authorization PR Ready;
- merge this authorization PR.

Independent authorization audit must bind its verdict to this exact final Draft
PR head.

Until then:

```text
STATUS:
AUTHORIZATION_PENDING_INDEPENDENT_AUDIT
```
