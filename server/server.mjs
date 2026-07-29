import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import webpush from 'web-push';
import { createIeltsApiHandler } from './ielts-api.mjs';
import { createTranscriptResolverHandler,getTranscriptResolverHealth } from './transcript-resolver.mjs';

const port=Number(process.env.PORT||3000);
const root=resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const dataDir=resolve(process.env.PUSH_DATA_DIR||fileURLToPath(new URL('../.data/',import.meta.url)));
const subscriptionsFile=resolve(dataDir,'push-subscriptions.json');
const vapidFile=resolve(dataDir,'vapid.json');
const MAX_AUDIO_BYTES=2*1024*1024;
const MAX_AUDIO_BASE64_CHARS=Math.ceil(MAX_AUDIO_BYTES*4/3)+16;
const PRONUNCIATION_BODY_LIMIT=MAX_AUDIO_BASE64_CHARS+120_000;
const types={
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml'
};
const requests=new Map();
const subscriptions=new Map();
let vapidPublicKey='';
let persistenceAvailable=true;

function securityHeaders(contentType='text/plain; charset=utf-8'){
  return{
    'content-type':contentType,
    'x-content-type-options':'nosniff',
    'referrer-policy':'same-origin',
    'x-frame-options':'DENY',
    'cross-origin-opener-policy':'same-origin',
    'permissions-policy':'camera=(), microphone=(self), geolocation=()',
    'content-security-policy':"default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://i.ytimg.com https://img.youtube.com; media-src 'self' blob:; connect-src 'self' http://127.0.0.1:17321 http://localhost:17321; frame-src https://www.youtube.com https://www.youtube-nocookie.com; worker-src 'self'; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  };
}
function json(res,status,data){res.writeHead(status,{...securityHeaders('application/json; charset=utf-8'),'cache-control':'no-store'});res.end(JSON.stringify(data));}
async function readJson(req,limit=100_000){
  let size=0;const chunks=[];
  for await(const chunk of req){size+=chunk.length;if(size>limit)throw new Error('Payload quá lớn.');chunks.push(chunk);}
  const text=Buffer.concat(chunks).toString('utf8');
  try{return JSON.parse(text||'{}');}catch{throw new Error('JSON không hợp lệ.');}
}
function rateLimit(req,limit=60){
  const key=req.socket.remoteAddress||'local';const now=Date.now();const record=requests.get(key)||{count:0,reset:now+60_000};
  if(now>record.reset){record.count=0;record.reset=now+60_000;}record.count+=1;requests.set(key,record);return record.count<=limit;
}
function assertSameOrigin(req){
  const origin=req.headers.origin;if(!origin)return;
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'');
  if(!host||new URL(origin).host!==host)throw new Error('Origin không hợp lệ.');
}
function extractJson(text){
  const clean=String(text||'').trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();
  try{return JSON.parse(clean);}catch{const match=clean.match(/\{[\s\S]*\}/);if(match)return JSON.parse(match[0]);throw new Error('AI không trả JSON hợp lệ.');}
}

