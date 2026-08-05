# VocabMaster — Implementation Plan Phase 0–7

Trạng thái tài liệu: implementation specification cho roadmap chính thức tại `docs/ROADMAP.md`.

Historical code baseline được kiểm chứng tại commit 54691cfb5314b51762c4959c9d0cee2012fc2b4a trên main. Exact planning predecessor và kickoff baseline cho Phase 0 là 547e5d665adbf102c15b65ac39def185769e5626, ngày 2026-07-30.

## 1. Phạm vi, nguồn thẩm quyền và giới hạn

Repository hiện có `AGENTS.md` và `docs/ROADMAP.md` được tạo trước source change Phase 0. Vai trò thẩm quyền:

- `docs/ROADMAP.md` giữ roadmap Phase 0–7, package ID và dependency;
- tài liệu này giữ đặc tả implementation/acceptance chi tiết;
- `docs/IMPLEMENTATION_STATUS.md` giữ trạng thái và evidence thực tế;
- `docs/DECISIONS.md` giữ rationale/ADR; `AGENTS.md` giữ quy tắc thi hành;
- docs/ielts-phases-0-5-audit.md, docs/RELEASE_CHECKLIST_V9.md và các gate trong src/v10-audit.js chỉ là bằng chứng lịch sử/implementation, không thay thế roadmap hiện hành.

Phạm vi triển khai đang được ủy quyền chỉ là Phase 0. Phase 1 vẫn bị hard-block cho đến P0-08 `ACCEPTED`.

## 2. Kết luận kiểm chứng roadmap với implementation

### 2.1 Những nền tảng có thể tái sử dụng

- Core đã có FSRS theo skill, review events, snapshots, outbox và backup cơ bản.
- IELTS có domain/persistence riêng, Error Notebook, media lab, evidence guard và combined backup Core + IELTS.
- V10 đã thử nghiệm Unified Capture, Today planner, transcript resolver, video workspace, sentence loop, content catalog và content factory.
- Workspace hiện đã đi đúng hướng thị giác: video và bài luyện bên trái, transcript rail bên phải, responsive chuyển thành một cột.
- Test unit, static audits, build và server smoke hiện tồn tại; đây là nền để nâng thành acceptance gate thực.

### 2.2 Khoảng cách bắt buộc roadmap phải xử lý

| Lĩnh vực | Bằng chứng implementation hiện tại | Hệ quả |
|---|---|---|
| Evidence/FSRS | src/app.js vẫn tin cờ affectsSchedule do step trả về; src/learning.js có thể sinh bài typing gắn skill listening; fsrs-scheduler.js mở khóa dựa trên reps > 0 thay vì retrieval hợp lệ | Có thể tạo false learning evidence và mở khóa sau một lần thất bại |
| Today | Core Today, V10 Today và IELTS Today cùng tồn tại; today-planner-v2.js lập exact card/skill nhưng launcher bỏ target và gọi mode chung | Kế hoạch và activity thực thi có thể không trùng nhau |
| Capture | capture-inbox.js và unified-capture-v2.js cùng mount; Quick Capture dùng event.currentTarget sau await | Hai inbox, hành vi nhập liệu không ổn định, nguy cơ draft chỉ còn trong RAM |
| Error repair | IELTS detail lộ correction trước attempt độc lập; lỗi Core được bắt qua MutationObserver; các kho lỗi chưa có receipt chung | Evidence sửa lỗi không đáng tin và tổng số lỗi không reconcile |
| Retell | IELTS Retell có flow nhưng browser smoke đang fail; V10 Retell không lưu/evaluate output và Skip dùng chung completion flow | UI có thể mô tả năng lực không hề được đo |
| Transcript | cache theo range, server Map trong RAM, mỗi chunk gọi lại yt-dlp metadata, parser/normalizer yếu, ordinal ID không ổn định, không có durable job/SSE/cancel/resume | Không đáp ứng full-video 10–30 giây theo cách progressive và không resume đáng tin |
| Dictation | transcript rail vẫn chứa đáp án trong DOM khi câu đang Dictation | Vi phạm construct validity dù panel chính có che text |
| Backup | combined backup chỉ Core + IELTS; Core export bỏ captureDrafts/outbox; V10 không được backup; restore liên DB chỉ bù trừ tuần tự | Có thể mất dữ liệu sau reset/restore hoặc crash giữa chừng |
| IndexedDB | Ba DB độc lập; V10 opener khóa version 1; fallback Map có thể che lỗi durable storage | Rollback build có thể VersionError; người dùng tưởng dữ liệu đã lưu khi chỉ nằm RAM |
| Content | catalog/asset cùng origin, cache đọc binary bằng text, URL mutable, không signature/hash transaction; ba lesson chưa có audio/rights review đủ mạnh | App phình khi scale và chưa thể gọi là verified content platform |
| AI content | factory chạy idle trong learner app và có đường direct publish sau validation đơn giản | Trộn authoring với learning runtime và không có human publishing gate |
| Progress | một số nhãn mạnh được suy từ ít sample; metrics đến từ nhiều projection/counter | Cá nhân hóa sớm sẽ tối ưu trên evidence nhiễu |
| Responsive/a11y | bottom nav V10 thêm mục thứ năm nhưng CSS vẫn grid bốn cột; browser assertions phần lớn dựa trên source string | UI có lỗi thực tế mà audit tĩnh vẫn xanh |

### 2.3 Kết quả kiểm thử baseline

Các lệnh npm ci, npm test, npm run check, npm run audit:roadmap, npm run audit:ielts, npm run test:v10, npm run audit:v10, npm run build, npm run test:serve, npm run test:preview và npm run test:browser đã chạy đạt ở baseline.

Hai gate còn đỏ:

- npm run test:ielts-browser: Retell did not finish in a success state.
- npm run test:v10-browser: không tìm được Chrome/Chromium/Edge trên Windows dù các script browser khác có candidate path.

npm run test:hardening chạy hết assertion nhưng process kết thúc lỗi khi cleanup file CrashpadMetrics-active.pma bị EBUSY. Do đó Phase 0 chưa đạt.

## 3. Kiến trúc sản phẩm mục tiêu

~~~mermaid
flowchart LR
  IA["IA: Hôm nay · Thu thập · Kho từ · IELTS · Tiến bộ"]
  C["Canonical contracts\nActivity · Attempt · Receipt · EvidenceDecision"]
  D["Durable domain repositories\nCard · Occurrence · Error · Transcript · ContentProgress"]
  E["EvidencePolicy gateway"]
  F["FSRS per skill"]
  T["Today Composer + Runner"]
  X["Transcript Resolver jobs"]
  W["Video Learning Workspace"]
  P["Remote Content Platform"]
  M["Metrics reducer + Personalization"]

  IA --> T
  IA --> W
  IA --> P
  T --> C
  W --> C
  P --> C
  C --> E
  E --> F
  C --> D
  X --> D
  D --> T
  D --> M
  M --> T
~~~

Các ranh giới bắt buộc:

1. Chỉ EvidencePolicy gateway được phép chuyển Attempt thành review event/FSRS write.
2. Today chỉ lập kế hoạch; Runner thực thi đúng ActivitySpec và trả ActivityReceipt bất biến về target.
3. Transcript là aggregate có source, revision, segment identity và coverage; workspace chỉ là projection.
4. Content được phân phối là immutable, có rights/provenance/human approval. Video cá nhân là private artifact, không tự đi vào shared cache/catalog.
5. Cache có thể xóa và dựng lại; progress/evidence/user content là durable và phải backup.
6. AI không trực tiếp publish content, không trực tiếp ghi FSRS và không làm Today chờ.

## 4. Luật package, commit và pull request

- Work package là đơn vị lập kế hoạch, kiểm chứng và commit; không mặc định là một branch hoặc pull request.
- Phase 0 dùng một branch `codex/phase-0-release-safety`, một commit nhỏ tương ứng mỗi P0-00…P0-08 và một pull request Phase 0.
- PR Phase 0 phải khai báo commit/package mapping, predecessor, migration/rollback, evidence từng lệnh và blocker/giới hạn.
- Không mở Phase 1 trước khi P0-08 ký Phase 0 ACCEPTED.
- Migration phải additive, idempotent và forward-compatible. Rollback là rollback code/feature flag; không hạ IndexedDB version và không xóa dữ liệu mới.
- Implementer report không phải acceptance evidence. Reviewer phải chạy lại gate liên quan và đối chiếu durable state/runtime behavior.
- Mỗi package chỉ được ACCEPTED khi mọi acceptance criteria của chính nó đạt; “test cũ xanh” không thay cho test mới.
- Điều kiện dừng có quyền chặn merge. Khi dừng, không tự đổi baseline hoặc mở rộng allowed files.

## 5. Dependency graph

~~~mermaid
flowchart TD
  P000["P0-00 Acceptance harness"] --> P001["P0-01 Evidence contract"]
  P001 --> P002["P0-02 Core evidence gateway"]
  P001 --> P003["P0-03 IELTS/V10 containment"]
  P000 --> P004["P0-04 Durable inventory + backup export"]
  P004 --> P005["P0-05 Restore safety"]
  P005 --> P006["P0-06 Capture containment"]
  P001 --> P007["P0-07 Today containment"]
  P002 --> P008["P0-08 Phase 0 audit"]
  P003 --> P008
  P005 --> P008
  P006 --> P008
  P007 --> P008
  P008 --> P100["Phase 1 contracts and unification"]
  P100 --> P200["Phase 2 resolver"]
  P200 --> P300["Phase 3 workspace"]
  P100 --> P400["Phase 4 content platform"]
  P200 --> P500["Phase 5 ASR fallback"]
  P400 --> P600["Phase 6 content scale"]
  P300 --> P700["Phase 7 measurement"]
  P400 --> P700
  P600 --> P700
~~~

Phase 2 và Phase 4 có thể phát triển song song sau Phase 1 vì cùng tiêu thụ canonical contracts nhưng không phụ thuộc UI của nhau. Phase 3 cần transcript contract/identity của Phase 2. Phase 5 cần durable resolver jobs của Phase 2, không cần chờ toàn bộ UI Phase 3. Phase 7 cần evidence sạch và content inventory thật; không được bắt đầu tuning/personalization trước các dependency đó.

## 6. Work packages

## Phase 0 — Containment and Release Safety

Exit gate Phase 0: không có false-positive schedule trong test matrix; backup sentinel roundtrip đủ mọi durable store; Quick Capture bền qua reload và degraded storage; chỉ có một Today/Inbox production entry; toàn bộ browser gate chạy lặp lại ổn định. Mọi package Phase 1 bị khóa cho đến P0-08.

### P0-00 — Acceptance harness đáng tin

- Commit/package: P0-00 trên `codex/phase-0-release-safety`.
- Mục tiêu: chuẩn hóa browser discovery, profile tạm, process/port cleanup, seed/reset fixture và scaffold lệnh `phase0:gate` để phân biệt lỗi sản phẩm với lỗi harness. P0-08 sở hữu việc hoàn thiện full exit matrix và digest.
- Dependency: planning predecessor/kickoff baseline 547e5d665adbf102c15b65ac39def185769e5626; package đầu tiên.
- File/module dự kiến: package.json; scripts/browser-smoke-entry.mjs, scripts/ielts-browser-smoke.mjs, scripts/v10-browser-smoke.mjs, scripts/hardening-browser-smoke.mjs; helper test mới; không sửa feature code.
- Migration/rollback: không data migration; rollback chỉ bỏ helper/script mới.
- Test bắt buộc: mọi unit/audit/build hiện có; ba browser smoke trên Windows; chạy lặp ba lần; kiểm port rỗng và temp profile được cleanup cả pass/fail.
- Acceptance criteria: cùng một browser resolution policy; lỗi Retell vẫn hiện là `PRODUCT_FAILURE` có chẩn đoán và giữ Phase 0 product gate đỏ nhưng không làm P0-00 bị đánh giá nhầm là harness failure; không còn EBUSY làm sai verdict; phase0:gate fail-fast và trả exit code đúng.
- Rủi ro: Medium, vì harness có thể che lỗi nếu retry mù.
- Điều kiện dừng: dừng nếu phải sửa feature để làm test xanh, bỏ assertion, dùng profile người dùng, hoặc để process/browser sống sau test.

