// js/core.js

const PATH_MP3 = "/file/mp3/";
const PATH_IMG = "/img/game/";

// Biến quản lý chung
let currentScore = 0;
let activeGame = null; // Game đang chơi hiện tại
let gameModules = {};  // Nơi chứa danh sách các game đã đăng ký

// --- HÀM ĐĂNG KÝ GAME (QUAN TRỌNG) ---
// Các file con sẽ gọi hàm này để báo danh
function registerGame(gameId, gameLogic) {
    gameModules[gameId] = gameLogic;
}

// --- ĐIỀU HƯỚNG ---
function unlockAudio() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
}

function backToMenu() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
    activeGame = null;
}

function startGame(gameId) {
    if (!gameModules[gameId]) {
        alert("Game này đang bảo trì hoặc chưa tải xong!");
        return;
    }
    
    activeGame = gameModules[gameId]; // Gán game hiện tại
    currentScore = 0;
    document.getElementById('score').textContent = currentScore;
    
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    
    nextQuestion();
}

// --- XỬ LÝ CÂU HỎI ---
function nextQuestion() {
    if (!activeGame) return;

    // 1. Nhờ game con sinh dữ liệu câu hỏi
    const questionData = activeGame.generateData();
    activeGame.currentData = questionData; // Lưu lại để check đáp án

    // 2. Render khu vực hiển thị (Display Area)
    const contentDiv = document.getElementById('question-content');
    contentDiv.innerHTML = activeGame.renderDisplay(questionData);

    // 3. Render các nút chọn (Options)
    const gridDiv = document.getElementById('options-grid');
    gridDiv.innerHTML = '';
    gridDiv.className = 'options-grid'; 
    if (activeGame.gridClass) gridDiv.classList.add(activeGame.gridClass); // Thêm class nếu game cần (vd: 3 cột)

    const options = activeGame.getOptions(questionData);
    
    // Xáo trộn đáp án
    options.sort(() => Math.random() - 0.5).forEach(opt => {
        let btn = document.createElement('button');
        btn.className = 'option-btn';
        
        // Nhờ game con quyết định nút trông thế nào
        activeGame.styleOptionBtn(btn, opt);

        btn.onclick = () => handleCheckAnswer(opt, btn);
        gridDiv.appendChild(btn);
    });

    // 4. Phát âm thanh đề bài
    setTimeout(() => {
        playSequence(activeGame.getAudio(questionData));
    }, 500);
}

function playQuestionAudio() {
    if (activeGame && activeGame.currentData) {
        playSequence(activeGame.getAudio(activeGame.currentData));
    }
}

// --- KIỂM TRA ĐÁP ÁN ---
function handleCheckAnswer(selected, btn) {
    // Nhờ game con kiểm tra đúng sai
    const isCorrect = activeGame.checkResult(selected, activeGame.currentData);

    if (isCorrect) {
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

// --- CÁC HÀM TIỆN ÍCH (Âm thanh, Pháo hoa...) ---
// (Giữ nguyên code playSequence, playFeedback, fireConfetti cũ của anh copy vào đây)
function playSequence(files, index = 0) { /* ... code cũ ... */ }
function playFeedback(isCorrect) { /* ... code cũ ... */ }
function fireConfetti() { /* ... code cũ ... */ }