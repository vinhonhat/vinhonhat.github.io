// js/content.js
// NƠI DUY NHẤT ĐỂ QUẢN LÝ BANNER VÀ BÀI VIẾT

// GHI CHÚ 1: DỮ LIỆU BANNER
const bannerSlides = [
    { imageUrl: "img/banners/banner1.jpg", link: "https://www.google.com" },
    { imageUrl: "img/banners/banner2.jpg", link: "https://www.google.com" },
];

// GHI CHÚ 2: KHO NỘI DUNG TỔNG
// Đây là nơi duy nhất bạn cần thêm/sửa/xóa bài viết, video, hướng dẫn.
const allContent = [
    // --- BÀI VIẾT (type: 'post') ---
    { 
        type: 'post',
        category: "seven", 
        date: "2025-09-28",
        featured: true, // true = Hiển thị ở mục "Bài viết mới nhất"
        title: "Hướng dẫn đăng ký tài khoản ngân hàng Seven Bank", 
        summary: "Ngoài Yucho thì đây là ngân hàng thứ 2 cho phép người mới đến Nhật Bản...",
        imageUrl: "img/posts/seven/711.png", 
        link: "#" 
    },
    { 
        type: 'post',
        category: "rakuten", 
        date: "2025-09-27",
        featured: true, // true = Hiển thị ở mục "Bài viết mới nhất"
        title: "Cách đăng ký tài khoản Rakuten", 
        summary: "Hướng dẫn chi tiết từng bước để tạo tài khoản mua sắm.", 
        imageUrl: "https://placehold.co/400x250/FBD38D/ffffff?text=Rakuten",
        link: "#" 
    },
    { 
        type: 'post',
        category: "rakuten", 
        date: "2025-09-20",
        featured: false, // false = Không hiển thị ở mục nổi bật, chỉ hiện trong trang chuyên mục
        title: "Mẹo sử dụng thẻ thanh toán Seven Bank", 
        summary: "Những lưu ý quan trọng khi sử dụng thẻ tại Nhật.",
        imageUrl: "https://placehold.co/400x250/ECC94B/ffffff?text=Seven+Card",
        link: "#" 
    },

    // --- BÀI VIẾT HƯỚNG DẪN (type: 'guide') ---
    { 
        type: 'guide',
        date: "2025-09-26",
        title: "Bài viết hướng dẫn mới nhất", 
        description: "Đây là tóm tắt của bài hướng dẫn vừa cập nhật.", 
        imageUrl: "https://placehold.co/120x80/718096/ffffff?text=HD+Mới", 
        link: "#" 
    },
    
    // --- VIDEO HƯỚNG DẪN (type: 'video') ---
    { 
        type: 'video',
        date: "2025-09-25",
        title: "Video HD nạp tiền vào thẻ Line Pay", 
        description: "Mô tả ngắn về video. Thời lượng: 5:30.", 
        imageUrl: "https://placehold.co/120x80/718096/ffffff?text=Video+Mới", 
        link: "#" 
    }
];