const configuredAiModels=String(process.env.GEMINI_MODELS||'').split(',').map(value=>value.trim()).filter(Boolean);
const AI_MODELS=new Set(configuredAiModels.length?configuredAiModels:['gemini-3.6-flash','gemini-3.5-flash','gemini-3.5-flash-lite']);
const DEFAULT_AI_MODEL=AI_MODELS.has(process.env.GEMINI_MODEL)?process.env.GEMINI_MODEL:[...AI_MODELS][0];
const handleIeltsApi=createIeltsApiHandler({securityHeaders,aiModels:AI_MODELS,defaultAiModel:DEFAULT_AI_MODEL});
const handleTranscriptResolver=createTranscriptResolverHandler({securityHeaders});
const aiCache=new Map();
const aiTelemetry={requests:0,cacheHits:0,errors:0,totalLatencyMs:0,byRoute:{}};
const AI_SCHEMAS={
  test:{type:'object',properties:{ok:{type:'boolean'},message:{type:'string'}},required:['ok']},
  enrich:{type:'object',properties:{meaning:{type:'string'},pronunciation:{type:'string'},example:{type:'string'},translation:{type:'string'},cefr:{type:'string',enum:['A1','A2','B1','B2','C1','C2','—']},type:{type:'string',enum:['word','collocation']},accepted:{type:'array',items:{type:'string'},maxItems:12}},required:['meaning','pronunciation','example','translation','cefr','type','accepted']},
  evaluate:{type:'object',properties:{targetUsedCorrectly:{type:'boolean'},grammarStatus:{type:'string',enum:['correct','minor','incorrect']},naturalness:{type:'string',enum:['natural','understandable','unnatural']},correctedSentence:{type:'string'},shortExplanation:{type:'string'}},required:['targetUsedCorrectly','grammarStatus','naturalness','correctedSentence','shortExplanation']},
  mnemonic:{type:'object',properties:{mnemonic:{type:'string'},association:{type:'string'},imagePrompt:{type:'string'},caution:{type:'string'}},required:['mnemonic','association','imagePrompt','caution']},
  contextExample:{type:'object',properties:{example:{type:'string'},translation:{type:'string'},topic:{type:'string'},usageNote:{type:'string'}},required:['example','translation','topic','usageNote']},
  output:{type:'object',properties:{score:{type:'number'},vocabularyScore:{type:'number'},grammarScore:{type:'number'},naturalnessScore:{type:'number'},termAssessments:{type:'array',items:{type:'object',properties:{id:{type:'string'},term:{type:'string'},targetUsedCorrectly:{type:'boolean'},rating:{type:'string',enum:['again','hard','good']},feedback:{type:'string'}},required:['id','term','targetUsedCorrectly','rating','feedback']}},correctedParagraph:{type:'string'},feedback:{type:'string'}},required:['score','vocabularyScore','grammarScore','naturalnessScore','termAssessments','correctedParagraph','feedback']},
  pronunciation:{type:'object',properties:{intelligibilityScore:{type:'number'},transcript:{type:'string'},intelligibility:{type:'string',enum:['clear','mostly-clear','unclear']},confidence:{type:'string',enum:['high','medium','low']},soundIssues:{type:'array',items:{type:'string'},maxItems:5},feedback:{type:'string'},practiceTip:{type:'string'}},required:['intelligibilityScore','transcript','intelligibility','confidence','soundIssues','feedback','practiceTip']},
  contextCapture:{type:'object',properties:{candidates:{type:'array',maxItems:8,items:{type:'object',properties:{term:{type:'string'},meaning:{type:'string'},type:{type:'string',enum:['word','collocation']},example:{type:'string'},translation:{type:'string'},reason:{type:'string'},priority:{type:'string',enum:['high','medium','low']}},required:['term','meaning','type','example','translation','reason','priority']}}},required:['candidates']}
};
function aiCredentials(req){
  const serverKey=String(process.env.GEMINI_API_KEY||'').trim();
  const key=serverKey||String(req.headers['x-gemini-key']||'').trim();
  if(!key)throw new Error('Chưa có Gemini API key. Nhập trong Cài đặt & AI hoặc cấu hình GEMINI_API_KEY trên server.');
  const requested=String(req.headers['x-gemini-model']||DEFAULT_AI_MODEL).trim();
  const model=serverKey?DEFAULT_AI_MODEL:(AI_MODELS.has(requested)?requested:DEFAULT_AI_MODEL);
  return{key,model};
}
function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0));}
function cleanString(value,max=1000){return String(value??'').trim().slice(0,max);}
function cleanStringArray(value,maxItems=12,maxLength=160){return(Array.isArray(value)?value:[]).map(item=>cleanString(item,maxLength)).filter(Boolean).slice(0,maxItems);}
function validateAiResult(kind,input,context={}){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('AI trả cấu trúc không hợp lệ.');
  if(kind==='test')return{ok:Boolean(input.ok),message:cleanString(input.message,100)};
  if(kind==='enrich')return{meaning:cleanString(input.meaning,240),pronunciation:cleanString(input.pronunciation,160),example:cleanString(input.example,500),translation:cleanString(input.translation,500),cefr:['A1','A2','B1','B2','C1','C2','—'].includes(input.cefr)?input.cefr:'—',type:input.type==='collocation'?'collocation':'word',accepted:cleanStringArray(input.accepted,12,120)};
  if(kind==='evaluate')return{targetUsedCorrectly:Boolean(input.targetUsedCorrectly),grammarStatus:['correct','minor','incorrect'].includes(input.grammarStatus)?input.grammarStatus:'incorrect',naturalness:['natural','understandable','unnatural'].includes(input.naturalness)?input.naturalness:'unnatural',correctedSentence:cleanString(input.correctedSentence,800),shortExplanation:cleanString(input.shortExplanation,500)};
  if(kind==='mnemonic')return{mnemonic:cleanString(input.mnemonic,400),association:cleanString(input.association,500),imagePrompt:cleanString(input.imagePrompt,400),caution:cleanString(input.caution,300)};
  if(kind==='contextExample')return{example:cleanString(input.example,600),translation:cleanString(input.translation,600),topic:cleanString(input.topic,100),usageNote:cleanString(input.usageNote,300)};
  if(kind==='output'){
    const terms=Array.isArray(context.terms)?context.terms:[];
    const rows=(Array.isArray(input.termAssessments)?input.termAssessments:[]).map(row=>({id:cleanString(row?.id,160),term:cleanString(row?.term,120),targetUsedCorrectly:Boolean(row?.targetUsedCorrectly),rating:['again','hard','good'].includes(row?.rating)?row.rating:(row?.targetUsedCorrectly?'good':'again'),feedback:cleanString(row?.feedback,300)}));
    const termAssessments=terms.map(term=>rows.find(row=>row.id===term.id||row.term.toLowerCase()===term.front.toLowerCase())||{id:term.id,term:term.front,targetUsedCorrectly:false,rating:'again',feedback:'Không có bằng chứng rõ ràng rằng từ được dùng đúng.'});
    return{score:clamp(input.score,0,100),vocabularyScore:clamp(input.vocabularyScore,0,100),grammarScore:clamp(input.grammarScore,0,100),naturalnessScore:clamp(input.naturalnessScore,0,100),termAssessments,correctedParagraph:cleanString(input.correctedParagraph,2500),feedback:cleanString(input.feedback,900)};
  }
  if(kind==='pronunciation')return{intelligibilityScore:clamp(input.intelligibilityScore??input.score,0,100),transcript:cleanString(input.transcript,300),intelligibility:['clear','mostly-clear','unclear'].includes(input.intelligibility)?input.intelligibility:'unclear',confidence:['high','medium','low'].includes(input.confidence)?input.confidence:'low',soundIssues:cleanStringArray(input.soundIssues,5,120),feedback:cleanString(input.feedback,700),practiceTip:cleanString(input.practiceTip,500)};
  if(kind==='contextCapture')return{candidates:(Array.isArray(input.candidates)?input.candidates:[]).map(item=>({term:cleanString(item?.term,120),meaning:cleanString(item?.meaning,240),type:item?.type==='collocation'?'collocation':'word',example:cleanString(item?.example,600),translation:cleanString(item?.translation,600),reason:cleanString(item?.reason,260),priority:['high','medium','low'].includes(item?.priority)?item.priority:'medium'})).filter(item=>item.term&&item.meaning).slice(0,8)};
  throw new Error('Không có validator cho tác vụ AI.');
}
function cacheKey(model,kind,parts){return createHash('sha256').update(JSON.stringify({model,kind,parts})).digest('hex');}
function pruneAiCache(){const now=Date.now();for(const[key,value]of aiCache)if(now-value.createdAt>24*60*60*1000)aiCache.delete(key);while(aiCache.size>300)aiCache.delete(aiCache.keys().next().value);}
async function fetchWithRetry(url,options,attempts=2){let lastError;for(let attempt=0;attempt<attempts;attempt+=1){try{const response=await fetch(url,options);if((response.status===429||response.status>=500)&&attempt+1<attempts){await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));continue;}return response;}catch(error){lastError=error;if(error.name==='AbortError'||attempt+1>=attempts)throw error;await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));}}throw lastError;}
async function geminiParts(req,parts,{kind,schema,context={},timeout=35_000,cache=true}={}){
  const{key,model}=aiCredentials(req);const keyHash=cacheKey(model,kind,parts);pruneAiCache();if(cache&&aiCache.has(keyHash)){aiTelemetry.cacheHits+=1;return{model,data:structuredClone(aiCache.get(keyHash).data),cached:true};}
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);const started=Date.now();aiTelemetry.requests+=1;aiTelemetry.byRoute[kind]=(aiTelemetry.byRoute[kind]||0)+1;
  try{
    const response=await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{responseMimeType:'application/json',responseJsonSchema:schema}}),signal:controller.signal});
    const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload?.error?.message||`Gemini HTTP ${response.status}`);const text=payload?.candidates?.[0]?.content?.parts?.map(part=>part.text||'').join('')||'';const data=validateAiResult(kind,extractJson(text),context);if(cache)aiCache.set(keyHash,{createdAt:Date.now(),data:structuredClone(data)});return{model,data};
  }catch(error){aiTelemetry.errors+=1;throw error;}finally{clearTimeout(timer);aiTelemetry.totalLatencyMs+=Date.now()-started;}
}
async function gemini(req,prompt,options){return geminiParts(req,[{text:prompt}],options);}
function safeInterests(value){return(Array.isArray(value)?value:[]).map(item=>cleanString(item,80)).filter(Boolean).slice(0,8);}
function safeTerms(value){return(Array.isArray(value)?value:[]).slice(0,5).map(item=>({id:cleanString(item?.id,160),front:cleanString(item?.front,120),back:cleanString(item?.back,160)})).filter(item=>item.id&&item.front);}

