# VocabMaster Repository Rules

## Nguồn thẩm quyền

- `docs/ROADMAP.md` là nguồn chính thức cho phạm vi Phase 0–7, thứ tự phase và dependency giữa các work package.
- `docs/IMPLEMENTATION_PLAN.md` là đặc tả chi tiết mục tiêu, test, migration/rollback, acceptance và stop condition của từng package.
- `docs/IMPLEMENTATION_STATUS.md` là nguồn duy nhất cho trạng thái thực thi và evidence đã chạy trên commit cụ thể.
- `docs/DECISIONS.md` lưu rationale và quyết định kiến trúc/sản phẩm. ADR đã `SUPERSEDED` không còn hiệu lực.
- File này là quy tắc bắt buộc khi thay đổi repository. Khi các tài liệu có vẻ mâu thuẫn, dừng sửa source, đối chiếu theo các vai trò trên và ghi ADR nếu quyết định làm thay đổi kiến trúc, dữ liệu, evidence hoặc release gate.

## Phạm vi và Git

- Phase 0 là hard gate. Không tạo hoặc triển khai bất kỳ package Phase 1 nào trước khi P0-08 được reviewer độc lập ghi `ACCEPTED` tại một commit chính xác.
- Phase 0 dùng một branch `codex/phase-0-release-safety` và một pull request. P0-00 đến P0-08 là đơn vị plan, kiểm chứng và commit nội bộ; không mặc định là branch hoặc PR riêng.
- Thực hiện tuần tự P0-00 → P0-08. Mỗi package phải có commit nhỏ, mục đích rõ, predecessor là commit package trước, diff được review và evidence test được ghi lại.
- Chỉ một agent được ghi file/code. Subagent chỉ được đọc, phân tích hoặc review; không sửa file, commit, rebase, push hoặc mở PR.
- Không stage/commit thay đổi ngoài phạm vi. Không sửa lịch sử Git, force-push, reset destructive hoặc ghi đè thay đổi của người dùng.
- Không commit secret, browser profile người dùng, dữ liệu học thật, file debug, marker tạm, build artifact ngoài convention, test output tạm hoặc fixture chứa PII.

## Invariant evidence và learning

- `EvidencePolicy` là gateway duy nhất được phép biến `Attempt` thành review event hoặc FSRS/schedule mutation. Không tạo schedule write path mới đi vòng gateway.
- Policy phải default-deny và luôn trả `eligible` cùng reason code. Caller không được tự khẳng định independent/verified nếu không có `AssistanceTrace` và provenance kiểm chứng được.
- Reveal, hint, correction/answer đã lộ, transcript đã xem, retry sau lộ đáp án, unverified transcript/source, Shadowing, coaching, spelling-only, source error, Skip và Retell không có learner output/evaluator không được tạo positive independent evidence.
- Failure, `Again`, skip và abstention hợp lệ vẫn được persist để chẩn đoán, nhưng không được giả success, unlock skill hoặc inflate mastery. Unlock chỉ dựa trên qualified successful independent evidence.
- Planned target là bất biến từ plan đến receipt: activity/card/sense/skill/source revision phải khớp. Không suy target từ DOM, selected state hoặc mode name; stale/missing/mismatch phải fail closed.
- Mọi review event mới phải truy được activity, target, attempt/receipt, assistance/provenance và EvidenceDecision reason. Duplicate receipt phải idempotent.
- Không sửa assertion, bỏ test, thêm skip/quarantine hoặc biến lỗi nghiệp vụ Retell thành lỗi harness chỉ để gate xanh.

## Invariant dữ liệu, backup và restore

- Phân loại store thành `durable`, `reconstructable-cache` hoặc `ephemeral`. Durable gồm learner-authored data, Core, IELTS, V10, cards, settings/goals, drafts, attempts/receipts/evidence, review events/FSRS, errors, progress, user transcript revisions, migration/restore journals và unresolved outbox/sagas; tất cả phải có trong backup.
- Cache tái dựng được không đi vào backup payload, nhưng stub/digest cần cho việc tái dựng phải được giữ. Ephemeral state không bao giờ được báo là đã lưu bền.
- Backup phải deterministic/canonical, versioned, dual-read legacy khi đã cam kết, reject schema mới không hỗ trợ một cách rõ ràng, không silently bỏ record lỗi và không chứa secret.
- Restore luôn theo chuỗi stage → validate toàn payload → journal → commit/reconcile → reopen/read-back/canonical verify. Không clear nguồn đích trước validate và không tuyên bố thành công trước durable commit + verify.
- IndexedDB schema chỉ tiến về trước. Migration additive, idempotent, forward-compatible; rollback bằng compatible reader/feature flag/reconciler, không downgrade DB version và không xóa dữ liệu mới.
- Không xóa durable source chỉ vì đã copy vào RAM. Với copy/migration giữa store/DB: ghi đích, commit, reopen/read-back và canonical verify trước khi xóa nguồn; retry phải an toàn sau interruption.
- Khi IndexedDB/quota/versionchange/blocked lỗi, UI và API phải phân biệt durable success, temporary state và failure. RAM fallback không được masquerade là durable success.

## Invariant containment UI

