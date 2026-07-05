// games/classify-group/classify-group.js
// GAME: Phân Loại - chọn nhóm đúng cho hình.

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
        { id: 'cho', name: 'con chó', img: 'cho.png', group: 'animal', groupName: 'Con vật' },
        { id: 'meo', name: 'con mèo', img: 'meo.png', group: 'animal', groupName: 'Con vật' },
        { id: 'ga', name: 'con gà', img: 'ga.png', group: 'animal', groupName: 'Con vật' },
        { id: 'tao', name: 'quả táo', img: 'tao.png', group: 'fruit', groupName: 'Trái cây' },
        { id: 'chuoi', name: 'quả chuối', img: 'chuoi.png', group: 'fruit', groupName: 'Trái cây' },
        { id: 'duahau', name: 'dưa hấu', img: 'duahau.png', group: 'fruit', groupName: 'Trái cây' },
        { id: 'keo', name: 'cái kéo', img: 'keo.png', group: 'object', groupName: 'Đồ vật' },
        { id: 'mu', name: 'cái mũ', img: 'mu.png', group: 'object', groupName: 'Đồ vật' },
        { id: 'vo', name: 'quyển vở', img: 'vo.png', group: 'object', groupName: 'Đồ vật' }
    ];

    const GROUPS = [
        { id: 'animal', name: 'Con vật', icon: '🐾' },
        { id: 'fruit', name: 'Trái cây', icon: '🍎' },
        { id: 'object', name: 'Đồ vật', icon: '🎒' }
    ];

    registerGame('classify_group', {
        questionTimeSec: 14,

        generateData() {
            return __eduRandomItem(ITEMS);
        },

        renderDisplay(item) {
            return `
                <div class="classify-question">
                    <div class="classify-title">Hình này thuộc nhóm nào?</div>
                    <img class="classify-img" src="${__eduImg(item.img)}" alt="${item.name}" draggable="false">
                    <div class="classify-name">${item.name}</div>
                </div>
            `;
        },

        getOptions() {
            return GROUPS;
        },

        styleOptionBtn(btn, group) {
            btn.classList.add('classify-option');
            btn.innerHTML = `<span>${group.icon}</span><b>${group.name}</b>`;
        },

        getAudio() { return []; },

        checkResult(selected, item) {
            return selected.id === item.group;
        }
    });
})();
