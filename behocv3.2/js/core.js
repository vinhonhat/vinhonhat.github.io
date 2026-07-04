// js/core.js
// Điều khiển app v3.2: mở khóa audio, hiện menu, load CSS/JS game khi bấm.
// =====================================================
// PHIÊN BẢN APP
// Khi cập nhật web/app, chỉ cần tăng số này.
// Ví dụ: 3.2.1 -> 3.2.2
// =====================================================

const APP_VERSION = '3.2.3';
const APP_VERSION_KEY = 'behoc_app_version';


const loadedCss = new Set();
const loadedJs = new Set();
const gameModules = {};

let activeGame = null;
let activeGameId = null;
let currentQuestionData = null;

let replayTimer = null;
let questionTimer = null;
let timerColorZone = '';

let gamePausedByNoInteraction = false;

let gameStartedOnce = false;

const GAME_CONFIG = {
    alphabet: {
        title: 'Bảng Chữ Cái',
        folder: 'alphabet',
        css: 'games/alphabet/alphabet.css',
        js: 'games/alphabet/alphabet.js',
        startFn: 'startAlphabetGame',
        type: 'custom'
    },
    alphabet_reflex: {
        title: 'Phản Xạ Chữ',
        folder: 'alphabet-reflex',
        css: 'games/alphabet-reflex/alphabet-reflex.css',
        js: 'games/alphabet-reflex/alphabet-reflex.js',
        moduleId: 'alphabet_reflex',
        type: 'registered'
    },
    alphabet_connect: {
        title: 'Nối Chữ',
        folder: 'alphabet-connect',
        css: 'games/alphabet-connect/alphabet-connect.css',
        js: 'games/alphabet-connect/alphabet-connect.js',
        startFn: 'startAlphabetConnectGame',
        type: 'custom'
    },
    listen_number: {
        title: 'Nghe & Tìm Số',
        folder: 'number',
        css: 'games/number/number.css',
        js: 'games/number/number.js',
        moduleId: 'listen_number',
        type: 'registered'
    },
    count: {
        title: 'Tập Đếm',
        folder: 'count',
        css: 'games/count/count.css',
        js: 'games/count/count.js',
        moduleId: 'count',
        type: 'registered'
    },
    color: {
        title: 'Màu Sắc',
        folder: 'color',
        css: 'games/color/color.css',
        js: 'games/color/color.js',
        moduleId: 'color',
        type: 'registered'
    },
    match_animal: {
        title: 'Tìm Con Vật',
        folder: 'animal',
        css: 'games/animal/animal.css',
        js: 'games/animal/animal.js',
        moduleId: 'match_animal',
        type: 'registered'
    },
    math: {
        title: 'Bé Tập Tính',
        folder: 'math',
        css: 'games/math/math.css',
        js: 'games/math/math.js',
        moduleId: 'math',
        type: 'registered'
    },
    math2: {
        title: 'Bé Tách Gộp',
        folder: 'math2',
        css: 'games/math2/math2.css',
        js: 'games/math2/math2.js',
        moduleId: 'math2',
        type: 'registered'
    },
    math4: {
        title: 'Bé Tách Gộp 2',
        folder: 'math4',
        css: 'games/math4/math4.css',
        js: 'games/math4/math4.js',
        moduleId: 'math4',
        type: 'registered'
    },
    frame_test: {
        title: 'Test Khung',
        folder: 'frame-test',
        css: 'games/frame-test/frame-test.css',
        js: 'games/frame-test/frame-test.js',
        moduleId: 'frame_test',
        type: 'registered'
    }
};

function registerGame(gameId, gameLogic) {
    gameModules[gameId] = gameLogic;
}

function loadCssOnce(href) {
    return new Promise(resolve => {
        if (!href || loadedCss.has(href)) return resolve();

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => {
            loadedCss.add(href);
            resolve();
        };
        link.onerror = () => {
            console.warn('Không load được CSS:', href);
            resolve();
        };
        document.head.appendChild(link);
    });
}

function loadJsOnce(src) {
    return new Promise(resolve => {
        if (!src || loadedJs.has(src)) return resolve();

        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.onload = () => {
            loadedJs.add(src);
            resolve();
        };
        script.onerror = () => {
            console.warn('Không load được JS:', src);
            resolve();
        };
        document.body.appendChild(script);
    });
}

