// js/core.js

const PATH_MP3 = "/file/mp3/";
const PATH_IMG = "/img/game/";

// --- 1. BIẾN QUẢN LÝ GAME ---
let currentScore = 0;
let activeGame = null;
let gameModules = {};
let replayTimer = null; 

function registerGame(gameId, gameLogic) {
    gameModules[gameId] = gameLogic;
}

// --- 2. ĐIỀU HƯỚNG MÀN HÌNH ---
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

// --- 3. QUẢN LÝ TỰ ĐỘNG ĐỌC LẠI (5 giây) ---
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

// --- 4. XỬ LÝ CÂU HỎI ---
function nextQuestion() {
    if (!activeGame) return;
    stopAutoReplay(); 

    const questionData = activeGame.generateData();
    activeGame.currentData = questionData;

    // Render nội dung
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

    // Phát âm thanh sau 0.5s và bắt đầu đếm ngược
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

// --- 5. KIỂM TRA ĐÁP ÁN ---
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
        setTimeout(nextQuestion, 2000); 
    } else {
        btn.classList.add('wrong');
        
        // Đọc tên đáp án sai -> Báo sai
        let soundQueue = [];
        if (activeGame.getAnswerAudio) {
            soundQueue = activeGame.getAnswerAudio(selected);
        }
        soundQueue.push("sai roi.mp3");
        
        playSequence(soundQueue);
        
        setTimeout(() => btn.classList.remove('wrong'), 1000);
    }
}

// --- 6. CÁC HÀM TIỆN ÍCH ---
function playSequence(files, index = 0) {
    if (!files || index >= files.length) return;
    
    let audio = new Audio(PATH_MP3 + files[index]);
    audio.onended = () => playSequence(files, index + 1);
    audio.onerror = () => {
        console.log("File missing: " + files[index]);
        playSequence(files, index + 1); 
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

// ============================================================
// --- 7. CẤU HÌNH PWA & CÀI ĐẶT APP (ĐOẠN CODE ANH CẦN ĐÂY) ---
// ============================================================

// Đăng ký Service Worker (Bắt buộc để cài App)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { 
        // Anh nhớ đảm bảo file sw.js nằm ở thư mục gốc nhé
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('SW Registered!', reg);
        }).catch(err => {
            console.log('SW Failed', err);
        });
    });
}

// Xử lý nút Cài đặt
let deferredPrompt;
const installBtn = document.getElementById('pwa-install-btn');
const iosGuide = document.getElementById('ios-guide');

// Kiểm tra xem có đang chạy trong App không (để ẩn nút đi)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

if (isStandalone) {
    // Nếu đang là App rồi -> Ẩn hết
    if(installBtn) installBtn.style.display = 'none';
    if(iosGuide) iosGuide.style.display = 'none';
} else {
    // Nếu chưa là App -> Xử lý hiển thị
    
    // A. Với Android / Chrome PC
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.style.display = 'block'; // Hiện nút
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                installBtn.style.display = 'none'; // Bấm xong ẩn luôn
            }
        });
    }

    // B. Với iPhone (iOS)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && iosGuide) {
        iosGuide.style.display = 'block';
    }
}