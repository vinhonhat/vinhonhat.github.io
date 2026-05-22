// js/games/game_math.js
// Math: Bé làm tính cộng, trừ cơ bản (Phạm vi trong khoảng 10)

registerGame('math', {
    // 1. Sinh phép tính (Cộng hoặc Trừ trong phạm vi 10)
    generateData: function() {
        const isPlus = Math.random() > 0.5; // 50% là cộng, 50% là trừ
        let a, b, result, operator;

        if (isPlus) {
            // Phép cộng: a + b <= 10
            a = Math.floor(Math.random() * 6); // 0 đến 5
            b = Math.floor(Math.random() * 6); // 0 đến 5
            result = a + b;
            operator = '+';
        } else {
            // Phép trừ: a - b >= 0
            a = Math.floor(Math.random() * 10) + 1; // 1 đến 10
            b = Math.floor(Math.random() * (a + 1)); // b <= a
            result = a - b;
            operator = '-';
        }

        return { a: a, b: b, operator: operator, result: result };
    },

    // 2. Hiển thị đề bài
    renderDisplay: function(data) {
        return `
            <div class="big-icon-question">🧮</div>
            <div class="hint-text" style="font-size: 3rem;">
                ${data.a} ${data.operator} ${data.b} = ?
            </div>
        `;
    },

    // 3. Tạo đáp án (1 đúng, 3 sai)
    getOptions: function(data) {
        let set = new Set([data.result]);
        while(set.size < 4) {
            // Tạo số ngẫu nhiên từ 0 đến 15 để làm đáp án nhiễu
            let wrong = Math.floor(Math.random() * 15);
            set.add(wrong);
        }
        return Array.from(set);
    },

    // 4. Trang trí nút
    styleOptionBtn: function(btn, value) {
        btn.textContent = value;
        btn.style.color = '#d35400'; // Màu cam đậm cho số
    },

    // 5. Âm thanh (Chỉ đọc kết quả hoặc tiếng ting tong)
    getAudio: function(data) {
        // Game toán hiện tại chưa có file âm đọc phép tính, 
        // nên ta chỉ cần im lặng hoặc để bé tự tính.
        return []; 
    },

    // 6. Kiểm tra
    checkResult: function(selected, data) {
        return selected === data.result;
    }
});