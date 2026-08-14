# EWF00-MEASURE-EXEC-001 Real-Pilot Readiness Remediation Authorization V2

## Identity and authority boundary

| Field | Value |
|---|---|
| Authorization ID | EWF00-MEASURE-EXEC-001-REAL-PILOT-READINESS-REMED-AUTH-002 |
| Version | v2 replacement |
| Repository | NguyenDukKyeon/VocabMaster |
| Formation main | f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e |
| Role | DOCS-ONLY REPLACEMENT AUTHORIZATION IMPLEMENTER |
| Protocol | BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1 |
| State | AUTHORIZATION CANDIDATE ONLY / PENDING INDEPENDENT AUDIT |

This candidate authorizes no current source/test/workflow change, real Pilot
measurement, Pilot B execution, LI-00 execution or acceptance, EWF-00
acceptance, canonical status change, Ready transition, merge, deployment, or
self-acceptance. Its prospective execution authority exists only if an
Independent Authorization Auditor accepts this exact head.

## Fresh authority and historical state

| Class | Identity |
|---|---|
| Pilot/measurement specification | docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-pilots-measurement-audit-spec.md, blob 92675dd290ea4e8c10a3c25d1764095dc55c3dc7 |
| Measurement substrate specification | docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/package-specs/ewf-00-measurement-execution-substrate-spec.md, blob eef8b89a207bf6733cbf7b717c2ab931325a776a |
| Decisions | docs/DECISIONS.md, blob a53674d62c2fd833ce88c2174077cbb5ebba8015; ADR-046 and ADR-047 |
| Protocol acceptance/activation | PR #29 independent ACCEPT 5205734593; merge 291ee8ba3c23cd9c64f3bd9b5f7129188cdd3b7a; formation main descends from this merge |
| Original Pilot B authority | PR #34 subject b30af0dd8c50650bced76d22bbe734b670f950ab; ACCEPT 5223112144; binding 5223160031 |
| Pilot B recovery history | PR #36 ACCEPT 5224898198; PR #37 STOP 5225048322; PR #46 rejected 5229421242 |
| Root repair / substrate authorization | PR #38 integrated canonical repair; PR #39 subject f27e4d1174ff0e40bb537cace269dbd36c2f65c3; ACCEPT 5225668133 |
| Historical recovery authority | PR #44 subject d433b9a8a5f5194c314e7677877ec5e2a34cafa8; blob f72a31ce24c8cfde2714ba05614daed6ba8e1c91; ACCEPT 5228916260 |
| Historical E3 | PR #45 E3 c64b926a596855237add816ff9c07f2558cfa971; workflow blob c13f3e7bbcf08610bcc79a39f815d21f872db32e; executor blob 54c1f2454238a34510fdc69b2ae91d622f11cfa4; test blob d13050fd4215f495cee31ee55d967a5651cc98b1 |
| Controlling corrective verdict | PR #45 comment 5229506295: SUPERSEDED_FOR_REAL_PILOT_MEASUREMENT / REMEDIATION_REQUIRED |
| Rejected predecessor authorization | PR #47 head 2fc95b74676aaacf793be5d2edb1ce86a55850ce; document blob 80d5706db789a7e293d6d3fb3a717ecd41e96336; REJECT 5229691315 |

PR #47 is HISTORICAL, REJECTED, NOT_ACCEPTED, NOT_EFFECTIVE, and FROZEN. It
must not receive another commit or be used as authority. PR #45 is also
immutable. Historical E3 remains superseded for any new real
acceptedMeasurementToolingRevision.

## Canonical field ownership and causality matrix

The following matrix freezes the complete real-Pilot I/O contract. RAW PHASE
ARTIFACT fields are created before upload. POST-UPLOAD bindings are read back
only after GitHub creates them. CONTROLLED-PAIR fields are owned by the existing
downstream Pilot B gate; E5 does not create a new state authority.

