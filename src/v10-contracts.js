import { decideEvidence,evidenceDigest,normalizeAssistanceTrace,normalizeEvidenceRequirement } from './evidence-policy.js';
import { createActivitySpec,createAttempt,createReceipt,createRun } from './learning-contracts.js';

export const V10_SCHEMA_VERSION=1;
export const V10_DB_NAME='vocab-master-v10';
export const V10_DB_VERSION=5;

export const V10_STORES=Object.freeze({
  sourceOccurrences:'sourceOccurrences',
  captureCandidates:'captureCandidates',
  collections:'collections',
  collectionMemberships:'collectionMemberships',
  lexicalTombstones:'lexicalTombstones',
  workflowIntents:'workflowIntents',
  transcriptSources:'transcriptSources',
  transcriptRevisions:'transcriptRevisions',
  canonicalTranscriptSegments:'canonicalTranscriptSegments',
  globalErrorRecords:'globalErrorRecords',
  globalErrorOccurrences:'globalErrorOccurrences',
  repairQueue:'repairQueue',
  todayRuns:'todayRuns',
  activities:'activities',
  sentenceProgress:'sentenceProgress',
  transcriptCache:'transcriptCache',
  contentManifests:'contentManifests',
  contentAssets:'contentAssets',
  contentProgress:'contentProgress',
  aiJobs:'aiJobs',
  coachingStats:'coachingStats',
  meta:'meta'
});

export const CAPTURE_STATUSES=Object.freeze(['captured','needs-review','ready','finalizing','linked','rejected','quarantined']);
export const ACTIVITY_TYPES=Object.freeze(['card-review','new-card','dictation','shadowing','error-correction','reading','paraphrase','production','retell']);
export const SENTENCE_STEPS=Object.freeze(['queued','listening','dictation','correction','noticing','shadowing','vocabulary','retell','completed']);
export const CONTENT_QUALITY_STATUSES=Object.freeze(['draft','validated','verified','rejected','quarantined']);
export const TRANSCRIPT_PROVIDERS=Object.freeze(['indexeddb','shared-cache','local-companion','backend-provider','gemini-progressive','imported']);

const clean=(value,max=2000)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
export function normalizeKey(value=''){
  return clean(value,500).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘`]/g,"'").replace(/[–—]/g,'-').replace(/[^a-z0-9\s'-]/g,' ').replace(/\s+/g,' ').trim();
}
export function createV10Id(prefix='v10'){return globalThis.crypto?.randomUUID?.()||`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;}
export function lemmaKey(term=''){return normalizeKey(term);}
export function senseKey({term='',meaning='',partOfSpeech='',type='word'}={}){return [lemmaKey(term),normalizeKey(meaning),normalizeKey(partOfSpeech),normalizeKey(type)].join('::');}

export function normalizeSourceOccurrence(input={}){
  const now=Number(input.encounteredAt||Date.now());
  return{
    id:clean(input.id,180)||createV10Id('occurrence'),
    lexicalItemId:clean(input.lexicalItemId,180)||null,
    candidateId:clean(input.candidateId,180)||null,
    sourceType:clean(input.sourceType,60)||'manual',
    sourceId:clean(input.sourceId,240)||null,
    sourceSubId:clean(input.sourceSubId,240)||null,
    title:clean(input.title,300)||null,
    context:clean(input.context,6000)||null,
    url:clean(input.url,1200)||null,
    startMs:Number(input.startMs||0)||null,
    endMs:Number(input.endMs||0)||null,
    encounteredAt:now,
    verified:input.verified===true,
    metadata:input.metadata&&typeof input.metadata==='object'?structuredClone(input.metadata):{},
    updatedAt:Number(input.updatedAt||now)
  };
}

export function normalizeCaptureCandidate(input={}){
  const now=Number(input.createdAt||Date.now());
  const term=clean(input.term,240);
  return{
    id:clean(input.id,180)||createV10Id('candidate'),
    term,
    proposedMeaning:clean(input.proposedMeaning??input.meaning,500),
    proposedType:['word','collocation','phrase','pattern'].includes(input.proposedType)?input.proposedType:(term.includes(' ')?'collocation':'word'),
    proposedGoal:input.proposedGoal==='active'?'active':'passive',
    partOfSpeech:clean(input.partOfSpeech,80)||null,
    pronunciation:clean(input.pronunciation,200)||null,
    example:clean(input.example,1200)||null,
    translation:clean(input.translation,1200)||null,
    cefr:clean(input.cefr,10)||'—',
    sourceOccurrence:normalizeSourceOccurrence({...input.sourceOccurrence,sourceType:input.sourceOccurrence?.sourceType||input.sourceType,context:input.sourceOccurrence?.context||input.sourceContext}),
    status:CAPTURE_STATUSES.includes(input.status)?input.status:'captured',
    duplicateOfCardId:clean(input.duplicateOfCardId,180)||null,
    matchedCardIds:[...new Set((Array.isArray(input.matchedCardIds)?input.matchedCardIds:[]).map(value=>clean(value,180)).filter(Boolean))],
    aiDraft:input.aiDraft&&typeof input.aiDraft==='object'?structuredClone(input.aiDraft):null,
    provenance:input.provenance&&typeof input.provenance==='object'?structuredClone(input.provenance):{source:'manual',confirmedByUser:false},
    createdAt:now,
    updatedAt:Number(input.updatedAt||now)
  };
}

