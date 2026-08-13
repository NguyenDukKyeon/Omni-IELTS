# VocabMaster — Roadmap Phase 0–7

Trạng thái: **CANONICAL**
Ngày hiệu lực: 2026-07-30

## 1. Vai trò của tài liệu

Đây là nguồn chính thức cho phạm vi Phase 0–7, package ID, phase gate và dependency. Chi tiết acceptance, test, migration/rollback và stop condition nằm trong `IMPLEMENTATION_PLAN.md`; trạng thái/evidence thực tế nằm trong `IMPLEMENTATION_STATUS.md`; rationale nằm trong `DECISIONS.md`; quy tắc thi hành nằm trong `AGENTS.md`.

Khi thay đổi roadmap hoặc dependency, phải cập nhật file này trước, ghi quyết định tương ứng, rồi reconcile plan và status. Các báo cáo V9/IELTS/V10 cũ là evidence lịch sử, không phải roadmap hiện hành.

Work package là đơn vị lập kế hoạch, kiểm chứng và commit; không tự động là một branch/PR. Riêng Phase 0 được thực hiện tuần tự trên `codex/phase-0-release-safety`, một commit nhỏ cho mỗi P0-00…P0-08 và một PR Phase 0.

## 2. Phase gates

| Phase | Kết quả bắt buộc | Entry gate |
|---|---|---|
| Phase 0 — Containment and Release Safety | Evidence, backup/restore, Capture/Today và release harness an toàn | Baseline audit |
| Phase 1 — Core Product Unification | Contract/repository/runner canonical và migration ledger | P0-08 ACCEPTED |
| Phase 2 — Caption-first Transcript Resolver | Resolver job bền, whole-track, stable transcript, progressive delivery | P1-05 và P1-08 ACCEPTED |
| Phase 3 — Full-video Learning Workspace | Workspace/modes/evidence/editor/browser UX hoàn chỉnh | P2-06 ACCEPTED |
| Phase 4 — Remote Content Platform MVP | Content trust/install/lifecycle và Starter Pack được kiểm chứng | P1 contracts; activation theo dependency package |
| Phase 5 — ASR and Cloud Fallback | Local-first fallback, consent/privacy và recovery | P2-06 ACCEPTED |
| Phase 6 — Content Factory and Scale | External factory, human review và canary scale | P4-10 ACCEPTED |
| Phase 7 — Measurement and Personalization | Metrics sạch, calibration và experiments có guard | Clean events cùng content/outcome dependencies |

Phase 1 bị khóa tuyệt đối cho tới khi P0-08 được reviewer độc lập chấp nhận ở exact commit. Phase 2 và Phase 4 có thể phát triển song song sau các contract Phase 1 liên quan; Phase 3 cần identity/contract của Phase 2; Phase 5 cần durable resolver jobs; Phase 7 chỉ productionize sau evidence sạch và dependency content/outcome thật.

## 3. Dependency roadmap

### Phase 0 — Containment and Release Safety

| Package | Mục tiêu | Dependency |
|---|---|---|
| P0-00 | Acceptance harness đáng tin, deterministic browser/fixture/cleanup | Baseline |
| P0-01 | Minimal Attempt, AssistanceTrace và default-deny EvidencePolicy | P0-00 |
| P0-02 | Core schedule gateway và qualified unlock | P0-01 |
| P0-03 | IELTS/V10 evidence containment và Retell honesty | P0-01 |
| P0-04 | Durable store registry và backup envelope vNext | P0-00 |
| P0-05 | Restore journal, rollback và degraded-storage safety | P0-04 |
| P0-06 | Quick Capture bền và single-Inbox containment | P0-00, P0-05 |
| P0-07 | Single-Today containment và exact-launch guard | P0-00, P0-01 |
| P0-08 | Independent Phase 0 exit audit trên cùng exact commit | P0-02, P0-03, P0-05, P0-06, P0-07 |

Exit gate: không false-positive schedule; reveal/hint/unverified transcript không tạo independent evidence; sentinel backup round-trip 100% mọi durable store Core/IELTS/V10/drafts/outbox; restore/rollback và degraded writes an toàn; Quick Capture bền qua reload; chỉ một Today/Inbox; Retell trung thực; browser gate lặp ổn định; toàn bộ unit/integration/static/build/browser gate xanh; reviewer độc lập không còn finding P0/P1.

P0-00 được chấp nhận khi harness phân loại và dọn tài nguyên đúng, kể cả khi nó báo một product failure Retell có thật. Product failure đó tiếp tục giữ full Phase 0 gate đỏ cho đến P0-03; không được đổi thành infrastructure failure hoặc bỏ assertion. P0-00 tạo scaffold gate, P0-08 hoàn thiện toàn bộ exit matrix/digest.

### Phase 1 — Core Product Unification

