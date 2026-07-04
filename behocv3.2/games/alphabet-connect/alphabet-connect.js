// games/alphabet-connect/alphabet-connect.js
// =====================================================
// GAME: NỐI CHỮ
// Chuẩn v3.2 - custom game dùng chung top-bar/khung ngoài.
//
// Luật bản đầu:
// - Chạm 2 ô đúng cặp thì biến mất.
// - Chưa dùng luật đường đi Pikachu phức tạp.
// - Có menu chọn: Chữ với chữ / Chữ với hình.
// - Có level, điểm sao, tạm dừng/tiếp tục, timer tăng theo level.
// =====================================================

// =====================================================
// DATA
// Ảnh dùng imgPath(fileName) từ js/asset.js.
// Âm chữ dùng alphabetAudioPath(fileName) từ js/asset.js.
// =====================================================

const AC_SIMPLE_ITEMS = [
    { key: 'a',  word: 'cái ca',    img: 'ca.png',         audio: 'spell_a.mp3' },
    { key: 'ă',  word: 'con trăn',  img: 'tran.png',       audio: 'spell_aw.mp3' },
    { key: 'â',  word: 'cái ấm',    img: 'am.png',         audio: 'spell_aa.mp3' },
    { key: 'b',  word: 'con bò',    img: 'bo.png',         audio: 'spell_b.mp3' },
    { key: 'c',  word: 'con cá',    img: 'ca_fish.png',    audio: 'spell_c.mp3' },
    { key: 'd',  word: 'con dê',    img: 'de.png',         audio: 'spell_d.mp3' },
    { key: 'đ',  word: 'đu đủ',     img: 'dudu.png',       audio: 'spell_dd.mp3' },
    { key: 'e',  word: 'em bé',     img: 'embe.png',       audio: 'spell_e.mp3' },
    { key: 'ê',  word: 'con ếch',   img: 'ech.png',        audio: 'spell_ee.mp3' },
    { key: 'g',  word: 'con gà',    img: 'ga.png',         audio: 'spell_g.mp3' },
    { key: 'h',  word: 'bông hoa',  img: 'hoa.png',        audio: 'spell_h.mp3' },
    { key: 'i',  word: 'viên bi',   img: 'bi.png',         audio: 'spell_i.mp3' },
    { key: 'k',  word: 'cái kéo',   img: 'keo.png',        audio: 'spell_k.mp3' },
    { key: 'l',  word: 'con lợn',   img: 'heo.png',        audio: 'spell_l.mp3' },
    { key: 'm',  word: 'con mèo',   img: 'meo.png',        audio: 'spell_m.mp3' },
    { key: 'n',  word: 'quả na',    img: 'na.png',         audio: 'spell_n.mp3' },
    { key: 'o',  word: 'con ong',   img: 'ong.png',        audio: 'spell_o.mp3' },
    { key: 'ô',  word: 'cái ô',     img: 'o_umbrella.png', audio: 'spell_oo.mp3' },
    { key: 'ơ',  word: 'quả mơ',    img: 'mo.png',         audio: 'spell_ow.mp3' },
    { key: 'p',  word: 'viên pin',  img: 'pin.png',        audio: 'spell_p.mp3' },
    { key: 'q',  word: 'món quà',   img: 'qua.png',        audio: 'spell_q.mp3' },
    { key: 'r',  word: 'con rùa',   img: 'rua.png',        audio: 'spell_r.mp3' },
    { key: 's',  word: 'ngôi sao',  img: 'sao.png',        audio: 'spell_s.mp3' },
    { key: 't',  word: 'con tôm',   img: 'tom.png',        audio: 'spell_t.mp3' },
    { key: 'u',  word: 'cái mũ',    img: 'mu.png',         audio: 'spell_u.mp3' },
    { key: 'ư',  word: 'sư tử',     img: 'sutu.png',       audio: 'spell_uw.mp3' },
    { key: 'v',  word: 'quyển vở',  img: 'vo.png',         audio: 'spell_v.mp3' },
    { key: 'x',  word: 'xe đạp',    img: 'xedap.png',      audio: 'spell_x.mp3' },
    { key: 'y',  word: 'y tá',      img: 'yta.png',        audio: 'spell_y.mp3' }
];

