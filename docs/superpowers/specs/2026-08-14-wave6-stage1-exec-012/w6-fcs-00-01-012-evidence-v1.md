# W6-FCS-00-01-012 — Evidence V1

Status: `IMPLEMENTER_EVIDENCE / NOT_INDEPENDENT_ACCEPTANCE`

Controlling manifest: `W6-STAGE1-RECOVERY-AUTH-012`
Accepted manifest head: `b81c7d5318f2b0ca52e9fc1532397049bfd4e908`
Independent Manifest ACCEPT: PR #73 comment `5289540896`
Execution PR: #74
Writer: `W6-STAGE1-EXECUTOR-012 / ONE_WRITER_EXCLUSIVE`
Technical predecessor: exact R1-C `c14047c74ff6499e70e06617f23b4f7161685cb2`

## Preflight

- canonical `main`: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4` before R2 mutation;
- historical PR #28, #71, #72: closed/unmerged;
- replacement branch `codex/w6-stage1-recovery-exec-012` was absent before creation;
- fresh open-PR registry found no active writer overlap on the R2-R4 write allowlists.

## Exact topology and blobs

R2-A2 / test-only:
- SHA: `d1282afbdb4bec38626964438760a91c6214d0d5`
- parent: exact R1-C
- sole changed path: `tests/wave6-focus-today.test.mjs`
- immutable test blob: `904a12845e5b0127c515db86ee36b16e801514e9`

R2-B2 / source-only:
- SHA: `c84f243b4550c786082f46e9fae837b278fc3133`
- parent: exact R2-A2
- A→B compare: exactly one commit and exactly three source paths; A test unchanged.
- `src/focus-selector.js`: `fb235ce654628567fb8c19f7caed944ddd778065`
- `src/today-composer.js`: `0135536b3775753619d5b35d814923fac500a842`
- `src/today-planner-v2.js`: `af683fdb91b56ae56aac82069c2e013f0b441bc9`

Historical R2 A/B commit identities were not reused; only AUTH-012-named blob contents were rematerialized into fresh replacement commits.

## Fresh natural RED

CI #389 / run `31771384877` / attempt 1 / natural `pull_request`
Exact head: `d1282afbdb4bec38626964438760a91c6214d0d5`
Conclusion: `FAILURE` as required.

Raw `verification-output`:
- artifact `9208258257`
- digest `sha256:eb6127c8f11ddfe6414527381f43129cc55758ece39e188f683eb0ebb9d4f12d`
- test totals: `918`; pass `917`; fail `1`.
- sole failure: `Today binds exactly one authenticated observed weakness Focus after all due work within budget`.
- first causal assertion: `existing Today path must bind exactly one observed weakness Focus row`; expected `1`, actual `0`.
- module/test execution succeeded; failure type was `AssertionError`, not module resolution, syntax, dependency, fixture or infrastructure failure.

## Fresh exact-head GREEN

CI #390 / run `31771537006` / attempt 1 / natural `pull_request / synchronize`
Exact head: `c84f243b4550c786082f46e9fae837b278fc3133`
Conclusion: `SUCCESS`.

Successful gates include unit tests, cross-check, roadmap audit, IELTS audit, V10 focused tests/audit, build, Phase 4 exact-head verification, Phase 5 exact-head verification, serve/preview, Core browser smoke, IELTS browser smoke, V10 browser smoke and hardening browser smoke.

Exact GREEN artifacts:
- `verification-output` `9208311351` / `sha256:3228dd8f65f2313a6ffecf067524b815f41b4b079ad151b45e94794f693077bc`
- `browser-smoke-output` `9208323411` / `sha256:e7e82a2b9783ff3efca3d4672ac5ef575e8b6ca5320baf5ccf6c118eb54f02f7`
- `ielts-browser-output` `9208330415` / `sha256:8ffecbdcf0f34d185fe5cb1e44cb8cf3a657e85c1776377b548906d56ea2fcf0`
- `v10-browser-output` `9208333159` / `sha256:5365a3d75f2e10381be09ed718091e3d6239d8efd461b19974b6e06ac41456b4`
- `hardening-browser-output` `9208334606` / `sha256:2f2af63b7b427a1e9e9a91ddc179efc54dee955816fd5471fadca1265f965603`

## Bounded behavior

The immutable A contract demonstrates after B that the canonical Today path binds at most one authenticated observed-weakness Focus after due work, preserves budget and deterministic selection/binding validation, and exposes none of the excluded readiness/band/mastery/provider/FCS-02/P7-04 authority. R2 creates no second scheduler and does not mutate FSRS/EvidencePolicy authority.

## Authority boundary

This evidence closes only the executor-side R2 A/RED/B/GREEN record. It is not independent implementation acceptance, package acceptance, merge authority, Stage 1 completion or Stage 2 authority. R3/R4 remain conditional on their own exact predecessor, RED/GREEN/evidence predicates. `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED`.
