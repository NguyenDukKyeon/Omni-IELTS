# VocabMaster — Implementation Status

Last updated: 2026-08-14

Phase 0 accepted source commit: d869eb444ea917b6e9ba3d1b7349e323d38560d5

Baseline predecessor branch: codex/implementation-roadmap at 547e5d665adbf102c15b65ac39def185769e5626

Phase 1 acceptance binding: merged PR #9 at `main` commit `9da21e1c3cb34b7372f1b33c541d7442dd0390c9`; source head was `ffe5acc812b6ae50d48833506abe15b3048c0b4b`.

Phase 2 acceptance binding: merged `main` commit `cf28153352110cae510c92e2a8f911a6d65497ca`; the remaining UI/reconnect/reload integration limitations were explicitly carried into Phase 3.

Phase 3 acceptance binding: independently accepted at source HEAD `96aa0172add84186fbe2970cde910b06a0d73672`; exact-head CI run #259 succeeded; PR #11 merged into `main` at `d1fe0dbec9db6405938ec74111e8e25ba4792fee`.

Current canonical delivery lineage: Phase 4 PR #12 merged at
`fc6057fa66c510b0cd12a7fb9e1e74a6379b4225`; Phase 5 PR #13 merged at
`d654356078d2b4d44a03ba17809c7bedeb6c8f14`; Phase 5 focused remediation
PR #14 merged at `6e0165d63db39b8e586f3e9c981c6ae4495df66a`.
Historical remediation branch: `codex/phase-5-audit-remediation`.
Phase 4 and Phase 5 delivery status: `IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED`

Phase 5 is not accepted. It was explicitly authorized from merged `main`
baseline `fc6057fa66c510b0cd12a7fb9e1e74a6379b4225` because its canonical entry
gate is the accepted P2-06 resolver boundary, not Phase 4 publication. Caption
resolution remains first. Local ASR is desktop-only, private and unverified;
Gemini is disabled by default and requires current explicit consent plus a
public/no-auth/no-cookie/rights-eligible source. The local Whisper/model and
Gemini paths are covered with deterministic fakes in this environment; no live
binary, model, provider, credential or quality result is claimed.

The Phase 5 source HEAD `f56f84a0fe0398ac44d331d02df6a911bee62d50`
passed remote CI run #266 and merged through PR #13 at
`d654356078d2b4d44a03ba17809c7bedeb6c8f14`. A focused post-merge technical
audit identified nine Phase 5 defects. The remediation lineage starts exactly
from that merge, adds deterministic regression coverage for durable
Gemini consent/restore behavior, HTTP-to-process-tree cancellation, lease
heartbeat/fencing, restart cleanup and resource bounds, over-cap duration
rejection, model/checkpoint integrity, overlap merge semantics, and unaligned
text import containment, and was merged through PR #14 at
`6e0165d63db39b8e586f3e9c981c6ae4495df66a`. This remediation does not mark
Phase 5 accepted.

## Phase 5 delivery matrix

| Package | Implementation state | Review boundary |
|---|---|---|
| P5-00 capability/consent/privacy | IMPLEMENTED / INTERNAL_GREEN | Private defaults, versioned consent, explicit sharing eligibility and honest desktop/mobile matrix |
| P5-01 secure local companion | IMPLEMENTED / INTERNAL_GREEN | Loopback bearer pairing, origin allowlist, argv-only processes, bounded task media and process-tree cancellation |
| P5-02 progressive local ASR | IMPLEMENTED / INTERNAL_GREEN | Optional local model, no auto-download, first usable private/unverified batch and raw-media cleanup |
| P5-03 range resume/merge | IMPLEMENTED / INTERNAL_GREEN | Canonical resolver job checkpoints, deterministic overlap merge, failed-range reuse and cleanup |
| P5-04 Gemini opt-in | IMPLEMENTED / INTERNAL_GREEN | Server-only credential, explicit consent and rights gate, one-request cost cap, private/unverified output |
| P5-05 mobile/import/exit | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED | Production rescue UI, strict SRT/VTT/text validation, real IndexedDB reload evidence and Phase 5 gate |

Implementation and evidence details are recorded in
`docs/phase5/IMPLEMENTATION_REPORT.md`. Exact-head remote CI and independent
review remain required; no Phase 5 package is marked `ACCEPTED`.

Phase 4 is not accepted. The production signed catalog intentionally contains
no packs because all 68 rights records and all 72 human-review records in the
AI-assisted content draft remain pending. The platform, trust, install,
lifecycle, backup/restore, UI and validator paths are implemented and focused
green; the sampler and four weekly packs are structurally complete drafts only.
External content-repository provisioning, named human rights/review approval,
production signing and independent acceptance remain required. PR #12 merged
at `fc6057fa66c510b0cd12a7fb9e1e74a6379b4225`; that merge does not supply the
missing external, rights, editorial or independent-acceptance evidence. Phase 5
does not alter those records or publication rights; Phase 6 remains locked.

## Phase 4 delivery matrix

