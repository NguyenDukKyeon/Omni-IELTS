# EWF00-MEASURE-EXEC-001 Production Remediation Recovery Authorization v2

## 0. Purpose and authority boundary

This document is a docs-only recovery-authorization candidate for the failed
replacement production-remediation v2 lineage of `EWF00-MEASURE-EXEC-001`.

It does **not** implement remediation. It does **not** accept tooling, authorize a
real Pilot measurement, restart Pilot B, accept LI-00 or EWF-00, change canonical
status, grant merge authority, or mutate any historical failed candidate.

This document is an additive recovery overlay. The accepted original
production-remediation authorization and the accepted first recovery authorization
remain controlling except where this document explicitly replaces the failed-v2
future lineage and explicitly grants reuse of exact D2 as an immutable historical
RED predecessor.

## 1. Authorization identity

```text
authorization ID:
EWF00-MEASURE-EXEC-001-PRODUCTION-REMED-RECOVERY-AUTH-002

authorization kind:
PRODUCTION_REMEDIATION_V2_FAILURE_RECOVERY_AUTHORIZATION

formation main:
f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e

authorization branch:
chatgpt/ewf00-measure-exec-001-production-remediation-recovery-auth-v2

authorization document:
docs/superpowers/specs/2026-08-08-ewf00-measure-exec-001-production-remediation-recovery-authorization-v2.md

original production-remediation authorization:
EWF00-MEASURE-EXEC-001-PRODUCTION-REMED-AUTH-001
accepted head a375e4805dce807d60a5eac467f30e7a07bf2d94
independent ACCEPT comment 5226305999

first recovery authorization:
EWF00-MEASURE-EXEC-001-PRODUCTION-REMED-RECOVERY-AUTH-001
accepted head 1dc744c38719f432f2f39859fa9e7f20d43d9775
independent ACCEPT comment 5226543234

failed v1 branch:
chatgpt/ewf00-measure-exec-001-production-remediation-v1
failed D 6459519114e15ea1616e1751d31bdfb8bf0602b2
controlling STOP comment 5226460966

failed v2 branch:
chatgpt/ewf00-measure-exec-001-production-remediation-v2
PR #43
failed E2 d96e1ff5a6961cbcd6dc993661cff7af3ad66fff

controlling failed-v2 independent STOP:
comment 5226764319
REJECTED_AT_CURRENT_HEAD /
REQUIRED_E2_NATURAL_EXACT_HEAD_GREEN_NOT_OBTAINED /
RECOVERY_AUTHORITY_REQUIRED
```

Formation-time fresh inspection found `main` still exactly
`f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e`; therefore no main drift invalidates
this recovery basis.

## 2. Controlling authority preserved

The following authority chain remains controlling:

- `AGENTS.md` at formation main;
- `docs/ROADMAP.md` at formation main;
- `docs/IMPLEMENTATION_PLAN.md` at formation main;
- `docs/IMPLEMENTATION_STATUS.md` at formation main;
- `docs/DECISIONS.md`, including ADR-046 and ADR-047, at formation main;
- original accepted production-remediation authorization at exact head
  `a375e4805dce807d60a5eac467f30e7a07bf2d94`, independent ACCEPT comment
  `5226305999`;
- accepted first recovery authorization at exact head
  `1dc744c38719f432f2f39859fa9e7f20d43d9775`, independent ACCEPT comment
  `5226543234`;
- controlling failed-v2 STOP comment `5226764319` on PR #43.

The first accepted recovery froze:

```text
B0
↓
D2
↓
natural RED
↓
E2
↓
natural GREEN
↓
R3
↓
dedicated SAT
↓
HANDOFF
↓
STOP
```

E2 did not obtain the required natural exact-head GREEN. That lineage is therefore
frozen at E2 and cannot be repaired, rerun, rewritten, extended, amended, rebased,
squashed, force-pushed, rescued, or continued under the failed-v2 identity.

## 3. Historical freeze table

