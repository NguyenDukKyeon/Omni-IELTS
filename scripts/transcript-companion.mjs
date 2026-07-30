import { createServer } from 'node:http';
import { createCompanionHttpHandler,createPairingToken,isLoopbackAddress,LocalCompanionRuntime } from '../server/local-asr-companion.mjs';

const port=Number(process.env.TRANSCRIPT_COMPANION_PORT||17321);
const host=String(process.env.TRANSCRIPT_COMPANION_HOST||'127.0.0.1');
if(!isLoopbackAddress(host))throw new Error('Local companion must bind to loopback only.');
const allowedOrigins=String(process.env.VOCAB_MASTER_ORIGINS||'http://localhost:3000,http://127.0.0.1:3000').split(',').map(value=>value.trim()).filter(Boolean);
const token=String(process.env.VOCAB_COMPANION_TOKEN||'').trim()||createPairingToken();
const handler=createCompanionHttpHandler({runtime:new LocalCompanionRuntime(),token,allowedOrigins});
const server=createServer((req,res)=>void handler(req,res));
server.listen(port,host,()=>{
  console.log(`VocabMaster local companion listening on http://${host}:${port}`);
  if(!process.env.VOCAB_COMPANION_TOKEN)console.log(`One-session pairing token: ${token}`);
});
