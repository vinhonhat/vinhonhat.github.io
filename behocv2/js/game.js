// =====================================================
// HÀM DÙNG CHUNG CHO TOÀN BỘ CÁC GAME (game.js)
// =====================================================

// 1. Điều hướng về Menu chính
function goHome() {
    // Nếu có hàm quản lý âm thanh của game riêng thì dừng trước khi thoát
    if (typeof stopCurrentAudio === "function") {
        stopCurrentAudio();
    }
    // Ghi nhớ trạng thái là vừa chơi game xong quay về
    sessionStorage.setItem('skipIntro', 'true');
    
    window.location.href = "/behocv2/index.html"; 
}

// 2. Phát âm thanh hiệu ứng dùng chung (đúng, sai, chào mừng)
function playCommonAudio(fileName) {
    // Từ games/alphabet/index.html đi ra 2 cấp để vào thư mục audio/ gốc
    let audioPath = '/behocv2/audio/' + fileName;
    let audio = new Audio(audioPath);
    audio.play().catch(err => console.log('Lỗi phát Audio hệ thống:', err, 'Đường dẫn:', audioPath));
}

// 3. Trộn mảng ngẫu nhiên (Dùng cho xáo trộn đáp án)
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// 4. Hiệu ứng bắn pháo hoa ăn mừng (Confetti) khi đúng
function fireGameConfetti() {
    const colors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#e91e63'];
    for (let i = 0; i < 35; i++) {
        let conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.left = Math.random() * 100 + '%';
        conf.style.top = '-20px';
        conf.style.width = Math.random() * 8 + 8 + 'px';
        conf.style.height = Math.random() * 8 + 8 + 'px';
        conf.style.background = colors[Math.floor(Math.random() * colors.length)];
        conf.style.zIndex = '99999';
        conf.style.borderRadius = '50%';
        conf.style.pointerEvents = 'none';
        conf.style.transition = 'all 2.2s cubic-bezier(0.1, 0.8, 0.3, 1)';

        document.body.appendChild(conf);

        setTimeout(() => {
            conf.style.top = '105vh';
            conf.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 50 - 25}px)`;
        }, 50);

        setTimeout(() => {
            conf.remove();
        }, 2300);
    }
}