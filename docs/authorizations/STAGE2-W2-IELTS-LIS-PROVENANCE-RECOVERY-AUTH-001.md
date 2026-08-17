# Wave Provenance Recovery Authorization Manifest — Stage 2 Wave W2

Manifest Identity: **STAGE2-W2-IELTS-LIS-PROVENANCE-RECOVERY-AUTH-001**  
Transaction ID: **W2-GOV-PROVENANCE-RECOVERY-AUTH-001**  
Wave Identity: **W2-IELTS-LIS-001 (Listening Platform Completeness)**  
Protocol: **BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1 (ADR-046) & EXECUTION_PROMPT_PROTOCOL_V2 (ADR-051)**  
Date: **2026-08-17**  
Status: **CANDIDATE / PROVENANCE_RECOVERY_AUTHORIZATION_PENDING_INDEPENDENT_AUDIT**  
Canonical Predecessor (Base): **`2fc37a2ad3c61b99a88322199c5b1462522e5459`**  
Controlling Authorization: **`STAGE2-W2-IELTS-LIS-AUTH-002.md`** & **`STAGE2-W2-IELTS-LIS-RECOVERY-AUTH-001.md`**  
Owner Ratification: **STAGE 2 W2 OWNER-RATIFIED EXACT-SHA PROVENANCE RECOVERY DIRECTIVE**  

---

## 1. Executive Summary & Provenance Defect Declaration

### 1.1 Confirmed Exact-SHA Provenance Defects
A fresh audit of raw GitHub repository objects established that while the technical recovery execution and independent reviews were performed in real time, typographical / local reference errors in commit strings were recorded in previous recovery documents:
1. **PR #128 (`STAGE2-W2-IELTS-LIS-REVALIDATION-001`):** Recorded non-existent predecessor SHA `9b72843b0923d387349910c22faeb9f3152d06ea` instead of the raw GitHub merge SHA for PR #127: `9b728437a61a3ed5880d4c0863a213a5b6dd87bb`.
2. **PR #129 (`docs/IMPLEMENTATION_STATUS.md`):** Recorded non-existent merge SHAs `9b72843b0923d387349910c22faeb9f3152d06ea` and `26a56832dbb7dfdc0ca213e4b09e13d9643d994e` instead of the raw GitHub merge SHAs `9b728437a61a3ed5880d4c0863a213a5b6dd87bb` (PR #127) and `26a568307b35d14e53570079276b20406f5daccf` (PR #128), and cited an incorrect final main SHA string.

### 1.2 Raw Authoritative Truth Table

| Entity | PR | Base SHA | Candidate Head SHA | Review ID & Head Binding | Real GitHub Merge SHA | CI Run ID & Conclusion |
|---|---|---|---|---|---|---|
| **Auth Manifest** | #122 | `260028060b8252745ffbe169195a91a58ea09fd3` | `1a00602e2550eb6aa77b9f05ecf7c0749f111fe9` | `4947368105` (`1a00602...`) | `0d7acbf0c6f056c3f169e2200e58f785f8e2e3d9` | `31973917528` (`success`) |
| **Activation** | #123 | `0d7acbf0c6f056c3f169e2200e58f785f8e2e3d9` | `2ec0da99d2880ab4d4dacb17edcc282102b5c885` | `4947382360` (`2ec0da9...`) | `d278f2045b38299b056f16ec7d76fb81c0739541` | `31974278453` (`success`) |
| **Historical Impl** | #125 | `d278f2045b38299b056f16ec7d76fb81c0739541` | `900405f39badaaf4fdfd0441ed9a05451ade34eb` | *ABSENT* | `3c90ebd10b9559c8ec2090a3226c7b8d11cd092f` | `31975164283` (`success`) |
| **Historical Status**| #126 | `3c90ebd10b9559c8ec2090a3226c7b8d11cd092f` | `17f43ebf53901f4779d33a8bea7d07408dd8a028` | *ABSENT* | `4e83d38c4db8fdfda6cfaba6c176231942dabb12` | `31975782099` (`success`) |
| **Recovery Auth** | #127 | `4e83d38c4db8fdfda6cfaba6c176231942dabb12` | `4bcc4d8e54eba589bac930f8f4740c77a3a3378c` | `4948153412` (`4bcc4d8...`) | `9b728437a61a3ed5880d4c0863a213a5b6dd87bb` | `31989948907` (`success`) |
| **Reval (Defective SHA)** | #128 | `9b728437a61a3ed5880d4c0863a213a5b6dd87bb` | `8e0fc3a0e8ebc5a5c22c7095901d4347225d0041` | `4948169973` (`8e0fc3a...`) | `26a568307b35d14e53570079276b20406f5daccf` | `31990417008` (`success`) |
| **Status (Defective SHA)**| #129 | `26a568307b35d14e53570079276b20406f5daccf` | `5f3fa5aa2920b103d19011ac90101275cb817310` | `4948195979` (`5f3fa5a...`) | `2fc37a2ad3c61b99a88322199c5b1462522e5459` | `31990743140` (`success`) |

