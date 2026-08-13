# Wave 6 Recovery Plan — Canonical Acceptance Addendum

Status: `CANDIDATE / NOT IMPLEMENTATION AUTHORITY UNTIL INDEPENDENT ACCEPT + MERGE`
Exact canonicalization predecessor: `66666172238668b1ea40d7ff596c82c209fcdfe5`

This file is canonical only under the bounded Wave 6 recovery rule in `AGENTS.md`. It exists to avoid retroactively treating the recovered dirty working tree as authorized history.

## P7-00 / WKN-00 successor recovery

Owner: `P7-00`. Dependency: exact package-accepted PR #66 semantics, P1-02 and P1-08.

Acceptance criteria:
- event-derived deterministic projection from canonical `evidence-decided` records;
- duplicate/conflict handling and input-order independence;
- explicit denominator/sample/timeframe/provenance;
- WeaknessProfile exposes per-skill observations, reason codes, uncertainty and insufficient-data state;
- sparse/conflicting evidence cannot become ready/mastered/band;
- AI cannot write canonical WeaknessProfile;
- raw canonical events/persistence schema/FSRS remain unchanged.

Required evidence: immutable test-first behavior, natural RED against the predecessor/accepted PR66 semantics, source-only GREEN, exact-head CI, projection rollback proof.

## FCS-00 / FCS-01 — Canonical Focus / Today seam

Owner: `P1-07 Today Composer` bounded Wave 6 seam. P7-04 remains phase-blocked and is not activated.
Dependency: accepted P7/WKN successor, P1-07 and P1-08.

Acceptance criteria:
- deterministic candidate ordering/selection from authentic WeaknessProfile provenance;
- at most one Focus slot; due reviews always precede Focus; Focus cannot displace due work;
- exact reason/target/provenance/budget binding persisted and reproducible;
- accepted executor registry only; malformed/tampered binding fails before executor effects;
- no realtime provider/AI call during Today composition;
- no second Today scheduler and no FSRS/evidence mutation by selector.

Required evidence: focused unit/integration tests plus exact production browser smoke for durable resume/tamper/no-provider behavior.

## ASM-00 — Frozen Assessment

Owner: `ASM-00`. Dependency: accepted LI-00 and QAR-00 semantics.

Acceptance criteria:
- immutable multi-item AssessmentBlueprint and RunSnapshot with exact item/order/question/scoring bindings;
- QAR owns question normalization/scoring authority; no model-generated key becomes executable authority;
- completion is atomic; incomplete/invalid sets mutate nothing; terminal replay is deterministic and collision-safe;
- additive durable storage survives backup/restore/reopen; hostile accessor/cycle/symbol/sparse/tamper inputs fail closed;
- public results expose only raw item/aggregate facts; no band/readiness/mastery/representativeness/EvidencePolicy authority.

Required evidence: persistence/backup/restore/migration tests and exact failure-injection/tamper tests.

## TD-00 — Targeted Diagnostic

Owner: `TD-00`. Dependency: accepted WeaknessProfile owner revision and accepted ASM-00.

Acceptance criteria:
- deterministic weakness-biased selection independent of caller ordering;
- minimum two sufficiently observed weak skills and two authentic supported QAR items per selected skill;
- unsupported/forged/hostile items fail before Frozen owner mutation;
- uses ASM-00 as the only durable assessment owner; no second diagnostic store/runtime;
- result remains explicitly non-representative with `representative=false`, `bandScore=null`, `readiness=null`, `mastery=null`, `affectsSchedule=false`, `evidenceEligible=false`.

Required evidence: dedicated TD tests, Frozen backup/replay integration and no-unrelated-owner-mutation proof.

## Recovery provenance and execution

Preserved input identities:
- uploaded archive SHA-256 `0bb3c8eaa52fcf175f4ebb7b2e814c4add761a7d0bdef2b043dc72173c679bcc`;
- local branch label `recovery/wave6-local-accept-20260813`;
- local HEAD `66666172238668b1ea40d7ff596c82c209fcdfe5`;
- tracked binary patch SHA-256 `5f2d7008d51682a44f4bab87b08a5ad7e8d3b19b304f0e54c1af7d723dc797b`.

The bytes above are reference input only. Each executable package requires a fresh independently accepted `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` record and a prospective A→RED→B→GREEN→C lineage. No package inherits another package's ACCEPT.
