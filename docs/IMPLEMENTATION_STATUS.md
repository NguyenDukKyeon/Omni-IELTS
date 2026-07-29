# VocabMaster — Implementation Status

Last audited: 2026-07-30, P0-02 independently accepted

Audited source commit: 2025b6320c8d72f116fbc2c0a9dcb4ae884697b6

Baseline predecessor branch: codex/implementation-roadmap at 547e5d665adbf102c15b65ac39def185769e5626

Active implementation branch: codex/phase-0-release-safety
Scope of this update: governance/kickoff baseline, P0-00 Acceptance harness, P0-01 Evidence contract và P0-02 Core schedule gateway. P0-03 bắt đầu; Phase 0 product gate vẫn đỏ.

## 1. Provenance status

| Item | Status | Evidence / action |
|---|---|---|
| User-provided AGENTS.md | ACTIVE | Instructions in the current task are applied |
| Repository AGENTS.md | ACTIVE | Invariant/test/migration/evidence/data/Git rules đã được codify trước source change |
| docs/ROADMAP.md | CANONICAL | Nguồn chính thức cho Phase 0–7 và dependency |
| Accepted Phase 0–7 roadmap | RECONCILED | ROADMAP, plan, status và decisions có vai trò không chồng lấn |
| Current implementation baseline | VERIFIED | Exact commit above, clean before documentation edits |

Hard stop: nếu roadmap/dependency thay đổi vật chất, không tiếp tục source cho đến khi ROADMAP, IMPLEMENTATION_PLAN, IMPLEMENTATION_STATUS và DECISIONS được reconcile theo ADR mới.

## 2. Kickoff baseline verification matrix

| Command | Result | Notes |
|---|---|---|
| node --version | PASS | v24.15.0; Windows NT 10.0.26200.0 |
| npm ci --no-audit --no-fund | PASS | 36 packages installed |
| npm test | PASS | 106/106; 0 skipped/todo |
| npm run check | PASS | Static checks passed |
| npm run audit:roadmap | PASS | 12/12 existing gates; not sufficient behavioral acceptance |
| npm run audit:ielts | PASS | 11/11 existing gates; not sufficient behavioral acceptance |
| npm run test:v10 | PASS | 28/28 |
| npm run audit:v10 | PASS | 55/55 existing checks; several are shape/source checks |
| npm run build | PASS | Build completed; app.js output about 456.5 kB |
| npm run test:serve | PASS | Server smoke |
| npm run test:preview | PASS | Preview smoke |
| npm run test:browser | PASS | Passed in this run |
| npm run test:ielts-browser | PASS_ONCE / SUSPECT_FLAKY | Current run passed; earlier audited run failed at Retell, therefore P0-00 must repeat and keep product diagnostics |
| npm run test:v10-browser | FAIL | Browser discovery omits available Windows Chrome/Edge paths |
| npm run test:hardening | PASS_ONCE / SUSPECT_FLAKY | Current run passed; earlier audited run hit cleanup EBUSY, therefore bounded retry + cleanup verification remain required |

Ports 3000, 3010, 5692 and 4173 were verified empty after the run. V10 browser discovery still fails, and one-off passes do not close earlier flaky evidence; the release baseline is not Phase 0 accepted.

### P0-00 acceptance evidence

Accepted source commit: `33616e5e03ef3684b0afdbdf6e328ef45bb5cfc4`.

| Evidence | Actual result |
|---|---|
| `npm run test:browser-harness` | PASS 12/12; deterministic Windows/macOS/Linux discovery, no skip path, isolated profile, bounded EBUSY retry, failure classification and POSIX process-group cleanup checks |
| `npm run test:ielts-browser` | PASS after every blocked YouTube iframe rerender was deterministically settled; learner Retell attempt and lexical gap were read back from IndexedDB |
| `npm run check` | PASS after reviewer fixes |
| `npm run phase0:harness` | Earlier complete run PASS 5/5; repeated run later stopped on a reproducible V10 product race, not an infrastructure/cleanup error |
| `npm run phase0:gate` | Non-browser unit/static/audit/build/server/preview gates PASS; browser gate correctly stopped on V10 `sentence-learning-loop.js` session lifecycle `TypeError` and reported `PRODUCT_FAILURE` |
| Cleanup verification | Ports 3000, 3001, 3010, 9333, 9334, 9344 and 9555 empty; all task-owned `vocab-*-smoke-*` temp profiles removed after pass and fail |
| Independent review | ACCEPTED; no P0/P1 finding after fixes for rerendered iframe race, POSIX descendant cleanup and CDP/transport classification |

