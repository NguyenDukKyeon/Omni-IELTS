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

Technical remediation clarification: lesson identity is the SHA-256 and byte
length of deterministic canonical lesson bytes, and human review binds that
exact content address. Activity asset references are lesson-scoped, and remote
activities expose the canonical learning target plus exact pack, lesson and
activity revision fields. Durable revocations are monotonic device evidence:
they are unioned with valid current-catalog revocations and cannot be cleared
by omission, rollback or restore. An expired last-known-good catalog may
support policy-approved offline launch of already-installed compatible,
non-revoked content, but it cannot drive discovery, install, update or Today.

Catalog sequence equality is digest-bound inside the IndexedDB write
transaction. Key rotation requires explicit predecessor authorization in
addition to bundled key validity; only a designated bootstrap key may
establish first trust. Fallback installer leases renew with immutable fencing
generations and are checked again inside atomic activation. Restored Phase 4
records remain non-active until schema, pointer/receipt, compatibility,
revocation, content contract and redownloadable cache state are reconciled;
unsupported records are retained in quarantine rather than reinterpreted.

Revisit when: an external content repository is provisioned and its named
rights/review records are approved. Preserve the public-key/private-key
boundary, immutable address semantics, weekly defect-review ordering and
default-deny publication gate. Phase 5 ASR/cloud fallback and Phase 6 automated
content factory remain outside this decision.

## ADR-042 — Phase 5 is caption-first, private by default and capability-honest

Status: PROPOSED / REVIEW_REQUIRED

Decision: the user explicitly authorized P5-00 through P5-05 on one cumulative
branch from `main` baseline `fc6057fa66c510b0cd12a7fb9e1e74a6379b4225`.
This uses the accepted P2-06 durable resolver entry gate and does not accept or
modify Phase 4 rights and human-review records. The canonical provider order
always attempts the existing caption resolver before any ASR path.

Local ASR is a desktop companion capability bound to loopback, authenticated by
a pairing token and restricted to allowlisted origins. It receives only a
canonical public YouTube source after explicit rights/no-auth/no-cookie checks,
owns every process argument and temporary path, emits progressive private
unverified batches into the existing ResolverJob, and deletes task media on
success, error or cancellation. Models are optional reconstructable device
cache and are never auto-downloaded or exported.

Gemini is disabled by default. It requires a current versioned consent receipt
covering data transfer, provider retention and possible cost, a server-side
credential, and the same public/no-auth/no-cookie/rights-eligible source
contract. The adapter sends the public media URL directly, creates no uploaded
temporary provider file, permits at most one billable request with one 429
retry, and stores output only as a private unverified canonical transcript
revision. Client-supplied ASR credentials and the legacy automatic cloud
transcript route fail closed.

Mobile never advertises the desktop companion. It retains caption, explicitly
consented Gemini when provisioned, and strict SRT/VTT/text import recovery.
Import rejects malformed, overlapping and duplicate timed cues; timingless text
gets deterministic local timing. Every import uses the existing Transcript
aggregate as private/unverified data. No parallel transcript or resolver-job
repository and no EvidencePolicy exception are introduced.

Migration is additive: Phase 5 preferences and consent live in existing V10
metadata, range checkpoints live in existing resolver jobs, and provider/import
outputs use existing transcript sources, immutable revisions and segments.
Full backup preserves consent, settings, imports and checkpoints while omitting
credentials, models and raw media. Rollback disables Local and Gemini adapters,
ignores additive fields and preserves already-created private transcript
revisions; it never lowers an IndexedDB version or deletes learner data.

Consequences: deterministic fake binaries/providers are the CI authority for
control flow, consent, cost, retry, cleanup and persistence. They are not
evidence of live Whisper accuracy, device performance, Gemini availability or
provider quality. Live smoke is an explicit provisioning-dependent review item.
Phase 5 remains `REVIEW_REQUIRED`; Phase 6 and Phase 7 are not authorized.

Revisit when: a reviewed mobile on-device ASR, a different approved server
provider, changed Gemini retention/billing terms or private/authenticated media
support materially changes the capability, privacy, rights or cost boundary.

