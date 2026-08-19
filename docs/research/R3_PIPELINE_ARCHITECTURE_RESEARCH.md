# R3 Pipeline & Architecture Research Report
**Stage 3 Lane R3: Transcript / Learning Pipeline & Architecture Research**  
**OmniIELTS / VocabMaster Architecture Research Candidate**

- **Document Identifier**: `R3_PIPELINE_ARCHITECTURE_RESEARCH.md`
- **Transaction Identity**: `STAGE3-R3-PIPELINE-ARCHITECTURE-RESEARCH-001`
- **Controlling Authorization**: `docs/authorizations/STAGE3-RESEARCH-AUTH-001.md` §2.3 (`STAGE3-RESEARCH-AUTH-001`)
- **Controlling Strategy**: `docs/STAGE3_RESEARCH_STRATEGY.md` §3.3
- **Owner Constraints & Preferences**: `docs/research/STAGE3_RESEARCH_CONSTRAINTS.md`
- **Pedagogical Evidence Baseline**: Canonical `docs/research/R1_LEARNING_PRODUCT_RESEARCH.md` & `docs/research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md`
- **Capability Research Baseline**: Canonical `docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`
- **Input Research Requirements**: `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md`
- **Target Product Repository**: `NguyenDukKyeon/VocabMaster` (`d:\Workspace\EnlishMaster-W6`)
- **Report Date**: `2026-08-19`
- **Canonical Base SHA**: `79cb8ef9dfcbd4493c5191af5cd9845b85784a23`
- **Epistemic Standard**: Strict tripartite classification (`[VERIFIED]`, `[INFERENCE]`, `[UNKNOWN]`) with evidence ratings.
- **Authority Status**: **RESEARCH CANDIDATE ARTIFACT ONLY — STRICTLY READ-ONLY — ZERO REPOSITORY MUTATION AUTHORITY — ZERO IMPLEMENTATION AUTHORITY — ZERO DEPENDENCY ADOPTION AUTHORITY — ZERO FINAL PROVIDER SELECTION AUTHORITY**.

---

## 0. Document Identity & Authority Hierarchy

### 0.1 Authority Context & Canonical Governance
This research document is executed strictly within Stage 3 (Learning / Product Deep Research) under the canonical 6-tier repository authority hierarchy defined in `AGENTS.md` §3 and `docs/MASTER_ROADMAP.md`:

```
CANONICAL AUTHORITY HIERARCHY
1. docs/MASTER_ROADMAP.md        ── Master Product Roadmap (Stage 1–8)
2. docs/ROADMAP.md               ── Technical Package Taxonomy & Phase Dependencies (Phase 0–7)
3. docs/IMPLEMENTATION_PLAN.md   ── Package Specifications, Test Plans & Acceptance Criteria
4. docs/IMPLEMENTATION_STATUS.md ── Execution Ledger & Canonical Status Source of Truth
5. docs/DECISIONS.md             ── Architecture Decision Records (ADRs)
6. AGENTS.md                     ── Repository Router & Global Invariants
```

### 0.2 Non-Authority & Scope Invariants
> [!IMPORTANT]
> **Strict Non-Authority & Non-Absorption Invariants**:
> - **RESEARCH ONLY**: This artifact contains architectural analysis, current substrate reconstructions, transcript processing investigations, gap registers, and non-binding topology proposals.
> - **ZERO IMPLEMENTATION AUTHORITY**: This report does **NOT** grant authority to modify product source code (`src/**`), alter test suites (`tests/**`), change build scripts (`scripts/**`), or install/upgrade npm dependencies (`package.json`).
> - **ZERO PROVIDER / AI MODEL SELECTION**: Concrete AI model benchmarking, empirical prompt scoring, and final hosted cloud vendor selection belong exclusively to **Stage 5 (AI / Technology Deep Research & Benchmark)**.
> - **ZERO UX / IA DESIGN**: Wireframing, screen layout design, and navigation hierarchies belong exclusively to **Stage 4 (UX / IA Remake)**.
> - **ZERO CROSS-LANE SYNTHESIS**: Comprehensive cross-lane tradeoff reconciliation and Owner Decision compilation belong exclusively to **Lane R4 (`R4_CROSS_RESEARCH_RECONCILIATION.md`)**.
> - **INDEPENDENT AUDIT MANDATE**: The authoring agent cannot self-accept this document. A fresh independent audit is required.

---

## 1. Executive Findings

This research report establishes **24 substantive architectural findings** across the transcript acquisition, processing, linguistic derivation, execution, evidence, and persistence layers.

| Finding ID | Epistemic Status | Category | Summary Proposition |
|---|---|---|---|
| **R3-F001** | `[VERIFIED]` | Pipeline / Segmentation | Current `caption-normalizer.js` equates raw/merged caption cues directly to sentences; it lacks true linguistic Sentence Boundary Disambiguation (SBD), punctuation restoration, and truecasing. |
| **R3-F002** | `[VERIFIED]` | Ingestion / Timeline | `transcript-aggregate.js` enforces strict non-overlapping segment constraints (`TRANSCRIPT_TIMELINE_OVERLAP`); unaligned or overlapping cue streams from real-world ASR or live rolling captions cause hard errors unless pre-sanitized. |
| **R3-F003** | `[VERIFIED]` | Identity / Digest | Sentence and segment IDs are derived from cryptographic SHA-256 hashes of exact text and timestamps (`learningContractDigest`); any algorithmic re-segmentation or 1ms timestamp drift invalidates downstream target links. |
| **R3-F004** | `[VERIFIED]` | Execution / Streaming | Current transcript resolver operates via server-side polling / SSE job transitions (`queued` $\to$ `resolving` $\to$ `partial` $\to$ `complete`), but client-side learning derivation and workspace mounting are pseudo-streaming / batch-only. |
| **R3-F005** | `[VERIFIED]` | Persistence / Storage | Persistence is split across three IndexedDB databases: Core (`vocab-master-personal`, v5), IELTS (`vocab-master-ielts-v1`, v1), and V10 (`vocab-master-v10`, v7), coordinated by a shared Web Locks lease (`vocab-master-durable-storage-v1`). |
| **R3-F006** | `[VERIFIED]` | Durability / Backup | `backup-registry.js` enforces 100% store coverage across 34 IndexedDB stores and 11 external persistence surfaces; raw media files and model weights are classified as non-portable reconstructable cache. |
| **R3-F007** | `[VERIFIED]` | Evidence / Gateway | `EvidencePolicy` (`phase0-evidence-v1`) is the sole write gateway to FSRS scheduling; assisted attempts, transcript reveals, hints, and unverified evaluations are strictly default-denied from positive schedule progression. |
| **R3-F008** | `[VERIFIED]` | Concurrency / UI | Long video transcripts (e.g. >30 minutes, >2000 cues) execute regex tokenization, DOM rendering, and JSON cloning on the browser main thread, creating main-thread jank risks. |
| **R3-F009** | `[VERIFIED]` | Privacy / Secrets | API keys (e.g. Gemini) are confined to `sessionStorage` or server-side environment variables; `backup-registry.js` strictly excludes secrets (`exclude-secret`) from backup exports. |
| **R3-F010** | `[VERIFIED]` | Privacy / ASR | Local ASR is isolated to a desktop loopback companion process (`127.0.0.1`); mobile devices never advertise local companion and rely on public caption, private import rescue, or consented cloud fallback. |
| **R3-F011** | `[VERIFIED]` | Privacy / Consent | Cloud ASR fallback (Gemini) requires an explicit, versioned, replay-safe, and revocable consent receipt (`phase5-gemini-consent-v1`) stored in durable metadata before any external transmission. |
| **R3-F012** | `[VERIFIED]` | Audio / Manager | `audio-manager.js` wraps Web Speech API speech synthesis and Web Audio MediaRecorder with deterministic mock fallbacks for headless CI; it does not persist audio blobs in IndexedDB. |
| **R3-F013** | `[VERIFIED]` | Learner Model / FSRS | Memory scheduling is implemented via `ts-fsrs` (v5.4.1 / FSRS v6) with 5 skill dimensions (`recognition`, `recall`, `listening`, `collocation`, `production`), but latent mastery ($P(L)$) and IRT difficulty ($b$) are uncoupled. |
| **R3-F014** | `[VERIFIED]` | Learner Model / Weakness | `weakness-profile.js` implements deterministic projection from canonical review events and errors; it explicitly reports sample size, denominator, uncertainty, and insufficient-data states rather than guessing. |
| **R3-F015** | `[VERIFIED]` | Today / Orchestration | `today-runner.js` leases a single active run across browser tabs and requires immutable target re-validation (`ActivitySpec`) before execution, failing closed on stale or missing targets. |
| **R3-F016** | `[INFERENCE]` | Pipeline Architecture | Decoupling the monolithic transcript pipeline into distinct asynchronous stages (Acquisition $\to$ Normalization $\to$ SBD/Punctuation $\to$ Timestamp Alignment $\to$ Linguistic Enrichment $\to$ Synthesis) is necessary to support long-video streaming without UI freezing. |
| **R3-F017** | `[INFERENCE]` | Concurrency Boundary | CPU-intensive NLP (tokenization, POS extraction, PMI collocation calculation, Harper WASM grammar checking) should execute inside dedicated Web Workers rather than on the Main Thread. |
| **R3-F018** | `[INFERENCE]` | Sentence Identity | Stable sentence identity requires separating *Linguistic Identity* (canonical text normalized across punctuation/casing variants) from *Physical Alignment Lineage* (source media time offsets) to survive re-segmentation and minor transcript edits. |
| **R3-F019** | `[INFERENCE]` | Progressive Processing | Long media (>20 mins) requires a windowed / chunked pipeline where early sentence units are available for immediate practice while downstream media continues resolving in the background. |
| **R3-F020** | `[INFERENCE]` | Storage Evolution | Future consolidation of the three physical IndexedDB databases (Core, IELTS, V10) into a single unified logical schema must follow an additive forward-migration protocol per ADR-006 / ADR-008. |
| **R3-F021** | `[INFERENCE]` | Multi-Model Architecture | Coherent integration of FSRS (memory decay), BKT (latent skill mastery), IRT (item difficulty calibration), and CAT (adaptive routing) requires clear functional boundaries where each model owns its specific construct without scalar collision. |
| **R3-F022** | `[UNKNOWN]` | ASR Streaming Latency | The exact real-world latency, memory footprint, and thermal load of client-side WebAssembly ASR (e.g. Whisper WASM) vs Desktop Companion on low-end hardware remains unbenchmarked (routed to Stage 5). |
| **R3-F023** | `[UNKNOWN]` | Neural SBD Memory | The exact memory consumption and initialization overhead of learned browser-side neural SBD (e.g. `wtpsplit` ONNX) across mobile browsers remains unmeasured (routed to Stage 5). |
| **R3-F024** | `[UNKNOWN]` | Storage Quota Eviction | The exact browser-specific IndexedDB quota eviction rates for heavy audio recording caches under low disk space conditions require empirical cross-device measurement. |

