# VocabMaster — Architecture and Product Decisions

Baseline: commit 54691cfb5314b51762c4959c9d0cee2012fc2b4a, 2026-07-30.

Status vocabulary:

- CONFIRMED: explicitly accepted in the current product discussion.
- PROPOSED: Lead Architect recommendation; must be ratified before the owning implementation package.
- SUPERSEDED: kept for audit history but no longer active.

No decision below authorizes implementation by itself.

## ADR-001 — Roadmap authority and provenance gap

Status: SUPERSEDED by ADR-026

Context: the audited repository has no AGENTS.md and no docs/ROADMAP.md. It contains several older, conflicting phase number systems in reports/audits.

Decision: use the user-provided AGENTS.md and accepted Phase 0–7 roadmap from this conversation as the planning baseline. Historical phase labels are implementation evidence only. If docs/ROADMAP.md later appears and conflicts, stop before implementation and reconcile all three planning docs.

Consequences: no fabricated claim that docs/ROADMAP.md was read; package IDs in this plan are the only active IDs until reconciliation.

Revisit when: a canonical roadmap file/commit is supplied.

## ADR-002 — Phase 0 is a hard release and implementation gate

Status: CONFIRMED

Context: false evidence, incomplete backup and red browser gates undermine every higher-level feature.

Decision: no Phase 1 implementation branch starts before P0-08 is independently ACCEPTED at an exact commit. Research/fixtures may be prepared only when they cannot mutate production contracts/data or activate features.

Consequences: UX/content work may wait, but it will not be built on invalid evidence/durability.

Revisit when: never by informal exception; only by an explicit roadmap decision with risk owner.

## ADR-003 — One package equals one branch and one PR

Status: SUPERSEDED by ADR-026

Context: phase-sized PRs cannot be reviewed, migrated or rolled back independently.

Decision: every package in IMPLEMENTATION_PLAN.md has a closed file set, exact predecessor, branch, PR, migration/rollback tests and independent acceptance. Content packs are separate PRs too.

Consequences: more PRs and integration points; much smaller blast radius and clearer rollback.

Revisit when: package boundary proves non-atomic before coding; split it further, never merge a whole phase.

## ADR-026 — Canonical roadmap roles và Phase 0 delivery topology

Status: CONFIRMED

Context: yêu cầu triển khai hiện tại cung cấp authority để tạo repository `AGENTS.md` và canonical `docs/ROADMAP.md`, đồng thời loại bỏ chi phí quản lý thủ công 61 branch/PR. P0-00…P0-08 vẫn cần boundary kiểm chứng/rollback rõ nhưng không cần remote integration point riêng.

Decision:

- `docs/ROADMAP.md` là authority về Phase 0–7 và dependency; IMPLEMENTATION_PLAN giữ package acceptance; IMPLEMENTATION_STATUS giữ evidence/status; DECISIONS giữ rationale; AGENTS giữ invariant thi hành.
- Work package là đơn vị plan, verification và commit; không mặc định là branch/PR.
- Toàn Phase 0 chạy tuần tự trên `codex/phase-0-release-safety`, một commit nhỏ cho mỗi P0-00…P0-08 và một PR Phase 0.
- Independent review vẫn bind vào exact final commit và phải tái chạy hard gate; topology ít PR không làm yếu acceptance.

Consequences: Phase 0 có một review surface end-to-end và commit/package mapping rõ; rollback vẫn có thể theo commit. Các branch name cũ trong planning ledger không còn active cho Phase 0.

Revisit when: package cần release cadence hoặc risk boundary độc lập; thay đổi topology phải được chốt trước khi package bắt đầu, không giữa implementation để né gate.

## ADR-004 — EvidencePolicy is the sole FSRS write gateway

Status: CONFIRMED

Context: Core currently trusts affectsSchedule from activity steps, while IELTS has a separate policy with caller-supplied booleans.

Decision: all surfaces emit Attempt + AssistanceTrace. A default-deny EvidencePolicy returns EvidenceDecision with reason code. Only an accepted decision can create a review event/FSRS mutation.

Consequences: existing direct writes become adapters then are removed; fewer apparent reviews are acceptable if they were false evidence.

Revisit when: a new activity type cannot be expressed; extend the contract, do not bypass the gateway.

## ADR-005 — Failure is persisted, but does not masquerade as success

Status: CONFIRMED

Context: Again/failure can currently count as reps and unlock later skills; Skip/complete semantics overlap.

Decision: persist failures, skips and abstentions symmetrically for diagnosis. Unlock/mastery requires explicitly qualified successful independent evidence. Coaching/assisted work may affect practice history but not positive FSRS evidence.

Consequences: error repair remains informative without inflating mastery; progress UI must distinguish activity from retrieval success.

Revisit when: learning-science policy defines a different evidence qualifier with tests and migration impact.

## ADR-006 — Logical unification before physical database consolidation

Status: PROPOSED

Context: Core, IELTS and V10 use three IndexedDB databases. A big-bang merge would create a large, hard-to-rollback migration.

Decision: first unify versioned domain contracts/repositories and introduce migration ledger + saga/reconciler. Do not consolidate all databases in Phase 1. Physical consolidation requires a later measured ADR.

Consequences: temporary cross-DB complexity remains but becomes explicit/idempotent; rollback risk is lower.

Revisit when: event/repository boundaries are stable and telemetry proves cross-DB cost/bugs justify migration.

## ADR-007 — Durable data, reconstructable cache and ephemeral state are distinct

Status: CONFIRMED

Context: current backups omit V10/drafts/outbox, while future media/content caches could make backups huge.

Decision:

- Durable: learner-authored content, cards, occurrences, goals/settings, attempts/receipts/evidence, review events/FSRS, errors, transcript user revisions, progress, migration/restore journals and unresolved outbox/sagas. Must backup.
- Reconstructable cache: published pack blobs, downloaded models, provider raw artifacts when policy permits. Exclude from backup but preserve content stubs/digests.
- Ephemeral: UI state, active process handles, temporary media. Never claim durable save.