| Subject | Exact identity | Classification under this recovery |
|---|---|---|
| Historical substrate implementation / old R | PR #40, head `451a7a57c3ee376ef4421422425d669d4ab0ab70`, corrective audit comment `5225959106` | `REJECTED_AT_CURRENT_HEAD / SAT_PATH_VALID / PILOT_PRODUCTION_PATH_MISSING`; OPEN / DRAFT / UNMERGED; immutable historical subject; mutation forbidden |
| Failed v1 | branch `chatgpt/ewf00-measure-exec-001-production-remediation-v1`, failed D `6459519114e15ea1616e1751d31bdfb8bf0602b2` | `INVALID / HISTORICAL_FAILED_CANDIDATE / FROZEN / NOT_REUSABLE / NOT_REMEDIATION_EVIDENCE`; mutation forbidden |
| First recovery authorization | PR #42, accepted head `1dc744c38719f432f2f39859fa9e7f20d43d9775`, ACCEPT comment `5226543234` | accepted governance authority; not implementation evidence; remains controlling except for the failed-v2 lineage replaced here |
| Failed v2 container | PR #43, branch `chatgpt/ewf00-measure-exec-001-production-remediation-v2` | OPEN / DRAFT / UNMERGED; frozen; no repair, rerun, rewrite, extension, amend, rebase, squash, force-push, rescue, Ready transition, or merge |
| D2 | `089f1942de086931927e0daa1692e3cb5ffcad30` | `VALID_HISTORICAL_RED_PREDECESSOR / IMMUTABLE / REUSE_GRANTED_ONLY_BY_THIS_RECOVERY / NOT_ACCEPTED_TOOLING / NOT_PILOT_AUTHORITY` |
| Failed E2 | `d96e1ff5a6961cbcd6dc993661cff7af3ad66fff` | failed historical implementation candidate; `NOT_ACCEPTED_TOOLING`; `NOT_REUSABLE`; mutation/extension forbidden |

No historical failed revision is reclassified as accepted tooling by this document.

## 4. D2 mechanical re-verification

Fresh inspection establishes all of the following as FACT:

```text
D2:
089f1942de086931927e0daa1692e3cb5ffcad30

direct parent / B0:
5d941924206c4857ecdc63442f2ae37b05f5cd2e

commit message:
test: require EWF Pilot measurement production path

changed path set:
tests/ewf-measurement-executor.test.mjs

stats:
362 additions
0 deletions

B0 historical test blob:
147327005ab2742553ed423b04b5ca9812d4bb4b

D2 test blob:
d13050fd4215f495cee31ee55d967a5651cc98b1
```

The D2 raw patch begins strictly after the B0 end-of-file region and contains no
deletion. The complete B0 historical test region is therefore preserved
byte-for-byte and the remediation contract is append-only.

The first remediation-specific assertion is exactly the production entrypoint gate:

```text
typeof executor.dispatchMeasurementRequest === 'function'
failure marker: PILOT_PRODUCTION_ENTRYPOINT_MISSING
```

The natural RED evidence is:

```text
run id: 31262680892
run number: 325
attempt: 1
event: pull_request
head: 089f1942de086931927e0daa1692e3cb5ffcad30
conclusion: failure
job: 93115822600
```

Raw job output shows the historical immutable SAT fixture digest test passing at
D2 before the first remediation-specific failure. The first remediation failure is
`PILOT_PRODUCTION_ENTRYPOINT_MISSING`; the later remediation failures are downstream
consequences of the same absent production entrypoint. No unrelated historical
failure precedes the remediation block.

This RED is historical evidence formed under the independently accepted first
recovery authorization. This document does not rerun, recreate, or reinterpret it.

## 5. Failed E2 raw evidence

### 5.1 FACT

```text
E2:
d96e1ff5a6961cbcd6dc993661cff7af3ad66fff

direct parent:
089f1942de086931927e0daa1692e3cb5ffcad30

commit message:
fix: implement EWF Pilot measurement production path

changed implementation paths only:
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs

workflow blob:
c13f3e7bbcf08610bcc79a39f815d21f872db32e

executor blob:
177ae56a0d734952116212dc21f2a15ac3395f58

D2 test blob through E2:
d13050fd4215f495cee31ee55d967a5651cc98b1
```

