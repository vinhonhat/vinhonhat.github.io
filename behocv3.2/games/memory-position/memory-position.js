// games/memory-position/memory-position.js
// GAME: Nhớ Vị Trí - nhìn nhanh rồi chọn vị trí đúng.

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


    const ITEMS = [
        { id: 'tao', name: 'quả táo', img: 'tao.png' },
        { id: 'meo', name: 'con mèo', img: 'meo.png' },
        { id: 'cho', name: 'con chó', img: 'cho.png' },
        { id: 'ga', name: 'con gà', img: 'ga.png' },
        { id: 'ca', name: 'con cá', img: 'ca_fish.png' },
        { id: 'sao', name: 'ngôi sao', img: 'sao.png' }
    ];

    let uid = 0;

    registerGame('memory_position', {
        questionTimeSec: 18,

        generateData() {
            const choices = __eduShuffle(ITEMS).slice(0, 3);
            const targetIndex = Math.floor(Math.random() * 3);
            return {
                id: 'memory-' + (++uid),
                items: choices,
                target: choices[targetIndex],
                targetIndex
            };
        },

        renderDisplay(data) {
            setTimeout(() => {
                const board = document.getElementById(data.id);
                if (board) board.classList.add('is-hidden');
            }, 2200);

            return `
                <div class="memory-position-question">
                    <div class="memory-position-title">Nhớ vị trí của <b>${data.target.name}</b></div>
                    <div id="${data.id}" class="memory-position-board">
                        ${data.items.map((item, idx) => `
                            <div class="memory-position-card">
                                <img src="${__eduImg(item.img)}" alt="${item.name}" draggable="false">
                                <div class="memory-position-cover">${idx + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="memory-position-hint">Hình sẽ che lại sau 2 giây</div>
                </div>
            `;
        },

        getOptions() {
            return [0, 1, 2];
        },

        styleOptionBtn(btn, value) {
            btn.classList.add('memory-position-option');
            btn.textContent = 'Vị trí ' + (value + 1);
        },

        getAudio() { return []; },

        checkResult(selected, data) {
            return Number(selected) === Number(data.targetIndex);
        }
    });
})();
