import { decideEvidence,evidenceDigest,normalizeAssistanceTrace } from './evidence-policy.js';
import { applyFsrsRating,getCardRetrievability,normalizeFsrsSkill } from './fsrs-scheduler.js';
import { persistReviewResult } from './persistence.js';

const ACTIVITY_BY_KIND=Object.freeze({
  flashcard:'card-review',choice:'matching','meaning-choice':'matching',typing:'typing','sentence-cloze':'typing',
  'listening-choice':'listening',dictation:'dictation',cloze:'card-review',production:'production',output:'production',
  intro:'intro',matching:'matching',pronunciation:'pronunciation',transfer:'production'
});

const clean=(value,max=240)=>String(value??'').trim().slice(0,max);

export function coreSourceRevision(card={}){
  const sourceContent={
    id:clean(card.id,180),senseId:clean(card.senseId,180)||null,front:clean(card.front,500),back:clean(card.back,2000),type:clean(card.type,80),
    example:clean(card.example,2000),translation:clean(card.translation,2000),sourceContext:clean(card.sourceContext,2000),
    accepted:Array.isArray(card.accepted)?card.accepted.map(value=>clean(value,500)):[],
    acceptedBySkill:card.acceptedBySkill&&typeof card.acceptedBySkill==='object'?card.acceptedBySkill:{},
    acceptedByExercise:card.acceptedByExercise&&typeof card.acceptedByExercise==='object'?card.acceptedByExercise:{}
  };
  return `core-card-v1:${sourceContent.id}:${evidenceDigest(JSON.stringify(sourceContent))}`;
}

export function coreActivityType(kind=''){
  return ACTIVITY_BY_KIND[kind]||'unknown';
}

export function buildCoreEvidenceEnvelope({card,rating,step={},session={},exposure={},evaluation=null,learnerOutput='',now=Date.now()}={}){
  if(!card?.id)throw new TypeError('Core evidence cần card đích.');
  const activityId=clean(step.id,180);const sessionId=clean(session.id,180);const activityType=coreActivityType(step.kind);
  if(!activityId||!sessionId)throw new TypeError('Core evidence cần activity và session định danh ổn định.');
  const skill=normalizeFsrsSkill(step.skill,card);const sourceId=`core-card:${card.id}`;const sourceRevision=coreSourceRevision(card);
  const receiptId=clean(step.receiptId,180)||`${sessionId}:${activityId}:${card.id}`;
  const attemptId=clean(step.attemptId,180)||`attempt:${receiptId}`;
  const assistance={
    id:`trace:${receiptId}`,schemaVersion:1,collector:'core-session',complete:true,
    revealed:exposure.revealed===true,hintUsed:exposure.hintUsed===true,transcriptViewed:exposure.transcriptViewed===true,
    correctionExposed:exposure.correctionExposed===true,retryAfterExposure:exposure.retryAfterExposure===true,
    coaching:step.assisted===true||exposure.coaching===true,answerExposed:exposure.answerExposed===true,
    events:Array.isArray(exposure.events)?exposure.events:[]
  };
  const target={cardId:String(card.id),senseId:clean(card.senseId,180)||null,skill,sourceId,sourceRevision};
  const planned=step.plannedTarget&&typeof step.plannedTarget==='object'?{
    cardId:clean(step.plannedTarget.cardId,180)||null,
    senseId:clean(step.plannedTarget.senseId,180)||null,
    skill:clean(step.plannedTarget.skill,80)||null,
    sourceId:clean(step.plannedTarget.sourceId,180)||null,
    sourceRevision:clean(step.plannedTarget.sourceRevision,180)||null
  }:target;
  const boundActivityType=clean(step.plannedActivityType,80)||activityType;
  const activitySpec={id:activityId,type:boundActivityType,target:planned};
  const attempt={id:attemptId,activityId,receiptId,activityType:boundActivityType,result:rating,target,assistance:normalizeAssistanceTrace(assistance),learnerOutput,errorType:clean(step.errorType,80)||null};
  const verification={source:{id:`source:${sourceRevision}`,authority:'core-card-registry',status:'verified',sourceId,sourceRevision}};
  if(evaluation){
    verification.evaluation={
      id:clean(evaluation.id,180)||`evaluation:${receiptId}`,authority:clean(evaluation.authority,80),status:clean(evaluation.status,40),
      attemptId,activityId,cardId:String(card.id),senseId:clean(card.senseId,180)||null,skill,
      outputDigest:evidenceDigest(learnerOutput),targetUsed:evaluation.targetUsed===true
    };
  }
  return{activitySpec,attempt,verification,now:Number(now)};
}

