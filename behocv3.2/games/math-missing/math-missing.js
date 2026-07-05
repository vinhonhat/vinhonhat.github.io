// games/math-missing/math-missing.js
// =====================================================
// GAME: ĐIỀN SỐ THIẾU
// Chuẩn v3.2 - dùng registerGame() + game-core.js
// Bé chọn số còn thiếu trong phép cộng / phép trừ.
// =====================================================

function mathMissingRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mathMissingShuffle(list) {
    if (typeof shuffleArray === 'function') return shuffleArray(list);
    return list.slice().sort(() => Math.random() - 0.5);
}

function mathMissingMakeOptions(answer, maxNumber) {
    const set = new Set([answer]);

    while (set.size < 4) {
        const near = answer + mathMissingRand(-3, 3);
        const fallback = mathMissingRand(0, maxNumber);
        const value = Math.random() < 0.7 ? near : fallback;

        if (value >= 0 && value <= maxNumber) {
            set.add(value);
        }
    }

    return mathMissingShuffle(Array.from(set));
}

registerGame('math_missing', {
    questionTimeSec: 15,

    generateData() {
        const usePlus = Math.random() < 0.62;

        if (usePlus) {
            const a = mathMissingRand(0, 10);
            const b = mathMissingRand(0, 10 - a);
            const total = a + b;
            const missingSide = Math.random() < 0.5 ? 'left' : 'right';
            const answer = missingSide === 'left' ? a : b;

            return {
                type: 'plus',
                a,
                b,
                result: total,
                missingSide,
                answer,
                maxNumber: 10
            };
        }

        const a = mathMissingRand(1, 15);
        const b = mathMissingRand(0, a);
        const result = a - b;
        const missingSide = Math.random() < 0.5 ? 'left' : 'right';
        const answer = missingSide === 'left' ? a : b;

        return {
            type: 'minus',
            a,
            b,
            result,
            missingSide,
            answer,
            maxNumber: 15
        };
    },

    renderDisplay(data) {
        let leftText;
        let rightText;
        let resultText = data.result;
        const operator = data.type === 'plus' ? '+' : '-';

        if (data.missingSide === 'left') {
            leftText = '?';
            rightText = data.b;
        } else {
            leftText = data.a;
            rightText = '?';
        }

        return `
            <div class="math-missing-question">
                <div class="math-missing-formula">
                    <span class="math-missing-cell ${data.missingSide === 'left' ? 'is-missing' : ''}">${leftText}</span>
                    <span class="math-missing-operator">${operator}</span>
                    <span class="math-missing-cell ${data.missingSide === 'right' ? 'is-missing' : ''}">${rightText}</span>
                    <span class="math-missing-operator">=</span>
                    <span class="math-missing-cell result-cell">${resultText}</span>
                </div>
                <div class="math-missing-hint">Chọn số còn thiếu</div>
            </div>
        `;
    },

    getOptions(data) {
        return mathMissingMakeOptions(data.answer, data.maxNumber);
    },

    styleOptionBtn(btn, value) {
        btn.textContent = value;
        btn.classList.add('math-missing-option-btn');
        btn.setAttribute('aria-label', 'Số ' + value);
    },

    getAudio() {
        return [];
    },

    checkResult(selected, data) {
        return Number(selected) === Number(data.answer);
    }
});
