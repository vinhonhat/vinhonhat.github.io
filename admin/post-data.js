export const POSTS_SCHEMA_VERSION = 3;
export const POST_HTML_VERSION = 3;

const todayIso = () => new Date().toISOString().slice(0, 10);

export function normalizePostsPayload(payload) {
  const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.posts) ? payload.posts : []);
  return rows.map(normalizePost);
}

export function normalizePost(raw = {}) {
  const publishedAt = raw.publishedAt || raw.date || raw.createdAt || todayIso();
  const updatedAt = raw.updatedAt || raw.modifiedAt || null;
  const link = String(raw.link || raw.url || '');
  const internalHtml = link.startsWith('/') && /\.html(?:[?#].*)?$/i.test(link);
  return {
    ...raw,
    schemaVersion: POSTS_SCHEMA_VERSION,
    id: String(raw.id || '').trim(),
    type: String(raw.type || 'post').trim(),
    status: Number(raw.status) === 0 ? 0 : 1,
    category: toArray(raw.category || raw.categories),
    tags: toArray(raw.tags),
    publishedAt,
    updatedAt,
    featured: raw.featured === true,
    isNew: raw.isNew === true || raw.new === true,
    showInLists: raw.showInLists !== false,
    searchable: raw.searchable !== false,
    showOnDesktop: raw.showOnDesktop !== false,
    showOnMobile: raw.showOnMobile !== false,
    title: String(raw.title || '').trim(),
    summary: String(raw.summary || raw.description || '').trim(),
    searchText: String(raw.searchText || '').replace(/\s+/g, ' ').trim().slice(0, 12000),
    imageUrl: String(raw.imageUrl || raw.image || '').trim(),
    link,
    contentSource: raw.contentSource || (internalHtml ? 'html' : (link.startsWith('/') ? 'page' : 'external')),
    contentVersion: Number(raw.contentVersion || 0),
    contentSelector: raw.contentSelector || '#article-content'
  };
}

export function buildPostsPayload(posts) {
  return {
    schemaVersion: POSTS_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    sourceOfTruth: 'html',
    posts: posts.map(post => stripLegacyFields(normalizePost(post)))
  };
}

export function buildPostsIndex(posts) {
  return posts.map(raw => {
    const post = normalizePost(raw);
    return {
      id: post.id,
      type: post.type,
      status: post.status,
      category: post.category,
      tags: post.tags,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      date: effectiveDate(post),
      featured: post.featured,
      isNew: post.isNew,
      showInLists: post.showInLists,
      showOnDesktop: post.showOnDesktop,
      showOnMobile: post.showOnMobile,
      searchable: post.searchable,
      title: post.title,
      summary: post.summary,
      imageUrl: post.imageUrl,
      link: post.link,
      contentSource: post.contentSource,
      contentVersion: post.contentVersion
    };
  });
}

export function buildPostsSearchIndex(posts) {
  return posts.map(raw => {
    const post = normalizePost(raw);
    return {
      id: post.id,
      type: post.type,
      status: post.status,
      category: post.category,
      tags: post.tags,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      date: effectiveDate(post),
      searchable: post.searchable,
      title: post.title,
      summary: post.summary,
      searchText: post.searchText,
      imageUrl: post.imageUrl,
      link: post.link
    };
  });
}

export function effectiveDate(post) {
  return post?.updatedAt || post?.publishedAt || post?.date || '';
}

export function dateLabel(post) {
  const normalized = normalizePost(post);
  if (normalized.updatedAt) return `Cập nhật: ${formatViDate(normalized.updatedAt)}`;
  return `Ngày đăng: ${formatViDate(normalized.publishedAt)}`;
}

export function formatViDate(value) {
  const parts = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parts) return String(value || '');
  return `Ngày ${parts[3]} tháng ${parts[2]} năm ${parts[1]}`;
}

export function parseArticleHtml(html, fallbackPost = {}) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html || ''), 'text/html');
  const fallback = normalizePost(fallbackPost);
  const warnings = [];

  let embedded = {};
  const embeddedNode = doc.querySelector('#vinh-post-meta[type="application/json"], script[data-vinh-post-meta]');
  if (embeddedNode?.textContent?.trim()) {
    try {
      embedded = JSON.parse(embeddedNode.textContent);
    } catch (error) {
      warnings.push(`Metadata nhúng không hợp lệ: ${error.message}`);
    }
  }

  const contentNode = doc.querySelector('[data-vinh-post-content], #article-content, .article-content, main article, article .prose, .prose');
  if (!contentNode) warnings.push('Không tìm thấy vùng nội dung bài; Admin sẽ dùng dữ liệu dự phòng nếu có.');

  // Phần nhìn thấy trong HTML được ưu tiên để anh có thể sửa HTML thủ công mà Admin vẫn hiểu.
  const visibleTitle = textOf(doc.querySelector('#page-title, article h1, main h1, h1')) || cleanDocumentTitle(doc.title);
  const visibleSummary = textOf(doc.querySelector('.article-summary')) || attrOf(doc.querySelector('meta[name="description"]'), 'content');
  const visibleImage = attrOf(doc.querySelector('.article-cover img, article img, main img'), 'src') || attrOf(doc.querySelector('meta[property="og:image"]'), 'content');
  const title = visibleTitle || embedded.title || fallback.title;
  const summary = visibleSummary || embedded.summary || fallback.summary;
  const imageUrl = visibleImage || embedded.imageUrl || fallback.imageUrl;
  if (embedded.title && visibleTitle && embedded.title !== visibleTitle) warnings.push('Tiêu đề hiển thị khác metadata nhúng; Admin đã ưu tiên tiêu đề đang thấy trong HTML.');
  if (embedded.summary && visibleSummary && embedded.summary !== visibleSummary) warnings.push('Mô tả HTML khác metadata nhúng; Admin đã ưu tiên meta description hiện tại.');

  const explicitUpdated = datetimeOf(doc.querySelector('time[data-date-kind="updated"], time[data-updated-at]'))
    || normalizeDateString(attrOf(doc.querySelector('meta[property="article:modified_time"]'), 'content'))
    || embedded.updatedAt;
  const explicitPublished = datetimeOf(doc.querySelector('time[data-date-kind="published"], time[data-published-at]'))
    || normalizeDateString(attrOf(doc.querySelector('meta[property="article:published_time"]'), 'content'))
    || embedded.publishedAt;
  const dateText = doc.body?.textContent || '';
  const textUpdated = findVietnameseDate(dateText, /(?:Cập\s*nhật|Ngày\s*cập\s*nhật)\s*:/i);
  const textPublished = findVietnameseDate(dateText, /(?:Ngày\s*đăng|Đăng\s*ngày)\s*:/i);
  const genericTime = datetimeOf(doc.querySelector('time[datetime]'));

  const publishedAt = explicitPublished || textPublished || (!explicitUpdated ? genericTime : null) || fallback.publishedAt || todayIso();
  const updatedAt = explicitUpdated || textUpdated || embedded.modifiedAt || fallback.updatedAt || null;

  const detectedHtmlVersion = embeddedNode
    ? Math.max(2, Number(embedded.htmlVersion || doc.body?.dataset?.postHtmlVersion || 2) || 2)
    : 1;

  return {
    post: normalizePost({
      ...fallback,
      ...embedded,
      title,
      summary,
      imageUrl,
      publishedAt,
      updatedAt,
      contentSource: 'html',
      contentVersion: detectedHtmlVersion,
      contentSelector: '#article-content',
      searchText: textOf(contentNode).slice(0, 3000) || fallback.searchText
    }),
    contentHtml: contentNode?.innerHTML?.trim() || '',
    contentText: textOf(contentNode).slice(0, 3000),
    format: embeddedNode ? `html-v${detectedHtmlVersion}` : 'html-legacy',
    warnings,
    document: doc
  };
}

