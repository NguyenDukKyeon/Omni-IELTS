# IELTS Academic versus General Training Differences Matrix

Matrix status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — IELTS PROFILE/INVENTORY OWNER NOT RATIFIED`
Implementation authorization: `NOT_GRANTED`

This matrix records the intended product distinction and the current repository
gap. It does not create Academic/General Training packages or make QAR-00 the
profile owner.

## Intended target boundary

| Concern | Academic target | General Training target | Shared capability | Current repository state |
|---|---|---|---|---|
| Reading source inventory | Academic-style passages and accepted Academic section inventory | GT section inventory with its own source/content structure | QAR question contracts, canonical attempts/evidence | No profile discriminator or accepted inventory; GAP |
| Reading section structure | Academic blueprint/timing/ordering owned by future profile package | Different GT blueprint/content progression owned by same future profile package | Shared executor/runtime | No section blueprint; GAP |
| Reading question types | Required 14-type matrix as applicable to accepted Academic inventory | Same type contracts consumed by GT inventory where applicable | QAR schema/normalization/scoring | Only single-choice micro-primitives; GAP/PARTIAL |
| Listening | Shared four-section profile/inventory subject to rights and versioning | Same shared Listening profile/inventory | QAR plus exact media/Transcript runtime | No accepted IELTS Listening inventory/section runtime; GAP |
| Writing Task 1 | Line/bar/pie/table/mixed, process and map-change tasks | Formal, semi-formal and informal letters | Productive artifact/self-review/coaching kernel | Only lexical production seeds; GAP |
| Writing Task 2 | Opinion, discussion, advantages/disadvantages, problem/solution, two-part and hybrid variants | Same broad Task 2 families with profile-specific prompt inventory | Shared productive kernel/rubric versioning | No essay-family schema/executor/artifact; GAP |
| Speaking | Parts 1, 2 cue card and linked Part 3 | Same exam-part model | Shared productive/audio artifact kernel | Part 1/3 lexical label and Retell coaching only; GAP |
| Attempt identity | Binds `profile=academic`, form/section/task/item versions | Binds `profile=general-training`, form/section/task/item versions | Canonical Run/Attempt/Receipt and EvidencePolicy | No profile/form identity in current IELTS attempt schema; GAP |
| Scoring/review | Profile/task-specific rules and versioned interpretation | Profile/task-specific rules and versioned interpretation | Deterministic objective scoring; honest productive review | No full-task scoring/calibration; GAP |
| Assessment/readiness | Coverage and readiness disclose Academic profile | Coverage and readiness disclose GT profile | Uncertainty/evidence model | No readiness owner/model; GAP |

## Repository evidence at tracked baseline `d8ec9c7f`

- Reading inventory/schema/runtime/tests contain no Academic/General Training
  discriminator; academic-looking topics cannot substitute for an explicit
  profile.
- The only direct Academic Writing label is a short `Trends & Change` lexical
  task in `src/ielts-content.js:3`.
- No tracked `General Training`, letter-register or Task 1 visual taxonomy was
  found.
- `src/ielts-content.js:58` names Speaking Part 1/3 as a lexical set, not an exam
  profile or Part 2-linked executor.
- Current IELTS/Phase 4 stores and activities do not bind profile, form, section,
  task number and immutable scoring blueprint together.

## Ownership and acceptance rules

One future canonical IELTS profile/inventory owner must own Academic/GT form,
section and content differences. QAR owns only shared question contracts; a
future productive owner owns Writing/Speaking execution/artifacts; Assessment
owns frozen multi-item/timer/result semantics. Shared consumers cannot become
co-owners.

Acceptance is profile- and matrix-specific. “Academic complete” cannot be
inferred from GT evidence or vice versa; shared runtime acceptance does not prove
either inventory complete. Product copy must avoid “full IELTS” until every
claimed row has independent exact-commit evidence.
