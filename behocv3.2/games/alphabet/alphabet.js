// games/alphabet/alphabet.js
// =====================================================
// GAME: BẢNG CHỮ CÁI
// Chuẩn v3.2 - dùng chung game-screen, renderGameShell(), top-bar,
// display-area, answer-panel, replay-btn của game-core.js.
// Không tự tạo alphabet-screen riêng nữa.
// =====================================================

const ALPHABET_DATA = {
    'a':   { word: 'cái ca',    img: 'ca.png',         audio: 'spell_a.mp3' },
    'ă':   { word: 'con trăn',  img: 'tran.png',       audio: 'spell_aw.mp3' },
    'â':   { word: 'cái ấm',    img: 'am.png',         audio: 'spell_aa.mp3' },
    'b':   { word: 'con bò',    img: 'bo.png',         audio: 'spell_b.mp3' },
    'c':   { word: 'con cá',    img: 'ca_fish.png',    audio: 'spell_c.mp3' },
    'd':   { word: 'con dê',    img: 'de.png',         audio: 'spell_d.mp3' },
    'đ':   { word: 'đu đủ',     img: 'dudu.png',       audio: 'spell_dd.mp3' },
    'e':   { word: 'em bé',     img: 'embe.png',       audio: 'spell_e.mp3' },
    'ê':   { word: 'con ếch',   img: 'ech.png',        audio: 'spell_ee.mp3' },
    'g':   { word: 'con gà',    img: 'ga.png',         audio: 'spell_g.mp3' },
    'h':   { word: 'bông hoa',  img: 'hoa.png',        audio: 'spell_h.mp3' },
    'i':   { word: 'viên bi',   img: 'bi.png',         audio: 'spell_i.mp3' },
    'k':   { word: 'cái kéo',   img: 'keo.png',        audio: 'spell_k.mp3' },
    'l':   { word: 'con lợn',   img: 'heo.png',        audio: 'spell_l.mp3' },
    'm':   { word: 'con mèo',   img: 'meo.png',        audio: 'spell_m.mp3' },
    'n':   { word: 'quả na',    img: 'na.png',         audio: 'spell_n.mp3' },
    'o':   { word: 'con ong',   img: 'ong.png',        audio: 'spell_o.mp3' },
    'ô':   { word: 'cái ô',     img: 'o_umbrella.png', audio: 'spell_oo.mp3' },
    'ơ':   { word: 'quả mơ',    img: 'mo.png',         audio: 'spell_ow.mp3' },
    'p':   { word: 'viên pin',  img: 'pin.png',        audio: 'spell_p.mp3' },
    'q':   { word: 'món quà',   img: 'qua.png',        audio: 'spell_q.mp3' },
    'r':   { word: 'con rùa',   img: 'rua.png',        audio: 'spell_r.mp3' },
    's':   { word: 'ngôi sao',  img: 'sao.png',        audio: 'spell_s.mp3' },
    't':   { word: 'con tôm',   img: 'tom.png',        audio: 'spell_t.mp3' },
    'u':   { word: 'cái mũ',    img: 'mu.png',         audio: 'spell_u.mp3' },
    'ư':   { word: 'sư tử',     img: 'sutu.png',       audio: 'spell_uw.mp3' },
    'v':   { word: 'quyển vở',  img: 'vo.png',         audio: 'spell_v.mp3' },
    'x':   { word: 'xe đạp',    img: 'xedap.png',      audio: 'spell_x.mp3' },
    'y':   { word: 'y tá',      img: 'yta.png',        audio: 'spell_y.mp3' },

    'ch':  { word: 'con chó',   img: 'cho.png',        audio: 'spell_ch.mp3' },
    'gh':  { word: 'cái ghế',   img: 'ghe.png',        audio: 'spell_gh.mp3' },
    'gi':  { word: 'con giun',  img: 'giun.png',       audio: 'spell_gi.mp3' },
    'kh':  { word: 'quả khế',   img: 'khe.png',        audio: 'spell_kh.mp3' },
    'ng':  { word: 'con ngựa',  img: 'ngua.png',       audio: 'spell_ng.mp3' },
    'ngh': { word: 'củ nghệ',   img: 'nghe.png',       audio: 'spell_ngh.mp3' },
    'nh':  { word: 'con nhện',  img: 'nhen.png',       audio: 'spell_nh.mp3' },
    'ph':  { word: 'phở bò',    img: 'pho.png',        audio: 'spell_ph.mp3' },
    'th':  { word: 'con thỏ',   img: 'tho.png',        audio: 'spell_th.mp3' },
    'tr':  { word: 'trăng',     img: 'trang.png',      audio: 'spell_tr.mp3' },
    'qu':  { word: 'quạt',      img: 'quat.png',       audio: 'spell_qu.mp3' }
};

const ALPHABET_KEYS = Object.keys(ALPHABET_DATA);

let alphabetMode = 'learn';
let alphabetScore = 0;
let alphabetCurrentChar = ALPHABET_KEYS[0];
let alphabetCurrentQuestion = ALPHABET_KEYS[0];
let alphabetIntroToken = 0;

