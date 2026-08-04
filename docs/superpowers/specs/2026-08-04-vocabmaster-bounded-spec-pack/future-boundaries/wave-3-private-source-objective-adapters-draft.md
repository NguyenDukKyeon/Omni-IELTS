# Wave 3 — Private Sources and Objective Practice Adapters Boundary Draft

Artifact status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-PCS AND U-4S ARE GROUPING_ONLY`
Implementation authorization: `NOT_GRANTED`

## Wave purpose

Introduce a private-content trust/library boundary only when a useful source
slice is ready, while porting file/transcript and Reading/Listening adapters into
their real existing/shared owners. This wave must not turn SRC-00 into an ingest
system or QAR-00 into an IELTS inventory owner.

## Candidate decisions

| Candidate | Approved disposition | Boundary preserved | Canonical owner/port target | Minimal pre-ratification gate |
|---|---|---|---|---|
| `PCS-00` | `RATIFY_AS_IS` | Private revision/approval/finding/quarantine/tombstone contracts separating availability, publication trust, answer authority and evidence eligibility | New candidate only when separately ratified | Illegal private→verified/published/evidence transitions and legacy private assets inventoried |
| `PCS-01` | `RATIFY_WITH_BOUNDARY_CHANGE` | Durable private Library, revision lifecycle, backup/restore and bounded local search/read model | Future PCS owner; no second general source store | Store/backup ownership, quota, measured corpus/search target and delete/tombstone behavior frozen |
| `SRC-01` | `MERGE_INTO_EXISTING` | Safe TXT/CSV/TSV/SRT/VTT preview, limits, atomic import and provenance | Port supported import behavior into historical P5-05 importer/rescue owner when implemented; use SRC-00 reference output | Exact format/encoding/MIME/size matrix and hostile fixtures approved; no parser dependency without gap evidence |
| `SRC-02` | `MERGE_INTO_EXISTING` | Exact TranscriptRevision/range/segment reference adapter without copying/upgrading trust | P1-05/P3 transcript owner supplies resolution; SRC-00 owns stable reference seam | Audit alignment/provenance/edit semantics; imported/local/cloud transcript never self-qualifies |
| `QAR-01` | `MERGE_INTO_EXISTING` | Reading question adapter and type-specific execution | QAR-00 owns common schema/registry seam; a future canonical Reading inventory/executor owner owns content/profile/UI | Rebind to that owner and approve Reading coverage matrix; do not create a QAR-owned inventory |
| `QAR-02` | `MERGE_INTO_EXISTING` | Listening/media question adapter and exact transcript/audio binding | QAR-00 common contracts plus P3 Transcript/media and a future Listening inventory/executor owner | Rebind inventory/timing owner; approve media authority/no-leak matrix |

## Dependency direction

- Neutral SRC-00 adapters do not wait for a private Library.
- A private revision may reference existing canonical transcript/card/source data
  without copying or upgrading its trust.
- QAR contracts can be implemented before complete Reading/Listening inventory,
  but no question type is “covered” until its matrix dimensions are accepted.
- Private approval permits private use only; it is not public HumanReview,
  answer authority, qualified evidence or publication approval.
- Draft/quarantined/stale sources never enter runnable inventory.

## Exit decision

Ratify PCS packages only with one explicit data owner and backup/delete policy.
Port the four merge candidates only in the implementation wave that exercises
their existing owner. If Reading or Listening inventory still has no canonical
owner, the relevant adapter remains blocked rather than being assigned to an
umbrella or QAR by implication.
