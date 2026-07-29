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

## Cần xác minh trên CI/browser thật

Báo cáo này mô tả thay đổi mã. Production-ready chỉ được công nhận khi toàn bộ release checklist và GitHub Actions đều xanh.
