# IELTS Phases 0–5 — Implementation Audit

## Scope and product boundary

Vocab Master remains a personal vocabulary memory coach. IELTS activities are accepted only when they produce one or more of these durable learning outputs:

- a verified vocabulary/collocation card;
- a lexical relation;
- a structured personal error;
- an independent, target-specific learning evidence event.

The implementation deliberately does **not** add full IELTS mock tests, synthetic band scores, a full speaking examiner, or an essay grader.

## Phase status

| Phase | Status | Evidence |
|---|---|---|
| Phase 0 — IELTS foundation | Implemented | Dedicated IndexedDB, source references, AI lifecycle, evidence gateway, combined backup/restore and concurrency controls |
| Phase 1 — Personal Error Notebook | Implemented | Full ErrorRecord, exact target-specific dedupe, occurrence count, status workflow, Today integration and bridges from existing exercises |
| Phase 2 — IELTS Lexical Sets | Implemented | Six curated functional sets, Library linking, context/register/common mistakes/functions and multi-target production tasks |
| Phase 3 — Paraphrase & Distractor Lab | Implemented as constrained MVP | Curated verified items plus AI draft → validation → learner verification; exactly one correct option and rationale per option |
| Phase 4 — Reading Micro-practice | Implemented as constrained MVP | Original short passage, 2–4 questions, required evidence, rationale for every option, attempt persistence and capture to Library/Notebook |
| Phase 5 — Media Segment Lab | Implemented with conditional provider gate | YouTube URL parsing, public-URL transcript route, sentence timestamps, validator/editor, A–B player, Dictation, Shadowing, Retell and progress persistence |

## Phase 0 — Foundation

### Durable entities

The separate `vocab-master-ielts` IndexedDB contains:

- `errorRecords`
- `lexicalSets`
- `lexicalRelations`
- `labItems`
- `readingPassages`
- `readingAttempts`
- `mediaSources`
- `transcriptionJobs`
- `transcriptSegments`
- `mediaAttempts`
- `mediaProgress`
- `settings`

Writes are serialized per tab and changes are broadcast across tabs. A dedicated IELTS backup is available, and the UI backup control creates a combined core + IELTS backup with rollback if restore fails part-way.

### Evidence gateway

No IELTS UI is intended to call FSRS scheduling without first receiving a decision from `resolveIeltsEvidence()`.

Allowed scheduling cases:

- verified, independent, target-specific Dictation;
- verified, independent Error Notebook correction;
- Retell where the card was selected before the attempt and used correctly with the intended sense;
- Lexical production where each selected target is evaluated independently.

Denied scheduling cases include:

- Shadowing;
- viewing an explanation;
- Reading completion;
- opening a lexical set;
- assisted correction;
- unverified AI content;
- spelling-only Dictation errors;
- source transcript errors;
- Retell terms extracted after the attempt;
- a skill not present in the card learning goal.

## Phase 1 — Personal Error Notebook

Each error retains:

- category;
- prompt;
- learner response;
- expected response;
- correction;
- explanation;
- source reference;
- linked cards;
- occurrence count;
- first/last seen time;
- workflow status;
- resolution attempts and timestamps;
- provenance.

Exact duplicates are merged by normalized category, target/card, learner response and expected response. A resolved error that recurs reopens as `monitoring` instead of silently remaining resolved.

Existing input, choice, production and multi-target output exercises bridge into the Notebook. The Notebook does not generate a second FSRS rating for the same original exercise.

## Phase 2 — IELTS Lexical Sets

The initial curated content is organised by communicative function rather than “Band 9 words”:

1. Trends & Change
2. Comparison & Contrast
3. Cause & Consequence
4. Cautious Opinion & Evaluation
5. Problems & Solutions
6. Speaking Extension Chunks

Each entry contains context, register, function, common mistake and production prompt. Adding an entry creates or links one normal Library card; deleting or changing a set must not delete the underlying card.

FSRS remains per card and per planned skill. A set itself has no FSRS schedule.

## Phase 3 — Paraphrase & Distractor Lab

AI output is always saved as `draft`. It cannot enter practice until it passes structural validation and the learner explicitly verifies it.

A valid item requires:

- contextual source meaning;
- 2–4 options;
- exactly one correct option;
- non-empty rationale for every option;
- provenance and lifecycle status.

Incorrect attempts create a Notebook record but do not automatically change a vocabulary card schedule.

## Phase 4 — Reading Micro-practice

The MVP intentionally supports short original passages and evidence-based multiple-choice questions, not a full IELTS Reading simulator.

A verified passage requires:

- 80–220 words;
- 2–4 questions;
- a supported micro-skill;
- exactly one correct option per question;
- an evidence span copied from the passage;
- an overall explanation;
- a rationale for every option.

