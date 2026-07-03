// js/game-core.js
// Hàm dùng chung cho khung game v3.2.

let globalScore = 0;

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function resetScore() {
    globalScore = 0;
    const score = document.getElementById('score');
    if (score) score.textContent = '0';
}

function addScore(amount = 1) {
    globalScore += amount;
    const score = document.getElementById('score');
    if (score) score.textContent = String(globalScore);
}

// =====================================================
// GAME SHELL DÙNG CHUNG
// Tạo khung chuẩn cho toàn bộ game:
// - top-bar: Home / Điểm / Học-Luyện nếu có
// - display-area: khu câu hỏi
// - answer-panel: khu đáp án + nút loa ở giữa phía trên
// =====================================================

function renderGameShell(title = 'Bé Vui Học', config = {}) {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) return;

    const {
        hasMode = false,
        mode = 'practice',
        onLearn = '',
        onPractice = ''
    } = config;

    gameScreen.innerHTML = `
        ${renderGameHeader({
            score: '⭐ <span id="score">0</span>',
            hasMode,
            mode,
            onHome: 'backToMenu()',
            onLearn,
            onPractice
        })}

        <div class="game-body">
            <div class="display-area" id="question-content"></div>

            <div class="answer-panel">
                <button
                    class="replay-btn"
                    type="button"
                    onclick="handleReplayQuestion()"
                    aria-label="Nghe lại">
                    🔊
                </button>

                <div class="options-grid" id="options-grid"></div>
            </div>
        </div>
    `;
}


// =====================================================
// TOP BAR DÙNG CHUNG
// Home / Điểm / Học-Luyện
// Dùng class .top-bar thống nhất cho toàn bộ game.
// =====================================================

function renderGameHeader(config = {}) {
    const {
        score = '⭐ 0',
        hasMode = false,
        mode = 'practice',
        onHome = 'backToMenu()',
        onLearn = '',
        onPractice = ''
    } = config;

    const modeHtml = hasMode
        ? `
            <div class="top-bar-mode">
                <button
                    class="game-mode-btn ${mode === 'learn' ? 'active' : ''}"
                    type="button"
                    onclick="${onLearn}"
                    title="Học">
                    📖
                </button>

                <button
                    class="game-mode-btn ${mode === 'practice' ? 'active' : ''}"
                    type="button"
                    onclick="${onPractice}"
                    title="Luyện">
                    🎯
                </button>
            </div>
        `
        : '';

    return `
        <div class="top-bar">
            <div class="top-bar-left">
                <button class="back-btn" type="button" onclick="${onHome}">
                    <span class="back-icon">🏠</span>
                </button>
            </div>

            <div class="top-bar-center">
                <div id="score-container">${score}</div>
            </div>

            <div class="top-bar-right">
                ${modeHtml}
            </div>
        </div>
    `;
}

function clearGameScreen() {
    stopAllAudio();
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.innerHTML = '';
}

// =====================================================
// PHẦN 6 — PHÁO GIẤY NAN QUẠT
// Bắn từ 2 góc dưới lên, xòe vào giữa như 🎉
// Dùng chung cho toàn bộ game.
// =====================================================

function fireGameConfetti() {
    fireFanConfettiFromSide('left');
    fireFanConfettiFromSide('right');
}


// =====================================================
// PHẦN 7 — BẮN PHÁO GIẤY TỪ 1 GÓC
// side = 'left' hoặc 'right'
// =====================================================

