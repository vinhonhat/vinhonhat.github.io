// js/content.js
// TẬP TRUNG TOÀN BỘ DỮ LIỆU CỦA TRANG WEB VÀO MỘT NƠI DUY NHẤT

const allContent = [
    // --- BÀI VIẾT (POSTS) ---
    {
        type: 'post', // Loại nội dung: bài viết thông thường
        category: "seven", // Chuyên mục (để lọc ở các trang con sau này)
        date: "2025-09-29", // Ngày đăng, dùng để sắp xếp
        featured: false, // true => Sẽ được ưu tiên hiển thị ở mục "Đề xuất"
        title: "Hướng dẫn đăng ký tài khoản ngân hàng Seven Bank",
        summary: "Ngoài Yucho, đây là ngân hàng thứ 2 cho phép người mới đến Nhật có thể đăng ký dễ dàng...",
        imageUrl: "img/posts/seven/711.png",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/711/sevenbank"
    },
    {
        type: 'post',
        category: "am-thuc",
        date: "2025-09-28",
        featured: false, // Nổi bật
        title: "Cách làm món Tonkatsu chuẩn vị Nhật",
        summary: "Hướng dẫn từng bước để làm món thịt heo chiên xù Tonkatsu giòn rụm, thơm ngon ngay tại nhà.",
        imageUrl: "https://placehold.co/400x250/FBD38D/ffffff?text=Tonkatsu",
        link: "#post-2"
    },
    {
        type: 'post',
        category: "hoc-tap",
        date: "2025-11-27",
        featured: true, // Nổi bật
        title: "tài liệu ôn thi tokutei sưu tầm được",
        summary: "Phương pháp học từ vựng hiệu quả và thú vị thông qua các bài hát J-Pop nổi tiếng.",
        imageUrl: "https://placehold.co/400x250/ECC94B/ffffff?text=Học+Tiếng+Nhật",
        link: "#post-3"
    },
    {
        type: 'post',
        category: "rakuten",
        date: "2025-09-26",
        featured: true, // Nổi bật
        title: "5 Mẹo săn sale trên Rakuten Ichiba",
        summary: "Tổng hợp các bí quyết giúp bạn mua sắm thông minh và tiết kiệm hơn trên sàn Rakuten.",
        imageUrl: "https://placehold.co/400x250/F6AD55/ffffff?text=Rakuten+Sale",
        link: "#post-4"
    },
    {
        type: 'post',
        category: "doi-song",
        date: "2025-12-25",
        featured: false, // Bài viết thường, không hiển thị ở mục đề xuất
        title: "Khám phá vẻ đẹp của công viên Rinkai",
        summary: "Một trong những công viên lớn và nổi tiếng nhất Tokyo, điểm đến lý tưởng cho cả bốn mùa.",
        imageUrl: "https://placehold.co/400x250/A5D6A7/ffffff?text=Ueno+Park",
        link: "#post-5"
    },

    // --- BÀI VIẾT HƯỚNG DẪN (GUIDES) ---
    {
        type: 'guide', // Loại nội dung: Hướng dẫn
        category: "rakuten",
        date: "2025-10-02", // Ngày mới nhất
        featured: false,
        title: "Cách đăng ký tài khoản Rakuten",
        summary: "Hướng dẫn chi tiết từng bước để tạo tài khoản mua sắm.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=HD+Mới",
        link: "#guide-1"
    },
    {
        type: 'guide',
        category: "seven",
        date: "2025-10-01",
        featured: false,
        title: "Mẹo sử dụng thẻ thanh toán Seven Bank",
        summary: "Những lưu ý quan trọng khi sử dụng thẻ tại Nhật.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=HD+2",
        link: "#guide-2"
    },
    {
        type: 'guide',
        category: "sim",
        date: "2025-09-20", // Ngày cũ hơn
        featured: false,
        title: "Hướng dẫn nạp tiền vào sim Linemo",
        summary: "Các cách nạp tiền tiện lợi và nhanh chóng cho sim Linemo.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=HD+3",
        link: "#guide-3"
    },
    {
        type: 'guide', // Loại nội dung: Hướng dẫn
        category: "rakuten",
        date: "2025-10-02", // Ngày mới nhất
        featured: false,
        title: "Cách đăng ký tài khoản Rakuten",
        summary: "Hướng dẫn chi tiết từng bước để tạo tài khoản mua sắm.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=HD+Mới",
        link: "#guide-1"
    },
    {
        type: 'guide',
        category: "seven",
        date: "2025-10-01",
        featured: false,
        title: "Mẹo sử dụng thẻ thanh toán Seven Bank",
        summary: "Những lưu ý quan trọng khi sử dụng thẻ tại Nhật.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=HD+2",
        link: "#guide-2"
    },
    {
        type: 'guide',
        category: "sim",
        date: "2026-10-20", // Ngày cũ hơn
        featured: true,
        title: "Hướng dẫn đá tàu",
        summary: "Các cách nạp tiền tiện lợi và nhanh chóng cho sim Linemo.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=HD+3",
        link: "#guide-3"
    },

    // --- VIDEO HƯỚNG DẪN (VIDEOS) ---
    {
        type: 'video', // Loại nội dung: Video
        category: "line",
        date: "2035-10-05", // Ngày mới nhất
        featured: true, // Video này cũng có thể được đề xuất
        title: "Video HD đổi mk yucho",
        summary: "Mô tả ngắn về nội dung video. Thời lượng: 5:30.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=Video+Mới",
        link: "#video-1"
    },
    {
        type: 'video', // Loại nội dung: Video
        category: "line",
        date: "2025-11-05", // Ngày mới nhất
        featured: false, // Video này cũng có thể được đề xuất
        title: "Video HD xem video hài ",
        summary: "Mô tả ngắn về nội dung video. Thời lượng: 5:30.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=Video+Mới",
        link: "#video-1"
    },
    {
        type: 'video', // Loại nội dung: Video
        category: "line",
        date: "2025-9-05", // Ngày mới nhất
        featured: false, // Video này cũng có thể được đề xuất
        title: "Video HD xem video ",
        summary: "Mô tả ngắn về nội dung video. Thời lượng: 5:30.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=Video+Mới",
        link: "#video-1"
    },
    {
        type: 'video',
        category: "giao-thong",
        date: "2025-10-04",
        featured: false,
        title: "Video HD cách đi tàu điện ngầm ở Tokyo",
        summary: "Mô tả ngắn về nội dung video. Thời lượng: 8:15.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=Video+2",
        link: "#video-2"
    },
];

// --- DỮ LIỆU BANNER (Giữ nguyên, không cần gộp vào allContent) ---
const bannerSlides = [
    {
        imageUrl: "img/banners/banner1.jpg",
        link: "#"
    },
    {
        imageUrl: "img/banners/banner2.jpg",
        link: "#"
    },
    {
        imageUrl: "img/banners/banner3.jpg",
        link: "#"
    }
];