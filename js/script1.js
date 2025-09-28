// script.js

document.addEventListener('DOMContentLoaded', function() {

// ==========================================================
// MỤC 1: LOGIC CẬP NHẬT PWA (THÔNG MINH)
// ==========================================================
    // --- PHẦN MỚI: LOGIC THÔNG BÁO CẬP NHẬT PWA ---
    // GHI CHÚ: Dán toàn bộ khối code PWA vào đây.
    if ('serviceWorker' in navigator) {
      let newWorker;

      // Hàm này sẽ tạo ra và hiển thị một thông báo ở góc màn hình.
      function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'p-4 bg-gray-800 text-white rounded-lg shadow-lg fixed bottom-5 right-5 z-50';
        notification.innerHTML = `
          <p class="mb-2">Có bản cập nhật mới!</p>
          <button id="reload-button" class="px-4 py-1 bg-yellow-600 rounded hover:bg-yellow-700">Tải lại</button>
        `;
        document.body.appendChild(notification);

        // Khi người dùng nhấn nút "Tải lại", gửi tín hiệu cho Service Worker mới.
        document.getElementById('reload-button').addEventListener('click', () => {
          newWorker.postMessage({ action: 'skipWaiting' });
        });
      }

      // Đăng ký Service Worker và lắng nghe sự kiện có bản cập nhật.
      navigator.serviceWorker.register('/sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotification(); // Hiển thị thông báo.
            }
          });
        });
      });

      // Khi Service Worker mới tự động tải lại trang.
      let refreshing;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
      });
    }

