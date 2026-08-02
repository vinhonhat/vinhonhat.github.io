(() => {
    'use strict';
    if (window.VinhHolidayFireworks) return;

    const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));
    let running = false;

    function ensureUi() {
        if (!document.getElementById('vinh-fireworks-style')) {
            const style = document.createElement('style');
            style.id = 'vinh-fireworks-style';
            style.textContent = `
                #vinh-fireworks-overlay{position:fixed;inset:0;z-index:9999999;display:grid;place-items:center;overflow:hidden;background:#05070d;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .45s ease,visibility 0s linear .45s}
                #vinh-fireworks-overlay.active{opacity:1;visibility:visible;pointer-events:auto;transition-delay:0s}
                #vinh-fireworks-canvas{position:absolute;inset:0;width:100%;height:100%}
                #vinh-fireworks-message{position:relative;z-index:1;max-width:min(900px,92vw);padding:24px;text-align:center;color:#ffd65a;font-family:ui-rounded,"Segoe UI",Arial,sans-serif;font-size:clamp(34px,7vw,78px);font-weight:850;line-height:1.18;text-shadow:0 3px 0 #a93100,0 0 26px rgba(255,198,45,.7);opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease}
                #vinh-fireworks-overlay.show-message #vinh-fireworks-message{opacity:1;transform:none}
            `;
            document.head.appendChild(style);
        }
        let overlay = document.getElementById('vinh-fireworks-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'vinh-fireworks-overlay';
            overlay.innerHTML = '<canvas id="vinh-fireworks-canvas" aria-hidden="true"></canvas><div id="vinh-fireworks-message"></div>';
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    function messageFor(eventData, year) {
        const id = eventData?.imagePrefix || '';
        if (id === 'tet') return `Chúc Mừng Năm Mới ${year}`;
        if (id === '0101') return `Happy New Year ${year}`;
        if (id === '0430') return `Kỷ niệm ${year - 1975} năm Giải phóng miền Nam`;
        if (id === '0902') return `Chúc mừng ${year - 1945} năm Quốc khánh Việt Nam`;
        return String(eventData?.name || 'Chúc mừng ngày lễ');
    }

    async function run(eventData, year = new Date().getFullYear()) {
        if (running) return;
        running = true;
        const overlay = ensureUi();
        const canvas = overlay.querySelector('#vinh-fireworks-canvas');
        const message = overlay.querySelector('#vinh-fireworks-message');
        const ctx = canvas.getContext('2d', { alpha: true });
        message.textContent = messageFor(eventData, year);

        let width = 0, height = 0, frame = 0, animationId = 0;
        const particles = [];
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth; height = window.innerHeight;
            canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const burst = (x, y) => {
            const hue = Math.floor(Math.random() * 360);
            const count = width < 700 ? 48 : 72;
            for (let i = 0; i < count; i += 1) {
                const angle = (Math.PI * 2 * i / count) + Math.random() * .08;
                const speed = 1.8 + Math.random() * 4.2;
                particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, hue: hue + Math.random() * 30 - 15, size: 1.2 + Math.random() * 2.2 });
            }
        };
        const draw = () => {
            ctx.fillStyle = 'rgba(5,7,13,.16)';
            ctx.fillRect(0, 0, width, height);
            frame += 1;
            if (frame % (width < 700 ? 38 : 30) === 0) burst(width * (.15 + Math.random() * .7), height * (.12 + Math.random() * .46));
            for (let i = particles.length - 1; i >= 0; i -= 1) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy; p.vy += .035; p.vx *= .992; p.life -= .012;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.life})`; ctx.fill();
            }
            animationId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener('resize', resize, { passive: true });
        overlay.classList.add('active');
        burst(width * .28, height * .3); burst(width * .72, height * .34);
        draw();
        await sleep(700);
        overlay.classList.add('show-message');
        await sleep(4500);
        overlay.classList.remove('show-message', 'active');
        await sleep(500);
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resize);
        particles.length = 0;
        ctx.clearRect(0, 0, width, height);
        running = false;
    }

    window.VinhHolidayFireworks = { run };
})();