P0-00 has no data migration. Rollback is removal of the shared helper, gate scaffold and browser-suite integration. Acceptance here means the harness is trustworthy; it does not turn the known V10 product failure green. That failure remains owned by P0-03 and keeps the Phase 0 hard gate red.

### P0-01 acceptance evidence

Accepted source commit: `0ec315f7a77e2fac6bad71a548b6ccc71961687b`.

| Evidence | Actual result |
|---|---|
| Focused EvidencePolicy/IELTS/V10 tests | PASS 38/38 |
| `npm test` | PASS 128/128; 0 skipped/todo |
| `npm run audit:ielts` | PASS 11/11 |
| `npm run audit:v10` | PASS 55/55 |
| `npm run check` | PASS |
| Adversarial matrix | Default deny for missing legacy provenance, unknown activity/result, wrong target/skill/source/revision, incomplete assistance trace, reveal/hint/transcript/correction/exposed retry, unverified source/evaluator, Retell without output/target use and receipt collisions |
| Independent review | ACCEPTED; no P0/P1 after receipt binding covered every normalized decision input |

P0-01 is an additive contract migration: legacy records without canonical Attempt, complete AssistanceTrace and authority-bound verification receipts are ineligible. Rollback may stop enforcing the new contract but must not delete policy metadata/receipts. Runtime schedule enforcement remains owned by P0-02/P0-03, so the full product gate is intentionally still red.

### P0-02 acceptance evidence

Accepted source commit: `2025b6320c8d72f116fbc2c0a9dcb4ae884697b6`.

| Evidence | Actual result |
|---|---|
| Focused gateway/persistence/compatibility tests | PASS 21/21 after final reviewer fixes |
| `npm test` | PASS 136/136; 0 skipped/todo |
| `npm run check` | PASS |
| `npm run audit:roadmap` | PASS 12/12 |
| `npm run build` | PASS; production bundle built successfully |
| `npm run test:browser` | PASS with deterministic Chrome discovery and verified cleanup |
| Persistence boundary | PASS: full evidence envelope is re-evaluated; forged decisions and receipt collisions fail closed; identical receipt is idempotent |
| Unlock boundary | PASS: only successful qualified evidence marks skill success; qualified `Again` persists as failure and cannot unlock |
| Legacy outbox compatibility | PASS: terminal legacy review rows are durably quarantined, surfaced and do not block later valid writes |
| Independent review | ACCEPTED after both P1 findings (outbox head-of-line blocking and missing reconciliation/calibration metadata) were fixed |

P0-02 does not rewrite legacy learning history. New qualified-evidence markers and review metadata are additive; legacy review/outbox rows without canonical evidence stay fail-closed and are preserved in quarantine rather than silently dropped. Rollback may disable the Core gateway code path but must preserve evidence envelopes, reason metadata and quarantine records.

## 3. Confirmed blockers

| ID | Severity | Blocker | Required owner package |
|---|---|---|---|
| B-003 | P0/High | IELTS/Error repair can expose correction before an “independent” retry | P0-03 |
| B-004 | P0/High | V10 Retell does not persist/evaluate learner output; current IELTS Retell browser path fails | P0-03, later P3-04 |
| B-005 | P0/Critical | Backup omits V10 and some Core durable stores such as drafts/outbox | P0-04 |
| B-006 | P0/Critical | Cross-DB restore is not crash-atomic; RAM fallback can look successful | P0-05 |
| B-007 | P0/High | Legacy and V10 Capture/Inbox both mount; async Quick Capture is unsafe | P0-06 |
| B-008 | P0/High | Multiple Today surfaces; exact plan target can be discarded by launcher | P0-07 |
| B-010 | P1/High | Three DBs and several cross-DB writes lack a shared migration/saga/reconciler model | P1-00, P1-03 |
| B-011 | P2/High | Transcript resolver is range/cache-RAM based, reparses weakly and lacks durable jobs | P2-00–P2-06 |
| B-012 | P3/Critical | Dictation answer remains in transcript rail DOM/a11y surface | P3-03 |
| B-013 | P4/Critical | Content packs lack immutable signed catalog, transactional install and full rights workflow | P4-00–P4-10 |
| B-014 | P5/Critical | Cloud fallback consent/shared-cache policy and local process safety are not production-ready | P5-00–P5-05 |
| B-015 | P7/High | Metrics/calibration are too weak for safe personalization or FSRS tuning | P7-00–P7-05 |