Consequences: backup is complete without bundling large replaceable assets; UI must disclose offline/cache state separately.

Revisit when: a cache artifact cannot legally/technically be reconstructed.

## ADR-008 — Restore uses staging, journal and forward-only schema evolution

Status: CONFIRMED

Context: IndexedDB version cannot be safely downgraded and multi-DB restore is not one native transaction.

Decision: migrations are additive/idempotent; database versions never decrease. Restore validates first, records a journal, applies with compensating/reconciliation steps and proves state after restart. Old builds must open future-version fixtures read-safe or fail explicitly, never silently use RAM.

Consequences: storage code becomes more formal; destructive “clear then hope” restore is forbidden.

Revisit when: storage is consolidated behind a server transaction model.

## ADR-009 — One Today, one Capture Inbox, one Error Repository

Status: CONFIRMED

Context: Core/IELTS/V10 currently expose overlapping workflows with different data semantics.

Decision:

- Today Composer/Runner is global; IELTS contributes activities, not another scheduler.
- Capture is one state machine/Inbox for all sources.
- Error Repository is global; IELTS Sổ lỗi is a filtered view, not a separate truth.

Consequences: IA becomes simpler, counts reconcile and all activities share evidence contracts.

Revisit when: a truly separate product/account boundary appears, not merely a different UI tab.

## ADR-010 — Exact activity target is immutable from plan to receipt

Status: CONFIRMED

Context: V10 planner stores cardId/skill but launcher starts a generic mode.

Decision: ActivitySpec fixes activityId, target card/sense/skill, source revision and evidence policy before launch. Runner cannot infer/replace target. Receipt must match or fail closed.

Consequences: personalization is reproducible and learning evidence traceable; some legacy activities become coaching-only until adapted.

Revisit when: group activities need multi-target schema; extend target cardinality explicitly.

## ADR-011 — Canonical Transcript is an immutable revisioned aggregate

Status: PROPOSED

Context: transcript data is split across IELTS/V10 caches/jobs/segments and current IDs depend on chunk/provider order.

Decision: model VideoSource, RawTrack/Cue, derived SentenceRevision, Coverage, aliases/tombstones, Job and provenance. Raw/provider tracks are immutable; user edits create a new revision. Attempts bind the exact revision.

Consequences: editor/background refresh cannot rewrite history; progress mapping across split/merge requires explicit aliases/confidence.

Revisit when: non-video audio/podcast sources require a generalized MediaSource; extend without losing revision semantics.

## ADR-012 — yt-dlp is a server/desktop adapter, not a browser architecture

Status: CONFIRMED

Context: yt-dlp improves caption coverage and metadata but cannot run safely/portably in a normal mobile browser.

Decision: use yt-dlp behind a local companion or controlled server adapter with version health check, typed errors, resource limits and no automatic cookie/proxy extraction. Browser client talks to resolver jobs only.

Consequences: desktop gets best capability; mobile needs server/cloud/import fallback; private/auth video support is not promised by default.

Revisit when: platform capabilities or an official provider changes the security/legal trade-off.

## ADR-013 — Caption-first, whole-track, progressive delivery

Status: CONFIRMED

Context: range-by-range resolution repeats metadata/provider calls and creates unstable overlap/IDs.

Decision: cache → manual caption → auto caption → approved provider/fallback. Fetch whole caption track once, preserve raw cues, normalize into stable sentences, and stream usable rows progressively through durable jobs/SSE.

Consequences: healthy caption videos can feel fast without claiming every video completes in 10–30 seconds; partial coverage and retry are explicit.

Revisit when: a source only supports ranged transcript; adapter must still emit stable raw provenance/coverage.

## ADR-014 — Shared transcript cache is off by default

Status: CONFIRMED

Context: user-pasted/private video transcripts may contain personal or copyrighted material.

Decision: namespaces are local-private, per-user-private and shared-public. Shared-public requires public source, no auth/cookies, provenance and an approved retention/reuse policy. User-private artifacts never promote automatically.

Consequences: lower shared hit rate, substantially safer privacy/rights boundary.

Revisit when: legal/product policy and explicit opt-in are approved with deletion controls.

## ADR-015 — Workspace keeps transcript rail but mode controls disclosure

Status: CONFIRMED

Context: reference UX requires video left, transcript right. Removing the rail would lose orientation; leaving plaintext during Dictation leaks the answer.

Decision:

- Normal/Noticing/Shadowing: transcript visible.
- Dictation Strict: active answer and overlapping leakage absent from DOM/ARIA/clipboard; timestamps/index/state remain.
- Dictation Practice: hints/dot mask allowed but AssistanceTrace marks assisted.
- After submit: reveal current transcript and diff.
- Retell: preparation/exposure state determines coaching vs evidence eligibility.

Consequences: desired visual workspace and learning validity coexist; masking must be semantic, not CSS blur.

Revisit when: user testing shows a different disclosure model improves learning without invalidating measurement.

## ADR-016 — Product IA keeps IELTS top-level

Status: CONFIRMED

Decision: primary IA is Hôm nay · Thu thập · Kho từ · IELTS · Tiến bộ. IELTS internal IA is Đề xuất · Kho bài · Video · Sổ lỗi · Đã tải. Today/Error/Progress remain global truths.

Consequences: IELTS retains product prominence without duplicating core systems; mobile navigation must support five items accessibly.

Revisit when: product positioning changes from IELTS-first English learning to a broader multi-track product.

## ADR-017 — Remote immutable content, not a growing application bundle

Status: CONFIRMED

Context: current catalog has three same-origin lessons and weak asset integrity; scaling locally would bloat deploys.

