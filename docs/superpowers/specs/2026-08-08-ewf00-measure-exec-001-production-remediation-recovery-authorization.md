# EWF00-MEASURE-EXEC-001 — Production-Path Remediation Recovery Authorization

## 0. Authorization identity and effect

| Field | Frozen value |
|---|---|
| Recovery authorization ID | `EWF00-MEASURE-EXEC-001-PRODUCTION-REMED-RECOVERY-AUTH-001` |
| Authorization kind | `DOCS_ONLY / RECOVERY_AUTHORIZATION_OVERLAY / NOT_IMPLEMENTATION` |
| Current canonical `main` at formation | `f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e` |
| Original production-remediation authorization ID | `EWF00-MEASURE-EXEC-001-PRODUCTION-REMED-AUTH-001` |
| Original authorization head | `a375e4805dce807d60a5eac467f30e7a07bf2d94` |
| Original authorization document | `docs/superpowers/specs/2026-08-08-ewf00-measure-exec-001-production-path-remediation-authorization.md` |
| Original authorization document blob | `e3f75abb965b4200411fa77c680a83e88bf98a01` |
| Original independent authorization ACCEPT | PR `#41`, comment `5226305999` |
| Independent execution STOP | PR `#41`, comment `5226460966` |
| Historical corrective substrate audit | PR `#40`, comment `5225959106` |
| Historical remediation base (`B0`) | `5d941924206c4857ecdc63442f2ae37b05f5cd2e` |
| B0 historical test blob | `147327005ab2742553ed423b04b5ca9812d4bb4b` |
| Failed implementation branch | `chatgpt/ewf00-measure-exec-001-production-remediation-v1` |
| Failed Commit D | `6459519114e15ea1616e1751d31bdfb8bf0602b2` |
| Failed D test blob | `e47af1377b92545bdfe408715f1ea668487d9981` |
| Replacement implementation branch | `chatgpt/ewf00-measure-exec-001-production-remediation-v2` |
| Recovery authorization branch | `chatgpt/ewf00-measure-exec-001-production-remediation-recovery-auth-v1` |
| Recovery authorization state | `PENDING_INDEPENDENT_EXACT_HEAD_AUDIT / NOT_EFFECTIVE` |

This document is an additive recovery overlay. It does not reconstruct, replace,
or paraphrase the complete accepted original production-remediation authorization.
It changes exactly one thing in that accepted authorization: the malformed first
implementation-candidate lineage is frozen and replaced, conditionally, by the
new `B0 -> D2 -> E2 -> R3` lineage defined below.

Every technical predicate, safety boundary, evidence requirement, authority
separation, negative fixture, stop condition, and non-effect from the original
accepted authorization at exact head
`a375e4805dce807d60a5eac467f30e7a07bf2d94`, document blob
`e3f75abb965b4200411fa77c680a83e88bf98a01`, and independent ACCEPT comment
`5226305999` remains controlling unless this overlay explicitly changes the
implementation-candidate identity or strengthens the D2 transcription-safety
rule.

If a future executor or auditor cannot mechanically determine whether an
original predicate is inherited unchanged, it MUST stop:

```text
STOP
RECOVERY_AUTHORIZATION_INHERITANCE_AMBIGUOUS
```

This recovery candidate grants no implementation or acceptance authority until
an Independent Auditor posts an exact-head `ACCEPT` for this recovery
authorization and that verdict is read back. This implementer cannot issue that
verdict.

## 1. Fresh-bound controlling state

At recovery-authorization formation, the controlling repository/history state
is frozen as follows.

### 1.1 Canonical repository state

```text
current main = f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e

EWF-00 = IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED
```

Canonical repository authority remains `AGENTS.md`, `docs/ROADMAP.md`,
`docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`, and
`docs/DECISIONS.md`. ADR-047 remains a narrow measured exception permitting only
the bounded read-only measurement substrate; it does not authorize general CI
redesign, repository mutation authority, product implementation, automatic
acceptance, Pilot B, LI-00, deployment, publishing, or a second status authority.

