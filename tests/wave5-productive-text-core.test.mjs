import test from 'node:test';
import assert from 'node:assert/strict';
import { ProductivePractice } from '../src/productive-practice.js';
import { IDBFactory } from 'fake-indexeddb';
import { autosaveLearnerTextArtifact,getLatestControlledLearnerTextArtifact,getLearnerTextArtifact,getProductiveFeedbackByRun,getProductiveFeedbackProjection,saveProductiveAdvisoryFeedback } from '../src/ielts-persistence.js';
import { PRODUCTIVE_PROMPT_REF,PRODUCTIVE_WRITING_PROMPT,createAdvisoryFeedback } from '../src/productive-text-contracts.js';
import { createActivitySpec } from '../src/learning-contracts.js';
import { startTodayRun } from '../src/today-runner.js';

test('productive practice runtime is available', () => {
  assert.equal(typeof ProductivePractice, 'function');
});

test('durable autosave creates, is idempotent, changes immutably and projects stale feedback',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();
  try{
    const first=await autosaveLearnerTextArtifact({artifactId:null,expectedRevisionId:null,promptRef:PRODUCTIVE_PROMPT_REF,text:'A clear habit helps.',at:100});
    const same=await autosaveLearnerTextArtifact({artifactId:first.artifactId,expectedRevisionId:first.artifactRevisionId,promptRef:PRODUCTIVE_PROMPT_REF,text:'A clear habit helps.',at:101});
    assert.equal(same.createdRevision,false);assert.equal(same.artifactRevisionId,first.artifactRevisionId);
    const next=await autosaveLearnerTextArtifact({artifactId:first.artifactId,expectedRevisionId:first.artifactRevisionId,promptRef:PRODUCTIVE_PROMPT_REF,text:'A clear habit helps every day.',at:102});
    assert.equal(next.revisionNumber,2);
    await assert.rejects(()=>autosaveLearnerTextArtifact({artifactId:first.artifactId,expectedRevisionId:first.artifactRevisionId,promptRef:PRODUCTIVE_PROMPT_REF,text:'stale',at:103}),error=>error.code==='PRODUCTIVE_STALE_REVISION');
    const stored=await getLearnerTextArtifact(first.artifactId);assert.equal(stored.artifact.currentRevisionId,next.artifactRevisionId);assert.equal(stored.revisions.length,2);
  }finally{globalThis.indexedDB=original;}
});

test('self-review creates only a default-deny productive terminal bound to the durable revision',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();
  try{
    const saved=await autosaveLearnerTextArtifact({text:'One consistent habit is planning a short daily study block.',at:200});
    const runtime=new ProductivePractice({now:()=>201});const result=await runtime.submitSelfReview({artifactId:saved.artifactId,artifactRevisionId:saved.artifactRevisionId,responses:[{criterionId:'purpose',status:'satisfied'},{criterionId:'support',status:'satisfied'},{criterionId:'organization',status:'satisfied'},{criterionId:'clarity',status:'revisit'}],note:'Add a more concrete example.',now:201});
    assert.deepEqual(Object.keys(result).sort(),['affectsSchedule','artifactId','artifactRevisionId','feedbackId','freshness','kind','reviewKind','schemaVersion']);assert.equal(result.affectsSchedule,false);assert.equal(result.freshness,'current');
    const feedback=await getProductiveFeedbackProjection(result.feedbackId);assert.equal(feedback.feedback.note,'Add a more concrete example.');assert.equal(feedback.freshness,'current');
  }finally{globalThis.indexedDB=original;}
});

test('productive replay is cross-clock stable and changed feedback conflicts',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();
  try{
    const saved=await autosaveLearnerTextArtifact({text:'A short daily habit makes English practice repeatable.',at:300});const runtime=new ProductivePractice({now:()=>301});const input={artifactId:saved.artifactId,artifactRevisionId:saved.artifactRevisionId,responses:[{criterionId:'purpose',status:'satisfied'},{criterionId:'support',status:'satisfied'},{criterionId:'organization',status:'satisfied'},{criterionId:'clarity',status:'satisfied'}],note:'Keep the routine small.'};
    const first=await runtime.submitSelfReview({...input,now:301});const replay=await runtime.submitSelfReview({...input,now:999});assert.deepEqual(replay,first);
    await assert.rejects(()=>runtime.submitSelfReview({...input,note:'Changed note.',now:1000}),error=>error.code==='PRODUCTIVE_TERMINAL_CONFLICT');
  }finally{globalThis.indexedDB=original;}
});

