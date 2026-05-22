// =====================================================
// ALPHABET FULL GAME
// Không dùng registerGame của core nữa
// Tự quản lý toàn bộ UI
// =====================================================

// -----------------------------------------------------
// DATA
// -----------------------------------------------------

const ALPHABET_DATA = {
    'a': { word: 'cái ca', img: 'ca.png', audio: 'spell_a.mp3' },
    'ă': { word: 'con trăn', img: 'tran.png', audio: 'spell_aw.mp3' },
    'â': { word: 'cái ấm', img: 'am.png', audio: 'spell_aa.mp3' },
    'b': { word: 'con bò', img: 'bo.png', audio: 'spell_b.mp3' },
    'c': { word: 'con cá', img: 'ca_fish.png', audio: 'spell_c.mp3' },
    'd': { word: 'con dê', img: 'de.png', audio: 'spell_d.mp3' },
    'đ': { word: 'đu đủ', img: 'dudu.png', audio: 'spell_dd.mp3' },
    'e': { word: 'em bé', img: 'embe.png', audio: 'spell_e.mp3' },
    'ê': { word: 'con ếch', img: 'ech.png', audio: 'spell_ee.mp3' },
    'g': { word: 'con gà', img: 'ga.png', audio: 'spell_g.mp3' },
    'h': { word: 'bông hoa', img: 'hoa.png', audio: 'spell_h.mp3' },
    'i': { word: 'viên bi', img: 'bi.png', audio: 'spell_i.mp3' },
    'k': { word: 'cái kéo', img: 'keo.png', audio: 'spell_k.mp3' },
    'l': { word: 'con lợn', img: 'heo.png', audio: 'spell_l.mp3' },
    'm': { word: 'con mèo', img: 'meo.png', audio: 'spell_m.mp3' },
    'n': { word: 'quả na', img: 'na.png', audio: 'spell_n.mp3' },
    'o': { word: 'con ong', img: 'ong.png', audio: 'spell_o.mp3' },
    'ô': { word: 'cái ô', img: 'o_umbrella.png', audio: 'spell_oo.mp3' },
    'ơ': { word: 'quả mơ', img: 'mo.png', audio: 'spell_ow.mp3' },
    'p': { word: 'viên pin', img: 'pin.png', audio: 'spell_p.mp3' },
    'q': { word: 'món quà', img: 'qua.png', audio: 'spell_q.mp3' },
    'r': { word: 'con rùa', img: 'rua.png', audio: 'spell_r.mp3' },
    's': { word: 'ngôi sao', img: 'sao.png', audio: 'spell_s.mp3' },
    't': { word: 'con tôm', img: 'tom.png', audio: 'spell_t.mp3' },
    'u': { word: 'cái mũ', img: 'mu.png', audio: 'spell_u.mp3' },
    'ư': { word: 'sư tử', img: 'sutu.png', audio: 'spell_uw.mp3' },
    'v': { word: 'quyển vở', img: 'vo.png', audio: 'spell_v.mp3' },
    'x': { word: 'xe đạp', img: 'xedap.png', audio: 'spell_x.mp3' },
    'y': { word: 'y tá', img: 'yta.png', audio: 'spell_y.mp3' }
};

const ALPHABET_KEYS = Object.keys(ALPHABET_DATA);

// -----------------------------------------------------
// STATE
// -----------------------------------------------------

let alphabetMode = 'learn';

let alphabetScore = 0;

let alphabetAudio = null;

let currentQuestion = '';

// -----------------------------------------------------
// START GAME
// -----------------------------------------------------