### P0-01 — Minimal Attempt, AssistanceTrace và EvidencePolicy

- Commit/package: P0-01 trên `codex/phase-0-release-safety`.
- Mục tiêu: định nghĩa contract tối thiểu, reason code và pure decision function trước mọi schedule write.
- Dependency: P0-00 ACCEPTED.
- File/module dự kiến: src/ielts-domain.js hoặc module evidence-policy mới; src/v10-contracts.js; tests/ielts-domain.test.mjs; tests/v10-evidence.test.mjs.
- Migration/rollback: additive fields; record cũ thiếu provenance mặc định ineligible; feature flag chỉ cho audit trước khi gateway nối vào runtime.
- Test bắt buộc: table-driven tests cho correct/wrong/Again, reveal/hint/transcript viewed, unverified source, wrong target/skill, retry/idempotency và unknown activity.
- Acceptance criteria: decision luôn trả eligible + reason; default deny; Shadowing/coaching/spelling/source-error không ghi FSRS; failure hợp lệ vẫn được lưu đối xứng nhưng không giả success.
- Rủi ro: High do contract sai sẽ lan toàn app.
- Điều kiện dừng: dừng nếu policy phải suy target từ DOM/mode name, hoặc có caller được tự gán independent/verified mà không có trace.

### P0-02 — Core schedule gateway và unlock correctness

- Commit/package: P0-02 trên `codex/phase-0-release-safety`.
- Mục tiêu: mọi Core FSRS write đi qua P0-01; sửa unlock dựa trên qualified evidence thay vì reps > 0.
- Dependency: P0-01 ACCEPTED.
- File/module dự kiến: src/app.js, src/learning.js, src/fsrs-scheduler.js, src/persistence-core.js; tests/learning.test.mjs, tests/persistence-core.test.mjs và test scheduler mới.
- Migration/rollback: không rewrite lịch sử ở Phase 0; lưu reason metadata additive; rollback bằng gateway flag nhưng không xóa metadata.
- Test bắt buộc: tìm/bao phủ mọi call schedule/review write; Again không unlock; typing không tự thành Listening; reveal/hint ineligible; duplicate receipt idempotent.
- Acceptance criteria: zero direct schedule write ngoài gateway allowlist; mọi review event có activity/target/decision reason; skill unlock chỉ từ evidence đủ điều kiện.
- Rủi ro: High, có thể đổi due queue.
- Điều kiện dừng: dừng nếu còn một write path không truy được Attempt hoặc nếu migration buộc recompute lịch sử ngay.

### P0-03 — IELTS/V10 evidence containment và Retell honesty

- Commit/package: P0-03 trên `codex/phase-0-release-safety`.
- Mục tiêu: nối IELTS/V10 vào policy; chặn correction đã lộ đáp án; Retell chưa có output/evaluator phải là coaching-only hoặc ẩn.
- Dependency: P0-01 ACCEPTED.
- File/module dự kiến: src/ielts-runtime-guard.js, src/ielts-lab.js, src/ielts-media-player.js, src/sentence-learning-loop.js, src/v10-contracts.js; test domain/evidence/browser.
- Migration/rollback: progress cũ thiếu learner output được normalize là unverified; không xóa attempt cũ; UI containment qua flag có thể rollback.
- Test bắt buộc: correction before/after reveal; planned skill mismatch; empty Retell; Skip; reload; source transcript unverified; IELTS browser Retell path.
- Acceptance criteria: không path Skip/empty/revealed correction tạo success; UI không gắn “đã đánh giá” khi chưa có output; browser test phản ánh đúng trạng thái.
- Rủi ro: Medium–High, có thể giảm số review được ghi nhưng đó là sửa correctness.
- Điều kiện dừng: dừng nếu phải giả lập AI success, hoặc expected answer vẫn hiện trước attempt được gọi independent.

### P0-04 — Durable store registry và backup envelope vNext

- Commit/package: P0-04 trên `codex/phase-0-release-safety`.
- Mục tiêu: phân loại toàn bộ store Core/IELTS/V10 thành durable, reconstructable cache hoặc ephemeral; export mọi durable record gồm drafts/outbox/V10.
- Dependency: P0-00 ACCEPTED.
- File/module dự kiến: src/persistence.js, src/persistence-core.js, src/ielts-persistence.js, src/v10-persistence.js, src/ielts-backup.js, src/ielts-backup-bridge.js; backup tests/fixtures.
- Migration/rollback: backup schema version mới dual-read; export cũ vẫn import; rollback code không làm mất file backup vNext và phải báo “newer schema” rõ ràng.
- Test bắt buộc: sentinel per store, empty/large/unicode records, deterministic canonical export, cache exclusion, corrupt/unknown version, no-secret scan.
- Acceptance criteria: registry liệt kê owner/classification/backup rule cho mọi store; sentinel roundtrip export payload đạt 100%; V10/drafts/outbox không còn vắng.
- Rủi ro: High vì ba DB và schema không đồng nhất.
- Điều kiện dừng: dừng nếu chưa giải thích được một store, nếu backup chứa binary cache không cần thiết, hoặc export silently bỏ record lỗi.

### P0-05 — Restore journal, rollback và degraded-storage safety

- Commit/package: P0-05 trên `codex/phase-0-release-safety`.
- Mục tiêu: restore staging/validate/commit có journal và recovery; không chuyển durable writes sang RAM mà vẫn báo thành công.
- Dependency: P0-04 ACCEPTED.
- File/module dự kiến: các persistence module, src/ielts-backup.js, startup recovery, settings backup UI; unit/integration/browser fixtures.
- Migration/rollback: additive restore journal/marker; forward-compatible opener; rollback build trong cửa sổ Phase 0 phải mở read-safe hoặc fail incompatible rõ ràng mà không chuyển sang RAM; không hạ DB version; restore legacy bằng adapter.
- Test bắt buộc: crash sau từng DB/store, quota/block/versionchange, corrupted payload, double restore idempotency, rollback build fixture, reload sau degraded write.
- Acceptance criteria: failure giữ last-known-good hoặc recovery tiếp tục deterministically; UI phân biệt durable/temporary/failure; canonical compare sau restart đạt 100%.
- Rủi ro: Critical; bù trừ liên DB không phải transaction thật.
- Điều kiện dừng: dừng nếu restore cần clear DB trước validate, nếu Map fallback được báo “đã lưu”, hoặc old build không mở được upgraded DB.

### P0-06 — Quick Capture và single-Inbox containment

- Commit/package: P0-06 trên `codex/phase-0-release-safety`.
- Mục tiêu: sửa submit async an toàn, đảm bảo draft bền; production chỉ hiển thị một Inbox trong thời gian chờ Phase 1 unification.
- Dependency: P0-00 và P0-05 ACCEPTED.
- File/module dự kiến: src/capture-inbox.js, src/unified-capture-v2.js, src/persistence.js, src/v10-persistence.js, src/main.js; capture unit/browser tests.
- Migration/rollback: migration legacy draft phải copy-verify-delete idempotent; feature flag chọn một UI; rollback giữ cả bản ghi và không migrate ngược tự động.
- Test bắt buộc: submit success/fail, double click, offline/reload, quota/IDB unavailable, migration interruption, duplicate draft, keyboard/mobile.
- Acceptance criteria: form reset chỉ sau durable success; failure giữ input và thông báo; đúng một Inbox visible; không draft nào mất qua reload/migration retry.
- Rủi ro: High do cross-DB draft migration.
- Điều kiện dừng: dừng nếu migration xóa nguồn trước read-back verify hoặc UI fallback mở đồng thời hai Inbox.

### P0-07 — Single-Today containment và exact-launch guard

- Commit/package: P0-07 trên `codex/phase-0-release-safety`.
- Mục tiêu: chỉ một Today production entry; chặn launcher bỏ cardId/skill/source đã lập kế hoạch trước khi Phase 1 viết Runner mới.
- Dependency: P0-01 và P0-00 ACCEPTED.
- File/module dự kiến: src/app.js, src/today-planner-v2.js, src/ielts-lab.js, src/ielts-hub-v2.js, src/primary-ia-v10.js; Today/evidence/browser tests.
- Migration/rollback: không đổi DB; flag chọn entry canonical; plan thiếu target được đánh legacy và không schedule; rollback flag không xóa plan.
- Test bắt buộc: click activity exact target, reload/resume, stale/missing card, duplicate Today selector, mobile nav 5 mục, error repair target.
- Acceptance criteria: chỉ một element/route được gọi Today; launcher không được đổi target; stale activity fail closed; no schedule khi exact executor chưa hỗ trợ.
- Rủi ro: Medium–High, vì temporary containment có thể giảm feature availability.
- Điều kiện dừng: dừng nếu cần suy target bằng selected DOM state hoặc có Today thứ hai vẫn reachable ngoài debug flag.

### P0-08 — Phase 0 independent exit audit

- Commit/package: P0-08 trên `codex/phase-0-release-safety`.
- Mục tiêu: mã hóa và chạy độc lập toàn bộ exit criteria, tạo release checklist có digest.
- Dependency: P0-02, P0-03, P0-05, P0-06 và P0-07 ACCEPTED.
- File/module dự kiến: package.json; scripts/phase0-gate.mjs; tests/phase0-*; docs status/evidence; không thêm feature.
- Migration/rollback: không data migration; rollback bỏ gate script không được coi là rollback sản phẩm.
- Test bắt buộc: clean npm ci; unit/audit/build/server/browser; adversarial evidence matrix; every-store backup sentinel; degraded capture; three-repeat browser run.
- Acceptance criteria: tất cả exit gate xanh tại cùng commit; không skipped/quarantined critical assertion; báo cáo ghi Node/browser/OS/commit và artifact digest.
- Rủi ro: Medium; false green nếu chỉ grep/source assertions.
- Điều kiện dừng: bất kỳ false evidence, mất sentinel, flaky browser, leaked process, duplicate entry hoặc undocumented exception nào đều BLOCKED; Phase 1 không được tạo branch triển khai.

## Phase 1 — Core Product Unification

Exit gate Phase 1: mọi activity giữ exact target từ plan đến receipt; một Today, một Capture Inbox và một Error Repository; transcript có revision canonical; error/attempt/review totals reconcile; không orphan sau migration/retry.

### P1-00 — Forward-compatible DB opener và migration ledger

- Branch/PR: codex/p1-00-migration-ledger.
- Mục tiêu: tạo chung upgrade/versionchange/blocked handling, applied migration ledger và rollback-build compatibility trước mọi schema change.
- Dependency: P0-08 ACCEPTED, hard gate.
- File/module dự kiến: src/persistence*.js, src/ielts-persistence.js, src/v10-persistence.js, module migration mới; fake-indexeddb tests.
- Migration/rollback: chỉ thêm ledger/metadata; future-version fixture phải mở read-safe; không giảm version; migration idempotent theo ID/digest.
- Test bắt buộc: v1→current, interrupted upgrade, double-run, blocked tabs, future DB version, unknown store và rollback build.
- Acceptance criteria: cùng migration không chạy hai lần; version mismatch không rơi vào silent RAM; startup đưa recovery/actionable error.
- Rủi ro: High.
- Điều kiện dừng: dừng nếu build cũ VersionError sau upgrade hoặc cần xóa DB để recover.