Decision: signed remote catalog, immutable packs and content-addressed blobs downloaded on demand. Cache may be deleted; progress/stubs remain. Editorial source/rights/masters live in a separate content repository/storage.

Consequences: independent content releases and smaller app bundle; requires CDN/CORS/key/rollback operations.

Revisit when: offline-first distribution channel requires a deliberately bounded bundled sampler.

## ADR-018 — Starter Pack is 24 micro-lessons, released incrementally

Status: PROPOSED

Decision: first prove a 3-lesson human sampler, then four weekly PRs of six lessons (2 Listening, 2 Reading, 2 Lexical Sets), target distribution 8 B1/10 B2/6 C1 and ≤8 MB per weekly pack unless an approved deviation is documented.

Consequences: users get enough material for four weeks while each content release remains reviewable/rollbackable; production cost is explicit.

Revisit when: sampler/user testing supplies evidence for a different count, level mix or size budget.

## ADR-019 — Public Content Factory lives outside learner runtime

Status: CONFIRMED

Context: current ai-content-factory.js can run idle in the learner app; that mixes authoring, private learner data and public publishing.

Decision: public factory is an external batch workflow. Learner runtime only consumes signed reviewed packs. Personal preparation, if retained, is private, ahead-of-time and can never publish into public catalog.

Consequences: no AI wait during lessons; clearer security/rights boundary; requires external repository/CI.

Revisit when: a secure multi-tenant backend is deliberately designed and separately audited.

## ADR-020 — Deterministic validators + human review are mandatory; critics are advisory first

Status: CONFIRMED

Context: two independent AI critics are expensive for a personal/MVP factory and still cannot own rights or pedagogical accountability.

Decision: MVP requires deterministic validators and named human review. An independent AI critic may add findings but cannot approve/publish. Multiple critics become a scaling option only after measured defect/yield data.

Consequences: slower editorial throughput but trustworthy content; AI quality claims are testable.

Revisit when: canary metrics show human bottleneck and a validated critic materially reduces defects/cost.

## ADR-021 — Local ASR is desktop-first; Gemini is explicit opt-in

Status: CONFIRMED

Decision: local companion may use Whisper/faster-whisper after caption failure and rights/consent checks. Mobile falls back to approved server provider, Gemini opt-in or manual import. Raw media is temporary by default; Gemini output is private and needs review.

Consequences: honest capability by device; privacy/cost controls are product requirements, not implementation details.

Revisit when: on-device mobile ASR meets performance/storage/privacy targets.

## ADR-022 — Metrics are event-derived and personalization comes last

Status: CONFIRMED

Context: current labels/calibration can overstate confidence from sparse samples; dirty evidence would corrupt optimization.

Decision: define metrics by numerator/denominator/timeframe/eligibility/uncertainty and reduce from canonical events. GoalProfile and reason-coded deterministic recommendation precede experiments. No FSRS tuning before sufficient clean 7/30/90-day outcomes.

Consequences: slower personalization rollout; recommendations remain explainable and reversible.

Revisit when: outcome cohort meets predeclared sample/quality thresholds.

## ADR-023 — Acceptance evidence hierarchy

Status: CONFIRMED

Decision, strongest to weakest:

1. Runtime/persistence/browser behavior on exact commit with controlled fixture and durable-state assertions.
2. Integration/unit/property tests for domain invariants and failure injection.
3. Build/static/schema audits.
4. Source-string/DOM-presence assertions.
5. Implementer report/manual screenshot.

A weaker class cannot overrule a failure in a stronger class.

Consequences: existing green audits remain useful but cannot close Phase 0 while browser/durable evidence is red.

Revisit when: test infrastructure changes; preserve the principle of independent reproducible evidence.

## ADR-024 — Performance targets are release SLOs, not universal promises

Status: PROPOSED

Decision for controlled healthy-caption matrix:

- cache hit first usable p95 ≤2 seconds;
- fresh caption first usable p95 ≤10 seconds;
- 20-minute captioned video full rail p95 ≤30 seconds;
- seek error ≤750 ms on fixtures.

Captionless ASR/private/provider failure is reported separately and never marketed as guaranteed 10–30 seconds.

Consequences: UX can optimize first useful content while failures remain honest.

Revisit when: production telemetry with privacy safeguards supports revised SLOs.

## ADR-025 — No destructive migration as a feature rollback

Status: CONFIRMED

Decision: rollback uses feature flags, compatible readers, catalog pointers and immutable revisions. It must not delete stores, downgrade IndexedDB, overwrite published assets or erase learner data.

Consequences: temporary unused data/schema may remain; cleanup needs a later independently gated retention package.

Revisit when: a fully exported, verified and user-approved destructive cleanup is separately planned.

## ADR-027 — Browser acceptance separates infrastructure from product behavior

Status: CONFIRMED

Decision: all critical browser suites use one deterministic discovery/lifecycle helper. Browser/CDP/network transport, occupied ports, process-tree leakage and profile cleanup are infrastructure failures. Runtime assertions and durable-state mismatches are product failures. Cleanup failure is appended as infrastructure evidence but never replaces a primary product failure. Missing Chromium is a hard infrastructure failure, never a skipped suite.

Consequences: P0-00 may be accepted when the harness reproducibly exposes a red product defect assigned to a successor package; the full Phase 0 gate remains red until that product defect is fixed. Browser processes use isolated task-owned profiles, and POSIX descendants are owned through isolated process groups.

Evidence: P0-00 independently accepted source commit `33616e5e03ef3684b0afdbdf6e328ef45bb5cfc4`; the V10 sentence-session race remained a product failure owned by P0-03 and was later fixed within that package.

