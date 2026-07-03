// games/math/math.js
// =====================================================
// GAME: BÉ LÀM TÍNH
// Chuẩn v3.2 - dùng registerGame() + game-core.js
// Cộng / trừ trong phạm vi 10.
// =====================================================

function getRandomMathData() {
    const isPlus = Math.random() > 0.5;
    let a;
    let b;
    let result;
    let operator;

    if (isPlus) {
        // Phép cộng: kết quả không quá 10.
        a = Math.floor(Math.random() * 6);
        b = Math.floor(Math.random() * 6);

        while (a + b > 10) {
            a = Math.floor(Math.random() * 6);
            b = Math.floor(Math.random() * 6);
        }

        result = a + b;
        operator = '+';
    } else {
        // Phép trừ: kết quả không âm.
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * (a + 1));

        result = a - b;
        operator = '-';
    }

    return {
        a,
        b,
        operator,
        result
    };
}

function getRandomMathAnswer() {
    return Math.floor(Math.random() * 15);
}

function shuffleMathOptions(list) {
    const arr = list.slice();

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

registerGame('math', {
    // Mỗi câu có 15 giây.
    questionTimeSec: 15,

    // =====================================================
    // SINH PHÉP TÍNH
    // =====================================================
    generateData() {
        return getRandomMathData();
    },

    // =====================================================
    // HIỂN THỊ ĐỀ BÀI
    // =====================================================
    renderDisplay(data) {
        return `
            <div class="math-question">
                <div class="math-icon">🧮</div>

                <div class="math-expression" aria-label="Phép tính">
                    <span class="math-number">${data.a}</span>
                    <span class="math-operator">${data.operator}</span>
                    <span class="math-number">${data.b}</span>
                    <span class="math-equal">=</span>
                    <span class="math-question-mark">?</span>
                </div>
            </div>
        `;
    },

    // =====================================================
    // TẠO 4 ĐÁP ÁN
    // =====================================================
    getOptions(data) {
        const answerSet = new Set([data.result]);

        while (answerSet.size < 4) {
            answerSet.add(getRandomMathAnswer());
        }

        return shuffleMathOptions(Array.from(answerSet));
    },

    // =====================================================
    // STYLE NÚT ĐÁP ÁN
    // =====================================================
    styleOptionBtn(btn, value) {
        btn.textContent = value;
        btn.classList.add('math-option-btn');
        btn.setAttribute('aria-label', 'Đáp án ' + value);
    },

    // =====================================================
    // ÂM CÂU HỎI
    // Tạm để rỗng, bé tự nhìn phép tính.
    // =====================================================
    getAudio() {
        return [];
    },

    // =====================================================
    // KIỂM TRA ĐÁP ÁN
    // =====================================================
    checkResult(selected, data) {
        return Number(selected) === Number(data.result);
    }
});
