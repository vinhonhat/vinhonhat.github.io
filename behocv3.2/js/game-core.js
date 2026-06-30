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

function renderGameShell(title = 'Bé Vui Học') {
    const gameScreen = document.getElementById('game-screen');

    gameScreen.innerHTML = `
        <div class="top-bar">
            <button class="back-btn" type="button" onclick="backToMenu()">🏠</button>
            <div id="game-title" style="font-size:1.2rem;font-weight:bold;color:#ff6f00;text-align:center;">${title}</div>
            <div id="score-container">⭐ <span id="score">0</span></div>
        </div>

        <div class="display-area" id="question-content"></div>

        <button class="replay-btn" type="button" onclick="playQuestionAudio()" aria-label="Nghe lại">🔊</button>

        <div class="options-grid" id="options-grid"></div>
    `;
}

function clearGameScreen() {
    stopAllAudio();
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.innerHTML = '';
}

function fireGameConfetti() {
    const colors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#ff9800'];

    for (let i = 0; i < 30; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (Math.random() + 1.2) + 's';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 2300);
    }
}

// Giữ tên cũ để các game cũ không bị lỗi.
function fireConfetti() {
    fireGameConfetti();
}
