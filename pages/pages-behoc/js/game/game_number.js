// Đăng ký với Core: Tên game là 'listen_number'
registerGame('listen_number', {
    // 1. Sinh dữ liệu
    generateData: function() {
        return Math.floor(Math.random() * 30); // Trả về 1 số ngẫu nhiên
    },

    // 2. Hiển thị đề bài (HTML)
    renderDisplay: function(num) {
        return `
            <div class="big-icon-question">🔊</div>
            <div class="hint-text">Số mấy?</div>
        `;
    },

    // 3. Tạo danh sách đáp án
    getOptions: function(correctNum) {
        let set = new Set([correctNum]);
        while(set.size < 4) {
            set.add(Math.floor(Math.random() * 30));
        }
        return Array.from(set);
    },

    // 4. Trang trí nút đáp án
    styleOptionBtn: function(btn, value) {
        btn.textContent = value;
    },

    // 5. Lấy file âm thanh đề bài
    getAudio: function(num) {
        // Logic đọc số (tách từ code cũ của anh)
        let list = [];
        if (num < 10) list.push(num + ".mp3");
        else if (num === 10) list.push("10.mp3");
        else if (num > 10 && num < 20) {
            list.push("10.mp3");
            let unit = num % 10;
            if (unit === 5) list.push("lam.mp3"); else if (unit === 1) list.push("1.mp3"); else list.push(unit + ".mp3");
        } else {
            let ten = Math.floor(num / 10);
            let unit = num % 10;
            list.push(ten + ".mp3"); list.push("muoi.mp3");
            if (unit > 0) {
                if (unit === 1) list.push("mot.mp3"); else if (unit === 5) list.push("lam.mp3"); else if (unit === 4) list.push("tu.mp3"); else list.push(unit + ".mp3");
            }
        }
        return list;
    },

    // 6. Kiểm tra đúng sai
    checkResult: function(selected, correct) {
        return selected === correct;
    }
});