function unlockAudio() {
    unlockAudioPolicy();

    const overlay = document.getElementById('start-overlay');
    const menu = document.getElementById('menu-screen');
    const game = document.getElementById('game-screen');

    if (overlay) overlay.style.display = 'none';
    if (game) game.style.display = 'none';
    if (menu) menu.style.display = 'flex';

    // Phát lời chào nếu có. Dù audio thiếu/bị chặn thì menu vẫn đã hiện.
    //if (!gameStartedOnce) {
    //    gameStartedOnce = true;
    //    playAudio(commonAudioPath('dingdong.mp3'), { stopOld: false });
    //}
}

function showMenuOnly() {
    const overlay = document.getElementById('start-overlay');
    const menu = document.getElementById('menu-screen');
    const game = document.getElementById('game-screen');

    if (overlay) overlay.style.display = 'none';
    if (game) {
        game.style.display = 'none';
        game.innerHTML = '';
        game.className = 'game-view';
    }
    if (menu) menu.style.display = 'flex';
}

function backToMenu() {
    stopAutoReplay();
    stopQuestionTimer(true);
    closeNoInteractionPause();
    stopAllAudio();

    gamePausedByNoInteraction = false;
    noInteractionCount = 0;

    activeGame = null;
    activeGameId = null;
    currentQuestionData = null;

    const alphabetScreen = document.getElementById('alphabet-screen');
    if (alphabetScreen) alphabetScreen.remove();

    showMenuOnly();
}

function applyGameLayoutClass(gameId) {
    const game = document.getElementById('game-screen');
    if (!game) return;

    const safeId = String(gameId).replace(/_/g, '-');

    game.className = 'game-view game-' + safeId;
}

async function startGame(gameId) {
    const config = GAME_CONFIG[gameId];

    if (!config) {
        showMaintenancePopup('Game');
        return;
    }

    stopAutoReplay();
    stopQuestionTimer(true);
    closeNoInteractionPause();
    stopAllAudio();

    gamePausedByNoInteraction = false;
    noInteractionCount = 0;

    applyGameLayoutClass(gameId);

    await loadCssOnce(config.css);
    await loadJsOnce(config.js);

    // Game custom như Alphabet
    if (config.type === 'custom') {
        const fn = window[config.startFn];

        if (typeof fn === 'function') {
            fn();
        } else {
            showMaintenancePopup(config.title);
        }

        return;
    }

    // Game dùng hệ thống registerGame()
    const moduleId = config.moduleId || gameId;
    const module = gameModules[moduleId];

    if (!module) {
        showMaintenancePopup(config.title);
        return;
    }

    const menu = document.getElementById('menu-screen');
    const game = document.getElementById('game-screen');

    if (menu) menu.style.display = 'none';

    if (game) {
        game.style.display = 'flex';
        game.innerHTML = '';
    }

    startRegisteredGame(gameId, config.title, module);
}

function showMaintenance(title = 'Game') {
    showMaintenancePopup(title);
}
function showMaintenancePopup(title = 'Game') {
    closeMaintenancePopup();

    const popup = document.createElement('div');
    popup.id = 'maintenance-popup';
    popup.className = 'maintenance-popup';

    popup.innerHTML = `
        <div class="maintenance-box">
            <div class="maintenance-icon">⚠️</div>
            <div class="maintenance-title">${title}</div>
            <div class="maintenance-text">
            🚧 Game này đang bảo trì hoặc chưa hoàn thiện.<br>                      
            </div>
            <button class="maintenance-close" type="button" onclick="closeMaintenancePopup()">
                Bé chọn game khác nhé
            </button>
        </div>
    `;

    document.body.appendChild(popup);
}

function closeMaintenancePopup() {
    const old = document.getElementById('maintenance-popup');
    if (old) old.remove();
}

