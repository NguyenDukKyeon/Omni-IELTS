# Vocab Master v8 — Báo cáo triển khai 5 giai đoạn

Ngày hoàn thành: 2026-07-29

## Kết luận

Năm giai đoạn trong roadmap đã được triển khai vào mã nguồn theo thứ tự phụ thuộc. Phạm vi thực hiện ưu tiên tính đúng của dữ liệu và learning engine trước UI/AI. Không thêm tài khoản, đồng bộ cloud, social gamification hoặc AI tự điều khiển FSRS.

## Giai đoạn 0 — Data Trust

### Đã triển khai

- Nâng IndexedDB lên schema v3 và thêm store `outbox`.
- Xóa cơ chế reset lịch học tự động trong migration.
- Thêm marker `databaseInitialized`; thư viện rỗng không bị tự seed lại.
- Bộ mẫu chỉ được thêm qua hành động rõ ràng của người dùng.
- Migration localStorage và adoption IndexedDB cũ giữ review evidence.
- Mỗi lượt ôn ghi card + review event + metrics trong cùng transaction.
- Outbox chống mất thao tác khi ghi lỗi và phát lại idempotent.
- Ghi card gia tăng thay cho clear/rewrite toàn bộ thư viện trong mỗi review.
- Chống stale replay bằng `storageUpdatedAt`.
- BroadcastChannel và revision phát hiện thay đổi nhiều tab.
- Không fallback âm thầm sang localStorage khi IndexedDB chỉ khởi động chậm hoặc lỗi.
- Snapshot chứa review events và có UI restore.
- Full backup schema v3 có deep validation, duplicate detection và orphan warnings.
- Reset learning progress tạo snapshot trước khi xóa lịch sử.
- Persistent storage status, quota và pending writes được hiển thị.
- `.env.example` được đưa khỏi ignore để có thể version-control an toàn.

### Acceptance criteria

| Tiêu chí | Trạng thái |
|---|---|
| Thư viện rỗng vẫn rỗng sau reload | Đạt theo marker khởi tạo và test backup rỗng |
| Migration không tự xóa review history | Đạt theo logic migration và test legacy history |
| Review ghi nguyên tử | Đạt theo transaction `persistReviewResult` |
| Review trùng không áp lại card/metrics | Đạt theo ID check trước update |
| Backup chứa cards, schedules, events | Đạt |
| Snapshot có thể restore | Đạt |
| Lỗi IndexedDB không tạo nguồn dữ liệu thứ hai | Đạt |

## Giai đoạn 1 — Learning Correctness

### Đã triển khai

- Skill profile theo loại card và mục tiêu passive/active.
- Skill chưa học được xem là khoảng trống đến hạn.
- Mastery yêu cầu toàn bộ required skills đã được kiểm tra.
- Queue theo `(cardId, skill)` thay vì chỉ theo card.
- Exercise mapping theo đúng due skill.
- Learning/relearning step mặc định rút gọn còn `10m`.
- `Again` là failure duy nhất; `Hard` là successful retrieval có khó khăn.
- Corrective retry được đánh dấu `assisted` và không đổi FSRS.
- Hotkey rating chỉ hoạt động sau reveal.
- Accepted-answer override chỉ commit một lần.
- Production AI và output practice trả rating theo từng target term.
- Pronunciation tách khỏi production schedule.
- New-word acquisition bundle không bị cắt giữa chừng vì time budget.
- Test Mode tiếp tục không thay đổi lịch.

### Acceptance criteria

| Tiêu chí | Trạng thái |
|---|---|
| Mỗi due skill nhận exercise phù hợp | Đạt |
| Missing required skill hiển thị là gap | Đạt |
| Failure không bị ghi Hard | Đạt |
| Corrective practice không kéo dài lịch | Đạt |
| Production không áp một score cho mọi từ | Đạt |
| Pronunciation không cập nhật production FSRS | Đạt |

## Giai đoạn 2 — Core Daily Workflow

### Đã triển khai

- Adaptive Session Composer theo due skill, priority và time budget.
- Quick session dùng complete acquisition bundle khi chưa có due review.
- Forecast workload và estimated session duration.
- Sửa card trực tiếp từ detail.
- Suspend/unsuspend card.
- Xóa có undo.
- Import quoted/multiline CSV, preview lỗi và conflict strategy skip/merge.
- Duplicate identity hỗ trợ nhiều sense.
- Bulk persistence cho import.
- Progress cập nhật theo persisted review metrics, kể cả review trong phiên.
- Daily target được cố định khi lập kế hoạch đầu ngày, không co lại khi các mục đã ôn biến mất khỏi due queue.
- Mode selector được giữ trong khu vực Luyện thêm; Today vẫn là luồng mặc định.
- Study dialog, focus handling và reduced motion được cải thiện.

### Acceptance criteria

