# STAGE 4 UX / IA REMAKE AUTHORIZATION MANIFEST

**Manifest ID**: `STAGE4-UXIA-AUTH-001`
**Controlling Protocol**: [`docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`](../governance/EXECUTION_PROMPT_PROTOCOL_V2.md)
**Governing Strategy**: [`docs/stage4/STAGE4_UXIA_STRATEGY.md`](../stage4/STAGE4_UXIA_STRATEGY.md)
**Authorizing Authority**: Human Owner Ratification of `STAGE4-UXIA-STRATEGY-AUTH-DESIGN-001` (Revision `REV-004`)
**Status**: `CANDIDATE_AUTHORIZATION_MANIFEST / EFFECTIVE_UPON_INDEPENDENT_ACCEPTANCE_AND_INTEGRATION`
**Authority Role**: Task-Specific Bounded Authorization Manifest (subordinate to the permanent canonical authority hierarchy under [`AGENTS.md`](../../AGENTS.md); does not alter or renumber canonical hierarchy levels)

---

## 1. Wave Execution Ledger & Authorization State

`[FACT]` The 7-Wave Stage 4 execution model established in the ratified REV-004 strategy is governed as follows:

| WAVE_ID | WAVE_TITLE | ROLE | AUTHORITY_STATE | ALLOWLIST_SCOPE | SOURCE/TEST WRITE POLICY | HUMAN GATE |
|---|---|---|---|---|---|---|
| **`STAGE4-W0-STRATEGY-AUTH-001`** | Strategy & Capability Preservation Foundation | Stage 4 Strategy Architect + Governor | `AUTHORIZED_CURRENT_TRANSACTION` | `docs/stage4/STAGE4_UXIA_STRATEGY.md`, `docs/stage4/STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`, `docs/authorizations/STAGE4-UXIA-AUTH-001.md`, `docs/DECISIONS.md` | `ZERO_WRITE` | Gate G0 (Ratified) |
| **`STAGE4-W1-IA-JOURNEYS-001`** | IA, Navigation & 15 User Journeys | Information Architect | `DEFINED_BY_RATIFIED_STRATEGY / REQUIRES_EXPLICIT_WAVE_ACTIVATION` | `docs/stage4/STAGE4_INFORMATION_ARCHITECTURE.md`, `docs/stage4/STAGE4_USER_JOURNEYS.md` | `ZERO_WRITE` | Gate G1 |
| **`STAGE4-W2-INTERACTION-STATES-001`**| Interaction & State Machines | Interaction Architect | `DEFINED_BY_RATIFIED_STRATEGY / REQUIRES_EXPLICIT_WAVE_ACTIVATION` | `docs/stage4/STAGE4_INTERACTION_AND_STATE_MODEL.md` | `ZERO_WRITE` | Gate G2 |
| **`STAGE4-W3-WIREFRAME-LAYOUTS-001`** | Wireframe Blueprints (15 Screens) | UI/UX Wireframe Designer | `DEFINED_BY_RATIFIED_STRATEGY / REQUIRES_EXPLICIT_WAVE_ACTIVATION` | `docs/stage4/STAGE4_WIREFRAMES.md` | `ZERO_WRITE` | Gate G3 |
| **`STAGE4-W4-DESIGN-SYSTEM-001`** | Visual Design System & Tokens | Design System Architect | `DEFINED_BY_RATIFIED_STRATEGY / REQUIRES_EXPLICIT_WAVE_ACTIVATION` | `docs/stage4/STAGE4_DESIGN_SYSTEM.md` | `ZERO_WRITE` | Gate G4 |
| **`STAGE4-W5-HIFI-UI-SPECS-001`** | High-Fidelity Screen Specifications | High-Fidelity UI Designer | `DEFINED_BY_RATIFIED_STRATEGY / REQUIRES_EXPLICIT_WAVE_ACTIVATION` | `docs/stage4/STAGE4_SCREEN_AND_RESPONSIVE_SPEC.md` | `ZERO_WRITE` | Gate G5 |
| **`STAGE4-W6-PROTOTYPE-RECONCILIATION-001`** | Prototype & Candidate Exit Report | UX Prototype & Reconciliation Executor | `DEFINED_BY_RATIFIED_STRATEGY / REQUIRES_EXPLICIT_WAVE_ACTIVATION` | `docs/stage4/STAGE4_EXIT_REPORT.md` (Defined target artifact; additional status ledger write not currently authorized / requires explicit W6 activation if needed) | `ZERO_WRITE` | Gate G6 |

---

## 2. Hard Scope Boundaries & Write Policies

