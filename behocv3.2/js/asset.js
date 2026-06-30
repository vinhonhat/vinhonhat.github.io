// js/asset.js
// =====================================================
// QUY ƯỚC TÀI NGUYÊN V3.2
// =====================================================
//
// Ảnh:
//   img/ca.png
//   img/bo.png
//
// Âm thanh chung:
//   audio/common/dingdong.mp3
//   audio/common/chinh-xac.mp3
//   audio/common/gioi-qua.mp3
//   audio/common/sai-roi.mp3
//
// Âm thanh từng game:
//   audio/alphabet/spell_a.mp3
//   audio/numbers/0.mp3
//   audio/colors/do.mp3
//   audio/animals/cho.mp3
//   audio/math/...
//
// =====================================================


// =====================================================
// PHẦN 1 — THƯ MỤC GỐC
// =====================================================

const APP_PATH = {
    img: 'img/',
    audio: 'audio/'
};


// =====================================================
// PHẦN 2 — KIỂM TRA ĐƯỜNG DẪN ĐÃ ĐỦ CHƯA
// =====================================================

function isFullPath(path) {
    if (!path) return false;

    return (
        /^(https?:)?\/\//.test(path) ||
        path.startsWith('/') ||
        path.startsWith('data:') ||
        path.startsWith(APP_PATH.audio) ||
        path.startsWith(APP_PATH.img)
    );
}


// =====================================================
// PHẦN 3 — ẢNH DÙNG CHUNG
// Ví dụ:
//   imgPath('ca.png') → img/ca.png
// =====================================================

function imgPath(fileName) {
    if (!fileName) return '';

    if (isFullPath(fileName)) {
        return fileName;
    }

    return APP_PATH.img + fileName;
}


// =====================================================
// PHẦN 4 — ÂM THANH GỐC
// Ví dụ:
//   audioPath('common/dingdong.mp3')
//   → audio/common/dingdong.mp3
// =====================================================

function audioPath(fileName) {
    if (!fileName) return '';

    if (isFullPath(fileName)) {
        return fileName;
    }

    return APP_PATH.audio + fileName;
}


// =====================================================
// PHẦN 5 — ÂM THANH THEO THƯ MỤC GAME
// Ví dụ:
//   gameAudioPath('alphabet', 'spell_a.mp3')
//   → audio/alphabet/spell_a.mp3
// =====================================================

function gameAudioPath(folder, fileName) {
    if (!fileName) return '';

    if (isFullPath(fileName)) {
        return fileName;
    }

    // Nếu truyền sẵn: alphabet/spell_a.mp3
    // thì chỉ thêm audio/ phía trước, không thêm alphabet lần nữa.
    if (fileName.startsWith(folder + '/')) {
        return APP_PATH.audio + fileName;
    }

    return APP_PATH.audio + folder + '/' + fileName;
}


// =====================================================
// PHẦN 6 — ÂM THANH CHUNG
// Chỉ cần sửa tên file đúng/sai/chào ở đây.
// =====================================================

const COMMON_AUDIO_FILE = {
    welcome: 'common/dingdong.mp3',

    correct: [
        'common/gioi-qua.mp3',
        'common/chinh-xac.mp3',
        //'common/tuyet-voi.mp3',
        //'common/be-gioi-qua.mp3',
        //'common/hoan-ho.mp3'
    ],

    wrong: 'common/sai-roi.mp3'
};


// =====================================================
// PHẦN 7 — TÊN CŨ / TÊN GỌI TẮT
// Cho phép code cũ gọi sai-roi.mp3 vẫn tự hiểu là wrong.
// =====================================================

const COMMON_AUDIO_ALIAS = {
    'dingdong.mp3': 'welcome',
    'common/dingdong.mp3': 'welcome',

    'gioi qua.mp3': 'correct',
    'gioi-qua.mp3': 'correct',
    'common/gioi-qua.mp3': 'correct',

    'chinh xac.mp3': 'correct',
    'chinh-xac.mp3': 'correct',
    'common/chinh-xac.mp3': 'correct',

    'tuyet-voi.mp3': 'correct',
    'be-gioi-qua.mp3': 'correct',
    'hoan-ho.mp3': 'correct',

    'sai roi.mp3': 'wrong',
    'sai-roi.mp3': 'wrong',
    'common/sai-roi.mp3': 'wrong'
};


// =====================================================
// PHẦN 8 — HÀM GỌI ÂM THANH CHUNG
// =====================================================

function commonAudioPath(keyOrFileName) {
    if (!keyOrFileName) return '';

    const key = COMMON_AUDIO_ALIAS[keyOrFileName] || keyOrFileName;
    const fileName = COMMON_AUDIO_FILE[key] || keyOrFileName;

    return audioPath(fileName);
}

function welcomeAudioPath() {
    return commonAudioPath('welcome');
}

function correctAudioPath() {
    const list = COMMON_AUDIO_FILE.correct;

    const fileName =
        list[Math.floor(Math.random() * list.length)];

    return audioPath(fileName);
}

function wrongAudioPath() {
    return commonAudioPath('wrong');
}


// =====================================================
// PHẦN 9 — ÂM THANH RIÊNG TỪNG GAME
// =====================================================

function alphabetAudioPath(fileName) {
    return gameAudioPath('alphabet', fileName);
}

function numberAudioPath(fileName) {
    return gameAudioPath('numbers', fileName);
}

function colorAudioPath(fileName) {
    return gameAudioPath('colors', fileName);
}

function animalAudioPath(fileName) {
    return gameAudioPath('animals', fileName);
}

function mathAudioPath(fileName) {
    return gameAudioPath('math', fileName);
}