// js/game-menu.js
// =====================================================
// MENU THÔNG MINH THEO ĐỘ TUỔI / NHÓM HỌC
// -----------------------------------------------------
// Luồng:
// - Lần đầu: chọn độ tuổi.
// - Lần sau: vào thẳng menu đã lọc theo độ tuổi.
// - Có nút xổ đổi độ tuổi.
// - Có nút Phụ huynh/Test để hiện toàn bộ game.
// =====================================================

const MENU_STORAGE_KEY_AGE = 'behoc_selected_age_group';
const MENU_STORAGE_KEY_GROUP = 'behoc_selected_game_group';

const AGE_GROUPS = {
    toddler: {
        label: '3 - 4 tuổi',
        icon: '👶',
        note: 'Nhận biết màu, hình, số, phản xạ nhẹ'
    },
    preschool: {
        label: '4 - 5 tuổi',
        icon: '🐣',
        note: 'Làm quen chữ, số, so sánh, phân loại'
    },
    pre1: {
        label: 'Chuẩn bị lớp 1',
        icon: '🎒',
        note: 'Chữ cái, tiền toán, tư duy vào lớp 1'
    },
    grade1: {
        label: 'Lớp 1',
        icon: '📘',
        note: 'Cộng trừ, nối tính, nhân chia cơ bản'
    }
};

const GAME_GROUPS = [
    {
        id: 'discover',
        label: 'Khám phá',
        icon: '🎨'
    },
    {
        id: 'letters',
        label: 'Chữ cái',
        icon: '🔤'
    },
    {
        id: 'numbers',
        label: 'Số đếm',
        icon: '🔢'
    },
    {
        id: 'math',
        label: 'Toán',
        icon: '➕'
    },
    {
        id: 'memory',
        label: 'Ghi nhớ',
        icon: '🧠'
    },
    {
        id: 'reflex',
        label: 'Phản xạ',
        icon: '⚡'
    },
    {
        id: 'logic',
        label: 'Tư duy',
        icon: '🧩'
    }
];

