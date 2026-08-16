import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { composeTodayPlan } from '../src/today-composer.js';
import { createCoreCardSourceAdapter,createSourceRevisionRegistry,validateSourceRevisionForExecution,createTranscriptSourceAdapter } from '../src/source-revision-ref.js';
import { createTranscriptAggregate } from '../src/transcript-aggregate.js';
import { buildCombinedBackup,restoreCombinedBackup } from '../src/ielts-backup.js';
import { getV10Record,listV10Records,reopenV10Database } from '../src/v10-persistence.js';
import { V10_STORES } from '../src/v10-contracts.js';
globalThis.indexedDB=new IDBFactory();
const qar=await import('../src/question-activity-contracts.js');

const card=Object.freeze({id:'qar-card',senseId:'qar-sense',front:'durable',back:'bền vững',type:'word',sourceVerified:true,rightsStatus:'allowed',privacy:'private',sourceProvenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'}});
const otherCard=Object.freeze({id:'qar-other-card',senseId:'qar-other-sense',front:'resilient',back:'kiên cường',type:'word',sourceVerified:true,rightsStatus:'allowed',privacy:'private',sourceProvenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'}});
function labItem(){return{id:'lab-qar',kind:'paraphrase',prompt:'Choose the best paraphrase.',context:'A durable system remains useful.',options:[{id:'a',text:'It lasts.',correct:true,rationale:'Correct.'},{id:'b',text:'It breaks.',correct:false,rationale:'Incorrect.'}],sourceCardIds:[card.id],status:'verified',provenance:{status:'verified',verifiedBy:'reviewer-1'},createdAt:1,updatedAt:2};}
function ownerAdapter(item=labItem()){return qar.createIeltsLabOwnerAdapter({readVerifiedItem:id=>id===item.id?item:null});}

test('QAR-00 fails closed for unknown question kind and version',()=>{
  const result=qar.validateQuestionActivity({schema:'question-activity',version:99,kind:'unknown'});
  assert.equal(result.valid,false);
  assert.ok(result.errors.length);
});

test('QAR-00 rejects accessor-bearing and coercion-shaped question data without reading accessors',()=>{
  let read=false;
  const hostile={schema:'question-activity',version:1,kind:'ielts-lab-choice',item:{},sourceRevisionRef:{},promptRevision:'p',scorer:{id:'ielts-lab-choice-v1',version:1},requiredCapabilities:['keyboard','focus','screen-reader'],approval:'verified'};
  Object.defineProperty(hostile,'id',{enumerable:true,get(){read=true;throw new Error('getter must not run');}});
  const result=qar.validateQuestionActivity(hostile);
  assert.equal(result.valid,false);
  assert.equal(read,false);
  const hostileItem={...labItem()};let itemRead=false;
  Object.defineProperty(hostileItem,'id',{enumerable:true,get(){itemRead=true;throw new Error('item getter must not run');}});
  assert.throws(()=>qar.adaptIeltsLabItem(hostileItem,{kind:'core-card'}),error=>error.code==='QUESTION_ACTIVITY_ITEM_INVALID');
  assert.equal(itemRead,false);
  const numericId={schema:'question-activity',version:1,kind:'ielts-lab-choice',id:1,item:{},sourceRevisionRef:{},promptRevision:'p',scorer:{id:'ielts-lab-choice-v1',version:1},requiredCapabilities:['keyboard','focus','screen-reader'],approval:'verified'};
  assert.equal(qar.validateQuestionActivity(numericId).valid,false);
});

test('QAR-00 adapts only the existing validated IELTS Lab item and normalizes/scorers deterministically',()=>{
  const adapter=createCoreCardSourceAdapter({getCard:()=>card});const reference=adapter.createRef(card);
  const question=qar.adaptIeltsLabItem(labItem(),reference,{ownerAdapter:ownerAdapter()});
  assert.equal(qar.validateQuestionActivity(question).valid,true);
  assert.deepEqual(qar.normalizeQuestionResponse(question,{optionId:'a'}).value,{optionId:'a'});
  assert.equal(qar.scoreQuestionActivity(question,{optionId:'a'}).disposition,'correct');
  assert.equal(qar.scoreQuestionActivity(question,{optionId:'missing'}).valid,false);
  const ambiguous=labItem();ambiguous.options[1].text=' It lasts. ';
  assert.throws(()=>qar.adaptIeltsLabItem(ambiguous,reference),error=>error.code==='QUESTION_ACTIVITY_ITEM_INVALID');
  const malformed=labItem();malformed.options[0].answer='unexpected';
  assert.throws(()=>qar.adaptIeltsLabItem(malformed,reference),error=>error.code==='QUESTION_ACTIVITY_ITEM_INVALID');
  const registry=qar.createQuestionRegistry();
  assert.throws(()=>registry.registerExecutor(question.kind,question.version,['keyboard']),error=>error.code==='QUESTION_ACTIVITY_CAPABILITY_MISMATCH');
  const unregister=registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);assert.equal(registry.hasExecutor(question),true);unregister();
});

test('QAR-00 binds SourceRevisionRef and reuses canonical Today Run/Attempt/Receipt without scoring authority',async()=>{
  const adapter=createCoreCardSourceAdapter({getCard:()=>card});const reference=adapter.createRef(card);const sourceRegistry=createSourceRevisionRegistry({adapters:[adapter]});
  const question=qar.adaptIeltsLabItem(labItem(),reference,{ownerAdapter:ownerAdapter()});
  const questionScore=qar.scoreQuestionActivity(question,{optionId:'a'});
  const plan=composeTodayPlan({dueReviews:[{id:'qar-today',type:'paraphrase',target:{cardId:card.id,senseId:card.senseId,skill:'recall',sourceId:reference.sourceId,sourceRevision:reference.revisionId},executor:'qar-ielts-lab-choice',estimatedSeconds:60}],now:20_000,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-ielts-lab-choice',status:'ready'},assistanceCollectionMode:'ielts-lab',launchBinding:'qar-binding',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:questionScore.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:qar.QUESTION_SCORER_VERSION,reviewPolicyRevision:question.reviewPolicyRevision}};
  await assert.rejects(qar.executeQuestionActivity({activity,question,response:{optionId:'a'},sourceRegistry,now:20_100}),error=>error.code==='QUESTION_ACTIVITY_REGISTRY_REQUIRED');
  const registry=qar.createQuestionRegistry();
  await assert.rejects(qar.executeQuestionActivity({activity,question,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,now:20_100}),error=>error.code==='QUESTION_ACTIVITY_EXECUTOR_UNREGISTERED');
  assert.equal((await listV10Records(V10_STORES.todayRuns,{sortBy:null})).some(row=>row.id==='today-run:qar-today'),false);
  const changedItem={...labItem(),prompt:'A substituted but valid prompt.'};const changed=qar.adaptIeltsLabItem(changedItem,reference,{promptRevision:'ielts-lab:substituted',ownerAdapter:ownerAdapter(changedItem)});
  await assert.rejects(qar.executeQuestionActivity({activity,question:changed,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,now:20_100}),error=>error.code==='QUESTION_ACTIVITY_FROZEN_BINDING_MISMATCH');
  assert.equal((await listV10Records(V10_STORES.todayRuns,{sortBy:null})).some(row=>row.id==='today-run:qar-today'),false);
  registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  const result=await qar.executeQuestionActivity({activity,question,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,now:20_100});
  assert.equal(result.run.id,'today-run:qar-today');
  assert.equal(result.score.disposition,'correct');
  assert.equal(result.score.affectsSchedule,false);
  assert.equal(result.decision.eligible,false);
  assert.equal(result.run.frozenBinding.launch.promptRevision.value,question.promptRevision);
  assert.equal(result.run.frozenBinding.evaluation.keyDigest.value,questionScore.keyDigest);
  assert.equal(result.run.frozenBinding.evaluation.scoringPolicyRevision.value,qar.QUESTION_SCORER_VERSION);
  const backup=await buildCombinedBackup();
  assert.ok(backup.domains.v10.stores.todayRuns.some(row=>row.id===result.run.id));
  const restored=await restoreCombinedBackup(backup);
  assert.equal(restored.durable,true);
  await assert.rejects(qar.executeQuestionActivity({activity,question:{...question,sourceRevisionRef:{...reference,revisionId:'wrong'}},response:{optionId:'a'},sourceRegistry,questionRegistry:registry,now:20_200}),error=>error.code==='QUESTION_ACTIVITY_FORGED');
});

test('QAR-00 rejects a Core source that resolves for the activity but is not owned by the adapted Lab item',async()=>{
  const adapter=createCoreCardSourceAdapter({getCard:id=>id===otherCard.id?otherCard:card});
  const reference=adapter.createRef(card);const otherReference=adapter.createRef(otherCard);const sourceRegistry=createSourceRevisionRegistry({adapters:[adapter]});
  const question=qar.adaptIeltsLabItem(labItem(),reference,{ownerAdapter:ownerAdapter()});
  const plan=composeTodayPlan({dueReviews:[{id:'qar-item-source-mismatch',type:'paraphrase',target:{cardId:otherCard.id,senseId:otherCard.senseId,skill:'recall',sourceId:otherReference.sourceId,sourceRevision:otherReference.revisionId},executor:'qar-ielts-lab-choice',estimatedSeconds:60}],now:30_000,minutes:5});
  const score=qar.scoreQuestionActivity(question,{optionId:'a'});const activity={...plan.activities[0],execution:{kind:'qar-ielts-lab-choice',status:'ready'},launchBinding:'qar-source-mismatch',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:qar.QUESTION_SCORER_VERSION,reviewPolicyRevision:question.reviewPolicyRevision}};
  assert.equal((await validateSourceRevisionForExecution({activitySpec:activity.activitySpec,sourceRevisionRef:otherReference,registry:sourceRegistry})).code,'RESOLVED');
  const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  assert.throws(()=>qar.adaptIeltsLabItem(labItem(),otherReference,{ownerAdapter:ownerAdapter()}),error=>error.code==='QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH');
  assert.equal((await listV10Records(V10_STORES.todayRuns,{sortBy:null})).some(row=>row.id==='today-run:qar-item-source-mismatch'),false);
});

test('QAR-00 rejects caller-asserted verification, duplicate option IDs, and includes a registry revision',()=>{
  const adapter=createCoreCardSourceAdapter({getCard:()=>card});const reference=adapter.createRef(card);
  assert.throws(()=>qar.adaptIeltsLabItem({...labItem(),provenance:{status:'verified',verifiedBy:'caller'}},reference),error=>error.code==='QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED');
  const duplicate=labItem();duplicate.options[1].id='a';
  assert.throws(()=>qar.adaptIeltsLabItem(duplicate,reference),error=>error.code==='QUESTION_ACTIVITY_ITEM_INVALID');
  const question=qar.adaptIeltsLabItem(labItem(),reference,{ownerAdapter:ownerAdapter()});
  assert.equal(typeof question.registryRevision,'string');
  assert.equal('correct' in question.item.options[0],false);
  assert.equal('rationale' in question.item.options[0],false);
});

test('QAR-00 freezes full canonical prompt content and never persists answer truth in canonical result',async()=>{
  const adapter=createCoreCardSourceAdapter({getCard:()=>card});const reference=adapter.createRef(card);const sourceRegistry=createSourceRevisionRegistry({adapters:[adapter]});
  const question=qar.adaptIeltsLabItem(labItem(),reference,{ownerAdapter:ownerAdapter()});const score=qar.scoreQuestionActivity(question,{optionId:'a'});
  const plan=composeTodayPlan({dueReviews:[{id:'qar-frozen-content',type:'paraphrase',target:{cardId:card.id,senseId:card.senseId,skill:'recall',sourceId:reference.sourceId,sourceRevision:reference.revisionId},executor:'qar-ielts-lab-choice',estimatedSeconds:60}],now:40_000,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-ielts-lab-choice',status:'ready'},assistanceCollectionMode:'ielts-lab',launchBinding:'qar-frozen-content',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:qar.QUESTION_SCORER_VERSION,reviewPolicyRevision:question.reviewPolicyRevision}};
  const changed={...question,item:{...question.item,prompt:'Changed without changing revision'}};
  const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  await assert.rejects(qar.executeQuestionActivity({activity,question:changed,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,now:40_100}),error=>error.code==='QUESTION_ACTIVITY_FORGED');
  const result=await qar.executeQuestionActivity({activity,question,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,now:40_100});
  assert.equal(JSON.stringify(result.run).includes('"correct":'),false);
  assert.equal(JSON.stringify(result.run).includes('"rationale"'),false);
});

test('QAR-00 awaits one owner read, seals all nested bindings, and rejects unsupported Lab kinds/rationales',async()=>{
  const adapter=createCoreCardSourceAdapter({getCard:()=>card});const reference=adapter.createRef(card);let reads=0;const item=labItem();
  const owner=qar.createIeltsLabOwnerAdapter({async readVerifiedItem(id){reads+=1;return id===item.id?item:null;}});
  const question=await qar.adaptIeltsLabItemAsync(item,reference,{ownerAdapter:owner});
  assert.equal(reads,1);assert.equal(Object.isFrozen(question.sourceRevisionRef),true);assert.equal(Object.isFrozen(question.sourceRevisionRef.locator),true);
  assert.throws(()=>{question.sourceRevisionRef.locator.cardId='substituted';},TypeError);
  const speaking={...item,kind:'speaking'};assert.throws(()=>qar.adaptIeltsLabItem(speaking,reference,{ownerAdapter:ownerAdapter(speaking)}),error=>error.code==='QUESTION_ACTIVITY_ITEM_INVALID');
  const noRationale=labItem();noRationale.options[0].rationale='';assert.throws(()=>qar.adaptIeltsLabItem(noRationale,reference,{ownerAdapter:ownerAdapter(noRationale)}),error=>error.code==='QUESTION_ACTIVITY_ITEM_INVALID');
  assert.equal(Object.prototype.hasOwnProperty.call(qar.__testing,'AUTHENTIC_QUESTIONS'),false);
});

test('QAR-00 binds registry, key, rubric and review policy through actual LI frozen fields',async()=>{
  const adapter=createCoreCardSourceAdapter({getCard:()=>card});const reference=adapter.createRef(card);const sourceRegistry=createSourceRevisionRegistry({adapters:[adapter]});const question=qar.adaptIeltsLabItem(labItem(),reference,{ownerAdapter:ownerAdapter()});const score=qar.scoreQuestionActivity(question,{optionId:'a'});
  const plan=composeTodayPlan({dueReviews:[{id:'qar-r2-frozen',type:'paraphrase',target:{cardId:card.id,senseId:card.senseId,skill:'recall',sourceId:reference.sourceId,sourceRevision:reference.revisionId},executor:'qar-ielts-lab-choice',estimatedSeconds:60}],now:50_000,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-ielts-lab-choice',status:'ready'},assistanceCollectionMode:'ielts-lab',launchBinding:'qar-r2-frozen',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:qar.QUESTION_SCORER_VERSION,reviewPolicyRevision:question.reviewPolicyRevision}};
  const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);const result=await qar.executeQuestionActivity({activity,question,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,now:50_100});
  for(const field of ['revision','keyRevision','keyDigest','rubricRevision','rubricDigest','scoringPolicyRevision','reviewPolicyRevision'])assert.equal(result.run.frozenBinding.evaluation[field].state,'bound');
  assert.equal(result.run.frozenBinding.launch.configRevision.state,'bound');
});

test('QAR-00 preserves safe lexical lookalikes while rejecting secret/private-path data keys',()=>{
  assert.equal(qar.__testing.dataOnly({secretion:'safe',pathology:'safe'}),true);
  assert.equal(qar.__testing.dataOnly({api_secret:'no'}),false);
  assert.equal(qar.__testing.dataOnly({privatePath:'no'}),false);
});

test('QAR-00 fences assistance mode and invalid trace before Run, and rejects normalized privacy keys',async()=>{
  const adapter=createCoreCardSourceAdapter({getCard:()=>card});const reference=adapter.createRef(card);const sourceRegistry=createSourceRevisionRegistry({adapters:[adapter]});const question=qar.adaptIeltsLabItem(labItem(),reference,{ownerAdapter:ownerAdapter()});const score=qar.scoreQuestionActivity(question,{optionId:'a'});const plan=composeTodayPlan({dueReviews:[{id:'qar-r3-trace',type:'paraphrase',target:{cardId:card.id,senseId:card.senseId,skill:'recall',sourceId:reference.sourceId,sourceRevision:reference.revisionId},executor:'qar-ielts-lab-choice',estimatedSeconds:60}],now:60_000,minutes:5});const activity={...plan.activities[0],execution:{kind:'qar-ielts-lab-choice',status:'ready'},launchBinding:'qar-r3',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:qar.QUESTION_SCORER_VERSION,reviewPolicyRevision:question.reviewPolicyRevision}};const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);await assert.rejects(qar.executeQuestionActivity({activity,question,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,now:60_100}),error=>error.code==='QUESTION_ACTIVITY_ASSISTANCE_MODE_INVALID');assert.equal((await listV10Records(V10_STORES.todayRuns,{sortBy:null})).some(row=>row.id==='today-run:qar-r3-trace'),false);const validActivity={...activity,assistanceCollectionMode:'ielts-lab'};await assert.rejects(qar.executeQuestionActivity({activity:validActivity,question,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,assistance:{id:'bad',schemaVersion:1,collector:'ielts-lab',complete:true,events:[{type:'hint',sequence:2,at:2},{type:'reveal',sequence:1,at:1}]},now:60_100}),error=>error.code==='QUESTION_ACTIVITY_ASSISTANCE_INVALID');assert.equal(qar.__testing.dataOnly({clientSecret:'x'}),false);assert.equal(qar.__testing.dataOnly({authorizationHeader:'x'}),false);assert.equal(qar.__testing.dataOnly({tokenizer:'safe',secretaryNote:'safe',pathology:'safe'}),true);
});

test('QAR-00 rejects flag-consistent out-of-order raw trace before Run and deeply freezes future data',async()=>{
  const adapter=createCoreCardSourceAdapter({getCard:()=>card});const reference=adapter.createRef(card);const sourceRegistry=createSourceRevisionRegistry({adapters:[adapter]});const question=qar.adaptIeltsLabItem(labItem(),reference,{ownerAdapter:ownerAdapter()});const score=qar.scoreQuestionActivity(question,{optionId:'a'});const plan=composeTodayPlan({dueReviews:[{id:'qar-r4-trace',type:'paraphrase',target:{cardId:card.id,senseId:card.senseId,skill:'recall',sourceId:reference.sourceId,sourceRevision:reference.revisionId},executor:'qar-ielts-lab-choice',estimatedSeconds:60}],now:70_000,minutes:5});const activity={...plan.activities[0],execution:{kind:'qar-ielts-lab-choice',status:'ready'},assistanceCollectionMode:'ielts-lab',launchBinding:'qar-r4',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:qar.QUESTION_SCORER_VERSION,reviewPolicyRevision:question.reviewPolicyRevision}};const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);const trace={kind:'assistance-trace',schemaVersion:1,id:'r4',collector:'ielts-lab',complete:true,revealed:true,hintUsed:true,transcriptViewed:false,correctionExposed:false,retryAfterExposure:false,coaching:false,answerExposed:false,events:[{type:'reveal',sequence:2,at:20},{type:'hint',sequence:1,at:10}]};await assert.rejects(qar.executeQuestionActivity({activity,question,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,assistance:trace,now:70_100}),error=>error.code==='QUESTION_ACTIVITY_ASSISTANCE_INVALID');assert.equal((await listV10Records(V10_STORES.todayRuns,{sortBy:null})).some(row=>row.id==='today-run:qar-r4-trace'),false);for(const key of ['keyRevision','rubricRevision','reviewPolicyRevision'])assert.equal(qar.validateQuestionActivity({...question,[key]:null}).valid,false);const future=qar.validateQuestionActivity({schema:'question-activity',version:2,extensions:{nested:{value:'x'}}});assert.equal(future.valid,false);assert.throws(()=>{future.value.extensions.nested.value='y';},TypeError);
});

test('QAR-00 rejects an otherwise canonical flag-consistent trace whose ordering regresses before Run',async()=>{
  const adapter=createCoreCardSourceAdapter({getCard:()=>card});
  const reference=adapter.createRef(card);
  const sourceRegistry=createSourceRevisionRegistry({adapters:[adapter]});
  const question=qar.adaptIeltsLabItem(labItem(),reference,{ownerAdapter:ownerAdapter()});
  const score=qar.scoreQuestionActivity(question,{optionId:'a'});
  const plan=composeTodayPlan({dueReviews:[{id:'qar-r4-canonical-trace',type:'paraphrase',target:{cardId:card.id,senseId:card.senseId,skill:'recall',sourceId:reference.sourceId,sourceRevision:reference.revisionId},executor:'qar-ielts-lab-choice',estimatedSeconds:60}],now:80_000,minutes:5});
  const activity={...plan.activities[0],execution:{kind:'qar-ielts-lab-choice',status:'ready'},assistanceCollectionMode:'ielts-lab',launchBinding:'qar-r4-canonical-trace',launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:qar.QUESTION_SCORER_VERSION,reviewPolicyRevision:question.reviewPolicyRevision}};
  const registry=qar.createQuestionRegistry();
  registry.registerExecutor(question.kind,question.version,['keyboard','focus','screen-reader']);
  const trace={kind:'AssistanceTrace',schemaVersion:1,id:'r4-canonical-trace',collector:'ielts-lab',complete:true,revealed:true,hintUsed:true,transcriptViewed:false,correctionExposed:false,retryAfterExposure:false,coaching:false,answerExposed:false,events:[{sequence:2,type:'reveal',at:20,metadata:{}},{sequence:1,type:'hint',at:10,metadata:{}}]};
  await assert.rejects(qar.executeQuestionActivity({activity,question,response:{optionId:'a'},sourceRegistry,questionRegistry:registry,assistance:trace,now:80_100}),error=>error.code==='QUESTION_ACTIVITY_ASSISTANCE_INVALID');
  assert.equal((await listV10Records(V10_STORES.todayRuns,{sortBy:null})).some(row=>row.id==='today-run:qar-r4-canonical-trace'),false);
});

function listeningFixture(){
  const provenance={origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'};const aggregate=createTranscriptAggregate({source:{id:'listening-source',status:'verified',complete:true,url:'https://private.invalid/audio?token=PRIVATE_TOKEN_SENTINEL'},segments:[{startMs:0,endMs:1000,text:'TRANSCRIPT_BODY_SENTINEL noon.',status:'verified',aligned:true},{startMs:1000,endMs:2000,text:'Bring your ticket.',status:'verified',aligned:true}],provenance,createdAt:1});
  const item={id:'listening-item',kind:'listening-multiple-choice',prompt:'When does the train leave?',options:[{id:'a',text:'At noon',correct:true,rationale:'SELECTED_RATIONALE_SENTINEL'},{id:'b',text:'At night',correct:false,rationale:'UNSELECTED_RATIONALE_SENTINEL'}],target:{cardId:'listening-card',senseId:null,skill:'listening'},sourceAnchor:{sourceId:aggregate.source.id,revisionId:aggregate.revision.id,integrity:aggregate.revision.contentDigest,segmentIds:[aggregate.segments[0].id,aggregate.segments[1].id],startMs:0,endMs:2000},status:'verified',provenance:{status:'verified',verifiedBy:'reviewer',rights:'allowed'},createdAt:1,updatedAt:2};
  const sourceAdapter=createTranscriptSourceAdapter({getTranscriptAggregate:async id=>id===aggregate.revision.id?aggregate:null});return{aggregate,item,sourceAdapter,reference:sourceAdapter.createRef(aggregate)};
}

function listeningActivity(question,id,{target=null,collector=qar.LISTENING_ASSISTANCE_COLLECTION_MODE,evaluation=null}={}){
  const score=qar.scoreQuestionActivity(question,{optionId:'a'});
  const exactTarget=target||{...question.item.target,sourceId:question.sourceRevisionRef.sourceId,sourceRevision:question.sourceRevisionRef.revisionId};
  const plan=composeTodayPlan({dueReviews:[{id,type:'listening-multiple-choice',target:exactTarget,executor:'qar-listening-multiple-choice',estimatedSeconds:60}],now:90_000,minutes:5});
  return{...plan.activities[0],execution:{kind:'qar-listening-multiple-choice',status:'ready'},assistanceCollectionMode:collector,launchBinding:`listening:${id}`,launch:{promptRevision:question.promptRevision,configRevision:question.registryRevision,configDigest:question.promptDigest},evaluationBinding:evaluation||{applicable:true,revision:question.registryRevision,keyRevision:question.keyRevision,keyDigest:score.keyDigest,rubricRevision:question.rubricRevision,rubricDigest:question.rubricDigest,scoringPolicyRevision:qar.LISTENING_MULTIPLE_CHOICE_SCORER_VERSION,reviewPolicyRevision:question.reviewPolicyRevision}};
}

function listeningRegistry(question){const registry=qar.createQuestionRegistry();registry.registerExecutor(question.kind,question.version,['audio-playback','focus','keyboard','screen-reader']);return registry;}

async function listeningHarness(){
  const fixture=listeningFixture();let ownerAggregate=fixture.aggregate,sourceAggregate=fixture.aggregate;
  const owner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async id=>id===fixture.item.id?fixture.item:null,getTranscriptAggregate:async id=>id===fixture.aggregate.revision.id?ownerAggregate:null});
  const sourceAdapter=createTranscriptSourceAdapter({getTranscriptAggregate:async id=>id===fixture.aggregate.revision.id?sourceAggregate:null});
  const question=await qar.adaptListeningMultipleChoiceItem(fixture.item,fixture.reference,{ownerAdapter:owner});
  return{...fixture,owner,question,sourceRegistry:createSourceRevisionRegistry({adapters:[sourceAdapter]}),registry:listeningRegistry(question),setOwner:value=>{ownerAggregate=value;},setSource:value=>{sourceAggregate=value;}};
}

function rowId(activity){return`today-run:${activity.id}`;}

async function assertNoTodayRow(activity,operation,code){
  await assert.rejects(operation,error=>error.code===code);
  assert.equal((await getV10Record(V10_STORES.todayRuns,rowId(activity)))==null,true);
}

function collectObjectKeys(value,keys=new Set()){
  if(!value||typeof value!=='object')return keys;
  for(const [key,child] of Object.entries(value)){keys.add(key);collectObjectKeys(child,keys);}
  return keys;
}

test('QAR Listening adapter seals transcript-backed answer truth and rejects forged anchors',async()=>{
  const {aggregate,item,reference}=listeningFixture();const owner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async id=>id===item.id?item:null,getTranscriptAggregate:async id=>id===aggregate.revision.id?aggregate:null});
  const question=await qar.adaptListeningMultipleChoiceItem(item,reference,{ownerAdapter:owner});
  assert.equal(question.kind,qar.LISTENING_MULTIPLE_CHOICE_KIND);assert.equal(question.requiredCapabilities.includes('audio-playback'),true);assert.equal('correct' in question.item.options[0],false);assert.equal('rationale' in question.item.options[0],false);assert.equal(qar.scoreQuestionActivity(question,{optionId:'a'}).disposition,'correct');
  await assert.rejects(qar.adaptListeningMultipleChoiceItem({...item,sourceAnchor:{...item.sourceAnchor,endMs:1999}},reference,{ownerAdapter:owner}),error=>error.code==='QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED');
});

