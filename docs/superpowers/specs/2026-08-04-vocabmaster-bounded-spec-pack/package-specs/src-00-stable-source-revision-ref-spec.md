# SRC-00 — Stable SourceRevisionRef Seam

## Metadata

| Field | Value |
|---|---|
| Spec ID | `SRC00-REVREF-001` |
| Spec type | `feature` |
| Local spec status | `DRAFT` |
| Canonical package | `SRC-00` |
| Canonical package status | `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED` |
| Implementation authorization | `NOT_GRANTED` |
| Canonical boundary | `docs/ROADMAP.md` SRC-00; `docs/IMPLEMENTATION_PLAN.md` SRC-00 |
| Dependencies | Accepted P1-01, P1-05 and P3-06; public-pack adapter additionally requires accepted P4 contracts |
| Acceptance owner | Independent canonical reviewer at the exact implementation commit |
| Requirement namespace | `SRC00-RR-*` |

## Goal and acceptance boundary

Define one portable, versioned reference seam that lets canonical activities,
attempts and compilers name the exact source revision they consumed without
creating another source database or trust authority. SRC-00 owns reference
shape, adapter validation and resolution-result semantics only.

Card, Transcript, private-content and public-pack repositories continue to own
their data, revisions, deletion rules and trust decisions. A reference can
report repository-owned provenance; it cannot upgrade that provenance.

## Repository anchors

- `src/learning-contracts.js` already binds `sourceId` and `sourceRevision` in
  an exact learning target.
- `src/transcript-aggregate.js` creates immutable provider transcript revisions
  and controls activation.
- `src/ielts-domain.js` and `src/schedule-gateway.js` derive existing revision
  identities for IELTS and Core surfaces.
- P4 content contracts own signed public-pack trust and lifecycle; SRC-00 may
  consume those results only after their canonical acceptance dependency is
  satisfied.

These surfaces prove reuse opportunities. SRC-00 does not consolidate their
stores.

## Ownership and non-goals

| Concern | Owner after SRC-00 |
|---|---|
| Reference syntax, validation and resolution envelope | SRC-00 |
| Card/sense records and their revisions | Existing P1 owner |
| Transcript aggregate, edit lineage and active revision | P3-06 |
| Public pack signature, activation and rights state | Existing P4 owners |
| Future private source ingestion/revision | Future approved personal-content owner |
| Activity/attempt binding | Existing P1 contracts; LI-00 hardening when implemented |

SRC-00 does not ingest text/PDF/URL/media, download content, edit sources,
choose a transcript, publish/sign packs, compile activities, create a Library,
or own content licensing. It introduces no fourth database, shadow catalog or
global provenance truth.

## Logical contract

### SourceRevisionRef

The logical reference has the following required semantics. Physical field
names and serialization format are an implementation-spec decision.

| Field group | Meaning |
|---|---|
| Schema | reference schema name and supported version |
| Authority | registered source kind and adapter authority identifier |
| Identity | stable source ID plus immutable revision ID |
| Integrity | canonical digest or repository-provided immutable integrity token |
| Locator | adapter-local locator sufficient to resolve without global scanning |
| Provenance projection | origin class, creator/provider where known, rights/privacy classification and verification state as asserted by the owning repository |
| Tombstone/export | portable metadata needed to distinguish missing, deleted, redacted and unsupported on restore |

Raw secrets, access tokens, private filesystem paths and entire source bodies do
not belong in the reference. Optional display metadata is non-authoritative and
cannot participate in identity.

### Resolution result

Resolution returns exactly one of:

- `RESOLVED`: exact revision and integrity token match;
- `NOT_FOUND`: authority/source/revision does not exist in the current store;
- `TOMBSTONED`: the owner records deliberate deletion/redaction;
- `UNSUPPORTED_KIND` or `UNSUPPORTED_VERSION`;
- `INTEGRITY_MISMATCH`;
- `PROVENANCE_INVALID` or `RIGHTS_BLOCKED` as decided by the owning adapter;
- `AUTHORITY_UNAVAILABLE`: owner exists but cannot currently resolve.

