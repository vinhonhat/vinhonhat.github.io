BIO LINK V1.7.8-beta - GITHUB

Thay đổi chính:
- Avatar không còn nhập đường dẫn trong Admin.
- Chọn ảnh từ máy/album, hệ thống tự crop giữa ảnh thành PNG tròn 512x512.
- Nếu chưa có avatar.png hoặc ảnh lỗi, trang và favicon dùng 2 chữ cái từ tên hồ sơ.
- Khi chưa có ảnh mới: hiện nút Tải profile.js.
- Khi có avatar/nền/icon lớn mới: ẩn nút profile.js và hiện nút Tải gói cập nhật ZIP.
- ZIP chứa profile.js và file ảnh thật như avatar.png, không nhúng chuỗi Base64 vào file xuất.
- Icon lớn có thể dùng ảnh màu; icon bé luôn dùng icon thương hiệu/SVG đơn sắc.
- Tên file QR/ZIP ưu tiên tên sau @, ví dụ @thaosakura -> thaosakura-qr-card.png.

Bản beta chỉ dành cho GitHub. Chưa đóng bản Linux/PHP.
