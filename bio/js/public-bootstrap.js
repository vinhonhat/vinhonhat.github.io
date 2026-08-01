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
  config.settings ||= {};
  config.settings.appearance ||= {};
  config.settings.layout ||= {};
  config.links = Array.isArray(config.links) ? config.links : [];
  config.socialIcons = Array.isArray(config.socialIcons) ? config.socialIcons : [];

  if (!isPrimary) {
    const linkImages = shared.linkImages || {};
    const socialImages = shared.socialImages || {};
    config.profile.favicon = config.profile.avatar || "avatar.png";
    config.links.forEach(item => {
      if (item?.id && Object.prototype.hasOwnProperty.call(linkImages, item.id)) item.image = linkImages[item.id] || "";
    });
    config.socialIcons.forEach(item => {
      const key = item?.sourceLinkId || item?.id || "";
      if (key && Object.prototype.hasOwnProperty.call(socialImages, key)) item.image = socialImages[key] || "";
      else if (key && Object.prototype.hasOwnProperty.call(linkImages, key)) item.image = linkImages[key] || "";
    });
  }

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
  const verifiedSvg = `<svg class="verified-badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><polygon points="12.00,1.20 13.79,2.98 16.13,2.02 17.11,4.35 19.64,4.36 19.65,6.89 21.98,7.87 21.02,10.21 22.80,12.00 21.02,13.79 21.98,16.13 19.65,17.11 19.64,19.64 17.11,19.65 16.13,21.98 13.79,21.02 12.00,22.80 10.21,21.02 7.87,21.98 6.89,19.65 4.36,19.64 4.35,17.11 2.02,16.13 2.98,13.79 1.20,12.00 2.98,10.21 2.02,7.87 4.35,6.89 4.36,4.36 6.89,4.35 7.87,2.02 10.21,2.98" fill="#1b74e4"></polygon><path d="M7.35 12.2 10.45 15.15 16.85 8.75" fill="none" stroke="#fff" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
  const fallbackIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
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
  const avatar = asset(profile.avatar || "assets/avatar.svg");
  const avatarEl = $("#profileAvatar");
  if (avatarEl) { avatarEl.src = avatar; avatarEl.alt = `Ảnh đại diện ${name}`; }
  if ($("#profileName")) $("#profileName").textContent = name;
  if ($("#profileHandle")) $("#profileHandle").textContent = profile.handle || "";
  if ($("#profileBio")) $("#profileBio").textContent = localized(profile, "bio", "");
  if ($("#footerText")) $("#footerText").textContent = localized(profile, "footerText", name);
  const verified = document.querySelector(".name-line .verified");
  if (verified) { verified.hidden = profile.verified === false; verified.innerHTML = profile.verified === false ? "" : verifiedSvg; }
  const favicon = asset(profile.favicon || profile.avatar || "assets/favicon.png");
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
  if ($("#socialContainer")) $("#socialContainer").innerHTML = socials.map(item => `<a class="social-button${item.image ? " has-image no-bg" : ""}" href="${escapeAttr(normalizeUrl(item.url))}" aria-label="${escapeAttr(localized(item, "label", item.label || "Liên kết"))}"${target}>${media(item, "social-image")}</a>`).join("");

  if ($("#qrButton")) $("#qrButton").textContent = ({ vi: "Mã QR", ja: "QRコード", en: "QR code" })[language];
  if ($("#languageButton")) $("#languageButton").hidden = config.settings.showLanguageButton === false;
  if ($("#themeButton")) $("#themeButton").hidden = config.settings.showThemeButton === false;
  if ($("#shareButton")) $("#shareButton").hidden = config.settings.showShareButton === false;
  if ($("#qrButton")) $("#qrButton").hidden = config.settings.showQrButton === false;

  root.dataset.bioBootstrapReady = "true";
})();