async function handleAi(req,res,path){
  if(req.method!=='POST')return json(res,405,{error:'Chỉ hỗ trợ POST.'});
  if(!rateLimit(req,30))return json(res,429,{error:'Bạn thao tác quá nhanh. Hãy thử lại sau một phút.'});
  try{
    assertSameOrigin(req);const body=await readJson(req,path==='/api/ai/pronunciation'?PRONUNCIATION_BODY_LIMIT:150_000);
    if(path==='/api/ai/test'){const result=await gemini(req,'Return JSON confirming the connection.',{kind:'test',schema:AI_SCHEMAS.test,cache:false});return json(res,200,{ok:true,model:result.model});}
    if(path==='/api/ai/enrich'){
      const term=cleanString(body.term,120),meaning=cleanString(body.meaning,240),sourceContext=cleanString(body.sourceContext,1500),interests=safeInterests(body.interests);if(!term)return json(res,400,{error:'Từ/cụm không hợp lệ.'});
      const prompt=`You are an English vocabulary editor for a Vietnamese learner. Enrich one entry without inventing obscure senses. Use the source context to disambiguate the sense when present. Interests: ${JSON.stringify(interests)}. Term: ${JSON.stringify(term)}. Existing meaning: ${JSON.stringify(meaning)}. Source context: ${JSON.stringify(sourceContext)}. Return concise Vietnamese meaning, IPA, one natural English example, Vietnamese translation, CEFR, type and accepted spelling/inflection variants.`;
      const result=await gemini(req,prompt,{kind:'enrich',schema:AI_SCHEMAS.enrich});return json(res,200,result.data);
    }
    if(path==='/api/ai/evaluate'){
      const term=cleanString(body.term,120),meaning=cleanString(body.meaning,240),sentence=cleanString(body.sentence,800);if(!term||!sentence)return json(res,400,{error:'Dữ liệu câu không hợp lệ.'});
      const prompt=`Evaluate whether the learner used the target term with the requested sense. Target: ${JSON.stringify(term)}. Vietnamese meaning: ${JSON.stringify(meaning)}. Sentence: ${JSON.stringify(sentence)}. Separate target-term correctness from general grammar. Explain briefly in Vietnamese.`;
      const result=await gemini(req,prompt,{kind:'evaluate',schema:AI_SCHEMAS.evaluate,cache:false});return json(res,200,result.data);
    }
    if(path==='/api/ai/mnemonic'){
      const term=cleanString(body.term,120),meaning=cleanString(body.meaning,240),interests=safeInterests(body.interests);if(!term)return json(res,400,{error:'Từ/cụm không hợp lệ.'});
      const prompt=`Create one accurate mnemonic for a Vietnamese learner. Avoid false etymology and offensive associations. Term: ${JSON.stringify(term)}. Meaning: ${JSON.stringify(meaning)}. Example: ${JSON.stringify(cleanString(body.example,500))}. Interests: ${JSON.stringify(interests)}.`;
      const result=await gemini(req,prompt,{kind:'mnemonic',schema:AI_SCHEMAS.mnemonic});return json(res,200,result.data);
    }
    if(path==='/api/ai/context-example'){
      const term=cleanString(body.term,120),meaning=cleanString(body.meaning,240),interests=safeInterests(body.interests),cefr=cleanString(body.cefr,10)||'B1';if(!term)return json(res,400,{error:'Từ/cụm không hợp lệ.'});
      const prompt=`Write one natural English example at CEFR ${JSON.stringify(cefr)} using ${JSON.stringify(term)} with meaning ${JSON.stringify(meaning)}. Use one interest when natural: ${JSON.stringify(interests)}. Include Vietnamese translation and a short usage note.`;
      const result=await gemini(req,prompt,{kind:'contextExample',schema:AI_SCHEMAS.contextExample});return json(res,200,result.data);
    }
    if(path==='/api/ai/output-practice'){
      const terms=safeTerms(body.terms),paragraph=cleanString(body.paragraph,2500);if(terms.length<3||paragraph.length<10)return json(res,400,{error:'Bài viết hoặc danh sách từ không hợp lệ.'});
      const prompt=`Evaluate each required term independently in the learner paragraph. Required terms with stable IDs: ${JSON.stringify(terms)}. Paragraph: ${JSON.stringify(paragraph)}. For each term, return its exact id, whether it is used correctly, an FSRS-compatible rating: again when not recalled/used incorrectly, hard only when essentially correct but hesitant/minor, good when correct, and concise Vietnamese feedback. Also return aggregate scores and a corrected paragraph.`;
      const result=await gemini(req,prompt,{kind:'output',schema:AI_SCHEMAS.output,context:{terms},cache:false});return json(res,200,result.data);
    }
    if(path==='/api/ai/context-capture'){
      const text=cleanString(body.text,6000);if(text.length<20)return json(res,400,{error:'Đoạn ngữ cảnh quá ngắn.'});
      const prompt=`From the following English or bilingual passage, propose at most 8 vocabulary items or collocations worth learning for a Vietnamese learner. Prefer reusable, context-rich items; exclude proper names, obvious basic words and duplicates. Do not auto-add anything. Goal: ${JSON.stringify(cleanString(body.goal,20))}. Passage: ${JSON.stringify(text)}. For each candidate give Vietnamese meaning in this exact sense, type, an example grounded in the passage, translation, why it is worth learning and priority.`;
      const result=await gemini(req,prompt,{kind:'contextCapture',schema:AI_SCHEMAS.contextCapture});return json(res,200,result.data);
    }
    if(path==='/api/ai/pronunciation'){
      const term=cleanString(body.term,120),ipa=cleanString(body.ipa,160),accent=cleanString(body.accent,20)||'en-US',transcript=cleanString(body.transcript,300),audioBase64=String(body.audioBase64||''),mimeType=String(body.mimeType||'audio/webm').split(';')[0],audioBytes=Number(body.audioBytes||0);if(!term)return json(res,400,{error:'Từ/cụm không hợp lệ.'});if(!audioBase64&&!transcript)return json(res,400,{error:'Thiếu âm thanh hoặc transcript.'});if(audioBytes>MAX_AUDIO_BYTES||audioBase64.length>MAX_AUDIO_BASE64_CHARS)return json(res,413,{error:'Đoạn thu âm vượt quá giới hạn 2 MB.'});if(audioBase64&&!/^audio\/(webm|mp4|ogg|wav|mpeg|x-wav)$/i.test(mimeType))return json(res,400,{error:'Định dạng âm thanh không được hỗ trợ.'});
      const prompt=`Estimate intelligibility for a Vietnamese English learner. Target: ${JSON.stringify(term)}. IPA: ${JSON.stringify(ipa)}. Accent reference: ${JSON.stringify(accent)}. ${transcript?`Browser transcript: ${JSON.stringify(transcript)}.`:''} This is coaching, not certification. Be uncertain when audio quality is poor. Return intelligibility score, confidence, at most two high-value sound issues, Vietnamese feedback and one practice tip.`;const parts=[{text:prompt}];if(audioBase64)parts.push({inline_data:{mime_type:mimeType,data:audioBase64}});
      const result=await geminiParts(req,parts,{kind:'pronunciation',schema:AI_SCHEMAS.pronunciation,timeout:45_000,cache:false});return json(res,200,result.data);
    }
    return json(res,404,{error:'Không tìm thấy AI route.'});
  }catch(error){return json(res,error.message==='Payload quá lớn.'?413:error.message.includes('không hợp lệ')?400:502,{error:error.name==='AbortError'?'Gemini phản hồi quá lâu.':error.message});}
}