const AC_COMPOUND_ITEMS = [
    { key: 'ch',  word: 'con chó',   img: 'cho.png',   audio: 'spell_ch.mp3' },
    { key: 'gh',  word: 'cái ghế',   img: 'ghe.png',   audio: 'spell_gh.mp3' },
    { key: 'gi',  word: 'con giun',  img: 'giun.png',  audio: 'spell_gi.mp3' },
    { key: 'kh',  word: 'quả khế',   img: 'khe.png',   audio: 'spell_kh.mp3' },
    { key: 'ng',  word: 'con ngựa',  img: 'ngua.png',  audio: 'spell_ng.mp3' },
    { key: 'ngh', word: 'củ nghệ',   img: 'nghe.png',  audio: 'spell_ngh.mp3' },
    { key: 'nh',  word: 'con nhện',  img: 'nhen.png',  audio: 'spell_nh.mp3' },
    { key: 'ph',  word: 'phở bò',    img: 'pho.png',   audio: 'spell_ph.mp3' },
    { key: 'th',  word: 'con thỏ',   img: 'tho.png',   audio: 'spell_th.mp3' },
    { key: 'tr',  word: 'trăng',     img: 'trang.png', audio: 'spell_tr.mp3' },
    { key: 'qu',  word: 'cái quạt',  img: 'quat.png',  audio: 'spell_qu.mp3' }
];

const AC_ALL_ITEMS = AC_SIMPLE_ITEMS.concat(AC_COMPOUND_ITEMS);

// =====================================================
// STATE
// =====================================================

const AC_STATE = {
    mode: '',
    level: 1,
    score: 0,
    tiles: [],
    firstTileId: null,
    locked: false,
    matchedCount: 0,
    totalPairs: 0,
    timerId: null,
    timerStartMs: 0,
    timerTotalMs: 0,
    timerRemainMs: 0,
    paused: false,
    levelComplete: false
};

// =====================================================
// START / CLOSE
// =====================================================

function startAlphabetConnectGame() {
    stopAlphabetConnectTimer();
    stopAllAudio();

    AC_STATE.mode = '';
    AC_STATE.level = 1;
    AC_STATE.score = 0;
    AC_STATE.tiles = [];
    AC_STATE.firstTileId = null;
    AC_STATE.locked = false;
    AC_STATE.matchedCount = 0;
    AC_STATE.paused = false;
    AC_STATE.levelComplete = false;

    const menu = document.getElementById('menu-screen');
    const game = document.getElementById('game-screen');

    if (menu) menu.style.display = 'none';

    if (game) {
        game.style.display = 'flex';
        game.className = 'game-view game-alphabet-connect game-alphabet-connect-menu';
    }

    renderAlphabetConnectMenu();

    if (typeof playAudio === 'function' && typeof welcomeAudioPath === 'function') {
        playAudio(welcomeAudioPath(), { stopOld: true });
    }
}

function closeAlphabetConnectGame() {
    stopAlphabetConnectTimer();
    stopAllAudio();
    resetAlphabetConnectTimerBar();

    if (typeof backToMenu === 'function') {
        backToMenu();
        return;
    }

    const game = document.getElementById('game-screen');
    const menu = document.getElementById('menu-screen');

    if (game) {
        game.style.display = 'none';
        game.innerHTML = '';
        game.className = 'game-view';
    }

    if (menu) menu.style.display = 'flex';
}

// =====================================================
// MENU CHỌN KIỂU CHƠI
// =====================================================

