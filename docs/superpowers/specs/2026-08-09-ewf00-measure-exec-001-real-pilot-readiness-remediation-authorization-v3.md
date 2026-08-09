# EWF00-MEASURE-EXEC-001 Real-Pilot Readiness Remediation Authorization V3

## Identity and authority boundary

| Field | Value |
|---|---|
| Authorization ID | EWF00-MEASURE-EXEC-001-REAL-PILOT-READINESS-REMED-AUTH-003 |
| Repository | NguyenDukKyeon/VocabMaster |
| Formation main | f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e |
| Protocol | BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1 |
| Role | DOCS-ONLY AUTHORIZATION IMPLEMENTER |
| State | CANDIDATE ONLY / PENDING INDEPENDENT AUDIT |

This replacement candidate authorizes no current source, test, workflow, product,
LI-00, Pilot B, real Pilot measurement, status, Ready, acceptance, merge,
deployment, or self-acceptance action. Its prospective bounded execution
authority exists only after an Independent Authorization Auditor accepts this
exact candidate head.

## Fresh formation and historical provenance

| Class | Fresh-verified identity and status |
|---|---|
| Current main | f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e |
| Historical tooling E3 | c64b926a596855237add816ff9c07f2558cfa971; direct parent 089f1942de086931927e0daa1692e3cb5ffcad30; only workflow and executor paths changed |
| PR #45 corrective verdict | Comment 5229506295: SUPERSEDED_FOR_REAL_PILOT_MEASUREMENT / REMEDIATION_REQUIRED |
| PR #47 rejected authorization | AUTH-001; head 2fc95b74676aaacf793be5d2edb1ce86a55850ce; REJECT 5229691315; FROZEN |
| PR #48 rejected authorization | AUTH-002; head c5271a8199c45d10a6c98b3e455ca929fe5808d6; blob 16aeb2483fe396b69b8943b166966f8decc8cda4; REJECT; FROZEN |
| Canonical substrate | EWF00-MEASURE-EXEC-001 sections 7.2, 8, 11.1, 12 and 13; ME-10, ME-12, ME-18, ME-20, ME-21 and ME-22 |

PR #45, PR #47 and PR #48 are immutable historical provenance. They MUST NOT
be modified, amended, rebased, force-pushed, Ready-toggled, closed/reopened,
merged, or reinterpreted as effective authority. E3 remains superseded as
acceptedMeasurementToolingRevision for new real PILOT_MEASUREMENT.

The raw Independent Audit of PR #48 accepted its formation and AUTH-002
repairs, then rejected only these dimensions:

1. real-Pilot HOST_DIAGNOSTICS capture/persistence;
2. a section-13-conforming substrate pair-ownership decision; and
3. stale/exhausted hardcoding of a future Pilot evidence carrier.

V3 carries every non-rejected AUTH-002 boundary and repairs exactly those
three dimensions. It does not restart the W0 conformance audit.

## Remediation predecessor and future topology

The accepted recovery form supports prospective immutable E3 reuse as the
remediation predecessor. If and only if this exact AUTH-003 is independently
accepted, a successor may start at exact E3. That reuse does not restore E3 as
accepted tooling and does not authorize any Pilot.

Future branch:

    chatgpt/ewf00-measure-exec-001-real-pilot-readiness-remediation-auth-v3

Frozen topology:

    accepted AUTH-003
    -> immutable E3 predecessor
    -> T_REALPILOT_V3 — TEST ONLY
    -> natural exact-head RED
    -> E_REALPILOT_V3 — TOOLING IMPLEMENTATION ONLY
    -> natural exact-head GREEN
    -> R_REALPILOT_SAT_V3 — SAT REQUEST ONLY
    -> natural dedicated SAT
    -> HANDOFF
    -> INDEPENDENT IMPLEMENTATION AUDIT
    -> STOP