The learner must submit both an answer and evidence. Passage completion is practice history, not FSRS mastery. Cards captured from a passage retain the full source reference but begin as normal Library items without a fabricated review.

## Phase 5 — Media Segment Lab

### Supported flow

```text
Public YouTube URL
→ normalized video ID
→ Gemini public-URL video input
→ transcript segments with timestamps
→ structural validation
→ learner review/edit/split/merge
→ verified Dictation / Shadowing / Retell
→ structured errors and selected card evidence
```

The default session is 20 minutes; 10 and 30 minute choices are also available. A transcript request is capped at a 20-minute clip.

### Media policy

The application:

- uses a privacy-enhanced YouTube iframe;
- controls playback with `enablejsapi` and `postMessage`;
- does not download YouTube video;
- does not extract or persist YouTube audio;
- does not implement background playback;
- does not persist the learner’s raw Shadowing recording by default.

### Transcript reliability

Model confidence is labelled as a model estimate, not a calibrated probability. New transcript segments start as `needs-review`. Dictation cannot create FSRS evidence until the selected segment is verified.

The editor supports:

- text correction;
- start/end correction;
- split;
- merge;
- review status;
- persistence and backup.

Transcription jobs are idempotent by cache key. Repeating the same request updates one durable job instead of violating the unique index. A `processing` job left behind by reload is converted to a retryable failure during the next boot.

### Dictation

- Stores answer, expected transcript, word diff, source and linked cards.
- A verified independent result may affect only the selected card’s Listening schedule.
- `spelling-only` and `transcript-source` errors never reduce Listening FSRS.
- An unlinked segment stores an attempt/error but cannot modify FSRS.

### Shadowing

Shadowing is imitation practice and is always coaching-only. It stores a local attempt summary but never creates an FSRS review event.

### Retell

Retell accepts only targets selected before the attempt. The AI response is validated to reject synthetic IELTS band scores. It may return:

- main ideas covered;
- target-specific usage assessments;
- lexical gaps;
- no more than three high-value errors;
- non-certification feedback.

Only a preselected card clearly used with the intended sense may create Production evidence.

## Automated verification

The repository contains:

- `tests/ielts-domain.test.mjs`
- `tests/ielts-persistence.test.mjs`
- `tests/ielts-transcription-recovery.test.mjs`
- `tests/ielts-runtime-guard.test.mjs`
- `tests/ielts-api.test.mjs`
- `scripts/audit-ielts.mjs`
- `scripts/ielts-browser-smoke.mjs`

The CI workflow runs existing tests and regression checks, then:

1. IELTS domain and IndexedDB integration tests;
2. static adversarial IELTS contract audit;
3. production build;
4. server and preview smoke tests;
5. existing browser interaction smoke;
6. IELTS-specific browser interaction smoke;
7. existing hardening browser smoke.

The IELTS browser smoke exercises:

- opening the Lab during startup;
- adding a lexical entry to Library;
- Error Notebook duplicate merge;
- wrong Paraphrase attempt and rationale;
- Reading answer plus evidence;
- mocked auto transcript persistence and verification;
- targeted Dictation through the FSRS evidence gateway;
- Retell feedback without a band score;
- basic tab, live-region and scroll accessibility semantics.

## Adversarial defects found during implementation

The browser and integration tests found and drove fixes for:

1. The launcher passing a `MouseEvent` as a tab identifier, resulting in an open but empty dialog.
2. A startup race where the launcher became clickable before the Lab finished initialization.
3. A MutationObserver feedback loop caused by observing and rewriting `disabled` attributes.
4. A unique-index failure when retrying the same transcription cache key.
5. Abandoned `processing` jobs remaining stuck after reload.
6. A transcript hallucination test fixture that incorrectly rejected legitimate repeated speech at different timestamps.
7. HTTP API contract tests using string chunks instead of Buffer chunks.
8. Listening/Production evidence being possible for a card whose learning goal did not include that skill.
9. Choice exercise failures not being captured by the initial Error Notebook bridge.

## Release gate

### Automated code gate

All CI checks must be green on the final PR head. The PR must remain unmerged while any unit, audit, build, server, browser or hardening step is red.

### Live provider gate

Automated CI mocks the Gemini response contract because no production Gemini key is stored in GitHub Actions. Before production release, manually test with a configured key:

- at least 10 public YouTube videos;
- multiple accents and speaking speeds;
- speech with music/noise;
- a video longer than 20 minutes using a non-zero clip start;
- a deleted/private/embedding-disabled video;
- 429, provider timeout and retry;
- transcript timestamp drift;
- Chrome/Edge desktop and one mobile browser.

### Current merge recommendation

- **Code review:** Go once the final CI head is green.
- **Merge to main:** Conditional Go; keep the PR draft until final CI is green.
- **Production release of auto transcript:** No-Go until the live provider gate above passes.