Resolved at the current audited commit: B-001, B-002 and B-009. Core schedule writes are policy-gated and receipt-bound, skill unlock is based on successful qualified evidence, and the browser harness remains independently accepted.

## 4. Phase status

| Phase | Status | Entry gate | Exit state |
|---|---|---|---|
| Phase 0 — Containment and Release Safety | IMPLEMENTING / RED | Baseline audit complete | Not met |
| Phase 1 — Core Product Unification | BLOCKED_BY_PHASE_0 | P0-08 ACCEPTED | Not started |
| Phase 2 — Caption-first Resolver | BLOCKED_BY_PHASE_1 | P1-08 ACCEPTED | Not started |
| Phase 3 — Full-video Workspace | BLOCKED_BY_PHASE_2 | P2-06 ACCEPTED | Not started |
| Phase 4 — Remote Content Platform | BLOCKED_BY_PHASE_1 | P1 contracts accepted; production activation also needs platform packages | Not started |
| Phase 5 — ASR/Cloud Fallback | BLOCKED_BY_PHASE_2 | P2-06 and policy approval | Not started |
| Phase 6 — Content Factory/Scale | BLOCKED_BY_PHASE_4 | P4-10 ACCEPTED | Not started |
| Phase 7 — Measurement/Personalization | BLOCKED | Clean event model; rollout also needs content/outcomes | Not started |

## 5. Package ledger

Status vocabulary:

- NEXT: package recommended to open next.
- PLANNED: definition exists but predecessor has not yet been accepted.
- PHASE_BLOCKED: phase entry gate is not met.
- IN_PROGRESS: implementation branch is active.
- READY_FOR_ACCEPTANCE: implementer completed work; independent acceptance pending.
- ACCEPTED: all package criteria independently verified at an exact commit.
- BLOCKED: stop condition hit.

### Phase 0

Phase branch/PR: `codex/phase-0-release-safety`; P0-00…P0-08 là commit/package nội bộ.

| Package | Commit unit | Dependency | Status |
|---|---|---|---|
| P0-00 Acceptance harness | P0-00 | Baseline | ACCEPTED @ `33616e5` |
| P0-01 Evidence contract | P0-01 | P0-00 | ACCEPTED @ `0ec315f` |
| P0-02 Core evidence gateway | P0-02 | P0-01 | ACCEPTED @ `2025b63` |
| P0-03 IELTS/V10 containment | P0-03 | P0-01 | IN_PROGRESS |
| P0-04 Backup envelope | P0-04 | P0-00 | PLANNED |
| P0-05 Restore safety | P0-05 | P0-04 | PLANNED |
| P0-06 Capture containment | P0-06 | P0-00, P0-05 | PLANNED |
| P0-07 Today containment | P0-07 | P0-00, P0-01 | PLANNED |
| P0-08 Phase 0 exit gate | P0-08 | P0-02, P0-03, P0-05, P0-06, P0-07 | PLANNED |

### Phase 1

