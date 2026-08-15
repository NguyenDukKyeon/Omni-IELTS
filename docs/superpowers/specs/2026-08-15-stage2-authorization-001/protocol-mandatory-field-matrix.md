# Protocol Mandatory Field Matrix — STAGE2-AUTH-001

**Manifest ID:** `STAGE2-AUTH-001`  
**Protocol:** `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` (ADR-046)  
**Package:** `W6-STAGE2-FCS-001` (Wave 6 Stage 2 — Today Focus Learner Execution & UI Integration)  
**Predecessor:** `1744d4d92ac0a7aa6ac42ce9b97b49263336908c`  

---

## 1. ADR-046 Protocol V1 Field Coverage

| Mandatory Protocol Field | Frozen Specification | Compliance Status |
|---|---|---|
| `CANONICAL_OWNER` | Existing `P1-07 Today Composer` & `P1-08 Today Runner` bounded Wave 6 seam | FROZEN |
| `WRITER_IDENTITY` | `W6-STAGE2-FCS-EXECUTOR-001 / ONE_WRITER_EXCLUSIVE` | FROZEN |
| `EXACT_PREDECESSOR` | `1744d4d92ac0a7aa6ac42ce9b97b49263336908c` | FROZEN |
| `DEPENDENCY_STATE` | All upstream dependencies (`P7-00`, `P1-07`, `P1-08`, `EvidencePolicy`) `ACCEPTED / INTEGRATED` | FROZEN |
| `BRANCH_TOPOLOGY` | `auth/stage2-entry-001` (Auth) -> `codex/w6-stage2-fcs-exec-001` (Exec) | FROZEN |
| `SOURCE_ALLOWLIST` | `src/today-planner-v2.js`, `src/today-runner.js`, `src/today-composer.js`, `src/app.js`, `src/v10-runtime.js` | FROZEN |
| `TEST_ALLOWLIST` | `tests/wave6-focus-today.test.mjs`, `tests/today-runner.test.mjs`, `tests/today-composer.test.mjs`, `tests/stage2-focus-execution.test.mjs` | FROZEN |
| `DOCS_ALLOWLIST` | `docs/superpowers/specs/2026-08-15-stage2-authorization-001/**` | FROZEN |
| `FORBIDDEN_PATHS` | `src/evidence-policy.js`, `src/schedule-gateway.js`, `src/frozen-assessment-*.js`, `src/targeted-diagnostic.js`, `src/fsrs-*.js`, `package.json`, lockfiles, workflows | FROZEN |
| `BASELINE_CI` | Run `31873237523` / Job `94984939607` on main `1744d4d92ac0a7aa6ac42ce9b97b49263336908c` (936/936 PASS) | FROZEN |
| `RED_ELIGIBILITY` | Tests in `tests/stage2-focus-execution.test.mjs` proving missing learner-facing focus execution fail on exact base | FROZEN |
| `RED_INVALIDATION` | Modifying test assertions to match incorrect behavior or altering existing 936 tests invalidates RED | FROZEN |
| `MINIMAL_GREEN` | Minimal source additions in allowed files make RED test pass while preserving 100% existing test pass rate | FROZEN |
| `VERIFICATION_PROFILE` | Unit/Integration (`npm test`), Static (`npm run check`), Build (`npm run build`), Browser Smoke (all 4 suites) | FROZEN |
| `EVIDENCE_SCHEMA` | Standard Actions verification and browser artifacts with exact digests | FROZEN |
| `MIGRATION_RULE` | `NONE` (Zero durable schema mutation) | FROZEN |
| `ROLLBACK_RULE` | Clean git revert of execution commits to `1744d4d92ac0a7aa6ac42ce9b97b49263336908c` | FROZEN |
| `STOP_CONDITIONS` | Base drift, path violation, EvidencePolicy bypass, external/AI provider calls, test failure | FROZEN |
| `INTEGRATION_RULE` | Independent audit ACCEPT required prior to merge; zero self-acceptance | FROZEN |
| `ACCEPTANCE_SOURCE` | `AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/DECISIONS.md` | FROZEN |

---

## 2. Findings Matrix

| Finding | Pre-Condition State | Post-Stage 1.5 State | Stage 2 Status |
|---|---|---|---|
| `S15-F001` | High risk prototype pollution in TD | Remediated in PR #84 (explicit adapter) | `CLOSED` |
| `S15-F002` | WeaknessProfile dual representation | Remediated in PR #84 (canonical projection) | `CLOSED` |
| `S15-F003` | 10k vs 100k event scale limit | Remediated in PR #84 (100k alignment) | `CLOSED` |
| `S15-F004` | Progress UI duality with canonical | Validly deferred to P7-01 | `VALIDLY_DEFERRED` |
| `S15-F005` | Interrupted Assessment state | Research note completed; recommendation only | `SATISFIED_FOR_FCS_001` |

---

**STATUS:** `READY_FOR_INDEPENDENT_STAGE2_AUTHORIZATION_AUDIT`  
**STOP**
