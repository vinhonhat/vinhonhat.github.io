document.addEventListener('DOMContentLoaded', function() {

    // =================================================================
    // MỤC LỤC
    // =================================================================
    // 1. ĐĂNG KÝ SERVICE WORKER (PWA)
    // 2. LẤY CÁC THÀNH PHẦN HTML (ELEMENTS)
    // 3. CÁC HÀM CHỨC NĂNG
    //    3.1. Chức năng không đổi (Đồng hồ, Banner, Popup...)
    //    3.2. Tải bài viết ĐỀ XUẤT (NÂNG CẤP)
    //    3.3. Tải bài viết HƯỚNG DẪN (NÂNG CẤP)
    //    3.4. Tải VIDEO hướng dẫn (NÂNG CẤP)
    // 4. GỌI CÁC HÀM ĐỂ CHẠY TRANG WEB
    // =================================================================


    // --- 1. ĐĂNG KÝ SERVICE WORKER CHO PWA (Giữ nguyên) ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('ServiceWorker đã đăng ký:', registration.scope))
                .catch(err => console.log('ServiceWorker đăng ký thất bại:', err));
        });
    }

    // --- 2. LẤY CÁC THÀNH PHẦN HTML (ELEMENTS) (Giữ nguyên) ---
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const bannerSlider = document.getElementById('bannerSlider');
    const postsContainer = document.getElementById('latest-posts-container'); // Sẽ dùng cho bài viết đề xuất
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const popupTitle = document.getElementById('popupTitle');
    const popupText = document.getElementById('popupText');
    const holidayImage = document.getElementById('holidayImage');
    const guidePostsContainer = document.getElementById('guide-posts-container');
    const videoGuidesContainer = document.getElementById('video-guides-container');


    // --- 3. CÁC HÀM CHỨC NĂNG ---

    // --- 3.1. Chức năng không đổi (Đồng hồ, Banner, Popup...) (Giữ nguyên) ---
    // HÀM MỚI: Dùng để định dạng ngày tháng cho đẹp
    function formatDate(dateString) {
        // Tạo một đối tượng ngày tháng từ chuỗi đầu vào
        const date = new Date(dateString);
        // Tạo một đối tượng tùy chọn để định dạng theo kiểu Việt Nam
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        // Trả về chuỗi đã được định dạng
        return date.toLocaleDateString('vi-VN', options);
    }      
    
    // Cập nhật đồng hồ
    function updateClock() {
        if (!timeEl || !dateEl) return;
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Tải và chạy Banner
    function loadBanner() {
        if (!bannerSlider) return;
        if (typeof bannerSlides === 'undefined' || bannerSlides.length === 0) return;
        let bannerHtml = '';
        for (const slide of bannerSlides) {
            bannerHtml += `
                <a href="${slide.link}" class="w-full flex-shrink-0">
                    <img src="${slide.imageUrl}" alt="Banner" class="w-full rounded-lg object-cover">
                </a>
            `;
        }
        bannerSlider.innerHTML = bannerHtml;
    }

    function initBannerSlider() {
        if (!bannerSlider) return;
        const slides = bannerSlider.children;
        if (slides.length <= 1) return;
        let currentIndex = 0;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            bannerSlider.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 3000);
    }

    function checkAndShowPopup() {
        // ... (Toàn bộ code của hàm này được giữ nguyên, không thay đổi)
        if (!popupOverlay) return;
        popupText.className = 'text-gray-600 mb-6'; // Reset style
        const today = new Date();
        let activeHoliday = null;

        if (typeof holidays !== 'undefined') {
            const currentYear = today.getFullYear();
            for (const holiday of holidays) {
                let holidayDate = holiday.isLunar ? convertLunarToSolar(holiday.day, holiday.month, currentYear) : new Date(currentYear, holiday.month - 1, holiday.day);
                const diffDays = Math.round((holidayDate - today) / (1000 * 60 * 60 * 24));
                if (diffDays >= -3 && diffDays <= 3) {
                    activeHoliday = holiday;
                    break;
                }
            }
        }
        
        if (activeHoliday) {
            popupTitle.innerHTML = `<span class="rainbow-text font-bold">Chào mừng ngày ${activeHoliday.name}!</span>`;
            popupText.textContent = "Chúc bạn và gia đình có một ngày lễ thật ý nghĩa và vui vẻ!";
            holidayImage.src = `img/holidays/${activeHoliday.imagePrefix}d.jpg`;
            holidayImage.style.display = 'block';
        } else if (typeof proverbs !== 'undefined') {
            popupTitle.textContent = "";
            popupText.innerHTML = proverbs[Math.floor(Math.random() * proverbs.length)];
            popupText.classList.add('rainbow-text', 'text-2xl', 'font-bold');
            holidayImage.style.display = 'none';
        }
        popupOverlay.style.display = 'flex';
    }


    // --- 3.2. Tải bài viết ĐỀ XUẤT (ĐÃ SỬA LỖI SẮP XẾP) ---
    function loadFeaturedPosts() {
        // Kiểm tra xem element và dữ liệu có tồn tại không
        if (!postsContainer || typeof allContent === 'undefined') return;

        // BƯỚC 1: Lọc ra tất cả các bài có thuộc tính `featured: true`
        const featuredItems = allContent.filter(item => item.featured === true);
    
        // BƯỚC 2: SẮP XẾP các bài vừa lọc theo ngày mới nhất lên đầu (DÒNG CODE MỚI THÊM VÀO)
        const sortedItems = featuredItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        // BƯỚC 3: Chỉ lấy 4 bài đầu tiên trong danh sách ĐÃ SẮP XẾP để hiển thị
        const itemsToDisplay = sortedItems.slice(0, 4);

        // Nếu không có bài nào được đánh dấu là nổi bật
        if (itemsToDisplay.length === 0) {
        postsContainer.innerHTML = "<p class='text-center col-span-full'>Chưa có bài viết nào nổi bật.</p>";
        return;
        }

        // BƯỚC 4: Tạo HTML cho từng bài viết và chèn vào trang
        let postsHtml = '';
    for (const post of itemsToDisplay) {
        postsHtml += `
            <a href="${post.link}" class="block group bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
            <article>
                <img src="${post.imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <div class="text-sm text-gray-500 mb-3 flex items-center">
                        <i class="far fa-calendar-alt mr-2"></i>
                        <span>${formatDate(post.date)}</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">${post.title}</h3>
                    <p class="text-gray-600 text-sm">${post.summary}</p>
                </div>
            </article>
            </a>
        `;
    }
    postsContainer.innerHTML = postsHtml;
}


    // --- 3.3. Tải bài viết HƯỚNG DẪN (NÂNG CẤP) ---
    function loadGuidePosts() {
        // Kiểm tra xem element và dữ liệu có tồn tại không
        if (!guidePostsContainer || typeof allContent === 'undefined') return;

        // BƯỚC 1: Lọc ra các bài có `type: 'guide'`
        const guides = allContent.filter(item => item.type === 'guide');

        // BƯỚC 2: Sắp xếp các bài vừa lọc theo ngày tháng, bài mới nhất lên đầu
        // new Date(b.date) - new Date(a.date) sẽ sắp xếp từ mới đến cũ
        const sortedGuides = guides.sort((a, b) => new Date(b.date) - new Date(a.date));

        // BƯỚC 3: Chỉ lấy 2 bài đầu tiên (mới nhất) để hiển thị
        const latestGuides = sortedGuides.slice(0, 2);

        // Nếu không có bài hướng dẫn nào
        if (latestGuides.length === 0) {
            guidePostsContainer.innerHTML = "<p class='text-gray-600'>Chưa có bài viết nào.</p>";
            return;
        }

        // BƯỚC 4: Tạo HTML và chèn vào trang
        let postsHtml = '';
        for (const post of latestGuides) {
            postsHtml += `
                <a href="${post.link}" class="flex items-start space-x-4 group">
                    <img src="${post.imageUrl}" alt="${post.title}" class="w-24 h-16 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105">
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-800 group-hover:text-yellow-600">${post.title}</h3>
                        <p class="text-gray-600 text-sm mt-1">${post.summary}</p>

                        <div class="text-xs text-gray-500 mt-2 flex items-center">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${formatDate(post.date)}</span>
                        </div>

                    </div>
                </a>
            `;
        }
        guidePostsContainer.innerHTML = postsHtml;
    }


    // --- 3.4. Tải VIDEO hướng dẫn (NÂNG CẤP) ---
    function loadVideoGuides() {
        // Kiểm tra xem element và dữ liệu có tồn tại không
        if (!videoGuidesContainer || typeof allContent === 'undefined') return;

        // Logic tương tự như loadGuidePosts, chỉ khác là lọc theo `type: 'video'`
        // BƯỚC 1: Lọc ra các video có `type: 'video'`
        const videos = allContent.filter(item => item.type === 'video');

        // BƯỚC 2: Sắp xếp các video theo ngày tháng, mới nhất lên đầu
        const sortedVideos = videos.sort((a, b) => new Date(b.date) - new Date(a.date));

        // BƯỚC 3: Chỉ lấy 2 video đầu tiên (mới nhất)
        const latestVideos = sortedVideos.slice(0, 2);

        // Nếu không có video nào
        if (latestVideos.length === 0) {
            videoGuidesContainer.innerHTML = "<p class='text-gray-600'>Chưa có video nào.</p>";
            return;
        }

        // BƯỚC 4: Tạo HTML và chèn vào trang
        let videosHtml = '';
        for (const video of latestVideos) {
            videosHtml += `
                <a href="${video.link}" class="flex items-center space-x-4 group">
                    <img src="${video.imageUrl}" alt="${video.title}" class="w-24 h-16 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105">
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-800 group-hover:text-yellow-600">${video.title}</h3>
                        <p class="text-gray-600 text-sm mt-1">${video.summary}</p>

                        <div class="text-xs text-gray-500 mt-2 flex items-center">
                            <i class="far fa-calendar-alt mr-2"></i>
                            <span>${formatDate(video.date)}</span>
                        </div>

                    </div>
                </a>
            `;
        }
        videoGuidesContainer.innerHTML = videosHtml;
    }


    // --- 4. GỌI CÁC HÀM ĐỂ CHẠY TRANG WEB ---

    // Chạy các chức năng cơ bản (Giữ nguyên)
    updateClock();
    setInterval(updateClock, 1000);

    // Xử lý menu mobile (Giữ nguyên)
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

    // Tải nội dung động (CẬP NHẬT)
    loadBanner();
    loadFeaturedPosts(); // <-- THAY ĐỔI: Gọi hàm mới thay cho loadLatestPosts()
    loadGuidePosts();
    loadVideoGuides();

    // Khởi chạy các thành phần sau khi nội dung đã được tải (Giữ nguyên)
    initBannerSlider();

    // Hẹn giờ cho Popup (Giữ nguyên)
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
        setTimeout(checkAndShowPopup, 500);
        setTimeout(() => { if (popupOverlay) popupOverlay.style.display = 'none'; }, 7000);
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => popupOverlay.style.display = 'none');
        }
    }
});