test('QAR Listening feedback freshness is immutable and child active revision is stale',async()=>{
  const {aggregate,item,reference}=listeningFixture();let current=aggregate;const owner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>item,getTranscriptAggregate:async()=>current});const question=await qar.adaptListeningMultipleChoiceItem(item,reference,{ownerAdapter:owner});
  const harness=await listeningHarness();const activity=listeningActivity(harness.question,'qar-listening-freshness');const executed=await qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:90_100});const feedback=executed.feedback;
  assert.equal((await qar.assessListeningFeedbackFreshness(feedback,{ownerAdapter:owner})).stale,false);current={...aggregate,source:{...aggregate.source,activeRevisionId:'child-revision'}};const stale=await qar.assessListeningFeedbackFreshness(feedback,{ownerAdapter:owner});assert.equal(stale.stale,true);assert.equal(stale.staleReason,'SOURCE_ACTIVE_REVISION_CHANGED');assert.throws(()=>{stale.sourceAnchor.startMs=3;},TypeError);
});

test('QAR Listening public schema and registry reject malformed anchors, coercion, and accessor owner data',async()=>{
  const {aggregate,item,reference}=listeningFixture();const owner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>item,getTranscriptAggregate:async()=>aggregate});const question=await qar.adaptListeningMultipleChoiceItem(item,reference,{ownerAdapter:owner});
  assert.equal(qar.validateQuestionActivity({...question,item:{...question.item,sourceAnchor:{...question.item.sourceAnchor,segmentIds:[null]}}}).valid,false);
  const registry=qar.createQuestionRegistry();assert.throws(()=>registry.registerExecutor(qar.LISTENING_MULTIPLE_CHOICE_KIND,'1',['audio-playback','focus','keyboard','screen-reader']),error=>error.code==='QUESTION_ACTIVITY_UNSUPPORTED');
  let reads=0;const hostile={...item};Object.defineProperty(hostile,'prompt',{enumerable:true,get(){reads+=1;throw new Error('no getter');}});const hostileOwner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>hostile,getTranscriptAggregate:async()=>aggregate});await assert.rejects(qar.adaptListeningMultipleChoiceItem(item,reference,{ownerAdapter:hostileOwner}),error=>error.code==='QUESTION_ACTIVITY_OWNER_VERIFICATION_REQUIRED');assert.equal(reads,0);
});

