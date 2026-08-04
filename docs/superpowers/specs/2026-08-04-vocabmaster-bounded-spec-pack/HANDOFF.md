# VocabMaster Bounded Specification Pack — Handoff

Handoff status: `DOCS_ONLY_HANDOFF / SOURCE_IMPLEMENTATION_NOT_AUTHORIZED`

This is a review handoff for documentation only. It is not `HANDOFF_READY` for
any package implementation, acceptance, merge or release.

## Frozen subject identity

| Field | Value |
|---|---|
| Subject commit | `0b43efac974c3fbbc489f10e9fa668bac84c9b43` |
| Subject parent | `31c3c8a73363d3c88cb0719d799f597b3d381467` |
| Subject message | `docs: add coverage matrices and delivery wave drafts` |
| Branch | `codex/canonical-reconciliation-spec-pack` |
| Scope | 25 specification-pack artifacts under this directory, excluding this handoff |
| Architecture baseline | `adc3726620f4badddb16309e375f8f17b6af1404` — approved design only, not Foundation implementation/acceptance |
| Canonical bootstrap chain | `adc3726 → 0639637 → 9be9914 → d8ec9c7` |

The subject commit contains all bounded specs, matrices, future-boundary drafts
and the implementation queue. This later handoff commit must not change the
subject identity. Any change to the subject artifacts requires a new subject,
new validation results and a new handoff.

## Authority and status boundary

`AGENTS.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`,
`docs/IMPLEMENTATION_STATUS.md` and `docs/DECISIONS.md` remain the only
canonical governance sources.

- LI-00, SRC-00, ERR-00, QAR-00 and EWF-00 remain
  `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`.
- The seven package specs are `DRAFT` only.
- All eight coverage matrices, seven future-boundary drafts and the vertical
  slice brief are `DRAFT_PENDING_CANONICAL_REBIND` where no complete canonical
  owner exists.
- The implementation queue is `PLANNING_ONLY / NO_IMPLEMENTATION_AUTHORIZATION`.
- U-LI, U-AI, U-PCS, U-4S and U-FD are grouping labels only. They own no
  dependency, package status, acceptance verdict or implementation work.

No document in this pack changes Phase 4/5 acceptance, P5-05 history,
ADR-042, a product behavior or a canonical status row.

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

## Verification recorded for the subject

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
was attempted in the clean worktree: 159 tests passed and 31 failed before their
assertions because `fake-indexeddb`, `ts-fsrs` and `esbuild` are absent. No
dependency installation was authorized, so this is an environment limitation,
not a green production-suite result or a product acceptance verdict. The roadmap
audit is likewise not package implementation or acceptance evidence.

## Required next review

1. Review the seven bounded package specs for exact canonical scope,
   dependency, acceptance and no-second-authority rules.
2. Review each matrix as a gap ledger, especially its `GAP` versus `PARTIAL`
   classifications; do not approve a full-coverage claim from it.
3. Review the 34 candidate dispositions immediately before the respective wave;
   do not bulk-ratify them.
4. Review the first vertical-slice ownership map. Its weakness/recommendation
   end is advisory preview only until a canonical Focus/Weakness owner is
   separately rebound.
5. If Foundation implementation is considered, approve an exact EWF-00
   implementation predecessor and file boundary under the three EWF specs. Do
   not install Spec Kit, fast-check or another dependency by default.

## Known open conditions

- `CANONICAL_CONFLICT — NEEDS_SEPARATE_RESOLUTION`: the Speaking matrix records
  an apparent P3-02 Shadowing acceptance/evidence mismatch. This pack neither
  changes nor resolves it; no new spec may rely on the disputed receipt claim.
- Full IELTS profile/inventory ownership, productive-practice ownership, personal
  content ingress/compiler ownership, assessment/readiness ownership and most
  technical-capability choices remain deliberately uncanonicalized.
- Phase 4/5 implementation/remediation evidence remains preserved as recorded;
  it is not reinterpreted as independent acceptance here.
- A separate independent documentation review of this pack remains pending.

## Stop conditions for a coding agent

Do not start source implementation if any of the following is true:

- a requested boundary has no canonical package owner;
- an umbrella is presented as an owner or dependency node;
- a future candidate is not separately ratified/rebound for its wave;
- the exact predecessor, worktree, writer scope or acceptance brief is missing;
- an implementation would introduce a second runtime/store/scheduler/evidence/
  status/acceptance authority;
- a source, transcript, AI output, tool/provider, privacy/rights/cost claim or
  readiness result lacks its declared validation/consent/evidence gate;
- the P3-02 Shadowing conflict is implicated;
- an action requires dependency installation, automatic initialization or a new
  worktree without separate authorization.

## Recommended immediate successor

The immediate successor is a read-only review of this subject commit, followed
by one explicit choice: authorize the minimum EWF-00 implementation slice, or
authorize LI-00/SRC-00 planning independently. It is not an instruction to
implement either package now.