| Field set | Canonical source | Level / knowable time | Producer and carrier | Verifier | E3 status | V2 owner |
|---|---|---|---|---|---|---|
| requestPR, requestHeadSha, requestCommit | substrate 3.3 | phase / natural event | workflow event and request carrier | bootstrap/executor | present | preserve |
| attemptId, measurementPairId, measurementPhase, productSubject, acceptedMeasurementToolingRevision | substrate 2.2, 3.3 | phase / request formation | externally authorized request carrier | request validator/resolvers | phase-local present | preserve |
| executionAuthorizationIdentity, executionAuthorizationSubject, executionAuthorizationVerdictCommentId, canonicalSpecRevision, verificationManifestDigest, commandDeclarationIds, commandManifestDigest | substrate 4-6 | phase / before spawn | accepted external execution authorization plus request | execution-authority resolver | present | preserve |
| workflowContentDigest, executorContentDigest, measurementSchemaRevision, measurementMethodRevision, rawEvidenceFormatRevision, commandManifestDigest | substrate 8 | phase context / before execution | exact tooling bytes and request | executor/fingerprint validator | incomplete | E5 executor |
| Node, npm where applicable, relevant tool versions, cwdPolicy, environmentInheritancePolicy, explicitEnvironment, timeoutPolicy, clockMethod, operationDefinitionRevision, metricCalculationRevision, executionContainerDigest if selected | substrate 7-8 | phase context / before execution | workflow/runtime/request/frozen method | executor/fingerprint validator | incomplete | E5 executor |
| commandId, ordinal, command, cwd, start, end, durationMs, exitCode, stdoutRef, stderrRef, stdoutDigest, stderrDigest, timeoutMs, controlledEnvironmentFingerprint, commandManifestDigest, productSubject, exact purpose-appropriate tooling revision, result, errorClass | substrate 7.2 | command / before phase artifact | executor and command output members | persisted command-results.json test | missing identity enrichment | E5 executor |
| all eight metric IDs plus value, unit, start, end, method, exclusions, rawEvidenceRef, resultState | pilots 5-6; substrate 10 | phase / after commands and seal | executor + operation journal | persisted observations test | eight rows; six valid UNKNOWN/null | preserve |
| controlPR, sealCommentId, journalDigest, observationWindowStart, observationWindowEnd, ordered operation rows/bindings | substrate 9 | phase / after seal | immutable PR comments then raw artifact | journal/seal validator | present | preserve |
| environment.json, command-results.json, measurement-observations.json, operation-journal.json, command stdout/stderr members, artifact-manifest.json, member hashes, datasetDigest | substrate 11.1 | RAW PHASE ARTIFACT / before upload | executor | artifact-manifest and persisted-member tests | members mostly present; command rows incomplete | E5 executor |
| canonical Pilot artifact name and 90-day retention | substrate 11.1 | upload / after raw artifact exists | workflow upload-artifact step | workflow contract test | wrong purpose/head name | E5 workflow only |
| workflowRunId, workflowRunAttempt, jobId, artifactId, artifactName, artifactDigest where exposed | pilots 10; substrate 11.1 | POST-UPLOAD only | GitHub Actions, then read-back | downstream evidence gate | raw artifact cannot self-contain future artifact ID/digest | downstream canonical owner |
| baselineSubject, assistedSubject, baselineParent, lineageAnchor, authorizedProductDelta, allowedChangedPaths | pilots 3-4, 11; substrate 13 | CONTROLLED PAIR / product topology exists | separately authorized Pilot B execution record | Pilot B Stage 0 and evidence Commit C | no phase-local owner | downstream canonical owner |
| baselineRequestPR/head, assistedRequestPR/head, baseline/assisted dataset and journal digests, comparabilityResult, comparabilityDiagnostics | substrate 13 | CONTROLLED PAIR / both phase datasets read back | phase artifacts plus post-upload read-back | Pilot B Stage 0 and evidence Commit C | no lawful E3 carrier | downstream canonical owner |

Causality is explicit: artifactId and GitHub artifactDigest cannot be required
inside the raw artifact that precedes upload. GitHub produces those values; the
existing downstream evidence carrier reads and binds them. No circular
self-reference, new store, runtime, status authority, or workflow type is
authorized.