test('productive owner rejects a forged prompt reference before update mutation',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();try{const saved=await autosaveLearnerTextArtifact({text:'Owner prompt fence.',at:400});const forged={...PRODUCTIVE_PROMPT_REF,locator:{...PRODUCTIVE_PROMPT_REF.locator,promptId:'forged'}};await assert.rejects(()=>autosaveLearnerTextArtifact({artifactId:saved.artifactId,expectedRevisionId:saved.artifactRevisionId,promptRef:forged,text:'forged update',at:401}),error=>error.code==='PRODUCTIVE_PROMPT_UNAVAILABLE');assert.equal((await getLearnerTextArtifact(saved.artifactId)).revisions.length,1);}finally{globalThis.indexedDB=original;}
});

test('dedicated feedback-by-Run read returns the durable first winner',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();try{
    const saved=await autosaveLearnerTextArtifact({text:'The crash seam must retain one feedback winner.',at:500});const runtime=new ProductivePractice({now:()=>501});const result=await runtime.submitSelfReview({artifactId:saved.artifactId,artifactRevisionId:saved.artifactRevisionId,responses:[{criterionId:'purpose',status:'satisfied'},{criterionId:'support',status:'satisfied'},{criterionId:'organization',status:'revisit'},{criterionId:'clarity',status:'satisfied'}],note:'Keep the first durable note.',now:501});const projection=await getProductiveFeedbackProjection(result.feedbackId),winner=await getProductiveFeedbackByRun({artifactId:saved.artifactId,runId:projection.feedback.runId});assert.equal(winner.id,result.feedbackId);assert.equal(winner.note,'Keep the first durable note.');
  }finally{globalThis.indexedDB=original;}
});

test('productive owner rejects accessor prompt references before any durable read',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();try{
    let invoked=false;const forged={};Object.defineProperty(forged,'schema',{enumerable:true,get(){invoked=true;throw new Error('must not invoke');}});await assert.rejects(()=>getLatestControlledLearnerTextArtifact(forged),error=>error.code==='PRODUCTIVE_PROMPT_UNAVAILABLE');assert.equal(invoked,false);
  }finally{globalThis.indexedDB=original;}
});

test('feedback-by-Run does not turn an unknown owner identity into a read',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();try{assert.equal(await getProductiveFeedbackByRun({artifactId:'missing-artifact',runId:'missing-run'}),null);}finally{globalThis.indexedDB=original;}
});

test('stale productive revision remains a typed failure after a durable edit',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();try{const first=await autosaveLearnerTextArtifact({text:'first revision',at:800}),second=await autosaveLearnerTextArtifact({artifactId:first.artifactId,expectedRevisionId:first.artifactRevisionId,promptRef:PRODUCTIVE_PROMPT_REF,text:'second revision',at:801});await assert.rejects(()=>new ProductivePractice({now:()=>802}).submitSelfReview({artifactId:first.artifactId,artifactRevisionId:first.artifactRevisionId,responses:[{criterionId:'purpose',status:'satisfied'},{criterionId:'support',status:'satisfied'},{criterionId:'organization',status:'satisfied'},{criterionId:'clarity',status:'satisfied'}],note:'stale',now:802}),error=>error.code==='PRODUCTIVE_STALE_REVISION');assert.notEqual(second.artifactRevisionId,first.artifactRevisionId);}finally{globalThis.indexedDB=original;}
});