// ==========================================================
// MỤC 2: LOGIC CHÍNH CỦA TRANG WEB
// ==========================================================

    // --- 2.1: LẤY TẤT CẢ CÁC THÀNH PHẦN HTML ---
    // GHI CHÚ: Khai báo tất cả các biến cần dùng cho toàn bộ trang.
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const bannerSlider = document.getElementById('bannerSlider');
    const postsContainer = document.getElementById('latest-posts-container');
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const popupTitle = document.getElementById('popupTitle');
    const popupText = document.getElementById('popupText');
    const holidayImage = document.getElementById('holidayImage');
    const guidePostsContainer = document.getElementById('guide-posts-container');
    const videoGuidesContainer = document.getElementById('video-guides-container');

    // --- CÁC HÀM CHỨC NĂNG ---
    // --- 2.2: CÁC HÀM DÙNG CHUNG CHO MỌI TRANG ---
     // 2.2.1: Cập nhật đồng hồ
    function updateClock() {
        if (!timeEl || !dateEl) return;
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // 2.2.2: Xử lý menu di động
    updateClock();
    setInterval(updateClock, 1000); //không biết đoạn này
    
    if (menuToggle && mobileMenu) {
        // Bật/tắt menu khi nhấn vào nút 3 gạch
        menuToggle.addEventListener('click', (event) => {
            // Ngăn sự kiện click này lan ra ngoài document, tránh việc vừa mở đã bị đóng ngay
            event.stopPropagation(); 
            mobileMenu.classList.toggle('hidden');
        });

        // Đóng menu khi nhấn ra ngoài vùng menu
        document.addEventListener('click', (event) => {
            // Kiểm tra xem menu có đang mở không VÀ điểm nhấn có nằm ngoài cả nút toggle và menu không
            const isClickInsideMenu = mobileMenu.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (!mobileMenu.classList.contains('hidden') && !isClickInsideMenu && !isClickOnToggle) {
                mobileMenu.classList.add('hidden'); // Chỉ đóng chứ không toggle
            }
        });
    }

    // --- 2.3: CÁC HÀM DÀNH RIÊNG CHO TRANG CHỦ ---
    function initHomepage() {
    // 2.3.1: Tải nội dung cho Banner



    
    
    // 2. Tải nội dung cho Banner
    function loadBanner() {
            if (!bannerSlider || typeof bannerSlides === 'undefined') return;
            bannerSlider.innerHTML = bannerSlides.map(slide => 
                `<a href="${slide.link}" class="w-full flex-shrink-0" target="_blank" rel="noopener noreferrer">
                    <img src="${slide.imageUrl}" alt="Banner" class="w-full rounded-lg object-cover">
                </a>`
            ).join('');
        }

    // 3. Khởi chạy hiệu ứng trượt cho Banner
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

    // 4. Tải các bài viết mới nhất
    function loadLatestPosts() {
        if (!postsContainer) return;
        if (typeof latestPosts === 'undefined' || latestPosts.length === 0) {
            postsContainer.innerHTML = "<p class='text-center col-span-full'>Chưa có bài viết nào.</p>";
            return;
        }

        let postsHtml = '';
        for (const post of latestPosts) {
            // --- THAY ĐỔI NẰM Ở ĐÂY ---
            postsHtml += `
                <a href="${post.link}" class="group block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                    <img src="${post.imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-2 transition-colors group-hover:text-yellow-600">${post.title}</h3>
                        <p class="text-gray-600 text-sm">${post.summary}</p>
                    </div>
                </a>
            `;
        }
        postsContainer.innerHTML = postsHtml;
    }

    // 5. Kiểm tra ngày lễ và hiển thị Popup
    function checkAndShowPopup() {
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

// 6. Tải các bài viết hướng dẫn
    function loadGuidePosts() {
        if (!guidePostsContainer) return;
        if (typeof guidePosts === 'undefined' || guidePosts.length === 0) {
            guidePostsContainer.innerHTML = "<p class='text-gray-600'>Chưa có bài viết nào.</p>";
            return;
        }
        let postsHtml = '';
        for (const post of guidePosts) {
            postsHtml += `
                <a href="${post.link}" class="flex items-center space-x-4 group">
                    <img src="${post.imageUrl}" alt="${post.title}" class="w-24 h-16 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105">
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-800 group-hover:text-yellow-600">${post.title}</h3>
                        <p class="text-gray-600 text-sm">${post.summary}</p>
                    </div>
                </a>
            `;
        }
        guidePostsContainer.innerHTML = postsHtml;
    }

    // 7. Tải các video hướng dẫn
    function loadVideoGuides() {
        if (!videoGuidesContainer) return;
        if (typeof videoGuides === 'undefined' || videoGuides.length === 0) {
            videoGuidesContainer.innerHTML = "<p class='text-gray-600'>Chưa có video nào.</p>";
            return;
        }
        let videosHtml = '';
        for (const video of videoGuides) {
            videosHtml += `
                <a href="${video.link}" class="flex items-center space-x-4 group">
                    <img src="${video.imageUrl}" alt="${video.title}" class="w-24 h-16 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105">
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-800 group-hover:text-yellow-600">${video.title}</h3>
                        <p class="text-gray-600 text-sm">${video.summary}</p>
                    </div>
                </a>
            `;
        }
        videoGuidesContainer.innerHTML = videosHtml;
    }











    // --- GỌI CÁC HÀM ĐỂ CHẠY TRANG WEB ---

    // Chạy các chức năng cơ bản


    // Tải nội dung động
    loadBanner();
    loadLatestPosts();
    loadGuidePosts();
    loadVideoGuides();

    // Khởi chạy các thành phần sau khi nội dung đã được tải
    initBannerSlider();
    
    // --- Hẹn giờ cho Popup (CHỈ CHẠY Ở TRANG CHỦ) ---
    // Kiểm tra nếu đang ở trang chủ (index.html hoặc đường dẫn gốc "/") thì mới chạy popup
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
        setTimeout(checkAndShowPopup, 500);
        setTimeout(() => { if (popupOverlay) popupOverlay.style.display = 'none'; }, 7000); // 0.5s chờ + 6.5s hiển thị
        
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => popupOverlay.style.display = 'none');
        }
    }
});
