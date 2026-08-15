# Supplementary Execution Predecessor Reconciliation — Stage 2 Wave W0

## Identity

| Field | Value |
|---|---|
| **Reconciliation ID** | `STAGE2-W0-IELTS-ARCH-BASE-RECON-001` |
| **Controlling Authorization** | `STAGE2-W0-IELTS-ARCH-AUTH-001` |
| **Controlling Authorization Path** | `docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md` |
| **Authorization PR** | #88 |
| **Authorization ACCEPT** | Comment `5301830457` on PR #88 |
| **Authorization Merge** | `ee7d1b72c46a5e3e8e1411256ac4bd62360bbc54` |
| **Date** | 2026-08-15 |
| **Status** | `CANDIDATE / PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE` |

---

## Purpose

This document is a **supplementary execution predecessor rebinding** for the
already-accepted `STAGE2-W0-IELTS-ARCH-AUTH-001` authorization manifest.

It does NOT:

- modify W0 product semantics;
- modify W0 write allowlists;
- modify W0 RED/GREEN contract;
- modify W0 migration/rollback obligations;
- modify W0 dependency policy;
- authorize W1–W6;
- authorize Stages 3–8;
- grant implementation authority by itself.

The **only intended authority change** is:

$$\text{EXECUTION\_PREDECESSOR\_REBINDING}$$

from the historically accepted W0 predecessor to current canonical `main`,
after proof that all intervening changes are compatible with the accepted W0
contract.

---

## Old Execution Predecessor

```
COMMIT:    a755ae4949746a71ac86299b34766ad8fe3b6fb6
IDENTITY:  Merge PR #87 / STAGE2-IELTS-STRATEGY-001
```

This is the canonical predecessor recorded in the accepted W0 authorization
manifest (§6, §10.1, §7.2) and the independent ACCEPT verdict (comment
`5301830457`).

## New Execution Predecessor

```
COMMIT:    f13804d062ded7c331a62d657144a5907163012e
IDENTITY:  Merge PR #92 / EXECUTION-PROMPT-PROTOCOL-V2-002
PARENTS:   2812f639a5967e0389b77fdb71be1a0f97b928d4 (main^1)
           6e0dd0a4597566ff7976f471196eb9a01a0a0616 (candidate^2)
```

---

## Intervening Lineage

Three canonical transactions were merged into `main` between the old and new
predecessor. All are enumerated and classified below.

### Transaction A — W0 Authorization Canonicalization (PR #88)

```
MERGE:     ee7d1b72c46a5e3e8e1411256ac4bd62360bbc54
PR:        #88
VERDICT:   ACCEPT (comment 5301830457)
```

**Changed paths:**

| Path | Change | Classification |
|---|---|---|
| `docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md` | NEW | W0 authorization manifest |
| `docs/IMPLEMENTATION_STATUS.md` | MODIFIED | Status ledger (Section 14) |

**W0 compatibility:** `ORTHOGONAL` — This transaction *is* the W0 authorization
itself. It introduced the canonical manifest that this reconciliation
preserves. Zero product code changes.

---

### Transaction B — IELTS Hub Render-Race Recovery (PR #91)

```
MERGE:     2812f639a5967e0389b77fdb71be1a0f97b928d4
PR:        #91
IDENTITY:  IELTS-HUB-RENDER-RACE-RECOVERY-002
```

**Changed paths:**

| Path | Change | Classification |
|---|---|---|
| `src/ielts-hub-v2.js` | MODIFIED | Product defect fix |
| `tests/ielts-hub-render-race.test.mjs` | NEW | Regression test |

**Exact semantic effect:**

1. Added a `renderGeneration` counter variable (line-level addition).
2. Modified the `render()` function to capture the current generation and active
   tab *before* async data fetching, and to silently discard stale results when
   the generation or tab has changed by the time async work completes.
3. Added a dedicated regression test file validating that stale async renders
   do not overwrite newer tab selections.

**W0 compatibility analysis — CRITICAL GATE:**

