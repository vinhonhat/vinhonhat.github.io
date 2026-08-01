/* Bio Link - mã hệ thống dùng chung. Phiên bản lấy từ system-config.js. */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const deepClone = value => JSON.parse(JSON.stringify(value));
  const SYSTEM_CONFIG = deepClone(window.BIO_SYSTEM_CONFIG || {});
  const SYSTEM_VERSION = String(SYSTEM_CONFIG.version || "V-beta");
  const SYSTEM_ASSET_VERSION = String(SYSTEM_CONFIG.assetVersion || SYSTEM_VERSION.replace(/^V/i, ""));
  const EXTERNAL_ADMIN_CONFIG = deepClone(window.BIO_ADMIN_CONFIG || {});
  const HAS_SEPARATE_ADMIN_CONFIG = Object.keys(EXTERNAL_ADMIN_CONFIG).length > 0;

  const DEFAULT_LAYOUT = { mobileColumns: 1, tabletColumns: 2, desktopColumns: 2 };
  const VERIFIED_BADGE_SVG = `
    <svg class="verified-badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <polygon points="12.00,1.20 13.79,2.98 16.13,2.02 17.11,4.35 19.64,4.36 19.65,6.89 21.98,7.87 21.02,10.21 22.80,12.00 21.02,13.79 21.98,16.13 19.65,17.11 19.64,19.64 17.11,19.65 16.13,21.98 13.79,21.02 12.00,22.80 10.21,21.02 7.87,21.98 6.89,19.65 4.36,19.64 4.35,17.11 2.02,16.13 2.98,13.79 1.20,12.00 2.98,10.21 2.02,7.87 4.35,6.89 4.36,4.36 6.89,4.35 7.87,2.02 10.21,2.98" fill="#1b74e4"></polygon>
      <path d="M7.35 12.2 10.45 15.15 16.85 8.75" fill="none" stroke="#fff" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`;

  const ensureVerifiedBadge = element => {
    if (!element) return;
    if (!element.querySelector(".verified-badge-svg")) element.innerHTML = VERIFIED_BADGE_SVG;
  };

  const getProfileInitials = value => {
    const words = String(value || "Bio Link")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return "BL";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0] || ""}${words[words.length - 1][0] || ""}`.toUpperCase();
  };

  const createInitialsFavicon = (name, primary = "#f39b19", strong = "#d97800") => {
    const initials = getProfileInitials(name);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${strong}"/></linearGradient></defs><circle cx="64" cy="64" r="62" fill="url(#g)"/><text x="64" y="70" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Arial,sans-serif" font-size="44" font-weight="800">${initials}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

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
    footerFontSize: 12,
    outerLightColor: "#fff8ed",
    outerDarkColor: "#16120d",
    innerLightColor: "#fffaf2",
    innerDarkColor: "#221c15",
    outerBackgroundImage: "",
    innerBackgroundImage: "",
    lightBorderColor: "#f39b19",
    darkBorderColor: "#f39b19",
    showDecorations: true,
    showCardBorder: true
  };
  const IS_SERVER_MODE = window.BIO_SERVER_MODE === true;
  const DEFAULT_SERVER_SAVE = {
    enabled: IS_SERVER_MODE,
    endpoint: "api/save-profile.php"
  };
  const DEFAULT_QR_DESIGN = {
    linkPreset: "current-current",
    colorMode: "solid",
    color1: "#111111",
    color2: "#f39b19",
    backgroundColor: "#ffffff",
    gradientDirection: "diagonal"
  };

  const I18N = {
    vi: { code: "VI", flag: "assets/flag-vi.svg", language: "Đổi ngôn ngữ", themeLight: "Chuyển sang giao diện sáng", themeDark: "Chuyển sang giao diện tối", share: "Chia sẻ trang", connect: "Kết nối với tôi", qr: "Mã QR", qrTitle: "Chia sẻ trang Bio", qrDescription: "Quét mã QR hoặc sao chép đường dẫn để mở nhanh trang này.", copy: "Sao chép liên kết", copied: "Đã sao chép liên kết", shareError: "Không thể chia sẻ lúc này", qrAlt: "Mã QR dẫn đến trang Bio", qrCardHint: "Quét mã để kết nối", cacheResetting: "Đang xóa cache Bio...", saveQr: "Lưu ảnh QR", savingQr: "Đang tạo ảnh...", savedQr: "Đã lưu ảnh QR", copyQrImage: "Sao chép ảnh", copyingQrImage: "Đang sao chép...", copiedQrImage: "Đã sao chép ảnh QR", copyQrImageUnsupported: "Trình duyệt chưa hỗ trợ sao chép ảnh; hãy dùng Lưu ảnh QR", currentLink: "Link đang mở", shortLink: "Link rút gọn" },
    ja: { code: "JP", flag: "assets/flag-ja.svg", language: "言語を変更", themeLight: "ライトモードに切り替え", themeDark: "ダークモードに切り替え", share: "ページを共有", connect: "リンク一覧", qr: "QRコード", qrTitle: "Bioページを共有", qrDescription: "QRコードを読み取るか、リンクをコピーしてこのページを開けます。", copy: "リンクをコピー", copied: "リンクをコピーしました", shareError: "現在共有できません", qrAlt: "BioページのQRコード", qrCardHint: "QRコードを読み取って接続", cacheResetting: "Bioキャッシュを削除しています...", saveQr: "QR画像を保存", savingQr: "画像を作成中...", savedQr: "QR画像を保存しました", copyQrImage: "画像をコピー", copyingQrImage: "コピー中...", copiedQrImage: "QR画像をコピーしました", copyQrImageUnsupported: "画像コピーに未対応です。QR画像を保存してください", currentLink: "現在のリンク", shortLink: "短縮リンク" },
    en: { code: "EN", flag: "assets/flag-en.svg", language: "Change language", themeLight: "Switch to light mode", themeDark: "Switch to dark mode", share: "Share page", connect: "Connect with me", qr: "QR code", qrTitle: "Share Bio page", qrDescription: "Scan the QR code or copy the link to open this page.", copy: "Copy link", copied: "Link copied", shareError: "Unable to share right now", qrAlt: "QR code for this Bio page", qrCardHint: "Scan to connect", cacheResetting: "Clearing Bio cache...", saveQr: "Save QR image", savingQr: "Creating image...", savedQr: "QR image saved", copyQrImage: "Copy image", copyingQrImage: "Copying...", copiedQrImage: "QR image copied", copyQrImageUnsupported: "Image clipboard is not supported; use Save QR image", currentLink: "Current link", shortLink: "Short link" }
  };
  let currentLanguage = "vi";
  let adminSessionPassword = "";
  let activeQrUrl = "";
  let activeQrDisplayUrl = "";
  let avatarUploadSourceName = "";
  const FEATURED_LABELS = { vi: "Nổi bật", ja: "おすすめ", en: "Featured" };

  const clampColumns = value => Math.min(3, Math.max(1, Number(value) || 1));
  const clampNumber = (value, min, max, fallback) => Math.min(max, Math.max(min, Number(value) || fallback));


  const SPECIAL_URL_PREFIX = /^(?:https?:|mailto:|tel:|sms:|geo:|intent:|line:|zalo:|fb:|messenger:|tg:|whatsapp:|viber:|skype:|facetime:|facetime-audio:)/i;
  const RELATIVE_URL_PREFIX = /^(?:#|\?|\/|\.\/|\.\.\/)/;
  const normalizeExternalUrl = (value, item = null) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (SPECIAL_URL_PREFIX.test(raw)) return raw;
    if (raw.startsWith("//")) return `https:${raw}`;
    if (RELATIVE_URL_PREFIX.test(raw)) return raw;
    const id = String(item?.id || item?.sourceLinkId || "").toLowerCase();
    const iconName = String(item?.icon || "").toLowerCase();
    if ((id.includes("email") || iconName === "mail") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return `mailto:${raw}`;
    if ((id.includes("phone") || iconName === "phone") && /^\+?[0-9 ()-]{6,}$/.test(raw)) return `tel:${raw.replace(/[ ()-]/g, "")}`;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
    return `https://${raw.replace(/^\/+/, "")}`;
  };

  const profileSlug = String(window.BIO_PROFILE_SLUG || "vinh").toLowerCase();
  const profileDir = String(window.BIO_PROFILE_DIR || (profileSlug === "vinh" ? "" : `${profileSlug}/`));
  const isPrimaryProfile = profileSlug === "vinh";
  const sharedAssets = deepClone(window.BIO_SHARED_ASSETS || {});
  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);

  const applySharedAssetsToSecondaryProfile = cfg => {
    if (isPrimaryProfile) return cfg;
    cfg.profile.favicon = cfg.profile.avatar || "";
    cfg.settings ||= {};
    cfg.settings.appearance ||= { ...DEFAULT_APPEARANCE };

    // Chỉ ảnh icon lớn phụ thuộc tài khoản chính.
    // Avatar, favicon tự theo avatar, nền ngoài và nền trong là riêng từng hồ sơ.
    // Icon bé luôn hiển thị đơn sắc bằng brand icon hoặc SVG, không dùng ảnh màu.
    const linkImages = sharedAssets.linkImages || {};
    (cfg.links || []).forEach(item => {
      if (item?.id && hasOwn(linkImages, item.id)) item.image = linkImages[item.id] || "";
    });
    (cfg.socialIcons || []).forEach(item => { item.image = ""; });
    return cfg;
  };

  const normalizeConfig = input => {
    const cfg = deepClone(input || {});
    cfg.profile ||= {};
    if (typeof cfg.profile.verified !== "boolean") cfg.profile.verified = true;
    const rawAvatar = String(cfg.profile.avatar || "").trim();
    cfg.profile.avatar = rawAvatar && !/^data:image\//i.test(rawAvatar) ? "avatar.png" : rawAvatar;
    cfg.profile.favicon = cfg.profile.avatar || "";
    cfg.profile.badges = Array.isArray(cfg.profile.badges) ? cfg.profile.badges : [];
    while (cfg.profile.badges.length < 2) cfg.profile.badges.push({ enabled: true, icon: "sparkles", text: "" });
    cfg.profile.translations ||= {};
    cfg.profile.badges.forEach(item => {
      if (typeof item.enabled !== "boolean") item.enabled = true;
      item.translations ||= {};
    });
    const legacyAdmin = cfg.admin || {};
    cfg.admin = {
      ...(SYSTEM_CONFIG.adminDefaults || {}),
      ...EXTERNAL_ADMIN_CONFIG,
      ...legacyAdmin
    };
    cfg.admin.logoGestureMode = ["tap-admin-hold-cache", "tap-cache-hold-admin"].includes(cfg.admin.logoGestureMode)
      ? cfg.admin.logoGestureMode
      : "tap-cache-hold-admin";
    cfg.admin.logoTapCount = Math.min(12, Math.max(2, Number(cfg.admin.logoTapCount) || (cfg.admin.logoGestureMode === "tap-cache-hold-admin" ? 2 : 5)));
    cfg.admin.logoHoldSeconds = Math.min(8, Math.max(1, Number(cfg.admin.logoHoldSeconds) || 2));
    cfg.admin.logoRingDelaySeconds = Math.min(
      Math.max(0, cfg.admin.logoHoldSeconds - 0.15),
      Math.max(0, Number(cfg.admin.logoRingDelaySeconds) || 0.6)
    );
    cfg.admin.serverSave = { ...DEFAULT_SERVER_SAVE, ...(cfg.admin.serverSave || {}) };
    cfg.admin.version = SYSTEM_VERSION;
    cfg.admin.mode = IS_SERVER_MODE ? "server" : "embedded";
    cfg.admin.serverSave.enabled = IS_SERVER_MODE;
    cfg.admin.serverSave.endpoint = "api/save-profile.php";
    cfg.settings ||= {};
    cfg.settings.qrUrl = normalizeExternalUrl(cfg.settings.qrUrl);
    cfg.settings.qrDesign = { ...DEFAULT_QR_DESIGN, ...(cfg.settings.qrDesign || {}) };
    // Tương thích V1.6.5: linkMode current/custom được chuyển sang 3 chế độ mới.
    if (!cfg.settings.qrDesign.linkPreset) {
      cfg.settings.qrDesign.linkPreset = cfg.settings.qrDesign.linkMode === "custom" ? "custom-custom" : "current-current";
    }
    cfg.settings.qrDesign.linkPreset = ["current-current", "custom-custom", "current-custom"].includes(cfg.settings.qrDesign.linkPreset)
      ? cfg.settings.qrDesign.linkPreset
      : "current-current";
    delete cfg.settings.qrDesign.linkMode;
    cfg.settings.qrDesign.colorMode = ["solid", "gradient"].includes(cfg.settings.qrDesign.colorMode) ? cfg.settings.qrDesign.colorMode : "solid";
    cfg.settings.qrDesign.gradientDirection = ["horizontal", "vertical", "diagonal", "reverse-diagonal", "radial"].includes(cfg.settings.qrDesign.gradientDirection) ? cfg.settings.qrDesign.gradientDirection : "diagonal";
    cfg.settings.qrDesign.color1 = String(cfg.settings.qrDesign.color1 || "#111111");
    cfg.settings.qrDesign.color2 = String(cfg.settings.qrDesign.color2 || "#f39b19");
    cfg.settings.qrDesign.backgroundColor = String(cfg.settings.qrDesign.backgroundColor || "#ffffff");
    cfg.settings.defaultTheme = ["auto", "light", "dark"].includes(cfg.settings.defaultTheme) ? cfg.settings.defaultTheme : "auto";
    cfg.settings.defaultLanguage = ["auto", "vi", "ja", "en"].includes(cfg.settings.defaultLanguage) ? cfg.settings.defaultLanguage : "auto";
    if (typeof cfg.settings.showLanguageButton !== "boolean") cfg.settings.showLanguageButton = true;
    cfg.settings.announcement ||= { enabled: false, icon: "bell", text: "" };
    cfg.settings.layout = { ...DEFAULT_LAYOUT, ...(cfg.settings.layout || {}) };
    cfg.settings.appearance = { ...DEFAULT_APPEARANCE, ...(cfg.settings.appearance || {}) };
    cfg.settings.layout.mobileColumns = clampColumns(cfg.settings.layout.mobileColumns);
    cfg.settings.layout.tabletColumns = clampColumns(cfg.settings.layout.tabletColumns);
    cfg.settings.layout.desktopColumns = clampColumns(cfg.settings.layout.desktopColumns);
    cfg.links = Array.isArray(cfg.links) ? cfg.links : [];
    cfg.socialIcons = Array.isArray(cfg.socialIcons) ? cfg.socialIcons : [];
    cfg.links.forEach(item => { item.url = normalizeExternalUrl(item.url, item); });
    cfg.socialIcons.forEach(item => { item.url = normalizeExternalUrl(item.url, item); });
    const usedLinkIds = new Set();
    cfg.links.forEach((item, index) => {
      let candidate = String(item.id || `link-${index + 1}`).trim() || `link-${index + 1}`;
      while (usedLinkIds.has(candidate)) candidate = `${candidate}-${index + 1}`;
      item.id = candidate;
      usedLinkIds.add(candidate);
      item.translations ||= {};
      // Từ V12, featured chỉ điều khiển nơ/nhãn nổi bật; không đổi nền toàn bộ nút.
      // Tương thích bản V11: nếu showBadge từng được bật thì chuyển thành nơ nổi bật.
      if (item.featured !== true && item.showBadge === true) item.featured = true;
      item.featured = item.featured === true;
      delete item.showBadge;
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
        item.image = "";
        item.showIconBackground = typeof legacySource.showIconBackground === "boolean" ? legacySource.showIconBackground : !legacySource.image;
        ["ja", "en"].forEach(language => {
          item.translations[language] ||= {};
          item.translations[language].label = legacySource.translations?.[language]?.title || legacySource.title || item.label;
        });
      }
      // V8 chỉ sao chép một lần; các trường vẫn chỉnh thủ công sau khi đồng bộ.
      item.syncFromLink = false;
      if (typeof item.brandIcon !== "string") item.brandIcon = "auto";
      item.image = "";
      if (typeof item.showIconBackground !== "boolean") item.showIconBackground = false;
    });
    return applySharedAssetsToSecondaryProfile(cfg);
  };

  const sourceConfig = normalizeConfig(window.BIO_CONFIG || {});
  const storageKeyBase = `${sourceConfig.admin?.storageKey || "bio-admin-preview"}`;
  const storageKey = `${storageKeyBase}-${profileSlug}`;
  const languageStorageKey = `${storageKey}-language`;
  const profileDataFile = String(window.BIO_PROFILE_DATA_FILE || `${profileDir}profile.js`);
  const adminDataFile = String(window.BIO_LEGACY_ADMIN_DATA_FILE || `${profileDir}admin-config.js`);

  const loadedScripts = new Map();
  const loadScriptOnce = (src, ready) => {
    if (typeof ready === "function" && ready()) return Promise.resolve();
    const absolute = new URL(src, document.baseURI).href;
    if (loadedScripts.has(absolute)) return loadedScripts.get(absolute);
    const promise = new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(script => script.src === absolute);
      if (existing) {
        if (typeof ready !== "function" || ready()) return resolve();
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error(`Không thể tải ${src}`)), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = `${src}${src.includes("?") ? "&" : "?"}v=${encodeURIComponent(SYSTEM_ASSET_VERSION)}`;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Không thể tải ${src}`));
      document.head.appendChild(script);
    });
    loadedScripts.set(absolute, promise);
    return promise;
  };
  const ensureQrLibrary = () => loadScriptOnce(SYSTEM_CONFIG.libraries?.qr || "js/qrcode.min.js", () => typeof window.QRCode === "function");
  const ensureZipLibrary = () => loadScriptOnce(SYSTEM_CONFIG.libraries?.zip || "js/jszip.min.js", () => typeof window.JSZip === "function");

  const isAbsoluteAsset = value => /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(String(value || ""));
  const resolveProfileAsset = value => {
    const source = String(value || "").trim();
    if (!source || isAbsoluteAsset(source)) return source;
    if (/^(?:assets|img|css|js)\//i.test(source)) return source;
    return `${profileDir}${source}`;
  };

  const applyAvatarSource = ({ image, fallback, source, initials, alt = "", onState = null }) => {
    if (!image) return;
    if (fallback) fallback.textContent = initials;
    image.alt = alt;
    const showFallback = () => {
      image.classList.add("is-missing");
      if (fallback) fallback.classList.remove("hidden");
      onState?.(false);
    };
    const showImage = () => {
      image.classList.remove("is-missing");
      if (fallback) fallback.classList.add("hidden");
      onState?.(true);
    };
    image.onload = showImage;
    image.onerror = showFallback;
    if (!source) {
      image.removeAttribute("src");
      showFallback();
      return;
    }
    image.src = source;
  };

  const ensureAvatarFallbackElement = (image, id, className) => {
    let fallback = document.getElementById(id);
    if (fallback || !image?.parentElement) return fallback;
    fallback = document.createElement("span");
    fallback.id = id;
    fallback.className = className;
    fallback.setAttribute("aria-hidden", "true");
    image.parentElement.insertBefore(fallback, image);
    return fallback;
  };

  const ICONS = {
    "arrow-up-right": '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    "archive": '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/>',
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
    "upload-cloud": '<path d="M16 16l-4-4-4 4"/><path d="M12 12v9"/><path d="M20.4 17.5A5 5 0 0 0 18 8.2 7 7 0 0 0 4.3 10.5 4.5 4.5 0 0 0 5.5 19H7"/><path d="M17 19h1.5"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    "grip-vertical": '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>',
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

  const BRAND_ICONS = {
    facebook: { viewBox: "0 0 320 512", body: '<path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4.4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"/>' },
    messenger: { viewBox: "0 0 512 512", body: '<path d="M256.55 8C116.52 8 8 110.34 8 248.57c0 72.3 29.71 134.78 78.07 177.94 8.35 7.51 6.63 11.86 8.05 58.23A19.92 19.92 0 0 0 122 502.31c52.91-23.3 53.59-25.14 62.56-22.7C337.85 521.8 504 423.7 504 248.57 504 110.34 396.59 8 256.55 8zm149.24 185.13-73 115.57a37.37 37.37 0 0 1-53.91 9.93l-58.08-43.47a15 15 0 0 0-18 0l-78.37 59.44c-10.46 7.93-24.16-4.6-17.11-15.67l73-115.57a37.36 37.36 0 0 1 53.91-9.93l58.06 43.46a15 15 0 0 0 18 0l78.41-59.38c10.44-7.98 24.14 4.54 17.09 15.62z"/>' },
    tiktok: { viewBox: "0 0 448 512", body: '<path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z"/>' },
    line: { viewBox: "0 0 512 512", body: '<path d="M311 196.8v81.3c0 2.1-1.6 3.7-3.7 3.7h-13c-1.3 0-2.4-.7-3-1.5L254 230v48.2c0 2.1-1.6 3.7-3.7 3.7h-13c-2.1 0-3.7-1.6-3.7-3.7v-81.3c0-2.1 1.6-3.7 3.7-3.7h12.9c1.1 0 2.4.6 3 1.6l37.3 50.3v-48.2c0-2.1 1.6-3.7 3.7-3.7h13c2.1-.1 3.8 1.6 3.8 3.5zm-93.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 2.1 1.6 3.7 3.7 3.7h13c2.1 0 3.7-1.6 3.7-3.7v-81.3c0-1.9-1.6-3.7-3.7-3.7zm-31.4 68.1h-35.6v-64.4c0-2.1-1.6-3.7-3.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 1 .3 1.8 1 2.5.7.6 1.5 1 2.5 1h52.2c2.1 0 3.7-1.6 3.7-3.7v-13c0-1.9-1.6-3.7-3.5-3.7zm193.7-68.1h-52.3c-1.9 0-3.7 1.6-3.7 3.7v81.3c0 1.9 1.6 3.7 3.7 3.7h52.2c2.1 0 3.7-1.6 3.7-3.7V265c0-2.1-1.6-3.7-3.7-3.7H344v-13.6h35.5c2.1 0 3.7-1.6 3.7-3.7v-13.1c0-2.1-1.6-3.7-3.7-3.7H344v-13.7h35.5c2.1 0 3.7-1.6 3.7-3.7v-13c-.1-1.9-1.7-3.7-3.7-3.7zM512 93.4v326c-.1 51.2-42.1 92.7-93.4 92.6h-326C41.4 511.9-.1 469.8 0 418.6v-326C.1 41.4 42.2-.1 93.4 0h326c51.2.1 92.7 42.1 92.6 93.4zM441.6 233.5c0-83.4-83.7-151.3-186.4-151.3S68.8 150.1 68.8 233.5c0 74.7 66.3 137.4 155.9 149.3 21.8 4.7 19.3 12.7 14.4 42.1-.8 4.7-3.8 18.4 16.1 10.1s107.3-63.2 146.5-108.2c27-29.7 39.9-59.8 39.9-93.1z"/>' },
    youtube: { viewBox: "0 0 576 512", body: '<path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zM232.145 337.591V175.185l142.739 81.205-142.739 81.201z"/>' },
    zalo: { viewBox: "0 0 24 24", body: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M8 8h8l-8 6h8"/>' },
    gmail: { viewBox: "0 0 24 24", body: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 12 14l9-6.5V19H3Z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m3 7.5 9 6.5 9-6.5"/>' }
  };

  const brandIcon = (name, size = 23) => {
    const item = BRAND_ICONS[name];
    if (!item) return icon("globe", size);
    return `<svg class="brand-svg brand-${name}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${item.viewBox}" fill="currentColor" aria-hidden="true">${item.body}</svg>`;
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

  const detectBrandIcon = item => {
    const value = [item?.id, item?.sourceLinkId, item?.label, item?.title, item?.url, item?.icon].filter(Boolean).join(" ").toLowerCase();
    if (value.includes("messenger") || value.includes("m.me/")) return "messenger";
    if (value.includes("facebook") || value.includes("fb.com")) return "facebook";
    if (value.includes("tiktok")) return "tiktok";
    if (value.includes("zalo")) return "zalo";
    if (value.includes("line.me") || /(^|[^a-z])line([^a-z]|$)/.test(value)) return "line";
    if (value.includes("youtube") || value.includes("youtu.be")) return "youtube";
    if (value.includes("gmail") || value.includes("mailto:")) return "gmail";
    return "";
  };

  const resolveBrandIcon = item => {
    if (item?.brandIcon === "none") return "";
    if (item?.brandIcon && item.brandIcon !== "auto" && BRAND_ICONS[item.brandIcon]) return item.brandIcon;
    return detectBrandIcon(item);
  };

  const copySocialFromLink = (target, source) => {
    if (!target || !source) return false;
    target.sourceLinkId = source.id || "";
    target.label = source.title || target.label || "Liên kết";
    target.url = source.url || target.url || "#";
    target.icon = source.icon || target.icon || "globe";
    target.image = "";
    target.brandIcon = detectBrandIcon(source) || "none";
    target.showIconBackground = target.brandIcon !== "none" ? false : (typeof source.showIconBackground === "boolean" ? source.showIconBackground : !source.image);
    target.translations ||= {};
    ["ja", "en"].forEach(language => {
      target.translations[language] ||= {};
      target.translations[language].label = source.translations?.[language]?.title || source.title || target.label;
    });
    target.syncFromLink = false;
    return true;
  };

  const resolveSocialItem = item => {
    const resolved = { ...item, label: localizedValue(item, "label", "Liên kết") };
    const source = resolved.sourceLinkId ? findSourceLink(resolved.sourceLinkId, config.links || []) : null;
    if (source?.image && resolved.image && resolved.image === source.image) resolved.image = "";
    return resolved;
  };

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
  let orderEditorType = "links";
  let orderDragState = null;

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
    const initials = getProfileInitials(name);
    const appearance = config.settings?.appearance || DEFAULT_APPEARANCE;
    const fallbackFavicon = createInitialsFavicon(name, appearance.primaryColor, appearance.primaryStrongColor);
    const avatarSource = profile.avatar ? resolveProfileAsset(profile.avatar) : "";
    const faviconLink = $("#faviconLink");
    const appleIcon = $("#appleTouchIcon");
    if (faviconLink) faviconLink.href = avatarSource || fallbackFavicon;
    if (appleIcon) appleIcon.href = avatarSource || fallbackFavicon;
    applyAvatarSource({
      image: $("#profileAvatar"),
      fallback: ensureAvatarFallbackElement($("#profileAvatar"), "profileAvatarInitials", "avatar-initials"),
      source: avatarSource,
      initials,
      alt: `Ảnh đại diện ${name}`,
      onState: valid => {
        if (valid) return;
        if (faviconLink) faviconLink.href = fallbackFavicon;
        if (appleIcon) appleIcon.href = fallbackFavicon;
      }
    });
    const verified = $(".name-line .verified");
    if (verified) {
      ensureVerifiedBadge(verified);
      verified.classList.toggle("hidden", profile.verified === false);
    }
    document.title = `${name} | Bio Link`;

    const badges = Array.isArray(profile.badges)
      ? profile.badges.filter(item => item.enabled !== false && localizedValue(item, "text", ""))
      : [];
    $("#profileBadges").innerHTML = badges.map(item => `
      <span class="badge">${icon(item.icon, 15)}<span>${escapeHtml(localizedValue(item, "text", ""))}</span></span>
    `).join("");
  };

  const hexToRgba = (hex, alpha, fallback) => {
    const value = String(hex || "").trim().replace("#", "");
    const normalized = value.length === 3 ? value.split("").map(char => char + char).join("") : value;
    if (!/^[0-9a-f]{6}$/i.test(normalized)) return fallback;
    const number = Number.parseInt(normalized, 16);
    return `rgba(${number >> 16}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
  };

  const cssBackgroundImage = value => {
    const source = String(value || "").trim();
    if (!source) return "none";
    const safe = source.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]/g, "");
    return `url("${safe}")`;
  };

  const applyAppearanceAndLayout = () => {
    const appearance = config.settings?.appearance || DEFAULT_APPEARANCE;
    const layout = config.settings?.layout || DEFAULT_LAYOUT;
    const root = document.documentElement;
    root.style.setProperty("--custom-primary", appearance.primaryColor || DEFAULT_APPEARANCE.primaryColor);
    root.style.setProperty("--custom-primary-strong", appearance.primaryStrongColor || DEFAULT_APPEARANCE.primaryStrongColor);
    root.style.setProperty("--light-hover-bg", hexToRgba(appearance.primaryColor || DEFAULT_APPEARANCE.primaryColor, .09, "rgba(243, 155, 25, .09)"));
    root.style.setProperty("--light-hover-border", hexToRgba(appearance.primaryColor || DEFAULT_APPEARANCE.primaryColor, .72, "rgba(243, 155, 25, .72)"));
    root.style.setProperty("--light-shine", hexToRgba(appearance.primaryStrongColor || DEFAULT_APPEARANCE.primaryStrongColor, .24, "rgba(217, 120, 0, .24)"));
    root.style.setProperty("--light-hover-shadow", hexToRgba(appearance.primaryStrongColor || DEFAULT_APPEARANCE.primaryStrongColor, .20, "rgba(217, 120, 0, .20)"));
    root.style.setProperty("--custom-light-text", appearance.lightTextColor || DEFAULT_APPEARANCE.lightTextColor);
    root.style.setProperty("--custom-light-muted", appearance.lightMutedColor || DEFAULT_APPEARANCE.lightMutedColor);
    root.style.setProperty("--custom-dark-text", appearance.darkTextColor || DEFAULT_APPEARANCE.darkTextColor);
    root.style.setProperty("--custom-dark-muted", appearance.darkMutedColor || DEFAULT_APPEARANCE.darkMutedColor);
    root.style.setProperty("--custom-light-outer-bg", appearance.outerLightColor || DEFAULT_APPEARANCE.outerLightColor);
    root.style.setProperty("--custom-dark-outer-bg", appearance.outerDarkColor || DEFAULT_APPEARANCE.outerDarkColor);
    root.style.setProperty("--custom-light-inner-bg", appearance.innerLightColor || DEFAULT_APPEARANCE.innerLightColor);
    root.style.setProperty("--custom-dark-inner-bg", appearance.innerDarkColor || DEFAULT_APPEARANCE.innerDarkColor);
    root.style.setProperty("--outer-background-image", cssBackgroundImage(appearance.outerBackgroundImage));
    root.style.setProperty("--inner-background-image", cssBackgroundImage(appearance.innerBackgroundImage));
    root.style.setProperty("--custom-light-card-border", appearance.lightBorderColor || appearance.primaryColor || DEFAULT_APPEARANCE.lightBorderColor);
    root.style.setProperty("--custom-dark-card-border", appearance.darkBorderColor || appearance.primaryColor || DEFAULT_APPEARANCE.darkBorderColor);
    root.style.setProperty("--bio-card-border", appearance.showCardBorder === false ? "transparent" : "var(--theme-card-border)");
    root.dataset.decorations = appearance.showDecorations ? "show" : "hide";
    root.dataset.cardBorder = appearance.showCardBorder === false ? "hide" : "show";
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
      const customBadge = localizedValue(item, "badge", "");
      const badge = item.featured ? (customBadge || FEATURED_LABELS[currentLanguage] || FEATURED_LABELS.en) : "";
      const hasImage = !!item.image;
      const showBackground = typeof item.showIconBackground === "boolean" ? item.showIconBackground : !hasImage;
      return `
      <a class="link-card" href="${escapeAttribute(item.url || "#")}" ${target}>
        <span class="link-icon${hasImage ? " has-image" : ""}${showBackground ? " with-bg" : " no-bg"}">${media(item, "link-image")}</span>
        <span class="link-copy">
          <span class="link-title">${escapeHtml(title)}${badge ? `<span class="tag-new" aria-label="${escapeAttribute(badge)}">${escapeHtml(badge)}</span>` : ""}</span>
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
      const brandKey = resolveBrandIcon(item);
      const hasBrand = !!brandKey;
      const showBackground = typeof item.showIconBackground === "boolean" ? item.showIconBackground : false;
      const content = hasBrand ? brandIcon(brandKey, 23) : icon(item.icon || "globe", 23);
      return `<a class="social-button${hasBrand ? " has-brand" : " has-system-icon"}${showBackground ? " with-bg" : " no-bg"}" href="${escapeAttribute(item.url || "#")}" aria-label="${escapeAttribute(item.label)}" title="${escapeAttribute(item.label)}" ${target}>${content}</a>`;
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
    updateAvatarGestureTitle?.();
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

  const detectDeviceLanguage = () => {
    const deviceLanguage = String(
      (Array.isArray(navigator.languages) && navigator.languages[0]) ||
      navigator.language ||
      navigator.userLanguage ||
      ""
    ).toLowerCase();

    if (deviceLanguage === "vi" || deviceLanguage.startsWith("vi-")) return "vi";
    if (deviceLanguage === "ja" || deviceLanguage.startsWith("ja-")) return "ja";
    return "en";
  };

  const resolveInitialLanguage = () => {
    const saved = safeStorageGet(languageStorageKey);
    if (["vi", "ja", "en"].includes(saved)) return saved;

    const configured = config.settings?.defaultLanguage || "auto";
    if (["vi", "ja", "en"].includes(configured)) return configured;
    return detectDeviceLanguage();
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
    const copyQrImageButton = $("#copyQrImageButton");
    if (copyQrImageButton) copyQrImageButton.innerHTML = `${icon("copy", 18)}<span>${text.copyQrImage}</span>`;
    const downloadQrButton = $("#downloadQrCardButton");
    if (downloadQrButton) downloadQrButton.innerHTML = `${icon("download", 18)}<span>${text.saveQr}</span>`;
    const qrCardHint = $("#qrCardHint");
    if (qrCardHint) qrCardHint.textContent = text.qrCardHint;
    const qrTitle = $("#qrTitle");
    if (qrTitle) qrTitle.textContent = text.qrTitle;
    const qrDescription = $("#qrDescription");
    if (qrDescription) qrDescription.textContent = text.qrDescription;
    $$('[data-language]').forEach(button => button.classList.toggle("active", button.dataset.language === currentLanguage));
  };

  const setLanguage = language => {
    currentLanguage = ["vi", "ja", "en"].includes(language) ? language : "vi";
    safeStorageSet(languageStorageKey, currentLanguage);
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

  const getCurrentPageUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("_bio_refresh");
    return url.href;
  };

  const getShortUrl = () => {
    const custom = String(config.settings?.qrUrl || "").trim();
    return custom ? new URL(custom, window.location.href).href : "";
  };

  const getQrLinkSelection = () => {
    const current = getCurrentPageUrl();
    const custom = getShortUrl();
    const preset = config.settings?.qrDesign?.linkPreset || "current-current";
    if (preset === "custom-custom" && custom) return { qrUrl: custom, displayUrl: custom, preset };
    if (preset === "current-custom" && custom) return { qrUrl: current, displayUrl: custom, preset };
    return { qrUrl: current, displayUrl: current, preset: "current-current" };
  };

  const sharePage = async () => {
    const { displayUrl } = getQrLinkSelection();
    const data = { title: document.title, text: config.profile?.bio || "Xem các liên kết của tôi", url: displayUrl };
    try {
      if (navigator.share) await navigator.share(data);
      else await copyPageUrl(data.url);
    } catch (error) {
      if (error?.name !== "AbortError") showToast((I18N[currentLanguage] || I18N.vi).shareError);
    }
  };

  const copyPageUrl = async value => {
    const target = String(value || activeQrDisplayUrl || getQrLinkSelection().displayUrl);
    try {
      await navigator.clipboard.writeText(target);
      showToast((I18N[currentLanguage] || I18N.vi).copied);
    } catch {
      const input = document.createElement("textarea");
      input.value = target;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast((I18N[currentLanguage] || I18N.vi).copied);
    }
  };

  const hexToRgb = value => {
    const source = String(value || "#000000").trim().replace(/^#/, "");
    const hex = source.length === 3 ? source.split("").map(ch => ch + ch).join("") : source.padEnd(6, "0").slice(0, 6);
    const number = Number.parseInt(hex, 16);
    return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
  };

  const interpolateRgb = (start, end, ratio) => ({
    r: Math.round(start.r + (end.r - start.r) * ratio),
    g: Math.round(start.g + (end.g - start.g) * ratio),
    b: Math.round(start.b + (end.b - start.b) * ratio)
  });

  const getGradientRatio = (x, y, width, height, direction) => {
    if (direction === "horizontal") return x / Math.max(1, width - 1);
    if (direction === "vertical") return y / Math.max(1, height - 1);
    if (direction === "reverse-diagonal") return ((width - 1 - x) + y) / Math.max(1, width + height - 2);
    if (direction === "radial") {
      const cx = (width - 1) / 2;
      const cy = (height - 1) / 2;
      return Math.min(1, Math.hypot(x - cx, y - cy) / Math.max(1, Math.hypot(cx, cy)));
    }
    return (x + y) / Math.max(1, width + height - 2);
  };

  const colorizeQrCanvas = canvas => {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    // QRCode tạo canvas đen/trắng một lần. Hàm hoàn thiện được gọi lặp lại để
    // chờ trình duyệt, vì vậy không được phân loại lại các pixel đã pha màu.
    // Nếu tô lần hai, những màu có độ sáng > 128 sẽ bị hiểu nhầm là nền trắng,
    // tạo thành mảng tam giác bị mất ở cuối hướng gradient.
    if (canvas.dataset.bioQrColorized === "1") return;
    const design = config.settings?.qrDesign || DEFAULT_QR_DESIGN;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;
    const color1 = hexToRgb(design.color1);
    const color2 = hexToRgb(design.color2);
    const background = hexToRgb(design.backgroundColor);
    const gradient = design.colorMode === "gradient";
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const index = (y * canvas.width + x) * 4;
        const luminance = (data[index] + data[index + 1] + data[index + 2]) / 3;
        const isDark = luminance < 128 && data[index + 3] > 0;
        const color = isDark
          ? (gradient ? interpolateRgb(color1, color2, getGradientRatio(x, y, canvas.width, canvas.height, design.gradientDirection)) : color1)
          : background;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    canvas.dataset.bioQrColorized = "1";
  };

  const formatQrDisplayUrl = value => {
    try {
      const parsed = new URL(value);
      return `${parsed.host}${parsed.pathname}${parsed.search}`;
    } catch {
      return String(value || "");
    }
  };

  const renderQrCode = () => {
    const selected = getQrLinkSelection();
    activeQrUrl = selected.qrUrl;
    activeQrDisplayUrl = selected.displayUrl;
    const qrCanvas = $("#qrCanvas");
    const text = I18N[currentLanguage] || I18N.vi;
    qrCanvas.innerHTML = "";
    if (typeof window.QRCode !== "function") {
      qrCanvas.innerHTML = `<span class="qr-error">Không thể tạo mã QR</span>`;
      return;
    }
    new window.QRCode(qrCanvas, {
      text: activeQrUrl,
      width: 520,
      height: 520,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.H
    });
    const generatedCanvas = qrCanvas.querySelector("canvas");
    const generatedImage = qrCanvas.querySelector("img");
    const finalizeQrCanvas = () => {
      if (generatedCanvas) {
        generatedCanvas.setAttribute("aria-label", text.qrAlt);
        generatedCanvas.style.setProperty("display", "block", "important");
        generatedCanvas.style.setProperty("width", "100%", "important");
        generatedCanvas.style.setProperty("height", "100%", "important");
        colorizeQrCanvas(generatedCanvas);
      }
      if (generatedImage) generatedImage.style.setProperty("display", "none", "important");
    };
    qrCanvas.style.setProperty("--qr-background", config.settings?.qrDesign?.backgroundColor || "#ffffff");
    finalizeQrCanvas();
    requestAnimationFrame(finalizeQrCanvas);
    setTimeout(finalizeQrCanvas, 80);
    const qrUrl = $("#qrCardUrl");
    if (qrUrl) qrUrl.textContent = formatQrDisplayUrl(activeQrDisplayUrl);
  };

  const openQrModal = async () => {
    const modal = $("#qrModal");
    const text = I18N[currentLanguage] || I18N.vi;
    const profile = config.profile || {};
    const profileName = localizedValue(profile, "name", "Bio Link");
    const avatar = profile.avatar ? resolveProfileAsset(profile.avatar) : "";
    const qrAvatar = $("#qrProfileAvatar");
    applyAvatarSource({
      image: qrAvatar,
      fallback: ensureAvatarFallbackElement(qrAvatar, "qrProfileAvatarInitials", "qr-avatar-initials"),
      source: avatar,
      initials: getProfileInitials(profileName),
      alt: profileName
    });
    const qrName = $("#qrProfileName");
    if (qrName) qrName.textContent = profileName;
    const qrHandle = $("#qrProfileHandle");
    if (qrHandle) qrHandle.textContent = profile.handle || "";
    const qrVerified = $("#qrVerified");
    if (qrVerified) {
      ensureVerifiedBadge(qrVerified);
      qrVerified.classList.toggle("hidden", profile.verified === false);
    }
    const qrHint = $("#qrCardHint");
    if (qrHint) qrHint.textContent = text.qrCardHint;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const qrCanvas = $("#qrCanvas");
    if (qrCanvas) qrCanvas.innerHTML = `<span class="qr-loading">Đang tạo mã QR...</span>`;
    try {
      await ensureQrLibrary();
      renderQrCode();
    } catch (error) {
      console.error(error);
      if (qrCanvas) qrCanvas.innerHTML = `<span class="qr-error">Không thể tạo mã QR</span>`;
    }
  };

  const roundedRectPath = (context, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  };

  const drawVerifiedBadge = (context, cx, cy, radius) => {
    context.save();
    context.fillStyle = "#1b74e4";
    context.beginPath();
    const points = 32;
    for (let i = 0; i < points; i += 1) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / points;
      const r = i % 2 === 0 ? radius : radius * .84;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.closePath();
    context.fill();
    context.strokeStyle = "#fff";
    context.lineWidth = Math.max(3, radius * .18);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(cx - radius * .42, cy);
    context.lineTo(cx - radius * .1, cy + radius * .3);
    context.lineTo(cx + radius * .48, cy - radius * .34);
    context.stroke();
    context.restore();
  };

  const loadCanvasImage = source => new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    if (/^https?:/i.test(source)) image.crossOrigin = "anonymous";
    image.src = source;
  });

  const drawCircularImage = (context, image, cx, cy, size) => {
    context.save();
    context.beginPath();
    context.arc(cx, cy, size / 2, 0, Math.PI * 2);
    context.clip();
    const ratio = Math.max(size / image.naturalWidth, size / image.naturalHeight);
    const width = image.naturalWidth * ratio;
    const height = image.naturalHeight * ratio;
    context.drawImage(image, cx - width / 2, cy - height / 2, width, height);
    context.restore();
  };

  const truncateCanvasText = (context, text, maxWidth) => {
    let value = String(text || "");
    if (context.measureText(value).width <= maxWidth) return value;
    while (value.length > 1 && context.measureText(`${value}…`).width > maxWidth) value = value.slice(0, -1);
    return `${value}…`;
  };

  const createQrCardImageBlob = async () => {
    await ensureQrLibrary();
    const qrSource = $("#qrCanvas canvas");
    if (!(qrSource instanceof HTMLCanvasElement)) throw new Error("QR chưa sẵn sàng");
    const profile = config.profile || {};
    const profileName = localizedValue(profile, "name", "Bio Link");
    const handle = profile.handle || "";
    const avatarSource = profile.avatar ? resolveProfileAsset(profile.avatar) : "";
    const isDark = document.documentElement.dataset.theme === "dark";
    const primary = config.settings?.appearance?.primaryColor || "#f39b19";
    const width = 900;
    const height = 1120;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    const cardGradient = context.createLinearGradient(0, 0, width, height);
    if (isDark) {
      cardGradient.addColorStop(0, "#2a2118");
      cardGradient.addColorStop(.58, "#18130e");
      cardGradient.addColorStop(1, "#0e0b08");
    } else {
      cardGradient.addColorStop(0, "#fffdf8");
      cardGradient.addColorStop(1, "#fff1d6");
    }
    roundedRectPath(context, 8, 8, width - 16, height - 16, 52);
    context.fillStyle = cardGradient;
    context.fill();
    context.strokeStyle = primary;
    context.lineWidth = 3;
    context.stroke();
    context.save();
    roundedRectPath(context, 8, 8, width - 16, height - 16, 52);
    context.clip();
    context.globalAlpha = isDark ? .16 : .17;
    context.fillStyle = primary;
    context.beginPath(); context.arc(width - 65, 60, 190, 0, Math.PI * 2); context.fill();
    context.globalAlpha = isDark ? .1 : .12;
    context.beginPath(); context.arc(45, height - 20, 215, 0, Math.PI * 2); context.fill();
    context.globalAlpha = isDark ? .2 : .18;
    for (let y = 28; y < height; y += 28) {
      for (let x = 28; x < width; x += 28) {
        if ((x + y) % 84 !== 0) continue;
        context.beginPath(); context.arc(x, y, 1.3, 0, Math.PI * 2); context.fill();
      }
    }
    context.restore();
    const avatarY = 120;
    try {
      const avatarImage = await loadCanvasImage(avatarSource);
      drawCircularImage(context, avatarImage, width / 2, avatarY, 132);
    } catch {
      context.fillStyle = primary;
      context.beginPath(); context.arc(width / 2, avatarY, 66, 0, Math.PI * 2); context.fill();
      context.fillStyle = "#fff";
      context.font = "800 52px 'Be Vietnam Pro', system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(getProfileInitials(profileName), width / 2, avatarY + 2);
    }
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    context.fillStyle = isDark ? "#fff8ef" : "#2c2118";
    context.font = "800 42px 'Be Vietnam Pro', system-ui, sans-serif";
    const name = truncateCanvasText(context, profileName, 650);
    const nameWidth = context.measureText(name).width;
    const nameY = 235;
    context.fillText(name, width / 2, nameY);
    if (profile.verified !== false) drawVerifiedBadge(context, width / 2 + nameWidth / 2 + 31, nameY - 15, 21);
    context.fillStyle = isDark ? primary : (config.settings?.appearance?.primaryStrongColor || "#d97800");
    context.font = "750 27px 'Be Vietnam Pro', system-ui, sans-serif";
    context.fillText(truncateCanvasText(context, handle, 650), width / 2, 278);
    const qrBoxX = 126;
    const qrBoxY = 325;
    const qrBoxSize = 648;
    roundedRectPath(context, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 44);
    context.fillStyle = config.settings?.qrDesign?.backgroundColor || "#ffffff";
    context.shadowColor = isDark ? "rgba(0,0,0,.42)" : "rgba(55,34,8,.16)";
    context.shadowBlur = 30;
    context.shadowOffsetY = 12;
    context.fill();
    context.shadowColor = "transparent";
    context.drawImage(qrSource, qrBoxX + 34, qrBoxY + 34, qrBoxSize - 68, qrBoxSize - 68);
    const text = I18N[currentLanguage] || I18N.vi;
    context.fillStyle = isDark ? "#f2d29a" : "#5c3d17";
    context.font = "800 25px 'Be Vietnam Pro', system-ui, sans-serif";
    context.fillText(text.qrCardHint, width / 2, 1030);
    context.fillStyle = isDark ? "#b9a78f" : "#8a6b46";
    context.font = "650 22px 'Be Vietnam Pro', system-ui, sans-serif";
    const displayUrl = formatQrDisplayUrl(activeQrDisplayUrl || getQrLinkSelection().displayUrl);
    context.fillText(truncateCanvasText(context, displayUrl, 720), width / 2, 1072);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png", 1));
    if (!blob) throw new Error("Không thể tạo ảnh PNG");
    return { blob, fileName: `${getPreferredExportBaseName()}-qr-card.png`, profileName };
  };

  const copyQrCardImage = async () => {
    const button = $("#copyQrImageButton");
    const text = I18N[currentLanguage] || I18N.vi;
    const original = button?.innerHTML || "";
    if (!window.isSecureContext || !navigator.clipboard?.write || typeof window.ClipboardItem !== "function") {
      showToast(text.copyQrImageUnsupported);
      return;
    }
    if (button) {
      button.disabled = true;
      button.innerHTML = `${icon("copy", 18)}<span>${text.copyingQrImage}</span>`;
    }
    try {
      const { blob } = await createQrCardImageBlob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast(text.copiedQrImage);
    } catch (error) {
      console.error(error);
      showToast(error?.message || text.copyQrImageUnsupported);
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = original || `${icon("copy", 18)}<span>${text.copyQrImage}</span>`;
      }
    }
  };

  const downloadQrCard = async () => {
    const button = $("#downloadQrCardButton");
    const text = I18N[currentLanguage] || I18N.vi;
    const original = button?.innerHTML || "";
    if (button) {
      button.disabled = true;
      button.innerHTML = `${icon("download", 18)}<span>${text.savingQr}</span>`;
    }
    try {
      const { blob, fileName, profileName } = await createQrCardImageBlob();
      const qrFile = new File([blob], fileName, { type: "image/png" });
      const isIOSDevice = /iP(?:hone|ad|od)/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const canShareFile = isIOSDevice &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [qrFile] });
      if (canShareFile) {
        // iPhone/iPad cần bảng chia sẻ để lưu ảnh vào Photos.
        await navigator.share({ files: [qrFile], title: profileName });
      } else {
        // Windows, macOS, Android và trình duyệt desktop: tải PNG trực tiếp.
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      }
      showToast(text.savedQr);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(error);
        showToast(error.message || "Không thể lưu ảnh QR");
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = original || `${icon("download", 18)}<span>${text.saveQr}</span>`;
      }
    }
  };

  const closeQrModal = () => {
    const modal = $("#qrModal");
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const TOUCH_LINK_SELECTOR = ".link-card, .social-button";
  const LONG_PRESS_DELAY = 560;
  const TAP_EFFECT_DURATION = 520;
  const MOVE_CANCEL_DISTANCE = 14;
  let touchInteraction = null;
  let blockedClickTarget = null;
  let blockedClickUntil = 0;

  const clearTouchState = (element, keepHeld = false) => {
    if (!element) return;
    element.classList.remove("is-touch-active");
    if (!keepHeld) element.classList.remove("is-touch-held");
  };

  const clearHeldTouchEffects = except => {
    $$(TOUCH_LINK_SELECTOR).forEach(element => {
      if (element !== except) element.classList.remove("is-touch-held", "is-touch-active");
    });
  };

  const openTouchLink = element => {
    const href = element?.getAttribute("href");
    if (!href || href === "#") return;
    // Mobile mở sau khi vệt sáng hoàn tất. Dùng cùng tab để trình duyệt không
    // chặn điều hướng do lệnh mở xảy ra sau thời gian chờ hiệu ứng.
    window.location.assign(href);
  };

  const cancelTouchInteraction = (keepHeld = false) => {
    if (!touchInteraction) return;
    clearTimeout(touchInteraction.longPressTimer);
    clearTouchState(touchInteraction.element, keepHeld);
    touchInteraction = null;
  };

  const setupPublicTouchInteractions = () => {
    document.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse" || !event.isPrimary) return;
      const element = event.target.closest(TOUCH_LINK_SELECTOR);
      clearHeldTouchEffects(element);
      if (!element) return;

      cancelTouchInteraction();
      element.classList.remove("is-touch-held", "is-touch-active");
      // Buộc trình duyệt khởi động lại animation khi chạm liên tiếp cùng nút.
      void element.offsetWidth;
      element.classList.add("is-touch-active");

      const state = {
        element,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startedAt: performance.now(),
        moved: false,
        longPressed: false,
        longPressTimer: 0
      };

      state.longPressTimer = window.setTimeout(() => {
        if (touchInteraction !== state || state.moved) return;
        state.longPressed = true;
        element.classList.remove("is-touch-active");
        element.classList.add("is-touch-held");
        blockedClickTarget = element;
        blockedClickUntil = Date.now() + 1400;
        if (navigator.vibrate) navigator.vibrate(12);
      }, LONG_PRESS_DELAY);

      touchInteraction = state;
    }, { passive: true });

    document.addEventListener("pointermove", event => {
      const state = touchInteraction;
      if (!state || event.pointerId !== state.pointerId) return;
      const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
      if (distance <= MOVE_CANCEL_DISTANCE) return;
      state.moved = true;
      clearTimeout(state.longPressTimer);
      clearTouchState(state.element);
    }, { passive: true });

    document.addEventListener("pointerup", event => {
      const state = touchInteraction;
      if (!state || event.pointerId !== state.pointerId) return;
      clearTimeout(state.longPressTimer);
      touchInteraction = null;

      blockedClickTarget = state.element;
      blockedClickUntil = Date.now() + 1600;

      if (state.moved) {
        clearTouchState(state.element);
        return;
      }

      if (state.longPressed) {
        clearTouchState(state.element, true);
        return;
      }

      const elapsed = performance.now() - state.startedAt;
      const remaining = Math.max(80, TAP_EFFECT_DURATION - elapsed);
      window.setTimeout(() => {
        clearTouchState(state.element);
        openTouchLink(state.element);
      }, remaining);
    }, { passive: true });

    document.addEventListener("pointercancel", event => {
      if (touchInteraction?.pointerId === event.pointerId) cancelTouchInteraction();
    }, { passive: true });

    document.addEventListener("click", event => {
      const element = event.target.closest(TOUCH_LINK_SELECTOR);
      if (!element) return;
      if (element === blockedClickTarget && Date.now() < blockedClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    document.addEventListener("contextmenu", event => {
      if (event.target.closest(".page-shell, #qrModal")) event.preventDefault();
    });
    document.addEventListener("selectstart", event => {
      if (event.target.closest(".page-shell, #qrModal")) event.preventDefault();
    });
    document.addEventListener("dragstart", event => {
      if (event.target.closest(".page-shell, #qrModal")) event.preventDefault();
    });
  };


  const clearBioClientCache = async () => {
    const avatar = $(".avatar-wrap");
    avatar?.classList.remove("is-cache-pressing");
    avatar?.classList.add("is-cache-resetting");
    showToast((I18N[currentLanguage] || I18N.vi).cacheResetting);

    const removeBioKeys = storage => {
      try {
        const keys = [];
        for (let index = 0; index < storage.length; index += 1) {
          const key = storage.key(index);
          if (key) keys.push(key);
        }
        keys.forEach(key => {
          if (key === "bio-theme" || key.includes("vinh-bio") || key.includes("bio-link") || key.includes("bio-manager")) storage.removeItem(key);
        });
      } catch { /* storage có thể bị chặn */ }
    };

    removeBioKeys(window.localStorage);
    removeBioKeys(window.sessionStorage);

    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.filter(name => /bio/i.test(name)).map(name => caches.delete(name)));
      }
    } catch { /* Cache Storage không khả dụng */ }

    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.filter(item => {
          try { return new URL(item.scope).pathname.includes("/bio/"); }
          catch { return false; }
        }).map(item => item.unregister()));
      }
    } catch { /* Không có quyền quản lý service worker */ }

    await new Promise(resolve => setTimeout(resolve, 260));
    const refreshUrl = new URL(window.location.href);
    refreshUrl.searchParams.set("_bio_refresh", Date.now().toString());
    window.location.replace(refreshUrl.href);
  };

  let avatarGestureState = null;
  let avatarTapCount = 0;
  let avatarTapTimer = 0;
  let suppressAvatarClickUntil = 0;

  const getLogoGestureSettings = () => {
    const admin = config.admin || {};
    const mode = ["tap-admin-hold-cache", "tap-cache-hold-admin"].includes(admin.logoGestureMode)
      ? admin.logoGestureMode
      : "tap-cache-hold-admin";
    const holdMs = Math.round(clampNumber(admin.logoHoldSeconds, 1, 8, 2) * 1000);
    const ringDelayMs = Math.min(
      Math.max(0, holdMs - 150),
      Math.round(clampNumber(admin.logoRingDelaySeconds, 0, 2, 0.6) * 1000)
    );
    const tapCount = Math.round(clampNumber(admin.logoTapCount, 2, 12, mode === "tap-cache-hold-admin" ? 2 : 5));
    return { mode, holdMs, ringDelayMs, tapCount };
  };

  const updateAvatarGestureTitle = () => {
    const avatar = $(".avatar-wrap");
    if (!avatar) return;
    const { mode, holdMs, tapCount } = getLogoGestureSettings();
    const seconds = (holdMs / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 });
    avatar.title = mode === "tap-cache-hold-admin"
      ? `Nhấn ${tapCount} lần để xóa cache · giữ ${seconds} giây để mở Admin`
      : `Nhấn ${tapCount} lần để mở Admin · giữ ${seconds} giây để xóa cache`;
  };

  const cancelAvatarGesture = () => {
    const state = avatarGestureState;
    if (!state) return;
    clearTimeout(state.ringTimer);
    clearTimeout(state.actionTimer);
    state.element.classList.remove("is-cache-pressing");
    avatarGestureState = null;
  };

  const performAvatarTapAction = async mode => {
    if (mode === "tap-cache-hold-admin") {
      suppressAvatarClickUntil = Date.now() + 1800;
      if (navigator.vibrate) navigator.vibrate(18);
      await clearBioClientCache();
      return;
    }
    openAdminLogin();
  };

  const performAvatarHoldAction = async mode => {
    suppressAvatarClickUntil = Date.now() + 1800;
    if (navigator.vibrate) navigator.vibrate([18, 35, 18]);
    if (mode === "tap-cache-hold-admin") {
      openAdminLogin();
      return;
    }
    await clearBioClientCache();
  };

  const registerAvatarTap = () => {
    const { mode, tapCount } = getLogoGestureSettings();
    avatarTapCount += 1;
    clearTimeout(avatarTapTimer);
    avatarTapTimer = window.setTimeout(() => { avatarTapCount = 0; }, config.admin?.tapTimeout || 2500);
    if (avatarTapCount < tapCount) return;
    avatarTapCount = 0;
    clearTimeout(avatarTapTimer);
    void performAvatarTapAction(mode);
  };

  const setupAvatarGestures = () => {
    const avatar = $(".avatar-wrap");
    if (!avatar) return;
    updateAvatarGestureTitle();

    avatar.addEventListener("pointerdown", event => {
      if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
      cancelAvatarGesture();
      const settings = getLogoGestureSettings();
      const state = {
        element: avatar,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false,
        holdTriggered: false,
        ringTimer: 0,
        actionTimer: 0,
        settings
      };
      avatar.classList.remove("is-cache-resetting", "is-cache-pressing");
      avatar.style.setProperty("--cache-progress-duration", `${Math.max(150, settings.holdMs - settings.ringDelayMs)}ms`);
      state.ringTimer = window.setTimeout(() => {
        if (avatarGestureState !== state || state.moved || state.holdTriggered) return;
        avatar.classList.add("is-cache-pressing");
      }, settings.ringDelayMs);
      state.actionTimer = window.setTimeout(() => {
        if (avatarGestureState !== state || state.moved) return;
        state.holdTriggered = true;
        avatar.classList.remove("is-cache-pressing");
        avatarGestureState = null;
        void performAvatarHoldAction(settings.mode);
      }, settings.holdMs);
      avatarGestureState = state;
      try { avatar.setPointerCapture(event.pointerId); } catch { /* không hỗ trợ */ }
    }, { passive: true });

    avatar.addEventListener("pointermove", event => {
      const state = avatarGestureState;
      if (!state || event.pointerId !== state.pointerId) return;
      if (Math.hypot(event.clientX - state.x, event.clientY - state.y) <= 13) return;
      state.moved = true;
      cancelAvatarGesture();
    }, { passive: true });

    avatar.addEventListener("pointerup", event => {
      const state = avatarGestureState;
      if (!state || event.pointerId !== state.pointerId) return;
      const shouldTap = !state.moved && !state.holdTriggered;
      cancelAvatarGesture();
      try { avatar.releasePointerCapture(event.pointerId); } catch { /* không hỗ trợ */ }
      if (shouldTap) registerAvatarTap();
    }, { passive: true });

    avatar.addEventListener("pointercancel", cancelAvatarGesture, { passive: true });
    avatar.addEventListener("lostpointercapture", cancelAvatarGesture, { passive: true });
    avatar.addEventListener("contextmenu", event => event.preventDefault());
    avatar.addEventListener("click", event => {
      if (Date.now() < suppressAvatarClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
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
    $("#copyLinkButton").addEventListener("click", () => copyPageUrl(activeQrDisplayUrl));
    $("#copyQrImageButton")?.addEventListener("click", copyQrCardImage);
    $("#downloadQrCardButton")?.addEventListener("click", downloadQrCard);
    $$('[data-close-modal]').forEach(el => el.addEventListener("click", closeQrModal));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        if ($("#linkHelpModal")?.classList.contains("open")) {
          closeLinkHelp();
          return;
        }
        if ($("#orderModal")?.classList.contains("open")) {
          closeOrderModal();
          return;
        }
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
        <h2 id="adminLoginTitle">Mở cài đặt Bio Link <span class="admin-version">${escapeHtml(SYSTEM_VERSION)}</span></h2>
        <p>Nhập mật khẩu quản trị để chỉnh sửa nội dung.</p>
        <form id="adminLoginForm">
          <label class="admin-field"><span>Mật khẩu</span><div class="password-wrap"><input id="adminPassword" type="password" autocomplete="current-password" required /><button class="password-toggle" type="button" data-password-toggle="adminPassword" aria-label="Hiện mật khẩu" title="Hiện mật khẩu">${icon("eye", 18)}</button></div></label>
          <p id="adminLoginError" class="admin-error hidden">Mật khẩu không đúng.</p>
          <button class="admin-primary wide" type="submit">${icon("lock", 18)} Mở cài đặt</button>
        </form>
      </section>

      <section id="adminEditor" class="admin-editor hidden" role="dialog" aria-modal="true" aria-labelledby="adminTitle">
        <header class="admin-header">
          <div><span class="admin-kicker">BIO LINK</span><span class="admin-version">${escapeHtml(SYSTEM_VERSION)}</span><h2 id="adminTitle">Cài đặt trang</h2></div>
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
              <div class="admin-version-card">
                <div><strong>Bio Link Manager <span class="admin-version">${escapeHtml(SYSTEM_VERSION)}</span></strong><small>Hồ sơ: <b>/${escapeHtml(profileSlug)}/</b> • Dữ liệu: <code>${escapeHtml(profileDataFile)}</code> • Admin: <code>${escapeHtml(adminDataFile)}</code></small></div>
              </div>
              <div class="admin-grid two" style="margin-top:14px">
                <label class="admin-field"><span>Phiên bản</span><input type="text" value="${SYSTEM_VERSION}" readonly /></label>
                <label class="admin-field"><span>Cách dùng logo</span><select id="editLogoGestureMode"><option value="tap-cache-hold-admin">Nhấn nhiều lần: xóa cache · Giữ: mở Admin</option><option value="tap-admin-hold-cache">Nhấn nhiều lần: mở Admin · Giữ: xóa cache</option></select></label>
                <label class="admin-field"><span>Số lần nhấn</span><input id="editLogoTapCount" type="number" min="2" max="12" step="1" /></label>
                <label class="admin-field"><span>Thời gian giữ logo (giây)</span><input id="editLogoHoldSeconds" type="number" min="1" max="8" step="0.1" /></label>
                <label class="admin-field"><span>Trễ hiện vòng tiến trình (giây)</span><input id="editLogoRingDelaySeconds" type="number" min="0" max="2" step="0.1" /></label>
              </div>
              <p id="logoTapHelp" class="admin-help">Mặc định: nhấn 2 lần để xóa cache; giữ 2 giây để mở Admin. Vòng tiến trình chỉ hiện sau 0,6 giây nên thao tác nhấn nhanh không còn lóe vòng.</p>
            </section>
            <section class="admin-section">
              <h3>Thông tin chính</h3>
              <div class="admin-grid two">
                <label class="admin-field"><span>Tên hiển thị</span><input id="editName" type="text" /></label>
                <label class="admin-field"><span>Tên tài khoản</span><input id="editHandle" type="text" /></label>
              </div>
              <label class="admin-switch admin-inline-switch"><input id="editVerified" type="checkbox" /><span></span><b>Hiện dấu tích xanh xác minh cạnh tên</b></label>
              <label class="admin-field"><span>Mô tả</span><textarea id="editBio" rows="3"></textarea></label>
              <div class="admin-avatar-manager">
                <div class="admin-avatar-preview" aria-label="Xem trước avatar">
                  <span id="editAvatarPreviewInitials" aria-hidden="true">BL</span>
                  <img id="editAvatarPreview" alt="Xem trước avatar" />
                </div>
                <div class="admin-avatar-meta">
                  <strong id="editAvatarFileName">avatar.png</strong>
                  <span id="editAvatarAssetState" class="admin-asset-state">Đang dùng file trong thư mục hồ sơ</span>
                  <small>Avatar luôn lưu thành <code>avatar.png</code> trong thư mục tài khoản và tự dùng cho tab trình duyệt. Nếu file không tồn tại, trang sẽ hiện 2 chữ cái lấy từ tên hồ sơ.</small>
                  <div class="admin-avatar-actions">
                    <label class="admin-upload">${icon("image", 18)} Chọn ảnh từ máy / album<input id="avatarUpload" type="file" accept="image/png,image/webp,image/jpeg" /></label>
                    <button id="removeAvatarButton" class="admin-secondary" type="button">${icon("trash-2", 16)} Bỏ avatar</button>
                  </div>
                </div>
                <input id="editAvatar" type="hidden" />
                <input id="editFavicon" type="hidden" />
              </div>
              <label class="admin-field"><span>Chữ cuối trang</span><input id="editFooter" type="text" /></label>
              <div class="admin-grid two">
                <label class="admin-field"><span>Cách dùng link trong danh thiếp QR</span><select id="editQrLinkPreset"><option value="current-current">QR và chữ dưới: cùng link trang đang mở</option><option value="custom-custom">QR và chữ dưới: cùng link rút gọn</option><option value="current-custom">QR: link trang đang mở · Chữ dưới: link rút gọn</option></select></label>
                <label class="admin-field"><span>Đường dẫn rút gọn</span><input id="editQrUrl" type="text" inputmode="url" autocomplete="url" placeholder="https://bit.ly/ten-cua-ban hoặc bit.ly/ten-cua-ban" /></label>
              </div>
              <div class="admin-grid three color-grid">
                <label class="admin-field"><span>Kiểu màu QR</span><select id="editQrColorMode"><option value="solid">Một màu</option><option value="gradient">Hai màu pha</option></select></label>
                <label class="admin-field"><span>Màu QR 1</span><input id="editQrColor1" type="color" /></label>
                <label class="admin-field"><span>Màu QR 2</span><input id="editQrColor2" type="color" /></label>
                <label class="admin-field"><span>Màu nền QR</span><input id="editQrBackgroundColor" type="color" /></label>
                <label class="admin-field"><span>Hướng pha màu</span><select id="editQrGradientDirection"><option value="diagonal">Chéo trái → phải</option><option value="reverse-diagonal">Chéo phải → trái</option><option value="horizontal">Trái → phải</option><option value="vertical">Trên → dưới</option><option value="radial">Từ giữa ra ngoài</option></select></label>
              </div>
              <p class="admin-help">Việc chọn link chỉ thực hiện trong Admin. Có thể nhập <code>bit.ly/ten</code>; hệ thống tự thêm <code>https://</code>. Ở chế độ thứ ba, QR dẫn đến trang thật nhưng dòng chữ và nút sao chép dùng link rút gọn. Nền QR nên sáng, màu mã nên đậm để quét ổn định.</p>
              <p class="admin-help">${isPrimaryProfile
                ? `Avatar của hồ sơ chính vẫn riêng với các tài khoản phụ. Ảnh icon lớn dùng chung qua <code>shared-assets.js</code>; icon bé luôn hiển thị dạng đơn sắc.`
                : `Tài khoản phụ được thay <b>avatar, nền ngoài và nền trong</b> riêng. Ảnh icon lớn phụ thuộc tài khoản chính; icon bé luôn hiển thị dạng đơn sắc.`}</p>
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
              <div class="admin-grid two admin-aligned-selects">
                <label class="admin-field"><span>Giao diện mặc định</span><select id="editDefaultTheme"><option value="auto">Theo hệ thống</option><option value="light">Luôn sáng</option><option value="dark">Luôn tối</option></select></label>
                <label class="admin-field"><span>Ngôn ngữ mặc định</span><select id="editDefaultLanguage"><option value="auto">Tự nhận diện theo máy</option><option value="vi">VI — Tiếng Việt</option><option value="ja">JP — 日本語</option><option value="en">EN — English</option></select></label>
              </div>
              <p class="admin-help admin-language-detection-help">Tự nhận diện: máy tiếng Việt → VI, máy tiếng Nhật → JP, các ngôn ngữ khác → EN.</p>
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
              <h3>Nền và khung trang</h3>
              <p class="admin-help" style="margin:0 0 14px">Ba đốm tròn là nền trang trí mặc định. Ảnh nền là lớp tùy chọn thêm vào; có thể dùng đồng thời với các đốm. Nền ngoài áp dụng toàn trang, nền trong chỉ áp dụng cho khung Bio.</p>
              <div class="admin-grid two">
                <label class="admin-field"><span>Màu nền ngoài — sáng</span><input id="editOuterLightColor" type="color" /></label>
                <label class="admin-field"><span>Màu nền ngoài — tối</span><input id="editOuterDarkColor" type="color" /></label>
                <label class="admin-field"><span>Màu nền trong — sáng</span><input id="editInnerLightColor" type="color" /></label>
                <label class="admin-field"><span>Màu nền trong — tối</span><input id="editInnerDarkColor" type="color" /></label>
                <label class="admin-field"><span>Màu viền khung — sáng</span><input id="editLightBorderColor" type="color" /></label>
                <label class="admin-field"><span>Màu viền khung — tối</span><input id="editDarkBorderColor" type="color" /></label>
              </div>
              <label class="admin-field"><span>Ảnh nền ngoài</span><input id="editOuterBackgroundImage" type="text" placeholder="uploads/background-outer.webp hoặc URL ảnh" /></label>
              <label class="admin-field"><span>Ảnh nền trong khung Bio</span><input id="editInnerBackgroundImage" type="text" placeholder="uploads/background-inner.webp hoặc URL ảnh" /></label>
              <div class="admin-upload-row">
                <label class="admin-upload">${icon("image", 18)} Chọn ảnh nền ngoài<input id="outerBackgroundUpload" type="file" accept="image/png,image/webp,image/jpeg,image/svg+xml" /></label>
                <label class="admin-upload">${icon("image", 18)} Chọn ảnh nền trong<input id="innerBackgroundUpload" type="file" accept="image/png,image/webp,image/jpeg,image/svg+xml" /></label>
              </div>
              <p class="admin-help">Ảnh nền ngoài và nền trong được lưu riêng theo từng tài khoản. Khi chọn ảnh từ máy, hãy dùng <b>Tải gói cập nhật ZIP</b> để nhận đúng file ảnh và đường dẫn trong <code>profile.js</code>.</p>
              <div class="admin-checks">
                <label><input id="editShowDecorations" type="checkbox" /> Hiện các đốm tròn trang trí ngoài nền</label>
                <label><input id="editShowCardBorder" type="checkbox" /> Hiện viền khung Bio theo màu chủ đạo</label>
              </div>
            </section>

            <section class="admin-section">
              <h3>Đổi mật khẩu</h3>
              <div class="admin-grid two">
                <label class="admin-field"><span>Mật khẩu mới</span><div class="password-wrap"><input id="editNewPassword" type="password" autocomplete="new-password" /><button class="password-toggle" type="button" data-password-toggle="editNewPassword" aria-label="Hiện mật khẩu" title="Hiện mật khẩu">${icon("eye", 18)}</button></div></label>
                <label class="admin-field"><span>Nhập lại mật khẩu</span><div class="password-wrap"><input id="editConfirmPassword" type="password" autocomplete="new-password" /><button class="password-toggle" type="button" data-password-toggle="editConfirmPassword" aria-label="Hiện mật khẩu" title="Hiện mật khẩu">${icon("eye", 18)}</button></div></label>
              </div>
              <p class="admin-help">Để trống nếu không muốn đổi. Mật khẩu, cách nhấn/giữ logo và toàn bộ thiết lập cá nhân được lưu chung trong <code>profile.js</code>. Các file hệ thống chỉ chứa giao diện và chức năng Admin.</p>
              <div class="admin-server-note"><b>Lưu trực tiếp trên host:</b> nút “Lưu lên máy chủ” hoạt động khi host hỗ trợ PHP và thư mục <code>bio</code> có quyền ghi.</div>
            </section>
          </div>

          <div class="admin-panel hidden" data-admin-panel="links">
            <section class="admin-section">
              <div class="admin-section-title"><div><h3>Icon liên kết lớn</h3><p>${isPrimaryProfile ? `PC hiển thị các ô nhập theo 3 cột. Tài khoản chính được quản lý ảnh icon dùng chung cho mọi hồ sơ.` : `PC hiển thị các ô nhập theo 3 cột. Ảnh icon dùng chung từ tài khoản chính; tài khoản phụ chỉ chỉnh tên, mô tả, link, SVG, bật/tắt và thứ tự.`}</p></div><div class="admin-section-actions"><button id="sortLinksButton" class="admin-secondary" type="button">${icon("grip-vertical", 17)} Sắp xếp</button><button id="addLinkButton" class="admin-secondary" type="button">${icon("plus", 17)} Thêm nút</button></div></div>
              <div id="adminLinks" class="admin-items"></div>
            </section>
          </div>

          <div class="admin-panel hidden" data-admin-panel="socials">
            <section class="admin-section">
              <div class="admin-section-title"><div><h3>Icon bé dưới cùng</h3><p>Chọn icon lớn rồi sao chép một lần. Icon bé luôn hiển thị dạng đơn sắc bằng icon thương hiệu hoặc SVG; không dùng ảnh màu của icon lớn.</p></div><div class="admin-section-actions"><button id="sortSocialsButton" class="admin-secondary" type="button">${icon("grip-vertical", 17)} Sắp xếp</button><button id="addSocialButton" class="admin-secondary" type="button">${icon("plus", 17)} Thêm icon</button></div></div>
              <div id="adminSocials" class="admin-items"></div>
            </section>
          </div>
        </div>
        <footer class="admin-footer">
          <button id="resetConfigButton" class="admin-danger" type="button">${icon("rotate-ccw", 17)} Về cấu hình file</button>
          <div class="admin-footer-right">
            <button id="exportConfigButton" class="admin-secondary" type="button">${icon("file-down", 17)} Tải profile.js</button>
            <button id="exportUpdateZipButton" class="admin-secondary admin-zip-export hidden" type="button">${icon("archive", 17)} Tải gói cập nhật ZIP</button>
            <button id="serverSaveButton" class="admin-server" type="button">${icon("upload-cloud", 17)} Lưu lên máy chủ</button>
            <button id="saveConfigButton" class="admin-primary" type="button">${icon("save", 17)} Lưu & xem trước</button>
          </div>
        </footer>
      </section>

      <div id="orderModal" class="order-modal" aria-hidden="true">
        <div class="order-modal-backdrop" data-order-close></div>
        <section class="order-modal-card" role="dialog" aria-modal="true" aria-labelledby="orderModalTitle">
          <header class="order-modal-header">
            <div><span class="admin-kicker">THỨ TỰ HIỂN THỊ</span><h3 id="orderModalTitle">Sắp xếp liên kết</h3></div>
            <button class="admin-close" type="button" data-order-close aria-label="Đóng">${icon("x")}</button>
          </header>
          <p class="order-modal-help">Giữ núm ${icon("grip-vertical", 16)} rồi kéo lên hoặc xuống. Có thể dùng mũi tên nếu không muốn kéo.</p>
          <div id="orderList" class="order-list"></div>
          <footer class="order-modal-footer"><button class="admin-primary" type="button" data-order-close>${icon("check", 17)} Xong</button></footer>
        </section>
      </div>

      <div id="linkHelpModal" class="link-help-modal" aria-hidden="true">
        <div class="link-help-backdrop" data-link-help-close></div>
        <section class="link-help-card" role="dialog" aria-modal="true" aria-labelledby="linkHelpTitle">
          <header><div><span class="admin-kicker">HƯỚNG DẪN LINK</span><h3 id="linkHelpTitle">Cách lấy đường dẫn</h3></div><button class="admin-close" type="button" data-link-help-close aria-label="Đóng">${icon("x")}</button></header>
          <div id="linkHelpContent" class="link-help-content"></div>
          <footer><button class="admin-primary" type="button" data-link-help-close>${icon("check", 17)} Đã hiểu</button></footer>
        </section>
      </div>
    </div>`;

  const setupAdmin = () => {
    if (sourceConfig.admin?.enabled === false) return;
    document.body.insertAdjacentHTML("beforeend", adminMarkup());
    {
      const serverButton = $("#serverSaveButton");
      const serverNote = $(".admin-server-note");
      const profileLabel = sourceConfig.profile?.name || profileSlug;
      if (!IS_SERVER_MODE) {
        if (serverButton) serverButton.style.display = "none";
        if (serverNote) serverNote.innerHTML = `<b>Hồ sơ ${escapeHtml(profileLabel)} (/${escapeHtml(profileSlug)}/):</b> lưu xem trước chỉ nằm trên trình duyệt. Muốn cập nhật trang thật, hãy tải <code>profile.js</code> hoặc gói ZIP rồi thay đúng file <code>${escapeHtml(profileDataFile)}</code>. File này gồm cả nội dung, màu sắc, mật khẩu và cách dùng logo; cập nhật file hệ thống sẽ không ghi đè dữ liệu cá nhân. ${HAS_SEPARATE_ADMIN_CONFIG ? `<br><b>Tương thích cấu trúc cũ:</b> thiết lập từ <code>${escapeHtml(adminDataFile)}</code> đang được đọc tạm. Hãy tải lại <code>profile.js</code> một lần để gộp chúng vào dữ liệu hồ sơ.` : ``} ${isPrimaryProfile ? `Ảnh icon lớn do hồ sơ chính quản lý chung; icon bé luôn đơn sắc. Avatar và hai ảnh nền vẫn là của riêng hồ sơ chính.` : `Hồ sơ phụ được tải avatar và hai ảnh nền riêng; ảnh icon lớn dùng theo hồ sơ chính, icon bé luôn đơn sắc.`}`;
      } else {
        if (serverButton) serverButton.style.display = "inline-flex";
        if (serverNote) serverNote.innerHTML = `<b>Hồ sơ ${escapeHtml(profileLabel)} (/${escapeHtml(profileSlug)}/):</b> nút <b>Lưu lên máy chủ</b> sẽ ghi trực tiếp toàn bộ nội dung và thiết lập cá nhân vào <code>${escapeHtml(profileDataFile)}</code>. Avatar và hai ảnh nền được lưu trong thư mục hồ sơ; ảnh icon lớn chỉ tài khoản chính được cập nhật dùng chung, icon bé luôn đơn sắc.`;
      }
    }
    $$("[data-admin-tab]").forEach(button => button.addEventListener("click", () => switchAdminTab(button.dataset.adminTab)));

    $(".avatar-wrap")?.classList.add("admin-trigger");

    $$('[data-admin-close]').forEach(el => el.addEventListener("click", closeAdmin));
    $("#adminLoginForm").addEventListener("submit", handleAdminLogin);
    $("#saveConfigButton").addEventListener("click", saveEditorConfig);
    $("#serverSaveButton").addEventListener("click", saveConfigToServer);
    $("#exportConfigButton").addEventListener("click", exportEditorConfig);
    $("#exportUpdateZipButton").addEventListener("click", exportUpdateZip);
    $("#resetConfigButton").addEventListener("click", resetToSourceConfig);
    $("#sortLinksButton").addEventListener("click", () => openOrderModal("links"));
    $("#sortSocialsButton").addEventListener("click", () => openOrderModal("socials"));
    $("#orderModal").addEventListener("click", handleOrderModalClick);
    $$('[data-link-help-close]').forEach(el => el.addEventListener("click", closeLinkHelp));
    $("#orderList").addEventListener("pointerdown", handleOrderPointerDown);
    document.addEventListener("pointermove", handleOrderPointerMove, { passive: false });
    document.addEventListener("pointerup", handleOrderPointerEnd);
    document.addEventListener("pointercancel", handleOrderPointerEnd);
    $("#addLinkButton").addEventListener("click", () => {
      collectEditorFields();
      editorDraft.links.push({ id: `link-${Date.now()}`, enabled: true, featured: false, icon: "globe", image: "", showIconBackground: true, title: "Liên kết mới", description: "", url: "https://", badge: "", translations: {} });
      renderEditorItems("links");
    });
    $("#addSocialButton").addEventListener("click", () => {
      collectEditorFields();
      editorDraft.socialIcons.push({ id: `social-${Date.now()}`, enabled: true, syncFromLink: false, sourceLinkId: "", brandIcon: "auto", icon: "globe", image: "", showIconBackground: false, label: "Website", url: "https://", translations: {} });
      renderEditorItems("socials");
    });
    $("#adminLinks").addEventListener("click", handleItemAction);
    $("#adminSocials").addEventListener("click", handleItemAction);
    $("#adminLinks").addEventListener("change", handleImageUpload);
    $("#adminLinks").addEventListener("input", handleEditorItemInput);
    $("#adminSocials").addEventListener("input", handleEditorItemInput);
    const normalizeVisibleUrlField = event => {
      const input = event.target.closest('input[data-field="url"]');
      if (!input) return;
      const card = input.closest(".admin-item");
      if (!card) return;
      const list = card.dataset.type === "links" ? editorDraft.links : editorDraft.socialIcons;
      const item = list[Number(card.dataset.index)];
      input.value = normalizeExternalUrl(input.value, item);
    };
    $("#adminLinks").addEventListener("focusout", normalizeVisibleUrlField, true);
    $("#adminSocials").addEventListener("focusout", normalizeVisibleUrlField, true);
    $("#editQrUrl")?.addEventListener("blur", event => { event.target.value = normalizeExternalUrl(event.target.value); });
    $("#adminSocials").addEventListener("change", handleSocialSourceChange);
    $("#avatarUpload").addEventListener("change", handleAvatarUpload);
    $("#removeAvatarButton")?.addEventListener("click", handleRemoveAvatar);
    $("#editName")?.addEventListener("input", renderAdminAvatarPreview);
    $("#outerBackgroundUpload")?.addEventListener("change", event => handleBackgroundUpload(event, "#editOuterBackgroundImage", "ảnh nền ngoài"));
    $("#innerBackgroundUpload")?.addEventListener("change", event => handleBackgroundUpload(event, "#editInnerBackgroundImage", "ảnh nền trong"));
    $("#adminOverlay").addEventListener("click", handlePasswordToggle);
    $("#adminPassword").addEventListener("input", () => $("#adminLoginError").classList.add("hidden"));
  };

  const switchAdminTab = tab => {
    const selected = ["config", "links", "socials"].includes(tab) ? tab : "config";
    $$("[data-admin-tab]").forEach(button => button.classList.toggle("active", button.dataset.adminTab === selected));
    $$("[data-admin-panel]").forEach(panel => panel.classList.toggle("hidden", panel.dataset.adminPanel !== selected));
    $(".admin-body")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getOrderList = () => orderEditorType === "links" ? editorDraft?.links || [] : editorDraft?.socialIcons || [];

  const getOrderItemName = item => orderEditorType === "links"
    ? (item.title || "Liên kết chưa đặt tên")
    : (item.label || "Icon chưa đặt tên");

  const renderOrderList = () => {
    const container = $("#orderList");
    if (!container) return;
    const list = getOrderList();
    container.innerHTML = list.map((item, index) => `
      <div class="order-row" data-order-id="${escapeAttribute(item.id)}">
        <button class="order-drag-handle" type="button" aria-label="Giữ và kéo ${escapeAttribute(getOrderItemName(item))}" title="Giữ và kéo">${icon("grip-vertical", 20)}</button>
        <span class="order-position">${index + 1}</span>
        <div class="order-row-info"><b>${escapeHtml(getOrderItemName(item))}</b><small>${item.enabled ? "Đang hiện" : "Đang ẩn"}</small></div>
        <div class="order-row-actions">
          <button type="button" data-order-action="up" title="Đưa lên" ${index === 0 ? "disabled" : ""}>${icon("chevron-up", 17)}</button>
          <button type="button" data-order-action="down" title="Đưa xuống" ${index === list.length - 1 ? "disabled" : ""}>${icon("chevron-down", 17)}</button>
        </div>
      </div>`).join("") || '<p class="order-empty">Chưa có mục nào để sắp xếp.</p>';
  };

  const openOrderModal = type => {
    collectEditorFields();
    orderEditorType = type === "socials" ? "socials" : "links";
    $("#orderModalTitle").textContent = orderEditorType === "links" ? "Sắp xếp icon liên kết" : "Sắp xếp icon bé dưới cùng";
    renderOrderList();
    const modal = $("#orderModal");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeOrderModal = () => {
    if (orderDragState) finishOrderDrag();
    const modal = $("#orderModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  const commitOrderFromDom = () => {
    const list = getOrderList();
    const byId = new Map(list.map(item => [String(item.id), item]));
    const ordered = $$(".order-row", $("#orderList")).map(row => byId.get(row.dataset.orderId)).filter(Boolean);
    if (ordered.length !== list.length) return;
    if (orderEditorType === "links") editorDraft.links = ordered;
    else editorDraft.socialIcons = ordered;
    renderEditorItems(orderEditorType);
    if (orderEditorType === "links") renderEditorItems("socials");
  };

  const moveOrderItem = (direction, row) => {
    const list = getOrderList();
    const index = list.findIndex(item => String(item.id) === row?.dataset.orderId);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    renderOrderList();
    renderEditorItems(orderEditorType);
    if (orderEditorType === "links") renderEditorItems("socials");
  };

  const handleOrderModalClick = event => {
    if (event.target.closest("[data-order-close]")) {
      closeOrderModal();
      return;
    }
    const button = event.target.closest("[data-order-action]");
    if (!button) return;
    moveOrderItem(button.dataset.orderAction, button.closest(".order-row"));
  };

  const handleOrderPointerDown = event => {
    const handle = event.target.closest(".order-drag-handle");
    if (!handle || event.button > 0) return;
    const row = handle.closest(".order-row");
    if (!row) return;
    event.preventDefault();
    orderDragState = { pointerId: event.pointerId, handle, row, list: $("#orderList") };
    row.classList.add("is-dragging");
    handle.setPointerCapture?.(event.pointerId);
  };

  const handleOrderPointerMove = event => {
    const state = orderDragState;
    if (!state || event.pointerId !== state.pointerId) return;
    event.preventDefault();
    const rows = $$(".order-row:not(.is-dragging)", state.list);
    const after = rows.find(row => event.clientY < row.getBoundingClientRect().top + row.getBoundingClientRect().height / 2);
    if (after) state.list.insertBefore(state.row, after);
    else state.list.appendChild(state.row);
    const rect = state.list.getBoundingClientRect();
    if (event.clientY < rect.top + 42) state.list.scrollTop -= 12;
    if (event.clientY > rect.bottom - 42) state.list.scrollTop += 12;
    $$(".order-row", state.list).forEach((row, index) => {
      const position = $(".order-position", row);
      if (position) position.textContent = String(index + 1);
    });
  };

  const finishOrderDrag = () => {
    const state = orderDragState;
    if (!state) return;
    state.row.classList.remove("is-dragging");
    try { state.handle.releasePointerCapture?.(state.pointerId); } catch {}
    orderDragState = null;
    commitOrderFromDom();
    renderOrderList();
  };

  const handleOrderPointerEnd = event => {
    if (!orderDragState || event.pointerId !== orderDragState.pointerId) return;
    finishOrderDrag();
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
    closeOrderModal();
    const overlay = $("#adminOverlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    adminSessionPassword = "";
    document.body.style.overflow = "";
  };

  const handleAdminLogin = async event => {
    event.preventDefault();
    const enteredPassword = $("#adminPassword").value;
    const enteredHash = await sha256(enteredPassword);
    const expectedHash = config.admin?.passwordHash || sourceConfig.admin?.passwordHash;
    if (enteredHash !== expectedHash) {
      $("#adminLoginError").classList.remove("hidden");
      return;
    }
    adminSessionPassword = enteredPassword;
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
    $("#editVerified").checked = editorDraft.profile.verified !== false;
    $("#editBio").value = editorDraft.profile.bio || "";
    setAssetFieldDisplay($("#editAvatar"), editorDraft.profile.avatar || "", formatEmbeddedAssetLabel("Avatar PNG tròn", "avatar.png"));
    setAssetFieldDisplay($("#editFavicon"), editorDraft.profile.avatar || "", formatEmbeddedAssetLabel("Icon tab", "avatar.png"));
    renderAdminAvatarPreview();
    $("#editFooter").value = editorDraft.profile.footerText || "";
    $("#editQrUrl").value = editorDraft.settings.qrUrl || "";
    const qrDesign = editorDraft.settings.qrDesign || DEFAULT_QR_DESIGN;
    $("#editQrLinkPreset").value = qrDesign.linkPreset || "current-current";
    $("#editQrColorMode").value = qrDesign.colorMode || "solid";
    $("#editQrColor1").value = qrDesign.color1 || "#111111";
    $("#editQrColor2").value = qrDesign.color2 || "#f39b19";
    $("#editQrBackgroundColor").value = qrDesign.backgroundColor || "#ffffff";
    $("#editQrGradientDirection").value = qrDesign.gradientDirection || "diagonal";
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
    $("#editLogoGestureMode").value = editorDraft.admin?.logoGestureMode || "tap-cache-hold-admin";
    $("#editLogoTapCount").value = editorDraft.admin?.logoTapCount || 2;
    $("#editLogoHoldSeconds").value = editorDraft.admin?.logoHoldSeconds || 2;
    $("#editLogoRingDelaySeconds").value = editorDraft.admin?.logoRingDelaySeconds ?? 0.6;
    const tapInput = $("#editLogoTapCount");
    const gestureInput = $("#editLogoGestureMode");
    const holdInput = $("#editLogoHoldSeconds");
    const delayInput = $("#editLogoRingDelaySeconds");
    const tapHelp = $("#logoTapHelp");
    const isEmbeddedAdmin = editorDraft.admin?.mode === "embedded";
    [tapInput, gestureInput, holdInput, delayInput].forEach(input => { if (input) input.disabled = !isEmbeddedAdmin; });
    if (tapHelp && !isEmbeddedAdmin) tapHelp.textContent = "Bản này mở Admin bằng đường dẫn riêng; các thao tác logo chỉ áp dụng cho gói GitHub có Admin nằm trong trang.";
    $("#editDefaultTheme").value = editorDraft.settings.defaultTheme || "auto";
    $("#editDefaultLanguage").value = editorDraft.settings.defaultLanguage || "auto";
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
    $("#editOuterLightColor").value = appearance.outerLightColor || DEFAULT_APPEARANCE.outerLightColor;
    $("#editOuterDarkColor").value = appearance.outerDarkColor || DEFAULT_APPEARANCE.outerDarkColor;
    $("#editInnerLightColor").value = appearance.innerLightColor || DEFAULT_APPEARANCE.innerLightColor;
    $("#editInnerDarkColor").value = appearance.innerDarkColor || DEFAULT_APPEARANCE.innerDarkColor;
    setAssetFieldDisplay($("#editOuterBackgroundImage"), appearance.outerBackgroundImage || "", formatEmbeddedAssetLabel("Nền ngoài", "background-outer.webp"));
    bindAssetFieldEditing($("#editOuterBackgroundImage"));
    setAssetFieldDisplay($("#editInnerBackgroundImage"), appearance.innerBackgroundImage || "", formatEmbeddedAssetLabel("Nền trong", "background-inner.webp"));
    bindAssetFieldEditing($("#editInnerBackgroundImage"));
    $("#editLightBorderColor").value = appearance.lightBorderColor || appearance.primaryColor || DEFAULT_APPEARANCE.lightBorderColor;
    $("#editDarkBorderColor").value = appearance.darkBorderColor || appearance.primaryColor || DEFAULT_APPEARANCE.darkBorderColor;
    $("#editShowDecorations").checked = appearance.showDecorations !== false;
    $("#editShowCardBorder").checked = appearance.showCardBorder !== false;
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
    const brandOptions = [
      ["auto", "Tự nhận diện"], ["none", "Không dùng icon thương hiệu"],
      ["facebook", "Facebook"], ["messenger", "Messenger"], ["tiktok", "TikTok"],
      ["zalo", "Zalo"], ["line", "LINE"], ["youtube", "YouTube"], ["gmail", "Gmail / Email"]
    ];

    container.innerHTML = list.map((item, index) => {
      const translationFields = isLinks ? `
        <details class="admin-translation-box">
          <summary>${icon("globe", 15)} Tên và mô tả JP / EN</summary>
          <div class="admin-translation-content">
            <p class="admin-language-title"><img src="assets/flag-ja.svg" alt="JP" /> JP — 日本語</p>
            <div class="admin-grid two">
              <label class="admin-field"><span>Tên JP</span><input data-translation-language="ja" data-translation-field="title" type="text" value="${escapeAttribute(item.translations?.ja?.title || "")}" /></label>
              <label class="admin-field"><span>Chữ trên nơ JP</span><input data-translation-language="ja" data-translation-field="badge" type="text" value="${escapeAttribute(item.translations?.ja?.badge || "")}" /></label>
            </div>
            <label class="admin-field"><span>Mô tả JP</span><input data-translation-language="ja" data-translation-field="description" type="text" value="${escapeAttribute(item.translations?.ja?.description || "")}" /></label>
            <p class="admin-language-title"><img src="assets/flag-en.svg" alt="EN" /> EN — English</p>
            <div class="admin-grid two">
              <label class="admin-field"><span>Tên EN</span><input data-translation-language="en" data-translation-field="title" type="text" value="${escapeAttribute(item.translations?.en?.title || "")}" /></label>
              <label class="admin-field"><span>Chữ trên nơ EN</span><input data-translation-language="en" data-translation-field="badge" type="text" value="${escapeAttribute(item.translations?.en?.badge || "")}" /></label>
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
      <article class="admin-item ${item.enabled ? "is-enabled" : "is-disabled"}" data-type="${type}" data-index="${index}">
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
          <p class="admin-sync-note">Nút “Đồng bộ ngay” sao chép tên, đường dẫn, icon SVG, icon thương hiệu, nền và bản dịch. Icon bé không sao chép ảnh màu và luôn giữ kiểu đơn sắc.</p>
        ` : ""}
        <div class="admin-manual-fields">
          <div class="admin-item-field-grid">
            <label class="admin-field"><span>${isLinks ? "Tên nút" : "Tên icon"}</span><input data-field="${isLinks ? "title" : "label"}" type="text" value="${escapeAttribute(isLinks ? item.title : item.label)}" /></label>
            ${isLinks
              ? `<label class="admin-field"><span>Mô tả</span><input data-field="description" type="text" value="${escapeAttribute(item.description || "")}" /></label>`
              : `<label class="admin-field"><span>Icon thương hiệu</span><select data-field="brandIcon">${brandOptions.map(([value, label]) => `<option value="${value}" ${(item.brandIcon || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`}
            <div class="admin-field"><div class="admin-field-label-row"><span>Đường dẫn</span><button class="admin-help-dot" type="button" data-action="show-link-help" aria-label="Hướng dẫn lấy đường dẫn" title="Cách lấy đường dẫn">?</button></div><input data-field="url" type="text" inputmode="url" autocomplete="url" value="${escapeAttribute(item.url || "")}" placeholder="https://facebook.com/ten hoặc facebook.com/ten" /></div>
            <label class="admin-field"><span>Tên icon SVG</span><input data-field="icon" type="text" value="${escapeAttribute(item.icon || "globe")}" placeholder="facebook, phone, mail..." /></label>
            ${isLinks
              ? `<label class="admin-field"><span>Ảnh thay icon lớn</span><input data-field="image" type="text" value="${escapeAttribute(item.image || "")}" placeholder="assets/facebook.webp hoặc URL" ${isPrimaryProfile ? "" : "readonly"} /></label><label class="admin-field"><span>Chữ trên nơ VI</span><input data-field="badge" type="text" value="${escapeAttribute(item.badge || "")}" placeholder="Để trống: Nổi bật" /></label>`
              : `<div class="admin-field admin-field-note"><span>Kiểu hiển thị</span><small>Icon bé luôn đơn sắc; dùng icon thương hiệu hoặc tên icon SVG ở trên.</small></div>`}
          </div>
          ${translationFields}
          <div class="admin-item-options">
            <div class="admin-option-group">
              ${isLinks ? `<label><input data-field="featured" type="checkbox" ${item.featured ? "checked" : ""}/> Hiện nơ nổi bật ở cả VI / JP / EN</label>` : ""}
              <label><input data-field="showIconBackground" type="checkbox" ${item.showIconBackground ? "checked" : ""}/> Hiện nền icon</label>
            </div>
            <div class="admin-upload-with-help">
              ${isLinks
                ? (isPrimaryProfile
                  ? `<label class="admin-upload small">${icon("image", 16)} Chọn ảnh icon lớn<input data-action="item-image-upload" type="file" accept="image/png,image/webp,image/jpeg,image/svg+xml" /></label><small>Chỉ thay hình của nút liên kết lớn, không thay avatar/logo hồ sơ. Ảnh này được dùng chung cho các tài khoản phụ sau khi cập nhật gói ZIP.</small>`
                  : `<span class="admin-shared-inline">${icon("lock", 15)} Ảnh icon lớn dùng chung từ tài khoản chính /bio/</span>`)
                : `<span class="admin-shared-inline">${icon("sparkles", 15)} Icon bé đơn sắc, không dùng ảnh màu</span>`}
            </div>
          </div>
        </div>
      </article>`;
    }).join("");

    if (!isLinks) {
      $$('select[data-field="sourceLinkId"]', container).forEach((select, index) => {
        select.value = list[index]?.sourceLinkId || "";
      });
    }
    $$('[data-field="image"]', container).forEach((input, index) => {
      const item = list[index] || {};
      setItemAssetValue(input, item.image || "", isLinks ? "Ảnh icon lớn" : "Ảnh icon bé", item);
    });
  };

  const collectEditorFields = () => {
    if (!editorDraft) return;
    editorDraft.profile.name = $("#editName").value.trim();
    editorDraft.profile.handle = $("#editHandle").value.trim();
    editorDraft.profile.verified = $("#editVerified").checked;
    editorDraft.profile.bio = $("#editBio").value.trim();
    editorDraft.profile.avatar = readAssetFieldValue($("#editAvatar"));
    editorDraft.profile.favicon = editorDraft.profile.avatar || "";
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
    editorDraft.admin ||= {};
    editorDraft.admin.logoGestureMode = $("#editLogoGestureMode")?.value || "tap-cache-hold-admin";
    editorDraft.admin.logoTapCount = clampNumber($("#editLogoTapCount")?.value, 2, 12, editorDraft.admin.logoGestureMode === "tap-cache-hold-admin" ? 2 : 5);
    editorDraft.admin.logoHoldSeconds = clampNumber($("#editLogoHoldSeconds")?.value, 1, 8, 2);
    editorDraft.admin.logoRingDelaySeconds = Math.min(
      Math.max(0, editorDraft.admin.logoHoldSeconds - 0.15),
      clampNumber($("#editLogoRingDelaySeconds")?.value, 0, 2, 0.6)
    );
    editorDraft.settings.qrUrl = normalizeExternalUrl($("#editQrUrl").value);
    editorDraft.settings.qrDesign = {
      linkPreset: $("#editQrLinkPreset").value,
      colorMode: $("#editQrColorMode").value,
      color1: $("#editQrColor1").value || "#111111",
      color2: $("#editQrColor2").value || "#f39b19",
      backgroundColor: $("#editQrBackgroundColor").value || "#ffffff",
      gradientDirection: $("#editQrGradientDirection").value
    };
    if (["custom-custom", "current-custom"].includes(editorDraft.settings.qrDesign.linkPreset) && !editorDraft.settings.qrUrl) {
      editorDraft.settings.qrDesign.linkPreset = "current-current";
    }
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
      footerFontSize: clampNumber($("#editFooterFontSize").value, 9, 18, 12),
      outerLightColor: $("#editOuterLightColor").value || DEFAULT_APPEARANCE.outerLightColor,
      outerDarkColor: $("#editOuterDarkColor").value || DEFAULT_APPEARANCE.outerDarkColor,
      innerLightColor: $("#editInnerLightColor").value || DEFAULT_APPEARANCE.innerLightColor,
      innerDarkColor: $("#editInnerDarkColor").value || DEFAULT_APPEARANCE.innerDarkColor,
      outerBackgroundImage: readAssetFieldValue($("#editOuterBackgroundImage")),
      innerBackgroundImage: readAssetFieldValue($("#editInnerBackgroundImage")),
      lightBorderColor: $("#editLightBorderColor").value || $("#editPrimaryColor").value || DEFAULT_APPEARANCE.lightBorderColor,
      darkBorderColor: $("#editDarkBorderColor").value || $("#editPrimaryColor").value || DEFAULT_APPEARANCE.darkBorderColor,
      showDecorations: $("#editShowDecorations").checked,
      showCardBorder: $("#editShowCardBorder").checked
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
        const fieldName = field.dataset.field;
        item[fieldName] = field.type === "checkbox"
          ? field.checked
          : (fieldName === "url" ? normalizeExternalUrl(field.value, item) : field.value.trim());
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

  const getLinkHelpHtml = item => {
    const key = `${item?.id || ""} ${item?.title || item?.label || ""} ${item?.icon || ""}`.toLowerCase();
    let specific = "Mở trang cần liên kết → Chia sẻ → Sao chép liên kết. Có thể dán đầy đủ <code>https://...</code>, hoặc chỉ dán <code>tenmien.com/duong-dan</code>; hệ thống sẽ tự thêm <code>https://</code>.";
    if (key.includes("facebook")) specific = "Facebook: mở trang cá nhân hoặc Fanpage → Chia sẻ → Sao chép liên kết. Có thể nhập <code>facebook.com/ten</code>; hệ thống tự đổi thành <code>https://facebook.com/ten</code>.";
    else if (key.includes("messenger")) specific = "Messenger: dùng <code>m.me/tennguoidung</code> hoặc link chia sẻ Messenger. Hệ thống tự thêm <code>https://</code>.";
    else if (key.includes("zalo")) specific = "Zalo: mở hồ sơ → Chia sẻ → Sao chép liên kết; hoặc nhập <code>zalo.me/84...</code>. Hệ thống tự thêm <code>https://</code>.";
    else if (key.includes("line")) specific = "LINE: Trang chủ → Thêm bạn → Mời → Sao chép liên kết. Có thể nhập <code>line.me/ti/p/...</code>; hệ thống tự thêm <code>https://</code>.";
    else if (key.includes("tiktok") || key.includes("music")) specific = "TikTok: mở hồ sơ → Chia sẻ → Sao chép liên kết. Có thể nhập <code>tiktok.com/@ten</code>; hệ thống tự thêm <code>https://</code>.";
    else if (key.includes("youtube")) specific = "YouTube: mở kênh → Chia sẻ → Sao chép liên kết. Có thể nhập <code>youtube.com/@tenkenh</code>; hệ thống tự thêm <code>https://</code>.";
    else if (key.includes("phone")) specific = "Số điện thoại: nhập <code>tel:+819012345678</code>. Nếu chỉ nhập số có dấu <code>+</code>, hệ thống cũng tự đổi sang <code>tel:</code>.";
    else if (key.includes("mail") || key.includes("email")) specific = "Email: nhập <code>mailto:ten@example.com</code>. Nếu chỉ nhập địa chỉ email, hệ thống tự thêm <code>mailto:</code>.";
    return `<p>${specific}</p><p><b>Vì sao cần https://?</b> Nếu nhập <code>bit.ly/vinhbio</code> mà không có giao thức, trình duyệt có thể hiểu đó là đường dẫn con và nối thành <code>/bio/bit.ly/vinhbio</code>. Bản này tự sửa sang <code>https://bit.ly/vinhbio</code>.</p><p><b>Ngoại lệ không tự thêm https://:</b> <code>tel:</code>, <code>mailto:</code>, <code>sms:</code>, đường dẫn nội bộ bắt đầu bằng <code>/</code>, <code>./</code>, <code>../</code> hoặc <code>#</code>.</p><p><b>Kiểm tra:</b> mở thử link trong tab ẩn danh trước khi cập nhật GitHub. Chỉ nhấn đúng vòng tròn dấu hỏi mới mở hướng dẫn.</p>`;
  };

  const openLinkHelp = item => {
    const modal = $("#linkHelpModal");
    const content = $("#linkHelpContent");
    if (!modal || !content) return;
    content.innerHTML = getLinkHelpHtml(item);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeLinkHelp = () => {
    const modal = $("#linkHelpModal");
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
  };

  const handleItemAction = event => {
    const button = event.target.closest("[data-action]");
    if (!button || button.dataset.action === "item-image-upload") return;
    event.preventDefault();
    event.stopPropagation();
    const card = button.closest(".admin-item");
    if (!card) return;
    const type = card.dataset.type;
    const index = Number(card.dataset.index);
    const list = type === "links" ? editorDraft.links : editorDraft.socialIcons;
    if (button.dataset.action === "show-link-help") {
      openLinkHelp(list[index]);
      return;
    }
    collectEditorFields();
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

  const fileToCircularPngDataUrl = file => new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const size = 512;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        const side = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
        const sx = ((image.naturalWidth || image.width) - side) / 2;
        const sy = ((image.naturalHeight || image.height) - side) / 2;
        context.clearRect(0, 0, size, size);
        context.save();
        context.beginPath();
        context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        context.closePath();
        context.clip();
        context.drawImage(image, sx, sy, side, side, 0, 0, size, size);
        context.restore();
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };
    image.onerror = error => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    image.src = objectUrl;
  });

  const formatEmbeddedAssetLabel = (kind, fileName = "") => {
    const clean = String(fileName || "").split(/[\/]/).pop();
    return clean ? `[${kind}: ${clean}]` : `[${kind}]`;
  };

  const setAssetFieldDisplay = (input, value, label) => {
    if (!input) return;
    if (isEmbeddedDataUrl(value)) {
      input.dataset.assetValue = value;
      input.value = label || formatEmbeddedAssetLabel("Ảnh đã nạp");
      input.classList.add("is-virtual-asset");
    } else {
      delete input.dataset.assetValue;
      input.value = value || "";
      input.classList.remove("is-virtual-asset");
    }
  };

  const readAssetFieldValue = input => {
    if (!input) return "";
    return input.dataset.assetValue || input.value.trim();
  };

  const bindAssetFieldEditing = input => {
    if (!input || input.dataset.assetBindReady === "1") return;
    input.dataset.assetBindReady = "1";
    input.addEventListener("input", () => {
      if (!input.dataset.assetValue) return;
      const current = input.value.trim();
      if (!current.startsWith("[")) {
        delete input.dataset.assetValue;
        input.classList.remove("is-virtual-asset");
      }
    });
  };

  const setItemAssetValue = (input, value, prefix, item) => {
    const labelBase = item?.title || item?.label || item?.id || "icon";
    setAssetFieldDisplay(input, value, formatEmbeddedAssetLabel(prefix, `${safeAssetName(labelBase)}.png`));
    bindAssetFieldEditing(input);
  };

  const hasEmbeddedAssetsInDraft = draft => {
    if (!draft) return false;
    const values = [
      draft.profile?.avatar,
      draft.settings?.appearance?.outerBackgroundImage,
      draft.settings?.appearance?.innerBackgroundImage,
      ...(draft.links || []).map(item => item?.image)
    ];
    return values.some(isEmbeddedDataUrl);
  };

  const updateExportActionVisibility = () => {
    const hasAssets = hasEmbeddedAssetsInDraft(editorDraft);
    const profileButton = $("#exportConfigButton");
    const zipButton = $("#exportUpdateZipButton");
    profileButton?.classList.toggle("hidden", hasAssets);
    zipButton?.classList.toggle("hidden", !hasAssets);
    if (profileButton) profileButton.title = hasAssets ? "Có ảnh mới: hãy tải gói ZIP" : "Tải riêng profile.js";
    if (zipButton) zipButton.title = hasAssets ? "Gồm profile.js và file ảnh mới" : "Chỉ hiện khi có ảnh mới";
  };

  const renderAdminAvatarPreview = () => {
    const name = $("#editName")?.value.trim() || editorDraft?.profile?.name || "Bio Link";
    const initials = getProfileInitials(name);
    const value = readAssetFieldValue($("#editAvatar"));
    const preview = $("#editAvatarPreview");
    const fallback = $("#editAvatarPreviewInitials");
    const fileName = $("#editAvatarFileName");
    const state = $("#editAvatarAssetState");
    const source = isEmbeddedDataUrl(value) ? value : (value ? resolveProfileAsset(value) : "");
    applyAvatarSource({ image: preview, fallback, source, initials, alt: `Avatar ${name}` });
    if (fileName) fileName.textContent = value ? "avatar.png" : "Không có avatar.png";
    if (state) {
      if (isEmbeddedDataUrl(value)) state.textContent = avatarUploadSourceName ? `Ảnh mới: ${avatarUploadSourceName} → avatar.png` : "Ảnh mới đã xử lý → avatar.png";
      else if (value) state.textContent = "Đang dùng avatar.png trong thư mục hồ sơ";
      else state.textContent = `Không có ảnh — hiển thị chữ ${initials}`;
    }
    updateExportActionVisibility();
  };

  const handleRemoveAvatar = () => {
    avatarUploadSourceName = "";
    setAssetFieldDisplay($("#editAvatar"), "", "");
    setAssetFieldDisplay($("#editFavicon"), "", "");
    if (editorDraft?.profile) {
      editorDraft.profile.avatar = "";
      editorDraft.profile.favicon = "";
    }
    renderAdminAvatarPreview();
    showToast("Đã bỏ avatar; trang sẽ dùng 2 chữ cái từ tên hồ sơ");
  };

  const handleAvatarUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 8_000_000) return showToast("Ảnh gốc nên nhỏ hơn 8 MB");
    try {
      avatarUploadSourceName = file.name || "ảnh từ thiết bị";
      const dataUrl = await fileToCircularPngDataUrl(file);
      setAssetFieldDisplay($("#editAvatar"), dataUrl, formatEmbeddedAssetLabel("Avatar PNG tròn", "avatar.png"));
      setAssetFieldDisplay($("#editFavicon"), dataUrl, formatEmbeddedAssetLabel("Icon tab", "avatar.png"));
      editorDraft.profile.avatar = dataUrl;
      editorDraft.profile.favicon = dataUrl;
      renderAdminAvatarPreview();
      showToast("Đã crop ảnh tròn; hãy tải gói ZIP để nhận avatar.png");
    } catch (error) {
      console.error(error);
      showToast("Không thể xử lý ảnh này");
    } finally {
      event.target.value = "";
    }
  };

  const handleFaviconUpload = async event => {
    if (!isPrimaryProfile) return showToast("Tài khoản phụ dùng icon tab theo avatar");
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 800_000) return showToast("Icon tab nên nhỏ hơn 800 KB");
    setAssetFieldDisplay($("#editFavicon"), await fileToDataUrl(file), formatEmbeddedAssetLabel("Icon tab", "favicon.png"));
    bindAssetFieldEditing($("#editFavicon"));
    showToast("Đã nạp icon trên tab web");
  };

  const handleBackgroundUpload = async (event, targetSelector, label) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2_500_000) return showToast("Ảnh nền nên nhỏ hơn 2.5 MB");
    const target = $(targetSelector);
    if (!target) return;
    setAssetFieldDisplay(target, await fileToDataUrl(file), formatEmbeddedAssetLabel(label, label.includes("ngoài") ? "background-outer.webp" : "background-inner.webp"));
    bindAssetFieldEditing(target);
    collectEditorFields();
    updateExportActionVisibility();
    showToast(`Đã nạp ${label}; hãy tải gói ZIP`);
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
    if (!isPrimaryProfile) return;
    const input = event.target.closest('[data-action="item-image-upload"]');
    if (!input) return;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) return showToast("Ảnh nên nhỏ hơn 1.5 MB");
    const card = input.closest(".admin-item");
    const imageField = $('[data-field="image"]', card);
    setItemAssetValue(imageField, await fileToDataUrl(file), "Ảnh icon lớn", {});
    collectEditorFields();
    updateExportActionVisibility();
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
    safeStorageRemove(languageStorageKey);
    currentLanguage = resolveInitialLanguage();
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
    updateExportActionVisibility();
    showToast(hasEmbeddedAssetsInDraft(editorDraft) ? "Đã lưu xem trước; có ảnh mới nên hãy tải gói ZIP" : "Đã lưu trên trình duyệt này");
    $("#editNewPassword").value = "";
    $("#editConfirmPassword").value = "";
  };

  const commitSavedConfigToPreview = () => {
    config = normalizeConfig(editorDraft);
    editorDraft = normalizeConfig(editorDraft);
    safeStorageSet(storageKey, JSON.stringify(config));
    safeStorageRemove("bio-theme");
    safeStorageRemove(languageStorageKey);
    currentLanguage = resolveInitialLanguage();
    setTheme(resolveInitialTheme());
    renderAll();
    populateEditor();
    updateExportActionVisibility();
  };

  const saveConfigToServer = async () => {
    collectEditorFields();
    if (!(await applyNewPassword())) return;
    const server = editorDraft.admin?.serverSave || DEFAULT_SERVER_SAVE;
    if (server.enabled === false) {
      showToast("Chức năng lưu máy chủ đang tắt");
      return;
    }
    if (location.protocol === "file:") {
      showToast("Hãy mở trang qua host PHP để lưu lên máy chủ");
      return;
    }
    if (!adminSessionPassword) {
      showToast("Hãy đóng và mở lại cài đặt để xác thực mật khẩu");
      return;
    }
    const button = $("#serverSaveButton");
    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `${icon("upload-cloud", 17)} Đang lưu...`;
    try {
      const response = await fetch(server.endpoint || DEFAULT_SERVER_SAVE.endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-Requested-With": "BioLinkAdmin" },
        body: JSON.stringify({
          password: adminSessionPassword,
          profileSlug,
          config: editorDraft,
          newPasswordHash: editorDraft.admin?.passwordHash || ""
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error(result.message || `Lỗi máy chủ ${response.status}`);
      if (result.config && typeof result.config === "object") editorDraft = normalizeConfig(result.config);
      commitSavedConfigToPreview();
      if ($("#editNewPassword").value) adminSessionPassword = $("#editNewPassword").value;
      $("#editNewPassword").value = "";
      $("#editConfirmPassword").value = "";
      showToast("Đã lưu trực tiếp lên máy chủ");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Không thể lưu lên máy chủ");
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  };

  const profileDataFromConfig = draft => {
    const output = deepClone(draft || {});
    output.admin ||= {};
    delete output.admin.version;
    delete output.admin.mode;
    output.admin.serverSave = {
      ...(output.admin.serverSave || {}),
      enabled: IS_SERVER_MODE,
      endpoint: "api/save-profile.php"
    };
    return output;
  };

  const downloadTextFile = (content, fileName) => {
    const blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportEditorConfig = async () => {
    collectEditorFields();
    if (!(await applyNewPassword())) return;
    if (hasEmbeddedAssetsInDraft(editorDraft)) {
      updateExportActionVisibility();
      showToast("Có ảnh mới; bắt buộc tải gói ZIP để nhận profile.js và file ảnh thật");
      return;
    }
    const finalOutput = profileDataFromConfig(editorDraft);
    const content = `/* Dữ liệu và thiết lập riêng của hồ sơ ${profileSlug}. Mã giao diện/phiên bản nằm trong file hệ thống dùng chung. */
window.BIO_CONFIG = ${JSON.stringify(finalOutput, null, 2)};
`;
    downloadTextFile(content, "profile.js");
    showToast("Đã tải profile.js");
  };

  const DATA_URL_RE = /^data:([^;,]+)(?:;[^,]*)?;base64,(.+)$/i;
  const isEmbeddedDataUrl = value => DATA_URL_RE.test(String(value || ""));
  const fileExtensionForMime = mime => ({
    "image/png": "png",
    "image/webp": "webp",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
    "image/gif": "gif",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico"
  }[String(mime || "").toLowerCase()] || "bin");
  const dataUrlToBytes = dataUrl => {
    const match = String(dataUrl || "").match(DATA_URL_RE);
    if (!match) throw new Error("Dữ liệu ảnh không hợp lệ");
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return { mime: match[1], bytes };
  };
  const safeAssetName = value => String(value || "asset")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "asset";
  const getPreferredExportBaseName = () => {
    const profile = config?.profile || sourceConfig?.profile || {};
    const handle = String(profile.handle || "").replace(/^@+/, "").trim();
    return safeAssetName(handle || profile.name || profileSlug || "bio");
  };
  const profileZipFolder = () => profileSlug === "vinh" ? "bio" : `bio/${profileSlug}`;

  const buildSharedAssetsConfig = exported => ({
    linkImages: Object.fromEntries((exported.links || []).map(item => [item.id, item.image || ""])),
    socialImages: {}
  });

  const preparePortableProfileExport = draft => {
    const exported = profileDataFromConfig(draft);
    const assets = [];
    const reusedDataUrls = new Map();
    const usedPaths = new Set();

    const uniquePath = (baseName, extension) => {
      let candidate = `${baseName}.${extension}`;
      let counter = 2;
      while (usedPaths.has(candidate)) candidate = `${baseName}-${counter++}.${extension}`;
      usedPaths.add(candidate);
      return candidate;
    };

    const extract = (value, preferredBaseName) => {
      if (!isEmbeddedDataUrl(value)) return value;
      if (reusedDataUrls.has(value)) return reusedDataUrls.get(value);
      const { mime, bytes } = dataUrlToBytes(value);
      const extension = fileExtensionForMime(mime);
      const relativePath = uniquePath(preferredBaseName, extension);
      reusedDataUrls.set(value, relativePath);
      assets.push({ relativePath, bytes, mime });
      return relativePath;
    };

    exported.profile.avatar = extract(exported.profile.avatar, "avatar");
    exported.settings.appearance.outerBackgroundImage = extract(exported.settings.appearance.outerBackgroundImage, "uploads/background-outer");
    exported.settings.appearance.innerBackgroundImage = extract(exported.settings.appearance.innerBackgroundImage, "uploads/background-inner");

    if (isPrimaryProfile) {
      exported.profile.favicon = exported.profile.avatar || "";
      exported.links.forEach((item, index) => {
        item.image = extract(item.image, `assets/shared/link-${safeAssetName(item.id || item.title || index + 1)}`);
      });
      exported.socialIcons.forEach(item => { item.image = ""; });
      return { exported, assets, shared: buildSharedAssetsConfig(exported) };
    }

    // Hồ sơ phụ có avatar và nền riêng; chỉ ảnh icon lớn lấy từ shared-assets.js. Icon bé luôn đơn sắc.
    exported.profile.favicon = exported.profile.avatar || "";
    const linkImages = sharedAssets.linkImages || {};
    exported.links.forEach(item => {
      if (item?.id && hasOwn(linkImages, item.id)) item.image = linkImages[item.id] || "";
    });
    exported.socialIcons.forEach(item => { item.image = ""; });
    return { exported, assets, shared: null };
  };

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportUpdateZip = async () => {
    collectEditorFields();
    try {
      await ensureZipLibrary();
    } catch (error) {
      console.error(error);
      showToast("Không thể tải thư viện tạo ZIP");
      return;
    }
    const button = $("#exportUpdateZipButton");
    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `${icon("archive", 17)} Đang tạo ZIP...`;
    try {
      const { exported, assets, shared } = preparePortableProfileExport(editorDraft);
      const zip = new window.JSZip();
      const folder = profileZipFolder();
      const profileContent = `/* Dữ liệu và thiết lập riêng Bio Link - gói cập nhật ${SYSTEM_VERSION} */\nwindow.BIO_CONFIG = ${JSON.stringify(exported, null, 2)};\n`;
      zip.file(`${folder}/profile.js`, profileContent);
      if (isPrimaryProfile && shared) {
        const sharedContent = `/* Ảnh dùng chung Bio Link ${SYSTEM_VERSION} - chỉ tài khoản chính cập nhật */\nwindow.BIO_SHARED_ASSETS = ${JSON.stringify(shared, null, 2)};\n`;
        zip.file("bio/shared-assets.js", sharedContent);
      }
      assets.forEach(asset => zip.file(`${folder}/${asset.relativePath}`, asset.bytes));
      const guide = [
        `BIO LINK ${SYSTEM_VERSION} - GOI CAP NHAT RIENG HO SO`,
        "",
        `Ho so: ${exported.profile?.name || profileSlug}`,
        `Thu muc dich: ${folder}/`,
        `File du lieu va thiet lap ca nhan: ${folder}/profile.js`,
        `Số file ảnh mới: ${assets.length}`,
        isPrimaryProfile ? "Có kèm bio/shared-assets.js để các tài khoản phụ dùng chung ảnh icon lớn. Icon bé luôn đơn sắc." : "Hồ sơ phụ có thể chứa avatar và ảnh nền riêng; ảnh icon lớn lấy từ bio/shared-assets.js, icon bé luôn đơn sắc.",
        "",
        "Giai nen tai thu muc goc repository (noi dang co thu muc bio).",
        "Gói này chỉ chứa dữ liệu/ảnh cần cập nhật; không chứa lại index.html, CSS hoặc JS dùng chung."
      ].join("\n");
      zip.file("HUONG-DAN-CAP-NHAT.txt", guide);
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      downloadBlob(blob, `${getPreferredExportBaseName()}-cap-nhat-${SYSTEM_ASSET_VERSION}.zip`);
      showToast(isPrimaryProfile ? (assets.length ? `Đã tạo ZIP gồm profile.js, shared-assets.js và ${assets.length} ảnh` : "Đã tạo ZIP gồm profile.js và shared-assets.js") : (assets.length ? `Đã tạo ZIP gồm profile.js và ${assets.length} ảnh riêng` : "Đã tạo ZIP chỉ gồm profile.js"));
    } catch (error) {
      console.error(error);
      showToast(error.message || "Không thể tạo gói ZIP");
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  };

  const resetToSourceConfig = () => {
    if (!confirm(`Xóa cấu hình xem trước và đọc lại file ${profileDataFile}?`)) return;
    safeStorageRemove(storageKey);
    safeStorageRemove("bio-theme");
    safeStorageRemove(languageStorageKey);
    config = normalizeConfig(sourceConfig);
    editorDraft = normalizeConfig(sourceConfig);
    currentLanguage = resolveInitialLanguage();
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
    setupPublicTouchInteractions();
    currentLanguage = resolveInitialLanguage();
    setTheme(resolveInitialTheme());
    renderAll();
    applyLanguage();

    // Hiện toàn bộ hồ sơ và các nút trước. Giao diện Admin lớn được dựng ở lượt
    // rảnh kế tiếp nên không còn tình trạng logo/tên hiện trước, nút xuất hiện sau.
    requestAnimationFrame(() => {
      document.documentElement.dataset.bioReady = "true";
      const setupDeferredAdmin = () => {
        setupAdmin();
        setupAvatarGestures();
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(setupDeferredAdmin, { timeout: 700 });
      else window.setTimeout(setupDeferredAdmin, 0);
    });
  };

  init();
})();
