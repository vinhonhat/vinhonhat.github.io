
// overview-page.js
// 📌 Dùng cho trang bai-viet-hd.html, hoctap. html, 
// Hiển thị 2 bài mới nhất của mỗi category, layout y chang rakuten (card PC + list mobile + sidebar gợi ý)
// Nếu category không có bài => ẩn luôn cả section

function renderPostsForCategory(category, containerId, allContent, maxPosts = 2) {
    const container = document.getElementById(containerId);
    if (!container || typeof allContent === 'undefined') return;

    const section = container.closest("section"); // lấy thẻ <section> bao quanh

    // Lọc bài theo category
    const categoryPosts = allContent.filter(post => {
        if (Array.isArray(post.category)) {
            // Nếu là array, kiểm tra xem nó CÓ CHỨA category của mục này không
            return post.category.includes(category);
        } else {
            // Nếu là string cũ, so sánh bình thường
            return post.category === category;
        }
    });

    if (categoryPosts.length === 0) {
        if (section) section.style.display = "none"; // ẩn luôn cả section
        return;
    }

    // Sắp xếp theo ngày mới nhất
    const sorted = categoryPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const postsToShow = sorted.slice(0, maxPosts);

    container.innerHTML = postsToShow.map(post => {
        let imageUrl = post.imageUrl || 'https://placehold.co/400x250/ccc/ffffff?text=No+Image';
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) { // <--- SỬA LẠI ĐÂY
            imageUrl = "/" + imageUrl;
        }

        let postLink = post.link || '#';
        if (postLink && !postLink.startsWith('http') && !postLink.startsWith('/')) {
            postLink = "/" + postLink;
        }

        const summary = post.summary || '';
        const postDate = post.date || '';

        return `
            <!-- Card view PC/Tablet -->
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
                </div>
            </div>

            <!-- List view Mobile -->
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
    }).join('');
}

function renderSuggestions(containerId, allContent) {
    const container = document.getElementById(containerId);
    if (!container || !allContent) return;

    container.innerHTML = '';
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPosts = allContent.filter(post => {
        if (!post.date) return false;
        const postDate = new Date(post.date);
        return postDate >= sixMonthsAgo;
    });

    if (recentPosts.length === 0) return;

    const shuffled = recentPosts.sort(() => 0.5 - Math.random());
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

        container.innerHTML += `
            <!-- PC/iPad view -->
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

            <!-- Mobile view -->
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

document.addEventListener('DOMContentLoaded', function () {
        fetch('/data/posts.json') // Tải file JSON
            .then(response => {
                if (!response.ok) throw new Error("Không thể tải /data/posts.json");
                return response.json();
            })
            .then(allContent => {
                // Dữ liệu đã sẵn sàng, gọi các hàm và truyền 'allContent' vào
                
                // dành cho trang bài viết HD
                renderPostsForCategory('rakuten', 'rakuten-posts', allContent);
                renderPostsForCategory('seven', 'seven-posts', allContent);
                renderPostsForCategory('baito', 'baito-posts', allContent);
                renderPostsForCategory('sim', 'sim-posts', allContent);
                renderPostsForCategory('tokutei', 'tokutei-posts', allContent);
                renderPostsForCategory('thucpham', 'thucpham-posts', allContent);
                renderPostsForCategory('hotel', 'hotel-posts', allContent);
                renderPostsForCategory('kaigo', 'kaigo-posts', allContent);
                renderPostsForCategory('nhahang', 'nhahang-posts', allContent);
                renderPostsForCategory('nihongo', 'nihongo-posts', allContent);
                renderPostsForCategory('jlpt', 'jlpt-posts', allContent);
                renderPostsForCategory('windows', 'windows-posts', allContent);
                renderPostsForCategory('dohoa', 'dohoa-posts', allContent);
                renderPostsForCategory('other', 'other-posts', allContent);
                
                
                renderSuggestions('suggested-posts-container', allContent);
            })
            .catch(error => {
                console.error('[LỖI] Không thể tải dữ liệu JSON cho trang này:', error);
                // Thêm thông báo lỗi ra màn hình nếu muốn
                document.body.innerHTML += '<p class="text-red-500 text-center">Lỗi nghiêm trọng: Không thể tải nội dung.</p>';
            });
    });

