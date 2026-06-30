// js/core.js
// Điều khiển app v3.2: mở khóa audio, hiện menu, load CSS/JS game khi bấm.

const loadedCss = new Set();
const loadedJs = new Set();
const gameModules = {};

let activeGame = null;
let activeGameId = null;
let currentQuestionData = null;
let replayTimer = null;
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
    }
    if (menu) menu.style.display = 'flex';
}

function backToMenu() {
    stopAutoReplay();
    stopAllAudio();

    activeGame = null;
    activeGameId = null;
    currentQuestionData = null;

    // Nếu game custom như Alphabet còn màn hình riêng thì xóa.
    const alphabetScreen = document.getElementById('alphabet-screen');
    if (alphabetScreen) alphabetScreen.remove();

    showMenuOnly();
}

async function startGame(gameId) {
    const config = GAME_CONFIG[gameId];

    if (!config) {
        showMaintenancePopup('Game');
        return;
    }

    stopAutoReplay();
    stopAllAudio();

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

    renderGameShell(title);
    resetScore();

    playAudio(welcomeAudioPath(), {
        stopOld: true,
        onended: nextQuestion,
        onerror: nextQuestion
    });

    // Phòng trường hợp audio bị thiếu nhưng onerror không kích hoạt kịp.
    setTimeout(() => {
        if (activeGame === module && !currentQuestionData) {
            nextQuestion();
        }
    }, 900);
}

function nextQuestion() {
    if (!activeGame) return;

    stopAutoReplay();

    const questionContent = document.getElementById('question-content');
    const optionsGrid = document.getElementById('options-grid');
    if (!questionContent || !optionsGrid) return;

    currentQuestionData = activeGame.generateData();
    activeGame.currentData = currentQuestionData;

    questionContent.innerHTML = activeGame.renderDisplay(currentQuestionData);

    optionsGrid.innerHTML = '';
    optionsGrid.className = 'options-grid';
    if (activeGame.gridClass) optionsGrid.classList.add(activeGame.gridClass);

    const options = shuffleArray(activeGame.getOptions(currentQuestionData));

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        activeGame.styleOptionBtn(btn, option);
        btn.onclick = () => handleCheckAnswer(option, btn);
        optionsGrid.appendChild(btn);
    });

    setTimeout(() => {
        playQuestionAudio();
        setTimeout(startAutoReplay, 3000);
    }, 300);
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

function startAutoReplay() {
    stopAutoReplay();
    replayTimer = setInterval(playQuestionAudio, 5000);
}

function stopAutoReplay() {
    if (replayTimer) {
        clearInterval(replayTimer);
        replayTimer = null;
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


