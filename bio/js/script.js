/* Bio Link Admin V7 - cờ Anh cho EN và sao chép icon bé một lần */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const deepClone = value => JSON.parse(JSON.stringify(value));

  const DEFAULT_LAYOUT = { mobileColumns: 1, tabletColumns: 2, desktopColumns: 2 };
  const DEFAULT_APPEARANCE = {
    primaryColor: "#f39b19",
    primaryStrongColor: "#d97800",
    lightTextColor: "#2c2118",
    lightMutedColor: "#77695c",
    darkTextColor: "#fff8ef",
    darkMutedColor: "#c7b8a7",
    nameFontSize: 32,
    bioFontSize: 15,
    linkTitleFontSize: 15,
    linkDescriptionFontSize: 12,
    footerFontSize: 12
  };

  const I18N = {
    vi: { code: "VI", flag: "assets/flag-vi.svg", language: "Đổi ngôn ngữ", themeLight: "Chuyển sang giao diện sáng", themeDark: "Chuyển sang giao diện tối", share: "Chia sẻ trang", connect: "Kết nối với tôi", qr: "Mã QR", qrTitle: "Chia sẻ trang Bio", qrDescription: "Quét mã QR hoặc sao chép đường dẫn để mở nhanh trang này.", copy: "Sao chép liên kết", copied: "Đã sao chép liên kết", shareError: "Không thể chia sẻ lúc này", qrAlt: "Mã QR dẫn đến trang Bio" },
    ja: { code: "JP", flag: "assets/flag-ja.svg", language: "言語を変更", themeLight: "ライトモードに切り替え", themeDark: "ダークモードに切り替え", share: "ページを共有", connect: "リンク一覧", qr: "QRコード", qrTitle: "Bioページを共有", qrDescription: "QRコードを読み取るか、リンクをコピーしてこのページを開けます。", copy: "リンクをコピー", copied: "リンクをコピーしました", shareError: "現在共有できません", qrAlt: "BioページのQRコード" },
    en: { code: "EN", flag: "assets/flag-en.svg", language: "Change language", themeLight: "Switch to light mode", themeDark: "Switch to dark mode", share: "Share page", connect: "Connect with me", qr: "QR code", qrTitle: "Share Bio page", qrDescription: "Scan the QR code or copy the link to open this page.", copy: "Copy link", copied: "Link copied", shareError: "Unable to share right now", qrAlt: "QR code for this Bio page" }
  };
  let currentLanguage = "vi";

  const clampColumns = value => Math.min(3, Math.max(1, Number(value) || 1));
  const clampNumber = (value, min, max, fallback) => Math.min(max, Math.max(min, Number(value) || fallback));

  const normalizeConfig = input => {
    const cfg = deepClone(input || {});
    cfg.profile ||= {};
    cfg.profile.favicon ||= "assets/favicon.png";
    cfg.profile.badges = Array.isArray(cfg.profile.badges) ? cfg.profile.badges : [];
    while (cfg.profile.badges.length < 2) cfg.profile.badges.push({ enabled: true, icon: "sparkles", text: "" });
    cfg.profile.translations ||= {};
    cfg.profile.badges.forEach(item => {
      if (typeof item.enabled !== "boolean") item.enabled = true;
      item.translations ||= {};
    });
    cfg.admin ||= {};
    cfg.settings ||= {};
    cfg.settings.defaultTheme = ["auto", "light", "dark"].includes(cfg.settings.defaultTheme) ? cfg.settings.defaultTheme : "auto";
    cfg.settings.defaultLanguage = ["vi", "ja", "en"].includes(cfg.settings.defaultLanguage) ? cfg.settings.defaultLanguage : "vi";
    if (typeof cfg.settings.showLanguageButton !== "boolean") cfg.settings.showLanguageButton = true;
    cfg.settings.announcement ||= { enabled: false, icon: "bell", text: "" };
    cfg.settings.layout = { ...DEFAULT_LAYOUT, ...(cfg.settings.layout || {}) };
    cfg.settings.appearance = { ...DEFAULT_APPEARANCE, ...(cfg.settings.appearance || {}) };
    cfg.settings.layout.mobileColumns = clampColumns(cfg.settings.layout.mobileColumns);
    cfg.settings.layout.tabletColumns = clampColumns(cfg.settings.layout.tabletColumns);
    cfg.settings.layout.desktopColumns = clampColumns(cfg.settings.layout.desktopColumns);
    cfg.links = Array.isArray(cfg.links) ? cfg.links : [];
    cfg.socialIcons = Array.isArray(cfg.socialIcons) ? cfg.socialIcons : [];
    const usedLinkIds = new Set();
    cfg.links.forEach((item, index) => {
      let candidate = String(item.id || `link-${index + 1}`).trim() || `link-${index + 1}`;
      while (usedLinkIds.has(candidate)) candidate = `${candidate}-${index + 1}`;
      item.id = candidate;
      usedLinkIds.add(candidate);
      item.translations ||= {};
      if (typeof item.showIconBackground !== "boolean") item.showIconBackground = !item.image;
    });
    cfg.socialIcons.forEach((item, index) => {
      item.id ||= `social-${index + 1}`;
      item.translations ||= {};
      item.sourceLinkId ||= "";
      const legacySource = item.syncFromLink ? cfg.links.find(link => link.id === item.sourceLinkId) : null;
      if (legacySource) {
        item.label = legacySource.title || item.label || "Liên kết";
        item.url = legacySource.url || item.url || "#";
        item.icon = legacySource.icon || item.icon || "globe";
        item.image = legacySource.image || "";
        item.showIconBackground = typeof legacySource.showIconBackground === "boolean" ? legacySource.showIconBackground : !legacySource.image;
        ["ja", "en"].forEach(language => {
          item.translations[language] ||= {};
          item.translations[language].label = legacySource.translations?.[language]?.title || legacySource.title || item.label;
        });
      }
      // V7 chỉ sao chép một lần; không khóa trường và không phụ thuộc liên tục vào icon lớn.
      item.syncFromLink = false;
      if (typeof item.showIconBackground !== "boolean") item.showIconBackground = !item.image;
    });
    return cfg;
  };

  const sourceConfig = normalizeConfig(window.BIO_CONFIG || {});
  const storageKey = sourceConfig.admin?.storageKey || "vinh-bio-admin-config-v7";

  const ICONS = {
    "arrow-up-right": '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    "book-open": '<path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H9a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4.5A2.5 2.5 0 0 0 2 20.5z"/><path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H15a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h4.5a2.5 2.5 0 0 1 2.5 2.5z"/>',
    "bell": '<path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/><path d="M3.3 17h17.4c-1.6-1.8-2.4-3.8-2.4-6.2A6.3 6.3 0 0 0 12 4.5a6.3 6.3 0 0 0-6.3 6.3c0 2.4-.8 4.4-2.4 6.2Z"/><path d="M10 4.5a2 2 0 0 1 4 0"/>',
    "check": '<path d="m5 12 4 4L19 6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "chevron-up": '<path d="m18 15-6-6-6 6"/>',
    "copy": '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    "eye": '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a17.4 17.4 0 0 1-2.1 3.2"/><path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 4.1-.9"/>',
    "facebook": '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.5l.5-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    "file-down": '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    "image": '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    "lock": '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    "map": '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>',
    "map-pin": '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    "message-circle": '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
    "message-circle-more": '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/>',
    "message-square": '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
    "music-2": '<circle cx="8" cy="18" r="3"/><path d="M11 18V2l10 3"/><circle cx="18" cy="16" r="3"/><path d="M21 16V5"/>',
    "moon": '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"/>',
    "plus": '<path d="M5 12h14"/><path d="M12 5v14"/>',
    "qr-code": '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    "save": '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    "settings": '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/>',
    "share-2": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    "sparkles": '<path d="m12 3-1.7 3.8L6.5 8.5l3.8 1.7L12 14l1.7-3.8 3.8-1.7-3.8-1.7Z"/><path d="m5 15-.9 2.1L2 18l2.1.9L5 21l.9-2.1L8 18l-2.1-.9Z"/><path d="m19 14-.7 1.3L17 16l1.3.7L19 18l.7-1.3L21 16l-1.3-.7Z"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.42 1.42"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    "trash-2": '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/>',
    "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "youtube": '<path d="M2.5 17a24.1 24.1 0 0 1 0-10 2.1 2.1 0 0 1 1.5-1.5 49.5 49.5 0 0 1 16 0A2.1 2.1 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10 2.1 2.1 0 0 1-1.5 1.5 49.5 49.5 0 0 1-16 0A2.1 2.1 0 0 1 2.5 17Z"/><path d="m10 15 5-3-5-3z"/>'
  };

  const icon = (name, size = 21) => {
    const content = ICONS[name] || ICONS.globe;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
  };

  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  })[char]);
  const escapeAttribute = escapeHtml;

  const localizedValue = (item, field, fallback = "") => {
    const translated = item?.translations?.[currentLanguage]?.[field];
    if (currentLanguage !== "vi" && typeof translated === "string" && translated.trim()) return translated;
    const original = item?.[field];
    return typeof original === "string" && original.trim() ? original : fallback;
  };

  const findSourceLink = (sourceLinkId, list = config.links || []) => list.find(link => link.id === sourceLinkId) || null;

  const copySocialFromLink = (target, source) => {
    if (!target || !source) return false;
    target.sourceLinkId = source.id || "";
    target.label = source.title || target.label || "Liên kết";
    target.url = source.url || target.url || "#";
    target.icon = source.icon || target.icon || "globe";
    target.image = source.image || "";
    target.showIconBackground = typeof source.showIconBackground === "boolean" ? source.showIconBackground : !source.image;
    target.translations ||= {};
    ["ja", "en"].forEach(language => {
      target.translations[language] ||= {};
      target.translations[language].label = source.translations?.[language]?.title || source.title || target.label;
    });
    target.syncFromLink = false;
    return true;
  };

  const resolveSocialItem = item => ({ ...item, label: localizedValue(item, "label", "Liên kết") });

  const safeStorageGet = key => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const safeStorageSet = (key, value) => {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  };
  const safeStorageRemove = key => {
    try { localStorage.removeItem(key); return true; } catch { return false; }
  };

  const loadConfig = () => {
    try {
      const saved = safeStorageGet(storageKey);
      return saved ? normalizeConfig(JSON.parse(saved)) : normalizeConfig(sourceConfig);
    } catch {
      return normalizeConfig(sourceConfig);
    }
  };

  let config = loadConfig();
  let editorDraft = null;

  const media = (item, className, fallbackIcon = "globe") => {
    const fallback = icon(item?.icon || fallbackIcon);
    if (!item?.image) return fallback;
    return `<span class="media-stack"><span class="media-fallback">${fallback}</span><img class="${className}" src="${escapeAttribute(item.image)}" alt="" loading="lazy" data-media-image /></span>`;
  };

  const bindMediaImages = root => {
    $$('img[data-media-image]', root).forEach(img => {
      const stack = img.closest('.media-stack');
      const markLoaded = () => stack?.classList.add('loaded');
      const markFailed = () => stack?.classList.remove('loaded');
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markFailed, { once: true });
      if (img.complete && img.naturalWidth > 0) markLoaded();
    });
  };

  const showToast = message => {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  const applyProfile = () => {
    const profile = config.profile || {};
    const name = localizedValue(profile, "name", "Bio Link");
    const bio = localizedValue(profile, "bio", "");
    const footer = localizedValue(profile, "footerText", name);
    $("#profileName").textContent = name;
    $("#profileHandle").textContent = profile.handle || "";
    $("#profileBio").textContent = bio;
    $("#footerText").textContent = footer;
    if (profile.avatar) $("#profileAvatar").src = profile.avatar;
    document.title = `${name} | Bio Link`;

    const favicon = profile.favicon || profile.avatar || "assets/favicon.png";
    const faviconLink = $("#faviconLink");
    const appleIcon = $("#appleTouchIcon");
    if (faviconLink) faviconLink.href = favicon;
    if (appleIcon) appleIcon.href = favicon;

    const badges = Array.isArray(profile.badges)
      ? profile.badges.filter(item => item.enabled !== false && localizedValue(item, "text", ""))
      : [];
    $("#profileBadges").innerHTML = badges.map(item => `
      <span class="badge">${icon(item.icon, 15)}<span>${escapeHtml(localizedValue(item, "text", ""))}</span></span>
    `).join("");
  };

  const applyAppearanceAndLayout = () => {
    const appearance = config.settings?.appearance || DEFAULT_APPEARANCE;
    const layout = config.settings?.layout || DEFAULT_LAYOUT;
    const root = document.documentElement;
    root.style.setProperty("--custom-primary", appearance.primaryColor || DEFAULT_APPEARANCE.primaryColor);
    root.style.setProperty("--custom-primary-strong", appearance.primaryStrongColor || DEFAULT_APPEARANCE.primaryStrongColor);
    root.style.setProperty("--custom-light-text", appearance.lightTextColor || DEFAULT_APPEARANCE.lightTextColor);
    root.style.setProperty("--custom-light-muted", appearance.lightMutedColor || DEFAULT_APPEARANCE.lightMutedColor);
    root.style.setProperty("--custom-dark-text", appearance.darkTextColor || DEFAULT_APPEARANCE.darkTextColor);
    root.style.setProperty("--custom-dark-muted", appearance.darkMutedColor || DEFAULT_APPEARANCE.darkMutedColor);
    root.style.setProperty("--name-font-size", `${clampNumber(appearance.nameFontSize, 18, 52, 32)}px`);
    root.style.setProperty("--bio-font-size", `${clampNumber(appearance.bioFontSize, 11, 24, 15)}px`);
    root.style.setProperty("--link-title-font-size", `${clampNumber(appearance.linkTitleFontSize, 11, 24, 15)}px`);
    root.style.setProperty("--link-description-font-size", `${clampNumber(appearance.linkDescriptionFontSize, 9, 20, 12)}px`);
    root.style.setProperty("--footer-font-size", `${clampNumber(appearance.footerFontSize, 9, 18, 12)}px`);

    const mobile = clampColumns(layout.mobileColumns);
    const tablet = clampColumns(layout.tabletColumns);
    const desktop = clampColumns(layout.desktopColumns);
    root.style.setProperty("--mobile-columns", mobile);
    root.style.setProperty("--tablet-columns", tablet);
    root.style.setProperty("--desktop-columns", desktop);
    root.dataset.mobileColumns = mobile;
    root.dataset.tabletColumns = tablet;
    root.dataset.desktopColumns = desktop;
    const maxWidth = desktop === 1 ? 610 : desktop === 2 ? 930 : 1220;
    root.style.setProperty("--card-max-width", `${maxWidth}px`);
  };

  const renderLinks = () => {
    const links = (config.links || []).filter(item => item.enabled);
    const target = config.settings?.openLinksInNewTab ? 'target="_blank" rel="noopener noreferrer"' : "";
    const container = $("#linksContainer");
    container.innerHTML = links.map(item => {
      const title = localizedValue(item, "title", "Liên kết");
      const description = localizedValue(item, "description", "");
      const badge = localizedValue(item, "badge", "");
      const hasImage = !!item.image;
      const showBackground = typeof item.showIconBackground === "boolean" ? item.showIconBackground : !hasImage;
      return `
      <a class="link-card${item.featured ? " featured" : ""}" href="${escapeAttribute(item.url || "#")}" ${target}>
        <span class="link-icon${hasImage ? " has-image" : ""}${showBackground ? " with-bg" : " no-bg"}">${media(item, "link-image")}</span>
        <span class="link-copy">
          <span class="link-title">${escapeHtml(title)}${badge ? `<span class="tag-new">${escapeHtml(badge)}</span>` : ""}</span>
          ${description ? `<span class="link-description">${escapeHtml(description)}</span>` : ""}
        </span>
        <span class="link-arrow">${icon("arrow-up-right", 19)}</span>
      </a>`;
    }).join("");
    bindMediaImages(container);
  };

  const renderSocials = () => {
    const socials = (config.socialIcons || []).filter(item => item.enabled).map(item => resolveSocialItem(item));
    const section = $("#socialSection");
    section.classList.toggle("hidden", !socials.length);
    if (!socials.length) {
      $("#socialContainer").innerHTML = "";
      return;
    }
    const target = config.settings?.openLinksInNewTab ? 'target="_blank" rel="noopener noreferrer"' : "";
    const container = $("#socialContainer");
    container.innerHTML = socials.map(item => {
      const hasImage = !!item.image;
      const showBackground = typeof item.showIconBackground === "boolean" ? item.showIconBackground : !hasImage;
      return `<a class="social-button${hasImage ? " has-image" : ""}${showBackground ? " with-bg" : " no-bg"}" href="${escapeAttribute(item.url || "#")}" aria-label="${escapeAttribute(item.label)}" title="${escapeAttribute(item.label)}" ${target}>${media(item, "social-image")}</a>`;
    }).join("");
    bindMediaImages(container);
  };

  const renderAnnouncement = () => {
    const item = config.settings?.announcement;
    const text = localizedValue(item, "text", "");
    const el = $("#announcement");
    el.classList.toggle("hidden", !item?.enabled || !text);
    el.innerHTML = item?.enabled && text ? `${icon(item.icon || "bell", 18)}<span>${escapeHtml(text)}</span>` : "";
  };

  const renderAll = () => {
    applyAppearanceAndLayout();
    applyProfile();
    renderAnnouncement();
    renderLinks();
    renderSocials();
    applyActionVisibility();
    applyLanguage();
  };

  const resolveInitialTheme = () => {
    const saved = safeStorageGet("bio-theme");
    if (saved === "dark" || saved === "light") return saved;
    const configured = config.settings?.defaultTheme || "auto";
    if (configured === "dark" || configured === "light") return configured;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const resolveInitialLanguage = () => {
    const saved = safeStorageGet("bio-language");
    if (["vi", "ja", "en"].includes(saved)) return saved;
    return config.settings?.defaultLanguage || "vi";
  };

  const applyLanguage = () => {
    const text = I18N[currentLanguage] || I18N.vi;
    document.documentElement.lang = currentLanguage;
    const flag = $("#languageFlag");
    const flagPath = config.settings?.languageFlags?.[currentLanguage] || text.flag;
    if (flag) {
      flag.src = flagPath;
      flag.alt = text.code;
    }
    const languageButton = $("#languageButton");
    if (languageButton) { languageButton.title = text.language; languageButton.setAttribute("aria-label", text.language); }
    const themeButton = $("#themeButton");
    if (themeButton) {
      const isDark = document.documentElement.dataset.theme === "dark";
      themeButton.title = isDark ? text.themeLight : text.themeDark;
      themeButton.setAttribute("aria-label", themeButton.title);
    }
    const shareButton = $("#shareButton");
    if (shareButton) { shareButton.title = text.share; shareButton.setAttribute("aria-label", text.share); }
    const socialLabel = $("#socialSectionLabel");
    if (socialLabel) socialLabel.textContent = text.connect;
    const qrButton = $("#qrButton");
    if (qrButton) qrButton.innerHTML = `${icon("qr-code", 16)}<span>${text.qr}</span>`;
    const copyButton = $("#copyLinkButton");
    if (copyButton) copyButton.innerHTML = `${icon("copy", 18)}<span>${text.copy}</span>`;
    const qrTitle = $("#qrTitle");
    if (qrTitle) qrTitle.textContent = text.qrTitle;
    const qrDescription = $("#qrDescription");
    if (qrDescription) qrDescription.textContent = text.qrDescription;
    $$('[data-language]').forEach(button => button.classList.toggle("active", button.dataset.language === currentLanguage));
  };

  const setLanguage = language => {
    currentLanguage = ["vi", "ja", "en"].includes(language) ? language : "vi";
    safeStorageSet("bio-language", currentLanguage);
    $("#languageMenu")?.classList.add("hidden");
    renderAll();
  };

  const setTheme = theme => {
    document.documentElement.dataset.theme = theme;
    safeStorageSet("bio-theme", theme);
    $("#themeButton").innerHTML = icon(theme === "dark" ? "sun" : "moon");
    applyLanguage();
  };

  const applyActionVisibility = () => {
    const settings = config.settings || {};
    $("#themeButton").classList.toggle("hidden", !settings.showThemeButton);
    $("#shareButton").classList.toggle("hidden", !settings.showShareButton);
    $("#qrButton").classList.toggle("hidden", !settings.showQrButton);
    $("#languageButton").classList.toggle("hidden", !settings.showLanguageButton);
    if (!settings.showLanguageButton) $("#languageMenu")?.classList.add("hidden");
  };

  const sharePage = async () => {
    const data = { title: document.title, text: config.profile?.bio || "Xem các liên kết của tôi", url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await copyPageUrl();
    } catch (error) {
      if (error?.name !== "AbortError") showToast((I18N[currentLanguage] || I18N.vi).shareError);
    }
  };

  const copyPageUrl = async () => {
    const value = config.settings?.qrUrl || location.href;
    try {
      await navigator.clipboard.writeText(value);
      showToast((I18N[currentLanguage] || I18N.vi).copied);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast((I18N[currentLanguage] || I18N.vi).copied);
    }
  };

  const openQrModal = () => {
    const modal = $("#qrModal");
    const url = encodeURIComponent(config.settings?.qrUrl || location.href);
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=8&data=${url}`;
    const text = I18N[currentLanguage] || I18N.vi;
    $("#qrCanvas").innerHTML = `<img src="${qrImage}" alt="${escapeAttribute(text.qrAlt)}" />`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeQrModal = () => {
    const modal = $("#qrModal");
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const setupActions = () => {
    $("#shareButton").innerHTML = icon("share-2");
    $(".modal-close").innerHTML = icon("x");
    $(".modal-icon").innerHTML = icon("qr-code", 28);

    $("#themeButton").addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
    $("#languageButton").addEventListener("click", event => {
      event.stopPropagation();
      $("#languageMenu").classList.toggle("hidden");
    });
    $("#languageMenu").addEventListener("click", event => {
      const button = event.target.closest("[data-language]");
      if (button) setLanguage(button.dataset.language);
    });
    document.addEventListener("click", event => {
      if (!event.target.closest(".language-control")) $("#languageMenu")?.classList.add("hidden");
    });
    $("#shareButton").addEventListener("click", sharePage);
    $("#qrButton").addEventListener("click", openQrModal);
    $("#copyLinkButton").addEventListener("click", copyPageUrl);
    $$('[data-close-modal]').forEach(el => el.addEventListener("click", closeQrModal));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeQrModal();
        closeAdmin();
      }
    });
  };

  const sha256 = async value => {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  };

  const adminMarkup = () => `
    <div id="adminOverlay" class="admin-overlay" aria-hidden="true">
      <div class="admin-backdrop" data-admin-close></div>
      <section id="adminLogin" class="admin-login-card" role="dialog" aria-modal="true" aria-labelledby="adminLoginTitle">
        <button class="admin-close" type="button" data-admin-close aria-label="Đóng">${icon("x")}</button>
        <div class="admin-lock">${icon("lock", 28)}</div>
        <h2 id="adminLoginTitle">Mở cài đặt Bio Link</h2>
        <p>Nhập mật khẩu quản trị để chỉnh sửa nội dung.</p>
        <form id="adminLoginForm">
          <label class="admin-field"><span>Mật khẩu</span><div class="password-wrap"><input id="adminPassword" type="password" autocomplete="current-password" required /><button class="password-toggle" type="button" data-password-toggle="adminPassword" aria-label="Hiện mật khẩu" title="Hiện mật khẩu">${icon("eye", 18)}</button></div></label>
          <p id="adminLoginError" class="admin-error hidden">Mật khẩu không đúng.</p>
          <button class="admin-primary wide" type="submit">${icon("lock", 18)} Mở cài đặt</button>
        </form>
      </section>

      <section id="adminEditor" class="admin-editor hidden" role="dialog" aria-modal="true" aria-labelledby="adminTitle">
        <header class="admin-header">
          <div><span class="admin-kicker">BIO LINK</span><h2 id="adminTitle">Cài đặt trang</h2></div>
          <button class="admin-close" type="button" data-admin-close aria-label="Đóng">${icon("x")}</button>
        </header>
        <nav class="admin-tabs" aria-label="Nhóm cài đặt">
          <button class="admin-tab active" type="button" data-admin-tab="config">${icon("settings", 17)}<span>Cấu hình</span></button>
          <button class="admin-tab" type="button" data-admin-tab="links">${icon("globe", 17)}<span>Icon liên kết</span></button>
          <button class="admin-tab" type="button" data-admin-tab="socials">${icon("sparkles", 17)}<span>Icon bé dưới cùng</span></button>
        </nav>
        <div class="admin-body">
          <div class="admin-panel" data-admin-panel="config">
            <section class="admin-section">
              <h3>Thông tin chính</h3>
              <div class="admin-grid two">
                <label class="admin-field"><span>Tên hiển thị</span><input id="editName" type="text" /></label>
                <label class="admin-field"><span>Tên tài khoản</span><input id="editHandle" type="text" /></label>
              </div>
              <label class="admin-field"><span>Mô tả</span><textarea id="editBio" rows="3"></textarea></label>
              <div class="admin-grid two">
                <label class="admin-field"><span>Logo / ảnh đại diện</span><input id="editAvatar" type="text" placeholder="assets/logo.png hoặc URL ảnh" /></label>
                <label class="admin-field"><span>Icon trên tab web</span><input id="editFavicon" type="text" placeholder="assets/favicon.png" /></label>
              </div>
              <label class="admin-field"><span>Chữ cuối trang</span><input id="editFooter" type="text" /></label>
              <div class="admin-upload-row">
                <label class="admin-upload">${icon("image", 18)} Chọn ảnh logo<input id="avatarUpload" type="file" accept="image/png,image/webp,image/jpeg,image/svg+xml" /></label>
                <label class="admin-upload">${icon("image", 18)} Chọn icon tab<input id="faviconUpload" type="file" accept="image/png,image/webp,image/x-icon,image/svg+xml" /></label>
              </div>
              <p class="admin-help">Ảnh PNG/WEBP trong suốt sẽ giữ nền trong suốt. Nên chép ảnh vào thư mục <b>assets</b> rồi nhập đường dẫn để file nhẹ.</p>
              <details class="admin-translation-box">
                <summary>${icon("globe", 16)} Nội dung tiếng Nhật và tiếng Anh</summary>
                <div class="admin-translation-content">
                  <p class="admin-language-title"><img src="assets/flag-ja.svg" alt="JP" /> JP — 日本語</p>
                  <div class="admin-grid two">
                    <label class="admin-field"><span>Tên hiển thị JP</span><input id="editNameJa" type="text" /></label>
                    <label class="admin-field"><span>Chữ cuối trang JP</span><input id="editFooterJa" type="text" /></label>
                  </div>
                  <label class="admin-field"><span>Mô tả JP</span><textarea id="editBioJa" rows="2"></textarea></label>
                  <p class="admin-language-title"><img src="assets/flag-en.svg" alt="EN" /> EN — English</p>
                  <div class="admin-grid two">
                    <label class="admin-field"><span>Tên hiển thị EN</span><input id="editNameEn" type="text" /></label>
                    <label class="admin-field"><span>Chữ cuối trang EN</span><input id="editFooterEn" type="text" /></label>
                  </div>
                  <label class="admin-field"><span>Mô tả EN</span><textarea id="editBioEn" rows="2"></textarea></label>
                </div>
              </details>
            </section>

            <section class="admin-section">
              <h3>Địa chỉ và nhãn giới thiệu</h3>
              <div class="admin-badge-editor">
                <div class="admin-badge-row">
                  <label class="admin-switch"><input id="editLocationBadgeEnabled" type="checkbox" /><span></span><b>Hiện địa chỉ</b></label>
                  <label class="admin-field"><span>Nội dung địa chỉ</span><input id="editLocationBadgeText" type="text" placeholder="Tokyo, Nhật Bản" /></label>
                  <label class="admin-field"><span>Icon</span><input id="editLocationBadgeIcon" type="text" placeholder="map-pin" /></label>
                  <label class="admin-field"><span>Địa chỉ JP</span><input id="editLocationBadgeTextJa" type="text" placeholder="東京、日本" /></label>
                  <label class="admin-field"><span>Địa chỉ EN</span><input id="editLocationBadgeTextEn" type="text" placeholder="Tokyo, Japan" /></label>
                </div>
                <div class="admin-badge-row">
                  <label class="admin-switch"><input id="editUsefulBadgeEnabled" type="checkbox" /><span></span><b>Hiện “Chia sẻ hữu ích”</b></label>
                  <label class="admin-field"><span>Nội dung nhãn</span><input id="editUsefulBadgeText" type="text" placeholder="Chia sẻ hữu ích" /></label>
                  <label class="admin-field"><span>Icon</span><input id="editUsefulBadgeIcon" type="text" placeholder="sparkles" /></label>
                  <label class="admin-field"><span>Nhãn JP</span><input id="editUsefulBadgeTextJa" type="text" placeholder="役立つ情報" /></label>
                  <label class="admin-field"><span>Nhãn EN</span><input id="editUsefulBadgeTextEn" type="text" placeholder="Useful sharing" /></label>
                </div>
              </div>
            </section>

            <section class="admin-section">
              <h3>Giao diện, ngôn ngữ và nút</h3>
              <div class="admin-grid two">
                <label class="admin-field"><span>Giao diện mặc định</span><select id="editDefaultTheme"><option value="auto">Theo hệ thống</option><option value="light">Luôn sáng</option><option value="dark">Luôn tối</option></select></label>
                <label class="admin-field"><span>Ngôn ngữ mặc định</span><select id="editDefaultLanguage"><option value="vi">VI — Tiếng Việt</option><option value="ja">JP — 日本語</option><option value="en">EN — English</option></select></label>
              </div>
              <div class="admin-checks">
                <label><input id="editThemeButton" type="checkbox" /> Hiện nút sáng/tối</label>
                <label><input id="editLanguageButton" type="checkbox" /> Hiện nút ngôn ngữ</label>
                <label><input id="editShareButton" type="checkbox" /> Hiện nút chia sẻ</label>
                <label><input id="editQrButton" type="checkbox" /> Hiện nút mã QR</label>
                <label><input id="editNewTab" type="checkbox" /> Mở liên kết ở tab mới</label>
                <label><input id="editAnnouncementEnabled" type="checkbox" /> Hiện thông báo</label>
              </div>
              <label class="admin-field"><span>Nội dung thông báo VI</span><input id="editAnnouncementText" type="text" /></label>
              <div class="admin-grid two">
                <label class="admin-field"><span>Thông báo JP</span><input id="editAnnouncementTextJa" type="text" /></label>
                <label class="admin-field"><span>Thông báo EN</span><input id="editAnnouncementTextEn" type="text" /></label>
              </div>
            </section>

            <section class="admin-section">
              <h3>Bố cục theo màn hình</h3>
              <div class="admin-grid three">
                <label class="admin-field"><span>Điện thoại</span><select id="editMobileColumns"><option value="1">1 cột</option><option value="2">2 cột</option><option value="3">3 cột</option></select></label>
                <label class="admin-field"><span>Máy tính bảng</span><select id="editTabletColumns"><option value="1">1 cột</option><option value="2">2 cột</option><option value="3">3 cột</option></select></label>
                <label class="admin-field"><span>Máy tính</span><select id="editDesktopColumns"><option value="1">1 cột</option><option value="2">2 cột</option><option value="3">3 cột</option></select></label>
              </div>
            </section>

            <section class="admin-section">
              <h3>Màu sắc và cỡ chữ</h3>
              <div class="admin-grid three color-grid">
                <label class="admin-field"><span>Màu chủ đạo</span><input id="editPrimaryColor" type="color" /></label>
                <label class="admin-field"><span>Màu chữ sáng</span><input id="editLightTextColor" type="color" /></label>
                <label class="admin-field"><span>Màu chữ phụ sáng</span><input id="editLightMutedColor" type="color" /></label>
                <label class="admin-field"><span>Màu chữ tối</span><input id="editDarkTextColor" type="color" /></label>
                <label class="admin-field"><span>Màu chữ phụ tối</span><input id="editDarkMutedColor" type="color" /></label>
                <label class="admin-field"><span>Màu chủ đạo đậm</span><input id="editPrimaryStrongColor" type="color" /></label>
              </div>
              <div class="admin-grid three">
                <label class="admin-field"><span>Cỡ tên (px)</span><input id="editNameFontSize" type="number" min="18" max="52" /></label>
                <label class="admin-field"><span>Cỡ giới thiệu (px)</span><input id="editBioFontSize" type="number" min="11" max="24" /></label>
                <label class="admin-field"><span>Cỡ tên nút (px)</span><input id="editLinkTitleFontSize" type="number" min="11" max="24" /></label>
                <label class="admin-field"><span>Cỡ mô tả nút (px)</span><input id="editLinkDescriptionFontSize" type="number" min="9" max="20" /></label>
                <label class="admin-field"><span>Cỡ chữ cuối trang (px)</span><input id="editFooterFontSize" type="number" min="9" max="18" /></label>
              </div>
            </section>

            <section class="admin-section">
              <h3>Đổi mật khẩu</h3>
              <div class="admin-grid two">
                <label class="admin-field"><span>Mật khẩu mới</span><div class="password-wrap"><input id="editNewPassword" type="password" autocomplete="new-password" /><button class="password-toggle" type="button" data-password-toggle="editNewPassword" aria-label="Hiện mật khẩu" title="Hiện mật khẩu">${icon("eye", 18)}</button></div></label>
                <label class="admin-field"><span>Nhập lại mật khẩu</span><div class="password-wrap"><input id="editConfirmPassword" type="password" autocomplete="new-password" /><button class="password-toggle" type="button" data-password-toggle="editConfirmPassword" aria-label="Hiện mật khẩu" title="Hiện mật khẩu">${icon("eye", 18)}</button></div></label>
              </div>
              <p class="admin-help">Để trống nếu không muốn đổi. GitHub Pages là web tĩnh nên mật khẩu này chỉ giúp ẩn bảng chỉnh sửa với người dùng thông thường.</p>
            </section>
          </div>

          <div class="admin-panel hidden" data-admin-panel="links">
            <section class="admin-section">
              <div class="admin-section-title"><div><h3>Icon liên kết lớn</h3><p>Sắp xếp bằng nút lên/xuống; bật hoặc ẩn từng mục. “Làm nổi bật” mới tạo nền vàng.</p></div><button id="addLinkButton" class="admin-secondary" type="button">${icon("plus", 17)} Thêm nút</button></div>
              <div id="adminLinks" class="admin-items"></div>
            </section>
          </div>

          <div class="admin-panel hidden" data-admin-panel="socials">
            <section class="admin-section">
              <div class="admin-section-title"><div><h3>Icon bé dưới cùng</h3><p>Chọn icon lớn và sao chép một lần; sau đó vẫn chỉnh sửa từng ô bình thường.</p></div><button id="addSocialButton" class="admin-secondary" type="button">${icon("plus", 17)} Thêm icon</button></div>
              <div id="adminSocials" class="admin-items"></div>
            </section>
          </div>
        </div>
        <footer class="admin-footer">
          <button id="resetConfigButton" class="admin-danger" type="button">${icon("rotate-ccw", 17)} Về cấu hình file</button>
          <div class="admin-footer-right">
            <button id="exportConfigButton" class="admin-secondary" type="button">${icon("file-down", 17)} Tải config.js</button>
            <button id="saveConfigButton" class="admin-primary" type="button">${icon("save", 17)} Lưu & xem trước</button>
          </div>
        </footer>
      </section>
    </div>`;

  const setupAdmin = () => {
    if (sourceConfig.admin?.enabled === false) return;
    document.body.insertAdjacentHTML("beforeend", adminMarkup());
    $$("[data-admin-tab]").forEach(button => button.addEventListener("click", () => switchAdminTab(button.dataset.adminTab)));

    let taps = 0;
    let tapTimer = null;
    $(".avatar-wrap").classList.add("admin-trigger");
    $(".avatar-wrap").addEventListener("click", () => {
      taps += 1;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { taps = 0; }, config.admin?.tapTimeout || 2500);
      if (taps >= (config.admin?.logoTapCount || 5)) {
        taps = 0;
        openAdminLogin();
      }
    });

    $$('[data-admin-close]').forEach(el => el.addEventListener("click", closeAdmin));
    $("#adminLoginForm").addEventListener("submit", handleAdminLogin);
    $("#saveConfigButton").addEventListener("click", saveEditorConfig);
    $("#exportConfigButton").addEventListener("click", exportEditorConfig);
    $("#resetConfigButton").addEventListener("click", resetToSourceConfig);
    $("#addLinkButton").addEventListener("click", () => {
      collectEditorFields();
      editorDraft.links.push({ id: `link-${Date.now()}`, enabled: true, featured: false, icon: "globe", image: "", showIconBackground: true, title: "Liên kết mới", description: "", url: "https://", badge: "", translations: {} });
      renderEditorItems("links");
    });
    $("#addSocialButton").addEventListener("click", () => {
      collectEditorFields();
      editorDraft.socialIcons.push({ id: `social-${Date.now()}`, enabled: true, syncFromLink: false, sourceLinkId: "", icon: "globe", image: "", showIconBackground: true, label: "Website", url: "https://", translations: {} });
      renderEditorItems("socials");
    });
    $("#adminLinks").addEventListener("click", handleItemAction);
    $("#adminSocials").addEventListener("click", handleItemAction);
    $("#adminLinks").addEventListener("change", handleImageUpload);
    $("#adminSocials").addEventListener("change", handleImageUpload);
    $("#adminLinks").addEventListener("input", handleEditorItemInput);
    $("#adminSocials").addEventListener("input", handleEditorItemInput);
    $("#adminSocials").addEventListener("change", handleSocialSourceChange);
    $("#avatarUpload").addEventListener("change", handleAvatarUpload);
    $("#faviconUpload").addEventListener("change", handleFaviconUpload);
    $("#adminOverlay").addEventListener("click", handlePasswordToggle);
    $("#adminPassword").addEventListener("input", () => $("#adminLoginError").classList.add("hidden"));
  };

  const switchAdminTab = tab => {
    const selected = ["config", "links", "socials"].includes(tab) ? tab : "config";
    $$("[data-admin-tab]").forEach(button => button.classList.toggle("active", button.dataset.adminTab === selected));
    $$("[data-admin-panel]").forEach(panel => panel.classList.toggle("hidden", panel.dataset.adminPanel !== selected));
    $(".admin-body")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAdminLogin = () => {
    const overlay = $("#adminOverlay");
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    $("#adminLogin").classList.remove("hidden");
    $("#adminEditor").classList.add("hidden");
    $("#adminLoginError").classList.add("hidden");
    $("#adminPassword").value = "";
    resetPasswordVisibility("adminPassword");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#adminPassword").focus(), 50);
  };

  const closeAdmin = () => {
    const overlay = $("#adminOverlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const handleAdminLogin = async event => {
    event.preventDefault();
    const enteredHash = await sha256($("#adminPassword").value);
    const expectedHash = config.admin?.passwordHash || sourceConfig.admin?.passwordHash;
    if (enteredHash !== expectedHash) {
      $("#adminLoginError").classList.remove("hidden");
      return;
    }
    editorDraft = normalizeConfig(config);
    editorDraft.admin = { ...(sourceConfig.admin || {}), ...(editorDraft.admin || {}) };
    populateEditor();
    switchAdminTab("config");
    $("#adminLogin").classList.add("hidden");
    $("#adminEditor").classList.remove("hidden");
  };

  const populateEditor = () => {
    $("#editName").value = editorDraft.profile.name || "";
    $("#editHandle").value = editorDraft.profile.handle || "";
    $("#editBio").value = editorDraft.profile.bio || "";
    $("#editAvatar").value = editorDraft.profile.avatar || "";
    $("#editFavicon").value = editorDraft.profile.favicon || "assets/favicon.png";
    $("#editFooter").value = editorDraft.profile.footerText || "";
    $("#editNameJa").value = editorDraft.profile.translations?.ja?.name || "";
    $("#editBioJa").value = editorDraft.profile.translations?.ja?.bio || "";
    $("#editFooterJa").value = editorDraft.profile.translations?.ja?.footerText || "";
    $("#editNameEn").value = editorDraft.profile.translations?.en?.name || "";
    $("#editBioEn").value = editorDraft.profile.translations?.en?.bio || "";
    $("#editFooterEn").value = editorDraft.profile.translations?.en?.footerText || "";
    const profileBadges = editorDraft.profile.badges || [];
    const locationBadge = profileBadges[0] || { enabled: true, icon: "map-pin", text: "" };
    const usefulBadge = profileBadges[1] || { enabled: true, icon: "sparkles", text: "" };
    $("#editLocationBadgeEnabled").checked = locationBadge.enabled !== false;
    $("#editLocationBadgeText").value = locationBadge.text || "";
    $("#editLocationBadgeIcon").value = locationBadge.icon || "map-pin";
    $("#editLocationBadgeTextJa").value = locationBadge.translations?.ja?.text || "";
    $("#editLocationBadgeTextEn").value = locationBadge.translations?.en?.text || "";
    $("#editUsefulBadgeEnabled").checked = usefulBadge.enabled !== false;
    $("#editUsefulBadgeText").value = usefulBadge.text || "";
    $("#editUsefulBadgeIcon").value = usefulBadge.icon || "sparkles";
    $("#editUsefulBadgeTextJa").value = usefulBadge.translations?.ja?.text || "";
    $("#editUsefulBadgeTextEn").value = usefulBadge.translations?.en?.text || "";
    $("#editDefaultTheme").value = editorDraft.settings.defaultTheme || "auto";
    $("#editDefaultLanguage").value = editorDraft.settings.defaultLanguage || "vi";
    $("#editMobileColumns").value = String(editorDraft.settings.layout.mobileColumns || 1);
    $("#editTabletColumns").value = String(editorDraft.settings.layout.tabletColumns || 2);
    $("#editDesktopColumns").value = String(editorDraft.settings.layout.desktopColumns || 2);
    const appearance = editorDraft.settings.appearance || DEFAULT_APPEARANCE;
    $("#editPrimaryColor").value = appearance.primaryColor;
    $("#editPrimaryStrongColor").value = appearance.primaryStrongColor;
    $("#editLightTextColor").value = appearance.lightTextColor;
    $("#editLightMutedColor").value = appearance.lightMutedColor;
    $("#editDarkTextColor").value = appearance.darkTextColor;
    $("#editDarkMutedColor").value = appearance.darkMutedColor;
    $("#editNameFontSize").value = appearance.nameFontSize;
    $("#editBioFontSize").value = appearance.bioFontSize;
    $("#editLinkTitleFontSize").value = appearance.linkTitleFontSize;
    $("#editLinkDescriptionFontSize").value = appearance.linkDescriptionFontSize;
    $("#editFooterFontSize").value = appearance.footerFontSize;
    $("#editThemeButton").checked = editorDraft.settings.showThemeButton !== false;
    $("#editLanguageButton").checked = editorDraft.settings.showLanguageButton !== false;
    $("#editShareButton").checked = editorDraft.settings.showShareButton !== false;
    $("#editQrButton").checked = editorDraft.settings.showQrButton !== false;
    $("#editNewTab").checked = editorDraft.settings.openLinksInNewTab !== false;
    $("#editAnnouncementEnabled").checked = !!editorDraft.settings.announcement?.enabled;
    $("#editAnnouncementText").value = editorDraft.settings.announcement?.text || "";
    $("#editAnnouncementTextJa").value = editorDraft.settings.announcement?.translations?.ja?.text || "";
    $("#editAnnouncementTextEn").value = editorDraft.settings.announcement?.translations?.en?.text || "";
    $("#editNewPassword").value = "";
    $("#editConfirmPassword").value = "";
    resetPasswordVisibility("editNewPassword");
    resetPasswordVisibility("editConfirmPassword");
    renderEditorItems("links");
    renderEditorItems("socials");
  };

  const renderEditorItems = type => {
    const isLinks = type === "links";
    const list = isLinks ? editorDraft.links : editorDraft.socialIcons;
    const container = isLinks ? $("#adminLinks") : $("#adminSocials");
    const sourceOptions = (editorDraft.links || []).map(link => `<option value="${escapeAttribute(link.id)}">${escapeHtml(link.title || "Liên kết")}</option>`).join("");

    container.innerHTML = list.map((item, index) => {
      const translationFields = isLinks ? `
        <details class="admin-translation-box">
          <summary>${icon("globe", 15)} Tên và mô tả JP / EN</summary>
          <div class="admin-translation-content">
            <p class="admin-language-title"><img src="assets/flag-ja.svg" alt="JP" /> JP — 日本語</p>
            <div class="admin-grid two">
              <label class="admin-field"><span>Tên JP</span><input data-translation-language="ja" data-translation-field="title" type="text" value="${escapeAttribute(item.translations?.ja?.title || "")}" /></label>
              <label class="admin-field"><span>Nhãn JP</span><input data-translation-language="ja" data-translation-field="badge" type="text" value="${escapeAttribute(item.translations?.ja?.badge || "")}" /></label>
            </div>
            <label class="admin-field"><span>Mô tả JP</span><input data-translation-language="ja" data-translation-field="description" type="text" value="${escapeAttribute(item.translations?.ja?.description || "")}" /></label>
            <p class="admin-language-title"><img src="assets/flag-en.svg" alt="EN" /> EN — English</p>
            <div class="admin-grid two">
              <label class="admin-field"><span>Tên EN</span><input data-translation-language="en" data-translation-field="title" type="text" value="${escapeAttribute(item.translations?.en?.title || "")}" /></label>
              <label class="admin-field"><span>Nhãn EN</span><input data-translation-language="en" data-translation-field="badge" type="text" value="${escapeAttribute(item.translations?.en?.badge || "")}" /></label>
            </div>
            <label class="admin-field"><span>Mô tả EN</span><input data-translation-language="en" data-translation-field="description" type="text" value="${escapeAttribute(item.translations?.en?.description || "")}" /></label>
          </div>
        </details>` : `
        <details class="admin-translation-box">
          <summary>${icon("globe", 15)} Tên icon JP / EN</summary>
          <div class="admin-translation-content">
            <div class="admin-grid two">
              <label class="admin-field"><span>Tên JP</span><input data-translation-language="ja" data-translation-field="label" type="text" value="${escapeAttribute(item.translations?.ja?.label || "")}" /></label>
              <label class="admin-field"><span>Tên EN</span><input data-translation-language="en" data-translation-field="label" type="text" value="${escapeAttribute(item.translations?.en?.label || "")}" /></label>
            </div>
          </div>
        </details>`;

      return `
      <article class="admin-item" data-type="${type}" data-index="${index}">
        <div class="admin-item-top">
          <button class="admin-visibility-button ${item.enabled ? "is-visible" : "is-hidden"}" type="button" data-action="toggle-enabled" aria-pressed="${item.enabled ? "true" : "false"}" title="${item.enabled ? "Nhấn để ẩn mục này" : "Nhấn để hiện mục này"}">${icon(item.enabled ? "eye" : "eye-off", 17)}<b>${item.enabled ? "Đang hiện" : "Đang ẩn"}</b></button>
          <div class="admin-order">
            <button type="button" data-action="up" title="Đưa lên" ${index === 0 ? "disabled" : ""}>${icon("chevron-up", 17)}</button>
            <button type="button" data-action="down" title="Đưa xuống" ${index === list.length - 1 ? "disabled" : ""}>${icon("chevron-down", 17)}</button>
            <button type="button" data-action="delete" class="delete" title="Xóa">${icon("trash-2", 17)}</button>
          </div>
        </div>
        ${!isLinks ? `
          <div class="admin-sync-row">
            <label class="admin-field"><span>Chọn icon lớn để sao chép</span><select data-field="sourceLinkId"><option value="">Chọn liên kết</option>${sourceOptions}</select></label>
            <button class="admin-sync-button" type="button" data-action="copy-from-link">${icon("copy", 16)} Đồng bộ ngay</button>
          </div>
          <p class="admin-sync-note">Nút “Đồng bộ ngay” sẽ sao chép một lần tên, đường dẫn, icon/ảnh, nền và bản dịch. Sau đó tất cả ô bên dưới vẫn sửa được bình thường.</p>
        ` : ""}
        <div class="admin-manual-fields">
          <div class="admin-grid two">
            <label class="admin-field"><span>${isLinks ? "Tên nút" : "Tên icon"}</span><input data-field="${isLinks ? "title" : "label"}" type="text" value="${escapeAttribute(isLinks ? item.title : item.label)}" /></label>
            <label class="admin-field"><span>Tên icon SVG</span><input data-field="icon" type="text" value="${escapeAttribute(item.icon || "globe")}" placeholder="facebook, phone, mail..." /></label>
          </div>
          ${isLinks ? `<label class="admin-field"><span>Mô tả</span><input data-field="description" type="text" value="${escapeAttribute(item.description || "")}" /></label>` : ""}
          <label class="admin-field"><span>Đường dẫn</span><input data-field="url" type="text" value="${escapeAttribute(item.url || "")}" /></label>
          <div class="admin-grid two">
            <label class="admin-field"><span>Ảnh thay icon</span><input data-field="image" type="text" value="${escapeAttribute(item.image || "")}" placeholder="assets/facebook.png hoặc URL" /></label>
            ${isLinks ? `<label class="admin-field"><span>Nhãn nhỏ</span><input data-field="badge" type="text" value="${escapeAttribute(item.badge || "")}" placeholder="Nổi bật" /></label>` : `<span></span>`}
          </div>
          ${translationFields}
          <div class="admin-item-options">
            <div class="admin-option-group">
              ${isLinks ? `<label><input data-field="featured" type="checkbox" ${item.featured ? "checked" : ""}/> Làm nổi bật</label>` : ""}
              <label><input data-field="showIconBackground" type="checkbox" ${item.showIconBackground ? "checked" : ""}/> Hiện nền icon</label>
            </div>
            <label class="admin-upload small">${icon("image", 16)} Chọn ảnh PNG/WEBP<input data-action="item-image-upload" type="file" accept="image/png,image/webp,image/jpeg,image/svg+xml" /></label>
          </div>
        </div>
      </article>`;
    }).join("");

    if (!isLinks) {
      $$('select[data-field="sourceLinkId"]', container).forEach((select, index) => {
        select.value = list[index]?.sourceLinkId || "";
      });
    }
  };

  const collectEditorFields = () => {
    if (!editorDraft) return;
    editorDraft.profile.name = $("#editName").value.trim();
    editorDraft.profile.handle = $("#editHandle").value.trim();
    editorDraft.profile.bio = $("#editBio").value.trim();
    editorDraft.profile.avatar = $("#editAvatar").value.trim();
    editorDraft.profile.favicon = $("#editFavicon").value.trim() || "assets/favicon.png";
    editorDraft.profile.footerText = $("#editFooter").value.trim();
    editorDraft.profile.translations = {
      ja: { name: $("#editNameJa").value.trim(), bio: $("#editBioJa").value.trim(), footerText: $("#editFooterJa").value.trim() },
      en: { name: $("#editNameEn").value.trim(), bio: $("#editBioEn").value.trim(), footerText: $("#editFooterEn").value.trim() }
    };
    editorDraft.profile.badges = [
      {
        enabled: $("#editLocationBadgeEnabled").checked,
        icon: $("#editLocationBadgeIcon").value.trim() || "map-pin",
        text: $("#editLocationBadgeText").value.trim(),
        translations: { ja: { text: $("#editLocationBadgeTextJa").value.trim() }, en: { text: $("#editLocationBadgeTextEn").value.trim() } }
      },
      {
        enabled: $("#editUsefulBadgeEnabled").checked,
        icon: $("#editUsefulBadgeIcon").value.trim() || "sparkles",
        text: $("#editUsefulBadgeText").value.trim(),
        translations: { ja: { text: $("#editUsefulBadgeTextJa").value.trim() }, en: { text: $("#editUsefulBadgeTextEn").value.trim() } }
      }
    ];
    editorDraft.settings.defaultTheme = $("#editDefaultTheme").value;
    editorDraft.settings.defaultLanguage = $("#editDefaultLanguage").value;
    editorDraft.settings.layout.mobileColumns = clampColumns($("#editMobileColumns").value);
    editorDraft.settings.layout.tabletColumns = clampColumns($("#editTabletColumns").value);
    editorDraft.settings.layout.desktopColumns = clampColumns($("#editDesktopColumns").value);
    editorDraft.settings.appearance = {
      primaryColor: $("#editPrimaryColor").value,
      primaryStrongColor: $("#editPrimaryStrongColor").value,
      lightTextColor: $("#editLightTextColor").value,
      lightMutedColor: $("#editLightMutedColor").value,
      darkTextColor: $("#editDarkTextColor").value,
      darkMutedColor: $("#editDarkMutedColor").value,
      nameFontSize: clampNumber($("#editNameFontSize").value, 18, 52, 32),
      bioFontSize: clampNumber($("#editBioFontSize").value, 11, 24, 15),
      linkTitleFontSize: clampNumber($("#editLinkTitleFontSize").value, 11, 24, 15),
      linkDescriptionFontSize: clampNumber($("#editLinkDescriptionFontSize").value, 9, 20, 12),
      footerFontSize: clampNumber($("#editFooterFontSize").value, 9, 18, 12)
    };
    editorDraft.settings.showThemeButton = $("#editThemeButton").checked;
    editorDraft.settings.showLanguageButton = $("#editLanguageButton").checked;
    editorDraft.settings.showShareButton = $("#editShareButton").checked;
    editorDraft.settings.showQrButton = $("#editQrButton").checked;
    editorDraft.settings.openLinksInNewTab = $("#editNewTab").checked;
    editorDraft.settings.announcement.enabled = $("#editAnnouncementEnabled").checked;
    editorDraft.settings.announcement.text = $("#editAnnouncementText").value.trim();
    editorDraft.settings.announcement.translations = {
      ja: { text: $("#editAnnouncementTextJa").value.trim() },
      en: { text: $("#editAnnouncementTextEn").value.trim() }
    };

    $$(".admin-item").forEach(card => {
      const type = card.dataset.type;
      const index = Number(card.dataset.index);
      const list = type === "links" ? editorDraft.links : editorDraft.socialIcons;
      const item = list[index];
      if (!item) return;
      $$('[data-field]', card).forEach(field => {
        item[field.dataset.field] = field.type === "checkbox" ? field.checked : field.value.trim();
      });
      item.translations ||= {};
      $$('[data-translation-language]', card).forEach(field => {
        const language = field.dataset.translationLanguage;
        const translationField = field.dataset.translationField;
        item.translations[language] ||= {};
        item.translations[language][translationField] = field.value.trim();
      });
    });
  };

  const handleEditorItemInput = event => {
    const card = event.target.closest(".admin-item");
    if (!card) return;
    if (event.target.matches('[data-field="image"]') && event.target.value.trim()) {
      const backgroundField = $('[data-field="showIconBackground"]', card);
      if (backgroundField) backgroundField.checked = false;
    }
  };

  const handleSocialSourceChange = event => {
    const select = event.target.closest('select[data-field="sourceLinkId"]');
    if (!select) return;
    collectEditorFields();
  };

  const handleItemAction = event => {
    const button = event.target.closest("[data-action]");
    if (!button || button.dataset.action === "item-image-upload") return;
    collectEditorFields();
    const card = button.closest(".admin-item");
    const type = card.dataset.type;
    const index = Number(card.dataset.index);
    const list = type === "links" ? editorDraft.links : editorDraft.socialIcons;
    if (button.dataset.action === "toggle-enabled") {
      list[index].enabled = !list[index].enabled;
      renderEditorItems(type);
      return;
    }
    if (button.dataset.action === "copy-from-link" && type === "socials") {
      const source = findSourceLink(list[index].sourceLinkId, editorDraft.links);
      if (!source) {
        showToast("Hãy chọn icon lớn cần sao chép");
        return;
      }
      copySocialFromLink(list[index], source);
      renderEditorItems("socials");
      showToast(`Đã sao chép từ ${source.title || "icon lớn"}`);
      return;
    }
    if (button.dataset.action === "up" && index > 0) [list[index - 1], list[index]] = [list[index], list[index - 1]];
    if (button.dataset.action === "down" && index < list.length - 1) [list[index + 1], list[index]] = [list[index], list[index + 1]];
    if (button.dataset.action === "delete" && confirm("Xóa mục này?")) {
      const removed = list[index];
      list.splice(index, 1);
      if (type === "links") {
        editorDraft.socialIcons.forEach(social => {
          if (social.sourceLinkId === removed?.id) social.sourceLinkId = "";
        });
      }
    }
    renderEditorItems(type);
    if (type === "links") renderEditorItems("socials");
  };

  const fileToDataUrl = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleAvatarUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) return showToast("Ảnh nên nhỏ hơn 1.5 MB");
    $("#editAvatar").value = await fileToDataUrl(file);
    showToast("Đã nạp ảnh logo");
  };

  const handleFaviconUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 800_000) return showToast("Icon tab nên nhỏ hơn 800 KB");
    $("#editFavicon").value = await fileToDataUrl(file);
    showToast("Đã nạp icon trên tab web");
  };

  const handlePasswordToggle = event => {
    const button = event.target.closest('[data-password-toggle]');
    if (!button) return;
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) return;
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.innerHTML = icon(showing ? "eye" : "eye-off", 18);
    button.setAttribute("aria-label", showing ? "Hiện mật khẩu" : "Ẩn mật khẩu");
    button.title = showing ? "Hiện mật khẩu" : "Ẩn mật khẩu";
  };

  const resetPasswordVisibility = inputId => {
    const input = document.getElementById(inputId);
    const button = document.querySelector(`[data-password-toggle="${inputId}"]`);
    if (input) input.type = "password";
    if (button) {
      button.innerHTML = icon("eye", 18);
      button.setAttribute("aria-label", "Hiện mật khẩu");
      button.title = "Hiện mật khẩu";
    }
  };

  const handleImageUpload = async event => {
    const input = event.target.closest('[data-action="item-image-upload"]');
    if (!input) return;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) return showToast("Ảnh nên nhỏ hơn 1.5 MB");
    const card = input.closest(".admin-item");
    const imageField = $('[data-field="image"]', card);
    imageField.value = await fileToDataUrl(file);
    const backgroundField = $('[data-field="showIconBackground"]', card);
    if (backgroundField) backgroundField.checked = false;
    showToast("Đã nạp ảnh và tắt nền icon");
  };

  const applyNewPassword = async () => {
    const password = $("#editNewPassword").value;
    const confirmPassword = $("#editConfirmPassword").value;
    if (!password && !confirmPassword) return true;
    if (password.length < 6) {
      showToast("Mật khẩu mới cần ít nhất 6 ký tự");
      return false;
    }
    if (password !== confirmPassword) {
      showToast("Hai mật khẩu mới chưa giống nhau");
      return false;
    }
    editorDraft.admin.passwordHash = await sha256(password);
    return true;
  };

  const saveEditorConfig = async () => {
    collectEditorFields();
    if (!(await applyNewPassword())) return;
    config = normalizeConfig(editorDraft);
    editorDraft = normalizeConfig(editorDraft);
    safeStorageSet(storageKey, JSON.stringify(config));
    const selectedTab = $("[data-admin-tab].active")?.dataset.adminTab || "config";
    safeStorageRemove("bio-theme");
    safeStorageRemove("bio-language");
    currentLanguage = config.settings.defaultLanguage || "vi";
    setTheme(resolveInitialTheme());
    const overlay = $("#adminOverlay");
    const keepEditorOpen = overlay?.classList.contains("open") && !$("#adminEditor")?.classList.contains("hidden");
    renderAll();
    if (keepEditorOpen) {
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      $("#adminLogin").classList.add("hidden");
      $("#adminEditor").classList.remove("hidden");
      document.body.style.overflow = "hidden";
      switchAdminTab(selectedTab);
    }
    showToast("Đã lưu trên trình duyệt này");
    $("#editNewPassword").value = "";
    $("#editConfirmPassword").value = "";
  };

  const exportEditorConfig = async () => {
    collectEditorFields();
    if (!(await applyNewPassword())) return;
    const content = `/* Cấu hình Bio Link - xuất từ bảng cài đặt */\nwindow.BIO_CONFIG = ${JSON.stringify(editorDraft, null, 2)};\n`;
    const blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "config.js";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Đã tải file config.js");
  };

  const resetToSourceConfig = () => {
    if (!confirm("Xóa cấu hình đã lưu trên trình duyệt và quay về file js/config.js?")) return;
    safeStorageRemove(storageKey);
    safeStorageRemove("bio-theme");
    safeStorageRemove("bio-language");
    config = normalizeConfig(sourceConfig);
    editorDraft = normalizeConfig(sourceConfig);
    currentLanguage = config.settings.defaultLanguage || "vi";
    setTheme(resolveInitialTheme());
    renderAll();
    populateEditor();
    switchAdminTab("config");
    showToast("Đã quay về cấu hình trong file");
  };

  const updateViewportHeight = () => {
    document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
  };

  const init = () => {
    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight, { passive: true });
    window.addEventListener("orientationchange", updateViewportHeight, { passive: true });
    setupActions();
    currentLanguage = resolveInitialLanguage();
    renderAll();
    setTheme(resolveInitialTheme());
    applyLanguage();
    setupAdmin();
  };

  init();
})();
