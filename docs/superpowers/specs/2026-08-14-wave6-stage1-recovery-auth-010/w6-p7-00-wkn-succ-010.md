# Package Record — W6-P7-00-WKN-SUCC-010

Manifest: `W6-STAGE1-RECOVERY-AUTH-010`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Record status: `CONDITIONAL / INACTIVE UNTIL EXACT MANIFEST ACCEPT`
Canonical owner: `P7-00`, with `WKN-00` absorbed under ADR-048.
Writer: `W6-STAGE1-EXECUTOR-010` exclusively.

## Exact predecessor / dependency / topology

Exact predecessor: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`.
Dependency state: canonical event/evidence semantics plus P1-02/P1-08 on that predecessor; historical PR #66 is semantic reference only and grants no inherited bytes/acceptance.

Branch: `codex/w6-stage1-recovery-exec-010`, created at exact predecessor.
PR: single Draft PR to `main`, title `W6-STAGE1-RECOVERY-EXEC-010: P7/WKN successor, Focus, Frozen Assessment, Targeted Diagnostic`.
R1-A parent = exact predecessor; R1-B parent = exact R1-A; R1-C parent = exact R1-B. No reset/rebase/amend/squash/force/merge-from-main/second writer.

## Baseline CI / verification

Exact baseline push CI: #379 / run `31759213350` / attempt 1 / workflow `322561862` / event `push` / SUCCESS / head `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`.
`verification-output` artifact `9203940657`, digest `sha256:6a30f2e5dcf4fbf386b8bea93f35e9a96c1102304cd02b0b0f763c739860ed8d`.

## Commit A — exact allowlist

Only:
- `tests/progress.test.mjs`

Production source must be byte-identical to predecessor.

## Natural behavioral RED predicate

A must test through the existing `src/progress.js` namespace/seam; it must not statically import a source module absent on the predecessor.

Eligible first failure: a named assertion showing predecessor progress behavior cannot project authentic canonical `evidence-decided` events into the required deterministic `{metrics, weaknessProfile}` successor projection. The failure must be product behavior, not module resolution.

Immutable A must prove after GREEN:
- authentic Core/IELTS/V10 canonical `evidence-decided` records are interpreted by the progress seam rather than as flat legacy review objects;
- public `buildCanonicalProgressProjection` (or exact accepted equivalent exposed by `src/progress.js`) returns deterministic `{metrics, weaknessProfile}`;
- numerator/denominator/sample/timeframe/provenance are explicit;
- duplicate replay is deterministic and not inflationary;
- colliding identities are excluded/surfaced as conflict and uncertainty;
- sparse/conflicting evidence cannot generate ready/mastered/band claims;
- caller ordering does not affect output;
- raw canonical input objects remain unmodified.

RED invalidation: any production-source delta in A; path outside A allowlist; uncaught `ERR_MODULE_NOT_FOUND`; syntax/infrastructure/external dependency failure; unrelated baseline first failure; wrong parent; weak assertion that passes predecessor; ambiguous first cause. Any invalidation => STOP before B.

## Commit B — exact allowlist / minimal GREEN

Only:
- `src/progress.js`
- `src/p7-00-metrics-reducer.js`
- `src/weakness-profile.js`

A blob must be unchanged.

Minimal GREEN: deterministic event-derived metrics plus versioned WeaknessProfile with denominator, sample size, timeframe/provenance, reason codes, uncertainty and insufficient-data state. No persistence rewrite, second metrics truth, learner-state mutation, AI/provider canonical write, Today/Error Repo/FSRS change, readiness/band/mastery claim.

Focused verification:
`node --test tests/progress.test.mjs`
plus every shared PR GREEN gate frozen in the manifest root.

## Commit C / evidence

C changes exactly:
`docs/superpowers/specs/2026-08-14-wave6-stage1-exec-010/w6-p7-00-wkn-succ-010-evidence-v1.md`

A/B test/source blobs must be unchanged. Evidence schema is exactly Manifest Evidence V1 and authority is `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`.

## Migration / rollback

Migration: `NONE`. Projection only over existing canonical events; no durable schema/event rewrite.

Rollback before merge: discard/revert R1 source/test/evidence chain. After any future accepted integration, rollback may remove projection behavior but must leave raw canonical events unchanged and require no data transformation.

## Record-specific STOP / integration

STOP on predecessor/main drift before A, open source/test overlap, second writer, wrong parent/path, invalid RED, A blob mutation, B non-allowlisted source, GREEN failure, artifact/digest mismatch, or evidence mismatch.

No merge/Ready/status reconciliation is authorized by this record. Independent batch auditor must issue a distinct exact-sha verdict for R1. Package acceptance and merge authority are not granted by executor or CI.

Canonical acceptance criteria: `AGENTS.md`, roadmap/plan/status/decisions, ADR-046, ADR-048, merged PR #69 owner boundary, this exact accepted manifest root and this record.