import { CLOUD_CONSENT_VERSION } from '../src/asr-fallback-policy.js';
import { resolverError } from '../src/resolver-contracts.js';

const clean=(value,max=2500)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
const extractJson=text=>{const value=String(text||'').trim().replace(/^```json\s*/i,'').replace(/```$/,'').trim();try{return JSON.parse(value);}catch{const match=value.match(/\{[\s\S]*\}/);if(match)return JSON.parse(match[0]);throw resolverError('TRACK_INVALID','Gemini returned malformed transcript JSON.');}};
const normalizeSegments=(rows=[],language='en')=>(Array.isArray(rows)?rows:[]).slice(0,2000).map((row,index)=>({id:`gemini-segment:${index+1}`,startMs:Math.max(0,Number(row.startMs||0)),endMs:Math.max(0,Number(row.endMs||0)),text:clean(row.text),language:clean(row.language||language,32),confidence:null,status:'needs-review',verified:false})).filter(row=>row.text&&row.endMs>row.startMs);

export function validateGeminiFallbackRequest(job={}){
  const fallback=job.request?.fallback||{},sourcePolicy=job.request?.sourcePolicy||{};
  if(!fallback.enableGemini||fallback.consentVersion!==CLOUD_CONSENT_VERSION||!/^cloud-consent:/.test(String(fallback.consentReceiptId||'')))throw resolverError('CONSENT_REQUIRED','Current explicit Gemini consent is required.');
  if(fallback.maxBillableRequests!==1)throw resolverError('COST_CAP','Gemini fallback requires a one-request billable cap.');
  if(sourcePolicy.visibility!=='public'||sourcePolicy.requiresAuth!==false||sourcePolicy.cookiesUsed!==false||sourcePolicy.rights!=='eligible')throw resolverError('RIGHTS_INELIGIBLE','Cloud transcription is limited to public, no-auth, no-cookie, rights-eligible sources.');
  return fallback;
}

export function createGeminiAsrProvider({apiKey=process.env.GEMINI_API_KEY||'',model=process.env.GEMINI_ASR_MODEL||'gemini-3.5-flash',fetchImpl=fetch}={}){
  const key=String(apiKey).trim();
  return{
    async health(){return{available:Boolean(key),configured:Boolean(key),provider:'gemini',credentialLocation:'server-only'};},
    async transcribe(job,{signal=null}={}){
      const fallback=validateGeminiFallbackRequest(job);if(!key)throw resolverError('CLOUD_UNAVAILABLE','Gemini ASR is not configured on the server.');
      const duration=Math.max(30,Math.min(1200,Number(job.metadata?.durationSeconds||fallback.maxDurationSeconds||1200)));if(duration>fallback.maxDurationSeconds)throw resolverError('COST_CAP','Media duration exceeds the consented cloud cap.');
      const prompt='Transcribe spoken English into sentence-level JSON segments with absolute startMs, endMs and text. Preserve contractions and punctuation. Exclude silence. Do not claim verification or confidence.';
      const requestBody={contents:[{role:'user',parts:[{fileData:{fileUri:job.request.source.canonicalUrl,mimeType:'video/*'},videoMetadata:{startOffset:'0s',endOffset:`${duration}s`}},{text:prompt}]}],generationConfig:{responseMimeType:'application/json',responseJsonSchema:{type:'object',properties:{segments:{type:'array',items:{type:'object',properties:{startMs:{type:'number'},endMs:{type:'number'},text:{type:'string'}},required:['startMs','endMs','text']}}},required:['segments']},temperature:0}};
      const call=()=>fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify(requestBody),signal});
      let response=await call();if(response.status===429)response=await call();
      const payload=await response.json().catch(()=>({}));if(!response.ok)throw resolverError(response.status===429?'RATE_LIMITED':'CLOUD_UNAVAILABLE',clean(payload?.error?.message||`Gemini HTTP ${response.status}`,300));
      const text=payload?.candidates?.[0]?.content?.parts?.map(part=>part.text||'').join('')||'',parsed=extractJson(text),segments=normalizeSegments(parsed.segments,job.request.language);
      if(!segments.length)throw resolverError('TRACK_INVALID','Gemini returned no usable transcript segments.');
      return{provider:'gemini-progressive',namespace:'private',model,segments,durationSeconds:duration,complete:true,needsReview:true,verified:false,shared:false,uploadedFileRetained:false,billableRequests:1};
    }
  };
}
