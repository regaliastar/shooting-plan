import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');
const baked=JSON.parse(await readFile(new URL('../.sites-runtime/catalog.json',import.meta.url),'utf8'));
let sequence=0;
const context={waitUntil:promise=>promise.catch(()=>{})};
const request=path=>new Request('https://photo.example'+path);
const file=(text,type='text/html; charset=utf-8')=>({type,body:Buffer.from(text).toString('base64')});

async function harness(t) {
  const originalFetch=globalThis.fetch;
  const originalNow=Date.now;
  const originalCaches=Object.getOwnPropertyDescriptor(globalThis,'caches');
  let now=Date.UTC(2026,9,23,8);
  let calls=0;
  let response=()=>Response.json(baked);
  globalThis.fetch=async()=>{calls++;return response();};
  Date.now=()=>now;
  Object.defineProperty(globalThis,'caches',{value:undefined,writable:true,configurable:true});
  t.after(()=>{globalThis.fetch=originalFetch;Date.now=originalNow;if(originalCaches)Object.defineProperty(globalThis,'caches',originalCaches);else delete globalThis.caches;});
  const {default:worker}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${sequence++}`);
  return {
    get:async(path,method='GET')=>worker.fetch(new Request(request(path),{method}),{},context),
    remote:callback=>{response=callback;},
    advance:ms=>{now+=ms;},
    calls:()=>calls,
    now:()=>now,
    catalog:()=>({...structuredClone(baked),sourceCommit:'1'.repeat(40)})
  };
}

test('new pages, replacements, images, downloads and removals come from one GitHub snapshot',async t=>{
  const h=await harness(t),c=h.catalog();
  c.files['/index.html']=file('<h1>Updated from GitHub</h1>');
  c.files['/plans/new-plan/index.html']=file('<h1>A newly added plan</h1>');
  c.files['/assets/new-image.webp']=file('new image bytes','image/webp');
  c.files['/briefs/new-plan.txt']=file('new downloadable brief','text/plain; charset=utf-8');
  delete c.files['/plans/ryo-industrial/index.html'];
  h.remote(()=>Response.json(c));
  assert.match(await (await h.get('/')).text(),/Updated from GitHub/);
  assert.match(await (await h.get('/plans/new-plan/')).text(),/newly added plan/);
  assert.equal(await (await h.get('/assets/new-image.webp')).text(),'new image bytes');
  const download=await h.get('/briefs/new-plan.txt');
  assert.match(download.headers.get('Content-Disposition'),/attachment/);
  assert.equal(await download.text(),'new downloadable brief');
  assert.equal((await h.get('/plans/ryo-industrial/')).status,404,'deleted routes must not reappear from the baked snapshot');
  const redirect=await h.get('/plans/new-plan');
  assert.equal(redirect.status,308);
  assert.equal(redirect.headers.get('Location'),'https://photo.example/plans/new-plan/');
  assert.equal(await (await h.get('/plans/new-plan/','HEAD')).text(),'');
  assert.equal(h.calls(),1,'all pages use one atomic content package');
});

test('refreshes content after one minute without a Site deployment',async t=>{
  const h=await harness(t),first=h.catalog();
  h.remote(()=>Response.json(first));
  assert.equal((await h.get('/')).headers.get('X-Content-Revision'),'1'.repeat(40));
  h.advance(59_999);await h.get('/');assert.equal(h.calls(),1);
  const next=h.catalog();next.sourceCommit='2'.repeat(40);next.files['/index.html']=file('second revision');
  h.remote(()=>Response.json(next));h.advance(1);
  const updated=await h.get('/');
  assert.equal(updated.headers.get('X-Content-Revision'),'2'.repeat(40));
  assert.equal(await updated.text(),'second revision');assert.equal(h.calls(),2);
});

test('rejects malformed releases and retains the previous valid release',async t=>{
  const h=await harness(t),first=h.catalog();h.remote(()=>Response.json(first));await h.get('/');
  const invalid=h.catalog();invalid.sourceCommit='2'.repeat(40);invalid.files['/assets/industrial.webp'].body='invalid base64 $$$';
  h.remote(()=>Response.json(invalid));h.advance(60_001);
  assert.equal((await h.get('/')).headers.get('X-Content-Revision'),first.sourceCommit);
  const status=await (await h.get('/__sync')).json();assert.equal(status.degraded,true);
  h.remote(()=>{throw Error('GitHub unavailable');});h.advance(60_001);
  assert.equal((await h.get('/')).status,200);
  assert.equal((await (await h.get('/__sync')).json()).sourceCommit,first.sourceCommit);
});

test('uses the bundled release during a first-request GitHub outage and recovers',async t=>{
  const h=await harness(t);h.remote(()=>new Response('unavailable',{status:503}));
  assert.equal((await h.get('/')).status,200);
  const offline=await (await h.get('/__sync')).json();assert.equal(offline.source,'bundled');assert.equal(offline.degraded,true);
  const online=h.catalog();h.remote(()=>Response.json(online));h.advance(60_001);
  const recovered=await (await h.get('/__sync')).json();assert.equal(recovered.sourceCommit,online.sourceCommit);assert.equal(recovered.degraded,false);
});

test('shares validated snapshots across isolates through the edge cache',async t=>{
  const h=await harness(t),c=h.catalog();
  globalThis.caches={default:{match:async()=>new Response(JSON.stringify(c),{headers:{'X-Checked-At':String(h.now())}})}};
  const status=await (await h.get('/__sync')).json();
  assert.equal(status.source,'cache');assert.equal(status.sourceCommit,c.sourceCommit);assert.equal(h.calls(),0);
});

test('rejects mutations without contacting GitHub',async t=>{
  const h=await harness(t);assert.equal((await h.get('/','POST')).status,405);assert.equal(h.calls(),0);
});
