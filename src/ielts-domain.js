import { decideEvidence,evidenceDigest,normalizeAssistanceTrace } from './evidence-policy.js';
import { createActivitySpec,createAttempt,createReceipt,createRun } from './learning-contracts.js';
import { createSourceRevisionRef } from './source-revision-ref.js';
import { canonicalContentJson } from './content-contracts-v2.js';

export const IELTS_SCHEMA_VERSION=1;
export const IELTS_READING_SOURCE_KIND='ielts-reading-source-revision';
export const IELTS_READING_SOURCE_VERSION=1;
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
  settings:'settings',
  objectiveInventory:'objectiveInventory',
  learnerArtifacts:'learnerArtifacts',
  frozenAssessments:'frozenAssessments',
  testBlueprints:'ieltsTestBlueprints',
  testRuns:'ieltsTestRuns'
});



const ERROR_CATEGORIES=new Set([
  'meaning','spelling','listening','segmentation','word-form','collocation','register','grammar','paraphrase','distractor','reading-strategy','lexical-gap','pronunciation','discourse','writing-grammar','writing-lexical','writing-cohesion','writing-task-response','other'
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

function readingSourceError(message){return Object.assign(new TypeError(message),{code:'IELTS_READING_SOURCE_INVALID'});}
export const IELTS_READING_OBJECTIVE_TEXT_KINDS=Object.freeze(['reading-sentence-completion','reading-summary-completion','reading-note-completion','reading-table-completion','reading-flow-chart-completion','reading-short-answer','reading-diagram-label-completion']);
export const IELTS_READING_MATCHING_KINDS=Object.freeze(['reading-matching-information','reading-matching-headings','reading-matching-features','reading-matching-sentence-endings']);
function readingSourceData(value,path='reading source',seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return;
  if(!value||typeof value!=='object'||seen.has(value))throw readingSourceError(`${path} must be plain data.`);seen.add(value);
  if(Array.isArray(value)){if(Object.getOwnPropertySymbols(value).length)throw readingSourceError(`${path} must not contain symbols.`);for(let index=0;index<value.length;index++){const descriptor=Object.getOwnPropertyDescriptor(value,String(index));if(!descriptor||descriptor.get||descriptor.set)throw readingSourceError(`${path} must contain data entries.`);readingSourceData(descriptor.value,`${path}[${index}]`,seen);}}
  else {if(Object.getPrototypeOf(value)!==Object.prototype&&Object.getPrototypeOf(value)!==null||Object.getOwnPropertySymbols(value).length)throw readingSourceError(`${path} must be a plain object.`);for(const key of Object.keys(value)){const descriptor=Object.getOwnPropertyDescriptor(value,key);if(!descriptor||descriptor.get||descriptor.set)throw readingSourceError(`${path}.${key} must be data-only.`);readingSourceData(descriptor.value,`${path}.${key}`,seen);}}
  seen.delete(value);
}
function readingSourceToken(value,label){if(typeof value!=='string'||!/^[a-z0-9][a-z0-9._:-]{2,159}$/.test(value))throw readingSourceError(`${label} must be a stable token.`);return value;}
function sourceSealedOptions(items){
  if(!Array.isArray(items)||items.length>32)throw readingSourceError('objectiveItems must be a bounded array.');const ids=new Set();return items.map(item=>{if(!item||typeof item!=='object'||Array.isArray(item))throw readingSourceError('objectiveItems must be exact.');const inventoryId=readingSourceToken(item.inventoryId,'objectiveItems.inventoryId');if(ids.has(inventoryId))throw readingSourceError('objectiveItems inventory IDs must be distinct.');ids.add(inventoryId);
    if(Object.keys(item).every(key=>['inventoryId','kind','schemaVersion'].includes(key))){if(Object.keys(item).length!==3||![...IELTS_READING_OBJECTIVE_TEXT_KINDS,...IELTS_READING_MATCHING_KINDS].includes(item.kind)||item.schemaVersion!==1)throw readingSourceError('objectiveItems OTR or matching seal is invalid.');return{inventoryId,kind:item.kind,schemaVersion:1};}
    if(Object.keys(item).some(key=>!['inventoryId','options'].includes(key)))throw readingSourceError('objectiveItems must be an exact choice, OTR, or matching seal.');if(!Array.isArray(item.options)||item.options.length<2||item.options.length>8||item.options.some(option=>!option||typeof option!=='object'||Array.isArray(option)||Object.keys(option).some(key=>!['id','text','correct','rationale'].includes(key))||typeof option.id!=='string'||!option.id.trim()||typeof option.text!=='string'||!option.text.trim()||typeof option.correct!=='boolean'||typeof option.rationale!=='string'||!option.rationale.trim()))throw readingSourceError('objectiveItems options are invalid.');if(item.options.filter(option=>option.correct).length!==1||new Set(item.options.map(option=>option.id)).size!==item.options.length)throw readingSourceError('objectiveItems must have exactly one distinct owner key.');return{inventoryId,options:item.options.map(option=>({id:option.id.trim(),text:option.text.trim(),correct:option.correct,rationale:option.rationale.trim()}))};});
}
export function createIeltsReadingSourceRevision(input={}){
  try{readingSourceData(input);const allowed=['kind','schemaVersion','id','revision','profile','title','passage','objectiveItems','status','createdAt','updatedAt','sourceRevisionRef','extensions'];if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!allowed.includes(key)))throw readingSourceError('Reading source contains unsupported fields.');const id=readingSourceToken(input.id,'id'),revision=Number(input.revision);if(!Number.isSafeInteger(revision)||revision<1)throw readingSourceError('revision must be positive.');const profile=['academic','general-training'].includes(input.profile)?input.profile:(()=>{throw readingSourceError('profile must be academic or general-training.');})();const title=typeof input.title==='string'&&input.title.trim()&&input.title.trim().length<=240?input.title.trim():(()=>{throw readingSourceError('title is required.');})();const passage=typeof input.passage==='string'&&input.passage.trim()&&input.passage.trim().length<=12_000?input.passage.trim():(()=>{throw readingSourceError('passage is required.');})();const objectiveItems=sourceSealedOptions(input.objectiveItems);const status=input.status==='verified'?'verified':(()=>{throw readingSourceError('Reading source must be verified before use.');})();const createdAt=Number(input.createdAt),updatedAt=Number(input.updatedAt);if(!Number.isFinite(createdAt)||!Number.isFinite(updatedAt)||updatedAt<createdAt)throw readingSourceError('Reading source timestamps are invalid.');const integrity=ieltsSourceRevision('ielts-reading-source-v1',{id,revision,profile,title,passage,objectiveItems});const sourceRevisionRef=createSourceRevisionRef({schema:'SourceRevisionRef',version:1,kind:'ielts-reading-passage',authority:'ielts-reading-owner',sourceId:`reading-source:${id}`,revisionId:`reading-source:${id}:${revision}`,integrity,locator:{passageId:id,revision},provenance:{origin:'ielts-reading-owner',verification:'verified',rights:'allowed',privacy:'private'}});if(input.sourceRevisionRef&&JSON.stringify(createSourceRevisionRef(input.sourceRevisionRef))!==JSON.stringify(sourceRevisionRef))throw readingSourceError('sourceRevisionRef must match immutable source content.');return Object.freeze({kind:IELTS_READING_SOURCE_KIND,schemaVersion:IELTS_READING_SOURCE_VERSION,id,revision,profile,title,passage,objectiveItems,status,createdAt,updatedAt,sourceRevisionRef,extensions:input.extensions||{}});}catch(error){if(error?.code==='IELTS_READING_SOURCE_INVALID')throw error;throw readingSourceError(error?.message||'Reading source is invalid.');}
}
export function validateIeltsReadingSourceRevision(input={}){try{return{valid:true,errors:[],value:createIeltsReadingSourceRevision(input)};}catch(error){return{valid:false,errors:[error.message],value:null};}}

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

