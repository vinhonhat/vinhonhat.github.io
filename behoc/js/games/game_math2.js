// =====================================================
// GAME: MATH2 - BÉ TÁCH GỘP
// UPDATE:
// ✔ Giỏ cố định
// ✔ Chứa tối đa 9 item
// ✔ Item không tự co nhỏ
// ✔ Đáp án đỏ/xanh
// ✔ Animation rung sai
// ✔ Đồng đều 2 bên
// =====================================================

registerGame('math2', {

    // =================================================
    // TẠO DỮ LIỆU
    // =================================================
    generateData: function () {

        const allowItems = ITEMS.filter(item =>
            [
                'tao',
                'ca'
            ].includes(item.id)
        );

        const item =
            allowItems[
                Math.floor(
                    Math.random() *
                    allowItems.length
                )
            ];

        // ---------------------------------------------
        // TỔNG TỐI ĐA = 10
        // ---------------------------------------------

        let left =
            Math.floor(Math.random() * 9) + 1;

        let right =
            Math.floor(Math.random() * 9) + 1;

        // Không cho vượt 10
        while (left + right > 10) {

            right =
                Math.floor(Math.random() * 9) + 1;
        }

        return {

            left: left,

            right: right,

            total: left + right,

            item: item
        };
    },

    // =================================================
    // HIỂN THỊ
    // =================================================
    renderDisplay: function (data) {

        // ẨN LOA
        setTimeout(() => {

            const replayBtn =
                document.querySelector('.replay-btn');

            if (replayBtn) {

                replayBtn.style.display = 'none';
            }

        }, 50);

        // ---------------------------------------------
        // ITEM TRÁI
        // ---------------------------------------------

        let leftHTML = '';

        for (let i = 0; i < data.left; i++) {

            leftHTML += `

                <img
                    src="/img/game/${data.item.img}"

                    class="math2-item"

                    style="
                        animation-delay:${i * 0.15}s
                    "
                >

            `;
        }

        // ---------------------------------------------
        // ITEM PHẢI
        // ---------------------------------------------

        let rightHTML = '';

        for (let i = 0; i < data.right; i++) {

            rightHTML += `

                <img
                    src="/img/game/${data.item.img}"

                    class="math2-item"

                    style="
                        animation-delay:${i * 0.15}s
                    "
                >

            `;
        }

        // ---------------------------------------------
        // HTML
        // ---------------------------------------------

        return `

        <div class="math2-wrap">

            
            <!-- GIỎ -->
            <div class="math2-groups">

                <!-- GIỎ TRÁI -->
                <div class="math2-basket">

                    <img
                        src="/img/game/gio.png"
                        class="basket-bg"
                    >

                    <div class="basket-items">

                        ${leftHTML}

                    </div>

                </div>

                <!-- DẤU + -->
                <div class="math2-plus">

                    +

                </div>

                <!-- GIỎ PHẢI -->
                <div class="math2-basket">

                    <img
                        src="/img/game/gio.png"
                        class="basket-bg"
                    >

                    <div class="basket-items">

                        ${rightHTML}

                    </div>

                </div>

            </div>

            <!-- ICON -->
            <div class="math2-center-icon">

                ✨

            </div>

        </div>

        `;
    },

    // =================================================
    // ĐÁP ÁN
    // =================================================
    getOptions: function (data) {

        let answers = [data.total];

        while (answers.length < 4) {

            let wrong =
                Math.floor(Math.random() * 10) + 1;

            if (!answers.includes(wrong)) {

                answers.push(wrong);
            }
        }

        answers.sort(() => Math.random() - 0.5);

        return answers;
    },

    // =================================================
    // STYLE BUTTON
    // =================================================
    styleOptionBtn: function (btn, value) {

        btn.textContent = value;

        btn.style.fontSize = '2rem';

        btn.style.fontWeight = 'bold';

        btn.style.color = '#ff5722';

        btn.style.background = 'white';

        btn.style.border =
            '4px solid #ffd180';

        btn.style.borderRadius =
            '20px';

        btn.style.minHeight =
            '70px';

        btn.style.padding =
            '10px';

        btn.style.boxShadow =
            '0 4px 10px rgba(0,0,0,0.15)';

        // transition mượt
        btn.style.transition =
            '0.2s';
    },

    // =================================================
    // AUDIO
    // =================================================
    getAudio: function () {

        return [];
    },

    // =================================================
    // CHECK
    // =================================================
    checkResult: function (selected, data) {

        return selected === data.total;
    }

});

