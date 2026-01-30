// js/core.js

const PATH_MP3 = "/file/mp3/";
const PATH_IMG = "/img/game/";

// Biến quản lý chung
let currentScore = 0;
let activeGame = null;
let gameModules = {};
let replayTimer = null; // Biến giữ đồng hồ đếm 5s

function registerGame(gameId, gameLogic) {
    gameModules[gameId] = gameLogic;
}

// --- ĐIỀU HƯỚNG ---
function unlockAudio() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
}

function backToMenu() {
    stopAutoReplay(); // Tắt tự động đọc
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
    activeGame = null;
}

function startGame(gameId) {
    if (!gameModules[gameId]) {
        alert("Game này đang bảo trì hoặc chưa tải xong!");
        return;
    }
    
    activeGame = gameModules[gameId];
    currentScore = 0;
    document.getElementById('score').textContent = currentScore;
    
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    
    nextQuestion();
}

// --- QUẢN LÝ TỰ ĐỘNG PHÁT LẠI ---
function startAutoReplay() {
    stopAutoReplay(); // Xóa timer cũ nếu có
    // Cứ 5 giây (5000ms) thì phát lại âm thanh
    replayTimer = setInterval(() => {
        playQuestionAudio();
    }, 5000);
}

function stopAutoReplay() {
    if (replayTimer) {
        clearInterval(replayTimer);
        replayTimer = null;
    }
}

// --- XỬ LÝ CÂU HỎI ---
function nextQuestion() {
    if (!activeGame) return;
    stopAutoReplay(); // Tạm dừng đọc khi đang sinh câu hỏi mới

    const questionData = activeGame.generateData();
    activeGame.currentData = questionData;

    // Render giao diện (Giờ sẽ là dấu ? to)
    const contentDiv = document.getElementById('question-content');
    contentDiv.innerHTML = activeGame.renderDisplay(questionData);

    // Render đáp án
    const gridDiv = document.getElementById('options-grid');
    gridDiv.innerHTML = '';
    gridDiv.className = 'options-grid'; 
    if (activeGame.gridClass) gridDiv.classList.add(activeGame.gridClass);

    const options = activeGame.getOptions(questionData);
    
    options.sort(() => Math.random() - 0.5).forEach(opt => {
        let btn = document.createElement('button');
        btn.className = 'option-btn';
        activeGame.styleOptionBtn(btn, opt);
        btn.onclick = () => handleCheckAnswer(opt, btn);
        gridDiv.appendChild(btn);
    });

    // Phát âm thanh lần đầu sau 0.5s và bắt đầu đếm ngược 5s
    setTimeout(() => {
        playQuestionAudio();
        startAutoReplay(); // Bắt đầu tính giờ 5s
    }, 500);
}

function playQuestionAudio() {
    if (activeGame && activeGame.currentData) {
        // Nếu game có hỗ trợ lấy file âm thanh thì mới phát
        const files = activeGame.getAudio(activeGame.currentData);
        if (files && files.length > 0) {
            playSequence(files);
        }
    }
}

function handleCheckAnswer(selected, btn) {
    const isCorrect = activeGame.checkResult(selected, activeGame.currentData);

    if (isCorrect) {
        stopAutoReplay(); // Bé trả lời đúng thì dừng đọc ngay
        btn.classList.add('correct');
        currentScore++;
        document.getElementById('score').textContent = currentScore;
        playFeedback(true);
        fireConfetti();
        setTimeout(nextQuestion, 1500);
    } else {
        btn.classList.add('wrong');
        playFeedback(false);
        setTimeout(() => btn.classList.remove('wrong'), 500);
    }
}

// --- UTILS ---
function playSequence(files, index = 0) {
    if (index >= files.length) return;
    let audio = new Audio(PATH_MP3 + files[index]);
    audio.onended = () => playSequence(files, index + 1);
    audio.onerror = () => {
        console.log("File missing: " + files[index]);
        playSequence(files, index + 1);
    };
    audio.play().catch(e => {});
}

function playFeedback(isCorrect) {
    let file = isCorrect ? (Math.random() < 0.5 ? "gioi qua.mp3" : "chinh xac.mp3") : "sai roi.mp3";
    let audio = new Audio(PATH_MP3 + file);
    audio.play().catch(e => {});
}

function fireConfetti() {
    const colors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50'];
    for(let i=0; i<30; i++) {
        let c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random()*100+'%';
        c.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
        c.style.animationDuration = (Math.random()+1)+'s';
        document.body.appendChild(c);
        setTimeout(()=>c.remove(), 2000);
    }
}