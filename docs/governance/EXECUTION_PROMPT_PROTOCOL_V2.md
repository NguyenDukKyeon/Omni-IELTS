# VocabMaster Execution Prompt Protocol V2 (Minimum-Handoff Governance)

Protocol Identity: **EXECUTION_PROMPT_PROTOCOL_V2**  
Governing Decision: **ADR-051** (`docs/DECISIONS.md`)  
Authority Level: **Level 6 — Repository Execution & Prompting Rules** (subordinate to `AGENTS.md`, `docs/MASTER_ROADMAP.md`, `docs/DECISIONS.md`)  
Date: **2026-08-15**  
Status: **CANDIDATE / NOT_ACTIVE** (Pending Independent Audit, Merge, and Post-Merge CI)  
Canonical Base / Predecessor: **`ee7d1b72c46a5e3e8e1411256ac4bd62360bbc54`** (Merge PR #88 / `STAGE2-W0-IELTS-ARCH-AUTH-001`)  

---

## 1. Executive Summary & Governance Mission

### 1.1 Purpose
The purpose of **Execution Prompt Protocol V2** (`EXECUTION_PROMPT_PROTOCOL_V2`) is to establish a repository-level execution prompting standard that **minimizes user handoffs and prompt duplication** across all development Waves, while **100% preserving** the repository's strict quality, verification, and authority invariants.

### 1.2 The Core Problem in Protocol V1
Under Protocol V1 (`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` / ADR-046), execution prompting frequently required:
1. **Redundant Governance Boilerplate**: Every transaction prompt repeated extensive generic repository rules (e.g. 50+ lines of Git invariants, EvidencePolicy details, Backup schema definitions, and stop conditions), leading to prompt bloat (often 4,000–8,000 characters of duplicated text).
2. **Artificial User Handoffs**: Transitions that were already deterministically bound by an accepted authorization manifest (e.g., waiting for natural CI, reading CI artifacts, persisting already-authorized evidence, marking a Draft PR ready, executing a pre-authorized exact-head merge after independent `ACCEPT`, and verifying post-merge CI) were treated as separate prompt interactions, inflating user friction and latency.

### 1.3 Governance Scope & Non-Authority
> [!IMPORTANT]
> - Protocol V2 is a **GOVERNANCE AND WORKFLOW REFACTOR ONLY**.
> - It does **NOT** authorize product implementation for any Wave.
> - It does **NOT** modify or expand product scope for Stage 2 (or any other Stage).
> - It does **NOT** weaken independent audits or technical verification gates.
> - It does **NOT** create runtime daemons, DAG engines, schedulers, bots, automated merge webhooks, or new CI workflows.
> - It does **NOT** retroactively invalidate or reinterpret historical accepted manifests, verdicts, or evidence.
> - The accepted W0 Authorization Manifest (`STAGE2-W0-IELTS-ARCH-AUTH-001`) remains **VALID, CANONICAL, AND CONTROLLING** for Wave W0.

---

## 2. Core Design Principle: Quality Gates $\ne$ User Prompts

$$\mathbf{QUALITY\_GATE\_COUNT \ne USER\_PROMPT\_COUNT}$$

1. **Autonomous Execution of Pre-Authorized Transitions**: A technical quality gate or mechanical transition may execute within a single bounded user transaction without requiring a fresh user prompt when:
   - Authority for that transition was already frozen and independently accepted in the controlling Wave Authorization Manifest;
   - No new discretionary decision or out-of-scope remediation is required;
   - Exact evidence is freshly verifiable from the local repository and GitHub CI;
   - All stop conditions remain deterministic and fail-closed.
2. **Strict Authority Boundaries**: Minimizing user prompts does **not** merge the role of *Implementer/Executor* with *Independent Auditor*. Authority separation remains absolute.

---

## 3. Centralized Canonical Invariants

To eliminate prompt duplication, Protocol V2 centralizes all generic repository invariants. Future transaction prompts reference this section by canonical identity rather than repeating generic text.

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          CANONICAL INVARIANT PILLARS                             │
├──────────────────┬──────────────────┬──────────────────┬─────────────────────────┤
│ 1. AUTHORITY     │ 2. GIT & REPO    │ 3. WRITE SCOPE   │ 4. TEST-FIRST (RED/GRN) │
│ • Strict hierarchy│ • Exact SHA base │ • Closed allowlist│ • Test-only Commit A    │
│ • No self-accept │ • One-writer rule│ • No drift/creep │ • Immutable RED tests   │
│ • Role isolation │ • No history rewrite│ • Dep change gated│ • Minimal Commit B GREEN│
├──────────────────┼──────────────────┼──────────────────┼─────────────────────────┤
│ 5. NATURAL CI    │ 6. EVIDENCE      │ 7. DATA SAFETY   │ 8. AUDIT & MERGE        │
│ • PR head CI     │ • Raw over summary│ • Forward IDB   │ • Fresh independent     │
│ • Zero dispatch  │ • Digest provenance│ • Backup sentinel│ • Exact-head verdict   │
│ • 7 core artifacts│ • SHA-256 bindings│ • Journal restore│ • Pre-authorized merge  │
└──────────────────┴──────────────────┴──────────────────┴─────────────────────────┘
```

### 3.1 Authority Invariants
1. **Hierarchy**: `MASTER_ROADMAP.md` (Level 1) $\to$ Strategy / `ROADMAP.md` (Level 2) $\to$ Wave Authorization Manifest (Level 3) $\to$ Execution / Commits (Level 4) $\to$ Independent Audit & Acceptance (Level 5) $\to$ Repository Rules (`AGENTS.md`, Level 6).
2. **Separation**: Research, Specification, Authorization, Implementation, Evidence, and Acceptance are distinct lifecycle states. No authority may be inferred from roadmap placement, PR existence, or branch presence.
3. **No Self-Acceptance**: An implementer or executor cannot audit, accept, or merge its own work. Independent audit by a dedicated auditor role is mandatory.

### 3.2 Git & Topology Invariants
1. **Exact Predecessor Binding**: Every transaction must bind to an exact canonical base commit SHA. If HEAD differs, the transaction must halt immediately (`CANONICAL_BASE_DRIFT`).
2. **One-Writer Discipline**: Exactly one agent writes files/commits at a time. Subagents are strictly read-only.
3. **No History Rewrites**: Zero `git commit --amend`, `rebase`, squash, or force-push operations. All commits are single substantive units with clear provenance.
4. **Clean Hygiene**: No commits of secrets, user browser profiles, test debug logs, temporary markers, or unmanaged build artifacts.

### 3.3 Scope & Allowlist Invariants
1. **Closed File Sets**: All modifications must strictly adhere to the `SOURCE_ALLOWLIST`, `TEST_ALLOWLIST`, `FIXTURE_ALLOWLIST`, and `DOC_EVIDENCE_ALLOWLIST` frozen in the accepted authorization manifest.
2. **No Scope Expansion**: Writing to any file outside the authorized allowlists constitutes an immediate protocol violation.
3. **Dependency Lock**: Zero new npm runtime or dev dependencies unless explicitly authorized by an accepted manifest.

### 3.4 Test-First & RED $\to$ GREEN Invariants
1. **Test-First Commit A (RED)**: Commit A introduces only failing test files in `tests/**` (and deterministic synthetic fixtures). Zero `src/**` edits are permitted in Commit A.
2. **Product-Defect Verification**: RED tests must fail naturally due to missing product behavior or schemas, not due to syntax errors, import failures, or broken harness setups.
3. **RED Immutability**: Once Commit A is established and verified, the test files are strictly immutable for Commit B. Assertions, expected values, or test counts cannot be modified or weakened.
4. **Minimal GREEN Commit B**: Commit B implements only the minimal source code in `src/**` required to make all RED tests pass.
5. **No Assertion Weakening**: No deleting tests, skipping suites, adding quarantine markers, or altering assertion strictness to force green results.

### 3.5 Natural Exact-Head CI Invariants
1. **PR Head Binding**: CI must run naturally on the exact pull request head commit.
2. **No Artificial Triggers**: Zero `workflow_dispatch`, manual reruns, draft toggles, empty commits, or close/reopen tricks to fake or trigger CI.
3. **Artifact Provenance**: Verification must produce and verify the repository's standard verification artifacts (`test-output.txt`, `check-output.txt`, `roadmap-output.txt`, `ielts-audit-output.txt`, `v10-test-output.txt`, `v10-audit-output.txt`, `yt-dlp-version.txt`).

### 3.6 Evidence & Provenance Invariants
1. **Raw Evidence**: Independent acceptance relies on raw command outputs, commit SHAs, test numbers, and canonical digests—not on implementer self-reports or narrative summaries.
2. **Digest Verification**: Content packages, blueprints, and build outputs must bind deterministic SHA-256 digests.
3. **Implementer Evidence $\ne$ Independent Acceptance**: An implementer recording its own test output does not constitute acceptance. Acceptance exists only when an Independent Auditor logs a formal verdict.

### 3.7 Data Safety, Storage, Backup & Restore Invariants
1. **Storage Classification**: Durable (learner data, blueprints, runs, attempts, errors, journals, outbox), Reconstructable Cache (pack media, models), and Ephemeral (UI handles, temporary state) are strictly distinct. Ephemeral state never claims durable persistence.
2. **Forward-Only Schema Evolution**: IndexedDB versions only increment. Downgrades are forbidden. Migrations are additive and forward-compatible.
3. **Backup Sentinel (100% Coverage)**: Full backup schema (schema v2/v6) must maintain 100% store coverage across all durable stores. Missing stores fail export.
4. **Journaled Restore**: Restore operations follow stage $\to$ validate $\to$ journal $\to$ commit $\to$ reopen $\to$ canonical verify. Rollback retains durable source integrity.
5. **No RAM-Only Masquerade**: If IndexedDB fails or is blocked, RAM fallbacks must never report durable save success.

### 3.8 Independent Audit & Verdict Invariants
1. **Fresh Independent Review**: Auditor must perform a fresh checkout of the exact PR head, inspect the full diff, execute verification suites locally, and verify remote CI run ID and artifacts.
2. **Exact-Head Verdict**: Verdict is strictly one of `ACCEPT`, `REJECT`, or `BLOCKED`, bound to the exact commit SHA.
3. **Green CI $\ne$ ACCEPT**: A green CI status is a necessary condition, not a sufficient condition. Substantive technical, architectural, and security review is mandatory.

### 3.9 Pre-Authorized Conditional Merge Invariants
1. **Pre-Authorization Requirement**: Merge operations may only occur if explicitly pre-authorized in the controlling authorization manifest or governing ADR.
2. **Post-Verdict Sequencing**: Merge is performed **only after** the independent `ACCEPT` verdict is formally committed/persisted and read back.
3. **Unchanged Head & Clean Base**: Merge is aborted if the audited PR head has drifted or if canonical `main` has advanced unexpectedly.

### 3.10 Fail-Closed Stop Conditions
If any invariant is violated, or if an ambiguity arises regarding predecessor, scope, allowlist, RED predicates, migration, or authority, execution must **HALT IMMEDIATELY** with a typed stop code.

---

## 4. Minimum-Handoff Execution Model

Protocol V2 defines the minimum-handoff execution sequence across two canonical operational cases.

```text
═══════════════════════════════════════════════════════════════════════════════════
CASE A: WAVE HAS NO ACCEPTED AUTHORIZATION YET (MINIMUM FLOOR = 4 TRANSACTIONS)
═══════════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│ T1: AUTHORIZATION IMPLEMENTER (1 User Prompt)                                   │
│ • Fresh canonical read & scope reconciliation                                   │
│ • Materialize Wave Authorization Manifest in docs/authorizations/               │
│ • Freeze allowlists, RED/GREEN specs, migration/rollback, evidence reqs         │
│ • Push branch & create Draft Authorization PR                                   │
│ • Await natural PR CI & record provenance                                       │
│ • Output: READY_FOR_INDEPENDENT_AUTHORIZATION_AUDIT                             │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ T2: INDEPENDENT AUTHORIZATION AUDITOR (1 User Prompt)                           │
│ • Fresh independent audit of manifest vs Roadmap, Strategy, & Governance        │
│ • Verify PR head, allowlists, RED predicates, and natural CI                    │
│ • Persist & read back verdict (ACCEPT / REJECT / BLOCKED)                       │
│ • If ACCEPT & pre-authorized: mark PR Ready, merge to main, verify post-merge CI│
│ • Output: AUTHORIZATION_ACCEPTED_AND_CANONICAL (or REJECTED/BLOCKED)            │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ T3: IMPLEMENTATION EXECUTOR (1 User Prompt)                                     │
│ • Checkout fresh canonical base from merged authorization                       │
│ • Create implementation branch                                                  │
│ • Commit A: RED tests only (verify expected failure predicates)                 │
│ • Freeze RED tests (immutability rule)                                          │
│ • Commit B: Minimal GREEN source implementation                                 │
│ • Verify local test suite (npm test, check, audits, backup, restore)            │
│ • Push branch & create Implementation PR                                        │
│ • Await natural PR CI, download & verify all 7 artifacts                        │
│ • Output: READY_FOR_INDEPENDENT_IMPLEMENTATION_AUDIT                            │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ T4: INDEPENDENT IMPLEMENTATION AUDITOR (1 User Prompt)                          │
│ • Fresh independent audit of implementation PR                                  │
│ • Verify exact commit history (Commit A RED vs Commit B GREEN)                  │
│ • Independently prove RED failure predicates and immutability                   │
│ • Independently verify 100% GREEN pass, allowlist adherence, migration/rollback │
│ • Verify exact-head CI run ID, attempt, and artifact digests                    │
│ • Persist & read back verdict (ACCEPT / REJECT / BLOCKED)                       │
│ • If ACCEPT & pre-authorized: mark PR Ready, merge to main, verify post-merge CI│
│ • Output: WAVE_IMPLEMENTATION_ACCEPTED_AND_CANONICAL                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```text
═══════════════════════════════════════════════════════════════════════════════════
CASE B: WAVE AUTHORIZATION IS ALREADY ACCEPTED (MINIMUM FLOOR = 2 TRANSACTIONS)
═══════════════════════════════════════════════════════════════════════════════════

When an independently accepted canonical authorization manifest already exists on main
(e.g., STAGE2-W0-IELTS-ARCH-AUTH-001 for Wave W0):

┌─────────────────────────────────────────────────────────────────────────────────┐
│ T1: IMPLEMENTATION EXECUTOR (1 User Prompt)                                     │
│ • Execute Commit A RED ──▶ Commit B GREEN ──▶ PR ──▶ Natural CI ──▶ Evidence   │
│ • Output: READY_FOR_INDEPENDENT_IMPLEMENTATION_AUDIT                            │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ T2: INDEPENDENT IMPLEMENTATION AUDITOR (1 User Prompt)                          │
│ • Fresh audit ──▶ Independent verification ──▶ Verdict ──▶ Pre-authorized Merge │
│ • Output: WAVE_IMPLEMENTATION_ACCEPTED_AND_CANONICAL                            │
└─────────────────────────────────────────────────────────────────────────────────┘

Total remaining prompts for W0: EXACTLY 2 USER PROMPTS.
```

---

## 5. No Artificial Handoff Rule & Trigger Taxonomy

### 5.1 No Artificial Handoff Rule
> [!NOTE]
> A new user prompt **MUST NOT** be required solely for mechanical, pre-authorized transitions that already belong inside the active transaction's scope.

Specifically, the following actions must be executed autonomously within the owning transaction:
1. Waiting for natural GitHub Actions CI to complete;
2. Polling CI status or downloading/verifying CI artifacts;
3. Persisting already-authorized execution evidence or status records;
4. Marking a Draft PR as "Ready for review" after independent `ACCEPT`;
5. Executing a conditional exact-head merge after independent `ACCEPT` (when explicitly pre-authorized);
6. Waiting for and verifying natural post-merge CI on `main`;
7. Read-back verification of persisted files;
8. Canonical Wave closure and status reporting.

### 5.2 New-Prompt Trigger Taxonomy
A new user prompt is legitimate and **MANDATORY** only when a genuine out-of-scope event or decision boundary occurs:

| Trigger Code | Condition Requiring New User Prompt | Resolution Workflow |
|---|---|---|
| `REJECT` | Independent Auditor issues a formal `REJECT` verdict. | User initiates a bounded remediation transaction with exact findings. |
| `BLOCKED` | Independent Auditor or Executor hits an environmental or tool blocker. | User resolves the external block or grants missing access/tooling. |
| `PRODUCT_DEFECT_OUT_OF_SCOPE` | A defect is identified in an unowned module outside the authorized allowlist. | User authorizes a separate bounded bugfix/remediation transaction. |
| `CI_INCIDENT` | Remote CI fails due to infrastructure/GitHub outage or unowned workflow defect. | User investigates CI incident or authorizes workflow remediation. |
| `ARCHITECTURE_AUTHORITY_GAP` | Implementation requires a architectural decision not frozen in strategy/manifest. | Lead Architect / Owner issues an ADR before work proceeds. |
| `DEPENDENCY_AUTHORITY_REQUIRED`| Implementation requires adding a new runtime or dev npm dependency. | Governance transaction approves dependency addition. |
| `CANONICAL_BASE_DRIFT` | Canonical `main` advanced unexpectedly, creating predecessor mismatch. | User runs a reconciliation/rebase transaction. |
| `RED_INVALID` | Proposed RED tests fail due to syntax/import errors rather than missing behavior. | User authorizes manifest/test correction transaction. |
| `SECURITY_FINDING` | Critical security defect or credential exposure detected outside current scope. | User initiates immediate bounded security response transaction. |

---

## 6. Independence Floor & Authority Boundaries

$$\mathbf{IMPLEMENTER \ne INDEPENDENT\_AUDITOR}$$

1. **Strict Role Isolation**:
   - An *Implementer* or *Executor* possesses write authority over code, tests, and evidence within allowlisted boundaries, but **ZERO authority to self-audit, self-accept, or self-merge**.
   - An *Independent Auditor* possesses read, verification, audit, verdict, and pre-authorized merge authority, but **ZERO authority to write implementation code or modify tests** before issuing a verdict.
2. **Minimum-Handoff Floor**:
   - For an unauthorized Wave: $\text{Floor} = \mathbf{4\text{ User Transactions}}$ ($\text{Auth Implementer} \to \text{Auth Auditor} \to \text{Impl Executor} \to \text{Impl Auditor}$).
   - For an already-authorized Wave: $\text{Floor} = \mathbf{2\text{ User Transactions}}$ ($\text{Impl Executor} \to \text{Impl Auditor}$).
   - No governance mechanism may compress an unauthorized Wave below 4 transactions or an authorized Wave below 2 transactions without violating the independent acceptance rule.

---

## 7. Canonical Prompt Template Architecture

To achieve 40–60% reduction in prompt text, all future transaction prompts must use these concise, standardized templates. Generic invariants are incorporated by reference to `EXECUTION_PROMPT_PROTOCOL_V2`.

### Template 1: AUTHORIZATION_IMPLEMENTER
```markdown
ROLE: AUTHORIZATION_IMPLEMENTER
TRANSACTION_ID: <STAGE>-<WAVE>-AUTH-<NNN>
TARGET_WAVE: <WAVE_ID> (<WAVE_NAME>)
PROTOCOL: EXECUTION_PROMPT_PROTOCOL_V2
EXPECTED_CANONICAL_PREDECESSOR: <EXACT_GIT_COMMIT_SHA>

CONTROLLING_AUTHORITIES:
- docs/MASTER_ROADMAP.md
- docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md (or relevant strategy)
- docs/DECISIONS.md
- AGENTS.md

TRANSACTION_SPECIFIC_SCOPE:
- In-Scope: <Specific capabilities to authorize>
- Out-of-Scope: <Explicit downstream wave exclusions>

AUTHORIZATION_TARGETS:
- Manifest File: docs/authorizations/<MANIFEST_FILENAME>.md
- Target Implementation Branch: exec/<wave-id-lowercase>
- Expected Allowlist: <Candidate source/test/fixture files>
- Expected RED Predicates: <Key failure assertions>
- Migration / Rollback Class: <Migration details>

SPECIAL RISKS / STOP CONDITIONS:
- <Wave-specific failure modes and stop codes>

FINAL_STATE:
- Branch: auth/<wave-id-lowercase>
- PR: Draft PR created
- Natural PR CI: Verified and recorded
- Status: READY_FOR_INDEPENDENT_AUTHORIZATION_AUDIT
```

### Template 2: INDEPENDENT_AUTHORIZATION_AUDITOR
```markdown
ROLE: INDEPENDENT_AUTHORIZATION_AUDITOR
TRANSACTION_ID: <STAGE>-<WAVE>-AUTH-AUDIT-<NNN>
TARGET_AUTH_PR: <PR_NUMBER>
PROTOCOL: EXECUTION_PROMPT_PROTOCOL_V2
EXPECTED_PR_HEAD: <EXACT_PR_HEAD_COMMIT_SHA>
EXPECTED_CANONICAL_BASE: <EXACT_BASE_COMMIT_SHA>

AUDIT_TARGET: docs/authorizations/<MANIFEST_FILENAME>.md

INDEPENDENT_VERIFICATION_CHECKLIST:
1. Authority & Scope Alignment (Roadmap, Strategy, DECISIONS)
2. Closed Allowlist Strictness & Non-Overlap
3. RED / GREEN Verification Topology Feasibility
4. Forward-Only Migration & Zero-Data-Loss Rollback Proof
5. Natural Exact-Head PR CI & Artifact Verification

CONDITIONAL_MERGE_AUTHORITY:
- Pre-authorized: YES (if verdict == ACCEPT)
- Merge Strategy: Squash or Merge Commit (as defined by repository rules)
- Post-Merge CI Verification: Mandatory on main

FINAL_STATE:
- Verdict: ACCEPT / REJECT / BLOCKED
- Outcome: AUTHORIZATION_ACCEPTED_AND_CANONICAL (if ACCEPT)
```

### Template 3: IMPLEMENTATION_EXECUTOR
```markdown
ROLE: IMPLEMENTATION_EXECUTOR
TRANSACTION_ID: <STAGE>-<WAVE>-EXEC-<NNN>
TARGET_WAVE: <WAVE_ID> (<WAVE_NAME>)
PROTOCOL: EXECUTION_PROMPT_PROTOCOL_V2
CONTROLLING_AUTHORIZATION: docs/authorizations/<MANIFEST_FILENAME>.md
EXPECTED_CANONICAL_PREDECESSOR: <EXACT_GIT_COMMIT_SHA>

EXECUTION_TOPOLOGY:
1. Baseline Verification on canonical predecessor
2. Commit A: RED Tests Only (tests/** and fixtures/** only; zero src/** edits)
   - Prove exact RED failure predicates locally
   - Freeze RED tests (Immutability rule)
3. Commit B: Minimal GREEN Implementation (src/** edits only)
   - Satisfy all RED predicates
   - Pass local verification suite: npm test, check, audits, backup, restore, build
4. Push branch `exec/<wave-id-lowercase>` and open Implementation Draft PR
5. Await Natural PR CI, verify run ID, attempt, and all 7 artifacts
6. Materialize implementer evidence report in PR / documentation

SPECIAL RISKS / STOP CONDITIONS:
- Halt on RED_TEST_MUTATION_REQUIRED, ALLOWLIST_OVERFLOW, or BASE_DRIFT

FINAL_STATE:
- PR: Implementation Draft PR opened
- Natural PR CI: Verified GREEN on exact PR head
- Status: READY_FOR_INDEPENDENT_IMPLEMENTATION_AUDIT
```

### Template 4: INDEPENDENT_IMPLEMENTATION_AUDITOR
```markdown
ROLE: INDEPENDENT_IMPLEMENTATION_AUDITOR
TRANSACTION_ID: <STAGE>-<WAVE>-IMPL-AUDIT-<NNN>
TARGET_IMPL_PR: <PR_NUMBER>
PROTOCOL: EXECUTION_PROMPT_PROTOCOL_V2
CONTROLLING_AUTHORIZATION: docs/authorizations/<MANIFEST_FILENAME>.md
EXPECTED_PR_HEAD: <EXACT_PR_HEAD_COMMIT_SHA>
EXPECTED_CANONICAL_BASE: <EXACT_BASE_COMMIT_SHA>

INDEPENDENT_AUDIT_CHECKLIST:
1. Exact Two-Commit History (Commit A RED vs Commit B GREEN)
2. Independent Proof of Commit A RED failure predicates on predecessor
3. Independent Proof of RED test immutability in Commit B
4. Allowlist Strictness & Zero Unauthorized File Edits
5. Full Local Verification (npm test, check, audits, backup, restore, browser smoke)
6. Migration & Rollback Verification (IDB versions, legacy backup roundtrip)
7. Remote PR CI Verification (Run ID, event, attempt, artifact digests)

CONDITIONAL_MERGE_AUTHORITY:
- Pre-authorized: YES (if verdict == ACCEPT)
- Action: Persist verdict ──▶ Mark PR Ready ──▶ Merge exact PR head ──▶ Verify post-merge CI on main

FINAL_STATE:
- Verdict: ACCEPT / REJECT / BLOCKED
- Outcome: WAVE_IMPLEMENTATION_ACCEPTED_AND_CANONICAL (if ACCEPT)
```

---

## 8. Prompt Efficiency & No Lossy Compression

### 8.1 Efficiency Target
By referencing `EXECUTION_PROMPT_PROTOCOL_V2` for generic invariants, future transaction prompts achieve an estimated **40–60% reduction in duplicated text**, eliminating hundreds of lines of repetitive boilerplate per prompt while maintaining crystal-clear task parameters.

### 8.2 The No Lossy Compression Rule
> [!CAUTION]
> Prompt compression must **NEVER** omit or obscure transaction-specific technical parameters.

The following elements must **ALWAYS remain explicit and fully specified** in transaction prompts:
1. Exact Role and Transaction ID;
2. Exact Subject and Target Wave;
3. Exact Expected Canonical Predecessor SHA;
4. Exact Controlling Authority documents and versions;
5. Exact Transaction-Specific Scope and Explicit Exclusions;
6. Exact Allowlisted File Paths;
7. Exact RED Failure Predicates and GREEN Acceptance Criteria;
8. Exact Migration and Rollback contracts;
9. Exact Wave-Specific Special Risks and Stop Codes;
10. Exact Conditional Merge Pre-Authorization status.

---

## 9. Failure, Blocker, and Remediation Policy

### 9.1 No Pre-Created Speculative Recovery Transactions
Protocol V2 adheres to the rule: **DO NOT PRE-CREATE SPECULATIVE RECOVERY TRANSACTIONS**.
- The standard happy path assumes success under valid specifications.
- Speculative "backup recovery prompts" or hypothetical rollback scripts must not be generated ahead of time, as they create stale authority and administrative confusion.

### 9.2 Real-Failure Materialization
When an actual failure, rejection, or blocker occurs:
1. **Executor / Auditor halts immediately** and logs the exact failure state, commit SHA, logs, and error signatures.
2. **A dedicated, bounded remediation transaction is created**, targeting only the specific defect identified.
3. Once remediated, independent re-audit is conducted on the exact remediated PR head.

---

## 10. Multi-Package & Multi-Wave Bounded Execution

1. **Single vs Multi-Record Manifests**:
   - A single Wave Authorization Manifest may contain multiple executable package records (as authorized under ADR-046) **ONLY IF** each package's predecessor, dependency order, allowlist, RED/GREEN predicates, and stop conditions are completely frozen without requiring future discretionary choices.
2. **Inter-Wave Dependencies**:
   - Dependent Waves cannot be bundled into a single authorization if downstream wave architecture depends on runtime findings of an upstream wave.
   - Stage 2 Waves (W0 $\to$ W1 $\to$ W2 $\to$ W3 $\to$ W4 $\to$ W5 $\to$ W6) execute sequentially with distinct, dedicated authorization manifests.

---

## 11. W0 Grandfathering & Backward Compatibility

### 11.1 Absolute Validity of STAGE2-W0-IELTS-ARCH-AUTH-001
> [!IMPORTANT]
> The Wave Authorization Manifest **`STAGE2-W0-IELTS-ARCH-AUTH-001`** was authored, audited, and independently accepted under Protocol V1 (ADR-046 / PR #88 / commit `ee7d1b72c46a5e3e8e1411256ac4bd62360bbc54`).
>
> It remains **100% VALID, CANONICAL, AND UNMODIFIED**.

### 11.2 Controlling Rules for W0 Execution
1. Protocol V2 does **NOT** retroactively invalidate, modify, or reopen `STAGE2-W0-IELTS-ARCH-AUTH-001`.
2. For all product, domain, schema, allowlist, RED/GREEN, and migration contracts of Wave W0, **`STAGE2-W0-IELTS-ARCH-AUTH-001` is the sole controlling semantic authority**.
3. Protocol V2 governs only the transaction prompting efficiency (minimum-handoff model: 2 prompts remaining for W0).
4. In any case of conflict between Protocol V2 generic text and the accepted W0 manifest, **the accepted W0 manifest wins for W0**.

---

## 12. Relationship to Protocol V1 (ADR-046)

1. **Supersession for New Work**: Upon formal activation (independent audit + merge + post-merge CI), **Protocol V2 (`EXECUTION_PROMPT_PROTOCOL_V2` / ADR-051) supersedes Protocol V1 (`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` / ADR-046)** as the active prompt and execution standard for all future Waves.
2. **Preservation of Historical Evidence**: All historical manifests, capsules, commits, evidence artifacts, and verdicts accepted under Protocol V1 retain their full historical validity.

---

## 13. Non-Goals & No Runtime / Tool Authority

To prevent governance creep, the following are explicitly declared as **NON-GOALS**:
1. **Zero Product Code Mutation**: Protocol V2 does not add or alter any product source code in `src/**`.
2. **Zero Runtime Daemons / Automation**: No background daemons, cron services, DAG orchestrators, auto-retry bots, or auto-acceptance webhooks.
3. **Zero CI Workflow Modifications**: No edits to `.github/workflows/**`.
4. **Zero Dependency Changes**: No new packages in `package.json`.

---

## 14. Protocol Self-Test Matrix

The protocol proves its operational correctness against the following standard scenarios:

| Scenario ID | Test Scenario | Expected Protocol Behavior | Pass / Fail Rule |
|---|---|---|---|
| **SCENARIO A** | New unauthorized Wave (e.g. Wave W1) | Executes via 4-transaction happy path: T1 (Auth Impl) $\to$ T2 (Auth Audit) $\to$ T3 (Impl Exec) $\to$ T4 (Impl Audit). | PASS: Exactly 4 prompts; zero self-acceptance. |
| **SCENARIO B** | Wave with existing canonical authorization (Wave W0) | Skips T1 and T2; executes remaining 2 transactions: T1 (Impl Exec) $\to$ T2 (Impl Audit). | PASS: Exactly 2 prompts to reach W0 COMPLETE. |
| **SCENARIO C** | Implementation Audit yields `REJECT` verdict | Execution halts; Auditor logs exact findings; user issues a bounded remediation prompt; fresh audit follows. | PASS: Does not restart entire lifecycle from scratch. |
| **SCENARIO D** | Remote PR CI is still in progress | Transaction waits / polls CI autonomously within the same prompt; does not emit artificial handoff to user. | PASS: Single prompt handles CI wait and artifact download. |
| **SCENARIO E** | Post-ACCEPT merge is explicitly pre-authorized | Auditor records `ACCEPT` verdict, marks PR ready, merges PR, and verifies post-merge CI in the same prompt. | PASS: No separate "merge prompt" or "post-merge prompt". |
| **SCENARIO F** | Architecture choice or allowlist is unfrozen/ambiguous | Executor encounters `ARCHITECTURE_AUTHORITY_GAP` and halts immediately. Discretionary choice forbidden. | PASS: Fails closed; prompts user for governance/ADR decision. |
| **SCENARIO G** | Future dependent Wave lacks exact predecessor | Authorization for dependent wave cannot be created without exact predecessor SHA. | PASS: Fails closed; no speculative authorization. |

---

## 15. Quality Preservation Reconciliation Table

Demonstration that Protocol V2 preserves 100% of the repository's mandatory quality invariants:

| Quality / Safety Invariant | Source Authority (V1 / AGENTS.md) | Location in Protocol V2 | Reconciliation Classification |
|---|---|---|---|
| **Exact Predecessor Binding** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.2 (Git Invariants) | **PRESERVED** |
| **One-Writer Discipline** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.2 (Git Invariants) | **PRESERVED** |
| **Closed Write Allowlists** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.3 (Scope Invariants) | **PRESERVED** |
| **Test-First Commit A (RED)** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.4 (Test Invariants) | **PRESERVED** |
| **Natural Product-Defect RED**| `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.4 (Test Invariants) | **PRESERVED** |
| **RED Test Immutability** | ADR-046 §3 | Protocol V2 §3.4 (Test Invariants) | **PRESERVED** |
| **Minimal Commit B (GREEN)** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.4 (Test Invariants) | **PRESERVED** |
| **Zero Assertion Weakening** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.4 (Test Invariants) | **PRESERVED** |
| **Natural Exact-Head CI** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.5 (CI Invariants) | **PRESERVED** |
| **7 Core Verification Artifacts** | ADR-046 / CI Workflow | Protocol V2 §3.5 (CI Invariants) | **PRESERVED** |
| **Evidence Gateway Integrity** | `AGENTS.md` / ADR-004 | Protocol V2 §3.6 (Evidence Invariants) | **PRESERVED** |
| **Backup 100% Store Sentinel**| `AGENTS.md` / ADR-031 | Protocol V2 §3.7 (Data Invariants) | **PRESERVED** |
| **Journaled Restore Safety** | `AGENTS.md` / ADR-032 | Protocol V2 §3.7 (Data Invariants) | **PRESERVED** |
| **Forward-Only IDB Migrations**| `AGENTS.md` / ADR-008 | Protocol V2 §3.7 (Data Invariants) | **PRESERVED** |
| **Independent Acceptance** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.1, §6 (Independence Floor) | **PRESERVED** |
| **No Implementer Self-Accept** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.1, §6 (Independence Floor) | **PRESERVED** |
| **Pre-Authorized Merge Safety**| ADR-046 §3 | Protocol V2 §3.9 (Merge Invariants) | **PRESERVED** |
| **Fail-Closed Stop Conditions** | `AGENTS.md` / ADR-046 §3 | Protocol V2 §3.10, §5.2 (Taxonomy) | **PRESERVED** |
| **Prompt Text Efficiency** | *New in V2* | Protocol V2 §7, §8 (Templates & Metrics) | **STRENGTHENED** (40–60% reduction) |
| **Autonomous Mechanical Gates**| *New in V2* | Protocol V2 §4, §5 (Minimum Handoffs) | **STRENGTHENED** (Latency minimized) |

---

## 16. Activation Gate and Rollback Contract

### 16.1 Activation Gate
Protocol V2 candidate becomes **ACTIVE AND CONTROLLING** only after:
1. Independent Authorization Auditor performs an exact-head audit of PR head and issues a formal `ACCEPT` verdict;
2. Candidate PR is merged into `main`;
3. Natural post-merge CI completes successfully on `main`.

### 16.2 Rollback Contract
If Protocol V2 requires rollback:
1. Revert the governance commit on `main`;
2. Repository execution prompting immediately returns to Protocol V1 (`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`);
3. Historical manifests and accepted implementation work remain 100% valid and unaffected.