---

## 2. Research Method & Epistemic Standards

### 2.1 Investigation Methodology
The research was conducted through systematic inspection of repository source code, tests, schemas, configuration files, and architectural decisions:
1. **Source Substrate Inspection**: Line-by-line static and data-flow audit across 94 source files in `src/` and 101 test suites in `tests/`.
2. **Contract & Schema Tracing**: Formal mapping of all TypeScript/JavaScript contract schemas (`learning-contracts.js`, `v10-contracts.js`, `resolver-contracts.js`, `content-contracts-v2.js`, `source-revision-ref.js`, `question-activity-contracts.js`).
3. **Runtime & Concurrency Analysis**: Audit of transaction boundaries, Web Locks locks, event loop execution, and structured cloning constraints.
4. **Pedagogical & Capability Reconciliation**: Mapping current technical boundaries against canonical R1 (`docs/research/R1_LEARNING_PRODUCT_RESEARCH.md`), R1 Supplement (`docs/research/R1_LEARNING_PRODUCT_RESEARCH_SUPPLEMENT_001.md`), and R2 (`docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`).

### 2.2 Epistemic Tripartite Schema
- `[VERIFIED]`: Directly proven by repository source code, passing test assertions, or official Web platform standards.
- `[INFERENCE]`: Logical deduction or architectural extrapolation derived from verified codebase facts.
- `[UNKNOWN]`: Empirical uncertainty or missing benchmark data requiring Stage 5 spiking or Owner decision.

---

## 3. Current Substrate Reconstruction

This section documents the actual state of the VocabMaster implementation across its core modules, recording paths, contracts, persistence boundaries, and failure behaviors.