async function safeWriteJson(path,value){
  if(!persistenceAvailable)return;
  try{await mkdir(dataDir,{recursive:true});const temporary=`${path}.${process.pid}.tmp`;await writeFile(temporary,JSON.stringify(value,null,2),{mode:0o600});await rename(temporary,path);}
  catch(error){persistenceAvailable=false;console.warn(`Push persistence disabled: ${error.message}`);}
}
async function loadPushState(){
  try{await mkdir(dataDir,{recursive:true});}catch{persistenceAvailable=false;}
  try{const values=JSON.parse(await readFile(subscriptionsFile,'utf8'));if(Array.isArray(values))for(const entry of values){if(entry?.subscription?.endpoint)subscriptions.set(entry.subscription.endpoint,entry);}}
  catch(error){if(error.code!=='ENOENT')console.warn(`Cannot load push subscriptions: ${error.message}`);}
}
async function configureVapid(){
  let publicKey=process.env.VAPID_PUBLIC_KEY||'';let privateKey=process.env.VAPID_PRIVATE_KEY||'';
  if(!publicKey||!privateKey){try{const saved=JSON.parse(await readFile(vapidFile,'utf8'));publicKey=saved.publicKey||'';privateKey=saved.privateKey||'';}catch{}}
  if(!publicKey||!privateKey){const generated=webpush.generateVAPIDKeys();publicKey=generated.publicKey;privateKey=generated.privateKey;await safeWriteJson(vapidFile,{publicKey,privateKey,createdAt:new Date().toISOString()});}
  webpush.setVapidDetails(process.env.VAPID_SUBJECT||'mailto:admin@vocab-master.local',publicKey,privateKey);vapidPublicKey=publicKey;
}
async function persistSubscriptions(){await safeWriteJson(subscriptionsFile,[...subscriptions.values()]);}
function validSubscription(value){return value&&typeof value.endpoint==='string'&&value.endpoint.startsWith('https://')&&typeof value.keys?.p256dh==='string'&&typeof value.keys?.auth==='string';}
function validReminder(value){return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value||''))?String(value):'20:00';}
function validTimeZone(value){try{new Intl.DateTimeFormat('en-US',{timeZone:String(value)}).format();return String(value);}catch{return'UTC';}}
function zonedClock(date,timeZone){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).map(part=>[part.type,part.value]));return{dateKey:`${parts.year}-${parts.month}-${parts.day}`,time:`${parts.hour}:${parts.minute}`};}
async function sendPush(entry,payload){
  try{await webpush.sendNotification(entry.subscription,JSON.stringify(payload),{TTL:3600,urgency:'normal'});return true;}
  catch(error){if([404,410].includes(error.statusCode)){subscriptions.delete(entry.subscription.endpoint);await persistSubscriptions();return false;}throw error;}
}
async function checkReminders(){
  const now=new Date();let changed=false;
  for(const entry of subscriptions.values()){
    if(entry.enabled===false)continue;const clock=zonedClock(now,entry.timeZone||'UTC');if(clock.time!==entry.reminder||entry.lastSentDate===clock.dateKey)continue;
    try{const sent=await sendPush(entry,{title:'Vocab Master',body:'Đến giờ học hôm nay. Một phiên ngắn cũng giúp duy trì trí nhớ.',tag:'vocab-master-daily-reminder',url:'/#today',renotify:false});if(sent){entry.lastSentDate=clock.dateKey;entry.lastSentAt=Date.now();changed=true;}}
    catch(error){console.warn(`Push reminder failed: ${error.message}`);}
  }
  if(changed)await persistSubscriptions();
}
async function handlePush(req,res,path){
  if(!rateLimit(req,60))return json(res,429,{error:'Bạn thao tác quá nhanh.'});
  try{
    if(path==='/api/push/public-key'&&req.method==='GET')return json(res,200,{publicKey:vapidPublicKey});
    if(path==='/api/push/status'&&req.method==='GET')return json(res,200,{ready:Boolean(vapidPublicKey),subscriptions:subscriptions.size,persistent:persistenceAvailable});
    if(req.method!=='POST')return json(res,405,{error:'Phương thức không được hỗ trợ.'});
    assertSameOrigin(req);const body=await readJson(req,30_000);
    if(path==='/api/push/subscribe'){
      if(!validSubscription(body.subscription))return json(res,400,{error:'Push subscription không hợp lệ.'});
      const endpoint=body.subscription.endpoint;const previous=subscriptions.get(endpoint)||{};
      subscriptions.set(endpoint,{...previous,subscription:body.subscription,reminder:validReminder(body.reminder||previous.reminder),timeZone:validTimeZone(body.timeZone||previous.timeZone||'UTC'),locale:String(body.locale||previous.locale||'vi'),enabled:body.enabled!==false,updatedAt:Date.now(),createdAt:previous.createdAt||Date.now()});
      await persistSubscriptions();return json(res,200,{ok:true,reminder:subscriptions.get(endpoint).reminder,timeZone:subscriptions.get(endpoint).timeZone});
    }
    if(path==='/api/push/unsubscribe'){const endpoint=String(body.endpoint||'');if(endpoint)subscriptions.delete(endpoint);await persistSubscriptions();return json(res,200,{ok:true});}
    if(path==='/api/push/test'){const entry=subscriptions.get(String(body.endpoint||''));if(!entry)return json(res,404,{error:'Chưa tìm thấy đăng ký thông báo.'});await sendPush(entry,{title:'Vocab Master',body:'Thông báo hệ điều hành và Web Push đang hoạt động.',tag:'vocab-master-test',url:'/#today',renotify:true});return json(res,200,{ok:true});}
    return json(res,404,{error:'Không tìm thấy Push route.'});
  }catch(error){return json(res,500,{error:error.message});}
}

