(() => {
    'use strict';

    const VERSION = window.VinhSiteVersion?.id || 'dev';
    const POSTS_INDEX_URL = `/data/posts-index.json?v=${VERSION}`;
    const SITE_CONFIG_URL = `/data/site-config.json?v=${VERSION}`;
    const BANNER_CONFIG_URL = `/data/banner-config.json?v=${VERSION}`;

    const DEFAULT_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff4e4"/><stop offset="1" stop-color="#e8f2ff"/></linearGradient></defs><rect width="900" height="560" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#737b84" font-family="Arial" font-size="38">Vinh ở Nhật</text></svg>'
    );

    const DEFAULT_HOME_CONFIG = {
        sections: { banner: true, featured: true, topics: true, latestFeed: true, sidebar: true },
        banner: { mode: 'mixed', aspectRatio: '3 / 1', autoplay: true, intervalMs: 5500, showArrows: true, showDots: true, holidaySlideEnabled: true, holidayBeforeDays: 45, holidayAfterDays: 10, holidayPosition: 'after-ads', pauseOnHover: true },
        feed: { source: 'new', initialCount: 6, batchSize: 4, maxItems: 20, autoLoad: true, showShare: true },
        holiday: { popupEnabled: true, popupBeforeDays: 0, popupAfterDays: 0, fireworksEnabled: true, showOncePerDay: true, popupDurationMs: 7500 },
        social: { facebook: 'https://fb.com/tqv2022', messenger: 'https://m.me/tqv2022', zalo: '', tiktok: 'https://www.tiktok.com/@tqv2020', email: '' },
        footer: { text: 'Chia sẻ hướng dẫn thực tế, dễ hiểu dành cho người Việt đang sinh sống tại Nhật Bản.', contactLabel: '', showQuickLinks: true },
        mobileNav: { enabled: true, showLabels: false, labels: { home: 'Trang chủ', latest: 'Mới nhất', search: 'Tìm kiếm', menu: 'Menu' }, icons: { home: '', latest: '', search: '', menu: '' } },
        mobileMenu: { showIntro: true, eyebrow: '', title: 'Vinh ở Nhật', text: 'Tin tức, hướng dẫn và tiện ích tại Nhật.', icons: { posts: 'B', study: '学', downloads: '↓', fun: '▶', rakuten: 'R', seven: '7', sim: 'S', life: '日' } },
        mobileHome: { hideTopics: false, guideTitle: 'Gợi ý thêm' },
        lunar: { showMoon: true, showSolarDate: true, showLunarDate: true },
        banners: []
    };

    let postsPromise = null;
    let homeConfigPromise = null;
    let currentHomeConfig = DEFAULT_HOME_CONFIG;
    let activeHolidayToday = null;
    let activeHolidayBanner = null;
    let activeHolidayPopup = null;
    let bannerController = null;
    let headerReadyPromise = null;
    let globalEventsBound = false;
    let downloadMenuCloseTimer = 0;
    const lazyScriptPromises = new Map();
    const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function escapeHtml(value = '') {
        return String(value).replace(/[&<>'"]/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        })[char]);
    }

    function normalizeText(value = '') {
        return String(value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();
    }

    function ensurePath(value, fallback = '#') {
        const path = String(value || '').trim();
        if (!path) return fallback;
        if (/^(https?:|mailto:|tel:|data:|blob:|\/)/i.test(path)) return path;
        return '/' + path.replace(/^\.\//, '');
    }

    function clampNumber(value, min, max, fallback) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.min(max, Math.max(min, number));
    }

    function parsePostDate(value) {
        const raw = String(value || '').trim();
        const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
        const parsed = Date.parse(raw);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    function formatDate(value, compact = false) {
        const date = new Date(value);
        if (!value || Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('vi-VN', compact
            ? { day: '2-digit', month: '2-digit', year: 'numeric' }
            : { day: '2-digit', month: 'long', year: 'numeric' }
        ).format(date);
    }

    function isNewPost(post) {
        return post?.isNew === true || post?.new === true || post?.latest === true;
    }

    function activePosts(payload) {
        const posts = Array.isArray(payload) ? payload : (Array.isArray(payload?.posts) ? payload.posts : []);
        return posts
            .filter(post => post && post.status !== 0 && post.type !== 'video' && post.title && post.link)
            .map(post => ({ ...post, date: post.updatedAt || post.publishedAt || post.date || '' }))
            .sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
    }

    function isMobileViewport() {
        return window.matchMedia('(max-width: 700px)').matches;
    }

    function canShowPostInLists(post) {
        if (!post || post.showInLists === false) return false;
        if (isMobileViewport() && post.showOnMobile === false) return false;
        if (!isMobileViewport() && post.showOnDesktop === false) return false;
        return true;
    }

    function mergeHomeConfig(input) {
        const data = input && typeof input === 'object' ? input : {};
        return {
            ...DEFAULT_HOME_CONFIG,
            ...data,
            sections: { ...DEFAULT_HOME_CONFIG.sections, ...(data.sections || {}) },
            banner: { ...DEFAULT_HOME_CONFIG.banner, ...(data.banner || {}) },
            feed: { ...DEFAULT_HOME_CONFIG.feed, ...(data.feed || {}) },
            holiday: { ...DEFAULT_HOME_CONFIG.holiday, ...(data.holiday || {}) },
            social: { ...DEFAULT_HOME_CONFIG.social, ...(data.social || {}) },
            footer: { ...DEFAULT_HOME_CONFIG.footer, ...(data.footer || {}) },
            mobileNav: {
                ...DEFAULT_HOME_CONFIG.mobileNav,
                ...(data.mobileNav || {}),
                labels: { ...DEFAULT_HOME_CONFIG.mobileNav.labels, ...(data.mobileNav?.labels || {}) },
                icons: { ...DEFAULT_HOME_CONFIG.mobileNav.icons, ...(data.mobileNav?.icons || {}) }
            },
            mobileMenu: {
                ...DEFAULT_HOME_CONFIG.mobileMenu,
                ...(data.mobileMenu || {}),
                icons: { ...DEFAULT_HOME_CONFIG.mobileMenu.icons, ...(data.mobileMenu?.icons || {}) }
            },
            mobileHome: { ...DEFAULT_HOME_CONFIG.mobileHome, ...(data.mobileHome || {}) },
            lunar: { ...DEFAULT_HOME_CONFIG.lunar, ...(data.lunar || {}) },
            banners: Array.isArray(data.banners) ? data.banners : []
        };
    }

    async function getPosts() {
        if (!postsPromise) {
            postsPromise = fetch(POSTS_INDEX_URL, { cache: 'no-cache' })
                .then(response => {
                    if (!response.ok) throw new Error(`Không thể tải dữ liệu bài viết (${response.status})`);
                    return response.json();
                })
                .then(activePosts)
                .catch(error => {
                    postsPromise = null;
                    throw error;
                });
        }
        return postsPromise;
    }

    async function getHomeConfig() {
        if (!homeConfigPromise) {
            if (new URLSearchParams(location.search).get('homePreview') === '1') {
                try {
                    const preview = localStorage.getItem('vinh-home-admin-preview');
                    if (preview) {
                        homeConfigPromise = Promise.resolve(mergeHomeConfig(JSON.parse(preview)));
                        return homeConfigPromise;
                    }
                } catch (error) {
                    console.warn('Không thể đọc cấu hình xem trước:', error);
                }
            }
            homeConfigPromise = Promise.all([
                fetch(SITE_CONFIG_URL, { cache: 'no-cache' }).then(r => r.ok ? r.json() : Promise.reject(new Error(`site-config ${r.status}`))),
                fetch(BANNER_CONFIG_URL, { cache: 'no-cache' }).then(r => r.ok ? r.json() : Promise.reject(new Error(`banner-config ${r.status}`)))
            ]).then(([site, banner]) => mergeHomeConfig({
                ...site,
                banner: banner.settings || banner.banner || {},
                banners: banner.items || banner.banners || [],
                sections: { ...(site.sections || {}), banner: banner.enabled !== false }
            })).catch(error => {
                console.warn('Không thể tải site-config.json hoặc banner-config.json, dùng cấu hình mặc định:', error);
                return mergeHomeConfig(DEFAULT_HOME_CONFIG);
            });
        }
        return homeConfigPromise;
    }

    async function loadFragment(url, targetId) {
        const target = document.getElementById(targetId);
        if (!target) return false;
        try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`${response.status}`);
            target.innerHTML = await response.text();
            return true;
        } catch (error) {
            console.error(`Không thể tải ${url}:`, error);
            return false;
        }
    }

    function loadScriptOnce(url, readyCheck = null) {
        if (typeof readyCheck === 'function' && readyCheck()) return Promise.resolve(true);
        if (lazyScriptPromises.has(url)) return lazyScriptPromises.get(url);
        const promise = new Promise((resolve, reject) => {
            const existing = Array.from(document.scripts).find(node => node.getAttribute('src') === url);
            if (existing) {
                existing.addEventListener('load', () => resolve(true), { once: true });
                existing.addEventListener('error', reject, { once: true });
                if (typeof readyCheck === 'function' && readyCheck()) resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error(`Không thể tải ${url}`));
            document.head.appendChild(script);
        }).catch(error => {
            lazyScriptPromises.delete(url);
            throw error;
        });
        lazyScriptPromises.set(url, promise);
        return promise;
    }

    function imageMarkup(post, options = {}) {
        const eager = options.eager === true;
        const image = ensurePath(post.imageUrl, DEFAULT_IMAGE);
        const title = escapeHtml(post.title || 'Ảnh bài viết');
        return `<img src="${escapeHtml(image)}" alt="${title}" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">`;
    }

    /* ========================= CHIA SẺ ========================= */
    function showToast(message) {
        let toast = document.getElementById('site-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'site-toast';
            toast.className = 'share-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('visible');
        clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 2300);
    }

    async function copyText(value) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            return;
        }
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Không thể sao chép');
    }

    async function shareLink(title, rawUrl) {
        const url = new URL(rawUrl || location.href, location.href).href;
        const shareTitle = String(title || document.title || 'Vinh ở Nhật').trim();
        if (navigator.share) {
            try {
                await navigator.share({ title: shareTitle, text: shareTitle, url });
                return;
            } catch (error) {
                if (error?.name === 'AbortError') return;
            }
        }
        try {
            await copyText(url);
            showToast('Đã sao chép link bài viết');
        } catch (error) {
            window.prompt('Sao chép đường dẫn bài viết:', url);
        }
    }

    window.VinhShare = shareLink;

    function initArticleShare() {
        const content = document.getElementById('article-content');
        if (!content) return;
        document.body.classList.add('article-page');
        const article = content.closest('article');
        if (!article || article.querySelector('.article-share-bar')) return;
        const title = (document.getElementById('page-title')?.textContent || document.title || 'Vinh ở Nhật').trim();
        const bar = document.createElement('div');
        bar.className = 'article-share-bar';
        bar.innerHTML = `
            <span><strong>Thấy hữu ích?</strong><small>Gửi bài này cho bạn bè</small></span>
            <button class="share-button" type="button" data-share-url="${escapeHtml(location.href)}" data-share-title="${escapeHtml(title)}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"></path></svg>
                <span>Chia sẻ bài viết</span>
            </button>`;
        content.insertAdjacentElement('beforebegin', bar);
        content.querySelectorAll('img').forEach((image, index) => {
            if (index > 0 && !image.hasAttribute('loading')) image.loading = 'lazy';
            if (!image.hasAttribute('decoding')) image.decoding = 'async';
        });
    }

    /* ========================= HEADER, TÌM KIẾM ========================= */
    function setBodyLocked() {
        const hasOpenPanel = ['search-panel', 'mobile-menu-panel', 'holiday-popup']
            .some(id => {
                const node = document.getElementById(id);
                return node && !node.hidden;
            });
        document.body.classList.toggle('panel-open', hasOpenPanel);
    }

    function setHiddenPanel(panel, open) {
        if (!panel) return;
        panel.hidden = !open;
        requestAnimationFrame(() => panel.classList.toggle('open', open));
        setBodyLocked();
    }

    function detectActiveNav() {
        const path = location.pathname;
        let key = 'home';
        if (path.includes('/pages/pages-baiviet/')) key = 'posts';
        else if (path.includes('/pages/pages-hoctap/') || path.includes('/behoc/')) key = 'study';
        else if (path.includes('/pages/pages-app/')) key = 'downloads';
        else if (path.includes('/pages/pages-giaitri/')) key = 'fun';
        $$(`[data-nav="${key}"]`).forEach(node => node.classList.add('active'));
    }

    function lunarYearName(year) {
        const can = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
        const chi = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
        return `${can[year % 10]} ${chi[year % 12]}`;
    }

    function drawMoonPhase(canvas, lunarDay) {
        if (!canvas?.getContext) return;
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        const radius = size * 0.41;
        const cx = size / 2;
        const cy = size / 2;
        const phase = ((Number(lunarDay) || 1) - 1) / 29.53059;
        const theta = phase * Math.PI * 2;
        const sunX = Math.sin(theta);
        const sunZ = -Math.cos(theta);
        const image = ctx.createImageData(size, size);

        for (let py = 0; py < size; py += 1) {
            for (let px = 0; px < size; px += 1) {
                const x = (px + 0.5 - cx) / radius;
                const y = (py + 0.5 - cy) / radius;
                const r2 = x * x + y * y;
                const index = (py * size + px) * 4;
                if (r2 > 1) {
                    image.data[index + 3] = 0;
                    continue;
                }
                const z = Math.sqrt(Math.max(0, 1 - r2));
                const light = x * sunX + z * sunZ;
                const lit = light >= 0;
                const brightness = lit ? 0.9 + 0.1 * z : 0.72 + 0.18 * z;
                const rgb = lit ? [255, 206, 57] : [39, 45, 54];
                const distanceToEdge = (1 - Math.sqrt(r2)) * radius;
                const alpha = Math.max(0, Math.min(1, distanceToEdge + 0.35));
                image.data[index] = Math.round(rgb[0] * brightness);
                image.data[index + 1] = Math.round(rgb[1] * brightness);
                image.data[index + 2] = Math.round(rgb[2] * brightness);
                image.data[index + 3] = Math.round(255 * alpha);
            }
        }

        ctx.clearRect(0, 0, size, size);
        ctx.putImageData(image, 0, 0);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 201, 54, .78)';
        ctx.lineWidth = Math.max(1.2, size / 48);
        ctx.stroke();
        ctx.restore();
    }

    function ensureLunarCalendar() {
        if (typeof window.getLunarDate === 'function') return Promise.resolve(true);
        return new Promise(resolve => {
            const existing = document.querySelector('script[data-lunar-loader]');
            if (existing) {
                existing.addEventListener('load', () => resolve(typeof window.getLunarDate === 'function'), { once: true });
                existing.addEventListener('error', () => resolve(false), { once: true });
                return;
            }
            const script = document.createElement('script');
            script.src = `/js/lunar-calendar.js?v=${VERSION}`;
            script.defer = true;
            script.dataset.lunarLoader = 'true';
            script.onload = () => resolve(typeof window.getLunarDate === 'function');
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        });
    }

    function initClock() {
        const timeNode = document.getElementById('time');
        const dateNode = document.getElementById('date');
        const lunarNode = document.getElementById('lunar-date');
        const moonCanvas = document.getElementById('moon-phase-canvas');
        if (!timeNode || !dateNode) return;
        let lastLunarKey = '';

        const update = () => {
            const now = new Date();
            timeNode.textContent = new Intl.DateTimeFormat('vi-VN', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            }).format(now);
            dateNode.textContent = new Intl.DateTimeFormat('vi-VN', {
                weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
            }).format(now);

            if (lunarNode && typeof window.getLunarDate === 'function') {
                const lunar = window.getLunarDate(now.getDate(), now.getMonth() + 1, now.getFullYear());
                lunarNode.textContent = `${lunar.day}/${lunar.month} · ${lunarYearName(lunar.year)}${lunar.leap ? ' nhuận' : ''}`;
                const key = `${lunar.day}-${lunar.month}-${lunar.year}`;
                if (key !== lastLunarKey) {
                    drawMoonPhase(moonCanvas, lunar.day);
                    lastLunarKey = key;
                }
            } else if (lunarNode) {
                lunarNode.textContent = 'Âm lịch chưa tải được';
            }
        };
        update();
        window.setInterval(update, 1_000);
    }

    function renderSearchResults(posts, query, container) {
        const normalized = normalizeText(query);
        if (!normalized) {
            container.innerHTML = '<p class="search-empty">Nhập từ khóa để tìm theo tiêu đề, mô tả, danh mục hoặc thẻ.</p>';
            return;
        }
        const tokens = normalized.split(/\s+/).filter(Boolean);
        const ranked = posts.map(post => {
            const title = normalizeText(post.title);
            const summary = normalizeText(post.summary);
            const categories = normalizeText([...(post.category || []), ...(post.tags || []), post.type || ''].join(' '));
            const haystack = `${title} ${summary} ${categories}`;
            if (!tokens.every(token => haystack.includes(token))) return null;
            let score = 0;
            tokens.forEach(token => {
                if (title === token) score += 12;
                else if (title.startsWith(token)) score += 8;
                else if (title.includes(token)) score += 5;
                if (categories.includes(token)) score += 3;
                if (summary.includes(token)) score += 1;
            });
            if (post.featured) score += 0.5;
            return { post, score };
        }).filter(Boolean).sort((a, b) => b.score - a.score || parsePostDate(b.post.date) - parsePostDate(a.post.date));

        const results = ranked.slice(0, 18);
        if (!results.length) {
            container.innerHTML = `<p class="search-empty">Không tìm thấy bài phù hợp với “${escapeHtml(query)}”. Thử từ khóa ngắn hơn.</p>`;
            return;
        }
        container.innerHTML = `<p class="search-count">Tìm thấy ${ranked.length} kết quả</p>` + results.map(({ post }) => `
            <a class="search-result-item" href="${escapeHtml(ensurePath(post.link))}">
                ${imageMarkup(post)}
                <span><strong>${escapeHtml(post.title)}</strong><p>${escapeHtml(post.summary || '')}</p><small>${escapeHtml(formatDate(post.date))}</small></span>
            </a>`).join('');
    }

    const searchState = { posts: [], timer: 0 };

    async function openSearchPanel() {
        let panel = document.getElementById('search-panel');
        let input = document.getElementById('site-search-input');
        let results = document.getElementById('search-results');
        if (!panel || !input || !results) {
            await initHeader();
            panel = document.getElementById('search-panel');
            input = document.getElementById('site-search-input');
            results = document.getElementById('search-results');
        }
        if (!panel || !input || !results) {
            console.error('Không tìm thấy khung tìm kiếm trong header.');
            return;
        }
        setHiddenPanel(document.getElementById('mobile-menu-panel'), false);
        setHiddenPanel(panel, true);
        $$('.search-open').forEach(button => button.setAttribute('aria-expanded', 'true'));
        window.setTimeout(() => input.focus({ preventScroll: true }), 80);
        try {
            searchState.posts = searchState.posts.length ? searchState.posts : await getPosts();
            renderSearchResults(searchState.posts, input.value, results);
        } catch (error) {
            console.error(error);
            results.innerHTML = '<p class="search-empty">Không thể tải dữ liệu tìm kiếm. Vui lòng thử lại.</p>';
        }
    }

    function closeSearchPanel() {
        setHiddenPanel(document.getElementById('search-panel'), false);
        $$('.search-open').forEach(button => button.setAttribute('aria-expanded', 'false'));
    }

    if (!window.VinhSearchStandalone) {
        window.VinhSearch = {
            open(event) {
                event?.preventDefault?.();
                event?.stopPropagation?.();
                openSearchPanel();
                return false;
            },
            close(event) {
                event?.preventDefault?.();
                closeSearchPanel();
                return false;
            }
        };
    }

    function openMobileMenu() {
        closeSearchPanel();
        setHiddenPanel(document.getElementById('mobile-menu-panel'), true);
        const button = document.getElementById('mobile-menu-open');
        button?.setAttribute('aria-expanded', 'true');
        button?.classList.add('active');
    }

    function closeMobileMenu() {
        setHiddenPanel(document.getElementById('mobile-menu-panel'), false);
        const button = document.getElementById('mobile-menu-open');
        button?.setAttribute('aria-expanded', 'false');
        button?.classList.remove('active');
    }

    function setDownloadMenu(open) {
        window.clearTimeout(downloadMenuCloseTimer);
        downloadMenuCloseTimer = 0;
        const dropdown = document.querySelector('[data-download-dropdown]');
        const button = document.getElementById('downloads-menu-toggle');
        if (!dropdown || !button) return;
        dropdown.classList.toggle('open', open);
        button.setAttribute('aria-expanded', String(open));
    }

    function scheduleDownloadMenuClose(delay = 120) {
        window.clearTimeout(downloadMenuCloseTimer);
        downloadMenuCloseTimer = window.setTimeout(() => setDownloadMenu(false), delay);
    }

    function initDownloadMenu() {
        const dropdown = document.querySelector('[data-download-dropdown]');
        if (!dropdown || dropdown.dataset.menuReady === 'true') return;
        dropdown.dataset.menuReady = 'true';
        dropdown.addEventListener('pointerenter', () => {
            window.clearTimeout(downloadMenuCloseTimer);
            downloadMenuCloseTimer = 0;
        });
        dropdown.addEventListener('pointerleave', () => scheduleDownloadMenuClose(130));
        dropdown.addEventListener('focusout', event => {
            if (!dropdown.contains(event.relatedTarget)) scheduleDownloadMenuClose(0);
        });
        dropdown.querySelectorAll('.desktop-dropdown-menu a').forEach(link => {
            link.addEventListener('click', () => setDownloadMenu(false));
        });
    }

    function initLogoCacheReset() {
        const logo = document.getElementById('site-logo');
        if (!logo || logo.dataset.cacheResetReady === 'true') return;
        logo.dataset.cacheResetReady = 'true';
        let singleClickTimer = 0;

        logo.addEventListener('click', event => {
            event.preventDefault();
            window.clearTimeout(singleClickTimer);
            singleClickTimer = window.setTimeout(() => {
                if (location.pathname === '/' || location.pathname.endsWith('/index.html')) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    location.href = logo.href;
                }
            }, 280);
        });

        logo.addEventListener('dblclick', async event => {
            event.preventDefault();
            event.stopPropagation();
            window.clearTimeout(singleClickTimer);
            if (!window.confirm('Xóa toàn bộ cache của website và tải bản mới nhất?')) return;
            try {
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(registrations.map(registration => registration.unregister()));
                }
                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                }
                try { localStorage.removeItem('vinh-home-admin-preview'); } catch (_) {}
            } finally {
                const freshUrl = new URL(location.href);
                freshUrl.searchParams.set('_fresh', Date.now().toString());
                location.replace(freshUrl.href);
            }
        });
    }

    function initHeader() {
        if (headerReadyPromise) return headerReadyPromise;
        headerReadyPromise = (async () => {
            const target = document.getElementById('header-placeholder');
            let loaded = Boolean(document.querySelector('.site-header'));
            if (!loaded && target) loaded = await loadFragment(`/hf/header.html?v=${VERSION}`, 'header-placeholder');
            if (!loaded) return false;
            detectActiveNav();
            initLogoCacheReset();
            initDownloadMenu();
            await ensureLunarCalendar();
            initClock();
            try {
                const config = await getHomeConfig();
                currentHomeConfig = config;
                applySiteOptions(config);
            } catch (_) {}
            return true;
        })();
        return headerReadyPromise;
    }

    async function ensureHolidayCatalog() {
        if (Array.isArray(window.VINH_HOLIDAYS) && window.VINH_HOLIDAYS.length) return true;
        try {
            await loadScriptOnce(`/js/holidays.js?v=${VERSION}`, () => Array.isArray(window.VINH_HOLIDAYS) && window.VINH_HOLIDAYS.length > 0);
        } catch (error) {
            console.warn('Không thể tải danh sách ngày lễ:', error);
        }
        return Array.isArray(window.VINH_HOLIDAYS) && window.VINH_HOLIDAYS.length > 0;
    }

    /* ========================= NGÀY LỄ ========================= */
    function holidayForDate(date) {
        const list = Array.isArray(window.VINH_HOLIDAYS) ? window.VINH_HOLIDAYS : [];
        let lunar = null;
        if (typeof window.getLunarDate === 'function') {
            lunar = window.getLunarDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
        }
        return list.find(item => item.isLunar
            ? lunar && lunar.day === Number(item.day) && lunar.month === Number(item.month)
            : date.getDate() === Number(item.day) && date.getMonth() + 1 === Number(item.month)
        ) || null;
    }

    function exactTodayHoliday() {
        const testId = new URLSearchParams(location.search).get('holidayTest');
        const list = Array.isArray(window.VINH_HOLIDAYS) ? window.VINH_HOLIDAYS : [];
        if (testId) return list.find(item => item.imagePrefix === testId) || null;
        return holidayForDate(new Date());
    }

    function resolveHolidayWindow(beforeDays = 0, afterDays = 0) {
        const list = Array.isArray(window.VINH_HOLIDAYS) ? window.VINH_HOLIDAYS : [];
        const testId = new URLSearchParams(location.search).get('holidayTest');
        if (testId) {
            const holiday = list.find(item => item.imagePrefix === testId);
            return holiday ? { holiday, offsetDays: 0, date: new Date(), test: true } : null;
        }
        const before = clampNumber(beforeDays, 0, 120, 0);
        const after = clampNumber(afterDays, 0, 120, 0);
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const matches = [];
        for (let offset = -after; offset <= before; offset += 1) {
            const date = new Date(today);
            date.setDate(today.getDate() + offset);
            const holiday = holidayForDate(date);
            if (holiday) matches.push({ holiday, offsetDays: offset, date });
        }
        matches.sort((a, b) => {
            // Nếu đồng thời còn trong khoảng sau một lễ cũ và trước một lễ mới,
            // luôn ưu tiên lễ sắp tới. Ví dụ 02/08 sẽ chọn Quốc khánh 02/09,
            // không giữ banner 27/07 chỉ vì ngày đó gần hơn.
            const aUpcoming = a.offsetDays >= 0;
            const bUpcoming = b.offsetDays >= 0;
            if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
            if (aUpcoming) return a.offsetDays - b.offsetDays;
            return Math.abs(a.offsetDays) - Math.abs(b.offsetDays);
        });
        return matches[0] || null;
    }

    function holidayTimingLabel(match) {
        const offset = Number(match?.offsetDays || 0);
        const name = match?.holiday?.name || 'ngày lễ';
        if (offset === 0) return `Hôm nay là ${name}`;
        if (offset > 0) return `Còn ${offset} ngày đến ${name}`;
        return `${Math.abs(offset)} ngày sau ${name}`;
    }

    function uniqueHolidayPaths(items) {
        return [...new Set((items || []).filter(Boolean))];
    }

    function holidayBannerVariants(holiday, _mobile = false) {
        const prefix = String(holiday?.imagePrefix || '').trim();
        if (!prefix) return [];
        // Hai biến thể chuẩn được luân phiên ngẫu nhiên và không lặp liên tiếp.
        // Ví dụ: tet.png ↔ tet.jpg, 0101.png ↔ 0101.jpg.
        return [
            `/img/holidays/${prefix}.png`,
            `/img/holidays/${prefix}.jpg`
        ];
    }

    function holidayImageCandidates(holiday, mobile = false) {
        const prefix = String(holiday?.imagePrefix || '').trim();
        if (!prefix) return [];
        const stems = mobile
            ? [prefix, `${prefix}m`, `${prefix}-mobile`, `${prefix}_mobile`]
            : [prefix, `${prefix}d`, `${prefix}-desktop`, `${prefix}_desktop`];
        const extensions = ['png', 'jpg', 'webp', 'jpeg'];
        return uniqueHolidayPaths(stems.flatMap(stem => extensions.map(ext => `/img/holidays/${stem}.${ext}`)));
    }

    function holidayPopupCandidates(holiday, mobile = false) {
        const prefix = String(holiday?.imagePrefix || '').trim();
        if (!prefix) return [];
        const suffix = mobile ? 'm' : 'd';
        const extensions = ['png', 'jpg', 'webp', 'jpeg'];

        // Ảnh popup nằm thẳng trong /img/holidays/:
        // 0101m.* cho mobile, 0101d.* cho desktop.
        // Tết Âm lịch dùng tetm/tetd; Tết Dương lịch dùng 0101m/0101d.
        const popupStems = [
            `${prefix}${suffix}`,
            `${prefix}-${mobile ? 'mobile' : 'desktop'}`,
            `${prefix}_${mobile ? 'mobile' : 'desktop'}`
        ];
        const popupImages = popupStems.flatMap(stem =>
            extensions.map(ext => `/img/holidays/${stem}.${ext}`)
        );

        // Nếu chưa có ảnh popup riêng thì mới dùng ảnh banner của ngày lễ.
        return uniqueHolidayPaths([
            ...popupImages,
            ...holidayBannerVariants(holiday, mobile),
            ...holidayImageCandidates(holiday, mobile)
        ]);
    }

    function chooseNonRepeatingHolidayImage(key, candidates) {
        const pool = uniqueHolidayPaths(candidates);
        if (!pool.length) return '';
        const storageKey = `vinh-holiday-image-last-${key}`;
        let last = '';
        try { last = localStorage.getItem(storageKey) || ''; } catch (_) {}
        const choices = pool.length > 1 ? pool.filter(item => item !== last) : pool;
        const selected = choices[Math.floor(Math.random() * choices.length)] || pool[0];
        try { localStorage.setItem(storageKey, selected); } catch (_) {}
        return selected;
    }

    function orderHolidayCandidates(key, candidates) {
        const pool = uniqueHolidayPaths(candidates);
        const selected = chooseNonRepeatingHolidayImage(key, pool);
        return selected ? [selected, ...pool.filter(item => item !== selected)] : pool;
    }

    function holidayPlaceholderData(holiday) {
        const title = String(holiday?.name || 'Ngày lễ').replace(/[&<>"']/g, '');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="500" viewBox="0 0 1500 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff7a59"/><stop offset=".55" stop-color="#ffb33b"/><stop offset="1" stop-color="#fff0bd"/></linearGradient></defs><rect width="1500" height="500" rx="36" fill="url(#g)"/><circle cx="1280" cy="90" r="115" fill="#fff" opacity=".18"/><circle cx="1320" cy="330" r="180" fill="#fff" opacity=".12"/><text x="90" y="215" fill="#fff" font-family="Arial,sans-serif" font-size="42" font-weight="700">Vinh ở Nhật</text><text x="90" y="305" fill="#fff" font-family="Arial,sans-serif" font-size="70" font-weight="800">${title}</text><text x="92" y="370" fill="#fff" opacity=".92" font-family="Arial,sans-serif" font-size="28">Chúc anh và gia đình một ngày thật nhiều niềm vui</text></svg>`;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    function holidayImagePaths(holiday) {
        const desktopCandidates = holidayImageCandidates(holiday, false);
        const mobileCandidates = holidayImageCandidates(holiday, true);
        const desktopVariants = holidayBannerVariants(holiday, false);
        const mobileVariants = holidayBannerVariants(holiday, true);
        const desktopPopupCandidates = holidayPopupCandidates(holiday, false);
        const mobilePopupCandidates = holidayPopupCandidates(holiday, true);
        const placeholder = holidayPlaceholderData(holiday);
        return {
            desktop: desktopVariants[0] || desktopCandidates[0] || placeholder,
            mobile: mobileVariants[0] || mobileCandidates[0] || placeholder,
            desktopVariants,
            mobileVariants,
            desktopCandidates,
            mobileCandidates,
            desktopPopupCandidates,
            mobilePopupCandidates,
            fallback: placeholder
        };
    }

    function setImageWithFallback(image, candidates, finalFallback = '') {
        if (!image) return;
        const queue = [...new Set((candidates || []).filter(Boolean))];
        let index = 0;
        image.onerror = () => {
            index += 1;
            if (index < queue.length) {
                image.src = queue[index];
                return;
            }
            image.onerror = null;
            if (finalFallback) image.src = finalFallback;
            else image.hidden = true;
        };
        if (queue.length) image.src = queue[0];
        else if (finalFallback) image.src = finalFallback;
    }

    function closeHolidayPopup() {
        setHiddenPanel(document.getElementById('holiday-popup'), false);
    }

    function showHolidayPopup(match, config) {
        const holiday = match?.holiday;
        const popup = document.getElementById('holiday-popup');
        if (!popup || !holiday) return;
        const title = document.getElementById('holiday-popup-title');
        const message = document.getElementById('holiday-popup-message');
        const image = document.getElementById('holiday-popup-image');
        const paths = holidayImagePaths(holiday);
        title.textContent = match.offsetDays === 0 ? `Chào mừng ${holiday.name}` : holidayTimingLabel(match);
        const timing = match.offsetDays === 0 ? '' : `${holidayTimingLabel(match)}. `;
        message.textContent = timing + (holiday.message || 'Chúc anh và gia đình một ngày thật nhiều niềm vui, bình an và ý nghĩa.');
        image.hidden = false;
        const mobile = window.innerWidth < 700;
        const candidates = mobile ? paths.mobilePopupCandidates : paths.desktopPopupCandidates;
        const ordered = orderHolidayCandidates(`popup-${holiday.imagePrefix}-${mobile ? 'm' : 'd'}`, candidates);
        setImageWithFallback(image, ordered, paths.fallback);
        setHiddenPanel(popup, true);
        clearTimeout(showHolidayPopup.timer);
        showHolidayPopup.timer = window.setTimeout(closeHolidayPopup, clampNumber(config.popupDurationMs, 3000, 30000, 7500));
    }

    async function runTodayCelebration(config) {
        const holidayConfig = config.holiday || {};
        activeHolidayToday = exactTodayHoliday();
        activeHolidayPopup = resolveHolidayWindow(holidayConfig.popupBeforeDays, holidayConfig.popupAfterDays);
        if (!activeHolidayPopup && !activeHolidayToday) return;
        if (!holidayConfig.popupEnabled && !holidayConfig.fireworksEnabled) return;
        const selectedHoliday = activeHolidayPopup?.holiday || activeHolidayToday;
        const todayKey = new Date().toISOString().slice(0, 10);
        const storageKey = `vinh-holiday-${selectedHoliday.imagePrefix}-${todayKey}`;
        if (holidayConfig.showOncePerDay && localStorage.getItem(storageKey) === 'shown' && !new URLSearchParams(location.search).has('holidayTest')) return;
        localStorage.setItem(storageKey, 'shown');

        // Pháo hoa luôn chỉ chạy đúng ngày lễ, không chạy trong cửa sổ trước/sau.
        // Popup được mở trong finally để dù người xem bỏ qua hoặc hiệu ứng gặp lỗi, lời chúc cuối vẫn xuất hiện.
        try {
            if (holidayConfig.fireworksEnabled && activeHolidayToday?.fireworks) {
                await loadScriptOnce(`/js/fireworks.js?v=${VERSION}`, () => Boolean(window.VinhHolidayFireworks?.run));
                await window.VinhHolidayFireworks?.run(activeHolidayToday, new Date().getFullYear());
            }
        } catch (error) {
            console.warn('Không thể chạy hiệu ứng pháo hoa:', error);
        } finally {
            if (holidayConfig.popupEnabled && activeHolidayPopup) {
                await new Promise(resolve => window.setTimeout(resolve, 360));
                showHolidayPopup(activeHolidayPopup, holidayConfig);
            }
        }
    }

    /* ========================= BANNER ========================= */
    function createHolidayBanner(match) {
        const holiday = match?.holiday;
        if (!holiday) return null;
        const paths = holidayImagePaths(holiday);
        const timing = holidayTimingLabel(match);
        return {
            id: `holiday-${holiday.imagePrefix}`,
            enabled: true,
            kind: 'holiday',
            title: holiday.name,
            description: `${timing}. ${holiday.message || 'Chúc một ngày lễ thật nhiều niềm vui và ý nghĩa.'}`,
            imageDesktop: paths.desktop,
            imageMobile: paths.mobile,
            imageVariantsDesktop: paths.desktopVariants,
            imageVariantsMobile: paths.mobileVariants,
            variantKey: holiday.imagePrefix,
            fallbackImagesDesktop: paths.desktopCandidates,
            fallbackImagesMobile: paths.mobileCandidates,
            fallbackImage: paths.fallback,
            buttonText: 'Xem lời chúc',
            actionType: 'holiday'
        };
    }

    function bannerSlideTemplate(banner, index) {
        const desktopVariants = uniqueHolidayPaths(banner.imageVariantsDesktop || []);
        const mobileVariants = uniqueHolidayPaths(banner.imageVariantsMobile || []);
        const variants = isMobileViewport() ? mobileVariants : desktopVariants;
        const variantKey = String(banner.variantKey || banner.id || `banner-${index}`);
        const selectedVariant = variants.length
            ? chooseNonRepeatingHolidayImage(`banner-${variantKey}-${isMobileViewport() ? 'm' : 'd'}`, variants)
            : '';
        const desktop = ensurePath(banner.imageDesktop || banner.imageUrl || '', '');
        const mobile = ensurePath(banner.imageMobile || banner.imageDesktop || banner.imageUrl || '', '');
        const selected = ensurePath(selectedVariant || (isMobileViewport() ? mobile : desktop), '');
        const fallbackList = isMobileViewport()
            ? (banner.fallbackImagesMobile || banner.fallbackImagesDesktop || [])
            : (banner.fallbackImagesDesktop || banner.fallbackImagesMobile || []);
        const fallbacks = [...new Set([selected, ...variants, ...fallbackList, banner.fallbackImage].filter(Boolean).map(item => ensurePath(item, item)))];
        const url = ensurePath(banner.actionUrl || '', '');
        const target = banner.newTab ? ' target="_blank" rel="noopener"' : '';
        const eager = index === 0;
        const variantData = variants.length ? ` data-banner-variants="${escapeHtml(JSON.stringify(variants))}" data-banner-variant-key="${escapeHtml(variantKey)}"` : '';
        const image = selected ? `<img src="${eager ? escapeHtml(selected) : TRANSPARENT_PIXEL}" ${eager ? '' : `data-src="${escapeHtml(selected)}"`} data-banner-fallbacks="${escapeHtml(JSON.stringify(fallbacks))}"${variantData} alt="${escapeHtml(banner.title || 'Banner')}" loading="${eager ? 'eager' : 'lazy'}" fetchpriority="${eager ? 'high' : 'low'}" decoding="async" data-banner-image>` : '';
        const media = url
            ? `<a class="home-banner-media home-banner-link" href="${escapeHtml(url)}"${target} aria-label="${escapeHtml(banner.title || 'Mở banner')}">${image}</a>`
            : `<div class="home-banner-media">${image}</div>`;
        return `<article class="home-banner-slide ${banner.kind === 'holiday' ? 'holiday-banner-slide' : 'ad-banner-slide'}" data-banner-index="${index}">${media}</article>`;
    }

    function rotateHolidayBannerVariant(slide) {
        const image = slide?.querySelector('img[data-banner-variants]');
        if (!image) return;
        let variants = [];
        try { variants = JSON.parse(image.dataset.bannerVariants || '[]'); } catch (_) {}
        variants = uniqueHolidayPaths(variants);
        if (variants.length < 2) return;
        const key = image.dataset.bannerVariantKey || slide.dataset.bannerIndex || 'holiday';
        const next = chooseNonRepeatingHolidayImage(`banner-${key}-${isMobileViewport() ? 'm' : 'd'}`, variants);
        if (!next) return;
        const absolute = new URL(ensurePath(next, next), location.href).href;
        if (image.src !== absolute) {
            image.src = ensurePath(next, next);
            image.dataset.activeHolidayVariant = next;
        }
    }

    function hydrateBannerSlide(slide) {
        if (!slide) return;
        slide.querySelectorAll('source[data-srcset]').forEach(source => {
            source.srcset = source.dataset.srcset || '';
            source.removeAttribute('data-srcset');
        });
        slide.querySelectorAll('img[data-src]').forEach(image => {
            image.src = image.dataset.src || '';
            image.removeAttribute('data-src');
        });
    }

    function initBannerSlider(container, banners, config) {
        if (bannerController?.destroy) bannerController.destroy();
        const count = banners.length;
        if (!count) {
            container.innerHTML = '<div class="home-banner-empty"><strong>Chưa có banner đang bật</strong><p>Thêm banner trong Admin hoặc tắt khu vực banner.</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="home-banner-viewport">
                <div class="home-banner-track">${banners.map(bannerSlideTemplate).join('')}</div>
            </div>
            ${count > 1 && config.showArrows ? `<button class="home-banner-arrow prev" type="button" data-banner-prev aria-label="Banner trước">‹</button><button class="home-banner-arrow next" type="button" data-banner-next aria-label="Banner sau">›</button>` : ''}
            ${count > 1 && config.showDots ? `<div class="home-banner-dots">${banners.map((_, i) => `<button type="button" data-banner-dot="${i}" aria-label="Banner ${i + 1}"></button>`).join('')}</div>` : ''}`;

        const track = $('.home-banner-track', container);
        const originalSlides = $$('.home-banner-slide', track);
        if (count > 1) {
            const lastClone = originalSlides[count - 1].cloneNode(true);
            const firstClone = originalSlides[0].cloneNode(true);
            lastClone.classList.add('home-banner-clone');
            firstClone.classList.add('home-banner-clone');
            lastClone.dataset.bannerClone = 'last';
            firstClone.dataset.bannerClone = 'first';
            track.prepend(lastClone);
            track.append(firstClone);
        }

        const slides = $$('.home-banner-slide', track);
        let physicalIndex = count > 1 ? 1 : 0;
        let logicalIndex = 0;
        let interval = 0;
        let moving = false;
        let transitionFallback = 0;
        let startX = 0;
        const intervalMs = clampNumber(config.intervalMs, 2500, 20000, 5500);

        const logicalFromPhysical = value => count > 1
            ? (value - 1 + count) % count
            : 0;

        const setTransform = (animate = true) => {
            if (!animate) track.style.transition = 'none';
            else track.style.removeProperty('transition');
            track.style.transform = `translate3d(-${physicalIndex * 100}%,0,0)`;
            if (!animate) {
                // Buộc trình duyệt ghi nhận vị trí tức thời trước khi bật lại chuyển động.
                void track.offsetWidth;
                track.style.removeProperty('transition');
            }
        };

        const copyActiveImage = (fromSlide, toSlide) => {
            const from = fromSlide?.querySelector('img[data-banner-image]');
            const to = toSlide?.querySelector('img[data-banner-image]');
            if (!from || !to) return;
            const src = from.currentSrc || from.src;
            if (src) to.src = src;
            if (from.dataset.activeHolidayVariant) {
                to.dataset.activeHolidayVariant = from.dataset.activeHolidayVariant;
            }
        };

        const syncState = ({ rotate = true } = {}) => {
            logicalIndex = logicalFromPhysical(physicalIndex);
            const activeSlide = slides[physicalIndex];
            const nextSlide = slides[(physicalIndex + 1) % slides.length];
            hydrateBannerSlide(activeSlide);
            hydrateBannerSlide(nextSlide);
            if (rotate) rotateHolidayBannerVariant(activeSlide);
            $$('[data-banner-dot]', container).forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === logicalIndex);
            });
            slides.forEach((slide, slideIndex) => {
                slide.setAttribute('aria-hidden', String(slideIndex !== physicalIndex));
            });
        };

        const completeMove = () => {
            window.clearTimeout(transitionFallback);
            transitionFallback = 0;
            if (count > 1 && physicalIndex === count + 1) {
                copyActiveImage(slides[count + 1], slides[1]);
                physicalIndex = 1;
                setTransform(false);
                syncState({ rotate: false });
            } else if (count > 1 && physicalIndex === 0) {
                copyActiveImage(slides[0], slides[count]);
                physicalIndex = count;
                setTransform(false);
                syncState({ rotate: false });
            }
            moving = false;
        };

        const scheduleMoveCompletion = () => {
            window.clearTimeout(transitionFallback);
            transitionFallback = window.setTimeout(completeMove, 700);
        };

        const step = delta => {
            if (count <= 1 || moving) return;
            moving = true;
            physicalIndex += delta;
            setTransform(true);
            syncState();
            scheduleMoveCompletion();
        };

        const goDirect = nextLogical => {
            if (count <= 1 || moving) return;
            const target = (Number(nextLogical) + count) % count;
            logicalIndex = target;
            physicalIndex = target + 1;
            moving = true;
            setTransform(true);
            syncState();
            scheduleMoveCompletion();
        };

        const stop = () => {
            if (interval) window.clearInterval(interval);
            interval = 0;
        };

        const start = () => {
            stop();
            if (config.autoplay && count > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                interval = window.setInterval(() => step(1), intervalMs);
            }
        };

        track.addEventListener('transitionend', event => {
            if (event.target !== track || event.propertyName !== 'transform') return;
            completeMove();
        });

        container.addEventListener('click', event => {
            const prev = event.target.closest('[data-banner-prev]');
            const next = event.target.closest('[data-banner-next]');
            const dot = event.target.closest('[data-banner-dot]');
            if (prev) { step(-1); start(); }
            else if (next) { step(1); start(); }
            else if (dot) { goDirect(Number(dot.dataset.bannerDot)); start(); }
        });

        container.addEventListener('pointerdown', event => {
            startX = event.clientX;
            stop();
        }, { passive: true });
        container.addEventListener('pointerup', event => {
            const distance = event.clientX - startX;
            if (Math.abs(distance) > 45) step(distance < 0 ? 1 : -1);
            start();
        }, { passive: true });

        if (config.pauseOnHover) {
            container.addEventListener('mouseenter', stop);
            container.addEventListener('mouseleave', start);
        }

        $$('[data-banner-image]', container).forEach(image => {
            let candidates = [];
            try { candidates = JSON.parse(image.dataset.bannerFallbacks || '[]'); } catch (_) {}
            let currentIndex = -1;
            image.addEventListener('load', () => {
                const key = image.dataset.bannerVariantKey;
                const active = image.dataset.activeHolidayVariant;
                if (key && active) {
                    try { localStorage.setItem(`vinh-holiday-image-last-banner-${key}-${isMobileViewport() ? 'm' : 'd'}`, active); } catch (_) {}
                }
            });
            image.addEventListener('error', () => {
                const slide = image.closest('.home-banner-slide');
                currentIndex += 1;
                while (candidates[currentIndex] && image.src === new URL(candidates[currentIndex], location.href).href) currentIndex += 1;
                if (candidates[currentIndex]) {
                    image.src = candidates[currentIndex];
                    return;
                }
                slide?.classList.add('banner-image-missing');
            });
        });

        setTransform(false);
        syncState();
        start();
        bannerController = {
            destroy() {
                stop();
                window.clearTimeout(transitionFallback);
            }
        };
    }

    function renderHomeBanner(config) {
        const section = document.getElementById('home-banner-section');
        const container = document.getElementById('home-banner');
        if (!section || !container) return;
        section.hidden = !config.sections.banner;
        if (!config.sections.banner) return;
        container.style.setProperty('--home-banner-ratio', String(config.banner.aspectRatio || '3 / 1'));
        const ads = config.banners.filter(item => item && item.enabled !== false && (item.kind || 'ad') === 'ad');
        activeHolidayBanner = config.banner.holidaySlideEnabled
            ? resolveHolidayWindow(config.banner.holidayBeforeDays, config.banner.holidayAfterDays)
            : null;
        const holidayBanner = activeHolidayBanner ? createHolidayBanner(activeHolidayBanner) : null;
        const holidaySlides = holidayBanner ? [holidayBanner] : [];
        let banners = [];
        if (config.banner.mode === 'ads-only') banners = ads;
        else if (config.banner.mode === 'holiday-only') banners = holidaySlides.length ? holidaySlides : ads;
        else if (config.banner.holidayPosition === 'before-ads') banners = [...holidaySlides, ...ads];
        else banners = [...ads, ...holidaySlides];
        initBannerSlider(container, banners, config.banner);
    }

    /* ========================= TRANG CHỦ KIỂU R3 + BANNER ========================= */
    function heroTemplate(post) {
        return `<a class="hero-main-link" href="${escapeHtml(ensurePath(post.link))}">
            <div class="hero-image-wrap">${imageMarkup(post, { eager: true })}<span class="hero-badge">Nổi bật</span></div>
            <div class="hero-copy">
                <h1>${escapeHtml(post.title)}</h1>
                <p>${escapeHtml(post.summary || '')}</p>
                <div class="news-meta"><span>${escapeHtml(formatDate(post.date))}</span><span class="dot"></span><span>${escapeHtml((post.category || [post.type || 'Bài viết'])[0] || 'Bài viết')}</span></div>
            </div>
        </a>`;
    }

    function sideHeroTemplate(post) {
        return `<article class="hero-side-item"><a href="${escapeHtml(ensurePath(post.link))}">
            <span class="hero-side-media">${imageMarkup(post)}</span>
            <span class="hero-side-copy"><strong>${escapeHtml(post.title)}</strong><small>${escapeHtml(formatDate(post.date, true))}</small></span>
        </a></article>`;
    }

    function feedTemplate(post, showShare = true) {
        const link = ensurePath(post.link);
        return `<article class="news-feed-item"><a class="news-feed-link" href="${escapeHtml(link)}">
            <div class="news-feed-image">${imageMarkup(post)}</div>
            <div class="news-feed-copy">
                <h2>${escapeHtml(post.title)}</h2>
                <p>${escapeHtml(post.summary || '')}</p>
                <div class="news-meta"><span>${escapeHtml(formatDate(post.date))}</span><span class="dot"></span><span>${escapeHtml((post.category || [post.type || 'Bài viết'])[0] || 'Bài viết')}</span></div>
            </div>
        </a>${showShare ? `<button class="home-feed-share share-button share-button-small" type="button" data-share-url="${escapeHtml(link)}" data-share-title="${escapeHtml(post.title)}" aria-label="Chia sẻ ${escapeHtml(post.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.7 10.6 6.6-4.1M8.7 13.4l6.6 4.1"></path></svg><span>Chia sẻ</span></button>` : ''}</article>`;
    }

    function renderProgressiveFeed(container, items, feedConfig) {
        if (!container) return;
        const initial = clampNumber(feedConfig?.initialCount, 1, 30, 8);
        const batch = clampNumber(feedConfig?.batchSize, 1, 20, 4);
        const maximum = clampNumber(feedConfig?.maxItems, 1, 100, 20);
        const pool = items.slice(0, maximum);
        let shown = 0;
        let observer = null;

        container.parentElement?.querySelector(':scope > .home-feed-control')?.remove();
        const control = document.createElement('div');
        control.className = 'home-feed-control';
        control.innerHTML = '<button type="button" class="home-feed-more">Xem thêm bài viết</button><span class="home-feed-sentinel" aria-hidden="true"></span>';
        const button = control.querySelector('.home-feed-more');
        const sentinel = control.querySelector('.home-feed-sentinel');

        function updateControl() {
            const remaining = pool.length - shown;
            button.hidden = remaining <= 0 || feedConfig?.autoLoad === true;
            control.hidden = remaining <= 0;
            if (remaining <= 0 && observer) observer.disconnect();
        }
        function append(amount) {
            const next = pool.slice(shown, shown + amount);
            if (!next.length) { updateControl(); return; }
            container.insertAdjacentHTML('beforeend', next.map(post => feedTemplate(post, feedConfig?.showShare !== false)).join(''));
            shown += next.length;
            updateControl();
        }

        container.innerHTML = '';
        if (!pool.length) {
            container.innerHTML = '<div class="home-empty-state"><strong>Chưa chọn bài mới</strong><p>Đánh dấu “Bài mới” trong Admin để bài hiện tại mục này.</p></div>';
            return;
        }
        container.after(control);
        button.addEventListener('click', () => append(batch));
        append(initial);
        if (feedConfig?.autoLoad === true && 'IntersectionObserver' in window && shown < pool.length) {
            observer = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) append(batch);
            }, { rootMargin: '420px 0px' });
            observer.observe(sentinel);
        } else if (feedConfig?.autoLoad === true && shown < pool.length) {
            button.hidden = false;
            control.hidden = false;
        }
    }

    function compactTemplate(post) {
        return `<a class="compact-post" href="${escapeHtml(ensurePath(post.link))}">
            ${imageMarkup(post)}
            <span><strong>${escapeHtml(post.title)}</strong><small>${escapeHtml(formatDate(post.date, true))}</small></span>
        </a>`;
    }

    function applySiteOptions(config) {
        const mobile = config?.mobileNav || DEFAULT_HOME_CONFIG.mobileNav;
        const nav = document.querySelector('[data-mobile-nav], .mobile-bottom-nav');
        if (nav) {
            const enabled = mobile.enabled !== false;
            nav.hidden = !enabled;
            nav.classList.toggle('labels-hidden', mobile.showLabels === false);
            document.body.classList.toggle('mobile-nav-disabled', !enabled);
            const labels = { ...DEFAULT_HOME_CONFIG.mobileNav.labels, ...(mobile.labels || {}) };
            const icons = { ...DEFAULT_HOME_CONFIG.mobileNav.icons, ...(mobile.icons || {}) };
            document.querySelectorAll('[data-mobile-nav-label]').forEach(node => {
                const key = node.dataset.mobileNavLabel;
                node.textContent = labels[key] || DEFAULT_HOME_CONFIG.mobileNav.labels[key] || '';
            });
            document.querySelectorAll('[data-mobile-nav-key]').forEach(item => {
                const key = item.dataset.mobileNavKey;
                const custom = String(icons[key] || '').trim();
                let symbol = item.querySelector('.mobile-nav-custom-icon');
                const svg = item.querySelector(':scope > svg');
                if (custom) {
                    if (!symbol) {
                        symbol = document.createElement('span');
                        symbol.className = 'mobile-nav-custom-icon';
                        item.insertBefore(symbol, item.firstChild);
                    }
                    symbol.textContent = custom;
                    symbol.hidden = false;
                    if (svg) svg.hidden = true;
                } else {
                    if (symbol) symbol.remove();
                    if (svg) svg.hidden = false;
                }
            });
        }

        const menu = config?.mobileMenu || DEFAULT_HOME_CONFIG.mobileMenu;
        const intro = document.querySelector('[data-mobile-menu-intro]');
        if (intro) intro.classList.toggle('intro-text-hidden', menu.showIntro === false);
        const eyebrow = document.querySelector('[data-mobile-menu-eyebrow]');
        if (eyebrow) eyebrow.textContent = String(menu.eyebrow || 'Giới thiệu');
        const introTitle = document.querySelector('[data-mobile-menu-intro-title]');
        if (introTitle) introTitle.textContent = String(menu.title || 'Vinh ở Nhật');
        const introText = document.querySelector('[data-mobile-menu-intro-text]');
        if (introText) introText.textContent = String(menu.text || '');
        const menuIcons = { ...DEFAULT_HOME_CONFIG.mobileMenu.icons, ...(menu.icons || {}) };
        document.querySelectorAll('[data-mobile-menu-icon]').forEach(node => {
            const key = node.dataset.mobileMenuIcon;
            node.textContent = String(menuIcons[key] || DEFAULT_HOME_CONFIG.mobileMenu.icons[key] || '•');
        });

        const mobileHome = config?.mobileHome || DEFAULT_HOME_CONFIG.mobileHome;
        document.body.classList.toggle('mobile-hide-topics', mobileHome.hideTopics !== false);
        const mobileGuideTitle = document.querySelector('.mobile-guide-title');
        if (mobileGuideTitle) mobileGuideTitle.textContent = String(mobileHome.guideTitle || 'Gợi ý thêm');

        const lunar = config?.lunar || DEFAULT_HOME_CONFIG.lunar;
        const moon = document.querySelector('.moon-phase-wrap');
        const solar = document.getElementById('date');
        const lunarDate = document.getElementById('lunar-date');
        if (moon) moon.hidden = lunar.showMoon === false;
        if (solar) solar.hidden = lunar.showSolarDate === false;
        if (lunarDate) lunarDate.hidden = lunar.showLunarDate === false;
    }

    function applyFooterSocials(config) {
        const social = config?.social || {};
        document.querySelectorAll('[data-footer-social]').forEach(link => {
            const key = link.dataset.footerSocial;
            let url = String(social[key] || '').trim();
            if (key === 'email' && url && !/^mailto:/i.test(url)) url = `mailto:${url}`;
            link.hidden = !url;
            if (url) link.href = url;
        });
        const footer = config?.footer || DEFAULT_HOME_CONFIG.footer;
        const description = document.querySelector('[data-footer-description]');
        if (description) description.textContent = String(footer.text || '');
        const contactLabel = document.querySelector('[data-footer-contact-label]');
        if (contactLabel) {
            const label = String(footer.contactLabel ?? '').trim();
            contactLabel.textContent = label;
            contactLabel.hidden = !label;
        }
        const links = document.querySelector('.footer-links');
        if (links) links.hidden = footer.showQuickLinks === false;
        applySiteOptions(config);
    }

    async function initHome() {
        const hero = document.getElementById('hero-story');
        const side = document.getElementById('hero-side-list');
        const latest = document.getElementById('latest-posts-container');
        const guides = document.getElementById('guide-posts-container');
        if (!hero || !latest) return;

        try {
            await Promise.all([ensureLunarCalendar(), ensureHolidayCatalog()]);
            activeHolidayToday = exactTodayHoliday();
            const [posts, config] = await Promise.all([getPosts(), getHomeConfig()]);
            currentHomeConfig = config;
            renderHomeBanner(config);
            applyFooterSocials(config);
            const topics = document.querySelector('.home-topic-strip');
            const heroSection = document.querySelector('.news-hero');
            const latestSection = document.querySelector('.news-primary .news-section');
            const sidebar = document.querySelector('.news-sidebar');
            if (topics) topics.hidden = !config.sections.topics;
            if (heroSection) heroSection.hidden = !config.sections.featured;
            if (latestSection) latestSection.hidden = !config.sections.latestFeed;
            if (sidebar) sidebar.hidden = !config.sections.sidebar;

            const displayPosts = posts.filter(canShowPostInLists);
            const featuredPosts = displayPosts.filter(post => post.featured === true);
            const heroPost = featuredPosts[0] || null;
            const remainingFeatured = featuredPosts.filter(post => post.id !== heroPost?.id);
            const preferredFeatured = remainingFeatured.filter(post => !isNewPost(post));
            const sidePosts = [];
            const usedFeaturedGroups = new Set();
            for (const post of preferredFeatured) {
                const group = String((post.category || [post.type || 'other'])[0] || 'other');
                if (usedFeaturedGroups.has(group)) continue;
                sidePosts.push(post);
                usedFeaturedGroups.add(group);
                if (sidePosts.length === 4) break;
            }
            for (const post of [...preferredFeatured, ...remainingFeatured.filter(post => isNewPost(post))]) {
                if (sidePosts.length >= 4) break;
                if (sidePosts.some(item => item.id === post.id)) continue;
                sidePosts.push(post);
            }
            const usedIds = new Set([heroPost, ...sidePosts].filter(Boolean).map(post => post.id));
            const guidePosts = displayPosts
                .filter(post => post.type === 'guide' && !usedIds.has(post.id) && !isNewPost(post))
                .slice(0, 5);
            guidePosts.forEach(post => usedIds.add(post.id));
            const feedSource = config.feed?.source === 'all' ? displayPosts : displayPosts.filter(post => isNewPost(post));
            const feedPool = feedSource.filter(post => !usedIds.has(post.id));

            hero.classList.remove('skeleton-block');
            hero.innerHTML = heroPost
                ? heroTemplate(heroPost)
                : '<div class="home-empty-state"><strong>Chưa chọn bài nổi bật</strong><p>Đánh dấu “Nổi bật” trong Admin để bài xuất hiện tại đây.</p></div>';
            if (side) side.innerHTML = sidePosts.map(sideHeroTemplate).join('');
            renderProgressiveFeed(latest, feedPool, config.feed || {});
            if (guides) guides.innerHTML = guidePosts.map(compactTemplate).join('') || '<p class="search-empty">Chưa có hướng dẫn được chọn.</p>';

            window.setTimeout(() => runTodayCelebration(config), 650);
        } catch (error) {
            console.error(error);
            const banner = document.getElementById('home-banner');
            if (banner) banner.innerHTML = '<div class="home-banner-empty"><strong>Không thể tải banner</strong><p>Vui lòng tải lại trang.</p></div>';
            hero.classList.remove('skeleton-block');
            hero.innerHTML = '<p class="search-empty">Không thể tải bài viết. Vui lòng kiểm tra kết nối và thử lại.</p>';
            latest.innerHTML = '<p class="search-empty">Không thể tải dữ liệu bài viết.</p>';
        }
    }

    /* ========================= SỰ KIỆN CHUNG ========================= */
    function bindGlobalEvents() {
        if (globalEventsBound) return;
        globalEventsBound = true;
        document.addEventListener('click', event => {
            const share = event.target.closest('[data-share-url]');
            if (share) {
                event.preventDefault();
                event.stopPropagation();
                shareLink(share.dataset.shareTitle || document.title, share.dataset.shareUrl || location.href);
                return;
            }
            if (event.target.closest('[data-search-trigger], .search-open')) {
                event.preventDefault();
                if (window.VinhSearchStandalone && window.VinhSearch?.open) {
                    window.VinhSearch.open(event);
                } else {
                    openSearchPanel();
                    loadScriptOnce(`/js/search.js?v=${VERSION}`, () => Boolean(window.VinhSearchStandalone))
                        .catch(error => console.warn('Dùng tìm kiếm nhẹ dự phòng:', error));
                }
                return;
            }
            if (event.target.closest('[data-close-search]')) { event.preventDefault(); closeSearchPanel(); return; }
            if (event.target.closest('#mobile-menu-open')) {
                event.preventDefault();
                const panel = document.getElementById('mobile-menu-panel');
                if (panel && !panel.hidden) closeMobileMenu();
                else openMobileMenu();
                return;
            }
            if (event.target.closest('[data-close-mobile-menu]')) { event.preventDefault(); closeMobileMenu(); return; }
            if (event.target.closest('[data-close-holiday]')) { event.preventDefault(); closeHolidayPopup(); return; }

            const clear = event.target.closest('#clear-search');
            if (clear) {
                const input = document.getElementById('site-search-input');
                const results = document.getElementById('search-results');
                if (input && results) { input.value = ''; renderSearchResults(searchState.posts, '', results); input.focus(); }
                return;
            }
            const suggestion = event.target.closest('[data-search-term]');
            if (suggestion) {
                const input = document.getElementById('site-search-input');
                const results = document.getElementById('search-results');
                if (input && results) { input.value = suggestion.dataset.searchTerm || ''; renderSearchResults(searchState.posts, input.value, results); input.focus(); }
                return;
            }
            const downloadToggle = event.target.closest('#downloads-menu-toggle');
            if (downloadToggle) {
                event.preventDefault();
                setDownloadMenu(!downloadToggle.closest('[data-download-dropdown]')?.classList.contains('open'));
                return;
            }
            if (!event.target.closest('[data-download-dropdown]')) setDownloadMenu(false);

            const latestLink = event.target.closest('[data-scroll-latest]');
            if (latestLink && location.pathname === '/') {
                event.preventDefault();
                closeMobileMenu();
                document.getElementById('latest-posts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, true);

        document.addEventListener('input', event => {
            if (window.VinhSearchStandalone) return;
            if (event.target.id !== 'site-search-input') return;
            const results = document.getElementById('search-results');
            if (!results) return;
            clearTimeout(searchState.timer);
            searchState.timer = window.setTimeout(() => renderSearchResults(searchState.posts, event.target.value, results), 100);
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeSearchPanel(); closeMobileMenu(); closeHolidayPopup(); setDownloadMenu(false);
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !window.VinhSearchStandalone) {
                event.preventDefault();
                openSearchPanel();
                loadScriptOnce(`/js/search.js?v=${VERSION}`, () => Boolean(window.VinhSearchStandalone))
                    .catch(error => console.warn('Dùng tìm kiếm nhẹ dự phòng:', error));
            }
        });
    }

    function initScrollTop() {
        const button = document.getElementById('scrollToTopBtn');
        if (!button) return;
        const update = () => button.classList.toggle('visible', window.scrollY > 650);
        window.addEventListener('scroll', update, { passive: true });
        button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        update();
    }

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        window.addEventListener('load', () => {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const slowConnection = Boolean(connection?.saveData) || /(^|-)2g$/.test(String(connection?.effectiveType || ''));
            const register = () => navigator.serviceWorker.register('/sw.js')
                .catch(error => console.warn('Không thể đăng ký Service Worker:', error));
            const delay = slowConnection ? 12000 : 4500;
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(register, { timeout: delay });
            } else {
                window.setTimeout(register, delay);
            }
        }, { once: true });
    }

    bindGlobalEvents();

    document.addEventListener('DOMContentLoaded', () => {
        bindGlobalEvents();
        initHeader();
        const footerTarget = document.getElementById('footer-placeholder');
        const footerReady = footerTarget?.querySelector('.site-footer')
            ? Promise.resolve(true)
            : loadFragment(`/hf/footer.html?v=${VERSION}`, 'footer-placeholder');
        footerReady.then(async () => applyFooterSocials(await getHomeConfig()));
        initHome();
        initScrollTop();
        initArticleShare();
        registerServiceWorker();
    });
})();