function startRegisteredGame(gameId, title, module) {
    activeGameId = gameId;
    activeGame = module;
    currentQuestionData = null;

    gamePausedByNoInteraction = false;
    noInteractionCount = 0;

    // 1. Dựng khung game trước
    renderGameShell(title);
    resetScore();
    resetTopTimerBar();

    // 2. Hiện câu hỏi + đáp án ngay
    // Nhưng chưa phát âm câu hỏi và chưa chạy thời gian
    nextQuestion({
        playAudioNow: false,
        startTimerNow: false
    });

    // 3. Phát dingdong mỗi lần vào game
    let introDone = false;

    function afterIntro() {
        if (introDone) return;
        if (activeGame !== module) return;
        if (gamePausedByNoInteraction) return;

        introDone = true;

        // Dingdong xong mới đọc câu hỏi và chạy timer
        playQuestionAudio();
        startQuestionTimer();
        startAutoReplay();
    }

    playAudio(welcomeAudioPath(), {
        stopOld: true,
        onended: afterIntro,
        onerror: afterIntro
    });
}

function nextQuestion(config = {}) {
    if (!activeGame) return;
    if (gamePausedByNoInteraction) return;

    const playAudioNow = config.playAudioNow !== false;
    const startTimerNow = config.startTimerNow !== false;
    const audioDelay = config.audioDelay ?? 300;

    stopAutoReplay();
    stopQuestionTimer(false);

    const questionContent = document.getElementById('question-content');
    const optionsGrid = document.getElementById('options-grid');

    if (!questionContent || !optionsGrid) return;

    currentQuestionData = activeGame.generateData();
    activeGame.currentData = currentQuestionData;

    const questionHtml = activeGame.renderDisplay(currentQuestionData);

    const answerOptions = shuffleArray(
        activeGame.getOptions(currentQuestionData)
    );

    const fragment = document.createDocumentFragment();

    answerOptions.forEach(option => {
        const btn = document.createElement('button');

        btn.className = 'option-btn';

        activeGame.styleOptionBtn(btn, option);

        btn.onclick = () => handleCheckAnswer(option, btn);

        fragment.appendChild(btn);
    });

    questionContent.innerHTML = questionHtml;

    optionsGrid.innerHTML = '';
    optionsGrid.className = 'options-grid';

    if (activeGame.gridClass) {
        optionsGrid.classList.add(activeGame.gridClass);
    }

    optionsGrid.appendChild(fragment);

    resetTopTimerBar();

    if (playAudioNow) {
        setTimeout(() => {
            if (gamePausedByNoInteraction) return;

            playQuestionAudio();

            if (startTimerNow) {
                startQuestionTimer();
            }

            startAutoReplay();
        }, audioDelay);
    } else if (startTimerNow) {
        startQuestionTimer();
    }
}

function playQuestionAudio() {
    if (!activeGame || !currentQuestionData || typeof activeGame.getAudio !== 'function') return;

    const files = activeGame.getAudio(currentQuestionData);
    if (files && files.length > 0) {
        playSequence(files);
    }
}

function handleReplayQuestion() {
    if (gamePausedByNoInteraction) return;

    markGameInteraction();

    playQuestionAudio();
}

function handleCheckAnswer(selected, btn) {
    if (!activeGame || !currentQuestionData) return;
    if (gamePausedByNoInteraction) return;

    markGameInteraction();

    const isCorrect = activeGame.checkResult(selected, currentQuestionData);

    if (isCorrect) {
        stopAutoReplay();
        stopQuestionTimer(false);
        btn.classList.add('correct');
        addScore(1);

        let queue = [];
        if (typeof activeGame.getAnswerAudio === 'function') {
            queue = activeGame.getAnswerAudio(selected) || [];
        }
        queue.push(correctAudioPath());
        playSequence(queue);

        fireGameConfetti();
        setTimeout(() => nextQuestion(), 2000);
    } else {
        btn.classList.add('wrong');

        let queue = [];
        if (typeof activeGame.getAnswerAudio === 'function') {
            queue = activeGame.getAnswerAudio(selected) || [];
        }
        queue.push(wrongAudioPath());
        playSequence(queue);

        setTimeout(() => btn.classList.remove('wrong'), 900);
    }
}

function startAutoReplay(delayMs = 5000) {
    stopAutoReplay();

    const questionRef = currentQuestionData;

    replayTimer = setTimeout(() => {
        replayTimer = null;

        if (!activeGame) return;
        if (gamePausedByNoInteraction) return;
        if (currentQuestionData !== questionRef) return;

        // Nhắc lại câu hỏi đúng 1 lần
        playQuestionAudio();
    }, delayMs);
}