| Package | Implementation state | Review boundary |
|---|---|---|
| P4-00 contracts | IMPLEMENTED / INTERNAL_GREEN | Versioned contracts and fail-closed publication validation; independent review required |
| P4-01 catalog trust | IMPLEMENTED / INTERNAL_GREEN | Ed25519 root, canonical serialization, rotation metadata, replay/downgrade protection and durable last-known-good |
| P4-02 installer | IMPLEMENTED / INTERNAL_GREEN | Content-addressed staging, journals, leases, typed recovery and atomic activation |
| P4-03 lifecycle | IMPLEMENTED / INTERNAL_GREEN | Offline launch, update/delete/reinstall/revocation/rollback and exact Today inventory |
| P4-04 publishing boundary | IMPLEMENTED_SCAFFOLD / PROVISIONING_PENDING | `content-repo/` is isolated and publishable; no external remote repository is claimed |
| P4-05 sampler | DRAFT_VALIDATED / HUMAN_REVIEW_REQUIRED | Exactly 3 lessons; not production-publishable |
| P4-06 week 1 | DRAFT_VALIDATED / HUMAN_REVIEW_REQUIRED | 2 Listening, 2 Reading, 2 Lexical/Paraphrase |
| P4-07 week 2 | DRAFT_VALIDATED / HUMAN_REVIEW_REQUIRED | Publication depends on approved week-1 defect review |
| P4-08 week 3 | DRAFT_VALIDATED / HUMAN_REVIEW_REQUIRED | Publication depends on approved week-2 defect review |
| P4-09 week 4 | DRAFT_VALIDATED / HUMAN_REVIEW_REQUIRED | Publication depends on approved week-3 defect review |
| P4-10 verification/release | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED | Local focused gates green and PR #12 merged at `fc6057f`; independent acceptance plus external, rights and editorial gates remain open |

Scope of this update: Phase 0 remains accepted at exact source commit `d869eb4` with PR #8 Ubuntu CI run 250 green. PR #9 was merged into `main` at `9da21e1`. GitHub Actions CI run 255 (`30533541002`) completed successfully on that exact merge commit. An independent read-only audit reviewed the cumulative 44-file P1 diff, reproduced `npm ci --no-audit --no-fund`, `npm run phase0:gate` (21/21), and `npm run phase1:verify` (22/22, including 233/233 unit/integration and all production browser suites) on clean `main`; no P0/P1 finding remained. P1-00…P1-08 are therefore accepted at `9da21e1` and unlock P2-00.

## 1. Provenance status

| Item | Status | Evidence / action |
|---|---|---|
| User-provided AGENTS.md | ACTIVE | Instructions in the current task are applied |
| Repository AGENTS.md | ACTIVE | Invariant/test/migration/evidence/data/Git rules đã được codify trước source change |
| docs/MASTER_ROADMAP.md | CANONICAL | Top-level Master Product Roadmap (Stage 1–8); Owner-ratified |
| docs/ROADMAP.md | CANONICAL (Level 2) | Technical Package Taxonomy cho Phase 0–7 và dependency; KHÔNG phải top-level product roadmap |
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

Initially accepted portability-remediation source commit: `67c5a275a450a8b88d2daf54e299538358bf8f00`.

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
| Status at this evidence point | A later required documentation-head gate exposed the separate Today race recorded below, so this exact commit no longer represented the cumulative remediation |

#### Pre-push hardening failure baseline

Exact documentation head `a07be19bbeb4be8be1f5211b4074c037ff895c91` passed gates 1–20, then `npm run phase0:gate` stopped at gate 21 with a `PRODUCT_FAILURE`: the stale Today target status reached `data-kind="error"` but its text was replaced with an empty string before the assertion could read `TODAY_TARGET_STALE`. The gate was not retried. Source inspection shows that `vocab:external-change` starts an unawaited asynchronous `renderPlan()` while the old activity remains clickable; a launch can correctly set the stale-target error on one status node and the concurrent render can then replace that node. The fix must serialize Today renders and make the controlled browser fixture await the completed refresh before launch without weakening the stale-target, no-session or zero-review assertions.

The first full gate on cumulative source commit `4b24a4f675d870614d0749263f0f29ad67512c74` was also discarded: after gates 1–17 passed, Core browser smoke changed the route to Today and immediately clicked `#v10MorePractice` while the new serialized `hashchange` refresh had explicitly set `aria-busy="true"` and disabled the old controls. A disabled button performs no click action, so the unchanged practice-dialog assertion timed out. This is a controlled-fixture readiness defect introduced by the safe busy contract, not evidence that `openPractice()` failed. The fixture must wait for the Today host to report not busy and for the button to be enabled; the dialog assertion and timeout remain unchanged.

#### Cumulative remediation reacceptance

Independently accepted source commit pending Ubuntu confirmation: `755bb88519161b981da9d9f954565d8201bdb341`.

| Evidence | Actual result |
|---|---|
| Source remediation | Windows install candidates use host-independent `win32.join`; Today build/refresh/launch and event refresh share one serial queue; pending renders disable stale controls and preserve status across DOM replacement |
| Controlled browser readiness | Core and Hardening fixtures await the public Today refresh/busy contract before acting; stale-target, no-session, zero-review and practice-dialog assertions and timeouts remain unchanged |
| `npm run phase0:gate` clean run 1 | PASS 21/21 in 50.9 s |
| `npm run phase0:gate` clean run 2 | PASS 21/21 in 51.9 s |
| `npm run phase0:gate` clean run 3 | PASS 21/21 in 51.7 s |
| Matrix per implementer gate | Restore/rollback 28/28, full suite 191/191, browser harness 12/12, static/audits/build/server/preview and Core/IELTS/V10/Hardening browser suites PASS; 0 failed/skipped/todo |
| Environment | Windows `10.0.26200` x64; Node `v24.15.0`; Chrome `150.0.7871.188` |
| Canonical artifact | 26 files, 741650 bytes, SHA-256 `320deca5b672a6801c6aab07c436cdd66b68287c5c74ec69ce87ac329c477f92` on all three runs |
| Independent reviewer | ACCEPTED exact source commit; browser harness 12/12, Today 4/4, Hardening PASS and full gate 21/21 in 56.2 s with the same artifact digest; clean diff/worktree/cleanup and no P0/P1 |
| Stable cumulative remediation patch ID | `4b1c7099258f891b19b1ca405060c6f9ffc27a2c` from PR #8 pre-remediation head `af663f3` |
| Migration/rollback | No DB/store version or durable-data migration. Rollback reverts the browser-path and Today coordination source commits; compatible durable records remain untouched |
| Remaining release check | Push the documentation head to PR #8 and require GitHub Ubuntu CI to pass before restoring Phase 0 release authorization |

