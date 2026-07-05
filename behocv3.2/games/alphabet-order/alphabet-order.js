// games/alphabet-order/alphabet-order.js
// GAME: Thứ Tự Chữ - chọn chữ còn thiếu trong dãy.

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


    const ORDER = ['a','ă','â','b','c','d','đ','e','ê','g','h','i','k','l','m','n','o','ô','ơ','p','q','r','s','t','u','ư','v','x','y'];

    registerGame('alphabet_order', {
        questionTimeSec: 15,

        generateData() {
            const start = Math.floor(Math.random() * (ORDER.length - 4));
            const seq = ORDER.slice(start, start + 4);
            const missingIndex = Math.floor(Math.random() * 4);
            return {
                seq,
                answer: seq[missingIndex],
                missingIndex
            };
        },

        renderDisplay(data) {
            return `
                <div class="alphabet-order-question">
                    <div class="alphabet-order-title">Chữ nào còn thiếu?</div>
                    <div class="alphabet-order-seq">
                        ${data.seq.map((ch, idx) => `
                            <div class="alphabet-order-card ${idx === data.missingIndex ? 'is-missing' : ''}">
                                ${idx === data.missingIndex ? '?' : ch}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        getOptions(data) {
            const set = new Set([data.answer]);
            while (set.size < 4) set.add(__eduRandomItem(ORDER));
            return __eduShuffle(Array.from(set));
        },

        styleOptionBtn(btn, value) {
            btn.classList.add('alphabet-order-option');
            btn.textContent = value;
        },

        getAudio() { return []; },

        checkResult(selected, data) {
            return selected === data.answer;
        }
    });
})();
