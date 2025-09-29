document.addEventListener('DOMContentLoaded', function() {
    
    // LẤY CÁC THÀNH PHẦN HTML
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    // THÊM LẠI CÁC THÀNH PHẦN MENU
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    // HÀM CẬP NHẬT ĐỒNG HỒ
    function updateClock() {
        if (!timeEl || !dateEl) return;
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ==========================================================
    // LOGIC XỬ LÝ MENU DI ĐỘNG
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = mobileMenu.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            if (!mobileMenu.classList.contains('hidden') && !isClickInsideMenu && !isClickOnToggle) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
    // ==========================================================

    // HÀM ĐỊNH DẠNG NGÀY THÁNG
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('vi-VN', options);
    }

    // HÀM TẢI NỘI DUNG THEO DANH MỤC
    function loadContentByCategory(postTypes, category, containerId) {
        const container = document.getElementById(containerId);
        if (!container || typeof allContent === 'undefined') return;

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
            const imageUrl = `../../${item.imageUrl}`;
            contentHtml += `
                <a href="${item.link}" target="_blank" class="flex items-start space-x-4 group p-4 bg-white rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
                    <img src="${imageUrl}" alt="${item.title}" class="w-24 h-24 rounded-lg object-cover flex-shrink-0">
                    <div class="flex-1">
                        <h3 class="font-bold text-lg text-gray-800 group-hover:text-yellow-600">${item.title}</h3>
                        <p class="text-gray-600 text-sm mt-1 truncate-2-lines">${item.summary}</p>
                        <div class="text-xs text-gray-500 mt-2 flex items-center">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${formatDate(item.date)}</span>
                        </div>
                    </div>
                </a>
            `;
        }
        container.innerHTML = contentHtml;
    }

    // GỌI HÀM ĐỂ TẢI NỘI DUNG
    const postAndGuideTypes = ['post', 'guide'];
    loadContentByCategory(postAndGuideTypes, 'rakuten', 'rakuten-posts');
    loadContentByCategory(postAndGuideTypes, 'seven', 'seven-posts');
});