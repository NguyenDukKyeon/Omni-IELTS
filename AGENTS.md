# VocabMaster Agent Router

Compact routing entrypoint and global invariants for coding agents in `NguyenDukKyeon/VocabMaster`.

---

## 1. Fast Start

Route according to your assigned role:

### Implementer
1. **Identify Transaction**: Determine your assigned task / Wave ID (e.g. `W0-IELTS-ARCH-001`).
2. **Compile Context**:
   ```bash
   npm run agent:context -- <TRANSACTION_ID>
   ```
   For machine-readable JSON: `npm run agent:context -- <TRANSACTION_ID> --json`
   *(If compiler fails closed with `UNKNOWN_TRANSACTION` or unsupported format, open the controlling canonical document directly).*
3. **Consume Primary Capsule**: Use the emitted Agent Context Capsule as your **PRIMARY BOUNDED OPERATIONAL CONTEXT**.
4. **Verify State**: Confirm canonical base ref and working HEAD against Git state before editing.
5. **On-Demand Escalation Only**: Do **NOT** reread the full governance corpus by default. Open canonical source documents only when an explicit escalation trigger arises or deep domain context is required.

### Independent Auditor
1. **Fresh-Verify Raw Evidence**: Do **NOT** treat the compiler capsule or implementer claims as accepted evidence.
2. **Independent Ground Truth**: Inspect raw GitHub state, PR diff, exact commit topology (`base`, `head`, `parents`), CI run/steps, and artifacts with digests.
3. **Canonical Authority**: Fresh-read controlling canonical documents and acceptance criteria directly from repository sources.
4. **Persist Verdict**: Post a formal independent audit verdict (`ACCEPT`, `REJECT`, or `BLOCKED`).

### Repository Governor
1. **Canonical Authority**: Fresh-read controlling canonical roadmaps, ADRs, and protocols for any governance or status mutations.
2. **State Ledger**: Update canonical status in [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) only upon verified independent audit acceptance.

---

## 2. Global Non-Negotiable Invariants

Every agent must preserve these invariants at all times:

1. **Authority Model**:
   - `CANONICAL_DOCS = AUTHORITY`
   - `CONTEXT_COMPILER = DERIVED_OPERATIONAL_CONTEXT`
   - `CAPSULE ≠ AUTHORITY`
   - If a capsule conflicts with a canonical document, **CANONICAL SOURCE WINS**. Stop and reconcile.
2. **One-Writer Rule**: Only one agent writes/modifies files. Subagents analyze/review only; never commit, push, or open PRs.
3. **Strict Allowlist Scope**: Write only to files declared in the transaction's allowlist. Zero out-of-scope modifications.
4. **Evidence Gateway**: `EvidencePolicy` is the sole gateway transforming attempts into review events / FSRS mutations. Reveals, hints, coaching, transcript views, skips, and Retell without real output/evaluator **NEVER** generate positive independent evidence.
5. **Durable Persistence**: Write, commit, reopen, and read-back before clearing source data. RAM fallbacks must not masquerade as durable storage. Forward-only additive schema migrations.
6. **Containment UI**: Exactly one safe production entrypoint for Today and one Inbox/Capture. Old listeners/routes must be disabled or removed, not merely hidden with CSS.
7. **Independent Audit Separation & Merge Authority**:
   - Executors cannot self-accept. `CI GREEN ≠ ACCEPT`.
   - `INDEPENDENT_ACCEPTANCE ≠ MERGE_AUTHORITY`. An independent `ACCEPT` verdict does NOT grant merge authority unless explicit merge authorization is separately granted for that transaction.
8. **Git Safety**: No force-push, history rewrite, destructive reset, secret commit, or debug artifacts in commits.

---

## 3. Authority Hierarchy

When resolving governance, scope, or design questions, consult in this strict canonical order:

