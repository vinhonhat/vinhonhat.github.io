// Danh sách bài viết theo giao diện tin tức - V26.7.28.3
(() => {
    'use strict';

    const DATA_URL = '/data/posts-index.json?v=26.8.1-beta5';

    const canShowPostInCurrentList = post => {
        if (!post || post.showInLists === false) return false;
        const mobile = window.matchMedia('(max-width: 700px)').matches;
        if (mobile && post.showOnMobile === false) return false;
        if (!mobile && post.showOnDesktop === false) return false;
        return true;
    };

    const DEFAULT_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="#eceff1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8a929b" font-family="Arial" font-size="28">Vinh ở Nhật</text></svg>'
    );

    const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);

    const ensurePath = (value, fallback = '#') => {
        const path = String(value || '').trim();
        if (!path) return fallback;
        if (/^(https?:|data:|blob:|\/)/i.test(path)) return path;
        return '/' + path.replace(/^\.\//, '');
    };

    const formatDate = value => {
        const date = new Date(value);
        if (!value || Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: 'long', year: 'numeric'
        }).format(date);
    };

    const formatDateShort = value => {
        const date = new Date(value);
        if (!value || Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        }).format(date);
    };

    const imageMarkup = post => {
        const image = ensurePath(post.imageUrl, DEFAULT_IMAGE);
        const title = escapeHtml(post.title || 'Ảnh bài viết');
        return `<img src="${escapeHtml(image)}" alt="${title}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">`;
    };

    const matchesCategories = (post, categories) => {
        if (categories.includes('all')) return true;
        const postCategories = Array.isArray(post.category) ? post.category : [];
        return categories.some(category => postCategories.includes(category));
    };

    const cardTemplate = post => {
        const link = ensurePath(post.link);
        const category = (post.category || [post.type || 'Bài viết'])[0] || 'Bài viết';
        return `
            <article class="section-feed-item">
                <a class="section-feed-image" href="${escapeHtml(link)}">${imageMarkup(post)}</a>
                <div class="section-feed-copy">
                    <div class="section-card-label">${escapeHtml(category)}</div>
                    <h2><a href="${escapeHtml(link)}">${escapeHtml(post.title)}</a></h2>
                    <p>${escapeHtml(post.summary || '')}</p>
                    <div class="section-card-footer">
                        <div class="news-meta"><span>${escapeHtml(formatDate(post.date))}</span></div>
                        <div class="section-card-actions">
                            <a href="${escapeHtml(link)}" class="read-more-link">Đọc bài <span aria-hidden="true">→</span></a>
                            <button class="share-button share-button-small" type="button"
                                    data-share-url="${escapeHtml(link)}"
                                    data-share-title="${escapeHtml(post.title)}"
                                    aria-label="Chia sẻ bài ${escapeHtml(post.title)}">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"></path></svg>
                                <span>Chia sẻ</span>
                            </button>
                        </div>
                    </div>
                </div>
            </article>`;
    };

    const compactTemplate = post => `
        <a class="compact-post" href="${escapeHtml(ensurePath(post.link))}">
            ${imageMarkup(post)}
            <span><strong>${escapeHtml(post.title)}</strong><small>${escapeHtml(formatDateShort(post.date))}</small></span>
        </a>`;

    document.addEventListener('DOMContentLoaded', async () => {
        const body = document.body;
        const main = document.getElementById('main-content-container');
        const pagination = document.getElementById('pagination-container');
        const suggestions = document.getElementById('suggested-posts-container');
        const title = document.getElementById('page-title');
        const description = document.getElementById('page-description');
        if (!main) return;

        const categories = String(body.dataset.category || 'all')
            .split(',').map(value => value.trim()).filter(Boolean);
        const perPage = Math.max(1, Number(body.dataset.perpage) || 8);
        let currentPage = 1;

        if (title && body.dataset.title) title.textContent = body.dataset.title;
        if (description && body.dataset.description) description.textContent = body.dataset.description;

        try {
            const response = await fetch(DATA_URL, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Không thể tải dữ liệu (${response.status})`);
            const allPosts = await response.json();
            const parseDate = value => {
                const match = String(value || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
                if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
                const parsed = Date.parse(value || '');
                return Number.isNaN(parsed) ? 0 : parsed;
            };
            const activePosts = allPosts
                .filter(post => post && post.status !== 0 && canShowPostInCurrentList(post) && post.type !== 'video' && post.title && post.link)
                .sort((a, b) => parseDate(b.date) - parseDate(a.date));
            const posts = activePosts.filter(post => matchesCategories(post, categories));

            const renderPagination = () => {
                if (!pagination) return;
                pagination.innerHTML = '';
                const totalPages = Math.ceil(posts.length / perPage);
                if (totalPages <= 1) return;

                const addButton = (label, page, disabled = false, active = false) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = `pagination-btn${active ? ' active' : ''}`;
                    button.innerHTML = label;
                    button.disabled = disabled;
                    button.addEventListener('click', () => {
                        currentPage = page;
                        renderPosts();
                        document.querySelector('.section-page-hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                    pagination.appendChild(button);
                };

                addButton('‹', currentPage - 1, currentPage === 1);
                for (let page = 1; page <= totalPages; page += 1) {
                    if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                        if (page === 2 || page === totalPages - 1) {
                            const dots = document.createElement('span');
                            dots.className = 'pagination-dots';
                            dots.textContent = '…';
                            pagination.appendChild(dots);
                        }
                        continue;
                    }
                    addButton(String(page), page, false, page === currentPage);
                }
                addButton('›', currentPage + 1, currentPage === totalPages);
            };

            const renderPosts = () => {
                if (!posts.length) {
                    main.innerHTML = '<div class="section-empty"><strong>Chưa có bài viết</strong><p>Nội dung trong mục này đang được cập nhật.</p></div>';
                    if (pagination) pagination.innerHTML = '';
                    return;
                }
                const start = (currentPage - 1) * perPage;
                main.innerHTML = posts.slice(start, start + perPage).map(cardTemplate).join('');
                renderPagination();
            };

            renderPosts();

            if (suggestions) {
                const selectedLinks = new Set(posts.slice(0, perPage).map(post => post.link));
                let suggested = activePosts.filter(post => !selectedLinks.has(post.link)).slice(0, 5);
                if (!suggested.length) suggested = activePosts.slice(0, 5);
                suggestions.innerHTML = suggested.map(compactTemplate).join('');
            }
        } catch (error) {
            console.error(error);
            main.innerHTML = '<div class="section-empty"><strong>Không thể tải bài viết</strong><p>Vui lòng kiểm tra kết nối rồi tải lại trang.</p></div>';
        }
    });
})();
