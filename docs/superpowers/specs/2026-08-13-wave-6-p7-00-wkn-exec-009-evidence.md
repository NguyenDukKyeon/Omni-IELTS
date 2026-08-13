---
schema_id: W6_P7_00_WKN_EXEC_EVIDENCE_V3
authority_label: IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE
authorization_id: W6-P7-00-WKN-AUTH-009
execution_record_id: W6-P7-00-WKN-EXEC-009
implementation_subject: P7-00 / WKN-00
exact_predecessor: 66666172238668b1ea40d7ff596c82c209fcdfe5
accepted_authorization:
  pr: 65
  head_sha: 48722d422911857951f320836df2ef9b4dd74068
  manifest_blob: 0062a501fd936da49abb4b9c091552e207e94bec
  independent_accept_comment: 5275168800
baseline_ci:
  workflow: CI
  workflow_id: 322561862
  event: push
  run_number: 361
  run_id: 31623561426
  head_sha: 66666172238668b1ea40d7ff596c82c209fcdfe5
  conclusion: success
commit_a:
  sha: bdcba6acf5cb70aaa0884900afbb0027f5d97327
  parent: 66666172238668b1ea40d7ff596c82c209fcdfe5
  changed_paths:
    - tests/progress.test.mjs
  test_blob: b783ec21ffd32d1547e7cc0488b7bfeb101b0937
red_ci:
  workflow: CI
  workflow_id: 322561862
  event: pull_request
  head_sha: bdcba6acf5cb70aaa0884900afbb0027f5d97327
  run_number: 367
  run_id: 31661198411
  job_id: 94326213080
  conclusion: failure
  first_cause: "AssertionError [ERR_ASSERTION]: canonical evidence-decided payload must be counted by progress (expected 1, actual 0)"
  red_eligible: true
canonical_fixtures:
  package_subtest: "P7-00 canonical cross-surface metrics reconcile Core IELTS and V10 without promoting coaching evidence"
  construction:
    Core:
      path: buildCoreEvidenceEnvelope -> decideEvidence -> buildLearningEventRecords -> evidence-decided
      controlled_source_ids:
        - core-card:core-shared
        - core-card:core-assisted
      canonical_event_validation: true
      observed_positive_eligibility: true
      observed_excluded_reason: assistance-exposed
    IELTS:
      path: buildIeltsEvidenceEnvelope -> returned decision -> buildLearningEventRecords -> evidence-decided
      controlled_source_id: ielts-source:controlled-good
      canonical_event_validation: true
      observed_positive_eligibility: true
      observed_reason: qualified-independent-evidence
    V10:
      path: buildV10CoachingEnvelope -> returned decision -> buildLearningEventRecords -> evidence-decided
      controlled_source_id: v10-source:controlled-coaching
      canonical_event_validation: true
      observed_positive_eligibility: false
      observed_reason: assistance-exposed
commit_b:
  sha: f8ec2f91305f44b6b16667b7d1705303d1a63377
  parent: bdcba6acf5cb70aaa0884900afbb0027f5d97327
  changed_paths:
    - src/progress.js
    - src/p7-00-metrics-reducer.js
    - src/weakness-profile.js
  immutable_test_blob:
    commit_a: b783ec21ffd32d1547e7cc0488b7bfeb101b0937
    commit_b: b783ec21ffd32d1547e7cc0488b7bfeb101b0937
green_ci:
  workflow: CI
  workflow_id: 322561862
  event: pull_request
  head_sha: f8ec2f91305f44b6b16667b7d1705303d1a63377
  run_number: 368
  run_id: 31661625148
  job_id: 94327433588
  run_attempt: 1
  conclusion: success
  runner_node: v22.23.1
  runner_npm: 10.9.8
named_package_test_evidence:
  artifact: verification-output
  artifact_id: 9166387920
  artifact_digest: sha256:02aec583b7e4cd47b14d741a75dac3c12ffe1245345a011795989e26e95e5ffa
  bound_run_id: 31661625148
  bound_head_sha: f8ec2f91305f44b6b16667b7d1705303d1a63377
  raw_subtest_number: 476
  raw_subtest_result: PASS
  raw_subtest_name: "P7-00 canonical cross-surface metrics reconcile Core IELTS and V10 without promoting coaching evidence"
  full_suite:
    tests: 916
    pass: 916
    fail: 0
    skipped: 0
    todo: 0
