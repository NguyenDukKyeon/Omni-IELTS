import { createServer } from 'node:http';
import { resolveWithYtDlp,checkYtDlp } from '../server/transcript-resolver.mjs';

const port=Number(process.env.TRANSCRIPT_COMPANION_PORT||17321);
const allowedOrigins=new Set(String(process.env.VOCAB_MASTER_ORIGINS||'http://localhost:3000,http://127.0.0.1:3000').split(',').map(value=>value.trim()).filter(Boolean));

function cors(req){const origin=String(req.headers.origin||'');const allowed=allowedOrigins.has('*')||allowedOrigins.has(origin);return{'access-control-allow-origin':allowed?origin:'null','access-control-allow-methods':'POST,GET,OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'600','vary':'Origin','content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff','cache-control':'no-store'};}
function json(req,res,status,data){res.writeHead(status,cors(req));res.end(JSON.stringify(data));}
async function readJson(req){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>50_000)throw new Error('Payload quá lớn.');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}

const server=createServer(async(req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,cors(req));res.end();return;}
  const origin=String(req.headers.origin||'');if(origin&&!allowedOrigins.has('*')&&!allowedOrigins.has(origin))return json(req,res,403,{error:'Origin không được phép. Thêm domain VocabMaster vào VOCAB_MASTER_ORIGINS.'});
  const url=new URL(req.url||'/',`http://127.0.0.1:${port}`);
  try{
    if(url.pathname==='/health'&&req.method==='GET')return json(req,res,200,{ok:true,ytDlp:await checkYtDlp(),subtitleOnly:true});
    if(url.pathname!=='/transcript')return json(req,res,404,{error:'Not found'});
    if(req.method!=='POST')return json(req,res,405,{error:'Chỉ hỗ trợ POST.'});
    const body=await readJson(req);const result=await resolveWithYtDlp({url:body.url,videoId:body.videoId,language:(body.languages||[])[0]||body.language||'en',startSeconds:Number(body.startSeconds||0),endSeconds:Number(body.endSeconds||body.startSeconds+60)});return json(req,res,200,result);
  }catch(error){return json(req,res,/không hợp lệ|Payload/.test(error.message)?400:503,{error:error.message,subtitleOnly:true});}
});
server.listen(port,'127.0.0.1',()=>console.log(`VocabMaster transcript companion: http://127.0.0.1:${port}`));
