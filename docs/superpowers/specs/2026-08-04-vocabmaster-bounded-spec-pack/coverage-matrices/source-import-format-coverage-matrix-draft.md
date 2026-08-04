# Source and Import Format Coverage Matrix

Matrix status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-PCS IS GROUPING_ONLY`
Reference seam: SRC-00, currently `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`
Implementation authorization: `NOT_GRANTED`

This matrix separates a source reference, source ingestion and compilation into
learning activities. SRC-00 owns only the future stable reference seam; it
cannot be treated as the importer/Library/compiler owner.

## Classification

- `ACCEPTED_CURRENT`: existing canonical package acceptance covers the stated
  narrow capability.
- `HANDOFF_REVIEW_REQUIRED`: implemented/internal-green evidence exists, but
  independent acceptance is pending.
- `SEED_COACHING_ONLY`: useful primitive/content exists without the requested
  source-lane or assessment boundary.
- `DRAFT_BLOCKED`: artifact/content exists but rights, review, dependency or
  acceptance gate remains open.
- `ABSENT`: no qualifying implementation was found.

## Baseline matrix

| Input/source | Current classification | What can be reused | Missing boundary before compiled learning use | Current evidence |
|---|---|---|---|---|
| Vocabulary text/data (CSV/TSV/TXT/JSON) | ACCEPTED_CURRENT for card import only | Preview, delimiter parsing, dedupe and atomic card import | Source-document revision, prose extraction, provenance/rights and activity compilation | `index.html:766`; `src/learning.js:222`; `src/app.js:534` |
| Plain transcript text | HANDOFF_REVIEW_REQUIRED | Line/punctuation segmentation, private/unverified revision and user rescue flow | Real timing/alignment or explicit non-timed consumer; SRC reference and accepted import owner | `src/transcript-import.js:46`; `src/video-workspace-v2.js:36`; Phase 5 status ledger |
| Article pasted as text | ABSENT as document source; card-import primitive only | Native text handling may seed a future explicit paste slice | Private revision/approval, document segmentation, compiler, provenance and durable Library owner | No article-source implementation found |
| Public article URL | ABSENT | None beyond generic local-companion/network patterns | Safe fetch/redirect/SSRF, extraction/sanitization, rights/license, revision and private-use review | No URL extraction stack; deferred `URL-00` draft only |
| Book/PDF/EPUB/OCR | ABSENT | Generic file validation/limits patterns only | Format/encryption/OCR policy, parser research, rights/privacy, layout extraction and revision model | No tracked parser/input/dependency found |
| IELTS curated content | SEED_COACHING_ONLY plus DRAFT_BLOCKED Phase 4 packs | Curated lexical/Reading micro-practice and content-contract validators | Academic/GT profile, complete inventory, skill executors, rights/editorial release and independent acceptance | `src/ielts-content.js:1`; `src/content-contracts-v2.js:30`; `docs/IMPLEMENTATION_STATUS.md:58` |
| Public captioned YouTube audio/video | ACCEPTED_CURRENT for caption-first transcript/workspace | URL/video ID resolver, creator/auto caption priority, canonical Transcript revisions and Phase 3 workspace | General source import and IELTS question compiler remain separate gaps | `src/resolver-contracts.js:12`; `server/caption-resolver-v2.mjs:18`; accepted Phase 2/3 ledger |
| Public YouTube audio requiring local ASR | HANDOFF_REVIEW_REQUIRED | yt-dlp/FFmpeg extraction, local provider/checkpoint flow and fallback resolver | Live binary/model quality evidence, independent Phase 5 acceptance and future source/QAR adapter | Phase 5 implementation report and status ledger |
| Arbitrary local/private audio or video | ABSENT | MediaRecorder/retell and Phase 5 process patterns are narrower seeds | Safe local file intake, codec/probe/limits, ownership/retention, transcript alignment and rights | Phase 5 report lists private/authenticated/general media unsupported |
| SRT/VTT provider captions | ACCEPTED_CURRENT through canonical Transcript path | JSON3/VTT/SRT parsing, caption priority, immutable TranscriptRevision | SRC-00 reference projection for future generic consumers | `server/caption-resolver-v2.mjs:18`; `src/transcript-aggregate.js:15` |
| User SRT/VTT/TXT rescue import | HANDOFF_REVIEW_REQUIRED | Strict timestamp/overlap checks and private provenance; TXT is unaligned | Independent Phase 5 acceptance and future stable source adapter | `src/phase5-fallback-ui.js:51`; `src/transcript-import.js:18` |
| Writing prompt | SEED_COACHING_ONLY | Lexical-set production prompts and paragraph coaching UI | ProductivePrompt owner, task/profile inventory, durable artifact/review semantics and honest rubric | `src/ielts-content.js:3`; `src/ielts-lab.js:285` |
| Speaking prompt | SEED_COACHING_ONLY | Part 1/3 lexical prompts and Retell coaching | Part 1/2/3 inventory, cue-card linkage, durable artifact/audio policy and review semantics | `src/ielts-content.js:58`; `src/ielts-lab.js:323` |

## Required future format matrix fields

Every supported import profile must eventually record:

- exact format/version/MIME/encoding and byte/item/time limits;
- hostile/malformed/cancellation/idempotency behavior;
- immutable original-source and SourceRevision identity;
- privacy, provenance, rights/license and retention classification;
- extraction/segmentation/alignment confidence and user-confirmation gate;
- validator/quarantine state and content-defect separation;
- compiler/executor compatibility and exact activity binding;
- backup/export/delete/tombstone semantics;
- focused, durable browser and independent acceptance evidence.

No format becomes supported merely because a parser can read it. Generated or
extracted output stays draft until the owning validator/user-review boundary is
satisfied.