cross_surface_contract:
  deduplicated_total: 5
  surface_totals:
    Core: 3
    IELTS: 1
    V10: 1
    Unknown: 0
  eligible_denominator: 3
  eligible_surface_totals:
    Core: 2
    IELTS: 1
    V10: 0
    Unknown: 0
  excluded_total: 2
  excluded_surface_totals:
    Core: 1
    IELTS: 0
    V10: 1
    Unknown: 0
  excluded_by_reason:
    assistance-exposed: 2
  numerator: 2
  reconciliation_percent: 100
  reconciliation_result: RECONCILED
digest_witness:
  kind: DETERMINISTIC_DIGEST_WITNESS_V1
  authority: IMPLEMENTER_WITNESS_NOT_CI_OUTPUT
  algorithm: learningContractDigest
  algorithm_source: src/learning-contracts.js
  algorithm_source_blob: 1410f76ab367a90ef25b7b85b67471d02b2e29c8
  purpose: "Bind deterministic canonical decision-shape input/output digests separately from the raw CI behavioral fixture. The raw CI artifact above is the acceptance evidence for the production builder path and named cross-surface assertions."
  canonical_input_digest: fnv1a64:830:19761ac808c55682
  metrics_output_digest: fnv1a64:16183:00fa36b12f6bddcb
  weakness_profile_output_digest: fnv1a64:777:b09340a91468d34b
  weakness_profile_input_digest: fnv1a64:530:6822d19b5903f9df
  deterministic_replay_result: PASS
  witness_surface_totals:
    Core: 3
    IELTS: 1
    V10: 1
    Unknown: 0
  witness_eligible_surface_totals:
    Core: 2
    IELTS: 1
    V10: 0
    Unknown: 0
  witness_excluded_surface_totals:
    Core: 1
    IELTS: 0
    V10: 1
    Unknown: 0
  witness_excluded_by_reason:
    assistance-exposed: 2
  witness_reconciliation:
    percent: 100
    result: RECONCILED
migration_result:
  NO_DESTRUCTIVE_MIGRATION: true
  RAW_CANONICAL_EVENTS_UNCHANGED: true
  PROJECTION_REBUILDABLE: true
  LEGACY_COUNTERS_READ_ONLY_COMPARISON_ONE_RELEASE: true
  detail: "EXEC-009 changes no persistence/event/schema/legacy-counter storage path. The P7-00 projection is a pure versioned reducer rebuilt from canonical event inputs; no persisted projection cache is introduced by this capsule. Existing legacy counters remain untouched comparison behavior and are not promoted to canonical truth."
rollback_result:
  DROP_OR_IGNORE_NEW_PROJECTION: true
  RETAIN_RAW_CANONICAL_EVENTS: true
  RETAIN_LEGACY_COUNTERS: true
  RETAIN_IMPLEMENTER_EVIDENCE: true
  NO_HISTORY_REWRITE: true
  detail: "Rollback is code-level removal/ignore of the new reducer/profile seam. Because no canonical event, persistence schema, or legacy counter is rewritten, raw history and prior counters remain intact. This evidence commit remains historical even if the implementation is rejected or rolled back."
source_blob_bindings:
  src/progress.js: 76b2e5a0907bd3f95991ea6d48a707273ad2d5c7
  src/p7-00-metrics-reducer.js: b281f2614636e3284d70f90796313aaa78eff16f
  src/weakness-profile.js: 76bd796f2cbee2d0cf2daaf1c7d05ed7ac1e57b1
read_only_digest_primitive:
  src/learning-contracts.js: 1410f76ab367a90ef25b7b85b67471d02b2e29c8
verification_profile:
  phase0_gate_required: false
  phase0_gate_claimed_executed: false
  natural_ci_profile_result: PASS
  natural_ci_commands_observed:
    - npm ci --no-audit --no-fund
    - npm test
    - npm run check
    - npm run audit:roadmap
    - npm run audit:ielts
    - npm run test:v10
    - npm run audit:v10
    - npm run build
    - npm run phase4:verify
    - npm run phase5:verify
    - npm run test:serve
    - npm run test:preview
    - npm run test:browser
    - npm run test:ielts-browser
    - npm run test:v10-browser
    - npm run test:hardening