// =====================================================
// CSS
// =====================================================

const math2Style =
document.createElement('style');

math2Style.innerHTML = `

/* =====================================================
WRAP
===================================================== */

.math2-wrap {

    width: 100%;
}

/* =====================================================
TITLE
===================================================== */

.math2-title {

    text-align: center;

    font-size:
        clamp(34px, 6vw, 52px);

    margin-bottom: 10px;
}

/* =====================================================
2 GIỎ
===================================================== */

.math2-groups {

    display: grid;

    grid-template-columns:
        1fr auto 1fr;

    align-items: center;

    gap: 10px;
}

/* =====================================================
PLUS
===================================================== */

.math2-plus {

    font-size: 70px;

    font-weight: bold;

    color: white;
}

/* =====================================================
GIỎ
===================================================== */

.math2-basket {

    position: relative;

    width: 100%;

    max-width: 380px;

    margin: auto;

    height: 360px;

    display: flex;

    justify-content: center;

    align-items: center;

    overflow: hidden;
}

/* =====================================================
ẢNH GIỎ
===================================================== */

.basket-bg {

    position: absolute;

    width: 100%;

    height: 100%;

    object-fit: contain;

    pointer-events: none;
}

/* =====================================================
VÙNG ITEM
===================================================== */

.basket-items {

    position: relative;

    z-index: 2;

    width: 78%;

    height: 62%;

    display: flex;

    flex-wrap: wrap;

    justify-content: center;

    align-content: center;

    gap: 8px;

    padding-top: 20px;
}

/* =====================================================
ITEM
===================================================== */

.math2-item {

    width: 54px;

    height: 54px;

    object-fit: contain;

    animation:
        math2Float 2s ease-in-out infinite;
}

/* =====================================================
ICON
===================================================== */

.math2-center-icon {

    text-align: center;

    font-size: 60px;

    margin-top: 5px;

    animation:
        sparkle 1.5s infinite;
}

/* =====================================================
ANIMATION FLOAT
===================================================== */

@keyframes math2Float {

    0% {

        transform:
            translateY(0px);
    }

    50% {

        transform:
            translateY(-8px);
    }

    100% {

        transform:
            translateY(0px);
    }
}

/* =====================================================
SPARKLE
===================================================== */

@keyframes sparkle {

    0% {

        transform:
            scale(1);
    }

    50% {

        transform:
            scale(1.15);
    }

    100% {

        transform:
            scale(1);
    }
}

/* =====================================================
MOBILE
===================================================== */

@media (max-width: 700px) {

    .math2-groups {

        grid-template-columns:
            1fr;
    }

    .math2-plus {

        font-size: 50px;

        text-align: center;
    }

    .math2-basket {

        height: 220px;

        max-width: 300px;
    }

    .basket-items {

        width: 80%;

        height: 60%;
    }

    .math2-item {

        width: 48px;

        height: 48px;
    }
}

`;

document.head.appendChild(math2Style);

// =====================================================
// HIỆU ỨNG ĐÚNG / SAI
// =====================================================

// Hook vào framework cũ
const oldHandleAnswer = handleAnswer;

handleAnswer = function (selected) {

    const btns =
        document.querySelectorAll('.option-btn');

    btns.forEach(btn => {

        // lấy text nút
        const value =
            parseInt(btn.textContent);

        // đúng
        if (value === currentGameData.total) {

            btn.style.background =
                '#4caf50';

            btn.style.color =
                'white';
        }

        // nút được bấm
        if (value === selected) {

            // sai
            if (selected !== currentGameData.total) {

                btn.style.background =
                    '#f44336';

                btn.style.color =
                    'white';

                // rung
                btn.animate(
                    [
                        { transform:'translateX(0)' },
                        { transform:'translateX(-8px)' },
                        { transform:'translateX(8px)' },
                        { transform:'translateX(0)' }
                    ],
                    {
                        duration:300
                    }
                );

                // reset màu
                setTimeout(() => {

                    btn.style.background =
                        'white';

                    btn.style.color =
                        '#ff5722';

                }, 500);
            }
        }

    });

    // gọi framework cũ
    oldHandleAnswer(selected);
};