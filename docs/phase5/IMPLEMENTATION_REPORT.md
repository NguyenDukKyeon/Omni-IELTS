# Phase 5 — ASR and Cloud Fallback implementation report

Status: `IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED`

Baseline: `fc6057fa66c510b0cd12a7fb9e1e74a6379b4225` (`origin/main`)

Branch: `codex/phase-5-asr-cloud-fallback`

Phase 5 is an implementer handoff, not acceptance. No merge, deploy,
production-provider claim, Phase 4 publication approval, Phase 6 work or Phase
7 work is included.

## Focused post-merge audit remediation

PR #13 source `f56f84a0fe0398ac44d331d02df6a911bee62d50`
passed exact-source CI run #266 and merged at
`d654356078d2b4d44a03ba17809c7bedeb6c8f14`. The follow-up branch
`codex/phase-5-audit-remediation` starts from that exact merge and remediates
only the nine focused Phase 5 findings:

- Gemini authorization is checked against the current durable consent
  authority; forged, withdrawn and stale receipts fail before provider work.
- Restore retains consent history but disables cloud and requires explicit
  reactivation.
- HTTP disconnect cancellation reaches the owned process tree; restart cleanup
  journals, concurrency, media and disk reservations fail closed.
- Canonical resolver jobs use heartbeat-renewed fenced leases, and cloud media
  over the consented duration is rejected rather than clamped.
- Local models require trusted digest/length verification and staged atomic
  activation; ASR checkpoints bind engine, model and chunk versions.
- Overlap merge distinguishes cross-chunk boundary duplicates from legitimate
  repetition.
- Timingless text import persists as private/unverified and `aligned: false`;
  timing-dependent workspace activity rejects it.

Each boundary has a deterministic regression probe. The focused Phase 5 suite
now contains 45 passing tests. Live Whisper/Gemini coverage remains
conditionally skipped because no model/binaries or approved cost-bearing
credential were provisioned. Phase 5 remains
`IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED`.

## Package delivery

| Package | Commit | Delivered |
|---|---|---|
| P5-00 | `fc21c0a2a4b7038b34840969b339e0abb6384557` | Capability/provider order, private/shared policy, source eligibility, consent and additive preferences |
| P5-01 | `e01423c6734ad46ab13ec7fd6a447e13c183192b` | Loopback companion, pairing/CORS boundary, owned argv processes, media caps and cleanup journal |
| P5-02 | `c831c5e439187880942113afc13d4e9b81dfcee9` | Optional faster-whisper/whisper.cpp adapter, model health and first usable private/unverified batch |
| P5-03 | `59740ba8827d7dfa055de48dcf64afa67448d084` | Chunk overlap, canonical job checkpoints, deterministic merge, subset resume and cancellation cleanup |
| P5-04 | `09447ffbeb91fe374f73cd173380439f52baf6b8` | Server-only Gemini opt-in, source/consent/cost gates, private output and legacy route containment |
| P5-05 | `8de1ba2`, `ed15e4f`, `a2be78f`, `65a31aa` | Desktop/mobile rescue UI, strict import, backup/restore, production workspace policy routing, stable production browser oracle, verify command and CI gate |

## Architecture and policy evidence

- Existing `ResolverJobRepository`, ResolverJob identity and transition log are
  reused for caption, Local ASR and Gemini. Failed caption jobs are requeued;
  no parallel resolver-job store exists.
- Existing canonical Transcript sources, immutable revisions and segments own
  every provider and import result. Local, Gemini and imported output is forced
  into the private namespace with `unverified`/`needs-review` provenance.
- Caption returns immediately when successful. Tests prove Local/Gemini are not
  called after earlier success.
- Shared-public cache stays off unless every public/no-auth/no-cookie/rights and
  explicit-share condition is present. Private ASR/import artifacts cannot
  enter it.
- Existing EvidencePolicy and Phase 4 rights/human-review records are unchanged.

