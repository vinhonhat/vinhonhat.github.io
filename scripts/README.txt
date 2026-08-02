CÔNG CỤ DỮ LIỆU BETA 2

Nguồn nội dung chuẩn là file HTML của từng bài.
- data/posts.json: metadata dành cho Admin, không còn contentHtml dài.
- data/posts-index.json: chỉ mục nhẹ dành cho trang chủ và chuyên mục.
- data/posts-search.json: chỉ tải khi mở tìm kiếm, có thêm từ khóa trong nội dung.
- data/legacy-content.json: nội dung JSON cũ dự phòng; trang người đọc không tải file này.

Sau khi sửa thủ công data/posts.json, chạy:

node scripts/rebuild-posts-index.js

Script chấp nhận cả:
- posts.json cũ là một mảng;
- posts.json Beta 2 là object có schemaVersion và mảng posts.

Script sẽ kiểm tra ID, link, ngày và tạo lại posts-index.json và posts-search.json.
