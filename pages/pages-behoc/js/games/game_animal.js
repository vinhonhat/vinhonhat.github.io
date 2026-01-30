// js/games/game_animal.js

registerGame('match_animal', {
    // 1. Sinh dữ liệu: Lấy 1 con vật ngẫu nhiên
    generateData: function() {
        // Danh sách con vật (nên đồng bộ với file game_count hoặc khai báo lại ở đây)
        const LOCAL_ITEMS = [
            {id: 'tao', name: 'Quả Táo', img: 'tao.png'},
            {id: 'oto', name: 'Ô Tô', img: 'oto.png'},
            {id: 'cho', name: 'Con Chó', img: 'cho.png'},
            {id: 'meo', name: 'Con Mèo', img: 'meo.png'},
            {id: 'ga',  name: 'Con Gà', img: 'ga.png'},
            {id: 'vit', name: 'Con Vịt', img: 'vit.png'},
            {id: 'sao', name: 'Ngôi Sao', img: 'sao.png'}
        ];
        return LOCAL_ITEMS[Math.floor(Math.random() * LOCAL_ITEMS.length)];
    },

    // 2. Hiển thị đề bài: HIỆN HÌNH ẢNH TO (Thay vì chữ)
    renderDisplay: function(item) {
        // Bấm vào hình vẫn phát tiếng đọc tên con vật
        return `
            <div onclick="playQuestionAudio()" style="cursor:pointer; text-align:center;">
                <img src="/img/game/${item.img}" 
                     style="width: 180px; height: 180px; object-fit: contain; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1)); animation: popIn 0.5s;">
            </div>
        `;
    },

    // 3. Tạo đáp án: 1 hình đúng + 3 hình sai
    getOptions: function(correctItem) {
        const LOCAL_ITEMS = [
            {id: 'tao', name: 'Quả Táo', img: 'tao.png'},
            {id: 'oto', name: 'Ô Tô', img: 'oto.png'},
            {id: 'cho', name: 'Con Chó', img: 'cho.png'},
            {id: 'meo', name: 'Con Mèo', img: 'meo.png'},
            {id: 'ga',  name: 'Con Gà', img: 'ga.png'},
            {id: 'vit', name: 'Con Vịt', img: 'vit.png'},
            {id: 'sao', name: 'Ngôi Sao', img: 'sao.png'}
        ];
        
        let set = new Set([correctItem]);
        while(set.size < 4) {
            set.add(LOCAL_ITEMS[Math.floor(Math.random() * LOCAL_ITEMS.length)]);
        }
        return Array.from(set);
    },

    // 4. Trang trí nút đáp án: Hiện hình ảnh nhỏ
    styleOptionBtn: function(btn, item) {
        btn.innerHTML = `<img src="/img/game/${item.img}" style="height:80px; width:80px; object-fit:contain;">`;
        btn.style.padding = "5px";
    },

    // 5. Âm thanh: Đọc tên con vật (VD: "Con chó")
    getAudio: function(item) {
        return [item.id + ".mp3"];
    },

    // 6. Kiểm tra kết quả
    checkResult: function(selected, correct) {
        return selected.id === correct.id;
    }
});