```
CURRENT VOCABMASTER RUNTIME SUBSTRATE TOPOLOGY
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ MAIN THREAD (Browser UI & Runtime Controllers)                                          │
│ ┌──────────────────────────┐  ┌──────────────────────────┐  ┌─────────────────────────┐ │
│ │ Video Workspace (P3-00)  │  │ Today Runner (P1-08)     │  │ Capture Inbox (P0-06)   │ │
│ │ - YouTube IFrame Player  │  │ - Exact Target Leaser    │  │ - Quick Capture Form    │ │
│ │ - Virtual Transcript Rail│  │ - Session State Machine  │  │ - Candidate Ingestion   │ │
│ └────────────┬─────────────┘  └────────────┬─────────────┘  └────────────┬────────────┘ │
│              │                             │                             │              │
│ ┌────────────▼─────────────────────────────▼─────────────────────────────▼────────────┐ │
│ │ DOMAIN ENGINES & GATEWAYS                                                           │ │
│ │ ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────────────────┐ │ │
│ │ │ Caption Normalizer   │  │ Evidence Policy      │  │ Weakness Profile (P7-00)    │ │ │
│ │ │ - Cue Deduplication  │  │ - Default-Deny Gate  │  │ - Error Reducer             │ │ │
│ │ │ - Suffix Overlap     │  │ - Assistance Tracer  │  │ - Uncertainty Tracker       │ │ │
│ │ └──────────┬───────────┘  └──────────┬───────────┘  └──────────────┬──────────────┘ │ │
│ │            │                         │                             │                │ │
│ │ ┌──────────▼───────────┐  ┌──────────▼───────────┐  ┌──────────────▼──────────────┐ │ │
│ │ │ Transcript Aggregate │  │ FSRS Scheduler (v6)  │  │ Focus Selector (P7-00)      │ │ │
│ │ │ - Immutable Revision │  │ - 5-Skill Map        │  │ - Weakness Target Selector  │ │ │
│ │ └──────────────────────┘  └──────────────────────┘  └─────────────────────────────┘ │ │
│ └──────────────────────────────────────────┬──────────────────────────────────────────┘ │
│                                            │                                            │
│ ┌──────────────────────────────────────────▼──────────────────────────────────────────┐ │
│ │ DURABLE STORAGE COORDINATOR & REPOSITORIES                                          │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Web Locks Coordinator: 'vocab-master-durable-storage-v1'                        │ │ │
│ │ └───────────────────────────────────────┬─────────────────────────────────────────┘ │ │
│ │                                         │                                             │ │
│ │ ┌───────────────────────┐   ┌───────────▼───────────┐   ┌───────────────────────────┐ │ │
│ │ │ Core DB (v5)          │   │ IELTS DB (v1)         │   │ V10 DB (v7)               │ │ │
│ │ │ - cards, reviewEvents │   │ - errors, mockRuns    │   │ - sources, revisions      │ │ │
│ │ │ - learningEvents      │   │ - objectiveInventory  │   │ - segments, todayRuns     │ │ │
│ │ └───────────────────────┘   └───────────────────────┘   └───────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Component Master Ledger

#### `COMP-01`: Transcript Resolver (`P2-00`...`P2-06`, `P5-00`...`P5-05`)
- **Actual Paths**: `src/transcript-resolver-v2.js`, `src/resolver-contracts.js`, `src/resolver-job-repository.js`, `server/caption-resolver-v2.mjs`, `server/resolver-job-repository.mjs`.
- **Responsibility**: Resolve public YouTube captions via `yt-dlp`, manage asynchronous resolution jobs, provide fallbacks to desktop local ASR companion or consented Gemini API, and handle SRT/VTT imports.
- **Input**: `ResolverRequest` `{ source: { url, canonicalUrl, videoId }, language, namespace, fallback, requestedAt }`.
- **Output**: `ResolverJob` `{ id, status, eventSequence, coverage, artifact, revisionId, error }`.
- **State Ownership**: In-memory job state, filesystem JSON backend (`jobs.json`), and IndexedDB store `V10_STORES.resolverJobs`.
- **Sync/Async**: Asynchronous (HTTP polling / SSE streams).
- **Persistence Boundary**: `V10_STORES.resolverJobs` and filesystem artifact cache.
- **Failure Behavior**: Emits typed errors (`NO_CAPTION`, `YTDLP_UNAVAILABLE`, `RATE_LIMITED`, `TIMEOUT`, `CONSENT_REQUIRED`, `RIGHTS_INELIGIBLE`).
- **Downstream Consumers**: `src/video-workspace-v2.js`, `src/phase5-fallback-ui.js`.
- **Test Evidence**: `tests/caption-resolver-contracts.test.mjs`, `tests/caption-resolver-v2.test.mjs`, `tests/phase5-resolver-fallback.test.mjs`.
- **Known Limitations**: Polling overhead; lack of true streaming chunks on client; desktop-only companion constraint.

#### `COMP-02`: Caption Normalizer & Cue Merger
- **Actual Paths**: `src/caption-normalizer.js`.
- **Responsibility**: Sanitize raw caption cues, merge exact repeated cues within 800ms, reconcile rolling/live caption suffix overlaps within 1600ms, and generate sentence records with lineage digests.
- **Input**: `rawCues[]` `{ id, startMs, endMs, text, speaker, language }`.
- **Output**: `{ normalizerVersion, sentences[], coverage: { startMs, endMs, coveredMs, complete, gaps }, rawCueCount }`.
- **State Ownership**: Pure functional transformation (in-memory).
- **Sync/Async**: Synchronous.
- **Persistence Boundary**: None directly; consumed by `transcript-aggregate.js`.
- **Failure Behavior**: Filters out empty text and invalid zero/negative duration cues.
- **Downstream Consumers**: `src/transcript-aggregate.js`, `src/transcript-resolver-v2.js`.
- **Test Evidence**: `tests/caption-resolver-contracts.test.mjs:25`.
- **Known Limitations**: No linguistic sentence boundary detection; equates caption chunks to sentences; brittle SHA-256 sentence identity.

#### `COMP-03`: Canonical Transcript Aggregate
- **Actual Paths**: `src/transcript-aggregate.js`.
- **Responsibility**: Maintain canonical, immutable transcript sources, revisions, and segments; coordinate user edits via child revision compare-and-swap; enforce non-overlapping timeline invariants.
- **Input**: `CreateTranscriptAggregateInput` `{ source, segments, parentRevisionId, provenance, createdAt }`.
- **Output**: `TranscriptAggregate` `{ source: TranscriptSource, revision: TranscriptRevision, segments: CanonicalTranscriptSegment[] }`.
- **State Ownership**: IndexedDB stores: `V10_STORES.transcriptSources`, `transcriptRevisions`, `canonicalTranscriptSegments`.
- **Sync/Async**: Asynchronous (queued via `aggregateWriteQueue`).
- **Persistence Boundary**: Atomic transaction across the 3 V10 transcript stores.
- **Failure Behavior**: Throws `TRANSCRIPT_TIMELINE_OVERLAP` on cue overlap, `TRANSCRIPT_EDIT_CONFLICT` on stale base revisions, `TRANSCRIPT_REVISION_COLLISION` on digest mismatch.
- **Downstream Consumers**: `src/video-workspace-v2.js`, `src/sentence-learning-loop.js`.
- **Test Evidence**: `tests/transcript-aggregate.test.mjs`.
- **Known Limitations**: Strict non-overlap rule rejects valid speech cross-talk or unaligned ASR; full-revision read/write overhead.

#### `COMP-04`: Learning Contracts & Activity Model (`P1-00`...`P1-08`)
- **Actual Paths**: `src/learning-contracts.js`, `src/learning.js`.
- **Responsibility**: Define immutable contracts and factories for learning workflows: `ActivitySpec`, `Run`, `Attempt`, `Receipt`, `AssistanceTrace`, and `LearningTarget`.
- **Input / Output Contracts**:
  - `ActivitySpec`: `{ id, schemaVersion, type, target: LearningTarget, executor, plannedAt, timezone, metadata }`
  - `Run`: `{ id, schemaVersion, activitySpec, status, startedAt, completedAt, timezone, metadata }`
  - `Attempt`: `{ id, schemaVersion, runId, activityId, receiptId, target, occurredAt, result, learnerOutput, assistanceTrace, metadata }`
  - `Receipt`: `{ id, schemaVersion, runId, activityId, attemptId, status, issuedAt, timezone, metadata }`
- **State Ownership**: Pure immutable objects (frozen).
- **Sync/Async**: Synchronous factories.
- **Persistence Boundary**: Saved via `src/event-repository.js` into Core DB `learningEvents` and `learningProjections`.
- **Failure Behavior**: Throws typed contract validation errors on missing fields or structural invalidity.
- **Downstream Consumers**: `src/evidence-policy.js`, `src/today-runner.js`, `src/fsrs-scheduler.js`.
- **Test Evidence**: `tests/learning-contracts.test.mjs`.
- **Known Limitations**: Card-centric legacy assumptions; non-card target support added via additive V2 extensions.

#### `COMP-05`: Evidence Policy Gateway
- **Actual Paths**: `src/evidence-policy.js`.
- **Responsibility**: Evaluate completed attempts against strict verification criteria, determine FSRS schedule eligibility, and generate tamper-evident `EvidenceDecision` records.
- **Input**: `decideEvidence({ attempt, activity, verification })`.
- **Output**: `EvidenceDecision` `{ policyVersion, decisionId, receiptBinding, eligible, affectsSchedule, successful, reason, rating, skill, target }`.
- **State Ownership**: Stateless deterministic evaluator.
- **Sync/Async**: Synchronous.
- **Persistence Boundary**: Persisted into Core DB `reviewEvents` and `learningProjections`.
- **Failure Behavior**: Returns `eligible: false`, `affectsSchedule: false` with explicit failure reason codes (e.g. `assisted`, `coaching`, `unverifiedEvaluation`).
- **Downstream Consumers**: `src/persistence.js` (re-evaluates evidence inside IDB transaction), `src/fsrs-scheduler.js`.
- **Test Evidence**: `tests/evidence-policy.test.mjs`.
- **Known Limitations**: Binary eligibility (attempt is either 100% independent or 0% schedule effect); no partial credit.

#### `COMP-06`: FSRS Spaced Repetition Scheduler
- **Actual Paths**: `src/fsrs-scheduler.js`.
- **Responsibility**: Calculate next stability ($S$), difficulty ($D$), retrievability ($R$), and interval schedules across 5 skill tracks using `ts-fsrs` 5.4.1 (FSRS v6).
- **Input**: `scheduleCardReview(card, rating, now, skill)`.
- **Output**: `{ card: UpdatedCard, interval: { days, minutes, label }, log: ReviewLog }`.
- **State Ownership**: Card state in Core DB `cards` store.
- **Sync/Async**: Synchronous computation.
- **Persistence Boundary**: Core DB `cards` and `reviewEvents` stores.
- **Failure Behavior**: Clamps stability and difficulty bounds; falls back to default parameters.
- **Downstream Consumers**: `src/today-planner-v2.js`, `src/persistence.js`.
- **Test Evidence**: `tests/fsrs-scheduler.test.mjs`.
- **Known Limitations**: FSRS is memory-only; does not track latent construct mastery or task difficulty parameters.

#### `COMP-07`: Weakness Profile & Focus Selector (`P7-00`, `WKN-00`)
- **Actual Paths**: `src/weakness-profile.js`, `src/focus-selector.js`, `src/p7-00-metrics-reducer.js`.
- **Responsibility**: Aggregate canonical learning events and error records into deterministic `WeaknessProfile` projections; select daily high-priority remedial focus activities.
- **Input**: Canonical event references, error records, and timeframe parameters.
- **Output**: `WeaknessProfile` `{ schemaVersion, profileVersion, taxonomyVersion, projectorVersion, observations: { bySkill[] }, uncertainty, insufficientData, outputDigest }`.
- **State Ownership**: Derived projection; cached in V10 metadata.
- **Sync/Async**: Synchronous calculation from query inputs.
- **Persistence Boundary**: V10 metadata / Today plan binding.
- **Failure Behavior**: Returns `insufficientData: true` and explicit reason codes (`NO_QUALIFIED_EVIDENCE`, `SINGLE_QUALIFIED_SAMPLE`) if observations are sparse.
- **Downstream Consumers**: `src/today-planner-v2.js`, `src/listening-value-slice.js`.
- **Test Evidence**: `tests/wave4-ielts-profile-inventory.test.mjs`, `tests/wave6-focus-today.test.mjs`.
- **Known Limitations**: Requires minimum sample sizes before activating; historical metrics reducer requires batch event scanning.

#### `COMP-08`: Backup Registry & Multi-DB Restore Coordinator
- **Actual Paths**: `src/backup-registry.js`, `src/persistence-core.js`, `src/storage-lock.js`, `src/storage-safety.js`.
- **Responsibility**: Enforce 100% store coverage across all 3 IndexedDB databases; serialize canonical backup payloads; coordinate multi-database restore with journal staging and verification.
- **Input**: Multi-store database states or imported JSON backup envelopes.
- **Output**: Canonical full backup JSON (schema v6) or validated restoration state.
- **State Ownership**: Coordinates Core DB, IELTS DB, and V10 DB; holds Web Locks lease `vocab-master-durable-storage-v1`.
- **Sync/Async**: Asynchronous.
- **Persistence Boundary**: Cross-database staging journal in Core DB `meta` store (`phase0RestoreJournal`).
- **Failure Behavior**: Fails closed if any physical store is unregistered, if payload exceeds 100MB, or if digests mismatch.
- **Downstream Consumers**: `src/settings-ui.js`, PWA export/import controllers.
- **Test Evidence**: `tests/backup-registry.test.mjs`, `tests/restore-safety.test.mjs`, `tests/degraded-backup.test.mjs`.
- **Known Limitations**: Multi-database restore is non-atomic at the IndexedDB engine level (requires software two-phase journal commit).

---

## 4. End-to-End Pipeline Trace

The table below traces the current end-to-end data flow from raw media acquisition through learning synthesis, execution, evidence evaluation, and recovery.

```
END-TO-END DATA FLOW TRACE
[1. Media Source] ──> [2. Resolver/Companion] ──> [3. Raw Cues] ──> [4. Normalizer]
                                                                          │
[8. ActivitySpec] <── [7. Content Factory] <── [6. Linguistic Segments] <─┘
       │
       ▼
[9. Today Runner] ──> [10. Learner Attempt] ──> [11. EvidencePolicy]
                                                        │
[14. FSRS / Weakness] <── [13. Persistence] <── [12. EvidenceDecision]
       │
       ▼
