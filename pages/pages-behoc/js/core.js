// js/core.js

const PATH_MP3 = "/file/mp3/";
const PATH_IMG = "/img/game/";

// Biến quản lý chung
let currentScore = 0;
let activeGame = null;
let gameModules = {};
let replayTimer = null; 

function registerGame(gameId, gameLogic) {
    gameModules[gameId] = gameLogic;
}

// --- ĐIỀU HƯỚNG ---
function unlockAudio() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
}

function backToMenu() {
    stopAutoReplay();
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

function startAutoReplay() {
    stopAutoReplay();
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
    stopAutoReplay(); 

    const questionData = activeGame.generateData();
    activeGame.currentData = questionData;

    const contentDiv = document.getElementById('question-content');
    contentDiv.innerHTML = activeGame.renderDisplay(questionData);

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

    setTimeout(() => {
        playQuestionAudio();
        startAutoReplay(); 
    }, 500);
}

function playQuestionAudio() {
    if (activeGame && activeGame.currentData) {
        const files = activeGame.getAudio(activeGame.currentData);
        if (files && files.length > 0) {
            playSequence(files);
        }
    }
}

// --- KIỂM TRA ĐÁP ÁN (Đã nâng cấp) ---
function handleCheckAnswer(selected, btn) {
    const isCorrect = activeGame.checkResult(selected, activeGame.currentData);

    if (isCorrect) {
        stopAutoReplay();
        btn.classList.add('correct');
        currentScore++;
        document.getElementById('score').textContent = currentScore;
        
        // Đọc tên đáp án đúng (nếu game hỗ trợ) -> Khen giỏi
        let soundQueue = [];
        if (activeGame.getAnswerAudio) {
            soundQueue = activeGame.getAnswerAudio(selected);
        }
        soundQueue.push(Math.random() < 0.5 ? "gioi qua.mp3" : "chinh xac.mp3");
        playSequence(soundQueue);

        fireConfetti();
        setTimeout(nextQuestion, 2000); // Chờ lâu hơn chút để nghe hết tiếng
    } else {
        btn.classList.add('wrong');
        
        // LOGIC MỚI: Đọc tên đáp án sai -> Rồi mới báo sai
        let soundQueue = [];
        if (activeGame.getAnswerAudio) {
            // Lấy âm thanh của cái nút vừa bấm nhầm
            soundQueue = activeGame.getAnswerAudio(selected);
        }
        soundQueue.push("sai roi.mp3");
        
        playSequence(soundQueue);
        
        setTimeout(() => btn.classList.remove('wrong'), 1000);
    }
}

// --- UTILS ---
function playSequence(files, index = 0) {
    if (!files || index >= files.length) return;
    
    let audio = new Audio(PATH_MP3 + files[index]);
    audio.onended = () => playSequence(files, index + 1);
    audio.onerror = () => {
        console.log("File missing: " + files[index]);
        playSequence(files, index + 1); // Bỏ qua file lỗi, chạy tiếp
    };
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