### P1-01 — Canonical ActivitySpec, Run, Attempt và Receipt

- Branch/PR: codex/p1-01-learning-contracts.
- Mục tiêu: mở rộng contract Phase 0 thành schema versioned cho planning/execution/evidence ở mọi surface.
- Dependency: P1-00 ACCEPTED.
- File/module dự kiến: module domain contracts mới, src/v10-contracts.js adapters, src/ielts-domain.js adapters, schema tests.
- Migration/rollback: dual-read legacy; target null luôn ineligible; additive new stores/fields qua ledger; rollback giữ records.
- Test bắt buộc: schema/semantic validation, immutable target/source revision, idempotency keys, clock/timezone, malformed/legacy fixtures.
- Acceptance criteria: một canonical type dùng bởi Core/IELTS/V10; Receipt không đổi target/spec; assistance trace append-only; invalid record không schedule.
- Rủi ro: High, là contract trung tâm.
- Điều kiện dừng: dừng nếu phải giữ ba nghĩa khác nhau cho completed/correct/verified.

### P1-02 — Canonical event and evidence repositories

- Branch/PR: codex/p1-02-event-repositories.
- Mục tiêu: persist Run/Attempt/Receipt/EvidenceDecision một lần, project sang review/error/progress bằng adapter idempotent.
- Dependency: P1-01 ACCEPTED.
- File/module dự kiến: persistence repositories mới, src/persistence-core.js, src/ielts-persistence.js, src/v10-persistence.js; integration tests.
- Migration/rollback: append-only events; legacy readers tiếp tục hoạt động qua projections; rollback không xóa canonical events.
- Test bắt buộc: duplicate delivery, out-of-order receipt, crash between event/projection, poison event/dead letter, replay determinism.
- Acceptance criteria: one event ID → at most one FSRS mutation; projection rebuild được; review totals trace đến canonical attempt.
- Rủi ro: Critical.
- Điều kiện dừng: dừng nếu transaction boundary không có idempotency/reconciliation hoặc projectors tự tạo evidence.

### P1-03 — Cross-DB saga và reconciler

- Branch/PR: codex/p1-03-cross-db-reconciler.
- Mục tiêu: giải quyết card + occurrence/candidate/error writes giữa ba DB bằng intent, tombstone và reconciliation.
- Dependency: P1-02 ACCEPTED.
- File/module dự kiến: src/lexical-core-v2.js, persistence modules, startup/runtime reconciler, tests.
- Migration/rollback: backfill intents cho known partial records; additive tombstones; rollback giữ journal và không hard-delete.
- Test bắt buộc: crash ở từng step, duplicate merge, missing Core card, orphan V10 record, retry after reload, poison/dead-letter recovery.
- Acceptance criteria: no silent partial success; orphan audit zero hoặc có actionable quarantined record; merge thực sự hoàn tất thay vì chỉ dispatch event.
- Rủi ro: High.
- Điều kiện dừng: dừng nếu rollback cần reverse hard delete hoặc reconcile không idempotent.

### P1-04 — Unified Capture domain và Inbox cutover

- Branch/PR: codex/p1-04-unified-capture.
- Mục tiêu: một CaptureItem state machine và một Inbox; mọi nguồn nhập dùng cùng quality gate/occurrence linking.
- Dependency: P1-03 ACCEPTED.
- File/module dự kiến: src/capture-inbox.js, src/unified-capture-v2.js, src/lexical-core-v2.js, persistence/adapters, IA/CSS, tests.
- Migration/rollback: copy-verify legacy drafts; mapping ID giữ provenance; legacy UI read-only một release; rollback dùng adapter nhưng không dual-write vô hạn.
- Test bắt buộc: every capture source, duplicate/merge/new card, offline, conflict, migration interruption, large paste/import, accessibility.
- Acceptance criteria: một route/queue count; no lost draft; finalize tạo exact occurrence/candidate/card saga; quality gate nhất quán.
- Rủi ro: High.
- Điều kiện dừng: dừng nếu same draft có thể finalize hai lần hoặc migration không chứng minh cardinality.

### P1-05 — Canonical Transcript aggregate và revision

- Branch/PR: codex/p1-05-transcript-aggregate.
- Mục tiêu: hợp nhất transcript job/cache/segments thành source + immutable revision + stable segment identity + provenance/coverage.
- Dependency: P1-02 ACCEPTED.
- File/module dự kiến: src/ielts-domain.js/persistence, src/v10-contracts.js/persistence, src/transcript-resolver-v2.js adapters; schema/migration tests.
- Migration/rollback: dual-read IELTS/V10 transcript; import legacy thành revision unverified; không xóa cache cũ trong PR; mapping ledger.
- Test bắt buộc: same source different revision, ID stability, duplicate segment, partial coverage, edited revision, retry and rollback fixture.
- Acceptance criteria: workspace/resolver/error records tham chiếu transcriptRevisionId; edit không mutate evidence source cũ; private/shared namespace rõ.
- Rủi ro: High.
- Điều kiện dừng: dừng nếu segment ID dựa vào ordinal chunk hoặc edit có thể đổi answer của attempt lịch sử.

### P1-06 — Global Error Repository và repair scheduler

- Branch/PR: codex/p1-06-error-repository.
- Mục tiêu: một ErrorRecord/occurrence/repair policy; IELTS Sổ lỗi chỉ là filtered view, không scheduler riêng.
- Dependency: P1-02 và P1-05 ACCEPTED.
- File/module dự kiến: src/ielts-lab.js, src/ielts-choice-error-bridge.js, Core error capture, Today adapters, repositories, tests.
- Migration/rollback: import legacy errors với source mapping/dedupe; giữ legacy IDs alias; no hard delete; old view read-only under flag.
- Test bắt buộc: repeated same error, corrected/recurs, source revision, reveal assistance, planned skill, totals reconciliation, migration.
- Acceptance criteria: event-derived totals khớp UI; correction chỉ tạo evidence khi independent/verified; không MutationObserver heuristic làm source of truth.
- Rủi ro: High.
- Điều kiện dừng: dừng nếu expected answer hiện trước independent attempt hoặc cùng occurrence bị đếm hai kho.

### P1-07 — Today Composer

- Branch/PR: codex/p1-07-today-composer.
- Mục tiêu: deterministic plan từ due reviews, repairs, goal/time budget và available content; reason code cho từng activity.
- Dependency: P1-02, P1-04 và P1-06 ACCEPTED.
- File/module dự kiến: src/today-planner-v2.js, src/fsrs-scheduler.js, settings/goal adapter, tests.
- Migration/rollback: old planner available behind rollback flag; plans versioned/snapshotted; không đổi FSRS.
- Test bắt buộc: same input same plan, due-first budget, stale/missing target, repair cap, timezone/day boundary, no-content/no-AI.
- Acceptance criteria: exact ActivitySpec cho mọi row; plan explainable; AI unavailable không làm Today trống; overdue maintenance không bị content mới lấn.
- Rủi ro: Medium–High.
- Điều kiện dừng: dừng nếu composer gọi AI realtime, tự ghi evidence, hoặc target được chọn sau khi user click.

### P1-08 — Today Runner, resume và IA cutover

- Branch/PR: codex/p1-08-today-runner-cutover.
- Mục tiêu: executor registry chạy exact ActivitySpec, resume qua reload, phát Receipt; loại các Today production duplicate.
- Dependency: P1-07 ACCEPTED.
- File/module dự kiến: src/app.js, src/today-planner-v2.js, src/ielts-hub-v2.js/lab.js, src/primary-ia-v10.js, runtime/router/CSS, browser tests.
- Migration/rollback: active legacy session được wrap hoặc hoàn tất ở legacy runner; feature flag rollback; receipts mới vẫn readable.
- Test bắt buộc: exact target/skill/source, crash/reload/resume, back/skip/cancel, stale content, multi-tab, keyboard/mobile and all surface launchers.
- Acceptance criteria: IA chính là Hôm nay · Thu thập · Kho từ · IELTS · Tiến bộ; một Today; 100% receipt target match; phase totals reconcile/no orphan.
- Rủi ro: High, cutover nhiều surface.
- Điều kiện dừng: dừng nếu một launcher bypass registry, resume tạo attempt mới ngoài ý muốn, hoặc Phase 1 exit audit chưa xanh.

## Phase 2 — Caption-first Transcript Resolver

Exit gate Phase 2: caption cache hit không gọi provider; một metadata/whole-track fetch cho healthy caption path; manual ưu tiên auto; raw cue không mất/reorder; sentence ID ổn định qua retry/chunk; job cancel/resume/restart đáng tin; coverage và typed failure được lưu.

### P2-00 — Resolver contract, provider policy và golden corpus

- Branch/PR: codex/p2-00-resolver-contract.
- Mục tiêu: khóa contract VideoSource, ResolverRequest/Job/Event, RawTrack/Cue, SentenceRevision, Coverage và typed errors; lập golden fixtures cho JSON3/VTT/SRV3.
- Dependency: P1-05 và P1-08 ACCEPTED.
- File/module dự kiến: canonical transcript contracts, server/transcript-resolver.mjs adapters, tests/v10-transcript.test.mjs và fixtures mới.
- Migration/rollback: không activate runtime mới; dual-read cache v1; contract version additive.
- Test bắt buộc: manual/auto/no-caption/private/age-restricted/deleted/429/timeout, Unicode/entities, rolling/karaoke/repeated speech, malformed timestamps.
- Acceptance criteria: provider order deterministic; error type quyết định retry/fallback; stable source/cache identity không phụ thuộc chunk range; fixtures có expected raw + normalized output.
- Rủi ro: High vì parser/identity sai sẽ làm hỏng progress.
- Điều kiện dừng: dừng nếu chưa chốt canonical URL/language/track key, hoặc normalizer cần drop cue để test pass.

### P2-01 — Durable resolver job repository và SSE state machine

- Branch/PR: codex/p2-01-resolver-jobs.
- Mục tiêu: queued→resolving→partial→complete/failed/cancelled, lease/heartbeat/idempotency, progress SSE và restart recovery.
- Dependency: P2-00 ACCEPTED.
- File/module dự kiến: server/server.mjs, server/transcript-resolver.mjs, canonical persistence/job repo, client API, server tests.
- Migration/rollback: additive job store qua ledger; in-memory jobs cũ không migrate; endpoint v1 giữ sau flag; rollback không xóa jobs/artifacts.
- Test bắt buộc: duplicate POST, disconnect/reconnect with Last-Event-ID, restart, lease expiry, cancel/race, out-of-order event, poison job, multi-client.
- Acceptance criteria: cùng request chỉ một active job; SSE replay không mất/nhân event; restart resume hoặc fail typed; no stuck processing.
- Rủi ro: High, concurrency/process lifecycle.
- Điều kiện dừng: dừng nếu job state chỉ ở Map RAM, cancel chỉ đổi UI state, hoặc retry tạo provider bill trùng.

### P2-02 — Safe yt-dlp capability, metadata và track selection

