// games/division-basic/division-basic.js
// GAME: Phép Chia - chia trong bảng cửu chương.

(function () {
function __shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

registerGame('division_basic', {
    questionTimeSec: 15,

    generateData() {
        const divisor = Math.floor(Math.random() * 8) + 2; // 2-9
        const answer = Math.floor(Math.random() * 9) + 1; // 1-9
        const total = divisor * answer;
        return { total, divisor, answer };
    },

    renderDisplay(data) {
        return `
            <div class="division-question">
                <div class="division-title">Phép chia</div>
                <div class="division-expression">${data.total} ÷ ${data.divisor} = ?</div>
            </div>
        `;
    },

    getOptions(data) {
        const set = new Set([data.answer]);
        while (set.size < 4) set.add(Math.floor(Math.random() * 9) + 1);
        return __shuffle(Array.from(set));
    },

    styleOptionBtn(btn, value) {
        btn.classList.add('division-option');
        btn.textContent = value;
    },

    getAudio() { return []; },

    checkResult(selected, data) {
        return Number(selected) === data.answer;
    }
});
})();
