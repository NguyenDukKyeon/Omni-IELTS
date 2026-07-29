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

## Audit cuối đã đóng trong mã

- Aggregate FSRS chỉ chọn `nextSkill` trong tập kỹ năng đã mở; coverage và mastery vẫn dùng toàn bộ mục tiêu.
- Review persistence đồng bộ `storageUpdatedAt` trở lại card trong bộ nhớ, hỗ trợ các lượt ôn liên tiếp.
- Stale review bị loại khỏi outbox thay vì retry vô hạn; trạng thái UI được hoàn tác khi write không được bảo vệ.
- Calibration so sánh sai lệch theo đơn vị tỷ lệ với ngưỡng 8 điểm phần trăm.
- Browser smoke dùng selector thư viện hiện hành và kiểm tra control trước khi bấm.
- Form thêm từ giữ tham chiếu form ổn định qua `await`, không dùng `event.currentTarget` sau bất đồng bộ.
- Toàn bộ script, marker và workflow vá tạm đã được loại khỏi nhánh sản phẩm và `main`.

## Cổng phát hành

Mã cuối đang được xác minh lại bằng GitHub Actions qua unit/integration tests, static cross-check, roadmap audit, production build, server smoke, preview smoke, browser interaction smoke và hardening browser smoke. Production-ready chỉ được công nhận khi toàn bộ chuỗi này xanh trên cùng một head commit.