- Branch/PR: codex/p2-02-ytdlp-adapter.
- Mục tiêu: yt-dlp là desktop/server adapter có health/version check; một metadata call; ưu tiên caption manual rồi auto; không lấy cookie/proxy tự động.
- Dependency: P2-01 ACCEPTED.
- File/module dự kiến: server/transcript-resolver.mjs, scripts/transcript-companion.mjs, server config/security, mocked process tests.
- Migration/rollback: không data migration; adapter kill switch; legacy provider endpoint còn fallback trong cửa sổ rollback.
- Test bắt buộc: pinned/minimum version, missing binary, timeout, hostile URL/args, manual/auto language choice, playlist rejection, process tree cancel, stderr redaction.
- Acceptance criteria: browser không chạy yt-dlp; client input không trở thành CLI args; duration/title/source/track provenance được persist; exactly one metadata invocation per job.
- Rủi ro: High về platform/security/provider drift.
- Điều kiện dừng: dừng nếu cần shell interpolation, đọc browser cookies mặc định, hoặc không kill được process tree.

### P2-03 — Whole-track artifact cache và standards parsers

- Branch/PR: codex/p2-03-whole-track-cache.
- Mục tiêu: tải caption track một lần; lưu raw artifact content-addressed; parser riêng JSON3, WebVTT, SRV3/TTML.
- Dependency: P2-02 ACCEPTED.
- File/module dự kiến: server transcript parser modules mới, filesystem/cache adapter, canonical persistence references, golden tests.
- Migration/rollback: range cache v1 dual-read nhưng không promote nếu coverage thiếu; cache namespace v2; raw track immutable; rollback giữ artifacts.
- Test bắt buộc: atomic write, corrupt/truncated cache, restart/cache hit, content type mismatch, VTT notes/styles, JSON3 events, XML namespaces/entities.
- Acceptance criteria: cache hit zero provider/yt-dlp call; SHA/length verified; no SRV3 fed into JSON parser; binary/text handled correctly.
- Rủi ro: Medium–High.
- Điều kiện dừng: dừng nếu cache key theo start/end, active artifact được publish trước hash verify, hoặc parser regex làm mất cue hợp lệ.

### P2-04 — Rolling-caption normalizer và stable sentence IDs

- Branch/PR: codex/p2-04-caption-normalizer.
- Mục tiêu: dedupe rolling overlap, ghép fragment thành câu, tính timing/coverage và stable IDs; giữ raw cue bất biến.
- Dependency: P2-03 ACCEPTED.
- File/module dự kiến: normalizer module mới, transcript contracts, migration aliases, golden/property tests.
- Migration/rollback: normalizerVersion tạo derived revision mới; user edit không bị overwrite; ID aliases/tombstones cho split/merge; old revision readable.
- Test bắt buộc: prefix/suffix overlap, repeated legitimate phrase, punctuation absent, speaker change, long cue, Unicode, boundary retry, deterministic re-run.
- Acceptance criteria: fixture không drop/reorder token; same raw track+version cùng IDs; coverage gaps explicit; progress mapping có confidence/quarantine.
- Rủi ro: High, false dedupe phá nội dung học.
- Điều kiện dừng: dừng nếu dùng ordinal chunk làm identity, hoặc collision/orphan progress không được quarantine.

### P2-05 — Progressive client, deterministic orchestration và cancellation

- Branch/PR: codex/p2-05-progressive-client.
- Mục tiêu: IndexedDB canonical → eligible shared cache → manual caption → auto caption → approved provider; mở batch đầu, append SSE; abort loser/costly request.
- Dependency: P2-01 và P2-04 ACCEPTED.
- File/module dự kiến: src/transcript-resolver-v2.js, src/video-workspace-v2.js adapter only, server client; unit/integration/browser tests.
- Migration/rollback: dual-read legacy range cache; new client behind flag; partial job/coverage persisted; rollback opens completed canonical revision.
- Test bắt buộc: cache-first, partial events, network drop/resume, cancel, provider failure transition, dedupe on reconnect, no-caption typed UX.
- Acceptance criteria: không race all providers; không gọi paid/cloud fallback khi caption/cache thành công; UI nhận usable rows trước full completion; request losers aborted.
- Rủi ro: High, race and duplicate state.
- Điều kiện dừng: dừng nếu complete được suy từ last timestamp đơn thuần, hoặc background append đổi active sentence ID.

### P2-06 — Resolver observability và Phase 2 exit gate

- Branch/PR: codex/p2-06-resolver-exit-gate.
- Mục tiêu: privacy-safe timings/coverage/provider reason và acceptance matrix cho caption path.
- Dependency: P2-05 ACCEPTED.
- File/module dự kiến: scripts/tests resolver acceptance, diagnostic UI/log schema, CI; không thêm provider mới.
- Migration/rollback: telemetry opt-out/local aggregation; no raw transcript/URL in diagnostics by default; rollback removes projection only.
- Test bắt buộc: ≥10 controlled fixtures/videos across track types, cache/restart/cancel/retry, long track, rate limit, Windows/macOS/Linux adapter fixtures.
- Acceptance criteria: cache hit first usable p95 target ≤2s; healthy caption first usable p95 target ≤10s; 20-minute healthy caption full rail p95 target ≤30s trong controlled matrix; zero token loss/duplicate and zero leaked process.
- Rủi ro: Medium; SLO không phải lời hứa cho mọi video.
- Điều kiện dừng: any missing/drop/duplicate fixture, live failure không typed, or shared cache stores ineligible private artifact.

## Phase 3 — Full-video Learning Workspace

Exit gate Phase 3: desktop bám interaction model video trái/transcript phải; mobile usable; rail progressive và seek chính xác; Strict Practice không có answer trong visible/hidden exercise DOM, ARIA/accessibility text, data attributes hoặc exercise-specific rendered state trước khi nộp; Practice ghi assistance; Retell lưu/evaluate thật hoặc coaching-only; edit tạo revision; mọi activity phát canonical receipt. Strict Practice is not a tamper-resistant examination boundary against a device owner inspecting canonical local data.

### P3-00 — Workspace shell, route và state controller

- Branch/PR: codex/p3-00-workspace-shell.
- Mục tiêu: một controller/route cho player, controls, mode panel và transcript rail; loại double handler/legacy workspace handoff.
- Dependency: P2-06 ACCEPTED.
- File/module dự kiến: src/video-workspace-v2.js, src/ielts-hub-v2.js, src/youtube-sentence-player.js, router/runtime, public/video-workspace-v2.css.
- Migration/rollback: không DB migration; feature flag về legacy Media Lab; canonical transcript/progress giữ nguyên.
- Test bắt buộc: open/close/back/deep link, one handler, empty/loading/error/partial state, keyboard focus restoration.
- Acceptance criteria: desktop hai pane; route không remount mất job/progress; editor/practice share same active revision/controller.
- Rủi ro: Medium.
- Điều kiện dừng: dừng nếu hai component cùng sở hữu active sentence hoặc click tạo hai submit/capture events.

### P3-01 — Player/rail sync, progressive rows và virtualization

- Branch/PR: codex/p3-01-progressive-rail.
- Mục tiêu: append sentence trong nền; click row seek; timeupdate chọn row; long transcript virtualized mà giữ focus/active row.
- Dependency: P3-00 ACCEPTED.
- File/module dự kiến: workspace/player, transcript rail component, CSS, tests/video-workspace-static.test.mjs, browser fixtures.
- Migration/rollback: no data migration; derived UI state from revision/job; rollback uses non-virtual rail for capped length.
- Test bắt buộc: append không reset focus, seek accuracy, overlap/gap, active row auto-scroll opt-out, 1k rows performance, reload/resume.
- Acceptance criteria: first usable batch opens workspace; current segment exact; seek fixture error ≤750ms; no row duplicate/reorder.
- Rủi ro: Medium–High for focus/performance.
- Điều kiện dừng: dừng nếu virtualization removes active accessible row without equivalent semantics or progress append changes IDs.

### P3-02 — Normal, Noticing và Shadowing modes

- Branch/PR: codex/p3-02-visible-transcript-modes.
- Mục tiêu: normal/shadowing giữ transcript visible như ảnh; A–B/repeat/speed controls; Shadowing là coaching-only với honest receipt.
- Dependency: P3-01 ACCEPTED.
- File/module dự kiến: src/sentence-learning-loop.js, workspace/player, activity executor, CSS, tests.
- Migration/rollback: additive mode progress/receipt; no FSRS migration; rollback reader ignores mode metadata.
- Test bắt buộc: loop boundaries, speed/repeat, sentence navigation, Shadowing completion/reload, no schedule/evidence, keyboard/screen reader labels.
- Acceptance criteria: normal rail readable; Shadowing never affects FSRS; receipt records exposure/assistance and exact segment.
- Rủi ro: Low–Medium.
- Điều kiện dừng: dừng nếu Shadowing success được dùng để unlock/review hoặc control state diverges from player.

### P3-03 — Strict/Practice Dictation và answer masking

- Branch/PR: codex/p3-03-dictation-masking.
- Mục tiêu: Strict dùng placeholder không suy answer; Practice có thể dot-mask/hint nhưng ghi assisted; submit mới reveal current transcript + diff.
- Dependency: P3-01 và P1-01 Evidence contract ACCEPTED.
- File/module dự kiến: sentence loop, transcript rail, EvidencePolicy adapter, public CSS, DOM/a11y/clipboard tests.
- Migration/rollback: AssistanceTrace additive; attempt v1 không tự nâng independent; UI flag rollback nhưng policy remains deny.
- Test bắt buộc: DOM, accessibility tree, attributes, title, selection/clipboard, live regions, rolling-overlap neighbor leakage, reveal/hint trace.
- Acceptance criteria: answer của target không tồn tại trước strict submit; các row liên quan không vô tình lộ; after submit only appropriate text/diff appears; Practice never labeled independent.
- Rủi ro: Critical for learning validity/accessibility.
- Điều kiện dừng: dừng nếu chỉ blur/color/CSS-hide plaintext, dot count leaks in Strict, hoặc UI truyền independent=true trực tiếp.

### P3-04 — Retell capture, evaluation và evidence policy

- Branch/PR: codex/p3-04-real-retell.
- Mục tiêu: text/voice learner output được persist; target preselected; evaluator target-level có abstain; không evaluator thì coaching-only.
- Dependency: P3-03 và P1-02 repositories ACCEPTED.
- File/module dự kiến: sentence loop, media/player capture, server/ielts-api.mjs evaluator adapter, evidence policy, tests/browser.
- Migration/rollback: old completion without output becomes legacy-unverified; provider kill switch; drafts retained; no synthetic backfill.
- Test bắt buộc: empty/skip/copied source/wrong sense/omitted target, provider timeout/malformed/low confidence, reload draft, denied microphone.
- Acceptance criteria: every complete Retell has learner output or explicit coaching skip; AI assessment cannot directly schedule; only preselected targets can receive eligible decision.
- Rủi ro: High for false-positive evaluation/privacy.
- Điều kiện dừng: dừng nếu whole-response score áp cho mọi card, provider failure loses output, hoặc current IELTS browser Retell path still red.

### P3-05 — Inline transcript editor và immutable revisions

- Branch/PR: codex/p3-05-transcript-editor.
- Mục tiêu: edit text/timing/split/merge/review ngay rail; optimistic conflict UI; raw/provider track immutable.
- Dependency: P1-05 and P3-01 ACCEPTED.
- File/module dự kiến: workspace/editor, transcript repository/revision aliases, progress mapping, CSS/tests.
- Migration/rollback: every save creates revision; split/merge alias/tombstone; attempts remain bound old revision; rollback hides editor but retains revisions.
- Test bắt buộc: concurrent/background provider update, split/merge, undo draft, reload, progress/source occurrence/error links, verification status.
- Acceptance criteria: no silent last-write-wins; user edit never overwritten; old attempt answer remains reproducible; new Dictation uses selected verified revision.
- Rủi ro: High.
- Điều kiện dừng: dừng nếu edit mutates existing revision or creates orphan attempt/progress.

### P3-06 — Responsive, accessibility và Phase 3 exit gate

