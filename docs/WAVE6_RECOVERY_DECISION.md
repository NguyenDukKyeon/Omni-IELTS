# ADR-049 — Wave 6 Local Recovery Owner Canonicalization

Status: `CANDIDATE / CONFIRMED ONLY AFTER INDEPENDENT EXACT-HEAD ACCEPT + MERGE`
Exact predecessor: `66666172238668b1ea40d7ff596c82c209fcdfe5`

## Context

The recovered local Wave 6 working tree contains technically coherent successor P7/WKN, Focus/Today, Frozen Assessment and Targeted Diagnostic implementation bytes, but those bytes were created outside an accepted Protocol-V1 A→RED→B→GREEN→C lineage. They are therefore recovery input, not accepted implementation history.

PR #66 independently established P7-00/WKN-00 implementation acceptance at exact head `9b8aeb3c92f577857caffcb218f6fd9ddebf022a`; later package audit review `4928369301` grants package acceptance for that exact subject only. Merge authority is still separate. The recovered local P7/WKN bytes diverge and cannot inherit that acceptance.

## Decision

- WKN-00 remains absorbed into `P7-00`. Divergent recovered P7/WKN bytes are a successor change requiring prospective authorization and fresh independent acceptance.
- FCS-00/FCS-01 are absorbed into the bounded `P1-07 Today Composer` seam for deterministic evidence-backed Focus only. P7-04 is not activated and remains governed by its existing dependencies.
- FCS-02 remains unassigned/deferred and is excluded from recovery.
- `ASM-00` is the cross-cutting owner for Frozen Assessment: immutable authenticated multi-item blueprint/run, QAR scoring binding, atomic completion, backup/restore and raw aggregate result only.
- `TD-00` is the owner for Targeted Diagnostic: a deterministic weakness-biased adapter over accepted WeaknessProfile + ASM-00, explicitly non-representative and unable to create schedule/evidence/readiness/band/mastery claims.
- The recovered dirty tree is frozen as non-canonical input. No retroactive authorization, RED/GREEN chronology, CI, acceptance or merge authority may be fabricated from it.

## Consequences

Each recovery subject requires its own independently accepted `BOUNDED_EXECUTION_CAPSULE_PROTOCOL_V1` execution record, exact predecessor, immutable test-first A, natural behavioral RED, minimal source-only B, exact-head GREEN, evidence-only C and independent exact-head verdict. One package cannot inherit another package's ACCEPT.

## Exclusions

No FCS-02 advisory lane, P7-01+, workload optimization, readiness, band estimation, mastery claim, FSRS tuning, second Today scheduler, second assessment runtime, AI key/scoring authority, release or deployment authority is created.

## Rollback

Revert only the recovery owner/addendum bindings. Preserve the uploaded snapshot, historical PRs, exact verdicts and accepted PR #66 subject unchanged.