function startAlphabetGame() {

    // Ẩn menu chính
    document.getElementById('menu-screen').style.display = 'none';

    // Ẩn game-screen cũ của core
    document.getElementById('game-screen').style.display = 'none';

    // Nếu đã có thì xóa
    let oldScreen = document.getElementById('alphabet-screen');

    if(oldScreen) {
        oldScreen.remove();
    }

    // Tạo màn hình riêng
    let screen = document.createElement('div');

    screen.id = 'alphabet-screen';

    screen.style.cssText = `
        position:fixed;
        inset:0;
        background:
        linear-gradient(
            135deg,
            #ffe082 0%,
            #ffcc80 40%,
            #ffab91 100%
        );
        z-index:9999;
        overflow:auto;
        padding:15px;
        box-sizing:border-box;
    `;

    screen.innerHTML = `

    <div style="
        width:100%;
        max-width:650px;
        margin:0 auto;

        height:min(90vh,900px);
        overflow:hidden;

        display:flex;
        flex-direction:column;

        background:rgba(255,255,255,0.25);
        backdrop-filter:blur(10px);
        border-radius:22px;
        padding:12px;
        box-shadow:0 8px 30px rgba(0,0,0,0.15);
        border:3px solid rgba(255,255,255,0.5);
    ">

        <!-- TOP BAR -->
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:15px;
            gap:10px;
        ">

            <!-- HOME MENU-->
            <button
                onclick="closeAlphabetGame()"
                class="back-btn">
                🏠 
            </button>

            <!-- SCORE -->
            <div
                id="alphabet-score"
                style="
                    font-size:28px;
                    font-weight:bold;
                "
            >
                ⭐ ${alphabetScore}
            </div>

            <!-- MODE LUYỆN HỌC -->
            <button
                id="alphabet-mode-btn"
                onclick="switchAlphabetMode()"
                Class="alphabet-icon-btn"
                style="
                    background:transparent;
                    border:none;
                    box-shadow:none;
                    font-size:42px;
                    padding:0;
                    width:auto;
                    height:auto;
                    transition:transform 0.15s;
                    onmousedown="this.style.transform='scale(0.9)'"
                    onmouseup="this.style.transform='scale(1)'"
                "
            >
                🎯
            </button>

        </div>

        <!-- CONTENT -->
        <div
            id="alphabet-content"
            style="
                flex:1;
            "
        ></div>

    </div>
`;

    document.body.appendChild(screen);

    let introAudio =
        new Audio('/file/mp3/game/dingdong.mp3');

    introAudio.play().catch(()=>{});

    introAudio.onended = () => {

        renderAlphabetMode();
    };
}

// -----------------------------------------------------
// CLOSE
// -----------------------------------------------------

function closeAlphabetGame() {

    if(alphabetAudio) {

        alphabetAudio.pause();

        alphabetAudio.currentTime = 0;
    }

    let screen = document.getElementById('alphabet-screen');

    if(screen) {
        screen.remove();
    }

    document.getElementById('menu-screen').style.display = 'flex';
}

// -----------------------------------------------------
// SWITCH MODE LUYỆN HỌC
// -----------------------------------------------------

function switchAlphabetMode() {

    const btn =
        document.getElementById(
            'alphabet-mode-btn'
        );

    if(alphabetMode === 'learn') {

        alphabetMode = 'practice';

        btn.innerHTML = '📖';

        btn.style.background =
            'linear-gradient(135deg,#ff9800,#ffb74d)';

    } else {

        alphabetMode = 'learn';

        btn.innerHTML = '🎯';

        btn.style.background =
            'linear-gradient(135deg,#4caf50,#66bb6a)';
    }

    renderAlphabetMode();
}

// -----------------------------------------------------
// RENDER MODE
// -----------------------------------------------------

function renderAlphabetMode() {

    if(alphabetMode === 'learn') {

        renderLearnMode();

    } else {

        renderPracticeMode();
    }
}

