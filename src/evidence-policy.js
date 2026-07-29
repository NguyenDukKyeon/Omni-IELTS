export const EVIDENCE_POLICY_VERSION='phase0-evidence-v1';

export const EVIDENCE_REASONS=Object.freeze({
  eligible:'qualified-independent-evidence',
  missingAttempt:'missing-attempt',
  missingAttemptId:'missing-attempt-id',
  missingActivityId:'missing-activity-id',
  missingReceiptId:'missing-receipt-id',
  unknownActivity:'unknown-activity',
  activityMismatch:'activity-id-mismatch',
  missingTarget:'missing-planned-target',
  targetMismatch:'planned-target-mismatch',
  skillMismatch:'planned-skill-mismatch',
  sourceMismatch:'planned-source-mismatch',
  revisionMismatch:'source-revision-mismatch',
  missingProvenance:'evidence-provenance-missing',
  invalidAssistanceTrace:'assistance-trace-is-not-authoritative',
  assisted:'assistance-exposed',
  coaching:'activity-is-coaching-only',
  unverifiedSource:'source-is-not-verified',
  unverifiedEvaluation:'evaluation-is-not-verified',
  missingLearnerOutput:'learner-output-missing',
  targetNotUsed:'target-not-demonstrated',
  sourceError:'source-transcript-error',
  spellingOnly:'spelling-is-not-listening-retrieval',
  invalidResult:'result-is-not-qualified'
});

const KNOWN_ACTIVITIES=new Set([
  'card-review','matching','typing','listening','dictation','error-correction','paraphrase','paraphrase-card-check','production','retell',
  'new-card','intro','shadowing','pronunciation','reading','reading-completion','explanation-view','transcript-edit','lexical-set-view'
]);
const COACHING_ACTIVITIES=new Set(['new-card','intro','shadowing','pronunciation','reading','reading-completion','explanation-view','transcript-edit','lexical-set-view']);
const ALLOWED_SKILLS=new Set(['recognition','recall','listening','collocation','production']);
const ACTIVITY_SKILLS=Object.freeze({
  matching:new Set(['recognition']),typing:new Set(['recall']),listening:new Set(['listening']),dictation:new Set(['listening']),
  paraphrase:new Set(['recognition','recall']),'paraphrase-card-check':new Set(['recognition','recall']),production:new Set(['production']),retell:new Set(['production'])
});
const RESULT_TO_RATING=Object.freeze({correct:'good',near:'hard',wrong:'again',again:'again',hard:'hard',good:'good',easy:'easy'});
const EXPOSED_ASSISTANCE_KEYS=Object.freeze(['revealed','hintUsed','transcriptViewed','correctionExposed','retryAfterExposure','coaching','answerExposed']);
const EXPOSED_EVENT_TYPES=new Set(['reveal','hint','transcript-view','correction-exposed','coaching','retry-after-exposure','answer-exposed']);
const ASSISTANCE_COLLECTORS=new Set(['core-session','ielts-lab','v10-sentence-loop']);
const SOURCE_AUTHORITIES=new Set(['core-card-registry','ielts-source-registry','v10-source-registry']);
const EVALUATION_AUTHORITIES=new Set(['deterministic-rubric','human-review','validated-provider']);

const clean=(value,max=240)=>String(value??'').trim().slice(0,max);
const cleanOrNull=(value,max)=>clean(value,max)||null;

export function normalizeAssistanceTrace(input={}){
  const trace={
    id:cleanOrNull(input?.id,180),schemaVersion:Number(input?.schemaVersion||0),collector:cleanOrNull(input?.collector,80),complete:input?.complete===true
  };
  for(const key of EXPOSED_ASSISTANCE_KEYS)trace[key]=input?.[key]===true;
  trace.events=Object.freeze(Array.isArray(input?.events)?input.events.map(event=>Object.freeze({
    type:clean(event?.type,80),
    at:Number(event?.at||0)||null
  })).filter(event=>event.type).slice(0,100):[]);
  trace.authoritative=Boolean(trace.id&&trace.schemaVersion===1&&trace.complete&&ASSISTANCE_COLLECTORS.has(trace.collector));
  trace.exposed=EXPOSED_ASSISTANCE_KEYS.some(key=>trace[key])||trace.events.some(event=>EXPOSED_EVENT_TYPES.has(event.type));
  return Object.freeze(trace);
}

export function evidenceDigest(value=''){
  const bytes=new TextEncoder().encode(String(value));let hash=14695981039346656037n;
  for(const byte of bytes){hash^=BigInt(byte);hash=BigInt.asUintN(64,hash*1099511628211n);}
  return `fnv1a64:${bytes.length}:${hash.toString(16).padStart(16,'0')}`;
}

