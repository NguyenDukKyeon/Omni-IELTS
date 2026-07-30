# Phase 4 — Remote Content Platform MVP implementation report

Status: `IMPLEMENTED / INTERNAL_GREEN / REVIEW_REQUIRED`

Branch: `codex/phase-4-remote-content-platform`

Baseline: clean local and remote `main` at
`d1fe0dbec9db6405938ec74111e8e25ba4792fee`.

This is implementer evidence, not independent acceptance. Phase 4 and
P4-00…P4-10 must not be marked `ACCEPTED` until exact-head remote CI is green,
an independent focused audit returns ACCEPT and the pull request is merged.
Phase 5 and Phase 6 remain locked.

## Predecessor reconciliation

The first branch commit changed documentation only and recorded that Phase 3
was independently accepted at source HEAD
`96aa0172add84186fbe2970cde910b06a0d73672`, exact-head CI run #259
succeeded and PR #11 merged into `main` at the baseline above. It unlocked
Phase 4 only and did not rewrite roadmap dependencies.

## Architecture and trust boundary

- Canonical v2 contracts cover RemoteCatalog, CatalogEntry, PackManifest,
  LessonManifest, AssetDescriptor, ContentAddress, RightsRecord,
  ProvenanceRecord, HumanReviewRecord, PackInstallJournal, InstalledPack,
  PackActivationReceipt, ContentProgress and PackRevocation.
- Every lesson owns canonical serialized identity bytes, SHA-256, byte length
  and an immutable content address. Its named review record must bind that same
  address. Every activity asset is lesson-scoped, and every launchable
  activity carries a canonical ActivitySpec target bound to exact pack,
  lesson and activity revisions.
- The production catalog is serialized deterministically and verified with
  Ed25519 against a bundled public root. Key IDs, key validity, permitted
  usages, rotation successors, `issuedAt`, `expiresAt`, schema version,
  sequence and revision participate in validation.
- A valid newer catalog can become the durable last-known-good record. Invalid,
  expired, malformed, unknown-key, replayed or downgraded catalogs cannot
  replace it. Network failure leaves it intact and offline startup reads it.
- Equal catalog sequences are idempotent only for the same digest. A different
  digest is rejected inside the durable transaction. A successor signing key
  must be bundled, active, time-valid and explicitly authorized by the trusted
  predecessor; only the designated bundled bootstrap root may establish first
  trust.
- CacheStorage contains only immutable, verified, redownloadable manifests and
  assets. IndexedDB owns every durable install/lifecycle/progress record.
- The installer writes a durable stage journal, verifies manifest and every
  asset digest/length/media type/reference/compatibility rule, uses a Web Lock
  or renewable durable lease with an immutable fencing generation, and
  switches one installed revision atomically. Retry and crash reconciliation
  are idempotent; a stale lease owner cannot renew, release or activate.
- Updates are side-by-side. Delete removes only unreferenced cache bytes,
  writes a tombstone and preserves progress/evidence. Revocation blocks new
  launches without deleting historical data.
- Durable revocations are unioned with valid current-catalog revocations by one
  effective lookup. Catalog omission, catalog rollback and backup restore
  cannot re-enable a revoked revision.
- Today receives only exact ActivitySpec targets for the currently active,
  installed and compatible lesson revision.

## Migration and rollback

V10 IndexedDB version 7 adds `remoteCatalogs`, `packInstallJournals`,
`installedPacks`, `packActivationReceipts`, `packRevocations` and
`packTombstones`, registered as
`phase1:migration:p4-00-v10-content-platform-v7`. The migration is additive,
atomic with its ledger entry and idempotent. Existing stores and unfamiliar
records are preserved.

Backup schema version 3 and registry version 2 include Phase 4 journals,
installed metadata, activation receipts, progress, revocations and tombstones.
Published asset bodies remain outside portable backup; remote content metadata
is reduced to a digest-bearing reinstall stub. Private learner data remains
durable. Restore validates Phase 4 schemas, pointer/receipt identity,
compatibility, revocation and progress references. Unsupported or inconsistent
records remain durable but quarantined and non-active. Restore with missing
cache bytes cannot claim the pack is verified.

Rollback may turn off remote activation or atomically select a retained,
verified immutable revision. It must preserve journals, receipts, progress,
tombstones, revocations and evidence. It never lowers the database version,
deletes unfamiliar stores or reads a newer schema as empty legacy state.

## Publishing boundary

`content-repo/` is a separate publishable scaffold because this environment
has not provisioned a second remote repository. It contains channel catalog
sources, pack manifests, immutable assets, registries, deterministic
validators, build/sign scripts, separate content CI, security guidance and a
revocation/rollback runbook.

