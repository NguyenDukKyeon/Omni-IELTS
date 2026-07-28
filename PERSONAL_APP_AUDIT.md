# Kiểm toán Vocab Master cho nhu cầu cá nhân

Ngày kiểm toán: 2026-07-27

## Kết luận

**Sẵn sàng để một người dùng học hằng ngày trên một thiết bị chính, với thư viện nhỏ hoặc trung bình.**

Điểm đánh giá sau nâng cấp: **8,7/10 cho app cá nhân**.

Ba rủi ro P0 trước đây đã được xử lý: dữ liệu chính chuyển sang IndexedDB, review events được tách append-only, và lịch FSRS được tách theo kỹ năng. App cũng có snapshot, backup đầy đủ và restore có validation.

App chưa đạt 10/10 vì chưa có đồng bộ nhiều thiết bị, Web Push vẫn cần server luôn chạy, và chưa hoàn tất kiểm thử notification/PWA trên toàn bộ thiết bị thật.

## Phần đã đạt

### Learning engine

- Phiên Hôm nay xen kẽ ôn cũ, từ mới, nhận biết, tự nhớ và chữa lỗi.
- Listening, dictation, collocation, production, mistake drill, test và deck mode có bài riêng.
- Test Mode không thay đổi lịch ôn.
- Đáp án sai được đưa lại cuối phiên.
- Flashcard có bốn mức Again/Hard/Good/Easy.
- Daily Plan chọn dạng bài theo kỹ năng có lịch đến sớm nhất.

### FSRS

- Dùng package chính thức `ts-fsrs@5.4.1` và FSRS-6.
- Có learning steps và relearning steps ngắn hạn.
- Lưu state, due, stability, difficulty, scheduled days, repetitions và lapses.
- Tính retrievability động.
- Có preview khoảng ôn cho bốn mức đánh giá.
- Tách lịch độc lập cho recognition, recall, listening, collocation và production.
- Một bài nhận biết đúng không tự động kéo dài lịch production hoặc listening.
- Dữ liệu lịch cũ được chuyển sang trạng thái gần tương đương khi học tiếp.

### Dữ liệu dài hạn

- IndexedDB là nguồn dữ liệu chính.
- Tách object stores: `cards`, `settings`, `reviewEvents`, `snapshots`, `meta`, `fileHandles`.
- Dữ liệu `localStorage` cũ được migration tự động.
- Review history cũ được tách khỏi card.
- Review events dùng append-only `add()` và ID chống trùng.
- Card chỉ giữ snapshot FSRS hiện tại và số event, không giữ lịch sử tăng không giới hạn.
- Tự tạo snapshot cục bộ và giữ tối đa 30 bản.
- Backup JSON gồm cards, settings, FSRS config, metrics và review events.
- Restore kiểm tra schema và tạo snapshot trước khi thay dữ liệu.
- Có thể chọn file auto-backup trên trình duyệt hỗ trợ File System Access API.
- Có fallback tải backup thủ công trên các trình duyệt khác.

### PWA và offline

- Có manifest standalone, icon thường, maskable icon và shortcuts.
- Có service worker và app-shell cache.
- Navigation, script và CSS dùng network-first để giảm lỗi phiên bản cũ.
- Có trang offline fallback và chỉ báo offline.
- Có luồng cài app từ trình duyệt hỗ trợ.

### Thông báo hệ điều hành

- Xin quyền từ thao tác trực tiếp của người dùng.
- Web Push dùng VAPID.
- Subscription lưu phía Node server.
- Nhắc theo giờ và múi giờ thiết bị.
- Có bật, tắt và gửi thử.
- Click thông báo mở trang Hôm nay.
- Subscription hết hạn được loại bỏ.

### Bảo mật cơ bản

- VAPID private key không nằm trong source và `.data` bị bỏ khỏi Git.
- Có giới hạn payload, rate limit, timeout và kiểm tra same-origin.
- Có CSP, `X-Content-Type-Options`, `Referrer-Policy` và `X-Frame-Options`.
- Gemini key nhập trên UI chỉ nằm trong `sessionStorage`.
- Backup được validate trước khi restore.

