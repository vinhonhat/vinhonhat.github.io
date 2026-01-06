document.addEventListener('DOMContentLoaded', function() {

    // =================================================================
    // MỤC LỤC  phiên bản V26.1.6
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

	// --- 1. HÀM TẢI HTML ĐỘNG (THÊM MỚI) ---
    // Hàm này sẽ tải nội dung từ một file (vd: header.html) vào một element trên trang
    const loadHTML = (file, elementId) => {
        return fetch(file)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
                return response.text();
            })
            .then(data => {
                const element = document.getElementById(elementId);
                if (element) element.innerHTML = data;
            })
            .catch(error => console.error(`Error loading ${file}:`, error));
    };
	
	
    // --- 1. ĐĂNG KÝ SERVICE WORKER CHO PWA (Giữ nguyên) ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('ServiceWorker đã đăng ký:', registration.scope))
                .catch(err => console.log('ServiceWorker đăng ký thất bại:', err));
        });
    }

    // --- 2. LẤY CÁC THÀNH PHẦN HTML (ELEMENTS) (Giữ nguyên) ---
    //const timeEl = document.getElementById('time');
    //const dateEl = document.getElementById('date');
    //const menuToggle = document.getElementById('menu-toggle');
    //const mobileMenu = document.getElementById('mobile-menu');
    const bannerSlider = document.getElementById('bannerSlider');
    const postsContainer = document.getElementById('latest-posts-container'); // Sẽ dùng cho bài viết đề xuất
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const popupTitle = document.getElementById('popupTitle');
    const popupText = document.getElementById('popupText');
    const holidayImage = document.getElementById('holidayImage');
    const guidePostsContainer = document.getElementById('guide-posts-container');
    const videoGuidesContainer = document.getElementById('video-guides-container');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn'); // nút cuộn lên đầu

    // --- 3. CÁC HÀM CHỨC NĂNG ---

    // --- 3.1. Chức năng không đổi (Đồng hồ, Banner, Popup...) (Giữ nguyên) ---
    // HÀM MỚI: Dùng để định dạng ngày tháng cho đẹp
    // Hàm này dùng để đổi định dạng ngày sang kiểu "ngày 07 tháng 11 năm 2025"
    function formatDate(dateString) {
        // Nếu không có dateString (hoặc là null/undefined), trả về chuỗi rỗng
        if (!dateString) return ""; 

        try {
            const date = new Date(dateString);
            
            // 1. Lấy ngày và thêm '0' vào trước nếu là 1 ký tự (e.g., "07")
            const day = String(date.getDate()).padStart(2, '0');
            
            // 2. Lấy tên tháng theo tiếng Việt (e.g., "tháng 11")
            const monthName = date.toLocaleDateString('vi-VN', { month: 'long' });
            
            // 3. Lấy năm
            const year = date.getFullYear();

            // Kiểm tra xem ngày có hợp lệ không
            if (!day || !monthName || isNaN(year)) {
                return dateString; // Trả về ngày gốc nếu không parse được
            }

            // 4. Ghép chuỗi lại
            return `ngày ${day} ${monthName} năm ${year}`;
            
        } catch (e) {
            return dateString; // Trả về ngày gốc nếu có lỗi
        }
    }    
    
    // Cập nhật đồng hồ
    function updateClock() {
        const timeEl = document.getElementById('time');
        const dateEl = document.getElementById('date');
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
        // THÊM DÒNG NÀY: Nếu pháo hoa đang chạy thì thôi, không hiện popup thường
        if (window.isFireworksPlaying) return;
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
            popupTitle.innerHTML = `<span class="rainbow-text font-bold">🎉Chào mừng ngày ${activeHoliday.name}!🎉</span>`;
            popupText.textContent = "Chúc bạn và gia đình có một ngày lễ thật ý nghĩa và vui vẻ!";
			// --- BỔ SUNG LOGIC CHỌN ẢNH D/M ---
			// Mặc định là ảnh desktop ('d')
			let imageSuffix = 'd'; 
			// Nếu chiều rộng màn hình nhỏ hơn 768px (di động/máy tính bảng) thì đổi sang ảnh mobile ('m')
			if (window.innerWidth < 768) {
				imageSuffix = 'm';
			}
			holidayImage.src = `img/holidays/${activeHoliday.imagePrefix}${imageSuffix}.jpg`;
			// --- KẾT THÚC LOGIC CHỌN ẢNH ---
			holidayImage.style.display = 'block';
			
        } else if (typeof proverbs !== 'undefined') {
            popupTitle.textContent = "";
            popupText.innerHTML = proverbs[Math.floor(Math.random() * proverbs.length)];
            popupText.classList.add('rainbow-text', 'text-2xl', 'font-bold');
            holidayImage.style.display = 'none';
        }
        popupOverlay.style.display = 'flex';
    }



	    // --- 3.2. Tải bài viết ĐỀ XUẤT (THEO KÍCH THƯỚC MÀN HÌNH) ---
        function loadFeaturedPosts(allContent) {
        // Kiểm tra xem element và dữ liệu có tồn tại không
            if (!postsContainer || !allContent) return;
        // if (!postsContainer || typeof allContent === 'undefined') return; sau khi đổi qua json


        // BƯỚC 1: Lọc ra tất cả các bài có thuộc tính `featured: true`
        const featuredItems = allContent.filter(item => item.featured === true && (item.status !== 0));

        // BƯỚC 2: SẮP XẾP các bài vừa lọc theo ngày mới nhất lên đầu
        const sortedItems = featuredItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        // BƯỚC 3: Giới hạn số bài viết theo kích thước màn hình
        // PC (>=1024px): 6 bài
        // iPad (>=640px và <1024px): 4 bài
        // Mobile (<640px): 2 bài
        let maxItems = 6;
        if (window.innerWidth < 640) {
            maxItems = 2; // Điện thoại
        } else if (window.innerWidth < 1024) {
            maxItems = 4; // iPad
        }
        const itemsToDisplay = sortedItems.slice(0, maxItems);

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

    
    // === HÀM XỬ LÝ CUỘN TRANG (NÚT LÊN ĐẦU & ẨN MENU) ===
    // === HÀM XỬ LÝ CUỘN TRANG (ĐÃ SỬA LỖI NHÁY) ===
    function handleScroll() {
        // Lấy vị trí cuộn hiện tại
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        // ĐỊNH NGHĨA 2 MỐC (MỐC ẨN VÀ MỐC HIỆN)
        const HIDE_THRESHOLD = 200; // Mốc để ẩn menu / hiện nút
        const SHOW_THRESHOLD = 100;  // Mốc để hiện menu / ẩn nút

        // --- 1. Điều khiển nút "Lên đầu" ---
        if (scrollToTopBtn) { 
            // Logic của nút thì đơn giản, có thể dùng 1 mốc HIDE_THRESHOLD
            if (scrollTop > HIDE_THRESHOLD) {
                scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                scrollToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                scrollToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
                scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        }

        // --- 2. Điều khiển ẩn/hiện Menu Nav (Dùng 2 mốc) ---
        const navContent = document.getElementById('nav-content');
        if (navContent) {
            if (scrollTop > HIDE_THRESHOLD) {
                // Khi cuộn XUỐNG qua 100px -> ẨN menu
                navContent.classList.add('max-h-0', 'opacity-0', 'py-0', 'overflow-hidden');
            } else if (scrollTop < SHOW_THRESHOLD) {
                // Khi cuộn LÊN qua 50px -> HIỆN menu
                navContent.classList.remove('max-h-0', 'opacity-0', 'py-0', 'overflow-hidden');
            }
            // *** QUAN TRỌNG: ***
            // Nếu vị trí cuộn nằm TRONG KHOẢNG (ví dụ 70px), hàm sẽ không làm gì cả.
            // Nó giữ nguyên trạng thái (đang ẩn), vì vậy sẽ không bị nháy.
        }
    }

    // === HÀM BẤM NÚT LÊN ĐẦU ===
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }










    // --- 3.3. Tải bài viết HƯỚNG DẪN (NÂNG CẤP) ---
    function loadGuidePosts(allContent) {
    // Kiểm tra xem element và dữ liệu có tồn tại không
        if (!guidePostsContainer || !allContent) return;
        // if (!guidePostsContainer || typeof allContent === 'undefined') return; đã đổi qua json

        // BƯỚC 1: Lọc ra các bài có `type: 'guide'`
        const guides = allContent.filter(item => item.type === 'guide' && (item.status !== 0));

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
    function loadVideoGuides(allContent) {
        // Kiểm tra xem element và dữ liệu có tồn tại không
        if (!videoGuidesContainer || !allContent) return;
        // if (!videoGuidesContainer || typeof allContent === 'undefined') return;

        // Logic tương tự như loadGuidePosts, chỉ khác là lọc theo `type: 'video'`
        // BƯỚC 1: Lọc ra các video có `type: 'video'`
        const videos = allContent.filter(item => item.type === 'video' && (item.status !== 0));

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
	
	// 1. Tải Header, SAU ĐÓ chạy các chức năng của header
    loadHTML('/hf/header.html', 'header-placeholder').then(() => {
        updateClock();
        setInterval(updateClock, 1000);

        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                mobileMenu.classList.toggle('hidden');
            });
            document.addEventListener('click', (event) => {
                if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
    });

    // 2. Tải Footer
    loadHTML('/hf/footer.html', 'footer-placeholder');

	
	
    // 3. Tải nội dung động (CẬP NHẬT)
    loadBanner(); // Tải banner (từ banner.js)
    initBannerSlider(); // Khởi chạy banner slider


    // THAY ĐỔI: Tải nội dung chính từ file posts.json
fetch('/data/posts.json') // Tải file JSON
    .then(response => {
        if (!response.ok) {
            throw new Error("Không thể tải /data/posts.json: " + response.statusText);
        }
        return response.json(); // Chuyển đổi phản hồi thành JSON
    })
    .then(allContent => {
        // Khi tải dữ liệu thành công, 'allContent' là mảng dữ liệu

        // 1. Gọi các hàm để hiển thị bài viết, truyền 'allContent' vào
        loadFeaturedPosts(allContent);
        loadGuidePosts(allContent);
        loadVideoGuides(allContent);

        // 2. Gắn sự kiện resize để tải lại bài viết đề xuất
        //    Sự kiện này phải ở BÊN TRONG .then() để đảm bảo 'allContent' tồn tại
        window.addEventListener('resize', () => {
            loadFeaturedPosts(allContent);
        });
    })
    .catch(error => {
        // Xử lý nếu có lỗi khi tải file JSON
        console.error("Lỗi nghiêm trọng khi tải nội dung bài viết:", error);
        if (postsContainer) postsContainer.innerHTML = "<p class='text-center col-span-full text-red-500'>Không thể tải được nội dung bài viết. Vui lòng thử lại sau.</p>";
        if (guidePostsContainer) guidePostsContainer.innerHTML = "<p class='text-red-500'>Không thể tải hướng dẫn.</p>";
        if (videoGuidesContainer) videoGuidesContainer.innerHTML = "<p class='text-red-500'>Không thể tải video.</p>";
    });








    //4.  Hẹn giờ cho Popup (Giữ nguyên)
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
        setTimeout(checkAndShowPopup, 500);
        setTimeout(() => { if (popupOverlay) popupOverlay.style.display = 'none'; }, 7000);
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => popupOverlay.style.display = 'none');
        }
    }

    // 6. GẮN SỰ KIỆN CHO NÚT CUỘN LÊN ĐẦU (ĐOẠN BẠN BỊ THIẾU)
    // Sửa lại hàm handleScroll (phiên bản an toàn)

    if (scrollToTopBtn) {
        window.addEventListener('scroll', handleScroll);      // Theo dõi sự kiện cuộn
        scrollToTopBtn.addEventListener('click', scrollToTop); // Theo dõi sự kiện click
    }




    /* ============================================= */
    /* ===== HIỆU ỨNG CHUYỂN ĐỘNG TIÊU ĐỀ TAB ===== */
    /* ============================================= */

    function startTitleAnimation() {
        // Lấy tiêu đề gốc của trang
        const originalTitle = document.title;
        
        // Thêm một khoảng đệm vào cuối tiêu đề để cuộn đẹp hơn
        let animatedTitle = originalTitle + " ... "; 
        
        // Bắt đầu một vòng lặp
        setInterval(() => {
            // Lấy ký tự đầu tiên và chuyển nó xuống cuối chuỗi
            animatedTitle = animatedTitle.substring(1) + animatedTitle.substring(0, 1);
            
            // Cập nhật tiêu đề của tab trình duyệt
            document.title = animatedTitle;

        }, 300); // Tốc độ cuộn: 300ms. Bạn có thể thay đổi số này (số nhỏ hơn = cuộn nhanh hơn)
    }

    // Chỉ chạy hiệu ứng này sau khi trang đã tải xong
    // (Chúng ta thêm vào 'DOMContentLoaded' để đảm bảo nó không chạy quá sớm)
    document.addEventListener('DOMContentLoaded', startTitleAnimation);

}); // <-- Dòng này là dòng cuối cùng của file