| Commit | Exact allowlist | Boundary |
|---|---|---|
| T_REALPILOT_V3 | tests/ewf-measurement-executor.test.mjs | Test-only, direct E3 child; E3 source/workflow bytes unchanged |
| E_REALPILOT_V3 | scripts/ewf-measurement-executor.mjs; .github/workflows/ewf-measurement.yml | Minimal tooling remediation only; workflow only for canonical workflow-owned behavior, including real-Pilot artifact naming |
| R_REALPILOT_SAT_V3 | exactly one new docs/superpowers/measurement-requests/<exact-sat-request>.json | SAT request only; binds exact E implementation identity |

No LI/product source, dependency/package/lockfile, database, pair registry, new
runtime, canonical status document, Pilot B evidence file, or other path is
authorized. An invalid/ambiguous RED or failed E GREEN requires STOP; no repair
commit is authorized. Every qualifying CI must be a natural pull_request
exact-head event. Rerun, workflow_dispatch, Ready/Draft toggle, close/reopen,
empty commit, amend, rebase, squash and force-push do not qualify.

## Carried-forward AUTH-002 remediation contract

The future implementation MUST preserve these valid AUTH-002 requirements:

- required PASS continues; required FAIL executes and continues; required ERROR,
  NOT_AVAILABLE and NOT_RUN fail closed;
- every canonical controlled field participates in controlled fingerprint;
  productSubject is excluded from controlled equality;
- each real-Pilot command row is complete under section 7.2, including command
  authority, product/tooling identities, fingerprint, stdout/stderr references
  and byte digests;
- environment.json, command-results.json, raw artifact members, member hashes,
  and deterministic non-recursive datasetDigest are complete normative evidence;
- the real-Pilot artifact name is exactly
  ewf-measurement-<attemptId>-<measurementPhase>-<productSubject[0:12]>;
- SAT and Pilot remain disjoint evidence domains;
- stale request heads invalidate datasets; product checkout is exact and
  immutable; child credentials are absent from execution/evidence;
- all eight metric rows retain exact semantics; genuinely unavailable metrics
  remain UNKNOWN/null, never invented zero; and
- post-upload run/job/artifact identities bind only after GitHub makes them
  knowable. No raw pre-upload artifact fabricates self-referential values.

## V3 repair A — real-Pilot HOST_DIAGNOSTICS

REAL_PILOT_HOST_DIAGNOSTICS is REMEDIATION_REQUIRED.

For every real PILOT_MEASUREMENT phase, the implementation MUST collect
truthfully available canonical host diagnostics and persist them in real-Pilot
environment.json and raw evidence. Supported fields, only where actually
available from the workflow/runtime, include runnerImageOS, runnerImageVersion,
runner instance identity and host patch metadata. Unsupported optional fields
must remain unavailable or be omitted according to the frozen raw-evidence
schema. They MUST NOT be synthesized, inferred or fabricated.

HOST_DIAGNOSTICS is diagnostic evidence, not controlled equality. It remains
outside controlledEnvironmentFingerprint; host-only diagnostic change, including
routine runner-image/patch drift, MUST NOT invalidate an otherwise valid pair.
Tests MUST inspect persisted real-Pilot environment/raw-artifact evidence, not a
helper return, and prove both persistence and host-only non-invalidation.

## V3 repair B — substrate-owned controlled-pair validator

Canonical section 13 remains substrate-owned. The architecture is frozen:

| Owner | Immutable responsibility |
|---|---|
| Measurement substrate | Controlled pair schema; pair validation algorithm; comparabilityResult semantics; deterministic comparabilityDiagnostics semantics |
| Phase workflow | Complete immutable baseline phase evidence; complete immutable assisted phase evidence |
| Future Pilot execution | Separately authorized A/B topology; exact identities of both phase datasets; invoke accepted substrate validator after both exist; carry immutable result into its authorized evidence carrier |

The future carrier does not invent comparability. It invokes the exact accepted
substrate validator and carries its immutable output unchanged. Historical E3
already exposes validateBaselineTemporalGate(...), validateControlledPair(...)
and computeControlledEnvironmentFingerprint(...); accepted remediation may
extend/repair those only within the tooling boundary.

No database, pair registry, mutable state service, new workflow type, daemon or
new runtime is authorized. The validator consumes explicit immutable envelopes:

