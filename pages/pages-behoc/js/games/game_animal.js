registerGame('match_animal', {
    generateData: function() {
        // Lấy ngẫu nhiên 1 con vật từ danh sách ITEMS (đã khai báo ở trên hoặc khai báo lại)
        // Lưu ý: Nếu ITEMS khai báo ở game_count.js thì ở đây không thấy được.
        // Tốt nhất nên copy biến ITEMS vào đây hoặc để ITEMS ở core.js (biến toàn cục)
        // Để đơn giản, em khai báo lại ITEMS ở đây cho chắc chắn chạy:
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

    renderDisplay: function(item) {
        return `
            <div class="big-icon-question">🔊</div>
            <div class="hint-text">${item.name}</div>
        `;
    },

    getOptions: function(correctItem) {
        // Cần list ITEMS đầy đủ để lấy đáp án sai
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

    styleOptionBtn: function(btn, item) {
        // Hiển thị hình ảnh thay vì số
        btn.innerHTML = `<img src="/img/game/${item.img}" style="height:60px; object-fit:contain;">`;
    },

    getAudio: function(item) {
        return [item.id + ".mp3"];
    },

    checkResult: function(selected, correct) {
        return selected.id === correct.id;
    }
});