`[FACT]` Under [`AGENTS.md`](../../AGENTS.md) and [`EXECUTION_PROMPT_PROTOCOL_V2.md`](../governance/EXECUTION_PROMPT_PROTOCOL_V2.md):

### 2.1 Current Active Candidate Lineage Write Scope (Closed Allowlist)
`[FACT]` The current W0 candidate lineage write scope is strictly limited to its declared closed allowlists:
- **`STAGE4-W0-STRATEGY-AUTH-001`**: `docs/stage4/STAGE4_UXIA_STRATEGY.md`, `docs/stage4/STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`, `docs/authorizations/STAGE4-UXIA-AUTH-001.md`, `docs/DECISIONS.md`
- **`STAGE4-W0-STRATEGY-AUTH-001-REM-001`**: `docs/stage4/STAGE4_UXIA_STRATEGY.md`, `docs/stage4/STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`, `docs/authorizations/STAGE4-UXIA-AUTH-001.md`

### 2.2 Future Wave Artifact Definitions vs Current Write Authority
`[FACT]` For future Waves W1–W6:
- Entries in the Section 1 Wave table define intended target artifact destinations only; they are NOT active write grants.
- Each future Wave remains `DEFINED_BY_RATIFIED_STRATEGY / REQUIRES_EXPLICIT_WAVE_ACTIVATION`.
- Every future Wave activation must provide its own exact, closed allowlist upon formal activation.
- Explicit Invariants:
  $$\text{DEFINED\_FUTURE\_ARTIFACT\_PATH} \neq \text{CURRENT\_WRITE\_AUTHORITY}$$
  $$\text{WAVE\_DEFINITION} \neq \text{WAVE\_ACTIVATION}$$

### 2.3 Strictly Forbidden Modifiers
- `src/**` write policy: `FORBIDDEN` (Zero production source code modification).
- `tests/**` write policy: `FORBIDDEN` (Zero test modification).
- `package.json` / dependencies: `FORBIDDEN` (Zero dependency adoption).
- `.github/**` / CI workflows: `FORBIDDEN` (Zero workflow mutation).
- `docs/MASTER_ROADMAP.md` / `docs/IMPLEMENTATION_STATUS.md` status mutation: `FORBIDDEN` (Reserved for independent audit acceptance and authorized governance reconciliation; non-canonical candidate status recording in W6 requires explicit inclusion in a future W6 activation allowlist).

---

## 3. Operational Invariants & Governance Rules

`[FACT]`
1. **One-Writer Rule**: Exactly one agent writes to files during a transaction. Subagents inspect and analyze only.
2. **Fresh Independent Audit Separation**:
   $$\text{EXECUTOR\_SESSION} \neq \text{FRESH\_INDEPENDENT\_AUDITOR\_SESSION}$$
   $$\text{CI\_GREEN} \neq \text{ACCEPT}$$
   The Wave primary prompt executes design, runs local verification, pushes a Draft PR, and stops at `READY_FOR_INDEPENDENT_AUDIT`. Independent audit is conducted in a separate unpolluted top-level session.
3. **Merge Authority Limitation**:
   $$\text{ACCEPT} \neq \text{MERGE\_AUTHORITY}$$
   $$\text{MERGE\_AUTHORITY} = \text{NOT\_GRANTED\_BY\_W0\_EXECUTOR}$$
   An Independent Auditor may execute a merge ONLY when the controlling authorization manifest explicitly declares `MERGE_AUTHORITY: EXPLICITLY_GRANTED`.
4. **Wave W6 Scope & Status-Mutation Boundary**:
   Wave W6 is an unactivated future Wave (`DEFINED_BY_RATIFIED_STRATEGY / REQUIRES_EXPLICIT_WAVE_ACTIVATION`). When explicitly activated in the future, W6 acts as a candidate compiler. Prior to fresh independent audit acceptance, W6 is restricted to writing candidate completion fields in its defined exit report (`docs/stage4/STAGE4_EXIT_REPORT.md`):
   - `STAGE4_DESIGN_EXECUTION: COMPLETE_PENDING_INDEPENDENT_ACCEPTANCE`
   - `STAGE4_CANONICAL_STATUS: NOT_YET_CLOSED`
   W6 has zero standing authority to modify `docs/IMPLEMENTATION_STATUS.md` unless explicitly granted in a separate future W6 wave authorization manifest. Canonical Stage 4 closure (`STAGE4_STATUS: COMPLETE / CANONICALLY_CLOSED`) is strictly reserved for independent audit acceptance followed by authorized repository governance reconciliation.
5. **Downstream Stage 5 & 6 Boundaries**:
   - Stage 5 Technology Selection (AI/ASR benchmarks) and Stage 6 Implementation remain strictly unexecuted and non-authorized by this manifest.