- Branch/PR: codex/p3-06-workspace-exit-gate.
- Mục tiêu: hoàn thiện breakpoint/mobile rail drawer, 5-item nav, WCAG interaction checks và live browser matrix.
- Dependency: P3-02, P3-03, P3-04 và P3-05 ACCEPTED.
- File/module dự kiến: public/video-workspace-v2.css, public/v10.css, public/v10-ia.css, IA/workspace JS, browser/axe-equivalent/manual checklist.
- Migration/rollback: no data migration; CSS/route flag; behavior contracts remain.
- Test bắt buộc: 320/375/768/1024/1440 widths, zoom 200%, keyboard-only, screen reader semantics, reduced motion, contrast/focus, long text, Chrome/Edge.
- Acceptance criteria: no horizontal overflow; all controls named/reachable; active/masked state announced without answer; desktop interaction matches reference model, mobile keeps player and rail usable.
- Rủi ro: Medium.
- Điều kiện dừng: dừng nếu strict answer leaks through a11y, five nav items overlap, or any critical browser path can skip silently.

## Phase 4 — Remote Content Platform MVP

Exit gate Phase 4: app tải catalog/packs từ remote origin tin cậy; catalog/pack tamper bị reject; install crash-safe và giữ last-known-good; xóa asset giữ progress/error/vocabulary provenance; offline mở được pack; Starter Pack 24 bài đã qua rights, deterministic validation và human review; app bundle không chứa toàn bộ library.

### P4-00 — Content, rights và review contracts v2

- Branch/PR: codex/p4-00-content-contracts.
- Mục tiêu: schema chung Catalog/Pack/ContentEnvelope; schema riêng Reading/Listening/LexicalSet/Exercise; immutable IDs/revisions, asset digest/bytes/media, RightsRecord và HumanReview.
- Dependency: P1-01 và P1-05 ACCEPTED; có thể bắt đầu khi Phase 2/3 đang triển khai.
- File/module dự kiến: schemas/content/v2/, src/v10-contracts.js, src/content-platform.js dual-read adapter, tests/v10-content.test.mjs.
- Migration/rollback: no DB bump; reader v1/v2; content v1 gắn legacy-unverified, vẫn mở coaching nhưng không tạo evidence; rollback flag về v1.
- Test bắt buộc: JSON/schema + semantic fixtures, broken refs, changed answer with reused activity ID, missing asset rights/digest, locale/accent variants, answer-key boundary.
- Acceptance criteria: app và content factory pin cùng schema digest; không dùng verified:boolean thay rights/review; LexicalSet không chứa FSRS/card state.
- Rủi ro: High, contract khó đổi sau publish.
- Điều kiện dừng: dừng nếu chưa biểu diễn được asset-level rights, revision-safe progress, audio variants, lexical sense identity hoặc reviewer roles.

### P4-01 — Remote catalog trust, signing và last-known-good

- Branch/PR: codex/p4-01-remote-catalog.
- Mục tiêu: HTTPS allowlist, detached signature/key ID, ETag/expiry, downgrade protection, app/schema compatibility và atomic active catalog pointer.
- Dependency: P4-00 ACCEPTED và staging endpoint/key-rotation runbook được phê duyệt.
- File/module dự kiến: src/content-platform.js, app config/settings, server security/CORS config, tests.
- Migration/rollback: catalog metadata additive; local catalog remains fallback until staging acceptance; rollback pointer/flag, never overwrite prior signed catalog.
- Test bắt buộc: 200/304/offline, expired, unknown/rotated key, signature/hash mismatch, downgrade/replay, hostile origin, incompatible app/schema.
- Acceptance criteria: tampered catalog never activates; failure preserves installed/last-known-good; no private signing key/client secret in app; remote origin fixed/allowlisted.
- Rủi ro: High for key management/distribution outage.
- Điều kiện dừng: dừng nếu endpoint is user-supplied arbitrary URL, key rotation/revocation absent, or catalog failure hides installed packs.

### P4-02 — Content-addressed asset cache và atomic Pack Installer

- Branch/PR: codex/p4-02-pack-installer.
- Mục tiêu: download→staging→verify all→atomic activate; SHA-256 blobs/refcount, resume/cancel, no text conversion for binary audio.
- Dependency: P4-01 và P1-00 migration ledger ACCEPTED.
- File/module dự kiến: src/content-platform.js, src/v10-persistence.js/contracts, public/sw.js, CacheStorage adapter, pack installer tests.
- Migration/rollback: additive stores packInstalls/blobRefs/downloadJobs/contentStubs; cache namespace v2; legacy cache dual-read; rollback flag retains new stores/cache and active v1.
- Test bắt buộc: crash after every asset, corrupt/length mismatch, quota, retry/idempotency, shared blob refcount, concurrent tabs, last-known-good switch, binary audio.
- Acceptance criteria: staging invisible until all required assets verify; one-byte tamper fails; partial install never shows “Đã tải”; shared blob stored once.
- Rủi ro: Critical, IndexedDB + CacheStorage atomicity is a saga.
- Điều kiện dừng: dừng nếu activate precedes verification, rollback requires DB version downgrade/delete, or eviction can delete learner progress.

### P4-03 — Pack lifecycle UX, offline, update/delete và backup

- Branch/PR: codex/p4-03-pack-lifecycle.
- Mục tiêu: Tải/Đang tải/Hủy/Đã tải/Có bản mới/Xóa bản tải; show size/version/rights/offline; delete blobs but retain progress.
- Dependency: P4-02 ACCEPTED.
- File/module dự kiến: src/ielts-hub-v2.js, src/content-platform.js, V10 persistence, combined backup, service worker, public/v10.css, browser tests.
- Migration/rollback: backup vNext includes progress/stubs/active metadata, not reconstructable blobs; restore validates then re-links/re-downloads; rollback UI keeps records.
- Test bắt buộc: install/offline/restart/update/uninstall/reinstall, shared assets, storage.persist allow/deny, quota/eviction, reset/restore, revoked/deprecated pack.
- Acceptance criteria: uninstall frees unreferenced blobs while contentProgress/errors/cards/occurrences survive; reinstall resumes history; backup canonical compare 100%.
- Rủi ro: High.
- Điều kiện dừng: dừng if uninstall cascades learner records, “offline” lies after partial install, or V10 progress/stubs remain absent from backup.

### P4-04 — External content repository, rights registry và CI

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p4-04-content-repo-scaffold.
- Mục tiêu: source-of-truth tách app runtime khỏi briefs/sources/rights/masters/reviews/packaging; deterministic build và protected publish.
- Dependency: P4-00 ACCEPTED; repository, storage/CDN và content owner must be provisioned.
- File/module dự kiến: external briefs/, sources/, rights/, masters/, schemas-pinned/, packs/, reviews/, validator CLI, CI, CODEOWNERS; app repo chỉ pin endpoint/schema digest.
- Migration/rollback: no learner DB migration; remote activation remains off; Git LFS/private object storage for masters, published immutable blobs on CDN.
- Test bắt buộc: schema digest match, SPDX/rights evidence, asset metadata via media probe, no secret/private permission doc in artifact, reproducible pack hash.
- Acceptance criteria: same input builds same digest twice; missing rights/reviewer fails CI; publishing identity separated from generator/reviewer.
- Rủi ro: Medium–High, organizational/legal dependency.
- Điều kiện dừng: dừng nếu external repo/CDN owner chưa có, rights evidence would become public, or binary masters must be bundled into app Git.

### P4-05 — Human-authored three-lesson sampler

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p4-05-sampler.
- Mục tiêu: chứng minh full editorial/install pipeline với 1 Listening audio người thật, 1 Reading và 1 Lexical Set trước AI/batch scale.
- Dependency: P4-04 and P4-01 staging ACCEPTED.
- File/module dự kiến: external source/right/master/lesson/review/pack records; catalog staging pointer; no bundled app lesson.
- Migration/rollback: immutable sampler release; rollback catalog pointer/deprecate; never overwrite asset URL.
- Test bắt buộc: rights/attribution, audio-transcript timing/accent review, answer/evidence uniqueness, accessibility, install/open/offline/update/uninstall.
- Acceptance criteria: 3/3 human approved and remotely usable; Listening never falls back to TTS; app calls no AI to open lesson.
- Rủi ro: Medium plus editorial cost.
- Điều kiện dừng: dừng nếu accent/license is self-declared without reviewer/evidence, lesson has answer leakage, or “verified” comes only from validator.

### P4-06 — IELTS Foundations Week 1 pack

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p4-06-foundations-week-1.
- Mục tiêu: 6 micro-lessons gồm 2 Listening, 2 Reading, 2 Lexical Sets; establish coverage rubric and size budget.
- Dependency: P4-05 ACCEPTED.
- File/module dự kiến: external content/rights/audio/reviews/pack/catalog staging records.
- Migration/rollback: immutable pack/version; rollback catalog pointer/deprecate; progress keyed stable content/activity IDs.
- Test bắt buộc: all schema/rights/human QA, audio alignment, distractor/evidence, offline install, duplicate IDs, pack size target ≤8 MB.
- Acceptance criteria: 6/6 approved, no critical linguistic/rights/a11y defect, coverage matrix recorded, no app bundle growth from assets.
- Rủi ro: Medium–High editorial.
- Điều kiện dừng: critical defect, missing per-lesson reviewer, accidental objective/topic duplication, or asset overwrite.

### P4-07 — IELTS Foundations Week 2 pack

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p4-07-foundations-week-2.
- Mục tiêu: thêm 6 bài, bù topic/accent/skill coverage còn thiếu Week 1.
- Dependency: P4-06 ACCEPTED and Week 1 defect review completed.
- File/module dự kiến: external content repository only plus immutable catalog entry.
- Migration/rollback: new immutable pack; deprecate/repoint to rollback; no rewrite Week 1.
- Test bắt buộc: same pack gates as P4-06 plus cross-pack ID/coverage/asset dedupe.
- Acceptance criteria: 12 cumulative lessons, balanced coverage per locked matrix, no regression install/update/shared blobs.
- Rủi ro: Medium.
- Điều kiện dừng: unresolved critical learner defect from Week 1 or reviewers batch-sign without inspecting each lesson.

### P4-08 — IELTS Foundations Week 3 pack

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p4-08-foundations-week-3.
- Mục tiêu: thêm 6 bài với deliberate difficulty progression and lexical recycling without answer memorization.
- Dependency: P4-07 ACCEPTED.
- File/module dự kiến: external content repository only plus immutable catalog entry.
- Migration/rollback: new immutable pack; catalog rollback/deprecate; stable activity IDs only when semantics/answer unchanged.
- Test bắt buộc: P4-06 gates, difficulty rubric, lexical recurrence audit, no duplicated answer pattern, install under storage pressure.
- Acceptance criteria: 18 cumulative approved lessons; difficulty/recycling evidence documented; offline/update stable.
- Rủi ro: Medium.
- Điều kiện dừng: difficulty claim lacks rubric/reviewer evidence or recycling leaks answers.

### P4-09 — IELTS Foundations Week 4 pack

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p4-09-foundations-week-4.
- Mục tiêu: hoàn tất Starter Pack 24 bài và coverage B1–C1 đã định nghĩa, không tuyên bố “IELTS official”.
- Dependency: P4-08 ACCEPTED.
- File/module dự kiến: external content repository only plus production candidate catalog.
- Migration/rollback: immutable release; staged/canary pointer before production; prior catalog remains last-known-good.
- Test bắt buộc: P4-06 gates, cumulative 24-item audit, content claims/branding, full pack offline/update/uninstall/reinstall.
- Acceptance criteria: 24/24 rights + human approvals; 8 B1, 10 B2, 6 C1 target or documented approved deviation; no AI wait at learning time.
- Rủi ro: Medium–High.
- Điều kiện dừng: any lesson lacks rights/review, target distribution changed without decision, or production pointer cannot rollback atomically.

