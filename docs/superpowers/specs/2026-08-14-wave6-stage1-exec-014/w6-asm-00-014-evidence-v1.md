# Evidence Record — W6-ASM-00-014 (R3 Frozen Assessment)

Manifest: `W6-STAGE1-RECOVERY-AUTH-014`
Authorization PR: `#77` at exact head `bbf8893e35ef732502a6933a79d57e8e0d006798`
Authorization ACCEPT comment: `5290373247`
Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Package: `W6-ASM-00-014` (R3 Frozen Assessment runtime & durability)
Executor / Writer: `W6-STAGE1-EXECUTOR-014 / ONE_WRITER_EXCLUSIVE`
Authority: `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE`

## Predecessor and baseline

- Exact technical predecessor: R2-C2 `2dc10d86a6440efe1c4d8c3dc925923a27977248`
- Baseline CI: Run `31771748853` (SUCCESS) on PR #74, verification artifact `9208382868` (`sha256:970262b3abaa5b301df55669a10eb0e05fe477afbb4194fc95d897adab4f8a20`)
- Working branch: `codex/w6-stage1-recovery-exec-014` (Draft PR #78 against `main`)

## R3-A4 — test commit and natural RED evidence

- Test commit SHA: `2d6826fc535d74ca09a80e9f0c552346c378e72c`
- Parent SHA: `2dc10d86a6440efe1c4d8c3dc925923a27977248`
- Changed test file: `tests/wave6-frozen-assessment.test.mjs` (blob `1f0cf13f24f38e24247c389aad038aa708ebffb5`)
- Natural exact-head RED CI Run ID: `31777814511`
- Job ID: `94696788480`
- Conclusion: `failure` (Natural RED on missing Frozen Assessment capability: 918 passed, 1 failed, duration 26.6s)
- Verification artifact ID: `9209995166` (`sha256:6db7020d20dcfb68d6fbcfc3bfa69352e8964d420f8fa5b4b1a4369a84ba9eb2`)
- RED diagnostic: Verified healthy prerequisites (QAR question construction, registry support, executor resolution, IELTS persistence and backup health), followed by failure on absent Frozen Assessment capability (`false !== true`).

## R3-B4 — source commit and natural GREEN evidence

- Source commit SHA: `8caba908354c4ff5521b4435b67ecde0d31bb9fc`
- Parent SHA: `2d6826fc535d74ca09a80e9f0c552346c378e72c`
- Changed source files (exact allowlist):
  - `src/frozen-assessment-contracts.js` (blob `8bd10e46d028bbdea226c3d222ac458b1ed7d90f`)
  - `src/frozen-assessment-runtime.js` (blob `c7be66eae41868b77458c734516052f67eafac0d`)
  - `src/ielts-domain.js` (blob `8f6156a17dcae67cabb226047125b7ed019dfef0`)
  - `src/ielts-persistence.js` (blob `72e059991463dd4503b49018ba590e830958bb53`)
  - `src/backup-registry.js` (blob `7642977b5ce1d9e91938295544d59193bbbebbee`)
- Natural exact-head GREEN CI Run ID: `31778815007`
- Job ID: `94699890493`
- Conclusion: `success` (GREEN: 924 passed, 0 failed, duration 2m8s)
- Verification artifact ID: `9210897550` (`sha256:0ce13d88bf51be01364a87ca7605004860b90f219672e1007005632ff312ccbe`)

## Implemented contract guarantees

1. **Dedicated Assessment Blueprint & Run Schemas**: Immutable blueprint creation from authenticated QAR question items with non-claim defaults (`representative: false`, `bandScore: null`, `readiness: null`, `mastery: null`, `affectsSchedule: false`, `evidenceEligible: false`).
2. **Atomic Terminal Completion & Replay**: Single-winner terminal resolution, exact ordinal completeness (1..N), question binding freshness checks (`promptDigest`), and conflict rejection for alternate completion submissions.
3. **Additive Persistence & Durability**: Dedicated `frozenAssessments` object store in IELTS DB with standalone (v4) and combined (v6) backup/restore/reopen support.
4. **Hostile Input Rejection**: Fencing against accessors, cycles, symbols, prototype pollution, and secret leakage (`apiKey`, `clientSecret`, `geminiKey`, `authToken`).

## Forward-only migration verification

- IELTS IndexedDB store `frozenAssessments` added forward-compatibly.
- Backup envelopes upgrade legacy v1-v5 schemas additively with empty Frozen state.
- Full backup registry validated and all 924 unit, integration, and browser smoke tests pass cleanly.

## Immutability check

- Test blob `1f0cf13f24f38e24247c389aad038aa708ebffb5` remains unmodified between R3-A4 and R3-B4.
- Source blobs remain immutable across R3-C4 evidence commit.
