# Vocab Master v8 — Personal Vocabulary Memory Coach

Vocab Master là PWA local-first dành cho người Việt học từ vựng và collocation. Bản v8 ưu tiên ba lời hứa sản phẩm:

1. Thu thập từ/cụm từ nhanh nhưng luôn cho người học kiểm tra nội dung trước khi lưu.
2. Tạo phiên học theo **kỹ năng thực sự đến hạn**, không chỉ theo danh sách thẻ hoặc minigame.
3. Bảo vệ dữ liệu học dài hạn bằng IndexedDB, transaction nguyên tử, outbox, snapshot và backup đầy đủ.

Bốn khu vực chính vẫn được giữ gọn: **Hôm nay, Thêm từ, Thư viện, Tiến bộ**. Các chế độ luyện riêng nằm trong **Luyện thêm**.

## 1. Learning engine và FSRS

Ứng dụng sử dụng `ts-fsrs@5.4.1` và lịch FSRS riêng cho năm kỹ năng:

```text
recognition
recall
listening
collocation
production
```

### Skill profile

Mỗi thẻ có mục tiêu học thụ động hoặc chủ động:

- Từ thụ động: recognition, recall.
- Từ chủ động: recognition, recall, listening, production.
- Collocation thụ động: recognition, recall, collocation.
- Collocation chủ động: cả năm kỹ năng.

Skill chưa từng được kiểm tra được xem là một khoảng trống cần học, thay vì bị bỏ qua. Trạng thái mastered chỉ đạt khi toàn bộ skill bắt buộc đã có dữ liệu và đạt độ ổn định yêu cầu.

### Adaptive Session Composer

Phiên Hôm nay được xây từ các cặp `(card, skill)` đến hạn, time budget và mục tiêu của người học. Hệ thống:

- Ưu tiên skill quá hạn hoặc có khả năng nhớ thấp.
- Chọn dạng bài phù hợp với skill cần kiểm tra.
- Không cắt dở chuỗi học từ mới `intro → recognition → recall`.
- Đánh dấu bài sửa ngay sau lỗi là `assisted`, không dùng bài vừa nhìn đáp án để kéo dài lịch.
- Giữ Test Mode và phát âm ngoài lịch FSRS.
- Tạo Transfer Check sau khi từ đạt mức active-ready.

### Rating

- `Again`: không truy hồi được.
- `Hard`: truy hồi thành công nhưng khó hoặc có lỗi nhỏ.
- `Good` và `Easy`: truy hồi thành công ở mức tương ứng.

Hotkey chấm điểm chỉ hoạt động sau khi đáp án đã được lật. Nút **Đáp án của tôi cũng đúng** chỉ commit một kết quả cuối cùng và thêm accepted variant, không ghi một lượt sai trước đó.

## 2. Dữ liệu và khả năng phục hồi

IndexedDB là nguồn dữ liệu chính. Database v3 gồm:

```text
cards
settings
reviewEvents
snapshots
meta
fileHandles
outbox
```

Các bảo vệ quan trọng:

- Không còn reset lịch học ngầm khi migration.
- Thư viện rỗng được xem là trạng thái hợp lệ; dữ liệu mẫu chỉ được thêm khi người dùng chủ động chọn.
- Mỗi lượt ôn cập nhật một card, một review event và metrics trong cùng transaction.
- Outbox lưu thao tác trước khi ghi chính, cho phép phát lại sau lỗi.
- Review event có ID ổn định và chống ghi trùng.
- Ghi thẻ dùng timestamp để không phát lại một bản cũ đè lên bản mới.
- BroadcastChannel phát hiện thay đổi từ tab khác.
- Snapshot chứa cả cards và review events, có thể restore trong UI.
- Backup schema v3 kiểm tra ID trùng, lịch FSRS, rating, timestamp, target skill và giới hạn kích thước.
- Reset lịch học là hành động có xác nhận và tạo snapshot an toàn trước.
- Có nút yêu cầu persistent storage và hiển thị quota/pending writes.

Khi IndexedDB tồn tại nhưng khởi động lỗi, app hiển thị lỗi thay vì âm thầm chuyển sang một database localStorage khác. LocalStorage chỉ còn là fallback cho trình duyệt không có IndexedDB.

## 3. Quản lý thư viện và import

Thư viện hỗ trợ:

- Sửa card.
- Tạm dừng/khôi phục card.
- Xóa có hoàn tác.
- Tìm kiếm theo từ, nghĩa, ví dụ, deck, mnemonic và ngữ cảnh nguồn.
- Nhiều sense cho cùng một mặt từ; duplicate identity gồm từ, nghĩa và loại card.
- Import CSV/TSV/TXT/JSON với quoted field và multiline CSV.
- Preview lỗi theo dòng.
- Chiến lược conflict: bỏ qua hoặc merge trường còn thiếu.
- Bulk persistence trong một batch.