PR #8 Ubuntu CI run 248 exposed a separate portability gap: simulated Windows discovery used the executing host's native `path.join`, producing mixed separators on Linux. Exact remediation source commit `67c5a275a450a8b88d2daf54e299538358bf8f00` uses `node:path` `win32.join` only for Windows install candidates and retains native joining for host-local temporary profiles. No assertion, skip, fallback, failure classification or cleanup behavior changed. The focused harness passed 12/12; three full Phase 0 gates and an independent reviewer reproduction passed with no P0/P1. Release authorization remains blocked until the pushed PR #8 Ubuntu CI confirms the integration head.

The cumulative remediation exact source commit is `755bb88519161b981da9d9f954565d8201bdb341`. Browser fixtures wait on the production Today refresh/busy contract before interacting; they do not retry product assertions or change failure classification. The exact commit passed browser harness 12/12 in focused and independent runs and retained the existing bounded cleanup/fail-closed discovery behavior.

PR #8 Ubuntu run 249 then surfaced a CDP timeout while opening Settings. Although the immediate harness observation was a transport timeout, source tracing proved the root cause was product reentrancy when the platform returned zero speech voices. The failure therefore remained red and was fixed in product code; no CDP timeout, click retry, assertion or failure classification was weakened. This preserves the rule that an infrastructure-shaped symptom does not override a demonstrated product root cause.

Revisit when: the CI browser transport or process ownership model changes; preserve deterministic discovery, bounded cleanup and failure-kind separation.

## ADR-028 — Verification is receipt-bound, not an Attempt self-claim

Status: CONFIRMED

Decision: an Attempt contains learner action, exact target, result and a complete authority-named AssistanceTrace; it cannot declare itself independent or verified. EvidencePolicy separately requires source and, for Production/Retell, evaluation receipts from closed authorities. Receipts bind the exact activity, card, skill, source revision, learner-output digest and target assessment. The decision ID includes a canonical digest of every normalized input that can change the verdict.

Consequences: legacy or partially traced attempts fail closed. A repeated receipt with identical normalized input is deterministic; reusing it with a changed result, error classification, assistance event, source receipt or evaluation receipt produces a different binding that the persistence gateway can reject as a collision. Qualified `Again` remains evidence of failure but never successful evidence.

Evidence: P0-01 independently accepted source commit `0ec315f7a77e2fac6bad71a548b6ccc71961687b`; focused matrix 38/38 and full unit suite 128/128.

Revisit when: verifier authorities or persisted receipt schemas change; add a new policy version instead of weakening old receipt bindings.

## ADR-029 — Persistence re-evaluates evidence and quarantines terminal legacy writes

Status: CONFIRMED

Decision: every new Core review event persists the complete normalized Attempt, ActivitySpec and verification receipts. The persistence boundary independently re-runs EvidencePolicy and requires an exact EvidenceDecision match before applying the card projection and review event atomically. A duplicate receipt with the same binding is idempotent; a different binding is a terminal collision. Legacy or invalid review outbox rows remain fail-closed and are durably marked `quarantined`, surfaced in persistence status and skipped so they cannot block later valid writes.

Consequences: a caller cannot obtain a schedule write merely by constructing a success-shaped decision object. Legacy rows are not silently deleted or converted into evidence. New events retain the existing reconciliation and calibration fields (`evidenceType` and `predictedRetrievability`) while adding the canonical evidence envelope and qualified-failure marker.

Evidence: P0-02 independently accepted source commit `2025b6320c8d72f116fbc2c0a9dcb4ae884697b6`; final full suite 136/136, focused compatibility matrix 21/21, static/roadmap/build/Core browser gates pass.

Revisit when: a later migration tool can transform quarantined legacy rows using independently verifiable provenance; never infer or fabricate missing evidence.

## ADR-030 — Phase 0 IELTS/V10 learning surfaces are explicitly coaching-only

Status: CONFIRMED

Decision: every current IELTS Dictation, Error Correction, lexical production and Retell path, plus the V10 sentence-loop Dictation and Retell path, is coaching-only because the same learning surface exposes transcript, correction or other preparation. These paths still persist canonical Attempt/ActivitySpec/source receipt/denied decision envelopes for audit, but they never fabricate evaluator receipts or write FSRS. V10 coaching constructors force authoritative collector/completeness/coaching fields after caller input. Retell requires non-empty learner output or an explicit Skip; IELTS persists the learner output before evaluator I/O and updates the same attempt to completed or failed.

Consequences: Phase 0 intentionally records fewer reviews, but removes false independent evidence. Legacy V10 completion without learner output becomes `unverified`; new Skip and coaching completion remain semantically distinct. A later independent mode requires a separately reviewed UI with hidden answer surfaces, immutable source revision and a real target-bound evaluator receipt; it cannot weaken this containment in place.

Evidence: P0-03 independently accepted source commit `12b1cf8488fcacf4369a91e8b89a52dc93171f1f`; full suite 142/142, focused containment 34/34, IELTS audit 11/11, V10 audit 55/55, build and both browser suites pass. Browser evidence includes evaluator failure with durable learner output, reload, empty/Skip, cross-run save race and same-run double-click transition.

Revisit when: P3-03/P3-04 provides a genuinely independent Dictation/Retell surface and canonical event repositories; retain all coaching records and legacy-unverified markers during migration/rollback.

## ADR-031 — Portable backup uses a complete registry with record-level mixed-store rules

Status: CONFIRMED

Decision: full backup schema v2 is one canonical envelope over Core, IELTS and V10. The registry names every physical object store and external persistence surface, its owner, primary key, classification, export rule and later restore rule. Included rows are code-unit sorted and recursively canonicalized; every included store and the complete payload carry SHA-256 digests. Missing/unknown stores, newer schema/registry/database versions, duplicate keys, oversized or non-JSON data, manifest mismatch and credential-shaped fields fail the whole export or validation.