### 1.2 Original accepted remediation authority

The original production-path remediation authorization remains valid as the
inherited technical contract:

```text
authorization ID:
EWF00-MEASURE-EXEC-001-PRODUCTION-REMED-AUTH-001

exact authorization head:
a375e4805dce807d60a5eac467f30e7a07bf2d94

exact authorization document blob:
e3f75abb965b4200411fa77c680a83e88bf98a01

independent ACCEPT:
PR #41 comment 5226305999
```

This recovery overlay does not revoke that authorization. It freezes only the
failed implementation candidate that attempted to consume it and authorizes a
new candidate lineage if this overlay is independently accepted.

### 1.3 Historical corrective substrate audit remains controlling

PR #40 comment `5225959106` remains the controlling corrective implementation
audit for the historical substrate:

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

The historical SAT path, artifact, journal/seal evidence and dataset evidence
remain historical evidence only. They do not make B0 accepted tooling and do
not authorize a real Pilot measurement.

### 1.4 Independent execution STOP is controlling for the failed D

PR #41 comment `5226460966` is the controlling execution STOP:

```text
STOP / INVALID_COMMIT_D / RECOVERY_AUTHORITY_REQUIRED
```

It establishes that failed D had no remediation PR and no natural exact-head
RED. This overlay MUST NOT fabricate, reconstruct, infer, or reclassify any
failed-D RED evidence.

## 2. Failed candidate is frozen permanently

The failed implementation candidate is exactly:

```text
branch:
chatgpt/ewf00-measure-exec-001-production-remediation-v1

D:
6459519114e15ea1616e1751d31bdfb8bf0602b2

parent:
5d941924206c4857ecdc63442f2ae37b05f5cd2e

changed path:
tests/ewf-measurement-executor.test.mjs

failed D test blob:
e47af1377b92545bdfe408715f1ea668487d9981
```

The mechanically verified defect is exact historical-test transcription drift
inside `ME-N25`:

```text
B0 historical form:
sealFor(comments)

failed D form:
sealFor(missing)
```

The failed D commit changed one historical line and therefore introduced an
unrelated journal/seal negative-fixture failure. That is not the authorized
production-path RED.

The failed branch and D are classified exactly:

```text
INVALID
HISTORICAL_FAILED_CANDIDATE
FROZEN
NOT_REUSABLE
NOT_REMEDIATION_EVIDENCE
```

The following operations are permanently forbidden for this recovery:

```text
amend D
reset failed branch
force-push failed branch
rebase failed branch
append another commit to repair D
delete/recreate failed branch under same identity
reuse failed D as parent
reuse failed D test blob
reinterpret failed D as RED evidence
```

Any attempted reuse or mutation of the failed branch or D is:

```text
STOP
FAILED_REMEDIATION_CANDIDATE_REUSE_FORBIDDEN
```

Failed D never enters replacement ancestry.

## 3. Original technical contract is inherited unchanged

The recovery exists only to replace the malformed test-first candidate. No
product, workflow, evidence, authority, or acceptance contract is relaxed.

The following original predicates remain unchanged and mandatory:

```text
ADR-047 three-path implementation boundary

dispatchMeasurementRequest(...)

--run-request

SUBSTRATE_ACCEPTANCE_TEST routing

PILOT_MEASUREMENT routing

INVALID_REQUEST_PURPOSE fail-closed before spawn

REQUEST_BOUNDARY_INVALID fail-closed before spawn

independent accepted-tooling resolver

independent execution-authorization resolver

exact ordered command authority

UNAUTHORIZED_COMMAND before spawn

productSubject exact-SHA and tracked-state immutability

EWF_GITHUB_READ_TOKEN control-plane isolation

baseline / assisted evidence separation

SAT synthetic evidence separation

five command states:
PASS / FAIL / ERROR / NOT_RUN / NOT_AVAILABLE

six metric states:
OBSERVED / OBSERVED_ZERO / NOT_RUN / NOT_AVAILABLE / NOT_APPLICABLE / UNKNOWN

eight canonical metric families

journal/seal exact-head binding

dataset digest binding

R/SAT regression requirements

real Pilot forbidden before later independent exact tooling acceptance
```