## Pair-formation ownership decision

Selected model: MODEL B — SUBSTRATE OWNS COMPLETE PHASE EVIDENCE; THE EXISTING
DOWNSTREAM PILOT B EVIDENCE/PRODUCT GATE OWNS PAIR FORMATION.

Canonical basis:

1. The substrate specification section 11.1 defines one immutable Actions
   artifact for each phase and separates later evidence bindings from raw
   artifact content.
2. The Pilot specification says a later committed evidence set binds raw
   run/job/artifact identities and dataset digests, and its future Pilot B
   topology places evidence Commit C after assisted measurement.
3. The accepted Pilot B authority PR #34 section 13 makes Pilot B Stage 0
   confirm the baseline/comparability gate before Commit A. Its section 11
   assigns EWF observations/measurement metadata to the existing
   implementation-report extension surface under the exact W1 product evidence
   allowlist, rather than creating another evidence path or authority.

E5 responsibility is only to produce complete canonical phase evidence and the
canonical upload name. It must expose all fields in the matrix above. It must
not invent a counterpart lookup, mutable pair registry, second workflow,
database, status record, or pair-evidence API.

The downstream carrier is the already allowed Pilot B evidence Commit C:
docs/superpowers/evidence/2026-08-06-w1-li-00-001/implementation-report.json
using its existing EWF-namespaced extension and existing trace/brief/evidence
digest bindings. Before Commit A, the future Pilot B executor reads back and
validates the baseline phase identity as required by substrate section 12 and
PR #34 section 13. After assisted measurement, Commit C binds both phase
artifacts, GitHub post-upload metadata, authorized A/B lineage, allowed paths,
and the final COMPARABLE or COMPARABILITY_INVALID result. Commit C cannot
invent missing raw content.

## Required remediation boundary

The successor must remediate every item below and preserve all other controls.

1. Required five-state sequencing: PASS and FAIL execute and continue; ERROR,
   NOT_AVAILABLE, and NOT_RUN fail closed; no retry/coercion/relabeling.
2. Controlled measurement fingerprint: exclude productSubject and include every
   canonical controlled field in the matrix. Host-only diagnostics remain
   diagnostic.
3. Persisted real-Pilot command rows: include every normative section 7.2
   field, including fingerprints, manifest digest, product identity, and exact
   purpose-appropriate tooling revision, with stdout/stderr byte digests.
4. Raw evidence: treat phase artifact members, member hashes, and datasetDigest
   as NORMATIVE_GATE, not non-blocking evidence.
5. Workflow upload name: for PILOT_MEASUREMENT exactly
   ewf-measurement-attemptId-measurementPhase-productSubject12, where the final
   token is the first twelve hexadecimal characters of productSubject. Preserve
   the separate SAT namespace and evidence-domain separation.
6. Phase/pair boundary: emit only phase-local raw evidence; expose all canonical
   inputs needed by the downstream Pilot B Stage 0/Commit C owner.

The eight metrics remain exact. focusedDuration and manualOperations are
observed from their raw sources. The other six may remain UNKNOWN/null only when
their canonical raw evidence is unavailable; no value is invented or changed to
zero.

## Prospective recovery form and topology

FORM A — FROZEN E3 REUSE AS REMEDIATION PREDECESSOR is prospective only. If this
candidate receives independent ACCEPT, a new branch may start from exact E3
solely to form T5/E5/R6. This does not reinterpret E3 as accepted tooling or
alter PR #45.

Future implementation branch:
chatgpt/ewf00-measure-exec-001-real-pilot-readiness-remediation-v2

Topology:

    accepted AUTH-002
    -> immutable E3 predecessor
    -> T5 test only
    -> natural exact-head RED
    -> E5 tooling implementation only
    -> natural exact-head GREEN
    -> R6 SAT request/evidence carrier only
    -> natural dedicated SAT
    -> handoff
    -> Independent Implementation Audit
    -> STOP