| Envelope | Required immutable content |
|---|---|
| Pair identity | measurementPairId, attemptId, schema/method/raw-evidence revisions, accepted tooling revision, ordered declaration identities and manifest digest |
| Baseline phase | exact request PR/head/commit, baseline subject, raw dataset digest, sealed journal digest, complete persisted environment/command/raw evidence, post-upload read-back identities when knowable |
| Assisted phase | exact request PR/head/commit, assisted subject, raw dataset digest, sealed journal digest, complete persisted environment/command/raw evidence, post-upload read-back identities when knowable |
| Authorized topology | baseline parent, lineage anchor, authorized product delta, allowed changed paths, baseline-before-Commit-A relation, and externally authorized A/B path/lineage constraints |

Missing, malformed, unavailable, expired, superseded, incomplete or invalid raw
dataset/journal MUST be rejected, not reconstructed from narrative. The
validator validates controlled context, ordered command authority, temporal
gate, request-head currentness, exact delta and allowed paths. It outputs only
COMPARABLE or COMPARABILITY_INVALID, with deterministic
comparabilityDiagnostics. It has no stateful lookup or side effect and grants
no acceptance, Ready, merge or Pilot authority.

## V3 repair C — future Pilot carrier deferred

This tooling authorization freezes the pair-validator interface and phase
evidence/validator boundary only. It MUST NOT hardcode either historical path:

- docs/superpowers/evidence/2026-08-06-w1-li-00-001/...; or
- docs/superpowers/evidence/2026-08-08-w1-li-00-001-pilot-b-recovery-001/....

The PR #37 recovery attempt is exhausted historical provenance. Exact future
Pilot attempt ID, measurementPairId, baseline request, assisted request,
evidence directory and Commit C carrier MUST be frozen later by a separately
independently accepted Pilot B execution/recovery authorization after successor
tooling is independently accepted.

    futurePilotCarrierAuthority =
    FUTURE_SEPARATELY_ACCEPTED_PILOT_EXECUTION_AUTHORIZATION

This candidate neither selects nor authorizes a new Pilot B attempt.

## Required T_REALPILOT_V3 regression contract

The test-only commit MUST add persisted/runtime assertions for all of these;
source-string, DOM-presence or unpersisted-helper assertions are insufficient.

1. required PASS continues;
2. required FAIL executes and continues;
3. required ERROR blocks;
4. required NOT_AVAILABLE blocks;
5. required NOT_RUN remains fail-closed;
6. baseline/assisted product SHAs may differ;
7. productSubject is excluded from controlled equality;
8. every canonical controlled field participates in fingerprint;
9. controlled-field drift invalidates pair;
10. real-Pilot HOST_DIAGNOSTICS persisted;
11. host diagnostics excluded from equality;
12. host-only drift does not invalidate pair;
13. persisted command-results.json complete;
14. stdout/stderr refs and digests verify bytes;
15. environment.json complete;
16. raw Pilot artifact complete;
17. member hashes verify;
18. datasetDigest deterministic;
19. canonical Pilot artifact name exact;
20. SAT domain cannot become Pilot evidence;
21. eight metric rows preserve exact semantics;
22. UNKNOWN/null never becomes zero;
23. product checkout immutable;
24. child credentials absent;
25. stale request head invalidates dataset;
26. baseline temporal violation rejects;
27. substrate validator accepts valid immutable pair;
28. substrate validator rejects controlled context drift;
29. substrate validator rejects unauthorized A/B path/lineage drift;
30. substrate validator rejects missing/invalid raw dataset or journal;
31. validator emits only COMPARABLE or COMPARABILITY_INVALID;
32. no mutable pair registry/store/runtime exists;
33. post-upload identities bind only after knowable; and
34. no tooling/SAT/artifact grants acceptance, Ready, merge or Pilot authority.

The natural RED is eligible only when it is direct E3 child, modifies only the
test allowlist, preserves E3 source/workflow bytes and fails naturally for
these assertions. E follows only valid RED and must achieve natural exact-head
GREEN. SAT is evidence only, cannot repair E and cannot accept tooling.