function renderAlphabetConnectMenu() {
    const game = document.getElementById('game-screen');
    if (!game) return;

    stopAlphabetConnectTimer();
    resetAlphabetConnectTimerBar();

    game.className = 'game-view game-alphabet-connect game-alphabet-connect-menu';

    game.innerHTML = `
        ${renderAlphabetConnectTopBar(false)}

        <div class="connect-menu-panel">
            <div class="connect-menu-title">Nối Chữ Vui</div>
            <div class="connect-menu-subtitle">Chọn kiểu chơi rồi bấm Bắt đầu nhé!</div>

            <div class="connect-mode-grid">
                <button class="connect-mode-card" type="button" data-mode="letter-letter" onclick="selectAlphabetConnectMode('letter-letter')">
                    <div class="connect-mode-icon">Aa</div>
                    <div class="connect-mode-name">Nối chữ với chữ</div>
                    <div class="connect-mode-desc">a - a, A - A, A - a</div>
                </button>

                <button class="connect-mode-card" type="button" data-mode="letter-image" onclick="selectAlphabetConnectMode('letter-image')">
                    <div class="connect-mode-icon">A 🐮</div>
                    <div class="connect-mode-name">Nối chữ với hình</div>
                    <div class="connect-mode-desc">A nối với hình đúng</div>
                </button>
            </div>

            <button id="connect-start-btn" class="connect-start-btn" type="button" disabled onclick="startAlphabetConnectSelectedMode()">
                Bắt đầu
            </button>
        </div>
    `;
}

function selectAlphabetConnectMode(mode) {
    AC_STATE.mode = mode;

    document.querySelectorAll('.connect-mode-card').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const startBtn = document.getElementById('connect-start-btn');
    if (startBtn) startBtn.disabled = false;
}

function startAlphabetConnectSelectedMode() {
    if (!AC_STATE.mode) return;

    AC_STATE.level = 1;
    AC_STATE.score = 0;

    startAlphabetConnectLevel(1);
}

// =====================================================
// TOP BAR
// Dùng class giống game-core: .top-bar / .back-btn / #score-container.
// =====================================================

function renderAlphabetConnectTopBar(showPause = true) {
    const center = showPause
        ? `<span class="connect-top-level">Lv.${AC_STATE.level}</span><span class="connect-top-score">⭐ ${AC_STATE.score}</span>`
        : `<span class="connect-top-title">Nối Chữ</span>`;

    const right = showPause
        ? `<button id="connect-pause-btn" class="connect-pause-btn" type="button" onclick="toggleAlphabetConnectPause()" aria-label="Tạm dừng">⏸</button>`
        : '';

    return `
        <div class="top-bar">
            <div class="top-bar-left">
                <button class="back-btn" type="button" onclick="closeAlphabetConnectGame()" aria-label="Về menu">
                    <span class="back-icon">🏠</span>
                </button>
            </div>

            <div class="top-bar-center">
                <div id="score-container" class="connect-score-container">${center}</div>
            </div>

            <div class="top-bar-right">
                ${right}
            </div>
        </div>
    `;
}

function updateAlphabetConnectTopBar() {
    const score = document.getElementById('score-container');
    if (score) {
        score.innerHTML = `
            <span class="connect-top-level">Lv.${AC_STATE.level}</span>
            <span class="connect-top-score">⭐ ${AC_STATE.score}</span>
        `;
    }

    const pauseBtn = document.getElementById('connect-pause-btn');
    if (pauseBtn) {
        pauseBtn.textContent = AC_STATE.paused ? '▶' : '⏸';
        pauseBtn.setAttribute('aria-label', AC_STATE.paused ? 'Tiếp tục' : 'Tạm dừng');
    }
}

// =====================================================
// LEVEL / BOARD SIZE
// Quy ước: cols = số cột, rows = số hàng.
// Màn dọc dùng cột ít hơn, màn ngang tự xoay cột nhiều hơn.
// =====================================================

