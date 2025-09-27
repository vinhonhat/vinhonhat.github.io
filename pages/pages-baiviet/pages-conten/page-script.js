document.addEventListener('DOMContentLoaded', function() {
    const pageTitleEl = document.getElementById('page-title');
    const pageDescriptionEl = document.getElementById('page-description');
    // Dòng const lastUpdatedEl đã được xóa
    const mainContentContainer = document.getElementById('main-content-container');
    const suggestedPostsContainer = document.getElementById('suggested-posts-container');

    if (typeof pageContent === 'undefined') {
        console.error('Không tìm thấy dữ liệu trang (biến pageContent).');
        return;
    }

    const { pageData, mainPosts, suggestedPosts } = pageContent;

    function loadPageInfo() {
        if (pageTitleEl) pageTitleEl.textContent = pageData.title;
        if (pageDescriptionEl) pageDescriptionEl.textContent = pageData.description;
        // Code hiển thị lastUpdated đã được xóa
    }

    function loadMainPosts() {
        if (!mainContentContainer) return;
        
        // --- LOGIC MỚI ĐỂ CHIA CỘT ---
        // Nếu có 4 bài trở lên, dùng 2 cột, ngược lại dùng 1 cột
        if (mainPosts.length >= 4) {
            mainContentContainer.classList.add('md:grid-cols-2');
            mainContentContainer.classList.remove('md:grid-cols-1');
        } else {
            mainContentContainer.classList.add('md:grid-cols-1');
            mainContentContainer.classList.remove('md:grid-cols-2');
        }

        let html = '';
        mainPosts.forEach(post => {
            html += `
                <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="group block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                    <img src="${post.thumbnail}" alt="${post.title}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <p class="text-xs text-gray-500 mb-2"><i class="far fa-clock mr-1"></i>${post.date}</p>
                        <h3 class="text-xl font-bold text-gray-800 mb-2 transition-colors group-hover:text-yellow-600">${post.title}</h3>
                        <p class="text-gray-600 text-sm">${post.summary}</p>
                    </div>
                </a>
            `;
        });
        mainContentContainer.innerHTML = html;
    }

    function loadSuggestedPosts() {
        if (!suggestedPostsContainer) return;
        let html = '';
        suggestedPosts.forEach(post => {
            html += `
                <a href="${post.link}" class="group col-span-1 lg:col-span-2 flex items-center space-x-4 p-2 rounded-md hover:bg-yellow-50 transition-colors">
                    <img src="${post.thumbnail}" alt="${post.title}" class="w-24 h-16 rounded-lg object-cover flex-shrink-0">
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-800 group-hover:text-yellow-600">${post.title}</h3>
                        <p class="text-gray-600 text-sm">${post.summary}</p>
                    </div>
                </a>
            `;
        });
        suggestedPostsContainer.innerHTML = html;
    }

    loadPageInfo();
    loadMainPosts();
    loadSuggestedPosts();
});