function healthPayload(){return{ok:true,fsrs:6,pwa:true,push:Boolean(vapidPublicKey),multimodal:true,ai:['enrich','evaluate','mnemonic','context-example','context-capture','output-practice','pronunciation'],ielts:['transcript','paraphrase-draft','reading-draft','retell'],transcriptResolver:getTranscriptResolverHealth(),aiTelemetry:{...aiTelemetry,averageLatencyMs:aiTelemetry.requests?Math.round(aiTelemetry.totalLatencyMs/aiTelemetry.requests):0,models:[...AI_MODELS]}};}

export async function apiHandler(req,res,next){
  try{
    const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
    if(url.pathname.startsWith('/api/ai/'))return await handleAi(req,res,url.pathname);
    if(url.pathname.startsWith('/api/ielts/'))return await handleIeltsApi(req,res,url.pathname);
    if(url.pathname.startsWith('/api/transcript/'))return await handleTranscriptResolver(req,res,url.pathname,url);
    if(url.pathname.startsWith('/api/push/'))return await handlePush(req,res,url.pathname);
    if(url.pathname==='/api/health')return json(res,200,healthPayload());
    if(next)return next();
  }catch(err){if(next)return next(err);json(res,500,{error:err.message});}
}

await loadPushState();await configureVapid();
const reminderTimer=setInterval(()=>checkReminders().catch(error=>console.warn(error.message)),30_000);reminderTimer.unref();

