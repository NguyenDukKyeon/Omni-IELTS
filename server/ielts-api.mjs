import { createHash } from 'node:crypto';
import {
  parseYouTubeUrl,
  validateTranscriptSegments,
  validateLabItem,
  validateReadingPassage,
  validateRetellFeedback,
  sanitizeLabItem,
  sanitizeReadingPassage
} from '../src/ielts-domain.js';

const requests=new Map();
const cache=new Map();

const TRANSCRIPT_SCHEMA={
  type:'object',
  properties:{
    title:{type:'string'},language:{type:'string'},durationSeconds:{type:'number'},
    segments:{type:'array',maxItems:800,items:{type:'object',properties:{startMs:{type:'number'},endMs:{type:'number'},text:{type:'string'},speaker:{type:'string'},confidence:{type:'number'}},required:['startMs','endMs','text']}}
  },required:['title','language','durationSeconds','segments']
};
const PARAPHRASE_SCHEMA={
  type:'object',properties:{item:{type:'object',properties:{prompt:{type:'string'},context:{type:'string'},options:{type:'array',minItems:3,maxItems:4,items:{type:'object',properties:{id:{type:'string'},text:{type:'string'},correct:{type:'boolean'},rationale:{type:'string'}},required:['id','text','correct','rationale']}}},required:['prompt','context','options']}},required:['item']
};
const READING_SCHEMA={
  type:'object',properties:{title:{type:'string'},passage:{type:'string'},microSkill:{type:'string'},questions:{type:'array',minItems:2,maxItems:4,items:{type:'object',properties:{id:{type:'string'},type:{type:'string',enum:['paraphrase-match','main-idea','evidence-match','reference','inference']},prompt:{type:'string'},evidenceText:{type:'string'},explanation:{type:'string'},options:{type:'array',minItems:3,maxItems:4,items:{type:'object',properties:{id:{type:'string'},text:{type:'string'},correct:{type:'boolean'},rationale:{type:'string'}},required:['id','text','correct','rationale']}}},required:['id','type','prompt','evidenceText','explanation','options']}}},required:['title','passage','microSkill','questions']
};
const RETELL_SCHEMA={
  type:'object',properties:{
    mainIdeas:{type:'array',maxItems:8,items:{type:'object',properties:{idea:{type:'string'},covered:{type:'boolean'},evidence:{type:'string'}},required:['idea','covered','evidence']}},
    targetAssessments:{type:'array',maxItems:12,items:{type:'object',properties:{cardId:{type:'string'},term:{type:'string'},usedCorrectly:{type:'boolean'},feedback:{type:'string'}},required:['cardId','term','usedCorrectly','feedback']}},
    lexicalGaps:{type:'array',maxItems:8,items:{type:'string'}},
    errors:{type:'array',maxItems:3,items:{type:'object',properties:{category:{type:'string'},learnerResponse:{type:'string'},correction:{type:'string'},explanation:{type:'string'}},required:['category','learnerResponse','correction','explanation']}},
    feedback:{type:'string'}
  },required:['mainIdeas','targetAssessments','lexicalGaps','errors','feedback']
};

function clean(value,max=2000){return String(value??'').trim().slice(0,max);}
function rateLimit(req,limit=12){const key=req.socket?.remoteAddress||'local';const now=Date.now();const row=requests.get(key)||{count:0,reset:now+60_000};if(now>row.reset){row.count=0;row.reset=now+60_000;}row.count++;requests.set(key,row);return row.count<=limit;}
function pruneCache(){const now=Date.now();for(const[key,value]of cache)if(now-value.createdAt>24*60*60*1000)cache.delete(key);while(cache.size>100)cache.delete(cache.keys().next().value);}
function cacheKey(value){return createHash('sha256').update(JSON.stringify(value)).digest('hex');}
async function readJson(req,limit=100_000){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)throw new Error('Payload quá lớn.');chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}catch{throw new Error('JSON không hợp lệ.');}}
function assertSameOrigin(req){const origin=req.headers.origin;if(!origin)return;const host=String(req.headers['x-forwarded-host']||req.headers.host||'');if(!host||new URL(origin).host!==host)throw new Error('Origin không hợp lệ.');}
function extractJson(text){const value=String(text||'').trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();try{return JSON.parse(value);}catch{const match=value.match(/\{[\s\S]*\}/);if(match)return JSON.parse(match[0]);throw new Error('AI không trả JSON hợp lệ.');}}
function credentials(req,models,defaultModel){const serverKey=String(process.env.GEMINI_API_KEY||'').trim();const key=serverKey||String(req.headers['x-gemini-key']||'').trim();if(!key)throw new Error('Chưa có Gemini API key.');const requested=String(req.headers['x-gemini-model']||defaultModel).trim();const model=serverKey?defaultModel:(models.has(requested)?requested:defaultModel);return{key,model};}
async function fetchWithRetry(url,options,attempts=2){let last;for(let attempt=0;attempt<attempts;attempt++){try{const response=await fetch(url,options);if((response.status===429||response.status>=500)&&attempt+1<attempts){await new Promise(resolve=>setTimeout(resolve,700*(attempt+1)));continue;}return response;}catch(error){last=error;if(error.name==='AbortError'||attempt+1>=attempts)throw error;await new Promise(resolve=>setTimeout(resolve,700*(attempt+1)));}}throw last;}

