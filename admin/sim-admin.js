(() => {
  'use strict';

  const VERSION = window.VinhSiteVersion?.id || 'dev';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const VIEW_META = {
    settings: { title: 'Cài đặt trang SIM', description: 'Tiêu đề, mô tả và tên các nhóm hiển thị ngoài trang.' },
    order: { title: 'Cài đặt đơn hàng', description: 'Messenger, Facebook hoặc trang đặt hàng riêng.' },
    monthly: { title: 'SIM data tháng', description: 'Các gói data gia hạn hoặc thanh toán theo tháng.', kind: 'data', period: 'monthly' },
    yearly: { title: 'SIM data năm', description: 'Các gói data dùng theo kỳ hạn dài hoặc 12 tháng.', kind: 'data', period: 'yearly' },
    voice: { title: 'SIM nghe gọi', description: 'Các gói có số điện thoại, nghe gọi và data đi kèm.', kind: 'voice' },
    travel: { title: 'SIM du lịch', description: 'eSIM du lịch theo quốc gia và khu vực, dùng file cấu hình riêng.', kind: 'travel', period: 'travel' }
  };
  const PRODUCT_VIEWS = new Set(['monthly', 'yearly', 'voice', 'travel']);
  const DEFAULT_APN_URL = '/pages/pages-baiviet/sim/cau-hinh-sim-data-sim-nghe-goi-20251109.html';
  const DEFAULT_APN_FAQ = Object.freeze({
    question: 'SIM data có cần cài cấu hình APN để sử dụng không?',
    answer: 'Có thể cần, tùy loại SIM và thiết bị. Sau khi lắp SIM hoặc kích hoạt eSIM, hãy mở mục Tải cấu hình / APN để cài cấu hình cho iPhone hoặc nhập APN theo hướng dẫn trên Android.'
  });
  const DEFAULT_SIM_IMAGE = '/img/sim/sim-softbank.svg';
  const DEFAULT_HERO_MOBILE_IMAGE = '/img/sim/sim-softbank-mobile.svg';

  function mobileHeroFromDesktop(value = '') {
    const raw = String(value || '').trim();
    const match = raw.match(/^(.*\/sim-(docomo|softbank|rakuten))\.svg(?:\?.*)?$/i);
    return match ? `${match[1]}-mobile.svg` : (raw || DEFAULT_HERO_MOBILE_IMAGE);
  }
  const LEGACY_SIM_IMAGES = new Set(['/img/sim/softbank-demo.png']);
  const CARRIER_IMAGES = Object.freeze({
    docomo: '/img/sim/sim-docomo.svg',
    softbank: '/img/sim/sim-softbank.svg',
    rakuten: '/img/sim/sim-rakuten.svg'
  });
  const DRAFT_KEYS = Object.freeze({
    sim: 'vinh-sim-plans-draft',
    travel: 'vinh-travel-sim-plans-draft',
    order: 'vinh-order-config-draft',
    legacy: 'vinh-sim-admin-draft'
  });

  function carrierKey(value = '') {
    const key = String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key.includes('docomo')) return 'docomo';
    if (key.includes('softbank')) return 'softbank';
    if (key.includes('rakuten')) return 'rakuten';
    return '';
  }

  function carrierImage(value = '') {
    return CARRIER_IMAGES[carrierKey(value)] || '';
  }

  function isManagedCarrierImage(value = '') {
    const image = String(value).trim();
    return !image || LEGACY_SIM_IMAGES.has(image) || Object.values(CARRIER_IMAGES).includes(image);
  }

  function planImage(plan = {}) {
    const image = String(plan.image || '').trim();
    const mapped = carrierImage(plan.carrier);
    if (!image || LEGACY_SIM_IMAGES.has(image)) return mapped || DEFAULT_SIM_IMAGE;
    return image;
  }

  let simData = { schemaVersion: 6, page: {}, plans: [], faqs: [] };
  let travelData = { schemaVersion: 1, title: 'SIM du lịch quốc tế', description: '', source: {}, plans: [] };
  let orderData = {};
  let urls = { sim: '', travel: '', order: '' };
  let activeView = localStorage.getItem('vinh-sim-admin-view') || 'settings';
  if (!VIEW_META[activeView]) activeView = 'settings';

  function makeUrl(key, data) {
    if (urls[key]) URL.revokeObjectURL(urls[key]);
    urls[key] = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json;charset=utf-8' }));
    return urls[key];
  }

  function legacyAvailability(plan, type) {
    const field = type === 'physical' ? 'physicalEnabled' : 'esimEnabled';
    if (typeof plan[field] === 'boolean') return plan[field];
    const legacyType = ['both', 'physical', 'esim'].includes(plan.simType) ? plan.simType : 'physical';
    return legacyType === 'both' || legacyType === type;
  }

  function normalizePlan(plan = {}) {
    const legacyVariant = !Object.prototype.hasOwnProperty.call(plan, 'physicalEnabled')
      && !Object.prototype.hasOwnProperty.call(plan, 'esimEnabled')
      && ['physical', 'esim'].includes(plan.simType);
    const normalized = { ...plan };
    normalized.id = String(normalized.id || `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    normalized.familyId = String(normalized.familyId || normalized.id);
    normalized.planKind = normalized.planKind === 'travel' ? 'travel' : (normalized.planKind === 'voice' ? 'voice' : 'data');
    normalized.period = normalized.planKind === 'travel' ? 'travel' : (normalized.period === 'yearly' ? 'yearly' : 'monthly');
    normalized.physicalEnabled = legacyAvailability(plan, 'physical');
    normalized.esimEnabled = legacyAvailability(plan, 'esim');
    normalized.simType = normalized.physicalEnabled && normalized.esimEnabled ? 'both' : (normalized.esimEnabled ? 'esim' : 'physical');
    normalized.priceMode = normalized.priceMode === 'separate' ? 'separate' : 'same';
    normalized.price = String(normalized.price || normalized.physicalPrice || normalized.esimPrice || 'Liên hệ').trim() || 'Liên hệ';
    normalized.physicalPrice = String(normalized.physicalPrice || normalized.price || 'Liên hệ').trim() || 'Liên hệ';
    normalized.esimPrice = String(normalized.esimPrice || normalized.price || 'Liên hệ').trim() || 'Liên hệ';
    normalized.image = planImage(normalized);
    normalized.soldOut = normalized.soldOut === true;
    normalized.showPrice = normalized.showPrice !== false;
    normalized.sourceCurrency = ['USD','JPY','VND'].includes(normalized.sourceCurrency) ? normalized.sourceCurrency : 'USD';
    normalized.sellCurrency = ['USD','JPY','VND'].includes(normalized.sellCurrency) ? normalized.sellCurrency : 'JPY';
    normalized.sourcePriceValue = Number.isFinite(Number(normalized.sourcePriceValue)) ? Number(normalized.sourcePriceValue) : 0;
    normalized.exchangeRate = Number.isFinite(Number(normalized.exchangeRate)) ? Number(normalized.exchangeRate) : 0;
    normalized.markupValue = Number.isFinite(Number(normalized.markupValue)) ? Number(normalized.markupValue) : 0;
    normalized.sellPriceValue = Number.isFinite(Number(normalized.sellPriceValue)) ? Number(normalized.sellPriceValue) : 0;
    normalized.features = Array.isArray(normalized.features) ? normalized.features : [];
    normalized.requirements = Array.isArray(normalized.requirements) ? normalized.requirements : [];
    Object.defineProperty(normalized, '_legacyVariant', { value: legacyVariant, enumerable: false, configurable: true });
    return normalized;
  }

  function mergeLegacyPair(physical, esim) {
    const samePrice = String(physical.price || '').trim() === String(esim.price || '').trim();
    const physicalVisible = physical.enabled !== false && physical.showCard !== false;
    const esimVisible = esim.enabled !== false && esim.showCard !== false;
    return normalizePlan({
      ...structuredClone(physical),
      id: String(physical.familyId || physical.id || esim.id),
      familyId: String(physical.familyId || esim.familyId || physical.id || esim.id),
      enabled: physicalVisible || esimVisible,
      showCard: physicalVisible || esimVisible,
      physicalEnabled: physicalVisible,
      esimEnabled: esimVisible,
      simType: 'both',
      priceMode: samePrice ? 'same' : 'separate',
      price: samePrice ? physical.price : (physical.price || esim.price || 'Liên hệ'),
      physicalPrice: physical.price || 'Liên hệ',
      esimPrice: esim.price || 'Liên hệ',
      soldOut: physical.soldOut === true && esim.soldOut === true,
      features: Array.from(new Set([...(physical.features || []), ...(esim.features || [])])),
      requirements: Array.from(new Set([...(physical.requirements || []), ...(esim.requirements || [])]))
    });
  }

  function consolidateLegacyPlans(input) {
    const normalized = (Array.isArray(input) ? input : []).map(normalizePlan);
    const consumed = new Set();
    const output = [];
    normalized.forEach(plan => {
      if (consumed.has(plan)) return;
      if (plan._legacyVariant === true && plan.familyId) {
        const pair = normalized.find(item => item !== plan
          && !consumed.has(item)
          && item._legacyVariant === true
          && item.familyId === plan.familyId
          && item.planKind === plan.planKind
          && item.period === plan.period
          && ((plan.simType === 'physical' && item.simType === 'esim') || (plan.simType === 'esim' && item.simType === 'physical')));
        if (pair) {
          const physical = plan.simType === 'physical' ? plan : pair;
          const esim = plan.simType === 'esim' ? plan : pair;
          consumed.add(plan);
          consumed.add(pair);
          output.push(mergeLegacyPair(physical, esim));
          return;
        }
      }
      consumed.add(plan);
      output.push(plan);
    });
    return output;
  }

  function normalizeFaq(item = {}) {
    return {
      question: String(item.question || '').trim(),
      answer: String(item.answer || '').trim()
    };
  }

  function normalizeSimData(input) {
    const data = input && typeof input === 'object' ? input : {};
    return {
      ...data,
      schemaVersion: 6,
      page: { ...(data.page || {}) },
      plans: consolidateLegacyPlans(data.plans),
      faqs: Array.isArray(data.faqs) ? data.faqs.map(normalizeFaq) : []
    };
  }

  function normalizeTravelData(input) {
    const data = input && typeof input === 'object' ? input : {};
    const pricing = {
      usdToJpy: Number(data.pricing?.usdToJpy || 150),
      usdToVnd: Number(data.pricing?.usdToVnd || 26000),
      jpyToVnd: Number(data.pricing?.jpyToVnd || 175),
      defaultSellCurrency: ['USD','JPY','VND'].includes(data.pricing?.defaultSellCurrency) ? data.pricing.defaultSellCurrency : 'JPY',
      defaultMarkup: Number(data.pricing?.defaultMarkup || 0)
    };
    return {
      ...data,
      schemaVersion: 2,
      title: String(data.title || 'SIM du lịch quốc tế'),
      description: String(data.description || ''),
      source: { ...(data.source || {}) },
      pricing,
      plans: (Array.isArray(data.plans) ? data.plans : []).map(item => {
        const sourcePriceValue = Number.isFinite(Number(item.sourcePriceValue)) ? Number(item.sourcePriceValue) : parseTravelNumber(item.price);
        const sellCurrency = ['USD','JPY','VND'].includes(item.sellCurrency) ? item.sellCurrency : pricing.defaultSellCurrency;
        const exchangeRate = Number(item.exchangeRate || (item.sourceCurrency === sellCurrency ? 1 : (sellCurrency === 'JPY' ? pricing.usdToJpy : sellCurrency === 'VND' ? pricing.usdToVnd : 1)));
        return normalizePlan({
          ...item,
          planKind: 'travel',
          period: 'travel',
          physicalEnabled: false,
          esimEnabled: item.esimEnabled !== false,
          simType: 'esim',
          showPrice: item.showPrice === true,
          sourcePriceValue,
          sourceCurrency: ['USD','JPY','VND'].includes(item.sourceCurrency) ? item.sourceCurrency : 'USD',
          sellCurrency,
          exchangeRate,
          markupValue: Number(item.markupValue ?? pricing.defaultMarkup ?? 0),
          sellPriceValue: Number(item.sellPriceValue || (sourcePriceValue * exchangeRate + Number(item.markupValue ?? pricing.defaultMarkup ?? 0))),
          price: item.showPrice === true ? item.price : 'Liên hệ báo giá',
          physicalPrice: item.showPrice === true ? item.physicalPrice : 'Liên hệ báo giá',
          esimPrice: item.showPrice === true ? item.esimPrice : 'Liên hệ báo giá'
        });
      })
    };
  }

  function planStoreForView(view = activeView) {
    return view === 'travel' ? travelData : simData;
  }

  function activePlans(view = activeView) {
    return planStoreForView(view).plans;
  }

  function typeLabel(type) {
    if (type === 'both') return simData.page?.bothLabel || 'eSIM + SIM vật lý';
    if (type === 'esim') return simData.page?.esimLabel || 'eSIM';
    return simData.page?.physicalLabel || 'SIM vật lý';
  }

  function availableTypes(plan) {
    const types = [];
    if (plan.physicalEnabled !== false) types.push('physical');
    if (plan.esimEnabled !== false) types.push('esim');
    return types;
  }

  function availabilityLabel(plan) {
    const types = availableTypes(plan);
    if (types.length === 2) return typeLabel('both');
    if (types.length === 1) return typeLabel(types[0]);
    return 'Chưa chọn loại SIM';
  }

  function priceModeLabel(plan) {
    return plan.priceMode === 'separate' ? '2 giá riêng' : 'Một giá';
  }

  function kindLabel(kind) {
    if (kind === 'travel') return simData.page?.travelLabel || 'SIM du lịch';
    return kind === 'voice' ? 'SIM nghe gọi' : 'SIM data';
  }

  function periodLabel(period) {
    if (period === 'travel') return simData.page?.travelLabel || 'SIM du lịch';
    return period === 'yearly' ? (simData.page?.yearlyLabel || 'SIM năm') : (simData.page?.monthlyLabel || 'SIM tháng');
  }

  function faqAdminCard(item, index, total) {
    return `<article class="sim-faq-admin-item" data-sim-faq-index="${index}">
      <div class="sim-faq-admin-number" aria-label="Câu hỏi số ${index + 1}">${index + 1}</div>
      <label class="sim-faq-question-field"><span>Câu hỏi</span><input type="text" data-faq-field="question" value="${escapeHtml(item.question || '')}" placeholder="Ví dụ: SIM data có cần cài APN không?"></label>
      <label class="sim-faq-answer-field"><span>Câu trả lời</span><textarea rows="3" data-faq-field="answer" placeholder="Nhập câu trả lời ngắn gọn, dễ hiểu.">${escapeHtml(item.answer || '')}</textarea></label>
      <div class="sim-faq-admin-tools" aria-label="Sắp xếp và xóa câu hỏi">
        <button type="button" data-move-sim-faq="up" aria-label="Đưa câu hỏi lên" title="Đưa lên" ${index === 0 ? 'disabled' : ''}>↑</button>
        <button type="button" data-move-sim-faq="down" aria-label="Đưa câu hỏi xuống" title="Đưa xuống" ${index === total - 1 ? 'disabled' : ''}>↓</button>
        <button type="button" class="sim-faq-remove" data-remove-sim-faq aria-label="Xóa câu hỏi" title="Xóa câu hỏi">×</button>
      </div>
    </article>`;
  }

  function renderFaqs() {
    const list = $('#simFaqAdminList');
    if (!list) return;
    const items = Array.isArray(simData.faqs) ? simData.faqs : [];
    list.innerHTML = items.length
      ? items.map((item, index) => faqAdminCard(item, index, items.length)).join('')
      : '<div class="sim-faq-admin-empty">Chưa có câu hỏi thường gặp. Nhấn “+ Thêm câu hỏi” hoặc “+ Câu APN mẫu”.</div>';
  }

  function collectFaqs() {
    const nodes = $$('.sim-faq-admin-item');
    if (!nodes.length) {
      if ($('#simFaqAdminList')) simData.faqs = [];
      return;
    }
    simData.faqs = nodes.map(node => normalizeFaq({
      question: node.querySelector('[data-faq-field="question"]')?.value,
      answer: node.querySelector('[data-faq-field="answer"]')?.value
    })).filter(item => item.question || item.answer);
  }

  function addFaq(preset = null) {
    collectFaqs();
    simData.faqs.push(normalizeFaq(preset || { question: '', answer: '' }));
    renderFaqs();
    updateDownloads('sim');
    const last = document.querySelector('.sim-faq-admin-item:last-child');
    last?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    last?.querySelector('[data-faq-field="question"]')?.focus({ preventScroll: true });
  }

  function removeFaq(index) {
    collectFaqs();
    if (!Number.isInteger(index) || index < 0 || index >= simData.faqs.length) return;
    simData.faqs.splice(index, 1);
    renderFaqs();
    updateDownloads('sim');
  }

  function moveFaq(index, direction) {
    collectFaqs();
    if (!Number.isInteger(index) || index < 0 || index >= simData.faqs.length) return;
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= simData.faqs.length) return;
    [simData.faqs[index], simData.faqs[nextIndex]] = [simData.faqs[nextIndex], simData.faqs[index]];
    renderFaqs();
    updateDownloads('sim');
    document.querySelector(`[data-sim-faq-index="${nextIndex}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function fillPage() {
    $('#simAdminTitle').value = simData.page?.title || '';
    $('#simAdminEyebrow').value = simData.page?.eyebrow || '';
    $('#simAdminDescription').value = simData.page?.description || '';
    $('#simAdminNotice').value = simData.page?.notice || '';
    $('#simAdminMonthlyLabel').value = simData.page?.monthlyLabel || 'SIM tháng';
    $('#simAdminYearlyLabel').value = simData.page?.yearlyLabel || 'SIM năm';
    $('#simAdminVoiceLabel').value = simData.page?.voiceLabel || 'SIM nghe gọi';
    $('#simAdminTravelLabel').value = simData.page?.travelLabel || 'SIM du lịch';
    $('#simAdminPhysicalLabel').value = simData.page?.physicalLabel || 'SIM vật lý';
    $('#simAdminEsimLabel').value = simData.page?.esimLabel || 'eSIM';
    $('#simAdminBothLabel').value = simData.page?.bothLabel || 'eSIM + SIM vật lý';
    const desktopHeroImage = simData.page?.heroDesktopImageUrl || simData.page?.heroImageUrl || '/img/sim/sim-softbank.svg';
    $('#simAdminHeroDesktopImageUrl').value = desktopHeroImage;
    $('#simAdminHeroMobileImageUrl').value = simData.page?.heroMobileImageUrl || mobileHeroFromDesktop(desktopHeroImage);
    $('#simAdminHeroImageEnabled').checked = simData.page?.heroImageEnabled !== false;
    $('#simAdminPrimaryButtonEnabled').checked = simData.page?.primaryButtonEnabled !== false;
    $('#simAdminPrimaryButtonLabel').value = simData.page?.primaryButtonLabel || 'Xem gói SIM';
    $('#simAdminPrimaryButtonUrl').value = simData.page?.primaryButtonUrl || '#simPlans';
    $('#simAdminApnUrl').value = simData.page?.apnUrl || DEFAULT_APN_URL;
    $('#simAdminApnLabel').value = simData.page?.apnLabel || 'Tải cấu hình / APN';
    $('#simAdminApnEnabled').checked = simData.page?.apnEnabled !== false;
    if ($('#travelUsdToJpy')) $('#travelUsdToJpy').value = travelData.pricing?.usdToJpy || 150;
    if ($('#travelUsdToVnd')) $('#travelUsdToVnd').value = travelData.pricing?.usdToVnd || 26000;
    if ($('#travelJpyToVnd')) $('#travelJpyToVnd').value = travelData.pricing?.jpyToVnd || 175;
    if ($('#travelDefaultSellCurrency')) $('#travelDefaultSellCurrency').value = travelData.pricing?.defaultSellCurrency || 'JPY';
    if ($('#travelDefaultMarkup')) $('#travelDefaultMarkup').value = travelData.pricing?.defaultMarkup || 0;

    $('#simOrderMode').value = orderData.mode || 'messenger';
    $('#simMessengerUrl').value = orderData.messengerUrl || '';
    $('#simFacebookUrl').value = orderData.facebookUrl || '';
    $('#simCustomOrderUrl').value = orderData.customPageUrl || '';
    $('#simMessageTemplate').value = orderData.messageTemplate || '';
    $('#simCopyMessage').checked = orderData.copyMessageBeforeOpen !== false;
    $('#simAppendText').checked = orderData.appendTextQuery !== false;
    orderData.labels = { ...(orderData.labels || {}), friend: 'Liên hệ' };
    renderFaqs();
  }

  function planMatchesView(plan, view = activeView) {
    if (view === 'travel') return plan.planKind === 'travel';
    if (view === 'voice') return plan.planKind === 'voice';
    if (view === 'monthly' || view === 'yearly') return plan.planKind === 'data' && plan.period === view;
    return false;
  }

  function parseTravelNumber(value) {
    const normalized = String(value ?? '').replace(/,/g, '').replace(/[^0-9.-]/g, '');
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  function travelRate(from, to) {
    if (from === to) return 1;
    const pricing = travelData.pricing || {};
    const usdToJpy = Number(pricing.usdToJpy || 0);
    const usdToVnd = Number(pricing.usdToVnd || 0);
    const jpyToVnd = Number(pricing.jpyToVnd || 0);
    if (from === 'USD' && to === 'JPY') return usdToJpy;
    if (from === 'USD' && to === 'VND') return usdToVnd;
    if (from === 'JPY' && to === 'VND') return jpyToVnd;
    if (from === 'JPY' && to === 'USD') return usdToJpy ? 1 / usdToJpy : 0;
    if (from === 'VND' && to === 'USD') return usdToVnd ? 1 / usdToVnd : 0;
    if (from === 'VND' && to === 'JPY') return jpyToVnd ? 1 / jpyToVnd : 0;
    return 0;
  }

  function formatTravelMoney(value, currency) {
    const number = Number(value || 0);
    if (!Number.isFinite(number) || number <= 0) return 'Liên hệ báo giá';
    if (currency === 'VND') return `${Math.round(number).toLocaleString('vi-VN')}₫`;
    if (currency === 'USD') return `US$${number.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    return `¥${Math.round(number).toLocaleString('ja-JP')}`;
  }

  function travelCard(plan) {
    const sellCurrency = ['USD','JPY','VND'].includes(plan.sellCurrency) ? plan.sellCurrency : (travelData.pricing?.defaultSellCurrency || 'JPY');
    const sourceCurrency = ['USD','JPY','VND'].includes(plan.sourceCurrency) ? plan.sourceCurrency : 'USD';
    const sourceValue = Number(plan.sourcePriceValue || 0);
    const defaultRate = travelRate(sourceCurrency, sellCurrency);
    const exchangeRate = Number(plan.exchangeRate || defaultRate || 0);
    const markup = Number(plan.markupValue ?? travelData.pricing?.defaultMarkup ?? 0);
    const sellValue = Number(plan.sellPriceValue || 0);
    return `<article class="sim-admin-card travel-admin-card" data-sim-admin-id="${escapeHtml(plan.id)}">
      <header>
        <div class="sim-admin-card-title">
          <strong>${escapeHtml(plan.cardName || plan.name || 'eSIM du lịch')}</strong>
          <small>SIM du lịch · eSIM${plan.soldOut === true ? ' · Hết hàng' : ''}${plan.showPrice === false ? ' · Ẩn giá' : ''}${(plan.enabled === false || plan.showCard === false) ? ' · Đang ẩn' : ''}</small>
        </div>
        <div class="sim-admin-card-actions">
          <button type="button" class="sim-card-action copy" data-duplicate-sim-plan title="Nhân bản gói">Nhân bản</button>
          <button type="button" class="sim-card-action remove" data-remove-sim-plan aria-label="Xóa gói" title="Xóa">×</button>
        </div>
      </header>
      <div class="sim-admin-fields travel-admin-fields">
        <section class="sim-compact-control-panel wide-status travel-status-panel">
          <div class="sim-compact-control-grid travel-status-grid">
            <label class="sim-compact-option visibility"><span>Hiển thị</span><input type="checkbox" data-sim-visible ${(plan.enabled === false || plan.showCard === false) ? '' : 'checked'}></label>
            <label class="sim-compact-option soldout"><span>Hết hàng</span><input type="checkbox" data-sim-field="soldOut" ${plan.soldOut === true ? 'checked' : ''}></label>
            <label class="sim-compact-option price-visibility"><span>Hiện giá</span><input type="checkbox" data-sim-field="showPrice" ${plan.showPrice === false ? '' : 'checked'}></label>
            <label class="sim-compact-option esim"><span>eSIM</span><input type="checkbox" data-sim-field="esimEnabled" ${plan.esimEnabled === false ? '' : 'checked'}></label>
          </div>
        </section>
        <section class="travel-price-editor wide-status">
          <div class="travel-price-editor-head"><strong>Giá nguồn và giá bán</strong><small>Giá bán = Giá nguồn × Tỷ giá + Cộng thêm.</small></div>
          <div class="travel-price-editor-grid">
            <label><span>Giá nguồn</span><input type="number" min="0" step="0.01" data-sim-field="sourcePriceValue" value="${escapeHtml(sourceValue || '')}" placeholder="0.22"></label>
            <label><span>Tiền nguồn</span><select data-sim-field="sourceCurrency"><option value="USD" ${sourceCurrency==='USD'?'selected':''}>USD</option><option value="JPY" ${sourceCurrency==='JPY'?'selected':''}>JPY</option><option value="VND" ${sourceCurrency==='VND'?'selected':''}>VND</option></select></label>
            <label><span>Tiền bán</span><select data-sim-field="sellCurrency"><option value="JPY" ${sellCurrency==='JPY'?'selected':''}>JPY</option><option value="VND" ${sellCurrency==='VND'?'selected':''}>VND</option><option value="USD" ${sellCurrency==='USD'?'selected':''}>USD</option></select></label>
            <label><span>Tỷ giá áp dụng</span><input type="number" min="0" step="0.0001" data-sim-field="exchangeRate" value="${escapeHtml(exchangeRate || '')}"></label>
            <label><span>Cộng thêm / lợi nhuận</span><input type="number" step="1" data-sim-field="markupValue" value="${escapeHtml(markup || '')}" placeholder="0"></label>
            <label><span>Giá bán</span><input type="number" min="0" step="1" data-sim-field="sellPriceValue" value="${escapeHtml(sellValue || '')}" placeholder="Tự tính hoặc nhập tay"></label>
          </div>
          <div class="travel-price-actions">
            <button type="button" data-travel-use-rate>Lấy tỷ giá mặc định</button>
            <button type="button" class="primary" data-travel-calculate-price>Tính giá bán</button>
            <button type="button" data-travel-open-source>Mở giá tham khảo</button>
            <output data-travel-price-preview>${escapeHtml(plan.showPrice === false ? 'Ngoài trang: Liên hệ báo giá' : `Ngoài trang: ${formatTravelMoney(sellValue, sellCurrency)}`)}</output>
          </div>
        </section>
        <label><span>ID</span><input type="text" data-sim-field="id" value="${escapeHtml(plan.id || '')}"></label>
        <label><span>Tên ngoài thẻ</span><input type="text" data-sim-field="cardName" value="${escapeHtml(plan.cardName || '')}"></label>
        <label class="wide"><span>Tên chi tiết</span><input type="text" data-sim-field="name" value="${escapeHtml(plan.name || '')}"></label>
        <label><span>Khu vực</span><input type="text" data-sim-field="travelRegion" value="${escapeHtml(plan.travelRegion || '')}" placeholder="Đông Á, Châu Âu..."></label>
        <label><span>Quốc gia / phạm vi</span><input type="text" data-sim-field="country" value="${escapeHtml(plan.country || plan.carrier || '')}"></label>
        <label><span>Ngày kiểm tra giá</span><input type="date" data-sim-field="referenceCheckedAt" value="${escapeHtml(plan.referenceCheckedAt || '')}"></label>
        <label class="wide"><span>Link nguồn giá</span><input type="url" data-sim-field="sourceUrl" value="${escapeHtml(plan.sourceUrl || '')}" placeholder="https://www.trip.com/..."></label>
        <label><span>Điểm đến / phạm vi</span><input type="text" data-sim-field="carrier" value="${escapeHtml(plan.carrier || '')}"></label>
        <label><span>Dung lượng</span><input type="text" data-sim-field="dataLabel" value="${escapeHtml(plan.dataLabel || '')}"></label>
        <label><span>Thời hạn</span><input type="text" data-sim-field="durationLabel" value="${escapeHtml(plan.durationLabel || '')}"></label>
        <label class="wide sim-admin-image-field"><span>Ảnh sản phẩm</span><div class="sim-admin-image-control"><img data-sim-image-preview src="${escapeHtml(planImage(plan))}" alt="Ảnh ${escapeHtml(plan.carrier || 'SIM')}"><div><input type="text" data-sim-field="image" value="${escapeHtml(planImage(plan))}"></div></div><small>Có thể dùng ảnh eSIM du lịch chung hoặc ảnh riêng cho từng quốc gia.</small></label>
        <label class="wide"><span>Mô tả</span><textarea rows="2" data-sim-field="subtitle">${escapeHtml(plan.subtitle || '')}</textarea></label>
        <label class="wide"><span>Tính năng, mỗi dòng một ý</span><textarea rows="4" data-sim-lines="features">${escapeHtml((plan.features || []).join('\n'))}</textarea></label>
        <label class="wide"><span>Cần kiểm tra trước, mỗi dòng một ý</span><textarea rows="3" data-sim-lines="requirements">${escapeHtml((plan.requirements || []).join('\n'))}</textarea></label>
        <label class="wide"><span>Phù hợp với</span><textarea rows="2" data-sim-field="recommendedFor">${escapeHtml(plan.recommendedFor || '')}</textarea></label>
      </div>
    </article>`;
  }

  function card(plan) {
    if (plan.planKind === 'travel' || activeView === 'travel') return travelCard(plan);
    const radioName = `sim-price-mode-${String(plan.id || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    const samePrice = plan.priceMode !== 'separate';
    const isTravel = plan.planKind === 'travel' || activeView === 'travel';
    const kindOptions = isTravel
      ? '<option value="travel" selected>SIM du lịch</option>'
      : `<option value="data" ${plan.planKind !== 'voice' ? 'selected' : ''}>SIM data</option><option value="voice" ${plan.planKind === 'voice' ? 'selected' : ''}>SIM nghe gọi</option>`;
    const periodOptions = isTravel
      ? '<option value="travel" selected>Chuyến đi</option>'
      : `<option value="monthly" ${plan.period === 'monthly' ? 'selected' : ''}>SIM tháng</option><option value="yearly" ${plan.period === 'yearly' ? 'selected' : ''}>SIM năm</option>`;
    const travelFields = isTravel ? `<label><span>Khu vực</span><input type="text" data-sim-field="travelRegion" value="${escapeHtml(plan.travelRegion || '')}" placeholder="Đông Á, Châu Âu..."></label>
        <label><span>Quốc gia / phạm vi</span><input type="text" data-sim-field="country" value="${escapeHtml(plan.country || plan.carrier || '')}"></label>
        <label><span>Ngày kiểm tra giá</span><input type="date" data-sim-field="referenceCheckedAt" value="${escapeHtml(plan.referenceCheckedAt || '')}"></label>
        <label class="wide"><span>Link nguồn giá</span><input type="url" data-sim-field="sourceUrl" value="${escapeHtml(plan.sourceUrl || '')}" placeholder="https://www.trip.com/..."></label>` : '';
    return `<article class="sim-admin-card" data-sim-admin-id="${escapeHtml(plan.id)}">
      <header>
        <div class="sim-admin-card-title">
          <strong>${escapeHtml(plan.cardName || plan.name || 'Gói SIM')}</strong>
          <small>${escapeHtml(kindLabel(plan.planKind))} · ${escapeHtml(periodLabel(plan.period))} · ${escapeHtml(availabilityLabel(plan))} · ${escapeHtml(priceModeLabel(plan))}${plan.soldOut === true ? ' · Hết hàng' : ''}${(plan.enabled === false || plan.showCard === false) ? ' · Đang ẩn' : ''}</small>
        </div>
        <div class="sim-admin-card-actions">
          <button type="button" class="sim-card-action copy" data-duplicate-sim-plan title="Nhân bản gói SIM">Nhân bản</button>
          <button type="button" class="sim-card-action remove" data-remove-sim-plan aria-label="Xóa gói SIM" title="Xóa">×</button>
        </div>
      </header>
      <div class="sim-admin-fields">
        <section class="sim-compact-control-panel wide-status">
          <div class="sim-compact-control-grid">
            <label class="sim-compact-option visibility"><span>Hiển thị</span><input type="checkbox" data-sim-visible ${(plan.enabled === false || plan.showCard === false) ? '' : 'checked'}></label>
            <label class="sim-compact-option soldout"><span>Hết hàng</span><input type="checkbox" data-sim-field="soldOut" ${plan.soldOut === true ? 'checked' : ''}></label>
            <label class="sim-compact-option physical"><span>SIM vật lý</span><input type="checkbox" data-sim-field="physicalEnabled" ${plan.physicalEnabled !== false ? 'checked' : ''}></label>
            <label class="sim-compact-option esim"><span>eSIM</span><input type="checkbox" data-sim-field="esimEnabled" ${plan.esimEnabled !== false ? 'checked' : ''}></label>
            <label class="sim-compact-option price-mode"><span>Một giá</span><input type="radio" name="${radioName}" value="same" data-sim-price-mode ${samePrice ? 'checked' : ''}></label>
            <label class="sim-compact-option price-mode"><span>Tách 2 giá</span><input type="radio" name="${radioName}" value="separate" data-sim-price-mode ${samePrice ? '' : 'checked'}></label>
          </div>
          <div class="sim-price-input-grid sim-price-input-compact">
            <label class="sim-price-same" data-price-input="same" ${samePrice ? '' : 'hidden'}><span>${isTravel ? 'Giá tham khảo' : 'Giá chung'}</span><input type="text" data-sim-field="price" value="${escapeHtml(plan.price || '')}" placeholder="Từ US$0.13 hoặc Liên hệ"></label>
            <label data-price-input="physical" ${!samePrice && plan.physicalEnabled !== false ? '' : 'hidden'}><span>Giá SIM vật lý</span><input type="text" data-sim-field="physicalPrice" value="${escapeHtml(plan.physicalPrice || plan.price || '')}"></label>
            <label data-price-input="esim" ${!samePrice && plan.esimEnabled !== false ? '' : 'hidden'}><span>Giá eSIM</span><input type="text" data-sim-field="esimPrice" value="${escapeHtml(plan.esimPrice || plan.price || '')}"></label>
          </div>
        </section>

        <label><span>Nhóm sản phẩm</span><select data-sim-field="planKind">${kindOptions}</select></label>
        <label><span>Chu kỳ</span><select data-sim-field="period">${periodOptions}</select></label>
        <label><span>ID</span><input type="text" data-sim-field="id" value="${escapeHtml(plan.id || '')}"></label>
        <label><span>Tên ngoài thẻ</span><input type="text" data-sim-field="cardName" value="${escapeHtml(plan.cardName || '')}"></label>
        <label class="wide"><span>Tên chi tiết</span><input type="text" data-sim-field="name" value="${escapeHtml(plan.name || '')}"></label>
        ${travelFields}
        <label><span>${isTravel ? 'Điểm đến / phạm vi' : 'Nhà mạng'}</span><input type="text" ${isTravel ? '' : 'list="simCarrierOptions"'} data-sim-field="carrier" value="${escapeHtml(plan.carrier || '')}" placeholder="${isTravel ? 'Nhật Bản, Châu Âu...' : 'Docomo, SoftBank hoặc Rakuten'}"></label>
        <label><span>Dung lượng</span><input type="text" data-sim-field="dataLabel" value="${escapeHtml(plan.dataLabel || '')}"></label>
        <label><span>Thời hạn</span><input type="text" data-sim-field="durationLabel" value="${escapeHtml(plan.durationLabel || '')}"></label>
        <label class="wide sim-admin-image-field"><span>Ảnh sản phẩm</span><div class="sim-admin-image-control"><img data-sim-image-preview src="${escapeHtml(planImage(plan))}" alt="Ảnh ${escapeHtml(plan.carrier || 'SIM')}"><div><input type="text" data-sim-field="image" value="${escapeHtml(planImage(plan))}">${isTravel ? '' : '<button type="button" data-use-carrier-image>Dùng ảnh theo nhà mạng</button>'}</div></div><small>${isTravel ? 'Có thể dùng ảnh eSIM du lịch chung hoặc ảnh riêng cho từng quốc gia.' : 'Một sản phẩm chỉ dùng một ảnh ngoài danh sách. Loại SIM và giá được chọn sau khi khách mở chi tiết.'}</small></label>
        <label class="wide"><span>Mô tả</span><textarea rows="2" data-sim-field="subtitle">${escapeHtml(plan.subtitle || '')}</textarea></label>
        <label class="wide"><span>Tính năng, mỗi dòng một ý</span><textarea rows="4" data-sim-lines="features">${escapeHtml((plan.features || []).join('\n'))}</textarea></label>
        <label class="wide"><span>Cần kiểm tra trước, mỗi dòng một ý</span><textarea rows="3" data-sim-lines="requirements">${escapeHtml((plan.requirements || []).join('\n'))}</textarea></label>
        <label class="wide"><span>Phù hợp với</span><textarea rows="2" data-sim-field="recommendedFor">${escapeHtml(plan.recommendedFor || '')}</textarea></label>
      </div>
    </article>`;
  }

  function visiblePlans() {
    return activePlans().filter(plan => planMatchesView(plan));
  }

  function render() {
    const list = $('#simAdminList');
    if (!list || !PRODUCT_VIEWS.has(activeView)) return;
    const items = visiblePlans();
    list.innerHTML = items.length
      ? items.map(card).join('')
      : `<div class="sim-admin-empty"><strong>Chưa có ${escapeHtml(VIEW_META[activeView].title.toLowerCase())}</strong><p>Nhấn “+ Thêm gói” để tạo sản phẩm đầu tiên trong mục này.</p></div>`;
  }

  function updateCardImagePreview(cardNode) {
    if (!cardNode) return;
    const preview = cardNode.querySelector('[data-sim-image-preview]');
    const imageInput = cardNode.querySelector('[data-sim-field="image"]');
    const carrierInput = cardNode.querySelector('[data-sim-field="carrier"]');
    if (!preview || !imageInput) return;
    const image = String(imageInput.value || '').trim() || carrierImage(carrierInput?.value) || DEFAULT_SIM_IMAGE;
    preview.src = image;
    preview.alt = `Ảnh ${String(carrierInput?.value || 'SIM').trim() || 'SIM'}`;
  }

  function syncCarrierImage(cardNode, force = false) {
    if (!cardNode) return;
    const imageInput = cardNode.querySelector('[data-sim-field="image"]');
    const carrierInput = cardNode.querySelector('[data-sim-field="carrier"]');
    if (!imageInput || !carrierInput) return;
    const mapped = carrierImage(carrierInput.value);
    if (mapped && (force || isManagedCarrierImage(imageInput.value))) imageInput.value = mapped;
    updateCardImagePreview(cardNode);
  }

  function collectCard(node) {
    const originalId = node.dataset.simAdminId;
    const plan = activePlans().find(item => item.id === originalId);
    if (!plan) return;
    const visibleInput = node.querySelector('[data-sim-visible]');
    if (visibleInput) {
      plan.enabled = visibleInput.checked;
      plan.showCard = visibleInput.checked;
    }
    node.querySelectorAll('[data-sim-field]').forEach(input => {
      const key = input.dataset.simField;
      plan[key] = input.type === 'checkbox' ? input.checked : input.value;
    });
    const checkedMode = node.querySelector('[data-sim-price-mode]:checked');
    plan.priceMode = checkedMode?.value === 'separate' ? 'separate' : 'same';
    node.querySelectorAll('[data-sim-lines]').forEach(input => {
      plan[input.dataset.simLines] = input.value.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
    });
    plan.physicalEnabled = plan.physicalEnabled !== false;
    plan.esimEnabled = plan.esimEnabled !== false;
    if (plan.planKind === 'travel') {
      plan.period = 'travel';
      plan.physicalEnabled = false;
      plan.esimEnabled = plan.esimEnabled !== false;
      plan.priceMode = 'same';
      plan.country = String(plan.country || plan.carrier || '').trim();
      plan.carrier = String(plan.carrier || plan.country || '').trim();
      plan.sourceName = String(plan.sourceName || travelData.source?.name || 'Nguồn tham khảo').trim();
      plan.sourcePriceValue = parseTravelNumber(plan.sourcePriceValue);
      plan.exchangeRate = parseTravelNumber(plan.exchangeRate) || travelRate(plan.sourceCurrency, plan.sellCurrency);
      plan.markupValue = parseTravelNumber(plan.markupValue);
      plan.sellPriceValue = parseTravelNumber(plan.sellPriceValue);
      plan.showPrice = plan.showPrice !== false;
      plan.price = plan.showPrice ? formatTravelMoney(plan.sellPriceValue, plan.sellCurrency) : 'Liên hệ báo giá';
      plan.physicalPrice = plan.price;
      plan.esimPrice = plan.price;
    }
    plan.simType = plan.physicalEnabled && plan.esimEnabled ? 'both' : (plan.esimEnabled ? 'esim' : 'physical');
    plan.familyId = plan.id;
    if (plan.planKind !== 'travel') {
      if (plan.priceMode === 'same') {
        plan.price = String(plan.price || 'Liên hệ').trim() || 'Liên hệ';
        plan.physicalPrice = plan.price;
        plan.esimPrice = plan.price;
      } else {
        plan.physicalPrice = String(plan.physicalPrice || plan.price || 'Liên hệ').trim() || 'Liên hệ';
        plan.esimPrice = String(plan.esimPrice || plan.price || 'Liên hệ').trim() || 'Liên hệ';
        plan.price = plan.physicalEnabled ? plan.physicalPrice : plan.esimPrice;
      }
    }
    node.dataset.simAdminId = plan.id;
  }

  function collectSimData() {
    simData.page = {
      ...(simData.page || {}),
      title: $('#simAdminTitle').value.trim(),
      eyebrow: $('#simAdminEyebrow').value.trim(),
      description: $('#simAdminDescription').value.trim(),
      notice: $('#simAdminNotice').value.trim(),
      monthlyLabel: $('#simAdminMonthlyLabel').value.trim() || 'SIM tháng',
      yearlyLabel: $('#simAdminYearlyLabel').value.trim() || 'SIM năm',
      voiceLabel: $('#simAdminVoiceLabel').value.trim() || 'SIM nghe gọi',
      travelLabel: $('#simAdminTravelLabel').value.trim() || 'SIM du lịch',
      physicalLabel: $('#simAdminPhysicalLabel').value.trim() || 'SIM vật lý',
      esimLabel: $('#simAdminEsimLabel').value.trim() || 'eSIM',
      bothLabel: $('#simAdminBothLabel').value.trim() || 'eSIM + SIM vật lý',
      heroImageUrl: $('#simAdminHeroDesktopImageUrl').value.trim() || '/img/sim/sim-softbank.svg',
      heroDesktopImageUrl: $('#simAdminHeroDesktopImageUrl').value.trim() || '/img/sim/sim-softbank.svg',
      heroMobileImageUrl: $('#simAdminHeroMobileImageUrl').value.trim() || mobileHeroFromDesktop($('#simAdminHeroDesktopImageUrl').value),
      heroImageEnabled: $('#simAdminHeroImageEnabled').checked,
      primaryButtonEnabled: $('#simAdminPrimaryButtonEnabled').checked,
      primaryButtonLabel: $('#simAdminPrimaryButtonLabel').value.trim() || 'Xem gói SIM',
      primaryButtonUrl: $('#simAdminPrimaryButtonUrl').value.trim() || '#simPlans',
      apnUrl: $('#simAdminApnUrl').value.trim() || DEFAULT_APN_URL,
      apnLabel: $('#simAdminApnLabel').value.trim() || 'Tải cấu hình / APN',
      apnEnabled: $('#simAdminApnEnabled').checked
    };
    if (activeView !== 'travel') $$('.sim-admin-card').forEach(collectCard);
    collectFaqs();
    simData.schemaVersion = 6;
  }

  function collectTravelData() {
    if (activeView === 'travel') $$('.sim-admin-card').forEach(collectCard);
    travelData.schemaVersion = 2;
    travelData.title = travelData.title || 'SIM du lịch quốc tế';
    travelData.description = travelData.description || 'Danh sách eSIM du lịch theo quốc gia và khu vực.';
    travelData.pricing = {
      usdToJpy: parseTravelNumber($('#travelUsdToJpy')?.value) || 150,
      usdToVnd: parseTravelNumber($('#travelUsdToVnd')?.value) || 26000,
      jpyToVnd: parseTravelNumber($('#travelJpyToVnd')?.value) || 175,
      defaultSellCurrency: $('#travelDefaultSellCurrency')?.value || 'JPY',
      defaultMarkup: parseTravelNumber($('#travelDefaultMarkup')?.value)
    };
    travelData.source = {
      ...(travelData.source || {}),
      name: travelData.source?.name || 'Nguồn tham khảo',
      notice: 'Giá tham khảo, có thể thay đổi theo thời điểm, dung lượng và khuyến mãi. Vui lòng liên hệ để được báo giá.'
    };
  }

  function collectOrderData() {
    orderData = {
      ...orderData,
      schemaVersion: 1,
      mode: $('#simOrderMode').value,
      messengerUrl: $('#simMessengerUrl').value.trim(),
      facebookUrl: $('#simFacebookUrl').value.trim(),
      customPageUrl: $('#simCustomOrderUrl').value.trim(),
      messageTemplate: $('#simMessageTemplate').value,
      copyMessageBeforeOpen: $('#simCopyMessage').checked,
      appendTextQuery: $('#simAppendText').checked,
      openInNewTab: false,
      labels: { ...(orderData.labels || {}), friend: 'Liên hệ' }
    };
  }

  function collect(kind = 'all') {
    if (kind === 'sim' || kind === 'all') collectSimData();
    if (kind === 'travel' || kind === 'all') collectTravelData();
    if (kind === 'order' || kind === 'all') collectOrderData();
  }

  function configKindForView(view = activeView) {
    if (view === 'order') return 'order';
    if (view === 'travel') return 'travel';
    return 'sim';
  }

  function setConfigStatus(kind, message) {
    $$(`[data-config-status="${kind}"]`).forEach(node => { node.textContent = message; });
  }

  function defaultStatus(kind) {
    if (kind === 'order') {
      return `Đang nhận đơn qua ${orderData.mode === 'custom-page' ? 'trang riêng' : 'Messenger'} · file order-config.json`;
    }
    if (kind === 'travel') {
      const visibleTravel = travelData.plans.filter(item => item.enabled !== false && item.showCard !== false && availableTypes(item).length).length;
      return `${visibleTravel} gói SIM du lịch đang hiện · nguồn ${travelData.source?.name || 'tham khảo'} · file travel-sim-plans.json`;
    }
    const visible = simData.plans.filter(item => item.enabled !== false && item.showCard !== false && availableTypes(item).length).length;
    const soldOut = simData.plans.filter(item => item.enabled !== false && item.showCard !== false && availableTypes(item).length && item.soldOut === true).length;
    const stockText = soldOut ? ` · ${soldOut} gói hết hàng` : '';
    if (['monthly', 'yearly', 'voice'].includes(activeView)) {
      return `${visiblePlans().length} gói trong mục này · ${visible} gói đang hiện${stockText} · file sim-plans.json`;
    }
    return `${visible} gói đang hiện${stockText} · file sim-plans.json`;
  }

  function updateDownloads(kind = 'all', refreshStatus = true) {
    collect(kind);
    if (kind === 'sim' || kind === 'all') {
      const simUrl = makeUrl('sim', simData);
      $$('[data-download-config="sim"]').forEach(link => {
        link.href = simUrl;
        link.download = 'sim-plans.json';
      });
      if (refreshStatus) setConfigStatus('sim', defaultStatus('sim'));
    }
    if (kind === 'travel' || kind === 'all') {
      const travelUrl = makeUrl('travel', travelData);
      $$('[data-download-config="travel"]').forEach(link => {
        link.href = travelUrl;
        link.download = 'travel-sim-plans.json';
      });
      if (refreshStatus) setConfigStatus('travel', defaultStatus('travel'));
    }
    if (kind === 'order' || kind === 'all') {
      const orderUrl = makeUrl('order', orderData);
      $$('[data-download-config="order"]').forEach(link => {
        link.href = orderUrl;
        link.download = 'order-config.json';
      });
      if (refreshStatus) setConfigStatus('order', defaultStatus('order'));
    }
  }

  function updateView() {
    $$('[data-sim-admin-view]').forEach(button => {
      const active = button.dataset.simAdminView === activeView;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
    $$('[data-sim-admin-section]').forEach(section => {
      const sectionName = section.dataset.simAdminSection;
      section.hidden = sectionName === 'products' ? !PRODUCT_VIEWS.has(activeView) : sectionName !== activeView;
    });
    const configKind = configKindForView();
    $$('[data-config-toolbar]').forEach(toolbar => {
      if (toolbar.closest('[data-sim-admin-section="products"]')) toolbar.hidden = toolbar.dataset.configToolbar !== configKind;
    });
    const productSection = $('[data-sim-admin-section="products"]');
    if (productSection) productSection.dataset.configKind = configKind;
    const travelPricingSettings = $('#travelPricingSettings');
    if (travelPricingSettings) travelPricingSettings.hidden = activeView !== 'travel';
    if (PRODUCT_VIEWS.has(activeView)) {
      const meta = VIEW_META[activeView];
      $('#simProductManagerTitle').textContent = meta.title;
      $('#simProductManagerDescription').textContent = meta.description;
      $('#addSimPlan').textContent = `+ Thêm ${activeView === 'voice' ? 'SIM nghe gọi' : (activeView === 'travel' ? 'gói du lịch' : 'gói SIM')}`;
      render();
    }
    localStorage.setItem('vinh-sim-admin-view', activeView);
    updateDownloads(configKindForView());
  }

  function switchView(view) {
    if (!VIEW_META[view] || view === activeView) return;
    collect(configKindForView());
    activeView = view;
    updateView();
  }

  function uniqueId(candidate, excluded = []) {
    const excludedSet = new Set(excluded);
    const used = new Set(activePlans().filter(item => !excludedSet.has(item.id)).map(item => item.id));
    let value = candidate;
    let index = 2;
    while (used.has(value)) value = `${candidate}-${index++}`;
    return value;
  }

  function addPlan() {
    const kind = configKindForView();
    collect(kind);
    const meta = VIEW_META[activeView] || VIEW_META.monthly;
    const stamp = Date.now();
    const id = `${activeView === 'travel' ? 'travel' : 'sim'}-${stamp}`;
    const isTravel = activeView === 'travel';
    activePlans().push(normalizePlan({
      id,
      familyId: id,
      enabled: true,
      showCard: true,
      soldOut: false,
      planKind: meta.kind || 'data',
      period: meta.period || 'monthly',
      simType: isTravel ? 'esim' : 'both',
      physicalEnabled: !isTravel,
      esimEnabled: true,
      priceMode: 'same',
      physicalPrice: 'Liên hệ',
      esimPrice: 'Liên hệ',
      carrier: isTravel ? 'Quốc gia / khu vực mới' : 'SoftBank',
      country: isTravel ? 'Quốc gia / khu vực mới' : '',
      travelRegion: isTravel ? 'Khác' : '',
      referenceCheckedAt: isTravel ? new Date().toISOString().slice(0, 10) : '',
      sourceName: isTravel ? 'Nguồn tham khảo' : '',
      sourceUrl: '',
      showPrice: isTravel ? false : true,
      sourcePriceValue: 0,
      sourceCurrency: 'USD',
      sellCurrency: isTravel ? (travelData.pricing?.defaultSellCurrency || 'JPY') : 'JPY',
      exchangeRate: isTravel ? travelRate('USD', travelData.pricing?.defaultSellCurrency || 'JPY') : 1,
      markupValue: isTravel ? Number(travelData.pricing?.defaultMarkup || 0) : 0,
      sellPriceValue: 0,
      name: isTravel ? 'eSIM du lịch mới' : (activeView === 'voice' ? 'SIM nghe gọi mới' : 'Gói SIM data mới'),
      cardName: isTravel ? '✈️ eSIM du lịch mới' : (activeView === 'voice' ? 'SIM nghe gọi mới' : 'Gói SIM mới'),
      subtitle: isTravel ? 'Giá tham khảo, có thể thay đổi theo thời điểm, dung lượng và khuyến mãi. Vui lòng liên hệ để được báo giá.' : 'Có thể chọn eSIM hoặc SIM vật lý khi đặt hàng.',
      price: isTravel ? 'Liên hệ báo giá' : 'Liên hệ',
      dataLabel: isTravel ? 'Nhiều mức dung lượng' : '',
      durationLabel: isTravel ? '1–30 ngày' : '',
      image: isTravel ? '/img/sim/travel-esim.svg' : DEFAULT_SIM_IMAGE,
      features: [],
      requirements: [],
      recommendedFor: ''
    }));
    render();
    updateDownloads(kind);
    document.querySelector('.sim-admin-card:last-child')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function duplicatePlan(cardNode) {
    collectCard(cardNode);
    const store = activePlans();
    const original = store.find(item => item.id === cardNode.dataset.simAdminId);
    if (!original) return;
    const clone = structuredClone(original);
    const base = original.id.replace(/-copy(?:-\d+)?$/, '');
    clone.id = uniqueId(`${base}-copy`);
    clone.familyId = clone.id;
    clone.cardName = `${clone.cardName || clone.name || 'Gói SIM'} - bản sao`;
    const index = store.indexOf(original);
    store.splice(index + 1, 0, clone);
    render();
    updateDownloads(configKindForView());
  }



  function isExpectedConfig(parsed, kind) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    if (kind === 'sim') return Array.isArray(parsed.plans) || Boolean(parsed.page) || Array.isArray(parsed.faqs);
    if (kind === 'travel') return Array.isArray(parsed.plans) && !Boolean(parsed.page);
    const orderKeys = ['mode', 'messengerUrl', 'facebookUrl', 'customPageUrl', 'messageTemplate', 'copyMessageBeforeOpen', 'appendTextQuery', 'openInNewTab'];
    return !Array.isArray(parsed.plans) && orderKeys.some(key => Object.prototype.hasOwnProperty.call(parsed, key));
  }

  async function importJson(file, kind) {
    if (!file) return;
    const expectedName = kind === 'sim' ? 'sim-plans.json' : (kind === 'travel' ? 'travel-sim-plans.json' : 'order-config.json');
    try {
      const parsed = JSON.parse(await file.text());
      if (!isExpectedConfig(parsed, kind)) {
        alert(`File vừa chọn không đúng cấu trúc ${expectedName}. Hệ thống chưa nhập để tránh ghi nhầm dữ liệu.`);
        setConfigStatus(kind, `Đã chặn file không đúng loại. Tab này chỉ nhận ${expectedName}.`);
        return;
      }
      if (kind === 'sim') simData = normalizeSimData(parsed);
      else if (kind === 'travel') travelData = normalizeTravelData(parsed);
      else orderData = parsed;
      fillPage();
      updateView();
      updateDownloads(kind, false);
      setConfigStatus(kind, `Đã nhập ${file.name || expectedName}. Kiểm tra lại rồi tải ${expectedName}.`);
    } catch (_) {
      alert(`File JSON không hợp lệ. Tab này chỉ nhận ${expectedName}.`);
      setConfigStatus(kind, `Không thể đọc file. Hãy chọn đúng ${expectedName}.`);
    }
  }

  function bind() {
    document.addEventListener('input', event => {
      if (!event.target.closest('#simAdminPanel') || event.target.matches('[data-import-config]')) return;
      const cardNode = event.target.closest('.sim-admin-card');
      if (cardNode && event.target.dataset.simField === 'image') updateCardImagePreview(cardNode);
      const kind = event.target.closest('[data-config-kind]')?.dataset.configKind || configKindForView();
      updateDownloads(kind);
    });
    document.addEventListener('change', event => {
      if (!event.target.closest('#simAdminPanel') || event.target.matches('[data-import-config]')) return;
      const cardNode = event.target.closest('.sim-admin-card');
      if (cardNode && event.target.dataset.simField === 'carrier' && activeView !== 'travel') syncCarrierImage(cardNode);
      if (cardNode && ['physicalEnabled', 'esimEnabled'].includes(event.target.dataset.simField)) {
        const physical = cardNode.querySelector('[data-sim-field="physicalEnabled"]');
        const esim = cardNode.querySelector('[data-sim-field="esimEnabled"]');
        if (!physical?.checked && !esim?.checked) {
          event.target.checked = true;
          alert(activeView === 'travel' ? 'Gói SIM du lịch phải bật eSIM. Muốn ẩn gói, hãy tắt “Hiển thị”.' : 'Mỗi sản phẩm phải bật ít nhất một loại: eSIM hoặc SIM vật lý. Muốn ẩn cả sản phẩm, hãy tắt “Hiển thị sản phẩm trên website”.');
        }
      }
      if (cardNode && (['planKind', 'period', 'physicalEnabled', 'esimEnabled', 'soldOut', 'showPrice'].includes(event.target.dataset.simField)
        || event.target.matches('[data-sim-visible], [data-sim-price-mode]'))) {
        collectCard(cardNode);
        render();
      }
      const kind = event.target.closest('[data-config-kind]')?.dataset.configKind || configKindForView();
      updateDownloads(kind);
    });
    document.addEventListener('click', event => {
      const viewButton = event.target.closest('[data-sim-admin-view]');
      if (viewButton) { switchView(viewButton.dataset.simAdminView); return; }

      if (event.target.closest('#toggleSimAdminMenu')) {
        const workspace = $('#simAdminWorkspace');
        workspace?.classList.toggle('menu-collapsed');
        localStorage.setItem('vinh-sim-admin-menu-collapsed', workspace?.classList.contains('menu-collapsed') ? '1' : '0');
        return;
      }
      if (event.target.closest('#addSimPlan')) { addPlan(); return; }
      if (event.target.closest('#addSimFaq')) { addFaq(); return; }
      if (event.target.closest('#addSimApnFaq')) { addFaq(DEFAULT_APN_FAQ); return; }

      const faqMove = event.target.closest('[data-move-sim-faq]');
      if (faqMove) {
        const node = faqMove.closest('.sim-faq-admin-item');
        moveFaq(Number(node?.dataset.simFaqIndex), faqMove.dataset.moveSimFaq);
        return;
      }

      const faqRemove = event.target.closest('[data-remove-sim-faq]');
      if (faqRemove) {
        const node = faqRemove.closest('.sim-faq-admin-item');
        removeFaq(Number(node?.dataset.simFaqIndex));
        return;
      }

      const saveButton = event.target.closest('[data-save-config]');
      if (saveButton) {
        const kind = saveButton.dataset.saveConfig;
        collect(kind);
        const payload = kind === 'sim' ? simData : (kind === 'travel' ? travelData : orderData);
        localStorage.setItem(DRAFT_KEYS[kind], JSON.stringify(payload));
        updateDownloads(kind, false);
        const fileName = kind === 'sim' ? 'sim-plans.json' : (kind === 'travel' ? 'travel-sim-plans.json' : 'order-config.json');
        setConfigStatus(kind, `Đã lưu tạm riêng ${fileName} trên trình duyệt này. Chưa thay đổi file trên máy chủ.`);
        return;
      }

      const cardNode = event.target.closest('.sim-admin-card');
      if (cardNode && event.target.closest('[data-travel-use-rate]')) {
        const from = cardNode.querySelector('[data-sim-field="sourceCurrency"]')?.value || 'USD';
        const to = cardNode.querySelector('[data-sim-field="sellCurrency"]')?.value || 'JPY';
        const rateInput = cardNode.querySelector('[data-sim-field="exchangeRate"]');
        const rate = travelRate(from, to);
        if (rateInput) rateInput.value = rate || '';
        updateDownloads('travel');
        return;
      }
      if (cardNode && event.target.closest('[data-travel-calculate-price]')) {
        const source = parseTravelNumber(cardNode.querySelector('[data-sim-field="sourcePriceValue"]')?.value);
        const rate = parseTravelNumber(cardNode.querySelector('[data-sim-field="exchangeRate"]')?.value);
        const markup = parseTravelNumber(cardNode.querySelector('[data-sim-field="markupValue"]')?.value);
        const currency = cardNode.querySelector('[data-sim-field="sellCurrency"]')?.value || 'JPY';
        const result = Math.max(0, source * rate + markup);
        const priceInput = cardNode.querySelector('[data-sim-field="sellPriceValue"]');
        if (priceInput) priceInput.value = currency === 'USD' ? result.toFixed(2) : String(Math.round(result));
        const preview = cardNode.querySelector('[data-travel-price-preview]');
        if (preview) preview.textContent = `Ngoài trang: ${formatTravelMoney(result, currency)}`;
        collectCard(cardNode);
        updateDownloads('travel');
        return;
      }
      if (cardNode && event.target.closest('[data-travel-open-source]')) {
        const sourceUrl = cardNode.querySelector('[data-sim-field="sourceUrl"]')?.value.trim();
        if (sourceUrl) window.open(sourceUrl, '_blank', 'noopener');
        else alert('Gói này chưa có link nguồn tham khảo.');
        return;
      }
      if (cardNode && event.target.closest('[data-use-carrier-image]')) {
        syncCarrierImage(cardNode, true);
        collectCard(cardNode);
        updateDownloads('sim');
        return;
      }
      if (cardNode && event.target.closest('[data-duplicate-sim-plan]')) { duplicatePlan(cardNode); return; }

      const remove = event.target.closest('[data-remove-sim-plan]');
      if (remove) {
        const node = remove.closest('.sim-admin-card');
        const id = node.dataset.simAdminId;
        const store = activePlans();
        const plan = store.find(item => item.id === id);
        if (plan && confirm(`Xóa “${plan.cardName || plan.name}”?`)) {
          const next = store.filter(item => item.id !== id);
          if (activeView === 'travel') travelData.plans = next;
          else simData.plans = next;
          render();
          updateDownloads(configKindForView());
        }
      }
    });
    $$('[data-import-config]').forEach(input => {
      input.addEventListener('change', event => {
        importJson(event.target.files?.[0], event.target.dataset.importConfig);
        event.target.value = '';
      });
    });
  }

  function readDraft(kind, legacyDraft = null) {
    const raw = localStorage.getItem(DRAFT_KEYS[kind]);
    if (raw) {
      try { return JSON.parse(raw); } catch (_) {}
    }
    if (kind === 'sim') return legacyDraft?.simData;
    if (kind === 'travel') return null;
    return legacyDraft?.orderData;
  }

  async function init() {
    bind();
    let legacyDraft = null;
    try {
      const rawLegacy = localStorage.getItem(DRAFT_KEYS.legacy);
      if (rawLegacy) legacyDraft = JSON.parse(rawLegacy);
    } catch (_) {}

    const [simResult, travelResult, orderResult] = await Promise.allSettled([
      fetch(`/data/sim-plans.json?v=${VERSION}`, { cache: 'no-cache' }),
      fetch(`/data/travel-sim-plans.json?v=${VERSION}`, { cache: 'no-cache' }),
      fetch(`/data/order-config.json?v=${VERSION}`, { cache: 'no-cache' })
    ]);

    let simLoaded = false;
    if (simResult.status === 'fulfilled' && simResult.value.ok) {
      try {
        simData = normalizeSimData(await simResult.value.json());
        simLoaded = true;
      } catch (_) {}
    }
    if (!simLoaded) {
      const draft = readDraft('sim', legacyDraft);
      if (draft) simData = normalizeSimData(draft);
      setConfigStatus('sim', draft ? 'Không đọc được máy chủ; đang dùng bản lưu tạm sim-plans.json.' : 'Không đọc được sim-plans.json trên máy chủ.');
    }

    let travelLoaded = false;
    if (travelResult.status === 'fulfilled' && travelResult.value.ok) {
      try {
        travelData = normalizeTravelData(await travelResult.value.json());
        travelLoaded = true;
      } catch (_) {}
    }
    if (!travelLoaded) {
      const draft = readDraft('travel', legacyDraft);
      if (draft) travelData = normalizeTravelData(draft);
      setConfigStatus('travel', draft ? 'Không đọc được máy chủ; đang dùng bản lưu tạm travel-sim-plans.json.' : 'Không đọc được travel-sim-plans.json trên máy chủ.');
    }

    let orderLoaded = false;
    if (orderResult.status === 'fulfilled' && orderResult.value.ok) {
      try {
        orderData = await orderResult.value.json();
        orderLoaded = true;
      } catch (_) {}
    }
    if (!orderLoaded) {
      const draft = readDraft('order', legacyDraft);
      if (draft) orderData = draft;
      setConfigStatus('order', draft ? 'Không đọc được máy chủ; đang dùng bản lưu tạm order-config.json.' : 'Không đọc được order-config.json trên máy chủ.');
    }

    fillPage();
    const workspace = $('#simAdminWorkspace');
    if (workspace && localStorage.getItem('vinh-sim-admin-menu-collapsed') === '1') workspace.classList.add('menu-collapsed');
    updateView();
    updateDownloads('all');
    if (!simLoaded) {
      const draft = readDraft('sim', legacyDraft);
      setConfigStatus('sim', draft ? 'Không đọc được máy chủ; đang dùng bản lưu tạm sim-plans.json.' : 'Không đọc được sim-plans.json trên máy chủ.');
    }
    if (!travelLoaded) {
      const draft = readDraft('travel', legacyDraft);
      setConfigStatus('travel', draft ? 'Không đọc được máy chủ; đang dùng bản lưu tạm travel-sim-plans.json.' : 'Không đọc được travel-sim-plans.json trên máy chủ.');
    }
    if (!orderLoaded) {
      const draft = readDraft('order', legacyDraft);
      setConfigStatus('order', draft ? 'Không đọc được máy chủ; đang dùng bản lưu tạm order-config.json.' : 'Không đọc được order-config.json trên máy chủ.');
    }
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