## ADR-043 — Portfolio umbrellas are grouping-only and package boundaries are ratified incrementally

Status: CONFIRMED

Context: VocabMaster needs a portfolio view across learning integrity,
local-first assistance, personal content, four-skill practice and diagnostics
without replacing the canonical Phase 0–7 roadmap. A prior working-tree
planning overlay contained useful future boundaries but was based on stale
lineage and cannot be ratified wholesale.

Decision: establish five grouping-only umbrella identifiers: U-LI, U-AI,
U-PCS, U-4S and U-FD. They are not phases, packages, dependency nodes, status
owners, gates or acceptance owners. Canonical ownership remains
package-specific under ROADMAP/PLAN/STATUS/DECISIONS authority.

CR-2A ratifies only LI-00, SRC-00, ERR-00 and QAR-00 as canonical package
boundaries. Each begins `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`;
documentation creates no branch, source implementation, evidence or
acceptance. Remaining candidate dispositions stay preserved as noncanonical
planning input and may be rebound only in a separately approved wave
immediately before implementation. Merge candidates are ported into their
existing owner rather than receiving a silent duplicate status row.

Consequences: ROADMAP owns the four identities/scopes/dependencies;
IMPLEMENTATION_PLAN owns their bounded acceptance criteria;
IMPLEMENTATION_STATUS owns their honest planning state. Umbrella labels never
appear in the status ledger. This decision does not change Phase 0–7 gates,
Phase 4/5 evidence, historical P5-05/ADR-042, or authorize a future package by
mention alone.

## ADR-044 — EWF-00 is a cross-cutting repository foundation with no product authority

Status: CONFIRMED

Context: the Engineering Workflow Foundation design at exact commit
`adc3726620f4badddb16309e375f8f17b6af1404` is approved as the architecture
baseline. Design approval does not mean implementation or acceptance. The
design file deliberately remains unchanged; before this governance bootstrap,
Foundation implementation remains `GOVERNANCE_BLOCKED`.

Decision: canonicalize EWF-00 — Engineering Workflow Foundation under
Cross-cutting Repository Engineering, outside Phase 0–7 and outside all five
U-* portfolio umbrellas. EWF-00 has no hard product-package dependency and
reuses existing acceptance-harness and independent-audit conventions without
owning them. After this bootstrap its initial package status is
`PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.

EWF-00 acceptance is bounded to the minimal constitutional bridge,
one-writer/worktree preflight, lightweight repair record, structured spec
metadata, focused/PR verification profiles, implementation verification
report, frozen acceptance brief, requirement-to-test-to-command-to-evidence
trace validation, declared negative fixtures, CLI-absent operation, one
small-repair pilot, one bounded spec-level pilot, overhead measurements and an
independent exact-commit audit. The independent canonical auditor owns the
acceptance verdict; the implementer cannot self-accept.

Consequences: CR-3 changes governance metadata only. It does not implement
EWF-00, change product behavior, reconcile Phase 4/5, create another
status/acceptance authority, install Spec Kit/fast-check/dependencies, or
authorize dashboard, daemon, workflow runtime, mutation suite, broad fuzz or
portability automation. Every later specification, implementation and pilot
requires its own exact predecessor, boundary and authorization.

## ADR-045 — EWF foundation implementation is integrated while package acceptance remains pilot-gated

Status: CONFIRMED

Context: `EWF00-ARTIFACTS-001` and `EWF00-PREFLIGHT-001` have each received independent exact-identity acceptance and are integrated into `main`. Their implementation and evidence identities remain subordinate evidence under canonical AGENTS/ROADMAP/PLAN/STATUS/DECISIONS authority; they do not self-determine package status or acceptance.

Decision:

- `EWF00-ARTIFACTS-001` is `ACCEPTED / INTEGRATED` at implementation subject `dc3aa8aa8084abee6819ffcbc238bd7e6f483b6c`, evidence subject `826dbe9027325c350b0b734a3861e0dfa038e0cd`, and integrated main `474bde8e3c7b09f757e7df4a1587f8a71b2e7865`.
- `EWF00-PREFLIGHT-001` is `ACCEPTED / INTEGRATED` at approved implementation predecessor `250b879fa06b7be50a198e3cf007637c5f9d7306`, implementation subject `51bea1457153b3e3a686fe4689ed0bfabbd0072a`, evidence revision `255aafe80ad477dd1ac737f51951e2fbd89fd7ea`, authorization merge `8bd47a9304cb457a611ca0ce2228e87ae56f468e`, and final integration merge `57bfa4e77c392a70429c212971c6917b43697213`. Final-main CI run `31006812002` / `#292` completed successfully with 484 of 484 tests passing.
- PR #22 merged the authorization documentation. PR #24 merged the accepted implementation/evidence lineage.
- PR #23 was not separately merged through a merge operation. GitHub automatically recorded it as merged because its exact head became an ancestor of `main` through descendant PR #24. Its `merge_commit_sha` equals its implementation head, so no distinct PR #23 merge commit and no duplicate implementation integration occurred.
- The canonical EWF-00 state is `IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED`.
- `EWF00-PILOTS-001` remains `NOT_GRANTED / UNAUTHORIZED`; no pilot has begun and no pilot evidence is claimed.

