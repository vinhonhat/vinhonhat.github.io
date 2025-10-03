// js/content.js
// TẬP TRUNG TOÀN BỘ DỮ LIỆU CỦA TRANG WEB VÀO MỘT NƠI DUY NHẤT

const allContent = [
    // --- BÀI VIẾT (POSTS) ---
    {
        type: 'post', // Loại nội dung: bài viết thông thường
        category: "sim", // Chuyên mục (để lọc ở các trang con sau này)
        date: "2025-09-29", // Ngày đăng, dùng để sắp xếp
        featured: true, // true => Sẽ được ưu tiên hiển thị ở mục "Đề xuất"
        title: "Hướng dẫn cài cấu hình APN sim data",
        summary: "cách cài cấu hình sim data cho các nhà mạng tại Nhật Bản như softbank, docomo, rakuten...cho iPhone và Android. ",
        imageUrl: "img/posts/APN img.png",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/khac/apn?authuser=0"
    },
    {
        type: 'post',
        category: "game",
        date: "2025-09-30",
        featured: true, // Nổi bật
        title: "Chơi Game rắn săn mồi",
        summary: "mini game rắn săn mồi trên ứng dụng",
        imageUrl: "https://placehold.co/400x250/FBD38D/ffffff?text=Tonkatsu",
        link: "pages/pages-giaitri/snake.html"
    },
    {
        type: 'post',
        category: "game",
        date: "2025-10-01",
        featured: true, // Nổi bật
        title: "Game Flappy Bird",
        summary: "chơi game",
        imageUrl: "https://placehold.co/400x250/ECC94B/ffffff?text=Học+Tiếng+Nhật",
        link: "pages/pages-giaitri/FlappyBird.html"
    },
    {
        type: 'post',
        category: "rakuten",
        date: "2025-04-26",
        featured: true, // Nổi bật
        title: "5 Mẹo săn sale trên Rakuten Ichiba",
        summary: "Tổng hợp các bí quyết giúp bạn mua sắm thông minh và tiết kiệm hơn trên sàn Rakuten.",
        imageUrl: "https://placehold.co/400x250/F6AD55/ffffff?text=Rakuten+Sale",
        link: "#post-4"
    },
    {
        type: 'post',
        category: "rakuten",
        date: "2025-2-25",
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
        date: "2025-09-29", // Ngày mới nhất
        featured: true,
        title: "Cách đăng ký tài khoản City Exxpress - chuyển tiền Nhật Việt",
        summary: "Hướng dẫn chi tiết từng bước để tạo tài khoản chuyển tiền về Việt Nam với tỷ giá cao nhất và phí chuyển tiền rẻ nhất lại còn được hoàn point.",
        imageUrl: "https://img.favpng.com/21/10/7/logo-remittance-city-express-money-transfer-japan-co-ltd-brand-png-favpng-K39it6YWHKeAJm0NwUKpjnpJv.jpg",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/express-money-transfer/city_express?authuser=0"
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
        category: "rakuten",
        date: "2025-1-01",
        featured: false,
        title: "Mẹo sử dụng thẻ thanh toán Seven Bank",
        summary: "Những lưu ý quan trọng khi sử dụng thẻ tại Nhật.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=HD+2",
        link: "#guide-2"
    },
    {
        type: 'guide',
        category: "seven",
        date: "2025-09-29", // Ngày cũ hơn
        featured: true,
        title: "Hướng dẫn đăng ký thẻ ngân hàng seven bank",
        summary: "Ngoài ngân hàng yucho thì đây là ngân hàng thứ 2 cho phép người mới tới nhật cũng có thể đăng ký và rất dễ ở ngoài cây ATM.",
        imageUrl: "https://creww.me/assets/collaboration/contents/sevenbank-2016-02/logo-99b065e63fcbc1acea62a64e95a7d5b17b8446373e79ed723369e52e21a60335.png",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/711/sevenbank?authuser=0"
    },

    // --- VIDEO HƯỚNG DẪN (VIDEOS) ---
    {
        type: 'video', // Loại nội dung: Video
        category: "line",
        date: "2024-10-05", // Ngày mới nhất
        featured: true, // Video này cũng có thể được đề xuất
        title: "Video HD đổi mk yucho",
        summary: "Mô tả ngắn về nội dung video. Thời lượng: 5:30.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=Video+Mới",
        link: "#video-1"
    },
    {
        type: 'video', // Loại nội dung: Video
        category: "line",
        date: "2025-1-05", // Ngày mới nhất
        featured: false, // Video này cũng có thể được đề xuất
        title: "Video HD xem video hài ",
        summary: "Mô tả ngắn về nội dung video. Thời lượng: 5:30.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=Video+Mới",
        link: "#video-1"
    },
    {
        type: 'video', // Loại nội dung: Video
        category: "app",
        date: "2025-9-29", // Ngày mới nhất
        featured: false, // Video này cũng có thể được đề xuất
        title: "Video HD chuyển vùng Apple Store ",
        summary: "Hướng dẫn chuyển vùng Apple Store qua Nhật Bản và về lại Việt Nam để tải các ứng dụng theo vùng...",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa4GHxWR1R2b5i4W_-6OERHtP1rSQpw-0YdQ&s",
        link: "https://www.google.com/url?q=https%3A%2F%2Fwww.tiktok.com%2F%40tqv2020%2Fvideo%2F7439850028845239570%3Fis_from_webapp%3D1%26sender_device%3Dpc%26web_id%3D7492301021865199105&sa=D&sntz=1&usg=AOvVaw0UggzekE0ReO1vkDZosck-"
    },
    {
        type: 'video',
        category: "yucho",
        date: "2025-09-29",
        featured: true,
        title: "Video HD cách đổi số điện thoại tài khoản yucho",
        summary: "hướng dẫn đổi mật khẩu thẻ yucho tại cây ATM của bưu điện và tại family mart.",
        imageUrl: "https://play-lh.googleusercontent.com/pHDhGjmtwOrgrg3XXP_vL99pCngi-7ED93InYG5zQpJjJQmIwfYGlo0zAC39NYOKggA",
        link: "https://www.google.com/url?q=https%3A%2F%2Fvt.tiktok.com%2FZSr9N3Cwp%2F&sa=D&sntz=1&usg=AOvVaw1CXDvIliTXPvUezlroVD30"
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