// -----------------------------------------------------
// LEARN MODE
// -----------------------------------------------------
function renderLearnMode() {

    const content = document.getElementById('alphabet-content');

    let keyboard = '';

    ALPHABET_KEYS.forEach(char => {

        keyboard += `
            <button
                class="key-btn"
                data-char="${char}"
                onclick="selectAlphabetChar('${char}')"
            >
                ${char.toUpperCase()}
            </button>
        `;
    });

    content.innerHTML = `
    
        <div style="
            display:flex;
            flex-direction:column;
            height:100%;
            min-height:0;
            gap:15px;
        ">

            <!-- KHUNG HIỂN THỊ -->
            <div
                style="
                    background:white;
                    border-radius:25px;
                    padding:20px;
                    flex-shrink:0;
                    box-shadow:0 3px 10px rgba(0,0,0,0.12);
                "
            >

                <div
                    onclick="replayAlphabetAudio()"
                    style="
                        display:grid;
                        grid-template-columns:1fr 2fr;
                        align-items:center;
                        gap:10px;
                    "
                >

                    <!-- CHỮ -->
                    <div
                        id="learn-char"
                        style="
                            font-size:min(24vw,140px);
                            font-weight:bold;
                            text-align:center;
                            line-height:1;
                        "
                    >
                        A
                    </div>

                    <!-- HÌNH + TÊN -->
                    <div style="
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        justify-content:center;
                    ">

                        <img
                            id="learn-img"
                            src=""
                            style="
                                width:min(28vw,160px);
                                height:min(28vw,160px);
                                object-fit:contain;
                            "
                        >

                        <div
                            id="learn-word"
                            style="
                                font-size:min(6vw,34px);
                                text-align:center;
                                margin-top:10px;
                                font-weight:bold;
                            "
                        ></div>

                    </div>

                </div>

                <!-- ICON AUDIO -->
                <div style="
                    text-align:center;
                    font-size:42px;
                    margin-top:10px;
                ">
                    🔊
                </div>

            </div>

            <!-- BẢNG CHỮ -->
            <div
                style="
                    flex:1;
                    overflow-y:auto;
                    padding-bottom:30px;
                "
            >

                <div style="
                    display:grid;
                    grid-template-columns:repeat(5,1fr);
                    gap:10px;
                ">
                    ${keyboard}
                </div>

            </div>

        </div>
    `;

    selectAlphabetChar(ALPHABET_KEYS[0]);
}




// -----------------------------------------------------
// SELECT CHAR
// -----------------------------------------------------
function selectAlphabetChar(char) {
    // =====================================
    // ACTIVE KEY
    // =====================================
    document
    .querySelectorAll('.key-btn')
    .forEach(btn => {btn.classList.remove('active-key');

        if(
            btn.dataset.char === char)
            {btn.classList.add('active-key');
        }
    });

    const data = ALPHABET_DATA[char];

    document.getElementById('learn-char').textContent =
        char.toUpperCase();

    document.getElementById('learn-word').textContent =
        data.word;

    document.getElementById('learn-img').src =
        '/img/game/' + data.img;

    playAlphabetAudio(data.audio);
}

// -----------------------------------------------------
// REPLAY
// -----------------------------------------------------

function replayAlphabetAudio() {

    let char =
        document
        .getElementById('learn-char')
        .textContent
        .toLowerCase();

    playAlphabetAudio(ALPHABET_DATA[char].audio);
}

// -----------------------------------------------------
// PRACTICE MODE
// -----------------------------------------------------

function renderPracticeMode() {

    const content = document.getElementById('alphabet-content');

    currentQuestion =
        ALPHABET_KEYS[
            Math.floor(Math.random() * ALPHABET_KEYS.length)
        ];

    const data =
        ALPHABET_DATA[currentQuestion];

    let set = new Set([currentQuestion]);

    while(set.size < 4) {

        set.add(
            ALPHABET_KEYS[
                Math.floor(Math.random() * ALPHABET_KEYS.length)
            ]
        );
    }

    let options =
        Array.from(set)
        .sort(() => Math.random() - 0.5);

    let buttons = '';

    options.forEach(char => {

        buttons += `
            <button
                class="option-btn"
                onclick="checkAlphabetAnswer('${char}', this)"                                 
            >
                ${char.toUpperCase()}
            </button>
        `;
    });

    content.innerHTML = `
    
        <div style="
            display:flex;
            flex-direction:column;
            height:100%;
            min-height:0;
        ">

            <!-- PHẦN TRÊN -->
            <div style="
                text-align:center;
                margin-bottom:25px;
                flex-shrink:0;

                background:white;
                border-radius:28px;
                padding:20px;
                box-shadow:
                    0 4px 12px rgba(0,0,0,0.12);
            ">

                <!-- HÌNH -->
                <div style="
                    display:flex;
                    justify-content:center;
                ">

                    <img
                        src="/img/game/${data.img}"
                        style="
                            width:180px;
                            height:180px;
                            object-fit:contain;
                        "
                    >

                </div>

                <!-- TÊN -->
                <div style="
                    width:100%;
                    text-align:center;
                    font-size:34px;
                    font-weight:bold;
                    margin-top:10px;
                    margin-bottom:18px;
                ">
                    ${data.word}
                </div>

            </div>

            <!-- ĐÁP ÁN -->
            <div style="
                flex:1;
                display:grid;
                grid-template-columns:repeat(2,1fr);
                gap:15px;
                align-content:start;
                position:relative;
                padding-top:50px;
            ">

                <!-- NÚT LOA -->
                <button
                    onclick="playPracticeQuestion()"
                    style="
                        position:absolute;
                        top:-5px;
                        left:50%;
                        transform:translateX(-50%);
                        border:none;
                        background:white;
                        width:70px;
                        height:70px;
                        border-radius:50%;
                        font-size:38px;
                        box-shadow:0 3px 8px rgba(0,0,0,0.2);
                        z-index:10;
                    "
                >
                    🔊
                </button>

                ${buttons}

            </div>

        </div>
    `;

    playPracticeQuestion();
}

