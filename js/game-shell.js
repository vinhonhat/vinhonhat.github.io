(() => {
  'use strict';
  const fallback = '/pages/pages-giaitri/giaitri.html';
  const sameOriginReferrer = (() => { try { const u=new URL(document.referrer); return u.origin===location.origin && u.href!==location.href; } catch { return false; } })();
  const back = () => { if (sameOriginReferrer || history.length > 1) history.back(); else location.href = fallback; };
  const prevent = event => { if (!event.target.closest('button,input,select,textarea')) event.preventDefault(); };
  document.addEventListener('touchmove', prevent, {passive:false});
  document.addEventListener('gesturestart', e => e.preventDefault(), {passive:false});
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-game-back]').forEach(button => button.addEventListener('click', back));
  });
  window.GameShell = {
    back,
    setScore(value, label='Điểm') { const n=document.querySelector('[data-game-score]'); if(n){n.textContent=`${label}: ${value}`;} },
    showOverlay(title, message, action='Chơi lại', onAction=()=>{}) {
      const o=document.querySelector('[data-game-overlay]'); if(!o) return;
      o.hidden=false; o.querySelector('[data-overlay-title]').textContent=title; o.querySelector('[data-overlay-message]').textContent=message;
      const b=o.querySelector('[data-overlay-action]'); b.textContent=action; b.onclick=()=>{o.hidden=true;onAction();};
    },
    hideOverlay(){const o=document.querySelector('[data-game-overlay]');if(o)o.hidden=true;},
    fitCanvas(canvas, aspect=1, max=760){
      const holder=canvas.parentElement; const r=holder.getBoundingClientRect(); let w=Math.min(r.width,max),h=Math.min(r.height,max);
      if(w/h>aspect)w=h*aspect;else h=w/aspect; const d=Math.min(devicePixelRatio||1,2);
      canvas.style.width=`${Math.floor(w)}px`;canvas.style.height=`${Math.floor(h)}px`;canvas.width=Math.floor(w*d);canvas.height=Math.floor(h*d);
      const ctx=canvas.getContext('2d');ctx.setTransform(d,0,0,d,0,0);return {width:w,height:h,ctx,dpr:d};
    },
    swipe(element, callback, threshold=24){let x=0,y=0,active=false;element.addEventListener('pointerdown',e=>{x=e.clientX;y=e.clientY;active=true;element.setPointerCapture?.(e.pointerId)});element.addEventListener('pointerup',e=>{if(!active)return;active=false;const dx=e.clientX-x,dy=e.clientY-y;if(Math.max(Math.abs(dx),Math.abs(dy))<threshold)return;callback(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});},
    best(key, value){const k=`vinh-game-${key}`;const old=Number(localStorage.getItem(k)||0);if(value!==undefined&&value>old)localStorage.setItem(k,String(value));return Math.max(old,Number(value)||0);}
  };
})();
