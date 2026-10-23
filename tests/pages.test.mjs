import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const {basePath}=JSON.parse(await readFile(new URL('../.sites-runtime/pages.json',import.meta.url),'utf8'));
const names=await readdir(root,{recursive:true});
const htmlNames=names.filter(name=>name.endsWith('.html'));

test('every internal page, image, stylesheet, script and download stays inside the Pages base path',async()=>{
  assert(htmlNames.includes('index.html'));
  assert(htmlNames.includes('404.html'));
  for(const name of htmlNames){
    const html=await readFile(path.join(root,name),'utf8');
    for(const [,attribute,value] of html.matchAll(/\b(href|src|data-image)="([^"]*)"/g)){
      if(!value||value.startsWith('#')||/^(https?:|data:|mailto:)/.test(value))continue;
      assert(value.startsWith(`${basePath}/`),`${name}: ${attribute}=${value} escapes ${basePath||'/'}`);
      const url=new URL(value,'https://pages.example');
      let target=decodeURIComponent(url.pathname).slice(basePath.length).replace(/^\//,'');
      if(!target||target.endsWith('/'))target+='index.html';
      assert(!target.split('/').includes('..'));
      const file=await stat(path.join(root,target));
      assert(file.isFile(),`${name}: missing ${target}`);
    }
  }
});

test('published plan pages include complete local previews and downloadable image-rich PDFs',async()=>{
  const plans=htmlNames.filter(name=>name.startsWith('plans/'));
  assert(plans.length>0);
  for(const name of plans){
    const html=await readFile(path.join(root,name),'utf8');
    assert.match(html,/class="effect-card"/);
    assert.match(html,/class="effect-diagrams"/);
    assert(!/<(?:img|script)[^>]+src="https?:/.test(html),'previews and scripts must be local');
    const pdfLinks=[...html.matchAll(/href="([^"]+\.pdf)" download/g)];
    assert(pdfLinks.length>0,'missing PDF download');
    for(const [,href] of pdfLinks){
      const pdf=await readFile(path.join(root,href.slice(basePath.length).replace(/^\//,'')));
      assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
      assert(pdf.length>1000,'PDF should contain embedded images and composition information');
      assert(pdf.toString('latin1').includes('/Subtype /Image'),'PDF has no image resource');
    }
  }
});

test('Pages artifact contains plain static files without a GPT runtime or external content feed',async()=>{
  assert(names.includes('.nojekyll'));
  assert(!names.some(name=>name.startsWith('server/')||name.startsWith('.openai/')));
  const app=await readFile(path.join(root,'assets/app.js'),'utf8');
  assert(!app.includes('chatgpt.site'));
  assert(!app.includes('raw.githubusercontent.com'));
  assert(!app.includes('fetch('),'the presentation should work without a content API');
});
