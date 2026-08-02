(() => {
    'use strict';

    const VERSION = window.VinhSiteVersion?.id || 'dev';
    const SITE_CONFIG_URL = `/data/site-config.json?v=${VERSION}`;
    const BANNER_CONFIG_URL = `/data/banner-config.json?v=${VERSION}`;
    const DEFAULT_CONFIG = {
        schemaVersion: 1,
        sections: { banner: true, featured: true, topics: true, latestFeed: true, sidebar: true },
        banner: { mode: 'mixed', aspectRatio: '3 / 1', autoplay: true, intervalMs: 5500, showArrows: true, showDots: true, holidaySlideEnabled: true, pauseOnHover: true },
        feed: { source: 'new', initialCount: 6, batchSize: 4, maxItems: 20, autoLoad: true, showShare: true },
        holiday: { popupEnabled: true, fireworksEnabled: true, showOncePerDay: true, popupDurationMs: 7500 },
        social: { facebook: 'https://fb.com/tqv2022', messenger: 'https://m.me/tqv2022', zalo: '', tiktok: 'https://www.tiktok.com/@tqv2020', email: '' },
        footer: { text: 'Chia sẻ hướng dẫn thực tế, dễ hiểu dành cho người Việt đang sinh sống tại Nhật Bản.', contactLabel: '', showQuickLinks: true },
        mobileNav: { enabled: true, showLabels: true, labels: { home: 'Trang chủ', latest: 'Mới nhất', search: 'Tìm kiếm', menu: 'Menu' }, icons: { home: '', latest: '', search: '', menu: '' } },
        mobileMenu: { showIntro: true, eyebrow: 'Giới thiệu', title: 'Vinh ở Nhật', text: 'Tin tức, hướng dẫn và công cụ hữu ích dành cho người Việt đang sinh sống tại Nhật Bản.', icons: { posts: 'B', study: '学', downloads: '↓', fun: '▶', rakuten: 'R', seven: '7', sim: 'S', life: '日' } },
        mobileHome: { hideTopics: true, guideTitle: 'Gợi ý thêm' },
        lunar: { showMoon: true, showSolarDate: true, showLunarDate: true },
        banners: []
    };

    let state = structuredClone(DEFAULT_CONFIG);
    let objectUrls = { site: '', banner: '' };

    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));

    function organizeAdminTabs() {
        const tabs = document.querySelector('.cms-tabs');
        const homePanel = $('#homeAdminPanel');
        const postsTab = tabs?.querySelector('[data-cms-tab="posts"]');
        const categoriesTab = tabs?.querySelector('[data-cms-tab="categories"]');
        if (!tabs || !homePanel || $('#bannerAdminPanel')) return;

        const bannerTab = document.createElement('button');
        bannerTab.type = 'button';
        bannerTab.className = 'cms-tab';
        bannerTab.dataset.cmsTab = 'banner';
        bannerTab.textContent = 'Banner';
        tabs.insertBefore(bannerTab, categoriesTab || postsTab || null);

        const bannerPanel = document.createElement('section');
        bannerPanel.id = 'bannerAdminPanel';
        bannerPanel.className = 'cms-panel home-admin-panel';
        bannerPanel.hidden = true;
        bannerPanel.innerHTML = `<div class="home-admin-hero"><div><span>Quảng cáo & ngày lễ</span><h2>Banner trượt</h2><p>Banner được lưu riêng trong <code>data/banner-config.json</code>, nên thay ảnh hoặc đường link không ảnh hưởng bài viết.</p></div><div class="home-admin-hero-actions"><button id="previewBannerConfig" type="button">Xem trước trang chủ</button><a id="downloadBannerConfigTab" download="banner-config.json">Tải banner-config.json</a></div></div><div class="home-admin-grid" id="bannerSettingsGrid"></div>`;
        homePanel.insertAdjacentElement('afterend', bannerPanel);

        const bannerSettings = $('#homeBannerMode')?.closest('.home-settings-card');
        const bannerManager = $('.banner-manager-card');
        if (bannerSettings) $('#bannerSettingsGrid')?.appendChild(bannerSettings);
        if (bannerManager) bannerPanel.appendChild(bannerManager);
        bannerPanel.insertAdjacentHTML('beforeend', `<div class="home-admin-savebar"><span>Ảnh PC và mobile có thể dùng riêng.</span><button id="saveBannerConfigLocal" type="button">Lưu bản đang chỉnh</button><a id="downloadBannerConfigTabBottom" download="banner-config.json">Tải banner</a></div>`);

        const hero = homePanel.querySelector('.home-admin-hero > div:first-child');
        if (hero) hero.innerHTML = '<span>Giao diện & dữ liệu</span><h2>Trang chủ, luồng bài và liên hệ</h2><p>Cấu hình chung nằm trong <code>data/site-config.json</code>. Banner được quản lý ở tab riêng.</p>';
        homePanel.querySelector('#downloadBannerConfig')?.remove();
        homePanel.querySelector('#downloadBannerConfigBottom')?.remove();

        [...homePanel.querySelectorAll('.settings-number')].forEach((node, index) => node.textContent = String(index + 1));
        [...bannerPanel.querySelectorAll('.settings-number')].forEach((node, index) => node.textContent = String(index + 1));
    }

    function escapeHtml(value = '') {
        return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
    }

    function mergeConfig(data) {
        const input = data && typeof data === 'object' ? data : {};
        return {
            ...DEFAULT_CONFIG,
            ...input,
            schemaVersion: 1,
            sections: { ...DEFAULT_CONFIG.sections, ...(input.sections || {}) },
            banner: { ...DEFAULT_CONFIG.banner, ...(input.banner || {}) },
            feed: { ...DEFAULT_CONFIG.feed, ...(input.feed || {}) },
            holiday: { ...DEFAULT_CONFIG.holiday, ...(input.holiday || {}) },
            social: { ...DEFAULT_CONFIG.social, ...(input.social || {}) },
            footer: { ...DEFAULT_CONFIG.footer, ...(input.footer || {}) },
            mobileNav: {
                ...DEFAULT_CONFIG.mobileNav,
                ...(input.mobileNav || {}),
                labels: { ...DEFAULT_CONFIG.mobileNav.labels, ...(input.mobileNav?.labels || {}) },
                icons: { ...DEFAULT_CONFIG.mobileNav.icons, ...(input.mobileNav?.icons || {}) }
            },
            mobileMenu: {
                ...DEFAULT_CONFIG.mobileMenu,
                ...(input.mobileMenu || {}),
                icons: { ...DEFAULT_CONFIG.mobileMenu.icons, ...(input.mobileMenu?.icons || {}) }
            },
            mobileHome: { ...DEFAULT_CONFIG.mobileHome, ...(input.mobileHome || {}) },
            lunar: { ...DEFAULT_CONFIG.lunar, ...(input.lunar || {}) },
            banners: Array.isArray(input.banners) ? input.banners : []
        };
    }

    function id(prefix = 'banner') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }

    function numberValue(selector, fallback) {
        const value = Number($(selector)?.value);
        return Number.isFinite(value) ? value : fallback;
    }

    function setChecked(selector, value) {
        const node = $(selector);
        if (node) node.checked = Boolean(value);
    }

    function setValue(selector, value) {
        const node = $(selector);
        if (node) node.value = value ?? '';
    }

    function fillSettings() {
        setChecked('#homeSectionBanner', state.sections.banner);
        setChecked('#homeSectionFeatured', state.sections.featured);
        setChecked('#homeSectionLatest', state.sections.latestFeed);
        setChecked('#homeSectionTopics', state.sections.topics);
        setChecked('#homeSectionSidebar', state.sections.sidebar);
        setValue('#homeBannerMode', state.banner.mode);
        setValue('#homeBannerAspect', state.banner.aspectRatio || '3 / 1');
        setValue('#homeBannerInterval', Number(state.banner.intervalMs || 5500) / 1000);
        setChecked('#homeBannerAutoplay', state.banner.autoplay);
        setChecked('#homeBannerArrows', state.banner.showArrows);
        setChecked('#homeBannerDots', state.banner.showDots);
        setChecked('#homeHolidaySlide', state.banner.holidaySlideEnabled);
        setValue('#homeFeedSource', state.feed.source);
        setValue('#homeFeedInitial', state.feed.initialCount);
        setValue('#homeFeedBatch', state.feed.batchSize);
        setValue('#homeFeedMax', state.feed.maxItems);
        setChecked('#homeFeedAuto', state.feed.autoLoad);
        setChecked('#homeFeedShare', state.feed.showShare);
        setValue('#homeHolidayDuration', Number(state.holiday.popupDurationMs || 7500) / 1000);
        setChecked('#homeHolidayPopup', state.holiday.popupEnabled);
        setChecked('#homeHolidayFireworks', state.holiday.fireworksEnabled);
        setChecked('#homeHolidayOnce', state.holiday.showOncePerDay);
        setValue('#homeSocialFacebook', state.social.facebook);
        setValue('#homeSocialMessenger', state.social.messenger);
        setValue('#homeSocialZalo', state.social.zalo);
        setValue('#homeSocialTiktok', state.social.tiktok);
        setValue('#homeSocialEmail', state.social.email);
        setValue('#homeFooterText', state.footer.text);
        setChecked('#homeFooterQuickLinks', state.footer.showQuickLinks);
        setChecked('#homeMobileNavEnabled', state.mobileNav.enabled);
        setChecked('#homeMobileNavLabels', state.mobileNav.showLabels);
        setValue('#homeMobileLabelHome', state.mobileNav.labels.home);
        setValue('#homeMobileLabelLatest', state.mobileNav.labels.latest);
        setValue('#homeMobileLabelSearch', state.mobileNav.labels.search);
        setValue('#homeMobileLabelMenu', state.mobileNav.labels.menu);
        setValue('#homeMobileIconHome', state.mobileNav.icons.home);
        setValue('#homeMobileIconLatest', state.mobileNav.icons.latest);
        setValue('#homeMobileIconSearch', state.mobileNav.icons.search);
        setValue('#homeMobileIconMenu', state.mobileNav.icons.menu);
        setChecked('#homeMobileMenuIntro', state.mobileMenu.showIntro);
        setValue('#homeMobileMenuEyebrow', state.mobileMenu.eyebrow);
        setValue('#homeMobileMenuTitle', state.mobileMenu.title);
        setValue('#homeMobileMenuText', state.mobileMenu.text);
        setValue('#homeMenuIconPosts', state.mobileMenu.icons.posts);
        setValue('#homeMenuIconStudy', state.mobileMenu.icons.study);
        setValue('#homeMenuIconDownloads', state.mobileMenu.icons.downloads);
        setValue('#homeMenuIconFun', state.mobileMenu.icons.fun);
        setValue('#homeMenuIconRakuten', state.mobileMenu.icons.rakuten);
        setValue('#homeMenuIconSeven', state.mobileMenu.icons.seven);
        setValue('#homeMenuIconSim', state.mobileMenu.icons.sim);
        setValue('#homeMenuIconLife', state.mobileMenu.icons.life);
        setChecked('#homeMobileHideTopics', state.mobileHome.hideTopics);
        setValue('#homeMobileGuideTitle', state.mobileHome.guideTitle);
        setChecked('#homeLunarMoon', state.lunar.showMoon);
        setChecked('#homeLunarSolar', state.lunar.showSolarDate);
        setChecked('#homeLunarDate', state.lunar.showLunarDate);
    }

    function readSettings() {
        state.schemaVersion = 1;
        state.sections = {
            banner: $('#homeSectionBanner')?.checked ?? true,
            featured: $('#homeSectionFeatured')?.checked ?? true,
            latestFeed: $('#homeSectionLatest')?.checked ?? true,
            topics: $('#homeSectionTopics')?.checked ?? true,
            sidebar: $('#homeSectionSidebar')?.checked ?? true
        };
        state.banner = {
            ...state.banner,
            mode: $('#homeBannerMode')?.value || 'mixed',
            aspectRatio: $('#homeBannerAspect')?.value || '3 / 1',
            autoplay: $('#homeBannerAutoplay')?.checked ?? true,
            intervalMs: Math.round(numberValue('#homeBannerInterval', 5.5) * 1000),
            showArrows: $('#homeBannerArrows')?.checked ?? true,
            showDots: $('#homeBannerDots')?.checked ?? true,
            holidaySlideEnabled: $('#homeHolidaySlide')?.checked ?? true,
            pauseOnHover: true
        };
        state.feed = {
            source: $('#homeFeedSource')?.value || 'new',
            initialCount: numberValue('#homeFeedInitial', 6),
            batchSize: numberValue('#homeFeedBatch', 4),
            maxItems: numberValue('#homeFeedMax', 20),
            autoLoad: $('#homeFeedAuto')?.checked ?? true,
            showShare: $('#homeFeedShare')?.checked ?? true
        };
        state.holiday = {
            popupEnabled: $('#homeHolidayPopup')?.checked ?? true,
            fireworksEnabled: $('#homeHolidayFireworks')?.checked ?? true,
            showOncePerDay: $('#homeHolidayOnce')?.checked ?? true,
            popupDurationMs: Math.round(numberValue('#homeHolidayDuration', 7.5) * 1000)
        };
        state.social = {
            facebook: $('#homeSocialFacebook')?.value?.trim() || '',
            messenger: $('#homeSocialMessenger')?.value?.trim() || '',
            zalo: $('#homeSocialZalo')?.value?.trim() || '',
            tiktok: $('#homeSocialTiktok')?.value?.trim() || '',
            email: $('#homeSocialEmail')?.value?.trim() || ''
        };
        state.footer = {
            text: $('#homeFooterText')?.value?.trim() || '',
            contactLabel: '',
            showQuickLinks: $('#homeFooterQuickLinks')?.checked ?? true
        };
        state.mobileNav = {
            enabled: $('#homeMobileNavEnabled')?.checked ?? true,
            showLabels: $('#homeMobileNavLabels')?.checked ?? true,
            labels: {
                home: $('#homeMobileLabelHome')?.value?.trim() || 'Trang chủ',
                latest: $('#homeMobileLabelLatest')?.value?.trim() || 'Mới nhất',
                search: $('#homeMobileLabelSearch')?.value?.trim() || 'Tìm kiếm',
                menu: $('#homeMobileLabelMenu')?.value?.trim() || 'Menu'
            },
            icons: {
                home: $('#homeMobileIconHome')?.value?.trim() || '',
                latest: $('#homeMobileIconLatest')?.value?.trim() || '',
                search: $('#homeMobileIconSearch')?.value?.trim() || '',
                menu: $('#homeMobileIconMenu')?.value?.trim() || ''
            }
        };
        state.mobileMenu = {
            showIntro: $('#homeMobileMenuIntro')?.checked ?? true,
            eyebrow: $('#homeMobileMenuEyebrow')?.value?.trim() || 'Giới thiệu',
            title: $('#homeMobileMenuTitle')?.value?.trim() || 'Vinh ở Nhật',
            text: $('#homeMobileMenuText')?.value?.trim() || '',
            icons: {
                posts: $('#homeMenuIconPosts')?.value?.trim() || 'B',
                study: $('#homeMenuIconStudy')?.value?.trim() || '学',
                downloads: $('#homeMenuIconDownloads')?.value?.trim() || '↓',
                fun: $('#homeMenuIconFun')?.value?.trim() || '▶',
                rakuten: $('#homeMenuIconRakuten')?.value?.trim() || 'R',
                seven: $('#homeMenuIconSeven')?.value?.trim() || '7',
                sim: $('#homeMenuIconSim')?.value?.trim() || 'S',
                life: $('#homeMenuIconLife')?.value?.trim() || '日'
            }
        };
        state.mobileHome = {
            hideTopics: $('#homeMobileHideTopics')?.checked ?? true,
            guideTitle: $('#homeMobileGuideTitle')?.value?.trim() || 'Gợi ý thêm'
        };
        state.lunar = {
            showMoon: $('#homeLunarMoon')?.checked ?? true,
            showSolarDate: $('#homeLunarSolar')?.checked ?? true,
            showLunarDate: $('#homeLunarDate')?.checked ?? true
        };
    }

    function bannerCard(banner, index) {
        return `<article class="home-banner-admin-card" data-banner-id="${escapeHtml(banner.id)}">
            <header>
                <div class="banner-admin-index"><span>${index + 1}</span><div><strong>${escapeHtml(banner.title || 'Banner chưa đặt tên')}</strong><small>${banner.enabled === false ? 'Đang tắt' : 'Đang hiển thị'}</small></div></div>
                <div class="banner-admin-tools">
                    <button type="button" data-banner-move="up" title="Đưa lên">↑</button>
                    <button type="button" data-banner-move="down" title="Đưa xuống">↓</button>
                    <button type="button" data-banner-remove title="Xóa">×</button>
                </div>
            </header>
            <div class="banner-admin-body">
                <label class="banner-enabled"><input type="checkbox" data-banner-field="enabled" ${banner.enabled === false ? '' : 'checked'}><span>Bật banner này</span></label>
                <label>Tên banner<input type="text" data-banner-field="title" value="${escapeHtml(banner.title || '')}" placeholder="SIM data Nhật Bản"></label>
                <div class="banner-admin-grid two">
                    <label>Ảnh PC<input type="text" data-banner-field="imageDesktop" value="${escapeHtml(banner.imageDesktop || '')}" placeholder="/img/ads/banner-pc.jpg"></label>
                    <label>Ảnh mobile<input type="text" data-banner-field="imageMobile" value="${escapeHtml(banner.imageMobile || '')}" placeholder="Để trống sẽ dùng ảnh PC"></label>
                </div>
                <div class="banner-admin-grid two">
                    <label>Link mở khi nhấn vào ảnh<input type="text" data-banner-field="actionUrl" value="${escapeHtml(banner.actionUrl || '')}" placeholder="/pages/... hoặc https://..."></label>
                    <label class="banner-enabled"><input type="checkbox" data-banner-field="newTab" ${banner.newTab ? 'checked' : ''}><span>Mở link ở tab mới</span></label>
                </div>
                <p class="banner-admin-note">Không còn popup nhập thông tin. Banner chỉ mở đúng đường link anh gắn khi người xem nhấn vào ảnh.</p>
            </div>
        </article>`;
    }

    function renderBanners() {
        const list = $('#homeBannerList');
        if (!list) return;
        list.innerHTML = state.banners.length
            ? state.banners.map(bannerCard).join('')
            : '<div class="home-banner-admin-empty"><strong>Chưa có banner quảng cáo</strong><p>Nhấn “Thêm banner” để tạo quảng cáo SIM hoặc dịch vụ.</p></div>';
    }

    function collectBannerCard(card) {
        const banner = state.banners.find(item => item.id === card.dataset.bannerId);
        if (!banner) return;
        card.querySelectorAll('[data-banner-field]').forEach(input => {
            const key = input.dataset.bannerField;
            banner[key] = input.type === 'checkbox' ? input.checked : input.value;
        });
    }

    function collectAll() {
        readSettings();
        $$('.home-banner-admin-card').forEach(collectBannerCard);
        return state;
    }

    function makeJsonUrl(key, value) {
        if (objectUrls[key]) URL.revokeObjectURL(objectUrls[key]);
        objectUrls[key] = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2) + '\n'], { type: 'application/json;charset=utf-8' }));
        return objectUrls[key];
    }

    function updateDownloadLinks() {
        collectAll();
        const siteConfig = {
            schemaVersion: 1,
            sections: state.sections,
            feed: state.feed,
            holiday: state.holiday,
            social: state.social,
            footer: state.footer,
            mobileNav: state.mobileNav,
            mobileMenu: state.mobileMenu,
            mobileHome: state.mobileHome,
            lunar: state.lunar
        };
        const bannerConfig = { schemaVersion: 1, enabled: state.sections.banner !== false, settings: state.banner, items: state.banners };
        const urls = { site: makeJsonUrl('site', siteConfig), banner: makeJsonUrl('banner', bannerConfig) };
        [['#downloadSiteConfig','site-config.json','site'],['#downloadSiteConfigBottom','site-config.json','site'],['#downloadBannerConfig','banner-config.json','banner'],['#downloadBannerConfigBottom','banner-config.json','banner'],['#downloadBannerConfigTab','banner-config.json','banner'],['#downloadBannerConfigTabBottom','banner-config.json','banner']].forEach(([selector, filename, key]) => {
            const link = $(selector); if (link) { link.href = urls[key]; link.download = filename; }
        });
        const status = $('#homeConfigStatus');
        if (status) status.textContent = `${state.banners.filter(item => item.enabled !== false).length} banner đang bật · giới hạn ${state.feed.maxItems} bài · dữ liệu đã tách 3 lớp`;
    }

    function saveDraft() {
        collectAll();
        localStorage.setItem('vinh-home-admin-draft', JSON.stringify(state));
        updateDownloadLinks();
        const status = $('#homeConfigStatus');
        if (status) status.textContent = 'Đã lưu bản đang chỉnh trên trình duyệt này.';
    }

    function addBanner() {
        collectAll();
        state.banners.push({
            id: id(), enabled: true, kind: 'ad', title: 'Banner quảng cáo mới', description: '',
            imageDesktop: '', imageMobile: '', actionUrl: '', newTab: false
        });
        renderBanners();
        updateDownloadLinks();
        document.querySelector('.home-banner-admin-card:last-child')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function moveBanner(card, direction) {
        collectAll();
        const index = state.banners.findIndex(item => item.id === card.dataset.bannerId);
        const next = direction === 'up' ? index - 1 : index + 1;
        if (index < 0 || next < 0 || next >= state.banners.length) return;
        [state.banners[index], state.banners[next]] = [state.banners[next], state.banners[index]];
        renderBanners();
        updateDownloadLinks();
    }

    function removeBanner(card) {
        const banner = state.banners.find(item => item.id === card.dataset.bannerId);
        if (!banner || !confirm(`Xóa banner “${banner.title || 'chưa đặt tên'}”?`)) return;
        state.banners = state.banners.filter(item => item.id !== banner.id);
        renderBanners();
        updateDownloadLinks();
    }

    function switchTab(tab) {
        $$('.cms-tab').forEach(button => button.classList.toggle('active', button.dataset.cmsTab === tab));
        const home = $('#homeAdminPanel');
        const banner = $('#bannerAdminPanel');
        const categories = $('#categoriesAdminPanel');
        const posts = $('#postsAdminPanel');
        if (home) home.hidden = tab !== 'home';
        if (banner) banner.hidden = tab !== 'banner';
        if (categories) categories.hidden = tab !== 'categories';
        if (posts) posts.hidden = tab !== 'posts';
        localStorage.setItem('vinh-admin-tab', tab);
    }

    function bindEvents() {
        document.addEventListener('click', event => {
            const tab = event.target.closest('[data-cms-tab]');
            if (tab) { switchTab(tab.dataset.cmsTab); return; }
            if (event.target.closest('#addHomeBanner')) { addBanner(); return; }
            if (event.target.closest('#saveHomeConfigLocal, #saveBannerConfigLocal')) { saveDraft(); return; }
            if (event.target.closest('#previewHomeConfig, #previewBannerConfig')) {
                collectAll();
                localStorage.setItem('vinh-home-admin-preview', JSON.stringify(state));
                window.open('/?homePreview=1', '_blank', 'noopener');
                return;
            }
            const card = event.target.closest('.home-banner-admin-card');
            if (!card) return;
            const move = event.target.closest('[data-banner-move]');
            if (move) { moveBanner(card, move.dataset.bannerMove); return; }
            if (event.target.closest('[data-banner-remove]')) removeBanner(card);
        });

        document.addEventListener('input', event => {
            if (event.target.closest('#homeAdminPanel, #bannerAdminPanel')) {
                const card = event.target.closest('.home-banner-admin-card');
                if (card) collectBannerCard(card);
                updateDownloadLinks();
            }
        });
        document.addEventListener('change', event => {
            if (event.target.closest('#homeAdminPanel, #bannerAdminPanel')) updateDownloadLinks();
        });

        $('#importHomeConfig')?.addEventListener('change', async event => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const parsed = JSON.parse(await file.text());
                if (parsed && (parsed.settings || parsed.items)) {
                    state = mergeConfig({ ...state, banner: parsed.settings || state.banner, banners: parsed.items || state.banners, sections: { ...state.sections, banner: parsed.enabled !== false } });
                } else if (parsed && parsed.sections && !parsed.banners) {
                    state = mergeConfig({ ...state, ...parsed, banner: state.banner, banners: state.banners });
                } else {
                    state = mergeConfig(parsed);
                }
                fillSettings(); renderBanners(); updateDownloadLinks();
                $('#homeConfigStatus').textContent = `Đã nhập ${file.name}.`;
            } catch (error) {
                alert('File cấu hình không hợp lệ.');
            } finally {
                event.target.value = '';
            }
        });
    }


    function bindHolidayPreview() {
        const button = $('#previewHolidayBanner');
        if (!button || button.dataset.bound === '1') return;
        button.dataset.bound = '1';
        button.addEventListener('click', () => {
            const id = $('#homeHolidayPreview')?.value || '0902';
            const url = new URL('/', location.origin);
            url.searchParams.set('holidayTest', id);
            url.searchParams.set('_preview', Date.now().toString());
            window.open(url.href, '_blank', 'noopener');
        });
    }
    async function init() {
        organizeAdminTabs();
        bindEvents();
        const savedTab = localStorage.getItem('vinh-admin-tab');
        switchTab(['home', 'banner', 'categories', 'posts'].includes(savedTab) ? savedTab : 'home');
        try {
            const [siteResponse, bannerResponse] = await Promise.all([
                fetch(SITE_CONFIG_URL, { cache: 'no-cache' }),
                fetch(BANNER_CONFIG_URL, { cache: 'no-cache' })
            ]);
            if (!siteResponse.ok || !bannerResponse.ok) throw new Error('Không tải được cấu hình tách');
            const site = await siteResponse.json();
            const banner = await bannerResponse.json();
            state = mergeConfig({ ...site, banner: banner.settings || {}, banners: banner.items || [], sections: { ...(site.sections || {}), banner: banner.enabled !== false } });
        } catch (error) {
            console.warn('Không tải được site-config.json hoặc banner-config.json:', error);
            const draft = localStorage.getItem('vinh-home-admin-draft');
            if (draft) {
                try { state = mergeConfig(JSON.parse(draft)); }
                catch (parseError) { state = structuredClone(DEFAULT_CONFIG); }
            } else {
                state = structuredClone(DEFAULT_CONFIG);
            }
        }
        fillSettings();
        renderBanners();
        bindHolidayPreview();
        updateDownloadLinks();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
