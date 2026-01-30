// --- 1. CẤU HÌNH DỮ LIỆU ---
const PATH_MP3 = "/file/mp3/";
const PATH_IMG = "/img/game/";

const ALPHABET = ['a','ă','â','b','c','d','đ','e','ê','g','h','i','k','l','m','n','o','ô','ơ','p','q','r','s','t','u','ư','v','x','y'];

const COLORS = [
    {id: 'do', name: 'Màu Đỏ', hex: '#FF5252'},
    {id: 'xanhduong', name: 'Xanh Dương', hex: '#448AFF'},
    {id: 'xanhla', name: 'Xanh Lá', hex: '#69F0AE'},
    {id: 'vang', name: 'Màu Vàng', hex: '#FFD740'},
    {id: 'tim', name: 'Màu Tím', hex: '#E040FB'},
    {id: 'den', name: 'Màu Đen', hex: '#333333'}
];

const ITEMS = [
    {id: 'tao', name: 'Quả Táo', img: 'tao.png'},
    {id: 'oto', name: 'Ô Tô', img: 'oto.png'},
    {id: 'cho', name: 'Con Chó', img: 'cho.png'},
    {id: 'meo', name: 'Con Mèo', img: 'meo.png'},
    {id: 'ga',  name: 'Con Gà', img: 'ga.png'},
    {id: 'vit', name: 'Con Vịt', img: 'vit.png'},
    {id: 'sao', name: 'Ngôi Sao', img: 'sao.png'}
];

let currentMode = '';
let currentQ = null;
let score = 0;

// --- 2. ĐIỀU HƯỚNG ---
function unlockAudio() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
}

function backToMenu() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'flex';
}

function startGame(mode) {
    currentMode = mode;
    score = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    nextQuestion();
}

// --- 3. SINH CÂU HỎI ---
function generateQuestion() {
    if (currentMode === 'listen_number') {
        const num = Math.floor(Math.random() * 30);
        return { type: 'number', val: num };
    }
    if (currentMode === 'count') {
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        const qty = Math.floor(Math.random() * 10) + 1; 
        return { type: 'count', val: qty, item: item };
    }
    if (currentMode === 'color') {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return { type: 'color', val: color };
    }
    if (currentMode === 'match_animal') {
        const target = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        return { type: 'match', val: target };
    }
    if (currentMode === 'alphabet') {
        const char = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        return { type: 'char', val: char };
    }
}

function nextQuestion() {
    currentQ = generateQuestion();
    renderUI();
    setTimeout(playQuestionAudio, 500);
}

