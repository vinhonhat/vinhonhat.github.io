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

  let simData = { schemaVersion: 4, page: {}, plans: [], faqs: [] };
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
    normalized.features = Array.isArray(normalized.features) ? normalized.features : [];
    normalized.requirements = Array.isArray(normalized.requirements) ? normalized.requirements : [];
    return normalized;
  }

  function normalizeSimData(input) {
    const data = input && typeof input === 'object' ? input : {};
    return {
      ...data,
      schemaVersion: 4,
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
          <small>${escapeHtml(kindLabel(plan.planKind))} · ${escapeHtml(periodLabel(plan.period))} · ${escapeHtml(typeLabel(plan.simType))}</small>
        </div>
        <div class="sim-admin-card-actions">
          ${canSplit ? '<button type="button" class="sim-card-action split" data-split-sim-plan title="Tách thành eSIM và SIM vật lý để nhập hai giá">Tách 2 giá</button>' : ''}
          ${canMerge ? '<button type="button" class="sim-card-action merge" data-merge-sim-plan title="Gộp eSIM và SIM vật lý khi cùng giá">Gộp chung</button>' : ''}
          <button type="button" class="sim-card-action copy" data-duplicate-sim-plan title="Nhân bản gói SIM">Nhân bản</button>
          <button type="button" class="sim-card-action remove" data-remove-sim-plan aria-label="Xóa gói SIM" title="Xóa">×</button>
        </div>
      </header>
      <div class="sim-admin-fields">
        <label class="sim-admin-check"><span>Bật sản phẩm</span><input type="checkbox" data-sim-field="enabled" ${plan.enabled === false ? '' : 'checked'}></label>
        <label class="sim-admin-check"><span>Hiện thẻ ngoài trang</span><input type="checkbox" data-sim-field="showCard" ${plan.showCard === false ? '' : 'checked'}></label>
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
    node.querySelectorAll('[data-sim-field]').forEach(input => {
      const key = input.dataset.simField;
      plan[key] = input.type === 'checkbox' ? input.checked : input.value;
    });
    node.querySelectorAll('[data-sim-lines]').forEach(input => {
      plan[input.dataset.simLines] = input.value.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
    });
    node.dataset.simAdminId = plan.id;
  }

  function collect() {
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
    simData.schemaVersion = 4;
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

  function updateDownloads() {
    collect();
    const simUrl = makeUrl('sim', simData);
    const orderUrl = makeUrl('order', orderData);
    ['#downloadSimPlans', '#downloadSimPlansBottom'].forEach(selector => {
      const link = $(selector);
      if (link) { link.href = simUrl; link.download = 'sim-plans.json'; }
    });
    ['#downloadOrderConfig', '#downloadOrderConfigBottom'].forEach(selector => {
      const link = $(selector);
      if (link) { link.href = orderUrl; link.download = 'order-config.json'; }
    });
    const status = $('#simAdminStatus');
    if (status) {
      const enabled = simData.plans.filter(item => item.enabled !== false).length;
      const current = PRODUCT_VIEWS.has(activeView) ? visiblePlans().length : 0;
      status.textContent = PRODUCT_VIEWS.has(activeView)
        ? `${current} gói trong mục này · ${enabled} gói đang bật · nhận đơn qua ${orderData.mode === 'custom-page' ? 'trang riêng' : 'Messenger'}`
        : `${enabled} gói đang bật · nhận đơn qua ${orderData.mode === 'custom-page' ? 'trang riêng' : 'Messenger'}`;
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
    updateDownloads();
  }

  function switchView(view) {
    if (!VIEW_META[view] || view === activeView) return;
    collect();
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
    collect();
    const meta = VIEW_META[activeView] || VIEW_META.monthly;
    const stamp = Date.now();
    const id = `sim-${stamp}`;
    simData.plans.push(normalizePlan({
      id,
      familyId: id,
      enabled: true,
      showCard: true,
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
    updateDownloads();
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
    updateDownloads();
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
    updateDownloads();
    $('#simAdminStatus').textContent = 'Đã tách thành SIM vật lý và eSIM. Anh có thể nhập hai mức giá riêng.';
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
    updateDownloads();
    $('#simAdminStatus').textContent = 'Đã gộp eSIM và SIM vật lý thành một sản phẩm dùng chung giá.';
  }

  async function importJson(file, kind) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (kind === 'sim') simData = normalizeSimData(parsed);
      else orderData = parsed && typeof parsed === 'object' ? parsed : {};
      fillPage();
      updateView();
    } catch (_) {
      alert('File JSON không hợp lệ.');
    }
  }

  function bind() {
    document.addEventListener('input', event => {
      if (!event.target.closest('#simAdminPanel')) return;
      const cardNode = event.target.closest('.sim-admin-card');
      if (cardNode && event.target.dataset.simField === 'image') updateCardImagePreview(cardNode);
      updateDownloads();
    });
    document.addEventListener('change', event => {
      if (event.target.closest('#simAdminPanel')) {
        const cardNode = event.target.closest('.sim-admin-card');
        if (cardNode && event.target.dataset.simField === 'carrier') syncCarrierImage(cardNode);
        if (cardNode && ['planKind', 'period', 'simType'].includes(event.target.dataset.simField)) {
          collectCard(cardNode);
          render();
        }
        updateDownloads();
      }
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
      if (event.target.closest('#saveSimDraft')) {
        collect();
        localStorage.setItem('vinh-sim-admin-draft', JSON.stringify({ simData, orderData }));
        updateDownloads();
        $('#simAdminStatus').textContent = 'Đã lưu bản đang chỉnh trên trình duyệt này.';
        return;
      }

      const cardNode = event.target.closest('.sim-admin-card');
      if (cardNode && event.target.closest('[data-use-carrier-image]')) {
        syncCarrierImage(cardNode, true);
        collectCard(cardNode);
        updateDownloads();
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
          updateDownloads();
        }
      }
    });
    $('#importSimPlans')?.addEventListener('change', event => { importJson(event.target.files?.[0], 'sim'); event.target.value = ''; });
    $('#importOrderConfig')?.addEventListener('change', event => { importJson(event.target.files?.[0], 'order'); event.target.value = ''; });
  }

  async function init() {
    bind();
    try {
      const [simResponse, orderResponse] = await Promise.all([
        fetch(`/data/sim-plans.json?v=${VERSION}`, { cache: 'no-cache' }),
        fetch(`/data/order-config.json?v=${VERSION}`, { cache: 'no-cache' })
      ]);
      if (!simResponse.ok) throw new Error('sim');
      simData = normalizeSimData(await simResponse.json());
      orderData = orderResponse.ok ? await orderResponse.json() : {};
    } catch (_) {
      const draft = localStorage.getItem('vinh-sim-admin-draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          simData = normalizeSimData(parsed.simData);
          orderData = parsed.orderData || {};
        } catch (_) {}
      }
    }
    fillPage();
    const workspace = $('#simAdminWorkspace');
    if (workspace && localStorage.getItem('vinh-sim-admin-menu-collapsed') === '1') workspace.classList.add('menu-collapsed');
    updateView();
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