export function normalizeActivity(input={}){
  const type=ACTIVITY_TYPES.includes(input.type)?input.type:'unknown';
  const target=input.target&&typeof input.target==='object'?{
    cardId:clean(input.target.cardId,180)||null,
    senseId:clean(input.target.senseId,180)||null,
    skill:clean(input.target.skill,80)||null,
    sourceId:clean(input.target.sourceId,180)||null,
    sourceRevision:clean(input.target.sourceRevision,180)||null
  }:null;
  const execution=input.execution&&typeof input.execution==='object'?{
    kind:clean(input.execution.kind,80)||'blocked',
    status:['ready','blocked'].includes(input.execution.status)?input.execution.status:'blocked',
    reason:clean(input.execution.reason,180)||null
  }:{kind:'blocked',status:'blocked',reason:'missing-exact-executor'};
  const normalizedEvidence=normalizeEvidenceRequirement(type,input.evidencePolicy);
  const evidencePolicy=target&&execution.status==='ready'
    ?normalizedEvidence
    :{...normalizedEvidence,affectsSchedule:false,reason:execution.reason||'missing-planned-target'};
  return{
    id:clean(input.id,180)||createV10Id('activity'),
    type,
    sourceType:clean(input.sourceType,80)||null,
    sourceId:clean(input.sourceId,180)||null,
    cardIds:[...new Set((Array.isArray(input.cardIds)?input.cardIds:[]).map(value=>clean(value,180)).filter(Boolean))],
    estimatedSeconds:Math.max(10,Math.min(900,Number(input.estimatedSeconds||60))),
    priority:Number(input.priority||0),
    dueAt:Number(input.dueAt||0)||null,
    evidencePolicy,
    originalType:type==='unknown'?clean(input.type,80)||null:null,
    payload:input.payload&&typeof input.payload==='object'?structuredClone(input.payload):{},
    target,
    execution,
    planId:clean(input.planId,180)||null,
    planDate:clean(input.planDate,20)||null,
    plannedAt:Number(input.plannedAt||0)||null,
    timezone:clean(input.timezone,120)||'UTC',
    reasonCode:clean(input.reasonCode,120)||null,
    activitySpec:input.activitySpec&&typeof input.activitySpec==='object'?structuredClone(input.activitySpec):null,
    launchBinding:clean(input.launchBinding,180)||null,
    status:['queued','active','completed','skipped','failed'].includes(input.status)?input.status:'queued',
    createdAt:Number(input.createdAt||Date.now()),
    completedAt:Number(input.completedAt||0)||null
  };
}

export function buildV10CoachingEnvelope({activityId,receiptId,activityType,sentence={},sourceId,cardId=null,skill,result='correct',learnerOutput='',assistance={}}={}){
  const id=clean(activityId,180);const receipt=clean(receiptId,180);const source=clean(sourceId,180)||null;
  const sourceRevision=`v10-sentence-v1:${evidenceDigest(JSON.stringify({id:sentence.id||null,text:String(sentence.text||''),startMs:Number(sentence.startMs||0),endMs:Number(sentence.endMs||0),verified:sentence.verified===true}))}`;
  const target={cardId:clean(cardId,180)||null,skill:clean(skill,80)||null,sourceId:source,sourceRevision};
  const occurredAt=Date.now();
  const activitySpec=createActivitySpec({id,type:clean(activityType,80),target,plannedAt:occurredAt,timezone:'UTC',policyVersion:'phase0-evidence-v1',executor:'v10-sentence-loop'});
  const run=createRun({id:`run:${id}`,activitySpec,status:'active',startedAt:occurredAt,timezone:'UTC'});
  const attempt=createAttempt({id:`attempt:${receipt}`,run,activitySpec,receiptId:receipt,activityType:activitySpec.type,result:clean(result,40),target,learnerOutput:String(learnerOutput||'').trim().slice(0,10_000),assistance:normalizeAssistanceTrace({...assistance,id:`trace:${receipt}`,schemaVersion:1,collector:'v10-sentence-loop',complete:true,coaching:true}),occurredAt,timezone:'UTC'});
  const canonicalReceipt=createReceipt({id:receipt,run,activitySpec,attempt,status:result==='skipped'?'skipped':'completed',issuedAt:occurredAt,timezone:'UTC'});
  const verification={source:{id:`source:${sourceRevision}`,authority:'v10-source-registry',status:sentence.verified===true?'verified':'unverified',sourceId:source,sourceRevision}};
  const decision=decideEvidence({attempt,activity:activitySpec,verification});
  return Object.freeze({run,attempt,receipt:canonicalReceipt,activitySpec,verification,decision});
}