Whole-store classification is not allowed to erase mixed durable data. Imported/user transcripts remain complete even after an IndexedDB cache hit, while known provider transcript bodies export as reconstruction stubs/digests. Personal content assets remain complete, remote content bodies remain CacheStorage-only, coaching statistics are reconstructed from IELTS attempts/errors, and unknown metadata defaults durable while only named schema/catalog/operational keys are filtered. Core snapshots, drafts, outbox and migration ledgers are portable; device-bound file handles, PWA caches, session credentials and RAM fallback maps are not.

Consequences: manual and automatic “full backup” now use the same v2 envelope and no longer omit V10, drafts or outbox. Legacy Core v3, IELTS v1 and combined v1 remain readable. P0-04 does not activate sequential v2 restore: validation returns an explicit staged-restore requirement until P0-05 implements journal, failure recovery and reopened canonical verification.

Evidence: P0-04 independently accepted exact source commit `ffca938b6067e800ae21c5c9231a0b2b811a30de`; focused backup gate 5/5, full suite 147/147, V10 focused suite 31/31, static/audits/build pass. The first review found and the final commit closed a P1 case where a local cache read inverted imported-transcript provenance and would have removed learner segments.

Revisit when: a store gains a new mixed record class, credential field or binary representation; update the registry, migration adapters and every-store sentinel together before release.

## ADR-032 — Restore is a journaled cross-database operation with explicit degraded scope

Status: CONFIRMED

Decision: canonical v2 restore is available only through one coordinator holding the exclusive durable-storage lock used by Core, IELTS and V10 writers. The coordinator validates the complete payload, exact registry `keyPath` and every known unique index; preflights journal size/quota; records canonical before/target envelopes and owner checkpoints in Core metadata; commits each database in one transaction; reopens all databases; and compares the canonical logical digest before writing a completed receipt and removing the active journal. Startup recovery runs before any migration, outbox replay, snapshot or product mount. Forward recovery that cannot complete durably switches to a repeatable rollback of the last-known-good envelope.

The active journal is operational and cannot be exported or restored. The completed receipt is durable portable metadata. Excluded stores (`fileHandles`, derived coaching cache and CacheStorage) are never cleared. Legacy Core v3, IELTS v1 and combined v1 adapters preserve every current domain their format does not contain. No IndexedDB version is downgraded or raised for this protocol; journal, receipt and legacy card-shape reconciliation are additive at Core database version 4.

When IndexedDB is absent, there cannot be an IndexedDB restore journal. Startup may therefore enter a visibly labeled Core-only degraded mode only after localStorage writes are verified by read-back. IELTS and V10 are not imported or mounted in that mode. A degraded backup is explicitly `core-only`, passes through the same production file routers and coordinator, and preserves current IELTS/V10 when restored on a durable installation. Any unavailable, blocked, quota, version or unverifiable fallback condition remains a typed durable failure and never becomes RAM success.

Consequences: restore success means durable commit plus reopened canonical verification, not merely copied data. Cross-database export cannot race normal writes. Interrupted work either resumes or rolls back from a durable journal, while old readers remain compatible with database version 4 and may ignore additive metadata after recovery. The journal has a bounded size/headroom requirement; an oversized restore fails before mutation.

Evidence: P0-05 independently accepted exact source commit `426feb2c20f36d2eed9a66eca1b1c9fe9e9c4bbf`; restore suite 27/27, full suite 174/174, static checks, IELTS/V10 audits, production build and Core/IELTS/V10/Hardening browser suites pass. Browser evidence includes actual crash-journal reload recovery before mount and Core-only degraded startup/reload with a durable Quick Capture draft. Final reviewer patch ID: `f96a70fd92c0e210ef3526e0bfdc1299a1ea11c9`; no P0/P1 remained.

Revisit when: a fourth database/store owner joins the restore unit, payload size requires chunked staging, or cross-origin/multi-process writers replace the current Web Locks boundary. Preserve full validation before mutation and durable reopened verification.

## ADR-033 — Capture containment uses one durable adapter and forward-only verified cleanup

Status: CONFIRMED

Decision: production mounts one canonical Quick Capture form and one Inbox. The form delegates to the V10 candidate store when IndexedDB is available; only the explicitly labeled Core-only degraded boot may use verified localStorage drafts. A submit owns one stable record ID across retry, is single-flight, resets only after durable commit plus read-back, and retains current form input on any failure. Existing corrupt or unreadable degraded source data fails typed before mutation and remains byte-for-byte unchanged.

Legacy Core draft migration is forward-only under the exclusive cross-database storage lock. Each draft maps to a deterministic SHA-256 candidate ID. The migration commits every target, reopens V10 and verifies canonical projections before deleting any Core source; it then reopens Core and verifies cleanup. An interruption is retryable. An unrelated collision or a same-provenance target changed after an earlier copy fails closed and preserves both records. A target awaiting source cleanup cannot be finalized or rejected from the Inbox.

Consequences: the old V10 Capture panel/listener is removed rather than hidden, while Core-only degraded mode still has a truthful durable path. Partial migration can temporarily show a verified target and its retained source as one protected Inbox item, but cannot overwrite a newer user decision or report cleanup that did not durably occur. Rollback keeps all Core drafts and V10 candidates, does not downgrade either database and performs no automatic reverse migration.

Evidence: P0-06 independently accepted exact source commit `35cdc0b350a77797f6992feed1625067edc5674c`; focused Capture suite 8/8, full suite 182/182, restore 27/27, static/audits/build, V10 and Hardening browser suites pass. Browser evidence includes double submit, reload, offline keyboard, mobile layout, quota failure and corrupt degraded-source preservation. Final reviewer patch ID: `303f61d479ba527d83cb8bbf12cb5e08e7759f6b`; no P0/P1 remained.

Revisit when: Phase 1 introduces a canonical Capture repository/saga. Preserve stable retry IDs, typed degraded failures, forward-only data retention and commit/reopen/verify-before-delete semantics.

## ADR-034 — Today containment uses durable exact-target bindings

Status: CONFIRMED