export function normalizeEvidenceTarget(input={}){
  return Object.freeze({
    cardId:cleanOrNull(input?.cardId,180),
    skill:ALLOWED_SKILLS.has(input?.skill)?input.skill:null,
    sourceId:cleanOrNull(input?.sourceId,180),
    sourceRevision:cleanOrNull(input?.sourceRevision,180)
  });
}

export function normalizeEvidenceAttempt(input={}){
  return Object.freeze({
    id:cleanOrNull(input?.id,180),
    activityId:cleanOrNull(input?.activityId,180),
    receiptId:cleanOrNull(input?.receiptId,180),
    activityType:clean(input?.activityType,80),
    result:clean(input?.result,40),
    target:normalizeEvidenceTarget(input?.target),
    assistance:normalizeAssistanceTrace(input?.assistance),
    learnerOutput:clean(input?.learnerOutput,10_000),
    errorType:cleanOrNull(input?.errorType,80)
  });
}

export function normalizeVerificationReceipts(input={}){
  const source=input?.source||{};const evaluation=input?.evaluation||{};
  return Object.freeze({
    source:Object.freeze({
      id:cleanOrNull(source.id,180),authority:cleanOrNull(source.authority,80),status:clean(source.status,40),
      sourceId:cleanOrNull(source.sourceId,180),sourceRevision:cleanOrNull(source.sourceRevision,180)
    }),
    evaluation:Object.freeze({
      id:cleanOrNull(evaluation.id,180),authority:cleanOrNull(evaluation.authority,80),status:clean(evaluation.status,40),
      attemptId:cleanOrNull(evaluation.attemptId,180),activityId:cleanOrNull(evaluation.activityId,180),cardId:cleanOrNull(evaluation.cardId,180),
      skill:ALLOWED_SKILLS.has(evaluation.skill)?evaluation.skill:null,outputDigest:cleanOrNull(evaluation.outputDigest,180),targetUsed:evaluation.targetUsed===true
    })
  });
}

export function normalizeActivitySpec(input={}){
  const activityType=KNOWN_ACTIVITIES.has(input?.type)?input.type:'unknown';
  return Object.freeze({
    id:cleanOrNull(input?.id,180),
    type:activityType,
    target:normalizeEvidenceTarget(input?.target),
    policyVersion:EVIDENCE_POLICY_VERSION
  });
}

export function normalizeEvidenceRequirement(activityType,input={}){
  const type=KNOWN_ACTIVITIES.has(activityType)?activityType:'unknown';
  const coaching=COACHING_ACTIVITIES.has(type);
  const capable=!coaching&&type!=='unknown';
  const affectsSchedule=capable&&input?.affectsSchedule===true;
  return Object.freeze({
    policyVersion:EVIDENCE_POLICY_VERSION,
    affectsSchedule,
    canCreateEvidence:affectsSchedule,
    skill:ALLOWED_SKILLS.has(input?.skill)?input.skill:null,
    requiresIndependentRetrieval:affectsSchedule,
    requiresVerifiedSource:affectsSchedule,
    reason:affectsSchedule?null:clean(input?.reason,180)||(coaching?EVIDENCE_REASONS.coaching:'default-deny')
  });
}

function sameNullable(left,right){return(left||null)===(right||null);}

function receiptBinding(attempt,activity,verification=normalizeVerificationReceipts()){
  return evidenceDigest(JSON.stringify({
    attempt:{
      id:attempt?.id||null,activityId:attempt?.activityId||null,type:attempt?.activityType||null,result:attempt?.result||null,
      target:attempt?.target||normalizeEvidenceTarget(),assistance:attempt?.assistance||normalizeAssistanceTrace(),
      learnerOutputDigest:evidenceDigest(attempt?.learnerOutput||''),errorType:attempt?.errorType||null
    },
    activity:activity||normalizeActivitySpec(),verification
  }));
}

function denied(attempt,activity,reason,verification){
  const binding=receiptBinding(attempt,activity,verification);
  return Object.freeze({
    policyVersion:EVIDENCE_POLICY_VERSION,
    decisionId:`${EVIDENCE_POLICY_VERSION}:${attempt?.receiptId||'unbound'}:${binding}`,
    receiptBinding:binding,
    eligible:false,affectsSchedule:false,successful:false,reason,rating:null,skill:null,
    attemptId:attempt?.id||null,activityId:activity?.id||attempt?.activityId||null,receiptId:attempt?.receiptId||null,
    target:attempt?.target||normalizeEvidenceTarget()
  });
}

