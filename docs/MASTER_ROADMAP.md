# VocabMaster — Master Product Roadmap Stage 1–8

Status: **CANONICAL**

Authority: **TOP-LEVEL MASTER PRODUCT ROADMAP**

Last updated: 2026-08-17

## 1. Purpose and authority

This document is the Owner-ratified top-level product roadmap for VocabMaster.
It owns:

- top-level long-horizon product sequencing;
- Stage identities and missions;
- Stage ordering and completion state;
- interstage governance gates.

This document supersedes `docs/ROADMAP.md` as the top-level product roadmap.
`docs/ROADMAP.md` is reclassified as the subordinate Technical Package Taxonomy
(Phase 0–7) and retains its full technical knowledge. See §8 below.

### Authority hierarchy

| Level | Document | Owns |
|---|---|---|
| 1 — Master Product Roadmap | This document (`docs/MASTER_ROADMAP.md`) | Top-level Stage 1–8 product sequencing, Stage missions, ordering, completion state |
| 2 — Technical Package Taxonomy | `docs/ROADMAP.md` | Phase 0–7 package IDs, technical dependency graph, architecture boundaries, cross-cutting packages |
| 3 — Implementation Specification | `docs/IMPLEMENTATION_PLAN.md` | Package acceptance criteria, test/migration/rollback/stop conditions |
| 4 — Implementation Status | `docs/IMPLEMENTATION_STATUS.md` | Actual execution status, evidence, exact commit bindings |
| 5 — Decision Records | `docs/DECISIONS.md` | Architecture/product rationale and ADRs |
| 6 — Repository Rules | `AGENTS.md` | Invariant execution rules, evidence policy, Git conventions |

A roadmap entry does NOT automatically authorize implementation. Execution
requires separate bounded authorization, and independent acceptance requires
a separate independent audit.

## 2. Taxonomy: Stage vs Phase vs Wave vs Package

These four terms are NOT interchangeable.

| Term | Scope | Example |
|---|---|---|
| **Stage** | Top-level product milestone in this Master Roadmap (1–8) | Stage 2 — IELTS Completeness |
| **Phase** | Technical implementation grouping in `docs/ROADMAP.md` (0–7) | Phase 2 — Caption-first Transcript Resolver |
| **Wave** | Bounded execution sequence within a Stage | W0 — EWF Foundation (inside Stage 1) |
| **Package** | Atomic unit of planning, verification, commit and acceptance | P0-00, P1-05, LI-00, EWF-00 |

**Critical distinction**: Stage numbers do NOT map 1:1 to Phase numbers.

- Stage 2 (IELTS Completeness) is NOT Phase 2 (Caption-first Transcript Resolver).
- Stage 1 Waves W0–W6 are NOT Phases 0–6.
- A Phase is a technical implementation grouping; a Stage is a product milestone.

Historical accepted package identities (P0-00 through P7-05, LI-00, SRC-00,
ERR-00, QAR-00, EWF-00) remain valid unless separately superseded by a future
authority decision.

## 3. Stage 1–8 sequence

### Stage 1 — Core Foundation

**Status: COMPLETE**

Mission: establish the foundational substrate — release safety, core product
unification, transcript resolution, full-video workspace, remote content
platform, ASR/cloud fallback, and weakness diagnostics.

Stage 1 was delivered through seven Waves (see §5).

---

### Stage 1.5 — Adversarial Product Jury *(interstage)*

**Status: COMPLETE**

Stage 1.5 is an interstage governance and product review gate between Stage 1
and Stage 2. It is NOT counted as one of the eight numbered product stages.

Purpose:

- adversarial product and technical discovery of Stage 1 substrate;
- retained-finding reconciliation;
- bounded remediation before Stage 2.

Accepted outcome: `READY_FOR_STAGE_2_RECONCILIATION`.

Stage 1.5 does NOT authorize Stage 2 implementation.

---

### Stage 2 — IELTS Completeness

**Status: COMPLETE / CANONICALLY_CLOSED**

**Implementation authority: Historical (Waves W0–W6 canonically closed)**

Mission: achieve IELTS learning completeness on the Stage 1 substrate.