The exact ADR-047 implementation surface therefore remains only:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
tests/ewf-measurement-executor.test.mjs
```

A later evidence/control request carrier may exist only under:

```text
docs/superpowers/measurement-requests/**
```

That request carrier is not a fourth implementation path.

All original requirements covering request-delta discovery, exact accepted
measurement-tooling identity, external execution authorization identity,
canonical spec revision, verification-manifest digest, command declaration IDs,
command manifest digest, command cwd, timeout, explicit environment, child
credential stripping, output/result state fidelity, baseline/assisted evidence
shape, product checkout immutability, journal/seal validation, raw evidence,
metric observations, artifact members, controlled environment identity, dataset
digest, SAT non-reclassification and no acceptance authority remain unchanged.

All original negative cases and hermetic behavior requirements remain required.
The recovery overlay does not convert source-string checks into acceptable
substitutes for executable behavior evidence.

## 4. Replacement implementation lineage

Only after this recovery authorization receives independent exact-head `ACCEPT`
and that verdict is read back may the designated bounded remediation writer form
one replacement implementation branch:

```text
branch:
chatgpt/ewf00-measure-exec-001-production-remediation-v2

start:
5d941924206c4857ecdc63442f2ae37b05f5cd2e

PR base:
main
```

The designated writer role remains the original bounded remediation writer:

```text
chatgpt-github-ewf-measurement-production-remediation-writer
```

The exact B0 classification remains:

```text
REMEDIATION_BASE_ONLY
NOT_ACCEPTED_TOOLING
NOT_PILOT_AUTHORITY
```

Historical old R remains:

```text
451a7a57c3ee376ef4421422425d669d4ab0ab70
EXCLUDED_FROM_REPLACEMENT_LINEAGE
```

Failed D also remains excluded:

```text
6459519114e15ea1616e1751d31bdfb8bf0602b2
EXCLUDED_FROM_REPLACEMENT_LINEAGE
```

No other predecessor is authorized.

## 5. Frozen replacement topology

The only authorized future implementation/evidence topology is:

```text
B0
5d941924206c4857ecdc63442f2ae37b05f5cd2e

↓

D2 — fresh production-path test-first commit

↓

OPEN — one new Draft remediation PR against main

↓

natural exact-head RED

↓

E2 — workflow + executor remediation only

↓

natural exact-head GREEN

↓

R3 — one SUBSTRATE_ACCEPTANCE_TEST request carrier

↓

natural dedicated SAT

↓

HANDOFF — one implementation handoff comment / no repository commit

↓

STOP — Independent Implementation Audit
```

`D2`, `E2`, and `R3` are recovery-stage identities only.

The future implementation audit subject is exact Commit `E2`.

`R3` is evidence/control request head only and can never become the accepted
measurement-tooling revision.

No extra implementation commit, evidence commit, amend, rebase, squash,
force-push, no-op commit, workflow rerun, workflow dispatch, Ready toggle,
close/reopen trigger, merge, or canonical status mutation is authorized.

## 6. D2 — stronger historical-test transcription safety

D2 MUST be a fresh direct child of exact B0:

```text
parent = 5d941924206c4857ecdc63442f2ae37b05f5cd2e
```

D2 changes exactly:

```text
tests/ewf-measurement-executor.test.mjs
```

with exact commit message:

```text
test: require EWF Pilot measurement production path
```

The B0 test blob is frozen as:

```text
147327005ab2742553ed423b04b5ca9812d4bb4b
```

D2 MUST preserve every byte of the B0 historical test region. D2 construction
is append-only relative to the complete B0 test file.

The raw D2 commit diff against B0 MUST satisfy all of these predicates:

```text
exactly one changed file

deletions = 0

no historical line replacement

no historical line deletion

all remediation additions occur strictly after the existing B0 file content
```

Before a remediation PR is opened, the future executor MUST fetch and inspect
the raw D2 commit diff. Merely checking the final file or trusting the write
operation is insufficient.

Any deletion, replacement, or insertion into the historical B0 test region is:

```text
STOP
HISTORICAL_TEST_TRANSCRIPTION_DRIFT
```

Such a replacement candidate becomes frozen immediately. It cannot be rescued
by amend, rewrite, reset, force-push, rebase, or an extra repair commit under the
same candidate identity.

### 6.1 D2 first remediation-specific assertion

The first remediation-specific assertion remains exactly:

```js
const executor = await import('../scripts/ewf-measurement-executor.mjs');

assert.equal(
  typeof executor.dispatchMeasurementRequest,
  'function',
  'PILOT_PRODUCTION_ENTRYPOINT_MISSING',
);
```

The expected first remediation-specific failure remains exactly:

```text
PILOT_PRODUCTION_ENTRYPOINT_MISSING
```

The module import MUST succeed before that assertion is evaluated.

The historical suites remain present and effective:

```text
EWF00-ME-01..22
ME-N01..ME-N46
SAT fixture digest assertions
security assertions
journal/seal assertions
```

The immutable D2 test suite must also retain every behavior-level production
path requirement inherited from the original authorization, including the
33-item hermetic production-path coverage matrix.

## 7. D2 natural RED gate

Only after D2 raw-diff inspection proves the append-only transcription rule may
the future executor open one new Draft remediation PR against `main`.

The first natural exact-head CI for D2 is the only authorized RED evidence.
No rerun or dispatch may substitute for it.

The RED is valid only if:

```text
historical suites remain effective
module import succeeds
first remediation-specific failure = PILOT_PRODUCTION_ENTRYPOINT_MISSING
failure is on exact D2
CI identity is the natural pull_request event for exact D2
```

A RED caused by any of the following is invalid:

```text
historical test failure
syntax failure
module import failure
dependency failure
filesystem/setup failure
network/GitHub connectivity failure
fixture corruption
unrelated repository failure
another or ambiguous first remediation failure
```

Invalid RED requires:

```text
STOP
INVALID_SUBSTRATE_PRODUCTION_REMEDIATION_RED
```

No E2 transition is authorized from an invalid D2.

## 8. E2 — workflow and executor remediation only

E2 is authorized only after a valid natural exact-head D2 RED is mechanically
classified.

E2 MUST be the direct child of exact D2 and may change exactly:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
```

The D2 test blob is immutable through E2 and R3.

E2 must implement the complete production-path contract inherited from the
accepted original authorization. In particular, the shared workflow/executor
must expose and use:

```text
dispatchMeasurementRequest(...)
--run-request
```

for both `SUBSTRATE_ACCEPTANCE_TEST` and `PILOT_MEASUREMENT`, while preserving
the exact fail-closed authority, request-boundary, command, credential,
immutability, evidence, metric, journal/seal and dataset predicates inherited
above.

E2 must obtain a natural exact-head GREEN on the same Draft remediation PR.
No rerun, workflow dispatch, Ready toggle or synthetic trigger is authorized.

Even after GREEN, E2 remains:

```text
IMPLEMENTATION_CANDIDATE
NOT_ACCEPTED_TOOLING
```

until a later Independent Auditor accepts exact E2.

## 9. R3 — SAT-only regression evidence carrier

R3 is authorized only after valid natural exact-head E2 GREEN.

R3 MUST be the direct child of exact E2 and change exactly one path under:

```text
docs/superpowers/measurement-requests/**
```

Its purpose is exactly:

```text
SUBSTRATE_ACCEPTANCE_TEST
```

It MUST NOT use:

```text
PILOT_MEASUREMENT
```

R3 exists only to prove that the historically valid SAT path survives through
the shared production router implemented at E2.

R3 must obtain the natural dedicated SAT required by the inherited original
authorization. The SAT evidence must prove at minimum:

```text
realPilotCommandsExecuted = false
Pilot B = NOT_EXECUTED
SAT evidence remains non-reclassifiable as baseline/assisted Pilot evidence
```

R3 never becomes an accepted tooling revision and does not alter the exact E2
implementation audit subject.

## 10. Future Stage S0 and fail-closed checks

Before the replacement implementation branch is created, the future executor
must fresh-read all original Stage S0 predicates plus the following recovery
identities:

```text
current canonical main
original authorization head/blob/ACCEPT
execution STOP comment 5226460966
corrective audit comment 5225959106
failed branch still frozen at failed D
B0 still fetchable with historical three-path blobs intact
B0 test blob = 147327005ab2742553ed423b04b5ca9812d4bb4b
replacement branch does not already exist
no active writer/path collision
```

The original Stage S0 owner, predecessor, branch-race, one-writer, overlap,
authority, dependency, CI identity and evidence ambiguity gates remain
unchanged.

Any drift that makes the replacement no longer mechanically bind to the
accepted original authorization or this recovery overlay is a hard stop. No
executor may infer replacement authority from roadmap, CI, the existence of
this document, or the failed candidate.

## 11. Explicit forbidden effects

This recovery authorization does not authorize this implementer or any later
executor to do any of the following before their specific gate is reached:

```text
modify the failed v1 branch or D
create D2/E2/R3 before recovery authorization ACCEPT
execute a real PILOT_MEASUREMENT before independent tooling acceptance
execute Pilot B
implement or accept LI-00
accept EWF-00
modify canonical status
modify ROADMAP / IMPLEMENTATION_PLAN / IMPLEMENTATION_STATUS / DECISIONS
modify product source or product tests
add dependencies
perform deployment or publishing
mark any authorization/remediation PR Ready
merge any PR
self-accept implementation or evidence
```

The read-only measurement workflow never gains repository-ref/comment/status,
product-state, deployment or publishing mutation authority from this recovery.

## 12. Recovery authorization candidate topology

This authorization candidate itself must remain docs-only.

Required authorization branch:

```text
chatgpt/ewf00-measure-exec-001-production-remediation-recovery-auth-v1
```

Required authorization predecessor:

```text
f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
```

Required sole repository path:

```text
docs/superpowers/specs/2026-08-08-ewf00-measure-exec-001-production-remediation-recovery-authorization.md
```

Required repository delta:

```text
1 added recovery authorization document
0 source files
0 test files
0 workflow files
0 dependency files
0 canonical status files
```

Open exactly one new Draft PR against `main` and obtain the natural
`pull_request` CI for the exact authorization head.

Forbidden authorization-candidate event manipulation:

```text
workflow rerun
workflow dispatch
Ready toggle
close/reopen trigger
no-op commit
merge
```

The recovery authorization PR MUST remain Draft and unmerged for an Independent
Auditor.

## 13. Acceptance boundary and required stop

This implementer creates only the independently auditable recovery authorization
candidate. It does not create the replacement implementation branch or execute
any replacement transition.

Until an Independent Auditor posts an exact-head verdict:

```text
FAILED D:
FROZEN / INVALID / NOT_REUSABLE

REPLACEMENT IMPLEMENTATION:
NOT_STARTED

SUBSTRATE IMPLEMENTATION ACCEPTANCE:
NOT_GRANTED

acceptedMeasurementToolingRevision:
NOT_YET_GRANTED

PILOT_MEASUREMENT:
NOT_EXECUTED

PILOT B:
NOT_AUTHORIZED_TO_RESTART

LI-00 ACCEPTANCE:
NOT_GRANTED

EWF-00 ACCEPTANCE:
NOT_GRANTED

MERGE AUTHORITY:
NONE

INDEPENDENT RECOVERY AUTHORIZATION VERDICT:
NOT_ISSUED_BY_THIS_IMPLEMENTER
```

The only next state after this candidate obtains its natural exact-head CI is:

```text
STOP
FOR INDEPENDENT RECOVERY AUTHORIZATION AUDIT
```
