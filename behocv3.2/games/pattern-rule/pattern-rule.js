// games/pattern-rule/pattern-rule.js
// GAME: Quy Luật - tìm hình/số tiếp theo trong chuỗi.

(function () {
function __shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }
const SETS = [
    ['🍎', '🍌'],
    ['🐶', '🐱'],
    ['⭐', '🌙'],
    ['1', '2'],
    ['🔴', '🔵'],
    ['▲', '■']
];

registerGame('pattern_rule', {
    questionTimeSec: 16,

    generateData() {
        const set = SETS[Math.floor(Math.random() * SETS.length)];
        const patternType = Math.random() < 0.5 ? 'AB' : 'AAB';
        let seq;
        let answer;
        if (patternType === 'AB') {
            seq = [set[0], set[1], set[0], set[1], set[0]];
            answer = set[1];
        } else {
            seq = [set[0], set[0], set[1], set[0], set[0]];
            answer = set[1];
        }
        return { set, seq, answer };
    },

    renderDisplay(data) {
        return `
            <div class="pattern-question">
                <div class="pattern-title">Tiếp theo là gì?</div>
                <div class="pattern-row">
                    ${data.seq.map(x => `<div class="pattern-card">${x}</div>`).join('')}
                    <div class="pattern-card is-missing">?</div>
                </div>
            </div>
        `;
    },

    getOptions(data) {
        const extras = ['🍎','🍌','🐶','🐱','⭐','🌙','1','2','🔴','🔵','▲','■'];
        const set = new Set([data.answer, ...data.set]);
        while (set.size < 4) set.add(extras[Math.floor(Math.random() * extras.length)]);
        return __shuffle(Array.from(set)).slice(0, 4);
    },

    styleOptionBtn(btn, value) {
        btn.classList.add('pattern-option');
        btn.textContent = value;
    },

    getAudio() { return []; },

    checkResult(selected, data) {
        return selected === data.answer;
    }
});
})();