function stopAutoReplay() {
    if (replayTimer) {
        clearTimeout(replayTimer);
        replayTimer = null;
    }
}

// =====================================================
// TƯƠNG TÁC CỦA BÉ
// Có bấm đáp án hoặc bấm loa thì tính là có tương tác.
// Sau 3 câu liên tiếp không tương tác thì tạm dừng game.
// =====================================================

function markGameInteraction() {
    noInteractionCount = 0;
}


// =====================================================
// THANH THỜI GIAN CÂU HỎI
// Viền top-bar là đồng hồ đếm ngược.
// Mặc định mỗi câu có 10 giây.
// Game nào muốn khác: activeGame.questionTimeSec = số giây.
// =====================================================

function getQuestionTimeMs() {
    if (!activeGame) return 10000;

    const sec = Number(
        activeGame.questionTimeSec ||
        activeGame.questionTime ||
        10
    );

    if (!Number.isFinite(sec) || sec <= 0) {
        return 10000;
    }

    return sec > 1000 ? sec : sec * 1000;
}

function prepareTopTimerStroke() {
    const progress = document.querySelector('#game-screen .top-timer-progress');
    if (!progress) return null;

    if (!topTimerLength) {
        topTimerLength = progress.getTotalLength();
    }

    progress.style.strokeDasharray = String(topTimerLength);
    progress.style.strokeDashoffset = '0';

    return progress;
}

function resetTopTimerBar() {
    topTimerLength = 0;
    setTopTimerPercent(100, false);
}

function setTopTimerPercent(percent, running = true) {
    const bar = document.querySelector('#game-screen .top-bar');
    if (!bar) return;

    const p = Math.max(0, Math.min(100, percent));

    // Thanh dưới top-bar thu nhỏ từ phải sang trái.
    // p = 100: đầy thanh. p = 0: hết thanh.
    bar.style.setProperty('--timer-scale', (p / 100).toFixed(4));

    if (!running) {
        bar.classList.remove(
            'timer-running',
            'timer-green',
            'timer-yellow',
            'timer-red'
        );

        timerColorZone = '';
        return;
    }

    if (!bar.classList.contains('timer-running')) {
        bar.classList.add('timer-running');
    }

    let zone = 'green';

    if (p <= 30) {
        zone = 'red';
    } else if (p <= 60) {
        zone = 'yellow';
    }

    if (zone !== timerColorZone) {
        bar.classList.remove(
            'timer-green',
            'timer-yellow',
            'timer-red'
        );

        bar.classList.add('timer-' + zone);

        timerColorZone = zone;
    }
}

function startQuestionTimer() {
    if (gamePausedByNoInteraction) return;

    stopQuestionTimer(false);

    const totalMs = getQuestionTimeMs();
    const startTime = performance.now();
    const endTime = startTime + totalMs;

    setTopTimerPercent(100, true);

    function updateTimer(now) {
        if (gamePausedByNoInteraction) {
            stopQuestionTimer(false);
            return;
        }

        const remainMs = endTime - now;
        const percent = (remainMs / totalMs) * 100;

        setTopTimerPercent(percent, true);

        if (remainMs <= 0) {
            questionTimer = null;
            stopQuestionTimer(false);
            handleQuestionTimeUp();
            return;
        }

        questionTimer = requestAnimationFrame(updateTimer);
    }

    questionTimer = requestAnimationFrame(updateTimer);
}

function stopQuestionTimer(resetBar = false) {
    if (questionTimer) {
        cancelAnimationFrame(questionTimer);
        questionTimer = null;
    }

    if (resetBar) {
        resetTopTimerBar();
    }
}

function handleQuestionTimeUp() {
    if (!activeGame || !currentQuestionData) return;
    if (gamePausedByNoInteraction) return;

    stopAutoReplay();
    setTopTimerPercent(0, true);

    noInteractionCount += 1;

    if (noInteractionCount >= 3) {
        pauseGameForNoInteraction();
        return;
    }

    playSequence([wrongAudioPath()]);

    setTimeout(() => {
        if (activeGame && !gamePausedByNoInteraction) {
            nextQuestion();
        }
    }, 900);
}