function getAlphabetConnectBaseSize(level) {
    if (level === 1) return { cols: 2, rows: 2 };
    if (level === 2) return { cols: 4, rows: 4 };
    if (level === 3) return { cols: 4, rows: 4 };
    if (level >= 4 && level <= 5) return { cols: 4, rows: 6 };
    if (level >= 6 && level <= 7) return { cols: 6, rows: 6 };
    if (level === 8) return { cols: 4, rows: 4 };
    if (level >= 9 && level <= 10) return { cols: 6, rows: 9 };

    return getAlphabetConnectMaxSize();
}

function getAlphabetConnectMaxSize() {
    const isLandscape = window.innerWidth > window.innerHeight;

    // Cỡ lớn nhưng vẫn đủ bấm bằng tay trẻ nhỏ.
    // Muốn tăng nữa: sửa 8x10 / 10x8 ở đây.
    return isLandscape
        ? { cols: 10, rows: 8 }
        : { cols: 8, rows: 10 };
}

function orientAlphabetConnectSize(size) {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (!isLandscape) return size;

    return {
        cols: Math.max(size.cols, size.rows),
        rows: Math.min(size.cols, size.rows)
    };
}

function getAlphabetConnectSize(level) {
    const size = orientAlphabetConnectSize(getAlphabetConnectBaseSize(level));

    // Bảo hiểm: số ô phải chẵn để chia cặp.
    if ((size.cols * size.rows) % 2 === 0) return size;

    return { cols: size.cols, rows: size.rows + 1 };
}

function getAlphabetConnectTimeSec(level, pairCount) {
    // Level càng cao càng nhiều thời gian vì nhiều ô hơn.
    const base = 15;
    const perPair = level <= 3 ? 8 : level <= 8 ? 6 : 5;
    const levelBonus = level * 4;

    return base + pairCount * perPair + levelBonus;
}

function getAlphabetConnectWrongPenalty(level) {
    if (level < 6) return 0;
    if (level < 11) return 2;
    return 5;
}

// =====================================================
// TẠO DỮ LIỆU Ô
// =====================================================

function getAlphabetConnectPool(level, pairCount) {
    let pool;

    if (level < 8) {
        pool = [...AC_SIMPLE_ITEMS];
    } else if (level === 8) {
        // Level 8: bắt đầu làm quen chữ ghép, nhưng board vẫn 4x4.
        const compounds = shuffleArray(AC_COMPOUND_ITEMS).slice(0, Math.min(4, pairCount));
        const simpleNeed = Math.max(pairCount - compounds.length, 0);
        pool = compounds.concat(shuffleArray(AC_SIMPLE_ITEMS).slice(0, simpleNeed));
    } else {
        pool = [...AC_SIMPLE_ITEMS, ...AC_COMPOUND_ITEMS];
    }

    pool = shuffleArray(pool);

    // Nếu level rất lớn mà số cặp vượt quá kho chữ, lặp vòng có kiểm soát.
    // Với cấu hình hiện tại thường không cần, nhưng để game không lỗi.
    const output = [];
    let index = 0;

    while (output.length < pairCount) {
        output.push(pool[index % pool.length]);
        index += 1;
    }

    return output;
}

function getAlphabetConnectPairStyle(level) {
    if (level === 1) return 'lower-lower';
    if (level === 2) return 'upper-upper';
    if (level === 3) return 'upper-lower';

    return randomFromArray([
        'lower-lower',
        'upper-upper',
        'upper-lower'
    ]);
}

function makeAlphabetConnectLabel(item, variant) {
    if (variant === 'upper') return item.key.toUpperCase();
    return item.key;
}

