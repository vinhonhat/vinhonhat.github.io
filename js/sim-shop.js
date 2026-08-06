(() => {
  'use strict';

  const VERSION = window.VinhSiteVersion?.id || 'dev';
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const DEFAULT_APN_URL = '/pages/pages-baiviet/sim/cau-hinh-sim-data-sim-nghe-goi-20251109.html';
  const DEFAULT_SIM_IMAGE = '/img/sim/sim-softbank.svg';
  const DEFAULT_HERO_IMAGE = '/img/sim/sim-softbank.svg';
  const DEFAULT_HERO_MOBILE_IMAGE = '/img/sim/sim-softbank-mobile.svg';
  const DEFAULT_TRAVEL_DAY_OPTIONS = Object.freeze([
    '1 ngày','2 ngày','3 ngày','4 ngày','5 ngày','6 ngày','7 ngày','8 ngày','9 ngày','10 ngày','12 ngày','15 ngày','20 ngày','25 ngày','30 ngày'
  ]);
  const DEFAULT_TRAVEL_PACKAGE_OPTIONS = Object.freeze([
    'Hàng ngày - 0,5GB','Hàng ngày - 1GB','Hàng ngày - 2GB','Hàng ngày - 3GB','Hàng ngày - 100GB','Mạng 5G - Hàng ngày - 100GB-plus',
    'Tổng cộng - 1GB','Tổng cộng - 3GB','Tổng cộng - 5GB','Tổng cộng - 10GB','Tổng cộng - 20GB','Tổng cộng - 30GB','Tổng cộng - 50GB'
  ]);

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

  function planImage(plan = {}) {
    const image = String(plan.image || '').trim();
    const mapped = carrierImage(plan.carrier);
    if (!image || LEGACY_SIM_IMAGES.has(image)) return mapped || DEFAULT_SIM_IMAGE;
    return image;
  }

  const DEFAULT_ORDER = {
    mode: 'messenger',
    messengerUrl: 'https://m.me/tqv2022',
    facebookUrl: 'https://fb.com/tqv2022',
    customPageUrl: '/pages/pages-app/dat-sim.html',
    openInNewTab: false,
    copyMessageBeforeOpen: true,
    appendTextQuery: true,
    messageTemplate: "Xin chào, tôi muốn mua SIM:\n\n- Gói: {{name}}\n- Nhà mạng: {{carrier}}\n- Loại: {{simType}}\n- Chu kỳ: {{period}}\n- Dung lượng: {{data}}\n- Số lượng: {{quantity}}\n- Giá tham khảo: {{price}}\n\nMong shop xác nhận và tư vấn giúp tôi.",
    travelMessageTemplate: "Xin chào, tôi muốn mua SIM:\n\nLựa chọn SIM du lịch:\n- Gói: {{name}}\n- Gói dung lượng: {{travelPackage}}\n- Ngày sử dụng: {{travelDays}}\n- Thanh toán: {{paymentCurrency}}\n- Số lượng: {{quantity}}\n- Giá tham khảo: {{price}}\n\nMong shop xác nhận và tư vấn giúp tôi.",
    labels: {
      buy: 'Mua SIM',
      friend: 'Liên hệ',
      copied: 'Đã sao chép nội dung đặt SIM. Hãy mở ô soạn tin nhắn trong Messenger, dán nội dung rồi nhấn gửi.',
      custom: 'Mở trang đặt SIM'
    }
  };

  let pageConfig = {};
  let plans = [];
  let travelData = { source: {}, selectionOptions: {}, plans: [] };
  let travelSearch = '';
  let travelRegion = '';
  let travelPaymentCurrency = '';
  const TRAVEL_RATE_CACHE_KEY = 'vinh-travel-live-rates-v1';
  const TRAVEL_RATE_CACHE_MS = 12 * 60 * 60 * 1000;
  let orderConfig = structuredClone(DEFAULT_ORDER);
  let currentView = 'monthly';
  let activePlan = null;
  let selectedSimType = '';
  let selectedTravelDay = '';
  let selectedTravelPackage = '';
  let quantity = 1;


  function normalizeTravelChoice(item, index, prefix) {
    const raw = typeof item === 'string' ? { label: item } : (item && typeof item === 'object' ? item : {});
    return {
      id: String(raw.id || `${prefix}-${index + 1}`),
      label: String(raw.label || '').trim(),
      enabled: raw.enabled !== false
    };
  }

  function normalizeTravelSelectionOptions(input) {
    const data = input && typeof input === 'object' ? input : {};
    const days = Array.isArray(data.days) && data.days.length ? data.days : DEFAULT_TRAVEL_DAY_OPTIONS;
    const packages = Array.isArray(data.packages) && data.packages.length ? data.packages : DEFAULT_TRAVEL_PACKAGE_OPTIONS;
    return {
      enabled: data.enabled !== false,
      validityNote: String(data.validityNote || 'Có hiệu lực trong vòng 60 ngày kể từ khi đặt').trim(),
      days: days.map((item, index) => normalizeTravelChoice(item, index, 'day')).filter(item => item.label),
      packages: packages.map((item, index) => normalizeTravelChoice(item, index, 'package')).filter(item => item.label)
    };
  }

  function enabledTravelChoices(type) {
    const selection = normalizeTravelSelectionOptions(travelData.selectionOptions);
    return (type === 'day' ? selection.days : selection.packages).filter(item => item.enabled !== false);
  }

  function normalizeOrder(input) {
    const data = input && typeof input === 'object' ? input : {};
    const labels = { ...DEFAULT_ORDER.labels, ...(data.labels || {}), friend: 'Liên hệ' };
    const legacyTravelTemplate = 'Xin chào, tôi muốn mua SIM:\n\nLựa chọn SIM du lịch:\n- Gói: {{name}}\n- Gói dung lượng: {{travelPackage}}\n- Ngày sử dụng: {{travelDays}}\n- Số lượng: {{quantity}}\n- Giá tham khảo: {{price}}\n\nMong shop xác nhận và tư vấn giúp tôi.';
    const travelMessageTemplate = !data.travelMessageTemplate || data.travelMessageTemplate === legacyTravelTemplate
      ? DEFAULT_ORDER.travelMessageTemplate
      : data.travelMessageTemplate;
    return {
      ...DEFAULT_ORDER,
      ...data,
      travelMessageTemplate,
      labels
    };
  }

  function legacyAvailability(plan, type) {
    if (typeof plan[type === 'physical' ? 'physicalEnabled' : 'esimEnabled'] === 'boolean') {
      return plan[type === 'physical' ? 'physicalEnabled' : 'esimEnabled'];
    }
    const legacyType = ['both', 'physical', 'esim'].includes(plan.simType) ? plan.simType : 'physical';
    return legacyType === 'both' || legacyType === type;
  }

  function normalizePlan(plan = {}) {
    const legacyVariant = !Object.prototype.hasOwnProperty.call(plan, 'physicalEnabled')
      && !Object.prototype.hasOwnProperty.call(plan, 'esimEnabled')
      && ['physical', 'esim'].includes(plan.simType);
    const physicalEnabled = legacyAvailability(plan, 'physical');
    const esimEnabled = legacyAvailability(plan, 'esim');
    const priceMode = plan.priceMode === 'separate' ? 'separate' : 'same';
    const commonPrice = String(plan.price || '').trim();
    const physicalPrice = String(plan.physicalPrice || commonPrice || '').trim();
    const esimPrice = String(plan.esimPrice || commonPrice || '').trim();
    const simType = physicalEnabled && esimEnabled ? 'both' : (esimEnabled ? 'esim' : 'physical');
    const id = String(plan.id || `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    const normalized = {
      ...plan,
      id,
      familyId: String(plan.familyId || id),
      planKind: plan.planKind === 'travel' ? 'travel' : (plan.planKind === 'voice' ? 'voice' : 'data'),
      period: plan.planKind === 'travel' ? 'travel' : (plan.period === 'yearly' ? 'yearly' : 'monthly'),
      simType,
      physicalEnabled,
      esimEnabled,
      priceMode,
      price: commonPrice || physicalPrice || esimPrice || 'Liên hệ',
      physicalPrice: physicalPrice || commonPrice || 'Liên hệ',
      esimPrice: esimPrice || commonPrice || 'Liên hệ',
      image: planImage(plan),
      soldOut: plan.soldOut === true,
      showPrice: plan.showPrice !== false,
      sourceCurrency: ['USD','JPY','VND'].includes(plan.sourceCurrency) ? plan.sourceCurrency : 'USD',
      sellCurrency: ['USD','JPY','VND'].includes(plan.sellCurrency) ? plan.sellCurrency : 'JPY',
      sourcePriceValue: Number.isFinite(Number(plan.sourcePriceValue)) ? Number(plan.sourcePriceValue) : 0,
      exchangeRate: Number.isFinite(Number(plan.exchangeRate)) ? Number(plan.exchangeRate) : 0,
      markupValue: Number.isFinite(Number(plan.markupValue)) ? Number(plan.markupValue) : 0,
      sellPriceValue: Number.isFinite(Number(plan.sellPriceValue)) ? Number(plan.sellPriceValue) : 0,
      features: Array.isArray(plan.features) ? plan.features : [],
      requirements: Array.isArray(plan.requirements) ? plan.requirements : []
    };
    Object.defineProperty(normalized, '_legacyVariant', { value: legacyVariant, enumerable: false, configurable: true });
    return normalized;
  }

  function mergeLegacyPair(physical, esim) {
    const samePrice = String(physical.price || '').trim() === String(esim.price || '').trim();
    const base = structuredClone(physical);
    const enabledPhysical = physical.enabled !== false && physical.showCard !== false;
    const enabledEsim = esim.enabled !== false && esim.showCard !== false;
    return normalizePlan({
      ...base,
      id: String(physical.familyId || physical.id || esim.id),
      familyId: String(physical.familyId || esim.familyId || physical.id || esim.id),
      enabled: enabledPhysical || enabledEsim,
      showCard: enabledPhysical || enabledEsim,
      physicalEnabled: enabledPhysical,
      esimEnabled: enabledEsim,
      simType: 'both',
      priceMode: samePrice ? 'same' : 'separate',
      price: samePrice ? physical.price : (physical.price || esim.price),
      physicalPrice: physical.price || 'Liên hệ',
      esimPrice: esim.price || 'Liên hệ',
      soldOut: physical.soldOut === true && esim.soldOut === true,
      features: Array.from(new Set([...(physical.features || []), ...(esim.features || [])])),
      requirements: Array.from(new Set([...(physical.requirements || []), ...(esim.requirements || [])]))
    });
  }

  function consolidatePlans(input) {
    const normalized = (Array.isArray(input) ? input : []).map(normalizePlan);
    const consumed = new Set();
    const output = [];
    normalized.forEach(plan => {
      if (consumed.has(plan)) return;
      const isLegacySingleType = plan._legacyVariant === true;
      if (isLegacySingleType && plan.familyId) {
        const pair = normalized.find(item => item !== plan
          && !consumed.has(item)
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

  function viewLabel(view) {
    if (view === 'travel') return pageConfig.travelLabel || 'SIM du lịch';
    if (view === 'voice') return pageConfig.voiceLabel || 'SIM nghe gọi';
    return view === 'yearly' ? (pageConfig.yearlyLabel || 'SIM năm') : (pageConfig.monthlyLabel || 'SIM tháng');
  }

  function planView(plan) {
    if (plan.planKind === 'travel') return 'travel';
    if (plan.planKind === 'voice') return 'voice';
    return plan.period === 'yearly' ? 'yearly' : 'monthly';
  }

  function typeLabel(type) {
    if (type === 'esim') return pageConfig.esimLabel || 'eSIM';
    return pageConfig.physicalLabel || 'SIM vật lý';
  }

  function availableTypes(plan) {
    const types = [];
    if (plan.physicalEnabled !== false) types.push('physical');
    if (plan.esimEnabled !== false) types.push('esim');
    return types;
  }

  function defaultType(plan) {
    const types = availableTypes(plan);
    return types.includes('physical') ? 'physical' : (types[0] || 'physical');
  }

  function formatTravelMoney(value, currency = 'JPY') {
    const number = Number(value || 0);
    if (!Number.isFinite(number) || number <= 0) return 'Liên hệ báo giá';
    if (currency === 'VND') return `${Math.round(number).toLocaleString('vi-VN')}₫`;
    if (currency === 'USD') return `US$${number.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    return `¥${Math.round(number).toLocaleString('ja-JP')}`;
  }


  function optionalTravelNumber(value) {
    if (value === '' || value === null || typeof value === 'undefined') return null;
    const number = Number(String(value).replace(/,/g, '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(number) ? number : null;
  }

  function travelRateFromPricing(pricing, from, to) {
    if (from === to) return 1;
    const usdToJpy = Number(pricing?.usdToJpy || 0) + Number(pricing?.usdToJpyAdjustment || 0);
    const usdToVnd = Number(pricing?.usdToVnd || 0) + Number(pricing?.usdToVndAdjustment || 0);
    const jpyToVnd = Number(pricing?.jpyToVnd || 0) + Number(pricing?.jpyToVndAdjustment || 0);
    if (from === 'USD' && to === 'JPY') return usdToJpy;
    if (from === 'USD' && to === 'VND') return usdToVnd;
    if (from === 'JPY' && to === 'VND') return jpyToVnd;
    if (from === 'JPY' && to === 'USD') return usdToJpy ? 1 / usdToJpy : 0;
    if (from === 'VND' && to === 'USD') return usdToVnd ? 1 / usdToVnd : 0;
    if (from === 'VND' && to === 'JPY') return jpyToVnd ? 1 / jpyToVnd : 0;
    return 0;
  }

  function validTravelRatePayload(payload) {
    return payload && Number(payload.usdToJpy) > 0 && Number(payload.usdToVnd) > 0 && Number(payload.jpyToVnd) > 0;
  }

  function applyLiveTravelRates(payload) {
    if (!validTravelRatePayload(payload)) return false;
    travelData.pricing = {
      ...(travelData.pricing || {}),
      usdToJpy: Number(payload.usdToJpy),
      usdToVnd: Number(payload.usdToVnd),
      jpyToVnd: Number(payload.jpyToVnd),
      liveRateDate: payload.date || '',
      liveRateFetchedAt: payload.fetchedAt || new Date().toISOString()
    };
    return true;
  }

  async function refreshTravelRatesOnline() {
    const pricing = travelData.pricing || {};
    if (pricing.autoRateEnabled === false) return;
    try {
      const cached = JSON.parse(localStorage.getItem(TRAVEL_RATE_CACHE_KEY) || 'null');
      if (cached && Date.now() - Number(cached.cachedAt || 0) < TRAVEL_RATE_CACHE_MS && applyLiveTravelRates(cached)) return;
    } catch (_) {}
    try {
      const response = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=JPY,VND', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const usdToJpy = Number(data?.rates?.JPY || 0);
      const usdToVnd = Number(data?.rates?.VND || 0);
      const payload = {
        usdToJpy,
        usdToVnd,
        jpyToVnd: usdToJpy > 0 ? usdToVnd / usdToJpy : 0,
        date: String(data?.date || ''),
        fetchedAt: new Date().toISOString(),
        cachedAt: Date.now()
      };
      if (applyLiveTravelRates(payload)) localStorage.setItem(TRAVEL_RATE_CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('Không lấy được tỷ giá online, tiếp tục dùng tỷ giá trong travel-sim-plans.json:', error);
    }
  }

  function updateTravelCurrencyControl() {
    const select = $('#travelPaymentCurrencySelect');
    const icon = $('#travelPaymentCurrencyIcon');
    const currency = activeTravelPaymentCurrency();
    if (select) select.value = currency;
    if (icon) icon.textContent = currency === 'VND' ? '₫' : '¥';
  }

  function refreshTravelCurrencyView() {
    updateTravelCurrencyControl();
    if (currentView === 'travel') renderCatalog('travel');
    if (activePlan?.planKind === 'travel') {
      const detail = $('#simDetailContent');
      if (detail) detail.innerHTML = detailTemplate(activePlan);
    }
  }

  function activeTravelPaymentCurrency() {
    if (travelPaymentCurrency === 'VND' || travelPaymentCurrency === 'JPY') return travelPaymentCurrency;
    return travelData.pricing?.defaultSellCurrency === 'VND' ? 'VND' : 'JPY';
  }

  function travelPaymentCurrencyLabel(currency = activeTravelPaymentCurrency()) {
    return currency === 'VND' ? 'Việt Nam đồng (VND)' : 'Yên Nhật (JPY)';
  }

  function convertTravelMoney(value, fromCurrency, toCurrency) {
    const number = Number(value || 0);
    if (!Number.isFinite(number) || number <= 0 || fromCurrency === toCurrency) return number;
    const rate = travelRateFromPricing(travelData.pricing || {}, fromCurrency, toCurrency);
    return rate > 0 ? number * rate : number;
  }

  function travelPlanPricing(plan, targetCurrency = activeTravelPaymentCurrency()) {
    const pricing = travelData.pricing || {};
    const sourceCurrency = ['USD','JPY','VND'].includes(plan.sourceCurrency) ? plan.sourceCurrency : 'USD';
    const sellCurrencyOverride = ['USD','JPY','VND'].includes(plan.sellCurrencyOverride) ? plan.sellCurrencyOverride : '';
    const configuredSellCurrency = sellCurrencyOverride || (['USD','JPY','VND'].includes(pricing.defaultSellCurrency) ? pricing.defaultSellCurrency : 'JPY');
    const sourceValue = Number(plan.sourcePriceValue || 0);
    const rateOverride = optionalTravelNumber(plan.exchangeRateOverride);
    const rate = rateOverride ?? travelRateFromPricing(pricing, sourceCurrency, configuredSellCurrency);
    const markupOverride = optionalTravelNumber(plan.markupValueOverride);
    const markup = markupOverride ?? Number(pricing.defaultMarkup || 0);
    const sellOverride = optionalTravelNumber(plan.sellPriceOverride);
    const calculated = Math.max(0, sourceValue * rate + markup);
    const configuredValue = sellOverride ?? calculated;
    const outputCurrency = targetCurrency === 'VND' ? 'VND' : 'JPY';
    return {
      sellCurrency: outputCurrency,
      sellValue: convertTravelMoney(configuredValue, configuredSellCurrency, outputCurrency)
    };
  }

  const TRAVEL_FLAG_MAP = {
    japan: '🇯🇵', 'nhật bản': '🇯🇵', jp: '🇯🇵',
    korea: '🇰🇷', 'south korea': '🇰🇷', 'hàn quốc': '🇰🇷', kr: '🇰🇷',
    taiwan: '🇹🇼', 'đài loan': '🇹🇼', tw: '🇹🇼',
    china: '🇨🇳', 'trung quốc': '🇨🇳', cn: '🇨🇳',
    vietnam: '🇻🇳', 'việt nam': '🇻🇳', vn: '🇻🇳',
    thailand: '🇹🇭', 'thái lan': '🇹🇭', th: '🇹🇭',
    singapore: '🇸🇬', sg: '🇸🇬',
    malaysia: '🇲🇾', my: '🇲🇾',
    indonesia: '🇮🇩', id: '🇮🇩',
    india: '🇮🇳', 'ấn độ': '🇮🇳', in: '🇮🇳',
    usa: '🇺🇸', 'united states': '🇺🇸', 'hoa kỳ': '🇺🇸', us: '🇺🇸',
    canada: '🇨🇦', ca: '🇨🇦',
    uk: '🇬🇧', 'united kingdom': '🇬🇧', 'anh': '🇬🇧', gb: '🇬🇧',
    germany: '🇩🇪', 'đức': '🇩🇪', de: '🇩🇪',
    italy: '🇮🇹', 'ý': '🇮🇹', it: '🇮🇹',
    portugal: '🇵🇹', pt: '🇵🇹',
    switzerland: '🇨🇭', ch: '🇨🇭',
    greece: '🇬🇷', gr: '🇬🇷',
    egypt: '🇪🇬', eg: '🇪🇬',
    morocco: '🇲🇦', ma: '🇲🇦',
    'saudi arabia': '🇸🇦', sa: '🇸🇦',
    israel: '🇮🇱', il: '🇮🇱',
    mexico: '🇲🇽', mx: '🇲🇽',
    australia: '🇦🇺', au: '🇦🇺',
    'new zealand': '🇳🇿', nz: '🇳🇿',
    europe: '🇪🇺', 'châu âu': '🇪🇺',
    asia: '🌏', 'châu á': '🌏',
    'đông nam á': '🌴', 'southeast asia': '🌴',
    global: '🌍', 'toàn cầu': '🌍'
  };

  function codeToFlagEmoji(code) {
    const value = String(code || '').trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(value)) return '';
    return [...value].map(char => String.fromCodePoint(127397 + char.charCodeAt(0))).join('');
  }

  function travelFlagBadge(plan) {
    const raw = String(plan.flag || '').trim();
    if (raw) {
      if (/^[A-Za-z]{2}$/.test(raw)) return codeToFlagEmoji(raw) || raw.toUpperCase();
      if (/^[\p{Regional_Indicator}\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(raw)) return raw;
    }
    const candidates = [plan.country, plan.destination, plan.cardName, plan.name, plan.id]
      .map(value => String(value || '').trim().toLowerCase())
      .filter(Boolean);
    for (const candidate of candidates) {
      for (const [key, icon] of Object.entries(TRAVEL_FLAG_MAP)) {
        if (candidate.includes(key)) return icon;
      }
      const codeMatch = candidate.match(/\b([a-z]{2})\b/);
      if (codeMatch) {
        const emoji = codeToFlagEmoji(codeMatch[1]);
        if (emoji) return emoji;
      }
    }
    return '🌍';
  }

  function planPrice(plan, type = selectedSimType || defaultType(plan)) {
    if (plan.planKind === 'travel') {
      if (plan.showPrice === false) return 'Liên hệ báo giá';
      const travelPrice = travelPlanPricing(plan);
      if (travelPrice.sellValue > 0) return formatTravelMoney(travelPrice.sellValue, travelPrice.sellCurrency);
    }
    if (plan.priceMode === 'separate') {
      if (type === 'esim') return String(plan.esimPrice || plan.price || 'Liên hệ').trim() || 'Liên hệ';
      return String(plan.physicalPrice || plan.price || 'Liên hệ').trim() || 'Liên hệ';
    }
    return String(plan.price || plan.physicalPrice || plan.esimPrice || 'Liên hệ').trim() || 'Liên hệ';
  }

  function priceNumber(value) {
    const digits = String(value || '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : Number.NaN;
  }

  function catalogPrice(plan) {
    if (plan.soldOut === true) return 'Hết hàng';
    const types = availableTypes(plan);
    if (types.length < 2 || plan.priceMode !== 'separate') return planPrice(plan, types[0] || defaultType(plan));
    const values = types.map(type => planPrice(plan, type));
    if (values[0] === values[1]) return values[0];
    const priced = values.map(value => ({ value, number: priceNumber(value) })).filter(item => Number.isFinite(item.number));
    if (priced.length) {
      priced.sort((a, b) => a.number - b.number);
      return `Từ ${priced[0].value}`;
    }
    return `${values[0]} / ${values[1]}`;
  }

  function apnSettings() {
    return {
      enabled: pageConfig.apnEnabled !== false,
      url: String(pageConfig.apnUrl || DEFAULT_APN_URL).trim() || DEFAULT_APN_URL,
      label: String(pageConfig.apnLabel || 'Tải cấu hình / APN').trim() || 'Tải cấu hình / APN'
    };
  }

  function primaryHeroSettings() {
    return {
      enabled: pageConfig.primaryButtonEnabled !== false,
      url: String(pageConfig.primaryButtonUrl || '#simPlans').trim() || '#simPlans',
      label: String(pageConfig.primaryButtonLabel || 'Xem gói SIM').trim() || 'Xem gói SIM'
    };
  }

  function configureHeroButtons() {
    const primaryLink = $('#simPrimaryHeroLink');
    if (primaryLink) {
      const primary = primaryHeroSettings();
      primaryLink.hidden = !primary.enabled;
      primaryLink.href = primary.url;
      primaryLink.textContent = primary.label;
    }
    const link = $('#simApnHeroLink');
    if (!link) return;
    const apn = apnSettings();
    link.hidden = !apn.enabled;
    link.href = apn.url;
    link.textContent = apn.label;
  }

  function configureHeroVisual() {
    const container = $('#simHeroVisual');
    if (!container) return;
    const enabled = pageConfig.heroImageEnabled !== false;
    const desktopImage = String(pageConfig.heroDesktopImageUrl || pageConfig.heroImageUrl || DEFAULT_HERO_IMAGE).trim() || DEFAULT_HERO_IMAGE;
    const mobileImage = String(pageConfig.heroMobileImageUrl || mobileHeroFromDesktop(desktopImage)).trim() || mobileHeroFromDesktop(desktopImage);
    container.hidden = !enabled;
    if (!enabled) return;
    container.classList.remove('sim-shop-carrier-stack');
    container.classList.add('sim-shop-single-visual');
    container.innerHTML = `<picture>
      <source media="(max-width: 640px)" srcset="${escapeHtml(mobileImage)}">
      <img src="${escapeHtml(desktopImage)}" alt="Ảnh đại diện SIM" loading="eager" decoding="async">
    </picture>`;
  }

  function planMatchesView(plan, view) {
    if (view === 'travel') return plan.planKind === 'travel';
    if (view === 'voice') return plan.planKind === 'voice';
    return plan.planKind === 'data' && plan.period === view;
  }

  function travelMatchesFilter(plan) {
    if (plan.planKind !== 'travel') return true;
    const regionOk = !travelRegion || String(plan.travelRegion || '').trim() === travelRegion;
    const haystack = [plan.cardName, plan.name, plan.country, plan.carrier, plan.travelRegion].join(' ').toLowerCase();
    const searchOk = !travelSearch || haystack.includes(travelSearch.toLowerCase());
    return regionOk && searchOk;
  }

  const TRAVEL_SALES_PRIORITY = [
    'travel-vietnam',
    'travel-japan',
    'travel-taiwan',
    'travel-south-korea',
    'travel-china'
  ];

  function sortTravelCatalog(items) {
    return items
      .map((plan, originalIndex) => ({ plan, originalIndex }))
      .sort((a, b) => {
        const aPriority = TRAVEL_SALES_PRIORITY.indexOf(String(a.plan.id || ''));
        const bPriority = TRAVEL_SALES_PRIORITY.indexOf(String(b.plan.id || ''));
        const aRank = aPriority >= 0 ? aPriority : TRAVEL_SALES_PRIORITY.length;
        const bRank = bPriority >= 0 ? bPriority : TRAVEL_SALES_PRIORITY.length;
        return aRank - bRank || a.originalIndex - b.originalIndex;
      })
      .map(item => item.plan);
  }

  function enabledPlans(view) {
    const items = plans.filter(plan => plan.enabled !== false
      && plan.showCard !== false
      && availableTypes(plan).length
      && planMatchesView(plan, view)
      && travelMatchesFilter(plan));
    return view === 'travel' ? sortTravelCatalog(items) : items;
  }

  function productCard(plan) {
    const soldOut = plan.soldOut === true;
    const travel = plan.planKind === 'travel';
    return `<article class="sim-product-card${soldOut ? ' is-sold-out' : ''}${travel ? ' is-travel' : ''}" data-sim-id="${escapeHtml(plan.id)}" tabindex="0" role="button" aria-label="Xem ${escapeHtml(plan.name)}${soldOut ? ' - hiện đang hết hàng' : ''}">
      <div class="sim-product-media">
        <img src="${escapeHtml(planImage(plan))}" alt="${escapeHtml(plan.name)}" loading="lazy" decoding="async">
        ${travel ? `<span class="sim-travel-flag" aria-hidden="true">${escapeHtml(travelFlagBadge(plan))}</span>` : ''}
        ${soldOut ? '<span class="sim-product-soldout-badge">Hết hàng</span>' : ''}
      </div>
      <div class="sim-product-copy">
        ${travel && plan.travelRegion ? `<small class="sim-travel-region">${escapeHtml(plan.travelRegion)}</small>` : ''}
        <h3>${escapeHtml(plan.cardName || plan.name)}</h3>
        <strong class="${soldOut ? 'sim-price-soldout' : ''}">${escapeHtml(catalogPrice(plan))}</strong>
        ${travel ? '<em>Giá tham khảo · vui lòng liên hệ</em>' : ''}
      </div>
    </article>`;
  }

  function renderCatalog(view = currentView) {
    currentView = view;
    document.querySelectorAll('[data-sim-period]').forEach(button => {
      const active = button.dataset.simPeriod === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    const filters = $('#travelSimFilters');
    if (filters) filters.hidden = view !== 'travel';
    const container = $('#simPlanGrid');
    if (!container) return;
    const items = enabledPlans(view);
    const eyebrow = view === 'travel' ? 'CHỌN QUỐC GIA HOẶC KHU VỰC' : 'CHỌN GÓI TRƯỚC, CHỌN LOẠI KHI ĐẶT';
    container.innerHTML = items.length
      ? `<section class="sim-product-group sim-product-group-all${view === 'travel' ? ' sim-product-group-travel' : ''}" data-sim-group="all">
          <header class="sim-product-group-head">
            <div><span>${eyebrow}</span><h3>${escapeHtml(viewLabel(view))}</h3></div>
            <small>${items.length} sản phẩm</small>
          </header>
          <div class="sim-product-grid">${items.map(productCard).join('')}</div>
        </section>`
      : `<div class="sim-catalog-empty"><strong>Không tìm thấy ${escapeHtml(viewLabel(view).toLowerCase())}</strong><p>Thử đổi từ khóa hoặc khu vực.</p></div>`;
  }

  function typeButtons(plan) {
    const types = availableTypes(plan);
    if (types.length < 2) return '';
    return `<div class="sim-variant-picker" role="group" aria-label="Chọn loại SIM">
      <span>Chọn loại SIM</span>
      <div>${types.map(type => `<button type="button" data-sim-type="${type}" class="${selectedSimType === type ? 'active' : ''}">${escapeHtml(typeLabel(type))}${plan.priceMode === 'separate' ? `<small>${escapeHtml(planPrice(plan, type))}</small>` : ''}</button>`).join('')}</div>
    </div>`;
  }


  function travelSelectionTemplate(plan) {
    if (plan.planKind !== 'travel') return '';
    const selection = normalizeTravelSelectionOptions(travelData.selectionOptions);
    if (selection.enabled === false) return '';
    const days = selection.days.filter(item => item.enabled !== false);
    const packages = selection.packages.filter(item => item.enabled !== false);
    if (!days.length && !packages.length) return '';
    return `<section class="sim-travel-choice-panel" aria-label="Chọn ngày và gói SIM du lịch">
      <div class="sim-travel-choice-heading">
        <h3>Ngày sử dụng</h3>
        ${selection.validityNote ? `<p>${escapeHtml(selection.validityNote)}</p>` : ''}
      </div>
      ${days.length ? `<div class="sim-travel-choice-group"><strong>Chọn ngày</strong><div class="sim-travel-choice-buttons">${days.map(item => `<button type="button" data-travel-day="${escapeHtml(item.label)}" class="${selectedTravelDay === item.label ? 'active' : ''}">${escapeHtml(item.label)}</button>`).join('')}</div></div>` : ''}
      ${packages.length ? `<div class="sim-travel-choice-group"><strong>Chọn gói</strong><div class="sim-travel-choice-buttons package-options">${packages.map(item => `<button type="button" data-travel-package="${escapeHtml(item.label)}" class="${selectedTravelPackage === item.label ? 'active' : ''}">${escapeHtml(item.label)}</button>`).join('')}</div></div>` : ''}
    </section>`;
  }

  function detailTemplate(plan) {
    const types = availableTypes(plan);
    const currentType = types.includes(selectedSimType) ? selectedSimType : defaultType(plan);
    selectedSimType = currentType;
    const features = (plan.features || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const requirements = (plan.requirements || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const labels = orderConfig.labels || DEFAULT_ORDER.labels;
    const apn = apnSettings();
    const price = planPrice(plan, currentType);
    const buyLabel = plan.soldOut === true ? 'Liên hệ' : (plan.planKind === 'travel' && plan.showPrice === false ? 'Liên hệ báo giá' : escapeHtml(orderConfig.mode === 'custom-page' ? labels.custom : labels.buy));
    return `<div class="sim-detail-grid">
      <div class="sim-detail-image"><img src="${escapeHtml(planImage(plan))}" alt="${escapeHtml(plan.name)}"></div>
      <div class="sim-detail-copy">
        <span class="sim-detail-badge">${escapeHtml(viewLabel(planView(plan)))} · ${escapeHtml(typeLabel(currentType))}</span>
        <h2 id="simDetailTitle">${escapeHtml(plan.name)}</h2>
        <p>${escapeHtml(plan.subtitle || '')}</p>
        <div class="sim-detail-price${plan.soldOut === true ? ' is-sold-out' : ''}">${plan.soldOut === true ? 'Hết hàng' : escapeHtml(price)}</div>
        ${plan.soldOut === true ? '<div class="sim-detail-soldout-note"><strong>Sản phẩm đang tạm hết hàng.</strong><span>Anh/chị vẫn có thể bấm Liên hệ để hỏi thời gian có hàng hoặc sản phẩm thay thế.</span></div>' : ''}
        ${typeButtons(plan)}
        <div class="sim-detail-specs">
          <div><span>${plan.planKind === 'travel' ? 'Điểm đến' : 'Nhà mạng'}</span><strong>${escapeHtml(plan.carrier || 'Đang cập nhật')}</strong></div>
          <div><span>Dung lượng</span><strong>${escapeHtml(plan.dataLabel || 'Đang cập nhật')}</strong></div>
          <div><span>Loại SIM</span><strong>${escapeHtml(typeLabel(currentType))}</strong></div>
          <div><span>${plan.planKind === 'travel' ? 'Thời hạn' : 'Chu kỳ'}</span><strong>${escapeHtml(plan.durationLabel || viewLabel(planView(plan)))}</strong></div>
        </div>
        ${travelSelectionTemplate(plan)}
        <div class="sim-detail-order-box${plan.soldOut === true ? ' sold-out' : ''}">
          ${plan.soldOut === true ? '' : `<div class="sim-quantity-block"><span class="sim-quantity-title">Số lượng</span><div class="sim-quantity" aria-label="Chọn số lượng"><div><button type="button" data-quantity-minus aria-label="Giảm số lượng">−</button><output id="simQuantity">${quantity}</output><button type="button" data-quantity-plus aria-label="Tăng số lượng">+</button></div></div></div>`}
          <button class="sim-buy-button${plan.soldOut === true ? ' sim-contact-button' : ''}" type="button" data-sim-buy>${buyLabel}</button>
          <button class="sim-cancel-button" type="button" data-sim-close>Hủy</button>
        </div>
        <div class="sim-detail-columns">
          <section><h3>Thông tin chính</h3><ul>${features}</ul></section>
          <section><h3>Cần kiểm tra trước</h3><ul>${requirements}</ul></section>
        </div>
        <div class="sim-detail-for"><strong>Phù hợp với:</strong> ${escapeHtml(plan.recommendedFor || '')}</div>
        ${plan.planKind === 'travel' ? '<div class="sim-travel-reference"><strong>Giá tham khảo:</strong> có thể thay đổi theo thời điểm, dung lượng và khuyến mãi. Vui lòng liên hệ để được báo giá chính xác.</div>' : ''}
        ${orderConfig.facebookUrl ? `<a class="sim-facebook-button" href="${escapeHtml(orderConfig.facebookUrl)}" target="_blank" rel="noopener">${escapeHtml(labels.friend)}</a>` : ''}
        ${apn.enabled ? `<a class="sim-apn-detail-button" href="${escapeHtml(apn.url)}">${escapeHtml(apn.label)}</a>` : ''}
      </div>
    </div>`;
  }

  function openDetail(id) {
    const plan = plans.find(item => item.id === id && item.enabled !== false && availableTypes(item).length);
    const modal = $('#simDetailModal');
    if (!plan || !modal) return;
    activePlan = plan;
    selectedSimType = defaultType(plan);
    selectedTravelDay = '';
    selectedTravelPackage = '';
    quantity = 1;
    $('#simDetailContent').innerHTML = detailTemplate(plan);
    modal.hidden = false;
    document.body.classList.add('sim-modal-open');
    $('.sim-detail-close', modal)?.focus({ preventScroll: true });
  }

  function selectType(type) {
    if (!activePlan || !availableTypes(activePlan).includes(type)) return;
    selectedSimType = type;
    $('#simDetailContent').innerHTML = detailTemplate(activePlan);
  }


  function selectTravelChoice(type, value) {
    if (!activePlan || activePlan.planKind !== 'travel') return;
    if (type === 'day') selectedTravelDay = value;
    else selectedTravelPackage = value;
    const selector = type === 'day' ? '[data-travel-day]' : '[data-travel-package]';
    document.querySelectorAll(selector).forEach(button => {
      const current = type === 'day' ? button.dataset.travelDay : button.dataset.travelPackage;
      button.classList.toggle('active', current === value);
      button.setAttribute('aria-pressed', String(current === value));
    });
  }

  function validateTravelChoices() {
    if (!activePlan || activePlan.planKind !== 'travel') return true;
    const selection = normalizeTravelSelectionOptions(travelData.selectionOptions);
    if (selection.enabled === false) return true;
    const days = enabledTravelChoices('day');
    const packages = enabledTravelChoices('package');
    if (days.length && !selectedTravelDay) {
      showToast('Vui lòng chọn ngày sử dụng.');
      document.querySelector('.sim-travel-choice-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelector('[data-travel-day]')?.focus({ preventScroll: true });
      return false;
    }
    if (packages.length && !selectedTravelPackage) {
      showToast('Vui lòng chọn gói dung lượng.');
      document.querySelector('.sim-travel-choice-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelector('[data-travel-package]')?.focus({ preventScroll: true });
      return false;
    }
    return true;
  }

  function closeDetail() {
    const modal = $('#simDetailModal');
    if (modal) modal.hidden = true;
    document.body.classList.remove('sim-modal-open');
    activePlan = null;
    selectedSimType = '';
    selectedTravelDay = '';
    selectedTravelPackage = '';
  }

  function setQuantity(next) {
    quantity = Math.max(1, Math.min(20, Number(next) || 1));
    const output = $('#simQuantity');
    if (output) output.textContent = String(quantity);
  }

  function interpolate(plan) {
    const type = availableTypes(plan).includes(selectedSimType) ? selectedSimType : defaultType(plan);
    const isTravel = plan.planKind === 'travel';
    const sourceTemplate = String(isTravel
      ? (orderConfig.travelMessageTemplate || DEFAULT_ORDER.travelMessageTemplate)
      : (orderConfig.messageTemplate || DEFAULT_ORDER.messageTemplate));
    const values = {
      id: plan.id,
      name: plan.name,
      simType: typeLabel(type),
      period: viewLabel(planView(plan)),
      data: plan.dataLabel || '',
      quantity: String(quantity),
      price: plan.soldOut === true ? 'Hết hàng - cần liên hệ' : planPrice(plan, type),
      carrier: plan.carrier || '',
      destination: plan.country || plan.carrier || '',
      travelDays: selectedTravelDay || '',
      travelPackage: selectedTravelPackage || '',
      paymentCurrency: travelPaymentCurrencyLabel()
    };
    return sourceTemplate.replace(/{{\s*([a-zA-Z]+)\s*}}/g, (_, key) => values[key] ?? '');
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    return copied;
  }

  function showToast(text) {
    const toast = $('#simOrderToast');
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { toast.hidden = true; }, 4500);
  }

  let pendingOrderDestination = '';
  let pendingOrderMessage = '';
  let orderGuideSeconds = 5;

  function ensureOrderGuide() {
    let guide = $('#simOrderGuide');
    if (guide) return guide;
    guide = document.createElement('section');
    guide.id = 'simOrderGuide';
    guide.className = 'sim-order-guide';
    guide.hidden = true;
    guide.innerHTML = `<button type="button" class="sim-order-guide-backdrop" data-order-guide-cancel aria-label="Hủy mở Messenger"></button>
      <div class="sim-order-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="simOrderGuideTitle">
        <button type="button" class="sim-order-guide-close" data-order-guide-cancel aria-label="Đóng">×</button>
        <span class="sim-order-guide-icon" aria-hidden="true">✓</span>
        <strong id="simOrderGuideTitle">Đã sao chép nội dung đặt SIM</strong>
        <p class="sim-order-guide-summary">Messenger sẽ được mở ngay trong tab hiện tại. Khi ô soạn tin nhắn xuất hiện, hãy dán nội dung rồi nhấn gửi.</p>
        <ol>
          <li>Nhấn vào ô soạn tin nhắn trong Messenger.</li>
          <li>Dán bằng <b>Ctrl + V</b> hoặc nhấn giữ rồi chọn <b>Dán</b>.</li>
          <li>Kiểm tra lại nội dung và nhấn <b>Gửi</b>.</li>
        </ol>
        <div class="sim-order-guide-countdown">Tự động tiếp tục sau <strong data-order-countdown>5</strong> giây</div>
        <div class="sim-order-guide-actions">
          <button type="button" class="sim-order-guide-copy" data-order-guide-copy>Sao chép lại</button>
          <button type="button" class="sim-order-guide-cancel" data-order-guide-cancel>Hủy</button>
          <button type="button" class="sim-order-guide-continue" data-order-guide-continue>Tiếp tục ngay</button>
        </div>
      </div>`;
    document.body.appendChild(guide);
    return guide;
  }

  function updateOrderGuideCountdown() {
    const guide = ensureOrderGuide();
    const output = $('[data-order-countdown]', guide);
    if (output) output.textContent = String(Math.max(0, orderGuideSeconds));
  }

  function continueToOrderDestination() {
    const destination = pendingOrderDestination;
    hideOrderGuide();
    if (destination) window.location.assign(destination);
  }

  function showOrderGuide(destination, message, copied = true) {
    const guide = ensureOrderGuide();
    pendingOrderDestination = destination;
    pendingOrderMessage = message;
    orderGuideSeconds = 5;
    const title = $('#simOrderGuideTitle', guide);
    const summary = $('.sim-order-guide-summary', guide);
    if (title) title.textContent = copied ? 'Đã sao chép nội dung đặt SIM' : 'Hãy sao chép nội dung đặt SIM';
    if (summary) summary.textContent = copied
      ? 'Messenger sẽ được mở ngay trong tab hiện tại. Khi ô soạn tin nhắn xuất hiện, hãy dán nội dung rồi nhấn gửi.'
      : 'Trình duyệt chưa tự sao chép được. Hãy nhấn “Sao chép lại”, sau đó tiếp tục sang Messenger.';
    guide.hidden = false;
    document.body.classList.add('sim-order-guide-open');
    updateOrderGuideCountdown();
    clearInterval(showOrderGuide.timer);
    showOrderGuide.timer = setInterval(() => {
      orderGuideSeconds -= 1;
      updateOrderGuideCountdown();
      if (orderGuideSeconds <= 0) {
        clearInterval(showOrderGuide.timer);
        continueToOrderDestination();
      }
    }, 1000);
    $('[data-order-guide-continue]', guide)?.focus({ preventScroll: true });
  }

  function hideOrderGuide() {
    clearInterval(showOrderGuide.timer);
    const guide = $('#simOrderGuide');
    if (guide) guide.hidden = true;
    document.body.classList.remove('sim-order-guide-open');
    pendingOrderDestination = '';
    pendingOrderMessage = '';
  }

  async function copyPendingOrderMessage() {
    if (!pendingOrderMessage) return;
    try {
      await copyText(pendingOrderMessage);
      const guide = ensureOrderGuide();
      const title = $('#simOrderGuideTitle', guide);
      const summary = $('.sim-order-guide-summary', guide);
      if (title) title.textContent = 'Đã sao chép nội dung đặt SIM';
      if (summary) summary.textContent = 'Nội dung đã được sao chép lại. Anh/chị có thể tiếp tục sang Messenger và dán vào ô soạn tin nhắn.';
    } catch (error) {
      console.warn('Không thể sao chép lại tin nhắn:', error);
      showToast('Không thể tự sao chép. Hãy kiểm tra quyền clipboard của trình duyệt.');
    }
  }

  function orderUrl(plan, message) {
    if (orderConfig.mode === 'custom-page') {
      try {
        const url = new URL(orderConfig.customPageUrl || DEFAULT_ORDER.customPageUrl, location.href);
        url.searchParams.set('plan', plan.id);
        url.searchParams.set('simType', selectedSimType || defaultType(plan));
        url.searchParams.set('quantity', String(quantity));
        if (plan.planKind === 'travel') {
          if (selectedTravelDay) url.searchParams.set('travelDays', selectedTravelDay);
          if (selectedTravelPackage) url.searchParams.set('travelPackage', selectedTravelPackage);
          url.searchParams.set('paymentCurrency', activeTravelPaymentCurrency());
        }
        return url.href;
      } catch (_) {
        return orderConfig.customPageUrl || DEFAULT_ORDER.customPageUrl;
      }
    }
    const base = orderConfig.messengerUrl || DEFAULT_ORDER.messengerUrl;
    if (orderConfig.appendTextQuery === false) return base;
    try {
      const url = new URL(base, location.href);
      if (!url.searchParams.has('text')) url.searchParams.set('text', message);
      return url.href;
    } catch (_) {
      return base;
    }
  }

  async function buyCurrentPlan() {
    if (!activePlan) return;
    if (!validateTravelChoices()) return;
    const message = interpolate(activePlan);
    const destination = orderUrl(activePlan, message);
    const isMessenger = orderConfig.mode !== 'custom-page';
    if (!isMessenger) {
      window.location.assign(destination);
      return;
    }

    let copied = false;
    if (orderConfig.copyMessageBeforeOpen !== false) {
      try {
        copied = await copyText(message);
      } catch (error) {
        console.warn('Không thể sao chép tin nhắn:', error);
      }
    }
    showOrderGuide(destination, message, copied);
  }

  function faqTemplate(item, index) {
    return `<article class="sim-faq-item${index === 0 ? ' open' : ''}"><button type="button">${escapeHtml(item.question || 'Câu hỏi')}</button><p>${escapeHtml(item.answer || '')}</p></article>`;
  }

  function bindEvents() {
    $('#travelSimSearch')?.addEventListener('input', event => {
      travelSearch = String(event.target.value || '').trim();
      if (currentView === 'travel') renderCatalog('travel');
    });
    $('#travelSimRegion')?.addEventListener('change', event => {
      travelRegion = String(event.target.value || '').trim();
      if (currentView === 'travel') renderCatalog('travel');
    });
    $('#travelPaymentCurrencySelect')?.addEventListener('change', event => {
      travelPaymentCurrency = event.target.value === 'VND' ? 'VND' : 'JPY';
      try { localStorage.setItem('vinh-travel-payment-currency', travelPaymentCurrency); } catch (_) {}
      refreshTravelCurrencyView();
    });
    document.addEventListener('click', event => {
      const period = event.target.closest('[data-sim-period]');
      if (period) { renderCatalog(period.dataset.simPeriod); return; }

      const card = event.target.closest('.sim-product-card');
      if (card && !event.target.closest('a,button')) { openDetail(card.dataset.simId); return; }

      const typeButton = event.target.closest('[data-sim-type]');
      if (typeButton) { selectType(typeButton.dataset.simType); return; }
      const travelDayButton = event.target.closest('[data-travel-day]');
      if (travelDayButton) { selectTravelChoice('day', travelDayButton.dataset.travelDay); return; }
      const travelPackageButton = event.target.closest('[data-travel-package]');
      if (travelPackageButton) { selectTravelChoice('package', travelPackageButton.dataset.travelPackage); return; }

      if (event.target.closest('[data-quantity-minus]')) { setQuantity(quantity - 1); return; }
      if (event.target.closest('[data-quantity-plus]')) { setQuantity(quantity + 1); return; }
      if (event.target.closest('[data-sim-buy]')) { buyCurrentPlan(); return; }
      if (event.target.closest('[data-sim-close]')) { closeDetail(); return; }
      if (event.target.closest('[data-order-guide-continue]')) { continueToOrderDestination(); return; }
      if (event.target.closest('[data-order-guide-copy]')) { copyPendingOrderMessage(); return; }
      if (event.target.closest('[data-order-guide-cancel]')) { hideOrderGuide(); return; }

      const faqButton = event.target.closest('.sim-faq-item button');
      if (faqButton) faqButton.closest('.sim-faq-item').classList.toggle('open');
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (!$('#simOrderGuide')?.hidden) hideOrderGuide();
        else closeDetail();
      }
      const card = event.target.closest?.('.sim-product-card');
      if (card && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        openDetail(card.dataset.simId);
      }
    });
  }

  async function init() {
    bindEvents();
    try {
      const [dataResponse, travelResponse, orderResponse] = await Promise.all([
        fetch(`/data/sim-plans.json?v=${VERSION}`, { cache: 'no-cache' }),
        fetch(`/data/travel-sim-plans.json?v=${VERSION}`, { cache: 'no-cache' }),
        fetch(`/data/order-config.json?v=${VERSION}`, { cache: 'no-cache' })
      ]);
      if (!dataResponse.ok) throw new Error('Không tải được sim-plans.json');
      const data = await dataResponse.json();
      travelData = travelResponse.ok ? await travelResponse.json() : { source: {}, pricing: {}, selectionOptions: {}, plans: [] };
      travelData.selectionOptions = normalizeTravelSelectionOptions(travelData.selectionOptions);
      await refreshTravelRatesOnline();
      try {
        const savedCurrency = localStorage.getItem('vinh-travel-payment-currency');
        travelPaymentCurrency = savedCurrency === 'VND' || savedCurrency === 'JPY'
          ? savedCurrency
          : (travelData.pricing?.defaultSellCurrency === 'VND' ? 'VND' : 'JPY');
      } catch (_) {
        travelPaymentCurrency = travelData.pricing?.defaultSellCurrency === 'VND' ? 'VND' : 'JPY';
      }
      updateTravelCurrencyControl();
      const order = orderResponse.ok ? await orderResponse.json() : DEFAULT_ORDER;
      pageConfig = data.page || {};
      const localPlans = consolidatePlans(data.plans).filter(item => item.enabled !== false);
      const travelPlans = consolidatePlans((travelData.plans || []).map(item => ({ ...item, planKind: 'travel', period: 'travel' }))).filter(item => item.enabled !== false);
      plans = [...localPlans, ...travelPlans];
      orderConfig = normalizeOrder(order);

      $('#simEyebrow').textContent = pageConfig.eyebrow || 'SIM NHẬT BẢN';
      $('#simTitle').textContent = pageConfig.title || 'Chọn SIM phù hợp';
      $('#simDescription').textContent = pageConfig.description || '';
      $('#simPlansTitle').textContent = pageConfig.catalogTitle || 'Các gói SIM đang giới thiệu';
      $('#simCatalogDescription').textContent = pageConfig.catalogDescription || 'Chọn gói SIM, sau đó chọn eSIM hoặc SIM vật lý trong phần chi tiết nếu sản phẩm hỗ trợ cả hai.';
      configureHeroVisual();
      configureHeroButtons();
      $('[data-sim-period="monthly"]').textContent = pageConfig.monthlyLabel || 'SIM tháng';
      $('[data-sim-period="yearly"]').textContent = pageConfig.yearlyLabel || 'SIM năm';
      const voiceButton = $('[data-sim-period="voice"]');
      const hasVoice = plans.some(plan => plan.planKind === 'voice' && plan.showCard !== false && availableTypes(plan).length);
      if (voiceButton) {
        voiceButton.textContent = pageConfig.voiceLabel || 'SIM nghe gọi';
        voiceButton.hidden = !hasVoice;
      }
      const travelButton = $('[data-sim-period="travel"]');
      const hasTravel = plans.some(plan => plan.planKind === 'travel' && plan.showCard !== false && availableTypes(plan).length);
      if (travelButton) {
        travelButton.textContent = pageConfig.travelLabel || 'SIM du lịch';
        travelButton.hidden = !hasTravel;
      }
      const regionSelect = $('#travelSimRegion');
      if (regionSelect) {
        const regions = Array.from(new Set(plans.filter(plan => plan.planKind === 'travel').map(plan => String(plan.travelRegion || '').trim()).filter(Boolean))).sort((a,b) => a.localeCompare(b, 'vi'));
        regionSelect.innerHTML = '<option value="">Tất cả khu vực</option>' + regions.map(region => `<option value="${escapeHtml(region)}">${escapeHtml(region)}</option>`).join('');
      }
      const sourceNote = $('#travelSimSourceNote');
      if (sourceNote) sourceNote.textContent = travelData.source?.notice || 'Giá tham khảo, có thể thay đổi theo thời điểm, dung lượng và khuyến mãi. Vui lòng liên hệ.';
      $('#simFaqList').innerHTML = (data.faqs || []).map(faqTemplate).join('');
      $('#simNotice').textContent = pageConfig.notice || '';

      const firstView = ['monthly', 'yearly', 'voice', 'travel'].find(view => enabledPlans(view).length) || 'monthly';
      renderCatalog(firstView);
    } catch (error) {
      console.error(error);
      $('#simPlanGrid').innerHTML = '<div class="home-empty-state"><strong>Chưa tải được thông tin SIM</strong><p>Kiểm tra data/sim-plans.json, data/travel-sim-plans.json và data/order-config.json rồi tải lại trang.</p></div>';
    }
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
