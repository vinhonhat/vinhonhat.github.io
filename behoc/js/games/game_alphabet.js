// CẤU TRÚC DỮ LIỆU: Chữ cái -> Từ vựng, Hình ảnh, Âm thanh đánh vần (anh tự thu)
const ALPHABET_DICT = {
    'a': { word: 'cái ca', img: 'ca.png', spellAudio: 'spell_a.mp3' },
    'ă': { word: 'con trăn', img: 'tran.png', spellAudio: 'spell_aw.mp3' },
    'â': { word: 'cái ấm', img: 'am.png', spellAudio: 'spell_aa.mp3' },
    'b': { word: 'con bò', img: 'bo.png', spellAudio: 'spell_b.mp3' },
    'c': { word: 'con cá', img: 'ca_fish.png', spellAudio: 'spell_c.mp3' },
    'd': { word: 'con dê', img: 'de.png', spellAudio: 'spell_d.mp3' },
    'đ': { word: 'đu đủ', img: 'dudu.png', spellAudio: 'spell_dd.mp3' },
    'e': { word: 'em bé', img: 'embe.png', spellAudio: 'spell_e.mp3' },
    'ê': { word: 'con ếch', img: 'ech.png', spellAudio: 'spell_ee.mp3' },
    'g': { word: 'con gà', img: 'ga.png', spellAudio: 'spell_g.mp3' },
    'h': { word: 'bông hoa', img: 'hoa.png', spellAudio: 'spell_h.mp3' },
    'i': { word: 'viên bi', img: 'bi.png', spellAudio: 'spell_i.mp3' },
    'k': { word: 'cái kéo', img: 'keo.png', spellAudio: 'spell_k.mp3' },
    'l': { word: 'con lợn', img: 'heo.png', spellAudio: 'spell_l.mp3' },
    'm': { word: 'con mèo', img: 'meo.png', spellAudio: 'spell_m.mp3' },
    'n': { word: 'cái nơ', img: 'no.png', spellAudio: 'spell_n.mp3' },
    'o': { word: 'con ong', img: 'ong.png', spellAudio: 'spell_o.mp3' },
    'ô': { word: 'cái ô', img: 'o_umbrella.png', spellAudio: 'spell_oo.mp3' },
    'ơ': { word: 'quả mơ', img: 'mo.png', spellAudio: 'spell_ow.mp3' },
    'p': { word: 'Viên pin', img: 'pin.png', spellAudio: 'spell_p.mp3' },
    'q': { word: 'món quà', img: 'qua.png', spellAudio: 'spell_q.mp3' },
    'r': { word: 'con rùa', img: 'rua.png', spellAudio: 'spell_r.mp3' },
    's': { word: 'ngôi sao', img: 'sao.png', spellAudio: 'spell_s.mp3' },
    't': { word: 'con tôm', img: 'tom.png', spellAudio: 'spell_t.mp3' },
    'u': { word: 'cái mũ', img: 'mu.png', spellAudio: 'spell_u.mp3' },
    'ư': { word: 'sư tử', img: 'sutu.png', spellAudio: 'spell_uw.mp3' },
    'v': { word: 'quyển vở', img: 'vo.png', spellAudio: 'spell_v.mp3' },
    'x': { word: 'xe đạp', img: 'xedap.png', spellAudio: 'spell_x.mp3' },
    'y': { word: 'y tá', img: 'yta.png', spellAudio: 'spell_y.mp3' }
};

const ALPHABET = Object.keys(ALPHABET_DICT);
let currentAlphabetMode = 'learn'; 
let currentSpellAudio = null;



// --- GHI ĐÈ XỬ LÝ LÚC THOÁT GAME ĐỂ ẨN NÚT TOGGLE ---
const originalBackToMenuAlphabet = window.backToMenu;
window.backToMenu = function() {
    let toggleObj = document.getElementById('alphabet-toggle');
    if(toggleObj) toggleObj.style.display = 'none';
    if(currentSpellAudio) { currentSpellAudio.pause(); currentSpellAudio = null; }
    if(originalBackToMenuAlphabet) originalBackToMenuAlphabet();
}