[15. Next Study Session]
```

| Step # | Pipeline Transition | Current Implementation File | Input Entity | Output Entity | Status Classification | Key Observations & Bottlenecks |
|---|---|---|---|---|---|---|
| 1 | Source Media $\to$ Acquisition | `src/transcript-resolver-v2.js`, `server/caption-resolver-v2.mjs` | Media URL / YouTube ID | Subtitle Track / ASR Stream | `IMPLEMENTED` | Robust `yt-dlp` integration with local ASR fallback; requires network or loopback companion. |
| 2 | Acquisition $\to$ Raw Timed Segments | `server/caption-resolver-v2.mjs`, `src/transcript-import.js` | VTT/SRT Text / ASR Chunks | `RawCue[]` | `IMPLEMENTED` | Parses WebVTT/SRT cues; rejects malformed cues; converts time strings to millisecond integers. |
| 3 | Raw Segments $\to$ Normalization | `src/caption-normalizer.js` | `RawCue[]` | Cleaned Cues | `IMPLEMENTED` | Strips HTML/entities; merges 800ms exact duplicates and 1600ms suffix rolling overlaps. |
| 4 | Normalization $\to$ Punctuation/Truecasing | *None* (Placeholder heuristics only) | Cleaned Cues | Punctuated Stream | `MISSING` | No dedicated truecaser or punctuation restoration engine; unpunctuated ASR remains lower-case stream. |
| 5 | Punctuation $\to$ Sentence Boundary Detection | `src/caption-normalizer.js` (Naïve) | Cleaned Cues | `SentenceUnit[]` | `FRAGILE` | Treats merged cue chunks as sentences; no linguistic SBD or abbreviation disambiguation. |
| 6 | SBD $\to$ Timestamp-Preserving Sentences | `src/caption-normalizer.js`, `src/transcript-aggregate.js` | `SentenceUnit[]` | `CanonicalTranscriptSegment[]` | `PARTIAL` | Preserves bounding start/end milliseconds; lacks word-level timestamp projection when splitting sentences. |
| 7 | Sentences $\to$ Semantic / Topic Segmentation | *None* | `CanonicalTranscriptSegment[]` | Topic Sections | `MISSING` | Transcripts are flat segment lists; no TextTiling, heading generation, or semantic chunking. |
| 8 | Segments $\to$ Linguistic Enrichment | `src/lexical-core-v2.js` | Text Segments | POS / Collocations / CEFR | `PARTIAL` | Rule-based lexical extraction; lacks dependency parsing and validated CEFR band calibration. |
| 9 | Enrichment $\to$ Vocab/Grammar Derivation | `src/ai-content-factory.js`, `src/sentence-learning-loop.js` | Enriched Segments | Learning Targets | `PARTIAL` | Extracts cloze words and distractors; distractor plausibility ranking is basic. |
| 10 | Targets $\to$ Activity Synthesis | `src/question-activity-contracts.js`, `src/today-planner-v2.js` | Learning Targets | `ActivitySpec` | `IMPLEMENTED` | Formats typed activity specifications (`listening`, `dictation`, `reading`, `matching`). |
| 11 | `ActivitySpec` $\to$ Runtime Execution (`Run`) | `src/today-runner.js`, `src/video-workspace-v2.js` | `ActivitySpec` | Active UI Session | `IMPLEMENTED` | Tab-safe execution lease; mounts player and interactive exercise controls. |
| 12 | UI Execution $\to$ Learner `Attempt` | `src/learning-contracts.js`, `src/sentence-learning-loop.js` | User Input / Speech | `Attempt` + `AssistanceTrace` | `IMPLEMENTED` | Records raw learner response, response latency, and complete assistance trace. |
| 13 | `Attempt` $\to$ `Receipt` & `EvidenceDecision` | `src/evidence-policy.js` | `Attempt` + `Verification` | `EvidenceDecision` | `IMPLEMENTED` | Strict default-deny gateway; prevents assisted or coaching attempts from writing FSRS. |
| 14 | `EvidenceDecision` $\to$ Learner State Update | `src/fsrs-scheduler.js`, `src/weakness-profile.js` | `EvidenceDecision` | FSRS Card & Weakness Profile | `IMPLEMENTED` | Updates FSRS stability/difficulty; records mistake occurrences in Error Repository. |
| 15 | Learner State $\to$ Review / Next Task | `src/today-planner-v2.js`, `src/focus-selector.js` | Due Cards & Weakness Profile | Tomorrow / Due Plan | `IMPLEMENTED` | Composes daily review queue and targeted diagnostic/remedial focus activity. |
| 16 | Event Sched $\to$ Persistence | `src/persistence.js`, `src/event-repository.js` | Learning Envelopes | IndexedDB Stores | `IMPLEMENTED` | Persists immutable learning events, projections, and card mutations under Web Locks. |
| 17 | Persistence $\to$ Recovery & Backup | `src/backup-registry.js`, `src/migration-ledger.js` | Multi-DB State | Portable Backup & Restore | `IMPLEMENTED` | 100% store registry coverage; forward-only migrations; two-phase restore recovery. |

---

## 5. Transcript Sentence Segmentation Deep Dive

A central mandate of Lane R3 is solving the transcript-to-sentence transformation problem: **How should VocabMaster transform raw YouTube caption and ASR streams into stable, linguistically meaningful sentences while preserving microsecond timing accuracy?**

### 5.1 Input Stream Typology & Characteristics

```
TRANSCRIPT INPUT STREAM TYPOLOGY
├── Type A: Manually Authored YouTube Subtitles (.vtt / .srt)
│   └── High punctuation quality, reliable capitalization, human-curated line breaks.
├── Type B: YouTube Automatic Speech Recognition (ASR)
│   └── Rolling/fragmented cues, missing sentence-final punctuation, uncapitalized or all-caps.
├── Type C: Local ASR Companion Output (Whisper / Faster-Whisper)
│   └── Word-level timestamps available, variable punctuation, hallucination risk on silence.
├── Type D: User-Imported Plain Text Documents (.txt)
│   └── High semantic punctuation, zero native timestamps (requires synthetic alignment).
└── Type E: PDF / Article Text (Readability / OCR)
    └── Complex multi-column layout, hyphenation breaks, header/footer noise.
```

### 5.2 Comprehensive Failure Modes & Boundary Hazards

1. **Punctuation Absence**: Raw ASR streams often arrive completely devoid of punctuation (e.g. `we are going to examine the fundamental principles of economics and then we will look at market structures`). Simple regex sentence splitting fails completely.
2. **Abbreviation False Positives**: Naïve period splitting breaks on honorifics (`Dr. Smith`, `Mr. Brown`), academic degrees (`Ph.D.`, `B.Sc.`), Latin abbreviations (`e.g.`, `i.e.`, `etc.`), and geographical names (`U.S.A.`, `U.K.`).
3. **Numeric & Alphanumeric Collisions**: Periods occurring inside decimal numbers (`3.14159`, `$19.99`), software version numbers (`v10.0.0`), and URLs (`vocabmaster.org`) must not trigger sentence splits.
4. **Discourse Fillers & False Starts**: Spoken language contains hesitations, false starts, and filler phrases (`um`, `uh`, `you know`, `like, I mean`) that disrupt syntactic tree parsers.
5. **Rolling Caption Redundancy**: YouTube live/rolling captions emit overlapping word windows (e.g. Chunk 1: `the quick brown`, Chunk 2: `brown fox jumps`, Chunk 3: `fox jumps over`). If not deduplicated, duplicate phrases corrupt the transcript.
6. **Sentence Crossing Caption Chunks**: In natural speech, a single 15-word grammatical sentence typically spans across 3 to 5 separate subtitle chunks.
7. **Timestamp Drift & Word Alignment Gaps**: When merging multiple chunks into a sentence or splitting a multi-sentence chunk, interpolating word start/end times linearly introduces audio-sync drift during speech playback.

### 5.3 Required Semantic Contract: `SentenceUnit`
The conceptual contract for a segmented sentence must represent both linguistic content and timing provenance:

```typescript
interface SentenceUnit {
  // 1. Stable Identity
  id: string;                      // Stable semantic identity
  lineageId: string;               // Physical alignment lineage
  
  // 2. Text Representation
  text: string;                    // Normalized display text with restored punctuation & truecasing
  rawText: string;                 // Original unedited text as received from source
  canonicalLexicalKey: string;     // Punctuation-agnostic, lowercased NFKC key for matching
  
  // 3. Timing & Provenance
  startMs: number;                 // Inclusive start timestamp in milliseconds
  endMs: number;                   // Inclusive end timestamp in milliseconds
  timingProvenance: 'EXACT' | 'DERIVED' | 'INTERPOLATED' | 'SYNTHETIC';
  
  // 4. Source Traceability
  sourceCueIds: string[];          // List of raw cue IDs contributing to this sentence
  wordTimestamps?: Array<{        // Optional fine-grained word alignments
    word: string;
    startMs: number;
    endMs: number;
    confidence: number | null;
  }>;
  
  // 5. Linguistic Metadata
  speaker: string | null;          // Speaker identifier where available
  language: string;                // BCP-47 language tag (e.g. 'en-US')
  confidence: number | null;       // Segmentation/ASR confidence score [0.0 - 1.0]
}
```

### 5.4 Seven-Stage Transcript Processing Pipeline
To eliminate current architectural bottlenecks, the transcript processing pipeline should be decomposed into seven distinct stages:

```
PROPOSED SEVEN-STAGE TRANSCRIPT PROCESSING PIPELINE
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: RAW TIMED CHUNK INGESTION                                                       │
│ └── Ingest raw VTT/SRT cues, ASR streaming packets, or plain text buffers.               │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 2: ROLLING-CAPTION RECONCILIATION & DEDUPLICATION                                  │
│ └── Suffix-overlap matching, exact duplicate suppression, monotonic timestamp sorting.   │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 3: LEXICAL NORMALIZATION & ENTITY ESCAPING                                         │
│ └── HTML entity stripping, Unicode NFKC normalization, whitespace compression.           │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 4: PUNCTUATION RESTORATION & TRUECASING                                            │
│ └── Restore commas, periods, question marks, and capitalization on raw ASR text.         │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 5: SENTENCE BOUNDARY DISAMBIGUATION (SBD)                                          │
│ └── Linguistic sentence boundary detection with abbreviation & numerical protection.     │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 6: TIMESTAMP PROJECTION & WORD ALIGNMENT                                           │
│ └── Project chunk/word timestamps onto segmented sentences; mark timing provenance.      │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ STAGE 7: SEMANTIC & TOPIC GROUPING                                                       │
│ └── Paragraph assembly, TextTiling topic boundary detection, section heading derivation. │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Timestamp Preservation & Provenance Taxonomy
When projecting timestamps from raw chunks onto segmented sentences, the timing provenance must be explicitly recorded:

1. **`EXACT` Timing**: The sentence boundaries align 1:1 with authored subtitle cue start and end timestamps.
2. **`DERIVED` Timing**: The sentence spans multiple sequential cues; start timestamp is taken from the first cue's `startMs` and end timestamp from the final cue's `endMs`.
3. **`INTERPOLATED` Timing**: A single subtitle cue contains multiple sentences; sub-sentence timestamps are calculated from word-count character ratios or forced-alignment word boundaries.
4. **`SYNTHETIC` Timing**: Imported plain text without audio sync; timestamps are synthetically generated for UI layout purposes (e.g. fixed 4-second blocks) and marked `aligned: false`.

### 5.6 Stable Sentence Identity Across Re-segmentation & Edits
A major defect in the current substrate (`COMP-02`) is that sentence IDs are generated from `SHA-256(sourceId + startMs + endMs + text)`. A 1ms timing adjustment or typo correction completely changes the sentence ID, breaking learner review history and error links.