## Machine-readable bounded execution capsule

```json
{
  "protocol": "BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1",
  "authorizationIdentity": "EWF00-MEASURE-EXEC-001-REAL-PILOT-READINESS-REMED-AUTH-003",
  "purpose": "REAL_PILOT_READINESS_TOOLING_REMEDIATION",
  "formationMain": "f0080ca8c52b6002a61dc4cbea9cf5b3377ebe8e",
  "historicalToolingRevision": "c64b926a596855237add816ff9c07f2558cfa971",
  "historicalToolingStatus": "SUPERSEDED_FOR_REAL_PILOT_MEASUREMENT / REMEDIATION_REQUIRED",
  "pr45CorrectiveVerdict": {"pr": 45, "commentId": 5229506295, "verdict": "SUPERSEDED_FOR_REAL_PILOT_MEASUREMENT / REMEDIATION_REQUIRED"},
  "pr47RejectedAuthorization": {"authorizationIdentity": "EWF00-MEASURE-EXEC-001-REAL-PILOT-READINESS-REMED-AUTH-001", "pr": 47, "head": "2fc95b74676aaacf793be5d2edb1ce86a55850ce", "verdictCommentId": 5229691315, "state": "REJECTED_FROZEN"},
  "pr48RejectedAuthorization": {"authorizationIdentity": "EWF00-MEASURE-EXEC-001-REAL-PILOT-READINESS-REMED-AUTH-002", "pr": 48, "head": "c5271a8199c45d10a6c98b3e455ca929fe5808d6", "blob": "16aeb2483fe396b69b8943b166966f8decc8cda4", "state": "REJECTED_FROZEN"},
  "implementationPredecessor": "c64b926a596855237add816ff9c07f2558cfa971",
  "futureBranch": "chatgpt/ewf00-measure-exec-001-real-pilot-readiness-remediation-auth-v3",
  "topology": ["T_REALPILOT_V3_TEST_ONLY", "NATURAL_EXACT_HEAD_RED", "E_REALPILOT_V3_TOOLING_IMPLEMENTATION_ONLY", "NATURAL_EXACT_HEAD_GREEN", "R_REALPILOT_SAT_V3_SAT_REQUEST_ONLY", "NATURAL_DEDICATED_SAT", "HANDOFF", "INDEPENDENT_IMPLEMENTATION_AUDIT", "STOP"],
  "commitAllowlists": {"T_REALPILOT_V3": ["tests/ewf-measurement-executor.test.mjs"], "E_REALPILOT_V3": ["scripts/ewf-measurement-executor.mjs", ".github/workflows/ewf-measurement.yml"], "R_REALPILOT_SAT_V3": ["docs/superpowers/measurement-requests/<exact-sat-request>.json"]},
  "requiredRegressionAssertions": ["required_PASS_continues", "required_FAIL_executes_and_continues", "required_ERROR_blocks", "required_NOT_AVAILABLE_blocks", "required_NOT_RUN_fail_closed", "product_SHA_difference_allowed", "productSubject_excluded_from_controlled_equality", "all_canonical_controlled_fields_fingerprinted", "controlled_field_drift_invalidates", "real_Pilot_host_diagnostics_persisted", "host_diagnostics_excluded_from_equality", "host_only_drift_does_not_invalidate", "persisted_command_results_complete", "stdout_stderr_byte_digests_verify", "environment_complete", "raw_Pilot_artifact_complete", "member_hashes_verify", "datasetDigest_deterministic", "canonical_artifact_name_exact", "SAT_domain_cannot_be_Pilot", "eight_metric_rows_exact", "UNKNOWN_null_never_zero", "product_checkout_immutable", "child_credentials_absent", "stale_request_head_invalidates", "baseline_temporal_violation_rejects", "validator_accepts_valid_immutable_pair", "validator_rejects_controlled_context_drift", "validator_rejects_unauthorized_path_or_lineage_drift", "validator_rejects_missing_or_invalid_raw_dataset_or_journal", "validator_output_is_two_state_only", "no_mutable_pair_registry_store_or_runtime", "post_upload_identities_bind_when_knowable", "no_tooling_SAT_or_artifact_authority_grant"],
  "hostDiagnosticsContract": {"classification": "REMEDIATION_REQUIRED", "persistedIn": ["PILOT_MEASUREMENT environment.json", "PILOT_MEASUREMENT raw evidence"], "truthfulAvailableFields": ["runnerImageOS", "runnerImageVersion", "runnerInstanceIdentity", "hostPatchMetadata"], "neverFabricateUnavailableFields": true, "excludedFromControlledEnvironmentFingerprint": true, "hostOnlyDriftInvalidatesPair": false, "testsMustInspectPersistedEvidence": true},
  "controlledEnvironmentContract": {"completeCanonicalControlledFieldsRequired": true, "productSubjectExcluded": true, "hostDiagnosticsExcluded": true, "controlledFieldDriftResult": "COMPARABILITY_INVALID"},
  "rawPilotEvidenceContract": {"classification": "NORMATIVE_GATE", "requiredMembers": ["environment.json", "command-results.json", "measurement-observations.json", "operation-journal.json", "artifact-manifest.json", "commands/<ordinal>-<commandId>.stdout.txt", "commands/<ordinal>-<commandId>.stderr.txt"], "requiresMemberHashes": true, "requiresDeterministicDatasetDigest": true, "requiresCompleteSection72CommandRows": true, "canonicalArtifactName": "ewf-measurement-<attemptId>-<measurementPhase>-<productSubject[0:12]>"},
  "pairValidatorOwnership": {"measurementSubstrate": ["controlled_pair_schema", "pair_validation_algorithm", "comparabilityResult_semantics", "comparabilityDiagnostics_semantics"], "phaseWorkflow": ["complete_immutable_baseline_phase_evidence", "complete_immutable_assisted_phase_evidence"], "futurePilotExecution": ["authorized_A_B_topology", "exact_phase_dataset_identities", "invoke_accepted_substrate_validator", "carry_immutable_result_to_authorized_evidence_carrier"], "forbiddenNewInfrastructure": ["database", "pair_registry", "mutable_state_service", "new_workflow_type", "daemon", "new_runtime"]},
  "pairValidatorInputContract": {"immutableEnvelopes": ["pair_identity_and_measurement_contract", "complete_baseline_phase_evidence", "complete_assisted_phase_evidence", "authorized_A_B_topology_and_lineage"], "requiresRawDatasetAndJournalValidation": true, "requiresCurrentRequestHeads": true, "requiresExactAuthorizedDeltaAndPaths": true, "requiresBaselineBeforeCommitA": true},
  "pairValidatorOutputContract": {"comparabilityResultValues": ["COMPARABLE", "COMPARABILITY_INVALID"], "deterministicComparabilityDiagnostics": true, "sideEffects": "NONE"},
  "futurePilotCarrierAuthority": "FUTURE_SEPARATELY_ACCEPTED_PILOT_EXECUTION_AUTHORIZATION",
  "pilotBExecutionAuthorized": false,
  "li00Accepted": false,
  "ewf00Accepted": false,
  "mergeAuthority": "NONE"
}
```

## Status, non-effects and handoff

    AUTHORIZATION: CANDIDATE ONLY / PENDING INDEPENDENT AUDIT
    TOOLING REMEDIATION: NOT_STARTED
    PILOT_MEASUREMENT: NOT_EXECUTED
    PILOT B: NOT_STARTED / NOT AUTHORIZED TO RESTART
    LI-00: NOT_ACCEPTED
    EWF-00: NOT_ACCEPTED
    INDEPENDENT VERDICT: NOT_ISSUED BY IMPLEMENTER
    MERGE AUTHORITY: NONE

No candidate, T/E/R commit, SAT request, SAT artifact, raw Pilot artifact,
validator output or CI result grants acceptance, Ready, merge or Pilot
authority. Independent implementation audit remains mandatory after the bounded
tooling sequence. A separately accepted Pilot B execution/recovery authorization
is mandatory before baseline or assisted PILOT_MEASUREMENT.

Next: Independent Authorization Audit.

STOP.
