# Phase 3 — Full-video Learning Workspace implementation report

Status: `ACCEPTED / MERGED`

Branch: `codex/phase-3-full-video-workspace`

Baseline: clean `main` at `cf28153352110cae510c92e2a8f911a6d65497ca`.

This file began as implementer evidence. Phase 3 was subsequently independently accepted at source HEAD `96aa0172add84186fbe2970cde910b06a0d73672`; exact-head CI run #259 succeeded; PR #11 merged into `main` at `d1fe0dbec9db6405938ec74111e8e25ba4792fee`. Phase 4 is unlocked. Phase 5 remains locked.

## Delivered scope

- P3-00: one Video Workspace controller owns dialog layout, deep-link state, session reload restoration, empty/error/partial states and resolver lifecycle controls.
- P3-01: YouTube time updates select an exact transcript row; the rail uses a bounded virtual window for long transcripts and keeps stable ordering.
- P3-02: Normal, Noticing and Shadowing are explicit workspace modes; A–B repeat and playback rate remain visible controls.
- P3-03: Dictation Strict removes transcript answers semantically from the rail and learning panel before submit. Practice exposes an explicit assisted hint and records that assistance in the coaching receipt.
- P3-04: Retell persists learner drafts and completed output. Without an independent evaluator it remains truthfully coaching-only and cannot schedule FSRS.
- P3-05: text, timing, split and merge edits create immutable child transcript revisions. A changed active base revision fails with `TRANSCRIPT_EDIT_CONFLICT` instead of last-write-wins.
- P3-06: desktop two-pane layout, mobile transcript drawer, keyboard focus treatment and reduced-motion behavior are covered by production-browser acceptance.

## Phase 2 integration carried forward

- The production video form drives the real caption-first resolver and exposes cancel/retry state.
- Resolver jobs and SSE events are persisted in existing Phase 2 stores.
- SSE reconnect resumes after the last durable sequence and terminal progress is idempotent.
- Reload can reactivate an exact canonical transcript revision or offer a recoverable resolver job.
- Server cancel aborts the active provider fetch; restart recovery is retryable; corrupt or partial artifacts are rejected and replaced.

No Whisper, Gemini ASR, cloud fallback or Phase 5 UI is included.

## Verification contract

During implementation only focused Phase 3, resolver and V10 browser tests are run. The final committed head must pass:

- `npm run phase3:verify`
- `npm run check`
- `npm run build`
- `npm run test:v10-browser`
- `npm test` exactly once

The exact results and commit SHA were independently reviewed at source HEAD `96aa0172add84186fbe2970cde910b06a0d73672`. Exact-head CI run #259 succeeded before PR #11 merged at `d1fe0dbec9db6405938ec74111e8e25ba4792fee`.

## Independent acceptance reconciliation

- Accepted source HEAD: `96aa0172add84186fbe2970cde910b06a0d73672`.
- Exact-head CI: run #259 succeeded.
- Merge: PR #11 merged into `main` at `d1fe0dbec9db6405938ec74111e8e25ba4792fee`.
- Unlock: Phase 4 only.
- Locked: Phase 5 remains locked.

## Known limitations

- Retell is durable coaching-only because Phase 3 has no independent evaluator service; no synthetic score is emitted.
- Real YouTube playback and caption availability still depend on YouTube reachability and the local `yt-dlp` capability.
- Session reload restoration is browser-session scoped; opening the deep link on another device requires the referenced canonical revision to exist there.
- Virtualization uses a fixed row-height estimate; unusually tall wrapped rows can cause a small scroll-position adjustment, without changing active identity or ordering.