test('QAR Listening rejects adapter option and capability accessors without invoking them',()=>{
  let optionReads=0;const options={};Object.defineProperty(options,'readVerifiedItem',{enumerable:true,get(){optionReads+=1;throw new Error('getter');}});Object.defineProperty(options,'getTranscriptAggregate',{enumerable:true,get(){optionReads+=1;throw new Error('getter');}});assert.throws(()=>qar.createListeningQuestionOwnerAdapter(options),error=>error.code==='QUESTION_ACTIVITY_OWNER_RESOLVER_REQUIRED');assert.equal(optionReads,0);
  let capabilityReads=0;const capabilities=['audio-playback','focus','keyboard','screen-reader'];Object.defineProperty(capabilities,0,{get(){capabilityReads+=1;return 'audio-playback';}});const registry=qar.createQuestionRegistry();assert.throws(()=>registry.registerExecutor(qar.LISTENING_MULTIPLE_CHOICE_KIND,1,capabilities),error=>error.code==='QUESTION_ACTIVITY_UNSUPPORTED');assert.equal(capabilityReads,0);
});

test('QAR Listening adaptation and freshness option accessors are rejected without invocation',async()=>{
  const fixture=listeningFixture();const owner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>fixture.item,getTranscriptAggregate:async()=>fixture.aggregate});let reads=0;const options={};Object.defineProperty(options,'ownerAdapter',{enumerable:true,get(){reads+=1;return owner;}});await assert.rejects(qar.adaptListeningMultipleChoiceItem(fixture.item,fixture.reference,options),error=>error.code==='QUESTION_ACTIVITY_ID_INVALID');assert.equal(reads,0);
  const harness=await listeningHarness(),activity=listeningActivity(harness.question,'qar-listening-option-accessor'),result=await qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:90_500});await assert.rejects(qar.assessListeningFeedbackFreshness(result.feedback,options),error=>error.code==='QUESTION_ACTIVITY_FEEDBACK_UNAVAILABLE');assert.equal(reads,0);
});

