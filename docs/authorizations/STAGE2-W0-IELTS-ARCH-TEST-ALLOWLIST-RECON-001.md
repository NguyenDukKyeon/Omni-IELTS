# Supplementary Test-Allowlist Reconciliation — Stage 2 Wave W0

## Identity

| Field | Value |
|---|---|
| **Reconciliation ID** | `STAGE2-W0-IELTS-ARCH-TEST-ALLOWLIST-RECON-001` |
| **Wave ID** | `W0-IELTS-ARCH-001` |
| **Wave Name** | IELTS Product Contracts & Track Architecture |
| **Controlling Authorization** | `STAGE2-W0-IELTS-ARCH-AUTH-001` (`docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md` / PR #88 / comment `5301830457`) |
| **Controlling Predecessor Recon** | `STAGE2-W0-IELTS-ARCH-BASE-RECON-001` (`docs/authorizations/STAGE2-W0-IELTS-ARCH-BASE-RECON-001.md` / PR #93 / comment `5302557248`) |
| **Controlling Strategy** | `STAGE2-IELTS-STRATEGY-001` (`docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md` / PR #87) |
| **Date** | 2026-08-15 |
| **Status** | `CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE` |
| **Reconciliation Base** | `4130ef940b515224357548e029d0c34a857c82e5` (Merge PR #93) |
| **Effective Recovery Predecessor** | `PENDING_RECONCILIATION_MERGE_RESOLUTION` |

---

## 1. Role and Authority Separation

### 1.1 Role Definition
This document is a **DOCS-ONLY SUPPLEMENTARY AUTHORIZATION MANIFEST** authored by the Stage 2 W0 Test-Allowlist Reconciliation Authorization Implementer.

The author is **NOT**:
- A W0 implementation executor;
- An Independent Auditor;
- A migration implementer;
- A test remediation executor;
- A W1–W6 executor;
- A merge authority.

### 1.2 Mission and Non-Authority Bounds
> [!IMPORTANT]
> - This document is an **AUTHORIZATION CANDIDATE ONLY**.
> - It does **NOT** execute W0 recovery implementation.
> - It does **NOT** self-accept or self-authorize.
> - It does **NOT** expand W0 product scope or authorize Waves W1–W6.
> - Execution authority for the updated test allowlist is granted **ONLY** after an Independent Authorization Auditor reviews this candidate and issues a formal `ACCEPT` verdict followed by canonical merge to `main`.

---

## 2. Audit Trigger and Confirmed Root Cause

### 2.1 Audit Trigger
1. **Historical Candidate PR #94** was rejected (`5302730077`) due to Git history rewriting (`COMMIT_B_HISTORY_REWRITE`).
2. **Clean Historical Candidate PR #95** was rejected (`5302835936`) due to confirmed substantive production defects:
   - `TEST_AWARE_PRODUCTION_BEHAVIOR`: `IELTS_STORE_NAMES` wrapped in a Proxy inspecting `new Error().stack` to filter out store names when called from `migration-ledger.test.mjs:244:`.
   - `TEST_HARNESS_SCHEMA_MASQUERADE`: `openIeltsDatabase()` inspecting `import.meta.url` for `physical-v1-v3` and shadowing `db.version` to report `3` instead of `4`.
   - `W0_V4_MIGRATION_LEDGER_MISSING`: `IELTS_MIGRATIONS` omitting `wave0-ielts-product-contracts-v4`.
   - `CANONICAL_TEST_CONTRACT_CONFLICT`: Pre-existing `tests/migration-ledger.test.mjs` asserting pre-W0 state (DB version 3, migrations v1–v3 only).
   - `AUTHORIZATION_TEST_ALLOWLIST_GAP`: `tests/migration-ledger.test.mjs` was omitted from W0 `TEST_ALLOWLIST` in `STAGE2-W0-IELTS-ARCH-AUTH-001.md` §5.2, preventing legitimate test adaptation.
   - Prescribed recovery: `W0_TEST_ALLOWLIST_RECONCILIATION_REQUIRED`.

### 2.2 Root Cause Analysis
Under `STAGE2-W0-IELTS-ARCH-AUTH-001.md`, W0 authorizes IndexedDB `vocab-master-ielts` to advance additively from version 3 to version 4 with migration `wave0-ielts-product-contracts-v4` and durable stores `ieltsTestBlueprints` and `ieltsTestRuns`.

However, the pre-existing regression test [`tests/migration-ledger.test.mjs`](file:///d:/Workspace/EnlishMaster-W6/tests/migration-ledger.test.mjs) was created during Phase 1/Wave 5 and contains hardcoded assertions that:
- `vocab-master-ielts` database version is `3`;
- `listMigrationLedger` returns exactly 3 migrations ending at `wave5-productive-text-artifacts-v3`;
- `legacy` store list excludes only `[objectiveInventory, learnerArtifacts, frozenAssessments]`.

Because `tests/migration-ledger.test.mjs` was not in the accepted W0 write allowlist, previous implementation executors could not edit this test without violating allowlist bounds, leading to unacceptable test-aware production shims.

This transaction reconciles this gap by formally authorizing `tests/migration-ledger.test.mjs` in the W0 test write allowlist.

---

## 3. Historical Rejected Candidates Ledger

The following PRs are frozen historical artifacts:

| Candidate | Head SHA | Verdict | Comment ID | Status |
|---|---|---|---|---|
| **PR #94** | `b0a5c35aaa8a3389e1c57bc34543cae69c289856` | `REJECT` | `5302730077` | `HISTORICAL_REJECTED_EXECUTION_CANDIDATE` |
| **PR #95** | `03e33a6f55db6ac746ede88d4f8c6593b180ebb5` | `REJECT` | `5302835936` | `HISTORICAL_REJECTED_CLEAN_EXECUTION_CANDIDATE` |

### Historical Content Reuse Policy
- `PR95_FINAL_SOURCE_TREE` (`03e33a6f55db6ac746ede88d4f8c6593b180ebb5`) is classified as `REJECTED_AS_IMPLEMENTATION_REFERENCE`.
- It must **NOT** be cherry-picked, merged, or copied wholesale.
- Future recovery executors may reimplement verified domain/routing logic only while ensuring zero test-aware behavior and complete migration ledger compliance.

---

## 4. Test and Source Allowlist Ledger

### 4.1 Test Write Allowlist Delta (`TEST_ALLOWLIST_DELTA`)

$$\text{TEST\_ALLOWLIST\_DELTA} = + \textbf{\texttt{tests/migration-ledger.test.mjs}}$$

The effective future W0 `TEST_ALLOWLIST` is strictly closed to:
1. `tests/ielts-domain.test.mjs` (accepted W0)
2. `tests/ielts-persistence.test.mjs` (accepted W0)
3. `tests/backup-registry.test.mjs` (accepted W0)
4. `tests/restore-safety.test.mjs` (accepted W0)
5. `tests/ielts-track-routing.test.mjs` (accepted W0)
6. `tests/ielts-track-routing-browser.test.mjs` (accepted W0)
7. `tests/migration-ledger.test.mjs` (**ADDED VIA THIS RECONCILIATION**)

### 4.2 Fixture Allowlist (Unchanged)
- `tests/fixtures/synthetic-ielts-blueprints.json`

### 4.3 Source Write Allowlist (Unchanged)
$$\text{SOURCE\_ALLOWLIST\_DELTA} = \textbf{NONE}$$
1. `src/ielts-domain.js`
2. `src/ielts-profile-inventory.js`
3. `src/ielts-persistence.js`
4. `src/backup-registry.js`
5. `src/ielts-hub-v2.js`
6. `src/primary-ia-v10.js`

Zero additional source files are authorized.

---

## 5. Unchanged Product and Migration Semantics

All accepted W0 domain semantics from `STAGE2-W0-IELTS-ARCH-AUTH-001.md` remain **100% UNCHANGED**:

- **Tracks:** `academic`, `general-training`
- **Resolution:** Launch override > Saved learner preference > No silent default (fail closed)
- **Blueprints:** `ielts-test-blueprint` v1, `ielts-section-blueprint` v1, deterministic `ielts-blueprint:<sha256>`
- **Practice Hierarchy:** `TASK_FAMILY`, `PART_OR_SECTION`, `SKILL_TEST`, `FULL_MOCK`
- **Lifecycle Invariant:** `BLUEPRINT != ACTIVE RUN != PARTIAL CHECKPOINT != COMPLETED ATTEMPT`
- **Checkpoint Invariant:** `affectsSchedule: false`, `evidenceEligible: false`
- **Physical Stores:** `ieltsTestBlueprints`, `ieltsTestRuns` in `vocab-master-ielts`
- **Backup Registry:** Schema v6, durable registration with `stage-replace-verify`, legacy dual-read v2–v5
- **Dependencies:** `NONE`
- **Downstream Scope:** `W1_W6_NOT_AUTHORIZED`

---

## 6. Exact Migration V4 Contract and Frozen Digest

### 6.1 Migration Contract
- **Migration ID:** `wave0-ielts-product-contracts-v4`
- **Database:** `vocab-master-ielts`
- **Old Version:** `3`
- **New Version:** `4`
- **Migration Class:** `FORWARD_ONLY_ADDITIVE_IDB_MIGRATION`
- **Migration Mode:** `upgrade` (atomic registration inside the IndexedDB `versionchange` transaction)

### 6.2 Exact Frozen Migration Digest
To eliminate executor and auditor ambiguity, the exact migration digest is frozen:

$$\text{MIGRATION\_DIGEST} = \textbf{\texttt{"wave0-ielts-product-contracts-store-v4:2026-08-15"}}$$

### 6.3 Atomicity Invariant
$$\text{MIGRATION\_ATOMICITY} = \text{SCHEMA\_AND\_LEDGER\_SAME\_VERSIONCHANGE\_TRANSACTION}$$

The schema evolution (store/index creation) and the durable migration ledger record write must succeed or abort atomically within the single IndexedDB `versionchange` transaction managed by `applyUpgradeMigrations()`.

A state equivalent to:
$$\text{DB version 4} + \text{stores created} + \text{wave0-ielts-product-contracts-v4 ledger row absent}$$
is **STRICTLY NON-CONFORMING** and violates transaction boundaries.

### 6.4 Implementation Shape
The future W0 implementation registers the migration definition in `IELTS_MIGRATIONS` equivalent to:
```javascript
defineMigration({
  id: 'wave0-ielts-product-contracts-v4',
  digest: 'wave0-ielts-product-contracts-store-v4:2026-08-15',
  targetVersion: 4,
  mode: 'upgrade',
  description: 'Add durable IELTS test blueprints and session runs object stores.'
})
```
A dedicated `migration.apply` callback is not required if the existing database `upgrade` handler creates the stores in the versionchange transaction. The `mode: 'upgrade'` setting ensures `applyUpgradeMigrations()` writes the ledger row inside that same upgrade transaction.

### 6.5 Strict Prohibition on Post-Upgrade Adoption
The future W0 implementation **MUST NOT** satisfy the v4 migration contract by:
1. Bumping `IELTS_DB_VERSION` to 4;
2. Creating stores via generic upgrade;
3. Then relying on `ensureLedger()` to lazily adopt the missing v4 ledger row afterward (`mode: 'adopt'`).

Such a pattern risks split-brain if interrupted. `ensureLedger()` will throw `MIGRATION_LEDGER_ENTRY_MISSING` if any `mode: 'upgrade'` migration is absent from the ledger upon database open.

---

## 7. Migration Ledger Test Adaptation Scope

Authority to modify [`tests/migration-ledger.test.mjs`](file:///d:/Workspace/EnlishMaster-W6/tests/migration-ledger.test.mjs) is strictly bounded to the minimum changes required for IELTS v4 reconciliation:

1. Update IELTS migration ledger expectations to include `wave0-ielts-product-contracts-v4` as the 4th entry with:
   - `migrationId`: `'wave0-ielts-product-contracts-v4'`
   - `targetVersion`: `4`
   - `digest`: `'wave0-ielts-product-contracts-store-v4:2026-08-15'`
   - `mode`: `'upgrade'`
2. Update double-open idempotency length assertions for IELTS from 3 to 4 (`second.map(rows => rows.length)` becomes `[2, 4, 8]`).
3. Update the physical IELTS upgrade test to expect `upgraded.version === 4`.
4. Update legacy store exclusions in the physical upgrade test to include `ieltsTestBlueprints` and `ieltsTestRuns`.
5. Verify that `ieltsTestBlueprints` and `ieltsTestRuns` are created additively with their verified keyPaths and indexes.


**Prohibition on Unrelated Scope:**
- Core migration tests must remain unchanged.
- V10 migration tests must remain unchanged.
- General framework tests must remain unchanged.

---

## 8. Strict Prohibition on Test-Aware Production Behavior

Future W0 implementation source code must adhere to the invariant:

$$\text{PRODUCTION\_BEHAVIOR\_INDEPENDENT\_OF\_TEST\_HARNESS} = \textbf{TRUE}$$

The following patterns are **EXPLICITLY FORBIDDEN**:
- `new Error().stack` or call-stack inspection;
- Caller identity or test file inspection (e.g., `migration-ledger.test.mjs`);
- Specific source line-number checks (e.g., `:244:`);
- Module URL query parameter inspection (e.g., `import.meta.url.includes('physical-v1-v3')`);
- Falsifying schema versions (e.g., `Object.defineProperty(db, 'version', { value: 3 })`);
- Hiding stores or properties based on caller context;
- Any conditional branch that behaves differently when invoked by a test runner vs production.

Tests must adapt to canonical production contracts. Production contracts must never adapt to stale tests.

---

## 9. Future Recovery Execution Topology

After this supplementary authorization is independently accepted and merged into `main`:

```text
EFFECTIVE_W0_RECOVERY_PREDECESSOR (Exact Merge SHA of this PR)
     │
     ▼
[COMMIT A: RED Tests Only]
     ├─▶ Tests: 6 accepted W0 test files + updated tests/migration-ledger.test.mjs
     ├─▶ Fixtures: tests/fixtures/synthetic-ielts-blueprints.json
     ├─▶ Zero src/** modifications
     ├─▶ Natural RED verified (missing W0 contracts, DB v3 vs v4 assertion)
     │
     ▼
[COMMIT B: GREEN Implementation]
     ├─▶ Source: src/** allowlist only
     ├─▶ Real wave0-ielts-product-contracts-v4 migration registered in IELTS_MIGRATIONS
     ├─▶ Zero test-aware production behavior
     ├─▶ RED test suite immutable (0 byte diff against Commit A)
     └─▶ 100% tests pass locally and on remote exact-head CI
```

---

## 10. Self-Resolving Recovery Predecessor Binding

$$\text{EFFECTIVE\_W0\_RECOVERY\_PREDECESSOR} = \text{EXACT\_RECONCILIATION\_MERGE\_SHA}$$

### Resolution Gates:
1. Independent exact-head audit yields formal `ACCEPT`;
2. `ACCEPT` verdict persisted to PR and fresh-read back;
3. Accepted candidate head unchanged;
4. Exact accepted head merged via normal merge commit onto `4130ef940b515224357548e029d0c34a857c82e5`;
5. Merge topology verified (parent 1 = reconciliation base, parent 2 = accepted head);
6. Natural post-merge push CI succeeds on the exact merge commit SHA.

Future recovery Commit A must use the resolved `EFFECTIVE_W0_RECOVERY_PREDECESSOR` as its direct parent.

---

## 11. Execution Stop Conditions

Halt immediately and fail closed if:
1. `CANONICAL_BASE_DRIFT`: Canonical `main` is not `4130ef940b515224357548e029d0c34a857c82e5`.
2. `AUTH_BRANCH_COLLISION`: Branch `auth/stage2-w0-ielts-arch-test-allowlist-recon-001` already exists with conflicting commits.
3. `CONTROLLING_AUTHORITY_MISMATCH`: Proposed semantics conflict with `STAGE2-W0-IELTS-ARCH-AUTH-001.md`.
4. `TEST_SCOPE_EXPANSION_REQUIRED`: Remediation requires modifying tests outside `tests/migration-ledger.test.mjs`.
5. `SOURCE_ALLOWLIST_EXPANSION_REQUIRED`: Remediation requires modifying source files outside accepted W0 `SOURCE_ALLOWLIST`.
6. `PRODUCT_SEMANTIC_CHANGE_REQUIRED`: Remediation requires altering accepted W0 domain semantics.
7. `UNEXPECTED_NON_DOCS_CHANGE`: Unauthorized modifications detected in `src/**`, `tests/**`, or `package.json`.

---

## 12. Candidate Sign-Off

- **Author Role:** STAGE 2 W0 TEST-ALLOWLIST RECONCILIATION AUTHORIZATION IMPLEMENTER
- **Authorization Transaction:** `STAGE2-W0-IELTS-ARCH-TEST-ALLOWLIST-RECON-001`
- **Target Wave:** `W0-IELTS-ARCH-001`
- **Target Base:** `4130ef940b515224357548e029d0c34a857c82e5`
- **Authority Status:** `CANDIDATE_ONLY / PENDING_INDEPENDENT_AUDIT`
- **Recovery Implementation Status:** `NOT_STARTED`
- **Stage 2 Implementation Status:** `NOT_STARTED`
- **Handoff Target:** `INDEPENDENT STAGE 2 W0-IELTS-ARCH-001 AUTHORIZATION AUDITOR`
