document.addEventListener('DOMContentLoaded', function() {
    const hubContainer = document.getElementById('hub-container');

    if (typeof hubCategories === 'undefined' || !hubContainer) {
        console.error('Không tìm thấy dữ liệu hoặc vùng chứa cho trang tổng hợp.');
        return;
    }

    // Lặp qua từng chuyên mục để tạo HTML
    hubCategories.forEach(category => {
        const section = document.createElement('section');
        section.className = 'mb-12';

        // Tạo tiêu đề cho chuyên mục
        const titleHtml = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-semibold text-gray-800 border-l-4 border-yellow-600 pl-4">
                    ${category.categoryTitle}
                </h2>
                <a href="${category.categoryLink}" class="text-yellow-600 hover:underline hidden sm:inline-block">
                    Xem thêm &rarr;
                </a>
            </div>
        `;

        // Tạo lưới chứa các bài viết nổi bật
        let postsHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-8">';
        category.featuredPosts.forEach(post => {
            postsHtml += `
                <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="group block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                    <img src="${post.thumbnail}" alt="${post.title}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-2 transition-colors group-hover:text-yellow-600">${post.title}</h3>
                        <p class="text-gray-600 text-sm">${post.summary}</p>
                    </div>
                </a>
            `;
        });
        postsHtml += '</div>';

        // Tạo nút "Xem thêm" cho di động
        const mobileMoreLink = `
            <div class="text-center mt-8 sm:hidden">
                <a href="${category.categoryLink}" class="bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 hover:bg-yellow-700 shadow-md">
                    Xem thêm bài viết về ${category.categoryTitle}
                </a>
            </div>
        `;

        section.innerHTML = titleHtml + postsHtml + mobileMoreLink;
        hubContainer.appendChild(section);
    });
});