Package acceptance remains gated on one independently audited eligible small-repair pilot, one independently audited bounded spec-level pilot, measured overhead data, and an independent exact-commit EWF-00 package audit.

Consequences: this reconciliation changes canonical delivery status only. It does not change EWF-00 scope, dependency, product behavior, Phase 0–7 gates or ownership. It does not authorize or unlock product work, P3-02, LI-00, SRC-00, ERR-00, QAR-00 or any other product package. A separate pilot authorization is the next canonical gate.

## ADR-046 — Bounded execution capsules reduce handoffs without reducing gates

Status: CONFIRMED

Context: the EWF pilot sequence demonstrated that repeated comments can separate authority clearly, but prompt count is not itself an acceptance predicate. Requiring a new user handoff for every mechanically conditional transition adds latency without improving quality when exact authority, immutable repository evidence and independent final acceptance are already frozen.

Decision: adopt `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1`. One independently reviewed Wave Authorization Manifest may contain separate exact records for multiple executable packages or research lanes. After repository-recorded manifest `ACCEPT`, bounded executors may perform only the conditional sequence frozen for each record: fresh Stage 0, exact predecessor binding, test-only Commit A, exact-head natural product-defect RED, minimal source-only Commit B, exact-head GREEN, pre-authorized implementer-evidence materialization and exact read-back, followed by a mandatory independent audit.

The manifest freezes canonical owner, writer, exact predecessor, dependency state, branch/PR topology, exact allowlist and exclusions, baseline CI, RED eligibility and invalidation, minimal GREEN, verification profile, evidence schema/path/authority, migration/rollback, stop conditions, integration rule and acceptance-criteria source. One writer remains mandatory. Every package keeps separate commit, RED/GREEN, evidence and verdict identities; one package cannot inherit another package's acceptance.

Quality comes from immutable technical predicates and independent acceptance, not from requiring a separate user prompt for each administrative transition. Exact predecessor, natural RED, minimal GREEN, exact-head CI, exact SHA/blob/path verification, evidence provenance, owner/overlap checks, canonical authority and fresh independent acceptance remain mandatory. The executor cannot self-accept. Drift, overlap, invalid or ambiguous RED, unexpected CI, evidence mismatch and dependency or migration ambiguity fail closed.

A manifest may pre-authorize mechanical post-verdict merge or exact reconciliation only after the independent verdict is posted and read back, accepted heads remain unchanged, required CI remains successful and mergeability is clean. It cannot authorize implementation mutation by the auditor before verdict. Canonical `AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md` and `docs/DECISIONS.md` retain their existing authority; EWF artifacts and implementer evidence remain subordinate and cannot create status or acceptance.

Protocol V1 does not create a workflow runtime, DAG engine, daemon, scheduler, retry engine, new GitHub Actions workflow, CI mutation, dependency installation, automatic owner, automatic acceptance/status authority, dashboard, mutation suite, broad fuzz or product behavior. Those mechanisms are unnecessary for the bounded governance objective and remain outside EWF-00 scope.