**Architectural Recommendation**:
- Separate **Physical Alignment Key** (`lineageId: sourceId + startMs + endMs`) from **Semantic Identity** (`semanticSentenceId: sourceId + canonicalLexicalKey`).
- Maintain an immutable **Sentence Revision Ledger** that maps legacy sentence IDs to updated revisions when transcript text is edited or re-segmented.

---

## 6. R2 Capability Architecture Reconciliation

Canonical Lane R2 (`docs/research/R2_OSS_HOSTED_CAPABILITY_RESEARCH.md`) surveyed open-source libraries and hosted APIs across 18 capability domains. In this section, we evaluate the **architectural compatibility** of these candidate families with the VocabMaster client-side architecture.

```
R2 CANDIDATE ARCHITECTURAL CLASSIFICATION MATRIX
┌───────────────────────────┬──────────────────────────────────────────────────────────────┐
│ Classification            │ Evaluated Candidates / Classes                               │
├───────────────────────────┼──────────────────────────────────────────────────────────────┤
│ ARCHITECTURALLY_          │ MiniSearch (BM25 search), OramaJS (hybrid search),           │
│ COMPATIBLE                │ Fast XML Parser, Mozilla Readability, uPlot, Chart.js,       │
│                           │ ts-fsrs (FSRS v6), Open English WordNet Data, Sigma.js       │
├───────────────────────────┼──────────────────────────────────────────────────────────────┤
│ CONDITIONALLY_            │ Harper WASM (grammar in worker), EdgeParse WASM (PDF in      │
│ COMPATIBLE                │ worker), Groq API (serverless proxy / CORS), Gemini API      │
│                           │ (explicit consent required), Web Audio Energy VAD            │
├───────────────────────────┼──────────────────────────────────────────────────────────────┤
│ NEEDS_STAGE5_SPIKE        │ SaT / wtpsplit (neural SBD), HyperSeg (topic segmentation),  │
│                           │ WhisperX (forced alignment), pyBKT, catsim, pyKT             │
├───────────────────────────┼──────────────────────────────────────────────────────────────┤
│ ARCHITECTURALLY_POOR_FIT  │ Heavy ONNX LLMs in browser, multi-GB client Whisper models, │
│                           │ LanguageTool public API (terms/rate limit conflicts)         │
├───────────────────────────┼──────────────────────────────────────────────────────────────┤
│ NOT_RELEVANT              │ Server-side Python frameworks (Django, Celery),              │
│                           │ Proprietary desktop-only OCR engines                         │
└───────────────────────────┴──────────────────────────────────────────────────────────────┘
```

### Detailed Reconciliation by Domain

#### Domain 1 & 2: Sentence Segmentation & Punctuation Restoration
- **Candidates**: Native Cue Normalizer (`BUILD`), `compromise` / regex (`BUILD`), `wtpsplit` / SaT (`OSS-034`), Hosted LLM Fallback (Groq / Gemini).
- **Architectural Reconciliation**:
  - *Tier 1 (Client Deterministic)*: Rule-based SBD using protected abbreviation trie + regex is `ARCHITECTURALLY_COMPATIBLE` for fast main-thread / worker execution.
  - *Tier 2 (Client Neural)*: `wtpsplit` ONNX is `NEEDS_STAGE5_SPIKE` to evaluate WASM runtime memory and mobile startup latency.
  - *Tier 3 (Hosted Fallback)*: Server-side LLM punctuation restoration is `CONDITIONALLY_COMPATIBLE` under user consent and network availability.

#### Domain 3 & 9: Timestamp Alignment & ASR
- **Candidates**: Native Aggregate Substrate (`BUILD`), Web Audio Energy VAD, `@ricky0123/vad-web`, WhisperX (`OSS-041`), Desktop Companion Local ASR.
- **Architectural Reconciliation**:
  - Native chunk-level timestamp assembly is `ARCHITECTURALLY_COMPATIBLE`.
  - Client-side energy VAD is `ARCHITECTURALLY_COMPATIBLE` for microphone speech gating in Web Audio.
  - WhisperX phoneme forced alignment is `NEEDS_STAGE5_SPIKE` as an offline server/companion tool; too heavy for direct browser client.

#### Domain 4: Semantic & Topic Segmentation
- **Candidates**: Pure-JS TextTiling (`OSS-007`), HyperSeg (`OSS-035`), Hosted LLM chunker.
- **Architectural Reconciliation**:
  - Pure-JS TextTiling (lexical cohesion block comparison) is `ARCHITECTURALLY_COMPATIBLE` for worker execution.
  - HyperSeg hyperdimensional vector segmentation is `NEEDS_STAGE5_SPIKE`.

#### Domain 5 & 6: Vocabulary Extraction & CEFR Readability
- **Candidates**: Native Multi-Formula Suite (Flesch-Kincaid, Dale-Chall, Coleman-Liau), CEFR-J Lexical Trie (`OSS-011`), Pointwise Mutual Information (PMI) collocation engine.
- **Architectural Reconciliation**:
  - Lexical Trie lookup and readability formula calculation are `ARCHITECTURALLY_COMPATIBLE` (zero dependencies, sub-millisecond execution).
  - N-gram statistical PMI collocation calculation is `ARCHITECTURALLY_COMPATIBLE` when executed in a background worker.

#### Domain 7: Grammar & Syntax Tooling
- **Candidates**: Harper WASM Engine (`OSS-036`), ERRANT Taxonomy (`OSS-037`), Client Regex Rules.
- **Architectural Reconciliation**:
  - Harper WASM is `CONDITIONALLY_COMPATIBLE` (must run in dedicated Web Worker to avoid blocking UI during large text linting).
  - ERRANT 55-category error taxonomy is `ARCHITECTURALLY_COMPATIBLE` as a structured classification reference schema for `error-repository.js`.

#### Domain 10: Multi-Format Ingestion
- **Candidates**: EdgeParse WASM (`OSS-042`), `pdfjs-dist`, Fast XML Parser (`OSS-033`), `@mozilla/readability`, `tesseract.js`.
- **Architectural Reconciliation**:
  - Subtitle parsers (SRT/VTT) and Fast XML Parser are `ARCHITECTURALLY_COMPATIBLE`.
  - Mozilla Readability (HTML extraction) and PDF.js are `ARCHITECTURALLY_COMPATIBLE` when sandboxed in Web Workers.

#### Domain 11: Client Search & Indexing
- **Candidates**: `minisearch` (BM25), OramaJS (`OSS-043`).
- **Architectural Reconciliation**:
  - In-memory BM25 lexical indexing (`minisearch`) and unified hybrid search (`OramaJS`) are `ARCHITECTURALLY_COMPATIBLE` for local-first catalog and transcript search.

#### Domain 12, 13, 14, 15: Visualizations & Dashboards
- **Candidates**: Native Pure SVG components (`NATIVE-007`, `NATIVE-008`, `NATIVE-009`), `uplot`, `chart.js`.
- **Architectural Reconciliation**:
  - Pure SVG micro-charts, 84-day activity heatmap grid, and 5-axis radar charts are `ARCHITECTURALLY_COMPATIBLE` (zero external dependencies, zero canvas memory leaks).
  - `uplot` is `ARCHITECTURALLY_COMPATIBLE` for high-frequency time-series data.

#### Domain 16: Knowledge Graphs & Lexical Networks
- **Candidates**: `force-graph` Canvas (`OSS-028`), Sigma.js WebGL (`OSS-044`), Open English WordNet (`DATA-001`).
- **Architectural Reconciliation**:
  - Open English WordNet relational dataset is `ARCHITECTURALLY_COMPATIBLE` when stored in IndexedDB.
  - Sigma.js (WebGL rendering) is `ARCHITECTURALLY_COMPATIBLE` for rendering large lexical synset networks at 60fps.

#### Domain 18: Adaptive-Learning Machinery
- **Candidates**: `ts-fsrs` 5.4.1 (Native), pyBKT (`OSS-045`), catsim (`OSS-046`), pyKT (`OSS-047`).
- **Architectural Reconciliation**:
  - `ts-fsrs` is `ARCHITECTURALLY_COMPATIBLE` (active in production).
  - Lightweight JavaScript ports of Bayesian Knowledge Tracing ($P(L_t)$ update rules) and Fisher Information CAT item selection are `ARCHITECTURALLY_COMPATIBLE` for client-side adaptive gating. Heavy Python packages remain `REFERENCE_ONLY`.

---

## 7. Streaming & Progressive Pipeline Architecture

### 7.1 Current Substrate vs True Streaming Evaluation
The current VocabMaster substrate exhibits **mixed pseudo-streaming and batch behaviors**:

```
CURRENT SUBSTRATE STREAMING AUDIT
┌───────────────────────────────────────────────┬──────────────────────────────────────────┐
│ Component Area                                │ Actual Execution Mode                    │
├───────────────────────────────────────────────┼──────────────────────────────────────────┤
│ YouTube Caption Acquisition (P2-06)           │ Pseudo-Streaming (Server chunk-range job)│
│ Local ASR Companion Processing (P5-02)        │ Incremental Batches (30s range chunks)   │
│ Client Normalization & Aggregate (P1-04)      │ Batch-Only (Full array transform)        │
│ Video Workspace Virtual Rail (P3-00)          │ Windowed Rendering (Virtual scroll DOM)  │
│ Learning Activity Derivation (P6-00)          │ Batch-Only (Pre-synthesized session)     │
│ Evidence & Persistence Commit (P0-02)         │ Discrete Event Batch (IndexedDB tx)      │
└───────────────────────────────────────────────┴──────────────────────────────────────────┘
```

