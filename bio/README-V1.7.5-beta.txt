BIO LINK V1.7.5-beta — BẢN GITHUB THỬ NGHIỆM

CẤU TRÚC DỮ LIỆU
- profile.js của từng tài khoản chứa toàn bộ dữ liệu và thiết lập cá nhân:
  tên, link, màu sắc, QR, mật khẩu băm, cách nhấn/giữ logo...
- system-config.js, index.html, css/ và js/ chỉ chứa phiên bản, giao diện và chức năng hệ thống.
- Không còn bắt buộc dùng admin-config.js riêng.
- Nếu thư mục cũ còn admin-config.js, hệ thống chỉ đọc tạm để di chuyển. Sau khi tải profile.js mới,
  dữ liệu trong profile.js được ưu tiên.

ĐƯỜNG DẪN
/bio/       tài khoản chính
/bio/thao/  tài khoản Thảo
/bio/duyen/ tài khoản Duyên

ẢNH DÙNG CHUNG VÀ ẢNH RIÊNG
- Avatar và hai ảnh nền: riêng từng tài khoản.
- Ảnh icon lớn và icon bé: tài khoản chính quản lý dùng chung qua shared-assets.js.
- Website dùng assets/web.webp đã được cắt sát nội dung để icon hiển thị lớn hơn.

LƯU ẢNH QR
- Windows/macOS/Android: nút Lưu ảnh QR tải PNG trực tiếp.
- iPhone/iPad: dùng bảng chia sẻ của iOS để chọn Lưu hình ảnh.
- Nút Sao chép ảnh đưa toàn bộ danh thiếp QR vào clipboard nếu trình duyệt hỗ trợ HTTPS + ClipboardItem.

CẬP NHẬT
- Chỉ sửa chữ/link/màu/mật khẩu: tải profile.js.
- Có thay avatar hoặc ảnh nền: tải gói ZIP dữ liệu.
- Cập nhật hệ thống bằng patch sẽ không ghi đè profile.js, shared-assets.js, avatar hoặc ảnh nền.