The test blob is identical at D2 and E2. E2 did not modify the D2 test contract.

Natural exact-head CI:

```text
run id: 31263689768
run number: 326
attempt: 1
event: pull_request
head: d96e1ff5a6961cbcd6dc993661cff7af3ad66fff
conclusion: failure
job: 93118298272
job conclusion: failure

verification artifact name: verification-output
artifact id: 9023500935
artifact digest:
sha256:95dc500624c6d664f90bb6ed204f7781e541c8cf04042957b8f07b55051d97d8
```

Raw test evidence is:

```text
tests: 559
pass: 558
fail: 1

sole failing test:
fixture canonicalization and digest exactly match
EWF00-MEASURE-EXEC-001-AUTH-001-SAT-FIXTURE-V2

expected digest:
a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d

actual digest:
29d1aa7961dd840c893d2933202040693a969f6980d07c792957fe501b47e938
```

All D2-added production-remediation tests pass at exact E2. The only regression is
the historical immutable SAT-fixture digest predicate.

Source-level comparison further establishes:

1. before E2, the executor defines `ACCEPTANCE_FIXTURE` from the frozen accepted
   `JSON.parse(String.raw`...`)` payload and exports the expected digest
   `a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d`;
2. E2 keeps that expected digest and keeps the same recursive-key-sorting
   `canonicalize()` behavior;
3. E2 replaces the frozen fixture payload construction with a newly reconstituted
   JavaScript object assembled from constants, arrays and runtime declarations;
4. canonicalizing that E2-reconstituted fixture produces
   `29d1aa7961dd840c893d2933202040693a969f6980d07c792957fe501b47e938`,
   not the accepted digest.

### 5.2 INFERENCE

High-confidence inference from the facts above:

- the E2 defect is **implementation-only** and resides in the executor's replacement
  of immutable accepted SAT fixture construction/semantics;
- one or more values in the newly reconstituted fixture are not byte-for-byte
  canonical-equivalent to the accepted frozen fixture payload;
- the canonicalization algorithm itself is not the source of the regression;
- D2 is not the source of this defect: its historical fixture predicate passed at
  D2, its test blob stayed unchanged through E2, and its newly added production
  contract tests all pass at E2.

The raw CI evidence does not identify one uniquely proven leaf field inside the
reconstituted object. This recovery therefore does not invent such a leaf-level
claim. The mechanically established technical cause is the E2 fixture-construction
replacement that changed the canonicalized fixture while retaining the accepted
immutable digest authority.

### 5.3 RECOVERY DECISION

A replacement E implementation can prevent this defect without changing D2 by
preserving the already-authorized immutable SAT fixture semantics and digest while
implementing the production path separately.

The replacement implementation is forbidden from obtaining GREEN by changing the
expected fixture digest, weakening tests, or redefining canonical fixture semantics.

## 6. Recovery form selection

```text
SELECTED:
FORM A — D2 REUSE
```

FORM A is selected because fresh evidence satisfies every required reuse predicate:

1. D2 is mechanically valid under the independently accepted first recovery
   authorization: exact parent, exact one-file append-only diff, historical bytes
   preserved, correct first remediation assertion, and natural exact-head RED;
2. D2 contains no defect relevant to the E2 failure;
3. the E2 failure is implementation-only;
4. the immutable D2 tests express the correct controlling contract: they both catch
   the SAT regression and confirm the intended production-path behavior;
5. no fresh canonical authority requires a new test-first commit for this failure;
6. D2 reuse does not bypass a required natural RED because run `31262680892` is the
   already-formed natural exact-head RED under accepted recovery authority;
7. controlling STOP comment `5226764319` requires a new recovery authority to make
   an explicit reuse decision and does not prohibit reuse once independently
   authorized.

This document therefore explicitly grants exact D2 reuse **only** for the future
replacement lineage defined below. The grant has no effect unless and until this
recovery authorization candidate itself receives an independent exact-head ACCEPT.

## 7. One frozen replacement topology

Future implementation identity:

```text
future branch:
chatgpt/ewf00-measure-exec-001-production-remediation-v3

immutable predecessor:
D2 = 089f1942de086931927e0daa1692e3cb5ffcad30

replacement implementation stage identity:
E3

SAT carrier stage identity:
R4
```

The only authorized future topology is:

```text
D2 089f1942de086931927e0daa1692e3cb5ffcad30
↓
E3 — one new substantive replacement implementation commit
↓
natural exact-head GREEN
↓
R4 — one SUBSTRATE_ACCEPTANCE_TEST request carrier
↓
natural dedicated SAT
↓
HANDOFF
↓
STOP — Independent Implementation Audit
```

E3 MUST be a new direct child of exact D2 on the new `...-v3` branch. It MUST NOT be
a child of failed E2 and MUST NOT reuse E2's commit identity. Creating the future
branch from exact D2 is reuse of the immutable historical RED predecessor, not a
repair or extension of PR #43.

No additional implementation repair commit is authorized between E3 and R4. If E3
fails its required natural exact-head GREEN, STOP and obtain new recovery authority.

R4 may form only after valid natural exact-head E3 GREEN. R4 MUST be the direct
child of exact E3 and exists only as the SAT request/evidence carrier. R4 never
becomes accepted tooling.

## 8. Future stage file allowlists and immutability

### 8.1 E3