// --- HÀM CHUYỂN ĐỔI CHẾ ĐỘ ---
window.switchAlphabetMode = function(mode) {
    currentAlphabetMode = mode;
    
    const displayArea = document.getElementById('display-area');
    const optionsGrid = document.getElementById('options-grid');
    const scoreContainer = document.getElementById('score-container');
    const learnArea = document.getElementById('learn-area');

    if (mode === 'learn') {
        document.getElementById('btn-learn').classList.add('active');
        document.getElementById('btn-practice').classList.remove('active');
        
        displayArea.style.display = 'none';
        optionsGrid.style.display = 'none';
        scoreContainer.style.display = 'none';
        
        if (!learnArea) buildLearnArea();
        document.getElementById('learn-area').style.display = 'flex';
        
        // Mở sẵn chữ cái ngẫu nhiên
        selectLearnChar(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
    } else {
        document.getElementById('btn-practice').classList.add('active');
        document.getElementById('btn-learn').classList.remove('active');
        
        displayArea.style.display = 'flex';
        optionsGrid.style.display = 'grid'; // CSS trong core.js
        scoreContainer.style.display = 'block';
        if (learnArea) learnArea.style.display = 'none';
        
        if(currentSpellAudio) currentSpellAudio.pause();
        // THÊM DÒNG NÀY: Để khi bấm qua tab Luyện tập thì game mới bắt đầu đọc câu hỏi mới
        if(typeof nextQuestion === 'function') {
            nextQuestion();
        }
    }
};

// --- XÂY DỰNG GIAO DIỆN HỌC ---
function buildLearnArea() {
    const gameScreen = document.getElementById('game-screen');
    const learnArea = document.createElement('div');
    learnArea.id = 'learn-area';
    
    // Khung Flashcard trên cùng
    const cardHtml = `
        <div class="learn-card" onclick="replaySpellAudio()">
            <div class="card-hint">🔊</div>
            <div id="learn-card-char" class="card-letter">A</div>
            <img id="learn-card-img" class="card-img" src="" alt="img">
            <div id="learn-card-word" class="card-word">cái ca</div>
        </div>
    `;
    
    // Bàn phím 29 chữ cái bên dưới
    let keyboardHtml = '<div class="learn-keyboard">';
    ALPHABET.forEach(char => {
        keyboardHtml += `<button id="key-${char}" class="key-btn" onclick="selectLearnChar('${char}')">${char}</button>`;
    });
    keyboardHtml += '</div>';
    
    learnArea.innerHTML = cardHtml + keyboardHtml;
    gameScreen.appendChild(learnArea);
}

// --- XỬ LÝ SỰ KIỆN KHI CHỌN CHỮ ---
window.selectLearnChar = function(char) {
    const data = ALPHABET_DICT[char];
    
    // Cập nhật Flashcard
    document.getElementById('learn-card-char').textContent = char.toUpperCase();
    document.getElementById('learn-card-word').textContent = data.word;
    document.getElementById('learn-card-img').src = '/img/game/' + data.img; // Đảm bảo đúng đường dẫn thư mục ảnh
    
    // Đổi màu phím đang bấm
    document.querySelectorAll('.key-btn').forEach(btn => btn.classList.remove('active-key'));
    document.getElementById('key-' + char).classList.add('active-key');
    
    playSpellAudio(data.spellAudio);
}

window.replaySpellAudio = function() {
    const char = document.getElementById('learn-card-char').textContent.toLowerCase();
    playSpellAudio(ALPHABET_DICT[char].spellAudio);
}

function playSpellAudio(audioFile) {
    if(currentSpellAudio) {
        currentSpellAudio.pause();
        currentSpellAudio.currentTime = 0;
    }
    // Đường dẫn tới thư mục chứa file ghi âm của anh
    currentSpellAudio = new Audio('/audio/' + audioFile); 
    currentSpellAudio.play().catch(e => console.log("Chưa có file âm thanh:", e));
}

// --- LOGIC GAME CŨ (CHẾ ĐỘ LUYỆN) ---
registerGame('alphabet', {
    gridClass: 'cols-3',

    generateData: function() {
        // Hiện nút toggle khi vào game này
        document.getElementById('alphabet-toggle').style.display = 'flex';
        
        // Mặc định luôn bật chế độ học trước khi vào
        if(!document.getElementById('learn-area')) {
            switchAlphabetMode('learn');
        }
        
        return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    },

    renderDisplay: function(char) {
        return `
            <div class="big-icon-question">🔊</div>
            <div class="hint-text">Tìm chữ ${char.toUpperCase()}</div>
        `;
    },

    getOptions: function(correctChar) {
        let set = new Set([correctChar]);
        while(set.size < 4) set.add(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
        return Array.from(set);
    },

    styleOptionBtn: function(btn, char) {
        btn.textContent = char.toUpperCase();
    },

    // SỬA TẠI ĐÂY: Nếu đang ở chế độ học ('learn') thì KHÔNG phát âm thanh câu hỏi của chế độ chơi
    getAudio: function(char) {
        if (currentAlphabetMode === 'learn') {
            return []; // Trả về mảng rỗng để core.js không phát âm thanh câu hỏi ngầm
        }
        return [char + ".mp3"]; 
    },

    checkResult: function(selected, correct) {
        return selected === correct;
    }
});