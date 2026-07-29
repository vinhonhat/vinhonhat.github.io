(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const deepClone = value => JSON.parse(JSON.stringify(value));
  const sourceConfig = deepClone(window.BIO_CONFIG || {});
  const storageKey = sourceConfig.admin?.storageKey || "vinh-bio-admin-config-v2";

  const ICONS = {
    "arrow-up-right": '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    "book-open": '<path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H9a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4.5A2.5 2.5 0 0 0 2 20.5z"/><path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H15a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h4.5a2.5 2.5 0 0 1 2.5 2.5z"/>',
    "bell": '<path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/><path d="M3.3 17h17.4c-1.6-1.8-2.4-3.8-2.4-6.2A6.3 6.3 0 0 0 12 4.5a6.3 6.3 0 0 0-6.3 6.3c0 2.4-.8 4.4-2.4 6.2Z"/><path d="M10 4.5a2 2 0 0 1 4 0"/>',
    "check": '<path d="m5 12 4 4L19 6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "chevron-up": '<path d="m18 15-6-6-6 6"/>',
    "copy": '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
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

  const loadConfig = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : deepClone(sourceConfig);
    } catch {
      return deepClone(sourceConfig);
    }
  };

  let config = loadConfig();
  let editorDraft = null;

  const media = (item, className, fallbackIcon = "globe") => {
    if (item?.image) {
      return `<img class="${className}" src="${escapeAttribute(item.image)}" alt="" loading="lazy" />`;
    }
    return icon(item?.icon || fallbackIcon);
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
      <a class="link-card${item.featured ? " featured" : ""}" href="${escapeAttribute(item.url || "#")}" ${target}>
        <span class="link-icon">${media(item, "link-image")}</span>
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
    const section = $("#socialSection");
    section.classList.toggle("hidden", !socials.length);
    if (!socials.length) {
      $("#socialContainer").innerHTML = "";
      return;
    }
    const target = config.settings?.openLinksInNewTab ? 'target="_blank" rel="noopener noreferrer"' : "";
    $("#socialContainer").innerHTML = socials.map(item => `
      <a class="social-button" href="${escapeAttribute(item.url || "#")}" aria-label="${escapeAttribute(item.label)}" title="${escapeAttribute(item.label)}" ${target}>${media(item, "social-image")}</a>
    `).join("");
  };

  const renderAnnouncement = () => {
    const item = config.settings?.announcement;
    const el = $("#announcement");
    el.classList.toggle("hidden", !item?.enabled || !item?.text);
    el.innerHTML = item?.enabled && item?.text ? `${icon(item.icon || "bell", 18)}<span>${escapeHtml(item.text)}</span>` : "";
  };

  const renderAll = () => {
    applyProfile();
    renderAnnouncement();
    renderLinks();
    renderSocials();
    applyActionVisibility();
  };

  const resolveInitialTheme = () => {
    const saved = localStorage.getItem("bio-theme");
    if (saved === "dark" || saved === "light") return saved;
    const configured = config.settings?.defaultTheme || "auto";
    if (configured === "dark" || configured === "light") return configured;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const setTheme = theme => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bio-theme", theme);
    $("#themeButton").innerHTML = icon(theme === "dark" ? "sun" : "moon");
    $("#themeButton").title = theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";
  };

  const applyActionVisibility = () => {
    const settings = config.settings || {};
    $("#themeButton").classList.toggle("hidden", !settings.showThemeButton);
    $("#shareButton").classList.toggle("hidden", !settings.showShareButton);
    $("#qrButton").classList.toggle("hidden", !settings.showQrButton);
  };

  const sharePage = async () => {
    const data = { title: document.title, text: config.profile?.bio || "Xem các liên kết của tôi", url: location.href };
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

  const setupActions = () => {
    $("#shareButton").innerHTML = icon("share-2");
    $("#qrButton").innerHTML = `${icon("qr-code", 16)}<span>Mã QR</span>`;
    $("#copyLinkButton").innerHTML = `${icon("copy", 18)}<span>Sao chép liên kết</span>`;
    $(".modal-close").innerHTML = icon("x");
    $(".modal-icon").innerHTML = icon("qr-code", 28);

    $("#themeButton").addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
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
          <label class="admin-field"><span>Mật khẩu</span><input id="adminPassword" type="password" autocomplete="current-password" required /></label>
          <p id="adminLoginError" class="admin-error hidden">Mật khẩu không đúng.</p>
          <button class="admin-primary wide" type="submit">${icon("lock", 18)} Mở cài đặt</button>
        </form>
      </section>

      <section id="adminEditor" class="admin-editor hidden" role="dialog" aria-modal="true" aria-labelledby="adminTitle">
        <header class="admin-header">
          <div><span class="admin-kicker">BIO LINK</span><h2 id="adminTitle">Cài đặt trang</h2></div>
          <button class="admin-close" type="button" data-admin-close aria-label="Đóng">${icon("x")}</button>
        </header>
        <div class="admin-body">
          <section class="admin-section">
            <h3>Thông tin chính</h3>
            <div class="admin-grid two">
              <label class="admin-field"><span>Tên hiển thị</span><input id="editName" type="text" /></label>
              <label class="admin-field"><span>Tên tài khoản</span><input id="editHandle" type="text" /></label>
            </div>
            <label class="admin-field"><span>Mô tả</span><textarea id="editBio" rows="3"></textarea></label>
            <div class="admin-grid two">
              <label class="admin-field"><span>Logo / ảnh đại diện</span><input id="editAvatar" type="text" placeholder="assets/logo.png hoặc URL ảnh" /></label>
              <label class="admin-field"><span>Chữ cuối trang</span><input id="editFooter" type="text" /></label>
            </div>
            <label class="admin-upload">${icon("image", 18)} Chọn ảnh logo từ máy<input id="avatarUpload" type="file" accept="image/*" /></label>
            <p class="admin-help">Chọn ảnh sẽ nhúng ảnh vào cấu hình. Để file nhẹ hơn, nên chép ảnh vào thư mục <b>assets</b> rồi nhập đường dẫn.</p>
          </section>

          <section class="admin-section">
            <h3>Nút và thông báo</h3>
            <div class="admin-checks">
              <label><input id="editThemeButton" type="checkbox" /> Hiện nút sáng/tối</label>
              <label><input id="editShareButton" type="checkbox" /> Hiện nút chia sẻ</label>
              <label><input id="editQrButton" type="checkbox" /> Hiện nút mã QR</label>
              <label><input id="editNewTab" type="checkbox" /> Mở liên kết ở tab mới</label>
              <label><input id="editAnnouncementEnabled" type="checkbox" /> Hiện thông báo</label>
            </div>
            <label class="admin-field"><span>Nội dung thông báo</span><input id="editAnnouncementText" type="text" /></label>
          </section>

          <section class="admin-section">
            <div class="admin-section-title"><div><h3>Nút liên kết lớn</h3><p>Kéo thứ tự bằng nút lên/xuống; bật công tắc để hiện.</p></div><button id="addLinkButton" class="admin-secondary" type="button">${icon("plus", 17)} Thêm nút</button></div>
            <div id="adminLinks" class="admin-items"></div>
          </section>

          <section class="admin-section">
            <div class="admin-section-title"><div><h3>Icon mạng xã hội nhỏ</h3><p>Đây là hàng icon tròn nằm dưới các nút lớn.</p></div><button id="addSocialButton" class="admin-secondary" type="button">${icon("plus", 17)} Thêm icon</button></div>
            <div id="adminSocials" class="admin-items"></div>
          </section>

          <section class="admin-section">
            <h3>Đổi mật khẩu</h3>
            <div class="admin-grid two">
              <label class="admin-field"><span>Mật khẩu mới</span><input id="editNewPassword" type="password" autocomplete="new-password" /></label>
              <label class="admin-field"><span>Nhập lại mật khẩu</span><input id="editConfirmPassword" type="password" autocomplete="new-password" /></label>
            </div>
            <p class="admin-help">Để trống nếu không muốn đổi. Mật khẩu chỉ giúp tránh người dùng thông thường; GitHub Pages là web tĩnh nên không thể bảo mật tuyệt đối.</p>
          </section>
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
      editorDraft.links.push({ enabled: true, featured: false, icon: "globe", image: "", title: "Liên kết mới", description: "", url: "https://", badge: "" });
      renderEditorItems("links");
    });
    $("#addSocialButton").addEventListener("click", () => {
      collectEditorFields();
      editorDraft.socialIcons.push({ enabled: true, icon: "globe", image: "", label: "Mạng xã hội", url: "https://" });
      renderEditorItems("socials");
    });
    $("#adminLinks").addEventListener("click", handleItemAction);
    $("#adminSocials").addEventListener("click", handleItemAction);
    $("#adminLinks").addEventListener("change", handleImageUpload);
    $("#adminSocials").addEventListener("change", handleImageUpload);
    $("#avatarUpload").addEventListener("change", handleAvatarUpload);
  };

  const openAdminLogin = () => {
    const overlay = $("#adminOverlay");
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    $("#adminLogin").classList.remove("hidden");
    $("#adminEditor").classList.add("hidden");
    $("#adminLoginError").classList.add("hidden");
    $("#adminPassword").value = "";
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
    editorDraft = deepClone(config);
    editorDraft.links ||= [];
    editorDraft.socialIcons ||= [];
    editorDraft.profile ||= {};
    editorDraft.settings ||= {};
    editorDraft.settings.announcement ||= {};
    editorDraft.admin ||= deepClone(sourceConfig.admin || {});
    populateEditor();
    $("#adminLogin").classList.add("hidden");
    $("#adminEditor").classList.remove("hidden");
  };

  const populateEditor = () => {
    $("#editName").value = editorDraft.profile.name || "";
    $("#editHandle").value = editorDraft.profile.handle || "";
    $("#editBio").value = editorDraft.profile.bio || "";
    $("#editAvatar").value = editorDraft.profile.avatar || "";
    $("#editFooter").value = editorDraft.profile.footerText || "";
    $("#editThemeButton").checked = editorDraft.settings.showThemeButton !== false;
    $("#editShareButton").checked = editorDraft.settings.showShareButton !== false;
    $("#editQrButton").checked = editorDraft.settings.showQrButton !== false;
    $("#editNewTab").checked = editorDraft.settings.openLinksInNewTab !== false;
    $("#editAnnouncementEnabled").checked = !!editorDraft.settings.announcement?.enabled;
    $("#editAnnouncementText").value = editorDraft.settings.announcement?.text || "";
    $("#editNewPassword").value = "";
    $("#editConfirmPassword").value = "";
    renderEditorItems("links");
    renderEditorItems("socials");
  };

  const renderEditorItems = type => {
    const isLinks = type === "links";
    const list = isLinks ? editorDraft.links : editorDraft.socialIcons;
    const container = isLinks ? $("#adminLinks") : $("#adminSocials");
    container.innerHTML = list.map((item, index) => `
      <article class="admin-item" data-type="${type}" data-index="${index}">
        <div class="admin-item-top">
          <label class="admin-switch"><input data-field="enabled" type="checkbox" ${item.enabled ? "checked" : ""}/><span></span><b>${item.enabled ? "Đang hiện" : "Đang ẩn"}</b></label>
          <div class="admin-order">
            <button type="button" data-action="up" title="Đưa lên" ${index === 0 ? "disabled" : ""}>${icon("chevron-up", 17)}</button>
            <button type="button" data-action="down" title="Đưa xuống" ${index === list.length - 1 ? "disabled" : ""}>${icon("chevron-down", 17)}</button>
            <button type="button" data-action="delete" class="delete" title="Xóa">${icon("trash-2", 17)}</button>
          </div>
        </div>
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
        <div class="admin-item-options">
          ${isLinks ? `<label><input data-field="featured" type="checkbox" ${item.featured ? "checked" : ""}/> Làm nổi bật</label>` : ""}
          <label class="admin-upload small">${icon("image", 16)} Chọn ảnh<input data-action="item-image-upload" type="file" accept="image/*" /></label>
        </div>
      </article>
    `).join("");
  };

  const collectEditorFields = () => {
    if (!editorDraft) return;
    editorDraft.profile.name = $("#editName").value.trim();
    editorDraft.profile.handle = $("#editHandle").value.trim();
    editorDraft.profile.bio = $("#editBio").value.trim();
    editorDraft.profile.avatar = $("#editAvatar").value.trim();
    editorDraft.profile.footerText = $("#editFooter").value.trim();
    editorDraft.settings.showThemeButton = $("#editThemeButton").checked;
    editorDraft.settings.showShareButton = $("#editShareButton").checked;
    editorDraft.settings.showQrButton = $("#editQrButton").checked;
    editorDraft.settings.openLinksInNewTab = $("#editNewTab").checked;
    editorDraft.settings.announcement.enabled = $("#editAnnouncementEnabled").checked;
    editorDraft.settings.announcement.text = $("#editAnnouncementText").value.trim();

    $$(".admin-item").forEach(card => {
      const type = card.dataset.type;
      const index = Number(card.dataset.index);
      const list = type === "links" ? editorDraft.links : editorDraft.socialIcons;
      const item = list[index];
      if (!item) return;
      $$('[data-field]', card).forEach(field => {
        item[field.dataset.field] = field.type === "checkbox" ? field.checked : field.value.trim();
      });
    });
  };

  const handleItemAction = event => {
    const button = event.target.closest("[data-action]");
    if (!button || button.dataset.action === "item-image-upload") return;
    collectEditorFields();
    const card = button.closest(".admin-item");
    const type = card.dataset.type;
    const index = Number(card.dataset.index);
    const list = type === "links" ? editorDraft.links : editorDraft.socialIcons;
    if (button.dataset.action === "up" && index > 0) [list[index - 1], list[index]] = [list[index], list[index - 1]];
    if (button.dataset.action === "down" && index < list.length - 1) [list[index + 1], list[index]] = [list[index], list[index + 1]];
    if (button.dataset.action === "delete" && confirm("Xóa mục này?")) list.splice(index, 1);
    renderEditorItems(type);
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

  const handleImageUpload = async event => {
    const input = event.target.closest('[data-action="item-image-upload"]');
    if (!input) return;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) return showToast("Ảnh nên nhỏ hơn 1.5 MB");
    const card = input.closest(".admin-item");
    const imageField = $('[data-field="image"]', card);
    imageField.value = await fileToDataUrl(file);
    showToast("Đã nạp ảnh thay icon");
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
    config = deepClone(editorDraft);
    localStorage.setItem(storageKey, JSON.stringify(config));
    renderAll();
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
    localStorage.removeItem(storageKey);
    config = deepClone(sourceConfig);
    editorDraft = deepClone(sourceConfig);
    renderAll();
    populateEditor();
    showToast("Đã quay về cấu hình trong file");
  };

  const init = () => {
    setupActions();
    renderAll();
    setTheme(resolveInitialTheme());
    setupAdmin();
  };

  init();
})();