- Production chỉ có một entry point an toàn cho Today và một Inbox/Capture. Không “loại” implementation cũ chỉ bằng CSS; listener/route/mount production cũ phải bị disable hoặc gỡ rõ ràng.
- Quick Capture chỉ reset form sau durable success; lỗi phải giữ input và có thông báo. Double submit phải idempotent và draft phải sống qua reload/degraded storage.
- Today launcher phải thực thi exact planned target. Activity mà executor chưa hỗ trợ chính xác phải coaching-only hoặc fail closed, không schedule.
- Retell giả phải được sửa thành flow có output/evaluator thật, hoặc vô hiệu hóa/ghi coaching-only rõ ràng; UI không được dùng ngôn ngữ “đã đánh giá” khi chưa đánh giá.

## Test, harness và acceptance evidence

- Trước source change phải ghi baseline thực tế. Sau mỗi package chạy focused tests, test migration/rollback nếu chạm dữ liệu, review `git diff` và cập nhật status/decision khi cần.
- Browser discovery dùng một policy deterministic cho Windows và CI, hỗ trợ override rõ ràng, kiểm executable thực sự tồn tại và không skip critical suite chỉ vì không tìm thấy Chromium. Không dùng browser profile của người dùng.
- Fixture phải deterministic; mỗi suite dùng temp profile/port riêng, quản lý process tree, chờ readiness có timeout và dọn cả pass/fail. Sau cleanup phải xác minh port trống, process kết thúc và temp profile biến mất.
- `EBUSY` cleanup phải retry có giới hạn với backoff, xác minh kết quả cuối và vẫn fail infrastructure nếu tài nguyên thực sự chưa dọn. Không retry mù product assertion.
- Harness phải phân loại rõ `INFRASTRUCTURE_FAILURE` và `PRODUCT_FAILURE`; product failure như Retell sai vẫn đỏ và giữ chẩn đoán gốc.
- Browser gate critical chạy ba lần liên tiếp tại P0-00 và full `phase0:gate` chạy ba lần tại P0-08. Không dùng source-string/DOM-presence assertion thay cho runtime/persistence/browser evidence.
- Evidence cuối phải ghi OS, Node, browser/version, exact commit, từng lệnh, exit/result thực tế, migration/rollback fixture, durable read-back và artifact/digest khi gate yêu cầu.
- Hierarchy evidence: runtime/persistence/browser trên fixture có kiểm soát > integration/unit/property/failure injection > build/static/schema > source-string/DOM presence > report/screenshot. Evidence yếu không được phủ nhận failure mạnh hơn.

## Bounded execution capsules

- Prompt count is not an acceptance gate. An independently accepted Wave Authorization Manifest may pre-authorize bounded conditional transitions for separately identified packages or research lanes.
- Exact predecessor, canonical owner, one writer, exact file allowlist, test-first Commit A, natural product-defect RED, minimal GREEN, exact-head CI, evidence provenance, migration/rollback obligations and stop conditions remain mandatory.
- A bounded executor may materialize only the transitions frozen by the accepted manifest and cannot independently accept its own implementation or evidence. A fresh independent final audit remains mandatory.
- Post-verdict merge or deterministic reconciliation is permitted only when explicitly pre-authorized, after an `ACCEPT` verdict is posted and read back, accepted heads remain unchanged and required CI remains successful.
- Every capsule fails closed on predecessor or head drift, branch race, ownership or file overlap, dependency violation, invalid or ambiguous RED, unexpected CI identity, missing artifacts or evidence ambiguity.


## Wave 6 recovery canonical addendum

- For the exact Wave 6 recovery candidate rooted at `66666172238668b1ea40d7ff596c82c209fcdfe5`, `docs/WAVE6_RECOVERY_PLAN.md` is an additional canonical acceptance-criteria source only after the docs-only canonicalization PR containing this rule receives fresh independent exact-head `ACCEPT` and is merged.
- This addendum is limited to P7-00/WKN-00 successor recovery, FCS-00/FCS-01 Focus/Today, ASM-00 Frozen Assessment and TD-00 Targeted Diagnostic. FCS-02, P7-01+, readiness, band estimation, personalization and all other packages remain under the existing canonical plan.
- The preserved dirty/local Wave 6 snapshot is recovery input only. It cannot supply retroactive authorization, RED/GREEN chronology, CI, acceptance or merge authority.
- Every executable record from the recovery addendum still requires an independently accepted Protocol-V1 manifest, exact predecessor, immutable test-first A, natural behavioral RED, minimal source-only B, exact-head GREEN, evidence-only C and fresh independent acceptance.
- This addendum does not weaken `docs/IMPLEMENTATION_PLAN.md`; it is a bounded temporary recovery source and must be reconciled into the normal plan/status ledger before Stage 1 is declared governance-complete.

## Phase 0 hard gate

P0-08 chỉ `ACCEPTED` khi cùng một exact commit thỏa toàn bộ checklist trong `docs/IMPLEMENTATION_STATUS.md`, gồm evidence matrix không false schedule; backup sentinel 100% mọi durable store Core/IELTS/V10/drafts/outbox; restore/rollback an toàn; Quick Capture reload/degraded; một Today và một Inbox; Retell trung thực; browser/fixture/cleanup ổn định; unit, integration, static, build và browser gates pass; không debug/marker/skip/assertion yếu; reviewer độc lập không còn finding P0/P1.
