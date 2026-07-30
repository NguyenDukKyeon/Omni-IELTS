# VocabMaster — Implementation Status

Last audited: 2026-07-30, PR #8 remediation recheck exposed a Today render race

Audited source commit: 67c5a275a450a8b88d2daf54e299538358bf8f00

Baseline predecessor branch: codex/implementation-roadmap at 547e5d665adbf102c15b65ac39def185769e5626

Active implementation branch: codex/implementation-roadmap (PR #8 integration head)
Scope of this update: Phase 0 was independently accepted on Windows, but PR #8 CI run 248 exposed a host-dependent Windows browser-path construction defect in P0-00. That fix passed the hard gate and independent review. A required pre-push gate on the documentation head then exposed a concurrent Today render/status race in P0-07; Phase 0 is reopened until that product-path race is fixed and the cumulative exact source commit is reaccepted. Phase 1 has not started.

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

### P0-03 acceptance evidence

Accepted source commit: `12b1cf8488fcacf4369a91e8b89a52dc93171f1f`.

| Evidence | Actual result |
|---|---|
| Focused IELTS/V10 containment tests | PASS 34/34 |
| `npm test` | PASS 142/142; 0 skipped/todo |
| `npm run check` | PASS |
| `npm run audit:ielts` | PASS 11/11 |
| `npm run audit:v10` | PASS 55/55 |
| `npm run build` | PASS; production bundle built successfully |
| `npm run test:ielts-browser` | PASS: IELTS Dictation/Retell create no Core review event; evaluator 503 keeps a durable failed coaching attempt; successful Retell persists learner output and no fabricated evaluation receipt |
| `npm run test:v10-browser` | PASS: empty Retell cannot complete; Skip is explicit; coaching output survives reload; stale cross-run save cannot overwrite the active run; double-click advances exactly one sentence |
| Evidence boundary | PASS: IELTS/V10 coaching envelopes are canonical and default-denied; caller cannot override V10 coaching/collector/completeness; revealed correction and unverified transcript never schedule |
| Independent review | ACCEPTED after four P1 findings were fixed; reviewer independently reran unit/static/audit/build/browser gates and found no remaining P0/P1 |

P0-03 is an additive compatibility migration. Existing V10 `completed` progress without a durable learner output normalizes to `unverified`; explicit new `skipped` and `coaching-completed` states remain distinct. Existing attempts are not deleted. IELTS Retell now persists a stable coaching attempt as `pending` before evaluator I/O and updates the same ID to `completed` or `failed`. Rollback may hide the contained UI or stop reading new fields, but must retain learner output, evidence envelopes and evaluation status/error records.

### P0-04 acceptance evidence

Accepted source commit: `ffca938b6067e800ae21c5c9231a0b2b811a30de`.

| Evidence | Actual result |
|---|---|
| `npm run test:backup` | PASS 5/5: physical registry coverage, every-durable-store sentinel, canonical determinism, SHA-256 payload/store digests, cache/secret/binary exclusion, corrupt/future schema rejection and legacy dual-read |
| `npm test` | PASS 147/147; 0 skipped/todo |
| `npm run test:v10` | PASS 31/31 after the imported-transcript provenance fix |
| `npm run check` | PASS |
| `npm run audit:roadmap` | PASS 12/12 |
| `npm run audit:ielts` | PASS 11/11 |
| `npm run audit:v10` | PASS 55/55 |
| `npm run build` | PASS; production bundle built successfully |
| Durable inventory | PASS: registry matches 8 Core, 12 IELTS and 14 V10 object stores; 32 store policies export durable data and two whole-store caches/capabilities are excluded |
| Mixed-store policy | PASS: imported transcripts and private content remain complete; provider transcript bodies and remote content bodies become reconstruction stubs with SHA-256; migration ledgers remain while known operational/cache metadata is excluded |
| Independent review | Initial `ce3244a` review rejected one P1 provenance inversion. Fix `ffca938` preserves `provider: imported` across a local cache read; symmetric imported/provider probe passed and reviewer recorded ACCEPTED with zero remaining P0/P1 |

P0-04 changes only the portable export contract. Full backup schema v2 is canonical and fail-closed; Core v3, IELTS v1 and combined v1 readers remain available. vNext restore is deliberately blocked with `VNEXT_STAGED_RESTORE_REQUIRED` until P0-05 supplies stage/journal/rollback/reopen verification. No database version was raised, no store was deleted and rollback code may ignore a v2 file only by reporting the newer schema explicitly; it must never reinterpret it as an empty legacy backup.

### P0-05 acceptance evidence

Accepted source commit: `426feb2c20f36d2eed9a66eca1b1c9fe9e9c4bbf`.

| Evidence | Actual result |
|---|---|
| `npm run test:restore` | PASS 27/27; every-durable-store fixture, exact-keyPath rejection before mutation, staged commit, idempotency, rollback per database, crash recovery per owner, excluded-store preservation, quota/block/version failures, legacy adapters, degraded routing and no RAM-only success |
| `npm run test:backup` | PASS 5/5 |
| `npm test` | PASS 174/174; 0 skipped/todo |
| `npm run check` | PASS |
| `npm run audit:ielts` | PASS 11/11 |
| `npm run audit:v10` | PASS 55/55 |
| `npm run build` | PASS; production bundle built successfully |
| Browser gates | Core, IELTS, V10 and Hardening suites PASS with Chrome `150.0.7871.188`; Hardening includes a real interrupted journal reload/recovery before mount and a production Core-only degraded reload with durable Quick Capture draft read-back |
| Restore transaction boundary | PASS: global exclusive lock, complete validation and preflight before journal, one transaction per database, durable owner checkpoints, reopen/read-back/canonical digest verification, completed receipt and idempotent startup recovery |
| Migration/rollback | No IndexedDB version bump or destructive store change. Active journal and completed receipt are additive Core metadata. Legacy Core v3, IELTS v1 and combined v1 preserve domains absent from their schema. Failure injection restores the exact before digest; rolling-back recovery is repeatable |
| Degraded storage | Verified localStorage Core export is explicitly scoped `core-only`; both production file routers restore it without changing IELTS/V10. When IndexedDB is absent, startup mounts visibly labeled Core-only degraded mode and does not import/mount IELTS/V10 |
| Independent review | Initial review rejected five P1 restore/locking/validation findings; follow-up found exact-keyPath, degraded file-routing and production degraded-boot gaps. All were fixed. Final exact-commit audit ACCEPTED with stable patch ID `f96a70fd92c0e210ef3526e0bfdc1299a1ea11c9` and no remaining P0/P1 |

P0-05 activates canonical v2 restore only through the safe coordinator. Restore follows stage → validate → journal → commit/reconcile → reopen/read-back/canonical verify, and never clears an included target before complete validation. Cross-database writes and exports share one storage lock. Active restore journals are not portable; completed receipts are durable portable metadata. Rollback keeps database version 4 readable and never deletes the newer metadata or excluded stores.

### P0-06 acceptance evidence

Accepted source commit: `35cdc0b350a77797f6992feed1625067edc5674c`.

| Evidence | Actual result |
|---|---|
| `npm run test:capture` | PASS 8/8; copy/reopen/verify/delete ordering, interruption/retry, partial cleanup, target mismatch, collision/divergence, invalid degraded JSON and non-array preservation |
| `npm run test:restore` | PASS 27/27; Capture locking and restore compatibility remain intact |
| `npm test` | PASS 182/182; 0 failed, 0 skipped/todo |
| `npm run check` | PASS; exactly one canonical Inbox marker and no legacy V10 Capture mount |
| `npm run audit:roadmap` | PASS 12/12 |
| `npm run audit:ielts` | PASS 11/11 |
| `npm run audit:v10` | PASS 55/55 |
| `npm run build` | PASS; production bundle built successfully |
| `npm run test:v10-browser` | PASS with Chrome `150.0.7871.188`; one Inbox, one double-submit record, reload, offline keyboard flow and mobile viewport; runtime errors 0 |
| `npm run test:hardening` | PASS with Chrome `150.0.7871.188`; corrupt degraded source remains byte-for-byte unchanged, quota failure retains form, verified retry/double-submit persists once and survives reload |
| Migration/rollback | PASS: exclusive lock; deterministic target IDs; all targets commit, V10 reopens and read-back verifies before any Core delete; Core reopens and confirms deletion; interruption, collision and changed targets preserve durable source/target and retry is idempotent. No DB version bump or reverse/destructive rollback |
| Independent review | Two P1 findings (retry overwrite of a changed target and corrupt localStorage overwrite) were fixed. Exact-commit audit ACCEPTED with patch ID `303f61d479ba527d83cb8bbf12cb5e08e7759f6b`; no P0/P1 remained |

P0-06 removes the second production Capture mount rather than hiding it with CSS. One canonical form/Inbox delegates to V10 when durable IndexedDB is available and to verified Core localStorage only in explicitly degraded Core-only mode. Submit resets only after durable commit/read-back, keeps a stable ID across retry and retains edited input on failure. Rollback must preserve both deterministic V10 candidates and any Core sources still awaiting verified cleanup; it must not reverse-migrate or delete either representation automatically.

### P0-07 acceptance evidence

Accepted source commit: `167c3c68abb3ec6627e2bf9d4fc5b762385e2852`.

| Evidence | Actual result |
|---|---|
| Focused exact-target matrix | PASS 22/22; planned queue never substitutes card/skill, stale revision and sense mismatch fail closed with zero writes, legacy targetless plan is blocked and reload resumes the identical durable binding |
| `npm test` | PASS 188/188; 0 failed, 0 skipped/todo |
| `npm run check` | PASS; canonical Today replaces the legacy DOM, no IELTS second Today mount remains and exact executors are statically guarded |
| `npm run build` | PASS; production bundle built successfully |
| `npm run test:browser` | PASS with Chrome `150.0.7871.188`; canonical launcher, practice access and existing Core flows remain operational |
| `npm run test:ielts-browser` | PASS with Chrome `150.0.7871.188` |
| `npm run test:v10-browser` | PASS with Chrome `150.0.7871.188`; exactly one canonical Today, one visible responsive Today nav, mobile nav has five items, IELTS Hub has no Today tab, exact error repair overrides preselected DOM state and runtime errors are zero |
| `npm run test:hardening` | PASS with Chrome `150.0.7871.188`; removing a durable planned card leaves the rendered binding stale, launch returns `TODAY_TARGET_STALE`, opens no generic session and creates zero review events |
| Migration/rollback | No DB/store version change. New plan fields are additive. Legacy/missing target or executor normalizes to blocked/no-schedule. Rollback may ignore the new fields but must preserve durable activity rows and must not reinterpret them as eligible evidence |
| Independent review | Initial exact-commit review rejected one P1 because `senseId` was lost before evidence persistence. Fix carries and compares sense through ActivitySpec, Attempt, evaluator receipt, EvidenceDecision and review event. Final exact-commit audit ACCEPTED with cumulative patch ID `c3c3e509fa7ecadfd854d91b17edb2669e99a3f4`; no P0/P1 remained |

P0-07 removes the IELTS Hub Today tab and IELTS Lab Today widget, and replaces the legacy Core Today subtree at runtime rather than hiding it with CSS. Every ready launcher re-reads the durable activity and binding before execution. Core launch preserves exact card/sense/skill/source revision through persisted evidence; error repair opens the bound error ID without consulting selected DOM state. Unsupported media, reading, paraphrase and prepared-error targets remain visibly blocked/coaching-only and cannot schedule. Core-only degraded startup mounts one disabled canonical Today surface instead of claiming a RAM-backed plan.

### P0-08 acceptance evidence

Accepted source commit: `b2ed6c09acd97747c46556395e47ab68b9e2021b`.

#### PR #8 CI portability regression baseline

GitHub Actions run `30512230123` (CI run 248, PR #8 merge commit `b0e679a0ba3d9f7189a88d377b9815f7a56497c2`) ran on Ubuntu 24.04 with Node `v22.23.1`. `npm test` completed 191 tests with 189 pass, 2 fail and zero skipped/todo. Both failures are P0-00 harness portability failures:

- `Windows browser candidates include Chrome and Edge machine, x86 and local installs` received mixed `\` and `/` separators because the Linux host's native `path.join` constructed simulated Windows paths.
- `known browser candidate is selected deterministically` then failed with `BROWSER_NOT_FOUND` because its controlled Windows fixture could not match those malformed candidates.

The uploaded `verification-output` artifact is ID `8747540809`, digest `sha256:28f72481586547e7776f7ead0114ee7c4b105203a30f59e561727058a2ee4466`. This is an infrastructure/harness defect, not a product or Retell failure. No assertion, skip, retry or fallback has been changed. The prior Windows acceptance evidence below remains historical but no longer authorizes Phase 1 until the remediated exact source commit is reaccepted.

#### Remediation source evidence

Accepted remediation source commit: `67c5a275a450a8b88d2daf54e299538358bf8f00`.

| Evidence | Actual result |
|---|---|
| Source fix | Windows install candidates use `node:path` `win32.join`; native `join` remains in use for host-local temporary profiles |
| `npm run test:browser-harness` | PASS 12/12; both Ubuntu failures pass without changing their assertions |
| `npm test` before source commit | PASS 191/191; 0 failed/skipped/todo |
| `npm run phase0:gate` clean run 1 | PASS 21/21 in 68.2 s |
| `npm run phase0:gate` clean run 2 | PASS 21/21 in 61.0 s |
| `npm run phase0:gate` clean run 3 | PASS 21/21 in 58.3 s |
| Matrix per gate | Restore/rollback 28/28, full suite 191/191, browser harness 12/12, static/audits/build/server/preview and Core/IELTS/V10/Hardening browser suites PASS; 0 failed/skipped/todo |
| Environment | Windows `10.0.26200` x64; Node `v24.15.0`; Chrome `150.0.7871.188` |
| Canonical artifact | 26 files, 740795 bytes, SHA-256 `7ff334972eb6114118e83e28f74bf47efe4b90b3c28fbf70a1ddc8912740d236` on all three runs |
| Independent review | ACCEPTED exact source commit; focused 12/12 and full gate 21/21 in 60.1 s with the same artifact digest, explicit Windows/Linux absolute-path probes, clean diff/worktree/cleanup and no P0/P1 |
| Stable remediation patch ID | `00d5670cb4a7a9fe45492d8de99bdd9c45bc6d19` from PR #8 pre-remediation head `af663f3` |
| Migration/rollback | No product data, schema, migration, cleanup or rollback behavior changed; rollback is the single browser-path source commit and does not touch durable stores |
| Remaining release check | Push the documentation head to PR #8 and require GitHub Ubuntu CI to pass before restoring Phase 0 release authorization |

#### Pre-push hardening failure baseline

Exact documentation head `a07be19bbeb4be8be1f5211b4074c037ff895c91` passed gates 1–20, then `npm run phase0:gate` stopped at gate 21 with a `PRODUCT_FAILURE`: the stale Today target status reached `data-kind="error"` but its text was replaced with an empty string before the assertion could read `TODAY_TARGET_STALE`. The gate was not retried. Source inspection shows that `vocab:external-change` starts an unawaited asynchronous `renderPlan()` while the old activity remains clickable; a launch can correctly set the stale-target error on one status node and the concurrent render can then replace that node. The fix must serialize Today renders and make the controlled browser fixture await the completed refresh before launch without weakening the stale-target, no-session or zero-review assertions.

| Evidence | Actual result |
|---|---|
| `npm run phase0:gate` clean run 1 | PASS 21/21 in 79.3 s |
| `npm run phase0:gate` clean run 2 | PASS 21/21 in 68.3 s |
| `npm run phase0:gate` clean run 3 | PASS 21/21 in 60.4 s |
| Clean install and test matrix per run | `npm ci` installed 36 packages; release evidence 2/2, adversarial EvidencePolicy 33/33, backup sentinel 5/5, restore/rollback 28/28, Capture 8/8, Today 4/4 and full unit suite 191/191 with 0 failed/skipped/todo |
| Static, audit and production gates | `check`, roadmap 12/12, IELTS 11/11, V10 31/31, V10 audit 55/55, production build, server smoke and preview smoke all PASS |
| Runtime/browser gates | Browser harness 12/12 plus Core, IELTS, V10 and Hardening browser suites PASS on Chrome `150.0.7871.188`; no suite skipped browser discovery |
| Environment | Windows `10.0.26200` x64; Node `v24.15.0`; Chrome executable `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| Canonical artifact | 26 files, 740790 bytes, SHA-256 `1b361e26c9d20feb2bd53d4f9475185a99f0d1c75232c53e09c69aa1131619b6` on every run |
| Cleanup and hygiene | Worktree remained clean; gate-owned ports and temporary browser profiles were empty after every run; no new skip/todo, weakened assertion, debug artifact or temporary marker |
| Independent review | ACCEPTED at the exact source commit; reviewer independently reproduced 21/21 in 61.9 s with restore 28/28, full suite 191/191 and the same artifact digest. Cumulative Phase 0 patch ID `9d713cb564266a7e2794a2116f7b5310870c2665`; no P0/P1 remained |

The first P0-08 attempt at `b5f0e4b` correctly failed because the IELTS audit still required the legacy Today widget removed by P0-07. Commit `c5c2820` replaced that obsolete assertion with a stricter audit for the canonical exact-target adapter and absence of a second Today entry point; no runtime or product failure was reclassified or ignored.

The final review at `bea687e` then correctly rejected Phase 0 after independently exposing a timing-dependent restore digest mismatch. A delayed Core snapshot armed before restore could enqueue behind the exclusive lock and mutate the durable snapshot store after rollback verification. Commit `b2ed6c0` invalidates snapshot/file-backup timers at every exclusive restore/recovery boundary and generation-fences stale snapshot callbacks both before enqueue and inside the write queue. The deterministic regression holds restore for 1.7 seconds across the former timer window; focused restore passed 28/28 five consecutive times before the three full gates and independent reproduction.

P0-08 adds no product data migration and changes no database version. It makes the release gate self-auditing: each clean run binds environment, exact commit, test counts, browser gates, repository hygiene and the canonical production artifact digest. The restore race fix only fences scheduled maintenance; it does not delete durable learner data. Product rollback remains the compatible forward-only behavior documented for P0-01 through P0-07; removing the audit tooling would not roll back or delete product data.

## 3. Confirmed blockers

| ID | Severity | Blocker | Required owner package |
|---|---|---|---|
| B-010 | P1/High | Three DBs and several cross-DB writes lack a shared migration/saga/reconciler model | P1-00, P1-03 |
| B-011 | P2/High | Transcript resolver is range/cache-RAM based, reparses weakly and lacks durable jobs | P2-00–P2-06 |
| B-012 | P3/Critical | Dictation answer remains in transcript rail DOM/a11y surface | P3-03 |
| B-013 | P4/Critical | Content packs lack immutable signed catalog, transactional install and full rights workflow | P4-00–P4-10 |
| B-014 | P5/Critical | Cloud fallback consent/shared-cache policy and local process safety are not production-ready | P5-00–P5-05 |
| B-015 | P7/High | Metrics/calibration are too weak for safe personalization or FSRS tuning | P7-00–P7-05 |

Resolved at the current audited commit: B-001, B-002, B-003, B-004, B-005, B-006, B-007, B-008 and B-009. Core schedule writes are policy-gated and receipt-bound; skill unlock is based on successful qualified evidence; IELTS/V10 exposed, unverified and Retell coaching paths cannot schedule; Retell learner output is durable across evaluator failure; the browser harness remains independently accepted; portable export covers every durable Core/IELTS/V10 store policy including drafts and outbox; restore is journaled, crash-recoverable, verified after reopen and explicit about degraded durability; Capture has one durable Inbox with safe retry/migration behavior; and Today has one canonical route whose launchers preserve exact durable targets or fail closed.

## 4. Phase status

| Phase | Status | Entry gate | Exit state |
|---|---|---|---|
| Phase 0 — Containment and Release Safety | REOPENED / PRODUCT_GATE_RED | Baseline audit complete | P0-07 render race fix and cumulative P0-08 reacceptance required |
| Phase 1 — Core Product Unification | NOT_STARTED / BLOCKED_BY_PHASE_0 | P0-08 ACCEPTED | Not started |
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
| P0-03 IELTS/V10 containment | P0-03 | P0-01 | ACCEPTED @ `12b1cf8` |
| P0-04 Backup envelope | P0-04 | P0-00 | ACCEPTED @ `ffca938` |
| P0-05 Restore safety | P0-05 | P0-04 | ACCEPTED @ `426feb2` |
| P0-06 Capture containment | P0-06 | P0-00, P0-05 | ACCEPTED @ `35cdc0b` |
| P0-07 Today containment | P0-07 | P0-00, P0-01 | ACCEPTED @ `167c3c6` |
| P0-08 Phase 0 exit gate | P0-08 | P0-02, P0-03, P0-05, P0-06, P0-07 | ACCEPTED @ `b2ed6c0` |

### Phase 1

| Package | Branch | Dependency | Status |
|---|---|---|---|
| P1-00 Migration ledger | codex/p1-00-migration-ledger | P0-08 | NEXT |
| P1-01 Learning contracts | codex/p1-01-learning-contracts | P1-00 | PLANNED |
| P1-02 Event repositories | codex/p1-02-event-repositories | P1-01 | PLANNED |
| P1-03 Cross-DB reconciler | codex/p1-03-cross-db-reconciler | P1-02 | PLANNED |
| P1-04 Unified Capture | codex/p1-04-unified-capture | P1-03 | PLANNED |
| P1-05 Transcript aggregate | codex/p1-05-transcript-aggregate | P1-02 | PLANNED |
| P1-06 Error Repository | codex/p1-06-error-repository | P1-02, P1-05 | PLANNED |
| P1-07 Today Composer | codex/p1-07-today-composer | P1-02, P1-04, P1-06 | PLANNED |
| P1-08 Today Runner/cutover | codex/p1-08-today-runner-cutover | P1-07 | PLANNED |

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

- [x] One central default-deny EvidencePolicy guards every schedule write.
- [x] Again/failure and assisted/unverified attempts cannot unlock or create positive review evidence.
- [x] Retell is real and persisted, or clearly coaching-only/disabled.
- [x] Backup registry classifies every Core/IELTS/V10 store.
- [x] Export→reset→restore→restart sentinel count/digest matches every durable store.
- [x] Failure injection cannot leave mixed restore state presented as success.
- [x] Durable write failure never silently falls back to RAM success.
- [x] Quick Capture survives submit failure/reload and only one Inbox is visible.
- [x] Only one Today is visible and every launch preserves exact card/sense/skill/source revision.
- [x] Browser discovery is host-independent and deterministic; cleanup remains verified and critical assertions cannot skip.
- [ ] Concurrent Today refresh cannot erase or race a stale-target launch result.
- [ ] Full phase0:gate passes three consecutive clean runs at one cumulative remediated exact source commit.
- [ ] Independent reviewer records P0-08 reacceptance at the cumulative remediated exact source commit.
- [ ] PR #8 GitHub Actions passes on the pushed integration head under Ubuntu.

Phase 1 authorization condition:

The Phase 1 entry condition remains closed until the Today race is fixed, the cumulative source is independently reaccepted and PR #8 GitHub Actions confirms the remediation on Ubuntu. No Phase 1 branch, source change or migration has started.

## 7. Next package

Current package: P0-07 Today render-race remediation, followed by P0-08 cumulative reacceptance and PR #8 Ubuntu CI confirmation.

Integration branch: `codex/implementation-roadmap` (head of PR #8).

The P0-00 portability remediation remains independently accepted at exact commit `67c5a27`, but cumulative release authorization is reopened by the later hardening product-path failure. P1-00 remains blocked and has not started.
