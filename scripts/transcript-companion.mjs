import { createServer } from 'node:http';
import { createCompanionHttpHandler,createPairingToken,LocalCompanionRuntime,validateCompanionStartupConfig } from '../server/local-asr-companion.mjs';
import { LocalAsrProvider } from '../server/local-asr-provider.mjs';

const configuredToken=process.env.VOCAB_COMPANION_TOKEN??'',generatedToken=configuredToken===''?createPairingToken():configuredToken;
const config=validateCompanionStartupConfig({port:Number(process.env.TRANSCRIPT_COMPANION_PORT??17321),host:process.env.TRANSCRIPT_COMPANION_HOST??'127.0.0.1',allowedOrigins:(process.env.VOCAB_MASTER_ORIGINS??'http://localhost:3000,http://127.0.0.1:3000').split(',').map(value=>value.trim()).filter(Boolean),token:generatedToken});
const runtime=new LocalCompanionRuntime();
const handler=createCompanionHttpHandler({runtime,asrProvider:new LocalAsrProvider({runtime}),token:config.token,allowedOrigins:config.allowedOrigins});
const server=createServer((req,res)=>void handler(req,res));
server.listen(config.port,config.host,()=>{
  console.log(`VocabMaster local companion listening on http://${config.host}:${config.port}`);
  if(configuredToken==='')console.log(`One-session pairing token: ${config.token}`);
});
