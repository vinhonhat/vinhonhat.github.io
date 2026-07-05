// games/card-match/card-match.js
// GAME: Lật Thẻ - tìm cặp giống nhau.
// Custom game dùng chung renderGameShell/topbar của game-core.

(function () {

function __eduShuffle(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

function __eduImg(fileName) {
    if (typeof imgPath === 'function') return imgPath(fileName);
    return 'img/' + fileName;
}

function __eduAlphabetAudio(fileName) {
    if (typeof alphabetAudioPath === 'function') return alphabetAudioPath(fileName);
    return 'audio/alphabet/' + fileName;
}

function __eduNumberAudio(fileName) {
    if (typeof numberAudioPath === 'function') return numberAudioPath(fileName);
    return 'audio/numbers/' + fileName;
}

function __eduRandomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}


    const CARD_ITEMS = [
        { id: 'tao', label: 'táo', img: 'tao.png' },
        { id: 'meo', label: 'mèo', img: 'meo.png' },
        { id: 'cho', label: 'chó', img: 'cho.png' },
        { id: 'ga', label: 'gà', img: 'ga.png' },
        { id: 'ca', label: 'cá', img: 'ca_fish.png' },
        { id: 'sao', label: 'sao', img: 'sao.png' },
        { id: 'bo', label: 'bò', img: 'bo.png' },
        { id: 'vit', label: 'vịt', img: 'vit.png' }
    ];

    let cardMatchState = {
        cards: [],
        first: null,
        lock: false,
        score: 0,
        level: 1
    };

    function setScore() {
        const score = document.getElementById('score');
        if (score) score.textContent = String(cardMatchState.score);
    }

    function makeCards() {
        const pairCount = cardMatchState.level <= 1 ? 3 : cardMatchState.level <= 2 ? 4 : 6;
        const items = __eduShuffle(CARD_ITEMS).slice(0, pairCount);
        const cards = [];
        items.forEach(item => {
            cards.push({ id: item.id + '-a', pair: item.id, item, open: false, matched: false });
            cards.push({ id: item.id + '-b', pair: item.id, item, open: false, matched: false });
        });
        return __eduShuffle(cards);
    }

    function renderCardMatch() {
        const grid = document.getElementById('options-grid');
        const question = document.getElementById('question-content');

        if (question) {
            question.innerHTML = `
                <div class="card-match-status">
                    <b>Lv.${cardMatchState.level}</b>
                    <span>⭐ ${cardMatchState.score}</span>
                    <button type="button" onclick="restartCardMatchLevel()">🔄</button>
                </div>
            `;
        }

        if (!grid) return;
        grid.className = 'options-grid card-match-grid';
        grid.innerHTML = cardMatchState.cards.map((card, idx) => `
            <button
                id="card-match-${idx}"
                class="card-match-card ${card.open || card.matched ? 'is-open' : ''} ${card.matched ? 'is-matched' : ''}"
                type="button"
                onclick="flipCardMatchCard(${idx})">
                <span class="card-match-back">?</span>
                <span class="card-match-front">
                    <img src="${__eduImg(card.item.img)}" alt="${card.item.label}" draggable="false">
                </span>
            </button>
        `).join('');
    }

    function startCardMatchGame() {
        if (typeof stopAllAudio === 'function') stopAllAudio();

        const menu = document.getElementById('menu-screen');
        const game = document.getElementById('game-screen');
        if (menu) menu.style.display = 'none';
        if (game) {
            game.style.display = 'flex';
            game.className = 'game-view game-card-match';
        }

        if (typeof renderGameShell === 'function') {
            renderGameShell('Lật Thẻ');
        }

        if (typeof resetTopTimerBar === 'function') resetTopTimerBar();

        cardMatchState.score = 0;
        cardMatchState.level = 1;
        cardMatchState.cards = makeCards();
        cardMatchState.first = null;
        cardMatchState.lock = false;

        const replayBtn = document.querySelector('#game-screen .replay-btn');
        if (replayBtn) replayBtn.style.display = 'none';

        setScore();
        renderCardMatch();

        if (typeof playAudio === 'function' && typeof welcomeAudioPath === 'function') {
            playAudio(welcomeAudioPath(), { stopOld: true });
        }
    }

    function restartCardMatchLevel() {
        cardMatchState.cards = makeCards();
        cardMatchState.first = null;
        cardMatchState.lock = false;
        renderCardMatch();
    }

    function flipCardMatchCard(index) {
        if (cardMatchState.lock) return;
        const card = cardMatchState.cards[index];
        if (!card || card.open || card.matched) return;

        card.open = true;
        renderCardMatch();

        if (cardMatchState.first === null) {
            cardMatchState.first = index;
            return;
        }

        const first = cardMatchState.cards[cardMatchState.first];
        const second = card;

        if (first.pair === second.pair) {
            first.matched = true;
            second.matched = true;
            cardMatchState.score += 10;
            cardMatchState.first = null;
            setScore();

            if (cardMatchState.cards.every(c => c.matched)) {
                setTimeout(() => {
                    cardMatchState.level += 1;
                    cardMatchState.cards = makeCards();
                    renderCardMatch();
                }, 650);
            }
            return;
        }

        cardMatchState.lock = true;

        setTimeout(() => {
            first.open = false;
            second.open = false;
            cardMatchState.first = null;
            cardMatchState.lock = false;
            renderCardMatch();
        }, 700);
    }

    window.startCardMatchGame = startCardMatchGame;
    window.flipCardMatchCard = flipCardMatchCard;
    window.restartCardMatchLevel = restartCardMatchLevel;
})();
