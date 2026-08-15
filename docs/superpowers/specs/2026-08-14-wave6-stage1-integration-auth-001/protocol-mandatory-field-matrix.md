# Protocol V1 Mandatory Field Matrix — W6-STAGE1-INTEGRATION-AUTH-001

| Protocol V1 Mandatory Field | Field Value / Specification |
| :--- | :--- |
| **Authorization ID** | `W6-STAGE1-INTEGRATION-AUTH-001` |
| **Protocol Specification** | `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` (ADR-046) |
| **Authority Level** | `AUTHORIZATION_MANIFEST / NOT_EXECUTION` |
| **Canonical Owner** | Wave 6 Governance & Canonical Integration |
| **Designated Role** | `INDEPENDENT_INTEGRATION_AUDITOR` |
| **Integration Subject** | Pull Request `#78` (`codex/w6-stage1-recovery-exec-014`) |
| **Exact Candidate Head** | `81428f28fac8a8e34ab35126a028d16659199def` |
| **Canonical Base (Predecessor)** | `c6d790e0f85bdc9120aa99e5dbc972b955382ce4` (merged PR #69 on `main`) |
| **Controlling Batch Audit** | Comment `5290883787` on PR #78 (`STAGE1_TECHNICAL_ACCEPT`) |
| **Individual Package Status** | R1: `ACCEPT`, R2: `ACCEPT`, R3: `ACCEPT`, R4: `ACCEPT` |
| **Final Candidate CI** | Run `31779904619` / Job `94703187256` / `SUCCESS` (Artifact `9211289240`) |
| **Authorized Changed Files** | Docs-only: `docs/superpowers/specs/2026-08-14-wave6-stage1-integration-auth-001/**` |
| **Disallowed Scope** | Zero source changes (`src/**`), zero test changes (`tests/**`), zero workflow changes (`.github/**`) |
| **Pre-Conditions Frozen** | 10 exact predicates defined in `manifest.md` |
| **Merge Method** | Explicit merge commit (`gh pr merge 78 --merge --match-head-commit 81428f28fac8a8e34ab35126a028d16659199def`) |
| **Status Reconciliation** | `NONE` (Zero ledger modifications bundled with merge) |
| **Downstream Stage Gate** | Stage 1.5 and Stage 2 remain `UNAUTHORIZED / LOCKED` |
| **Stop Conditions** | Head drift, missing/mismatched audit comment, merge conflicts, overlap, CI failure -> FAIL CLOSED |