Decision: production has one canonical Today route. Its runtime mount replaces the legacy Today subtree rather than hiding it, while desktop and mobile navigation are responsive controls for the same route. IELTS Hub no longer owns a Today tab and IELTS Lab no longer injects a Today error widget. A Today plan persists immutable activity/card/sense/skill/source revision, execution kind, plan identity and a digest of the complete launch projection. Reload resumes only a complete same-day plan whose stored launch bindings revalidate.

Every launcher re-reads the durable activity immediately before execution. Core creates exactly one step for the bound card and skill; the persisted ActivitySpec, Attempt, evaluator receipt, EvidenceDecision and review event retain the same sense target. Error repair opens the bound error ID and source revision without inferring from selected DOM state. Missing, stale, changed, targetless or unsupported activity fails closed. Unsupported media/reading/paraphrase/prepared-error activities are blocked/coaching-only and cannot schedule; degraded Core-only startup shows one disabled canonical Today surface rather than a RAM-backed plan.

All public build, refresh and launch operations plus route/external-change refreshes use one serial queue. A pending render immediately marks the Today host busy and disables the old controls; a failed operation rejects its current caller but cannot poison later queued work. Status is module state and is reapplied after DOM replacement, so a concurrent refresh cannot erase `TODAY_TARGET_STALE` or make an obsolete activity launchable.

Consequences: Phase 0 may temporarily reduce feature availability instead of launching a generic substitute. A forced refresh may replace a plan, but ordinary reload cannot silently rebuild a different target. Legacy activities remain durable and readable but default to blocked/no-schedule. The change is additive and does not raise any database version; rollback must preserve activity records and cannot promote missing target metadata into evidence.

Evidence: P0-07 independently accepted exact source commit `167c3c68abb3ec6627e2bf9d4fc5b762385e2852`; focused exact-target matrix 22/22, full suite 188/188 with zero skip/todo, static/build and Core/IELTS/V10/Hardening browser gates pass on Chrome `150.0.7871.188`. Initial review found and the follow-up fixed one P1 where non-null `senseId` was lost before evidence persistence. Final cumulative patch ID: `c3c3e509fa7ecadfd854d91b17edb2669e99a3f4`; no P0/P1 remained. The PR #8 recheck later exposed a separate render/status race; cumulative remediation source commit `755bb88519161b981da9d9f954565d8201bdb341` serializes Today work and was independently accepted with stale-target/no-session/zero-review assertions unchanged.

Revisit when: Phase 1 introduces the canonical Today Composer/Runner. Preserve durable exact-target projection, stale-target fail-closed behavior and receipt-level sense provenance through migration and rollback.

## ADR-035 — Phase 0 release acceptance is bound to an exact reproducible artifact

Status: CONFIRMED

Decision: P0-08 owns one fail-fast `phase0:gate` that starts from a clean dependency install and executes the release evidence, adversarial EvidencePolicy, every-store backup sentinel, restore/rollback, Capture, Today, full unit, static, audit, production build, server/preview and deterministic browser gates. The gate rejects a dirty worktree, wrong exact commit, skipped/todo tests, browser discovery skip paths, temporary/debug artifacts and repository hygiene violations. It records OS, Node, browser/version and a canonical SHA-256 digest of the production artifact.

The Phase 0 hard gate requires three consecutive clean passes at the same exact commit and a separate read-only reviewer reproduction of the cumulative diff. A stale source-shape assertion must be updated to validate the current stronger runtime boundary when an accepted containment package deliberately removes the old entry point; it must never be deleted merely to make the audit green. Product failures remain product failures and cleanup failures remain infrastructure failures.

Consequences: Phase 0 acceptance can be reproduced from the commit and compared to one canonical artifact instead of relying on an implementer report. Documentation commits after the accepted source commit do not silently redefine product evidence; the final pull request records both the accepted source commit and its documentation commit. P0-08 adds no product migration, database version or rollback mutation.

Evidence: an independent gate at `bea687e27d93f43b4d584aaf785dee18abd29a6d` rejected Phase 0 after a pre-restore automatic snapshot timer mutated the snapshot store after rollback verification. Commit `b2ed6c09acd97747c46556395e47ab68b9e2021b` invalidates scheduled Core maintenance at every exclusive restore/recovery boundary and generation-fences stale callbacks before enqueue and inside the write queue. Its deterministic regression holds restore across the former 1.5-second timer window.

The original accepted exact source commit `b2ed6c09acd97747c46556395e47ab68b9e2021b` passed `npm run phase0:gate` 21/21 three consecutive times (79.3 s, 68.3 s and 60.4 s), each with restore 28/28, full suite 191/191 and zero failure/skip/todo. The canonical 26-file, 740790-byte artifact SHA-256 was `1b361e26c9d20feb2bd53d4f9475185a99f0d1c75232c53e09c69aa1131619b6` on every run. The independent reviewer reproduced 21/21 in 61.9 s with the same digest and accepted the cumulative Phase 0 patch ID `9d713cb564266a7e2794a2116f7b5310870c2665`; no P0/P1 remained.

After PR #8 CI exposed the cross-host P0-00 path defect, remediated exact source commit `67c5a275a450a8b88d2daf54e299538358bf8f00` passed 21/21 three consecutive times (68.2 s, 61.0 s and 58.3 s), each with restore 28/28, full suite 191/191, browser harness 12/12 and zero failure/skip/todo. The canonical 26-file, 740795-byte artifact SHA-256 was `7ff334972eb6114118e83e28f74bf47efe4b90b3c28fbf70a1ddc8912740d236` on every run. The independent reviewer reproduced focused 12/12 and full 21/21 in 60.1 s with the same digest, accepted stable remediation patch ID `00d5670cb4a7a9fe45492d8de99bdd9c45bc6d19` and found no P0/P1. Final release authorization awaits the pushed GitHub Ubuntu CI result.

