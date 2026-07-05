// games/number-neighbor/number-neighbor.js
// GAME: Trước Sau - chọn số liền trước hoặc liền sau.

(function () {
function __shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

registerGame('number_neighbor', {
    questionTimeSec: 12,

    generateData() {
        const middle = Math.floor(Math.random() * 18) + 1; // 1-18
        const askNext = Math.random() < 0.5;
        return {
            middle,
            askNext,
            answer: askNext ? middle + 1 : middle - 1
        };
    },

    renderDisplay(data) {
        const text = data.askNext
            ? `Số đứng sau ${data.middle} là số nào?`
            : `Số đứng trước ${data.middle} là số nào?`;

        return `
            <div class="number-neighbor-question">
                <div class="number-neighbor-title">${text}</div>
                <div class="number-neighbor-line">
                    <span>${data.askNext ? data.middle : '?'}</span>
                    <span>→</span>
                    <span>${data.askNext ? '?' : data.middle}</span>
                </div>
            </div>
        `;
    },

    getOptions(data) {
        const set = new Set([data.answer]);
        while (set.size < 4) {
            const n = Math.max(0, Math.floor(Math.random() * 21));
            set.add(n);
        }
        return __shuffle(Array.from(set));
    },

    styleOptionBtn(btn, value) {
        btn.classList.add('number-neighbor-option');
        btn.textContent = value;
    },

    getAudio() { return []; },

    checkResult(selected, data) {
        return Number(selected) === Number(data.answer);
    }
});
})();