function fireFanConfettiFromSide(side = 'left') {
    const colors = [
        '#ff4081',
        '#ffeb3b',
        '#00e5ff',
        '#76ff03',
        '#ff9800',
        '#e040fb',
        '#4caf50',
        '#2196f3',
        '#ff1744',
        '#00c853'
    ];

    const isLeft = side === 'left';

    // Vị trí nòng pháo: 2 góc dưới
    const originX = isLeft
        ? window.innerWidth * 0.18
        : window.innerWidth * 0.82;

    const originY = window.innerHeight + 8;

    // Số mảnh giấy mỗi bên
    const pieces = 100;

    // Tạo ống pháo nhỏ ở dưới
    createConfettiCannon(originX, originY, isLeft);

    for (let i = 0; i < pieces; i++) {
        const piece = document.createElement('div');

        const size = Math.random() * 8 + 8;
        const longPiece = Math.random() > 0.35;

        piece.style.position = 'fixed';
        piece.style.left = originX + 'px';
        piece.style.top = originY + 'px';

        piece.style.width = longPiece ? size * 0.65 + 'px' : size + 'px';
        piece.style.height = longPiece ? size * 1.7 + 'px' : size + 'px';

        piece.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.borderRadius = longPiece ? '3px' : '50%';
        piece.style.zIndex = '99999';
        piece.style.pointerEvents = 'none';
        piece.style.opacity = '1';
        piece.style.willChange = 'transform, opacity';

        document.body.appendChild(piece);

        // Góc bắn dạng nan quạt
        // Bên trái bắn lên và sang phải
        // Bên phải bắn lên và sang trái
        const fanIndex = i / pieces;

        const minX = isLeft ? 90 : -90;
        const maxX = isLeft ? 360 : -360;

        const flyX =
            minX + (maxX - minX) * fanIndex + (Math.random() * 60 - 30);

        const flyY =
            -(window.innerHeight * 0.46 + Math.random() * 180);

        // Sau khi lên cao thì rơi xuống tiếp
        const fallX = flyX + (Math.random() * 160 - 80);
        const fallY = window.innerHeight + 120;

        const rotate1 = Math.random() * 360;
        const rotate2 = rotate1 + 540 + Math.random() * 720;

        const delay = Math.random() * 90;

            // Tổng thời gian dài hơn để phần rơi chậm hơn
            const duration = 3600 + Math.random() * 900;

            piece.animate(
                [
                    {
                        transform: 'translate(-50%, -50%) scale(0.35) rotate(0deg)',
                        opacity: 1,
                        offset: 0,
                        easing: 'cubic-bezier(.12,.9,.22,1)'
                    },

                    // Lên đỉnh rất nhanh
                    {
                        transform: `
                            translate(
                                calc(-50% + ${flyX}px),
                                ${flyY}px
                            )
                            scale(1.25)
                            rotate(${rotate1}deg)
                        `,
                        opacity: 1,
                        offset: 0.22,
                        easing: 'cubic-bezier(.05,.7,.15,1)'
                    },

                    // Rơi xuống chậm hơn
                    {
                        transform: `
                            translate(
                                calc(-50% + ${fallX}px),
                                ${fallY}px
                            )
                            scale(0.9)
                            rotate(${rotate2}deg)
                        `,
                        opacity: 0,
                        offset: 1
                    }
                ],
                {
                    duration: duration,
                    delay: delay,
                    easing: 'linear',
                    fill: 'forwards'
                }
            );

        setTimeout(() => {
            piece.remove();
        }, duration + delay + 120);
    }

    createFanSpark(originX, originY, colors, isLeft);
}


// =====================================================
// PHẦN 8 — ỐNG PHÁO NHỎ Ở DƯỚI
// =====================================================

function createConfettiCannon(x, y, isLeft) {
    const cannon = document.createElement('div');

    cannon.style.position = 'fixed';
    cannon.style.left = x + 'px';
    cannon.style.top = y - 26 + 'px';
    cannon.style.width = '24px';
    cannon.style.height = '42px';
    cannon.style.background = 'linear-gradient(135deg,#ff9800,#ff4081)';
    cannon.style.borderRadius = '8px';
    cannon.style.zIndex = '99998';
    cannon.style.pointerEvents = 'none';
    cannon.style.transform = isLeft
        ? 'translate(-50%, -50%) rotate(-32deg)'
        : 'translate(-50%, -50%) rotate(32deg)';
    cannon.style.boxShadow = '0 4px 10px rgba(0,0,0,.25)';

    document.body.appendChild(cannon);

    cannon.animate(
        [
            { opacity: 1, transform: cannon.style.transform + ' scale(1)' },
            { opacity: 0, transform: cannon.style.transform + ' scale(.75)' }
        ],
        {
            duration: 900,
            easing: 'ease-out',
            fill: 'forwards'
        }
    );

    setTimeout(() => {
        cannon.remove();
    }, 950);
}


// =====================================================
// PHẦN 9 — TIA SÁNG LÚC BẮN
// =====================================================

function createFanSpark(x, y, colors, isLeft) {
    for (let i = 0; i < 18; i++) {
        const spark = document.createElement('div');

        spark.style.position = 'fixed';
        spark.style.left = x + 'px';
        spark.style.top = y - 34 + 'px';
        spark.style.width = '7px';
        spark.style.height = '7px';
        spark.style.borderRadius = '50%';
        spark.style.background =
            colors[Math.floor(Math.random() * colors.length)];
        spark.style.zIndex = '99999';
        spark.style.pointerEvents = 'none';

        document.body.appendChild(spark);

        const dx = isLeft
            ? Math.random() * 120 + 20
            : -(Math.random() * 120 + 20);

        const dy = -(Math.random() * 110 + 30);

        spark.animate(
            [
                {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(calc(-50% + ${dx}px), ${dy}px) scale(0)`,
                    opacity: 0
                }
            ],
            {
                duration: 780,
                easing: 'ease-out',
                fill: 'forwards'
            }
        );

        setTimeout(() => {
            spark.remove();
        }, 850);
    }
}


// =====================================================
// PHẦN 10 — GIỮ TÊN CŨ ĐỂ GAME CŨ KHÔNG LỖI
// =====================================================

function fireConfetti() {
    fireGameConfetti();
}