| Commit | Allowlist | Role |
|---|---|---|
| T5 | tests/ewf-measurement-executor.test.mjs only | test-only regression contract |
| E5 | scripts/ewf-measurement-executor.mjs and .github/workflows/ewf-measurement.yml only | minimal source fixes plus upload-name workflow correction |
| R6 | exactly one new docs/superpowers/measurement-requests/<exact-carrier>.json | exact E5 SAT carrier only |

E5 may modify the workflow only for canonical upload naming. It may not redesign
the trigger, permissions, checkout topology, or SAT semantics. No product/LI
path, dependency, package/lockfile, database, canonical-status document, or
other documentation path is authorized. No repair commit after E5 is authorized.

## Frozen T5 regression assertions

- RP2-01 required PASS continues.
- RP2-02 required FAIL remains executed and continues.
- RP2-03 required ERROR blocks later required declarations.
- RP2-04 required NOT_AVAILABLE blocks later required declarations.
- RP2-05 NOT_RUN remains fail-closed.
- RP2-06 baseline and assisted product subjects differ without invalidating equal measurement context.
- RP2-07 every canonical controlled field contributes to the fingerprint.
- RP2-08 drift in every canonical controlled field invalidates comparability.
- RP2-09 host diagnostics alone do not invalidate comparability.
- RP2-10 every persisted PILOT_MEASUREMENT command row has every section 7.2 field.
- RP2-11 stdout/stderr refs and SHA-256 digests bind actual persisted bytes.
- RP2-12 exact externally authorized command manifest identity/order/digest remains binding.
- RP2-13 each raw Pilot phase artifact contains every required member.
- RP2-14 every artifact member digest and deterministic non-recursive datasetDigest verifies.
- RP2-15 real-Pilot artifact name matches the canonical phase pattern exactly.
- RP2-16 SAT artifact namespace remains distinct and cannot be Pilot evidence.
- RP2-17 all eight metrics preserve exact order/identity/unit/state schema.
- RP2-18 UNKNOWN is null and never zero; observed zero requires raw proof.
- RP2-19 product exact SHA/cleanliness remain immutable.
- RP2-20 child credentials remain stripped and absent from evidence.
- RP2-21 baseline temporal violation rejects phase evidence for downstream use.
- RP2-22 request-head supersession invalidates stale phase evidence.
- RP2-23 downstream pair-owner input contract is phase-evidence completeness, not an E5 pair registry.
- RP2-24 raw phase evidence carries every identity needed by Pilot B Stage 0 and Commit C.
- RP2-25 unrelated product path, wrong A/B lineage, or context drift remains invalid at downstream pair formation.
- RP2-26 post-upload metadata is bound only at the causal downstream stage.
- RP2-27 no artifact self-reference is introduced.
- RP2-28 no phase artifact, SAT, implementation, or workflow result grants acceptance, Ready, merge, or Pilot authority.

T5 RED is eligible only if it is a direct E3 child, changes only the T5
allowlist, preserves source/workflow bytes, and naturally fails for the new
readiness assertions rather than a historical/infrastructure defect.

## Complete readiness matrix

