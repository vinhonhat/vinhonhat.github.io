// page-logic.js
// dùng cho trang con hiện thị đầy đủ từng mục con như rakuten, sim, hoc tập

// Hàm này dùng để đổi định dạng ngày sang kiểu "ngày 07 tháng 11 năm 2025"
function formatDate(dateString) {
    if (!dateString) return ""; 
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const monthName = date.toLocaleDateString('vi-VN', { month: 'long' });
        const year = date.getFullYear();
        if (!day || !monthName || isNaN(year)) return dateString;
        return `ngày ${day} ${monthName} năm ${year}`;
    } catch (e) {
        return dateString;
    }
}

// Hàm này dùng để đổi định dạng ngày sang kiểu "07-11-2025" (ngắn gọn)
function formatDateSimple(dateString) {
    if (!dateString) return ""; 
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        if (isNaN(day) || isNaN(month) || isNaN(year)) return dateString;
        return `${day}-${month}-${year}`; // Định dạng DD-MM-YYYY
    } catch (e) {
        return dateString;
    }
}

function initializePage(allContent) {
    console.log('[LOGIC] Dữ liệu `allContent` đã sẵn sàng. Bắt đầu hiển thị trang.');

    const elements = {
        body: document.body,
        mainContainer: document.getElementById('main-content-container'),
        suggestionsContainer: document.getElementById('suggested-posts-container'),
        paginationContainer: document.getElementById('pagination-container'),
        pageTitle: document.getElementById('page-title'),
        pageDescription: document.getElementById('page-description'),
    };

    const config = {
        title: elements.body.dataset.title || 'Chủ đề',
        description: elements.body.dataset.description || 'Danh sách bài viết.',
        category: elements.body.dataset.category,
        postsPerPage: parseInt(elements.body.dataset.perpage) || 5,
    };

    if (!config.category) {
        console.error('[LỖI] Thiếu "data-category" trên thẻ <body>.');
        return;
    }

    // --- Lọc bài viết theo category ---
    // SỬA THÀNH ĐOẠN NÀY (đã thêm logic "status" và đơn giản hóa "category"):
    const categoryPosts = allContent.filter(post => {
        // 1. Ẩn bài nếu status là 0
        if (post.status === 0) return false;

        // 2. Lọc theo category (chỉ kiểm tra array)
        if (Array.isArray(post.category)) {
            return post.category.includes(config.category);
        }
        return false; // Bỏ qua nếu category không phải là mảng
        }).sort((a, b) => {
        // Ưu tiên 1: "featured" = true luôn lên đầu
        // (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        // Nếu b là featured (1) và a không (0) -> b lên trước (1 - 0 = 1)
        if (a.featured !== b.featured) {
            return b.featured ? 1 : -1;
        }

        // Ưu tiên 2: Sắp xếp theo ngày mới nhất (nếu featured bằng nhau)
        return new Date(b.date) - new Date(a.date);
    });

    let currentPage = 1;

    // --- Hiển thị nội dung chính ---
    const renderMainContent = () => {
        elements.mainContainer.innerHTML = '';
        const totalPosts = categoryPosts.length;
        if (totalPosts === 0) {
            elements.mainContainer.innerHTML = '<p>Chưa có bài viết nào trong chuyên mục này.</p>';
            return;
        }
        const startIndex = (currentPage - 1) * config.postsPerPage;
        const postsToShow = categoryPosts.slice(startIndex, startIndex + config.postsPerPage);

        postsToShow.forEach(post => {
            let imageUrl = post.imageUrl || 'https://placehold.co/400x250/ccc/ffffff?text=No+Image';
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) { // <--- SỬA LẠI ĐÂY
                imageUrl = "/" + imageUrl;
            }
            const summary = post.summary || 'Không có mô tả.';
            const postDate = formatDate(post.date);

            let postLink = post.link || '#';
            if (postLink && !postLink.startsWith('http') && !postLink.startsWith('/')) {
                postLink = "/" + postLink;
            }

            elements.mainContainer.innerHTML += `
                <!-- Card view cho tablet/PC -->
                <div class="hidden sm:flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <a href="${post.link || '#'}" class="block">
                        <img src="${imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">
                    </a>
                    <div class="p-6 flex flex-col flex-grow">
                        <h3 class="truncate-2-lines text-xl font-bold text-gray-800 mb-2">
                            <a href="${post.link || '#'}" class="hover:text-yellow-600">${post.title}</a>
                        </h3>
                        <p class="truncate-3-lines text-gray-600 text-sm flex-grow">${summary}</p>
                        <div class="mt-4 flex items-center text-gray-500 text-sm">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${postDate}</span>
                        </div>
                        <div class="mt-4 text-right">
                            <a href="${post.link || '#'}" class="text-yellow-600 hover:underline font-semibold">Xem chi tiết &rarr;</a>
                        </div>
                    </div>
                </div>

                <!-- List view cho mobile -->
                <a href="${post.link || '#'}" class="block sm:hidden flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
                    <img src="${imageUrl}" alt="${post.title}" class="w-24 h-24 rounded-lg object-cover flex-shrink-0">
                    <div class="flex-1">
                        <h3 class="truncate-2-lines font-bold text-lg text-gray-800 group-hover:text-yellow-600">${post.title}</h3>
                        <p class="text-gray-600 text-sm mt-1 truncate-2-lines">${summary}</p>
                        <div class="text-xs text-gray-500 mt-2 flex items-center">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${postDate}</span>
                        </div>
                    </div>
                </a>
            `;
        });
        renderPagination(totalPosts);
    };

    // --- Phân trang ---
    const renderPagination = (totalPosts) => {
        elements.paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalPosts / config.postsPerPage);
        if (totalPages <= 1) return;

        const createButton = (text, page, isDisabled = false) => {
            const btn = document.createElement('button');
            btn.innerHTML = text;
            btn.className = `pagination-btn ${page === currentPage ? 'active' : ''}`;
            btn.disabled = isDisabled;
            btn.onclick = () => { currentPage = page; renderMainContent(); };
            return btn;
        };

        elements.paginationContainer.appendChild(createButton('&laquo; Trước', currentPage - 1, currentPage === 1));
        for (let i = 1; i <= totalPages; i++) {
            elements.paginationContainer.appendChild(createButton(i, i));
        }
        elements.paginationContainer.appendChild(createButton('Sau &raquo;', currentPage + 1, currentPage === totalPages));
    };

    // --- Phần gợi ý (random, trong vòng 6 tháng) ---
    const renderSuggestions = () => {
        elements.suggestionsContainer.innerHTML = '';
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // SỬA THÀNH ĐOẠN NÀY (đã thêm logic "status"):
        const recentPosts = allContent.filter(post => {
            // 1. Ẩn bài nếu status là 0
            if (post.status === 0) return false;

            // 2. Lọc theo ngày
            if (!post.date) return false;
            const postDate = new Date(post.date);
            return postDate >= sixMonthsAgo;
        });

        if (recentPosts.length === 0) return;

        // Random hóa
        const shuffled = recentPosts.sort(() => 0.5 - Math.random());

        // Kiểm tra kích thước màn hình


        const suggestions = shuffled.slice(0, 6);

        suggestions.forEach(post => {
            let imageUrl = post.imageUrl || 'https://placehold.co/64x64/ccc/ffffff?text=...';
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                imageUrl = "/" + imageUrl;
            }
            let postLink = post.link || '#';
            if (postLink && !postLink.startsWith('http') && !postLink.startsWith('/')) {
                postLink = "/" + postLink;
            }

            elements.suggestionsContainer.innerHTML += `
            <!-- PC/iPad view -->
            <a href="${postLink}" 
                class="hidden sm:flex items-center p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200 group mb-4">
                <img src="${imageUrl}" alt="${post.title}" 
                    class="w-16 h-16 object-cover rounded-md flex-shrink-0">
                <div class="ml-4">
                    <h4 class="truncate-2-lines font-semibold text-gray-800 group-hover:text-yellow-700">${post.title}</h4>
                    <div class="text-xs text-gray-500 mt-1 flex items-center">
                        <i class="far fa-calendar-alt mr-1"></i>
                        <span>${formatDateSimple(post.date)}</span>
                    </div>
                </div>
            </a>

            <!-- Mobile view -->
            <a href="${postLink}" 
                class="block sm:hidden p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200 group mb-4 text-center">
                <img src="${imageUrl}" alt="${post.title}" 
                    class="w-16 h-16 object-cover rounded-md mx-auto mb-2">
                <h4 class="truncate-2-lines font-semibold text-gray-800 group-hover:text-yellow-700 truncate-2-lines">${post.title}</h4>
                <div class="text-xs text-gray-500 mt-1 flex justify-center items-center">
                    <i class="far fa-calendar-alt mr-1"></i>
                    <span>${formatDateSimple(post.date)}</span>
                </div>
            </a>
    `;
        });};

    // --- Khởi chạy ---
    elements.pageTitle.textContent = config.title;
    elements.pageDescription.textContent = config.description;
    renderMainContent();
    renderSuggestions();
}

// Chờ dữ liệu và chạy
// --- THAY ĐỔI: Tải JSON trước, sau đó mới chạy logic ---
document.addEventListener('DOMContentLoaded', () => {
    fetch('/data/posts.json')
        .then(response => {
            if (!response.ok) throw new Error("Không thể tải /data/posts.json");
            return response.json();
        })
        .then(allContent => {
            // Dữ liệu đã sẵn sàng, gọi hàm khởi tạo chính
            initializePage(allContent);
        })
        .catch(error => {
            console.error('[LỖI] Không thể tải dữ liệu JSON cho page-logic:', error);
            const mainContainer = document.getElementById('main-content-container');
            // Đây là thông báo lỗi mới nếu fetch thất bại
            if (mainContainer) mainContainer.innerHTML = '<p>Lỗi: Không thể tải dữ liệu bài viết.</p>';
        });
});