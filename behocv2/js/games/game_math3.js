// =====================================================
// GAME: MATH2
// Bé học cộng trừ bằng hình ảnh
// Không dùng layout framework cũ
// Responsive riêng
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

        // random cộng hoặc trừ
        const operator =
            Math.random() < 0.5
            ? '+'
            : '-';

        let left;
        let right;
        let answer;

        // =============================================
        // PHÉP CỘNG
        // =============================================

        if(operator === '+'){

            left =
                Math.floor(Math.random() * 5) + 1;

            right =
                Math.floor(Math.random() * 5) + 1;

            answer = left + right;
        }

        // =============================================
        // PHÉP TRỪ
        // =============================================

        else{

            left =
                Math.floor(Math.random() * 5) + 5;

            right =
                Math.floor(Math.random() * 4) + 1;

            answer = left - right;
        }

        return {

            operator,
            left,
            right,
            answer,
            item
        };
    },

    // =================================================
    // RENDER
    // =================================================

    renderDisplay: function (data) {

        // ẨN LOA
        const replayBtn =
            document.querySelector('.replay-btn');

        if(replayBtn){

            replayBtn.style.display = 'none';
        }

        // =============================================
        // ITEM TRÁI
        // =============================================

        let leftHTML = '';

        for(let i=0;i<data.left;i++){

            leftHTML += `

                <img
                    src="/img/game/${data.item.img}"
                    class="math2-item"
                    style="
                        animation-delay:${i * 0.08}s
                    "
                >

            `;
        }

        // =============================================
        // ITEM PHẢI
        // =============================================

        let rightHTML = '';

        for(let i=0;i<data.right;i++){

            // phép cộng
            if(data.operator === '+'){

                rightHTML += `

                    <img
                        src="/img/game/${data.item.img}"
                        class="math2-item"
                        style="
                            animation-delay:${i * 0.08}s
                        "
                    >

                `;
            }

            // phép trừ
            else{

                rightHTML += `

                    <img
                        src="/img/game/${data.item.id}line.png"
                        class="math2-item math2-minus-item"
                        style="
                            animation-delay:${i * 0.08}s
                        "
                    >

                `;
            }
        }

        // =============================================
        // TẠO ĐÁP ÁN
        // =============================================

        let answers = [data.answer];

        while(answers.length < 4){

            let wrong =
                Math.floor(Math.random() * 10) + 1;

            if(
                !answers.includes(wrong)
            ){

                answers.push(wrong);
            }
        }

        answers.sort(
            () => Math.random() - 0.5
        );

        // =============================================
        // HTML ĐÁP ÁN
        // =============================================

        let answerHTML = '';

        answers.forEach(value => {

            answerHTML += `

                <button
                    class="math2-answer-btn"
                    data-value="${value}"
                >

                    ${value}

                </button>

            `;
        });

        // =============================================
        // HTML CHÍNH
        // =============================================

        return `

        <div class="math2-wrap">

            <!-- QUESTION -->
            <div class="math2-question">

                <!-- LEFT -->
                <div
                    class="math2-side"
                    id="math2-left"
                >

                    ${leftHTML}

                </div>

                <!-- OPERATOR -->
                <div
                    class="math2-operator"
                    id="math2-operator"
                >

                    ${data.operator}

                </div>

                <!-- RIGHT -->
                <div
                    class="math2-side"
                    id="math2-right"
                >

                    ${rightHTML}

                </div>

            </div>

            <!-- ANSWER -->
            <div class="math2-answers">

                ${answerHTML}

            </div>

        </div>

        `;
    },

    // =================================================
    // KHÔNG DÙNG OPTION CŨ
    // =================================================

    getOptions: function () {

        return [];
    },

    styleOptionBtn: function () {},

    getAudio: function () {

        return [];
    },

    checkResult: function () {

        return true;
    }

});

// =====================================================
// CLICK ANSWER
// =====================================================