test('QAR Listening executes through LI and persists exact frozen selected-only feedback with default-deny evidence',async()=>{
  const harness=await listeningHarness();const activity=listeningActivity(harness.question,'qar-listening-li-success');
  const result=await qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:91_000});
  assert.equal(result.run.id,rowId(activity));assert.equal(result.run.status,'completed');assert.equal(result.run.envelope.attempt.runId,result.run.id);assert.equal(result.run.envelope.receipt.runId,result.run.id);
  assert.equal(result.run.frozenBinding.target.sourceId,harness.reference.sourceId);assert.equal(result.run.frozenBinding.target.sourceRevision,harness.reference.revisionId);
  assert.equal(result.run.frozenBinding.launch.promptRevision.value,harness.question.promptRevision);assert.equal(result.run.frozenBinding.launch.configRevision.value,harness.question.registryRevision);assert.equal(result.run.frozenBinding.launch.configDigest.value,harness.question.promptDigest);
  for(const field of ['keyRevision','keyDigest','rubricRevision','rubricDigest','scoringPolicyRevision','reviewPolicyRevision'])assert.equal(result.run.frozenBinding.evaluation[field].state,'bound');
  assert.deepEqual(result.feedback,result.run.envelope.attempt.metadata.feedback);assert.deepEqual(result.feedback,result.run.envelope.receipt.metadata.feedback);assert.equal(Object.isFrozen(result.feedback),true);assert.equal(Object.isFrozen(result.feedback.sourceAnchor),true);assert.equal(Object.isFrozen(result.feedback.sourceAnchor.segmentIds),true);
  assert.equal(result.feedback.rationale,'SELECTED_RATIONALE_SENTINEL');const serialized=JSON.stringify(result.run);assert.equal(serialized.includes('UNSELECTED_RATIONALE_SENTINEL'),false);assert.equal(result.decision.eligible,false);assert.equal(result.score.affectsSchedule,false);
});

