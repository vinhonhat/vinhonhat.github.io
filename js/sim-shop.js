(() => {
  'use strict';

  const VERSION = window.VinhSiteVersion?.id || 'dev';
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

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
      copied: 'Đã soạn và sao chép tin nhắn. Hãy dán rồi nhấn gửi trong Messenger.',
      custom: 'Mở trang đặt SIM'
    }
  };

  let pageConfig = {};
  let plans = [];
  let orderConfig = structuredClone(DEFAULT_ORDER);
  let currentPeriod = 'monthly';
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

  function periodLabel(period) {
    return period === 'yearly'
      ? (pageConfig.yearlyLabel || 'SIM năm')
      : (pageConfig.monthlyLabel || 'SIM tháng');
  }

  function typeLabel(type) {
    return type === 'esim'
      ? (pageConfig.esimLabel || 'eSIM')
      : (pageConfig.physicalLabel || 'SIM vật lý');
  }

  function enabledPlans(period, simType) {
    return plans.filter(plan => plan.enabled !== false && plan.showCard !== false && plan.period === period && (!simType || plan.simType === simType));
  }

  function familyPlans(plan) {
    return plans.filter(item => item.enabled !== false && item.familyId && item.familyId === plan.familyId);
  }

  function productCard(plan) {
    return `<article class="sim-product-card" data-sim-id="${escapeHtml(plan.id)}" tabindex="0" role="button" aria-label="Xem ${escapeHtml(plan.name)}">
      <div class="sim-product-media">
        <img src="${escapeHtml(plan.image || '/img/sim/softbank-demo.png')}" alt="${escapeHtml(plan.name)}" loading="lazy" decoding="async">
      </div>
      <div class="sim-product-copy">
        <h3>${escapeHtml(plan.cardName || plan.name)}</h3>
        <strong>${escapeHtml(plan.price || 'Liên hệ')}</strong>
      </div>
    </article>`;
  }

  function groupTemplate(period, simType) {
    const items = enabledPlans(period, simType);
    return `<section class="sim-product-group" data-sim-group="${simType}">
      <header class="sim-product-group-head">
        <div>
          <span>${simType === 'esim' ? 'KÍCH HOẠT TRỰC TUYẾN' : 'GIAO SIM TẬN NƠI'}</span>
          <h3>${escapeHtml(typeLabel(simType))}</h3>
        </div>
        <small>${items.length} sản phẩm</small>
      </header>
      <div class="sim-product-grid">
        ${items.length ? items.map(productCard).join('') : `<p class="sim-group-empty">${escapeHtml(pageConfig.emptyText || 'Chưa có sản phẩm trong nhóm này.')}</p>`}
      </div>
    </section>`;
  }

  function renderCatalog(period = currentPeriod) {
    currentPeriod = period;
    document.querySelectorAll('[data-sim-period]').forEach(button => {
      const active = button.dataset.simPeriod === period;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    const container = $('#simPlanGrid');
    if (!container) return;
    container.innerHTML = groupTemplate(period, 'physical') + groupTemplate(period, 'esim');
  }

  function variantButtons(plan) {
    const variants = familyPlans(plan);
    if (variants.length < 2) return '';
    return `<div class="sim-variant-picker" role="group" aria-label="Chọn loại SIM">
      <span>Loại SIM</span>
      <div>${variants.map(item => `<button type="button" data-sim-variant="${escapeHtml(item.id)}" class="${item.id === plan.id ? 'active' : ''}">${escapeHtml(typeLabel(item.simType))}<small>${escapeHtml(item.price || '')}</small></button>`).join('')}</div>
    </div>`;
  }

  function detailTemplate(plan) {
    const features = (plan.features || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const requirements = (plan.requirements || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const labels = orderConfig.labels || DEFAULT_ORDER.labels;
    return `<div class="sim-detail-grid">
      <div class="sim-detail-image"><img src="${escapeHtml(plan.image || '/img/sim/softbank-demo.png')}" alt="${escapeHtml(plan.name)}"></div>
      <div class="sim-detail-copy">
        <span class="sim-detail-badge">${escapeHtml(periodLabel(plan.period))}</span>
        <h2 id="simDetailTitle">${escapeHtml(plan.name)}</h2>
        <p>${escapeHtml(plan.subtitle || '')}</p>
        <div class="sim-detail-price">${escapeHtml(plan.price || 'Liên hệ')}</div>
        ${variantButtons(plan)}
        <div class="sim-detail-specs">
          <div><span>Nhà mạng</span><strong>${escapeHtml(plan.carrier || 'Đang cập nhật')}</strong></div>
          <div><span>Dung lượng</span><strong>${escapeHtml(plan.dataLabel || 'Đang cập nhật')}</strong></div>
          <div><span>Loại SIM</span><strong>${escapeHtml(typeLabel(plan.simType))}</strong></div>
          <div><span>Chu kỳ</span><strong>${escapeHtml(plan.durationLabel || periodLabel(plan.period))}</strong></div>
        </div>
        <div class="sim-detail-columns">
          <section><h3>Thông tin chính</h3><ul>${features}</ul></section>
          <section><h3>Cần kiểm tra trước</h3><ul>${requirements}</ul></section>
        </div>
        <div class="sim-detail-for"><strong>Phù hợp với:</strong> ${escapeHtml(plan.recommendedFor || '')}</div>
        <div class="sim-order-row">
          <div class="sim-quantity" aria-label="Chọn số lượng">
            <span>Số lượng</span>
            <div><button type="button" data-quantity-minus aria-label="Giảm số lượng">−</button><output id="simQuantity">${quantity}</output><button type="button" data-quantity-plus aria-label="Tăng số lượng">+</button></div>
          </div>
          <button class="sim-buy-button" type="button" data-sim-buy>${escapeHtml(orderConfig.mode === 'custom-page' ? labels.custom : labels.buy)}</button>
        </div>
        ${orderConfig.facebookUrl ? `<a class="sim-facebook-button" href="${escapeHtml(orderConfig.facebookUrl)}" target="_blank" rel="noopener">${escapeHtml(labels.friend)}</a>` : ''}
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
      period: periodLabel(plan.period),
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

  function showToast(message) {
    const toast = $('#simOrderToast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 4200);
  }

  function orderUrl(plan, message) {
    if (orderConfig.mode === 'custom-page') {
      const url = new URL(orderConfig.customPageUrl || '/pages/pages-app/dat-sim.html', location.origin);
      url.searchParams.set('plan', plan.id);
      url.searchParams.set('quantity', String(quantity));
      url.searchParams.set('type', plan.simType);
      url.searchParams.set('period', plan.period);
      url.searchParams.set('message', message);
      return url.href;
    }
    const url = new URL(orderConfig.messengerUrl || 'https://m.me/tqv2022', location.href);
    if (orderConfig.appendTextQuery !== false) url.searchParams.set('text', message);
    return url.href;
  }

  async function buyCurrentPlan() {
    if (!activePlan) return;
    const message = interpolate(orderConfig.messageTemplate, activePlan);
    let opened = null;
    if (orderConfig.openInNewTab !== false) opened = window.open('about:blank', '_blank');
    try {
      if (orderConfig.copyMessageBeforeOpen !== false) await copyText(message);
    } catch (error) {
      console.warn('Không thể sao chép tin nhắn:', error);
    }
    const destination = orderUrl(activePlan, message);
    if (opened) opened.location.replace(destination);
    else location.href = destination;
    showToast(orderConfig.labels?.copied || DEFAULT_ORDER.labels.copied);
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
      plans = Array.isArray(data.plans) ? data.plans.filter(item => item.enabled !== false) : [];
      orderConfig = normalizeOrder(order);

      $('#simEyebrow').textContent = pageConfig.eyebrow || 'SIM NHẬT BẢN';
      $('#simTitle').textContent = pageConfig.title || 'Chọn SIM data phù hợp';
      $('#simDescription').textContent = pageConfig.description || '';
      $('#simPlansTitle').textContent = pageConfig.catalogTitle || 'Các gói SIM đang giới thiệu';
      $('[data-sim-period="monthly"]').textContent = pageConfig.monthlyLabel || 'SIM tháng';
      $('[data-sim-period="yearly"]').textContent = pageConfig.yearlyLabel || 'SIM năm';
      $('#simFaqList').innerHTML = (data.faqs || []).map(faqTemplate).join('');
      $('#simNotice').textContent = pageConfig.notice || '';
      renderCatalog('monthly');
    } catch (error) {
      console.error(error);
      $('#simPlanGrid').innerHTML = '<div class="home-empty-state"><strong>Chưa tải được thông tin SIM</strong><p>Kiểm tra data/sim-plans.json và data/order-config.json rồi tải lại trang.</p></div>';
    }
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
