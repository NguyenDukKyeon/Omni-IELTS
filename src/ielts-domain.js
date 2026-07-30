import { decideEvidence,evidenceDigest,normalizeAssistanceTrace } from './evidence-policy.js';
import { createActivitySpec,createAttempt,createReceipt,createRun } from './learning-contracts.js';

export const IELTS_SCHEMA_VERSION=1;
export const IELTS_SESSION_MINUTES=Object.freeze([10,20,30]);
export const ERROR_STATUSES=Object.freeze(['open','practicing','monitoring','resolved','ignored']);
export const AI_ARTIFACT_STATUSES=Object.freeze(['draft','validated','verified','rejected']);
export const TRANSCRIPT_STATUSES=Object.freeze(['draft','needs-review','verified','rejected']);
export const MEDIA_JOB_STATUSES=Object.freeze(['queued','processing','needs-review','ready','failed','cancelled']);
export const IELTS_STORE_NAMES=Object.freeze({
  errors:'errorRecords',
  lexicalSets:'lexicalSets',
  lexicalRelations:'lexicalRelations',
  labItems:'labItems',
  readingPassages:'readingPassages',
  readingAttempts:'readingAttempts',
  mediaSources:'mediaSources',
  transcriptionJobs:'transcriptionJobs',
  transcriptSegments:'transcriptSegments',
  mediaAttempts:'mediaAttempts',
  mediaProgress:'mediaProgress',
  settings:'settings'
});

const ERROR_CATEGORIES=new Set([
  'meaning','spelling','listening','segmentation','word-form','collocation','register','grammar','paraphrase','distractor','reading-strategy','lexical-gap','pronunciation','discourse','other'
]);
const SOURCE_TYPES=new Set(['exercise','card','lexical-set','paraphrase','reading','media','shadowing','retell','manual']);
const RELATIONS=new Set(['equivalent','contrast','confusable','not-equivalent']);
const QUESTION_TYPES=new Set(['paraphrase-match','main-idea','evidence-match','reference','inference','true-false-not-given']);