| Package | Branch | Dependency | Status |
|---|---|---|---|
| P1-00 Migration ledger | codex/p1-00-migration-ledger | P0-08 | PHASE_BLOCKED |
| P1-01 Learning contracts | codex/p1-01-learning-contracts | P1-00 | PHASE_BLOCKED |
| P1-02 Event repositories | codex/p1-02-event-repositories | P1-01 | PHASE_BLOCKED |
| P1-03 Cross-DB reconciler | codex/p1-03-cross-db-reconciler | P1-02 | PHASE_BLOCKED |
| P1-04 Unified Capture | codex/p1-04-unified-capture | P1-03 | PHASE_BLOCKED |
| P1-05 Transcript aggregate | codex/p1-05-transcript-aggregate | P1-02 | PHASE_BLOCKED |
| P1-06 Error Repository | codex/p1-06-error-repository | P1-02, P1-05 | PHASE_BLOCKED |
| P1-07 Today Composer | codex/p1-07-today-composer | P1-02, P1-04, P1-06 | PHASE_BLOCKED |
| P1-08 Today Runner/cutover | codex/p1-08-today-runner-cutover | P1-07 | PHASE_BLOCKED |

### Phase 2

| Package | Branch | Dependency | Status |
|---|---|---|---|
| P2-00 Resolver contract | codex/p2-00-resolver-contract | P1-05, P1-08 | PHASE_BLOCKED |
| P2-01 Resolver jobs/SSE | codex/p2-01-resolver-jobs | P2-00 | PHASE_BLOCKED |
| P2-02 yt-dlp adapter | codex/p2-02-ytdlp-adapter | P2-01 | PHASE_BLOCKED |
| P2-03 Whole-track cache | codex/p2-03-whole-track-cache | P2-02 | PHASE_BLOCKED |
| P2-04 Caption normalizer | codex/p2-04-caption-normalizer | P2-03 | PHASE_BLOCKED |
| P2-05 Progressive client | codex/p2-05-progressive-client | P2-01, P2-04 | PHASE_BLOCKED |
| P2-06 Resolver exit gate | codex/p2-06-resolver-exit-gate | P2-05 | PHASE_BLOCKED |

### Phase 3

| Package | Branch | Dependency | Status |
|---|---|---|---|
| P3-00 Workspace shell | codex/p3-00-workspace-shell | P2-06 | PHASE_BLOCKED |
| P3-01 Progressive rail | codex/p3-01-progressive-rail | P3-00 | PHASE_BLOCKED |
| P3-02 Visible transcript modes | codex/p3-02-visible-transcript-modes | P3-01 | PHASE_BLOCKED |
| P3-03 Dictation masking | codex/p3-03-dictation-masking | P3-01, EvidencePolicy | PHASE_BLOCKED |
| P3-04 Real Retell | codex/p3-04-real-retell | P3-03, event repositories | PHASE_BLOCKED |
| P3-05 Transcript editor | codex/p3-05-transcript-editor | P1-05, P3-01 | PHASE_BLOCKED |
| P3-06 Workspace exit gate | codex/p3-06-workspace-exit-gate | P3-02–P3-05 | PHASE_BLOCKED |

### Phase 4

| Package | Branch/repository | Dependency | Status |
|---|---|---|---|
| P4-00 Content contracts | codex/p4-00-content-contracts | P1-01, P1-05 | PHASE_BLOCKED |
| P4-01 Remote catalog | codex/p4-01-remote-catalog | P4-00, staging/key runbook | PHASE_BLOCKED |
| P4-02 Pack Installer | codex/p4-02-pack-installer | P4-01, P1-00 | PHASE_BLOCKED |
| P4-03 Pack lifecycle | codex/p4-03-pack-lifecycle | P4-02 | PHASE_BLOCKED |
| P4-04 Content repo scaffold | VocabMaster-content/codex/p4-04-content-repo-scaffold | P4-00, external provisioning | PHASE_BLOCKED |
| P4-05 Sampler | VocabMaster-content/codex/p4-05-sampler | P4-04, P4-01 staging | PHASE_BLOCKED |
| P4-06 Foundations Week 1 | VocabMaster-content/codex/p4-06-foundations-week-1 | P4-05 | PHASE_BLOCKED |
| P4-07 Foundations Week 2 | VocabMaster-content/codex/p4-07-foundations-week-2 | P4-06 | PHASE_BLOCKED |
| P4-08 Foundations Week 3 | VocabMaster-content/codex/p4-08-foundations-week-3 | P4-07 | PHASE_BLOCKED |
| P4-09 Foundations Week 4 | VocabMaster-content/codex/p4-09-foundations-week-4 | P4-08 | PHASE_BLOCKED |
| P4-10 Content exit gate | codex/p4-10-content-platform-exit | P4-03, P4-09 | PHASE_BLOCKED |

