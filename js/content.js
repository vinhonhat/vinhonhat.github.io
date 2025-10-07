// js/content.js
// TẬP TRUNG TOÀN BỘ DỮ LIỆU CỦA TRANG WEB VÀO MỘT NƠI DUY NHẤT

const allContent = [
    // --- BÀI VIẾT (POSTS) ---
    // --- SIM ---
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
        type: 'post', // Loại nội dung: bài viết thông thường
        category: "sim", // Chuyên mục (để lọc ở các trang con sau này)
        date: "2025-09-29", // Ngày đăng, dùng để sắp xếp
        featured: true, // true => Sẽ được ưu tiên hiển thị ở mục "Đề xuất"
        title: "Hướng dẫn lấy mã MNP chuyển mạng AU",
        summary: "cách lấy mã MNP chuyển mạng giữ số của nhà mạng AU, UQ để chuyển sang nhà mạng khác ",
        imageUrl: "img/posts/MNP.jpg",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/khac/l%E1%BA%A5y-m%C3%A3-mnp-auuq?authuser=0"
    },

    // --- tokutei ---
    {
        type: 'post',
        category: "tokutei",
        date: "2025-09-30",
        featured: true, // Nổi bật
        title: "Tài liệu ôn thi nhà hàng",
        summary: "tổng hợp tài liệu ôn thi tokutei nhà hàng",
        imageUrl: "https://placehold.co/400x250/FBD38D/ffffff?text=tokutei レストラン",
        link: "/pages/pages-hoctap/nhahang.html"
    },
    {
        type: 'post',
        category: "tokuei",
        date: "2025-10-01",
        featured: true, // Nổi bật
        title: "Tài liệu ôn thi thực phẩm ",
        summary: "tổng hợp tài liệu ôn thi tokutei thực phẩm ",
        imageUrl: "img/posts/giaitri/FlappyBird.png",
        link: "/pages/pages-hoctap/thucpham.html"
    },
    {
        type: 'post',
        category: "tokuei",
        date: "2025-10-05",
        featured: false,
        title: "Tài liệu ôn thi kaigo",
        summary: "tổng hợp tài liệu ôn thi tokutei kaigo",
        imageUrl: "img/posts/giaitri/vongquay.png",
        link: "/pages/pages-hoctap/kaigo.html"
    },
    {
        type: 'post',
        category: "tokuei",
        date: "2025-10-04",
        featured: true, // Nổi bật
        title: "Game Sudoku",
        summary: "chơi game",
        imageUrl: "https://placehold.co/400x250/ECC94B/ffffff?text=Sudoku",
        link: "/pages/pages-giaitri/sudoku.html"
    },
    // --- GAME ---
    {
        type: 'post',
        category: "game",
        date: "2025-09-30",
        featured: true, // Nổi bật
        title: "Chơi Game rắn săn mồi",
        summary: "mini game rắn săn mồi trên ứng dụng",
        imageUrl: "https://placehold.co/400x250/FBD38D/ffffff?text=Snake",
        link: "/pages/pages-giaitri/snake.html"
    },
    {
        type: 'post',
        category: "game",
        date: "2025-10-01",
        featured: true, // Nổi bật
        title: "Game Flappy Bird",
        summary: "chơi game",
        imageUrl: "img/posts/giaitri/FlappyBird.png",
        link: "/pages/pages-giaitri/FlappyBird.html"
    },
    {
        type: 'post',
        category: "game",
        date: "2025-10-05",
        featured: false,
        title: "🎡 Vòng Quay Diệu Kỳ 🎡",
        summary: "vòng quay giúp bạn đỡ phân vân với những lựa chọn của mình, giải trí vui",
        imageUrl: "img/posts/giaitri/vongquay.png",
        link: "/pages/pages-giaitri/vongquay.html"
    },
    {
        type: 'post',
        category: "game",
        date: "2025-10-04",
        featured: true, // Nổi bật
        title: "Game Sudoku",
        summary: "chơi game",
        imageUrl: "https://placehold.co/400x250/ECC94B/ffffff?text=Sudoku",
        link: "/pages/pages-giaitri/sudoku.html"
    },
    // --- RAKUTEN ---
    {
        type: 'post',
        category: "rakuten",
        date: "2025-10-06",
        featured: true, // Nổi bật
        title: "Phát hành lại hoá đơn thanh toán combini của rakuten mobile",
        summary: "Hướng dẫn phát hành lại phiếu thanh toán cước sim rakuten khi bạn quên cho tiền vào thẻ để trừ tiền.",
        imageUrl: "https://rmcs.file.force.com/servlet/servlet.ImageServer?id=0152r0000003fDX&oid=00D2r000000CtMv&lastMod=1676526487000",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/rakuten/bill?authuser=0"
    },
    {
        type: 'post',
        category: "rakuten",
        date: "2025-10-06",
        featured: true, // Nổi bật
        title: "Tham gia nhóm gia đình để giảm giá cước của rakuten mobile",
        summary: "Tổng hợp các họ của các bạn đang dùng rakuten để tham gia nhóm gia đình để giảm giá cước sim hàng tháng.",
        imageUrl: "https://network.mobile.rakuten.co.jp/assets/img/fee/family/ogp-20240410.png",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/rakuten/family?authuser=0"
    },
    {
        type: 'guide', // Loại nội dung: Hướng dẫn
        category: "rakuten",
        date: "2025-10-05", // Ngày mới nhất
        featured: true,
        title: "Cách tính cước sim nhà mạng Rakuten",
        summary: "Hướng dẫn chi tiết xem cách tính và ngày đóng cước sim nhà mạng rakuten đơn giản nhất.",
        imageUrl: "https://corp.mobile.rakuten.co.jp/assets/img/common/ogp.png?200323",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/rakuten/c%C6%B0%E1%BB%9Bc-sim?authuser=0"
    },    
    {
        type: 'post',
        category: "rakuten",
        date: "2025-10-06",
        featured: false, // Bài viết thường, không hiển thị ở mục đề xuất
        title: "Cách báo mất thẻ và phát hành lại thẻ Rakuten Credit",
        summary: "Hướng dẫn khoá thẻ và phát hành lại thẻ Credit của rakuten 1 cách nhanh chóng nhất để bảo vệ tài khoản của mình.",
        imageUrl: "https://image.card.jp.rakuten-static.com/card_corp/pc/contents/logo_200x200.gif",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/rakuten/b%C3%A1o-m%E1%BA%A5t-th%E1%BA%BB-rakuten-credit?authuser=0"
    },

   // --- SEVEN ---
    {
        type: 'guide', // Loại nội dung: Hướng dẫn
        category: "seven",
        date: "2025-09-29", // Ngày mới nhất
        featured: true,
        title: "Cách đăng ký tài khoản trực tuyến của Seven Bank",
        summary: "Hướng dẫn chi tiết từng bước để tạo tài khoản trực tuyến của Seven Bank 1 cách đơn giản nhất để dùng thanh toán tiền sim.... .",
        imageUrl: "https://img.favpng.com/21/10/7/logo-remittance-city-express-money-transfer-japan-co-ltd-brand-png-favpng-K39it6YWHKeAJm0NwUKpjnpJv.jpg",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/711/create-account-711?authuser=0"
    },
    {
        type: 'guide',
        category: "seven",
        date: "2025-10-01",
        featured: false,
        title: "Hướng dẫn đăng nhập ứng dụng Seven Bank",
        summary: "cách đăng nhập ứng dụng seven bank để quản lý tài khoản, chi tiêu ngân hàng của bạn đơn giản nhất.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=HD+2",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/711/app-sevenbank?authuser=0"
    },
    {
        type: 'guide',
        category: "seven",
        date: "2025-09-20", // Ngày cũ hơn
        featured: false,
        title: "Hướng dẫn cập nhật thẻ ngoại kiều cho Sevenbank",
        summary: "Cách cập nhật thẻ ngoại kiều mới để tiếp tục dùng ngân hàng seven bank 1 cách nhanh chóng và dễ dàng.",
        imageUrl: "https://placehold.co/120x80/FBF7F0/718096?text=HD+3",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/711/update-card-711?authuser=0"
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
    {
        type: 'guide',
        category: "seven",
        date: "2025-09-29", // Ngày cũ hơn
        featured: true,
        title: "Đăng ký thẻ Debit của Seven bank",
        summary: "Cách đăng ký thẻ debit cho những người có thẻ ngân hàng seven bank mà chưa có thẻ debit. .",
        imageUrl: "https://creww.me/assets/collaboration/contents/sevenbank-2016-02/logo-99b065e63fcbc1acea62a64e95a7d5b17b8446373e79ed723369e52e21a60335.png",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/711/debit711?authuser=0"
    }, 

    // --- BÀI VIẾT HƯỚNG DẪN (GUIDES) ---
    {
        type: 'guide', // Loại nội dung: Hướng dẫn
        category: "bank",
        date: "2025-09-29", // Ngày mới nhất
        featured: true,
        title: "Cách đăng ký tài khoản City Exxpress - chuyển tiền Nhật Việt",
        summary: "Hướng dẫn chi tiết từng bước để tạo tài khoản chuyển tiền về Việt Nam với tỷ giá cao nhất và phí chuyển tiền rẻ nhất lại còn được hoàn point.",
        imageUrl: "https://img.favpng.com/21/10/7/logo-remittance-city-express-money-transfer-japan-co-ltd-brand-png-favpng-K39it6YWHKeAJm0NwUKpjnpJv.jpg",
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/express-money-transfer/city_express?authuser=0"
    },
    {
        type: 'guide',
        category: "jp",
        date: "2025-10-01",
        featured: false,
        title: "Đăng ký thẻ My Numeber Online",
        summary: "cách đăng ký thẻ My Number online đơn giản nhất cho người mới.",
        imageUrl: "img/posts/mynumber demo.png", 
        link: "https://sites.google.com/view/rakutenchiase/b%C3%A0i-vi%E1%BA%BFt-h%C6%B0%E1%BB%9Bng-d%E1%BA%ABn/khac/%C4%91%C4%83ng-k%C3%BD-mynumber-online?authuser=0"
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
        type: 'guide',
        category: "jp",
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