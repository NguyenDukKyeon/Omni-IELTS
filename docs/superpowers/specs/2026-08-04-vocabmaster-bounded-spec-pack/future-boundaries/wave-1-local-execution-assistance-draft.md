# Wave 1 — Local Execution and Interactive Assistance Boundary Draft

Artifact status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-AI IS GROUPING_ONLY`
Implementation authorization: `NOT_GRANTED`

This artifact preserves approved candidate dispositions without adding a
ROADMAP/PLAN/STATUS row. It must be reviewed immediately before Wave 1; candidate
IDs are planning identities until a separate canonical ratification change set.

## Wave purpose

Establish a reusable durable-work boundary and a provider-neutral interactive
assistance seam while avoiding a second local gateway or a second
AssistanceTrace/evidence authority. This wave must follow accepted LI-00 for any
assistance binding that claims exact execution lineage.

## Candidate decisions

| Candidate | Approved disposition | Boundary preserved for later ratification | Existing owner or overlap boundary | Minimal pre-ratification gate |
|---|---|---|---|---|
| `JOB-00` | `RATIFY_WITH_BOUNDARY_CHANGE` | Generic local work identity, ExecutionAttempt/event log, restart/retry/cancel, owner binding, lease generation and fencing | Reuse P2 resolver-job patterns; provider/model/token/cost semantics remain outside | Reproduce cross-job identity/race problem; freeze single-user/local topology and backup rule that unfinished work never auto-dispatches after restore |
| `AIA-00` | `RATIFY_WITH_BOUNDARY_CHANGE` | Provider-neutral explicit consent, request/result/provenance receipts, physical-attempt accounting, quota/cost and interactive coaching | Extend canonical AssistanceTrace; ERR-00 is the only candidate-to-error path; EvidencePolicy remains sole evidence authority | Inventory existing AI calls/keys; version consent/payload/retention/cost scopes; provider-off path must preserve learner work |
| `LOC-00` | `MERGE_INTO_EXISTING` | Authenticated loopback, secret custody, capability negotiation and trusted owner context | Port into existing P5-01 local-companion owner; no parallel gateway package | Re-open only when P5-01 implementation actually needs the boundary; threat-model Host/Origin/token/LAN/rotation and preserve provider-off behavior |

## Dependency and ownership direction

- `JOB-00` can be researched independently of AIA and product features.
- Interactive AIA does not wait for durable JOB execution.
- AIA consumes LI-00 bindings; it never owns LI, canonical errors, mastery,
  publication or readiness.
- The P5-01 companion may expose an authenticated transport, but AIA owns its
  provider request/attempt/consent semantics.
- No browser caller may supply a provider secret, owner namespace, executable,
  filesystem path or evidence authority.

## Exit decision

Wave 1 can be canonicalized only through a separate approved diff that either
ratifies the narrowed JOB/AIA boundaries or ports the LOC material into P5-01.
The change set must assign one owner per concern, declare exact dependencies and
start every newly ratified package `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.
This draft itself cannot do so.
