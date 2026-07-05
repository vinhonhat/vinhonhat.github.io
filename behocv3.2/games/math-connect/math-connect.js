// games/math-connect/math-connect.js
// =====================================================
// GAME: NỐI PHÉP TÍNH
// Chuẩn v3.2 - custom game dùng chung game-screen/top-bar.
// Bé chọn 1 phép tính bên trái rồi chọn kết quả đúng bên phải.
// =====================================================

const MATH_CONNECT_LEVELS = [
    { pairCount: 3, maxResult: 10 },
    { pairCount: 4, maxResult: 12 },
    { pairCount: 5, maxResult: 15 },
    { pairCount: 6, maxResult: 20 }
];

let mathConnectLevel = 1;
let mathConnectScore = 0;
let mathConnectPairs = [];
let mathConnectSelectedEquation = null;
let mathConnectMatchedCount = 0;
let mathConnectLines = [];

function mathConnectRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mathConnectShuffle(list) {
    if (typeof shuffleArray === 'function') return shuffleArray(list);
    return list.slice().sort(() => Math.random() - 0.5);
}

function startMathConnectGame() {
    mathConnectLevel = 1;
    mathConnectScore = 0;
    mathConnectRenderShell();
    mathConnectStartRound();

    if (typeof playAudio === 'function' && typeof welcomeAudioPath === 'function') {
        playAudio(welcomeAudioPath(), { stopOld: true });
    }
}

function mathConnectRenderShell() {
    const menu = document.getElementById('menu-screen');
    const game = document.getElementById('game-screen');

    if (menu) menu.style.display = 'none';

    if (game) {
        game.style.display = 'flex';
        game.className = 'game-view game-math-connect';
    }

    if (typeof renderGameShell === 'function') {
        renderGameShell('Nối Phép Tính');
    }

    if (typeof resetTopTimerBar === 'function') {
        resetTopTimerBar();
    }

    const replayBtn = document.querySelector('#game-screen .replay-btn');
    if (replayBtn) replayBtn.style.display = 'none';

    mathConnectUpdateScore();

    window.removeEventListener('resize', mathConnectRedrawLines);
    window.addEventListener('resize', mathConnectRedrawLines);
}

function mathConnectUpdateScore() {
    const score = document.getElementById('score');
    if (score) score.textContent = `Lv.${mathConnectLevel}  ⭐ ${mathConnectScore}`;
}

function mathConnectGetLevelConfig() {
    return MATH_CONNECT_LEVELS[Math.min(mathConnectLevel - 1, MATH_CONNECT_LEVELS.length - 1)];
}

function mathConnectCreatePair(id, usedResults, maxResult) {
    let a;
    let b;
    let result;
    let operator;

    let guard = 0;

    do {
        const usePlus = Math.random() < 0.65;

        if (usePlus) {
            a = mathConnectRand(0, maxResult);
            b = mathConnectRand(0, maxResult - a);
            result = a + b;
            operator = '+';
        } else {
            a = mathConnectRand(1, maxResult);
            b = mathConnectRand(0, a);
            result = a - b;
            operator = '-';
        }

        guard += 1;
    } while (usedResults.has(result) && guard < 80);

    usedResults.add(result);

    return {
        id: 'pair-' + id,
        expression: `${a} ${operator} ${b}`,
        result
    };
}

function mathConnectStartRound() {
    const questionContent = document.getElementById('question-content');
    const optionsGrid = document.getElementById('options-grid');

    if (!questionContent || !optionsGrid) return;

    const config = mathConnectGetLevelConfig();
    const usedResults = new Set();

    mathConnectPairs = [];
    mathConnectSelectedEquation = null;
    mathConnectMatchedCount = 0;
    mathConnectLines = [];

    for (let i = 0; i < config.pairCount; i++) {
        mathConnectPairs.push(mathConnectCreatePair(i + 1, usedResults, config.maxResult));
    }

    const equations = mathConnectShuffle(mathConnectPairs);
    const answers = mathConnectShuffle(mathConnectPairs);

    questionContent.innerHTML = `
        <div class="math-connect-title">
            Chọn phép tính rồi nối với kết quả đúng
        </div>
    `;

    optionsGrid.className = 'options-grid math-connect-board-wrap';
    optionsGrid.innerHTML = `
        <div class="math-connect-board" id="math-connect-board">
            <svg class="math-connect-lines" id="math-connect-lines"></svg>

            <div class="math-connect-column math-connect-equations">
                ${equations.map(pair => `
                    <button
                        class="math-connect-card math-connect-equation"
                        id="eq-${pair.id}"
                        type="button"
                        data-pair-id="${pair.id}"
                        onclick="mathConnectChooseEquation('${pair.id}')">
                        ${pair.expression}
                    </button>
                `).join('')}
            </div>

            <div class="math-connect-column math-connect-results">
                ${answers.map(pair => `
                    <button
                        class="math-connect-card math-connect-result"
                        id="ans-${pair.id}"
                        type="button"
                        data-pair-id="${pair.id}"
                        onclick="mathConnectChooseAnswer('${pair.id}')">
                        ${pair.result}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    mathConnectUpdateScore();
}