export function normalizeRetellStatus(input={}){
  return ['not-started','coaching-completed','skipped','unverified'].includes(input.retellStatus)?input.retellStatus:(input.step==='completed'||input.retellResponse?'unverified':'not-started');
}

export function normalizeSentenceProgress(input={}){
  const step=SENTENCE_STEPS.includes(input.step)?input.step:'queued';
  return{
    id:clean(input.id,180)||clean(input.sentenceId,180)||createV10Id('sentence-progress'),
    sentenceId:clean(input.sentenceId,180),
    sourceId:clean(input.sourceId,180)||null,
    step,
    repeatCount:Math.max(0,Math.min(20,Number(input.repeatCount||0))),
    playbackRate:Math.max(.5,Math.min(2,Number(input.playbackRate||1))),
    dictationResponse:String(input.dictationResponse||'').slice(0,5000),
    errorClassification:clean(input.errorClassification,80)||null,
    wordDiff:Array.isArray(input.wordDiff)?structuredClone(input.wordDiff).slice(0,500):[],
    retellResponse:String(input.retellResponse||'').slice(0,5000),
    retellStatus:normalizeRetellStatus(input),
    evidenceAttempts:Array.isArray(input.evidenceAttempts)?structuredClone(input.evidenceAttempts).slice(0,20):[],
    runToken:Number(input.runToken||0)||null,
    linkedCardIds:[...new Set((Array.isArray(input.linkedCardIds)?input.linkedCardIds:[]).map(value=>clean(value,180)).filter(Boolean))],
    savedCandidateIds:[...new Set((Array.isArray(input.savedCandidateIds)?input.savedCandidateIds:[]).map(value=>clean(value,180)).filter(Boolean))],
    weak:input.weak===true,
    completedAt:Number(input.completedAt||0)||null,
    updatedAt:Number(input.updatedAt||Date.now())
  };
}

export function normalizeContentManifest(input={}){
  return{
    schemaVersion:Number(input.schemaVersion||1),
    id:clean(input.id,180),
    title:clean(input.title,300),
    description:clean(input.description,1200),
    contentVersion:Math.max(1,Number(input.contentVersion||1)),
    level:clean(input.level,20)||'B1',
    listeningDifficulty:Math.max(1,Math.min(10,Number(input.listeningDifficulty||5))),
    accent:clean(input.accent,80)||'Mixed',
    topic:clean(input.topic,120)||'General',
    skills:[...new Set((Array.isArray(input.skills)?input.skills:[]).map(value=>clean(value,60)).filter(Boolean))],
    ieltsRelevance:clean(input.ieltsRelevance,120)||'general-English',
    durationSeconds:Math.max(0,Number(input.durationSeconds||0)),
    sentenceCount:Math.max(0,Number(input.sentenceCount||0)),
    verified:input.verified===true,
    qualityStatus:CONTENT_QUALITY_STATUSES.includes(input.qualityStatus)?input.qualityStatus:(input.verified?'verified':'draft'),
    license:clean(input.license,180)||'unspecified',
    provenance:input.provenance&&typeof input.provenance==='object'?structuredClone(input.provenance):{},
    assets:input.assets&&typeof input.assets==='object'?structuredClone(input.assets):{},
    estimatedBytes:Math.max(0,Number(input.estimatedBytes||0)),
    minimumAppVersion:clean(input.minimumAppVersion,40)||null,
    updatedAt:Number(input.updatedAt||Date.now())
  };
}

export function validateContentManifest(input={}){
  const value=normalizeContentManifest(input);const errors=[];
  if(!value.id)errors.push('Thiếu content id.');
  if(!value.title)errors.push('Thiếu title.');
  if(!value.skills.length)errors.push('Thiếu skills.');
  if(!value.license||value.license==='unspecified')errors.push('Thiếu license rõ ràng.');
  if(value.verified&&value.qualityStatus!=='verified')errors.push('Verified content phải có qualityStatus=verified.');
  return{valid:errors.length===0,errors,value};
}

export function validateSentenceSegments(segments=[]){
  const errors=[];let previousEnd=-1;
  const values=(Array.isArray(segments)?segments:[]).map((row,index)=>({
    id:clean(row?.id,180)||`segment-${index+1}`,
    order:index,
    startMs:Math.max(0,Number(row?.startMs??row?.startSeconds*1000??0)),
    endMs:Math.max(0,Number(row?.endMs??row?.endSeconds*1000??0)),
    text:clean(row?.text,3000),
    status:clean(row?.status,40)||'needs-review'
  }));
  for(const row of values){
    if(!row.text)errors.push(`${row.id}: transcript trống.`);
    if(row.endMs<=row.startMs)errors.push(`${row.id}: timestamp không hợp lệ.`);
    if(row.startMs<previousEnd-500)errors.push(`${row.id}: overlap quá mức.`);
    if(row.endMs-row.startMs>30_000)errors.push(`${row.id}: segment dài quá 30 giây.`);
    previousEnd=Math.max(previousEnd,row.endMs);
  }
  return{valid:errors.length===0,errors,segments:values};
}