No result silently falls back to a newer active revision. UI may offer an
explicit rebind workflow, but rebind creates a new activity/source binding and
never rewrites an old attempt.

## Requirements

| ID | Normative requirement |
|---|---|
| `SRC00-RR-01` | A valid reference names one registered authority, stable source ID, immutable revision ID and integrity token. |
| `SRC00-RR-02` | Adapter registration has one owner per source kind/version; ambiguous or duplicate ownership fails closed. |
| `SRC00-RR-03` | Resolution is exact and side-effect free; it never activates, edits, downloads, upgrades or publishes content. |
| `SRC00-RR-04` | Active/latest aliases may be accepted only at authoring time and must compile to an immutable revision before activity execution. |
| `SRC00-RR-05` | Missing, tombstoned, redacted, unsupported and integrity-mismatched results remain distinguishable. |
| `SRC00-RR-06` | Provenance/rights/privacy fields are projections from the source owner and cannot be promoted by a caller, AI model or generic adapter. |
| `SRC00-RR-07` | Public-pack resolution consumes P4 trust/lifecycle verdicts and cannot bypass them; the neutral seam is independently usable without P4. |
| `SRC00-RR-08` | References round-trip through canonical backup/export without leaking protected source content or local credentials. |
| `SRC00-RR-09` | Historical attempts retain their original reference and resolution evidence even when a child revision becomes active. |
| `SRC00-RR-10` | Unknown future reference data is preserved where safe but remains unresolvable until an approved adapter exists. |

## Privacy, rights and provenance rules

The adapter must return the minimum projection required by its consumer. A
private source cannot become public because a reference was exported. Rights or
consent uncertainty blocks downstream compilation/publication where the owning
policy requires it. Logs and test fixtures use synthetic content and redact
tokens, filesystem paths and personal source text.

Generated or extracted content remains draft until its owning ingestion lane
validates it or the user confirms it. SRC-00 records that state; it cannot make
the confirmation.

## Migration and rollback

Existing `(sourceId, sourceRevision)` pairs are adapted without rewriting their
historical values. Each legacy adapter declares how its integrity token is
derived and which limitations remain. A pair that cannot prove one immutable
revision is preserved as unresolved/coaching-only rather than assigned a
fabricated revision.

Rollback removes the generic adapter/read seam only. Source repositories,
revision histories, tombstones and historical attempt references remain intact.
Export must retain enough typed data for a later compatible adapter to resolve.

## Required verification

| Test obligation | Required evidence |
|---|---|
| Schema/registry | valid kinds/versions, duplicate owner, malformed IDs/digests and unknown fields |
| Exactness | active revision changes after binding; resolver still returns original revision or a typed absence |
| Adapters | Core card and Transcript adapters; public-pack adapter only when its P4 acceptance gate is met |
| Provenance | forged verification/rights fields cannot override repository-owned state |
| Lifecycle | child revision, tombstone, redaction and authority unavailable paths |
| Portability | backup → restore → reopen exact references, including unresolved/tombstoned rows |
| Privacy | export/log inspection proves no token, absolute private path or source body leakage |

## Gates and acceptance evidence

Entry requires a reviewed source-kind registry, revision/tombstone semantics,
privacy/provenance field policy, exact predecessor and non-overlapping adapter
writers. A public-pack adapter is excluded unless accepted P4 contracts are an
explicit dependency of that implementation slice.

Exit evidence includes exact commit/parent, diff boundary, adapter ownership
map, requirement trace, focused/PR commands, backup/restore/reopen and malformed
provenance fixtures, migration/rollback report, and an independent exact-commit
audit. Successful generic resolution is not proof that source rights, content
quality or a downstream activity is accepted.
