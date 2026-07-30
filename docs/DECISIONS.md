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

Evidence: P0-00 independently accepted source commit `33616e5e03ef3684b0afdbdf6e328ef45bb5cfc4`; the V10 sentence-session race remains a product failure owned by P0-03.

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