function alphabetImgPath(fileName) {
    if (typeof imgPath === 'function') {
        return imgPath(fileName);
    }

    return 'img/' + fileName;
}

function alphabetSoundPath(fileName) {
    if (typeof alphabetAudioPath === 'function') {
        return alphabetAudioPath(fileName);
    }

    return 'audio/alphabet/' + fileName;
}

function alphabetStopAudio() {
    if (typeof stopAllAudio === 'function') {
        stopAllAudio();
    }
}

function alphabetPlayAudio(fileName) {
    if (!fileName) return;

    alphabetStopAudio();

    const path = alphabetSoundPath(fileName);

    if (typeof playAudio === 'function') {
        playAudio(path, { stopOld: true });
        return;
    }

    new Audio(path).play().catch(() => {});
}

function alphabetUpdateScore() {
    const score = document.getElementById('score');
    if (score) score.textContent = String(alphabetScore);
}

function alphabetPrepareCommonShell() {
    const menu = document.getElementById('menu-screen');
    const game = document.getElementById('game-screen');

    if (menu) menu.style.display = 'none';

    if (game) {
        game.style.display = 'flex';
        game.className = 'game-view game-alphabet game-alphabet-' + alphabetMode;
    }

    renderGameShell('Bảng Chữ Cái', {
        hasMode: true,
        mode: alphabetMode,
        onLearn: "setAlphabetMode('learn')",
        onPractice: "setAlphabetMode('practice')"
    });

    alphabetUpdateScore();

    if (typeof resetTopTimerBar === 'function') {
        resetTopTimerBar();
    }

    const replayBtn = document.querySelector('#game-screen .replay-btn');
    if (replayBtn) {
        replayBtn.removeAttribute('onclick');
        replayBtn.onclick = replayAlphabetAudio;
    }

    // Một số bản game-core cũ còn chèn game-split-line.
    // CSS đã ẩn, dòng này để tránh chiếm hàng grid trên bản cũ.
    const splitLine = document.querySelector('#game-screen .game-split-line');
    if (splitLine) splitLine.style.display = 'none';
}

function startAlphabetGame() {
    alphabetStopAudio();

    alphabetMode = 'learn';
    alphabetScore = 0;
    alphabetCurrentChar = ALPHABET_KEYS[0];
    alphabetCurrentQuestion = ALPHABET_KEYS[0];

    alphabetRenderCurrentMode({ playNow: false });

    const token = ++alphabetIntroToken;

    function afterIntro() {
        if (token !== alphabetIntroToken) return;
        replayAlphabetAudio();
    }

    if (typeof playAudio === 'function' && typeof welcomeAudioPath === 'function') {
        // Không dùng timeout ép chuyển câu hỏi nữa.
        // Timeout cũ có thể gọi replayAlphabetAudio() khi dingdong chưa phát xong,
        // làm stopAllAudio() cắt ngang tiếng chào.
        playAudio(welcomeAudioPath(), {
            stopOld: true,
            onended: afterIntro,
            onerror: afterIntro
        });
    } else {
        afterIntro();
    }
}

function setAlphabetMode(mode) {
    if (mode !== 'learn' && mode !== 'practice') return;
    if (alphabetMode === mode) return;

    alphabetStopAudio();
    alphabetMode = mode;

    alphabetRenderCurrentMode({ playNow: true });
}

function alphabetRenderCurrentMode(options = {}) {
    alphabetPrepareCommonShell();

    if (alphabetMode === 'learn') {
        renderAlphabetLearnMode(options);
    } else {
        renderAlphabetPracticeMode(options);
    }
}

function renderAlphabetLearnMode(options = {}) {
    const questionContent = document.getElementById('question-content');
    const optionsGrid = document.getElementById('options-grid');

    if (!questionContent || !optionsGrid) return;

    questionContent.innerHTML = `
        <div class="alphabet-learn-display" data-stop-audio>
            <div class="alphabet-char-box" onclick="replayAlphabetAudio()">
                <div id="alphabet-upper" class="alphabet-upper"></div>
                <div id="alphabet-lower" class="alphabet-lower"></div>
            </div>

            <div class="alphabet-picture-box" onclick="replayAlphabetAudio()">
                <img id="alphabet-learn-img" class="alphabet-learn-img" src="" alt="" draggable="false">
                <div id="alphabet-learn-word" class="alphabet-word"></div>
            </div>
        </div>
    `;

    optionsGrid.className = 'options-grid alphabet-keyboard-wrap';
    optionsGrid.innerHTML = `
        <div class="alphabet-keyboard-grid">
            ${ALPHABET_KEYS.map(char => `
                <button
                    class="key-btn alphabet-key-btn"
                    type="button"
                    data-char="${char}"
                    onclick="selectAlphabetChar('${char}')">
                    <span class="alphabet-key-upper">${char.toUpperCase()}</span>
                    <span class="alphabet-key-lower">${char}</span>
                </button>
            `).join('')}
        </div>
    `;

    selectAlphabetChar(alphabetCurrentChar, { playNow: options.playNow === true });
}