export function createIeltsId(prefix='ielts'){
  return globalThis.crypto?.randomUUID?.()||`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
}

export function cleanText(value='',max=10_000){
  return String(value??'').replace(/\r\n?/g,'\n').trim().slice(0,max);
}

export function normalizeComparableText(value=''){
  return cleanText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[’‘`]/g,"'")
    .replace(/[–—]/g,'-')
    .replace(/[^a-z0-9\s'-]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

export function normalizeSourceRef(input={}){
  const type=SOURCE_TYPES.has(input.type)?input.type:'manual';
  return Object.freeze({
    type,
    sourceId:cleanText(input.sourceId,180)||null,
    subId:cleanText(input.subId,180)||null,
    title:cleanText(input.title,240)||null,
    context:cleanText(input.context,2000)||null,
    url:cleanText(input.url,1000)||null
  });
}

export function normalizeAiArtifact(input={}){
  const status=AI_ARTIFACT_STATUSES.includes(input.status)?input.status:'draft';
  return {
    status,
    model:cleanText(input.model,120)||null,
    promptVersion:cleanText(input.promptVersion,80)||null,
    schemaVersion:Number(input.schemaVersion||IELTS_SCHEMA_VERSION),
    generatedAt:Number(input.generatedAt||Date.now()),
    validatedAt:Number(input.validatedAt||0)||null,
    verifiedAt:Number(input.verifiedAt||0)||null,
    verifiedBy:cleanText(input.verifiedBy,120)||null,
    validationErrors:Array.isArray(input.validationErrors)?input.validationErrors.map(value=>cleanText(value,300)).filter(Boolean).slice(0,20):[]
  };
}

function normalizeErrorCategory(value){return ERROR_CATEGORIES.has(value)?value:'other';}

export function buildErrorKey(input={}){
  const category=normalizeErrorCategory(input.category);
  const source=normalizeSourceRef(input.sourceRef||input.source||{});
  const linked=Array.isArray(input.linkedCardIds)?[...new Set(input.linkedCardIds.map(value=>cleanText(value,180)).filter(Boolean))].sort():[];
  const learner=normalizeComparableText(input.learnerResponse);
  const expected=normalizeComparableText(input.expectedResponse||input.correction);
  const target=linked.join(',')||cleanText(input.targetKey,200)||source.subId||source.sourceId||'';
  return [category,target,learner,expected].join('::');
}

export function createErrorRecord(input={}){
  const now=Number(input.now||Date.now());
  const linkedCardIds=[...new Set((Array.isArray(input.linkedCardIds)?input.linkedCardIds:[]).map(value=>cleanText(value,180)).filter(Boolean))];
  const record={
    id:cleanText(input.id,180)||createIeltsId('error'),
    category:normalizeErrorCategory(input.category),
    normalizedKey:'',
    sourceRef:normalizeSourceRef(input.sourceRef||input.source||{}),
    prompt:cleanText(input.prompt,2500),
    learnerResponse:cleanText(input.learnerResponse,2500),
    expectedResponse:cleanText(input.expectedResponse,2500),
    correction:cleanText(input.correction||input.expectedResponse,2500),
    explanation:cleanText(input.explanation,3000),
    linkedCardIds,
    tags:[...new Set((Array.isArray(input.tags)?input.tags:[]).map(value=>cleanText(value,80)).filter(Boolean))].slice(0,16),
    occurrenceCount:Math.max(1,Number(input.occurrenceCount||1)),
    firstSeenAt:Number(input.firstSeenAt||now),
    lastSeenAt:Number(input.lastSeenAt||now),
    status:ERROR_STATUSES.includes(input.status)?input.status:'open',
    resolutionAttempts:Math.max(0,Number(input.resolutionAttempts||0)),
    evidenceAttempts:Array.isArray(input.evidenceAttempts)?structuredClone(input.evidenceAttempts).slice(-30):[],
    lastResolvedAt:Number(input.lastResolvedAt||0)||null,
    severity:['high','medium','low'].includes(input.severity)?input.severity:'medium',
    provenance:normalizeAiArtifact(input.provenance||{status:'verified',generatedAt:now})
  };
  record.normalizedKey=cleanText(input.normalizedKey,1000)||buildErrorKey(record);
  return record;
}

export function mergeErrorRecords(existing,incoming){
  const current=createErrorRecord(existing);
  const next=createErrorRecord(incoming);
  if(current.normalizedKey!==next.normalizedKey)throw new Error('Không thể gộp hai lỗi có normalizedKey khác nhau.');
  return createErrorRecord({
    ...current,
    learnerResponse:next.learnerResponse||current.learnerResponse,
    expectedResponse:next.expectedResponse||current.expectedResponse,
    correction:next.correction||current.correction,
    explanation:next.explanation||current.explanation,
    linkedCardIds:[...new Set([...current.linkedCardIds,...next.linkedCardIds])],
    tags:[...new Set([...current.tags,...next.tags])],
    evidenceAttempts:[...current.evidenceAttempts,...next.evidenceAttempts].slice(-30),
    occurrenceCount:Number(current.occurrenceCount||1)+Number(next.occurrenceCount||1),
    firstSeenAt:Math.min(current.firstSeenAt,next.firstSeenAt),
    lastSeenAt:Math.max(current.lastSeenAt,next.lastSeenAt),
    status:current.status==='ignored'?'ignored':current.status==='resolved'?'monitoring':current.status,
    severity:current.severity==='high'||next.severity==='high'?'high':current.severity==='medium'||next.severity==='medium'?'medium':'low'
  });
}

export function resolveIeltsEvidence(input={}){
  return decideEvidence({attempt:input.attempt,activity:input.activitySpec,verification:input.verification});
}

export function ieltsSourceRevision(prefix,value={}){
  return `${cleanText(prefix,80)||'ielts-source'}:${evidenceDigest(JSON.stringify(value))}`;
}

export function buildIeltsEvidenceEnvelope({activityId,receiptId,activityType,cardId,skill,sourceId,sourceRevision,result,learnerOutput='',errorType=null,sourceVerified=false,assistance={},evaluation=null}={}){
  const id=cleanText(activityId,180);const receipt=cleanText(receiptId,180);const target={cardId:cleanText(cardId,180)||null,skill:cleanText(skill,80)||null,sourceId:cleanText(sourceId,180)||null,sourceRevision:cleanText(sourceRevision,180)||null};
  const attemptId=`attempt:${receipt}`;
  const occurredAt=Date.now();
  const activitySpec=createActivitySpec({id,type:cleanText(activityType,80),target,plannedAt:occurredAt,timezone:'UTC',policyVersion:'phase0-evidence-v1',executor:'ielts-lab'});
  const run=createRun({id:`run:${id}`,activitySpec,status:'active',startedAt:occurredAt,timezone:'UTC'});
  const attempt=createAttempt({id:attemptId,run,activitySpec,receiptId:receipt,activityType:activitySpec.type,result:cleanText(result,40),target,learnerOutput:cleanText(learnerOutput,10_000),errorType:cleanText(errorType,80)||null,assistance:normalizeAssistanceTrace({id:`trace:${receipt}`,schemaVersion:1,collector:'ielts-lab',complete:true,...assistance}),occurredAt,timezone:'UTC'});
  const canonicalReceipt=createReceipt({id:receipt,run,activitySpec,attempt,status:result==='skipped'?'skipped':'completed',issuedAt:occurredAt,timezone:'UTC'});
  const verification={source:{id:`source:${sourceRevision}`,authority:'ielts-source-registry',status:sourceVerified?'verified':'unverified',sourceId:target.sourceId,sourceRevision:target.sourceRevision}};
  if(evaluation)verification.evaluation={id:cleanText(evaluation.id,180)||`evaluation:${receipt}`,authority:cleanText(evaluation.authority,80),status:cleanText(evaluation.status,40),attemptId,activityId:id,cardId:target.cardId,skill:target.skill,outputDigest:evidenceDigest(attempt.learnerOutput),targetUsed:evaluation.targetUsed===true};
  const decision=resolveIeltsEvidence({attempt,activitySpec,verification});
  return Object.freeze({run,attempt,receipt:canonicalReceipt,activitySpec,verification,decision});
}

export function sanitizeLexicalSet(input={}){
  const itemIds=[...new Set((Array.isArray(input.itemIds)?input.itemIds:[]).map(value=>cleanText(value,180)).filter(Boolean))];
  const functions=[...new Set((Array.isArray(input.functions)?input.functions:[]).map(value=>cleanText(value,100)).filter(Boolean))];
  return {
    id:cleanText(input.id,180)||createIeltsId('lexical-set'),
    name:cleanText(input.name,180),
    description:cleanText(input.description,1200),
    level:cleanText(input.level,20)||'B1–C1',
    functions,
    register:cleanText(input.register,120)||'neutral',
    commonMistakes:(Array.isArray(input.commonMistakes)?input.commonMistakes:[]).map(value=>cleanText(value,500)).filter(Boolean).slice(0,20),
    productionTask:cleanText(input.productionTask,1200),
    itemIds,
    status:['draft','active','archived'].includes(input.status)?input.status:'draft',
    provenance:normalizeAiArtifact(input.provenance||{status:'verified'}),
    createdAt:Number(input.createdAt||Date.now()),
    updatedAt:Number(input.updatedAt||Date.now())
  };
}

export function validateLexicalSet(input={}){
  const value=sanitizeLexicalSet(input);const errors=[];
  if(!value.name)errors.push('Thiếu tên lexical set.');
  if(!value.description)errors.push('Thiếu mô tả.');
  if(!value.functions.length)errors.push('Thiếu communicative function.');
  if(!value.register)errors.push('Thiếu register.');
  if(!value.commonMistakes.length)errors.push('Thiếu common mistakes.');
  if(!value.productionTask)errors.push('Thiếu production task.');
  if(value.itemIds.length<3)errors.push('Lexical set cần ít nhất 3 mục.');
  return{valid:errors.length===0,errors,value};
}

export function sanitizeLexicalRelation(input={}){
  return {
    id:cleanText(input.id,180)||createIeltsId('relation'),
    sourceCardIds:[...new Set((Array.isArray(input.sourceCardIds)?input.sourceCardIds:[]).map(value=>cleanText(value,180)).filter(Boolean))],
    sourceText:cleanText(input.sourceText,1800),
    candidateText:cleanText(input.candidateText,1800),
    relation:RELATIONS.has(input.relation)?input.relation:'not-equivalent',
    meaningPreserved:Boolean(input.meaningPreserved),
    constraints:(Array.isArray(input.constraints)?input.constraints:[]).map(value=>cleanText(value,300)).filter(Boolean).slice(0,12),
    explanation:cleanText(input.explanation,1800),
    context:cleanText(input.context,1800),
    status:AI_ARTIFACT_STATUSES.includes(input.status)?input.status:'draft',
    provenance:normalizeAiArtifact(input.provenance||{status:'draft'}),
    createdAt:Number(input.createdAt||Date.now()),
    updatedAt:Number(input.updatedAt||Date.now())
  };
}

export function sanitizeLabItem(input={}){
  const options=(Array.isArray(input.options)?input.options:[]).map((option,index)=>({
    id:cleanText(option?.id,100)||`option-${index+1}`,
    text:cleanText(option?.text,1800),
    correct:Boolean(option?.correct),
    rationale:cleanText(option?.rationale,1800)
  })).filter(option=>option.text);
  return {
    id:cleanText(input.id,180)||createIeltsId('lab-item'),
    kind:['paraphrase','distractor'].includes(input.kind)?input.kind:'paraphrase',
    prompt:cleanText(input.prompt,2000),
    context:cleanText(input.context,2500),
    options,
    sourceCardIds:[...new Set((Array.isArray(input.sourceCardIds)?input.sourceCardIds:[]).map(value=>cleanText(value,180)).filter(Boolean))],
    status:AI_ARTIFACT_STATUSES.includes(input.status)?input.status:'draft',
    provenance:normalizeAiArtifact(input.provenance||{status:'draft'}),
    createdAt:Number(input.createdAt||Date.now()),
    updatedAt:Number(input.updatedAt||Date.now())
  };
}

export function validateLabItem(input={}){
  const value=sanitizeLabItem(input);const errors=[];
  if(!value.prompt)errors.push('Thiếu prompt.');
  if(value.options.length<2)errors.push('Cần ít nhất hai lựa chọn.');
  const correct=value.options.filter(option=>option.correct);
  if(correct.length!==1)errors.push('Mỗi item MVP phải có đúng một đáp án đúng.');
  for(const option of value.options)if(!option.rationale)errors.push(`Lựa chọn ${option.id} thiếu giải thích.`);
  const normalized=value.options.map(option=>normalizeComparableText(option.text));
  if(new Set(normalized).size!==normalized.length)errors.push('Có lựa chọn trùng nhau.');
  if(value.status==='verified'&&value.provenance.status!=='verified')errors.push('Item verified cần provenance verified.');
  return{valid:errors.length===0,errors,value};
}

export function sanitizeReadingPassage(input={}){
  const passage=cleanText(input.passage,12_000);
  const questions=(Array.isArray(input.questions)?input.questions:[]).map((question,index)=>({
    id:cleanText(question?.id,120)||`question-${index+1}`,
    type:QUESTION_TYPES.has(question?.type)?question.type:'paraphrase-match',
    prompt:cleanText(question?.prompt,1800),
    options:(Array.isArray(question?.options)?question.options:[]).map((option,optionIndex)=>({
      id:cleanText(option?.id,100)||`option-${optionIndex+1}`,
      text:cleanText(option?.text,1600),
      correct:Boolean(option?.correct),
      rationale:cleanText(option?.rationale,1600)
    })).filter(option=>option.text),
    evidenceText:cleanText(question?.evidenceText,1800),
    explanation:cleanText(question?.explanation,2200)
  }));
  return {
    id:cleanText(input.id,180)||createIeltsId('reading'),
    title:cleanText(input.title,240)||'Reading Micro-practice',
    passage,
    microSkill:cleanText(input.microSkill,120)||'paraphrase/evidence matching',
    questions,
    status:AI_ARTIFACT_STATUSES.includes(input.status)?input.status:'draft',
    provenance:normalizeAiArtifact(input.provenance||{status:'draft'}),
    sourceRef:normalizeSourceRef(input.sourceRef||{type:'reading'}),
    createdAt:Number(input.createdAt||Date.now()),
    updatedAt:Number(input.updatedAt||Date.now())
  };
}

export function validateReadingPassage(input={}){
  const value=sanitizeReadingPassage(input);const errors=[];
  const words=value.passage.split(/\s+/).filter(Boolean).length;
  if(words<80||words>220)errors.push('Passage MVP phải khoảng 80–220 từ.');
  if(value.questions.length<2||value.questions.length>4)errors.push('Passage cần 2–4 câu hỏi.');
  for(const question of value.questions){
    if(!question.prompt)errors.push(`${question.id} thiếu prompt.`);
    if(!question.evidenceText||!normalizeComparableText(value.passage).includes(normalizeComparableText(question.evidenceText)))errors.push(`${question.id} thiếu evidence text hợp lệ trong passage.`);
    const correct=question.options.filter(option=>option.correct);
    if(correct.length!==1)errors.push(`${question.id} phải có đúng một đáp án đúng.`);
    if(question.options.length<2)errors.push(`${question.id} cần ít nhất hai lựa chọn.`);
    for(const option of question.options)if(!option.rationale)errors.push(`${question.id}/${option.id} thiếu giải thích distractor.`);
    if(!question.explanation)errors.push(`${question.id} thiếu giải thích tổng.`);
  }
  return{valid:errors.length===0,errors,value};
}

export function parseYouTubeUrl(value=''){
  const raw=cleanText(value,1200);
  if(!raw)return{valid:false,error:'Hãy dán URL YouTube.',videoId:null,canonicalUrl:null,startSeconds:0};
  let url;try{url=new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`);}catch{return{valid:false,error:'URL không hợp lệ.',videoId:null,canonicalUrl:null,startSeconds:0};}
  const host=url.hostname.toLowerCase().replace(/^www\./,'').replace(/^m\./,'');
  let videoId='';
  if(host==='youtu.be')videoId=url.pathname.split('/').filter(Boolean)[0]||'';
  else if(['youtube.com','youtube-nocookie.com'].includes(host)){
    if(url.pathname==='/watch')videoId=url.searchParams.get('v')||'';
    else{
      const parts=url.pathname.split('/').filter(Boolean);
      if(['shorts','embed','live'].includes(parts[0]))videoId=parts[1]||'';
    }
  }
  if(!/^[A-Za-z0-9_-]{11}$/.test(videoId))return{valid:false,error:'Không nhận diện được video ID YouTube.',videoId:null,canonicalUrl:null,startSeconds:0};
  const parseTime=input=>{
    if(/^\d+(?:\.\d+)?$/.test(String(input||'')))return Math.max(0,Number(input));
    const match=String(input||'').match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);if(!match)return 0;
    return Number(match[1]||0)*3600+Number(match[2]||0)*60+Number(match[3]||0);
  };
  const startSeconds=parseTime(url.searchParams.get('t')||url.searchParams.get('start')||0);
  return{valid:true,error:null,videoId,canonicalUrl:`https://www.youtube.com/watch?v=${videoId}`,embedUrl:`https://www.youtube-nocookie.com/embed/${videoId}`,startSeconds};
}

export function sanitizeTranscriptSegment(input={},index=0){
  const startMs=Math.max(0,Math.round(Number(input.startMs??Number(input.startSeconds||0)*1000)||0));
  const endMs=Math.max(startMs+100,Math.round(Number(input.endMs??Number(input.endSeconds||0)*1000)||0));
  const confidenceValue=Number(input.confidence);
  return {
    id:cleanText(input.id,180)||createIeltsId('segment'),
    mediaSourceId:cleanText(input.mediaSourceId,180),
    order:Math.max(0,Number(input.order??index)),
    startMs,
    endMs,
    text:cleanText(input.text,2500),
    language:cleanText(input.language,30)||'en',
    speaker:cleanText(input.speaker,100)||null,
    confidence:Number.isFinite(confidenceValue)?Math.max(0,Math.min(1,confidenceValue)):null,
    confidenceSource:cleanText(input.confidenceSource,80)||null,
    status:TRANSCRIPT_STATUSES.includes(input.status)?input.status:'needs-review',
    userCorrected:Boolean(input.userCorrected),
    linkedCardIds:[...new Set((Array.isArray(input.linkedCardIds)?input.linkedCardIds:[]).map(value=>cleanText(value,180)).filter(Boolean))],
    updatedAt:Number(input.updatedAt||Date.now())
  };
}

export function validateTranscriptSegments(input=[],options={}){
  const durationMs=Math.max(0,Number(options.durationMs||0));
  const segments=(Array.isArray(input)?input:[]).map((segment,index)=>sanitizeTranscriptSegment(segment,index)).sort((a,b)=>a.order-b.order||a.startMs-b.startMs);
  const errors=[];const warnings=[];let previous=null;
  if(!segments.length)errors.push('Transcript không có segment.');
  for(const segment of segments){
    if(!segment.text)errors.push(`${segment.id} không có nội dung.`);
    if(segment.endMs<=segment.startMs)errors.push(`${segment.id} có timestamp kết thúc không hợp lệ.`);
    const length=segment.endMs-segment.startMs;
    if(length<400)warnings.push(`${segment.id} ngắn dưới 0,4 giây.`);
    if(length>30_000)warnings.push(`${segment.id} dài trên 30 giây; nên tách câu.`);
    if(durationMs&&segment.endMs>durationMs+1500)errors.push(`${segment.id} vượt quá thời lượng video.`);
    if(previous){
      if(segment.startMs<previous.startMs)errors.push(`${segment.id} không theo thứ tự thời gian.`);
      const overlap=previous.endMs-segment.startMs;
      if(overlap>1500)warnings.push(`${previous.id} và ${segment.id} chồng lấn ${overlap} ms.`);
    }
    previous=segment;
  }
  const duplicateWindows=new Map();
  for(const segment of segments){const key=`${Math.round(segment.startMs/500)}:${normalizeComparableText(segment.text)}`;duplicateWindows.set(key,(duplicateWindows.get(key)||0)+1);}
  if([...duplicateWindows.values()].some(count=>count>2))errors.push('Transcript có đoạn lặp bất thường.');
  return{valid:errors.length===0,errors,warnings,segments};
}

export function splitTranscriptSegment(segment,splitMs){
  const value=sanitizeTranscriptSegment(segment);
  const point=Math.round(Number(splitMs));
  if(point<=value.startMs+200||point>=value.endMs-200)throw new Error('Điểm tách phải nằm cách hai đầu ít nhất 200 ms.');
  const words=value.text.split(/\s+/).filter(Boolean);const ratio=(point-value.startMs)/(value.endMs-value.startMs);const index=Math.max(1,Math.min(words.length-1,Math.round(words.length*ratio)));
  return[
    sanitizeTranscriptSegment({...value,id:createIeltsId('segment'),endMs:point,text:words.slice(0,index).join(' '),userCorrected:true,status:'needs-review'},value.order),
    sanitizeTranscriptSegment({...value,id:createIeltsId('segment'),startMs:point,text:words.slice(index).join(' '),order:value.order+0.5,userCorrected:true,status:'needs-review'},value.order+1)
  ];
}

export function mergeTranscriptSegments(first,second){
  const a=sanitizeTranscriptSegment(first),b=sanitizeTranscriptSegment(second);
  if(a.mediaSourceId&&b.mediaSourceId&&a.mediaSourceId!==b.mediaSourceId)throw new Error('Không thể gộp segment từ hai video khác nhau.');
  return sanitizeTranscriptSegment({...a,id:createIeltsId('segment'),startMs:Math.min(a.startMs,b.startMs),endMs:Math.max(a.endMs,b.endMs),text:`${a.text} ${b.text}`.trim(),userCorrected:true,status:'needs-review',linkedCardIds:[...new Set([...a.linkedCardIds,...b.linkedCardIds])]},Math.min(a.order,b.order));
}

export function tokenizeForDiff(value=''){
  return cleanText(value).toLowerCase().match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g)||[];
}

export function diffWords(expected='',actual=''){
  const a=tokenizeForDiff(expected),b=tokenizeForDiff(actual);const rows=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++)rows[i][0]=i;for(let j=0;j<=b.length;j++)rows[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)rows[i][j]=a[i-1]===b[j-1]?rows[i-1][j-1]:1+Math.min(rows[i-1][j],rows[i][j-1],rows[i-1][j-1]);
  const operations=[];let i=a.length,j=b.length;
  while(i||j){
    if(i&&j&&a[i-1]===b[j-1]){operations.push({type:'equal',expected:a[i-1],actual:b[j-1]});i--;j--;continue;}
    const deletion=i?rows[i-1][j]:Infinity,insertion=j?rows[i][j-1]:Infinity,replacement=i&&j?rows[i-1][j-1]:Infinity;
    if(replacement<=deletion&&replacement<=insertion){operations.push({type:'replace',expected:a[i-1],actual:b[j-1]});i--;j--;}
    else if(deletion<=insertion){operations.push({type:'missing',expected:a[i-1],actual:null});i--;}
    else{operations.push({type:'extra',expected:null,actual:b[j-1]});j--;}
  }
  operations.reverse();const distance=rows[a.length][b.length];const accuracy=a.length?Math.max(0,1-distance/Math.max(a.length,b.length,1)):b.length?0:1;
  return{expectedTokens:a,actualTokens:b,distance,accuracy,operations};
}

export function planMediaSession(input={}){
  const minutes=IELTS_SESSION_MINUTES.includes(Number(input.minutes))?Number(input.minutes):20;
  const available=Math.max(0,Number(input.availableSegments||0));
  const weak=Math.max(0,Number(input.weakSegments||0));
  const completed=Math.max(0,Number(input.completedSegments||0));
  const dictationTarget=minutes===10?5:minutes===30?14:9;
  const shadowTarget=minutes===10?2:minutes===30?6:4;
  const retellTarget=completed>=8?(minutes===10?0:minutes===30?2:1):0;
  return {
    minutes,
    dictationSegments:Math.min(available,Math.max(0,dictationTarget+Math.min(3,weak))),
    shadowingSegments:Math.min(available,shadowTarget),
    retellSegments:retellTarget,
    reviewMinutes:minutes===10?1:2,
    rationale:completed<8?'Ưu tiên Dictation trước khi Retell.':'Kết hợp Dictation, Shadowing và Retell theo tiến độ.'
  };
}

export function sanitizeMediaSource(input={}){
  const parsed=parseYouTubeUrl(input.url||input.canonicalUrl||'');
  return {
    id:cleanText(input.id,180)||createIeltsId('media'),
    provider:'youtube',
    videoId:cleanText(input.videoId,20)||(parsed.valid?parsed.videoId:''),
    canonicalUrl:cleanText(input.canonicalUrl,1200)||(parsed.valid?parsed.canonicalUrl:''),
    title:cleanText(input.title,300)||'YouTube video',
    durationMs:Math.max(0,Number(input.durationMs||0)),
    language:cleanText(input.language,30)||'en',
    transcriptStatus:TRANSCRIPT_STATUSES.includes(input.transcriptStatus)?input.transcriptStatus:'draft',
    transcriptModel:cleanText(input.transcriptModel,120)||null,
    createdAt:Number(input.createdAt||Date.now()),
    updatedAt:Number(input.updatedAt||Date.now())
  };
}

export function sanitizeMediaAttempt(input={}){
  return {
    id:cleanText(input.id,180)||createIeltsId('media-attempt'),
    mediaSourceId:cleanText(input.mediaSourceId,180),
    segmentId:cleanText(input.segmentId,180)||null,
    mode:['dictation','shadowing','retell'].includes(input.mode)?input.mode:'dictation',
    learnerResponse:cleanText(input.learnerResponse,5000),
    expectedResponse:cleanText(input.expectedResponse,5000),
    result:['correct','near','wrong','skipped','coaching'].includes(input.result)?input.result:'wrong',
    wordErrors:Array.isArray(input.wordErrors)?structuredClone(input.wordErrors).slice(0,200):[],
    hintsUsed:Math.max(0,Number(input.hintsUsed||0)),
    linkedCardIds:[...new Set((Array.isArray(input.linkedCardIds)?input.linkedCardIds:[]).map(value=>cleanText(value,180)).filter(Boolean))],
    evidenceAttempts:Array.isArray(input.evidenceAttempts)?structuredClone(input.evidenceAttempts).slice(0,30):[],
    evidenceDecisions:Array.isArray(input.evidenceDecisions)?structuredClone(input.evidenceDecisions).slice(0,30):[],
    evaluationStatus:['not-requested','pending','completed','failed'].includes(input.evaluationStatus)?input.evaluationStatus:'not-requested',
    evaluationError:cleanText(input.evaluationError,1000)||null,
    completedAt:Number(input.completedAt||Date.now()),
    durationMs:Math.max(0,Number(input.durationMs||0))
  };
}

export function validateRetellFeedback(input={}){
  const forbidden=JSON.stringify(input).match(/\b(?:band\s*[0-9]|ielts\s*(?:score|band)|overall\s*band)\b/i);
  const errors=[];if(forbidden)errors.push('Retell feedback không được chứa band score.');
  const value={
    mainIdeas:(Array.isArray(input.mainIdeas)?input.mainIdeas:[]).map(item=>({idea:cleanText(item?.idea,500),covered:Boolean(item?.covered),evidence:cleanText(item?.evidence,600)})).slice(0,8),
    targetAssessments:(Array.isArray(input.targetAssessments)?input.targetAssessments:[]).map(item=>({cardId:cleanText(item?.cardId,180),term:cleanText(item?.term,180),usedCorrectly:Boolean(item?.usedCorrectly),feedback:cleanText(item?.feedback,500)})).filter(item=>item.cardId).slice(0,12),
    lexicalGaps:(Array.isArray(input.lexicalGaps)?input.lexicalGaps:[]).map(value=>cleanText(value,300)).filter(Boolean).slice(0,8),
    errors:(Array.isArray(input.errors)?input.errors:[]).map(item=>({category:normalizeErrorCategory(item?.category),learnerResponse:cleanText(item?.learnerResponse,800),correction:cleanText(item?.correction,800),explanation:cleanText(item?.explanation,800)})).filter(item=>item.correction||item.explanation).slice(0,3),
    feedback:cleanText(input.feedback,1600)
  };
  return{valid:errors.length===0,errors,value};
}