function addQualifiedMarker(card,decision,now){
  const current=card.qualifiedEvidenceBySkill?.[decision.skill]||{};
  const next={
    attempts:Number(current.attempts||0)+1,
    successes:Number(current.successes||0)+(decision.successful?1:0),
    failures:Number(current.failures||0)+(decision.successful?0:1),
    lastDecisionId:decision.decisionId,lastReceiptId:decision.receiptId,
    lastAttemptAt:now,lastSuccessfulAt:decision.successful?now:Number(current.lastSuccessfulAt||0)||null,
    policyVersion:decision.policyVersion
  };
  return{...card,qualifiedEvidenceBySkill:{...(card.qualifiedEvidenceBySkill||{}),[decision.skill]:next}};
}

export async function commitCoreEvidence({card,rating,step,session,fsrsConfig,metrics=null,exposure={},evaluation=null,learnerOutput='',now=Date.now(),persist=persistReviewResult}={}){
  const envelope=buildCoreEvidenceEnvelope({card,rating,step,session,exposure,evaluation,learnerOutput,now});
  const decision=decideEvidence({attempt:envelope.attempt,activity:envelope.activitySpec,verification:envelope.verification});
  if(!decision.eligible)return{inserted:false,decision,card,interval:null,event:null};
  const counts={again:0,hard:0,good:0,easy:0,...(card.ratingCounts||{})};counts[decision.rating]=Number(counts[decision.rating]||0)+1;
  const predictedRetrievability=getCardRetrievability(card,Number(now),fsrsConfig,decision.skill);
  let enrichedCard={...card,ratingCounts:counts,lastSkill:decision.skill};
  if(step.errorCategory){enrichedCard={...enrichedCard,lastError:step.errorCategory,errorCounts:{...(card.errorCounts||{}),[step.errorCategory]:Number(card.errorCounts?.[step.errorCategory]||0)+1}};}
  const markedCard=addQualifiedMarker(enrichedCard,decision,Number(now));
  const result=applyFsrsRating(markedCard,decision.rating,Number(now),fsrsConfig,decision.skill);
  const evidenceType=['production','retell'].includes(envelope.activitySpec.type)?'ai_verified_production':'independent_review';
  const event={
    id:`evidence:${decision.receiptId}`,cardId:String(card.id),skill:decision.skill,exerciseType:String(step.kind||''),
    sessionMode:String(session?.mode||''),sessionId:String(session?.id||''),rating:decision.rating,fsrsRating:Number(result.log?.rating||0)||null,
    resultLog:result.log,reviewedAt:Number(now),review:Number(now),createdAt:Number(now),assisted:false,evidenceType,
    attemptId:decision.attemptId,activityId:decision.activityId,receiptId:decision.receiptId,target:decision.target,
    assistanceTrace:envelope.attempt.assistance,evidenceDecision:decision,qualifiedFailure:!decision.successful,
    evidence:{attempt:envelope.attempt,activity:envelope.activitySpec,verification:envelope.verification},
    metadata:{evidenceReason:decision.reason,policyVersion:decision.policyVersion,receiptBinding:decision.receiptBinding,evidenceType,predictedRetrievability}
  };
  const persisted=await persist({card:result.card,event,metrics,reason:'core-evidence-committed'});
  return persisted.inserted===false
    ?{inserted:false,decision,event:persisted.event,card,interval:null}
    :{inserted:true,decision,event,card:result.card,interval:result.interval};
}
