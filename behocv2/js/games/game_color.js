// js/games/game_color.js
// Color: Nhận biết các màu sắc (Đỏ, Xanh, Vàng, Tím, Đen...).

const GAME_COLORS = [
    {id: 'do', name: 'Màu Đỏ', hex: '#FF5252'},
    {id: 'xanhduong', name: 'Xanh Dương', hex: '#448AFF'},
    {id: 'xanhla', name: 'Xanh Lá', hex: '#69F0AE'},
    {id: 'vang', name: 'Màu Vàng', hex: '#FFD740'},
    {id: 'tim', name: 'Màu Tím', hex: '#E040FB'},
    {id: 'den', name: 'Màu Đen', hex: '#333333'}
];

registerGame('color', {
    // 1. Sinh màu ngẫu nhiên
    generateData: function() {
        return GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
    },

    // 2. Hiển thị: Dấu ? (Bấm vào để nghe lại)
    renderDisplay: function(colorObj) {
        // Lưu ý: Không tô màu background dấu ? để tránh lộ đáp án
        return `<div class="big-question-mark" onclick="playQuestionAudio()">?</div>`;
    },

    // 3. Đáp án: Các ô màu
    getOptions: function(correctObj) {
        let set = new Set([correctObj]);
        while(set.size < 4) {
            set.add(GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)]);
        }
        return Array.from(set);
    },

    // 4. Trang trí nút: Tô màu cho nút đáp án
    styleOptionBtn: function(btn, colorObj) {
        btn.style.backgroundColor = colorObj.hex;
        btn.style.border = '4px solid #fff';
        btn.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
    },

    // 5. Âm thanh: Đọc tên màu (Ví dụ: do.mp3)
    getAudio: function(colorObj) {

        return [

            //"/file/mp3/game/color/mau.mp3",

            "/file/mp3/game/color/" +
            colorObj.id +
            ".mp3"
        ];
    },

    // 6. Kiểm tra
    checkResult: function(selected, correct) {
        return selected.id === correct.id;
    }
});