// -----------------------------------------------------
// PLAY QUESTION
// -----------------------------------------------------

function playPracticeQuestion() {

    playAlphabetAudio(currentQuestion + '.mp3');
}

// -----------------------------------------------------
// CHECK ANSWER
// -----------------------------------------------------
function checkAlphabetAnswer(char, btn) {

    // ====================================
    // ĐÚNG
    // ====================================

    if(char === currentQuestion) {

        // khóa toàn bộ nút
        document
            .querySelectorAll('.option-btn')
            .forEach(b => {

                b.disabled = true;
            });

        // hiệu ứng xanh
        btn.classList.add('correct');

        alphabetScore++;

        document.getElementById(
            'alphabet-score'
        ).textContent =
            '⭐ ' + alphabetScore;

        // âm thanh đúng
        let correctAudio =
            new Audio(
                Math.random() < 0.5
                ? '/file/mp3/game/gioi qua.mp3'
                : '/file/mp3/game/chinh xac.mp3'
            );

        correctAudio.play().catch(()=>{});

        fireAlphabetConfetti();

        // ====================================
        // DELAY 1 GIÂY
        // ====================================

        setTimeout(() => {

            renderPracticeMode();

        }, 1000);
    }

    // ====================================
    // SAI
    // ====================================

    else {

        // đỏ nút sai
        btn.classList.add('wrong');

        let wrongAudio =
            new Audio(
                '/file/mp3/game/sai roi.mp3'
            );

        wrongAudio.play().catch(()=>{});

        // rung nhẹ
        btn.animate(
            [
                { transform:'translateX(0px)' },
                { transform:'translateX(-6px)' },
                { transform:'translateX(6px)' },
                { transform:'translateX(0px)' }
            ],
            {
                duration:300
            }
        );

        // bỏ đỏ
        setTimeout(() => {

            btn.classList.remove('wrong');

        }, 700);
    }
}

// -----------------------------------------------------
// PLAY AUDIO
// -----------------------------------------------------
function playAlphabetAudio(file, isCommon = false) {

    try {

        if(alphabetAudio) {

            alphabetAudio.pause();
            alphabetAudio.currentTime = 0;
        }

        // Nếu là âm thanh dùng chung
        let fullPath;

        if(isCommon) {

            fullPath =
                '/file/mp3/game/' + file;

        } else {

            fullPath =
                '/file/mp3/game/alphabet/' + file;
        }

        console.log('PLAY:', fullPath);

        alphabetAudio = new Audio(fullPath);

        alphabetAudio.volume = 1;

        alphabetAudio.play()
            .catch(err => {
                console.log('AUDIO ERROR:', err);
            });

    } catch(err) {

        console.log('AUDIO FAIL:', err);
    }
}

function fireAlphabetConfetti() {

    const colors = [
        '#f44336',
        '#2196f3',
        '#ffeb3b',
        '#4caf50'
    ];

    for(let i=0; i<30; i++) {

        let c = document.createElement('div');

        c.style.position = 'fixed';

        c.style.left =
            Math.random() * 100 + '%';

        c.style.top = '-20px';

        c.style.width = '12px';

        c.style.height = '12px';

        c.style.background =
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
            ];

        c.style.zIndex = '99999';

        c.style.borderRadius = '50%';

        c.style.pointerEvents = 'none';

        c.style.transition = 'all 2s linear';

        document.body.appendChild(c);

        setTimeout(() => {

            c.style.top = '100vh';

            c.style.transform =
                'rotate(720deg)';

        }, 50);

        setTimeout(() => {

            c.remove();

        }, 2200);
    }
}