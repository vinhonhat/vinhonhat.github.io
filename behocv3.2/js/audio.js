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

function playAudio(path, options = {}) {
    if (!path) return null;

    if (options.stopOld !== false) {
        stopAllAudio();
    }

    const audio = new Audio(path);
    audio.volume = typeof options.volume === 'number' ? options.volume : 1;
    audio.playbackRate = typeof options.playbackRate === 'number' ? options.playbackRate : 1;

    activeAudioTracks.push(audio);

    audio.onended = () => {
        activeAudioTracks = activeAudioTracks.filter(item => item !== audio);
        if (typeof options.onended === 'function') {
            options.onended();
        }
    };

    audio.onerror = () => {
        activeAudioTracks = activeAudioTracks.filter(item => item !== audio);
        if (typeof options.onerror === 'function') {
            options.onerror();
        }
    };

    audio.play().catch(err => {
        console.log('Audio play blocked/error:', path, err);
        if (typeof options.onerror === 'function') {
            options.onerror(err);
        }
    });

    return audio;
}

function playSequence(files, index = 0, isNewSequence = true) {
    if (!files || index >= files.length) return;

    if (isNewSequence) {
        stopAllAudio();
    }

    const file = files[index];
    const audio = new Audio(file);
    audio.playbackRate = files.length >= 2 ? 1.15 : 1;
    activeAudioTracks.push(audio);

    audio.onloadedmetadata = () => {
        let overlap = files.length >= 2 ? 140 : 0;
        if (file.endsWith('/muoi.mp3') || file.endsWith('muoi.mp3')) {
            overlap = 180;
        }

        const nextDelay = Math.max((audio.duration * 1000) - overlap, 120);
        const timer = setTimeout(() => {
            playSequence(files, index + 1, false);
        }, nextDelay);
        activeAudioTimers.push(timer);
    };

    audio.onended = () => {
        activeAudioTracks = activeAudioTracks.filter(item => item !== audio);
    };

    audio.onerror = () => {
        console.log('File audio thiếu hoặc lỗi:', file);
        playSequence(files, index + 1, false);
    };

    audio.play().catch(err => {
        console.log('Audio sequence blocked/error:', file, err);
        playSequence(files, index + 1, false);
    });
}
