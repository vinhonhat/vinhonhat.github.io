(() => {
  'use strict';

  const VERSION = window.VinhSiteVersion?.id || 'dev';
  const CONFIG_URL = `/data/categories.json?v=${VERSION}`;
  const DRAFT_KEY = 'vinhonhat-categories-beta5-draft';
  const SECTION_LABELS = {
    articles: 'Cẩm nang & Hướng dẫn',
    rakuten: 'Rakuten',
    seven: 'Seven Bank',
    sim: 'SIM & Điện thoại',
    life: 'Cuộc sống tại Nhật',
    study: 'Học tập & Tokutei',
    nihongo: 'Học tiếng Nhật',
    tokutei: 'Tài liệu Tokutei',
    entertainment: 'Giải trí',
    downloads: 'Kho công cụ'
  };
  const DEFAULT_SECTION = {
    enabled: true,
    pagePath: '/pages/pages-baiviet/bai-viet-hd.html',
    layout: 'magazine',
    accent: '#e97800',
    kicker: 'Chuyên mục',
    title: 'Chuyên mục',
    description: '',
    featuredTitle: 'Nổi bật',
    latestTitle: 'Mới cập nhật',
    sidebarTitle: 'Gợi ý thêm',
    featuredCount: 5,
    pageSize: 8,
    showSidebar: true,
    categories: [],
    excludeCategories: [],
    includeLinks: [],
    topics: [{ id: 'all', label: 'Tất cả', icon: '⌂', categories: [], tags: [], keywords: [] }],
    quickLinks: []
  };

  let state = { schemaVersion: 1, sections: { articles: structuredClone(DEFAULT_SECTION) } };
  let activeKey = 'articles';
  let objectUrl = '';

  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
  const normalizeList = value => String(value || '')
    .split(/[\n,]+/)
    .map(item => item.trim())
    .filter(Boolean);
  const safeId = value => String(value || '')
    .trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `topic-${Date.now()}`;

  const normalizeSection = input => {
    const section = input && typeof input === 'object' ? input : {};
    return {
      ...structuredClone(DEFAULT_SECTION),
      ...section,
      categories: Array.isArray(section.categories) ? section.categories : [],
      excludeCategories: Array.isArray(section.excludeCategories) ? section.excludeCategories : [],
      includeLinks: Array.isArray(section.includeLinks) ? section.includeLinks : [],
      topics: Array.isArray(section.topics) && section.topics.length ? section.topics : structuredClone(DEFAULT_SECTION.topics),
      quickLinks: Array.isArray(section.quickLinks) ? section.quickLinks : []
    };
  };

  function mergeConfig(input) {
    const source = input && typeof input === 'object' ? input : {};
    const sourceSections = source.sections && typeof source.sections === 'object' ? source.sections : {};
    const sections = {};
    Object.entries(sourceSections).forEach(([key, value]) => { sections[key] = normalizeSection(value); });
    if (!sections.articles) sections.articles = structuredClone(DEFAULT_SECTION);
    return { schemaVersion: 1, sections };
  }

  const section = () => state.sections[activeKey] || state.sections.articles;

  function setValue(selector, value) {
    const node = $(selector);
    if (node) node.value = value ?? '';
  }
  function setChecked(selector, value) {
    const node = $(selector);
    if (node) node.checked = Boolean(value);
  }

  function populateSectionSelector() {
    const select = $('#categorySectionSelector');
    if (!select) return;
    select.innerHTML = Object.keys(state.sections).map(key => `<option value="${escapeHtml(key)}">${escapeHtml(SECTION_LABELS[key] || state.sections[key].title || key)}</option>`).join('');
    if (!state.sections[activeKey]) activeKey = Object.keys(state.sections)[0] || 'articles';
    select.value = activeKey;
  }

  function fillForm() {
    populateSectionSelector();
    const item = section();
    setChecked('#categoryEnabledInput', item.enabled !== false);
    setChecked('#categorySidebarInput', item.showSidebar !== false);
    setValue('#categoryLayout', item.layout || 'magazine');
    setValue('#categoryIconInput', item.accent || '#e97800');
    setValue('#categoryKickerInput', item.kicker || '');
    setValue('#categoryTitleInput', item.title || '');
    setValue('#categoryDescriptionInput', item.description || '');
    setValue('#categorySourceCategoriesInput', (item.categories || []).join(', '));
    setValue('#categoryExcludeCategoriesInput', (item.excludeCategories || []).join(', '));
    setValue('#categoryIncludeLinksInput', (item.includeLinks || []).join('\n'));
    setValue('#categoryFeaturedCountInput', item.featuredCount || 5);
    setValue('#categoryPageSizeInput', item.pageSize || 8);
    setValue('#categoryFeaturedTitleInput', item.featuredTitle || '');
    setValue('#categoryLatestTitleInput', item.latestTitle || '');
    setValue('#categorySidebarTitleInput', item.sidebarTitle || '');
    renderTopics();
    renderQuickLinks();
    updateDownloads(false);
  }

  function readForm() {
    const item = section();
    item.enabled = $('#categoryEnabledInput')?.checked ?? true;
    item.showSidebar = $('#categorySidebarInput')?.checked ?? true;
    item.layout = $('#categoryLayout')?.value || 'magazine';
    item.accent = $('#categoryIconInput')?.value?.trim() || '#e97800';
    item.kicker = $('#categoryKickerInput')?.value?.trim() || '';
    item.title = $('#categoryTitleInput')?.value?.trim() || SECTION_LABELS[activeKey] || 'Chuyên mục';
    item.description = $('#categoryDescriptionInput')?.value?.trim() || '';
    item.categories = normalizeList($('#categorySourceCategoriesInput')?.value);
    item.excludeCategories = normalizeList($('#categoryExcludeCategoriesInput')?.value);
    item.includeLinks = normalizeList($('#categoryIncludeLinksInput')?.value);
    item.featuredCount = Math.max(1, Math.min(5, Number($('#categoryFeaturedCountInput')?.value) || 5));
    item.pageSize = Math.max(1, Math.min(30, Number($('#categoryPageSizeInput')?.value) || 8));
    item.featuredTitle = $('#categoryFeaturedTitleInput')?.value?.trim() || 'Nổi bật';
    item.latestTitle = $('#categoryLatestTitleInput')?.value?.trim() || 'Mới cập nhật';
    item.sidebarTitle = $('#categorySidebarTitleInput')?.value?.trim() || 'Gợi ý thêm';

    $$('.category-topic-admin-card').forEach(card => {
      const topic = item.topics.find(entry => entry._adminKey === card.dataset.adminKey || entry.id === card.dataset.topicId);
      if (!topic) return;
      topic.id = safeId(card.querySelector('[data-field="id"]')?.value || topic.id);
      topic.label = card.querySelector('[data-field="label"]')?.value?.trim() || topic.id;
      topic.icon = card.querySelector('[data-field="icon"]')?.value?.trim() || '';
      topic.categories = normalizeList(card.querySelector('[data-field="categories"]')?.value);
      topic.tags = normalizeList(card.querySelector('[data-field="tags"]')?.value);
      topic.keywords = normalizeList(card.querySelector('[data-field="keywords"]')?.value);
    });

    $$('.category-quick-admin-card').forEach(card => {
      const link = item.quickLinks.find(entry => entry._adminKey === card.dataset.adminKey);
      if (!link) return;
      link.label = card.querySelector('[data-field="label"]')?.value?.trim() || 'Chủ đề';
      link.description = card.querySelector('[data-field="description"]')?.value?.trim() || '';
      link.topic = card.querySelector('[data-field="topic"]')?.value || 'all';
      link.icon = card.querySelector('[data-field="icon"]')?.value?.trim() || '';
    });
    state.schemaVersion = 1;
  }

  function moveItem(list, index, direction) {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
  }

  function topicCard(topic, index) {
    const adminKey = topic._adminKey || `topic-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;
    topic._adminKey = adminKey;
    return `<article class="category-topic-admin-card" data-admin-key="${escapeHtml(adminKey)}" data-topic-id="${escapeHtml(topic.id || '')}">
      <header><strong>Chủ đề ${index + 1}</strong><div><button type="button" data-topic-move="up" title="Đưa lên">↑</button><button type="button" data-topic-move="down" title="Đưa xuống">↓</button><button type="button" data-topic-remove title="Xóa">×</button></div></header>
      <div class="category-admin-fields four">
        <label>ID<input data-field="id" value="${escapeHtml(topic.id || '')}" placeholder="rakuten"></label>
        <label>Tên hiển thị<input data-field="label" value="${escapeHtml(topic.label || '')}" placeholder="Rakuten"></label>
        <label>Icon<input data-field="icon" value="${escapeHtml(topic.icon || '')}" maxlength="6" placeholder="R"></label>
        <label>Danh mục bài<input data-field="categories" value="${escapeHtml((topic.categories || []).join(', '))}" placeholder="rakuten, bank"></label>
        <label>Thẻ bài<input data-field="tags" value="${escapeHtml((topic.tags || []).join(', '))}" placeholder="mobile, card"></label>
        <label>Từ khóa<input data-field="keywords" value="${escapeHtml((topic.keywords || []).join(', '))}" placeholder="cước, hóa đơn, mnp"></label>
      </div>
      <p>Chủ đề “Tất cả” để trống danh mục, thẻ và từ khóa. Các điều kiện khác được ghép theo kiểu chỉ cần khớp một.</p>
    </article>`;
  }

  function renderTopics() {
    const list = $('#categoryTopicList');
    if (!list) return;
    const topics = section().topics || [];
    list.innerHTML = topics.length ? topics.map(topicCard).join('') : '<div class="category-admin-empty">Chưa có chủ đề.</div>';
  }

  function quickCard(item, index) {
    const adminKey = item._adminKey || `quick-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;
    item._adminKey = adminKey;
    const options = (section().topics || []).map(topic => `<option value="${escapeHtml(topic.id)}" ${topic.id === item.topic ? 'selected' : ''}>${escapeHtml(topic.label || topic.id)}</option>`).join('');
    return `<article class="category-quick-admin-card" data-admin-key="${escapeHtml(adminKey)}">
      <header><strong>Nút ${index + 1}</strong><div><button type="button" data-quick-move="up" title="Đưa lên">↑</button><button type="button" data-quick-move="down" title="Đưa xuống">↓</button><button type="button" data-quick-remove title="Xóa">×</button></div></header>
      <div class="category-admin-fields four">
        <label>Tên<input data-field="label" value="${escapeHtml(item.label || '')}"></label>
        <label>Mô tả<input data-field="description" value="${escapeHtml(item.description || '')}"></label>
        <label>Liên kết chủ đề<select data-field="topic">${options}</select></label>
        <label>Icon<input data-field="icon" value="${escapeHtml(item.icon || '')}" maxlength="6"></label>
      </div>
    </article>`;
  }

  function renderQuickLinks() {
    const list = $('#categoryQuickLinkList');
    if (!list) return;
    const items = section().quickLinks || [];
    list.innerHTML = items.length ? items.map(quickCard).join('') : '<div class="category-admin-empty">Chưa có nút chủ đề nhanh.</div>';
  }

  function cleanForDownload(value) {
    return JSON.parse(JSON.stringify(value, (key, item) => key === '_adminKey' ? undefined : item));
  }

  function updateDownloads(read = true) {
    if (read) readForm();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const output = cleanForDownload(state);
    objectUrl = URL.createObjectURL(new Blob([JSON.stringify(output, null, 2) + '\n'], { type: 'application/json;charset=utf-8' }));
    ['#downloadCategoriesConfig', '#downloadCategoriesConfigBottom'].forEach(selector => {
      const link = $(selector);
      if (link) { link.href = objectUrl; link.download = 'categories.json'; }
    });
    const status = $('#categoryConfigStatus');
    if (status) status.textContent = `${SECTION_LABELS[activeKey] || section().title}: ${section().topics.length} chủ đề · ${section().featuredCount} bài nổi bật · ${section().pageSize} bài mỗi lần`;
  }

  function saveDraft() {
    readForm();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(cleanForDownload(state)));
    updateDownloads(false);
    const status = $('#categoryConfigStatus');
    if (status) status.textContent = 'Đã lưu bản xem trước trên trình duyệt này.';
  }

  function addTopic() {
    readForm();
    const item = section();
    item.topics.push({ id: `topic-${item.topics.length + 1}`, label: 'Chủ đề mới', icon: '', categories: [], tags: [], keywords: [] });
    renderTopics();
    renderQuickLinks();
    updateDownloads(false);
  }

  function addQuickLink() {
    readForm();
    const item = section();
    item.quickLinks.push({ label: 'Chủ đề mới', description: '', topic: item.topics[0]?.id || 'all', icon: '' });
    renderQuickLinks();
    updateDownloads(false);
  }

  function bindEvents() {
    $('#categorySectionSelector')?.addEventListener('change', event => {
      readForm();
      activeKey = event.target.value;
      fillForm();
    });

    document.addEventListener('input', event => {
      if (event.target.closest('#categoriesAdminPanel')) updateDownloads();
    });
    document.addEventListener('change', event => {
      if (event.target.closest('#categoriesAdminPanel') && event.target.id !== 'categorySectionSelector') updateDownloads();
    });
    document.addEventListener('click', event => {
      if (event.target.closest('#addCategoryTopic')) { addTopic(); return; }
      if (event.target.closest('#addCategoryQuickLink')) { addQuickLink(); return; }
      if (event.target.closest('#saveCategoryConfigLocal')) { saveDraft(); return; }
      if (event.target.closest('#previewCategoryConfig')) {
        saveDraft();
        window.open(`${section().pagePath || '/pages/pages-baiviet/bai-viet-hd.html'}?categoryPreview=1`, '_blank', 'noopener');
        return;
      }

      const topicCardNode = event.target.closest('.category-topic-admin-card');
      if (topicCardNode) {
        readForm();
        const index = section().topics.findIndex(item => item._adminKey === topicCardNode.dataset.adminKey || item.id === topicCardNode.dataset.topicId);
        if (index < 0) return;
        const move = event.target.closest('[data-topic-move]');
        if (move) { moveItem(section().topics, index, move.dataset.topicMove); renderTopics(); renderQuickLinks(); updateDownloads(false); return; }
        if (event.target.closest('[data-topic-remove]')) {
          if (section().topics[index].id === 'all') { alert('Chủ đề “Tất cả” cần được giữ lại.'); return; }
          section().topics.splice(index, 1);
          renderTopics(); renderQuickLinks(); updateDownloads(false); return;
        }
      }

      const quickCardNode = event.target.closest('.category-quick-admin-card');
      if (quickCardNode) {
        readForm();
        const index = section().quickLinks.findIndex(item => item._adminKey === quickCardNode.dataset.adminKey);
        if (index < 0) return;
        const move = event.target.closest('[data-quick-move]');
        if (move) { moveItem(section().quickLinks, index, move.dataset.quickMove); renderQuickLinks(); updateDownloads(false); return; }
        if (event.target.closest('[data-quick-remove]')) { section().quickLinks.splice(index, 1); renderQuickLinks(); updateDownloads(false); }
      }
    });

    $('#importCategoriesConfig')?.addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        state = mergeConfig(JSON.parse(await file.text()));
        activeKey = state.sections[activeKey] ? activeKey : Object.keys(state.sections)[0];
        fillForm();
        $('#categoryConfigStatus').textContent = `Đã nhập ${file.name}.`;
      } catch (_) {
        alert('File categories.json không hợp lệ.');
      } finally {
        event.target.value = '';
      }
    });
  }

  async function init() {
    if (!$('#categoriesAdminPanel')) return;
    bindEvents();
    try {
      const response = await fetch(CONFIG_URL, { cache: 'no-cache' });
      if (!response.ok) throw new Error(String(response.status));
      state = mergeConfig(await response.json());
    } catch (_) {
      const draft = localStorage.getItem(DRAFT_KEY) || localStorage.getItem('vinhonhat-categories-beta1-draft');
      if (draft) {
        try { state = mergeConfig(JSON.parse(draft)); }
        catch (_) { state = mergeConfig(null); }
      }
    }
    fillForm();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