async function generateStructured(req,{parts,schema,kind,models,defaultModel,timeout=60_000,useCache=false}){
  const{key,model}=credentials(req,models,defaultModel);const keyHash=cacheKey({model,kind,parts});pruneCache();if(useCache&&cache.has(keyHash))return{model,data:structuredClone(cache.get(keyHash).data),cached:true};
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const response=await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{responseMimeType:'application/json',responseJsonSchema:schema,temperature:kind==='transcript'?0:0.2}}),signal:controller.signal});
    const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload?.error?.message||`Gemini HTTP ${response.status}`);const text=payload?.candidates?.[0]?.content?.parts?.map(part=>part.text||'').join('')||'';const data=extractJson(text);if(useCache)cache.set(keyHash,{createdAt:Date.now(),data:structuredClone(data)});return{model,data,cached:false};
  }finally{clearTimeout(timer);}
}

function normalizeTranscriptResponse(data,{clipStartSeconds,clipEndSeconds,mediaSourceId}){
  const clipStartMs=Math.round(clipStartSeconds*1000);const clipEndMs=Math.round(clipEndSeconds*1000);const clipDurationMs=clipEndMs-clipStartMs;
  let rows=Array.isArray(data.segments)?data.segments:[];const maxEnd=Math.max(0,...rows.map(row=>Number(row?.endMs||0)));
  if(clipStartMs>0&&maxEnd<=clipDurationMs+2000)rows=rows.map(row=>({...row,startMs:Number(row.startMs||0)+clipStartMs,endMs:Number(row.endMs||0)+clipStartMs}));
  rows=rows.map((row,index)=>({id:`${mediaSourceId}:segment:${index+1}`,mediaSourceId,order:index,startMs:Number(row.startMs||0),endMs:Number(row.endMs||0),text:clean(row.text,2500),speaker:clean(row.speaker,100)||null,confidence:Number.isFinite(Number(row.confidence))?Math.max(0,Math.min(1,Number(row.confidence))):null,confidenceSource:'model-estimate',status:'needs-review',userCorrected:false,language:clean(data.language,30)||'en'}));
  const validation=validateTranscriptSegments(rows,{durationMs:clipEndMs});if(!validation.valid)throw new Error(`Transcript không vượt qua validation: ${validation.errors.join(' ')}`);
  return{title:clean(data.title,300)||'YouTube video',language:clean(data.language,30)||'en',durationSeconds:Math.max(0,Number(data.durationSeconds||clipEndSeconds)),segments:validation.segments,warnings:validation.warnings};
}

