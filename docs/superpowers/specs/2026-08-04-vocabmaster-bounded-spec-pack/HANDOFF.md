# VocabMaster Bounded Specification Pack — Handoff

Handoff status: `DOCS_REVIEW_COMPLETE / EWF_ARTIFACT_SLICE_AUTHORIZED`

This is still not `HANDOFF_READY` for every package, product acceptance, merge or
release. It records an independently reviewed frozen specification subject and
one separately authorized EWF-00 implementation slice.

## Frozen subject identity

| Field | Value |
|---|---|
| Subject commit | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Subject parent | `31c3c8a73363d3c88cb0719d799f597b3d381467` |
| Subject message | `docs: add coverage matrices and delivery wave drafts` |
| Original pack branch | `codex/canonical-reconciliation-spec-pack` |
| Scope | 25 specification-pack artifacts under this directory, excluding this handoff |
| Architecture baseline | `adc3726620f4badddb16309e375f8f17b6af1404` — approved design only, not Foundation implementation/acceptance |
| Canonical bootstrap chain | `adc3726 → 0639637 → 9be9914 → d8ec9c7` |

The subject commit contains all bounded specs, matrices, future-boundary drafts
and the implementation queue. The subject artifacts were not edited merely to
change their internal `DRAFT` labels. Later review/authorization records are
separate evidence revisions bound to this exact subject.

## Review and authorization records

| Record | Exact commit | Effect |
|---|---|---|
| Independent documentation review | `d059aeee7d5ddf4691a1bd72628cb0bce31453fd` | Seven package specs reviewed; EWF artifact spec approved as implementation baseline; matrices accepted only as gap ledgers |
| EWF artifact implementation plan | `1ce97fc99f2b430839bdaa693639ef9d71277b62` | Exact approved implementation predecessor and plan content |
| Frozen EWF artifact authorization brief | `a1e3433d13936b392919648fcf4b9ab024178303` | Authorizes only `EWF00-ARTIFACTS-001` under the declared allowlist and gates |

The implementation branch for the first task must start from exact commit
`1ce97fc99f2b430839bdaa693639ef9d71277b62`, not from a newer evidence-only
handoff commit. The authorization brief is consumed as read-only evidence from
its exact commit.

## Authority and effective status boundary

`AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`,
`docs/IMPLEMENTATION_STATUS.md` and `docs/DECISIONS.md` remain the only
canonical governance sources.

Canonical package status remains unchanged:

- LI-00, SRC-00, ERR-00, QAR-00 and EWF-00 remain
  `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.
- U-LI, U-AI, U-PCS, U-4S and U-FD remain grouping labels only.

Effective review results:

- `EWF00-ARTIFACTS-001`: reviewed and approved as an implementation baseline;
  implementation is authorized only by the frozen brief above.
- `EWF00-PREFLIGHT-001` and `EWF00-PILOTS-001`: reviewed and approved as bounded
  specifications, but not implementation-authorized.
- LI-00, SRC-00, ERR-00 and QAR-00 specs: reviewed and approved as bounded
  specifications, but not implementation-authorized.
- all eight coverage matrices remain `DRAFT_PENDING_CANONICAL_REBIND` and are
  accepted only as honest gap ledgers;
- all seven future-boundary drafts remain noncanonical and require just-in-time
  ratification/rebind;
- the implementation queue remains sequencing guidance, not a status ledger.

No document in this pack changes Phase 4/5 acceptance, P5-05 history, ADR-042, a
product behavior or a canonical status row.

## Included artifacts

| Group | Subject artifacts | Review intent |
|---|---:|---|
| Canonical product specs | 4 | LI-00, SRC-00, ERR-00, QAR-00 bounded scopes and acceptance evidence |
| EWF specs | 3 | Artifact contracts; preflight/verification/trace; pilots/measurement/audit |
| Coverage matrices | 8 | Reading, Listening, Writing, Speaking, Academic/GT, source/import, capability/tool, assessment/readiness gaps |
| Future boundary drafts | 7 | Preserved 34 candidate dispositions, just-in-time ratification and deferred work |
| Integration brief | 1 | One audio→activity→attempt→feedback→candidate→advisory recommendation slice |
| Delivery queue | 1 | Ordered, non-authorizing delivery waves |
| Pack README | 1 | Lineage, status rules, manifest and stop conditions |

## Verification recorded for the frozen subject

| Check | Result |
|---|---|
| Subject diff scope | 18 files, all under this specification-pack directory |
| Whitespace check | `git diff --cached --check` clean before subject commit |
| Matrix/future count | 8 matrices; 8 future artifacts including 7 wave/deferred drafts plus 1 vertical brief |
| Rebind status check | 8/8 matrices and 8/8 future artifacts carry `DRAFT_PENDING_CANONICAL_REBIND` |
| Candidate parity | 34/34 future candidates appear in queue; zero appeared in ROADMAP/PLAN/STATUS package tables |
| Coverage taxonomy check | All required Reading/Listening/Writing/Speaking/Academic-GT/source/tool/readiness terms present in the matrices |
| Canonical parity | ROADMAP/PLAN/STATUS each expose 66 package IDs with exact parity; dependency graph has 66 nodes and 0 cycles |
| Umbrella rule | 0 umbrella status rows and 0 umbrella package-dependency rows |
| Roadmap audit | `node scripts/audit-roadmap.mjs` passed 12/12 at the subject worktree |

No production source changed. After the subject pack was completed, `npm test`
was attempted in the clean worktree: 159 tests passed and 31 stopped before their
assertions because `fake-indexeddb`, `ts-fsrs` and `esbuild` were absent. No
dependency installation was authorized, so this is an environment limitation,
not a green production-suite result or a product acceptance verdict. The roadmap
audit is likewise not package implementation or acceptance evidence.

The independent documentation review found no blocking internal contradiction
among the seven package specs. It did not run or claim a green production suite.

## Known open conditions

- `CANONICAL_CONFLICT — NEEDS_SEPARATE_RESOLUTION`: the Speaking matrix records
  an apparent P3-02 Shadowing acceptance/evidence mismatch. This pack neither
  changes nor resolves it; no new spec may rely on the disputed receipt claim.
- Full IELTS profile/inventory ownership, productive-practice ownership, personal
  content ingress/compiler ownership, assessment/readiness ownership and most
  technical-capability choices remain deliberately uncanonicalized.
- Phase 4/5 implementation/remediation evidence remains preserved as recorded;
  it is not reinterpreted as independent acceptance here.
- No GitHub Actions run exists for the reviewed documentation head merely from
  pushing the non-PR branch.

## Stop conditions for a coding agent

Do not start source implementation if any of the following is true:

- the requested task is not `EWF00-ARTIFACTS-001` under the frozen brief;
- HEAD is not exact predecessor `1ce97fc99f2b430839bdaa693639ef9d71277b62`;
- branch/worktree/writer scope or the brief is missing or mismatched;
- the implementation needs a file outside the brief allowlist;
- a requested boundary has no canonical package owner;
- an umbrella is presented as an owner or dependency node;
- a future candidate is not separately ratified/rebound for its wave;
- an implementation would introduce a second runtime/store/scheduler/evidence/
  status/acceptance authority;
- a source, transcript, AI output, tool/provider, privacy/rights/cost claim or
  readiness result lacks its declared validation/consent/evidence gate;
- the P3-02 Shadowing conflict is implicated;
- an action requires dependency installation, automatic initialization, CI
  modification or a new overlapping writer without separate authorization.

## Authorized immediate successor

Create branch `chatgpt/ewf-00-artifact-contracts-mvp` from exact commit
`1ce97fc99f2b430839bdaa693639ef9d71277b62`, then implement the plan at:

`docs/superpowers/plans/2026-08-04-ewf-00-artifact-contracts-mvp.md`

under the frozen authorization brief at:

`docs/superpowers/briefs/2026-08-04-ewf00-artifact-contracts-mvp-authorization.md`

No LI-00, SRC-00, ERR-00, QAR-00, EWF preflight/trace or pilot implementation is
authorized by this handoff.
