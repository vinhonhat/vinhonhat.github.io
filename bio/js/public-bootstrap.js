/* Hiển thị hồ sơ công khai thật sớm, trước khi tải mã Admin lớn. */
(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value || {}));
  const system = clone(window.BIO_SYSTEM_CONFIG || {});
  const slug = String(window.BIO_PROFILE_SLUG || "vinh").toLowerCase();
  const profileDir = String(window.BIO_PROFILE_DIR || (slug === "vinh" ? "" : `${slug}/`));
  const isPrimary = slug === "vinh";
  const shared = clone(window.BIO_SHARED_ASSETS || {});
  const externalAdmin = clone(window.BIO_ADMIN_CONFIG || {});
  const source = clone(window.BIO_CONFIG || {});
  const admin = { ...(system.adminDefaults || {}), ...externalAdmin, ...(source.admin || {}) };
  const storageKey = `${admin.storageKey || "bio-admin-preview"}-${slug}`;
  let config = source;
  try {
    const preview = localStorage.getItem(storageKey);
    if (preview) config = JSON.parse(preview);
  } catch { /* dùng file profile.js */ }

  config.profile ||= {};
  const rawAvatar = String(config.profile.avatar || "").trim();
  config.profile.avatar = rawAvatar && !/^data:image\//i.test(rawAvatar) ? "avatar.png" : rawAvatar;
  config.profile.favicon = config.profile.avatar || "";
  config.settings ||= {};
  config.settings.appearance ||= {};
  config.settings.layout ||= {};
  config.links = Array.isArray(config.links) ? config.links : [];
  config.socialIcons = Array.isArray(config.socialIcons) ? config.socialIcons : [];

  if (!isPrimary) {
    const linkImages = shared.linkImages || {};
    config.links.forEach(item => {
      if (item?.id && Object.prototype.hasOwnProperty.call(linkImages, item.id)) item.image = linkImages[item.id] || "";
    });
  }
  config.socialIcons.forEach(item => { item.image = ""; });

  const detectLanguage = () => {
    const value = String((navigator.languages && navigator.languages[0]) || navigator.language || "").toLowerCase();
    if (value === "vi" || value.startsWith("vi-")) return "vi";
    if (value === "ja" || value.startsWith("ja-")) return "ja";
    return "en";
  };
  let language = "vi";
  try {
    const saved = localStorage.getItem(`${storageKey}-language`);
    language = ["vi", "ja", "en"].includes(saved) ? saved : "";
  } catch { /* bỏ qua */ }
  if (!language) {
    const preset = config.settings.defaultLanguage || "auto";
    language = ["vi", "ja", "en"].includes(preset) ? preset : detectLanguage();
  }

  const localized = (object, field, fallback = "") => {
    const translated = object?.translations?.[language]?.[field];
    return translated !== undefined && translated !== "" ? translated : (object?.[field] ?? fallback);
  };
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const escapeAttr = escapeHtml;
  const normalizeUrl = value => {
    const raw = String(value || "").trim();
    if (!raw) return "#";
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/|\.\/|\.\.\/)/i.test(raw)) return raw.startsWith("//") ? `https:${raw}` : raw;
    return `https://${raw.replace(/^\/+/, "")}`;
  };
  const isAbsolute = value => /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(String(value || ""));
  const asset = value => {
    const sourcePath = String(value || "").trim();
    if (!sourcePath || isAbsolute(sourcePath)) return sourcePath;
    if (/^(?:assets|img|css|js)\//i.test(sourcePath)) return sourcePath;
    return `${profileDir}${sourcePath}`;
  };
  const initialsOf = value => {
    const words = String(value || "Bio Link").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "BL";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0] || ""}${words[words.length - 1][0] || ""}`.toUpperCase();
  };
  const initialsFavicon = (name, primary = "#f39b19", strong = "#d97800") => {
    const initials = initialsOf(name);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${strong}"/></linearGradient></defs><circle cx="64" cy="64" r="62" fill="url(#g)"/><text x="64" y="70" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Arial,sans-serif" font-size="44" font-weight="800">${initials}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };
  const verifiedSvg = `<svg class="verified-badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><polygon points="12.00,1.20 13.79,2.98 16.13,2.02 17.11,4.35 19.64,4.36 19.65,6.89 21.98,7.87 21.02,10.21 22.80,12.00 21.02,13.79 21.98,16.13 19.65,17.11 19.64,19.64 17.11,19.65 16.13,21.98 13.79,21.02 12.00,22.80 10.21,21.02 7.87,21.98 6.89,19.65 4.36,19.64 4.35,17.11 2.02,16.13 2.98,13.79 1.20,12.00 2.98,10.21 2.02,7.87 4.35,6.89 4.36,4.36 6.89,4.35 7.87,2.02 10.21,2.98" fill="#1b74e4"></polygon><path d="M7.35 12.2 10.45 15.15 16.85 8.75" fill="none" stroke="#fff" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
  const fallbackIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
  const socialBrandIcon = item => {
    const value = [item?.brandIcon, item?.id, item?.sourceLinkId, item?.label, item?.url, item?.icon].filter(Boolean).join(" ").toLowerCase();
    if (value.includes("messenger") || value.includes("m.me/")) return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.4 3.7 7.1V22l3.4-1.9c.9.2 1.9.4 2.9.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2Zm1 12.4-2.5-2.7-4.8 2.7 5.3-5.6 2.5 2.7 4.8-2.7-5.3 5.6Z"/></svg>`;
    if (value.includes("facebook")) return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.8.3-1 1-1Z"/></svg>`;
    if (value.includes("tiktok")) return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 3c.5 2.5 1.9 4 4 4.5V11c-1.5-.1-2.8-.6-4-1.4V16a6 6 0 1 1-5-5.9v3.7a2.5 2.5 0 1 0 1.5 2.2V3H15Z"/></svg>`;
    if (value.includes("zalo")) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 8h8l-8 6h8"/></svg>`;
    if (value.includes("line.me") || value.includes(" line")) return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 11.2c0-4-3.8-7.2-8.5-7.2s-8.5 3.2-8.5 7.2c0 3.6 3.2 6.6 7.4 7.1.3.1.7.3.8.6.1.3 0 .8 0 1.1l-.2 1.2c0 .4-.3 1.5 1.3.8 1.7-.7 4.5-2.6 6.2-4.5 1.1-1.3 1.5-2.7 1.5-4.3Z"/></svg>`;
    if (value.includes("youtube")) return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg>`;
    if (value.includes("mail")) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="m3 7 9 7 9-7"/></svg>`;
    return fallbackIcon;
  };
  const media = (item, className) => item.image
    ? `<span class="media-stack"><span class="media-fallback">${fallbackIcon}</span><img class="${className}" src="${escapeAttr(asset(item.image))}" alt="" onload="this.parentElement.classList.add('loaded')" onerror="this.remove()" /></span>`
    : fallbackIcon;

  const appearance = config.settings.appearance;
  const root = document.documentElement;
  const set = (name, value) => value && root.style.setProperty(name, value);
  set("--custom-primary", appearance.primaryColor);
  set("--custom-primary-strong", appearance.primaryStrongColor);
  set("--custom-light-text", appearance.lightTextColor);
  set("--custom-light-muted", appearance.lightMutedColor);
  set("--custom-dark-text", appearance.darkTextColor);
  set("--custom-dark-muted", appearance.darkMutedColor);
  set("--custom-light-outer-bg", appearance.outerLightColor);
  set("--custom-dark-outer-bg", appearance.outerDarkColor);
  set("--custom-light-inner-bg", appearance.innerLightColor);
  set("--custom-dark-inner-bg", appearance.innerDarkColor);
  if (appearance.outerBackgroundImage) set("--outer-background-image", `url("${asset(appearance.outerBackgroundImage).replace(/"/g, '\\"')}")`);
  if (appearance.innerBackgroundImage) set("--inner-background-image", `url("${asset(appearance.innerBackgroundImage).replace(/"/g, '\\"')}")`);
  const mobile = Math.min(3, Math.max(1, Number(config.settings.layout.mobileColumns) || 1));
  const tablet = Math.min(3, Math.max(1, Number(config.settings.layout.tabletColumns) || 2));
  const desktop = Math.min(3, Math.max(1, Number(config.settings.layout.desktopColumns) || 2));
  root.dataset.mobileColumns = mobile;
  root.dataset.tabletColumns = tablet;
  root.dataset.desktopColumns = desktop;
  root.style.setProperty("--mobile-columns", mobile);
  root.style.setProperty("--tablet-columns", tablet);
  root.style.setProperty("--desktop-columns", desktop);
  root.style.setProperty("--card-max-width", `${desktop === 1 ? 610 : desktop === 2 ? 930 : 1220}px`);

  let theme = "";
  try { theme = localStorage.getItem("bio-theme") || ""; } catch { /* bỏ qua */ }
  if (!["light", "dark"].includes(theme)) {
    const preset = config.settings.defaultTheme || "auto";
    theme = ["light", "dark"].includes(preset) ? preset : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  root.dataset.theme = theme;
  root.lang = language;

  const profile = config.profile;
  const name = localized(profile, "name", "Bio Link");
  const initials = initialsOf(name);
  const avatar = profile.avatar ? asset(profile.avatar) : "";
  const avatarEl = $("#profileAvatar");
  let avatarFallback = $("#profileAvatarInitials");
  if (!avatarFallback && avatarEl?.parentElement) {
    avatarFallback = document.createElement("span");
    avatarFallback.id = "profileAvatarInitials";
    avatarFallback.className = "avatar-initials";
    avatarFallback.setAttribute("aria-hidden", "true");
    avatarEl.parentElement.insertBefore(avatarFallback, avatarEl);
  }
  if (avatarFallback) avatarFallback.textContent = initials;
  if (avatarEl) {
    avatarEl.alt = `Ảnh đại diện ${name}`;
    avatarEl.onload = () => { avatarEl.classList.remove("is-missing"); avatarFallback?.classList.add("hidden"); };
    avatarEl.onerror = () => { avatarEl.classList.add("is-missing"); avatarFallback?.classList.remove("hidden"); const fallback = initialsFavicon(name, appearance.primaryColor, appearance.primaryStrongColor); if ($("#faviconLink")) $("#faviconLink").href = fallback; if ($("#appleTouchIcon")) $("#appleTouchIcon").href = fallback; };
    if (avatar) avatarEl.src = avatar; else { avatarEl.removeAttribute("src"); avatarEl.onerror(); }
  }
  if ($("#profileName")) $("#profileName").textContent = name;
  if ($("#profileHandle")) $("#profileHandle").textContent = profile.handle || "";
  if ($("#profileBio")) $("#profileBio").textContent = localized(profile, "bio", "");
  if ($("#footerText")) $("#footerText").textContent = localized(profile, "footerText", name);
  const verified = document.querySelector(".name-line .verified");
  if (verified) { verified.hidden = profile.verified === false; verified.innerHTML = profile.verified === false ? "" : verifiedSvg; }
  const favicon = avatar || initialsFavicon(name, appearance.primaryColor, appearance.primaryStrongColor);
  if ($("#faviconLink")) $("#faviconLink").href = favicon;
  if ($("#appleTouchIcon")) $("#appleTouchIcon").href = favicon;
  document.title = `${name} | Bio Link`;

  const badges = (profile.badges || []).filter(item => item.enabled !== false && localized(item, "text", ""));
  if ($("#profileBadges")) $("#profileBadges").innerHTML = badges.map(item => `<span class="badge"><span>${escapeHtml(localized(item, "text", ""))}</span></span>`).join("");

  const target = config.settings.openLinksInNewTab ? ` target="_blank" rel="noopener noreferrer"` : "";
  const featureLabel = { vi: "Nổi bật", ja: "おすすめ", en: "Featured" };
  if ($("#linksContainer")) $("#linksContainer").innerHTML = config.links.filter(item => item.enabled).map(item => {
    const title = localized(item, "title", "Liên kết");
    const description = localized(item, "description", "");
    const badgeText = item.featured ? (localized(item, "badge", "") || featureLabel[language]) : "";
    const hasImage = Boolean(item.image);
    const showBackground = typeof item.showIconBackground === "boolean" ? item.showIconBackground : !hasImage;
    return `<a class="link-card" href="${escapeAttr(normalizeUrl(item.url))}"${target}><span class="link-icon${hasImage ? " has-image" : ""}${showBackground ? " with-bg" : " no-bg"}">${media(item, "link-image")}</span><span class="link-copy"><span class="link-title">${escapeHtml(title)}${badgeText ? `<span class="tag-new">${escapeHtml(badgeText)}</span>` : ""}</span>${description ? `<span class="link-description">${escapeHtml(description)}</span>` : ""}</span><span class="link-arrow">↗</span></a>`;
  }).join("");

  const socials = config.socialIcons.filter(item => item.enabled);
  const socialSection = $("#socialSection");
  if (socialSection) socialSection.classList.toggle("hidden", !socials.length);
  if ($("#socialSectionLabel")) $("#socialSectionLabel").textContent = ({ vi: "Kết nối với tôi", ja: "リンク一覧", en: "Connect with me" })[language];
  if ($("#socialContainer")) $("#socialContainer").innerHTML = socials.map(item => `<a class="social-button has-system-icon${item.showIconBackground ? " with-bg" : " no-bg"}" href="${escapeAttr(normalizeUrl(item.url))}" aria-label="${escapeAttr(localized(item, "label", item.label || "Liên kết"))}"${target}>${socialBrandIcon(item)}</a>`).join("");

  if ($("#qrButton")) $("#qrButton").textContent = ({ vi: "Mã QR", ja: "QRコード", en: "QR code" })[language];
  if ($("#languageButton")) $("#languageButton").hidden = config.settings.showLanguageButton === false;
  if ($("#themeButton")) $("#themeButton").hidden = config.settings.showThemeButton === false;
  if ($("#shareButton")) $("#shareButton").hidden = config.settings.showShareButton === false;
  if ($("#qrButton")) $("#qrButton").hidden = config.settings.showQrButton === false;

  root.dataset.bioBootstrapReady = "true";
})();
