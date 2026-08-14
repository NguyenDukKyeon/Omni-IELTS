# W6-P7-00-WKN-SUCC-010 — Evidence V1

Status: `IMPLEMENTER_EVIDENCE / NOT_INDEPENDENT_ACCEPTANCE`

Controlling manifest: `W6-STAGE1-RECOVERY-AUTH-010`
Independent manifest ACCEPT: PR #70 comment `5288391297`
Canonical predecessor: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
Execution PR: #71
Writer: `W6-STAGE1-EXECUTOR-010 / ONE_WRITER_EXCLUSIVE`

## Exact topology

- Commit A / test-only: `a76e8c235249c5c97d8aafd99fa2c2303f7c9cb9`
- A parent: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
- Immutable A test path: `tests/progress.test.mjs`
- Immutable A test blob: `a8f9ca3423bcc6ff4cadf088ff8e8f0c2e2107e0`
- Commit B / source-only: `319462d22753958aa5da766642c763a79d3ac667`
- B parent: exact Commit A
- A→B compare: exactly one commit; no test mutation.

B source allowlist only:

- `src/progress.js` — blob `f0f448e8b01f8c895be86a456a65dc1d5b4786fa`
- `src/p7-00-metrics-reducer.js` — blob `27d887f6710a16e3d6e1745ef49292bbdadd9cfb`
- `src/weakness-profile.js` — blob `93deb2378537ad94b0feba4ea5173a3e6ab9c7b9`

## Natural RED

Exact A natural PR CI:

- CI #382
- run `31761545750`
- exact head `a76e8c235249c5c97d8aafd99fa2c2303f7c9cb9`
- conclusion: FAILURE as required for Commit A
- first relevant product-behavior failure: `existing progress seam must interpret canonical nested evidence-decided payloads`
- observed assertion: expected `1`, actual `0`
- failure was a behavioral assertion after module/test execution, not syntax/module/infra failure.

The later missing-successor-API assertion does not replace or invalidate the first behavioral RED predicate.

## Natural GREEN

Exact B natural PR CI:

- CI #383
- run `31762977651`
- exact head `319462d22753958aa5da766642c763a79d3ac667`
- conclusion: `SUCCESS`
- install: SUCCESS
- unit tests: SUCCESS
- cross-check: SUCCESS
- roadmap audit: SUCCESS
- IELTS audit: SUCCESS
- V10 focused tests/audit: SUCCESS
- build: SUCCESS
- Phase 4/5 exact-head verification: SUCCESS
- serve/preview: SUCCESS
- browser, IELTS browser, V10 browser and hardening browser smoke: SUCCESS

`verification-output`:

- artifact id `9205284228`
- digest `sha256:863f89494b2d1507548cf47146655df204089d700a160a656d2247f5762f9a6e`
- workflow run `31762977651`
- head branch `codex/w6-stage1-recovery-exec-010`
- head SHA `319462d22753958aa5da766642c763a79d3ac667`

## Contract evidence

The immutable A suite on exact B verifies the manifest-bounded successor behavior, including canonical nested `evidence-decided` interpretation and the public canonical progress projection seam. The source transition is limited to the frozen R1 B allowlist. Raw recovery bytes were inputs to rematerialization only; this evidence does not claim byte inheritance or historical authorization.

## Authority boundary

This document is evidence only. It does **not** grant independent implementation acceptance, package acceptance, merge authority, Stage 1 completion, readiness/band/mastery authority, Focus/Assessment/TD acceptance, or permission to bypass the remaining R2→R4 records.
