// games/math2/math2.js
// =====================================================
// GAME: TÁCH GỘP SỐ
// Chuẩn v3.2 - dùng registerGame() + game-core.js
//
// Layout:
// - Câu hỏi: 70%
// - Đáp án: 30%
// - Mobile dọc: số được cộng/trừ ở hàng trên,
//               số cộng/trừ ở hàng dưới.
// - Màn ngang/PC: xoay thành 1 hàng ngang.
// =====================================================

const MATH2_ITEMS = [
    { id: 'tao', name: 'Quả táo', img: 'tao.png' },
    { id: 'bi',  name: 'Viên bi', img: 'bi.png'  },
    { id: 'sao', name: 'Ngôi sao', img: 'sao.png' }
];

function math2ImgPath(fileName) {
    if (typeof imgPath === 'function') {
        return imgPath(fileName);
    }

    return 'img/' + fileName;
}

function math2RandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function math2RandomItem() {
    return MATH2_ITEMS[Math.floor(Math.random() * MATH2_ITEMS.length)];
}

// =====================================================
// CHIA HÀNG HÌNH ẢNH
// Dùng để 1..10 item luôn căn giữa đẹp.
// =====================================================

function math2GetRowPattern(qty) {
    const patterns = {
        1: [1],
        2: [2],
        3: [3],
        4: [2, 2],
        5: [3, 2],
        6: [3, 3],
        7: [2, 3, 2],
        8: [3, 2, 3],
        9: [3, 3, 3],
        10: [3, 4, 3]
    };

    return patterns[qty] || [qty];
}

function math2RenderItems(qty, item) {
    const pattern = math2GetRowPattern(qty);
    let index = 0;

    return pattern.map(rowCount => {
        const rowItems = [];

        for (let i = 0; i < rowCount; i++) {
            const delay = index * 0.04;

            rowItems.push(`
                <img
                    class="math2-item"
                    src="${math2ImgPath(item.img)}"
                    alt="${item.name}"
                    draggable="false"
                    style="animation-delay:${delay}s">
            `);

            index += 1;
        }

        return `
            <div class="math2-items-row math2-items-row-${rowCount}">
                ${rowItems.join('')}
            </div>
        `;
    }).join('');
}

function math2RenderGroup(qty, item, labelClass) {
    return `
        <div class="math2-group ${labelClass}">
            <div class="math2-items math2-items-${qty}">
                ${math2RenderItems(qty, item)}
            </div>
        </div>
    `;
}

// =====================================================
// SINH DỮ LIỆU
// Có 2 kiểu:
// - Gộp:    left + right = ?
// - Tách:   total - right = ?
// =====================================================

function math2GenerateData() {
    const item = math2RandomItem();

    const left = math2RandomInt(1, 9);
    let right = math2RandomInt(1, 9);

    while (left + right > 10) {
        right = math2RandomInt(1, 9);
    }

    const total = left + right;

    // Level đầu có thể muốn chỉ cộng thì đổi dòng này thành: const mode = 'add';
    const mode = Math.random() < 0.5 ? 'add' : 'subtract';

    if (mode === 'add') {
        return {
            mode,
            operator: '+',
            topQty: left,
            bottomQty: right,
            answer: total,
            left,
            right,
            total,
            item,
            title: 'Gộp lại được mấy?'
        };
    }

    return {
        mode,
        operator: '-',
        topQty: total,
        bottomQty: right,
        answer: left,
        left,
        right,
        total,
        item,
        title: 'Còn lại mấy?'
    };
}

registerGame('math2', {
    questionTimeSec: 18,

    generateData() {
        return math2GenerateData();
    },

    renderDisplay(data) {
        return `
            <div class="math2-wrap math2-mode-${data.mode}">
                <div class="math2-title">${data.title}</div>

                <div class="math2-expression">
                    ${math2RenderGroup(data.topQty, data.item, 'math2-group-top')}

                    <div class="math2-operator" aria-label="Dấu ${data.operator}">
                        ${data.operator}
                    </div>

                    ${math2RenderGroup(data.bottomQty, data.item, 'math2-group-bottom')}
                </div>
            </div>
        `;
    },

    getOptions(data) {
        const answers = new Set([data.answer]);

        while (answers.size < 4) {
            answers.add(math2RandomInt(1, 10));
        }

        const list = Array.from(answers);

        if (typeof shuffleArray === 'function') {
            return shuffleArray(list);
        }

        return list.sort(() => Math.random() - 0.5);
    },

    styleOptionBtn(btn, value) {
        btn.textContent = value;
        btn.classList.add('math2-option-btn');
        btn.setAttribute('aria-label', 'Đáp án ' + value);
    },

    getAudio() {
        // Không đọc đề để bé tự quan sát và tính.
        return [];
    },

    checkResult(selected, data) {
        return Number(selected) === Number(data.answer);
    }
});
