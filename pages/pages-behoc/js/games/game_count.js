// Dữ liệu dùng chung cho các game hình ảnh
const ITEMS = [
    {id: 'tao', name: 'Quả Táo', img: 'tao.png'},
    {id: 'oto', name: 'Ô Tô', img: 'oto.png'},
    {id: 'cho', name: 'Con Chó', img: 'cho.png'},
    {id: 'meo', name: 'Con Mèo', img: 'meo.png'},
    {id: 'ga',  name: 'Con Gà', img: 'ga.png'},
    {id: 'vit', name: 'Con Vịt', img: 'vit.png'},
    {id: 'sao', name: 'Ngôi Sao', img: 'sao.png'}
];
const PATH_IMG = "/img/game/"; // Đảm bảo đường dẫn ảnh đúng

registerGame('count', {
    generateData: function() {
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        const qty = Math.floor(Math.random() * 10) + 1; 
        return { qty: qty, item: item };
    },

    renderDisplay: function(data) {
        let html = '<div class="count-container">';
        for(let i=0; i < data.qty; i++) {
            // Hiệu ứng hiện lần lượt từng hình
            html += `<img src="${PATH_IMG + data.item.img}" class="game-img" style="animation-delay:${i*0.1}s">`;
        }
        html += '</div>';
        return html;
    },

    getOptions: function(data) {
        let correct = data.qty;
        let set = new Set([correct]);
        // Tạo thêm 3 đáp án sai ngẫu nhiên từ 1-10
        while(set.size < 4) set.add(Math.floor(Math.random() * 10) + 1);
        return Array.from(set);
    },

    styleOptionBtn: function(btn, value) {
        btn.textContent = value; // Hiển thị số
    },

    getAudio: function(data) {
        return []; // Game đếm thường không đọc số trước để bé tự đếm
    },

    checkResult: function(selected, data) {
        return selected === data.qty;
    }
});