# EWF00-MEASURE-EXEC-001 — Substrate Implementation Authorization

## Authorization metadata

| Field | Frozen value |
|---|---|
| Authorization identity | `EWF00-MEASURE-EXEC-001-AUTH-001` |
| Authorization role | docs-only substrate implementation authorization candidate |
| Canonical spec | `EWF00-MEASURE-EXEC-001` |
| Accepted spec revision | `1d0077a8b90ab58a025fff510dde3fd2cda7bc9a` |
| Root-repair independent ACCEPT | PR `#38`, comment `5225520686` |
| Root-repair integration merge / implementation predecessor | `f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e` |
| Canonical package | `EWF-00` |
| Package state | `IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED` |
| Implementation writer | `chatgpt-github-ewf-measurement-substrate-writer` |
| Future implementation branch | `chatgpt/ewf00-measure-exec-001-implementation-v1` |
| Future implementation PR | exactly one new Draft PR against `main`; GitHub-assigned number is frozen immediately at OPEN as `requestPR` |
| Execution container digest | `NOT_SELECTED` |
| Controlled runner family | `ubuntu-24.04` |
| Exact Node version | `22.22.3` |
| Exact npm version | `10.9.8` |
| Authorization state | `PENDING_INDEPENDENT_EXACT_HEAD_AUDIT` |

This document authorizes no implementation until its own exact PR head receives
an independent `ACCEPT`. It executes no substrate measurement, Pilot B, LI-00
work, package acceptance, or status transition.

## 1. Canonical authority and activation boundary

This authorization is subordinate to fresh-read canonical authority on
post-root-repair `main`:

- `AGENTS.md`;
- `docs/ROADMAP.md`;
- `docs/IMPLEMENTATION_PLAN.md`;
- `docs/IMPLEMENTATION_STATUS.md`;
- `docs/DECISIONS.md`, especially confirmed ADR-046 and ADR-047;
- `docs/superpowers/specs/2026-08-04-engineering-workflow-foundation-design.md`;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-preflight-verification-trace-spec.md`;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-pilots-measurement-audit-spec.md`;
- `docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-measurement-execution-substrate-spec.md`;
- PR #38 fresh independent ACCEPT comment `5225520686`.

PR #38 is integrated by normal merge commit
`f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e`; its accepted head
`1d0077a8b90ab58a025fff510dde3fd2cda7bc9a` is a direct parent of that merge.
Therefore `CONTROLLED_SUBJECT_PAIR_V1`, `EWF00-MEASURE-EXEC-001`, and ADR-047
are integrated canonical inputs.

ADR-047 opens exactly one narrow measured PMA-12 exception. It does **not**
self-authorize implementation. This document grants implementation authority
only if this exact authorization candidate later receives an independent
exact-head `ACCEPT`.

## 2. Exact implementation predecessor, baseline state, writer and collision rule

Future implementation MUST start from exactly:

```text
implementationPredecessor =
f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
```

At authorization formation, all three substrate paths are verified absent at
that predecessor:

```text
.github/workflows/ewf-measurement.yml
ABSENT

scripts/ewf-measurement-executor.mjs
ABSENT

tests/ewf-measurement-executor.test.mjs
ABSENT
```

Exactly one implementation writer is authorized:

```text
chatgpt-github-ewf-measurement-substrate-writer
```

Fresh open-PR path inspection at authorization formation found no overlap with
the three substrate paths. Before the first implementation write, Stage S0 MUST
repeat predecessor, writer, branch, open-PR, and semantic-overlap checks. Any
new overlap or writer ambiguity is:

```text
STOP
SUBSTRATE_WRITER_OR_PATH_COLLISION
```

Any predecessor drift is:

```text
STOP
SUBSTRATE_AUTHORIZED_TOPOLOGY_EXHAUSTED
```

The writer receives no authority over Pilot B, LI-00 source, canonical package
status, acceptance verdicts, Ready state, merge, deployment, publishing, or
repository policy outside this capsule.

## 3. Exact implementation allowlist and exclusions