| Package | Mục tiêu | Dependency |
|---|---|---|
| P1-00 | Forward-compatible DB opener và migration ledger | P0-08 |
| P1-01 | Canonical ActivitySpec, Run, Attempt và Receipt | P1-00 |
| P1-02 | Canonical event/evidence repositories | P1-01 |
| P1-03 | Cross-DB saga và reconciler | P1-02 |
| P1-04 | Unified Capture domain và Inbox cutover | P1-03 |
| P1-05 | Canonical Transcript aggregate/revision | P1-02 |
| P1-06 | Global Error Repository và repair scheduler | P1-02, P1-05 |
| P1-07 | Deterministic Today Composer | P1-02, P1-04, P1-06 |
| P1-08 | Exact Today Runner, resume và IA cutover | P1-07 |

### Phase 2 — Caption-first Transcript Resolver

| Package | Mục tiêu | Dependency |
|---|---|---|
| P2-00 | Resolver contract/provider policy/golden corpus | P1-05, P1-08 |
| P2-01 | Durable resolver jobs và SSE state machine | P2-00 |
| P2-02 | Safe yt-dlp capability/metadata/track selection | P2-01 |
| P2-03 | Whole-track artifact cache và standards parsers | P2-02 |
| P2-04 | Rolling-caption normalizer và stable sentence IDs | P2-03 |
| P2-05 | Progressive client/orchestration/cancellation | P2-01, P2-04 |
| P2-06 | Resolver observability và Phase 2 exit gate | P2-05 |

### Phase 3 — Full-video Learning Workspace

| Package | Mục tiêu | Dependency |
|---|---|---|
| P3-00 | Workspace shell, route và state controller | P2-06 |
| P3-01 | Player/rail sync, progressive rows, virtualization | P3-00 |
| P3-02 | Normal, Noticing và Shadowing modes | P3-01 |
| P3-03 | Strict/Practice Dictation và semantic masking | P3-01, EvidencePolicy |
| P3-04 | Real Retell capture/evaluation/evidence | P3-03, event repositories |
| P3-05 | Transcript editor và immutable revisions | P1-05, P3-01 |
| P3-06 | Responsive/a11y/browser Phase 3 exit gate | P3-02…P3-05 |

### Phase 4 — Remote Content Platform MVP

| Package | Mục tiêu | Dependency |
|---|---|---|
| P4-00 | Content/rights/review contracts v2 | P1-01, P1-05 |
| P4-01 | Remote catalog trust/signing/last-known-good | P4-00, staging/key runbook |
| P4-02 | Content-addressed cache và atomic Pack Installer | P4-01, P1-00 |
| P4-03 | Pack lifecycle/offline/update/delete/backup | P4-02 |
| P4-04 | External content repository, rights registry, CI | P4-00, provisioning |
| P4-05 | Human-authored three-lesson sampler | P4-04, P4-01 staging |
| P4-06 | IELTS Foundations Week 1 | P4-05 |
| P4-07 | IELTS Foundations Week 2 | P4-06, defect review |
| P4-08 | IELTS Foundations Week 3 | P4-07 |
| P4-09 | IELTS Foundations Week 4 / Starter Pack 24 | P4-08 |
| P4-10 | Remote Content Platform exit gate | P4-03, P4-09 |

### Phase 5 — ASR and Cloud Fallback

| Package | Mục tiêu | Dependency |
|---|---|---|
| P5-00 | Capability/consent/privacy/fallback contract | P2-06 |
| P5-01 | Secure local companion và media extraction | P5-00 |
| P5-02 | Local Whisper/faster-whisper progressive batch | P5-01 |
| P5-03 | Chunk overlap, failed-range resume và cleanup | P5-02, P2-04 |
| P5-04 | Explicit opt-in Gemini fallback | P5-00, resolver jobs |
| P5-05 | Mobile/import rescue UX và Phase 5 exit | P5-03, P5-04 |

### Phase 6 — Content Factory and Scale

| Package | Mục tiêu | Dependency |
|---|---|---|
| P6-00 | External factory jobs, provenance, coverage brief | P4-10 |
| P6-01 | Batch generator và deterministic validators | P6-00 |
| P6-02 | Advisory critic, human review, protected publisher | P6-01 |
| P6-03 | Rights/defect registry và learner reporting | P6-02, P4-03 |
| P6-04 | First scale canary pack | P6-02, P6-03 |
| P6-05 | Scale operating gate và pack template | P6-04 |

### Phase 7 — Measurement and Personalization

| Package | Mục tiêu | Dependency |
|---|---|---|
| P7-00 | Canonical learning metrics reducer | P1-02, P1-08 |
| P7-01 | Honest Progress UI và uncertainty | P7-00 |
| P7-02 | GoalProfile và mastery recomputation | P7-00, P4-10, P2-06 |
| P7-03 | Delayed outcomes và calibration | P7-00, mature clean cohort |
| P7-04 | Workload simulator và deterministic recommender | P7-02, P7-03, P4-10, P6-05 |
| P7-05 | Guarded personalization experiments và Phase 7 exit | P7-04, adequate baseline cohort |

## 4. Cross-cutting architecture taxonomy

