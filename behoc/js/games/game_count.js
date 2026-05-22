// js/games/game_count.js
// Count: Tập đếm số lượng hình vẽ (Phạm vi từ 1 đến 10).

const ITEMS = [
    {id: 'tao', name: 'Quả Táo', img: 'tao.png'},
    {id: 'oto', name: 'Ô Tô', img: 'oto.png'},
    {id: 'cho', name: 'Con Chó', img: 'cho.png'},
    {id: 'meo', name: 'Con Mèo', img: 'meo.png'},
    {id: 'ga',  name: 'Con Gà', img: 'ga.png'},
    {id: 'vit', name: 'Con Vịt', img: 'vit.png'},
    {id: 'ong',  name: 'Con Ong', img: 'ong.png'},
    {id: 'bi', name: 'Viên bi', img: 'bi.png'},
    {id: 'sao', name: 'Ngôi Sao', img: 'sao.png'}
];

registerGame('count', {
    // 1. Sinh dữ liệu: 1 loại hình + số lượng ngẫu nhiên
    generateData: function() {
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        const qty = Math.floor(Math.random() * 10) + 1; 
        return { qty: qty, item: item };
    },

    // 2. Hiển thị: PHẢI HIỆN HÌNH ẢNH (Không dùng dấu ?)
    renderDisplay: function(data) {
        let html = '<div class="count-container">';
        for(let i=0; i < data.qty; i++) {
            // Animation hiện lần lượt
            html += `<img src="/img/game/${data.item.img}" class="game-img" style="animation-delay:${i*0.1}s">`;
        }
        html += '</div>';
        return html;
    },

    // 3. Đáp án: Các con số
    getOptions: function(data) {
        let correct = data.qty;
        let set = new Set([correct]);
        while(set.size < 4) set.add(Math.floor(Math.random() * 10) + 1);
        return Array.from(set);
    },

    // 4. Trang trí nút
    styleOptionBtn: function(btn, value) {
        btn.textContent = value;
        btn.style.fontSize = "3rem";
        btn.style.fontWeight = "bold";
    },

    // 5. Âm thanh: Không đọc gì cả để bé tự đếm (tránh lộ đáp án)
    getAudio: function(data) {
        return []; 
    },

    // 6. Kiểm tra
    checkResult: function(selected, data) {
        return selected === data.qty;
    }
});