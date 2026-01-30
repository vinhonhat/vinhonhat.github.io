const GAME_COLORS = [
    {id: 'do', name: 'Màu Đỏ', hex: '#FF5252'},
    {id: 'xanhduong', name: 'Xanh Dương', hex: '#448AFF'},
    // ... thêm các màu khác
];

registerGame('color', {
    generateData: function() {
        return GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
    },

    renderDisplay: function(colorObj) {
        return `
            <div class="big-icon-question" style="color: ${colorObj.hex}">🔊</div>
            <div class="hint-text" style="color: ${colorObj.hex}">${colorObj.name}</div>
        `;
    },

    getOptions: function(correctObj) {
        let set = new Set([correctObj]);
        while(set.size < 4) set.add(GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)]);
        return Array.from(set);
    },

    styleOptionBtn: function(btn, colorObj) {
        btn.style.backgroundColor = colorObj.hex;
        btn.style.border = '2px solid #ddd';
    },

    getAudio: function(colorObj) {
        return [colorObj.id + ".mp3"];
    },

    checkResult: function(selected, correct) {
        return selected.id === correct.id;
    }
});