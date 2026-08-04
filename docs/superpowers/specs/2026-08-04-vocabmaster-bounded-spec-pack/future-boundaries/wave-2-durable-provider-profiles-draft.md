# Wave 2 — Durable Assistance and Provider Profiles Boundary Draft

Artifact status: `DRAFT_PENDING_CANONICAL_REBIND`

Canonical owner: `UNASSIGNED — U-AI IS GROUPING_ONLY`
Implementation authorization: `NOT_GRANTED`

## Wave purpose

Add durable AI execution and one optional provider adapter only after the Wave 1
owners exist. Preserve the separation between logical AIA requests, physical
provider attempts, generic JOB execution and local companion process artifacts.

## Candidate decisions

| Candidate | Approved disposition | Boundary preserved | Dependency direction | Minimal pre-ratification gate |
|---|---|---|---|---|
| `AIA-01` | `RATIFY_AS_IS` | Background AIA profile using the shared durable-work substrate for restart/resume, validation/quarantine and stale-result fencing; no AI queue/repository duplicate | Future AIA-00 + future JOB-00 | Legacy AI-job migration and physical-attempt accounting reviewed; portable restore cannot silently re-dispatch |
| `AIA-02` | `RATIFY_WITH_BOUNDARY_CHANGE` | Optional Gemini transport; first bounded profile is interactive text coaching, while PCS generation and P5 media retain separate task schema/consent gates | Future AIA-00 + P5-01 companion transport; durable profile is optional | Provider terms/retention/cost and secure secret path reviewed; fake adapter versus separately authorized live evidence distinguished |
| `JOB-01` | `MERGE_INTO_EXISTING` | Process-tree cancellation, temporary artifact isolation, limits, cleanup journal and fencing for local binaries | Port operational process boundary to P5-01 and recovery/cleanup boundary to P5-03; consume JOB only if later ratified | Implement only when the existing owners need a binary-process adapter; prove traversal/symlink/argv/resource/cancel/cleanup behavior |

## Boundary rules

- A durable dispatch binds one AIA physical provider attempt to one JOB
  execution attempt; retries never hide billing attempts.
- Interactive text coaching does not wait for AIA-01, Phase 5 core exit or media
  fallback acceptance.
- Gemini media/audio remains outside the text profile and must not inherit its
  consent or validation.
- Temporary JOB/P5 process artifacts are reconstructable operational state;
  learner-owned durable audio belongs to a later productive-artifact owner.
- No Azure or generic multi-cloud abstraction is introduced by this wave.

## Exit decision

Before canonical ratification, confirm actual Wave 1 package identities,
provider/task profiles, kill-switch behavior, exact migration/rollback and live
evidence claims. A provider contract test is not availability, privacy-term or
quality evidence.
