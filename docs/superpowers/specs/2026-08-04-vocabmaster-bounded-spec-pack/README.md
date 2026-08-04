# VocabMaster Bounded Specification Pack

Pack status: `DRAFT / REVIEW_REQUIRED / NO_IMPLEMENTATION_AUTHORIZATION`

This directory decomposes the approved Master Architecture into bounded
package specifications, coverage matrices and future-wave briefs. It is not a
mega-spec, implementation plan, package-status authority or acceptance record.

## Canonical lineage

| Record | Exact commit | Meaning |
|---|---|---|
| Architecture baseline | `adc3726620f4badddb16309e375f8f17b6af1404` | Approved Engineering Workflow Foundation design; not implementation/acceptance |
| CR-1 | `06396378105f619ff7a498392ea15c2309f7d2af` | Phase 4/5 status reconciliation only |
| CR-2A | `9be9914e7080e6b9980a771307ed5ab232d89b6b` | Five grouping-only umbrellas and LI-00/SRC-00/ERR-00/QAR-00 |
| CR-3 | `d8ec9c7f0219f48b368810203c962daf85b64135` | EWF-00 governance bootstrap only |

Canonical authority remains `AGENTS.md`, `docs/ROADMAP.md`,
`docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md` and
`docs/DECISIONS.md`. The preserved dirty planning at
`D:\Workspace\VocabMaster` is provenance input only and was not replayed
wholesale.

## Status rules

- `DRAFT` means a bounded spec has a canonical package owner but has not been
  approved for implementation.
- `DRAFT_PENDING_CANONICAL_REBIND` means no canonical owner currently owns the
  complete boundary. The artifact cannot create a package/status/dependency.
- All five canonical packages referenced here remain
  `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.
- No artifact in this pack is acceptance evidence or `HANDOFF_READY`.
- U-LI, U-AI, U-PCS, U-4S and U-FD are grouping labels only.

## Artifact manifest

| Artifact group | Files | Status | Owner |
|---|---:|---|---|
| Canonical package specs | 4 | `DRAFT` | LI-00, SRC-00, ERR-00, QAR-00 |
| EWF bounded specs | 3 | `DRAFT` | EWF-00 |
| Coverage matrices | 8 | `DRAFT_PENDING_CANONICAL_REBIND` | Explicit unassigned owner per matrix |
| Future-wave boundary drafts | 7 | `DRAFT_PENDING_CANONICAL_REBIND` | Unassigned; U-* is never owner |
| Vertical-slice integration brief | 1 | `DRAFT_PENDING_CANONICAL_REBIND` | Multi-owner integration; no package identity |
| Implementation queue | 1 | `PLANNING_ONLY / NO_IMPLEMENTATION_AUTHORIZATION` | Canonical packages remain separately owned |
| Handoff | 1 | `DOCS_ONLY_HANDOFF / SOURCE_IMPLEMENTATION_NOT_AUTHORIZED` | Records the reviewed spec-pack subject commit |

The candidate inventory remains exact: four CR-2A canonical candidates plus
34 later-wave/deferred candidate records equals 38 unique candidates. The
later 34 have no ROADMAP/PLAN/STATUS package row.

## Review order

1. Review the four canonical product-package specs independently.
2. Review the three EWF-00 specs as one package with non-overlapping internal
   boundaries.
3. Review coverage matrices as gap records, not coverage claims.
4. Review each future-wave brief immediately before considering that wave's
   canonical ratification.
5. Review `IMPLEMENTATION_QUEUE.md`; sequencing is not authorization.
6. Use `HANDOFF.md` only for the next docs/spec review action.

## Pack-wide stop conditions

Stop and rebind before implementation if a spec conflicts with canonical
scope/dependency/status, invents a package owner, makes an umbrella an owner,
adds a second runtime/store/status/acceptance authority, assumes full IELTS
coverage, treats generated content as verified, or silently selects a tool or
provider without research and approval.
