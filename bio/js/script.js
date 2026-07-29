(() => {
  "use strict";

  const config = window.BIO_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const ICONS = {
    "arrow-up-right": '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    "book-open": '<path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H9a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4.5A2.5 2.5 0 0 0 2 20.5z"/><path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H15a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h4.5a2.5 2.5 0 0 1 2.5 2.5z"/>',
    "bell": '<path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/><path d="M3.3 17h17.4c-1.6-1.8-2.4-3.8-2.4-6.2A6.3 6.3 0 0 0 12 4.5a6.3 6.3 0 0 0-6.3 6.3c0 2.4-.8 4.4-2.4 6.2Z"/><path d="M10 4.5a2 2 0 0 1 4 0"/>',
    "check": '<path d="m5 12 4 4L19 6"/>',
    "copy": '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    "facebook": '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.5l.5-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    "map": '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>',
    "map-pin": '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    "message-circle": '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
    "message-circle-more": '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/>',
    "message-square": '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
    "music-2": '<circle cx="8" cy="18" r="3"/><path d="M11 18V2l10 3"/><circle cx="18" cy="16" r="3"/><path d="M21 16V5"/>',
    "moon": '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"/>',
    "qr-code": '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    "share-2": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    "sparkles": '<path d="m12 3-1.7 3.8L6.5 8.5l3.8 1.7L12 14l1.7-3.8 3.8-1.7-3.8-1.7Z"/><path d="m5 15-.9 2.1L2 18l2.1.9L5 21l.9-2.1L8 18l-2.1-.9Z"/><path d="m19 14-.7 1.3L17 16l1.3.7L19 18l.7-1.3L21 16l-1.3-.7Z"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.42 1.42"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "youtube": '<path d="M2.5 17a24.1 24.1 0 0 1 0-10 2.1 2.1 0 0 1 1.5-1.5 49.5 49.5 0 0 1 16 0A2.1 2.1 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10 2.1 2.1 0 0 1-1.5 1.5 49.5 49.5 0 0 1-16 0A2.1 2.1 0 0 1 2.5 17Z"/><path d="m10 15 5-3-5-3z"/>'
  };

  const icon = (name, size = 21) => {
    const content = ICONS[name] || ICONS.globe;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
  };

  const showToast = (message) => {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  const applyProfile = () => {
    const profile = config.profile || {};
    $("#profileName").textContent = profile.name || "Bio Link";
    $("#profileHandle").textContent = profile.handle || "";
    $("#profileBio").textContent = profile.bio || "";
    $("#footerText").textContent = profile.footerText || profile.name || "Bio Link";
    if (profile.avatar) $("#profileAvatar").src = profile.avatar;
    document.title = `${profile.name || "Bio Link"} | Bio Link`;

    const badges = Array.isArray(profile.badges) ? profile.badges : [];
    $("#profileBadges").innerHTML = badges.map(item => `
      <span class="badge">${icon(item.icon, 15)}<span>${escapeHtml(item.text)}</span></span>
    `).join("");
  };

  const renderLinks = () => {
    const links = (config.links || []).filter(item => item.enabled);
    const target = config.settings?.openLinksInNewTab ? 'target="_blank" rel="noopener noreferrer"' : "";
    $("#linksContainer").innerHTML = links.map(item => `
      <a class="link-card${item.featured ? " featured" : ""}" href="${escapeAttribute(item.url)}" ${target}>
        <span class="link-icon">${icon(item.icon)}</span>
        <span class="link-copy">
          <span class="link-title">${escapeHtml(item.title)}${item.badge ? `<span class="tag-new">${escapeHtml(item.badge)}</span>` : ""}</span>
          ${item.description ? `<span class="link-description">${escapeHtml(item.description)}</span>` : ""}
        </span>
        <span class="link-arrow">${icon("arrow-up-right", 19)}</span>
      </a>
    `).join("");
  };

  const renderSocials = () => {
    const socials = (config.socialIcons || []).filter(item => item.enabled);
    if (!socials.length) return;
    const target = config.settings?.openLinksInNewTab ? 'target="_blank" rel="noopener noreferrer"' : "";
    $("#socialContainer").innerHTML = socials.map(item => `
      <a class="social-button" href="${escapeAttribute(item.url)}" aria-label="${escapeAttribute(item.label)}" title="${escapeAttribute(item.label)}" ${target}>${icon(item.icon)}</a>
    `).join("");
    $("#socialSection").classList.remove("hidden");
  };

  const renderAnnouncement = () => {
    const item = config.settings?.announcement;
    if (!item?.enabled || !item.text) return;
    const el = $("#announcement");
    el.innerHTML = `${icon(item.icon || "bell", 18)}<span>${escapeHtml(item.text)}</span>`;
    el.classList.remove("hidden");
  };

  const resolveInitialTheme = () => {
    const saved = localStorage.getItem("bio-theme");
    if (saved === "dark" || saved === "light") return saved;
    const configured = config.settings?.defaultTheme || "auto";
    if (configured === "dark" || configured === "light") return configured;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bio-theme", theme);
    $("#themeButton").innerHTML = icon(theme === "dark" ? "sun" : "moon");
    $("#themeButton").title = theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";
  };

  const setupActions = () => {
    const settings = config.settings || {};
    const themeButton = $("#themeButton");
    const shareButton = $("#shareButton");
    const qrButton = $("#qrButton");

    if (!settings.showThemeButton) themeButton.classList.add("hidden");
    if (!settings.showShareButton) shareButton.classList.add("hidden");
    if (!settings.showQrButton) qrButton.classList.add("hidden");

    shareButton.innerHTML = icon("share-2");
    qrButton.innerHTML = `${icon("qr-code", 16)}<span>Mã QR</span>`;
    $("#copyLinkButton").innerHTML = `${icon("copy", 18)}<span>Sao chép liên kết</span>`;
    $(".modal-close").innerHTML = icon("x");
    $(".modal-icon").innerHTML = icon("qr-code", 28);

    themeButton.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      setTheme(next);
    });

    shareButton.addEventListener("click", sharePage);
    qrButton.addEventListener("click", openQrModal);
    $("#copyLinkButton").addEventListener("click", copyPageUrl);
    $$('[data-close-modal]').forEach(el => el.addEventListener("click", closeQrModal));
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeQrModal(); });
  };

  const sharePage = async () => {
    const data = {
      title: document.title,
      text: config.profile?.bio || "Xem các liên kết của tôi",
      url: location.href
    };
    try {
      if (navigator.share) await navigator.share(data);
      else await copyPageUrl();
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Không thể chia sẻ lúc này");
    }
  };

  const copyPageUrl = async () => {
    const value = config.settings?.qrUrl || location.href;
    try {
      await navigator.clipboard.writeText(value);
      showToast("Đã sao chép liên kết");
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast("Đã sao chép liên kết");
    }
  };

  const openQrModal = () => {
    const modal = $("#qrModal");
    const url = encodeURIComponent(config.settings?.qrUrl || location.href);
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=8&data=${url}`;
    $("#qrCanvas").innerHTML = `<img src="${qrImage}" alt="Mã QR dẫn đến trang Bio" />`;
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

  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  })[char]);
  const escapeAttribute = escapeHtml;

  const init = () => {
    applyProfile();
    renderAnnouncement();
    renderLinks();
    renderSocials();
    setTheme(resolveInitialTheme());
    setupActions();
  };

  init();
})();