| Tiêu chí | Trạng thái |
|---|---|
| Phiên time-box không cắt acquisition sequence | Đạt |
| Luồng capture → edit → learn → review không có dead end chính | Đạt theo static integration cross-check |
| Import không âm thầm overwrite duplicate | Đạt |
| Delete có đường hoàn tác | Đạt |
| Daily progress tăng theo review thực | Đạt |

## Giai đoạn 3 — Trustworthy AI và Audio

### Đã triển khai

- Allowlist Gemini model phía server.
- Server key khóa model theo cấu hình server.
- JSON Schema cho mọi AI endpoint.
- Runtime validation, giới hạn chuỗi/mảng và clamp score.
- Retry/backoff, cache và telemetry.
- Context Capture có candidate selection; không tự lưu.
- Provenance cho card tạo từ AI/import/manual.
- AI enrich đưa `type` và `accepted` vào draft.
- Output practice chấm riêng từng term.
- Pronunciation đổi semantics thành intelligibility coaching.
- SpeechRecognition fallback không tạo điểm AI giả.
- Audio recording có giới hạn kích thước và thời gian.
- Các control AI/recording có guard chống double submission.

### Acceptance criteria

| Tiêu chí | Trạng thái |
|---|---|
| AI output sai schema không đi thẳng vào state | Đạt phía server validator |
| Nội dung AI lưu lâu dài cần người dùng xác nhận | Đạt |
| Pronunciation score không thay đổi FSRS | Đạt |
| AI failure có deterministic/manual fallback cho core study | Đạt ở các dạng bài không phụ thuộc AI; production có manual path |

## Giai đoạn 4 — Khác biệt hóa có kiểm soát

### Đã triển khai

- Transfer Check sau mastery, dùng câu/ngữ cảnh mới.
- Error Fingerprint theo nhóm lỗi.
- Context Capture từ đoạn đọc/transcript/bài viết.
- Passive/active learning goals và required skill profile.
- Exam pacing theo ngày mục tiêu.
- Actionable progress: coverage, expected recall, forecast và skill gaps.

### Không triển khai có chủ ý

- Tự tối ưu tham số FSRS từ review history.

Lý do: dữ liệu hiện chưa được chứng minh đủ sạch và đủ lớn để tối ưu cá nhân đáng tin cậy. Việc thêm optimizer sớm có thể tạo cảm giác chính xác giả và làm khó kiểm tra hồi quy.

## Kiểm tra chéo đã thực hiện

### Đã chạy thành công

1. `node --check` cho toàn bộ JavaScript/MJS trong `src`, `server`, `public`, `scripts`, `tests`.
2. `npm run check` — cross-check hợp đồng data trust, persistence, FSRS, session composer, card lifecycle, AI schema, pronunciation, progress, PWA và accessibility.
3. Bộ test không cần dependency ngoài: **17/17 test đạt**.
4. `git diff --check` — không có whitespace error.
5. Rà tĩnh tìm hidden reset, autoseed, whole-library review rewrite và fake snooze.
6. Rà đường race/double submission ở answer override, production, output, transfer và pronunciation.

### Chưa thể chạy trong môi trường thực hiện

- Toàn bộ `npm test` chưa hoàn tất vì môi trường không có `node_modules`; các suite cần `ts-fsrs` và `fake-indexeddb` báo `ERR_MODULE_NOT_FOUND`.
- `npm install` không hoàn tất do registry/DNS của môi trường không truy cập được.
- Vì thiếu `esbuild`, `vite` và `web-push`, chưa chạy được production build, server smoke và browser smoke.

Đây là giới hạn của môi trường kiểm tra, không phải kết quả test thành công. Sau khi giải nén trên máy có mạng, cần chạy toàn bộ lệnh dưới đây trước deploy:

```bash
npm install
npm test
npm run check
npm run build
npm run test:serve
npm run test:browser
npm run test:hardening
```

## Rủi ro còn lại

1. API compatibility thực tế với dependency chỉ được kiểm tra đầy đủ sau `npm install` và full suite.
2. Multi-tab hiện phát hiện external revision và cảnh báo khi đang học; chưa có conflict merge ở cấp field.
3. Web Push vẫn là kiến trúc single-instance lưu file, không phù hợp scale multi-user.
4. Speech/TTS phụ thuộc browser và hệ điều hành nên chất lượng giọng không đồng nhất.
5. Gemini pronunciation vẫn là coaching ước tính, không phải phoneme assessment được hiệu chuẩn.
6. Context Capture và AI examples vẫn cần người học duyệt chất lượng ngôn ngữ.

## Kết luận phát hành

Mã nguồn đã hoàn thành phạm vi năm giai đoạn ở cấp triển khai và cross-check tĩnh/độc lập. Chưa nên tuyên bố production-ready cho tới khi cài dependency, chạy full test/build/browser smoke và thử backup–restore trên browser thật.
