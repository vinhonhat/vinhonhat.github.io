// page-logic-custom.js (ĐÃ SỬA LỖI CRASH)
// Phiên bản dành cho các trang "trống bài chính" VÀ các trang bài viết chi tiết.

function initializeFlexiblePage(allContent) {
    console.log('[LOGIC-CUSTOM] Khởi tạo trang linh hoạt.');

    const el = {
        body: document.body,
        main: document.getElementById("main-content-container"),
        suggestions: document.getElementById("suggested-posts-container"),
        pagination: document.getElementById("pagination-container"),
        title: document.getElementById("page-title"),
        desc: document.getElementById("page-description"),
    };

    const cfg = {
        category: el.body.dataset.category || "",
        title: el.body.dataset.title || "Danh mục bài viết",
        desc: el.body.dataset.description || "",
    };

    // === SỬA LỖI 1, 2, 3 ===
    // Chỉ chạy nếu tìm thấy các ID này
    if (el.title) {
        el.title.textContent = cfg.title;
    }
    if (el.desc) {
        el.desc.textContent = cfg.desc;
    }
    if (el.main) {
        el.main.innerHTML = `
    		<div class="bg-white p-8 rounded-lg shadow text-center text-gray-600">
    			<p class="mb-4">Hiện chưa có bài viết nào trong mục này.</p>
    		</div>
    	`;
    }
    // === KẾT THÚC SỬA LỖI 1, 2, 3 ===


    // ============= 2️⃣ HIỂN THỊ BÀI VIẾT GỢI Ý =============
    // Hàm này bây giờ sẽ luôn luôn chạy được
    function renderSuggestions() {
        // (Toàn bộ code của hàm renderSuggestions giữ nguyên, không thay đổi)
        
        el.suggestions.innerHTML = "";

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        let recent = allContent.filter(p => {
            if (!p.date) return false;
            const d = new Date(p.date);
            return d >= sixMonthsAgo;
        });

        if (recent.length === 0 && allContent.length > 0) {
            recent = [...allContent];
        }

        const shuffled = recent.sort(() => 0.5 - Math.random());
        const max = window.innerWidth < 640 ? 4 : 6;
        const show = shuffled.slice(0, max);

        show.forEach(post => {
            let img = post.imageUrl || "https://placehold.co/80x80/ccc/fff?text=IMG";
            if (!img.startsWith("http") && !img.startsWith("/")) img = "/" + img;
            let link = post.link || "#";
            if (!link.startsWith("http") && !link.startsWith("/"))
                link = "/" + link;

            el.suggestions.innerHTML += `
                <a href="${link}" 
                    class="hidden sm:flex items-center p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200 group mb-4">
                    <img src="${img}" alt="${post.title}" class="w-16 h-16 object-cover rounded-md flex-shrink-0">
                    <div class="ml-4">
                        <h4 class="font-semibold text-gray-800 group-hover:text-yellow-700">${post.title}</h4>
                        <div class="text-xs text-gray-500 mt-1 flex items-center">
                            <i class="far fa-calendar-alt mr-1"></i>
                            <span>${post.date || ""}</span>
                        </div>
                    </div>
                </a>

                <a href="${link}" 
                    class="block sm:hidden p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200 group mb-4 text-center">
                    <img src="${img}" alt="${post.title}" class="w-16 h-16 object-cover rounded-md mx-auto mb-2">
                    <h4 class="font-semibold text-gray-800 group-hover:text-yellow-700 truncate-2-lines">${post.title}</h4>
                    <div class="text-xs text-gray-500 mt-1 flex justify-center items-center">
                        <i class="far fa-calendar-alt mr-1"></i><span>${post.date || ""}</span>
                    </div>
                </a>`;
        });
    }

    renderSuggestions();

    // ============= 3️⃣ FORM THÊM BÀI VIẾT =============
    
    // === SỬA LỖI 4 ===
    // Toàn bộ logic form chỉ chạy NẾU tìm thấy nút 'toggle-add-form'
    const toggleBtn = document.getElementById("toggle-add-form");
    if (toggleBtn) {
        const form = document.getElementById("add-form");
        const addBtn = document.getElementById("add-post-btn");
        const list = document.getElementById("manual-posts");

        toggleBtn.addEventListener("click", () => {
            form.classList.toggle("hidden");
        });

        addBtn.addEventListener("click", () => {
            const title = document.getElementById("post-title").value.trim();
            const image = document.getElementById("post-image").value.trim() || "https://placehold.co/400x250/ccc/fff?text=Ảnh";
            const link = document.getElementById("post-link").value.trim() || "#";
            const summary = document.getElementById("post-summary").value.trim() || "Không có mô tả.";

            if (!title) {
                alert("Vui lòng nhập tiêu đề bài viết!");
                return;
            }

            const html = `
                <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                    <a href="${link}" target="_blank">
                        <img src="${image}" alt="${title}" class="w-full h-48 object-cover">
                    </a>
                    <div class="p-4">
                        <h3 class="font-bold text-lg mb-1 text-gray-800">${title}</h3>
                        <p class="text-gray-600 text-sm mb-3">${summary}</p>
                        <a href="${link}" target="_blank" class="text-yellow-600 hover:underline">Xem chi tiết →</a>
                    </div>
                </div>
            `;
            list.insertAdjacentHTML("afterbegin", html);

            form.reset();
            form.classList.add("hidden");
        });
    }
    // === KẾT THÚC SỬA LỖI 4 ===
}

// ============= 4️⃣ TẢI DỮ LIỆU TỪ JSON =============
// (Phần này đã đúng, giữ nguyên)
document.addEventListener('DOMContentLoaded', () => {
    fetch('/data/posts.json')
        .then(response => {
            if (!response.ok) throw new Error("Không thể tải /data/posts.json");
            return response.json();
        })
        .then(allContent => {
            // Dữ liệu đã sẵn sàng, gọi hàm khởi tạo chính
            initializeFlexiblePage(allContent);
        })
        .catch(error => {
            console.error('[LỖI] Không thể tải dữ liệu JSON cho page-logic-custom:', error);
            // Bạn có thể thêm 1 thông báo lỗi vào phần gợi ý nếu muốn
            const suggestionsContainer = document.getElementById('suggested-posts-container');
            if (suggestionsContainer) suggestionsContainer.innerHTML = "<p>Lỗi tải gợi ý.</p>";
        });
});