function mathConnectChooseEquation(pairId) {
    const btn = document.getElementById('eq-' + pairId);
    if (!btn || btn.classList.contains('matched')) return;

    document.querySelectorAll('#game-screen .math-connect-equation').forEach(item => {
        item.classList.remove('selected');
    });

    mathConnectSelectedEquation = pairId;
    btn.classList.add('selected');
}

function mathConnectChooseAnswer(pairId) {
    const ans = document.getElementById('ans-' + pairId);
    if (!ans || ans.classList.contains('matched')) return;

    if (!mathConnectSelectedEquation) {
        mathConnectShake(ans);
        return;
    }

    const eq = document.getElementById('eq-' + mathConnectSelectedEquation);

    if (mathConnectSelectedEquation === pairId) {
        mathConnectHandleCorrect(eq, ans, pairId);
        return;
    }

    mathConnectHandleWrong(eq, ans);
}

function mathConnectHandleCorrect(eq, ans, pairId) {
    if (!eq || !ans) return;

    eq.classList.remove('selected');
    eq.classList.add('matched');
    ans.classList.add('matched');

    eq.disabled = true;
    ans.disabled = true;

    mathConnectLines.push(pairId);
    mathConnectDrawLine(eq, ans, pairId);

    mathConnectSelectedEquation = null;
    mathConnectMatchedCount += 1;
    mathConnectScore += 10;
    mathConnectUpdateScore();

    if (mathConnectMatchedCount >= mathConnectPairs.length) {
        setTimeout(mathConnectFinishRound, 700);
    }
}

function mathConnectHandleWrong(eq, ans) {
    if (eq) {
        eq.classList.remove('selected');
        mathConnectShake(eq);
    }

    if (ans) mathConnectShake(ans);

    mathConnectSelectedEquation = null;
}

function mathConnectShake(el) {
    if (!el || !el.animate) return;

    el.classList.add('wrong');

    el.animate(
        [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-7px)' },
            { transform: 'translateX(7px)' },
            { transform: 'translateX(0)' }
        ],
        { duration: 260 }
    );

    setTimeout(() => el.classList.remove('wrong'), 450);
}

function mathConnectFinishRound() {
    if (typeof fireGameConfetti === 'function') {
        fireGameConfetti();
    }

    const optionsGrid = document.getElementById('options-grid');
    if (!optionsGrid) return;

    optionsGrid.innerHTML += `
        <div class="math-connect-next-layer">
            <div class="math-connect-finish-card">
                <div class="math-connect-finish-title">Hoàn thành!</div>
                <div class="math-connect-finish-score">⭐ ${mathConnectScore}</div>
                <button class="math-connect-next-btn" type="button" onclick="mathConnectNextLevel()">
                    Màn tiếp theo
                </button>
            </div>
        </div>
    `;
}

function mathConnectNextLevel() {
    mathConnectLevel += 1;
    mathConnectStartRound();
}

function mathConnectDrawLine(eqBtn, ansBtn, pairId) {
    const board = document.getElementById('math-connect-board');
    const svg = document.getElementById('math-connect-lines');

    if (!board || !svg || !eqBtn || !ansBtn) return;

    const boardRect = board.getBoundingClientRect();
    const eqRect = eqBtn.getBoundingClientRect();
    const ansRect = ansBtn.getBoundingClientRect();

    const x1 = eqRect.right - boardRect.left;
    const y1 = eqRect.top + eqRect.height / 2 - boardRect.top;
    const x2 = ansRect.left - boardRect.left;
    const y2 = ansRect.top + ansRect.height / 2 - boardRect.top;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'math-connect-line');
    line.setAttribute('data-pair-id', pairId);

    svg.appendChild(line);
}

function mathConnectRedrawLines() {
    const svg = document.getElementById('math-connect-lines');
    if (!svg) return;

    svg.innerHTML = '';

    mathConnectLines.forEach(pairId => {
        const eq = document.getElementById('eq-' + pairId);
        const ans = document.getElementById('ans-' + pairId);
        mathConnectDrawLine(eq, ans, pairId);
    });
}

window.startMathConnectGame = startMathConnectGame;
window.mathConnectChooseEquation = mathConnectChooseEquation;
window.mathConnectChooseAnswer = mathConnectChooseAnswer;
window.mathConnectNextLevel = mathConnectNextLevel;
