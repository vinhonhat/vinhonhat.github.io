(() => {
  'use strict';

  const VERSION = '26.8.1-beta7';
  const scriptNode = document.querySelector('script[src*="category-page.js"]');
  const siteRoot = new URL('../', scriptNode?.src || new URL('/js/category-page.js', location.origin).href);
  const assetUrl = path => {
    const url = new URL(String(path || '').replace(/^\/+/, ''), siteRoot);
    url.searchParams.set('v', VERSION);
    return url.href;
  };
  const POSTS_URLS = [assetUrl('data/posts-index.json'), assetUrl('data/posts.json')];
  const CATEGORIES_URLS = [assetUrl('data/categories.json')];
  const DEFAULT_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><rect width="960" height="640" fill="#f2f3f5"/><path d="M360 390h240v18H360zM410 300h140v18H410z" fill="#d5d9df"/><text x="480" y="250" text-anchor="middle" fill="#8a929b" font-family="Arial" font-size="34">Vinh ở Nhật</text></svg>'
  );

  const $ = selector => document.querySelector(selector);
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
  const array = value => Array.isArray(value) ? value : value == null || value === '' ? [] : [value];
  const normalizedText = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
  const uniqueKey = post => String(post.link || post.id || post.title || '').trim();

  const ensurePath = (value, fallback = '#') => {
    const path = String(value || '').trim();
    if (!path) return fallback;
    if (/^(https?:|data:|blob:|mailto:|tel:)/i.test(path)) return path;
    try { return new URL(path.replace(/^\/+/, ''), siteRoot).href; }
    catch (_) { return fallback; }
  };

  const normalizeComparableLink = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, siteRoot);
      return `${url.origin}${url.pathname.replace(/\/$/, '')}`.toLowerCase();
    } catch (_) {
      return raw.replace(/\/$/, '').toLowerCase();
    }
  };

  const parseDate = value => {
    const date = value ? new Date(value) : new Date(0);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  };

  const formatDate = post => {
    const raw = post.updatedAt || post.date || post.publishedAt;
    if (!raw) return '';
    const date = parseDate(raw);
    if (!date.getTime()) return '';
    const formatted = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    return post.updatedAt ? `Cập nhật ${formatted}` : formatted;
  };

  async function fetchJson(urls) {
    let lastError;
    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return { data: await response.json(), url };
      } catch (error) { lastError = error; }
    }
    throw lastError || new Error('Không tải được dữ liệu.');
  }

  const extractPosts = payload => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.posts)) return payload.posts;
    return [];
  };

  const canShowPost = post => {
    if (!post || typeof post !== 'object') return false;
    if (post.status === 0 || post.status === false || post.published === false) return false;
    if (post.showInLists === false || post.listVisible === false) return false;
    const mobile = matchMedia('(max-width: 767px)').matches;
    if (mobile && post.showOnMobile === false) return false;
    if (!mobile && post.showOnDesktop === false) return false;
    return Boolean(post.title && post.link);
  };

  const postCategories = post => array(post.category || post.categories).map(item => normalizedText(item));
  const postTags = post => array(post.tags).map(item => normalizedText(item));
  const postSearchText = post => normalizedText([
    post.title, post.summary, post.description, post.link,
    ...array(post.category || post.categories), ...array(post.tags)
  ].join(' '));

  const listIntersects = (source, expected) => {
    const expectedSet = new Set(array(expected).map(item => normalizedText(item)).filter(Boolean));
    return expectedSet.size > 0 && source.some(item => expectedSet.has(item));
  };

  const linkMatches = (post, links) => {
    const target = normalizeComparableLink(post.link);
    return array(links).some(link => normalizeComparableLink(link) === target);
  };

  const keywordMatches = (post, keywords) => {
    const text = postSearchText(post);
    return array(keywords).some(keyword => text.includes(normalizedText(keyword)));
  };

  const selectorMatches = (post, selector = {}, emptyMeansAll = true) => {
    const categories = array(selector.categories);
    const tags = array(selector.tags);
    const keywords = array(selector.keywords);
    const links = array(selector.includeLinks);
    const hasSelector = categories.length || tags.length || keywords.length || links.length;
    if (!hasSelector) return emptyMeansAll;
    return (
      listIntersects(postCategories(post), categories) ||
      listIntersects(postTags(post), tags) ||
      keywordMatches(post, keywords) ||
      linkMatches(post, links)
    );
  };

  const sectionMatches = (post, config) => {
    const excluded = array(config.excludeCategories);
    if (excluded.length && listIntersects(postCategories(post), excluded)) return false;
    return selectorMatches(post, config, true);
  };

  const topicMatches = (post, topic) => selectorMatches(post, topic, true);

  const imageTag = post => {
    const src = ensurePath(post.imageUrl || post.image || post.thumbnail, DEFAULT_IMAGE);
    return `<img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${escapeHtml(DEFAULT_IMAGE)}'">`;
  };

  const categoryLabel = post => {
    const labels = array(post.category || post.categories).filter(Boolean);
    return labels[0] || post.type || 'Hướng dẫn';
  };

  const featuredPrimaryTemplate = post => {
    const link = ensurePath(post.link);
    return `<article class="category-feature-primary">
      <a class="category-feature-primary-image" href="${escapeHtml(link)}">${imageTag(post)}</a>
      <div class="category-feature-primary-copy">
        <div class="category-badge-row">
          <span class="category-label">${escapeHtml(categoryLabel(post))}</span>
          ${post.isNew ? '<span class="category-new-badge">Mới</span>' : ''}
        </div>
        <h2><a href="${escapeHtml(link)}">${escapeHtml(post.title)}</a></h2>
        <p>${escapeHtml(post.summary || '')}</p>
        <div class="category-meta"><span>${escapeHtml(formatDate(post))}</span></div>
      </div>
    </article>`;
  };

  const featuredSideTemplate = post => {
    const link = ensurePath(post.link);
    return `<article class="category-feature-side-item">
      <a class="category-feature-side-image" href="${escapeHtml(link)}">${imageTag(post)}</a>
      <div class="category-feature-side-copy">
        <span>${escapeHtml(categoryLabel(post))}</span>
        <h3><a href="${escapeHtml(link)}">${escapeHtml(post.title)}</a></h3>
        <small>${escapeHtml(formatDate(post))}</small>
      </div>
    </article>`;
  };

  const feedTemplate = post => {
    const link = ensurePath(post.link);
    return `<article class="category-feed-item" data-article-link="${escapeHtml(link)}" tabindex="0" role="link" aria-label="Mở bài ${escapeHtml(post.title)}">
      <a class="category-feed-image" href="${escapeHtml(link)}">${imageTag(post)}</a>
      <div class="category-feed-copy">
        <div class="category-badge-row">
          <span class="category-label">${escapeHtml(categoryLabel(post))}</span>
          ${post.isNew ? '<span class="category-new-badge">Mới</span>' : ''}
        </div>
        <h2><a href="${escapeHtml(link)}">${escapeHtml(post.title)}</a></h2>
        <p>${escapeHtml(post.summary || '')}</p>
        <footer>
          <span>${escapeHtml(formatDate(post))}</span>
          <div>
            <button class="share-button share-button-small" type="button" data-share-url="${escapeHtml(link)}" data-share-title="${escapeHtml(post.title)}" aria-label="Chia sẻ bài ${escapeHtml(post.title)}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"></path></svg><span>Chia sẻ</span>
            </button>
          </div>
        </footer>
      </div>
    </article>`;
  };

  const sidebarPostTemplate = post => {
    const link = ensurePath(post.link);
    return `<a class="category-sidebar-post" href="${escapeHtml(link)}">
      <span class="category-sidebar-thumb">${imageTag(post)}</span>
      <span><strong>${escapeHtml(post.title)}</strong><small>${escapeHtml(formatDate(post))}</small></span>
    </a>`;
  };

  const fallbackConfig = {
    enabled: true,
    pagePath: '/pages/pages-baiviet/bai-viet-hd.html',
    accent: '#e97800', kicker: 'Cẩm nang tại Nhật', title: 'Cẩm nang & Hướng dẫn',
    description: 'Hướng dẫn và kinh nghiệm mới nhất.',
    featuredTitle: 'Nổi bật', latestTitle: 'Mới cập nhật', sidebarTitle: 'Gợi ý thêm',
    featuredCount: 5, pageSize: 8, showSidebar: true,
    topics: [{ id: 'all', label: 'Tất cả', icon: '⌂', categories: [] }], quickLinks: []
  };

  const pushUnique = (target, candidates, limit, used) => {
    for (const post of candidates) {
      const key = uniqueKey(post);
      if (!key || used.has(key)) continue;
      used.add(key);
      target.push(post);
      if (target.length >= limit) break;
    }
  };

  document.addEventListener('DOMContentLoaded', async () => {
    const key = document.body.dataset.sectionKey || 'articles';
    const hero = $('#categoryHero');
    const topicNav = $('#categoryTopicNav');
    const featured = $('#categoryFeatured');
    const feed = $('#categoryFeed');
    const loadMore = $('#categoryLoadMore');
    const sidebar = $('#categorySidebar');
    const sidebarPosts = $('#categorySidebarPosts');
    const quickLinks = $('#categoryQuickLinks');
    const quickCard = quickLinks?.closest('.category-sidebar-card');
    const empty = $('#categoryEmpty');
    if (!hero || !topicNav || !featured || !feed || !empty) return;

    try {
      const previewMode = new URLSearchParams(location.search).get('categoryPreview') === '1';
      let categoryData = { sections: { [key]: fallbackConfig } };
      try { categoryData = (await fetchJson(CATEGORIES_URLS)).data || categoryData; }
      catch (error) { console.warn('[category-page] Dùng cấu hình mặc định.', error); }

      if (previewMode) {
        for (const draftKey of ['vinhonhat-categories-beta5-draft', 'vinhonhat-categories-beta1-draft']) {
          try {
            const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
            if (draft?.sections) { categoryData = draft; break; }
          } catch (_) {}
        }
      }

      const config = { ...fallbackConfig, ...(categoryData.sections?.[key] || {}) };
      const postsPayload = (await fetchJson(POSTS_URLS)).data;
      const rawPosts = extractPosts(postsPayload)
        .filter(canShowPost)
        .filter(post => sectionMatches(post, config))
        .sort((a, b) => parseDate(b.updatedAt || b.date || b.publishedAt) - parseDate(a.updatedAt || a.date || a.publishedAt));

      const allPosts = [];
      const allSeen = new Set();
      pushUnique(allPosts, rawPosts, Number.MAX_SAFE_INTEGER, allSeen);

      if (config.enabled === false) {
        location.replace(ensurePath('/'));
        return;
      }

      document.documentElement.style.setProperty('--cat-accent', config.accent || fallbackConfig.accent);
      $('#categoryKicker').textContent = config.kicker || '';
      $('#categoryTitle').textContent = config.title || fallbackConfig.title;
      $('#categoryDescription').textContent = config.description || '';
      $('#categoryFeaturedTitle').textContent = config.featuredTitle || 'Nổi bật';
      $('#categoryLatestTitle').textContent = config.latestTitle || 'Mới cập nhật';
      $('#categorySidebarTitle').textContent = config.sidebarTitle || 'Gợi ý thêm';
      document.title = `${config.title || fallbackConfig.title} | Vinh ở Nhật`;

      const topics = Array.isArray(config.topics) && config.topics.length ? config.topics : fallbackConfig.topics;
      const params = new URLSearchParams(location.search);
      let activeTopicId = params.get('topic') || topics[0].id || 'all';
      if (!topics.some(topic => topic.id === activeTopicId)) activeTopicId = topics[0].id;
      let visibleCount = Math.max(1, Number(config.pageSize) || 8);

      const renderTopicNav = () => {
        topicNav.innerHTML = topics.map(topic => `<button type="button" class="category-topic-button${topic.id === activeTopicId ? ' active' : ''}" data-topic-id="${escapeHtml(topic.id)}"><span>${escapeHtml(topic.icon || '')}</span>${escapeHtml(topic.label || topic.id)}</button>`).join('');
        topicNav.hidden = topics.length < 2;
      };

      const renderQuickLinks = () => {
        if (!quickLinks) return;
        const items = Array.isArray(config.quickLinks) ? config.quickLinks : [];
        quickCard && (quickCard.hidden = items.length === 0);
        quickLinks.innerHTML = items.map(item => {
          const topic = topics.find(entry => entry.id === item.topic);
          const count = topic ? allPosts.filter(post => topicMatches(post, topic)).length : 0;
          return `<button type="button" class="category-quick-link" data-topic-id="${escapeHtml(item.topic || topics[0].id)}"><span>${escapeHtml(item.icon || '')}</span><span><strong>${escapeHtml(item.label || '')}</strong><small>${escapeHtml(item.description || '')}${item.description ? ' · ' : ''}${count} bài</small></span></button>`;
        }).join('');
      };

      const render = () => {
        const topic = topics.find(item => item.id === activeTopicId) || topics[0];
        const filtered = allPosts.filter(post => topicMatches(post, topic));
        const countNode = $('#categoryCount');
        if (countNode) countNode.textContent = `${filtered.length} nội dung`;

        const featuredPosts = [];
        const featuredUsed = new Set();
        const featuredCount = Math.max(1, Math.min(5, Number(config.featuredCount) || 5));
        pushUnique(featuredPosts, filtered.filter(post => post.featured), featuredCount, featuredUsed);
        pushUnique(featuredPosts, filtered.filter(post => post.isNew), featuredCount, featuredUsed);
        pushUnique(featuredPosts, filtered, featuredCount, featuredUsed);

        if (featuredPosts.length) {
          featured.hidden = false;
          const [primary, ...side] = featuredPosts;
          $('#categoryFeaturePrimary').innerHTML = featuredPrimaryTemplate(primary);
          $('#categoryFeatureSide').innerHTML = side.slice(0, 4).map(featuredSideTemplate).join('');
        } else {
          featured.hidden = true;
        }

        const feedPosts = filtered.filter(post => !featuredUsed.has(uniqueKey(post)));
        const showing = feedPosts.slice(0, visibleCount);
        feed.innerHTML = showing.map(feedTemplate).join('');
        empty.hidden = filtered.length > 0;

        if (loadMore) {
          loadMore.hidden = visibleCount >= feedPosts.length;
          loadMore.dataset.total = String(feedPosts.length);
        }

        if (sidebar) sidebar.hidden = config.showSidebar === false;
        if (sidebarPosts) {
          const sideUsed = new Set(featuredPosts.map(uniqueKey));
          showing.forEach(post => sideUsed.add(uniqueKey(post)));
          let suggested = allPosts.filter(post => !sideUsed.has(uniqueKey(post)) && (post.featured || post.isNew)).slice(0, 6);
          if (!suggested.length) suggested = allPosts.filter(post => !sideUsed.has(uniqueKey(post))).slice(0, 6);
          sidebarPosts.innerHTML = suggested.map(sidebarPostTemplate).join('');
        }

        renderTopicNav();
      };

      topicNav.addEventListener('click', event => {
        const button = event.target.closest('[data-topic-id]');
        if (!button) return;
        activeTopicId = button.dataset.topicId;
        visibleCount = Math.max(1, Number(config.pageSize) || 8);
        const next = new URL(location.href);
        if (activeTopicId === topics[0].id || activeTopicId === 'all') next.searchParams.delete('topic');
        else next.searchParams.set('topic', activeTopicId);
        history.replaceState({}, '', next);
        render();
        hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      quickLinks?.addEventListener('click', event => {
        const button = event.target.closest('[data-topic-id]');
        if (!button) return;
        activeTopicId = button.dataset.topicId;
        visibleCount = Math.max(1, Number(config.pageSize) || 8);
        const next = new URL(location.href);
        if (activeTopicId === topics[0].id || activeTopicId === 'all') next.searchParams.delete('topic');
        else next.searchParams.set('topic', activeTopicId);
        history.replaceState({}, '', next);
        render();
        hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      loadMore?.addEventListener('click', () => {
        visibleCount += Math.max(1, Number(config.pageSize) || 8);
        render();
      });

      const openFeedCard = event => {
        const card = event.target.closest('[data-article-link]');
        if (!card || event.target.closest('a, button, input, select, textarea')) return;
        const href = card.dataset.articleLink;
        if (href) location.href = href;
      };
      feed.addEventListener('click', openFeedCard);
      feed.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const card = event.target.closest('[data-article-link]');
        if (!card || event.target.closest('a, button')) return;
        event.preventDefault();
        const href = card.dataset.articleLink;
        if (href) location.href = href;
      });

      renderQuickLinks();
      render();
    } catch (error) {
      console.error(error);
      featured.hidden = true;
      feed.innerHTML = '';
      empty.hidden = false;
      empty.querySelector('strong').textContent = 'Không thể tải chuyên mục';
      empty.querySelector('p').textContent = 'Anh kiểm tra lại data/posts-index.json và data/categories.json rồi tải lại trang.';
    }
  });
})();