1. [`docs/MASTER_ROADMAP.md`](docs/MASTER_ROADMAP.md) — Master Product Roadmap (Stage 1–8).
2. [`docs/ROADMAP.md`](docs/ROADMAP.md) — Technical Package Taxonomy & Phase Dependencies (Phase 0–7).
3. [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — Package Specifications, Test Plans & Acceptance Criteria.
4. [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) — Execution Ledger & Canonical Status Source of Truth.
5. [`docs/DECISIONS.md`](docs/DECISIONS.md) — Architecture Decision Records (ADRs).
6. [`AGENTS.md`](AGENTS.md) — Repository Router & Global Invariants.

### Task-Specific Authorizations
Accepted Wave Authorization Manifests in `docs/authorizations/` control bounded execution for their specific authorized transactions under [`EXECUTION_PROMPT_PROTOCOL_V2.md`](docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md). They provide task-specific boundary authority where effective, but do not alter the permanent global authority hierarchy above. If no effective authorization exists, no task execution authority is granted.

---

## 4. Role Router

| Role | Core Responsibilities | Boundaries & Constraints |
|---|---|---|
| **Implementer** | Reads capsule, runs RED baseline, writes minimal GREEN code, verifies locally, pushes Draft PR, awaits CI. | Cannot self-accept, merge, authorize waves, or expand write scope. |
| **Independent Auditor** | Fresh-audits PR head, falsifies claims against raw GitHub/repo evidence, checks regressions, posts formal verdict. | Cannot author PR, implement fixes, or merge without explicit merge authority. |
| **Repository Governor** | Maintains canonical roadmaps, ADRs, authorization manifests, and governance protocols. | Updates canonical status only upon verified audit acceptance; cannot expand authority unilaterally. |

---

## 5. Work-Type Router

| Work Domain | Primary Documents & Pointers | Key Invariants |
|---|---|---|
| **Product & Features** | Capsule allowlist, [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Minimal correct change; preserve domain boundaries. |
| **Tests, Harness & CI** | `tests/`, `.github/workflows/ci.yml` | Deterministic fixtures; ephemeral port/profile cleanup; zero assertion weakening. |
| **Persistence & Backup** | `src/*persistence*.js`, `src/backup-registry.js`, [`docs/DECISIONS.md`](docs/DECISIONS.md) | Additive forward migrations; deterministic backup/restore journals; 100% store coverage. |
| **IELTS & V10 Modules** | `src/ielts-*`, `src/v10-*`, `scripts/audit-ielts.mjs`, `scripts/audit-v10.mjs` | Multi-track isolation; speech/caption safety; Schedule gateway enforcement. |
| **Wave Governance** | [`EXECUTION_PROMPT_PROTOCOL_V2.md`](docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md), `docs/authorizations/` | Exact predecessor linkage; test-first RED/GREEN; frozen candidate history. |

---

## 6. Escalation & On-Demand Triggers

The coding agent should open canonical documents **only** when encountering these triggers:

| Trigger Code | Cause | Action / Resolution Rule |
|---|---|---|
| `AUTHORITY_AMBIGUITY` | Contradictory requirements between documents | Compare controlling sources using the canonical Authority Hierarchy (higher-tier sources take precedence). If unresolved, STOP fail-closed. |
| `CANONICAL_CONTRADICTION` | Capsule operational facts conflict with repository state | Inspect [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) ledger. Canonical source wins; STOP and reconcile. |
| `UNSUPPORTED_OPERATION` | Requested change exceeds capsule scope | Inspect controlling manifest in `docs/authorizations/` or [`docs/ROADMAP.md`](docs/ROADMAP.md); do not expand scope. |
| `CAPSULE_FIELD_UNKNOWN` | Capsule missing needed operational detail | Inspect raw manifest in `docs/authorizations/`. |
| `PROVENANCE_VERIFICATION_REQUEST` | Audit requires verifying source blob SHA | Cross-reference blob SHAs with Git objects. |
| `TASK_REQUIRES_DEEPER_DOMAIN_CONTEXT` | Complex domain logic needs background rationale | Read relevant ADR in [`docs/DECISIONS.md`](docs/DECISIONS.md) or package spec in [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md). |

---

## 7. Execution Stop Conditions

The following are **GLOBAL ROUTER STOP CONDITIONS**. They supplement, and do **NOT** replace, transaction-specific, manifest-specific, plan-specific, or capsule stop conditions. Both global and transaction-specific stop conditions are strictly binding.

Fail closed and **STOP** immediately if any of the following occur:

- `CANONICAL_BASE_DRIFT`: Working branch base ref diverges from canonical `origin/main`.
- `SCOPE_VIOLATION`: Required change touches files outside the authorized allowlist.
- `RED_REGRESSION`: Pre-existing tests fail or unexpected non-candidate failures appear.
- `METRIC_INCONSISTENCY`: Capsule byte metric or machine-work counts fail self-consistency.
- `CAPSULE_CONFLICT`: Capsule operational facts contradict canonical source documents.
- `UNAUTHORIZED_MERGE`: Attempting merge without BOTH an independent audit `ACCEPT` verdict AND explicit merge authorization for that transaction.
- `TRANSACTION_STOP_TRIGGERED`: Any transaction-specific stop condition from the controlling authorization manifest or implementation plan is triggered.
