---
schema_id: W6_P7_00_WKN_EXEC_EVIDENCE_V2
authority_label: IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE
authorization_id: W6-P7-00-WKN-AUTH-008
execution_record_id: W6-P7-00-WKN-EXEC-008
implementation_subject: P7-00 / WKN-00
exact_predecessor: 66666172238668b1ea40d7ff596c82c209fcdfe5
baseline_ci:
  workflow: CI
  workflow_id: 322561862
  event: push
  run_number: 361
  run_id: 31623561426
  head_sha: 66666172238668b1ea40d7ff596c82c209fcdfe5
  conclusion: success
commit_a:
  sha: 28292467bdcbec41c7dda7ce50dd8ec7c5cd0c4b
  parent: 66666172238668b1ea40d7ff596c82c209fcdfe5
  changed_paths:
    - tests/progress.test.mjs
  test_blob: c29649d89de9cb51bfcda1e2d832cc95316333c7
red_ci:
  workflow: CI
  workflow_id: 322561862
  event: pull_request
  head_sha: 28292467bdcbec41c7dda7ce50dd8ec7c5cd0c4b
  run_number: 363
  run_id: 31628968571
  job_id: 94222561463
  conclusion: failure
  first_cause: "AssertionError [ERR_ASSERTION]: canonical evidence-decided payload must be counted by progress (expected 1, actual 0)"
  red_eligible: true
commit_b:
  sha: 15ae80498d9fc44f16c5e8b453178683309a8116
  parent: 28292467bdcbec41c7dda7ce50dd8ec7c5cd0c4b
  changed_paths:
    - src/progress.js
    - src/p7-00-metrics-reducer.js
    - src/weakness-profile.js
  immutable_test_blob:
    commit_a: c29649d89de9cb51bfcda1e2d832cc95316333c7
    commit_b: c29649d89de9cb51bfcda1e2d832cc95316333c7
green_ci:
  workflow: CI
  workflow_id: 322561862
  event: pull_request
  head_sha: 15ae80498d9fc44f16c5e8b453178683309a8116
  run_number: 364
  run_id: 31629521094
  job_id: 94224429273
  conclusion: success
verification_artifact:
  name: verification-output
  id: 9154501289
  digest: sha256:dc4449934f8426a58b8ad182db748bb3617ae638e1039bf65a2d5ad0ea517b04
  bound_run_id: 31629521094
  bound_head_sha: 15ae80498d9fc44f16c5e8b453178683309a8116
canonical_fixture:
  identity: "tests/progress.test.mjs::P7-00 canonical metrics and WeaknessProfile honor nested evidence, determinism and uncertainty"
  construction_api_path:
    - buildCoreEvidenceEnvelope
    - decideEvidence
    - buildLearningEventRecords
    - evidence-decided canonical-learning-event
  input_digest: fnv1a64:4098:8b920c9c684252a5
metrics_output_digest: fnv1a64:6558:fb2afa0151dbb0d7
weakness_profile_output_digest: fnv1a64:747:637b0450f8d8d2fb
deterministic_replay_result: PASS
migration_result:
  NO_DESTRUCTIVE_MIGRATION: true
  RAW_CANONICAL_EVENTS_UNCHANGED: true
  PROJECTION_REBUILDABLE: true
  LEGACY_COUNTERS_READ_ONLY_COMPARISON_ONE_RELEASE: true
rollback_result:
  DROP_OR_IGNORE_NEW_PROJECTION: true
  RETAIN_RAW_CANONICAL_EVENTS: true
  RETAIN_LEGACY_COUNTERS: true
  RETAIN_IMPLEMENTER_EVIDENCE: true
  NO_HISTORY_REWRITE: true
source_blob_bindings:
  src/progress.js: ce368cc74b274d78d1a1d45671db4d101933c8b1
  src/p7-00-metrics-reducer.js: 22a34afb5672ac0722b688b409188765e1e53426
  src/weakness-profile.js: 69e9bf825b9046c6c1db35a785e653d7760a8013
unresolved_limitations:
  - "The executor did not separately invoke `npm run phase0:gate` outside the natural exact-head workflow. CI #364 independently ran and passed its unit/integration, static, roadmap/IELTS/V10 audit, build, Phase 4, Phase 5, server/preview, browser, IELTS browser, V10 browser, and hardening gates, and produced the required `verification-output` artifact. Independent audit must decide whether this satisfies the frozen full-verification profile."
commit_c_parent: 15ae80498d9fc44f16c5e8b453178683309a8116
commit_c_changed_paths:
  - docs/superpowers/specs/2026-08-13-wave-6-p7-00-wkn-exec-008-evidence.md
commit_c_sha_binding: EXTERNAL_OBSERVED_BINDING
---

# W6-P7-00-WKN-EXEC-008 Implementer Evidence

## Authority boundary

This file is **IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE**. It does not grant implementation acceptance, package acceptance, or merge authority.

## Natural RED

Commit A was test-only and directly descended from the exact predecessor. The first P7-00 failure on natural CI #363 was a behavioral mismatch on a real canonical nested `evidence-decided` record: predecessor `summarizeReviewQuality` returned zero reviews where one eligible canonical event was required. No source file changed before this RED and the failure was not a missing future module/export, syntax, dependency, or infrastructure failure.

## Minimal GREEN

Commit B changed only the accepted source allowlist. It added a deterministic canonical metrics reducer, deterministic WeaknessProfile projection, and wired both through `src/progress.js`. Legacy flat review summarization remains supported while canonical `event.payload` decisions are handled explicitly. The immutable Commit-A test blob is identical at Commit B.

The reducer deduplicates canonical event replay by stable event identity, sorts equivalent event sets deterministically, uses explicit timezone-aware day boundaries, counts only `payload.eligible === true` evidence, and reports unavailable metric domains as `INSUFFICIENT_DATA` rather than fabricated zeroes. WeaknessProfile uses browser-safe `learningContractDigest`, exposes sparse/conflict uncertainty and reason codes, and does not emit readiness or band claims.

## Verification

Natural exact-head CI #364 on Commit B completed successfully. Its `test` job passed the new P7-00 canonical metrics/WeaknessProfile test together with the repository unit/integration suite, static checks, roadmap/IELTS/V10 audits, build, Phase 4 and Phase 5 exact-head verification, server/preview, browser, IELTS browser, V10 browser, and hardening gates. The exact `verification-output` artifact is bound above.

Digest witness values were computed with the repository's `learningContractDigest` algorithm over the frozen canonical fixture/output shapes. The behavioral canonical fixture path itself is exercised by the immutable repository test and passed on exact Commit B CI.

## Migration and rollback

No persistence/event-repository/schema file was changed. Raw canonical events remain the source of truth. The new projection is versioned and rebuildable from canonical events; legacy progress counters are preserved as read-only comparison behavior and are not rewritten into canonical truth. Rollback is code-level removal/ignore of the new projection/profile path while retaining raw canonical events, existing legacy counters, and this evidence record.

## Stop boundary

Commit C is evidence-only. Its exact SHA is intentionally not self-embedded; it is externally observed after commit under the independently accepted `EXTERNAL_OBSERVED_BINDING` model. After natural exact-head CI on C, execution stops for an Independent Implementation Auditor.