Phần này bổ sung taxonomy cắt ngang mà không tạo phase mới hoặc thay đổi Phase
0–7. Năm umbrella dưới đây chỉ là nhãn portfolio để nhóm capability. Chúng
không phải package, dependency node, phase gate, status owner hay acceptance
owner. Một package vẫn có đúng một canonical boundary trong roadmap dù có thể
phục vụ nhiều umbrella.

### Portfolio umbrellas — grouping only

| Umbrella | Capability grouping | Canonical ownership rule |
|---|---|---|
| U-LI — Learning Integrity and Evidence | Execution integrity, evidence safety và error-candidate promotion | LI-00 và ERR-00 sở hữu các boundary được ratify; U-LI không sở hữu status/acceptance |
| U-AI — Local-first Assistance and Durable Work | Local-first assistance, durable work và provider governance | Chưa có package owner mới trong CR-2A; capability hiện hữu giữ nguyên owner |
| U-PCS — Personal Content Supply | Source intake, private revision, compilation và provenance | SRC-00 chỉ sở hữu source-reference seam; các boundary khác chưa được ratify |
| U-4S — Four-skill Practice | Reading, Listening, Writing và Speaking practice | QAR-00 chỉ sở hữu shared question contracts; skill inventory/executor giữ owner riêng |
| U-FD — Focus, Weakness and Diagnostics | Weakness, focus, assessment và readiness evidence | WKN-00→P7-00; FCS-00/FCS-01→P1-07 bounded Today seam; ASM-00→ASM-00; TD-00→TD-00; FCS-02/readiness remain unassigned |


### Wave 6 recovery owner bindings

These bindings are planning/ownership authority only. They do not authorize implementation or merge.
Detailed recovery acceptance criteria are frozen in `docs/WAVE6_RECOVERY_PLAN.md` under the bounded addendum in `AGENTS.md`.

| Recovery subject | Canonical owner | Dependency | Boundary |
|---|---|---|---|
| P7-00 / WKN-00 successor | P7-00 | package-accepted PR #66 P7-00/WKN-00 semantics; P1-02; P1-08 | deterministic richer WeaknessProfile projection only; no readiness/band/mastery |
| FCS-00 / FCS-01 | P1-07 Today Composer bounded seam | accepted P7/WKN successor; P1-07; P1-08 | one deterministic evidence-backed Focus slot; due-first; no provider; no P7-04 activation |
| ASM-00 | ASM-00 cross-cutting assessment owner | accepted LI-00 and QAR-00 semantics | immutable multi-item Frozen Assessment; authenticated QAR scoring; raw aggregate only |
| TD-00 | TD-00 diagnostic adapter owner | accepted WeaknessProfile owner revision; accepted ASM-00 | weakness-biased non-representative diagnostic only; no evidence/schedule/readiness/band/mastery |
| FCS-02 | UNASSIGNED | — | deferred advisory/AI Focus; not part of recovery |

The preserved local Wave 6 working tree is non-canonical recovery input. Exact package execution must be rematerialized prospectively under Protocol V1.

### Minimum cross-cutting packages

| Package | Canonical scope | Dependency |
|---|---|---|
| LI-00 | Additive execution-safety seam that freezes Run bindings and requires one terminal Receipt through canonical Activity/Run/Attempt/Receipt, Today and EvidencePolicy owners | P1-01, P1-02, P1-07, P1-08, EvidencePolicy |
| SRC-00 | Stable `SourceRevisionRef` adapter seam across canonical activity, Transcript and content identities; no new source store or trust authority | P1-01, P1-05, P3-06; public-pack adapter additionally requires accepted P4 contracts |
| ERR-00 | ErrorCandidate lifecycle and atomic, policy-qualified promotion into the existing global Error Repository | LI-00, P1-06 |
| QAR-00 | Shared question-type schema, normalization and scoring registry consumed by canonical executors; no second runtime, attempt store or scheduler | LI-00, SRC-00 |

All four packages are planning boundaries only. Canonicalization does not
authorize implementation, create a branch or supply acceptance evidence.

### Cross-cutting Repository Engineering

This placement is outside Phase 0–7 and outside the five U-* portfolio
umbrellas. It is repository engineering support, not a product phase or
product capability owner.

| Package | Canonical scope | Dependency |
|---|---|---|
| EWF-00 | Engineering Workflow Foundation: constitutional bridge, one-writer preflight, bounded repair/spec metadata, focused/PR evidence packaging, trace validation, frozen acceptance brief and independently audited pilots | No hard product-package dependency; architecture baseline `adc3726620f4badddb16309e375f8f17b6af1404`; reuse existing acceptance-harness and independent-audit conventions |

EWF-00 does not own package status, product acceptance or canonical governance.
Its bootstrap records planning metadata only and does not implement the
Foundation.

## 5. Quy tắc thay đổi roadmap

- Không mở rộng sản phẩm trong package containment/audit.
- Thay đổi dependency hoặc phase gate phải có ADR, impact đến migration/rollback/evidence và cập nhật đồng bộ plan/status.
- Report, screenshot hoặc source-string assertion không đủ để đổi trạng thái acceptance.
- Rollback feature không được dùng destructive data migration.
