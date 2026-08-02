// Gợi ý cho trang bài viết chi tiết - V26.7.28.3
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
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220"><rect width="100%" height="100%" fill="#eceff1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8a929b" font-family="Arial" font-size="20">Vinh ở Nhật</text></svg>'
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

    const parseDate = value => {
        const match = String(value || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
        const parsed = Date.parse(value || '');
        return Number.isNaN(parsed) ? 0 : parsed;
    };

    const formatDate = value => {
        const stamp = parseDate(value);
        if (!stamp) return '';
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(stamp));
    };

    const template = post => {
        const image = ensurePath(post.imageUrl, DEFAULT_IMAGE);
        const link = ensurePath(post.link);
        return `<a class="compact-post" href="${escapeHtml(link)}">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(post.title || 'Ảnh bài viết')}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">
            <span><strong>${escapeHtml(post.title || '')}</strong><small>${escapeHtml(formatDate(post.date))}</small></span>
        </a>`;
    };

    document.addEventListener('DOMContentLoaded', async () => {
        const container = document.getElementById('suggested-posts-container');
        if (!container) return;
        try {
            const response = await fetch(DATA_URL, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Không thể tải dữ liệu (${response.status})`);
            const currentPath = decodeURI(location.pathname).replace(/\/+$/, '');
            const posts = (await response.json())
                .filter(post => post && post.status !== 0 && canShowPostInCurrentList(post) && post.type !== 'video' && post.title && post.link)
                .filter(post => {
                    try {
                        return decodeURI(new URL(ensurePath(post.link), location.origin).pathname).replace(/\/+$/, '') !== currentPath;
                    } catch (_) {
                        return true;
                    }
                })
                .sort((a, b) => parseDate(b.date) - parseDate(a.date))
                .slice(0, 5);
            container.innerHTML = posts.map(template).join('') || '<p class="search-empty">Chưa có bài gợi ý.</p>';
        } catch (error) {
            console.error(error);
            container.innerHTML = '<p class="search-empty">Không thể tải bài gợi ý.</p>';
        }
    });
})();