// --- 4. RENDER GIAO DIỆN ---
function renderUI() {
    const content = document.getElementById('question-content');
    const grid = document.getElementById('options-grid');
    content.innerHTML = '';
    grid.innerHTML = '';
    grid.className = 'options-grid';

    // A. HIỂN THỊ PHẦN CÂU HỎI
    if (currentQ.type === 'number') {
        content.innerHTML = `
            <div class="big-icon-question">🔊</div>
            <div class="hint-text">Số mấy?</div>
        `;
    } 
    else if (currentQ.type === 'count') {
        let html = '<div class="count-container">';
        for(let i=0; i<currentQ.val; i++) {
            html += `<img src="${PATH_IMG + currentQ.item.img}" class="game-img" style="animation-delay:${i*0.1}s">`;
        }
        html += '</div>';
        content.innerHTML = html;
    }
    else if (currentQ.type === 'color') {
         content.innerHTML = `
            <div class="big-icon-question" style="color: ${currentQ.val.hex}">🔊</div>
            <div class="hint-text" style="color: ${currentQ.val.hex}">${currentQ.val.name}</div>
         `;
    }
    else if (currentQ.type === 'match') {
         content.innerHTML = `
            <div class="big-icon-question">🔊</div>
            <div class="hint-text">${currentQ.val.name}</div>
         `;
    }
    else if (currentQ.type === 'char') {
         content.innerHTML = `
            <div class="big-icon-question">🔊</div>
            <div class="hint-text">Chữ ${currentQ.val.toUpperCase()}</div>
         `;
    }

    // B. TẠO ĐÁP ÁN
    let options = [];
    if (currentQ.type === 'number' || currentQ.type === 'count') {
        let correct = currentQ.val;
        let set = new Set([correct]);
        while(set.size < 4) set.add(Math.floor(Math.random() * (currentMode==='number'?30:10)) + 1);
        options = Array.from(set);
    }
    else if (currentQ.type === 'color') {
        let set = new Set([currentQ.val]);
        while(set.size < 4) set.add(COLORS[Math.floor(Math.random() * COLORS.length)]);
        options = Array.from(set);
    }
    else if (currentQ.type === 'match') {
        let set = new Set([currentQ.val]);
        while(set.size < 4) set.add(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
        options = Array.from(set);
    }
    else if (currentQ.type === 'char') {
        let set = new Set([currentQ.val]);
        while(set.size < 4) set.add(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
        options = Array.from(set);
    }

    options.sort(() => Math.random() - 0.5).forEach(opt => {
        let btn = document.createElement('button');
        btn.className = 'option-btn';
        
        if (currentQ.type === 'color') {
            btn.style.backgroundColor = opt.hex;
            btn.style.border = '2px solid #ddd';
        } 
        else if (currentQ.type === 'match') {
            btn.innerHTML = `<img src="${PATH_IMG + opt.img}" style="height:60px; object-fit:contain;">`;
        }
        else if (currentQ.type === 'char') {
            btn.textContent = opt.toUpperCase();
            grid.classList.add('cols-3');
        }
        else {
            btn.textContent = opt;
        }

        btn.onclick = () => checkAnswer(opt, btn);
        grid.appendChild(btn);
    });
}

// --- 5. ÂM THANH ---
function playQuestionAudio() {
    let files = [];
    if (currentQ.type === 'number') files = buildNumberAudio(currentQ.val);
    else if (currentQ.type === 'count') return; 
    else if (currentQ.type === 'color') files.push(currentQ.val.id + ".mp3");
    else if (currentQ.type === 'match') files.push(currentQ.val.id + ".mp3");
    else if (currentQ.type === 'char') files.push(currentQ.val + ".mp3");

    if(files.length > 0) playSequence(files);
}

function buildNumberAudio(num) {
    let list = [];
    if (num < 10) list.push(num + ".mp3");
    else if (num === 10) list.push("10.mp3");
    else if (num > 10 && num < 20) {
        list.push("10.mp3");
        let unit = num % 10;
        if (unit === 5) list.push("lam.mp3"); else if (unit === 1) list.push("1.mp3"); else list.push(unit + ".mp3");
    } else {
        let ten = Math.floor(num / 10);
        let unit = num % 10;
        list.push(ten + ".mp3"); list.push("muoi.mp3");
        if (unit > 0) {
            if (unit === 1) list.push("mot.mp3"); else if (unit === 5) list.push("lam.mp3"); else if (unit === 4) list.push("tu.mp3"); else list.push(unit + ".mp3");
        }
    }
    return list;
}

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

// --- 6. CHECK KẾT QUẢ ---
function checkAnswer(selected, btn) {
    let isCorrect = false;
    if (currentQ.type === 'number' || currentQ.type === 'count') isCorrect = (selected === currentQ.val);
    else if (currentQ.type === 'color' || currentQ.type === 'match') isCorrect = (selected.id === currentQ.val.id);
    else if (currentQ.type === 'char') isCorrect = (selected === currentQ.val);

    if (isCorrect) {
        btn.classList.add('correct');
        score++;
        document.getElementById('score').textContent = score;
        playFeedback(true);
        fireConfetti();
        setTimeout(nextQuestion, 1500);
    } else {
        btn.classList.add('wrong');
        playFeedback(false);
        setTimeout(() => btn.classList.remove('wrong'), 500);
    }
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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js'); });
}

// --- 8. XỬ LÝ NÚT CÀI ĐẶT PWA ---
let deferredPrompt;
const installBtn = document.getElementById('pwa-install-btn');
const iosGuide = document.getElementById('ios-guide');

// Kiểm tra xem có đang chạy trong App không (để ẩn nút đi)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

if (isStandalone) {
    if(installBtn) installBtn.style.display = 'none';
    if(iosGuide) iosGuide.style.display = 'none';
} else {
    // A. Với Android / Chrome PC
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.style.display = 'flex'; // Dùng 'flex' để căn giữa đẹp
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                installBtn.style.display = 'none'; 
            }
        });
    }

    // B. Với iPhone (iOS)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && iosGuide) {
        iosGuide.style.display = 'block';
    }
}