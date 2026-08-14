# Evidence Record — W6-TD-00-014 (R4 Targeted Diagnostic)

Manifest: `W6-STAGE1-RECOVERY-AUTH-014`
Authorization PR: `#77` at exact head `bbf8893e35ef732502a6933a79d57e8e0d006798`
Authorization ACCEPT comment: `5290373247`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Package: `W6-TD-00-014` (R4 Targeted Diagnostic adapter)
Executor / Writer: `W6-STAGE1-EXECUTOR-014 / ONE_WRITER_EXCLUSIVE`
Authority: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`

## Predecessor and baseline

- Exact technical predecessor: R3-C4 `7a4389063c1bbf949430c5e73ef5e378f8cb20c6`
- Baseline CI: Run `31779009316` (SUCCESS) on PR #78, verification artifact `9210970637` (`sha256:f69b4e8a1e6bac786440f9cc91b0cbfee5fbaac9eadd65ff37a5c78f3cc51eb0`)
- Working branch: `codex/w6-stage1-recovery-exec-014` (Draft PR #78 against `main`)

## R4-A4 — test commit and natural RED evidence

- Test commit SHA: `8385e4da88435d8a87640c618b76c8c459f4f469`
- Parent SHA: `7a4389063c1bbf949430c5e73ef5e378f8cb20c6`
- Changed test file: `tests/wave6-targeted-diagnostic.test.mjs` (blob `22446317d2c8586ce39800fb185d4a3abef5d11c`)
- Natural exact-head RED CI Run ID: `31779363939`
- Job ID: `94701551367`
- Conclusion: `failure` (Natural RED on missing Targeted Diagnostic capability: 928 passed, 1 failed, duration 25.8s)
- Verification artifact ID: `9211096069` (`sha256:1c90ac989b75496cc999af7057028505e107321cb858feca525a844dca678a11`)
- RED diagnostic: Verified healthy prerequisites (WeaknessProfile validation, QAR registry executor support, Frozen Assessment blueprint creation), followed by explicit assertion that `createTargetedDiagnosticAdapter` capability is absent (`false !== true`).

## R4-B4 — source commit and natural GREEN evidence

- Source commit SHA: `c4070cda320f7823f66ee7c10bdfae9a85012353`
- Parent SHA: `8385e4da88435d8a87640c618b76c8c459f4f469`
- Changed source file (exact allowlist):
  - `src/targeted-diagnostic.js` (blob `1895f66bb3ceee8285b90b029da42bb9f47a4689`)
- Natural exact-head GREEN CI Run ID: `31779714267`
- Job ID: `94702608242`
- Conclusion: `success` (GREEN: 929 passed, 0 failed, duration 2m12s)
- Verification artifact ID: `9211222757` (`sha256:bb86314dfcf0b2cc11832464f7676ef4a12d7e2f0616f9296cdf51ece3c61961`)

## Implemented contract guarantees

1. **Weakness-Biased Blueprinting**: Deterministic ranking of observed weak skills (`status === 'OBSERVED'` and `failureRate > 0`) requiring at least 2 weak skills and at least 2 authentic QAR items per weak skill.
2. **Canonical Profile Validation**: Strict validation against branded `WeaknessProfile` v1 (`validateWeaknessProfile`); unbranded, corrupted or insufficient observation data fails closed.
3. **No Second Store / No Schedule Mutation**: Composes purely through Frozen Assessment runtime (`createBlueprint`, `startRun`, `completeRun`), creating no independent persistent stores or scheduler write paths.
4. **Preserved Non-Claims**: Strictly enforces non-claim facts on diagnostic blueprint and completed run (`representative: false`, `bandScore: null`, `readiness: null`, `mastery: null`, `affectsSchedule: false`, `evidenceEligible: false`).
5. **Hostile Input Fencing**: Defends against getter invocation, cycles, symbols, and private/secret property shapes.

## Immutability check

- Test blob `22446317d2c8586ce39800fb185d4a3abef5d11c` remains unmodified between R4-A4 and R4-B4.
- Source blob `1895f66bb3ceee8285b90b029da42bb9f47a4689` remains immutable across R4-C4 evidence commit.