The required documentation-head gate then exposed a real P0-07 Today render/status race, so the earlier remediation acceptance was not treated as cumulative release evidence. Exact source commit `755bb88519161b981da9d9f954565d8201bdb341` fixes that product race and the resulting controlled-fixture readiness boundary. It passed 21/21 three consecutive times (50.9 s, 51.9 s and 51.7 s), each with restore 28/28, full suite 191/191, browser harness 12/12 and zero failure/skip/todo. The canonical 26-file, 741650-byte artifact SHA-256 was `320deca5b672a6801c6aab07c436cdd66b68287c5c74ec69ce87ac329c477f92` on every run. The independent reviewer reproduced focused browser harness 12/12, Today 4/4, Hardening PASS and full 21/21 in 56.2 s with the same digest, accepted cumulative remediation patch ID `4b1c7099258f891b19b1ca405060c6f9ffc27a2c` and found no P0/P1. Release authorization remains blocked only on the pushed PR #8 Ubuntu CI result.

Ubuntu run 249 invalidated that release authorization by exposing a zero-voice reentrancy loop in Settings. Exact source commit `d869eb444ea917b6e9ba3d1b7349e323d38560d5` adds an in-progress fence and stable empty-discovery state while retaining explicit late refresh, `voiceschanged` and speech-intent discovery. It passed 21/21 three consecutive times (50.4 s, 54.0 s and 51.8 s), each with restore 28/28, full suite 192/192, browser harness 12/12 and zero failure/skip/todo. The canonical 26-file, 741702-byte artifact SHA-256 was `71772f3cd42dce06ca537c30fb0d3cda43298691022a27969c43071a6024db54` on every run. The independent reviewer reproduced audio 6/6, an explicit late-refresh/`voiceschanged` probe, Core browser and full 21/21 in 55.9 s with the same digest, accepted cumulative remediation patch ID `66a72821e3df6f89d449ce428065f522f8ee163f` and found no P0/P1. Release authorization remains blocked only on the pushed PR #8 Ubuntu CI result.

PR #8 Ubuntu CI run `30514506669` (run 250) passed on integration head `ebe276ac1b690ae561c288787089a4c275709bfb` and generated merge commit `09e29ab`. Ubuntu 24.04.4 with Node `v22.23.1` and Chrome `150.0.7871.128` passed unit/static/audit/build/server/preview plus Core, IELTS, V10 and Hardening browser gates. This restores Phase 0 release authorization for source commit `d869eb4`; a later documentation-only head must keep the PR check green but does not redefine the accepted product artifact.

Revisit when: the build artifact format, required browser matrix or release topology changes. Preserve exact-commit binding, clean reproducibility, canonical digest comparison, product/infrastructure failure separation and independent review.

## ADR-036 — Phase 1 uses one canonical learning spine with additive durable projections

Status: CONFIRMED

Decision: ActivitySpec, Run, Attempt, Receipt and EvidenceDecision are the canonical planning/execution/evidence contracts for Core, IELTS and V10. Core database version 5 stores each canonical envelope as four append-only events plus an idempotent projection and poison-event dead letter. One receipt/event identity can cause at most one Core review mutation. Legacy review/progress readers remain projections; a replay can rebuild canonical projections without inventing evidence.

Cross-database lexical work is coordinated by V10 workflow intents with stable step IDs, durable checkpoints, bounded retries, actionable quarantine and additive tombstones. Capture finalization and lexical merge use those intents instead of dispatch-only completion. V10 versions 2–5 add workflow intents, canonical transcript source/revision/segments, global error records/occurrences/repairs and durable Today runs. No Phase 1 migration hard-deletes a legacy record or downgrades a database.

Transcript edits create child revisions and never mutate historical source text used by attempts. Error totals reduce idempotent occurrences; only target-bound independent verified correction can resolve an error. Today composition is deterministic and due-first, and each runnable row owns an exact canonical ActivitySpec. The runner revalidates the durable binding, leases one active run across tabs, resumes the same run after reload and records target-matching receipts for completion, skip or cancel.

Consequences: backup/restore registry coverage grows with every new physical store. Rollback builds may ignore additive stores but must not delete them. Targetless, stale, unknown-version, collision and unsupported-executor data fail closed or quarantine. The implementation may reduce runnable content when no exact target/executor exists; it cannot substitute a generic target.

Evidence: implementer-focused P1 suites and the cumulative 233/233 unit/integration suite pass with zero skip/todo; Core, IELTS, V10 and Hardening production browser suites pass on Chrome `150.0.7871.188`. The independent read-only review examined the cumulative P1 diff and reproduced `npm ci --no-audit --no-fund`, `npm run phase0:gate` (21/21) and `npm run phase1:verify` (22/22) on clean merge commit `9da21e1c3cb34b7372f1b33c541d7442dd0390c9`; no P0/P1 finding remained. PR #9 merged at that commit and GitHub Actions CI run 255 (`30533541002`) completed successfully. This confirms the decision and accepts P1-00…P1-08.

Revisit when: a fourth persistence owner joins the learning transaction, transcript identity must span cross-source alignment, or a new Today executor needs a target type not representable by the current exact learning target. Preserve append-only evidence, immutable source revision and default-deny schedule semantics.

## ADR-037 — Phase 1 delivery uses one user-authorized phase branch without weakening package acceptance

Status: CONFIRMED

Decision: the user explicitly authorized `codex/phase-1-core-unification` for the complete phase. P1-00…P1-08 therefore share one delivery branch, while package boundaries remain visible through modules, focused tests and the implementation report. A later package may rely on the preceding implementation in this branch, but no implementer result is relabeled as independent `ACCEPTED`.

Consequences: the phase can be reviewed as one cumulative diff, but Phase 2 remains blocked until an independent reviewer validates the clean exact source and CI. The single-branch topology does not waive migration, rollback, real IndexedDB, desktop/mobile browser or reconciliation evidence.