export const IELTS_TRACKS = Object.freeze(['academic', 'general-training']);

export function validateIeltsTrack(track) {
  if (typeof track === 'string' && IELTS_TRACKS.includes(track)) {
    return { valid: true, track };
  }
  return { valid: false, track: null, error: 'Invalid IELTS track: must be academic or general-training.' };
}

export function normalizeIeltsTrack(track) {
  const result = validateIeltsTrack(track);
  if (!result.valid) {
    throw new Error('Invalid track: must be academic or general-training.');
  }
  return result.track;
}

export const IELTS_PRACTICE_HIERARCHY_LEVELS = Object.freeze([
  'TASK_FAMILY',
  'PART_OR_SECTION',
  'SKILL_TEST',
  'FULL_MOCK'
]);

export function validateIeltsPracticeHierarchyLevel(level) {
  if (typeof level === 'string' && IELTS_PRACTICE_HIERARCHY_LEVELS.includes(level)) {
    return { valid: true, level };
  }
  return { valid: false, level: null, error: 'Invalid practice hierarchy level.' };
}

export function resolveIeltsTrack({ launchOverride, savedPreference } = {}) {
  if (launchOverride !== null && launchOverride !== undefined) {
    const overrideResult = validateIeltsTrack(launchOverride);
    if (overrideResult.valid) {
      return { valid: true, track: overrideResult.track, source: 'launch-override' };
    }
    return { valid: false, track: null, error: 'Invalid launch track override provided.' };
  }
  if (savedPreference !== null && savedPreference !== undefined) {
    const savedResult = validateIeltsTrack(savedPreference);
    if (savedResult.valid) {
      return { valid: true, track: savedResult.track, source: 'saved-preference' };
    }
    return { valid: false, track: null, error: 'Invalid saved track preference.' };
  }
  return { valid: false, track: null, error: 'Explicit track selection required: no silent default.' };
}

