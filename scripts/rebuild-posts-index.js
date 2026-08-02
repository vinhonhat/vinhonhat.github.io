#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const sourcePath = path.join(ROOT, 'data', 'posts.json');
const outputPath = path.join(ROOT, 'data', 'posts-index.json');
const searchOutputPath = path.join(ROOT, 'data', 'posts-search.json');

function fail(message) {
  console.error(`Lỗi: ${message}`);
  process.exitCode = 1;
}

function toArray(value) {
  if (Array.isArray(value)) return value.map(String).map(item => item.trim()).filter(Boolean);
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}

function normalize(raw = {}) {
  const publishedAt = raw.publishedAt || raw.date || raw.createdAt || '';
  const updatedAt = raw.updatedAt || raw.modifiedAt || null;
  return {
    ...raw,
    schemaVersion: 2,
    status: Number(raw.status) === 0 ? 0 : 1,
    category: toArray(raw.category || raw.categories),
    tags: toArray(raw.tags),
    publishedAt,
    updatedAt,
    date: updatedAt || publishedAt,
    featured: raw.featured === true,
    isNew: raw.isNew === true || raw.new === true,
    showInLists: raw.showInLists !== false,
    showOnDesktop: raw.showOnDesktop !== false,
    showOnMobile: raw.showOnMobile !== false,
    searchable: raw.searchable !== false,
    searchText: String(raw.searchText || '').replace(/\s+/g, ' ').trim().slice(0, 3000)
  };
}

function main() {
  if (!fs.existsSync(sourcePath)) return fail(`Không tìm thấy ${sourcePath}`);
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  } catch (error) {
    return fail(`posts.json không hợp lệ: ${error.message}`);
  }

  const rows = Array.isArray(payload) ? payload : payload?.posts;
  if (!Array.isArray(rows)) return fail('posts.json phải là mảng cũ hoặc object Beta 2 có trường posts.');

  const ids = new Set();
  const links = new Map();
  const errors = [];
  const warnings = [];

  const index = rows.map((raw, position) => {
    if (!raw || typeof raw !== 'object') {
      errors.push(`Mục số ${position + 1} không phải object.`);
      return null;
    }
    const post = normalize(raw);
    if (!post.id) errors.push(`Mục số ${position + 1} thiếu id.`);
    if (!post.title) errors.push(`${post.id || `Mục ${position + 1}`} thiếu title.`);
    if (!post.link) errors.push(`${post.id || `Mục ${position + 1}`} thiếu link.`);
    if (!post.publishedAt) errors.push(`${post.id || `Mục ${position + 1}`} thiếu publishedAt/date.`);
    if (post.id && ids.has(post.id)) errors.push(`Trùng id: ${post.id}`);
    if (post.link && links.has(post.link)) {
      const previous = links.get(post.link);
      const bothVisible = previous.status !== 0 && post.status !== 0;
      (bothVisible ? errors : warnings).push(`Trùng link${bothVisible ? '' : ' (có bản đang ẩn)'}: ${post.link}`);
    }
    if (Object.prototype.hasOwnProperty.call(raw, 'contentHtml')) {
      warnings.push(`${post.id}: còn contentHtml trong posts.json; nên chuyển sang data/legacy-content.json.`);
    }
    if (post.id) ids.add(post.id);
    if (post.link) links.set(post.link, post);

    return {
      id: post.id,
      type: post.type || 'post',
      status: post.status,
      category: post.category,
      tags: post.tags,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      date: post.date,
      featured: post.featured,
      isNew: post.isNew,
      showInLists: post.showInLists,
      showOnDesktop: post.showOnDesktop,
      showOnMobile: post.showOnMobile,
      searchable: post.searchable,
      title: post.title,
      summary: post.summary || '',
      imageUrl: post.imageUrl || '',
      link: post.link,
      contentSource: post.contentSource || (String(post.link).startsWith('/') ? 'html' : 'external'),
      contentVersion: Number(post.contentVersion || 0)
    };
  }).filter(Boolean);

  const searchIndex = rows.map(raw => {
    const post = normalize(raw);
    return {
      id: post.id, type: post.type || 'post', status: post.status,
      category: post.category, tags: post.tags,
      publishedAt: post.publishedAt, updatedAt: post.updatedAt, date: post.date,
      searchable: post.searchable, title: post.title, summary: post.summary || '',
      searchText: post.searchText, imageUrl: post.imageUrl || '', link: post.link
    };
  });

  if (warnings.length) {
    console.warn('Cảnh báo không chặn xuất file:');
    for (const warning of [...new Set(warnings)]) console.warn(`- ${warning}`);
  }
  if (errors.length) {
    console.error('Dữ liệu cần kiểm tra:');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(outputPath, JSON.stringify(index), 'utf8');
  fs.writeFileSync(searchOutputPath, JSON.stringify(searchIndex), 'utf8');
  console.log(`Đã tạo ${path.relative(ROOT, outputPath)} và ${path.relative(ROOT, searchOutputPath)} với ${index.length} bài.`);
  console.log(`posts.json: ${Math.round(fs.statSync(sourcePath).size / 1024)} KB; posts-index.json: ${Math.round(fs.statSync(outputPath).size / 1024)} KB; posts-search.json: ${Math.round(fs.statSync(searchOutputPath).size / 1024)} KB.`);
}

main();
