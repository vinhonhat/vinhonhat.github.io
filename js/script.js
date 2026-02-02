document.addEventListener('DOMContentLoaded', function() {

    // =================================================================
    // =========================== MỤC LỤC =============================
    // ================= PHIÊN BẢN CẬP NHẬT V26.1.25 ===================
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
    function getMoonPhaseSVG(lunarDay) {
    const svgHeader = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:middle; margin-right:6px;">`;
    const svgFooter = `</svg>`;
    
    // --- CẤU HÌNH MÀU SẮC ---
    const moonColor = "#FFB700"; // Màu vàng sáng cho ánh trăng
    const grayColor = "#9CA3AF"; // Màu xám cho phần bóng tối
    
    // Nền xám mờ phía sau để tạo hiệu ứng khối cầu
    const dimGrayCircle = `<circle cx="12" cy="12" r="10" fill="${grayColor}" opacity="0.2"/>`;
    const fillMoon = `fill="${moonColor}"`;

    let path = "";

    // MỐC 1: Ngày 28, 29, 30, 1, 2 - Trăng tối (Chỉ là hình tròn xám mờ)
    if (lunarDay >= 28 || lunarDay <= 2) {
        return `${svgHeader}<circle cx="12" cy="12" r="10" fill="${grayColor}" opacity="0.4"/>${svgFooter}`;
    }

    // MỐC 5: Ngày 14, 15, 16 - Trăng tròn (Màu vàng rực rỡ)
    if (lunarDay >= 14 && lunarDay <= 16) {
        return `${svgHeader}<circle cx="12" cy="12" r="10" ${fillMoon}/>${svgFooter}`;
    }

    // --- XỬ LÝ CÁC MỐC TRĂNG KHUYẾT (MỐC 2, 3, 4) ---

    // =========================================================
    // GIAI ĐOẠN TRĂNG LÊN (Sáng dần từ PHẢI sang TRÁI)
    // Đầu tháng (Từ mùng 3 đến 13)
    // =========================================================
    if (lunarDay >= 3 && lunarDay <= 13) {
        if (lunarDay <= 5) {
            // MỐC 2: Lưỡi liềm PHẢI (Sáng một ít bên phải)
            path = `<path d="M 12 2 A 10 10 0 0 1 12 22 A 6 10 0 0 0 12 2 Z" ${fillMoon}/>`;
        } else if (lunarDay <= 9) {
            // MỐC 3: Nửa hình tròn PHẢI (Trăng Thượng Huyền)
            path = `<path d="M 12 2 A 10 10 0 0 1 12 22 Z" ${fillMoon}/>`;
        } else {
            // MỐC 4: Hiện 75% bên PHẢI (Sắp tròn)
            path = `<path d="M 12 2 A 10 10 0 0 1 12 22 A 6 10 0 0 1 12 2 Z" ${fillMoon}/>`;
        }
    } 
    // =========================================================
    // GIAI ĐOẠN TRĂNG TÀN (Tối dần từ phải, ánh sáng còn lại ở TRÁI)
    // Cuối tháng (Từ 17 đến 27)
    // =========================================================
    else if (lunarDay >= 17 && lunarDay <= 27) {
        if (lunarDay <= 20) {
            // MỐC 4: Còn lại 75% bên TRÁI
            path = `<path d="M 12 2 A 10 10 0 0 0 12 22 A 6 10 0 0 0 12 2 Z" ${fillMoon}/>`;
        } else if (lunarDay <= 24) {
            // MỐC 3: Nửa hình tròn TRÁI (Trăng Hạ Huyền)
            path = `<path d="M 12 2 A 10 10 0 0 0 12 22 Z" ${fillMoon}/>`;
        } else {
            // MỐC 2: Lưỡi liềm TRÁI (Chỉ còn vệt sáng bên trái)
            path = `<path d="M 12 2 A 10 10 0 0 0 12 22 A 6 10 0 0 1 12 2 Z" ${fillMoon}/>`;
        }
    }

    return `${svgHeader}${dimGrayCircle}${path}${svgFooter}`;
}
    // Cập nhật đồng hồ (Phiên bản V2: Thêm Can Chi - Năm)
    function updateClock() {
        const timeEl = document.getElementById('time');
        const dateEl = document.getElementById('date');
        
        if (!timeEl || !dateEl) return;
        
        const now = new Date();
        
        // 1. Hiển thị giờ
        timeEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // 2. Hiển thị ngày Dương
        const solarString = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        // 3. Tính ngày Âm & Can Chi
        let lunarHtml = ''; 
        
        if (typeof getLunarDate === 'function') {
            const lunar = getLunarDate(now.getDate(), now.getMonth() + 1, now.getFullYear());
            
            const lDay = String(lunar.day).padStart(2, '0');
            const lMonth = String(lunar.month).padStart(2, '0');

            // --- TÍNH CAN CHI (MỚI) ---
            const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
            const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
            
            // Công thức tính Can Chi dựa trên số cuối của năm Âm lịch
            const can = CAN[lunar.year % 10];
            const chi = CHI[lunar.year % 12];
            const canChiStr = `${can} ${chi}`;
            
            // Tạo HTML hiển thị
            // Mẫu: 🌙 01/01 - Ất Tỵ
            // Lấy icon mặt trăng tương ứng với ngày
            const moonIcon = getMoonPhaseSVG(lunar.day);

            lunarHtml = `
                <div style="color: #d97706; font-size: 0.95em; margin-top: 4px; font-weight: 500; display: flex; align-items: center; justify-content: flex-end;">
                    ${moonIcon} ${lDay}/${lMonth} - Năm ${canChiStr} ${lunar.leap ? '(Nhuận)' : ''}
                </div>
            `;
        }

        dateEl.innerHTML = `<div>${solarString}</div>${lunarHtml}`;
    }
    // Cập nhật đồng hồ
    //function updateClock() {
    //    const timeEl = document.getElementById('time');
    //    const dateEl = document.getElementById('date');
    //    if (!timeEl || !dateEl) return;
    //    const now = new Date();
    //    timeEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    //    dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    //}

    // Tải và chạy Banner
   // --- HÀM TẠO BANNER ĐỘNG (ĐÃ NÂNG CẤP THEO YÊU CẦU) ---
    async function loadBanner() { // ĐÃ THÊM 'async' VÀO ĐÂY
        if (!bannerSlider) return;

        // 1. CHUẨN BỊ THỜI GIAN HIỆN TẠI (Reset giờ về 0 để so sánh ngày cho chuẩn)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();

        // 2. TẠO DANH SÁCH LỄ HỘI VỚI NGÀY DƯƠNG CHUẨN XÁC
        let upcomingHolidays = [];

        // Lấy 2 năm (năm nay và năm sau) để phòng trường hợp cuối năm (ví dụ Tết DL năm sau)
        [currentYear, currentYear + 1].forEach(year => {
            holidays.forEach(h => {
                let eventDate;
                if (h.isLunar) {
                    // Gọi hàm convertLunarToSolar từ lunar-calendar.js
                    eventDate = convertLunarToSolar(h.day, h.month, year, false);
                } else {
                    eventDate = new Date(year, h.month - 1, h.day);
                }
                
                if (eventDate) {
                    eventDate.setHours(0, 0, 0, 0);
                    upcomingHolidays.push({
                        ...h,
                        date: eventDate,
                        imageUrl: `/img/banners/${h.imagePrefix}.jpg`,
                        link: "#" // Có thể sửa link nếu muốn
                    });
                }
            });
        });

        // 3. SẮP XẾP LỄ HỘI THEO THỜI GIAN (GẦN NHẤT LÊN ĐẦU)
        upcomingHolidays.sort((a, b) => a.date - b.date);

        // 4. LỌC BỎ SỰ KIỆN QUÁ HẠN (LOGIC "CUỐN CHIẾU" & KHOẢNG CÁCH)
        // Lấy ra danh sách các sự kiện chưa hết hạn hiển thị
        let validHolidays = [];
        
        for (let i = 0; i < upcomingHolidays.length; i++) {
            const currentEvent = upcomingHolidays[i];
            const nextEvent = upcomingHolidays[i + 1];

            // TÍNH TOÁN: Số ngày cho ĐẾN lễ (Đã sửa đồng bộ biến 'daysUntilEvent')
            const daysUntilEvent = Math.round((currentEvent.date - today) / (1000 * 60 * 60 * 24));

            // --- YÊU CẦU 1: Quá 30 ngày -> Bỏ qua ---
            //if (daysUntilEvent > 30) continue;

            // --- YÊU CẦU 2: Chưa diễn ra (từ 0 đến 30 ngày) -> Giữ lại ---
            if (daysUntilEvent >= 0) {
                validHolidays.push(currentEvent);
                continue;
            }

            // Nếu sự kiện đã qua, tính toán thời gian ẩn (hết hạn) dựa vào sự kiện TIẾP THEO
            let expireDays = 5; // Mặc định ẩn sau 5 ngày

            if (nextEvent) {
                // Khoảng cách giữa sự kiện này và sự kiện tiếp theo
                const gapToNext = Math.round((nextEvent.date - currentEvent.date) / (1000 * 60 * 60 * 24));

                if (gapToNext <= 2) {
                    expireDays = 0; // Ẩn ngay trong ngày
                } else if (gapToNext <= 4) {
                    expireDays = 1; // Ẩn sau 1 ngày
                } else if (gapToNext >= 15) {
                    expireDays = 5; // Ẩn sau 5 ngày
                } else if (gapToNext >= 10) {
                    expireDays = 3; // Ẩn sau 3 ngày
                } else {
                    expireDays = 2; // Các trường hợp còn lại (khoảng cách 5-9 ngày)
                }
            }

            // Kiểm tra xem đã đến lúc ẩn chưa
            // Dùng Math.abs để chuyển số âm thành dương khi so sánh
            if (Math.abs(daysUntilEvent) <= expireDays) {
                validHolidays.push(currentEvent);
            }
        }

        // =====================================================================
        // 4.5. KIỂM TRA ẢNH LỖI: TÌM THẾ CHỖ TRONG 30 NGÀY, K CÓ THÌ CẮT VỊ TRÍ
        // =====================================================================
        let finalHolidayBanners = [];
        let maxSlots = 4; // Mặc định hiển thị 4 ảnh
        let failedEventDate = null; // Biến lưu mốc ngày của ảnh bị lỗi

        for (let item of validHolidays) {
            // Nếu đã lấy đủ số lượng ảnh cho phép thì dừng
            if (finalHolidayBanners.length >= maxSlots) break; 

            // NẾU TRƯỚC ĐÓ CÓ ẢNH LỖI:
            if (failedEventDate) {
                // Tính khoảng cách từ ảnh này so với MỐC ẢNH LỖI
                const diffDays = Math.round((item.date - failedEventDate) / (1000 * 60 * 60 * 24));
                
                // Nếu cách Mốc Lỗi QUÁ 30 NGÀY -> Không được thế chỗ nữa
                if (diffDays > 30) {
                    maxSlots--; // Cắt vĩnh viễn 1 vị trí (từ 4 giảm xuống còn 3 ảnh)
                    failedEventDate = null; // Hủy mốc lỗi để xét item này như bình thường
                }
            }

            // Kiểm tra xem ảnh có trên máy chủ không
            const isImageOk = await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);  
                img.onerror = () => resolve(false); 
                img.src = item.imageUrl;
            });

            if (isImageOk) {
                // Ảnh Tốt: Thêm vào và reset mốc lỗi (nếu có)
                finalHolidayBanners.push(item);
                failedEventDate = null; 
            } else {
                // Ảnh Lỗi: Ghi nhớ ngày của ảnh này làm MỐC 
                // (Chỉ ghi nếu chưa có mốc nào trước đó)
                if (!failedEventDate) failedEventDate = item.date;
            }
        }



        // 5. KẾT HỢP QUẢNG CÁO (ADS LOGIC)
        // adsBanners được lấy từ file banner.js
        let finalBanners = [];
        const adCount = (typeof adsBanners !== 'undefined') ? adsBanners.length : 0;

        if (adCount === 0) {
            // Không có QC -> Hiện 4 Lễ
            finalBanners = finalHolidayBanners;
        } else if (adCount === 1) {
            // 1 QC -> 1 QC + 3 Lễ (Ẩn lễ thứ 4)
            finalBanners = [...adsBanners, ...finalHolidayBanners.slice(0, 3)];
        } else if (adCount === 2) {
            // 2 QC -> 2 QC + 2 Lễ (Ẩn lễ 3 & 4)
            finalBanners = [...adsBanners, ...finalHolidayBanners.slice(0, 2)];
        } else {
            // Từ 3 QC trở lên -> Tất cả QC + 2 Lễ (Không ẩn lễ thêm nữa)
            finalBanners = [...adsBanners, ...finalHolidayBanners.slice(0, 2)];
        }

        // 6. RENDER RA HTML
        if (finalBanners.length === 0) return;

        let bannerHtml = '';
        let dotsHtml = ''; // Thêm biến chứa HTML của chấm tròn

        // 1. TẠO HTML CHẤM TRÒN (Chỉ tạo đúng số lượng ảnh gốc)
        finalBanners.forEach((slide, index) => {
            // Quan trọng: data-index bắt đầu từ 1 (thay vì 0)
            dotsHtml += `
                <button data-index="${index + 1}" class="dot-btn relative h-2 w-2 rounded-full overflow-hidden transition-all duration-300 bg-white/60">
                    <span class="progress-bar absolute top-0 left-0 h-full bg-yellow-500 w-0"></span>
                </button>
            `;
        });

        // 2. TẠO HTML ẢNH (Bao gồm: Ảnh cuối ảo + Các ảnh gốc + Ảnh đầu ảo)
        const renderSlide = (slide) => `
            <a href="${slide.link}" class="w-full flex-shrink-0" draggable="false">
                <img src="${slide.imageUrl}" alt="Banner" class="w-full h-auto rounded-lg object-cover select-none" draggable="false">
            </a>
        `;
        
        // Nối HTML theo thứ tự chuẩn cho Infinite Loop
        bannerHtml += renderSlide(finalBanners[finalBanners.length - 1]); // Chèn bản sao ảnh cuối lên đầu
        finalBanners.forEach(slide => bannerHtml += renderSlide(slide));  // Chèn các ảnh gốc vào giữa
        bannerHtml += renderSlide(finalBanners[0]);                       // Chèn bản sao ảnh đầu xuống cuối

        // 3. ĐẨY RA GIAO DIỆN (Giữ nguyên như cũ)
        bannerSlider.innerHTML = bannerHtml;
        const bannerDots = document.getElementById('bannerDots');
        if (bannerDots) bannerDots.innerHTML = dotsHtml;
    } // <-- Dấu đóng hàm loadBanner()

    
    // --- HÀM KHỞI CHẠY BANNER (MỚI: VUỐT + CHẤM TRÒN + VÒNG LẶP VÔ TẬN) ---
    // --- HÀM KHỞI CHẠY BANNER (ĐÃ SỬA LỖI KẸT BANNER) ---
    function initBannerSlider() {
        const slider = document.getElementById('bannerSlider');
        const dotsContainer = document.getElementById('bannerDots');
        
        if (!slider || slider.children.length <= 1) return;

        let currentIndex = 1; // Bắt đầu ở vị trí 1 (ảnh gốc đầu tiên)
        const totalSlides = slider.children.length;
        const realSlidesCount = totalSlides - 2; // Số ảnh gốc thực tế
        let isTransitioning = false; // Cờ khóa click liên tục
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot-btn') : [];
        let autoPlayInterval;
        const slideDuration = 4000; // 4 giây

        slider.style.cursor = 'grab';

        function goToSlide(index) {
            // FIX 1: Chặn không cho chạy nếu đang trượt HOẶC bấm vào chính slide hiện tại
            if (isTransitioning || index === currentIndex) return; 
            
            isTransitioning = true;
            currentIndex = index;

            slider.style.transition = 'transform 0.5s ease-in-out';
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Tính lại index cho chấm tròn
            let dotIndex = currentIndex - 1;
            if (currentIndex === 0) dotIndex = realSlidesCount - 1;
            if (currentIndex === totalSlides - 1) dotIndex = 0;

            dots.forEach((dot, idx) => {
                const progressBar = dot.querySelector('.progress-bar');
                if (idx === dotIndex) { 
                    dot.className = "dot-btn relative h-2 w-8 rounded-full overflow-hidden transition-all duration-300 bg-white/30";
                    progressBar.style.transition = 'none';
                    progressBar.style.width = '0%';
                    setTimeout(() => {
                        progressBar.style.transition = `width ${slideDuration}ms linear`;
                        progressBar.style.width = '100%';
                    }, 50);
                } else {
                    dot.className = "dot-btn relative h-2 w-2 rounded-full overflow-hidden transition-all duration-300 bg-white/60";
                    progressBar.style.transition = 'none';
                    progressBar.style.width = '0%';
                }
            });
        }

        // Xử lý dịch chuyển âm thầm khi trượt xong
        slider.addEventListener('transitionend', () => {
            isTransitioning = false; // Mở khóa cờ trượt
            if (currentIndex === 0) {
                // Đang ở Clone cuối -> Nhảy về ảnh thật cuối cùng
                slider.style.transition = 'none';
                currentIndex = realSlidesCount;
                slider.style.transform = `translateX(-${currentIndex * 100}%)`;
            } else if (currentIndex === totalSlides - 1) {
                // Đang ở Clone đầu -> Nhảy về ảnh thật đầu tiên
                slider.style.transition = 'none';
                currentIndex = 1;
                slider.style.transform = `translateX(-100%)`;
            }
        });

        function startAutoPlay() {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(() => goToSlide(currentIndex + 1), slideDuration);
        }

        let startX = 0;
        let isDragging = false;

        function startDrag(e) {
            if (isTransitioning) return; // Khóa vuốt khi đang trượt
            isDragging = true;
            slider.style.cursor = 'grabbing';
            clearInterval(autoPlayInterval); 
            const activeProgressBar = dots[currentIndex - 1]?.querySelector('.progress-bar');
            if(activeProgressBar) activeProgressBar.style.transition = 'none'; 
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        }

        function endDrag(e) {
            if (!isDragging) return;
            isDragging = false;
            slider.style.cursor = 'grab';
            const endX = e.type.includes('mouse') ? e.pageX : e.changedTouches[0].clientX;
            const diffX = startX - endX;

            // FIX 2: Bỏ điều kiện else gây kẹt khi vuốt quá nhẹ
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) goToSlide(currentIndex + 1);
                else goToSlide(currentIndex - 1);
            }
            startAutoPlay();
        }

        slider.addEventListener('mousedown', startDrag);
        slider.addEventListener('mouseup', endDrag);
        slider.addEventListener('mouseleave', endDrag);
        slider.addEventListener('touchstart', startDrag, { passive: true });
        slider.addEventListener('touchend', endDrag, { passive: true });

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                clearInterval(autoPlayInterval);
                goToSlide(index);
                startAutoPlay(); // Tự động chạy lại sau khi bấm
            });
        });

        // FIX 3: Khởi động an toàn, không dùng goToSlide(1) để tránh kẹt trang load đầu
        slider.style.transition = 'none';
        slider.style.transform = `translateX(-100%)`; // Đặt thẳng vào slide 1
        
        dots.forEach((dot, idx) => {
            const progressBar = dot.querySelector('.progress-bar');
            if (idx === 0) {
                dot.className = "dot-btn relative h-2 w-8 rounded-full overflow-hidden transition-all duration-300 bg-white/30";
                
                // --- ĐOẠN ĐƯỢC SỬA: Đưa về 0% rồi mới cho chạy lên 100% ---
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
                
                setTimeout(() => {
                    progressBar.style.transition = `width ${slideDuration}ms linear`;
                    progressBar.style.width = '100%';
                }, 50); // Đợi 50ms để trình duyệt kịp kích hoạt hiệu ứng
                // -----------------------------------------------------------
            }
        });

        startAutoPlay();
    } // <-- Dấu đóng ngoặc của hàm initBannerSlider
    

    async function checkAndShowPopup() {
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
            let imageSuffix = window.innerWidth < 768 ? 'm' : 'd';
            const imgPath = `img/holidays/${activeHoliday.imagePrefix}${imageSuffix}.jpg`;

            // --- KIỂM TRA ẢNH TỒN TẠI HAY LỖI (TÍNH NĂNG MỚI) ---
            const isImageOk = await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);  // Ảnh tốt
                img.onerror = () => resolve(false); // Ảnh lỗi hoặc chưa up
                img.src = imgPath;
            });

            // Nếu ảnh OK -> Hiện ảnh
            // Nếu ảnh LỖI -> Ẩn ảnh đi (chỉ hiện chữ chúc mừng ở trên)
            if (isImageOk) {
                holidayImage.src = imgPath;
                holidayImage.style.display = 'block';
            } else {
                holidayImage.style.display = 'none'; 
            }
            
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
                            <h3 class="truncate-2-lines text-xl font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">${post.title}</h3>
                            <p class="truncate-3-lines text-gray-600 text-sm">${post.summary}</p>
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
                        <h3 class="truncate-2-lines font-bold text-gray-800 group-hover:text-yellow-600">${post.title}</h3>
                        <p class="truncate-3-lines text-gray-600 text-sm mt-1">${post.summary}</p>

                        <div class=" text-xs text-gray-500 mt-2 flex items-center">
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
                        <h3 class="truncate-2-lines font-bold text-gray-800 group-hover:text-yellow-600">${video.title}</h3>
                        <p class="truncate-3-lines text-gray-600 text-sm mt-1">${video.summary}</p>
                        
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

        // =================================================================
        // ĐƯA NÚT BÍ MẬT VÀO ĐÂY (CHỜ HEADER TẢI XONG MỚI GẮN SỰ KIỆN)
        // =================================================================
        const siteLogo = document.getElementById('site-logo');
        const siteLogoImg = document.getElementById('site-logo-img');
        let logoClickTimer; 

        if (siteLogo) {
            // --- XỬ LÝ CLICK ĐƠN (Về trang chủ) ---
            siteLogo.addEventListener('click', (e) => {
                e.preventDefault(); 
                
                logoClickTimer = setTimeout(() => {
                    window.location.href = '/'; 
                }, 300);
            });

            // --- XỬ LÝ CLICK ĐÚP (Xóa Cache) ---
            siteLogo.addEventListener('dblclick', async (e) => {
                e.preventDefault(); 
                clearTimeout(logoClickTimer); 

                if (confirm("Bạn có muốn xóa bộ nhớ đệm và tải bản cập nhật mới nhất không?")) {
                    try {
                        if (siteLogoImg) siteLogoImg.classList.add('animate-spin'); 

                        if ('serviceWorker' in navigator) {
                            const registrations = await navigator.serviceWorker.getRegistrations();
                            for (let registration of registrations) {
                                await registration.unregister();
                            }
                        }

                        if ('caches' in window) {
                            const cacheNames = await caches.keys();
                            await Promise.all(cacheNames.map(name => caches.delete(name)));
                        }

                        localStorage.clear();
                        sessionStorage.clear();

                        setTimeout(() => {
                            window.location.reload(true);
                        }, 2000); 

                    } catch (error) {
                        console.error("Lỗi khi xóa cache:", error);
                        alert("Có lỗi xảy ra khi xóa cache.");
                        if (siteLogoImg) siteLogoImg.classList.remove('animate-spin'); 
                    }
                }
            });
        }
    }); // <-- Kết thúc hàm loadHTML Header

    
    // 2. Tải Footer
    loadHTML('/hf/footer.html', 'footer-placeholder');

	
	
    // 3. Tải nội dung động (CẬP NHẬT)
    // Chờ tải banner và kiểm tra ảnh lỗi xong thì mới khởi chạy hiệu ứng trượt
    loadBanner().then(() => {
        initBannerSlider();
    });

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

    

    /* =================================================================
   HIỆU ỨNG MÙA LỄ HỘI ĐA NĂNG V8 (ALL-IN-ONE)
   - Tích hợp cả Ảnh SVG (sắc nét) và Emoji (nhẹ).
   - Chế độ 'mix': Rơi trộn lẫn cả ảnh và emoji.
   - Tự động theo lịch (Noel/Tết) + Tùy chỉnh chế độ dễ dàng.
================================================================= */
(function() {
    // ============================================================
    // 1. TRUNG TÂM ĐIỀU KHIỂN (SỬA Ở ĐÂY)
    // ============================================================
    const CONFIG = {
        // CHẾ ĐỘ HIỂN THỊ: chọn 'image', 'text', 'mix', hoặc 'off'
        mode: 'mix', 
        
        // CẤU HÌNH RƠI
        count: 20,       // Số lượng hạt
        minSpeed: 10,    // Tốc độ nhanh nhất (giây)
        maxSpeed: 18,    // Tốc độ chậm nhất (giây)
        
        // KÍCH THƯỚC (Pixel)
        sizeImage: { min: 10, max: 20 }, // Kích thước cho Ảnh
        sizeText:  { min: 16, max: 28 }  // Kích thước cho Emoji
    };

    // ============================================================
    // 2. KHO TÀI NGUYÊN
    // ============================================================
    // --- A. KHO ẢNH SVG (Base64) ---
    const IMG_SOURCE = {
        tet: [
            // Hoa Đào (Hồng đậm)
            "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg transform='translate(50,50)'%3E%3Cg%3E%3Cpath fill='%23FF69B4' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10'/%3E%3Cpath fill='%23FF69B4' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10' transform='rotate(72)'/%3E%3Cpath fill='%23FF69B4' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10' transform='rotate(144)'/%3E%3Cpath fill='%23FF69B4' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10' transform='rotate(216)'/%3E%3Cpath fill='%23FF69B4' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10' transform='rotate(288)'/%3E%3C/g%3E%3Ccircle r='8' fill='%23FFD700'/%3E%3C/g%3E%3C/svg%3E",
            // Hoa Mai (Vàng cam)
            "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg transform='translate(50,50)'%3E%3Cg%3E%3Cpath fill='%23FFA500' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10'/%3E%3Cpath fill='%23FFA500' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10' transform='rotate(72)'/%3E%3Cpath fill='%23FFA500' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10' transform='rotate(144)'/%3E%3Cpath fill='%23FFA500' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10' transform='rotate(216)'/%3E%3Cpath fill='%23FFA500' d='M0,-10 C-10,-25 -10,-45 0,-45 C10,-45 10,-25 0,-10' transform='rotate(288)'/%3E%3C/g%3E%3Ccircle r='8' fill='%23FF4500'/%3E%3C/g%3E%3C/svg%3E"
        ],
        noel: [
            // Bông Tuyết
            "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23E0F7FA' stroke-width='8' stroke-linecap='round'%3E%3Cpath d='M50 10 V90 M10 50 H90 M22 22 L78 78 M78 22 L22 78'/%3E%3C/g%3E%3C/svg%3E"
        ]
    };

    // --- B. KHO EMOJI (Text) ---
    const TXT_SOURCE = {
        tet: ['🌸', ],  //'🌼', '🌺', '🏵️', '🧧'
        noel: ['❄️',]   //  '❅', '❆', '🎄'
    };

    // ============================================================
    // 3. LOGIC XỬ LÝ (TỰ ĐỘNG CHỌN NGUỒN)
    // ============================================================
    function getResources() {
        if (CONFIG.mode === 'off') return null;

        const now = new Date();
        const d = now.getDate();
        const m = now.getMonth() + 1;
        const y = now.getFullYear();
        
        let season = null; // 'tet' hoặc 'noel'

        // Check Noel (22/12 - 28/12 Dương)
        if (m === 12 && d >= 22 && d <= 28) season = 'noel';
        
        // Check Tết (Ưu tiên Lịch Âm)
        if (!season && typeof getLunarDate === 'function') {
            const lunar = getLunarDate(d, m, y);
            if (lunar.month === 12 || lunar.month === 1) season = 'tet';
        }
        // Check Tết (Dự phòng Lịch Dương nếu trang con lỗi)
        if (!season && (m === 1 || m === 2)) season = 'tet';

        if (!season) return null; // Không phải mùa lễ

        // Lấy dữ liệu dựa trên Mode
        let items = [];
        // Nếu mode là image hoặc mix -> Lấy ảnh
        if (CONFIG.mode === 'image' || CONFIG.mode === 'mix') {
            IMG_SOURCE[season].forEach(src => items.push({ type: 'img', val: src }));
        }
        // Nếu mode là text hoặc mix -> Lấy emoji
        if (CONFIG.mode === 'text' || CONFIG.mode === 'mix') {
            TXT_SOURCE[season].forEach(txt => items.push({ type: 'txt', val: txt }));
        }

        return items.length > 0 ? items : null;
    }

    // ============================================================
    // 4. KHỞI TẠO VÀ CHẠY
    // ============================================================
    const resources = getResources();
    if (!resources || window.innerWidth < 280) return;

    // Tạo container
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: '99999', overflow: 'hidden'
    });
    document.body.appendChild(container);

    class Particle {
        constructor() {
            // Chọn ngẫu nhiên 1 tài nguyên (có thể là ảnh hoặc text)
            const item = resources[Math.floor(Math.random() * resources.length)];
            
            if (item.type === 'img') {
                this.el = document.createElement('img');
                this.el.src = item.val;
                this.isText = false;
                this.el.style.filter = 'drop-shadow(2px 3px 2px rgba(0,0,0,0.2))'; // Bóng ảnh
            } else {
                this.el = document.createElement('div');
                this.el.textContent = item.val;
                this.isText = true;
                this.el.style.textAlign = 'center';
                this.el.style.textShadow = '1px 2px 3px rgba(0,0,0,0.2)'; // Bóng chữ
            }

            this.el.style.position = 'absolute';
            this.el.style.userSelect = 'none';
            container.appendChild(this.el);
            this.reset(true);
        }

        reset(isInitial = false) {
            const w = window.innerWidth;
            const h = window.innerHeight;

            // Xử lý kích thước tùy loại
            let size;
            if (this.isText) {
                size = Math.random() * (CONFIG.sizeText.max - CONFIG.sizeText.min) + CONFIG.sizeText.min;
                this.el.style.fontSize = size + 'px';
                this.el.style.lineHeight = size + 'px'; // Căn giữa dòng cho emoji
            } else {
                size = Math.random() * (CONFIG.sizeImage.max - CONFIG.sizeImage.min) + CONFIG.sizeImage.min;
            }
            this.el.style.width = size + 'px';
            this.el.style.height = size + 'px';

            this.x = Math.random() * w;
            this.y = isInitial ? Math.random() * h : -size;

            const duration = Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed;
            this.speed = h / (duration * 60);

            this.sway = Math.random() * 100;
            this.swayStep = Math.random() * 0.02 + 0.01;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * (this.isText ? 1.5 : 1); // Emoji xoay nhanh hơn xíu
            
            this.el.style.opacity = Math.random() * 0.4 + 0.6;
        }

        update() {
            this.y += this.speed;
            this.sway += this.swayStep;
            this.rotation += this.rotationSpeed;
            const swayOffset = Math.sin(this.sway) * (this.isText ? 30 : 20); // Emoji lắc mạnh hơn xíu
            this.el.style.transform = `translate3d(${this.x + swayOffset}px, ${this.y}px, 0) rotate(${this.rotation}deg)`;

            if (this.y > window.innerHeight) this.reset(false);
        }
    }

    const particles = [];
    for(let i=0; i<CONFIG.count; i++) particles.push(new Particle());
    function animate() {
        particles.forEach(p => p.update());
        requestAnimationFrame(animate);
    }
    animate();
})();

}); // <-- Dòng này là dòng cuối cùng của file