unresolved_limitations:
  - "Several canonical P7-00 metric domains (delayed success, coverage, stability, recurrence, content completion) intentionally return explicit INSUFFICIENT_DATA under this bounded reducer when the required canonical denominator/policy input is absent; they are not fabricated as measured zero."
  - "The literal digest witness values are implementer-computed deterministic witness bindings using the repository learningContractDigest algorithm; the natural CI artifact validates the frozen production-builder behavior and digest determinism assertions but does not print the literal digest values. These evidence classes are intentionally kept distinct."
commit_c_parent: f8ec2f91305f44b6b16667b7d1705303d1a63377
commit_c_changed_paths:
  - docs/superpowers/specs/2026-08-13-wave-6-p7-00-wkn-exec-009-evidence.md
commit_c_sha_carrier: EXTERNAL_OBSERVED_BINDING
final_exact_c_sha: EXTERNALLY_OBSERVED_AFTER_COMMIT_C_NOT_SELF_EMBEDDED
final_c_ci: EXTERNALLY_OBSERVED_AFTER_COMMIT_C_NOT_SELF_EMBEDDED
---

# W6-P7-00-WKN-EXEC-009 Implementer Evidence

## Authority boundary

This record is **IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE**. It does not grant independent implementation acceptance, package acceptance, merge authority, canonical status mutation, or authority for any downstream Wave 6 package.

## Natural RED

Commit A is test-only and descends directly from the exact accepted predecessor. Its first natural CI failure is the frozen product-behavior defect: predecessor `summarizeReviewQuality(...)` receives a real canonical nested Core `evidence-decided` record and returns zero reviews where one eligible canonical record is required. The controlled Core, IELTS and V10 production fixtures are constructed and canonical-event-validated before this assertion. No missing future module/export, syntax, dependency, fixture, or infrastructure failure precedes the behavioral failure.

## Cross-surface immutable test contract

The Commit-A test blob is byte/Git-blob identical at Commit B. The controlled matrix uses production builders for all three surfaces. Core and IELTS produce positive eligible evidence under current policy. V10 sentence-loop coaching remains canonical but ineligible with `assistance-exposed`; it is source-drillable and counted in V10 total/excluded reconciliation without being promoted into the positive denominator.

The named P7-00 package subtest passed inside raw `npm test` evidence on exact GREEN run #368. The `verification-output` artifact binds the raw test output to the exact run/head, and the full test suite reports 916 pass, zero fail/skipped/todo.

## Minimal GREEN

Commit B changes only the three accepted source paths. `src/progress.js` exposes the canonical reducer and WeaknessProfile seam while preserving legacy flat review summarization compatibility. Canonical truth reads `canonical-learning-event` identity plus nested `event.payload` eligibility/result/target values.

The reducer deduplicates replay by stable event identity, rejects conflicting same-ID/different-digest inputs, sorts equivalent input sets deterministically, preserves full included/excluded provenance, reconciles Core/IELTS/V10/Unknown totals, and treats unavailable metric domains as explicit `INSUFFICIENT_DATA` rather than measured zero. The WeaknessProfile is versioned, deterministic, browser-safe, exposes sparse/conflict uncertainty/reason semantics and canonical refs, and does not emit readiness or band claims.

## Verification and provenance

Natural exact-head CI #368 is SUCCESS for the exact Commit-B PR head and passes the frozen natural CI profile. The required `verification-output` artifact is bound above by name, ID, SHA-256 digest, run and head.

The deterministic digest witness is deliberately a separate implementer evidence class. It uses the repository `learningContractDigest` algorithm to bind deterministic frozen decision/output shapes and does not pretend those literal values were printed by CI. Behavioral production-builder acceptance remains grounded in the raw CI artifact and immutable package test.

## Migration and rollback

No persistence, event repository, storage schema, canonical raw event, or legacy counter path changes. The projection/profile is a pure versioned projection over canonical event inputs and is rebuildable without destructive backfill. Existing legacy counters remain untouched/read-only comparison behavior for the required release boundary. Rollback removes or ignores the new projection/profile seam while retaining raw canonical events, legacy counters, Git history and this evidence.

## Stop boundary

Commit C is evidence-only and its own SHA is intentionally not self-embedded. The exact C SHA and final exact-head C CI are external raw-Git/GitHub bindings after this commit exists. No amend, C2, force update or other history rewrite is authorized. After the final C CI is observed, execution stops for a fresh Independent Implementation Auditor.