Stage 2 was delivered across seven Waves (W0–W6, see §7) targeting the Full
IELTS Platform (Academic and General Training across Listening, Reading,
Writing, and Speaking). Stage 2 achieved verified completion under exit gate
`IELTS_COMPLETENESS_V1` (18/18 machine-checkable dimensions verified).

---

### Stage 3 — Learning / Product Deep Research

**Status: NEXT**

**Execution authority: NOT GRANTED (Requires separate bounded authorization manifest)**

Mission: broad research including:

- Product and Learning Deep Research;
- OSS capability research;
- transcript and learning pipeline research;
- architecture proposals.

Stage 3 is the major broad research stage. Stage 3 is next in product
sequencing following the canonical closure of Stage 2. Stage 3 execution,
research, and implementation authority is NOT GRANTED by this roadmap
reconciliation and requires a separate bounded authorization manifest. No
external provider, dependency, or implementation decomposition is yet adopted.

---

### Stage 4 — UX / IA Remake

**Status: FUTURE**

---

### Stage 5 — AI / Technology Deep Research & Benchmark

**Status: FUTURE**

Mission: technology benchmark and selection of concrete implementation
technology.

---

### Stage 6 — Final Product Remake / Implementation

**Status: FUTURE**

---

### Stage 7 — Production & Real-User Validation

**Status: FUTURE**

---

### Stage 8 — A→Z Final Audit & Launch

**Status: FUTURE**

## 4. Current project state summary

| Stage | Name | Status | Implementation authority |
|---|---|---|---|
| Stage 1 | Core Foundation | COMPLETE | Historical |
| Stage 1.5 | Adversarial Product Jury *(interstage)* | COMPLETE | Historical |
| Stage 2 | IELTS Completeness | COMPLETE / CANONICALLY_CLOSED | Historical (Waves W0–W6 closed) |
| Stage 3 | Learning / Product Deep Research | NEXT | NOT GRANTED |
| Stage 4 | UX / IA Remake | FUTURE | NOT AUTHORIZED |
| Stage 5 | AI / Technology Deep Research & Benchmark | FUTURE | NOT AUTHORIZED |
| Stage 6 | Final Product Remake / Implementation | FUTURE | NOT AUTHORIZED |
| Stage 7 | Production & Real-User Validation | FUTURE | NOT AUTHORIZED |
| Stage 8 | A→Z Final Audit & Launch | FUTURE | NOT AUTHORIZED |

## 5. Stage 1 Wave record

Stage 1 was delivered through the following ratified Wave sequence:

| Wave | Name | Scope |
|---|---|---|
| W0 | EWF Foundation | Engineering Workflow Foundation |
| W1 | Local Execution Assistance | Local-first execution assistance substrate |
| W2 | Durable Provider Profiles | Durable provider governance |
| W3 | Private Source Objective Adapters | Private source and objective adapters |
| W4 | Qualified Productive Practice | Qualified productive practice substrate |
| W5 | Personal Content Supply Lane | Personal content supply |
| W6 | Weakness Focus Diagnostics | Weakness, focus and diagnostic substrate |

These are Stage 1 Waves. They are NOT Phase IDs and do NOT map to the
Phase 0–7 technical taxonomy.

Stage 1 technical implementation was accomplished through the Phase 0–7
package graph documented in `docs/ROADMAP.md`. The relationship is:

- Stage 1 Waves define the product delivery sequence;
- Phase 0–7 packages define the technical implementation boundaries;
- A Wave may consume packages from multiple Phases;
- A Phase may serve multiple Waves.

## 6. Stage 1.5 record

Stage 1.5 — Adversarial Product Jury was conducted as an interstage
governance gate after Stage 1 completion.

Key records:

- Product/technical discovery and retained findings;
- Finding reconciliation and bounded remediation;
- Accepted Stage 1.5 closure at PR #84 (clean rematerialization recovery);
- Final canonical main: `1744d4d92ac0a7aa6ac42ce9b97b49263336908c`.

Relevant disposition markers:

- `STAGE1_5_REMEDIATION_ACCEPTED`
- `STAGE1_5_COMPLETE`
- `READY_FOR_STAGE_2_RECONCILIATION`
- `STAGE2_NOT_AUTHORIZED`