E3 may modify only:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
```

No other path is authorized for E3.

The following test file is immutable throughout E3 and R4:

```text
tests/ewf-measurement-executor.test.mjs
required blob: d13050fd4215f495cee31ee55d967a5651cc98b1
```

E3 inherits the complete technical contract, safety predicates, negative fixtures,
security boundaries, production routing requirements, evidence requirements and
acceptance boundaries from the accepted original authorization and first recovery.
This recovery narrows lineage and defect handling; it does not weaken those
requirements.

### 8.2 R4

R4 may change exactly one file under:

```text
docs/superpowers/measurement-requests/**
```

For `SUBSTRATE_ACCEPTANCE_TEST`, the request carrier path is deterministically bound
to the exact future E3 SHA by the existing executor contract:

```text
docs/superpowers/measurement-requests/
ewf00-measure-exec-001-auth-001-sat-001-<FULL_E3_SHA>.json
```

R4 MUST be the direct child of that exact E3 and the request's
`candidateToolingRevision` MUST equal the same full E3 SHA. No source, workflow,
test, package, lockfile, canonical-status or other docs path is authorized at R4.

## 9. Exact technical defect constraint

The immutable historical SAT contract includes:

```text
fixtureRevision:
EWF00-MEASURE-EXEC-001-AUTH-001-SAT-FIXTURE-V2

expected canonical fixture digest:
a8e417a54a5b039e6095418662619677425a05f16cd009e2182f0b84b1645c2d
```

E3 MUST preserve the already-authorized canonical fixture semantics and satisfy the
existing immutable D2 test suite. The production-path implementation must be added
without mutating that authority.

It is explicitly forbidden to obtain GREEN by:

```text
changing the immutable expected fixture digest
weakening fixture assertions
changing D2 tests merely to match failed E2 behavior
removing SAT coverage
changing canonical fixture semantics without new canonical authority
changing canonicalization/serialization semantics to manufacture the old digest
skipping the failing test or any required test
changing CI aggregation to hide verification failure
ignoring verification-output evidence
reclassifying the failed E2 digest as accepted
```

A replacement implementation may choose any implementation construction that is
within the E3 file allowlist **only if** it is mechanically canonical-equivalent to
the already-authorized immutable fixture semantics and satisfies all inherited
production-path predicates. This document does not authorize a new fixture.

## 10. Natural CI gates

Only natural exact-head CI generated by the permitted future repository events may
count. No manufactured trigger is acceptable.

For E3, required evidence is:

```text
event = pull_request
run_attempt = 1
head_sha = exact E3
conclusion = success
```

The run must be the natural exact-head run produced by formation/update of the new
replacement candidate. The failed E2 run cannot be reused as GREEN evidence.

Only after that gate succeeds may R4 form and obtain the natural dedicated SAT
required by inherited authority.

Forbidden for all future stages:

```text
workflow rerun
workflow_dispatch
Ready toggle as a CI trigger
close/reopen as a CI trigger
empty/no-op commit or no-op trigger
amend
rebase
squash
force-push
history rewrite
```

If a required gate would need any forbidden mechanism, STOP and obtain new authority.

## 11. Independent acceptance boundaries

The following layers are distinct and MUST NOT be collapsed:

```text
IMPLEMENTER EVIDENCE
CI EVIDENCE
INDEPENDENT IMPLEMENTATION AUDIT
PACKAGE ACCEPTANCE
MERGE AUTHORITY
```

- Implementer evidence is raw evidence produced/reported by the future executor; it
  is not acceptance.
- CI evidence establishes only the exact automated predicate attached to the exact
  revision/run; GREEN is not independent acceptance.
- Independent implementation audit must fresh-verify exact E3 and its evidence.
- Package acceptance is a separate authority and is not granted here.
- Merge authority is `NONE` under this document.

A future executor cannot self-accept E3. R4/SAT cannot self-grant
`acceptedMeasurementToolingRevision`. Successful CI cannot independently establish
accepted tooling.

## 12. Historical failed-v2 freeze

The failed-v2 subject remains exactly:

```text
PR: #43
branch: chatgpt/ewf00-measure-exec-001-production-remediation-v2
D2: 089f1942de086931927e0daa1692e3cb5ffcad30
failed E2: d96e1ff5a6961cbcd6dc993661cff7af3ad66fff
controlling STOP: 5226764319
```

The reuse grant applies only to the immutable commit object D2 as the historical RED
predecessor of a **new branch identity** after independent acceptance of this
authorization. It does not authorize any mutation of PR #43 or its branch.

Failed E2 is never reusable. No E3 may be appended to the v2 branch.

## 13. Recovery-authorization formation gate

This authorization candidate itself must:

```text
start from formation main f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e
change exactly this one documentation file
contain one substantive commit only
open one Draft PR against main
remain OPEN / DRAFT / UNMERGED
obtain natural pull_request CI at exact authorization head
run_attempt = 1
conclusion = success
STOP for Independent Auditor
```

No authorization-candidate rerun, workflow dispatch, Ready transition, branch
mutation to manufacture another event, merge, amend, rebase, squash, force-push or
no-op commit is authorized.

If its natural exact-head CI fails, this candidate remains unaccepted and the
required result is:

```text
STOP
RECOVERY_AUTHORIZATION_V2_NATURAL_CI_FAILED
```

## 14. Non-effects

At formation of this recovery-authorization candidate:

```text
SUBSTRATE IMPLEMENTATION ACCEPTANCE:
NOT_GRANTED

acceptedMeasurementToolingRevision:
NOT_YET_GRANTED

REAL PILOT_MEASUREMENT:
NOT_AUTHORIZED

PILOT B:
NOT_AUTHORIZED_TO_RESTART

LI-00 ACCEPTANCE:
NOT_GRANTED

EWF-00 ACCEPTANCE:
NOT_GRANTED

PR #40 MUTATION:
FORBIDDEN

FAILED v1 MUTATION:
FORBIDDEN

FAILED v2 / PR #43 MUTATION:
FORBIDDEN

MERGE AUTHORITY:
NONE

CANONICAL STATUS CHANGE:
NONE
```

This recovery authorization itself grants no Pilot B execution.

## 15. Handoff condition

After this authorization candidate obtains natural exact-head GREEN, the docs-only
recovery implementer may post one raw-evidence handoff on its Draft PR and must then
STOP.

The handoff is evidence for an Independent Recovery Authorization Auditor only. It
must explicitly state:

```text
INDEPENDENT RECOVERY AUTHORIZATION VERDICT:
NOT_ISSUED_BY_THIS IMPLEMENTER

RECOVERY AUTHORIZATION EFFECT:
PENDING INDEPENDENT EXACT-HEAD AUDIT
```

Until such independent exact-head ACCEPT exists, no future D2-reuse implementation
branch, E3, R4, real measurement, Pilot B restart, package acceptance or merge is
authorized.