## Provider coverage

| Boundary | Coverage in this handoff |
|---|---|
| Caption resolver | Existing deterministic yt-dlp/fetch fixtures plus HTTP/SSE/restart/cancel tests |
| Local companion | Real Node process/CORS/auth/temp-dir orchestration with deterministic fake binaries/processes |
| Local Whisper | Real adapter contract and Python entrypoint; inference/model behavior uses deterministic fake runtime/model output |
| Gemini | Real server adapter/validation/request construction; network response, 429 and malformed/credential cases use deterministic fake fetch |
| Import | Real SRT/VTT/text parser, real canonical Transcript persistence and real IndexedDB browser reload |
| Browser | Installed Chrome production UI at 1280 px and 390 px, isolated profile, real IndexedDB revision reload |

No live Local Whisper model or Gemini server credential was available. Live
provider smoke is therefore honestly skipped: running it would require external
model/binary provisioning and an explicit server credential and may incur
provider cost. The implementation does not infer those capabilities from
deterministic fakes.

## Migration, backup and rollback

- No new object store or database version is required. Consent/settings are
  additive V10 metadata; range checkpoints are additive ResolverJob fields.
- Full backup preserves consent receipts, settings, imported transcript bodies,
  canonical revisions and resolver checkpoints. Credential-shaped fields, raw
  task media and model cache are absent.
- Rollback turns off Local/Gemini adapters and ignores additive fields. It must
  preserve consent history and private transcript revisions and must not
  downgrade IndexedDB.
- `.gitattributes` fixes deterministic LF materialization of signed/digested
  content fixtures on Windows without changing Phase 4 rights or human-review
  record values.

## Local evidence before final handoff

| Command | Result |
|---|---|
| `npm run test:phase5` | PASS 39/39 |
| `npm run test:phase5-browser` | PASS; desktop defaults, disclosures, private import, reload durability and mobile no-local capability; remediation stress PASS 20/20 |
| `npm run phase5:verify` | PASS 4/4 gates: Phase 5 39/39, backup 5/5, restore 28/28, Phase 5 browser |
| `npm run test:phase4` | PASS 54/54 after deterministic LF checkout policy |
| `npm run check` | PASS |
| `npm run build` | PASS; production bundle built |
| `npm run test:backup` | PASS 5/5 |
| `npm run test:restore` | PASS 28/28 |
| `npm run test:v10-browser` | PASS; production Chrome, durable resolver/workspace reload and zero serious runtime errors |
| `npm test` | PASS 330/330; 0 skipped/todo |

The first draft-PR Ubuntu run exposed a real timing boundary: the asynchronous
content-catalog refresh could replace an active Video rescue form. The
production hub now refreshes catalog content only while Discover is active.
The Phase 5 browser oracle also scopes and samples the exact modal surface
atomically, so the route and modal cannot be mixed during desktop/mobile
emulation.

The final draft-PR handoff additionally records the user-required exact-head
commands and remote CI. Passing implementer tests or CI does not mark Phase 5
or any P5 package `ACCEPTED`.

## Known limitations and independent review targets

- Live Whisper accuracy, first-batch latency, CPU/memory/disk behavior and
  device-specific process cancellation require a provisioned local model and
  binaries.
- Live Gemini availability, current provider retention/billing behavior,
  latency and response drift require an approved credential and cost-bearing
  smoke run.
- The local companion pairing token is session/environment configured; this
  phase does not install a daemon or OS autostart service.
- Public YouTube media only: authenticated/private/cookie extraction is
  deliberately unsupported.
- Imported timingless text uses deterministic display ordering but is marked
  unaligned and cannot enter timing-dependent study until real cue timing is
  supplied.
- Independent review must reproduce consent decline/version change, source
  rights denial, process cancellation/cleanup, paid-call suppression after
  caption success, desktop/mobile browser paths and backup/restore on the exact
  commit.