### Phase 5

| Package | Branch | Dependency | Status |
|---|---|---|---|
| P5-00 Fallback policy | codex/p5-00-fallback-policy | P2-06 | PHASE_BLOCKED |
| P5-01 Local companion | codex/p5-01-local-companion | P5-00 | PHASE_BLOCKED |
| P5-02 Local ASR | codex/p5-02-local-asr | P5-01 | PHASE_BLOCKED |
| P5-03 ASR resume/cleanup | codex/p5-03-asr-resume | P5-02, P2-04 | PHASE_BLOCKED |
| P5-04 Gemini opt-in | codex/p5-04-gemini-opt-in | P5-00, resolver jobs | PHASE_BLOCKED |
| P5-05 Fallback exit | codex/p5-05-fallback-exit | P5-03, P5-04 | PHASE_BLOCKED |

### Phase 6

| Package | Branch/repository | Dependency | Status |
|---|---|---|---|
| P6-00 Factory jobs | VocabMaster-content/codex/p6-00-factory-jobs | P4-10 | PHASE_BLOCKED |
| P6-01 Batch validator | VocabMaster-content/codex/p6-01-batch-validator | P6-00 | PHASE_BLOCKED |
| P6-02 Review publisher | VocabMaster-content/codex/p6-02-review-publisher | P6-01 | PHASE_BLOCKED |
| P6-03 Content defects | codex/p6-03-content-defects | P6-02, P4-03 | PHASE_BLOCKED |
| P6-04 Scale canary | VocabMaster-content/codex/p6-04-scale-canary | P6-02, P6-03 | PHASE_BLOCKED |
| P6-05 Scale gate | VocabMaster-content/codex/p6-05-scale-gate | P6-04 | PHASE_BLOCKED |

### Phase 7

| Package | Branch | Dependency | Status |
|---|---|---|---|
| P7-00 Metrics reducer | codex/p7-00-metrics-reducer | P1-02, P1-08 | PHASE_BLOCKED |
| P7-01 Honest Progress | codex/p7-01-honest-progress | P7-00 | PHASE_BLOCKED |
| P7-02 GoalProfile | codex/p7-02-goal-profile | P7-00, P4-10, P2-06 | PHASE_BLOCKED |
| P7-03 Outcomes/calibration | codex/p7-03-outcomes-calibration | P7-00, mature clean cohort | PHASE_BLOCKED |
| P7-04 Workload recommender | codex/p7-04-workload-recommender | P7-02, P7-03, P4-10, P6-05 | PHASE_BLOCKED |
| P7-05 Personalization exit | codex/p7-05-personalization-exit | P7-04, adequate baseline cohort | PHASE_BLOCKED |

## 6. Phase 0 exit checklist

- [ ] One central default-deny EvidencePolicy guards every schedule write.
- [ ] Again/failure and assisted/unverified attempts cannot unlock or create positive review evidence.
- [ ] Retell is real and persisted, or clearly coaching-only/disabled.
- [ ] Backup registry classifies every Core/IELTS/V10 store.
- [ ] Export→reset→restore→restart sentinel count/digest matches every durable store.
- [ ] Failure injection cannot leave mixed restore state presented as success.
- [ ] Durable write failure never silently falls back to RAM success.
- [ ] Quick Capture survives submit failure/reload and only one Inbox is visible.
- [ ] Only one Today is visible and every launch preserves exact card/skill/source.
- [x] Browser discovery/cleanup is deterministic and critical assertions cannot skip.
- [ ] Full phase0:gate passes three consecutive clean runs at one exact commit.
- [ ] Independent reviewer records P0-08 ACCEPTED.

Phase 1 authorization condition:

P1-00 remains PHASE_BLOCKED until every checkbox above is checked and P0-08 is independently ACCEPTED. “Mostly green”, a manual demo, or an implementer report does not satisfy this condition.

## 7. Next package

Current package: P0-03 IELTS/V10 evidence containment.

Phase branch: `codex/phase-0-release-safety`.

P0-00 through P0-02 are independently accepted at their exact source commits. P0-03 is active. No Phase 1 work is authorized.
