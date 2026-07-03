// games/color/color.js
// =====================================================
// GAME: NHẬN BIẾT MÀU SẮC
// Chuẩn v3.2 - dùng registerGame() + game-core.js
// Âm thanh dùng colorAudioPath(fileName) từ js/asset.js.
// Ví dụ: colorAudioPath('do.mp3') -> audio/colors/do.mp3
// =====================================================

const GAME_COLORS = [
    { id: 'do',         name: 'Màu Đỏ',     hex: '#FF5252', audio: 'do.mp3' },
    { id: 'xanhduong',  name: 'Xanh Dương', hex: '#448AFF', audio: 'xanhduong.mp3' },
    { id: 'xanhla',     name: 'Xanh Lá',    hex: '#69F0AE', audio: 'xanhla.mp3' },
    { id: 'vang',       name: 'Màu Vàng',   hex: '#FFD740', audio: 'vang.mp3' },
    { id: 'tim',        name: 'Màu Tím',    hex: '#E040FB', audio: 'tim.mp3' },
    { id: 'den',        name: 'Màu Đen',    hex: '#333333', audio: 'den.mp3' }
];

function getRandomColor() {
    return GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
}

function shuffleColorArray(arr) {
    const list = arr.slice();

    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }

    return list;
}

function getColorAudioPath(fileName) {
    if (typeof colorAudioPath === 'function') {
        return colorAudioPath(fileName);
    }

    return 'audio/colors/' + fileName;
}


function clearColorCorrectEffect() {
    const gameScreen = document.getElementById('game-screen');

    if (!gameScreen) return;

    gameScreen.classList.remove('color-correct-flash');
    gameScreen.style.removeProperty('--current-correct-color');
}

function setColorCorrectEffect(colorObj) {
    const gameScreen = document.getElementById('game-screen');

    if (!gameScreen || !colorObj) return;

    gameScreen.style.setProperty('--current-correct-color', colorObj.hex);

    // Restart animation mỗi lần trả lời đúng.
    gameScreen.classList.remove('color-correct-flash');
    void gameScreen.offsetWidth;
    gameScreen.classList.add('color-correct-flash');
}

registerGame('color', {
    // Mỗi câu có 12 giây.
    questionTimeSec: 12,

    // =====================================================
    // SINH DỮ LIỆU CÂU HỎI
    // =====================================================
    generateData() {
        return getRandomColor();
    },

    // =====================================================
    // HIỂN THỊ CÂU HỎI
    // Không tô màu câu hỏi để tránh lộ đáp án.
    // Bấm vào dấu ? để nghe lại.
    // =====================================================
    renderDisplay(colorObj) {
        clearColorCorrectEffect();

        return `
            <div class="color-question">
                <button
                    class="color-question-card"
                    type="button"
                    onclick="handleReplayQuestion()"
                    aria-label="Nghe lại câu hỏi">
                    <div class="color-question-mark">?</div>
                    <div class="color-question-text">Màu gì?</div>
                </button>
            </div>
        `;
    },

    // =====================================================
    // TẠO 4 ĐÁP ÁN MÀU
    // =====================================================
    getOptions(correctObj) {
        const optionMap = new Map();

        optionMap.set(correctObj.id, correctObj);

        while (optionMap.size < 4) {
            const item = getRandomColor();
            optionMap.set(item.id, item);
        }

        return shuffleColorArray(Array.from(optionMap.values()));
    },

    // =====================================================
    // STYLE NÚT ĐÁP ÁN
    // CSS chính nằm trong color.css.
    // =====================================================
    styleOptionBtn(btn, colorObj) {
        btn.textContent = '';
        btn.classList.add('color-option-btn');

        btn.style.setProperty('--color-value', colorObj.hex);
        btn.setAttribute('aria-label', colorObj.name);
        btn.setAttribute('title', colorObj.name);
    },

    // =====================================================
    // ÂM CÂU HỎI
    // Đọc tên màu.
    // =====================================================
    getAudio(colorObj) {
        return [
            getColorAudioPath(colorObj.audio || (colorObj.id + '.mp3'))
        ];
    },

    // =====================================================
    // KIỂM TRA ĐÁP ÁN
    // =====================================================
    checkResult(selected, correct) {
        const isCorrect = selected && correct && selected.id === correct.id;

        if (isCorrect) {
            setColorCorrectEffect(correct);
        }

        return isCorrect;
    }
});