| W0 Semantic Predicate | PR #91 Impact | Result |
|---|---|---|
| Track routing (`academic` / `general-training`) | NOT IMPLEMENTED — No track identifiers, selectors, or routing logic added | ✅ ORTHOGONAL |
| Blueprint schemas (`ielts-test-blueprint` v1) | NOT IMPLEMENTED — No blueprint types, schemas, or validation | ✅ ORTHOGONAL |
| Practice hierarchy (`IELTS_PRACTICE_HIERARCHY_LEVELS`) | NOT IMPLEMENTED — No hierarchy enums or constants | ✅ ORTHOGONAL |
| New IndexedDB stores (`ieltsTestBlueprints`, `ieltsTestRuns`) | NOT IMPLEMENTED — No store creation, migration, or DB version change | ✅ ORTHOGONAL |
| IELTS DB v3 → v4 migration | NOT IMPLEMENTED — DB version unchanged at v3 | ✅ ORTHOGONAL |
| Backup schema v5 → v6 | NOT IMPLEMENTED — No backup registry changes | ✅ ORTHOGONAL |
| Session/checkpoint contract (S15-F005) | NOT IMPLEMENTED — No session state, checkpoint, or resume logic | ✅ ORTHOGONAL |
| `src/ielts-hub-v2.js` substrate | MODIFIED — Generation guard added to `render()` | ✅ COMPATIBLE |

The `render()` generation guard is a **pre-existing substrate defense** against
async race conditions. It does not add any W0 feature. Future W0 Commit B
extends `src/ielts-hub-v2.js` by adding a minimal track selector toggle and
track-filtered content view — both of which operate within the *existing*
render/tab lifecycle and are unaffected by the generation guard.

**PR #91 classification:** `ORTHOGONAL_COMPATIBLE_SUBSTRATE`

No accepted W0 semantic predicate is already satisfied, invalidated, partially
implemented, or made ambiguous by PR #91.

---

### Transaction C — Execution Prompt Protocol V2 (PR #92)

```
MERGE:     f13804d062ded7c331a62d657144a5907163012e
PR:        #92
VERDICT:   ACCEPT (comment 5302371910)
IDENTITY:  EXECUTION-PROMPT-PROTOCOL-V2-002
```

**Changed paths:**

| Path | Change | Classification |
|---|---|---|
| `AGENTS.md` | MODIFIED | Governance (Protocol V2 activation clause) |
| `docs/DECISIONS.md` | MODIFIED | ADR-051 (Protocol V2 decision record) |
| `docs/IMPLEMENTATION_STATUS.md` | MODIFIED | Status ledger (Section 15) |
| `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` | NEW | Protocol V2 document |

**W0 compatibility:** `ORTHOGONAL` — Pure governance/docs transaction. Zero
product code changes. Zero `src/**`, `tests/**`, or `package.json` changes.
Protocol V2 governs prompting and handoff mechanics; it does not modify W0
product semantics, allowlists, RED/GREEN contracts, or migration obligations.

---

## Aggregate Intervening Changed Paths