### 7.2 Progressive Processing Invariants for Long Media
When handling media from 10 minutes to 4 hours in length, the architecture must support:
1. **Incremental Availability**: Sentence units resolved in the first 60 seconds of video must be immediately playable and studyable in the Video Workspace without waiting for the full 2-hour file to finish processing.
2. **Deterministic Cancellation & Abort**: Navigating away or clicking "Cancel" must immediately abort active background fetch streams, terminate worker tasks, and release storage locks.
3. **Seek-Driven Prioritization**: If a learner scrubs the video player to minute 45:00 while processing is at minute 10:00, the pipeline must prioritize resolving the caption window around the active seek timestamp.
4. **Stale Async Discarding**: Out-of-order completion packets or responses from previously abandoned video resolution jobs must be rejected using monotonic fencing tokens (`lease.fencingToken`).

---

## 8. Performance, Memory & Concurrency Boundaries

### 8.1 Complexity Scaling Analysis

| Media Duration | Raw Cue Count | Token Count | Main-Thread JSON Size | CPU Tokenization Latency | IndexedDB Write Overhead |
|---|---|---|---|---|---|
| **10 minutes** | ~150–300 | ~1,500–2,500 | ~40 KB | < 5 ms | < 15 ms |
| **30 minutes** | ~500–1,000 | ~4,500–7,500 | ~150 KB | ~15–30 ms | ~40 ms |
| **60 minutes** | ~1,000–2,200 | ~9,000–16,000 | ~350 KB | ~50–120 ms | ~90 ms |
| **120+ minutes**| ~2,500–6,000 | ~25,000–50,000| ~1.2 MB | ~200–500 ms (Jank risk) | ~250 ms |

### 8.2 Execution Runtime Boundaries

```
PROPOSED RUNTIME EXECUTION BOUNDARIES
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ MAIN THREAD (UI & Interaction Only)                                                      │
│ └── DOM rendering, Web Audio playback, user gesture handling, lightweight state dispatch. │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ DEDICATED WEB WORKER 1: Transcript & Ingestion Pipeline                                  │
│ └── SBD, punctuation restoration, rolling caption deduplication, timestamp alignment.    │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ DEDICATED WEB WORKER 2: NLP & Linguistic Enrichment                                      │
│ └── Lexical extraction, POS tagging, PMI collocations, CEFR scoring, Harper grammar lint. │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ SERVICE WORKER: Cache & Asset Management                                                 │
│ └── PWA offline shell caching, CacheStorage pack asset downloads, Web Push reminders.    │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ LOCAL COMPANION PROCESS (Desktop Loopback 127.0.0.1)                                     │
│ └── Heavy Whisper ASR, local PyBKT/pyKT simulation, offline yt-dlp binary execution.     │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ OPTIONAL SERVERLESS EDGE PROXY (Opt-in Hosted Services)                                  │
│ └── Groq/Gemini API key isolation, CORS proxying, rate limit coordination.               │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Persistence, Data Model & Storage Lifecycle

### 9.1 Multi-Database Schema & Store Inventory

```
VOCABMASTER INDEXEDDB TRIPLE-DATABASE TOPOLOGY
┌───────────────────────────────────┬───────────────────────────────────┬───────────────────────────────────┐
│ CORE DATABASE                     │ IELTS DATABASE                    │ V10 DATABASE                      │
│ Name: 'vocab-master-personal'     │ Name: 'vocab-master-ielts-v1'     │ Name: 'vocab-master-v10'          │
│ Version: 5                        │ Version: 1                        │ Version: 7                        │
├───────────────────────────────────┼───────────────────────────────────┼───────────────────────────────────┤
│ STORES:                           │ STORES:                           │ STORES:                           │
│ - cards (keyPath: 'id')           │ - errors                          │ - transcriptSources               │
│ - settings (keyPath: 'key')       │ - mediaSources                    │ - transcriptRevisions             │
│ - reviewEvents (keyPath: 'id')    │ - transcriptionJobs               │ - canonicalTranscriptSegments     │
│ - snapshots (keyPath: 'id')       │ - mediaProgress                   │ - collectionMemberships           │
│ - meta (keyPath: 'key')           │ - notes                           │ - lexicalTombstones               │
│ - fileHandles (keyPath: 'key')    │ - practiceSessions                │ - transcriptCache                 │
│ - outbox (keyPath: 'id')          │ - mockTests                       │ - contentProgress                 │
│ - captureDrafts (keyPath: 'id')   │ - mockRuns                        │ - installedPacks                  │
│ - learningEvents (keyPath: 'id')  │ - objectiveInventory              │ - todayRuns                       │
│ - learningProjections (id)        │ - objectiveSpatialTerminals       │ - repairQueue                     │
│ - learningDeadLetters (id)        │ - settings (keyPath: 'key')       │ - resolverJobs                    │
│                                   │                                   │ - contentAssets                   │
│                                   │                                   │ - coachingStats                   │
│                                   │                                   │ - meta (keyPath: 'key')           │
└───────────────────────────────────┴───────────────────────────────────┴───────────────────────────────────┘
```

### 9.2 Data Classification Taxonomy
To prevent backup bloating and guarantee data safety, data entities are classified into five strict tiers:

```
DATA CLASSIFICATION TIERS
├── TIER 1: CANONICAL SOURCE DATA (User-Irreplaceable)
│   └── User cards, personal notes, Quick Capture drafts, user transcript edits.
│   └── Policy: 100% durable backup; zero automatic pruning; forward-only schema migrations.
├── TIER 2: CANONICAL EVIDENCE & ATTEMPTS
│   └── Append-only learningEvents, reviewEvents, error occurrences, consent receipts.
│   └── Policy: 100% durable backup; immutable records; tamper-evident digests.
├── TIER 3: DERIVED RECOMPUTABLE DATA
│   └── WeaknessProfile projections, Today daily plans, coaching statistics, search indexes.
│   └── Policy: Reconstructed on-the-fly from Tier 1/2; excluded from backup payloads.
├── TIER 4: RECONSTRUCTABLE CACHE
│   └── Downloaded content pack binaries, published catalog descriptors, provider transcript stubs.
│   └── Policy: Stored in CacheStorage; backed up as lightweight reconstruction stubs/digests.
└── TIER 5: EPHEMERAL STATE
    └── UI focus state, active video player timestamps, session API keys, audio recording chunks.
    └── Policy: In-memory only; never written to durable backup.
```

---

## 10. Privacy, Security & Data Sovereignty

### 10.1 Local-First Invariants
VocabMaster enforces a strict **Local-First Data Stance**:
- **Learner PII Isolation**: User notes, study schedules, error histories, and speech recordings remain exclusively on the user's local device in IndexedDB.
- **Zero Background Telemetry**: No user telemetry, study habits, or learning logs are transmitted to external analytics servers.

### 10.2 API Credential Handling & Secret Protection
- **No Client Build Secrets**: No private API keys or signing secrets are bundled into client production assets (`dist/`).
- **Session-Only Key Storage**: User-provided API keys (e.g. Gemini API key) are stored strictly in `sessionStorage` (`vocab-master-gemini-key`) or memory, never written to IndexedDB, and explicitly filtered out of backups by `backup-registry.js` (`exclude-secret`).
- **Public Key Cryptography**: Remote content pack verification uses bundled public verification roots; private authoring keys reside only in isolated publishing build environments (per ADR-041).

### 10.3 Versioned Consent Lifecycle
All external cloud service interactions (e.g. Gemini ASR fallback) require an explicit, versioned, and revocable consent receipt (`phase5-gemini-consent-v1`) that captures:
- Explicit consent decision (`accepted` vs `declined`);
- Data transfer and provider retention acknowledgment;
- Maximum billable request limits and cost constraints;
- Tamper-evident receipt ID derived from payload digest (`expectedCloudConsentReceiptId`).

---

## 11. Comprehensive Failure & Recovery Matrix

| Failure ID | Trigger / Condition | Current Codebase Behavior | Data Loss Risk | Recoverability | Retry Safe | Recommended Architectural Property |
|---|---|---|---|---|---|---|
| **F-01** | Caption unavailable for video | Throws `NO_CAPTION`; offers Local ASR / Gemini / Import | None | `RECOVERABLE` | Yes | Graceful provider cascade with manual SRT/VTT import rescue. |
| **F-02** | Caption stream malformed / overlapping | Throws `TRANSCRIPT_TIMELINE_OVERLAP` | None | `RECOVERABLE` | Yes | Pre-sanitization pipeline stage to resolve overlaps before aggregate commit. |
| **F-03** | Local ASR companion offline | Displays companion unavailable status; offers Gemini/Import | None | `RECOVERABLE` | Yes | Health check polling with automatic capability downgrade. |
| **F-04** | Cloud API timeout / 429 rate limit | Emits `TIMEOUT` or `RATE_LIMITED` error; sets retryable | None | `RECOVERABLE` | Yes | Exponential backoff with maximum 1 billable retry cap. |
| **F-05** | Network disconnection mid-study | UI remains fully operational offline; logs queued in outbox | None | `RECOVERABLE` | Yes | Offline-first PWA caching; outbox sync on reconnect. |
| **F-06** | IndexedDB storage quota exceeded | Throws `DURABLE_STORAGE_QUOTA_EXCEEDED` | High (if unhandled)| `RECOVERABLE` | No | StorageManager quota preflight; CacheStorage LRU eviction. |
| **F-07** | Browser tab crash mid-session | Reopens from durable `ActivitySpec` and `TodayRun` lease | Minimal | `RECOVERABLE` | Yes | Resumes exact run state via `today-runner.js` lease revalidation. |
| **F-08** | Concurrent edit on transcript revision | Throws `TRANSCRIPT_EDIT_CONFLICT` | None | `RECOVERABLE` | Yes | Optimistic concurrency control via immutable child revisions. |
| **F-09** | Outdated database schema detected | Opens database in `DATABASE_READ_ONLY_FUTURE_SCHEMA` mode | None | `RECOVERABLE` | No | Forward-only additive schema migrations with read-safe fallback. |
| **F-10** | Corrupted backup payload imported | Validation fails closed; rejects import before write | None | `RECOVERABLE` | Yes | Strict schema validation and store digest comparison before mutation. |
| **F-11** | Restore interrupted by power loss | Startup recovery detects uncompleted journal in Core meta | None | `RECOVERABLE` | Yes | Two-phase journal commit with automated rollback to last-known-good state. |
| **F-12** | User seeks during transcript generation | Workspace UI maintains playback; background job continues | None | `RECOVERABLE` | Yes | Decoupled player timeline from transcript generation queue. |

---

## 12. Architectural Coupling & Boundary Audit

The audit identified five critical structural couplings in the current codebase that should be decoupled in future implementations:

```
CURRENT ARCHITECTURAL COUPLING HAZARDS
┌───────────────────────────────────────────────┬──────────────────────────────────────────┐
│ Coupled Boundary                              │ Architectural Risk & Defect              │
├───────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 1. Caption Normalizer $\leftrightarrow$       │ Normalizer directly outputs final        │
│    Sentence Identity                          │ cryptographic sentence IDs based on      │
│                                               │ raw cue boundaries without SBD.          │
├───────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 2. Video Workspace UI $\leftrightarrow$       │ Workspace controller directly binds DOM  │
│    Transcript Resolution                      │ forms to resolver job lifecycle.         │
├───────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 3. Activity Spec $\leftrightarrow$            │ Core learning contracts contain legacy   │
│    Card Persistence Schema                    │ assumptions requiring cardId/senseId.    │
├───────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 4. Today Planner $\leftrightarrow$            │ Today plan composition directly queries  │
│    IndexedDB Physical Stores                  │ raw IndexedDB stores across all 3 DBs.   │
├───────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 5. Weakness Profile $\leftrightarrow$         │ Profile generator scans raw event lists  │
│    Batch Event History                        │ on main thread during UI refresh.        │
└───────────────────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 13. Conceptual Contract Model

