const ALPHABET = ['a','ă','â','b','c','d','đ','e','ê','g','h','i','k','l','m','n','o','ô','ơ','p','q','r','s','t','u','ư','v','x','y'];

registerGame('alphabet', {
    gridClass: 'cols-3', // Báo cho Core biết game này cần chia 3 cột (nếu CSS hỗ trợ)

    generateData: function() {
        return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    },

    renderDisplay: function(char) {
        return `
            <div class="big-icon-question">🔊</div>
            <div class="hint-text">Chữ ${char.toUpperCase()}</div>
        `;
    },

    getOptions: function(correctChar) {
        let set = new Set([correctChar]);
        while(set.size < 4) set.add(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
        return Array.from(set);
    },

    styleOptionBtn: function(btn, char) {
        btn.textContent = char.toUpperCase();
    },

    getAudio: function(char) {
        return [char + ".mp3"];
    },

    checkResult: function(selected, correct) {
        return selected === correct;
    }
});