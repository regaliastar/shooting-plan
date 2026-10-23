import { readFile, readdir, mkdir, writeFile, rm, cp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Keep the existing static generator as the only page renderer. Package its
// complete output atomically so new pages and images travel with the content.
const files = {};
const types = {'.pdf':'application/pdf','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
for (const name of await readdir('dist', {recursive:true})) {
  const type = types[path.extname(name)];
  if (!type) continue;
  const body = await readFile(path.join('dist', name));
  files['/'+name.split(path.sep).join('/')] = {type,body:body.toString('base64')};
}
const catalog = {
  formatVersion:1,
  sourceCommit:process.env.GITHUB_SHA || execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  builtAt:new Date().toISOString(),
  files
};
const serialized = JSON.stringify(catalog);
if (Buffer.byteLength(serialized) > 12 * 1024 * 1024) throw Error('Content package exceeds 12 MiB. Compress images before publishing.');
await mkdir('.sites-runtime',{recursive:true});
await writeFile('.sites-runtime/catalog.json',serialized);
const source = await readFile('worker/index.js','utf8');
const marker = "import bakedCatalog from 'site:catalog';";
if (source.split(marker).length !== 2) throw Error('Worker must have one catalog import.');
const bundled = source.replace(marker, ()=>'const bakedCatalog = '+serialized+';');
await rm('dist',{recursive:true,force:true});
await mkdir('dist/server',{recursive:true});
await mkdir('dist/.openai',{recursive:true});
await writeFile('dist/server/index.js',bundled);
await cp('.openai/hosting.json','dist/.openai/hosting.json');
console.log(`Bundled ${Object.keys(files).length} files; content package ${Math.round(Buffer.byteLength(serialized)/1024)} KiB.`);
