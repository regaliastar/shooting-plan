// @ts-check
import bakedCatalog from 'site:catalog';

/** @typedef {{type:string,body:string}} ContentFile */
/** @typedef {{formatVersion:1,sourceCommit:string,builtAt:string,files:Record<string,ContentFile>}} Catalog */
/** @typedef {{catalog:Catalog,checkedAt:number,source:string,degraded:boolean}} Snapshot */
/** @typedef {{waitUntil(promise:Promise<unknown>):void}} Context */

const CONTENT_URL = 'https://raw.githubusercontent.com/regaliastar/shooting-plan/site-content/catalog.json';
const REFRESH_MS = 60_000;
/** @type {Snapshot} */
let snapshot = {catalog:bakedCatalog,checkedAt:0,source:'bundled',degraded:true};
/** @type {Promise<Snapshot>|undefined} */
let pending;

/** @param {unknown} value @returns {value is Catalog} */
function validCatalog(value) {
  if (!value || typeof value !== 'object') return false;
  const c = /** @type {Catalog} */ (value);
  if (c.formatVersion !== 1 || !/^[a-f0-9]{40}$/.test(c.sourceCommit) || !Number.isFinite(Date.parse(c.builtAt)) || !c.files || typeof c.files !== 'object' || Array.isArray(c.files)) return false;
  if (!c.files['/index.html'] || !c.files['/404.html'] || !c.files['/assets/app.js'] || !c.files['/assets/style.css']) return false;
  const types = new Set(['text/html; charset=utf-8','text/css; charset=utf-8','text/javascript; charset=utf-8','text/plain; charset=utf-8','application/json; charset=utf-8','image/webp','image/png','image/jpeg','image/gif','image/svg+xml','image/x-icon']);
  return Object.entries(c.files).every(([p,f])=>p.startsWith('/')&&!p.includes('..')&&!p.includes('?')&&!p.includes('#')&&!!f&&types.has(f.type)&&typeof f.body==='string'&&f.body.length>0);
}

/** @param {Request} request @param {Context} ctx @returns {Promise<Snapshot>} */
async function content(request, ctx) {
  if (snapshot.checkedAt && Date.now()-snapshot.checkedAt < REFRESH_MS) return snapshot;
  if (pending) return pending;
  pending = (async()=>{
    const cache = typeof caches === 'undefined' ? undefined : /** @type {CacheStorage & {default?:Cache}} */ (caches).default;
    const key = new Request(new URL('/.internal/content-catalog',request.url));
    let previous = snapshot;
    try {
      const cached = await cache?.match(key);
      if (cached) {
        const catalog = await cached.json();
        const checkedAt = Number(cached.headers.get('X-Checked-At'));
        if (validCatalog(catalog) && Number.isFinite(checkedAt) && checkedAt>previous.checkedAt && checkedAt<=Date.now()) {
          previous={catalog,checkedAt,source:'cache',degraded:false};
          if (Date.now()-checkedAt < REFRESH_MS) { snapshot=previous; return snapshot; }
        }
      }
    } catch { /* Shared cache is optional; GitHub remains the content source. */ }
    try {
      const upstream = await fetch(`${CONTENT_URL}?v=${Math.floor(Date.now()/REFRESH_MS)}`,{
        headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(8_000)
      });
      if (!upstream.ok) throw Error(`Content fetch returned ${upstream.status}`);
      const text = await upstream.text();
      if (text.length>12*1024*1024) throw Error('Content package is too large');
      const catalog = JSON.parse(text);
      if (!validCatalog(catalog)) throw Error('Invalid content package');
      // Decode before accepting the snapshot: invalid file data cannot replace
      // the last known good release, including assets not visited immediately.
      for (const file of Object.values(catalog.files)) atob(file.body);
      snapshot={catalog,checkedAt:Date.now(),source:'github',degraded:false};
      if (cache) ctx.waitUntil(cache.put(key,new Response(text,{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=86400','X-Checked-At':String(snapshot.checkedAt)}})).catch(()=>{}));
    } catch {
      // Keep a validated prior release; throttle failures to once per minute.
      snapshot={...previous,checkedAt:Date.now(),degraded:true};
    }
    return snapshot;
  })();
  try { return await pending; } finally { pending=undefined; }
}

export default {
  /** @param {Request} request @param {unknown} env @param {Context} ctx */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method!=='GET' && request.method!=='HEAD') return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
    const state = await content(request,ctx);
    const headers = new Headers({'Cache-Control':'no-store','X-Content-Revision':state.catalog.sourceCommit});
    if (url.pathname==='/__sync') {
      headers.set('Content-Type','application/json; charset=utf-8');
      return new Response(request.method==='HEAD'?null:JSON.stringify({source:state.source,sourceCommit:state.catalog.sourceCommit,builtAt:state.catalog.builtAt,checkedAt:new Date(state.checkedAt).toISOString(),degraded:state.degraded}),{headers});
    }
    let pathname;
    try { pathname=decodeURIComponent(url.pathname); } catch { return new Response('Bad path',{status:400}); }
    const files=state.catalog.files;
    if (!pathname.endsWith('/') && files[`${pathname}/index.html`]) {
      url.pathname += '/';
      return new Response(null,{status:308,headers:{Location:url.toString(),'Cache-Control':'no-store'}});
    }
    const name=pathname.endsWith('/')?pathname+'index.html':pathname;
    const found=Object.hasOwn(files,name)?files[name]:undefined;
    const file=found||files['/404.html'];
    const bytes=Uint8Array.from(atob(file.body),c=>c.charCodeAt(0));
    headers.set('Content-Type',file.type);
    if (name.startsWith('/briefs/')&&found) headers.set('Content-Disposition',`attachment; filename="${name.split('/').pop()}"`);
    return new Response(request.method==='HEAD'?null:bytes,{status:found?200:404,headers});
  }
};