| # | Contract | Status |
|---|---|---|
| 01 | request exact-head identity | ALREADY_SATISFIED |
| 02 | Draft-only natural trigger | ALREADY_SATISFIED |
| 03 | request purpose separation | ALREADY_SATISFIED |
| 04 | accepted tooling resolver | ALREADY_SATISFIED |
| 05 | execution authorization resolver | ALREADY_SATISFIED |
| 06 | exact command authority | ALREADY_SATISFIED |
| 07 | required PASS continuation | ALREADY_SATISFIED |
| 08 | required FAIL continuation | REMEDIATION_REQUIRED |
| 09 | required ERROR fail-close | ALREADY_SATISFIED |
| 10 | required NOT_AVAILABLE fail-close | ALREADY_SATISFIED |
| 11 | required NOT_RUN semantics | ALREADY_SATISFIED |
| 12 | product checkout isolation | ALREADY_SATISFIED |
| 13 | product immutability | ALREADY_SATISFIED |
| 14 | credential isolation | ALREADY_SATISFIED |
| 15 | controlled fingerprint completeness | REMEDIATION_REQUIRED |
| 16 | productSubject excluded from equal context | REMEDIATION_REQUIRED |
| 17 | host diagnostics separation | ALREADY_SATISFIED |
| 18 | command-result field completeness | REMEDIATION_REQUIRED |
| 19 | stdout/stderr raw references | REMEDIATION_REQUIRED |
| 20 | phase environment completeness | REMEDIATION_REQUIRED |
| 21 | eight observation rows | ALREADY_SATISFIED |
| 22 | UNKNOWN/null semantics | ALREADY_SATISFIED |
| 23 | operation journal/seal | ALREADY_SATISFIED |
| 24 | artifact members | REMEDIATION_REQUIRED |
| 25 | member digests | REMEDIATION_REQUIRED |
| 26 | dataset digest | REMEDIATION_REQUIRED |
| 27 | canonical real-Pilot artifact name | REMEDIATION_REQUIRED |
| 28 | SAT/Pilot evidence-domain separation | ALREADY_SATISFIED |
| 29 | post-upload run/job/artifact bindings | DOWNSTREAM_CANONICAL_OWNER |
| 30 | baseline temporal gate | DOWNSTREAM_CANONICAL_OWNER |
| 31 | assisted exact-subject gate | DOWNSTREAM_CANONICAL_OWNER |
| 32 | authorized A/B lineage | DOWNSTREAM_CANONICAL_OWNER |
| 33 | allowedChangedPaths | DOWNSTREAM_CANONICAL_OWNER |
| 34 | pair ownership | DOWNSTREAM_CANONICAL_OWNER |
| 35 | pair input carrier | DOWNSTREAM_CANONICAL_OWNER |
| 36 | pair comparability result | DOWNSTREAM_CANONICAL_OWNER |
| 37 | pair invalidation on context drift | DOWNSTREAM_CANONICAL_OWNER |
| 38 | request-head supersession | REMEDIATION_REQUIRED |
| 39 | artifact expiry/unavailability semantics | DOWNSTREAM_CANONICAL_OWNER |
| 40 | no acceptance/status authority | ALREADY_SATISFIED |

Every row is resolved by an existing canonical owner or by the bounded E5
remediation. No unresolved blocker is carried into publication.

## Natural CI and stop conditions

T5, E5, and R6 require natural pull_request exact-head CI. Rerun,
workflow_dispatch, Ready/Draft toggle, close/reopen, empty/no-op commit, amend,
rebase, squash, force-push, or history rewrite does not qualify.

Stop before E5 on an invalid/ambiguous RED. Stop after E5 if its exact-head
GREEN fails or if any extra path, dependency, runtime, store, status authority,
or product change is needed. Stop if R6 is not one carrier direct child of E5,
does not bind candidateToolingRevision to exact E5, or its dedicated SAT is
missing/red. No acceptance is inferred from CI.

## Machine-readable bounded execution capsule

