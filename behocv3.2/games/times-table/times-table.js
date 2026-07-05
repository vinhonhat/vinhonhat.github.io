// games/times-table/times-table.js
// GAME: Bảng Cửu Chương - học nhân trong phạm vi 2-9.

(function () {
function __shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

registerGame('times_table', {
    questionTimeSec: 14,

    generateData() {
        const a = Math.floor(Math.random() * 8) + 2; // 2-9
        const b = Math.floor(Math.random() * 9) + 1; // 1-9
        return { a, b, result: a * b };
    },

    renderDisplay(data) {
        return `
            <div class="times-question">
                <div class="times-title">Bảng cửu chương</div>
                <div class="times-expression">${data.a} × ${data.b} = ?</div>
            </div>
        `;
    },

    getOptions(data) {
        const set = new Set([data.result]);
        while (set.size < 4) {
            const a = Math.floor(Math.random() * 8) + 2;
            const b = Math.floor(Math.random() * 9) + 1;
            set.add(a * b);
        }
        return __shuffle(Array.from(set));
    },

    styleOptionBtn(btn, value) {
        btn.classList.add('times-option');
        btn.textContent = value;
    },

    getAudio() { return []; },

    checkResult(selected, data) {
        return Number(selected) === data.result;
    }
});
})();