### P4-10 — Remote Content Platform exit gate

- Branch/PR: codex/p4-10-content-platform-exit.
- Mục tiêu: independent end-to-end acceptance across app, CDN, packs, backup and offline lifecycle.
- Dependency: P4-03 and P4-09 ACCEPTED.
- File/module dự kiến: app acceptance scripts/fixtures, content repository release manifest, CI evidence docs; no new feature.
- Migration/rollback: no new migration; validate rollback install/catalog and old app compatibility.
- Test bắt buộc: tamper/revocation/downgrade/CDN outage, crash install, quota/evict, all 24 lessons, backup/reset/restore, delete/reinstall, bundle size comparison.
- Acceptance criteria: every Phase 4 exit gate passes at bound app/content commits and catalog digest; adding packs does not materially grow application JS/static bundle.
- Rủi ro: Medium.
- Điều kiện dừng: any critical content/rights/integrity defect, unavailable rollback, lost progress, or unpublished dependency.

## Phase 5 — ASR and Cloud Fallback

Exit gate Phase 5: caption path remains first; local ASR is desktop-first, cancellable and privacy-preserving; Gemini is explicit opt-in with cost/privacy disclosure; mobile has server/Gemini/import routes; failed ranges resume; raw media cleanup is proven; private artifact never enters shared cache.

### P5-00 — Capability, consent, privacy và fallback contract

- Branch/PR: codex/p5-00-fallback-policy.
- Mục tiêu: capability matrix desktop/mobile, eligible provider order, consent version, cost/privacy copy, artifact retention and sharing policy.
- Dependency: P2-06 ACCEPTED; Phase 3 UI not required.
- File/module dự kiến: resolver contracts/settings/UI, privacy policy docs/config, tests.
- Migration/rollback: additive consent/provider settings; defaults local/private and cloud off; rollback preserves explicit consent record but disables adapter.
- Test bắt buộc: no-caption on desktop/mobile, consent accept/decline/version change, private URL, rights unknown, offline/no key/no binary.
- Acceptance criteria: shared transcript cache default OFF; only public/no-auth/no-cookie/rights-eligible artifact can opt into shared-public namespace; mobile never advertises local yt-dlp/Whisper when unavailable.
- Rủi ro: High privacy/legal.
- Điều kiện dừng: dừng nếu provider/cloud is called before consent, provenance/namespace absent, or rights policy chưa phê duyệt.

### P5-01 — Secure local companion process and media extraction

- Branch/PR: codex/p5-01-local-companion.
- Mục tiêu: desktop companion health/auth, allowlisted requests, yt-dlp/FFmpeg media extraction to task temp dir, resource limits and process-tree cancellation.
- Dependency: P5-00 ACCEPTED.
- File/module dự kiến: scripts/transcript-companion.mjs, server/local companion modules, resolver adapter, process tests.
- Migration/rollback: no learner DB migration; kill switch; temp artifacts TTL/cleanup journal; rollback leaves no daemon/autostart.
- Test bắt buộc: malicious URL/args/path traversal, missing binaries, duration/disk caps, crash/cancel/restart, temp cleanup, loopback auth/CORS.
- Acceptance criteria: bind loopback only; client cannot select file paths/CLI flags; all success/error/cancel paths cleanup; no automatic browser cookies.
- Rủi ro: Critical local security/process control.
- Điều kiện dừng: shell interpolation, exposed LAN binding, orphan process/media, or unbounded download.

### P5-02 — Local Whisper/faster-whisper first usable batch

- Branch/PR: codex/p5-02-local-asr.
- Mục tiêu: optional model management, FFmpeg/VAD chunks and progressive local ASR for captionless authorized media.
- Dependency: P5-01 ACCEPTED.
- File/module dự kiến: companion ASR adapter/model manager, resolver job events, settings/status UI, fixtures.
- Migration/rollback: model files reconstructable cache, not backup; ASR revision provenance additive; adapter off preserves transcript.
- Test bắt buộc: model absent/download/corrupt, CPU-only, accents/noise/silence, first batch, cancel, low disk, no-network after model install.
- Acceptance criteria: first usable sentence batch emitted without full job wait; model size/storage disclosed; transcript initially needs-review; caption path still wins.
- Rủi ro: High performance/storage/accuracy.
- Điều kiện dừng: UI freezes, model silently auto-downloads, ASR result marked verified, or raw audio retained by default.

### P5-03 — Chunk overlap, failed-range resume and cleanup

- Branch/PR: codex/p5-03-asr-resume.
- Mục tiêu: VAD/chunk overlap normalization, per-range checkpoints, retry failed ranges, deterministic merge and complete cancel cleanup.
- Dependency: P5-02 and P2-04 ACCEPTED.
- File/module dự kiến: ASR orchestrator/normalizer, resolver jobs/persistence, diagnostic UI, property/integration tests.
- Migration/rollback: job checkpoint schema additive; old ASR job can restart whole source; raw audio TTL; rollback ignores checkpoints.
- Test bắt buộc: crash every chunk, repeated boundary speech, silence, retry subset, out-of-order result, cancel during FFmpeg/model inference, disk full.
- Acceptance criteria: successful ranges never recompute unnecessarily; no dropped/duplicate boundary tokens in corpus; restart resume works; no temp leak.
- Rủi ro: High.
- Điều kiện dừng: merge unstable across retry, cancel cannot stop child processes, or cleanup requires deleting user-owned file.

### P5-04 — Gemini opt-in fallback

- Branch/PR: codex/p5-04-gemini-opt-in.
- Mục tiêu: cloud fallback only after explicit per-policy consent; chunk/file lifecycle, cost cap, provenance, retry/429 and needs-review state.
- Dependency: P5-00 and P2-01 durable jobs ACCEPTED; independent from local ASR completion but ordered after caption in policy.
- File/module dự kiến: server/ielts-api.mjs, resolver provider adapter, settings/consent UX, secure config, tests.
- Migration/rollback: versioned consent; provider kill switch; stored output remains private/local; no API key in client/backup.
- Test bắt buộc: consent absent/declined, timeout/429/malformed output, cost/duration cap, file upload cleanup, provider retry idempotency, redacted logs.
- Acceptance criteria: zero cloud request before consent; user sees data/retention/cost; output not automatically verified/shared; paid fallback not called after earlier success.
- Rủi ro: Critical privacy/cost/provider drift.
- Điều kiện dừng: secret/raw private data leaks to logs/cache, files persist beyond policy, or app silently opts in.

### P5-05 — Mobile/import rescue UX và Phase 5 exit gate

- Branch/PR: codex/p5-05-fallback-exit.
- Mục tiêu: mobile chooses approved server/Gemini/import SRT/VTT/text; actionable errors for private/age/no-caption; accept full fallback matrix.
- Dependency: P5-03 and P5-04 ACCEPTED.
- File/module dự kiến: workspace/resolver UI, import validator/editor, mobile CSS/browser scripts, acceptance fixtures.
- Migration/rollback: imported source creates private unverified revision; flag hides cloud/local adapters independently; data remains exportable.
- Test bắt buộc: desktop and mobile capability matrix, import malformed/timingless/duplicate, private/age/deleted, provider outage, local/cloud cancel, backup/restore.
- Acceptance criteria: every unsupported case has safe recovery path; mobile does not dead-end or claim local companion; first usable/cancel/cleanup targets pass; private artifacts never shared.
- Rủi ro: Medium–High.
- Điều kiện dừng: mobile requires desktop-only binary, import bypasses validation, or Phase 0 durability/evidence regression appears.

## Phase 6 — Content Factory and Scale

Exit gate Phase 6: generator output chỉ là draft; deterministic validators bắt buộc; critic là advisory ở MVP và không thay human review; publish immutable/signature-protected; rights/defect/canary rollback có audit trail; không có đường AI→production catalog trực tiếp.

### P6-00 — External factory job, provenance và coverage brief

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p6-00-factory-jobs.
- Mục tiêu: durable batch job/lease/idempotency; pin model/prompt/input/output/schema digest; coverage brief machine-readable.
- Dependency: P4-10 ACCEPTED.
- File/module dự kiến: external factory/jobs/, generators/, provenance/, briefs/coverage-matrix.json, CI/tests; remove public publishing authority from learner-side factory by later app adapter.
- Migration/rollback: external jobs only; existing learner aiJobs remain personal-private/legacy and cannot publish public content; cancel/quarantine is rollback.
- Test bắt buộc: double worker claim, lease expiry, crash/resume, duplicate input, budget cap, provenance completeness and schema pin.
- Acceptance criteria: one request→one artifact lineage; no job credential can publish production; learner does not wait for batch job.
- Rủi ro: Medium.
- Điều kiện dừng: dừng nếu retry duplicates artifact/job, model output lacks traceable digests, or public factory remains mounted on learner idle path.

### P6-01 — Batch generator and deterministic validators

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p6-01-batch-validator.
- Mục tiêu: structured draft generation; schema, references, answer uniqueness, evidence, lexical sense, media, rights and prohibited-claim validators.
- Dependency: P6-00 ACCEPTED.
- File/module dự kiến: external factory/generators/, validators/, gold/adversarial fixtures, quarantine artifacts, CI.
- Migration/rollback: draft artifact only; no catalog/learner DB migration; validator versions stored; rollback re-runs old validator without promoting failed drafts.
- Test bắt buộc: malformed JSON, ambiguous distractor, unsupported answer/evidence, answer copy, missing rights, prompt injection, reproducible pack inputs.
- Acceptance criteria: every known critical fixture rejected/quarantined; validation is deterministic; AI output never receives verified/published status from syntax alone.
- Rủi ro: Medium–High; semantic false acceptance.
- Điều kiện dừng: dừng if structured output is treated as semantic truth, validator can mutate source silently, or failing draft reaches review-ready.

### P6-02 — Advisory critic, human review and protected publisher

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p6-02-review-publisher.
- Mục tiêu: optional independent critic findings + required human roles for linguistic, IELTS construct, audio and rights; immutable signed publish via protected environment.
- Dependency: P6-01 ACCEPTED.
- File/module dự kiến: external factory/critics/, reviews/, publisher/, protected CI, rubric/CODEOWNERS; staging catalog.
- Migration/rollback: critic optional/advisory for MVP; human decision mandatory; fix after publish makes new revision; catalog pointer/canary rollback.
- Test bắt buộc: critic disagreement, unresolved critical finding, missing reviewer role, same identity generate+approve, key/secret scan, reproducible/signature verify.
- Acceptance criteria: AI cannot self-approve; all required human approvals bound exact digest; signing key outside repo/app; audit trail to commit/job/reviewer.
- Rủi ro: High governance/key management.
- Điều kiện dừng: dừng if one automated identity generates/approves/publishes, critical finding unresolved, or published asset mutable.

### P6-03 — Rights/defect registry and learner reporting

- Branch/PR: codex/p6-03-content-defects.
- Mục tiêu: app gửi structured defect report without answer/PII leak; external registry triages linguistic/media/rights; revoke/deprecate/replace with audit trail.
- Dependency: P6-02 and P4-03 ACCEPTED.
- File/module dự kiến: app content report UI/API/contracts; external defects/, rights registry, catalog revocation pipeline; tests.
- Migration/rollback: defect records additive and private; content replacement new revision; rollback disables submit endpoint but keeps local draft; no mutation old pack.
- Test bắt buộc: offline queue/retry/dedupe, redaction, revoked content installed/offline, replacement preserves progress mapping, abuse/rate limit.
- Acceptance criteria: report traces content/revision/segment without exposing learner answer by default; critical rights issue can revoke discovery while preserving local learning data/export.
- Rủi ro: High privacy/operations.
- Điều kiện dừng: dừng if report leaks transcript/user content unnecessarily, revoke deletes progress, or no response owner/SLA exists.

