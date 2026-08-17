# Stage 2 Wave W2 Prospective Current-Code Revalidation Record

Record Identity: **STAGE2-W2-IELTS-LIS-REVALIDATION-001**  
Transaction ID: **W2-GOV-REVALIDATION-001**  
Wave Identity: **W2-IELTS-LIS-001 (Listening Platform Completeness)**  
Revalidation Class: **PROSPECTIVE_POST_MERGE_CURRENT_CODE_REVALIDATION**  
Historical Acceptance Type: **NONE / NOT_RETROACTIVE**  
Canonical Predecessor (Base): **`9b72843b0923d387349910c22faeb9f3152d06ea`**  
Controlling Recovery Authorization: **`docs/authorizations/STAGE2-W2-IELTS-LIS-RECOVERY-AUTH-001.md`**  
Controlling Product Specification: **`docs/authorizations/STAGE2-W2-IELTS-LIS-AUTH-002.md`**  

---

## 1. Provenance & Historical Incident Ledger

### 1.1 Valid Canonical Lineage
- **Successor Authorization:** `STAGE2-W2-IELTS-LIS-AUTH-002` (PR #122, accepted via review `PRR_kwDOTmjPCs8AAAABJuLYqQ`, merged at `0d7acbf0c6f056c3f169e2200e58f785f8e2e3d9`).
- **Replacement Activation:** `AGENT_CONTEXT_AUTH_ACTIVATION_V1 — W2-IELTS-LIS-001` (PR #123, accepted via review `PRR_kwDOTmjPCs8AAAABJuMQWA`, merged at `d278f2045b38299b056f16ec7d76fb81c0739541`).
- **Recovery Authorization:** `STAGE2-W2-IELTS-LIS-RECOVERY-AUTH-001` (PR #127, accepted via review `PRR_kwDOTmjPCs8AAAABJu7URA`, merged at `9b72843b0923d387349910c22faeb9f3152d06ea`).

### 1.2 Historical Non-Compliant Execution Ledger (PR #125 & PR #126)
- **Historical PR #125 (`exec/stage2-w2-ielts-lis-recovery-002`):**
  - Base Commit: `d278f2045b38299b056f16ec7d76fb81c0739541`.
  - Actual Commit Topology: **3 Substantive Commits (`A -> B -> C`)**:
    1. Commit A (`a6a6d8e9de97b1a6845111a5f930cfc50a4b4538`): Tests only (`tests/ielts-listening-browser.test.mjs` blob `71ead4e...`, `tests/ielts-listening-runner.test.mjs` blob `2167668...`). Natural RED CI run `31974833396` (`990 pass / 2 fail`).
    2. Commit B (`926a9ef7651d1f15367ad1f7d2c50d101b465443`): Implementation across 4 source files. Natural CI run `31975024526` failed on browser smoke assertion `4 !== 3`.
    3. Commit C (`900405f39badaaf4fdfd0441ed9a05451ade34eb`): Refined `src/ielts-hub-v2.js` tab containment. Natural GREEN CI run `31975164283` (`success`).
  - Pre-Merge Independent Review: **ABSENT** on GitHub (zero reviews in API).
  - Implementation Merge SHA: `3c90ebd10b9559c8ec2090a3226c7b8d11cd092f` (Historical status: `MERGED_WITH_GOVERNANCE_VIOLATION`).
  - Post-Merge Push CI: Run `31975390217` (`success`).
- **Historical PR #126 (`docs/stage2-w2-status-reconciliation-001`):**
  - Candidate Head: `17f43ebf53901f4779d33a8bea7d07408dd8a028`.
  - Pre-Merge Independent Review: **ABSENT** on GitHub (zero reviews in API).
  - Merge SHA: `4e83d38c4db8fdfda6cfaba6c176231942dabb12` (Historical status: `PREMATURE_STATUS_CLOSURE`).
  - Post-Merge Push CI: Run `31976173299` (`success`).

---

## 2. Prospective Current-Code Audit Specification

### 2.1 Revalidation Mandate
The Independent Auditor must fresh-inspect the current code on `main` against controlling specifications in `STAGE2-W2-IELTS-LIS-AUTH-002.md` and Owner-ratified decisions D01, D02, D03:
1. **D01 (Computer-Delivered Listening Model):**
   - Learner answers entered directly in UI.
   - Exactly 2 minutes for review (`REVIEW_MINUTES = 2`, `totalSeconds = 1920`).
   - Zero paper transfer time simulation.
2. **D02 (Exam Interruption & Reload Recovery):**
   - 1-play audio enforcement in Exam Mode.
   - Checkpoint persistence and reload recovery (`restoreFromCheckpoint`) resuming from authoritative audio playback seconds.
   - Fail-closed safety (`RELOAD_RECOVERY_UNSAFE`) on unproven audio position.
3. **D03 (Honesty Label & Deterministic Practice Benchmark):**
   - Deterministic raw score (0..40) to band (0.0..9.0) conversion in `convertIeltsListeningRawToBand`.
   - Results explicitly labeled `"Estimated Band Score — Practice Reference"`.
4. **Authentic System Containment & Mounting:**
   - Real `IeltsAudioController` with YouTube player integration and cues in `src/ielts-media-player.js`.
   - Interactive DOM rendering (4 parts, 40 question cards, navigator) in `src/ielts-listening-runner.js`.
   - Launcher embedded in IELTS Hub v2 `skills` tab in `src/ielts-hub-v2.js`.
5. **Answer Key Privacy & FSRS Isolation:**
   - `KEY_LEAK_BEFORE_SUBMIT === 0` pre-submission.
   - `affectsSchedule: false`, `evidenceEligible: false` strictly enforced.
   - Error Candidate emission into `ErrorRepository` with category `'listening'`.

---

## 3. Retained Implementation Verification State

| Target File | Retained Commit | Status Under Revalidation |
|---|---|---|
| `src/ielts-listening-runner.js` | `3c90ebd10b9559c8ec2090a3226c7b8d11cd092f` | Functionally Complete & Green |
| `src/ielts-media-player.js` | `3c90ebd10b9559c8ec2090a3226c7b8d11cd092f` | Functionally Complete & Green |
| `src/ielts-domain.js` | `3c90ebd10b9559c8ec2090a3226c7b8d11cd092f` | Functionally Complete & Green |
| `src/ielts-hub-v2.js` | `3c90ebd10b9559c8ec2090a3226c7b8d11cd092f` | Functionally Complete & Green |
| `tests/ielts-listening-runner.test.mjs` | `3c90ebd10b9559c8ec2090a3226c7b8d11cd092f` | 100% Passing (10 tests) |
| `tests/ielts-listening-browser.test.mjs` | `3c90ebd10b9559c8ec2090a3226c7b8d11cd092f` | 100% Passing |

---

## 4. Anti-Evidence-Laundering Declaration

This document explicitly affirms:
1. No claim is made that PR #125 or PR #126 had valid pre-merge reviews.
2. No claim is made that PR #125 complied with the two-commit topology rule.
3. Prospective revalidation of current code does NOT retroactively validate historical PR merges.
4. Retention of current code is based solely on prospective independent verification of product completeness and quality.