export async function fetchAndParsePost(post, options = {}) {
  const normalized = normalizePost(post);
  if (!isInternalLink(normalized.link)) {
    throw new Error('Đây là liên kết ngoài nên trình duyệt không thể tự đọc nội dung HTML.');
  }
  const url = new URL(normalized.link, window.location.origin);
  url.searchParams.set('_admin_read', String(Date.now()));
  const response = await fetch(url.toString(), { cache: 'no-store', signal: options.signal });
  if (!response.ok) throw new Error(`Không đọc được HTML (${response.status}).`);
  return parseArticleHtml(await response.text(), normalized);
}

export function parseArticleFile(file, fallbackPost = {}) {
  return file.text().then(html => parseArticleHtml(html, fallbackPost));
}

export function isInternalLink(link) {
  if (!link) return false;
  if (String(link).startsWith('/')) return true;
  try {
    const url = new URL(link, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function makeEmbeddedMeta(post) {
  const p = normalizePost(post);
  return {
    schemaVersion: POSTS_SCHEMA_VERSION,
    htmlVersion: POST_HTML_VERSION,
    id: p.id,
    type: p.type,
    title: p.title,
    summary: p.summary,
    imageUrl: p.imageUrl,
    link: p.link,
    category: p.category,
    tags: p.tags,
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt,
    status: p.status,
    featured: p.featured,
    isNew: p.isNew,
    showInLists: p.showInLists,
    searchable: p.searchable,
    showOnDesktop: p.showOnDesktop,
    showOnMobile: p.showOnMobile
  };
}

export function jsonForHtmlScript(value) {
  return JSON.stringify(value, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function htmlToText(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${String(html || '')}</div>`, 'text/html');
  return (doc.body?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 3000);
}

function stripLegacyFields(post) {
  const result = { ...post };
  delete result.date;
  delete result.createdAt;
  delete result.modifiedAt;
  delete result.contentHtml;
  delete result.searchText;
  delete result.new;
  delete result._comment;
  return result;
}

function toArray(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}

function textOf(node) {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function attrOf(node, name) {
  return node?.getAttribute(name)?.trim() || '';
}

function datetimeOf(node) {
  const value = node?.getAttribute('datetime') || node?.getAttribute('data-updated-at') || node?.getAttribute('data-published-at');
  return normalizeDateString(value);
}

function cleanDocumentTitle(value) {
  return String(value || '').replace(/\s*\|\s*Vinh ở Nhật\s*$/i, '').trim();
}

function normalizeDateString(value) {
  const text = String(value || '').trim();
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${String(iso[2]).padStart(2, '0')}-${String(iso[3]).padStart(2, '0')}`;
  return '';
}

function findVietnameseDate(text, markerRegex) {
  const marker = markerRegex.exec(text);
  if (!marker) return '';
  const area = text.slice(marker.index + marker[0].length, marker.index + marker[0].length + 90);
  const iso = area.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (iso) return `${iso[1]}-${String(iso[2]).padStart(2, '0')}-${String(iso[3]).padStart(2, '0')}`;
  const vietnamese = area.match(/(?:Ngày\s*)?(\d{1,2})\s*(?:tháng|\/|-)\s*(\d{1,2})\s*(?:năm|\/|-|,)?\s*(\d{4})/i);
  if (vietnamese) return `${vietnamese[3]}-${String(vietnamese[2]).padStart(2, '0')}-${String(vietnamese[1]).padStart(2, '0')}`;
  return '';
}
