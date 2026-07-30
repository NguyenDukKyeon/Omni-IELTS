# Phase 3 — Full-video Learning Workspace implementation report

Status: `IMPLEMENTED / REVIEW_REQUIRED`

Branch: `codex/phase-3-full-video-workspace`

Baseline: clean `main` at `cf28153352110cae510c92e2a8f911a6d65497ca`.

This is implementer evidence. It does not independently accept P3-00…P3-06 and does not unlock Phase 4 or Phase 5.

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

The exact results and commit SHA belong in the PR handoff. Independent reviewer reproduction is still required before changing any P3 package to `ACCEPTED`.

## Known limitations

- Retell is durable coaching-only because Phase 3 has no independent evaluator service; no synthetic score is emitted.
- Real YouTube playback and caption availability still depend on YouTube reachability and the local `yt-dlp` capability.
- Session reload restoration is browser-session scoped; opening the deep link on another device requires the referenced canonical revision to exist there.
- Virtualization uses a fixed row-height estimate; unusually tall wrapped rows can cause a small scroll-position adjustment, without changing active identity or ordering.
