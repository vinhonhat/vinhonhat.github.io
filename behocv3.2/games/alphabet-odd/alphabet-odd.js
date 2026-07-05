// games/alphabet-odd/alphabet-odd.js
// GAME: Chữ Khác Nhau - tìm chữ khác biệt.

(function () {

function __eduShuffle(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

function __eduImg(fileName) {
    if (typeof imgPath === 'function') return imgPath(fileName);
    return 'img/' + fileName;
}

function __eduAlphabetAudio(fileName) {
    if (typeof alphabetAudioPath === 'function') return alphabetAudioPath(fileName);
    return 'audio/alphabet/' + fileName;
}

function __eduNumberAudio(fileName) {
    if (typeof numberAudioPath === 'function') return numberAudioPath(fileName);
    return 'audio/numbers/' + fileName;
}

function __eduRandomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}


    const GROUPS = [
        { base: 'a', odd: 'ă' },
        { base: 'a', odd: 'â' },
        { base: 'o', odd: 'ô' },
        { base: 'o', odd: 'ơ' },
        { base: 'u', odd: 'ư' },
        { base: 'b', odd: 'd' },
        { base: 'p', odd: 'q' },
        { base: 'i', odd: 'l' },
        { base: 'm', odd: 'n' },
        { base: 'ch', odd: 'tr' },
        { base: 'ng', odd: 'ngh' }
    ];

    function makeGrid(base, odd) {
        const total = 12;
        const oddIndex = Math.floor(Math.random() * total);
        const arr = [];
        for (let i = 0; i < total; i++) {
            arr.push(i === oddIndex ? odd : base);
        }
        return arr;
    }

    registerGame('alphabet_odd', {
        questionTimeSec: 14,

        generateData() {
            const pair = __eduRandomItem(GROUPS);
            return {
                base: pair.base,
                odd: pair.odd,
                grid: makeGrid(pair.base, pair.odd)
            };
        },

        renderDisplay(data) {
            return `
                <div class="alphabet-odd-question">
                    <div class="alphabet-odd-title">Tìm chữ khác nhé!</div>
                    <div class="alphabet-odd-board">
                        ${data.grid.map(ch => `<div class="alphabet-odd-cell">${ch}</div>`).join('')}
                    </div>
                </div>
            `;
        },

        getOptions(data) {
            const pool = ['a','ă','â','b','d','p','q','i','l','m','n','o','ô','ơ','u','ư','ch','tr','ng','ngh'];
            const set = new Set([data.odd, data.base]);
            while (set.size < 4) set.add(__eduRandomItem(pool));
            return __eduShuffle(Array.from(set));
        },

        styleOptionBtn(btn, value) {
            btn.classList.add('alphabet-odd-option');
            btn.textContent = value;
        },

        getAudio() {
            return [];
        },

        checkResult(selected, data) {
            return selected === data.odd;
        }
    });
})();
