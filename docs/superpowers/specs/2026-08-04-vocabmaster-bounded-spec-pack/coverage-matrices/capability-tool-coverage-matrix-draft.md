# Capability and Tool Research Matrix

Matrix status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — CROSS-CUTTING CAPABILITY, NOT AN UMBRELLA OWNER`
Implementation authorization: `NOT_GRANTED`
Dependency/tool installation authorization: `NOT_GRANTED`

This is a research agenda and pilot ledger. It selects no library, binary,
provider, model, pricing assumption or installation mechanism.

## Capability research agenda

| Capability/problem | Existing repository capability to reuse | Research required | Decision not permitted in this draft | Minimum pilot | Pilot acceptance boundary |
|---|---|---|---|---|---|
| Video/audio acquisition | Accepted public YouTube caption resolver; Phase 5 yt-dlp argv-only extraction handoff | Distribution/update policy, supported sources, authenticated/private/rights boundaries | Bundling yt-dlp, browser automation, cookie/proxy support or general downloader | One rights-cleared public source with caption hit and one approved local-audio fallback path | Exact provenance, limits, cancellation/cleanup and no credential/path leak; does not prove general media support |
| FFmpeg extraction | Phase 5 external-binary discovery and mono/16 kHz chunk flow | Supported versions/codecs, Windows discovery, resource limits and live-device performance | Bundling/installing FFmpeg or choosing companion packaging | Probe/extract a synthetic bounded fixture through declared argv-only process | Correct duration/format, timeout/cancel/process-tree cleanup and stable capability report |
| ffprobe/media validation | Content byte/type/digest checks only; no ffprobe | Need for codec/duration/sample/channel validation and mismatch handling | Selecting ffprobe or treating file extension as sufficient | Compare declared versus real metadata on valid, corrupt and masqueraded fixtures | Typed reject/quarantine, bounded runtime, no source mutation and evidence of why existing checks are insufficient |
| Subtitle/transcript parsing | Accepted JSON3/VTT/SRT provider parser and immutable Transcript aggregate; Phase 5 SRT/VTT/TXT rescue handoff | Format/encoding matrix and adapter ownership for personal sources | New transcript store or trust upgrade | Round-trip exact provider and user-import fixtures including overlaps/duplicates | Stable revision/provenance, fail-closed invalid timing and restore/reopen |
| ASR engine | Phase 5 faster-whisper/whisper.cpp adapters, model digest and checkpoint/fallback contracts | Live quality, model size/license, CPU/RAM/latency, language/device matrix and engine comparison | Declaring a default engine/model or live availability from fake fixtures | Separately authorized rights-cleared audio corpus on representative local hardware | Version/model digest, WER/task quality with limitations, resource/latency, restart/resume and no cloud use |
| VAD | `vad_filter=True` inside faster-whisper; otherwise fixed 30-second chunks | Standalone need, cross-engine parity, silence/music/noise behavior | Choosing a VAD library or calling delegated filter an accepted VAD subsystem | Fixed adversarial silence/speech/noise fixtures with and without delegated VAD | Boundary stability, no lost speech, measured runtime and deterministic fallback |
| Forced alignment | Provider/ASR timestamps and fail-closed `aligned:false`; no forced aligner | Need, language/model/license/resource fit and confidence semantics | Selecting an aligner or upgrading unaligned text automatically | Timingless text plus known-audio fixtures under a separately approved spike | Segment coverage/error/confidence exposed; low confidence needs user review and never becomes answer authority |
| Sentence segmentation | Caption rolling-cue normalization, ASR overlap dedupe and simple text punctuation split | Multilingual abbreviations, headings/tables, OCR and long-form prose behavior | Selecting NLP framework or calling simple split general-purpose | Small multilingual/article/subtitle adversarial corpus | Stable IDs, no content loss/reorder, bounded performance and user-correctable boundaries |
| Fuzzy matching/alignment | Dictation token edit distance and exact normalized lexical match | Domain-specific thresholds for answers, source dedupe and alignment; false-positive risk | One global fuzzy threshold/library | Type-specific near-match fixtures with accepted/rejected rationales | Deterministic, locale/type scoped and adversarial false positives fail; sealed key unchanged |
| TTS | Accepted browser Web Speech playback for text/card audio | Voice availability, offline behavior, accessibility and whether generated assets are ever needed | TTS asset generation provider/license or replacing real Listening audio | Browser capability/degradation probe only | Honest unavailable state, user-controlled playback, no generated IELTS Listening evidence |
| Writing Task 1 chart/table/process/map generation | No learning-content generator; progress heatmap is unrelated | Deterministic data/visual grammar, alt text, responsive print, rights and answer/rubric invariants | Selecting chart/image library or AI image generation for accepted assessment | One synthetic line chart and one non-chart process/map prototype after owner ratification | Data-visual consistency, deterministic seed/version, accessible description, export/reopen and reviewer-approved prompt/key |
| Schema/invariant validation | Strong custom learning/content validators and content-repo CLI; no Ajv/Zod | Whether JSON Schema/runtime library adds value for cross-artifact interchange | Adding Ajv/Zod or rewriting accepted validators | Challenge existing validator with one new bounded schema and malformed fixtures | Measurable gap/value, stable errors, no duplicate authority and rollback without dependency |
| Local tool doctor | Phase 5 component health for yt-dlp/FFmpeg/model and resolver capability report | Unified command/record, ffprobe, install guidance, OS/hardware matrix and persistence/redaction | Auto-install/update or promising support based on binary presence | Read-only doctor over current optional components | Versions/capabilities/reasons, no secrets/absolute paths in portable report, honest `NOT_AVAILABLE` and zero mutation |
| Privacy/provenance/license | Caption-first, private namespaces, transcript provenance; Phase 4 rights/review validator and Phase 5 consent handoff | Personal-source retention/license, provider term drift, authenticated media and publication boundary | Treating private approval, provider metadata or AI assertion as rights/verification | Adversarial provenance/rights/consent fixtures per source/provider profile | Missing/forged fields fail closed; deletion/export and payload disclosure are truthful |
| Cost/quota | Phase 5 Gemini one-billable-request cap and disclosure | Current provider pricing/retention, estimate accuracy, retry accounting and budget UI | Hard-coded pricing, silent fallback or cost ledger without provider-attempt owner | Fake-contract accounting plus separately authorized live request when allowed | Logical versus physical attempts counted, capped, disclosed and cancellable; no live claim from fake test |
| Fallback policy | Caption → local ASR → Gemini → import ordering exists in Phase 5 handoff | Live failure taxonomy, provider drift, private/authenticated media and device capability | Changing provider order or enabling cloud by default | Synthetic capability/failure matrix plus separately authorized live paths | Caption-first/default-off, explicit scoped consent, no duplicate dispatch and honest final rescue option |

## Current support summary at tracked baseline `d8ec9c7f`

- Accepted: canonical Transcript revision/provenance, caption-first public YouTube
  resolver/workspace and device Web Speech playback.
- Handoff/review-required: Phase 5 FFmpeg/yt-dlp local extraction, local ASR,
  Gemini fallback, SRT/VTT/TXT rescue and associated privacy/fallback policy.
- Partial: delegated VAD, timestamp/fail-closed alignment, narrow segmentation,
  token edit distance, component health and cost cap.
- Absent: ffprobe integration, forced aligner, general article/book segmentation,
  general fuzzy/search alignment, Task 1 visual generator and unified tool doctor.

Relevant evidence includes `server/local-asr-companion.mjs:57`,
`server/local-asr-provider.mjs:19`, `scripts/faster-whisper-adapter.py:18`,
`src/transcript-import.js:46`, `src/caption-normalizer.js:8`,
`src/audio-manager.js:46`, `src/content-contracts-v2.js:201` and the Phase 5
implementation report/status ledger.

## Research governance

Research may run in parallel when it has no shared writer or selected dependency.
No pilot may enter production source before a canonical consumer owner,
allowlist, exact predecessor, privacy/rights/cost boundary and rollback are
approved. A successful pilot proves only its frozen fixture/hardware/profile; it
does not ratify a package, provider or “full” capability.
