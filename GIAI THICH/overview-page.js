// ======================================================
// 🧩 FILE: overview-page.js
// Dùng cho TRANG TỔNG HỢP (vd: bai-viet-hd.html)
// Mục đích:
//  - Hiển thị một phần nội dung của từng chuyên mục (Rakuten, Seven, Sim, Baito...)
//  - Mỗi chuyên mục chỉ lấy một số bài viết mới nhất (vd: 2 bài)
//  - Thêm phần "bài viết gợi ý" ở cột bên phải
// ======================================================

// 🟢 Hàm chính khởi tạo trang tổng hợp
function initializeOverviewPage() {
    console.log('[OVERVIEW] Bắt đầu hiển thị trang tổng hợp bài viết.');

    // --- 1️⃣ Lấy các phần tử cần thao tác trong trang ---
    const elements = {
        rakuten: document.getElementById('rakuten-posts'),
        seven: document.getElementById('seven-posts'),
        sim: document.getElementById('sim-posts'),
        baito: document.getElementById('baito-posts'),
        suggestions: document.getElementById('suggested-posts-container'),
    };

    // --- 2️⃣ Kiểm tra dữ liệu bài viết đã được nạp chưa ---
    if (typeof allContent === 'undefined' || allContent.length === 0) {
        console.error('[LỖI] Không tìm thấy dữ liệu bài viết `allContent`.');
        return;
    }

    // ======================================================
    // 🟠 HÀM HIỂN THỊ CÁC BÀI VIẾT THEO CHUYÊN MỤC
    // ======================================================
    function renderPostsByCategory(category, containerId, limit = 2) {
        const container = elements[containerId];
        if (!container) return;

        // Lọc bài viết thuộc chuyên mục đó
        const posts = allContent
            .filter(post => post.category === category)
            // Sắp xếp theo ngày mới nhất (nếu có)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit); // chỉ lấy giới hạn số bài

        // Nếu không có bài nào thì hiển thị thông báo
        if (posts.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">Chưa có bài viết nào.</p>';
            return;
        }

        // Thêm từng bài viết vào trang
        posts.forEach(post => {
            let imageUrl = post.imageUrl || 'https://placehold.co/400x250/ccc/ffffff?text=No+Image';
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = "../../" + imageUrl;
            }

            const summary = post.summary || 'Không có mô tả.';
            const postDate = post.date || '';

            let postLink = post.link || '#';
            if (postLink && !postLink.startsWith('http') && !postLink.startsWith('../') && !postLink.startsWith('../../')) {
                postLink = "../../" + postLink;
            }

            // ✅ Giao diện mỗi bài viết (thẻ card)
            container.innerHTML += `
                <div class="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <a href="${postLink}">
                        <img src="${imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">
                    </a>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">
                            <a href="${postLink}" class="hover:text-yellow-600">${post.title}</a>
                        </h3>
                        <p class="text-gray-600 text-sm truncate-2-lines">${summary}</p>
                        <div class="mt-3 text-gray-500 text-sm flex items-center">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${postDate}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // ======================================================
    // 🔵 HÀM GỢI Ý BÀI VIẾT NGẪU NHIÊN (6 THÁNG GẦN NHẤT)
    // ======================================================
    function renderSuggestedPosts() {
        const container = elements.suggestions;
        if (!container) return;
        container.innerHTML = '';

        // Lấy các bài viết trong 6 tháng gần đây
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentPosts = allContent.filter(post => {
            if (!post.date) return false;
            const postDate = new Date(post.date);
            return postDate >= sixMonthsAgo;
        });

        // Nếu không có bài viết gần đây => thoát
        if (recentPosts.length === 0) return;

        // Random danh sách
        const shuffled = recentPosts.sort(() => 0.5 - Math.random());

        // Giới hạn số lượng bài gợi ý
        const isMobile = window.innerWidth < 640;
        const maxSuggestions = isMobile ? 4 : 6;

        const suggestions = shuffled.slice(0, maxSuggestions);

        // Hiển thị từng bài
        suggestions.forEach(post => {
            let imageUrl = post.imageUrl || 'https://placehold.co/64x64/ccc/ffffff?text=...';
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = "../../" + imageUrl;
            }

            let postLink = post.link || '#';
            if (postLink && !postLink.startsWith('http') && !postLink.startsWith('../') && !postLink.startsWith('../../')) {
                postLink = "../../" + postLink;
            }

            // ✅ HTML cho từng bài viết gợi ý
            container.innerHTML += `
            <!-- Hiển thị cho PC/iPad -->
            <a href="${postLink}" 
                class="hidden sm:flex items-center p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200 group mb-4">
                <img src="${imageUrl}" alt="${post.title}" 
                    class="w-16 h-16 object-cover rounded-md flex-shrink-0">
                <div class="ml-4">
                    <h4 class="font-semibold text-gray-800 group-hover:text-yellow-700">${post.title}</h4>
                    <div class="text-xs text-gray-500 mt-1 flex items-center">
                        <i class="far fa-calendar-alt mr-1"></i>
                        <span>${post.date || ''}</span>
                    </div>
                </div>
            </a>

            <!-- Hiển thị cho Mobile -->
            <a href="${postLink}" 
                class="block sm:hidden p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200 group mb-4 text-center">
                <img src="${imageUrl}" alt="${post.title}" 
                    class="w-16 h-16 object-cover rounded-md mx-auto mb-2">
                <h4 class="font-semibold text-gray-800 group-hover:text-yellow-700 truncate-2-lines">${post.title}</h4>
                <div class="text-xs text-gray-500 mt-1 flex justify-center items-center">
                    <i class="far fa-calendar-alt mr-1"></i>
                    <span>${post.date || ''}</span>
                </div>
            </a>
            `;
        });
    }

    // ======================================================
    // 🟣 GỌI HÀM HIỂN THỊ TỪNG CHUYÊN MỤC
    // ======================================================
    renderPostsByCategory('rakuten', 'rakuten', 2);  // Hiển thị 2 bài mới nhất Rakuten
    renderPostsByCategory('seven', 'seven', 2);      // Hiển thị 2 bài Seven Bank
    renderPostsByCategory('sim', 'sim', 2);          // Hiển thị 2 bài Sim thẻ
    renderPostsByCategory('baito', 'baito', 2);      // Hiển thị 2 bài Baito

    // Hiển thị phần gợi ý
    renderSuggestedPosts();
}

// ======================================================
// ⏳ HÀM CHỜ DỮ LIỆU TỪ content.js RỒI MỚI CHẠY
// ======================================================
function waitForDataAndRunOverview() {
    let attempts = 0;
    const maxAttempts = 100; // ~5 giây

    const checker = setInterval(() => {
        if (typeof allContent !== 'undefined' && allContent.length > 0) {
            clearInterval(checker);
            initializeOverviewPage(); // dữ liệu đã có => chạy
        }

        attempts++;
        if (attempts > maxAttempts) {
            clearInterval(checker);
            console.error('[LỖI] Đã chờ quá 5 giây nhưng không tìm thấy dữ liệu "allContent".');
            const mainContainer = document.getElementById('rakuten-posts');
            if (mainContainer) mainContainer.innerHTML = '<p>Lỗi: Không thể tải dữ liệu bài viết.</p>';
        }
    }, 50);
}

// 🔸 Chạy hàm chờ dữ liệu
waitForDataAndRunOverview();
