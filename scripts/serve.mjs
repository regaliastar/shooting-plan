import http from 'node:http';
import worker from '../dist/server/index.js';

http.createServer(async(req,res)=>{
  try {
    const request=new Request(new URL(req.url,'http://127.0.0.1:4173'),{method:req.method,headers:req.headers});
    const response=await worker.fetch(request,{}, {waitUntil:promise=>promise.catch(console.error)});
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch(error) { console.error(error);res.writeHead(500);res.end('Preview failed'); }
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