Activation: this protocol is `PROPOSED / NOT ACTIVE` until this governance amendment receives independent exact-head `ACCEPT` and its pull request is merged into `main`. Pilot A remains `ACCEPTED HISTORICALLY / UNCHANGED`; its commits, comments, evidence and verdict are not reinterpreted. Pilot B remains `UNAUTHORIZED`. Pilot B may opt in only after protocol activation and after a separate Pilot B Wave Authorization Manifest freezes its owner, predecessor, allowlist, RED/GREEN rules, evidence and stop conditions and receives independent `ACCEPT`.

Consequences: accepted manifests may remove intermediate administrative authorization comments without removing any technical predicate. Multi-package execution is possible only across independently rejectable, non-overlapping boundaries with explicit dependency sequencing. Independent batch audits remain authoritative and must state per-package verdicts.

Rollback: revert this governance amendment without rewriting implementation history, invalidating prior accepted verdicts or deleting recorded evidence. Future work then returns to per-transition authorization; all historical Pilot A and other accepted evidence remains intact.

## ADR-047 — Measured PMA-12 exception permits one bounded read-only measurement workflow

Status: CONFIRMED

Context: ADR-046 deliberately keeps a new GitHub Actions workflow, workflow runtime and CI mutation outside the general EWF-00 bounded-execution-capsule scope. That general rule remains correct. A later measured need is now independently recorded: PR #37 Governor STOP comment `5225048322` proved that the valid Pilot B partial attempt had no valid pre-Commit-A baseline and no independently bound execution of the eight exact focused declarations. PR #38 Independent Audit comment `5225337210` then accepted `CONTROLLED_SUBJECT_PAIR_V1` but rejected the initial `EWF00-MEASURE-EXEC-001` substrate because a subordinate spec could not override ADR-046 and because five additional execution mechanics remained incomplete.

Decision: ratify one narrow, measured PMA-12 exception to ADR-046. After `EWF00-MEASURE-EXEC-001` receives separate independent exact-head spec acceptance, after a separate substrate implementation authorization is independently accepted, and after the resulting implementation receives independent exact-subject implementation acceptance, that subordinate boundary may own exactly one bounded read-only measurement workflow plus its executor and test:

```text
.github/workflows/ewf-measurement.yml
scripts/ewf-measurement-executor.mjs
tests/ewf-measurement-executor.test.mjs
```

The exception exists only to form mechanically auditable exact-command and controlled-measurement evidence required by PMA-12 and `CONTROLLED_SUBJECT_PAIR_V1`. It does not itself authorize the implementation, a substrate candidate, a Pilot request, Pilot B, LI-00 or EWF-00 acceptance. The implementation remains subject to one-writer/exact-predecessor/allowlist authority and fresh independent acceptance.

This exception does **not** authorize general CI redesign, a DAG engine, scheduler, daemon, retry engine, automatic remediation, automatic acceptance, automatic status mutation, deployment, package publishing, broad fuzz/mutation automation, product implementation or any second governance/status/acceptance authority. ADR-046 remains controlling everywhere outside the exact three-path measured PMA-12 exception above.

The permitted workflow is read-only with respect to repository and product state. It may read exact repository/PR evidence and create normal Actions logs/artifacts, but it receives no workflow authority to mutate repository refs, comments, package status, deployments or product state. Product commands remain separately authority-bound and cannot grant themselves shell authority through a request manifest.

Activation: ADR-047 does not self-activate the substrate. The current PR #38 root-repair head requires a fresh independent audit after remediation. Only an independently accepted and integrated root repair may support a separately authorized substrate implementation; only an independently accepted substrate implementation may later be referenced by a separately authorized real Pilot measurement.

Consequences: PMA-12 can obtain the missing natural exact-command/measurement carrier without turning EWF-00 into a general workflow framework. All historical PR #37/PR #38 evidence and verdicts keep their original exact-head meaning. No product package status or acceptance changes.

Rollback: removing a future accepted measurement substrate restores the manual EWF path without changing product source, product history, recorded evidence, package status or verdict history. ADR-046 then continues to govern all remaining workflow/automation behavior exactly as before this narrow exception.

## ADR-048 — Wave 6 WKN-00 canonical owner rebind to P7-00

Status: CONFIRMED