ADR-047 and the accepted substrate spec freeze exactly this implementation delta:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
tests/ewf-measurement-executor.test.mjs
```

No fourth substrate implementation path exists.

Explicit implementation exclusions:

```text
package.json
package-lock.json
src/**
tests/** except tests/ewf-measurement-executor.test.mjs
docs/** except the separately classified one-file demonstration request carrier
existing .github/workflows/**
deployment config
dependency declarations
canonical ROADMAP / PLAN / STATUS / DECISIONS
Pilot B or LI implementation/evidence
```

The one demonstration request under
`docs/superpowers/measurement-requests/**` is **not implementation code**. It is
a separately classified evidence/control-plane request carrier described in
Section 7.

If implementation needs any other implementation path, package/dependency
mutation, repository write token, provider secret, paid external service, or
expanded workflow permission:

```text
STOP
SUBSTRATE_IMPLEMENTATION_BOUNDARY_INSUFFICIENT
```

No improvisation is authorized.

## 4. Frozen implementation topology

The complete authorized topology is:

```text
S0 — fresh governance / predecessor / writer / path-collision check
A  — TEST / FIXTURE FIRST
OPEN — create exactly one Draft implementation PR at Commit A
B  — EXECUTOR + WORKFLOW IMPLEMENTATION
R  — SUBSTRATE_ACCEPTANCE_TEST REQUEST
E  — IMPLEMENTATION EVIDENCE / FROZEN HANDOFF (NO REPOSITORY COMMIT)
STOP — INDEPENDENT IMPLEMENTATION AUDIT
```

### S0 — no commit

Required before any write:

1. `main` still equals the authorized predecessor;
2. future branch does not already exist with conflicting history;
3. no active writer/PR overlaps any of the three implementation paths;
4. package/dependency files remain out of scope;
5. accepted authorization subject/verdict are read back exactly;
6. accepted spec revision remains `1d0077a8b90ab58a025fff510dde3fd2cda7bc9a`;
7. no canonical decision has superseded ADR-047.

Failure stops before write.

### Commit A — test/fixture first

Exact changed path:

```text
tests/ewf-measurement-executor.test.mjs
```

Frozen commit message:

```text
test: define EWF measurement substrate acceptance contract
```

Commit A MUST contain the complete executable/replayable fixture and negative matrix from
Sections 5, 9, and 10. It MUST import/invoke the future executor surface and assert
the future workflow contract so that, before B exists, the repository's natural
PR CI fails for the expected missing implementation only.

No executor, workflow, product source, package file, or dependency may be added
in A.

### OPEN — Draft PR at A

Immediately after A, open exactly one Draft PR from:

```text
chatgpt/ewf00-measure-exec-001-implementation-v1
```

to `main`.

The natural `pull_request / opened` CI at exact Commit A is the required TDD RED
carrier. The RED is valid only if failure is attributable to the intentionally
missing substrate executor/workflow contract. An unrelated infrastructure or
product failure is not a valid RED and stops execution.

No Ready/reopen/rerun/no-op trick may substitute for this opened event.

### Commit B — minimal executor + workflow

Direct parent: exact Commit A.

Exact changed paths in B:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
```

The test file MUST NOT be weakened or edited in B.

Frozen commit message:

```text
feat: implement EWF measurement execution substrate
```

Natural PR `synchronize` CI must run on exact B and satisfy the repository's
existing CI. B is the sole tooling implementation subject:

```text
candidateToolingRevision = exact Commit B SHA
```

The implementation subject's direct parent is exact Commit A; the capsule's
approved predecessor remains `f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e`.

### Commit R — one request carrier only

R is the direct child of `candidateToolingRevision`.

Exact changed path: one JSON request file matching Section 7 and no other path.

Frozen commit message:

```text
docs: request EWF measurement substrate acceptance test
```

R MUST NOT edit A/B content. Its `pull_request / synchronize` event is the
natural dedicated substrate-acceptance demonstration. The request dataset binds:

```text
requestPR       = the one Draft implementation PR number
requestHeadSha  = exact Commit R SHA from github.event.pull_request.head.sha
requestCommit   = exact Commit R SHA
```

`GITHUB_SHA`, a merge ref, branch name, tag, or `main` cannot substitute.

Immediately after R becomes the PR head, the authorized SAT fixture operator
posts exactly the two Section 13 synthetic operation comments and then the one
seal comment, all bound to exact R. The natural R workflow may already be
running; it must wait within the frozen seal window and MUST NOT finalize
`operation-journal.json` or the artifact until the seal is present and valid.
This timing is evidence acquisition, not a rerun/retry trigger.

### E — no Commit D and no repository write

After the dedicated run completes, E consists only of:

1. the immutable Actions artifact described in Section 16; and
2. one top-level implementation handoff comment on the Draft implementation PR
   with marker `EWF00_MEASURE_EXEC_001_IMPLEMENTATION_HANDOFF_V1`.

That comment binds run/job/artifact IDs and all exact identities after GitHub
has assigned them. It is implementer evidence only. It cannot contain `ACCEPT`
as an implementation verdict and cannot move the PR head.

No evidence-only repository commit is authorized. Any unexpected need for
another commit is:

```text
STOP
SUBSTRATE_AUTHORIZED_TOPOLOGY_EXHAUSTED
```

## 5. TDD and implementation test contract

`tests/ewf-measurement-executor.test.mjs` MUST provide executable tests, not
source-inspection-only assertions, for every accepted `EWF00-ME-*` requirement.

At minimum it MUST exercise:

### Purpose separation

- `SUBSTRATE_ACCEPTANCE_TEST` accepts candidate tooling only under an accepted
  substrate implementation authorization;
- `PILOT_MEASUREMENT` rejects unaccepted tooling;
- SAT evidence cannot contain or later satisfy `baselineDatasetDigest` or
  `assistedDatasetDigest`;
- SAT evidence cannot be reclassified as Pilot evidence.

### Exact request identity and supersession

- exact 40-hex `requestPR`/`requestHeadSha`/`requestCommit` binding;
- mutable names and merge refs rejected;
- wrong head rejected before product execution;
- `requestCommit != requestHeadSha` rejected;
- successful old dataset becomes
  `REQUEST_SUPERSEDED / INVALID_FOR_PAIR` after synchronize;
- old measurement identity cannot execute another product command.

### External command authority

- exact externally frozen declaration set executes;
- missing authority rejects before product process;
- extra/replaced/reordered command rejects as `UNAUTHORIZED_COMMAND`;
- changed `cwd`, `timeoutMs`, `required`, `requirements`, or
  `explicitEnvironment` rejects before product process;
- broad/inferred substitute command rejects.

### Security

- both exact checkouts use `persist-credentials: false`;
- child environment is constructed from an allowlist and explicit authorized
  fields, never blind `process.env` inheritance;
- child processes receive no `GITHUB_TOKEN`, repository write credential,
  provider credential, package-publish credential, or unrelated secret;
- no command may push/update refs/publish/deploy/call a paid provider/mutate
  remote repository state under this authorization;
- pre/post product tracked-state checks prove exact requested SHA and zero
  tracked-file mutation.

### Five command-result states

Exactly:

```text
PASS
FAIL
ERROR
NOT_RUN
NOT_AVAILABLE
```

Tests MUST include success, non-zero product/test failure, crash, timeout,
missing binary, and blocked-not-run behavior. No retry or coercion is permitted.

### Journal and seal

Tests MUST cover:

```text
EWF_MEASUREMENT_OPERATION_V1
EWF_MEASUREMENT_JOURNAL_SEAL_V1
```

including deterministic `(createdAt, commentId)` ordering, immutable body
digests, edited-entry rejection, deleted/missing-entry rejection, wrong digest,
invalid/edited seal, missing-seal bounded timeout, seal/head binding, and
exclusion of operation/seal posting from manual-operation counts.

### Environment

Tests MUST separate:

```text
CONTROLLED_ENVIRONMENT_FINGERPRINT
HOST_DIAGNOSTICS
```

A controlled mismatch invalidates the controlled dataset/pair. A host-only
diagnostic difference does not.

### Raw evidence

Tests MUST verify deterministic presence/digests for:

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

### Canonical LI declaration fixture without real Pilot execution

The test suite MUST encode the exact eight-command LI declaration set, in this
order, solely as an authority/exactness fixture:

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

Those declarations are part of the acceptance-fixture digest and MUST be
validated for exact identity/order under the disposable SAT authority. Their SAT
mode is `AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN`; this capsule MUST NOT spawn
those eight commands or run them against a real LI/Pilot subject. Executability
of the substrate itself is demonstrated by the synthetic runtime cases in
Section 9, while a later real Pilot authorization must independently freeze the
full executable declaration authority.

Source inspection alone is never sufficient implementation acceptance evidence.

## 6. Exact workflow contract

The new workflow path is exactly:

```text
.github/workflows/ewf-measurement.yml
```

Its trigger and permissions are exactly:

```yaml
pull_request:
  branches: [main]
  types:
    - opened
    - synchronize
  paths:
    - docs/superpowers/measurement-requests/**

permissions:
  contents: read
  pull-requests: read
```

No `workflow_dispatch`, scheduled trigger, workflow write permission, comment
creation, Ready/reopen trigger, rerun dependency, or no-op trigger is allowed.

The implementation MUST use
`github.event.pull_request.head.sha` for request-head identity. It MUST explicitly
check out exact tooling and product SHAs. Both checkouts MUST set:

```yaml
persist-credentials: false
```

The workflow itself is read-only with respect to repository state. Normal
Actions logs/artifacts are permitted evidence side effects.

## 7. Demonstration request carrier and exact chronology

The demonstration request is outside the three-path implementation delta.

### Exact naming rule

The one request path is exactly:

```text
docs/superpowers/measurement-requests/
ewf00-measure-exec-001-auth-001-sat-001-<candidateToolingRevision>.json
```

The actual repository path is the concatenation above with no line break, where
`<candidateToolingRevision>` is the full lowercase 40-hex exact Commit B SHA.

No second request file, sibling fixture file, or request rename is authorized.

### Exact request identity

```text
schemaVersion:
EWF00_MEASURE_EXEC_REQUEST_V1

requestPurpose:
SUBSTRATE_ACCEPTANCE_TEST

attemptId:
EWF00-MEASURE-EXEC-001-SAT-001

candidateToolingRevision:
exact Commit B SHA

substrateImplementationAuthorization:
EWF00-MEASURE-EXEC-001-AUTH-001

substrateImplementationAuthorizationSubject:
exact independently accepted authorization PR head

substrateImplementationAuthorizationVerdictCommentId:
exact future independent ACCEPT comment ID

substrateSpecRevision:
1d0077a8b90ab58a025fff510dde3fd2cda7bc9a

syntheticOrDisposableProductSubject:
f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e

acceptanceFixtureManifestDigest:
5d79f9b3a3f8288c781753c327e40d462bc1c2fa29591b2eaa8aa7da1bc87d87

measurementPhase:
MUST_BE_ABSENT

baselineDatasetDigest:
MUST_BE_ABSENT

assistedDatasetDigest:
MUST_BE_ABSENT

evidenceAuthority:
SUBSTRATE_IMPLEMENTATION_EVIDENCE / NOT_ACCEPTANCE
```

The request commit R changes exactly that one path and has direct parent B.

The Draft implementation PR already exists from Commit A, so:

- `opened` = natural TDD RED at A;
- first `synchronize` = B implementation/CI event;
- second `synchronize` = R request event and dedicated SAT workflow event.

A successful dataset at R is valid only while the current PR head remains R.
Any later head movement invalidates that dataset under the current capsule and
cannot execute the old identity again.

### Retention rule

The request carrier is retained unchanged through independent implementation
audit and any later separately authorized integration. This capsule authorizes
no cleanup/delete commit. Any later retention-policy change requires separate
authority and cannot rewrite historical run/artifact identity.

## 8. Disposable acceptance subject

The SAT product subject is exactly:

```text
f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
```

For this authorization it is classified only as:

```text
DISPOSABLE_READ_ONLY_ACCEPTANCE_SUBJECT
```

It is the post-root-repair predecessor snapshot and is used only from a fresh
temporary checkout for synthetic/non-product commands. It is **not** the PR #35
or PR #37 LI execution subject, not a Pilot baseline/assisted subject, and cannot
receive Pilot/package evidence or status from the SAT.

The SAT synthetic commands do not depend on product behavior and may not modify
tracked files. Any use of a real Pilot/LI subject in SAT is invalid.

## 9. Frozen SAT command authority

For `SUBSTRATE_ACCEPTANCE_TEST`, command authority comes only from this
authorization after independent exact-head acceptance. Candidate source and the
request cannot extend it.

Fixture revision:

```text
EWF00-MEASURE-EXEC-001-AUTH-001-SAT-FIXTURE-V1
```

Canonicalization for the fixture digest is: UTF-8 JSON, recursively
lexicographically sorted object keys, array order preserved, no insignificant
whitespace. SHA-256 of that canonical byte sequence is:

```text
5d79f9b3a3f8288c781753c327e40d462bc1c2fa29591b2eaa8aa7da1bc87d87
```

The complete frozen fixture is:

```json
{
  "fixtureRevision": "EWF00-MEASURE-EXEC-001-AUTH-001-SAT-FIXTURE-V1",
  "shellPolicy": "bash --noprofile --norc -eo pipefail -c",
  "cases": [
    {
      "caseId": "SAT-PASS",
      "commands": [
        {
          "commandId": "sat-pass-1",
          "ordinal": 1,
          "command": "node -e \"process.stdout.write('EWF_SUBSTRATE_PASS\\\\n')\"",
          "cwd": ".",
          "required": true,
          "requirements": [
            "node==22.22.3"
          ],
          "timeoutMs": 5000,
          "explicitEnvironment": {
            "EWF_ACCEPTANCE_CASE": "PASS"
          }
        }
      ],
      "expectedResults": [
        {
          "commandId": "sat-pass-1",
          "result": "PASS",
          "errorClass": null
        }
      ]
    },
    {
      "caseId": "SAT-FAIL",
      "commands": [
        {
          "commandId": "sat-fail-1",
          "ordinal": 1,
          "command": "node -e \"process.stderr.write('EWF_SUBSTRATE_FAIL\\\\n'); process.exit(7)\"",
          "cwd": ".",
          "required": true,
          "requirements": [
            "node==22.22.3"
          ],
          "timeoutMs": 5000,
          "explicitEnvironment": {
            "EWF_ACCEPTANCE_CASE": "FAIL"
          }
        }
      ],
      "expectedResults": [
        {
          "commandId": "sat-fail-1",
          "result": "FAIL",
          "errorClass": null,
          "exitCode": 7
        }
      ]
    },
    {
      "caseId": "SAT-TIMEOUT",
      "commands": [
        {
          "commandId": "sat-timeout-1",
          "ordinal": 1,
          "command": "node -e \"setTimeout(() => {}, 10000)\"",
          "cwd": ".",
          "required": true,
          "requirements": [
            "node==22.22.3"
          ],
          "timeoutMs": 100,
          "explicitEnvironment": {
            "EWF_ACCEPTANCE_CASE": "TIMEOUT"
          }
        }
      ],
      "expectedResults": [
        {
          "commandId": "sat-timeout-1",
          "result": "ERROR",
          "errorClass": "TIMEOUT"
        }
      ]
    },
    {
      "caseId": "SAT-NOT-AVAILABLE",
      "commands": [
        {
          "commandId": "sat-not-available-1",
          "ordinal": 1,
          "command": "ewf-substrate-missing-binary-001 --version",
          "cwd": ".",
          "required": true,
          "requirements": [
            "binary:ewf-substrate-missing-binary-001"
          ],
          "timeoutMs": 5000,
          "explicitEnvironment": {
            "EWF_ACCEPTANCE_CASE": "NOT_AVAILABLE"
          }
        }
      ],
      "expectedResults": [
        {
          "commandId": "sat-not-available-1",
          "result": "NOT_AVAILABLE",
          "errorClass": "MISSING_BINARY"
        }
      ]
    },
    {
      "caseId": "SAT-NOT-RUN",
      "commands": [
        {
          "commandId": "sat-not-run-blocker",
          "ordinal": 1,
          "command": "ewf-substrate-missing-binary-002 --version",
          "cwd": ".",
          "required": true,
          "requirements": [
            "binary:ewf-substrate-missing-binary-002"
          ],
          "timeoutMs": 5000,
          "explicitEnvironment": {
            "EWF_ACCEPTANCE_CASE": "NOT_RUN"
          }
        },
        {
          "commandId": "sat-not-run-2",
          "ordinal": 2,
          "command": "node -e \"process.stdout.write('MUST_NOT_EXECUTE\\\\n')\"",
          "cwd": ".",
          "required": true,
          "requirements": [
            "node==22.22.3"
          ],
          "timeoutMs": 5000,
          "explicitEnvironment": {
            "EWF_ACCEPTANCE_CASE": "NOT_RUN"
          }
        }
      ],
      "expectedResults": [
        {
          "commandId": "sat-not-run-blocker",
          "result": "NOT_AVAILABLE",
          "errorClass": "MISSING_BINARY"
        },
        {
          "commandId": "sat-not-run-2",
          "result": "NOT_RUN",
          "errorClass": "BLOCKED_BY_REQUIRED_PREDECESSOR"
        }
      ]
    },
    {
      "caseId": "SAT-CREDENTIAL-ABSENCE",
      "commands": [
        {
          "commandId": "sat-credential-absence-1",
          "ordinal": 1,
          "command": "node -e \"const deny=['GITHUB_TOKEN','GH_TOKEN','GITHUB_PAT','NODE_AUTH_TOKEN','NPM_TOKEN','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','GOOGLE_APPLICATION_CREDENTIALS','GEMINI_API_KEY','OPENAI_API_KEY','ANTHROPIC_API_KEY']; const leaked=deny.filter((k)=>process.env[k]); if(leaked.length){process.stderr.write(leaked.join(',')+'\\\\n'); process.exit(9);} process.stdout.write('NO_FORBIDDEN_CREDENTIALS\\\\n')\"",
          "cwd": ".",
          "required": true,
          "requirements": [
            "node==22.22.3"
          ],
          "timeoutMs": 5000,
          "explicitEnvironment": {
            "EWF_ACCEPTANCE_CASE": "CREDENTIAL_ABSENCE"
          }
        }
      ],
      "expectedResults": [
        {
          "commandId": "sat-credential-absence-1",
          "result": "PASS",
          "errorClass": null
        }
      ]
    }
  ],
  "executionPolicy": {
    "syntheticCases": "EXECUTE_ON_DISPOSABLE_SUBJECT",
    "liDeclarationFixture": "AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN"
  },
  "liDeclarationFixture": {
    "fixtureId": "EWF00-MEASURE-EXEC-001-AUTH-001-LI-DECLARATIONS-V1",
    "subjectClassification": "DISPOSABLE_READ_ONLY_ACCEPTANCE_SUBJECT",
    "subject": "f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e",
    "execute": false,
    "commands": [
      "node --test tests/li-00-execution-safety.test.mjs tests/learning-contracts.test.mjs tests/today-runner.test.mjs tests/evidence-policy.test.mjs tests/backup-registry.test.mjs tests/restore-safety.test.mjs",
      "node --check src/learning-contracts.js",
      "node --check src/today-runner.js",
      "node --check tests/li-00-execution-safety.test.mjs",
      "npm run test:p1-contracts",
      "npm run test:p1-runner",
      "npm run test:backup",
      "npm run test:restore"
    ],
    "note": "Exact accepted LI declaration/order fixture only; this authorization forbids real LI/Pilot execution."
  }
}
```

The SAT harness treats expected negative command states as successful acceptance
**test vectors** only when the observed state exactly equals the frozen
`expectedResults`. It does not coerce the underlying command result.

Any command/cwd/required/requirements/timeout/environment/order difference from
this fixture is unauthorized.

## 10. Executable negative/replay fixture matrix

Commit A MUST encode all of the following as executable/replayable fixtures.
Narrative-only assertions are invalid.

| Fixture ID | Input defect / case | Required outcome |
|---|---|---|
| `ME-N01` | wrong `requestPurpose` | schema/purpose rejection before product process |
| `ME-N02` | unaccepted tooling with `PILOT_MEASUREMENT` | reject tooling; zero product process |
| `ME-N03` | real Pilot/LI subject in `SUBSTRATE_ACCEPTANCE_TEST` | reject purpose/subject mismatch |
| `ME-N04` | branch/tag/merge-ref/non-40-hex identity | immutable-identity rejection |
| `ME-N05` | request head mismatch | reject before product process |
| `ME-N06` | synchronize after successful evidence | `REQUEST_SUPERSEDED / INVALID_FOR_PAIR`; old identity cannot execute |
| `ME-N07` | request parent is not candidate B | candidate bootstrap rejection |
| `ME-N08` | request commit changes extra path | request-boundary rejection |
| `ME-N09` | candidate implementation has fourth implementation path | implementation-boundary rejection |
| `ME-N10` | workflow or executor digest mismatches candidate authority | tooling-digest rejection |
| `ME-N11` | external command authority missing | authority rejection; zero product process |
| `ME-N12` | extra command | `UNAUTHORIZED_COMMAND`; zero product process |
| `ME-N13` | reordered command | `UNAUTHORIZED_COMMAND`; zero product process |
| `ME-N14` | changed `cwd` | `UNAUTHORIZED_COMMAND`; zero product process |
| `ME-N15` | changed timeout | `UNAUTHORIZED_COMMAND`; zero product process |
| `ME-N16` | changed explicit environment | `UNAUTHORIZED_COMMAND`; zero product process |
| `ME-N17` | credential appears in child environment | security failure; evidence invalid |
| `ME-N18` | product tracked file changes or SHA moves | product-immutability failure |
| `ME-N19` | synthetic success | exact `PASS` |
| `ME-N20` | synthetic exit 7 | exact `FAIL` |
| `ME-N21A` | synthetic timeout | exact `ERROR / TIMEOUT` |
| `ME-N21B` | synthetic child crash | exact `ERROR`; never `FAIL`/`PASS` |
| `ME-N22` | required predecessor blocks later command | exact `NOT_RUN` |
| `ME-N23` | required binary absent | exact `NOT_AVAILABLE` |
| `ME-N24` | qualifying operation comment edited | journal invalid |
| `ME-N25` | journal row deleted/missing | journal invalid; no reconstruction |
| `ME-N26` | wrong journal digest | seal/journal invalid |
| `ME-N27` | no seal within bounded wait | exact timeout/error; no journal fabrication |
| `ME-N28` | edited seal | seal invalid |
| `ME-N29` | seal binds wrong request head | seal invalid |
| `ME-N30` | controlled-environment field differs | controlled dataset/pair invalid |
| `ME-N31` | only host diagnostics differ | remains valid; host drift alone does not invalidate |
| `ME-N32` | raw artifact member or digest changes | artifact/dataset digest mismatch; evidence invalid |
| `ME-N33` | SAT artifact supplied as Pilot baseline/assisted artifact | reject non-reclassifiable evidence domain |
| `ME-N34` | LI eight-command fixture changed/reordered/broadened | exactness failure; no real LI execution |
| `ME-N35` | request self-declares command not in accepted fixture | `UNAUTHORIZED_COMMAND`; zero product process |
| `ME-N36` | child env blindly inherits workflow/provider secret | security failure before valid evidence |
| `ME-N37` | workflow permission exceeds read-only contract | implementation acceptance failure |
| `ME-N38` | product checkout credential persistence enabled | implementation acceptance failure |
| `ME-N39` | tooling checkout credential persistence enabled | implementation acceptance failure |

## 11. Pilot command authority remains external

This authorization does not authorize a real `PILOT_MEASUREMENT`.

A future separately authorized Pilot request MUST bind all of:

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

Before any product process, the executor must read the exact accepted external
authority and prove the requested complete ordered declarations are byte/semantic
equivalent under the canonical declaration shape.

Changed command, order, cwd, timeout, required flag, requirement, or explicit
environment is:

```text
UNAUTHORIZED_COMMAND
```

with zero product-command execution.

The immediate LI eight-command list in Section 5 is an exactness fixture bound
into the SAT fixture digest with `AUTHORITY_EXACTNESS_ONLY_NO_PROCESS_SPAWN`.
This authorization cannot pre-authorize or execute it as a real Pilot profile.

## 12. Process-security and product-immutability contract

Both checkouts use exact SHAs and `persist-credentials: false`.

The child environment policy revision is:

```text
EWF00-MEASURE-EXEC-001-AUTH-001-CHILD-ENV-V1
```

Allowed inherited runtime keys are limited to values required for local process
execution and temp paths:

```text
PATH
HOME
RUNNER_TEMP
TMPDIR
```

The executor then sets these controlled values itself:

```text
CI=true
TZ=UTC
LANG=C.UTF-8
LC_ALL=C.UTF-8
```

Only `explicitEnvironment` keys present in the externally accepted command
declaration may be added.

The following credential classes are always denied from child processes even if
present in the workflow environment:

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

A declaration attempting to add a denied credential is invalid.

Before and after every SAT/Pilot command set the executor must prove:

```text
git rev-parse HEAD == requested product SHA
git diff --quiet
git diff --cached --quiet
```

and must detect tracked-file mutation. Untracked dependency materialization is
allowed only when separately authorized and must never modify tracked package
files.

## 13. Journal writer model and lifecycle

The workflow never creates or edits comments.

For the SAT only, the authorized comment poster is:

```text
chatgpt-github-ewf-measurement-substrate-writer
acting through the GitHub connector under the independently accepted
EWF00-MEASURE-EXEC-001-AUTH-001
```

This role may post only the frozen synthetic operation/seal comments required
for the SAT. It is not an Independent Auditor and receives no acceptance-verdict
authority.

Future real Pilot operation/seal comments are **not** authorized here; the
separately accepted Pilot authorization must own those semantics and actors.

SAT operation definition revision:

```text
EWF00-MEASURE-EXEC-001-AUTH-001-SAT-OPDEF-V1
```

SAT uses exactly two synthetic operation rows:

1. `sat-op-001` — category `preflightOperation`, action
   `synthetic acceptance preflight marker`;
2. `sat-op-002` — category `artifactPreparationOperation`, action
   `synthetic acceptance artifact marker`.

Each is a top-level PR comment starting with:

```text
EWF_MEASUREMENT_OPERATION_V1
```

and binds `requestPurpose`, `attemptId`, `requestPR`, `requestHeadSha`,
`actorRole=SUBSTRATE_ACCEPTANCE_FIXTURE_OPERATOR`, definition revision,
`actionId`, category, action, start and end timestamps.

The workflow orders qualifying operation comments deterministically by:

```text
createdAt ascending
then commentId ascending
```

It records the SHA-256 digest of the exact comment body. Any qualifying comment
with `updatedAt != createdAt`, any missing referenced comment, or any body-digest
mismatch invalidates the journal.

The seal is one later top-level comment starting with:

```text
EWF_MEASUREMENT_JOURNAL_SEAL_V1
```

and binds exact request head, operation-definition revision, ordered comment
IDs/body digests, observation window and `journalDigest`.

Seal wait policy:

```text
sealAwaitWindowMs = 300000
sealPollIntervalMs = 5000
```

The wait is evidence acquisition, not product-command retry. No product command
is retried.

Posting operation/seal comments is evidence-capture plumbing and counts as zero
`manualOperation` rows.

## 14. Environment model

Container execution is not selected:

```text
executionContainerDigest:
NOT_SELECTED
```

The implementation MUST therefore use the accepted controlled-vs-diagnostic
model.

### Controlled environment

```text
runnerFamily = ubuntu-24.04
nodeVersion = 22.22.3
npmVersion = 10.9.8
shellPolicy = bash --noprofile --norc -eo pipefail -c
monotonicClock = process.hrtime.bigint()
childEnvironmentPolicy =
  EWF00-MEASURE-EXEC-001-AUTH-001-CHILD-ENV-V1
```

The `CONTROLLED_ENVIRONMENT_FINGERPRINT` MUST also bind, as applicable:

```text
candidateToolingRevision or acceptedMeasurementToolingRevision
workflowContentDigest
executorContentDigest
substrateSpecRevision
authorization identity + exact subject
requestPurpose
acceptanceFixtureManifestDigest for SAT
measurementSchemaRevision / measurementMethodRevision for Pilot
rawEvidenceFormatRevision
commandManifestDigest
cwd policy
explicit environment
environment inheritance policy
timeout policy
operation definition revision
```

A controlled-field mismatch invalidates the corresponding dataset/pair.

### Host diagnostics

`HOST_DIAGNOSTICS` records but does not equality-gate:

```text
GitHub hosted image name/version/build
runner binary version
runner instance/name
kernel/build metadata
host architecture details not frozen above
other uncontrollable hosted-runner patch metadata
```

Host-diagnostics-only drift does **not** invalidate an otherwise identical
controlled dataset/pair.

## 15. Dependency materialization

Fresh `package.json` and `package-lock.json` show an existing npm project with
lockfile version 3 and Node engine `>=20.19`. No package mutation is authorized.

The SAT fixture in Section 9 uses only Node built-ins and therefore requires:

```text
SAT dependency materialization:
NOT_REQUIRED
```

The repository's existing broad CI may continue to execute its already-defined:

```text
npm ci --no-audit --no-fund
```

For any later accepted Pilot authority that requires product package
materialization, the only pre-authorized existing install form under this
substrate is:

```text
npm ci --no-audit --no-fund
```

and only when that exact materialization step is frozen by the external accepted
execution authority. It must consume the existing exact lockfile, update no
dependency, and change no tracked package file.

## 16. Raw artifact and implementation evidence contract

Dedicated SAT artifact name:

```text
ewf00-measure-exec-001-sat-001-<requestHeadSha>
```

Required artifact root:

```text
ewf-measurement-evidence/
```

Required raw members:

```text
ewf-measurement-evidence/environment.json
ewf-measurement-evidence/command-results.json
ewf-measurement-evidence/measurement-observations.json
ewf-measurement-evidence/operation-journal.json
ewf-measurement-evidence/artifact-manifest.json
ewf-measurement-evidence/commands/<ordinal>-<commandId>.stdout.txt
ewf-measurement-evidence/commands/<ordinal>-<commandId>.stderr.txt
```

Required EWF implementation-evidence members in the same immutable Actions
artifact, using the accepted EWF artifact/brief/trace contracts rather than
creating a second authority:

```text
ewf-measurement-evidence/implementation-evidence.json
ewf-measurement-evidence/verification-manifest.json
ewf-measurement-evidence/trace-manifest.json
ewf-measurement-evidence/frozen-acceptance-brief.json
```

`verification-manifest.json` binds every `EWF00-ME-*` requirement/test/command
identity and exact result/evidence reference. `trace-manifest.json` mechanically
binds `requirement -> test -> command -> evidence`. The frozen brief binds the
exact implementation subject/parent, spec revision, authorization subject,
allowlist/exclusions, trace digest and evidence/dataset digest, but cannot emit
an acceptance verdict. `implementation-evidence.json` is implementer evidence
only.

`artifact-manifest.json` lists SHA-256 for every other member in deterministic
lexicographic path order and computes canonical `datasetDigest`. It cannot
self-count its own digest as a member.

SAT `measurement-observations.json` is acceptance-test evidence only and MUST NOT
contain `measurementPhase`, `baselineDatasetDigest`, `assistedDatasetDigest`, or
Pilot/package acceptance.

The artifact plus E handoff comment MUST bind at least:

```text
implementationSubject = candidateToolingRevision / Commit B
implementationParent = Commit A
implementationPredecessor =
  f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
substrateSpecRevision =
  1d0077a8b90ab58a025fff510dde3fd2cda7bc9a
authorizationIdentity =
  EWF00-MEASURE-EXEC-001-AUTH-001
authorizationExactSubject = exact independently accepted authorization PR head
authorizationVerdictCommentId = exact independent ACCEPT comment
testCommit = Commit A
testIdentities = exact EWF00-ME-* requirement/test mappings plus ME-N01..ME-N39
testBlob = tests/ewf-measurement-executor.test.mjs blob at B
workflowBlob = .github/workflows/ewf-measurement.yml blob at B
executorBlob = scripts/ewf-measurement-executor.mjs blob at B
requestPR
requestHeadSha = Commit R
requestCommit = Commit R
candidateToolingRevision = Commit B
syntheticOrDisposableProductSubject =
  f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
acceptanceFixtureManifestDigest =
  5d79f9b3a3f8288c781753c327e40d462bc1c2fa29591b2eaa8aa7da1bc87d87
natural SAT workflow run ID / run attempt
job ID
artifact ID / artifact name / GitHub artifact digest when exposed
controlledEnvironmentFingerprint
hostDiagnostics
journal seal comment ID / journalDigest
commandManifestDigest(s)
datasetDigest
exact changed paths and blobs from predecessor through B
exact one-file request delta from B through R
```

No implementer summary or existing broad CI can substitute for the dedicated
natural SAT run/artifact.

## 17. Independent implementation acceptance gate

After E, the implementation writer stops.

The Independent Auditor must fresh-read the exact authorization verdict,
implementation predecessor, A/B/R topology, current PR head, all three
implementation blobs, request carrier, natural CI, dedicated SAT run/job/artifact,
journal comments/seal and the E handoff comment.

Acceptance requires evidence that source inspection alone cannot provide:

- valid natural TDD RED at A;
- unchanged tests plus implementation GREEN at B;
- exact natural SAT run at R;
- all `EWF00-ME-*` executable/replayable fixture coverage;
- purpose separation and non-reclassifiability;
- exact external command authority;
- no credential leakage;
- five-state fidelity;
- journal/seal integrity;
- controlled-vs-host environment behavior;
- raw artifact/dataset digest integrity;
- exact product/tooling/request identities;
- no fourth implementation path or package/dependency mutation.

The implementation writer cannot post the verdict, mark Ready, merge, run Pilot
B, or change canonical package status.

## 18. Fail-closed STOP conditions

Any of the following stops the capsule with no improvisation:

```text
main/predecessor drift
authorization subject/verdict drift
writer overlap
semantic/path collision
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
request head mismatch
request supersession
candidate parent mismatch
product tracked-state mutation
credential leakage
```

Canonical stop labels:

```text
SUBSTRATE_WRITER_OR_PATH_COLLISION
SUBSTRATE_IMPLEMENTATION_BOUNDARY_INSUFFICIENT
SUBSTRATE_AUTHORIZED_TOPOLOGY_EXHAUSTED
```

A more specific typed implementation error may accompany one of those labels,
but cannot bypass the stop.

## 19. Non-effects and rollback boundary

This authorization candidate does not:

- create the implementation branch;
- create or edit any of the three implementation paths;
- execute the SAT;
- execute `PILOT_MEASUREMENT`;
- execute Pilot B;
- implement or accept LI-00;
- change `EWF-00` package status;
- grant package, Pilot, substrate, or EWF acceptance;
- install/update a dependency;
- edit canonical status docs or existing CI;
- mark its own authorization PR Ready or merge it.

If an accepted implementation is later rolled back, rollback removes only the
three substrate implementation paths and follows separately authorized handling
for any historical request carrier. Recorded run/artifact/comment/verdict
history is not rewritten. ADR-046 remains controlling outside ADR-047.

## 20. Authorization audit handoff

This document is only an authorization candidate until an Independent Auditor
binds an `ACCEPT` verdict to its exact Draft-PR head.

The independent authorization audit should verify at least:

```text
AUTHORIZATION_IDENTITY:
EWF00-MEASURE-EXEC-001-AUTH-001

IMPLEMENTATION_PREDECESSOR:
f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e

IMPLEMENTATION_ALLOWLIST:
exact three ADR-047 paths

WRITER:
chatgpt-github-ewf-measurement-substrate-writer

TOPOLOGY:
S0 / A / OPEN / B / R / E / STOP

REQUEST_CARRIER:
exact one-file rule in Section 7

SAT_FIXTURE_DIGEST:
5d79f9b3a3f8288c781753c327e40d462bc1c2fa29591b2eaa8aa7da1bc87d87

WORKFLOW_PERMISSIONS:
contents: read
pull-requests: read

NODE:
22.22.3

CONTAINER:
NOT_SELECTED

IMPLEMENTATION:
NO

PILOT_B:
NO

LI_00_ACCEPTANCE:
NOT_GRANTED

EWF_00_ACCEPTANCE:
NOT_GRANTED
```

Until that exact-head audit occurs:

```text
STATUS:
AUTHORIZATION_PENDING_INDEPENDENT_AUDIT
```