---

## 2. Invariants & Scope Boundaries

### 2.1 Universal Invariants
1. `SOURCE_MUTATION_ALLOWED`: **NO** (Zero source code edits).
2. `TEST_MUTATION_ALLOWED`: **NO** (Zero test code edits).
3. `DEPENDENCY_MUTATION_ALLOWED`: **NO** (`package.json` and lockfiles locked).
4. `HISTORY_REWRITE_FORBIDDEN`: **STRICT** (No rebase, no amend, no force-push).
5. `W3_EXECUTION_AUTHORITY`: **NOT_GRANTED** (`W3` remains `NOT_AUTHORIZED` until exact-SHA recovery is canonically closed).
6. `CURRENT_CODE_RETENTION`: **PROVISIONAL** (Retained on `main` at `2fc37a2ad3c61b99a88322199c5b1462522e5459`).

### 2.2 Authorized Actions
This manifest authorizes strictly:
1. Authoring and auditing corrected prospective current-code revalidation record `STAGE2-W2-IELTS-LIS-REVALIDATION-002.md`;
2. Authoring and auditing corrected final status ledger `docs/IMPLEMENTATION_STATUS.md`;
3. Conditional mechanical docs-only merges upon independent audit `ACCEPT`.

---

## 3. Conditional Merge Authority Declarations

### 3.1 Provenance Recovery Authorization Merge Authority
$$\text{PROVENANCE\_AUTH\_MERGE\_AUTHORITY} = \mathbf{CONDITIONALLY\_GRANTED}$$
Granted to the Independent Authorization Auditor **ONLY IF**:
1. Fresh independent audit verdict = `ACCEPT`;
2. Formal `ACCEPT` review is persisted to PR and read back;
3. Candidate head matches audited SHA;
4. Base commit is `2fc37a2ad3c61b99a88322199c5b1462522e5459`;
5. Natural exact-head CI concludes `SUCCESS`;
6. Exactly ONE changed file: `docs/authorizations/STAGE2-W2-IELTS-LIS-PROVENANCE-RECOVERY-AUTH-001.md`;
7. Zero substantive findings.

### 3.2 Corrected Revalidation Record Merge Authority
$$\text{REVALIDATION\_002\_MERGE\_AUTHORITY} = \mathbf{CONDITIONALLY\_GRANTED}$$
Granted to the Independent Revalidation Auditor **ONLY IF**:
1. Fresh independent revalidation audit verdict = `ACCEPT`;
2. Formal `ACCEPT` review is persisted to PR and read back;
3. Candidate head matches audited SHA;
4. Base commit matches the merge commit of this authorization manifest;
5. Natural exact-head CI concludes `SUCCESS`;
6. Exactly ONE changed file: `docs/authorizations/STAGE2-W2-IELTS-LIS-REVALIDATION-002.md`;
7. Zero substantive findings.

### 3.3 Corrected Final Status Merge Authority
$$\text{FINAL\_STATUS\_MERGE\_AUTHORITY} = \mathbf{CONDITIONALLY\_GRANTED}$$
Granted to the Independent Status Auditor **ONLY IF**:
1. Fresh independent status audit verdict = `ACCEPT`;
2. Formal `ACCEPT` review is persisted to PR and read back;
3. Candidate head matches audited SHA;
4. Base commit matches the merge commit of the corrected revalidation record;
5. Natural exact-head CI concludes `SUCCESS`;
6. Exactly ONE changed file: `docs/IMPLEMENTATION_STATUS.md`;
7. Zero substantive findings.

**Merge Method for All Transactions:** Normal Merge Commit (`--merge`).