const GAME_MENU_DATA = [
    // Khám phá
    {
        id: 'color',
        label: 'Màu Sắc',
        icon: '🎨',
        group: 'discover',
        ages: ['toddler', 'preschool'],
        color: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
        badge: 'V1.1'
    },
    {
        id: 'match_animal',
        label: 'Tìm Con Vật',
        icon: '🐶',
        group: 'discover',
        ages: ['toddler', 'preschool', 'pre1'],
        color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        badge: 'Beta'
    },

    // Chữ cái
    {
        id: 'alphabet',
        label: 'Bảng Chữ Cái',
        icon: '🔤',
        group: 'letters',
        ages: ['preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        badge: 'V3.1'
    },
    {
        id: 'alphabet_connect',
        label: 'Nối Chữ',
        icon: '🧩',
        group: 'letters',
        ages: ['pre1', 'grade1'],
        color: 'linear-gradient(135deg, #4facfe 0%, #43e97b 100%)',
        badge: 'V1.1'
    },
    {
        id: 'alphabet_listen',
        label: 'Nghe Chọn Chữ',
        icon: '👂🔤',
        group: 'letters',
        ages: ['preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        badge: 'New'
    },
    {
        id: 'alphabet_first',
        label: 'Chữ Đầu',
        icon: '🔤🖼️',
        group: 'letters',
        ages: ['preschool', 'pre1'],
        color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        badge: 'New'
    },
    {
        id: 'alphabet_odd',
        label: 'Chữ Khác',
        icon: '🔎',
        group: 'letters',
        ages: ['preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        badge: 'New'
    },
    {
        id: 'alphabet_order',
        label: 'Thứ Tự Chữ',
        icon: '🔠',
        group: 'letters',
        ages: ['pre1', 'grade1'],
        color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        badge: 'New'
    },
    {
        id: 'alphabet_reflex',
        label: 'Phản Xạ Chữ',
        icon: '⚡🔤',
        group: 'letters',
        ages: ['preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        badge: 'New'
    },

    // Số đếm
    {
        id: 'listen_number',
        label: 'Nghe & Tìm Số',
        icon: '👂',
        group: 'numbers',
        ages: ['toddler', 'preschool', 'pre1'],
        color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        badge: 'V2'
    },
    {
        id: 'count',
        label: 'Tập Đếm',
        icon: '🍎',
        group: 'numbers',
        ages: ['toddler', 'preschool', 'pre1'],
        color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        badge: 'V1.1'
    },
    {
        id: 'number_neighbor',
        label: 'Trước Sau',
        icon: '🔢',
        group: 'numbers',
        ages: ['preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        badge: 'New'
    },
    {
        id: 'number_countdown',
        label: 'Đếm Ngược',
        icon: '🔙',
        group: 'numbers',
        ages: ['preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        badge: 'New'
    },
    {
        id: 'number_more_less',
        label: 'Nhiều Ít',
        icon: '⚖️',
        group: 'numbers',
        ages: ['toddler', 'preschool', 'pre1'],
        color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        badge: 'New'
    },

    // Toán
    {
        id: 'math',
        label: 'Bé Tập Tính',
        icon: '➕➖',
        group: 'math',
        ages: ['pre1', 'grade1'],
        color: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
        badge: 'V1.0'
    },
    {
        id: 'math2',
        label: 'Bé Tách Gộp',
        icon: '🧩',
        group: 'math',
        ages: ['preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #4facfe 0%, #43e97b 100%)',
        badge: 'New'
    },
    {
        id: 'math_compare',
        label: 'Lớn Bé',
        icon: '⚖️',
        group: 'math',
        ages: ['preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #fbfe4f 0%, #e943db 100%)',
        badge: 'New'
    },
    {
        id: 'math_missing',
        label: 'Số Thiếu',
        icon: '❓',
        group: 'math',
        ages: ['pre1', 'grade1'],
        color: 'linear-gradient(135deg, #fe784f 0%, #4e43e9 100%)',
        badge: 'New'
    },
    {
        id: 'math_connect',
        label: 'Nối Tính',
        icon: '🔗',
        group: 'math',
        ages: ['pre1', 'grade1'],
        color: 'linear-gradient(135deg, #4facfe 0%, #43e97b 100%)',
        badge: 'New'
    },
    {
        id: 'times_table',
        label: 'Cửu Chương',
        icon: '✖️',
        group: 'math',
        ages: ['grade1'],
        color: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
        badge: 'New'
    },
    {
        id: 'division_basic',
        label: 'Phép Chia',
        icon: '➗',
        group: 'math',
        ages: ['grade1'],
        color: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        badge: 'New'
    },
    {
        id: 'multiply_divide',
        label: 'Nhân Chia',
        icon: '🧮',
        group: 'math',
        ages: ['grade1'],
        color: 'linear-gradient(135deg, #4facfe 0%, #43e97b 100%)',
        badge: 'New'
    },

    // Ghi nhớ / phản xạ / tư duy
    {
        id: 'memory_position',
        label: 'Nhớ Vị Trí',
        icon: '🧠',
        group: 'memory',
        ages: ['toddler', 'preschool', 'pre1'],
        color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        badge: 'New'
    },
    {
        id: 'card_match',
        label: 'Lật Thẻ',
        icon: '🃏',
        group: 'memory',
        ages: ['toddler', 'preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        badge: 'New'
    },
    {
        id: 'quick_reflex',
        label: 'Nhanh Tay',
        icon: '⚡',
        group: 'reflex',
        ages: ['toddler', 'preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        badge: 'New'
    },
    {
        id: 'pattern_rule',
        label: 'Quy Luật',
        icon: '🧩',
        group: 'logic',
        ages: ['toddler', 'preschool', 'pre1', 'grade1'],
        color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        badge: 'New'
    },
    {
        id: 'classify_group',
        label: 'Phân Loại',
        icon: '📦',
        group: 'logic',
        ages: ['preschool', 'pre1'],
        color: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
        badge: 'New'
    },

    // Chỉ hiện trong phụ huynh/test
    {
        id: 'math4',
        label: 'Tách Gộp 2',
        icon: '🧪',
        group: 'math',
        ages: [],
        color: 'linear-gradient(135deg, #d2fc8e 0%, #f4d98f 100%)',
        badge: 'Test',
        testOnly: true
    },
    {
        id: 'frame_test',
        label: 'Test Khung',
        icon: '🧪',
        group: 'logic',
        ages: [],
        color: 'linear-gradient(135deg, #777 0%, #bbb 100%)',
        badge: 'Test',
        testOnly: true
    }
];

function safeGetStorage(key, fallback = '') {
    try {
        return localStorage.getItem(key) || fallback;
    } catch (e) {
        return fallback;
    }
}

function safeSetStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {}
}

function getCurrentAgeGroup() {
    const age = safeGetStorage(MENU_STORAGE_KEY_AGE, '');
    return AGE_GROUPS[age] ? age : '';
}

function getAgeGames(age) {
    return GAME_MENU_DATA.filter(game => {
        if (game.testOnly) return false;
        return Array.isArray(game.ages) && game.ages.includes(age);
    });
}

function getAvailableGroups(age) {
    const games = getAgeGames(age);
    return GAME_GROUPS.filter(group =>
        games.some(game => game.group === group.id)
    );
}

function getCurrentGroup(age) {
    const groups = getAvailableGroups(age);
    if (!groups.length) return '';

    const saved = safeGetStorage(MENU_STORAGE_KEY_GROUP, groups[0].id);
    if (groups.some(group => group.id === saved)) {
        return saved;
    }

    safeSetStorage(MENU_STORAGE_KEY_GROUP, groups[0].id);
    return groups[0].id;
}

function renderGameMenu() {
    const root = document.getElementById('smart-menu-root');
    if (!root) return;

    const age = getCurrentAgeGroup();

    if (!age) {
        renderAgeSelectScreen(root);
        return;
    }

    renderMainGameMenu(root, age);
}


let parentGearTestTimer = null;
let parentGearActionDone = false;
let parentGearClickCount = 0;
let parentGearClickResetTimer = null;

// Nhấp đủ số lần này vào bánh răng để xoá cài đặt và chọn lại độ tuổi.
// Muốn dễ hơn thì đổi 10 thành 5.
const PARENT_GEAR_RESET_CLICK_COUNT = 10;

function renderParentGearButton() {
    return `
        <button
            class="parent-gear-btn"
            type="button"
            aria-label="Phụ huynh / Test"
            title="Giữ 1 giây để mở Test. Nhấp ${PARENT_GEAR_RESET_CLICK_COUNT} lần liên tiếp để xoá cài đặt và chọn lại độ tuổi."
            onpointerdown="startParentGearHold(event)"
            onpointerup="endParentGearHold(event)"
            onpointercancel="cancelParentGearHold()"
            onpointerleave="cancelParentGearHold()"
            onclick="handleParentGearClick(event)">
            ⚙
        </button>
    `;
}

function startParentGearHold(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    cancelParentGearHold();
    parentGearActionDone = false;

    // Giữ khoảng 1 giây: mở menu Phụ huynh/Test.
    // Không dùng giữ 5 giây để xoá nữa, vì giữ 1 giây đã mở Test trước.
    parentGearTestTimer = setTimeout(() => {
        parentGearTestTimer = null;
        parentGearActionDone = true;
        openParentTestMenu();
    }, 1000);
}

function endParentGearHold(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    cancelParentGearHold();
}

function cancelParentGearHold() {
    if (parentGearTestTimer) {
        clearTimeout(parentGearTestTimer);
        parentGearTestTimer = null;
    }
}

function handleParentGearClick(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Nếu click sinh ra sau khi vừa giữ 1 giây mở Test, bỏ qua click đó.
    if (parentGearActionDone) {
        parentGearActionDone = false;
        return;
    }

    parentGearClickCount += 1;

    if (parentGearClickResetTimer) {
        clearTimeout(parentGearClickResetTimer);
    }

    // Nếu dừng nhấp quá 3 giây thì đếm lại từ đầu.
    parentGearClickResetTimer = setTimeout(() => {
        parentGearClickCount = 0;
        parentGearClickResetTimer = null;
    }, 3000);

    if (parentGearClickCount >= PARENT_GEAR_RESET_CLICK_COUNT) {
        parentGearClickCount = 0;

        if (parentGearClickResetTimer) {
            clearTimeout(parentGearClickResetTimer);
            parentGearClickResetTimer = null;
        }

        closeParentTestMenu();
        resetKidMenuFromGear();
    }
}

function resetKidMenuFromGear() {
    cancelParentGearHold();

    const ok = confirm(
        'Xoá cài đặt hiện tại và quay lại chọn độ tuổi từ đầu?\n\n' +
        'Thao tác này sẽ xoá lựa chọn độ tuổi, nhóm học và dữ liệu tạm trong app.'
    );

    if (!ok) {
        parentGearActionDone = false;
        return;
    }

    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch (err) {
        console.warn('Không xoá được storage:', err);
    }

    closeParentTestMenu();

    const root = document.getElementById('smart-menu-root');
    if (root) {
        renderAgeSelectScreen(root);
    } else {
        renderGameMenu();
    }
}

function renderAgeSelectScreen(root) {
    const cards = Object.entries(AGE_GROUPS).map(([ageId, age]) => `
        <button
            class="age-card"
            type="button"
            onclick="selectKidAge('${ageId}')">
            <span class="age-card-icon">${age.icon}</span>
            <span class="age-card-label">${age.label}</span>
            <span class="age-card-note">${age.note}</span>
        </button>
    `).join('');

    root.innerHTML = `
        <section class="age-select-screen">
            <h1 class="app-title smart-title">Bé mấy tuổi?</h1>
            <p class="smart-subtitle">Chọn một lần để app tự gợi ý bài phù hợp.</p>
            <div class="age-card-grid">
                ${cards}
            </div>

            <div class="parent-gear-zone">
                ${renderParentGearButton()}
            </div>
        </section>
    `;
}

function renderMainGameMenu(root, age) {
    const ageInfo = AGE_GROUPS[age];
    const groups = getAvailableGroups(age);
    const currentGroup = getCurrentGroup(age);
    const games = getAgeGames(age).filter(game => game.group === currentGroup);

    const ageOptions = Object.entries(AGE_GROUPS).map(([ageId, item]) => `
        <option value="${ageId}" ${ageId === age ? 'selected' : ''}>
            ${item.icon} ${item.label}
        </option>
    `).join('');

    const groupTabs = groups.map(group => `
        <button
            class="menu-group-tab ${group.id === currentGroup ? 'active' : ''}"
            type="button"
            onclick="setGameMenuGroup('${group.id}')">
            <span>${group.icon}</span>
            <span>${group.label}</span>
        </button>
    `).join('');

    root.innerHTML = `
        <section class="smart-menu-screen">
            <div class="smart-menu-header">
                <div>
                    <h1 class="smart-menu-title">Bé chọn bài nhé</h1>
                    <div class="smart-age-line">
                        <span>Độ tuổi:</span>
                        <select class="smart-age-select" onchange="selectKidAge(this.value)">
                            ${ageOptions}
                        </select>
                    </div>
                </div>
                <div class="smart-age-badge" title="${ageInfo.note}">
                    <span>${ageInfo.icon}</span>
                </div>
            </div>

            <div class="menu-group-tabs">
                ${groupTabs}
            </div>

            <div class="smart-game-grid">
                ${games.map(renderMenuGameButton).join('')}
            </div>

            <div class="smart-menu-footer">
                ${renderParentGearButton()}
            </div>
        </section>
    `;
}

function renderMenuGameButton(game) {
    const badge = game.badge
        ? `<span class="${game.badge === 'New' ? 'menu-new-app' : 'menu-version'}">${game.badge}</span>`
        : '';

    return `
        <button
            class="menu-btn smart-game-btn"
            type="button"
            onclick="startGameFromSmartMenu('${game.id}')"
            style="background: ${game.color};">
            ${badge}
            <div class="menu-icon">${game.icon}</div>
            <div class="menu-label">${game.label}</div>
        </button>
    `;
}

function selectKidAge(ageId) {
    if (!AGE_GROUPS[ageId]) return;

    safeSetStorage(MENU_STORAGE_KEY_AGE, ageId);

    const groups = getAvailableGroups(ageId);
    if (groups.length) {
        safeSetStorage(MENU_STORAGE_KEY_GROUP, groups[0].id);
    }

    renderGameMenu();
}

function setGameMenuGroup(groupId) {
    safeSetStorage(MENU_STORAGE_KEY_GROUP, groupId);
    renderGameMenu();
}

function startGameFromSmartMenu(gameId) {
    if (typeof startGame !== 'function') {
        console.warn('startGame chưa sẵn sàng:', gameId);
        return;
    }

    startGame(gameId);
}

function openParentTestMenu() {
    const root = document.getElementById('smart-menu-root');
    if (!root) return;

    const old = document.getElementById('parent-test-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'parent-test-overlay';
    overlay.className = 'parent-test-overlay';

    const allGames = GAME_MENU_DATA.slice();

    overlay.innerHTML = `
        <div class="parent-test-box">
            <div class="parent-test-head">
                <div>
                    <div class="parent-test-title">⚙ Phụ huynh / Test</div>
                    <div class="parent-test-note">Hiện toàn bộ game để test nhanh khi sửa code.</div>
                </div>
                <button class="parent-test-close" type="button" onclick="closeParentTestMenu()">✕</button>
            </div>

            <div class="parent-test-grid">
                ${allGames.map(renderMenuGameButton).join('')}
            </div>
        </div>
    `;

    root.appendChild(overlay);
}

function closeParentTestMenu() {
    const overlay = document.getElementById('parent-test-overlay');
    if (overlay) overlay.remove();
}

window.renderGameMenu = renderGameMenu;
window.selectKidAge = selectKidAge;
window.setGameMenuGroup = setGameMenuGroup;
window.startGameFromSmartMenu = startGameFromSmartMenu;
window.openParentTestMenu = openParentTestMenu;
window.closeParentTestMenu = closeParentTestMenu;
window.renderParentGearButton = renderParentGearButton;
window.startParentGearHold = startParentGearHold;
window.endParentGearHold = endParentGearHold;
window.cancelParentGearHold = cancelParentGearHold;
window.handleParentGearClick = handleParentGearClick;
window.resetKidMenuFromGear = resetKidMenuFromGear;

window.addEventListener('DOMContentLoaded', renderGameMenu);
