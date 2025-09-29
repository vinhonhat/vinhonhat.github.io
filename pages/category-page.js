document.addEventListener('DOMContentLoaded', function() {
    
    // Đồng hồ và ngày tháng
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');

    function updateClock() {
        if (!timeEl || !dateEl) return;
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    updateClock();
    setInterval(updateClock, 1000);

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('vi-VN', options);
    }

    function loadContentByCategory(postTypes, category, containerId) {
        const container = document.getElementById(containerId);

        if (!container || typeof allContent === 'undefined') {
            console.error(`Container "${containerId}" không tồn tại hoặc file content.js bị thiếu.`);
            return;
        }

        const categoryContent = allContent.filter(item => 
            postTypes.includes(item.type) && item.category === category
        );

        const sortedContent = categoryContent.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestContent = sortedContent.slice(0, 2);

        if (latestContent.length === 0) {
            container.innerHTML = "<p class='text-gray-600 col-span-full text-center'>Chưa có bài viết nào trong mục này.</p>";
            return;
        }


        
        let contentHtml = '';
        for (const item of latestContent) {
            contentHtml += `
                <a href="${item.link}" target="_blank" class="block group bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                    <article>
                        <img src="../../${item.imageUrl}" alt="${item.title}" class="w-24 h-24 object-cover">
                        <div class="p-6">
                            <div class="text-sm text-gray-500 mb-3 flex items-center">
                                <i class="far fa-calendar-alt mr-2"></i>
                                <span>${formatDate(item.date)}</span>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">${item.title}</h3>
                            <p class="text-gray-600 text-sm">${item.summary}</p>
                        </div>
                    </article>
                </a>
            `;
        }
        container.innerHTML = contentHtml;
    }

    // --- GỌI HÀM ĐỂ TẢI NỘI DUNG ---
    const postAndGuideTypes = ['post', 'guide'];
    loadContentByCategory(postAndGuideTypes, 'rakuten', 'rakuten-posts');
    loadContentByCategory(postAndGuideTypes, 'seven', 'seven-posts');
});
