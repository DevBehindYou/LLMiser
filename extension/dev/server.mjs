import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildExtension } from '../scripts/build.mjs';
const directory=await buildExtension({preview:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1:3337');
  let decoded; try {decoded=decodeURIComponent(url.pathname);}catch{res.writeHead(400);return res.end();}
  const target=path.resolve(directory,'.'+(decoded==='/'?'/index.html':decoded));
  if(!target.startsWith(directory+path.sep)){res.writeHead(403);return res.end();}
  try {const body=await fs.readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'text/plain','Cache-Control':'no-store'});res.end(body);}
  catch{res.writeHead(404);res.end('Not found');}
}).listen(3337,'127.0.0.1',()=>console.log('Development preview: http://127.0.0.1:3337'));
