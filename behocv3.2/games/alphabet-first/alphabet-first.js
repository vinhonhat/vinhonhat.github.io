// games/alphabet-first/alphabet-first.js
// GAME: Chữ Đầu - nhìn/nghe chữ rồi chọn hình bắt đầu bằng chữ đó.

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


    const ITEMS = [
        { id: "a", word: "cái ca", img: "ca.png", audio: "spell_a.mp3" },
        { id: "ă", word: "con trăn", img: "tran.png", audio: "spell_aw.mp3" },
        { id: "â", word: "cái ấm", img: "am.png", audio: "spell_aa.mp3" },
        { id: "b", word: "con bò", img: "bo.png", audio: "spell_b.mp3" },
        { id: "c", word: "con cá", img: "ca_fish.png", audio: "spell_c.mp3" },
        { id: "d", word: "con dê", img: "de.png", audio: "spell_d.mp3" },
        { id: "đ", word: "đu đủ", img: "dudu.png", audio: "spell_dd.mp3" },
        { id: "e", word: "em bé", img: "embe.png", audio: "spell_e.mp3" },
        { id: "ê", word: "con ếch", img: "ech.png", audio: "spell_ee.mp3" },
        { id: "g", word: "con gà", img: "ga.png", audio: "spell_g.mp3" },
        { id: "h", word: "bông hoa", img: "hoa.png", audio: "spell_h.mp3" },
        { id: "i", word: "viên bi", img: "bi.png", audio: "spell_i.mp3" },
        { id: "k", word: "cái kéo", img: "keo.png", audio: "spell_k.mp3" },
        { id: "l", word: "con lợn", img: "heo.png", audio: "spell_l.mp3" },
        { id: "m", word: "con mèo", img: "meo.png", audio: "spell_m.mp3" },
        { id: "n", word: "quả na", img: "na.png", audio: "spell_n.mp3" },
        { id: "o", word: "con ong", img: "ong.png", audio: "spell_o.mp3" },
        { id: "ô", word: "cái ô", img: "o_umbrella.png", audio: "spell_oo.mp3" },
        { id: "ơ", word: "quả mơ", img: "mo.png", audio: "spell_ow.mp3" },
        { id: "p", word: "viên pin", img: "pin.png", audio: "spell_p.mp3" },
        { id: "q", word: "món quà", img: "qua.png", audio: "spell_q.mp3" },
        { id: "r", word: "con rùa", img: "rua.png", audio: "spell_r.mp3" },
        { id: "s", word: "ngôi sao", img: "sao.png", audio: "spell_s.mp3" },
        { id: "t", word: "con tôm", img: "tom.png", audio: "spell_t.mp3" },
        { id: "u", word: "cái mũ", img: "mu.png", audio: "spell_u.mp3" },
        { id: "ư", word: "sư tử", img: "sutu.png", audio: "spell_uw.mp3" },
        { id: "v", word: "quyển vở", img: "vo.png", audio: "spell_v.mp3" },
        { id: "x", word: "xe đạp", img: "xedap.png", audio: "spell_x.mp3" },
        { id: "y", word: "y tá", img: "yta.png", audio: "spell_y.mp3" },
        { id: "ch", word: "con chó", img: "cho.png", audio: "spell_ch.mp3" },
        { id: "ng", word: "con ngựa", img: "ngua.png", audio: "spell_ng.mp3" },
        { id: "tr", word: "trăng", img: "trang.png", audio: "spell_tr.mp3" },
        { id: "qu", word: "quạt", img: "quat.png", audio: "spell_qu.mp3" }
    ];

    registerGame('alphabet_first', {
        questionTimeSec: 14,

        generateData() {
            return __eduRandomItem(ITEMS);
        },

        renderDisplay(data) {
            return `
                <div class="alphabet-first-question" onclick="playQuestionAudio()">
                    <div class="alphabet-first-letter">
                        <span class="alphabet-first-upper">${data.id.toUpperCase()}</span>
                        <span class="alphabet-first-lower">${data.id}</span>
                    </div>
                    <div class="alphabet-first-title">Chọn hình bắt đầu bằng chữ này</div>
                </div>
            `;
        },

        getOptions(correct) {
            const set = new Map([[correct.id, correct]]);
            while (set.size < 4) {
                const item = __eduRandomItem(ITEMS);
                set.set(item.id, item);
            }
            return __eduShuffle(Array.from(set.values()));
        },

        styleOptionBtn(btn, item) {
            btn.classList.add('alphabet-first-option');
            btn.innerHTML = `
                <img src="${__eduImg(item.img)}" alt="${item.word}" draggable="false">
                <span>${item.word}</span>
            `;
            btn.setAttribute('aria-label', item.word);
        },

        getAudio(data) {
            return [__eduAlphabetAudio(data.audio)];
        },

        getAnswerAudio(item) {
            return item && item.audio ? [__eduAlphabetAudio(item.audio)] : [];
        },

        checkResult(selected, correct) {
            return selected.id === correct.id;
        }
    });
})();
