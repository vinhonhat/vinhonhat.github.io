// js/asset.js
// Quy ước v3.2 hiện tại của bạn:
// - Tất cả ảnh dùng chung đặt trực tiếp trong img/
// - Tất cả âm thanh dùng chung đặt trực tiếp trong audio/

const APP_PATH = {
    img: 'img/',
    audio: 'audio/'
};

function imgPath(fileName) {
    if (!fileName) return '';
    if (/^(https?:)?\/\//.test(fileName) || fileName.startsWith('/') || fileName.startsWith('data:')) {
        return fileName;
    }
    return APP_PATH.img + fileName;
}

function audioPath(fileName) {
    if (!fileName) return '';
    if (/^(https?:)?\/\//.test(fileName) || fileName.startsWith('/') || fileName.startsWith('data:')) {
        return fileName;
    }
    return APP_PATH.audio + normalizeAudioName(fileName);
}

// Giữ các tên cũ có khoảng trắng để bạn chưa cần đổi toàn bộ file âm thanh ngay.
function normalizeAudioName(fileName) {
    const map = {
        'dingdong.mp3': 'dingdong.mp3',
        'gioi qua.mp3': 'gioi qua.mp3',
        'gioi-qua.mp3': 'gioi qua.mp3',
        'chinh xac.mp3': 'chinh xac.mp3',
        'chinh-xac.mp3': 'chinh xac.mp3',
        'sai roi.mp3': 'sai roi.mp3',
        'sai-roi.mp3': 'sai roi.mp3'
    };

    return map[fileName] || fileName;
}

function commonAudioPath(fileName) {
    return audioPath(fileName);
}

function alphabetAudioPath(fileName) {
    return audioPath('alphabet/' + fileName);
}

function numberAudioPath(fileName) {
    return audioPath(fileName);
}