| Path | Transaction | Classification |
|---|---|---|
| `AGENTS.md` | C (PR #92) | Governance |
| `docs/DECISIONS.md` | C (PR #92) | Governance |
| `docs/IMPLEMENTATION_STATUS.md` | A (PR #88), C (PR #92) | Status ledger |
| `docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md` | A (PR #88) | W0 authorization manifest |
| `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` | C (PR #92) | Governance |
| `src/ielts-hub-v2.js` | B (PR #91) | Product defect fix |
| `tests/ielts-hub-render-race.test.mjs` | B (PR #91) | Regression test |

**Product code changes:** Only `src/ielts-hub-v2.js` (render-race guard) and
its regression test. Both are orthogonal to W0 product semantics.

---

## Unchanged W0 Semantics

The following accepted W0 contract elements from `STAGE2-W0-IELTS-ARCH-AUTH-001`
remain **exactly unchanged** by this reconciliation:

- **Tracks:** `academic`, `general-training`
- **Global preference:** Saved learner setting in `IELTS_STORE_NAMES.settings`
- **Launch override:** Launch-scoped track override
- **Default:** No silent default; explicit selector or saved preference required
- **Blueprint identities:** `ielts-blueprint:<sha256>`
- **Blueprint version:** v1
- **Lifecycle separation:** BLUEPRINT ≠ ACTIVE RUN ≠ PARTIAL CHECKPOINT ≠ COMPLETED ATTEMPT
- **Checkpoint invariants:** `affectsSchedule: false`, `evidenceEligible: false`
- **Physical stores:** `ieltsTestBlueprints`, `ieltsTestRuns`
- **Database:** `vocab-master-ielts`
- **IELTS DB migration:** v3 → v4 additive
- **Backup schema:** v5 → v6 with dual-read legacy (v2–v5)
- **Dependencies:** NONE

---

## Unchanged W0 Write Allowlist

The accepted W0 execution allowlist from §5 of `STAGE2-W0-IELTS-ARCH-AUTH-001`
remains **exactly unchanged:**

### Source Allowlist

- `src/ielts-domain.js`
- `src/ielts-profile-inventory.js`
- `src/ielts-persistence.js`
- `src/backup-registry.js`
- `src/ielts-hub-v2.js`
- `src/primary-ia-v10.js`

### Test Allowlist

- `tests/ielts-domain.test.mjs`
- `tests/ielts-persistence.test.mjs`
- `tests/backup-registry.test.mjs`
- `tests/restore-safety.test.mjs`
- `tests/ielts-track-routing.test.mjs`
- `tests/ielts-track-routing-browser.test.mjs`

### Fixture Allowlist

- `tests/fixtures/synthetic-ielts-blueprints.json`

### Note on `tests/ielts-hub-render-race.test.mjs`

`tests/ielts-hub-render-race.test.mjs` is a **pre-existing canonical substrate
file** at the new predecessor. It is NOT added to W0's write allowlist. The W0
executor must preserve it unchanged.

---

## Unchanged RED/GREEN Contract

Future W0 execution must still follow the strict two-commit RED → GREEN topology
specified in §6 of `STAGE2-W0-IELTS-ARCH-AUTH-001`:

### Updated Execution Topology

```
f13804d062ded7c331a62d657144a5907163012e  (NEW canonical base)
     │
     ▼
[COMMIT A: RED Tests Only] (Adds failing test assertions; zero src/** edits)
     │
     ├─▶ Verified expected failure predicates (Missing contracts/stores)
     ├─▶ Zero syntax / compile / import breakages
     │
     ▼
[COMMIT B: GREEN Implementation] (Edits allowed src/** only; RED tests become immutable)
     │
     ├─▶ 100% Unit, Integration, and Backup tests pass
     ├─▶ Minimal track selector browser smoke passes
     └─▶ Exact-head remote CI succeeds
```

### RED Contract Preservation

All §6.1 expected failure predicates remain valid against the new predecessor:

| Predicate | New Predecessor Status |
|---|---|
| `IELTS_TRACKS` not defined | ✅ Still absent |
| `validateIeltsTestBlueprint` not defined | ✅ Still absent |
| `IELTS_PRACTICE_HIERARCHY_LEVELS` not defined | ✅ Still absent |
| `ieltsTestBlueprints` store missing in DB v3 | ✅ Still absent |
| `saveIeltsTestRun` not a function | ✅ Still absent |
| Backup registry missing new stores | ✅ Still absent |
| `getSelectedIeltsTrack` not a function | ✅ Still absent |
| `[data-ielts-track]` selector not found | ✅ Still absent |

The generation guard in `src/ielts-hub-v2.js` (PR #91) does not affect any of
these predicates because they test domain contracts, persistence schemas, and
backup registration — none of which are touched by the render-race fix.

### RED Immutability

Once future Commit A is committed and its failure predicates verified, RED test
blobs remain strictly immutable per §6.2.

---

## Unchanged Migration/Rollback Contract

The migration and rollback contracts from §7 of `STAGE2-W0-IELTS-ARCH-AUTH-001`
remain **exactly unchanged:**

- **Migration ID:** `wave0-ielts-product-contracts-v4`
- **Database:** `vocab-master-ielts`
- **Old Version:** 3 → **New Version:** 4
- **Migration Class:** `FORWARD_ONLY_ADDITIVE_IDB_MIGRATION`
- **Rollback Class:** `ADDITIVE_READER_COMPATIBLE` + `ROUTE_DISABLED`

The rollback contract reference to predecessor `a755ae4949746a71ac86299b34766ad8fe3b6fb6`
in §7.2 is now understood as: reverting to any commit in the canonical lineage
that lacks the W0 implementation leaves the database at version 4 with unknown
additive stores safely ignored by the forward-compatible opener. The new
predecessor `f13804d062ded7c331a62d657144a5907163012e` preserves this property
identically because the DB version remains at 3 (no migration has occurred).

---

## Immutable Canonical Substrate Files

The following files exist at the new predecessor and must be preserved unchanged
by W0 execution (they are NOT in the W0 write allowlist):

| File | Origin | Constraint |
|---|---|---|
| `tests/ielts-hub-render-race.test.mjs` | PR #91 | Pre-existing regression test; W0 executor must not modify |
| `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md` | PR #92 | Governance document; W0 executor must not modify |
| `docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md` | PR #88 | Historical W0 authorization; W0 executor must not modify |

---

## Stop Conditions

The following stop conditions apply to both this reconciliation candidate and
to future W0 execution using the reconciled predecessor:

1. `CANONICAL_BASE_DRIFT` — Canonical `main` is not `f13804d062ded7c331a62d657144a5907163012e`.
2. `IMPLEMENTATION_BRANCH_COLLISION` — Branch `exec/stage2-w0-ielts-arch-001` already exists with conflicting commits.
3. `W0_AUTHORITY_MISMATCH` — Proposed semantics conflict with `STAGE2-W0-IELTS-ARCH-AUTH-001`.
4. `INTERVENING_LINEAGE_AMBIGUITY` — Unresolvable ambiguity in intervening canonical changes.
5. `PR91_W0_SEMANTIC_OVERLAP` — PR #91 changes overlap with accepted W0 product predicates.
6. `W0_RED_CONTRACT_RECONCILIATION_REQUIRED` — Accepted RED predicates no longer map to current substrate.
7. `RED_CONTRACT_DRIFT` — Future executor discovers RED contract no longer produces natural deterministic failure.
8. `ALLOWLIST_CHANGE_REQUIRED` — Implementation requires files outside accepted W0 allowlist.
9. `W0_SEMANTIC_CHANGE_REQUIRED` — Implementation requires W0 product semantic modifications.
10. `MIGRATION_CHANGE_REQUIRED` — Implementation requires non-additive or destructive migration changes.
11. `DEPENDENCY_CHANGE_REQUIRED` — Implementation requires new npm packages or external services.
12. `UNEXPECTED_NON_DOCS_CHANGE` — Unauthorized modifications in `src/**`, `tests/**`, or `package.json`.

---

## Independent Acceptance Requirement

This reconciliation candidate **cannot be self-accepted** by the reconciliation
implementer.

An independent auditor must verify:

1. Canonical main is exactly `f13804d062ded7c331a62d657144a5907163012e`.
2. All intervening transactions (PR #88, PR #91, PR #92) are correctly classified.
3. PR #91 product changes are genuinely orthogonal to accepted W0 semantics.
4. All accepted W0 predicates remain valid against the new predecessor.
5. No W0 semantic, allowlist, RED/GREEN, migration, or dependency change is introduced.
6. The reconciliation document itself is docs-only with zero product code changes.

Only after independent `ACCEPT` does this predecessor rebinding become effective.

`STAGE2-W0-IELTS-ARCH-AUTH-001` remains the controlling W0 semantic authority.
This reconciliation controls ONLY the exact execution predecessor binding and
baseline compatibility verification.
