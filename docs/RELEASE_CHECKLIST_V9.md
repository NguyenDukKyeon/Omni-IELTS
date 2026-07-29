# Vocab Master v9 — Release checklist

## Automated merge gate

Đã xác minh trên code-bearing commit `4d638488dd3ebca6373219ced1d07d9ebb777ea0`, GitHub Actions run `30419397509`.

- [x] `npm ci`
- [x] `npm test` — 47/47 pass
- [x] `npm run check`
- [x] `npm run audit:roadmap` — 12/12 pass
- [x] `npm run build`
- [x] `npm run test:serve`
- [x] `npm run test:preview`
- [x] `npm run test:browser`
- [x] `npm run test:hardening`
- [x] Full restore và recovery snapshot qua persistence integration tests
- [x] Import new + merge dùng một IndexedDB transaction
- [x] Stale card/review write không âm thầm ghi đè dữ liệu mới hơn
- [x] Review liên tiếp đồng bộ storage version và không tạo stale conflict giả
- [x] PWA không `skipWaiting` trong install; update được trì hoãn ngoài phiên học

## Product acceptance tự động

- [x] Active card chỉ mở listening/production sau evidence nền
- [x] Aggregate scheduler không chọn skill còn khóa
- [x] Draft Quick Capture không xuất hiện trong Today
- [x] Manual production rỗng không thể được ghi nhận
- [x] Accepted answer không rò sang exercise/skill khác
- [x] Daily completion phản ánh independent reviews, không tính skip/warm-up
- [x] AI không điều khiển due date, mastery hoặc retention
- [x] Pronunciation fallback vẫn cho nghe mẫu và tiếp tục không chấm; không thay đổi FSRS
- [x] AI tắt vẫn giữ core add/import/study/review/backup/TTS contracts

## Manual release validation còn mở

Các mục dưới đây không chặn merge kỹ thuật nhưng phải hoàn thành trước khi quảng bá phát hành rộng:

- [ ] Backup → xóa dữ liệu → restore trên Chromium bằng dữ liệu người dùng thật
- [ ] Backup → restore trên Firefox
- [ ] Compatibility pass trên Firefox/Safari
- [ ] Mobile pass trên ít nhất một thiết bị Android và một thiết bị iOS
- [ ] Hai tab cùng sửa một card trên thư viện lớn
- [ ] PWA update trong một phiên học dài trên thiết bị thật
- [ ] Theo dõi retention, transfer, workload và calibration sau 7–90 ngày