function makeAlphabetConnectTiles(level, mode, pairCount) {
    const items = getAlphabetConnectPool(level, pairCount);
    const tiles = [];
    let tileId = 1;

    items.forEach((item, pairIndex) => {
        const pairId = `pair-${level}-${pairIndex}-${item.key}`;

        if (mode === 'letter-image') {
            const variant = level === 2 ? 'upper' : level >= 4 && Math.random() > 0.5 ? 'upper' : 'lower';

            tiles.push({
                id: 'tile-' + tileId++,
                pairId,
                type: 'text',
                item,
                label: makeAlphabetConnectLabel(item, variant),
                matched: false
            });

            tiles.push({
                id: 'tile-' + tileId++,
                pairId,
                type: 'image',
                item,
                matched: false
            });

            return;
        }

        const style = getAlphabetConnectPairStyle(level);

        if (style === 'lower-lower') {
            tiles.push(makeAlphabetConnectTextTile(tileId++, pairId, item, 'lower'));
            tiles.push(makeAlphabetConnectTextTile(tileId++, pairId, item, 'lower'));
        } else if (style === 'upper-upper') {
            tiles.push(makeAlphabetConnectTextTile(tileId++, pairId, item, 'upper'));
            tiles.push(makeAlphabetConnectTextTile(tileId++, pairId, item, 'upper'));
        } else {
            tiles.push(makeAlphabetConnectTextTile(tileId++, pairId, item, 'upper'));
            tiles.push(makeAlphabetConnectTextTile(tileId++, pairId, item, 'lower'));
        }
    });

    return shuffleArray(tiles);
}

