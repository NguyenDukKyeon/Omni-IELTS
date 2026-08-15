# Stage 2 Execution Authorization Manifest — STAGE2-AUTH-001

- **AUTHORIZATION_ID:** `STAGE2-AUTH-001`
- **STATUS:** `DOCS_ONLY_AUTHORIZATION_CANDIDATE / NOT_SELF_ACCEPTING`
- **AUTHORITY:** `AUTHORIZATION_MANIFEST / NOT_IMPLEMENTATION_AUTHORITY`
- **PROTOCOL:** `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` (ADR-046)
- **CANONICAL_PREDECESSOR:** `1744d4d92ac0a7aa6ac42ce9b97b49263336908c`
- **TARGET_PACKAGE_ID:** `W6-STAGE2-FCS-001`
- **TARGET_PACKAGE_NAME:** Wave 6 Stage 2 — Today Focus Learner Execution & UI Integration
- **BRANCH_PROSPECTIVE:** `auth/stage2-entry-001`
- **IMPLEMENTATION_STATE:** `STAGE2_NOT_AUTHORIZED` (Implementation remains unauthorized until independent audit ACCEPT)
- **PACKAGE_ACCEPTANCE:** `NOT_GRANTED`
- **MERGE_AUTHORITY:** `NONE`

---

## 1. Executive Summary & Governance Intent

Stage 1 (Wave 6 substrate packages `W6-P7-00-WKN-SUCC-010`, `W6-FCS-00-01-012`, `W6-ASM-00-014`, `W6-TD-00-014`) is canonically closed at commit `98681e7f9dc63b29818ad15719a67eae92200437` via PR #80.

