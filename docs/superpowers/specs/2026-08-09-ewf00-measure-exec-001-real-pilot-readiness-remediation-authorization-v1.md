# EWF00-MEASURE-EXEC-001 Real-Pilot Readiness Remediation Authorization

## Identity

| Field | Value |
|---|---|
| Authorization ID | EWF00-MEASURE-EXEC-001-REAL-PILOT-READINESS-REMED-AUTH-001 |
| Version | v1 |
| Repository | NguyenDukKyeon/VocabMaster |
| Formation main | f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e |
| Date | 2026-08-09 |
| Role | DOCS-ONLY AUTHORIZATION IMPLEMENTER |
| Protocol | BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1 |
| State | AUTHORIZATION CANDIDATE / NOT YET ACCEPTED |

This is exactly one docs-only authorization candidate. It authorizes no current
implementation, real Pilot execution, Pilot B execution, LI-00 acceptance,
EWF-00 acceptance, canonical status change, Ready state, merge, deployment, or
self-acceptance.

## Authority chain and historical state

| Class | Fresh-verified identity |
|---|---|
| Pilot / controlled-pair spec | docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-pilots-measurement-audit-spec.md; blob 92675dd290ea4e8c10a3c25d1764095dc55c3dc7 |
| Measurement substrate spec | docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-measurement-execution-substrate-spec.md; blob eef8b89a207bf6733cbf7b717c2ab931325a776a |
| Capsule governance | ADR-046, ADR-047, and docs/superpowers/specs/2026-08-06-bounded-execution-capsule-governance-design.md; blob 30825fc6794d1633d7e0aa3e498e5838562a8a29 |
| Original Pilot B authority | PR #34 subject b30af0dd8c50650bced76d22bbe734b670f950ab; blob e7d9ae9adda0df7cfd8109f9f78b861bc79e2791; ACCEPT 5223112144; binding 5223160031 |
| Pilot B / LI-00 recovery history | PR #36 ACCEPT 5224898198; PR #37 STOP 5225048322; PR #46 frozen rejected at 0687250321ea007da4386296585f6c5330b1d96b by 5229421242 |
| Substrate implementation authorization | PR #39 subject f27e4d1174ff0e40bb537cace269dbd36c2f65c3; ACCEPT 5225668133 |
| Historical recovery authority | PR #44 subject d433b9a8a5f5194c314e7677877ec5e2a34cafa8; blob f72a31ce24c8cfde2714ba05614daed6ba8e1c91; ACCEPT 5228916260 |
| Historical E3 | PR #45 E3 c64b926a596855237add816ff9c07f2558cfa971; workflow blob c13f3e7bbcf08610bcc79a39f815d21f872db32e; executor blob 54c1f2454238a34510fdc69b2ae91d622f11cfa4; test blob d13050fd4215f495cee31ee55d967a5651cc98b1 |
| Historical E3 implementation acceptance | PR #45 comment 5229107834 |
| Controlling corrective verdict | PR #45 comment 5229506295 |

Comment 5229506295 is chronologically later than 5229107834. Its exact verdict is
SUPERSEDED_FOR_REAL_PILOT_MEASUREMENT / REMEDIATION_REQUIRED. It preserves E3's
earlier acceptance only as historical evidence, forbids using E3 as
acceptedMeasurementToolingRevision for a new real PILOT_MEASUREMENT, requires a
fresh independently audited remediation authorization before a successor, and
requires PR #45 to remain Draft, unmerged, and unmodified.

PRs #40 through #45 remain frozen historical provenance. No prior SAT is Pilot
evidence. No historical PR may be amended, reset, rebased, force-pushed,
toggled, closed/reopened, workflow-dispatched, or rerun as replacement evidence.

## Fresh real-Pilot readiness findings

The audited E3 production path is PILOT_MEASUREMENT request, request validation,
independent accepted-tooling resolution, independent external execution
authorization resolution, separate exact tooling/product checkout,
executePilotManifest, command results and pilotObservations, fingerprint,
artifact emission, and later pair validation.

The following controls are already present and must remain so: one natural
Draft-PR request carrier; exact request-head identity; exact ordered manifest;
separate tooling/product checkouts; product pre/post SHA and cleanliness checks;
read-only workflow permissions; child stripping of EWF_GITHUB_READ_TOKEN and
other credentials; immutable operation-journal/seal use; immutable evidence
artifacts; accepted-tooling non-supersession; and external authority exactness.

### Confirmed remediation-required defects

1. Required FAIL sequencing. E3 treats every required non-PASS result as a
   blocker. Canonical semantics require FAIL to remain an executed observation
   that permits later declarations. ERROR, NOT_AVAILABLE, and NOT_RUN remain
   fail-closed. This prevents the LI baseline at
   e53d0971db1160f9b01349d2e4c17e59c6aaa99b from completing its exact
   eight-command profile because its new test is absent before Commit A.

