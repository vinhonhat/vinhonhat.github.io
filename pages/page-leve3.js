// page-logic-custom.js
// Phiên bản dành cho các trang "trống bài chính" nhưng vẫn hoạt động bình thường
// + Có chức năng thêm bài viết thủ công bằng form nhập liệu

function initializeFlexiblePage(allContent) {
    console.log('[LOGIC-CUSTOM] Khởi tạo trang linh hoạt (phiên bản trống bài chính).');

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

    el.title.textContent = cfg.title;
    el.desc.textContent = cfg.desc;

    // ============= 1️⃣ ẨN PHẦN BÀI VIẾT CHÍNH =============
	el.main.innerHTML = `
		<div class="bg-white p-8 rounded-lg shadow text-center text-gray-600">
			<p class="mb-4">Hiện chưa có bài viết nào trong mục này.</p>
			
		</div>
	`;
	// đây phần nhấn để quản lý của trang admin.html
	//<a href="/admin.html" class="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md">Quản lý bài viết (Admin)</a>
    /* phần này là phần ng dùng thêm bài viết bằng from nhập liệu nên bị ẩn
	el.main.innerHTML = `
        <div id="manual-add-section" class="bg-white p-6 rounded-lg shadow text-center text-gray-600">
            <p class="mb-4">Hiện chưa có bài viết nào trong mục này.</p>
            <button id="toggle-add-form" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md">
                ➕ Thêm bài viết mới
            </button>
            <form id="add-form" class="hidden mt-6 text-left space-y-3">
                <input id="post-title" type="text" placeholder="Tiêu đề bài viết" class="w-full p-2 border rounded" />
                <input id="post-image" type="text" placeholder="Link ảnh (có thể để trống)" class="w-full p-2 border rounded" />
                <input id="post-link" type="text" placeholder="Đường dẫn bài viết hoặc URL" class="w-full p-2 border rounded" />
                <textarea id="post-summary" placeholder="Mô tả ngắn gọn" class="w-full p-2 border rounded"></textarea>
                <button type="button" id="add-post-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">Thêm bài viết</button>
            </form>
            <div id="manual-posts" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"></div>
        </div>
    `;*/

    // ============= 2️⃣ HIỂN THỊ BÀI VIẾT GỢI Ý =============
    function renderSuggestions() {
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
            if (!img.startsWith("http")) img = "/" + img;
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
    const toggleBtn = document.getElementById("toggle-add-form");
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

// ============= 4️⃣ CHỜ DỮ LIỆU TỪ content.js =============
function waitForDataFlexible() {
    let tries = 0, maxTries = 100;
    const timer = setInterval(() => {
        if (typeof allContent !== "undefined" && allContent.length > 0) {
            clearInterval(timer);
            initializeFlexiblePage();
        }
        tries++;
        if (tries > maxTries) {
            clearInterval(timer);
            console.error("[LỖI] Không thể tải dữ liệu allContent sau 5 giây.");
            document.getElementById("main-content-container").innerHTML = "<p>Lỗi tải dữ liệu.</p>";
        }
    }, 50);
}

waitForDataFlexible();
