// games/count/count.js
// =====================================================
// GAME: TẬP ĐẾM
// Chuẩn v3.2 - dùng registerGame() + game-core.js
// Ảnh dùng imgPath(fileName) từ js/asset.js.
// Ví dụ: imgPath('tao.png') -> img/tao.png
// =====================================================

const COUNT_ITEMS = [
    { id: 'tao', name: 'Quả táo', img: 'tao.png' },
    { id: 'oto', name: 'Ô tô', img: 'oto.png' },
    { id: 'cho', name: 'Con chó', img: 'cho.png' },
    { id: 'meo', name: 'Con mèo', img: 'meo.png' },
    { id: 'ga',  name: 'Con gà',  img: 'ga.png'  },
    { id: 'vit', name: 'Con vịt', img: 'vit.png' },
    { id: 'ong', name: 'Con ong', img: 'ong.png' },
    { id: 'bi',  name: 'Viên bi', img: 'bi.png'  },
    { id: 'sao', name: 'Ngôi sao', img: 'sao.png' }
];

function countImagePath(fileName) {
    if (typeof imgPath === 'function') {
        return imgPath(fileName);
    }

    return 'img/' + fileName;
}

function getRandomCountItem() {
    return COUNT_ITEMS[Math.floor(Math.random() * COUNT_ITEMS.length)];
}

function getRandomCountQty() {
    return Math.floor(Math.random() * 10) + 1;
}

// =====================================================
// CHIA HÀNG HIỂN THỊ HÌNH
// Mỗi số có thể có nhiều kiểu xếp.
// Mỗi câu hỏi sẽ random 1 kiểu.
// =====================================================

const COUNT_ROW_PATTERNS = {
    1: [
        [1]
    ],

    2: [
        [2]
    ],

    3: [
        [3],
        [1, 2],
        [2, 1]
    ],

    4: [
        [2, 2],
        [1, 2, 1]
    ],

    5: [
        [3, 2],
        [2, 1, 2],
        [2, 3],
        [1, 3, 1]
    ],

    6: [
        [3, 3],
        [2, 2, 2]
    ],

    7: [
        [2, 3, 2],
        [3, 1, 3]
    ],

    8: [
        [3, 2, 3],
        [2, 4, 2],
        [4, 4]
    ],

    9: [
        [3, 3, 3],
        [2, 3, 4],
        [4, 3, 2]
    ],

    10: [
        [3, 4, 3],
        [1, 2, 3, 4],
        [4, 3, 2, 1],
        [4, 2, 4],
        [5, 5]
    ]
};

function getCountRowPattern(qty) {
    const patterns = COUNT_ROW_PATTERNS[qty] || [[qty]];

    return patterns[
        Math.floor(Math.random() * patterns.length)
    ];
}

function renderCountItems(data) {
    const pattern = getCountRowPattern(data.qty);
    let index = 0;

    return pattern.map(rowCount => {
        const rowItems = [];

        for (let i = 0; i < rowCount; i++) {
            const delay = index * 0.05;

            rowItems.push(`
                <div class="count-item" style="animation-delay:${delay}s">
                    <img
                        class="count-item-img"
                        src="${countImagePath(data.item.img)}"
                        alt="${data.item.name}"
                        draggable="false">
                </div>
            `);

            index += 1;
        }

        return `
            <div class="count-row count-row-${rowCount}">
                ${rowItems.join('')}
            </div>
        `;
    }).join('');
}

registerGame('count', {
    // Mỗi câu có 15 giây. Muốn nhanh/chậm thì sửa số này.
    questionTimeSec: 15,

    // =====================================================
    // SINH DỮ LIỆU CÂU HỎI
    // Chọn 1 loại hình và số lượng từ 1 đến 10.
    // =====================================================
    generateData() {
        return {
            item: getRandomCountItem(),
            qty: getRandomCountQty()
        };
    },

    // =====================================================
    // HIỂN THỊ CÂU HỎI
    // Không hiện số đáp án trong câu hỏi để bé tự đếm.
    // =====================================================
    renderDisplay(data) {
        return `
            <div class="count-question">
                <div class="count-title">
                    Bé hãy đếm số hình nhé!
                </div>

                <div class="count-container count-qty-${data.qty}">
                    ${renderCountItems(data)}
                </div>
            </div>
        `;
    },

    // =====================================================
    // TẠO 4 ĐÁP ÁN
    // Gồm đáp án đúng và 3 số nhiễu trong khoảng 1-10.
    // =====================================================
    getOptions(data) {
        const answerSet = new Set([data.qty]);

        while (answerSet.size < 4) {
            answerSet.add(getRandomCountQty());
        }

        return Array.from(answerSet);
    },

    // =====================================================
    // STYLE NÚT ĐÁP ÁN
    // CSS chính nằm trong count.css.
    // =====================================================
    styleOptionBtn(btn, value) {
        btn.textContent = value;
        btn.classList.add('count-option-btn');
        btn.setAttribute('aria-label', 'Đáp án ' + value);
    },

    // =====================================================
    // ÂM CÂU HỎI
    // Không đọc số lượng để tránh lộ đáp án.
    // =====================================================
    getAudio() {
        return [];
    },

    // =====================================================
    // KIỂM TRA ĐÁP ÁN
    // =====================================================
    checkResult(selected, data) {
        return Number(selected) === Number(data.qty);
    }
});
