(() => {
    'use strict';

    const VERSION = window.VinhSiteVersion?.id || 'dev';
    const POSTS_URLS = [`/data/posts-search.json?v=${VERSION}`, `/data/posts-index.json?v=${VERSION}`, `/data/posts.json?v=${VERSION}`];
    const DEFAULT_IMAGE = '/img/logoQV.png';
    const HISTORY_KEY = 'vinhonhat-search-history-v1';
    const DEFAULT_TERMS = ['Rakuten', 'Yucho', 'Seven Bank', 'Sim'];
    const MAX_HISTORY = 6;
    let postsPromise = null;
    let inputTimer = 0;

    const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);

    const normalizeText = (value = '') => String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

    function ensurePath(value, fallback = '#') {
        const path = String(value || '').trim();
        if (!path) return fallback;
        if (/^(https?:|mailto:|tel:|data:|blob:|\/)/i.test(path)) return path;
        return '/' + path.replace(/^\.\//, '');
    }

    function parseDate(value) {
        const raw = String(value || '').trim();
        const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
        const parsed = Date.parse(raw);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    function formatDate(value) {
        const time = parseDate(value);
        if (!time) return '';
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(time));
    }

    function readHistory() {
        try {
            const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, MAX_HISTORY) : [];
        } catch (_) {
            return [];
        }
    }

    function writeHistory(items) {
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY))); }
        catch (_) {}
    }

    function rememberTerm(term) {
        const clean = String(term || '').trim().replace(/\s+/g, ' ');
        if (clean.length < 2) return;
        const normalized = normalizeText(clean);
        const next = [clean, ...readHistory().filter(item => normalizeText(item) !== normalized)].slice(0, MAX_HISTORY);
        writeHistory(next);
        renderHistory();
    }

    function clearHistory() {
        try { localStorage.removeItem(HISTORY_KEY); } catch (_) {}
        renderHistory();
    }

    function historyTemplate() {
        return `<div class="search-history" id="search-history">
            <span class="search-history-label">Gợi ý</span>
            <div class="search-history-list" id="search-history-list"></div>
            <button id="clear-search-history" class="search-history-clear" type="button" aria-label="Xóa lịch sử tìm kiếm" title="Xóa lịch sử">×</button>
        </div>`;
    }

    function panelTemplate() {
        return `<div id="search-panel" class="search-panel" hidden>
            <div class="search-backdrop" data-close-search></div>
            <section class="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
                <div class="search-dialog-head">
                    <div><small>Tìm trong toàn bộ website</small><h2 id="search-title">Anh cần tìm bài nào?</h2></div>
                    <button class="icon-button" type="button" data-close-search aria-label="Đóng tìm kiếm"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>
                </div>
                <label class="search-field">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
                    <input id="site-search-input" type="search" inputmode="search" autocomplete="off" enterkeyhint="search" placeholder="Ví dụ: Rakuten, Yucho, sim...">
                    <button id="clear-search" type="button" aria-label="Xóa nội dung">×</button>
                </label>
                ${historyTemplate()}
                <div id="search-results" class="search-results" aria-live="polite"><p class="search-empty">Nhập từ khóa để tìm theo tiêu đề, nội dung, mô tả, danh mục hoặc thẻ.</p></div>
            </section>
        </div>`;
    }

    function ensurePanel() {
        let panel = document.getElementById('search-panel');
        if (!panel) {
            document.body.insertAdjacentHTML('beforeend', panelTemplate());
            panel = document.getElementById('search-panel');
        } else if (!document.getElementById('search-history')) {
            const results = document.getElementById('search-results');
            results?.insertAdjacentHTML('beforebegin', historyTemplate());
            document.getElementById('search-suggestions')?.remove();
        }
        renderHistory();
        return panel;
    }

    function renderHistory() {
        const list = document.getElementById('search-history-list');
        const label = document.querySelector('.search-history-label');
        const clear = document.getElementById('clear-search-history');
        if (!list) return;
        const history = readHistory();
        const terms = history.length ? history : DEFAULT_TERMS;
        if (label) label.textContent = history.length ? 'Gần đây' : 'Gợi ý';
        if (clear) clear.hidden = history.length === 0;
        list.innerHTML = terms.map(term => `<button type="button" data-search-history-term="${escapeHtml(term)}">${escapeHtml(term)}</button>`).join('');
    }

    async function getPosts() {
        if (!postsPromise) {
            postsPromise = (async () => {
                let lastError = null;
                for (const url of POSTS_URLS) {
                    try {
                        const response = await fetch(url, { cache: 'no-store' });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const payload = await response.json();
                        const items = Array.isArray(payload) ? payload : (Array.isArray(payload?.posts) ? payload.posts : []);
                        return items
                            .filter(post => post && post.status !== 0 && post.searchable !== false && post.type !== 'video' && post.title && post.link)
                            .map(post => ({ ...post, date: post.updatedAt || post.publishedAt || post.date || '' }))
                            .sort((a, b) => parseDate(b.date) - parseDate(a.date));
                    } catch (error) {
                        lastError = error;
                    }
                }
                throw lastError || new Error('Không tải được dữ liệu bài viết');
            })().catch(error => {
                postsPromise = null;
                throw error;
            });
        }
        return postsPromise;
    }

    function rankPosts(posts, query) {
        const normalized = normalizeText(query);
        if (!normalized) return [];
        const tokens = normalized.split(/\s+/).filter(Boolean);
        const toList = value => Array.isArray(value) ? value : (value ? [value] : []);
        return posts.map(post => {
            const title = normalizeText(post.title);
            const summary = normalizeText(post.summary || post.description || post.excerpt || '');
            const categories = normalizeText([...toList(post.category), ...toList(post.tags), post.type || ''].join(' '));
            const linkText = normalizeText(post.link || '');
            const contentText = normalizeText(post.searchText || '');
            const haystack = `${title} ${summary} ${categories} ${contentText} ${linkText}`;
            if (!tokens.every(token => haystack.includes(token))) return null;
            let score = 0;
            for (const token of tokens) {
                if (title === token) score += 20;
                else if (title.startsWith(token)) score += 13;
                else if (title.includes(token)) score += 9;
                if (categories.includes(token)) score += 4;
                if (summary.includes(token)) score += 2;
                if (contentText.includes(token)) score += 1.5;
                if (linkText.includes(token)) score += 1;
            }
            return { post, score };
        }).filter(Boolean).sort((a, b) => b.score - a.score || parseDate(b.post.date) - parseDate(a.post.date));
    }

    function renderResults(posts, query) {
        const container = document.getElementById('search-results');
        if (!container) return;
        const clean = String(query || '').trim();
        if (!clean) {
            container.innerHTML = '<p class="search-empty">Nhập từ khóa để tìm theo tiêu đề, nội dung, mô tả, danh mục hoặc thẻ.</p>';
            return;
        }
        const ranked = rankPosts(posts, clean);
        const results = ranked.slice(0, 24);
        if (!results.length) {
            container.innerHTML = `<p class="search-empty">Không tìm thấy bài phù hợp với “${escapeHtml(clean)}”. Thử từ khóa ngắn hơn.</p>`;
            return;
        }
        container.innerHTML = `<p class="search-count">Tìm thấy ${ranked.length} kết quả</p>` + results.map(({ post }) => `
            <a class="search-result-item" href="${escapeHtml(ensurePath(post.link))}" data-search-result>
                <img src="${escapeHtml(ensurePath(post.imageUrl, DEFAULT_IMAGE))}" alt="${escapeHtml(post.title)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}'">
                <span><strong>${escapeHtml(post.title)}</strong><p>${escapeHtml(post.summary || '')}</p><small>${escapeHtml(formatDate(post.date))}</small></span>
            </a>`).join('');
    }

    async function refreshResults() {
        const input = document.getElementById('site-search-input');
        const results = document.getElementById('search-results');
        try {
            const posts = await getPosts();
            renderResults(posts, input?.value || '');
        } catch (error) {
            console.error('Không thể tải dữ liệu tìm kiếm:', error);
            if (results) results.innerHTML = '<p class="search-empty">Không thể tải dữ liệu tìm kiếm. Vui lòng thử lại.</p>';
        }
    }

    async function openSearch(event) {
        event?.preventDefault?.();
        const mobileMenu = document.getElementById('mobile-menu-panel');
        if (mobileMenu) {
            mobileMenu.classList.remove('open');
            mobileMenu.hidden = true;
        }
        const mobileMenuButton = document.getElementById('mobile-menu-open');
        mobileMenuButton?.setAttribute('aria-expanded', 'false');
        mobileMenuButton?.classList.remove('active');
        const panel = ensurePanel();
        panel.hidden = false;
        panel.classList.add('open');
        document.body.classList.add('panel-open');
        document.querySelectorAll('[data-search-trigger], .search-open').forEach(button => button.setAttribute('aria-expanded', 'true'));
        const input = document.getElementById('site-search-input');
        window.setTimeout(() => input?.focus({ preventScroll: true }), 30);
        await refreshResults();
        return false;
    }

    function closeSearch(event) {
        event?.preventDefault?.();
        const panel = document.getElementById('search-panel');
        if (panel) {
            panel.classList.remove('open');
            panel.hidden = true;
        }
        document.body.classList.remove('panel-open');
        document.querySelectorAll('[data-search-trigger], .search-open').forEach(button => button.setAttribute('aria-expanded', 'false'));
        return false;
    }

    window.VinhSearchStandalone = true;
    window.VinhSearch = { open: openSearch, close: closeSearch };

    document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-search-trigger], .search-open');
        if (trigger) { event.preventDefault(); openSearch(event); return; }
        if (event.target.closest('[data-close-search]')) { event.preventDefault(); closeSearch(event); return; }
        if (event.target.closest('#clear-search')) {
            event.preventDefault();
            const input = document.getElementById('site-search-input');
            if (input) input.value = '';
            refreshResults();
            input?.focus();
            return;
        }
        if (event.target.closest('#clear-search-history')) {
            event.preventDefault();
            clearHistory();
            return;
        }
        const historyButton = event.target.closest('[data-search-history-term]');
        if (historyButton) {
            event.preventDefault();
            const term = historyButton.dataset.searchHistoryTerm || '';
            const input = document.getElementById('site-search-input');
            if (input) input.value = term;
            rememberTerm(term);
            refreshResults();
            input?.focus();
            return;
        }
        const result = event.target.closest('[data-search-result]');
        if (result) rememberTerm(document.getElementById('site-search-input')?.value || '');
    });

    document.addEventListener('input', event => {
        if (event.target.id !== 'site-search-input') return;
        window.clearTimeout(inputTimer);
        inputTimer = window.setTimeout(refreshResults, 80);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !document.getElementById('search-panel')?.hidden) closeSearch(event);
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(event); }
        if (event.key === 'Enter' && event.target.id === 'site-search-input') {
            event.preventDefault();
            rememberTerm(event.target.value);
            refreshResults();
        }
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensurePanel, { once: true });
    else ensurePanel();
})();