AI enrich trả về loại card và accepted variants; các trường này được đưa vào draft để người dùng xác nhận trước khi lưu.

## 4. Gemini AI

AI được định vị là **editor và coach**, không phải nguồn chân lý hoặc scheduler.

Server có:

- Allowlist model.
- JSON Schema riêng cho từng endpoint.
- Runtime validation và clamp score/range.
- Timeout, retry/backoff, cache và telemetry.
- Đánh giá output theo từng target term.
- Context Capture chỉ đề xuất từ/collocation; không tự thêm vào thư viện.
- Provenance cho nội dung AI đã lưu.

Các endpoint chính:

```text
/api/ai/enrich
/api/ai/evaluate
/api/ai/mnemonic
/api/ai/context-example
/api/ai/context-capture
/api/ai/output-practice
/api/ai/pronunciation
```

Khi server có `GEMINI_API_KEY`, model được khóa theo cấu hình server. Khi không có server key, người dùng có thể nhập key chỉ lưu trong `sessionStorage` của phiên trình duyệt.

## 5. Phát âm và audio

- Web Speech chọn giọng theo accent, voice URI và tốc độ.
- Phát âm dùng vòng lặp nghe mẫu → ghi âm → coaching → thử lại.
- Gemini chỉ ước tính mức dễ hiểu, nêu độ tin cậy và tối đa vài lỗi cần tập trung.
- SpeechRecognition fallback chỉ báo trình duyệt nhận ra transcript, không giả làm điểm phát âm.
- Kết quả phát âm không cập nhật production FSRS.

## 6. Tiến bộ và khác biệt hóa

Progress tập trung vào hành động:

- Skill coverage: tỷ lệ skill bắt buộc đã được kiểm tra.
- Expected recall trên phần dữ liệu đã kiểm chứng.
- Forecast workload bảy ngày.
- Error Fingerprint: spelling, meaning, listening, collocation, production.
- Active/passive vocabulary profile.
- Exam pacing theo ngày mục tiêu, chỉ là khối lượng tối thiểu chứ không dự đoán điểm thi.
- Transfer Check trong ngữ cảnh mới.

## 7. PWA, offline và thông báo

- App shell cache để dùng offline.
- Manifest và icon cài đặt.
- Web Push theo giờ, timezone và locale của thiết bị.
- Khi subscription thay đổi, service worker gửi lại đầy đủ reminder config.
- Không hiển thị hành động “snooze” giả; notification chỉ có hành vi thực sự được hỗ trợ.

Web Push thật cần Node server luôn chạy và production cần HTTPS.

## 8. Accessibility và responsive

- Study overlay là dialog modal có focus trap và restore focus.
- Icon button có accessible name.
- Feedback có live region.
- Card thư viện không còn lồng button trong `role=button`.
- Có `prefers-reduced-motion` để giảm flip, shake và smooth animation.
- Hotkey không hoạt động khi đang nhập văn bản hoặc trước khi có thể chấm.

## 9. Cấu hình môi trường

Sao chép `.env.example` nếu dùng server key hoặc Web Push cố định:

```dotenv
GEMINI_API_KEY=
GEMINI_MODELS=gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite
GEMINI_MODEL=gemini-3.6-flash
VAPID_SUBJECT=mailto:admin@example.com
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

Không commit API key hoặc VAPID private key.

## 10. Chạy local

Yêu cầu Node.js `>=20.19`.

```bash
npm install
npm run build
npm run serve
```

Mặc định server chạy tại:

```text
http://localhost:3000
```

Phát triển với Vite:

```bash
npm run dev
```

## 11. Kiểm tra

```bash
npm test
npm run check
npm run build
npm run test:serve
npm run test:browser
npm run test:hardening
```

- `npm test`: FSRS theo skill, session composer, progress, migration, persistence và backup.
- `npm run check`: đối chiếu hợp đồng HTML/CSS/JS/server/PWA.
- `npm run build`: bundle production vào `dist/`.
- Các smoke test yêu cầu dependency đã được cài và browser runtime phù hợp.

Roadmap hiện hành nằm trong `docs/ROADMAP.md`; acceptance chi tiết và evidence thực tế nằm trong `docs/IMPLEMENTATION_PLAN.md` và `docs/IMPLEMENTATION_STATUS.md`. `IMPLEMENTATION_REPORT.md` chỉ là báo cáo lịch sử của baseline cũ.

## 12. Giới hạn có chủ ý

Bản này vẫn là ứng dụng cá nhân/local-first. Chưa thêm:

- Tài khoản và đồng bộ đa thiết bị.
- Social/leaderboard/coin/energy.
- AI tự quyết lịch ôn hoặc mastery.
- Marketplace deck.
- Tự tối ưu tham số FSRS khi chưa đủ dữ liệu review tin cậy.

Những giới hạn này giúp ưu tiên độ đúng của việc học, độ ổn định dữ liệu và khả năng bảo trì hơn số lượng tính năng.