2. Controlled-pair fingerprint. E3 includes productSubject in the required-equal
   environment fingerprint. Canonical CONTROLLED_SUBJECT_PAIR_V1 says the
   baseline and assisted subjects normally differ. The E3 fingerprint also
   omits required controlled context: measurement schema/method, tooling
   workflow/executor bytes, explicit environment, timeout policy, clock method,
   metric calculation revision, and applicable runtime/tool identities.

3. Live pair formation. E3 exports validateControlledPair and
   validateBaselineTemporalGate but runPilotCli invokes neither. One phase
   artifact is emitted without a pair decision, baseline-before-A proof,
   assisted-after-B topology proof, or binding of both immutable dataset
   identities. These helpers are insufficient while uninvoked by real Pilot
   execution.

### Eight metric assessment

| Metric | Current behavior | Status |
|---|---|---|
| focusedDuration | Numeric raw command duration | READY |
| prDuration | UNKNOWN with null | VALID_UNKNOWN |
| preflightOverhead | UNKNOWN with null | VALID_UNKNOWN |
| artifactPreparation | UNKNOWN with null | VALID_UNKNOWN |
| validatorOverhead | UNKNOWN with null | VALID_UNKNOWN |
| manualOperations | Numeric sealed-journal count | READY |
| reworkFindingLoop | UNKNOWN with null | VALID_UNKNOWN |
| cliAbsentFriction | UNKNOWN with null | VALID_UNKNOWN |

Canonical metric rules permit UNKNOWN/null for missing or unresolvable raw
evidence and prohibit converting UNKNOWN to zero. Consequently the unknown rows
are not remediation scope; all eight identities, units, state rules, and raw
references must be preserved.

### Readiness matrix

| Contract | Final status | Required result |
|---|---|---|
| required PASS continuation | ALREADY_SATISFIED | Preserve |
| required FAIL continuation | REMEDIATION_REQUIRED | Correct blocker set |
| required ERROR blocking | ALREADY_SATISFIED | Preserve |
| required NOT_AVAILABLE blocking | ALREADY_SATISFIED | Preserve |
| required NOT_RUN semantics | ALREADY_SATISFIED | Preserve |
| product-pair identity | REMEDIATION_REQUIRED | Separate it from environment context |
| controlled-environment fingerprint | REMEDIATION_REQUIRED | Include canonical controlled fields only |
| real context-drift detection | REMEDIATION_REQUIRED | Reject drift in every canonical controlled field |
| command-manifest identity/order | ALREADY_SATISFIED | Preserve |
| accepted-tooling resolver | ALREADY_SATISFIED | Preserve exact ACCEPT/non-supersession/bytes |
| execution-authority resolver | ALREADY_SATISFIED | Preserve exact authority fields/ordered manifest |
| tooling/product checkout isolation | ALREADY_SATISFIED | Preserve |
| product immutability | ALREADY_SATISFIED | Preserve |
| credential isolation | ALREADY_SATISFIED | Preserve |
| operation journal/seal | ALREADY_SATISFIED | Preserve |
| eight metric rows | NON_BLOCKING_BY_CANONICAL_CONTRACT | Preserve state semantics |
| raw evidence completeness | NON_BLOCKING_BY_CANONICAL_CONTRACT | Preserve artifacts; do not synthesize values |
| baseline-before-A gate | REMEDIATION_REQUIRED | Enforce in live pair formation |
| assisted-after-B gate | REMEDIATION_REQUIRED | Bind exact authorized product topology |
| controlled-pair comparability | REMEDIATION_REQUIRED | Emit canonical pair result from immutable phase evidence |
| SAT cannot become Pilot evidence | ALREADY_SATISFIED | Preserve domain separation |

No UNRESOLVED_BLOCKER remains.

## Prospective recovery form

FORM A — FROZEN E3 REUSE AS REMEDIATION PREDECESSOR is proposed only. This
candidate does not reuse E3 now. If independently accepted, it permits a new
branch to begin at exact E3 solely for the bounded remediation below. E3 remains
immutable historical evidence, never accepted tooling for a real Pilot, and PR
#45 remains untouched.

Future branch:
chatgpt/ewf00-measure-exec-001-real-pilot-readiness-remediation-v1

Frozen topology:

    E3 c64b926a596855237add816ff9c07f2558cfa971
    -> T4 test-only
    -> natural exact-head RED
    -> E4 tooling implementation-only
    -> natural exact-head GREEN
    -> R5 SAT/evidence carrier-only
    -> natural dedicated SAT
    -> implementer handoff
    -> STOP for Independent Implementation Audit

| Commit | Role | Exact allowlist |
|---|---|---|
| T4 | Test only | tests/ewf-measurement-executor.test.mjs only |
| E4 | Minimal tooling implementation only; no tests | scripts/ewf-measurement-executor.mjs only |
| R5 | Dedicated SUBSTRATE_ACCEPTANCE_TEST carrier bound to exact E4 | exactly one new file under docs/superpowers/measurement-requests/ |

The workflow is not authorized to change. It must remain E3 blob
c13f3e7bbcf08610bcc79a39f815d21f872db32e through T4/E4/R5. No product
source/test, dependency, package/lockfile, database, canonical-status, or other
documentation path is authorized.

