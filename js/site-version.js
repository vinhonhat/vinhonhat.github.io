/*
 * Vinh ở Nhật - khai báo phiên bản tập trung.
 * Mỗi lần phát hành chỉ sửa RELEASE, CHANNEL và BUILD tại file này.
 */
(function initVinhSiteVersion(globalScope) {
  'use strict';

  const RELEASE = '26.8.2';
  const CHANNEL = 'Beta';
  const BUILD = 14;

  const channelSlug = CHANNEL.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = `${RELEASE}-${channelSlug}${BUILD}`;
  const label = `V${RELEASE} ${CHANNEL} ${BUILD}`;

  const info = Object.freeze({
    release: RELEASE,
    channel: CHANNEL,
    build: BUILD,
    id,
    label,
    cacheName: `vinhonhat-${id}`,
    schemaVersion: 1
  });

  globalScope.VinhSiteVersion = info;
  globalScope.VINH_SITE_VERSION = id;

  function withVersion(path) {
    const raw = String(path || '').trim();
    if (!raw || /^(data:|blob:|mailto:|tel:|javascript:)/i.test(raw)) return raw;
    try {
      const base = globalScope.location?.origin || 'https://vinhonhat.github.io';
      const url = new URL(raw, base);
      url.searchParams.set('v', id);
      return url.pathname + url.search + url.hash;
    } catch (_) {
      const separator = raw.includes('?') ? '&' : '?';
      return `${raw}${separator}v=${encodeURIComponent(id)}`;
    }
  }

  function applyVersionLabels(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    const nodes = [];
    if (root.nodeType === 1 && root.matches?.('[data-site-version],[data-site-version-label],[data-site-build],[data-current-year]')) {
      nodes.push(root);
    }
    nodes.push(...root.querySelectorAll('[data-site-version],[data-site-version-label],[data-site-build],[data-current-year]'));
    nodes.forEach(node => {
      if (node.hasAttribute('data-site-version')) node.textContent = id;
      if (node.hasAttribute('data-site-version-label')) node.textContent = label;
      if (node.hasAttribute('data-site-build')) node.textContent = String(BUILD);
      if (node.hasAttribute('data-current-year')) node.textContent = String(new Date().getFullYear());
    });
  }

  globalScope.vinhAssetUrl = withVersion;
  globalScope.applyVinhSiteVersion = applyVersionLabels;

  if (typeof document !== 'undefined') {
    const apply = () => applyVersionLabels(document);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
    else apply();

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) applyVersionLabels(node);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})(typeof self !== 'undefined' ? self : window);
