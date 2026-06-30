// js/audio.js
// Gom quản lý âm thanh để giảm lỗi autoplay và dừng âm cũ khi đổi game.

let audioUnlocked = false;
let activeAudioTracks = [];
let activeAudioTimers = [];

function unlockAudioPolicy() {
    audioUnlocked = true;

    // Tạo một audio câm rất ngắn để trình duyệt ghi nhận thao tác người dùng.
    // Nếu trình duyệt không cho thì vẫn bỏ qua, vì các lần play sau đã nằm sau thao tác click.
    try {
        const audio = new Audio();
        audio.muted = true;
        audio.play().catch(() => {});
    } catch (e) {}
}

function stopAllAudio() {
    activeAudioTimers.forEach(timer => clearTimeout(timer));
    activeAudioTimers = [];

    activeAudioTracks.forEach(audio => {
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (e) {}
    });

    activeAudioTracks = [];
}

// =====================================================
// PHẦN 3 — PHÁT 1 FILE AUDIO
// Mặc định: phát âm mới sẽ tắt toàn bộ âm cũ.
// =====================================================

function playAudio(path, options = {}) {
    if (!path) return null;

    if (options.stopOld !== false) {
        stopAllAudio();
    }

    console.log('PLAY AUDIO:', path);

    const audio = new Audio(path);

    audio.volume =
        typeof options.volume === 'number'
            ? options.volume
            : 1;

    audio.playbackRate =
        typeof options.playbackRate === 'number'
            ? options.playbackRate
            : 1;

    activeAudioTracks.push(audio);

    audio.onended = () => {
        activeAudioTracks =
            activeAudioTracks.filter(item => item !== audio);

        if (typeof options.onended === 'function') {
            options.onended();
        }
    };

    audio.onerror = () => {
        console.log('AUDIO ERROR:', path);

        activeAudioTracks =
            activeAudioTracks.filter(item => item !== audio);

        if (typeof options.onerror === 'function') {
            options.onerror();
        }
    };

    audio.play().catch(err => {
        console.log('AUDIO BLOCKED/ERROR:', path, err);

        activeAudioTracks =
            activeAudioTracks.filter(item => item !== audio);

        if (typeof options.onerror === 'function') {
            options.onerror(err);
        }
    });

    return audio;
}


// =====================================================
// PHẦN 4 — PHÁT NHIỀU FILE LIÊN TIẾP
// Dùng cho số: 2 + mươi + 5...
// =====================================================

function playSequence(files, index = 0, isNewSequence = true) {
    if (!files || index >= files.length) return;

    if (isNewSequence) {
        stopAllAudio();
    }

    let file = files[index];

    if (
        file &&
        !file.startsWith(APP_PATH.audio) &&
        !file.startsWith('/') &&
        !file.startsWith('http') &&
        !file.startsWith('data:')
    ) {
        file = audioPath(file);
    }

    console.log('PLAY SEQUENCE:', file);

    const audio = new Audio(file);

    audio.playbackRate = files.length >= 2 ? 1.15 : 1;

    activeAudioTracks.push(audio);

    audio.onloadedmetadata = () => {
        let overlap = files.length >= 2 ? 140 : 0;

        if (file.endsWith('/muoi.mp3') || file.endsWith('muoi.mp3')) {
            overlap = 180;
        }

        const nextDelay =
            Math.max((audio.duration * 1000) - overlap, 120);

        const timer = setTimeout(() => {
            playSequence(files, index + 1, false);
        }, nextDelay);

        activeAudioTimers.push(timer);
    };

    audio.onended = () => {
        activeAudioTracks =
            activeAudioTracks.filter(item => item !== audio);
    };

    audio.onerror = () => {
        console.log('SEQUENCE AUDIO ERROR:', file);
        playSequence(files, index + 1, false);
    };

    audio.play().catch(err => {
        console.log('SEQUENCE AUDIO BLOCKED/ERROR:', file, err);
        playSequence(files, index + 1, false);
    });
}

// =====================================================
// PHẦN 5 — TỰ DỪNG ÂM KHI NGƯỜI DÙNG BẤM NÚT KHÁC
// Áp dụng cho toàn bộ app/game, kể cả nút tạo động sau này.
// Ví dụ:
// - Đang đọc A, bấm B      → dừng A, phát B
// - Đang đọc A, bấm luyện → dừng A, vào luyện rồi phát câu mới
// - Đang phát câu hỏi, bấm Home → dừng ngay
// =====================================================

function installGlobalAudioInterrupt() {
    if (window.__globalAudioInterruptInstalled) return;
    window.__globalAudioInterruptInstalled = true;

    const selector = [
        'button',
        '.menu-btn',
        '.option-btn',
        '.key-btn',
        '.back-btn',
        '.replay-btn',
        '[onclick]',
        '[data-stop-audio]'
    ].join(',');

    const eventName = window.PointerEvent ? 'pointerdown' : 'touchstart';

    document.addEventListener(eventName, function (e) {
        const target = e.target.closest(selector);

        if (!target) return;

        stopAllAudio();
    }, true);
}

window.addEventListener('DOMContentLoaded', installGlobalAudioInterrupt);
