document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    //     PHÁO HOA CHÀO MỪNG CỦA TẾT V26.1.6
    // ==========================================
    // 1. TỰ ĐỘNG CHÈN CSS
    // ==========================================
    const style = document.createElement('style');
    style.innerHTML = `
        #ny-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 9999999;
            opacity: 0; pointer-events: none;
            transition: opacity 1.5s ease-in-out;
            display: flex; justify-content: center; align-items: center;
            overflow: hidden;
        }
        #ny-overlay.active { opacity: 1; pointer-events: auto; }
        #ny-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
        #ny-message-container {
            position: relative; z-index: 2; text-align: center; color: #fff;
            opacity: 0; transition: opacity 1s ease-in; transform: translateY(20px);
            /* Font chữ đẹp hơn cho lời chúc cuối */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        #ny-message-container.show { opacity: 1; transform: translateY(0); }
        #ny-text-secondary { 
            font-size: 1.8rem; margin-top: 10px; color: #FFD700; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;
        }
        #ny-year-image {
            max-width: 200px; margin-top: 20px; border-radius: 15px;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
            border: 2px solid #FFD700;
        }
        @media (max-width: 768px) {
            #ny-text-secondary { font-size: 1.2rem; }
            #ny-year-image { max-width: 150px; }
        }
    `;
    document.head.appendChild(style);

    // ==========================================
    // 2. HTML STRUCTURE
    // ==========================================
    if (!document.getElementById('ny-overlay')) {
        const overlayHtml = `
        <div id="ny-overlay">
            <canvas id="ny-canvas"></canvas>
            <div id="ny-message-container">
                <h2 id="ny-text-secondary"></h2>
                <img id="ny-year-image" src="" alt="Year Image" style="display: none;"> 
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', overlayHtml);
    }

    const overlay = document.getElementById('ny-overlay');
    const canvas = document.getElementById('ny-canvas');
    const ctx = canvas.getContext('2d');
    const msgContainer = document.getElementById('ny-message-container');

    let w, h, rockets = [], particles = [], animationId;

    // ==========================================
    // 3. XỬ LÝ CHỮ (TEXT TO PARTICLES) - TỰ NHIÊN HÓA
    // ==========================================
    function createDataFromText(text, baseFontSize, isMobile) {
    const tCanvas = document.createElement('canvas');
    const tCtx = tCanvas.getContext('2d');

    tCanvas.width = w;
    tCanvas.height = h;

    // 1. Giới hạn vùng chữ (safe area)
    const maxWidth = isMobile ? w * 0.88 : w * 0.75;

    let fontSize = baseFontSize;
    tCtx.font = `900 ${fontSize}px Arial, sans-serif`;

    // 2. Auto scale chữ nếu quá rộng
    while (tCtx.measureText(text).width > maxWidth && fontSize > 24) {
        fontSize -= 2;
        tCtx.font = `900 ${fontSize}px Arial, sans-serif`;
    }

    tCtx.fillStyle = '#fff';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(text, w / 2, h / 2);

    const imageData = tCtx.getImageData(0, 0, w, h).data;
    const points = [];
    const gap = isMobile ? 3 : 4;

    for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
            const index = (y * w + x) * 4;
            if (imageData[index + 3] > 128) {
                const jitterX = (Math.random() - 0.5) * gap;
                const jitterY = (Math.random() - 0.5) * gap;
                points.push({ x: x + jitterX, y: y + jitterY });
            }
        }
    }
    return points;
}


    // ==========================================
    // 4. ENGINE VẬT LÝ
    // ==========================================
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    
    function random(min, max) { return Math.random() * (max - min) + min; }

    function rainbowColor(index, total) {
    const hue = (index / total) * 360;
    return `hsl(${hue}, 100%, 60%)`;
}
    // Hàm chọn màu ngẫu nhiên hoặc màu chỉ định
    function getColor(specifiedColor) {
        if (specifiedColor === 'random') {
            return `hsl(${Math.random() * 360}, 100%, 60%)`; // Đa sắc
        }
        return specifiedColor; // Đơn sắc
    }

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    class Particle {
    constructor(x, y, color, vx, vy, isText = false) {
        this.x = x;
        this.y = y;
        this.ox = x;          // vị trí gốc
        this.oy = y;

        this.color = color;
        this.vx = vx;
        this.vy = vy;

        this.alpha = 1;
        this.isText = isText;

        this.life = 0;        // đếm frame
        this.scale = 1;

        this.gravity = isText ? 0 : 0.05;
        this.friction = isText ? 0.98 : 0.96;

        this.size = isText ? random(0.4, 0.7) : random(1, 3);
    }

    update() {
        this.life++;

        if (this.isText) {
            // 0–60 frame: giữ nguyên
            if (this.life < 60) {
                const curve = Math.sin(this.ox * 0.01) * 0.8;
                this.x = this.ox + curve;
                this.y = this.oy;
            }
            // 60–120 frame: phóng to
            else if (this.life < 120) {
                this.scale += 0.004;

                // Giữ trục X cố định
                this.x = this.ox;

                // Phóng to nhưng kéo xuống dưới
                this.y = this.oy + (this.scale - 1) * 40;
            }

            // sau đó mới rơi
            else {
                this.gravity = 0.012;
                this.vx *= 0.995;
                this.vy += this.gravity;
                this.y += this.vy;
                this.alpha -= 0.003;

            }
        } else {
            this.vx *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= 0.015;
        }
    }

    draw() {
    ctx.globalAlpha = this.alpha;

    if (this.isText) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }}
}


    class Rocket {
        constructor(x, targetY, type, payload = '', colorMode = '#ff0000') {
            this.x = x; this.y = h; 
            this.targetY = targetY; 
            this.type = type; // 'text', 'normal', 'heart'
            this.payload = payload; 
            this.colorMode = colorMode; // 'random' hoặc mã màu cụ thể
            this.vy = random(-11, -16); // Tốc độ bắn lên
            this.vx = random(-0.5, 0.5); // Lắc nhẹ
            this.exploded = false;
            
            // Màu của đuôi tên lửa
            this.trailColor = colorMode === 'random' ? '#ffffff' : colorMode;
        }
        update() {
            this.vy += 0.2; // Trọng lực
            this.x += this.vx; this.y += this.vy;
            
            // Nổ khi đạt độ cao hoặc bắt đầu rơi
            if (this.vy >= -1 || this.y <= this.targetY) { 
                this.explode(); 
                this.exploded = true; 
            }
        }
        explode() {
            // Xác định màu nổ
            const mainColor = getColor(this.colorMode);

            if (this.type === 'text') {
                createPayloadExplosion(this.payload, this.targetY, this.colorMode);
            } else if (this.type === 'heart') {
                createHeartExplosion(this.x, this.y, '#ff0055');
            } else {
                // Nổ thường (Bùm chéo)
                createNormalExplosion(this.x, this.y, this.colorMode, 100, 5);
            }
        }
        draw() {
            ctx.beginPath(); 
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
            ctx.strokeStyle = this.trailColor; 
            ctx.lineWidth = 2; 
            ctx.stroke();
        }
    }

    // --- CÁC HÀM TẠO VỤ NỔ ---
    function createNormalExplosion(x, y, colorMode, count, power) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = random(power * 0.4, power);
            const c = getColor(colorMode);
            particles.push(
                new Particle(
                    x, y, c, 
                    Math.cos(angle) * speed* random(0.6, 1.2), 
                    Math.sin(angle) * speed* random(0.3, 1.1)));
        }
    }

    function createHeartExplosion(cx, cy, color) {
        for (let i = 0; i < Math.PI * 2; i += 0.1) {
            const x = 16 * Math.pow(Math.sin(i), 3);
            const y = -(13 * Math.cos(i) - 5 * Math.cos(2*i) - 2 * Math.cos(3*i) - Math.cos(4*i));
            // Scale trái tim
            const scale = w < 768 ? 8 : 12; 
            particles.push(new Particle(cx, cy, color, x*0.1*scale, y*0.1*scale, false));
        }
    }


    function createPayloadExplosion(text, yPos, colorMode) {
        const isMobile = w < 768;
        // Chỉnh cỡ chữ tùy màn hình
        const fontSize = isMobile ? 44 : 88;
       
        // Lấy tọa độ điểm ảnh của chữ
        const points = createDataFromText(text, fontSize, isMobile);
        
        // Tính toán độ lệch để chữ nằm đúng vị trí tên lửa nổ
        // Mặc định text được tạo ở giữa màn hình (h/2)
        const yOffset = yPos - (h / 2);

       points.forEach((p, i) => {
    const c = rainbowColor(i, points.length);
    particles.push(
        new Particle(
            p.x,
            p.y + yOffset,
            c,
            0,
            0,
            true
        )
    );
});

        // Thêm tiếng nổ bùm (hiệu ứng hình ảnh phụ)
        createNormalExplosion(w/2, yPos, colorMode, 30, 3);
    } 

    function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, w, h);

    // 👉 BẬT hiệu ứng phát sáng
    ctx.globalCompositeOperation = 'screen';

    rockets.forEach((r, i) => {
        r.update();
        r.draw();
        if (r.exploded) rockets.splice(i, 1);
    });

    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.alpha <= 0) particles.splice(i, 1);
    });

    // 👉 TRẢ VỀ NORMAL để tránh loạn màu
    ctx.globalCompositeOperation = 'source-over';

    animationId = requestAnimationFrame(animate);
}


    // ==========================================
    // 5. KỊCH BẢN PHÁO HOA (TIMELINE CHÍNH)
    // ==========================================
    function launch(type, x, targetY, payload = '', colorMode = 'random') {
        rockets.push(new Rocket(x, targetY, type, payload, colorMode));
    }

    async function runNewYearSequence(isTetAm, year) {
        console.log("🚀 KÍCH HOẠT KỊCH BẢN PHÁO HOA!");
        window.isFireworksPlaying = true;
        const oldPopup = document.getElementById('popupOverlay');
        if(oldPopup) oldPopup.style.display = 'none';

        overlay.classList.add('active');
        resize();
        animate();

        const isMobile = w < 768;
        const mobileLines = isTetAm
            ? ["CHÚC MỪNG", "NĂM MỚI", "AN KHANG", "THỊNH VƯỢNG"]
            : ["HAPPY", "NEW YEAR", "WELCOME", String(year)];


        // --- GIAI ĐOẠN 1: KHỞI ĐỘNG ---
        // Bắn vài quả mở màn
        await sleep(1000);
        launch('normal', w*0.4, h*0.1, '', 'random');
        await sleep(300);
        launch('normal', w*0.2, h*0.3, '', 'random');
        await sleep(200);
        launch('normal', w*0.7, h*0.3, '', 'random');
        await sleep(500);
        launch('normal', w*0.6, h*0.2, '', 'random');
        await sleep(300);
        launch('normal', w*0.9, h*0.2, '', 'random');
        await sleep(100);
        launch('normal', w*0.6, h*0.1, '', 'random');
        await sleep(200);
        launch('normal', w*0.2, h*0.3, '', 'random');
        await sleep(150);
        launch('normal', w*0.4, h*0.1, '', 'random');
        await sleep(350);
        launch('normal', w*0.2, h*0.3, '', 'random');
        await sleep(400);
        launch('normal', w*0.8, h*0.3, '', 'random');
        await sleep(500);
        launch('normal', w*0.6, h*0.2, '', 'random');
        await sleep(300);
        launch('normal', w*0.2, h*0.2, '', 'random');
        await sleep(100);
        launch('normal', w*0.6, h*0.1, '', 'random');
        await sleep(200);
        launch('normal', w*0.9, h*0.3, '', 'random');
        await sleep(150);
        launch('normal', w*0.6, h*0.1, '', 'random');
        await sleep(200);
        launch('normal', w*0.2, h*0.3, '', 'random');
        await sleep(150);
        launch('normal', w*0.4, h*0.1, '', 'random');
        await sleep(350);
        launch('normal', w*0.2, h*0.3, '', 'random');
        await sleep(400);
        launch('normal', w*0.8, h*0.3, '', 'random');
        await sleep(500);
        launch('normal', w*0.6, h*0.2, '', 'random');
        await sleep(300);
        launch('normal', w*0.2, h*0.2, '', 'random');
        await sleep(100);
        launch('normal', w*0.6, h*0.1, '', 'random');
        await sleep(200);
        launch('normal', w*0.9, h*0.3, '', 'random');
        await sleep(150);

        async function fanSweep() {
    const baseX = w / 2;
    const baseY = h * 0.85;

    for (let a = -40; a <= 40; a += 8) {
        const r = new Rocket(baseX, h * 0.35, 'normal', '', 'random');
        const rad = a * Math.PI / 180;
        r.vx = Math.sin(rad) * 3;
        r.vy = -Math.cos(rad) * 14;
        rockets.push(r);
        await sleep(60);
    }
}


        // --- GIAI ĐOẠN 2: BẮN CHỮ (LOGIC PC vs MOBILE) ---
        
        const txt1 = isTetAm ? "CHÚC MỪNG NĂM MỚI" : "HAPPY NEW YEAR";
        const txt2 = isTetAm ? "AN KHANG THỊNH VƯỢNG" : `WELCOME ${year}`;

        // Màu sắc: Dòng 1 Vàng, Dòng 2 Đỏ (hoặc Random tùy thích)
        const color1 = '#FFD700'; // Vàng
        const color2 = '#FF4500'; // Đỏ cam

        if (isMobile) {
            // === LOGIC MOBILE: HIỆN CẢ 2 DÒNG ===
            let startY = h * 0.25;

for (let i = 0; i < mobileLines.length; i++) {
    launch(
        'text',
        w / 2,
        startY + i * (h * 0.12),
        mobileLines[i]
    );
    await sleep(500);
};
            // 1. Bắn dòng 1 lên RẤT CAO
            launch('text', w/2, h*0.28, txt1, color1);
            await sleep(800); // Chờ xíu

            // 2. Bắn dòng 2 thấp hơn
            launch('text', w/2, h*0.55, txt2, color2);
            
            // Cả 2 dòng cùng tồn tại và rơi xuống từ từ
            await sleep(1000);

        } else {
            // === LOGIC PC: HIỆN LẦN LƯỢT (NÂNG CAO) ===
            for (let i = -2; i <= 2; i++) {
    rockets.push(new Rocket(
        w / 2,
        h * 0.3,
        'normal',
        '',
        'random'
    ));
    rockets[rockets.length - 1].vx = i * 1.2;
}
await sleep(600);
            // 1. Bắn dòng 1 lên CAO (h*0.3)
            launch('text', w/2, h*0.3, txt1, color1);
            
            // Chờ cho chữ dòng 1 hơi tan đi (khoảng 3s)
            await sleep(3500); 

            // 2. Bắn dòng 2 ĐÈ LÊN vị trí cũ (hoặc thấp hơn xíu h*0.35)
            // Hiệu ứng: Dòng cũ mờ đi, dòng mới nổ bùm ra che lấp
            launch('text', w/2, h*0.3, txt2, color2);
            
            await sleep(4000);
        }

        // --- GIAI ĐOẠN 3: KẾT THÚC HOÀNH TRÁNG ---
        // Bắn tim
        launch('heart', w/2 - 60, h*0.18, '', '#ff3366');
        await sleep(300);
        launch('heart', w/2 + 40, h*0.22, '', '#ff0055');
        await sleep(300);
        launch('heart', w/2, h*0.15, '', '#ff6699');
                        
        // Bắn loạn xạ kết thúc
        for(let i=0; i<10; i++) {
            launch('normal', random(w*0.1, w*0.9), random(h*0.1, h*0.2), '', 'random');
            await sleep(300);
        }
        await sleep(2000);

        // --- GIAI ĐOẠN 4: HIỆN ẢNH & LỜI CHÚC CUỐI ---
        cancelAnimationFrame(animationId);
        ctx.clearRect(0,0,w,h);
        
        const subText = document.getElementById('ny-text-secondary');
        const img = document.getElementById('ny-year-image');

        if (isTetAm) {
            subText.innerHTML = `XUÂN ${year} - VẠN SỰ NHƯ Ý`;
            img.src = `/img/holidays/tet${year}.jpg`;
            img.onerror = function() { this.style.display = 'none'; };
            img.style.display = 'inline-block';
        } else {
            subText.innerHTML = "SUCCESS - HAPPINESS";
            img.style.display = 'none';
        }

        msgContainer.classList.add('show');
        await sleep(5000); // Hiện lâu chút để chụp ảnh

        overlay.classList.remove('active');
        setTimeout(() => { msgContainer.classList.remove('show'); }, 2000);
        window.isFireworksPlaying = false;
    }

    // ==========================================
    // 6. CHECK NGÀY & KÍCH HOẠT
    // ==========================================
    function checkDateAndRun() {
        // TEST MODE: ?test=1
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('test')) {
            console.log("🔔 Test Mode Enabled");
            runNewYearSequence(true, 2026);
            return;
        }

        const today = new Date();
        const d = today.getDate();
        const m = today.getMonth() + 1;
        const y = today.getFullYear();
        const todayTime = new Date(y, m - 1, d).getTime();

        // Tết Dương
        if (d === 1 && m === 1) { runNewYearSequence(false, y); return; }

        // Tết Âm (Vạn Niên)
        if (typeof convertLunarToSolar === 'function') {
            const lunarDays = [{d:1, m:1}, {d:2, m:1}, {d:3, m:1}];
            for (let l of lunarDays) {
                const sDate = convertLunarToSolar(l.d, l.m, y);
                if(sDate) {
                    sDate.setHours(0,0,0,0);
                    if (todayTime === sDate.getTime()) {
                        runNewYearSequence(true, y);
                        return;
                    }
                }
            }
        }
    }
    setTimeout(checkDateAndRun, 500);
});