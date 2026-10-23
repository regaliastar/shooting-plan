// @ts-check
/** @type {Set<string>} */
let saved = new Set();
try { const value=JSON.parse(localStorage.getItem('blue-hour-saved') || '[]'); if(Array.isArray(value)) saved=new Set(value.filter(x=>typeof x==='string')); } catch { /* Storage is optional. */ }
const toast=document.querySelector('#toast');
let toastTimer=0;
/** @param {string} message */
function notify(message){if(!toast)return;toast.textContent=message;toast.classList.add('visible');window.clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>toast.classList.remove('visible'),2700);}
function syncSaved(){
 document.querySelectorAll('[data-save]').forEach(el=>{if(!(el instanceof HTMLButtonElement))return;const has=saved.has(el.dataset.save||'');el.setAttribute('aria-pressed',String(has));el.textContent=el.classList.contains('save-button')?(has?'♥':'♡'):(has?'♥ 已收藏':'♡ 收藏企划');});
 const count=document.querySelector('#saved-count');if(count)count.textContent=String(saved.size);
}
let category='全部';
const search=document.querySelector('#search');
function filter(){
 const query=search instanceof HTMLInputElement?search.value.trim().toLocaleLowerCase():'';
 let visible=0;
 document.querySelectorAll('.plan-card').forEach(card=>{if(!(card instanceof HTMLElement))return;const slug=card.querySelector('[data-save]')?.getAttribute('data-save')||'';const match=(category==='全部'||(category==='收藏'?saved.has(slug):card.dataset.category===category))&&(!query||query.split(/\s+/).every(term=>(card.dataset.search||'').toLocaleLowerCase().includes(term)));card.hidden=!match;if(match)visible++;});
 const empty=document.querySelector('#empty-state');if(empty instanceof HTMLElement)empty.hidden=visible>0;
 const count=document.querySelector('#result-count');if(count)count.textContent=visible+' 份计划';
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.getAttribute('data-filter')||'全部';document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});filter();}));
search?.addEventListener('input',filter);
document.querySelector('#reset-search')?.addEventListener('click',()=>{if(search instanceof HTMLInputElement)search.value='';document.querySelector('[data-filter="全部"]')?.dispatchEvent(new Event('click'));search instanceof HTMLInputElement&&search.focus();});
document.querySelectorAll('[data-save]').forEach(button=>button.addEventListener('click',()=>{const slug=button.getAttribute('data-save');if(!slug)return;if(saved.has(slug)){saved.delete(slug);notify('已取消收藏');}else{saved.add(slug);notify('已收藏，随时回来看看');}try{localStorage.setItem('blue-hour-saved',JSON.stringify([...saved]));}catch{notify('当前浏览器未允许保存，收藏仅在本次页面有效');}syncSaved();filter();}));
syncSaved();
document.querySelectorAll('dialog').forEach(el=>{if(!(el instanceof HTMLDialogElement))return;el.querySelector('[data-close]')?.addEventListener('click',()=>el.close());el.addEventListener('click',event=>{if(event.target===el){const r=el.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)el.close();}});});
document.querySelector('#share-plan')?.addEventListener('click',async()=>{try{const url=new URL(window.location.href);url.hash='';await navigator.clipboard.writeText(url.toString());notify('企划链接已复制');}catch{notify('请从浏览器地址栏复制企划链接');}});
const imageDialog=document.querySelector('#image-dialog');
const largeImage=document.querySelector('#large-image');
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{if(!(imageDialog instanceof HTMLDialogElement)||!(largeImage instanceof HTMLImageElement))return;largeImage.src=button.getAttribute('data-image')||'';largeImage.alt=button.getAttribute('data-image-alt')||'实拍参考';const caption=document.querySelector('#image-caption');if(caption)caption.textContent=button.getAttribute('data-image-caption')||'';const error=document.querySelector('#image-error');if(error instanceof HTMLElement)error.hidden=true;imageDialog.showModal();}));
document.querySelectorAll('[data-check]').forEach(el=>{if(!(el instanceof HTMLInputElement))return;const key='blue-hour-check-'+el.dataset.check;try{el.checked=localStorage.getItem(key)==='1';}catch{}el.addEventListener('change',()=>{try{localStorage.setItem(key,el.checked?'1':'0');}catch{notify('勾选记录仅在本次页面有效');}});});

// An online original can reject embedding; keep its source link usable.
document.querySelectorAll('.reference-image img').forEach(img=>{
 if(!(img instanceof HTMLImageElement))return;
 const showFallback=()=>{img.hidden=true;const fallback=img.parentElement?.querySelector('.ref-fallback');if(fallback instanceof HTMLElement)fallback.hidden=false;};
 img.addEventListener('error',showFallback);
 if(img.complete&&img.naturalWidth===0)showFallback();
});
largeImage?.addEventListener('error',()=>{const error=document.querySelector('#image-error');if(error instanceof HTMLElement)error.hidden=false;});
{
 const sunset=document.querySelector('#sunset-time');
 if(sunset instanceof HTMLInputElement){
  const key='blue-hour-sunset-'+window.location.pathname;
  const update=()=>{
   const parts=sunset.value.match(/^(\d{2}):(\d{2})$/);
   const minutes=parts?Number(parts[1])*60+Number(parts[2]):null;
   document.querySelectorAll('[data-relative]').forEach(el=>{
    if(!(el instanceof HTMLElement))return;
    const relative=el.dataset.relative||'';
    el.textContent=minutes===null?relative:relative.replace(/S([−+])(\d+)/g,(_,sign,offset)=>{
     const absolute=minutes+(sign==='−'?-1:1)*Number(offset);
     const normalized=(absolute%1440+1440)%1440;
     return String(Math.floor(normalized/60)).padStart(2,'0')+':'+String(normalized%60).padStart(2,'0')+(absolute<0?'（前日）':absolute>=1440?'（次日）':'');
    });
   });
   try{if(sunset.value)localStorage.setItem(key,sunset.value);else localStorage.removeItem(key);}catch{}
  };
  try{sunset.value=localStorage.getItem(key)||'';}catch{}
  sunset.addEventListener('input',update);
  document.querySelector('#reset-sunset')?.addEventListener('click',()=>{sunset.value='';update();});
  update();
 }
}
