document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    //     PHÁO HOA CHÀO MỪNG (TANK VECTOR) V26.1.7.7
    // ==========================================

    // 0. CẤU HÌNH: DANH SÁCH NGÀY ĐƯỢC BẮN PHÁO HOA
    const SPECIAL_FIREWORKS_IDS = [
        'tet',      // Tết Nguyên Đán
        '0101',     // Tết Dương Lịch
        '0430',     // 30/4
        '0902'      // Quốc Khánh 2/9
    ];

    // ==========================================
    // 1. TỰ ĐỘNG CHÈN CSS
    // ==========================================
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
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
            width: 100%; 
        }
        #ny-message-container.show { opacity: 1; transform: translateY(0); }
        #ny-text-secondary { 
            font-family: 'Dancing Script', cursive; 
            color: #FFD700; font-weight: 700; 
            text-shadow: 2px 2px 0px #FF4500, 0 0 30px rgba(255, 215, 0, 0.5); 
            font-size: 6rem; margin-top: 10px; line-height: 1.3;
        }
        #ny-year-image {
            max-width: 200px; margin-top: 20px; border-radius: 15px;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
            border: 2px solid #FFD700;
        }
        @media (max-width: 768px) {
            #ny-text-secondary { font-size: 3.8rem; line-height: 1.4; padding: 0 10px; }
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
    // 3. ENGINE XỬ LÝ TEXT, CỜ & XE TĂNG
    // ==========================================
    function createDataFromText(text, baseFontSize, isMobile) {
        const tCanvas = document.createElement('canvas');
        const tCtx = tCanvas.getContext('2d');
        tCanvas.width = w; tCanvas.height = h;
        const maxWidth = isMobile ? w * 0.88 : w * 0.75;
        let fontSize = baseFontSize;
        tCtx.font = `bold ${fontSize}px Arial Narrow, sans-serif`;
        while (tCtx.measureText(text).width > maxWidth && fontSize > 24) {
            fontSize -= 2;
            tCtx.font = `bold ${fontSize}px Arial Narrow, sans-serif`;
        }
        tCtx.fillStyle = '#fff'; tCtx.textAlign = 'center'; tCtx.textBaseline = 'middle';
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

    function createFlagData(baseW, baseH, isMobile) {
        const tCanvas = document.createElement('canvas');
        const tCtx = tCanvas.getContext('2d');
        tCanvas.width = baseW; tCanvas.height = baseH;

        const flagW = isMobile ? baseW * 0.5 : baseW * 0.25; 
        const flagH = flagW * (2/3); 
        const startX = (baseW - flagW) / 2;
        const startY = (baseH - flagH) / 2;

        tCtx.strokeStyle = '#DA251D'; 
        tCtx.lineWidth = isMobile ? 10 : 15; 
        tCtx.strokeRect(startX, startY, flagW, flagH);

        let fontSize = flagH * 0.6; 
        tCtx.font = `bold ${fontSize}px Arial, sans-serif`;
        tCtx.fillStyle = '#FFFF00'; tCtx.textAlign = 'center'; tCtx.textBaseline = 'middle';
        tCtx.fillText('★', baseW / 2, baseH / 2 + fontSize*0.04);

        return scanPixels(tCtx, baseW, baseH, isMobile ? 5 : 6, 'flag');
    }

    // --- HÀM VẼ XE TĂNG 390 (GÓC NHÌN NGANG - DỄ HÌNH DUNG) ---
    function createTankData(baseW, baseH, isMobile) {
        const tCanvas = document.createElement('canvas');
        const tCtx = tCanvas.getContext('2d');
        tCanvas.width = baseW; tCanvas.height = baseH;

        const scale = isMobile ? 0.6 : 1.0; 
        const cx = baseW / 2;
        const cy = baseH * 0.6; // Hạ thấp xuống

        tCtx.lineJoin = 'round';
        tCtx.lineCap = 'round';

        // ==============================
        // 1. VẼ CỔNG DINH (Vàng Đồng)
        // ==============================
        tCtx.strokeStyle = '#DAA520'; 
        tCtx.lineWidth = isMobile ? 4 : 6;

        // CỘT TRÁI + CÁNH TRÁI (Đứng)
        tCtx.strokeRect(cx - 180 * scale, cy - 120 * scale, 20 * scale, 180 * scale); // Cột
        tCtx.strokeRect(cx - 160 * scale, cy - 110 * scale, 60 * scale, 170 * scale); // Cánh cửa
        // Nan dọc cánh cửa
        tCtx.beginPath();
        tCtx.moveTo(cx - 130 * scale, cy - 110 * scale);
        tCtx.lineTo(cx - 130 * scale, cy + 60 * scale);
        tCtx.stroke();

        // CỘT PHẢI (Đứng) - Cánh phải mất tích (đã bị đè)
        tCtx.strokeRect(cx + 160 * scale, cy - 120 * scale, 20 * scale, 180 * scale);

        // CÁNH PHẢI (NẰM BẸP DƯỚI ĐẤT)
        // Vẽ mấy đường gạch gạch dưới bánh xích xe tăng thể hiện sắt thép đổ nát
        tCtx.beginPath();
        tCtx.moveTo(cx + 20 * scale, cy + 60 * scale); tCtx.lineTo(cx + 140 * scale, cy + 70 * scale);
        tCtx.moveTo(cx + 40 * scale, cy + 70 * scale); tCtx.lineTo(cx + 130 * scale, cy + 60 * scale);
        tCtx.stroke();

        // ==============================
        // 2. VẼ XE TĂNG (Góc Nhìn Ngang)
        // ==============================
        tCtx.strokeStyle = '#32CD32'; // Xanh lá
        tCtx.lineWidth = isMobile ? 4 : 6;

        // -- BÁNH XÍCH (Hình bầu dục dài) --
        tCtx.beginPath();
        tCtx.roundRect(cx - 100 * scale, cy + 20 * scale, 200 * scale, 40 * scale, 20 * scale);
        tCtx.stroke();

        // -- BÁNH XE (Vòng tròn trong xích) --
        tCtx.lineWidth = 2;
        for(let i = 0; i < 5; i++) {
            tCtx.beginPath();
            tCtx.arc(cx - 70 * scale + (i * 35 * scale), cy + 40 * scale, 12 * scale, 0, Math.PI*2);
            tCtx.stroke();
        }
        tCtx.lineWidth = isMobile ? 4 : 6; // Trả lại nét dày

        // -- THÂN XE (Vát chéo) --
        tCtx.beginPath();
        tCtx.moveTo(cx - 110 * scale, cy + 20 * scale); // Đuôi
        tCtx.lineTo(cx + 90 * scale, cy + 20 * scale);  // Đầu
        tCtx.lineTo(cx + 70 * scale, cy - 10 * scale);  // Mũi trên
        tCtx.lineTo(cx - 90 * scale, cy - 10 * scale);  // Đuôi trên
        tCtx.closePath();
        tCtx.stroke();

        // -- THÁP PHÁO (Hình vòm) --
        tCtx.beginPath();
        tCtx.arc(cx - 10 * scale, cy - 10 * scale, 45 * scale, Math.PI, 0); // Nửa hình tròn
        tCtx.lineTo(cx - 55 * scale, cy - 10 * scale); // Đóng đáy
        tCtx.stroke();

        // -- NÒNG PHÁO (Dài, hơi ngóc lên uy nghiêm) --
        tCtx.lineWidth = isMobile ? 7 : 10;
        tCtx.beginPath();
        tCtx.moveTo(cx + 30 * scale, cy - 25 * scale); // Gốc nòng
        tCtx.lineTo(cx + 160 * scale, cy - 35 * scale); // Đầu nòng
        tCtx.stroke();
        tCtx.lineWidth = isMobile ? 4 : 6;

        // -- SAO VÀNG (Điểm nhấn) --
        tCtx.fillStyle = '#FFFF00';
        tCtx.font = `bold ${30 * scale}px Arial`;
        tCtx.textAlign = 'center';
        tCtx.fillText('★', cx - 10 * scale, cy - 20 * scale);

        return scanPixels(tCtx, baseW, baseH, isMobile ? 4 : 5, 'tank');
    }

    // Hàm phụ trợ quét pixel chung
    function scanPixels(ctx, w, h, gap, type) {
        const imageData = ctx.getImageData(0, 0, w, h).data;
        const points = [];
        for (let y = 0; y < h; y += gap) {
            for (let x = 0; x < w; x += gap) {
                const index = (y * w + x) * 4;
                const r = imageData[index];
                const g = imageData[index + 1];
                const a = imageData[index + 3];

                if (a > 128) {
                    let color = '#ffffff';
                    if (type === 'flag') {
                        color = (g > 200 && r > 200) ? '#FFFF00' : '#DA251D';
                    } else if (type === 'tank') {
                        // Logic màu cho xe tăng và cổng
                        if (g > 200 && r > 200) color = '#FFFF00'; // Sao vàng
                        else if (r > 180 && g > 140) color = '#DAA520'; // Cổng vàng đồng
                        else color = '#32CD32'; // Xe tăng xanh
                    }
                    const jitterX = (Math.random() - 0.5) * gap;
                    const jitterY = (Math.random() - 0.5) * gap;
                    points.push({ x: x + jitterX, y: y + jitterY, color: color });
                }
            }
        }
        return points;
    }

    // ==========================================
    // 4. LOGIC VẬT LÝ & HIỆU ỨNG
    // ==========================================
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    function random(min, max) { return Math.random() * (max - min) + min; }
    function rainbowColor(index, total) { const hue = (index / total) * 360; return `hsl(${hue}, 100%, 60%)`; }
    function getColor(specifiedColor) { return specifiedColor === 'random' ? `hsl(${Math.random() * 360}, 100%, 60%)` : specifiedColor; }
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    class Particle {
        constructor(x, y, color, vx, vy, isText = false) {
            this.x = x; this.y = y; this.ox = x; this.oy = y;
            this.color = color; this.vx = vx; this.vy = vy;
            this.alpha = 1; this.isText = isText; this.life = 0; this.scale = 1;
            this.gravity = isText ? 0 : 0.05; this.friction = isText ? 0.98 : 0.96;
            this.size = isText ? random(0.4, 0.7) : random(1, 3);
        }
        update() {
            this.life++;
            if (this.isText) {
                if (this.life < 60) { this.x = this.ox + Math.sin(this.ox * 0.01) * 0.8; }
                else if (this.life < 120) { this.scale += 0.004; this.x = this.ox; this.y = this.oy + (this.scale - 1) * 40; }
                else { this.gravity = 0.012; this.vx *= 0.995; this.vy += this.gravity; this.y += this.vy; this.alpha -= 0.003; }
            } else {
                this.vx *= this.friction; this.vy += this.gravity; this.x += this.vx; this.y += this.vy; this.alpha -= 0.015;
            }
        }
        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color; ctx.fill();
        }
    }

    class Rocket {
        constructor(x, targetY, type, payload = '', colorMode = '#ff0000') {
            this.x = x; this.y = h; this.targetY = targetY;
            this.type = type; this.payload = payload; this.colorMode = colorMode;
            this.vy = random(-11, -16); this.vx = random(-0.5, 0.5);
            this.exploded = false; this.trailColor = colorMode === 'random' ? '#ffffff' : colorMode;
        }
        update() {
            this.vy += 0.2; this.x += this.vx; this.y += this.vy;
            if (this.vy >= -1 || this.y <= this.targetY) { this.explode(); this.exploded = true; }
        }
        explode() {
            if (this.type === 'text' || this.type === 'flag' || this.type === 'tank') {
                createPayloadExplosion(this.type, this.payload, this.targetY, this.colorMode);
            }
            else if (this.type === 'heart') createHeartExplosion(this.x, this.y, '#ff0055');
            else createNormalExplosion(this.x, this.y, this.colorMode, 100, 5);
        }
        draw() {
            ctx.beginPath(); ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
            ctx.strokeStyle = this.trailColor; ctx.lineWidth = 2; ctx.stroke();
        }
    }

    function createNormalExplosion(x, y, colorMode, count, power) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2; const speed = random(power * 0.4, power); const c = getColor(colorMode);
            particles.push(new Particle(x, y, c, Math.cos(angle) * speed * random(0.6, 1.2), Math.sin(angle) * speed * random(0.3, 1.1)));
        }
    }
    function createHeartExplosion(cx, cy, color) {
        for (let i = 0; i < Math.PI * 2; i += 0.05) {
            const x = 16 * Math.pow(Math.sin(i), 3);
            const y = -(13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i));
            const baseScale = w < 768 ? 2.5 : 4; const randomForce = random(0.8, 1.2);
            particles.push(new Particle(cx, cy, color, x * 0.05 * baseScale * randomForce, y * 0.05 * baseScale * randomForce, false));
            if (Math.random() < 0.3) particles.push(new Particle(cx, cy, '#ffffff', x * 0.05 * baseScale * randomForce * 0.8, y * 0.05 * baseScale * randomForce * 0.8, false));
        }
    }
    function createPayloadExplosion(type, text, yPos, colorMode) {
        const isMobile = w < 768;
        let points = [];
        
        if (type === 'flag') points = createFlagData(w, h, isMobile);
        else if (type === 'tank') points = createTankData(w, h, isMobile);
        else {
            const fontSize = isMobile ? 44 : 88;
            points = createDataFromText(text, fontSize, isMobile);
        }

        const yOffset = yPos - (h / 2);
        points.forEach((p, i) => {
            let particleColor = rainbowColor(i, points.length);
            if (type === 'flag' || type === 'tank') particleColor = p.color;
            
            particles.push(new Particle(p.x, p.y + yOffset, particleColor, 0, 0, true));
        });
        
        // Nổ phụ thêm cho đẹp
        let explosionColor = colorMode;
        if(type === 'flag') explosionColor = '#DA251D';
        if(type === 'tank') explosionColor = '#32CD32';
        createNormalExplosion(w / 2, yPos, explosionColor, 30, 3);
    }

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'screen';
        rockets.forEach((r, i) => { r.update(); r.draw(); if (r.exploded) rockets.splice(i, 1); });
        particles.forEach((p, i) => { p.update(); p.draw(); if (p.alpha <= 0) particles.splice(i, 1); });
        ctx.globalCompositeOperation = 'source-over';
        animationId = requestAnimationFrame(animate);
    }

    function launch(type, x, targetY, payload = '', colorMode = 'random') {
        rockets.push(new Rocket(x, targetY, type, payload, colorMode));
    }

    async function fanSweep() {
        const baseX = w / 2; const count = 15;
        const startAngle = -70; const endAngle = 70; const step = (endAngle - startAngle) / (count - 1);
        for (let i = 0; i < count; i++) {
            const angle = startAngle + (i * step); const rad = angle * Math.PI / 180;
            const r = new Rocket(baseX, h, 'normal', '', 'random');
            const power = w < 768 ? 14 : 18;
            r.vx = Math.sin(rad) * power * 0.8; r.vy = -Math.cos(rad) * power;
            r.targetY = h * 0.15 + Math.abs(angle) * 1.5;
            rockets.push(r); await sleep(60);
        }
    }

    // ==========================================
    // 5. HÀM CHÍNH: KỊCH BẢN CHUNG
    // ==========================================
    async function runNewYearSequence(eventData, year) {
        console.log("🚀 KÍCH HOẠT PHÁO HOA:", eventData.name);
        window.isFireworksPlaying = true;
        
        const oldPopup = document.getElementById('popupOverlay');
        if(oldPopup) oldPopup.style.display = 'none';

        overlay.classList.add('active');
        resize();
        animate();

        const isMobile = w < 768;
        const prefix = eventData.imagePrefix;

        // --- BƯỚC 1: CẤU HÌNH NỘI DUNG ---
        let txt1 = "", txt2 = "";
        let mobileLines = [];
        let color1 = "#FFD700", color2 = "#FF4500"; 
        let specialEffect = null; // 'flag' hoặc 'tank'

        switch (prefix) {
            case 'tet': 
                txt1 = "CHÚC MỪNG NĂM MỚI";
                txt2 = "AN KHANG THỊNH VƯỢNG";
                mobileLines = ["CHÚC MỪNG", "NĂM MỚI", "AN KHANG", "THỊNH VƯỢNG"];
                color1 = '#FFD700'; color2 = '#FF0000';
                break;

            case '0101': 
                txt1 = "HAPPY NEW YEAR";
                txt2 = `WELCOME ${year}`;
                mobileLines = ["HAPPY", "NEW YEAR", "WELCOME", String(year)];
                color1 = '#00FFFF'; color2 = '#FF00FF';
                break;

            case '0430': // 30/4 - XE TĂNG
                const anniversary304 = year - 1975; 
                txt1 = `KỶ NIỆM ${anniversary304} NĂM GIẢI PHÓNG MIỀN NAM`;
                txt2 = "THỐNG NHẤT ĐẤT NƯỚC";
                mobileLines = ["KỶ NIỆM", `${anniversary304} NĂM`, "THỐNG NHẤT", "ĐẤT NƯỚC"];
                color1 = '#FF0000'; color2 = '#FFFF00'; 
                specialEffect = 'tank'; // Kích hoạt xe tăng
                break;
            
            case '0902': // 2/9 - LÁ CỜ
                const anniversary29 = year - 1945;
                txt1 = `KỶ NIỆM ${anniversary29} NĂM`;
                txt2 = "QUỐC KHÁNH 2-9";
                mobileLines = ["KỶ NIỆM", `${anniversary29} NĂM`, "QUỐC KHÁNH", "2 - 9"];
                color1 = '#FF0000'; color2 = '#FFFF00';
                specialEffect = 'flag'; // Kích hoạt lá cờ
                break;

            default: 
                txt1 = "CHÀO MỪNG";
                txt2 = eventData.name.toUpperCase();
                mobileLines = eventData.name.toUpperCase().split(" ");
                break;
        }

        // --- BƯỚC 2: CHẠY KỊCH BẢN ---
        // 1. DẠO ĐẦU
        await sleep(1000);
        launch('normal', w*0.4, h*0.1, '', 'random'); await sleep(300);
        launch('normal', w*0.2, h*0.3, '', 'random'); await sleep(200);
        launch('normal', w*0.7, h*0.3, '', 'random'); await sleep(500);
        launch('normal', w*0.6, h*0.2, '', 'random'); await sleep(300);
        launch('normal', w*0.9, h*0.2, '', 'random'); await sleep(100);
        launch('normal', w*0.6, h*0.1, '', 'random'); await sleep(200);
        launch('normal', w*0.2, h*0.3, '', 'random'); await sleep(150);
        launch('normal', w*0.4, h*0.1, '', 'random'); await sleep(350);
        launch('normal', w*0.2, h*0.3, '', 'random'); await sleep(400);
        launch('normal', w*0.8, h*0.3, '', 'random'); await sleep(500);

        // 2. PHÁO HOA QUẠT 
        await fanSweep(); 

        // 3. BẮN CHỮ & HÌNH (NGAY LẬP TỨC)
        if (isMobile) {
            let startY = h * 0.15; 
            for (let i = 0; i < mobileLines.length; i++) {
                launch('text', w / 2, startY + i * (h * 0.12), mobileLines[i], i%2==0 ? color1:color2);
                await sleep(500);
            };
            if (specialEffect) {
                await sleep(500);
                launch(specialEffect, w/2, h * 0.75); // Bắn Tank hoặc Cờ
            }
        } else {
            // PC
            launch('text', w/2, h*0.20, txt1, color1);
            await sleep(400); 
            launch('text', w/2, h*0.40, txt2, color2);
            
            if (specialEffect) {
                await sleep(600); 
                launch(specialEffect, w/2, h*0.65); // Bắn Tank hoặc Cờ
            }
        }
        
        await sleep(5000);

        // 4. KẾT THÚC
        launch('heart', w/2 - 60, h*0.18, '', '#ff3366'); await sleep(300);
        launch('heart', w/2 + 40, h*0.22, '', '#ff0055'); await sleep(300);
        launch('heart', w/2, h*0.15, '', '#ff6699');
                        
        for(let i=0; i<8; i++) {
            launch('normal', random(w*0.1, w*0.9), random(h*0.1, h*0.2), '', 'random');
            await sleep(300);
        }
        await sleep(2000);

        // --- BƯỚC 3: HIỆN LỜI CHÚC & ẢNH ---
        cancelAnimationFrame(animationId);
        ctx.clearRect(0,0,w,h);
        
        const subText = document.getElementById('ny-text-secondary');
        const img = document.getElementById('ny-year-image');
        subText.style.display = 'block';

        img.src = `/img/holidays/${prefix}${year}.jpg`;
        img.onerror = function() { 
            this.src = `/img/holidays/${prefix}.jpg`;
            this.onerror = function() { this.style.display = 'none'; };
        };
        img.style.display = 'inline-block';

        // Lời chúc cuối
        if (prefix === 'tet') {
            subText.innerHTML = isMobile ? `Xuân ${year}<br>Vạn Sự Như Ý` : `Xuân ${year} <br> Vạn Sự Như Ý <br> Tấn Tài Tấn Lộc`;
        } else if (prefix === '0101') {
            subText.innerHTML = isMobile ? `Happy New Year <br>Welcome ${year}` : `Happy New Year <br>Welcome ${year}`;
            img.style.display = 'none'; 
        } else if (prefix === '0430') {
             const anniversary304 = year - 1975; 
             subText.innerHTML = isMobile ? `Kỷ niệm ${anniversary304} Năm<br> Giải Phóng Miền Nam <br>Thống Nhất Đất Nước` : `Kỷ Niệm ${anniversary304} năm <br> Ngày Giải Phóng Miền Nam<br> Thống Nhất Đất Nước`;
        } else if (prefix === '0902') {
             const anniversary29 = year - 1945;
             subText.innerHTML = isMobile ? `Kỷ niệm ${anniversary29} Năm<br>Quốc Khánh Nước Việt Nam` : `CHÚC MỪNG ${anniversary29} NĂM <br> NGÀY QUỐC KHÁNH 2/9`;
        } else {
            subText.innerHTML = isMobile ? `${eventData.name}<br>${year}` : `${eventData.name} - NĂM ${year}`;
        }

        msgContainer.classList.add('show');
        await sleep(5000); 
        overlay.classList.remove('active');
        setTimeout(() => { msgContainer.classList.remove('show'); }, 2000);
        window.isFireworksPlaying = false;
    }

    // ==========================================
    // 6. CHECK NGÀY & KÍCH HOẠT
    // ==========================================
    function checkDateAndRun() {
        if (typeof holidays === 'undefined') return;

        const today = new Date();
        const d = today.getDate();
        const m = today.getMonth() + 1;
        const y = today.getFullYear();
        
        const urlParams = new URLSearchParams(window.location.search);
        let testId = urlParams.get('test'); 

        // --- BỘ DỊCH MÃ (THÊM ĐOẠN NÀY) ---
        // Nếu gõ 3004 thì tự hiểu là 0430
        if (testId === '3004') testId = '0430';
        // Nếu gõ 0209 thì tự hiểu là 0902
        if (testId === '0209') testId = '0902';
        // ----------------------------------

        if (testId) {
            const testEvent = holidays.find(h => h.imagePrefix === testId);
            if (testEvent) {
                console.log(`🔔 Đang Test ID: ${testId}`);
                runNewYearSequence(testEvent, y);
                return;
            }
        }

        const todayTime = new Date(y, m - 1, d).getTime();

        for (let event of holidays) {
            let isMatch = false;
            if (!event.isLunar && d === event.day && m === event.month) {
                isMatch = true;
            }
            else if (event.isLunar && typeof convertLunarToSolar === 'function') {
                if (event.imagePrefix === 'tet') {
                    const lunarDays = [{d:1, m:1}, {d:2, m:1}, {d:3, m:1}];
                    for (let l of lunarDays) {
                        const sDate = convertLunarToSolar(l.d, l.m, y);
                        if(sDate && (sDate.setHours(0,0,0,0) === todayTime)) {
                            isMatch = true; break;
                        }
                    }
                } else {
                    const sDate = convertLunarToSolar(event.day, event.month, y);
                    if(sDate && (sDate.setHours(0,0,0,0) === todayTime)) isMatch = true;
                }
            }

            if (isMatch && SPECIAL_FIREWORKS_IDS.includes(event.imagePrefix)) {
                runNewYearSequence(event, y);
                return; 
            }
        }
    }
    
    setTimeout(checkDateAndRun, 500);
});