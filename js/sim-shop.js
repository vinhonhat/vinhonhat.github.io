(() => {
  'use strict';

  const VERSION = window.VinhSiteVersion?.id || 'dev';
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const DEFAULT_APN_URL = '/pages/pages-baiviet/sim/cau-hinh-sim-data-sim-nghe-goi-20251109.html';
  const DEFAULT_SIM_IMAGE = '/img/sim/sim-softbank.svg';
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
    openInNewTab: true,
    copyMessageBeforeOpen: true,
    appendTextQuery: true,
    messageTemplate: 'Xin chào, tôi muốn mua SIM:\n\n- Gói: {{name}}\n- Loại: {{simType}}\n- Chu kỳ: {{period}}\n- Dung lượng: {{data}}\n- Số lượng: {{quantity}}\n- Giá tham khảo: {{price}}\n\nMong shop xác nhận và tư vấn giúp tôi.',
    labels: {
      buy: 'Mua SIM',
      friend: 'Kết bạn Facebook',
      copied: 'Đã sao chép nội dung đặt SIM. Hãy mở ô soạn tin nhắn trong Messenger, dán nội dung rồi nhấn gửi.',
      custom: 'Mở trang đặt SIM'
    }
  };

  let pageConfig = {};
  let plans = [];
  let orderConfig = structuredClone(DEFAULT_ORDER);
  let currentView = 'monthly';
  let activePlan = null;
  let quantity = 1;

  function normalizeOrder(input) {
    const data = input && typeof input === 'object' ? input : {};
    return {
      ...DEFAULT_ORDER,
      ...data,
      labels: { ...DEFAULT_ORDER.labels, ...(data.labels || {}) }
    };
  }

  function normalizePlan(plan = {}) {
    return {
      ...plan,
      planKind: plan.planKind === 'voice' ? 'voice' : 'data',
      period: plan.period === 'yearly' ? 'yearly' : 'monthly',
      simType: ['both', 'physical', 'esim'].includes(plan.simType) ? plan.simType : 'physical',
      image: planImage(plan),
      soldOut: plan.soldOut === true
    };
  }

  function viewLabel(view) {
    if (view === 'voice') return pageConfig.voiceLabel || 'SIM nghe gọi';
    return view === 'yearly' ? (pageConfig.yearlyLabel || 'SIM năm') : (pageConfig.monthlyLabel || 'SIM tháng');
  }

  function typeLabel(type) {
    if (type === 'both') return pageConfig.bothLabel || 'eSIM + SIM vật lý';
    if (type === 'esim') return pageConfig.esimLabel || 'eSIM';
    return pageConfig.physicalLabel || 'SIM vật lý';
  }

  function apnSettings() {
    return {
      enabled: pageConfig.apnEnabled !== false,
      url: String(pageConfig.apnUrl || DEFAULT_APN_URL).trim() || DEFAULT_APN_URL,
      label: String(pageConfig.apnLabel || 'Tải cấu hình / APN').trim() || 'Tải cấu hình / APN'
    };
  }

  function configureApnHeroLink() {
    const link = $('#simApnHeroLink');
    if (!link) return;
    const apn = apnSettings();
    link.hidden = !apn.enabled;
    link.href = apn.url;
    link.textContent = apn.label;
  }

  function planMatchesView(plan, view) {
    if (view === 'voice') return plan.planKind === 'voice';
    return plan.planKind !== 'voice' && plan.period === view;
  }

  function enabledPlans(view, simType) {
    return plans.filter(plan => plan.enabled !== false
      && plan.showCard !== false
      && planMatchesView(plan, view)
      && (!simType || plan.simType === simType));
  }

  function familyPlans(plan) {
    return plans.filter(item => item.enabled !== false
      && item.showCard !== false
      && item.familyId
      && item.familyId === plan.familyId
      && item.planKind === plan.planKind
      && item.period === plan.period
      && item.simType !== 'both');
  }

  function productCard(plan) {
    const soldOut = plan.soldOut === true;
    return `<article class="sim-product-card${soldOut ? ' is-sold-out' : ''}" data-sim-id="${escapeHtml(plan.id)}" tabindex="0" role="button" aria-label="Xem ${escapeHtml(plan.name)}${soldOut ? ' - hiện đang hết hàng' : ''}">
      <div class="sim-product-media">
        <img src="${escapeHtml(planImage(plan))}" alt="${escapeHtml(plan.name)}" loading="lazy" decoding="async">
        <span class="sim-product-type-badge">${escapeHtml(typeLabel(plan.simType))}</span>
        ${soldOut ? '<span class="sim-product-soldout-badge">Hết hàng</span>' : ''}
      </div>
      <div class="sim-product-copy">
        <h3>${escapeHtml(plan.cardName || plan.name)}</h3>
        <strong class="${soldOut ? 'sim-price-soldout' : ''}">${soldOut ? 'Hết hàng' : escapeHtml(plan.price || 'Liên hệ')}</strong>
      </div>
    </article>`;
  }

  function groupMeta(simType) {
    if (simType === 'both') return { eyebrow: 'CHỌN LOẠI KHI ĐẶT', title: typeLabel('both') };
    if (simType === 'esim') return { eyebrow: 'KÍCH HOẠT TRỰC TUYẾN', title: typeLabel('esim') };
    return { eyebrow: 'GIAO SIM TẬN NƠI', title: typeLabel('physical') };
  }

  function groupTemplate(view, simType) {
    const items = enabledPlans(view, simType);
    if (!items.length) return '';
    const meta = groupMeta(simType);
    return `<section class="sim-product-group sim-product-group-${simType}" data-sim-group="${simType}">
      <header class="sim-product-group-head">
        <div><span>${escapeHtml(meta.eyebrow)}</span><h3>${escapeHtml(meta.title)}</h3></div>
        <small>${items.length} sản phẩm</small>
      </header>
      <div class="sim-product-grid">${items.map(productCard).join('')}</div>
    </section>`;
  }

  function renderCatalog(view = currentView) {
    currentView = view;
    document.querySelectorAll('[data-sim-period]').forEach(button => {
      const active = button.dataset.simPeriod === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    const container = $('#simPlanGrid');
    if (!container) return;
    const content = ['both', 'physical', 'esim'].map(type => groupTemplate(view, type)).join('');
    container.innerHTML = content || `<div class="sim-catalog-empty"><strong>Chưa có ${escapeHtml(viewLabel(view).toLowerCase())}</strong><p>Sản phẩm trong mục này đang được cập nhật.</p></div>`;
  }

  function variantButtons(plan) {
    const variants = familyPlans(plan);
    if (variants.length < 2) return '';
    return `<div class="sim-variant-picker" role="group" aria-label="Chọn loại SIM">
      <span>Loại SIM</span>
      <div>${variants.map(item => `<button type="button" data-sim-variant="${escapeHtml(item.id)}" class="${item.id === plan.id ? 'active' : ''}${item.soldOut === true ? ' is-sold-out' : ''}">${escapeHtml(typeLabel(item.simType))}<small>${item.soldOut === true ? 'Hết hàng' : escapeHtml(item.price || '')}</small></button>`).join('')}</div>
    </div>`;
  }

  function detailTemplate(plan) {
    const features = (plan.features || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const requirements = (plan.requirements || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const labels = orderConfig.labels || DEFAULT_ORDER.labels;
    const apn = apnSettings();
    return `<div class="sim-detail-grid">
      <div class="sim-detail-image"><img src="${escapeHtml(planImage(plan))}" alt="${escapeHtml(plan.name)}"></div>
      <div class="sim-detail-copy">
        <span class="sim-detail-badge">${escapeHtml(viewLabel(plan.planKind === 'voice' ? 'voice' : plan.period))} · ${escapeHtml(typeLabel(plan.simType))}</span>
        <h2 id="simDetailTitle">${escapeHtml(plan.name)}</h2>
        <p>${escapeHtml(plan.subtitle || '')}</p>
        <div class="sim-detail-price${plan.soldOut === true ? ' is-sold-out' : ''}">${plan.soldOut === true ? 'Hết hàng' : escapeHtml(plan.price || 'Liên hệ')}</div>
        ${plan.soldOut === true ? '<div class="sim-detail-soldout-note"><strong>Sản phẩm đang tạm hết hàng.</strong><span>Anh/chị vẫn có thể bấm Liên hệ để hỏi thời gian có hàng hoặc sản phẩm thay thế.</span></div>' : ''}
        ${variantButtons(plan)}
        <div class="sim-detail-specs">
          <div><span>Nhà mạng</span><strong>${escapeHtml(plan.carrier || 'Đang cập nhật')}</strong></div>
          <div><span>Dung lượng</span><strong>${escapeHtml(plan.dataLabel || 'Đang cập nhật')}</strong></div>
          <div><span>Loại SIM</span><strong>${escapeHtml(typeLabel(plan.simType))}</strong></div>
          <div><span>Chu kỳ</span><strong>${escapeHtml(plan.durationLabel || viewLabel(plan.planKind === 'voice' ? 'voice' : plan.period))}</strong></div>
        </div>
        <div class="sim-detail-columns">
          <section><h3>Thông tin chính</h3><ul>${features}</ul></section>
          <section><h3>Cần kiểm tra trước</h3><ul>${requirements}</ul></section>
        </div>
        <div class="sim-detail-for"><strong>Phù hợp với:</strong> ${escapeHtml(plan.recommendedFor || '')}</div>
        ${plan.soldOut === true
          ? '<button class="sim-buy-button sim-contact-button" type="button" data-sim-buy>Liên hệ</button>'
          : `<div class="sim-order-row">
          <div class="sim-quantity" aria-label="Chọn số lượng">
            <span>Số lượng</span>
            <div><button type="button" data-quantity-minus aria-label="Giảm số lượng">−</button><output id="simQuantity">${quantity}</output><button type="button" data-quantity-plus aria-label="Tăng số lượng">+</button></div>
          </div>
          <button class="sim-buy-button" type="button" data-sim-buy>${escapeHtml(orderConfig.mode === 'custom-page' ? labels.custom : labels.buy)}</button>
        </div>`}
        ${orderConfig.facebookUrl ? `<a class="sim-facebook-button" href="${escapeHtml(orderConfig.facebookUrl)}" target="_blank" rel="noopener">${escapeHtml(labels.friend)}</a>` : ''}
        ${apn.enabled ? `<a class="sim-apn-detail-button" href="${escapeHtml(apn.url)}">${escapeHtml(apn.label)}</a>` : ''}
      </div>
    </div>`;
  }

  function openDetail(id) {
    const plan = plans.find(item => item.id === id && item.enabled !== false);
    const modal = $('#simDetailModal');
    if (!plan || !modal) return;
    activePlan = plan;
    quantity = 1;
    $('#simDetailContent').innerHTML = detailTemplate(plan);
    modal.hidden = false;
    document.body.classList.add('sim-modal-open');
    $('.sim-detail-close', modal)?.focus({ preventScroll: true });
  }

  function refreshDetail(planId, preserveQuantity = true) {
    const plan = plans.find(item => item.id === planId && item.enabled !== false);
    if (!plan) return;
    activePlan = plan;
    if (!preserveQuantity) quantity = 1;
    $('#simDetailContent').innerHTML = detailTemplate(plan);
  }

  function closeDetail() {
    const modal = $('#simDetailModal');
    if (modal) modal.hidden = true;
    document.body.classList.remove('sim-modal-open');
    activePlan = null;
  }

  function setQuantity(next) {
    quantity = Math.max(1, Math.min(20, Number(next) || 1));
    const output = $('#simQuantity');
    if (output) output.textContent = String(quantity);
  }

  function interpolate(template, plan) {
    const values = {
      id: plan.id,
      name: plan.name,
      simType: typeLabel(plan.simType),
      period: viewLabel(plan.planKind === 'voice' ? 'voice' : plan.period),
      data: plan.dataLabel || '',
      quantity: String(quantity),
      price: plan.price || 'Liên hệ',
      carrier: plan.carrier || ''
    };
    return String(template || DEFAULT_ORDER.messageTemplate).replace(/{{\s*([a-zA-Z]+)\s*}}/g, (_, key) => values[key] ?? '');
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

  function ensureOrderGuide() {
    let guide = $('#simOrderGuide');
    if (guide) return guide;
    guide = document.createElement('section');
    guide.id = 'simOrderGuide';
    guide.className = 'sim-order-guide';
    guide.hidden = true;
    guide.innerHTML = `<button type="button" class="sim-order-guide-close" aria-label="Đóng hướng dẫn">×</button>
      <strong>Đã sao chép nội dung đặt SIM</strong>
      <ol>
        <li>Mở cửa sổ hoặc tab Messenger vừa được mở.</li>
        <li>Nhấn vào ô soạn tin nhắn.</li>
        <li>Dán nội dung đã sao chép bằng <b>Ctrl + V</b> hoặc nhấn giữ rồi chọn <b>Dán</b>.</li>
        <li>Kiểm tra lại và nhấn <b>Gửi</b>.</li>
      </ol>`;
    document.body.appendChild(guide);
    return guide;
  }

  function showOrderGuide() {
    const guide = ensureOrderGuide();
    guide.hidden = false;
    clearTimeout(showOrderGuide.timer);
    showOrderGuide.timer = setTimeout(() => {
      guide.hidden = true;
    }, 9000);
  }

  function hideOrderGuide() {
    const guide = $('#simOrderGuide');
    if (!guide) return;
    guide.hidden = true;
  }

  function orderUrl(plan, message) {
    if (orderConfig.mode === 'custom-page') {
      try {
        const url = new URL(orderConfig.customPageUrl || DEFAULT_ORDER.customPageUrl, location.href);
        url.searchParams.set('plan', plan.id);
        url.searchParams.set('quantity', String(quantity));
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
    const message = interpolate(orderConfig.messageTemplate, activePlan);
    const isMessenger = orderConfig.mode !== 'custom-page';
    const willCopy = orderConfig.copyMessageBeforeOpen !== false;
    const openNew = orderConfig.openInNewTab !== false;
    const opened = openNew ? window.open('about:blank', '_blank', 'noopener') : null;
    try {
      if (willCopy) await copyText(message);
    } catch (error) {
      console.warn('Không thể sao chép tin nhắn:', error);
    }
    const destination = orderUrl(activePlan, message);
    if (isMessenger && willCopy && !openNew) {
      window.alert(orderConfig.labels?.copied || DEFAULT_ORDER.labels.copied);
    }
    if (opened) opened.location.replace(destination);
    else location.href = destination;
    if (isMessenger && willCopy) {
      showToast(orderConfig.labels?.copied || DEFAULT_ORDER.labels.copied);
      if (openNew) showOrderGuide();
    } else {
      hideOrderGuide();
    }
  }

  function faqTemplate(item, index) {
    return `<article class="sim-faq-item${index === 0 ? ' open' : ''}"><button type="button">${escapeHtml(item.question || 'Câu hỏi')}</button><p>${escapeHtml(item.answer || '')}</p></article>`;
  }

  function bindEvents() {
    document.addEventListener('click', event => {
      const period = event.target.closest('[data-sim-period]');
      if (period) { renderCatalog(period.dataset.simPeriod); return; }

      const card = event.target.closest('.sim-product-card');
      if (card && !event.target.closest('a,button')) { openDetail(card.dataset.simId); return; }

      const variant = event.target.closest('[data-sim-variant]');
      if (variant) { refreshDetail(variant.dataset.simVariant, true); return; }

      if (event.target.closest('[data-quantity-minus]')) { setQuantity(quantity - 1); return; }
      if (event.target.closest('[data-quantity-plus]')) { setQuantity(quantity + 1); return; }
      if (event.target.closest('[data-sim-buy]')) { buyCurrentPlan(); return; }
      if (event.target.closest('[data-sim-close]')) { closeDetail(); return; }
      if (event.target.closest('.sim-order-guide-close')) { hideOrderGuide(); return; }

      const faqButton = event.target.closest('.sim-faq-item button');
      if (faqButton) faqButton.closest('.sim-faq-item').classList.toggle('open');
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeDetail();
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
      const [dataResponse, orderResponse] = await Promise.all([
        fetch(`/data/sim-plans.json?v=${VERSION}`, { cache: 'no-cache' }),
        fetch(`/data/order-config.json?v=${VERSION}`, { cache: 'no-cache' })
      ]);
      if (!dataResponse.ok) throw new Error('Không tải được sim-plans.json');
      const data = await dataResponse.json();
      const order = orderResponse.ok ? await orderResponse.json() : DEFAULT_ORDER;
      pageConfig = data.page || {};
      plans = Array.isArray(data.plans) ? data.plans.map(normalizePlan).filter(item => item.enabled !== false) : [];
      orderConfig = normalizeOrder(order);

      $('#simEyebrow').textContent = pageConfig.eyebrow || 'SIM NHẬT BẢN';
      $('#simTitle').textContent = pageConfig.title || 'Chọn SIM phù hợp';
      $('#simDescription').textContent = pageConfig.description || '';
      $('#simPlansTitle').textContent = pageConfig.catalogTitle || 'Các gói SIM đang giới thiệu';
      $('#simCatalogDescription').textContent = pageConfig.catalogDescription || 'Chọn nhóm SIM, sau đó nhấn vào sản phẩm để xem chi tiết và đặt mua.';
      configureApnHeroLink();
      $('[data-sim-period="monthly"]').textContent = pageConfig.monthlyLabel || 'SIM tháng';
      $('[data-sim-period="yearly"]').textContent = pageConfig.yearlyLabel || 'SIM năm';
      const voiceButton = $('[data-sim-period="voice"]');
      const hasVoice = plans.some(plan => plan.planKind === 'voice' && plan.showCard !== false);
      if (voiceButton) {
        voiceButton.textContent = pageConfig.voiceLabel || 'SIM nghe gọi';
        voiceButton.hidden = !hasVoice;
      }
      $('#simFaqList').innerHTML = (data.faqs || []).map(faqTemplate).join('');
      $('#simNotice').textContent = pageConfig.notice || '';

      const firstView = ['monthly', 'yearly', 'voice'].find(view => enabledPlans(view).length) || 'monthly';
      renderCatalog(firstView);
    } catch (error) {
      console.error(error);
      $('#simPlanGrid').innerHTML = '<div class="home-empty-state"><strong>Chưa tải được thông tin SIM</strong><p>Kiểm tra data/sim-plans.json và data/order-config.json rồi tải lại trang.</p></div>';
    }
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
