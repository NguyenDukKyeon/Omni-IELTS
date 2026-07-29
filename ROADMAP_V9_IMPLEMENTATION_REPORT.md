# Vocab Master v9 — Báo cáo triển khai 7 giai đoạn

## Phạm vi

1. Release Gate và baseline kiểm thử.
2. Learning Evidence và progressive skill ladder.
3. Data Integrity, optimistic concurrency và atomic import.
4. Quick Capture và Quality Inbox tách khỏi scheduler.
5. Daily UX, metric taxonomy và accessibility.
6. Trustworthy AI, field provenance, disclosure và PWA update safety.
7. Calibration, error intervention, cross-check và audit tự động.

## Nguyên tắc đã khóa

- FSRS chỉ nhận evidence phù hợp với skill.
- Kỹ năng nâng cao không được coi là due trước khi kỹ năng nền có evidence.
- Assisted retry, warm-up, pronunciation và skip không kéo dài lịch.
- Draft không phải card mới và không vào Today.
- Import new + merge chạy trong một IndexedDB transaction.
- AI không điều khiển due date, mastery hoặc retention.
- Manual production tích cực tối đa được ghi Hard và phải có câu chứa target.
- Progress tách activity khỏi independent review.
- Pronunciation là coaching-only; microphone fallback không tạo rating FSRS thủ công.

## Audit cuối đã đóng trong mã

- Aggregate FSRS chỉ chọn `nextSkill` trong tập kỹ năng đã mở; coverage và mastery vẫn dùng toàn bộ mục tiêu.
- Review persistence đồng bộ `storageUpdatedAt` trở lại card trong bộ nhớ, hỗ trợ các lượt ôn liên tiếp.
- Stale review bị loại khỏi outbox thay vì retry vô hạn; trạng thái UI được hoàn tác khi write không được bảo vệ.
- Calibration so sánh sai lệch theo đơn vị tỷ lệ với ngưỡng 8 điểm phần trăm.
- Browser smoke dùng selector thư viện hiện hành và kiểm tra control trước khi bấm.
- Form thêm từ giữ tham chiếu form ổn định qua `await`, không dùng `event.currentTarget` sau bất đồng bộ.
- Hardening fixture hoàn thành acquisition trước pronunciation và kiểm tra đúng fallback coaching-only.
- Toàn bộ script, marker và workflow vá tạm đã được loại khỏi nhánh sản phẩm và `main`.

## Kết quả kiểm chứng tự động

Code-bearing commit `4d638488dd3ebca6373219ced1d07d9ebb777ea0` đã đạt toàn bộ GitHub Actions run `30419397509`:

- `npm ci`: đạt.
- `npm test`: **47/47 test đạt**, 0 fail, 0 skipped.
- `npm run check`: đạt.
- `npm run audit:roadmap`: **12/12 contract đạt**.
- Production build: đạt.
- Server/AI/PWA/IndexedDB smoke: đạt.
- AI Studio preview smoke: đạt.
- Browser interaction smoke: đạt qua pointer click, route, dialog, study, add/search, settings, import và progress.
- Hardening browser smoke: đạt qua Settings tabs, IndexedDB reload/restore, weak fallback và microphone-denied coaching recovery.

## Phạm vi chưa thể chứng minh bằng CI

- Retention và transfer sau 7–90 ngày cần dữ liệu người học thật.
- Firefox/Safari và thiết bị di động vật lý vẫn cần manual compatibility pass trước khi phát hành rộng.
- Multi-tab conflict đã có optimistic-concurrency contract và regression coverage, nhưng vẫn nên được kiểm tra thủ công trên dữ liệu lớn.

Kết luận: các cổng tự động cần cho merge đã đạt. Việc gọi sản phẩm hiệu quả hơn về học tập dài hạn vẫn phụ thuộc vào đo lường sau phát hành, không được suy ra chỉ từ test xanh.