Decision:
P7-00 is eligible to receive a separate bounded implementation authorization.
P7-00 IS NOT implementation-authorized by this ADR.
WKN-00 is canonically absorbed into P7-00.
A future executable authorization must separately freeze an exact implementation predecessor under Protocol V1.

Consequences: 
The canonical evidence/errors to deterministic versioned WeaknessProfile projection boundary is established under P7-00.
The WeaknessProfile contract requires the same canonical inputs, taxonomy version, and projector version to equal the same output. It explicitly requires denominator, sample size, reason codes, uncertainty, insufficient-data state, and provenance.
Sparse/conflicting evidence must NOT become weak, mastered, ready, or band estimate.
AI cannot write canonical WeaknessProfile.
There is no second metrics truth, no second Error Repository, no second Today scheduler, and no FSRS tuning.

Revisit when:
A bounded execution authorization candidate with an exact implementation predecessor is created.

## ADR-049 — Owner-ratified Stage 1–8 Master Roadmap is the top-level product authority

Status: CONFIRMED

Context: the Owner-ratified product roadmap defines eight numbered product
Stages (1–8) with an interstage governance gate (Stage 1.5). The existing
`docs/ROADMAP.md` describes Phase 0–7 technical packages and declares itself
`CANONICAL`, creating ambiguity about whether it is the top-level product
roadmap or a subordinate technical taxonomy. Future agents have confused
Stage numbers with Phase numbers (e.g. treating Stage 2 as Phase 2).

Decision:

- `docs/MASTER_ROADMAP.md` is the Owner-ratified top-level Master Product
  Roadmap (Stage 1–8). It owns Stage identities, missions, ordering and
  completion state.
- `docs/ROADMAP.md` is reclassified as Level 2 — Subordinate Technical
  Package Taxonomy. It retains canonical authority over Phase 0–7 package
  IDs, dependency graph, architecture boundaries and cross-cutting packages.
  It is NOT the top-level Master Product Roadmap.
- Stage numbers (1–8) do NOT map 1:1 to Phase numbers (0–7). Stage 2
  (IELTS Completeness) is NOT Phase 2 (Caption-first Transcript Resolver).
  Stage 1 Waves (W0–W6) are NOT Phase IDs.
- Historical accepted package identities (P0-00 through P7-05, LI-00,
  SRC-00, ERR-00, QAR-00, EWF-00), evidence, architecture boundaries and
  acceptance verdicts remain valid unless separately superseded.
- This authority change does NOT authorize Stage 2 implementation, wave
  strategy, or any source/test change.

Consequences: all governance documents (`AGENTS.md`, `IMPLEMENTATION_PLAN.md`,
`IMPLEMENTATION_STATUS.md`) now reference `docs/MASTER_ROADMAP.md` as the
top-level product authority. `docs/ROADMAP.md` retains its full Phase 0–7
technical knowledge and package-level canonical authority. Future agents must
distinguish Stage (product) from Phase (technical) and cannot infer Stage
identity from Phase number or vice versa.

Revisit when: the Stage sequence, authority hierarchy or Stage/Phase
relationship materially changes. Preserve the taxonomy distinction and
historical acceptance validity.

## ADR-050 — Stage 2 targets Full IELTS Platform (Academic + General Training)

Status: CONFIRMED

Context: The Owner explicitly selects Option B — Full IELTS Platform for Stage 2
IELTS Completeness. A product and technical strategy reconciliation is required
to define the official coverage matrix, gap register, reusable Stage 1
substrate, target product contract (`IELTS_COMPLETENESS_V1`), Wave decomposition,
dependency graph, and exit gate before any implementation may be authorized.

Decision:
- Stage 2 IELTS Completeness targets the FULL IELTS PLATFORM:
  - IELTS Academic
  - IELTS General Training
  - Four skills: Listening, Reading, Writing, Speaking
  - 100% official in-scope task families across both test types.
- Listening and Speaking shared format and interaction semantics are reused
  across Academic and General Training where official structure permits.
- Reading and Writing Academic-specific vs General-Training-specific semantics
  remain strictly distinct.