document.addEventListener(

    'click',

    function(e){

        const btn =
            e.target.closest(
                '.math2-answer-btn'
            );

        if(!btn) return;

        // khóa spam
        if(btn.disabled) return;

        const value =
            parseInt(
                btn.dataset.value
            );

        const data =
            currentGameData;

        // =============================================
        // ĐÚNG
        // =============================================

        if(value === data.answer){

            document
                .querySelectorAll(
                    '.math2-answer-btn'
                )
                .forEach(b => {

                    b.disabled = true;
                });

            btn.classList.add(
                'correct'
            );

            // audio đúng
            let correctAudio =
                new Audio(

                    Math.random() < 0.5

                    ? '/file/mp3/game/gioi qua.mp3'

                    : '/file/mp3/game/chinh xac.mp3'
                );

            correctAudio.play()
            .catch(()=>{});

            // =========================================
            // PHÉP CỘNG
            // =========================================

            if(data.operator === '+'){

                const operator =
                    document.getElementById(
                        'math2-operator'
                    );

                operator.style.opacity = '0';

                document
                    .getElementById(
                        'math2-left'
                    )
                    .classList.add(
                        'merge-left'
                    );

                document
                    .getElementById(
                        'math2-right'
                    )
                    .classList.add(
                        'merge-right'
                    );
            }

            // =========================================
            // PHÉP TRỪ
            // =========================================

            else{

                const leftItems =
                    document.querySelectorAll(
                        '#math2-left .math2-item'
                    );

                // xóa item cuối
                for(

                    let i = leftItems.length - 1;

                    i >=
                    leftItems.length - data.right;

                    i--
                ){

                    leftItems[i]
                    .classList.add(
                        'remove-item'
                    );
                }

                // ẩn item line
                document
                    .querySelectorAll(
                        '.math2-minus-item'
                    )
                    .forEach(el => {

                        el.classList.add(
                            'remove-item'
                        );
                    });
            }

            // câu mới
            setTimeout(() => {

                renderPracticeMode();

            }, 1400);
        }

        // =============================================
        // SAI
        // =============================================

        else{

            btn.classList.add('wrong');

            let wrongAudio =
                new Audio(
                    '/file/mp3/game/sai roi.mp3'
                );

            wrongAudio.play()
            .catch(()=>{});

            btn.animate(
                [
                    {
                        transform:
                        'translateX(0px)'
                    },

                    {
                        transform:
                        'translateX(-6px)'
                    },

                    {
                        transform:
                        'translateX(6px)'
                    },

                    {
                        transform:
                        'translateX(0px)'
                    }
                ],
                {
                    duration:300
                }
            );

            setTimeout(() => {

                btn.classList.remove(
                    'wrong'
                );

            }, 700);
        }
    }
);

// =====================================================
// CSS
// =====================================================

const style =
document.createElement('style');

style.innerHTML = `

/* =====================================================
ẨN LOA
===================================================== */

.replay-btn{

    display:none !important;
}

/* =====================================================
WRAP
===================================================== */

.math2-wrap{

    width:100%;

    height:100%;

    display:flex;

    flex-direction:column;

    justify-content:space-between;

    padding:10px;

    box-sizing:border-box;
}

/* =====================================================
QUESTION
===================================================== */

.math2-question{

    flex:1;

    display:flex;

    align-items:center;

    justify-content:center;

    gap:30px;

    overflow:hidden;
}

/* =====================================================
SIDE
===================================================== */

.math2-side{

    flex:1;

    display:flex;

    flex-wrap:wrap;

    justify-content:center;

    align-items:center;

    gap:10px;

    min-height:180px;
}

/* =====================================================
ITEM
===================================================== */

.math2-item{

    width:60px;

    height:60px;

    object-fit:contain;

    animation:
        math2Float 2s ease-in-out infinite;
}

/* =====================================================
OPERATOR
===================================================== */

.math2-operator{

    font-size:70px;

    font-weight:bold;

    color:#ff9800;

    transition:0.4s;
}

/* =====================================================
ANSWERS
===================================================== */

.math2-answers{

    display:grid;

    grid-template-columns:
        repeat(4,1fr);

    gap:12px;

    margin-top:10px;
}

/* =====================================================
ANSWER BTN
===================================================== */

.math2-answer-btn{

    min-height:70px;

    border:none;

    border-radius:20px;

    background:white;

    font-size:2rem;

    font-weight:bold;

    color:#ff5722;

    box-shadow:
        0 4px 10px rgba(0,0,0,0.15);

    transition:0.2s;
}

/* =====================================================
CORRECT
===================================================== */

.math2-answer-btn.correct{

    background:#4caf50;

    color:white;
}

/* =====================================================
WRONG
===================================================== */

.math2-answer-btn.wrong{

    background:#f44336;

    color:white;
}

/* =====================================================
FLOAT
===================================================== */

@keyframes math2Float{

    0%{

        transform:
            translateY(0px);
    }

    50%{

        transform:
            translateY(-8px);
    }

    100%{

        transform:
            translateY(0px);
    }
}

/* =====================================================
MERGE
===================================================== */

.merge-left{

    animation:
        mergeLeft 1s forwards;
}

.merge-right{

    animation:
        mergeRight 1s forwards;
}

@keyframes mergeLeft{

    to{

        transform:
            translateX(40%);
    }
}

@keyframes mergeRight{

    to{

        transform:
            translateX(-40%);
    }
}

/* =====================================================
REMOVE
===================================================== */

.remove-item{

    animation:
        removeItem 0.7s forwards;
}

@keyframes removeItem{

    to{

        opacity:0;

        transform:
            scale(0);
    }
}

/* =====================================================
PORTRAIT
===================================================== */

@media (orientation:portrait){

    .math2-question{

        flex-direction:column;

        gap:10px;
    }

    .math2-side{

        min-height:120px;
    }

    .math2-item{

        width:50px;
        height:50px;
    }

    .math2-answers{

        grid-template-columns:
            repeat(2,1fr);
    }

    .math2-answer-btn{

        min-height:60px;

        font-size:1.6rem;
    }

    .math2-operator{

        font-size:50px;
    }
}

`;

document.head.appendChild(style);