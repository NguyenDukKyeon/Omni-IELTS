# Package Specification — W6-STAGE2-FCS-001

- **PACKAGE_ID:** `W6-STAGE2-FCS-001`
- **PACKAGE_NAME:** Wave 6 Stage 2 — Today Focus Learner Execution & UI Integration
- **CONTROLLING_MANIFEST:** `STAGE2-AUTH-001`
- **CANONICAL_PREDECESSOR:** `1744d4d92ac0a7aa6ac42ce9b97b49263336908c`
- **UPSTREAM_DEPENDENCIES:**
  - `P7-00` / `W6-P7-00-WKN-SUCC-010` (`ACCEPTED / INTEGRATED`)
  - `P1-07` / `W6-FCS-00-01-012` (`ACCEPTED / INTEGRATED`)
  - `P1-08` Today Runner (`ACCEPTED / INTEGRATED`)
  - `EvidencePolicy` Gateway (`ACCEPTED / INTEGRATED`)
- **OWNER:** Existing `P1-07 Today Composer` & `P1-08 Today Runner` bounded Wave 6 seam
- **WRITER:** `W6-STAGE2-FCS-EXECUTOR-001 / ONE_WRITER_EXCLUSIVE`
- **AUDITOR:** `INDEPENDENT_STAGE2_AUTHORIZATION_AUDITOR`
- **IMPLEMENTATION_STATUS:** `STAGE2_NOT_AUTHORIZED`
- **PACKAGE_ACCEPTANCE:** `NOT_GRANTED`
- **MERGE_AUTHORITY:** `NONE`

---

## 1. Context and Objective

In Wave 6 Stage 1, package `W6-FCS-00-01-012` integrated the deterministic selection of Focus activities into `composeTodayPlan` based on canonical `WeaknessProfile` evidence, while respecting due reviews precedence and session time budget.

In Stage 2, `W6-STAGE2-FCS-001` connects this composed Focus plan into the interactive learner journey:
1. **Visual Presentation:** The Today dashboard displays Focus activities with an honest badge identifying the target weakness and rationale (e.g. `Focus: Recall (Error Repair)`).
2. **Execution Integrity:** When launched by the learner, the Focus activity executes through standard `TodayRunner` and registered executors (`core-card`, `sentences`, `ielts-error`, `repair`, `content`).
3. **Evidence Integrity:** The resulting interaction emits an `Attempt` with full `AssistanceTrace` through `EvidencePolicy` into `EventRepository`, updating the learner's spaced repetition schedule where eligible without any bypass.
4. **Resilience & Settlement:** The Focus execution state updates the Today session progress bar, handles page reload safely via `todayRuns`, and records completion receipts deterministically.

---

## 2. Invariants & Guardrails

1. **Due Priority Invariant:** Due reviews always take precedence in Today composition. Focus only fills available remaining budget.
2. **Evidence Gateway Invariant:** All Focus activity completion events must flow through `EvidencePolicy.decideEvidence`. No direct FSRS or store mutations.
3. **No AI Provider Calls:** Neither composition nor execution makes network requests or LLM calls.
4. **No Second Scheduler:** Today composition and execution remain singular under `today-composer.js` and `today-runner.js`.
5. **No Progress UI Mutation:** `renderProgress()` in `app.js` is unchanged and remains owned by canonical roadmap package `P7-01`.
6. **No Frozen Assessment Mutation:** Frozen Assessment and Targeted Diagnostic substrates remain untouched and gated for subsequent packages.

---

## 3. Allowed Paths & Boundaries

### 3.1 Source Allowlist
- `src/today-planner-v2.js`
- `src/today-runner.js`
- `src/today-composer.js`
- `src/app.js`
- `src/v10-runtime.js`

### 3.2 Test Allowlist
- `tests/wave6-focus-today.test.mjs`
- `tests/today-runner.test.mjs`
- `tests/today-composer.test.mjs`
- `tests/stage2-focus-execution.test.mjs`

### 3.3 Docs Allowlist
- `docs/superpowers/specs/2026-08-15-stage2-authorization-001/**`

### 3.4 Forbidden Paths
- `src/evidence-policy.js`
- `src/schedule-gateway.js`
- `src/frozen-assessment-*.js`
- `src/targeted-diagnostic.js`
- `src/fsrs-*.js`
- `package.json`
- `package-lock.json`
- `.github/workflows/**`

---

## 4. Verification & Acceptance Criteria

1. **Test-First RED:** A new test in `tests/stage2-focus-execution.test.mjs` demonstrates that launching an `observed-weakness-focus` activity executes through `TodayRunner`, produces an authenticated receipt, and updates Today UI cleanly fails on predecessor `1744d4d92ac0a7aa6ac42ce9b97b49263336908c`.
2. **Minimal GREEN:** Source implementation in allowed files makes all tests pass.
3. **Full Suite Pass:** `npm test` passes all 936+ tests with 0 failures, 0 skipped.
4. **Static & Build:** `npm run check` and `npm run build` pass cleanly.
5. **Browser Gate Pass:** All 4 browser test suites (`test:browser`, `test:ielts-browser`, `test:v10-browser`, `test:hardening`) pass cleanly.
6. **Natural PR CI:** GitHub Actions `pull_request` run on exact head finishes with `SUCCESS`.
7. **Independent Audit:** Separate independent auditor reviews exact diff and evidence to issue `ACCEPT`.

---

**STATUS:** `READY_FOR_INDEPENDENT_STAGE2_AUTHORIZATION_AUDIT`  
**STOP**
