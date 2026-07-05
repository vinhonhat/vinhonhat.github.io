// games/math-compare/math-compare.js
// =====================================================
// GAME: LỚN HƠN / BÉ HƠN
// Chuẩn v3.2 - dùng registerGame() + game-core.js
// Bé nhìn 2 số và chọn dấu: >, <, =
// =====================================================

function mathCompareRandomNumber(max) {
    return Math.floor(Math.random() * (max + 1));
}

function mathCompareShuffle(list) {
    if (typeof shuffleArray === 'function') return shuffleArray(list);
    return list.slice().sort(() => Math.random() - 0.5);
}

registerGame('math_compare', {
    questionTimeSec: 12,

    generateData() {
        const useEqual = Math.random() < 0.22;
        let left;
        let right;

        if (useEqual) {
            left = mathCompareRandomNumber(20);
            right = left;
        } else {
            left = mathCompareRandomNumber(20);
            right = mathCompareRandomNumber(20);

            while (right === left) {
                right = mathCompareRandomNumber(20);
            }
        }

        let answer = '=';
        if (left > right) answer = '>';
        if (left < right) answer = '<';

        return { left, right, answer };
    },

    renderDisplay(data) {
        return `
            <div class="math-compare-question">
                <div class="math-compare-number">${data.left}</div>
                <div class="math-compare-unknown">?</div>
                <div class="math-compare-number">${data.right}</div>
            </div>
        `;
    },

    getOptions() {
        // Để cố định thứ tự sẽ dễ học hơn random.
        return ['<', '=', '>'];
    },

    styleOptionBtn(btn, value) {
        btn.textContent = value;
        btn.classList.add('math-compare-option-btn');
        btn.setAttribute('aria-label', 'Dấu ' + value);
    },

    getAudio() {
        return [];
    },

    checkResult(selected, data) {
        return selected === data.answer;
    }
});
