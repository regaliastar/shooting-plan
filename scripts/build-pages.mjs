import {execFileSync} from 'node:child_process';
import {mkdir,writeFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const [owner,repository]=(process.env.GITHUB_REPOSITORY||'regaliastar/shooting-plan').split('/');
if(!owner||!repository)throw Error('GITHUB_REPOSITORY must contain owner/repository');
// configure-pages supplies an empty base path for a custom domain or user site.
const basePath=process.env.BASE_PATH??(repository.toLowerCase()===`${owner.toLowerCase()}.github.io`?'':`/${repository}`);
execFileSync(process.execPath,[fileURLToPath(new URL('build.mjs',import.meta.url))],{
  cwd:root,env:{...process.env,BASE_PATH:basePath},stdio:'inherit'
});
await writeFile(new URL('../dist/.nojekyll',import.meta.url),'');
await rm(new URL('../dist/_redirects',import.meta.url),{force:true});
await mkdir(new URL('../.sites-runtime/',import.meta.url),{recursive:true});
await writeFile(new URL('../.sites-runtime/pages.json',import.meta.url),JSON.stringify({basePath:basePath.replace(/\/$/,'')}));
console.log(`Built GitHub Pages static site at ${basePath||'/'}`);
