// js/games/game_animal.js
// Animal: Nhận biết, đọc tên các con vật và hoa quả qua hình ảnh + âm thanh.

// Danh sách đầy đủ các con vật và hoa quả từ ảnh trong kho img
const ANIMAL_ITEMS = [
    {id: 'bo', name: 'Con Bò', img: 'bo.png'},
    {id: 'cho', name: 'Con Chó', img: 'cho.png'},
    {id: 'chuoi', name: 'Quả Chuối', img: 'chuoi.png'},
    {id: 'chuot', name: 'Con Chuột', img: 'chuot.png'},
    {id: 'de', name: 'Con Dê', img: 'de.png'},
    {id: 'duahau', name: 'Dưa Hấu', img: 'duahau.png'},
    {id: 'ech', name: 'Con Ếch', img: 'ech.png'},
    {id: 'ga',  name: 'Con Gà', img: 'ga.png'},
    {id: 'giun', name: 'Con Giun', img: 'giun.png'},
    {id: 'heo', name: 'Con Heo', img: 'heo.png'},
    {id: 'khi', name: 'Con Khỉ', img: 'khi.png'},
    {id: 'meo', name: 'Con Mèo', img: 'meo.png'},
    {id: 'ngua', name: 'Con Ngựa', img: 'ngua.png'},
    {id: 'oto', name: 'Ô Tô', img: 'oto.png'},
    {id: 'ran', name: 'Con Rắn', img: 'ran.png'},
    {id: 'rong', name: 'Con Rồng', img: 'rong.png'},
    {id: 'sao', name: 'Ngôi Sao', img: 'sao.png'},
    {id: 'sutu', name: 'Sư Tử', img: 'sutu.png'},
    {id: 'tao', name: 'Quả Táo', img: 'tao.png'},
    {id: 'tho', name: 'Con Thỏ', img: 'tho.png'},
    {id: 'trau', name: 'Con Trâu', img: 'trau.png'},
    {id: 'vit', name: 'Con Vịt', img: 'vit.png'},

    {id: 'ca', name: 'Cái Ca', img: 'ca.png'},
    {id: 'tran', name: 'Con Trăn', img: 'tran.png'},
    {id: 'am', name: 'Cái Ấm', img: 'am.png'},
    {id: 'ca_fish', name: 'Con Cá', img: 'ca_fish.png'},
    {id: 'dudu', name: 'Đu Đủ', img: 'dudu.png'},
    {id: 'embe', name: 'Em Bé', img: 'embe.png'},
    {id: 'bonghoa', name: 'Bông Hoa', img: 'bonghoa.png'},
    {id: 'bi', name: 'Viên Bi', img: 'bi.png'},
    {id: 'keo', name: 'Cái Kéo', img: 'keo.png'},
    {id: 'na', name: 'Quả Na', img: 'na.png'},
    {id: 'ong', name: 'Con Ong', img: 'ong.png'},
    {id: 'o_umbrella', name: 'Cái Ô', img: 'o_umbrella.png'},
    {id: 'mo', name: 'Quả Mơ', img: 'mo.png'},
    {id: 'pin', name: 'Viên Pin', img: 'pin.png'},
    {id: 'qua', name: 'Món Quà', img: 'qua.png'},
    {id: 'rua', name: 'Con Rùa', img: 'rua.png'},
    {id: 'tom', name: 'Con Tôm', img: 'tom.png'},
    {id: 'mu', name: 'Cái Mũ', img: 'mu.png'},
    {id: 'vo', name: 'Quyển Vở', img: 'vo.png'},
    {id: 'xedap', name: 'Xe Đạp', img: 'xedap.png'},
    {id: 'yta', name: 'Y Tá', img: 'yta.png'}

];

registerGame('match_animal', {
    // 1. Sinh dữ liệu ngẫu nhiên
    generateData: function() {
        return ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
    },

    // 2. Hiển thị: HÌNH ẢNH TO + CHỮ BÊN DƯỚI
    renderDisplay: function(item) {
        return `
            <div onclick="playQuestionAudio()" style="cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center;">
                <img src="/img/game/${item.img}" 
                     style="width: 150px; height: 150px; object-fit: contain; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1)); animation: popIn 0.5s;">
                <div style="font-size: 2.5rem; font-weight: bold; color: #555; margin-top: 10px; background: rgba(255,255,255,0.8); padding: 5px 20px; border-radius: 15px;">
                    ${item.name}
                </div>
            </div>
        `;
    },

    // 3. Tạo đáp án (KHÔNG TRÙNG LẶP)
    getOptions: function(correctItem) {
        // Lọc bỏ item đúng ra để lấy list sai
        let otherItems = ANIMAL_ITEMS.filter(x => x.id !== correctItem.id);
        
        // Xáo trộn danh sách sai
        otherItems.sort(() => Math.random() - 0.5);
        
        // Lấy 3 item làm nhiễu
        let options = otherItems.slice(0, 3);
        
        // Thêm đáp án đúng vào
        options.push(correctItem);
        
        return options; 
    },

    // 4. Trang trí nút đáp án (Chỉ hiện hình nhỏ)
    styleOptionBtn: function(btn, item) {
        btn.innerHTML = `<img src="/img/game/${item.img}" style="height:80px; width:80px; object-fit:contain;">`;
        btn.style.padding = "5px";
    },

    // 5. Âm thanh CÂU HỎI: Hỏi "Con gì đây?"
    getAudio: function(item) {
        return ["congi.mp3"]; 
    },

    // 6. Âm thanh ĐÁP ÁN (Đọc tên con vật/quả)
    getAnswerAudio: function(item) {
        return [item.id + ".mp3"]; // VD: bo.mp3, chuoi.mp3...
    },

    // 7. Kiểm tra kết quả
    checkResult: function(selected, correct) {
        return selected.id === correct.id;
    }
});