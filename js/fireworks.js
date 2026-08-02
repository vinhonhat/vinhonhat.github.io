(() => {
    'use strict';

    if (window.VinhHolidayFireworks?.version === 5) return;

    const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const random = (min, max) => Math.random() * (max - min) + min;
    let running = false;

    function canChiYear(year) {
        const stems = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
        const branches = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
        return `${stems[((year % 10) + 10) % 10]} ${branches[((year % 12) + 12) % 12]}`;
    }

    function ensureUi() {
        if (!document.getElementById('vinh-fireworks-sequence-style')) {
            const style = document.createElement('style');
            style.id = 'vinh-fireworks-sequence-style';
            style.textContent = `
                #vinh-fireworks-overlay{
                    position:fixed;inset:0;z-index:9999999;overflow:hidden;
                    background:#02040a;opacity:0;visibility:hidden;pointer-events:none;
                    transition:opacity .65s ease,visibility 0s linear .65s;
                    touch-action:none;overscroll-behavior:none;
                }
                #vinh-fireworks-overlay.active{
                    opacity:1;visibility:visible;pointer-events:auto;transition-delay:0s;
                }
                #vinh-fireworks-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
                #vinh-fireworks-skip{
                    position:absolute;top:max(14px,env(safe-area-inset-top));right:14px;z-index:2;
                    width:40px;height:40px;border:1px solid rgba(255,255,255,.3);border-radius:999px;
                    background:rgba(0,0,0,.28);color:#fff;font:700 20px/1 Arial,sans-serif;
                    display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(8px);
                    opacity:.7;transition:opacity .2s ease,background .2s ease;
                }
                #vinh-fireworks-skip:hover{opacity:1;background:rgba(255,255,255,.14)}
                @media (max-width:700px){#vinh-fireworks-skip{width:36px;height:36px;font-size:18px}}
            `;
            document.head.appendChild(style);
        }

        let overlay = document.getElementById('vinh-fireworks-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'vinh-fireworks-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-label', 'Trình diễn pháo hoa ngày lễ');
            overlay.innerHTML = `
                <canvas id="vinh-fireworks-canvas" aria-hidden="true"></canvas>
                <button id="vinh-fireworks-skip" type="button" aria-label="Bỏ qua pháo hoa">×</button>
            `;
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    function eventSequence(eventData, year, mobile) {
        const id = String(eventData?.imagePrefix || '');
        const chi = canChiYear(year);
        const split = lines => mobile ? lines : [lines.slice(0, Math.ceil(lines.length / 2)).join(' '), lines.slice(Math.ceil(lines.length / 2)).join(' ')];

        if (id === 'tet') {
            return {
                lines: mobile
                    ? ['CHÚC MỪNG', 'NĂM MỚI', `XUÂN ${chi.toUpperCase()}`, String(year)]
                    : ['CHÚC MỪNG NĂM MỚI', `XUÂN ${chi.toUpperCase()} ${year}`],
                colors: ['#ffd500', '#ff3b30', '#ffd500', '#ff6b35'],
                special: null
            };
        }
        if (id === '0101') {
            return {
                lines: mobile ? ['HAPPY', 'NEW YEAR', 'WELCOME', String(year)] : ['HAPPY NEW YEAR', `WELCOME ${year}`],
                colors: ['#00e5ff', '#ff43d0', '#ffd500', '#ffffff'],
                special: null
            };
        }
        if (id === '0430') {
            const years = year - 1975;
            return {
                lines: mobile
                    ? ['KỶ NIỆM', `${years} NĂM`, 'THỐNG NHẤT', 'ĐẤT NƯỚC']
                    : [`KỶ NIỆM ${years} NĂM`, 'THỐNG NHẤT ĐẤT NƯỚC'],
                colors: ['#ff3b30', '#ffd500', '#ff3b30', '#ffd500'],
                special: 'tank'
            };
        }
        if (id === '0902') {
            const years = year - 1945;
            return {
                lines: mobile
                    ? ['KỶ NIỆM', `${years} NĂM`, 'QUỐC KHÁNH', 'VIỆT NAM']
                    : [`KỶ NIỆM ${years} NĂM`, 'QUỐC KHÁNH VIỆT NAM'],
                colors: ['#ff3b30', '#ffd500', '#ff3b30', '#ffd500'],
                special: 'flag'
            };
        }

        const words = String(eventData?.name || 'CHÀO MỪNG NGÀY LỄ').toUpperCase().split(/\s+/).filter(Boolean);
        return {
            lines: mobile ? split(words).filter(Boolean) : ['CHÀO MỪNG', words.join(' ')],
            colors: ['#ffd500', '#ff6b35'],
            special: null
        };
    }

    async function run(eventData, year = new Date().getFullYear()) {
        if (running) return;
        running = true;

        const overlay = ensureUi();
        const canvas = overlay.querySelector('#vinh-fireworks-canvas');
        const skipButton = overlay.querySelector('#vinh-fireworks-skip');
        const ctx = canvas.getContext('2d', { alpha: false });
        const previousOverflow = document.documentElement.style.overflow;
        const previousBodyOverflow = document.body.style.overflow;

        let width = 0;
        let height = 0;
        let dpr = 1;
        let animationId = 0;
        let stopped = false;
        let frame = 0;
        let abortResolve = null;
        const aborted = new Promise(resolve => { abortResolve = resolve; });
        const wait = ms => Promise.race([sleep(ms), aborted]);
        const rockets = [];
        const particles = [];
        const isMobile = () => width < 720;
        const maxParticles = () => isMobile() ? 6200 : 11800;

        function stopNow() {
            if (stopped) return;
            stopped = true;
            overlay.classList.remove('active');
            cancelAnimationFrame(animationId);
            abortResolve?.();
        }

        function resize() {
            width = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 320);
            height = Math.max(480, window.innerHeight || document.documentElement.clientHeight || 480);
            dpr = Math.min(window.devicePixelRatio || 1, width < 720 ? 1.25 : 1.6);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.fillStyle = '#02040a';
            ctx.fillRect(0, 0, width, height);
        }

        function trimParticles() {
            const limit = maxParticles();
            if (particles.length > limit) particles.splice(0, particles.length - limit);
        }

        function randomColor() {
            return `hsl(${Math.floor(Math.random() * 360)},100%,64%)`;
        }

        class Particle {
            constructor({
                x, y, vx = 0, vy = 0, color = '#fff', size = 2, life = 1,
                gravity = .045, friction = .982, text = false,
                targetX = x, targetY = y, decay = null, trailLength = 0,
                twinkle = false, glow = false
            }) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.color = color;
                this.size = size;
                this.alpha = life;
                this.gravity = gravity;
                this.friction = friction;
                this.text = text;
                this.targetX = targetX;
                this.targetY = targetY;
                this.age = 0;
                this.ageMs = 0;
                this.startX = x;
                this.startY = y;
                this.formationMs = text ? (isMobile() ? 235 : 275) : 0;
                this.holdMs = text ? (isMobile() ? 2200 : 2500) : 0;
                this.decay = decay ?? (text ? .0068 : .0105);
                this.trailLength = trailLength;
                this.history = [];
                this.twinkle = twinkle;
                this.glow = glow;
            }

            update(dt = 1, dtMs = 16.667) {
                this.age += dt;
                this.ageMs += dtMs;

                if (!this.text && this.trailLength > 0) {
                    this.history.push({ x: this.x, y: this.y });
                    if (this.history.length > this.trailLength) this.history.shift();
                }

                if (this.text) {
                    if (this.ageMs < this.formationMs) {
                        // Dùng thời gian thực thay vì đếm frame: máy yếu vẫn ghép chữ đúng tốc độ.
                        const raw = clamp(this.ageMs / this.formationMs, 0, 1);
                        const eased = 1 - Math.pow(1 - raw, 3.4);
                        this.x = this.startX + (this.targetX - this.startX) * eased;
                        this.y = this.startY + (this.targetY - this.startY) * eased;
                    } else if (this.ageMs < this.holdMs) {
                        this.x = this.targetX + Math.sin((this.targetX + this.ageMs * .08) * .034) * .38;
                        this.y = this.targetY + Math.cos((this.targetY + this.ageMs * .07) * .029) * .28;
                    } else {
                        const friction = Math.pow(.994, dt);
                        this.vx *= friction;
                        this.vy += .009 * dt;
                        this.x += this.vx * dt;
                        this.y += this.vy * dt;
                        this.alpha -= this.decay * dt;
                    }
                } else {
                    const friction = Math.pow(this.friction, dt);
                    this.vx *= friction;
                    this.vy = this.vy * friction + this.gravity * dt;
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                    this.alpha -= this.decay * dt;
                }
            }

            draw() {
                if (this.alpha <= 0) return;
                const alpha = clamp(this.alpha, 0, 1);

                if (!this.text && this.history.length > 1) {
                    ctx.globalAlpha = alpha * .52;
                    ctx.beginPath();
                    ctx.moveTo(this.history[0].x, this.history[0].y);
                    for (let i = 1; i < this.history.length; i += 1) {
                        ctx.lineTo(this.history[i].x, this.history[i].y);
                    }
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = Math.max(.42, this.size * .72);
                    ctx.stroke();
                }

                const twinkleAlpha = this.twinkle && this.age % 7 < 2 ? alpha * .45 : alpha;
                ctx.globalAlpha = twinkleAlpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();

                if (this.glow && this.size > .8) {
                    ctx.globalAlpha = twinkleAlpha * .22;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 2.8, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
            }
        }

        class Rocket {
            constructor({
                x, targetY, color = randomColor(), vx = random(-.35, .35),
                vy = random(-15.5, -12), payload = null, fan = false,
                burstStyle = 'auto', burstPower = 1
            }) {
                this.x = x;
                this.y = height + 8;
                this.prevX = this.x;
                this.prevY = this.y;
                this.targetY = targetY;
                this.color = color;
                this.vx = vx;
                this.vy = vy;
                this.payload = payload;
                this.fan = fan;
                this.burstStyle = burstStyle;
                this.burstPower = burstPower;
                this.age = 0;
                this.ageMs = 0;
                this.exploded = false;
            }

            update(dt = 1, dtMs = 16.667) {
                this.age += dt;
                this.ageMs += dtMs;
                this.prevX = this.x;
                this.prevY = this.y;
                this.vy += (this.fan ? .108 : .165) * dt;
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                if (this.y <= this.targetY || this.vy >= -.45 || (this.fan && this.ageMs > 930)) this.explode();
            }

            explode() {
                if (this.exploded) return;
                this.exploded = true;
                if (this.payload?.type === 'text') createTextExplosion(this.payload.text, this.payload.y, this.payload.color);
                else if (this.payload?.type === 'flag') createFlagExplosion(this.payload.y);
                else if (this.payload?.type === 'tank') createTankExplosion(this.payload.y);
                else if (this.payload?.type === 'heart') createHeartExplosion(this.x, this.y);
                else createNormalExplosion(
                    this.x,
                    this.y,
                    this.color,
                    this.fan ? 46 : 92,
                    (this.fan ? 4.2 : 5.3) * this.burstPower,
                    this.fan ? 'palm' : this.burstStyle
                );
            }

            draw() {
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.moveTo(this.prevX, this.prevY);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.fan ? 1.75 : 1.55;
                ctx.stroke();

                // Đốm lửa nhỏ phía sau tên lửa để đường bay tự nhiên hơn.
                if (this.age % 2 === 0) {
                    addParticle({
                        x: this.x + random(-1.5, 1.5),
                        y: this.y + random(2, 6),
                        vx: random(-.12, .12),
                        vy: random(.15, .55),
                        color: Math.random() < .45 ? '#fff4bc' : this.color,
                        size: random(.4, .8),
                        decay: .045,
                        gravity: .01,
                        friction: .96,
                        twinkle: true
                    });
                }
            }
        }

        class FormationRocket {
            constructor({ startX, targetX, targetY, points, color, delayMs = 0, durationMs = 420 }) {
                this.startX = startX;
                this.startY = height + 12;
                this.targetX = targetX;
                this.targetY = targetY;
                this.points = points;
                this.color = color || randomColor();
                this.delayMs = delayMs;
                this.durationMs = durationMs;
                this.elapsedMs = -delayMs;
                this.x = startX;
                this.y = this.startY;
                this.prevX = this.x;
                this.prevY = this.y;
                this.controlX = (startX + targetX) / 2 + random(-width * .035, width * .035);
                this.controlY = height * random(.48, .62);
                this.exploded = false;
                this.formation = true;
            }

            update(_dt = 1, dtMs = 16.667) {
                if (this.exploded) return;
                this.elapsedMs += dtMs;
                if (this.elapsedMs < 0) return;
                this.prevX = this.x;
                this.prevY = this.y;
                const raw = clamp(this.elapsedMs / this.durationMs, 0, 1);
                const t = 1 - Math.pow(1 - raw, 2.8);
                const inv = 1 - t;
                this.x = inv * inv * this.startX + 2 * inv * t * this.controlX + t * t * this.targetX;
                this.y = inv * inv * this.startY + 2 * inv * t * this.controlY + t * t * this.targetY;
                if (raw >= 1) this.explode();
            }

            explode() {
                if (this.exploded) return;
                this.exploded = true;
                createTextCluster(this.points, this.x, this.y, this.color);
                createNormalExplosion(this.x, this.y, this.color, isMobile() ? 11 : 16, 2.35);
            }

            draw() {
                if (this.elapsedMs < 0 || this.exploded) return;
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.moveTo(this.prevX, this.prevY);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = isMobile() ? 2.1 : 2.5;
                ctx.stroke();
            }
        }

        function addParticle(data) {
            particles.push(new Particle(data));
        }

        function burstPalette(color) {
            const base = color === 'random' ? randomColor() : color;
            const choices = [
                [base, '#fff7d6'],
                [base, '#ffffff', '#ffd66b'],
                ['#ff375f', '#ffd60a', '#ffffff'],
                ['#53d8fb', '#8f7cff', '#ffffff'],
                ['#ff9f0a', '#ff453a', '#fff4c2']
            ];
            return color === 'random' ? choices[Math.floor(Math.random() * choices.length)] : [base, '#fff7d6'];
        }

        function addRadialParticle(x, y, angle, speed, color, options = {}) {
            addParticle({
                x,
                y,
                vx: Math.cos(angle) * speed * (options.xScale ?? 1),
                vy: Math.sin(angle) * speed * (options.yScale ?? 1),
                color,
                size: options.size ?? random(.55, 1.05),
                gravity: options.gravity ?? random(.025, .05),
                friction: options.friction ?? random(.982, .991),
                decay: options.decay ?? random(.0065, .010),
                trailLength: options.trailLength ?? (isMobile() ? 7 : 11),
                twinkle: options.twinkle ?? true,
                glow: options.glow ?? false
            });
        }

        function createNormalExplosion(x, y, color = randomColor(), count = 90, power = 5, style = 'auto') {
            const styles = ['chrysanthemum', 'double', 'willow', 'peony', 'ring'];
            const selected = style === 'auto' ? styles[Math.floor(Math.random() * styles.length)] : style;
            const mobileScale = isMobile() ? .76 : 1;
            const palette = burstPalette(color);
            const pick = index => palette[index % palette.length];

            if (selected === 'palm') {
                const rays = Math.max(16, Math.round(count * .55 * mobileScale));
                for (let i = 0; i < rays; i += 1) {
                    const angle = -Math.PI * .94 + (i / Math.max(1, rays - 1)) * Math.PI * .88;
                    const speed = random(power * .72, power * 1.08);
                    addRadialParticle(x, y, angle, speed, i % 3 === 0 ? '#fff1a8' : pick(i), {
                        gravity: random(.055, .085),
                        friction: random(.986, .993),
                        decay: random(.006, .009),
                        trailLength: isMobile() ? 9 : 15,
                        size: random(.55, .95),
                        twinkle: true
                    });
                }
            } else if (selected === 'willow') {
                const rays = Math.max(34, Math.round(count * .76 * mobileScale));
                for (let i = 0; i < rays; i += 1) {
                    const angle = Math.PI * 2 * i / rays + random(-.018, .018);
                    const speed = random(power * .60, power * 1.08);
                    addRadialParticle(x, y, angle, speed, i % 6 === 0 ? '#ffffff' : '#ffd76a', {
                        gravity: random(.025, .038),
                        friction: random(.989, .994),
                        decay: random(.0048, .0068),
                        trailLength: isMobile() ? 12 : 20,
                        size: random(.45, .82),
                        twinkle: true,
                        glow: i % 9 === 0
                    });
                }
            } else if (selected === 'double') {
                const outer = Math.max(38, Math.round(count * .66 * mobileScale));
                const inner = Math.max(22, Math.round(count * .34 * mobileScale));
                for (let i = 0; i < outer; i += 1) {
                    const angle = Math.PI * 2 * i / outer + random(-.022, .022);
                    addRadialParticle(x, y, angle, random(power * .88, power * 1.15), pick(i), {
                        trailLength: isMobile() ? 9 : 15,
                        decay: random(.0062, .0085),
                        size: random(.48, .88)
                    });
                }
                for (let i = 0; i < inner; i += 1) {
                    const angle = Math.PI * 2 * i / inner + random(-.03, .03);
                    addRadialParticle(x, y, angle, random(power * .42, power * .64), i % 2 ? '#fff8df' : pick(i + 1), {
                        trailLength: isMobile() ? 6 : 10,
                        decay: random(.008, .011),
                        size: random(.5, .95),
                        glow: i % 5 === 0
                    });
                }
            } else if (selected === 'ring') {
                const rays = Math.max(42, Math.round(count * .70 * mobileScale));
                for (let i = 0; i < rays; i += 1) {
                    const angle = Math.PI * 2 * i / rays;
                    addRadialParticle(x, y, angle, power * random(.88, 1.03), pick(i), {
                        trailLength: isMobile() ? 8 : 13,
                        decay: random(.0068, .009),
                        size: random(.48, .82)
                    });
                }
            } else {
                // Chrysanthemum / peony: nhiều tia mảnh, tròn đều như pháo thật.
                const rays = Math.max(48, Math.round(count * mobileScale));
                const equalSpeed = selected === 'peony';
                for (let i = 0; i < rays; i += 1) {
                    const angle = Math.PI * 2 * i / rays + random(-.025, .025);
                    const speed = equalSpeed ? power * random(.82, 1.02) : random(power * .48, power * 1.12);
                    addRadialParticle(x, y, angle, speed, pick(i), {
                        gravity: random(.032, .055),
                        friction: random(.983, .991),
                        decay: random(.0068, .010),
                        trailLength: isMobile() ? 8 : 14,
                        size: random(.46, .9),
                        glow: i % 12 === 0
                    });
                }
            }

            // Lõi sáng và các tia nhỏ làm vụ nổ có chiều sâu thay vì chỉ là một vòng tròn phẳng.
            const coreCount = isMobile() ? 10 : 16;
            for (let i = 0; i < coreCount; i += 1) {
                const angle = Math.random() * Math.PI * 2;
                addRadialParticle(x, y, angle, random(.5, power * .42), '#fff8dd', {
                    size: random(.55, 1.05),
                    trailLength: isMobile() ? 4 : 7,
                    decay: random(.012, .019),
                    gravity: .02,
                    glow: true
                });
            }
            trimParticles();
        }

        function createHeartExplosion(x, y) {
            const scale = isMobile() ? 2.2 : 3.6;
            for (let t = 0; t < Math.PI * 2; t += .075) {
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                addParticle({ x, y, vx: hx * .05 * scale, vy: hy * .05 * scale, color: Math.random() < .25 ? '#fff' : '#ff3f80', size: random(1.1, 2.1) });
            }
            trimParticles();
        }

        function sampleCanvas(draw, gap, cap) {
            const offscreen = document.createElement('canvas');
            offscreen.width = Math.max(1, Math.round(width));
            offscreen.height = Math.max(1, Math.round(height));
            const octx = offscreen.getContext('2d');
            draw(octx, offscreen.width, offscreen.height);
            const pixels = octx.getImageData(0, 0, offscreen.width, offscreen.height).data;
            const points = [];
            for (let y = 0; y < offscreen.height; y += gap) {
                for (let x = 0; x < offscreen.width; x += gap) {
                    const index = (y * offscreen.width + x) * 4;
                    if (pixels[index + 3] > 120) {
                        points.push({ x, y, r: pixels[index], g: pixels[index + 1], b: pixels[index + 2] });
                    }
                }
            }
            if (points.length <= cap) return points;
            const stride = points.length / cap;
            const reduced = [];
            for (let i = 0; i < cap; i += 1) reduced.push(points[Math.floor(i * stride)]);
            return reduced;
        }

        function fitFont(ctx2d, text, maxWidth, preferred, min) {
            let size = preferred;
            do {
                ctx2d.font = `700 ${size}px "Arial Narrow", Arial, "Segoe UI", sans-serif`;
                if (ctx2d.measureText(text).width <= maxWidth) break;
                size -= 2;
            } while (size > min);
            return size;
        }

        function createTextPointCloud(text, y) {
            // Chỉ lấy phần viền chữ, hạt nhỏ và thưa hơn để nét giống pháo thật.
            const gap = isMobile() ? 4 : 5;
            const cap = isMobile() ? 680 : 1350;
            return sampleCanvas((octx, w) => {
                const maxWidth = isMobile() ? w * .90 : w * .80;
                const preferred = isMobile() ? 49 : 90;
                const size = fitFont(octx, text, maxWidth, preferred, isMobile() ? 24 : 32);
                octx.font = `700 ${size}px "Arial Narrow", Arial, "Segoe UI", sans-serif`;
                octx.textAlign = 'center';
                octx.textBaseline = 'middle';
                octx.strokeStyle = '#fff';
                octx.lineWidth = isMobile() ? 1.15 : 1.65;
                octx.lineJoin = 'round';
                octx.strokeText(text, w / 2, y);
            }, gap, cap);
        }

        function createTextCluster(points, originX, originY, color) {
            const total = Math.max(1, points.length);
            points.forEach((point, index) => {
                const hueColor = color || `hsl(${Math.round(index / total * 360)},100%,66%)`;
                addParticle({
                    x: originX + random(-11, 11),
                    y: originY + random(-11, 11),
                    targetX: point.x + random(-.55, .55),
                    targetY: point.y + random(-.55, .55),
                    vx: random(-1.05, 1.05),
                    vy: random(-1.05, 1.05),
                    color: hueColor,
                    size: isMobile() ? random(.42, .66) : random(.46, .74),
                    text: true,
                    gravity: 0,
                    friction: .99,
                    decay: .0068,
                    twinkle: Math.random() < .18
                });
            });
            trimParticles();
        }

        function createTextExplosion(text, y, color) {
            const points = createTextPointCloud(text, y);
            createTextCluster(points, width / 2, y + random(-8, 8), color);
            createNormalExplosion(width / 2, y, color || 'random', isMobile() ? 28 : 42, 3.2);
        }

        function splitTextPoints(points, groupCount) {
            const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
            const groups = Array.from({ length: groupCount }, () => []);
            sorted.forEach((point, index) => {
                const groupIndex = Math.min(groupCount - 1, Math.floor(index * groupCount / Math.max(1, sorted.length)));
                groups[groupIndex].push(point);
            });
            return groups.filter(group => group.length);
        }

        function launchTextFormation(text, y, color) {
            const points = createTextPointCloud(text, y);
            const groupCount = isMobile() ? 6 : 9;
            const groups = splitTextPoints(points, groupCount);
            const bases = isMobile() ? [.08, .30, .50, .70, .92] : [.05, .20, .35, .50, .65, .80, .95];
            groups.forEach((group, index) => {
                const centroidX = group.reduce((sum, point) => sum + point.x, 0) / group.length;
                const centroidY = group.reduce((sum, point) => sum + point.y, 0) / group.length;
                const baseIndex = Math.min(bases.length - 1, Math.floor(index * bases.length / groups.length));
                rockets.push(new FormationRocket({
                    startX: width * bases[baseIndex] + random(-7, 7),
                    targetX: centroidX,
                    targetY: centroidY,
                    points: group,
                    color,
                    // Các quạt rời bệ gần như đồng thời, không xếp hàng chờ nhau.
                    delayMs: (index % 3) * (isMobile() ? 18 : 14),
                    durationMs: isMobile() ? random(310, 370) : random(350, 420)
                }));
            });
            trimParticles();
        }

        function createFlagExplosion(y) {
            const gap = isMobile() ? 6 : 7;
            const cap = isMobile() ? 1600 : 2600;
            const points = sampleCanvas((octx, w) => {
                const flagW = isMobile() ? w * .54 : w * .28;
                const flagH = flagW * 2 / 3;
                const x = (w - flagW) / 2;
                const top = y - flagH / 2;
                octx.fillStyle = '#da251d';
                octx.fillRect(x, top, flagW, flagH);
                const radius = flagH * .25;
                const cx = w / 2;
                const cy = y;
                octx.fillStyle = '#ffed00';
                octx.beginPath();
                for (let i = 0; i < 10; i += 1) {
                    const angle = -Math.PI / 2 + i * Math.PI / 5;
                    const r = i % 2 === 0 ? radius : radius * .4;
                    const px = cx + Math.cos(angle) * r;
                    const py = cy + Math.sin(angle) * r;
                    if (i === 0) octx.moveTo(px, py); else octx.lineTo(px, py);
                }
                octx.closePath();
                octx.fill();
            }, gap, cap);

            points.forEach(point => {
                const yellow = point.r > 220 && point.g > 180 && point.b < 90;
                addParticle({
                    x: width / 2 + random(-18, 18),
                    y: y + random(-18, 18),
                    targetX: point.x,
                    targetY: point.y,
                    color: yellow ? '#ffed00' : '#da251d',
                    size: isMobile() ? .9 : 1.25,
                    text: true
                });
            });
            createNormalExplosion(width / 2, y, '#da251d', 50, 3.5);
            trimParticles();
        }

        function roundedRectPath(octx, x, y, w, h, radius) {
            const r = Math.min(radius, w / 2, h / 2);
            octx.beginPath();
            octx.moveTo(x + r, y);
            octx.lineTo(x + w - r, y);
            octx.quadraticCurveTo(x + w, y, x + w, y + r);
            octx.lineTo(x + w, y + h - r);
            octx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            octx.lineTo(x + r, y + h);
            octx.quadraticCurveTo(x, y + h, x, y + h - r);
            octx.lineTo(x, y + r);
            octx.quadraticCurveTo(x, y, x + r, y);
            octx.closePath();
        }

        function createTankExplosion(y) {
            const gap = isMobile() ? 5 : 7;
            const cap = isMobile() ? 1800 : 3000;
            const points = sampleCanvas((octx, w) => {
                const scale = isMobile() ? .62 : 1;
                const cx = w / 2;
                const cy = y + 25 * scale;
                octx.lineJoin = 'round';
                octx.lineCap = 'round';
                octx.strokeStyle = '#d5a019';
                octx.lineWidth = isMobile() ? 4 : 6;
                octx.strokeRect(cx - 180 * scale, cy - 120 * scale, 20 * scale, 180 * scale);
                octx.strokeRect(cx - 160 * scale, cy - 110 * scale, 60 * scale, 170 * scale);
                octx.strokeRect(cx + 160 * scale, cy - 120 * scale, 20 * scale, 180 * scale);
                octx.strokeStyle = '#36d34a';
                roundedRectPath(octx, cx - 100 * scale, cy + 20 * scale, 200 * scale, 40 * scale, 20 * scale);
                octx.stroke();
                for (let i = 0; i < 5; i += 1) {
                    octx.beginPath();
                    octx.arc(cx - 70 * scale + i * 35 * scale, cy + 40 * scale, 12 * scale, 0, Math.PI * 2);
                    octx.stroke();
                }
                octx.beginPath();
                octx.moveTo(cx - 110 * scale, cy + 20 * scale);
                octx.lineTo(cx + 90 * scale, cy + 20 * scale);
                octx.lineTo(cx + 70 * scale, cy - 10 * scale);
                octx.lineTo(cx - 90 * scale, cy - 10 * scale);
                octx.closePath();
                octx.stroke();
                octx.beginPath();
                octx.arc(cx - 10 * scale, cy - 10 * scale, 45 * scale, Math.PI, 0);
                octx.lineTo(cx - 55 * scale, cy - 10 * scale);
                octx.stroke();
                octx.lineWidth = isMobile() ? 7 : 10;
                octx.beginPath();
                octx.moveTo(cx + 30 * scale, cy - 25 * scale);
                octx.lineTo(cx + 160 * scale, cy - 35 * scale);
                octx.stroke();
                octx.fillStyle = '#ffed00';
                octx.font = `900 ${30 * scale}px Arial`;
                octx.textAlign = 'center';
                octx.fillText('★', cx - 10 * scale, cy - 17 * scale);
            }, gap, cap);

            points.forEach(point => {
                let color = '#36d34a';
                if (point.r > 180 && point.g > 130 && point.b < 80) color = '#d5a019';
                if (point.r > 220 && point.g > 190 && point.b < 90) color = '#ffed00';
                addParticle({
                    x: width / 2 + random(-18, 18),
                    y: y + random(-18, 18),
                    targetX: point.x,
                    targetY: point.y,
                    color,
                    size: isMobile() ? .85 : 1.2,
                    text: true
                });
            });
            createNormalExplosion(width / 2, y, '#36d34a', 48, 3.5);
            trimParticles();
        }

        function launchNormal(x, targetY, color = 'random', burstStyle = 'auto', burstPower = 1) {
            rockets.push(new Rocket({
                x,
                targetY,
                color: color === 'random' ? randomColor() : color,
                burstStyle,
                burstPower
            }));
        }

        function launchPayload(type, text, y, color) {
            rockets.push(new Rocket({
                x: width / 2,
                targetY: Math.max(70, y),
                color: color || '#fff',
                payload: { type, text, y, color }
            }));
        }

        async function fanSweepAt(baseX, count, spread = 58, delay = 0, powerScale = 1, color = '#ffd76a') {
            if (delay) await wait(delay);
            const startAngle = -spread;
            const endAngle = spread;
            const step = (endAngle - startAngle) / Math.max(1, count - 1);
            for (let i = 0; i < count && !stopped; i += 1) {
                const angle = startAngle + i * step;
                const rad = angle * Math.PI / 180;
                const power = (isMobile() ? 12.8 : 16.1) * powerScale;
                rockets.push(new Rocket({
                    x: baseX,
                    targetY: height * (.18 + Math.abs(angle) / 840),
                    color: i % 3 === 0 ? '#fff2ad' : color,
                    vx: Math.sin(rad) * power * .70,
                    vy: -Math.cos(rad) * power,
                    fan: true,
                    burstStyle: 'palm',
                    burstPower: .78
                }));
                await wait(isMobile() ? 42 : 31);
            }
        }

        async function multiFanSweep() {
            // Hàng quạt thấp chạy ngang màn hình giống sân khấu pháo hoa ngoài trời.
            const count = isMobile() ? 5 : 7;
            const bases = isMobile()
                ? [.06, .28, .50, .72, .94]
                : [.04, .20, .36, .52, .68, .84, .96];
            const tasks = bases.map((base, index) => fanSweepAt(
                width * base,
                count + (index === Math.floor(bases.length / 2) ? 2 : 0),
                index === 0 || index === bases.length - 1 ? 34 : 42,
                index * (isMobile() ? 38 : 28),
                index === Math.floor(bases.length / 2) ? 1.05 : .88,
                index % 2 ? '#ff708f' : '#ffd76a'
            ));
            await Promise.all(tasks);
        }

        async function skyBarrage() {
            // Các quả tròn lớn phía trên và dãy quả nhỏ ở giữa tạo nhiều tầng như ảnh tham khảo.
            const topShells = isMobile()
                ? [
                    [.28, .17, 'double', '#ff5577', 1.0],
                    [.70, .15, 'willow', '#ffd76a', 1.04]
                ]
                : [
                    [.18, .18, 'chrysanthemum', '#ff5d78', 1.0],
                    [.50, .12, 'double', '#65d7ff', 1.12],
                    [.82, .18, 'willow', '#ffd76a', 1.04]
                ];
            topShells.forEach(([x, y, style, color, power]) => launchNormal(width * x, height * y, color, style, power));

            await wait(isMobile() ? 260 : 220);
            const rowCount = isMobile() ? 5 : 8;
            for (let i = 0; i < rowCount && !stopped; i += 1) {
                const x = width * (.09 + i * (.82 / Math.max(1, rowCount - 1)));
                launchNormal(x, height * random(.25, .36), i % 2 ? '#75cfff' : '#ff6a93', i % 3 === 0 ? 'double' : 'peony', .76);
                await wait(isMobile() ? 70 : 48);
            }
        }

        let lastFrameTime = 0;

        function animate(timestamp = performance.now()) {
            if (stopped) return;
            const dtMs = lastFrameTime ? clamp(timestamp - lastFrameTime, 7, 55) : 16.667;
            const dt = dtMs / 16.667;
            lastFrameTime = timestamp;
            frame += dt;
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgba(2,4,10,.19)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';

            for (let i = rockets.length - 1; i >= 0; i -= 1) {
                const rocket = rockets[i];
                rocket.update(dt, dtMs);
                rocket.draw();
                if (rocket.exploded) rockets.splice(i, 1);
            }
            for (let i = particles.length - 1; i >= 0; i -= 1) {
                const particle = particles[i];
                particle.update(dt, dtMs);
                particle.draw();
                if (particle.alpha <= 0 || particle.y > height + 120 || particle.x < -180 || particle.x > width + 180) particles.splice(i, 1);
            }

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            animationId = requestAnimationFrame(animate);
        }

        async function openingSequence() {
            // Mở màn theo từng lớp thay vì các quả rời rạc cùng kích thước.
            launchNormal(width * .50, height * .16, '#ffd76a', 'willow', 1.10);
            await wait(220);
            launchNormal(width * .24, height * .23, '#ff5d78', 'double', .94);
            launchNormal(width * .76, height * .21, '#6bdcff', 'chrysanthemum', .98);
            await wait(460);

            const row = isMobile() ? 4 : 6;
            for (let i = 0; i < row && !stopped; i += 1) {
                const x = width * (.10 + i * (.80 / Math.max(1, row - 1)));
                launchNormal(x, height * random(.27, .37), 'random', i % 2 ? 'ring' : 'peony', .78);
                await wait(isMobile() ? 125 : 90);
            }
        }

        async function textSequence(sequence) {
            const count = sequence.lines.length;
            const top = isMobile() ? height * .17 : height * .23;
            const bottom = isMobile() ? height * .70 : height * .49;
            const step = count > 1 ? (bottom - top) / (count - 1) : 0;
            for (let i = 0; i < count && !stopped; i += 1) {
                const y = top + step * i;
                const color = sequence.colors[i % sequence.colors.length];
                launchTextFormation(sequence.lines[i], y, color);

                // Chữ hình thành trong lúc nền vẫn còn những quả tròn mảnh và quạt thấp đang rơi.
                const sideX = i % 2 === 0 ? .10 : .90;
                launchNormal(width * sideX, random(height * .13, height * .27), 'random', i % 2 ? 'willow' : 'double', .72);
                if (!isMobile()) {
                    launchNormal(width * (1 - sideX), random(height * .15, height * .29), 'random', i % 2 ? 'peony' : 'ring', .68);
                }
                await wait(isMobile() ? 320 : 390);
            }
            if (sequence.special && !stopped) {
                await wait(140);
                launchPayload(sequence.special, '', isMobile() ? height * .80 : height * .70, sequence.special === 'flag' ? '#da251d' : '#36d34a');
            }
        }

        async function finaleSequence() {
            if (stopped) return;
            launchPayload('heart', '', height * .18, '#ff3f80');
            await wait(280);
            rockets.push(new Rocket({ x: width * .42, targetY: height * .22, color: '#ff4f88', payload: { type: 'heart' } }));
            await wait(280);
            rockets.push(new Rocket({ x: width * .58, targetY: height * .18, color: '#ff7ba8', payload: { type: 'heart' } }));
            for (let i = 0; i < (isMobile() ? 7 : 10) && !stopped; i += 1) {
                launchNormal(random(width * .08, width * .92), random(height * .10, height * .28), 'random');
                await wait(240);
            }
        }

        try {
            resize();
            window.addEventListener('resize', resize, { passive: true });
            skipButton.addEventListener('click', stopNow, { once: true });
            overlay.addEventListener('contextmenu', event => event.preventDefault());
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            overlay.classList.add('active');
            lastFrameTime = 0;
            animate(performance.now());

            const sequence = eventSequence(eventData, year, isMobile());
            await wait(650);
            await openingSequence();
            if (!stopped) {
                // Quạt thấp, dãy pháo giữa và các quả lớn phía trên chạy chồng thời gian.
                // Chữ bắt đầu ghép ngay khi các quạt vẫn đang bắn và các tia pháo còn rơi.
                const fanBackdrop = multiFanSweep();
                const skyBackdrop = skyBarrage();
                await wait(isMobile() ? 330 : 280);
                await textSequence(sequence);
                await Promise.all([fanBackdrop, skyBackdrop]);
            }
            if (!stopped) await wait(isMobile() ? 2150 : 2400);
            if (!stopped) await finaleSequence();
            if (!stopped) await wait(2200);
        } finally {
            stopped = true;
            cancelAnimationFrame(animationId);
            overlay.classList.remove('active');
            await wait(680);
            rockets.length = 0;
            particles.length = 0;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            window.removeEventListener('resize', resize);
            document.documentElement.style.overflow = previousOverflow;
            document.body.style.overflow = previousBodyOverflow;
            running = false;
        }
    }

    window.VinhHolidayFireworks = Object.freeze({ run, version: 5, canChiYear });
})();