Stage 1.5 findings (including F004, F005) retain their canonical disposition.
This document does not reinterpret them.

## 7. Stage 2 Wave record

Stage 2 — IELTS Completeness was delivered through the following ratified Wave sequence:

| Wave | Name | Scope | Status |
|---|---|---|---|
| W0 | IELTS Architecture & Track Routing | Product contracts, Academic vs General Training routing, blueprint schemas, storage foundations | CANONICALLY_CLOSED |
| W1 | Objective Question Kernel Completeness | Multiple Choice Multiple Answer, Option Pool Matching, Section 1/2 objective foundations | CANONICALLY_CLOSED |
| W2 | IELTS Listening Platform Completeness | 4-part audio player, 40 items, computer-delivered 2-min review, reload recovery | CANONICALLY_CLOSED |
| W3 | Reading Platform Completeness | 3-passage/section Academic & GT split-pane runner, 15 task families, 60-min timer | CANONICALLY_CLOSED |
| W4 | Productive Writing Platform | Academic Task 1 visuals, GT Task 1 letters, Task 2 essays, 4-criterion rubric practice evaluation | CANONICALLY_CLOSED |
| W5 | Interactive Speaking Platform | 3-part guided speaking runner, Web Audio recording/playback, prep/recording timers, rubric feedback | CANONICALLY_CLOSED |
| W6 | Mock Orchestration & Exit Gate | 4-tier practice hierarchy, 4-skill full mock orchestrator, section practice mode, Stage 2 exit verification | CANONICALLY_CLOSED |

Stage 2 Exit Gate Verification:
- Exit Gate: `IELTS_COMPLETENESS_V1`
- Programmatic Verification: 100% of 18 machine-checkable dimensions verified via `scripts/stage2-gate.mjs` (`npm run stage2:gate`).
- Final Status: `COMPLETE / CANONICALLY_CLOSED` at commit `4b15bedbf1513d0eb6f463d6792f65012bbaf085` (PR #148).

## 8. Relation to technical Phase 0–7 taxonomy

`docs/ROADMAP.md` remains the canonical source for:

- Phase 0–7 package IDs and dependency graph;
- technical architecture boundaries;
- cross-cutting packages (LI-00, SRC-00, ERR-00, QAR-00, EWF-00);
- portfolio umbrella groupings (U-LI, U-AI, U-PCS, U-4S, U-FD);
- Phase gate definitions and exit criteria.

`docs/ROADMAP.md` is NOT the top-level Master Product Roadmap. It is a
subordinate Level 2 Technical Package Taxonomy that serves the Master Roadmap.

**Phase numbering does NOT imply Stage numbering.** The following are distinct
and must not be confused:

| This Master Roadmap | Technical Package Taxonomy |
|---|---|
| Stage 1 — Core Foundation | Phase 0 through Phase 7 (technical packages) |
| Stage 2 — IELTS Completeness | *(no implicit Phase mapping)* |
| Stage 3 — Learning / Product Deep Research | *(no implicit Phase mapping)* |

Historical accepted package identities, evidence, architecture boundaries and
acceptance verdicts remain valid. This authority change does not retroactively
rewrite implementation history.

## 9. Authority boundaries

This document:

- **DOES** own the top-level product Stage sequence and current state;
- **DOES** define the Stage/Phase/Wave/Package taxonomy;
- **DOES NOT** authorize implementation of any Stage;
- **DOES NOT** own package-level acceptance criteria (that is `IMPLEMENTATION_PLAN.md`);
- **DOES NOT** own execution evidence (that is `IMPLEMENTATION_STATUS.md`);
- **DOES NOT** own architecture decisions (that is `DECISIONS.md`);
- **DOES NOT** own repository execution rules (that is `AGENTS.md`).

## 10. Change-control rule

Changes to this Master Roadmap require:

- Owner ratification for Stage identity, mission or ordering changes;
- an ADR in `docs/DECISIONS.md` documenting the change rationale;
- reconciliation of affected downstream documents;
- no implicit authorization of implementation from a roadmap change alone.

Adding, removing, reordering or redefining a Stage requires explicit Owner
approval. This document cannot be unilaterally modified by an implementer or
agent.
