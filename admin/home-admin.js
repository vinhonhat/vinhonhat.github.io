(() => {
    'use strict';

    const VERSION = window.VinhSiteVersion?.id || 'dev';
    const SITE_CONFIG_URL = `/data/site-config.json?v=${VERSION}`;
    const BANNER_CONFIG_URL = `/data/banner-config.json?v=${VERSION}`;


    function parseAdminHolidayTest(source = window.location) {
        const params = new URLSearchParams(String(source?.search || ''));
        const normalize = value => {
            const id = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
            return id === '1109' ? '1119' : id;
        };
        const directFireworks = params.get('testfireworks') || params.get('testfirework') || params.get('testphaohoa');
        const directHoliday = params.get('holidayTest') || params.get('testholiday') || params.get('testholyday');
        if (directFireworks) return { id: normalize(directFireworks), mode: 'fireworks' };
        if (directHoliday) return { id: normalize(directHoliday), mode: 'holiday' };
        const tokens = [...params.keys(), decodeURIComponent(String(source?.hash || '').replace(/^#/, ''))].filter(Boolean);
        for (const raw of tokens) {
            const token = String(raw).trim().toLowerCase();
            let match = token.match(/^test(?:fireworks?|phaohoa)([a-z0-9_-]+)$/i);
            if (match) return { id: normalize(match[1]), mode: 'fireworks' };
            match = token.match(/^test(?:holiday|holyday)([a-z0-9_-]+)$/i);
            if (match) return { id: normalize(match[1]), mode: 'holiday' };
        }
        return null;
    }

    const ADMIN_HOLIDAY_TEST = parseAdminHolidayTest();
    if (ADMIN_HOLIDAY_TEST?.id) {
        const token = `${ADMIN_HOLIDAY_TEST.mode === 'fireworks' ? 'testfireworks' : 'testholiday'}${ADMIN_HOLIDAY_TEST.id}`;
        window.location.replace(`${window.location.origin}/?${token}`);
        return;
    }
    const DEFAULT_CONFIG = {
        schemaVersion: 1,
        sections: { banner: true, featured: true, topics: true, latestFeed: true, sidebar: true },
        banner: { mode: 'mixed', aspectRatio: '3 / 1', autoplay: true, intervalMs: 5500, showArrows: true, showDots: true, dragEnabled: true, holidaySlideEnabled: true, holidayBeforeDays: 45, holidayAfterDays: 10, holidayPosition: 'after-ads', holidayMaxSlides: 2, holidayEnabledIds: ["0101", "tet", "0203", "0227", "0308", "0310", "0326", "0430", "0501", "0519", "0601", "0727", "0815", "0902", "1020", "1119", "1120", "1124", "1222", "1224"], pauseOnHover: true },
        feed: { source: 'new', initialCount: 6, batchSize: 4, maxItems: 20, autoLoad: true, showShare: true },
        holiday: { popupEnabled: true, popupBeforeDays: 0, popupAfterDays: 0, fireworksEnabled: true, showOncePerDay: true, popupDurationMs: 7500 },
        social: { facebook: 'https://fb.com/tqv2022', messenger: 'https://m.me/tqv2022', zalo: '', tiktok: 'https://www.tiktok.com/@tqv2020', email: '' },
        footer: { text: 'Chia sẻ hướng dẫn thực tế, dễ hiểu dành cho người Việt đang sinh sống tại Nhật Bản.', contactLabel: '', showQuickLinks: true },
        mobileNav: { enabled: true, showLabels: false, labels: { home: 'Trang chủ', latest: 'Mới nhất', search: 'Tìm kiếm', menu: 'Menu' }, icons: { home: '', latest: '', search: '', menu: '' } },
        mobileMenu: { showIntro: true, eyebrow: '', title: 'Vinh ở Nhật', text: '', icons: { posts: 'B', study: '学', downloads: '↓', fun: '▶', rakuten: 'R', seven: '7', sim: 'S', life: '日' } },
        mobileHome: { hideTopics: false, guideTitle: 'Gợi ý thêm' },
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
        bannerPanel.innerHTML = `<div class="home-admin-hero"><div><span>Quảng cáo & ngày lễ</span><h2>Banner, popup và pháo hoa</h2><p>Toàn bộ cài đặt banner và ngày lễ được lưu trong <code>data/banner-config.json</code>.</p></div><div class="home-admin-hero-actions"><button id="previewBannerConfig" type="button">Xem trước trang chủ</button><label class="home-config-import">Nhập banner-config.json<input id="importBannerConfig" type="file" accept="application/json,.json"></label><a id="downloadBannerConfigTab" download="banner-config.json">Tải banner-config.json</a></div></div><div class="home-admin-grid" id="bannerSettingsGrid"></div>`;
        homePanel.insertAdjacentElement('afterend', bannerPanel);

        const bannerSettings = $('#homeBannerMode')?.closest('.home-settings-card');
        const holidaySettings = $('#homeHolidayDuration')?.closest('.home-settings-card');
        const bannerManager = $('.banner-manager-card');
        if (bannerSettings) $('#bannerSettingsGrid')?.appendChild(bannerSettings);
        if (holidaySettings) $('#bannerSettingsGrid')?.appendChild(holidaySettings);
        if (bannerManager) bannerPanel.appendChild(bannerManager);
        bannerPanel.insertAdjacentHTML('beforeend', `<div class="home-admin-savebar"><span>Banner, popup và pháo hoa được xuất chung trong banner-config.json.</span><button id="saveBannerConfigLocal" type="button">Lưu bản đang chỉnh</button><a id="downloadBannerConfigTabBottom" download="banner-config.json">Tải banner</a></div>`);

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


    const HOLIDAY_BANNER_CODES = ['0101','tet','0203','0227','0308','0310','0326','0430','0501','43051','0519','0601','0727','0815','0902','1020','1119','1120','1124','1222','1224'];
    const HOLIDAY_BANNER_LABELS = Object.freeze({
        '0101': 'Tết Dương lịch',
        'tet': 'Tết Âm lịch',
        '0203': 'Thành lập Đảng',
        '0227': 'Thầy thuốc Việt Nam',
        '0308': 'Quốc tế Phụ nữ',
        '0310': 'Giỗ Tổ Hùng Vương',
        '0326': 'Đoàn TNCS',
        '0430': 'Giải phóng miền Nam 30/4',
        '0501': 'Quốc tế Lao động 1/5',
        '43051': 'Ảnh dùng chung 30/4 & 1/5',
        '0519': 'Ngày sinh Bác Hồ',
        '0601': 'Quốc tế Thiếu nhi',
        '0727': 'Thương binh Liệt sĩ',
        '0815': 'Trung Thu',
        '0902': 'Quốc khánh 2/9',
        '1020': 'Phụ nữ Việt Nam',
        '1119': 'Quốc tế Nam giới',
        '1120': 'Nhà giáo Việt Nam',
        '1124': 'Văn hóa Việt Nam',
        '1222': 'Quân đội Nhân dân',
        '1224': 'Giáng Sinh'
    });
    const normalizeHolidayBannerCode = value => String(value) === '1109' ? '1119' : String(value);
    const holidayBannerLabel = code => `${code} — ${HOLIDAY_BANNER_LABELS[code] || 'Ngày lễ'}`;

    function normalizeAprilMayBannerSelection(values) {
        const ids = [...new Set((Array.isArray(values) ? values : []).map(normalizeHolidayBannerCode))];
        if (ids.includes('43051')) return ids.filter(id => id !== '0430' && id !== '0501');
        return ids;
    }

    function enforceAprilMayBannerChoice(changedCode = '') {
        const combined = document.querySelector('[data-holiday-banner-id="43051"]');
        const april = document.querySelector('[data-holiday-banner-id="0430"]');
        const may = document.querySelector('[data-holiday-banner-id="0501"]');
        if (!combined || !april || !may) return;
        if (changedCode === '43051' && combined.checked) {
            april.checked = false;
            may.checked = false;
            return;
        }
        if ((changedCode === '0430' || changedCode === '0501') && (april.checked || may.checked)) {
            combined.checked = false;
            return;
        }
        if (combined.checked) {
            april.checked = false;
            may.checked = false;
        }
    }

    function bannerImageExists(url) {
        return new Promise(resolve => {
            const image = new Image();
            let done = false;
            const finish = value => {
                if (done) return;
                done = true;
                image.onload = null;
                image.onerror = null;
                resolve(value);
            };
            image.onload = () => finish(true);
            image.onerror = () => finish(false);
            image.src = `${url}${url.includes('?') ? '&' : '?'}_check=${Date.now()}`;
            window.setTimeout(() => finish(false), 4500);
        });
    }

    async function checkHolidayBannerFiles() {
        const button = $('#checkHolidayBannerFiles');
        const status = $('#holidayBannerFileStatus');
        if (!button || !status) return;
        button.disabled = true;
        status.textContent = 'Đang kiểm tra ảnh trong /img/banners/...';
        const selected = $$('[data-holiday-banner-id]:checked').map(input => normalizeHolidayBannerCode(input.dataset.holidayBannerId));
        const codes = selected.length ? selected : HOLIDAY_BANNER_CODES;
        const results = await Promise.all(codes.map(async code => {
            const [png, jpg] = await Promise.all([
                bannerImageExists(`/img/banners/${code}.png`),
                bannerImageExists(`/img/banners/${code}.jpg`)
            ]);
            return { code, found: png || jpg };
        }));
        const found = results.filter(item => item.found).map(item => item.code);
        const missing = results.filter(item => !item.found).map(item => item.code);
        const missingText = missing.map(holidayBannerLabel).join(', ');
        status.innerHTML = `Tìm thấy <strong>${found.length}/${codes.length}</strong> mã ảnh lễ. Giới hạn lễ không tính banner quảng cáo.${missing.length ? ` Thiếu: <code>${missingText}</code>.` : ''}`;
        button.disabled = false;
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
        setChecked('#homeBannerDrag', state.banner.dragEnabled !== false);
        setChecked('#homeHolidaySlide', state.banner.holidaySlideEnabled);
        setValue('#homeHolidayBannerPosition', state.banner.holidayPosition || 'after-ads');
        setValue('#homeHolidayBannerBefore', state.banner.holidayBeforeDays ?? 45);
        setValue('#homeHolidayBannerAfter', state.banner.holidayAfterDays ?? 10);
        setValue('#homeHolidayBannerMax', state.banner.holidayMaxSlides ?? 2);
        const enabledHolidayIds = new Set(normalizeAprilMayBannerSelection(Array.isArray(state.banner.holidayEnabledIds) ? state.banner.holidayEnabledIds : ["0101", "tet", "0203", "0227", "0308", "0310", "0326", "0430", "0501", "0519", "0601", "0727", "0815", "0902", "1020", "1119", "1120", "1124", "1222", "1224"]));
        $$('[data-holiday-banner-id]').forEach(input => { input.checked = enabledHolidayIds.has(input.dataset.holidayBannerId); });
        enforceAprilMayBannerChoice(enabledHolidayIds.has('43051') ? '43051' : '');
        setValue('#homeFeedSource', state.feed.source);
        setValue('#homeFeedInitial', state.feed.initialCount);
        setValue('#homeFeedBatch', state.feed.batchSize);
        setValue('#homeFeedMax', state.feed.maxItems);
        setChecked('#homeFeedAuto', state.feed.autoLoad);
        setChecked('#homeFeedShare', state.feed.showShare);
        setValue('#homeHolidayDuration', Number(state.holiday.popupDurationMs || 7500) / 1000);
        setValue('#homeHolidayPopupBefore', state.holiday.popupBeforeDays ?? 0);
        setValue('#homeHolidayPopupAfter', state.holiday.popupAfterDays ?? 0);
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
        enforceAprilMayBannerChoice();
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
            dragEnabled: $('#homeBannerDrag')?.checked ?? true,
            holidaySlideEnabled: $('#homeHolidaySlide')?.checked ?? true,
            holidayBeforeDays: numberValue('#homeHolidayBannerBefore', 45),
            holidayAfterDays: numberValue('#homeHolidayBannerAfter', 10),
            holidayPosition: $('#homeHolidayBannerPosition')?.value || 'after-ads',
            holidayMaxSlides: numberValue('#homeHolidayBannerMax', 2),
            holidayEnabledIds: normalizeAprilMayBannerSelection($$('[data-holiday-banner-id]:checked').map(input => input.dataset.holidayBannerId)),
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
            popupBeforeDays: numberValue('#homeHolidayPopupBefore', 0),
            popupAfterDays: numberValue('#homeHolidayPopupAfter', 0),
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
            showLabels: $('#homeMobileNavLabels')?.checked ?? false,
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
            hideTopics: $('#homeMobileHideTopics')?.checked ?? false,
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
                <span class="banner-admin-number">${index + 1}</span>
                <label class="banner-header-toggle" title="Bật/tắt banner"><input type="checkbox" data-banner-field="enabled" ${banner.enabled === false ? '' : 'checked'}><span></span></label>
                <label class="banner-header-title"><span class="sr-only">Tên banner</span><input type="text" data-banner-field="title" value="${escapeHtml(banner.title || '')}" placeholder="Tên banner"></label>
                <small class="banner-header-status">${banner.enabled === false ? 'Đang tắt' : 'Đang bật'}</small>
                <div class="banner-admin-tools">
                    <button type="button" data-banner-move="up" title="Đưa lên một vị trí">↑</button>
                    <button type="button" data-banner-move="down" title="Đưa xuống một vị trí">↓</button>
                    <button type="button" data-banner-remove title="Xóa">×</button>
                </div>
            </header>
            <div class="banner-admin-body">
                <div class="banner-admin-grid three">
                    <label>Ảnh PC<input type="text" data-banner-field="imageDesktop" value="${escapeHtml(banner.imageDesktop || '')}" placeholder="/img/ads/banner-pc.jpg"></label>
                    <label>Ảnh mobile<input type="text" data-banner-field="imageMobile" value="${escapeHtml(banner.imageMobile || '')}" placeholder="Để trống sẽ dùng ảnh PC"></label>
                    <label>Link khi nhấn ảnh<input type="text" data-banner-field="actionUrl" value="${escapeHtml(banner.actionUrl || '')}" placeholder="/pages/... hoặc https://..."></label>
                </div>
                <div class="banner-admin-compact-row">
                    <label class="banner-enabled"><input type="checkbox" data-banner-field="newTab" ${banner.newTab ? 'checked' : ''}><span>Mở link ở tab mới</span></label>
                    <p class="banner-admin-note">Nhấn trực tiếp vào ảnh để mở đường link đã gắn.</p>
                </div>
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

    function moveBannerById(idValue, direction, options = {}) {
        const index = state.banners.findIndex(item => item.id === idValue);
        const next = direction === 'up' ? index - 1 : index + 1;
        if (index < 0 || next < 0 || next >= state.banners.length) return false;
        [state.banners[index], state.banners[next]] = [state.banners[next], state.banners[index]];
        renderBanners();
        updateDownloadLinks();
        if (options.follow !== false) {
            requestAnimationFrame(() => {
                const moved = document.querySelector(`.home-banner-admin-card[data-banner-id="${CSS.escape(idValue)}"]`);
                moved?.classList.add('is-reordered');
                moved?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                window.setTimeout(() => moved?.classList.remove('is-reordered'), 900);
            });
        }
        return true;
    }

    function collectBannerCard(card) {
        const banner = state.banners.find(item => item.id === card.dataset.bannerId);
        if (!banner) return;
        card.querySelectorAll('[data-banner-field]').forEach(input => {
            const key = input.dataset.bannerField;
            banner[key] = input.type === 'checkbox' ? input.checked : input.value;
        });
        const status = card.querySelector('.banner-header-status');
        if (status) status.textContent = banner.enabled === false ? 'Đang tắt' : 'Đang bật';
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
            schemaVersion: 3,
            sections: state.sections,
            feed: state.feed,
            social: state.social,
            footer: state.footer,
            mobileNav: state.mobileNav,
            mobileMenu: state.mobileMenu,
            mobileHome: state.mobileHome,
            lunar: state.lunar
        };
        const bannerConfig = { schemaVersion: 5, enabled: state.sections.banner !== false, settings: state.banner, holiday: state.holiday, items: state.banners };
        const urls = { site: makeJsonUrl('site', siteConfig), banner: makeJsonUrl('banner', bannerConfig) };
        [['#downloadSiteConfig','site-config.json','site'],['#downloadSiteConfigBottom','site-config.json','site'],['#downloadBannerConfig','banner-config.json','banner'],['#downloadBannerConfigBottom','banner-config.json','banner'],['#downloadBannerConfigTab','banner-config.json','banner'],['#downloadBannerConfigTabBottom','banner-config.json','banner']].forEach(([selector, filename, key]) => {
            const link = $(selector); if (link) { link.href = urls[key]; link.download = filename; }
        });
        const status = $('#homeConfigStatus');
        if (status) status.textContent = `${state.banners.filter(item => item.enabled !== false).length} banner quảng cáo đang bật · tối đa ${state.banner.holidayMaxSlides || 0} banner lễ (tính riêng) · giới hạn ${state.feed.maxItems} bài`;
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
        moveBannerById(card.dataset.bannerId, direction, { follow: true });
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
        const sim = $('#simAdminPanel');
        const posts = $('#postsAdminPanel');
        if (home) home.hidden = tab !== 'home';
        if (banner) banner.hidden = tab !== 'banner';
        if (categories) categories.hidden = tab !== 'categories';
        if (sim) sim.hidden = tab !== 'sim';
        if (posts) posts.hidden = tab !== 'posts';
        localStorage.setItem('vinh-admin-tab', tab);
    }

    function bindEvents() {
        document.addEventListener('click', event => {
            const tab = event.target.closest('[data-cms-tab]');
            if (tab) { switchTab(tab.dataset.cmsTab); return; }
            const holidaySelect = event.target.closest('[data-holiday-select]');
            if (holidaySelect) {
                const checked = holidaySelect.dataset.holidaySelect === 'all';
                $$('[data-holiday-banner-id]').forEach(input => { input.checked = checked; });
                if (checked) enforceAprilMayBannerChoice('43051');
                updateDownloadLinks();
                return;
            }
            if (event.target.closest('#addHomeBanner')) { addBanner(); return; }
            if (event.target.closest('#checkHolidayBannerFiles')) { checkHolidayBannerFiles(); return; }
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
            const holidayToggle = event.target.closest('[data-holiday-banner-id]');
            if (holidayToggle) enforceAprilMayBannerChoice(holidayToggle.dataset.holidayBannerId);
            if (event.target.closest('#homeAdminPanel, #bannerAdminPanel')) updateDownloadLinks();
        });

        $('#importHomeConfig')?.addEventListener('change', async event => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const parsed = JSON.parse(await file.text());
                if (parsed && (parsed.settings || parsed.items)) {
                    state = mergeConfig({ ...state, banner: parsed.settings || state.banner, holiday: parsed.holiday || state.holiday, banners: parsed.items || state.banners, sections: { ...state.sections, banner: parsed.enabled !== false } });
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

        $('#importBannerConfig')?.addEventListener('change', async event => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const parsed = JSON.parse(await file.text());
                state = mergeConfig({
                    ...state,
                    banner: parsed.settings || parsed.banner || state.banner,
                    holiday: parsed.holiday || state.holiday,
                    banners: parsed.items || parsed.banners || state.banners,
                    sections: { ...state.sections, banner: parsed.enabled !== false }
                });
                fillSettings();
                renderBanners();
                updateDownloadLinks();
                const status = $('#homeConfigStatus');
                if (status) status.textContent = `Đã nhập ${file.name}.`;
            } catch (error) {
                alert('File banner-config.json không hợp lệ.');
            } finally {
                event.target.value = '';
            }
        });

    }


    function bindHolidayPreview() {
        const holidayButton = $('#previewHolidayBanner');
        const fireworksButton = $('#previewHolidayFireworks');
        const copyButton = $('#copyHolidayPreviewLink');
        const selector = $('#homeHolidayPreview');
        const linkInput = $('#holidayPreviewLink');
        if (!holidayButton || holidayButton.dataset.bound === '1') return;
        holidayButton.dataset.bound = '1';

        let selectedMode = 'holiday';
        const makeUrl = (mode = selectedMode) => {
            const id = String(selector?.value || '0101').trim();
            const token = `${mode === 'fireworks' ? 'testfireworks' : 'testholiday'}${id}`;
            return `${location.origin}/?${token}`;
        };
        const updateLink = (mode = selectedMode) => {
            selectedMode = mode;
            if (linkInput) linkInput.value = makeUrl(mode);
        };
        const openTest = mode => {
            updateLink(mode);
            window.open(makeUrl(mode), '_blank', 'noopener');
        };

        holidayButton.addEventListener('click', () => openTest('holiday'));
        fireworksButton?.addEventListener('click', () => openTest('fireworks'));
        selector?.addEventListener('change', () => updateLink(selectedMode));
        linkInput?.addEventListener('focus', () => linkInput.select());
        copyButton?.addEventListener('click', async () => {
            const value = makeUrl(selectedMode);
            updateLink(selectedMode);
            try {
                await navigator.clipboard.writeText(value);
                copyButton.textContent = 'Đã sao chép';
            } catch (_) {
                linkInput?.focus();
                linkInput?.select();
                try { document.execCommand('copy'); } catch (_) {}
                copyButton.textContent = 'Đã chọn link';
            }
            window.setTimeout(() => { copyButton.textContent = 'Sao chép link'; }, 1400);
        });
        updateLink('holiday');
    }
    async function init() {
        organizeAdminTabs();
        bindEvents();
        const savedTab = localStorage.getItem('vinh-admin-tab');
        switchTab(['home', 'banner', 'categories', 'sim', 'posts'].includes(savedTab) ? savedTab : 'home');
        try {
            const [siteResponse, bannerResponse] = await Promise.all([
                fetch(SITE_CONFIG_URL, { cache: 'no-cache' }),
                fetch(BANNER_CONFIG_URL, { cache: 'no-cache' })
            ]);
            if (!siteResponse.ok || !bannerResponse.ok) throw new Error('Không tải được cấu hình tách');
            const site = await siteResponse.json();
            const banner = await bannerResponse.json();
            state = mergeConfig({ ...site, banner: banner.settings || {}, holiday: banner.holiday || site.holiday || {}, banners: banner.items || [], sections: { ...(site.sections || {}), banner: banner.enabled !== false } });
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