test('a completed productive winner remains one feedback owner across an exact later replay',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();try{const saved=await autosaveLearnerTextArtifact({text:'stable seam winner',at:900}),input={artifactId:saved.artifactId,artifactRevisionId:saved.artifactRevisionId,responses:[{criterionId:'purpose',status:'satisfied'},{criterionId:'support',status:'satisfied'},{criterionId:'organization',status:'satisfied'},{criterionId:'clarity',status:'satisfied'}],note:'winner'};const runtime=new ProductivePractice({now:()=>901}),first=await runtime.submitSelfReview({...input,now:901}),replay=await runtime.submitSelfReview({...input,now:999});assert.deepEqual(replay,first);const projection=await getProductiveFeedbackProjection(first.feedbackId),winner=await getProductiveFeedbackByRun({artifactId:saved.artifactId,runId:projection.feedback.runId});assert.equal(winner.id,first.feedbackId);}finally{globalThis.indexedDB=original;}
});

test('preterminal feedback winner is resumed by the productive runtime exactly once',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();try{const saved=await autosaveLearnerTextArtifact({text:'actual preterminal seam',at:950}),revision=saved.revision,id=`productive-writing-self-review:${revision.id}`,target={schemaVersion:2,targetType:'productive-text-revision',targetId:revision.id,cardId:null,senseId:null,skill:'production',sourceId:PRODUCTIVE_WRITING_PROMPT.id,sourceRevision:PRODUCTIVE_WRITING_PROMPT.revision},spec=createActivitySpec({id,type:'productive-writing-self-review',target,planId:'productive-writing-self-review-v1',plannedAt:950,timezone:'UTC',policyVersion:'phase0-evidence-v1',executor:'productive-practice',idempotencyKey:`activity:${id}`,metadata:{promptId:PRODUCTIVE_WRITING_PROMPT.id,promptRevision:PRODUCTIVE_WRITING_PROMPT.revision,reviewKind:'learner-self-review'}}),activity={id,planId:'productive-writing-self-review-v1',target,activitySpec:spec,execution:{kind:'productive-practice'},launchBinding:'productive-writing-self-review-v1',launch:{promptRevision:PRODUCTIVE_WRITING_PROMPT.revision,configRevision:'productive-writing-self-review-v1',configDigest:PRODUCTIVE_WRITING_PROMPT.contentDigest},evaluationBinding:{applicable:false},evidencePolicy:{reference:'phase0-evidence-v1'},assistanceCollectionMode:'productive-self-review'},started=await startTodayRun(activity,{tabId:'productive-writing',now:951}),responses=[{criterionId:'purpose',status:'satisfied'},{criterionId:'support',status:'satisfied'},{criterionId:'organization',status:'satisfied'},{criterionId:'clarity',status:'satisfied'}],feedback=createAdvisoryFeedback({artifactId:saved.artifactId,artifactRevisionId:revision.id,runId:started.run.id,attemptId:`productive-attempt:${started.run.id}`,receiptId:`productive-receipt:${started.run.id}`,responses,note:'preseed',at:951});await saveProductiveAdvisoryFeedback(feedback);assert.equal(started.run.status,'active');const result=await new ProductivePractice({now:()=>999}).submitSelfReview({artifactId:saved.artifactId,artifactRevisionId:revision.id,responses,note:'preseed',now:999});assert.equal(result.feedbackId,feedback.id);assert.equal((await getProductiveFeedbackByRun({artifactId:saved.artifactId,runId:started.run.id})).id,feedback.id);}finally{globalThis.indexedDB=original;}
});

test('reordered controlled prompt reference remains an owner-equivalent autosave input',async()=>{
  const original=globalThis.indexedDB;globalThis.indexedDB=new IDBFactory();try{const first=await autosaveLearnerTextArtifact({text:'ordered ref',at:980}),reordered=Object.fromEntries(Object.entries(PRODUCTIVE_PROMPT_REF).reverse()),second=await autosaveLearnerTextArtifact({artifactId:first.artifactId,expectedRevisionId:first.artifactRevisionId,promptRef:reordered,text:'reordered ref',at:981});assert.equal(second.revisionNumber,2);}finally{globalThis.indexedDB=original;}
});