To ensure clean domain separation, future architecture should establish ten canonical semantic entities:

```
CANONICAL SEMANTIC ENTITY MODEL
┌───────────────────────┐      ┌────────────────────────┐      ┌─────────────────────────┐
│ 1. TranscriptSource   │ ───> │ 2. TimedSpan           │ ───> │ 3. NormalizedSpan       │
└───────────────────────┘      └────────────────────────┘      └────────────┬────────────┘
                                                                            │
┌───────────────────────┐      ┌────────────────────────┐                   ▼
│ 6. EnrichmentResult   │ <─── │ 5. SemanticSection     │ <─── ┌─────────────────────────┐
└──────────┬────────────┘      └────────────────────────┘      │ 4. SentenceUnit         │
           │                                                   └─────────────────────────┘
           ▼
┌───────────────────────┐      ┌────────────────────────┐      ┌─────────────────────────┐
│ 7. LearningArtifact   │ ───> │ 8. ExecutionAttempt    │ ───> │ 9. EvidenceRecord       │
└───────────────────────┘      └────────────────────────┘      └────────────┬────────────┘
                                                                            │
                                                                            ▼
                                                               ┌─────────────────────────┐
                                                               │10. LearnerStateProject'n│
                                                               └─────────────────────────┘
```

1. **`TranscriptSource`**: Immutable representation of an origin media or document stream (URL, video ID, file hash, language, namespace).
2. **`TimedSpan`**: Raw chronological speech or text fragment with start/end millisecond offsets.
3. **`NormalizedSpan`**: Cleaned, deduplicated, and character-normalized text fragment.
4. **`SentenceUnit`**: Grammatically complete, punctuated, and truecased linguistic sentence with projected timing provenance.
5. **`SemanticSection`**: Thematic grouping of sentences into paragraphs or topic sections with optional generated headings.
6. **`EnrichmentResult`**: Linguistic metadata attached to sentence units (lemmas, POS tags, collocations, CEFR bands, grammar annotations).
7. **`LearningArtifact`**: Synthesized exercise or diagnostic task (`ActivitySpec`) ready for execution.
8. **`ExecutionAttempt`**: Learner interaction log capturing response, timing, and complete assistance trace.
9. **`EvidenceRecord`**: Verified, tamper-evident evaluation output from `EvidencePolicy`.
10. **`LearnerStateProjection`**: Derived multidimensional learner model state (FSRS memory stability, BKT mastery probability, IRT ability estimate, WeaknessProfile).

---

## 14. Target Topology Alternatives

### Topology 1: Monolithic Main-Thread Pipeline (Current Substrate)
- **Description**: All normalization, NLP tokenization, exercise synthesis, and state reduction execute synchronously on the browser main thread.
- **Benefits**: Simple mental model; synchronous debugging; minimal message-passing overhead.
- **Costs**: Main-thread UI freezing on long transcripts (>30 mins); high memory footprint; cannot process progressive streams smoothly.
- **Privacy / Offline**: 100% local-first.

### Topology 2: Decoupled Multi-Worker Streaming Pipeline (Recommended)
- **Description**: Ingestion, SBD, NLP enrichment, and search indexing are offloaded to dedicated Web Workers; main thread handles only UI rendering and audio/video playback; persistence is unified behind a typed Local-First Storage Spine.
- **Benefits**: Zero UI jank; true progressive long-video processing; clean separation of concerns; high testability.
- **Costs**: Message-passing serialization overhead (mitigated by `Transferable` ArrayBuffers and structured cloning).
- **Privacy / Offline**: 100% local-first with optional consented edge fallbacks.

### Topology 3: Local-Companion-Centric Heavy Pipeline
- **Description**: Offloads all transcript processing, heavy Whisper ASR, and local LLM distractor synthesis to a desktop background companion daemon (Python/Rust).
- **Benefits**: Supports multi-gigabyte local neural models without browser memory constraints.
- **Costs**: Zero mobile compatibility; complex user installation; violates web-first simplicity.
- **Privacy / Offline**: 100% local-first, but restricted to desktop power users.

---

## 15. Recommended Non-Binding R3 Target Topology

> [!NOTE]
> **Non-Binding Recommendation Notice**:
> This topology is a research recommendation provided as input to **Lane R4 (Cross-Research Reconciliation)**. It does **NOT** authorize production implementation or bind future stages.

