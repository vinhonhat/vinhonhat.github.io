BIO LINK - VINH Ở NHẬT
======================

1. CÁCH SỬA NỘI DUNG
- Mở file: js/config.js
- Muốn hiện Facebook, Messenger, Zalo, LINE, số điện thoại...:
  đổi: enabled: false
  thành: enabled: true
- Sau đó thay URL mẫu bằng URL thật.

Ví dụ số điện thoại Nhật:
url: "tel:+819012345678"

Ví dụ Messenger:
url: "https://m.me/tennguoidung"

Ví dụ Zalo:
url: "https://zalo.me/84901234567"

Ví dụ LINE:
url: "https://line.me/ti/p/~line-id"

2. ĐỔI ẢNH ĐẠI DIỆN
- Chép ảnh vào thư mục assets, ví dụ assets/avatar.jpg
- Trong js/config.js sửa:
  avatar: "assets/avatar.jpg"

3. ĐƯA LÊN GITHUB PAGES
- Chép nguyên thư mục này thành thư mục /bio trong kho GitHub Pages.
- Địa chỉ sẽ là:
  https://vinhonhat.github.io/bio/

4. CÁC CHỨC NĂNG ĐÃ CÓ
- Giao diện tự thích ứng điện thoại và máy tính
- Chế độ sáng/tối
- Nút chia sẻ
- Mã QR
- Các mục ẩn sẵn: Facebook, Messenger, TikTok, YouTube, điện thoại, Zalo, LINE, email, bản đồ
- Không cần cơ sở dữ liệu hay máy chủ riêng