test('QAR Listening exact duplicate is byte-idempotent and alternate response cannot replace the terminal winner',async()=>{
  const harness=await listeningHarness();const activity=listeningActivity(harness.question,'qar-listening-idempotent');
  const first=await qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:92_000});const winner=JSON.stringify(first.run.envelope);
  const duplicate=await qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:92_900});assert.equal(JSON.stringify(duplicate.feedback),JSON.stringify(first.feedback));assert.equal(JSON.stringify(duplicate.run.envelope),winner);assert.equal(duplicate.run.receiptId,first.run.receiptId);
  const changedAssistance={kind:'AssistanceTrace',schemaVersion:1,id:`trace:${activity.id}`,collector:qar.LISTENING_ASSISTANCE_COLLECTION_MODE,complete:true,revealed:true,hintUsed:false,transcriptViewed:false,correctionExposed:false,retryAfterExposure:false,coaching:false,answerExposed:false,events:[{sequence:1,type:'reveal',at:92_950,metadata:{}}]};await assert.rejects(qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,assistance:changedAssistance,now:92_950}),error=>error.code==='QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT');
  await assert.rejects(qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'b'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:93_000}),error=>['QUESTION_ACTIVITY_TERMINAL_RESPONSE_CONFLICT','TODAY_RUN_TERMINAL_CONFLICT'].includes(error.code));const current=await getV10Record(V10_STORES.todayRuns,rowId(activity));assert.equal(JSON.stringify(current.envelope),winner);assert.equal(current.receiptId,first.run.receiptId);
});

test('QAR Listening pre-run fences produce zero writes for target, frozen binding, collector, and runtime source authority changes',async()=>{
  const harness=await listeningHarness();
  const targetActivity=listeningActivity(harness.question,'qar-listening-bad-target',{target:{...harness.question.item.target,cardId:'wrong-card',sourceId:harness.reference.sourceId,sourceRevision:harness.reference.revisionId}});await assertNoTodayRow(targetActivity,()=>qar.executeQuestionActivity({activity:targetActivity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:94_000}),'QUESTION_ACTIVITY_TARGET_BINDING_MISMATCH');
  const frozenActivity=listeningActivity(harness.question,'qar-listening-bad-frozen');frozenActivity.evaluationBinding={...frozenActivity.evaluationBinding,keyDigest:'wrong'};await assertNoTodayRow(frozenActivity,()=>qar.executeQuestionActivity({activity:frozenActivity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:94_100}),'QUESTION_ACTIVITY_FROZEN_BINDING_MISMATCH');
  const collectorActivity=listeningActivity(harness.question,'qar-listening-bad-collector',{collector:'ielts-lab'});await assertNoTodayRow(collectorActivity,()=>qar.executeQuestionActivity({activity:collectorActivity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:94_200}),'QUESTION_ACTIVITY_ASSISTANCE_MODE_INVALID');
  const sourceCases=[
    ['unknown',{...harness.aggregate,revision:{...harness.aggregate.revision,status:'edited',provenance:{...harness.aggregate.revision.provenance,verification:'unknown'}}}],
    ['blocked',{...harness.aggregate,revision:{...harness.aggregate.revision,provenance:{...harness.aggregate.revision.provenance,rights:'blocked'}}}],
    ['unverified',{...harness.aggregate,revision:{...harness.aggregate.revision,status:'unverified',provenance:{...harness.aggregate.revision.provenance,verification:'unverified'}}}]
  ];
  for(const [name,state] of sourceCases){harness.setSource(state);const activity=listeningActivity(harness.question,`qar-listening-source-${name}`);await assertNoTodayRow(activity,()=>qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:95_000}),'QUESTION_ACTIVITY_SOURCE_UNAVAILABLE');}
});

