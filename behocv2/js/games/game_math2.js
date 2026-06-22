// =====================================================
// GAME: MATH2 - BÉ TÁCH GỘP
// UPDATE:
// ✔ Giỏ cố định
// ✔ Chứa tối đa 9 item
// ✔ Item không tự co nhỏ
// ✔ Đáp án đỏ/xanh
// ✔ Animation rung sai
// ✔ Đồng đều 2 bên
// ✔ Đồng đều 2 bên
// =====================================================

registerGame('math2', {

    // =================================================
    // TẠO DỮ LIỆU
    // =================================================
    generateData: function () {

        const allowItems = ITEMS.filter(item =>
            [
                'tao2',
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
        const replayBtn = document.querySelector('.replay-btn');

        if (replayBtn) {
            replayBtn.style.display = 'none';
        }

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

                    <div class="basket-items items-${data.left}">

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

                    <div class="basket-items items-${data.right}">

                        ${rightHTML}

                    </div>

                </div>

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
        btn.classList.add('option-btn');

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
    padding-top: 10px;
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
    margin-top: 10px;

    gap: 10px;
}

/* =====================================================
PLUS
===================================================== */
.math2-plus {

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:70px;

    font-weight:bold;

    color:#ff9800;

    text-shadow:
        0 2px 4px rgba(0,0,0,0.25);

    height:100%;
}

/* =====================================================
GIỎ
===================================================== */

.math2-basket {

    position: relative;

    width: 100%;

    max-width: 520px;

    margin: auto;

    height: 440px;

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

    display: none;
}

/* =====================================================
VÙNG ITEM
===================================================== */

.basket-items {

    position: relative;

    z-index: 2;

    width: 82%;

    height: 68%;

    display: grid;

    justify-items: center;

    align-items: center;

    gap: 4px;

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



.display-area {

    overflow: hidden !important;
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



/* =====================================================
MOBILE
===================================================== */

/* =========================================
PC LỚN
========================================= */

.math2-basket {

    height: 380px;
}

/* =========================================
TABLET DỌC + MOBILE
========================================= */

@media (max-width: 900px) {

    .math2-groups {

        grid-template-columns: 1fr;
    }

    .math2-basket {

        height: 240px;

        max-width: 660px;
    }

    .math2-item {

        width: 44px;
        height: 44px;
    }


    #options-grid {

        grid-template-columns:
            repeat(2, 1fr);
    }

    .option-btn {

    min-height: 60px !important;

    font-size: 1.6rem !important;

    padding: 6px !important;
    }
}

/* =========================================
ĐIỆN THOẠI NHỎ
========================================= */

@media (max-width: 500px) {

    .math2-basket {

        height: 170px;

        max-width: 260px;
    }

    .math2-item {

        width: 42px;
        height: 42px;
    }

    .math2-plus {

        font-size: 42px;
    }
}

@media (min-width: 901px) {

    #options-grid {

        grid-template-columns:
            repeat(4, 1fr);
    }
}


/* =========================================
1 2 3 ITEM = 1 HÀNG
========================================= */

.items-1,
.items-2,
.items-3 {

    grid-template-columns:
        repeat(3, 1fr);
}

/* =========================================
4 5 6 ITEM = 2 HÀNG
========================================= */

.items-4,
.items-5,
.items-6 {

    grid-template-columns:
        repeat(3, 1fr);
}

/* =========================================
7 8 9 ITEM = 3 HÀNG
========================================= */

.items-7,
.items-8,
.items-9 {

    grid-template-columns:
        repeat(3, 1fr);
}

.items-1 img {

    grid-column: 2;
}

.items-2 img:nth-child(1) {

    grid-column: 1;
}

.items-2 img:nth-child(2) {

    grid-column: 3;
}

.items-4 img:nth-child(4) {

    grid-column: 2;
}

.items-5 img:nth-child(4) {

    grid-column: 1;
}

.items-5 img:nth-child(5) {

    grid-column: 3;
}

.items-7 img:nth-child(7) {

    grid-column: 2;
}

.items-8 img:nth-child(7) {

    grid-column: 1;
}

.items-8 img:nth-child(8) {

    grid-column: 3;
}
.items-7 img:nth-child(7){

    grid-column:2;
}

.items-8 img:nth-child(7){

    grid-column:1;
}

.items-8 img:nth-child(8){

    grid-column:3;
}
.items-9 .math2-item{

    width:40px;
    height:40px;
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

// =====================================================
// EFFECT ĐÚNG / SAI
// =====================================================

document.addEventListener('click', function(e){

    const btn = e.target.closest('.option-btn');

    if(!btn) return;

    const value =
        parseInt(btn.textContent);

    // ĐÚNG
    if(value === currentGameData.total){

        btn.classList.add('correct');

        setTimeout(()=>{

            btn.classList.remove('correct');

        }, 800);
    }

    // SAI
    else{

        btn.classList.add('wrong');

        btn.animate(
            [
                { transform:'translateX(0px)' },
                { transform:'translateX(-6px)' },
                { transform:'translateX(6px)' },
                { transform:'translateX(0px)' }
            ],
            {
                duration:300
            }
        );

        setTimeout(()=>{

            btn.classList.remove('wrong');

        }, 700);
    }
});