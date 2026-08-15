# Execution Prompt Protocol V2 (EXECUTION_PROMPT_PROTOCOL_V2)

**Candidate Status**: `CANDIDATE_UNTIL_ACTIVATION_GATES_SATISFIED`  
**Transaction Identity**: `EXECUTION-PROMPT-PROTOCOL-V2-002`  
**Base Predecessor**: `2812f639a5967e0389b77fdb71be1a0f97b928d4` (Merge PR #91 / `IELTS-HUB-RENDER-RACE-RECOVERY-002`)  
**Decision Record**: ADR-051 in `docs/DECISIONS.md`  
**Related Decision**: ADR-046 (`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`)

---

## 1. Executive Summary & Purpose

The **Execution Prompt Protocol V2** establishes a high-efficiency execution prompting and handoff model for repository governance and technical delivery across VocabMaster. It minimizes user prompt count, prompt duplication, and artificial manual handoffs while preserving **100%** of the repository's mandatory quality gates, authority separation, and safety invariants.

### 1.1 Core Principle
$$\text{QUALITY\_GATE\_COUNT} \neq \text{USER\_PROMPT\_COUNT}$$

A deterministic, pre-authorized technical or administrative transition does **NOT** require a fresh user prompt merely because a process phase name changes. An owning transaction continues through authorized deterministic transitions autonomously when:
1. Controlling authority already grants them;
2. No new discretionary decision is required;
3. Evidence can be fresh-verified;
4. No stop condition has fired.

### 1.2 Lineage & Remediation
- **Historical Candidate V2-001** (`PR #89` / commit `3943efc11b57d088b58df3abe0f542d7228df76a`) exposed a pre-existing IELTS Hub async render race product defect under natural CI.
- **Incident Remediation** (`PR #91` / `IELTS-HUB-RENDER-RACE-RECOVERY-002`) independently fixed and canonicalized the render race at commit `2812f639a5967e0389b77fdb71be1a0f97b928d4`.
- **Transaction V2-002** clean-rematerializes Protocol V2 from canonical `main` without reusing invalid history or cherry-picking historical PR commits.

---

## 2. Relationship to Protocol V1 (ADR-046) & Authority Architecture

### 2.1 Relationship to ADR-046
- **ADR-046 (`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`)**: Serves as **BOUNDARY & CAPSULE AUTHORITY**. It governs execution capsule boundaries, authorization manifest schemas, allowlist rules, and independent acceptance mandates. ADR-046 remains canonical and is **NOT** repealed or weakened.
- **`EXECUTION_PROMPT_PROTOCOL_V2` / ADR-051**: Serves as **PROMPTING & HANDOFF PROCEDURE**. It governs transaction prompt architecture, role separation mechanics, handoff elimination, and centralized invariant management.
- Protocol V2 supersedes repetitive prompt and handoff conventions for new transactions upon formal activation.
- Historical manifests authored under Protocol V1 (including `STAGE2-W0-IELTS-ARCH-AUTH-001`) remain **100% valid, canonical, and unmodified**. Protocol V2 does not retroactively reinterpret accepted authorization semantics.

### 2.2 Canonical Document Authority Hierarchy
Repository governance preserves the exact canonical document authority hierarchy defined in `docs/MASTER_ROADMAP.md`:

| Level | Document | Canonical Scope & Ownership |
|---|---|---|
| **Level 1 — Master Product Roadmap** | `docs/MASTER_ROADMAP.md` | Top-level Stage 1–8 product sequencing, Stage missions, ordering, completion state |
| **Level 2 — Technical Package Taxonomy** | `docs/ROADMAP.md` | Phase 0–7 package IDs, technical dependency graph, architecture boundaries, cross-cutting packages |
| **Level 3 — Implementation Specification** | `docs/IMPLEMENTATION_PLAN.md` | Package acceptance criteria, test/migration/rollback/stop conditions |
| **Level 4 — Implementation Status** | `docs/IMPLEMENTATION_STATUS.md` | Actual execution status, evidence, exact commit bindings |
| **Level 5 — Decision Records** | `docs/DECISIONS.md` | Architecture/product rationale and ADRs |
| **Level 6 — Repository Rules** | `AGENTS.md` | Invariant execution rules, evidence policy, Git conventions |

### 2.3 Execution Authority Taxonomy
Execution authority operates across distinct, non-fungible roles governed by the controlling canonical documents:

$$\text{RESEARCH} \neq \text{SPECIFICATION} \neq \text{AUTHORIZATION} \neq \text{IMPLEMENTATION} \neq \text{EVIDENCE} \neq \text{INDEPENDENT ACCEPTANCE} \neq \text{MERGE AUTHORITY}$$

Accepted strategies (e.g. `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`), bounded authorization manifests (e.g. `docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md`), implementation evidence, and independent verdicts are **NOT** additional invented roadmap hierarchy levels. They represent discrete execution roles and artifacts that derive authority from and remain strictly subordinate to the canonical document hierarchy above.

---

## 3. Centralized Repository Invariants

`AGENTS.md` remains mandatory repository governance. Protocol V2 centralizes reusable generic execution and prompting invariants so transaction prompts reference them by canonical identity; it does **not** replace, supersede, or exhaustively restate `AGENTS.md`, transaction-specific authorizations, product/domain invariants, or package-specific acceptance rules.

### 3.1 Universal Authority Invariants (All Transaction Classes)
- **Authority Separation**: Research $\neq$ Specification $\neq$ Authorization $\neq$ Implementation $\neq$ Evidence $\neq$ Independent Acceptance $\neq$ Merge Authority.
- **No Inferred Authority**: Authority cannot be inferred from roadmap placement, PR existence, green CI, or DOM state.
- **Fail-Closed on Gaps**: Missing, stale, or ambiguous authority halts execution immediately.
- **Zero Self-Acceptance**: An agent or session executing work cannot independently audit or accept its own output.

### 3.2 Git & Topology Invariants
- **Exact Predecessor Binding**: Every candidate branch must branch directly from the exact canonical base commit SHA.
- **Single-Writer Discipline Across All Repository Mutations**: Exactly ONE authorized writer/session may mutate candidate repository content or candidate Git history during a transaction. This rule applies universally across all repository mutations: source files, tests, documentation, governance files, fixtures, any other repository file, candidate commits, and candidate branch refs. Subagents and Independent Auditors remain strictly read-only with respect to candidate repository content and candidate history. An Independent Auditor may perform non-implementation platform and audit-record actions **ONLY** when explicitly authorized by controlling authority (e.g. posting formal PR verdict comments/reviews, performing Draft-to-Ready PR metadata transitions, executing exact-head merges, and inspecting post-merge CI). The Auditor must never remediate candidate code, create candidate commits, change repository files, or grant itself new authority.
- **Immutable History**: No `git rebase`, no `git commit --amend`, no force-pushing (`git push --force`), no destructive resets, and no history rewriting.
- **Fail-Closed on Drift**: Any unexpected commit on base or candidate head halts execution (`CANONICAL_BASE_DRIFT`).

### 3.3 Write Scope Invariants
- **Closed Exact Allowlists**: Writes are limited to the exact closed allowlist granted by the controlling accepted authorization/capsule or other explicit canonical transaction authority.
- **Zero Scope Expansion**: No unauthorized dependency modifications (`package.json`), workflow changes (`.github/**`), or unlisted file edits. No inferred write scope is permitted.

### 3.4 RED $\to$ GREEN Invariants (When Controlling Implementation Authority Requires)
- **Test-First Commit A (RED)**: When required by the controlling implementation authorization, Commit A introduces natural, deterministic test failures directly exercising the specified product defect or requirement.
- **RED Immutability**: RED test blobs are permanently immutable after valid Commit A. Tests cannot be altered, skipped, or quarantine-wrapped to make gates pass.
- **Minimal Commit B (GREEN)**: Commit B contains only the minimal necessary implementation code to satisfy the RED tests.
- **Zero Assertion Weakening**: No assertion edits, timeouts inflated to mask race conditions, or business-logic failures converted into harness skips.
- **Non-Universal Scope**: Pure research, discovery, strategy, benchmarking, incident triage, or final audits do not require artificial RED/GREEN commits unless controlling authority specifically defines a test contract.

### 3.5 Natural CI & Artifact Invariants (When Applicable)
- **Natural Exact-Head CI**: All CI evidence must come from natural pull request or push events running on the exact candidate head SHA when repository mutations occur and canonical workflow requires it. Synthetic triggers (`workflow_dispatch`, close/reopen tricks, rerun substitutions) are forbidden.
- **Read-Only Exemption**: Natural CI is not invented or required for pure read-only research/audit transactions where no candidate repository head exists.
- **Dynamic Artifact Verification**: Where the active CI workflow emits verification artifacts, the audit must fresh-resolve the required artifact set from active CI configuration, verify exact SHA bindings, download and inspect logs, and verify hashes/provenance. Hard-coding stale artifact counts is forbidden.

### 3.6 Evidence & Learning Invariants
- **Raw Evidence Authority**: Raw test logs, command outputs, and persistence verification strictly supersede agent assertions or narrative summaries.
- **Evidence Gateway Integrity**: `EvidencePolicy` is the sole gateway turning attempts into review events or schedule mutations. Policy is default-deny.
- **No False Positives**: Unverified sources, revealed answers, retries after reveal, skips, or coaching cannot produce positive independent evidence.

### 3.7 Data Safety, Backup & Migration Invariants
- **100% Store Backup Sentinel**: Every durable store (Core, IELTS, V10, drafts, outbox, settings) must be registered in the backup registry.
- **Forward-Only Schema Migrations**: IndexedDB migrations are strictly additive, idempotent, and forward-compatible; no destructive downgrades.
- **Journaled Restore**: Restore follows stage $\to$ validate whole payload $\to$ journal $\to$ commit/reconcile $\to$ reopen/read-back/verify.

### 3.8 Independent Audit Invariants & Verdict Taxonomy
- **Absolute Role Separation**: The Implementer/Executor cannot independently audit or accept its own work.
- **Fresh Independent Inspection**: Independent Auditors must fresh-read all diffs, CI runs, logs, and artifacts independently. Green CI $\neq$ ACCEPT.
- **Formal Verdict Taxonomy**:
  - `ACCEPT`: Candidate satisfies all controlling authority, specification, and verification evidence.
  - `REJECT`: Candidate itself has a substantive remediable defect.
  - `BLOCKED`: Reliable independent determination cannot be completed because required authority, evidence, tools, or external state is unavailable or defective.
- **Verdict Persistence & Read-Back**: Formal verdict (`ACCEPT`, `REJECT`, or `BLOCKED`) must be persisted to the PR / discussion and fresh read back before any subsequent action.

### 3.9 Conditional Merge Invariants
- **Pre-Authorized Merge Execution**: An Independent Auditor may execute an exact-head merge in the same transaction **ONLY IF** the controlling authorization manifest or controlling transaction explicitly grants merge authority (`MERGE_AUTHORITY: EXPLICITLY_GRANTED`). If merge authority is `NOT_GRANTED`, the transaction halts at `ACCEPTED_PENDING_INTEGRATION`. The protocol or template itself **NEVER** creates or infers merge authority.
- **Pre-Merge Conditions**: Verdict (`ACCEPT`) is persisted and read back, candidate head matches accepted SHA, base is unchanged, and mergeability is clean.

### 3.10 Fail-Closed Stop Conditions
Execution halts immediately when any stop condition is triggered:
- `CANONICAL_BASE_DRIFT`: Base commit differs from expected canonical SHA.
- `BRANCH_COLLISION`: Target branch name already exists.
- `AUTHORITY_EXPANSION`: Discretionary decisions attempted outside frozen scope.
- `UNAUTHORIZED_WRITE_ATTEMPT`: Changes proposed outside exact file allowlist.
- `INVALID_RED_CONTRACT`: Commit A passes prematurely or fails unnaturally.
- `NATURAL_CI_NOT_ESTABLISHED`: CI failed, timed out, or ran on incorrect head.
- `PREDECESSOR_MISMATCH`: Chain of custody or commit predecessor broken.

---

## 4. Applicability & Lifecycle Profiles

### 4.1 Repository-Wide Applicability
`EXECUTION_PROMPT_PROTOCOL_V2` applies to new execution prompting transactions across all future VocabMaster repository work (including Stages 2–8) upon successful activation. It governs generic execution mechanics, handoff elimination, and authority safety.

> [!WARNING]
> **Non-Authorization of Future Stages**: Mention of future Stages in this protocol documents repository applicability only. Acknowledging future Stages does **NOT** authorize any future Stage work. Stages 3–8 remain **NOT AUTHORIZED** until separate controlling strategy, roadmap, and authorization artifacts are ratified by the repository owner:
> - **Stage 3**: Learning / Product Deep Research
> - **Stage 4**: UX / IA Remake
> - **Stage 5**: AI / Technology Deep Research & Benchmark
> - **Stage 6**: Final Product Remake / Implementation
> - **Stage 7**: Production & Real-User Validation
> - **Stage 8**: A$\to$Z Final Audit & Launch

### 4.2 Lifecycle Profiles Are Transaction-Specific
The controlling Stage and transaction authority defines the actual lifecycle. Protocol V2 does **NOT** force every class of work into an artificial implementation lifecycle.

1. **Standard Implementation Lifecycle (4/2 Floor)**:
   The 4-transaction normal floor (unauthorized Wave) and 2-transaction remaining floor (already-authorized Wave) apply specifically to the standard **`AUTHORIZATION -> IMPLEMENTATION`** package lifecycle.
2. **Non-Implementation Transaction Classes**:
   The protocol explicitly recognizes distinct transaction classes that may use different, authority-defined lifecycle profiles:
   - `RESEARCH / DISCOVERY`
   - `SPECIFICATION / STRATEGY`
   - `BENCHMARK / TECHNOLOGY EVALUATION`
   - `INCIDENT TRIAGE`
   - `PRODUCTION / REAL-USER VALIDATION`
   - `INDEPENDENT FINAL AUDIT / RELEASE`
   
   These transaction classes must NOT weaken applicable universal invariants (single-writer discipline, closed allowlists, role separation, fail-closed stop conditions) merely because their lifecycle differs from implementation.

### 4.3 Illustrative Lifecycle Profiles (Non-Authoritative)
The following workflows illustrate typical lifecycle profiles across transaction classes. They are marked `ILLUSTRATIVE_ONLY / NOT_AUTHORITY` and do not themselves grant authority:

```mermaid
flowchart TD
    subgraph Impl4 [Standard Unauthorized Implementation Wave - 4 Transactions Normal Floor]
        T1[T1: AUTHORIZATION_IMPLEMENTER<br/>Author Manifest Candidate] --> T2[T2: INDEPENDENT_AUTHORIZATION_AUDITOR<br/>Audit + Pre-authorized Merge]
        T2 --> T3[T3: IMPLEMENTATION_EXECUTOR<br/>Commit A RED -> Commit B GREEN -> PR -> CI]
        T3 --> T4[T4: INDEPENDENT_IMPLEMENTATION_AUDITOR<br/>Audit + Pre-authorized Merge + Post-Merge CI]
    end

    subgraph Impl2 [Already-Authorized Implementation Wave e.g. W0 - 2 Transactions Remaining Floor]
        TB1[T1: IMPLEMENTATION_EXECUTOR<br/>Commit A RED -> Commit B GREEN -> PR -> CI] --> TB2[T2: INDEPENDENT_IMPLEMENTATION_AUDITOR<br/>Audit + Pre-authorized Merge + Post-Merge CI]
    end

    subgraph Research [Research / Discovery Lifecycle - Illustrative]
        R1[Research Authorization / Scope] --> R2[Independent Research Execution]
        R2 --> R3[Independent Reconciliation / Owner Decision]
    end

    subgraph Benchmark [Benchmark / Evaluation Lifecycle - Illustrative]
        B1[Benchmark Authority] --> B2[Benchmark Executor]
        B2 --> B3[Independent Benchmark Reconciliation]
    end

    subgraph FinalAudit [Independent Final Audit / Release - Illustrative]
        A1[Independent Final Auditor] --> A2[Pre-Authorized Deterministic Release Action if Granted]
    end
```

---

## 5. No Artificial Handoff Rule & Post-Merge Write Boundary

### 5.1 Autonomous Mechanical Operations
The following mechanical operations MUST be executed autonomously within the active owning transaction without pausing for user prompts:
- Waiting for remote GitHub Actions CI completion / polling CI status;
- Reading CI logs and failure diagnostics;
- Downloading and inspecting CI verification artifacts;
- Verifying artifact hashes, digests, and commit bindings;
- Read-back of persisted evidence or verdicts;
- Marking Draft PR as Ready for Review after independent `ACCEPT` (when explicitly authorized);
- Executing exact-head merge after independent `ACCEPT` (when explicitly authorized);
- Polling and verifying natural post-merge CI on `main`;
- Persisting deterministic transaction closure reports.

### 5.2 Post-Merge Repository Write Boundary
No repository-file mutation after merge is implicitly authorized merely because the auditor transaction owns closure. After verified merge and post-merge CI, persisted PR verdicts, merge records, CI evidence, and transaction final reports establish deterministic closure without modifying repository files on `main`.

A post-merge repository status/docs write is allowed **ONLY IF**:
1. Controlling authority explicitly grants that exact path and write;
2. Git topology for that write is explicitly frozen; and
3. Required CI/evidence semantics for the resulting new head are defined.

Otherwise, do **NOT** create a status-only commit.

---

## 6. Prompt Template Architecture

Future transaction prompts use concise, role-specific templates that supply transaction-specific parameters while referencing centralized Protocol V2 invariants and mandatory `AGENTS.md` rules.

> [!IMPORTANT]
> **Templates Supply Structure Only, Zero Authority**: Protocol V2 templates do not create, infer, or expand write scope, dependency authority, merge authority, or verification requirements. All permissions, allowlists, and execution parameters must be explicitly granted by controlling transaction authority and fresh-resolved from canonical repository state.

### 6.1 Template 1: AUTHORIZATION_IMPLEMENTER
```markdown
ROLE: AUTHORIZATION_IMPLEMENTER
TRANSACTION_ID: <TRANSACTION_ID>
SUBJECT: <WAVE_OR_PACKAGE_NAME> Authorization Manifest
EXPECTED_CANONICAL_PREDECESSOR: <EXACT_GIT_SHA>
CONTROLLING_AUTHORITIES:
- docs/MASTER_ROADMAP.md
- docs/ROADMAP.md
- AGENTS.md
- <STRATEGY_DOC_OR_PRIOR_ADR>
- docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md (ADR-051)
SCOPE: Author Wave Authorization Manifest for <SUBJECT>
EXACT_WRITE_ALLOWLIST:
<EXACT_PATHS_EXPLICITLY_GRANTED_BY_CONTROLLING_TRANSACTION>
OPTIONAL_GOVERNANCE_UPDATES:
<ONLY_IF_EXPLICITLY_GRANTED_BY_CONTROLLING_TRANSACTION>
SPECIAL_INVARIANTS: AGENTS.md and Protocol V2 Centralized Invariants apply in full. Docs-only; no src/** or test/** modifications.
FINAL_STATE: Branch pushed, Draft PR opened, natural CI verified on candidate head SHA.
```

### 6.2 Template 2: INDEPENDENT_AUTHORIZATION_AUDITOR
```markdown
ROLE: INDEPENDENT_AUTHORIZATION_AUDITOR
TRANSACTION_ID: <TRANSACTION_ID>
SUBJECT: <WAVE_OR_PACKAGE_NAME> Authorization Audit
CANDIDATE_PR: <PR_NUMBER>
EXPECTED_CANDIDATE_HEAD: <EXACT_GIT_SHA>
EXPECTED_CANONICAL_BASE: <EXACT_GIT_SHA>
CONTROLLING_AUTHORITIES:
- docs/MASTER_ROADMAP.md
- docs/ROADMAP.md
- AGENTS.md
- docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md (ADR-051)
- <RELEVANT_STRATEGY_AND_GOVERNANCE_DOCS>
AUDIT_SCOPE: Independent verification of manifest scope, allowlists, RED/GREEN contracts, migration rules, and CI evidence.
MERGE_AUTHORITY: <EXPLICITLY_GRANTED | NOT_GRANTED>
POST_ACCEPT_ACTIONS: <ONLY_ACTIONS_EXPLICITLY_GRANTED_BY_CONTROLLING_TRANSACTION>
FINAL_STATE: Verdict persisted + read back. If MERGE_AUTHORITY is EXPLICITLY_GRANTED, exact-head merge and post-merge CI verified SUCCESS.
```

### 6.3 Template 3: IMPLEMENTATION_EXECUTOR
```markdown
ROLE: IMPLEMENTATION_EXECUTOR
TRANSACTION_ID: <TRANSACTION_ID>
SUBJECT: <WAVE_OR_PACKAGE_NAME> Implementation
EXPECTED_CANONICAL_PREDECESSOR: <EXACT_GIT_SHA>
CONTROLLING_AUTHORIZATION: docs/authorizations/<ACCEPTED_MANIFEST_FILE>.md
CONTROLLING_AUTHORITIES:
- docs/MASTER_ROADMAP.md
- docs/ROADMAP.md
- AGENTS.md
- docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md (ADR-051)
EXACT_WRITE_ALLOWLIST: <EXACT_ALLOWLIST_FROM_CONTROLLING_AUTHORIZATION>
VERIFICATION:
<EXACT_COMMANDS_AND_GATES_FROM_CONTROLLING_AUTHORIZATION_AND_CURRENT_CANONICAL_REPO>
EXECUTION_SEQUENCE:
1. Materialize Commit A (RED) exercising specified contracts test-first.
2. Materialize minimal Commit B (GREEN) satisfying RED tests.
3. Run required local verification gates.
4. Push branch, open Draft PR, await natural remote CI completion.
FINAL_STATE: Candidate pushed, Draft PR created, natural CI verified SUCCESS on candidate head SHA.
```

### 6.4 Template 4: INDEPENDENT_IMPLEMENTATION_AUDITOR
```markdown
ROLE: INDEPENDENT_IMPLEMENTATION_AUDITOR
TRANSACTION_ID: <TRANSACTION_ID>
SUBJECT: <WAVE_OR_PACKAGE_NAME> Implementation Audit
CANDIDATE_PR: <PR_NUMBER>
EXPECTED_CANDIDATE_HEAD: <EXACT_GIT_SHA>
EXPECTED_CANONICAL_BASE: <EXACT_GIT_SHA>
CONTROLLING_AUTHORIZATION: docs/authorizations/<ACCEPTED_MANIFEST_FILE>.md
CONTROLLING_AUTHORITIES:
- docs/MASTER_ROADMAP.md
- docs/ROADMAP.md
- AGENTS.md
- docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md (ADR-051)
AUDIT_SCOPE: Fresh independent audit of diffs, RED/GREEN commit pair, allowlist compliance, zero assertion weakening, CI logs, and artifact provenance.
MERGE_AUTHORITY: <EXPLICITLY_GRANTED | NOT_GRANTED>
POST_ACCEPT_ACTIONS: <ONLY_ACTIONS_EXPLICITLY_GRANTED_BY_CONTROLLING_TRANSACTION>
FINAL_STATE: Verdict persisted + read back. If MERGE_AUTHORITY is EXPLICITLY_GRANTED, exact-head merge and post-merge CI verified SUCCESS.
```

### 6.5 Generic Transaction Prompt Contract (Non-Implementation Classes)
For transaction classes outside the standard Authorization $\to$ Implementation lifecycle (e.g. Research, Strategy, Benchmarking, Triage, Final Audit), transaction prompts freeze parameters using the following lightweight contract without multiplying boilerplate:

```markdown
ROLE: <ROLE_NAME>
TRANSACTION_ID: <TRANSACTION_ID>
SUBJECT: <TRANSACTION_SUBJECT>
EXPECTED_CANONICAL_PREDECESSOR: <EXACT_GIT_SHA_OR_NA_IF_READ_ONLY>
CONTROLLING_AUTHORITIES:
- docs/MASTER_ROADMAP.md
- AGENTS.md
- docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md (ADR-051)
- <CONTROLLING_STRATEGY_OR_ADR>
AUTHORITY: <EXACT_ROLE_AUTHORITY_BOUNDARIES>
SCOPE: <EXACT_BOUNDED_TRANSACTION_SCOPE>
WRITE_ALLOWLIST_IF_ANY: <EXACT_PATHS_OR_NONE_IF_READ_ONLY>
EVIDENCE_REQUIREMENTS: <EXACT_EVIDENCE_SPECIFICATION>
INDEPENDENCE_REQUIREMENTS: <ROLE_SEPARATION_AND_VERDICT_RULES>
STOP_CONDITIONS: <EXPLICIT_FAIL_CLOSED_STOP_CONDITIONS>
POST_VERDICT_AUTHORITY_IF_ANY: <EXPLICIT_PLATFORM_ACTIONS_OR_NONE>
FINAL_STATE: <EXPECTED_TERMINAL_STATE>
```

---

## 7. Prompt Efficiency Metric

- **Design Objective / Target**: Achieve an estimated **40–60% reduction** in repeated boilerplate prompt text across execution cycles.
- **Lossless Parameter Preservation**: All transaction-specific variables (commit SHAs, exact file paths, test commands, role specifications) remain 100% explicit and uncompressed.

---

## 8. Multi-Package & Multi-Wave Bounded Execution

1. **Single vs Multi-Record Manifests**:
   - A single Wave Authorization Manifest may contain multiple executable package records (as authorized under ADR-046) **ONLY IF** each package's predecessor, dependency order, allowlist, RED/GREEN predicates, and stop conditions are completely frozen without requiring future discretionary choices.
2. **Inter-Wave Dependencies & Stage 2 Canonical DAG**:
   - Dependent Waves cannot be bundled into a single authorization if downstream wave architecture depends on runtime findings or empirical design of an upstream wave.
   - Protocol V2 preserves the exact Stage 2 IELTS Completeness dependency DAG defined in `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md` §10:
     * **W0 (Architecture & Track Routing)**: Root prerequisite for all downstream Waves.
     * **W1 (Objective Kernel)**: Depends on W0.
     * **W2 (Listening)**: Depends on W0 + W1.
     * **W3 (Reading)**: Depends on W0 + W1.
     * **W4 (Writing)**: Depends on W0.
     * **W5 (Speaking)**: Depends on W0.
     * **W6 (Full Mock & Exit Gate)**: Depends on W0 + W1 + W2 + W3 + W4 + W5.
   - Protocol V2 does **NOT** impose an artificial linear sequence on Stage 2.
   - Under single-writer discipline, execution occurs in a valid topological order compatible with the accepted dependency DAG and file ownership constraints. Logical independence / parallelizability (e.g. W4/W5 relative to W1/W2/W3) does not authorize concurrent repository writers.
   - Protocol V2 does not alter Stage 2 strategy and does not authorize W1–W6 implementation.

---

## 9. Recovery Model

1. **No Speculative Recovery Prompts**: Standard workflows contain only happy-path transaction templates. Speculative recovery prompts are not authored in advance.
2. **Evidence-Based Remediation**:
   - When an audit yields `REJECT`: A dedicated, bounded remediation transaction is created based on the auditor's specific findings.
   - When execution is `BLOCKED`: A dedicated blocker-resolution transaction is authorized.
   - When an ambiguous CI incident occurs: An independent triage transaction assesses whether the defect is candidate-introduced or pre-existing substrate.
   - When candidate history is invalid: Clean rematerialization from current canonical base is executed.

---

## 10. Wave W0 Grandfathering & Backward Compatibility

> [!IMPORTANT]
> The Wave Authorization Manifest **`STAGE2-W0-IELTS-ARCH-AUTH-001`** was authored, audited, and independently accepted under Protocol V1 (ADR-046 / PR #88 / commit `ee7d1b72c46a5e3e8e1411256ac4bd62360bbc54`).
>
> It remains **100% VALID, CANONICAL, AND UNMODIFIED**.

1. Protocol V2 does **NOT** retroactively invalidate, modify, or reopen `STAGE2-W0-IELTS-ARCH-AUTH-001`.
2. For all product, domain, schema, allowlist, RED/GREEN, and migration contracts of Wave W0, **`STAGE2-W0-IELTS-ARCH-AUTH-001` is the controlling semantic authority**.
3. Protocol V2 governs only transaction prompting efficiency (minimum normal happy-path floor: exactly 2 transactions remaining for W0). Legitimate non-happy-path incidents (e.g. `REJECT`, `BLOCKED`, CI failure) legitimately introduce bounded recovery transactions.
4. In any conflict between Protocol V2 generic guidelines and the accepted W0 manifest, **the accepted W0 manifest controls for W0**.

---

## 11. Protocol Self-Test Matrix

The protocol validates its design against the following comprehensive test matrix:

| Test ID | Scenario | Expected Protocol Behavior | Pass / Fail Rule |
|---|---|---|---|
| **TEST-A** | New unauthorized Wave (e.g. Wave W1) | Normal happy path executes via 4-transaction floor: T1 (Auth Impl) $\to$ T2 (Auth Audit) $\to$ T3 (Impl Exec) $\to$ T4 (Impl Audit). | PASS: Exactly 4 transactions on normal happy path; zero self-acceptance. |
| **TEST-B** | Wave with existing canonical authorization (Wave W0) | Normal happy path executes via remaining 2-transaction floor: T1 (Impl Exec) $\to$ T2 (Impl Audit). | PASS: Exactly 2 transactions on normal happy path to reach W0 COMPLETE. |
| **TEST-C** | Implementation Audit yields `REJECT` verdict | Execution halts; Auditor logs exact findings; bounded remediation transaction resolves specific defect; fresh audit follows. | PASS: Does not restart entire lifecycle from scratch. |
| **TEST-D** | Remote PR CI is still in progress | Transaction waits / polls CI autonomously within active session; does not emit artificial handoff to user. | PASS: Single transaction handles CI polling and artifact inspection. |
| **TEST-E** | Post-ACCEPT merge is explicitly pre-authorized | Auditor records `ACCEPT` verdict, reads back, marks PR ready, merges PR, and verifies post-merge CI in same transaction. | PASS: Merge executed only when `MERGE_AUTHORITY` is `EXPLICITLY_GRANTED`. |
| **TEST-F** | Architecture choice or allowlist is unfrozen/ambiguous | Executor encounters `AUTHORITY_EXPANSION` or `ARCHITECTURE_GAP` and halts immediately. Discretionary choice forbidden. | PASS: Fails closed; prompts user for governance/ADR decision. |
| **TEST-G** | Future dependent Wave lacks exact predecessor | Authorization for dependent wave cannot be created without exact predecessor SHA. | PASS: Fails closed; no speculative batching. |
| **TEST-H** | Exact-head CI incident unrelated to candidate content | Independent triage assesses substrate defect before any product remediation; halts if base is broken. | PASS: Fails closed; no blind retries or skips. |
| **TEST-I** | Historical candidate has invalid provenance/history | Clean rematerialization from current canonical base is executed; no force-pushes or history re-writing. | PASS: Historical PR remains frozen; new clean PR opened. |
| **TEST-J** | Non-implementation transaction (Research / Benchmark / Audit) | Follows transaction-specific lifecycle without forced RED/GREEN or invented CI; preserves universal authority invariants. | PASS: Fails closed on authority gaps; executes valid profile. |

---

## 12. Quality Preservation Reconciliation Table

| Quality / Safety Invariant | Source Authority | Location in Protocol V2 | Reconciliation Classification |
|---|---|---|---|
| **Repository-Wide Scope (Stages 2–8)** | `docs/MASTER_ROADMAP.md` | Protocol V2 §4.1 (Applicability) | **CLARIFIED** (Universal applicability; non-implementation classes recognized) |
| **Exact Predecessor Binding** | `AGENTS.md` / ADR-046 | Protocol V2 §3.2 (Git Invariants) | **PRESERVED** |
| **One-Writer Discipline** | `AGENTS.md` / ADR-046 | Protocol V2 §3.2 (Git Invariants) | **PRESERVED** (Universal across all repository mutations) |
| **Auditor Mutation Boundary** | `AGENTS.md` / ADR-046 | Protocol V2 §3.2 (Git Invariants) | **STRENGTHENED** (Read-only for candidate code/files; non-implementation actions explicitly bound) |
| **Closed Write Allowlists** | `AGENTS.md` / ADR-046 | Protocol V2 §3.3 (Scope Invariants) | **PRESERVED** |
| **Test-First Commit A (RED)** | `AGENTS.md` / ADR-046 | Protocol V2 §3.4 (RED $\to$ GREEN Invariants) | **PRESERVED** (When required by implementation authority) |
| **Natural Product-Defect RED**| `AGENTS.md` / ADR-046 | Protocol V2 §3.4 (RED $\to$ GREEN Invariants) | **PRESERVED** |
| **RED Test Immutability** | `AGENTS.md` / ADR-046 | Protocol V2 §3.4 (RED $\to$ GREEN Invariants) | **PRESERVED** |
| **Minimal Commit B (GREEN)** | `AGENTS.md` / ADR-046 | Protocol V2 §3.4 (RED $\to$ GREEN Invariants) | **PRESERVED** |
| **Zero Assertion Weakening** | `AGENTS.md` / ADR-046 | Protocol V2 §3.4 (RED $\to$ GREEN Invariants) | **PRESERVED** |
| **Natural Exact-Head CI** | `AGENTS.md` / ADR-046 | Protocol V2 §3.5 (CI Invariants) | **PRESERVED** (When mutations/workflow require) |
| **Dynamic Verification Artifacts** | ADR-046 / CI Workflow | Protocol V2 §3.5 (CI Invariants) | **PROCEDURALLY REFACTORED** (No hard-coded count) |
| **Evidence Gateway Integrity** | `AGENTS.md` / ADR-004 | Protocol V2 §3.6 (Evidence Invariants) | **PRESERVED** |
| **Backup 100% Store Sentinel**| `AGENTS.md` / ADR-031 | Protocol V2 §3.7 (Data Invariants) | **PRESERVED** |
| **Journaled Restore Safety** | `AGENTS.md` / ADR-032 | Protocol V2 §3.7 (Data Invariants) | **PRESERVED** |
| **Additive, Idempotent, Forward-Only Migrations** | `AGENTS.md` / ADR-008 | Protocol V2 §3.7 (Data Invariants) | **PRESERVED** |
| **Independent Acceptance & Verdict Taxonomy** | `AGENTS.md` / ADR-046 | Protocol V2 §3.8, §4 (Independence Floor) | **STRENGTHENED** (`ACCEPT`, `REJECT`, `BLOCKED` formally defined) |
| **Zero Implementer Self-Accept** | `AGENTS.md` / ADR-046 | Protocol V2 §3.8, §4 (Independence Floor) | **PRESERVED** |
| **Pre-Authorized Merge Safety**| ADR-046 | Protocol V2 §3.9 (Merge Invariants) | **STRENGTHENED** (Explicit merge authority field; never template-inferred) |
| **Fail-Closed Stop Conditions** | `AGENTS.md` / ADR-046 | Protocol V2 §3.10 (Stop Conditions) | **PRESERVED** |
| **Prompt Text Efficiency** | *New in V2* | Protocol V2 §6, §7 (Templates & Metrics) | **STRENGTHENED** (40–60% target reduction) |
| **Autonomous Mechanical Gates**| *New in V2* | Protocol V2 §1.1, §5 (No Artificial Handoffs) | **STRENGTHENED** (Latency & friction minimized) |

---

## 13. Non-Goals

To maintain strict governance boundaries, the following are explicitly declared as **NON-GOALS**:
1. **Zero Product Source Changes**: No edits to application code in `src/**`.
2. **Zero Authorization of Future Stages**: No authorization of Stage 3, 4, 5, 6, 7, or 8 work.
3. **Zero Runtime Automation Engines**: No daemons, background schedulers, DAG engines, auto-retry services, or automatic acceptance bots.
4. **Zero CI Workflow Modifications**: No modifications to `.github/workflows/**`.
5. **Zero Dependency Changes**: No additions or modifications to `package.json` dependencies.

---

## 14. Activation Gate & Rollback Contract

### 14.1 Deterministic Activation Gate
Protocol V2 candidate transitions from `CANDIDATE` to `PROTOCOL_V2_ACTIVE` when all three external canonical evidence gates are satisfied:
1. **Independent Protocol Audit**: Exact-head audit of candidate PR yields a formal `ACCEPT` verdict, which is persisted to the pull request and fresh read back before any merge.
2. **Exact-Head Merge**: Candidate PR is merged into canonical `main` at the exact accepted candidate head SHA.
3. **Natural Post-Merge CI**: Push CI completes with `SUCCESS` on canonical `main`.

No follow-up administrative or status-only commit is required to activate the protocol once these gates are satisfied.

### 14.2 Rollback Contract
If Protocol V2 is rolled back:
1. Revert the governance commit on `main`.
2. Repository prompting and handoff conventions immediately return to Protocol V1 (`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`).
3. Historical manifests and accepted implementation work remain 100% valid and unaffected.
