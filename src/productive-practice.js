import { createActivitySpec,createAssistanceTrace,completeAssistanceTrace,createAttempt,createReceipt,learningContractDigest } from './learning-contracts.js';
import { createSourceRevisionRegistry,validateSourceRevisionForExecution } from './source-revision-ref.js';
import { startTodayRun,recordTodayReceipt,registerTodayExecutor } from './today-runner.js';
import { PRODUCTIVE_PROMPT_REF,PRODUCTIVE_WRITING_PROMPT,PRODUCTIVE_ERROR_CODES,createAdvisoryFeedback,validateProductivePromptRef,validateProductiveResponses } from './productive-text-contracts.js';
import { getLearnerTextArtifact,getProductiveFeedbackByRun,getProductiveFeedbackProjection,saveProductiveAdvisoryFeedback } from './ielts-persistence.js';

const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const freeze=value=>Object.freeze(structuredClone(value));
const activityFor=(artifactRevision,{now})=>{
  const target={schemaVersion:2,targetType:'productive-text-revision',targetId:artifactRevision.id,cardId:null,senseId:null,skill:'production',sourceId:PRODUCTIVE_WRITING_PROMPT.id,sourceRevision:PRODUCTIVE_WRITING_PROMPT.revision};
  const id=`productive-writing-self-review:${artifactRevision.id}`;
  const activitySpec=createActivitySpec({id,type:'productive-writing-self-review',target,planId:'productive-writing-self-review-v1',plannedAt:Number(artifactRevision.createdAt),timezone:'UTC',policyVersion:'phase0-evidence-v1',executor:'productive-practice',idempotencyKey:`activity:${id}`,metadata:{promptId:PRODUCTIVE_WRITING_PROMPT.id,promptRevision:PRODUCTIVE_WRITING_PROMPT.revision,reviewKind:'learner-self-review'}});
  return freeze({id,planId:'productive-writing-self-review-v1',target,activitySpec,execution:{kind:'productive-practice'},launchBinding:'productive-writing-self-review-v1',launch:{promptRevision:PRODUCTIVE_WRITING_PROMPT.revision,configRevision:'productive-writing-self-review-v1',configDigest:PRODUCTIVE_WRITING_PROMPT.contentDigest},evaluationBinding:{applicable:false},evidencePolicy:{reference:'phase0-evidence-v1'},assistanceCollectionMode:'productive-self-review'});
};
export function createProductivePromptSourceAdapter(){
  return Object.freeze({kind:'productive-prompt',version:1,authority:'productive-practice',async resolve(reference){const checked=validateProductivePromptRef(Object.fromEntries(['schema','version','kind','authority','sourceId','revisionId','integrity','locator','provenance'].map(key=>[key,reference?.[key]])));if(!checked.valid)return{code:'NOT_FOUND'};const record={kind:reference.kind,authority:reference.authority,sourceId:reference.sourceId,revisionId:reference.revisionId,integrity:reference.integrity,provenance:PRODUCTIVE_WRITING_PROMPT.provenance,locator:reference.locator};return{code:'RESOLVED',record,provenance:PRODUCTIVE_WRITING_PROMPT.provenance};}});
}
export function createProductiveSourceRegistry(){return createSourceRevisionRegistry({adapters:[createProductivePromptSourceAdapter()]});}
export class ProductivePractice{
  constructor({registry=createProductiveSourceRegistry(),now=()=>Date.now(),tabId='productive-writing'}={}){this.registry=registry;this.clock=now;this.tabId=tabId;}
  async submitSelfReview({artifactId,artifactRevisionId,responses,note,now=this.clock()}={}){
    validateProductiveResponses(responses);
    const artifact=await getLearnerTextArtifact(artifactId);if(!artifact)fail(PRODUCTIVE_ERROR_CODES.ARTIFACT,'Learner artifact was not found.');
    const revision=artifact.revisions.find(row=>row.id===artifactRevisionId);if(!revision)fail(PRODUCTIVE_ERROR_CODES.REVISION,'Artifact revision was not found.');
    if(artifact.artifact.currentRevisionId!==artifactRevisionId)fail(PRODUCTIVE_ERROR_CODES.STALE,'Self-review must use the current durable revision.');
    const activity=activityFor(revision,{now});
    const resolved=await validateSourceRevisionForExecution({activitySpec:activity.activitySpec,sourceRevisionRef:PRODUCTIVE_PROMPT_REF,registry:this.registry});
    if(resolved.code!=='RESOLVED')fail(PRODUCTIVE_ERROR_CODES.PROMPT,'Controlled ProductivePrompt is unavailable.');
    const started=await startTodayRun(activity,{tabId:this.tabId,now:Number(now)});
    if(started.terminal){const feedbackId=started.run?.envelope?.attempt?.metadata?.feedbackId;const projection=feedbackId?await getProductiveFeedbackProjection(feedbackId):null;if(!projection)fail(PRODUCTIVE_ERROR_CODES.MISMATCH,'Terminal productive run does not authenticate its feedback.');const expected=createAdvisoryFeedback({artifactId,artifactRevisionId,runId:started.run.id,attemptId:started.run.envelope.attempt.id,receiptId:started.run.envelope.receipt.id,responses,note,at:projection.feedback.createdAt});if(JSON.stringify(expected.responses)!==JSON.stringify(projection.feedback.responses)||expected.note!==projection.feedback.note)fail('PRODUCTIVE_TERMINAL_CONFLICT','Productive terminal replay changed its self-review.');return this.result(projection);}
    const runId=started.run.id,attemptId=`productive-attempt:${runId}`,receiptId=`productive-receipt:${runId}`;
    // A feedback write can win just before a crash.  Its timestamp is part of
    // the immutable winner, so compare against it rather than the retry clock.
    const prior=await getProductiveFeedbackByRun({artifactId,runId});
    const feedback=createAdvisoryFeedback({artifactId,artifactRevisionId,runId,attemptId,receiptId,responses,note,at:Number(prior?.createdAt??now)});
    if(prior&&(JSON.stringify(prior.responses)!==JSON.stringify(feedback.responses)||prior.note!==feedback.note||prior.artifactRevisionId!==artifactRevisionId||prior.responseDigest!==feedback.responseDigest))fail('PRODUCTIVE_TERMINAL_CONFLICT','Productive terminal already has a different feedback winner.');
    const persisted=prior||await saveProductiveAdvisoryFeedback(feedback);
    const reference=JSON.stringify({artifactId,artifactRevisionId,textDigest:revision.textDigest,feedbackId:persisted.id,responseDigest:persisted.responseDigest});
    const trace=completeAssistanceTrace(createAssistanceTrace({id:`productive-trace:${runId}`,collector:'productive-self-review',coaching:true}));
    const attempt=createAttempt({id:attemptId,run:started.run.canonicalRun,activitySpec:activity.activitySpec,receiptId,result:'self-reviewed',target:activity.target,assistance:trace,learnerOutput:reference,occurredAt:Number(now),timezone:'UTC',metadata:{artifactId,artifactRevisionId,textDigest:revision.textDigest,feedbackId:persisted.id,responseDigest:persisted.responseDigest,promptId:PRODUCTIVE_WRITING_PROMPT.id,promptRevision:PRODUCTIVE_WRITING_PROMPT.revision,reviewKind:'learner-self-review'}});
    const receipt=createReceipt({id:receiptId,run:started.run.canonicalRun,activitySpec:activity.activitySpec,attempt,status:'completed',target:activity.target,issuedAt:Number(now),timezone:'UTC',metadata:{artifactId,artifactRevisionId,textDigest:revision.textDigest,feedbackId:persisted.id,responseDigest:persisted.responseDigest,promptId:PRODUCTIVE_WRITING_PROMPT.id,promptRevision:PRODUCTIVE_WRITING_PROMPT.revision,reviewKind:'learner-self-review'}});
    const envelope={activitySpec:activity.activitySpec,run:started.run.canonicalRun,attempt,receipt,verification:{source:{id:`productive-prompt:${PRODUCTIVE_WRITING_PROMPT.revision}`,authority:'productive-practice',status:'verified',sourceId:PRODUCTIVE_WRITING_PROMPT.id,sourceRevision:PRODUCTIVE_WRITING_PROMPT.revision}}};
    const settled=await recordTodayReceipt(runId,envelope,{status:'completed',now:Number(now)});
    const projection=await getProductiveFeedbackProjection(persisted.id);if(!projection||projection.freshness!=='current')fail(PRODUCTIVE_ERROR_CODES.MISMATCH,'Productive feedback was not durably authenticated.');
    return this.result(projection,settled);
  }
  result(projection){return freeze({kind:'productive-writing-self-review-result',schemaVersion:1,artifactId:projection.artifactId,artifactRevisionId:projection.artifactRevisionId,feedbackId:projection.feedbackId,reviewKind:'learner-self-review',freshness:projection.freshness,affectsSchedule:false});}
}
let unregister=null;
export function registerProductivePracticeExecutor(){if(unregister)return unregister;unregister=registerTodayExecutor('productive-practice',async()=>({started:true}));return unregister;}