### P6-04 — First scale canary pack

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p6-04-scale-canary.
- Mục tiêu: produce one additional pack through factory pipeline to measure yield, reviewer effort, defect escape and rollback; not bulk publish.
- Dependency: P6-02 and P6-03 ACCEPTED.
- File/module dự kiến: external briefs/drafts/reviews/pack/release metrics; staging→small canary catalog.
- Migration/rollback: immutable pack; canary cohort/pointer; immediate deprecate/revert; learner progress retained.
- Test bắt buộc: all Phase 4 content gates, factory lineage, review sampling 100%, canary install/use/report/revoke, no app bundle growth.
- Acceptance criteria: measured draft rejection, review time, defect escape and learner reports; no AI auto-publish; rollback drill passes.
- Rủi ro: Medium–High.
- Điều kiện dừng: dừng if critical defect escapes, metrics cannot trace lineage, or team proposes bulk scale before canary review.

### P6-05 — Scale operating gate and pack template

- Branch/PR: NguyenDukKyeon/VocabMaster-content: codex/p6-05-scale-gate.
- Mục tiêu: lock repeatable “one pack = one PR/release” template, capacity limits, quality SLO and independent Phase 6 audit.
- Dependency: P6-04 ACCEPTED.
- File/module dự kiến: external templates/checklists/CI, quality dashboard reducer; app only bound catalog acceptance evidence.
- Migration/rollback: no learner DB migration; future packs always immutable and separately reversible.
- Test bắt buộc: replay canary build, reviewer separation, key rotation, rollback/revoke, defect metrics and rights audit.
- Acceptance criteria: no generator-to-publish bypass; each future pack has its own branch/PR/digest; scale threshold approved from measured canary, not guessed.
- Rủi ro: Medium.
- Điều kiện dừng: dừng if quality/cost thresholds absent, human capacity insufficient, or any future pack is planned as an unreviewed batch.

## Phase 7 — Measurement and Personalization

Exit gate Phase 7: metrics derive deterministically from canonical events and expose denominators/timeframes/uncertainty; GoalProfile is explicit; Today recommendations are reason-coded and due-first; calibration uses sufficient delayed independent samples; AI does not tune FSRS or decide schedule; experiments have guardrails/rollback.

### P7-00 — Canonical learning metrics reducer

- Branch/PR: codex/p7-00-metrics-reducer.
- Mục tiêu: define numerator/denominator/timeframe/eligibility for retrieval, delayed success, coverage, stability, recurrence, content completion and active days; rebuild projection from events.
- Dependency: P1-02 and P1-08 ACCEPTED; implementation can be prepared before content scale, but production dashboard must label missing content/outcome data.
- File/module dự kiến: src/progress.js, persistence event readers, reducer/projection module, tests/progress.test.mjs.
- Migration/rollback: raw events unchanged; projection version/cache rebuild; legacy counters read-only comparison one release; rollback drops cache only.
- Test bắt buộc: deterministic replay, duplicate/out-of-order events, timezone/DST, empty/sparse data, assisted vs independent, totals across Core/IELTS/V10.
- Acceptance criteria: fixture totals reconcile 100%; every metric has denominator/timeframe/source drill-down; mutable card counters not source of truth.
- Rủi ro: Medium.
- Điều kiện dừng: dừng if reducer must infer assistance from UI text or surfaces disagree without explainable exclusions.

### P7-01 — Honest Progress UI and uncertainty

- Branch/PR: codex/p7-01-honest-progress.
- Mục tiêu: separate retrievability, stability, coverage, calibration and activity; show sample/uncertainty rather than strong mastery label from n=1.
- Dependency: P7-00 ACCEPTED.
- File/module dự kiến: src/progress.js, app progress render, roadmap/runtime adapters, CSS/browser tests.
- Migration/rollback: no data migration; Progress v2 flag; legacy labels hidden but projection retained.
- Test bắt buộc: n=0/1/threshold, active day vs streak, missing skills, assisted data, screen reader/chart alternative, narrow/mobile.
- Acceptance criteria: n=1 says insufficient data; no “mastered/very durable” without locked coverage/sample rule; metrics drill to exact source events.
- Rủi ro: Low–Medium, perceived regression because numbers become more conservative.
- Điều kiện dừng: dừng if confidence is presented as calibrated probability without validation or denominators hidden.

### P7-02 — GoalProfile and mastery recomputation

- Branch/PR: codex/p7-02-goal-profile.
- Mục tiêu: explicit IELTS outcomes, modalities, daily minutes, exam date optional, new-content appetite, accent/accessibility preferences; recompute goal projection without deleting schedules.
- Dependency: P7-00, P4-10 and P2-06 ACCEPTED.
- File/module dự kiến: src/settings-ui.js, src/fsrs-scheduler.js, src/v10-contracts.js, goal repository/migration, tests.
- Migration/rollback: conservative default from existing settings; outside-goal skills become dormant, not deleted; profile versioned; rollback planner uses due-first defaults.
- Test bắt buộc: passive↔active goal, exam date/timezone, reduced daily minutes, accessibility constraints, no content/AI, rebuild from events.
- Acceptance criteria: goal edit immediately recomputes coverage/recommendation eligibility without false mastery; no automatic goal/card mutation by AI.
- Rủi ro: Medium–High.
- Điều kiện dừng: dừng if migration discards skill state, assumes IELTS target absent user choice, or goals directly rewrite FSRS history.

### P7-03 — Delayed outcomes and calibration

- Branch/PR: codex/p7-03-outcomes-calibration.
- Mục tiêu: collect 7/30/90-day independent retrieval outcomes, Brier/ECE only after locked sample criteria, stratified by skill/activity/assistance.
- Dependency: P7-00 and sufficient elapsed clean-event cohort; cannot be accepted by synthetic data alone.
- File/module dự kiến: outcome scheduler/reducer, progress/calibration UI, tests and analysis scripts.
- Migration/rollback: additive outcome links; no backfill synthetic pass; old event lacking eligibility excluded with reason; rollback hides projection.
- Test bắt buộc: cohort windows/timezone, censoring/missing follow-up, n threshold, stratification, assisted exclusion, synthetic known-calibration datasets.
- Acceptance criteria: UI always shows n/window/uncertainty; no calibrated label before approved minimum; 7/30/90 outcomes trace original attempt/target.
- Rủi ro: High analytical; requires time and clean sample.
- Điều kiện dừng: dừng if pooled coaching data is used to reach n, missing outcomes treated success/failure without policy, or team wants FSRS tuning before cohort matures.

### P7-04 — Workload simulator and deterministic recommender

- Branch/PR: codex/p7-04-workload-recommender.
- Mục tiêu: simulate due load under GoalProfile; compose due review, error repair and verified content with reason codes and deterministic snapshot.
- Dependency: P7-02, P7-03, P4-10 and P6-05 ACCEPTED.
- File/module dự kiến: src/today-planner-v2.js, src/coaching-engine-v2.js, fsrs read models, simulator/recommender tests.
- Migration/rollback: planner v2 behind flag; store input snapshot/reason codes; no FSRS parameter mutation; rollback deterministic due-first planner.
- Test bắt buộc: same snapshot same plan, overdue surge, sparse content, exam date, low time budget, fairness/starvation, error cap, accessibility/offline.
- Acceptance criteria: due maintenance cannot be silently displaced; only verified installed/streamable content recommended; every row explains why/why now/estimated time.
- Rủi ro: High product impact.
- Điều kiện dừng: dừng if recommender invokes real-time AI, optimizes engagement over due evidence, or cannot reproduce a plan.

### P7-05 — Guarded personalization experiments and Phase 7 exit

- Branch/PR: codex/p7-05-personalization-exit.
- Mục tiêu: feature flags/cohort assignment, predeclared success+harm metrics, kill switch and independent audit; personalization adjusts mix/order, never due dates directly.
- Dependency: P7-04 ACCEPTED and adequate clean baseline cohort.
- File/module dự kiến: experiment assignment/config, metrics reducer, Today UI reason codes, CI/analysis runbook; no external auto-action.
- Migration/rollback: stable anonymous local cohort; flag off returns deterministic baseline; raw events preserved; no destructive parameter migration.
- Test bắt buộc: assignment stability, opt-out, kill switch, no cross-cohort state leak, harm guardrails, backup/restore, reproducible analysis.
- Acceptance criteria: pre-registered thresholds; no AI FSRS write; rollback one flag; Phase 7 metrics/evidence/content/browser gates remain green.
- Rủi ro: Critical if underpowered or optimizing proxy metrics.
- Điều kiện dừng: dừng if sample insufficient, harm guardrail trips, attribution unavailable, or proposed experiment changes FSRS parameters before validated outcomes.

## Cross-cutting minimum architecture packages

Các package trong phần này không phải phase mới và không được implementation
authorization từ việc xuất hiện trong canonical docs. Trạng thái ban đầu của
từng package là `PLANNED / NOT_IMPLEMENTED / NOT_ACCEPTED`. Năm U-* chỉ tồn tại
trong ROADMAP/ADR như grouping labels và không có acceptance boundary riêng.

### LI-00 — Canonical execution safety and Frozen Run

- Delivery authorization: `NOT_GRANTED`; chưa có branch/PR triển khai.
- Mục tiêu: harden additive canonical ActivitySpec/Run/Attempt/Receipt path để một started Run đóng băng target, source revision, prompt/key, scoring và evidence-policy bindings; mọi kết thúc tạo đúng một terminal Receipt hoặc fail closed.
- Canonical owner/boundary: LI-00 sở hữu execution-safety contract và frozen binding seam; existing P1 repositories, Today Runner và EvidencePolicy tiếp tục sở hữu persistence, execution, scheduling và evidence verdict.
- Dependency: accepted P1-01, P1-02, P1-07, P1-08 và current EvidencePolicy.
- Entry gate: bounded spec được duyệt; terminal state vocabulary, immutable binding fields và migration compatibility được chốt; không có active writer overlap trên learning contracts/Today Runner.
- In scope: strict binding validation, first-terminal-wins Receipt semantics, duplicate/idempotent completion, assistance/provenance binding và fail-closed stale/missing target behavior.
- Non-goals: activity UI inventory, new scheduler, new Attempt/Receipt store, multi-item assessment aggregate, AI authority hoặc thay đổi FSRS.
- Migration/rollback: additive fields/readers only; legacy Run/Receipt thiếu required authority remains ineligible with reason; rollback ignores new optional fields without deleting durable attempts or evidence.
- Test bắt buộc: source/policy changes after start, stale target, duplicate completion, competing terminal writers, reveal/assistance transitions, crash/reopen, backup/restore và unknown/future fields.
- Acceptance criteria: exact frozen bindings survive reload; one terminal Receipt wins deterministically; no caller/provider string can grant independent/verified authority; existing eligible evidence remains reproducible.
- Acceptance owner: independent canonical reviewer at the exact implementation commit.
- Rủi ro: Critical learning/evidence boundary.
- Điều kiện dừng: dừng nếu implementation needs a parallel runtime/store, rewrites historical evidence, infers target from UI state or allows caller-selected evidence authority.

### SRC-00 — Stable SourceRevisionRef seam

