# VocabMaster Agent Router

Compact routing entrypoint and global invariants for coding agents in `NguyenDukKyeon/VocabMaster`.

---

## 1. Fast Start

For any implementation or verification task:

1. **Identify Transaction**: Determine your assigned task / Wave ID (e.g. `W0-IELTS-ARCH-001`).
2. **Compile Context**:
   ```bash
   npm run agent:context -- <TRANSACTION_ID>
   ```
   For machine-readable JSON: `npm run agent:context -- <TRANSACTION_ID> --json`
3. **Consume Primary Capsule**: Use the emitted Agent Context Capsule as your **PRIMARY BOUNDED CONTEXT**.
4. **Verify State**: Confirm canonical base ref and working HEAD against Git state before editing.
5. **On-Demand Escalation Only**: Do **NOT** reread the full governance corpus by default. Open canonical source documents only when an explicit escalation trigger arises.

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
7. **Independent Audit Separation**: Executors cannot self-accept. `CI GREEN ≠ ACCEPT`. Package acceptance and merge require a formal independent review verdict.
8. **Git Safety**: No force-push, history rewrite, destructive reset, secret commit, or debug artifacts in commits.

---

## 3. Authority Hierarchy

When resolving governance, scope, or design questions, consult in this strict canonical order:

1. [`docs/MASTER_ROADMAP.md`](file:///d:/Workspace/EnlishMaster-W6/docs/MASTER_ROADMAP.md) — Master Product Roadmap (Stage 1–8).
2. [`docs/ROADMAP.md`](file:///d:/Workspace/EnlishMaster-W6/docs/ROADMAP.md) — Technical Package Taxonomy & Phase Dependencies (Phase 0–7).
3. [`docs/IMPLEMENTATION_PLAN.md`](file:///d:/Workspace/EnlishMaster-W6/docs/IMPLEMENTATION_PLAN.md) — Package Specifications, Test Plans & Acceptance Criteria.
4. [`docs/IMPLEMENTATION_STATUS.md`](file:///d:/Workspace/EnlishMaster-W6/docs/IMPLEMENTATION_STATUS.md) — Execution Ledger & Canonical Status Source of Truth.
5. [`docs/DECISIONS.md`](file:///d:/Workspace/EnlishMaster-W6/docs/DECISIONS.md) — Architecture Decision Records (ADRs).
6. [`docs/authorizations/`](file:///d:/Workspace/EnlishMaster-W6/docs/authorizations/) — Wave Authorization Manifests.
7. [`AGENTS.md`](file:///d:/Workspace/EnlishMaster-W6/AGENTS.md) — Repository Router & Global Invariants.

---

## 4. Role Router

| Role | Core Responsibilities | Boundaries & Constraints |
|---|---|---|
| **Implementer** | Reads capsule, runs RED baseline, writes minimal GREEN code, verifies locally, pushes Draft PR, awaits CI. | Cannot self-accept, merge, authorize waves, or expand write scope. |
| **Independent Auditor** | Fresh-audits PR head, falsifies claims against raw GitHub/repo evidence, checks regressions, posts formal verdict. | Cannot author PR, implement fixes, or merge without explicit authority. |
| **Repository Governor** | Maintains canonical roadmaps, ADRs, authorization manifests, and governance protocols. | Updates canonical status only upon verified audit acceptance. |

---

## 5. Work-Type Router

| Work Domain | Primary Documents & Pointers | Key Invariants |
|---|---|---|
| **Product & Features** | Capsule allowlist, [`docs/IMPLEMENTATION_PLAN.md`](file:///d:/Workspace/EnlishMaster-W6/docs/IMPLEMENTATION_PLAN.md) | Minimal correct change; preserve domain boundaries. |
| **Tests, Harness & CI** | `tests/`, `.github/workflows/ci.yml` | Deterministic fixtures; ephemeral port/profile cleanup; zero assertion weakening. |
| **Persistence & Backup** | `src/*persistence*.js`, `src/backup-registry.js`, [`docs/DECISIONS.md`](file:///d:/Workspace/EnlishMaster-W6/docs/DECISIONS.md) | Additive forward migrations; deterministic backup/restore journals; 100% store coverage. |
| **IELTS & V10 Modules** | `src/ielts-*`, `src/v10-*`, `scripts/audit-ielts.mjs`, `scripts/audit-v10.mjs` | Multi-track isolation; speech/caption safety; Schedule gateway enforcement. |
| **Wave Governance** | [`docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`](file:///d:/Workspace/EnlishMaster-W6/docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md), [`docs/authorizations/`](file:///d:/Workspace/EnlishMaster-W6/docs/authorizations/) | Exact predecessor linkage; test-first RED/GREEN; frozen candidate history. |

---

## 6. Escalation & On-Demand Triggers

The coding agent should open canonical documents **only** when encountering these triggers:

| Trigger Code | Cause | Action / Target Document |
|---|---|---|
| `AUTHORITY_AMBIGUITY` | Contradictory requirements between docs | Consult [`docs/DECISIONS.md`](file:///d:/Workspace/EnlishMaster-W6/docs/DECISIONS.md) or [`docs/IMPLEMENTATION_PLAN.md`](file:///d:/Workspace/EnlishMaster-W6/docs/IMPLEMENTATION_PLAN.md). |
| `CANONICAL_CONTRADICTION` | Capsule status differs from repo state | Inspect [`docs/IMPLEMENTATION_STATUS.md`](file:///d:/Workspace/EnlishMaster-W6/docs/IMPLEMENTATION_STATUS.md) Section ledger. |
| `UNSUPPORTED_OPERATION` | Requested change exceeds capsule scope | Check controlling manifest in [`docs/authorizations/`](file:///d:/Workspace/EnlishMaster-W6/docs/authorizations/). |
| `CAPSULE_FIELD_UNKNOWN` | Capsule missing needed operational detail | Inspect raw manifest in [`docs/authorizations/`](file:///d:/Workspace/EnlishMaster-W6/docs/authorizations/). |
| `PROVENANCE_VERIFICATION_REQUEST` | Audit requires verifying source blob SHA | Cross-reference blob SHAs with Git objects. |
| `TASK_REQUIRES_DEEPER_DOMAIN_CONTEXT` | Complex domain logic needs background rationale | Read relevant ADR in [`docs/DECISIONS.md`](file:///d:/Workspace/EnlishMaster-W6/docs/DECISIONS.md). |

---

## 7. Execution Stop Conditions

Fail closed and **STOP** immediately if any of the following occur:

- `CANONICAL_BASE_DRIFT`: Working branch base ref diverges from canonical `origin/main`.
- `SCOPE_VIOLATION`: Required change touches files outside the authorized allowlist.
- `RED_REGRESSION`: Pre-existing tests fail or unexpected non-candidate failures appear.
- `METRIC_INCONSISTENCY`: Capsule byte metric or machine-work counts fail self-consistency.
- `CAPSULE_CONFLICT`: Capsule operational facts contradict canonical source documents.
- `UNAUTHORIZED_MERGE`: Attempting merge without explicit independent audit `ACCEPT` verdict.