Revisit when: the branch is split into package pull requests or the acceptance authority requests per-package exact commits. Preserve dependency order and do not infer acceptance from merge topology.

## ADR-038 — Phase 3 absorbs the accepted Phase 2 integration limitations

Status: CONFIRMED

Decision: Phase 2 is accepted at merged `main` commit `cf28153352110cae510c92e2a8f911a6d65497ca` with its recorded production-UI and continuity limitations. The user-authorized Phase 3 branch `codex/phase-3-full-video-workspace` delivers P3-00…P3-06 together and owns the first production integration of resolver cancel/resume/reload, SSE reconnect and canonical transcript activation. This changes delivery topology, not package acceptance: every P3 package remains `REVIEW_REQUIRED` until independent exact-head reproduction.

Consequences: no separate Phase 2 hardening branch is opened and no Phase 0/1 gate is repeated unless this branch changes migration, EvidencePolicy, backup/restore or canonical persistence. Phase 3 may consume existing canonical transcript and evidence APIs, but cannot silently weaken them. Phase 4 and Phase 5 are not unlocked by implementer evidence.

Revisit when: independent Phase 3 review requires a split package remediation or identifies a predecessor regression. Preserve the accepted Phase 2 boundary and exact-head acceptance rule.

## ADR-039 — Phase 3 Strict Practice is local-first assistance control, not a device-owner security boundary

Decision: Dictation Strict is displayed as Strict Practice. Before submission, the expected answer must be absent from visible and hidden exercise DOM, ARIA/accessibility text, data attributes and exercise-specific rendered state. Practice hints and all answer/correction exposure are recorded in the canonical AssistanceTrace, which remains schedule-ineligible. The app intentionally does not claim tamper resistance against a device owner inspecting the canonical local transcript with browser developer tools.

Consequences: Phase 3 makes truthful local-first learning and FSRS claims without adding a trusted answer server or remote examination boundary. Transcript revisions remain the durable canonical source and are not treated as a secret.

## ADR-039 — Video Workspace disclosure, editing and Retell remain fail-closed

Status: CONFIRMED

Decision: one workspace controller owns player, virtual transcript rail, learning mode and active canonical revision. Dictation Strict omits answer text from DOM, ARIA and copy surfaces before submit; Practice may expose a semantic hint only when the assistance trace records it. Transcript edits use optimistic base-revision validation and immutable child revisions. Retell persists learner output but remains coaching-only when no independent evaluator is present.

Consequences: changing mode may deliberately rerender the active sentence, but cannot change sentence identity. A concurrent edit produces `TRANSCRIPT_EDIT_CONFLICT` instead of last-write-wins. No strict or assisted activity in this package bypasses EvidencePolicy, and no Retell score is fabricated. Mobile uses the same controller and canonical revision as desktop.

Revisit when: a qualified independent Retell evaluator, variable-height virtualizer or cross-device transcript synchronization is introduced. Preserve semantic answer omission, assistance provenance and immutable history.

## ADR-040 — Phase 3 independent acceptance unlocks Phase 4 only

Status: CONFIRMED

Decision: Phase 3 is independently accepted at source HEAD `96aa0172add84186fbe2970cde910b06a0d73672`. Exact-head CI run #259 succeeded, and PR #11 merged into `main` at `d1fe0dbec9db6405938ec74111e8e25ba4792fee`. Phase 4 may therefore begin on the user-authorized branch `codex/phase-4-remote-content-platform`.

Consequences: P4-00…P4-10 may be implemented without rewriting roadmap dependencies. This acceptance does not authorize Phase 5 ASR/cloud fallback, Phase 6 content factory/scale or Phase 7 personalization. Phase 5 remains locked.

Revisit when: Phase 4 reaches its own exact-head CI, independent focused audit and merged-PR acceptance boundary. Implementer evidence must not mark Phase 4 or its packages `ACCEPTED`.

## ADR-041 — Phase 4 separates immutable catalog bytes from durable learner truth

Status: PROPOSED / REVIEW_REQUIRED

Decision: published catalog manifests and media use immutable SHA-256 identities
and CacheStorage namespaces because they are independently verifiable and
redownloadable. IndexedDB version 7 owns signed last-known-good catalog state,
install journals, installed-pack pointers, activation receipts, revocations,
tombstones and learner progress. No durable operation may report success from a
RAM fallback. Activation occurs only after every mandatory byte and lesson
reference is verified, and an update installs side-by-side before one atomic
pointer switch.

The learner bundle contains only public verification roots. Private signing
keys and authoring credentials are environment-provided to the isolated
publishing scaffold and are never committed. HTTPS is transport only, not
catalog authenticity. Unsigned legacy fixtures are explicitly excluded from
the production trust path.

AI-assisted sampler and Starter Pack material remains draft provenance.
Production validation rejects pending rights, AI-only provenance, unnamed
reviewers, missing review checks and unpublished timestamps. Therefore the
bundled production catalog is validly signed but empty until named humans
confirm ownership/license, pedagogy and accuracy, and a separate publisher
signs the resulting artifact. This is an intentional release block, not a
missing-data default.

Consequences: clearing CacheStorage cannot delete progress. Portable backup
contains install metadata, receipts, journals, tombstones, revocations and
progress, while remote media bodies become digest-bearing reinstall stubs.
Restore never fabricates verified media. Rollback may disable remote activation
or select a retained verified revision, but it does not lower an IndexedDB
version, remove unfamiliar stores or reinterpret a newer schema as empty.
Revoked packs cannot start new lessons while historical evidence remains.

Revisit when: an external content repository is provisioned and its named
rights/review records are approved. Preserve the public-key/private-key
boundary, immutable address semantics, weekly defect-review ordering and
default-deny publication gate. Phase 5 ASR/cloud fallback and Phase 6 automated
content factory remain outside this decision.