function sha256HexSync(value = '') {
  const bytes = new TextEncoder().encode(String(value));
  const words = [];
  const bitLength = bytes.length * 8;
  for (let i = 0; i < bytes.length; i++) words[i >> 2] = (words[i >> 2] || 0) | (bytes[i] << (24 - (i % 4) * 8));
  words[bitLength >> 5] = (words[bitLength >> 5] || 0) | (0x80 << (24 - bitLength % 32));
  words[(((bitLength + 64) >> 9) << 4) + 15] = bitLength;
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const rotate = (x, n) => (x >>> n) | (x << (32 - n));
  for (let offset = 0; offset < words.length; offset += 16) {
    const w = new Array(64);
    for (let i = 0; i < 16; i++) w[i] = words[offset + i] | 0;
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2];
      const s0 = rotate(a, 7) ^ rotate(a, 18) ^ (a >>> 3);
      const s1 = rotate(b, 17) ^ rotate(b, 19) ^ (b >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const s1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + s1 + ch + k[i] + w[i]) | 0;
      const s0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }
  return h.map(word => (word >>> 0).toString(16).padStart(8, '0')).join('');
}

export function computeIeltsBlueprintId(blueprint = {}) {
  const copy = { ...blueprint };
  delete copy.id;
  const canonicalJson = canonicalContentJson(copy);
  return `ielts-blueprint:${sha256HexSync(canonicalJson)}`;
}

export function validateIeltsTestBlueprint(input = {}) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['Blueprint must be an object.'], value: null };
  }
  if (input.kind !== 'ielts-test-blueprint') errors.push('kind must be ielts-test-blueprint.');
  if (Number(input.schemaVersion) !== 1) errors.push('schemaVersion must be 1.');
  const trackRes = validateIeltsTrack(input.track);
  if (!trackRes.valid) errors.push(trackRes.error);
  const hierRes = validateIeltsPracticeHierarchyLevel(input.hierarchyLevel);
  if (!hierRes.valid) errors.push(hierRes.error);
  if (!input.title || typeof input.title !== 'string') errors.push('title is required.');
  if (!input.timing || typeof input.timing !== 'object') errors.push('timing configuration is required.');
  if (!Array.isArray(input.sections)) errors.push('sections must be an array.');
  return { valid: errors.length === 0, errors, value: input };
}

export function validateIeltsSectionBlueprint(input = {}) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['Blueprint must be an object.'], value: null };
  }
  if (input.kind !== 'ielts-section-blueprint') errors.push('kind must be ielts-section-blueprint.');
  if (Number(input.schemaVersion) !== 1) errors.push('schemaVersion must be 1.');
  const trackRes = validateIeltsTrack(input.track);
  if (!trackRes.valid) errors.push(trackRes.error);
  const hierRes = validateIeltsPracticeHierarchyLevel(input.hierarchyLevel);
  if (!hierRes.valid) errors.push(hierRes.error);
  if (!input.title || typeof input.title !== 'string') errors.push('title is required.');
  return { valid: errors.length === 0, errors, value: input };
}