// =====================================================
// TẠM DỪNG KHI BÉ KHÔNG TƯƠNG TÁC
// Sau 3 câu liên tiếp hết giờ không bấm gì.
// =====================================================

function pauseGameForNoInteraction() {
    if (gamePausedByNoInteraction) return;

    gamePausedByNoInteraction = true;

    stopAutoReplay();
    stopQuestionTimer(false);
    stopAllAudio();

    setTopTimerPercent(0, true);

    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) return;

    closeNoInteractionPause();

    const pause = document.createElement('div');
    pause.id = 'game-pause-overlay';
    pause.className = 'game-pause-overlay';

    pause.innerHTML = `
        <div class="game-pause-box">
            <div class="game-pause-icon">⏸️</div>

            <div class="game-pause-title">
                Tạm dừng rồi bé ơi
            </div>

            <div class="game-pause-text">
                Bé chưa chọn đáp án trong 3 câu liên tiếp.
            </div>

            <div class="game-pause-actions">
                <button
                    class="game-pause-resume"
                    type="button"
                    onclick="resumeGameAfterPause()">
                    Chơi tiếp
                </button>

                <button
                    class="game-pause-menu"
                    type="button"
                    onclick="backToMenu()">
                    Về menu
                </button>
            </div>
        </div>
    `;

    gameScreen.appendChild(pause);
}

function closeNoInteractionPause() {
    const old = document.getElementById('game-pause-overlay');
    if (old) old.remove();
}

function resumeGameAfterPause() {
    if (!activeGame) return;

    closeNoInteractionPause();

    gamePausedByNoInteraction = false;
    noInteractionCount = 0;

    resetTopTimerBar();

    // Chơi tiếp bằng một câu mới
    nextQuestion({
        playAudioNow: false,
        startTimerNow: false
    });

    let introDone = false;

    function afterIntro() {
        if (introDone) return;
        if (!activeGame) return;
        if (gamePausedByNoInteraction) return;

        introDone = true;

        playQuestionAudio();
        startQuestionTimer();
        startAutoReplay();
    }

    playAudio(welcomeAudioPath(), {
        stopOld: true,
        onended: afterIntro,
        onerror: afterIntro
    });
}

// =====================================================
// NÚT VÀO CHƠI + KIỂM TRA PHIÊN BẢN
// Bấm 1 lần: vào app
// Bấm đúp: hỏi xoá cache / cập nhật
// =====================================================

let startButtonClickTimer = null;
let hasNewAppVersion = false;

window.addEventListener('DOMContentLoaded', () => {
    setupStartButtonActions();
    checkAppVersionForUpdateHint();
});

function setupStartButtonActions() {
    const startBtn = document.getElementById('start-btn');

    if (!startBtn) return;

    startBtn.addEventListener('click', () => {
        if (startButtonClickTimer) {
            clearTimeout(startButtonClickTimer);
            startButtonClickTimer = null;

            askClearPwaCache();
            return;
        }

        startButtonClickTimer = setTimeout(() => {
            startButtonClickTimer = null;
            unlockAudio();
        }, 260);
    });
}
// =====================================================
// KIỂM TRA PHIÊN BẢN
// Nếu localStorage đang lưu bản cũ khác APP_VERSION
// thì hiện gợi ý nhấn đúp để cập nhật.
// =====================================================

function checkAppVersionForUpdateHint() {
    const hint = document.getElementById('update-hint');

    const savedVersion = localStorage.getItem(APP_VERSION_KEY);

    // Lần đầu mở app: chưa có version cũ
    // Lưu version hiện tại và không hiện gợi ý.
    if (!savedVersion) {
        localStorage.setItem(APP_VERSION_KEY, APP_VERSION);

        if (hint) {
            hint.style.display = 'none';
        }

        hasNewAppVersion = false;
        return;
    }

    // Có version cũ và khác version mới
    if (savedVersion !== APP_VERSION) {
        hasNewAppVersion = true;

        if (hint) {
            hint.style.display = 'block';
            hint.textContent =
                `Có bản cập nhật mới ${savedVersion} → ${APP_VERSION}. ` +
                `Nhấn đúp “Vào chơi” để cập nhật.`;
        }

        return;
    }

    // Đang là bản mới nhất
    hasNewAppVersion = false;

    if (hint) {
        hint.style.display = 'none';
    }
}
// =====================================================
// HỎI XOÁ CACHE / CẬP NHẬT
// =====================================================

