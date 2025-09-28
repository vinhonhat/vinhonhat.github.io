// ===================================================================
// MỤC 1: LOGIC CẬP NHẬT PWA (ĐÃ TẠM THỜI VÔ HIỆU HÓA)
// GHI CHÚ: Khi nào bạn phát triển xong và muốn bật lại PWA,
// chỉ cần xóa 2 dòng /* và */ ở đầu và cuối mục này.
// ===================================================================
/*
if ('serviceWorker' in navigator) {
    let newWorker;
    function showUpdateNotification() {
        const n = document.createElement('div');
        n.className = 'p-4 bg-gray-800 text-white rounded-lg shadow-lg fixed bottom-5 right-5 z-50';
        n.innerHTML = `<p class="mb-2">Có bản cập nhật mới!</p><button id="reload-button" class="px-4 py-1 bg-yellow-600 rounded">Tải lại</button>`;
        document.body.appendChild(n);
        document.getElementById('reload-button').addEventListener('click', () => { newWorker.postMessage({ action: 'skipWaiting' }); });
    }
    navigator.serviceWorker.register('/sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
            newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) { showUpdateNotification(); }
            });
        });
    });
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
}
*/

// ==========================================================
// MỤC 2: LOGIC CHÍNH CỦA TRANG WEB
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {

    // --- 2.1: LẤY TẤT CẢ CÁC THÀNH PHẦN HTML ---
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // --- 2.2: CÁC HÀM DÙNG CHUNG CHO MỌI TRANG ---

    // 2.2.1: Cập nhật đồng hồ
    function updateClock() {
        if (!timeEl || !dateEl) return;
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // 2.2.2: Xử lý menu di động (nhấn ra ngoài để đóng)
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

    // --- 2.3: CÁC HÀM DÀNH RIÊNG CHO TRANG CHỦ ---
    function initHomepage() {
        // Lấy các element chỉ có ở trang chủ
        const bannerSlider = document.getElementById('bannerSlider');
        const postsContainer = document.getElementById('latest-posts-container');
        const popupOverlay = document.getElementById('popupOverlay');
        const guidePostsContainer = document.getElementById('guide-posts-container');
        const videoGuidesContainer = document.getElementById('video-guides-container');

        // 2.3.1: Tải nội dung cho Banner
        if (bannerSlider && typeof bannerSlides !== 'undefined') {
            bannerSlider.innerHTML = bannerSlides.map(slide => 
                `<a href="${slide.link}" class="w-full flex-shrink-0" target="_blank" rel="noopener noreferrer">
                    <img src="${slide.imageUrl}" alt="Banner" class="w-full rounded-lg object-cover">
                </a>`
            ).join('');
            
            const slides = bannerSlider.children;
            if (slides.length > 1) {
                let currentIndex = 0;
                setInterval(() => {
                    currentIndex = (currentIndex + 1) % slides.length;
                    bannerSlider.style.transform = `translateX(-${currentIndex * 100}%)`;
                }, 3000);
            }
        }

        // 2.3.2: Tải các bài viết nổi bật (ngẫu nhiên)
        if (postsContainer && typeof allContent !== 'undefined') {
            const allFeaturedItems = allContent.filter(item => item.featured === true);
            if (allFeaturedItems.length > 0) {
                allFeaturedItems.sort(() => 0.5 - Math.random());
                const postsToRender = allFeaturedItems.slice(0, 3);
                postsContainer.innerHTML = postsToRender.map(post => {
                    const summaryText = post.summary || post.description || '';
                    return `<a href="${post.link}" class="group block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                                <img src="${post.imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">
                                <div class="p-6">
                                    <h3 class="text-xl font-bold text-gray-800 mb-2 transition-colors group-hover:text-yellow-600">${post.title}</h3>
                                    <p class="text-gray-600 text-sm">${summaryText}</p>
                                </div>
                            </a>`;
                }).join('');
            } else {
                postsContainer.innerHTML = "<p class='col-span-full text-center'>Không có bài viết nổi bật nào.</p>";
            }
        }
        
        // 2.3.3: Tải các bài viết & video hướng dẫn mới nhất
        if (typeof allContent !== 'undefined') {
            allContent.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestGuide = allContent.find(item => item.type === 'guide');
            const latestVideo = allContent.find(item => item.type === 'video');

            if (guidePostsContainer && latestGuide) {
                guidePostsContainer.innerHTML = `<a href="${latestGuide.link}" class="flex items-center space-x-4 group"><img src="${latestGuide.imageUrl}" alt="${latestGuide.title}" class="w-24 h-16 rounded-lg object-cover"><div class="flex-1"><h3 class="font-bold text-gray-800 group-hover:text-yellow-600">${latestGuide.title}</h3><p class="text-gray-600 text-sm">${latestGuide.description}</p></div></a>`;
            }
            if (videoGuidesContainer && latestVideo) {
                videoGuidesContainer.innerHTML = `<a href="${latestVideo.link}" class="flex items-center space-x-4 group"><img src="${latestVideo.imageUrl}" alt="${latestVideo.title}" class="w-24 h-16 rounded-lg object-cover"><div class="flex-1"><h3 class="font-bold text-gray-800 group-hover:text-yellow-600">${latestVideo.title}</h3><p class="text-gray-600 text-sm">${latestVideo.description}</p></div></a>`;
            }
        }

        // 2.3.4: Kiểm tra ngày lễ và hiển thị Popup
        if (popupOverlay) {
            const closePopupBtn = document.getElementById('closePopupBtn');
            const popupTitle = document.getElementById('popupTitle');
            const popupText = document.getElementById('popupText');
            const holidayImage = document.getElementById('holidayImage');
            
            // ... (Code đầy đủ cho popup)
            
            setTimeout(() => { /* ... code hiển thị ... */ }, 1500);
        }
    }

    // --- 2.4: CÁC HÀM DÀNH RIÊNG CHO TRANG CON ---
    function initCategoryPage() {
        // Ghi chú: Code cho trang chuyên mục sẽ nằm ở đây
    }

    // --- 2.5: BỘ ĐIỀU KHIỂN ---
    updateClock();
    setInterval(updateClock, 1000);

    if (document.getElementById('homepage-content')) {
        initHomepage();
    } else if (document.getElementById('category-page')) {
        initCategoryPage();
    }
});