export function decideEvidence(input={}){
  if(!input?.attempt)return denied(null,normalizeActivitySpec(input?.activity),EVIDENCE_REASONS.missingAttempt,normalizeVerificationReceipts(input?.verification));
  const attempt=normalizeEvidenceAttempt(input.attempt);
  const activity=normalizeActivitySpec(input.activity);
  const verification=normalizeVerificationReceipts(input.verification);
  const deny=reason=>denied(attempt,activity,reason,verification);
  if(!attempt.id)return deny(EVIDENCE_REASONS.missingAttemptId);
  if(!attempt.activityId||!activity.id)return deny(EVIDENCE_REASONS.missingActivityId);
  if(!attempt.receiptId)return deny(EVIDENCE_REASONS.missingReceiptId);
  if(activity.type==='unknown'||attempt.activityType!==activity.type)return deny(EVIDENCE_REASONS.unknownActivity);
  if(attempt.activityId!==activity.id)return deny(EVIDENCE_REASONS.activityMismatch);
  if(!activity.target.cardId||!activity.target.skill||!activity.target.sourceId||!activity.target.sourceRevision||!attempt.target.cardId||!attempt.target.skill||!attempt.target.sourceId||!attempt.target.sourceRevision)return deny(EVIDENCE_REASONS.missingTarget);
  if(attempt.target.cardId!==activity.target.cardId)return deny(EVIDENCE_REASONS.targetMismatch);
  if(attempt.target.skill!==activity.target.skill)return deny(EVIDENCE_REASONS.skillMismatch);
  if(ACTIVITY_SKILLS[activity.type]&&!ACTIVITY_SKILLS[activity.type].has(activity.target.skill))return deny(EVIDENCE_REASONS.skillMismatch);
  if(!sameNullable(attempt.target.sourceId,activity.target.sourceId))return deny(EVIDENCE_REASONS.sourceMismatch);
  if(!sameNullable(attempt.target.sourceRevision,activity.target.sourceRevision))return deny(EVIDENCE_REASONS.revisionMismatch);
  if(COACHING_ACTIVITIES.has(activity.type))return deny(EVIDENCE_REASONS.coaching);
  if(!attempt.assistance.authoritative)return deny(EVIDENCE_REASONS.invalidAssistanceTrace);
  if(attempt.assistance.exposed)return deny(EVIDENCE_REASONS.assisted);
  if(!verification.source.id||!SOURCE_AUTHORITIES.has(verification.source.authority)||verification.source.status!=='verified')return deny(EVIDENCE_REASONS.unverifiedSource);
  if(verification.source.sourceId!==activity.target.sourceId)return deny(EVIDENCE_REASONS.sourceMismatch);
  if(verification.source.sourceRevision!==activity.target.sourceRevision)return deny(EVIDENCE_REASONS.revisionMismatch);
  const rating=RESULT_TO_RATING[attempt.result];
  if(!rating)return deny(EVIDENCE_REASONS.invalidResult);
  if(activity.type==='dictation'){
    if(attempt.errorType==='transcript-source')return deny(EVIDENCE_REASONS.sourceError);
    if(attempt.errorType==='spelling-only')return deny(EVIDENCE_REASONS.spellingOnly);
    if(activity.target.skill!=='listening')return deny(EVIDENCE_REASONS.skillMismatch);
  }
  if(['production','retell'].includes(activity.type)){
    if(!attempt.learnerOutput)return deny(EVIDENCE_REASONS.missingLearnerOutput);
    const evaluation=verification.evaluation;
    if(!evaluation.id||!EVALUATION_AUTHORITIES.has(evaluation.authority)||evaluation.status!=='verified'||evaluation.attemptId!==attempt.id||evaluation.activityId!==activity.id||evaluation.cardId!==activity.target.cardId||evaluation.skill!==activity.target.skill||evaluation.outputDigest!==evidenceDigest(attempt.learnerOutput))return deny(EVIDENCE_REASONS.unverifiedEvaluation);
    if(!evaluation.targetUsed)return deny(EVIDENCE_REASONS.targetNotUsed);
  }
  if(activity.type==='error-correction'&&!ALLOWED_SKILLS.has(activity.target.skill))return deny(EVIDENCE_REASONS.skillMismatch);
  const successful=rating!=='again';
  const binding=receiptBinding(attempt,activity,verification);
  return Object.freeze({
    policyVersion:EVIDENCE_POLICY_VERSION,
    decisionId:`${EVIDENCE_POLICY_VERSION}:${attempt.receiptId}:${binding}`,
    receiptBinding:binding,
    eligible:true,affectsSchedule:true,successful,reason:EVIDENCE_REASONS.eligible,rating,skill:attempt.target.skill,
    attemptId:attempt.id,activityId:activity.id,receiptId:attempt.receiptId,target:attempt.target
  });
}
