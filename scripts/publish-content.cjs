// Runs only in the main-branch publish job, with its built-in GITHUB_TOKEN.
module.exports = async ({github, context, core}) => {
  const fs = require('node:fs');
  const payload = fs.readFileSync('publish-input/catalog.json');
  const catalog = JSON.parse(payload);
  if (catalog.formatVersion!==1 || catalog.sourceCommit!==context.sha) throw Error('Content artifact does not match this source commit');
  const repo = context.repo;
  const latest = await github.rest.repos.getBranch({...repo,branch:'main'});
  if (latest.data.commit.sha!==context.sha) { core.notice('A newer main commit exists; skip this superseded content snapshot.'); return; }
  const branch='site-content';
  let ref;
  try { ref=await github.rest.git.getRef({...repo,ref:`heads/${branch}`}); }
  catch(error) { if(error.status!==404)throw error; }
  const blob=await github.rest.git.createBlob({...repo,content:payload.toString('base64'),encoding:'base64'});
  // The generated branch contains only the public content bundle.
  const tree=await github.rest.git.createTree({...repo,tree:[{path:'catalog.json',mode:'100644',type:'blob',sha:blob.data.sha}]});
  const commit=await github.rest.git.createCommit({...repo,message:`Publish site content from ${context.sha.slice(0,7)}`,tree:tree.data.sha,parents:ref?[ref.data.object.sha]:[]});
  if(ref) await github.rest.git.updateRef({...repo,ref:`heads/${branch}`,sha:commit.data.sha,force:false});
  else await github.rest.git.createRef({...repo,ref:`refs/heads/${branch}`,sha:commit.data.sha});
  core.notice(`Published content ${context.sha}; GPT Site will refresh its cache automatically.`);
};
