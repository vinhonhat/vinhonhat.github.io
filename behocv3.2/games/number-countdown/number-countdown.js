// games/number-countdown/number-countdown.js
// GAME: Đếm Ngược - chọn số còn thiếu khi đếm lùi.

(function () {
function __shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

registerGame('number_countdown', {
    questionTimeSec: 12,

    generateData() {
        const start = Math.floor(Math.random() * 10) + 6; // 6-15
        const seq = [start, start - 1, start - 2, start - 3];
        const missingIndex = Math.floor(Math.random() * 4);
        return {
            seq,
            missingIndex,
            answer: seq[missingIndex]
        };
    },

    renderDisplay(data) {
        return `
            <div class="number-countdown-question">
                <div class="number-countdown-title">Điền số đếm ngược</div>
                <div class="number-countdown-seq">
                    ${data.seq.map((n, idx) => `
                        <div class="number-countdown-card ${idx === data.missingIndex ? 'is-missing' : ''}">
                            ${idx === data.missingIndex ? '?' : n}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getOptions(data) {
        const set = new Set([data.answer]);
        while (set.size < 4) {
            set.add(Math.floor(Math.random() * 16));
        }
        return __shuffle(Array.from(set));
    },

    styleOptionBtn(btn, value) {
        btn.classList.add('number-countdown-option');
        btn.textContent = value;
    },

    getAudio() { return []; },

    checkResult(selected, data) {
        return Number(selected) === Number(data.answer);
    }
});
})();
