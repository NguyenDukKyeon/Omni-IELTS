# Wave 6 Stage 1 Canonical Integration Specification

Authorization ID: `W6-STAGE1-INTEGRATION-AUTH-001`
Target PR: `#78` (`NguyenDukKyeon/VocabMaster#78`)
Target Branch: `codex/w6-stage1-recovery-exec-014`
Target Head: `81428f28fac8a8e34ab35126a028d16659199def`
Target Base: `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`

---

## 1. Technical Baseline & Heritage

Wave 6 Stage 1 has been developed and verified across a strictly linear, 12-commit sequence on branch `codex/w6-stage1-recovery-exec-014`:

1. `a76e8c235249c5c97d8aafd99fa2c2303f7c9cb9` (R1-A Test — RED CI `31761545750`)
2. `319462d22753958aa5da766642c763a79d3ac667` (R1-B Source — GREEN CI `31762977651`)
3. `c14047c74ff6499e70e06617f23b4f7161685cb2` (R1-C Evidence — SUCCESS CI `31763393330`)
4. `d1282afbdb4bec38626964438760a91c6214d0d5` (R2-A2 Test — RED CI `31771384877`)
5. `c84f243b4550c786082f46e9fae837b278fc3133` (R2-B2 Source — GREEN CI `31771537006`)
6. `2dc10d86a6440efe1c4d8c3dc925923a27977248` (R2-C2 Evidence — SUCCESS CI `31771748853`)
7. `2d6826fc535d74ca09a80e9f0c552346c378e72c` (R3-A4 Test — RED CI `31777814511`)
8. `8caba90eb559141cc8cab080b4ad19061ca2ab4b` (R3-B4 Source — GREEN CI `31778815007`)
9. `7a4389035ddb9271f6644af80aaed9513d5241e1` (R3-C4 Evidence — SUCCESS CI `31779009316`)
10. `8385e4dd1e39c3df19717acee5ea79a98d2a59c5` (R4-A4 Test — RED CI `31779363939`)
11. `c4070cd1c64893f99fdbba8e56707530ee5d47fa` (R4-B4 Source — GREEN CI `31779714267`)
12. `81428f28fac8a8e34ab35126a028d16659199def` (R4-C4 Evidence / Candidate Head — SUCCESS CI `31779904619`)

Independent Batch Audit comment `5290883787` verified and accepted all four technical packages individually with zero defects.

---

## 2. Preconditions to Freeze (Fail-Closed Gates)

Before applying any mechanical merge command, the auditor must fresh-verify:
- [ ] PR #78 head == `81428f28fac8a8e34ab35126a028d16659199def`
- [ ] Comment `5290883787` is present and intact
- [ ] Verdicts for R1, R2, R3, R4 are all `ACCEPT`
- [ ] Batch conclusion is `STAGE1_TECHNICAL_ACCEPT`
- [ ] Run `31779904619` is `SUCCESS` (Artifact `9211289240`)
- [ ] Base branch `main` is `c6d790e0f85bdc9120aa99e5dbc972b955382ce4`
- [ ] Zero merge conflicts / mergeable status is `MERGEABLE`
- [ ] Zero active execution branches / zero path overlap
- [ ] Zero commit modifications on PR #78

---

## 3. Deterministic Integration Commands

```bash
# 1. Verify PR #78 state and head
gh pr view 78 --json number,headRefOid,baseRefOid,mergeable,state

# 2. Mark Ready if required by repository policy
gh pr ready 78

# 3. Merge PR #78 at exact head SHA
gh pr merge 78 --merge --match-head-commit 81428f28fac8a8e34ab35126a028d16659199def

# 4. Read back resulting canonical main
git fetch origin main
git log -n 1 --stat origin/main
```

---

## 4. Post-Merge Verification & Non-Claims

1. Confirm PR #78 is `MERGED`.
2. Confirm resulting merge commit on `main` contains the exact 12-commit history.
3. Observe natural CI execution on `main` following merge.
4. Conclude Wave 6 Stage 1 integration closure.
5. Wave 6 Stage 1.5 and Stage 2 remain strictly UNAUTHORIZED.
