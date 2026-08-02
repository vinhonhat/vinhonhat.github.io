(() => {
  'use strict';
  const VERSION = window.VinhSiteVersion?.id || 'dev';
  const $ = (s, r=document) => r.querySelector(s);
  const escapeHtml = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ensureUrl = (v='') => { const x=String(v||'').trim(); return x || '#simContact'; };
  function planTemplate(plan){
    const features=(plan.features||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
    return `<article class="sim-plan-card" data-accent="${escapeHtml(plan.accent||'orange')}"><div class="sim-plan-top"><span class="sim-plan-icon">${escapeHtml(plan.icon||'S')}</span><span class="sim-plan-badge">${escapeHtml(plan.badge||'SIM')}</span></div><h3>${escapeHtml(plan.name)}</h3><p class="sim-plan-subtitle">${escapeHtml(plan.subtitle||'')}</p><div class="sim-plan-price">${escapeHtml(plan.price||'Liên hệ')}</div><ul class="sim-plan-features">${features}</ul><div class="sim-plan-for"><strong>Phù hợp với</strong>${escapeHtml(plan.recommendedFor||'')}</div><a class="sim-plan-action" href="${escapeHtml(ensureUrl(plan.orderUrl))}" ${plan.orderUrl?'target="_blank" rel="noopener"':''}>Xem tư vấn gói này</a></article>`;
  }
  function faqTemplate(item,index){ return `<article class="sim-faq-item${index===0?' open':''}"><button type="button">${escapeHtml(item.question||'Câu hỏi')}</button><p>${escapeHtml(item.answer||'')}</p></article>`; }
  async function init(){
    try{
      const [data,site]=await Promise.all([fetch(`/data/sim-plans.json?v=${VERSION}`,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('sim-plans');return r.json()}),fetch(`/data/site-config.json?v=${VERSION}`,{cache:'no-cache'}).then(r=>r.ok?r.json():({}))]);
      const page=data.page||{};
      $('#simEyebrow').textContent=page.eyebrow||'SIM NHẬT BẢN'; $('#simTitle').textContent=page.title||'Chọn SIM phù hợp'; $('#simDescription').textContent=page.description||'';
      $('#simPlanGrid').innerHTML=(data.plans||[]).filter(x=>x.enabled!==false).map(planTemplate).join('');
      $('#simFaqList').innerHTML=(data.faqs||[]).map(faqTemplate).join('');
      $('#simContactTitle').textContent=page.contactTitle||'Chưa biết chọn gói nào?'; $('#simContactText').textContent=page.contactText||''; $('#simNotice').textContent=page.notice||'';
      const contact=$('#simContactButton'); contact.textContent=page.contactButton||'Nhắn tin tư vấn'; const url=page.contactUrl||site?.social?.messenger||site?.social?.facebook||'#'; contact.href=url; if(url==='#'){contact.removeAttribute('target');}
      document.addEventListener('click',e=>{ const b=e.target.closest('.sim-faq-item button'); if(b)b.closest('.sim-faq-item').classList.toggle('open'); });
    }catch(err){ console.error(err); $('#simPlanGrid').innerHTML='<div class="home-empty-state"><strong>Chưa tải được thông tin SIM</strong><p>Kiểm tra file data/sim-plans.json rồi tải lại trang.</p></div>'; }
  }
  document.addEventListener('DOMContentLoaded',init,{once:true});
})();