test('QAR Listening post-adaptation owner mutations fail closed before Run',async()=>{
  const harness=await listeningHarness();const cases=[
    ['missing',null],
    ['tombstone',{...harness.aggregate,revision:{...harness.aggregate.revision,tombstone:{kind:'deleted'}}}],
    ['integrity',{...harness.aggregate,revision:{...harness.aggregate.revision,contentDigest:'changed-integrity'}}],
    ['segment-membership',{...harness.aggregate,revision:{...harness.aggregate.revision,segmentIds:[...harness.aggregate.revision.segmentIds].reverse()}}],
    ['segment-identity',{...harness.aggregate,segments:[{...harness.aggregate.segments[0],sourceId:'wrong-source'},harness.aggregate.segments[1]]}],
    ['alignment',{...harness.aggregate,segments:[{...harness.aggregate.segments[0],aligned:false},harness.aggregate.segments[1]]}]
  ];
  for(const [name,state] of cases){harness.setOwner(state);const activity=listeningActivity(harness.question,`qar-listening-owner-${name}`);await assertNoTodayRow(activity,()=>qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:96_000}),'QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH');}
});

test('QAR Listening enforces exact aggregate provenance, segment order, contiguous coverage, and accepts a safe long aggregate',async()=>{
  const fixture=listeningFixture();const invalid=[
    {...fixture.aggregate,revision:{...fixture.aggregate.revision,provenance:{...fixture.aggregate.revision.provenance,aligned:false}}},
    {...fixture.aggregate,revision:{...fixture.aggregate.revision,sourceId:'wrong-source'}},
    {...fixture.aggregate,segments:[fixture.aggregate.segments[1],fixture.aggregate.segments[0]]},
    {...fixture.aggregate,segments:[fixture.aggregate.segments[0],{...fixture.aggregate.segments[1],startMs:1100}],revision:{...fixture.aggregate.revision,coverage:{...fixture.aggregate.revision.coverage,coveredMs:1900}}},
    {...fixture.aggregate,revision:{...fixture.aggregate.revision,coverage:{...fixture.aggregate.revision.coverage,startMs:1}}}
  ];
  for(const aggregate of invalid){const owner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>fixture.item,getTranscriptAggregate:async()=>aggregate});await assert.rejects(qar.adaptListeningMultipleChoiceItem(fixture.item,fixture.reference,{ownerAdapter:owner}),error=>error.code==='QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH');}
  const forgedProvenance={...fixture.reference,provenance:{...fixture.reference.provenance,rights:'unknown'}};const provenanceOwner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>fixture.item,getTranscriptAggregate:async()=>fixture.aggregate});await assert.rejects(qar.adaptListeningMultipleChoiceItem(fixture.item,forgedProvenance,{ownerAdapter:provenanceOwner}),error=>error.code==='QUESTION_ACTIVITY_SOURCE_BINDING_MISMATCH');
  const count=120,segments=Array.from({length:count},(_,index)=>({startMs:index*10,endMs:(index+1)*10,text:`safe-${index}`,status:'verified',aligned:true})),provenance={origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'};const aggregate=createTranscriptAggregate({source:{id:'listening-long-source',status:'verified',complete:true},segments,provenance,createdAt:2});const adapter=createTranscriptSourceAdapter({getTranscriptAggregate:async()=>aggregate}),reference=adapter.createRef(aggregate),item={...fixture.item,id:'listening-long-item',sourceAnchor:{sourceId:aggregate.source.id,revisionId:aggregate.revision.id,integrity:aggregate.revision.contentDigest,segmentIds:aggregate.revision.segmentIds,startMs:0,endMs:count*10}};const owner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>item,getTranscriptAggregate:async()=>aggregate});const question=await qar.adaptListeningMultipleChoiceItem(item,reference,{ownerAdapter:owner});assert.equal(question.item.sourceAnchor.segmentIds.length,count);
});

test('QAR Listening feedback rejects malformed bindings and accessors before owner read, while missing and child revisions are typed immutable freshness',async()=>{
  const harness=await listeningHarness();const activity=listeningActivity(harness.question,'qar-listening-feedback-validation');const result=await qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:97_000});let reads=0,current=harness.aggregate;const owner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>harness.item,getTranscriptAggregate:async()=>{reads+=1;return current;}});
  const mutations=[
    value=>{value.questionId='qar:other';},value=>{value.attemptId='qar-attempt:other';},value=>{value.receiptId='qar-receipt:other';},value=>{value.scorer.id='other-scorer';},value=>{value.sourceAnchor.startMs=1;},value=>{value.disposition='wrong';},value=>{value.rationale='forged rationale';},value=>{value.selectedOptionId='b';}
  ];
  for(const mutate of mutations){const malformed=structuredClone(result.feedback);mutate(malformed);await assert.rejects(qar.assessListeningFeedbackFreshness(malformed,{ownerAdapter:owner}),error=>error.code==='QUESTION_ACTIVITY_FEEDBACK_INVALID');assert.equal(reads,0);}
  let getterReads=0;const hostile={...result.feedback};Object.defineProperty(hostile,'sourceAnchor',{enumerable:true,get(){getterReads+=1;throw new Error('getter');}});await assert.rejects(qar.assessListeningFeedbackFreshness(hostile,{ownerAdapter:owner}),error=>error.code==='QUESTION_ACTIVITY_FEEDBACK_INVALID');assert.equal(getterReads,0);assert.equal(reads,0);
  let aggregateGetterReads=0;const hostileAggregate={};Object.defineProperty(hostileAggregate,'source',{enumerable:true,get(){aggregateGetterReads+=1;throw new Error('getter');}});current=hostileAggregate;const unsafeOwner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>harness.item,getTranscriptAggregate:async()=>current});const unsafe=await qar.assessListeningFeedbackFreshness(result.feedback,{ownerAdapter:unsafeOwner});assert.equal(unsafe.stale,true);assert.equal(unsafe.staleReason,'SOURCE_REVISION_UNAVAILABLE');assert.equal(aggregateGetterReads,0);
  current=null;const unavailable=await qar.assessListeningFeedbackFreshness(result.feedback,{ownerAdapter:owner});assert.equal(unavailable.stale,true);assert.equal(unavailable.staleReason,'SOURCE_REVISION_UNAVAILABLE');assert.equal(Object.isFrozen(unavailable),true);
  current={...harness.aggregate,source:{...harness.aggregate.source,activeRevisionId:'child-revision'}};const child=await qar.assessListeningFeedbackFreshness(result.feedback,{ownerAdapter:owner});assert.equal(child.stale,true);assert.equal(child.staleReason,'SOURCE_ACTIVE_REVISION_CHANGED');assert.equal(Object.isFrozen(child.sourceAnchor),true);
});

