# Wave 4 — Productive Practice and Qualified Evidence Boundary Draft

Artifact status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-4S AND U-LI ARE GROUPING_ONLY`
Implementation authorization: `NOT_GRANTED`

## Wave purpose

Create one shared Writing/Speaking productive-practice kernel and learner
artifact lineage, with provider-off use and advisory feedback. Keep deterministic
qualified-evidence rules inside the existing EvidencePolicy authority.

## Candidate decisions

| Candidate | Approved disposition | Boundary preserved | Owner/overlap rule | Minimal pre-ratification gate |
|---|---|---|---|---|
| `PP-00` | `RATIFY_AS_IS` | Shared ProductivePrompt, learner-artifact/feedback/rubric/coaching/ErrorCandidate loop for Writing and Speaking | One future productive-practice owner; reuse LI/SRC/ERR | Exact source/artifact/receipt seams and provider-off completion path approved |
| `PP-01` | `RATIFY_AS_IS` | Writing prompt→outline→draft→self-check→optional coaching→candidate review | Specialization under PP kernel, not a separate store/runtime | Autosave, prompt revision and honest rubric language approved |
| `PP-03` | `RATIFY_AS_IS` | Independent exit gate for shared Writing and Speaking/Retell kernel | Audit-only package candidate; adds no feature | PP Writing/Speaking evidence bound to one exact release candidate |
| `ART-00` | `RATIFY_WITH_BOUNDARY_CHANGE` | Durable private LearnerArtifact, revision, autosave, feedback staleness and Attempt Comparison lineage | Separate from canonical learning evidence and Error Repository | Data classification, comparison compatibility and backup/readback ownership approved |
| `ART-01` | `RATIFY_WITH_BOUNDARY_CHANGE` | Bounded local learner audio with count/age/byte caps, delete/expiry/tombstone and metadata-first backup | Learner artifact, never temporary JOB/P5 process artifact | Concrete caps/codec/eviction/pin rules and raw-audio sidecar consent/restore boundary approved |
| `PP-02` | `RATIFY_WITH_BOUNDARY_CHANGE` | Speaking/Retell record→playback→editable transcript→self-review/coaching/comparison | Retell is specialization; reuse accepted P3 media and future ART owner | Microphone/codec/retention/provider-role matrix and provider-off path approved |
| `QPE-00` | `MERGE_INTO_EXISTING` | Qualification adapter for deterministic text attempts with exact answer authority and no reveal | Port policy into EvidencePolicy; QAR supplies response semantics | Enumerate eligible types/normalization/key authorities and negative fixtures |
| `QPE-01` | `MERGE_INTO_EXISTING` | Exact-dictation qualification after authoritative aligned media source and no-leak behavior | EvidencePolicy plus QAR/Transcript owners; no new evidence package | Exact transcript/range authority, alignment and reveal/playback policy independently accepted |

## Authority rules

- All free-form Writing/Speaking output and feedback is coaching-only and cannot
  claim official IELTS band, pronunciation score, independent evidence, mastery
  or automatic learner error.
- AI/ASR output remains private, revision-bound and unverified until the owning
  validator/user boundary says otherwise.
- LearnerArtifact is private durable data, not a schedule/evidence record.
- Raw audio upload requires task-scoped consent; evaluation consent does not
  imply durable cloud retention or backup.
- Qualified evidence is computed by EvidencePolicy from exact canonical inputs;
  content/provider fields cannot grant it.

## Exit decision

Ratify the productive and artifact candidates only after the Writing/Speaking
coverage matrices identify one canonical inventory/executor owner and the
storage/privacy boundaries are approved. Port QPE semantics when EvidencePolicy
is actually extended; never create a second evidence authority merely to match
the candidate name.