The signing script reads a private key from an environment variable. No
private key, signing credential or direct-publish control exists in the
learner application. The learner consumes publication artifacts only.

## Content inventory

The sampler has exactly:

- Listening — Booking a Community Workshop
- Reading — Why Public Benches Matter
- Lexical/Paraphrase — Clear Cause-and-Effect Paraphrases

The Starter Pack draft has exactly 24 lessons with an 8/8/8 distribution:

| Week | Listening | Reading | Lexical/Paraphrase |
|---|---|---|---|
| 1 | Library Orientation Changes; A Rescheduled Health Appointment | Measuring Useful Urban Shade; Why Study Routines Need Friction | Cause, Contribution and Result; Expressing an Academic Stance |
| 2 | Museum Volunteer Briefing; Temporary Bus Route Change | Restoring Dunes with Flexible Barriers; A Campus Food-Waste Trial | Comparison and Contrast; Describing Trends Carefully |
| 3 | Community Garden Meeting; Research Interview Consent | Sleep Timing and Memory; What Repair Cafes Actually Measure | Hedging and Certainty; Problem-and-Solution Language |
| 4 | Conference Registration Correction; Water Refill Scheme Briefing | Remote Work and Commuting Rebound; When Green Corridors Become Ecological | Evaluation without Overclaiming; Synthesising Related Claims |

Every lesson has stable IDs/revisions, objective, duration, difficulty,
lexical targets, complete activities/answers/feedback and accessibility
metadata. Listening drafts include WAV audio, transcripts, comprehension,
Dictation, Strict Practice, Shadowing and coaching-only Retell. Reading drafts
include original-draft passages, contextual vocabulary, paraphrase,
distractor, micro-reading and rationales. Lexical drafts include sets,
collocations, register, sense distinctions, controlled recall and production.
They make no mock-exam, band-prediction or official-IELTS claim.

## Rights and human review status

There are 68 distinct rights records, 68 provenance records and 72 distinct
human-review records, including one weekly defect-review record for each week.
All rights and human-review records are deliberately `pending`. Provenance
truthfully labels the material as AI-assisted draft; audio provenance names the
local draft voice process and leaves licensing approval pending. No record
claims copyright ownership, licensing or human approval.

Draft validation passes structural/content checks. Production validation
fails closed on every pending pack, lesson and asset, so the signed production
catalog has zero entries. P4-05…P4-09 are therefore structurally delivered
drafts but not production-published content. A named human must independently
review rights, accuracy, pedagogy and weekly defects before any signing step.

## Independent technical finding remediation

The independently rejected technical audit source was
`3046d7269ff19191081a0f8c20e30c78b3e9dbc0`. The remediation keeps PR #12
draft and addresses only the seven reproduced platform findings:

1. effective durable revocation enforcement;
2. cryptographic lesson identity and lesson-scoped references;
3. equal-sequence catalog collision exclusion;
4. explicit expired-last-known-good policy;
5. restore validation and quarantine;
6. renewable fenced fallback installer leases; and
7. predecessor-authorized signing-key continuity.

This implementer remediation does not replace the required independent
technical re-audit and does not close any external or editorial gate.

## Focused verification completed before the final-head gate

- Phase 4 contracts/trust/installer/lifecycle/content/backup/migration:
  53/53 tests passed.
- Production browser shell: representative Listening, Reading and
  Lexical/Paraphrase lessons opened in Chrome with desktop and mobile viewport
  checks, keyboard focus and reduced-motion emulation.
- Content draft validator: five packs, three sampler lessons, 24 Starter Pack
  lessons and exact 8/8/8 distribution passed.
- `npm run check` and `npm run build` passed during implementation.

The required final committed-head workflow is run after this evidence commit:
`phase4:verify`, `check`, `build`, `test:backup`, `test:restore`,
`test:v10-browser` and `npm test`. Its exact-head results belong in the
PR/handoff and do not convert implementer evidence into acceptance.

## Known limitations and deferred scope

- External content repository provisioning is pending; only the isolated
  scaffold exists.
- No sampler/Starter lesson is production-publishable until real humans approve
  rights and content. Representative browser launch uses an explicitly isolated
  acceptance fixture and does not pretend those drafts entered the signed
  production catalog.
- The public trust root is an MVP root. Operational key custody, scheduled
  rotation ceremony and production publisher infrastructure remain deployment
  responsibilities.
- Phase 5 ASR/cloud fallback, Phase 6 automated content factory/scale and Phase
  7 personalization were not implemented.