test('QAR Listening durable terminal feedback survives combined backup restore and excludes answer/source secrets',async()=>{
  const harness=await listeningHarness();const activity=listeningActivity(harness.question,'qar-listening-backup');const result=await qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:98_000});const backup=await buildCombinedBackup();const backupRow=backup.domains.v10.stores.todayRuns.find(row=>row.id===result.run.id);assert.ok(backupRow);assert.deepEqual(backupRow.envelope.attempt.metadata.feedback,result.feedback);assert.deepEqual(backupRow.envelope.receipt.metadata.feedback,result.feedback);
  const restored=await restoreCombinedBackup(backup);assert.equal(restored.durable,true);await reopenV10Database();const reopened=await getV10Record(V10_STORES.todayRuns,result.run.id);assert.deepEqual(reopened.envelope.attempt.metadata.feedback,result.feedback);assert.deepEqual(reopened.envelope.receipt.metadata.feedback,result.feedback);
  const terminalKeys=collectObjectKeys(reopened);for(const key of ['correct','correctOptionId','answerKey','rawKey','transcriptBody','url','token','credential','privatePath'])assert.equal(terminalKeys.has(key),false,key);const serialized=JSON.stringify(reopened);for(const sentinel of ['UNSELECTED_RATIONALE_SENTINEL','TRANSCRIPT_BODY_SENTINEL','PRIVATE_TOKEN_SENTINEL','C:\\Users\\private'])assert.equal(serialized.includes(sentinel),false,sentinel);
});

test('QAR Listening active child makes historical feedback stale without mutating persisted terminal binding',async()=>{
  const harness=await listeningHarness();const activity=listeningActivity(harness.question,'qar-listening-child-stale');const result=await qar.executeQuestionActivity({activity,question:harness.question,response:{optionId:'a'},sourceRegistry:harness.sourceRegistry,questionRegistry:harness.registry,now:99_000});const before=JSON.stringify(await getV10Record(V10_STORES.todayRuns,result.run.id));const child={...harness.aggregate,source:{...harness.aggregate.source,activeRevisionId:'child-revision'}};const owner=qar.createListeningQuestionOwnerAdapter({readVerifiedItem:async()=>harness.item,getTranscriptAggregate:async()=>child});const freshness=await qar.assessListeningFeedbackFreshness(result.feedback,{ownerAdapter:owner});assert.equal(freshness.stale,true);assert.equal(freshness.staleReason,'SOURCE_ACTIVE_REVISION_CHANGED');assert.equal(JSON.stringify(await getV10Record(V10_STORES.todayRuns,result.run.id)),before);
  const report=qar.getQuestionCoverageReport();const listening=report.kinds.find(row=>row.kind===qar.LISTENING_MULTIPLE_CHOICE_KIND);assert.equal(listening.coverage,'PARTIAL');assert.equal(listening.dimensions.uiInventory,'GAP');assert.match(listening.limitations,/not full Listening, readiness, or UI coverage/);
});

