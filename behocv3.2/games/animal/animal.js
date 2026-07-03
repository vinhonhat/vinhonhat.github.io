// games/animal/animal.js
// =====================================================
// GAME: NHẬN BIẾT CON VẬT / ĐỒ VẬT / HOA QUẢ
// Chuẩn v3.2 - dùng registerGame() + game-core.js
// Ảnh dùng imgPath(fileName) từ js/asset.js.
// Âm dùng animalAudioPath(fileName) từ js/asset.js.
// =====================================================

const ANIMAL_ITEMS = [
    { id: 'bo', name: 'Con Bò', img: 'bo.png' },
    { id: 'cho', name: 'Con Chó', img: 'cho.png' },
    { id: 'chuoi', name: 'Quả Chuối', img: 'chuoi.png' },
    { id: 'chuot', name: 'Con Chuột', img: 'chuot.png' },
    { id: 'de', name: 'Con Dê', img: 'de.png' },
    { id: 'duahau', name: 'Dưa Hấu', img: 'duahau.png' },
    { id: 'ech', name: 'Con Ếch', img: 'ech.png' },
    { id: 'ga', name: 'Con Gà', img: 'ga.png' },
    { id: 'giun', name: 'Con Giun', img: 'giun.png' },
    { id: 'heo', name: 'Con Heo', img: 'heo.png' },
    { id: 'khi', name: 'Con Khỉ', img: 'khi.png' },
    { id: 'meo', name: 'Con Mèo', img: 'meo.png' },
    { id: 'ngua', name: 'Con Ngựa', img: 'ngua.png' },
    { id: 'oto', name: 'Ô Tô', img: 'oto.png' },
    { id: 'ran', name: 'Con Rắn', img: 'ran.png' },
    { id: 'rong', name: 'Con Rồng', img: 'rong.png' },
    { id: 'sao', name: 'Ngôi Sao', img: 'sao.png' },
    { id: 'sutu', name: 'Sư Tử', img: 'sutu.png' },
    { id: 'tao', name: 'Quả Táo', img: 'tao.png' },
    { id: 'tho', name: 'Con Thỏ', img: 'tho.png' },
    { id: 'trau', name: 'Con Trâu', img: 'trau.png' },
    { id: 'vit', name: 'Con Vịt', img: 'vit.png' },

    { id: 'ca', name: 'Cái Ca', img: 'ca.png' },
    { id: 'tran', name: 'Con Trăn', img: 'tran.png' },
    { id: 'am', name: 'Cái Ấm', img: 'am.png' },
    { id: 'ca_fish', name: 'Con Cá', img: 'ca_fish.png' },
    { id: 'dudu', name: 'Đu Đủ', img: 'dudu.png' },
    { id: 'embe', name: 'Em Bé', img: 'embe.png' },
    { id: 'bonghoa', name: 'Bông Hoa', img: 'hoa.png' },
    { id: 'bi', name: 'Viên Bi', img: 'bi.png' },
    { id: 'keo', name: 'Cái Kéo', img: 'keo.png' },
    { id: 'na', name: 'Quả Na', img: 'na.png' },
    { id: 'ong', name: 'Con Ong', img: 'ong.png' },
    { id: 'o_umbrella', name: 'Cái Ô', img: 'o_umbrella.png' },
    { id: 'mo', name: 'Quả Mơ', img: 'mo.png' },
    { id: 'pin', name: 'Viên Pin', img: 'pin.png' },
    { id: 'qua', name: 'Món Quà', img: 'qua.png' },
    { id: 'rua', name: 'Con Rùa', img: 'rua.png' },
    { id: 'tom', name: 'Con Tôm', img: 'tom.png' },
    { id: 'mu', name: 'Cái Mũ', img: 'mu.png' },
    { id: 'vo', name: 'Quyển Vở', img: 'vo.png' },
    { id: 'xedap', name: 'Xe Đạp', img: 'xedap.png' },
    { id: 'yta', name: 'Y Tá', img: 'yta.png' }
];

function animalImagePath(fileName) {
    if (typeof imgPath === 'function') {
        return imgPath(fileName);
    }

    return 'img/' + fileName;
}

function animalSoundPath(fileName) {
    if (typeof animalAudioPath === 'function') {
        return animalAudioPath(fileName);
    }

    return 'audio/animals/' + fileName;
}

function getRandomAnimalItem() {
    return ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
}

function shuffleAnimalOptions(list) {
    const arr = list.slice();

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

registerGame('match_animal', {
    // Mỗi câu có 15 giây.
    questionTimeSec: 15,

    // =====================================================
    // SINH DỮ LIỆU CÂU HỎI
    // =====================================================
    generateData() {
        return getRandomAnimalItem();
    },

    // =====================================================
    // HIỂN THỊ CÂU HỎI
    // Bấm vào hình để nghe lại câu hỏi.
    // =====================================================
    renderDisplay(item) {
        return `
            <div class="animal-question" onclick="handleReplayQuestion()">
                <img
                    class="animal-main-img"
                    src="${animalImagePath(item.img)}"
                    alt="${item.name}"
                    draggable="false">

                <div class="animal-name">
                    ${item.name}
                </div>
            </div>
        `;
    },

    // =====================================================
    // TẠO 4 ĐÁP ÁN KHÔNG TRÙNG
    // =====================================================
    getOptions(correctItem) {
        const wrongItems = ANIMAL_ITEMS
            .filter(item => item.id !== correctItem.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        return shuffleAnimalOptions([
            correctItem,
            ...wrongItems
        ]);
    },

    // =====================================================
    // STYLE NÚT ĐÁP ÁN
    // Chỉ hiện hình để bé chọn đúng hình.
    // =====================================================
    styleOptionBtn(btn, item) {
        btn.classList.add('animal-option-btn');

        btn.innerHTML = `
            <img
                class="animal-option-img"
                src="${animalImagePath(item.img)}"
                alt="${item.name}"
                draggable="false">
        `;

        btn.setAttribute('aria-label', item.name);
    },

    // =====================================================
    // ÂM CÂU HỎI
    // File cần có: audio/animals/congi.mp3
    // =====================================================
    getAudio() {
        return [
            animalSoundPath('congi.mp3')
        ];
    },

    // =====================================================
    // ÂM SAU KHI CHỌN ĐÚNG
    // Ví dụ: audio/animals/bo.mp3
    // =====================================================
    getAnswerAudio(item) {
        return [
            animalSoundPath((item.audio || item.id) + '.mp3')
        ];
    },

    // =====================================================
    // KIỂM TRA ĐÁP ÁN
    // =====================================================
    checkResult(selected, correct) {
        return selected.id === correct.id;
    }
});
