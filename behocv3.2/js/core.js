// js/core.js
// Điều khiển app v3.2: mở khóa audio, hiện menu, load CSS/JS game khi bấm.

const loadedCss = new Set();
const loadedJs = new Set();
const gameModules = {};

let activeGame = null;
let activeGameId = null;
let currentQuestionData = null;
let replayTimer = null;
let questionTimer = null;
let questionTimerDeadline = 0;
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
    stopAllAudio();

    activeGame = null;
    activeGameId = null;
    currentQuestionData = null;

    // Nếu game custom như Alphabet còn màn hình riêng thì xóa.
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
    stopAllAudio();
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

    // 1. Dựng khung game trước
    renderGameShell(title);
    resetScore();
    resetTopTimerBar();

    // 2. Hiện câu hỏi + đáp án ngay
    // Nhưng KHÔNG phát âm câu hỏi và KHÔNG chạy thời gian vội
    nextQuestion({
        playAudioNow: false,
        startTimerNow: false
    });

    // 3. Phát dingdong mỗi lần vào game
    let introDone = false;

    function playFirstQuestionAudio() {
        if (introDone) return;
        if (activeGame !== module) return;

        introDone = true;

        // Dingdong xong mới phát âm câu hỏi + bắt đầu tính giờ
        playQuestionAudio();
        startQuestionTimer();
        startAutoReplay();
    }

    playAudio(welcomeAudioPath(), {
        stopOld: true,
        onended: playFirstQuestionAudio,
        onerror: playFirstQuestionAudio
    });
}

function nextQuestion(config = {}) {
    if (!activeGame) return;

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

function handleCheckAnswer(selected, btn) {
    if (!activeGame || !currentQuestionData) return;

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
        setTimeout(nextQuestion, 2000);
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
        if (currentQuestionData !== questionRef) return;

        // Tự nhắc lại câu hỏi đúng 1 lần, không lặp vô hạn
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
// THANH THỜI GIAN CÂU HỎI
// Mặc định mỗi câu có 10 giây.
// Game nào muốn khác có thể đặt activeGame.questionTimeSec = số giây.
// =====================================================

function getQuestionTimeMs() {
    if (!activeGame) return 10000;

    const sec = Number(activeGame.questionTimeSec || activeGame.questionTime || 10);

    if (!Number.isFinite(sec) || sec <= 0) {
        return 10000;
    }

    // Nếu truyền 10 nghĩa là 10 giây. Nếu truyền 10000 nghĩa là mili giây.
    return sec > 1000 ? sec : sec * 1000;
}

function resetTopTimerBar() {
    setTopTimerPercent(100);
}

function setTopTimerPercent(percent) {
    const fill = document.getElementById('top-timer-fill');
    if (!fill) return;

    const p = Math.max(0, Math.min(100, percent));

    fill.style.transform = `scaleX(${p / 100})`;

    fill.classList.remove('timer-green', 'timer-yellow', 'timer-red');

    if (p <= 30) {
        fill.classList.add('timer-red');
    } else if (p <= 75) {
        fill.classList.add('timer-yellow');
    } else {
        fill.classList.add('timer-green');
    }
}

function startQuestionTimer() {
    stopQuestionTimer(false);

    const totalMs = getQuestionTimeMs();
    questionTimerDeadline = Date.now() + totalMs;

    setTopTimerPercent(100);

    questionTimer = setInterval(() => {
        const remainMs = questionTimerDeadline - Date.now();
        const percent = (remainMs / totalMs) * 100;

        setTopTimerPercent(percent);

        if (remainMs <= 0) {
            stopQuestionTimer(false);
            handleQuestionTimeUp();
        }
    }, 100);
}

function stopQuestionTimer(resetBar = false) {
    if (questionTimer) {
        clearInterval(questionTimer);
        questionTimer = null;
    }

    if (resetBar) {
        resetTopTimerBar();
    }
}

function handleQuestionTimeUp() {
    if (!activeGame || !currentQuestionData) return;

    stopAutoReplay();
    setTopTimerPercent(0);

    playSequence([wrongAudioPath()]);

    setTimeout(() => {
        if (activeGame) {
            nextQuestion();
        }
    }, 900);
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


