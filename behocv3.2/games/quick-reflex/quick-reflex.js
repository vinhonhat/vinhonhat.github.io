// games/quick-reflex/quick-reflex.js
// GAME: Nhanh Tay - phản xạ nhanh với chữ, số, màu.

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


    const COLORS = [
        { id: 'do', name: 'màu đỏ', value: '#FF5252' },
        { id: 'xanh', name: 'màu xanh', value: '#448AFF' },
        { id: 'vang', name: 'màu vàng', value: '#FFD740' },
        { id: 'tim', name: 'màu tím', value: '#E040FB' }
    ];

    const LETTERS = ['a','b','c','d','đ','e','m','n','o','ô','s','t'];

    registerGame('quick_reflex', {
        questionTimeSec: 6,

        generateData() {
            const type = __eduRandomItem(['letter', 'number', 'color']);
            if (type === 'letter') {
                const answer = __eduRandomItem(LETTERS);
                return { type, label: 'Bấm chữ', answer, options: LETTERS };
            }
            if (type === 'number') {
                const answer = Math.floor(Math.random() * 10);
                return { type, label: 'Bấm số', answer, options: Array.from({length: 10}, (_, i) => i) };
            }
            const answer = __eduRandomItem(COLORS);
            return { type, label: 'Bấm màu', answer, options: COLORS };
        },

        renderDisplay(data) {
            const show = data.type === 'color'
                ? `<span class="quick-reflex-color-name">${data.answer.name}</span>`
                : `<span>${data.answer}</span>`;
            return `
                <div class="quick-reflex-question">
                    <div class="quick-reflex-label">${data.label}</div>
                    <div class="quick-reflex-target">${show}</div>
                    <div class="quick-reflex-small">Nhanh tay chọn đáp án đúng!</div>
                </div>
            `;
        },

        getOptions(data) {
            if (data.type === 'color') {
                const set = new Map([[data.answer.id, data.answer]]);
                while (set.size < 4) {
                    const c = __eduRandomItem(COLORS);
                    set.set(c.id, c);
                }
                return __eduShuffle(Array.from(set.values()));
            }
            const set = new Set([data.answer]);
            while (set.size < 4) set.add(__eduRandomItem(data.options));
            return __eduShuffle(Array.from(set));
        },

        styleOptionBtn(btn, value) {
            btn.classList.add('quick-reflex-option');
            if (typeof value === 'object') {
                btn.textContent = '';
                btn.style.background = value.value;
                btn.setAttribute('aria-label', value.name);
            } else {
                btn.textContent = value;
            }
        },

        getAudio() { return []; },

        checkResult(selected, data) {
            if (data.type === 'color') return selected.id === data.answer.id;
            return selected === data.answer;
        }
    });
})();
