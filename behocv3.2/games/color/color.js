// =====================================================
// GAME: MATH4 - BÉ TÁCH GỘP (BẢN THỬ NGHIỆM CÓ PHÉP TRỪ)
// UPDATE: Nếu phép trừ thì vế phải tự đổi sang ảnh tao2.png
// =====================================================

registerGame('math4', {

    // =================================================
    // TẠO DỮ LIỆU
    // =================================================
    generateData: function () {
        const allowItems = ITEMS.filter(item =>
            ['tao2', 'tao', 'ca'].includes(item.id)
        );

        const item = allowItems[Math.floor(Math.random() * allowItems.length)];

        // Chọn ngẫu nhiên phép tính: '+' hoặc '-'
        const operation = Math.random() > 0.5 ? '+' : '-';
        let left = 1;
        let right = 1;
        let result = 2;

        if (operation === '+') {
            // PHÉP CỘNG: Tổng tối đa = 10
            left = Math.floor(Math.random() * 9) + 1;
            right = Math.floor(Math.random() * 9) + 1;
            while (left + right > 10) {
                right = Math.floor(Math.random() * 9) + 1;
            }
            result = left + right;
        } else {
            // PHÉP TRỪ: Số bên trái (số bị trừ) từ 2 đến 10
            left = Math.floor(Math.random() * 9) + 2; 
            // Số bên phải (số trừ) phải nhỏ hơn số bên trái để tránh ra quả bằng 0 hoặc âm
            right = Math.floor(Math.random() * (left - 1)) + 1; 
            result = left - right;
        }

        return {
            left: left,
            right: right,
            operation: operation, 
            result: result,       
            item: item
        };
    },

    // =================================================
    // HIỂN THỊ
    // =================================================
    renderDisplay: function (data) {
        const replayBtn = document.querySelector('.replay-btn');
        if (replayBtn) {
            replayBtn.style.display = 'none';
        }

        // Xác định ảnh cho giỏ bên phải dựa vào phép tính
        let rightItemImg = data.item.img;
        if (data.operation === '-') {
            rightItemImg = 'tao2.png'; // Cố định ảnh tao2.png khi là phép trừ
        }

        // ITEM TRÁI (Giữ nguyên theo item ngẫu nhiên)
        let leftHTML = '';
        for (let i = 0; i < data.left; i++) {
            leftHTML += `<img src="${imgPath(data.item.img)}" class="math2-item" style="animation-delay:${i * 0.15}s">`;
        }

        // ITEM PHẢI (Tự động đổi ảnh dựa trên biến rightItemImg vừa check ở trên)
        let rightHTML = '';
        for (let i = 0; i < data.right; i++) {
            rightHTML += `<img src="${imgPath(rightItemImg)}" class="math2-item" style="animation-delay:${i * 0.15}s">`;
        }

        return `
        <div class="math2-wrap">
            <div class="math2-groups">
                <div class="math2-basket">
                    <img src="${imgPath('gio.png')}" class="basket-bg">
                    <div class="basket-items items-${data.left}">
                        ${leftHTML}
                    </div>
                </div>

                <div class="math2-plus">
                    ${data.operation}
                </div>

                <div class="math2-basket">
                    <img src="${imgPath('gio.png')}" class="basket-bg">
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
        let answers = [data.result];
        while (answers.length < 4) {
            let wrong = Math.floor(Math.random() * 10) + 1;
            if (!answers.includes(wrong)) {
                answers.push(wrong);
            }
        }
        answers.sort(() => Math.random() - 0.5);
        return answers;
    },

    styleOptionBtn: function (btn, value) {
        btn.textContent = value;
        btn.classList.add('option-btn');
        btn.style.fontSize = '2rem';
        btn.style.fontWeight = 'bold';
        btn.style.color = '#ff5722';
        btn.style.background = 'white';
        btn.style.border = '4px solid #ffd180';
        btn.style.borderRadius = '20px';
        btn.style.minHeight = '70px';
        btn.style.padding = '10px';
        btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
        btn.style.transition = '0.2s';
    },

    getAudio: function () { return []; },

    checkResult: function (selected, data) {
        return selected === data.result;
    }
});

// =====================================================
// CSS CHO TRÒ CHƠI
// =====================================================
if (!document.getElementById('math4-style-block')) {
    const math4Style = document.createElement('style');
    math4Style.id = 'math4-style-block';
    math4Style.innerHTML = `
    .math2-wrap { width: 100%; padding-top: 10px; }
    .math2-groups { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-top: 10px; gap: 10px; }
    .math2-plus { display:flex; justify-content:center; align-items:center; font-size:70px; font-weight:bold; color:#ff9800; text-shadow: 0 2px 4px rgba(0,0,0,0.25); height:100%; }
    .math2-basket { position: relative; width: 100%; max-width: 520px; margin: auto; height: 380px; display: flex; justify-content: center; align-items: center; overflow: hidden; }
    .basket-bg { position: absolute; width: 100%; height: 100%; object-fit: contain; pointer-events: none; display: none; }
    .basket-items { position: relative; z-index: 2; width: 82%; height: 68%; display: grid; justify-items: center; align-items: center; gap: 4px; padding-top: 20px; }
    .math2-item { width: 54px; height: 54px; object-fit: contain; animation: math4Float 2s ease-in-out infinite; }
    .display-area { overflow: hidden !important; }
    @keyframes math4Float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }

    @media (max-width: 900px) {
        .math2-groups { grid-template-columns: 1fr; }
        .math2-basket { height: 240px; max-width: 660px; }
        .math2-item { width: 44px; height: 44px; }
        #options-grid { grid-template-columns: repeat(2, 1fr); }
        .option-btn { min-height: 60px !important; font-size: 1.6rem !important; padding: 6px !important; }
    }
    @media (max-width: 500px) {
        .math2-basket { height: 170px; max-width: 260px; }
        .math2-item { width: 42px; height: 42px; }
        .math2-plus { font-size: 42px; }
    }
    @media (min-width: 901px) { #options-grid { grid-template-columns: repeat(4, 1fr); } }

    .items-1, .items-2, .items-3 { grid-template-columns: repeat(3, 1fr); }
    .items-4, .items-5, .items-6 { grid-template-columns: repeat(3, 1fr); }
    .items-7, .items-8, .items-9 { grid-template-columns: repeat(3, 1fr); }
    .items-1 img { grid-column: 2; }
    .items-2 img:nth-child(1) { grid-column: 1; }
    .items-2 img:nth-child(2) { grid-column: 3; }
    .items-4 img:nth-child(4) { grid-column: 2; }
    .items-5 img:nth-child(4) { grid-column: 1; }
    .items-5 img:nth-child(5) { grid-column: 3; }
    .items-7 img:nth-child(7) { grid-column: 2; }
    .items-8 img:nth-child(7) { grid-column: 1; }
    .items-8 img:nth-child(8) { grid-column: 3; }
    .items-9 .math2-item { width:40px; height:40px; }
    `;
    document.head.appendChild(math4Style);
}

// =====================================================
// HIỆU ỨNG ĐÚNG / SAI (AN TOÀN CHO MATH4)
// =====================================================
if (typeof oldHandleAnswerMath4 === 'undefined') {
    window.oldHandleAnswerMath4 = handleAnswer;
    handleAnswer = function (selected) {
        if (typeof currentGameId !== 'undefined' && currentGameId === 'math4') {
            const btns = document.querySelectorAll('.option-btn');
            btns.forEach(btn => {
                const value = parseInt(btn.textContent);
                if (value === currentGameData.result) {
                    btn.style.background = '#4caf50';
                    btn.style.color = 'white';
                }
                if (value === selected && selected !== currentGameData.result) {
                    btn.style.background = '#f44336';
                    btn.style.color = 'white';
                    btn.animate([
                        { transform: 'translateX(0)' },
                        { transform: 'translateX(-8px)' },
                        { transform: 'translateX(8px)' },
                        { transform: 'translateX(0)' }
                    ], { duration: 300 });

                    setTimeout(() => {
                        btn.style.background = 'white';
                        btn.style.color = '#ff5722';
                    }, 500);
                }
            });
        }
        oldHandleAnswerMath4(selected);
    };
}

document.addEventListener('click', function (e) {
    if (typeof currentGameId === 'undefined' || currentGameId !== 'math4') return;
    const btn = e.target.closest('.option-btn');
    if (!btn) return;

    const value = parseInt(btn.textContent);
    if (value === currentGameData.result) {
        btn.classList.add('correct');
        setTimeout(() => { btn.classList.remove('correct'); }, 800);
    } else {
        btn.classList.add('wrong');
        btn.animate([
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-6px)' },
            { transform: 'translateX(6px)' },
            { transform: 'translateX(0px)' }
        ], { duration: 300 });
        setTimeout(() => { btn.classList.remove('wrong'); }, 700);
    }
});