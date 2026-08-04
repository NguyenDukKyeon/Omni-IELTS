# IELTS Speaking Coverage Matrix and Coaching Specializations

Matrix status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-4S IS GROUPING_ONLY`
Shared productive-practice owner: not yet canonicalized
Implementation authorization: `NOT_GRANTED`

Retell, Shadowing and Pronunciation are coaching specializations. Their existing
capabilities must not be renamed as IELTS Speaking Part 1/2/3 coverage.

## Baseline matrix

| Capability | Inventory/schema | Executor/UI | Review/scoring | Artifact/attempt | Evidence semantics | Tests | Acceptance |
|---|---|---|---|---|---|---|---|
| Speaking Part 1 | PARTIAL | GAP | GAP | GAP | GAP | PARTIAL | GAP |
| Speaking Part 2 cue card/long turn | GAP | GAP | GAP | GAP | GAP | GAP | GAP |
| Speaking Part 3 linked to Part 2 | PARTIAL | GAP | GAP | GAP | GAP | PARTIAL | GAP |
| Retell media/sentence coaching | VERIFIED_EXISTING | VERIFIED_EXISTING | PARTIAL | VERIFIED_EXISTING | VERIFIED_EXISTING coaching-only | VERIFIED_EXISTING | VERIFIED_EXISTING for bounded P3 Retell, not IELTS Part 2 |
| Shadowing specialization | VERIFIED_EXISTING | VERIFIED_EXISTING | GAP | PARTIAL | PARTIAL | PARTIAL | `CANONICAL_CONFLICT — NEEDS_SEPARATE_RESOLUTION` |
| Pronunciation specialization | PARTIAL | VERIFIED_EXISTING | PARTIAL | PARTIAL | PARTIAL coaching-only | PARTIAL | UNKNOWN |

## Exam-part evidence

- `src/ielts-content.js:58` names Part 1 and Part 3 in one lexical set and asks
  for a 45–60 second production. The actual surface remains text-based lexical
  production; no spoken prompt bank, linked Part 2/3 flow, microphone exam
  executor or Speaking rubric exists.
- No tracked Part 2/cue-card/long-turn taxonomy or inventory was found.
- There is no Academic/GT Speaking profile discriminator, examiner protocol,
  timed preparation/response contract or exam-attempt aggregate.

## Specialization evidence

### Retell

`src/ielts-domain.js:436` and `:457` define a durable Retell attempt/feedback
shape and reject band scores. `src/ielts-lab.js:324` saves learner output before
evaluator I/O and retains the same attempt through failure; the V10 sentence
loop also persists output/status/coaching envelopes. Unit and browser evidence
covers failure, reload, race and band rejection, and P3-04 is accepted in the
canonical ledger. This proves bounded Retell coaching only.

### Shadowing unresolved conflict

`docs/IMPLEMENTATION_PLAN.md:479` requires P3-02 Shadowing receipts with exact
segment and exposure/assistance, while `docs/IMPLEMENTATION_STATUS.md:482`
records P3-02 accepted. At both the accepted SHA cited by the ledger and the
tracked baseline, `src/sentence-learning-loop.js:68` creates only an ephemeral
object URL and advances/saves progress; it does not append a Shadowing canonical
envelope. `src/ielts-lab.js:309` stores duration/segment summary plus a denied
decision without a canonical Attempt/Receipt. Existing browser evidence checks
UI/no-FSRS only.

This matrix does not change the canonical status. The mismatch is recorded
exactly as `CANONICAL_CONFLICT — NEEDS_SEPARATE_RESOLUTION` and cannot be used to
claim Speaking coverage.

### Pronunciation

`src/app.js:442` and `server/server.mjs:166` provide microphone/speech-recognition
and Gemini intelligibility coaching for card-level practice. Only a summary is
stored; raw audio and a canonical pronunciation Attempt are not. EvidencePolicy
keeps Pronunciation coaching-only, and existing tests cover no-FSRS/mic-denied
fallback rather than live provider quality, phoneme accuracy or durable audio.

## Required future evidence

- Part 1 prompt/profile inventory and follow-up semantics;
- Part 2 cue-card identity, preparation timer, long-turn artifact and terminal
  semantics;
- Part 3 questions explicitly linked to the exact Part 2 topic/run;
- shared ProductivePrompt/LearnerArtifact/audio/feedback lineage with
  provider-off completion;
- microphone permission, codec, interruption, reload, quota, retention/delete,
  backup and accessibility evidence;
- self-review and honest coaching rubric; no official band/pronunciation claim;
- independent exact-commit acceptance for each exam part and specialization
  boundary actually claimed.

The Shadowing conflict requires a separate canonical investigation before any
new spec depends on its receipt semantics.