export function createIeltsApiHandler({securityHeaders,aiModels,defaultAiModel}){
  const models=aiModels instanceof Set?aiModels:new Set(aiModels||[]);const defaultModel=defaultAiModel||[...models][0]||'gemini-3.5-flash';
  const json=(res,status,data)=>{res.writeHead(status,{...securityHeaders('application/json; charset=utf-8'),'cache-control':'no-store'});res.end(JSON.stringify(data));};
  return async function handleIeltsApi(req,res,path){
    if(req.method!=='POST')return json(res,405,{error:'Chỉ hỗ trợ POST.'});
    if(!rateLimit(req,path==='/api/ielts/transcript'?5:15))return json(res,429,{error:'Đã vượt giới hạn tạm thời. Hãy thử lại sau một phút.'});
    try{
      assertSameOrigin(req);const body=await readJson(req,120_000);
      if(path==='/api/ielts/transcript'){
        const parsed=parseYouTubeUrl(body.url);if(!parsed.valid)return json(res,400,{error:parsed.error});
        const startSeconds=Math.max(0,Number(body.startSeconds??parsed.startSeconds??0));const requestedMinutes=Math.max(1,Math.min(20,Number(body.minutes||20)));const endSeconds=Math.max(startSeconds+30,Math.min(startSeconds+requestedMinutes*60,Number(body.endSeconds||startSeconds+requestedMinutes*60)));
        const mediaSourceId=clean(body.mediaSourceId,180)||`youtube:${parsed.videoId}`;
        const prompt=`Transcribe the spoken English in this public YouTube clip. Return sentence-level segments suitable for language dictation. Timestamps MUST be absolute milliseconds from the beginning of the original YouTube video, not relative to the clip. Preserve contractions and meaningful punctuation. Exclude music-only or silence. Prefer segments of 3–20 seconds and split long speech at natural thought groups. Language requested: ${JSON.stringify(clean(body.language,30)||'en')}. Never invent speech that is not audible. Confidence is only a rough model estimate from 0 to 1.`;
        const parts=[{fileData:{fileUri:parsed.canonicalUrl,mimeType:'video/*'},videoMetadata:{startOffset:`${startSeconds}s`,endOffset:`${endSeconds}s`}},{text:prompt}];
        const result=await generateStructured(req,{parts,schema:TRANSCRIPT_SCHEMA,kind:'transcript',models,defaultModel,timeout:120_000,useCache:true});const normalized=normalizeTranscriptResponse(result.data,{clipStartSeconds:startSeconds,clipEndSeconds:endSeconds,mediaSourceId});return json(res,200,{...normalized,model:result.model,cached:result.cached,videoId:parsed.videoId,canonicalUrl:parsed.canonicalUrl,clip:{startSeconds,endSeconds},previewFeature:true});
      }
      if(path==='/api/ielts/paraphrase-draft'){
        const sourceText=clean(body.sourceText,1800),context=clean(body.context,2500);if(sourceText.length<8)return json(res,400,{error:'Câu nguồn quá ngắn.'});
        const prompt=`Create one IELTS paraphrase recognition item for a Vietnamese learner. Source meaning: ${JSON.stringify(sourceText)}. Context: ${JSON.stringify(context)}. Provide exactly one meaning-preserving option and 2–3 plausible but wrong options. Every option must have a specific rationale explaining register, collocation, degree, logic, or meaning. Avoid obscure vocabulary and avoid two defensible correct answers. Return only the requested JSON.`;
        const result=await generateStructured(req,{parts:[{text:prompt}],schema:PARAPHRASE_SCHEMA,kind:'paraphrase',models,defaultModel,timeout:45_000});const item=sanitizeLabItem({...result.data.item,kind:'paraphrase',status:'draft',sourceCardIds:Array.isArray(body.sourceCardIds)?body.sourceCardIds:[],provenance:{status:'draft',model:result.model,promptVersion:'ielts-paraphrase-v1',generatedAt:Date.now()}});const validation=validateLabItem(item);return json(res,200,{item,validation,model:result.model});
      }
      if(path==='/api/ielts/reading-draft'){
        const topic=clean(body.topic,200)||'education and technology';const level=clean(body.level,20)||'B2';
        const prompt=`Create a short original IELTS-style reading micro-practice at CEFR ${JSON.stringify(level)} about ${JSON.stringify(topic)}. Passage must contain 100–180 words and must not copy a real IELTS test. Focus only on paraphrase and evidence matching. Create 2–3 multiple-choice questions, each with exactly one correct answer, a verbatim evidenceText copied from the passage, a concise overall explanation, and a rationale for every option including distractors. Avoid True/False/Not Given. Return only JSON.`;
        const result=await generateStructured(req,{parts:[{text:prompt}],schema:READING_SCHEMA,kind:'reading',models,defaultModel,timeout:50_000});const passage=sanitizeReadingPassage({...result.data,status:'draft',provenance:{status:'draft',model:result.model,promptVersion:'ielts-reading-v1',generatedAt:Date.now()}});const validation=validateReadingPassage(passage);return json(res,200,{passage,validation,model:result.model});
      }
      if(path==='/api/ielts/retell'){
        const sourceTranscript=clean(body.sourceTranscript,7000),learnerTranscript=clean(body.learnerTranscript,7000);if(sourceTranscript.length<20||learnerTranscript.length<5)return json(res,400,{error:'Thiếu transcript nguồn hoặc phần retell.'});
        const targets=(Array.isArray(body.targets)?body.targets:[]).slice(0,12).map(item=>({cardId:clean(item?.cardId,180),term:clean(item?.term,180),meaning:clean(item?.meaning,300)})).filter(item=>item.cardId&&item.term);
        const prompt=`Analyze a short retell for learning feedback, not exam scoring. Source transcript: ${JSON.stringify(sourceTranscript)}. Learner retell transcript: ${JSON.stringify(learnerTranscript)}. Preselected lexical targets: ${JSON.stringify(targets)}. Identify main ideas covered, assess each target only when its use is clear and semantically correct, list useful lexical gaps, and report at most 3 high-value errors. Do not output an IELTS band score, numeric certification score, or claim examiner validity. Use concise Vietnamese feedback.`;
        const result=await generateStructured(req,{parts:[{text:prompt}],schema:RETELL_SCHEMA,kind:'retell',models,defaultModel,timeout:50_000});const validation=validateRetellFeedback(result.data);if(!validation.valid)throw new Error(validation.errors.join(' '));return json(res,200,{...validation.value,model:result.model,disclaimer:'Phản hồi học tập, không phải chấm điểm IELTS.'});
      }
      return json(res,404,{error:'Không tìm thấy IELTS API route.'});
    }catch(error){const status=error.message==='Payload quá lớn.'?413:/không hợp lệ|quá ngắn|thiếu/i.test(error.message)?400:error.name==='AbortError'?504:502;return json(res,status,{error:error.name==='AbortError'?'AI xử lý quá lâu. Bạn có thể thử lại; tiến độ cục bộ không bị mất.':error.message});}
  };
}
