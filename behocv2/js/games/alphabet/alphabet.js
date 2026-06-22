// =====================================================
// LOGIC RIÊNG GAME ALPHABET (alphabet.js)
// =====================================================
let currentAudios = [];

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
    'y': { word: 'y tá', img: 'yta.png', audio: 'spell_y.mp3' },
    'ch': { word: 'con chó', img: 'cho.png', audio: 'spell_ch.mp3' },
    'gh': { word: 'cái ghế', img: 'ghe.png', audio: 'spell_gh.mp3' },
    'gi': { word: 'con giun', img: 'giun.png', audio: 'spell_gi.mp3' },
    'kh': { word: 'quả khế', img: 'khe.png', audio: 'spell_kh.mp3' },
    'ng': { word: 'con ngựa', img: 'ngua.png', audio: 'spell_ng.mp3' },
    'ngh': { word: 'củ nghệ', img: 'nghe.png', audio: 'spell_ngh.mp3' },
    'nh': { word: 'con nhện', img: 'nhen.png', audio: 'spell_nh.mp3' },
    'ph': { word: 'Phở bò', img: 'pho.png', audio: 'spell_ph.mp3' },
    'th': { word: 'Thỏ', img: 'tho.png', audio: 'spell_th.mp3' },
    'tr': { word: 'Trăng', img: 'trang.png', audio: 'spell_tr.mp3' },
    'qu': { word: 'Quạt', img: 'quat.png', audio: 'spell_qu.mp3' }
};

const ALPHABET_KEYS = Object.keys(ALPHABET_DATA);

let alphabetMode = 'learn'; 
let alphabetScore = 0;

let currentQuestionKey = '';

document.addEventListener("DOMContentLoaded", () => {
    buildKeyboard();
    const first = ALPHABET_KEYS[0];
    const data = ALPHABET_DATA[first];

    document.getElementById('char-upper').textContent = first.toUpperCase();
    document.getElementById('char-lower').textContent = first;
    document.getElementById('item-word').textContent = data.word;
    document.getElementById('item-image').src = '/behocv2/img/' + data.img;

    initGame();
});

function stopAllAudio() {

    currentAudios.forEach(audio => {
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch(e){}
    });

    currentAudios = [];
}

function initGame() {
    // 1. Sửa đường dẫn thành ../../audio/dingdong.mp3 để lùi ra ngoài thư mục gốc dự án
    let welcomeAudio =
        new Audio('/behocv2/audio/dingdong.mp3');

    currentAudios.push(welcomeAudio);
    
    // 2. Lắng nghe sự kiện khi âm thanh chào mừng CHẠY XONG hoàn toàn
    welcomeAudio.onended = function() {
        console.log("Âm thanh chào mừng đã phát xong! Bắt đầu vào game.");
        setMode('learn'); // Lúc này mới kích hoạt chế độ học và phát chữ cái đầu tiên
    };

    // 3. Tiến hành phát âm thanh chào mừng
    welcomeAudio.play().catch(err => {
        console.log('Lỗi phát Audio chào mừng (Có thể do trình duyệt chặn):', err);
        // Trường hợp trình duyệt chặn (do cơ chế bảo mật tự động phát của Chrome/Safari), vào thẳng game luôn
        setMode('learn'); 
    });
}

function switchAlphabetMode() {
    stopAllAudio();
    if (alphabetMode === 'learn') {
        setMode('practice');
    } else {
        setMode('learn');
    }
}

function setMode(mode) {
    alphabetMode = mode;

    const btnMode = document.getElementById('mode-btn');
    const learnPanel = document.getElementById('learn-panel');
    const practicePanel = document.getElementById('practice-panel');

    if (mode === 'learn') {

        btnMode.innerHTML = '🎯';

        learnPanel.style.display = 'flex';
        practicePanel.style.display = 'none';

        selectAlphabetChar(
            document.getElementById('char-lower').textContent || ALPHABET_KEYS[0]
        );

    } else {

        btnMode.innerHTML = '📖';

        learnPanel.style.display = 'none';
        practicePanel.style.display = 'flex';

        generatePracticeQuestion();
    }
}

function buildKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    ALPHABET_KEYS.forEach(char => {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.id = `key-${char}`;
        btn.textContent = char.toUpperCase();
        btn.onclick = () => selectAlphabetChar(char);
        keyboard.appendChild(btn);
    });
}

function selectAlphabetChar(char) {
    stopAllAudio();
    document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('active-key'));
    const activeBtn = document.getElementById(`key-${char}`);
    if (activeBtn) activeBtn.classList.add('active-key');

    const data = ALPHABET_DATA[char];
    document.getElementById('char-upper').textContent = char.toUpperCase();
    document.getElementById('char-lower').textContent = char;
    document.getElementById('item-word').textContent = data.word;
    
    // Đường dẫn hình ảnh đi ra ngoài thư mục gốc vào img/
    document.getElementById('item-image').src = '/behocv2/img/' + data.img;

    playAlphabetAudio(data.audio);
}

function replayAlphabetAudio() {
    const currentChar = document.getElementById('char-lower').textContent.toLowerCase();
    if (ALPHABET_DATA[currentChar]) {
        playAlphabetAudio(ALPHABET_DATA[currentChar].audio);
    }
}

function generatePracticeQuestion() {
    const wordDisplay = document.getElementById('practice-answer-word');
    wordDisplay.style.opacity = '0';
    wordDisplay.style.transform = 'scale(0.8)';

    currentQuestionKey = ALPHABET_KEYS[Math.floor(Math.random() * ALPHABET_KEYS.length)];
    const data = ALPHABET_DATA[currentQuestionKey];

    let optionSet = new Set([currentQuestionKey]);
    while (optionSet.size < 4) {
        optionSet.add(ALPHABET_KEYS[Math.floor(Math.random() * ALPHABET_KEYS.length)]);
    }
    // Dùng hàm shuffleArray() dùng chung từ game.js
    let options = shuffleArray(Array.from(optionSet));

    document.getElementById('practice-img').src = '/behocv2/img/' + data.img;
    wordDisplay.textContent = data.word;

    const optionsGrid = document.getElementById('options-grid');
    optionsGrid.innerHTML = '';
    
    options.forEach(char => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = char.toUpperCase();
        btn.onclick = () => checkAlphabetAnswer(char, btn);
        optionsGrid.appendChild(btn);
    });

    playPracticeQuestion();
}

function playPracticeQuestion() {
    stopAllAudio();
    if (ALPHABET_DATA[currentQuestionKey]) {
        playAlphabetAudio(ALPHABET_DATA[currentQuestionKey].audio);
    }
}

function checkAlphabetAnswer(char, selectedBtn) {
    if (char === currentQuestionKey) {
        document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
        selectedBtn.classList.add('correct');

        setTimeout(() => {
            const wordDisplay = document.getElementById('practice-answer-word');
            wordDisplay.style.opacity = '1';
            wordDisplay.style.transform = 'scale(1)';
        }, 200);

        // Hiệu ứng phóng to hình ảnh khi đúng
        document.getElementById('practice-img').animate([
            { transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }
        ], { duration: 500 });

        alphabetScore++;
        document.getElementById('alphabet-score').textContent = '⭐ ' + alphabetScore;

        // Gọi các hàm dùng chung từ game.js
        const vinhDanhAudio = Math.random() < 0.5 ? 'gioi qua.mp3' : 'chinh xac.mp3';
        playCommonAudio(vinhDanhAudio);
        fireGameConfetti(); 

        setTimeout(() => {
            generatePracticeQuestion();
        }, 2500);

    } else {
        selectedBtn.classList.add('wrong');
        playCommonAudio('sai roi.mp3'); // Hàm chung từ game.js

        selectedBtn.animate([
            { transform: 'translateX(0px)' }, { transform: 'translateX(-6px)' },
            { transform: 'translateX(6px)' }, { transform: 'translateX(0px)' }
        ], { duration: 250 });

        setTimeout(() => {
            selectedBtn.classList.remove('wrong');
        }, 800);
    }
}

// Hàm độc lập phát âm thanh đánh vần của game alphabet
function playAlphabetAudio(file) {

    stopAllAudio();

    const audio =
        new Audio('/behocv2/audio/alphabet/' + file);

    currentAudios.push(audio);

    audio.play().catch(console.error);
}

