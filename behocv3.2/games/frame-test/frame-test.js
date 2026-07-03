// =====================================================
// GAME TEST KHUNG
// Chỉ dùng để kiểm tra app-container + game-core.css
// =====================================================

registerGame('frame_test', {
    generateData() {
        return {
            answer: 'A'
        };
    },

    renderDisplay(data) {
        return `
            <div style="
                width:100%;
                max-width:720px;
                min-height:220px;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:12px;
                text-align:center;
            ">
                <div style="font-size:4rem;">🧪</div>
                <div style="font-size:2rem;font-weight:bold;color:#ff6f00;">
                    Test khung game
                </div>
                <div style="font-size:1.1rem;color:#555;line-height:1.5;">
                    Nếu bạn thấy viền ngoài giống menu,<br>
                    header không cuộn,<br>
                    đáp án mobile 2 cột và PC 4 cột<br>
                    là khung dùng chung đã chạy đúng.
                </div>
            </div>
        `;
    },

    getOptions() {
        return ['A', 'B', 'C', 'D'];
    },

    checkResult(selected, data) {
        return selected === data.answer;
    },

    getAudio() {
        return [];
    },

    getAnswerAudio() {
        return [];
    },

    styleOptionBtn(btn, option) {
        btn.textContent = option;
    }
});