#### PR #8 no-voice product failure baseline

GitHub Actions run `30513980359` (CI run 249, PR #8 merge commit `6b47e9daaa3edb8754050bd1ae8854fba0a956aa`) ran on Ubuntu 24.04 with Node `v22.23.1` and Chrome `150.0.7871.128`. Unit 191/191, static/audits, build, server and preview passed. Core browser smoke then timed out on `Runtime.evaluate · document.getElementById('topProfileButton').click()`; later browser suites did not run.

The immediate harness observation was `INFRASTRUCTURE_FAILURE / BROWSER_TRANSPORT_FAILED`, but source tracing identifies a product root cause and the failure remains red: opening Settings calls `refreshVoices()`. With zero platform voices, the emitted `voices` event synchronously calls `renderVoiceOptions()`, whose empty-cache `getVoices()` calls `refreshVoices()` again without a reentrancy fence. This recursively blocks the page/CDP command. The fix must make an empty voice list a stable product state and add a no-voice regression; it must not extend the CDP timeout, retry the click or weaken the Settings assertion.

Artifacts: `verification-output` ID `8748154770`, digest `sha256:20ceb92c7a1f3bfef64b1372d0a6149be9caf53756a85cf2163207ef5f261abf`; `browser-smoke-output` ID `8748158658`, digest `sha256:5fe18ba373f98fbece858474c1514793c3f6224b47285b38c3316c6017613987`.

#### No-voice remediation reacceptance

Independently accepted source commit pending Ubuntu confirmation: `d869eb444ea917b6e9ba3d1b7349e323d38560d5`.

| Evidence | Actual result |
|---|---|
| Source remediation | `refreshingVoices` fences listener reentry and `voiceDiscoveryAttempted` makes an empty list stable for cached `getVoices()`/`chooseVoice()` calls; explicit refresh, `voiceschanged` and speech intent can still discover later voices |
| Regression | `node --test tests/audio-manager.test.mjs` PASS 6/6; zero-voice listener performs one controlled platform read and cannot recurse |
| Focused browser | Core browser smoke PASS three consecutive times with the unchanged Settings dialog/persistence assertions and timeout |
| Focused full suite/static | `npm test` PASS 192/192 with 0 failed/skipped/todo; `npm run check` PASS |
| `npm run phase0:gate` clean run 1 | PASS 21/21 in 50.4 s |
| `npm run phase0:gate` clean run 2 | PASS 21/21 in 54.0 s |
| `npm run phase0:gate` clean run 3 | PASS 21/21 in 51.8 s |
| Matrix per implementer gate | Restore/rollback 28/28, full suite 192/192, browser harness 12/12, static/audits/build/server/preview and Core/IELTS/V10/Hardening browser suites PASS; 0 failed/skipped/todo |
| Environment | Windows `10.0.26200` x64; Node `v24.15.0`; Chrome `150.0.7871.188` |
| Canonical artifact | 26 files, 741702 bytes, SHA-256 `71772f3cd42dce06ca537c30fb0d3cda43298691022a27969c43071a6024db54` on all three runs |
| Independent reviewer | ACCEPTED exact source commit; audio 6/6, late-refresh/`voiceschanged` probe, Core browser and full gate 21/21 in 55.9 s with the same artifact digest; clean diff/worktree/cleanup and no P0/P1 |
| Stable cumulative remediation patch ID | `66a72821e3df6f89d449ce428065f522f8ee163f` from PR #8 pre-remediation head `af663f3` |
| Migration/rollback | No DB/store version or durable-data migration. Rollback reverts only source coordination/discovery changes; durable stores and records remain untouched |
| Release check | PR #8 Ubuntu CI run 250 passed on integration head `ebe276a`; final documentation-only head must remain CI green |

#### PR #8 Ubuntu CI acceptance

GitHub Actions run `30514506669` (CI run 250) passed on branch head `ebe276ac1b690ae561c288787089a4c275709bfb` and generated PR merge commit `09e29ab`. Environment: Ubuntu 24.04.4, Node `v22.23.1`, Chrome `150.0.7871.128`.

| CI gate | Actual result |
|---|---|
| Install and verification | `npm ci`, full unit suite 192/192, static check, roadmap 12/12, IELTS 11/11, V10 focused 31/31 and V10 audit 55/55 PASS |
| Production gates | Build, server smoke and preview smoke PASS |
| Browser gates | Core, IELTS, V10 and Hardening PASS using deterministic `CHROME_BIN`; failure-report and fail-on-error steps were skipped only because their corresponding suites succeeded |
| Verification artifact | ID `8748341990`, digest `sha256:9f9a22d33161cd6fbe6aa600bbec7558b7fef81a47e05615de620c01330feb24` |
| Core browser artifact | ID `8748345840`, digest `sha256:97ce7b27f0fba1dfbc6e4ef7e16b7663617a757d7b3ec2190c2a92f7a8b98793` |
| IELTS browser artifact | ID `8748346850`, digest `sha256:81d03a8b17b9fc66b662f0ff53438327bb96b1bc6cb8bf27e0b09ccbc78c3312` |
| V10 browser artifact | ID `8748348279`, digest `sha256:91ec4d8ffbe63f6a49a6b5abff593d3587b44766b84d55aaf6bce766b4bcb265` |
| Hardening artifact | ID `8748349382`, digest `sha256:ad30a26ee82ea1bec0be7a7c735e36d843b3ff30ed62b7c34b7ccc9b6a7c47aa` |
| Migration/rollback | CI confirms the same migration/rollback matrix as the accepted source; the CI remediations add no DB version, destructive migration or durable-data mutation |

#### Original Phase 0 acceptance evidence (historical)

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
| B-013 | P4/Critical | The remote platform is implemented, but external repository/CDN provisioning, production signing, named rights approval, human review and sequential defect-review evidence remain open | P4-00–P4-10 |
| B-014 | P5/Critical | Phase 5 implementation and focused remediation are merged, but independent exact-head review remains open; live-provider smoke remains conditional on explicit provisioning, and deterministic fixtures do not establish a live-provider result | P5-00–P5-05 |
| B-015 | P7/High | Metrics/calibration are too weak for safe personalization or FSRS tuning | P7-00–P7-05 |

Resolved at the current audited commit: B-001, B-002, B-003, B-004, B-005, B-006, B-007, B-008 and B-009. Core schedule writes are policy-gated and receipt-bound; skill unlock is based on successful qualified evidence; IELTS/V10 exposed, unverified and Retell coaching paths cannot schedule; Retell learner output is durable across evaluator failure; the browser harness remains independently accepted; portable export covers every durable Core/IELTS/V10 store policy including drafts and outbox; restore is journaled, crash-recoverable, verified after reopen and explicit about degraded durability; Capture has one durable Inbox with safe retry/migration behavior; and Today has one canonical route whose launchers preserve exact durable targets or fail closed.

## 4. Phase status

| Phase | Status | Entry gate | Exit state |
|---|---|---|---|
| Phase 0 — Containment and Release Safety | ACCEPTED / GREEN | Baseline audit complete | P0-08 accepted at `d869eb4`; PR #8 Ubuntu CI run 250 passed |
| Phase 1 — Core Product Unification | ACCEPTED / GREEN | P0-08 ACCEPTED | PR #9 merged at `9da21e1`; CI run 255 and independent reproduction passed |
| Phase 2 — Caption-first Resolver | ACCEPTED / GREEN_WITH_LIMITATIONS | P1-05, P1-08 ACCEPTED | Merged at `cf281533`; accepted limitations are integrated into Phase 3 |
| Phase 3 — Full-video Workspace | ACCEPTED / GREEN | P2-06 ACCEPTED | Independently accepted at `96aa017`; exact-head CI run #259 passed; PR #11 merged at `d1fe0db` |
| Phase 4 — Remote Content Platform | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED | Phase 3 accepted and merged; P1 contracts accepted | PR #12 merged at `fc6057f`; P4-10 remains blocked by review and external gates; not accepted |
| Phase 5 — ASR/Cloud Fallback | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED | P2-06 accepted and explicit policy authorization recorded | PR #13 and focused remediation PR #14 merged through `6e0165d`; independent acceptance remains open |
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
| P1-00 Migration ledger | `main` | P0-08 | ACCEPTED @ `9da21e1` |
| P1-01 Learning contracts | `main` | P1-00 | ACCEPTED @ `9da21e1` |
| P1-02 Event repositories | `main` | P1-01 | ACCEPTED @ `9da21e1` |
| P1-03 Cross-DB reconciler | `main` | P1-02 | ACCEPTED @ `9da21e1` |
| P1-04 Unified Capture | `main` | P1-03 | ACCEPTED @ `9da21e1` |
| P1-05 Transcript aggregate | `main` | P1-02 | ACCEPTED @ `9da21e1` |
| P1-06 Error Repository | `main` | P1-02, P1-05 | ACCEPTED @ `9da21e1` |
| P1-07 Today Composer | `main` | P1-02, P1-04, P1-06 | ACCEPTED @ `9da21e1` |
| P1-08 Today Runner/cutover | `main` | P1-07 | ACCEPTED @ `9da21e1` |

### Phase 2

| Package | Branch | Dependency | Status |
|---|---|---|---|
| P2-00 Resolver contract | main | P1-05, P1-08 | ACCEPTED @ `cf281533` |
| P2-01 Resolver jobs/SSE | main | P2-00 | ACCEPTED @ `cf281533` |
| P2-02 yt-dlp adapter | main | P2-01 | ACCEPTED @ `cf281533` |
| P2-03 Whole-track cache | main | P2-02 | ACCEPTED @ `cf281533` |
| P2-04 Caption normalizer | main | P2-03 | ACCEPTED @ `cf281533` |
| P2-05 Progressive client | main | P2-01, P2-04 | ACCEPTED_WITH_UI_LIMITATION @ `cf281533` |
| P2-06 Resolver exit gate | main | P2-05 | ACCEPTED_WITH_RECORDED_LIMITATIONS @ `cf281533` |

### Phase 3

| Package | Branch | Dependency | Status |
|---|---|---|---|
| P3-00 Workspace shell | codex/phase-3-full-video-workspace | P2-06 | ACCEPTED @ `96aa017` |
| P3-01 Progressive rail | codex/phase-3-full-video-workspace | P3-00 | ACCEPTED @ `96aa017` |
| P3-02 Visible transcript modes | codex/phase-3-full-video-workspace | P3-01 | ACCEPTED @ `96aa017` |
| P3-03 Dictation masking | codex/phase-3-full-video-workspace | P3-01, EvidencePolicy | ACCEPTED @ `96aa017` |
| P3-04 Real Retell | codex/phase-3-full-video-workspace | P3-03, event repositories | ACCEPTED @ `96aa017` |
| P3-05 Transcript editor | codex/phase-3-full-video-workspace | P1-05, P3-01 | ACCEPTED @ `96aa017` |
| P3-06 Workspace exit gate | codex/phase-3-full-video-workspace | P3-02–P3-05 | ACCEPTED @ `96aa017` |

### Phase 4

The delivery matrix records implemented artifacts. The package ledger records
the remaining acceptance boundary: P4-10 stays blocked until its external,
rights, editorial and independent-review gates are satisfied.

| Package | Branch/repository | Dependency | Status |
|---|---|---|---|
| P4-00 Content contracts | codex/phase-4-remote-content-platform | P1-01, P1-05 | IMPLEMENTED / REVIEW_REQUIRED |
| P4-01 Remote catalog | codex/phase-4-remote-content-platform | P4-00, staging/key runbook | IMPLEMENTED / REVIEW_REQUIRED |
| P4-02 Pack Installer | codex/phase-4-remote-content-platform | P4-01, P1-00 | IMPLEMENTED / REVIEW_REQUIRED |
| P4-03 Pack lifecycle | codex/phase-4-remote-content-platform | P4-02 | IMPLEMENTED / REVIEW_REQUIRED |
| P4-04 Content repo scaffold | content-repo/ scaffold | P4-00, external provisioning | SCAFFOLD_IMPLEMENTED / EXTERNAL_PROVISIONING_PENDING |
| P4-05 Sampler | content-repo/ scaffold | P4-04, P4-01 staging | DRAFT_IMPLEMENTED / EDITORIAL_GATES_PENDING |
| P4-06 Foundations Week 1 | content-repo/ scaffold | P4-05 | DRAFT_IMPLEMENTED / EDITORIAL_GATES_PENDING |
| P4-07 Foundations Week 2 | content-repo/ scaffold | P4-06 | DRAFT_IMPLEMENTED / EDITORIAL_GATES_PENDING |
| P4-08 Foundations Week 3 | content-repo/ scaffold | P4-07 | DRAFT_IMPLEMENTED / EDITORIAL_GATES_PENDING |
| P4-09 Foundations Week 4 | content-repo/ scaffold | P4-08 | DRAFT_IMPLEMENTED / EDITORIAL_GATES_PENDING |
| P4-10 Content exit gate | codex/phase-4-remote-content-platform | P4-03, P4-09 | BLOCKED / REVIEW_AND_EXTERNAL_GATES |

### Phase 5

| Package | Branch | Dependency | Status |
|---|---|---|---|
| P5-00 Fallback policy | codex/p5-00-fallback-policy | P2-06 | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED |
| P5-01 Local companion | codex/p5-01-local-companion | P5-00 | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED |
| P5-02 Local ASR | codex/p5-02-local-asr | P5-01 | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED |
| P5-03 ASR resume/cleanup | codex/p5-03-asr-resume | P5-02, P2-04 | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED |
| P5-04 Gemini opt-in | codex/p5-04-gemini-opt-in | P5-00, resolver jobs | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED |
| P5-05 Fallback exit | codex/p5-05-fallback-exit | P5-03, P5-04 | IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED |

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
| P7-00 Metrics reducer | codex/p7-00-metrics-reducer | P1-02, P1-08 | NEXT |
| P7-01 Honest Progress | codex/p7-01-honest-progress | P7-00 | PHASE_BLOCKED |
| P7-02 GoalProfile | codex/p7-02-goal-profile | P7-00, P4-10, P2-06 | PHASE_BLOCKED |
| P7-03 Outcomes/calibration | codex/p7-03-outcomes-calibration | P7-00, mature clean cohort | PHASE_BLOCKED |
| P7-04 Workload recommender | codex/p7-04-workload-recommender | P7-02, P7-03, P4-10, P6-05 | PHASE_BLOCKED |
| P7-05 Personalization exit | codex/p7-05-personalization-exit | P7-04, adequate baseline cohort | PHASE_BLOCKED |

### Cross-cutting packages canonicalized by CR-2A

The five U-* identifiers are portfolio grouping labels only and intentionally
have no status rows. The four package rows below record canonical planning
boundaries, not implementation authorization or acceptance evidence.

| Package | Dependency | Status |
|---|---|---|
| LI-00 Canonical execution safety and Frozen Run | P1-01, P1-02, P1-07, P1-08, EvidencePolicy | PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED |
| SRC-00 Stable SourceRevisionRef seam | P1-01, P1-05, P3-06; public-pack adapter additionally requires accepted P4 contracts | PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED |
| ERR-00 ErrorCandidate lifecycle | LI-00, P1-06 | PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED |
| QAR-00 Shared question activity contracts | LI-00, SRC-00 | PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED |

### Cross-cutting Repository Engineering

| Package | Dependency/evidence boundary | Status |
|---|---|---|
| EWF-00 Engineering Workflow Foundation | No hard product-package dependency; EWF00-ARTIFACTS-001 and EWF00-PREFLIGHT-001 independently accepted and integrated; both required pilots remain unauthorized and pending | IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED |

#### EWF-00 accepted foundation slices

`EWF00-ARTIFACTS-001`

- implementation subject:
  `dc3aa8aa8084abee6819ffcbc238bd7e6f483b6c`
- evidence subject:
  `826dbe9027325c350b0b734a3861e0dfa038e0cd`
- integrated main:
  `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`
- state:
  `ACCEPTED / INTEGRATED`

`EWF00-PREFLIGHT-001`

- implementation subject:
  `51bea1457153b3e3a686fe4689ed0bfabbd0072a`
- evidence subject:
  `255aafe80ad477dd1ac737f51951e2fbd89fd7ea`
- authorization merge:
  `8bd47a9304cb457a611ca0ce2228e87ae56f468e`
- integration merge:
  `57bfa4e77c392a70429c212971c6917b43697213`
- final-main CI:
  `run 31006812002 / #292 / success / 484 of 484`
- state:
  `ACCEPTED / INTEGRATED`

PR #23 was not separately merged through a merge operation. GitHub recorded it
as merged because its exact head became reachable through descendant PR #24.
Its `merge_commit_sha` equals its implementation head, so this does not
represent a duplicate implementation merge.

Remaining package boundary:

- `EWF00-PILOTS-001`: `UNAUTHORIZED`
- `EWF-00`: `NOT_ACCEPTED`
- Next canonical gate: separate pilot authorization.

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
- [x] Concurrent Today refresh cannot erase or race a stale-target launch result.
- [x] Empty speech-voice discovery cannot recursively block Settings or the browser runtime.
- [x] Full phase0:gate passes three consecutive clean runs at one cumulative remediated exact source commit.
- [x] Independent reviewer records P0-08 reacceptance at the cumulative remediated exact source commit.
- [x] PR #8 GitHub Actions passes on the pushed integration head under Ubuntu.

## 7. Phase 1 independent acceptance

- [x] Forward-compatible Core/IELTS/V10 openers retain migration ID/digest ledgers and fail closed on future/unknown schema.
- [x] Core, IELTS and V10 emit the same versioned ActivitySpec, Run, Attempt and Receipt contract.
- [x] Canonical learning events are append-only, idempotent, replayable and dead-letter poison records.
- [x] Cross-database lexical workflows use durable intents, idempotent steps, tombstones and startup reconciliation.
- [x] One CaptureItem state machine and one production Inbox own every capture source and quality gate.
- [x] Transcript source/revision/segment persistence is immutable and preserves legacy adapters without deleting old caches.
- [x] Global ErrorRecord/occurrence totals and repair queue are event-derived; coaching correction cannot become success evidence.
- [x] Today composition is deterministic, due-first, timezone-bound and emits exact ActivitySpec rows.
- [x] Today execution uses a registry, durable run resume, multi-tab lease and exact canonical receipts for skip/cancel.
- [x] Focused P1 suites, full unit/integration tests, static checks, build and all production browser suites pass in the implementation workspace.
- [x] Clean exact-source `npm run phase1:verify` reproduced on the final committed PR head during delivery handoff; exact SHA and results are recorded in PR #9.
- [x] Independent package/phase audit reviewed the cumulative P1 diff and reproduced the clean hard gates at `9da21e1` with no P0/P1 finding.
- [x] PR #9 merged into `main` at `9da21e1`.
- [x] GitHub Actions CI run 255 completed successfully on the merge commit.

The Phase 1 implementation report is `docs/phase1/IMPLEMENTATION_REPORT.md` and remains the implementer handoff. This section records the separate acceptance evidence that unlocks Phase 2.

## 8. Phase 3 acceptance state

Phase 3 was independently accepted at exact source HEAD `96aa0172add84186fbe2970cde910b06a0d73672`. Exact-head CI run #259 succeeded, and PR #11 merged into `main` at `d1fe0dbec9db6405938ec74111e8e25ba4792fee`. This independently verified merge unlocked Phase 4. Phase 5 was later explicitly authorized by the user from `main` at `fc6057f`; that authorization does not accept Phase 4 or change its publication records.

## 9. Next acceptance action

Current handoff: independently reproduce the Phase 5 exact-head unit,
backup/restore and production browser gates at the merged remediation lineage
`6e0165d63db39b8e586f3e9c981c6ae4495df66a`. Live Local
Whisper and Gemini smoke remain conditional on explicitly provisioned binaries,
model and server credential. For Phase 4, external repository/CDN provisioning,
production signing-key custody, named rights approval, human lesson review,
sequential weekly defect review and production publication remain open.

Phase 4 remains `IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED`; merge alone
did not supply missing rights/human review or independent acceptance. Phase 5
must also remain `IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED` until
exact-head CI and an independent focused review reproduce the handoff.

## 10. Wave 6 Stage 1 canonical integration and closure

- Canonical status: `STAGE_1_FULLY_CLOSED`
- Technical packages accepted:
  - R1 — P7/WKN successor (`W6-P7-00-WKN-SUCC-010`): `ACCEPT`
  - R2 — Focus Today (`W6-FCS-00-01-012`): `ACCEPT`
  - R3 — Frozen Assessment (`W6-ASM-00-014`): `ACCEPT`
  - R4 — Targeted Diagnostic (`W6-TD-00-014`): `ACCEPT`
- Accepted execution candidate head: `81428f28fac8a8e34ab35126a028d16659199def` (PR #78)
- Corrected independent batch audit: comment `5290883787` on PR #78 (`STAGE1_TECHNICAL_ACCEPT`)
- Integration authorization: `W6-STAGE1-INTEGRATION-AUTH-001` (PR #79 at head `dcde5295f70d3697e078b0ab4c5622348e6dbbd5`, independent ACCEPT comment `5291276461`)
- Canonical integration merge: merged PR #78 into `main` at commit `b293b9d2a97a152785ce914f9ad4ab2181c93eab`
- Integration closure record: comment `5291294824` on PR #78 (`W6_STAGE1_CANONICAL_INTEGRATION_CLOSED`)
- Post-merge natural CI: Run `31784638335` (Job `94717717917`, `SUCCESS`, verification artifact `9213013159`, digest `sha256:49516801add760cb99e400145b95bfc538234f9de6ebe5ecca8103c22cb84f21`)
- Status reconciliation: `STATUS_RECONCILIATION: COMPLETE`
- Boundaries:
  - `STAGE_1_5_NOT_AUTHORIZED`
  - `STAGE_2_NOT_AUTHORIZED`
  - Zero downstream execution, deployment, or release claims are granted by this status reconciliation.

## 11. Stage 1.5 Adversarial Product Jury closure

- Canonical status: `STAGE1_5_COMPLETE`
- Closure PR: #84 (clean rematerialization recovery)
- Canonical main after closure: `1744d4d92ac0a7aa6ac42ce9b97b49263336908c`
- Disposition markers:
  - `STAGE1_5_REMEDIATION_ACCEPTED`
  - `STAGE1_5_COMPLETE`
  - `READY_FOR_STAGE_2_RECONCILIATION`
  - `STAGE2_NOT_AUTHORIZED`
- Stage 1.5 findings (F004, F005) retain their canonical disposition; this closure does not reinterpret them.
- Stage 1.5 is an interstage governance gate, NOT one of the eight numbered product Stages.

## 12. Master Roadmap Stage 1–8 canonicalization

Transaction `MASTER-ROADMAP-CANON-001` materialized the Owner-ratified
Stage 1–8 Master Product Roadmap as the top-level product authority in
`docs/MASTER_ROADMAP.md`.

- Stage/Phase/Wave/Package taxonomy is now explicitly distinguished.
- `docs/ROADMAP.md` is reclassified as Level 2 Technical Package Taxonomy.
- Phase numbers do NOT map 1:1 to Stage numbers.
- Historical accepted package identities, evidence and architecture are preserved.
- This canonicalization does NOT authorize Stage 2 implementation.
- ADR-049 records the governance decision.

## 13. Stage 2 Strategy Reconciliation

Transaction `STAGE2-IELTS-STRATEGY-001` materialized the Owner-ratified Option B
(Full IELTS Platform: Academic + General Training across Listening, Reading,
Writing, Speaking) product and technical strategy reconciliation candidate in
`docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`.

- Strategy candidate document: `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`
- Owner decision record: ADR-050 in `docs/DECISIONS.md`
- Strategy audit outcome: `ACCEPTED` (PR #87 independently audited and merged into `main` at commit `a755ae4949746a71ac86299b34766ad8fe3b6fb6`)
- Current state markers:
  - `STAGE2_STRATEGY_ACCEPTED`
  - `STAGE2_IMPLEMENTATION_NOT_AUTHORIZED`
  - `STAGE2_FIRST_WAVE_RECOMMENDED`
- Wave sequence ratified: W0 (Architecture & Track Routing) $\to$ W1 (Objective Kernel) $\to$ W2 (Listening) / W3 (Reading) / W4 (Writing) / W5 (Speaking) $\to$ W6 (Full Mock & Exit Gate).
- First Wave candidate recommended: `W0-IELTS-ARCH-001`.

## 14. Stage 2 Wave W0 Authorization

Transaction `STAGE2-W0-IELTS-ARCH-AUTH-001` materialized and independently audited the Wave
Authorization Manifest for `W0-IELTS-ARCH-001` (IELTS Product Contracts & Track
Architecture) in `docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md`.

- Authorization manifest: `docs/authorizations/STAGE2-W0-IELTS-ARCH-AUTH-001.md`
- Canonical base predecessor: `a755ae4949746a71ac86299b34766ad8fe3b6fb6`
- Controlling strategy: `STAGE2-IELTS-STRATEGY-001` (`docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`)
- Audit verdict: `ACCEPT` (PR #88 comment 5301830457 merged at commit `ee7d1b72c46a5e3e8e1411256ac4bd62360bbc54`)
- Current state markers:
  - `W0_AUTHORIZATION_ACCEPTED_AND_CANONICAL`
  - `W0_IMPLEMENTATION_AUTHORIZED`
  - `STAGE2_W1_TO_W6_NOT_AUTHORIZED`
  - `STAGE2_IMPLEMENTATION_NOT_STARTED`
- Bounded scope: Academic vs General Training track routing contracts, `ielts-test-blueprint` & `ielts-section-blueprint` schemas, practice hierarchy definitions, session/interruption contracts (S15-F005), `ieltsTestBlueprints` and `ieltsTestRuns` store manifest, backup registry v6 registration, and minimal track selector UI proof.

## 15. Execution Prompt Protocol V2 Candidate

Transaction `EXECUTION-PROMPT-PROTOCOL-V2-002` cleanly rematerialized the repository-level
Execution Prompt Protocol V2 candidate in `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`
after historical unmerged candidate PR #89 (`EXECUTION-PROMPT-PROTOCOL-V2-001`) and the subsequent
canonical recovery PR #91 (`IELTS-HUB-RENDER-RACE-RECOVERY-002`).

- Protocol document: `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`
- Decision record: ADR-051 in `docs/DECISIONS.md`
- Activation model: `SELF_RESOLVING_CONDITIONAL_ACTIVATION`
- Activation rule: `CONDITIONAL_EXTERNAL_EVIDENCE_GATE`
- Activation gates (all must be independently satisfied):
  1. Independent exact-head Protocol V2 audit yields formal `ACCEPT` verdict;
  2. `ACCEPT` verdict is persisted and fresh-read back;
  3. Accepted candidate head SHA remains unchanged;
  4. Exact accepted candidate head is merged into canonical `main`;
  5. Natural post-merge push CI succeeds on the exact merge commit SHA.
- Derived canonical state:
  - **State before all gates satisfied**: `PROTOCOL_V2_CANDIDATE` / `PROTOCOL_V1_ACTIVE`
  - **State after all gates satisfied**: `PROTOCOL_V2_ACTIVE_FOR_NEW_EXECUTION_PROMPTING_TRANSACTIONS` / `PROTOCOL_V1_RETAINED_AS_ADR046_BOUNDARY_CAPSULE_AUTHORITY_AND_HISTORICAL_COMPATIBILITY`
- Evidence source: Repository text defines the canonical activation predicate; raw GitHub evidence (persisted verdict comment, merge record, natural post-merge CI run) resolves whether the predicate has become true. No follow-up administrative or status-only commit is required on `main` to restate the derived state.
- Product authority: `NONE` (Docs/governance only; does not authorize product implementation or Stages 3–8).

## 16. W0 Execution Predecessor Reconciliation

Transaction `STAGE2-W0-IELTS-ARCH-BASE-RECON-001` reconciles the exact execution
predecessor for `W0-IELTS-ARCH-001` from the historically accepted authorization
substrate to current canonical `main`.

- Reconciliation document: `docs/authorizations/STAGE2-W0-IELTS-ARCH-BASE-RECON-001.md`
- Controlling authorization: `STAGE2-W0-IELTS-ARCH-AUTH-001` (unchanged, canonical)
- Old execution predecessor: `a755ae4949746a71ac86299b34766ad8fe3b6fb6`
- Reconciliation base: `f13804d062ded7c331a62d657144a5907163012e`
- Effective W0 execution predecessor: `PENDING_RECONCILIATION_MERGE_RESOLUTION`
- Resolution rule: exact merge SHA of independently accepted PR #93 + natural exact merge-SHA post-merge CI SUCCESS. The raw GitHub merge record resolves the exact SHA. No follow-up status-only commit is required.
- Intervening transactions:
  - PR #88: W0 authorization canonicalization (docs-only) — `ORTHOGONAL`
  - PR #91: IELTS Hub render-race recovery (product defect fix) — `ORTHOGONAL_COMPATIBLE_SUBSTRATE`
  - PR #92: Execution Prompt Protocol V2 (governance-only) — `ORTHOGONAL`
- Current state markers:
  - `W0_AUTHORIZATION`: `ACCEPTED_AND_CANONICAL`
  - `W0_EXECUTION_AUTHORITY`: `GRANTED_BUT_PREDECESSOR_RECONCILIATION_PENDING`
  - `W0_BASE_RECON`: `CANDIDATE_PENDING_INDEPENDENT_AUDIT`
  - `W0_IMPLEMENTATION`: `NOT_STARTED`
  - `W1_W6`: `NOT_AUTHORIZED`
- Derived state after reconciliation gates satisfied:
  - `W0_BASE_RECON`: `ACCEPTED_AND_CANONICAL`
  - `EFFECTIVE_W0_EXECUTION_PREDECESSOR`: `<PR93_EXACT_MERGE_SHA>`
- Semantic authority change: `NONE`
- Write allowlist change: `NONE`
- RED/GREEN contract change: `NONE`
- Migration/rollback change: `NONE`
- Dependency change: `NONE`

## 17. W0 Test Allowlist Reconciliation

Transaction `STAGE2-W0-IELTS-ARCH-TEST-ALLOWLIST-RECON-001` reconciles the W0 test write
allowlist following the independent rejection of PR #95 (comment `5302835936`), authorizing
the legitimate adaptation of `tests/migration-ledger.test.mjs` for the accepted IELTS v4
migration while preserving clean recovery topology.

- Reconciliation document: `docs/authorizations/STAGE2-W0-IELTS-ARCH-TEST-ALLOWLIST-RECON-001.md`
- Controlling authorization: `STAGE2-W0-IELTS-ARCH-AUTH-001` (unchanged, canonical)
- Predecessor reconciliation: `STAGE2-W0-IELTS-ARCH-BASE-RECON-001` (accepted in PR #93)
- Trigger: Independent REJECT of PR #95 (comment `5302835936`)
- Reconciliation base: `4130ef940b515224357548e029d0c34a857c82e5` (Merge PR #93)
- Historical rejected candidates:
  - PR #94 (`b0a5c35aaa8a3389e1c57bc34543cae69c289856`): `HISTORICAL_REJECTED_EXECUTION_CANDIDATE` (comment `5302730077`)
  - PR #95 (`03e33a6f55db6ac746ede88d4f8c6593b180ebb5`): `HISTORICAL_REJECTED_CLEAN_EXECUTION_CANDIDATE` (comment `5302835936`)
- Current state markers:
  - `W0_AUTHORIZATION`: `ACCEPTED_AND_CANONICAL`
  - `W0_BASE_RECON`: `ACCEPTED_AND_CANONICAL`
  - `W0_IMPLEMENTATION`: `NOT_ACCEPTED`
  - `W0_TEST_ALLOWLIST_RECON`: `CANDIDATE_PENDING_INDEPENDENT_AUDIT`
  - `EFFECTIVE_W0_RECOVERY_PREDECESSOR`: `PENDING_RECONCILIATION_MERGE_RESOLUTION`
  - `W1_W6`: `NOT_AUTHORIZED`
- Authorized test allowlist delta: `+ tests/migration-ledger.test.mjs`
- Source allowlist delta: `NONE`
- Product semantic change: `NONE`
- Migration semantic change: `NONE` (`wave0-ielts-product-contracts-v4`, DB v3 → v4)
- Migration mode: `upgrade` (atomic registration inside the IndexedDB `versionchange` transaction)
- Migration atomicity: `SCHEMA_AND_LEDGER_SAME_VERSIONCHANGE_TRANSACTION`
- Exact frozen migration digest: `wave0-ielts-product-contracts-store-v4:2026-08-15`
- Dependency change: `NONE`
- Recovery implementation status: `NOT_STARTED`