- Delivery authorization: `NOT_GRANTED`; chưa có branch/PR triển khai.
- Mục tiêu: define one stable reference contract for canonical card/activity, Transcript revision and content revision identities so compilers/executors can bind exact source without owning another source database.
- Canonical owner/boundary: SRC-00 owns only reference shape, adapter validation and resolution result semantics; Card, Transcript, private content and public pack repositories retain their data/trust ownership.
- Dependency: accepted P1-01, P1-05 and P3-06; a public-pack adapter additionally requires accepted P4 contracts, while the neutral seam does not wait for P4.
- Entry gate: supported source-kind registry, revision/tombstone semantics, privacy/provenance fields and unresolved-reference behavior are reviewed.
- In scope: typed source/revision identity, immutable digest/reference fields, adapter registry, resolution errors, provenance projection and portable reference backup.
- Non-goals: source ingestion, URL/PDF/media acquisition, private Library, content compilation, publication/signing or a fourth source store.
- Migration/rollback: additive reference adapter over existing IDs; unresolved legacy identities remain explicit and non-qualifying; rollback preserves original repository records.
- Test bắt buộc: each accepted adapter, missing/revoked/tombstoned revision, digest mismatch, private/public separation, duplicate IDs, backup/restore/reopen and forward-compatible unknown source kinds.
- Acceptance criteria: the same exact revision resolves deterministically or fails with a typed reason; no adapter upgrades private/unverified content or bypasses public-pack trust; no durable source is duplicated.
- Acceptance owner: independent canonical reviewer at the exact implementation commit.
- Rủi ro: High provenance and compatibility boundary.
- Điều kiện dừng: dừng nếu seam requires a new source authority/store, rewrites source history or treats unresolved/invalid provenance as canonical.

### ERR-00 — ErrorCandidate lifecycle and atomic promotion

- Delivery authorization: `NOT_GRANTED`; chưa có branch/PR triển khai.
- Mục tiêu: contain advisory/AI or uncertain error signals as candidates and promote them atomically into the existing global Error Repository only after user confirmation or qualified evidence.
- Canonical owner/boundary: ERR-00 owns candidate state, decision provenance and promotion saga; P1-06 remains the sole ErrorRecord/occurrence/repair-queue owner and EvidencePolicy remains evidence authority.
- Dependency: LI-00 and accepted P1-06.
- Entry gate: candidate taxonomy, promotion authorities, idempotency key, retraction/correction semantics and source-error separation are approved.
- In scope: candidate create/update/confirm/reject/expire states, immutable advisory provenance, atomic promotion/idempotency and replay/reconciliation after interruption.
- Non-goals: direct AI-to-ErrorRecord writes, scoring, schedule/mastery mutation, duplicate Error Repository, provider evaluation or WeaknessProfile ownership.
- Migration/rollback: wrap legacy advisory writes as non-promoted candidates where provenance permits; never synthesize confirmation; rollback leaves canonical ErrorRecords untouched and preserves unresolved candidates for export.
- Test bắt buộc: forged caller decision, duplicate promotion, crash between candidate decision and ErrorRecord write, replay/out-of-order events, source error, correction after reveal, reject/expire and backup/restore/reopen.
- Acceptance criteria: advisory output cannot create canonical error/schedule evidence directly; one qualified decision creates at most one canonical occurrence; totals/replay stay deterministic after recovery.
- Acceptance owner: independent canonical reviewer at the exact implementation commit.
- Rủi ro: Critical authority and learner-model boundary.
- Điều kiện dừng: dừng nếu promotion trusts provider agreement, writes two error stores, bypasses P1-06 or mutates evidence/mastery directly.

### QAR-00 — Shared Question Activity Runtime contracts

- Delivery authorization: `NOT_GRANTED`; chưa có branch/PR triển khai.
- Mục tiêu: define shared question-type schemas, deterministic answer normalization/scoring/review semantics and executor registration for Reading/Listening activities while reusing canonical Activity/Run/Attempt/Receipt execution.
- Canonical owner/boundary: QAR-00 owns question contract/registry only; canonical P1 runtime, Today, EvidencePolicy, skill executors, Transcript/media and IELTS profile/inventory retain ownership.
- Dependency: LI-00 and SRC-00.
- Entry gate: versioned question-kind registry, answer-authority rules, scoring/review semantics and unsupported-kind behavior are reviewed; at least one existing executor adapter is selected for a later implementation slice.
- In scope: item schema, validator, normalization, deterministic scorer/reviewer interface, executor capability registration and typed unsupported/fail-closed behavior.
- Non-goals: second runtime/scheduler/attempt store, IELTS inventory ownership, productive Writing/Speaking artifacts, qualified-evidence policy, media acquisition or full-coverage claim.
- Migration/rollback: adapters wrap existing accepted Reading/Dictation primitives without rewriting attempts; unknown future kinds remain preserved but unexecutable; rollback uses existing executors.
- Test bắt buộc: schema versions, malformed item/key, normalization ambiguity, deterministic scorer, unsupported kind, exact source binding through LI/SRC, existing executor adapter and backup/restore of attempts.
- Acceptance criteria: registered kinds execute through the canonical Run/Attempt/Receipt path; same frozen input yields the same normalized/scored result; unsupported or ambiguous kinds fail closed; no parallel runtime state appears.
- Acceptance owner: independent canonical reviewer at the exact implementation commit.
- Rủi ro: High shared-executor boundary.
- Điều kiện dừng: dừng nếu QAR owns Today/attempt persistence, invents IELTS profile inventory, uses AI as answer authority or labels matrix coverage as implemented without executor/evidence.

## Cross-cutting Repository Engineering

### EWF-00 — Engineering Workflow Foundation

- Placement: Cross-cutting Repository Engineering, outside Phase 0–7 and outside U-LI/U-AI/U-PCS/U-4S/U-FD.
- Architecture baseline: approved design commit `adc3726620f4badddb16309e375f8f17b6af1404`; the design file remains unchanged.
- Current implementation state: `IMPLEMENTED / PILOTS_PENDING / NOT_ACCEPTED`.
- Accepted foundation slices:
  - `EWF00-ARTIFACTS-001`
  - `EWF00-PREFLIGHT-001`
- Remaining acceptance gates:
  - one independently audited eligible small-repair pilot;
  - one independently audited bounded spec-level pilot;
  - measured overhead data;
  - independent exact-commit EWF-00 package audit.
- Pilot authorization: `EWF00-PILOTS-001` remains `NOT_GRANTED / UNAUTHORIZED`.
- Dependency: no hard product-package dependency. Reuse the existing acceptance harness and independent-audit conventions without reopening Phase 0 or taking ownership from canonical package/phase gates.
- In scope: minimal constitutional bridge; one-writer/worktree preflight; lightweight repair record; structured spec metadata; focused/PR verification profiles; implementation verification report; frozen acceptance brief; `requirement → test → command → evidence` trace validator; negative fixtures for wrong HEAD, dirty tree, overlap, broken trace and mismatched brief; CLI-absent operation; one small-repair pilot; one bounded spec-level pilot; overhead measurement; independent audit.
- Authority boundary: AGENTS/ROADMAP/PLAN/STATUS/DECISIONS remain canonical. EWF outputs are subordinate artifacts and never create package status, acceptance verdict or release authority. Implementer evidence cannot self-accept.
- Non-goals: product behavior; Phase 4/5 reconciliation; second status/acceptance authority; dashboard; daemon; workflow runtime/DAG/scheduler/retry engine; CI workflow mutation or complex CI orchestration; mutation suite; broad fuzz; portability automation; automatic initializer, Spec Kit, fast-check or other dependency installation.
- Migration/rollback: additive repository-local metadata/templates/wrappers only after separate authorization; no product schema/data migration. Rollback removes only declared EWF artifacts/hooks and must leave the canonical workflow operational when Spec Kit CLI is absent.
- Test bắt buộc: wrong-head/dirty/untracked/overlap preflight; duplicate requirement and broken reference; missing required evidence; commit/spec/trace/evidence-digest mismatch; focused/PR result classification; CLI unavailable; deterministic artifact digest; small-repair and bounded-spec pilot evidence.
- Acceptance criteria: every required negative fixture fails closed; both pilots complete without granting product status; exact identity and trace evidence are reproducible; measured overhead is recorded; no canonical authority is duplicated; an independent auditor at the exact commit issues the verdict.
- Acceptance owner: independent canonical auditor at the exact implementation commit.
- Rủi ro: High verification/governance integrity; Medium operational overhead.
- Điều kiện dừng: dừng nếu implementation needs to rewrite canonical docs at runtime, auto-install tools, infer predecessor/acceptance, orchestrate a general workflow engine, absorb a pilot's product boundary or use implementer evidence as acceptance.

## 7. Thứ tự merge theo dependency thực

Trục bắt buộc đầu tiên:

1. P0-00.
2. P0-01.
3. P0-02 và P0-03 sau P0-01.
4. P0-04 → P0-05; sau đó P0-06. P0-07 có thể đi sau P0-01.
5. P0-08 chỉ khi toàn bộ predecessor Phase 0 ACCEPTED.
6. P1-00 chỉ sau P0-08; tiếp tục P1-01 → P1-02 → P1-03.
7. P1-04/P1-05/P1-06 theo dependency; P1-07 → P1-08.

Sau Phase 1:

- Resolver lane: P2-00 → P2-01 → P2-02 → P2-03 → P2-04 → P2-05 → P2-06.
- Content lane: P4-00 → P4-01 → P4-02 → P4-03; external P4-04 có thể bắt đầu sau P4-00, rồi P4-05 → P4-06 → P4-07 → P4-08 → P4-09; P4-10 join cả app/content lanes.
- Workspace lane: P3-00 chỉ sau P2-06; P3-01; sau đó P3-02/P3-03/P3-05 theo dependency; P3-04 sau evidence-safe mode; P3-06 join.
- Fallback lane: P5-00 sau P2-06; P5-01 → P5-02 → P5-03; P5-04 có thể song song local ASR sau policy/job contracts; P5-05 join.
- Scale lane: P6-00 → P6-01 → P6-02 → P6-03 → P6-04 → P6-05, chỉ sau P4-10.
- Metrics reducer P7-00 có thể được xây khi Phase 1 event model ổn định; GoalProfile/personalization rollout vẫn bị khóa bởi content/outcome dependencies. P7-01 → P7-02/P7-03 → P7-04 → P7-05.

Không có dependency kỹ thuật buộc Content Platform chờ Workspace UI, hoặc buộc Local ASR chờ Content Factory. Ngược lại, Workspace bắt buộc chờ stable transcript identity, và Personalization bắt buộc chờ clean evidence + usable verified content + outcome measurement.

## 8. Package đầu tiên được đề xuất

Đề xuất bắt đầu bằng P0-00 trên branch Phase 0 `codex/phase-0-release-safety`.

Lý do:

- baseline hiện có hai browser command đỏ và một cleanup EBUSY, nên mọi PR correctness sau đó chưa có oracle runtime đủ tin cậy;
- package này không đổi product behavior, schema hay dữ liệu;
- nó biến failure IELTS Retell thành blocker sản phẩm tái lập được thay vì bị lẫn với browser discovery/cleanup;
- P0-01/P0-04 và mọi exit gate sau đều tái sử dụng cùng harness.

Không đưa “sửa Retell cho xanh” vào P0-00. Retell semantics/evidence thuộc P0-03; nếu test vẫn đỏ sau khi harness ổn định, đó là acceptance evidence đúng.

Definition of Ready cho P0-00:

- branch từ exact baseline đã ghi ở đầu tài liệu;
- closed allowed-file set chỉ package/test scripts;
- không dùng Chrome profile thật của người dùng;
- chốt browser candidate matrix Windows và cleanup ownership;
- reviewer đồng ý rằng retry chỉ để phát hiện flake, không biến failed assertion thành pass.