function selectAlphabetChar(char, options = {}) {
    const data = ALPHABET_DATA[char];
    if (!data) return;

    alphabetCurrentChar = char;

    document.querySelectorAll('#game-screen .alphabet-key-btn').forEach(btn => {
        btn.classList.toggle('active-key', btn.dataset.char === char);
    });

    const upper = document.getElementById('alphabet-upper');
    const lower = document.getElementById('alphabet-lower');
    const img = document.getElementById('alphabet-learn-img');
    const word = document.getElementById('alphabet-learn-word');

    if (upper) upper.textContent = char.toUpperCase();
    if (lower) lower.textContent = char;

    if (img) {
        img.src = alphabetImgPath(data.img);
        img.alt = data.word;
    }

    if (word) word.textContent = data.word;

    if (options.playNow !== false) {
        alphabetPlayAudio(data.audio);
    }
}

function renderAlphabetPracticeMode(options = {}) {
    const questionContent = document.getElementById('question-content');
    const optionsGrid = document.getElementById('options-grid');

    if (!questionContent || !optionsGrid) return;

    alphabetCurrentQuestion = randomAlphabetChar();
    const data = ALPHABET_DATA[alphabetCurrentQuestion];
    const choices = createAlphabetPracticeChoices(alphabetCurrentQuestion);

    questionContent.innerHTML = `
        <div class="alphabet-practice-question" onclick="replayAlphabetAudio()">
            <img
                id="alphabet-practice-img"
                class="alphabet-practice-img"
                src="${alphabetImgPath(data.img)}"
                alt=""
                draggable="false">

            <div id="alphabet-practice-word" class="alphabet-practice-word">
                ${data.word}
            </div>
        </div>
    `;

    optionsGrid.className = 'options-grid alphabet-practice-grid';
    optionsGrid.innerHTML = choices.map(char => `
        <button
            class="option-btn alphabet-option-btn"
            type="button"
            onclick="checkAlphabetAnswer('${char}', this)">
            <span class="alphabet-option-upper">${char.toUpperCase()}</span>
            <span class="alphabet-option-lower">${char}</span>
        </button>
    `).join('');

    if (options.playNow !== false) {
        setTimeout(replayAlphabetAudio, 250);
    }
}

function randomAlphabetChar() {
    return ALPHABET_KEYS[Math.floor(Math.random() * ALPHABET_KEYS.length)];
}

function createAlphabetPracticeChoices(correctChar) {
    const set = new Set([correctChar]);

    while (set.size < 4) {
        set.add(randomAlphabetChar());
    }

    if (typeof shuffleArray === 'function') {
        return shuffleArray(Array.from(set));
    }

    return Array.from(set).sort(() => Math.random() - 0.5);
}

function replayAlphabetAudio() {
    if (alphabetMode === 'learn') {
        const data = ALPHABET_DATA[alphabetCurrentChar];
        if (data) alphabetPlayAudio(data.audio);
        return;
    }

    const data = ALPHABET_DATA[alphabetCurrentQuestion];
    if (data) alphabetPlayAudio(data.audio);
}

function checkAlphabetAnswer(char, btn) {
    if (alphabetMode !== 'practice') return;

    if (char === alphabetCurrentQuestion) {
        document.querySelectorAll('#game-screen .alphabet-option-btn').forEach(item => {
            item.disabled = true;
        });

        btn.classList.add('correct');

        const word = document.getElementById('alphabet-practice-word');
        if (word) word.classList.add('show');

        const img = document.getElementById('alphabet-practice-img');
        if (img) {
            img.animate(
                [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.08)' },
                    { transform: 'scale(1)' }
                ],
                { duration: 420 }
            );
        }

        alphabetScore += 1;
        alphabetUpdateScore();

        if (typeof playAudio === 'function' && typeof correctAudioPath === 'function') {
            playAudio(correctAudioPath(), { stopOld: true });
        }

        if (typeof fireGameConfetti === 'function') {
            fireGameConfetti();
        }

        setTimeout(() => {
            if (alphabetMode === 'practice') {
                renderAlphabetPracticeMode({ playNow: true });
            }
        }, 1800);

        return;
    }

    btn.classList.add('wrong');

    if (typeof playAudio === 'function' && typeof wrongAudioPath === 'function') {
        playAudio(wrongAudioPath(), { stopOld: true });
    }

    btn.animate(
        [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-6px)' },
            { transform: 'translateX(6px)' },
            { transform: 'translateX(0)' }
        ],
        { duration: 260 }
    );

    setTimeout(() => {
        btn.classList.remove('wrong');
    }, 700);
}

// Cho inline onclick và core.js gọi được chắc chắn.
window.startAlphabetGame = startAlphabetGame;
window.setAlphabetMode = setAlphabetMode;
window.selectAlphabetChar = selectAlphabetChar;
window.replayAlphabetAudio = replayAlphabetAudio;
window.checkAlphabetAnswer = checkAlphabetAnswer;
