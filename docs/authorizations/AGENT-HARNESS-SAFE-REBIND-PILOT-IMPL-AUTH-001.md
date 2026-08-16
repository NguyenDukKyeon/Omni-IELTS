# Implementation Authorization Manifest — Read-Only Pre-Execution Safe-Rebind Checker Pilot

Manifest Identity: **AGENT-HARNESS-SAFE-REBIND-PILOT-IMPL-AUTH-001**  
Wave ID: **AGENT-HARNESS-SAFE-REBIND-PILOT-IMPL-001**  
Wave Name: **Read-Only Pre-Execution Safe-Rebind Checker Pilot Implementation**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1** (ADR-046 / ADR-051)  
Date: **2026-08-16**  
Document Class: **IMPLEMENTATION_AUTHORIZATION_CANDIDATE**  
Status: **CANDIDATE / AUTHORIZATION_PENDING_INDEPENDENT_AUDIT / NOT_EFFECTIVE**  
Controlling Specification: **`docs/governance/EXACT_PREDECESSOR_SAFE_REBIND_PILOT_SPEC_V1.md`**  
Controlling Specification Canonical Merge: **`4937fc3d62ab80bbed651409882d3d3a20735bb6`** (PR #108)  
Canonical Predecessor (Base): **`4937fc3d62ab80bbed651409882d3d3a20735bb6`**  
Effective Implementation Predecessor: **`PENDING_AUTHORIZATION_ACCEPTANCE_AND_MERGE_RESOLUTION`**  
Target Implementation Branch (Future): **`exec/agent-harness-safe-rebind-pilot-impl-001`**  
Authority Effect: **NOT_EFFECTIVE_UNTIL_INDEPENDENT_ACCEPTANCE**  
Production Safe Rebind: **NOT_ENABLED**  
Stage 2 Wave W1: **NOT_AUTHORIZED**  
Implementation Merge Authority: **NOT_GRANTED**  

---

## 1. Executive Summary, Lineage, and Authority Separation

### 1.1 Authority Hierarchy
This implementation authorization manifest is governed strictly by the canonical repository authority hierarchy:

$$\begin{matrix}
\text{Level 1: Master Product Roadmap } (\texttt{docs/MASTER\_ROADMAP.md}) \\
\downarrow \\
\text{Level 2: Technical Package Taxonomy } (\texttt{docs/ROADMAP.md}) \\
\downarrow \\
\text{Level 3: Accepted Safe-Rebind Pilot Specification V1 } (\texttt{docs/governance/EXACT\_PREDECESSOR\_SAFE\_REBIND\_PILOT\_SPEC\_V1.md}) \\
\downarrow \\
\textbf{Level 4: This Implementation Authorization Candidate } (\textbf{AGENT-HARNESS-SAFE-REBIND-PILOT-IMPL-AUTH-001}) \\
\downarrow \\
\text{Level 5: Future Implementation Execution } (\text{Commit A RED } \to \text{ Commit B GREEN}) \\
\downarrow \\
\text{Level 6: Independent Implementation Audit \& Formal Acceptance}
\end{matrix}$$

### 1.2 Controlling Authorities Fresh-Read Ledger

| Authority Document | Canonical Role & Governance Level | Verification Anchor / Commit Binding |
|---|---|---|
| [`docs/MASTER_ROADMAP.md`](file:///d:/Workspace/EnlishMaster-W6/docs/MASTER_ROADMAP.md) | Level 1 Master Product Roadmap (Stage 1–8) | ADR-049 canonical product hierarchy |
| [`docs/ROADMAP.md`](file:///d:/Workspace/EnlishMaster-W6/docs/ROADMAP.md) | Level 2 Subordinate Technical Package Taxonomy | Phase 0–7 package definitions |
| [`AGENTS.md`](file:///d:/Workspace/EnlishMaster-W6/AGENTS.md) | Level 6 Repository Agent Router & Global Invariants | Authority model, single-writer rule, fail-closed stop conditions |
| [`docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`](file:///d:/Workspace/EnlishMaster-W6/docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md) | Governance Protocol (ADR-051) | Prompt efficiency, role separation, two-commit RED/GREEN rules |
| [`docs/governance/EXACT_PREDECESSOR_SAFE_REBIND_PILOT_SPEC_V1.md`](file:///d:/Workspace/EnlishMaster-W6/docs/governance/EXACT_PREDECESSOR_SAFE_REBIND_PILOT_SPEC_V1.md) | Accepted Technical Specification | Merged PR #108 at commit `4937fc3d62ab80bbed651409882d3d3a20735bb6` (Audit `PRR_kwDOTmjPCs8AAAABJs-jLQ`, CI `31945108566`) |
| [`docs/DECISIONS.md`](file:///d:/Workspace/EnlishMaster-W6/docs/DECISIONS.md) | Architecture Decision Records | ADR-046 (Bounded Execution Capsules), ADR-051 (Protocol V2) |
| [`docs/IMPLEMENTATION_STATUS.md`](file:///d:/Workspace/EnlishMaster-W6/docs/IMPLEMENTATION_STATUS.md) | Execution Ledger & Canonical Status Source of Truth | Baseline execution status and historical lineage |
| [`package.json`](file:///d:/Workspace/EnlishMaster-W6/package.json) | Package Manifest & Script Configuration | Script and dependency boundary |
| [`.github/workflows/ci.yml`](file:///d:/Workspace/EnlishMaster-W6/.github/workflows/ci.yml) | Natural CI Workflow Configuration | Workflow checkout depth and test verification pipeline |
| [`scripts/agent-context.mjs`](file:///d:/Workspace/EnlishMaster-W6/scripts/agent-context.mjs) | Context Compiler Reference Implementation | Canonical manifest adapter reference |

### 1.3 Authority Separation & Non-Authority Statement

$$\text{RESEARCH} \neq \text{SPECIFICATION} \neq \text{AUTHORIZATION} \neq \text{IMPLEMENTATION} \neq \text{EVIDENCE} \neq \text{INDEPENDENT ACCEPTANCE} \neq \text{MERGE AUTHORITY}$$

> [!IMPORTANT]
> - This document is an **IMPLEMENTATION AUTHORIZATION CANDIDATE ONLY**.
> - The merged safe-rebind specification (`docs/governance/EXACT_PREDECESSOR_SAFE_REBIND_PILOT_SPEC_V1.md`) establishes the **TECHNICAL CONTRACT**, but explicitly does NOT grant implementation authority by itself.
> - This document establishes the **BOUNDED IMPLEMENTATION PERMISSION** needed prior to writing checker implementation code.
> - The Authorization Author is **NOT** the checker implementer, not an Independent Auditor, not a Repository Governor with discretionary authority, and not a merge authority.
> - This candidate is **NOT EFFECTIVE** until an Independent Authorization Auditor performs a fresh audit, issues a formal `ACCEPT` verdict, and this authorization is merged into canonical `main`.
> - Do NOT implement the checker in this authorization transaction.

---

## 2. Predecessor Binding & Chain-of-Custody Resolution

### 2.1 Distinction Between Authorization Base and Implementation Base
Repository governance preserves strict chain-of-custody without using the not-yet-activated safe-rebind mechanism:
1. **Authorization Authoring Base**: Exact commit `4937fc3d62ab80bbed651409882d3d3a20735bb6` (canonical `origin/main` containing the accepted specification).
2. **Future Implementation Execution Base**: The exact commit on `main` where this authorization manifest is ratified and merged.

### 2.2 Self-Resolving Conditional Implementation Predecessor Binding
Under `EXECUTION_PROMPT_PROTOCOL_V2.md` and repository authorization practice, the future implementation predecessor is governed by a **self-resolving conditional binding**:

$$\text{EFFECTIVE\_IMPLEMENTATION\_PREDECESSOR} = \text{EXACT\_AUTH\_MERGE\_COMMIT\_SHA}$$

This SHA becomes canonically resolved only after:
1. Independent Authorization Audit yields a formal `ACCEPT` verdict on this candidate;
2. The `ACCEPT` verdict is persisted and verified;
3. Candidate head SHA remains unchanged;
4. The exact accepted authorization candidate is merged into canonical `main`;
5. Post-merge push CI completes with `SUCCESS` on canonical `main`.

Before these gates are satisfied:
$$\text{Effective Implementation Predecessor} = \mathbf{PENDING\_AUTHORIZATION\_ACCEPTANCE\_AND\_MERGE\_RESOLUTION}$$

After these gates are satisfied:
The implementation executor for transaction `AGENT-HARNESS-SAFE-REBIND-PILOT-IMPL-001` must create branch `exec/agent-harness-safe-rebind-pilot-impl-001` directly from that exact merge commit SHA, satisfying `CANONICAL_BASE_DRIFT -> STOP` and `EXACT_PREDECESSOR_BINDING`.

---

## 3. Future Implementation Mission, Scope, and Non-Goals

### 3.1 Mission
Implement the accepted **`PRE_EXECUTION_REBIND_V0`** read-only classifier and deterministic audit proof generator in `scripts/agent-rebind-check.mjs` and its test suite, conforming 100% to the accepted technical specification in `docs/governance/EXACT_PREDECESSOR_SAFE_REBIND_PILOT_SPEC_V1.md`.

### 3.2 CLI Interface Contract
The implementation must provide exactly:

```bash
# Human-readable diagnostic output
npm run agent:rebind-check -- <TRANSACTION_ID> --to <B_SHA> --anchor <K_SHA> --evidence <OFFLINE_EVIDENCE_BUNDLE_PATH>

# Machine-readable deterministic JSON proof output
npm run agent:rebind-check -- <TRANSACTION_ID> --to <B_SHA> --anchor <K_SHA> --evidence <OFFLINE_EVIDENCE_BUNDLE_PATH> --json
```

### 3.3 Implementation Non-Goals & Strict Exclusions
The future implementation MUST NOT:
- **Activate production safe rebind**: Production repository policy remains strictly `EXACT_PREDECESSOR_UNCHANGED`. `CANONICAL_BASE_DRIFT -> STOP` remains in full effect.
- **Modify governance rules**: Do NOT modify `AGENTS.md`, `EXECUTION_PROMPT_PROTOCOL_V2.md`, `docs/MASTER_ROADMAP.md`, `docs/ROADMAP.md`, or `docs/DECISIONS.md`.
- **Mutate Git refs**: Checker execution must NEVER execute `git checkout`, `git switch`, `git rebase`, `git cherry-pick`, `git merge`, `git commit`, `git update-ref`, `git tag`, or `git push`.
- **Make network requests**: Checker operates 100% offline from local Git objects and the supplied offline evidence bundle.
- **Implement an external evidence harvester**: External GitHub API evidence acquisition is decoupled and out of scope. No harvester scripts (`scripts/agent-rebind-evidence-harvester.*` or equivalent) are authorized.
- **Write repository files during checker run**: Checker output is emitted to stdout/stderr only; no file writes or proof cache files in the workspace.
- **Open PRs, comments, or reviews**: Checker is an offline tool with zero platform mutation authority.
- **Grant execution, acceptance, or merge authority**: Proof emission provides machine data only; it does not grant execution authority.
- **Implement Stage 2 Wave W1 or later Waves**: Wave W1 remains `NOT_AUTHORIZED`.
- **Modify product source**: Zero changes to `src/**`. Learner-facing VocabMaster application behavior is untouched.

---

## 4. Persistence Model and Store Manifest

```text
PERSISTENCE_CHANGE:    NONE
DATABASE_CHANGE:       NONE
MIGRATION:             NONE
BACKUP_SCHEMA_CHANGE:  NONE
ROLLBACK:              Revert or remove the isolated pilot checker source, script entry, test, fixture, and workflow edit. No user or application data is involved.
```

---

## 5. Exact Implementation Allowlist

The future implementation write allowlist is strictly closed to a maximum of **5 files**:

### 5.1 Source Allowlist (SOURCE_ALLOWLIST)

| File Path | Description & Purpose |
|---|---|
| `scripts/agent-rebind-check.mjs` | Read-only pre-execution safe-rebind checker CLI and proof generator implementation |
| `package.json` | Package manifest: authorized ONLY to add the `"agent:rebind-check"` script entry |

### 5.2 Test Allowlist (TEST_ALLOWLIST)

| File Path | Description & Purpose |
|---|---|
| `tests/agent-rebind-check.test.mjs` | Test suite covering Four-State Model, ancestry, manifest adapter, footprints, candidate state, offline bundle, RED gate, reason aggregation, determinism, security, and W0 replay |
| `.github/workflows/ci.yml` | CI workflow: authorized ONLY for the narrow addition of `with: fetch-depth: 0` under `actions/checkout@v4` |

### 5.3 Fixture Allowlist (FIXTURE_ALLOWLIST)

| File Path | Description & Purpose |
|---|---|
| `tests/fixtures/safe-rebind-w0-evidence-v1.json` | Deterministic offline evidence bundle fixture for the historical Stage 2 Wave W0 replay benchmark |

### 5.4 Docs and Evidence Allowlist (DOC_EVIDENCE_ALLOWLIST)

| File Path | Description & Purpose |
|---|---|
| `docs/authorizations/AGENT-HARNESS-SAFE-REBIND-PILOT-IMPL-AUTH-001.md` | This controlling authorization document (read-only reference during implementation) |

### 5.5 Package Manifest & Dependency Boundaries
- **`package.json` Edit Constraint**: The ONLY permitted edit to `package.json` is adding:
  ```json
  "agent:rebind-check": "node scripts/agent-rebind-check.mjs"
  ```
- **Dependency Policy**: **`NO_NEW_DEPENDENCY`**.
  - `dependencies`: Unchanged.
  - `devDependencies`: Unchanged.
  - `package-lock.json`: Unchanged (must NOT be modified).
  - Substrate reuse: Implementation may reuse Node.js built-ins (`fs`, `path`, `child_process`, `crypto`) and existing `devDependencies` entry `esbuild` (`^0.28.1`) for deterministic static AST import analysis.
  - Third-party parsers (`acorn`, `babel`, `typescript`, `tree-sitter`, etc.) are **STRICTLY FORBIDDEN** without separate authority.
  - If implementation cannot be completed using existing substrate $\to$ **STOP**: `SAFE_REBIND_NEW_DEPENDENCY_AUTHORITY_REQUIRED`.

### 5.6 CI Workflow Modification Boundary
Current `.github/workflows/ci.yml` uses default shallow checkout (`actions/checkout@v4` with `fetch-depth: 1`), which lacks the historical Git objects ($A$, $K$, $B$, `merge-base`) required for local replay tests.
- Under step `uses: actions/checkout@v4` (line 16), add:
  ```yaml
  with:
    fetch-depth: 0
  ```
- **Zero other workflow changes**: No new jobs, steps, permissions, actions, environment variables, timeouts, or trigger changes.

---

## 6. RED / GREEN Execution Topology and Specification

Future implementation must strictly follow the **Two-Commit RED / GREEN Topology**:

$$\begin{matrix}
\text{Canonical Base } (M) \\
\downarrow \\
\textbf{Commit A: TEST / FIXTURE / CI-HARNESS RED} \\
\downarrow \\
\textbf{Commit B: SOURCE / PACKAGE-SCRIPT GREEN}
\end{matrix}$$

### 6.1 Commit A — RED Test Contract and Expected Failure Predicates

#### Commit A Closed Allowlist
Commit A may modify ONLY:
1. `tests/agent-rebind-check.test.mjs`
2. `tests/fixtures/safe-rebind-w0-evidence-v1.json`
3. `.github/workflows/ci.yml` (narrow `fetch-depth: 0` edit only)

Commit A MUST NOT modify: `scripts/agent-rebind-check.mjs`, `package.json`, `package-lock.json`, `src/**`, `docs/**`.

#### Commit A Test Contract Coverage Requirements
The test suite in `tests/agent-rebind-check.test.mjs` must test-first encode the canonical specification:
1. **Four-State Model**: Correct classification of `REBIND_SAFE`, `REBIND_UNSAFE`, `REBIND_UNKNOWN`, and `REBIND_NOT_REQUIRED`.
2. **Ancestry & Topology**: Strict descendant ($A \prec K \preceq B$), identity ($A == B \to \text{REBIND\_NOT\_REQUIRED}$), non-descendant ($\text{merge-base}(A, B) \neq A \to \text{REBIND\_UNSAFE}$ / `NON_DESCENDANT_BASE`), and missing Git object (`REBIND_UNKNOWN` / `GIT_OBJECT_UNAVAILABLE`).
3. **Canonical Manifest Adapter**: Extraction of `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` headings; fail-closed behavior on missing or duplicate headings (`AUTHORITY_AMBIGUOUS`, `FOOTPRINT_INCOMPLETE`).
4. **Closed Footprint Model**: Full extraction and validation across all 9 footprint categories:
   - `AUTHORITY_FOOTPRINT`
   - `WRITE_FOOTPRINT`
   - `REQUIRED_READ_FOOTPRINT`
   - `TEST_FOOTPRINT`
   - `RUNTIME_DEPENDENCY_FOOTPRINT`
   - `BUILD_CI_FOOTPRINT`
   - `DATA_SCHEMA_FOOTPRINT`
   - `PREDECESSOR_CONTRACT_FOOTPRINT`
   - `CONTEXT_INTERPRETATION_FOOTPRINT`
5. **Normalized Path-Delta Model**: Strict status enum `["A", "M", "D"]`, moves as $D + A$, deterministic handling of duplicate identical blobs without rename heuristics.
6. **Candidate State Gates**: Window A/B safe evaluation; fail-closed `REBIND_UNSAFE` when `commit_count >= 1` (`COMMIT_A_EXISTS`, `CANDIDATE_COMMIT_EXISTS`), when CI exists (`CANDIDATE_CI_EXISTS`), when independent verdict exists (`INDEPENDENT_VERDICT_EXISTS`), or when historical rejected candidate reuse is attempted (`HISTORICAL_CANDIDATE_REUSE_REQUIRED`).
7. **Offline Evidence Bundle**: Valid bundle consumption, missing bundle (`FOOTPRINT_INCOMPLETE`), malformed bundle schema, local Git disagreement (`AUTHORITY_AMBIGUOUS`), and bundle digest mismatch.
8. **RED Predicate Viability Preflight**: Mandatory predicates; `UNSATISFIED` allows SAFE; `SATISFIED` yields `REBIND_UNSAFE` (`RED_PREDICATE_PRE_SATISFIED`); `UNKNOWN` / `NOT_EVALUATED` yields `REBIND_UNKNOWN` (`RED_PREDICATE_UNKNOWN`).
9. **Exhaustive Reason Aggregation & Precedence**: Complete collection of all triggered reasons, ASCII ascending sort, strict precedence $\mathbf{UNSAFE} > \mathbf{UNKNOWN} > \mathbf{SAFE}$.
10. **Proof Determinism & Canonical JSON**: Identical inputs yield byte-identical proof; proof digest SHA-256 self-consistency; no timestamps, process IDs, or environment leakage in digest.
11. **Security & Process Safety**: Zero network access, zero ref mutations, zero shell-string interpolation, workspace path containment.
12. **Historical Wave W0 Replay Benchmark**: Replay against exact identities:
    - $A = \text{a755ae4949746a71ac86299b34766ad8fe3b6fb6}$
    - $K = \text{ee7d1b72c46a5e3e8e1411256ac4bd62360bbc54}$
    - $B = \text{4130ef940b515224357548e029d0c34a857c82e5}$
    - Evidence: `tests/fixtures/safe-rebind-w0-evidence-v1.json`
    - Expected Result: `REBIND_UNSAFE`
    - Expected Reason Codes: `["AUTHORITY_CHANGED", "REQUIRED_READ_FOOTPRINT_CHANGED", "WRITE_FOOTPRINT_CHANGED"]`

#### Commit A Expected Failure Predicates Table

| Test Path | Predicate / Scenario | Expected Failure at Commit A |
|---|---|---|
| `tests/agent-rebind-check.test.mjs` | Invocation of `agent:rebind-check` CLI or module import | Module `scripts/agent-rebind-check.mjs` not found or script entry missing |
| `tests/agent-rebind-check.test.mjs` | Four-state classification and proof generation | Missing classification engine |
| `tests/agent-rebind-check.test.mjs` | Footprint extraction and AST dependency analysis | Missing manifest adapter and AST parser |
| `tests/agent-rebind-check.test.mjs` | Offline evidence bundle validation and candidate state check | Missing bundle parser and cross-checker |
| `tests/agent-rebind-check.test.mjs` | Historical Stage 2 Wave W0 replay benchmark | Missing replay evaluator |

#### Natural RED Gate
- After Commit A, push to Draft PR.
- Natural pull request CI must run on exact Commit A head.
- Expected outcome: **`FAILURE`** caused strictly by missing checker implementation.
- Test, fixture, and workflow blobs become **PERMANENTLY IMMUTABLE** after Commit A.

### 6.2 RED Immutability Rule
Once Commit A is committed and its failure predicates verified:
1. The RED test files, fixtures, and workflow files become **STRICTLY IMMUTABLE** for Commit B.
2. The executor must **NOT** weaken assertions, skip tests, or alter expected values during Commit B.
3. If an unforeseen technical contradiction requires modifying a RED test, the executor must **STOP** immediately with reason `RED_TEST_MUTATION_REQUIRED`.

### 6.3 Commit B — GREEN Acceptance Gates and Implementation Contract

#### Commit B Closed Allowlist
Commit B may modify ONLY:
1. `scripts/agent-rebind-check.mjs`
2. `package.json` (adding `"agent:rebind-check"` script entry only)

Commit B MUST NOT modify: `tests/**`, `tests/fixtures/**`, `.github/workflows/**`, `src/**`, `docs/**`, `package-lock.json`.

#### Test Immutability Verification
Commit B must preserve exact blob equality with Commit A:
$$\text{blob}(\texttt{tests/agent-rebind-check.test.mjs}, \text{Commit A}) == \text{blob}(\texttt{tests/agent-rebind-check.test.mjs}, \text{Commit B})$$
$$\text{blob}(\texttt{tests/fixtures/safe-rebind-w0-evidence-v1.json}, \text{Commit A}) == \text{blob}(\texttt{tests/fixtures/safe-rebind-w0-evidence-v1.json}, \text{Commit B})$$
$$\text{blob}(\texttt{.github/workflows/ci.yml}, \text{Commit A}) == \text{blob}(\texttt{.github/workflows/ci.yml}, \text{Commit B})$$

#### Implementation Architectural Contracts
- **Git Operations**: Pure read-only subcommands via `execFileSync('git', args, { encoding: 'utf8' })` (`rev-parse`, `merge-base`, `cat-file`, `ls-tree`, `diff-tree`, `hash-object`, `rev-list`).
- **AST Dependency Graph**: Static analysis of ES Module imports (`import`, `export ... from`, static `require`) using Node.js built-ins and existing `esbuild`. Dynamic / unresolvable edges trigger fail-closed `REBIND_UNKNOWN` (`RUNTIME_DEPENDENCY_UNRESOLVED`).
- **Reason Code Aggregation**: Record all triggered reason codes across all gates; sort ASCII ascending; resolve final status via strict precedence ($\mathbf{UNSAFE} > \mathbf{UNKNOWN} > \mathbf{SAFE}$).
- **Canonical Serialization**: Keys sorted ASCII ascending at all levels; arrays sorted ASCII ascending; POSIX normalized relative paths; UTF-8 LF encoding; zero timestamps; SHA-256 self-digest computed over payload excluding `proof_digest`.
- **Exit Code Semantics**: Exit 0 on valid proof emission (classification is in JSON `result`); non-zero exit on unhandled runtime exception or malformed CLI arguments.

#### Commit B GREEN Acceptance Gates
1. `node --test tests/agent-rebind-check.test.mjs` passes 100% of all checker test cases (zero failures, zero skips).
2. `npm test` passes all repository unit and integration tests.
3. `npm run check` passes with zero lint or syntax errors.
4. `npm run audit:roadmap` and `npm run audit:ielts` pass cleanly.
5. `npm run test:v10` and `npm run audit:v10` pass cleanly.
6. `npm run build` completes successfully.
7. Direct CLI invocation against Stage 2 Wave W0 replay emits valid canonical JSON proof matching `REBIND_UNSAFE` and exact 3 reason codes.
8. Natural CI on exact Commit B head completes with `SUCCESS` on attempt 1.

---

## 7. Fixture Corpus & Adversarial Evaluation Matrix

### 7.1 Programmatic Synthetic Fixture Generation
Synthetic test fixtures must be constructed programmatically inside `tests/agent-rebind-check.test.mjs` using temporary Git repositories. Only the historical W0 evidence bundle is checked in as a static fixture file.

### 7.2 Required Test Cases Summary

| Category | Count | Scope & Behaviors Tested |
|---|---|---|
| **Controlled SAFE Lifecycle** | $\ge 1$ | Synthetic clean predecessor progression $(A \to B)$ where intervening change is unrelated markdown doc; all 9 footprints verified disjoint; RED unsatisfied; candidate state clean $\to$ `REBIND_SAFE` (`reason_codes: []`). |
| **UNSAFE Corpus** | $\ge 12$ | `WRITE_FOOTPRINT_CHANGED`, `REQUIRED_READ_FOOTPRINT_CHANGED`, `TEST_FOOTPRINT_CHANGED`, `RUNTIME_DEPENDENCY_CHANGED`, `BUILD_CI_CHANGED`, `DATA_SCHEMA_CHANGED`, `AUTHORITY_CHANGED`, `RED_PREDICATE_PRE_SATISFIED`, `COMMIT_A_EXISTS`, `NON_DESCENDANT_BASE`, `CANDIDATE_CI_EXISTS`, `INDEPENDENT_VERDICT_EXISTS`. |
| **UNKNOWN Corpus** | $\ge 7$ | `RUNTIME_DEPENDENCY_UNRESOLVED`, `FOOTPRINT_INCOMPLETE`, `GIT_OBJECT_UNAVAILABLE`, missing offline evidence bundle, bundle/Git state conflict, un-evaluated RED predicate (`RED_PREDICATE_UNKNOWN`), malformed manifest schema (`AUTHORITY_AMBIGUOUS`). |
| **Adversarial False-Safe Matrix** | 15 | Deep transitive dependency changes (ADV-01), dynamic import edge (ADV-02), package.json version bump (ADV-03), npm script flag altered (ADV-04), CI workflow change (ADV-05), CSS asset coupling (ADV-06), IndexedDB schema index (ADV-07), test helper timeout inflation (ADV-08), upstream contract revoked (ADV-09), implicit window global (ADV-10), identical blob rename collision (ADV-11), manifest drift on main (ADV-12), context compiler logic drift (ADV-13), pre-satisfied RED behavior (ADV-14), historical candidate reuse (ADV-15). |
| **Historical W0 Replay** | 1 | Stage 2 Wave W0 lineage replay yielding exact expected result `REBIND_UNSAFE` with reasons `["AUTHORITY_CHANGED", "REQUIRED_READ_FOOTPRINT_CHANGED", "WRITE_FOOTPRINT_CHANGED"]`. |

---

## 8. Pilot Metrics & Hard Safety Gate

### 8.1 Empirical Metrics Ledger

| Metric Identifier | Target / Boundary | Purpose |
|---|---|---|
| `false_safe_count` | **`EXACTLY 0`** | Hard Research Safety Gate |
| `false_unsafe_count` | Diagnostic | Measures cost of conservatism |
| `rebind_safe_count` | Diagnostic | Fixture suite validation count |
| `rebind_unsafe_count` | Diagnostic | Fixture suite validation count |
| `rebind_unknown_count` | Diagnostic | Fixture suite validation count |
| `unknown_rate` | Diagnostic | Tracked for empirical pilot evaluation |
| `checker_runtime_ms` | Performance | Execution efficiency |
| `proof_bytes` | Compactness | Emitted proof byte footprint |
| `footprint_resolution_failures` | Robustness | AST parser edge coverage |

### 8.2 Hard Pilot Safety Gate
$$\mathbf{observed\_false\_safe\_count} == 0$$

If any test case in the adversarial corpus or synthetic suite yields a false-safe classification, implementation acceptance fails immediately.

---

## 9. Verification Commands and CI Obligations

### 9.1 Local Verification Suite

```bash
# 1. Dedicated checker test suite
node --test tests/agent-rebind-check.test.mjs

# 2. Full test suite execution
npm test

# 3. Static cross-check & syntax validation
npm run check

# 4. Roadmap & IELTS governance audits
npm run audit:roadmap
npm run audit:ielts

# 5. V10 contracts & audit
npm run test:v10
npm run audit:v10

# 6. Production build verification
npm run build

# 7. Direct CLI execution verification (Wave W0 replay)
npm run agent:rebind-check -- W0-IELTS-ARCH-001 --to 4130ef940b515224357548e029d0c34a857c82e5 --anchor ee7d1b72c46a5e3e8e1411256ac4bd62360bbc54 --evidence tests/fixtures/safe-rebind-w0-evidence-v1.json --json
```

### 9.2 Natural Exact-Head CI Requirements
Pull request CI workflow (`.github/workflows/ci.yml`) must run naturally on the exact candidate head SHA for the authorization PR and the subsequent implementation PR. Synthetic triggers (`workflow_dispatch`), reruns, empty commits, draft-toggle tricks, or close/reopen tricks are strictly prohibited. CI must complete with SUCCESS on attempt 1.

---

## 10. Execution Stop Conditions

The executor and auditor must **HALT IMMEDIATELY** and fail closed if any of the following conditions are encountered:

1. `CANONICAL_BASE_DRIFT`: Canonical `main` differs from expected base commit.
2. `SCOPE_VIOLATION`: Changes proposed or made outside the 5 authorized allowlist files.
3. `RED_HARNESS_MUTATED`: Blob SHA of test, fixture, or workflow files differs between Commit A and Commit B.
4. `NEW_DEPENDENCY_REQUIRED`: Implementation attempts to add a new dependency or devDependency to `package.json`.
5. `WORKFLOW_EXPANSION`: Changes to `.github/workflows/ci.yml` exceed the single `fetch-depth: 0` addition.
6. `INVALID_RED_CONTRACT`: Commit A passes prematurely or fails unnaturally (e.g. syntax error instead of missing implementation).
7. `W0_REPLAY_MISMATCH`: Replay output diverges from canonical specification (`REBIND_UNSAFE` with exact 3 reasons).
8. `FALSE_SAFE_OBSERVED`: Checker classifies an incompatible test case as `REBIND_SAFE`.
9. `PRODUCTION_REBIND_ACTIVATION_ATTEMPT`: Candidate attempts to modify production rebind policy or Protocol V2.
10. `MERGE_AUTHORITY_INFERRED`: Implementation executor attempts to self-accept or merge PR without separate explicit authority.

---

## 11. Governance and Integration Policy

### 11.1 Implementation Authority Status
$$\text{IMPLEMENTATION\_AUTHORITY} = \mathbf{PENDING\_INDEPENDENT\_AUTHORIZATION\_ACCEPTANCE}$$

### 11.2 Implementation Merge Authority
$$\text{IMPLEMENTATION\_MERGE\_AUTHORITY} = \mathbf{NOT\_GRANTED}$$

An independent `ACCEPT` verdict on the future implementation PR does NOT grant merge authority unless separately authorized.

### 11.3 Production Rebind Status
$$\text{PRODUCTION\_SAFE\_REBIND} = \mathbf{NOT\_ENABLED}$$

The safe-rebind checker pilot generates diagnostic evidence only. Any production activation requires a separate formal Governance Design $\to$ Authorization $\to$ Independent Audit $\to$ Acceptance lifecycle.

### 11.4 Downstream Stages and Waves
$$\text{STAGE\_2\_WAVE\_W1} = \mathbf{NOT\_AUTHORIZED}$$
$$\text{STAGES\_3\_THROUGH\_8} = \mathbf{NOT\_AUTHORIZED}$$

---