export function validateIeltsTestRun(input = {}) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['Run must be an object.'], value: null };
  }
  if (!input.id || typeof input.id !== 'string') errors.push('id is required.');
  if (!input.blueprintId || typeof input.blueprintId !== 'string') errors.push('blueprintId is required.');
  const trackRes = validateIeltsTrack(input.track);
  if (!trackRes.valid) errors.push(trackRes.error);
  if (!['active', 'completed', 'abandoned', 'expired'].includes(input.status)) errors.push('status is invalid.');
  if (input.affectsSchedule === true) errors.push('IELTS test run must never claim affectsSchedule.');
  if (input.evidenceEligible === true) errors.push('IELTS test run must never claim evidenceEligible.');
  return {
    valid: errors.length === 0,
    errors,
    value: Object.freeze({
      ...input,
      affectsSchedule: false,
      evidenceEligible: false
    })
  };
}

export function convertIeltsListeningRawToBand(rawScore) {
  if (typeof rawScore !== 'number' || !Number.isInteger(rawScore) || rawScore < 0 || rawScore > 40) {
    throw new Error(`Invalid IELTS Listening raw score: ${rawScore}. Must be an integer between 0 and 40.`);
  }
  if (rawScore >= 39) return 9.0;
  if (rawScore >= 37) return 8.5;
  if (rawScore >= 35) return 8.0;
  if (rawScore >= 32) return 7.5;
  if (rawScore >= 30) return 7.0;
  if (rawScore >= 26) return 6.5;
  if (rawScore >= 23) return 6.0;
  if (rawScore >= 18) return 5.5;
  if (rawScore >= 16) return 5.0;
  if (rawScore >= 13) return 4.5;
  if (rawScore >= 10) return 4.0;
  if (rawScore >= 6) return 3.5;
  if (rawScore >= 4) return 3.0;
  if (rawScore >= 2) return 2.5;
  if (rawScore >= 1) return 2.0;
  return 0.0;
}

export function convertIeltsAcademicReadingRawToBand(rawScore) {
  if (typeof rawScore !== 'number' || !Number.isInteger(rawScore) || rawScore < 0 || rawScore > 40) {
    throw new Error(`Invalid IELTS Academic Reading raw score: ${rawScore}. Must be an integer between 0 and 40.`);
  }
  if (rawScore >= 39) return 9.0;
  if (rawScore >= 37) return 8.5;
  if (rawScore >= 35) return 8.0;
  if (rawScore >= 33) return 7.5;
  if (rawScore >= 30) return 7.0;
  if (rawScore >= 27) return 6.5;
  if (rawScore >= 23) return 6.0;
  if (rawScore >= 19) return 5.5;
  if (rawScore >= 15) return 5.0;
  if (rawScore >= 13) return 4.5;
  if (rawScore >= 10) return 4.0;
  if (rawScore >= 8) return 3.5;
  if (rawScore >= 6) return 3.0;
  if (rawScore >= 4) return 2.5;
  if (rawScore >= 2) return 2.0;
  if (rawScore >= 1) return 1.0;
  return 0.0;
}

export function convertIeltsGeneralReadingRawToBand(rawScore) {
  if (typeof rawScore !== 'number' || !Number.isInteger(rawScore) || rawScore < 0 || rawScore > 40) {
    throw new Error(`Invalid IELTS General Training Reading raw score: ${rawScore}. Must be an integer between 0 and 40.`);
  }
  if (rawScore >= 40) return 9.0;
  if (rawScore >= 39) return 8.5;
  if (rawScore >= 37) return 8.0;
  if (rawScore >= 36) return 7.5;
  if (rawScore >= 34) return 7.0;
  if (rawScore >= 32) return 6.5;
  if (rawScore >= 30) return 6.0;
  if (rawScore >= 27) return 5.5;
  if (rawScore >= 23) return 5.0;
  if (rawScore >= 19) return 4.5;
  if (rawScore >= 15) return 4.0;
  if (rawScore >= 12) return 3.5;
  if (rawScore >= 9) return 3.0;
  if (rawScore >= 6) return 2.5;
  if (rawScore >= 3) return 2.0;
  if (rawScore >= 1) return 1.0;
  return 0.0;
}