## Frozen regression assertions

T4 must add focused tests that prove all of the following before E4:

- RP-01 required PASS continues.
- RP-02 required FAIL is executed and continues.
- RP-03 required ERROR blocks later required declarations.
- RP-04 required NOT_AVAILABLE blocks later required declarations.
- RP-05 NOT_RUN cannot masquerade as executed evidence.
- RP-06 differing baseline/assisted product SHAs may form one pair.
- RP-07 identical canonical measurement context is COMPARABLE.
- RP-08 each canonical context drift is COMPARABILITY_INVALID.
- RP-09 productSubject is excluded from equal environment context.
- RP-10 exact command declaration identity/order/digest remains binding.
- RP-11 external execution authority remains exact.
- RP-12 accepted-tooling ACCEPT/non-supersession/boundary/byte checks remain exact.
- RP-13 product SHA and cleanliness remain immutable before/after commands.
- RP-14 child credentials remain isolated.
- RP-15 all eight metrics preserve order/unit/state/null rules/raw references.
- RP-16 UNKNOWN is never coerced to zero.
- RP-17 SAT evidence cannot satisfy real-Pilot evidence.
- RP-18 live pair formation rejects a baseline not frozen before Commit A.
- RP-19 live pair formation rejects an assisted subject not proven exact authorized post-B.
- RP-20 pair output binds both immutable phase artifacts/dataset digests, pair
  identity, authorized delta, allowed paths, and COMPARABLE or
  COMPARABILITY_INVALID.
- RP-21 differing product subjects with one canonical context remain comparable;
  host diagnostics alone remain diagnostic.

## CI and stop conditions

T4, E4, and R5 each require their own natural pull_request exact-head event.
Reruns, workflow_dispatch, Ready/Draft toggles, close/reopen, empty/no-op
commits, amend, rebase, squash, force-push, or history rewrite do not qualify.

Stop without repair if predecessor, ownership, allowlist, historical blob,
natural RED, CI event/head, artifact/evidence identity, authority resolution, or
pair evidence drifts. Stop if an E4 repair commit or any unlisted path is needed.

## Machine-readable bounded execution capsule

~~~json
{
  "protocol": "BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1",
  "authorizationIdentity": "EWF00-MEASURE-EXEC-001-REAL-PILOT-READINESS-REMED-AUTH-001",
  "authorizationPurpose": "REAL_PILOT_READINESS_TOOLING_REMEDIATION",
  "historicalToolingRevision": "c64b926a596855237add816ff9c07f2558cfa971",
  "historicalToolingStatus": "SUPERSEDED_FOR_REAL_PILOT_MEASUREMENT",
  "correctiveAudit": {
    "pr": 45,
    "commentId": 5229506295,
    "verdict": "SUPERSEDED_FOR_REAL_PILOT_MEASUREMENT / REMEDIATION_REQUIRED"
  },
  "recoveryForm": "FORM_A_FROZEN_E3_REUSE_AS_REMEDIATION_PREDECESSOR",
  "implementationPredecessor": "c64b926a596855237add816ff9c07f2558cfa971",
  "futureBranch": "chatgpt/ewf00-measure-exec-001-real-pilot-readiness-remediation-v1",
  "topology": ["E3_IMMUTABLE_PREDECESSOR", "T4_TEST_ONLY", "NATURAL_EXACT_HEAD_RED", "E4_TOOLING_IMPLEMENTATION_ONLY", "NATURAL_EXACT_HEAD_GREEN", "R5_SAT_EVIDENCE_CARRIER_ONLY", "NATURAL_DEDICATED_SAT", "IMPLEMENTER_HANDOFF", "INDEPENDENT_IMPLEMENTATION_AUDIT", "STOP"],
  "commitAllowlist": {
    "T4": ["tests/ewf-measurement-executor.test.mjs"],
    "E4": ["scripts/ewf-measurement-executor.mjs"],
    "R5": ["docs/superpowers/measurement-requests/<exact-one-carrier>.json"]
  },
  "immutableHistoricalPRs": [40, 41, 42, 43, 44, 45],
  "requiredBehaviorAssertions": ["RP-01", "RP-02", "RP-03", "RP-04", "RP-05", "RP-06", "RP-07", "RP-08", "RP-09", "RP-10", "RP-11", "RP-12", "RP-13", "RP-14", "RP-15", "RP-16", "RP-17", "RP-18", "RP-19", "RP-20", "RP-21"],
  "pilotBExecutionAuthorized": false,
  "li00Accepted": false,
  "ewf00Accepted": false,
  "mergeAuthority": "NONE"
}
~~~

## Non-effects and successor acceptance

Neither E3, T4, R5, this authorization head, nor SAT evidence may be used as
acceptedMeasurementToolingRevision. Only exact E4, after a separate Independent
Implementation Audit ACCEPT that verifies E4 GREEN and R5 SAT, may have that
role. A separate accepted Pilot execution authorization is still required before
any real PILOT_MEASUREMENT.

STOP: await Independent Authorization Audit.