function askClearPwaCache() {
    const message = hasNewAppVersion
        ? 'Có bản cập nhật mới.\n\nBạn muốn xoá cache để tải bản mới không?'
        : 'Bạn muốn xoá cache ứng dụng không?\n\nDùng khi app bị lỗi hoặc kẹt bản cũ.';

    const ok = confirm(message);

    if (!ok) return;

    clearPwaCacheAndReload();
}
// =====================================================
// XOÁ CACHE PWA + SERVICE WORKER + LOCAL STORAGE
// Dùng khi app bị kẹt bản cũ.
// Hiện tại điểm chưa lưu nên có thể xoá localStorage.
// Sau này nếu có lưu điểm/cài đặt thì bỏ localStorage.clear().
// =====================================================

async function clearPwaCacheAndReload() {
    try {
        // 1. Xoá Cache Storage
        if ('caches' in window) {
            const cacheNames = await caches.keys();

            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }

        // 2. Gỡ service worker nếu có
        if ('serviceWorker' in navigator) {
            const registrations =
                await navigator.serviceWorker.getRegistrations();

            await Promise.all(
                registrations.map(registration => registration.unregister())
            );
        }

        // 3. Xoá localStorage
        // Sau này nếu có lưu điểm/cài đặt thì tắt dòng này.
        localStorage.clear();

        // 4. Xoá sessionStorage
        sessionStorage.clear();

        alert('Đã xoá cache. App sẽ tải lại bản mới.');

        // 5. Reload chống cache
        const cleanUrl = location.origin + location.pathname;
        location.replace(cleanUrl + '?refresh=' + Date.now());

    } catch (err) {
        console.error('Lỗi xoá cache:', err);

        alert(
            'Không xoá được cache hoàn toàn.\n' +
            'Bạn hãy đóng app rồi mở lại.'
        );
    }
}

// PWA: dùng đường dẫn tương đối để chạy được trong thư mục /behocv3.2/ hoặc khi test local.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.log('SW Failed:', err);
        });
    });
}

let deferredPrompt = null;



window.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('pwa-install-btn');
    const iosGuide = document.getElementById('ios-guide');

    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    if (isStandalone) {
        if (installBtn) installBtn.style.display = 'none';
        if (iosGuide) iosGuide.style.display = 'none';
        return;
    }

    // iPhone/iPad: không có popup cài trực tiếp như Android/PC
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && iosGuide) {
        iosGuide.style.display = 'block';
    }

    // Android Chrome / PC Chrome
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;

        if (installBtn) {
            installBtn.style.display = 'flex';
        }

        showInstallInvitePopup();
    });

    if (installBtn) {
        installBtn.addEventListener('click', triggerPwaInstall);
    }

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        closeInstallInvitePopup();

        if (installBtn) {
            installBtn.style.display = 'none';
        }
    });
});

function showInstallInvitePopup() {
    if (!deferredPrompt) return;
    if (document.getElementById('install-invite-popup')) return;

    // Chỉ hiện 1 lần trong mỗi tab, tránh làm phiền bé/phụ huynh
    if (sessionStorage.getItem('installInviteClosed') === '1') return;

    const popup = document.createElement('div');
    popup.id = 'install-invite-popup';
    popup.className = 'install-invite-popup';

    popup.innerHTML = `
        <div class="install-invite-box">
            <div class="install-invite-icon">📲</div>
            <div class="install-invite-title">Cài App Cho Bé?</div>
            <div class="install-invite-text">
                Cài ra màn hình chính để mở game nhanh hơn.
            </div>

            <div class="install-invite-actions">
                <button class="install-now-btn" type="button" onclick="triggerPwaInstall()">
                    Cài ngay
                </button>
                <button class="install-later-btn" type="button" onclick="closeInstallInvitePopup(true)">
                    Để sau
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);
}

function closeInstallInvitePopup(saveClosed = false) {
    const popup = document.getElementById('install-invite-popup');
    if (popup) popup.remove();

    if (saveClosed) {
        sessionStorage.setItem('installInviteClosed', '1');
    }
}

async function triggerPwaInstall() {
    closeInstallInvitePopup(false);

    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;

    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}