Stage 1.5 (Adversarial Product Jury & Remediation) evaluated the integrated substrate, identified findings `S15-F001` through `S15-F005` in `STAGE1_5_PRODUCT_JURY_DISCOVERY_001` (PR #81), and canonically resolved substrate defects via clean rematerialization PR #84, merged at canonical `main` commit `1744d4d92ac0a7aa6ac42ce9b97b49263336908c`.

This document establishes the official Stage 2 reconciliation, determines the exact unblocked entry package for Stage 2 execution, resolves all Stage 1.5 findings relative to Stage 2 boundaries, and freezes an exact, immutable Bounded Execution Capsule for package `W6-STAGE2-FCS-001`.

This document is **DOCS-ONLY**. It does not modify source code, runtime behavior, test suites, dependencies, or workflows. It grants zero implementation authority by its mere existence.

---

## 2. Canonical Evidence Fresh-Read & Baseline

| Governance Input | Canonical Source / Identity | Fresh-Read Status | Verified State / Hash |
|---|---|---|---|
| Repository Rules | `AGENTS.md` | ACTIVE | All repository invariants in effect |
| Roadmap | `docs/ROADMAP.md` | CANONICAL | Phase 0–7 sequence & U-* portfolio definitions |
| Implementation Plan | `docs/IMPLEMENTATION_PLAN.md` | CANONICAL | Package criteria & stop conditions |
| Implementation Status | `docs/IMPLEMENTATION_STATUS.md` | CANONICAL | Stage 1 closed; Stage 1.5 closed |
| Architecture Decisions | `docs/DECISIONS.md` | CANONICAL | ADR-004, ADR-005, ADR-043, ADR-046, ADR-048 |
| Wave 6 Owner Ratification | `docs/superpowers/specs/2026-08-14-wave6-downstream-owner-ratification-v1.md` | CANONICAL | Ratified owners: P7-00, P1-07, ASM-00, TD-00 |
| Stage 1.5 Discovery Report | `docs/superpowers/specs/2026-08-14-stage1-5-product-jury-001/product-jury-discovery.md` | ACCEPTED (PR #81) | 5 findings catalogued |
| Stage 1.5 Recovery Merge | PR #84 (`recovery/stage1-5-clean-rematerialization-001`) | MERGED | Commit `1744d4d92ac0a7aa6ac42ce9b97b49263336908c` |
| Baseline Canonical Main | `origin/main` | CURRENT | `1744d4d92ac0a7aa6ac42ce9b97b49263336908c` |

---

## 3. Stage 1.5 Findings Final Disposition & Reconciliation

| Finding ID | Title & Domain | Stage 1.5 Disposition | Final Verified Status | Stage 2 Impact / Reconciliation |
|---|---|---|---|---|
| `S15-F001` | Prototype pollution & ambient built-in mutation | `MUST_FIX_BEFORE_STAGE_2` | `CLOSED` (PR #84) | Eliminated in `src/targeted-diagnostic.js`; explicit adapter boundary established; safe for Stage 2 composition. |
| `S15-F002` | Canonical WeaknessProfile representation duality | `MUST_FIX_BEFORE_STAGE_2` | `CLOSED` (PR #84) | Single canonical WeaknessProfile exposed in `buildCanonicalProgressProjection`; clone/transportation safe. |
| `S15-F003` | History scale mismatch (10k vs 100k) | `MUST_FIX_BEFORE_STAGE_2` | `CLOSED` (PR #84) | Focus limits aligned to 100k events; 5001-record proof verified; safe for production learner volume. |
| `S15-F004` | Progress UI duality (`renderProgress` vs canonical) | `DEFER_TO_PLANNED_STAGE` | `VALIDLY_DEFERRED` | Maps strictly to canonical `P7-01 Honest Progress UI and uncertainty`. Excluded from Stage 2 entry. Today Focus consumes `progress.js` canonical projection directly. |
| `S15-F005` | Interrupted Frozen Assessment recovery semantics | `RESEARCH_BEFORE_STAGE_2` | `RESEARCH_REQUIREMENT_SATISFIED` | Formal research note completed in `f005-interrupted-assessment-research.md`. Recommendation `RESTART_EXISTING_RUN` is `RECOMMENDATION_ONLY`. |

### 3.1 Reconciliation of S15-F004
- **Mapping:** S15-F004 maps directly to roadmap package `P7-01 Honest Progress UI and uncertainty` (`docs/ROADMAP.md` Section 3).
- **Ownership:** Owned by Phase 7 package `P7-01`.
- **Disposition:** S15-F004 is **NOT** included in the first Stage 2 package. Stage 2 development must not treat `renderProgress()` in `src/app.js` as the canonical learner-state contract, and must not attempt to implement P7-01 within Wave 6 Stage 2. Today Focus relies strictly on `loadCanonicalProgressProjection()` from `src/progress.js`.

### 3.2 Reconciliation of S15-F005
- **Research Status:** `f005-interrupted-assessment-research.md` satisfies the Stage 1.5 research requirement before Stage 2.
- **Decision Status:** Recommendation `RESTART_EXISTING_RUN` remains strictly `RECOMMENDATION_ONLY` and has **NOT** been ratified as a canonical owner decision.
- **Stage 2 Entry Impact:** `F005_OWNER_DECISION_NOT_REQUIRED_FOR_FIRST_PACKAGE`. The selected entry package (`W6-STAGE2-FCS-001`) focuses exclusively on single-step Today Focus execution and dashboard integration, which operates under standard `EvidencePolicy` and does not invoke multi-item Frozen Assessment runs or interrupted session recovery. Downstream packages touching assessment test-taking (`W6-STAGE2-ASM-001`, `W6-STAGE2-TD-001`) remain gated on explicit owner ratification of the F005 strategy.

---

## 4. Stage 2 Entrypoint Discovery & Package Selection

### 4.1 Canonical Pipeline & Candidate Ordering
The canonical Wave 6 architecture (`docs/superpowers/specs/2026-08-04-vocabmaster-bounded-spec-pack/future-boundaries/wave-6-weakness-focus-diagnostics-draft.md`) defines the strict pipeline:
$$\text{canonical evidence/errors} \longrightarrow \text{deterministic WeaknessProfile} \longrightarrow \text{canonical Focus} \longrightarrow \text{Frozen Assessment} \longrightarrow \text{Targeted Diagnostic}$$

In Stage 1, the four underlying substrate components were completed:
1. `R1`: WeaknessProfile Reducer (`W6-P7-00-WKN-SUCC-010`) — `ACCEPTED / INTEGRATED`
2. `R2`: Focus Candidate & Selection in Today Composer (`W6-FCS-00-01-012`) — `ACCEPTED / INTEGRATED`
3. `R3`: Frozen Assessment Runtime & Storage (`W6-ASM-00-014`) — `ACCEPTED / INTEGRATED`
4. `R4`: Targeted Diagnostic Adapter (`W6-TD-00-014`) — `ACCEPTED / INTEGRATED`

### 4.2 Candidate Evaluation for Stage 2 Entry
1. **Candidate A (`W6-STAGE2-FCS-001` — Today Focus Learner Execution & UI Integration):**
   - **Upstream Dependencies:** `P7-00` WeaknessProfile + `P1-07` Today Composer + `P1-08` Today Runner (ALL accepted and integrated).
   - **Blocking Dependencies:** NONE. Does not require F005 decision (operates via standard Today activity execution).
   - **Schema / Migration Risk:** ZERO. Uses existing `todayRuns` and canonical learning events.
   - **Learner Value:** Completes the user-facing loop of daily personalized practice based on observed weaknesses.

2. **Candidate B (`W6-STAGE2-ASM-001` — Frozen Assessment Test-Taker Runner & UI):**
   - **Blocking Prerequisite:** Requires prior canonical owner ratification of S15-F005 interrupted assessment strategy (`RESTART_EXISTING_RUN` vs `RESUME_PARTIAL_RUN`).
   - **Status:** DEFERRED pending owner ratification.

3. **Candidate C (`W6-STAGE2-TD-001` — Targeted Diagnostic Assessment Journey):**
   - **Blocking Prerequisite:** Requires Candidate B (`W6-STAGE2-ASM-001`) and F005 ratification.
   - **Status:** DEFERRED pending Candidate B.

### 4.3 Selection Verdict
**Selected Package:** `W6-STAGE2-FCS-001`  
**Selection Authority:** `EXACT_CANONICAL_PIPELINE_ORDER_AND_DEPENDENCY_READINESS`  
**Quantity:** EXACTLY ONE first package authorized. Stage 2 is NOT authorized globally.

---

## 5. Bounded Execution Capsule: W6-STAGE2-FCS-001

```yaml
CAPSULE_SPECIFICATION:
  PACKAGE_ID: "W6-STAGE2-FCS-001"
  PACKAGE_NAME: "Wave 6 Stage 2 — Today Focus Learner Execution & UI Integration"
  MISSION: >
    Integrate the canonical Today Focus candidate selection into the learner-facing Today dashboard,
    Today Runner execution, and activity lifecycle, ensuring focus activities execute faithfully with
    full EvidencePolicy and AssistanceTrace provenance, honest visual labeling, and zero schedule/evidence bypass.
  CANONICAL_PREDECESSOR: "1744d4d92ac0a7aa6ac42ce9b97b49263336908c"
  UPSTREAM_DEPENDENCIES:
    - "P7-00 / W6-P7-00-WKN-SUCC-010 (ACCEPTED / INTEGRATED)"
    - "P1-07 / W6-FCS-00-01-012 (ACCEPTED / INTEGRATED)"
    - "P1-08 / Today Runner (ACCEPTED / INTEGRATED)"
    - "EvidencePolicy Gateway (ACCEPTED / INTEGRATED)"
  OWNER: "Existing P1-07 Today Composer & P1-08 Today Runner bounded Wave 6 seam"
  IMPLEMENTER_ROLE: "W6-STAGE2-FCS-EXECUTOR-001 / ONE_WRITER_EXCLUSIVE"
  INDEPENDENT_AUDITOR_ROLE: "INDEPENDENT_STAGE2_AUTHORIZATION_AUDITOR"
  SCOPE:
    - "Wiring TodayRunner execution for activities carrying reasonCode: 'observed-weakness-focus'."
    - "Learner-facing visual indicators in Today view distinguishing Focus activities with honest weakness rationale."
    - "Execution of Focus items via registered Today executors (core-card, sentences, ielts-error, repair, content)."
    - "Preservation of Attempt + AssistanceTrace emission through EvidencePolicy into EventRepository."
    - "Today session completion reconciliation and reload resilience for Focus runs."
  OUT_OF_SCOPE:
    - "No second scheduler or second Today runner."
    - "No activation of P7-04 Workload recommender or AI recommender."
    - "No network or LLM provider calls on Today render or composition."
    - "No multi-item Frozen Assessment test-taker UI (owned by W6-STAGE2-ASM-001)."
    - "No Targeted Diagnostic UI/initiation (owned by W6-STAGE2-TD-001)."
    - "No modification of renderProgress() in src/app.js (deferred to canonical P7-01)."
    - "No bypass of EvidencePolicy or schedule gateway."
    - "No FSRS parameter tuning or algorithm modifications."
    - "No external libraries or AI dependencies."
  SOURCE_ALLOWLIST:
    - "src/today-planner-v2.js"
    - "src/today-runner.js"
    - "src/today-composer.js"
    - "src/app.js"
    - "src/v10-runtime.js"
  TEST_ALLOWLIST:
    - "tests/wave6-focus-today.test.mjs"
    - "tests/today-runner.test.mjs"
    - "tests/today-composer.test.mjs"
    - "tests/stage2-focus-execution.test.mjs"
  DOCS_ALLOWLIST:
    - "docs/superpowers/specs/2026-08-15-stage2-authorization-001/**"
  FORBIDDEN_PATHS:
    - "src/evidence-policy.js"
    - "src/schedule-gateway.js"
    - "src/frozen-assessment-*.js"
    - "src/targeted-diagnostic.js"
    - "src/fsrs-*.js"
    - "package.json"
    - "package-lock.json"
    - ".github/workflows/**"
  PUBLIC_SEMANTICS:
    - "Due reviews retain absolute priority over Focus activities in Today composition."
    - "Focus activity executes within available session budget without exceeding total duration."
    - "Focus activity carries authenticated focusSelection binding payload."
    - "Learner sees explicit, honest badge explaining why the item was selected (e.g., 'Weakness Focus: Recall')."
  DATA_CONTRACTS:
    - "FOCUS_REASON_CODE = 'observed-weakness-focus'"
    - "FOCUS_SELECTOR_VERSION = 'canonical-focus-selector-v1'"
    - "ActivitySpec, Run, Attempt, Receipt canonical contracts preserved without modification."
  PERSISTENCE_CONTRACTS:
    - "DURABLE_STORE_MUTATION: NONE (Uses existing todayRuns and canonical event-repository stores)."
  MIGRATION_REQUIREMENT: "NONE"
  ROLLBACK_REQUIREMENT: "Revert implementation commit(s) cleanly to 1744d4d92ac0a7aa6ac42ce9b97b49263336908c. Zero durable migration to undo."
  SECURITY_PRIVACY_CONSTRAINTS:
    - "Zero card front/back leaking in unauthenticated telemetry/logs."
    - "Strict safe-data fencing (ownDataValue / no prototype pollution) on focus payload bindings."
  ACCESSIBILITY_CONSTRAINTS:
    - "Focus badges, buttons, and summary elements must be keyboard-accessible and carry descriptive ARIA labels."
  DEVICE_RELOAD_OFFLINE_CONSTRAINTS:
    - "Focus Today runs persist across page reload via IndexedDB todayRuns store."
    - "Fully operational offline with zero network requests."
  RED_PREDICATES:
    - "A targeted behavior test in tests/stage2-focus-execution.test.mjs asserting that launching an observed-weakness-focus ActivitySpec via TodayRunner executes the bound executor, records the todayRun, emits a canonical receipt containing focus reasonCode, and settles state in Today view fails on exact predecessor 1744d4d92ac0a7aa6ac42ce9b97b49263336908c."
  GREEN_PREDICATES:
    - "Minimal implementation changes in allowed source files make tests/stage2-focus-execution.test.mjs pass."
    - "All 936 existing tests pass with 0 failures, 0 skipped, 0 todo."
    - "npm run check and npm run build pass cleanly."
    - "All 4 browser test suites (test:browser, test:ielts-browser, test:v10-browser, test:hardening) pass."
  CROSS_SURFACE_ACCEPTANCE:
    - "Core Today and V10 Today surfaces both render and execute Focus items cleanly without runtime errors."
  REQUIRED_TESTS:
    - "npm test (936+ tests)"
    - "npm run check (Static checks)"
    - "npm run build (Bundle verification)"
  REQUIRED_BROWSER_ACCEPTANCE:
    - "npm run test:browser"
    - "npm run test:ielts-browser"
    - "npm run test:v10-browser"
    - "npm run test:hardening"
  REQUIRED_ARTIFACTS:
    - "verification-output"
    - "browser-smoke-output"
    - "ielts-browser-output"
    - "v10-browser-output"
    - "hardening-browser-output"
  CI_REQUIREMENTS:
    - "Natural pull_request GitHub Actions run on exact head with conclusion SUCCESS."
  STOP_CONDITIONS:
    - "Base drift from 1744d4d92ac0a7aa6ac42ce9b97b49263336908c."
    - "Any modification outside SOURCE_ALLOWLIST, TEST_ALLOWLIST, DOCS_ALLOWLIST."
    - "Any attempt to bypass EvidencePolicy or mutate schedule directly."
    - "Any attempt to call AI providers or external APIs during Today flow."
    - "Modification of RED tests after test-first freeze."
    - "Any failure in static checks, build, unit tests, or browser test suites."
  PACKAGE_ACCEPTANCE_AUTHORITY: "INDEPENDENT_STAGE2_PACKAGE_AUDITOR (No self-acceptance)"
  MERGE_AUTHORITY: "NONE (Requires separate explicit governance grant)"
```

---

## 6. Protocol V1 Execution Sequencing for Executor

Once this authorization manifest receives independent `ACCEPT`, execution of `W6-STAGE2-FCS-001` must proceed in strictly linear, auditable steps:

```text
[1744d4d92ac0a7aa6ac42ce9b97b49263336908c] (Exact Predecessor)
      │
      ▼
Commit A: test(stage2): add RED test for Today Focus execution
      │   - Adds tests/stage2-focus-execution.test.mjs
      │   - Natural CI: Fails with expected product defect (RED)
      ▼
Commit B: feat(stage2): implement Today Focus execution and UI integration
      │   - Minimal edits to allowed src/ files
      │   - Natural CI: Passes all 936+ tests, static checks, browser suites (GREEN)
      ▼
Final CI & Read-back
      │
      ▼
Handoff to Independent Package Auditor (STOP)
```

---

## 7. Explicit Non-Authority Statement

This document is **AUTHORIZATION CANDIDATE ONLY**.

It does **NOT**:
1. Implement Stage 2 source code or tests;
2. Authorize Stage 2 execution prior to independent manifest audit;
3. Accept package `W6-STAGE2-FCS-001` or any other package;
4. Authorize downstream assessment packages (`W6-STAGE2-ASM-001`, `W6-STAGE2-TD-001`);
5. Ratify S15-F005 recommendation into a canonical decision;
6. Grant merge authority;
7. Mark the pull request ready or merge it.

---

**STATUS:** `READY_FOR_INDEPENDENT_STAGE2_AUTHORIZATION_AUDIT`  
**STOP**