export function calculateWritingWordCount(text = '') {
  if (typeof text !== 'string') return 0;
  const trimmed = text.replace(/\r\n?/g, '\n').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).filter(Boolean).length;
}

export function validateIeltsWritingPrompt(prompt) {
  if (!prompt || typeof prompt !== 'object') {
    return { valid: false, errors: ['Prompt must be an object.'], value: null };
  }
  const errors = [];
  if (!prompt.id || typeof prompt.id !== 'string') errors.push('Missing or invalid prompt ID.');
  if (prompt.kind !== 'ielts-writing-prompt') errors.push("kind must be 'ielts-writing-prompt'.");
  if (!['academic', 'general-training'].includes(prompt.track)) errors.push("track must be 'academic' or 'general-training'.");
  if (![1, 2].includes(prompt.taskNumber)) errors.push('taskNumber must be 1 or 2.');

  if (prompt.taskNumber === 1) {
    if (prompt.track === 'academic') {
      const validFamilies = ['line-graph', 'bar-chart', 'pie-chart', 'table', 'process-diagram', 'map-plan', 'mixed-graphics'];
      if (!validFamilies.includes(prompt.visualFamily)) {
        errors.push(`visualFamily must be one of: ${validFamilies.join(', ')}.`);
      }
    } else {
      const validRegisters = ['formal', 'semi-formal', 'informal'];
      if (!validRegisters.includes(prompt.letterRegister)) {
        errors.push(`letterRegister must be one of: ${validRegisters.join(', ')}.`);
      }
      if (!Array.isArray(prompt.bulletPrompts) || prompt.bulletPrompts.length === 0) {
        errors.push('bulletPrompts must be a non-empty array of strings.');
      }
    }
  } else if (prompt.taskNumber === 2) {
    const validEssayTypes = ['agree-disagree', 'discuss-both-views', 'advantages-disadvantages', 'problem-solution', 'two-part-questions'];
    if (!validEssayTypes.includes(prompt.essayType)) {
      errors.push(`essayType must be one of: ${validEssayTypes.join(', ')}.`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, value: null };
  }
  return { valid: true, errors: [], value: Object.freeze({ ...prompt }) };
}

export function roundToNearestHalfBand(score) {
  if (typeof score !== 'number' || isNaN(score)) return 0.0;
  const clamped = Math.max(0, Math.min(9, score));
  return Math.round(clamped * 2) / 2;
}

export const WRITING_RUBRIC_LABEL = 'Estimated Band Score & Practice Feedback — Practice Reference';

export function evaluateWritingRubricCriteria(input = {}) {
  const { taskKind = 'task1-academic', text = '', criteria = {} } = input;
  const wordCount = calculateWritingWordCount(text);
  const isTask1 = taskKind.startsWith('task1');
  const minWords = isTask1 ? 150 : 250;
  const underLength = wordCount < minWords;
  const warnings = [];
  if (underLength) {
    warnings.push(`Draft is under the recommended minimum of ${minWords} words (current: ${wordCount} words). Penalty applies to Task Achievement/Response.`);
  }

  const c1 = Number(criteria.ta ?? criteria.tr ?? 6.0);
  const c2 = Number(criteria.cc ?? 6.0);
  const c3 = Number(criteria.lr ?? 6.0);
  const c4 = Number(criteria.gra ?? 6.0);

  const rawAverage = (c1 + c2 + c3 + c4) / 4;
  const estimatedBand = roundToNearestHalfBand(rawAverage);

  return {
    taskKind,
    wordCount,
    underLength,
    warnings,
    criteria: {
      [isTask1 ? 'ta' : 'tr']: c1,
      cc: c2,
      lr: c3,
      gra: c4
    },
    rawAverage,
    estimatedBand,
    rubricLabel: WRITING_RUBRIC_LABEL,
    disclaimerPresent: true
  };
}

export function calculateOverallWritingBand(input = {}) {
  const { task1Band = 6.0, task2Band = 6.0 } = input;
  const compositeRaw = (1 / 3) * Number(task1Band) + (2 / 3) * Number(task2Band);
  const overallBand = roundToNearestHalfBand(compositeRaw);
  return {
    task1Band: Number(task1Band),
    task2Band: Number(task2Band),
    compositeRaw,
    overallBand,
    label: WRITING_RUBRIC_LABEL,
    disclaimerPresent: true
  };
}



