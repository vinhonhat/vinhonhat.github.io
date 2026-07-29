BIO LINK ADMIN V11

- EN dùng cờ Anh (United Kingdom) và mã EN.
- Icon bé: chọn icon lớn rồi nhấn “Đồng bộ ngay”.
- Đồng bộ là sao chép một lần: tên, link, icon/ảnh, nền và bản dịch.
- Sau khi sao chép, mọi ô của icon bé vẫn chỉnh sửa độc lập bình thường.
- File config.js trong bộ này dùng đúng cấu hình Anh vừa gửi.

Mở cài đặt: nhấn logo 5 lần.
Sau khi chỉnh, tải config.js rồi thay vào js/config.js trước khi đưa lên GitHub.


MỚI Ở V8
- Icon bé có bộ icon thương hiệu đơn sắc: Facebook, Messenger, TikTok, Zalo, LINE, YouTube và Gmail/Email.
- Trong tab “Icon bé dưới cùng”, có thể chọn Tự nhận diện, chọn thương hiệu cụ thể hoặc tắt icon thương hiệu để dùng ảnh/icon thủ công.
- “Đồng bộ ngay” sao chép link và dữ liệu một lần; sau đó vẫn chỉnh sửa bình thường.
- Ở giao diện sáng, hover có viền theo màu chủ đạo, nền màu nhạt và vệt sáng màu rõ hơn.


CẬP NHẬT V9
- Giao diện công khai không còn bôi đen/chọn chữ khi nhấn giữ.
- Chặn menu nhấn giữ và kéo ảnh ở phần công khai; bảng cài đặt vẫn nhập/chọn chữ bình thường.
- Mobile: chạm nhanh chạy hiệu ứng khoảng nửa giây rồi mới mở link.
- Mobile: chạm giữ khoảng 0,56 giây chỉ giữ trạng thái hiệu ứng, không mở link.
- Vuốt để cuộn sẽ hủy thao tác chạm, không mở nhầm liên kết.


CẬP NHẬT V10
- Tab “Icon liên kết” và “Icon bé dưới cùng” có nút “Sắp xếp”.
- Nhấn nút sẽ mở popup danh sách gọn chỉ gồm tên và trạng thái hiện/ẩn.
- Giữ núm 6 chấm rồi kéo trực tiếp lên/xuống, dùng được cả chuột và cảm ứng.
- Có thêm mũi tên lên/xuống làm phương án dự phòng.
- Nhấn “Xong” đóng popup; thứ tự mới được giữ ngay trong bản chỉnh sửa và lưu vào config khi bấm “Lưu & xem trước” hoặc “Tải config.js”.


CẬP NHẬT V11 - TỰ NHẬN DIỆN NGÔN NGỮ
----------------------------------------
Trong Cấu hình > Ngôn ngữ mặc định, chọn “Tự nhận diện theo máy”.
- Trình duyệt/máy dùng tiếng Việt (vi, vi-VN...) -> Tiếng Việt.
- Trình duyệt/máy dùng tiếng Nhật (ja, ja-JP...) -> Tiếng Nhật.
- Mọi ngôn ngữ khác -> Tiếng Anh.

Nếu người xem tự chọn VI/JP/EN bằng nút ngôn ngữ, lựa chọn đó được nhớ riêng trên trình duyệt của họ.

- Mỗi nút liên kết có công tắc “Hiện nhãn nhỏ ở cả VI / JP / EN”.
- Tắt công tắc này sẽ ẩn nhãn ở mọi ngôn ngữ, kể cả khi ô JP/EN còn chữ cũ.
- “Hiện nơ nổi bật” bật/tắt cùng lúc nhãn VI / JP / EN; nút không bị tô vàng toàn bộ.


V12: “Nổi bật” chỉ hiện nơ/nhãn nhỏ đa ngôn ngữ cạnh tên liên kết; không tô vàng toàn bộ nút.

CẬP NHẬT V13
- Trong tab Icon liên kết và Icon bé, mục đang hiện có viền theo màu chủ đạo và nền nhạt trong toàn bộ khung chỉnh sửa.
- Mục đang ẩn giữ khung trung tính, không có viền màu chủ đạo.
- Cấu hình mới “Nền và khung trang” cho phép đổi màu nền ngoài, nền trong ở giao diện sáng/tối.
- Có thể dùng ảnh PNG/WEBP/JPG/SVG thay cho màu nền ngoài hoặc nền trong.
- Các đốm tròn trang trí ngoài nền mặc định được tắt và có thể bật lại.
- Viền khung Bio lấy theo màu chủ đạo và có công tắc bật/tắt.


=== LƯU TRỰC TIẾP TRÊN HOST PHP (V14) ===
1. Tải toàn bộ thư mục lên host, giữ nguyên thư mục api và js.
2. Host cần hỗ trợ PHP 7.4 trở lên.
3. Đảm bảo PHP có quyền ghi file js/config.js và api/.admin-password.
4. Mở trang, nhấn logo 5 lần, đăng nhập rồi chọn “Lưu lên máy chủ”.
5. “Lưu & xem trước” chỉ lưu trên trình duyệt; “Tải config.js” là bản dự phòng.
6. Nếu báo không có quyền ghi, đặt quyền thư mục js và api thành 755/775 tùy host; không nên dùng 777 nếu không cần.
7. GitHub Pages không chạy PHP nên nút lưu máy chủ không dùng được trên GitHub Pages.

Bảo mật: api/.htaccess chặn đọc file mật khẩu trên Apache. Với Nginx cần cấu hình chặn truy cập file bắt đầu bằng dấu chấm.