- Reusable Stage 1 substrate (`ActivitySpec`, `Run`, `Attempt`, `Receipt`,
  `EvidencePolicy`, `SourceRevisionRef`, `QAR`, `FrozenAssessment`,
  `WeaknessProfile`, `ErrorRepository`, `TodayRunner`, `BackupRegistry`) is
  reused directly; no duplicate authority systems, second attempt stores, or
  parallel progress truths are permitted.
- Scoring and evaluation semantics must remain truthful:
  - Objective scoring is deterministic and raw-score bound.
  - Writing and Speaking evaluation is rubric-aligned (4 official criteria) and
    must be labeled "Practice Estimate" or "Practice Feedback".
  - Zero claims of "Official Certified IELTS Band" or "Examiner Guaranteed Score".
- Explicit exclusions: IELTS Life Skills, test booking/proctoring/admin, and
  proprietary official question-bank replication are out of scope.
- Strategy candidate is recorded in `docs/STAGE2_IELTS_COMPLETENESS_STRATEGY.md`.
- Implementation of Stage 2 and its Waves remains NOT AUTHORIZED until separate
  bounded authorization manifests are independently accepted.

## ADR-051 — Execution Prompt Protocol V2 minimizes handoffs and prompt duplication without gate reduction

Status: PROPOSED / CANDIDATE

Context: Under Protocol V1 (`BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` / ADR-046), transaction prompts frequently duplicated hundreds of lines of generic governance boilerplate and created artificial manual user handoffs for transitions that were already deterministically bound by an accepted Wave Authorization Manifest (e.g. waiting for CI, downloading artifacts, marking PR ready, executing pre-authorized exact-head merge after independent `ACCEPT`, and verifying post-merge CI). A workflow refactor is needed to minimize user friction and latency while preserving all technical quality gates and independent authority boundaries.

Decision:
- Adopt `EXECUTION_PROMPT_PROTOCOL_V2` as the canonical repository execution prompting protocol, documented in `docs/governance/EXECUTION_PROMPT_PROTOCOL_V2.md`.
- Principle: `QUALITY_GATE_COUNT != USER_PROMPT_COUNT`. Pre-authorized, deterministic transitions execute autonomously within the active transaction without requiring artificial user handoffs.
- Centralize generic repository invariants (Authority, Git & Topology, Scope, Test-First RED $\to$ GREEN, Natural CI, Evidence, Data Safety, Independent Audit, Conditional Merge, and Stop Conditions) so transaction prompts reference them by canonical identity rather than repeating boilerplate.
- Establish Minimum-Handoff Execution Floor:
  - Unauthorized Wave: exactly 4 user transactions (Authorization Implementer $\to$ Independent Authorization Auditor $\to$ Implementation Executor $\to$ Independent Implementation Auditor).
  - Already-Authorized Wave: exactly 2 user transactions (Implementation Executor $\to$ Independent Implementation Auditor).
- Standardize concise canonical prompt templates for the four roles, targeting 40–60% reduction in duplicated prompt text without lossy compression of transaction-specific parameters.
- Absolute Role Separation: Implementer/Executor cannot self-audit or self-accept; Independent Auditor cannot write implementation code before verdict.
- No Speculative Recovery: Do not pre-create speculative recovery transactions; materialize remediation only when an actual failure occurs.
- W0 Grandfathering: `STAGE2-W0-IELTS-ARCH-AUTH-001` was accepted under Protocol V1 and remains valid, canonical, unmodified, and controlling for Wave W0. Wave W0 requires only 2 remaining transactions (Executor + Auditor) to reach completion.
- Supersession: Protocol V2 supersedes Protocol V1 for new future execution prompting transactions upon formal activation. Historical V1 manifests, verdicts, and evidence remain valid.

Non-Goals:
- Zero product scope or source code changes.
- Zero weakening of test gates, evidence hierarchy, or independent acceptance.
- Zero runtime daemons, DAG engines, schedulers, automated acceptance bots, or CI workflow changes.

Activation:
This protocol is `CANDIDATE / NOT_ACTIVE` until independently audited, accepted, merged into `main`, and verified via natural post-merge CI.

Rollback:
Revert this decision and governance files; prompting returns to Protocol V1. Historical accepted work remains unaffected.

