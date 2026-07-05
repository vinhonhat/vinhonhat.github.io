// games/number-more-less/number-more-less.js
// GAME: Nhiều Ít - chọn bên nhiều hơn / ít hơn bằng hình ảnh.

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
        { id: 'tao', name: 'Quả táo', img: 'tao.png' },
        { id: 'ca', name: 'Con cá', img: 'ca_fish.png' },
        { id: 'sao', name: 'Ngôi sao', img: 'sao.png' },
        { id: 'bi', name: 'Viên bi', img: 'bi.png' },
        { id: 'ong', name: 'Con ong', img: 'ong.png' }
    ];

    function makeItems(n, item) {
        let html = '';
        for (let i = 0; i < n; i++) {
            html += `<img src="${__eduImg(item.img)}" alt="${item.name}" draggable="false">`;
        }
        return html;
    }

    registerGame('number_more_less', {
        questionTimeSec: 15,

        generateData() {
            const item = __eduRandomItem(ITEMS);
            let left = Math.floor(Math.random() * 7) + 1;
            let right = Math.floor(Math.random() * 7) + 1;
            if (left === right && Math.random() < 0.7) right = right === 7 ? 6 : right + 1;
            const askMore = Math.random() < 0.65;
            return {
                item, left, right, askMore,
                answer: left === right ? 'equal' : (askMore ? (left > right ? 'left' : 'right') : (left < right ? 'left' : 'right'))
            };
        },

        renderDisplay(data) {
            return `
                <div class="more-less-question">
                    <div class="more-less-title">${data.askMore ? 'Bên nào nhiều hơn?' : 'Bên nào ít hơn?'}</div>
                    <div class="more-less-groups">
                        <div class="more-less-side">
                            <div class="more-less-label">Bên trái</div>
                            <div class="more-less-items items-${data.left}">${makeItems(data.left, data.item)}</div>
                        </div>
                        <div class="more-less-vs">⚖️</div>
                        <div class="more-less-side">
                            <div class="more-less-label">Bên phải</div>
                            <div class="more-less-items items-${data.right}">${makeItems(data.right, data.item)}</div>
                        </div>
                    </div>
                </div>
            `;
        },

        getOptions() {
            return ['left', 'right', 'equal'];
        },

        styleOptionBtn(btn, value) {
            btn.classList.add('more-less-option');
            const text = value === 'left' ? 'Bên trái' : value === 'right' ? 'Bên phải' : 'Bằng nhau';
            btn.textContent = text;
        },

        getAudio() { return []; },

        checkResult(selected, data) {
            return selected === data.answer;
        }
    });
})();
