(() => {
  'use strict';
  const VERSION = window.VinhSiteVersion?.id || 'dev';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  let simData = { schemaVersion: 3, page: {}, plans: [], faqs: [] };
  let orderData = {};
  let urls = { sim: '', order: '' };

  function makeUrl(key, data) {
    if (urls[key]) URL.revokeObjectURL(urls[key]);
    urls[key] = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json;charset=utf-8' }));
    return urls[key];
  }

  function fillPage() {
    $('#simAdminTitle').value = simData.page?.title || '';
    $('#simAdminEyebrow').value = simData.page?.eyebrow || '';
    $('#simAdminDescription').value = simData.page?.description || '';
    $('#simAdminNotice').value = simData.page?.notice || '';
    $('#simOrderMode').value = orderData.mode || 'messenger';
    $('#simMessengerUrl').value = orderData.messengerUrl || '';
    $('#simFacebookUrl').value = orderData.facebookUrl || '';
    $('#simCustomOrderUrl').value = orderData.customPageUrl || '';
    $('#simMessageTemplate').value = orderData.messageTemplate || '';
    $('#simCopyMessage').checked = orderData.copyMessageBeforeOpen !== false;
    $('#simAppendText').checked = orderData.appendTextQuery !== false;
    $('#simOpenNewTab').checked = orderData.openInNewTab !== false;
  }

  function card(plan) {
    return `<article class="sim-admin-card" data-sim-admin-id="${escapeHtml(plan.id)}">
      <header><div><strong>${escapeHtml(plan.cardName || plan.name || 'Gói SIM')}</strong><small>${escapeHtml(plan.period || 'monthly')} · ${escapeHtml(plan.simType || 'physical')}</small></div><button type="button" data-remove-sim-plan>×</button></header>
      <div class="sim-admin-fields">
        <label><span>Bật sản phẩm</span><input type="checkbox" data-sim-field="enabled" ${plan.enabled === false ? '' : 'checked'}></label>
        <label><span>Hiện thẻ ngoài trang</span><input type="checkbox" data-sim-field="showCard" ${plan.showCard === false ? '' : 'checked'}></label>
        <label><span>ID</span><input type="text" data-sim-field="id" value="${escapeHtml(plan.id || '')}"></label>
        <label><span>Nhóm biến thể</span><input type="text" data-sim-field="familyId" value="${escapeHtml(plan.familyId || '')}"></label>
        <label><span>Chu kỳ</span><select data-sim-field="period"><option value="monthly" ${plan.period === 'monthly' ? 'selected' : ''}>SIM tháng</option><option value="yearly" ${plan.period === 'yearly' ? 'selected' : ''}>SIM năm</option></select></label>
        <label><span>Loại SIM</span><select data-sim-field="simType"><option value="physical" ${plan.simType === 'physical' ? 'selected' : ''}>SIM vật lý</option><option value="esim" ${plan.simType === 'esim' ? 'selected' : ''}>eSIM</option></select></label>
        <label><span>Tên ngoài thẻ</span><input type="text" data-sim-field="cardName" value="${escapeHtml(plan.cardName || '')}"></label>
        <label><span>Tên chi tiết</span><input type="text" data-sim-field="name" value="${escapeHtml(plan.name || '')}"></label>
        <label><span>Giá</span><input type="text" data-sim-field="price" value="${escapeHtml(plan.price || '')}"></label>
        <label><span>Ảnh</span><input type="text" data-sim-field="image" value="${escapeHtml(plan.image || '')}"></label>
        <label><span>Nhà mạng</span><input type="text" data-sim-field="carrier" value="${escapeHtml(plan.carrier || '')}"></label>
        <label><span>Dung lượng</span><input type="text" data-sim-field="dataLabel" value="${escapeHtml(plan.dataLabel || '')}"></label>
        <label><span>Thời hạn</span><input type="text" data-sim-field="durationLabel" value="${escapeHtml(plan.durationLabel || '')}"></label>
        <label class="wide"><span>Mô tả</span><textarea rows="2" data-sim-field="subtitle">${escapeHtml(plan.subtitle || '')}</textarea></label>
        <label class="wide"><span>Tính năng, mỗi dòng một ý</span><textarea rows="4" data-sim-lines="features">${escapeHtml((plan.features || []).join('\n'))}</textarea></label>
        <label class="wide"><span>Cần kiểm tra trước, mỗi dòng một ý</span><textarea rows="3" data-sim-lines="requirements">${escapeHtml((plan.requirements || []).join('\n'))}</textarea></label>
        <label class="wide"><span>Phù hợp với</span><textarea rows="2" data-sim-field="recommendedFor">${escapeHtml(plan.recommendedFor || '')}</textarea></label>
      </div>
    </article>`;
  }

  function render() {
    const list = $('#simAdminList');
    if (!list) return;
    list.innerHTML = simData.plans?.length ? simData.plans.map(card).join('') : '<p>Chưa có gói SIM.</p>';
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
      notice: $('#simAdminNotice').value.trim()
    };
    $$('.sim-admin-card').forEach(collectCard);
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
    ['#downloadSimPlans','#downloadSimPlansBottom'].forEach(selector => { const link=$(selector); if(link){link.href=simUrl;link.download='sim-plans.json';} });
    ['#downloadOrderConfig','#downloadOrderConfigBottom'].forEach(selector => { const link=$(selector); if(link){link.href=orderUrl;link.download='order-config.json';} });
    const status = $('#simAdminStatus');
    if (status) status.textContent = `${simData.plans.filter(item => item.enabled !== false).length} gói đang bật · nhận đơn qua ${orderData.mode === 'custom-page' ? 'trang riêng' : 'Messenger'}`;
  }

  function addPlan() {
    collect();
    const id = `sim-${Date.now()}`;
    simData.plans.push({
      id, familyId: id, enabled: true, showCard: true, period: 'monthly', simType: 'physical', carrier: 'SoftBank',
      name: 'Gói SIM mới', cardName: 'Gói SIM mới', subtitle: '', price: 'Liên hệ', dataLabel: '', durationLabel: '',
      image: '/img/sim/softbank-demo.png', features: [], requirements: [], recommendedFor: ''
    });
    render();
    updateDownloads();
    document.querySelector('.sim-admin-card:last-child')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function importJson(file, kind) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (kind === 'sim') simData = parsed;
      else orderData = parsed;
      fillPage();
      render();
      updateDownloads();
    } catch (_) {
      alert('File JSON không hợp lệ.');
    }
  }

  function bind() {
    document.addEventListener('input', event => {
      if (event.target.closest('#simAdminPanel')) updateDownloads();
    });
    document.addEventListener('change', event => {
      if (event.target.closest('#simAdminPanel')) updateDownloads();
    });
    document.addEventListener('click', event => {
      if (event.target.closest('#addSimPlan')) { addPlan(); return; }
      if (event.target.closest('#saveSimDraft')) {
        collect();
        localStorage.setItem('vinh-sim-admin-draft', JSON.stringify({ simData, orderData }));
        updateDownloads();
        $('#simAdminStatus').textContent = 'Đã lưu bản đang chỉnh trên trình duyệt này.';
        return;
      }
      const remove = event.target.closest('[data-remove-sim-plan]');
      if (remove) {
        const cardNode = remove.closest('.sim-admin-card');
        const id = cardNode.dataset.simAdminId;
        const plan = simData.plans.find(item => item.id === id);
        if (plan && confirm(`Xóa “${plan.cardName || plan.name}”?`)) {
          simData.plans = simData.plans.filter(item => item.id !== id);
          render();
          updateDownloads();
        }
      }
    });
    $('#importSimPlans')?.addEventListener('change', event => { importJson(event.target.files?.[0], 'sim'); event.target.value=''; });
    $('#importOrderConfig')?.addEventListener('change', event => { importJson(event.target.files?.[0], 'order'); event.target.value=''; });
  }

  async function init() {
    bind();
    try {
      const [simResponse, orderResponse] = await Promise.all([
        fetch(`/data/sim-plans.json?v=${VERSION}`, { cache: 'no-cache' }),
        fetch(`/data/order-config.json?v=${VERSION}`, { cache: 'no-cache' })
      ]);
      if (!simResponse.ok) throw new Error('sim');
      simData = await simResponse.json();
      orderData = orderResponse.ok ? await orderResponse.json() : {};
    } catch (_) {
      const draft = localStorage.getItem('vinh-sim-admin-draft');
      if (draft) {
        try { ({ simData, orderData } = JSON.parse(draft)); } catch (_) {}
      }
    }
    fillPage();
    render();
    updateDownloads();
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();