function makeAlphabetConnectTextTile(tileId, pairId, item, variant) {
    return {
        id: 'tile-' + tileId,
        pairId,
        type: 'text',
        item,
        label: makeAlphabetConnectLabel(item, variant),
        matched: false
    };
}

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(array) {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

// =====================================================
// START LEVEL
// =====================================================

function startAlphabetConnectLevel(level) {
    stopAlphabetConnectTimer();
    stopAllAudio();

    AC_STATE.level = level;
    AC_STATE.firstTileId = null;
    AC_STATE.locked = false;
    AC_STATE.matchedCount = 0;
    AC_STATE.paused = false;
    AC_STATE.levelComplete = false;

    const game = document.getElementById('game-screen');
    if (!game) return;

    game.style.display = 'flex';
    game.className = 'game-view game-alphabet-connect game-alphabet-connect-playing';

    const size = getAlphabetConnectSize(level);
    const totalCells = size.cols * size.rows;
    const pairCount = totalCells / 2;

    AC_STATE.totalPairs = pairCount;
    AC_STATE.tiles = makeAlphabetConnectTiles(level, AC_STATE.mode, pairCount);
    AC_STATE.timerTotalMs = getAlphabetConnectTimeSec(level, pairCount) * 1000;
    AC_STATE.timerRemainMs = AC_STATE.timerTotalMs;

    game.innerHTML = `
        ${renderAlphabetConnectTopBar(true)}

        <div class="connect-play-area">
            <div class="connect-board-info">
                ${getAlphabetConnectModeText()} · ${size.cols} x ${size.rows}
            </div>

            <div
                id="connect-board"
                class="connect-board"
                style="--connect-cols:${size.cols}; --connect-rows:${size.rows};"
            >
                ${AC_STATE.tiles.map(tile => renderAlphabetConnectTile(tile)).join('')}
            </div>

            <div id="connect-overlay" class="connect-overlay hidden"></div>
        </div>
    `;

    updateAlphabetConnectTopBar();
    startAlphabetConnectTimer();
}

function getAlphabetConnectModeText() {
    if (AC_STATE.mode === 'letter-image') return 'Chữ với hình';
    return 'Chữ với chữ';
}

function renderAlphabetConnectTile(tile) {
    const content = tile.type === 'image'
        ? `<img class="connect-tile-img" src="${getAlphabetConnectImagePath(tile.item.img)}" alt="${tile.item.word}" draggable="false">`
        : `<span class="connect-tile-letter">${tile.label}</span>`;

    const typeClass = tile.type === 'image' ? 'image-tile' : 'text-tile';

    return `
        <button
            id="${tile.id}"
            class="connect-tile ${typeClass}"
            type="button"
            data-tile-id="${tile.id}"
            onclick="handleAlphabetConnectTile('${tile.id}')"
            aria-label="${tile.type === 'image' ? tile.item.word : tile.label}"
        >
            ${content}
        </button>
    `;
}

function getAlphabetConnectImagePath(fileName) {
    if (typeof imgPath === 'function') return imgPath(fileName);
    return 'img/' + fileName;
}

function getAlphabetConnectAudioPath(fileName) {
    if (typeof alphabetAudioPath === 'function') return alphabetAudioPath(fileName);
    return 'audio/alphabet/' + fileName;
}

// =====================================================
// CHỌN Ô / KIỂM TRA CẶP
// =====================================================

function handleAlphabetConnectTile(tileId) {
    if (AC_STATE.locked || AC_STATE.paused || AC_STATE.levelComplete) return;

    const tile = AC_STATE.tiles.find(item => item.id === tileId);
    if (!tile || tile.matched) return;

    const btn = document.getElementById(tileId);
    if (!btn || btn.classList.contains('selected')) return;

    if (tile.type === 'text' && tile.item && tile.item.audio) {
        playAlphabetConnectLetterAudio(tile.item.audio);
    }

    btn.classList.add('selected');

    if (!AC_STATE.firstTileId) {
        AC_STATE.firstTileId = tileId;
        return;
    }

    const firstTile = AC_STATE.tiles.find(item => item.id === AC_STATE.firstTileId);
    const firstBtn = document.getElementById(AC_STATE.firstTileId);

    AC_STATE.locked = true;

    if (firstTile && firstTile.pairId === tile.pairId && firstTile.id !== tile.id) {
        handleAlphabetConnectCorrect(firstTile, tile, firstBtn, btn);
    } else {
        handleAlphabetConnectWrong(firstBtn, btn);
    }
}

function handleAlphabetConnectCorrect(tileA, tileB, btnA, btnB) {
    AC_STATE.score += 10 + Math.min(AC_STATE.level, 10);
    AC_STATE.matchedCount += 1;

    tileA.matched = true;
    tileB.matched = true;

    updateAlphabetConnectTopBar();

    if (typeof playAudio === 'function' && typeof correctAudioPath === 'function') {
        playAudio(correctAudioPath(), { stopOld: true });
    }

    [btnA, btnB].forEach(btn => {
        if (!btn) return;
        btn.classList.add('matched');
    });

    setTimeout(() => {
        [btnA, btnB].forEach(btn => {
            if (!btn) return;
            btn.classList.remove('selected');
            btn.classList.add('gone');
            btn.disabled = true;
        });

        AC_STATE.firstTileId = null;
        AC_STATE.locked = false;

        if (AC_STATE.matchedCount >= AC_STATE.totalPairs) {
            completeAlphabetConnectLevel();
        }
    }, 420);
}

function handleAlphabetConnectWrong(btnA, btnB) {
    const penalty = getAlphabetConnectWrongPenalty(AC_STATE.level);

    if (penalty > 0) {
        AC_STATE.score = Math.max(0, AC_STATE.score - penalty);
        updateAlphabetConnectTopBar();
    }

    if (typeof playAudio === 'function' && typeof wrongAudioPath === 'function') {
        playAudio(wrongAudioPath(), { stopOld: true });
    }

    [btnA, btnB].forEach(btn => {
        if (!btn) return;
        btn.classList.add('wrong');
    });

    setTimeout(() => {
        [btnA, btnB].forEach(btn => {
            if (!btn) return;
            btn.classList.remove('selected', 'wrong');
        });

        AC_STATE.firstTileId = null;
        AC_STATE.locked = false;
    }, 620);
}

function playAlphabetConnectLetterAudio(fileName) {
    if (!fileName || typeof playAudio !== 'function') return;

    playAudio(getAlphabetConnectAudioPath(fileName), { stopOld: true });
}

// =====================================================
// TIMER
// Dùng thanh timer dưới top-bar chung nếu core có setTopTimerPercent().
// =====================================================

function startAlphabetConnectTimer() {
    stopAlphabetConnectTimer();

    AC_STATE.paused = false;
    AC_STATE.timerStartMs = performance.now();

    setAlphabetConnectTimerPercent(100, true);

    function tick(now) {
        if (AC_STATE.paused || AC_STATE.levelComplete) return;

        const elapsed = now - AC_STATE.timerStartMs;
        const remain = Math.max(AC_STATE.timerRemainMs - elapsed, 0);
        const percent = (remain / AC_STATE.timerTotalMs) * 100;

        setAlphabetConnectTimerPercent(percent, true);

        if (remain <= 0) {
            AC_STATE.timerId = null;
            AC_STATE.timerRemainMs = 0;
            handleAlphabetConnectTimeUp();
            return;
        }

        AC_STATE.timerId = requestAnimationFrame(tick);
    }

    AC_STATE.timerId = requestAnimationFrame(tick);
}

function pauseAlphabetConnectTimer() {
    if (AC_STATE.paused) return;

    const elapsed = performance.now() - AC_STATE.timerStartMs;
    AC_STATE.timerRemainMs = Math.max(AC_STATE.timerRemainMs - elapsed, 0);
    AC_STATE.paused = true;

    stopAlphabetConnectTimer(false);
}

function resumeAlphabetConnectTimer() {
    if (!AC_STATE.paused || AC_STATE.levelComplete) return;

    AC_STATE.paused = false;
    AC_STATE.timerStartMs = performance.now();

    startAlphabetConnectTimer();
}

function stopAlphabetConnectTimer(reset = false) {
    if (AC_STATE.timerId) {
        cancelAnimationFrame(AC_STATE.timerId);
        AC_STATE.timerId = null;
    }

    if (reset) {
        AC_STATE.timerRemainMs = 0;
    }
}

function setAlphabetConnectTimerPercent(percent, running) {
    if (typeof setTopTimerPercent === 'function') {
        setTopTimerPercent(percent, running);
        return;
    }

    const bar = document.querySelector('#game-screen .top-bar');
    if (!bar) return;

    const p = Math.max(0, Math.min(100, percent));
    bar.style.setProperty('--timer-scale', (p / 100).toFixed(4));

    if (running) {
        bar.classList.add('timer-running');
    } else {
        bar.classList.remove('timer-running', 'timer-green', 'timer-yellow', 'timer-red');
    }
}

function resetAlphabetConnectTimerBar() {
    if (typeof setTopTimerPercent === 'function') {
        setTopTimerPercent(100, false);
        return;
    }

    const bar = document.querySelector('#game-screen .top-bar');
    if (bar) {
        bar.classList.remove('timer-running', 'timer-green', 'timer-yellow', 'timer-red');
        bar.style.removeProperty('--timer-scale');
    }
}

// =====================================================
// PAUSE / RESUME
// =====================================================

function toggleAlphabetConnectPause() {
    if (AC_STATE.levelComplete) return;

    if (AC_STATE.paused) {
        closeAlphabetConnectOverlay();
        resumeAlphabetConnectTimer();
        updateAlphabetConnectTopBar();
        return;
    }

    pauseAlphabetConnectTimer();
    updateAlphabetConnectTopBar();

    showAlphabetConnectOverlay(`
        <div class="connect-overlay-icon">⏸</div>
        <div class="connect-overlay-title">Tạm dừng</div>
        <button class="connect-overlay-btn primary" type="button" onclick="toggleAlphabetConnectPause()">Tiếp tục</button>
        <button class="connect-overlay-btn" type="button" onclick="renderAlphabetConnectMenu()">Chọn kiểu khác</button>
    `);
}

// =====================================================
// COMPLETE / TIME UP
// =====================================================

function completeAlphabetConnectLevel() {
    AC_STATE.levelComplete = true;
    stopAlphabetConnectTimer();

    const remainRatio = AC_STATE.timerRemainMs > 0
        ? getAlphabetConnectRemainRatio()
        : 0;

    const stars = remainRatio >= 0.5 ? 3 : remainRatio >= 0.2 ? 2 : 1;
    const bonus = stars * 20 + AC_STATE.level * 5;

    AC_STATE.score += bonus;
    updateAlphabetConnectTopBar();

    if (typeof fireGameConfetti === 'function') {
        fireGameConfetti();
    }

    const starText = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    showAlphabetConnectOverlay(`
        <div class="connect-overlay-icon">🎉</div>
        <div class="connect-overlay-title">Qua màn ${AC_STATE.level}!</div>
        <div class="connect-overlay-stars">${starText}</div>
        <div class="connect-overlay-text">Thưởng +${bonus} điểm</div>
        <button class="connect-overlay-btn primary" type="button" onclick="startAlphabetConnectLevel(${AC_STATE.level + 1})">Màn tiếp</button>
        <button class="connect-overlay-btn" type="button" onclick="renderAlphabetConnectMenu()">Đổi kiểu chơi</button>
    `);
}

function getAlphabetConnectRemainRatio() {
    const elapsed = performance.now() - AC_STATE.timerStartMs;
    const remain = Math.max(AC_STATE.timerRemainMs - elapsed, 0);
    return remain / AC_STATE.timerTotalMs;
}

function handleAlphabetConnectTimeUp() {
    AC_STATE.levelComplete = true;

    if (typeof playAudio === 'function' && typeof wrongAudioPath === 'function') {
        playAudio(wrongAudioPath(), { stopOld: true });
    }

    showAlphabetConnectOverlay(`
        <div class="connect-overlay-icon">⏰</div>
        <div class="connect-overlay-title">Hết giờ rồi!</div>
        <div class="connect-overlay-text">Thử lại màn ${AC_STATE.level} nhé.</div>
        <button class="connect-overlay-btn primary" type="button" onclick="startAlphabetConnectLevel(${AC_STATE.level})">Chơi lại</button>
        <button class="connect-overlay-btn" type="button" onclick="renderAlphabetConnectMenu()">Chọn kiểu khác</button>
    `);
}

function showAlphabetConnectOverlay(html) {
    const overlay = document.getElementById('connect-overlay');
    if (!overlay) return;

    overlay.innerHTML = `<div class="connect-overlay-box">${html}</div>`;
    overlay.classList.remove('hidden');
}

function closeAlphabetConnectOverlay() {
    const overlay = document.getElementById('connect-overlay');
    if (!overlay) return;

    overlay.classList.add('hidden');
    overlay.innerHTML = '';
}

// =====================================================
// XOAY MÀN HÌNH
// Nếu đang chơi thì dựng lại màn hiện tại để board đổi 6x9 / 9x6.
// =====================================================

window.addEventListener('resize', () => {
    const game = document.getElementById('game-screen');
    if (!game || !game.classList.contains('game-alphabet-connect-playing')) return;
    if (AC_STATE.levelComplete || AC_STATE.paused) return;

    // Không tạo lại bộ chữ, chỉ đổi CSS grid theo hướng mới.
    const size = getAlphabetConnectSize(AC_STATE.level);
    const board = document.getElementById('connect-board');

    if (board) {
        board.style.setProperty('--connect-cols', size.cols);
        board.style.setProperty('--connect-rows', size.rows);
    }

    const info = document.querySelector('.connect-board-info');
    if (info) {
        info.textContent = `${getAlphabetConnectModeText()} · ${size.cols} x ${size.rows}`;
    }
});