const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
    if(url.pathname.startsWith('/api/ai/'))return handleAi(req,res,url.pathname);
    if(url.pathname.startsWith('/api/ielts/'))return handleIeltsApi(req,res,url.pathname);
    if(url.pathname.startsWith('/api/transcript/'))return handleTranscriptResolver(req,res,url.pathname,url);
    if(url.pathname.startsWith('/api/push/'))return handlePush(req,res,url.pathname);
    if(url.pathname==='/api/health')return json(res,200,healthPayload());
    const requested=decodeURIComponent(url.pathname);const relative=requested==='/'?'index.html':requested.replace(/^\/+/, '');let file=resolve(root,relative);
    if(!file.startsWith(root))throw new Error('Invalid path');
    try{const info=await stat(file);if(info.isDirectory())file=resolve(file,'index.html');}catch{if(!extname(relative))file=resolve(root,'index.html');}
    const body=await readFile(file);const extension=extname(file);const isShell=['.html','.webmanifest'].includes(extension)||file.endsWith('sw.js');
    res.writeHead(200,{...securityHeaders(types[extension]||'application/octet-stream'),'cache-control':isShell?'no-cache':'public, max-age=3600'});if(req.method==='HEAD')res.end();else res.end(body);
  }catch{res.writeHead(404,{...securityHeaders(),'cache-control':'no-store'});res.end('Not found');}
});

const currentFile=fileURLToPath(import.meta.url);
const entryFile=process.argv[1]?resolve(process.argv[1]):'';
if(currentFile===entryFile)server.listen(port,'0.0.0.0',()=>console.log(`Vocab Master running at http://0.0.0.0:${port}`));