## Rủi ro còn lại

### P0 — thông báo cần server luôn chạy

PWA không thể tự gửi Web Push nếu Node server đã dừng. Bản local chỉ nhắc đúng giờ khi:

- máy đang bật;
- Node server vẫn chạy;
- trình duyệt còn subscription hợp lệ;
- hệ điều hành không chặn thông báo.

Để nhắc ổn định trên điện thoại hoặc khi máy chính tắt, cần deploy Node server lên dịch vụ chạy liên tục có HTTPS và persistent storage.

### P1 — chưa có đồng bộ nhiều thiết bị

- Không có tài khoản.
- Không có merge conflict hoặc tombstone.
- PWA cài trên máy khác có database riêng.
- Backup/restore là cách chuyển dữ liệu thủ công hiện tại.

Với một thiết bị chính đây không phải lỗi chặn. Với hai thiết bị trở lên, cần cloud sync dựa trên review events.

### P1 — auto-backup phụ thuộc khả năng trình duyệt

File System Access API phù hợp nhất với Edge/Chrome desktop. Trình duyệt không hỗ trợ vẫn có snapshot IndexedDB và tải backup JSON thủ công, nhưng không thể tự ghi định kỳ vào một file đã chọn.

Quyền ghi file có thể cần cấp lại sau khi đóng trình duyệt hoặc thay đổi quyền hệ điều hành.

### P1 — migration lịch cũ chỉ là xấp xỉ

Dữ liệu trước FSRS không có review log đầy đủ, nên migration dùng interval, trạng thái và số đúng/sai để tạo state gần đúng. Sau vài lượt ôn mới, FSRS sẽ điều chỉnh dần; không nên coi stability/difficulty đầu tiên là dữ liệu lịch sử chính xác.

### P1 — public deployment chưa có authentication

Push và AI endpoints có rate limit và same-origin protection nhưng chưa gắn với tài khoản. Điều này đủ cho local/private deployment, chưa đủ cho public SaaS. Public deployment cần:

- authentication;
- quota theo UID;
- CSRF/origin policy chặt;
- database cho subscription;
- secret manager;
- log và abuse monitoring.

### P2 — tương thích thiết bị

Cần kiểm thử thực tế trên:

- Edge/Chrome Windows;
- Chrome Android;
- Safari macOS;
- PWA iOS/iPadOS;
- chế độ tiết kiệm pin;
- trình duyệt chặn notification;
- update service worker khi đang có phiên học;
- khôi phục backup thật với thư viện lớn.

## Tiêu chí sử dụng an toàn hiện tại

Có thể dùng làm app học chính nếu:

- chỉ dùng chủ yếu trên một máy;
- chạy `npm run serve` hoặc deploy server riêng;
- kiểm tra nút backup sau lần cập nhật đầu tiên;
- tải backup thủ công định kỳ hoặc chọn file auto-backup;
- chấp nhận notification local không hoạt động khi server dừng;
- thư viện nhỏ hoặc trung bình.

Chưa nên dùng làm nguồn dữ liệu duy nhất nếu:

- cần học đồng thời trên nhiều thiết bị;
- không có bất kỳ bản backup ngoài trình duyệt nào;
- cần nhắc học luôn hoạt động mà không vận hành server;
- cần SLA hoặc mức bảo vệ dữ liệu của dịch vụ production.

## Ưu tiên tiếp theo

1. Deploy HTTPS luôn chạy cho Web Push.
2. Kiểm thử PWA, notification và restore trên thiết bị thật.
3. Cloud sync tùy chọn dựa trên append-only review events.
4. E2E browser test cho migration, học offline, backup và restore.
5. Khi có đủ lịch sử, tối ưu trọng số FSRS từ review events thay vì chỉ dùng trọng số mặc định.
