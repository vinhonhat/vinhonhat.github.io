// ======================================================
// 🧩 FILE: page-logic.js
// Dùng cho các TRANG CON (vd: rakuten.html, sim.html, hoctap.html)
// Nhiệm vụ: 
//  - Đọc thông tin từ thẻ <body data-category="...">
//  - Lọc bài viết thuộc chuyên mục đó trong biến allContent
//  - Hiển thị ra giao diện + phân trang + gợi ý bài viết
// ======================================================

// 🟢 Hàm chính khởi tạo trang
function initializePage() {
    console.log('[LOGIC] Dữ liệu `allContent` đã sẵn sàng. Bắt đầu hiển thị trang.');

    // --- 1️⃣ Lấy các phần tử HTML cần thao tác ---
    const elements = {
        body: document.body, // lấy toàn bộ thẻ body
        mainContainer: document.getElementById('main-content-container'), // nơi hiển thị bài viết chính
        suggestionsContainer: document.getElementById('suggested-posts-container'), // cột phải (bài viết gợi ý)
        paginationContainer: document.getElementById('pagination-container'), // khu vực phân trang
        pageTitle: document.getElementById('page-title'), // tiêu đề trang (tự lấy từ data-title)
        pageDescription: document.getElementById('page-description'), // mô tả ngắn
    };

    // --- 2️⃣ Lấy dữ liệu cấu hình từ thuộc tính data-* trong <body> ---
    const config = {
        title: elements.body.dataset.title || 'Chủ đề',
        description: elements.body.dataset.description || 'Danh sách bài viết.',
        category: elements.body.dataset.category, // ví dụ: "rakuten"
        postsPerPage: parseInt(elements.body.dataset.perpage) || 5, // số bài mỗi trang (vd: 6)
    };

    // Nếu thiếu data-category => báo lỗi và dừng
    if (!config.category) {
        console.error('[LỖI] Thiếu "data-category" trên thẻ <body>.');
        return;
    }

    // --- 3️⃣ Lọc danh sách bài viết theo category từ allContent ---
    // allContent là mảng chứa toàn bộ dữ liệu bài viết (được load từ content.js)
    const categoryPosts = allContent.filter(post => post.category === config.category);
    let currentPage = 1; // trang hiện tại

    // ======================================================
    // 🟠 PHẦN HIỂN THỊ NỘI DUNG CHÍNH
    // ======================================================
    const renderMainContent = () => {
        elements.mainContainer.innerHTML = ''; // xóa nội dung cũ
        const totalPosts = categoryPosts.length;

        // Nếu chưa có bài viết nào
        if (totalPosts === 0) {
            elements.mainContainer.innerHTML = '<p>Chưa có bài viết nào trong chuyên mục này.</p>';
            return;
        }

        // Tính toán bài viết bắt đầu và kết thúc theo trang
        const startIndex = (currentPage - 1) * config.postsPerPage;
        const postsToShow = categoryPosts.slice(startIndex, startIndex + config.postsPerPage);

        // Hiển thị từng bài viết
        postsToShow.forEach(post => {
            // ✅ Kiểm tra ảnh bài viết
            let imageUrl = post.imageUrl || 'https://placehold.co/400x250/ccc/ffffff?text=No+Image';
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = "../../" + imageUrl; // nối thêm đường dẫn nếu là ảnh nội bộ
            }

            // ✅ Các thông tin bài viết
            const summary = post.summary || 'Không có mô tả.';
            const postDate = post.date || '';

            // ✅ Xử lý link bài viết (đảm bảo hợp lệ)
            let postLink = post.link || '#';
            if (postLink && !postLink.startsWith('http') && !postLink.startsWith('../') && !postLink.startsWith('../../')) {
                postLink = "../../" + postLink;
            }

            // ✅ Giao diện hiển thị
            elements.mainContainer.innerHTML += `
                <!-- Card view cho PC/Tablet -->
                <div class="hidden sm:flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <a href="${postLink}" class="block">
                        <img src="${imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">
                    </a>
                    <div class="p-6 flex flex-col flex-grow">
                        <h3 class="text-xl font-bold text-gray-800 mb-2">
                            <a href="${postLink}" class="hover:text-yellow-600">${post.title}</a>
                        </h3>
                        <p class="text-gray-600 text-sm flex-grow">${summary}</p>
                        <div class="mt-4 flex items-center text-gray-500 text-sm">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${postDate}</span>
                        </div>
                        <div class="mt-4 text-right">
                            <a href="${postLink}" class="text-yellow-600 hover:underline font-semibold">Xem chi tiết &rarr;</a>
                        </div>
                    </div>
                </div>

                <!-- List view cho mobile -->
                <a href="${postLink}" class="block sm:hidden flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
                    <img src="${imageUrl}" alt="${post.title}" class="w-24 h-24 rounded-lg object-cover flex-shrink-0">
                    <div class="flex-1">
                        <h3 class="font-bold text-lg text-gray-800 group-hover:text-yellow-600">${post.title}</h3>
                        <p class="text-gray-600 text-sm mt-1 truncate-2-lines">${summary}</p>
                        <div class="text-xs text-gray-500 mt-2 flex items-center">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${postDate}</span>
                        </div>
                    </div>
                </a>
            `;
        });

        // Sau khi render xong => gọi hàm tạo nút phân trang
        renderPagination(totalPosts);
    };

    // ======================================================
    // 🔵 PHÂN TRANG
    // ======================================================
    const renderPagination = (totalPosts) => {
        elements.paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalPosts / config.postsPerPage);
        if (totalPages <= 1) return; // nếu chỉ có 1 trang thì không cần nút

        // Hàm tạo nút bấm
        const createButton = (text, page, isDisabled = false) => {
            const btn = document.createElement('button');
            btn.innerHTML = text;
            btn.className = `pagination-btn ${page === currentPage ? 'active' : ''}`;
            btn.disabled = isDisabled;
            btn.onclick = () => { 
                currentPage = page; 
                renderMainContent(); // vẽ lại nội dung khi chuyển trang
            };
            return btn;
        };

        // Thêm các nút << Trước - Số trang - Sau >>
        elements.paginationContainer.appendChild(createButton('&laquo; Trước', currentPage - 1, currentPage === 1));
        for (let i = 1; i <= totalPages; i++) {
            elements.paginationContainer.appendChild(createButton(i, i));
        }
        elements.paginationContainer.appendChild(createButton('Sau &raquo;', currentPage + 1, currentPage === totalPages));
    };

    // ======================================================
    // 🟣 PHẦN GỢI Ý BÀI VIẾT (RANDOM TRONG 6 THÁNG GẦN NHẤT)
    // ======================================================
    const renderSuggestions = () => {
        elements.suggestionsContainer.innerHTML = '';

        // Lấy ngày 6 tháng trước để lọc bài mới
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentPosts = allContent.filter(post => {
            if (!post.date) return false;
            const postDate = new Date(post.date);
            return postDate >= sixMonthsAgo;
        });

        if (recentPosts.length === 0) return;

        // Xáo trộn ngẫu nhiên danh sách bài
        const shuffled = recentPosts.sort(() => 0.5 - Math.random());

        // Giới hạn số lượng gợi ý tùy theo thiết bị
        const isMobile = window.innerWidth < 640;
        const maxSuggestions = isMobile ? 4 : 6;

        const suggestions = shuffled.slice(0, maxSuggestions);

        // Tạo thẻ HTML cho từng bài viết gợi ý
        suggestions.forEach(post => {
            let imageUrl = post.imageUrl || 'https://placehold.co/64x64/ccc/ffffff?text=...';
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = "../../" + imageUrl;
            }

            let postLink = post.link || '#';
            if (postLink && !postLink.startsWith('http') && !postLink.startsWith('../') && !postLink.startsWith('../../')) {
                postLink = "../../" + postLink;
            }

            // HTML gợi ý cho PC và Mobile
            elements.suggestionsContainer.innerHTML += `
            <!-- PC/iPad -->
            <a href="${postLink}" class="hidden sm:flex items-center p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200 group mb-4">
                <img src="${imageUrl}" alt="${post.title}" class="w-16 h-16 object-cover rounded-md flex-shrink-0">
                <div class="ml-4">
                    <h4 class="font-semibold text-gray-800 group-hover:text-yellow-700">${post.title}</h4>
                    <div class="text-xs text-gray-500 mt-1 flex items-center">
                        <i class="far fa-calendar-alt mr-1"></i>
                        <span>${post.date || ''}</span>
                    </div>
                </div>
            </a>

            <!-- Mobile -->
            <a href="${postLink}" class="block sm:hidden p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200 group mb-4 text-center">
                <img src="${imageUrl}" alt="${post.title}" class="w-16 h-16 object-cover rounded-md mx-auto mb-2">
                <h4 class="font-semibold text-gray-800 group-hover:text-yellow-700 truncate-2-lines">${post.title}</h4>
                <div class="text-xs text-gray-500 mt-1 flex justify-center items-center">
                    <i class="far fa-calendar-alt mr-1"></i>
                    <span>${post.date || ''}</span>
                </div>
            </a>`;
        });
    };

    // ======================================================
    // 🔸 CUỐI CÙNG: GÁN TIÊU ĐỀ & CHẠY TOÀN BỘ
    // ======================================================
    elements.pageTitle.textContent = config.title;
    elements.pageDescription.textContent = config.description;
    renderMainContent();
    renderSuggestions();
}

// ======================================================
// ⏳ HÀM CHỜ DỮ LIỆU "allContent" TỪ content.js RỒI MỚI CHẠY
// (Vì file JS này chạy sau, nên cần đợi dữ liệu load xong)
// ======================================================
function waitForDataAndRun() {
    let attempts = 0;
    const maxAttempts = 100; // tương đương 5 giây (100 × 50ms)

    const checker = setInterval(() => {
        if (typeof allContent !== 'undefined' && allContent.length > 0) {
            clearInterval(checker);
            initializePage(); // dữ liệu đã sẵn sàng, khởi chạy trang
        }

        attempts++;
        if (attempts > maxAttempts) {
            clearInterval(checker);
            console.error('[LỖI] Đã chờ quá 5 giây nhưng không tìm thấy dữ liệu "allContent".');
            const mainContainer = document.getElementById('main-content-container');
            if (mainContainer) 
                mainContainer.innerHTML = '<p>Lỗi: Không thể tải dữ liệu bài viết do chờ quá lâu.</p>';
        }
    }, 50);
}

// Gọi hàm chờ dữ liệu
waitForDataAndRun();
