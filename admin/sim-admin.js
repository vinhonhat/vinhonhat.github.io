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
    voice: { title: 'SIM nghe gọi', description: 'Các gói có số điện thoại, nghe gọi và data đi kèm.', kind: 'voice' }
  };
  const PRODUCT_VIEWS = new Set(['monthly', 'yearly', 'voice']);
  const DEFAULT_APN_URL = '/pages/pages-baiviet/sim/cau-hinh-sim-data-sim-nghe-goi-20251109.html';
  const DEFAULT_SIM_IMAGE = '/img/sim/sim-softbank.svg';
  const LEGACY_SIM_IMAGES = new Set(['/img/sim/softbank-demo.png']);
  const CARRIER_IMAGES = Object.freeze({
    docomo: '/img/sim/sim-docomo.svg',
    softbank: '/img/sim/sim-softbank.svg',
    rakuten: '/img/sim/sim-rakuten.svg'
  });
  const DRAFT_KEYS = Object.freeze({
    sim: 'vinh-sim-plans-draft',
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

  let simData = { schemaVersion: 5, page: {}, plans: [], faqs: [] };
  let orderData = {};
  let urls = { sim: '', order: '' };
  let activeView = localStorage.getItem('vinh-sim-admin-view') || 'settings';
  if (!VIEW_META[activeView]) activeView = 'settings';

  function makeUrl(key, data) {
    if (urls[key]) URL.revokeObjectURL(urls[key]);
    urls[key] = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json;charset=utf-8' }));
    return urls[key];
  }

  function normalizePlan(plan = {}) {
    const normalized = { ...plan };
    normalized.id = String(normalized.id || `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    normalized.familyId = String(normalized.familyId || normalized.id);
    normalized.planKind = normalized.planKind === 'voice' ? 'voice' : 'data';
    normalized.period = normalized.period === 'yearly' ? 'yearly' : 'monthly';
    normalized.simType = ['both', 'physical', 'esim'].includes(normalized.simType) ? normalized.simType : 'physical';
    normalized.image = planImage(normalized);
    normalized.soldOut = normalized.soldOut === true;
    normalized.features = Array.isArray(normalized.features) ? normalized.features : [];
    normalized.requirements = Array.isArray(normalized.requirements) ? normalized.requirements : [];
    return normalized;
  }

  function normalizeSimData(input) {
    const data = input && typeof input === 'object' ? input : {};
    return {
      ...data,
      schemaVersion: 5,
      page: { ...(data.page || {}) },
      plans: Array.isArray(data.plans) ? data.plans.map(normalizePlan) : [],
      faqs: Array.isArray(data.faqs) ? data.faqs : []
    };
  }

  function typeLabel(type) {
    if (type === 'both') return simData.page?.bothLabel || 'eSIM + SIM vật lý';
    if (type === 'esim') return simData.page?.esimLabel || 'eSIM';
    return simData.page?.physicalLabel || 'SIM vật lý';
  }

  function kindLabel(kind) {
    return kind === 'voice' ? 'SIM nghe gọi' : 'SIM data';
  }

  function periodLabel(period) {
    return period === 'yearly' ? (simData.page?.yearlyLabel || 'SIM năm') : (simData.page?.monthlyLabel || 'SIM tháng');
  }

  function fillPage() {
    $('#simAdminTitle').value = simData.page?.title || '';
    $('#simAdminEyebrow').value = simData.page?.eyebrow || '';
    $('#simAdminDescription').value = simData.page?.description || '';
    $('#simAdminNotice').value = simData.page?.notice || '';
    $('#simAdminMonthlyLabel').value = simData.page?.monthlyLabel || 'SIM tháng';
    $('#simAdminYearlyLabel').value = simData.page?.yearlyLabel || 'SIM năm';
    $('#simAdminVoiceLabel').value = simData.page?.voiceLabel || 'SIM nghe gọi';
    $('#simAdminPhysicalLabel').value = simData.page?.physicalLabel || 'SIM vật lý';
    $('#simAdminEsimLabel').value = simData.page?.esimLabel || 'eSIM';
    $('#simAdminBothLabel').value = simData.page?.bothLabel || 'eSIM + SIM vật lý';
    $('#simAdminApnUrl').value = simData.page?.apnUrl || DEFAULT_APN_URL;
    $('#simAdminApnLabel').value = simData.page?.apnLabel || 'Tải cấu hình / APN';
    $('#simAdminApnEnabled').checked = simData.page?.apnEnabled !== false;

    $('#simOrderMode').value = orderData.mode || 'messenger';
    $('#simMessengerUrl').value = orderData.messengerUrl || '';
    $('#simFacebookUrl').value = orderData.facebookUrl || '';
    $('#simCustomOrderUrl').value = orderData.customPageUrl || '';
    $('#simMessageTemplate').value = orderData.messageTemplate || '';
    $('#simCopyMessage').checked = orderData.copyMessageBeforeOpen !== false;
    $('#simAppendText').checked = orderData.appendTextQuery !== false;
    $('#simOpenNewTab').checked = orderData.openInNewTab !== false;
  }

  function planMatchesView(plan, view = activeView) {
    if (view === 'voice') return plan.planKind === 'voice';
    if (view === 'monthly' || view === 'yearly') return plan.planKind !== 'voice' && plan.period === view;
    return false;
  }

  function hasFamilyPair(plan) {
    if (!plan.familyId || !['physical', 'esim'].includes(plan.simType)) return false;
    const otherType = plan.simType === 'physical' ? 'esim' : 'physical';
    return simData.plans.some(item => item.id !== plan.id
      && item.familyId === plan.familyId
      && item.planKind === plan.planKind
      && item.period === plan.period
      && item.simType === otherType);
  }

  function card(plan) {
    const canSplit = plan.simType === 'both';
    const canMerge = hasFamilyPair(plan);
    return `<article class="sim-admin-card" data-sim-admin-id="${escapeHtml(plan.id)}">
      <header>
        <div class="sim-admin-card-title">
          <strong>${escapeHtml(plan.cardName || plan.name || 'Gói SIM')}</strong>
          <small>${escapeHtml(kindLabel(plan.planKind))} · ${escapeHtml(periodLabel(plan.period))} · ${escapeHtml(typeLabel(plan.simType))}${plan.soldOut === true ? ' · Hết hàng' : ''}${(plan.enabled === false || plan.showCard === false) ? ' · Đang ẩn' : ''}</small>
        </div>
        <div class="sim-admin-card-actions">
          ${canSplit ? '<button type="button" class="sim-card-action split" data-split-sim-plan title="Tách thành eSIM và SIM vật lý để nhập hai giá">Tách 2 giá</button>' : ''}
          ${canMerge ? '<button type="button" class="sim-card-action merge" data-merge-sim-plan title="Gộp eSIM và SIM vật lý khi cùng giá">Gộp chung</button>' : ''}
          <button type="button" class="sim-card-action copy" data-duplicate-sim-plan title="Nhân bản gói SIM">Nhân bản</button>
          <button type="button" class="sim-card-action remove" data-remove-sim-plan aria-label="Xóa gói SIM" title="Xóa">×</button>
        </div>
      </header>
      <div class="sim-admin-fields">
        <div class="sim-product-status-grid wide-status">
          <label class="sim-product-status-card visibility">
            <span class="sim-product-status-copy"><strong>Hiển thị sản phẩm trên website</strong><small>Tắt mục này để ẩn hoàn toàn sản phẩm khỏi trang bán SIM.</small></span>
            <input type="checkbox" data-sim-visible ${(plan.enabled === false || plan.showCard === false) ? '' : 'checked'}>
          </label>
          <label class="sim-product-status-card soldout">
            <span class="sim-product-status-copy"><strong>Hết hàng / tạm ngừng bán</strong><small>Sản phẩm vẫn hiện mờ, giá đổi thành “Hết hàng” và khách vẫn có thể bấm Liên hệ.</small></span>
            <input type="checkbox" data-sim-field="soldOut" ${plan.soldOut === true ? 'checked' : ''}>
          </label>
        </div>
        <label><span>Nhóm sản phẩm</span><select data-sim-field="planKind"><option value="data" ${plan.planKind !== 'voice' ? 'selected' : ''}>SIM data</option><option value="voice" ${plan.planKind === 'voice' ? 'selected' : ''}>SIM nghe gọi</option></select></label>
        <label><span>Chu kỳ</span><select data-sim-field="period"><option value="monthly" ${plan.period === 'monthly' ? 'selected' : ''}>SIM tháng</option><option value="yearly" ${plan.period === 'yearly' ? 'selected' : ''}>SIM năm</option></select></label>
        <label><span>Loại SIM / cách tính giá</span><select data-sim-field="simType"><option value="both" ${plan.simType === 'both' ? 'selected' : ''}>eSIM + vật lý dùng chung giá</option><option value="physical" ${plan.simType === 'physical' ? 'selected' : ''}>Chỉ SIM vật lý</option><option value="esim" ${plan.simType === 'esim' ? 'selected' : ''}>Chỉ eSIM</option></select></label>
        <label><span>Giá</span><input type="text" data-sim-field="price" value="${escapeHtml(plan.price || '')}" placeholder="¥2,480 hoặc Liên hệ"></label>
        <label><span>ID</span><input type="text" data-sim-field="id" value="${escapeHtml(plan.id || '')}"></label>
        <label><span>Nhóm biến thể</span><input type="text" data-sim-field="familyId" value="${escapeHtml(plan.familyId || '')}" title="Hai gói eSIM và SIM vật lý cùng sản phẩm dùng chung mã này"></label>
        <label><span>Tên ngoài thẻ</span><input type="text" data-sim-field="cardName" value="${escapeHtml(plan.cardName || '')}"></label>
        <label><span>Tên chi tiết</span><input type="text" data-sim-field="name" value="${escapeHtml(plan.name || '')}"></label>
        <label><span>Nhà mạng</span><input type="text" list="simCarrierOptions" data-sim-field="carrier" value="${escapeHtml(plan.carrier || '')}" placeholder="Docomo, SoftBank hoặc Rakuten"></label>
        <label class="wide sim-admin-image-field"><span>Ảnh sản phẩm</span><div class="sim-admin-image-control"><img data-sim-image-preview src="${escapeHtml(planImage(plan))}" alt="Ảnh ${escapeHtml(plan.carrier || 'SIM')}"><div><input type="text" data-sim-field="image" value="${escapeHtml(planImage(plan))}"><button type="button" data-use-carrier-image>Dùng ảnh theo nhà mạng</button></div></div><small>eSIM và SIM vật lý dùng chung ảnh. Khi tách hai giá, cả hai biến thể vẫn giữ ảnh này.</small></label>
        <label><span>Dung lượng</span><input type="text" data-sim-field="dataLabel" value="${escapeHtml(plan.dataLabel || '')}"></label>
        <label><span>Thời hạn</span><input type="text" data-sim-field="durationLabel" value="${escapeHtml(plan.durationLabel || '')}"></label>
        <label class="wide"><span>Mô tả</span><textarea rows="2" data-sim-field="subtitle">${escapeHtml(plan.subtitle || '')}</textarea></label>
        <label class="wide"><span>Tính năng, mỗi dòng một ý</span><textarea rows="4" data-sim-lines="features">${escapeHtml((plan.features || []).join('\n'))}</textarea></label>
        <label class="wide"><span>Cần kiểm tra trước, mỗi dòng một ý</span><textarea rows="3" data-sim-lines="requirements">${escapeHtml((plan.requirements || []).join('\n'))}</textarea></label>
        <label class="wide"><span>Phù hợp với</span><textarea rows="2" data-sim-field="recommendedFor">${escapeHtml(plan.recommendedFor || '')}</textarea></label>
      </div>
    </article>`;
  }

  function visiblePlans() {
    return simData.plans.filter(plan => planMatchesView(plan));
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
    const plan = simData.plans.find(item => item.id === originalId);
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
    node.querySelectorAll('[data-sim-lines]').forEach(input => {
      plan[input.dataset.simLines] = input.value.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
    });
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
      physicalLabel: $('#simAdminPhysicalLabel').value.trim() || 'SIM vật lý',
      esimLabel: $('#simAdminEsimLabel').value.trim() || 'eSIM',
      bothLabel: $('#simAdminBothLabel').value.trim() || 'eSIM + SIM vật lý',
      apnUrl: $('#simAdminApnUrl').value.trim() || DEFAULT_APN_URL,
      apnLabel: $('#simAdminApnLabel').value.trim() || 'Tải cấu hình / APN',
      apnEnabled: $('#simAdminApnEnabled').checked
    };
    $$('.sim-admin-card').forEach(collectCard);
    simData.schemaVersion = 5;
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
      openInNewTab: $('#simOpenNewTab').checked
    };
  }

  function collect(kind = 'all') {
    if (kind === 'sim' || kind === 'all') collectSimData();
    if (kind === 'order' || kind === 'all') collectOrderData();
  }

  function configKindForView(view = activeView) {
    return view === 'order' ? 'order' : 'sim';
  }

  function setConfigStatus(kind, message) {
    $$(`[data-config-status="${kind}"]`).forEach(node => { node.textContent = message; });
  }

  function defaultStatus(kind) {
    if (kind === 'order') {
      return `Đang nhận đơn qua ${orderData.mode === 'custom-page' ? 'trang riêng' : 'Messenger'} · file order-config.json`;
    }
    const visible = simData.plans.filter(item => item.enabled !== false && item.showCard !== false).length;
    const soldOut = simData.plans.filter(item => item.enabled !== false && item.showCard !== false && item.soldOut === true).length;
    const stockText = soldOut ? ` · ${soldOut} gói hết hàng` : '';
    if (PRODUCT_VIEWS.has(activeView)) {
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
    if (PRODUCT_VIEWS.has(activeView)) {
      const meta = VIEW_META[activeView];
      $('#simProductManagerTitle').textContent = meta.title;
      $('#simProductManagerDescription').textContent = meta.description;
      $('#addSimPlan').textContent = `+ Thêm ${activeView === 'voice' ? 'SIM nghe gọi' : 'gói SIM'}`;
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
    const used = new Set(simData.plans.filter(item => !excludedSet.has(item.id)).map(item => item.id));
    let value = candidate;
    let index = 2;
    while (used.has(value)) value = `${candidate}-${index++}`;
    return value;
  }

  function addPlan() {
    collect('sim');
    const meta = VIEW_META[activeView] || VIEW_META.monthly;
    const stamp = Date.now();
    const id = `sim-${stamp}`;
    simData.plans.push(normalizePlan({
      id,
      familyId: id,
      enabled: true,
      showCard: true,
      soldOut: false,
      planKind: meta.kind || 'data',
      period: meta.period || 'monthly',
      simType: 'both',
      carrier: 'SoftBank',
      name: activeView === 'voice' ? 'SIM nghe gọi mới' : 'Gói SIM data mới',
      cardName: activeView === 'voice' ? 'SIM nghe gọi mới' : 'Gói SIM mới',
      subtitle: 'Có thể chọn eSIM hoặc SIM vật lý khi đặt hàng.',
      price: 'Liên hệ',
      dataLabel: '',
      durationLabel: '',
      image: DEFAULT_SIM_IMAGE,
      features: [],
      requirements: [],
      recommendedFor: ''
    }));
    render();
    updateDownloads('sim');
    document.querySelector('.sim-admin-card:last-child')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function duplicatePlan(cardNode) {
    collectCard(cardNode);
    const original = simData.plans.find(item => item.id === cardNode.dataset.simAdminId);
    if (!original) return;
    const clone = structuredClone(original);
    const base = original.id.replace(/-copy(?:-\d+)?$/, '');
    clone.id = uniqueId(`${base}-copy`);
    clone.familyId = clone.id;
    clone.cardName = `${clone.cardName || clone.name || 'Gói SIM'} - bản sao`;
    const index = simData.plans.indexOf(original);
    simData.plans.splice(index + 1, 0, clone);
    render();
    updateDownloads('sim');
  }

  function splitPlan(cardNode) {
    collectCard(cardNode);
    const plan = simData.plans.find(item => item.id === cardNode.dataset.simAdminId);
    if (!plan || plan.simType !== 'both') return;
    const familyId = plan.familyId || plan.id;
    const baseId = plan.id.replace(/-(both|physical|esim)$/, '');
    const excluded = [plan.id];
    const physical = structuredClone(plan);
    const esim = structuredClone(plan);
    physical.id = uniqueId(`${baseId}-physical`, excluded);
    physical.familyId = familyId;
    physical.simType = 'physical';
    esim.id = uniqueId(`${baseId}-esim`, excluded.concat(physical.id));
    esim.familyId = familyId;
    esim.simType = 'esim';
    const index = simData.plans.indexOf(plan);
    simData.plans.splice(index, 1, physical, esim);
    render();
    updateDownloads('sim', false);
    setConfigStatus('sim', 'Đã tách thành SIM vật lý và eSIM. Hãy tải đúng file sim-plans.json sau khi chỉnh giá.');
  }

  function mergePlan(cardNode) {
    collectCard(cardNode);
    const current = simData.plans.find(item => item.id === cardNode.dataset.simAdminId);
    if (!current || !current.familyId) return;
    const family = simData.plans.filter(item => item.familyId === current.familyId
      && item.planKind === current.planKind
      && item.period === current.period
      && ['physical', 'esim'].includes(item.simType));
    const physical = family.find(item => item.simType === 'physical');
    const esim = family.find(item => item.simType === 'esim');
    if (!physical || !esim) return;
    if (String(physical.price || '').trim() !== String(esim.price || '').trim()) {
      alert('Hai loại đang có giá khác nhau nên chưa thể gộp. Hãy chỉnh cùng giá rồi bấm “Gộp chung”.');
      return;
    }
    if (Boolean(physical.soldOut) !== Boolean(esim.soldOut)) {
      alert('Hai loại đang có trạng thái hàng khác nhau. Hãy chọn cùng trạng thái “Hết hàng” rồi mới gộp.');
      return;
    }
    const merged = structuredClone(physical);
    const excluded = [physical.id, esim.id];
    merged.id = uniqueId(current.familyId || physical.id.replace(/-physical$/, ''), excluded);
    merged.familyId = current.familyId;
    merged.simType = 'both';
    merged.subtitle = merged.subtitle || 'Có thể chọn eSIM hoặc SIM vật lý khi đặt hàng.';
    merged.features = Array.from(new Set([...(physical.features || []), ...(esim.features || [])]));
    merged.requirements = Array.from(new Set([...(physical.requirements || []), ...(esim.requirements || [])]));
    const firstIndex = Math.min(simData.plans.indexOf(physical), simData.plans.indexOf(esim));
    simData.plans = simData.plans.filter(item => item !== physical && item !== esim);
    simData.plans.splice(firstIndex, 0, merged);
    render();
    updateDownloads('sim', false);
    setConfigStatus('sim', 'Đã gộp eSIM và SIM vật lý. Hãy tải đúng file sim-plans.json để cập nhật máy chủ.');
  }

  function isExpectedConfig(parsed, kind) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    if (kind === 'sim') return Array.isArray(parsed.plans) || Boolean(parsed.page) || Array.isArray(parsed.faqs);
    const orderKeys = ['mode', 'messengerUrl', 'facebookUrl', 'customPageUrl', 'messageTemplate', 'copyMessageBeforeOpen', 'appendTextQuery', 'openInNewTab'];
    return !Array.isArray(parsed.plans) && orderKeys.some(key => Object.prototype.hasOwnProperty.call(parsed, key));
  }

  async function importJson(file, kind) {
    if (!file) return;
    const expectedName = kind === 'sim' ? 'sim-plans.json' : 'order-config.json';
    try {
      const parsed = JSON.parse(await file.text());
      if (!isExpectedConfig(parsed, kind)) {
        alert(`File vừa chọn không đúng cấu trúc ${expectedName}. Hệ thống chưa nhập để tránh ghi nhầm dữ liệu.`);
        setConfigStatus(kind, `Đã chặn file không đúng loại. Tab này chỉ nhận ${expectedName}.`);
        return;
      }
      if (kind === 'sim') simData = normalizeSimData(parsed);
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
      if (cardNode && event.target.dataset.simField === 'carrier') syncCarrierImage(cardNode);
      if (cardNode && (['planKind', 'period', 'simType', 'soldOut'].includes(event.target.dataset.simField) || event.target.matches('[data-sim-visible]'))) {
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

      const saveButton = event.target.closest('[data-save-config]');
      if (saveButton) {
        const kind = saveButton.dataset.saveConfig;
        collect(kind);
        const payload = kind === 'sim' ? simData : orderData;
        localStorage.setItem(DRAFT_KEYS[kind], JSON.stringify(payload));
        updateDownloads(kind, false);
        const fileName = kind === 'sim' ? 'sim-plans.json' : 'order-config.json';
        setConfigStatus(kind, `Đã lưu tạm riêng ${fileName} trên trình duyệt này. Chưa thay đổi file trên máy chủ.`);
        return;
      }

      const cardNode = event.target.closest('.sim-admin-card');
      if (cardNode && event.target.closest('[data-use-carrier-image]')) {
        syncCarrierImage(cardNode, true);
        collectCard(cardNode);
        updateDownloads('sim');
        return;
      }
      if (cardNode && event.target.closest('[data-duplicate-sim-plan]')) { duplicatePlan(cardNode); return; }
      if (cardNode && event.target.closest('[data-split-sim-plan]')) { splitPlan(cardNode); return; }
      if (cardNode && event.target.closest('[data-merge-sim-plan]')) { mergePlan(cardNode); return; }

      const remove = event.target.closest('[data-remove-sim-plan]');
      if (remove) {
        const node = remove.closest('.sim-admin-card');
        const id = node.dataset.simAdminId;
        const plan = simData.plans.find(item => item.id === id);
        if (plan && confirm(`Xóa “${plan.cardName || plan.name}”?`)) {
          simData.plans = simData.plans.filter(item => item.id !== id);
          render();
          updateDownloads('sim');
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
    return kind === 'sim' ? legacyDraft?.simData : legacyDraft?.orderData;
  }

  async function init() {
    bind();
    let legacyDraft = null;
    try {
      const rawLegacy = localStorage.getItem(DRAFT_KEYS.legacy);
      if (rawLegacy) legacyDraft = JSON.parse(rawLegacy);
    } catch (_) {}

    const [simResult, orderResult] = await Promise.allSettled([
      fetch(`/data/sim-plans.json?v=${VERSION}`, { cache: 'no-cache' }),
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
    if (!orderLoaded) {
      const draft = readDraft('order', legacyDraft);
      setConfigStatus('order', draft ? 'Không đọc được máy chủ; đang dùng bản lưu tạm order-config.json.' : 'Không đọc được order-config.json trên máy chủ.');
    }
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
