// games/multiply-divide/multiply-divide.js
// GAME: Nhân Chia Nhanh - trộn phép nhân và chia.

(function () {
function __shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

registerGame('multiply_divide', {
    questionTimeSec: 12,

    generateData() {
        const isMultiply = Math.random() < 0.5;
        if (isMultiply) {
            const a = Math.floor(Math.random() * 8) + 2;
            const b = Math.floor(Math.random() * 9) + 1;
            return { type: 'mul', text: `${a} × ${b}`, answer: a * b };
        }
        const divisor = Math.floor(Math.random() * 8) + 2;
        const answer = Math.floor(Math.random() * 9) + 1;
        const total = divisor * answer;
        return { type: 'div', text: `${total} ÷ ${divisor}`, answer };
    },

    renderDisplay(data) {
        return `
            <div class="muldiv-question">
                <div class="muldiv-title">Nhân hay chia?</div>
                <div class="muldiv-expression">${data.text} = ?</div>
            </div>
        `;
    },

    getOptions(data) {
        const set = new Set([data.answer]);
        while (set.size < 4) {
            const n = data.type === 'mul'
                ? (Math.floor(Math.random() * 8) + 2) * (Math.floor(Math.random() * 9) + 1)
                : Math.floor(Math.random() * 9) + 1;
            set.add(n);
        }
        return __shuffle(Array.from(set));
    },

    styleOptionBtn(btn, value) {
        btn.classList.add('muldiv-option');
        btn.textContent = value;
    },

    getAudio() { return []; },

    checkResult(selected, data) {
        return Number(selected) === data.answer;
    }
});
})();
