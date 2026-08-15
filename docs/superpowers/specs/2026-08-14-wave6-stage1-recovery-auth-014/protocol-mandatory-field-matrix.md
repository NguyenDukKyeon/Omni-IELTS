# Protocol Mandatory Field Matrix — W6-STAGE1-RECOVERY-AUTH-014

Protocol: `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`
Scope: Wave 6 Stage 1 R3 (Frozen Assessment) + R4 (Targeted Diagnostic) sequential recovery

| Mandatory Protocol Field | W6-ASM-00-014 (R3) | W6-TD-00-014 (R4) |
|---|---|---|
| **Canonical owner** | `ASM-00` Frozen Assessment runtime & durability | `TD-00` Targeted Diagnostic adapter |
| **Designated writer** | `W6-STAGE1-EXECUTOR-014 / ONE_WRITER_EXCLUSIVE` | `W6-STAGE1-EXECUTOR-014 / ONE_WRITER_EXCLUSIVE` |
| **Exact technical predecessor** | R2-C2 `2dc10d86a6440efe1c4d8c3dc925923a27977248` | Exact R3-C4 head produced under AUTH-014 |
| **Dependency state** | Technical R1 (WeaknessProfile) + technical R2 (Focus Today); QAR question authority; LI execution authority | Technical R1, R2, R3 outputs on replacement branch; ASM-00 is sole durable assessment owner |
| **Branch / PR topology** | Branch `codex/w6-stage1-recovery-exec-014`; 1 Draft PR to `main` | Same branch `codex/w6-stage1-recovery-exec-014`; same Draft PR |
| **Exact allowlists** | **A4**: `tests/wave6-frozen-assessment.test.mjs`<br>**B4**: `src/frozen-assessment-contracts.js`, `src/frozen-assessment-runtime.js`, `src/question-activity-contracts.js`, `src/ielts-domain.js`, `src/ielts-persistence.js`, `src/backup-registry.js`<br>**C4**: `docs/superpowers/specs/2026-08-14-wave6-stage1-exec-014/w6-asm-00-014-evidence-v1.md` | **A4**: `tests/wave6-targeted-diagnostic.test.mjs`<br>**B4**: `src/targeted-diagnostic.js`<br>**C4**: `docs/superpowers/specs/2026-08-14-wave6-stage1-exec-014/w6-td-00-014-evidence-v1.md` |
| **Global exclusions** | Second scheduler, second QAR registry/owner, AI key/scoring authority, FSRS/EvidencePolicy write, representative/band/readiness/mastery claims, workflow/CI mutation | Second store/runtime/scheduler, representative/band/readiness/mastery claims, schedule/evidence authority, workflow/CI mutation |
| **Baseline CI** | Natural CI #391 / run `31771748853` on R2-C2 (SUCCESS) | Exact R3-C4 natural exact-head CI (SUCCESS) |
| **RED eligibility** | Authentic QAR registration + supports/hasExecutor healthy + IELTS backup healthy, then absence of Frozen Assessment capability fails | Valid WeaknessProfile v1 + QAR + Frozen Assessment runtime healthy, then absence of createTargetedDiagnosticAdapter fails |
| **RED invalidation** | Prerequisite failure, uncaught module error, syntax error, fixture/infra failure, source change, wrong parent | Prerequisite failure, uncaught module error, syntax error, fixture/infra failure, source change, wrong parent |
| **Minimal GREEN** | Single Frozen Assessment owner; additive IELTS DB 3->4, backup 3->4, registry 5->6, store `frozenAssessments` | Single weakness-biased sampling adapter over Frozen Assessment; no second store/runtime |
| **Verification profile** | `node --test tests/wave6-frozen-assessment.test.mjs tests/qar-00-question-activity-contracts.test.mjs tests/ielts-persistence.test.mjs tests/backup-registry.test.mjs tests/migration-ledger.test.mjs tests/restore-safety.test.mjs` + all shared PR GREEN gates | `node --test tests/wave6-targeted-diagnostic.test.mjs tests/progress.test.mjs tests/wave6-frozen-assessment.test.mjs` + all shared PR GREEN gates |
| **Evidence schema & path** | Schema V1; `docs/superpowers/specs/2026-08-14-wave6-stage1-exec-014/w6-asm-00-014-evidence-v1.md`; authority `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` | Schema V1; `docs/superpowers/specs/2026-08-14-wave6-stage1-exec-014/w6-td-00-014-evidence-v1.md`; authority `IMPLEMENTER_EVIDENCE / NOT_ACCEPTANCE` |
| **Migration & rollback** | Forward-only additive IELTS DB `3 -> 4`, IELTS backup `3 -> 4`, registry `5 -> 6`, store `frozenAssessments`. Rollback: discard chain before merge; disable producers retaining store after merge | Migration `NONE`. Rollback: discard chain before merge; disable adapter retaining ASM store after merge |
| **Stop conditions** | Authority/predecessor drift, overlap, second writer, invalid RED, GREEN failure, infrastructure failure, artifact contradiction, self-acceptance | Unresolved R3-C4 baseline, overlap, second writer, invalid RED, GREEN failure, infrastructure failure, artifact contradiction, self-acceptance |
| **Integration rule** | `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED` | `MECHANICAL_INTEGRATION_PREAUTHORIZATION: NOT_GRANTED` |
| **Acceptance authority** | Independent Final Batch Audit required; executor cannot accept | Independent Final Batch Audit required; executor cannot accept |