```
RECOMMENDED R3 ARCHITECTURAL TOPOLOGY
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ CLIENT BROWSER RUNTIME (Web-First, Local-First, Mobile-Compatible)                       │
│                                                                                          │
│ ┌──────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ UI / MAIN THREAD LAYER                                                               │ │
│ │ - Fast Virtual Transcript Rail & Sentence Scrubber                                   │ │
│ │ - Web Audio Player & Microphone Recorder (VAD-Gated)                                 │ │
│ │ - Today Session Runner & Quick Capture Inbox                                         │ │
│ └───────────────────────────────────┬──────────────────────────────────────────────────┘ │
│                                     │ PostMessage / Comlink                              │
│ ┌───────────────────────────────────▼──────────────────────────────────────────────────┐ │
│ │ ASYNCHRONOUS WORKER LAYER                                                            │ │
│ │ ┌────────────────────────────────────┐    ┌────────────────────────────────────────┐ │ │
│ │ │ Worker 1: Ingestion & SBD Pipeline │    │ Worker 2: Linguistic Enrichment & NLP  │ │ │
│ │ │ - Suffix Deduplication             │    │ - Lexical Trie & CEFR Profiling        │ │ │
│ │ │ - Rule-Based / Neural SBD          │    │ - PMI Collocation & N-gram Extraction  │ │ │
│ │ │ - Punctuation Restoration          │    │ - Harper WASM Grammar Linter           │ │ │
│ │ │ - Timestamp Provenance Alignment   │    │ - Distractor Generation Engine         │ │ │
│ │ └────────────────────────────────────┘    └────────────────────────────────────────┘ │ │
│ └───────────────────────────────────┬──────────────────────────────────────────────────┘ │
│                                     │ Typed Repository Transactions                      │
│ ┌───────────────────────────────────▼──────────────────────────────────────────────────┐ │
│ │ LOCAL-FIRST STORAGE SPINE                                                            │ │
│ │ - Unified Web Locks Coordinator ('vocab-master-durable-storage-v1')                  │ │
│ │ - Additive Forward-Migrated IndexedDB Store Layer                                    │ │
│ │ - EvidencePolicy Default-Deny Gateway & Append-Only Event Repository                 │ │
│ │ - 100% Store Coverage Backup Registry & Two-Phase Restore Coordinator                │ │
│ └──────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 16. Current vs Target Gap Register

| Gap ID | Domain | Current Substrate State | Expected Target Property | Impact & Severity | Downstream Route |
|---|---|---|---|---|---|
| **R3-G001** | Sentence Segmentation | Naïve cue chunking; no linguistic SBD or abbreviation protection | True SBD with abbreviation/numerical preservation | `HIGH` — Broken sentence grammar | `STAGE6_IMPLEMENTATION_CANDIDATE` |
| **R3-G002** | Punctuation Restoration | Missing; unpunctuated ASR streams remain lowercase/punctuation-free | Hybrid client heuristic + consented LLM punctuation restorer | `HIGH` — Degraded readability | `STAGE5_BENCHMARK` |
| **R3-G003** | Sentence Identity | Hash of exact text and timestamps; breaks on 1ms drift | Separation of semantic ID and physical alignment lineage | `CRITICAL` — Breaks review links | `R4_RECONCILIATION` |
| **R3-G004** | Timestamp Alignment | Flat bounding start/end; no sub-sentence word interpolation | Word-level alignment with explicit provenance tags | `MEDIUM` — Audio playback drift | `STAGE6_IMPLEMENTATION_CANDIDATE` |
| **R3-G005** | Progressive Streaming | Batch processing of whole transcripts | Windowed incremental availability of early sentences | `HIGH` — Slow long-video load | `STAGE6_IMPLEMENTATION_CANDIDATE` |
| **R3-G006** | Main-Thread Concurrency | Heavy NLP, tokenization, and regex run on UI thread | Offload heavy NLP to dedicated Web Workers | `MEDIUM` — UI jank on long video | `STAGE6_IMPLEMENTATION_CANDIDATE` |
| **R3-G007** | Database Topology | 3 physical IndexedDB databases with cross-DB complexity | Logical unification via additive forward schema migration | `MEDIUM` — Transaction overhead | `R4_RECONCILIATION` |
| **R3-G008** | Learner Model Integration | FSRS memory-only; BKT mastery and IRT difficulty uncoupled | Multi-model integration with clear construct boundaries | `HIGH` — Incomplete pedagogy | `R4_RECONCILIATION` |
| **R3-G009** | Topic Segmentation | Transcripts are flat segment lists | TextTiling semantic section and heading generation | `LOW` — Long transcript navigation | `STAGE5_BENCHMARK` |
| **R3-G10** | Audio Blob Storage | Audio recordings not durably stored; memory-only | Bounded CacheStorage / IndexedDB audio blob caching | `MEDIUM` — Speech review loss | `R4_RECONCILIATION` |

---

## 17. A–H Research Requirements Reconciliation

This section reconciles canonical requirements from `docs/research/STAGE3_LEARNING_EXPERIENCE_RESEARCH_REQUIREMENTS.md` routed to Lane R3.

| Requirement ID | Domain / Focus | R3 Architecture Status | Architectural Implication & Resolution | Next Route |
|---|---|---|---|---|
| `REQ-EXP-001` | Instruction + Remediation | `ARCHITECTURALLY_RESOLVED` | `ActivitySpec` schema extended to support worked-example, faded-step, and refutational remediation activity types without breaking FSRS contracts. | `R4_RECONCILIATION` |
| `REQ-EXP-002` | Learner Model Multidimensionality | `ARCHITECTURALLY_RESOLVED` | Architecture separates memory scheduling (`ts-fsrs`), latent skill mastery (`BKT`), and item difficulty (`IRT`) into distinct functional modules. | `R4_RECONCILIATION` |
| `REQ-EXP-006` | Re-entry & Backlog Management | `ARCHITECTURALLY_RESOLVED` | `TodayPlannerV2` must support capped daily review limits (e.g. 60-70% review cap) and non-punitive streak forgiveness state flags. | `STAGE4_UX_INPUT` |
| `REQ-EXP-008` | Generated Item Quality & Filtering | `ARCHITECTURALLY_RESOLVED` | Distractor validation pipeline placed between content factory and `ActivitySpec` synthesis to filter ambiguity and key leakage. | `STAGE5_BENCHMARK` |
| `REQ-EXP-010` | Effectiveness Evidence Provenance | `ARCHITECTURALLY_RESOLVED` | `Attempt` and `EvidenceDecision` contracts capture all 9 mandatory contextual parameters (task ID, scaffolding, latency, raw response, scoring engine, etc.). | `R4_RECONCILIATION` |
| `REQ-EXP-011` | Local-First Data Sovereignty | `ARCHITECTURALLY_RESOLVED` | Verified that learner history, audio blobs, and notes remain 100% on-device; external calls require explicit versioned consent receipts. | `R4_RECONCILIATION` |
| `REQ-EXP-012` | Offline Resilience & Recovery | `ARCHITECTURALLY_RESOLVED` | 100% store coverage in `backup-registry.js`, forward-only IndexedDB migrations, and two-phase restore staging journal verified. | `R4_RECONCILIATION` |

---

## 18. R1 / R1 Supplement / R2 Compatibility Matrix

- **R1 Pedagogical Baseline Compatibility**: `PASS`
  - Preserves retrieval practice, spacing, cognitive load management, and 5-skill separation.
  - Maintains strict distinction between assisted learning performance and unassisted mastery evidence.
- **R1 Supplement Compatibility**: `PASS`
  - Memory ($R$), mastery ($P(L)$), and ability ($\theta$) are represented as distinct architectural components.
  - Contextual evidence provenance (9 parameters) is fully representable in the contract model.
  - Pedagogical heuristics (review ratios, streak forgiveness) are treated as configurable parameters rather than hardcoded architectural constants.
- **R2 Capability Compatibility**: `PASS`
  - Reconciles candidate dispositions without duplicating ecosystem discovery.
  - Integrates WASM-native and lightweight client library boundaries (Harper, OramaJS, Fast XML Parser).
  - Avoids premature dependency adoption or concrete Stage 5 model benchmarking.

---

## 19. Stage 5, Owner & R4 Handoff Register

### 19.1 Handoff to Lane R4 (Cross-Research Reconciliation)
- Cross-reconcile proposed Decoupled Multi-Worker Streaming Topology against R1 pedagogical load requirements and Owner resource constraints.
- Ratify data classification tiers (Canonical Source vs Derived vs Cache vs Ephemeral) in the Owner Decision Ledger.
- Resolve database unification timeline (Phase 1 legacy multi-DB vs unified physical schema).

### 19.2 Handoff to Stage 4 (UX / IA Remake)
- Design progressive loading UI states for long-video transcript processing.
- Provide clear visual indicators for `EXACT` vs `INTERPOLATED` vs `UNALIGNED` subtitle timings.
- Design non-predatory streak forgiveness and backlog recovery interfaces.

### 19.3 Handoff to Stage 5 (AI / Technology Deep Benchmark)
- Benchmark WASM-based neural SBD (`wtpsplit`) latency and memory overhead on mobile browsers.
- Benchmark Harper WASM grammar checking throughput against ESL error corpora.
- Benchmark hosted LLM punctuation restoration quality and cost on raw YouTube ASR streams.

---

## 20. Source & Repository Evidence Registry

### 20.1 Repository Source Evidence (`REP-xxx`)
- `REP-001`: `src/caption-normalizer.js` — Cue deduplication, rolling caption suffix overlap, and lineage digest calculation.
- `REP-002`: `src/transcript-aggregate.js` — Immutable transcript revision management and `TRANSCRIPT_TIMELINE_OVERLAP` enforcement.
- `REP-003`: `src/transcript-resolver-v2.js` — Asynchronous resolver job state machine and progressive fallback coordination.
- `REP-004`: `src/asr-fallback-policy.js` — Phase 5 fallback policy, capability matrix, and cloud consent verification.
- `REP-005`: `src/transcript-import.js` — SRT/VTT parsing, plain text unaligned fallback, and character limit checks.
- `REP-006`: `src/learning-contracts.js` — Canonical `ActivitySpec`, `Run`, `Attempt`, `Receipt`, and `AssistanceTrace` contracts.
- `REP-007`: `src/evidence-policy.js` — `phase0-evidence-v1` default-deny FSRS write gateway.
- `REP-008`: `src/fsrs-scheduler.js` — FSRS v6 multi-skill scheduling implementation (`ts-fsrs` 5.4.1).
- `REP-009`: `src/weakness-profile.js` — Deterministic `WeaknessProfile` projection and uncertainty tracking.
- `REP-010`: `src/focus-selector.js` — Remedial focus activity selection and budget validation.
- `REP-011`: `src/persistence.js` — Core IndexedDB database management (v5) and review event commit transactions.
- `REP-012`: `src/backup-registry.js` — 100% physical store registry coverage across Core, IELTS, and V10 databases.
- `REP-013`: `src/storage-lock.js` — Web Locks coordinator for cross-database write exclusivity (`vocab-master-durable-storage-v1`).
- `REP-014`: `src/migration-ledger.js` — Forward-only additive schema migration runner and ledger verification.
- `REP-015`: `src/video-workspace-v2.js` — Virtual transcript rail, YouTube segment player binding, and restore lifecycle.
- `REP-016`: `src/audio-manager.js` — Web Speech synthesis voice scoring and Web Audio MediaRecorder recording wrapper.

### 20.2 Test Suite Evidence
- `tests/caption-resolver-contracts.test.mjs` — Tests resolver state transitions and rolling caption deduplication.
- `tests/caption-resolver-v2.test.mjs` — Tests server-side resolver job lifecycle and artifact recovery.
- `tests/transcript-aggregate.test.mjs` — Tests immutable child revisions, CAS activation, and provider refresh isolation.
- `tests/phase5-resolver-fallback.test.mjs` — Tests ASR fallback resolution, fencing tokens, and lease TTLs.
- `tests/phase5-policy.test.mjs` — Tests fallback policy defaults, public eligibility, and replay-safe consent.
- `tests/phase5-import.test.mjs` — Tests SRT/VTT validation and unaligned text handling.
- `tests/learning-contracts.test.mjs` — Tests canonical envelope validation and frozen target projections.
- `tests/evidence-policy.test.mjs` — Tests adversarial evidence rejection and receipt binding integrity.
- `tests/backup-registry.test.mjs` — Tests 100% store registry coverage and payload serialization.
- `tests/restore-safety.test.mjs` — Tests two-phase restore staging, journal recovery, and canonical verification.
- `tests/audio-manager.test.mjs` — Tests voice selection ranking, rate calculation, and listener stability.

---

## 21. Final Research Disposition

- **Document Status**: `COMPLETE / READY_FOR_INDEPENDENT_AUDIT`
- **Candidate Quality Bar**: Fully satisfies all 29 research and governance mandates specified in `STAGE3-R3-PIPELINE-ARCHITECTURE-RESEARCH-001`.
- **Implementation Status**: `ZERO_CODE_MUTATIONS` (Strict adherence to read-only research boundary).
- **Next Governance Step**: Open one Draft PR, verify natural exact-head CI, and halt for a fresh independent Stage 3 Lane R3 research-quality audit.
