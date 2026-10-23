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
 document.querySelectorAll('.plan-card').forEach(card=>{if(!(card instanceof HTMLElement))return;const slug=card.querySelector('[data-save]')?.getAttribute('data-save')||'';const match=(category==='全部'||(category==='收藏'?saved.has(slug):card.dataset.category===category))&&(!query||(card.dataset.search||'').toLocaleLowerCase().includes(query));card.hidden=!match;if(match)visible++;});
 const empty=document.querySelector('#empty-state');if(empty instanceof HTMLElement)empty.hidden=visible>0;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.getAttribute('data-filter')||'全部';document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});filter();}));
search?.addEventListener('input',filter);
document.querySelectorAll('[data-save]').forEach(button=>button.addEventListener('click',()=>{const slug=button.getAttribute('data-save');if(!slug)return;if(saved.has(slug)){saved.delete(slug);notify('已取消收藏');}else{saved.add(slug);notify('已收藏，随时回来看看');}try{localStorage.setItem('blue-hour-saved',JSON.stringify([...saved]));}catch{notify('当前浏览器未允许保存，收藏仅在本次页面有效');}syncSaved();filter();}));
syncSaved();
const dialog=document.querySelector('#contact-dialog');
const brief=document.querySelector('#brief');
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{if(!(dialog instanceof HTMLDialogElement))return;const plan=button.getAttribute('data-plan');if(plan&&brief instanceof HTMLTextAreaElement)brief.value=brief.value.replace(/喜欢的企划：[^\n]*/,`喜欢的企划：${plan}`);dialog.showModal();}));
document.querySelectorAll('dialog').forEach(el=>{if(!(el instanceof HTMLDialogElement))return;el.querySelector('[data-close]')?.addEventListener('click',()=>el.close());el.addEventListener('click',event=>{if(event.target===el){const r=el.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)el.close();}});});
document.querySelector('#copy-brief')?.addEventListener('click',async()=>{if(!(brief instanceof HTMLTextAreaElement))return;try{await navigator.clipboard.writeText(brief.value);notify('沟通清单已复制');}catch{brief.focus();brief.select();notify('请复制已选中的沟通清单');}});
document.querySelector('#share-plan')?.addEventListener('click',async()=>{try{const url=new URL(window.location.href);url.hash='';await navigator.clipboard.writeText(url.toString());notify('企划链接已复制');}catch{notify('请从浏览器地址栏复制企划链接');}});
const imageDialog=document.querySelector('#image-dialog');
const largeImage=document.querySelector('#large-image');
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{if(!(imageDialog instanceof HTMLDialogElement)||!(largeImage instanceof HTMLImageElement))return;largeImage.src=button.getAttribute('data-image')||'';largeImage.alt=button.getAttribute('data-image-alt')||'AI 概念参考';imageDialog.showModal();}));
document.querySelectorAll('[data-check]').forEach(el=>{if(!(el instanceof HTMLInputElement))return;const key='blue-hour-check-'+el.dataset.check;try{el.checked=localStorage.getItem(key)==='1';}catch{}el.addEventListener('change',()=>{try{localStorage.setItem(key,el.checked?'1':'0');}catch{notify('勾选记录仅在本次页面有效');}});});