test('QAR adapts and scores multi-select MCQ with deterministic partial credit and answer key privacy',async()=>{
  const listeningMultiItem={
    id:'listening-multi-1',
    kind:'listening-multiple-choice-multiple',
    skill:'listening',
    prompt:'Choose TWO letters, A-E.',
    expectedCount:2,
    options:[
      {id:'opt-a',text:'Option A'},
      {id:'opt-b',text:'Option B'},
      {id:'opt-c',text:'Option C'},
      {id:'opt-d',text:'Option D'},
      {id:'opt-e',text:'Option E'}
    ],
    correctOptionIds:['opt-a','opt-c'],
    rationales:{'opt-a':'Rationale A','opt-c':'Rationale C'},
    target:{cardId:'qar-card',senseId:'qar-sense',skill:'listening'},
    sourceAnchor:{
      sourceId:'transcript:listening-multi',
      revisionId:'rev-1',
      integrity:'sha256:anchor',
      segmentIds:['seg-1'],
      startMs:1000,
      endMs:5000
    },
    createdAt:100,
    updatedAt:200
  };

  const aggregate=createTranscriptAggregate({
    source:{id:'transcript:listening-multi',status:'verified',complete:true},
    segments:[{startMs:1000,endMs:5000,text:'Listening segment text',status:'verified',aligned:true}],
    provenance:{origin:'fixture',verification:'verified',rights:'allowed',privacy:'private'},
    createdAt:100
  });
  const transcriptAdapter=createTranscriptSourceAdapter({getTranscriptAggregate:async()=>aggregate});
  const sourceRef=transcriptAdapter.createRef(aggregate);

  const listeningOwner=qar.createListeningQuestionOwnerAdapter({
    readVerifiedItem:async id=>id===listeningMultiItem.id?listeningMultiItem:null,
    getTranscriptAggregate:async()=>aggregate
  });

  const question=await qar.adaptListeningMultipleChoiceItem(listeningMultiItem,sourceRef,{ownerAdapter:listeningOwner});
  assert.equal(question.kind,'listening-multiple-choice-multiple');
  assert.equal(question.registryRevision,qar.LISTENING_MULTI_SELECT_REGISTRY_REVISION);
  assert.equal(question.scorer.id,qar.OBJECTIVE_MULTI_SELECT_SCORER_VERSION);
  assert.equal(JSON.stringify(question).includes('correctOptionIds'),false);
  assert.equal(JSON.stringify(question).includes('rationales'),false);
  assert.equal(JSON.stringify(question).includes('opt-a'),true);

  // Full correct: K = 2 / N = 2
  const fullScore=qar.scoreQuestionActivity(question,{optionIds:['opt-a','opt-c']});
  assert.equal(fullScore.valid,true);
  assert.equal(fullScore.disposition,'correct');
  assert.equal(fullScore.rawScore,1);
  assert.equal(fullScore.numerator,2);
  assert.equal(fullScore.denominator,2);

  // Partial correct: K = 1 / N = 2
  const partialScore=qar.scoreQuestionActivity(question,{optionIds:['opt-a','opt-b']});
  assert.equal(partialScore.valid,true);
  assert.equal(partialScore.disposition,'partial');
  assert.equal(partialScore.rawScore,0.5);
  assert.equal(partialScore.numerator,1);
  assert.equal(partialScore.denominator,2);

  // Full wrong: K = 0 / N = 2
  const wrongScore=qar.scoreQuestionActivity(question,{optionIds:['opt-b','opt-d']});
  assert.equal(wrongScore.valid,true);
  assert.equal(wrongScore.disposition,'wrong');
  assert.equal(wrongScore.rawScore,0);
  assert.equal(wrongScore.numerator,0);
  assert.equal(wrongScore.denominator,2);

  // Invalid option counts or unknown options
  assert.equal(qar.scoreQuestionActivity(question,{optionIds:['opt-a']}).valid,false);
  assert.equal(qar.scoreQuestionActivity(question,{optionIds:['opt-a','opt-b','opt-c']}).valid,false);
  assert.equal(qar.scoreQuestionActivity(question,{optionIds:['opt-a','opt-unknown']}).valid,false);

  // Reading Multi-Select MCQ
  const readingMultiItem={
    id:'reading-multi-1',
    kind:'reading-multiple-choice-multiple',
    prompt:'Choose TWO options from the passage.',
    expectedCount:2,
    options:[
      {id:'opt-a',text:'Option A'},
      {id:'opt-b',text:'Option B'},
      {id:'opt-c',text:'Option C'},
      {id:'opt-d',text:'Option D'}
    ],
    correctOptionIds:['opt-a','opt-c'],
    rationales:{'opt-a':'Rationale A','opt-c':'Rationale C'},
    target:{cardId:'qar-card',senseId:'qar-sense',skill:'reading'}
  };

  const readingSourceRef=createSourceRevisionRef({
    schema:'SourceRevisionRef',
    version:1,
    kind:'ielts-reading-passage',
    authority:'ielts-reading-source',
    sourceId:'source:reading-multi',
    revisionId:'rev-1',
    integrity:'sha256:reading',
    locator:{passageId:'source:reading-multi',revision:'rev-1'},
    provenance:{origin:'test',verification:'verified',rights:'allowed',privacy:'private'},
    tombstone:null,
    extensions:{},
    display:null
  });

  const readingSourceRecord={
    id:'source:reading-multi',
    revision:'rev-1',
    status:'verified',
    profile:'academic',
    sourceRevisionRef:readingSourceRef
  };

  const readingPublicItem={
    id:readingMultiItem.id,
    kind:'reading-multiple-choice-multiple',
    prompt:readingMultiItem.prompt,
    expectedCount:2,
    options:readingMultiItem.options,
    target:readingMultiItem.target
  };

  const readingPromptDigest=learningContractDigest({prompt:readingMultiItem.prompt,options:readingMultiItem.options,expectedCount:2});
  const readingKeyDigest=learningContractDigest({correctOptionIds:['opt-a','opt-c']});
  const readingRubricDigest=learningContractDigest({rationales:readingMultiItem.rationales});

  const readingOwner=qar.createReadingQuestionOwnerAdapter({
    readVerifiedInventory:async id=>id===readingMultiItem.id?{
      id:readingMultiItem.id,
      kind:'ielts-objective-inventory-item',
      schemaVersion:1,
      itemId:readingMultiItem.id,
      itemRevision:'2000',
      skill:'reading',
      profiles:['academic'],
      form:'academic',
      section:1,
      order:1,
      sourceRevisionRef:readingSourceRef,
      questionBinding:{
        kind:'reading-multiple-choice-multiple',
        schemaVersion:1,
        registryRevision:qar.READING_MULTI_SELECT_REGISTRY_REVISION,
        questionId:readingMultiItem.id,
        promptRevision:'reading-multi:2000',
        promptDigest:readingPromptDigest,
        keyRevision:'reading-multi-key:2000',
        keyDigest:readingKeyDigest,
        rubricRevision:'reading-multi-rubric:2000',
        rubricDigest:readingRubricDigest,
        scorer:{id:qar.OBJECTIVE_MULTI_SELECT_SCORER_VERSION,version:1},
        reviewPolicyRevision:'objective-reading-review-v1',
        requiredCapabilities:['keyboard','focus','screen-reader']
      },
      questionPayload:readingPublicItem,
      contentDigest:'sha256:dummy',
      status:'verified',
      rights:{origin:'test',verification:'verified',rights:'allowed',privacy:'private'},
      provenance:{origin:'test',verification:'verified',rights:'allowed',privacy:'private'},
      humanReview:{status:'approved'},
      createdAt:100,
      verifiedAt:200,
      retiredAt:null,
      retirementReason:null,
      extensions:{}
    }:null,
    readVerifiedSource:async()=>readingSourceRecord
  });

  const readingQuestion=await qar.adaptIeltsReadingObjectiveItem(
    {
      id:readingMultiItem.id,
      skill:'reading',
      status:'verified',
      profiles:['academic'],
      sourceRevisionRef:readingSourceRef,
      questionBinding:{
        kind:'reading-multiple-choice-multiple',
        schemaVersion:1,
        registryRevision:qar.READING_MULTI_SELECT_REGISTRY_REVISION,
        questionId:readingMultiItem.id,
        promptRevision:'reading-multi:2000',
        promptDigest:readingPromptDigest,
        keyRevision:'reading-multi-key:2000',
        keyDigest:readingKeyDigest,
        rubricRevision:'reading-multi-rubric:2000',
        rubricDigest:readingRubricDigest,
        scorer:{id:qar.OBJECTIVE_MULTI_SELECT_SCORER_VERSION,version:1},
        reviewPolicyRevision:'objective-reading-review-v1',
        requiredCapabilities:['keyboard','focus','screen-reader']
      },
      questionPayload:readingPublicItem
    },
    readingSourceRef,
    {ownerAdapter:readingOwner}
  );

  assert.equal(readingQuestion.kind,'reading-multiple-choice-multiple');
  assert.equal(JSON.stringify(readingQuestion).includes('correct'),false);
  assert.equal(JSON.stringify(readingQuestion).includes('rationale'),false);

  const readingFullScore=qar.scoreQuestionActivity(readingQuestion,{optionIds:['opt-a','opt-c']});
  assert.equal(readingFullScore.valid,true);
  assert.equal(readingFullScore.disposition,'correct');
  assert.equal(readingFullScore.rawScore,1);
  assert.equal(readingFullScore.numerator,2);
  assert.equal(readingFullScore.denominator,2);

  const readingPartialScore=qar.scoreQuestionActivity(readingQuestion,{optionIds:['opt-a','opt-b']});
  assert.equal(readingPartialScore.valid,true);
  assert.equal(readingPartialScore.disposition,'partial');
  assert.equal(readingPartialScore.rawScore,0.5);
  assert.equal(readingPartialScore.numerator,1);
  assert.equal(readingPartialScore.denominator,2);

  const readingWrongScore=qar.scoreQuestionActivity(readingQuestion,{optionIds:['opt-b','opt-d']});
  assert.equal(readingWrongScore.valid,true);
  assert.equal(readingWrongScore.disposition,'wrong');
  assert.equal(readingWrongScore.rawScore,0);
  assert.equal(readingWrongScore.numerator,0);
  assert.equal(readingWrongScore.denominator,2);

  assert.equal(qar.scoreQuestionActivity(readingQuestion,{optionIds:['opt-a']}).valid,false);
  assert.equal(qar.scoreQuestionActivity(readingQuestion,{optionIds:['opt-a','opt-b','opt-c']}).valid,false);
  assert.equal(qar.scoreQuestionActivity(readingQuestion,{optionIds:['opt-a','opt-unknown']}).valid,false);
});

test('QAR Coverage Report includes all 26 official task families / 27 item kinds',()=>{
  const report=qar.getQuestionCoverageReport();
  assert.ok(report);
  assert.ok(Array.isArray(report.kinds));
  assert.equal(report.kinds.length>=27,true);

  const officialListeningKinds=[
    'listening-multiple-choice',
    'listening-multiple-choice-multiple',
    'listening-matching',
    'listening-plan-map-diagram-labelling',
    'listening-form-completion',
    'listening-note-completion',
    'listening-table-completion',
    'listening-flow-chart-completion',
    'listening-summary-completion',
    'listening-sentence-completion',
    'listening-short-answer'
  ];

  const officialReadingKinds=[
    'reading-multiple-choice-single',
    'reading-multiple-choice-multiple',
    'reading-true-false-not-given',
    'reading-yes-no-not-given',
    'reading-matching-information',
    'reading-matching-headings',
    'reading-matching-features',
    'reading-matching-sentence-endings',
    'reading-sentence-completion',
    'reading-summary-completion',
    'reading-summary-completion-box',
    'reading-note-completion',
    'reading-table-completion',
    'reading-flow-chart-completion',
    'reading-diagram-label-completion',
    'reading-short-answer'
  ];

  for(const kind of officialListeningKinds){
    assert.ok(report.kinds.some(k=>k.kind===kind),`Missing official Listening kind: ${kind}`);
  }
  for(const kind of officialReadingKinds){
    assert.ok(report.kinds.some(k=>k.kind===kind),`Missing official Reading kind: ${kind}`);
  }
});

