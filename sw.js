// --- BIẾN CẤU HÌNH ---
// Tên của bộ nhớ cache. Rất quan trọng: MỖI KHI BẠN CẬP NHẬT WEBSITE,
// BẠN PHẢI THAY ĐỔI TÊN NÀY 
// GHI CHÚ 1: THAY ĐỔI TÊN CACHE MỖI KHI BẠN CẬP NHẬT WEBSITE (VÍ DỤ: TỪ v2 thành v3) ĐỂ KÍCH HOẠT CẬP NHẬT.
const CACHE_NAME = 'vinh-o-nhat-cache-v25.11.21 beta1'; 

// GHI CHÚ 2: DANH SÁCH FILE CẦN LƯU
// Danh sách các file cốt lõi cần được lưu vào cache để chạy offline.
const urlsToCache = [
    // 1. CÁC FILE CỦA WEBSITE
    '/',
    '/index.html',
    '/css/style.css',
    '/js/script.js',
    '/manifest.json',
    '/pages/rakuten.html',
    
    // 2. CÁC FILE DỮ LIỆU/NỘI DUNG PHỤ TRỢ
    // 🟢 THÊM FILE DỮ LIỆU MỚI
    '/data/posts.json',      
    
    // 🔴 XÓA /js/content.js (Không dùng nữa)

    // Các file khác (Giữ nguyên)
    '/js/proverbs.js',       
    '/js/lunar-calendar.js', 
    '/js/holidays.js',       
    '/data/banner.js',       
    '/hf/header.html',       
    '/hf/footer.html',       

    // 3. HÌNH ẢNH ICON
    '/img/122.png',          // Icon 192x192
    '/img/qvn.png',          // Icon 512x512 maskable
    '/img/logoQV.png',       // Favicon
    '/img/logo.png',         // Logo
    
    // 4. CÁC THƯ VIỆN BÊN NGOÀI (CDN - BẮT BUỘC ĐỂ OFFLINE)
    'https://cdn.tailwindcss.com', 
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', 
    'https://fonts.googleapis.com', 
    'https://fonts.gstatic.com', 
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' 
];


// GHI CHÚ 3: CÀI ĐẶT VÀ KÍCH HOẠT NGAY
// --- SỰ KIỆN 1: CÀI ĐẶT (install) ---
// Sự kiện này chỉ chạy một lần khi Service Worker được cài đặt lần đầu hoặc khi có phiên bản mới.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Đã mở cache');
        // Tải tất cả các file trong danh sách và lưu vào cache.
        return cache.addAll(urlsToCache);
      })
      // Yêu cầu Service Worker mới bỏ qua trạng thái chờ và kích hoạt ngay.
      .then(() => self.skipWaiting()) 
  );
});




// --- SỰ KIỆN 2: KÍCH HOẠT (activate) ---
// Sự kiện này chạy sau khi Service Worker đã cài đặt xong và sẵn sàng przejąć kontrolę.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        // Lặp qua tất cả các cache đang có.
        cacheNames.map(cacheName => {
          // Nếu tên cache không phải là tên cache mới nhất (CACHE_NAME), thì xóa nó đi.
          if (cacheName !== CACHE_NAME) {
            console.log('Đang xóa cache cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      // Yêu cầu Service Worker przejąć kontrolę tất cả các tab đang mở.
    }).then(() => self.clients.claim()) 
  );
});


// GHI CHÚ 5: LẤY FILE TỪ CACHE (GIỮ NGUYÊN)
// --- SỰ KIỆN 3: LẤY DỮ LIỆU (fetch) ---
// Sự kiện này chạy mỗi khi trang web yêu cầu một tài nguyên (ảnh, css, js...).
self.addEventListener('fetch', event => {
  event.respondWith(
    // Kiểm tra xem tài nguyên này có trong cache không.
    caches.match(event.request)
      .then(response => {
        // Nếu có, trả về từ cache (rất nhanh). Nếu không, tải từ mạng.
        return response || fetch(event.request);
      })
  );

});