```json
{
  "protocol": "BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1",
  "authorizationIdentity": "EWF00-MEASURE-EXEC-001-REAL-PILOT-READINESS-REMED-AUTH-002",
  "purpose": "REAL_PILOT_READINESS_TOOLING_REMEDIATION",
  "controllingCorrectiveAudit": {
    "pr": 45,
    "commentId": 5229506295,
    "verdict": "SUPERSEDED_FOR_REAL_PILOT_MEASUREMENT / REMEDIATION_REQUIRED"
  },
  "rejectedPredecessorAuthorization": {
    "pr": 47,
    "head": "2fc95b74676aaacf793be5d2edb1ce86a55850ce",
    "blob": "80d5706db789a7e293d6d3fb3a717ecd41e96336",
    "verdictCommentId": 5229691315,
    "state": "REJECTED_NOT_EFFECTIVE_FROZEN"
  },
  "historicalToolingRevision": "c64b926a596855237add816ff9c07f2558cfa971",
  "historicalToolingStatus": "SUPERSEDED_FOR_REAL_PILOT_MEASUREMENT",
  "recoveryForm": "FORM_A_FROZEN_E3_REUSE_AS_REMEDIATION_PREDECESSOR",
  "implementationPredecessor": "c64b926a596855237add816ff9c07f2558cfa971",
  "futureBranch": "chatgpt/ewf00-measure-exec-001-real-pilot-readiness-remediation-v2",
  "topology": ["T5_TEST_ONLY", "NATURAL_EXACT_HEAD_RED", "E5_TOOLING_ONLY", "NATURAL_EXACT_HEAD_GREEN", "R6_SAT_EVIDENCE_ONLY", "NATURAL_DEDICATED_SAT", "HANDOFF", "INDEPENDENT_IMPLEMENTATION_AUDIT", "STOP"],
  "commitAllowlists": {
    "T5": ["tests/ewf-measurement-executor.test.mjs"],
    "E5": ["scripts/ewf-measurement-executor.mjs", ".github/workflows/ewf-measurement.yml"],
    "R6": ["docs/superpowers/measurement-requests/<exact-carrier>.json"]
  },
  "pairFormationOwnership": {
    "model": "MODEL_B_DOWNSTREAM_CANONICAL_OWNER",
    "phaseEvidenceOwner": "E5 measurement substrate",
    "downstreamOwner": "Pilot B Stage 0 plus existing implementation-report EWF extension in evidence Commit C",
    "carrier": "docs/superpowers/evidence/2026-08-06-w1-li-00-001/implementation-report.json",
    "e5MustNotCreate": ["pair registry", "counterpart lookup runtime", "state authority", "new evidence path"]
  },
  "rawEvidenceContract": {
    "classification": "NORMATIVE_GATE",
    "requiredMembers": ["environment.json", "command-results.json", "measurement-observations.json", "operation-journal.json", "artifact-manifest.json", "commands/<ordinal>-<commandId>.stdout.txt", "commands/<ordinal>-<commandId>.stderr.txt"],
    "commandResultSchema": "EWF00-MEASURE-EXEC-001 section 7.2 complete normative field set"
  },
  "artifactNamingContract": {
    "pilotMeasurement": "ewf-measurement-<attemptId>-<measurementPhase>-<productSubject[0:12]>",
    "satDomainRemainsSeparate": true
  },
  "requiredBehaviorAssertions": ["RP2-01", "RP2-02", "RP2-03", "RP2-04", "RP2-05", "RP2-06", "RP2-07", "RP2-08", "RP2-09", "RP2-10", "RP2-11", "RP2-12", "RP2-13", "RP2-14", "RP2-15", "RP2-16", "RP2-17", "RP2-18", "RP2-19", "RP2-20", "RP2-21", "RP2-22", "RP2-23", "RP2-24", "RP2-25", "RP2-26", "RP2-27", "RP2-28"],
  "pilotBExecutionAuthorized": false,
  "li00Accepted": false,
  "ewf00Accepted": false,
  "mergeAuthority": "NONE"
}
```

## Non-effects and successor acceptance

T5, E5, R6, this authorization head, all SAT artifacts, and historical E3 are
not acceptedMeasurementToolingRevision. Only exact E5, after a separate
Independent Implementation Audit ACCEPT, may acquire that identity. A separate
accepted Pilot execution authorization remains required before any real
PILOT_MEASUREMENT.

Final state:

    AUTHORIZATION: CANDIDATE ONLY / PENDING INDEPENDENT AUDIT
    T5: NOT_STARTED
    E5: NOT_STARTED
    R6: NOT_STARTED
    PILOT_MEASUREMENT: NOT_EXECUTED
    PILOT B: NOT_STARTED / NOT AUTHORIZED TO RESTART
    LI-00: NOT_ACCEPTED
    EWF-00: NOT_ACCEPTED
    INDEPENDENT VERDICT: NOT_ISSUED_BY IMPLEMENTER
    MERGE AUTHORITY: NONE

STOP: await Independent Authorization Audit.
