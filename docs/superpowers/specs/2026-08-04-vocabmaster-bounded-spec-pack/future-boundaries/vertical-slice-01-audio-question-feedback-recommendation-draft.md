# Vertical Slice 01 — Audio to Question, Feedback and Next Recommendation

Artifact status: `DRAFT_PENDING_CANONICAL_REBIND`

Integration owner: `UNASSIGNED — MULTI-OWNER BRIEF; NO PACKAGE IDENTITY`
Implementation authorization: `NOT_GRANTED`

## Purpose

Validate the architecture end to end before expanding IELTS inventory:

`exact audio/transcript source → one Listening activity → canonical attempt →
deterministic feedback → ErrorCandidate → weakness signal → next recommendation`.

The first slice uses a rights-cleared, manually authored question bound to an
exact accepted Transcript revision. It does not require AI generation, Phase 5
cloud fallback, a new source importer or complete Listening coverage.

## Ownership map and stage gates

| Stage | Single owner | Required boundary | Gate |
|---|---|---|---|
| Audio/transcript identity | Existing P2/P3 Transcript/media owner | Exact source/revision/range and rights/provenance | Accepted source path; no timingless/unverified answer authority |
| Stable source reference | SRC-00 | Resolve the exact revision without copying/upgrading trust | SRC-00 accepted |
| One question contract | QAR-00 | One manually approved Listening multiple-choice schema, validator, key and executor capability | LI-00/SRC-00 accepted; QAR slice separately authorized |
| Run/attempt/receipt | Existing P1 runtime plus LI-00 | Frozen source/prompt/key/scorer/evidence bindings; one terminal winner | LI-00 accepted |
| Feedback | QAR deterministic result/review semantics | Explain selected response and source evidence without claiming band/readiness | Exact attempt/receipt persisted |
| Error candidate | ERR-00 | Wrong answer becomes candidate; user/qualified evidence controls promotion | ERR-00 accepted; no direct ErrorRecord/FSRS write |
| Weakness signal | Unassigned U-FD boundary | Advisory, revision-bound `listening.multiple-choice` signal only | Must be rebound before durable canonical profile use |
| Next recommendation | Existing Today display only after approved focus seam; otherwise preview only | One coaching activity suggestion with reason and no due displacement/provider call | Rebind FCS/Today ownership before insertion |

## Slice requirements

| ID | Requirement |
|---|---|
| `VS01-01` | The source, segment/range, prompt, options, key, scorer and EvidencePolicy inputs are frozen before start. |
| `VS01-02` | The activity is accessible by keyboard/screen reader and exposes no sealed key before terminal submission. |
| `VS01-03` | Reload/resume and duplicate submit produce one canonical terminal Receipt and one deterministic result. |
| `VS01-04` | Feedback binds the exact attempt/source/key revision and becomes stale rather than silently updating after source edits. |
| `VS01-05` | A wrong response can create one ErrorCandidate; model output or UI flags cannot promote it. |
| `VS01-06` | Any weakness signal is labeled advisory until a canonical WeaknessProfile owner and qualification rule are ratified. |
| `VS01-07` | The recommendation is explainable, provider-free on open and cannot displace due review; before focus rebind it is a non-scheduling preview. |
| `VS01-08` | The slice is recorded as one Listening multiple-choice proof only, never “full Listening” or readiness evidence. |

## Required evidence

- exact commit/parent and owner-specific allowlists;
- source/revision/rights and sealed-key approval record;
- schema/invariant, normalization/scoring and answer-leak tests;
- durable browser start→reload→submit→reopen plus duplicate/race tests;
- one canonical attempt/receipt and separately counted ErrorCandidate/promotion
  effects;
- source-edit, stale key, transcript alignment/provenance and backup/restore
  negative paths;
- recommendation reason, due-precedence proof and zero provider call on open;
- independent acceptance for each canonical package boundary, not one aggregate
  verdict that overwrites their owners.

## Stop boundary

Stop before implementation if the weakness/recommendation owner is still
unassigned, unless the separately approved slice explicitly ends at a
nonpersistent advisory preview. Also stop on rights uncertainty, unaccepted
source alignment, missing LI/SRC/QAR/ERR gates, second attempt/error/scheduler
store or any proposal to broaden this one type into complete IELTS inventory.
